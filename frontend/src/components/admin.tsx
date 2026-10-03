import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export function AdminTabs({ active }: { active: "config" | "economy" | "log" }) {
  const items: [string, string, "config" | "economy" | "log"][] = [
    ["/admin", "Конфигуратор комнат", "config"],
    ["/economy", "Анализ экономики", "economy"],
    ["/log", "Журнал раундов", "log"],
  ];
  return (
    <div className="subtabs">
      {items.map(([to, label, key]) => (
        <Link key={to} to={to} className={active === key ? "active" : ""}>
          {label}
        </Link>
      ))}
    </div>
  );
}

export function Panel({
  title,
  children,
  style,
}: {
  title?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className="panel" style={style}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
