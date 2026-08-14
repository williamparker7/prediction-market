# Prediction Market Edge Platform — Research Principles

## Baseline

Prediction-market price is the baseline probability estimate.

```text
YES price = 0.63
→ baseline P(event) = 0.63
```

Any future model must beat or add value relative to that baseline.

## First research milestone: calibration

Primary question:

> “When contracts trade around probability p, how often does the corresponding outcome actually occur?”

Example output:

| Price bucket | N | Actual YES frequency |
| --- | ---: | ---: |

Future slices may include:

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
- Use time-aware train/test splits for future predictive models.
- Avoid evaluating a pattern on the same data used to discover it.
- Distinguish statistical miscalibration from an executable trading opportunity.
- Account for fees, spreads, liquidity, and execution before calling something tradable edge.
- Do not claim profitability from calibration alone.

## Near-term research path

reliable metadata
→ resolved-market ground truth
→ historical price observations
→ calibration dataset
→ baseline analysis
→ only then investigate additional signals/models

ML or AI is not currently required.
