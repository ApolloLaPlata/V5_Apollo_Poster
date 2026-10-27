/**
 * test-etapa101.ts - Teste E2E de Fluxo do Calendário Mestre Onicanal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações de Ponta a Ponta (E2E Workflow):
 * 1. Criação de publicação agendada com validação de campos obrigatórios
 * 2. Edição de título, conteúdo, plataformas e metadados
 * 3. Reagendamento temporal (Reschedule) com detecção de Horário Nobre (Prime Time)
 * 4. Filtragem multi-critério do calendário (plataforma, status, data, busca textual)
 * 5. Disparo programado com transição de status (scheduled -> published) e log de auditoria
 * 6. Exclusão atômica do post e higienização
 */

import {
  createCalendarPost,
  updateCalendarPost,
  rescheduleCalendarPost,
  filterCalendarPosts,
  dispatchCalendarPostNow,
  deleteCalendarPost
} from "../src/lib/calendar/calendarE2EWorkflow";
import { isPrimeTimeSlot } from "../src/components/poster/MasterCalendar";
import { ScheduledPost } from "../src/types/poster";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log("\n=======================================================");
console.log("🚀 INICIANDO TESTE E2E DA ETAPA 101 - FLUXO DO CALENDÁRIO MESTRE");
console.log("=======================================================\n");

// 1. Criação de Post
console.log("--- 1. Criação de Publicação no Calendário ---");
const validPost = createCalendarPost({
  title: "5 Dicas de IA para Acelerar seu Negócio",
  content: "Descubra as principais automações que economizam 20 horas por semana...",
  platforms: ["instagram", "tiktok"],
  scheduledAt: "2026-10-30T18:00:00.000Z",
  mediaType: "video",
  tags: ["IA", "Produtividade", "Shorts"]
});

assert(validPost.id.startsWith("post-"), "Gera ID único com prefixo post-");
assert(validPost.status === "scheduled", "Status inicial é 'scheduled'");
assert(validPost.platforms.length === 2 && validPost.platforms.includes("instagram"), "Inclui plataformas selecionadas");
assert(validPost.mediaType === "video", "Preserva tipo de mídia 'video'");
assert(validPost.tags.length === 3, "Preserva tags associadas");
assert(typeof validPost.createdAt === "string" && validPost.createdAt.length > 10, "Gera timestamp de criação");

// Validações defensivas de criação
let errorTitleCaught = false;
try {
  createCalendarPost({ title: "", content: "x", platforms: ["instagram"], scheduledAt: "2026-10-30T10:00:00Z" });
} catch {
  errorTitleCaught = true;
}
assert(errorTitleCaught, "Rejeita criação de post com título vazio");

let errorPlatformsCaught = false;
try {
  createCalendarPost({ title: "Título Válido", content: "x", platforms: [], scheduledAt: "2026-10-30T10:00:00Z" });
} catch {
  errorPlatformsCaught = true;
}
assert(errorPlatformsCaught, "Rejeita criação de post sem nenhuma plataforma");

let errorDateCaught = false;
try {
  createCalendarPost({ title: "Título Válido", content: "x", platforms: ["tiktok"], scheduledAt: "data-invalida" });
} catch {
  errorDateCaught = true;
}
assert(errorDateCaught, "Rejeita criação com data scheduledAt mal formatada");

// 2. Edição de Post
console.log("\n--- 2. Edição e Atualização de Conteúdo ---");
const updatedPost = updateCalendarPost(validPost, {
  title: "10 Dicas Definitivas de IA para Negócios em 2026",
  platforms: ["instagram", "tiktok", "youtube", "threads"],
  mediaType: "carousel",
  tags: ["IA", "Inovação", "Estrategia", "Trend"]
});

assert(updatedPost.title.startsWith("10 Dicas"), "Título atualizado com sucesso");
assert(updatedPost.platforms.length === 4, "Adicionadas YouTube e Threads às plataformas");
assert(updatedPost.mediaType === "carousel", "Mídia alterada para 'carousel'");
assert(updatedPost.tags.length === 4, "Tags atualizadas com sucesso");
assert(updatedPost.updatedAt !== undefined, "Timestamp updatedAt renovado");

