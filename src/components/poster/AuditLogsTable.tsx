"use client";

/**
 * AuditLogsTable.tsx - Tabela de Logs de Auditoria de Despacho
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Tabela Corporativa de Auditoria Onicanal:
 * - Colunas: Status HTTP, Data/Hora, Plataforma/Ação, ID da Mensagem, Descrição e Latência
 * - Busca textual instantânea por ID de mensagem, código HTTP, termos do payload
 * - Filtros por canal e status de sucesso/falha
 * - Paginação dinâmica e botão de cópia de MessageId com feedback
 */

import React, { useState } from "react";
import { DispatchLogEntry, SocialPlatform } from "@/types/poster";
import {
  getHttpStatusBadgeInfo,
  getLogRemoteMessageId,
  filterAndSortLogs,
  paginateLogs,
  formatAuditDateTime,
  getLogStatusCounts,
  StatusCategoryFilter
} from "@/lib/analytics/auditLogManager";
import { PLATFORM_METADATA } from "@/lib/analytics/channelDistribution";
import { formatRelativeDate } from "@/lib/utils/formatters";
import { toast } from "@/lib/toast/useToast";
import {
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
  Clock,
  Terminal,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Globe,
  Mail,
  Send,
  MessageSquare
} from "lucide-react";

interface AuditLogsTableProps {
  logs: DispatchLogEntry[];
  onSelectLog?: (log: DispatchLogEntry) => void;
}

