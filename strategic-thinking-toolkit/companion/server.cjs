#!/usr/bin/env node
/*
 * Strategic Thinking Toolkit — visual companion server.
 *
 * Single-process Node 18+ stdlib server that:
 *   - serves the wrapped exercise canvas over HTTP
 *   - accepts user-action events over WebSocket
 *   - persists canonical state to canvas.json + appends events.ndjson
 *   - accepts annotation pushes from Claude over HTTP and broadcasts them
 *   - self-terminates on parent-PID death or idle timeout
 *
 * Spawned by companion/start-server.sh. Configuration via env vars:
 *   COMPANION_DIR         session dir; state/ subdir is created underneath
 *   COMPANION_EXERCISE    exercise name (matches companion/exercises/<name>/)
 *   COMPANION_CONTEXT     free-form context string from the user
 *   COMPANION_OWNER_PID   parent process to watch for death (0 = disabled)
 *   COMPANION_PLUGIN_ROOT absolute path to plugin root (parent of companion/)
 *   COMPANION_PORT        TCP port; 0 picks a random free port
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = requireEnv('COMPANION_DIR');
const EXERCISE = requireEnv('COMPANION_EXERCISE');
const PLUGIN_ROOT = requireEnv('COMPANION_PLUGIN_ROOT');
const CONTEXT = process.env.COMPANION_CONTEXT || '';
const OWNER_PID = parseInt(process.env.COMPANION_OWNER_PID || '0', 10);
const PORT = parseInt(process.env.COMPANION_PORT || '0', 10);

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const PARENT_CHECK_MS = 5 * 1000;

const stateDir = path.join(DIR, 'state');
const canvasPath = path.join(stateDir, 'canvas.json');
const eventsPath = path.join(stateDir, 'events.ndjson');
const serverInfoPath = path.join(stateDir, 'server-info.json');

const companionDir = path.join(PLUGIN_ROOT, 'companion');
const exerciseDir = path.join(companionDir, 'exercises', EXERCISE);

const STATIC_ROUTES = {
  '/helper.js':         { file: path.join(companionDir, 'helper.js'),         type: 'application/javascript' },
  '/client-bridge.js':  { file: path.join(companionDir, 'client-bridge.js'),  type: 'application/javascript' },
  '/canvas.css':        { file: path.join(exerciseDir, 'canvas.css'),         type: 'text/css' },
  '/canvas.js':         { file: path.join(exerciseDir, 'canvas.js'),          type: 'application/javascript' },
};

fs.mkdirSync(stateDir, { recursive: true });
if (!fs.existsSync(canvasPath)) {
  writeCanvas(initialCanvas());
}

const clients = new Set();
let lastActivity = Date.now();

const server = http.createServer((req, res) => {
  lastActivity = Date.now();
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

  if (req.method === 'GET' && url.pathname === '/') return serveIndex(res);
  if (req.method === 'GET' && url.pathname === '/state') return serveJson(res, readCanvas());
  if (req.method === 'GET' && STATIC_ROUTES[url.pathname]) {
    const r = STATIC_ROUTES[url.pathname];
    return fs.readFile(r.file, (err, body) => {
      if (err) return send(res, 404, 'text/plain', 'not found');
      send(res, 200, r.type, body);
    });
  }
  if (req.method === 'POST' && url.pathname === '/annotate') return handleAnnotate(req, res);
  if (req.method === 'POST' && url.pathname === '/phase') return handlePhase(req, res);

  send(res, 404, 'text/plain', 'not found');
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }
  const accept = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  socket.on('error', () => clients.delete(socket));
  socket.on('close', () => clients.delete(socket));
  socket.on('data', buf => readFrames(socket, buf));
  clients.add(socket);
  sendFrame(socket, JSON.stringify({ type: 'sync', state: readCanvas() }));
});

server.listen(PORT, '127.0.0.1', () => {
  const addr = server.address();
  const info = {
    type: 'server-started',
    exercise: EXERCISE,
    context: CONTEXT,
    port: addr.port,
    url: `http://127.0.0.1:${addr.port}/`,
    pid: process.pid,
    parentPid: OWNER_PID || null,
    paths: { dir: DIR, state: stateDir, canvas: canvasPath, events: eventsPath },
  };
  fs.writeFileSync(serverInfoPath, JSON.stringify(info, null, 2));
  process.stdout.write(JSON.stringify(info) + '\n');
});

setInterval(() => {
  if (!OWNER_PID) return;
  try { process.kill(OWNER_PID, 0); }
  catch { exit('parent process gone'); }
}, PARENT_CHECK_MS).unref();

setInterval(() => {
  if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) exit('idle timeout');
}, 60 * 1000).unref();

process.on('SIGTERM', () => exit('SIGTERM'));
process.on('SIGINT',  () => exit('SIGINT'));

// ---------- routing helpers ----------

function serveIndex(res) {
  let frame, canvas;
  try {
    frame  = fs.readFileSync(path.join(companionDir, 'frame-template.html'), 'utf8');
    canvas = fs.readFileSync(path.join(exerciseDir, 'canvas.html'), 'utf8');
  } catch (err) {
    return send(res, 500, 'text/plain', 'failed to load canvas: ' + err.message);
  }
  const body = frame
    .replace('<!--CANVAS-->', canvas)
    .replace('<!--EXERCISE-->', escapeHtml(EXERCISE))
    .replace('<!--CONTEXT-->', escapeHtml(CONTEXT));
  send(res, 200, 'text/html; charset=utf-8', body);
}

function handleAnnotate(req, res) {
  readJsonBody(req, (err, body) => {
    if (err) return send(res, 400, 'application/json', JSON.stringify({ error: err.message }));
    const ann = {
      id: 'a' + Date.now().toString(36),
      from: 'claude',
      target: body.target || null,
      text: String(body.text || '').slice(0, 2000),
      ts: Date.now(),
    };
    const c = readCanvas();
    c.annotations.push(ann);
    c.lastEventTs = ann.ts;
    writeCanvas(c);
    appendEvent({ type: 'annotation.add', ...ann });
    broadcast({ type: 'sync', state: c });
    send(res, 200, 'application/json', JSON.stringify({ ok: true, id: ann.id }));
  });
}

function handlePhase(req, res) {
  readJsonBody(req, (err, body) => {
    if (err) return send(res, 400, 'application/json', JSON.stringify({ error: err.message }));
    if (!body.to) return send(res, 400, 'application/json', JSON.stringify({ error: 'missing to' }));
    applyEvent({ type: 'phase.advance', to: body.to, ts: Date.now() });
    send(res, 200, 'application/json', JSON.stringify({ ok: true }));
  });
}

// ---------- websocket frame i/o ----------

function readFrames(socket, buf) {
  // Buffers may carry a partial frame across calls; stash leftovers.
  const carry = socket._companionCarry || Buffer.alloc(0);
  let data = Buffer.concat([carry, buf]);
  while (true) {
    const parsed = parseFrame(data);
    if (!parsed) break;
    if (parsed.opcode === 0x8) { socket.end(); return; }
    if (parsed.opcode === 0x9) { sendPong(socket, parsed.payload); }
    else if (parsed.opcode === 0x1) {
      try { onClientMessage(JSON.parse(parsed.payload.toString('utf8'))); }
      catch { /* malformed frame, drop */ }
    }
    data = data.slice(parsed.length);
  }
  socket._companionCarry = data;
}

