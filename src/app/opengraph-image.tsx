import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "100dola — Sport. Komunita. Malaga.";
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
          padding: "80px",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #3B7CF4 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            opacity: 0.7,
            fontWeight: 700,
          }}
        >
          100dola
        </div>
        <div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Sport. Komunita.
            <br />
            Malaga.
          </div>
          <div
            style={{
              fontSize: 30,
              marginTop: 28,
              opacity: 0.7,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Vybavíme tě na sport, dostaneme tvé kolo do Malagy a propojíme
            tě s komunitou lidí, kteří to myslí vážně.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 22,
            fontWeight: 700,
            opacity: 0.85,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.15)",
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            100dola sport
          </span>
          <span
            style={{
              background: "rgba(232,67,26,0.7)",
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            100dola Malaga
          </span>
          <span
            style={{
              background: "rgba(46,170,110,0.7)",
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            Open Miles Clinic
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
