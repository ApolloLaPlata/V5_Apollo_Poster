import React from "react";
import Link from "next/link";
import { Compass, Home, Globe } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8 bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-8 sm:p-12 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-bold tracking-widest uppercase mx-auto">
          <Compass className="w-4 h-4" />
          <span>Erro 404 • Rota Não Mapeada</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Banner Não Encontrado
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
            O template ou arte promocional não foi localizada na galeria.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Galeria de Posters</span>
          </Link>

          <a
            href="https://v5apollo.com"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 transition-colors flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4 text-rose-400" />
            <span>Hub V5 Apollo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
