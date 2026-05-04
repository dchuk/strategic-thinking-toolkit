# Simple Numbers: Memorable Metrics and Pocket NPV

## Problem Framing

Strategic decisions drown in two failure modes. The first: a dashboard crammed with hundreds of metrics that no one can act on, where "what gets measured gets done" becomes "what gets measured gets ignored." The second: a team that disappears into Excel for a week building a precise financial model before anyone has sketched the shape of the business they're modelling — only to discover the assumptions were wrong all along.

The **Simple Numbers** toolkit (a Push-phase tool) attacks both problems. It gives you two complementary instruments: **Memorable Metrics** to drive aligned behaviour as an initiative unfolds over time, and **Pocket NPV** to compare discrete strategic options on financial attractiveness — fast, visually, and without a spreadsheet.

---

## Memorable Metrics and the Balanced Scorecard

### Why the Balanced Scorecard Exists

The Balanced Scorecard, introduced by Kaplan and Norton, concentrates measures for success across four perspectives in one place to avoid the **Rear-View Mirror** problem of relying solely on financial data. Financial statements are lagging indicators — they tell you what already happened. Customer satisfaction, process quality, and organisational learning are leading indicators — they signal future performance before it appears in the P&L.

**The four Balanced Scorecard perspectives:**

| # | Perspective | Type |
|---|---|---|
| 1 | Financial | Lagging |
| 2 | Customer | Leading |
| 3 | Business Process | Leading |
| 4 | Learning & Growth | Leading |

### The Philippa Illustration: Why the Right Metric Is a Strategic Act

The book opens the chapter with a simple example that makes the principle visceral. Philippa is a talented employee. If she is measured on **salary**, she will try to get promoted into the highest-paying role. If measured on **salary per hour**, she will optimise time — fewer hours, cleaner output. If measured on **assets** (the long-term aspiration), she will start building things that outlast any single role. Three different metrics, three fundamentally different behaviours, from the same underlying talent.

> "What you choose to measure will determine how people behave; choosing the right metric is a strategic act that shapes organisational direction over time." _source: ch17 opening paragraphs_

### Rule 1: No More Than 12 Memorable Metrics

A scorecard for a new venture or project should contain **no more than 12 Memorable Metrics**, with three in each of the four Balanced Scorecard perspectives. _source: ch17 §best practice metrics_

### Rule 2: The Bouncer Method for Selection

Don't start by choosing 12. Start by brainstorming dozens, then add them back one by one in strict priority order — asking "if I could only have one, which is it?" at each step. Stop at 12.

```
Brainstorm dozens of candidate metrics across all four perspectives.
↓
Clear the dashboard completely.
↓
"If I could only have one metric, which would it be?" → Add it.
↓
Repeat until you reach 12 (approx. 3 per perspective).
↓
Stop.
```

### Rule 3: Build a Blend Across Temporal Horizons

A scorecard should contain a blend of metrics:

- **Present-management metrics** — are we operating well today?
- **Future-outcome metrics** — are we building toward a better position?
- **Aspirational metrics** — do we have at least one that shifts long-term behaviour?

_source: ch17 §blend of metrics_

### Rule 4: Green Dashboard Warning

If all indicators on a dashboard are bright green, you are probably not measuring the right things. Revise the metrics. _source: ch17 §prioritise right metrics right time_

### The Netflix Illustration: Metrics Must Evolve

Netflix's critical **Business Process** metric shifted across eras: postal delivery accuracy → server downtime → content inventory size. The same company, the same perspective, three completely different measures at different stages of the business. Good strategists identify which metrics to use at different stages and retire individual measures when they have become redundant.

### Russian Doll Scorecards

Rather than one giant organisation-wide dashboard, every person or function has their own simple scorecard, nested within different scorecards for their boss and direct reports. Each scorecard stays simple; complexity lives in the nesting, not in any individual sheet. This directly fixes the **Dashboard Overload** anti-pattern.

### Glide Paths

A **Glide Path** pre-specifies which new metrics will replace current ones as those current metrics become easily met or obsolete. Build it into the scorecard design at the start, not as a retrofit. _source: ch17 §glide path_

---

## Pocket NPV

### The Spreadsheet-First Trap

