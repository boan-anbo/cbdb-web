import React, { useEffect } from 'react';
import { MainLayout } from '@/render/layouts/MainLayout';
import { AppProviders } from '@/render/providers/AppProviders';
import { PageProvider } from '@/render/contexts/PageContext';
import { ClientErrorProvider } from '@/render/providers/ClientErrorProvider';
import { registerAllRenderers } from '@/render/components/selector/integration';

export const App: React.FC = () => {
  useEffect(() => {
    // Register all selector renderers on app initialization
    registerAllRenderers();
  }, []);

  return (
    <AppProviders>
      <ClientErrorProvider>
        <PageProvider>
          <MainLayout />
        </PageProvider>
      </ClientErrorProvider>
    </AppProviders>
  );
};