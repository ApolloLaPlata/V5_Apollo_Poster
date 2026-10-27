"use client";

import React from "react";
import { Apollo5RocketLogo } from "@/components/ui/Apollo5RocketLogo";
import { V5AppActivationBanner } from "@/components/ui/V5AppActivationBanner";
import { MasterCalendar } from "@/components/poster/MasterCalendar";
import { BeehiivNewsletterEditor } from "@/components/poster/BeehiivNewsletterEditor";
import { CommentToDmManager } from "@/components/poster/CommentToDmManager";
import { OfferGroupDispatcher } from "@/components/poster/OfferGroupDispatcher";
import { DispatchLogsViewer } from "@/components/poster/DispatchLogsViewer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { usePosterStore, PosterTab } from "@/store/usePosterStore";
import { Calendar, Mail, MessageSquare, Flame, History } from "lucide-react";

export default function PosterPage() {
  const { activeTab, setActiveTab, posts, commentRules, deals, logs } = usePosterStore();

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const activeRulesCount = commentRules.filter((r) => r.isActive).length;
  const pendingDealsCount = deals.filter((d) => d.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <Apollo5RocketLogo size={36} />

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                activeTab === "calendar"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendário (30D)</span>
              {scheduledCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === "calendar" ? "bg-black/20 text-black" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {scheduledCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("newsletter")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                activeTab === "newsletter"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Dual Beehiiv</span>
            </button>

            <button
              onClick={() => setActiveTab("comment")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                activeTab === "comment"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comment-to-DM</span>
              {activeRulesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === "comment" ? "bg-black/20 text-black" : "bg-blue-500/20 text-blue-400"
                }`}>
                  {activeRulesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("offers")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                activeTab === "offers"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Finders VIP</span>
              {pendingDealsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === "offers" ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {pendingDealsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                activeTab === "logs"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Logs & Telemetria</span>
              {logs.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === "logs" ? "bg-black/20 text-black" : "bg-zinc-700 text-zinc-300"
                }`}>
                  {logs.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <V5AppActivationBanner />

        {activeTab === "calendar" && <MasterCalendar />}
        {activeTab === "newsletter" && <BeehiivNewsletterEditor />}
        {activeTab === "comment" && <CommentToDmManager />}
        {activeTab === "offers" && <OfferGroupDispatcher />}
        {activeTab === "logs" && <DispatchLogsViewer />}
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
