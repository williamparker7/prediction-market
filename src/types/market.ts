export interface Event {
  id: string;
  title: string;
  slug: string;
  negRisk: boolean;
}

export interface Market {
  id: string;
  eventId: string;
  question: string;
  groupItemTitle: string | null; // candidate/outcome label ("Gavin Newsom"); null on binary events
  conditionId: string | null;
  slug: string;
  startDate: string | null;
  endDate: string | null;
  negRisk: boolean;              // market-level flag; event.negRisk is authoritative for the set
  active: boolean;
  closed: boolean;
}

export interface Snapshot {
  marketId: string;
  yesPrice: number | null;
  noPrice: number | null;
  lastTradePrice: number | null;
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
  volume: number | null;
  liquidity: number | null;
  capturedAt: string;           // one shared value per ingestion run, set by US at fetch time
}

export interface ParsedMarket {
  event: Event;
  market: Market;
  snapshot: Snapshot;
}


export interface IngestionRun {
  id: number;                   // auto-increment, DB-assigned
  startedAt: string;
  finishedAt: string | null;
  marketsFetched: number;
  marketsWritten: number;
  errorCount: number;
}