/**
 * storeConnector.ts - Conector Oficial de Lojas de Afiliados e Hub V5 Finders
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Mapeamento e Suporte Completo às 5 Principais Lojas de Afiliados do Brasil:
 * - Shopee Brasil (#EE4D2D)
 * - Mercado Livre (#FFE600)
 * - Amazon Brasil (#FF9900)
 * - AliExpress (#FF4747)
 * - Magazine Luiza / Magalu (#0086FF)
 */

import { GroupBroadcastDeal } from "@/types/poster";
export { 
  calculateFullSavings, 
  getDealUrgency, 
  formatCurrencyBr 
} from "./discountCalculator";
export type { 
  FullSavingsResult, 
  DealUrgencyInfo, 
  DealUrgencyLevel 
} from "./discountCalculator";

export type SupportedStore = "Shopee" | "Mercado Livre" | "Amazon" | "AliExpress" | "Magalu" | "PixDrop Store" | "V5 Finders";

export interface StoreMetadata {
  name: SupportedStore;
  slug: string;
  brandColor: string;
  badgeText: string;
  textColor: string;
  borderColor: string;
  domainKeywords: string[];
  defaultAffiliateTagParam: string;
}

export const SUPPORTED_STORES: Record<SupportedStore, StoreMetadata> = {
  "Shopee": {
    name: "Shopee",
    slug: "shopee",
    brandColor: "#EE4D2D",
    badgeText: "Frete Grátis Shopee",
    textColor: "text-[#EE4D2D]",
    borderColor: "border-[#EE4D2D]/30",
    domainKeywords: ["shopee.com.br", "shope.ee", "shopee.com"],
    defaultAffiliateTagParam: "utm_source"
  },
  "Mercado Livre": {
    name: "Mercado Livre",
    slug: "mercado-livre",
    brandColor: "#FFE600",
    badgeText: "Envio FULL Rápido",
    textColor: "text-amber-300",
    borderColor: "border-amber-400/40",
    domainKeywords: ["mercadolivre.com.br", "mercadolivre.com", "meli.la", "mercadopago.com"],
    defaultAffiliateTagParam: "utm_source"
  },
  "Amazon": {
    name: "Amazon",
    slug: "amazon",
    brandColor: "#FF9900",
    badgeText: "Prime Entrega Grátis",
    textColor: "text-amber-500",
    borderColor: "border-amber-500/30",
    domainKeywords: ["amazon.com.br", "amazon.com", "amzn.to"],
    defaultAffiliateTagParam: "tag"
  },
  "AliExpress": {
    name: "AliExpress",
    slug: "aliexpress",
    brandColor: "#FF4747",
    badgeText: "Choice Oficial Global",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    domainKeywords: ["aliexpress.com", "aliexpress.com.br", "s.click.aliexpress.com"],
    defaultAffiliateTagParam: "aff_platform"
  },
  "Magalu": {
    name: "Magalu",
    slug: "magalu",
    brandColor: "#0086FF",
    badgeText: "Magalu Ouro",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    domainKeywords: ["magazineluiza.com.br", "magalu.com", "parceiromagalu.com.br"],
    defaultAffiliateTagParam: "utm_source"
  },
  "PixDrop Store": {
    name: "PixDrop Store",
    slug: "pixdrop",
    brandColor: "#10B981",
    badgeText: "Licença Digital Vitalícia",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    domainKeywords: ["pixdrop.com.br", "pixdrop", "localhost:3008", "localhost:3000"],
    defaultAffiliateTagParam: "ref"
  },
  "V5 Finders": {
    name: "V5 Finders",
    slug: "finders",
    brandColor: "#F43F5E",
    badgeText: "Radar V5 Achadinhos",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    domainKeywords: ["finders.v5apollo.com", "finders", "localhost:3001"],
    defaultAffiliateTagParam: "ref"
  }
};

/**
 * Detecta automaticamente qual das 5 lojas corresponde a uma URL informada
 */
