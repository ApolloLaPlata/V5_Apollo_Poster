"use client";

import React, { useState } from "react";
import { 
  X, 
  Terminal, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Bot,
  Zap,
  Activity
} from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { toast } from "@/lib/toast/useToast";

interface CommentWebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PAYLOADS = [
  {
    label: "🔥 Lead Quente ('EU QUERO O LINK')",
    commentText: "EU QUERO O LINK com o desconto de 50% por favor!",
    username: "@marcos_growth",
    platform: "instagram"
  },
  {
    label: "⚡ Typo Tolerado ('manda o linck')",
    commentText: "Gostei muito, manda o linck no direct!",
    username: "@juliana_tech",
    platform: "instagram"
  },
  {
    label: "💸 Pedido de Preço ('qual o preco')",
    commentText: "Qual o preco dessa ferramenta de automação?",
    username: "@felipe_compras",
    platform: "tiktok"
  },
  {
    label: "🛡️ Comentário Neutro ('muito bom')",
    commentText: "Parabéns pelo trabalho, conteúdo muito bom!",
    username: "@rodrigo_silva",
    platform: "instagram"
  }
];

export function CommentWebhookSimulatorModal({ isOpen, onClose }: CommentWebhookSimulatorModalProps) {
  const { logCommentTrigger } = usePosterStore();
  const [commentText, setCommentText] = useState(SAMPLE_PAYLOADS[0].commentText);
  const [username, setUsername] = useState(SAMPLE_PAYLOADS[0].username);
  const [platform, setPlatform] = useState<"instagram" | "tiktok">("instagram");
  const [isDispatching, setIsDispatching] = useState(false);
  const [isTestingHandshake, setIsTestingHandshake] = useState(false);
  const [responseLog, setResponseLog] = useState<any | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof SAMPLE_PAYLOADS[0]) => {
    setCommentText(preset.commentText);
    setUsername(preset.username);
    setPlatform(preset.platform as any);
  };

  const handleTestHandshake = async () => {
    setIsTestingHandshake(true);
    setResponseLog(null);
    const start = performance.now();
    try {
      const challengeToken = `CHALLENGE_${Date.now()}`;
      const url = `/api/comments/webhook?hub.mode=subscribe&hub.verify_token=v5_meta_webhook_verify_token_apollo_2026&hub.challenge=${challengeToken}`;
      const res = await fetch(url);
      const text = await res.text();
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);

      const success = res.status === 200 && text === challengeToken;
      setResponseLog({
        type: "HANDSHAKE_GET",
        endpoint: "/api/comments/webhook",
        httpStatus: res.status,
        expectedChallenge: challengeToken,
        receivedChallenge: text,
        success,
        durationMs: duration
      });

      if (success) {
        toast.success("Handshake Meta Graph Aprovado!", `Resposta 200 OK em ${duration}ms com challenge válido.`);
      } else {
        toast.error("Falha no Handshake", `Status HTTP: ${res.status}`);
      }
    } catch (err: any) {
      toast.error("Erro ao testar handshake", err.message);
    } finally {
      setIsTestingHandshake(false);
    }
  };

  const handleDispatchWebhook = async () => {
    if (!commentText.trim()) return;
    setIsDispatching(true);
    setResponseLog(null);
    const start = performance.now();

    const payload = {
      commentText,
      username,
      commentId: `cmt_${Date.now()}`,
      platform
    };

    try {
      const res = await fetch("/api/comments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);

      setResponseLog({
        type: "WEBHOOK_POST",
        endpoint: "/api/comments/webhook",
        httpStatus: res.status,
        payloadSent: payload,
        responseReceived: data,
        durationMs: duration
      });

      if (data.status === "success" || data.status === "dispatched") {
        toast.success("Disparo Comment-to-DM Efetuado!", `Palavra '${data.matchedKeyword}' detectada. DM enviada em ${duration}ms.`);
        
        // Injeta o log no store local para refletir na interface
        logCommentTrigger({
          ruleId: "rule-cloud-webhook",
          ruleName: "Meta Cloud Webhook Gateway (:3011)",
          matchedKeyword: data.matchedKeyword || "LINK",
          username: username,
          commentText: commentText,
          publicReply: data.publicReply?.text || data.publicReply?.sentText || "Enviado no Direct!",
          dmMessage: data.privateDm?.text || data.privateDm?.sentMessage || "Aqui está o link!",
          ctaUrl: data.privateDm?.trackedUrl || "https://v5autoblog.com"
        });
      } else {
        toast.info("Comentário Processado", data.reason || "Nenhum gatilho compatível.");
      }
    } catch (err: any) {
      toast.error("Erro ao enviar webhook", err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyJson = () => {
    if (!responseLog) return;
    navigator.clipboard.writeText(JSON.stringify(responseLog, null, 2));
    setCopied(true);
    toast.success("JSON copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Bancada de Teste do Webhook Nuvem</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  POST & GET /api/comments/webhook
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulador HTTP real de eventos Meta Graph API (Instagram & TikTok) com extração cognitiva em nuvem.
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

        {/* Presets Rápidos */}
        <div className="px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-zinc-500 font-bold uppercase text-[10px] mr-1">Cenários Rápidos:</span>
          {SAMPLE_PAYLOADS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition border border-zinc-700 shrink-0 text-[11px]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Corpo do Simulador */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Coluna Esquerda: Formulário de Envio */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
                <span className="text-xs font-mono font-bold text-zinc-300 block border-b border-zinc-800 pb-2">
                  Configuração do Comentário
                </span>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Plataforma de Origem:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPlatform("instagram")}
                      className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-mono transition ${
                        platform === "instagram"
                          ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      Instagram Feed/Reels
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform("tiktok")}
                      className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-mono transition ${
                        platform === "tiktok"
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      TikTok Vídeo
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Handle do Seguidor (@username):</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400">Texto do Comentário:</label>
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Digite o comentário..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isDispatching}
                    onClick={handleDispatchWebhook}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-2 transition shadow-md"
                  >
                    {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Disparar POST Webhook</span>
                  </button>

                  <button
                    type="button"
                    disabled={isTestingHandshake}
                    onClick={handleTestHandshake}
                    className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-zinc-700/60 flex items-center justify-center gap-1.5 transition"
                  >
                    {isTestingHandshake ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3 text-cyan-400" />}
                    <span>Testar Handshake Meta (GET)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Resposta do Servidor em Tempo Real */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Resposta HTTP do Endpoint (:3011)
                  </span>
                  {latencyMs !== null && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {latencyMs}ms de latência
                    </span>
                  )}
                </div>

                {responseLog ? (
                  <div className="space-y-3 flex-1 flex flex-col">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            responseLog.httpStatus === 200
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          HTTP {responseLog.httpStatus}
                        </span>
                        <span className="text-zinc-400 text-[11px]">{responseLog.endpoint}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyJson}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copiar JSON</span>
                      </button>
                    </div>

                    {/* Resumo Formatado se Disparado */}
                    {(responseLog.responseReceived?.status === "success" || responseLog.responseReceived?.status === "dispatched") && (
                      <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Gatilho Reconhecido:</span>
                          <span className="text-amber-400 font-bold uppercase">
                            "{responseLog.responseReceived.matchedKeyword}"
                          </span>
                        </div>

                        <div className="border-t border-zinc-800/80 pt-2 space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                            Resposta Pública Rotativa (Anti-Ban):
                          </span>
                          <p className="text-zinc-200 text-[11px] italic">
                            "{responseLog.responseReceived.publicReply?.text || responseLog.responseReceived.publicReply?.sentText}"
                          </p>
                        </div>

                        <div className="border-t border-zinc-800/80 pt-2 space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                            DM Privada Enviada com UTM:
                          </span>
                          <p className="text-zinc-300 text-[11px]">
                            {responseLog.responseReceived.privateDm?.text || responseLog.responseReceived.privateDm?.sentMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Raw JSON Inspector */}
                    <div className="flex-1 bg-black/80 rounded-xl p-3 border border-zinc-800/80 font-mono text-[10px] text-emerald-400 overflow-auto max-h-[180px]">
                      <pre>{JSON.stringify(responseLog, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-600 font-mono text-xs space-y-2">
                    <Terminal className="w-8 h-8 opacity-40 text-cyan-500" />
                    <p>Aguardando disparo de teste...</p>
                    <span className="text-[10px] text-zinc-500">
                      Escolha um dos cenários acima ou digite um comentário e clique em "Disparar POST Webhook".
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 text-[11px]">
            Endpoint Seguro: <code className="text-zinc-400">/api/comments/webhook</code> · Porta :3011
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
