export function GET() {
  return new Response(
    "# Página no encontrada\n\nLa página solicitada no existe en Scalonet.app. Revisá la dirección o consultá la [guía para agentes](/llms.txt) para encontrar las páginas públicas disponibles.\n",
    {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
        "Cache-Control": "private, no-store",
      },
    },
  );
}
