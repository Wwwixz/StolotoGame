import { BALANCE, RESERVE, SYS_FUND, TOTAL_BALANCE, TRANSACTIONS, fmt } from "../data";
import { Coin, Icon } from "../components/ui";

const TX_ICONS: Record<string, { icon: "users" | "trophy" | "wallet" | "zap"; tone: string }> = {
  "Вход в комнату #2847": { icon: "users", tone: "tx-ico" },
  "Выигрыш": { icon: "trophy", tone: "tx-ico green" },
  "Резерв": { icon: "wallet", tone: "tx-ico" },
  "Буст": { icon: "zap", tone: "tx-ico gold" },
};

export default function Balance() {
  return (
    <>
      <h1 className="page-title">Баланс</h1>

      <div className="balance-cards">
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Доступно</div>
            <div className="val">{fmt(BALANCE)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg blue />
          <div>
            <div className="lbl">В резерве</div>
            <div className="val">{fmt(RESERVE)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Системный фонд</div>
            <div className="val">{fmt(SYS_FUND)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Общий баланс</div>
            <div className="val">{fmt(TOTAL_BALANCE)}</div>
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
          <a href="#" style={{ color: "var(--color-red)", fontSize: 13, fontWeight: 600 }}>
            Все →
          </a>
        </div>

        {TRANSACTIONS.map((t, i) => {
          const meta = TX_ICONS[t.title] ?? { icon: "wallet" as const, tone: "tx-ico" };
          return (
            <div className="tx-row" key={i}>
              <span className={meta.tone}>
                <Icon name={meta.icon} size={16} />
              </span>
              <span>
                <span className="name">{t.title}</span>
                <br />
                <span className="date">{t.date}</span>
              </span>
              <span className={`amt ${t.amount >= 0 ? "plus" : "minus"}`}>
                {t.amount >= 0 ? "+" : "−"}
                {fmt(Math.abs(t.amount))}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
