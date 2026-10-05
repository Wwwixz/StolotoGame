export type GameType = "wheel" | "race" | "cards";

export interface Room {
  id: number;
  name: string;
  icon: "flame" | "zap" | "star" | "crown";
  hex: "red" | "green" | "orange" | "gold";
  game: GameType;
  places: number;
  occupied: number;
  price: number;
  prizePool: number;
  fundPercent: number;
  boostPercent: number;
  boostPrice: number;
  popular?: boolean;
  fastDraw?: boolean;
  description: string;
}

export interface Participant {
  name: string;
  bot: boolean;
  you?: boolean;
}

export interface PrizeRow {
  place: number;
  name: string;
  prize: number;
}

export interface RoundResult {
  winner: string;
  winnerIsBot: boolean;
  top: PrizeRow[];
  combo: number[];
  seed: string;
}

export interface HistoryRow {
  date: string;
  room: string;
  result: "win" | "lose";
  amount: number;
}

export interface TxRow {
  title: string;
  date: string;
  amount: number;
}

export interface LogRow {
  id: string;
  room: string;
  time: string;
  seed: string;
  winner: string;
  status: string;
}
