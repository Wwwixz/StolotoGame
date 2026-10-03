import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BOTS, PARTICIPANTS, fmt, getRoom, roomNum } from "../data";
import { Avatar, BotAvatar, Coin, Icon, ProgressRing, Stat } from "../components/ui";

const START = 45;

export default function Waiting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const [left, setLeft] = useState(START);

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (left === 0) {
      const t = window.setTimeout(() => navigate(`/rooms/${room.id}/bots`), 600);
      return () => window.clearTimeout(t);
    }
  }, [left, navigate, room.id]);

  const joined = PARTICIPANTS.length;

  return (
    <>
      <h1 className="page-title">
        Комната {roomNum(room.id)}
        <span className="badge blue">Ожидание игроков</span>
      </h1>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <Stat icon={<Icon name="users" />} value={String(room.places)} label="мест" />
        <Stat icon={<Icon name="zap" />} value={String(room.price)} label="цена входа" tone="red" />
        <Stat icon={<Coin />} value={fmt(room.prizePool)} label="призовой фонд" tone="gold" />
        <Stat icon={<Icon name="percent" />} value={`${room.fundPercent}%`} label="в фонд" tone="red" />
      </div>

      <div className="two-col">
        <div>
          <div className="panel" style={{ textAlign: "center", padding: "30px 20px" }}>
            <ProgressRing value={left / START} stroke={16} size={190}>
              <span className="ring-center">
                <span className="lbl">До старта</span>
                <br />
                <span className="val">
                  {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
                </span>
              </span>
            </ProgressRing>
          </div>
          <div
            className="note"
            style={{ marginTop: 12, justifyContent: "space-between", color: "var(--color-red)" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="warn" size={16} />
              Вы можете выйти из комнаты в любой момент
            </span>
            <Link
              to={`/rooms/${room.id}/bots`}
              style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}
            >
              Пропустить ожидание →
            </Link>
          </div>
        </div>

        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Участники</h3>
            <b>{joined}/{room.places}</b>
          </div>
          <div className="avatar-row" style={{ marginBottom: 22 }}>
            {PARTICIPANTS.map((p) => (
              <Avatar key={p.name} name={p.name} size="md" you={p.you} />
            ))}
            {Array.from({ length: room.places - joined }).map((_, i) => (
              <Avatar key={`e${i}`} name="empty" size="md" empty />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Боты</h3>
            <b>4/{room.places - joined}</b>
          </div>
          <div className="avatar-row" style={{ marginBottom: 14 }}>
            {BOTS.map((b) => (
              <BotAvatar key={b} size="md" caption />
            ))}
          </div>
          <div className="note" style={{ margin: 0 }}>
            Боты добавятся автоматически после таймера
          </div>
        </div>
      </div>
    </>
  );
}
