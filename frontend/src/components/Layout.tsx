import { Link, NavLink, Outlet } from "react-router-dom";
import { BALANCE, CURRENT_USER, fmt } from "../data";
import { useRole } from "../role";
import { Avatar, Coin, Icon } from "./ui";
import { Logo } from "./graphics";

const NAV = [
  { to: "/lobby", label: "Главная", icon: "home", end: true },
  { to: "/games", label: "Игры", icon: "games" },
  { to: "/history", label: "История", icon: "history" },
  { to: "/balance", label: "Баланс", icon: "wallet" },
  { to: "/profile", label: "Профиль", icon: "user" },
] as const;

const ADMIN_NAV = [
  { to: "/admin", label: "Админ", icon: "admin" },
  { to: "/economy", label: "Аналитика", icon: "analytics" },
  { to: "/log", label: "Журнал", icon: "history" },
] as const;

export default function Layout() {
  const { role } = useRole();
  const items = role === "admin" ? ADMIN_NAV : NAV;

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/lobby" className="logo">
          <Logo />
        </Link>
        <nav className="nav">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={"end" in n ? n.end : false}>
              <Icon name={n.icon} size={18} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <span className={`badge ${role === "admin" ? "red" : "blue"}`}>
            {role === "admin" ? "Роль: администратор" : "Роль: пользователь"}
          </span>
          <Link to="/" className="side-switch">
            Сменить роль
          </Link>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="balance-chip">
            <Coin />
            {fmt(BALANCE)}
            <span className="chev">▼</span>
          </button>
          <Link to="/profile">
            <Avatar name={CURRENT_USER} size="md" />
          </Link>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
