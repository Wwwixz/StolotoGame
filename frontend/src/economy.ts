export interface RoomParams {
  places: number;
  price: number;
  fundPercent: number;
  boostPercent: number;
  boostPrice: number;
}

export type Verdict = "good" | "warn" | "risk";

export interface EconomyResult {
  pot: number;
  prizeFund: number;
  systemShare: number;
  baseProb: number;
  boostedProb: number;
  evPlayer: number;
  evBoosted: number;
  boostGain: number;
  boostFairPrice: number;
  evPct: number;
  verdict: Verdict;
  reasons: { tone: Verdict; text: string }[];
}

export function calcEconomy(p: RoomParams): EconomyResult {
  const places = Math.max(2, p.places);
  const pot = places * p.price;
  const prizeFund = Math.round(pot * (p.fundPercent / 100));
  const systemShare = pot - prizeFund;
  const baseProb = 1 / places;
  const boostedProb = Math.min(1, baseProb * (1 + p.boostPercent / 100));
  const evPlayer = Math.round(prizeFund * baseProb - p.price);
  const evBoosted = Math.round(prizeFund * boostedProb - p.price - p.boostPrice);
  const boostGain = evBoosted - evPlayer;
  const boostFairPrice = Math.round(prizeFund * baseProb * (p.boostPercent / 100));
  const evPct = p.price ? evPlayer / p.price : 0;

  const reasons: EconomyResult["reasons"] = [];

  if (p.fundPercent > 95) {
    reasons.push({
      tone: "risk",
      text: `Фонд ${p.fundPercent}% — организатор зарабатывает почти ничего (${fmt(systemShare)} за раунд). Снизь процент фонда`,
    });
  } else if (p.fundPercent < 70) {
    reasons.push({
      tone: "warn",
      text: `Фонд ${p.fundPercent}% — игрок отдаёт больше трети взноса системе, комната может отпугивать`,
    });
  } else {
    reasons.push({
      tone: "good",
      text: `В фонд идёт ${p.fundPercent}% взносов — сбалансированное распределение`,
    });
  }

  if (evPct > -0.05) {
    reasons.push({
      tone: "warn",
      text: "Игрок почти в нуле — комната слишком щедрая. Подними цену входа или снизь фонд",
    });
  } else if (evPct < -0.35) {
    reasons.push({
      tone: "risk",
      text: `Ожидание игрока ${Math.round(evPct * 100)}% от цены входа — слишком жадно, комната непривлекательна`,
    });
  } else {
    reasons.push({
      tone: "good",
      text: `Ожидание игрока ${Math.round(evPct * 100)}% от цены входа — игрок платит за эмоцию, комната привлекательна`,
    });
  }

  if (boostGain > 0) {
    reasons.push({
      tone: "risk",
      text: `Буст повышает ожидание игрока на ${fmt(boostGain)} — организатор теряет на нём. Подними цену буста выше ${fmt(p.boostPrice + boostGain)}`,
    });
  } else if (p.boostPrice > boostFairPrice * 1.5) {
    reasons.push({
      tone: "warn",
      text: `Буст стоит ${fmt(p.boostPrice)} при справедливой цене ≈${fmt(boostFairPrice)} — игроки вряд ли будут его покупать`,
    });
  } else {
    reasons.push({
      tone: "good",
      text: `Буст по справедливой цене: система зарабатывает ${fmt(p.boostPrice)} с каждой покупки`,
    });
  }

  const verdict: Verdict = reasons.some((r) => r.tone === "risk")
    ? "risk"
    : reasons.some((r) => r.tone === "warn")
      ? "warn"
      : "good";

  return {
    pot,
    prizeFund,
    systemShare,
    baseProb,
    boostedProb,
    evPlayer,
    evBoosted,
    boostGain,
    boostFairPrice,
    evPct,
    verdict,
    reasons,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}
