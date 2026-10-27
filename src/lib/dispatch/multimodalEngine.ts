import { MultimodalDispatchPayload } from "@/types/poster";
import { sanitizeMarkdown } from "@/lib/utils/markdownSanitizer";

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Compila Markdown simples para HTML inline seguro para clientes de e-mail (Gmail, Outlook, Apple Mail)
 */
export function compileEmailHtml(payload: MultimodalDispatchPayload): string {
  const { title, contentMarkdown, emailOptions, slug } = payload;
  const utmSuffix = `utm_source=v5poster&utm_medium=email_newsletter&utm_campaign=${emailOptions.utmCampaign || slug}`;

  // Saneamento profundo e conversão segura para HTML inline
  const sanitizedMarkdown = sanitizeMarkdown(contentMarkdown);
  const lines = sanitizedMarkdown.split("\n");
  const htmlBodyLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.includes("[PAYWALL_BREAK") || line.includes("<!-- paywall") || line.includes("<!-- PAYWALL")) {
      htmlBodyLines.push(
        `<div style="margin: 32px 0; padding: 24px 16px; border: 2px dashed #f59e0b; background-color: #fffbeb; border-radius: 12px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <p style="color: #92400e; font-weight: 800; font-size: 15px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Conteúdo Exclusivo de Assinantes VIP</p>
          <p style="color: #b45309; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">Este é o ponto de corte da prévia gratuita. Assine o plano VIP para liberar a leitura completa.</p>
          <a href="https://v5autoblog.com/vip?${utmSuffix}" style="display: inline-block; background-color: #f59e0b; color: #000000; font-weight: 800; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">Desbloquear Assinatura VIP →</a>
        </div>`
      );
    } else if (line === "---" || line === "***") {
      htmlBodyLines.push(
        `<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;" />`
      );
    } else if (line.startsWith("# ")) {
      htmlBodyLines.push(
        `<h1 style="color: #111827; font-size: 26px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${line.replace("# ", "")}</h1>`
      );
    } else if (line.startsWith("## ")) {
      htmlBodyLines.push(
        `<h2 style="color: #1f2937; font-size: 20px; font-weight: 700; line-height: 1.4; margin: 24px 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${line.replace("## ", "")}</h2>`
      );
    } else if (line.startsWith("### ")) {
      htmlBodyLines.push(
        `<h3 style="color: #374151; font-size: 17px; font-weight: 600; line-height: 1.4; margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${line.replace("### ", "")}</h3>`
      );
    } else if (line.startsWith("> ")) {
      htmlBodyLines.push(
        `<blockquote style="border-left: 4px solid #f59e0b; padding: 12px 18px; margin: 20px 0; background-color: #fffbeb; color: #92400e; font-style: italic; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.6;">${line.replace("> ", "")}</blockquote>`
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      htmlBodyLines.push(
        `<li style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${line.substring(2)}</li>`
      );
    } else if (/^\d+\.\s/.test(line)) {
      htmlBodyLines.push(
        `<li style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${line.replace(/^\d+\.\s/, "")}</li>`
      );
    } else {
      // Formatacao inline simples de bold
      let formattedText = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      htmlBodyLines.push(
        `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formattedText}</p>`
      );
    }
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.emailOptions.subject || title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader invisivel para cliente de email -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${payload.emailOptions.previewText || ""}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #030712; padding: 24px 32px; border-bottom: 2px solid #f59e0b;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">V5 APOLLO <span style="color: #f59e0b;">DISPATCH</span></span>
                  </td>
                  <td align="right">
                    <span style="color: #9ca3af; font-size: 11px; font-family: monospace; text-transform: uppercase;">Newsletter Oficial</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              ${htmlBodyLines.join("\n              ")}
            </td>
          </tr>

          <!-- Call to Action Button -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #f59e0b;">
                    <a href="https://v5autoblog.com/artigo/${slug}?${utmSuffix}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #000000; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Ler Artigo Completo no Blog →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
                Enviado por <strong>${emailOptions.fromName || "Holding V5 Apollo"}</strong> via V5 Poster Engine.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                <a href="https://v5apollo.com/preferencias?${utmSuffix}" style="color: #6b7280; text-decoration: underline;">Gerenciar Preferências</a> • 
                <a href="https://v5apollo.com/cancelar?${utmSuffix}" style="color: #6b7280; text-decoration: underline;">Cancelar Inscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Compila o payload estruturado exato para a API REST do V5 AutoBlog ou WordPress
 */
export function compileBlogPayload(payload: MultimodalDispatchPayload) {
  const slug = payload.slug || slugify(payload.title);
  const canonicalUrl = `https://v5autoblog.com/artigo/${slug}`;
  const hasPaywall = payload.contentMarkdown.includes("[PAYWALL_BREAK") || 
                     payload.contentMarkdown.includes("<!-- paywall") ||
                     payload.contentMarkdown.includes("<!-- PAYWALL");
  const paywallIndex = hasPaywall 
    ? payload.contentMarkdown.search(/\[PAYWALL_BREAK|<!--\s*paywall/i) 
    : undefined;

  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": payload.title,
    "description": payload.summary || payload.emailOptions.previewText,
    "articleBody": payload.contentMarkdown,
    "author": {
      "@type": "Person",
      "name": payload.blogOptions.author || "Equipe V5 Apollo"
    },
    "publisher": {
      "@type": "Organization",
      "name": "V5 AutoBlog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://v5autoblog.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "datePublished": new Date().toISOString()
  };

  return {
    title: payload.title,
    slug: slug,
    content: sanitizeMarkdown(payload.contentMarkdown),
    excerpt: payload.summary || payload.emailOptions.previewText,
    category: payload.blogOptions.category,
    tags: payload.blogOptions.tags,
    status: "publish",
    author: payload.blogOptions.author,
    canonical_url: canonicalUrl,
    has_paywall: hasPaywall,
    paywall_index: paywallIndex,
    schema_org: schemaJsonLd,
    meta_seo: {
      meta_title: `${payload.title} | V5 AutoBlog`,
      meta_description: payload.summary || payload.emailOptions.previewText,
      focus_keywords: payload.blogOptions.tags.slice(0, 3).join(", ")
    }
  };
}

/**
 * Compila teasers adaptados para canais sociais e grupos
 */
export function compileSocialTeasers(payload: MultimodalDispatchPayload) {
  const slug = payload.slug || slugify(payload.title);
  const canonicalUrl = `https://v5autoblog.com/artigo/${slug}?utm_source=v5poster&utm_medium=social_teaser`;

  return {
    x_twitter: `🔥 ${payload.title}\n\n${payload.summary || payload.emailOptions.previewText.substring(0, 160)}...\n\nLeia a análise completa:\n👉 ${canonicalUrl}\n\n#IA #Produtividade #Tech`,
    threads: `⚡ Novo conteúdo publicado no ecossistema:\n\n"${payload.title}"\n\n${payload.summary || payload.emailOptions.previewText}\n\nO link completo está disponível na bio ou acesse: ${canonicalUrl}`,
    instagram_caption: `🚀 ${payload.title}\n.\n${payload.summary || payload.emailOptions.previewText}\n.\nPrincipais pontos abordados:\n✅ Estratégia prática\n✅ Automação sem atrito\n✅ Aplicação imediata\n.\nComente "LINK" aqui embaixo que o nosso robô envia o artigo completo no seu Direct na mesma hora!\n.\n#v5apollo #produtividade #tecnologia #automacao`,
    telegram_vip: `🔥 *NOVO ARTIGO PUBLICADO NO BLOG & NEWSLETTER*\n\n📌 *${payload.title}*\n\n_${payload.summary || payload.emailOptions.previewText}_\n\n👉 [Clique aqui para ler na íntegra no AutoBlog](${canonicalUrl})`,
    whatsapp_community: `*${payload.title.toUpperCase()}*\n\n${payload.summary || payload.emailOptions.previewText}\n\nLeia o artigo completo com todas as dicas:\n👉 ${canonicalUrl}`
  };
}

/**
 * Simula a execucao real de despacho multimodal em paralelo
 */
export async function executeMockDispatch(payload: MultimodalDispatchPayload): Promise<{
  emailResult: { status: 'sent' | 'failed'; sentCount: number; messageId: string };
  blogResult: { status: 'sent' | 'failed'; publishedUrl: string; statusCode: number };
  socialResult: { status: 'sent' | 'failed'; deliveredChannels: string[] };
}> {
  // Simula latencia de rede
  await new Promise((r) => setTimeout(r, 1200));

  const slug = payload.slug || slugify(payload.title);

  return {
    emailResult: {
      status: "sent",
      sentCount: 1845,
      messageId: `msg_${Date.now()}_resend_ok`
    },
    blogResult: {
      status: "sent",
      publishedUrl: `https://v5autoblog.com/artigo/${slug}`,
      statusCode: 201
    },
    socialResult: {
      status: "sent",
      deliveredChannels: ["Telegram VIP", "WhatsApp Comunidades", "Threads"]
    }
  };
}
