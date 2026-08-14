export interface Event {
  id: string;
  title: string;
  slug: string;
  negRisk: boolean;
}

export interface Market {
  id: string;
  eventId: string;
  conditionId: string;
  questionId: string;
  primaryTokenId: string;
  secondaryTokenId: string;
  primaryOutcome: string;
  secondaryOutcome: string;
  question: string;
  groupItemTitle: string | null;
  slug: string;
  description: string | null;
  resolutionSource: string | null;
  sourceCreatedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  closedAt: string | null;
  negRisk: boolean;
  enableOrderBook: boolean;
  active: boolean;
  closed: boolean;
  primaryPayout: number | null;
  resolvedAt: string | null;
}

export interface Snapshot {
  marketId: string;
  primaryPrice: number | null;
  secondaryPrice: number | null;
  lastTradePrice: number | null;
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
  volume: number | null;
  volume24h: number | null;
  liquidity: number | null;
}

export interface SnapshotInsert extends Snapshot {
  runId: number;
  capturedAt: string;
}

export interface ParsedMarket {
  event: Event;
  market: Market;
  snapshot: Snapshot;
}

export type IngestionRunStatus = "running" | "succeeded" | "failed";

export interface IngestionRun {
  id: number;
  status: IngestionRunStatus;
  requestedLimit: number;
  startedAt: string;
  finishedAt: string | null;
  marketsFetched: number;
  snapshotsWritten: number;
  errorMessage: string | null;
}
