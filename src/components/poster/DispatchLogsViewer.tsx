"use client";

import React, { useState } from "react";
import { usePosterStore } from "@/store/usePosterStore";
import { History, Trash2, CheckCircle2, AlertTriangle, Clock, RefreshCw, Terminal } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils/formatters";

export function DispatchLogsViewer() {
  const { logs, clearLogs } = usePosterStore();
  const [filterChannel, setFilterChannel] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    if (filterChannel !== "all" && log.channel !== filterChannel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-amber-400" />
            <span>Auditoria de Transmissão Onicanal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Logs em Tempo Real de Despacho & Webhooks</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Registro de eventos de APIs oficiais (Meta Graph API, Resend, V5 AutoBlog REST, WhatsApp e Telegram).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Canais</option>
            <option value="instagram">Instagram</option>
            <option value="autoblog">AutoBlog</option>
            <option value="newsletter">Newsletter (Email)</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>TERMINAL DE LOGS ({filteredLogs.length} eventos registrados)</span>
          </div>
          <span className="text-[11px] text-zinc-500">Auto-sincronizado via DispatchEventBus</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto stroke-1" />
            <p className="font-medium text-zinc-400">Nenhum evento registrado ainda.</p>
            <p className="text-[11px]">Os disparos das abas Calendário, Dual Beehiiv, Comment-to-DM e Finders aparecerão aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-zinc-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {log.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white">{log.message}</span>
                      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono border border-zinc-700/60">
                        {log.channel}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.statusCode >= 200 && log.statusCode < 300 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        HTTP {log.statusCode}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">{log.payloadSummary}</p>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between text-right text-[11px] text-zinc-500 font-mono gap-1 shrink-0">
                  <span>{formatRelativeDate(log.timestamp)}</span>
                  {log.latencyMs && (
                    <span className="text-amber-400/80">⚡ {log.latencyMs}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
