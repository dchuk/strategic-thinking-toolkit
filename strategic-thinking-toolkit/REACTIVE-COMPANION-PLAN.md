# Reactive Companion — Plan and Progress

The visual companion ships state to disk and a browser canvas to the user.
The original question that drove this plan was: **how does Claude Code, sitting next to the browser in a side-by-side screen-share, react in near-real-time as the user interacts with the canvas?**

Claude Code is fundamentally turn-based — the model only runs when a user
message arrives. Closing that gap so the agent feels reactive without
requiring the user to ping it on every action is the core problem.

## Research summary

Two parallel research agents confirmed the available mechanisms:

| Mechanism | Latency | Event-driven | Status |
|---|---|---|---|
| **`Monitor` tool** + `tail -f events.ndjson` | 1–3 s | yes (push) | shipped (v2.1.98+) |
| **Agent SDK streaming-input mode** | sub-second | yes | shipped — replaces TUI |
| **MCP "Channels" / push notifications** | <100 ms | yes | spec'd, client support thin (issue [anthropics/claude-code#36665](https://github.com/anthropics/claude-code/issues/36665)) |
| `/loop` polling | 1–60 min | no | shipped |
| Hooks | sync | no (Claude lifecycle only) | shipped |

The pragmatic answer is **Monitor + `tail -f` for v0**, **Agent SDK streaming for the polished v1**, and **TTS hook for screen-share punch**. MCP push notifications are a 2026 watch-item, not a foundation.

Full agent reports are in the conversation transcript that produced this
plan.

---

## Phase 0 — Validate `Monitor` end-to-end · DONE

Goal: prove that the `Monitor` tool against the companion's existing
`events.ndjson` actually wakes Claude on canvas events without requiring
plumbing changes.

- [x] Fire `Monitor` with `tail -n 0 -F` on the live session's
      `events.ndjson` (`persistent: true`, 1-hour timeout)
- [x] Confirm canvas drags and phase advances arrive as notifications in
      Claude Code with low latency (sub-2-second observed)
- [x] Confirm 200 ms stdout batching naturally collapses drag bursts —
      no need for an explicit debouncer in v0
- [x] Confirm Monitor survives a server restart (same `events.ndjson`
      path; new server appends to the existing file)

Phase 0 was successful. The Monitor pattern is the right v0.

---

## Phase 1 — Bake the reactive loop into the plugin · NOT STARTED

Goal: make "live mode" a first-class capability of the visual companion
that any future exercise inherits for free, not a one-off Bash incantation
the facilitator types each session.

### Plumbing (server / launcher)

- [ ] **`start-server.sh --resume <session-dir>`** flag so an existing
      session can be re-attached after a crash without bypassing the
      launcher (we had to bypass it twice during the Phase 0 session)
- [ ] **Heartbeat instead of 30-min WebSocket-idle cleanup** — canvas
      pings `GET /heartbeat` every 30 s while the tab is open; server
      resets idle timer on any HTTP hit. The current behavior killed our
      server twice because long Claude responses look like inactivity.
- [ ] **`start-server.sh` returns a Monitor recipe** in its launch JSON,
      e.g. `"monitor": "tail -n 0 -F <events-path>"`, so the skill
      doesn't need to know storage paths
- [ ] **Server-side coalescing** in `server.cjs` — debounce within-drag
      `kpc.update` events to one per ~250 ms per id. Benefits browser
      and Claude alike. Current pipe-batching works but a server-level
      fix is cleaner.

### Per-exercise opt-in

- [ ] **`companion/exercises/<name>/companion.json`** declaring whether
      the exercise opts into live mode, what filter to apply, max KPCs,
      valid phases. The seam another exercise plugs into.
- [ ] **`companion/exercises/<name>/event-filter.sh`** — optional
      stdin→stdout filter per exercise. If absent, pass through. Where
      Mutation Game (when added) can suppress hover events Happy Line
      doesn't have.

### Skill-side

- [ ] **`visual-companion.md` "Live mode" section** — when the
      companion launches, fire Monitor against the events file using
      the recipe from the launcher's JSON. From then on, react to
      notifications instead of being pinged.
- [ ] **Per-exercise skill files** (`run-happy-line.md` etc.) updated
      to point at the new live-mode subsection rather than the older
      "read canvas.json each turn" instructions.

### Acceptance

Phase 1 is done when a fresh exercise session in any supported exercise
auto-launches Monitor without the facilitator typing a Bash command, and
the loop survives a 60-minute idle period (heartbeat kept it alive).

---

## Phase 2 — Standalone Agent SDK TUI · NOT STARTED

Goal: when sub-second reactivity matters more than reusing Claude Code's
chrome (e.g. for a polished demo or a customer-facing presenter mode),
build a custom terminal/desktop UI on the Agent SDK's streaming-input
mode. Companion server pipes events into `query()`'s `AsyncIterable`.

