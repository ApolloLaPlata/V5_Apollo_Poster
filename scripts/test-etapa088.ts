/**
 * test-etapa088.ts - Teste de Homologação da Etapa 088
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validação do Tratamento de Erros e Diagnósticos Amigáveis:
 * 1. Categorização precisa de erros por status code HTTP e padrões de mensagens das APIs sociais
 * 2. Geração de diagnósticos em linguagem humana com títulos, causas e soluções acionáveis
 * 3. Identificação de erros recuperáveis (timeout, 5xx, 429) vs fatais (token, payload, permissão)
 * 4. Enriquecimento de QueueItem com diagnostic e errorMessage estruturado
 * 5. Integração do diagnóstico com a simulação de despacho em lote (batchNetworkSimulator)
 * 6. Validação dos estilos visuais e metadados de UI para todas as 8 categorias de erro
 */

import {
  categorizeErrorCode,
  diagnoseDispatchError,
  formatDiagnosticSummary,
  enrichQueueItemWithDiagnostic,
  getCategoryBadgeStyle,
  DIAGNOSTIC_CATALOG,
  extractErrorMessage
} from "../src/lib/queue/dispatchDiagnostics";
import { executeSingleTaskDispatch } from "../src/lib/queue/batchNetworkSimulator";
import { QueueItem, ErrorDiagnosticCategory } from "../src/types/poster";

let passed = 0;
let failed = 0;

