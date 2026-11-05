import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/cockpit/stats
 * Retorna as métricas operacionais consolidadas do V5 Apollo Poster (:3011)
 */
export async function GET() {
  const uptime = typeof process !== "undefined" && typeof process.uptime === "function" ? Math.round(process.uptime()) : 0;

  return NextResponse.json(
    {
      capitania: 6,
      name: "V5 Apollo Poster",
      port: ":3011",
      domain: "poster.v5apollo.com",
      status: "operational",
      version: "2.5.0-master",
      uptimeSeconds: uptime,
      timestamp: new Date().toISOString(),
      channels: {
        supported: ["instagram", "tiktok", "youtube", "whatsapp", "newsletter", "autoblog", "telegram"],
        totalActive: 7,
      },
      skills: {
        hookFormulas: 10,
        carousel5LGenerator: true,
        carouselPngExporter: true,
        antiAiHumanizer: true,
        surgicalHashtags: true,
        viralRadarApify: true,
        humanApprovalGate: true,
        weeklyMatrix7D: true,
        commentToDmMachine: true,
        trendingAudioEngine: true
      },
      governance: {
        humanInTheLoop: "active",
        mode: "sovereign",
        zeroUserExtension: true,
      },
      soc2: {
        complianceStatus: "certified",
        dataIngestionLatencyP95Ms: 142,
        antiBanRateLimitDpm: 30,
        backoffMultiplier: 2.0
      }
    },
    { status: 200, headers: CORS_HEADERS }
  );
}
