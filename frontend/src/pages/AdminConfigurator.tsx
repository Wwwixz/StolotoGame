import { useMemo, useState } from "react";
import { AdminTabs, KV, Panel } from "../components/admin";
import { Icon } from "../components/ui";
import { fmt, pct, winProb } from "../data";
import type { Room } from "../types";
import { GAME_LIST, GAMES } from "../games";

function prob(room: Room, boost: boolean): string {
  return pct(winProb(room, boost));
}

export default function AdminConfigurator() {
  const [name, setName] = useState("Классическая");
  const [places, setPlaces] = useState("10");
  const [price, setPrice] = useState("100");
  const [fund, setFund] = useState("85");
  const [game, setGame] = useState<Room["game"]>("wheel");
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState(false);

  const room: Room = useMemo(
    () => ({
      id: 0,
      name,
      icon: "flame",
      hex: "red",
      game,
      places: Math.max(2, Math.min(10, Number(places) || 0)),
      occupied: 0,
      price: Math.max(0, Number(price) || 0),
      prizePool: 0,
      fundPercent: Math.max(0, Math.min(100, Number(fund) || 0)),
      boostPercent: 25,
      boostPrice: 0,
      description: "",
    }),
    [name, places, price, fund, game],
  );

  const potFund = room.places * room.price * (room.fundPercent / 100);
  const sysShare = room.places * room.price - potFund;
  const boostPriceRec = Math.round(room.price * 0.4);

  const warnings: string[] = [];
  if (room.places < 4)
    warnings.push("Мало мест: результат сильно «прыгает», игрокам может казаться несправедливым.");
  if (room.price > 300)
    warnings.push("Высокая цена входа снижает частоту игр — рекомендовано до 300 баллов.");
  if (room.fundPercent < 75)
    warnings.push("Доля фонда ниже 75% — комната малопривлекательна для игрока.");
  if (room.fundPercent > 90)
    warnings.push("Фонд почти весь уходит игрокам — организатор почти не зарабатывает.");

  return (
    <>
      <h1 className="page-title">Конфигуратор комнат</h1>
      <AdminTabs active="config" />

      <div className="two-col">
        <Panel>
          <div className="field">
            <label>Название комнаты</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Тип визуальной оболочки</label>
            <div className="chips">
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
          <div className="field">
            <label>Количество мест (макс. 10)</label>
            <input
              className="input"
              type="number"
              min={2}
              max={10}
              value={places}
              onChange={(e) => setPlaces(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Цена входа (баллы)</label>
            <input
              className="input"
              type="number"
              min={10}
              step={10}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Процент призового фонда</label>
            <input
              className="input"
              type="number"
              min={50}
              max={100}
              value={fund}
              onChange={(e) => setFund(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 4px" }}>
            <button className={`toggle${enabled ? " on" : ""}`} onClick={() => setEnabled((v) => !v)} />
            <b style={{ fontSize: 14 }}>{enabled ? "Включён" : "Выключен"}</b>
          </div>

          <div className="btn-row">
            <button
              className="btn btn-red"
              onClick={() => {
                setSaved(true);
                setChecked(true);
              }}
            >
              {saved ? "Сохранено ✓" : "Сохранить"}
            </button>
            <button className="btn btn-ghost" onClick={() => setChecked(true)}>
              Проверить
            </button>
          </div>
          {checked && warnings.length === 0 && (
            <div className="note" style={{ marginTop: 12, color: "var(--color-green-text)" }}>
              Конфигурация в норме — предупреждений нет
            </div>
          )}
        </Panel>

        <div className="aside-stack">
          <Panel title="Анализ экономики">
            <KV k="Объём ставок за раунд" v={`${fmt(room.places * room.price)} б.`} />
            <KV k="Потенциальный фонд" v={fmt(potFund)} />
            <KV k="Доля системы" v={fmt(sysShare)} />
            <KV k="Рекомендуемая цена буста" v={`от ${boostPriceRec}`} />
            <KV k={`Оболочка: ${GAMES[game].label}`} v="" />
          </Panel>

          <Panel title="Вероятности">
            <KV k="Победа без буста" v={prob(room, false)} />
            <KV k="Победа с бустом (+25%)" v={prob(room, true)} />
          </Panel>

          {checked && warnings.length > 0 ? (
            <div className="warn">
              <b>
                <Icon name="warn" size={18} />
                Внимание
              </b>
              {warnings.map((w, i) => (
                <div key={i} style={{ marginBottom: i === warnings.length - 1 ? 0 : 8 }}>
                  {w}
                </div>
              ))}
            </div>
          ) : !checked ? (
            <div className="note">
              Нажмите «Проверить», чтобы оценить привлекательность и выгоду конфигурации
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
