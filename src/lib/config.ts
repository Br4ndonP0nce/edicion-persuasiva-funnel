// Configuration for the application

/**
 * Get the base URL for the application
 * Priority: NEXT_PUBLIC_BASE_URL -> VERCEL_URL -> localhost fallback
 */
export function getBaseUrl(): string {
  // 1. Check for explicit base URL (production/staging)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2. Check for Vercel URL (automatic deployment)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // 3. Check for Vercel URL without NEXT_PUBLIC_ prefix (server-side)
  if (typeof window === 'undefined' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4. Development fallback
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 5. Server-side fallback
  return 'http://localhost:3000';
}

/**
 * Generate a short URL for an ad link
 */
export function generateShortUrl(slug: string): string {
  return `${getBaseUrl()}/go/${slug}`;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}