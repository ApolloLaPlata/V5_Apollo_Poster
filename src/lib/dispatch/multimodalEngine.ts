import { 
  MultimodalDispatchPayload, 
  V5AutoBlogPayload, 
  ExtendedSeoMetadata, 
  OpenGraphMetadata, 
  TwitterCardMetadata, 
  SchemaOrgBlogPosting, 
  AiSearchReadiness, 
  BlogAuthorProfile, 
  BlogFeaturedImage 
} from "@/types/poster";
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

export interface UtmConfig {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

/**
 * Constrói e anexa parâmetros UTM de forma inteligente a qualquer URL
 * Trata URLs com parâmetros existentes, âncoras e ignora protocolos não-web (mailto, tel)
 */
export function buildTrackingUrl(rawUrl: string, config: UtmConfig): string {
  if (!rawUrl || rawUrl.startsWith("#") || rawUrl.startsWith("mailto:") || rawUrl.startsWith("tel:")) {
    return rawUrl;
  }

  // Se já tiver utm_source, preserva a URL original
  if (rawUrl.includes("utm_source=")) {
    return rawUrl;
  }

  try {
    const [baseUrlWithQuery, hash] = rawUrl.split("#");
    const hasQuery = baseUrlWithQuery.includes("?");
    const separator = hasQuery ? "&" : "?";

    const params: string[] = [];
    params.push(`utm_source=${encodeURIComponent(config.source || "v5poster")}`);
    params.push(`utm_medium=${encodeURIComponent(config.medium || "email_newsletter")}`);
    if (config.campaign) {
      params.push(`utm_campaign=${encodeURIComponent(config.campaign)}`);
    }
    if (config.content) {
      params.push(`utm_content=${encodeURIComponent(config.content)}`);
    }
    if (config.term) {
      params.push(`utm_term=${encodeURIComponent(config.term)}`);
    }

    const trackedBase = `${baseUrlWithQuery}${separator}${params.join("&")}`;
    return hash ? `${trackedBase}#${hash}` : trackedBase;
  } catch {
    return rawUrl;
  }
}

/**
 * Injeta parâmetros UTM em todas as tags <a> e links Markdown [texto](url) de um conteúdo
 */
export function injectUtmParameters(
  content: string,
  config: UtmConfig,
  defaultContentId: string = "body_link"
): string {
  const markdownLinkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
  return content.replace(markdownLinkRegex, (_, text, url) => {
    const trackedUrl = buildTrackingUrl(url, { ...config, content: config.content || defaultContentId });
    return `<a href="${trackedUrl}" target="_blank" style="color: #d97706; text-decoration: underline; font-weight: 500;">${text}</a>`;
  });
}

export interface BulletproofButtonOptions {
  url: string;
  label: string;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string | number;
  width?: number;
  height?: number;
  borderRadius?: number;
  borderStrokeColor?: string;
  align?: "left" | "center" | "right";
  fullWidth?: boolean;
}

/**
 * Renderiza um Botão CTA de Alta Conversão à Prova de Balas (Bulletproof Button)
 * 100% compatível com Microsoft Outlook Desktop (Word Engine via VML <!--[if mso]>)
 * e clientes modernos (Gmail, Apple Mail, iOS, Android, Outlook Web).
 */
export function renderOutlookCtaButton(options: BulletproofButtonOptions): string {
  const {
    url,
    label,
    bgColor = "#f59e0b",
    textColor = "#000000",
    fontSize = 14,
    fontWeight = 700,
    width = 280,
    height = 48,
    borderRadius = 10,
    borderStrokeColor,
  } = options;

  // Cálculo da curvatura do retângulo vetorial VML (arcsize aproximado em porcentagem)
  const arcPercent = Math.min(Math.round((borderRadius / height) * 100), 50);
  const strokeAttr = borderStrokeColor ? `strokecolor="${borderStrokeColor}"` : 'stroke="f"';

  return `<!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="${arcPercent}%" ${strokeAttr} fillcolor="${bgColor}">
    <w:anchorlock/>
    <center style="color:${textColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};">
      ${label}
    </center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <a href="${url}" target="_blank" style="background-color:${bgColor};border-radius:${borderRadius}px;color:${textColor};display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};line-height:${height}px;text-align:center;text-decoration:none;width:${width}px;-webkit-text-size-adjust:none;mso-hide:all;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);transition:all 0.2s ease;">
    ${label}
  </a>
  <!--<![endif]-->`;
}

/**
 * Envolve o botão em uma tabela de apresentação centralizada para compatibilidade máxima com clientes de e-mail
 */
export function renderEmailCtaContainer(
  buttonHtml: string,
  align: "left" | "center" | "right" = "center",
  padding: string = "16px 0"
): string {
  return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="width: 100%; border-collapse: collapse; margin: 0 auto;">
    <tr>
      <td align="${align}" style="padding: ${padding}; text-align: ${align};">
        ${buttonHtml}
      </td>
    </tr>
  </table>`;
}

export interface InstitutionalFooterOptions {
  companyName?: string;
  senderName?: string;
  physicalAddress?: string;
  permissionReminder?: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  privacyUrl?: string;
  termsUrl?: string;
  currentYear?: number;
  enginePort?: string;
}

/**
 * Renderiza o Rodapé Institucional Obrigatório de E-mail
 * Em conformidade estrita com o CAN-SPAM Act, LGPD (Brasil), GDPR (UE) e RFC-8058 (One-Click Unsubscribe)
 */
export function renderInstitutionalEmailFooter(options: InstitutionalFooterOptions): string {
  const {
    companyName = "Holding V5 Apollo",
    senderName = "Holding V5 Apollo",
    physicalAddress = "Holding V5 Apollo Ltda. • Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP 01310-100, Brasil",
    permissionReminder = "Você está recebendo esta mensagem porque se inscreveu na newsletter oficial de inteligência e automação da Holding V5 Apollo através do portal AutoBlog ou de nossas capitanias parceiras.",
    unsubscribeUrl,
    preferencesUrl,
    privacyUrl = "https://v5apollo.com/privacidade",
    termsUrl = "https://v5apollo.com/termos",
    currentYear = new Date().getFullYear(),
    enginePort = ":3011",
  } = options;

  return `<!-- RODAPÉ INSTITUCIONAL OBRIGATÓRIO (CAN-SPAM, LGPD & RFC-8058) -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 32px 28px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <!-- Selo de Compliance & Permission Reminder -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background-color: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                      🛡️ E-mail Transacional & Editorial • 100% Opt-In Verificado
                    </span>
                    <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0 auto; max-width: 520px;">
                      ${permissionReminder}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Links de Governança, Cancelamento e Preferências -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #64748b; line-height: 1.8;">
                    <a href="${preferencesUrl}" target="_blank" style="color: #475569; text-decoration: underline; font-weight: 600;">Gerenciar Preferências</a>
                    <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                    <a href="${unsubscribeUrl}" target="_blank" style="color: #ef4444; text-decoration: underline; font-weight: 600;">Cancelar Inscrição (1-Click)</a>
                    <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                    <a href="${privacyUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">Privacidade</a>
                    <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                    <a href="${termsUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">Termos de Uso</a>
                  </td>
                </tr>
              </table>

              <!-- Endereço Físico Obrigatório CAN-SPAM / LGPD -->
              <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0 0 10px 0;">
                <strong>${companyName}</strong> (${senderName})<br>
                ${physicalAddress}
              </p>

              <!-- Copyright e Identificação da Capitania -->
              <p style="color: #cbd5e1; font-size: 10px; margin: 0; font-family: monospace;">
                © ${currentYear} Holding V5 Apollo. Todos os direitos reservados. Despachado pela Capitania #13: V5 Apollo Poster (Porta ${enginePort}).
              </p>
            </td>
          </tr>`;
}

/**
 * Converte blocos de tabela Markdown (| col1 | col2 |) para tabelas HTML com estilos inline
 * 100% compatíveis com Outlook Desktop, Gmail App e Apple Mail.
 */
export function parseMarkdownTableToEmailHtml(tableLines: string[], utmConfig?: UtmConfig): string {
  if (tableLines.length === 0) return "";

  const extractCells = (row: string) => {
    return row
      .split("|")
      .map(c => c.trim())
      .filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
  };

  const headerCells = extractCells(tableLines[0]);
  let alignments: ("left" | "center" | "right")[] = headerCells.map(() => "left");
  let dataStartIndex = 1;

  if (tableLines.length > 1 && /^\|?(\s*:?-+:?\s*\|?)+$/.test(tableLines[1])) {
    const sepCells = extractCells(tableLines[1]);
    alignments = sepCells.map(cell => {
      if (cell.startsWith(":") && cell.endsWith(":")) return "center";
      if (cell.endsWith(":")) return "right";
      return "left";
    });
    dataStartIndex = 2;
  }

  const formatTableCell = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; color: #b45309; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 11px;">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, (_, linkText, url) => {
        const trackedUrl = utmConfig ? buildTrackingUrl(url, { ...utmConfig, content: "table_cell_link" }) : url;
        return `<a href="${trackedUrl}" target="_blank" style="color: #d97706; text-decoration: underline;">${linkText}</a>`;
      });
  };

  const theadHtml = `
    <thead>
      <tr style="background-color: #0f172a;">
        ${headerCells.map((h, idx) => {
          const align = alignments[idx] || "left";
          return `<th style="padding: 12px 14px; text-align: ${align}; color: #ffffff; font-weight: 700; font-size: 13px; border-bottom: 2px solid #f59e0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatTableCell(h)}</th>`;
        }).join("\n        ")}
      </tr>
    </thead>`;

  const rowsHtml: string[] = [];
  for (let r = dataStartIndex; r < tableLines.length; r++) {
    const cells = extractCells(tableLines[r]);
    const bgColor = (r - dataStartIndex) % 2 === 0 ? "#ffffff" : "#f8fafc";
    const rowHtml = `
      <tr style="background-color: ${bgColor};">
        ${cells.map((cell, idx) => {
          const align = alignments[idx] || "left";
          return `<td style="padding: 10px 14px; text-align: ${align}; color: #334155; font-size: 13px; border-bottom: 1px solid #e2e8f0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatTableCell(cell)}</td>`;
        }).join("\n        ")}
      </tr>`;
    rowsHtml.push(rowHtml);
  }

  const tbodyHtml = `
    <tbody>
      ${rowsHtml.join("\n      ")}
    </tbody>`;

  return `
    <div style="overflow-x: auto; margin: 24px 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${theadHtml}
        ${tbodyHtml}
      </table>
    </div>`;
}

/**
 * Gera o bloco HTML invisível de Preheader com técnica anti-vazamento (Anti-Spill Padding Hack)
 * Garante que clientes como Gmail, Apple Mail e Outlook exibam exatamente o texto de apoio
 * sem vazar trechos do corpo do e-mail no snippet da caixa de entrada.
 */
export function generateInvisiblePreheader(previewText?: string, fallbackText?: string): string {
  const rawText = previewText || fallbackText || "";
  const cleanPreview = rawText
    .replace(/<[^>]*>?/gm, "")
    .replace(/[#*`_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Zero-width non-breaking space hack (Litmus / Email on Acid standard)
  const paddingHack = "&zwnj;&nbsp;".repeat(45);

  return `<!-- PREHEADER INVISÍVEL (Gmail, Apple Mail, Outlook) -->
  <div style="display: none; font-size: 1px; color: #f3f4f6; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    ${cleanPreview}
  </div>
  <!-- PREHEADER ANTI-SPILL PADDING (Evita que o início do corpo vaze no snippet do inbox) -->
  <div style="display: none; font-size: 1px; color: #f3f4f6; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    ${paddingHack}
  </div>`;
}

/**
 * Compila Markdown simples para HTML inline seguro para clientes de e-mail (Gmail, Outlook, Apple Mail)
 */
export function compileEmailHtml(payload: MultimodalDispatchPayload): string {
  const { title, contentMarkdown, emailOptions, slug } = payload;
  
  // Configuração centralizada de parâmetros UTM industriais
  const utmConfig: UtmConfig = {
    source: "v5poster",
    medium: "email_newsletter",
    campaign: emailOptions.utmCampaign || slug,
  };
  const utmSuffix = `utm_source=${utmConfig.source}&utm_medium=${utmConfig.medium}&utm_campaign=${encodeURIComponent(utmConfig.campaign || "")}`;
  const preheaderBlock = generateInvisiblePreheader(emailOptions.previewText, payload.summary);

  // Helper de formatação inline segura com injeção de parâmetros UTM em todos os links
  const formatEmailInlineText = (text: string, contentId: string = "body_link"): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, '<code style="background-color: #f1f5f9; color: #b45309; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 12px;">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, (_, linkText, url) => {
        const trackedUrl = buildTrackingUrl(url, { ...utmConfig, content: contentId });
        return `<a href="${trackedUrl}" target="_blank" style="color: #d97706; text-decoration: underline; font-weight: 500;">${linkText}</a>`;
      });
  };

  // Saneamento profundo e conversão segura para HTML inline
  const sanitizedMarkdown = sanitizeMarkdown(contentMarkdown);
  const lines = sanitizedMarkdown.split("\n");
  const htmlBodyLines: string[] = [];

  // Imagem de Capa do E-mail (Hero Image)
  if (payload.coverImageUrl) {
    htmlBodyLines.push(
      `<img src="${payload.coverImageUrl}" alt="${payload.coverImageAlt || payload.title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 10px; margin-bottom: 24px; display: block;" />`
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    // Suporte a Tabelas Markdown com estilos inline para clientes de e-mail (Outlook/Gmail)
    if (line.startsWith("|") && line.endsWith("|") && line.includes("|")) {
      const tableLines: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && lines[i + 1].trim().endsWith("|")) {
        i++;
        tableLines.push(lines[i].trim());
      }
      const tableHtml = parseMarkdownTableToEmailHtml(tableLines, utmConfig);
      htmlBodyLines.push(tableHtml);
      continue;
    }

    // Suporte a Imagens inline no corpo: ![ALT](URL)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      htmlBodyLines.push(
        `<figure style="margin: 24px 0; text-align: center;"><img src="${imgMatch[2]}" alt="${imgMatch[1] || 'Imagem ilustrativa'}" style="width: 100%; max-width: 580px; height: auto; border-radius: 8px; display: block; margin: 0 auto;" />${imgMatch[1] ? `<figcaption style="color: #6b7280; font-size: 12px; margin-top: 6px;">${imgMatch[1]}</figcaption>` : ''}</figure>`
      );
    } else if (/^\[(?:CTA|BUTTON|BOTAO):(.*?)\|(https?:\/\/[^\s\]]+)\]$/i.test(line)) {
      // Suporte a Botão CTA Bulletproof personalizado no Markdown: [CTA:Texto|https://link]
      const ctaMatch = line.match(/^\[(?:CTA|BUTTON|BOTAO):(.*?)\|(https?:\/\/[^\s\]]+)\]$/i);
      if (ctaMatch) {
        const ctaLabel = ctaMatch[1].trim();
        const rawCtaUrl = ctaMatch[2].trim();
        const trackedCtaUrl = buildTrackingUrl(rawCtaUrl, { ...utmConfig, content: "inline_cta_button" });
        const calcWidth = Math.min(Math.max(ctaLabel.length * 11 + 60, 220), 400);
        const inlineButton = renderOutlookCtaButton({
          url: trackedCtaUrl,
          label: ctaLabel,
          bgColor: "#f59e0b",
          textColor: "#000000",
          fontSize: 14,
          fontWeight: 700,
          width: calcWidth,
          height: 48,
          borderRadius: 10,
        });
        htmlBodyLines.push(renderEmailCtaContainer(inlineButton, "center", "20px 0"));
      }
    } else if (line.includes("[PAYWALL_BREAK") || line.includes("<!-- paywall") || line.includes("<!-- PAYWALL")) {
      const paywallTrackedUrl = buildTrackingUrl("https://v5autoblog.com/vip", { ...utmConfig, content: "vip_paywall_button" });
      const paywallButton = renderOutlookCtaButton({
        url: paywallTrackedUrl,
        label: "Desbloquear Assinatura VIP →",
        bgColor: "#f59e0b",
        textColor: "#000000",
        fontSize: 13,
        fontWeight: 800,
        width: 260,
        height: 44,
        borderRadius: 8,
      });
      htmlBodyLines.push(
        `<div style="margin: 32px 0; padding: 24px 16px; border: 2px dashed #f59e0b; background-color: #fffbeb; border-radius: 12px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <p style="color: #92400e; font-weight: 800; font-size: 15px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Conteúdo Exclusivo de Assinantes VIP</p>
          <p style="color: #b45309; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">Este é o ponto de corte da prévia gratuita. Assine o plano VIP para liberar a leitura completa.</p>
          <div style="margin: 0 auto; text-align: center;">
            ${paywallButton}
          </div>
        </div>`
      );
    } else if (line === "---" || line === "***") {
      htmlBodyLines.push(
        `<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;" />`
      );
    } else if (line.startsWith("# ")) {
      htmlBodyLines.push(
        `<h1 style="color: #111827; font-size: 26px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatEmailInlineText(line.replace("# ", ""), "heading_h1_link")}</h1>`
      );
    } else if (line.startsWith("## ")) {
      htmlBodyLines.push(
        `<h2 style="color: #1f2937; font-size: 20px; font-weight: 700; line-height: 1.4; margin: 24px 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatEmailInlineText(line.replace("## ", ""), "heading_h2_link")}</h2>`
      );
    } else if (line.startsWith("### ")) {
      htmlBodyLines.push(
        `<h3 style="color: #374151; font-size: 17px; font-weight: 600; line-height: 1.4; margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatEmailInlineText(line.replace("### ", ""), "heading_h3_link")}</h3>`
      );
    } else if (line.startsWith("> ")) {
      htmlBodyLines.push(
        `<blockquote style="border-left: 4px solid #f59e0b; padding: 12px 18px; margin: 20px 0; background-color: #fffbeb; color: #92400e; font-style: italic; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.6;">${formatEmailInlineText(line.replace("> ", ""), "blockquote_link")}</blockquote>`
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      htmlBodyLines.push(
        `<li style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatEmailInlineText(line.substring(2), "bullet_list_link")}</li>`
      );
    } else if (/^\d+\.\s/.test(line)) {
      htmlBodyLines.push(
        `<li style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatEmailInlineText(line.replace(/^\d+\.\s/, ""), "numbered_list_link")}</li>`
      );
    } else {
      htmlBodyLines.push(
        `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${formatEmailInlineText(line, "paragraph_link")}</p>`
      );
    }
  }

  // URLs rastreadas para CTA e Rodapé Institucional
  const mainCtaUrl = buildTrackingUrl(`https://v5autoblog.com/artigo/${slug}`, { ...utmConfig, content: "cta_main_button" });
  const prefsUrl = buildTrackingUrl("https://v5apollo.com/preferencias", { ...utmConfig, content: "footer_preferences" });
  const unsubUrl = buildTrackingUrl("https://v5apollo.com/cancelar", { ...utmConfig, content: "footer_unsubscribe" });
  const privacyUrl = buildTrackingUrl("https://v5apollo.com/privacidade", { ...utmConfig, content: "footer_privacy" });
  const termsUrl = buildTrackingUrl("https://v5apollo.com/termos", { ...utmConfig, content: "footer_terms" });

  const mainCtaHtml = renderOutlookCtaButton({
    url: mainCtaUrl,
    label: "Ler Artigo Completo no Blog →",
    bgColor: "#f59e0b",
    textColor: "#000000",
    fontSize: 14,
    fontWeight: 700,
    width: 290,
    height: 48,
    borderRadius: 10,
  });

  const institutionalFooterHtml = renderInstitutionalEmailFooter({
    companyName: "Holding V5 Apollo",
    senderName: emailOptions.fromName || "Holding V5 Apollo",
    physicalAddress: emailOptions.footerAddress || "Holding V5 Apollo Ltda. • Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP 01310-100, Brasil",
    permissionReminder: emailOptions.permissionReminder || "Você está recebendo esta mensagem porque se inscreveu na newsletter oficial de inteligência e automação da Holding V5 Apollo através do portal AutoBlog ou de nossas capitanias parceiras.",
    unsubscribeUrl: unsubUrl,
    preferencesUrl: prefsUrl,
    privacyUrl: privacyUrl,
    termsUrl: termsUrl,
    currentYear: new Date().getFullYear(),
    enginePort: ":3011",
  });

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.emailOptions.subject || title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${preheaderBlock}

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

          <!-- Call to Action Button (Bulletproof Outlook MSO + Mobile) -->
          <tr>
            <td align="center" style="padding: 0 32px 36px 32px;">
              ${renderEmailCtaContainer(mainCtaHtml, "center", "0")}
            </td>
          </tr>

          <!-- Institutional Footer (CAN-SPAM, LGPD & RFC-8058 Compliance) -->
          ${institutionalFooterHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Extrai um resumo otimizado para a SERP do Google (150 a 160 caracteres)
 * Respeita limites de palavras para não cortar termos ao meio.
 */
export function extractOptimizedExcerpt(contentMarkdown: string, fallbackSummary?: string, maxChars: number = 158): string {
  if (fallbackSummary && fallbackSummary.trim().length >= 40 && fallbackSummary.trim().length <= maxChars) {
    return fallbackSummary.trim();
  }

  const clean = contentMarkdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/^[*\-+]\s+/gm, "")
    .replace(/[>_`*~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= maxChars) {
    return clean || fallbackSummary || "Artigo completo com diretrizes e insights exclusivos.";
  }

  const truncated = clean.substring(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 50 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

/**
 * Extrai os 3 principais insights acionáveis (Key Takeaways) para Answer Engine Optimization (Perplexity / ChatGPT Search)
 */
export function extractKeyTakeaways(contentMarkdown: string, title: string): string[] {
  const takeaways: string[] = [];
  const lines = contentMarkdown.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("- ") || line.startsWith("* ") || /^\d+\.\s+/.test(line)) {
      const cleanItem = line.replace(/^[-*]|\d+\.\s*/, "").replace(/[*_`]/g, "").trim();
      if (cleanItem.length > 25 && cleanItem.length < 150) {
        takeaways.push(cleanItem);
      }
    } else if (line.startsWith("## ")) {
      const cleanHeading = line.replace(/^##\s+/, "").replace(/[*_`]/g, "").trim();
      if (cleanHeading.length > 12 && !cleanHeading.toLowerCase().includes("conclusão")) {
        takeaways.push(`Análise aprofundada: ${cleanHeading}`);
      }
    }
    if (takeaways.length >= 3) break;
  }

  if (takeaways.length === 0) {
    takeaways.push(`Visão completa e estratégica sobre ${title}`);
    takeaways.push("Metodologia de aplicação prática e escalável");
    takeaways.push("Diretrizes de conformidade e integração com o ecossistema V5");
  }

  return takeaways.slice(0, 3);
}

