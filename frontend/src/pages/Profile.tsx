import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { usePlayer } from "../player";
import { fmt, fmtSigned, fmtDateTime } from "../data";
import type { HistoryRow } from "../types";
import { Avatar, Coin, Icon, Stat, YouBadge } from "../components/ui";

const ACHIEVEMENTS = [
  { icon: "trophy", title: "Первая победа", desc: "Выиграй первый раунд", need: (s: Stats) => s.wins >= 1 },
  { icon: "zap", title: "Разогрев", desc: "Сыграй 3 раунда", need: (s: Stats) => s.games >= 3 },
  { icon: "flame", title: "Регуляр", desc: "Сыграй 10 раундов", need: (s: Stats) => s.games >= 10 },
  { icon: "bot", title: "Не боимся ботов", desc: "Победи в комнате с ботами", need: () => false },
  { icon: "crown", title: "VIP-победа", desc: "Выиграй при входе от 200 баллов", need: (s: Stats) => s.bigWin },
  { icon: "star", title: "Крупный куш", desc: "Выиграй 1000+ баллов", need: (s: Stats) => s.bigPrize },
] as const;

interface Stats {
  games: number;
  wins: number;
  winrate: number;
  turnover: number;
  bigWin: boolean;
  bigPrize: boolean;
}

export default function Profile() {
  const { me } = usePlayer();
  const [rows, setRows] = useState<HistoryRow[]>([]);

  useEffect(() => {
    if (!me) return;
    api.history(me.id).then(setRows).catch(() => undefined);
  }, [me?.id, me?.balance]);

  const stats: Stats = useMemo(() => {
    const wins = rows.filter((r) => r.win);
    return {
      games: rows.length,
      wins: wins.length,
      winrate: rows.length ? (wins.length / rows.length) * 100 : 0,
      turnover: rows.reduce((s, r) => s + r.amount, 0),
      bigWin: wins.some((r) => r.prize >= 1000),
      bigPrize: wins.some((r) => r.prize >= 1000),
    };
  }, [rows]);

  if (!me) return null;
  const levelProgress = Math.min(100, Math.round((stats.games % 10) * 10) || (stats.games ? 100 : 0));

  return (
    <>
      <h1 className="page-title">Профиль</h1>

      <div className="panel profile-head">
        <Avatar name={me.name} size="xl" you />
        <div className="profile-id">
          <div className="profile-name">
            {me.name} <YouBadge />
          </div>
          <div className="profile-sub">VIP-статус: {me.vipStatus} · тестовый пользователь MVP</div>
        </div>
        <div className="profile-chips">
          <span className="balance-chip">
            <Coin />
            {fmt(me.balance)}
          </span>
          <span className="balance-chip">
            <Coin blue />
            {fmt(me.reserved)}
          </span>
        </div>
      </div>

      <div className="stat-row" style={{ margin: "16px 0" }}>
        <Stat icon={<Coin />} value={fmt(me.balance)} label="баланс" tone="gold" />
        <Stat icon={<Icon name="users" />} value={String(stats.games)} label="игр сыграно" />
        <Stat icon={<Icon name="trophy" />} value={String(stats.wins)} label="побед" tone="green" />
        <Stat
          icon={<Icon name="percent" />}
          value={`${stats.winrate.toFixed(1).replace(".", ",")}%`}
          label="винрейт"
          tone="blue"
        />
      </div>

      <div className="two-col">
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h3 style={{ margin: 0 }}>Последние игры</h3>
            <Link to="/history" style={{ color: "var(--color-red)", fontSize: 13, fontWeight: 600 }}>
              Вся история →
            </Link>
          </div>

          {rows.slice(0, 4).map((h) => (
            <div className="tx-row" key={h.roundId}>
              {h.win ? <span className="tag-win">● Победа</span> : <span className="tag-lose">● Проигрыш</span>}
              <span>
                <span className="name">{h.roomTitle}</span>
                <br />
                <span className="date">{fmtDateTime(h.finishedAt)}</span>
              </span>
              <span className={`amt ${h.amount >= 0 ? "plus" : "minus"}`}>{fmtSigned(h.amount)}</span>
            </div>
          ))}

          {rows.length === 0 && (
            <div style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: 16 }}>
              Ещё нет участий в раундах
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Достижения</h3>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = a.need(stats);
              return (
                <div key={a.title} className={`ach${unlocked ? "" : " locked"}`}>
                  <span className="ach-ico">
                    <Icon name={a.icon} size={16} />
                  </span>
                  <span className="txt">
                    <b>{a.title}</b>
                    <span>{a.desc}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <h3 style={{ marginTop: 20 }}>Уровень {Math.floor(stats.games / 10) + 1} · Игрок</h3>
          <div className="progress">
            <div className="fill" style={{ width: `${levelProgress}%` }} />
          </div>
          <div className="note">
            {stats.games % 10} из 10 раундов до следующего уровня
          </div>
        </div>
      </div>
    </>
  );
}
