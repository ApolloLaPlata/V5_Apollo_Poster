'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  ChevronDown, 
  Zap, 
  Flame, 
  Music, 
  Video, 
  Radio, 
  ShoppingCart, 
  FileText, 
  GraduationCap, 
  DollarSign, 
  ShieldCheck,
  Film,
  Sparkles
} from 'lucide-react';
import V5SovereignCheckoutModal, { PlanItem } from '@/components/checkout/V5SovereignCheckoutModal';

interface V5EcosystemHeaderProps {
  currentSite?: string;
  currentSiteId?: string;
  className?: string;
}

const sitePlans: Record<string, PlanItem> = {
  sound: {
    id: 'plan_pro_sound',
    name: 'Pro Agência — V5 Sound & Audio AI',
    priceBrl: 59.90,
    priceUsd: 11.00,
    period: 'mês',
    description: 'Acesso total ao cluster Nvidia H100, Suno v4, DAW multi-pistas e clonagem neural.',
    creditsLabel: '57 cenas Master Pro ou 105 Social Fast',
    featured: true
  },
  avatar: {
    id: 'plan_pro_avatar',
    name: 'Pro Studio — V5 Avatar 360 & Swap',
    priceBrl: 79.90,
    priceUsd: 15.00,
    period: 'mês',
    description: 'Criação de identidades 360°, OpenJutsu Turnaround, consistência multi-expressão e lip-sync neural.',
    creditsLabel: '80 renders de alta resolução ou 200 expressões rápidas',
    featured: true
  },
  broadcaster: {
    id: 'plan_pro_broadcaster',
    name: 'Pro Streamer — V5 Broadcaster 24/7',
    priceBrl: 69.90,
    priceUsd: 13.00,
    period: 'mês',
    description: 'Transmissão contínua 24/7 para YouTube/Twitch, OBS Automation, ducking de áudio e host sintético.',
    creditsLabel: 'Stream contínua ilimitada com 4 canais simultâneos',
    featured: true
  },
  autoblog: {
    id: 'plan_pro_autoblog',
    name: 'Pro Publisher — V5 Autoblog SEO Machine',
    priceBrl: 89.90,
    priceUsd: 17.00,
    period: 'mês',
    description: 'Fábrica autônoma de artigos com E-E-A-T, indexação automática no Google e geração de imagens integradas.',
    creditsLabel: '150 artigos long-form SEO otimizados/mês',
    featured: true
  },
  edit: {
    id: 'plan_pro_edit',
    name: 'Pro Cinema — Apollo Edit Web Studio',
    priceBrl: 99.90,
    priceUsd: 19.00,
    period: 'mês',
    description: 'Renderizador cinematográfico em tempo real, Multi-Pass Flux 2 Dev, Qwen TTS e timeline 4K.',
    creditsLabel: '300 tomadas cinematográficas ultra-sharp/mês',
    featured: true
  },
  master: {
    id: 'plan_holding_pass',
    name: 'Holding All-Access Pass — Ecossistema V5',
    priceBrl: 149.90,
    priceUsd: 28.00,
    period: 'mês',
    description: 'Acesso unificado a todas as 17 usinas da holding: Vídeo, Rádio, Áudio, Avatares, SEO e Arbitragem.',
    creditsLabel: 'Créditos unificados em todos os portais da holding',
    featured: true
  },
  pocket: {
    id: 'plan_pro_pocket',
    name: 'Pocket Studio — Direção & Roteiro Mobile',
    priceBrl: 49.90,
    priceUsd: 9.50,
    period: 'mês',
    description: 'Direção cinematográfica de bolso, geração de roteiros verticais e storyboards para redes sociais.',
    creditsLabel: '120 storyboards e roteiros gerados/mês',
    featured: true
  },
  poster: {
    id: 'plan_pro_poster',
    name: 'Creative Poster — Arte & Capas Virais IA',
    priceBrl: 39.90,
    priceUsd: 7.50,
    period: 'mês',
    description: 'Gerador de pôsteres, thumbnails para YouTube e capas de alta conversão para produtos digitais.',
    creditsLabel: '200 capas em resolução 4K/mês',
    featured: true
  },
  prisma: {
    id: 'plan_pro_prisma',
    name: 'Prisma Vision — Multi-Câmera & VFX',
    priceBrl: 89.90,
    priceUsd: 17.00,
    period: 'mês',
    description: 'Renderização multi-ângulo com câmeras sincronizadas, composição em camadas e efeitos visuais neurais.',
    creditsLabel: '60 composições multi-câmera/mês',
    featured: true
  },
  academy: {
    id: 'plan_academy_pass',
    name: 'Academy Pass — Formação IA & Agentes',
    priceBrl: 49.90,
    priceUsd: 9.50,
    period: 'mês',
    description: 'Acesso a todas as masterclasses, pipelines de automação, prompts proprietários e comunidade fechada.',
    creditsLabel: 'Acesso ilimitado aos cursos e comunidade',
    featured: true
  },
  finance: {
    id: 'plan_finance_pro',
    name: 'Finance Pro — Tesouraria & Arbitragem',
    priceBrl: 99.90,
    priceUsd: 19.00,
    period: 'mês',
    description: 'Painel executivo com telemetria on-chain, split 50/25/25 em tempo real e monitoramento de arbitragem.',
    creditsLabel: 'Acesso ilimitado a telemetria e dispensers JIT',
    featured: true
  },
  tools: {
    id: 'plan_tools_pro',
    name: 'Tools Pro — Ferramentas & APIs da Holding',
    priceBrl: 59.90,
    priceUsd: 11.00,
    period: 'mês',
    description: 'Acesso a utilitários de compressão, geradores de metadados, scrapers e APIs de inteligência.',
    creditsLabel: '5.000 requisições de API/mês',
    featured: true
  }
};

