/**
 * test-etapa075.ts - Teste de Validação da Etapa 075
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Seletor de Canais de Destino VIP (Telegram & WhatsApp):
 * - Catálogo padrão de canais do V5 Finders Hub
 * - Cálculo de audiência e alcance de membros em tempo real
 * - Agrupamento e roteamento por plataforma
 * - Validação de integridade de seleção de canais
 */

import {
  DEFAULT_BROADCAST_CHANNELS,
  calculateAudienceReach,
  groupChannelsByPlatform,
  getDefaultChannelIds,
  validateChannelSelection,
  BroadcastChannel
} from "../src/lib/finders/channelManager";
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
console.log("TESTE ETAPA 075: SELETOR DE CANAIS DE DESTINO VIP");
console.log("=======================================================\n");

// 1. Catálogo Padrão de Canais do V5 Finders Hub
console.log("1. Validando Catálogo Padrão de Canais...");
assert(DEFAULT_BROADCAST_CHANNELS.length === 7, "Catálogo padrão possui exatamente 7 canais/comunidades VIP");

const tgChannels = DEFAULT_BROADCAST_CHANNELS.filter((c) => c.platform === "telegram");
const waChannels = DEFAULT_BROADCAST_CHANNELS.filter((c) => c.platform === "whatsapp");
assert(tgChannels.length === 3, "Existem 3 canais de broadcast Telegram configurados");
assert(waChannels.length === 4, "Existem 4 comunidades/grupos WhatsApp configurados");

const uniqueIds = new Set(DEFAULT_BROADCAST_CHANNELS.map((c) => c.id));
assert(uniqueIds.size === DEFAULT_BROADCAST_CHANNELS.length, "Todos os canais possuem IDs exclusivos");

const allHaveHandles = DEFAULT_BROADCAST_CHANNELS.every((c) => c.handleOrJid && c.handleOrJid.length > 3);
assert(allHaveHandles, "Todos os canais possuem handle ou JID válido");

const allActive = DEFAULT_BROADCAST_CHANNELS.every((c) => c.isActive && c.memberCount > 0);
assert(allActive, "Todos os canais padrão estão ativos com contagem de membros positiva");

// 2. Cálculo de Alcance Total com Todos os Canais
console.log("\n2. Validando Cálculo de Alcance Total (Todos os Canais)...");
const allIds = getDefaultChannelIds();
const fullStats = calculateAudienceReach(allIds);

assert(fullStats.totalChannels === 7, "Total de canais selecionados é 7");
assert(fullStats.totalMembers === 56354, `Total de membros soma 56.354 (obtido: ${fullStats.totalMembers})`);
assert(fullStats.telegramChannelsCount === 3, "Telegram possui 3 canais");
assert(fullStats.telegramMembersCount === 52500, `Telegram possui 52.500 membros (obtido: ${fullStats.telegramMembersCount})`);
assert(fullStats.whatsappChannelsCount === 4, "WhatsApp possui 4 comunidades");
assert(fullStats.whatsappMembersCount === 3854, `WhatsApp possui 3.854 membros (obtido: ${fullStats.whatsappMembersCount})`);
assert(fullStats.hasBothPlatforms === true, "hasBothPlatforms é true quando ambos estão selecionados");

// 3. Cálculo de Alcance Segmentado (Apenas Telegram)
console.log("\n3. Validando Alcance Segmentado (Apenas Telegram)...");
const tgIds = tgChannels.map((c) => c.id);
const tgStats = calculateAudienceReach(tgIds);

assert(tgStats.totalChannels === 3, "Apenas 3 canais selecionados");
assert(tgStats.totalMembers === 52500, "Alcance total é de 52.500 membros");
assert(tgStats.telegramChannelsCount === 3, "telegramChannelsCount é 3");
assert(tgStats.whatsappChannelsCount === 0, "whatsappChannelsCount é 0");
assert(tgStats.whatsappMembersCount === 0, "whatsappMembersCount é 0");
assert(tgStats.hasBothPlatforms === false, "hasBothPlatforms é false para apenas uma plataforma");

