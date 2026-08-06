import { pool } from "../db/index.js";
import type { Event, Market, Snapshot } from "../types/market.js";


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
  await pool.execute(
    `INSERT INTO markets
       (id, event_id, question, group_item_title, condition_id,
        slug, start_date, end_date, neg_risk, active, closed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       event_id         = VALUES(event_id),
       question         = VALUES(question),
       group_item_title = VALUES(group_item_title),
       condition_id     = VALUES(condition_id),
       slug             = VALUES(slug),
       start_date       = VALUES(start_date),
       end_date         = VALUES(end_date),
       neg_risk         = VALUES(neg_risk),
       active           = VALUES(active),
       closed           = VALUES(closed)`,
    [
      market.id,
      market.eventId,
      market.question,
      market.groupItemTitle,
      market.conditionId,
      market.slug,
      toMysqlDateTime(market.startDate),
      toMysqlDateTime(market.endDate),
      market.negRisk,
      market.active,
      market.closed,
    ],
  );
}

export async function insertSnapshot(snapshot: Snapshot): Promise<void> {
  await pool.execute(
    `INSERT INTO price_snapshots
       (market_id, yes_price, no_price, last_trade_price,
        best_bid, best_ask, spread, volume, liquidity, captured_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      snapshot.marketId,
      snapshot.yesPrice,
      snapshot.noPrice,
      snapshot.lastTradePrice,
      snapshot.bestBid,
      snapshot.bestAsk,
      snapshot.spread,
      snapshot.volume,
      snapshot.liquidity,
      toMysqlDateTime(snapshot.capturedAt),
    ],
  );
}

// Gamma sends ISO 8601 with a 'Z' (e.g. "2026-08-06T16:15:00Z").
// MySQL DATETIME wants "YYYY-MM-DD HH:MM:SS" — swap the 'T' for a space
// and drop the trailing 'Z' + milliseconds. null stays null.
function toMysqlDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const withoutZ = iso.replace("T", " ").replace("Z", "");
  const [datePart] = withoutZ.split(".");
  return datePart ?? withoutZ;
}