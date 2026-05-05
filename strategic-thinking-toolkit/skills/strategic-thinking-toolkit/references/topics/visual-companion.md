# Visual companion — playbook

Some strategy exercises in this toolkit are spatial: a 2D plot, a portfolio
matrix, a mutation grid. Markdown Q&A loses the trade-off intuition those
shapes are meant to deliver. The visual companion is an opt-in local web
canvas that the user drives in their browser while you read state and
facilitate from chat.

This file tells you (Claude) how to use it. The mechanics live in
`<plugin>/companion/`; you don't need to understand the server internals.

## Which exercises support it

Today: **Happy Line** (full flow — KPC entry, ranking, satisfaction
rating, idea generation in four quadrants, shortlist starring, done state).
Other exercises remain markdown-only for now.

## When to offer

Offer the companion **once, at the very start** of an exercise that supports
it, before launching into facilitation. A clear yes/no question is fine:

> "This exercise has an interactive 2D plot you can drag KPCs around in.
> Want me to launch it as a local web app, or run it as text?"

Defer to the user. If they decline, run the markdown fallback in the
exercise command. If they accept, follow the launch protocol below.

Don't offer the companion mid-session — once a flow has started in either
mode, finish in that mode.

## Launch protocol

1. Run the launcher via Bash. Pass the exercise name and a short context
   string (the same one the user gave the slash command):

   ```bash
   "${CLAUDE_PLUGIN_ROOT}/companion/start-server.sh" happy-line "<context>"
   ```

   `${CLAUDE_PLUGIN_ROOT}` resolves to the plugin root. The script returns
   in a few hundred ms because the server is `nohup`'d in the background.

2. The launcher's stdout is a one-line JSON object. Parse it:

   ```json
   {"type":"server-started","port":53122,"url":"http://127.0.0.1:53122/","pid":...,
    "paths":{"dir":"...","state":"...","canvas":".../canvas.json","events":".../events.ndjson"}}
   ```

   Save `paths.canvas` (the path to `canvas.json`) and `url` for the rest of
   the session. You will read `paths.canvas` on every turn.

3. Tell the user the URL in plain text, e.g.:

   > Companion is up at **http://127.0.0.1:53122/** — open that in your
   > browser. I'll read your actions as you go.

4. If the launcher exits non-zero, print the error and ask the user whether
   to retry or fall back to the markdown flow. Do not invent a port.

## How to facilitate while the user works

The user drives the canvas. You read state and comment in chat. Don't try
to mutate `canvas.json` directly — the server owns it. Influence the canvas
in two ways: chat (where you can ask, suggest, explain) and annotations
(see below).

### Each turn

1. **Read the state file.** Use the Read tool on `paths.canvas`. It's a
   small JSON document that's safe to read on every turn.
2. **Notice what changed since last turn.** Compare `phase`, `kpcs.length`,
   each KPC's `satisfaction`, and the count of `annotations`. The
   `lastEventTs` field is a monotonic timestamp you can stash to detect "no
   activity since last turn" and avoid repeating yourself.
3. **Respond to what the user did, not the script.** If they added 3 KPCs,
   comment on those 3 — don't recite the role-rotation rules. If they're
   stuck (same state 2 turns in a row, low KPC count), prompt them.
4. **Optionally push an annotation** (next section).

### What to say at each phase

| `phase`     | Useful contributions |
|-------------|----------------------|
| `kpc-entry` | Suggest KPCs the user might be missing for their stakeholder context. Flag if the list is below 6 or above 8. Push back gently on feature-named KPCs ("Self-serve setup wizard" → "Onboarding speed"). |
| `rank`      | If the order looks wrong for the stated stakeholder, ask why before they advance. Watch for HiPPO Curse — gently suggest sanity-checking with another perspective. |
| `rate`      | Once 2+ bubbles are placed, comment on the emerging shape. Flag Premature Satisfaction (everything in Top Zone) or Cluster (everything at sat=0.5). Name the Front-Zone KPCs explicitly — these are the strategic priorities. |
| `ideate`    | Suggest seed ideas per quadrant on request. Flag ideas that don't move clockwise (Top Zone moves down → Front Zone moves up). Praise 4+-Post-it ideas — those are the most likely to win per Pelard. |
| `shortlist` | Help the user pick when stuck. Prefer ideas that touch multiple KPCs and ideas in the Front Zone. Don't override their choice — they own it. |
| `done`      | Run the synthesis (next section). |