export function detectStoreFromUrl(url: string): SupportedStore {
  if (!url || typeof url !== "string") return "Shopee";
  const lowerUrl = url.toLowerCase().trim();

  for (const [storeName, meta] of Object.entries(SUPPORTED_STORES) as [SupportedStore, StoreMetadata][]) {
    for (const kw of meta.domainKeywords) {
      if (lowerUrl.includes(kw)) {
        return storeName;
      }
    }
  }

  return "Shopee";
}

/**
 * Calcula desconto percentual e valor economizado em reais
 */
export function calculateSavings(
  originalPrice: number,
  promoPrice: number
): {
  discountPercentage: number;
  savingsAmount: number;
  isValid: boolean;
} {
  if (originalPrice <= 0 || promoPrice <= 0 || promoPrice >= originalPrice) {
    return {
      discountPercentage: 0,
      savingsAmount: 0,
      isValid: false
    };
  }

  const savingsAmount = Number((originalPrice - promoPrice).toFixed(2));
  const discountPercentage = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);

  return {
    discountPercentage,
    savingsAmount,
    isValid: true
  };
}

/**
 * Validação rigorosa dos dados de uma oferta de transmissão VIP
 */
export function validateDealData(deal: Partial<GroupBroadcastDeal>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!deal.productName || !deal.productName.trim()) {
    errors.push("O nome do produto é obrigatório.");
  }

  if (!deal.originalPrice || deal.originalPrice <= 0) {
    errors.push("O preço original deve ser maior que zero.");
  }

  if (!deal.promoPrice || deal.promoPrice <= 0) {
    errors.push("O preço promocional deve ser maior que zero.");
  }

  if (deal.originalPrice && deal.promoPrice && deal.promoPrice >= deal.originalPrice) {
    errors.push("O preço promocional deve ser menor que o preço original.");
  }

  if (!deal.affiliateUrl || !deal.affiliateUrl.trim()) {
    errors.push("A URL de afiliado da oferta é obrigatória.");
  }

  const validStores: SupportedStore[] = ["Shopee", "Mercado Livre", "Amazon", "AliExpress", "Magalu"];
  if (deal.store && !validStores.includes(deal.store)) {
    errors.push(`Loja inválida. Lojas suportadas: ${validStores.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Catálogo Curado de Ofertas Reais das 5 Lojas do V5 Finders Hub
 */
export const SAMPLE_FINDERS_DEALS: GroupBroadcastDeal[] = [
  {
    id: "deal-shopee-curvo",
    productName: "Monitor Gamer Curvo 27\" 165Hz 1ms IPS FreeSync",
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
    id: "deal-meli-airfryer",
    productName: "Air Fryer Digital 5.5L Aço Inox Touch 1800W",
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
    id: "deal-amazon-echodot",
    productName: "Echo Dot 5ª Geração Smart Speaker com Alexa e Som Imersivo",
    store: "Amazon",
    originalPrice: 429.00,
    promoPrice: 269.10,
    discountPercentage: 37,
    savingsAmount: 159.90,
    couponCode: "ALEXA10",
    affiliateUrl: "https://amzn.to/v5_echodot5?tag=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "18:00",
    status: "pending",
    totalClicks: 312
  },
  {
    id: "deal-aliexpress-robo",
    productName: "Robô Aspirador Inteligente com Mop & Sensor Laser LiDAR",
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
  },
  {
    id: "deal-magalu-smarttv",
    productName: "Smart TV 55\" 4K UHD Crystal HDR com Gaming Hub",
    store: "Magalu",
    originalPrice: 3499.00,
    promoPrice: 2184.00,
    discountPercentage: 38,
    savingsAmount: 1315.00,
    couponCode: "MAGALU200",
    affiliateUrl: "https://magazineluiza.com.br/smart-tv-55-4k?utm_source=v5poster_vip",
    targetChannels: ["whatsapp", "telegram"],
    scheduledTime: "21:30",
    status: "pending",
    totalClicks: 145
  }
];
