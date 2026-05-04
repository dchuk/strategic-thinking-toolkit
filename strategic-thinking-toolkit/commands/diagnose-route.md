---
description: Diagnose which Route to Completion fits your problem and recommend the optimal approach
argument-hint: "[problem description or file path]"
---

# Diagnose Route to Completion

**Purpose:** Evaluate a strategic problem against the book's six criteria for truly strategic issues and recommend the correct Route to Completion — Staircase, Submarine, Helicopter, or Rollercoaster — with clear rationale. Use this command at the very start of any project or initiative before committing to a problem-solving approach.

**When to use:**
- A new problem or initiative has just been scoped and the team is unsure how to approach it
- Someone is defaulting to a Staircase (expert-led workplan) without checking whether the problem is actually novel
- A sponsor is demanding data-heavy analysis (Submarine) on a future-oriented question where data is scarce
- The team is about to kick off a creative workshop and needs to confirm whether Helicopter alone is sufficient or whether the full Rollercoaster is required

---

## Steps

1. **Read the problem statement.** Ask the user to paste or describe the problem in one paragraph. If a file path was passed as an argument, use the Read tool to load that file and extract the problem statement from it.

2. **Evaluate the six strategic criteria.** Score the problem against each criterion from the book's decision rule `ch06.decision.is-it-strategic`. For each criterion, state YES or NO and one sentence of evidence drawn from the problem statement:

   - Is the problem **big in scope**?
   - Does it **lie in the future** (not a past inquiry or present-day review)?
   - Has it **never been done before** (no prior precedent or expert who has solved it)?
   - Will there be **very little reliable data** available throughout?
   - Is the best answer **not just a matter of personal or group taste**?
   - Will **proof be required to convince multiple stakeholders**?

3. **Apply the route selection rules.** Based on the YES/NO profile from Step 2, map to exactly one primary route using the rules below. State which rule applies and why:

   - **Staircase of Expert Execution** — if someone can credibly claim prior experience with this exact problem and already knows the optimal answer. Do not recommend Staircase if the problem is brand-new or unprecedented (`ch06.rule.staircase-when-expert-known`).
   - **Submarine of Analytical Research** — if lots of reliable data exists in the past or present and the problem has already occurred (inquiry, review, investigation). Do not recommend Submarine for future-oriented issues where hard facts are unavailable (`ch06.rule.submarine-for-past-present-data`).
   - **Helicopter of Creative Discovery** — if no expert answer is available and data is sparse, but stakeholders primarily need creative options and are comfortable with subjective selection, without requiring data-backed proof at the end.
   - **Rollercoaster of Strategic Thinking** — if there is no clear answer at the start, very little or unreliable data throughout, AND stakeholders insist on data-backed proof at the end (`ch06.rule.rollercoaster-for-strategic`). This is the Up–Down–Push path: go vertical to Clarity quickly (Up), eliminate weak options with data (Down), then secure stakeholder Conviction (Push).

4. **Produce the diagnosis.** Write a short structured output with three sections:
   - **Verdict:** One sentence naming the recommended route.
   - **Rationale:** Three to five bullet points citing which criteria drove the decision, using the exact terminology (Complexity Corner, Clarity Corner, Certainty Corner, Conviction Corner as relevant).
   - **Next step:** One concrete action — e.g. "Kick off a Pyramid Principle session to generate Up-phase ideas" or "Commission a data audit before launching a Submarine workstream" — with a link to the relevant reference file.

5. **Flag anti-patterns if detected.** If the problem description reveals that the team is already headed down the wrong route, name the anti-pattern explicitly using the catalog. Common mismatches:
   - Treating a novel strategic question as a Staircase ("we've done this before") — cite the HiPPO Curse if seniority is driving the assumption.
   - Running a Submarine on a future-oriented question with no data — cite the Data-holic anti-pattern.
   - Stopping at Helicopter without planning a Down-phase validation when stakeholders will demand evidence.
   See `../skills/strategic-thinking/references/anti-patterns/anti-patterns-catalog.md` for full descriptions.

---

## Verify

The diagnosis is complete and correct when:

- All six strategic criteria have been evaluated with explicit YES/NO answers and brief evidence.
- Exactly one route is recommended with named rules from the book cited as justification.
- The recommended route's starting corner (Complexity Corner) and target corner (Clarity, Certainty, or Conviction) are both named.
- If the Rollercoaster is recommended, the Up–Down–Push three-phase structure is called out explicitly so the team knows all three phases are required.
- Any active anti-patterns detected in the problem description are named and paired with their corrective principle.

---

## Notes

- The Rollercoaster is the only route that combines both creative (Up) and analytical (Down) phases in that specific order. Reversing the order — running data analysis before generating creative options — is a common failure mode and produces neither Clarity nor Conviction efficiently.
- The 5% structuring rule applies whenever the Helicopter or Rollercoaster is chosen: invest roughly 5% of total available time reaching a structured set of three or four options before going deeper (`ch06.rule.five-percent-structuring`, `ch06.rule.three-to-four-options`).
- For a deeper view of what makes a problem truly strategic and the mindset required, see `../skills/strategic-thinking/references/core/strategic-mindset.md`.
- For a full visual map of all four routes and the Up–Down–Push Rollercoaster phases, see `../skills/strategic-thinking/references/core/rollercoaster-framework.md`.
- Once the Rollercoaster is confirmed as the right route, use `agents/strategy-planner.md` to sequence the full Up–Down–Push tool chain for the specific challenge.
