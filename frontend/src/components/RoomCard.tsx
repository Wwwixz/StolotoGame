import { useNavigate } from "react-router-dom";
import type { RoomSummary } from "../types";
import { fmt, roomStyle } from "../data";
import { Icon } from "./ui";

export default function RoomCard({ room, forecast }: { room: RoomSummary; forecast?: string }) {
  const navigate = useNavigate();
  const style = roomStyle(room.id);
  const fullness = room.seats ? room.occupied / room.seats : 0;

  return (
    <article className="room-card">
      <div className="room-card-top">
        <span className={`hex hex-${style.hex}`}>
          <Icon name={style.icon} size={22} strokeWidth={2.2} />
        </span>
        <h4>{room.title}</h4>
        {room.boostEnabled && <span className="badge blue" title="Доступен буст">⚡ буст</span>}
      </div>

      <div className="room-card-specs">
        <span className="spec">
          <b>{room.seats}</b> мест
        </span>
        <span className="spec">
          <b>{room.price}</b> баллов
        </span>
        <span className="spec">
          <b>{room.occupied}</b> занято
        </span>
      </div>

      <div className="progress" style={{ margin: "2px 0 10px" }}>
        <div className="fill" style={{ width: `${Math.round(fullness * 100)}%` }} />
      </div>

      <div className="room-card-fund">
        <span className="fund-coin">
          <Icon name="gift" size={17} strokeWidth={2.2} />
        </span>
        <span className="fund-col">
          <b>{fmt(room.projectedFund)}</b>
          <span>Призовой фонд</span>
        </span>
        <span className="fund-live">
          {room.occupied > 0 ? (
            <>
              ● <b>{fmt(room.currentFund)}</b> сейчас
            </>
          ) : (
            "Ждёт первого игрока"
          )}
        </span>
      </div>

      {forecast && (
        <div className="spec" style={{ color: "var(--color-green-text)" }}>
          Прогноз выигрыша: ~{forecast}
        </div>
      )}

      <button className="btn btn-red" onClick={() => navigate(`/rooms/${room.id}`)}>
        Играть
      </button>
    </article>
  );
}
