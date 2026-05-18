import { ImageResponse } from "next/og";

interface OgArgs {
  badge: string;
  headline: string;
  subline: string;
  gradient: string;
  accent: string;
}

export function buildOgImage({ badge, headline, subline, gradient, accent }: OgArgs) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: gradient,
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.8,
            fontWeight: 700,
          }}
        >
          {badge}
        </div>

        <div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              whiteSpace: "pre-line",
            }}
          >
            {headline}
          </div>
          <div
            style={{
              fontSize: 30,
              marginTop: 28,
              opacity: 0.75,
              maxWidth: 950,
              lineHeight: 1.4,
            }}
          >
            {subline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          <span
            style={{
              background: accent,
              padding: "10px 24px",
              borderRadius: 999,
              color: "#fff",
            }}
          >
            100dola
          </span>
          <span style={{ opacity: 0.6 }}>www.100dola.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
