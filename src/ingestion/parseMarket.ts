import type { ParsedMarket, Event, Snapshot, Market } from "../types/market.js";
import type { RawMarket } from "./fetchMarkets.js";

export function parseMarket(raw: RawMarket): ParsedMarket {
    const events = raw.events as unknown[] | undefined;
    if (!Array.isArray(events) || events.length === 0) {
        throw new Error(`Market ${String(raw.id)} has no event`);
    }
    const rawEvent = events[0] as Record<string, unknown>;

    const event: Event = {
        id: String(rawEvent.id),
        title: String(rawEvent.title),
        slug: String(rawEvent.slug),
        negRisk: Boolean(rawEvent.negRisk),
    };

     const market: Market = {
    id: String(raw.id),
    eventId: event.id,
    question: String(raw.question),
    // '' -> null ('' means "no label", which is what null means)
    groupItemTitle: raw.groupItemTitle ? String(raw.groupItemTitle) : null,
    conditionId: raw.conditionId ? String(raw.conditionId) : null,
    slug: String(raw.slug),
    startDate: raw.startDate ? String(raw.startDate) : null,
    endDate: raw.endDate ? String(raw.endDate) : null,
    negRisk: Boolean(raw.negRisk),
    active: Boolean(raw.active),
    closed: Boolean(raw.closed),
  };

  // Positional: [0] = first outcome, [1] = second. NOT always Yes/No
  // (esports markets use team names) — index, don't match on label.
  const prices = parseStringifiedArray(raw.outcomePrices);
  const hasPrices = prices !== null && prices.length === 2;

  const snapshot: Snapshot = {
    marketId: market.id,
    yesPrice: hasPrices ? toNumOrNull(prices[0]) : null,
    noPrice: hasPrices ? toNumOrNull(prices[1]) : null,
    lastTradePrice: toNumOrNull(raw.lastTradePrice),
    bestBid: toNumOrNull(raw.bestBid), // absent on some markets -> must land as null
    bestAsk: toNumOrNull(raw.bestAsk),
    spread: toNumOrNull(raw.spread),
    volume: toNumOrNull(raw.volume),
    liquidity: toNumOrNull(raw.liquidity),
    capturedAt: "", //ingested later
  };

  return { event, market, snapshot };
}

function toNumOrNull(value: unknown): number | null {
    if (value === null || value === undefined) {
        return null;
    }
    const number = Number(value);
    if (Number.isNaN(number)) {
        return null;
    }
    return number;
}

function parseStringifiedArray(value: unknown): string[] | null {
    if (typeof value !== "string") {
        return null;
    }
    try {
        const json = JSON.parse(value);
        if (!Array.isArray(json)) {
            return null;
        }
        return json as string[];
    } catch {
        return null;
    }
}
