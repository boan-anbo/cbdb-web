import { ReactNode } from 'react';
import { SidebarTrigger } from '@/render/components/ui/sidebar';
import { cn } from '@/render/lib/utils';

interface MainViewProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  className?: string;
  showHeader?: boolean;
}

export function MainView({
  children,
  title = 'CBDB Desktop',
  headerActions,
  className,
  showHeader = true,
}: MainViewProps) {
  return (
    <div className="flex flex-col h-full">
      {showHeader && (
        <header className="flex h-14 items-center gap-4 border-b px-6 shrink-0">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </header>
      )}
      <main className={cn('flex-1 overflow-auto', className)}>
        {children}
      </main>
    </div>
  );
}

export default MainView;