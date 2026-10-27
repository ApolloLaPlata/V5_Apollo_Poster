/**
 * batchDispatcher.ts - Motor de Disparo Instantâneo e Agendamento em Lote VIP
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Funcionalidades do Despacho em Lote do Finders VIP:
 * - Validação e filtragem de ofertas selecionadas
 * - Cálculo de alcance combinado de membros e canais
 * - Agendamento inteligente com espaçamento cronológico (15m, 30m, 45m, 60m)
 * - Rastreamento de progresso de despacho sequencial com throttling anti-flood
 */

import { GroupBroadcastDeal } from "@/types/poster";

export interface BatchDispatchProgress {
  total: number;
  completed: number;
  currentDealId?: string;
  currentProductName?: string;
  successCount: number;
  failedCount: number;
  percentage: number;
}

export interface BatchDispatchResult {
  total: number;
  succeeded: string[];
  failed: string[];
  startTime: string;
  endTime: string;
  durationMs: number;
}

export interface BatchScheduleConfig {
  startTime: string; // "HH:mm" (ex: "12:00")
  intervalMinutes: number; // 15, 30, 45, 60
}

export interface ScheduledDealSlot {
  dealId: string;
  productName: string;
  scheduledTime: string;
  sequenceIndex: number;
}

export interface BatchSelectionSummary {
  selectedCount: number;
  totalReach: number;
  pendingCount: number;
  alreadySentCount: number;
  canDispatch: boolean;
}

/**
 * Converte string "HH:mm" em horas e minutos numéricos
 */
export function parseTimeSlot(timeStr: string): { hours: number; minutes: number } {
  if (!timeStr || !timeStr.includes(":")) {
    return { hours: 12, minutes: 0 };
  }
  const [hStr, mStr] = timeStr.split(":");
  const hours = Math.max(0, Math.min(23, parseInt(hStr, 10) || 0));
  const minutes = Math.max(0, Math.min(59, parseInt(mStr, 10) || 0));
  return { hours, minutes };
}

/**
 * Formata horas e minutos no padrão "HH:mm" com zero à esquerda
 */
export function formatTimeSlot(hours: number, minutes: number): string {
  const normHours = ((hours % 24) + 24) % 24;
  const normMinutes = Math.max(0, Math.min(59, minutes));
  const h = String(normHours).padStart(2, "0");
  const m = String(normMinutes).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Calcula horários sequenciais espaçados para agendamento em lote de ofertas
 */
export function calculateBatchScheduleSlots(
  deals: GroupBroadcastDeal[],
  config: BatchScheduleConfig
): ScheduledDealSlot[] {
  if (!deals || deals.length === 0) return [];

  const { hours, minutes } = parseTimeSlot(config.startTime);
  const interval = Math.max(5, config.intervalMinutes || 30);

  let currentTotalMinutes = hours * 60 + minutes;

  return deals.map((deal, idx) => {
    const slotHours = Math.floor(currentTotalMinutes / 60) % 24;
    const slotMinutes = currentTotalMinutes % 60;
    const scheduledTime = formatTimeSlot(slotHours, slotMinutes);

    currentTotalMinutes += interval;

    return {
      dealId: deal.id,
      productName: deal.productName,
      scheduledTime,
      sequenceIndex: idx + 1
    };
  });
}

/**
 * Resume métricas das ofertas selecionadas (alcance total, pendentes, já enviadas)
 */
export function getBatchSelectionSummary(
  allDeals: GroupBroadcastDeal[],
  selectedIds: string[]
): BatchSelectionSummary {
  const idSet = new Set(selectedIds);
  const selectedDeals = allDeals.filter((d) => idSet.has(d.id));

  let totalReach = 0;
  let pendingCount = 0;
  let alreadySentCount = 0;

  selectedDeals.forEach((d) => {
    totalReach += d.estimatedReach || 56354;
    if (d.status === "sent") {
      alreadySentCount += 1;
    } else {
      pendingCount += 1;
    }
  });

  return {
    selectedCount: selectedDeals.length,
    totalReach,
    pendingCount,
    alreadySentCount,
    canDispatch: pendingCount > 0
  };
}

/**
 * Filtra as ofertas elegíveis para disparo a partir da seleção
 */
export function filterEligibleDealsForDispatch(
  allDeals: GroupBroadcastDeal[],
  selectedIds: string[]
): GroupBroadcastDeal[] {
  const idSet = new Set(selectedIds);
  return allDeals.filter((d) => idSet.has(d.id) && d.status !== "sent");
}
