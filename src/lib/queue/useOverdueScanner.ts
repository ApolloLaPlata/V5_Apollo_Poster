"use client";

/**
 * useOverdueScanner.ts - Hook React para Integração do Motor de Polling a Cada 60 Segundos
 * Capitania #13: V5 Apollo Poster (:3011)
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { usePosterStore } from "@/store/usePosterStore";
import { 
  OverdueScanner, 
  ScannerState, 
  TickResult, 
  formatTimeUntilNextTick,
  DEFAULT_POLLING_INTERVAL_MS 
} from "./overdueScanner";
import { QueueItem, ScheduledPost } from "@/types/poster";

export interface UseOverdueScannerOptions {
  enabled?: boolean;
  intervalMs?: number;
  onOverdueDetected?: (queueItems: QueueItem[], posts: ScheduledPost[], result: TickResult) => void;
}

export function useOverdueScanner(options: UseOverdueScannerOptions = {}) {
  const { enabled = true, intervalMs = DEFAULT_POLLING_INTERVAL_MS, onOverdueDetected } = options;

  const dispatchQueue = usePosterStore((s) => s.dispatchQueue);
  const posts = usePosterStore((s) => s.posts);

  const scannerRef = useRef<OverdueScanner | null>(null);
  const [scannerState, setScannerState] = useState<ScannerState | null>(null);
  const [lastTickResult, setLastTickResult] = useState<TickResult | null>(null);
  const [countdownString, setCountdownString] = useState<string>("60s");

  // Instancia e configura o scanner
  useEffect(() => {
    const scanner = new OverdueScanner({
      intervalMs,
      getQueue: () => usePosterStore.getState().dispatchQueue,
      getPosts: () => usePosterStore.getState().posts
    });

    scannerRef.current = scanner;

    const unsubTick = scanner.onTick((result) => {
      setLastTickResult(result);
      setScannerState(scanner.getState());
    });

    const unsubOverdue = scanner.onOverdueDetected((qItems, pItems, res) => {
      if (onOverdueDetected) {
        onOverdueDetected(qItems, pItems, res);
      }
    });

    if (enabled) {
      scanner.start();
      setScannerState(scanner.getState());
    }

    // Intervalo leve para atualizar a string da contagem regressiva visual a cada segundo
    const countdownInterval = setInterval(() => {
      if (scanner.getState().isRunning) {
        const remaining = scanner.getTimeUntilNextTick();
        setCountdownString(formatTimeUntilNextTick(remaining));
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      unsubTick();
      unsubOverdue();
      scanner.stop();
    };
  }, [enabled, intervalMs, onOverdueDetected]);

  // Mantém data sources sincronizadas com as referências do store
  useEffect(() => {
    if (scannerRef.current) {
      scannerRef.current.bindDataSources(
        () => usePosterStore.getState().dispatchQueue,
        () => usePosterStore.getState().posts
      );
    }
  }, [dispatchQueue, posts]);

  // Força uma varredura manual instantânea ("Escanear Agora")
  const triggerManualScan = useCallback(() => {
    if (scannerRef.current) {
      const res = scannerRef.current.tick();
      setLastTickResult(res);
      setScannerState(scannerRef.current.getState());
      return res;
    }
    return null;
  }, []);

  const togglePause = useCallback(() => {
    if (!scannerRef.current) return;
    const currentState = scannerRef.current.getState();
    if (currentState.status === "running") {
      scannerRef.current.pause();
    } else if (currentState.status === "paused") {
      scannerRef.current.resume();
    }
    setScannerState(scannerRef.current.getState());
  }, []);

  return {
    scannerState,
    lastTickResult,
    countdownString,
    triggerManualScan,
    togglePause,
    isScanning: scannerState?.isRunning ?? false
  };
}
