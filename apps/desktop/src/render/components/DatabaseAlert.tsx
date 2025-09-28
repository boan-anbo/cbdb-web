import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/render/components/ui/alert-dialog';
import { Button } from '@/render/components/ui/button';
import { Progress } from '@/render/components/ui/progress';
import { useDatabaseStatus } from '@/render/hooks/useDatabaseStatus';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, RefreshCw, Settings } from 'lucide-react';

type SetupState = 'initial' | 'setting-up' | 'complete';

interface ExtractionProgress {
  percentage: number;
  message?: string;
  currentFile?: string;
}

export function DatabaseAlert() {
  const { isInitialized, isChecking } = useDatabaseStatus();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [setupState, setSetupState] = useState<SetupState>('initial');
  const [extractProgress, setExtractProgress] = useState<ExtractionProgress>({
    percentage: 0
  });
  const [dbPaths, setDbPaths] = useState<{
    compressed: string;
    uncompressed: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show alert after checking is done and database is not initialized
    if (!isChecking && !isInitialized) {
      setIsOpen(true);
      // Get database paths when dialog opens
      if (window.electronAPI) {
        fetchDatabasePaths();
      }
    }
  }, [isChecking, isInitialized]);

  const fetchDatabasePaths = async () => {
    try {
      const archiveInfo = await window.electronAPI.getArchiveInfo();
      setDbPaths({
        compressed: archiveInfo.archive.path,
        uncompressed: archiveInfo.extracted.path
      });
    } catch (err) {
      console.error('Failed to get database paths:', err);
    }
  };

  const handleSetupDatabase = async () => {
    if (!window.electronAPI || !dbPaths) return;

    setSetupState('setting-up');
    setExtractProgress({ percentage: 0, message: 'Starting setup...' });
    setError(null); // Clear any previous errors

    try {
      const result = await window.electronAPI.extract7z(
        dbPaths.compressed,
        dbPaths.uncompressed,
        (progress) => {
          setExtractProgress({
            percentage: progress.percentage || 0,
            message: progress.message || 'Setting up database...',
            currentFile: progress.currentFile
          });
        }
      );

      if (result.success) {
        setSetupState('complete');
        setExtractProgress({ percentage: 100, message: 'Setup complete!' });
      } else {
        // If extraction fails, reset to initial state and show error
        setSetupState('initial');
        setExtractProgress({ percentage: 0 });
        setError(result.error || 'Failed to setup database');
        console.error('Database setup failed:', result.error);
      }
    } catch (err) {
      console.error('Failed to set up database:', err);
      setSetupState('initial');
      setExtractProgress({ percentage: 0 });
      setError(err instanceof Error ? err.message : 'Setup failed');
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

  const handleGoToSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-l-2 border-primary pl-2">
              Welcome to CBDB Desktop
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        {/* Initial setup state - show explanation */}
        {setupState === 'initial' && (
          <div className="space-y-4">
            <AlertDialogDescription className="space-y-3">
              <p>
                CBDB Desktop ships with a compressed database for optimal download size.
              </p>
              <p>
                To start using the application, we need to extract the database to your local storage.
                This is a one-time setup process.
              </p>
              <p className="text-xs text-muted-foreground">
                Click "Setup Database" to begin extraction.
              </p>
            </AlertDialogDescription>

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Progress Section - shown during setup */}
        {setupState === 'setting-up' && (
          <div className="space-y-4">
            <AlertDialogDescription className="space-y-2">
              <p>
                CBDB Desktop is extracting the latest version of the CBDB database.
                Please wait...
              </p>
              <p className="text-xs text-muted-foreground">
                This process may take 1-5 minutes depending on your system.
              </p>
            </AlertDialogDescription>

            <div className="space-y-3">
              <Progress value={extractProgress.percentage} className="w-full" />
              {extractProgress.currentFile && (
                <p className="text-xs text-muted-foreground truncate">
                  {extractProgress.currentFile}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              If this takes too long, you can restart the application and try again, or visit{' '}
              <button
                onClick={handleGoToSettings}
                className="text-primary underline hover:no-underline"
              >
                Settings
              </button>
              {' '}for manual setup.
            </p>
          </div>
        )}

        {/* Completion message */}
        {setupState === 'complete' && (
          <AlertDialogDescription>
            Database setup complete! Please restart to start using CBDB Desktop.
          </AlertDialogDescription>
        )}

        <AlertDialogFooter className="sm:justify-between">
          {setupState === 'initial' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToSettings}
                className="text-muted-foreground"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={handleSetupDatabase}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Setup Database
              </Button>
            </>
          )}

          {setupState === 'setting-up' && (
            <div className="w-full" />
          )}

          {setupState === 'complete' && (
            <AlertDialogAction onClick={handleRestart} className="gap-2 ml-auto">
              <RefreshCw className="h-4 w-4" />
              Restart Now
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}