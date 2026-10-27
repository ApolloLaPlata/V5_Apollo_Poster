/**
 * test-etapa076.ts - Teste de Validação da Etapa 076
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Construtor de Encurtador de Link de Afiliado com Injeção de Parâmetros UTM:
 * - Geração de UTMs dedicadas para Telegram e WhatsApp (v5_tg_vip / v5_wa_vip)
 * - Injeção inteligente preservando query params originais de afiliados
 * - Geração determinística de códigos curtos (v5p.st / v5finder.link)
 * - Integração com compiladores de mensagem de Telegram e WhatsApp
 * - Compatibilidade de tipos em GroupBroadcastDeal
 */

import {
  slugifyUtm,
  sanitizeUrl,
  buildPlatformUtmParams,
  injectUtmToUrl,
  generateDeterministicShortCode,
  shortenAffiliateLink,
  generateDualPlatformLinks,
  parseTrackedAffiliateUrl,
  DEFAULT_SHORTENER_DOMAIN
} from "../src/lib/finders/affiliateLinkShortener";
import { compileWhatsAppMessage } from "../src/lib/finders/whatsappFormatter";
import { compileTelegramHtmlMessage, compileTelegramMarkdownMessage } from "../src/lib/finders/telegramFormatter";
import { GroupBroadcastDeal } from "../src/types/poster";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label}`);
  }
}

console.log("\n=======================================================");
console.log("TESTE ETAPA 076: ENCURTADOR DE LINK COM INJEÇÃO DE UTMs");
console.log("=======================================================\n");

// 1. Sanitização e Slugificação de Parâmetros UTM
console.log("1. Validando slugifyUtm e sanitizeUrl...");
assert(slugifyUtm("Monitor Gamer Curvo 27\" 165Hz") === "monitor-gamer-curvo-27-165hz", "Slugifica corretamente título com caracteres especiais");
assert(slugifyUtm("Ação & Promoção / C@sa") === "acao-promocao-c-sa", "Remove acentos e caracteres não alfanuméricos");
assert(sanitizeUrl("shope.ee/xyz123") === "https://shope.ee/xyz123", "Garante protocolo https em URLs sem protocolo");
assert(sanitizeUrl("http://amzn.to/abc") === "http://amzn.to/abc", "Preserva protocolo http existente");

// 2. Construção de Parâmetros UTM por Plataforma
console.log("\n2. Validando buildPlatformUtmParams...");
const dealOpts = {
  productName: "Echo Dot 5ª Geração",
  store: "Amazon",
  rawUrl: "https://amzn.to/3EchoDot",
  couponCode: "ALEXA30",
  discountPercentage: 35
};

const tgUtms = buildPlatformUtmParams(dealOpts, "telegram");
assert(tgUtms.utm_source === "telegram_vip", "Telegram utm_source é 'telegram_vip'");
assert(tgUtms.utm_medium === "broadcast_channel", "Telegram utm_medium é 'broadcast_channel'");
assert(tgUtms.utm_campaign === "echo-dot-5a-geracao", "utm_campaign normalizado para o produto");
assert(tgUtms.utm_content === "amazon", "utm_content identifica a loja");
assert(tgUtms.utm_term === "cupom_alexa30", "utm_term identifica o cupom de desconto");

const waUtms = buildPlatformUtmParams(dealOpts, "whatsapp");
assert(waUtms.utm_source === "whatsapp_vip", "WhatsApp utm_source é 'whatsapp_vip'");
assert(waUtms.utm_medium === "community_vip", "WhatsApp utm_medium é 'community_vip'");

const genericUtms = buildPlatformUtmParams({ ...dealOpts, couponCode: undefined }, "generic");
assert(genericUtms.utm_source === "v5_finders_vip", "Genérico utm_source é 'v5_finders_vip'");
assert(genericUtms.utm_medium === "vip_deal", "Genérico utm_medium é 'vip_deal'");
assert(genericUtms.utm_term === "desc_35off", "utm_term usa percentual de desconto quando não há cupom");

// 3. Injeção de Parâmetros UTM e Preservação de Tags de Afiliado
console.log("\n3. Validando injectUtmToUrl...");
const rawShopeeUrl = "https://shope.ee/v5_curvo?af_siteid=98765&pid=affiliate_hub";
const injectedUrl = injectUtmToUrl(rawShopeeUrl, tgUtms, "ALEXA30");

assert(injectedUrl.includes("utm_source=telegram_vip"), "Injeta utm_source=telegram_vip");
assert(injectedUrl.includes("utm_medium=broadcast_channel"), "Injeta utm_medium=broadcast_channel");
assert(injectedUrl.includes("utm_campaign=echo-dot-5a-geracao"), "Injeta utm_campaign");
assert(injectedUrl.includes("af_siteid=98765"), "Preserva tag original de afiliado af_siteid");
assert(injectedUrl.includes("pid=affiliate_hub"), "Preserva tag original de afiliado pid");
assert(injectedUrl.includes("coupon=ALEXA30"), "Anexa parâmetro de cupom auto-aplicável");

// 4. Geração Determinística de Códigos Curtos
console.log("\n4. Validando generateDeterministicShortCode...");
const code1 = generateDeterministicShortCode("deal_123_telegram_Monitor", 7);
const code2 = generateDeterministicShortCode("deal_123_telegram_Monitor", 7);
const codeDiff = generateDeterministicShortCode("deal_123_whatsapp_Monitor", 7);

assert(code1.length === 7, "Código curto possui exatamente 7 caracteres");
assert(code1 === code2, "Geração é determinística (mesma entrada resulta no mesmo código)");
assert(code1 !== codeDiff, "Entradas diferentes resultam em códigos diferentes");
assert(/^[a-z0-9]+$/i.test(code1), "Código contém apenas caracteres alfanuméricos");

// 5. Encurtamento de Link Completo (shortenAffiliateLink)
console.log("\n5. Validando shortenAffiliateLink...");
const shortLink = shortenAffiliateLink({
  dealId: "deal-teste-1",
  productName: "Air Fryer 5.5L Inox",
  store: "Mercado Livre",
  rawUrl: "https://mercadolivre.com.br/sec/airfryer?matt_tool=12345",
  couponCode: "FRYER20",
  discountPercentage: 40,
  platform: "telegram"
});

assert(shortLink.domain === DEFAULT_SHORTENER_DOMAIN, `Domínio padrão é ${DEFAULT_SHORTENER_DOMAIN}`);
assert(shortLink.shortUrl.startsWith(`https://${DEFAULT_SHORTENER_DOMAIN}/d/`), "URL encurtada possui formato correto /d/code");
assert(shortLink.trackedLongUrl.includes("matt_tool=12345"), "URL longa preserva tag do Mercado Livre");
assert(shortLink.trackedLongUrl.includes("utm_source=telegram_vip"), "URL longa contém utm_source");
assert(shortLink.utmParams.utm_term === "cupom_fryer20", "utm_term identifica o cupom da Air Fryer");

