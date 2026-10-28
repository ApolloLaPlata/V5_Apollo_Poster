"use client";

import React, { useState } from "react";
import { Apollo5RocketLogo } from "@/components/ui/Apollo5RocketLogo";
import { SocialPublishingStudio } from "@/components/poster/SocialPublishingStudio";
import { MasterCalendar } from "@/components/poster/MasterCalendar";
import { BeehiivNewsletterEditor } from "@/components/poster/BeehiivNewsletterEditor";
import { CommentToDmManager } from "@/components/poster/CommentToDmManager";
import { OfferGroupDispatcher } from "@/components/poster/OfferGroupDispatcher";
import { BackgroundQueueDashboard } from "@/components/poster/BackgroundQueueDashboard";
import { DispatchLogsViewer } from "@/components/poster/DispatchLogsViewer";
import { ExecutiveTelemetryBanner } from "@/components/poster/ExecutiveTelemetryBanner";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { usePosterStore } from "@/store/usePosterStore";
import {
  Sparkles,
  Calendar,
  Mail,
  MessageSquare,
  Flame,
  History,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  ExternalLink,
  Radio,
  Music,
  ShoppingBag,
  DollarSign,
  Clapperboard,
  Bot
} from "lucide-react";

const APOLLO_BRIDGE_LINKS = [
  { name: "Finders", port: ":3001", url: "http://localhost:3001", icon: ShoppingBag, color: "text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20" },
  { name: "AutoBlog", port: ":3002", url: "http://localhost:3002", icon: Sparkles, color: "text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20" },
  { name: "Pocket Director", port: ":3007", url: "http://localhost:3007", icon: Clapperboard, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { name: "Sound", port: ":3005", url: "http://localhost:3005", icon: Music, color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" },
  { name: "Avatar", port: ":3010", url: "http://localhost:3010", icon: Bot, color: "text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20" },
  { name: "Broadcaster", port: ":3008", url: "http://localhost:3008", icon: Radio, color: "text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20" },
  { name: "Finance", port: ":3009", url: "http://localhost:3009", icon: DollarSign, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { name: "Tools", port: ":3014", url: "http://localhost:3014", icon: Layers, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20" },
];

export default function PosterPage() {
  const { activeTab, setActiveTab, posts, commentRules, deals, logs, dispatchQueue } = usePosterStore();
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const activeRulesCount = commentRules.filter((r) => r.isActive).length;
  const pendingDealsCount = deals.filter((d) => d.status === "pending").length;
  const activeQueueCount = dispatchQueue.filter(
    (i) => i.status === "scheduled" || i.status === "queued" || i.status === "processing"
  ).length;

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        {/* Apollo Bridge Inter-Capitanias Bar */}
        <div className="border-b border-zinc-900 bg-zinc-950/60 px-4 sm:px-6 py-1.5 flex items-center justify-between text-[11px] overflow-x-auto gap-3">
          <div className="flex items-center gap-2 font-mono text-zinc-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-zinc-300">Apollo Bridge (Holding V5):</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {APOLLO_BRIDGE_LINKS.map((b) => {
              const Icon = b.icon;
              return (
                <a
                  key={b.name}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-mono font-semibold transition-all ${b.color}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{b.name}</span>
                  <span className="opacity-70">{b.port}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Apollo5RocketLogo size={34} />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              Capitania #13 · :3011
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("studio")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "studio"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estúdio</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendário 30D</span>
              {scheduledCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "calendar" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {scheduledCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("newsletter")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "newsletter"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Beehiiv</span>
            </button>

            <button
              onClick={() => setActiveTab("comment")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "comment"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chatbot DM</span>
              {activeRulesCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "comment" ? "bg-black/20 text-black" : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {activeRulesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("offers")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "offers"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>VIP Deals</span>
              {pendingDealsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "offers" ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {pendingDealsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "queue"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Fila</span>
              {activeQueueCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "queue" ? "bg-black/20 text-black" : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {activeQueueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/15"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Logs</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {activeTab === "studio" && <SocialPublishingStudio />}
        {activeTab === "calendar" && <MasterCalendar />}
        {activeTab === "newsletter" && <BeehiivNewsletterEditor />}
        {activeTab === "comment" && <CommentToDmManager />}
        {activeTab === "offers" && <OfferGroupDispatcher />}
        {activeTab === "queue" && <BackgroundQueueDashboard />}
        {activeTab === "logs" && <DispatchLogsViewer />}

        {/* Gaveta Recolhível de Telemetria e Diagnósticos Executivos */}
        <div className="pt-8 border-t border-zinc-800/80">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-zinc-500" />
              <div>
                <h3 className="text-xs font-mono font-bold text-zinc-300">
                  Telemetria Executiva & Status da Infraestrutura
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Taxas de conversão, latências de APIs, integridade de tokens e métricas onicanal.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTelemetryDrawer((prev) => !prev)}
              className="text-xs px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{showTelemetryDrawer ? "Ocultar Telemetria" : "Ver Telemetria Executiva"}</span>
              {showTelemetryDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showTelemetryDrawer && (
            <div className="mt-4 animate-fadeIn">
              <ExecutiveTelemetryBanner />
            </div>
          )}
        </div>
      </main>

      <ToastContainer />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 V5 Apollo Holding • Capitania #13 • V5 Apollo Poster (Porta :3011)</p>
          <p className="font-mono text-[11px] text-zinc-600">Zero Extension Dependency • 100% Native Cloud APIs</p>
        </div>
      </footer>
    </div>
  );
}
