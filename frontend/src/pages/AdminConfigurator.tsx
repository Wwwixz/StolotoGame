import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiErr } from "../api";
import { useLobby } from "../hooks";
import { fmt, roomStyle } from "../data";
import type { EconomyAnalysis, RoomConfig } from "../types";
import { AdminTabs, KV, Panel } from "../components/admin";
import { Icon } from "../components/ui";
import { toast } from "../toast";

const DEFAULTS: RoomConfig = {
  title: "Классическая",
  seats: 10,
  entryPrice: 100,
  fundPercent: 85,
  boostEnabled: true,
  boostPrice: 50,
  boostBonusPct: 25,
  waitSeconds: 60,
};

export default function AdminConfigurator() {
  const navigate = useNavigate();
  const rooms = useLobby();
  const [cfg, setCfg] = useState<RoomConfig>({ ...DEFAULTS });
  const [analysis, setAnalysis] = useState<EconomyAnalysis | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof RoomConfig>(key: K, value: RoomConfig[K]) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  // Живой анализ конфигурации с бэкенда (сценарий 5 ТЗ).
  useEffect(() => {
    const t = window.setTimeout(() => {
      api.analyze(cfg).then(setAnalysis).catch(() => setAnalysis(null));
    }, 300);
    return () => window.clearTimeout(t);
  }, [cfg]);

  const create = useCallback(async () => {
    setSaving(true);
    try {
      const room = await api.createRoom(cfg);
      toast(`Комната #${room.id} «${room.title}» создана и открыта в лобби`, "success");
      navigate(`/rooms/${room.id}`);
    } catch (e) {
      toast(e instanceof ApiErr ? e.message : "Не удалось сохранить конфигурацию", "error");
    } finally {
      setSaving(false);
    }
  }, [cfg, navigate]);

  const close = async (id: number) => {
    try {
      await api.closeRoom(id);
      toast(`Комната #${id} закрыта, резервы возвращены`, "info");
    } catch (e) {
      toast(e instanceof ApiErr ? e.message : "Не удалось закрыть комнату", "error");
    }
  };

  return (
    <>
      <h1 className="page-title">Конфигуратор комнат</h1>
      <AdminTabs active="config" />

      <div className="two-col">
        <Panel>
          <div className="field">
            <label>Название комнаты</label>
            <input className="input" value={cfg.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="field">
            <label>Количество мест (2–10)</label>
            <input
              className="input"
              type="number"
              min={2}
              max={10}
              value={cfg.seats}
              onChange={(e) => set("seats", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Цена входа (баллы)</label>
            <input
              className="input"
              type="number"
              min={10}
              step={10}
              value={cfg.entryPrice}
              onChange={(e) => set("entryPrice", Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Процент призового фонда</label>
            <div className="range-wrap">
              <span className="range-val">{cfg.fundPercent}%</span>
              <input
                type="range"
                min={50}
                max={100}
                value={cfg.fundPercent}
                onChange={(e) => set("fundPercent", Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 4px" }}>
            <button
              className={`toggle${cfg.boostEnabled ? " on" : ""}`}
              onClick={() => set("boostEnabled", !cfg.boostEnabled)}
            />
            <b style={{ fontSize: 14 }}>{cfg.boostEnabled ? "Буст включён" : "Буст выключен"}</b>
          </div>

          {cfg.boostEnabled && (
            <>
              <div className="field">
                <label>Цена буста (баллы)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={5}
                  value={cfg.boostPrice}
                  onChange={(e) => set("boostPrice", Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Эффект буста (к весу участника)</label>
                <div className="range-wrap">
                  <span className="range-val">+{cfg.boostBonusPct}%</span>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={cfg.boostBonusPct}
                    onChange={(e) => set("boostBonusPct", Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          <div className="field">
            <label>Таймер ожидания (сек)</label>
            <div className="range-wrap">
              <span className="range-val">{cfg.waitSeconds}</span>
              <input
                type="range"
                min={15}
                max={180}
                step={5}
                value={cfg.waitSeconds}
                onChange={(e) => set("waitSeconds", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="btn-row">
            <button
              className="btn btn-red"
              onClick={create}
              disabled={saving || analysis?.blocked}
            >
              {saving ? "Сохраняем…" : "Создать комнату"}
            </button>
          </div>
          {analysis?.blocked && (
            <div className="warn" style={{ marginTop: 10 }}>
              <b>
                <Icon name="warn" size={18} />
                Сохранение заблокировано
              </b>
              Конфигурация явно убыточна для организатора — система не даст её сохранить (сценарий 7 ТЗ).
            </div>
          )}
        </Panel>

        <div className="aside-stack">
          <Panel title="Анализ экономики">
            {analysis && (
              <>
                <KV k="Взносы за раунд (полный)" v={fmt(analysis.pot)} />
                <KV k="Призовой фонд" v={fmt(analysis.prizeFund)} />
                <KV k="Доход системы за раунд" v={fmt(analysis.systemShare)} />
                <KV k="Вероятность победы" v={`${(analysis.baseProb * 100).toFixed(1).replace(".", ",")}%`} />
                <KV k="Справедливая цена буста" v={cfg.boostEnabled ? `до ${fmt(analysis.boostFairPrice)}` : "—"} />
                <div className="analysis-notes">
                  {analysis.notes.map((n, i) => (
                    <div key={i} className={`anote anote-${n.level.toLowerCase()}`}>
                      <Icon
                        name={n.level === "GOOD" ? "check" : "warn"}
                        size={14}
                      />
                      {n.text}
                    </div>
                  ))}
                </div>
                <div className={`verdict-chip verdict-${analysis.verdict}`}>
                  {analysis.verdict === "good"
                    ? "● Сбалансированная конфигурация"
                    : analysis.verdict === "warn"
                      ? "● Есть риски"
                      : analysis.verdict === "BLOCK"
                        ? "● Сохранение запрещено"
                        : "● Невыгодная конфигурация"}
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 20 }}>
        <h3>Открытые комнаты ({rooms.length})</h3>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Комната</th>
              <th>Места</th>
              <th>Цена</th>
              <th>Фонд</th>
              <th>Буст</th>
              <th style={{ textAlign: "right" }}>Управление</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>
                  <span className={`hex hex-${roomStyle(r.id).hex}`} style={{ display: "inline-flex", width: 30, height: 30, marginRight: 8 }}>
                    <Icon name={roomStyle(r.id).icon} size={14} />
                  </span>
                  {r.title}
                </td>
                <td>
                  {r.occupied}/{r.seats}
                </td>
                <td>{fmt(r.price)}</td>
                <td>
                  {fmt(r.currentFund)} / {fmt(r.projectedFund)}
                </td>
                <td>{r.boostEnabled ? `⚡ ${r.boostPrice} (+${r.boostPercent}%)` : "—"}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="link-btn" onClick={() => navigate(`/rooms/${r.id}`)}>
                    Открыть
                  </button>
                  <button
                    className="link-btn"
                    style={{ color: "var(--color-red)", marginLeft: 12 }}
                    onClick={() => close(r.id)}
                  >
                    Закрыть
                  </button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Открытых комнат нет — создайте первую
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
