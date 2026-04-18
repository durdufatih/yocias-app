"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastData[];
  remove: (id: number) => void;
}

const icons: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};
const colors: Record<ToastType, string> = {
  success: "bg-primary text-white",
  error: "bg-error text-white",
  info: "bg-secondary text-white",
};

function Toast({ toast, remove }: { toast: ToastData; remove: () => void }) {
  useEffect(() => {
    const t = setTimeout(remove, 3500);
    return () => clearTimeout(t);
  }, [remove]);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-right-5 ${colors[toast.type]}`}
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <span
        className="material-symbols-outlined text-base flex-shrink-0"
        style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
      >
        {icons[toast.type]}
      </span>
      <span>{toast.message}</span>
      <button onClick={remove} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-base" style={{ fontSize: "16px" }}>close</span>
      </button>
    </div>
  );
}

export default function Toasts({ toasts, remove }: ToastProps) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} remove={() => remove(t.id)} />
      ))}
    </div>
  );
}