> "A very common mistake is to spend a lot of time creating a spreadsheet and then realising too late that you have not thought through the underlying business characteristics." _source: ch17 §Pocket NPV visual approach_

**Pocket NPV** is a lightweight, highly visual approach to Net Present Value that prioritises understanding the relative shape and order of magnitude of NPV components across options **before anchoring with actual numbers**.

### The Three NPV Components

| Symbol | Meaning |
|---|---|
| **K** | Upfront investment (capital out) |
| **CF** | Annual cash flows, years 1–5 |
| **TV** | Terminal value — estimated amount someone else might pay for the initiative at year five |

**Discount rate (r):** A measure of the riskiness of the initiative — the riskier the initiative, the higher the discount rate applied. _source: ch17 §Pocket NPV – four principles_

### Rule 5: Visual First, Numbers Second

Before inserting any numbers into an NPV model, draw the shape of each option's K, CF, and TV visually and compare them across all options. _source: ch17 §Pocket NPV visual approach_

### Rule 6: Five-Year Horizon

Do not attempt to forecast individual cash flows beyond five years. Use a terminal value (TV) for all cash flows thereafter. A rough estimate for TV: how much might someone else pay for this initiative at that future point? _source: ch17 §Pocket NPV – four principles_

### Rule 7: Relative, Not Absolute

> "Absolute amounts are hard to find and likely to be incorrect; a relative ratio between options is easier to gauge and also more likely to be true." _source: ch17 §Pocket NPV three questions_

When comparing options, answer three relative questions versus Option A:
1. How does the investment compare — bigger, smaller, by how much?
2. How do the cash flow shapes compare — same, double, ten times?
3. How does the terminal value compare in relative size?

Then anchor the whole picture by inserting one known real number (e.g., "Option A investment = $2M") and derive the rest from the ratios.

### The Pocket NPV Workflow

```
1. Define options to compare (A, B, C…).
2. For Option A: draw K, CF1–CF5 shape, and TV on paper.
3. Estimate TV: "How much might someone pay for this in 5 years?"
4. For each other option: answer the three relative questions vs. A.
5. Note any quirks (mid-year reinvestment, one-off licence sale,
   declining CFs after peak, etc.).
6. Anchor with one real number; derive others from relative ratios.
7. Calculate NPV across discount rate range (e.g., 5%, 10%, 15%, 20%).
8. Identify which option dominates and what risk assumptions would
   be required for a lower-NPV option to win.
```

_source: ch17 §Pocket NPV visual approach and §three questions_

---

## Anti-Patterns Catalog

### Rear-View Mirror Management
Driving a business using only financial statements (lagging indicators).
**Fix:** Supplement financial metrics with leading indicators from the customer, business process, and learning & growth perspectives.
**Signals:** scorecard contains only revenue, cost, and profit metrics; no customer satisfaction measures exist. _source: ch17 §Financial perspective_

### Dashboard Overload
Measuring everything; hundreds of measures; paralysis and diluted focus.
**Fix:** Apply the Russian Doll model — keep each individual's scorecard to ~12 metrics maximum, three per perspective.
**Signals:** dashboard has more than ~12 metrics; everyone shares one giant dashboard; no clear metric owner. _source: ch17 §Russian dolls_

### Spreadsheet-First NPV
Jumping into Excel before understanding the qualitative shape of each option.
**Fix:** Pocket NPV — sketch visual shapes first, establish relative orders of magnitude, then anchor with numbers.
**Signals:** team opens Excel before any visual comparison exists; assumptions buried in cell formulas. _source: ch17 §Pocket NPV visual approach_

### Single-Metric Focus
Selecting only one metric leads to a narrow range of behaviours, missing leverage and balance.
**Fix:** Select a blend across temporal horizons — present-management, future-outcome, and aspirational metrics.
**Signals:** only one KPI tracked; all metrics belong to the same temporal horizon. _source: ch17 §Philippa illustration_

### Stale Metrics
Continuing to track metrics that have become redundant or permanently green.
**Fix:** Build a Glide Path into scorecard design that pre-specifies which metrics will be promoted when current ones become obsolete.
**Signals:** metrics unchanged since founding; all indicators permanently green; metrics no longer linked to current challenges. _source: ch17 §Netflix illustration and §glide path_

---

