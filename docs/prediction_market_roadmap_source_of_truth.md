# Prediction Market Edge / Intelligence Platform
## Project Roadmap — Single Source of Truth

**Owner:** Will  
**Status:** Active  
**Last updated:** 2026-08-13  
**Primary repo:** `~/Developer/prediction-market`

---

# 1. Purpose of This Document

This document is the canonical roadmap and product-direction source of truth for the Prediction Market Edge / Intelligence Platform.

Future ChatGPT conversations in this project should use this document to understand:

- what the product is ultimately trying to become
- what V0 and V1 mean
- what should be built next
- what should *not* be built yet
- how research should be evaluated
- when frontend, AI, multi-market support, execution, and monetization become justified
- how the project should become resume-worthy as quickly as possible without turning into shallow feature accumulation

This document should prevent repeated re-design of the end goal.

If future implementation details change, update this roadmap deliberately rather than casually drifting away from it.

---

# 2. Primary Goal

The project has two goals, in priority order:

1. **Reach a credible, resume-worthy V0 quickly** for new-grad SWE / AIE / FDE applications.
2. **Develop the project into a useful prediction-market trading intelligence product** that can eventually:
   - help Will identify and validate real trading edges
   - help other traders make better decisions
   - attract recurring users
   - support monetization

The project should become more valuable over time without delaying the first credible resume milestone.

---

# 3. Permanent Product North Star

## Prediction Market Edge Terminal

The end-state product is:

> **An evidence-first prediction-market trading intelligence platform that finds potential edges, shows why they may exist and how strong the historical evidence is, monitors those opportunities live, and eventually helps users act on them.**

The product loop is:

```text
Find
  ↓
Validate
  ↓
Explain
  ↓
Monitor
  ↓
Trade
  ↓
Measure
  ↓
Improve research
```

The long-term product may have a Bloomberg-terminal-like breadth, but **generic market aggregation is not the differentiation**.

The differentiation is:

> **Show traders where an opportunity may exist, provide statistically defensible evidence for it, quantify uncertainty and execution constraints, and help them act before the opportunity disappears.**

---

# 4. What This Product Is NOT

The product is not:

- a generic prediction-market dashboard
- an “AI predicts the future” chatbot
- an automated gambling bot
- a frontend-first market tracker
- a collection of indicators with no validation
- a system that calls historical miscalibration “edge” without execution evidence
- a complicated infrastructure project for its own sake

Avoid building features simply because they make the project look more sophisticated.

Every meaningful system component should answer:

> What real product or research requirement does this solve?

---

# 5. Core Product Thesis

Prediction-market prices are already probability estimates.

Example:

```text
YES price = 0.63
→ market-implied P(event) ≈ 63%
```

Therefore:

```text
market price = baseline probability model
```

Any future model, signal, or “edge” must be evaluated against the market-price baseline.

A model saying:

```text
market = 63%
model  = 66%
```

is not automatically useful.

The system must eventually determine whether a disagreement is:

- statistically reliable
- out-of-sample
- large enough to matter
- executable after spread, fees, slippage, liquidity, and settlement constraints

---

# 6. Target Users

## Initial users

Start with:

- Will
- prediction-market friends
- active Polymarket users
- serious prediction-market traders who monitor multiple markets

The earliest users should care more about **better decisions and faster opportunity discovery** than polished consumer UX.

## Later users

Potential later audience:

- active prediction-market traders
- arbitrage / cross-venue traders
- research-oriented traders
- portfolio-style prediction-market participants
- advanced users willing to pay for alerts, research, and normalized data

The first product should not target casual users with broad social features.

---

# 7. End-State Product Functionality

The mature platform should eventually contain six major capabilities.

## 7.1 Market Intelligence

A unified market view containing:

```text
question / market rules
current probability
bid / ask
spread
volume
liquidity
time to resolution
price history
resolution source
market status
```

Eventually support multiple exchanges, beginning with Polymarket and later Kalshi if justified.

---

## 7.2 Edge Scanner — Core Product Wedge

The primary product surface should identify potential opportunities and attach evidence.

Example concept:

```text
Current market probability         37%

Historical comparable outcome rate 44%
Estimated difference                +7 pts

Comparable markets                  312
Evaluation horizon                  7 days
Liquidity                           High
Spread                              1.5¢
Evidence strength                   Moderate
```

