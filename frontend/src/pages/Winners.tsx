import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BOTS, COMBOS, CURRENT_USER, PARTICIPANTS, WINNERS, fmt, getRoom } from "../data";
import { Avatar, YouBadge } from "../components/ui";
import { WinnerTrophy } from "../components/graphics";

const COLORS = ["#e31e24", "#ffc400", "#3478f6", "#19a463", "#7b5cf0"];

const MEDAL_TONE = ["gold", "silver", "bronze"] as const;

export default function Winners() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const [showAll, setShowAll] = useState(false);

  const everyone = [...PARTICIPANTS.map((p) => p.name), ...BOTS].slice(0, room.places);
  const prizeByName = new Map(WINNERS.map((w) => [w.name, w.prize]));

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

  const top = WINNERS[0];

  return (
    <>
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

        <WinnerTrophy size={110} />
        <h2>Победители!</h2>

        <div className="hero-winner">
          <span className="medal gold">1</span>
          <Avatar name={top.name} size="md" you={top.name === CURRENT_USER} />
          <span>
            <span className="name">
              {top.name}
              {top.name === CURRENT_USER && <YouBadge />}
            </span>
            <br />
            <span className="sub">Выигрыш: {fmt(top.prize)} баллов</span>
          </span>
        </div>
      </section>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Результаты раунда</h3>
          <div className="winner-list" style={{ maxWidth: "none" }}>
            {(showAll
              ? everyone.map((name, i) => ({
                  place: i + 1,
                  name,
                  prize: prizeByName.get(name) ?? 0,
                }))
              : WINNERS.map((w) => ({ ...w }))
            ).map((w) => (
              <div key={w.place} className="winner-row">
                <span className={`medal ${w.place <= 3 ? MEDAL_TONE[w.place - 1] : "plain"}`}>
                  {w.place}
                </span>
                <Avatar name={w.name} size="sm" bot={w.name.startsWith("bot_")} you={w.name === CURRENT_USER} />
                <span className="name">
                  {w.name}
                  {w.name === CURRENT_USER && <YouBadge />}
                </span>
                <span className="prize">
                  <i
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        w.prize > 0
                          ? w.place === 1
                            ? "#ffc400"
                            : "#19a463"
                          : "#d1d5db",
                    }}
                  />
                  {w.prize > 0 ? fmt(w.prize) : "—"}
                </span>
              </div>
            ))}
          </div>
          <button className="link-btn" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Скрыть участников" : `Показать всех участников (${room.places})`}
          </button>
        </div>

        <div className="aside-stack">
          <div className="panel">
            <h3>Комбинации</h3>
            <div className="avatar-row">
              {COMBOS.map((n) => (
                <span key={n} className="ball">
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: 0 }}>
            <button
              className="btn btn-red"
              style={{ flex: 1 }}
              onClick={() => navigate("/")}
            >
              В лобби
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => navigate("/auto-match")}
            >
              Сыграть ещё
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