// 6. Geração de Links Duplos por Plataforma (generateDualPlatformLinks)
console.log("\n6. Validando generateDualPlatformLinks...");
const dualLinks = generateDualPlatformLinks({
  dealId: "deal-duplo-1",
  productName: "Teclado Mecânico RGB",
  store: "Shopee",
  rawUrl: "https://shope.ee/teclado_rgb",
  couponCode: "KEYBOARD10",
  discountPercentage: 25
});

assert(dualLinks.telegram.utmParams.utm_source === "telegram_vip", "Link Telegram possui utm_source telegram_vip");
assert(dualLinks.whatsapp.utmParams.utm_source === "whatsapp_vip", "Link WhatsApp possui utm_source whatsapp_vip");
assert(dualLinks.generic.utmParams.utm_source === "v5_finders_vip", "Link Genérico possui utm_source v5_finders_vip");
assert(dualLinks.telegram.shortCode !== dualLinks.whatsapp.shortCode, "Códigos de Telegram e WhatsApp são distintos para rastreamento separado");

// 7. Decodificação e Análise de Link (parseTrackedAffiliateUrl)
console.log("\n7. Validando parseTrackedAffiliateUrl...");
const parsed = parseTrackedAffiliateUrl(dualLinks.telegram.trackedLongUrl);
assert(parsed.hasV5PosterUtm === true, "Identifica presença de UTM do V5 Poster");
assert(parsed.detectedPlatform === "telegram", "Detecta plataforma Telegram com sucesso");
assert(parsed.utmParams.utm_medium === "broadcast_channel", "Decodifica utm_medium corretamente");

// 8. Integração com Formatadores de Mensagem
console.log("\n8. Validando Integração com Compiladores de Mensagem...");
const mockDealWithShortLinks: GroupBroadcastDeal = {
  id: "deal-short-test",
  productName: "Smart TV 50 4K UHD",
  store: "Magalu",
  originalPrice: 2499.00,
  promoPrice: 1799.00,
  discountPercentage: 28,
  savingsAmount: 700.00,
  couponCode: "TVMAGALU",
  affiliateUrl: "https://magalu.com/p/tv50",
  shortUrl: "https://v5p.st/d/tv50gen",
  trackedTelegramUrl: "https://v5p.st/d/tv50tg",
  trackedWhatsAppUrl: "https://v5p.st/d/tv50wa",
  targetChannels: ["whatsapp", "telegram"],
  scheduledTime: "18:00",
  status: "pending"
};

const waMessage = compileWhatsAppMessage(mockDealWithShortLinks);
assert(waMessage.includes("https://v5p.st/d/tv50wa"), "WhatsApp compila mensagem utilizando trackedWhatsAppUrl");

const tgHtmlMessage = compileTelegramHtmlMessage(mockDealWithShortLinks);
assert(tgHtmlMessage.includes("https://v5p.st/d/tv50tg"), "Telegram HTML compila mensagem utilizando trackedTelegramUrl");

const tgMarkdownMessage = compileTelegramMarkdownMessage(mockDealWithShortLinks);
assert(tgMarkdownMessage.includes("https://v5p.st/d/tv50tg"), "Telegram Markdown compila mensagem utilizando trackedTelegramUrl");

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✅ TODOS OS TESTES DA ETAPA 076 FORAM APROVADOS COM SUCESSO!\n");
  process.exit(0);
}
