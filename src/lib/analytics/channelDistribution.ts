/**
 * channelDistribution.ts - Distribuição Proporcional de Posts por Canal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Agrupamento Estratégico nas 4 Verticais Onicanal:
 * 1. Blog & Portais: V5 AutoBlog REST, WordPress REST API
 * 2. Email & Newsletter: Dual Beehiiv / Resend (HTML responsivo + Markdown)
 * 3. Redes Sociais: Instagram Graph, TikTok Video, YouTube Data v3, Kwai, Threads, X/Twitter
 * 4. Grupos VIP & Mensageria: Telegram Bot API, WhatsApp Cloud API (Finders Hub)
 */

import {
  ScheduledPost,
  GroupBroadcastDeal,
  QueueItem,
  DispatchLogEntry,
  SocialPlatform
} from "@/types/poster";

export type ChannelGroupKey = "blog" | "email" | "social" | "groups";

export interface ChannelGroupDistribution {
  key: ChannelGroupKey;
  label: string;
  description: string;
  totalCount: number;
  percentage: number;
  barColorHex: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  channels: SocialPlatform[];
}

export interface DetailedChannelMetric {
  platform: SocialPlatform;
  groupKey: ChannelGroupKey;
  label: string;
  count: number;
  percentage: number;
  colorHex: string;
}

export interface ChannelDistributionReport {
  groups: ChannelGroupDistribution[];
  channels: DetailedChannelMetric[];
  topGroup: ChannelGroupDistribution;
  topPlatform: DetailedChannelMetric;
  totalTracked: number;
  calculatedAt: string;
}

/**
 * Mapeamento das plataformas para seus respectivos macro-grupos
 */
export const PLATFORM_TO_GROUP_MAP: Record<SocialPlatform, ChannelGroupKey> = {
  autoblog: "blog",
  wordpress: "blog",
  newsletter: "email",
  instagram: "social",
  tiktok: "social",
  youtube: "social",
  kwai: "social",
  x_twitter: "social",
  threads: "social",
  telegram: "groups",
  whatsapp: "groups"
};

/**
 * Nomes amigáveis e cores oficiais por plataforma
 */
export const PLATFORM_METADATA: Record<SocialPlatform, { label: string; colorHex: string }> = {
  autoblog: { label: "V5 AutoBlog", colorHex: "#3b82f6" },
  wordpress: { label: "WordPress REST", colorHex: "#2563eb" },
  newsletter: { label: "Dual Beehiiv / Resend", colorHex: "#f59e0b" },
  instagram: { label: "Instagram Graph", colorHex: "#ec4899" },
  tiktok: { label: "TikTok Video", colorHex: "#06b6d4" },
  youtube: { label: "YouTube Data v3", colorHex: "#ef4444" },
  kwai: { label: "Kwai Video", colorHex: "#f97316" },
  x_twitter: { label: "X (Twitter)", colorHex: "#71717a" },
  threads: { label: "Threads", colorHex: "#a1a1aa" },
  telegram: { label: "Telegram Bot API", colorHex: "#0ea5e9" },
  whatsapp: { label: "WhatsApp Cloud API", colorHex: "#10b981" }
};

/**
 * Definições visuais e títulos para os 4 macro-grupos
 */
export const CHANNEL_GROUP_DEFINITIONS: Record<
  ChannelGroupKey,
  {
    label: string;
    description: string;
    barColorHex: string;
    tailwindBg: string;
    tailwindText: string;
    tailwindBorder: string;
    channels: SocialPlatform[];
  }
> = {
  blog: {
    label: "Blog & Portais",
    description: "V5 AutoBlog e WordPress REST API com indexação SEO programática",
    barColorHex: "#3b82f6",
    tailwindBg: "bg-blue-500/10",
    tailwindText: "text-blue-400",
    tailwindBorder: "border-blue-500/30",
    channels: ["autoblog", "wordpress"]
  },
  email: {
    label: "Email & Newsletter",
    description: "Edições Dual Beehiiv disparadas via Resend com HTML responsivo",
    barColorHex: "#f59e0b",
    tailwindBg: "bg-amber-500/10",
    tailwindText: "text-amber-400",
    tailwindBorder: "border-amber-500/30",
    channels: ["newsletter"]
  },
  social: {
    label: "Redes Sociais",
    description: "Instagram, TikTok, YouTube Shorts, Kwai, Threads e X/Twitter",
    barColorHex: "#ec4899",
    tailwindBg: "bg-pink-500/10",
    tailwindText: "text-pink-400",
    tailwindBorder: "border-pink-500/30",
    channels: ["instagram", "tiktok", "youtube", "kwai", "x_twitter", "threads"]
  },
  groups: {
    label: "Grupos VIP & Mensageria",
    description: "Disparo controlado para canais Telegram e comunidades WhatsApp",
    barColorHex: "#10b981",
    tailwindBg: "bg-emerald-500/10",
    tailwindText: "text-emerald-400",
    tailwindBorder: "border-emerald-500/30",
    channels: ["telegram", "whatsapp"]
  }
};

