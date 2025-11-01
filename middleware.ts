import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'hi', 'kn'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true, // Enable locale detection
  alternateLinks: false
});

export default clerkMiddleware((auth, req: NextRequest) => {
  // Check for stored locale preference in cookie
  const preferredLocale = req.cookies.get('preferred-locale')?.value;
  
  if (preferredLocale && ['en', 'hi', 'kn'].includes(preferredLocale)) {
    // If we have a preferred locale and we're on root path, redirect to preferred locale
    if (req.nextUrl.pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = `/${preferredLocale}`;
      return Response.redirect(url);
    }
  }
  
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(hi|kn|en)/:path*',
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};