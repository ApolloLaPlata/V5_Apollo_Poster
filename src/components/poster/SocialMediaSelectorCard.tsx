/**
 * SocialMediaSelectorCard.tsx - Card de Seleção e Geração de Mídia Social
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Permite ao operador selecionar ou gerar a mídia que acompanhará o despacho social:
 * - 4 Modos de Origem: Capa do Artigo, Card SVG Gerado, Galeria Curada e URL Customizada
 * - 3 Proporções de Aspect Ratio: 16:9 (Paisagem), 1:1 (Quadrado), 4:5 (Retrato)
 * - 4 Temas Visuais de Card: Dark Apollo, Cyber Neon, Minimal Editorial e Emerald Matrix
 * - Preview visual em tempo real com dimensões e recomendações de rede
 * - Ações: Aplicar ao Artigo, Copiar URL da Imagem e Baixar SVG
 */

import React, { useState, useMemo } from "react";
import { 
  Image as ImageIcon, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sliders, 
  Layers, 
  Grid, 
  Palette, 
  Link2, 
  CheckCircle2, 
  Maximize2,
  RefreshCw
} from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { 
  SocialMediaAspectRatio, 
  SocialCardTheme, 
  SocialMediaSourceType, 
  ASPECT_RATIO_CONFIGS, 
  SOCIAL_CARD_THEMES, 
  CURATED_SOCIAL_PRESETS, 
  generateSvgSocialCard, 
  getSvgDataUri, 
  buildSocialMediaAsset 
} from "@/lib/social/socialCardGenerator";
import { copyToClipboard } from "@/lib/social/socialCopyEngine";
import { toast } from "@/lib/toast/useToast";

export interface SocialMediaSelectorCardProps {
  payload: MultimodalDispatchPayload;
  onUpdateCoverImage?: (newUrl: string, altText?: string) => void;
}

