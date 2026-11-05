"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Zap, 
  Check, 
  Tag, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  GraduationCap,
  Layers,
  Mail
} from "lucide-react";
import { 
  NICHE_CAMPAIGN_BLUEPRINTS, 
  NicheCampaignBlueprint 
} from "@/lib/comments/nicheCampaignPresets";
import { toast } from "@/lib/toast/useToast";

interface NicheCampaignPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlueprint: (blueprint: NicheCampaignBlueprint) => void;
}

export function NicheCampaignPresetsModal({
  isOpen,
  onClose,
  onSelectBlueprint
}: NicheCampaignPresetsModalProps) {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(
    NICHE_CAMPAIGN_BLUEPRINTS[0].id
  );

  if (!isOpen) return null;

  const currentBlueprint =
    NICHE_CAMPAIGN_BLUEPRINTS.find((b) => b.id === selectedBlueprintId) ||
    NICHE_CAMPAIGN_BLUEPRINTS[0];

  const handleApply = (blueprint: NicheCampaignBlueprint) => {
    onSelectBlueprint(blueprint);
    toast.success(
      `Campanha "${blueprint.name}" ativada!`,
      "Regra cadastrada no Zustand e pronta para simulação de disparo."
    );
    onClose();
  };

  const getNicheIcon = (id: string) => {
    switch (id) {
      case "finders_shopee_viral":
        return <ShoppingBag className="w-5 h-5 text-amber-400" />;
      case "infoproduct_vsl_master":
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      case "saas_poster_growth":
        return <Layers className="w-5 h-5 text-blue-400" />;
      case "beehiiv_newsletter_vip":
        return <Mail className="w-5 h-5 text-emerald-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Campanhas de 1-Clique por Nicho</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                  Turnkey Blueprints
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Modelos prontos de alta conversão calibrados com anti-spam nativo e mensagens diretas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Lista de Campanhas (5 colunas) */}
          <div className="md:col-span-5 space-y-2.5">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Selecione o Modelo de Campanha:
            </span>

            {NICHE_CAMPAIGN_BLUEPRINTS.map((bp) => {
              const isSelected = bp.id === selectedBlueprintId;
              return (
                <div
                  key={bp.id}
                  onClick={() => setSelectedBlueprintId(bp.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-left flex flex-col gap-2 relative ${
                    isSelected
                      ? "bg-zinc-900 border-amber-500/70 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40"
                      : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900/90 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-black/40 border border-white/5">
                        {getNicheIcon(bp.id)}
                      </div>
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {bp.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {bp.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] font-mono">
                    <span className="text-zinc-500">{bp.niche}</span>
                    <span className="text-emerald-400 font-bold">{bp.expectedConversion}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna Direita: Detalhes da Campanha Selecionada (7 colunas) */}
          <div className="md:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Badge & Título */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                    {currentBlueprint.badge}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {currentBlueprint.expectedConversion}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{currentBlueprint.name}</h4>
                <p className="text-xs text-zinc-400">{currentBlueprint.description}</p>
              </div>

              {/* Gatilhos e Palavras-chave */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Gatilhos Rastreados ({currentBlueprint.keywords.length} palavras):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentBlueprint.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[10px] font-bold"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resposta Pública Anti-Spam */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 font-semibold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Variações Públicas Rotativas ({currentBlueprint.publicReplyVariants.length} frases):
                </span>
                <div className="bg-black/30 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs text-zinc-300 font-sans max-h-24 overflow-y-auto">
                  {currentBlueprint.publicReplyVariants.map((v, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-mono text-[10px]">{i + 1}.</span>
                      <span className="text-zinc-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template da DM Privada */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 font-semibold flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Template da Mensagem Privada (DM):
                </span>
                <pre className="bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                  {currentBlueprint.dmMessageTemplate}
                </pre>
              </div>

              {/* Cupom & CTA */}
              <div className="flex items-center justify-between text-xs font-mono bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                <div>
                  <span className="text-zinc-500 text-[10px] block">CUPOM PADRÃO:</span>
                  <span className="text-amber-400 font-bold">{currentBlueprint.couponCode || "SEM CUPOM"}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 text-[10px] block">LINK CTA:</span>
                  <span className="text-blue-400 underline truncate max-w-[200px] block">
                    {currentBlueprint.ctaUrl}
                  </span>
                </div>
              </div>
            </div>

            {/* Ação de Instalação */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Extensões • Meta Graph API
              </span>

              <button
                type="button"
                onClick={() => handleApply(currentBlueprint)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-950/40 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Instalar Esta Campanha</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">
            Dica: Ao instalar, você pode personalizar livremente qualquer texto no editor.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
