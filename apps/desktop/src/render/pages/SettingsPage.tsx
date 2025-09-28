import React, { useEffect, useState } from 'react';
import {
  Settings,
  Database,
  Server,
  FolderOpen,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileArchive,
  Loader2,
  Activity,
  Clock,
  HardDrive,
  Copy
} from 'lucide-react';
import { isWeb } from '@/render/utils/deployment';
import {
  CBDBPage,
  CBDBPageHeader,
  CBDBPageTitle,
  CBDBPageDescription,
  CBDBPageContent,
} from '@/render/components/ui/cbdb-page';
import {
  CBDBBlock,
  CBDBBlockContent,
  CBDBBlockHeader,
  CBDBBlockTitle,
} from '@/render/components/ui/cbdb-block';
import { Button } from '@/render/components/ui/button';
import { DatabaseRestartDialog } from '@/render/components/RestartDialog';
import { Progress } from '@/render/components/ui/progress';
import type { AppPaths } from '@/render/types/electron';
import { useApiClient } from '@/render/providers/ApiClientProvider';
import type { ServerInfoResponse } from '@cbdb/core';

// Database naming constants
const DB_FOLDER = 'cbdb_sqlite_db';
const DB_COMPRESSED_NAME = 'latest.7z';
const DB_UNCOMPRESSED_NAME = 'latest.db';

