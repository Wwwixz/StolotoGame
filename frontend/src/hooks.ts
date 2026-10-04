import { useEffect, useState } from "react";
import { api } from "./api";
import { realtime } from "./realtime";
import type { RoomState, RoomSummary } from "./types";

/** Живой список открытых комнат: WS-push + первичный REST-снапшот. */
export function useLobby(): RoomSummary[] {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    let alive = true;
    const off = realtime.onEvent((e) => {
      if (e.type === "lobby" && e.rooms && alive) setRooms(e.rooms);
    });
    realtime.subscribeLobby(true);
    return () => {
      alive = false;
      off();
      realtime.subscribeLobby(false);
    };
  }, []);

  return rooms;
}

/** Живое состояние комнаты: пуш по WS, при входе — REST-снапшот, плюс ручной сеттер
 *  для мгновенного отклика на join/boost/leave без ожидания пуша. */
export function useRoom(
  id: number | string,
): [RoomState | null, (r: RoomState | null) => void] {
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .room(id)
        .then((r) => {
          if (alive) setRoom(r);
        })
        .catch(() => undefined);
    const off = realtime.onEvent((e) => {
      if (e.type === "room" && e.room && e.room.id === Number(id) && alive) setRoom(e.room);
    });
    realtime.subscribeRoom(Number(id), load);
    load();
    const poll = window.setInterval(load, 5000); // страховка при обрыве WS
    return () => {
      alive = false;
      off();
      window.clearInterval(poll);
      realtime.subscribeRoom(null);
    };
  }, [id]);

  return [room, setRoom];
}
