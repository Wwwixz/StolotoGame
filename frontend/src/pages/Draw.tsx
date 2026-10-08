import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fmt, getRoom, getRoundResult, roomNum } from "../data";
import { Avatar, Coin, Icon, Stat } from "../components/ui";
import RoomNotFound from "../components/RoomNotFound";
import { useEconomy } from "../state/economy";
import { GAMES } from "../games";

const STEPS = [
  "Проверка участников",
  "Расчёт весов",
  "RNG — выбор победителя",
  "Показ результата",
];

export default function Draw() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const econ = useEconomy();
  const [done, setDone] = useState(0);
  const [boostUsed, setBoostUsed] = useState(false);
  const settled = useRef(false);

  useEffect(() => {
    if (done >= STEPS.length) return;
    const t = window.setTimeout(() => setDone((n) => n + 1), 900);
    return () => window.clearTimeout(t);
  }, [done]);

  const finished = done >= STEPS.length;

  useEffect(() => {
    if (finished && room && !settled.current) {
      settled.current = true;
      setBoostUsed(econ.boost?.roomId === room.id);
      econ.settle(room, getRoundResult(room));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, room?.id]);

  if (!room) return <RoomNotFound />;

  const game = GAMES[room.game];
  const result = getRoundResult(room);
  const Shell = game.Shell;

  return (
    <>
      <h1 className="page-title">
        Комната {roomNum(room.id)}
        <span className="badge red">Розыгрыш начался</span>
        <span className="badge yellow">{game.short}</span>
      </h1>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <Stat icon={<Icon name="users" />} value={String(room.places)} label="мест" />
        <Stat icon={<Icon name="zap" />} value={String(room.price)} label="цена входа" tone="red" />
        <Stat icon={<Coin />} value={fmt(room.prizePool)} label="призовой фонд" tone="gold" />
        <Stat icon={<Icon name="percent" />} value={`${room.fundPercent}%`} label="в фонд" tone="red" />
      </div>

      <div className="two-col">
        <div className="panel" style={{ textAlign: "center" }}>
          <h3>{game.label}</h3>
          <Shell room={room} result={result} finished={finished} />
          {!finished && (
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              Определяем победителя…
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Текущий ход</h3>
          <div className="steps" style={{ marginBottom: finished ? 20 : 0 }}>
            {STEPS.map((s, i) => (
              <div key={s} className={`step${i < done ? " done" : ""}`}>
                <span className="ok">
                  <Icon name="check" size={18} />
                </span>
                {s}
              </div>
            ))}
          </div>

          {finished && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  marginBottom: 14,
                }}
              >
                <span style={{ display: "inline-flex", color: "var(--color-green)" }}>
                  <Icon name="check" size={15} />
                </span>
                Итог раунда: победа {result.winnerIsBot ? "бота" : "игрока"}
                {boostUsed && (
                  <span className="tag-win" style={{ marginLeft: 6 }}>
                    буст · вес ×{(1 + room.boostPercent / 100).toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>

              <h3 style={{ margin: "6px 0 10px" }}>Результаты раунда</h3>
              <div className="winner-list" style={{ maxWidth: "none", marginBottom: 18 }}>
                {result.top.map((w) => (
                  <div key={w.place} className={`winner-row${w.place === 1 ? " first" : ""}`}>
                    <span
                      className={`medal ${w.place === 1 ? "gold" : w.place === 2 ? "silver" : "bronze"}`}
                    >
                      {w.place}
                    </span>
                    <Avatar name={w.name} size="sm" bot={w.name.startsWith("bot_")} />
                    <span>
                      <span className="name">{w.name}</span>
                      <br />
                      <span className="sub">{fmt(w.prize)} баллов</span>
                    </span>
                    <span className="prize">+{fmt(w.prize)}</span>
                  </div>
                ))}
              </div>

              <div className="btn-row" style={{ marginTop: 0 }}>
                <Link className="btn btn-red" to={`/rooms/${room.id}/winners`}>
                  К победителям →
                </Link>
                <button className="btn btn-ghost" onClick={() => navigate("/lobby")}>
                  В лобби
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
