/**
 * abTestingEngine.ts - Motor de Teste A/B de Ganchos e Preditor de Retenção (3s)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Avalia psicologicamente dois ganchos concorrentes com base em heurísticas
 * comprovadas de retenção algorítmica para Reels, TikTok, Shorts e Carrosséis:
 * 1. Quebra de Padrão (Pattern Interrupt)
 * 2. Gap de Curiosidade (Curiosity Gap)
 * 3. Densidade e Concisão Visual (45 a 85 caracteres)
 * 4. Viés de Perda / Urgência (Loss Aversion)
 * 5. Estimativa Algorítmica de Retenção nos primeiros 3 segundos
 */

export interface HookVariantMetrics {
  hookText: string;
  overallScore: number; // 0 a 100
  predictedRetention3s: number; // Porcentagem estimada (ex: 74%)
  patternInterruptScore: number;
  curiosityGapScore: number;
  brevityScore: number;
  urgencyScore: number;
  strengths: string[];
  improvements: string[];
}

export interface AbComparisonResult {
  variantA: HookVariantMetrics;
  variantB: HookVariantMetrics;
  winner: "A" | "B" | "tie";
  winnerMargin: number; // Margem de vitória em pontos
  predictedRetentionDelta: number; // Diferença em % de retenção estimada
  summaryReason: string;
}

const PATTERN_INTERRUPT_TRIGGERS = [
  /pare de/i,
  /trocaram/i,
  /erro/i,
  /invis[íi]vel/i,
  /ningu[ée]m/i,
  /segredo/i,
  /n[ãa]o use/i,
  /cuidado/i,
  /perda/i,
  /mentiram/i,
  /esque[çc]a/i,
  /destruindo/i
];

const CURIOSITY_GAP_TRIGGERS = [
  /como/i,
  /por que/i,
  /playbook/i,
  /m[ée]todo/i,
  /f[óo]rmula/i,
  /bastidores/i,
  /descubra/i,
  /o que acontece/i,
  /substitui[çc][ãa]o/i,
  /teste/i
];

const URGENCY_TRIGGERS = [
  /agora/i,
  /2026/i,
  /hoje/i,
  /ainda/i,
  /r[áa]pido/i,
  /antes que/i,
  /urgente/i,
  /tempo/i,
  /dinheiro/i,
  /horas/i
];

/**
 * Avalia individualmente a força viral de um gancho
 */
