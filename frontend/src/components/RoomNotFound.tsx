import { Link } from "react-router-dom";
import { Icon } from "./ui";

export default function RoomNotFound() {
  return (
    <div className="panel" style={{ textAlign: "center", padding: "56px 24px" }}>
      <span
        className="ico"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-red-light)",
          color: "var(--color-red)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon name="warn" size={28} />
      </span>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Комната не найдена</h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 22 }}>
        Возможно, раунд уже завершён или ссылка устарела.
      </p>
      <Link to="/games" className="btn btn-red">
        К списком комнат
      </Link>
    </div>
  );
}
