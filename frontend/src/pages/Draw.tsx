import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { COMBOS, WINNERS, fmt, getRoom, roomNum } from "../data";
import { Avatar, Coin, Icon, Stat } from "../components/ui";

const STEPS = [
  "Проверка участников",
  "Расчёт весов",
  "RNG — выбор победителя",
  "Показ результата",
];

const BALL_POS = [
  { left: 62, top: 58, delay: "0s" },
  { left: 132, top: 96, delay: "0.35s" },
  { left: 84, top: 136, delay: "0.7s" },
];

export default function Draw() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= STEPS.length) return;
    const t = window.setTimeout(() => setDone((n) => n + 1), 900);
    return () => window.clearTimeout(t);
  }, [done]);

  const finished = done >= STEPS.length;

  return (
    <>
      <h1 className="page-title">
        Комната {roomNum(room.id)}
        <span className="badge red">Розыгрыш начался</span>
      </h1>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <Stat icon={<Icon name="users" />} value={String(room.places)} label="мест" />
        <Stat icon={<Icon name="zap" />} value={String(room.price)} label="цена входа" tone="red" />
        <Stat icon={<Coin />} value={fmt(room.prizePool)} label="призовой фонд" tone="gold" />
        <Stat icon={<Icon name="percent" />} value={`${room.fundPercent}%`} label="в фонд" tone="red" />
      </div>

      <div className="two-col">
        <div className="panel" style={{ textAlign: "center" }}>
          <h3>Розыгрыш</h3>
          <div className="machine-wrap">
            <div className="machine" />
            {BALL_POS.map((p, i) => (
              <span
                key={i}
                className="machine-ball"
                style={{ left: p.left, top: p.top, animationDelay: p.delay }}
              >
                {COMBOS[i]}
              </span>
            ))}
          </div>
          {!finished && (
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              Определяем победителя…
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Текущий ход</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 13, margin: "-8px 0 14px" }}>
            Определяем победителя…
          </p>
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
              <h3 style={{ margin: "6px 0 10px" }}>Результаты раунда</h3>
              <div className="winner-list" style={{ maxWidth: "none", marginBottom: 18 }}>
                {WINNERS.map((w) => (
                  <div key={w.place} className={`winner-row${w.place === 1 ? " first" : ""}`}>
                    <span className={`medal ${w.place === 1 ? "gold" : w.place === 2 ? "silver" : "bronze"}`}>
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

              <h3 style={{ marginBottom: 10 }}>Комбинация</h3>
              <div className="avatar-row" style={{ gap: 10, marginBottom: 22 }}>
                {COMBOS.map((n) => (
                  <span key={n} className="ball">
                    {n}
                  </span>
                ))}
              </div>

              <div className="btn-row">
                <button className="btn btn-red" onClick={() => navigate("/")}>
                  В лобби
                </button>
                <button className="btn btn-ghost" onClick={() => navigate("/auto-match")}>
                  Сыграть ещё
                </button>
                <Link className="btn btn-ghost" to={`/rooms/${room.id}/winners`}>
                  К победителям →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
