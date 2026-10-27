"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  ScheduledPost, 
  NewsletterIssue, 
  CommentRule, 
  CommentTriggerEvent, 
  GroupBroadcastDeal, 
  DispatchLogEntry, 
  DispatchAnalyticsSummary,
  SocialPlatform,
  QueueItem,
  QueueItemStatus
} from "@/types/poster";
import { 
  SEED_POSTS, 
  SEED_NEWSLETTERS, 
  SEED_RULES, 
  SEED_DEALS 
} from "@/lib/seeds/posterSeeds";
import {
  BroadcastHistoryEntry,
  INITIAL_BROADCAST_HISTORY,
  buildBroadcastHistoryEntry
} from "@/lib/finders/broadcastHistoryManager";
import {
  INITIAL_DISPATCH_QUEUE,
  enqueue as enqueueItemQueue,
  enqueueBatch as enqueueBatchItemsQueue,
  updateItemStatus as updateQueueItemStatusUtil,
  cancelQueueItem as cancelQueueItemUtil,
  removeQueueItem as removeQueueItemUtil,
  clearCompletedItems as clearCompletedItemsUtil,
  applyRetryToQueueItem
} from "@/lib/queue/dispatchQueue";

export type PosterTab = "calendar" | "newsletter" | "comment" | "offers" | "logs";

interface PosterStoreState {
  // Navegação
  activeTab: PosterTab;
  setActiveTab: (tab: PosterTab) => void;

  // 1. Calendário Mestre
  posts: ScheduledPost[];
  addPost: (post: Omit<ScheduledPost, "id" | "createdAt" | "updatedAt">) => void;
  updatePost: (id: string, updates: Partial<ScheduledPost>) => void;
  deletePost: (id: string) => void;
  reschedulePost: (id: string, newDate: string) => void;

  // 2. Motor Dual Beehiiv / Substack
  newsletterDraft: NewsletterIssue;
  updateNewsletterDraft: (updates: Partial<NewsletterIssue>) => void;

  // 3. Comment-to-DM (ChatbotX)
  commentRules: CommentRule[];
  triggerEvents: CommentTriggerEvent[];
  addCommentRule: (rule: Omit<CommentRule, "id" | "totalTriggered">) => void;
  updateCommentRule: (id: string, updates: Partial<CommentRule>) => void;
  deleteCommentRule: (id: string) => void;
  toggleCommentRule: (id: string) => void;
  logCommentTrigger: (event: Omit<CommentTriggerEvent, "id" | "timestamp">) => void;

  // 4. Despachador de Grupos VIP (Finders Hub)
  deals: GroupBroadcastDeal[];
  addDeal: (deal: Omit<GroupBroadcastDeal, "id">) => void;
  updateDeal: (id: string, updates: Partial<GroupBroadcastDeal>) => void;
  importFindersDeals: (newDeals: GroupBroadcastDeal[]) => void;
  dispatchDeal: (id: string) => void;
  dispatchBatchDeals: (ids: string[]) => void;
  deleteDeal: (id: string) => void;
  broadcastHistory: BroadcastHistoryEntry[];
  addBroadcastHistory: (entry: BroadcastHistoryEntry) => void;
  clearBroadcastHistory: () => void;

  // 5. Fila de Agendamento em Background (FIFO)
  dispatchQueue: QueueItem[];
  enqueueQueueItem: (item: QueueItem) => void;
  enqueueBatchQueue: (items: QueueItem[]) => void;
  updateQueueItemStatus: (id: string, status: QueueItemStatus, errorMessage?: string) => void;
  retryQueueItem: (id: string, error: unknown, statusCode?: number) => void;
  cancelQueueItem: (id: string) => void;
  removeQueueItem: (id: string) => void;
  clearCompletedQueue: () => void;

