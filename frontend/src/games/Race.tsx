import { useEffect, useState } from "react";
import type { ShellProps } from "./types";
import { allNames, CURRENT_USER } from "../data";
import { Avatar } from "../components/ui";
import { shortName } from "./Wheel";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function Race({ room, result, finished }: ShellProps) {
  const names = allNames(room);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setGo(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const rank = new Map<string, number>();
  rank.set(result.winner, 0);
  names.filter((n) => n !== result.winner).forEach((n, i) => rank.set(n, i + 1));

  return (
    <div className="race-stage">
      {names.map((name) => {
        const r = rank.get(name) ?? 0;
        const target = Math.max(10, 90 - 8 * r - (hash(name) % 5));
        const dur = r === 0 ? 3.1 : 3.1 + Math.min(r * 0.35, 1.1);
        const isWin = name === result.winner;
        return (
          <div key={name} className={`race-lane${isWin && finished ? " win" : ""}`}>
            <span className="race-name">
              {name === CURRENT_USER ? "Вы" : shortName(name)}
            </span>
            <div className="race-track">
              <span className="race-goal-line" />
              <span
                className={`race-runner${isWin && finished ? " win" : ""}`}
                style={{
                  left: go ? `${target}%` : "3%",
                  transitionDuration: `${dur}s`,
                }}
              >
                <Avatar name={name} size="sm" bot={name.startsWith("bot_")} />
              </span>
            </div>
          </div>
        );
      })}
      {finished && (
        <div className="race-verdict">
          Финиш: <b>{shortName(result.winner)}</b> — {result.winnerIsBot ? "бот забирает приз" : "победитель раунда"}
        </div>
      )}
    </div>
  );
}
