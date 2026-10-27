/**
 * crossTabQueueSync.ts - Persistência da Fila no LocalStorage e Sincronização entre Abas
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Arquitetura de Sincronização em Tempo Real Multi-Abas:
 * - Persistência segura em LocalStorage com fallback em memória para SSR e ambientes Node.js
 * - Listener nativo de window 'storage' para detecção imediata de mutações originadas em outras abas
 * - Canal auxiliar via BroadcastChannel para sincronização instantânea em sub-milissegundos
 * - Identificador único de aba (tabId) com trava anti-eco (ignora mensagens emitidas pela própria aba)
 * - Integração automática com o Zustand Store e hook React useCrossTabQueueSync
 */

import { QueueItem, QueueItemStatus } from "@/types/poster";
import { usePosterStore } from "@/store/usePosterStore";
import { getSafeStorage, isBrowserEnvironment } from "./safeStorage";
import { useEffect, useState, useRef } from "react";

export { getSafeStorage, isBrowserEnvironment };
export const isBrowser = isBrowserEnvironment;

export const POSTER_STORAGE_KEY = "v5-apollo-poster-store";
export const POSTER_QUEUE_REALTIME_KEY = "v5_poster_queue_sync_event";
export const POSTER_BROADCAST_CHANNEL_NAME = "v5_apollo_poster_channel";

export type CrossTabSyncAction =
  | "QUEUE_ITEM_ENQUEUED"
  | "QUEUE_ITEM_UPDATED"
  | "QUEUE_ITEM_REMOVED"
  | "QUEUE_BATCH_SYNCED"
  | "QUEUE_CLEARED"
  | "QUEUE_FULL_REHYDRATE";

export interface CrossTabSyncPayload {
  action: CrossTabSyncAction;
  tabId: string;
  timestamp: number;
  items?: QueueItem[];
  item?: QueueItem;
  itemId?: string;
  status?: QueueItemStatus;
}

/**
 * Identificador exclusivo da aba/sessão atual gerado na inicialização do módulo
 */
let currentTabId: string | null = null;

