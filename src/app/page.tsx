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
import { usePosterStore, PosterTab } from "@/store/usePosterStore";
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
  Cpu
} from "lucide-react";

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
