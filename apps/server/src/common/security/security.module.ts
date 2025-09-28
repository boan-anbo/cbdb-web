import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../guards/custom-throttler.guard';
import { WebDeploymentGuard } from '../guards/web-deployment.guard';
import { DeploymentConfig } from '../../config/deployment.config';
import { RATE_LIMIT_CONFIG } from '../constants/security.constants';

/**
 * SecurityModule - Centralized security configuration
 *
 * This module encapsulates all security-related configurations and guards.
 * It provides:
 * 1. Rate limiting with intelligent IP detection
 * 2. Deployment mode-based endpoint protection
 *
 * To modify security settings:
 * - Rate limits: Edit security.constants.ts
 * - Protected endpoints: Edit deployment.config.ts
 * - IP detection: Edit custom-throttler.guard.ts
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: RATE_LIMIT_CONFIG.TTL,
      limit: RATE_LIMIT_CONFIG.LIMIT,
    }]),
  ],
  providers: [
    DeploymentConfig,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: WebDeploymentGuard,
    },
  ],
  exports: [DeploymentConfig],
})
export class SecurityModule {}