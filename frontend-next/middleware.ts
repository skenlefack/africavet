import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGUAGES = ['fr', 'en'];
const DEFAULT_LANGUAGE = 'fr';

// Paths that should not be processed by the middleware
const PUBLIC_FILE_REGEX = /\.(.*)$/;
const EXCLUDED_PATHS = ['/api', '/uploads', '/_next', '/images', '/favicon'];

// Legacy URL redirects mapping (old path -> new path)
const LEGACY_REDIRECTS: Record<string, string> = {
  '/oh-elearning': '/vet-elearning',
  '/ohwr-mapping': '/vet-link',
  '/cohrm-system': '/vet-alert',
  '/cohrm': '/vet-alert',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and other excluded paths
  if (
    PUBLIC_FILE_REGEX.test(pathname) ||
    EXCLUDED_PATHS.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Check if the path already starts with a supported language
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Handle legacy URL redirects
  // Check if the second segment (after language) is a legacy path
  if (SUPPORTED_LANGUAGES.includes(firstSegment) && pathSegments.length >= 2) {
    const secondSegment = '/' + pathSegments[1];
    const legacyKey = Object.keys(LEGACY_REDIRECTS).find(key => secondSegment.startsWith(key));

    if (legacyKey) {
      const newPath = LEGACY_REDIRECTS[legacyKey];
      const remainingPath = secondSegment.slice(legacyKey.length);
      const url = request.nextUrl.clone();
      url.pathname = `/${firstSegment}${newPath}${remainingPath}`;
      return NextResponse.redirect(url, { status: 301 });
    }
  }

  // Also check for legacy paths without language prefix
  const legacyKeyNoLang = Object.keys(LEGACY_REDIRECTS).find(key => pathname.startsWith(key));
  if (legacyKeyNoLang && !SUPPORTED_LANGUAGES.includes(firstSegment)) {
    const newPath = LEGACY_REDIRECTS[legacyKeyNoLang];
    const remainingPath = pathname.slice(legacyKeyNoLang.length);
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANGUAGE}${newPath}${remainingPath}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
    // Path already has a valid language prefix
    return NextResponse.next();
  }

  // Need to redirect to a language-prefixed path
  let targetLanguage = DEFAULT_LANGUAGE;

  // Try to get default language from settings API
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const settingsResponse = await fetch(`${backendUrl}/api/settings/public`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      if (settingsData.success && settingsData.data?.default_language) {
        const dbLang = settingsData.data.default_language;
        if (SUPPORTED_LANGUAGES.includes(dbLang)) {
          targetLanguage = dbLang;
        }
      }
    }
  } catch (error) {
    // Silently fail and use default language
    console.warn('Failed to fetch default language from settings:', error);
  }

  // Check Accept-Language header as fallback
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(preferredLang)) {
      // Only use browser language if no database setting was found
      // (targetLanguage is still DEFAULT_LANGUAGE means DB fetch failed or no setting)
      if (targetLanguage === DEFAULT_LANGUAGE) {
        targetLanguage = preferredLang;
      }
    }
  }

  // Redirect to the language-prefixed path
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLanguage}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - uploads (uploaded files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
};