Potential opportunity classes:

### A. Statistical edge
Market price differs from historical conditional behavior.

### B. Cross-venue disagreement
Equivalent contracts trade at meaningfully different probabilities.

### C. Executable arbitrage
Opposing positions can create positive expected proceeds after accounting for:

- fees
- spread
- slippage
- liquidity
- settlement differences
- execution risk

### D. Other validated market-behavior signals
Only after rigorous research demonstrates useful out-of-sample behavior.

---

## 7.3 Research / Validation Engine

Every proposed signal should be evaluated through a common research framework.

Expected capabilities:

```text
historical samples
time-separated train/discovery/test periods
calibration
Brier score
log loss when appropriate
uncertainty / confidence intervals
sample counts
performance by regime
execution-cost simulation
liquidity constraints
live shadow testing
```

A signal should not become user-facing merely because it produced an interesting backtest.

---

## 7.4 Live Monitoring + Alerts

Eventually support rules such as:

```text
Alert when:
estimated edge > threshold
AND liquidity > threshold
AND spread < threshold
AND evidence strength is sufficient
```

Possible future examples:

- statistical-edge alerts
- large cross-venue disagreement
- executable arbitrage
- rapid probability movement
- unusual liquidity / spread changes
- tracked-market threshold crossings

---

## 7.5 Portfolio / Trader Analytics

Eventually track:

```text
P&L
ROI
entry probability
closing probability
signal used
category performance
calibration
performance by time to expiry
performance by entry price
maker / taker behavior
performance versus market baseline
```

This creates the feedback loop:

```text
signal
  ↓
decision / trade
  ↓
outcome
  ↓
performance attribution
  ↓
better research
```

---

## 7.6 Execution — Later

Eventually allow:

```text
edge found
  ↓
review evidence
  ↓
choose position
  ↓
place order
```

Start with manual confirmation.

Do not automate real-money execution until research has demonstrated something worth executing and legal/compliance/product implications have been re-checked.

---

# 8. Current Technical State

Current stack:

```text
TypeScript
Node.js
MySQL 8.4
Docker Desktop / Docker Compose
Polymarket Gamma API
Polymarket CLOB API
DBeaver
Codex
```

Current workflow:

```text
ChatGPT Project
→ architecture decisions
→ data-model decisions
→ API research
→ statistical methodology
→ milestone planning

Codex
→ inspect actual repo
→ implement approved milestone
→ run commands / typechecks
→ update local DB
→ verify implementation
```

Important rule:

> Do not paste the codebase into ChatGPT file-by-file. Codex operates on the repo directly.

---

# 9. Completed Milestone — Durable V0 Live Ingestion

The current live pipeline is:

```text
Polymarket Gamma API
        ↓
fetchMarkets()
        ↓
parseMarket()
        ↓
Event / Market / Snapshot
        ↓
writers.ts
        ↓
Dockerized MySQL
```

Current tables:

```text
events
markets
price_snapshots
ingestion_runs
```

The collector currently:

- requests active/open Gamma markets
- sorts descending by `volume24hr`
- defaults to 100 markets
- supports `npm run ingest -- --limit N`
- upserts event / market metadata
- appends snapshots
- records ingestion provenance

Known limitations:

- no pagination
- no run-wide transaction
- no retries
- crash can leave a run marked `running`
- no resolution synchronization
- no historical-price backfill

These should not be “fixed because they exist.”

Only prioritize them when a concrete next milestone requires them.

---

# 10. Live Data vs Historical Backfill

The project needs **both**.

## Historical API data

Best for:

```text
broad retrospective coverage
resolved markets
historical probability reconstruction
calibration
backtesting
```

## Forward live collection

Best for information that may not be fully reconstructable historically, including:

```text
bid
ask
spread
liquidity
volume
volume_24h
other live market-state fields
```

Therefore the intended system is:

```text
POLYMARKET HISTORICAL APIs
        ↓
broad historical probability dataset

OUR LIVE COLLECTOR
        ↓
richer forward-collected market state

        ↓
combined research foundation
```

The live collector should eventually run automatically.

Architecture principle:

```text
external scheduler
        ↓
one ingestion run
        ↓
record provenance
        ↓
exit
```

