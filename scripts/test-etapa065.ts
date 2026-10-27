/**
 * scripts/test-etapa065.ts - Suíte de Validação da Etapa 065
 * Implementação da Lógica de Envio de DM Ancorada no comment_id (Bypass 24h Meta Graph API)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import assert from "node:assert";
import { 
  buildMetaPrivateReplyPayload,
  validateCommentEligibilityForPrivateReply,
  parseMetaCommentWebhook,
  sendMetaPrivateReply,
  DEFAULT_META_GRAPH_VERSION,
  META_PRIVATE_REPLY_MAX_AGE_MS
} from "../src/lib/comments/metaPrivateReplyClient";

console.log("🧪 Iniciando Validação da Etapa 065: Lógica de Envio de DM Ancorada no comment_id (Bypass 24h Meta)...\n");

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function runSuite() {
  // -------------------------------------------------------------
  // GRUPO 1: Construtor de Payload da Meta Graph API (buildMetaPrivateReplyPayload)
  // -------------------------------------------------------------
  await test("1.1 Constrói payload JSON estrito ancorado em recipient.comment_id", () => {
    const payload = buildMetaPrivateReplyPayload("17841401234567890", "Olá! Link enviado: https://v5finders.com");
    
    assert.deepStrictEqual(payload.recipient, { comment_id: "17841401234567890" });
    assert.strictEqual(payload.message.text, "Olá! Link enviado: https://v5finders.com");
    assert.strictEqual(payload.messaging_type, "RESPONSE");
  });

  await test("1.2 Sanitiza e remove espaços acidentais no commentId e no texto", () => {
    const payload = buildMetaPrivateReplyPayload("   1784140999   ", "   Mensagem direta   ");
    assert.strictEqual(payload.recipient.comment_id, "1784140999");
    assert.strictEqual(payload.message.text, "Mensagem direta");
  });

  // -------------------------------------------------------------
  // GRUPO 2: Validação de Regras da Janela de 7 Dias e Unicidade
  // -------------------------------------------------------------
  await test("2.1 Comentário recente (2 dias atrás) é elegível para Private Reply", () => {
    const now = Date.now();
    const twoDaysAgo = now - (2 * 24 * 60 * 60 * 1000);
    const result = validateCommentEligibilityForPrivateReply(twoDaysAgo, false, now);

    assert.strictEqual(result.eligible, true);
    assert.strictEqual(result.reason, undefined);
  });

  await test("2.2 Comentário antigo (> 7 dias) é rejeitado com aviso sobre limite da Meta", () => {
    const now = Date.now();
    const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);
    const result = validateCommentEligibilityForPrivateReply(eightDaysAgo, false, now);

    assert.strictEqual(result.eligible, false);
    assert.ok(result.reason?.includes("Comentário expirado"));
    assert.ok(result.reason?.includes("7 dias"));
  });

  await test("2.3 Comentário já respondido (alreadyDispatched=true) é bloqueado por regra de unicidade", () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const result = validateCommentEligibilityForPrivateReply(oneHourAgo, true, now);

    assert.strictEqual(result.eligible, false);
    assert.ok(result.reason?.includes("limite de 1 por comentário"));
  });

  // -------------------------------------------------------------
  // GRUPO 3: Parser de Webhook de Comentários da Meta (parseMetaCommentWebhook)
  // -------------------------------------------------------------
  await test("3.1 Parser extrai dados de payload padrão de Webhook do Instagram Graph API", () => {
    const webhookPayload = {
      entry: [
        {
          id: "1784140001",
          changes: [
            {
              field: "comments",
              value: {
                id: "17998877665544332",
                text: "Eu quero o link do fone!! 🔥",
                from: {
                  id: "17841499887",
                  username: "juliana_tech"
                },
                media: {
                  id: "17890011223344"
                },
                created_time: 1729000000
              }
            }
          ]
        }
      ]
    };

    const parsed = parseMetaCommentWebhook(webhookPayload);
    assert.ok(parsed !== null);
    assert.strictEqual(parsed.commentId, "17998877665544332");
    assert.strictEqual(parsed.from.username, "juliana_tech");
    assert.strictEqual(parsed.text, "Eu quero o link do fone!! 🔥");
    assert.strictEqual(parsed.mediaId, "17890011223344");
  });

  await test("3.2 Parser trata payloads nulos, vazios ou inválidos com retorno null gracioso", () => {
    assert.strictEqual(parseMetaCommentWebhook(null), null);
    assert.strictEqual(parseMetaCommentWebhook({}), null);
    assert.strictEqual(parseMetaCommentWebhook({ invalid: true }), null);
  });

  // -------------------------------------------------------------
  // GRUPO 4: Despachador de Private Reply com Bypass 24h (sendMetaPrivateReply)
  // -------------------------------------------------------------
  await test("4.1 Rejeita requisição com commentId ausente ou em branco", async () => {
    const res = await sendMetaPrivateReply({
      commentId: "",
      text: "Mensagem de teste"
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.metaErrorCode, 100);
    assert.strictEqual(res.bypass24hVerified, false);
  });

  await test("4.2 Rejeita requisição com texto ausente ou em branco", async () => {
    const res = await sendMetaPrivateReply({
      commentId: "1784140001",
      text: "   "
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.metaErrorCode, 100);
  });

  await test("4.3 Execução simulada gera resposta de sucesso com messageId autêntico e bypass verificado", async () => {
    const res = await sendMetaPrivateReply({
      commentId: "17841400012345678",
      text: "Olá! Aqui está seu link com menor preço: https://v5finders.com/promo",
      forceSimulation: true
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.simulated, true);
    assert.ok(res.messageId?.startsWith("m_mid."));
    assert.ok(res.recipientId?.startsWith("ig_usr_"));
    assert.strictEqual(res.bypass24hVerified, true);
    assert.ok(!isNaN(Date.parse(res.dispatchedAt)));
  });

  await test("4.4 Versão padrão da API Meta Graph está configurada para v20.0", () => {
    assert.strictEqual(DEFAULT_META_GRAPH_VERSION, "v20.0");
  });

  console.log(`\n🎉 Todos os ${passed} testes da Etapa 065 passaram com 100% de sucesso!`);
}

runSuite();
