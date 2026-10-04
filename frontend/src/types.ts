/* Типы, зеркалящие DTO Java-бэкенда (backend/src/main/java/ru/stoloto/quickgame/dto). */

export type RoomStatus = "OPEN" | "RUNNING" | "FINISHED" | "CLOSED";

export interface Participant {
  id: number;
  playerId: number | null;
  name: string;
  bot: boolean;
  boost: boolean;
  seat: number;
  weight: number;
}

export interface RoomState {
  id: number;
  title: string;
  description: string;
  status: RoomStatus;
  seats: number;
  occupied: number;
  price: number;
  fundPercent: number;
  currentFund: number;
  projectedFund: number;
  boostEnabled: boolean;
  boostPrice: number;
  boostPercent: number;
  waitSeconds: number;
  phaseEndsAt: number | null;
  serverTime: number;
  source: string;
  participants: Participant[];
  combination: number[];
  winnerName: string | null;
  winnerPlayerId: number | null;
  winnerIsBot: boolean;
  payout: number | null;
  seed: string | null;
  botFillExpected: boolean;
}

export interface RoomSummary {
  id: number;
  title: string;
  status: RoomStatus;
  seats: number;
  occupied: number;
  price: number;
  fundPercent: number;
  currentFund: number;
  projectedFund: number;
  boostEnabled: boolean;
  boostPrice: number;
  boostPercent: number;
  waitSeconds: number;
  phaseEndsAt: number | null;
  serverTime: number;
}

export interface PlayerInfo {
  id: number;
  name: string;
  vipStatus: string;
  balance: number;
  reserved: number;
}

export interface TxRow {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  reservedAfter: number;
  title: string;
  roomId: number | null;
  createdAt: number;
}

export interface HistoryRow {
  roundId: number;
  roomId: number;
  roomTitle: string;
  finishedAt: number;
  win: boolean;
  amount: number;
  prize: number;
}

export interface DrawParticipant {
  name: string;
  playerId: number | null;
  bot: boolean;
  boost: boolean;
  ball: number;
  weight: number;
  rangeFrom: number;
  rangeTo: number;
}

export interface JournalRow {
  id: number;
  roomId: number;
  roomTitle: string;
  startedAt: number;
  finishedAt: number;
  seats: number;
  occupied: number;
  entryPrice: number;
  fundPercent: number;
  fundTotal: number;
  payout: number;
  systemIncome: number;
  boostIncome: number;
  winnerName: string;
  winnerPlayerId: number | null;
  winnerIsBot: boolean;
  winnerBall: number;
  combination: number[];
  seed: string;
  rngValue: number;
  totalWeight: number;
  participants: DrawParticipant[];
}

export type AnalysisLevel = "GOOD" | "WARN" | "RISK" | "BLOCK";

export interface AnalysisNote {
  level: AnalysisLevel;
  text: string;
}

export interface EconomyAnalysis {
  seats: number;
  entryPrice: number;
  fundPercent: number;
  pot: number;
  prizeFund: number;
  systemShare: number;
  baseProb: number;
  boostedProb: number;
  evPlayer: number;
  evPct: number;
  boostFairPrice: number;
  boostGain: number;
  verdict: "good" | "warn" | "risk" | "BLOCK";
  blocked: boolean;
  notes: AnalysisNote[];
}

export interface MatchResponse {
  created: boolean;
  message: string;
  rooms: RoomSummary[];
}

export interface RoomConfig {
  title: string;
  seats: number;
  entryPrice: number;
  fundPercent: number;
  boostEnabled: boolean;
  boostPrice: number;
  boostBonusPct: number;
  waitSeconds: number;
  description?: string;
}

/** Параметры для интерактивного калькулятора экономики. */
export interface RoomParams {
  places: number;
  price: number;
  fundPercent: number;
  boostPercent: number;
  boostPrice: number;
}

export interface SystemStats {
  roundsPlayed: number;
  totalFund: number;
  totalPayouts: number;
  systemIncome: number;
  botWins: number;
}

export interface WinnerPreview {
  roomId: number;
  winnerName: string;
  winnerBall: number;
  totalWeight: number;
  rngValue: number;
  seed: string;
  combination: number[];
  fundTotal: number;
  payout: number;
  participants: DrawParticipant[];
}

export interface WsEvent {
  type: "lobby" | "room";
  rooms?: RoomSummary[];
  room?: RoomState;
  serverTime: number;
}
