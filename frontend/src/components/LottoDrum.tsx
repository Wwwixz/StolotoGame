import { useEffect, useRef } from "react";
import { ballColor } from "../data";

export interface DrumBall {
  seat: number;
  boost: boolean;
  bot: boolean;
}

/**
 * Современная плоская визуализация розыгрыша: шары участников едут по орбитальным
 * дорожкам вокруг «сканера ГСЧ». Без псевдо-3D — чистая плоская графика в стилистике
 * дизайн-системы. Результат уже определён backend-логикой, анимация только транслирует
 * процесс; при reveal шар-победитель собирается в центр с пульсирующим кольцом.
 */
export default function LottoDrum({
  balls,
  winnerSeat,
  reveal,
  size = 360,
}: {
  balls: DrumBall[];
  winnerSeat: number | null;
  reveal: boolean;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<DrumBall[]>(balls);
  const winnerRef = useRef<number | null>(winnerSeat);
  const revealRef = useRef(reveal);

  ballsRef.current = balls;
  winnerRef.current = winnerSeat;
  revealRef.current = reveal;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const br = size * 0.072;
    const TRACKS = [size * 0.425, size * 0.305, size * 0.185];
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));

    type P = {
      seat: number;
      boost: boolean;
      bot: boolean;
      track: number;
      angle: number;
      speed: number;
      phase: number;
      wobble: number;
      // плавная интерполяция к позиции победителя
      x: number;
      y: number;
      scale: number;
      alpha: number;
    };

    const spawn = (): P[] =>
      ballsRef.current.map((b, i) => ({
        seat: b.seat,
        boost: b.boost,
        bot: b.bot,
        track: i % TRACKS.length,
        angle: i * GOLDEN,
        speed: (0.5 + ((i * 0.13) % 0.35)) * (i % 2 === 0 ? 1 : -1),
        phase: i * 1.7,
        wobble: size * 0.012,
        x: 0,
        y: 0,
        scale: 0.4,
        alpha: 0,
      }));

    let ps: P[] = spawn();
    let key = ballsRef.current.map((b) => b.seat).join(",");
    let raf = 0;
    let t = 0;
    let lastTs = performance.now();

    const step = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      t += dt;

      // пересобрать шары, если состав изменился
      const nextKey = ballsRef.current.map((b) => b.seat).join(",");
      if (nextKey !== key) {
        key = nextKey;
        const old = new Map(ps.map((p) => [p.seat, p]));
        ps = ballsRef.current.map((b, i) => {
          const prev = old.get(b.seat);
          if (prev) return { ...prev, boost: b.boost, bot: b.bot };
          return {
            seat: b.seat,
            boost: b.boost,
            bot: b.bot,
            track: i % TRACKS.length,
            angle: i * GOLDEN + t,
            speed: (0.5 + ((i * 0.13) % 0.35)) * (i % 2 === 0 ? 1 : -1),
            phase: i * 1.7,
            wobble: size * 0.012,
            x: cx,
            y: cy,
            scale: 0.3,
            alpha: 0,
          };
        });
      }

      const revealing = revealRef.current && winnerRef.current != null;
      const winSeat = winnerRef.current;

      ctx.clearRect(0, 0, size, size);

      // ---- орбитальные дорожки ----
      for (const r of TRACKS) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#f1d4d6";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // вращающийся красный сектор на внешней орбите — «сканирование»
      const sweep = t * 0.9;
      ctx.beginPath();
      ctx.arc(cx, cy, TRACKS[0], sweep, sweep + Math.PI * 0.55);
      ctx.strokeStyle = "rgba(227, 30, 36, 0.55)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
      // второй сектор на средней орбите, встречное вращение
      ctx.beginPath();
      ctx.arc(cx, cy, TRACKS[1], -sweep * 1.4, -sweep * 1.4 + Math.PI * 0.35);
      ctx.strokeStyle = "rgba(227, 30, 36, 0.3)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // ---- позиции шаров ----
      for (const p of ps) {
        const r = TRACKS[p.track] + Math.sin(t * 0.9 + p.phase) * p.wobble;
        const targetX = cx + Math.cos(p.angle) * r;
        const targetY = cy + Math.sin(p.angle) * r;

        if (revealing && p.seat === winSeat) {
          // победитель собирается в центр
          p.x += (cx - p.x) * Math.min(1, dt * 6);
          p.y += (cy - p.y) * Math.min(1, dt * 6);
          p.scale += (1.6 - p.scale) * Math.min(1, dt * 5);
          p.alpha += (1 - p.alpha) * Math.min(1, dt * 6);
        } else {
          p.angle += p.speed * dt * (revealing ? 0.25 : 1);
          p.x = targetX;
          p.y = targetY;
          p.scale += (revealing ? 0.55 : 1 - p.scale) * Math.min(1, dt * 6);
          p.alpha += ((revealing ? 0.35 : 1) - p.alpha) * Math.min(1, dt * 6);
        }
      }

      // ---- центральный «сканер ГСЧ» ----
      const centerR = size * 0.1;
      ctx.save();
      ctx.shadowColor = "rgba(227, 30, 36, 0.16)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
      // конический «луч» вокруг центра
      const sweep2 = t * 2.2;
      for (let i = 0; i < 24; i++) {
        const a0 = sweep2 + (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, centerR + 5, a0, a0 + 0.09);
        ctx.strokeStyle = `rgba(227, 30, 36, ${0.5 * (1 - i / 24)})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.fillStyle = "#e31e24";
      ctx.font = `800 ${Math.round(size * 0.052)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(ps.length), cx, cy - 4);
      ctx.fillStyle = "#9ca3af";
      ctx.font = `600 ${Math.round(size * 0.026)}px Inter, sans-serif`;
      ctx.fillText("в розыгрыше", cx, cy + size * 0.038);

      // ---- шары (плоский стиль) ----
      for (const p of ps) {
        const r = br * p.scale;
        const color = ballColor(p.seat);
        const isWinner = revealing && p.seat === winSeat;

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (isWinner) {
          // пульсирующие кольца вокруг победителя
          const pulse = (t % 1.4) / 1.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 6 + pulse * 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(227, 30, 36, ${0.5 * (1 - pulse)})`;
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.shadowColor = "rgba(227, 30, 36, 0.4)";
          ctx.shadowBlur = 22;
          ctx.shadowOffsetY = 4;
        } else {
          ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();

        // белая «плашка» с номером
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.64, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.fillStyle = "#1f2937";
        ctx.font = `800 ${Math.round(r * 0.7)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.seat), p.x, p.y + 1);
        // крошечный плоский блик
        ctx.beginPath();
        ctx.arc(p.x - r * 0.52, p.y - r * 0.52, r * 0.13, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fill();
        ctx.restore();

        // чип буста
        if (p.boost) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x + r * 0.82, p.y - r * 0.82, r * 0.34, 0, Math.PI * 2);
          ctx.fillStyle = "#f59e0b";
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `800 ${Math.round(r * 0.38)}px Inter, sans-serif`;
          ctx.fillText("⚡", p.x + r * 0.82, p.y - r * 0.78);
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block", margin: "0 auto" }} />;
}
