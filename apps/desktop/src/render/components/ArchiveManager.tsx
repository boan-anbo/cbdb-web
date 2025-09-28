import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/render/components/ui/card';
import { Button } from '@/render/components/ui/button';
import { Progress } from '@/render/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/render/components/ui/alert';
import { Badge } from '@/render/components/ui/badge';
import { Separator } from '@/render/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/render/components/ui/tooltip';
import { Skeleton } from '@/render/components/ui/skeleton';
import {
  Database,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  Archive,
  Info,
  Trash2,
  HardDrive,
  FileArchive,
  Server,
  Activity
} from 'lucide-react';
import { ArchiveClient } from '@cbdb/core';
import type {
  ArchiveStatusResponse,
  ArchiveInfoResponse,
  ArchiveProgressEvent
} from '@cbdb/core';

interface ArchiveManagerProps {
  onExtractionComplete?: (path: string) => void;
  archiveClient?: ArchiveClient;
  deploymentMode?: 'electron' | 'web' | 'development';
}

type ManagerState = 'loading' | 'ready' | 'extracted' | 'extracting' | 'error';

interface ElectronPaths {
  userData?: string;
  archivePath?: string;
  extractedPath?: string;
}

export function ArchiveManager({
  onExtractionComplete,
  archiveClient,
  deploymentMode
}: ArchiveManagerProps) {
  const [state, setState] = useState<ManagerState>('loading');
  const [status, setStatus] = useState<ArchiveStatusResponse | null>(null);
  const [info, setInfo] = useState<ArchiveInfoResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressEvent, setProgressEvent] = useState<ArchiveProgressEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [electronPaths, setElectronPaths] = useState<ElectronPaths>({});
  const [isElectronMode, setIsElectronMode] = useState(false);

  // Detect deployment mode
  // In Storybook, allow override via deploymentMode prop
  const detectedMode = deploymentMode ||
    (window.electronAPI ? 'electron' :
     (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'development' : 'web'));

  // Initialize client if not provided (for Storybook)
  const client = archiveClient || new ArchiveClient({ baseUrl: 'http://localhost:18019' });

  useEffect(() => {
    // Only check status in electron or development mode
    if (detectedMode !== 'web') {
      checkStatus();
      setIsElectronMode(detectedMode === 'electron');

      // Also get archive info from Electron if available
      if (window.electronAPI) {
        Promise.all([
          window.electronAPI.getArchiveInfo(),
          window.electronAPI.getCbdbPaths()
        ]).then(([archiveInfo, cbdbPaths]) => {
          console.log('Archive info from Electron:', archiveInfo);
          console.log('CBDB paths:', cbdbPaths);
          setElectronPaths({
            userData: cbdbPaths.userDataPath,
            archivePath: archiveInfo.archive.path,
            extractedPath: archiveInfo.extracted.path
          });
        });
      }
    }
  }, [detectedMode]);

  const checkStatus = async () => {
    setState('loading');
    try {
      const statusData = await client.getStatus();
      setStatus(statusData);

      if (statusData.exists && !statusData.extracted) {
        setState('ready');
        // Also fetch info
        const infoData = await client.getInfo();
        setInfo(infoData);
      } else if (statusData.extracted) {
        setState('extracted');
      } else {
        setState('error');
        setErrorMessage('Archive file not found');
      }
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to check status');
    }
  };

  const handleOpenLocation = async (location: 'archive' | 'extracted') => {
    try {
      // Check if we have Electron API available (running in Electron)
      if (window.electronAPI) {
        const success = location === 'archive'
          ? await window.electronAPI.openArchiveLocation()
          : await window.electronAPI.openExtractedLocation();

        if (!success) {
          setErrorMessage(`Failed to open ${location} location`);
        }
      } else {
        // Fallback to HTTP API (running in Storybook or web)
        await client.openLocation(location);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to open location');
    }
  };

  const handleExtraction = async () => {
    setState('extracting');
    setProgress(0);
    setProgressEvent(null);

    try {
      await client.extractWithProgress(
        (event) => {
          setProgressEvent(event);
          if (event.percent !== undefined) {
            setProgress(event.percent);
          }

          if (event.type === 'complete') {
            setState('extracted');
            if (event.extractedPath && onExtractionComplete) {
              onExtractionComplete(event.extractedPath);
            }
            // Refresh status
            checkStatus();
          } else if (event.type === 'error') {
            setState('error');
            setErrorMessage(event.message || 'Extraction failed');
          }
        }
      );
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Extraction failed');
    }
  };

  const handleCleanup = async () => {
    try {
      const result = await client.cleanExtracted();
      if (result.success) {
        // Refresh status
        await checkStatus();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Cleanup failed');
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${seconds}s`;
  };

  // In web mode, show a message that archive management is not available
  if (detectedMode === 'web') {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <CardTitle>Archive Management Not Available</CardTitle>
                <CardDescription>
                  This feature requires the desktop application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-900 dark:text-amber-100">Desktop Only Feature</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Archive extraction requires local file system access which is only available in the
                Electron desktop environment. The web version connects directly to the remote database.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-3xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>Checking Archive Status</CardTitle>
                <CardDescription>
                  Verifying CBDB archive and database paths...
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <TooltipProvider>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Archive className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle>CBDB Archive Manager</CardTitle>
                  <CardDescription>
                    Extract and manage the China Biographical Database
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={state === 'extracted' ? 'default' : state === 'extracting' ? 'secondary' : 'outline'}
                className="ml-auto"
              >
                {state === 'extracted' ? 'Ready' : state === 'extracting' ? 'Extracting' : 'Not Extracted'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Archive Details Section */}
            {status && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileArchive className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Archive Details</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Archive Info Card */}
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Archive File</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">File Name</p>
                        <p className="font-mono text-sm font-medium">{info?.fileName || 'latest.7z'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Compressed Size</p>
                        <p className="text-sm font-medium">{info?.sizeFormatted || formatFileSize(status.archiveSize || 0)}</p>
                      </div>
                      {(isElectronMode || detectedMode === 'development') && status.archivePath && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-mono text-xs truncate cursor-help">
                                {electronPaths.archivePath || status.archivePath}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="font-mono text-xs break-all">
                                {electronPaths.archivePath || status.archivePath}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Database Info Card */}
                  <Card className={state !== 'extracted' ? 'opacity-50' : ''}>
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Database File</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">File Name</p>
                        <p className="font-mono text-sm font-medium">
                          {state === 'extracted' ? 'latest.db' : '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Uncompressed Size</p>
                        <p className="text-sm font-medium">
                          {state === 'extracted' && status.extractedSize
                            ? formatFileSize(status.extractedSize)
                            : '~1.7 GB'}
                        </p>
                      </div>
                      {state === 'extracted' && info?.compressionRatio && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Compression Ratio</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{info.compressionRatio.toFixed(1)}x</p>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round((1 - 1/info.compressionRatio) * 100)}% saved
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Paths Section - Only in Electron */}
                {isElectronMode && electronPaths.userData && (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">System Paths</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground min-w-[80px]">App Data:</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-xs truncate cursor-help flex-1">
                              {electronPaths.userData}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <p className="font-mono text-xs break-all">
                              {electronPaths.userData}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {status.extracted && status.extractedPath && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground min-w-[80px]">Database:</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono text-xs truncate cursor-help flex-1">
                                {status.extractedPath}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p className="font-mono text-xs break-all">
                                {status.extractedPath}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons Section */}
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Actions</h3>
              </div>

              {state === 'ready' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenLocation('archive')}
                    disabled={!status?.exists}
                    className="flex-1 sm:flex-none"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open Archive Folder
                  </Button>
                  <Button
                    onClick={handleExtraction}
                    className="flex-1 sm:flex-none sm:ml-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Extract Database
                  </Button>
                </div>
              )}

              {state === 'extracted' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenLocation('archive')}
                    disabled={!status?.exists}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Archive Folder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenLocation('extracted')}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Database Folder
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCleanup}
                    className="sm:ml-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clean Extracted Files
                  </Button>
                </div>
              )}
            </div>

            {/* Extraction Progress */}
            {state === 'extracting' && progressEvent && (
              <div className="space-y-4">
                <Separator />
                <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-900 dark:text-blue-100">Extracting Database</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    Decompressing latest.db from the archive. This typically takes 1-2 minutes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Extraction Progress</span>
                      {progressEvent.speed && (
                        <Badge variant="secondary" className="text-xs">
                          {progressEvent.speed}
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {progressEvent.file && (
                    <div className="flex items-center gap-2">
                      <FileArchive className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">
                        {progressEvent.file}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {state === 'extracted' && progressEvent?.type === 'complete' && (
              <>
                <Separator />
                <Alert className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-900 dark:text-green-100">Extraction Complete</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Database extracted successfully in {formatDuration(progressEvent.duration || 0)}.
                    The application is now using the local database.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* Error Message */}
            {state === 'error' && errorMessage && (
              <>
                <Separator />
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}