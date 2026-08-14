import type { Market } from "../types/market.js";

export type PrimaryPayout = 0 | 0.5 | 1;

export type ResolutionResult =
  | { primaryPayout: PrimaryPayout; reason: null }
  | { primaryPayout: null; reason: string };

export function deriveResolution(
  raw: unknown,
  market: Market,
): ResolutionResult {
  if (!isRecord(raw)) return unresolved("invalid CLOB market response");
  if (raw.condition_id !== market.conditionId) {
    return unresolved("CLOB condition ID does not match Gamma");
  }
  if (raw.closed !== true) return unresolved("CLOB market is not closed");
  if (!Array.isArray(raw.tokens) || raw.tokens.length !== 2) {
    return unresolved("CLOB market does not contain exactly two tokens");
  }

  const tokens = raw.tokens.filter(isRecord);
  if (tokens.length !== 2) return unresolved("CLOB token data is invalid");

  const tokenIds = tokens.map((token) => token.token_id);
  if (
    !tokenIds.includes(market.primaryTokenId) ||
    !tokenIds.includes(market.secondaryTokenId)
  ) {
    return unresolved("CLOB token IDs do not match stored token IDs");
  }

  if (raw.is_50_50_outcome === true) {
    return { primaryPayout: 0.5, reason: null };
  }

  const winners = tokens.filter((token) => token.winner === true);
  if (winners.length !== 1) {
    return unresolved("CLOB market does not have exactly one winner");
  }

  const winnerId = winners[0]?.token_id;
  if (winnerId === market.primaryTokenId) {
    return { primaryPayout: 1, reason: null };
  }
  if (winnerId === market.secondaryTokenId) {
    return { primaryPayout: 0, reason: null };
  }
  return unresolved("CLOB winner does not match a stored token ID");
}

function unresolved(reason: string): ResolutionResult {
  return { primaryPayout: null, reason };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
