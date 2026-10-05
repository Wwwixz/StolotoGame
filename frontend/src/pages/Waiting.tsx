import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fmt, getRoom, roomHumans, roomBots, roomNum } from "../data";
import { Avatar, Coin, Icon, ProgressRing, Stat } from "../components/ui";
import RoomNotFound from "../components/RoomNotFound";
import { useEconomy } from "../state/economy";
import { GAMES } from "../games";

const START = 45;

export default function Waiting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const econ = useEconomy();
  const entered = useRef(false);
  const [left, setLeft] = useState(START);

  useEffect(() => {
    if (room && !entered.current) {
      entered.current = true;
      if (!econ.enterRoom(room)) {
        navigate(`/rooms/${room.id}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (left === 0) {
      const t = window.setTimeout(() => navigate(`/rooms/${room?.id}/bots`), 600);
      return () => window.clearTimeout(t);
    }
  }, [left, navigate, room?.id]);

  if (!room) return <RoomNotFound />;

  const humans = roomHumans(room);
  const bots = roomBots(room);

  return (
    <>
      <h1 className="page-title">
        Комната {roomNum(room.id)}
        <span className="badge blue">Ожидание игроков</span>
        <span className="badge yellow">{GAMES[room.game].short}</span>
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
            <div
              style={{
                margin: "16px auto 0",
                maxWidth: 320,
                background: "var(--color-blue-light)",
                border: "1px solid #bbd3fa",
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#245eb8",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="wallet" size={16} />
              Зарезервировано: {fmt(room.price)} баллов
            </div>
          </div>
          <div
            className="note"
            style={{ marginTop: 12, justifyContent: "space-between", color: "var(--color-red)" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="warn" size={16} />
              Вы можете выйти из комнаты в любой момент — баллы вернутся на баланс
            </span>
            <Link
              to={`/rooms/${room.id}/bots`}
              style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}
            >
              Пропустить ожидание →
            </Link>
          </div>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 14 }}
            onClick={() => {
              econ.leaveRoom(room);
              navigate("/lobby");
            }}
          >
            Выйти из комнаты
          </button>
        </div>

        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Участники</h3>
            <b>
              {humans.length}/{room.places}
            </b>
          </div>
          <div className="avatar-row" style={{ marginBottom: 22 }}>
            {humans.map((p) => (
              <Avatar key={p.name} name={p.name} size="md" you={p.you} />
            ))}
            {Array.from({ length: room.places - humans.length }).map((_, i) => (
              <Avatar key={`e${i}`} name="empty" size="md" empty />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Боты</h3>
            <b>{bots.length} мест</b>
          </div>
          <div className="avatar-row" style={{ marginBottom: 14, minHeight: 40 }}>
            {bots.length > 0 ? (
              bots.map((b) => (
                <Avatar key={b} name={b} size="md" bot caption />
              ))
            ) : (
              <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
                Комната заполнена людьми — боты не нужны
              </span>
            )}
          </div>
          <div className="note" style={{ margin: 0 }}>
            Боты добавятся автоматически после таймера
          </div>
        </div>
      </div>
    </>
  );
}
