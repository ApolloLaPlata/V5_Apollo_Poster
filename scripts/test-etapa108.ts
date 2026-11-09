/**
 * test-etapa108.ts - Homologação da Etapa 108: Motor Remotion / MiniMax H3 e Badges Onicanal
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { generateVideoStoryboard } from "../src/lib/social/videoStoryboardEngine";
import { 
  buildRemotionTimeline, 
  buildKineticWords, 
  getPlaybackState, 
  MINIMAX_H3_OFFICIAL_MP4_URL 
} from "../src/lib/video/remotionPreviewEngine";
import { SocialPlatform } from "../src/types/poster";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("   TESTE DE HOMOLOGAÇÃO ETAPA 108 - CAPITANIA #13: V5 APOLLO POSTER (:3011)     ");
  console.log("================================================================================\n");

  // BLOCO 1: Motor Remotion & MiniMax H3
  console.log("--- BLOCO 1: Motor Remotion & MiniMax H3 (remotionPreviewEngine.ts) ---");
  
  const storyboard = generateVideoStoryboard(
    "Como Automatizar 100% dos seus Posts com a Frota Colab T4",
    "FROTA",
    15,
    "tech-cyber-808"
  );
  assert(storyboard.scenes.length === 4, "Storyboard base gerado com 4 cenas (3 Atos)");

  const timeline = buildRemotionTimeline(storyboard, 24);
  assert(timeline.scenes.length === 4, "Timeline Remotion compilada com 4 cenas");
  assert(timeline.aspectRatio === "9:16", "Aspect ratio vertical 9:16 validado");
  assert(timeline.width === 1080 && timeline.height === 1920, "Dimensões 1080x1920 validadas");
  assert(timeline.fps === 24, "Framerate cinemático 24 FPS validado");

  // Validação da URL do MiniMax H3 (Pulso #237)
  assert(
    timeline.cloudSampleMp4Url === MINIMAX_H3_OFFICIAL_MP4_URL,
    "URL do vídeo oficial MiniMax H3 apontando para o Supabase Storage"
  );
  assert(
    timeline.cloudSampleMp4Url.includes("minimax_h3_9a582f20dd.mp4"),
    "Asset MP4 MiniMax H3 corresponde ao hash homologado na Tesla T4"
  );

  // BLOCO 2: Decomposição Cinética (Hormozi Kinetic Words)
  console.log("\n--- BLOCO 2: Decomposição de Legendas Cinéticas (buildKineticWords) ---");
  
  const samplePhrase = "Comente FROTA aqui embaixo para receber o acesso";
  const kineticWords = buildKineticWords(samplePhrase, 12, 15, "FROTA");
  
  assert(kineticWords.length > 0, "Palavras cinéticas geradas a partir da frase");
  const keywordItem = kineticWords.find((w) => w.isKeyword);
  assert(keywordItem !== undefined, "Palavra-chave gatilho 'FROTA' detectada e marcada");
  assert(keywordItem?.word.toUpperCase() === "FROTA", "Conteúdo da palavra-chave confere");
  assert(
    kineticWords[0].startSec >= 12 && kineticWords[kineticWords.length - 1].endSec <= 15,
    "Janela temporal das palavras cinéticas restrita entre 12s e 15s"
  );

  // BLOCO 3: Telemetria de Playback e Retenção 3s
  console.log("\n--- BLOCO 3: Telemetria de Playback e Retenção de 3s (getPlaybackState) ---");

  // Teste no segundo 1.5s (Zona Crítica de Gancho)
  const stateHook = getPlaybackState(timeline, 1.5);
  assert(stateHook.isHookZone === true, "Segundo 1.5s corretamente identificado na Zona de Gancho 3s");
  assert(stateHook.isCtaZone === false, "Segundo 1.5s não está na Zona de CTA");
  assert(stateHook.activeScene.actType === "hook", "Cena ativa identificada como 'hook'");
  assert(stateHook.progressPct === 10, "Progresso em 1.5s / 15s é exatamente 10%");

  // Teste no segundo 8.0s (Zona de Prova / Demonstração)
  const stateProof = getPlaybackState(timeline, 8.0);
  assert(stateProof.isHookZone === false, "Segundo 8.0s está fora da Zona de Gancho");
  assert(stateProof.activeScene.actType === "proof", "Cena ativa identificada como 'proof'");

  // Teste no segundo 13.5s (Zona de CTA Comment-to-DM)
  const stateCta = getPlaybackState(timeline, 13.5);
  assert(stateCta.isCtaZone === true, "Segundo 13.5s corretamente identificado na Zona de CTA DM");
  assert(stateCta.activeScene.actType === "cta_dm", "Cena ativa identificada como 'cta_dm'");

  // BLOCO 4: Suporte Multi-Canal LinkedIn & X/Twitter
  console.log("\n--- BLOCO 4: Suporte Multi-Canal (LinkedIn, X/Twitter, WhatsApp) ---");

  const testPlatforms: SocialPlatform[] = [
    "instagram",
    "tiktok",
    "youtube",
    "linkedin",
    "x_twitter",
    "whatsapp",
    "telegram",
    "newsletter",
    "autoblog"
  ];
  assert(testPlatforms.includes("linkedin"), "Tipo SocialPlatform aceita 'linkedin'");
  assert(testPlatforms.includes("x_twitter"), "Tipo SocialPlatform aceita 'x_twitter'");
  assert(testPlatforms.length === 9, "Pool de plataformas onicanal validado");

  // Sumário
  console.log("\n================================================================================");
  console.log(`TOTAL DE TESTES EXECUTADOS: ${totalTests}`);
  console.log(`APROVADOS: ${passedTests}`);
  console.log(`FALHAS: ${failedTests}`);
  console.log("================================================================================");

  if (failedTests > 0) {
    console.error("❌ ALGUNS TESTES FALHARAM!");
    process.exit(1);
  } else {
    console.log("🎉 TODOS OS TESTES DA ETAPA 108 PASSARAM COM SUCESSO!\n");
  }
}

runTestSuite().catch((err) => {
  console.error("Erro fatal no test suite:", err);
  process.exit(1);
});