Do not turn the ingestion command into an immortal Node timer process.

Before scheduling the current collector indefinitely, fix the market-universe issue: the current “top N by 24h volume” behavior is a biased sample rather than a complete active-market universe.

Pagination becomes justified when needed for systematic market coverage.

---

# 11. V0 Definition — Resume Threshold

## V0 Goal

> **A reproducible TypeScript system that ingests live and historical Polymarket data into MySQL, reconstructs resolved-market probability observations without look-ahead leakage, and produces a statistically defensible calibration analysis of market-implied probabilities.**

V0 does **not** require:

- React
- GraphQL
- users
- cloud deployment
- AI
- ML
- proprietary forecasting
- Kalshi
- automated trading
- authentication
- monetization

---

# 12. V0 Roadmap

## V0.1 — Historical API Reconnaissance

Before schema design or large imports, perform read-only exploration of current official Polymarket APIs.

Must establish:

1. closed historical event discovery
2. pagination and `next_cursor`
3. nested closed-market representation
4. for resolved markets:
   - Gamma market ID
   - event ID
   - condition ID
   - question ID
   - primary token ID and outcome label
   - secondary token ID and outcome label
   - end / closed timestamps
   - Gamma outcome representation
5. strongest explicit CLOB resolution / winner representation
6. representation of 50/50 outcomes
7. `prices-history` behavior for primary-outcome tokens
8. timestamp format and precision
9. duplicates / ordering behavior
10. consistency across several markets
11. which fields are historically reconstructable vs forward-only

**Deliverable:** an evidence report before implementation.

---

## V0.2 — Finalize Historical Data Model

Only after V0.1.

Likely raw historical-price shape may be close to:

```text
market_id
observed_at
primary_price
```

But the API exploration must determine whether source/import/fidelity/provenance fields are needed.

Principle:

> Store enough raw information to reproduce research correctly without creating an unnecessary warehouse.

---

## V0.3 — Continuous Local Live Collection

Add a simple scheduler for forward collection.

Before doing so:

- define the intended active-market universe
- add pagination if needed
- choose a reasonable snapshot cadence
- prevent overlapping runs
- retain one-run ingestion semantics
- document scheduler behavior

Do not introduce Kafka, Redis, Airflow, Kubernetes, workers, or cloud infrastructure.

Local collection does not need perfect uptime yet because missing historical prices can often be backfilled; the main unique value is richer live state.

---

## V0.4 — Historical Importer

Implement a reproducible pipeline:

```text
discover resolved markets
        ↓
determine resolution ground truth
        ↓
identify primary-outcome token
        ↓
retrieve historical primary-outcome prices
        ↓
persist normalized historical observations
```

Success means a meaningful resolved-market sample can be imported reproducibly.

Do not define success as “download all of Polymarket.”

---

## V0.5 — Calibration Observation Methodology

Do **not** treat every historical price observation as an independent prediction.

Primary first methodology:

> **Fixed time-to-resolution horizons.**

Initial candidate horizons:

```text
30 days before resolution
7 days before resolution
1 day before resolution
```

where source data permits.

One market contributes at most one observation per horizon.

Why:

- repeated observations from one market are highly correlated
- markets with long histories should not automatically dominate the sample
- calibration can change with time to resolution
- fixed horizons make the research easier to interpret and defend

Dense historical time series remain useful for later time-series research; they simply should not all be treated as independent calibration samples.

---

## V0.6 — First Calibration Analysis

Produce:

```text
Probability bucket
N markets
Actual primary-outcome frequency
Confidence interval
```

Metrics:

```text
Brier score
log loss when appropriate
calibration / reliability
sample counts
uncertainty
```

Potential first dimensions:

- overall
- time-to-resolution horizon
- probability bucket

Do not immediately slice into dozens of subgroups.

---

# 13. V0 Acceptance Criteria

V0 is complete when the project can reproducibly:

```text
historical import
        ↓
resolved historical dataset
        ↓
fixed-horizon observation construction
        ↓
calibration analysis
        ↓
documented measured results
```

with:

- understood source identities
- explicit outcome ground truth
- no look-ahead leakage
- documented methodology
- reproducible database setup
- reproducible commands
- measured results rather than invented claims

At this point the project belongs on the resume.

**Do not move the V0 finish line.**

---

