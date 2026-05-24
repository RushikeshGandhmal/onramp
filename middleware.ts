import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Auth gate.
 *
 * Everything under /app/* requires sign-in. Marketing (/), pricing/roadmap,
 * /sign-in, /sign-up, /privacy, /terms, /status are public.
 *
 * If Clerk env vars aren't set (local dev without Clerk), middleware
 * short-circuits so the app still boots and contributors can hack on
 * other things without setting up auth.
 */

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

export default clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (!isProtectedRoute(req)) return;
      const { userId } = await auth();
      if (!userId) {
        // Manual redirect to our themed /sign-in page (auth.protect() rewrites
        // to a Clerk-internal /clerk_* URL that 404s with custom sign-in pages).
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set(
          "redirect_url",
          req.nextUrl.pathname + req.nextUrl.search
        );
        return NextResponse.redirect(signInUrl);
      }
    })
  : function passthrough() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    // Skip Next.js internals and all static files (mirrors Clerk's recommended matcher)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
};
