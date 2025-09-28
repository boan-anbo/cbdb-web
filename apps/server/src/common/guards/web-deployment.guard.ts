import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DeploymentConfig } from '../../config/deployment.config';

/**
 * WebDeploymentGuard - Endpoint protection based on deployment mode
 *
 * Purpose: Prevent file system and sensitive operations in web deployments
 *
 * Problem Solved:
 * - Electron app needs full file system access (extract archives, manage settings)
 * - Web deployment should NOT have file system access (security risk)
 * - Same codebase serves both deployment modes
 *
 * Solution:
 * - Automatically detect deployment mode (web/electron/development)
 * - Block sensitive endpoints when running in web mode
 * - Allow everything in electron mode (desktop app)
 *
 * Protected Endpoints (web mode):
 * - /api/archive/* - Archive extraction, file operations
 * - /api/app-settings/* - Local app settings management
 *
 * Deployment Modes:
 * - electron: Desktop app, full access (DEPLOYMENT_MODE=electron)
 * - web: Browser access, restricted (DEPLOYMENT_MODE=web)
 * - development: Local dev, configurable (default)
 *
 * How to Add More Protected Endpoints:
 * 1. Edit src/config/deployment.config.ts
 * 2. Add path to getRestrictedEndpoints() array
 * 3. Restart server
 *
 * Example Response (web mode):
 * GET /api/archive/status → 403 Forbidden
 * {
 *   "statusCode": 403,
 *   "message": "This endpoint is not available in web deployment mode"
 * }
 */
@Injectable()
export class WebDeploymentGuard implements CanActivate {
  constructor(private deploymentConfig: DeploymentConfig) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow everything in non-web modes
    if (!this.deploymentConfig.isWeb()) {
      return true;
    }

    // In web mode, check if the route is restricted
    const request = context.switchToHttp().getRequest();
    const path = request.path || request.url || '';

    // Ensure path starts with / for consistent comparison
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Check if this path is in the restricted list
    const restrictedPaths = this.deploymentConfig.getRestrictedEndpoints();
    const isRestricted = restrictedPaths.some(restricted =>
      normalizedPath.startsWith(restricted)
    );

    if (isRestricted) {
      throw new ForbiddenException(
        'This endpoint is not available in web deployment mode'
      );
    }

    return true;
  }
}