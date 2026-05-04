# strategic-thinking-toolkit

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugin that brings the **Up–Down–Push Rollercoaster of Strategic Thinking** from Fred Pelard's *How to Be Strategic* into your terminal as runnable commands, agents, and reference material.

It turns a 250-page book into a working facilitation kit: diagnose whether your problem is actually strategic, pick the right route, generate three to four credible options in the Up phase, eliminate the weak ones in the Down phase, and win stakeholder Conviction in the Push phase — without leaving your editor.

---

## When to use this plugin

This toolkit is designed for **truly strategic problems** — the kind defined by the book's six tests:

- The problem is **big**.
- It lies in the **future**.
- It has **never been done before**.
- There will be **very little reliable data**.
- The best answer is **not just a matter of taste**.
- It will require **proof to convince many stakeholders**.

Reach for it when you are about to:

- Scope a new initiative, venture, transformation, or pivot and want to avoid defaulting to a Staircase ("we've done this before") or Submarine ("let's collect more data first").
- Run a strategy offsite, ideation workshop, prioritisation review, or executive readout and need a defensible structure.
- Review someone else's strategic plan or initiative portfolio and surface the named anti-patterns it contains.
- Build a one-page executive summary, scorecard, or pitch deck that has to land with mixed audiences (CEO, CFO, board, customers).
- Validate a risky bet with the smallest possible experiment before committing budget.

If your problem already has a known answer, abundant data, or only one stakeholder whose taste decides — you probably want a Staircase, Submarine, or Helicopter route instead. The `/diagnose-route` command will tell you which.

---

## Install

```bash
claude plugin marketplace add dchuk/strategic-thinking-toolkit
claude plugin install strategic-thinking-toolkit@strategic-thinking-toolkit
```

Once installed, all commands are available under the `/strategic-thinking-toolkit:` namespace and the two agents can be delegated to by name.

---

## Quick start

A typical end-to-end Rollercoaster engagement uses the plugin in this order:

1. `/strategic-thinking-toolkit:diagnose-route` — confirm the problem is strategic and pick the route.
2. Delegate to the **strategy-planner** agent — sequence the full Up–Down–Push plan with team sizing, session formats, and validation gates.
3. **Up phase:** `/strategic-thinking-toolkit:build-pyramid`, then `/strategic-thinking-toolkit:run-happy-line` and/or `/strategic-thinking-toolkit:run-mutation-game` to generate options.
4. **Down phase:** `/strategic-thinking-toolkit:run-payoff-profiles` to prioritise, then `/strategic-thinking-toolkit:design-lean-experiment` to validate the surviving bet.
5. **Push phase:** `/strategic-thinking-toolkit:build-memorable-metrics` for the scorecard, then `/strategic-thinking-toolkit:write-executive-summary` for the one-page flyer.
6. Delegate to the **strategy-reviewer** agent at any milestone — it scans your plan against the full anti-pattern catalog (HiPPO Curse, Reserve Big Bet, Data-holic, Premature Satisfaction, Multi-Page Executive Summary, and more).

You can also dip in for a single tool — e.g. just running the Mutation Game to refresh a tired product line, or just writing an executive summary for an existing recommendation.

---

## The Up–Down–Push Rollercoaster

The framework moves a team through three corners:

| Phase | From → To | What you produce | Tools |
|---|---|---|---|
| **Up** | Complexity Corner → **Clarity Corner** | 3–4 credible, widely different options | Pyramid Principle · Happy Line · Mutation Game |
| **Down** | Clarity Corner → **Certainty Corner** | One surviving option, with data | Payoff Profiles Matrix · Landscape Analysis · Lean Startup |
| **Push** | Certainty Corner → **Conviction Corner** | Stakeholder approval | Impactful Words · Simple Numbers · Compelling Story |

The full anatomy of the four routes (Staircase, Submarine, Helicopter, Rollercoaster) lives in [`skills/strategic-thinking-toolkit/references/core/rollercoaster-framework.md`](skills/strategic-thinking-toolkit/references/core/rollercoaster-framework.md).

---

## Commands

All commands are slash commands under the `/strategic-thinking-toolkit:` namespace.

