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
  Filter
} from "lucide-react";
import { ScheduledPost, SocialPlatform } from "@/types/poster";

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: "post-1",
    title: "5 Segredos de IA que a Grande Mídia Não Te Conta",
    content: "Neste vídeo revelamos as ferramentas gratuitas que estão substituindo tarefas manuais de 10 horas...",
    platforms: ["instagram", "tiktok", "youtube"],
    scheduledAt: "2026-10-28T14:00:00",
    status: "scheduled",
    mediaType: "video",
    tags: ["IA", "Produtividade", "Shorts"]
  },
  {
    id: "post-2",
    title: "Relatório de Mercado: O Futuro dos Blogs Programáticos",
    content: "Como indexar 1.000 artigos com E-E-A-T em 30 dias sem sofrer penalização de spam...",
    platforms: ["autoblog", "wordpress", "newsletter"],
    scheduledAt: "2026-10-29T10:00:00",
    status: "scheduled",
    mediaType: "image",
    tags: ["SEO", "AutoBlog", "Newsletter"]
  },
  {
    id: "post-3",
    title: "Drop Exclusivo: Teclado Mecânico Magnético 60%",
    content: "Cupom relâmpago de 45% OFF liberado só para os membros do grupo VIP! Link na bio.",
    platforms: ["whatsapp", "telegram", "instagram"],
    scheduledAt: "2026-10-27T18:30:00",
    status: "published",
    mediaType: "image",
    tags: ["Achadinhos", "Cupom", "VIP"]
  }
];

export function MasterCalendar() {
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_POSTS);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("instagram");
  const [newDate, setNewDate] = useState("2026-10-30T15:00");

  const filteredPosts = posts.filter(post => {
    if (selectedFilter === "all") return true;
    return post.platforms.includes(selectedFilter as SocialPlatform);
  });

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      content: newContent,
      platforms: [newPlatform],
      scheduledAt: newDate,
      status: "scheduled",
      mediaType: "image",
      tags: ["Agendado"]
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(false);
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Calendário Onicanal (30 Dias)</h2>
          <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full border border-zinc-700">
            {posts.length} posts na fila
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-lg border border-zinc-700/60 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-2.5 py-1 rounded-md transition ${selectedFilter === "all" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter("instagram")}
              className={`px-2.5 py-1 rounded-md transition ${selectedFilter === "instagram" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              Instagram
            </button>
            <button
              onClick={() => setSelectedFilter("tiktok")}
              className={`px-2.5 py-1 rounded-md transition ${selectedFilter === "tiktok" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              TikTok
            </button>
            <button
              onClick={() => setSelectedFilter("autoblog")}
              className={`px-2.5 py-1 rounded-md transition ${selectedFilter === "autoblog" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              Blog
            </button>
            <button
              onClick={() => setSelectedFilter("newsletter")}
              className={`px-2.5 py-1 rounded-md transition ${selectedFilter === "newsletter" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              Newsletter
            </button>
            <button
              onClick={() => setSelectedFilter("whatsapp")}
              className={`px-2.5 py-1 rounded-md transition ${selectedFilter === "whatsapp" ? "bg-amber-500 text-black font-semibold" : "text-zinc-300 hover:text-white"}`}
            >
              VIP Groups
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3.5 py-1.5 rounded-lg text-xs transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Novo Post</span>
          </button>
        </div>
      </div>

      {/* 30 Day Grid Overview */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Visão Mensal de Distribuição
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
          {days.map(day => {
            const hasPost = posts.some(p => {
              const d = new Date(p.scheduledAt).getDate();
              return d === day;
            });
            const isToday = day === 27;

            return (
              <div
                key={day}
                className={`p-2.5 rounded-lg border text-center transition flex flex-col justify-between min-h-[58px] ${
                  isToday 
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-300" 
                    : hasPost 
                    ? "bg-zinc-800/60 border-zinc-700 text-white" 
                    : "bg-zinc-900/20 border-zinc-800/50 text-zinc-500"
                }`}
              >
                <div className="text-[11px] font-mono font-medium flex justify-between">
                  <span>Dia {day}</span>
                  {isToday && <span className="text-[9px] text-amber-400">HOJE</span>}
                </div>
                {hasPost ? (
                  <div className="flex justify-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  </div>
                ) : (
                  <span className="text-[9px] text-zinc-600">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Fila de Publicações Programadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map(post => (
            <div 
              key={post.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1">
                    {post.platforms.map(p => (
                      <span key={p} className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                        {p}
                      </span>
                    ))}
                  </div>
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${
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
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{post.content}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono">{new Date(post.scheduledAt).toLocaleString("pt-BR")}</span>
                <span className="flex items-center gap-1 text-zinc-500">
                  {post.mediaType === "video" ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  <span>{post.tags[0]}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              Agendar Nova Publicação Onicanal
            </h3>

            <form onSubmit={handleAddPost} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Título do Post / Assunto</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: 3 Segredos para Escalar Conteúdo..."
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Conteúdo / Legenda / Roteiro</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  placeholder="Escreva a legenda completa ou texto da postagem..."
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Plataforma Principal</label>
                  <select 
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="autoblog">V5 AutoBlog</option>
                    <option value="wordpress">WordPress REST</option>
                    <option value="newsletter">Email Newsletter</option>
                    <option value="whatsapp">WhatsApp VIP</option>
                    <option value="telegram">Telegram VIP</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Data e Hora de Disparo</label>
                  <input 
                    type="datetime-local" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
