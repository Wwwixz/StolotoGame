import { useEffect, useState } from "react";
import type { ShellProps } from "./types";
import { allNames } from "../data";

const SIZE = 264;
const PALETTE = [
  "#e31e24",
  "#3478f6",
  "#19a463",
  "#f59e0b",
  "#7b5cf0",
  "#0ea5e9",
  "#db2777",
  "#111827",
];

export function shortName(n: string): string {
  return n.replace("player_", "P·").replace("bot_", "B·");
}

export default function Wheel({ room, result, finished }: ShellProps) {
  const names = allNames(room);
  const n = names.length;
  const seg = 360 / n;
  const winnerIdx = Math.max(0, names.indexOf(result.winner));
  const [rot, setRot] = useState(0);

  useEffect(() => {
    const center = winnerIdx * seg + seg / 2;
    const target = 360 * 6 - center;
    const t = window.setTimeout(() => setRot(target), 80);
    return () => window.clearTimeout(t);
  }, [winnerIdx, seg]);

  const stops = names
    .map(
      (_, i) =>
        `${PALETTE[i % PALETTE.length]} ${i * seg}deg ${(i + 1) * seg}deg`,
    )
    .join(", ");

  return (
    <div className="wheel-stage">
      <div className="wheel-wrap">
        <div className="wheel-pointer" />
      <div
        className="wheel-disc"
        style={{
          width: SIZE,
          height: SIZE,
          background: `conic-gradient(${stops})`,
          transform: `rotate(${rot}deg)`,
        }}
      >
        {names.map((name, i) => (
          <span
            key={name}
            className={`wheel-label${name === result.winner && finished ? " win" : ""}`}
            style={{
              transform: `rotate(${i * seg + seg / 2}deg) translateY(${-(SIZE / 2 - 40)}px)`,
            }}
          >
            <i>{shortName(name)}</i>
          </span>
        ))}
        <span className="wheel-hub" />
      </div>
      </div>
      {finished && (
        <div className={`wheel-verdict${result.winnerIsBot ? " bot" : ""}`}>
          {result.winnerIsBot ? "Бот выходит победителем" : "Победитель"} —{" "}
          <b>{shortName(result.winner)}</b>
        </div>
      )}
    </div>
  );
}
