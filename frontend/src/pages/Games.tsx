import { useState } from "react";
import { Link } from "react-router-dom";
import { useLobby } from "../hooks";
import RoomCard from "../components/RoomCard";

type SortKey = "fund" | "price" | "places" | "speed";

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
  const rooms = useLobby();
  const [sort, setSort] = useState<SortKey>("fund");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const list = (() => {
    let l = [...rooms];
    if (maxPrice) l = l.filter((r) => r.price <= maxPrice);
    switch (sort) {
      case "fund":
        l.sort((a, b) => b.projectedFund - a.projectedFund);
        break;
      case "price":
        l.sort((a, b) => a.price - b.price);
        break;
      case "places":
        l.sort((a, b) => b.seats - a.seats);
        break;
      case "speed":
        l.sort(
          (a, b) => b.occupied / b.seats - a.occupied / a.seats || a.price - b.price,
        );
        break;
    }
    return l;
  })();

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
        <h3>Открытые комнаты ({list.length})</h3>
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
        {list.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="panel" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
          Под фильтр ничего не попало — подними цену входа
        </div>
      )}
    </>
  );
}
