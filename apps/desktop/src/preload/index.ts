import { contextBridge, ipcRenderer } from 'electron'

// Legacy electron API
contextBridge.exposeInMainWorld(
  'electron',
  {
    sendMsg: (msg: string): Promise<string> => ipcRenderer.invoke('msg', msg),
    onReplyMsg: (cb: (msg: string) => any) => ipcRenderer.on('reply-msg', (e, msg: string) => {
      cb(msg)
    }),
  },
)

// Main Electron API
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  reinitializeDatabase: () => ipcRenderer.invoke('app:reload'),

  // File system operations
  getAppPaths: () => ipcRenderer.invoke('fs:getAppPaths'),
  getCbdbPaths: () => ipcRenderer.invoke('fs:getCbdbPaths'),
  getArchiveInfo: () => ipcRenderer.invoke('fs:getArchiveInfo'),
  openInExplorer: (path: string) => ipcRenderer.invoke('fs:openInExplorer', path),
  revealInExplorer: (path: string) => ipcRenderer.invoke('fs:revealInExplorer', path),
  openArchiveLocation: () => ipcRenderer.invoke('fs:openArchiveLocation'),
  openExtractedLocation: () => ipcRenderer.invoke('fs:openExtractedLocation'),
  checkFileExists: (path: string) => ipcRenderer.invoke('fs:checkFileExists', path),
  ensureDirectory: (path: string) => ipcRenderer.invoke('fs:ensureDirectory', path),
  extract7z: (archivePath: string, outputPath: string, onProgress?: (progress: any) => void) => {
    // Register progress listener if callback provided
    if (onProgress) {
      // Remove any existing listeners first
      ipcRenderer.removeAllListeners('fs:extract7z-progress');
      // Add new listener
      ipcRenderer.on('fs:extract7z-progress', (event, progress) => {
        onProgress(progress);
      });
    }
    return ipcRenderer.invoke('fs:extract7z', archivePath, outputPath);
  },

  // Server information
  getServerPort: () => ipcRenderer.invoke('server:getPort'),
  getServerUrl: () => ipcRenderer.invoke('server:getUrl'),
  getApiUrl: () => ipcRenderer.invoke('server:getApiUrl'),
})
