import { Fragment, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { fmt, MONTH_START, TODAY, toInputDate } from "../data";
import type { JournalRow } from "../types";
import { AdminTabs, Panel } from "../components/admin";
import { Icon } from "../components/ui";

export default function ExpertLog() {
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const load = () => api.journal().then(setRows).catch(() => undefined);
    load();
    const t = window.setInterval(load, 5000);
    return () => window.clearInterval(t);
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          !q ||
          r.roomTitle.toLowerCase().includes(q.toLowerCase()) ||
          r.winnerName.toLowerCase().includes(q.toLowerCase()) ||
          String(r.id).includes(q) ||
          r.seed.includes(q),
      ),
    [rows, q],
  );

  return (
    <>
      <h1 className="page-title">Журнал раундов</h1>
      <p style={{ color: "var(--color-text-secondary)", margin: "-12px 0 12px", fontSize: 14 }}>
        Журнал раундов для экспертов: состав, веса, ГСЧ и распределение баллов — результат можно проверить
      </p>
      <AdminTabs active="log" />

      <Panel>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <input className="input" type="date" defaultValue={toInputDate(MONTH_START)} style={{ width: 170 }} />
          <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
          <input className="input" type="date" defaultValue={toInputDate(TODAY)} style={{ width: 170 }} />
          <div className="search-box">
            <Icon name="search" size={16} />
            <input
              className="input"
              placeholder="Поиск по ID, комнате, победителю, seed…"
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
              <th style={{ textAlign: "right" }}>Фонд → приз</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <Fragment key={r.id}>
                <tr>
                  <td style={{ fontWeight: 600 }}>#{r.id}</td>
                  <td>
                    {r.roomTitle}
                    <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}> · #{r.roomId}</span>
                  </td>
                  <td>{new Date(r.finishedAt).toLocaleString("ru-RU")}</td>
                  <td className="seed">{r.seed}</td>
                  <td>
                    {r.winnerName} {r.winnerIsBot && <span className="badge blue">бот</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {fmt(r.fundTotal)} → <b>{fmt(r.payout)}</b>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="link-btn"
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    >
                      {expanded === r.id ? "Скрыть" : "Доказательство"}
                    </button>
                  </td>
                </tr>
                {expanded === r.id && (
                  <tr>
                    <td colSpan={7} style={{ background: "#fafbfc" }}>
                      <div className="proof">
                        <div className="proof-grid">
                          <div className="kv">
                            <span className="k">RNG (тысячные от общего веса)</span>
                            <span className="v">
                              {fmt(r.rngValue)} / {fmt(Math.round(r.totalWeight * 1000))}
                            </span>
                          </div>
                          <div className="kv">
                            <span className="k">Комбинация + победный шар</span>
                            <span className="v">
                              {r.combination.join(", ")} + шар {r.winnerBall}
                            </span>
                          </div>
                          <div className="kv">
                            <span className="k">Доход системы</span>
                            <span className="v">
                              {fmt(r.systemIncome)} (бусты: {fmt(r.boostIncome)})
                            </span>
                          </div>
                        </div>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Шар</th>
                              <th>Участник</th>
                              <th>Тип</th>
                              <th>Вес</th>
                              <th>Диапазон ГСЧ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.participants.map((p, i) => (
                              <tr key={i} className={p.name === r.winnerName ? "win-row" : ""}>
                                <td>{p.ball}</td>
                                <td style={{ fontWeight: 600 }}>
                                  {p.name}
                                  {p.name === r.winnerName && <span className="tag-win"> ● победитель</span>}
                                </td>
                                <td>
                                  {p.bot ? "бот" : "игрок"}
                                  {p.boost && " ⚡ буст"}
                                </td>
                                <td>×{p.weight.toFixed(2).replace(".", ",")}</td>
                                <td className="seed">
                                  [{fmt(p.rangeFrom * 1000)} … {fmt(p.rangeTo * 1000)}]
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="note" style={{ marginTop: 8 }}>
                          Победитель — участник, в чей диапазон попало значение ГСЧ. Вес игрока = 1,
                          с бустом — 1 + эффект буста. Данные фиксируются backend-логикой в момент розыгрыша.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Раундов пока нет — сыграйте партию, и она появится здесь
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
