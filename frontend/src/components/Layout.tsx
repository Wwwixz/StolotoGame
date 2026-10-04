import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { fmt } from "../data";
import { usePlayer } from "../player";
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
  { to: "/admin", label: "Конфигуратор", icon: "admin" },
  { to: "/economy", label: "Аналитика", icon: "analytics" },
  { to: "/log", label: "Журнал", icon: "history" },
] as const;

export default function Layout() {
  const { role } = useRole();
  const { me, players, setMe, online } = usePlayer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

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
          <span className={`badge ${online ? "green" : "yellow"}`}>
            <span className="conn-dot" style={{ background: online ? "#19a463" : "#ffc400" }} />
            {online ? "Реал-тайм подключён" : "Нет связи с сервером"}
          </span>
          <Link to="/" className="side-switch">
            Сменить роль
          </Link>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="player-switch" ref={ref}>
            <button className="balance-chip" onClick={() => setOpen((v) => !v)}>
              <Coin />
              {me ? fmt(me.balance) : "…"}
              <span className="chev">▼</span>
            </button>
            {open && (
              <div className="switch-pop">
                <div className="switch-title">Тестовые игроки</div>
                {players.map((p) => (
                  <button
                    key={p.id}
                    className={`switch-row${me?.id === p.id ? " active" : ""}`}
                    onClick={() => {
                      setMe(p.id);
                      setOpen(false);
                      navigate(0);
                    }}
                  >
                    <Avatar name={p.name} size="sm" />
                    <span className="switch-name">
                      {p.name}
                      <span className="switch-vip">{p.vipStatus}</span>
                    </span>
                    <span className="switch-balance">
                      <Coin />
                      {fmt(p.balance)}
                    </span>
                  </button>
                ))}
                {me && (
                  <div className="switch-foot">
                    В резерве: <b>{fmt(me.reserved)}</b> баллов
                  </div>
                )}
              </div>
            )}
          </div>
          {me && (
            <Link to="/profile">
              <Avatar name={me.name} size="md" you />
            </Link>
          )}
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
