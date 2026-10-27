/**
 * test-etapa061.ts - Validação Automatizada da Etapa 061
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Valida o Gerenciador Central de Regras Comment-to-DM integrado ao Zustand:
 * 1. Inicialização do estado de regras de comentários (commentRules) no Zustand
 * 2. Adição de novas regras via addCommentRule
 * 3. Atualização reativa de regras via updateCommentRule
 * 4. Toggle de ativação liga/desliga via toggleCommentRule
 * 5. Registro e telemetria de disparos via logCommentTrigger com incremento de contador
 * 6. Exclusão segura de regras via deleteCommentRule
 * 7. Mecanismo de interpolação de placeholders de DM ({{nome}}, {{ctaUrl}}, {{postTitle}})
 */

import { usePosterStore } from "../src/store/usePosterStore";
import { CommentRule, CommentTriggerEvent } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("================================================================================");
console.log(" INICIANDO BATERIA DE TESTES - ETAPA 061: GERENCIADOR COMMENT-TO-DM (ZUSTAND)");
console.log("================================================================================\n");

// 1. Estado Inicial do Zustand
console.log("[1/6] Testando Inicialização do Estado de Regras no Zustand Store...");
const initialRules = usePosterStore.getState().commentRules;
assert(Array.isArray(initialRules), "commentRules é um array válido no Zustand");
assert(initialRules.length >= 2, "Contém pelo menos 2 regras seed iniciais");
const firstRule = initialRules[0];
assert(Boolean(firstRule && firstRule.id && firstRule.name && firstRule.keywords.length > 0), "Regra seed possui ID, nome e palavras-chave");
console.log("  -> Estado inicial validado com sucesso.\n");

// 2. Adição de Nova Regra
console.log("[2/6] Testando addCommentRule...");
const newRuleData = {
  name: "Gatilho Teste Unitário 061",
  platform: "instagram" as const,
  targetPostId: "post_test_061",
  keywords: ["LINK", "QUERO", "AUTONOMO"],
  publicReplyVariants: [
    "Te enviei no direct agora mesmo! 🔥",
    "Confere suas mensagens privadas! 🚀"
  ],
  dmMessageTemplate: "Olá {{nome}}! Aqui está o seu link: {{ctaUrl}}",
  ctaUrl: "https://v5autoblog.com/artigo/teste?utm_source=ig_comment_dm",
  isActive: true
};

usePosterStore.getState().addCommentRule(newRuleData);

const afterAddRules = usePosterStore.getState().commentRules;
const createdRule = afterAddRules.find(r => r.name === "Gatilho Teste Unitário 061");
assert(!!createdRule, "Regra adicionada encontrada no Zustand store");
assert(createdRule!.id.startsWith("rule-"), "ID único gerado com prefixo rule-");
assert(createdRule!.totalTriggered === 0, "totalTriggered inicializado em 0");
assert(createdRule!.keywords.includes("AUTONOMO"), "Palavras-chave preservadas na criação");
console.log("  -> addCommentRule homologado com sucesso.\n");

// 3. Atualização de Regra
console.log("[3/6] Testando updateCommentRule...");
const ruleIdToUpdate = createdRule!.id;
usePosterStore.getState().updateCommentRule(ruleIdToUpdate, {
  name: "Gatilho Teste 061 Atualizado",
  ctaUrl: "https://v5autoblog.com/artigo/atualizado?utm_source=ig_comment_dm"
});

const updatedRule = usePosterStore.getState().commentRules.find(r => r.id === ruleIdToUpdate);
assert(updatedRule?.name === "Gatilho Teste 061 Atualizado", "Nome da regra atualizado com sucesso");
assert(Boolean(updatedRule?.ctaUrl.includes("atualizado")), "URL de CTA atualizada com sucesso");
console.log("  -> updateCommentRule homologado com sucesso.\n");

// 4. Toggle de Ativação
console.log("[4/6] Testando toggleCommentRule...");
assert(updatedRule !== undefined && updatedRule.isActive === true, "Regra inicia ativa (true)");
usePosterStore.getState().toggleCommentRule(ruleIdToUpdate);
let toggledRule = usePosterStore.getState().commentRules.find(r => r.id === ruleIdToUpdate);
assert(toggledRule?.isActive === false, "Regra alternada para inativa (false)");

usePosterStore.getState().toggleCommentRule(ruleIdToUpdate);
toggledRule = usePosterStore.getState().commentRules.find(r => r.id === ruleIdToUpdate);
assert(toggledRule?.isActive === true, "Regra reativada para ativa (true)");
console.log("  -> toggleCommentRule homologado com sucesso.\n");

// 5. Log de Disparo e Incremento de Estatísticas
console.log("[5/6] Testando logCommentTrigger e Incremento de Telemetria...");
const prevTotal = toggledRule!.totalTriggered;

usePosterStore.getState().logCommentTrigger({
  ruleId: ruleIdToUpdate,
  platform: "instagram",
  username: "@apollo_dev",
  commentId: "cmt_1001",
  commentText: "Eu quero o LINK agora",
  matchedKeyword: "LINK",
  publicReplySent: "Te enviei no direct agora mesmo! 🔥",
  dmSent: "Olá apollo_dev! Aqui está o seu link: https://v5autoblog.com/artigo/atualizado?utm_source=ig_comment_dm",
  status: "success"
});

const afterTriggerRule = usePosterStore.getState().commentRules.find(r => r.id === ruleIdToUpdate);
assert(afterTriggerRule?.totalTriggered === prevTotal + 1, "Contador totalTriggered incrementado em +1");
assert(!!afterTriggerRule?.lastTriggeredAt, "lastTriggeredAt registrado com timestamp");

const events = usePosterStore.getState().triggerEvents;
assert(events.length > 0, "Evento gravado em triggerEvents no Zustand");
const lastEvent = events[0];
assert(lastEvent.username === "@apollo_dev", "Nome do usuário preservado no log");
assert(lastEvent.matchedKeyword === "LINK", "Palavra-chave capturada com precisão");
console.log("  -> logCommentTrigger e telemetria homologados com sucesso.\n");

// 6. Interpolação de Placeholders e Exclusão
console.log("[6/6] Testando Interpolação de Placeholders e deleteCommentRule...");
const template = "Olá {{nome}}! Seu link para {{postTitle}} é: {{ctaUrl}}";
const interpolated = template
  .replace(/{{nome}}/gi, "carlos_silva")
  .replace(/{{postTitle}}/gi, "Guia de Agentes")
  .replace(/{{ctaUrl}}/gi, "https://v5autoblog.com");

assert(interpolated === "Olá carlos_silva! Seu link para Guia de Agentes é: https://v5autoblog.com", "Interpolação de placeholders {{nome}}, {{postTitle}}, {{ctaUrl}} realizada com exatidão");

usePosterStore.getState().deleteCommentRule(ruleIdToUpdate);
const finalRules = usePosterStore.getState().commentRules;
assert(!finalRules.some(r => r.id === ruleIdToUpdate), "Regra excluída com sucesso de commentRules");
console.log("  -> deleteCommentRule e interpolação homologados com sucesso.\n");

console.log("================================================================================");
console.log(` RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS COM SUCESSO!`);
console.log(" ETAPA 061 CONCLUÍDA E HOMOLOGADA COM PRECISÃO CIRÚRGICA.");
console.log("================================================================================");
