"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  Trophy,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Flame,
  Scale
} from "lucide-react";
import { compareHooks, HookVariantMetrics } from "@/lib/social/abTestingEngine";
import { toast } from "@/lib/toast/useToast";

interface AbHookTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHook: string;
  onSelectWinningHook: (winningHook: string) => void;
}

export function AbHookTestingModal({
  isOpen,
  onClose,
  currentHook,
  onSelectWinningHook
}: AbHookTestingModalProps) {
  const [hookA, setHookA] = useState(
    currentHook || "5 Ferramentas de IA que Economizam 10 Horas da Sua Semana"
  );
  const [hookB, setHookB] = useState(
    "Pare de Fazer Isso Manualmente: O Método de IA que Corta 10 Horas em 2026"
  );

  const comparison = useMemo(() => {
    return compareHooks(hookA, hookB);
  }, [hookA, hookB]);

  if (!isOpen) return null;

  const handleApply = (selectedHook: string, variantLetter: "A" | "B") => {
    onSelectWinningHook(selectedHook);
    toast.success(
      `Gancho ${variantLetter} Aplicado com Sucesso!`,
      "Título do post atualizado no Estúdio."
    );
    onClose();
  };

  const renderVariantCard = (
    title: string,
    variantLetter: "A" | "B",
    text: string,
    setText: (val: string) => void,
    metrics: HookVariantMetrics,
    isWinner: boolean
  ) => {
    return (
      <div
        className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
          isWinner
            ? "bg-gradient-to-b from-amber-500/10 via-zinc-900 to-zinc-950 border-amber-500/60 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/40"
            : "bg-zinc-900/60 border-zinc-800/80"
        }`}
      >
        <div className="space-y-3">
          {/* Header do Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 font-mono font-bold text-xs flex items-center justify-center border border-zinc-700">
                {variantLetter}
              </span>
              <span className="text-sm font-bold text-white">{title}</span>
            </div>

            {isWinner && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                <Trophy className="w-3 h-3 text-amber-400" /> Vencedor Sugerido
              </span>
            )}
          </div>

          {/* Campo de Edição do Gancho */}
          <div className="space-y-1">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              placeholder="Digite o gancho..."
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>{text.length} caracteres</span>
              <span className={text.length >= 40 && text.length <= 90 ? "text-emerald-400" : "text-amber-400"}>
                {text.length >= 40 && text.length <= 90 ? "Densidade Ótima" : "Ajuste Recomendado"}
              </span>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-zinc-500 block">SCORE GERAL</span>
              <span className="text-xl font-extrabold text-white font-mono">
                {metrics.overallScore}
                <span className="text-xs text-zinc-500 font-normal">/100</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-zinc-500 block">RETENÇÃO (3S)</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {metrics.predictedRetention3s}%
              </span>
            </div>
          </div>

          {/* Barras de Desempenho Psicológico */}
          <div className="space-y-2 pt-1 text-[11px] font-mono">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Quebra de Padrão:</span>
                <span className="text-white font-bold">{metrics.patternInterruptScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${metrics.patternInterruptScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Gap de Curiosidade:</span>
                <span className="text-white font-bold">{metrics.curiosityGapScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${metrics.curiosityGapScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>Concisão Visual:</span>
                <span className="text-white font-bold">{metrics.brevityScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${metrics.brevityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Diagnóstico Rápido */}
          <div className="space-y-1.5 pt-2 text-[11px] font-sans">
            {metrics.strengths.slice(0, 2).map((s, i) => (
              <div key={i} className="flex items-start gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-tight">{s}</span>
              </div>
            ))}
            {metrics.improvements.slice(0, 1).map((m, i) => (
              <div key={i} className="flex items-start gap-1.5 text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-tight">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Aplicação */}
        <button
          type="button"
          onClick={() => handleApply(text, variantLetter)}
          className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition active:scale-95 ${
            isWinner
              ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-950/40"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
          }`}
        >
          <span>Escolher Gancho {variantLetter}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Teste A/B de Ganchos Virais</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" /> Retenção 3 Segundos
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Compare duas frases de entrada e descubra qual gerará maior retenção algorítmica antes de postar.
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

        {/* Resumo da Vitória / Delta */}
        <div className="px-6 py-3.5 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{comparison.summaryReason}</span>
          </div>

          {comparison.winner !== "tie" && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
              +{comparison.predictedRetentionDelta}% Retenção
            </span>
          )}
        </div>

        {/* Comparação Lado a Lado (2 Colunas) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderVariantCard(
            "Variação A (Atual)",
            "A",
            hookA,
            setHookA,
            comparison.variantA,
            comparison.winner === "A"
          )}

          {renderVariantCard(
            "Variação B (Alternativa)",
            "B",
            hookB,
            setHookB,
            comparison.variantB,
            comparison.winner === "B"
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Heurísticas baseadas no algoritmo 2026 de Reels, TikTok e Shorts</span>
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
