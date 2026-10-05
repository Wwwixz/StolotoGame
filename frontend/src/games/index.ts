import type { ComponentType } from "react";
import type { GameType } from "../types";
import type { ShellProps } from "./types";
import Wheel from "./Wheel";
import Race from "./Race";
import CardDuel from "./CardDuel";

export interface GameMeta {
  type: GameType;
  label: string;
  short: string;
  description: string;
  Shell: ComponentType<ShellProps>;
}

export const GAMES: Record<GameType, GameMeta> = {
  wheel: {
    type: "wheel",
    label: "Колесо Фортуны",
    short: "Колесо",
    description: "Крутится один раз — победитель забирает половину фонда.",
    Shell: Wheel,
  },
  race: {
    type: "race",
    label: "Гонка",
    short: "Гонка",
    description: "Участники бегут к финишу — кто первым, тот и победитель.",
    Shell: Race,
  },
  cards: {
    type: "cards",
    label: "Карточный дуэль",
    short: "Карты",
    description: "Каждый открывает свою карту — лучшая забирает главный приз.",
    Shell: CardDuel,
  },
};

export const GAME_LIST: GameMeta[] = Object.values(GAMES);
