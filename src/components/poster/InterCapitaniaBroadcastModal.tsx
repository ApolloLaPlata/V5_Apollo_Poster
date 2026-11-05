"use client";

import React, { useState } from "react";
import { 
  X, 
  Send, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Server, 
  ArrowRight,
  FileText,
  Music,
  Video,
  Flame,
  Check,
  Cpu
} from "lucide-react";
import { 
  CAPITANIAS_REGISTRY, 
  CapitaniaTargetId, 
  executeCrossCapitaniaBroadcast, 
  BroadcastReport,
  CrossDispatchPayload
} from "@/lib/dispatch/crossCapitaniaEngine";
import { toast } from "@/lib/toast/useToast";
import { usePosterStore } from "@/store/usePosterStore";

interface InterCapitaniaBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: CrossDispatchPayload;
}

export function InterCapitaniaBroadcastModal({
  isOpen,
  onClose,
  payload
}: InterCapitaniaBroadcastModalProps) {
  const { addLog } = usePosterStore();
  const [selectedTargets, setSelectedTargets] = useState<CapitaniaTargetId[]>([
    "autoblog",
    "studio",
    "finders"
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [report, setReport] = useState<BroadcastReport | null>(null);

  if (!isOpen) return null;

  const toggleTarget = (id: CapitaniaTargetId) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleExecuteBroadcast = async () => {
    if (selectedTargets.length === 0) {
      toast.error("Selecione pelo menos uma Capitania de destino.");
      return;
    }

    setIsBroadcasting(true);
    setReport(null);
    toast.info("Iniciando Transmissão Inter-Capitanias...");

    try {
      const res = await executeCrossCapitaniaBroadcast(payload, selectedTargets);
      setReport(res);

      // Registra nos logs estruturados do Poster
      for (const delivery of res.deliveries) {
        const mappedChannel = delivery.targetId === "autoblog"
          ? "autoblog"
          : delivery.targetId === "studio"
          ? "youtube"
          : delivery.targetId === "sound"
          ? "tiktok"
          : "whatsapp";

        addLog({
          channel: mappedChannel,
          action: "publish",
          status: delivery.success ? "success" : "failed",
          statusCode: delivery.statusCode,
          message: delivery.message,
          payloadSummary: `[Capitania :${delivery.port}] ${payload.title}`,
          remoteMessageId: delivery.receiptId,
          latencyMs: delivery.latencyMs
        });
      }

      toast.success(
        "Transmissão Concluída!",
        `${res.successfulCount} Capitanias sincronizadas com sucesso em ${res.overallLatencyMs}ms.`
      );
    } catch {
      toast.error("Falha na transmissão", "Ocorreu um erro no pipeline de despacho.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const getTargetIcon = (id: CapitaniaTargetId) => {
    switch (id) {
      case "autoblog":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "sound":
        return <Music className="w-4 h-4 text-pink-400" />;
      case "studio":
        return <Video className="w-4 h-4 text-purple-400" />;
      case "finders":
        return <Flame className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Transmissão Inter-Capitanias (Holding V5)</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                  Onicanal Cloud API
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Dispare este conteúdo simultaneamente para o AutoBlog, Apollo Studio, Finders e Sound Studio.
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

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Resumo do Conteúdo em Trânsito */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Conteúdo a Ser Transmitido:
            </span>
            <h4 className="text-sm font-bold text-white line-clamp-1">{payload.title}</h4>
            <p className="text-zinc-300 line-clamp-2">{payload.content}</p>
          </div>

          {/* Seletor de Capitanias Alvo */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
              <span>Selecione as Capitanias de Destino ({selectedTargets.length}/4):</span>
              <span className="text-zinc-500 font-normal">HTTP REST / Chave Mestra</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(CAPITANIAS_REGISTRY) as CapitaniaTargetId[]).map((key) => {
                const target = CAPITANIAS_REGISTRY[key];
                const isSelected = selectedTargets.includes(key);

                return (
                  <div
                    key={key}
                    onClick={() => toggleTarget(key)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/40 shadow-sm"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                      {getTargetIcon(key)}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{target.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 font-bold">:{target.port}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">{target.role}</p>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-blue-500 border-blue-400 text-black"
                          : "border-zinc-700 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relatório de Transmissão (quando disparado) */}
          {report && (
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Transmissão Concluída
                </span>
                <span className="text-zinc-500">Latência Total: {report.overallLatencyMs}ms</span>
              </div>

              <div className="space-y-2">
                {report.deliveries.map((d) => (
                  <div
                    key={d.targetId}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      {getTargetIcon(d.targetId)}
                      <span className="font-bold text-white">{d.targetName}</span>
                      <span className="text-zinc-500">(:30{d.port.toString().slice(-2)})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        HTTP {d.statusCode}
                      </span>
                      <span className="text-zinc-500 text-[10px]">{d.latencyMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold transition"
          >
            Fechar
          </button>

          <button
            type="button"
            disabled={isBroadcasting || selectedTargets.length === 0}
            onClick={handleExecuteBroadcast}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isBroadcasting
                ? "Transmitindo..."
                : `Transmitir para ${selectedTargets.length} Capitanias`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