# 14. Resume Strategy

Put the project on the resume once V0 is defensible.

Then improve the bullet(s) as measured evidence accumulates.

Good future measured facts may include:

- number of markets ingested
- number of historical observations
- number of resolved markets analyzed
- ingestion throughput
- query performance
- calibration metrics
- supported platforms
- number of real users
- alert latency
- validated model / signal improvements over baseline

Never invent:

- scale
- users
- profitability
- performance
- model improvement
- trading returns

The resume story should emphasize:

## SWE depth
- TypeScript / Node
- Dockerized MySQL
- API ingestion
- normalization
- relational design
- idempotency
- provenance
- historical pipelines

## Quantitative / research depth
- calibration
- Brier score
- probability baselines
- time-separated evaluation
- correlated observations
- uncertainty
- leakage prevention

## Engineering judgment
- why market price is the baseline
- why event metadata and snapshots are separate
- why live and historical data are complementary
- why unnecessary infrastructure was avoided
- why backtests are not automatically trading edge

---

# 15. V1 Definition — Usable Edge Platform

## V1 Goal

> Turn the research foundation into a product that surfaces evidence-backed potential opportunities to real users.

V1 introduces the first user-facing product.

---

# 16. V1 Roadmap

## V1.1 — Signal Research Framework

Create a simple common research interface:

```text
market observation
      ↓
candidate signal
      ↓
historical evidence
      ↓
expected advantage
      ↓
uncertainty
```

Initial research questions may include:

- calibration by probability level
- calibration by time to resolution
- calibration by liquidity
- calibration by volume
- category differences
- recent price movement
- spread / liquidity relationships

Do not research dozens of indicators simultaneously.

---

## V1.2 — Signal Promotion Standard

A finding becomes a product signal only after:

```text
hypothesis / discovery
        ↓
predefined rule
        ↓
temporal holdout
        ↓
out-of-sample evaluation
        ↓
spread / fees / slippage
        ↓
liquidity / capacity constraints
        ↓
live shadow test
```

Interesting calibration is not automatically executable edge.

Interesting backtests are not automatically real edge.

---

## V1.3 — User-Facing Application

This is when frontend work becomes justified.

Likely stack:

```text
React
API layer
possibly GraphQL if it solves a concrete frontend/query problem
```

V1 product surfaces:

### Edge Scanner
Rank potential opportunities by evidence and relevance.

### Market Detail
Show:

```text
current probability
price history
liquidity / spread
historical context
signal evidence
comparable markets
uncertainty
```

### Research
Show methodology, calibration, and backtest evidence.

### Watchlist / Alerts
Let users monitor opportunities.

### Paper Portfolio / Journal
Track hypothetical decisions before real execution.

No giant social network.

No AI-first homepage.

No autonomous trading.

---

# 17. V1 Acceptance Criteria

V1 is done when:

- at least one signal or opportunity class has a defensible research basis
- the application exposes useful live market intelligence
- a user can discover and investigate potential opportunities
- methodology is transparent
- alerts / watchlists make the system useful repeatedly
- paper/shadow tracking exists for evaluating real-world usefulness
- real users can use the product without querying MySQL or running scripts

Immediately begin user testing at this stage.

---

# 18. User Growth Path

Start small:

```text
Will
  ↓
prediction-market friends
  ↓
5 active users
  ↓
10
  ↓
25
  ↓
strangers / serious traders
```

The most important product questions are:

```text
Did users come back?

Did the platform surface something they otherwise
would have missed?

Did an Edge Card affect a research or trading decision?

Are alerts useful enough to keep enabled?

Would users care if the product disappeared?
```

Do not optimize for vanity metrics early.

---

# 19. V2 — Cross-Market Intelligence

After Polymarket V1 is useful, add a second venue only if it creates clear value.

Most likely candidate:

```text
Kalshi
```

Core challenge:

> Match economically equivalent contracts across platforms.

A canonical event layer will likely require:

```text
question semantics
resolution rules
expiration
outcome definition
venue-specific details
```

Title similarity alone is insufficient.

This later creates a legitimate AI/NLP opportunity:

- semantic contract matching
- resolution-rule comparison
- mismatch detection
- grounded explanations

Potential V2 opportunity types:

```text
statistical edge
cross-venue disagreement
executable arbitrage
```

