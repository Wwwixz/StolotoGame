import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  ChevronsUp,
  CircleCheck,
  Clock3,
  Coins,
  Crown,
  Flame,
  Gift,
  Grid2X2,
  History,
  House,
  Percent,
  Search,
  Settings,
  Star,
  TriangleAlert,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";
import { AVA_COLORS } from "../data";

/* ---------- иконки (Lucide React, как в спеке) ---------- */

const MAP = {
  home: House,
  games: Grid2X2,
  history: History,
  wallet: Coins,
  user: User,
  admin: Settings,
  analytics: ChartNoAxesCombined,
  search: Search,
  timer: Clock3,
  zap: Zap,
  bot: Bot,
  users: Users,
  trophy: Trophy,
  check: CircleCheck,
  warn: TriangleAlert,
  percent: Percent,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  flame: Flame,
  star: Star,
  crown: Crown,
  gift: Gift,
  up: ChevronsUp,
} as const;

export type IconName = keyof typeof MAP;

export function Icon({
  name,
  size = 18,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const C = MAP[name];
  return <C size={size} strokeWidth={strokeWidth} />;
}

/* ---------- прочие UI-атомы ---------- */

export function Coin({ lg, blue }: { lg?: boolean; blue?: boolean }) {
  return <span className={`coin${lg ? " lg" : ""}${blue ? " blue" : ""}`} />;
}

export function Avatar({
  name,
  size = "lg",
  you,
  empty,
  bot,
  caption,
  label,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  you?: boolean;
  empty?: boolean;
  bot?: boolean;
  caption?: boolean;
  label?: string;
}) {
  if (empty) {
    return (
      <span className={`ava ${size} empty`} title="Свободное место">
        {label ?? "+"}
      </span>
    );
  }
  const inner = bot ? (
    <span className={`ava ${size}`} style={{ background: "var(--color-blue-light)" }}>
      <Bot size={size === "sm" ? 14 : 18} color="var(--color-blue)" />
    </span>
  ) : (
    (() => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
      const bg = AVA_COLORS[hash % AVA_COLORS.length];
      const label = name.slice(0, 2).toUpperCase();
      return (
        <span className={`ava ${size}${you ? " you" : ""}`} style={{ background: bg }} title={name}>
          {label}
        </span>
      );
    })()
  );
  if (caption) {
    return (
      <span className="ava-stack">
        {inner}
        <span className="ava-cap">БОТ</span>
      </span>
    );
  }
  return inner;
}

export function BotAvatar({ size = "lg", caption }: { size?: "sm" | "md" | "lg"; caption?: boolean }) {
  return <Avatar name="bot" size={size} bot caption={caption} />;
}

export function YouBadge() {
  return <span className="you-badge">Вы</span>;
}

export function Stat({
  icon,
  tone = "red",
  value,
  label,
}: {
  icon: ReactNode;
  tone?: "red" | "gold" | "blue" | "green";
  value: string;
  label: string;
}) {
  return (
    <div className="stat">
      <span className={`stat-ico ${tone}`}>{icon}</span>
      <span>
        <span className="num">{value}</span>
        <br />
        <span className="lbl">{label}</span>
      </span>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 170,
  stroke = 13,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ffe0e1"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e31e24"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="ring-center">{children}</span>
    </span>
  );
}
