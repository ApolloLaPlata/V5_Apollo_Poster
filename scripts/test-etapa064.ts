/**
 * scripts/test-etapa064.ts - Suíte de Validação da Etapa 064
 * Construtor e Compilador de Templates de Direct Message (DM)
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import assert from "node:assert";
import { 
  compileDmMessage,
  validateDmTemplate,
  getGreetingByHour,
  META_DM_MAX_CHARS,
  DM_PRESET_TEMPLATES,
  SUPPORTED_DM_PLACEHOLDERS
} from "../src/lib/comments/dmTemplateBuilder";

console.log("🧪 Iniciando Validação da Etapa 064: Construtor de Templates de Direct Message...\n");

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// GRUPO 1: Saudação Dinâmica por Horário (getGreetingByHour)
// -------------------------------------------------------------
test("1.1 Manhã (08:00) retorna 'Bom dia'", () => {
  const morning = new Date(2026, 9, 27, 8, 30, 0);
  assert.strictEqual(getGreetingByHour(morning), "Bom dia");
});

test("1.2 Tarde (14:30) retorna 'Boa tarde'", () => {
  const afternoon = new Date(2026, 9, 27, 14, 30, 0);
  assert.strictEqual(getGreetingByHour(afternoon), "Boa tarde");
});

test("1.3 Noite (20:15) retorna 'Boa noite'", () => {
  const night = new Date(2026, 9, 27, 20, 15, 0);
  assert.strictEqual(getGreetingByHour(night), "Boa noite");
});

// -------------------------------------------------------------
// GRUPO 2: Compilação de Mensagem de DM (compileDmMessage)
// -------------------------------------------------------------
test("2.1 Interpolação completa dos placeholders principais {{nome}}, {{ctaUrl}}, {{cupom}}", () => {
  const tpl = "Olá {{nome}}! Aqui está seu link: {{ctaUrl}} e seu cupom: {{cupom}}";
  const result = compileDmMessage(tpl, {
    name: "Carlos",
    ctaUrl: "https://v5finders.com/promo?utm_source=ig",
    couponCode: "APOLLO10"
  });

  assert.strictEqual(
    result,
    "Olá Carlos! Aqui está seu link: https://v5finders.com/promo?utm_source=ig e seu cupom: APOLLO10"
  );
});

test("2.2 Suporte a aliases alternativos ({{name}}, {{link}}, {{coupon}})", () => {
  const tpl = "{{greeting}}, {{name}}! Link: {{link}} | Cupom: {{coupon}}";
  const morning = new Date(2026, 9, 27, 9, 0, 0);
  const result = compileDmMessage(tpl, {
    name: "Beatriz",
    ctaUrl: "https://v5autoblog.com",
    couponCode: "VIP50",
    date: morning
  });

  assert.strictEqual(
    result,
    "Bom dia, Beatriz! Link: https://v5autoblog.com | Cupom: VIP50"
  );
});

test("2.3 Handle @ no {{username}} é formatado sem duplicar arroba", () => {
  const tpl = "Fala {{username}}, mandei pra você!";
  const resWithAt = compileDmMessage(tpl, { username: "@rodrigo_seo" });
  assert.strictEqual(resWithAt, "Fala @rodrigo_seo, mandei pra você!");

  const resWithoutAt = compileDmMessage(tpl, { username: "rodrigo_seo" });
  assert.strictEqual(resWithoutAt, "Fala @rodrigo_seo, mandei pra você!");
});

test("2.4 Fallbacks inteligentes quando dados opcionais são omitidos", () => {
  const tpl = "Olá {{nome}}! Cupom: {{cupom}} | Link: {{ctaUrl}}";
  const result = compileDmMessage(tpl, {});
  assert.strictEqual(result, "Olá amigo(a)! Cupom: ESPECIAL | Link:");
});

test("2.5 Interpolação de {{postTitle}} e {{saudacao}}", () => {
  const tpl = "{{saudacao}}, {{nome}}! Sobre o post {{postTitle}}, o link é: {{ctaUrl}}";
  const night = new Date(2026, 9, 27, 21, 0, 0);
  const result = compileDmMessage(tpl, {
    name: "Fernanda",
    postTitle: "Agentes Autônomos em Produção",
    ctaUrl: "https://v5autoblog.com/artigo-agentes",
    date: night
  });

  assert.strictEqual(
    result,
    "Boa noite, Fernanda! Sobre o post Agentes Autônomos em Produção, o link é: https://v5autoblog.com/artigo-agentes"
  );
});

// -------------------------------------------------------------
// GRUPO 3: Validação de Conformidade do Template (validateDmTemplate)
// -------------------------------------------------------------
test("3.1 Template válido com link dentro do limite é aprovado", () => {
  const validTpl = "Olá {{nome}}! Aqui está o seu acesso: {{ctaUrl}} 🚀";
  const validation = validateDmTemplate(validTpl);

  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.hasCtaUrl, true);
  assert.strictEqual(validation.hasNamePlaceholder, true);
  assert.strictEqual(validation.warnings.length, 0);
  assert.ok(validation.charCount < META_DM_MAX_CHARS);
});

test("3.2 Alerta quando {{ctaUrl}} está ausente no template", () => {
  const missingCta = "Olá {{nome}}, obrigado por comentar no meu post!";
  const validation = validateDmTemplate(missingCta);

  assert.strictEqual(validation.hasCtaUrl, false);
  assert.ok(validation.warnings.some(w => w.includes("não contém o placeholder {{ctaUrl}}")));
});

test("3.3 Alerta quando template excede 1000 caracteres (limite Meta Direct)", () => {
  const hugeTpl = "A".repeat(1005) + " {{ctaUrl}}";
  const validation = validateDmTemplate(hugeTpl);

  assert.strictEqual(validation.isValid, false);
  assert.ok(validation.warnings.some(w => w.includes("excede o limite de 1000 caracteres")));
});

test("3.4 Alerta contra excesso de CAIXA ALTA (> 50% de maiúsculas)", () => {
  const shoutyTpl = "OLÁ AMIGO!! COMPRE AGORA MESMO COM DESCONTO IMPERDÍVEL: {{ctaUrl}}";
  const validation = validateDmTemplate(shoutyTpl);

  assert.ok(validation.warnings.some(w => w.includes("CAIXA ALTA")));
});

// -------------------------------------------------------------
// GRUPO 4: Presets Prontos de Alta Conversão (DM_PRESET_TEMPLATES)
// -------------------------------------------------------------
test("4.1 Presets pré-configurados estão definidos e cobrem 4 objetivos principais", () => {
  assert.strictEqual(DM_PRESET_TEMPLATES.length, 4);
  const ids = DM_PRESET_TEMPLATES.map(p => p.id);
  assert.ok(ids.includes("coupon_ecommerce"));
  assert.ok(ids.includes("blog_article"));
  assert.ok(ids.includes("vip_community"));
  assert.ok(ids.includes("lead_magnet"));
});

test("4.2 Todos os presets contêm {{ctaUrl}} e passam na validação de conformidade", () => {
  for (const preset of DM_PRESET_TEMPLATES) {
    const val = validateDmTemplate(preset.template);
    assert.strictEqual(val.isValid, true, `Preset ${preset.id} deve ser válido`);
    assert.strictEqual(val.hasCtaUrl, true, `Preset ${preset.id} deve conter {{ctaUrl}}`);
    assert.ok(val.charCount <= META_DM_MAX_CHARS);
  }
});

test("4.3 Compilação do Preset de Achadinho com Cupom substitui todos os campos", () => {
  const couponPreset = DM_PRESET_TEMPLATES.find(p => p.id === "coupon_ecommerce")!;
  const compiled = compileDmMessage(couponPreset.template, {
    name: "Guilherme",
    ctaUrl: "https://v5finders.com/item/fone-bluetooth",
    couponCode: "ACHADINHO20"
  });

  assert.ok(compiled.includes("Guilherme"));
  assert.ok(compiled.includes("https://v5finders.com/item/fone-bluetooth"));
  assert.ok(compiled.includes("ACHADINHO20"));
});

console.log(`\n🎉 Todos os ${passed} testes da Etapa 064 passaram com 100% de sucesso!`);
