# Visual companion (experimental)

A local browser-based companion for spatial strategy exercises. The companion
runs a Node server on a random localhost port, serves an interactive canvas,
and persists user actions to a state file that Claude reads each turn.

Pattern adapted from `obra/superpowers`'s brainstorming/visual-companion.

## Layout

```
companion/
├── server.cjs              Node 18+ stdlib HTTP + WebSocket server
├── start-server.sh         Bash launcher (resolves plugin root, picks port)
├── frame-template.html     Outer shell wrapping each exercise canvas
├── helper.js               Browser WebSocket transport (queue + reconnect)
├── client-bridge.js        Higher-level state/event helpers
└── exercises/<name>/       One subdir per exercise
    ├── canvas.html         Markup (gets injected into frame-template.html)
    ├── canvas.css          Scoped styles
    └── canvas.js           Phase machine + interactions
```

## Lifecycle

1. Caller runs `start-server.sh <exercise> [context]` from any working dir.
2. The launcher creates `./strategic-sessions/.companion/<session-id>/` and
   spawns `node server.cjs` in the background via `nohup`.
3. The server picks a free port, writes `state/server-info.json` and prints
   the same JSON to stdout, e.g.:
   ```json
   {"type":"server-started","port":53122,"url":"http://127.0.0.1:53122/", ...}
   ```
4. The user opens the URL in a browser. The server serves the wrapped
   exercise canvas; the browser opens a WebSocket back to the server.
5. User actions go up as `{type: "event", payload: {...}}` messages; the
   server applies them to `state/canvas.json` and appends to
   `state/events.ndjson`.
6. Claude reads `state/canvas.json` directly; pushes annotations to the user
   via `POST /annotate {"target":"k1","text":"..."}` which the server stores
   in canvas state and broadcasts to all connected browsers.
7. Server self-terminates if the parent process (Claude harness) dies, or
   after 30 minutes of WebSocket idle.

## Files the server reads/writes

| Path (under session dir) | Owner | Purpose |
|---|---|---|
| `state/canvas.json`      | server (write), Claude (read) | canonical canvas state |
| `state/events.ndjson`    | server (append)               | append-only event log |
| `state/server-info.json` | server (write once)           | port/url/pid metadata |
| `server.log`             | server (stderr/stdout)        | troubleshooting only |

## Adding a new exercise

1. Create `companion/exercises/<name>/{canvas.html,canvas.css,canvas.js}`.
2. The canvas may use `window.companion.{pushEvent,subscribeState,advancePhase,onAnnotation,newId}`.
3. Add new event types to the `applyEvent` switch in `server.cjs`.
4. Wire the slash command (or skill) to invoke `start-server.sh <name>`
   and parse the JSON line on stdout.

## Wire formats

**Browser → server (WebSocket text frame):**
```json
{ "type": "event", "payload": { "type": "kpc.add", "id": "k_x9", "label": "Onboarding speed" } }
```

**Server → browser (WebSocket text frame):**
```json
{ "type": "sync", "state": { /* full canvas.json */ } }
```

**Claude → server (HTTP):**
```
POST /annotate {"target":"k_x9","text":"This is in the Front Zone — strategic priority."}
POST /phase    {"to":"rate"}
```

## Caveats / out of scope

- Single localhost user. No auth, no TLS, no remote access.
- One canvas per session. To run multiple, launch the server twice.
- No persistence beyond the session directory; closing the server does
  *not* delete state, but starting a new session creates a new dir.
- The Lazy-L curve is computed in the browser (`canvas.js`), not the server.
