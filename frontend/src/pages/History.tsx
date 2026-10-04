import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { usePlayer } from "../player";
import { fmtDateTime, fmtSigned, MONTH_START, TODAY, toInputDate } from "../data";
import { Icon } from "../components/ui";

type Tab = "all" | "win" | "lose";

export default function History() {
  const { me } = usePlayer();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const [rows, setRows] = useState<ReturnType<typeof mapHistory>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!me) return;
    setLoading(true);
    api
      .history(me.id)
      .then(mapHistory)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [me?.id]);

  const filtered = useMemo(
    () =>
      rows.filter((h) => {
        if (tab === "win" && !h.win) return false;
        if (tab === "lose" && h.win) return false;
        if (q && !h.roomTitle.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [rows, tab, q],
  );

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

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <input className="input" type="date" defaultValue={toInputDate(MONTH_START)} style={{ width: 170 }} />
          <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
          <input className="input" type="date" defaultValue={toInputDate(TODAY)} style={{ width: 170 }} />
          <div className="search-box">
            <Icon name="search" size={16} />
            <input
              className="input"
              placeholder="Поиск по комнате…"
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
              <th style={{ textAlign: "right" }}>Итог</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.roundId}>
                <td>{h.date}</td>
                <td style={{ fontWeight: 600 }}>
                  {h.roomTitle}{" "}
                  <Link to={`/rooms/${h.roomId}`} style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>
                    #{h.roomId}
                  </Link>
                </td>
                <td>
                  {h.win ? <span className="tag-win">● Победа</span> : <span className="tag-lose">● Проигрыш</span>}
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className={h.amount >= 0 ? "plus" : "minus"}>{fmtSigned(h.amount)}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  {loading ? "Загружаем…" : "Пока нет участий — сыграйте первый раунд"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function mapHistory(rows: {
  roundId: number;
  roomId: number;
  roomTitle: string;
  finishedAt: number;
  win: boolean;
  amount: number;
  prize: number;
}[]) {
  return rows.map((r) => ({ ...r, date: fmtDateTime(r.finishedAt) }));
}
