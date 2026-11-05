import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

export const alt = "Automação Gráfica & Despacho de Conteúdo • Holding V5 Apollo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#05070a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "200px",
            width: "800px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 64px",
            borderRadius: "32px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(10, 15, 25, 0.7)",
            maxWidth: "1000px",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              backgroundColor: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fb7185",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            V5 APOLLO POSTER • DESPACHO ONICANAL
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "18px",
              display: "flex",
              textAlign: "center",
            }}
          >
            Automação Gráfica & Despacho de Conteúdo
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              lineHeight: 1.4,
              maxWidth: "800px",
              marginBottom: "32px",
              textAlign: "center",
              display: "flex",
            }}
          >
            Agendamento de 30 dias, blog + newsletter dual publisher e comment-to-dm
          </div>

          {/* Footer Domains */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              color: "#64748b",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            <span>poster.v5apollo.com</span>
            <span>•</span>
            <span>Holding V5 Apollo</span>
            <span>•</span>
            <span>Soberania Digital</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
