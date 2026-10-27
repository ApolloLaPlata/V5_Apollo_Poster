/**
 * SocialCopyButton.tsx - Botão de Cópia com 1 Clique e Feedback Visual Reativo
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Componente universal de cópia para a área de transferência:
 * - Alternância dinâmica de ícone (Copy -> Check) com animação
 * - Feedback contextual com contagem de caracteres e nome da rede
 * - Várias opções de layout (default, compact, pill, primary, ghost)
 * - Integração nativa com toast e fallback resiliente
 */

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { SocialTeaserPlatform } from "@/types/poster";
import { copyToClipboard, getCopyFeedbackMessage } from "@/lib/social/socialCopyEngine";
import { toast } from "@/lib/toast/useToast";

export type SocialCopyButtonVariant = "default" | "primary" | "compact" | "pill" | "ghost";

export interface SocialCopyButtonProps {
  textToCopy: string;
  platform?: SocialTeaserPlatform;
  label?: string;
  copiedLabel?: string;
  variant?: SocialCopyButtonVariant;
  showCharCount?: boolean;
  className?: string;
  onCopySuccess?: () => void;
}

export function SocialCopyButton({
  textToCopy,
  platform,
  label = "Copiar Teaser",
  copiedLabel = "Copiado!",
  variant = "default",
  showCharCount = false,
  className = "",
  onCopySuccess
}: SocialCopyButtonProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    if (!textToCopy) {
      toast.error("Nenhum texto disponível para cópia.");
      return;
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setIsCopied(true);

      if (platform) {
        const feedback = getCopyFeedbackMessage(platform, textToCopy.length);
        toast.success(feedback);
      } else {
        toast.success("Texto copiado para a área de transferência!");
      }

      if (onCopySuccess) {
        onCopySuccess();
      }

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } else {
      toast.error("Não foi possível copiar o texto automaticamente.");
    }
  };

  // Estilização por variante
  let variantStyles = "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700";
  if (variant === "primary") {
    variantStyles = "bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-950/40";
  } else if (variant === "compact") {
    variantStyles = "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800 px-2 py-1 text-[11px]";
  } else if (variant === "pill") {
    variantStyles = "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 rounded-full px-3 py-1";
  } else if (variant === "ghost") {
    variantStyles = "bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-transparent";
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!textToCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${className} ${
        isCopied ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300" : ""
      }`}
      title={isCopied ? "Copiado com sucesso!" : "Clique para copiar para a área de transferência"}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in-75 duration-150" />
          <span className="text-emerald-400 font-bold">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span>{label}</span>
          {showCharCount && textToCopy && (
            <span className="text-[10px] text-zinc-500 font-mono">({textToCopy.length}c)</span>
          )}
        </>
      )}
    </button>
  );
}
