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
    featured_image: payload.coverImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
    image_alt: payload.coverImageAlt || payload.title,
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