export function V5EcosystemHeader({ currentSite = 'master' }: V5EcosystemHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const defaultUpgradePlan = sitePlans[currentSite] || sitePlans.master;

  const ecosystemLinks = [
    { name: 'Portal Master', href: 'https://v5apollo.com', icon: Globe, tag: 'Holding', active: currentSite === 'master' },
    { name: 'Loja PixDrop', href: 'https://pixdrop.com.br', icon: ShoppingCart, tag: 'E-commerce' },
    { name: 'Sound Studio', href: 'https://sound.v5apollo.com', icon: Music, tag: 'Áudio & Suno', active: currentSite === 'sound' },
    { name: 'Avatar 360 & Swap', href: 'https://avatar.v5apollo.com', icon: Video, tag: 'OpenJutsu', active: currentSite === 'avatar' },
    { name: 'Rádio 24h Broadcaster', href: 'https://broadcaster.v5apollo.com', icon: Radio, tag: 'Live Host', active: currentSite === 'broadcaster' },
    { name: 'Apollo Edit Web', href: 'https://edit.v5apollo.com', icon: Flame, tag: 'Edição IA', active: currentSite === 'edit' },
    { name: 'Autoblog Notícias', href: 'https://autoblog.v5apollo.com', icon: FileText, tag: 'SEO Machine', active: currentSite === 'autoblog' },
    { name: 'Pocket Director', href: 'https://pocket.v5apollo.com', icon: Film, tag: 'Mobile', active: currentSite === 'pocket' },
    { name: 'Prisma Vision', href: 'https://prisma.v5apollo.com', icon: Sparkles, tag: 'Multi-Cam', active: currentSite === 'prisma' },
    { name: 'V5 Academy', href: 'https://academy.v5apollo.com', icon: GraduationCap, tag: 'Educação', active: currentSite === 'academy' },
    { name: 'V5 Finance', href: 'https://finance.v5apollo.com', icon: DollarSign, tag: 'Tesouraria', active: currentSite === 'finance' },
  ];

  return (
    <>
      <header className="w-full bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md px-4 py-2 z-40 relative flex items-center justify-between text-xs">
        {/* Esquerda: Identidade da Holding & Seletor */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-tight text-white flex items-center gap-1.5 font-mono text-[11px]">
              HOLDING V5 APOLLO
            </span>
          </div>

          <div className="h-3 w-px bg-zinc-800 hidden sm:block"></div>

          {/* Dropdown do Ecossistema */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors font-medium text-[11px]"
            >
              <Globe className="h-3 w-3 text-cyan-400" />
              <span>Navegar Ecossistema</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-1.5 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Portais & Usinas Ativas
                </div>
                {ecosystemLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target={item.active ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors ${
                        item.active 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <Icon className="h-3.5 w-3.5 text-zinc-400" />
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {item.tag}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Direita: Status da Frota & Ação de Upgrade / Checkout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800/60">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>17/17 Nós 200 OK</span>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
          >
            <Zap className="h-3 w-3 fill-current text-amber-300" />
            <span>⚡ Obter Créditos & Planos</span>
          </button>
        </div>
      </header>

      {/* Modal de Checkout Universal */}
      <V5SovereignCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={defaultUpgradePlan}
      />
    </>
  );
}

export default V5EcosystemHeader;