## When to Use / When NOT to Use

### Memorable Metrics — Use when:
- Starting a new venture, initiative, or strategic review and needing to define KPIs.
- You need to track ongoing **flow** of performance over time.
- You want to drive aligned behaviour across the organisation.
- You are navigating an initiative once it is already underway.

### Memorable Metrics — Do NOT use when:
- You need to put a one-time financial value on a new initiative or compare discrete options → use Pocket NPV instead.
- The question is "which option should we choose?" rather than "are we on track?" _source: ch17 §transition from Scorecard to NPV_

### Pocket NPV — Use when:
- Comparing two or more strategic options on financial attractiveness with limited data.
- Speed and clarity of comparison matter more than precision.
- You need a first pass before committing resources to full modelling.

### Pocket NPV — Do NOT use when:
- Corporate finance sign-off requires precise calculations → use a full desktop NPV model.
- The organisation has reliable data across all years and perspectives and needs exactness. _source: ch17 §Pocket NPV introduction_

---

## Code Examples

### Bouncer Method Session (Facilitation Script)

```
Phase 1 — Generate (10 min)
  Each participant writes candidate metrics on Post-its,
  one metric per Post-it, for all four BSC perspectives.
  Cluster on the wall by perspective.

Phase 2 — Bouncer (15 min)
  Facilitator: "Clear the board. If you could only have ONE
  metric to run this initiative, which would it be?"
  → Place that Post-it on the scorecard.

  "If you could add just ONE more, which next?"
  → Repeat.

  Stop at 12. Any Post-it that didn't make the cut is retired.

Phase 3 — Glide Path (5 min)
  For each metric: "When this metric turns permanently green,
  which metric from the retired pile replaces it?"
  → Annotate each active Post-it with its successor.
```

### Pocket NPV Visual Sketch (Paper Format)

```
Option A                Option B
──────────────────────  ──────────────────────
K (upfront): $2M        K: ~3× A → ~$6M

CF shape (yr 1–5):      CF shape:
  ▁▂▃▄▅ (growing)         ▄▄▄▃▂ (flat then declining)

TV (yr 5):              TV:
  ~$5M                    ~$2M (lower: declining CFs)

Notes: no mid-yr K      Notes: additional K in yr 3
       no quirks               (system upgrade)

Discount rate sensitivity:
  r=5%   r=10%  r=15%  r=20%
A: high NPV across all scenarios
B: NPV positive only at r≤10% → only viable if low-risk
```

### Metric Blend Check (Self-Assessment)

```
Scorecard health check — ask for each metric:

[ ] Which BSC perspective does it belong to?
    (Financial / Customer / Business Process / Learning & Growth)

[ ] Which temporal horizon?
    (Present-management / Future-outcome / Aspirational)

[ ] Is it a leading or lagging indicator?

[ ] Who owns it?

[ ] What triggers its retirement? (Glide Path successor?)

Pass criteria:
  - At least one metric per perspective ✓
  - At least one leading indicator ✓
  - At least one aspirational metric ✓
  - Total count ≤ 12 ✓
  - Not all indicators permanently green ✓
```

---

## Related References

- [Compelling Story](compelling-story.md) — The other Push-phase quantitative tool; pairs Simple Numbers with narrative structure for executive presentations.
- [Payoff Profiles Matrix](payoff-profiles.md) — Down-phase tool for comparing strategic bets before committing; Pocket NPV enriches the financial dimension of each bet on the grid.
- [Lean Startup](lean-startup.md) — Down-phase validation tool; once metrics are defined with the Bouncer Method, Lean Startup experiments can be designed to test whether those metrics are moving.
- [Anti-Patterns Catalog](../anti-patterns/anti-patterns-catalog.md) — Full catalog including Rear-View Mirror Management, Dashboard Overload, Spreadsheet-First NPV, Single-Metric Focus, and Stale Metrics with cross-phase context.
- [Build Memorable Metrics command](../../../../commands/build-memorable-metrics.md) — Step-by-step facilitation command for running a full Memorable Metrics scorecard session.
- [Strategy Reviewer agent](../../../../agents/strategy-reviewer.md) — Evaluates whether a submitted scorecard passes the Bouncer Method, Russian Doll, and Glide Path criteria.
