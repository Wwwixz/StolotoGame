import { useEffect, useState } from "react";
import { api } from "../api";
import { usePlayer } from "../player";
import { fmt, fmtSigned, fmtDateTime } from "../data";
import type { SystemStats, TxRow } from "../types";
import { Coin, Icon } from "../components/ui";

const TX_META: Record<string, { icon: "users" | "trophy" | "wallet" | "zap"; tone: string }> = {
  RESERVE: { icon: "users", tone: "tx-ico" },
  REFUND: { icon: "wallet", tone: "tx-ico" },
  BOOST: { icon: "zap", tone: "tx-ico gold" },
  WIN: { icon: "trophy", tone: "tx-ico green" },
};

export default function Balance() {
  const { me } = usePlayer();
  const [tx, setTx] = useState<TxRow[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    api.systemStats().then(setStats).catch(() => undefined);
  }, [me?.balance]);

  useEffect(() => {
    if (!me) return;
    api.transactions(me.id).then(setTx).catch(() => undefined);
  }, [me?.id, me?.balance]);

  if (!me) return null;
  const total = me.balance + me.reserved;

  return (
    <>
      <h1 className="page-title">Баланс</h1>

      <div className="balance-cards">
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Доступно</div>
            <div className="val">{fmt(me.balance)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg blue />
          <div>
            <div className="lbl">В резерве</div>
            <div className="val">{fmt(me.reserved)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Доход системы</div>
            <div className="val">{fmt(stats?.systemIncome ?? 0)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Общий баланс</div>
            <div className="val">{fmt(total)}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>Последние операции</h3>
          <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
            Раундов сыграно: {stats?.roundsPlayed ?? 0} · выплатлено: {fmt(stats?.totalPayouts ?? 0)}
          </span>
        </div>

        {tx.map((t) => {
          const meta = TX_META[t.type] ?? { icon: "wallet" as const, tone: "tx-ico" };
          return (
            <div className="tx-row" key={t.id}>
              <span className={meta.tone}>
                <Icon name={meta.icon} size={16} />
              </span>
              <span>
                <span className="name">{t.title}</span>
                <br />
                <span className="date">{fmtDateTime(t.createdAt)}</span>
              </span>
              <span className={`amt ${t.amount >= 0 ? "plus" : "minus"}`}>{fmtSigned(t.amount)}</span>
            </div>
          );
        })}

        {tx.length === 0 && (
          <div style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: 20 }}>
            Операций пока нет
          </div>
        )}
      </div>
    </>
  );
}
