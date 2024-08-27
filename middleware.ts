import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/* IMPORTANT: We protect all routes in the application but the homepage. Instead of listing all potential routes/segments we specify the homepage as the protected route BUT we negate the if inside the clerkMiddleware */
const isProtectedRoute = createRouteMatcher(["/(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isProtectedRoute(req)) {
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
