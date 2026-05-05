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
    advanceIdeate:     $('advance-ideate'),
    backToRate:        $('back-to-rate'),
    ideaForm:          $('idea-form'),
    ideaText:          $('idea-text'),
    ideaKpcChips:      $('idea-kpc-chips'),
    ideaTagCount:      $('idea-tag-count'),
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
  var PLOT = { x0: 60, y0: 20, x1: 760, y1: 460 };
  function satToX(s)   { return PLOT.x0 + clamp01(s) * (PLOT.x1 - PLOT.x0); }
  function impToY(imp) { return PLOT.y0 + (1 - clamp01(imp)) * (PLOT.y1 - PLOT.y0); }
  function xToSat(x)   { return clamp01((x - PLOT.x0) / (PLOT.x1 - PLOT.x0)); }
  function clamp01(n)  { return Math.max(0, Math.min(1, n)); }

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
      var sat = xToSat(pt.x);
      rateDrag.lastSat = sat;
      moveBubble(g, sat, kpc.importance);
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

  function moveBubble(g, sat, importance) {
    var cx = satToX(sat);
    var cy = impToY(importance);
    var c = g.querySelector('circle');
    if (c) { c.setAttribute('cx', cx); c.setAttribute('cy', cy); }
    var letter = g.querySelector('text.letter');
    if (letter) { letter.setAttribute('x', cx); letter.setAttribute('y', cy + 5); }
    var label = g.querySelector('text.label');
    if (label) { label.setAttribute('x', cx); label.setAttribute('y', cy + 36); }
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
    var pts = state.kpcs.map(function (k) {
      var s = (k.id === movingId) ? sat : k.satisfaction;
      return { x: satToX(s), y: impToY(k.importance) };
    });
    els.lazyL.setAttribute('d', curvePath(pts));
  }

  // Smoothed path: M to first, then quadratic-bezier through midpoints, T to last.
  function curvePath(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return 'M ' + pts[0].x + ' ' + pts[0].y;
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i], p1 = pts[i + 1];
      var mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
      d += ' Q ' + p0.x + ' ' + p0.y + ' ' + mx + ' ' + my;
    }
    var last = pts[pts.length - 1];
    d += ' T ' + last.x + ' ' + last.y;
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
    renderIdeaForm(state);
    renderQuadrants(state);
    renderShortlist(state);
    renderDone(state);
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
    state.kpcs.forEach(function (k) {
      var g = svgEl('g'); g.classList.add('bubble'); g.dataset.id = k.id;
      var cx = satToX(k.satisfaction), cy = impToY(k.importance);

      var hit = svgEl('circle');
      hit.setAttribute('cx', cx); hit.setAttribute('cy', cy); hit.setAttribute('r', 24);
      hit.setAttribute('fill', 'transparent'); hit.setAttribute('pointer-events', 'all');

      var c = svgEl('circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 18);

      var letter = svgEl('text');
      letter.setAttribute('x', cx); letter.setAttribute('y', cy + 5);
      letter.setAttribute('text-anchor', 'middle');
      letter.classList.add('letter');
      letter.textContent = k.letter;

      var label = svgEl('text');
      label.setAttribute('x', cx); label.setAttribute('y', cy + 36);
      label.setAttribute('text-anchor', 'middle');
      label.classList.add('label');
      label.textContent = k.label;

      g.append(hit, c, letter, label);
      attachBubbleDrag(g, k);
      els.bubbles.appendChild(g);
    });

    var pts = state.kpcs.map(function (k) {
      return { x: satToX(k.satisfaction), y: impToY(k.importance) };
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
      var letter = el('span', 'ck-letter', k.letter);
      var lab = document.createElement('span'); lab.textContent = k.label;
      chip.append(letter, lab);
      chip.addEventListener('click', function () { toggleIdeaTag(k.id); });
      els.ideaKpcChips.appendChild(chip);
    });

    var n = ideaTagBuffer.length;
    els.ideaTagCount.textContent = n === 0 ? 'Pick at least 1 KPC' :
      n + (n === 1 ? ' KPC selected → 1-Post-it' :
           n === 2 ? ' KPCs selected → 2-Post-its' :
           n === 3 ? ' KPCs selected → 3-Post-its' :
                     ' KPCs selected → 4+-Post-its');
    updateIdeaSubmitState();
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
    var letters = idea.linkedKpcs.map(function (id) {
      var k = state.kpcs.find(function (k) { return k.id === id; });
      return k ? k.letter : '?';
    }).sort().join(' ');
    var tags = el('span', 'tags', letters);
    var rm = document.createElement('button');
    rm.className = 'remove'; rm.type = 'button'; rm.title = 'Remove';
    rm.textContent = '×';
    rm.addEventListener('click', function () {
      window.companion.pushEvent('idea.remove', { id: idea.id });
    });
    li.append(text, tags, rm);
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
