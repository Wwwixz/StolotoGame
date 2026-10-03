import { AdminTabs, KV, Panel } from "../components/admin";

export default function Economy() {
  return (
    <>
      <h1 className="page-title">Анализ экономики</h1>
      <AdminTabs active="economy" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <Panel title="Параметры комнаты">
          <KV k="Количество мест" v="10" />
          <KV k="Цена входа" v="100" />
          <KV k="Призовой фонд" v="8 500" />
          <KV k="Процент фонда" v="85%" />
        </Panel>

        <Panel title="Результаты">
          <KV k="Призовой фонд" v="8 500" />
          <KV k="Доля системы" v="1 500" />
          <KV k="Рекомендуемая цена буста" v="от 40" />
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel title="Дополнительно">
            <KV k="Вероятность победы без буста" v="10%" />
            <KV k="Вероятность победы с бустом" v="12,6%" />
            <KV
              k="Изменение доходности игрока"
              v={<span style={{ color: "#c91c25" }}>−6%</span>}
            />
          </Panel>
          <button className="btn btn-red btn-block btn-lg">Проверить</button>
        </div>
      </div>
    </>
  );
}
