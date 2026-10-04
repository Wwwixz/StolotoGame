import type {
  EconomyAnalysis,
  HistoryRow,
  JournalRow,
  MatchResponse,
  PlayerInfo,
  RoomConfig,
  RoomState,
  RoomSummary,
  SystemStats,
  TxRow,
  WinnerPreview,
} from "./types";

/** Ошибка API: понятная причина + подсказки (дешёвые комнаты) при нехватке баллов. */
export class ApiErr extends Error {
  code: string;
  alternatives: RoomSummary[];

  constructor(code: string, message: string, alternatives: RoomSummary[] = []) {
    super(message);
    this.code = code;
    this.alternatives = alternatives;
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiErr("OFFLINE", "Нет связи с сервером. Убедитесь, что backend запущен (docker compose up).");
  }
  if (!res.ok) {
    let code = "ERROR";
    let message = `Ошибка ${res.status}`;
    let alternatives: RoomSummary[] = [];
    try {
      const body = await res.json();
      code = body.code ?? code;
      message = body.message ?? message;
      alternatives = body.alternatives ?? [];
    } catch {
      /* пустой/некорректный ответ */
    }
    throw new ApiErr(code, message, alternatives);
  }
  return res.json() as Promise<T>;
}

const post = <T,>(path: string, body?: unknown) =>
  http<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });

/* ---------- игроки ---------- */

export const api = {
  players: () => http<PlayerInfo[]>("/api/players"),
  player: (id: number) => http<PlayerInfo>(`/api/players/${id}`),
  transactions: (id: number) => http<TxRow[]>(`/api/players/${id}/transactions`),
  history: (id: number) => http<HistoryRow[]>(`/api/players/${id}/history`),

  /* ---------- комнаты ---------- */
  lobby: () => http<RoomSummary[]>("/api/rooms"),
  room: (id: number | string) => http<RoomState>(`/api/rooms/${id}`),
  join: (roomId: number | string, playerId: number) =>
    post<RoomState>(`/api/rooms/${roomId}/join`, { playerId }),
  leave: (roomId: number | string, playerId: number) =>
    post<RoomState>(`/api/rooms/${roomId}/leave`, { playerId }),
  boost: (roomId: number | string, playerId: number) =>
    post<RoomState>(`/api/rooms/${roomId}/boost`, { playerId }),

  /* ---------- матчмейкинг ---------- */
  matchmake: (req: {
    playerId: number;
    seats: number;
    priceMin?: number | null;
    priceMax?: number | null;
    minFundPercent?: number | null;
    needBoost: boolean;
  }) => post<MatchResponse>("/api/matchmaking", req),

  /* ---------- админ ---------- */
  analyze: (config: RoomConfig) => post<EconomyAnalysis>("/api/admin/rooms/analyze", config),
  createRoom: (config: RoomConfig) => post<RoomState>("/api/admin/rooms", config),
  closeRoom: (id: number) => post<{ status: string }>(`/api/admin/rooms/${id}/close`),
  compare: () =>
    http<{ room: RoomSummary; analysis: EconomyAnalysis }[]>("/api/admin/economy/compare"),

  /* ---------- журнал и статистика ---------- */
  journal: () => http<JournalRow[]>("/api/journal"),
  systemStats: () => http<SystemStats>("/api/stats/system"),
  winnerPreview: (roomId: number) => post<WinnerPreview>("/api/winner/preview", { roomId }),
};
