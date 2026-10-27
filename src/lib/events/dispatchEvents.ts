"use client";

import { usePosterStore } from "@/store/usePosterStore";
import { toast } from "@/lib/toast/useToast";
import { SocialPlatform } from "@/types/poster";

export type DispatchEventType =
  | "POST_SCHEDULED"
  | "POST_DISPATCHED"
  | "POST_FAILED"
  | "NEWSLETTER_DUAL_DISPATCHED"
  | "COMMENT_TRIGGER_MATCHED"
  | "DM_PRIVATE_SENT"
  | "DEAL_BROADCAST_SENT";

export interface DispatchEventPayloadMap {
  POST_SCHEDULED: { postId: string; title: string; platforms: SocialPlatform[]; scheduledAt: string };
  POST_DISPATCHED: { postId: string; title: string; platforms: SocialPlatform[]; status: "success" | "failed" };
  POST_FAILED: { postId: string; title: string; error: string; retryCount?: number };
  NEWSLETTER_DUAL_DISPATCHED: { issueId: string; subject: string; sentCount: number; blogSlug: string };
  COMMENT_TRIGGER_MATCHED: { ruleId: string; username: string; keyword: string; commentId: string };
  DM_PRIVATE_SENT: { commentId: string; username: string; ctaUrl: string; latencyMs: number };
  DEAL_BROADCAST_SENT: { dealId: string; productName: string; channels: Array<"whatsapp" | "telegram">; discountPercentage: number };
}

type EventListener<T extends DispatchEventType> = (payload: DispatchEventPayloadMap[T]) => void;

class DispatchEventBus {
  private listeners: { [K in DispatchEventType]?: Set<EventListener<K>> } = {};
  private inMemoryHistory: Array<{
    type: DispatchEventType;
    payload: any;
    timestamp: string;
  }> = [];

  public on<T extends DispatchEventType>(event: T, listener: EventListener<T>): () => void {
    if (!this.listeners[event]) {
      (this.listeners as any)[event] = new Set();
    }
    (this.listeners as any)[event].add(listener);
    return () => this.off(event, listener);
  }

  public off<T extends DispatchEventType>(event: T, listener: EventListener<T>): void {
    const eventSet = (this.listeners as any)[event];
    if (eventSet) {
      eventSet.delete(listener);
    }
  }

  public emit<T extends DispatchEventType>(event: T, payload: DispatchEventPayloadMap[T]): void {
    const timestamp = new Date().toISOString();

    // 1. Armazenar no histórico em memória
    this.inMemoryHistory.unshift({ type: event, payload, timestamp });
    if (this.inMemoryHistory.length > 100) {
      this.inMemoryHistory.pop();
    }

    // 2. Notificar ouvintes registrados
    const eventSet = this.listeners[event];
    if (eventSet) {
      eventSet.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[DispatchEventBus] Erro no listener do evento ${event}:`, err);
        }
      });
    }

    // 3. Sincronizar automaticamente no store de logs
    this.syncToPosterStore(event, payload);
  }

  public getHistory() {
    return [...this.inMemoryHistory];
  }

  private syncToPosterStore<T extends DispatchEventType>(event: T, payload: DispatchEventPayloadMap[T]): void {
    try {
      const store = usePosterStore.getState();

      switch (event) {
        case "POST_DISPATCHED": {
          const p = payload as DispatchEventPayloadMap["POST_DISPATCHED"];
          store.addLog({
            channel: p.platforms[0] || "instagram",
            action: "publish",
            status: p.status,
            statusCode: p.status === "success" ? 200 : 500,
            message: `Publicação "${p.title}" despachada para [${p.platforms.join(", ")}]`,
            payloadSummary: `Post ID: ${p.postId}`,
            latencyMs: 180
          });
          if (p.status === "success") {
            toast.success("Post Despachado com Sucesso", `Publicado em ${p.platforms.join(", ")}`, p.platforms[0]);
          } else {
            toast.error("Erro no Despacho do Post", p.title, p.platforms[0]);
          }
          break;
        }
        case "NEWSLETTER_DUAL_DISPATCHED": {
          const p = payload as DispatchEventPayloadMap["NEWSLETTER_DUAL_DISPATCHED"];
          store.addLog({
            channel: "newsletter",
            action: "publish",
            status: "success",
            statusCode: 201,
            message: `Disparo Dual: Newsletter enviada para ${p.sentCount} inscritos e artigo indexado no AutoBlog (${p.blogSlug})`,
            payloadSummary: `Assunto: ${p.subject}`,
            latencyMs: 420
          });
          toast.success("Disparo Dual Concluído", `E-mail enviado e artigo publicado em /artigo/${p.blogSlug}`, "Dual Dispatch");
          break;
        }
        case "DM_PRIVATE_SENT": {
          const p = payload as DispatchEventPayloadMap["DM_PRIVATE_SENT"];
          store.addLog({
            channel: "instagram",
            action: "dm_dispatch",
            status: "success",
            statusCode: 200,
            message: `DM Privada ancorada no comment_id ${p.commentId} entregue para @${p.username}`,
            payloadSummary: `Link enviado: ${p.ctaUrl}`,
            latencyMs: p.latencyMs
          });
          toast.success("Direct Message Entregue", `@${p.username} recebeu o link rastreado`, "Comment-to-DM");
          break;
        }
        case "DEAL_BROADCAST_SENT": {
          const p = payload as DispatchEventPayloadMap["DEAL_BROADCAST_SENT"];
          store.addLog({
            channel: p.channels[0] || "telegram",
            action: "group_broadcast",
            status: "success",
            statusCode: 200,
            message: `Oferta Finders transmitida para [${p.channels.join(", ")}]: ${p.productName} (-${p.discountPercentage}%)`,
            payloadSummary: `Deal ID: ${p.dealId}`,
            latencyMs: 250
          });
          toast.success("Oferta VIP Transmitida", `${p.productName} enviado para ${p.channels.join(", ")}`, "Finders VIP");
          break;
        }
        case "POST_FAILED": {
          const p = payload as DispatchEventPayloadMap["POST_FAILED"];
          store.addLog({
            channel: "instagram",
            action: "publish",
            status: "failed",
            statusCode: 502,
            message: `Falha no despacho do post "${p.title}": ${p.error}`,
            payloadSummary: `Tentativa: ${p.retryCount || 1}`,
            latencyMs: 50
          });
          toast.error("Falha no Despacho", `${p.title}: ${p.error}`, "Dispatcher");
          break;
        }
        default:
          break;
      }
    } catch {
      // Ignora erro se executado fora de contexto de browser (ex: SSR)
    }
  }
}

export const dispatchEventBus = new DispatchEventBus();
