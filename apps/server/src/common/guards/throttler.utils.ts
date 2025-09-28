/**
 * Utility functions for IP extraction and rate limiting
 */

/**
 * Extract the real client IP from request headers
 * @param headers - Request headers object
 * @returns The extracted IP address or 'unknown'
 */
export function extractClientIp(headers: Record<string, any>, fallbackIp?: string): string {
  // Cloudflare header (highest priority)
  const cfIp = headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string') {
    return cfIp;
  }

  // X-Forwarded-For header (can contain multiple IPs)
  const xForwardedFor = headers['x-forwarded-for'];
  if (xForwardedFor && typeof xForwardedFor === 'string') {
    // Take the first IP from comma-separated list
    const firstIp = xForwardedFor.split(',')[0];
    return firstIp ? firstIp.trim() : fallbackIp || 'unknown';
  }

  // X-Real-IP header
  const xRealIp = headers['x-real-ip'];
  if (xRealIp && typeof xRealIp === 'string') {
    return xRealIp;
  }

  // Fallback to provided IP or 'unknown'
  return fallbackIp || 'unknown';
}

/**
 * Check if a path should bypass rate limiting
 * @param path - Request path
 * @param bypassPaths - List of paths to bypass
 * @returns true if the path should bypass rate limiting
 */
export function shouldBypassRateLimit(path: string, bypassPaths: string[]): boolean {
  if (!path) return false;

  const normalizedPath = path.toLowerCase();
  return bypassPaths.some(bypassPath =>
    normalizedPath.startsWith(bypassPath.toLowerCase())
  );
}

/**
 * Normalize a request path for comparison
 * @param path - Raw request path
 * @returns Normalized path with leading slash
 */
export function normalizePath(path: string | undefined | null): string {
  if (!path) return '/';
  const trimmed = path.trim();
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}