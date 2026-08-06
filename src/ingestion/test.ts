import "dotenv/config";

import { fetchMarkets } from "./fetchMarkets.js";
import { parseMarket } from "./parseMarket.js";
import { insertSnapshot, upsertEvent, upsertMarket } from "./writers.js";


async function run() {
  const raw = await fetchMarkets(20);
  for (const m of raw) {
    const p = parseMarket(m);
    await upsertEvent(p.event);
    await upsertMarket(p.market);        // must come after the event (FK order)
    await insertSnapshot({ ...p.snapshot, capturedAt: new Date().toISOString() });
    console.log("wrote one market — check DBeaver");    
    const sum = (p.snapshot.yesPrice ?? 0) + (p.snapshot.noPrice ?? 0);
    console.log(
      `${p.market.id} | yes=${p.snapshot.yesPrice} no=${p.snapshot.noPrice} ` +
      `sum=${sum.toFixed(4)} bid=${p.snapshot.bestBid} grp=${p.market.groupItemTitle}`,
    );
  }
}

run();