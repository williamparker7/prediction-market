import { fetchMarkets } from "./fetchMarkets.js";
import { parseMarket } from "./parseMarket.js";
import {
  createIngestionRun,
  failIngestionRun,
  insertSnapshot,
  recordMarketsFetched,
  succeedIngestionRun,
  upsertEvent,
  upsertMarket,
} from "./writers.js";
import type { Event } from "../types/market.js";

function parseLimit(args: string[]): number {
  const limitIndex = args.indexOf("--limit");
  if (limitIndex === -1) return 100;

  const value = args[limitIndex + 1];
  if (value === undefined || !/^[1-9]\d*$/.test(value)) {
    throw new Error("--limit must be followed by a positive integer");
  }

  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit > 4_294_967_295) {
    throw new Error("--limit must be followed by a positive integer");
  }
  return limit;
}

async function ingest(): Promise<void> {
  const limit = parseLimit(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const runId = await createIngestionRun(limit, startedAt);
  let snapshotsWritten = 0;

  try {
    const raw = await fetchMarkets(limit);
    const capturedAt = new Date().toISOString();
    console.log(`fetched ${raw.length} markets`);
    await recordMarketsFetched(runId, raw.length);

    const parsed = raw.map(parseMarket);

    const events = new Map<string, Event>();
    for (const item of parsed) {
      events.set(item.event.id, item.event);
    }

    for (const event of events.values()) {
      await upsertEvent(event);
    }
    for (const item of parsed) {
      await upsertMarket(item.market);
    }
    for (const item of parsed) {
      await insertSnapshot({ ...item.snapshot, runId, capturedAt });
      snapshotsWritten += 1;
    }

    await succeedIngestionRun(runId, snapshotsWritten, new Date().toISOString());
    console.log(
      `wrote ${events.size} events, ${parsed.length} markets, ${snapshotsWritten} snapshots ` +
      `@ ${capturedAt}`,
    );
  } catch (error: unknown) {
    try {
      await failIngestionRun(
        runId,
        snapshotsWritten,
        errorMessage(error),
        new Date().toISOString(),
      );
    } catch (runError: unknown) {
      console.error("failed to mark ingestion run as failed:", runError);
    }
    throw error;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

ingest()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("ingest failed:", err);
    process.exit(1);
  });