export function evaluateHookVariant(hookText: string): HookVariantMetrics {
  const text = hookText.trim();
  const charLen = text.length;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (!text) {
    return {
      hookText: "",
      overallScore: 0,
      predictedRetention3s: 20,
      patternInterruptScore: 0,
      curiosityGapScore: 0,
      brevityScore: 0,
      urgencyScore: 0,
      strengths: [],
      improvements: ["Digite um gancho para iniciar a análise."]
    };
  }

  // 1. Quebra de Padrão (0 a 100)
  let patternMatchCount = 0;
  for (const regex of PATTERN_INTERRUPT_TRIGGERS) {
    if (regex.test(text)) {
      patternMatchCount++;
    }
  }
  const patternInterruptScore = patternMatchCount === 0 ? 20 : patternMatchCount === 1 ? 75 : 95;
  if (patternInterruptScore >= 70) {
    strengths.push("Excelente quebra de padrão visceral (para o scroll imediatamente).");
  } else {
    improvements.push("Adicione um gatilho de quebra (ex: 'Pare de...', 'O erro silencioso...', 'Trocaram seu...').");
  }

  // 2. Gap de Curiosidade (0 a 100)
  let curiosityMatchCount = 0;
  for (const regex of CURIOSITY_GAP_TRIGGERS) {
    if (regex.test(text)) {
      curiosityMatchCount++;
    }
  }
  const curiosityGapScore = curiosityMatchCount === 0 ? 25 : curiosityMatchCount === 1 ? 70 : 95;
  if (curiosityGapScore >= 70) {
    strengths.push("Promessa clara de conhecimento exclusivo (alto estímulo dopaminérgico).");
  } else {
    improvements.push("Prometa uma revelação específica (ex: 'O método que...', 'Como saímos de...').");
  }

  // 3. Brevidade & Densidade Visual (Ideal: 45 a 85 caracteres)
  let brevityScore = 50;
  if (charLen >= 40 && charLen <= 90) {
    brevityScore = 95;
    strengths.push(`Tamanho ideal (${charLen} caracteres) para leitura em menos de 1.5s na tela.`);
  } else if (charLen < 40 && charLen >= 20) {
    brevityScore = 75;
    strengths.push(`Gancho conciso (${charLen} caracteres), porém pode detalhar melhor a promessa.`);
  } else if (charLen > 90 && charLen <= 125) {
    brevityScore = 55;
    improvements.push(`Gancho ligeiramente longo (${charLen} caracteres). Tente cortar palavras secundárias.`);
  } else if (charLen > 125) {
    brevityScore = 30;
    improvements.push(`Gancho muito longo (${charLen} caracteres). Vai cobrir a tela e sofrer abandono.`);
  } else {
    brevityScore = 25;
    improvements.push("Gancho muito curto. O usuário não entenderá o contexto.");
  }

  // 4. Urgência e Aversão à Perda (0 a 100)
  let urgencyMatchCount = 0;
  for (const regex of URGENCY_TRIGGERS) {
    if (regex.test(text)) {
      urgencyMatchCount++;
    }
  }
  const urgencyScore = urgencyMatchCount === 0 ? 20 : urgencyMatchCount === 1 ? 65 : 90;
  if (urgencyScore >= 65) {
    strengths.push("Senso de tempo e urgência bem trabalhado.");
  }

  // Pontuação Geral Ponderada (Pattern 35%, Curiosity 25%, Brevity 25%, Urgency 15%)
  const overallScore = Math.round(
    patternInterruptScore * 0.35 +
    curiosityGapScore * 0.25 +
    brevityScore * 0.25 +
    urgencyScore * 0.15
  );

  // Estimativa de Retenção nos primeiros 3 segundos (Normalizada entre 25% e 85%)
  const predictedRetention3s = Math.round(25 + (overallScore / 100) * 60);

  return {
    hookText: text,
    overallScore,
    predictedRetention3s,
    patternInterruptScore,
    curiosityGapScore,
    brevityScore,
    urgencyScore,
    strengths,
    improvements
  };
}

/**
 * Compara dois ganchos lado a lado e declara a variação vencedora com justificativa analítica
 */
export function compareHooks(hookA: string, hookB: string): AbComparisonResult {
  const variantA = evaluateHookVariant(hookA);
  const variantB = evaluateHookVariant(hookB);

  const delta = variantA.overallScore - variantB.overallScore;
  const retentionDelta = Math.abs(variantA.predictedRetention3s - variantB.predictedRetention3s);

  let winner: "A" | "B" | "tie" = "tie";
  let winnerMargin = 0;
  let summaryReason = "Ambas as variações possuem desempenhos equivalentes.";

  if (delta > 3) {
    winner = "A";
    winnerMargin = delta;
    summaryReason = `A Variação A supera a B em ${delta} pontos devido à maior quebra de padrão e concisão de leitura (+${retentionDelta}% de retenção estimada nos primeiros 3 segundos).`;
  } else if (delta < -3) {
    winner = "B";
    winnerMargin = Math.abs(delta);
    summaryReason = `A Variação B supera a A em ${Math.abs(delta)} pontos com promessa mais instigante e menor fricção cognitiva (+${retentionDelta}% de retenção estimada nos primeiros 3 segundos).`;
  }

  return {
    variantA,
    variantB,
    winner,
    winnerMargin,
    predictedRetentionDelta: retentionDelta,
    summaryReason
  };
}
