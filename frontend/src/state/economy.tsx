import { createContext, useContext, useState, type ReactNode } from "react";
import type { HistoryRow, LogRow, RoundResult, Room, TxRow } from "../types";
import {
  CURRENT_USER,
  HISTORY,
  INITIAL_BALANCE,
  INITIAL_RESERVE,
  INITIAL_SYS_FUND,
  nowDateTime,
  roomNum,
  ROUND_LOG,
  TRANSACTIONS,
} from "../data";

interface BoostState {
  roomId: number;
  price: number;
}

interface EconState {
  balance: number;
  reserve: number;
  sysFund: number;
  tx: TxRow[];
  history: HistoryRow[];
  log: LogRow[];
  boost: BoostState | null;
}

export interface Economy {
  balance: number;
  reserve: number;
  sysFund: number;
  total: number;
  tx: TxRow[];
  history: HistoryRow[];
  log: LogRow[];
  boost: BoostState | null;
  enterRoom(room: Room): boolean;
  leaveRoom(room: Room): void;
  buyBoost(room: Room): boolean;
  cancelBoost(): void;
  settle(room: Room, result: RoundResult): void;
}

const EconCtx = createContext<Economy | null>(null);

export function EconomyProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<EconState>({
    balance: INITIAL_BALANCE,
    reserve: INITIAL_RESERVE,
    sysFund: INITIAL_SYS_FUND,
    tx: TRANSACTIONS,
    history: HISTORY,
    log: ROUND_LOG,
    boost: null,
  });

  const enterRoom = (room: Room): boolean => {
    if (s.balance < room.price) return false;
    setS((st) => ({
      ...st,
      balance: st.balance - room.price,
      reserve: st.reserve + room.price,
      tx: [
        { title: `Вход в комнату ${roomNum(room.id)}`, date: nowDateTime(), amount: -room.price },
        ...st.tx,
      ],
    }));
    return true;
  };

  const leaveRoom = (room: Room) => {
    setS((st) => ({
      ...st,
      balance: st.balance + room.price,
      reserve: Math.max(0, st.reserve - room.price),
      boost: st.boost?.roomId === room.id ? null : st.boost,
    }));
  };

  const buyBoost = (room: Room): boolean => {
    if (s.balance < room.boostPrice || s.boost?.roomId === room.id) return false;
    setS((st) => ({
      ...st,
      balance: st.balance - room.boostPrice,
      boost: { roomId: room.id, price: room.boostPrice },
      tx: [{ title: "Буст", date: nowDateTime(), amount: -room.boostPrice }, ...st.tx],
    }));
    return true;
  };

  const cancelBoost = () => {
    setS((st) =>
      st.boost ? { ...st, balance: st.balance + st.boost.price, boost: null } : st,
    );
  };

  const settle = (room: Room, result: RoundResult) => {
    setS((st) => {
      const youWin = result.winner === CURRENT_USER;
      const prize = youWin ? result.top[0].prize : 0;
      const logId = `#${4824 + (st.log.length - 4) + 1}`;
      return {
        ...st,
        reserve: Math.max(0, st.reserve - room.price),
        balance: st.balance + prize,
        sysFund: st.sysFund + (result.winnerIsBot ? result.top[0].prize : 0),
        boost: st.boost?.roomId === room.id ? null : st.boost,
        tx: youWin
          ? [{ title: "Выигрыш", date: nowDateTime(), amount: prize }, ...st.tx]
          : st.tx,
        history: [
          {
            date: nowDateTime(),
            room: room.name,
            result: youWin ? "win" : "lose",
            amount: youWin ? prize : -room.price,
          },
          ...st.history,
        ],
        log: [
          {
            id: logId,
            room: room.name,
            time: nowDateTime(),
            seed: result.seed.slice(0, 4) + "…",
            winner: result.winner,
            status: "Завершён",
          },
          ...st.log,
        ],
      };
    });
  };

  const api: Economy = {
    balance: s.balance,
    reserve: s.reserve,
    sysFund: s.sysFund,
    total: s.balance + s.reserve + s.sysFund,
    tx: s.tx,
    history: s.history,
    log: s.log,
    boost: s.boost,
    enterRoom,
    leaveRoom,
    buyBoost,
    cancelBoost,
    settle,
  };

  return <EconCtx.Provider value={api}>{children}</EconCtx.Provider>;
}

export function useEconomy(): Economy {
  const v = useContext(EconCtx);
  if (!v) throw new Error("useEconomy must be used within EconomyProvider");
  return v;
}
