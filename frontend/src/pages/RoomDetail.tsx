import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PARTICIPANTS, fmt, getRoom, mmss } from "../data";
import { Avatar, BotAvatar, Coin, Icon } from "../components/ui";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = getRoom(id);
  const [boost, setBoost] = useState(false);
  const [left, setLeft] = useState(45);

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, []);

  const joined = PARTICIPANTS.length;

  return (
    <div className="two-col">
      <div className="panel">
        <div className="room-head">
          <h2>{room.name}</h2>
          {room.popular && <span className="badge red">Популярная</span>}
          {room.fastDraw && <span className="badge blue">Быстрый розыгрыш</span>}
        </div>

        <div className="room-stats">
          <div className="stat-inline">
            <span className="stat-ico red">
              <Icon name="users" size={18} />
            </span>
            <span>
              <div className="num">{room.places}</div>
              <div className="lbl">мест</div>
            </span>
          </div>
          <div className="stat-inline">
            <span className="stat-ico red">
              <Icon name="zap" size={18} />
            </span>
            <span>
              <div className="num">{room.price}</div>
              <div className="lbl">цена входа</div>
            </span>
          </div>
          <div className="stat-inline">
            <span className="stat-ico gold">
              <Coin />
            </span>
            <span>
              <div className="num">{fmt(room.prizePool)}</div>
              <div className="lbl">призовой фонд</div>
            </span>
          </div>
          <div className="stat-inline">
            <span className="stat-ico red">
              <Icon name="percent" size={18} />
            </span>
            <span>
              <div className="num">{room.fundPercent}%</div>
              <div className="lbl">в фонд</div>
            </span>
          </div>
        </div>

        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, fontSize: 14 }}>
          {room.description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 0 12px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15 }}>Состав комнаты</h3>
          <b>{joined}/{room.places}</b>
        </div>
        <div className="avatar-row">
          {PARTICIPANTS.map((p) => (
            <Avatar key={p.name} name={p.name} size="md" you={p.you} />
          ))}
          {Array.from({ length: room.places - joined }).map((_, i) => (
            <Avatar key={`e${i}`} name="empty" size="md" empty label={String(joined + i + 1)} />
          ))}
        </div>

        <div className="prob-cards">
          <div className="prob">
            <div className="lbl">Ваша вероятность победы</div>
            <div className="val">10%</div>
          </div>
          <div className="prob">
            <div className="lbl">С Бустом</div>
            <div className="val" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="up">↗ 12,6%</span>
              <span style={{ color: "var(--color-orange)", display: "inline-flex" }}>
                <Icon name="up" size={20} />
              </span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-red btn-lg btn-block"
          style={{ marginTop: 22 }}
          onClick={() => navigate(`/rooms/${room.id}/waiting`)}
        >
          Войти в комнату
        </button>
      </div>

      <div className="aside-stack">
        <div className="aside-card">
          <span
            className="ico"
            style={{ background: "var(--color-red-light)", color: "var(--color-red)" }}
          >
            <Icon name="zap" size={20} />
          </span>
          <h4>Буст</h4>
          <div className="sub">+{room.boostPercent}% к весу</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="price-tag">Цена: {room.boostPrice}</span>
            {boost ? (
              <button
                className="btn btn-ghost"
                style={{ height: 36, padding: "0 14px", fontSize: 13 }}
                onClick={() => setBoost(false)}
              >
                Отменить
              </button>
            ) : (
              <button
                className="btn btn-red"
                style={{ height: 36, padding: "0 14px", fontSize: 13 }}
                onClick={() => setBoost(true)}
              >
                Взять буст
              </button>
            )}
          </div>
          {boost && (
            <div style={{ marginTop: 10 }}>
              <span className="tag-win">● Активирован — +{room.boostPercent}% к весу</span>
            </div>
          )}
        </div>

        <div className="aside-card">
          <span className="ico" style={{ background: "var(--color-blue-light)" }}>
            <BotAvatar size="md" />
          </span>
          <h4>Боты</h4>
          <div className="sub">{room.places - joined} места</div>
          <div className="sub">Заполнят комнату через</div>
          <div className="big">{mmss(left)}</div>
        </div>

        <div className="aside-card">
          <span
            className="ico"
            style={{ background: "var(--color-red-light)", color: "var(--color-red)" }}
          >
            <Icon name="timer" size={20} />
          </span>
          <h4>Таймер</h4>
          <div className="sub">До старта:</div>
          <div className="big">{mmss(left)}</div>
        </div>
      </div>
    </div>
  );
}
