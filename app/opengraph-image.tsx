import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "On-Ramp — Find your next OSS issue in 10 seconds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(91,140,255,0.30), transparent 60%), linear-gradient(135deg,#0a0a0f 0%, #0e1020 60%, #0a0a0f 100%)",
          color: "#e8e8f0",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        }}
      >
        {/* top: logo + pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: -0.3
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg,#3fb950,#58a6ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                color: "white"
              }}
            >
              On
            </div>
            <span>On-Ramp</span>
          </div>
        </div>

        {/* middle: tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 1040,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <span>Find your next OSS issue</span>
            <span
              style={{
                background: "linear-gradient(135deg,#a78bff 0%, #6db7ff 100%)",
                backgroundClip: "text",
                color: "transparent"
              }}
            >
              in 10 seconds.
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#9ca3af",
              maxWidth: 880,
              lineHeight: 1.4
            }}
          >
            Type what you want to work on. We hand you the right open-source
            issue with an AI explanation in seconds.
          </div>
        </div>

        {/* bottom: meta row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#9ca3af"
          }}
        >
          <div style={{ display: "flex", gap: 28 }}>
            <span>· 54+ curated repos</span>
            <span>· Any repo on demand</span>
            <span>· AI explanations</span>
          </div>
          <div style={{ color: "#6db7ff", fontWeight: 600 }}>on-ramp.dev</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
