export interface AppPaths {
  userData: string;
  temp: string;
  appData: string;
  home: string;
  documents: string;
  downloads: string;
  desktop: string;
  exe: string;
  module: string;
}

export interface CbdbPaths {
  userDataPath: string;
  databasesDir: string;
  cbdbDir: string;
  extractedDb: string;
  appDb: string;
  logs: string;
  cache: string;
}

export interface ArchiveInfo {
  archive: {
    path: string;
    exists: boolean;
    size: number;
    sizeFormatted: string;
  };
  extracted: {
    path: string;
    exists: boolean;
    size: number;
    sizeFormatted: string;
  };
}

export interface ElectronAPI {
  // Database operations
  reinitializeDatabase: () => Promise<void>;

  // File system operations
  getAppPaths: () => Promise<AppPaths>;
  getCbdbPaths: () => Promise<CbdbPaths>;
  getArchiveInfo: () => Promise<ArchiveInfo>;
  openInExplorer: (path: string) => Promise<boolean>;
  revealInExplorer: (path: string) => Promise<boolean>;
  openArchiveLocation: () => Promise<boolean>;
  openExtractedLocation: () => Promise<boolean>;
  checkFileExists: (path: string) => Promise<boolean>;
  ensureDirectory: (path: string) => Promise<boolean>;
  extract7z: (archivePath: string, outputPath: string, onProgress?: (progress: {
    type: 'progress';
    phase: 'analyzing' | 'extracting' | 'copying';
    current: number;
    total: number;
    percentage: number;
    currentFile?: string;
    message?: string;
  }) => void) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    exitCode?: number;
  }>;

  // Server information
  getServerPort: () => Promise<number | null>;
  getServerUrl: () => Promise<string | null>;
  getApiUrl: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};