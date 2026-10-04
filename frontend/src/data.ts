/* Общие хелперы форматирования (моки удалены — данные приходят из API). */

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

export function fmtSigned(n: number): string {
  return `${n >= 0 ? "+" : "−"}${fmt(Math.abs(n))}`;
}

export function mmss(totalSec: number): string {
  const s = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtTime(epochMs: number): string {
  if (!epochMs) return "—";
  return new Date(epochMs).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateTime(epochMs: number): string {
  if (!epochMs) return "—";
  const d = new Date(epochMs);
  return `${d.toLocaleDateString("ru-RU")} ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
}

export function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const MONTH_START = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
export const TODAY = new Date();

/* Палитра шаров лототрона: цвет участника детерминирован по номеру места. */
export const BALL_COLORS = [
  "#e31e24", "#3478f6", "#7b5cf0", "#f59e0b", "#19a463",
  "#0ea5e9", "#ec4899", "#84cc16", "#f97316", "#14b8a6",
];

export function ballColor(ball: number): string {
  return BALL_COLORS[(ball - 1 + BALL_COLORS.length) % BALL_COLORS.length];
}

/* Иконка/цвет карточки комнаты — детерминированно по id. */
export const ROOM_ICONS = [
  { icon: "flame", hex: "red" },
  { icon: "zap", hex: "green" },
  { icon: "star", hex: "orange" },
  { icon: "crown", hex: "gold" },
] as const;

export function roomStyle(id: number) {
  return ROOM_ICONS[id % ROOM_ICONS.length];
}

/* Остаток таймера комнаты с поправкой на разницу часов клиент/сервер. */
export function secondsLeft(phaseEndsAt: number | null, serverTime: number): number {
  if (!phaseEndsAt) return 0;
  const skew = Date.now() - serverTime;
  return Math.max(0, (phaseEndsAt - Date.now() + skew) / 1000);
}
