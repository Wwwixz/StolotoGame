import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui";
import { useRole } from "../role";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const choose = (role: "user" | "admin") => {
    setRole(role);
    navigate(role === "admin" ? "/admin" : "/lobby");
  };

  return (
    <div className="landing">
      <div className="landing-card">
        <div className="landing-logo">
          <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
            <defs>
              <linearGradient id="logoRed" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff5154" />
                <stop offset="1" stopColor="#e31e24" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="20" fill="url(#logoRed)" />
            <circle cx="21.7" cy="10" r="3.5" fill="#fff" />
            <g stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M21.4 15.4 C21.9 18.2 21.5 20.7 20.6 23.3" />
              <path d="M20.9 16.3 L13.6 11" />
              <path d="M21.9 15.8 L28.8 10.4" />
              <path d="M20.6 23.5 C18.3 26.5 15.5 28.8 12.2 30.4" />
              <path d="M20.9 23.2 C23.1 25.7 25.5 27.3 28.6 28.3" />
            </g>
          </svg>
          <span className="logo-name">СТОЛОТО</span>
        </div>

        <h1>Быстрые игровые комнаты</h1>
        <p>Демо MVP на бонусные баллы · выберите роль для входа</p>

        <div className="role-cards">
          <button className="role-card" onClick={() => choose("user")}>
            <span className="role-ico user">
              <Icon name="user" size={26} />
            </span>
            <b>Пользователь</b>
            <span>
              Список комнат и автоподбор, резерв баллов, буст, розыгрыш и история участия
            </span>
          </button>

          <button className="role-card" onClick={() => choose("admin")}>
            <span className="role-ico admin">
              <Icon name="admin" size={26} />
            </span>
            <b>Администратор</b>
            <span>
              Конфигуратор комнат, анализ экономики и журнал раундов для экспертов
            </span>
          </button>
        </div>

        <span className="landing-foot">Кубок России по продуктивному программированию · React + TypeScript</span>
      </div>
    </div>
  );
}
