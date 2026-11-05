'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Crown,
  Tag,
  Headphones,
  CheckCircle2
} from 'lucide-react';

export interface V5FloatingConciergeProps {
  currentSite?: string;
  currentSiteId?: string;
}

const siteContextMessages: Record<string, { label: string; text: string }> = {
  sound: {
    label: 'V5 Apollo Sound & Music',
    text: 'Olá! Estou no V5 Apollo Sound e gostaria de saber mais sobre geração de músicas, stems e clonagem de voz.'
  },
  avatar: {
    label: 'V5 Avatar 360 & Swap',
    text: 'Olá! Estou no V5 Avatar 360 e gostaria de saber mais sobre modelos neurais, turnaround e consistência.'
  },
  broadcaster: {
    label: 'V5 Broadcaster Rádio 24/7',
    text: 'Olá! Estou no V5 Broadcaster e gostaria de entender sobre o host de IA e transmissão contínua 24h.'
  },
  edit: {
    label: 'Apollo Edit Web Studio',
    text: 'Olá! Estou no Apollo Edit Web e gostaria de suporte sobre renderização de episódios na Nvidia H100.'
  },
  autoblog: {
    label: 'V5 Autoblog SEO Machine',
    text: 'Olá! Estou no V5 Autoblog e gostaria de saber mais sobre geração autônoma de artigos com E-E-A-T.'
  },
  pocket: {
    label: 'V5 Pocket Director',
    text: 'Olá! Estou no Pocket Director e gostaria de suporte sobre roteiros virais de 60s e storyboards.'
  },
  poster: {
    label: 'V5 Creative Poster',
    text: 'Olá! Estou no V5 Creative Poster e gostaria de saber mais sobre capas virais em alta resolução.'
  },
  prisma: {
    label: 'V5 Prisma Vision',
    text: 'Olá! Estou no V5 Prisma Vision e gostaria de entender sobre geração multi-câmera e efeitos neurais.'
  },
  academy: {
    label: 'V5 Academy Formação',
    text: 'Olá! Estou no V5 Academy e gostaria de informações sobre masterclasses e automação com agentes.'
  },
  finance: {
    label: 'V5 Apollo Finance Holding',
    text: 'Olá! Estou no V5 Apollo Finance e gostaria de falar sobre tesouraria soberana e checkout D+0.'
  },
  tools: {
    label: 'V5 Tools Hub',
    text: 'Olá! Estou no V5 Tools Hub e gostaria de suporte sobre os utilitários e APIs da holding.'
  },
  rmt: {
    label: 'V5 Apollo RMT Games',
    text: 'Olá! Estou no V5 Apollo RMT Games e gostaria de saber mais sobre arbitragem e ativos digitais.'
  },
  finders: {
    label: 'V5 Apollo Finders',
    text: 'Olá! Estou no V5 Apollo Finders e gostaria de suporte sobre radar de notícias e tendências.'
  },
  payment: {
    label: 'V5 Sovereign Payment',
    text: 'Olá! Estou no V5 Sovereign Payment e gostaria de falar sobre o checkout D+0 e blindagem de recebíveis.'
  },
  pixdrop: {
    label: 'PixDrop Store Oficial',
    text: 'Olá! Vim pela PixDrop Store e gostaria de tirar dúvidas sobre produtos, entregas imediatas e cupons.'
  },
  master: {
    label: 'Holding V5 Apollo Master',
    text: 'Olá! Estou no portal da Holding V5 Apollo e gostaria de atendimento sobre o ecossistema.'
  }
};

export function V5FloatingConcierge({ currentSite, currentSiteId }: V5FloatingConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeKey = currentSite || currentSiteId || 'master';
  const siteCtx = siteContextMessages[activeKey] || siteContextMessages.master;

  // WhatsApp link formatado
  const whatsappUrl = `https://wa.me/5568999573066?text=${encodeURIComponent(siteCtx.text)}`;

  // Fecha no Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none print:hidden">
      {/* Drawer Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-slate-950/95 border border-slate-800/90 shadow-2xl backdrop-blur-2xl p-5 text-slate-100 animate-in slide-in-from-bottom-4 duration-200">
          
          {/* Header do Drawer */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  Concierge Soberano V5
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {siteCtx.label} • 24/7 Ativo
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Fechar Concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Context Pill */}
          <div className="my-3.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3" /> SLA Resposta em ~2 min
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Atendimento humano e IA integrado via WhatsApp e Telegram com entrega e suporte prioritário.
            </p>
          </div>

          {/* Action Channels */}
          <div className="space-y-2 text-xs">
            
            {/* 1. WhatsApp Oficial */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/10 hover:from-emerald-600/30 hover:to-teal-600/20 border border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                    WhatsApp Suporte VIP
                  </div>
                  <div className="text-[10px] text-slate-400">
                    +55 (68) 99957-3066
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* 2. Telegram Bot */}
            <a
              href="https://t.me/PixDropOficialBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-cyan-300">
                    Telegram @PixDropOficialBot
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Ofertas, cupons e reposições
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </a>

            {/* 3. Link para /pricing */}
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-amber-300">
                    Ver Tabela de Planos & Preços
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Pix D+0, Cartão 12x e USDT
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </Link>

          </div>

          {/* Footer Info */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Blindagem Anti-SISBAJUD
            </span>
            <span>Holding V5 Apollo</span>
          </div>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Abrir Concierge Soberano"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
        </span>
        <MessageCircle className="w-4 h-4 text-slate-950" />
        <span className="hidden sm:inline tracking-wide font-extrabold">Suporte Soberano 24h</span>
      </button>
    </div>
  );
}

export default V5FloatingConcierge;
