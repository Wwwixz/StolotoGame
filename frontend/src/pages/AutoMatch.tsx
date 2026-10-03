import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROOMS, fmt } from "../data";
import type { Room } from "../types";
import { Icon } from "../components/ui";
import RoomCard from "../components/RoomCard";

const PLACES = [1, 2, 5, 10];

export default function AutoMatch() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState(10);
  const [priceMin, setPriceMin] = useState(50);
  const [priceMax, setPriceMax] = useState(500);
  const [fund, setFund] = useState(1000);
  const [format, setFormat] = useState("Любой");
  const [results, setResults] = useState<{ exact: boolean; rooms: Room[] } | null>(null);

  const find = () => {
    const byCloseness = (a: Room, b: Room) =>
      Math.abs(a.places - places) - Math.abs(b.places - places);

    const matched = ROOMS
      .filter((r) => r.price >= priceMin && r.price <= priceMax)
      .filter((r) => r.prizePool >= fund)
      .filter((r) => format === "Любой" || r.name === format)
      .sort(byCloseness);

    const exact = matched.length > 0;
    const rooms = exact
      ? matched
      : [...ROOMS].sort((a, b) => b.prizePool - a.prizePool).sort(byCloseness);

    setResults({ exact, rooms });
    window.setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60,
    );
  };

  const forecastFor = (r: Room) => {
    const base = 100 / r.places;
    const boosted = base * (1 + r.boostPercent / 100);
    return `${boosted.toFixed(1).replace(".", ",")}%`;
  };

  return (
    <>
      <h1 className="page-title">
        <Link to="/games" style={{ color: "var(--color-text-tertiary)", fontWeight: 500 }}>
          ←
        </Link>
        Автоподбор комнаты
      </h1>
      <p style={{ color: "var(--color-text-secondary)", margin: "-10px 0 20px", fontSize: 14 }}>
        Мы подберём для вас оптимальную комнату по вашим параметрам
      </p>

      <div className="two-col">
        <div className="panel">
          <div className="field">
            <label>Количество мест</label>
            <div className="chips">
              {PLACES.map((p) => (
                <button
                  key={p}
                  className={`chip${places === p ? " active" : ""}`}
                  onClick={() => setPlaces(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Цена входа (баллы)</label>
            <div className="range-wrap">
              <span className="range-val">{priceMin}</span>
              <input
                type="range"
                min={50}
                max={500}
                step={50}
                value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
              />
            </div>
            <div className="range-wrap">
              <span className="range-val">{priceMax}</span>
              <input
                type="range"
                min={50}
                max={500}
                step={50}
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
              />
            </div>
          </div>

          <div className="field">
            <label>Призовой фонд (от)</label>
            <div className="range-wrap">
              <span className="range-val">{fmt(fund)}</span>
              <input
                type="range"
                min={1000}
                max={42000}
                step={500}
                value={fund}
                onChange={(e) => setFund(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field">
            <label>Формат комнаты</label>
            <select className="select" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>Любой</option>
              <option>Классическая</option>
              <option>Быстрая</option>
              <option>Премиум</option>
              <option>VIP</option>
            </select>
          </div>

          <button className="btn btn-red btn-block btn-lg" onClick={find}>
            Найти комнату
          </button>
        </div>

        <div className="panel" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 60, margin: "18px 0 22px" }}>💰</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              textAlign: "left",
              alignItems: "flex-start",
            }}
          >
            <div className="check-item">
              <span className="ok">
                <Icon name="check" size={20} />
              </span>
              Подберём лучшие варианты
            </div>
            <div className="check-item">
              <span className="ok">
                <Icon name="check" size={20} />
              </span>
              Учитываем доступный баланс
            </div>
            <div className="check-item">
              <span className="ok">
                <Icon name="check" size={20} />
              </span>
              Покажем прогноз выигрыша
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              color: "var(--color-text-secondary)",
              fontSize: 13,
            }}
          >
            <Icon name="zap" size={16} /> Подбор занимает пару секунд
          </div>
        </div>
      </div>

      {results && (
        <div ref={resultsRef} style={{ marginTop: 28 }}>
          <div className="section-head">
            <h3>
              {results.exact
                ? `Найденные комнаты (${results.rooms.length})`
                : "Точных совпадений нет — вот ближайшие"}
            </h3>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              по {places} местам · вход {priceMin}–{priceMax} баллов · фонд от {fmt(fund)}
            </span>
          </div>
          <div className="grid-cards">
            {results.rooms.map((r) => (
              <RoomCard key={r.id} room={r} forecast={forecastFor(r)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
