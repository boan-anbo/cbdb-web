import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/render/components/ui/alert-dialog';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface RestartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestart: () => void;
  onLater?: () => void;
  title?: string;
  description?: string;
}

/**
 * Reusable dialog component for prompting application restart
 * Used after database extraction or other operations requiring restart
 */
export function RestartDialog({
  open,
  onOpenChange,
  onRestart,
  onLater,
  title = "Restart Required",
  description = "The application needs to restart to apply changes."
}: RestartDialogProps) {
  const handleRestart = () => {
    onOpenChange(false);
    onRestart();
  };

  const handleLater = () => {
    onOpenChange(false);
    onLater?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLater}>
            I'll Restart Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleRestart} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Restart Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Specialized restart dialog for database extraction completion
 */
export function DatabaseRestartDialog({
  open,
  onOpenChange,
  onRestart,
  onLater
}: Omit<RestartDialogProps, 'title' | 'description'>) {
  return (
    <RestartDialog
      open={open}
      onOpenChange={onOpenChange}
      onRestart={onRestart}
      onLater={onLater}
      title="Database Ready!"
      description="The database has been successfully extracted. The application needs to restart to complete the setup and connect to your database."
    />
  );
}