// 3. Reagendamento (Reschedule) e Detecção de Horário Nobre
console.log("\n--- 3. Reagendamento Temporal e Detecção de Horário Nobre ---");
// 18:30 é horário nobre (17:30 - 19:30 no fuso local)
const primeReschedule = rescheduleCalendarPost(updatedPost, "2026-10-31T18:30:00");
assert(primeReschedule.success === true, "Reagendamento executado com sucesso");
assert(primeReschedule.updatedPost?.scheduledAt === "2026-10-31T18:30:00", "Nova data/hora gravada corretamente");
assert(primeReschedule.isPrimeSlot === true, "Identifica horário nobre às 18:30");

// 04:00 da madrugada NÃO é horário nobre
const offPeakReschedule = rescheduleCalendarPost(updatedPost, "2026-10-31T04:00:00");
assert(offPeakReschedule.success === true, "Reagendamento fora do pico aceito");
assert(offPeakReschedule.isPrimeSlot === false, "Reconhece horário fora de pico");

// Data inválida
const invalidReschedule = rescheduleCalendarPost(updatedPost, "data-invalida-xyz");
assert(invalidReschedule.success === false && invalidReschedule.error !== undefined, "Rejeita reagendamento com data inválida");

// 4. Filtragem do Calendário
console.log("\n--- 4. Filtragem Multi-critério do Calendário ---");
const postList: ScheduledPost[] = [
  primeReschedule.updatedPost!,
  createCalendarPost({ title: "Artigo Blog: SEO Programático", content: "Como ranquear 1000 páginas", platforms: ["autoblog"], scheduledAt: "2026-10-28T10:00:00.000Z" }),
  createCalendarPost({ title: "Edição Especial Newsletter Tech", content: "O resumo da semana", platforms: ["newsletter"], scheduledAt: "2026-10-29T14:00:00.000Z" })
];

// Filtro por plataforma
const onlyAutoBlog = filterCalendarPosts(postList, { platform: "autoblog" });
assert(onlyAutoBlog.length === 1 && onlyAutoBlog[0].platforms.includes("autoblog"), "Filtra exatamente posts do AutoBlog");

// Filtro por busca textual
const searchSeo = filterCalendarPosts(postList, { searchQuery: "SEO Programático" });
assert(searchSeo.length === 1 && searchSeo[0].title.includes("SEO"), "Busca textual localiza post por termo");

// Filtro por status
const scheduledOnly = filterCalendarPosts(postList, { status: "scheduled" });
assert(scheduledOnly.length === 3, "Filtra todas as publicações com status 'scheduled'");

// 5. Disparo e Transição de Estados
console.log("\n--- 5. Execução de Disparo e Log de Auditoria ---");
const targetToDispatch = postList[0];
const { updatedPost: publishedPost, logEntry } = dispatchCalendarPostNow(targetToDispatch, 200);

assert(publishedPost.status === "published", "Status transiciona para 'published'");
assert(publishedPost.publishedAt !== undefined, "Grava timestamp de publicação publishedAt");
assert(logEntry.status === "success" && logEntry.statusCode === 200, "Emite log de auditoria com status 200 OK");
assert(logEntry.remoteMessageId !== undefined, "Log possui identificador remoto remoteMessageId");

// Disparo com falha
const { updatedPost: failedPost, logEntry: failedLog } = dispatchCalendarPostNow(postList[1], 500);
assert(failedPost.status === "failed", "Falha transiciona post para 'failed'");
assert(Boolean(failedPost.lastError?.includes("HTTP 500")), "Registra lastError no post");
assert(failedLog.status === "failed" && failedLog.statusCode === 500, "Emite log de erro HTTP 500");

// 6. Exclusão Atômica
console.log("\n--- 6. Exclusão de Publicação e Limpeza de Grade ---");
const deleteResult = deleteCalendarPost(postList, targetToDispatch.id);
assert(deleteResult.remainingPosts.length === 2, "Remove o post reduzindo a grade de 3 para 2 itens");
assert(deleteResult.deletedPost?.id === targetToDispatch.id, "Retorna o objeto do post excluído");
assert(
  deleteResult.remainingPosts.every((p) => p.id !== targetToDispatch.id),
  "Post excluído não existe mais na lista remanescente"
);

// Exclusão de ID inexistente
const deleteInexistent = deleteCalendarPost(postList, "id-que-nao-existe");
assert(deleteInexistent.remainingPosts.length === 3 && deleteInexistent.deletedPost === undefined, "Tentativa com ID inexistente preserva lista intacta");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
