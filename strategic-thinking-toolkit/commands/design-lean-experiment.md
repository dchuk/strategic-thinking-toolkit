---
description: Design a Lean Startup experiment to validate a strategic idea cheaply and fast
argument-hint: "[strategic idea or initiative to test]"
---

# Design Lean Experiment

## Purpose
Translate a strategic idea into a structured Lean Startup experiment using the Build–Measure–Learn loop. Use this command whenever a strategic option needs validation through actions rather than words or numbers, and before committing significant budget or resources.

## When to use
- A Down-phase option needs quick, cheap validation before a full Roll-out decision
- The team is debating whether to invest in an idea whose critical assumptions are genuinely unknown
- A previous Lean cycle produced mixed results and the team needs to Pivot or redesign the test
- The allocated test budget feels too large and creative cost-reduction is needed (10% forcing function)
- An established organisation needs to run a public-facing experiment without risking brand or reputation

## Steps

1. **Capture the idea and its embedded hypotheses.**
   Ask the user to state the strategic idea in one or two sentences. Then list every assumption the idea depends on — treat each as a hypothesis to be tested or dismissed.

2. **Classify hypotheses as critical vs. nice-to-have.**
   For each hypothesis, ask: "If this assumption is wrong, does the idea fail altogether?" Mark those as **critical**. Mark the rest as nice-to-have. Flag any hypothesis where the outcome is already known or predictable — per the principle `ch14.principle.test-not-poll`, running a test when the outcome is not genuinely unknown wastes organisational tolerance for failure and is just a poll.

3. **Apply the 10% budget forcing function.**
   If a budget has been proposed, ask: "How would we run this test for one-tenth of the current budget?" Walk through every cost line. This forces ruthless focus on the single most critical hypothesis and surfaces borrow/barter/beg opportunities. Adopt the revised design even if the saving is 75% rather than the full 90%.

4. **Design the MVP around the critical hypotheses only.**
   Define the Minimum Viable Product: the simplest version of the product or service that allows the team to collect validated learning about the critical hypotheses with the least effort. Remove all nice-to-have data-gathering from the MVP scope. Apply Rule `ch14.rule.one-variable-at-a-time`: do not test multiple variables simultaneously in a single experiment.

5. **Source MVP components via borrow, barter, or beg.**
   For each MVP component, identify whether it can be borrowed, bartered, or begged before considering purchasing or building. Record the sourcing method for each. Treat variable costs as strictly preferable to fixed costs — any MVP asset will be discarded after the test. Only approve cash spend as an absolute last resort.

6. **Design for hide-ability and deniability.**
   For each element of the experiment, ask: "If this test fails publicly, does it harm our brand or reputation?" Select an out-of-the-way test location and/or a partner company for whom the worst-case scenario would not damage their brand. Document the hide-ability and deniability rationale. (Exception: if the organisation is a young startup with no established brand, bad publicity may be acceptable.)

7. **Define actionable metrics and success criteria before launching.**
   Per Rule `ch14.rule.identify-metrics-beforehand`, identify the specific metrics to optimise and what success looks like. Distinguish actionable metrics (those that lead to a concrete decision) from vanity metrics (those that look positive but do not reflect the key drivers of the idea). State explicit thresholds: e.g. "≥30% conversion = proceed, <5% = abandon, 5–30% = extract learnings and reassess."

8. **Select the target customer group.**
   Identify the smallest, most representative group of target customers for the test. Confirm they are genuine customers (not colleagues or proxies) and that the group size is sufficient to produce statistically meaningful signal on the actionable metrics.

9. **Assess and mitigate key risks.**
   Check for: physical or operational safety requirements, regulatory or compliance obligations, brand exposure, and team stamina. Document mitigations for each risk identified.

10. **Prepare the operational playbook.**
    Confirm: compliance sign-offs are in place, borrowed/bartered/begged resources are secured, participants are recruited, scripts and collateral are ready, and the measurement mechanism is live before the experiment starts.

