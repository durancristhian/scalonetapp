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
        <div style={{ fontSize: 64, marginBottom: 24 }}>
          ¡Arma equipos como un campeón!
        </div>
        <div
          style={{
            /* text-muted-foreground */
            color: "#78716c",
            fontSize: 36,
          }}
        >
          Tienes lo necesario para ser el Lionel Scaloni entre tus amigos?
        </div>
        <div
          style={{
            /* text-muted-foreground */
            color: "#78716c",
            fontSize: 36,
          }}
        >
          Demostrá tu habilidad para formar equipos ideales.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            marginTop: 72,
          }}
        >
          scalonet.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
