"use client";

/**
 * AuditExportButtons.tsx - Botões de Exportação de Logs para Auditoria (JSON e CSV)
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Controles de Exportação:
 * - Exportar em formato JSON estruturado com envelope SOC2
 * - Exportar em formato CSV tabular para análise em Excel / Google Sheets
 * - Suporte a exportação de logs filtrados ou coleção completa
 * - Feedback instantâneo com toast de notificação
 */

import React, { useState } from "react";
import { DispatchLogEntry } from "@/types/poster";
import {
  exportLogsToJson,
  exportLogsToCsv,
  generateExportFilename,
  triggerFileDownload
} from "@/lib/analytics/auditLogExporter";
import { toast } from "@/lib/toast/useToast";
import { Download, FileJson, FileSpreadsheet, ChevronDown, Check } from "lucide-react";

interface AuditExportButtonsProps {
  logs: DispatchLogEntry[];
  totalCount?: number;
  label?: string;
  className?: string;
}

export function AuditExportButtons({
  logs,
  totalCount,
  label,
  className = ""
}: AuditExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExportedFormat, setLastExportedFormat] = useState<string | null>(null);

  const isFiltered = totalCount !== undefined && totalCount > logs.length;
  const countToExport = logs.length;

  const handleExport = (format: "json" | "csv") => {
    if (countToExport === 0) {
      toast.error("Não há registros de log para exportar com os filtros atuais.");
      return;
    }

    try {
      const filename = generateExportFilename(format);
      let content = "";
      let mimeType = "";

      if (format === "json") {
        content = exportLogsToJson(logs);
        mimeType = "application/json;charset=utf-8;";
      } else {
        content = exportLogsToCsv(logs);
        mimeType = "text/csv;charset=utf-8;";
      }

      const success = triggerFileDownload(content, filename, mimeType);
      if (success) {
        setLastExportedFormat(format);
        toast.success(
          `Arquivo "${filename}" (${countToExport} ${countToExport === 1 ? "evento" : "eventos"}) exportado com sucesso!`
        );
        setTimeout(() => setLastExportedFormat(null), 3000);
      } else {
        toast.error("Não foi possível iniciar o download do arquivo de auditoria.");
      }
    } catch (err) {
      console.error("Erro na exportação de logs:", err);
      toast.error("Ocorreu uma falha ao gerar o arquivo de exportação.");
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Botão Principal Dropdown */}
      <div className="inline-flex rounded-xl shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium transition"
          title="Exportar logs para auditoria"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{label || (isFiltered ? `Exportar Filtrados (${countToExport})` : `Exportar Logs (${countToExport})`)}</span>
          <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
        </button>
      </div>

      {/* Menu Dropdown de Formatos */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans text-xs">
            <div className="px-3 py-1.5 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              Formato de Exportação ({countToExport} registros)
            </div>

            {/* Opção JSON */}
            <button
              onClick={() => handleExport("json")}
              className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-900 text-zinc-300 hover:text-white transition group"
            >
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                <div>
                  <div className="font-semibold text-zinc-200">Arquivo JSON (.json)</div>
                  <div className="text-[10px] text-zinc-500 font-mono">Envelope SOC2 com Payloads</div>
                </div>
              </div>
              {lastExportedFormat === "json" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Opção CSV */}
            <button
              onClick={() => handleExport("csv")}
              className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-zinc-900 text-zinc-300 hover:text-white transition group"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                <div>
                  <div className="font-semibold text-zinc-200">Arquivo CSV (.csv)</div>
                  <div className="text-[10px] text-zinc-500 font-mono">Excel, Sheets e RFC 4180</div>
                </div>
              </div>
              {lastExportedFormat === "csv" && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
