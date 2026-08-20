export type ToastType = "info" | "error";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toasts: ToastData[]) => void;

let currentId = 0;

class ToastService {
  private toasts: ToastData[] = [];
  private listeners = new Set<ToastListener>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  showToast(message: string, type: ToastType = "info") {
    const id = `toast-${++currentId}`;
    const toast: ToastData = { id, message, type };

    this.toasts = [...this.toasts, toast];
    this.notify();

    const timer = setTimeout(() => this.removeToast(id), 3000);
    this.timers.set(id, timer);
  }

  removeToast(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }
}

export const toastService = new ToastService();
