import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        background: "#f5f5f4",
        alignItems: "center",
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
        ¡Armá equipos como un campeón!
      </div>
      <div
        style={{
          color: "#78716c",
          fontSize: 36,
        }}
      >
        ¿Tenés lo necesario para ser el Lionel Scaloni entre tus amigos?
      </div>
      <div
        style={{
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
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