---

# 20. Path to Trading With Real Money

Trading profitability must be treated as a research result, not a product assumption.

Required progression:

```text
economic rationale
        ↓
historical discovery
        ↓
locked methodology
        ↓
time-separated out-of-sample evaluation
        ↓
fees / spread / slippage
        ↓
liquidity / capacity
        ↓
live paper / shadow trading
        ↓
small real-money validation
        ↓
continued monitoring
```

Do not jump from:

```text
positive backtest
```

to:

```text
trade real money
```

A system that disproves an apparent edge is still useful.

---

# 21. Monetization Strategy

Monetization is intentionally later, but the roadmap should preserve plausible paths.

## Primary path — Subscription

Users pay for:

```text
edge scanner
advanced alerts
research tools
cross-venue intelligence
portfolio analytics
historical evidence
```

Likely free tier:

```text
basic market discovery
limited research
limited watchlist
```

Likely paid tier:

```text
full edge scanner
real-time alerts
advanced filters
historical context
cross-venue intelligence
portfolio / performance analytics
```

Do not lock pricing until real users demonstrate willingness to pay.

---

## Secondary path — Will's Own Trading

If the platform finds validated opportunities, Will can use it directly.

This can create value even if the SaaS business remains small.

The research standards should be the same whether the “customer” is Will or an outside user.

---

## Later path — Trading Flow / Builder Revenue

Potentially:

- order routing
- builder fees
- referral revenue

Only after execution is justified and current platform rules are re-verified.

Do not build the business around exchange incentive programs because they can change.

---

## Much Later — Data / API

Potential products:

```text
normalized historical datasets
research API
cross-market canonical event data
signal API
```

Only after the platform has proprietary or difficult-to-reproduce value.

---

# 22. AI Strategy

AI is not the core V0 or V1 value proposition.

Use AI only where it provides a measurable advantage.

Good later uses:

```text
contract semantic matching
resolution-rule comparison
news-to-market linking
event extraction
grounded research summaries
market explanation
research assistant
```

Bad use:

```text
LLM guesses a probability
        ↓
difference from market price
        ↓
call it edge
```

Any AI probability model must be evaluated against:

```text
P(event) = market price
```

out of sample.

---

# 23. Infrastructure Strategy

Current philosophy:

> Prefer the simplest understandable architecture that solves the current milestone.

Do not introduce without concrete need:

- Redis
- Kafka
- Airflow
- Kubernetes
- microservices
- vector databases
- cloud infrastructure
- streaming systems
- queues
- separate Python services
- GraphQL
- ML pipelines

These are allowed later when requirements justify them.

Examples of legitimate triggers:

```text
cloud deployment
→ local uptime becomes a real blocker

WebSockets
→ live edge detection requires lower latency

Python
→ statistical / ML tooling provides a real advantage

GraphQL
→ product UI has complex query requirements that REST becomes awkward for

queue / worker
→ jobs become too expensive or unreliable to execute inline
```

---

# 24. Recommended Long-Term Architecture

Conceptually:

```text
                    DATA ENGINE
           Polymarket / Kalshi / external
                        ↓
                HISTORICAL STORE
                        ↓
                 RESEARCH ENGINE
        calibration / experiments / backtests
                        ↓
                   EDGE ENGINE
       statistical + cross-venue + behavioral
                        ↓
                INTELLIGENCE API
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
     Scanner         Alerts          Research
        ↓               ↓               ↓
                Portfolio / Journal
                        ↓
                    Execution
```

This is a direction, not an instruction to build every layer now.

---

# 25. Immediate Roadmap From Today

