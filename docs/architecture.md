# Prediction Market Edge Platform — Architecture

## Current stack

- TypeScript
- Node.js
- MySQL 8.4
- Docker Compose / Docker Desktop
- Polymarket Gamma API
- DBeaver for local DB inspection

## Current runtime architecture

```text
TypeScript application on macOS
    ↓
localhost:3306
    ↓
Docker Desktop
    ↓
MySQL 8.4
    ↓
persistent named Docker volume
```

## Current ingestion flow

```text
Polymarket Gamma GET /markets
    ↓
fetchMarkets()
    ↓
parseMarket()
    ↓
Event / Market / Snapshot
    ↓
writers.ts
    ↓
MySQL
```

Ingestion currently requests markets with `active=true` and `closed=false`. The default limit is 100, and the CLI supports `--limit <positive integer>`. Results are sorted by `volume24hr` in descending order, with no pagination currently implemented.

Events and markets are upserted by their Polymarket IDs, while price snapshots are append-only across ingestion runs. One post-fetch `capturedAt` value is shared across a run. Each snapshot belongs to an `ingestion_runs` row, and the pair `(run_id, market_id)` is unique.

There is no run-wide database transaction. A write-phase failure can therefore leave partial committed data; the run records its failed status, error, and successfully written snapshot count. The current collector does not yet populate resolved outcomes or other ground truth.

## Durable V0 data model

### Events

Events store the Polymarket event `id`, `title`, `slug`, and `neg_risk`. The Polymarket event ID is authoritative. Slug is indexed for lookup but is not unique and is not an alternative upsert identity. Database-local creation and update timestamps are not stored because they do not describe source lifecycle.

### Markets

Markets preserve the identities needed to join Gamma, CTF, and CLOB data: Gamma market `id`, `event_id`, CTF `condition_id`, Polymarket `question_id`, and the YES and NO CLOB token IDs. They also store `question`, `group_item_title`, `slug`, `description`, `resolution_source`, source-supplied creation/start/end/closed timestamps, `neg_risk`, `enable_order_book`, `active`, and `closed`.

`yes_payout` is nullable ground truth: `NULL` means unresolved or unknown, `1.0` means YES, `0.0` means NO, and `0.5` means a documented 50/50 resolution. `resolved_at` is separately nullable and is never inferred from `end_date`. Populating resolution data is a future milestone.

### Price snapshots

Each snapshot stores its ingestion `run_id`, `market_id`, YES/NO prices, last trade price, best bid/ask, spread, cumulative volume, 24-hour volume, liquidity, and `captured_at`. A market can have many snapshots across runs but only one per run, enforced by `UNIQUE(run_id, market_id)`. Foreign keys preserve run and market provenance, while indexes support market-time and capture-time queries.

### Ingestion runs

An ingestion run stores `status` (`running`, `succeeded`, or `failed`), `requested_limit`, microsecond-precision start/finish timestamps, `markets_fetched`, `snapshots_written`, and a nullable `error_message`. It is created as running before the fetch, updated with the fetch count, and completed after writes. A failed run retains partial committed writes and an accurate successful snapshot count because transactions are intentionally outside this milestone.

### Timestamp semantics

All timestamps represent UTC, although MySQL `DATETIME` has no timezone metadata. `started_at` is captured immediately before work begins, snapshot `captured_at` immediately after Gamma returns and before parsing/writing, and `finished_at` during success or failure completion. Fractional seconds are preserved in `DATETIME(6)` columns.

## Local workflow

- `docker compose up -d` starts the local database.
- `docker compose stop` stops it without removing its persistent volume.
- `npm run check-db` checks database connectivity.
- `npm run typecheck` checks the TypeScript project without emitting files.
- `npm run explore` performs read-only API exploration.
- `npm run ingest -- --limit N` fetches and writes market data.
- Do not casually use `docker compose down -v`; it removes the persistent database volume.

## Architecture principles

- Build the data foundation before a frontend.
- Keep metadata separate from historical observations.
- Preserve stable identifiers supplied by external systems.
- Use database constraints to enforce real invariants.
- Do not store API fields merely because they exist.
- Add fields when needed for identification, provenance, lifecycle or ground truth, or near-term analysis.

## Next architecture milestone

After validating the durable V0 ingestion model, the next architecture milestone is resolution and historical data collection for calibration analysis.
