import React, { ReactNode, useMemo } from 'react';
import { BrowserRouter, MemoryRouter, HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SidebarProvider } from '@/render/components/ui/sidebar';
import { DataInspectorProvider } from '@/render/contexts/DataInspectorContext';
import { SelectionProvider } from '@/render/contexts/SelectionContext';
import { KinshipCodesProvider } from '@/render/contexts/KinshipCodesContext';
import { PageProvider } from '@/render/contexts/PageContext';
import { ApiClientProvider } from '@/render/providers/ApiClientProvider';
import { registerCoreInspectorViews } from '@/render/components/data-inspector/registry/registerCoreViews';
import { DatabaseAlert } from '@/render/components/DatabaseAlert';
import { useLocalStorage, STORAGE_KEYS } from '@/render/hooks/use-local-storage';
// Initialize once
let initialized = false;
const initialize = () => {
  if (!initialized) {
    registerCoreInspectorViews();
    initialized = true;
  }
};

// Create a singleton QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
  /**
   * Use MemoryRouter for testing/Storybook instead of BrowserRouter
   */
  useMemoryRouter?: boolean;
  /**
   * Initial route for MemoryRouter
   */
  initialRoute?: string;
  /**
   * Whether to show the toast notifications
   */
  showToaster?: boolean;
  /**
   * Custom sidebar configuration
   */
  sidebarConfig?: React.ComponentProps<typeof SidebarProvider>;
}

/**
 * Centralized provider component that wraps the app with all necessary contexts.
 * This ensures consistency between the main app and Storybook.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  useMemoryRouter = false,
  initialRoute = '/',
  showToaster = true,
  sidebarConfig,
}) => {
  // Initialize registries
  initialize();

  // Get sidebar state from localStorage (default to false for first visit)
  const [sidebarOpen, setSidebarOpen] = useLocalStorage(STORAGE_KEYS.SIDEBAR_OPEN, false);

  // Detect if we're running in Electron production (using file:// protocol)
  // This happens when the built Electron app loads the HTML file directly
  const isElectronProduction =
    typeof window !== 'undefined' &&
    window.electronAPI &&
    window.location.protocol === 'file:';

  // Choose router based on environment
  // - MemoryRouter: For testing/Storybook
  // - HashRouter: For Electron production (file:// protocol)
  // - BrowserRouter: For development and web deployments
  const Router = useMemoryRouter
    ? MemoryRouter
    : isElectronProduction
      ? HashRouter
      : BrowserRouter;

  // Use Vite's BASE_URL which is set at build time:
  // - Desktop/Electron build: '/' (from base: './')
  // - Web production build: '/cbdb/' (from base: '/cbdb/')
  // - Local development: '/' (uses desktop config)
  const basename = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

  // Configure router props based on router type
  // HashRouter doesn't support basename prop, so we skip it for Electron production
  const routerProps = useMemoryRouter
    ? { initialEntries: [initialRoute] }
    : isElectronProduction
      ? {} // HashRouter doesn't need/support basename
      : basename
        ? { basename }
        : {};

  // Merge sidebar config with localStorage persistence
  const mergedSidebarConfig = useMemo(() => ({
    defaultOpen: sidebarOpen,
    open: sidebarOpen,
    onOpenChange: setSidebarOpen,
    ...sidebarConfig,
  }), [sidebarOpen, setSidebarOpen, sidebarConfig]);

  return (
    <ApiClientProvider>
      <Router {...routerProps}>
        <QueryClientProvider client={queryClient}>
          <PageProvider>
            <KinshipCodesProvider>
              <SelectionProvider>
                <DataInspectorProvider>
                  <SidebarProvider {...mergedSidebarConfig}>
                    {showToaster && <Toaster richColors position="top-center" />}
                    <DatabaseAlert />
                    {children}
                  </SidebarProvider>
                </DataInspectorProvider>
              </SelectionProvider>
            </KinshipCodesProvider>
          </PageProvider>
        </QueryClientProvider>
      </Router>
    </ApiClientProvider>
  );
};

/**
 * Provider for Storybook stories that don't need routing
 * Note: PageProvider should be added by individual stories if they need pages
 */
export const StorybookProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  initialize();

  return (
    <ApiClientProvider>
      <QueryClientProvider client={queryClient}>
        <KinshipCodesProvider>
          <SelectionProvider>
            <DataInspectorProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </DataInspectorProvider>
          </SelectionProvider>
        </KinshipCodesProvider>
      </QueryClientProvider>
    </ApiClientProvider>
  );
};

/**
 * Minimal providers for isolated component testing
 */
export const TestProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SelectionProvider>
      {children}
    </SelectionProvider>
  );
};