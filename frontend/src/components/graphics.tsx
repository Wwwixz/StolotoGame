import { useId } from "react";
import logoPng from "../assets/stoloto-logo.png";

/* ---------- фирменный логотип Столото (жёлтый блок) ---------- */

export function Logo() {
  return (
    <img
      className="logo-img"
      src={logoPng}
      alt="Столото — Государственные лотереи"
    />
  );
}

/* ---------- лица игроков (6 вариантов, плоский стиль макетов) ---------- */

const PLAYER_VARIANTS = [
  { bg: "#FDE3E1", skin: "#F2B98F", hair: "#3B2A20", shirt: "#E31E24", extra: "none" },
  { bg: "#E3EDFD", skin: "#C68863", hair: "#1F2937", shirt: "#3478F6", extra: "side" },
  { bg: "#FFF3D6", skin: "#F2B98F", hair: "#7A4B21", shirt: "#F59E0B", extra: "curly" },
  { bg: "#E6F7EF", skin: "#8D5524", hair: "#111827", shirt: "#19A463", extra: "none" },
  { bg: "#F3E8FF", skin: "#F2B98F", hair: "#B45309", shirt: "#7B5CF0", extra: "bun" },
  { bg: "#FFE8E0", skin: "#C68863", hair: "#C31F24", shirt: "#E31E24", extra: "cap" },
] as const;

export function PlayerFace({ variant = 1, size = 40 }: { variant?: number; size?: number }) {
  const v = PLAYER_VARIANTS[(Math.max(1, variant) - 1) % PLAYER_VARIANTS.length];
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="40" fill={v.bg} />
        <rect x="9" y="30" width="22" height="14" rx="7" fill={v.shirt} />
        <circle cx="20" cy="17" r="8.5" fill={v.skin} />
        <path d="M11.5 16.5 a8.5 8.5 0 0 1 17 0 z" fill={v.hair} />
        {v.extra === "curly" && (
          <>
            <circle cx="14.5" cy="10.5" r="2.6" fill={v.hair} />
            <circle cx="20" cy="9" r="2.8" fill={v.hair} />
            <circle cx="25.5" cy="10.5" r="2.6" fill={v.hair} />
          </>
        )}
        {v.extra === "bun" && <circle cx="20" cy="7" r="3" fill={v.hair} />}
        {v.extra === "cap" && (
          <ellipse cx="20" cy="15.6" rx="11" ry="2.2" fill={v.hair} />
        )}
        <circle cx="17" cy="18" r="1.1" fill="#1F2937" />
        <circle cx="23" cy="18" r="1.1" fill="#1F2937" />
        <path
          d="M17.5 21 q2.5 2 5 0"
          stroke="#1F2937"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/* ---------- лица ботов (3 варианта) ---------- */

const BOT_VARIANTS = [
  { bg: "#E3EDFD", body: "#3478F6", dark: "#245EB8" },
  { bg: "#E6F7EF", body: "#19A463", dark: "#14804A" },
  { bg: "#FFF3D6", body: "#F59E0B", dark: "#B45309" },
] as const;

export function BotFace({ variant = 1, size = 40 }: { variant?: number; size?: number }) {
  const v = BOT_VARIANTS[(Math.max(1, variant) - 1) % BOT_VARIANTS.length];
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="40" fill={v.bg} />
        <line x1="20" y1="5" x2="20" y2="11" stroke={v.body} strokeWidth="2" />
        <circle cx="20" cy="4.5" r="2.2" fill={v.body} />
        <rect x="10" y="11" width="20" height="16" rx="6" fill={v.body} />
        <rect x="13.5" y="15" width="13" height="6.5" rx="3" fill="#fff" />
        <circle cx="16.8" cy="18.2" r="1.3" fill={v.dark} />
        <circle cx="23.2" cy="18.2" r="1.3" fill={v.dark} />
        <rect x="16" y="23.5" width="8" height="2" rx="1" fill="#fff" opacity="0.85" />
        <rect x="13" y="29" width="14" height="8" rx="4" fill={v.dark} opacity="0.55" />
      </g>
    </svg>
  );
}

/* ---------- кубок победителя ---------- */

export function WinnerTrophy({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="wtGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD45E" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#F59E0B" opacity="0.25" />
      <path
        d="M34 34 h-8 a14 14 0 0 0 12 22"
        stroke="#E6A900"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M86 34 h8 a14 14 0 0 1 -12 22"
        stroke="#E6A900"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M36 24 h48 v22 a24 24 0 0 1 -48 0 z" fill="url(#wtGold)" />
      <rect x="36" y="24" width="48" height="6" rx="3" fill="#FFE08A" />
      <path d="M54 70 h12 l3 12 h-18 z" fill="#F59E0B" />
      <rect x="42" y="82" width="36" height="10" rx="4" fill="#E6A900" />
      <rect x="34" y="92" width="52" height="10" rx="4" fill="#FFC400" />
      <path
        d="M60 33 l2.6 5.3 5.8 .8 -4.2 4 1 5.8 -5.2 -2.7 -5.2 2.7 1 -5.8 -4.2 -4 5.8 -.8 z"
        fill="#fff"
        opacity="0.92"
      />
      <circle cx="22" cy="28" r="3" fill="#FFC400" opacity="0.7" />
      <circle cx="98" cy="24" r="2.4" fill="#FFC400" opacity="0.6" />
      <circle cx="104" cy="52" r="2" fill="#3478F6" opacity="0.5" />
      <circle cx="14" cy="52" r="2" fill="#E31E24" opacity="0.45" />
    </svg>
  );
}
