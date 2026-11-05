"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Clock,
  Video,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Check,
  Flame,
  Smartphone,
  Eye,
  Calendar,
  Share2,
  Trash2,
  Play,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Layers,
  Music,
  Radio,
  Cpu,
  Clapperboard,
  Repeat,
  Scale
} from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { SocialPlatform, MediaType, ScheduledPost } from "@/types/poster";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { toast } from "@/lib/toast/useToast";
import { dispatchEventBus } from "@/lib/events/dispatchEvents";
import { VIRAL_HOOK_FORMULAS, humanizeCopyAntiAi, buildSurgicalHashtags } from "@/lib/social/hookFormulas";
import { ViralRadarModal } from "@/components/poster/ViralRadarModal";
import { CarouselSlideDeckModal } from "@/components/poster/CarouselSlideDeckModal";
import { TrendingAudioModal } from "@/components/poster/TrendingAudioModal";
import { InterCapitaniaBroadcastModal } from "@/components/poster/InterCapitaniaBroadcastModal";
import { VideoStoryboardModal } from "@/components/poster/VideoStoryboardModal";
import { OmnichannelRepurposerModal } from "@/components/poster/OmnichannelRepurposerModal";
import { AbHookTestingModal } from "@/components/poster/AbHookTestingModal";

import { TrendingAudioTrack } from "@/lib/social/trendingAudioEngine";

const AVAILABLE_PLATFORMS: Array<{
  id: SocialPlatform;
  name: string;
  category: string;
  iconBg: string;
}> = [
  { id: "instagram", name: "Instagram (Reels/Feed)", category: "Social", iconBg: "from-purple-500 to-pink-500" },
  { id: "tiktok", name: "TikTok (Viral)", category: "Social", iconBg: "from-cyan-400 to-blue-500" },
  { id: "youtube", name: "YouTube Shorts", category: "Social", iconBg: "from-red-600 to-red-500" },
  { id: "whatsapp", name: "WhatsApp VIP (Finders)", category: "Mensageria", iconBg: "from-emerald-500 to-green-600" },
  { id: "newsletter", name: "Beehiiv Newsletter", category: "E-mail", iconBg: "from-amber-400 to-orange-500" },
  { id: "autoblog", name: "V5 AutoBlog (SEO)", category: "Web", iconBg: "from-blue-600 to-indigo-600" },
  { id: "telegram", name: "Telegram Canal VIP", category: "Mensageria", iconBg: "from-sky-500 to-blue-600" }
];

const POPULAR_HASHTAGS = [
  "#InteligenciaArtificial",
  "#Produtividade",
  "#Tech2026",
  "#MarketingDigital",
  "#AfiliadosVIP",
  "#Automação",
  "#ShortsViral",
  "#V5Apollo"
];

const SAMPLE_MEDIA = [
  {
    label: "Reels / Vídeo IA",
    type: "video" as MediaType,
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    previewText: "Demonstração de renderização com Avatar 360°"
  },
  {
    label: "Carrossel de Dicas",
    type: "image" as MediaType,
    url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    previewText: "Infográfico dos 5 Segredos de IA"
  },
  {
    label: "Achadinho Tech",
    type: "image" as MediaType,
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    previewText: "Teclado Mecânico com 45% OFF"
  }
];

