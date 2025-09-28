import React, { useState, useEffect, useRef } from 'react';
import { Code2, ExternalLink, Loader2 } from 'lucide-react';
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
  CBDBBlockActions,
} from '@/render/components/ui/cbdb-block';
import { Button } from '@/render/components/ui/button';
import { getDeploymentMode } from '@/render/utils/deployment';

const ApiPage: React.FC = () => {
  const [serverUrl, setServerUrl] = useState('http://localhost:18019');
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const getServerUrl = async () => {
      try {
        const deploymentMode = getDeploymentMode();
        console.log('[ApiPage] Deployment mode:', deploymentMode);

        // Handle different deployment modes
        if (deploymentMode === 'electron') {
          // In Electron, try to get dynamic port from IPC
          if (window.electronAPI) {
            const url = await window.electronAPI.getServerUrl();
            if (url) {
              setServerUrl(url);
              return;
            }
          }
          // Fallback to default local server
          setServerUrl('http://localhost:18019');
        } else if (deploymentMode === 'development') {
          // Local development
          setServerUrl('http://localhost:18019');
        } else if (deploymentMode === 'web') {
          // Web deployment on dh-tools.com
          // Use the base path without port - Caddy will proxy to backend
          setServerUrl('/cbdb');
        }
      } catch (error) {
        console.warn('Failed to get server URL:', error);
        // Keep default URL
      }
    };

    getServerUrl();
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    console.error('Failed to load API documentation');
  };

  const openInNewTab = () => {
    window.open(`${serverUrl}/docs/scalar`, '_blank', 'noopener,noreferrer');
  };

  return (
    <CBDBPage>
      <CBDBPageHeader>
        <CBDBPageTitle className="flex items-center gap-3">
          <Code2 className="h-6 w-6" />
          API Documentation
        </CBDBPageTitle>
        <CBDBPageDescription>
          API documentation for CBDB Desktop
        </CBDBPageDescription>
      </CBDBPageHeader>

      <CBDBPageContent>
        <CBDBBlock className="h-full flex flex-col">
          <CBDBBlockHeader>
            <CBDBBlockTitle>Interactive API Reference</CBDBBlockTitle>
            <CBDBBlockActions>
              <Button
                onClick={openInNewTab}
                size="icon"
                variant="ghost"
                title="Open in new tab"
              >
                <ExternalLink className="size-4" />
              </Button>
            </CBDBBlockActions>
          </CBDBBlockHeader>
          <CBDBBlockContent className="flex-1 relative p-0 min-h-0">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading API documentation...
                  </p>
                </div>
              </div>
            )}

            {/* Iframe with security and performance best practices */}
            <iframe
              ref={iframeRef}
              src={`${serverUrl}/docs/scalar`}
              className="w-full h-[500px] border-0"
              title="CBDB API Documentation"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              // Security: sandbox attribute with minimal required permissions
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              // Performance: lazy loading for better initial page load
              loading="lazy"
              // Allow clipboard for copying API examples
              allow="clipboard-write"
              // Referrer policy for security
              referrerPolicy="strict-origin-when-cross-origin"
              style={{
                backgroundColor: 'transparent',
              }}
            />
          </CBDBBlockContent>
        </CBDBBlock>
      </CBDBPageContent>
    </CBDBPage>
  );
};

export default ApiPage;
