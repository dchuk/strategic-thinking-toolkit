---
description: Write a one-page executive summary in flyer format with slogan, metrics, and all four NLP channels
argument-hint: "[venture or initiative name]"
---

# Write Executive Summary

## Purpose

Produce a one-page executive summary in flyer format for a new venture pitch or strategic initiative. Use this command when you need a scannable, persuasive one-pager that blends all four NLP representation channels (Visual, Auditory, Kinaesthetic, Digital) and follows the book's strict structural rules.

## When to use

- You are pitching a new venture, product, or initiative to senior stakeholders
- You need to compress a full business case into a single page
- Your audience is mixed and you cannot predict preferred communication styles
- You are preparing a Push-phase deliverable after completing Up and Down analysis
- The current summary is longer than one page or lacks visual hierarchy

## Steps

1. **Gather context.** Ask the user for the venture or initiative name if not supplied as an argument. Ask for: the target audience, the core value proposition in one sentence, any existing draft material or key data, and the names and roles of the two to four key people who will execute the plan.

2. **Draft the slogan.** Craft a single bold slogan — short enough to print large at the top of the page. Aim for three to six words that anchor the concept immediately (e.g. "Meds On Tap" for an online pharmacy). Offer two to three alternatives and ask the user to select one.

3. **Select the photo concept.** Describe one stunning, memorable image that visually anchors the concept. Do not embed a binary file — write a one-sentence art direction note the user can use to source the image (e.g. "A close-up of a pharmacist's hand handing a labelled package directly to a customer").

4. **Write the bios block.** For each of the two to four key people, write a super-short bio: name, title, and one distinguishing credential — no more than 15 words per person.

5. **Choose the three key metrics.** Apply `ch16.rule.three-key-metrics` exactly:
   - **Metric 1 — Upfront investment required** (e.g. £2.4 M seed funding)
   - **Metric 2 — Key operational success metric** (e.g. 10,000 active users by month 6)
   - **Metric 3 — Financial return metric** (e.g. 3× ROI in 36 months)
   Ask the user to confirm or supply the values if not yet available.

6. **Write the body text.** Draft 200–300 words of body copy. Enforce `ch16.rule.200-300-words` — count words explicitly and trim if over 300. The body must weave all four NLP channels:
   - **Visual:** use words like *see*, *clear*, *picture*, *bright*; ensure the slogan and photo do heavy lifting
   - **Auditory:** use words like *hear*, *tell*, *sound*, *say*; include a line the reader could quote aloud
   - **Kinaesthetic:** use words like *feel*, *grasp*, *impact*, *tense*; describe an experience or emotional moment
   - **Digital:** use precise figures, structured lists, and multi-syllable analytical words like *capability* or *framework*

7. **Apply visual hierarchy.** Identify five to eight key phrases in the body text and mark them for bold or highlight, per `ch16.rule.highlight-key-text`. A diagonal scan of the page must communicate the core message in under one second.

8. **Assemble the one-pager.** Combine slogan, photo note, bios block, three metrics box, and body text into a single cohesive layout description. Confirm it fits on exactly one page — not two, not three (`ch16.rule.one-page-summary`).

9. **Apply Adland Swagger check.** Verify that:
   - The slogan functions as a three-word (or short-phrase) summary colleagues can repeat without the full deck
   - The photo note captures one simple visual concept
   - At least two human anecdotes or representative customer moments appear in the body text

10. **Deliver the final draft.** Output the complete one-pager as formatted markdown the user can paste into a design tool or document. Label each zone clearly (SLOGAN, PHOTO, BIOS, METRICS, BODY).

## Verify

The executive summary is complete when all of the following are true:

- [ ] Exactly one page of content (no overflow)
- [ ] Slogan is present and printed prominently at the top
- [ ] One photo art-direction note is included
- [ ] Two to four super-short bios are present
- [ ] Exactly three metrics are present: investment, operational, financial return
- [ ] Body text word count is between 200 and 300 words
- [ ] Bold/highlighted phrases guide diagonal reading
- [ ] All four NLP channels (Visual, Auditory, Kinaesthetic, Digital) are represented in the body text
- [ ] A reader scanning the page for one second can grasp the core message

Ask the user to read the draft diagonally in one second and confirm the core message lands correctly. If it does not, revise the slogan and highlighted phrases first.

## Watch out for

- **Page-count creep** — resist any urge to add a second page; cut bios, shorten body text, or reduce the metrics narrative instead
- **Single-channel bias** — if the user naturally writes in one NLP channel (often Digital), the draft will feel data-heavy and cold; actively insert at least one Visual and one Kinaesthetic phrase
- **Vanity metrics** — the three key metrics must be actionable and credible, not impressionistic; see [../skills/strategic-thinking-toolkit/references/tools/lean-startup.md](../skills/strategic-thinking-toolkit/references/tools/lean-startup.md) for the distinction between actionable and vanity metrics
- **Missing human element** — a purely analytical one-pager fails the Kinaesthetic and Auditory audience; always include at least one anecdote or human moment per the Two Human Anecdotes principle

## Notes

- This command is a **Push-phase** tool. It assumes the strategic thinking (Up) and validation (Down) work is complete. If the venture hypotheses are still unvalidated, run `/design-lean-experiment` first.
- For the underlying NLP channel matching technique used in live pitches, see [../skills/strategic-thinking-toolkit/references/tools/impactful-words.md](../skills/strategic-thinking-toolkit/references/tools/impactful-words.md).
- For the Adland Swagger techniques (three-word summary, one simple visual, two human anecdotes) applied to full presentations, see [../skills/strategic-thinking-toolkit/references/tools/compelling-story.md](../skills/strategic-thinking-toolkit/references/tools/compelling-story.md).
- If the executive summary will anchor a larger deck, build the surrounding pyramid structure first with `/build-pyramid`.