export function SocialPublishingStudio() {
  const { posts, addPost, deletePost, updatePost, setActiveTab } = usePosterStore();

  // Estados do Compositor
  const [title, setTitle] = useState("5 Ferramentas de IA que Economizam 10 Horas da Sua Semana");
  const [content, setContent] = useState(
    "Testamos mais de 50 novas ferramentas de inteligência artificial este mês e selecionamos as 5 que realmente entregam resultado prático sem enrolação.\n\n" +
      "1. Automação de postagens onicanal\n" +
      "2. Clonagem de voz ultra-realista\n" +
      "3. Geração de imagens consistentes\n" +
      "4. SEO programático para blogs\n" +
      "5. Roteirização de vídeos curtos\n\n" +
      "Qual dessas você mais precisa hoje? Comenta aqui embaixo! 👇"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    "instagram",
    "tiktok",
    "youtube",
    "whatsapp"
  ]);
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [mediaUrl, setMediaUrl] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
  );
  const [ctaUrl, setCtaUrl] = useState("https://v5apollo.com/hub");
  const [previewChannel, setPreviewChannel] = useState<"instagram" | "tiktok" | "whatsapp" | "beehiiv">("instagram");
  const [isPublishing, setIsPublishing] = useState(false);
  const [bridgeSource, setBridgeSource] = useState<{ source: string; title: string; url?: string } | null>(null);
  const [showViralRadar, setShowViralRadar] = useState(false);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showStoryboardModal, setShowStoryboardModal] = useState(false);
  const [showRepurposerModal, setShowRepurposerModal] = useState(false);
  const [showAbHookModal, setShowAbHookModal] = useState(false);

  const [selectedAudioTrack, setSelectedAudioTrack] = useState<TrendingAudioTrack | null>(null);
  const [showHookSelector, setShowHookSelector] = useState(false);

  const handleApplyHook = (formulaId: string) => {
    const formula = VIRAL_HOOK_FORMULAS.find((f) => f.id === formulaId);
    if (!formula) return;
    const baseTopic = title.replace(/^(Trocaram o seu|Pare de fazer|Se você ainda|5 ferramentas|O playbook|O erro invisível|Por que as maiores|Como saímos|Faça o teste|O método de).+?:/i, "").trim() || "Inteligência Artificial e Automação";
    const newHook = formula.buildHook(baseTopic);
    setTitle(newHook);
    setShowHookSelector(false);
    toast.success(`Gancho Aplicado: ${formula.name}`, newHook);
  };

  const handleHumanizeText = () => {
    const result = humanizeCopyAntiAi(content);
    if (result.replacedCount > 0) {
      setContent(result.cleanedText);
      toast.success(
        "Texto Humanizado (Anti-IA)!",
        `${result.replacedCount} clichês robóticos substituídos: ${result.replacedItems.slice(0, 3).join(", ")}...`
      );
    } else {
      toast.info("Texto Já Natural!", "Nenhum clichê robótico óbvio foi detectado.");
    }
  };

  const handleInjectSurgicalHashtags = () => {
    const { tags } = buildSurgicalHashtags(["InteligenciaArtificial", "Automacao"], "Tech2026");
    const tagString = tags.join(" ");
    setContent((prev) => `${prev.trim()}\n\n${tagString}`);
    toast.success("Hashtags Cirúrgicas Injetadas", `Top 5 tags estratégicas: ${tagString}`);
  };

  // Efeito para carregar parâmetros de URL via Apollo Bridge (ex: vindos de Finders, AutoBlog, Director, Sound ou Avatar)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qSource = params.get("source");
    const qTitle = params.get("title");
    const qContent = params.get("content");
    const qActor = params.get("actor");
    const qUrl = params.get("url");
    const qPrice = params.get("price");
    const qExcerpt = params.get("excerpt");
    const qScript = params.get("script");
    const qGenre = params.get("genre");

    if (qTitle || qContent || qScript || qSource) {
      const decodedTitle = qTitle ? decodeURIComponent(qTitle) : "";
      const decodedUrl = qUrl ? decodeURIComponent(qUrl) : "";
      const decodedExcerpt = qExcerpt ? decodeURIComponent(qExcerpt) : "";
      const decodedScript = qScript ? decodeURIComponent(qScript) : "";
      const decodedPrice = qPrice ? decodeURIComponent(qPrice) : "";
      const decodedContent = qContent ? decodeURIComponent(qContent) : "";
      const decodedActor = qActor ? decodeURIComponent(qActor) : "";

      if (decodedTitle) setTitle(decodedTitle);
      if (decodedUrl) setCtaUrl(decodedUrl);

      if (qSource === "finders") {
        const priceTag = decodedPrice ? `\n\n💰 Preço Especial: R$ ${decodedPrice}` : "";
        const details = decodedExcerpt ? `\n\n📌 Destaques:\n${decodedExcerpt}` : "";
        const scriptBody = decodedScript ? `\n\n🎬 Roteiro Sugerido:\n${decodedScript}` : "";
        setContent(
          `🔥 OPORTUNIDADE ACHADA NO RADAR VIRAL V5!\n\n${decodedTitle}${priceTag}${details}${scriptBody}\n\n👉 Aproveite pelo link oficial abaixo 👇`
        );
        setSelectedPlatforms(["whatsapp", "telegram", "instagram", "tiktok"]);
        setMediaType("image");
      } else if (qSource === "autoblog") {
        const details = decodedExcerpt ? `\n\n${decodedExcerpt}` : "";
        setContent(
          `🚀 NOVO ARTIGO NO AUTOBLOG V5:\n\n${decodedTitle}${details}\n\nLeia a análise completa e os benchmarks detalhados no link abaixo 👇`
        );
        setSelectedPlatforms(["autoblog", "newsletter", "instagram", "telegram"]);
        setMediaType("image");
      } else if (qSource === "director") {
        const scriptBody = decodedScript ? `\n\n📜 Roteiro da Cena:\n${decodedScript}` : "";
        setContent(
          `🎬 CENA PRODUZIDA NO V5 POCKET DIRECTOR:\n\n${decodedTitle}${scriptBody}\n\nAssista à produção completa e making-of!`
        );
        setSelectedPlatforms(["tiktok", "youtube", "instagram"]);
        setMediaType("video");
      } else if (qSource === "sound") {
        const genreTag = qGenre ? ` [Estilo: ${decodeURIComponent(qGenre)}]` : "";
        setContent(
          `🎵 NOVA FAIXA MASTERIZADA NO V5 SOUND STUDIO${genreTag}:\n\n${decodedTitle}\n\nSintetizada com Suno v4 & Neural DAW. Ouça em alta fidelidade no link abaixo 👇`
        );
        setSelectedPlatforms(["tiktok", "instagram", "youtube"]);
        setMediaType("video");
      } else if (decodedContent) {
        const actorPrefix = decodedActor ? `🎙️ [V5 Avatar: ${decodedActor}]\n\n` : "";
        setContent(`${actorPrefix}${decodedContent}`);
      }

      setBridgeSource({
        source: qSource || decodedActor || "Capitania Conectada",
        title: decodedTitle || "Conteúdo Ingerido",
        url: decodedUrl || undefined,
      });

      toast.success(
        "Ponte Apollo Ativa",
        `Conteúdo importado com sucesso via ${(qSource || decodedActor || "Capitania").toUpperCase()}`
      );
    }
  }, []);

  const handleImportFindersDeal = () => {
    setTitle("⚡ ACHADINHO VIP: Teclado Mecânico Wireless RGB Hot-Swap com 45% OFF");
    setContent(
      "🔥 OPORTUNIDADE RELÂMPAGO DO DIA!\n\n" +
        "Teclado mecânico wireless com switch hot-swap, iluminação RGB personalizável e bateria de 4000mAh para até 3 semanas de uso contínuo.\n\n" +
        "❌ De R$ 389,00\n" +
        "✅ Por apenas R$ 213,95 em até 6x sem juros!\n\n" +
        "Use o cupom secreto: VIPAPOLLO\n" +
        "Garantia oficial e frete grátis para todo o Brasil pelo link abaixo 👇"
    );
    setCtaUrl("https://finders.v5apollo.com/deal/teclado-mecanico-rgb-hotswap?ref=v5poster");
    setSelectedPlatforms(["instagram", "whatsapp", "telegram", "newsletter"]);
    setMediaType("image");
    setMediaUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80");
    toast.success("Finders VIP Importado", "Dados da oferta preenchidos no compositor.");
  };

  const handleImportAutoBlogArticle = () => {
    setTitle("🧠 Como o Google Core Update de 2026 Avalia Conteúdo Criado por IA");
    setContent(
      "O algoritmo de ranqueamento passou pela maior reformulação desde o BERT. Descubra os 3 pilares não-negociáveis para manter seus artigos nas primeiras posições:\n\n" +
        "1. Experiência em primeira pessoa (testes práticos comprovados)\n" +
        "2. Dados e benchmarks próprios (evite cópia genérica)\n" +
        "3. Atualização incremental com schema estruturado\n\n" +
        "Confira o artigo completo e o framework de automação no portal."
    );
    setCtaUrl("https://autoblog.v5apollo.com/artigo/google-core-update-2026-ia-eeat?ref=v5poster");
    setSelectedPlatforms(["autoblog", "newsletter", "instagram"]);
    setMediaType("image");
    setMediaUrl("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80");
    toast.success("AutoBlog SEO Importado", "Artigo estruturado carregado no compositor.");
  };

  const handleImportAvatarCatchphrase = () => {
    setTitle("🚀 ROXINGO QUESTS: O segredo é manter o topete alinhado e o código limpo!");
    setContent(
      "Topete no lugar, café na caneca e motor da holding rodando em velocidade de escape! 🚀\n\n" +
        "\"Se não tem automação de verdade rodando no background, você não tem uma empresa, tem um trabalho braçal.\"\n\n" +
        "— Oliver (Roxingo Quests) em transmissão oficial direto da V5 Holding.\n\n" +
        "Confira o jogo completo e os novos episódios no arcade interativo!"
    );
    setCtaUrl("https://roxingo.v5apollo.com/?ref=v5poster");
    setSelectedPlatforms(["tiktok", "youtube", "instagram"]);
    setMediaType("video");
    setMediaUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80");
    toast.success("Avatar Roxingo Importado", "Bordão e persona carregados no compositor.");
  };

  // Toggle de Plataforma
  const togglePlatform = (id: SocialPlatform) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      } else {
        toast.warning("Mínimo de 1 Canal", "Selecione pelo menos um canal de destino.");
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  // Injetar Hashtag no texto
  const handleAddHashtag = (tag: string) => {
    if (!content.includes(tag)) {
      setContent((prev) => `${prev.trim()}\n\n${tag}`);
      toast.info("Hashtag Adicionada", tag);
    }
  };

  // Injetar UTM no Link
  const handleInjectUtm = () => {
    try {
      const cleanUrl = ctaUrl.split("?")[0];
      const withUtm = `${cleanUrl}?utm_source=v5poster&utm_medium=omnichannel&utm_campaign=studio_creator`;
      setCtaUrl(withUtm);
      toast.success("UTM Soberana Injetada", withUtm);
    } catch {
      toast.error("URL Inválida", "Verifique o formato da URL.");
    }
  };

  // Disparo Imediato
  const handlePublishNow = async () => {
    if (!title.trim() || selectedPlatforms.length === 0) {
      toast.error("Campos Incompletos", "Preencha o título e selecione pelo menos um canal.");
      return;
    }

    setIsPublishing(true);
    const newPostId = `post-${Date.now()}`;
    const nowIso = new Date().toISOString();

    try {
      addPost({
        title,
        content,
        platforms: selectedPlatforms,
        scheduledAt: nowIso,
        status: "published",
        publishedAt: nowIso,
        mediaType,
        mediaUrl: mediaUrl || undefined,
        tags: ["Studio", "Instantâneo", ...selectedPlatforms]
      });

      dispatchEventBus.emit("POST_SCHEDULED", {
        postId: newPostId,
        title,
        platforms: selectedPlatforms,
        scheduledAt: nowIso
      });

      toast.success(
        "🚀 Post Publicado com Sucesso!",
        `Despachado instantaneamente para ${selectedPlatforms.length} canais: ${selectedPlatforms.join(", ")}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Falha no Disparo", msg);
    } finally {
      setIsPublishing(false);
    }
  };

  // Agendamento no Horário Nobre (Hoje ou Amanhã às 20h30)
  const handleSchedulePrimeTime = () => {
    if (!title.trim() || selectedPlatforms.length === 0) {
      toast.error("Campos Incompletos", "Preencha o título e selecione ao menos um canal.");
      return;
    }

    const d = new Date();
    // Se já passou das 20h30, agenda para amanhã
    if (d.getHours() >= 20 && d.getMinutes() >= 30) {
      d.setDate(d.getDate() + 1);
    }
    d.setHours(20, 30, 0, 0);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const scheduledIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T20:30:00`;

    addPost({
      title,
      content,
      platforms: selectedPlatforms,
      scheduledAt: scheduledIso,
      status: "scheduled",
      mediaType,
      mediaUrl: mediaUrl || undefined,
      tags: ["HorarioNobre", "PicoEngajamento", ...selectedPlatforms]
    });

    toast.success(
      "⏰ Agendado no Horário Nobre!",
      `Programado para ${d.toLocaleDateString("pt-BR")} às 20:30 com pico estimado de engajamento.`
    );
  };

  // Próximos posts agendados e recentes
  const upcomingPosts = posts
    .slice()
    .sort((a, b) => {
      const timeB = new Date(b.createdAt || b.scheduledAt || 0).getTime();
      const timeA = new Date(a.createdAt || a.scheduledAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ============================================================== */}
      {/* HERO COM BRANDING E PROPOSTA DE VALOR REAL                     */}
      {/* ============================================================== */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black border border-amber-500/20 shadow-2xl overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estúdio de Publicação Omnichannel • Capitania #13</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Escreva uma vez. Despache para todo o ecossistema.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Crie títulos virais, formate legendas adaptadas para cada rede e dispare em lote para Instagram Reels,
              TikTok, Shorts, Beehiiv e Grupos VIP de WhatsApp com 1 clique soberano.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("calendar")}
              className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-mono font-medium flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Calendário 30D</span>
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 transition-all"
            >
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Finders VIP ({posts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* WORKBENCH: COMPOSITOR MESTRE (7 COLS) + LIVE PREVIEW (5 COLS)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: O COMPOSITOR MESTRE (7 Colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            
            {/* Cabeçalho do Compositor */}
            <div className="border-b border-zinc-800/80 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-400" />
                  <span>Compositor & Disparador Soberano</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Prepare o conteúdo e selecione os canais de entrega simultânea.
                </p>
              </div>

              {/* Presets Rápidos de Mídia */}
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
                {SAMPLE_MEDIA.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMediaType(item.type);
                      setMediaUrl(item.url);
                      toast.info("Preset Carregado", item.label);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-mono ${
                      mediaUrl === item.url
                        ? "bg-amber-500 text-black font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerta de Ingestão Ativa via Apollo Bridge */}
            {bridgeSource && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-purple-500/20 border border-amber-500/40 flex items-center justify-between gap-3 text-xs shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300 uppercase tracking-wider text-[11px] bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                        {bridgeSource.source.toUpperCase()}
                      </span>
                      <span className="text-zinc-200 font-semibold truncate max-w-sm sm:max-w-md">
                        {bridgeSource.title}
                      </span>
                    </div>
                    {bridgeSource.url && (
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate max-w-sm">
                        URL de Destino: {bridgeSource.url}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBridgeSource(null);
                    toast.info("Ingestão", "Alerta de ponte limpo.");
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-all cursor-pointer shrink-0"
                >
                  Fechar Alerta
                </button>
              </div>
            )}

            {/* Apollo Bridge: Ingestão Inteligente Inter-Capitanias */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-emerald-500/10 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[11px] font-mono font-bold text-zinc-200">
                    Apollo Bridge: Ingestão 1-Clique
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Importe ganchos do Finders, matérias do AutoBlog ou bordões do Avatar
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleImportFindersDeal}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Oferta Finders</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportAutoBlogArticle}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>AutoBlog SEO</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportAvatarCatchphrase}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Avatar Roxingo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowViralRadar(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>🔥 Radar Viral (Apify)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCarouselModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎠 Roteiro Carrossel (5L)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAudioModal(true)}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    selectedAudioTrack
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                  }`}
                  title="Pareie com trilhas de alta tração algorítmica para Reels e TikTok"
                >
                  <Music className="w-3.5 h-3.5 text-rose-400" />
                  <span>{selectedAudioTrack ? selectedAudioTrack.title.slice(0, 16) + "..." : "🎵 Áudio Viral"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Transmitir para as demais Capitanias da Holding (AutoBlog, Studio, Finders, Sound)"
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>🚀 Transmissão Inter-Capitanias</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStoryboardModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Gerar roteiro de alta retenção em 3 Atos para Reels e TikTok"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-purple-400" />
                  <span>🎬 Roteiro Reels (3 Atos)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRepurposerModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Transformar este conteúdo em 5 formatos otimizados para Instagram, TikTok, LinkedIn, Twitter e WhatsApp"
                >
                  <Repeat className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ Repurposador (1-para-5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAbHookModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Comparar dois ganchos lado a lado com algoritmo de retenção nos primeiros 3 segundos"
                >
                  <Scale className="w-3.5 h-3.5 text-rose-400" />
                  <span>🧪 Teste A/B</span>
                </button>

              </div>
            </div>

            {/* Passo 1: Título / Gancho Viral */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <span>1. Título & Gancho Principal (Headline)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHookSelector(!showHookSelector)}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                  >
                    <span>🎰 10 Ganchos Virais</span>
                  </button>
                  <span className="text-zinc-500 font-normal">{title.length} caracteres</span>
                </div>
              </div>

              {showHookSelector && (
                <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 font-bold border-b border-zinc-800 pb-1.5">
                    <span>Fórmulas Comprovadas de Retenção (Método Marcondes / Top Copy):</span>
                    <button
                      type="button"
                      onClick={() => setShowHookSelector(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
                    {VIRAL_HOOK_FORMULAS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleApplyHook(f.id)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition group"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 group-hover:text-amber-300">
                          <span>{f.emoji}</span>
                          <span>{f.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{f.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 5 Segredos de IA que a Grande Mídia Não Te Conta..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-medium"
              />
            </div>

            {/* Passo 2: Legenda / Roteiro */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="font-bold text-zinc-300">2. Legenda & Copy da Postagem</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleHumanizeText}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                    title="Remove clichês robóticos típicos de IA"
                  >
                    <span>🧹 Humanizar Texto (Anti-IA)</span>
                  </button>
                  <div className="flex items-center gap-3 text-zinc-500">
                    <span>{content.length} caracteres</span>
                    <span>•</span>
                    <span>{content.split(/\s+/).filter(Boolean).length} palavras</span>
                  </div>
                </div>
              </div>

              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sua copy envolvente aqui..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-sans leading-relaxed"
              />

              {/* Barra de Hashtags Rápidas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleInjectSurgicalHashtags}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold transition-all flex items-center gap-1 mr-1"
                  title="Injeta apenas as 5 melhores tags estratégicas"
                >
                  <span>#️⃣ 5 Tags Cirúrgicas</span>
                </button>
                <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mr-1">
                  <Tag className="w-3 h-3" />
                  Hashtags:
                </span>
                {POPULAR_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddHashtag(tag)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Passo 3: Link de Destino + Injeção de UTM */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Link de Conversão (CTA / Afiliado)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://sua-loja.com/produto"
                  className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleInjectUtm}
                  className="px-3 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 text-xs font-mono font-bold whitespace-nowrap transition-all"
                  title="Injeta parâmetros UTM padronizados da Holding V5"
                >
                  Injetar UTM
                </button>
              </div>
            </div>

            {/* Passo 4: Seleção dos Canais de Destino (Multi-Select) */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="font-bold text-zinc-300">
                  4. Canais de Destino ({selectedPlatforms.length} selecionados)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatforms(["instagram", "tiktok", "youtube"])}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 transition"
                  >
                    Apenas Vídeo
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPlatforms(["instagram", "tiktok", "youtube", "whatsapp", "newsletter", "autoblog"])
                    }
                    className="text-[11px] text-amber-400 hover:underline transition"
                  >
                    Todos os Canais
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AVAILABLE_PLATFORMS.map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => togglePlatform(plat.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">{plat.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{plat.category}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-amber-500 border-amber-400 text-black"
                            : "bg-zinc-800 border-zinc-700 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passo 5: Ações de Disparo */}
            <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handlePublishNow}
                disabled={isPublishing}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>{isPublishing ? "Despachando Canais..." : "Publicar Imediatamente"}</span>
              </button>

              <button
                type="button"
                onClick={handleSchedulePrimeTime}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Agenda no pico de engajamento do dia (20h30)"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Agendar Horário Nobre (20h30)</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: SIMULADOR DE DISPOSITIVO & LIVE PREVIEW (5 Colunas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            
            {/* Seletor de Pré-Visualização */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono text-zinc-300">Live Simulator</span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
                {(["instagram", "tiktok", "whatsapp", "beehiiv"] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setPreviewChannel(ch)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize transition-all ${
                      previewChannel === ch
                        ? "bg-amber-500 text-black font-bold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* MOCKUP DO DISPOSITIVO SMARTPHONE */}
            <div className="relative mx-auto w-full max-w-sm rounded-[2.5rem] border-4 border-zinc-800 bg-black p-3 shadow-2xl overflow-hidden">
              {/* Entalhe Superior (Dynamic Island) */}
              <div className="absolute top-4 inset-x-0 mx-auto w-24 h-4 bg-zinc-800 rounded-full z-30" />

              {/* TELA INTERNA DO APP */}
              <div className="rounded-[2rem] bg-zinc-950 overflow-hidden text-white min-h-[460px] flex flex-col justify-between pt-6">
                
                {/* 1. MOCKUP: INSTAGRAM */}
                {previewChannel === "instagram" && (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    {/* Header do Post */}
                    <div className="px-3 pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-[10px] text-amber-400">
                            V5
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight flex items-center gap-1">
                            v5apollo_studios
                            <span className="w-3 h-3 rounded-full bg-blue-500 text-[8px] flex items-center justify-center text-white">✓</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 leading-tight flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>{selectedAudioTrack ? selectedAudioTrack.title : "Áudio Original • V5 Sound"}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-zinc-400 text-xs">•••</span>
                    </div>

                    {/* Mídia do Post */}
                    <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                      {mediaUrl ? (
                        <img
                          src={mediaUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-zinc-600 text-xs font-mono">Sem Mídia Anexada</div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                        {mediaType === "video" ? "REELS" : "1/3"}
                      </div>
                    </div>

                    {/* Barra de Interações */}
                    <div className="px-3 space-y-2">
                      <div className="flex items-center justify-between text-zinc-300 text-sm">
                        <div className="flex items-center gap-3">
                          <span>❤️</span>
                          <span>💬</span>
                          <span>🚀</span>
                        </div>
                        <span>🔖</span>
                      </div>
                      <p className="text-[11px] font-bold text-zinc-200">1.842 curtidas</p>

                      {/* Legenda com corte */}
                      <div className="text-[11px] text-zinc-300 leading-snug line-clamp-3">
                        <span className="font-bold text-white mr-1.5">v5apollo_studios</span>
                        {content}
                      </div>

                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono pt-1">
                        Há 2 minutos • Ver tradução
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. MOCKUP: TIKTOK */}
                {previewChannel === "tiktok" && (
                  <div className="relative flex-1 bg-zinc-900 overflow-hidden flex flex-col justify-end p-4">
                    {mediaUrl && (
                      <img
                        src={mediaUrl}
                        alt="Preview TikTok"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                    {/* Trilho Lateral Flutuante */}
                    <div className="absolute right-3 bottom-14 flex flex-col items-center gap-3 z-20">
                      <div className="w-8 h-8 rounded-full bg-amber-500 border border-white flex items-center justify-center font-bold text-[10px] text-black">
                        V5
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">❤️</span>
                        <span className="text-[9px] font-mono">24.5K</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">💬</span>
                        <span className="text-[9px] font-mono">812</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">⭐</span>
                        <span className="text-[9px] font-mono">3.4K</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">↗️</span>
                        <span className="text-[9px] font-mono">Compartilhar</span>
                      </div>
                    </div>

                    {/* Rodapé TikTok */}
                    <div className="relative z-10 space-y-1 pr-12">
                      <p className="text-xs font-bold text-white">@v5apollo.tech</p>
                      <p className="text-[11px] text-zinc-200 line-clamp-2">{title}</p>
                      <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 pt-1">
                        <span>♫ {selectedAudioTrack ? `${selectedAudioTrack.title} (${selectedAudioTrack.bpm} BPM)` : "Som Original - V5 Sound (Clonagem Qwen)"}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. MOCKUP: WHATSAPP */}
                {previewChannel === "whatsapp" && (
                  <div className="flex-1 bg-[#0b141a] p-3 space-y-3 font-sans">
                    <div className="text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        HOJE
                      </span>
                    </div>

                    <div className="ml-auto max-w-[90%] bg-[#005c4b] rounded-2xl rounded-tr-none p-3 text-white space-y-2 shadow">
                      {mediaUrl && (
                        <div className="rounded-xl overflow-hidden aspect-video bg-black/40">
                          <img src={mediaUrl} alt="WA Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs font-bold">{title}</p>
                      <p className="text-[11px] text-zinc-200 whitespace-pre-line line-clamp-4">{content}</p>

                      <div className="pt-1 border-t border-emerald-600/40 flex items-center justify-between text-[10px] text-emerald-200 font-mono">
                        <span className="truncate">{ctaUrl}</span>
                        <span>20:30 ✓✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. MOCKUP: BEEHIIV NEWSLETTER */}
                {previewChannel === "beehiiv" && (
                  <div className="flex-1 bg-zinc-900 p-4 space-y-3 text-zinc-200">
                    <div className="border-b border-zinc-800 pb-2">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                        V5 Tech Dispatch • Edição Semanal
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">{title}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Por Apollo La Plata • 28 Out 2026</p>
                    </div>

                    <div className="text-[11px] text-zinc-300 leading-relaxed space-y-2 line-clamp-6">
                      <p>{content}</p>
                    </div>

                    <div className="pt-2">
                      <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-[10px]">
                        Ler Artigo Completo →
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status do Ecossistema */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Conectores Nativos:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Zero Extensão • 100% Cloud API
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LINHA DO TEMPO VISUAL (PRÓXIMOS ENVIOS & DESPACHOS RECENTES)   */}
      {/* ============================================================== */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Próximas Entregas & Histórico Recente ({posts.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Gerencie a fila de postagens programadas para os próximos 30 dias.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("calendar")}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>Ver Calendário Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingPosts.map((post) => {
            const isPub = post.status === "published";
            return (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isPub
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isPub ? "Publicado" : "Agendado"}
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{post.title}</h4>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Remover esta postagem?")) {
                        deletePost(post.id);
                        toast.info("Post Removido", post.title);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Excluir Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2">{post.content}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    {post.platforms.map((plat) => (
                      <PlatformBadge key={plat} platform={plat} variant="compact" />
                    ))}
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(post.scheduledAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Modal de Áudios Virais (Reels & TikTok) */}
        <TrendingAudioModal
          isOpen={showAudioModal}
          onClose={() => setShowAudioModal(false)}
          selectedTrackId={selectedAudioTrack?.id}
          onSelectTrack={setSelectedAudioTrack}
        />

        {/* Modal de Transmissão Inter-Capitanias */}
        <InterCapitaniaBroadcastModal
          isOpen={showBroadcastModal}
          onClose={() => setShowBroadcastModal(false)}
          payload={{
            title,
            content,
            ctaUrl,
            mediaUrl,
            mediaType,
            hashtags: POPULAR_HASHTAGS.slice(0, 5),
            audioTrackId: selectedAudioTrack?.id
          }}
        />

        {/* Modal de Roteiro e Storyboard em 3 Atos */}
        <VideoStoryboardModal
          isOpen={showStoryboardModal}
          onClose={() => setShowStoryboardModal(false)}
          topicTitle={title}
          audioTrackId={selectedAudioTrack?.id}
          onApplyToStudio={(scriptText, hookTitle) => {
            setContent(scriptText);
            setTitle(hookTitle);
          }}
        />

        {/* Modal de Repurposing Onicanal (1-para-5) */}
        <OmnichannelRepurposerModal
          isOpen={showRepurposerModal}
          onClose={() => setShowRepurposerModal(false)}
          initialTopic={title}
          initialBody={content}
          onApplyToStudio={(newTitle, newContent, platform) => {
            setTitle(newTitle);
            setContent(newContent);
            setSelectedPlatforms([platform]);
          }}
        />

        {/* Modal de Teste A/B de Ganchos */}
        <AbHookTestingModal
          isOpen={showAbHookModal}
          onClose={() => setShowAbHookModal(false)}
          currentHook={title}
          onSelectWinningHook={(winningHook) => {
            setTitle(winningHook);
          }}
        />

        {/* Modal do Radar de Viralização (Apify) */}
        <ViralRadarModal
          isOpen={showViralRadar}
          onClose={() => setShowViralRadar(false)}
          onApplyHook={(snippet) => {
            setTitle(snippet);
          }}
        />
      </div>
    </div>
  );
}
