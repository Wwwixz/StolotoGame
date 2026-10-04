import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTabs, KV, Panel } from "../components/admin";
import { Icon } from "../components/ui";

export default function AdminConfigurator() {
  const navigate = useNavigate();
  const [name, setName] = useState("Классическая");
  const [places, setPlaces] = useState("10");
  const [price, setPrice] = useState("100");
  const [fund, setFund] = useState("85");
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <h1 className="page-title">Конфигуратор комнат</h1>
      <AdminTabs active="config" />

      <div className="two-col">
        <Panel>
          <div className="field">
            <label>Название комнаты</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Количество мест</label>
            <input
              className="input"
              type="number"
              min={2}
              max={100}
              value={places}
              onChange={(e) => setPlaces(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Цена входа (баллы)</label>
            <input
              className="input"
              type="number"
              min={10}
              step={10}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Процент фонда</label>
            <input
              className="input"
              type="number"
              min={50}
              max={100}
              value={fund}
              onChange={(e) => setFund(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 4px" }}>
            <button className={`toggle${enabled ? " on" : ""}`} onClick={() => setEnabled((v) => !v)} />
            <b style={{ fontSize: 14 }}>{enabled ? "Включён" : "Выключен"}</b>
          </div>

          <div className="btn-row">
            <button className="btn btn-red" onClick={() => setSaved(true)}>
              {saved ? "Сохранено ✓" : "Сохранить"}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/economy")}>
              Проверить
            </button>
          </div>
        </Panel>

        <div className="aside-stack">
          <Panel title="Анализ экономики">
            <KV k="Потенциальный фонд" v="8 500" />
            <KV k="Доля системы" v="1 500" />
            <KV k="Рекомендуемая цена буста" v="от 40" />
          </Panel>

          <div className="warn">
            <b>
              <Icon name="warn" size={18} />
              Внимание
            </b>
            Текущие настройки могут увеличить положительное математическое ожидание буста.
            Рекомендуем поднять цену буста до 60 баллов.
          </div>
        </div>
      </div>
    </>
  );
}
