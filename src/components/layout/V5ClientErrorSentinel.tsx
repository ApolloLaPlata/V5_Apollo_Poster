'use client';

import { useEffect, useRef } from 'react';

export interface V5ClientErrorSentinelProps {
  siteId?: string;
}

/**
 * V5 CLIENT ERROR SENTINEL — HOLDING V5 APOLLO
 * Telemetria de resiliência e captura passiva de exceções no navegador do cliente.
 * Captura silenciosamente falhas de rede, scripts ou rejeições não tratadas
 * e sincroniza com a telemetria do ecossistema sem quebrar a UI.
 */
export function V5ClientErrorSentinel({ siteId = 'master' }: V5ClientErrorSentinelProps) {
  const lastSentTime = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportError = (payload: {
      message: string;
      source?: string;
      lineno?: number;
      colno?: number;
      stack?: string;
    }) => {
      // Ignora ruídos comuns de extensões de navegador ou ResizeObserver
      const msg = payload.message || '';
      if (
        msg.includes('ResizeObserver loop') ||
        msg.includes('Extension context invalidated') ||
        msg.includes('chrome-extension://') ||
        msg.includes('moz-extension://') ||
        msg.includes('safari-extension://')
      ) {
        return;
      }

      // Throttling: no máximo 1 reporte a cada 10 segundos
      const now = Date.now();
      if (now - lastSentTime.current < 10000) return;
      lastSentTime.current = now;

      try {
        fetch('/api/v1/telemetry/client-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId,
            ...payload,
            url: window.location.pathname + window.location.search,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      } catch {}
    };

    const handleGlobalError = (event: ErrorEvent) => {
      reportError({
        message: event.message || 'Erro de execução no cliente',
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message || 'Promise rejeitada sem tratamento no cliente';
      reportError({
        message,
        source: 'unhandledrejection',
        stack: reason?.stack,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [siteId]);

  return null;
}

export default V5ClientErrorSentinel;
