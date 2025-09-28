/**
 * Deployment mode detection for frontend
 */
export type DeploymentMode = 'electron' | 'web' | 'development';

/**
 * Detect the current deployment mode
 */
export function getDeploymentMode(): DeploymentMode {
  // Check if running in Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    return 'electron';
  }

  // Check environment variable (for builds)
  if (typeof process !== 'undefined' && process.env.DEPLOYMENT_MODE) {
    return process.env.DEPLOYMENT_MODE as DeploymentMode;
  }

  // Check if in development (Storybook or localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
  }

  // Default to web
  return 'web';
}

/**
 * Check if archive features should be enabled
 */
export function isArchiveEnabled(): boolean {
  const mode = getDeploymentMode();

  // Only enable in Electron or development mode
  return mode === 'electron' || mode === 'development';
}

/**
 * Check if running in Electron
 */
export function isElectron(): boolean {
  return getDeploymentMode() === 'electron';
}

/**
 * Check if running in web deployment
 */
export function isWeb(): boolean {
  return getDeploymentMode() === 'web';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getDeploymentMode() === 'development';
}