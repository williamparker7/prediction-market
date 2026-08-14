const CLOB_MARKETS_URL = "https://clob.polymarket.com/markets";

export async function fetchClobMarket(conditionId: string): Promise<unknown> {
  const response = await fetch(
    `${CLOB_MARKETS_URL}/${encodeURIComponent(conditionId)}`,
  );
  if (!response.ok) {
    throw new Error(
      `CLOB market ${conditionId} failed with status ${response.status}`,
    );
  }
  return response.json();
}
