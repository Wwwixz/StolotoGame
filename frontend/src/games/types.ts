import type { RoundResult, Room } from "../types";

export interface ShellProps {
  room: Room;
  result: RoundResult;
  finished: boolean;
}