const SettingsPage: React.FC = () => {
  const [appPaths, setAppPaths] = useState<AppPaths | null>(null);
  const [isElectron, setIsElectron] = useState(false);
  const [compressedExists, setCompressedExists] = useState(false);
  const [uncompressedExists, setUncompressedExists] = useState(false);
  const [dbPaths, setDbPaths] = useState<{ compressed: string; uncompressed: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractProgress, setExtractProgress] = useState<{
    phase: 'analyzing' | 'extracting' | 'copying';
    percentage: number;
    message?: string;
    currentFile?: string;
  } | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerInfoResponse | null>(null);
  const [isLoadingServerInfo, setIsLoadingServerInfo] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);

  // Get the client from ApiClientProvider
  let client;
  try {
    client = useApiClient();
  } catch (err) {
    // Client is not ready yet
    client = null;
  }

  useEffect(() => {
    // Check if we're in Electron environment and get app paths
    if (window.electronAPI) {
      setIsElectron(true);
      checkDatabaseFiles();
    }
    // Fetch server info when client is ready
    if (client) {
      fetchServerInfo();
    }
  }, [client]);

  const fetchServerInfo = async () => {
    if (!client) return;

    setIsLoadingServerInfo(true);
    try {
      const info = await client.serverInfo.getInfo();
      setServerInfo(info);
    } catch (error) {
      console.error('Failed to fetch server info:', error);
    } finally {
      setIsLoadingServerInfo(false);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleCopyApiUrl = () => {
    if (serverInfo?.apiUrl) {
      navigator.clipboard.writeText(serverInfo.apiUrl);
    }
  };

  const checkDatabaseFiles = async () => {
    setIsRefreshing(true);
    try {
      const paths = await window.electronAPI.getAppPaths();
      setAppPaths(paths);

      // Get the actual archive info from backend (Resources directory)
      const archiveInfo = await window.electronAPI.getArchiveInfo();

      // Use the actual archive path from Resources, and extracted path from user data
      const compressedPath = archiveInfo.archive.path;
      const uncompressedPath = archiveInfo.extracted.path;

      setDbPaths({
        compressed: compressedPath,
        uncompressed: uncompressedPath
      });

      // Check existence using the info we already have
      setCompressedExists(archiveInfo.archive.exists);
      setUncompressedExists(archiveInfo.extracted.exists);
      setExtractError(null);
    } catch (err) {
      console.error('Failed to check database files:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenAppDataFolder = async () => {
    if (window.electronAPI && appPaths) {
      try {
        await window.electronAPI.openInExplorer(appPaths.userData);
      } catch (err) {
        console.error('Failed to open folder:', err);
      }
    }
  };

  const handleUncompress = async () => {
    if (!window.electronAPI || !dbPaths) return;

    setIsExtracting(true);
    setExtractError(null);
    setExtractProgress(null);

    try {
      const result = await window.electronAPI.extract7z(
        dbPaths.compressed,
        dbPaths.uncompressed,
        (progress) => {
          setExtractProgress({
            phase: progress.phase,
            percentage: progress.percentage,
            message: progress.message,
            currentFile: progress.currentFile
          });
        }
      );

      if (result.success) {
        await checkDatabaseFiles();
        setExtractProgress(null);

        // Show restart dialog for manual re-extraction from Settings
        if (result.needsRestart) {
          setShowRestartDialog(true);
        }
      } else {
        setExtractError(result.error || 'Failed to extract archive');
        setExtractProgress(null);
      }
    } catch (err) {
      console.error('Failed to uncompress:', err);
      setExtractError('Failed to uncompress database');
      setExtractProgress(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRestart = async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.reinitializeDatabase();
      } catch (err) {
        console.error('Failed to restart:', err);
      }
    }
  };

  const handleRestartLater = () => {
    // Just close the dialog, database will be initialized on next manual restart
    console.log('User chose to restart later');
  };

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          Settings
        </CBDBPageTitle>
        <CBDBPageDescription>
          Configure application preferences and database settings
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        {/* Database Management Block */}
        {isElectron && appPaths && (
          <CBDBBlock>
            <CBDBBlockHeader>
              <CBDBBlockTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Database Management
              </CBDBBlockTitle>
            </CBDBBlockHeader>
            <CBDBBlockContent>
              <div className="space-y-4">
                {/* Application Data Folder */}
                <div className="p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <FolderOpen className="size-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Application Data Folder</p>
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        {appPaths.userData}
                      </p>
                    </div>
                    <Button
                      onClick={handleOpenAppDataFolder}
                      size="sm"
                      variant="outline"
                      className="gap-2 h-7"
                    >
                      <FolderOpen className="size-3" />
                      Reveal
                    </Button>
                  </div>
                </div>

                {/* CBDB Database Files */}
                {dbPaths && (
                  <div className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">CBDB Database Files</p>
                      <Button
                        onClick={checkDatabaseFiles}
                        disabled={isRefreshing}
                        size="sm"
                        variant="ghost"
                        className="gap-2 h-7 px-2"
                      >
                        <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>

                    {/* Compressed Database */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {compressedExists ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-1">
                          Compressed Archive (7z)
                        </p>
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          {dbPaths.compressed}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            Status: {compressedExists ? 'Exists' : 'Not found'}
                          </p>
                          <div className="flex items-center gap-2">
                            {compressedExists && (
                              <Button
                                onClick={() => window.electronAPI?.openInExplorer(dbPaths.compressed)}
                                size="sm"
                                variant="outline"
                                className="gap-2 h-7"
                              >
                                <FolderOpen className="size-3" />
                                Reveal
                              </Button>
                            )}
                            {compressedExists && !uncompressedExists && (
                              <Button
                                onClick={handleUncompress}
                                disabled={isExtracting}
                                size="sm"
                                variant="outline"
                                className="gap-2 h-7"
                              >
                                {isExtracting ? (
                                  <>
                                    <Loader2 className="size-3 animate-spin" />
                                    Extracting...
                                  </>
                                ) : (
                                  <>
                                    <FileArchive className="size-3" />
                                    Extract Database
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {extractError && (
                          <p className="text-xs text-red-600 mt-1">{extractError}</p>
                        )}
                        {isExtracting && extractProgress && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground capitalize">
                                {extractProgress.phase === 'analyzing' && 'Analyzing archive...'}
                                {extractProgress.phase === 'extracting' && 'Extracting files...'}
                                {extractProgress.phase === 'copying' && 'Saving to disk...'}
                              </span>
                              <span className="font-mono">{extractProgress.percentage}%</span>
                            </div>
                            <Progress value={extractProgress.percentage} className="h-2" />
                            {extractProgress.message && (
                              <p className="text-xs text-muted-foreground">{extractProgress.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Uncompressed Database */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {uncompressedExists ? (
                          <CheckCircle className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-1">
                          SQLite Database
                        </p>
                        <p className="text-xs text-muted-foreground font-mono break-all">
                          {dbPaths.uncompressed}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Status: {uncompressedExists ? 'Exists' : 'Not found'}
                          </p>
                          {uncompressedExists && (
                            <Button
                              onClick={() => window.electronAPI?.openInExplorer(dbPaths.uncompressed)}
                              size="sm"
                              variant="outline"
                              className="gap-2 h-7"
                            >
                              <FolderOpen className="size-3" />
                              Reveal
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CBDBBlockContent>
          </CBDBBlock>
        )}

        {/* CBDB Server Block */}
        <CBDBBlock>
          <CBDBBlockHeader>
            <CBDBBlockTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Server className="size-5" />
                CBDB Server
              </span>
              <Button
                onClick={fetchServerInfo}
                disabled={isLoadingServerInfo}
                size="sm"
                variant="ghost"
                className="gap-2 h-7 px-2"
              >
                <RefreshCw className={`size-3 ${isLoadingServerInfo ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CBDBBlockTitle>
          </CBDBBlockHeader>
          <CBDBBlockContent>
            {isLoadingServerInfo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : serverInfo ? (
              <div className="space-y-4">
                {/* Server Status - Hidden in web deployment */}
                {!isWeb() && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Activity className="size-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Status</p>
                          <p className="text-xs text-muted-foreground">
                            Running on port {serverInfo.port}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="size-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">Uptime</p>
                          <p className="text-xs text-muted-foreground">
                            {formatUptime(serverInfo.uptime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Database Status */}
                    <div className="flex items-start gap-3">
                      <HardDrive className="size-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Database Status</p>
                        {serverInfo.database ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              {serverInfo.database.isInitialized ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="size-3 text-green-600" />
                                  Initialized
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XCircle className="size-3 text-red-600" />
                                  Not Initialized
                                </span>
                              )}
                            </p>
                            {serverInfo.database.location && (
                              <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
                                {serverInfo.database.location}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Unknown</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Server Details - Always visible */}
                <div className={`space-y-2 ${!isWeb() ? 'pt-2 border-t' : ''}`}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono">{serverInfo.version}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-mono">{serverInfo.mode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Environment</span>
                    <span className="font-mono">{serverInfo.environment}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">API URL</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-right break-all">{serverInfo.apiUrl}</span>
                      <Button
                        onClick={handleCopyApiUrl}
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        title="Copy API URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Failed to load server information
              </div>
            )}
          </CBDBBlockContent>
        </CBDBBlock>

        {/* Show message for non-Electron environments */}
        {!isElectron && (
          <div className="text-center py-8 text-muted-foreground">
            Database management features are only available in the desktop application.
          </div>
        )}
      </CBDBPageContent>
      {/* Restart Dialog */}
      <DatabaseRestartDialog
        open={showRestartDialog}
        onOpenChange={setShowRestartDialog}
        onRestart={handleRestart}
        onLater={handleRestartLater}
      />
    </CBDBPage>
  );
};

export default SettingsPage;