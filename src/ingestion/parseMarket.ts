import type { Event, Market, ParsedMarket, Snapshot } from "../types/market.js";
import type { RawMarket } from "./fetchMarkets.js";

export function parseMarket(raw: RawMarket): ParsedMarket {
  const marketId = requiredString(raw.id, "market id");
  const events = raw.events as unknown[] | undefined;
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error(`Market ${marketId} has no event`);
  }

  const rawEvent = events[0];
  if (!isRecord(rawEvent)) {
    throw new Error(`Market ${marketId} has an invalid event`);
  }

  const event: Event = {
    id: requiredString(rawEvent.id, `market ${marketId} event id`),
    title: requiredString(rawEvent.title, `market ${marketId} event title`),
    slug: requiredString(rawEvent.slug, `market ${marketId} event slug`),
    negRisk: optionalBoolean(rawEvent.negRisk) ?? false,
  };

  const tokenIds = parseRequiredPair(raw.clobTokenIds, marketId, "clobTokenIds");
  const prices = parseOptionalPair(raw.outcomePrices);

  const market: Market = {
    id: marketId,
    eventId: event.id,
    conditionId: requiredString(raw.conditionId, `market ${marketId} conditionId`),
    questionId: requiredString(raw.questionID, `market ${marketId} questionID`),
    yesTokenId: tokenIds[0],
    noTokenId: tokenIds[1],
    question: requiredString(raw.question, `market ${marketId} question`),
    groupItemTitle: optionalString(raw.groupItemTitle),
    slug: requiredString(raw.slug, `market ${marketId} slug`),
    description: optionalString(raw.description),
    resolutionSource: optionalString(raw.resolutionSource),
    sourceCreatedAt: optionalString(raw.createdAt),
    startDate: optionalString(raw.startDate),
    endDate: optionalString(raw.endDate),
    closedAt: optionalString(raw.closedTime),
    negRisk: requiredBoolean(raw.negRisk, `market ${marketId} negRisk`),
    enableOrderBook: requiredBoolean(
      raw.enableOrderBook,
      `market ${marketId} enableOrderBook`,
    ),
    active: requiredBoolean(raw.active, `market ${marketId} active`),
    closed: requiredBoolean(raw.closed, `market ${marketId} closed`),
    yesPayout: null,
    resolvedAt: null,
  };

  const snapshot: Snapshot = {
    marketId,
    yesPrice: prices === null ? null : toNumOrNull(prices[0]),
    noPrice: prices === null ? null : toNumOrNull(prices[1]),
    lastTradePrice: toNumOrNull(raw.lastTradePrice),
    bestBid: toNumOrNull(raw.bestBid),
    bestAsk: toNumOrNull(raw.bestAsk),
    spread: toNumOrNull(raw.spread),
    volume: toNumOrNull(raw.volume),
    volume24h: toNumOrNull(raw.volume24hr),
    liquidity: toNumOrNull(raw.liquidity),
  };

  return { event, market, snapshot };
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be a boolean`);
  }
  return value;
}

function optionalBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function toNumOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseRequiredPair(
  value: unknown,
  marketId: string,
  field: string,
): [string, string] {
  const values = parseStringArray(value);
  if (
    values === null ||
    values.length !== 2 ||
    values.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    throw new Error(`Market ${marketId} ${field} must contain exactly two IDs`);
  }
  return [values[0] as string, values[1] as string];
}

function parseOptionalPair(value: unknown): [unknown, unknown] | null {
  const values = parseStringArray(value);
  return values !== null && values.length === 2
    ? [values[0], values[1]]
    : null;
}

function parseStringArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
