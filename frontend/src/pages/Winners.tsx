import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CURRENT_USER,
  fmt,
  getRoom,
  getRoundResult,
  roomBots,
  roomHumans,
  roomNum,
} from "../data";
import { Avatar, Icon, YouBadge } from "../components/ui";
import RoomNotFound from "../components/RoomNotFound";
import { GAMES } from "../games";

const COLORS = ["#e31e24", "#ffc400", "#3478f6", "#19a463", "#7b5cf0"];

const MEDAL_TONE = ["gold", "silver", "bronze"] as const;

export default function Winners() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);

  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        left: (i * 37) % 100,
        delay: (i % 12) * 0.35,
        dur: 2.6 + ((i * 7) % 20) / 10,
        color: COLORS[i % COLORS.length],
        rot: (i * 53) % 360,
      })),
    [],
  );

  if (!room) return <RoomNotFound />;

  const result = getRoundResult(room);
  const everyone = [...roomHumans(room).map((p) => p.name), ...roomBots(room)];
  const prizeByName = new Map(result.top.map((w) => [w.name, w.prize]));
  const top = result.top[0];
  const youWin = top.name === CURRENT_USER;

  return (
    <>
      <h1 className="page-title">
        Комната {roomNum(room.id)}
        <span className="badge yellow">{GAMES[room.game].short}</span>
      </h1>

      <section className="winners-hero">
        <div className="confetti">
          {confetti.map((c, i) => (
            <i
              key={i}
              style={{
                left: `${c.left}%`,
                background: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.dur}s`,
                transform: `rotate(${c.rot}deg)`,
              }}
            />
          ))}
        </div>

        <span style={{ display: "inline-flex", color: "var(--color-yellow)" }}>
          <Icon name="trophy" size={54} strokeWidth={1.6} />
        </span>
        <h2>{youWin ? "Вы победили!" : "Победители!"}</h2>

        <div className="hero-winner">
          <span className="medal gold">1</span>
          <Avatar name={top.name} size="md" you={youWin} bot={top.name.startsWith("bot_")} />
          <span>
            <span className="name">
              {top.name}
              {youWin && <YouBadge />}
            </span>
            <br />
            <span className="sub">Выигрыш: {fmt(top.prize)} баллов</span>
          </span>
        </div>

        {result.winnerIsBot && (
          <div
            style={{
              maxWidth: 460,
              margin: "18px auto 0",
              background: "var(--color-blue-light)",
              border: "1px solid #bbd3fa",
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "#245eb8",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <Icon name="bot" size={16} />
            Бот забрал призовой фонд — его часть остаётся в системе
          </div>
        )}
      </section>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Результаты раунда</h3>
          <div className="winner-list" style={{ maxWidth: "none" }}>
            {result.top.map((w) => (
              <div
                key={w.place}
                className={`winner-row${w.place === 1 ? " first" : ""}`}
              >
                <span className={`medal ${MEDAL_TONE[w.place - 1]}`}>{w.place}</span>
                <Avatar
                  name={w.name}
                  size="sm"
                  bot={w.name.startsWith("bot_")}
                  you={w.name === CURRENT_USER}
                />
                <span className="name">
                  {w.name}
                  {w.name === CURRENT_USER && <YouBadge />}
                </span>
                <span className="prize">+{fmt(w.prize)}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 14 }}>
            Остальные участники ({everyone.length - result.top.length}) без приза —
            их входы формируют системную долю и призовой фонд
          </p>
        </div>

        <div className="aside-stack">


          <div className="btn-row" style={{ marginTop: 0, flexDirection: "column", alignItems: "stretch" }}>
            <button className="btn btn-red" onClick={() => navigate(`/rooms/${room.id}/waiting`)}>
              Ещё раз в этой комнате
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                navigate("/auto-match", {
                  state: { places: room.places, priceMax: room.price, fund: Math.min(42000, Math.round(room.prizePool / 2)) },
                })
              }
            >
              Похожие условия
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                navigate("/auto-match", {
                  state: { places: Math.max(room.places, 10), priceMin: Math.min(500, room.price * 2), priceMax: 500, fund: room.prizePool },
                })
              }
            >
              Рискованнее: дороже и больший фонд
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/lobby")}>
              В лобби
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