Keep chat brief. The user is looking at the canvas, not your messages.
One observation per turn is plenty.

## Annotations (server → browser)

You can drop a callout directly onto the user's screen by POSTing to the
server. Use this sparingly — for things worth interrupting the visual flow
to flag (anti-pattern warnings, zone callouts, "this KPC is missing from
your list"). Don't use it for general commentary; that goes in chat.

```bash
curl -s -X POST -H 'content-type: application/json' \
  -d '{"target":"<kpc-id-or-null>","text":"<≤200 chars>"}' \
  "<url-from-server-info>annotate"
```

`target` is optional — pass a KPC id (e.g. `k_4ld2zh`, copied from
`canvas.json`) if the annotation refers to a specific bubble, or `null` for
a general callout. The user sees a toast in the bottom-right of the canvas.

## Detecting "done"

The explicit done signal is `phase === "done"` in `canvas.json`. The user
sets it by clicking "Finish session" in the shortlist phase. You can also
treat any of these as a request to wrap up:

- The user types "done", "synthesize", "write the deliverable", "next steps"
- `phase` is `shortlist` with ≥1 starred idea and the user explicitly asks
- The user closes the browser tab and asks to continue in chat

Don't auto-advance phases on the user's behalf. If you think they should
move on, ask first.

## Synthesis (writing the final deliverable)

When the session is done — phase is `done`, or the user asks for the
synthesis:

1. Read `canvas.json` one more time (you've been reading it all along, but
   take a fresh snapshot).
2. Read the exercise's synthesis template at
   `${CLAUDE_PLUGIN_ROOT}/companion/exercises/<exercise>/synthesis-template.md`.
3. Compute the deliverable path:
   `./strategic-sessions/<YYYY-MM-DD>-<exercise>-<slug>.md` where the slug
   is the lowercase, hyphenated version of `canvas.json:context` (truncate
   to ~40 chars, fall back to `session` if empty). The `strategic-sessions`
   directory already exists if the launcher ran from CWD.
4. Fill the template with real values from the canvas state. Don't copy the
   template's `<...>` placeholders or its meta-instructions — those are for
   you, not the user. Apply the zone rules and quadrant rules the template
   specifies.
5. Write the file with the Write tool. Tell the user the path so they can
   open it.

The template is opinionated about what goes where; follow its structure
unless something genuinely doesn't apply (then omit the section, don't fake
it).

## Failure modes and recovery

| Symptom | Likely cause | Action |
|---|---|---|
| `start-server.sh` exits non-zero | Node missing, exercise typo, port collision | Show the error, offer to retry or fall back to markdown |
| URL works for a few seconds then connection refused | Parent-PID watcher tied to the wrong process | Should not happen — file an issue. Relaunch. |
| `canvas.json` exists but `phase` never changes | User isn't engaging with the canvas | Ask them in chat if the page loaded; offer to fall back |
| Canvas served but events never arrive | WebSocket blocked (rare on localhost) | Check `paths.dir/server.log`; relaunch |

Server self-cleans 30 min after the last WebSocket activity, or within ~5 s
of the Claude Code harness exiting. You don't need to kill it explicitly.

## State schema (for reading)

```jsonc
{
  "exercise":   "happy-line",
  "context":    "early-stage SaaS buyers",
  "phase":      "kpc-entry" | "rank" | "rate" | "ideate" | "shortlist" | "done",
  "kpcs": [
    { "id": "k_x9", "label": "Onboarding speed",
      "letter": "A",        // stable A–Z handle assigned at add time
      "importance":   0.83, // 0..1, derived from rank position
      "satisfaction": 0.34  // 0..1, set by user dragging in phase 3
    }
  ],
  "ideas": [
    { "id": "i_x9", "text": "Self-serve setup wizard",
      "linkedKpcs": ["k_x9"], // KPC ids; quadrant = clamp(length, 1, 4)
      "starred": false        // user shortlists by toggling this; ≤3 enforced
    }
  ],
  "annotations": [{ "id":"a...", "from":"claude", "target":"k_x9",
                    "text":"…", "ts": 1730000000 }],
  "lastEventTs": 1730000123  // ms epoch of the most recent event
}
```

You only ever read this. The server writes it.
