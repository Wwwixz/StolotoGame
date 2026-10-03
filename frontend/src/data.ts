import type { HistoryRow, LogRow, Participant, Room, TxRow } from "./types";

export const TODAY = new Date();
export const MONTH_START = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

export function daysAgoDate(n: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function daysAgoDateTime(n: number, hhmm: string): string {
  return `${daysAgoDate(n)} ${hhmm}`;
}

export const ROOMS: Room[] = [
  {
    id: 1,
    name: "Классическая",
    icon: "flame",
    hex: "red",
    places: 10,
    occupied: 6,
    price: 100,
    prizePool: 8500,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 50,
    popular: true,
    fastDraw: true,
    description:
      "Классическая комната с оптимальным соотношением цены и выигрыша. Подходит для новичков и опытных игроков.",
  },
  {
    id: 2,
    name: "Быстрая",
    icon: "zap",
    hex: "green",
    places: 5,
    occupied: 3,
    price: 50,
    prizePool: 4200,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 25,
    fastDraw: true,
    description: "Ускоренный розыгрыш: раунд занимает меньше минуты.",
  },
  {
    id: 3,
    name: "Премиум",
    icon: "star",
    hex: "orange",
    places: 20,
    occupied: 12,
    price: 200,
    prizePool: 18000,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 100,
    description: "Повышенный призовой фонд и больше участников в раунде.",
  },
  {
    id: 4,
    name: "VIP",
    icon: "crown",
    hex: "gold",
    places: 50,
    occupied: 18,
    price: 500,
    prizePool: 42500,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 250,
    description: "Максимальный призовой фонд для крупных ставок.",
  },
];

export function getRoom(id: string | undefined): Room {
  const n = Number(id);
  return ROOMS.find((r) => r.id === n) ?? ROOMS[0];
}

export function roomNum(id: number): string {
  return `#${2846 + id}`;
}

export const CURRENT_USER = "player_4827";

export const BALANCE = 12450;
export const RESERVE = 2800;
export const SYS_FUND = 950;
export const TOTAL_BALANCE = 16200;

export const PARTICIPANTS: Participant[] = [
  { name: "player_4827", bot: false, you: true },
  { name: "player_6194", bot: false },
  { name: "player_7102", bot: false },
  { name: "player_4831", bot: false },
  { name: "player_9167", bot: false },
  { name: "player_3021", bot: false },
];

export const BOTS: string[] = ["bot_03", "bot_11", "bot_12", "bot_24"];

export const WINNERS = [
  { place: 1, name: "player_4827", prize: 8500 },
  { place: 2, name: "player_6194", prize: 2340 },
  { place: 3, name: "bot_12", prize: 1200 },
];

export const COMBOS: number[] = [8, 12, 23, 31, 42];

export const HISTORY: HistoryRow[] = [
  { date: daysAgoDate(1), room: "Классическая", result: "win", amount: 8500 },
  { date: daysAgoDate(3), room: "Быстрая", result: "lose", amount: -250 },
  { date: daysAgoDate(5), room: "Премиум", result: "win", amount: 37500 },
  { date: daysAgoDate(8), room: "Стандарт", result: "lose", amount: -250 },
  { date: daysAgoDate(12), room: "Быстрая", result: "win", amount: 12000 },
];

export const TRANSACTIONS: TxRow[] = [
  { title: "Вход в комнату #2847", date: daysAgoDateTime(1, "16:22"), amount: -200 },
  { title: "Выигрыш", date: daysAgoDateTime(1, "16:40"), amount: 8500 },
  { title: "Резерв", date: daysAgoDateTime(2, "21:02"), amount: -200 },
  { title: "Буст", date: daysAgoDateTime(2, "20:58"), amount: -50 },
];

export const ROUND_LOG: LogRow[] = [
  { id: "#4827", room: "Классическая", time: daysAgoDateTime(1, "16:22"), seed: "5f7a…", winner: "player_4827", status: "Завершён" },
  { id: "#4826", room: "Классическая", time: daysAgoDateTime(1, "16:15"), seed: "8c91…", winner: "player_6194", status: "Завершён" },
  { id: "#4825", room: "Премиум", time: daysAgoDateTime(2, "20:41"), seed: "3a72…", winner: "player_5104", status: "Завершён" },
  { id: "#4824", room: "Стандарт", time: daysAgoDateTime(3, "13:05"), seed: "9b31…", winner: "player_7167", status: "Завершён" },
];

export const AVA_COLORS = [
  "#f2789f",
  "#7f8ff4",
  "#54c7ec",
  "#f2b134",
  "#67c98d",
  "#b085f5",
  "#f2785f",
  "#5fc9c2",
];

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function mmss(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
