"use client";

import React from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Sparkles, 
  Info, 
  Link2, 
  FileText, 
  Check, 
  ChevronRight,
  TrendingUp,
  AlertOctagon
} from "lucide-react";
import { SpamAuditResult } from "@/lib/dispatch/spamAuditor";

interface SpamAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: SpamAuditResult;
  onReaudit: () => void;
}

export function SpamAuditModal({ isOpen, onClose, audit, onReaudit }: SpamAuditModalProps) {
  // Fechamento via tecla ESC
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSafe = audit.rating === "safe";
  const isModerate = audit.rating === "moderate";
  const isRisky = audit.rating === "risky";

  const getScoreColor = () => {
    if (isSafe) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (isModerate) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  const getProgressColor = () => {
    if (isSafe) return "bg-emerald-500";
    if (isModerate) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-900 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col z-10"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${getScoreColor()}`}>
              {isSafe && <ShieldCheck className="w-5 h-5" />}
              {isModerate && <ShieldAlert className="w-5 h-5" />}
              {isRisky && <AlertOctagon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Auditor de Spam Score & Entregabilidade</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Etapa 039
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Heurística de conformidade com Google Postmaster, Microsoft SmartScreen e SpamAssassin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Top Score Banner */}
          <div className={`p-4 rounded-xl border ${getScoreColor()} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                Diagnóstico de Reputação:
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {audit.ratingLabel}
              </div>
              <div className="text-xs text-zinc-300 mt-1">
                Taxa de Entregabilidade Estimada: <strong className="text-white font-mono">{audit.deliverabilityEstimate}%</strong>
              </div>
            </div>

            <div className="flex items-baseline gap-1 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800/80 font-mono">
              <span className="text-2xl font-black text-white">{audit.score.toFixed(1)}</span>
              <span className="text-zinc-500 font-medium">/10.0</span>
            </div>
          </div>

          {/* 4 Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Palavras</span>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{audit.totalWords}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Total Links</span>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{audit.linkCount}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Texto por Link</span>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{audit.textToLinkRatio} pal/link</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Gatilhos Spam</span>
              <div className={`text-sm font-bold font-mono flex items-center gap-1.5 ${audit.detectedTriggers.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{audit.detectedTriggers.length}</span>
              </div>
            </div>
          </div>

          {/* Deliverability Bar */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>Projeção de Entrega na Caixa de Entrada:</span>
              <span className="text-white font-bold">{audit.deliverabilityEstimate}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${audit.deliverabilityEstimate}%` }}
              />
            </div>
          </div>

          {/* Checklist de Conformidade */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono block">
              Checklist de Requisitos Obrigatórios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                {audit.checklist.hasCleanSubject ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className={audit.checklist.hasCleanSubject ? "text-zinc-300" : "text-amber-300 font-medium"}>
                  Assunto limpo e sem caixa alta
                </span>
              </div>

              <div className="flex items-center gap-2">
                {audit.checklist.hasPreheader ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className={audit.checklist.hasPreheader ? "text-zinc-300" : "text-amber-300 font-medium"}>
                  Preheader configurado
                </span>
              </div>

              <div className="flex items-center gap-2">
                {audit.checklist.hasBalancedLinks ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className={audit.checklist.hasBalancedLinks ? "text-zinc-300" : "text-amber-300 font-medium"}>
                  Equilíbrio entre texto e links (&gt;25 pal/link)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {audit.checklist.hasAltTagsOnImages ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className={audit.checklist.hasAltTagsOnImages ? "text-zinc-300" : "text-amber-300 font-medium"}>
                  Tags ALT presentes em todas as imagens
                </span>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                {audit.checklist.hasUnsubscribeMention ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span className={audit.checklist.hasUnsubscribeMention ? "text-zinc-300" : "text-rose-300 font-medium"}>
                  Rodapé institucional com link de descadastramento (RFC-8058)
                </span>
              </div>
            </div>
          </div>

          {/* Gatilhos Detectados */}
          {audit.detectedTriggers.length > 0 && (
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Gatilhos Identificados no Texto ({audit.detectedTriggers.length}):
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Substituições Sugeridas</span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {audit.detectedTriggers.map((t, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        t.severity === "high" 
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                          : t.severity === "medium" 
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {t.severity}
                      </span>
                      <span className="font-semibold text-white">"{t.word}"</span>
                      <span className="text-zinc-500 text-[10px] font-mono">({t.location})</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 italic">
                      💡 {t.suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penalidades Heurísticas Atribuídas */}
          {audit.penalties.length > 0 && (
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono block">
                Detalhamento de Penalidades Atribuídas:
              </span>
              <div className="space-y-1.5">
                {audit.penalties.map((pen, idx) => (
                  <div key={idx} className="flex items-start justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 gap-3">
                    <div>
                      <div className="font-semibold text-zinc-200">{pen.title}</div>
                      <div className="text-[11px] text-zinc-400">{pen.description}</div>
                    </div>
                    <span className="font-mono text-rose-400 font-bold whitespace-nowrap bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[11px]">
                      +{pen.points.toFixed(1)} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendações Acionáveis */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono block">
              Recomendações para Entregabilidade Máxima:
            </span>
            <ul className="space-y-1.5 text-zinc-300 text-xs">
              {audit.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 flex-shrink-0">
          <div className="text-[10px] text-zinc-500 font-mono">
            Última auditoria: {audit.auditedAt}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReaudit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reanalisar Agora</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