function parseFrame(buf) {
  if (buf.length < 2) return null;
  const b1 = buf[0], b2 = buf[1];
  const opcode = b1 & 0x0f;
  const masked = (b2 & 0x80) === 0x80;
  let plen = b2 & 0x7f;
  let p = 2;
  if (plen === 126) {
    if (buf.length < p + 2) return null;
    plen = buf.readUInt16BE(p); p += 2;
  } else if (plen === 127) {
    if (buf.length < p + 8) return null;
    plen = Number(buf.readBigUInt64BE(p)); p += 8;
  }
  let mask;
  if (masked) {
    if (buf.length < p + 4) return null;
    mask = buf.slice(p, p + 4); p += 4;
  }
  if (buf.length < p + plen) return null;
  const payload = Buffer.from(buf.slice(p, p + plen));
  if (masked) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  return { opcode, payload, length: p + plen };
}

function sendFrame(socket, str) {
  const data = Buffer.from(str, 'utf8');
  let header;
  if (data.length < 126) {
    header = Buffer.from([0x81, data.length]);
  } else if (data.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81; header[1] = 126;
    header.writeUInt16BE(data.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81; header[1] = 127;
    header.writeBigUInt64BE(BigInt(data.length), 2);
  }
  try { socket.write(Buffer.concat([header, data])); }
  catch { clients.delete(socket); }
}

function sendPong(socket, payload) {
  const header = Buffer.from([0x8a, payload.length]);
  try { socket.write(Buffer.concat([header, payload])); } catch {}
}

function broadcast(msg) {
  const str = JSON.stringify(msg);
  for (const c of clients) sendFrame(c, str);
}

function onClientMessage(msg) {
  lastActivity = Date.now();
  if (msg && msg.type === 'event' && msg.payload) {
    applyEvent({ ...msg.payload, ts: Date.now() });
  }
}

// ---------- canvas state ----------

function applyEvent(evt) {
  const c = readCanvas();
  c.lastEventTs = evt.ts;

  switch (evt.type) {
    case 'kpc.add': {
      if (!evt.id || !evt.label) break;
      if (c.kpcs.find(k => k.id === evt.id)) break;
      c.kpcs.push({
        id: evt.id,
        label: String(evt.label).slice(0, 120),
        importance: 0.5,
        satisfaction: 0.5,
        letter: nextLetter(c.kpcs),
      });
      break;
    }
    case 'kpc.remove': {
      c.kpcs = c.kpcs.filter(k => k.id !== evt.id);
      break;
    }
    case 'kpc.relabel': {
      const k = c.kpcs.find(k => k.id === evt.id);
      if (k && evt.label) k.label = String(evt.label).slice(0, 120);
      break;
    }
    case 'kpc.update': {
      const k = c.kpcs.find(k => k.id === evt.id);
      if (!k) break;
      if (typeof evt.satisfaction === 'number') k.satisfaction = clamp01(evt.satisfaction);
      if (typeof evt.importance === 'number')   k.importance   = clamp01(evt.importance);
      break;
    }
    case 'kpc.reorder': {
      const map = new Map(c.kpcs.map(k => [k.id, k]));
      const reordered = (evt.order || []).map(id => map.get(id)).filter(Boolean);
      // Importance is rank-derived: top of list = most important (1.0), bottom = 0.0.
      const n = reordered.length;
      reordered.forEach((k, i) => { k.importance = n > 1 ? 1 - (i / (n - 1)) : 0.5; });
      c.kpcs = reordered;
      break;
    }
    case 'idea.add': {
      if (!evt.id || !evt.text) break;
      if (c.ideas.find(i => i.id === evt.id)) break;
      const linked = Array.isArray(evt.linkedKpcs) ? evt.linkedKpcs.slice(0, 8) : [];
      // Drop ids that don't match a current KPC.
      const valid = new Set(c.kpcs.map(k => k.id));
      c.ideas.push({
        id: evt.id,
        text: String(evt.text).slice(0, 240),
        linkedKpcs: linked.filter(id => valid.has(id)),
        starred: false,
      });
      break;
    }
    case 'idea.remove': {
      c.ideas = c.ideas.filter(i => i.id !== evt.id);
      break;
    }
    case 'idea.update': {
      const idea = c.ideas.find(i => i.id === evt.id);
      if (!idea) break;
      if (evt.text != null) idea.text = String(evt.text).slice(0, 240);
      if (Array.isArray(evt.linkedKpcs)) {
        const valid = new Set(c.kpcs.map(k => k.id));
        idea.linkedKpcs = evt.linkedKpcs.slice(0, 8).filter(id => valid.has(id));
      }
      if (typeof evt.starred === 'boolean') {
        // Cap stars at 3 — silently ignore the toggle if it would exceed.
        if (evt.starred && c.ideas.filter(i => i.starred && i.id !== idea.id).length >= 3) {
          break;
        }
        idea.starred = evt.starred;
      }
      break;
    }
    case 'phase.advance': {
      if (evt.to) c.phase = evt.to;
      break;
    }
  }

  writeCanvas(c);
  appendEvent(evt);
  broadcast({ type: 'sync', state: c });
}

function initialCanvas() {
  return {
    exercise: EXERCISE,
    context: CONTEXT,
    phase: 'kpc-entry',
    kpcs: [],
    ideas: [],
    annotations: [],
    lastEventTs: Date.now(),
  };
}

function readCanvas() { return JSON.parse(fs.readFileSync(canvasPath, 'utf8')); }
function writeCanvas(c) { fs.writeFileSync(canvasPath, JSON.stringify(c, null, 2)); }
function appendEvent(evt) { fs.appendFileSync(eventsPath, JSON.stringify(evt) + '\n'); }

// ---------- utilities ----------

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}
function serveJson(res, obj) { send(res, 200, 'application/json', JSON.stringify(obj)); }

function readJsonBody(req, cb) {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    try { cb(null, chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
    catch (e) { cb(e); }
  });
  req.on('error', cb);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function clamp01(n) { return Math.max(0, Math.min(1, n)); }
function nextLetter(kpcs) {
  // First unused letter A–Z (handles add → remove → add without collisions).
  const used = new Set(kpcs.map(k => k.letter));
  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(65 + i);
    if (!used.has(ch)) return ch;
  }
  return '?';
}
function requireEnv(k) {
  const v = process.env[k];
  if (!v) { console.error(`missing env ${k}`); process.exit(2); }
  return v;
}

function exit(reason) {
  try { console.error('[companion] exit:', reason); } catch {}
  try { server.close(); } catch {}
  process.exit(0);
}
