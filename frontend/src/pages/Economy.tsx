import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { fmt } from "../data";
import type { EconomyAnalysis, RoomParams, SystemStats } from "../types";
import { AdminTabs } from "../components/admin";
import { Coin, Icon, Stat } from "../components/ui";

type Verdict = "good" | "warn" | "risk";

const VERDICT_META: Record<Verdict, { icon: "shield" | "warn"; title: string; cls: string }> = {
  good: { icon: "shield", title: "Сбалансированная конфигурация", cls: "good" },
  warn: { icon: "warn", title: "Конфигурация с рисками", cls: "warn" },
  risk: { icon: "warn", title: "Невыгодная конфигурация", cls: "risk" },
};

const VERDICT_TAG: Record<string, string> = {
  good: "Сбалансировано",
  warn: "Рискованно",
  risk: "Невыгодно",
  BLOCK: "Запрещено",
};

const DEFAULTS: RoomParams = { places: 10, price: 100, fundPercent: 85, boostPercent: 25, boostPrice: 50 };

/** Расчёты те же, что в EconomyService бэкенда — страница интерактивная, бэкенд проверяет при сохранении. */
function calcEconomy(p: RoomParams) {
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
  return { pot, prizeFund, systemShare, baseProb, boostedProb, evPlayer, boostGain, boostFairPrice, evPct };
}

