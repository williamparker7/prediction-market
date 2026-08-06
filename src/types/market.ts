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
    conditionId: string | null;
    slug: string;
    endDate: string | null;
    active: boolean;
    closed: boolean;
}

export interface Snapshot {
    marketId: string;
    yesPrice: number | null;
    noPrice: number | null;
    bestBid: number | null;
    bestAsk: number | null;
    spread: number | null;
    volume: number | null;
    liquidity: number | null;
    capturedAt: string;
}