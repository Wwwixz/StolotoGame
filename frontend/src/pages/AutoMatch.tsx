import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fmt, pct, winProb, ROOMS } from "../data";
import type { Room } from "../types";
import { Icon } from "../components/ui";
import RoomCard from "../components/RoomCard";
import { GAME_LIST } from "../games";

const PLACES = [5, 6, 8, 10];

export default function AutoMatch() {
  const location = useLocation();
  const preset = (location.state ?? {}) as {
    places?: number;
    priceMin?: number;
    priceMax?: number;
    fund?: number;
  };

  const resultsRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<number>(preset.places ?? 10);
  const [priceMin, setPriceMin] = useState<number>(preset.priceMin ?? 50);
  const [priceMax, setPriceMax] = useState<number>(preset.priceMax ?? 500);
  const [fund, setFund] = useState<number>(preset.fund ?? 1000);
  const [game, setGame] = useState<string>("any");
  const [results, setResults] = useState<{ exact: boolean; rooms: Room[] } | null>(null);

  const find = () => {
    const byCloseness = (a: Room, b: Room) =>
      Math.abs(a.places - places) - Math.abs(b.places - places);

    const matched = ROOMS.filter((r) => r.price >= priceMin && r.price <= priceMax)
      .filter((r) => r.prizePool >= fund)
      .filter((r) => game === "any" || r.game === game)
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

  const forecastFor = (r: Room) => pct(winProb(r, true));

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
            <label>Формат игры</label>
            <div className="chips">
              <button
                className={`chip${game === "any" ? " active" : ""}`}
                onClick={() => setGame("any")}
              >
                Любой
              </button>
              {GAME_LIST.map((g) => (
                <button
                  key={g.type}
                  className={`chip${game === g.type ? " active" : ""}`}
                  onClick={() => setGame(g.type)}
                >
                  {g.short}
                </button>
              ))}
            </div>
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