export default function Economy() {
  const [p, setP] = useState<RoomParams>({ ...DEFAULTS });
  const res = useMemo(() => calcEconomy(p), [p]);
  const [compare, setCompare] = useState<{ room: { id: number; title: string; seats: number }; analysis: EconomyAnalysis }[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    api.compare().then(setCompare).catch(() => setCompare([]));
    api.systemStats().then(setStats).catch(() => undefined);
  }, []);

  const set = (key: keyof RoomParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP((prev) => ({ ...prev, [key]: Number(e.target.value) }));

  const verdict: Verdict =
    res.evPct > -0.05 || p.fundPercent > 95 ? "risk" : p.fundPercent < 70 || res.boostGain > 0 || res.evPct < -0.35 ? "warn" : "good";
  const meta = VERDICT_META[verdict];

  const reasons: { tone: Verdict; text: string }[] = [
    p.fundPercent > 95
      ? { tone: "risk", text: `Фонд ${p.fundPercent}% — организатор зарабатывает почти ничего (${fmt(res.systemShare)} за раунд)` }
      : p.fundPercent < 70
        ? { tone: "warn", text: `Фонд ${p.fundPercent}% — игрок отдаёт больше трети взноса системе` }
        : { tone: "good", text: `В фонд идёт ${p.fundPercent}% взносов — сбалансированное распределение` },
    res.evPct > -0.05
      ? { tone: "risk", text: "Игрок почти в нуле — комната слишком щедрая, это неконтролируемый рост обязательств" }
      : res.evPct < -0.35
        ? { tone: "warn", text: `Ожидание игрока ${Math.round(res.evPct * 100)}% от цены входа — слишком жадно` }
        : { tone: "good", text: `Ожидание игрока ${Math.round(res.evPct * 100)}% от цены входа — здоровая экономика` },
    res.boostGain > 0
      ? { tone: "risk", text: `Буст повышает ожидание игрока на ${fmt(res.boostGain)} — поднимите цену буста выше ${fmt(p.boostPrice + res.boostGain)}` }
      : { tone: "good", text: `Буст не убыточен: справедливая цена до ${fmt(res.boostFairPrice)}` },
  ];

  return (
    <>
      <h1 className="page-title">Анализ экономики</h1>
      <AdminTabs active="economy" />

      {stats && (
        <div className="stat-row" style={{ marginBottom: 16 }}>
          <Stat icon={<Icon name="gamepad" />} value={String(stats.roundsPlayed)} label="раундов сыграно" />
          <Stat icon={<Coin />} value={fmt(stats.totalFund)} label="оборот баллов" tone="gold" />
          <Stat icon={<Icon name="trophy" />} value={fmt(stats.totalPayouts)} label="выплачено игрокам" tone="red" />
          <Stat icon={<Icon name="wallet" />} value={fmt(stats.systemIncome)} label="доход системы" tone="green" />
        </div>
      )}

      <div className={`verdict ${meta.cls}`}>
        <span className="v-ico">
          <Icon name={meta.icon} size={22} />
        </span>
        <div>
          <b>{meta.title}</b>
          <ul>
            {reasons.map((r, i) => (
              <li key={i}>
                <Icon name={r.tone === "good" ? "check" : "warn"} size={14} />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="stat-row" style={{ margin: "16px 0" }}>
        <Stat icon={<Coin />} value={fmt(res.pot)} label="взносы за раунд" tone="gold" />
        <Stat icon={<Icon name="trophy" />} value={fmt(res.prizeFund)} label="призовой фонд" tone="red" />
        <Stat icon={<Icon name="wallet" />} value={fmt(res.systemShare)} label="доля системы" tone="green" />
        <Stat
          icon={<Icon name="percent" />}
          value={fmt(res.evPlayer)}
          label={`EV игрока · ${Math.round(res.evPct * 100)}%`}
          tone={res.evPct > -0.3 ? "green" : "red"}
        />
      </div>

      <div className="two-col">
        <div className="panel">
          <h3>Что если…</h3>

          <div className="field">
            <label>Количество мест</label>
            <div className="range-wrap">
              <span className="range-val">{p.places}</span>
              <input type="range" min={2} max={10} value={p.places} onChange={set("places")} />
            </div>
          </div>
          <div className="field">
            <label>Цена входа (баллы)</label>
            <div className="range-wrap">
              <span className="range-val">{fmt(p.price)}</span>
              <input type="range" min={10} max={500} step={10} value={p.price} onChange={set("price")} />
            </div>
          </div>
          <div className="field">
            <label>Процент фонда</label>
            <div className="range-wrap">
              <span className="range-val">{p.fundPercent}%</span>
              <input type="range" min={50} max={100} value={p.fundPercent} onChange={set("fundPercent")} />
            </div>
          </div>
          <div className="field">
            <label>Эффект буста</label>
            <div className="range-wrap">
              <span className="range-val">+{p.boostPercent}%</span>
              <input type="range" min={0} max={100} step={5} value={p.boostPercent} onChange={set("boostPercent")} />
            </div>
          </div>
          <div className="field">
            <label>Цена буста</label>
            <div className="range-wrap">
              <span className="range-val">{fmt(p.boostPrice)}</span>
              <input type="range" min={0} max={200} step={5} value={p.boostPrice} onChange={set("boostPrice")} />
            </div>
          </div>

          <button className="btn btn-ghost btn-block" onClick={() => setP({ ...DEFAULTS })}>
            Сбросить к «Классической»
          </button>
        </div>

        <div className="aside-stack">
          <div className="panel">
            <h3>Распределение взносов</h3>
            <div className="split-bar">
              <span className="part fund" style={{ width: `${p.fundPercent}%` }}>
                {p.fundPercent >= 25 ? `Фонд ${fmt(res.prizeFund)}` : ""}
              </span>
              <span className="part sys" style={{ width: `${100 - p.fundPercent}%` }}>
                {100 - p.fundPercent >= 20 ? `Система ${fmt(res.systemShare)}` : ""}
              </span>
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11.5, color: "var(--color-text-secondary)" }}>
              <span className="legend-dot" style={{ background: "var(--color-red)" }} /> призовой фонд
              <span className="legend-dot" style={{ background: "var(--color-yellow)" }} /> доля системы
            </div>

            <h3 style={{ marginTop: 20 }}>Вероятность победы</h3>
            <div className="prob-bar-row">
              <span>Без буста</span>
              <div className="prob-bar">
                <div style={{ width: `${res.baseProb * 100 * 6}%` }} />
              </div>
              <b>{(res.baseProb * 100).toFixed(1).replace(".", ",")}%</b>
            </div>
            <div className="prob-bar-row boost">
              <span>С бустом</span>
              <div className="prob-bar">
                <div style={{ width: `${res.boostedProb * 100 * 6}%` }} />
              </div>
              <b>{(res.boostedProb * 100).toFixed(1).replace(".", ",")}%</b>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Открытые комнаты: экономика (данные backend)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Комната</th>
              <th>Взносы за раунд</th>
              <th>Призовой фонд</th>
              <th>Доля системы</th>
              <th>EV игрока</th>
              <th>Вердикт</th>
            </tr>
          </thead>
          <tbody>
            {compare.map(({ room, analysis: r }) => (
              <tr key={room.id}>
                <td style={{ fontWeight: 600 }}>
                  {room.title} · {room.seats} мест
                </td>
                <td>{fmt(r.pot)}</td>
                <td>{fmt(r.prizeFund)}</td>
                <td>{fmt(r.systemShare)}</td>
                <td className={r.evPct > -0.3 ? "plus" : "minus"}>
                  {fmt(r.evPlayer)} ({Math.round(r.evPct * 100)}%)
                </td>
                <td>
                  <span className={`tag-${r.verdict === "good" ? "win" : r.verdict === "warn" ? "warn" : "lose"}`}>
                    ● {VERDICT_TAG[r.verdict] ?? r.verdict}
                  </span>
                </td>
              </tr>
            ))}
            {compare.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Нет открытых комнат
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details className="how">
        <summary>Как считается</summary>
        <ul>
          <li>
            <b>Взносы за раунд</b> = количество мест × цена входа
          </li>
          <li>
            <b>Призовой фонд</b> = взносы × процент фонда. Остаток — <b>доход системы</b>. Если побеждает бот,
            приз также остаётся системе
          </li>
          <li>
            <b>Вероятность победы</b> = вес игрока / суммарный вес. Вес = 1, с бустом — 1 + эффект буста
          </li>
          <li>
            <b>EV игрока</b> = призовой фонд × вероятность − цена входа. Отрицательный EV — норма (цена
            эмоции), но ниже −35% комната непривлекательна
          </li>
          <li>
            <b>Справедливая цена буста</b> = призовой фонд × вероятность × эффект буста — максимум, при
            котором буст не убыточен игроку
          </li>
        </ul>
      </details>
    </>
  );
}
