// Happy Line canvas, phases 1–5 + done.
//
// State lives on the server (canvas.json). We render whatever the server
// last broadcast and emit events when the user does anything that should
// commit. Local-only UI (input field text, drag-in-progress, idea-tag
// buffer) lives here.

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    phaseEntry:        $('phase-kpc-entry'),
    phaseRank:         $('phase-rank'),
    phaseRate:         $('phase-rate'),
    phaseIdeate:       $('phase-ideate'),
    phaseShortlist:    $('phase-shortlist'),
    phaseDone:         $('phase-done'),
    kpcForm:           $('kpc-form'),
    kpcText:           $('kpc-text'),
    kpcList:           $('kpc-list'),
    kpcCounter:        $('kpc-counter'),
    advanceRank:       $('advance-rank'),
    rankList:          $('rank-list'),
    backToEntry:       $('back-to-entry'),
    advanceRate:       $('advance-rate'),
    backToRank:        $('back-to-rank'),
    bubbles:           $('bubbles'),
    lazyL:             $('lazy-l'),
    plot:              $('plot'),
    guides:            $('guides'),
    kpcLabels:         $('kpc-labels'),
    advanceIdeate:     $('advance-ideate'),
    backToRate:        $('back-to-rate'),
    ideaForm:          $('idea-form'),
    ideaText:          $('idea-text'),
    ideaKpcChips:      $('idea-kpc-chips'),
    ideaTargetBox:     $('idea-target-box'),
    miniPlot:          $('mini-plot'),
    miniLazyL:         $('mini-lazy-l'),
    miniPins:          $('mini-pins'),
    miniLabels:        $('mini-labels'),
    miniGhosts:        $('mini-ghosts'),
    ideateCounter:     $('ideate-counter'),
    advanceShortlist:  $('advance-shortlist'),
    backToIdeate:      $('back-to-ideate'),
    shortlistList:     $('shortlist-list'),
    shortlistCounter:  $('shortlist-counter'),
    advanceDone:       $('advance-done'),
    backToShortlist:   $('back-to-shortlist'),
    doneSummary:       $('done-summary'),
  };

  var MIN_KPCS = 6, MAX_KPCS = 8;
  var MIN_IDEAS_TO_ADVANCE = 3;
  var MAX_STARS = 3;

  // Local-only buffer of selected KPC ids for the in-progress idea.
  var ideaTagBuffer = [];

  // Plot geometry — must match SVG viewBox / inner-rect in canvas.html.
  // Canonical Pelard layout: importance on X (left=high), satisfaction on Y
  // (top=high). Each KPC sits in a fixed column (its rank); the user drags
  // pins vertically to set satisfaction.
  var PLOT = { x0: 80, y0: 40, x1: 720, y1: 360 };
  var LABEL_BAND = { y0: 380, y1: 460 };
  var PIN_R = 11;
  // Vertical breathing room so the pin doesn't clip the plot top/bottom.
  var Y_PAD = PIN_R + 4;

  // X position is determined by rank index, not raw importance. Each KPC
  // gets the center of its column.
  function rankToX(i, total) {
    var slotW = (PLOT.x1 - PLOT.x0) / Math.max(1, total);
    return PLOT.x0 + (i + 0.5) * slotW;
  }
  function slotWidth(total) {
    return (PLOT.x1 - PLOT.x0) / Math.max(1, total);
  }
  // Y position from satisfaction (1.0 = top, 0.0 = bottom), with pin-radius padding.
  function satToY(s) {
    return PLOT.y0 + Y_PAD + (1 - clamp01(s)) * (PLOT.y1 - PLOT.y0 - 2 * Y_PAD);
  }
  function yToSat(y) {
    var lo = PLOT.y0 + Y_PAD, hi = PLOT.y1 - Y_PAD;
    return clamp01((hi - y) / (hi - lo));
  }
  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  // Mini-plot geometry — used by the read-only reference chart in phase 4.
  var MINI_PLOT = { x0: 80, y0: 20, x1: 720, y1: 220 };
  var MINI_PIN_R = 8;
  var MINI_Y_PAD = MINI_PIN_R + 3;
  function miniRankToX(i, total) {
    var slotW = (MINI_PLOT.x1 - MINI_PLOT.x0) / Math.max(1, total);
    return MINI_PLOT.x0 + (i + 0.5) * slotW;
  }
  function miniSatToY(s) {
    return MINI_PLOT.y0 + MINI_Y_PAD + (1 - clamp01(s)) * (MINI_PLOT.y1 - MINI_PLOT.y0 - 2 * MINI_Y_PAD);
  }

  // Classify a KPC into a strategy zone based on importance and satisfaction.
  // Used to color KPC chips in phase 4 by their strategic position.
  function zoneOf(k) {
    var hi = k.importance >= 0.5;
    var sat = k.satisfaction >= 0.5;
    if (hi && !sat) return 'front';   // high imp, low sat — strategic priority
    if (!hi && sat) return 'top';     // low imp, high sat — over-served, donor
    if (!hi && !sat) return 'back';   // low imp, low sat — back-burner
    return 'core';                    // high imp, high sat — defending
  }

  // ============================================================
  // phase 1 — KPC entry
  // ============================================================

  els.kpcForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = (els.kpcText.value || '').trim();
    if (!text) return;
    var state = window.companion.getState();
    if (state && state.kpcs.length >= MAX_KPCS) return;
    window.companion.pushEvent('kpc.add', {
      id: window.companion.newId('k_'),
      label: text,
    });
    els.kpcText.value = '';
    els.kpcText.focus();
  });

  els.advanceRank.addEventListener('click', function () {
    window.companion.advancePhase('rank');
  });

  // ============================================================
  // phase 2 — rank by importance (HTML5 drag-and-drop)
  // ============================================================

  els.backToEntry.addEventListener('click', function () { window.companion.advancePhase('kpc-entry'); });
  els.advanceRate .addEventListener('click', function () { window.companion.advancePhase('rate'); });

  var dragSrcId = null;

  function makeRankItem(k, rank) {
    var li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = k.id;
    var rk = el('span', 'rank',  rank + '.');
    var lt = el('span', 'letter', k.letter);
    var lb = el('span', 'label',  k.label);
    var hd = el('span', 'handle', '≡');
    li.append(rk, lt, lb, hd);

    li.addEventListener('dragstart', function (e) {
      dragSrcId = k.id;
      li.classList.add('dragging');
      try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', k.id); }
      catch (_) {}
    });
    li.addEventListener('dragend', function () {
      li.classList.remove('dragging');
      clearDropMarkers();
      dragSrcId = null;
    });
    li.addEventListener('dragover', function (e) {
      if (!dragSrcId || dragSrcId === k.id) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
      var rect = li.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      clearDropMarkers();
      li.classList.add(before ? 'drop-before' : 'drop-after');
    });
    li.addEventListener('dragleave', function () { li.classList.remove('drop-before', 'drop-after'); });
    li.addEventListener('drop', function (e) {
      e.preventDefault();
      if (!dragSrcId || dragSrcId === k.id) return;
      var rect = li.getBoundingClientRect();
      var before = (e.clientY - rect.top) < rect.height / 2;
      reorder(dragSrcId, k.id, before);
      clearDropMarkers();
    });
    return li;
  }

  function clearDropMarkers() {
    Array.prototype.forEach.call(
      els.rankList.querySelectorAll('.drop-before, .drop-after'),
      function (n) { n.classList.remove('drop-before', 'drop-after'); }
    );
  }

  function reorder(srcId, dstId, before) {
    var state = window.companion.getState();
    if (!state) return;
    var ids = state.kpcs.map(function (x) { return x.id; });
    var srcIdx = ids.indexOf(srcId);
    if (srcIdx < 0) return;
    ids.splice(srcIdx, 1);
    var dstIdx = ids.indexOf(dstId);
    if (dstIdx < 0) return;
    ids.splice(before ? dstIdx : dstIdx + 1, 0, srcId);
    window.companion.pushEvent('kpc.reorder', { order: ids });
  }

  // ============================================================
  // phase 3 — rate satisfaction (SVG pointer drag)
  // ============================================================

  els.backToRank.addEventListener('click', function () { window.companion.advancePhase('rank'); });

  var rateDrag = null; // { id, lastSat, pointerId, group }

  function attachBubbleDrag(g, kpc) {
    g.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      rateDrag = { id: kpc.id, lastSat: kpc.satisfaction, pointerId: e.pointerId, group: g };
      g.classList.add('dragging');
      try { g.setPointerCapture(e.pointerId); } catch (_) {}
    });
    g.addEventListener('pointermove', function (e) {
      if (!rateDrag || rateDrag.id !== kpc.id) return;
      var pt = svgPoint(e);
      var sat = yToSat(pt.y);
      rateDrag.lastSat = sat;
      movePin(g, sat);
      redrawCurveLocal(kpc.id, sat);
    });
    g.addEventListener('pointerup', function (e) {
      if (!rateDrag || rateDrag.id !== kpc.id) return;
      var sat = rateDrag.lastSat;
      g.classList.remove('dragging');
      try { g.releasePointerCapture(e.pointerId); } catch (_) {}
      rateDrag = null;
      window.companion.pushEvent('kpc.update', { id: kpc.id, satisfaction: sat });
    });
    g.addEventListener('pointercancel', function () {
      if (rateDrag && rateDrag.id === kpc.id) {
        rateDrag = null;
        g.classList.remove('dragging');
        renderRate(window.companion.getState());
      }
    });
  }

  // Move a single pin vertically (X is fixed by rank). Updates pin, letter,
  // hit area, and the dashed guide line below the pin.
  function movePin(g, sat) {
    var cx = parseFloat(g.dataset.cx);
    var cy = satToY(sat);
    g.querySelectorAll('.kpc-pin, .pin-hit').forEach(function (c) {
      c.setAttribute('cx', cx); c.setAttribute('cy', cy);
    });
    var pinLetter = g.querySelector('.kpc-pin-letter');
    if (pinLetter) {
      pinLetter.setAttribute('x', cx);
      pinLetter.setAttribute('y', cy);
    }
    var guide = els.guides.querySelector('[data-id="' + g.dataset.id + '"]');
    if (guide) {
      guide.setAttribute('x1', cx); guide.setAttribute('y1', cy + PIN_R);
      guide.setAttribute('x2', cx); guide.setAttribute('y2', LABEL_BAND.y0 - 4);
    }
  }

  function svgPoint(evt) {
    var rect = els.plot.getBoundingClientRect();
    var vb = els.plot.viewBox.baseVal;
    return {
      x: ((evt.clientX - rect.left) / rect.width)  * vb.width,
      y: ((evt.clientY - rect.top)  / rect.height) * vb.height,
    };
  }

  function redrawCurveLocal(movingId, sat) {
    var state = window.companion.getState();
    if (!state) return;
    var n = state.kpcs.length;
    var pts = state.kpcs.map(function (k, i) {
      var s = (k.id === movingId) ? sat : k.satisfaction;
      return { x: rankToX(i, n), y: satToY(s) };
    });
    els.lazyL.setAttribute('d', curvePath(pts));
  }

  // Catmull-Rom spline rendered as cubic Béziers — interpolates THROUGH every point.
  function curvePath(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return 'M ' + pts[0].x + ' ' + pts[0].y;
    if (pts.length === 2) return 'M ' + pts[0].x + ' ' + pts[0].y + ' L ' + pts[1].x + ' ' + pts[1].y;
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2.x + ' ' + p2.y;
    }
    return d;
  }

  // ============================================================
  // phase 4 — ideate (idea entry, KPC chip tagging, quadrant grouping)
  // ============================================================

  els.advanceIdeate    .addEventListener('click', function () { window.companion.advancePhase('ideate'); });
  els.backToRate       .addEventListener('click', function () { window.companion.advancePhase('rate'); });
  els.advanceShortlist .addEventListener('click', function () { window.companion.advancePhase('shortlist'); });

  els.ideaText.addEventListener('input', updateIdeaSubmitState);

  els.ideaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = (els.ideaText.value || '').trim();
    if (!text || ideaTagBuffer.length === 0) return;
    window.companion.pushEvent('idea.add', {
      id: window.companion.newId('i_'),
      text: text,
      linkedKpcs: ideaTagBuffer.slice(),
    });
    els.ideaText.value = '';
    ideaTagBuffer = [];
    renderIdeaForm(window.companion.getState());
    els.ideaText.focus();
  });

  function toggleIdeaTag(kpcId) {
    var idx = ideaTagBuffer.indexOf(kpcId);
    if (idx >= 0) ideaTagBuffer.splice(idx, 1);
    else if (ideaTagBuffer.length < 8) ideaTagBuffer.push(kpcId);
    renderIdeaForm(window.companion.getState());
  }

  function quadrantFor(idea) {
    return Math.min(Math.max(idea.linkedKpcs.length, 1), 4);
  }

  function updateIdeaSubmitState() {
    var btn = els.ideaForm.querySelector('button[type="submit"]');
    var text = (els.ideaText.value || '').trim();
    if (btn) btn.disabled = !(text && ideaTagBuffer.length > 0);
  }

  // ============================================================
  // phase 5 — shortlist (star toggles with ≤3 cap)
  // ============================================================

  els.backToIdeate    .addEventListener('click', function () { window.companion.advancePhase('ideate'); });
  els.advanceDone     .addEventListener('click', function () { window.companion.advancePhase('done'); });
  els.backToShortlist .addEventListener('click', function () { window.companion.advancePhase('shortlist'); });

  function toggleStar(idea, currentStarCount) {
    if (!idea.starred && currentStarCount >= MAX_STARS) return;
    window.companion.pushEvent('idea.update', {
      id: idea.id, starred: !idea.starred,
    });
  }

  // ============================================================
  // render
  // ============================================================

  function render(state) {
    if (!state) return;
    showPhase(state.phase);
    renderEntry(state);
    renderRank(state);
    renderRate(state);
    renderMiniPlot(state);
    renderIdeaForm(state);
    renderQuadrants(state);
    renderShortlist(state);
    renderDone(state);
  }

  // Read-only mini chart shown at the top of phase 4 — same Lazy-L as phase 3,
  // but compact, with no drag and with ghost-pulses indicating which pins
  // the in-progress idea would move.
  function renderMiniPlot(state) {
    if (!els.miniPlot) return;
    els.miniPins.innerHTML = '';
    els.miniGhosts.innerHTML = '';
    var n = state.kpcs.length;
    if (n === 0) return;

    state.kpcs.forEach(function (k, i) {
      var cx = miniRankToX(i, n);
      var cy = miniSatToY(k.satisfaction);

      var g = svgEl('g'); g.dataset.id = k.id;

      var pin = svgEl('circle');
      pin.classList.add('mini-pin');
      pin.dataset.id = k.id;
      pin.setAttribute('cx', cx); pin.setAttribute('cy', cy);
      pin.setAttribute('r', MINI_PIN_R);

      var letter = svgEl('text');
      letter.classList.add('mini-pin-letter');
      letter.setAttribute('x', cx); letter.setAttribute('y', cy);
      letter.setAttribute('text-anchor', 'middle');
      letter.setAttribute('dominant-baseline', 'central');
      letter.textContent = k.letter;

      g.append(pin, letter);
      els.miniPins.appendChild(g);
    });

    var pts = state.kpcs.map(function (k, i) {
      return { x: miniRankToX(i, n), y: miniSatToY(k.satisfaction) };
    });
    els.miniLazyL.setAttribute('d', curvePath(pts));

    refreshMiniGhosts(state);
  }

  // Add/remove ghost-pulse rings on mini-plot pins for currently tagged KPCs.
  function refreshMiniGhosts(state) {
    if (!els.miniGhosts) return;
    els.miniGhosts.innerHTML = '';
    if (!state) return;
    var n = state.kpcs.length;
    state.kpcs.forEach(function (k, i) {
      var pin = els.miniPins.querySelector('.mini-pin[data-id="' + k.id + '"]');
      if (!pin) return;
      var tagged = ideaTagBuffer.indexOf(k.id) >= 0;
      pin.classList.toggle('tagged', tagged);
      if (tagged) {
        var pulse = svgEl('circle');
        pulse.classList.add('mini-pulse');
        pulse.setAttribute('cx', miniRankToX(i, n));
        pulse.setAttribute('cy', miniSatToY(k.satisfaction));
        pulse.setAttribute('r', 8);
        els.miniGhosts.appendChild(pulse);
      }
    });
  }

  function showPhase(phase) {
    var phases = {
      'kpc-entry': els.phaseEntry,
      'rank':      els.phaseRank,
      'rate':      els.phaseRate,
      'ideate':    els.phaseIdeate,
      'shortlist': els.phaseShortlist,
      'done':      els.phaseDone,
    };
    Object.keys(phases).forEach(function (k) { phases[k].hidden = (k !== phase); });
  }

  function renderEntry(state) {
    var n = state.kpcs.length;
    var inRange = (n >= MIN_KPCS && n <= MAX_KPCS);
    els.kpcCounter.textContent = n + ' / ' + MIN_KPCS + '–' + MAX_KPCS + ' KPCs';
    els.kpcCounter.style.color = inRange ? '#065f46' : '';
    els.advanceRank.disabled = !inRange;
    var addBtn = els.kpcForm.querySelector('button[type="submit"]');
    if (addBtn) addBtn.disabled = (n >= MAX_KPCS);
    els.kpcText.disabled = (n >= MAX_KPCS);

    els.kpcList.innerHTML = '';
    state.kpcs.forEach(function (k) {
      var li = document.createElement('li');
      li.dataset.id = k.id;
      var lt = el('span', 'letter', k.letter);
      var lb = document.createElement('span'); lb.textContent = k.label;
      var rm = document.createElement('button');
      rm.className = 'remove'; rm.type = 'button'; rm.title = 'Remove';
      rm.textContent = '×';
      rm.addEventListener('click', function () {
        window.companion.pushEvent('kpc.remove', { id: k.id });
      });
      li.append(lt, lb, rm);
      els.kpcList.appendChild(li);
    });
  }

  function renderRank(state) {
    els.rankList.innerHTML = '';
    state.kpcs.forEach(function (k, i) {
      els.rankList.appendChild(makeRankItem(k, i + 1));
    });
  }

  function renderRate(state) {
    if (rateDrag) return;  // mid-drag — keep local feedback
    els.bubbles.innerHTML = '';
    els.guides.innerHTML = '';
    els.kpcLabels.innerHTML = '';
    var n = state.kpcs.length;
    var slotW = slotWidth(n);

    state.kpcs.forEach(function (k, i) {
      var cx = rankToX(i, n);
      var cy = satToY(k.satisfaction);

      // Vertical dashed guide from pin down to its name label
      var guide = svgEl('line');
      guide.classList.add('pin-guide');
      guide.dataset.id = k.id;
      guide.setAttribute('x1', cx); guide.setAttribute('y1', cy + PIN_R);
      guide.setAttribute('x2', cx); guide.setAttribute('y2', LABEL_BAND.y0 - 4);
      els.guides.appendChild(guide);

      // Pin group (hit area + visible pin + letter)
      var g = svgEl('g'); g.classList.add('kpc-card'); g.dataset.id = k.id;
      g.dataset.cx = cx;

      var hit = svgEl('circle');
      hit.classList.add('pin-hit');
      hit.setAttribute('cx', cx); hit.setAttribute('cy', cy);
      hit.setAttribute('r', PIN_R + 12);

      var pin = svgEl('circle');
      pin.classList.add('kpc-pin');
      pin.setAttribute('cx', cx); pin.setAttribute('cy', cy);
      pin.setAttribute('r', PIN_R);

      var pinLetter = svgEl('text');
      pinLetter.classList.add('kpc-pin-letter');
      pinLetter.setAttribute('x', cx); pinLetter.setAttribute('y', cy);
      pinLetter.setAttribute('text-anchor', 'middle');
      pinLetter.setAttribute('dominant-baseline', 'central');
      pinLetter.textContent = k.letter;

      g.append(hit, pin, pinLetter);
      attachBubbleDrag(g, k);
      els.bubbles.appendChild(g);

      // KPC name label below the X axis (foreignObject for HTML wrapping)
      var fo = svgEl('foreignObject');
      fo.setAttribute('x', cx - slotW / 2);
      fo.setAttribute('y', LABEL_BAND.y0);
      fo.setAttribute('width', slotW);
      fo.setAttribute('height', LABEL_BAND.y1 - LABEL_BAND.y0);
      fo.setAttribute('pointer-events', 'none');

      var nameDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      nameDiv.className = 'kpc-name';
      var ltSpan = document.createElementNS('http://www.w3.org/1999/xhtml', 'span');
      ltSpan.className = 'lt';
      ltSpan.textContent = k.letter;
      nameDiv.appendChild(ltSpan);
      nameDiv.appendChild(document.createTextNode(k.label));
      fo.appendChild(nameDiv);
      els.kpcLabels.appendChild(fo);
    });

    // Lazy-L curve through all pins, in rank order (left → right)
    var pts = state.kpcs.map(function (k, i) {
      return { x: rankToX(i, n), y: satToY(k.satisfaction) };
    });
    els.lazyL.setAttribute('d', curvePath(pts));
  }

  function renderIdeaForm(state) {
    if (!state) return;
    // Drop tag-buffer entries whose KPC was deleted.
    var validIds = new Set(state.kpcs.map(function (k) { return k.id; }));
    ideaTagBuffer = ideaTagBuffer.filter(function (id) { return validIds.has(id); });

    els.ideaKpcChips.innerHTML = '';
    state.kpcs.forEach(function (k) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'kpc-chip' + (ideaTagBuffer.indexOf(k.id) >= 0 ? ' selected' : '');
      chip.dataset.id = k.id;
      chip.dataset.zone = zoneOf(k);
      var zone = document.createElement('span'); zone.className = 'ck-zone';
      var letter = el('span', 'ck-letter', k.letter);
      var lab = document.createElement('span'); lab.textContent = k.label;
      chip.append(zone, letter, lab);
      chip.addEventListener('click', function () { toggleIdeaTag(k.id); });
      els.ideaKpcChips.appendChild(chip);
    });

    updateIdeaTargetBox(state);
    refreshMiniGhosts(state);
    updateIdeaSubmitState();
  }

  // Live indicator showing which Box the in-progress idea will file into.
  function updateIdeaTargetBox(state) {
    if (!els.ideaTargetBox) return;
    var n = ideaTagBuffer.length;
    var clampedN = Math.min(4, n);
    var box = els.ideaTargetBox;
    box.dataset.n = String(clampedN);
    var label = box.querySelector('.target-value');
    if (label) {
      if (n === 0) label.textContent = 'Tag a pin to start';
      else if (n === 1) label.textContent = 'Box 01 · single-pin move';
      else if (n === 2) label.textContent = 'Box 02 · trade-off';
      else if (n === 3) label.textContent = 'Box 03 · combination';
      else label.textContent = 'Box 04+ · transformative';
    }
  }

  function renderQuadrants(state) {
    var lists = els.phaseIdeate.querySelectorAll('.idea-list');
    var byN = { 1: [], 2: [], 3: [], 4: [] };
    (state.ideas || []).forEach(function (i) {
      byN[quadrantFor(i)].push(i);
    });
    Array.prototype.forEach.call(lists, function (ul) {
      var n = parseInt(ul.dataset.n, 10);
      ul.innerHTML = '';
      byN[n].forEach(function (idea) { ul.appendChild(makeIdeaListItem(idea, state)); });
    });
    var total = (state.ideas || []).length;
    els.ideateCounter.textContent = total + (total === 1 ? ' idea' : ' ideas');
    els.advanceShortlist.disabled = (total < MIN_IDEAS_TO_ADVANCE);
  }

  function makeIdeaListItem(idea, state) {
    var li = document.createElement('li');
    li.dataset.id = idea.id;

    var text = el('span', 'text', idea.text);

    var tags = document.createElement('span'); tags.className = 'tags';
    idea.linkedKpcs.slice().sort(function (a, b) {
      var ka = state.kpcs.find(function (k) { return k.id === a; });
      var kb = state.kpcs.find(function (k) { return k.id === b; });
      return (ka ? ka.letter : 'Z').localeCompare(kb ? kb.letter : 'Z');
    }).forEach(function (id) {
      var k = state.kpcs.find(function (k) { return k.id === id; });
      var t = document.createElement('span'); t.className = 'tag';
      t.textContent = k ? k.letter : '?';
      tags.appendChild(t);
    });

    var controls = document.createElement('div'); controls.className = 'controls';
    var rm = document.createElement('button');
    rm.className = 'remove'; rm.type = 'button'; rm.title = 'Remove';
    rm.textContent = '×';
    rm.addEventListener('click', function () {
      window.companion.pushEvent('idea.remove', { id: idea.id });
    });
    controls.appendChild(rm);

    li.append(text, tags, controls);
    return li;
  }

  function renderShortlist(state) {
    els.shortlistList.innerHTML = '';
    var ideas = (state.ideas || []).slice().sort(function (a, b) {
      return quadrantFor(b) - quadrantFor(a) || a.text.localeCompare(b.text);
    });
    var starCount = ideas.filter(function (i) { return i.starred; }).length;

    ideas.forEach(function (idea) {
      var li = document.createElement('li');
      if (idea.starred) li.classList.add('starred');

      var canStar = idea.starred || starCount < MAX_STARS;
      var star = document.createElement('button');
      star.type = 'button';
      star.className = 'star' + (idea.starred ? ' on' : '') + (canStar ? '' : ' disabled');
      star.textContent = idea.starred ? '★' : '☆';
      star.title = idea.starred ? 'Unstar' : (canStar ? 'Star (top-3)' : 'Limit of 3 stars reached');
      if (canStar) star.addEventListener('click', function () { toggleStar(idea, starCount); });

      var text = el('span', 'text', idea.text);
      var letters = idea.linkedKpcs.map(function (id) {
        var k = state.kpcs.find(function (k) { return k.id === id; });
        return k ? k.letter : '?';
      }).sort().join(' ');
      var meta = document.createElement('span'); meta.className = 'meta';
      var qLabel = ['', '1-Post-it', '2-Post-its', '3-Post-its', '4+'][quadrantFor(idea)];
      meta.append(el('span', 'tags', letters), document.createTextNode(' · ' + qLabel));

      li.append(star, text, meta);
      els.shortlistList.appendChild(li);
    });

    els.shortlistCounter.textContent = starCount + ' of ' + MAX_STARS + ' starred';
    els.advanceDone.disabled = (starCount < 1);
  }

  function renderDone(state) {
    if (!state || state.phase !== 'done') return;
    var summary = els.doneSummary;
    summary.innerHTML = '';

    // Stakeholder context
    if (state.context) {
      var ctxHead = el('h3', null, 'Stakeholder context');
      var ctxBody = document.createElement('p'); ctxBody.textContent = state.context;
      summary.append(ctxHead, ctxBody);
    }

    // KPC zones
    var zonesHead = el('h3', null, 'KPC zones');
    var zonesP = document.createElement('p');
    var byZone = { Front: [], Top: [], Back: [] };
    state.kpcs.forEach(function (k) {
      var zone = (k.importance > 0.5)
        ? (k.satisfaction < 0.5 ? 'Front' : 'Top')
        : 'Back';
      byZone[zone].push(k.letter);
    });
    zonesP.innerHTML =
      '<strong>Front (priority):</strong> ' + (byZone.Front.join(', ') || '—') + '<br>' +
      '<strong>Top (defend):</strong> '     + (byZone.Top.join(', ')   || '—') + '<br>' +
      '<strong>Back (back-burner):</strong> ' + (byZone.Back.join(', ') || '—');
    summary.append(zonesHead, zonesP);

    // Shortlist
    var shortHead = el('h3', null, 'Shortlist');
    summary.append(shortHead);
    var starred = state.ideas.filter(function (i) { return i.starred; });
    if (starred.length === 0) {
      var empty = document.createElement('p'); empty.textContent = 'No ideas starred.';
      summary.append(empty);
    } else {
      var ul = document.createElement('ul');
      starred.forEach(function (idea) {
        var li = document.createElement('li');
        var letters = idea.linkedKpcs.map(function (id) {
          var k = state.kpcs.find(function (k) { return k.id === id; });
          return k ? k.letter : '?';
        }).sort().join(' ');
        li.innerHTML = '<span class="star">★</span> ' +
          escapeHtml(idea.text) + ' <span class="muted">(' + letters + ')</span>';
        ul.appendChild(li);
      });
      summary.append(ul);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  window.companion.subscribeState(render);
})();
