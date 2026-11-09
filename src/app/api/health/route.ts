import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: process.env.NEXT_PUBLIC_APP_NAME || "V5_Apollo_Capitania",
    version: "2.5.0",
    colab_fleet_connected: process.env.NEXT_PUBLIC_COLAB_FLEET_ENABLED === "true",
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0
  }, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
