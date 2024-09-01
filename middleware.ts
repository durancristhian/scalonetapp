import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/* We protect all routes in the application but the homepage and /download */
const isPublicRoute = createRouteMatcher((req) => {
  const pathname = req.nextUrl.pathname;

  return pathname === "/" || pathname.includes("download");
});

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    /* Skip Next.js internals and all static files, unless found in search params */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    /* Always run for API routes */
    "/(api|trpc)(.*)",
  ],
};
