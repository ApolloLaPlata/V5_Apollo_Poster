'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe,
  ShieldCheck,
  Zap,
  Lock,
  Flame,
  Music,
  Video,
  Radio,
  ShoppingCart,
  FileText,
  GraduationCap,
  DollarSign,
  Film,
  Sparkles,
  ExternalLink,
  Layers,
  Building2,
  Server,
  CheckCircle2,
  Cpu,
  Coins,
  QrCode,
  CreditCard
} from 'lucide-react';

export interface V5EcosystemFooterProps {
  currentSite?: string;
  currentSiteId?: string;
  className?: string;
}

export function V5EcosystemFooter({ currentSite, currentSiteId, className = '' }: V5EcosystemFooterProps) {
  const activeSite = currentSite || currentSiteId || 'master';

  const studios = [
    { name: 'Apollo Edit Web', href: 'https://edit.v5apollo.com', tag: 'Criação & Cenas H100', icon: Flame },
    { name: 'V5 Sound & Audio', href: 'https://sound.v5apollo.com', tag: 'Suno v4 & DAW', icon: Music },
    { name: 'Avatar 360 & Swap', href: 'https://avatar.v5apollo.com', tag: 'OpenJutsu Turnaround', icon: Video },
    { name: 'Prisma Vision', href: 'https://prisma.v5apollo.com', tag: 'Multi-Cam & VFX', icon: Sparkles },
    { name: 'Pocket Director', href: 'https://pocket.v5apollo.com', tag: 'Mobile & Roteiros 60s', icon: Film },
    { name: 'Creative Poster', href: 'https://poster.v5apollo.com', tag: 'Thumbnails & Capas 4K', icon: Layers },
    { name: 'Broadcaster Rádio 24/7', href: 'https://broadcaster.v5apollo.com', tag: 'Live Host Sintético', icon: Radio },
  ];

  const business = [
    { name: 'Loja PixDrop Store', href: 'https://pixdrop.com.br', tag: 'E-commerce & Atacado', icon: ShoppingCart },
    { name: 'V5 Apollo Finders', href: 'https://finders.v5apollo.com', tag: 'Radar Notícias & Virais', icon: Globe },
    { name: 'V5 Apollo RMT Games', href: 'https://rmt.v5apollo.com', tag: 'Arbitragem de Games', icon: Coins },
  ];

  const contentEdu = [
    { name: 'Autoblog Notícias', href: 'https://autoblog.v5apollo.com', tag: 'SEO Machine E-E-A-T', icon: FileText },
    { name: 'V5 Academy', href: 'https://academy.v5apollo.com', tag: 'Formação em Agentes IA', icon: GraduationCap },
    { name: 'V5 Tools Hub', href: 'https://tools.v5apollo.com', tag: 'Utilitários & Automação', icon: Cpu },
  ];

  const governance = [
    { name: 'V5 Apollo Finance', href: 'https://finance.v5apollo.com', tag: 'Holding & Tesouraria', icon: Building2 },
    { name: 'V5 Sovereign Payment', href: 'https://payment.v5apollo.com', tag: 'Checkout D+0 & Anti-SISBAJUD', icon: ShieldCheck },
    { name: 'Portal Master V5', href: 'https://v5apollo.com', tag: 'Holding V5 Apollo', icon: Server },
  ];

  return (
    <footer className={`w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 mt-20 relative z-20 ${className}`}>
      {/* Upper Strip: Trust & Sovereign Protocol Badges */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Badge 1: Anti-SISBAJUD */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Blindagem Anti-SISBAJUD
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Saldo fiat em R$ 0,00 com dispersão Web3 D+0 imediata.
                </div>
              </div>
            </div>

            {/* Badge 2: Tri-Pagamento */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Tri-Pagamento Soberano
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Pix D+0 (SPI Banco Central), Cartão em 12x e USDT on-chain.
                </div>
              </div>
            </div>

            {/* Badge 3: Cascata 50/25/25 */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Cascata 50/25/25 SafeCents™
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  50% Reposição APIs • 25% Represa de Giro • 25% Lucro Líquido.
                </div>
              </div>
            </div>

            {/* Badge 4: Vaultix LLC */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Lastro Vaultix LLC (Delaware)
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Infraestrutura internacional de tesouraria e cartões virtuais.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Directory: 17 Capitanias Categorizadas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Coluna 1: Sobre & Identidade */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-mono text-sm font-black text-white tracking-wider">
                HOLDING V5 APOLLO
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conglomerado tecnológico de usinas autônomas de IA, e-commerce determinístico, estúdios generativos e inteligência econômica.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              Autoridade: Comandante Vinicius Miranda De Farias & Maestro Geral.
            </div>
          </div>

          {/* Coluna 2: Estúdios de Criação IA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              Estúdios de Criação IA
            </h4>
            <ul className="space-y-2 text-xs">
              {studios.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col hover:text-emerald-300 transition-colors"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-white flex items-center gap-1">
                        <Icon className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                        {item.tag}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Coluna 3: E-Commerce & Arbitragem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
              Comércio & Arbitragem
            </h4>
            <ul className="space-y-2 text-xs">
              {business.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col hover:text-cyan-300 transition-colors"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-white flex items-center gap-1">
                        <Icon className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                        {item.tag}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 pt-4">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              Conteúdo & Hub
            </h4>
            <ul className="space-y-2 text-xs">
              {contentEdu.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col hover:text-amber-300 transition-colors"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-white flex items-center gap-1">
                        <Icon className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                        {item.tag}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Coluna 4: Governança & Tesouraria */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Governança & Tesouraria
            </h4>
            <ul className="space-y-2 text-xs">
              {governance.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col hover:text-purple-300 transition-colors"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-white flex items-center gap-1">
                        <Icon className="w-3 h-3 text-slate-500 group-hover:text-purple-400" />
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400">
                        {item.tag}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                <span>Ver Planos & Preços</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Coluna 5: Status da Colmeia em Tempo Real */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              Status da Colmeia
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Frota Conectada:</span>
                <span className="font-mono font-bold text-emerald-400">17 / 17 Nós</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Criptografia:</span>
                <span className="font-mono text-cyan-400">TLS 1.3 / SPI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SLA de Entrega:</span>
                <span className="font-mono text-emerald-400">~2,4 segundos</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-500">Protocolo:</span>
                <span className="font-mono text-purple-400">SafeCents™ v5.2</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal Strip */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} Holding V5 Apollo & Subsidiárias. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <a href="https://v5apollo.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">
              Holding Oficial
            </a>
            <span>•</span>
            <Link href="/pricing" className="hover:text-slate-200">
              Tabela de Planos
            </Link>
            <span>•</span>
            <a href="https://pixdrop.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-slate-200">
              PixDrop Store
            </a>
            <span>•</span>
            <span className="text-emerald-400 font-mono">
              Liquidação D+0 Ativa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default V5EcosystemFooter;
