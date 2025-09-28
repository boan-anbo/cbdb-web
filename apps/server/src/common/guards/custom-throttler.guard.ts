import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { extractClientIp, shouldBypassRateLimit } from './throttler.utils';
import { RATE_LIMIT_CONFIG } from '../constants/security.constants';

/**
 * CustomThrottlerGuard - Intelligent rate limiting with real IP detection
 *
 * Purpose: Implement per-IP rate limiting for web deployment scenarios
 *
 * Problem Solved:
 * - In web deployments, the server often sits behind Cloudflare or proxies
 * - Without proper IP extraction, all users would share the same rate limit
 * - This would mean one abusive user could lock out everyone else
 *
 * Solution:
 * - Extract real IP from various headers in priority order
 * - Each IP gets its own independent rate limit quota
 * - 100 users = 100 separate quotas, no interference
 *
 * Configuration (set in app.module.ts):
 * - Limit: 30 requests per minute
 * - Window: 60 seconds
 * - Storage: In-memory (default)
 *
 * IP Detection Priority:
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. X-Forwarded-For (standard proxy, take first IP)
 * 3. X-Real-IP (nginx proxy)
 * 4. request.ip (direct connection fallback)
 *
 * Special Cases:
 * - Health check endpoints (/api/health) bypass rate limiting
 * - This prevents monitoring systems from being blocked
 *
 * Example Headers:
 * - Cloudflare: CF-Connecting-IP: 1.2.3.4
 * - Proxy chain: X-Forwarded-For: 1.2.3.4, 10.0.0.1, 172.16.0.1
 * - Nginx: X-Real-IP: 1.2.3.4
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Override to extract the real IP from various headers
   * Priority order:
   * 1. CF-Connecting-IP (Cloudflare)
   * 2. X-Forwarded-For (standard proxy)
   * 3. X-Real-IP (nginx)
   * 4. request.ip (fallback)
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const fallbackIp = req.ip || req.connection?.remoteAddress;
    return extractClientIp(req.headers, fallbackIp);
  }

  /**
   * Override to skip rate limiting for health check endpoints
   * This prevents monitoring systems from being rate limited
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.path || request.url || '';

    // Skip rate limiting for configured bypass endpoints
    if (shouldBypassRateLimit(path, [...RATE_LIMIT_CONFIG.BYPASS_ENDPOINTS])) {
      return true;
    }

    return super.shouldSkip(context);
  }
}