import { DataInspectorLayout } from '@/render/components/data-inspector/DataInspectorLayout';
import { AppSidebar } from '@/render/components/layout/AppSidebar';
import { SelectorBar } from '@/render/components/selector/SelectorBar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/render/components/ui/breadcrumb';
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/render/components/ui/sidebar';
import { useCurrentPage, usePageContext } from '@/render/contexts/PageContext';
import { useSelection } from '@/render/contexts/SelectionContext';
import { useIsMobile } from '@/render/hooks/use-mobile';
import { cn } from '@/render/lib/utils';
import React from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

export function MainLayout() {
  const location = useLocation();
  const { getVisibleSections, getRoutes, getDefaultPage } = usePageContext();
  const currentPage = useCurrentPage();
  const isMobile = useIsMobile();
  const { open } = useSidebar();
  const { count, selectorExpanded } = useSelection();

  // Build breadcrumb trail
  const getBreadcrumbs = () => {
    const breadcrumbs = [];

    // Always start with Home
    if (location.pathname !== '/') {
      breadcrumbs.push({ title: 'Home', path: '/' });
    }

    // Find parent section if page is in a section
    if (currentPage?.sidebar) {
      const sections = getVisibleSections();
      const parentSection = sections.find(
        (s) => s.id === currentPage.sidebar?.section,
      );

      if (parentSection) {
        breadcrumbs.push({ title: parentSection.label, path: null });
      }
    }

    // Add current page
    if (currentPage && location.pathname !== '/') {
      breadcrumbs.push({ title: currentPage.title, path: location.pathname });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const routes = getRoutes();
  const defaultPage = getDefaultPage();

  return (
    <div className="main-layout">
      <AppSidebar />

      <SidebarInset className="sidebar-inset">
        <DataInspectorLayout className="flex-1 data-inspector-layout">
          <div className="flex h-full flex-col">
            {/* Header Bar with Breadcrumbs */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                {/* Mobile toggle button - only show on mobile */}
                {isMobile && <SidebarTrigger className="md:hidden" />}
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.path || crumb.title}>
                          {index > 0 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                          )}
                          <BreadcrumbItem
                            className={
                              index === 0 && breadcrumbs.length > 1
                                ? 'hidden md:block'
                                : ''
                            }
                          >
                            {index === breadcrumbs.length - 1 ? (
                              <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                            ) : crumb.path ? (
                              <BreadcrumbLink asChild>
                                <Link to={crumb.path}>{crumb.title}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <span className="text-muted-foreground">
                                {crumb.title}
                              </span>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>
            </header>

            {/* Content - Routes */}
            <div className="flex-1 min-h-0 relative">
              <main
                className="overflow-y-auto"
                style={{
                  scrollbarGutter: 'stable', // Save will save space for the scrollbar but does not show its gutter when y is overflowed. This prevents layout shift with/without scrollbar.
                }}
              >
                <div
                  className={cn(
                    'transition-all duration-200  bg-background',
                    count > 0 && selectorExpanded && 'pb-[416px]',
                    count > 0 && !selectorExpanded && 'pb-[56px]',
                  )}
                >
                  <Routes>
                    {routes.map((route) => {
                      const Component = route.component;
                      return (
                        <Route
                          key={route.path}
                          path={
                            route.path === '/'
                              ? undefined
                              : route.path.substring(1)
                          }
                          index={route.path === '/'}
                          element={<Component />}
                        />
                      );
                    })}
                    <Route
                      path="*"
                      element={
                        <Navigate to={defaultPage?.path || '/'} replace />
                      }
                    />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </DataInspectorLayout>
      </SidebarInset>

      {/* Floating Selector Bar - Fixed to viewport bottom, aligned with main content */}
      <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
        {isMobile ? (
          // Mobile layout - center the selector bar
          <div className="px-4 pointer-events-auto">
            <SelectorBar />
          </div>
        ) : (
          // Desktop layout - align with sidebar
          <div className="flex">
            {/* Spacer for sidebar */}
            <div className={open ? 'w-[240px] shrink-0' : 'w-12 shrink-0'} />

            {/* Selector bar container */}
            <div className="flex-1 px-6 pointer-events-auto">
              <div className="max-w-7xl mx-auto">
                <SelectorBar />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
