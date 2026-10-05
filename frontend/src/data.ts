import type {
  HistoryRow,
  LogRow,
  Participant,
  PrizeRow,
  RoundResult,
  Room,
  TxRow,
} from "./types";

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

export function nowDateTime(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${daysAgoDate(0)} ${hh}:${mm}`;
}

export const ROOMS: Room[] = [
  {
    id: 1,
    name: "Классическая",
    icon: "flame",
    hex: "red",
    game: "wheel",
    places: 8,
    occupied: 6,
    price: 100,
    prizePool: 8500,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 50,
    popular: true,
    fastDraw: true,
    description:
      "Классическая комната с оптимальным соотношением цены и выигрыша. Колесо Фортуны решает судьбу — победитель забирает половину фонда.",
  },
  {
    id: 2,
    name: "Быстрая",
    icon: "zap",
    hex: "green",
    game: "race",
    places: 5,
    occupied: 4,
    price: 50,
    prizePool: 4200,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 25,
    fastDraw: true,
    description: "Ускоренная гонка: меньше мест, короче раунд — меньше минуты до результата.",
  },
  {
    id: 3,
    name: "Премиум",
    icon: "star",
    hex: "orange",
    game: "cards",
    places: 10,
    occupied: 6,
    price: 200,
    prizePool: 18000,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 100,
    popular: true,
    description: "Карточный дуэль: каждый открывает карту, лучшая забирает главный приз.",
  },
  {
    id: 4,
    name: "VIP",
    icon: "crown",
    hex: "gold",
    game: "wheel",
    places: 10,
    occupied: 6,
    price: 500,
    prizePool: 42500,
    fundPercent: 85,
    boostPercent: 25,
    boostPrice: 250,
    description: "Максимальный призовой фонд для крупных ставок. Колесо крутится только раз.",
  },
];

export function getRoom(id: string | undefined): Room | undefined {
  const n = Number(id);
  return ROOMS.find((r) => r.id === n);
}

export function roomNum(id: number): string {
  return `#${2846 + id}`;
}

export const CURRENT_USER = "player_4827";

export const INITIAL_BALANCE = 12450;
export const INITIAL_RESERVE = 2800;
export const INITIAL_SYS_FUND = 950;

export const PARTICIPANTS: Participant[] = [
  { name: "player_4827", bot: false, you: true },
  { name: "player_6194", bot: false },
  { name: "player_7102", bot: false },
  { name: "player_4831", bot: false },
  { name: "player_9167", bot: false },
  { name: "player_3021", bot: false },
];

export const BOTS: string[] = ["bot_03", "bot_11", "bot_12", "bot_24"];

export function roomHumans(room: Room): Participant[] {
  return PARTICIPANTS.slice(0, Math.min(PARTICIPANTS.length, room.places - 1));
}

export function roomBots(room: Room): string[] {
  const free = room.places - roomHumans(room).length;
  return BOTS.slice(0, Math.max(0, free));
}

export function allNames(room: Room): string[] {
  return [...roomHumans(room).map((p) => p.name), ...roomBots(room)];
}

const RESULT_MOCKS: Record<
  number,
  { winner: string; second: string; third: string; combo: number[]; seed: string }
> = {
  1: {
    winner: "player_4827",
    second: "player_6194",
    third: "bot_12",
    combo: [8, 12, 23, 31, 42],
    seed: "5f7ac1e0",
  },
  2: {
    winner: "bot_11",
    second: "player_6194",
    third: "player_4831",
    combo: [4, 9, 17, 26, 38],
    seed: "9b31d2f4",
  },
  3: {
    winner: "player_4827",
    second: "bot_24",
    third: "player_7102",
    combo: [3, 11, 25, 34, 44],
    seed: "c48a77b2",
  },
  4: {
    winner: "bot_24",
    second: "player_4831",
    third: "player_6194",
    combo: [7, 15, 29, 36, 41],
    seed: "1e0b55aa",
  },
};

export function getRoundResult(room: Room): RoundResult {
  const m = RESULT_MOCKS[room.id] ?? RESULT_MOCKS[1];
  const first = Math.round(room.prizePool * 0.5);
  const second = Math.round(room.prizePool * 0.3);
  const third = room.prizePool - first - second;
  const top: PrizeRow[] = [
    { place: 1, name: m.winner, prize: first },
    { place: 2, name: m.second, prize: second },
    { place: 3, name: m.third, prize: third },
  ];
  return {
    winner: m.winner,
    winnerIsBot: m.winner.startsWith("bot_"),
    top,
    combo: m.combo,
    seed: m.seed,
  };
}

/** Вероятность победы одного игрока: базовая 1/мест, с бустом — его вес растёт на boostPercent */
export function winProb(room: Room, boost: boolean): number {
  if (!boost) return 1 / room.places;
  const b = room.boostPercent / 100;
  return (1 + b) / (room.places - 1 + 1 + b);
}

export function pct(x: number): string {
  return `${(x * 100).toFixed(1).replace(".", ",")}%`;
}

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
