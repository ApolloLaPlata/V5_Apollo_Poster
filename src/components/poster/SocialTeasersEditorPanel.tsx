/**
 * SocialTeasersEditorPanel.tsx - Painel Avançado de Edição de Teasers Individuais
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Permite ao operador editar, refinar e monitorar o micro-copy de cada rede social:
 * - Suporte às 6 redes: X/Twitter, Threads, Instagram, WhatsApp, Telegram, LinkedIn
 * - Contadores de caracteres em tempo real com barra de progresso reativa
 * - Alerta visual de excesso de caracteres e detector de Sweet Spot de engajamento
 * - Barra de injeção rápida de atributos (+ Link UTM, + Hashtags, + Gatilho DM, + Bullets)
 * - Botão de restauração para o texto original gerado pelo motor de IA
 * - Sincronização imediata com os cards de despacho e agendamento
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Link as LinkIcon, 
  Hash, 
  MessageCircle, 
  ListPlus,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Sliders,
  Send,
  MessageSquare,
  Share2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { MultimodalDispatchPayload, SocialTeaserPlatform } from "@/types/poster";
import { 
  compileSocialTeasers, 
  calculateTeaserMetrics, 
  SOCIAL_CHAR_LIMITS, 
  SOCIAL_PLATFORM_NAMES, 
  SOCIAL_SWEET_SPOTS,
  TeaserMetrics,
  formatHashtags,
  extractBulletPoints,
  buildSocialUtmUrl
} from "@/lib/social/socialTeaserEngine";
import { toast } from "@/lib/toast/useToast";

export interface SocialTeasersEditorPanelProps {
  payload: MultimodalDispatchPayload;
  onTeaserChange?: (platform: SocialTeaserPlatform, updatedText: string) => void;
}

const PLATFORM_ICONS: Record<SocialTeaserPlatform, string> = {
  x_twitter: "𝕏",
  threads: "🧵",
  instagram: "📸",
  whatsapp: "💬",
  telegram: "✈️",
  linkedin: "💼"
};

export function SocialTeasersEditorPanel({ payload, onTeaserChange }: SocialTeasersEditorPanelProps) {
  const [activePlatform, setActivePlatform] = useState<SocialTeaserPlatform>("x_twitter");
  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compilação dos teasers originais do motor de IA
  const compiled = useMemo(() => {
    return compileSocialTeasers(payload);
  }, [payload]);

  // Estado local com os textos personalizados de cada rede
  const [teaserTexts, setTeaserTexts] = useState<Record<SocialTeaserPlatform, string>>({
    x_twitter: compiled.x_twitter.text,
    threads: compiled.threads.text,
    instagram: compiled.instagram.text,
    whatsapp: compiled.whatsapp.text,
    telegram: compiled.telegram.text,
    linkedin: compiled.linkedin.text
  });

  // Atualiza os textos quando o payload muda substantivamente (mantendo consistência)
  useEffect(() => {
    const fresh = compileSocialTeasers(payload);
    setTeaserTexts({
      x_twitter: fresh.x_twitter.text,
      threads: fresh.threads.text,
      instagram: fresh.instagram.text,
      whatsapp: fresh.whatsapp.text,
      telegram: fresh.telegram.text,
      linkedin: fresh.linkedin.text
    });
  }, [payload.title, payload.summary, payload.contentMarkdown]);

  // Texto ativo atual
  const currentText = teaserTexts[activePlatform] || "";

  // Métricas reativas do texto ativo
  const metrics: TeaserMetrics = useMemo(() => {
    return calculateTeaserMetrics(activePlatform, currentText);
  }, [activePlatform, currentText]);

  // Manipulador de alteração no texto da rede
  const handleTextChange = (newText: string) => {
    setTeaserTexts(prev => ({
      ...prev,
      [activePlatform]: newText
    }));
    if (onTeaserChange) {
      onTeaserChange(activePlatform, newText);
    }
  };

  // Restaura o texto original da IA para a rede ativa
  const handleResetToAi = () => {
    const originalText = compiled[activePlatform].text;
    handleTextChange(originalText);
    toast.success(`Texto de ${SOCIAL_PLATFORM_NAMES[activePlatform]} restaurado para o original da IA!`);
  };

  // Inserção de link UTM na posição do cursor ou final do texto
  const handleInsertUtmLink = () => {
    const utmUrl = compiled[activePlatform].utmUrl;
    const insertion = activePlatform === "telegram" ? `[Ler no V5 AutoBlog](${utmUrl})` : utmUrl;
    insertAtCursor(`\n🔗 ${insertion}`);
    toast.success("Link com UTM rastreada inserido!");
  };

  // Inserção de hashtags
  const handleInsertHashtags = () => {
    const tags = formatHashtags(payload.blogOptions?.tags, 4);
    if (tags.length > 0) {
      insertAtCursor(`\n\n${tags.join(" ")}`);
      toast.success("Hashtags recomendadas inseridas!");
    } else {
      insertAtCursor("\n\n#V5Apollo #Capitania13 #Inovacao");
      toast.success("Hashtags padrão da holding inseridas!");
    }
  };

  // Inserção de gatilho Comment-to-DM
  const handleInsertCommentDm = () => {
    const dmHook = '\n\n💬 Comente "LINK" aqui embaixo para receber o acesso completo no seu Direct!';
    insertAtCursor(dmHook);
    toast.success('Gatilho de Comment-to-DM "LINK" inserido!');
  };

  // Inserção de bullet points
  const handleInsertBullets = () => {
    const bullets = extractBulletPoints(payload.contentMarkdown, 3);
    const bulletText = "\n\n📌 Pontos Principais:\n" + bullets.map(b => `✓ ${b}`).join("\n");
    insertAtCursor(bulletText);
    toast.success("Bullet points do artigo inseridos!");
  };

  // Função auxiliar para inserir texto na posição do cursor
  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleTextChange(currentText + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    handleTextChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Cópia rápida
  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    toast.success(`Teaser de ${SOCIAL_PLATFORM_NAMES[activePlatform]} copiado com sucesso!`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cor da barra de progresso
  const getProgressBarColor = () => {
    if (!metrics.isWithinLimit) return "bg-rose-500";
    if (metrics.percentUsed >= 85) return "bg-amber-400";
    return "bg-emerald-500";
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. CABEÇALHO DO PAINEL */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Painel de Edição de Teasers Individuais</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Etapa 057
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Refinamento manual com contadores dinâmicos e telemetria em tempo real
            </p>
          </div>
        </div>

        {/* Resumo Global de Conformidade */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">Status Geral:</span>
          {Object.keys(teaserTexts).every(k => calculateTeaserMetrics(k as SocialTeaserPlatform, teaserTexts[k as SocialTeaserPlatform]).isWithinLimit) ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>6/6 Redes Válidas</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2.5 py-0.5 rounded-full text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Atenção aos Limites</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. ABAS DE SELEÇÃO DAS 6 REDES SOCIAIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {(Object.keys(SOCIAL_PLATFORM_NAMES) as SocialTeaserPlatform[]).map((platformKey) => {
          const isSelected = activePlatform === platformKey;
          const text = teaserTexts[platformKey] || "";
          const platMetrics = calculateTeaserMetrics(platformKey, text);
          const icon = PLATFORM_ICONS[platformKey];

          return (
            <button
              key={platformKey}
              type="button"
              onClick={() => setActivePlatform(platformKey)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-zinc-900 border-zinc-700 shadow-md ring-1 ring-amber-500/40"
                  : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{icon}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    platMetrics.isWithinLimit
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-rose-950 text-rose-300 border border-rose-500/50"
                  }`}
                >
                  {platMetrics.charCount}/{platMetrics.charLimit}
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-200 mt-1 truncate w-full">
                {SOCIAL_PLATFORM_NAMES[platformKey].split(" ")[0]}
              </span>
              <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    !platMetrics.isWithinLimit ? "bg-rose-500" : platMetrics.percentUsed >= 85 ? "bg-amber-400" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, platMetrics.percentUsed)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. ÁREA DE TEXTO E EDIÇÃO AO VIVO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-base">{PLATFORM_ICONS[activePlatform]}</span>
            <span className="font-semibold text-white">{SOCIAL_PLATFORM_NAMES[activePlatform]}</span>
            <span className="text-zinc-500">| Limite Oficial: {metrics.charLimit}c</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToAi}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-400 transition-colors"
              title="Restaurar o texto original gerado pelo motor de IA"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar IA</span>
            </button>
          </div>
        </div>

        {/* Textarea Reativa */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={7}
            placeholder={`Digite ou refine o teaser personalizado para ${SOCIAL_PLATFORM_NAMES[activePlatform]}...`}
            className={`w-full bg-zinc-900/90 rounded-xl p-3.5 text-xs text-zinc-100 font-mono leading-relaxed border focus:outline-none transition-all resize-y ${
              !metrics.isWithinLimit
                ? "border-rose-500 focus:border-rose-400 bg-rose-950/20 shadow-sm shadow-rose-950"
                : metrics.status === "approaching_limit"
                ? "border-amber-500/70 focus:border-amber-400 bg-amber-950/10"
                : "border-zinc-800 focus:border-zinc-700"
            }`}
          />
        </div>

        {/* Barra de Progresso do Limite de Caracteres */}
        <div className="space-y-1">
          <div className="w-full bg-zinc-900 border border-zinc-800/80 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-200 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(100, metrics.percentUsed)}%` }}
            />
          </div>

          {/* Telemetria de Caracteres & Sweet Spot */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">
                Caracteres:{" "}
                <strong
                  className={`font-bold ${
                    !metrics.isWithinLimit
                      ? "text-rose-400"
                      : metrics.status === "approaching_limit"
                      ? "text-amber-400"
                      : "text-white"
                  }`}
                >
                  {metrics.charCount}
                </strong>{" "}
                / {metrics.charLimit} ({metrics.percentUsed}%)
              </span>

              {metrics.isWithinLimit ? (
                <span className="text-emerald-400 text-[11px] bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.2 rounded-md">
                  {metrics.remainingChars} restantes
                </span>
              ) : (
                <span className="text-rose-400 text-[11px] bg-rose-950 border border-rose-500/60 px-2 py-0.2 rounded-md font-bold animate-pulse">
                  Excesso de {Math.abs(metrics.remainingChars)} caracteres!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {metrics.isSweetSpot ? (
                <span className="text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Sweet Spot Ativo ({SOCIAL_SWEET_SPOTS[activePlatform].label})</span>
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">
                  Ideal: {SOCIAL_SWEET_SPOTS[activePlatform].label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BARRA DE ATALHOS RÁPIDOS DE INJEÇÃO */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-zinc-500 mr-1">Inserir:</span>
          <button
            type="button"
            onClick={handleInsertUtmLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono transition-colors"
          >
            <LinkIcon className="w-3 h-3 text-sky-400" />
            <span>+ Link UTM</span>
          </button>

          <button
            type="button"
            onClick={handleInsertHashtags}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono transition-colors"
          >
            <Hash className="w-3 h-3 text-amber-400" />
            <span>+ Hashtags</span>
          </button>

          <button
            type="button"
            onClick={handleInsertCommentDm}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono transition-colors"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>+ Gatilho LINK</span>
          </button>

          <button
            type="button"
            onClick={handleInsertBullets}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono transition-colors"
          >
            <ListPlus className="w-3 h-3 text-purple-400" />
            <span>+ Bullets</span>
          </button>
        </div>

        {/* Botão de Cópia da Rede Ativa */}
        <button
          type="button"
          onClick={handleCopyCurrent}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copiar {SOCIAL_PLATFORM_NAMES[activePlatform].split(" ")[0]}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
