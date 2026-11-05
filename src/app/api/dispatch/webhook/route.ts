import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MASTER_API_KEY = "v5_live_v5_master_key_all_access_holding_apollo_2026_unlimited";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-API-Key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * POST /api/dispatch/webhook
 * Recebe tarefas de publicação e agendamento de outras Capitanias (Finders :3009, AutoBlog :3001, Apollo Studio :3004)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const apiKeyHeader = req.headers.get("x-api-key") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim() || apiKeyHeader.trim();

    // Validação de Chave Mestra da Holding
    if (token !== MASTER_API_KEY) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Chave de API inválida ou ausente. Forneça a chave mestra em Authorization: Bearer <key> ou X-API-Key.",
          code: 401
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      platforms = ["instagram"],
      mediaUrl,
      mediaType = "image",
      ctaUrl,
      scheduledAt,
      priority = "normal",
      source = "external_capitania"
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Os campos 'title' e 'content' são obrigatórios.",
          code: 400
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveScheduledAt = scheduledAt || new Date().toISOString();

    return NextResponse.json(
      {
        status: "accepted",
        jobId,
        message: "Publicação enfileirada com sucesso na Capitania #13 (V5 Apollo Poster).",
        payload: {
          title,
          platforms,
          mediaType,
          mediaUrl: mediaUrl || null,
          ctaUrl: ctaUrl || null,
          scheduledAt: effectiveScheduledAt,
          priority,
          source
        },
        telemetry: {
          receivedAt: new Date().toISOString(),
          port: ":3011",
          engine: "V5 Apollo Onichannel Cloud API",
          humanApprovalRequired: true
        }
      },
      { status: 202, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: errorMessage,
        code: 500
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
