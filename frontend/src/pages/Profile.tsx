import { Link } from "react-router-dom";
import { CURRENT_USER, fmt } from "../data";
import { useEconomy } from "../state/economy";
import { Avatar, Coin, Icon, Stat, YouBadge } from "../components/ui";

const ACHIEVEMENTS = [
  { icon: "trophy", title: "Первая победа", desc: "Выиграй первый раунд", unlocked: true },
  { icon: "zap", title: "10 игр", desc: "Сыграй 10 раундов", unlocked: true },
  { icon: "flame", title: "Премиум игрок", desc: "Победа в «Премиуме»", unlocked: true },
  { icon: "bot", title: "Не боимся ботов", desc: "Обыграй бота в раунде", unlocked: true },
  { icon: "crown", title: "VIP-победа", desc: "Выиграй в VIP-комнате", unlocked: false },
  { icon: "star", title: "Серия из 3 побед", desc: "Три победы подряд", unlocked: false },
] as const;

export default function Profile() {
  const { balance, reserve, history } = useEconomy();
  const lastGames = history.slice(0, 4);
  const wins = history.filter((h) => h.result === "win").length;

  return (
    <>
      <h1 className="page-title">Профиль</h1>

      <div className="panel profile-head">
        <Avatar name="АК" size="xl" />
        <div className="profile-id">
          <div className="profile-name">
            {CURRENT_USER} <YouBadge />
          </div>
          <div className="profile-sub">Участник хакатона · с 2025 года</div>
        </div>
        <div className="profile-chips">
          <span className="balance-chip">
            <Coin />
            {fmt(balance)}
          </span>
          <span className="balance-chip">
            <Coin blue />
            {fmt(reserve)}
          </span>
        </div>
      </div>

      <div className="stat-row" style={{ margin: "16px 0" }}>
        <Stat icon={<Coin />} value={fmt(balance)} label="баланс" tone="gold" />
        <Stat icon={<Icon name="users" />} value={String(history.length)} label="игр сыграно" />
        <Stat icon={<Icon name="trophy" />} value={String(wins)} label="побед" tone="green" />
        <Stat
          icon={<Icon name="percent" />}
          value={
            history.length > 0
              ? `${((wins / history.length) * 100).toFixed(1).replace(".", ",")}%`
              : "—"
          }
          label="винрейт"
          tone="blue"
        />
      </div>

      <div className="two-col">
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h3 style={{ margin: 0 }}>Последние игры</h3>
            <Link to="/history" style={{ color: "var(--color-red)", fontSize: 13, fontWeight: 600 }}>
              Вся история →
            </Link>
          </div>

          {lastGames.map((h, i) => (
            <div className="tx-row" key={i}>
              {h.result === "win" ? (
                <span className="tag-win">● Выигрыш</span>
              ) : (
                <span className="tag-lose">● Проигрыш</span>
              )}
              <span>
                <span className="name">{h.room}</span>
                <br />
                <span className="date">{h.date}</span>
              </span>
              <span className={`amt ${h.amount >= 0 ? "plus" : "minus"}`}>
                {h.amount >= 0 ? "+" : "−"}
                {fmt(Math.abs(h.amount))}
              </span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Достижения</h3>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.title} className={`ach${a.unlocked ? "" : " locked"}`}>
                <span className="ach-ico">
                  <Icon name={a.icon} size={16} />
                </span>
                <span className="txt">
                  <b>{a.title}</b>
                  <span>{a.desc}</span>
                </span>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 20 }}>Уровень 3 · Игрок</h3>
          <div className="progress">
            <div className="fill" style={{ width: "75%" }} />
          </div>
          <div className="note">9 из 12 побед до следующего уровня</div>
        </div>
      </div>
    </>
  );
}
