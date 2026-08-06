import { fetchMarkets } from "./fetchMarkets.js";
import { parseMarket } from "./parseMarket.js";

async function run() {
  const raw = await fetchMarkets(20);
  for (const m of raw) {
    const p = parseMarket(m);
    const sum = (p.snapshot.yesPrice ?? 0) + (p.snapshot.noPrice ?? 0);
    console.log(
      `${p.market.id} | yes=${p.snapshot.yesPrice} no=${p.snapshot.noPrice} ` +
      `sum=${sum.toFixed(4)} bid=${p.snapshot.bestBid} grp=${p.market.groupItemTitle}`,
    );
  }
}

run();