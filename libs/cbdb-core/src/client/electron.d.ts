/**
 * Type declarations for Electron API exposed to renderer process
 */

export interface ElectronAPI {
  getServerUrl: () => Promise<string>;
  getApiUrl?: () => Promise<string>;  // Optional - for newer versions that expose API URL directly
  onServerReady: (callback: () => void) => void;
  removeServerReadyListener: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}