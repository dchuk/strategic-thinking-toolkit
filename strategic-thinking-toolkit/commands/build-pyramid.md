---
description: Build a Pyramid Principle structure for a qualitative strategic issue
argument-hint: "[qualitative issue or 'How?'/'Should we?' question]"
---

# Build Pyramid

**Purpose.** Construct a Pyramid Principle hierarchy for a qualitative issue — a "How?" or "Should we?" question — when you do not yet have the answer. Use this command at the start of a project to achieve Clarity: discover the underlying structure of the problem, generate a comprehensive workplan, and lay the foundation for a compelling end-of-project presentation.

## When to use

- You face a qualitative business question (e.g. "Should we be doing X?", "How can we be more successful at Y?", "How much support should we give Z?") and do not yet have the answer.
- The team needs early calmness and a convergent path to success before analysis begins.
- You want to produce a comprehensive workplan from first principles.
- You are in the **Up phase** of the Rollercoaster and need a structured problem decomposition before moving to data-heavy Down-phase tools.

## Steps

1. **Capture the qualitative issue.** Ask the user to state the question in full. Confirm it is qualitative (answered by words, not numbers). If the user has already provided it as the command argument, read it directly.

2. **Write the top Post-it.** Restate the most desirable (or most difficult to achieve) outcome as a positive declarative sentence — not a question, not a negative. Example: "Our wedding is a great success." Print it clearly as **Level 0**.

3. **Populate Level 1.** Ask: *"What would need to be true for this outcome to be true?"* Generate exactly three Post-its as positive full sentences. Label them **L1-A**, **L1-B**, **L1-C**.

4. **Apply the counter-scenario test to Level 1.** Ask: *"Can we think of a scenario where L1-A, L1-B, and L1-C are all true, and yet the Level 0 outcome is NOT automatically true?"*
   - If yes, identify which Post-it is incomplete and toughen it by incorporating the objection. Repeat until no counter-scenario can be imagined.
   - This converts objections into structure (Rule: `ch08.principle.objections-into-structure`).

5. **Apply MECE to Level 1.**
   - **Completely Exhaustive:** confirm the three Post-its together cover all content of the Level 0 Post-it — nothing omitted.
   - **Mutually Exclusive:** confirm no idea is counted twice.
   - Completely Exhaustive takes priority: it is better to count something twice than to lose it entirely.

6. **Replace buzzwords at Level 1.** Scan L1-A, L1-B, L1-C for vague nouns or compressed phrases. Expand each into a full sentence that could stand alone.

7. **Re-order Level 1 by criticality.** Place the most necessary condition on the left (L1-A) and the least necessary on the right (L1-C).

8. **Enforce the no-fourth-Post-it rule.** If the user or the analysis suggests a fourth condition at any level, write it down, then re-cut the four ideas into three Post-its. Do not add a fourth Post-it (Rule 3: No fourth Post-it).

9. **Recurse to Level 2.** For each of L1-A, L1-B, L1-C, repeat Steps 3–8, generating three child Post-its per parent. Label them **L2-A1/A2/A3**, **L2-B1/B2/B3**, **L2-C1/C2/C3**.

10. **Recurse to Level 3 and beyond.** Continue the same pattern — populate, counter-scenario test, MECE check, buzzword replacement, reorder — for each node until the bottom row contains granular, actionable tasks. A three-level pyramid yields 27 bottom-row items; four levels yields 81.

11. **Smooth the pyramid.** After populating three or more levels, inspect for skew: if one branch is significantly more developed than others, either populate the sparse branch to the same depth, or restructure the blocks to rebalance logical weight across all branches.

12. **Render the final pyramid.** Output the complete hierarchy as a structured markdown outline with each Post-it on its own line, indented by level, and labelled by its coordinates (L0, L1-A, L2-A1, etc.).

13. **Identify the comprehensive workplan.** List all bottom-row Post-its as a numbered task list. This is the comprehensive workplan — the concrete work items that, if completed, guarantee the top-level outcome.

## Watch out for

- **HiPPO Curse** — the highest-paid person in the room dictating the pyramid's top-level conditions. Use the counter-scenario test (Step 4) to challenge every level regardless of seniority.
- **Buzzword Post-its** — labels like "Quality", "Alignment", or "Culture" that feel complete but hide ambiguity. Step 6 forces full-sentence expansion.
- **Skewed pyramid** — one branch grows to four or five levels while siblings stall at one. Catch this in Step 11 before finalising.
- **Fourth Post-it creep** — the team keeps adding conditions. Enforce Step 8 firmly; four conditions usually means the grouping logic needs to be cut differently.
- **Negative or question-form Post-its** — "Don't lose customers" or "Are we efficient?" Both block clean decomposition. Rewrite as positive declarative statements.

## Verify

The command has succeeded when:

1. **Level 0** is a single positive declarative sentence (the most desirable outcome).
2. Every non-leaf node has exactly three children.
3. The counter-scenario test passes at every level (no imaginable scenario where all children are true but the parent is not).
4. Every Post-it is a full sentence — no buzzwords remain.
5. Within each sibling group, Post-its are ordered most-to-least necessary (left to right).
6. The pyramid is not visibly skewed (no branch is more than one level deeper than its siblings).
7. The bottom row is presented as a numbered comprehensive workplan.

## Notes

- The Pyramid Principle is an **Up-phase tool**. It produces Clarity before you have the answer. At the end of the project, apply it again for Conviction — see [`../skills/strategic-thinking/references/tools/pyramid-principle.md`](../skills/strategic-thinking/references/tools/pyramid-principle.md) for the late-project (Conviction) variant.
- The same pyramid, read upside-down, becomes a **decision tree**: desired outcome at the bottom, small Post-its at the top, with workplan results trickling down to determine which specific version of the outcome is achieved.
- For issues where numbers dominate, consider switching to a Down-phase tool such as Landscape Analysis ([`../skills/strategic-thinking/references/tools/landscape-analysis.md`](../skills/strategic-thinking/references/tools/landscape-analysis.md)) after the pyramid establishes structure.
- Facilitation tips for running this exercise with a team (Post-it etiquette, room setup, team size for Up-phase sessions) are in [`../skills/strategic-thinking/references/topics/facilitation-tips.md`](../skills/strategic-thinking/references/topics/facilitation-tips.md).
- Anti-patterns relevant to this command (HiPPO Curse, Data-holic, and others) are catalogued in [`../skills/strategic-thinking/references/anti-patterns/anti-patterns-catalog.md`](../skills/strategic-thinking/references/anti-patterns/anti-patterns-catalog.md).
