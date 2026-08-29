"use client";

import { useEffect, useState } from "react";
import { toastService, ToastData, ToastType } from "@/lib/ui/services/toast.service";

const TOAST_STYLES: Record<
  ToastType,
  { container: string; accent: string; text: string; closeHover: string }
> = {
  info: {
    container: "bg-sky-100 border-sky-300",
    accent: "bg-sky-600",
    text: "text-sky-900",
    closeHover: "hover:bg-sky-200",
  },
  error: {
    container: "bg-red-100 border-red-300",
    accent: "bg-red-600",
    text: "text-red-900",
    closeHover: "hover:bg-red-200",
  },
};

export function Toast({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const style = TOAST_STYLES[toast.type];

  function handleClose() {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[280px] max-w-[400px] border ${style.container
        } ${exiting ? "animate-toast-exit" : "animate-toast-enter"}`}
      style={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      <div
        className={`w-1 h-8 rounded-full shrink-0 ${style.accent}`}
      />
      <span className={`text-sm flex-1 ${style.text}`}>
        {toast.message}
      </span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={handleClose}
        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${style.text} ${style.closeHover}`}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 flex flex-col gap-3 z-50"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={toastService.removeToast.bind(toastService)} />
      ))}
    </div>
  );
}
