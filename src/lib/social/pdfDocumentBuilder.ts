/**
 * pdfDocumentBuilder.ts - Gerador Nativo de PDF Multi-Páginas para Carrosséis do LinkedIn
 * Capitania #13: V5 Apollo Poster (:3011)
 *
 * Constrói documentos PDF 1.4 de altíssima qualidade diretamente no navegador,
 * sem bibliotecas pesadas de terceiros (zero dependências extras).
 * Permite que carrosséis em formato 4:5 ou 1:1 sejam postados como "Document Posts"
 * no LinkedIn, maximizando alcance orgânico, tempo de tela e compartilhamento.
 */

export interface PdfImagePage {
  jpegBytes: Uint8Array;
  width: number;
  height: number;
}

/**
 * Converte uma DataURL base64 (gerada pelo canvas HTML5) em Uint8Array binário
 */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Index = dataUrl.indexOf(",");
  const base64 = base64Index >= 0 ? dataUrl.slice(base64Index + 1) : dataUrl;
  const binaryString = typeof window !== "undefined" && window.atob ? window.atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Constrói um arquivo binário PDF 1.4 multi-páginas compatível com o LinkedIn Document Posts
 */
export function buildMultiPagePdf(pages: PdfImagePage[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let currentOffset = 0;
  const offsets: number[] = [0];

  function writeAscii(str: string) {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  }

  function writeBytes(bytes: Uint8Array) {
    chunks.push(bytes);
    currentOffset += bytes.length;
  }

  // 1. PDF Header 1.4 (com bytes binários para forçar modo binário em proxies e parsers)
  writeAscii("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  const totalPages = pages.length;
  const catalogObjId = 1;
  const pagesObjId = 2;

  // Objeto 1: Catálogo Raiz
  offsets[catalogObjId] = currentOffset;
  writeAscii(`${catalogObjId} 0 obj\n<< /Type /Catalog /Pages ${pagesObjId} 0 R >>\nendobj\n`);

  // Lista de referências de páginas (Kids)
  const kids: string[] = [];
  for (let i = 0; i < totalPages; i++) {
    const pageObjId = 3 + i * 3;
    kids.push(`${pageObjId} 0 R`);
  }

  // Objeto 2: Árvore de Páginas
  offsets[pagesObjId] = currentOffset;
  writeAscii(`${pagesObjId} 0 obj\n<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${totalPages} >>\nendobj\n`);

  // Montagem de cada página
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const pageObjId = 3 + i * 3;
    const contentObjId = pageObjId + 1;
    const imageObjId = pageObjId + 2;

    // Objeto de Página
    offsets[pageObjId] = currentOffset;
    writeAscii(
      `${pageObjId} 0 obj\n` +
      `<< /Type /Page\n` +
      `   /Parent ${pagesObjId} 0 R\n` +
      `   /MediaBox [0 0 ${page.width} ${page.height}]\n` +
      `   /Resources <<\n` +
      `     /ProcSet [/PDF /ImageC]\n` +
      `     /XObject << /Im1 ${imageObjId} 0 R >>\n` +
      `   >>\n` +
      `   /Contents ${contentObjId} 0 R\n` +
      `>>\nendobj\n`
    );

    // Objeto Stream de Conteúdo (Posiciona e escala a imagem no tamanho da página)
    const contentStream = `q\n${page.width} 0 0 ${page.height} 0 0 cm\n/Im1 Do\nQ\n`;
    offsets[contentObjId] = currentOffset;
    writeAscii(
      `${contentObjId} 0 obj\n` +
      `<< /Length ${contentStream.length} >>\n` +
      `stream\n${contentStream}\nendstream\nendobj\n`
    );

    // Objeto de Imagem XObject (DCTDecode para JPEG de alta performance)
    offsets[imageObjId] = currentOffset;
    writeAscii(
      `${imageObjId} 0 obj\n` +
      `<< /Type /XObject\n` +
      `   /Subtype /Image\n` +
      `   /Width ${page.width}\n` +
      `   /Height ${page.height}\n` +
      `   /ColorSpace /DeviceRGB\n` +
      `   /BitsPerComponent 8\n` +
      `   /Filter /DCTDecode\n` +
      `   /Length ${page.jpegBytes.length}\n` +
      `>>\nstream\n`
    );
    writeBytes(page.jpegBytes);
    writeAscii(`\nendstream\nendobj\n`);
  }

  // Tabela de Referências Cruzadas (XRef)
  const xrefOffset = currentOffset;
  const totalObjects = 2 + totalPages * 3;
  writeAscii(`xref\n0 ${totalObjects + 1}\n`);
  writeAscii(`0000000000 65535 f \n`);
  for (let obj = 1; obj <= totalObjects; obj++) {
    const off = offsets[obj] || 0;
    const padded = off.toString().padStart(10, "0");
    writeAscii(`${padded} 00000 n \n`);
  }

  // Trailer do Documento
  writeAscii(
    `trailer\n` +
    `<< /Size ${totalObjects + 1}\n` +
    `   /Root ${catalogObjId} 0 R\n` +
    `>>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`
  );

  // Consolidação de todos os buffers binários
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const c of chunks) {
    result.set(c, pos);
    pos += c.length;
  }
  return result;
}

/**
 * Converte múltiplos elementos HTMLCanvasElement renderizados em um arquivo PDF multi-páginas e dispara o download
 */
export function downloadCanvasesAsPdf(
  canvases: HTMLCanvasElement[],
  filename: string
): void {
  if (typeof window === "undefined" || canvases.length === 0) return;

  const pages: PdfImagePage[] = canvases.map((canvas) => {
    // Exporta em JPEG com 94% de qualidade para manter altíssima fidelidade com tamanho otimizado
    const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
    const jpegBytes = dataUrlToUint8Array(dataUrl);
    return {
      jpegBytes,
      width: canvas.width,
      height: canvas.height
    };
  });

  const pdfBytes = buildMultiPagePdf(pages);
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Libera a memória do objeto URL após 1 segundo
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
