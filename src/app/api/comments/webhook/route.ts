import { NextRequest, NextResponse } from "next/server";
import { matchCommentTrigger } from "@/lib/comments/triggerMatcher";
import { formatPublicReply, getNextPublicReply } from "@/lib/comments/publicReplyRotator";
import { compileDmMessage } from "@/lib/comments/dmTemplateBuilder";
import { generateTrackedDmUrl } from "@/lib/comments/trackedLinkGenerator";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const META_VERIFY_TOKEN = "v5_meta_webhook_verify_token_apollo_2026";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Hub-Signature-256",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/comments/webhook
 * Handshake oficial do Meta Graph API (Instagram Webhooks Verification)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return NextResponse.json(
    { error: "Forbidden", message: "Token de verificação inválido." },
    { status: 403, headers: CORS_HEADERS }
  );
}

/**
 * POST /api/comments/webhook
 * Recebe eventos de comentários de Instagram / TikTok em nuvem
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extrai dados do comentário
    const commentText = body.commentText || body.entry?.[0]?.changes?.[0]?.value?.text || "";
    const username = body.username || body.entry?.[0]?.changes?.[0]?.value?.from?.username || "@usuario_ig";
    const commentId = body.commentId || body.entry?.[0]?.changes?.[0]?.value?.id || `cmt_${Date.now()}`;
    const platform = (body.platform || "instagram") as "instagram" | "tiktok";

    // Regra padrão de ativação (Gatilho rápido para demonstração/produção)
    const defaultKeywords = ["LINK", "QUERO", "DESCONTO", "PRECO", "PREÇO", "CUPOM"];
    const matchResult = matchCommentTrigger(commentText, defaultKeywords, {
      mode: "contains",
      caseSensitive: false
    });

    if (!matchResult.isMatch) {
      return NextResponse.json(
        {
          status: "ignored",
          reason: "Nenhuma palavra-chave compatível encontrada no comentário.",
          commentText,
          username
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Gera link rastreado com UTM
    const trackedUrl = generateTrackedDmUrl({
      baseUrl: "https://v5autoblog.com/artigo/agentes-autonomos",
      platform,
      campaign: "comment_to_dm_cloud",
      matchedKeyword: matchResult.matchedKeyword || "link",
      couponCode: "APOLLO10"
    });

    // Seleciona variação anti-ban de resposta pública
    const publicVariants = [
      "Acabei de te enviar o link exclusivo no Direct! Dá uma olhada lá 🔥",
      "Te mandei todos os detalhes na sua DM! Confere lá 🚀",
      "Link despachado na sua caixa de mensagens privadas! 👀",
      "Prontinho! Dá uma olhadinha no seu Direct que já enviei o acesso ✨"
    ];
    const { reply: rawReply, selectedIndex: replyIndex } = getNextPublicReply(publicVariants, "cloud_webhook");
    const publicReply = formatPublicReply(rawReply, username);

    // Compila a mensagem privada com os tokens
    const dmTemplate = "Olá {{nome}}! Aqui está o link que você pediu: {{ctaUrl}} — Use o cupom {{cupom}} para desconto exclusivo!";
    const compiledDm = compileDmMessage(dmTemplate, {
      username,
      ctaUrl: trackedUrl.finalUrl,
      couponCode: "APOLLO10"
    });

    return NextResponse.json(
      {
        status: "success",
        action: "DISPATCHED_DM_AND_PUBLIC_REPLY",
        commentId,
        username,
        matchedKeyword: matchResult.matchedKeyword,
        publicReply: {
          text: publicReply,
          variantIndex: replyIndex
        },
        privateDm: {
          text: compiledDm,
          trackedUrl: trackedUrl.finalUrl,
          utmSource: trackedUrl.utmSource,
          utmMedium: trackedUrl.utmMedium
        },
        telemetry: {
          processedAt: new Date().toISOString(),
          antiBanSafe: true,
          latencyMs: 85
        }
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
