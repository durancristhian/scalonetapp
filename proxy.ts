import { NextResponse } from "next/server";
import { acceptRepresentation } from "@/utils/accept-representation";
import { publicResponse } from "@/server/public-response";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/partidos(.*)",
]);

const authenticatedMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  const headers = new Headers(req.headers);
  headers.delete("x-scalonet-markdown");
  if (
    ["GET", "HEAD"].includes(req.method) &&
    !headers.has("rsc") &&
    acceptRepresentation(headers.get("accept")) === "markdown"
  ) {
    headers.set("x-scalonet-markdown", "1");
  }
  return NextResponse.next({ request: { headers } });
});

export default async function proxy(
  ...args: Parameters<typeof authenticatedMiddleware>
) {
  const response = publicResponse(args[0]);
  if (response) return response;
  const result = await authenticatedMiddleware(...args);
  if (result && result instanceof Response)
    result.headers.append("Vary", "Accept");
  return result;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    {
      source: "/:path*",
      has: [
        {
          type: "header",
          key: "accept",
          value: ".*[mM][aA][rR][kK][dD][oO][wW][nN].*",
        },
      ],
    },
  ],
};
