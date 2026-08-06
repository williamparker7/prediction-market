
const GAMMA_MARKETS_URL = "https://gamma-api.polymarket.com/markets"

export type RawMarket = Record<string, unknown>;

export async function fetchMarkets(limit = 100): Promise<RawMarket[]> {
  const params = new URLSearchParams({
    active: "true",
    closed: "false",
    limit: String(limit),
    order: "volume24hr", //liquid markets
    ascending: "false",
  });

  const response = await fetch(`${GAMMA_MARKETS_URL}?${params}`);
  if (!response.ok) {
    throw new Error('Gamma markets failed')
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Gamma markets did not return an arr");
  }
  return data as RawMarket[];

}