export function AuditLogsTable({ logs, onSelectLog }: AuditLogsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusCategoryFilter>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calcula estatísticas quantitativas de status de forma memoizada
  const statusCounts = getLogStatusCounts(logs);

  // Aplica filtros e ordenação
  const filteredLogs = filterAndSortLogs(logs, {
    searchQuery,
    channelFilter,
    statusFilter,
    sortOrder
  });

  // Aplica paginação
  const paginated = paginateLogs(filteredLogs, currentPage, pageSize);

  const handleCopyId = (messageId: string) => {
    navigator.clipboard.writeText(messageId);
    setCopiedId(messageId);
    toast.success(`Message ID "${messageId}" copiado para a área de transferência!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (channel: SocialPlatform) => {
    switch (channel) {
      case "autoblog":
      case "wordpress":
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case "newsletter":
        return <Mail className="w-3.5 h-3.5 text-amber-400" />;
      case "whatsapp":
      case "telegram":
        return <Send className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-pink-400" />;
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Barra de Filtros e Busca de Auditoria */}
      <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Campo de Busca Textual */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por Message ID, status, payload ou texto..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Dropdowns de Filtro */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Canal */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Canais</option>
              <option value="autoblog">V5 AutoBlog</option>
              <option value="wordpress">WordPress REST</option>
              <option value="newsletter">Newsletter (Email)</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Filtro Granular por Status (Etapa 095) */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusCategoryFilter);
              setCurrentPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status ({statusCounts.total})</option>
            <option value="success">Apenas Sucesso 2xx ({statusCounts.success2xx})</option>
            <option value="all_errors">Todas as Falhas ({statusCounts.allErrors})</option>
            <option value="client_errors_4xx">Falhas de Cliente 4xx ({statusCounts.clientErrors4xx})</option>
            <option value="rate_limit_429">Rate Limit 429 ({statusCounts.rateLimit429})</option>
            <option value="server_errors_5xx">Falhas de Servidor 5xx ({statusCounts.serverErrors5xx})</option>
          </select>

          {/* Alternador de Ordenação */}
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition font-mono"
            title="Alternar ordem cronológica"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === "desc" ? "Mais Recentes" : "Mais Antigos"}</span>
          </button>
        </div>
      </div>

      {/* Segmented Pills de Status HTTP (Etapa 095) */}
      <div className="px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-zinc-500 text-[11px] mr-1 hidden sm:inline">Filtrar por Status:</span>

          {/* Pill Todos */}
          <button
            onClick={() => {
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              statusFilter === "all"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-950 text-zinc-400">
              {statusCounts.total}
            </span>
          </button>

          {/* Pill Sucesso 2xx */}
          <button
            onClick={() => {
              setStatusFilter("success");
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              statusFilter === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "bg-zinc-900/60 text-zinc-400 hover:text-emerald-300 border border-transparent"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>2xx OK</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400">
              {statusCounts.success2xx}
            </span>
          </button>

          {/* Pill Todas as Falhas */}
          <button
            onClick={() => {
              setStatusFilter("all_errors");
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
              statusFilter === "all_errors"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "bg-zinc-900/60 text-zinc-400 hover:text-red-300 border border-transparent"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Todas as Falhas</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-950 text-red-400">
              {statusCounts.allErrors}
            </span>
          </button>

          {/* Pill 4xx Cliente */}
          {statusCounts.clientErrors4xx > 0 && (
            <button
              onClick={() => {
                setStatusFilter("client_errors_4xx");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                statusFilter === "client_errors_4xx"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-rose-300 border border-transparent"
              }`}
            >
              <span>4xx Cliente</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400">
                {statusCounts.clientErrors4xx}
              </span>
            </button>
          )}

          {/* Pill 429 Rate Limit */}
          {statusCounts.rateLimit429 > 0 && (
            <button
              onClick={() => {
                setStatusFilter("rate_limit_429");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                statusFilter === "rate_limit_429"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-purple-300 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>429 Rate Limit</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-400">
                {statusCounts.rateLimit429}
              </span>
            </button>
          )}

          {/* Pill 5xx Servidor */}
          {statusCounts.serverErrors5xx > 0 && (
            <button
              onClick={() => {
                setStatusFilter("server_errors_5xx");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                statusFilter === "server_errors_5xx"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-amber-300 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>5xx Servidor</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-400">
                {statusCounts.serverErrors5xx}
              </span>
            </button>
          )}
        </div>

        {/* Indicador de Taxa de Sucesso */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500">Taxa de Entrega:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
              statusCounts.successRate >= 90
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : statusCounts.successRate >= 70
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {statusCounts.successRate}%
          </span>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/90 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">HTTP Status</th>
              <th className="py-3 px-4 font-semibold">Data / Hora</th>
              <th className="py-3 px-4 font-semibold">Canal / Ação</th>
              <th className="py-3 px-4 font-semibold">Remote Message ID</th>
              <th className="py-3 px-4 font-semibold">Descrição do Evento</th>
              <th className="py-3 px-4 font-semibold text-right">Latência</th>
              {onSelectLog && <th className="py-3 px-3 text-center">Detalhes</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60 font-sans">
            {paginated.items.length === 0 ? (
              <tr>
                <td colSpan={onSelectLog ? 7 : 6} className="py-12 text-center text-zinc-500">
                  <Terminal className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-300 font-medium">Nenhum evento localizado com os filtros atuais.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Tente ajustar a busca textual ou selecione "Todos os Canais".
                  </p>
                </td>
              </tr>
            ) : (
              paginated.items.map((log) => {
                const badge = getHttpStatusBadgeInfo(log.statusCode || (log.status === "success" ? 200 : 500));
                const messageId = getLogRemoteMessageId(log);
                const isCopied = copiedId === messageId;
                const platformMeta = PLATFORM_METADATA[log.channel] || { label: log.channel };

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Status HTTP */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${badge.badgeBg} ${badge.badgeText} ${badge.badgeBorder}`}
                      >
                        {badge.isSuccess ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        )}
                        {badge.label}
                      </span>
                    </td>

                    {/* Data / Hora */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-zinc-300 text-[11px]">
                        {formatAuditDateTime(log.timestamp)}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {formatRelativeDate(log.timestamp)}
                      </div>
                    </td>

                    {/* Canal / Ação */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                        {getPlatformIcon(log.channel)}
                        <span>{platformMeta.label}</span>
                      </div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-zinc-800/80 text-[10px] text-zinc-400 font-mono uppercase">
                        {log.action}
                      </span>
                    </td>

                    {/* Remote Message ID com Botão de Copiar */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-zinc-300 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800 max-w-[190px] truncate" title={messageId}>
                          {messageId}
                        </span>
                        <button
                          onClick={() => handleCopyId(messageId)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition"
                          title="Copiar Message ID"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Descrição do Evento */}
                    <td className="py-3 px-4">
                      <div className="text-zinc-200 font-medium line-clamp-1" title={log.message}>
                        {log.message}
                      </div>
                      {log.payloadSummary && (
                        <div className="text-[11px] text-zinc-500 font-mono line-clamp-1 mt-0.5" title={log.payloadSummary}>
                          {log.payloadSummary}
                        </div>
                      )}
                    </td>

                    {/* Latência */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-[11px]">
                      {log.latencyMs ? (
                        <span
                          className={
                            log.latencyMs < 60
                              ? "text-emerald-400"
                              : log.latencyMs < 150
                              ? "text-amber-400"
                              : "text-red-400"
                          }
                        >
                          {log.latencyMs}ms
                        </span>
                      ) : (
                        <span className="text-zinc-600">--</span>
                      )}
                    </td>

                    {/* Botão de Ação / Detalhes */}
                    {onSelectLog && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectLog(log)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                          title="Inspecionar payload do evento"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé da Tabela: Paginação */}
      <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span>
            Exibindo <strong>{paginated.totalCount === 0 ? 0 : paginated.startIndex + 1}</strong> a{" "}
            <strong>{paginated.endIndex}</strong> de <strong>{paginated.totalCount}</strong> eventos
          </span>

          <span className="text-zinc-600">•</span>

          <div className="flex items-center gap-1">
            <span>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Controles de Navegação da Página */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <span className="px-2 py-1 text-zinc-300">
            Página {currentPage} de {paginated.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(paginated.totalPages, p + 1))}
            disabled={currentPage >= paginated.totalPages}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <span>Próxima</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
