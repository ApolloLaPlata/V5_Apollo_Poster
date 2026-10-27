/**
 * channelManager.ts - Gerenciador e Seletor de Canais de Destino VIP
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Mapeamento e Roteamento de Transmissão para:
 * - Canais VIP do Telegram (Grandes audiências broadcast)
 * - Comunidades de WhatsApp (Sub-grupos hipersegmentados)
 * - Grupos de Anúncios Restritos a Administradores
 * - Cálculo de Alcance Estimado de Membros em Tempo Real
 */

export interface BroadcastChannel {
  id: string;
  name: string;
  platform: "telegram" | "whatsapp";
  memberCount: number;
  category: "tech" | "geral" | "cupons" | "casa" | "afiliados";
  isAnnouncementOnly: boolean;
  isActive: boolean;
  handleOrJid: string; // @username do Telegram ou JID do WhatsApp
}

export interface ChannelSelectionStats {
  totalChannels: number;
  totalMembers: number;
  telegramChannelsCount: number;
  telegramMembersCount: number;
  whatsappChannelsCount: number;
  whatsappMembersCount: number;
  hasBothPlatforms: boolean;
}

/**
 * Catálogo Oficial de Canais e Comunidades VIP do Ecossistema V5 Finders
 */
export const DEFAULT_BROADCAST_CHANNELS: BroadcastChannel[] = [
  // CANAIS TELEGRAM
  {
    id: "tg_tech_vip",
    name: "Radar Tech & Hardware VIP",
    platform: "telegram",
    memberCount: 14200,
    category: "tech",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "@v5finders_tech"
  },
  {
    id: "tg_promos_geral",
    name: "Achadinhos & Ofertas Geral VIP",
    platform: "telegram",
    memberCount: 28500,
    category: "geral",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "@v5finders_vip"
  },
  {
    id: "tg_cupons_express",
    name: "Cupons Relâmpago & Bug de Preço",
    platform: "telegram",
    memberCount: 9800,
    category: "cupons",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "@v5cupons_express"
  },

  // COMUNIDADES & GRUPOS WHATSAPP
  {
    id: "wa_achadinhos_vip1",
    name: "Comunidade VIP #01 - Achadinhos",
    platform: "whatsapp",
    memberCount: 1024,
    category: "geral",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "1203630281928371@g.us"
  },
  {
    id: "wa_achadinhos_vip2",
    name: "Comunidade VIP #02 - Achadinhos",
    platform: "whatsapp",
    memberCount: 980,
    category: "geral",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "1203630291928372@g.us"
  },
  {
    id: "wa_casa_cozinha",
    name: "Grupo VIP Casa, Cozinha & Eletro",
    platform: "whatsapp",
    memberCount: 840,
    category: "casa",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "1203630281928373@g.us"
  },
  {
    id: "wa_shopee_meli",
    name: "Grupo Exclusivo Shopee & Mercado Livre",
    platform: "whatsapp",
    memberCount: 1010,
    category: "afiliados",
    isAnnouncementOnly: true,
    isActive: true,
    handleOrJid: "1203630281928374@g.us"
  }
];

/**
 * Calcula o alcance total de membros e distribuição por plataforma para canais selecionados
 */
export function calculateAudienceReach(
  selectedChannelIds: string[],
  availableChannels: BroadcastChannel[] = DEFAULT_BROADCAST_CHANNELS
): ChannelSelectionStats {
  const selectedSet = new Set(selectedChannelIds);
  const selectedList = availableChannels.filter((c) => selectedSet.has(c.id));

  let totalMembers = 0;
  let telegramChannelsCount = 0;
  let telegramMembersCount = 0;
  let whatsappChannelsCount = 0;
  let whatsappMembersCount = 0;

  selectedList.forEach((ch) => {
    totalMembers += ch.memberCount;
    if (ch.platform === "telegram") {
      telegramChannelsCount += 1;
      telegramMembersCount += ch.memberCount;
    } else if (ch.platform === "whatsapp") {
      whatsappChannelsCount += 1;
      whatsappMembersCount += ch.memberCount;
    }
  });

  return {
    totalChannels: selectedList.length,
    totalMembers,
    telegramChannelsCount,
    telegramMembersCount,
    whatsappChannelsCount,
    whatsappMembersCount,
    hasBothPlatforms: telegramChannelsCount > 0 && whatsappChannelsCount > 0
  };
}

/**
 * Agrupa canais por plataforma (Telegram vs WhatsApp)
 */
export function groupChannelsByPlatform(
  channels: BroadcastChannel[] = DEFAULT_BROADCAST_CHANNELS
): {
  telegram: BroadcastChannel[];
  whatsapp: BroadcastChannel[];
} {
  return {
    telegram: channels.filter((c) => c.platform === "telegram" && c.isActive),
    whatsapp: channels.filter((c) => c.platform === "whatsapp" && c.isActive)
  };
}

/**
 * Retorna os IDs dos canais padrão para cada plataforma
 */
export function getDefaultChannelIds(
  channels: BroadcastChannel[] = DEFAULT_BROADCAST_CHANNELS
): string[] {
  return channels.filter((c) => c.isActive).map((c) => c.id);
}

/**
 * Validador de Seleção de Canais
 */
export function validateChannelSelection(selectedIds: string[]): {
  isValid: boolean;
  error?: string;
} {
  if (!selectedIds || selectedIds.length === 0) {
    return {
      isValid: false,
      error: "Selecione ao menos um canal ou comunidade VIP para transmissão."
    };
  }
  return { isValid: true };
}
