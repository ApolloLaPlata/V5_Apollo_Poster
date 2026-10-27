/**
 * test-etapa102.ts - Teste E2E de Fluxo Dual (Editor Markdown -> E-mail HTML + AutoBlog JSON)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Validações de Ponta a Ponta (E2E Dual Engine):
 * 1. Conversão fiel de Markdown rico em E-mail Newsletter HTML responsivo
 * 2. Injeção estrita de UTMs e Preheader invisível no e-mail
 * 3. Rodapé institucional com conformidade anti-spam (CAN-SPAM / GDPR / Opt-out)
 * 4. Compilação do Payload JSON para V5 AutoBlog e WordPress REST API
 * 5. Metadados estendidos de SEO (OpenGraph, Twitter Cards, Schema.org BlogPosting)
 * 6. Auditoria heurística pré-envio de entregabilidade anti-spam
 * 7. Geração automática de Teasers Sociais multiplataforma
 */

import {
  compileEmailHtml,
  compileBlogPayload,
  compileSocialTeasers,
  slugify,
  buildTrackingUrl
} from "../src/lib/dispatch/multimodalEngine";
import { auditEmailSpamScore } from "../src/lib/dispatch/spamAuditor";
import { MultimodalDispatchPayload } from "../src/types/poster";

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
console.log("🚀 INICIANDO TESTE E2E DA ETAPA 102 - MOTOR DUAL BEEHIIV");
console.log("=======================================================\n");

// 1. Redação de Artigo Técnico em Markdown no Editor Dual
const sampleMarkdown = `
# O Futuro dos Agentes Autônomos na Criação de Conteúdo em 2026

A inteligência artificial transformou radicalmente a esteira de publicação onicanal. Não estamos mais falando de ferramentas isoladas, mas de ecossistemas coordenados que operam sob alta concorrência.

## 1. Da Automação Simples à Orquestração Autônoma

Os sistemas modernos como o V5 Apollo Poster conectam APIs corporativas em nuvem garantindo publicações nativas sem extensões de navegador para o usuário final.

> "A consistência de distribuição é a moeda mais valiosa do marketing digital na era da inteligência de dados."

### Tabela Comparativa de Produtividade

| Arquitetura | Tempo de Despacho | Risco de Bloqueio |
|-------------|-------------------|-------------------|
| Extensões Locais | 45 segundos | Alto (Inseguro) |
| Serverless APIs | 3.2 segundos | Zero (Conforme) |

## 2. Principais Benefícios da Abordagem Onicanal

- **Escalabilidade:** Disparo simultâneo para 8+ redes sociais e grupos VIP.
- **Rastreabilidade SOC2:** Identificadores únicos de mensagem (Remote Message IDs).
- **SEO Programático:** Indexação imediata de artigos com E-E-A-T elevado.

Para saber mais sobre o protocolo da holding, [acesse a documentação oficial](https://holding.v5apollo.com/docs/poster).
`.trim();

const dualPayload: MultimodalDispatchPayload = {
  id: "article-dual-2026",
  title: "O Futuro dos Agentes Autônomos na Criação de Conteúdo em 2026",
  slug: "o-futuro-dos-agentes-autonomos-na-criacao-de-conteudo-em-2026",
  summary: "Como a orquestração de APIs em nuvem e agentes de IA redefine o marketing onicanal em 2026.",
  contentMarkdown: sampleMarkdown,
  coverImageUrl: "https://cdn.v5apollo.com/images/agentes-ia-cover.webp",
  coverImageAlt: "Agentes Autônomos de IA em 2026",
  emailOptions: {
    enabled: true,
    subject: "Edição #52: O Futuro dos Agentes Autônomos de IA",
    previewText: "Descubra o novo padrão de publicação onicanal da Holding V5 Apollo.",
    fromName: "Apollo La Plata",
    provider: "resend",
    audienceList: "assinantes-vip",
    utmCampaign: "agentes_ia_2026",
    footerAddress: "Av. Paulista, 1000 - São Paulo, SP - Brasil",
    permissionReminder: "Você está recebendo este e-mail porque assinou a newsletter de IA da V5 Apollo Holding."
  },
  blogOptions: {
    enabled: true,
    targetPlatform: "both",
    targetEndpoint: "https://v5autoblog.holding.v5apollo.com/wp-json/wp/v2/posts",
    category: "Inteligência Artificial",
    tags: ["IA", "Agentes", "Automação"],
    author: "Apollo La Plata",
    generateSchema: true
  },
  socialTeaserOptions: {
    enabled: true,
    platforms: ["instagram", "x_twitter", "threads", "telegram", "whatsapp"]
  },
  dispatchStatus: {
    overall: "idle",
    email: { status: "idle" },
    blog: { status: "idle" },
    social: { status: "idle" }
  }
};

// 2. Validação da Slugificação e URLs com UTM
console.log("--- 1. Slugificação e Rastreamento UTM ---");
const generatedSlug = slugify(dualPayload.title);
assert(generatedSlug === dualPayload.slug, "Slug gerado a partir do título com acentos confere perfeitamente");

const trackedLink = buildTrackingUrl("https://holding.v5apollo.com/docs", {
  source: "newsletter",
  medium: "email",
  campaign: "agentes_ia_2026"
});
assert(trackedLink.includes("utm_source=newsletter"), "Injeta utm_source no link");
assert(trackedLink.includes("utm_medium=email"), "Injeta utm_medium no link");
assert(trackedLink.includes("utm_campaign=agentes_ia_2026"), "Injeta utm_campaign no link");

