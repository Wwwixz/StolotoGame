import { useEconomy } from "../state/economy";
import { fmt } from "../data";
import { Coin, Icon } from "../components/ui";

const TX_ICON: Record<string, { icon: "users" | "trophy" | "wallet" | "zap"; tone: string }> = {
  Вход: { icon: "users", tone: "tx-ico" },
  Выигрыш: { icon: "trophy", tone: "tx-ico green" },
  Резерв: { icon: "wallet", tone: "tx-ico" },
  Буст: { icon: "zap", tone: "tx-ico gold" },
};

function txMeta(title: string) {
  const key = Object.keys(TX_ICON).find((k) => title.startsWith(k));
  return key ? TX_ICON[key] : { icon: "wallet" as const, tone: "tx-ico" };
}

export default function Balance() {
  const { balance, reserve, sysFund, total, tx } = useEconomy();

  return (
    <>
      <h1 className="page-title">Баланс</h1>

      <div className="balance-cards">
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Доступно</div>
            <div className="val">{fmt(balance)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg blue />
          <div>
            <div className="lbl">В резерве</div>
            <div className="val">{fmt(reserve)}</div>
          </div>
        </div>
        <div className="bal-card">
          <Coin lg />
          <div>
            <div className="lbl">Системный фонд</div>
            <div className="val">{fmt(sysFund)}</div>
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
        </div>

        {tx.map((t, i) => {
          const meta = txMeta(t.title);
          return (
            <div className="tx-row" key={`${t.title}-${i}`}>
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
