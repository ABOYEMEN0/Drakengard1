"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "info";
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, variant?: Toast["variant"]) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = "success") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full items-center gap-3 rounded-card border border-gold/30 bg-navy px-4 py-3 text-sm text-ivory shadow-lift"
            role="status"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
              {t.variant === "success" ? <Check size={13} /> : <Info size={13} />}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="text-ivory/50 transition-colors hover:text-ivory"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
