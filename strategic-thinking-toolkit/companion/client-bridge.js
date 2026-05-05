// client-bridge.js — higher-level state and event helpers on top of helper.js.
// Exposes companion.state, companion.subscribeState, companion.advancePhase, etc.
// Exercise canvases use this layer; they never talk to WebSocket directly.

(function () {
  var state = null;
  var stateListeners = [];
  var annotationListeners = [];

  window.companion.onMessage(function (msg) {
    if (!msg) return;
    if (msg.type === 'sync' && msg.state) {
      var prev = state;
      state = msg.state;
      for (var i = 0; i < stateListeners.length; i++) {
        try { stateListeners[i](state, prev); } catch (_) {}
      }
      // Surface annotations that weren't there before.
      var prevIds = {};
      if (prev && prev.annotations) for (var j = 0; j < prev.annotations.length; j++) prevIds[prev.annotations[j].id] = 1;
      var anns = state.annotations || [];
      for (var k = 0; k < anns.length; k++) {
        if (!prevIds[anns[k].id]) {
          for (var l = 0; l < annotationListeners.length; l++) {
            try { annotationListeners[l](anns[k]); } catch (_) {}
          }
        }
      }
    }
  });

  window.companion.getState = function () { return state; };

  window.companion.subscribeState = function (fn) {
    stateListeners.push(fn);
    if (state) { try { fn(state, null); } catch (_) {} }
    return function () {
      var i = stateListeners.indexOf(fn);
      if (i >= 0) stateListeners.splice(i, 1);
    };
  };

  window.companion.onAnnotation = function (fn) {
    annotationListeners.push(fn);
  };

  window.companion.advancePhase = function (to) {
    window.companion.pushEvent('phase.advance', { to: to });
  };

  window.companion.newId = function (prefix) {
    return (prefix || 'x') + Math.random().toString(36).slice(2, 9);
  };
})();
