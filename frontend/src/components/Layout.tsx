import { Link, NavLink, Outlet } from "react-router-dom";
import { fmt } from "../data";
import { useRole } from "../role";
import { useEconomy } from "../state/economy";
import { Avatar, Coin, Icon } from "./ui";

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
  const { balance } = useEconomy();
  const items = role === "admin" ? ADMIN_NAV : NAV;

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/lobby" className="logo">
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
          <Link to="/balance" className="balance-chip">
            <Coin />
            {fmt(balance)}
            <span className="chev">▼</span>
          </Link>
          <Link to="/profile">
            <Avatar name="АК" size="md" />
          </Link>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
