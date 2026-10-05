import { AdminTabs, KV, Panel } from "../components/admin";
import { fmt, pct, winProb } from "../data";
import type { Room } from "../types";

const ROOM: Room = {
  id: 0,
  name: "Классическая",
  icon: "flame",
  hex: "red",
  game: "wheel",
  places: 10,
  occupied: 0,
  price: 100,
  prizePool: 8500,
  fundPercent: 85,
  boostPercent: 25,
  boostPrice: 50,
  description: "",
};

export default function Economy() {
  const sysShare = ROOM.places * ROOM.price * (1 - ROOM.fundPercent / 100);
  const pBase = winProb(ROOM, false);
  const pBoost = winProb(ROOM, true);

  return (
    <>
      <h1 className="page-title">Анализ экономики</h1>
      <AdminTabs active="economy" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <Panel title="Параметры комнаты">
          <KV k="Количество мест" v="10" />
          <KV k="Цена входа" v="100" />
          <KV k="Призовой фонд" v="8 500" />
          <KV k="Процент фонда" v="85%" />
        </Panel>

        <Panel title="Результаты">
          <KV k="Объём ставок за раунд" v={fmt(ROOM.places * ROOM.price)} />
          <KV k="Призовой фонд" v={fmt(ROOM.prizePool)} />
          <KV k="Доля системы за раунд" v={fmt(sysShare)} />
          <KV k="Рекомендуемая цена буста" v="от 40" />
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title="Дополнительно">
            <KV k="Вероятность победы без буста" v={pct(pBase)} />
            <KV k="Вероятность победы с бустом" v={pct(pBoost)} />
            <KV
              k="Изменение win-rate игрока"
              v={
                <span style={{ color: pBoost > pBase ? "var(--color-green-text)" : "#c91c25" }}>
                  +{((pBoost / pBase - 1) * 100).toFixed(1).replace(".", ",")}%
                </span>
              }
            />
          </Panel>
          <button className="btn btn-red btn-block btn-lg">Проверить</button>
        </div>
      </div>
    </>
  );
}
