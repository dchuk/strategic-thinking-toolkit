---
description: Facilitate a Happy Line session to surface KPC trade-offs and generate customer-centric strategic ideas
argument-hint: "[stakeholder or market context, e.g. 'enterprise customers' or 'my boss']"
---

# Run Happy Line

## Purpose
Facilitate a structured 60-minute Happy Line session that maps Key Purchasing Criteria (KPCs) against supplier performance, draws the Lazy-L satisfaction curve, and systematically generates N-Post-it ideas from the resulting trade-off zones. Use this command whenever you need to surface what a stakeholder truly values and translate that into concrete strategic options.

## When to use
- You are entering a new market and need to diagnose competitive position (see `../skills/strategic-thinking-toolkit/references/tools/happy-line.md`)
- You want to generate customer-centric ideas for a product, service, team, or relationship
- The team has been stuck in analysis; you want to shift from diagnosis to idea generation fast
- You are running an **Up** phase session and need ideation inputs alongside the Mutation Game (see `run-mutation-game.md`)
- You suspect the team is over-investing in less-important criteria (Top Zone) while under-delivering on what customers care about most (Front Zone)

## Visual companion (recommended)

Happy Line is a 2D exercise — KPCs plotted on importance × satisfaction
axes, with a Lazy-L curve emerging as the user drags them. The plugin
ships an optional local web canvas that runs the whole session
spatially: KPC entry → ranking → satisfaction rating → idea generation
in four quadrants → shortlist → done. You facilitate from chat
(observing, prompting, posting annotations) and write the synthesis
deliverable when the user finishes.

Offer it at the very start of the session:

> "Happy Line has an interactive 2D plot you can drag KPCs on directly.
> Want me to launch it as a local web app, or run it as text?"

- **If accepted:** read `../skills/strategic-thinking-toolkit/references/topics/visual-companion.md` for the launch protocol, state schema, turn-by-turn facilitation guidance, and synthesis instructions. The companion replaces steps 3–6 below. Step 1 (gather context), step 2 (briefly set the scene), and steps 7–8 (optional individual diagnostics, segment drill-down) still run in chat as written.
- **If declined or the launcher fails:** proceed with the markdown facilitation in steps 1–8 below. Don't relaunch attempts after a single failure — fall back gracefully.

Decide once at the start. Don't switch modes mid-session.

## Steps

1. **Gather context.** Ask the user: "Who is Stakeholder X for this session — customers, employees, a specific boss, a market segment?" If a file, brief, or research document exists, read it now using the Read tool. If the user has supplied a path, read that file; otherwise proceed with what the user has stated.

2. **Set the scene (1 min).** Describe the flipchart layout to the user:
   - Top half: Happy Line axes. Horizontal axis = KPCs arrow pointing left (most important on left). Vertical axis = customer satisfaction rating.
   - Bottom half: four quadrants labelled 1, 2, 3, 4+ (for N-Post-it idea generation).
   - Remind the team: **do NOT draw the Lazy-L yet** — that comes after KPCs are ranked and performance is plotted.

3. **Assess Stakeholder X — KPC identification and ranking (10 min).** *If the visual companion is active: the user does this in the browser (phases `kpc-entry` and `rank` of the canvas). Read `canvas.json` each turn, comment on what they entered, suggest KPCs they might be missing for the stakeholder context, and gently flag feature-named entries. Don't recite the role rotation — the canvas IS the facilitation. Skip to step 5 once `phase=rate` and bubbles have been placed.* Otherwise, walk the user through the six-person rotation. If the session is solo or virtual, simulate each role in sequence:
   - **Person 1:** Generate 10–12 KPCs on Post-its (team contributes freely).
   - **Person 2:** Review the list; may change up to two Post-its.
   - **Person 3:** Rank KPCs in decreasing order of importance; eliminate the least important to keep **six to eight**. Apply Rule: most important KPC goes on the far left.
   - **Person 4:** May swap the ranking of up to two remaining Post-its.
   - **Person 5:** Rate the entity's performance on each KPC **as Stakeholder X would perceive it**. Plot on the vertical axis.
   - **Person 6:** May shift up to two Post-its vertically.
   - **Label** each Post-it with a letter (a, b, c, …) in its bottom-right corner.
   - Remind the team: do not merge two high-importance KPCs into one; instead check whether any top-four or top-five KPC contains a sub-criterion important enough to spin off separately.

4. **Draw the Happy Line.** *If the visual companion is active: the Lazy-L curve and three zones render automatically as the user drags bubbles in canvas phase `rate`. Your job is to read the emerging shape from `canvas.json` and call it out — name the Front Zone KPCs (high importance, low satisfaction) by letter, flag Premature Satisfaction if everything sits in Top Zone, and push annotations via `POST /annotate` for the most important callouts. Do not ask the user to draw the line manually.* Otherwise, place the Lazy-L inflection so it broadly splits the Post-its into **two batches of roughly equal importance**. Aim for version 3 or 4 out of 5 on the placement spectrum. Do not force every Post-it above or below — the split should maximise available trade-offs.
   - Identify the three zones aloud:
     - **Front Zone** (bottom-left): most important KPCs, underperforming — the strategy zone.
     - **Top Zone** (top-right): less important KPCs, over-delivering — the marketing zone / resource reservoir.
     - **Back Zone** (bottom-right): less important KPCs, underperforming — generate ideas here without compromising more critical criteria.

