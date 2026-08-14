const GAMMA_EVENTS_KEYSET_URL = "https://gamma-api.polymarket.com/events/keyset";

export type RawEvent = Record<string, unknown>;

export interface ClosedEventsPage {
  events: RawEvent[];
  nextCursor: string | null;
}

export async function fetchClosedEvents(
  limit: number,
  endDateMax: string | null,
): Promise<ClosedEventsPage> {
  const params = new URLSearchParams({
    closed: "true",
    limit: String(limit),
    order: "closedTime",
    ascending: "false",
  });
  if (endDateMax !== null) params.set("end_date_max", endDateMax);

  const response = await fetch(`${GAMMA_EVENTS_KEYSET_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Gamma closed events failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isRecord(data) || !Array.isArray(data.events)) {
    throw new Error("Gamma closed events returned an invalid page");
  }
  if (
    data.next_cursor !== undefined &&
    typeof data.next_cursor !== "string"
  ) {
    throw new Error("Gamma closed events returned an invalid next_cursor");
  }

  return {
    events: data.events.filter(isRecord),
    nextCursor: typeof data.next_cursor === "string" ? data.next_cursor : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