  // 6. Logs & Telemetria
  logs: DispatchLogEntry[];
  addLog: (log: Omit<DispatchLogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;

  // Métricas
  getAnalytics: () => DispatchAnalyticsSummary;
  resetToDefaultSeeds: () => void;
}

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: "post-1",
    title: "5 Segredos de IA que a Grande Mídia Não Te Conta",
    content: "Neste vídeo revelamos as ferramentas gratuitas que estão substituindo tarefas manuais de 10 horas...",
    platforms: ["instagram", "tiktok", "youtube"],
    scheduledAt: "2026-10-28T14:00:00",
    status: "scheduled",
    mediaType: "video",
    tags: ["IA", "Produtividade", "Shorts"],
    createdAt: "2026-10-26T10:00:00",
    updatedAt: "2026-10-26T10:00:00"
  },
  {
    id: "post-2",
    title: "Relatório de Mercado: O Futuro dos Blogs Programáticos",
    content: "Como indexar 1.000 artigos com E-E-A-T em 30 dias sem sofrer penalização de spam...",
    platforms: ["autoblog", "wordpress", "newsletter"],
    scheduledAt: "2026-10-29T10:00:00",
    status: "scheduled",
    mediaType: "image",
    tags: ["SEO", "AutoBlog", "Newsletter"],
    createdAt: "2026-10-26T11:00:00",
    updatedAt: "2026-10-26T11:00:00"
  },
  {
    id: "post-3",
    title: "Drop Exclusivo: Teclado Mecânico Magnético 60%",
    content: "Cupom relâmpago de 45% OFF liberado só para os membros do grupo VIP! Link na bio.",
    platforms: ["whatsapp", "telegram", "instagram"],
    scheduledAt: "2026-10-27T18:30:00",
    status: "published",
    publishedAt: "2026-10-27T18:30:00",
    mediaType: "image",
    tags: ["Achadinhos", "Cupom", "VIP"],
    createdAt: "2026-10-26T12:00:00",
    updatedAt: "2026-10-27T18:30:00"
  }
];

const INITIAL_NEWSLETTER: NewsletterIssue = {
  id: "issue-draft-1",
  subject: "A Revolução Silenciosa dos Agentes Autônomos em 2026",
  previewText: "Descubra como os novos modelos estão operando tarefas de 48h sem intervenção humana...",
  contentMarkdown: `# A Revolução Silenciosa dos Agentes Autônomos em 2026

Olá! Se você acompanha tecnologia, provavelmente já percebeu que o jogo mudou.
Não estamos mais falando apenas de prompts de chat. Estamos falando de ecossistemas inteiros de agentes cooperando em tempo real.

### Os 3 Pilares do Novo Fluxo:
1. **Memória Contínua (RAG Local):** Nunca recomeçar do zero.
2. **Despacho Onicanal Nativo:** Escrever uma vez e publicar em múltiplos destinos.
3. **Micro-serviços Desacoplados:** Cada robô com seu propósito único.

> *"A produtividade não é fazer mais coisas, é eliminar o atrito entre a ideia e a distribuição."*

Nos vemos na próxima edição!`,
  targetAudience: "all",
  sendAt: "2026-10-30T09:00:00",
  status: "draft",
  openRateEstimated: 44.5,
  clickRateEstimated: 12.8,
  createdAt: "2026-10-27T00:00:00"
};

const INITIAL_RULES: CommentRule[] = [
  {
    id: "rule-1",
    name: "Automação Reel Achadinhos Tech",
    platform: "instagram",
    targetPostId: "reel_748291038",
    keywords: ["EU QUERO", "QUERO", "LINK", "ONDE COMPRA"],
    publicReplyVariants: [
      "Acabei de te enviar no direct com o melhor preço! 🔥",
      "Confere seu direct, mandei o link com desconto exclusivo! 🚀",
      "Te mandei na mensagem direta! Dá uma olhada lá 👀"
    ],
    dmMessageTemplate: "Olá! Vi que você comentou no nosso Reel sobre o Teclado Mecânico. Aqui está o link com 45% OFF: {{ctaUrl}}",
    ctaUrl: "https://v5finders.com/deal/teclado-mecanico-pro?utm_source=ig_comment_dm",
    isActive: true,
    totalTriggered: 142
  },
  {
    id: "rule-2",
    name: "Captação Lead TikTok Tools",
    platform: "tiktok",
    targetPostId: "video_99281726",
    keywords: ["PLANILHA", "TOOL", "GRATIS"],
    publicReplyVariants: [
      "Mandei no privado o acesso liberado! ⚡",
      "Link enviado na sua DM! Aproveita!"
    ],
    dmMessageTemplate: "Aqui está o acesso gratuito à ferramenta de IA mencionada no vídeo: {{ctaUrl}}",
    ctaUrl: "https://v5tools.com/hub?utm_source=tiktok_dm",
    isActive: true,
    totalTriggered: 89
  }
];

