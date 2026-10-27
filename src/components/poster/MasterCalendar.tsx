"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Video, 
  Image as ImageIcon, 
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe,
  Mail,
  Send,
  MessageSquare,
  Grid3X3,
  Columns3,
  List,
  Trash2,
  ExternalLink,
  Copy,
  CalendarClock,
  Play,
  Check,
  X
} from "lucide-react";
import { usePosterStore } from "@/store/usePosterStore";
import { toast } from "@/lib/toast/useToast";
import { ScheduledPost, SocialPlatform, PostStatus } from "@/types/poster";
import { dispatchEventBus } from "@/lib/events/dispatchEvents";
import { formatRelativeDate, formatLocalDateTimeInput } from "@/lib/utils/formatters";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { NewPostScheduleModal } from "@/components/poster/NewPostScheduleModal";

export function isPrimeTimeSlot(isoDate: string): boolean {
  try {
    const d = new Date(isoDate);
    const timeVal = d.getHours() * 60 + d.getMinutes();
    return (
      (timeVal >= 660 && timeVal <= 780) || // 11:00 - 13:00
      (timeVal >= 1050 && timeVal <= 1170) || // 17:30 - 19:30
      (timeVal >= 1230 && timeVal <= 1350) // 20:30 - 22:30
    );
  } catch {
    return false;
  }
}

