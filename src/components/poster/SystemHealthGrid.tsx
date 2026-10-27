"use client";

/**
 * SystemHealthGrid.tsx - Painel Visual de Saúde do Sistema e APIs Parceiras
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Monitor de Status em Tempo Real:
 * - Indicadores semafóricos de SLA para o Gateway e APIs oficiais parceiras
 * - Banner de alertas inteligentes com diagnóstico e ação recomendada
 * - Uptime percentual, latência recente e score global de disponibilidade
 */

import React, { useState } from "react";
import { DispatchLogEntry } from "@/types/poster";
import { evaluateSystemHealth, PartnerServiceHealth } from "@/lib/analytics/systemHealthMonitor";
import { formatAuditDateTime } from "@/lib/analytics/auditLogManager";
import { toast } from "@/lib/toast/useToast";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Zap,
  Globe,
  Send,
  Mail,
  Video,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface SystemHealthGridProps {
  logs: DispatchLogEntry[];
}

export function SystemHealthGrid({ logs }: SystemHealthGridProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const healthReport = evaluateSystemHealth(logs);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Telemetria de conectividade e status de APIs atualizada!");
  };

  const getStatusBadge = (status: PartnerServiceHealth["status"]) => {
    switch (status) {
      case "operational":
        return {
          label: "OPERACIONAL",
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          dotClass: "bg-emerald-400"
        };
      case "degraded":
        return {
          label: "DEGRADADO",
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          dotClass: "bg-amber-400 animate-pulse"
        };
      case "outage":
        return {
          label: "INDISPONÍVEL",
          badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
          dotClass: "bg-red-400 animate-ping"
        };
      default:
        return {
          label: "MANUTENÇÃO",
          badgeClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
          dotClass: "bg-zinc-500"
        };
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 font-sans">
      {/* Cabeçalho de Status Global */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Saúde do Gateway V5 Apollo & APIs Parceiras</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  healthReport.overallStatus === "operational"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : healthReport.overallStatus === "degraded"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {healthReport.overallStatus === "operational"
                  ? "SISTEMA 100% OPERACIONAL"
                  : healthReport.overallStatus === "degraded"
                  ? "ALERTA: SERVIÇOS DEGRADADOS"
                  : "CRÍTICO: INTERRUPÇÃO DE SERVIÇO"}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Monitoramento ativo de SLA das conexões em nuvem oficiais e webhooks
            </p>
          </div>
        </div>

        {/* Score de Saúde e Botão de Atualizar */}
        <div className="flex items-center gap-2.5">
          <div className="font-mono text-xs bg-zinc-950/70 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-zinc-500 text-[11px]">SLA Global:</span>
            <span
              className={`font-bold ${
                healthReport.overallHealthScore >= 95
                  ? "text-emerald-400"
                  : healthReport.overallHealthScore >= 80
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {healthReport.overallHealthScore}%
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Recalcular métricas de conectividade"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Banner de Incidentes Ativos (se houver) */}
      {healthReport.activeIncidents.length > 0 && (
        <div className="space-y-2">
          {healthReport.activeIncidents.map((incident, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                incident.severity === "critical"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {incident.severity === "critical" ? (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{incident.serviceName}:</span>
                    <span className="font-normal text-xs">{incident.message}</span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    <strong>Ação Recomendada:</strong> {incident.actionRequired}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono opacity-70 whitespace-nowrap bg-black/30 px-2 py-1 rounded">
                {formatAuditDateTime(incident.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grid de Serviços Parceiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {healthReport.services.map((service) => {
          const badge = getStatusBadge(service.status);

          return (
            <div
              key={service.serviceId}
              className="bg-zinc-950/70 border border-zinc-800/80 p-3.5 rounded-xl flex flex-col justify-between space-y-2.5 hover:border-zinc-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.badgeClass}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="font-bold text-zinc-100 truncate" title={service.name}>
                  {service.name}
                </div>
              </div>

              {/* Mensagem de Incidente Específica */}
              {service.incidentMessage && (
                <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-mono line-clamp-2">
                  {service.incidentMessage}
                </div>
              )}

              {/* Métricas de Latência e Uptime */}
              <div className="pt-1 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{service.latencyMs}ms</span>
                </span>
                <span>Uptime: <strong className="text-zinc-200">{service.uptimePercent}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
