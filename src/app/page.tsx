"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { toast } from "@/lib/toast/useToast";
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
  Bot,
  Gamepad2,
  CreditCard,
  GraduationCap,
  Store,
  Coins,
  Globe,
  CheckCircle2,
  X
} from "lucide-react";

interface IncomingDealPayload {
  source: string;
  title: string;
  priceStr?: string;
  url?: string;
  text?: string;
}

function IncomingDealHandler({ onImport }: { onImport: (deal: IncomingDealPayload) => void }) {
  const searchParams = useSearchParams();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    const source = searchParams.get("source");
    const title = searchParams.get("title");
    const priceStr = searchParams.get("price") || undefined;
    const url = searchParams.get("url") || undefined;
    const text = searchParams.get("text") || undefined;

    if (source && title) {
      const key = `${source}-${title}-${url}`;
      if (handledRef.current !== key) {
        handledRef.current = key;
        onImport({ source, title, priceStr, url, text });
      }
    }
  }, [searchParams, onImport]);

  return null;
}

export default function PosterPage() {
  const { activeTab, setActiveTab, posts, commentRules, deals, addDeal, logs, dispatchQueue } = usePosterStore();
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<{
    source: string;
    title: string;
    priceStr?: string;
    url?: string;
  } | null>(null);

  const handleIncomingImport = useCallback((incoming: IncomingDealPayload) => {
    const origPrice = 199.90;
    let promoPrice = 49.90;
    if (incoming.priceStr) {
      const cleaned = incoming.priceStr.replace(/[^0-9,\.]/g, "").replace(",", ".");
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        promoPrice = parsed;
      }
    }

    const discount = Math.max(10, Math.round(((origPrice - promoPrice) / origPrice) * 100));
    const storeName = incoming.source === "pixdrop" ? "PixDrop Store" : "V5 Finders";

    const exists = deals.some((d) => d.productName === incoming.title);
    if (!exists) {
      addDeal({
        productName: incoming.title,
        store: storeName,
        originalPrice: origPrice,
        promoPrice: promoPrice,
        discountPercentage: discount,
        savingsAmount: Number((origPrice - promoPrice).toFixed(2)),
        affiliateUrl: incoming.url || "http://localhost:3008",
        targetChannels: ["whatsapp", "telegram"],
        scheduledTime: new Date().toISOString(),
        status: "pending"
      });
    }

    setIncomingAlert({
      source: incoming.source,
      title: incoming.title,
      priceStr: incoming.priceStr,
      url: incoming.url
    });

    toast.success(`Oferta recebida de ${storeName}! Injetada nos Grupos VIP.`);
    setActiveTab("offers");
  }, [deals, addDeal, setActiveTab]);

  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const activeRulesCount = commentRules.filter((r) => r.isActive).length;
  const pendingDealsCount = deals.filter((d) => d.status === "pending").length;
  const activeQueueCount = dispatchQueue.filter(
    (i) => i.status === "scheduled" || i.status === "queued" || i.status === "processing"
  ).length;

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Listener de Ofertas Recebidas de Outros Sites */}
      <Suspense fallback={null}>
        <IncomingDealHandler onImport={handleIncomingImport} />
      </Suspense>

      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Apollo5RocketLogo size={34} />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              Capitania #06 · :3011
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
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Grupos VIP (Finders)</span>
              {pendingDealsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "offers" ? "bg-black/20 text-black" : "bg-rose-500/20 text-rose-400"
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

        {/* Banner de Oferta Integrada em Tempo Real */}
        {incomingAlert && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent border-b border-emerald-500/30 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Oferta Integrada com Sucesso ({incomingAlert.source === "pixdrop" ? "PixDrop Store" : "V5 Finders"}):</strong>{" "}
                {incomingAlert.title} {incomingAlert.priceStr ? `— ${incomingAlert.priceStr}` : ""}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full ml-1">
                Injetada na aba Grupos VIP (:3011)
              </span>
            </div>
            <button
              onClick={() => setIncomingAlert(null)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
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
      </main>

      {/* Bottom Drawer Telemetria Executiva */}
      <div className="sticky bottom-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-end">
          <button
            onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border-t border-x border-zinc-800 rounded-t-lg text-[11px] font-mono text-zinc-400 hover:text-amber-400 transition-colors shadow-lg cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Telemetria Executiva</span>
            {showTelemetryDrawer ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
        {showTelemetryDrawer && (
          <div className="bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-xl p-4 transition-all">
            <div className="max-w-7xl mx-auto">
              <ExecutiveTelemetryBanner />
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
