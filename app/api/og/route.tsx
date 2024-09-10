import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          /* bg-accent */
          background: "#f5f5f4",
          alignItems: "center",
          /* text-foreground */
          color: "#0c0a09",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 16,
          textAlign: "center",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 96 }}>scalonet.app</div>
        <div
          style={{
            /* text-muted-foreground */
            color: "#78716c",
            fontSize: 60,
          }}
        >
          ¡Arma equipos como un campeón!
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            marginTop: 96,
          }}
        >
          Hecho por Cristhian Duran
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
