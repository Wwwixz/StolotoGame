import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BOTS, fmt, getRoom, roomNum } from "../data";
import { BotAvatar, Coin, Icon, Stat } from "../components/ui";

export default function BotsFilling() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    if (filled >= BOTS.length) {
      const t = window.setTimeout(() => navigate(`/rooms/${room.id}/draw`), 900);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setFilled((n) => n + 1), 1100);
    return () => window.clearTimeout(t);
  }, [filled, navigate, room.id]);

  const done = filled >= BOTS.length;

  return (
    <>
      <h1 className="page-title">
        Комната {roomNum(room.id)}
        <span className="badge blue">Заполнение ботами</span>
      </h1>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <Stat icon={<Icon name="users" />} value={String(room.places)} label="мест" />
        <Stat icon={<Icon name="zap" />} value={String(room.price)} label="цена входа" tone="red" />
        <Stat icon={<Coin />} value={fmt(room.prizePool)} label="призовой фонд" tone="gold" />
        <Stat icon={<Icon name="percent" />} value={`${room.fundPercent}%`} label="в фонд" tone="red" />
      </div>

      <div className="panel" style={{ textAlign: "center", padding: "34px 26px" }}>
        <div
          className="avatar-row"
          style={{ justifyContent: "center", gap: 14, minHeight: 64, marginBottom: 22 }}
        >
          {BOTS.map((b, i) => (
            <span key={b} className={i < filled ? "pop" : undefined} style={i < filled ? undefined : { opacity: 0.25 }}>
              <BotAvatar caption />
            </span>
          ))}
        </div>

        <h3 style={{ marginBottom: 6 }}>Боты заполняют места…</h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 18 }}>
          Боты добавятся автоматически после таймера
        </p>

        <div className="progress" style={{ maxWidth: 420, margin: "0 auto 8px" }}>
          <div className="fill" style={{ width: `${((6 + filled) / room.places) * 100}%` }} />
        </div>
        <div style={{ color: "var(--color-text-secondary)", fontSize: 13, marginBottom: 24 }}>
          {6 + filled}/{room.places} мест занято
        </div>

        <button
          className="btn btn-red btn-lg"
          disabled={!done}
          onClick={() => navigate(`/rooms/${room.id}/draw`)}
        >
          {done ? "К розыгрышу →" : "Ожидаем ботов…"}
        </button>
      </div>
    </>
  );
}
