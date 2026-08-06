import { fetchMarkets } from "./fetchMarkets.js";
import { parseMarket } from "./parseMarket.js";
import { upsertEvent, upsertMarket, insertSnapshot } from "./writers.js";
import type { Event } from "../types/market.js";

async function ingest(): Promise<void> {
  // One timestamp for the whole run — every snapshot from this run shares it.
  // This is the coordinated-snapshot design: "all markets, as of this instant."
  const capturedAt = new Date().toISOString();

  // 1. Fetch a page of live markets.
  const raw = await fetchMarkets(100);
  console.log(`fetched ${raw.length} markets`);

  // 2. Parse all of them.
  const parsed = raw.map(parseMarket);

  // 3. Dedupe events — the same event rides on many markets (the Democratic
  //    field emits event 30829 on every candidate). Write each event once.
  const events = new Map<string, Event>();
  for (const p of parsed) {
    events.set(p.event.id, p.event); // last write wins; events are identical anyway
  }

  // 4. Write in FK order: events -> markets -> snapshots.
  //    A market's event_id needs its event to exist first;
  //    a snapshot's market_id needs its market first.
  for (const event of events.values()) {
    await upsertEvent(event);
  }
  for (const p of parsed) {
    await upsertMarket(p.market);
  }
  for (const p of parsed) {
    await insertSnapshot({ ...p.snapshot, capturedAt });
  }

  console.log(
    `wrote ${events.size} events, ${parsed.length} markets, ${parsed.length} snapshots ` +
    `@ ${capturedAt}`,
  );
}

ingest()
  .then(() => process.exit(0))   // pools keep the process alive; exit cleanly
  .catch((err: unknown) => {
    console.error("ingest failed:", err);
    process.exit(1);
  });