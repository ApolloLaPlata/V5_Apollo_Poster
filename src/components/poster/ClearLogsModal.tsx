"use client";

/**
 * ClearLogsModal.tsx - Modal de Segurança para Limpeza e Poda de Logs
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Diálogo de Segurança com Dupla Barreira:
 * - Seleção inteligente de estratégia (24h, 7 dias, Apenas Sucessos 2xx, Exclusão Total)
 * - Exigência de digitação de palavra de confirmação para Purge Total
 * - Opção de backup de segurança em JSON pré-exclusão
 * - Feedback visual com contagem exata de registros afetados
 */

import React, { useState, useEffect } from "react";
import { DispatchLogEntry } from "@/types/poster";
import {
  PruneStrategy,
  PRUNE_STRATEGIES,
  pruneLogsByStrategy,
  validateSecurityConfirmation,
  backupLogsBeforePruning
} from "@/lib/analytics/logPruner";
import { toast } from "@/lib/toast/useToast";
import {
  AlertTriangle,
  Trash2,
  X,
  Download,
  ShieldAlert,
  Clock,
  CheckCircle,
  ShieldCheck
} from "lucide-react";

interface ClearLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DispatchLogEntry[];
  onConfirmPrune: (remainingLogs: DispatchLogEntry[], removedCount: number) => void;
}

export function ClearLogsModal({
  isOpen,
  onClose,
  logs,
  onConfirmPrune
}: ClearLogsModalProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<PruneStrategy>("older_than_24h");
  const [confirmationInput, setConfirmationInput] = useState("");
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);

  // Reseta campos ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedStrategy("older_than_24h");
      setConfirmationInput("");
      setHasDownloadedBackup(false);
    }
  }, [isOpen]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calcula estimativa prévia de registros removidos para a estratégia selecionada
  const simulation = pruneLogsByStrategy(logs, selectedStrategy);
  const currentStrategyMeta = PRUNE_STRATEGIES.find((s) => s.id === selectedStrategy);
  const isConfirmationValid = currentStrategyMeta?.requiresConfirmationWord
    ? validateSecurityConfirmation(confirmationInput, "CONFIRMAR")
    : true;

  const handleBackup = () => {
    const ok = backupLogsBeforePruning(logs);
    if (ok) {
      setHasDownloadedBackup(true);
      toast.success("Snapshot de segurança baixado com sucesso!");
    } else {
      toast.error("Falha ao gerar o download de backup.");
    }
  };

  const handleExecutePrune = () => {
    if (!isConfirmationValid) {
      toast.error('Digite a palavra "CONFIRMAR" para autorizar a exclusão.');
      return;
    }

    const result = pruneLogsByStrategy(logs, selectedStrategy);
    onConfirmPrune(result.remainingLogs, result.removedCount);
    toast.success(
      `${result.removedCount} ${result.removedCount === 1 ? "registro removido" : "registros removidos"} com sucesso!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Janela Modal */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col font-sans">
        {/* Cabeçalho de Alerta de Segurança */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/90 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Limpeza de Histórico de Auditoria
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Total atual: <strong className="text-zinc-200 font-mono">{logs.length}</strong> eventos registrados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com Estratégias */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-semibold mb-2">
              Selecione o Critério de Limpeza:
            </label>
            <div className="space-y-2">
              {PRUNE_STRATEGIES.map((strategy) => {
                const isSelected = selectedStrategy === strategy.id;
                const stratSim = pruneLogsByStrategy(logs, strategy.id);

                return (
                  <div
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? strategy.severity === "danger"
                          ? "bg-rose-500/10 border-rose-500/40 text-white"
                          : strategy.severity === "warning"
                          ? "bg-amber-500/10 border-amber-500/40 text-white"
                          : "bg-blue-500/10 border-blue-500/40 text-white"
                        : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 text-zinc-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            strategy.severity === "danger"
                              ? "bg-rose-500"
                              : strategy.severity === "warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <span>{strategy.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {strategy.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                        -{stratSim.removedCount} logs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmação Textual caso exigido */}
          {currentStrategyMeta?.requiresConfirmationWord && (
            <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Barreira de Segurança Ativada</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Para confirmar a exclusão definitiva de todos os <strong>{logs.length}</strong> registros, digite{" "}
                <span className="font-mono font-bold text-rose-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  CONFIRMAR
                </span>{" "}
                abaixo:
              </p>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="Digite CONFIRMAR"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          {/* Banner de Snapshot de Backup */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recomendado: Snapshot de Segurança</span>
              </span>
              <p className="text-[10px] text-zinc-500 font-mono">
                Baixe um arquivo JSON com todos os logs antes da exclusão
              </p>
            </div>

            <button
              onClick={handleBackup}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition flex items-center gap-1.5 shrink-0 ${
                hasDownloadedBackup
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{hasDownloadedBackup ? "Backup Feito" : "Baixar Backup"}</span>
            </button>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition font-medium"
          >
            Cancelar
          </button>

          <button
            onClick={handleExecutePrune}
            disabled={!isConfirmationValid || simulation.removedCount === 0}
            className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5 ${
              isConfirmationValid && simulation.removedCount > 0
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950"
                : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir {simulation.removedCount} {simulation.removedCount === 1 ? "Registro" : "Registros"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