export function getCurrentTabId(): string {
  if (!currentTabId) {
    if (isBrowser() && typeof window.sessionStorage !== "undefined") {
      try {
        let storedId = window.sessionStorage.getItem("v5_poster_tab_id");
        if (!storedId) {
          storedId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          window.sessionStorage.setItem("v5_poster_tab_id", storedId);
        }
        currentTabId = storedId;
      } catch {
        currentTabId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      }
    } else {
      currentTabId = `tab_node_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
  }
  return currentTabId;
}

/**
 * Serializa a fila de agendamento em formato JSON seguro
 */
export function serializeQueue(queue: QueueItem[]): string {
  try {
    return JSON.stringify(queue);
  } catch (err) {
    console.error("[crossTabQueueSync] Erro ao serializar fila:", err);
    return "[]";
  }
}

/**
 * Desserializa uma string JSON recuperada do LocalStorage validando integridade
 */
export function deserializeQueue(rawJson: string | null): QueueItem[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item === "object" && typeof item.id === "string");
    }
    return [];
  } catch (err) {
    console.warn("[crossTabQueueSync] Falha ao desserializar JSON da fila:", err);
    return [];
  }
}

/**
 * Salva um snapshot dedicado da fila de agendamento no storage
 */
export function saveQueueSnapshot(queue: QueueItem[]): boolean {
  try {
    const storage = getSafeStorage();
    storage.setItem(POSTER_QUEUE_REALTIME_KEY, serializeQueue(queue));
    return true;
  } catch (err) {
    console.warn("[crossTabQueueSync] Não foi possível persistir snapshot da fila:", err);
    return false;
  }
}

/**
 * Carrega o snapshot mais recente da fila diretamente do storage
 */
export function loadQueueSnapshot(): QueueItem[] | null {
  try {
    const storage = getSafeStorage();
    const raw = storage.getItem(POSTER_QUEUE_REALTIME_KEY);
    if (!raw) return null;
    return deserializeQueue(raw);
  } catch {
    return null;
  }
}

/**
 * Emite notificação de mutação para todas as outras abas abertas
 */
export function notifyCrossTabQueueChange(
  action: CrossTabSyncAction,
  details: {
    items?: QueueItem[];
    item?: QueueItem;
    itemId?: string;
    status?: QueueItemStatus;
  } = {}
): void {
  const payload: CrossTabSyncPayload = {
    action,
    tabId: getCurrentTabId(),
    timestamp: Date.now(),
    ...details
  };

  const payloadString = JSON.stringify(payload);

  // 1. Notificação via BroadcastChannel (sub-milissegundos)
  if (isBrowser() && typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(POSTER_BROADCAST_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    } catch {
      // Ignora erro em navegadores antigos
    }
  }

  // 2. Notificação via Storage (LocalStorage no browser, MemoryStorage em headless)
  try {
    const storage = getSafeStorage();
    storage.setItem(POSTER_QUEUE_REALTIME_KEY, payloadString);
  } catch {
    // Falha silenciosa de storage
  }
}

/**
 * Cria o ouvinte unificado de mutações entre abas (StorageEvent + BroadcastChannel)
 */
export function createCrossTabSyncListener(
  onSync: (payload: CrossTabSyncPayload) => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const myTabId = getCurrentTabId();

  // Handler do StorageEvent
  const handleStorageEvent = (event: StorageEvent) => {
    // 1. Mudança no snapshot de realtime
    if (event.key === POSTER_QUEUE_REALTIME_KEY && event.newValue) {
      try {
        const payload: CrossTabSyncPayload = JSON.parse(event.newValue);
        if (payload.tabId && payload.tabId !== myTabId) {
          onSync(payload);
        }
      } catch {
        // Formato não reconhecido
      }
    }

    // 2. Mudança direta no store do Zustand por outra aba
    if (event.key === POSTER_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state?.dispatchQueue) {
          onSync({
            action: "QUEUE_FULL_REHYDRATE",
            tabId: "external_storage",
            timestamp: Date.now(),
            items: parsed.state.dispatchQueue
          });
        }
      } catch {
        // Ignora
      }
    }
  };

  window.addEventListener("storage", handleStorageEvent);

  // Handler do BroadcastChannel
  let broadcastChannel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel(POSTER_BROADCAST_CHANNEL_NAME);
      broadcastChannel.onmessage = (event: MessageEvent<CrossTabSyncPayload>) => {
        const payload = event.data;
        if (payload && payload.tabId !== myTabId) {
          onSync(payload);
        }
      };
    } catch {
      broadcastChannel = null;
    }
  }

  // Função de limpeza (cleanup)
  return () => {
    window.removeEventListener("storage", handleStorageEvent);
    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch {
        // Ignora
      }
    }
  };
}

/**
 * Hook React para ativar a sincronização bidirecional em tempo real entre abas
 */
export function useCrossTabQueueSync(options: {
  enabled?: boolean;
  onSyncReceived?: (payload: CrossTabSyncPayload) => void;
} = {}) {
  const { enabled = true, onSyncReceived } = options;
  const onSyncReceivedRef = useRef(onSyncReceived);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number | null>(null);
  const [syncCount, setSyncCount] = useState<number>(0);
  const [isSyncActive, setIsSyncActive] = useState<boolean>(true);

  useEffect(() => {
    onSyncReceivedRef.current = onSyncReceived;
  }, [onSyncReceived]);

  useEffect(() => {
    if (!enabled || !isBrowser()) return;

    const cleanup = createCrossTabSyncListener((payload) => {
      setLastSyncTimestamp(payload.timestamp);
      setSyncCount((prev) => prev + 1);

      // Aplica a mutação correspondente no Zustand Store
      const store = usePosterStore.getState();

      switch (payload.action) {
        case "QUEUE_ITEM_ENQUEUED":
          if (payload.item) {
            const exists = store.dispatchQueue.some((i) => i.id === payload.item!.id);
            if (!exists) {
              store.enqueueQueueItem(payload.item);
            }
          }
          break;

        case "QUEUE_ITEM_UPDATED":
          if (payload.itemId && payload.status) {
            store.updateQueueItemStatus(payload.itemId, payload.status);
          }
          break;

        case "QUEUE_ITEM_REMOVED":
          if (payload.itemId) {
            store.removeQueueItem(payload.itemId);
          }
          break;

        case "QUEUE_BATCH_SYNCED":
          if (payload.items && payload.items.length > 0) {
            store.syncQueueItems(payload.items);
          }
          break;

        case "QUEUE_CLEARED":
          store.clearCompletedQueue();
          break;

        case "QUEUE_FULL_REHYDRATE":
          if (payload.items) {
            store.syncQueueItems(payload.items);
          }
          break;
      }

      onSyncReceivedRef.current?.(payload);
    });

    return () => {
      cleanup();
    };
  }, [enabled]);

  return {
    isSyncActive,
    lastSyncTimestamp,
    syncCount,
    tabId: getCurrentTabId()
  };
}
