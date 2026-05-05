// helper.js — minimal browser-side WebSocket transport.
// Exposes window.companion = { pushEvent, onMessage, isConnected }.
// Queue-on-disconnect, reconnect with backoff. No framework, no build step.

(function () {
  var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/';
  var ws = null;
  var queue = [];
  var listeners = [];
  var reconnectMs = 500;
  var reconnectTimer = null;
  var connected = false;

  function setStatus(text, ok) {
    var el = document.getElementById('connection-status');
    if (!el) return;
    el.textContent = text;
    el.dataset.ok = ok ? '1' : '0';
  }

  function connect() {
    try { ws = new WebSocket(url); }
    catch (e) { scheduleReconnect(); return; }

    ws.onopen = function () {
      connected = true;
      reconnectMs = 500;
      setStatus('Connected', true);
      while (queue.length) ws.send(queue.shift());
    };
    ws.onmessage = function (ev) {
      var msg;
      try { msg = JSON.parse(ev.data); } catch (_) { return; }
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i](msg); } catch (_) {}
      }
    };
    ws.onclose = function () {
      connected = false;
      ws = null;
      setStatus('Reconnecting…', false);
      scheduleReconnect();
    };
    ws.onerror = function () {
      try { ws && ws.close(); } catch (_) {}
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null;
      reconnectMs = Math.min(reconnectMs * 1.5, 5000);
      connect();
    }, reconnectMs);
  }

  function send(obj) {
    var str = JSON.stringify(obj);
    if (ws && ws.readyState === 1) ws.send(str);
    else queue.push(str);
  }

  window.companion = {
    pushEvent: function (type, payload) {
      var p = Object.assign({ type: type }, payload || {});
      send({ type: 'event', payload: p });
    },
    onMessage: function (fn) { listeners.push(fn); },
    isConnected: function () { return connected; },
  };

  setStatus('Connecting…', false);
  connect();
})();
