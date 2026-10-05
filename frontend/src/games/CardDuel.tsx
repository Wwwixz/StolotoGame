import { useEffect, useMemo, useState } from "react";
import type { ShellProps } from "./types";
import { allNames, CURRENT_USER } from "../data";

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♠", "♥", "♦", "♣"];

export default function CardDuel({ room, result, finished }: ShellProps) {
  const names = allNames(room);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setFlip(true), 150);
    return () => window.clearTimeout(t);
  }, []);

  const deck = useMemo(() => {
    const m = new Map<string, { rank: string; suit: string; red: boolean }>();
    m.set(result.winner, { rank: "A", suit: "♠", red: false });
    let k = 11;
    for (const name of names) {
      if (name === result.winner) continue;
      const suit = SUITS[k % 4];
      m.set(name, {
        rank: RANKS[k],
        suit,
        red: suit === "♥" || suit === "♦",
      });
      k = k === 1 ? 11 : k - 1;
    }
    return m;
  }, [names, result.winner]);

  return (
    <div className="cards-stage">
      <div className="cards-row">
        {names.map((name, i) => {
          const c = deck.get(name);
          const isWin = name === result.winner;
          return (
            <div
              key={name}
              className={`card52${flip ? " flipped" : ""}${
                isWin && finished ? " win" : ""
              }${!isWin && finished ? " dim" : ""}`}
            >
              <div
                className="card-inner"
                style={{ transitionDelay: flip ? `${0.25 + i * 0.26}s` : "0s" }}
              >
                <div className="card-face back">С</div>
                <div className={`card-face front${c?.red ? " red" : ""}`}>
                  <b>{c?.rank}</b>
                  <span>{c?.suit}</span>
                </div>
              </div>
              {isWin && finished && <span className="card-win-badge">Победитель</span>}
            </div>
          );
        })}
      </div>
      {finished && (
        <div className="cards-verdict">
          Лучшая карта — <b>{CURRENT_USER === result.winner ? "ваша" : short(result.winner)}</b>
        </div>
      )}
    </div>
  );
}

function short(n: string): string {
  return n.replace("player_", "P·").replace("bot_", "B·");
}
