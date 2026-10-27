"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  channel?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toastData) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toastData, id };

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    const duration = toastData.duration || 4500;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));

export const toast = {
  success: (title: string, message?: string, channel?: string) =>
    useToastStore.getState().addToast({ type: "success", title, message, channel }),
  error: (title: string, message?: string, channel?: string) =>
    useToastStore.getState().addToast({ type: "error", title, message, channel }),
  info: (title: string, message?: string, channel?: string) =>
    useToastStore.getState().addToast({ type: "info", title, message, channel }),
  warning: (title: string, message?: string, channel?: string) =>
    useToastStore.getState().addToast({ type: "warning", title, message, channel })
};
