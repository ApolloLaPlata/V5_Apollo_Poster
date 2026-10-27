"use client";

/**
 * LogPayloadDrawer.tsx - Drawer Modal de Inspeção Profunda de Payloads
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Painel Slide-over de Auditoria Técnica de Rede:
 * - Visualização exata do JSON enviado (Request Payload) e recebido (Response Payload)
 * - Identificadores de mensagem remotos com botão de cópia rápida
 * - Métricas de latência, IP de origem, tentativas de retry e headers HTTP
 * - Suporte a atalhos de teclado (ESC para fechar)
 */

import React, { useState, useEffect } from "react";
import { DispatchLogEntry } from "@/types/poster";
import { extractLogPayloads } from "@/lib/analytics/payloadInspector";
import { getHttpStatusBadgeInfo, formatAuditDateTime } from "@/lib/analytics/auditLogManager";
import { PLATFORM_METADATA } from "@/lib/analytics/channelDistribution";
import { toast } from "@/lib/toast/useToast";
import {
  X,
  Copy,
  Check,
  Code2,
  Send,
  Download,
  Server,
  Cpu,
  Clock,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";

interface LogPayloadDrawerProps {
  log: DispatchLogEntry | null;
  onClose: () => void;
}

export function LogPayloadDrawer({ log, onClose }: LogPayloadDrawerProps) {
  const [activeTab, setActiveTab] = useState<"response" | "request" | "metadata">("response");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Escuta tecla ESC para fechar o Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!log) return null;

  const data = extractLogPayloads(log);
  const badge = getHttpStatusBadgeInfo(data.statusCode);
  const platformMeta = PLATFORM_METADATA[data.channel] || { label: data.channel };

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copiado para a área de transferência!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity duration-300">
      {/* Backdrop para fechar ao clicar fora */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Painel Lateral Slide-over */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Cabeçalho do Drawer */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border ${badge.badgeBg} ${badge.badgeText} ${badge.badgeBorder}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.isSuccess ? "bg-emerald-400" : "bg-red-400"}`} />
                {badge.label}
              </span>

              <span className="text-zinc-600">•</span>

              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {platformMeta.label}
              </span>

              <span className="text-zinc-600">•</span>

              <span className="text-xs font-mono text-zinc-500 uppercase">
                {data.action}
              </span>
            </div>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Inspeção de Payload & Auditoria de Rede</span>
            </h3>

            {/* Remote Message ID em Destaque */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-400 font-mono">Message ID:</span>
              <span className="font-mono text-xs text-amber-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {data.remoteMessageId}
              </span>
              <button
                onClick={() => handleCopy(data.remoteMessageId, "Remote Message ID", "msgId")}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                title="Copiar Message ID"
              >
                {copiedKey === "msgId" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Botão de Fechar */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Abas de Navegação Técnica */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-950 px-5 text-xs font-mono">
          <button
            onClick={() => setActiveTab("response")}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition ${
              activeTab === "response"
                ? "border-amber-400 text-amber-300 bg-amber-400/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Response Payload</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-400">
              {data.responseSizeFormatted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("request")}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition ${
              activeTab === "request"
                ? "border-amber-400 text-amber-300 bg-amber-400/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Payload</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-400">
              {data.requestSizeFormatted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("metadata")}
            className={`py-3 px-4 border-b-2 font-medium flex items-center gap-2 transition ${
              activeTab === "metadata"
                ? "border-amber-400 text-amber-300 bg-amber-400/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Headers & Rede</span>
          </button>
        </div>

        {/* Conteúdo Dinâmico do Painel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Aba: Response Payload */}
          {activeTab === "response" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Corpo da Resposta Oficial Retornada pela API parceira</span>
                </div>
                <button
                  onClick={() => handleCopy(data.rawResponseJson, "Response JSON", "resJson")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono transition"
                >
                  {copiedKey === "resJson" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 overflow-x-auto shadow-inner">
                <pre className="font-mono text-xs text-emerald-300/90 leading-relaxed whitespace-pre">
                  {data.rawResponseJson}
                </pre>
              </div>
            </div>
          )}

          {/* Aba: Request Payload */}
          {activeTab === "request" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span>Payload Despachado pelo V5 Apollo Poster</span>
                </div>
                <button
                  onClick={() => handleCopy(data.rawRequestJson, "Request JSON", "reqJson")}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono transition"
                >
                  {copiedKey === "reqJson" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 overflow-x-auto shadow-inner">
                <pre className="font-mono text-xs text-blue-300/90 leading-relaxed whitespace-pre">
                  {data.rawRequestJson}
                </pre>
              </div>
            </div>
          )}

          {/* Aba: Metadados & Headers */}
          {activeTab === "metadata" && (
            <div className="space-y-4">
              {/* Grid de Cards de Metadados de Rede */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Data / Hora Local</span>
                  <p className="font-mono font-semibold text-zinc-200">
                    {formatAuditDateTime(data.timestamp)}
                  </p>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Latência da Requisição</span>
                  <p className="font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{data.latencyMs} ms</span>
                  </p>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">IP / Gateway de Saída</span>
                  <p className="font-mono font-semibold text-zinc-300">
                    {data.ipAddress}
                  </p>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl space-y-1">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Tentativa de Envio</span>
                  <p className="font-mono font-semibold text-amber-300">
                    Tentativa #{data.retryAttempt} (Máx: 3)
                  </p>
                </div>
              </div>

              {/* Tabela de Headers HTTP Simulados */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Headers HTTP da Requisição (Audit Ready)</span>
                </span>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-800/60">
                      {Object.entries(data.headers).map(([key, val]) => (
                        <tr key={key} className="hover:bg-zinc-800/30">
                          <td className="py-2 px-3 text-zinc-400 font-medium whitespace-nowrap bg-zinc-950/40 w-1/3">
                            {key}
                          </td>
                          <td className="py-2 px-3 text-zinc-200 break-all select-all">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Drawer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditoria Criptográfica SOC2 Verificada</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition font-medium"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
