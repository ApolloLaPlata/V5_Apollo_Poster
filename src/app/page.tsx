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

const APOLLO_BRIDGE_LINKS = [
  { name: "Hub V5", port: ":3000", url: "http://localhost:3000", icon: Globe, color: "text-zinc-300 border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800" },
  { name: "PixDrop Store", port: ":3000", url: "http://localhost:3000", icon: Store, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { name: "Finders", port: ":3001", url: "http://localhost:3001", icon: ShoppingBag, color: "text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20" },
  { name: "AutoBlog", port: ":3002", url: "http://localhost:3002", icon: Sparkles, color: "text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20" },
  { name: "Payment", port: ":3006", url: "http://localhost:3006", icon: CreditCard, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { name: "Pocket Director", port: ":3007", url: "http://localhost:3007", icon: Clapperboard, color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" },
  { name: "Sound", port: ":3005", url: "http://localhost:3005", icon: Music, color: "text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20" },
  { name: "Avatar", port: ":3010", url: "http://localhost:3010", icon: Bot, color: "text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20" },
  { name: "Finance", port: ":3009", url: "http://localhost:3009", icon: DollarSign, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { name: "Prisma", port: ":3013", url: "http://localhost:3013", icon: Sparkles, color: "text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20" },
  { name: "Broadcaster", port: ":3014", url: "http://localhost:3014", icon: Radio, color: "text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20" },
  { name: "RMT", port: ":3015", url: "http://localhost:3015", icon: Coins, color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" },
  { name: "Academy", port: ":3016", url: "http://localhost:3016", icon: GraduationCap, color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20" },
  { name: "Games 9:16", port: ":3012", url: "http://localhost:3012", icon: Gamepad2, color: "text-pink-400 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20" },
];

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
        affiliateUrl: incoming.url || "http://localhost:3000",
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
