"use client";

import React from "react";
import { SocialPlatform } from "@/types/poster";
import { 
  Instagram, 
  Video, 
  Youtube, 
  Globe, 
  Mail, 
  Send, 
  MessageCircle, 
  Sparkles,
  FileCode,
  Flame,
  AtSign
} from "lucide-react";

interface PlatformBadgeProps {
  platform: SocialPlatform;
  variant?: "compact" | "full" | "iconOnly";
  showHoverEffect?: boolean;
}

export function PlatformBadge({
  platform,
  variant = "compact",
  showHoverEffect = false
}: PlatformBadgeProps) {
  const getBadgeConfig = (p: SocialPlatform) => {
    switch (p) {
      case "instagram":
        return {
          name: "Instagram",
          shortName: "IG",
          bg: "bg-pink-500/15 border-pink-500/30 text-pink-400 hover:border-pink-400",
          icon: Video,
          category: "Social"
        };
      case "tiktok":
        return {
          name: "TikTok",
          shortName: "TT",
          bg: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 hover:border-cyan-400",
          icon: Video,
          category: "Social"
        };
      case "youtube":
        return {
          name: "YouTube Shorts",
          shortName: "YT",
          bg: "bg-red-500/15 border-red-500/30 text-red-400 hover:border-red-400",
          icon: Youtube,
          category: "Video"
        };
      case "kwai":
        return {
          name: "Kwai",
          shortName: "KW",
          bg: "bg-orange-500/15 border-orange-500/30 text-orange-400 hover:border-orange-400",
          icon: Flame,
          category: "Video"
        };
      case "autoblog":
        return {
          name: "V5 AutoBlog",
          shortName: "Blog",
          bg: "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:border-amber-400",
          icon: Globe,
          category: "SEO Web"
        };
      case "wordpress":
        return {
          name: "WordPress REST",
          shortName: "WP",
          bg: "bg-blue-500/15 border-blue-500/30 text-blue-400 hover:border-blue-400",
          icon: Globe,
          category: "CMS"
        };
      case "newsletter":
        return {
          name: "Newsletter E-mail",
          shortName: "Email",
          bg: "bg-purple-500/15 border-purple-500/30 text-purple-400 hover:border-purple-400",
          icon: Mail,
          category: "Direct"
        };
      case "whatsapp":
        return {
          name: "WhatsApp VIP",
          shortName: "WPP",
          bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:border-emerald-400",
          icon: MessageCircle,
          category: "VIP Hub"
        };
      case "telegram":
        return {
          name: "Telegram VIP",
          shortName: "TG",
          bg: "bg-sky-500/15 border-sky-500/30 text-sky-400 hover:border-sky-400",
          icon: Send,
          category: "VIP Hub"
        };
      case "x_twitter":
        return {
          name: "X (Twitter)",
          shortName: "X",
          bg: "bg-zinc-800 border-zinc-600 text-zinc-200 hover:border-zinc-400",
          icon: Sparkles,
          category: "Social"
        };
      case "threads":
        return {
          name: "Threads",
          shortName: "TH",
          bg: "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500",
          icon: AtSign,
          category: "Social"
        };
      default:
        return {
          name: platform,
          shortName: platform,
          bg: "bg-zinc-800 border-zinc-700 text-zinc-400",
          icon: Sparkles,
          category: "Channel"
        };
    }
  };

  const config = getBadgeConfig(platform);
  const Icon = config.icon;

  if (variant === "iconOnly") {
    return (
      <span 
        className={`inline-flex items-center justify-center p-1 rounded-md border text-[10px] ${config.bg} ${showHoverEffect ? "transition hover:scale-105" : ""}`}
        title={`${config.name} (${config.category})`}
      >
        <Icon className="w-3 h-3" />
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-mono text-[10px] uppercase font-semibold ${config.bg} ${showHoverEffect ? "transition hover:scale-105" : ""}`}
        title={`${config.name} • ${config.category}`}
      >
        <Icon className="w-2.5 h-2.5" />
        <span>{config.shortName}</span>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${config.bg} ${showHoverEffect ? "transition hover:scale-105 shadow-sm" : ""}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.name}</span>
      <span className="text-[9px] font-mono opacity-60 uppercase pl-0.5">{config.category}</span>
    </span>
  );
}
