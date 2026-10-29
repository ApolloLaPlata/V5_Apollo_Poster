"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { V5SsoClient } from "@/lib/v5_sso_client";
import { Shield, AlertCircle } from "lucide-react";

function sanitizeRedirect(target: string | null, fallback: string = "/"): string {
  if (!target || typeof target !== "string") return fallback;
  const trimmed = target.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\") &&
    !trimmed.includes(":")
  ) {
    return trimmed;
  }
  return fallback;
}

const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;
const TRUSTED_DEVICE_TOKEN = "v5_trusted_device_live_verified";

function SsoCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("Processando autenticação soberana V5 ID...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code") || searchParams.get("grant_code");
    const rawSsoToken = searchParams.get("v5_sso_token");
    const redirectTarget = sanitizeRedirect(searchParams.get("redirect"), "/");

    if (rawSsoToken) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(rawSsoToken)));
        if (decoded.v5_id) {
          localStorage.setItem("v5_sso_user", JSON.stringify(decoded));
          localStorage.setItem("v5_trusted_device", TRUSTED_DEVICE_TOKEN);
          setStatus("Acesso soberano concedido via token V5 ID...");
          setTimeout(() => {
            router.push(redirectTarget);
          }, 600);
          return;
        }
      } catch (e) {
        console.warn("Falha ao decodificar token SSO direto:", e);
      }
    }

    if (!code) {
      setError("Código de autorização não recebido do portal central V5 ID.");
      return;
    }

    async function processCode() {
      try {
        const res = await V5SsoClient.exchangeGrantCode(code!, "v5_poster");
        if (res.ok && res.user) {
          const cookieDomain = window.location.hostname.includes("v5apollo.com") ? "; domain=.v5apollo.com" : "";
          document.cookie = `v5_trusted_device=${TRUSTED_DEVICE_TOKEN}; path=/; max-age=${THIRTY_DAYS_SEC}${cookieDomain}; SameSite=Lax`;
          if (res.token) {
            document.cookie = `v5_sso_token=${res.token}; path=/; max-age=${THIRTY_DAYS_SEC}${cookieDomain}; SameSite=Lax`;
            localStorage.setItem("v5_sso_token", res.token);
          }
          localStorage.setItem("v5_trusted_device", TRUSTED_DEVICE_TOKEN);
          localStorage.setItem("v5_trusted_device_expiry", (Date.now() + THIRTY_DAYS_SEC * 1000).toString());
          localStorage.setItem("v5_sso_user", JSON.stringify(res.user));

          setStatus("Acesso soberano concedido. Redirecionando para o V5 Apollo Poster...");
          setTimeout(() => {
            router.push(redirectTarget);
          }, 800);
        } else {
          setError(res.error || "Falha ao validar credenciais com o portal central.");
        }
      } catch (err: any) {
        setError(err.message || "Erro inesperado ao processar SSO.");
      }
    }

    processCode();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#06080d] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-[#0b0f17] border border-cyan-900/40 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-700/60 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-cyan-400" />
        </div>
        <h2 className="text-base font-bold text-white mb-2">V5 ID Single Sign-On</h2>

        {error ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 text-left mb-4 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">{status}</p>
          </div>
        )}

        {error && (
          <button
            onClick={() => router.push("/")}
            className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Voltar ao Início
          </button>
        )}
      </div>
    </div>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#06080d] flex items-center justify-center text-slate-400 font-mono text-xs">
        Carregando...
      </div>
    }>
      <SsoCallbackInner />
    </Suspense>
  );
}
