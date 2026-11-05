import type { Metadata } from "next";
import "./globals.css";
import V5EcosystemHeader from '@/components/layout/V5EcosystemHeader';

import V5EcosystemFooter from '@/components/layout/V5EcosystemFooter';
import V5FloatingConcierge from '@/components/layout/V5FloatingConcierge';
import V5ClientErrorSentinel from '@/components/layout/V5ClientErrorSentinel';
export const metadata: Metadata = {
  metadataBase: new URL("https://poster.v5apollo.com"),
  title: "V5 Apollo Poster — Central Onicanal de Despacho & Engajamento",
  description: "Central onicanal de despacho, agendamento de 30 dias, blog + newsletter dual publisher e comment-to-dm automatizado.",
  authors: [{ name: "Holding V5 Apollo", url: "https://v5apollo.com" }],
  creator: "Apollo La Plata",
  publisher: "Holding V5 Apollo",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "V5 Apollo Poster — Central Onicanal de Despacho & Engajamento",
    description: "Central onicanal de despacho, agendamento de 30 dias, blog + newsletter dual publisher e comment-to-dm automatizado.",
    url: "https://poster.v5apollo.com",
    siteName: "V5 Apollo Poster",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "V5 Apollo Poster — Central Onicanal de Despacho & Engajamento",
    description: "Central onicanal de despacho, agendamento de 30 dias, blog + newsletter dual publisher e comment-to-dm automatizado.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
            <head>
        <link rel="preconnect" href="https://v5apollo.com" />
        <link rel="dns-prefetch" href="https://v5apollo.com" />
        <link rel="preconnect" href="https://hmiynglcsvpzhqbnnqzj.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://hmiynglcsvpzhqbnnqzj.supabase.co" />
      </head>
<body className="bg-[#030712] text-zinc-100 min-h-screen selection:bg-amber-500 selection:text-black">
        <V5EcosystemHeader currentSite="poster" />
        {children}
              <V5EcosystemFooter currentSite="poster" />
        <V5FloatingConcierge currentSite="poster" />
        <V5ClientErrorSentinel siteId="poster" />
      </body>
    </html>
  );
}