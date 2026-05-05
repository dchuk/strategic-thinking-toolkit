# Happy Line — synthesis template

Claude fills this in from `canvas.json` at the end of a session. This file
is a *shape*, not a literal substitution target — adapt phrasing to match
what's in the canvas, but keep the section order and the field semantics.

Write the deliverable to:

```
./strategic-sessions/<YYYY-MM-DD>-happy-line-<slug>.md
```

The `<slug>` is derived from `canvas.json:context` — lowercase it, keep
`[a-z0-9]+`, join with `-`, truncate to ~40 chars. If `context` is empty,
use `session`.

Don't use literal `<...>` placeholders in the deliverable; replace them
with real values.

---

# Happy Line — <context>

*Session run: <YYYY-MM-DD>. Synthesized from canvas state.*

## Stakeholder context

<copy `canvas.json:context` verbatim, or paraphrase if it's terse>

## Key Purchasing Criteria

| Letter | KPC | Importance | Satisfaction | Zone |
|---|---|---|---|---|
| <k.letter> | <k.label> | <High/Med/Low from k.importance> | <High/Med/Low from k.satisfaction> | <Front/Top/Back> |

Zone rule (apply uniformly across the table):

- `importance > 0.5 && satisfaction < 0.5` → **Front** (high priority — strategic underdelivery)
- `importance > 0.5 && satisfaction >= 0.5` → **Top** (defend — already winning)
- `importance <= 0.5` → **Back** (back-burner regardless of satisfaction)

Sort the table by `importance` descending so the table itself reads as the
ranking.

## Lazy-L interpretation

- **Front Zone (strategic priority):** <list KPC letters in this zone>
  - One sentence: what does this say about the stakeholder's unmet needs?
- **Top Zone (defend / fund the Front):** <letters>
  - One sentence: where can resources be reallocated *from*?
- **Back Zone (back-burner):** <letters>
  - One sentence: anything notable, or just "low importance — don't invest here"?

If a zone is empty, say so. If everything is in Top, flag the **Premature
Satisfaction** anti-pattern — the team is overrating the org's performance.

## Ideas generated

For each non-empty quadrant, list ideas with their KPC letter tags. Use the
tag count to determine quadrant — don't trust a stored quadrant field.

### 1-Post-it (incremental)

- <idea text> — <letters>

### 2-Post-its (trade-off across two KPCs)

- <idea text> — <letters>

### 3-Post-its

- <idea text> — <letters>

### 4+ Post-its (transformative)

- <idea text> — <letters>

If a quadrant has no ideas, omit the heading.

## Shortlist

Pull `canvas.json:ideas` where `starred === true`. Order by tag count
descending (4+ first), then alpha. If 0 starred, write "No shortlist —
session ended without a final pick" and stop.

- ★ <idea text> — <letters> · <quadrant label>
- ★ <idea text> — <letters> · <quadrant label>
- ★ <idea text> — <letters> · <quadrant label>

## Anti-patterns watched

Note any that surfaced in chat or via annotations during the session. Use
`canvas.json:annotations` as a hint of what was flagged. Common ones to
mention:

- **HiPPO Curse** — one voice dominated KPC ranking
- **Premature Satisfaction** — everything in Top Zone
- **Data-holic** — got stuck on diagnostic instead of generating ideas
- **Merging top KPCs** — composite Front-Zone KPC instead of two distinct ones

If none surfaced, write "None flagged."

## Next step

Pick one based on what the shortlist implies:

- Strongest 4+ idea → run `/strategic-thinking-toolkit:design-lean-experiment` to spec an MVP
- Multiple competing ideas → run `/strategic-thinking-toolkit:run-payoff-profiles` for risk/return
- Need stakeholder buy-in → run `/strategic-thinking-toolkit:write-executive-summary`
- Up phase needs more raw material → run `/strategic-thinking-toolkit:run-mutation-game`

Recommend exactly one. Use the Down phase by default — Happy Line outputs
need validation before they earn investment.

---

*Generated from session at `<canvas.json path>`*