- [ ] Decide host: Node SDK vs Python SDK
- [ ] Wire `AsyncIterable` from `events.ndjson` (or directly from the
      companion server's WebSocket) into `query()`
- [ ] Render Claude's streaming output deltas in a custom UI (likely
      ink for Node or textual for Python)
- [ ] Reproduce the annotation channel — Claude posts back to the
      canvas via the companion's existing `POST /annotate`
- [ ] Decide where this lives: separate binary in `companion/`, or a
      sibling repo

This phase is optional. Phase 1 may be sufficient for the value the
companion delivers; Phase 2 is the "make-it-magical-on-stage" tier.

---

## Phase 3 — TTS layer for screen-share demos · NOT STARTED

Goal: during a presentation, the agent should *speak* its observations as
they happen. The reactive loop already wakes Claude; TTS makes the wake-up
audible without the audience having to read the right pane.

- [ ] Stop-hook that pipes Claude's last response to a TTS provider
- [ ] Pick a provider: local (Kokoro via `ktaletsk/claude-code-tts`) for
      offline demos, or OpenAI/ElevenLabs for hosted
- [ ] Voice tuning — restraint matters; the agent shouldn't read every
      drag aloud. Filter to phase changes and shortlist starring.

References surfaced by research:
- `ktaletsk/claude-code-tts` (Kokoro local)
- `ybouhjira/claude-code-tts` (OpenAI)
- `husniadil/cc-hooks`, `paulpreibisch/AgentVibes`

---

## Side work completed during Phase 0 · DONE

The Phase 0 dogfood session surfaced a long tail of canvas issues and one
fundamental UX disconnect (Phase 4 lost the Lazy-L). Fixing these took the
bulk of the session and shipped under commit `b107e05`.

### Canvas bug fixes

- [x] Lazy-L curve replaced with a Catmull-Rom spline (was a quadratic
      Bezier through midpoints that visited only the endpoints)
- [x] `moveBubble` updates all `<circle>` children, not just the first
      (the hit target was moving while the visible bubble lagged)
- [x] Plot bubble-placement zone padded so importance=0 / satisfaction=0
      pins don't clip the axis labels
- [x] Long KPC labels stopped overflowing left/right (resolved by the
      Phase 3 redesign moving labels under the X axis)

### Phase 3 redesign

- [x] Flip to canonical Pelard layout: importance horizontal (high=left),
      satisfaction vertical (high=top)
- [x] Drop the floating description cards entirely
- [x] KPC names render under the X axis at each rank column with a thin
      dashed guide line from pin to label
- [x] Drag is vertical-only — each KPC has a fixed importance column
- [x] Replace the pill-key above the plot with in-zone uppercase mono
      labels (Front · strategic priority, Top · defend / over-served,
      Back · back-burner)
- [x] Pin renders as ink-navy filled circle with white mono letter on
      top of the curve — reads as a data-point marker

### Phase 4 redesign

- [x] Persistent read-only mini Lazy-L at the top of phase 4
- [x] KPC chips show a zone color dot (front / top / back / core)
- [x] Live "Files into Box X" target indicator that updates as chips
      toggle, themed to match the four quadrants
- [x] Ghost-pulse rings on mini-plot pins for currently tagged KPCs
- [x] Ideas render as sticky-note cards (rotation, paper shadow,
      Fraunces serif text, mono letter tag chips)
- [x] Quadrants restructured with editorial titles and a gradient on
      the 4+ box

### Editorial pass

- [x] Typography: Fraunces variable serif headlines + Bricolage
      Grotesque body + JetBrains Mono axis labels and metadata
- [x] Palette: cream parchment background, ink-navy strokes, warm sand
      / sage / muted clay zones, terracotta accent
- [x] Header chrome restyled with editorial title and uppercase mono
      context line
- [x] Buttons, inputs, lists, status bar, annotations all rebased on
      the new CSS variable system

---

## Open questions

- Should live mode be the default for new exercises, or opt-in via
  `companion.json`? Argument for default: every spatial exercise
  benefits. Argument for opt-in: not all exercises are spatial enough
  to warrant the Monitor cost.
- For Phase 1 environment detection — Claude Code v2.1.98+ is required
  for Monitor. Do we feature-detect at session start and fall back to
  `/loop` polling, or document "live mode requires recent Claude Code"
  and fail loudly? Leaning toward the latter; polling is a worse UX
  than just being told to upgrade.
- For Phase 2 — Node or Python SDK? Probably Node given the companion
  server is already Node, but Python's textual library is significantly
  more capable than ink for terminal UIs.

---

## Pointer files

- `companion/server.cjs` — state store + event log + annotation API
- `companion/start-server.sh` — launcher that nohup's the server
- `companion/exercises/<name>/canvas.html|css|js` — per-exercise UI
- `companion/exercises/<name>/synthesis-template.md` — Claude fills
  this from `canvas.json` at session end
- `skills/strategic-thinking-toolkit/references/topics/visual-companion.md` —
  the playbook Claude reads when the companion launches
