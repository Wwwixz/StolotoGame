import type { WsEvent } from "./types";

type Handler = (e: WsEvent) => void;

/**
 * Реал-тайм канал (WebSocket). Умеет переподключаться и переподписываться,
 * а на время обрыва дергает fallback-подписчиков, чтобы UI не подвисал.
 */
class Realtime {
  private ws: WebSocket | null = null;
  private handlers = new Set<Handler>();
  private offlineHandlers = new Set<() => void>();
  private lobby = false;
  private roomSub: number | null = null;
  private retry = 0;
  private closedByUs = false;
  private offline = true;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.closedByUs = false;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    this.ws = new WebSocket(`${proto}://${window.location.host}/ws`);

    this.ws.onopen = () => {
      this.retry = 0;
      this.offline = false;
      this.resubscribe();
    };
    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as WsEvent;
        this.handlers.forEach((h) => h(data));
      } catch {
        /* мусорный кадр игнорируем */
      }
    };
    this.ws.onclose = () => {
      if (this.closedByUs) return;
      const wasOffline = this.offline;
      this.offline = true;
      if (!wasOffline) this.offlineHandlers.forEach((h) => h());
      const delay = Math.min(8000, 500 * 2 ** this.retry++);
      window.setTimeout(() => this.connect(), delay);
    };
    this.ws.onerror = () => this.ws?.close();
  }

  disconnect() {
    this.closedByUs = true;
    this.ws?.close();
    this.ws = null;
  }

  private resubscribe() {
    if (this.lobby) this.send({ action: "lobby" });
    if (this.roomSub != null) this.send({ action: "room", id: this.roomSub });
  }

  private send(msg: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  subscribeLobby(on: boolean) {
    this.lobby = on;
    if (on) {
      this.send({ action: "lobby" });
      this.connect();
      // Мгновенный снапшот, чтобы не ждать пуша.
      fetch("/api/rooms")
        .then((r) => r.json())
        .then((rooms) => this.handlers.forEach((h) => h({ type: "lobby", rooms, serverTime: Date.now() })))
        .catch(() => undefined);
    }
  }

  subscribeRoom(id: number | null, snapshot?: () => void) {
    this.roomSub = id;
    if (id != null) {
      this.send({ action: "room", id });
      this.connect();
      snapshot?.();
    }
  }

  onEvent(h: Handler) {
    this.handlers.add(h);
    return () => this.handlers.delete(h);
  }

  onOffline(h: () => void) {
    this.offlineHandlers.add(h);
    return () => this.offlineHandlers.delete(h);
  }
}

export const realtime = new Realtime();
