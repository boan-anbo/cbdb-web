import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { WebDeploymentGuard } from './web-deployment.guard';
import { DeploymentConfig } from '../../config/deployment.config';

describe('WebDeploymentGuard', () => {
  let guard: WebDeploymentGuard;
  let deploymentConfig: DeploymentConfig;
  let context: ExecutionContext;

  beforeEach(() => {
    deploymentConfig = new DeploymentConfig();
    guard = new WebDeploymentGuard(deploymentConfig);

    // Mock ExecutionContext
    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          path: '/api/test',
        }),
      }),
    } as unknown as ExecutionContext;
  });

  describe('in electron mode', () => {
    beforeEach(() => {
      jest.spyOn(deploymentConfig, 'isWeb').mockReturnValue(false);
    });

    it('should allow all endpoints', () => {
      const mockRequest = { path: '/api/archive/status' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('in web mode', () => {
    beforeEach(() => {
      jest.spyOn(deploymentConfig, 'isWeb').mockReturnValue(true);
      jest.spyOn(deploymentConfig, 'getRestrictedEndpoints').mockReturnValue([
        '/api/archive',
        '/api/app-settings',
      ]);
    });

    it('should block archive endpoints', () => {
      const mockRequest = { path: '/api/archive/status' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'This endpoint is not available in web deployment mode'
      );
    });

    it('should block app-settings endpoints', () => {
      const mockRequest = { path: '/api/app-settings' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow non-restricted endpoints', () => {
      const mockRequest = { path: '/api/people/123' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow health endpoints', () => {
      const mockRequest = { path: '/api/health' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should handle paths without leading slash', () => {
      const mockRequest = { path: 'api/archive/test' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle undefined path gracefully', () => {
      const mockRequest = { path: undefined, url: '/api/people' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should handle empty path gracefully', () => {
      const mockRequest = { path: '' };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});