| Command | Phase | Purpose |
|---|---|---|
| [`/strategic-thinking-toolkit:diagnose-route`](commands/diagnose-route.md) | Think | Score a problem against the six strategic criteria and recommend Staircase, Submarine, Helicopter, or Rollercoaster. |
| [`/strategic-thinking-toolkit:build-pyramid`](commands/build-pyramid.md) | Up | Build a Pyramid Principle structure (MECE, sufficient conditions) for a "How?" or "Should we?" question. |
| [`/strategic-thinking-toolkit:run-happy-line`](commands/run-happy-line.md) | Up | Facilitate a 60-minute Happy Line session: identify and rank Key Purchasing Criteria, draw the Lazy-L curve, generate ideas from Front/Top/Back zones. |
| [`/strategic-thinking-toolkit:run-mutation-game`](commands/run-mutation-game.md) | Up | Facilitate a 60-minute Mutation Game: write the descriptive sentence, build a 5–8 component grid with 2–4 variants each, shortlist combinations. |
| [`/strategic-thinking-toolkit:run-payoff-profiles`](commands/run-payoff-profiles.md) | Down | Plot 10–20 initiatives onto the 3×3 Postures×Bets grid, apply the Four Decisions (Delegate / Destroy / Discuss / Drag), engineer Glide Paths. |
| [`/strategic-thinking-toolkit:design-lean-experiment`](commands/design-lean-experiment.md) | Down | Translate a strategic idea into a Build–Measure–Learn loop with an MVP designed via borrow / barter / beg, and actionable (not vanity) metrics. |
| [`/strategic-thinking-toolkit:build-memorable-metrics`](commands/build-memorable-metrics.md) | Push | Build a Balanced Scorecard with ≤12 metrics across the four perspectives, apply the bouncer method, set glide paths. |
| [`/strategic-thinking-toolkit:write-executive-summary`](commands/write-executive-summary.md) | Push | Produce a one-page flyer-format summary with an Adland Swagger three-word slogan and all four NLP representation channels (Visual / Auditory / Kinaesthetic / Digital). |

Each command file contains its own *When to use*, *Steps*, *Verify*, and *Notes* sections.

---

## Agents

Two specialised subagents handle the work that doesn't fit a single command:

- **[strategy-planner](agents/strategy-planner.md)** — Given a problem description, this agent diagnoses the route, then sequences the full Up–Down–Push engagement: which tools in which order, team size and temperament mix (Tigger / Eeyore / Pooh), pre- and inter-meeting memos, validation gates, stakeholder mapping, and an anti-pattern watch list. Output is a phase-by-phase plan with severity-tiered risks.
- **[strategy-reviewer](agents/strategy-reviewer.md)** — Given an existing strategic plan, portfolio, or workshop output, this agent evaluates it against the full named anti-pattern catalog (Single-Route Default, HiPPO Curse, HiPPO Convergence, Late-Answer Submarine, Data-holic, Reserve Big Bet, Premature Satisfaction, Narrow Convincing Repertoire, Multi-Page Executive Summary, Reality Distortion, and more), grouped by phase and severity, each paired with the corrective principle and the tool that fixes it.

Invoke them by name through Claude Code's Task tool, or simply ask Claude to "use the strategy-planner" / "have the strategy-reviewer review this plan."

---

## Skill

The plugin also ships the **strategic-thinking-toolkit** skill ([`skills/strategic-thinking-toolkit/SKILL.md`](skills/strategic-thinking-toolkit/SKILL.md)) — a navigation hub that auto-activates on phrases like *"is this problem strategic?"*, *"help me generate options"*, *"which tool should I use?"*, *"review my strategy"*, *"build a scorecard"*, or *"write an executive summary."* It maps your situation to the right phase, tool, and reference file without you having to remember command names.

---

## Reference library

13 reference files distil the book into structured, machine-readable form. They are read by the commands and agents, and you can read them directly too.

### Core framework
- [`references/core/rollercoaster-framework.md`](skills/strategic-thinking-toolkit/references/core/rollercoaster-framework.md) — the four Routes to Completion, the Up–Down–Push anatomy, and the four Corners (Complexity, Clarity, Certainty, Conviction).
- [`references/core/strategic-mindset.md`](skills/strategic-thinking-toolkit/references/core/strategic-mindset.md) — the six strategic criteria, mindset vs toolset, and the difference between strategic and tactical work.

