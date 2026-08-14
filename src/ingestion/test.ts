import "dotenv/config";

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

async function run(): Promise<void> {
  const requestedLimit = 20;
  const runId = await createIngestionRun(requestedLimit, new Date().toISOString());
  let snapshotsWritten = 0;

  try {
    const raw = await fetchMarkets(requestedLimit);
    const capturedAt = new Date().toISOString();
    await recordMarketsFetched(runId, raw.length);

    for (const item of raw) {
      const parsed = parseMarket(item);
      await upsertEvent(parsed.event);
      await upsertMarket(parsed.market);
      await insertSnapshot({ ...parsed.snapshot, runId, capturedAt });
      snapshotsWritten += 1;
    }

    await succeedIngestionRun(runId, snapshotsWritten, new Date().toISOString());
    console.log(`wrote ${snapshotsWritten} markets`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await failIngestionRun(
      runId,
      snapshotsWritten,
      message,
      new Date().toISOString(),
    );
    throw error;
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
