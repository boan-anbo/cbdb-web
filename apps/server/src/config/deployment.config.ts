import { Injectable } from '@nestjs/common';

export type DeploymentMode = 'electron' | 'web' | 'development';

/**
 * DeploymentConfig - Centralized deployment mode configuration
 *
 * Purpose: Manage feature availability based on deployment context
 *
 * Core Concept:
 * - Same codebase serves both Electron desktop app and web browser
 * - Features like file operations are desktop-only (security)
 * - Automatic detection based on runtime environment
 *
 * Detection Logic (in order):
 * 1. Check DEPLOYMENT_MODE environment variable (explicit)
 * 2. Check for Electron runtime (process.versions.electron)
 * 3. Check NODE_ENV for development
 * 4. Default to 'web' for safety
 *
 * Feature Matrix:
 * | Feature          | Electron | Web   | Development |
 * |-----------------|----------|-------|-------------|
 * | Archive Ops     | ✅       | ❌    | Configurable |
 * | File Paths      | ✅       | ❌    | ✅          |
 * | App Settings    | ✅       | ❌    | ✅          |
 * | CBDB Access     | ✅       | ✅    | ✅          |
 *
 * Usage:
 * - Guards use this to block endpoints
 * - Services use this to hide file paths
 * - Controllers use this to modify responses
 *
 * Environment Variables:
 * - DEPLOYMENT_MODE: 'electron' | 'web' | 'development'
 * - ENABLE_ARCHIVE_FEATURES: 'true' | 'false' (override)
 */
@Injectable()
export class DeploymentConfig {
  private mode: DeploymentMode;
  private readonly isElectronRuntime: boolean;

  constructor() {
    // Detect if running in Electron runtime
    this.isElectronRuntime = !!(process.versions as any)?.electron;

    // Determine deployment mode
    this.mode = this.detectDeploymentMode();
  }

  private detectDeploymentMode(): DeploymentMode {
    // First check environment variable
    const envMode = process.env.DEPLOYMENT_MODE as DeploymentMode;
    if (envMode && ['electron', 'web', 'development'].includes(envMode)) {
      return envMode;
    }

    // Auto-detect based on runtime
    if (this.isElectronRuntime) {
      return 'electron';
    }

    // Check if running in development
    if (process.env.NODE_ENV === 'development') {
      return 'development';
    }

    // Default to web for production without Electron
    return 'web';
  }

  getMode(): DeploymentMode {
    return this.mode;
  }

  isElectron(): boolean {
    return this.mode === 'electron';
  }

  isWeb(): boolean {
    return this.mode === 'web';
  }

  isDevelopment(): boolean {
    return this.mode === 'development';
  }

  /**
   * Check if archive features should be enabled
   * Only enabled in Electron mode or development with explicit flag
   */
  isArchiveEnabled(): boolean {
    // Check explicit environment flag first
    if (process.env.ENABLE_ARCHIVE_FEATURES === 'true') {
      return true;
    }
    if (process.env.ENABLE_ARCHIVE_FEATURES === 'false') {
      return false;
    }

    // Default: only enable in Electron mode
    return this.mode === 'electron';
  }

  /**
   * Check if file system paths should be exposed
   * Never expose in web mode
   */
  shouldExposeFilePaths(): boolean {
    return this.mode !== 'web';
  }

  /**
   * Get database path based on deployment mode
   */
  getDatabasePath(): string | null {
    if (this.mode === 'electron') {
      // In Electron, the database will be extracted
      // Path will be determined by ArchiveExtractionService
      return null;
    }

    // In web/development, use environment variable
    return process.env.CBDB_PATH || null;
  }

  /**
   * Get list of endpoints that should be restricted in web mode
   * These endpoints involve file system operations or sensitive settings
   */
  getRestrictedEndpoints(): string[] {
    return [
      '/api/archive',      // All archive operations
      '/api/app-settings', // App settings management
      // Add more sensitive endpoints here as needed
    ];
  }

  /**
   * Get configuration summary for logging
   */
  getConfigSummary(): Record<string, any> {
    return {
      mode: this.mode,
      isElectronRuntime: this.isElectronRuntime,
      archiveEnabled: this.isArchiveEnabled(),
      exposeFilePaths: this.shouldExposeFilePaths(),
      restrictedEndpoints: this.isWeb() ? this.getRestrictedEndpoints() : [],
      nodeEnv: process.env.NODE_ENV,
      deploymentMode: process.env.DEPLOYMENT_MODE || 'auto-detected',
    };
  }
}