import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROOMS } from "../data";
import type { GameType } from "../types";
import RoomCard from "../components/RoomCard";
import { GAME_LIST } from "../games";

type SortKey = "fund" | "price" | "places" | "speed";
type GameFilter = GameType | null;

const SORTS: [SortKey, string][] = [
  ["fund", "Сортировка: призовой фонд"],
  ["price", "Сортировка: цена входа"],
  ["places", "Сортировка: больше мест"],
  ["speed", "Сортировка: скорый старт"],
];

const PRICE_FILTERS: [number | null, string][] = [
  [null, "Любая цена"],
  [50, "до 50"],
  [100, "до 100"],
  [200, "до 200"],
  [500, "до 500"],
];

export default function Games() {
  const [sort, setSort] = useState<SortKey>("fund");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [game, setGame] = useState<GameFilter>(null);

  const rooms = useMemo(() => {
    let list = [...ROOMS];
    if (maxPrice) list = list.filter((r) => r.price <= maxPrice);
    if (game) list = list.filter((r) => r.game === game);
    switch (sort) {
      case "fund":
        list.sort((a, b) => b.prizePool - a.prizePool);
        break;
      case "price":
        list.sort((a, b) => a.price - b.price);
        break;
      case "places":
        list.sort((a, b) => b.places - a.places);
        break;
      case "speed":
        list.sort(
          (a, b) => Number(!!b.fastDraw) - Number(!!a.fastDraw) || a.price - b.price,
        );
        break;
    }
    return list;
  }, [sort, maxPrice, game]);

  return (
    <>
      <h1 className="page-title">Быстрая бонусная игра</h1>
      <p style={{ color: "var(--color-text-secondary)", margin: "-10px 0 20px", fontSize: 14 }}>
        Выбирай комнату вручную или доверься автоподбору — раунд занимает меньше минуты
      </p>

      <div className="games-promo">
        <div>
          <b>Не знаешь, какую комнату выбрать?</b>
          <span>
            Задай параметры — система сама подберёт оптимальную комнату и покажет прогноз выигрыша
          </span>
        </div>
        <Link className="btn btn-yellow" to="/auto-match">
          Автоподбор
        </Link>
      </div>

      <div className="section-head" style={{ alignItems: "center" }}>
        <h3>Открытые комнаты ({rooms.length})</h3>
        <select
          className="select"
          style={{ width: 260, height: 40 }}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          {SORTS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="chips" style={{ marginBottom: 10 }}>
        <button
          className={`chip${game === null ? " active" : ""}`}
          onClick={() => setGame(null)}
        >
          Все форматы
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
      <div className="chips" style={{ marginBottom: 20 }}>
        {PRICE_FILTERS.map(([value, label]) => (
          <button
            key={label}
            className={`chip${maxPrice === value ? " active" : ""}`}
            onClick={() => setMaxPrice(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid-cards">
        {rooms.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="panel" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
          Под фильтр ничего не попало — подними цену входа
        </div>
      )}
    </>
  );
}
