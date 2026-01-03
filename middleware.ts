import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// ✅ Internationalization setup
const intlMiddleware = createMiddleware({
  locales: ["en", "hi", "kn"],          // supported locales
  defaultLocale: "en",                  // fallback locale
  localePrefix: "always",               // always include the locale in the URL
  localeDetection: true,                // detect from headers or cookies
  alternateLinks: false,
});

// ✅ Combined Clerk + next-intl middleware
export default clerkMiddleware((auth, req: NextRequest) => {
  const preferredLocale = req.cookies.get("preferred-locale")?.value;

  // If a preferred locale cookie exists, redirect root `/` → `/<locale>`
  if (preferredLocale && ["en", "hi", "kn"].includes(preferredLocale)) {
    if (req.nextUrl.pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = `/${preferredLocale}`;
      return NextResponse.redirect(url); // ✅ Must return a NextResponse
    }
  }

  // ✅ Pass through to next-intl or continue normally
  return intlMiddleware(req) ?? NextResponse.next();
});

// ✅ Matcher and runtime configuration
export const config = {
  matcher: [
    "/",                                 // home
    "/(hi|kn|en)/:path*",                // localized routes
    "/((?!_next|_vercel|.*\\..*).*)",   // exclude static files and internals
  ],
  runtime: "nodejs",                     // ✅ stable for Clerk + next-intl
};