/**
 * Converte Markdown puro em HTML semântico estruturado para o portal Web AutoBlog
 */
export function convertMarkdownToSemanticHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inList: "ul" | "ol" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        htmlParts.push(`</${inList}>`);
        inList = null;
      }
      continue;
    }

    // Paywall Gate Delimiter
    if (line.includes("[PAYWALL_BREAK") || line.toLowerCase().includes("<!-- paywall")) {
      if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
      htmlParts.push('<div class="v5-paywall-gate" data-paywall="true"><!-- PAYWALL_GATE_DELIMITER --></div>');
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
      const text = line.replace(/^###\s+/, "");
      htmlParts.push(`<h3 class="text-lg font-bold text-zinc-100 mt-6 mb-3">${formatInlineWeb(text)}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
      const text = line.replace(/^##\s+/, "");
      const id = slugify(text);
      htmlParts.push(`<h2 id="${id}" class="text-xl font-bold text-amber-400 mt-8 mb-4 border-b border-zinc-800 pb-2">${formatInlineWeb(text)}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
      const text = line.replace(/^#\s+/, "");
      htmlParts.push(`<h1 class="text-2xl font-black text-white mt-4 mb-4">${formatInlineWeb(text)}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
      const text = line.replace(/^>\s*/, "");
      htmlParts.push(`<blockquote class="border-l-4 border-amber-500 pl-4 py-1 my-4 italic text-zinc-300 bg-zinc-900/40 rounded-r-lg"><p>${formatInlineWeb(text)}</p></blockquote>`);
      continue;
    }

    // Unordered List (- or *)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (inList !== "ul") {
        if (inList) htmlParts.push(`</${inList}>`);
        htmlParts.push('<ul class="list-disc list-inside space-y-1.5 my-3 text-zinc-300">');
        inList = "ul";
      }
      const text = line.replace(/^[-*]\s+/, "");
      htmlParts.push(`<li>${formatInlineWeb(text)}</li>`);
      continue;
    }

    // Ordered List (1. )
    if (/^\d+\.\s+/.test(line)) {
      if (inList !== "ol") {
        if (inList) htmlParts.push(`</${inList}>`);
        htmlParts.push('<ol class="list-decimal list-inside space-y-1.5 my-3 text-zinc-300">');
        inList = "ol";
      }
      const text = line.replace(/^\d+\.\s+/, "");
      htmlParts.push(`<li>${formatInlineWeb(text)}</li>`);
      continue;
    }

    // Imagem: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
      const alt = imgMatch[1] || "Imagem ilustrativa";
      const src = imgMatch[2];
      htmlParts.push(`<figure class="my-6 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"><img src="${src}" alt="${alt}" class="w-full h-auto object-cover" /><figcaption class="p-2 text-center text-xs text-zinc-400 font-mono">${alt}</figcaption></figure>`);
      continue;
    }

    // Parágrafo Padrão
    if (inList) { htmlParts.push(`</${inList}>`); inList = null; }
    htmlParts.push(`<p class="leading-relaxed text-zinc-300 my-3">${formatInlineWeb(line)}</p>`);
  }

  if (inList) {
    htmlParts.push(`</${inList}>`);
  }

  return htmlParts.join("\n");
}

function formatInlineWeb(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-200">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 underline font-medium">$1</a>');
}

/**
 * Compila o payload estruturado exato para a API REST do V5 AutoBlog ou WordPress
 * Com tags SEO estendidas, Open Graph, Twitter Cards, Schema.org e AEO (Etapa 041)
 */
export function compileBlogPayload(payload: MultimodalDispatchPayload): V5AutoBlogPayload {
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
  const canonicalUrl = `https://v5autoblog.com/artigo/${slug}`;
  const nowIso = new Date().toISOString();
  
  const hasPaywall = payload.contentMarkdown.includes("[PAYWALL_BREAK") || 
                     payload.contentMarkdown.includes("<!-- paywall") ||
                     payload.contentMarkdown.includes("<!-- PAYWALL");
  const paywallIndex = hasPaywall 
    ? payload.contentMarkdown.search(/\[PAYWALL_BREAK|<!--\s*paywall/i) 
    : undefined;

  // Extração e Sanitização de Texto
  const cleanMarkdown = sanitizeMarkdown(payload.contentMarkdown);
  const contentHtml = convertMarkdownToSemanticHtml(cleanMarkdown);
  const excerpt = extractOptimizedExcerpt(cleanMarkdown, payload.summary || payload.emailOptions.previewText, 158);

  // Contagem de palavras e tempo de leitura
  const words = cleanMarkdown.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Imagem de destaque com dimensões canônicas (1200x630px para OG)
  const featuredImageUrl = payload.coverImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200";
  const featuredImageAlt = payload.coverImageAlt || payload.title;

  // Schema.org BlogPosting Completo (Google Rich Results Compliant)
  const schemaOrg: SchemaOrgBlogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: payload.title,
    description: excerpt,
    articleBody: cleanMarkdown,
    inLanguage: "pt-BR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    author: {
      "@type": "Person",
      name: payload.blogOptions.author || "Equipe V5 Apollo",
      url: "https://v5autoblog.com/autores/apollo-la-plata"
    },
    publisher: {
      "@type": "Organization",
      name: "Holding V5 Apollo",
      logo: {
        "@type": "ImageObject",
        url: "https://v5autoblog.com/logo.png"
      }
    },
    datePublished: nowIso,
    dateModified: nowIso,
    image: {
      "@type": "ImageObject",
      url: featuredImageUrl,
      width: 1200,
      height: 630
    },
    keywords: payload.blogOptions.tags.join(", "),
    wordCount,
    articleSection: payload.blogOptions.category || "Tecnologia"
  };

  // Open Graph Metadata
  const openGraph: OpenGraphMetadata = {
    og_title: `${payload.title} | V5 AutoBlog`,
    og_description: excerpt,
    og_url: canonicalUrl,
    og_type: "article",
    og_image: featuredImageUrl,
    og_image_alt: featuredImageAlt,
    og_site_name: "V5 AutoBlog",
    og_locale: "pt_BR",
    article_published_time: nowIso,
    article_modified_time: nowIso,
    article_author: payload.blogOptions.author || "Apollo La Plata",
    article_section: payload.blogOptions.category || "Tecnologia",
    article_tag: payload.blogOptions.tags
  };

  // Twitter Card Metadata
  const twitterCard: TwitterCardMetadata = {
    card: "summary_large_image",
    title: payload.title,
    description: excerpt,
    image: featuredImageUrl,
    creator: "@v5apollo",
    site: "@v5apollo"
  };

  // AI Search & AEO Readiness (Perplexity, ChatGPT, Gemini Citations)
  const keyTakeaways = extractKeyTakeaways(cleanMarkdown, payload.title);
  const aiSearch: AiSearchReadiness = {
    topic_cluster: payload.blogOptions.category || "Tecnologia",
    key_takeaways: keyTakeaways,
    content_freshness: "evergreen",
    citation_anchor: `${payload.title} - Análise por ${payload.blogOptions.author || "Equipe V5 Apollo"}`,
    direct_answer_summary: `${payload.title}: ${excerpt}`
  };

  // Montagem das Tags SEO Estendidas
  const seo: ExtendedSeoMetadata = {
    meta_title: `${payload.title} | V5 AutoBlog`,
    meta_description: excerpt,
    canonical_url: canonicalUrl,
    focus_keywords: payload.blogOptions.tags.slice(0, 5),
    reading_time_minutes: readingTimeMinutes,
    word_count: wordCount,
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    open_graph: openGraph,
    twitter_card: twitterCard,
    schema_org: schemaOrg,
    ai_search: aiSearch
  };

  return {
    id: payload.id || `post_${Date.now()}`,
    title: payload.title,
    slug,
    canonical_url: canonicalUrl,
    content: cleanMarkdown,
    content_html: contentHtml,
    excerpt,
    category: payload.blogOptions.category || "Tecnologia",
    tags: payload.blogOptions.tags || [],
    status: "publish",
    published_at: nowIso,
    updated_at: nowIso,
    author: {
      name: payload.blogOptions.author || "Apollo La Plata",
      role: "Editor Chefe & Arquiteto de Sistemas",
      avatarUrl: "https://v5autoblog.com/avatars/apollo.jpg",
      profileUrl: "https://v5autoblog.com/autores/apollo-la-plata"
    },
    featured_image: {
      url: featuredImageUrl,
      alt: featuredImageAlt,
      width: 1200,
      height: 630,
      caption: `Capa ilustrativa de ${payload.title}`
    },
    has_paywall: hasPaywall,
    paywall_index: paywallIndex,
    reading_time_minutes: readingTimeMinutes,
    word_count: wordCount,
    seo,
    target_platform: payload.blogOptions.targetPlatform || "v5autoblog",
    target_endpoint: payload.blogOptions.targetEndpoint || "https://v5autoblog.com/api/v1/posts",
    api_version: "v1.4-multimodal",
    dispatched_by: "Capitania #13: V5 Apollo Poster (:3011)"
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

/**
 * Retorna uma amostra de URLs rastreadas para exibição e cópia no inspetor UTM do editor
 */
export function getSampleTrackingUrls(slug: string, campaign?: string): { 
  ctaUrl: string; 
  vipUrl: string; 
  inlineUrl: string;
  source: string;
  medium: string;
  campaign: string;
} {
  const finalCampaign = campaign || slug || "newsletter_geral";
  const config: UtmConfig = {
    source: "v5poster",
    medium: "email_newsletter",
    campaign: finalCampaign,
  };
  return {
    source: config.source || "v5poster",
    medium: config.medium || "email_newsletter",
    campaign: finalCampaign,
    ctaUrl: buildTrackingUrl(`https://v5autoblog.com/artigo/${slug}`, { ...config, content: "cta_main_button" }),
    vipUrl: buildTrackingUrl("https://v5autoblog.com/vip", { ...config, content: "vip_paywall_button" }),
    inlineUrl: buildTrackingUrl(`https://v5autoblog.com/artigo/${slug}`, { ...config, content: "paragraph_link" }),
  };
}
