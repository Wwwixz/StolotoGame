import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiErr } from "../api";
import { fmt } from "../data";
import type { MatchResponse } from "../types";
import { Icon } from "../components/ui";
import RoomCard from "../components/RoomCard";
import { toast } from "../toast";
import { usePlayer } from "../player";

const PLACES = [0, 2, 5, 10];

export default function AutoMatch() {
  const navigate = useNavigate();
  const { me } = usePlayer();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState(0);
  const [priceMin, setPriceMin] = useState(50);
  const [priceMax, setPriceMax] = useState(500);
  const [fund, setFund] = useState(0);
  const [needBoost, setNeedBoost] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<MatchResponse | null>(null);

  const find = async () => {
    if (!me) return;
    setBusy(true);
    try {
      const resp = await api.matchmake({
        playerId: me.id,
        seats: places,
        priceMin,
        priceMax,
        minFundPercent: fund > 0 ? fund : null,
        needBoost,
      });
      setResults(resp);
      toast(resp.message, resp.created ? "success" : "info");
      window.setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    } catch (e) {
      toast(e instanceof ApiErr ? e.message : "Не удалось выполнить подбор", "error");
    } finally {
      setBusy(false);
    }
  };

  const forecastFor = (seats: number, boostPercent: number) => {
    const base = 100 / Math.max(2, seats);
    return `${(base * (1 + boostPercent / 100)).toFixed(1).replace(".", ",")}%`;
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
                  {p === 0 ? "Любое" : p}
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
                min={10}
                max={500}
                step={10}
                value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
              />
            </div>
            <div className="range-wrap">
              <span className="range-val">{priceMax}</span>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
              />
            </div>
          </div>

          <div className="field">
            <label>Минимальный процент фонда</label>
            <div className="range-wrap">
              <span className="range-val">{fund === 0 ? "Любой" : `от ${fund}%`}</span>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={fund}
                onChange={(e) => setFund(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 18px" }}>
            <button
              className={`toggle${needBoost ? " on" : ""}`}
              onClick={() => setNeedBoost((v) => !v)}
            />
            <b style={{ fontSize: 14 }}>Нужна комната с бустом</b>
          </div>

          <button className="btn btn-red btn-block btn-lg" onClick={find} disabled={busy || !me}>
            {busy ? "Подбираем…" : "Найти комнату"}
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
              Если комнат нет — мгновенно создадим новую
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
            <h3>{results.created ? "Создали комнату под ваш запрос" : `Найденные комнаты (${results.rooms.length})`}</h3>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              {places === 0 ? "любое число мест" : `${places} мест`} · вход {priceMin}–{priceMax} баллов
              {fund > 0 ? ` · фонд от ${fund}%` : ""}
            </span>
          </div>
          <div className="grid-cards">
            {results.rooms.map((r) => (
              <RoomCard key={r.id} room={r} forecast={forecastFor(r.seats, r.boostPercent)} />
            ))}
          </div>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => navigate("/games")}>
              Посмотреть все комнаты
            </button>
            <Link className="btn btn-ghost" to={`/rooms/${results.rooms[0].id}`}>
              Открыть первую →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
