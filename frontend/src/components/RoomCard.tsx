import { useNavigate } from "react-router-dom";
import type { Room } from "../types";
import { fmt } from "../data";
import { Icon } from "./ui";

export default function RoomCard({ room, forecast }: { room: Room; forecast?: string }) {
  const navigate = useNavigate();
  return (
    <article className="room-card">
      <div className="room-card-top">
        <span className={`hex hex-${room.hex}`}>
          <Icon name={room.icon} size={22} strokeWidth={2.2} />
        </span>
        <h4>{room.name}</h4>
      </div>

      <div className="room-card-specs">
        <span className="spec">
          <b>{room.places}</b> мест
        </span>
        <span className="spec">
          <b>{room.price}</b> баллов
        </span>
        <span className="spec">
          <b>{room.occupied}</b> занято
        </span>
      </div>

      <div className="room-card-fund">
        <span className="fund-coin">
          <Icon name="gift" size={17} strokeWidth={2.2} />
        </span>
        <span className="fund-col">
          <b>{fmt(room.prizePool)}</b>
          <span>Призовой фонд</span>
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