// 3. Validação do E-mail Newsletter HTML
console.log("\n--- 2. Compilação e Validação do E-mail Newsletter HTML ---");
const emailHtml = compileEmailHtml(dualPayload);

assert(typeof emailHtml === "string" && emailHtml.length > 500, "HTML de e-mail gerado com conteúdo não-vazio");
assert(emailHtml.includes("<!DOCTYPE html>"), "Possui declaração DOCTYPE HTML válida");
assert(emailHtml.includes("Descubra o novo padrão de publicação onicanal"), "Preheader invisível inserido no e-mail");
assert(emailHtml.includes("<table"), "Converte tabela Markdown em estrutura HTML <table>");
assert(emailHtml.includes("Av. Paulista, 1000"), "Rodapé inclui o endereço físico corporativo");
assert(emailHtml.includes("Você está recebendo este e-mail"), "Rodapé inclui o lembrete de permissão de envio");
assert(emailHtml.includes("unsubscribe") || emailHtml.includes("descadastro"), "Rodapé inclui link de opt-out (CAN-SPAM / GDPR)");
assert(emailHtml.includes("utm_campaign=agentes_ia_2026"), "Links no corpo do e-mail recebem as tags UTM da campanha");

// 4. Validação do Payload JSON do AutoBlog / WordPress
console.log("\n--- 3. Compilação do Payload JSON para AutoBlog / WordPress REST ---");
const blogPayload = compileBlogPayload(dualPayload);

assert(blogPayload.title === dualPayload.title, "Preserva título no payload do blog");
assert(blogPayload.slug === dualPayload.slug, "Preserva slug no payload do blog");
assert(typeof blogPayload.content_html === "string" && blogPayload.content_html.length > 200, "HTML semântico compilado com sucesso");
assert(blogPayload.content_html.includes("<h2") || blogPayload.content_html.includes("<h3"), "Estrutura hierárquica de headings H2/H3 gerada");
assert(blogPayload.reading_time_minutes >= 1, "Calcula tempo de leitura estimado >= 1 min");
assert(blogPayload.word_count > 50, "Calcula contagem de palavras do artigo");
assert(blogPayload.excerpt.length <= 160, "Meta excerpt otimizado para o Google com <= 160 caracteres");

// Metadados de SEO
assert(blogPayload.seo.open_graph.og_title.includes(dualPayload.title), "OpenGraph og:title contém o título do artigo");
assert(blogPayload.seo.open_graph.og_type === "article", "OpenGraph og:type definido como article");
assert(blogPayload.seo.open_graph.og_image === dualPayload.coverImageUrl, "OpenGraph og:image aponta para a cover image");
assert(blogPayload.seo.twitter_card.card === "summary_large_image", "Twitter Card configurado como summary_large_image");

// Schema.org BlogPosting JSON-LD
const schema = blogPayload.seo.schema_org;
assert(schema["@context"] === "https://schema.org", "Schema.org contexto https://schema.org");
assert(schema["@type"] === "BlogPosting", "Schema.org tipo BlogPosting");
assert(schema.headline === dualPayload.title, "Schema.org headline confere com o título");
assert(schema.author.name === "Apollo La Plata", "Schema.org autor institucional Apollo La Plata");

// 5. Auditoria Anti-Spam e Entregabilidade
console.log("\n--- 4. Auditoria Heurística de Entregabilidade Anti-Spam ---");
const spamAudit = auditEmailSpamScore({
  subject: dualPayload.emailOptions.subject,
  contentMarkdown: dualPayload.contentMarkdown,
  previewText: dualPayload.emailOptions.previewText,
  fromName: dualPayload.emailOptions.fromName,
  includeFooterNotice: true
});

assert(spamAudit.score <= 4.0, "Score de spam baixo (< 4.0 pts) em conformidade editorial");
assert(spamAudit.rating === "safe" || spamAudit.rating === "moderate", "Classificação editorial segura (safe/moderate)");
assert(spamAudit.deliverabilityEstimate >= 80, "Estimativa de entregabilidade >= 80%");
assert(spamAudit.checklist.hasPreheader === true, "Checklist confirma presença de preheader");

// 6. Teasers Sociais Multiplataforma
console.log("\n--- 5. Teasers Sociais Multiplataforma Integrados ---");
const socialTeasers = compileSocialTeasers(dualPayload);
assert(typeof socialTeasers.x_twitter === "string" && socialTeasers.x_twitter.length > 0, "Gera teaser para Twitter / X");
assert(socialTeasers.x_twitter.length <= 280, "Teaser do Twitter respeita o limite rígido de 280 caracteres");
assert(typeof socialTeasers.threads === "string" && socialTeasers.threads.length <= 500, "Teaser do Threads respeita o limite de 500 caracteres");
assert(typeof socialTeasers.instagram_caption === "string" && socialTeasers.instagram_caption.includes("#"), "Gera legenda do Instagram com hashtags");
assert(typeof socialTeasers.telegram_vip === "string", "Gera mensagem formatada para Telegram");
assert(typeof socialTeasers.whatsapp_community === "string", "Gera mensagem formatada para WhatsApp");

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} TESTES APROVADOS!`);
console.log("=======================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
