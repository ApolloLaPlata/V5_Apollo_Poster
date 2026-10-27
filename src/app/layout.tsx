import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "V5 Apollo Poster | Omnichannel Content Dispatcher & Engagement Suite",
  description: "Central onicanal de despacho, agendamento de 30 dias, blog + newsletter dual publisher e comment-to-dm automatizado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#030712] text-zinc-100 min-h-screen selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