/**
 * Retorna o grupo vertical ao qual uma plataforma pertence
 */
export function getChannelGroup(platform: SocialPlatform): ChannelGroupKey {
  return PLATFORM_TO_GROUP_MAP[platform] || "social";
}

/**
 * Calcula a distribuição proporcional de conteúdos por canal e por macro-grupo vertical
 */
export function calculateChannelDistribution(params: {
  posts?: ScheduledPost[];
  deals?: GroupBroadcastDeal[];
  dispatchQueue?: QueueItem[];
  logs?: DispatchLogEntry[];
}): ChannelDistributionReport {
  const {
    posts = [],
    deals = [],
    dispatchQueue = [],
    logs = []
  } = params;

  // Mapa cumulativo de ocorrências por plataforma
  const platformCounts: Record<SocialPlatform, number> = {
    autoblog: 0,
    wordpress: 0,
    newsletter: 0,
    instagram: 0,
    tiktok: 0,
    youtube: 0,
    kwai: 0,
    x_twitter: 0,
    threads: 0,
    telegram: 0,
    whatsapp: 0
  };

  // 1. Contabiliza a partir dos posts do calendário
  posts.forEach((post) => {
    post.platforms.forEach((plat) => {
      if (platformCounts[plat] !== undefined) {
        platformCounts[plat]++;
      }
    });
  });

  // 2. Contabiliza a partir das ofertas do Finders Hub
  deals.forEach((deal) => {
    const channels = deal.targetChannels || ["telegram", "whatsapp"];
    channels.forEach((ch) => {
      const plat = ch as SocialPlatform;
      if (platformCounts[plat] !== undefined) {
        platformCounts[plat]++;
      }
    });
  });

  // 3. Contabiliza a partir dos itens da fila de background
  dispatchQueue.forEach((item) => {
    item.platforms.forEach((plat) => {
      if (platformCounts[plat] !== undefined) {
        platformCounts[plat]++;
      }
    });
  });

  // 4. Contabiliza a partir dos logs de auditoria
  logs.forEach((log) => {
    if (platformCounts[log.channel] !== undefined) {
      platformCounts[log.channel]++;
    }
  });

  const totalTracked = Object.values(platformCounts).reduce((acc, count) => acc + count, 0);

  // Totais por macro-grupo
  const groupTotals: Record<ChannelGroupKey, number> = {
    blog: 0,
    email: 0,
    social: 0,
    groups: 0
  };

  (Object.keys(platformCounts) as SocialPlatform[]).forEach((plat) => {
    const groupKey = getChannelGroup(plat);
    groupTotals[groupKey] += platformCounts[plat];
  });

  // Constrói a lista detalhada de canais
  const channels: DetailedChannelMetric[] = (Object.keys(platformCounts) as SocialPlatform[])
    .map((plat) => {
      const count = platformCounts[plat];
      const percentage = totalTracked > 0 ? Math.round((count / totalTracked) * 1000) / 10 : 0;
      const meta = PLATFORM_METADATA[plat] || { label: plat, colorHex: "#a1a1aa" };
      return {
        platform: plat,
        groupKey: getChannelGroup(plat),
        label: meta.label,
        count,
        percentage,
        colorHex: meta.colorHex
      };
    })
    .sort((a, b) => b.count - a.count);

  // Constrói a lista dos 4 macro-grupos
  const groups: ChannelGroupDistribution[] = (["blog", "email", "social", "groups"] as ChannelGroupKey[]).map(
    (key) => {
      const def = CHANNEL_GROUP_DEFINITIONS[key];
      const totalCount = groupTotals[key];
      const percentage = totalTracked > 0 ? Math.round((totalCount / totalTracked) * 1000) / 10 : 0;

      return {
        key,
        label: def.label,
        description: def.description,
        totalCount,
        percentage,
        barColorHex: def.barColorHex,
        tailwindBg: def.tailwindBg,
        tailwindText: def.tailwindText,
        tailwindBorder: def.tailwindBorder,
        channels: def.channels
      };
    }
  );

  // Identifica o grupo e o canal mais ativos
  const sortedGroups = [...groups].sort((a, b) => b.totalCount - a.totalCount);
  const topGroup = sortedGroups[0] || groups[0];
  const topPlatform = channels[0] || {
    platform: "autoblog",
    groupKey: "blog",
    label: "V5 AutoBlog",
    count: 0,
    percentage: 0,
    colorHex: "#3b82f6"
  };

  return {
    groups,
    channels,
    topGroup,
    topPlatform,
    totalTracked,
    calculatedAt: new Date().toISOString()
  };
}