```text
✅ DEVELOPMENT ENVIRONMENT
Clean reproducible local workflow

✅ DURABLE LIVE INGESTION
Gamma → TypeScript → MySQL
events / markets / snapshots / runs

✅ V0.1 — HISTORICAL API RECONNAISSANCE
Validate resolved-market and historical-price path

✅ TRUSTWORTHY RESOLUTION SYNC
Neutral binary outcomes + explicit CLOB ground truth

▶ V0.2 — HISTORICAL DATA MODEL
Finalize raw historical schema

□ V0.3 — CONTINUOUS LOCAL COLLECTION
Systematic active-market coverage
External scheduler
No overlapping runs

□ V0.4 — HISTORICAL IMPORTER
Resolved markets + outcomes + primary-outcome history

□ V0.5 — OBSERVATION METHODOLOGY
Fixed time-to-resolution horizons

□ V0.6 — CALIBRATION ANALYSIS
Reliability + Brier + uncertainty

──────────── RESUME-WORTHY V0 ────────────

□ V1.1 — SIGNAL RESEARCH FRAMEWORK
Test limited evidence-based hypotheses

□ V1.2 — EXECUTION-AWARE VALIDATION
Holdout + spread + fees + liquidity + shadow test

□ V1.3 — PRODUCT UI
Edge scanner
Market detail
Research
Watchlists / alerts
Paper portfolio

──────────── FIRST REAL USERS ────────────

□ V2 — CROSS-MARKET INTELLIGENCE
Kalshi
Canonical event matching
Cross-venue disagreement
Executable arbitrage analysis

□ VALIDATED LIVE SIGNALS
Shadow trading
Small real-money validation

□ MONETIZATION
Subscription
Potential builder / routing economics
Potential referral economics
Later data/API

□ LONG-TERM
Prediction Market Edge Terminal
```

---

# 26. What Future Chats Should Do

When a new ChatGPT conversation starts, first determine:

1. Which roadmap milestone are we currently on?
2. What is the smallest next deliverable that advances that milestone?
3. Does the proposed work help V0, V1, users, validated edge, or monetization?
4. Is new complexity actually required?
5. Does the proposed research preserve the market-price baseline and avoid leakage?
6. Are we accidentally moving the V0 finish line?

If a proposed feature does not clearly help the current milestone, defer it.

---

# 27. Current Immediate Objective

The current milestone is:

## V0.2 — Finalize Historical Data Model

Immediate sequence:

```text
trustworthy explicit resolution ground truth
        ↓
finalize raw historical price and import-provenance model
        ↓
design statistically defensible calibration observations
        ↓
give Codex one cohesive implementation milestone
```

Historical API reconnaissance established:

- closed-event discovery through Gamma keyset pagination
- explicit CLOB winner and 50/50 ground truth
- positional token and outcome identity
- price-history response shape and Unix-second timestamps
- fidelity and import-provenance requirements

The next implementation should add only the raw historical observation and import-provenance model needed for a bounded importer.

Do not begin frontend work or ML before this is complete.

---

# 28. Research and Product Principles That Should Not Change Casually

1. **Market price is the baseline model.**
2. **No look-ahead leakage.**
3. **Do not treat thousands of correlated observations from one market as independent evidence.**
4. **Interesting miscalibration is not automatically tradable edge.**
5. **Interesting backtests are not automatically live edge.**
6. **Execution costs and liquidity eventually matter.**
7. **Measured results only; never invent resume numbers.**
8. **Build one meaningful milestone at a time.**
9. **Prefer simple systems over premature architecture.**
10. **AI only where it provides a real advantage.**
11. **Frontend only when useful information exists to expose.**
12. **Monetization should follow user value, not precede it.**
13. **Do not move the V0 finish line.**
14. **Use current official API documentation whenever behavior may have changed.**
15. **Re-verify regulatory / exchange-program details before real execution or monetization decisions.**

---

# 29. External Research Basis

The product direction above was informed by:

- current Polymarket official API / WebSocket / Builder documentation
- current Kalshi market-data capabilities
- current prediction-market analytics / tooling landscape
- recent empirical research on calibration, cross-market pricing wedges, trader profitability, and failed high-frequency signal attempts

Important lesson from that research:

> Prediction markets may contain conditional inefficiencies, structural pricing differences, and useful trader/market behavior patterns — but sophisticated-looking models can still fail out of sample.

Therefore the platform's core advantage should be:

> **validated evidence, uncertainty, and execution awareness**

rather than generic market aggregation or unsupported AI forecasts.

Any future decision that depends on current API behavior, pricing, exchange programs, law, or regulation should be re-verified using current sources rather than relying on this document.

---

# 30. One-Sentence Summary

> **Build a rigorous Polymarket data-and-research engine first, turn validated research into an evidence-backed Edge Scanner for real users, expand into cross-market intelligence only after the core product is useful, and monetize only once the platform demonstrably helps traders make better decisions or identifies executable opportunities.**