const INITIAL_DEALS: GroupBroadcastDeal[] = [
  {
    id: "deal-1",
    productName: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS",
    store: "Shopee",
    originalPrice: 1299.90,
    promoPrice: 749.00,
    discountPercentage: 42,
    savingsAmount: 550.90,
    couponCode: "APOLLO40",
    affiliateUrl: "https://shope.ee/v5_curvo_27?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "12:30",
    status: "pending",
    totalClicks: 214
  },
  {
    id: "deal-2",
    productName: "Air Fryer Digital 5.5L Aço Inox Touch",
    store: "Mercado Livre",
    originalPrice: 489.00,
    promoPrice: 289.90,
    discountPercentage: 40,
    savingsAmount: 199.10,
    couponCode: "CUPOM20",
    affiliateUrl: "https://mercadolivre.com.br/sec/airfryer?utm_source=v5poster_vip",
    targetChannels: ["telegram"],
    scheduledTime: "16:00",
    status: "pending",
    totalClicks: 168
  },
  {
    id: "deal-3",
    productName: "Robô Aspirador Inteligente com Mop & Laser",
    store: "AliExpress",
    originalPrice: 1890.00,
    promoPrice: 890.00,
    discountPercentage: 53,
    savingsAmount: 1000.00,
    couponCode: "BRAZIL100",
    affiliateUrl: "https://aliexpress.com/item/robo_v5?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "20:00",
    status: "sent",
    totalClicks: 382
  }
];

const INITIAL_LOGS: DispatchLogEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-10-27T00:30:12",
    channel: "instagram",
    action: "comment_reply",
    status: "success",
    statusCode: 200,
    message: "DM privada enviada com sucesso ancorada no comment_id #98124",
    payloadSummary: "Destinatário: @lucas_dev • Gatilho: LINK",
    latencyMs: 142
  },
  {
    id: "log-2",
    timestamp: "2026-10-27T00:15:00",
    channel: "autoblog",
    action: "publish",
    status: "success",
    statusCode: 201,
    message: "Artigo indexado no V5 AutoBlog com Schema BlogPosting",
    payloadSummary: "Slug: a-revolucao-silenciosa-dos-agentes-2026",
    latencyMs: 310
  }
];

