import { useState } from "react";
import { ROUND_LOG, MONTH_START, TODAY, toInputDate } from "../data";
import { AdminTabs, Panel } from "../components/admin";
import { Icon } from "../components/ui";

export default function ExpertLog() {
  const [q, setQ] = useState("");
  const rows = ROUND_LOG.filter(
    (r) => !q || r.room.toLowerCase().includes(q.toLowerCase()) || r.winner.includes(q) || r.id.includes(q),
  );

  return (
    <>
      <h1 className="page-title">Журнал раундов</h1>
      <p style={{ color: "var(--color-text-secondary)", margin: "-12px 0 12px", fontSize: 14 }}>
        Журнал раундов для экспертов
      </p>
      <AdminTabs active="log" />

      <Panel>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
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
              <th>ID раунда</th>
              <th>Комната</th>
              <th>Время</th>
              <th>Seed</th>
              <th>Победитель</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.id}</td>
                <td>{r.room}</td>
                <td>{r.time}</td>
                <td className="seed">{r.seed}</td>
                <td>{r.winner}</td>
                <td>
                  <span className="tag-win">● {r.status}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
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
      </Panel>
    </>
  );
}
