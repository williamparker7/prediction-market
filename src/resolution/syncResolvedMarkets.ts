import { parseMarket } from "../ingestion/parseMarket.js";
import {
  setMarketPrimaryPayout,
  upsertEvent,
  upsertMarket,
} from "../ingestion/writers.js";
import { deriveResolution } from "./deriveResolution.js";
import { fetchClobMarket } from "./fetchClobMarket.js";
import { fetchClosedEvents } from "./fetchClosedEvents.js";

interface Options {
  limit: number;
  endDateMax: string | null;
}

async function syncResolvedMarkets(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const page = await fetchClosedEvents(options.limit, options.endDateMax);
  let marketsInspected = 0;
  let marketsResolved = 0;
  let marketsUnresolved = 0;

  for (const rawEvent of page.events) {
    const nestedMarkets = rawEvent.markets;
    if (!Array.isArray(nestedMarkets)) {
      throw new Error(`Gamma event ${String(rawEvent.id)} has no markets array`);
    }

    for (const rawMarket of nestedMarkets) {
      if (marketsInspected >= options.limit) break;
      if (!isRecord(rawMarket)) {
        throw new Error(`Gamma event ${String(rawEvent.id)} has an invalid market`);
      }

      const parsed = parseMarket({ ...rawMarket, events: [rawEvent] });
      await upsertEvent(parsed.event);
      await upsertMarket(parsed.market);
      marketsInspected += 1;

      const clobMarket = await fetchClobMarket(parsed.market.conditionId);
      const resolution = deriveResolution(clobMarket, parsed.market);
      if (resolution.primaryPayout === null) {
        marketsUnresolved += 1;
        console.log(
          `left market ${parsed.market.id} unresolved: ${resolution.reason}`,
        );
        continue;
      }

      await setMarketPrimaryPayout(
        parsed.market.id,
        resolution.primaryPayout,
      );
      marketsResolved += 1;
      console.log(
        `resolved market ${parsed.market.id}: primary_payout=${resolution.primaryPayout}`,
      );
    }

    if (marketsInspected >= options.limit) break;
  }

  console.log(
    `fetched ${page.events.length} events; inspected ${marketsInspected} markets; ` +
    `resolved ${marketsResolved}; left ${marketsUnresolved} unresolved; ` +
    `next_cursor=${page.nextCursor === null ? "absent" : "present"}`,
  );
}

function parseOptions(args: string[]): Options {
  const limit = parsePositiveIntegerFlag(args, "--limit", 5);
  if (limit > 500) throw new Error("--limit must be at most 500");

  const endDateIndex = args.indexOf("--end-date-max");
  if (endDateIndex === -1) return { limit, endDateMax: null };

  const endDateMax = args[endDateIndex + 1];
  if (endDateMax === undefined || Number.isNaN(Date.parse(endDateMax))) {
    throw new Error("--end-date-max must be followed by an ISO timestamp");
  }
  return { limit, endDateMax };
}

function parsePositiveIntegerFlag(
  args: string[],
  flag: string,
  defaultValue: number,
): number {
  const index = args.indexOf(flag);
  if (index === -1) return defaultValue;

  const value = args[index + 1];
  if (value === undefined || !/^[1-9]\d*$/.test(value)) {
    throw new Error(`${flag} must be followed by a positive integer`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${flag} must be followed by a positive integer`);
  }
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

syncResolvedMarkets().catch((error: unknown) => {
  console.error("resolution sync failed:", error);
  process.exit(1);
});
