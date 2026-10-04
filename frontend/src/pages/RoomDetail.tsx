import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiErr } from "../api";
import { useRoom } from "../hooks";
import { usePlayer } from "../player";
import { ballColor, fmt, fmtSigned, mmss, roomStyle, secondsLeft } from "../data";
import type { RoomState, RoomSummary } from "../types";
import { Avatar, BotAvatar, Coin, Icon, ProgressRing, Stat, YouBadge } from "../components/ui";
import { WinnerTrophy } from "../components/graphics";
import LottoDrum from "../components/LottoDrum";
import { toast } from "../toast";

const CONFETTI_COLORS = ["#e31e24", "#ffc400", "#3478f6", "#19a463", "#7b5cf0"];

const STEPS = ["Проверка участников", "Расчёт весов", "RNG — выбор победителя", "Показ результата"];

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me, refresh } = usePlayer();
  const [room, setRoom] = useRoom(id ?? "0");
  const [alternatives, setAlternatives] = useState<RoomSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);

  // Локальный тик раз в секунду — таймеры и чек-лист анимации.
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Баланс меняется после розыгрыша — подтягиваем при смене фазы.
  useEffect(() => {
    if (room?.status === "FINISHED") refresh();
  }, [room?.status, refresh]);

  const mySeat = useMemo(
    () => room?.participants.find((p) => me && p.playerId === me.id) ?? null,
    [room, me],
  );

  if (!room) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: 60, color: "var(--color-text-secondary)" }}>
        Загружаем комнату…
      </div>
    );
  }

  if (room.status === "CLOSED") {
    return (
      <div className="panel" style={{ textAlign: "center", padding: 60 }}>
        <h3>Комната закрыта администратором</h3>
        <p style={{ color: "var(--color-text-secondary)", margin: "10px 0 20px" }}>
          Резерв забронированных баллов возвращён участникам.
        </p>
        <Link to="/lobby" className="btn btn-red">
          В лобби
        </Link>
      </div>
    );
  }

  const style = roomStyle(room.id);
  const left = secondsLeft(room.phaseEndsAt, room.serverTime);

  const join = async () => {
    if (!me) return;
    setBusy(true);
    try {
      setRoom(await api.join(room.id, me.id));
      toast(`Вы в комнате! ${fmt(room.price)} баллов зарезервировано`, "success");
      setAlternatives([]);
    } catch (e) {
      if (e instanceof ApiErr) {
        toast(e.message, "error");
        if (e.alternatives.length > 0) setAlternatives(e.alternatives);
      }
    } finally {
      setBusy(false);
    }
  };

  const buyBoost = async () => {
    if (!me) return;
    try {
      setRoom(await api.boost(room.id, me.id));
      toast(`Буст активирован: +${room.boostPercent}% к весу в розыгрыше`, "success");
    } catch (e) {
      toast(e instanceof ApiErr ? e.message : "Не удалось купить буст", "error");
    }
  };

  const leave = async () => {
    if (!me) return;
    try {
      setRoom(await api.leave(room.id, me.id));
      toast("Вы вышли из комнаты, резерв возвращён", "info");
    } catch (e) {
      toast(e instanceof ApiErr ? e.message : "Не удалось выйти", "error");
    }
  };

  /* ---------- фаза: ожидание ---------- */
  if (room.status === "OPEN") {
    const joined = mySeat != null;
    const free = room.seats - room.occupied;
    const myWeight = mySeat?.weight ?? 1;
    const totalWeight = room.participants.reduce((s, p) => s + p.weight, 0) || 1;
    const baseProb = joined ? (myWeight / totalWeight) * 100 : (100 / room.seats);
    const boostedProb = joined
      ? ((mySeat!.boost ? myWeight : 1 * (1 + room.boostPercent / 100)) / (totalWeight + (mySeat!.boost ? 0 : (room.boostPercent / 100)))) * 100
      : (100 / room.seats) * (1 + room.boostPercent / 100);

    return (
      <>
        <h1 className="page-title">
          <Link to="/games" style={{ color: "var(--color-text-tertiary)", fontWeight: 500 }}>←</Link>
          Комната #{room.id} «{room.title}»
          <span className="badge blue">Ожидание игроков</span>
        </h1>

        <div className="stat-row" style={{ marginBottom: 16 }}>
          <Stat icon={<Icon name="users" />} value={`${room.occupied}/${room.seats}`} label="мест занято" />
          <Stat icon={<Icon name="zap" />} value={fmt(room.price)} label="цена входа" tone="red" />
          <Stat icon={<Coin />} value={fmt(room.projectedFund)} label="призовой фонд" tone="gold" />
          <Stat icon={<Icon name="percent" />} value={`${room.fundPercent}%`} label="в фонд" tone="red" />
        </div>

        <div className="two-col">
          <div>
            <div className="panel" style={{ textAlign: "center", padding: "30px 20px" }}>
              {room.phaseEndsAt ? (
                <ProgressRing value={left / Math.max(1, room.waitSeconds)} stroke={16} size={190}>
                  <span className="lbl">До старта</span>
                  <br />
                  <span className="val">{mmss(left)}</span>
                </ProgressRing>
              ) : (
                <div style={{ padding: "40px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 10 }}>⏳</div>
                  <b>Ждём первого игрока</b>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 6 }}>
                    Таймер на {mmss(room.waitSeconds)} стартует, когда в комнате появится первый участник
                  </p>
                </div>
              )}
            </div>

            <div className="panel" style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Состав комнаты</h3>
                <b>{room.occupied}/{room.seats}</b>
              </div>
              <div className="avatar-row">
                {room.participants.map((p) =>
                  p.bot ? (
                    <BotAvatar key={p.id} size="md" caption />
                  ) : (
                    <Avatar key={p.id} name={p.name} size="md" you={p.playerId === me?.id} />
                  ),
                )}
                {Array.from({ length: free }).map((_, i) => (
                  <Avatar key={`e${i}`} name="empty" size="md" empty label={String(room.occupied + i + 1)} />
                ))}
              </div>

              {joined && (
                <div className="note" style={{ marginTop: 16, justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Баллы в резерве до конца раунда
                  </span>
                  <button className="link-btn" style={{ color: "var(--color-red)" }} onClick={leave}>
                    Выйти из комнаты (вернём {fmt(room.price)})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="aside-stack">
            {joined && (
              <div className="prob-cards" style={{ display: "grid", gap: 12 }}>
                <div className="prob">
                  <div className="lbl">Ваша вероятность победы</div>
                  <div className="val">{baseProb.toFixed(1).replace(".", ",")}%</div>
                </div>
                <div className="prob">
                  <div className="lbl">С бустом</div>
                  <div className="val" style={{ color: "var(--color-green-text)" }}>
                    ↗ {Math.min(100, boostedProb).toFixed(1).replace(".", ",")}%
                  </div>
                </div>
              </div>
            )}

            <div className="aside-card">
              <span className="ico" style={{ background: "var(--color-red-light)", color: "var(--color-red)" }}>
                <Icon name="zap" size={20} />
              </span>
              <h4>Буст</h4>
              <div className="sub">
                {room.boostEnabled
                  ? `+${room.boostPercent}% к весу при выборе победителя`
                  : "В этой комнате буст не предусмотрен"}
              </div>
              {room.boostEnabled && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <span className="price-tag">Цена: {room.boostPrice}</span>
                  {mySeat?.boost ? (
                    <span className="tag-win">● Активирован</span>
                  ) : joined ? (
                    <button
                      className="btn btn-red"
                      style={{ height: 36, padding: "0 14px", fontSize: 13 }}
                      onClick={buyBoost}
                    >
                      Взять буст
                    </button>
                  ) : (
                    <span className="sub">после входа</span>
                  )}
                </div>
              )}
            </div>

            <div className="aside-card">
              <span className="ico" style={{ background: "var(--color-blue-light)" }}>
                <BotAvatar size="md" />
              </span>
              <h4>Боты</h4>
              <div className="sub">{free > 0 ? `${free} своб. мест(а)` : "все места заняты"}</div>
              <div className="sub">Заполнят комнату после таймера</div>
            </div>

            {!joined && (
              <button
                className="btn btn-red btn-lg btn-block"
                onClick={join}
                disabled={busy || !me}
              >
                Войти в комнату за {fmt(room.price)} баллов
              </button>
            )}
          </div>
        </div>

        {alternatives.length > 0 && (
          <div className="panel" style={{ marginTop: 16 }}>
            <h3>Не хватило баллов? Попробуйте эти комнаты</h3>
            <div className="grid-cards">
              {alternatives.map((r) => (
                <div key={r.id} className="alt-room">
                  <span className={`hex hex-${roomStyle(r.id).hex}`}>
                    <Icon name={roomStyle(r.id).icon} size={18} />
                  </span>
                  <b>{r.title}</b>
                  <span className="sub">
                    {r.seats} мест · {r.price} баллов · фонд {fmt(r.projectedFund)}
                  </span>
                  <button className="btn btn-ghost" onClick={() => navigate(`/rooms/${r.id}`)}>
                    Открыть
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  /* ---------- фаза: розыгрыш ---------- */
  if (room.status === "RUNNING") {
    const total = 8; // game.draw-seconds
    const elapsed = Math.max(0, total - left);
    const doneSteps = Math.min(STEPS.length, Math.ceil((elapsed / total) * STEPS.length + 0.34));

    return (
      <>
        <h1 className="page-title">
          Комната #{room.id} «{room.title}»
          <span className="badge red">Розыгрыш начался</span>
        </h1>

        <div className="stat-row" style={{ marginBottom: 16 }}>
          <Stat icon={<Icon name="users" />} value={`${room.occupied}/${room.seats}`} label="мест занято" />
          <Stat icon={<Icon name="zap" />} value={fmt(room.price)} label="цена входа" tone="red" />
          <Stat icon={<Coin />} value={fmt(room.currentFund)} label="призовой фонд" tone="gold" />
          <Stat icon={<Icon name="percent" />} value={`${room.fundPercent}%`} label="в фонд" tone="red" />
        </div>

        <div className="two-col">
          <div className="panel" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <h3 style={{ margin: 0 }}>Розыгрыш</h3>
              <span className="live-badge">
                <i />
                LIVE
              </span>
            </div>
            <div className="drum-wrap" style={{ marginTop: 10 }}>
              <LottoDrum
                balls={room.participants.map((p) => ({
                  seat: p.seat,
                  boost: p.boost,
                  bot: p.bot,
                }))}
                winnerSeat={null}
                reveal={false}
                size={360}
              />
            </div>
            <div style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 8 }}>
              Определяем победителя… результат уже рассчитан backend-логикой
            </div>
          </div>

          <div className="panel">
            <h3>Текущий ход</h3>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div key={s} className={`step${i < doneSteps ? " done" : ""}`}>
                  <span className="ok">
                    <Icon name="check" size={18} />
                  </span>
                  {s}
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 18 }}>Участники и веса</h3>
            <div className="weight-list">
              {room.participants.map((p) => (
                <div key={p.id} className="weight-row">
                  <span className="mini-ball" style={{ background: ballColor(p.seat) }}>
                    {p.seat}
                  </span>
                  <span className="name">
                    {p.name}
                    {p.playerId === me?.id && <YouBadge />}
                  </span>
                  {p.boost && <span className="tag-warn">⚡ буст</span>}
                  <b>×{p.weight.toFixed(2).replace(".", ",")}</b>
                </div>
              ))}
            </div>
            <div className="note" style={{ marginTop: 10 }}>
              Победителя выбирает ГСЧ на backend с учётом веса каждого места — оболочка только
              транслирует результат
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---------- фаза: результаты ---------- */
  const hero = room.winnerName;
  const iWon = room.winnerPlayerId != null && me != null && room.winnerPlayerId === me.id;
  const winnerSeat = room.participants.find((p) => p.name === hero)?.seat ?? null;
  const myNet = mySeat ? (iWon ? (room.payout ?? 0) - room.price : -room.price) : 0;

  const confetti = Array.from({ length: 36 }).map((_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 12) * 0.35,
    dur: 2.6 + ((i * 7) % 20) / 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rot: (i * 53) % 360,
  }));

  return (
    <>
      <h1 className="page-title">
        Комната #{room.id} «{room.title}»
        <span className="badge green">Раунд завершён</span>
      </h1>

      <section className="winners-hero">
        <div className="confetti">
          {confetti.map((c, i) => (
            <i
              key={i}
              style={{
                left: `${c.left}%`,
                background: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.dur}s`,
                transform: `rotate(${c.rot}deg)`,
              }}
            />
          ))}
        </div>

        <WinnerTrophy size={104} />
        <h2>{iWon ? "Вы победили!" : "Победитель определён"}</h2>

        <div className="hero-winner">
          <span className="medal gold">
            {winnerSeat ?? <Icon name="trophy" size={20} />}
          </span>
          <Avatar name={hero ?? "—"} size="md" bot={room.winnerIsBot} you={iWon} />
          <span>
            <span className="name">
              {hero}
              {iWon && <YouBadge />}
            </span>
            <br />
            <span className="sub">
              Выигрыш: {fmt(room.payout ?? 0)} баллов {room.winnerIsBot && "(бот — приз остаётся в системе)"}
            </span>
          </span>
        </div>

        {mySeat && (
          <div className={`note ${iWon ? "win" : ""}`} style={{ marginTop: 14 }}>
            Ваш итог раунда:{" "}
            <b className={iWon ? "plus" : "minus"}>{fmtSigned(myNet)}</b>{" "}
            (вход {fmt(room.price)}
            {iWon ? ` + приз ${fmt(room.payout ?? 0)}` : ""})
          </div>
        )}
      </section>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="panel">
          <h3>Результаты раунда</h3>
          <div className="winner-list" style={{ maxWidth: "none" }}>
            {room.participants.map((p) => (
              <div key={p.id} className={`winner-row${p.name === hero ? " first" : ""}`}>
                <span className={`medal ${p.name === hero ? "gold" : "plain"}`}>
                  <span className="mini-ball" style={{ background: ballColor(p.seat) }}>
                    {p.seat}
                  </span>
                </span>
                <Avatar name={p.name} size="sm" bot={p.bot} you={p.playerId === me?.id} />
                <span>
                  <span className="name">
                    {p.name}
                    {p.playerId === me?.id && <YouBadge />}
                  </span>
                  <br />
                  <span className="sub">вес ×{p.weight.toFixed(2).replace(".", ",")}</span>
                </span>
                <span className="prize">
                  {p.name === hero ? `+${fmt(room.payout ?? 0)}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="aside-stack">
          <div className="panel">
            <h3>Комбинация раунда</h3>
            <div className="avatar-row">
              {(room.combination.length ? room.combination : []).map((n) => (
                <span key={n} className="ball">
                  {n}
                </span>
              ))}
              {winnerSeat != null && (
                <span className="ball" style={{ background: ballColor(winnerSeat), color: "#fff" }}>
                  {winnerSeat}
                </span>
              )}
            </div>
            <div className="note" style={{ marginTop: 10 }}>
              Победный шар выделен цветом участника
            </div>
          </div>

          {room.seed && (
            <div className="panel">
              <h3>Проверяемость результата</h3>
              <div className="kv">
                <span className="k">Seed раунда</span>
                <span className="v seed">{room.seed}</span>
              </div>
              <div className="note" style={{ marginTop: 10 }}>
                Полный разбор ГСЧ и весов —{" "}
                <Link to="/log" style={{ color: "var(--color-red)", fontWeight: 600 }}>
                  в журнале раундов
                </Link>
              </div>
            </div>
          )}

          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-red" style={{ flex: 1 }} onClick={() => navigate("/auto-match")}>
              Сыграть ещё
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate("/lobby")}>
              В лобби
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
