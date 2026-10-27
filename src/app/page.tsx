"use client";

import React, { useState } from "react";
import { Apollo5RocketLogo } from "@/components/ui/Apollo5RocketLogo";
import { V5AppActivationBanner } from "@/components/ui/V5AppActivationBanner";
import { MasterCalendar } from "@/components/poster/MasterCalendar";
import { BeehiivNewsletterEditor } from "@/components/poster/BeehiivNewsletterEditor";
import { CommentToDmManager } from "@/components/poster/CommentToDmManager";
import { OfferGroupDispatcher } from "@/components/poster/OfferGroupDispatcher";
import { Calendar, Mail, MessageSquare, Flame } from "lucide-react";

export default function PosterPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "newsletter" | "comment" | "offers">("calendar");

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Apollo5RocketLogo size={36} />

          <nav className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === "calendar"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendário (30D)</span>
            </button>

            <button
              onClick={() => setActiveTab("newsletter")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === "newsletter"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Dual Beehiiv</span>
            </button>

            <button
              onClick={() => setActiveTab("comment")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === "comment"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comment-to-DM</span>
            </button>

            <button
              onClick={() => setActiveTab("offers")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === "offers"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finders VIP</span>
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
      </main>

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
