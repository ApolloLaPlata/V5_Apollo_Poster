"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore, ToastItem } from "@/lib/toast/useToast";
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastItem["type"]) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-zinc-950/90 shadow-emerald-500/5";
      case "error":
        return "border-rose-500/30 bg-zinc-950/90 shadow-rose-500/5";
      case "warning":
        return "border-amber-500/30 bg-zinc-950/90 shadow-amber-500/5";
      case "info":
        return "border-blue-500/30 bg-zinc-950/90 shadow-blue-500/5";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto border rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-xs ${getBorderColor(
              t.type
            )}`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5">{getIcon(t.type)}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-white leading-tight">{t.title}</h4>
                  {t.channel && (
                    <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase border border-zinc-700/60">
                      {t.channel}
                    </span>
                  )}
                </div>
                {t.message && (
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed break-words">{t.message}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-500 hover:text-zinc-300 transition p-0.5 rounded shrink-0"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
