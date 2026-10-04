import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiErr } from "./api";
import type { PlayerInfo } from "./types";

const PLAYER_KEY = "stoloto-player-id";

interface PlayerCtx {
  players: PlayerInfo[];
  me: PlayerInfo | null;
  setMe: (id: number) => void;
  refresh: () => void;
  online: boolean;
}

const Ctx = createContext<PlayerCtx>({
  players: [],
  me: null,
  setMe: () => {},
  refresh: () => {},
  online: true,
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [meId, setMeId] = useState<number>(() => Number(localStorage.getItem(PLAYER_KEY)) || 0);
  const [me, setMeState] = useState<PlayerInfo | null>(null);
  const [online, setOnline] = useState(true);

  const refresh = useCallback(() => {
    api
      .players()
      .then((list) => {
        setPlayers(list);
        setOnline(true);
        const stored = Number(localStorage.getItem(PLAYER_KEY)) || 0;
        const wanted = stored || list[0]?.id || 0;
        const found = list.find((p) => p.id === wanted) ?? list[0];
        if (found) {
          setMeState(found);
          setMeId(found.id);
          localStorage.setItem(PLAYER_KEY, String(found.id));
        }
      })
      .catch((e) => {
        if (e instanceof ApiErr && e.code === "OFFLINE") setOnline(false);
      });
  }, []);

  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 5000);
    return () => window.clearInterval(t);
  }, [refresh]);

  // Когда игрок в другом окне меняется — подтягиваем баланс.
  useEffect(() => {
    if (!meId) return;
    const t = window.setInterval(() => {
      api.player(meId).then(setMeState).catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(t);
  }, [meId]);

  const setMe = useCallback((id: number) => {
    localStorage.setItem(PLAYER_KEY, String(id));
    setMeId(id);
    api.player(id).then(setMeState).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ players, me, setMe, refresh, online }),
    [players, me, setMe, refresh, online],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const usePlayer = () => useContext(Ctx);