// 4. Cálculo de Alcance Segmentado (Apenas WhatsApp)
console.log("\n4. Validando Alcance Segmentado (Apenas WhatsApp)...");
const waIds = waChannels.map((c) => c.id);
const waStats = calculateAudienceReach(waIds);

assert(waStats.totalChannels === 4, "Apenas 4 canais WhatsApp selecionados");
assert(waStats.totalMembers === 3854, "Alcance total é de 3.854 membros");
assert(waStats.telegramChannelsCount === 0, "telegramChannelsCount é 0");
assert(waStats.whatsappChannelsCount === 4, "whatsappChannelsCount é 4");
assert(waStats.hasBothPlatforms === false, "hasBothPlatforms é false");

// 5. Seleção Vazia
console.log("\n5. Validando Seleção Vazia...");
const emptyStats = calculateAudienceReach([]);
assert(emptyStats.totalChannels === 0, "totalChannels é 0 na seleção vazia");
assert(emptyStats.totalMembers === 0, "totalMembers é 0 na seleção vazia");
assert(emptyStats.hasBothPlatforms === false, "hasBothPlatforms é false na seleção vazia");

// 6. Agrupamento por Plataforma
console.log("\n6. Validando groupChannelsByPlatform...");
const grouped = groupChannelsByPlatform();
assert(Array.isArray(grouped.telegram) && grouped.telegram.length === 3, "grouped.telegram contém 3 canais");
assert(Array.isArray(grouped.whatsapp) && grouped.whatsapp.length === 4, "grouped.whatsapp contém 4 comunidades");
assert(grouped.telegram.every((c) => c.platform === "telegram"), "Todos em grouped.telegram são da plataforma telegram");
assert(grouped.whatsapp.every((c) => c.platform === "whatsapp"), "Todos em grouped.whatsapp são da plataforma whatsapp");

// 7. Validador de Seleção de Canais
console.log("\n7. Validando validateChannelSelection...");
const validRes = validateChannelSelection(["tg_tech_vip"]);
assert(validRes.isValid === true, "Seleção com 1 canal é válida");
assert(validRes.error === undefined, "Nenhum erro retornado para seleção válida");

const invalidEmpty = validateChannelSelection([]);
assert(invalidEmpty.isValid === false, "Seleção vazia é inválida");
assert(Boolean(invalidEmpty.error && invalidEmpty.error.includes("ao menos um canal")), "Mensagem amigável de erro na seleção vazia");

// 8. Integridade dos Novos Tipos em GroupBroadcastDeal
console.log("\n8. Validando Compatibilidade de Tipos com GroupBroadcastDeal...");
const mockDeal: GroupBroadcastDeal = {
  id: "deal_etapa075_test",
  productName: "Echo Dot 5ª Geração Smart Speaker Alexa",
  store: "Amazon",
  originalPrice: 429.00,
  promoPrice: 289.00,
  discountPercentage: 33,
  savingsAmount: 140.00,
  couponCode: "ALEXA30",
  affiliateUrl: "https://amzn.to/3EchoDotTest",
  targetChannels: ["whatsapp", "telegram"],
  targetChannelIds: ["tg_tech_vip", "wa_achadinhos_vip1"],
  estimatedReach: 15224,
  scheduledTime: "14:30",
  status: "pending",
  totalClicks: 0
};

assert(mockDeal.targetChannelIds?.length === 2, "targetChannelIds suportado com 2 canais");
assert(mockDeal.estimatedReach === 15224, "estimatedReach suportado com 15.224 membros");

console.log("\n=======================================================");
console.log(`TOTAL DE ASSERÇÕES: ${passed + failed}`);
console.log(`PASSOU: ${passed}`);
console.log(`FALHOU: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("✅ TODOS OS TESTES DA ETAPA 075 FORAM APROVADOS COM SUCESSO!\n");
  process.exit(0);
}
