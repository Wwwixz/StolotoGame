import { useState } from "react";
import { HISTORY, MONTH_START, TODAY, toInputDate } from "../data";
import { Icon } from "../components/ui";

type Tab = "all" | "win" | "lose";

export default function History() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const rows = HISTORY.filter((h) => {
    if (tab === "win" && h.result !== "win") return false;
    if (tab === "lose" && h.result !== "lose") return false;
    if (q && !h.room.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <h1 className="page-title">История игр</h1>

      <div className="panel">
        <div className="tabs" style={{ marginBottom: 16 }}>
          {(
            [
              ["all", "Все"],
              ["win", "Выигрыши"],
              ["lose", "Проигрыши"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button key={key} className={`tab${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}
        >
          <input
            className="input"
            type="date"
            defaultValue={toInputDate(MONTH_START)}
            style={{ width: 170 }}
          />
          <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
          <input
            className="input"
            type="date"
            defaultValue={toInputDate(TODAY)}
            style={{ width: 170 }}
          />
          <div className="search-box">
            <Icon name="search" size={16} />
            <input
              className="input"
              placeholder="Поиск по ID комнаты…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Комната</th>
              <th>Результат</th>
              <th style={{ textAlign: "right" }}>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr key={i}>
                <td>{h.date}</td>
                <td style={{ fontWeight: 600 }}>{h.room}</td>
                <td>
                  {h.result === "win" ? (
                    <span className="tag-win">● Выигрыш</span>
                  ) : (
                    <span className="tag-lose">● Проигрыш</span>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className={h.amount >= 0 ? "plus" : "minus"}>
                    {h.amount >= 0 ? "+" : "−"}
                    {Math.abs(h.amount).toLocaleString("ru-RU")}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Ничего не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pager">
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`page-btn${p === 1 ? " active" : ""}`}>
              {p}
            </button>
          ))}
          <button className="page-btn">→</button>
        </div>
      </div>
    </>
  );
}
