import { useNavigate } from "react-router-dom";
import { Icon } from "../components/ui";
import { Logo } from "../components/graphics";
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
          <Logo />
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

        <span className="landing-foot">
          Кубок России по продуктивному программированию · Java (Spring Boot) + React + PostgreSQL + Docker
        </span>
      </div>
    </div>
  );
}
