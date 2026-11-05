"use client";

import React, { useState, useMemo } from "react";
import { 
  Flame, 
  X, 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Copy
} from "lucide-react";
import { 
  SAMPLE_COMPETITOR_RADAR_DATA, 
  rankPostsByViralEfficiency, 
  calculateViralScore,
  CompetitorPostMetric
} from "@/lib/analytics/viralRadarApify";
import { toast } from "@/lib/toast/useToast";

interface ViralRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyHook?: (snippet: string) => void;
}

export function ViralRadarModal({ isOpen, onClose, onApplyHook }: ViralRadarModalProps) {
  // Calculadora personalizada
  const [calcFollowers, setCalcFollowers] = useState<number>(10000);
  const [calcLikes, setCalcLikes] = useState<number>(1200);
  const [calcComments, setCalcComments] = useState<number>(340);
  const [calcSnippet, setCalcSnippet] = useState<string>("Gatilho de teste...");

  const rankedPosts = useMemo(() => {
    return rankPostsByViralEfficiency(SAMPLE_COMPETITOR_RADAR_DATA);
  }, []);

  const customCalcResult = useMemo(() => {
    const dummyPost: CompetitorPostMetric = {
      id: "custom-post",
      handle: "@seu_post_analisado",
      followers: calcFollowers,
      postUrl: "#",
      captionSnippet: calcSnippet,
      postType: "reels",
      likes: calcLikes,
      comments: calcComments,
      postedAt: "Agora"
    };
    return calculateViralScore(dummyPost);
  }, [calcFollowers, calcLikes, calcComments, calcSnippet]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Radar de Viralização do Nicho (Método Apify)</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Curtidas ÷ Seguidores
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Identifique posts que realmente furaram a bolha, sem se enganar por métricas de vaidade.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Box Didático: Por que Curtidas ÷ Seguidores importa */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>O Segredo Revelado pelo Método Marcondes:</span>
            </div>
            <p className="leading-relaxed">
              Um influenciador com <strong>500.000 seguidores</strong> que tem <strong>4.000 curtidas</strong> gerou apenas <strong>0.8% de engajamento</strong>.
              Já um criador com <strong>8.000 seguidores</strong> que conquistou <strong>2.400 curtidas</strong> alcançou mais de <strong>30% de tração real</strong>!
              O post que mais andou no algoritmo é o segundo — é ele que você deve modelar para o seu canal.
            </p>
          </div>

          {/* Calculadora Interativa Rápida */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Simulador de Tração Viral do Post</span>
              </span>
              <span className="text-zinc-500">Fórmula: ((Likes + Comments×2) ÷ Seguidores) × 100</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Seguidores da Conta:</label>
                <input
                  type="number"
                  value={calcFollowers}
                  onChange={(e) => setCalcFollowers(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Curtidas do Post:</label>
                <input
                  type="number"
                  value={calcLikes}
                  onChange={(e) => setCalcLikes(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Comentários (Peso 2x):</label>
                <input
                  type="number"
                  value={calcComments}
                  onChange={(e) => setCalcComments(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Resultado do Diagnóstico */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">Score de Tração Ponderado:</span>
                  <span className="text-base font-bold font-mono text-amber-400">
                    {customCalcResult.weightedViralScore}%
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {customCalcResult.viralityBadge}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{customCalcResult.takeawayInsight}</p>
              </div>

              <div className="text-right text-[11px] font-mono text-zinc-500">
                <div>Likes/Seguidores: {customCalcResult.likeToFollowerRatio}%</div>
                <div>Engajamento Total: {customCalcResult.rawEngagement.toLocaleString("pt-BR")}</div>
              </div>
            </div>
          </div>

          {/* Tabela de Benchmarks Comparativos no Nicho */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Ranking de Eficiência de Conteúdo (Simulação de Varredura Apify):</span>
            </h4>

            <div className="space-y-2">
              {rankedPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">{post.handle}</span>
                      <span className="text-zinc-500 text-[11px] font-mono">
                        ({post.followers.toLocaleString("pt-BR")} seguidores)
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400">
                        {post.postType}
                      </span>
                    </div>

                    <p className="text-zinc-300 italic text-xs">
                      "{post.captionSnippet}"
                    </p>

                    <div className="text-[11px] text-zinc-500">
                      {post.takeawayInsight}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-amber-400">
                        {post.weightedViralScore}% Score
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {post.likes.toLocaleString("pt-BR")} curtidas • {post.comments} coments
                      </div>
                    </div>

                    {onApplyHook && (
                      <button
                        onClick={() => {
                          onApplyHook(post.captionSnippet);
                          toast.success("Gancho copiado para o Estúdio!");
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono flex items-center gap-1 transition"
                        title="Modelar este gancho no estúdio"
                      >
                        <span>Modelar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Capitania #13 · V5 Apollo Poster</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition"
          >
            Fechar Radar
          </button>
        </div>
      </div>
    </div>
  );
}