export function MasterCalendar() {
  const { posts, addPost, updatePost, deletePost, reschedulePost } = usePosterStore();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 27)); // 27 de Outubro de 2026
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<PostStatus | "all">("all");
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inlineReschedulePostId, setInlineReschedulePostId] = useState<string | null>(null);
  const [inlineDateValue, setInlineDateValue] = useState<string>("");
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("instagram");
  const [newDate, setNewDate] = useState("2026-10-30T15:00");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const PLATFORMS_FILTER: Array<{ id: SocialPlatform | "all"; label: string; activeStyle: string }> = [
    { id: "all", label: "Todos os Canais", activeStyle: "bg-amber-500 text-black font-bold shadow-sm" },
    { id: "instagram", label: "Instagram", activeStyle: "bg-pink-500 text-white font-bold shadow-sm" },
    { id: "tiktok", label: "TikTok", activeStyle: "bg-cyan-500 text-black font-bold shadow-sm" },
    { id: "youtube", label: "YouTube Shorts", activeStyle: "bg-red-500 text-white font-bold shadow-sm" },
    { id: "kwai", label: "Kwai", activeStyle: "bg-orange-500 text-black font-bold shadow-sm" },
    { id: "autoblog", label: "AutoBlog REST", activeStyle: "bg-amber-500 text-black font-bold shadow-sm" },
    { id: "wordpress", label: "WordPress", activeStyle: "bg-blue-500 text-white font-bold shadow-sm" },
    { id: "newsletter", label: "Newsletter E-mail", activeStyle: "bg-purple-500 text-white font-bold shadow-sm" },
    { id: "whatsapp", label: "WhatsApp VIP", activeStyle: "bg-emerald-500 text-black font-bold shadow-sm" },
    { id: "telegram", label: "Telegram VIP", activeStyle: "bg-sky-500 text-white font-bold shadow-sm" }
  ];

  const STATUS_FILTERS: Array<{ id: PostStatus | "all"; label: string; activeStyle: string }> = [
    { id: "all", label: "Todos Status", activeStyle: "bg-zinc-200 text-black font-bold shadow-sm" },
    { id: "scheduled", label: "Agendados", activeStyle: "bg-amber-500 text-black font-bold shadow-sm" },
    { id: "published", label: "Publicados", activeStyle: "bg-emerald-500 text-black font-bold shadow-sm" },
    { id: "draft", label: "Rascunhos", activeStyle: "bg-zinc-600 text-white font-bold shadow-sm" },
    { id: "failed", label: "Falhas", activeStyle: "bg-rose-500 text-white font-bold shadow-sm" }
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayFilter(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayFilter(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 27));
    setSelectedDayFilter(27);
  };

  // Filtragem
  const filteredPosts = posts.filter((post) => {
    const postDate = new Date(post.scheduledAt);
    const matchesMonth = postDate.getFullYear() === year && postDate.getMonth() === month;
    if (!matchesMonth && viewMode !== "list") return false;

    if (selectedFilter !== "all" && !post.platforms.includes(selectedFilter as SocialPlatform)) {
      return false;
    }

    if (selectedStatusFilter !== "all" && post.status !== selectedStatusFilter) {
      return false;
    }

    if (selectedDayFilter !== null && postDate.getDate() !== selectedDayFilter && viewMode === "month") {
      return false;
    }

    return true;
  });

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addPost({
      title: newTitle,
      content: newContent,
      platforms: [newPlatform],
      scheduledAt: newDate,
      status: "scheduled",
      mediaType: "image",
      tags: ["Agendado"]
    });

    dispatchEventBus.emit("POST_SCHEDULED", {
      postId: `post-${Date.now()}`,
      title: newTitle,
      platforms: [newPlatform],
      scheduledAt: newDate
    });

    setNewTitle("");
    setNewContent("");
    setIsModalOpen(false);
  };

  const handleDuplicatePost = (post: ScheduledPost) => {
    const d = new Date(post.scheduledAt);
    d.setDate(d.getDate() + 1);
    const newScheduledAt = formatLocalDateTimeInput(d);

    addPost({
      title: `[Cópia] ${post.title}`,
      content: post.content,
      platforms: post.platforms,
      scheduledAt: newScheduledAt,
      status: "scheduled",
      mediaType: post.mediaType,
      mediaUrl: post.mediaUrl,
      tags: post.tags
    });

    toast.success("Post Duplicado", `Cópia criada para ${formatRelativeDate(newScheduledAt)}`, post.platforms[0]);
  };

  const handleRescheduleTomorrow = (post: ScheduledPost) => {
    const d = new Date(post.scheduledAt);
    d.setDate(d.getDate() + 1);
    const newScheduledAt = formatLocalDateTimeInput(d);

    reschedulePost(post.id, newScheduledAt);
    toast.info("Reagendado para Amanhã", `Disparo adiado para ${formatRelativeDate(newScheduledAt)}`, post.platforms[0]);
  };

  const handleForcePublishNow = (post: ScheduledPost) => {
    updatePost(post.id, { status: "published", publishedAt: new Date().toISOString() });
    dispatchEventBus.emit("POST_DISPATCHED", {
      postId: post.id,
      title: post.title,
      platforms: post.platforms,
      status: "success"
    });
  };

  const handleStartInlineReschedule = (post: ScheduledPost) => {
    setInlineReschedulePostId(post.id);
    const d = new Date(post.scheduledAt);
    const formatted = formatLocalDateTimeInput(d);
    setInlineDateValue(formatted);
  };

  const handleSaveInlineReschedule = (post: ScheduledPost) => {
    if (!inlineDateValue) return;
    reschedulePost(post.id, inlineDateValue);
    toast.success(
      "Horário Atualizado!",
      `Reagendado para ${formatRelativeDate(inlineDateValue)} (${new Date(inlineDateValue).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`,
      post.platforms[0]
    );
    dispatchEventBus.emit("POST_SCHEDULED", {
      postId: post.id,
      title: post.title,
      platforms: post.platforms,
      scheduledAt: inlineDateValue
    });
    setInlineReschedulePostId(null);
  };

  const handleAddHoursInline = (hours: number) => {
    const current = inlineDateValue ? new Date(inlineDateValue) : new Date();
    current.setHours(current.getHours() + hours);
    setInlineDateValue(formatLocalDateTimeInput(current));
  };

  const handleSetPrimeTimeInline = (hour: number, minute: number = 0) => {
    const current = inlineDateValue ? new Date(inlineDateValue) : new Date();
    current.setHours(hour, minute, 0, 0);
    setInlineDateValue(formatLocalDateTimeInput(current));
  };

  const renderInlineRescheduleBox = (post: ScheduledPost) => {
    if (inlineReschedulePostId !== post.id) return null;

    return (
      <div className="mt-3 p-3 bg-zinc-950/95 rounded-xl border border-amber-500/40 shadow-xl space-y-2.5 text-xs text-zinc-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 font-mono">
            <CalendarClock className="w-3.5 h-3.5" /> Reagendamento Rápido
          </span>
          <button
            type="button"
            onClick={() => setInlineReschedulePostId(null)}
            className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition"
            title="Cancelar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <input
            type="datetime-local"
            value={inlineDateValue}
            onChange={(e) => setInlineDateValue(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAddHoursInline(1)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition"
            >
              +1h
            </button>
            <button
              type="button"
              onClick={() => handleAddHoursInline(3)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition"
            >
              +3h
            </button>
            <button
              type="button"
              onClick={() => handleAddHoursInline(24)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition"
            >
              +24h
            </button>
            <button
              type="button"
              onClick={() => handleSetPrimeTimeInline(18, 0)}
              className="px-2 py-0.5 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-[10px] font-mono transition"
              title="Slot Nobre 18h00"
            >
              🌇 18h
            </button>
            <button
              type="button"
              onClick={() => handleSetPrimeTimeInline(21, 0)}
              className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-mono transition"
              title="Slot Nobre 21h00"
            >
              🌙 21h
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setInlineReschedulePostId(null)}
            className="px-2.5 py-1 rounded-lg text-xs text-zinc-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSaveInlineReschedule(post)}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shadow-md transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar Horário</span>
          </button>
        </div>
      </div>
    );
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "instagram":
      case "tiktok":
        return <Video className="w-3 h-3 text-pink-400" />;
      case "autoblog":
      case "wordpress":
        return <Globe className="w-3 h-3 text-amber-400" />;
      case "newsletter":
        return <Mail className="w-3 h-3 text-purple-400" />;
      case "whatsapp":
      case "telegram":
        return <Send className="w-3 h-3 text-emerald-400" />;
      default:
        return <FileText className="w-3 h-3 text-zinc-400" />;
    }
  };

  // Cálculo da semana atual (7 dias baseados em currentDate)
  const getWeekDates = () => {
    const base = new Date(currentDate);
    const day = base.getDay();
    const diff = base.getDate() - day;
    const startOfWeek = new Date(base.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const currentWeekDates = getWeekDates();

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {monthNames[month]} {year}
              </h2>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full border border-zinc-700 font-mono">
                {posts.length} posts
              </span>
            </div>
            <p className="text-xs text-zinc-400">Central Onicanal de Agendamento • Visualizador Multi-Modo</p>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-1 ml-2 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-700/60 transition"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition"
              title="Mês Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher + Filters + New Post */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60 text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "month" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Mês</span>
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "week" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                viewMode === "list" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Fila</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Post</span>
          </button>
        </div>
      </div>

      {/* Filters Container: Channels + Operational Status */}
      <div className="space-y-2">
        {/* Interactive Omnichannel Platform Filter Bar */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-2.5 flex items-center gap-1.5 overflow-x-auto text-xs shadow-sm">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-2 pr-1 shrink-0 font-mono">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Canal:</span>
          </span>
          {PLATFORMS_FILTER.map((p) => {
            const count = p.id === "all" 
              ? posts.length 
              : posts.filter((item) => item.platforms.includes(p.id as SocialPlatform)).length;

            const isSelected = selectedFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedFilter(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition text-xs shrink-0 font-medium ${
                  isSelected
                    ? p.activeStyle
                    : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50"
                }`}
              >
                {p.id !== "all" && getPlatformIcon(p.id as SocialPlatform)}
                <span>{p.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? "bg-black/25 text-inherit" : "bg-zinc-700 text-zinc-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Operational Status Filter Bar */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 pl-2 pr-1 shrink-0 font-mono">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Status:</span>
          </span>
          {STATUS_FILTERS.map((s) => {
            const count = s.id === "all" 
              ? posts.length 
              : posts.filter((item) => item.status === s.id).length;

            const isSelected = selectedStatusFilter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStatusFilter(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition text-[11px] shrink-0 font-medium ${
                  isSelected
                    ? s.activeStyle
                    : "bg-zinc-800/40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <span>{s.label}</span>
                <span className={`px-1.5 py-0.1 rounded text-[9px] font-mono ${
                  isSelected ? "bg-black/25 text-inherit" : "bg-zinc-800 text-zinc-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prime Time Heatmap Bar (Horários Nobres de Audiência) */}
      <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/20 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-zinc-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Horários Nobres de Audiência:</span>
          <span className="text-zinc-400 text-[11px] hidden md:inline">Slots com maior retenção e engajamento:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setNewDate(`2026-10-${currentDate.getDate().toString().padStart(2, "0")}T11:30`);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-[11px] font-mono"
            title="Pico de Pausa no Almoço (11h30)"
          >
            <span>☀️ 11:30 (Almoço)</span>
            <span className="text-[9px] bg-amber-500/20 px-1 rounded text-amber-200">+38% Eng.</span>
          </button>

          <button
            onClick={() => {
              setNewDate(`2026-10-${currentDate.getDate().toString().padStart(2, "0")}T18:00`);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition text-[11px] font-mono"
            title="Pico de Volta para Casa / Fim de Expediente (18h00)"
          >
            <span>🌇 18:00 (Fim Expediente)</span>
            <span className="text-[9px] bg-orange-500/20 px-1 rounded text-orange-200">+45% Eng.</span>
          </button>

          <button
            onClick={() => {
              setNewDate(`2026-10-${currentDate.getDate().toString().padStart(2, "0")}T21:00`);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition text-[11px] font-mono"
            title="Pico Noturno de Entretenimento e DMs (21h00)"
          >
            <span>🌙 21:00 (Pico Noturno)</span>
            <span className="text-[9px] bg-purple-500/20 px-1 rounded text-purple-200">+52% Eng.</span>
          </button>
        </div>
      </div>

      {/* 1. MODO VISUALIZAÇÃO: GRADE MENSAL (30 DIAS) */}
      {viewMode === "month" && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-zinc-400 uppercase font-mono border-b border-zinc-800 pb-2">
            {weekDays.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? "text-zinc-500" : "text-zinc-400"}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[76px] bg-zinc-950/20 border border-transparent rounded-xl" />
            ))}

            {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((day) => {
              const dayPosts = posts.filter((p) => {
                const d = new Date(p.scheduledAt);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
              });

              const isToday = year === 2026 && month === 9 && day === 27;
              const isSelected = selectedDayFilter === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDayFilter(isSelected ? null : day)}
                  className={`p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between min-h-[76px] ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50"
                      : isToday
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : dayPosts.length > 0
                      ? "bg-zinc-800/60 border-zinc-700/80 hover:border-zinc-500 text-white"
                      : "bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-800/30 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-bold ${isToday ? "text-amber-400" : ""}`}>{day}</span>
                    {isToday && (
                      <span className="bg-amber-500 text-black font-extrabold text-[9px] px-1 py-0.2 rounded font-sans">
                        HOJE
                      </span>
                    )}
                    {dayPosts.length > 0 && !isToday && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayPosts.slice(0, 2).map((dp) => (
                      <div
                        key={dp.id}
                        className="flex items-center gap-1 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] truncate"
                      >
                        {getPlatformIcon(dp.platforms[0])}
                        <span className="truncate text-zinc-300">{dp.title}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] text-zinc-500 font-mono block text-center">
                        +{dayPosts.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDayFilter !== null && (
            <div className="pt-2 flex items-center justify-between text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              <span>Filtrando especificamente para o <strong>Dia {selectedDayFilter} de {monthNames[month]}</strong>.</span>
              <button 
                onClick={() => setSelectedDayFilter(null)}
                className="text-amber-300 hover:text-white underline text-xs font-semibold"
              >
                Ver todos os dias do mês
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. MODO VISUALIZAÇÃO: LINHA DO TEMPO SEMANAL (7 DIAS) */}
      {viewMode === "week" && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {currentWeekDates.map((dateObj) => {
              const dayNum = dateObj.getDate();
              const isToday = dateObj.getDate() === 27 && dateObj.getMonth() === 9 && dateObj.getFullYear() === 2026;
              const weekDayName = weekDays[dateObj.getDay()];

              const dayPosts = posts.filter((p) => {
                const pd = new Date(p.scheduledAt);
                return (
                  pd.getDate() === dateObj.getDate() &&
                  pd.getMonth() === dateObj.getMonth() &&
                  pd.getFullYear() === dateObj.getFullYear()
                );
              });

              return (
                <div
                  key={dayNum}
                  className={`rounded-xl border p-3 flex flex-col justify-between min-h-[220px] ${
                    isToday
                      ? "bg-zinc-900 border-amber-500/50 shadow-md shadow-amber-500/5"
                      : "bg-zinc-900/60 border-zinc-800"
                  }`}
                >
                  <div className="border-b border-zinc-800/80 pb-2 mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">{weekDayName}</span>
                      <span className={`text-base font-bold font-mono ${isToday ? "text-amber-400" : "text-white"}`}>
                        {dayNum} {monthNames[dateObj.getMonth()].substring(0, 3)}
                      </span>
                    </div>
                    {isToday && (
                      <span className="bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        HOJE
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {dayPosts.length === 0 ? (
                      <p className="text-[11px] text-zinc-600 italic py-4 text-center">Nenhum post</p>
                    ) : (
                      dayPosts.map((dp) => (
                        <div
                          key={dp.id}
                          className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1">
                              {getPlatformIcon(dp.platforms[0])}
                              <span>{dp.platforms[0]}</span>
                            </span>
                            <button
                              onClick={() => {
                                if (inlineReschedulePostId === dp.id) {
                                  setInlineReschedulePostId(null);
                                } else {
                                  handleStartInlineReschedule(dp);
                                }
                              }}
                              className={`px-1 py-0.5 rounded transition font-mono ${
                                inlineReschedulePostId === dp.id
                                  ? "bg-amber-500 text-black font-bold text-[9px]"
                                  : "text-amber-400 hover:underline"
                              }`}
                              title="Reagendar horário deste post"
                            >
                              {new Date(dp.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </button>
                          </div>
                          <p className="text-zinc-200 font-semibold line-clamp-2 leading-tight">{dp.title}</p>
                          {renderInlineRescheduleBox(dp)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MODO VISUALIZAÇÃO: LISTA COMPACTA DE FILA */}
      {viewMode === "list" && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>FILA CRONOLÓGICA DE DESPACHO ({filteredPosts.length} posts listados)</span>
            <span>Ordenado por data de disparo</span>
          </div>

          <div className="divide-y divide-zinc-800/60">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 hover:bg-zinc-800/30 transition flex flex-col gap-2 text-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 shrink-0 mt-0.5">
                      {getPlatformIcon(post.platforms[0])}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-white text-sm">{post.title}</h4>
                        {post.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} variant="compact" />
                        ))}
                        {isPrimeTimeSlot(post.scheduledAt) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9px] flex items-center gap-0.5" title="Slot de maior retenção">
                            🔥 Horário Nobre
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          post.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {post.status === "published" ? "Publicado" : "Agendado"}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs line-clamp-1">{post.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <div className="text-right text-[11px] font-mono text-zinc-400">
                      <span className="block text-zinc-200 font-semibold">{formatRelativeDate(post.scheduledAt)}</span>
                      <span className="text-zinc-500">{new Date(post.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-800/60 p-1 rounded-xl border border-zinc-700/60">
                      {post.status !== "published" && (
                        <button
                          onClick={() => handleForcePublishNow(post)}
                          className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
                          title="Despachar Agora"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (inlineReschedulePostId === post.id) {
                            setInlineReschedulePostId(null);
                          } else {
                            handleStartInlineReschedule(post);
                          }
                        }}
                        className={`p-1 rounded-lg transition ${
                          inlineReschedulePostId === post.id
                            ? "bg-amber-500 text-black font-bold shadow-sm"
                            : "text-amber-400 hover:bg-amber-500/20"
                        }`}
                        title="Reagendamento Rápido (Seletor inline)"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicatePost(post)}
                        className="p-1 rounded-lg text-blue-400 hover:bg-blue-500/20 transition"
                        title="Duplicar Post"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/20 transition"
                        title="Remover post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                {renderInlineRescheduleBox(post)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid (quando no modo Mês) */}
      {viewMode === "month" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Publicações Programadas ({filteredPosts.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1">
                      {post.platforms.map((p) => (
                        <PlatformBadge key={p} platform={p} variant="compact" />
                      ))}
                      {isPrimeTimeSlot(post.scheduledAt) && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9px] flex items-center gap-0.5" title="Horário Nobre">
                          🔥 Nobre
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                      post.status === "published" ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {post.status === "published" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publicado</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Agendado</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5 line-clamp-1">{post.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">{post.content}</p>
                </div>

                <div>
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{new Date(post.scheduledAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <div className="flex items-center gap-1.5">
                      {post.status !== "published" && (
                        <button
                          onClick={() => handleForcePublishNow(post)}
                          className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/10 rounded transition"
                          title="Despachar Agora"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (inlineReschedulePostId === post.id) {
                            setInlineReschedulePostId(null);
                          } else {
                            handleStartInlineReschedule(post);
                          }
                        }}
                        className={`p-1 rounded transition ${
                          inlineReschedulePostId === post.id
                            ? "bg-amber-500 text-black font-bold shadow-sm"
                            : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                        }`}
                        title="Reagendamento Rápido no Card"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicatePost(post)}
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/10 rounded transition"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {renderInlineRescheduleBox(post)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Omnichannel Schedule Modal */}
      <NewPostScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultDate={newDate} 
      />
    </div>
  );
}