export const usePosterStore = create<PosterStoreState>()(
  persist(
    (set, get) => ({
      activeTab: "calendar",
      setActiveTab: (tab) => set({ activeTab: tab }),

      posts: INITIAL_POSTS,
      addPost: (postData) =>
        set((state) => ({
          posts: [
            ...state.posts,
            {
              ...postData,
              id: `post-${Date.now()}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        })),
      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
        })),
      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id)
        })),
      reschedulePost: (id, newDate) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id
              ? { ...p, scheduledAt: newDate, status: "scheduled", updatedAt: new Date().toISOString() }
              : p
          )
        })),

      newsletterDraft: INITIAL_NEWSLETTER,
      updateNewsletterDraft: (updates) =>
        set((state) => ({
          newsletterDraft: { ...state.newsletterDraft, ...updates }
        })),

      commentRules: INITIAL_RULES,
      triggerEvents: [],
      addCommentRule: (ruleData) =>
        set((state) => ({
          commentRules: [
            ...state.commentRules,
            {
              ...ruleData,
              id: `rule-${Date.now()}`,
              totalTriggered: 0
            }
          ]
        })),
      updateCommentRule: (id, updates) =>
        set((state) => ({
          commentRules: state.commentRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          )
        })),
      deleteCommentRule: (id) =>
        set((state) => ({
          commentRules: state.commentRules.filter((r) => r.id !== id)
        })),
      toggleCommentRule: (id) =>
        set((state) => ({
          commentRules: state.commentRules.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          )
        })),
      logCommentTrigger: (eventData) =>
        set((state) => ({
          triggerEvents: [
            {
              ...eventData,
              id: `evt-${Date.now()}`,
              timestamp: new Date().toISOString()
            },
            ...state.triggerEvents.slice(0, 49) // Limite de 50 eventos
          ],
          commentRules: state.commentRules.map((r) =>
            r.id === eventData.ruleId ? { ...r, totalTriggered: r.totalTriggered + 1, lastTriggeredAt: new Date().toISOString() } : r
          )
        })),

      deals: INITIAL_DEALS,
      addDeal: (dealData) =>
        set((state) => ({
          deals: [
            ...state.deals,
            {
              ...dealData,
              id: `deal-${Date.now()}`
            }
          ]
        })),
      updateDeal: (id, updates) =>
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d))
        })),
      importFindersDeals: (newDeals) =>
        set((state) => {
          const existingIds = new Set(state.deals.map((d) => d.id));
          const uniqueNew = newDeals.filter((d) => !existingIds.has(d.id));
          return { deals: [...state.deals, ...uniqueNew] };
        }),
      dispatchDeal: (id) =>
        set((state) => {
          const now = new Date().toISOString();
          const targetDeal = state.deals.find((d) => d.id === id);
          const newHistory = targetDeal
            ? [buildBroadcastHistoryEntry({ ...targetDeal, status: "sent", sentAt: now }, now), ...state.broadcastHistory]
            : state.broadcastHistory;

          return {
            deals: state.deals.map((d) =>
              d.id === id ? { ...d, status: "sent" as const, sentAt: now } : d
            ),
            broadcastHistory: newHistory
          };
        }),
      dispatchBatchDeals: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          const now = new Date().toISOString();
          const targeted = state.deals.filter((d) => idSet.has(d.id));
          const newEntries = targeted.map((deal) =>
            buildBroadcastHistoryEntry({ ...deal, status: "sent", sentAt: now }, now)
          );

          return {
            deals: state.deals.map((d) =>
              idSet.has(d.id) ? { ...d, status: "sent" as const, sentAt: now } : d
            ),
            broadcastHistory: [...newEntries, ...state.broadcastHistory]
          };
        }),
      deleteDeal: (id) =>
        set((state) => ({
          deals: state.deals.filter((d) => d.id !== id)
        })),

      broadcastHistory: INITIAL_BROADCAST_HISTORY,
      addBroadcastHistory: (entry) =>
        set((state) => ({
          broadcastHistory: [entry, ...state.broadcastHistory.slice(0, 99)]
        })),
      clearBroadcastHistory: () => set({ broadcastHistory: [] }),

      // 5. Fila de Agendamento em Background
      dispatchQueue: INITIAL_DISPATCH_QUEUE,
      enqueueQueueItem: (item) =>
        set((state) => ({
          dispatchQueue: enqueueItemQueue(state.dispatchQueue, item)
        })),
      enqueueBatchQueue: (items) =>
        set((state) => ({
          dispatchQueue: enqueueBatchItemsQueue(state.dispatchQueue, items)
        })),
      updateQueueItemStatus: (id, status, errorMessage) =>
        set((state) => ({
          dispatchQueue: updateQueueItemStatusUtil(state.dispatchQueue, id, status, errorMessage)
        })),
      retryQueueItem: (id, error, statusCode) =>
        set((state) => {
          const target = state.dispatchQueue.find((i) => i.id === id);
          if (!target) return state;
          const { item: updatedItem } = applyRetryToQueueItem(target, error, statusCode);
          return {
            dispatchQueue: state.dispatchQueue.map((i) => (i.id === id ? updatedItem : i))
          };
        }),
      cancelQueueItem: (id) =>
        set((state) => ({
          dispatchQueue: cancelQueueItemUtil(state.dispatchQueue, id)
        })),
      removeQueueItem: (id) =>
        set((state) => ({
          dispatchQueue: removeQueueItemUtil(state.dispatchQueue, id)
        })),
      clearCompletedQueue: () =>
        set((state) => ({
          dispatchQueue: clearCompletedItemsUtil(state.dispatchQueue)
        })),

      logs: INITIAL_LOGS,
      addLog: (logData) =>
        set((state) => ({
          logs: [
            {
              ...logData,
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString()
            },
            ...state.logs.slice(0, 99) // Limite de 100 logs
          ]
        })),
      clearLogs: () => set({ logs: [] }),

      getAnalytics: () => {
        const state = get();
        const totalPublished = state.posts.filter((p) => p.status === "published").length;
        const totalDealsSent = state.deals.filter((d) => d.status === "sent").length;
        const totalDispatched = totalPublished + totalDealsSent;
        const totalFailed = state.posts.filter((p) => p.status === "failed").length;
        const successRate = totalDispatched + totalFailed > 0 
          ? Math.round((totalDispatched / (totalDispatched + totalFailed)) * 100) 
          : 100;
        const dmsSentCount = state.commentRules.reduce((acc, r) => acc + r.totalTriggered, 0);

        return {
          totalDispatched,
          successRate,
          dmsSentCount,
          totalReachEstimated: (totalDispatched * 2400) + (dmsSentCount * 12),
          activeAutomations: state.commentRules.filter((r) => r.isActive).length,
          pendingQueueCount: state.posts.filter((p) => p.status === "scheduled").length + state.deals.filter((d) => d.status === "pending").length
        };
      },

      resetToDefaultSeeds: () =>
        set({
          posts: SEED_POSTS,
          newsletterDraft: SEED_NEWSLETTERS[0],
          commentRules: SEED_RULES,
          deals: SEED_DEALS
        })
    }),
    {
      name: "v5-apollo-poster-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        posts: state.posts,
        commentRules: state.commentRules,
        deals: state.deals,
        dispatchQueue: state.dispatchQueue,
        broadcastHistory: state.broadcastHistory,
        logs: state.logs,
        newsletterDraft: state.newsletterDraft
      })
    }
  )
);
