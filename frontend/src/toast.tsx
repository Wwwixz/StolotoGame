import { useEffect, useState } from "react";
import { Icon } from "./components/ui";

/* Мини-тосты: площадка для понятных ошибок («недостаточно баллов», «раунд уже начался»). */

export interface ToastItem {
  id: number;
  text: string;
  tone: "error" | "success" | "info";
}

type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  listeners.forEach((l) => l([...items]));
}

export function toast(text: string, tone: ToastItem["tone"] = "info", ttl = 4200) {
  const item: ToastItem = { id: nextId++, text, tone };
  items = [...items, item];
  emit();
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== item.id);
    emit();
  }, ttl);
}

export function ToastHost() {
  const [list, setList] = useState<ToastItem[]>([]);
  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <div className="toast-host">
      {list.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          <span className="toast-ico">
            <Icon name={t.tone === "success" ? "check" : t.tone === "error" ? "warn" : "info"} size={16} />
          </span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
