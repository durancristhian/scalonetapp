import { isIP } from "node:net";
import { analyticsRequestSchema, analyticsWebsiteId } from "@/server/analytics";
import { ANALYTICS_PAGES } from "@/utils/analytics-events";

const response = (status: number, body: object = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const website = analyticsWebsiteId();
  if (!website) return response(200, { disabled: true });
  const origin = request.headers.get("origin");
  if (origin !== "https://www.scalonet.app" && origin !== "https://scalonet.app") return response(403);
  if (request.headers.get("dnt") === "1") return response(200, { disabled: true });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return response(415);
  const userAgent = request.headers.get("user-agent");
  if (!userAgent || userAgent.length > 1024) return response(400);
  if (Number(request.headers.get("content-length")) > 4096) return response(413);

  try {
    // Bound the actual stream as well: Content-Length is not trustworthy.
    const reader = request.body?.getReader();
    if (!reader) return response(400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return response(413);
      }
      chunks.push(value);
    }
    const parsed = analyticsRequestSchema.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!parsed.success) return response(400);
    const { payload } = parsed.data;
    if (payload.website !== website || payload.hostname !== new URL(origin).hostname ||
      payload.title !== ANALYTICS_PAGES[payload.url]) return response(400);

    const headers = new Headers({ "Content-Type": "application/json", "User-Agent": userAgent });
    // Vercel overwrites this header at its edge. Never forward arbitrary client headers/cookies.
    const ip = request.headers.get("x-vercel-forwarded-for");
    if (process.env.VERCEL === "1" && ip && isIP(ip)) headers.set("X-Forwarded-For", ip);
    const cache = request.headers.get("x-umami-cache");
    if (cache && cache.length <= 2048) headers.set("x-umami-cache", cache);
    const upstream = await fetch("https://gateway.umami.is/api/send", {
      method: "POST", headers, body: JSON.stringify(parsed.data),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000),
    });
    if (!upstream.ok) return response(502);
    const result = await upstream.json();
    return response(200, {
      ...(typeof result?.cache === "string" && result.cache.length <= 2048 ? { cache: result.cache } : {}),
      ...(result?.disabled === true ? { disabled: true } : {}),
    });
  } catch {
    // Do not log bodies, private page URLs, identifiers or upstream errors.
    return response(400);
  }
}