export function SocialMediaSelectorCard({ payload, onUpdateCoverImage }: SocialMediaSelectorCardProps) {
  const [sourceType, setSourceType] = useState<SocialMediaSourceType>("cover_article");
  const [aspectRatio, setAspectRatio] = useState<SocialMediaAspectRatio>("16:9");
  const [selectedTheme, setSelectedTheme] = useState<SocialCardTheme>("dark_apollo");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const aspectConfig = ASPECT_RATIO_CONFIGS[aspectRatio];

  // Constrói o ativo de mídia atual
  const activeAsset = useMemo(() => {
    return buildSocialMediaAsset(
      payload,
      sourceType,
      aspectRatio,
      selectedTheme,
      customUrlInput
    );
  }, [payload, sourceType, aspectRatio, selectedTheme, customUrlInput]);

  // Aplica a imagem como capa principal do artigo
  const handleApplyToArticle = () => {
    if (onUpdateCoverImage) {
      onUpdateCoverImage(activeAsset.url, activeAsset.altText);
      toast.success("Mídia definida como capa principal do artigo!");
    } else {
      toast.info("Mídia selecionada pronta para despacho!");
    }
  };

  // Copia a URL da imagem
  const handleCopyUrl = async () => {
    const success = await copyToClipboard(activeAsset.url);
    if (success) {
      setCopied(true);
      toast.success("URL da mídia copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Baixa o card SVG gerado
  const handleDownloadSvg = () => {
    if (sourceType !== "generated_card") {
      window.open(activeAsset.url, "_blank");
      return;
    }
    const svgContent = generateSvgSocialCard(payload, selectedTheme, aspectRatio);
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `social-card-${payload.slug || "v5poster"}-${aspectRatio}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Card Social SVG baixado com sucesso!");
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* 1. CABEÇALHO DO SELETOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Seletor de Mídia & Card de Destaque Social</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Etapa 059
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Imagens otimizadas por proporção para X/Twitter, Instagram, WhatsApp e LinkedIn
            </p>
          </div>
        </div>

        {/* Badge de Proporção e Resolução */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
            {aspectConfig.label} ({aspectConfig.width}x{aspectConfig.height}px)
          </span>
        </div>
      </div>

      {/* 2. SELETOR DE MODO DE ORIGEM & PROPORÇÃO */}
      <div className="space-y-3">
        {/* Modos de Origem */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setSourceType("cover_article")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
              sourceType === "cover_article"
                ? "bg-zinc-900 border-zinc-700 text-white shadow ring-1 ring-sky-500/40"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-base">🖼️</span>
            <div>
              <span className="font-semibold block">Capa do Artigo</span>
              <span className="text-[10px] text-zinc-500">Imagem Original</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSourceType("generated_card")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
              sourceType === "generated_card"
                ? "bg-zinc-900 border-zinc-700 text-white shadow ring-1 ring-amber-500/40"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-base">🎨</span>
            <div>
              <span className="font-semibold block">Card SVG Gerado</span>
              <span className="text-[10px] text-zinc-500">Tipografia & Selo</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSourceType("preset_gallery")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
              sourceType === "preset_gallery"
                ? "bg-zinc-900 border-zinc-700 text-white shadow ring-1 ring-emerald-500/40"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-base">📚</span>
            <div>
              <span className="font-semibold block">Galeria Curada</span>
              <span className="text-[10px] text-zinc-500">Fotos de Alta Res.</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSourceType("custom_url")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
              sourceType === "custom_url"
                ? "bg-zinc-900 border-zinc-700 text-white shadow ring-1 ring-purple-500/40"
                : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="text-base">🔗</span>
            <div>
              <span className="font-semibold block">URL Externa</span>
              <span className="text-[10px] text-zinc-500">CDN / S3 Custom</span>
            </div>
          </button>
        </div>

        {/* Barra de Proporção (Aspect Ratio) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400">Proporção da Imagem:</span>
            <div className="flex items-center gap-1">
              {(Object.keys(ASPECT_RATIO_CONFIGS) as SocialMediaAspectRatio[]).map((ratioKey) => {
                const isSelected = aspectRatio === ratioKey;
                return (
                  <button
                    key={ratioKey}
                    type="button"
                    onClick={() => setAspectRatio(ratioKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      isSelected
                        ? "bg-sky-600 text-white font-semibold shadow-sm"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {ratioKey}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="text-zinc-500">Recomendado para:</span>
            <span className="text-zinc-200">{aspectConfig.recommendedFor.join(", ")}</span>
          </div>
        </div>

        {/* Seletor de Tema (Apenas no Modo Card SVG) */}
        {sourceType === "generated_card" && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-zinc-400">Tema do Card:</span>
            {(Object.keys(SOCIAL_CARD_THEMES) as SocialCardTheme[]).map((themeKey) => {
              const tm = SOCIAL_CARD_THEMES[themeKey];
              const isSelected = selectedTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setSelectedTheme(themeKey)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span>{tm.emoji}</span>
                  <span>{tm.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input de URL Customizada (Apenas no Modo URL Externa) */}
        {sourceType === "custom_url" && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Cole a URL da imagem (https://cdn.seudominio.com/banner.jpg)..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Grade de Fotos da Galeria Curada */}
        {sourceType === "preset_gallery" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {CURATED_SOCIAL_PRESETS.map((preset) => {
              const isSelected = activeAsset.url === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    if (onUpdateCoverImage) {
                      onUpdateCoverImage(preset.url, preset.alt);
                    }
                  }}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all aspect-video ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/40"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.alt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate w-full">
                      {preset.category}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PREVIEW VISUAL AO VIVO DO ATIVO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            Visualização Proporcional ({aspectRatio}):
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {activeAsset.isGeneratedSvg ? "SVG Vetorial Dinâmico" : "Raster HD"}
          </span>
        </div>

        {/* Container da Imagem com Aspect Ratio Dinâmico */}
        <div className="w-full bg-[#09090b] border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner p-2">
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 shadow-2xl relative flex items-center justify-center bg-zinc-900"
            style={{
              aspectRatio: aspectRatio === "16:9" ? "16 / 9" : aspectRatio === "1:1" ? "1 / 1" : "4 / 5"
            }}
          >
            <img
              src={activeAsset.url}
              alt={activeAsset.altText}
              className="w-full h-full object-cover select-none"
            />

            {/* Marca d'água discreta de dimensões */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-zinc-300 font-mono border border-white/10 select-none">
              {aspectConfig.width}x{aspectConfig.height}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTÕES DE AÇÃO: APLICAR, COPIAR E BAIXAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center gap-2">
          {sourceType === "generated_card" && (
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar Card SVG</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">URL Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copiar URL da Imagem</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleApplyToArticle}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-950/40 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Definir como Imagem de Despacho</span>
        </button>
      </div>
    </div>
  );
}
