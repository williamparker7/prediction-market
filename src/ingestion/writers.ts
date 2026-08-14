import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { pool } from "../db/index.js";
import type { Event, Market, SnapshotInsert } from "../types/market.js";

export async function upsertEvent(event: Event): Promise<void> {
  await pool.execute(
    `INSERT INTO events (id, title, slug, neg_risk)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title    = VALUES(title),
       slug     = VALUES(slug),
       neg_risk = VALUES(neg_risk)`,
    [event.id, event.title, event.slug, event.negRisk],
  );
}

export async function upsertMarket(market: Market): Promise<void> {
  const values = marketValues(market);
  const [updateResult] = await pool.execute<ResultSetHeader>(
    `UPDATE markets SET
       event_id          = ?,
       condition_id      = ?,
       question_id       = ?,
       yes_token_id      = ?,
       no_token_id       = ?,
       question          = ?,
       group_item_title  = ?,
       slug              = ?,
       description       = ?,
       resolution_source = ?,
       source_created_at = ?,
       start_date        = ?,
       end_date          = ?,
       closed_at         = ?,
       neg_risk          = ?,
       enable_order_book = ?,
       active            = ?,
       closed            = ?
     WHERE id = ?`,
    [...values.slice(1, 19), market.id],
  );

  if (updateResult.affectedRows > 0 || await marketExists(market.id)) return;

  await pool.execute(
    `INSERT INTO markets
       (id, event_id, condition_id, question_id, yes_token_id, no_token_id,
        question, group_item_title, slug, description, resolution_source,
        source_created_at, start_date, end_date, closed_at, neg_risk,
        enable_order_book, active, closed, yes_payout, resolved_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
  );
}

export async function createIngestionRun(
  requestedLimit: number,
  startedAt: string,
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO ingestion_runs (status, requested_limit, started_at)
     VALUES ('running', ?, ?)`,
    [requestedLimit, toMysqlDateTime(startedAt)],
  );
  return result.insertId;
}

export async function recordMarketsFetched(
  runId: number,
  marketsFetched: number,
): Promise<void> {
  await pool.execute(
    `UPDATE ingestion_runs SET markets_fetched = ? WHERE id = ?`,
    [marketsFetched, runId],
  );
}

export async function succeedIngestionRun(
  runId: number,
  snapshotsWritten: number,
  finishedAt: string,
): Promise<void> {
  await pool.execute(
    `UPDATE ingestion_runs
     SET status = 'succeeded', snapshots_written = ?, finished_at = ?
     WHERE id = ?`,
    [snapshotsWritten, toMysqlDateTime(finishedAt), runId],
  );
}

export async function failIngestionRun(
  runId: number,
  snapshotsWritten: number,
  errorMessage: string,
  finishedAt: string,
): Promise<void> {
  await pool.execute(
    `UPDATE ingestion_runs
     SET status = 'failed', snapshots_written = ?, error_message = ?, finished_at = ?
     WHERE id = ?`,
    [
      snapshotsWritten,
      errorMessage,
      toMysqlDateTime(finishedAt),
      runId,
    ],
  );
}

export async function insertSnapshot(snapshot: SnapshotInsert): Promise<void> {
  await pool.execute(
    `INSERT INTO price_snapshots
       (run_id, market_id, yes_price, no_price, last_trade_price,
        best_bid, best_ask, spread, volume, volume_24h, liquidity, captured_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      snapshot.runId,
      snapshot.marketId,
      snapshot.yesPrice,
      snapshot.noPrice,
      snapshot.lastTradePrice,
      snapshot.bestBid,
      snapshot.bestAsk,
      snapshot.spread,
      snapshot.volume,
      snapshot.volume24h,
      snapshot.liquidity,
      toMysqlDateTime(snapshot.capturedAt),
    ],
  );
}

function marketValues(market: Market): Array<string | number | boolean | null> {
  return [
    market.id,
    market.eventId,
    market.conditionId,
    market.questionId,
    market.yesTokenId,
    market.noTokenId,
    market.question,
    market.groupItemTitle,
    market.slug,
    market.description,
    market.resolutionSource,
    toMysqlDateTime(market.sourceCreatedAt),
    toMysqlDateTime(market.startDate),
    toMysqlDateTime(market.endDate),
    toMysqlDateTime(market.closedAt),
    market.negRisk,
    market.enableOrderBook,
    market.active,
    market.closed,
    market.yesPayout,
    toMysqlDateTime(market.resolvedAt),
  ];
}

async function marketExists(marketId: string): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM markets WHERE id = ? LIMIT 1`,
    [marketId],
  );
  return rows.length > 0;
}

// Gamma and application timestamps are UTC ISO 8601 strings. MySQL DATETIME(6)
// stores no timezone, so remove the UTC marker but retain fractional seconds.
function toMysqlDateTime(iso: string | null): string | null {
  if (!iso) return null;
  return iso.replace("T", " ").replace(/Z$/, "");
}
