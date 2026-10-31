import { analyticsWebsiteId } from "@/server/analytics";

export async function GET() {
  if (!analyticsWebsiteId()) return new Response(null, { status: 404 });
  try {
    const upstream = await fetch("https://cloud.umami.is/script.js", {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });
    if (!upstream.ok) throw new Error("Tracker unavailable");
    return new Response(await upstream.text(), {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
