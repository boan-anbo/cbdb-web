import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { CbdbModule } from './db/cbdb.module';
import { PersonModule } from './person/person.module';
import { HealthModule } from './health/health.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ServerModule } from './server/server.module';
import { WebDeploymentGuard } from './common/guards/web-deployment.guard';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { DeploymentConfig } from './config/deployment.config';
import { RATE_LIMIT_CONFIG } from './common/constants/security.constants';

/**
 * AppModule - Main application module with security features for web deployment
 *
 * Security Features Implemented:
 *
 * 1. RATE LIMITING
 *    - Purpose: Prevent any single user from overwhelming the server
 *    - Implementation: @nestjs/throttler with CustomThrottlerGuard
 *    - Configuration: 200 requests per minute per IP address (3.3 req/sec)
 *    - Behavior:
 *      * Each IP has independent quota (not shared)
 *      * Returns HTTP 429 when limit exceeded
 *      * Supports Cloudflare (CF-Connecting-IP header)
 *      * Supports proxies (X-Forwarded-For, X-Real-IP)
 *      * Health check endpoints bypass rate limiting
 *
 * 2. DEPLOYMENT MODE PROTECTION
 *    - Purpose: Restrict sensitive endpoints in web deployment
 *    - Implementation: WebDeploymentGuard
 *    - Protected endpoints in web mode:
 *      * /api/archive/* - File system operations
 *      * /api/app-settings/* - Application settings
 *    - Deployment modes:
 *      * electron: Full access to all endpoints
 *      * web: Restricted access (no file operations)
 *      * development: Configurable via environment
 *
 * Why This Approach:
 * - Simple: No user authentication system needed
 * - Effective: Prevents basic abuse and protects sensitive operations
 * - Scalable: Works for 5-100 concurrent users (demo/small deployment)
 * - Independent: Each user has their own rate limit quota
 *
 * Testing:
 * ```bash
 * # Test rate limiting (should see 429 after 30 requests)
 * for i in {1..35}; do
 *   curl -s -o /dev/null -w "Request $i: %{http_code}\n" http://localhost:18019/api/people/1762
 * done
 *
 * # Test web mode restrictions
 * DEPLOYMENT_MODE=web npm run start:dev
 * curl http://localhost:18019/api/archive/status  # Returns 403
 * ```
 */

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting configuration - simple and effective
    ThrottlerModule.forRoot([{
      ttl: RATE_LIMIT_CONFIG.TTL,     // Time window (see security.constants.ts to change)
      limit: RATE_LIMIT_CONFIG.LIMIT,  // Request limit (see security.constants.ts to change)
    }]),
    ServerModule,  // Server info and runtime information
    DbModule,      // App database
    CbdbModule,    // CBDB database
    // Removed: UsersModule, AppSettingsModule, ArchiveModule - not needed for production
    AnalyticsModule, // Analytics capabilities (graph, future: statistics, ML, etc.)
    PersonModule,  // All CBDB repositories and services
    HealthModule,  // Health monitoring endpoints
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DeploymentConfig,
    // Apply custom throttling globally (with Cloudflare IP support)
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // Apply web deployment restrictions globally
    {
      provide: APP_GUARD,
      useClass: WebDeploymentGuard,
    },
  ],
})
export class AppModule {}
