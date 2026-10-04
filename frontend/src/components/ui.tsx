import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  ChevronsUp,
  CircleCheck,
  Clock3,
  Coins,
  Crown,
  Eye,
  Filter,
  Flame,
  Gamepad2,
  Gift,
  Grid2X2,
  History,
  House,
  Info,
  Minus,
  Percent,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TriangleAlert,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { BotFace, PlayerFace } from "./graphics";

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
  sliders: SlidersHorizontal,
  filter: Filter,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  x: X,
  plus: Plus,
  minus: Minus,
  play: Play,
  rotate: RotateCcw,
  eye: Eye,
  info: Info,
  calendar: CalendarDays,
  chart: BarChart3,
  shield: ShieldCheck,
  gamepad: Gamepad2,
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
  const px = { sm: 28, md: 32, lg: 40, xl: 56 }[size];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;

  const inner = bot ? (
    <span className={`ava ${size}`} title={name}>
      <BotFace variant={(hash % 3) + 1} size={px} />
    </span>
  ) : (
    <span
      className={`ava ${size}${you ? " you" : ""}`}
      title={name}
    >
      <PlayerFace variant={(hash % 6) + 1} size={px} />
    </span>
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