5. **Generate N-Post-it ideas (30 min).** *If the visual companion is active: the user does this in the browser (canvas phase `ideate`). Each idea auto-files into a 1/2/3/4+ quadrant based on how many KPC chips the user tags. Read `canvas.json:ideas` each turn and prompt for missing quadrants — flag any idea that doesn't move clockwise (Top Zone moves down → Front Zone moves up). Skip to the synthesis step in the playbook once `phase=shortlist`.* Use the four quadrants in the bottom half of the flipchart:
   - **Box 1 — 1-Post-it ideas:** Invent three to four ideas that move the single most critical Front Zone KPC up toward the line. Each idea moves exactly one Post-it.
   - **Box 2 — 2-Post-its ideas:** Invent three to four ideas that trade off a Top Zone KPC (moves it slightly down) to fund improvement of a Front Zone KPC (moves it up). This is a clockwise movement on the graph.
   - **Box 3 — 3-Post-its ideas:** Extend to combinations involving three KPCs.
   - **Box 4+ — higher-order ideas:** Continue with four or more Post-its. These are subtler, less obvious, and more likely to succeed because good ideas address many problems at once.
   - Write each idea on a **different-colour Post-it** from the KPC Post-its. Include in brackets the letters of the KPCs the idea alters (e.g. "One less train daily (a, e)").
   - Validate each idea: it must make Post-its move **clockwise** — Front Zone criteria go up; Top Zone criteria may go slightly down. Reject any idea that violates this rule.

6. **Package best ideas (15 min).** *If the visual companion is active: the user stars up to 3 ideas in canvas phase `shortlist`. When `phase=done`, run the synthesis step from the playbook — Claude rephrases the starred ideas into 2–4 word labels in the deliverable, with the linked KPC letters in brackets. Don't ask the user to repackage ideas in chat; the canvas state plus the synthesis pass is the deliverable.* Otherwise, summarise the strongest ideas in **two to four words each**. Include the component KPC letters in brackets. Prompt the user: "Which ideas address the most Post-its at once? Those are your highest-priority candidates."

7. **Optional — individual diagnostics.** After the group session, ask each team member to independently produce their own version of the diagnostic on a separate flipchart. Extract ideas from each version. Note which ideas appear across multiple versions — these are the most robust because good ideas address many problems at once.

8. **Optional — segment drill-down.** If the market leader appears close to the Happy Line overall, split the market into three or four segments and run a separate Happy Line for each. Identify the segment where the incumbent is furthest from the line — that is the priority entry point. Apply this step when running a Market Entry Diagnostic.

## Watch out for

Reference the full anti-patterns catalog at `../skills/strategic-thinking-toolkit/references/anti-patterns/anti-patterns-catalog.md` for phase-specific traps. Key ones for Happy Line sessions:

- **HiPPO Curse:** The six-person rotation and collective ownership rule exist specifically to prevent one senior voice from dictating the KPC ranking. Distribute roles explicitly; the diagnostic should be a collective achievement so that nobody is particularly attached to it.
- **Data-holic:** You do not need real data to have real ideas. A great solution trumps an accurate diagnostic all the time. If the team stalls on data quality, remind them: spend five to ten minutes plotting the Post-its, then spend fifty to fifty-five minutes extracting ideas.
- **Spending too long on diagnosis:** The most common failure mode. Enforce the time split ruthlessly — the session value lives in idea generation, not in perfecting the Lazy-L placement.
- **Merging top KPCs:** Do not compress two high-importance criteria into one composite KPC. Check the top four or five for sub-criteria that deserve their own Post-it.

## Verify

The session has succeeded when:

- [ ] Six to eight KPCs are plotted and labelled (a, b, c, …), ranked left-to-right in decreasing importance.
- [ ] A Lazy-L line is drawn that splits the Post-its into roughly two equal-importance batches.
- [ ] Front Zone, Top Zone, and Back Zone are clearly identified on the graph.
- [ ] Box 1 contains at least three 1-Post-it ideas targeting the most critical Front Zone KPC.
- [ ] Box 2 contains at least three 2-Post-its ideas that each trade off a Top Zone criterion to improve a Front Zone criterion (clockwise movement confirmed).
- [ ] Every idea Post-it includes the KPC letter references in brackets.
- [ ] Best ideas are packaged in two to four words each.
- [ ] The team can name the top two to three ideas with the highest Post-it count — these are the strategic priorities.

## Notes

- The Happy Line is an **Up phase** tool — it belongs in the ideation and option-generation stage of the Rollercoaster, not in execution. See `../skills/strategic-thinking-toolkit/references/tools/happy-line.md` for the full Lazy-L curve mechanics, zone definitions, and KPC ranking rules.
- For validating which ideas to pursue, pair the output of this session with the **Down phase** Payoff Profiles Matrix (`run-payoff-profiles.md`) to assess risk and return profiles of the generated ideas.
- For market entry contexts, follow the segment drill-down step (Step 8) before generating ideas — find the segment where the incumbent is furthest from the line first.
- Always prefer testing solutions over validating the diagnostic: spend more money testing solutions than on validating the original diagnostic. Use `design-lean-experiment.md` to design an MVP for the best ideas from this session.
- The strategy zone is the bottom-left (Front Zone); the marketing zone is the top-right (Top Zone). The Happy Line takes from the marketing zone and recycles resources towards the strategy zone. Keep this framing explicit for stakeholders who push back on reducing Top Zone investment.