### Up tools (→ Clarity)
- [`references/tools/pyramid-principle.md`](skills/strategic-thinking-toolkit/references/tools/pyramid-principle.md) — MECE decomposition, sufficient conditions, Clarity Pyramid vs Conviction Pyramid.
- [`references/tools/happy-line.md`](skills/strategic-thinking-toolkit/references/tools/happy-line.md) — Key Purchasing Criteria, Lazy-L curve, Front / Top / Back zones, N-Post-it ideation.
- [`references/tools/mutation-game.md`](skills/strategic-thinking-toolkit/references/tools/mutation-game.md) — descriptive sentence, 5–8 component grid, 2–4 variants per component, combination shortlisting.

### Down tools (→ Certainty)
- [`references/tools/payoff-profiles.md`](skills/strategic-thinking-toolkit/references/tools/payoff-profiles.md) — 3×3 Postures × Bets grid, Four Decisions, Reserve Big Bet anti-pattern.
- [`references/tools/landscape-analysis.md`](skills/strategic-thinking-toolkit/references/tools/landscape-analysis.md) — Mekkos, GPS Charts, Conversion Waterfalls, XLP Line Profitability.
- [`references/tools/lean-startup.md`](skills/strategic-thinking-toolkit/references/tools/lean-startup.md) — Build–Measure–Learn loop, MVP via borrow / barter / beg, actionable vs vanity metrics, A/B testing.

### Push tools (→ Conviction)
- [`references/tools/impactful-words.md`](skills/strategic-thinking-toolkit/references/tools/impactful-words.md) — NLP's four representation systems (Visual / Auditory / Kinaesthetic / Digital) and channel matching per audience.
- [`references/tools/simple-numbers.md`](skills/strategic-thinking-toolkit/references/tools/simple-numbers.md) — Balanced Scorecard, four perspectives, 12-metric cap, bouncer method, glide paths, Russian Doll.
- [`references/tools/compelling-story.md`](skills/strategic-thinking-toolkit/references/tools/compelling-story.md) — Adland Swagger three-word summary, flyer format, Pyramid with Conviction.

### Topics
- [`references/topics/facilitation-tips.md`](skills/strategic-thinking-toolkit/references/topics/facilitation-tips.md) — Third Solution principle, team sizing (small for Up, large for Down), Post-it vs presentation norms, standing rule, Dots Voting.

### Anti-patterns
- [`references/anti-patterns/anti-patterns-catalog.md`](skills/strategic-thinking-toolkit/references/anti-patterns/anti-patterns-catalog.md) — every named anti-pattern from the book, organised by phase (Think / Up / Down / Push / Again) with corrective principles.

---

## Glossary

A few terms surface repeatedly across commands and references:

- **Rollercoaster** — the strategic route: Up (creative) → Down (analytical) → Push (persuasive).
- **Corners** — Complexity (start), Clarity (after Up), Certainty (after Down), Conviction (after Push).
- **KPC** — Key Purchasing Criterion. What a customer actually values.
- **Lazy-L** — the satisfaction curve plotted against ranked KPCs in the Happy Line tool.
- **MECE** — Mutually Exclusive, Collectively Exhaustive — the integrity test for any Pyramid Principle branch.
- **Four Decisions** — the actions taken on cells of the Payoff Profiles Matrix: Delegate, Destroy, Discuss, Drag (toward Shape Options).
- **Adland Swagger** — the advertising-industry discipline of compressing a recommendation into roughly three memorable words.
- **HiPPO** — Highest-Paid Person's Opinion; a recurring anti-pattern source.
- **Tigger / Eeyore / Pooh** — the three temperaments to balance on a strategy taskforce: divergent energy, critical rigour, balanced team player.

---

## License & attribution

MIT licensed. Generated by [Franklin](https://github.com/mcrundo/franklin) from *How to Be Strategic* by Fred Pelard. All credit for the framework, tools, and named anti-patterns belongs to the book.