function assert(condition: boolean | undefined | null, msg: string) {
  if (Boolean(condition)) {
    passed++;
    console.log(`  ✅ [PASS] ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${msg}`);
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("🚀 INICIANDO TESTES DA ETAPA 088: DIAGNÓSTICO DE ERROS");
  console.log("========================================================\n");

  console.log("📋 1. Teste de Categorização de Erros de APIs Oficiais");

  // A. Token Expirado / Autenticação
  assert(
    categorizeErrorCode(401, "Unauthorized") === "AUTH_TOKEN_EXPIRED",
    "HTTP 401 mapeia para AUTH_TOKEN_EXPIRED"
  );
  assert(
    categorizeErrorCode(400, "OAuthException: Error validating access token: Session has expired") === "AUTH_TOKEN_EXPIRED",
    "Meta OAuthException com session expired mapeia para AUTH_TOKEN_EXPIRED"
  );
  assert(
    categorizeErrorCode(200, "Invalid OAuth access token - Cannot parse signature (subcode 463)") === "AUTH_TOKEN_EXPIRED",
    "Subcode 463 da Meta mapeia para AUTH_TOKEN_EXPIRED"
  );
  assert(
    categorizeErrorCode(0, "Token has been revoked by the user") === "AUTH_TOKEN_EXPIRED",
    "Texto de token revogado mapeia para AUTH_TOKEN_EXPIRED"
  );

  // B. Permissão Negada
  assert(
    categorizeErrorCode(403, "Forbidden") === "PERMISSION_DENIED",
    "HTTP 403 padrão mapeia para PERMISSION_DENIED"
  );
  assert(
    categorizeErrorCode(400, "Requires business account to publish reels") === "PERMISSION_DENIED",
    "Exigência de business account mapeia para PERMISSION_DENIED"
  );
  assert(
    categorizeErrorCode(0, "User is not authorized to perform instagram_content_publish") === "PERMISSION_DENIED",
    "Falta de escopo instagram_content_publish mapeia para PERMISSION_DENIED"
  );

  // C. Rate Limit Excedido
  assert(
    categorizeErrorCode(429, "Too Many Requests") === "RATE_LIMIT_EXCEEDED",
    "HTTP 429 mapeia para RATE_LIMIT_EXCEEDED"
  );
  assert(
    categorizeErrorCode(400, "Application request limit reached (rate limit)") === "RATE_LIMIT_EXCEEDED",
    "Texto de rate limit da Meta mapeia para RATE_LIMIT_EXCEEDED"
  );
  assert(
    categorizeErrorCode(0, "Quota exceeded for quota metric 'Queries' and limit 'Queries per minute'") === "RATE_LIMIT_EXCEEDED",
    "Quota exceeded do YouTube v3 mapeia para RATE_LIMIT_EXCEEDED"
  );

  // D. Timeout de Rede
  assert(
    categorizeErrorCode(408, "Request Timeout") === "TIMEOUT_NETWORK",
    "HTTP 408 mapeia para TIMEOUT_NETWORK"
  );
  assert(
    categorizeErrorCode(504, "Gateway Timeout") === "TIMEOUT_NETWORK",
    "HTTP 504 mapeia para TIMEOUT_NETWORK"
  );
  assert(
    categorizeErrorCode(0, "TypeError: fetch failed (ETIMEDOUT)") === "TIMEOUT_NETWORK",
    "Erro fetch com ETIMEDOUT mapeia para TIMEOUT_NETWORK"
  );
  assert(
    categorizeErrorCode(0, "NetworkTimeout: request timed out after 30000ms") === "TIMEOUT_NETWORK",
    "NetworkTimeout mapeia para TIMEOUT_NETWORK"
  );

  // E. Payload Inválido / Rejeição de Formato
  assert(
    categorizeErrorCode(422, "Unprocessable Entity: video aspect ratio must be 9:16") === "PAYLOAD_INVALID",
    "HTTP 422 com aspect ratio incompatível mapeia para PAYLOAD_INVALID"
  );
  assert(
    categorizeErrorCode(400, "Caption too long: maximum allowed is 2200 characters") === "PAYLOAD_INVALID",
    "Legenda longa demais mapeia para PAYLOAD_INVALID"
  );
  assert(
    categorizeErrorCode(400, "Media format not supported: webp cannot be converted to reel") === "PAYLOAD_INVALID",
    "Formato de mídia não suportado mapeia para PAYLOAD_INVALID"
  );

  // F. Servidor 5xx
  assert(
    categorizeErrorCode(500, "Internal Server Error") === "SERVER_OUTAGE_5XX",
    "HTTP 500 mapeia para SERVER_OUTAGE_5XX"
  );
  assert(
    categorizeErrorCode(502, "Bad Gateway") === "SERVER_OUTAGE_5XX",
    "HTTP 502 mapeia para SERVER_OUTAGE_5XX"
  );
  assert(
    categorizeErrorCode(503, "Service Unavailable: backend server is full") === "SERVER_OUTAGE_5XX",
    "HTTP 503 mapeia para SERVER_OUTAGE_5XX"
  );

  // G. Mídia Inacessível
  assert(
    categorizeErrorCode(400, "Media not accessible: cannot download media from provided URL") === "MEDIA_NOT_ACCESSIBLE",
    "Mídia inacessível mapeia para MEDIA_NOT_ACCESSIBLE"
  );

  // H. Desconhecido
  assert(
    categorizeErrorCode(999, "Random custom unexpected code") === "UNKNOWN_ERROR",
    "Erro arbitrário mapeia para UNKNOWN_ERROR"
  );

  console.log("\n📋 2. Teste de Geração do Objeto de Diagnóstico (diagnoseDispatchError)");
  const diagToken = diagnoseDispatchError("instagram", 401, "OAuthException: Error validating access token");
  assert(diagToken.category === "AUTH_TOKEN_EXPIRED", "Categoria do diagnóstico de token é AUTH_TOKEN_EXPIRED");
  assert(diagToken.platform === "instagram", "Plataforma preservada como 'instagram'");
  assert(diagToken.userFriendlyTitle.includes("Token"), "Título amigável menciona Token");
  assert(diagToken.suggestedAction.includes("Configurações de API"), "Ação sugerida orienta a reconectar nas configurações");
  assert(diagToken.isRecoverable === false, "Falha de token é marcada como isRecoverable: false");
  assert(diagToken.iconType === "key", "Tipo de ícone é 'key'");

  const diagRateLimit = diagnoseDispatchError("tiktok", 429, "Too many requests");
  assert(diagRateLimit.category === "RATE_LIMIT_EXCEEDED", "Categoria é RATE_LIMIT_EXCEEDED");
  assert(diagRateLimit.isRecoverable === true, "Rate limit é marcado como isRecoverable: true");
  assert(diagRateLimit.suggestedRetryDelaySeconds === 60, "Sugestão de atraso para rate limit é de 60 segundos");

  console.log("\n📋 3. Teste de Formatação de Resumo e Enriquecimento de Tarefa");
  const summary = formatDiagnosticSummary(diagToken);
  assert(summary.startsWith("[AUTH_TOKEN_EXPIRED]"), "Resumo inicia com a tag da categoria entre colchetes");
  assert(summary.includes("Acesse as Configurações de API"), "Resumo inclui a recomendação de solução");

  const rawItem: QueueItem = {
    id: "queue_err_enrich_test",
    entityId: "post_err_test",
    entityType: "post",
    title: "Post para Enriquecimento de Diagnóstico",
    platforms: ["youtube"],
    scheduledFor: new Date().toISOString(),
    priority: "normal",
    status: "processing",
    attempts: 1,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const enriched = enrichQueueItemWithDiagnostic(
    rawItem,
    "youtube",
    504,
    "Gateway Timeout from YouTube Data API v3"
  );

  assert(Boolean(enriched.diagnostic), "Item possui propriedade diagnostic populada");
  assert(enriched.diagnostic?.category === "TIMEOUT_NETWORK", "Categoria do diagnóstico no item é TIMEOUT_NETWORK");
  assert(enriched.diagnostic?.isRecoverable === true, "Diagnóstico aponta recuperação automática");
  assert(enriched.errorMessage?.includes("TIMEOUT_NETWORK"), "errorMessage do item contém o resumo do diagnóstico");

  console.log("\n📋 4. Teste de Integração com batchNetworkSimulator");
  const simulatedFailItem: QueueItem = {
    id: "queue_batch_fail_diag",
    entityId: "post_bfd",
    entityType: "post",
    title: "Post com Falha de Payload Simulado",
    platforms: ["tiktok"],
    scheduledFor: new Date().toISOString(),
    priority: "high",
    status: "scheduled",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { updatedItem, result } = await executeSingleTaskDispatch(simulatedFailItem, {
    simulatedMinLatencyMs: 1,
    simulatedMaxLatencyMs: 5,
    simulatedPlatformFailures: {
      tiktok: {
        statusCode: 422,
        errorMessage: "Unprocessable Entity: video aspect ratio must be 9:16 vertical"
      }
    }
  });

  assert(result.overallSuccess === false, "Resultado global marcou falha");
  assert(Boolean(updatedItem.diagnostic), "executeSingleTaskDispatch gerou diagnostic automaticamente");
  assert(updatedItem.diagnostic?.category === "PAYLOAD_INVALID", "Diagnóstico gerado foi categorizado como PAYLOAD_INVALID");
  assert(updatedItem.diagnostic?.userFriendlyTitle.includes("Rejeitado por Incompatibilidade"), "Título amigável de rejeição de formato exibido");
  assert(updatedItem.diagnostic?.isRecoverable === false, "Payload inválido é classificado como não-recuperável sem edição");

  console.log("\n📋 5. Teste de Integridade Visual do Catálogo de Diagnósticos");
  const allCategories: ErrorDiagnosticCategory[] = [
    "AUTH_TOKEN_EXPIRED",
    "TIMEOUT_NETWORK",
    "PAYLOAD_INVALID",
    "RATE_LIMIT_EXCEEDED",
    "SERVER_OUTAGE_5XX",
    "PERMISSION_DENIED",
    "MEDIA_NOT_ACCESSIBLE",
    "UNKNOWN_ERROR"
  ];

  allCategories.forEach((cat) => {
    const def = DIAGNOSTIC_CATALOG[cat];
    assert(Boolean(def), `Definição do catálogo presente para '${cat}'`);
    assert(def.userFriendlyTitle.length > 5, `Título amigável consistente para '${cat}'`);
    assert(def.suggestedAction.length > 10, `Ação recomendada consistente para '${cat}'`);

    const style = getCategoryBadgeStyle(cat);
    assert(Boolean(style.badgeBg && style.badgeText && style.border), `Classes Tailwind válidas para '${cat}'`);
  });

  // Teste de extração de mensagem para tipos exóticos
  assert(extractErrorMessage("string pura") === "string pura", "Extrai string pura");
  assert(extractErrorMessage(new Error("Objeto Error")) === "Objeto Error", "Extrai mensagem de instância Error");
  assert(extractErrorMessage({ message: "Custom dict error" }) === "Custom dict error", "Extrai propriedade message de dicionário");
  assert(extractErrorMessage(null) === "Erro desconhecido", "Fallback seguro para null");

  console.log("\n========================================================");
  console.log(`📊 RESULTADO FINAL DOS TESTES: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("❌ ERRO FATAL AO EXECUTAR TESTES:", err);
  process.exit(1);
});