11. **Run the experiment and measure.**
    Execute the MVP against the test group. Capture customer actions (not opinions) against the defined actionable metrics.

12. **Analyse results and decide: persevere, pivot, or abandon.**
    - **Extreme result** (zero interest or massive over-subscription): draw a clear conclusion and act on it.
    - **Mixed result**: extract the learnings; identify which hypotheses survived and which failed.
    - **Pivot trigger**: if one assumption fails while others succeed, design a new hypothesis and return to Step 2.
    - **Abandon trigger**: if the critical hypothesis fails, do not iterate — consider whether a fresh Up-phase idea-generation session (Mutation Game or Happy Line) is needed before the next Lean cycle.

## Verify
The experiment design is complete and sound when all of the following are true:
- [ ] Every critical hypothesis is explicitly named and the MVP is designed to test at least one of them.
- [ ] No nice-to-have data-gathering remains in the MVP scope.
- [ ] Every MVP component has a documented borrow/barter/beg sourcing method (or a documented last-resort cash justification).
- [ ] A hide-ability and deniability rationale is recorded.
- [ ] Actionable metrics and explicit success/failure thresholds are defined before launch.
- [ ] The 10% budget forcing function has been applied and the revised budget is adopted.
- [ ] A decision rule (persevere / pivot / abandon) is written down in advance.

## Watch out for
- **Vanity Metrics trap** — measuring totals (page views, sign-ups) that look good but do not reflect whether the critical hypothesis is true. Always ask: "Does this metric lead to a decision?"
- **Data-holic anti-pattern** — designing the MVP to gather every possible data point. Ruthlessly cut to the single most critical hypothesis.
- **Fixed-cost creep** — agreeing to buy or build assets for the MVP before exhausting borrow/barter/beg options. Any asset built for a test is headed for the scrap heap if the idea fails.
- **Lean-not-everything trap** — cycling through Lean tests when the starting ideas are poor. A failed Lean test should prompt a fresh Up-phase session, not another Lean iteration on weak ideas. Per principle `ch14.principle.lean-not-everything`, Lean only finds the best of the available options — if those options are poor, go back Up.
- **Poll disguised as a test** — running an experiment when the outcome is already known or where the difference between outcomes is immaterial. This wastes organisational tolerance for failure.

## Notes
- This command implements the **Down-phase** Lean Startup tool. For context on where Lean fits in the full Rollercoaster, see [`../skills/strategic-thinking/SKILL.md`](../skills/strategic-thinking/SKILL.md).
- Full Lean Startup reference (MVP design, A/B Split Testing, Pivot logic, Continuous Deployment): [`../skills/strategic-thinking/references/tools/lean-startup.md`](../skills/strategic-thinking/references/tools/lean-startup.md).
- If the idea being tested emerged from a Mutation Game or Happy Line session, those outputs feed directly into Step 1. See [`../skills/strategic-thinking/references/tools/mutation-game.md`](../skills/strategic-thinking/references/tools/mutation-game.md) and [`../skills/strategic-thinking/references/tools/happy-line.md`](../skills/strategic-thinking/references/tools/happy-line.md).
- If multiple strategic options are competing for test priority, use the Payoff Profiles Matrix to decide which ideas to test first: [`../skills/strategic-thinking/references/tools/payoff-profiles.md`](../skills/strategic-thinking/references/tools/payoff-profiles.md).
- Named anti-patterns referenced above (Vanity Metrics, Data-holic) are catalogued with corrective principles in [`../skills/strategic-thinking/references/anti-patterns/anti-patterns-catalog.md`](../skills/strategic-thinking/references/anti-patterns/anti-patterns-catalog.md).
- For facilitation guidance on team sizing and Post-it use during hypothesis-mapping, see [`../skills/strategic-thinking/references/topics/facilitation-tips.md`](../skills/strategic-thinking/references/topics/facilitation-tips.md).
