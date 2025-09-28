/**
 * Utility functions for handling static assets in both development and production environments
 */

/**
 * Get the correct URL for a public asset that works in both development and production
 *
 * In development: Uses the path as-is (Vite dev server handles it)
 * In production Electron: Constructs relative path from the base URL
 *
 * @param path - The path to the asset (e.g., '/data/chgis/chgis_counties.json')
 * @returns The correct URL to fetch the asset
 */
export function getPublicAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // In development, Vite serves from root
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }

  // In production, use relative path from base URL
  // The base URL is './' as configured in vite.config.mts
  // This works with both file:// protocol and http://
  const baseUrl = import.meta.env.BASE_URL || './';

  // Ensure proper path joining
  if (baseUrl.endsWith('/')) {
    return `${baseUrl}${cleanPath}`;
  } else {
    return `${baseUrl}/${cleanPath}`;
  }
}

/**
 * Check if we're running in Electron environment
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' &&
         window.electronAPI !== undefined;
}

/**
 * Load a JSON asset with proper error handling
 */
export async function loadJsonAsset<T>(path: string): Promise<T> {
  const url = getPublicAssetUrl(path);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load asset: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error loading asset from ${url}:`, error);
    throw error;
  }
}