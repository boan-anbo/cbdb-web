import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/render/components/ui/sidebar';
import { Separator } from '@/render/components/ui/separator';
import { SelectionProvider } from '@/render/contexts/SelectionContext';
import { SelectorBar } from '@/render/components/selector';
import { useSelectionKeyboard } from '@/render/components/selector/hooks';
import { DataLicenseNotice } from '@/render/components/legal/DataLicenseNotice';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  showHeader?: boolean;
}

function MainLayoutContent({
  children,
  title = 'CBDB Desktop',
  headerActions,
  showHeader = true
}: MainLayoutProps) {
  // Enable global keyboard shortcuts for selection
  useSelectionKeyboard();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <DataLicenseNotice />
        {showHeader && (
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold">{title}</h1>
            {headerActions && (
              <div className="flex items-center gap-2 ml-auto">
                {headerActions}
              </div>
            )}
          </header>
        )}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-24">
          {children}
        </div>
      </SidebarInset>
      <SelectorBar />
    </SidebarProvider>
  );
}

export function MainLayout(props: MainLayoutProps) {
  return (
    <SelectionProvider>
      <MainLayoutContent {...props} />
    </SelectionProvider>
  );
}

export default MainLayout;
