import { useMemo, useState } from "react";
import { ROOMS, fmt } from "../data";
import { calcEconomy, type RoomParams, type Verdict } from "../economy";
import { AdminTabs } from "../components/admin";
import { Coin, Icon, Stat } from "../components/ui";

const VERDICT_META: Record<Verdict, { icon: "shield" | "warn"; title: string; cls: string }> = {
  good: { icon: "shield", title: "Сбалансированная конфигурация", cls: "good" },
  warn: { icon: "warn", title: "Конфигурация с рисками", cls: "warn" },
  risk: { icon: "warn", title: "Невыгодная конфигурация", cls: "risk" },
};

const VERDICT_TAG: Record<Verdict, string> = {
  good: "Сбалансировано",
  warn: "Рискованно",
  risk: "Невыгодно",
};

const DEFAULTS = { places: 10, price: 100, fundPercent: 85, boostPercent: 25, boostPrice: 50 };

export default function Economy() {
  const [p, setP] = useState<RoomParams>({ ...DEFAULTS });
  const res = useMemo(() => calcEconomy(p), [p]);
  const meta = VERDICT_META[res.verdict];

  const set = (key: keyof RoomParams) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setP((prev) => ({ ...prev, [key]: Number(e.target.value) }));

  const compare = ROOMS.map((room) => ({ room, res: calcEconomy(room) }));

  return (
    <>
      <h1 className="page-title">Анализ экономики</h1>
      <AdminTabs active="economy" />

      <div className={`verdict ${meta.cls}`}>
        <span className="v-ico">
          <Icon name={meta.icon} size={22} />
        </span>
        <div>
          <b>{meta.title}</b>
          <ul>
            {res.reasons.map((r, i) => (
              <li key={i}>
                <Icon name={r.tone === "good" ? "check" : "warn"} size={14} />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <Stat icon={<Coin />} value={fmt(res.pot)} label="взносы за раунд" tone="gold" />
        <Stat
          icon={<Icon name="trophy" />}
          value={fmt(res.prizeFund)}
          label="призовой фонд"
          tone="red"
        />
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
              <input type="range" min={2} max={50} value={p.places} onChange={set("places")} />
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
              <input
                type="range"
                min={50}
                max={100}
                value={p.fundPercent}
                onChange={set("fundPercent")}
              />
            </div>
          </div>
          <div className="field">
            <label>Эффект буста</label>
            <div className="range-wrap">
              <span className="range-val">+{p.boostPercent}%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={p.boostPercent}
                onChange={set("boostPercent")}
              />
            </div>
          </div>
          <div className="field">
            <label>Цена буста</label>
            <div className="range-wrap">
              <span className="range-val">{fmt(p.boostPrice)}</span>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={p.boostPrice}
                onChange={set("boostPrice")}
              />
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
            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 8,
                fontSize: 11.5,
                color: "var(--color-text-secondary)",
              }}
            >
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

          <div className="panel">
            <h3>EV игрока vs процент фонда</h3>
            <EvChart price={p.price} boostGain={res.boostGain} fundPercent={p.fundPercent} />
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>Сравнение комнат</h3>
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
            {compare.map(({ room, res: r }) => (
              <tr key={room.id}>
                <td style={{ fontWeight: 600 }}>
                  {room.name} · {room.places} мест
                </td>
                <td>{fmt(r.pot)}</td>
                <td>{fmt(r.prizeFund)}</td>
                <td>{fmt(r.systemShare)}</td>
                <td className={r.evPct > -0.3 ? "plus" : "minus"}>
                  {fmt(r.evPlayer)} ({Math.round(r.evPct * 100)}%)
                </td>
                <td>
                  <span className={`tag-${r.verdict === "good" ? "win" : r.verdict === "warn" ? "warn" : "lose"}`}>
                    ● {VERDICT_TAG[r.verdict]}
                  </span>
                </td>
              </tr>
            ))}
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
            <b>Призовой фонд</b> = взносы × процент фонда. Остаток — <b>доля системы</b>
          </li>
          <li>
            <b>Вероятность победы</b> = 1 / количество мест. Буст умножает вес игрока: +
            {p.boostPercent}% к вероятности
          </li>
          <li>
            <b>EV игрока</b> (ожидаемая ценность) = призовой фонд × вероятность − цена входа.
            Отрицательный EV — норма: это цена эмоции. Слишком отрицательный (&lt; −35%) — комната
            непривлекательна
          </li>
          <li>
            <b>Справедливая цена буста</b> = призовой фонд × вероятность × эффект буста — максимум,
            при котором буст не убыточен игроку. Выше неё буст зарабатывает системе
          </li>
        </ul>
      </details>
    </>
  );
}

function EvChart({
  price,
  boostGain,
  fundPercent,
}: {
  price: number;
  boostGain: number;
  fundPercent: number;
}) {
  const W = 340;
  const H = 150;
  const L = 38;
  const R = 12;
  const T = 12;
  const B = 26;
  const fMin = 50;
  const fMax = 100;
  const vMin = -60;
  const vMax = 0;

  const x = (f: number) => L + ((f - fMin) / (fMax - fMin)) * (W - L - R);
  const y = (v: number) => T + ((vMax - v) / (vMax - vMin)) * (H - T - B);
  const boostShift = price ? (boostGain / price) * 100 : 0;

  const line = (shift: number) => {
    const pts: string[] = [];
    for (let f = fMin; f <= fMax; f += 2.5) pts.push(`${x(f).toFixed(1)},${y(f - 100 + shift).toFixed(1)}`);
    return pts.join(" ");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ev-chart">
      <line x1={L} y1={y(0)} x2={W - R} y2={y(0)} stroke="#19A463" strokeWidth="1" opacity="0.6" />
      <line
        x1={L}
        y1={y(-50)}
        x2={W - R}
        y2={y(-50)}
        stroke="#E5E7EB"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <polyline points={line(0)} fill="none" stroke="#3478F6" strokeWidth="2.5" />
      <polyline
        points={line(boostShift)}
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />
      <circle cx={x(fundPercent)} cy={y(fundPercent - 100)} r="4.5" fill="#E31E24" />
      <text x={L - 6} y={y(0) + 3} textAnchor="end" className="ev-label">
        0
      </text>
      <text x={L - 6} y={y(-50) + 3} textAnchor="end" className="ev-label">
        −50
      </text>
      <text x={x(50)} y={H - 8} textAnchor="middle" className="ev-label">
        50%
      </text>
      <text x={x(75)} y={H - 8} textAnchor="middle" className="ev-label">
        75%
      </text>
      <text x={x(100)} y={H - 8} textAnchor="middle" className="ev-label">
        100%
      </text>
      <text x={W - R} y={T + 2} textAnchor="end" className="ev-label">
        % от цены входа
      </text>
    </svg>
  );
}
