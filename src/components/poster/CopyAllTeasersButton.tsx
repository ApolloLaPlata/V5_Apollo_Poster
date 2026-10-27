/**
 * CopyAllTeasersButton.tsx - Botão de Cópia do Kit Completo Onicanal
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Copia todos os 6 teasers sociais compilados de uma só vez:
 * - Cabeçalhos formatados em Markdown limpo por plataforma
 * - Metadados de contagem de caracteres e limites oficiais
 * - Feedback visual de sucesso e notificação de toast
 */

import React, { useState } from "react";
import { PackageCheck, Copy, Check, Sparkles } from "lucide-react";
import { MultimodalDispatchPayload } from "@/types/poster";
import { compileSocialTeasers } from "@/lib/social/socialTeaserEngine";
import { copyToClipboard, formatAllTeasersBundle } from "@/lib/social/socialCopyEngine";
import { toast } from "@/lib/toast/useToast";

export interface CopyAllTeasersButtonProps {
  payload: MultimodalDispatchPayload;
  className?: string;
}

export function CopyAllTeasersButton({ payload, className = "" }: CopyAllTeasersButtonProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopyAll = async () => {
    try {
      const compiled = compileSocialTeasers(payload);
      const bundleText = formatAllTeasersBundle(payload, compiled);
      const success = await copyToClipboard(bundleText);

      if (success) {
        setIsCopied(true);
        toast.success("Kit Completo Onicanal (6 redes) copiado para a área de transferência!");
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        toast.error("Falha ao copiar pacote de teasers.");
      }
    } catch (err) {
      toast.error("Erro ao gerar pacote de teasers.");
      console.error(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopyAll}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all select-none active:scale-95 shadow-md ${
        isCopied
          ? "bg-emerald-950/90 border-emerald-500/70 text-emerald-300 shadow-emerald-950/40"
          : "bg-gradient-to-r from-amber-600/90 to-amber-500/90 hover:from-amber-500 hover:to-amber-400 text-white border-amber-400/40 shadow-amber-950/30"
      } ${className}`}
      title="Copia todos os 6 teasers compilados em um bloco Markdown organizado"
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in-75 duration-150" />
          <span className="font-bold">Kit Completo Copiado!</span>
        </>
      ) : (
        <>
          <PackageCheck className="w-4 h-4 text-amber-200" />
          <span>Copiar Kit Onicanal (6 Redes)</span>
        </>
      )}
    </button>
  );
}
