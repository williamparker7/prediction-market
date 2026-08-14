# Prediction Market Edge Platform — Research Principles

## Baseline

Prediction-market price is the baseline probability estimate.

```text
Primary-outcome price = 0.63
→ baseline P(primary outcome) = 0.63
```

Any future model must beat or add value relative to that baseline.

## First research milestone: calibration

Primary question:

> “When contracts trade around probability p, how often does the corresponding outcome actually occur?”

Example output:

| Price bucket | N | Actual primary-outcome frequency |
| --- | ---: | ---: |

The first complete calibration pipeline will answer this question for one statistically coherent, preselected market cohort—not automatically for all of Polymarket. Ultra-short crypto contracts, sports, elections, economic or policy markets, longer-duration crypto markets, and other recurring or non-recurring contracts can differ materially in duration, information arrival, liquidity, repetition frequency, and settlement mechanics.

The cohort will be chosen after profiling the historical market universe. Future cohorts or slices may use:

- price level
- time to resolution
- liquidity
- volume
- market age
- category/event type when reliable metadata is available

## Required data

For each forecast observation we ultimately need:

- market identity
- observation timestamp
- market probability/price
- eventual resolution/ground truth

## Evaluation

Initial metrics:

- calibration curves / reliability tables
- Brier score
- log loss when appropriate
- sample counts and uncertainty

## Statistical discipline

- No look-ahead leakage.
- Lock the first cohort before examining its calibration results.
- Use at most one observation per market per chosen evaluation horizon, with a leakage-safe time anchor appropriate to that cohort.
- Report cohort composition clearly; do not describe a cohort result as representative of all Polymarket unless the sample supports that claim.
- Treat concentration from repetitive market families as a research-sampling issue, not a reason to deduplicate legitimate market records. Measure it before introducing weighting or other corrections.
- Use time-aware train/test splits for future predictive models.
- Avoid evaluating a pattern on the same data used to discover it.
- Distinguish statistical miscalibration from an executable trading opportunity.
- Account for fees, spreads, liquidity, and execution before calling something tradable edge.
- Do not claim profitability from calibration alone.

## Near-term research path

reliable metadata
→ resolved-market ground truth
→ raw historical-price and import-provenance model
→ bounded historical importer
→ historical market-universe profile
→ locked coherent calibration cohort
→ cohort-appropriate observation methodology
→ first calibration analysis
→ expand to additional cohorts
→ only then investigate additional signals/models

ML or AI is not currently required.
