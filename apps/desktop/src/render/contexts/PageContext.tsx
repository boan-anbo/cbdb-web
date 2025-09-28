import React, { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PageDefinition, PageSection, SidebarSection } from '@/render/registry/types';
import { pageRegistry } from '@/render/registry/PageRegistry';
import '@/render/pages'; // Import all pages to trigger self-registration

interface PageContextValue {
  pages: PageDefinition[];
  sections: SidebarSection[];
  getPageByPath: (path: string) => PageDefinition | undefined;
  getPageById: (id: string) => PageDefinition | undefined;
  getPagesForSection: (section: PageSection) => PageDefinition[];
  getVisibleSections: () => SidebarSection[];
  getRoutes: () => Array<{ path: string; component: PageDefinition['component'] }>;
  getDefaultPage: () => PageDefinition | undefined;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);

interface PageProviderProps {
  children: ReactNode;
  pages?: PageDefinition[];
  mode?: 'replace' | 'merge';
}

export const PageProvider: React.FC<PageProviderProps> = ({ children, pages: customPages, mode = 'replace' }) => {
  const value: PageContextValue = (() => {
    // If custom pages provided, use them (for Storybook)
    if (customPages) {
      if (mode === 'replace') {
        // Replace all pages with custom ones
        return {
          pages: customPages,
          sections: [],
          getPageByPath: (path: string) => customPages.find(p => p.path === path),
          getPageById: (id: string) => customPages.find(p => p.id === id),
          getPagesForSection: () => [],
          getVisibleSections: () => [],
          getRoutes: () => customPages.map(p => ({ path: p.path, component: p.component })),
          getDefaultPage: () => customPages[0],
        };
      } else {
        // Merge custom pages with existing ones
        const allPages = [...pageRegistry.getAllPages(), ...customPages];
        return {
          pages: allPages,
          sections: pageRegistry.getVisibleSections(),
          getPageByPath: (path: string) => allPages.find(p => p.path === path),
          getPageById: (id: string) => allPages.find(p => p.id === id),
          getPagesForSection: (section: PageSection) => {
            const registryPages = pageRegistry.getPagesForSection(section);
            const customSectionPages = customPages.filter(p => p.sidebar?.section === section);
            return [...registryPages, ...customSectionPages];
          },
          getVisibleSections: () => pageRegistry.getVisibleSections(),
          getRoutes: () => allPages.map(p => ({ path: p.path, component: p.component })),
          getDefaultPage: () => pageRegistry.getDefaultPage() || customPages[0],
        };
      }
    }

    // Default: use pageRegistry
    return {
      pages: pageRegistry.getAllPages(),
      sections: pageRegistry.getVisibleSections(),
      getPageByPath: (path: string) => pageRegistry.getPageByPath(path),
      getPageById: (id: string) => pageRegistry.getPage(id),
      getPagesForSection: (section: PageSection) => pageRegistry.getPagesForSection(section),
      getVisibleSections: () => pageRegistry.getVisibleSections(),
      getRoutes: () => pageRegistry.getRoutes(),
      getDefaultPage: () => pageRegistry.getDefaultPage(),
    };
  })();

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};

/**
 * Hook to access the page context
 */
export function usePageContext() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
}

/**
 * Hook to get the current page based on location
 */
export function useCurrentPage(): PageDefinition | undefined {
  const location = useLocation();
  const { getPageByPath } = usePageContext();
  return getPageByPath(location.pathname);
}

/**
 * Hook to get pages for a specific sidebar section
 */
export function useSectionPages(section: PageSection): PageDefinition[] {
  const { getPagesForSection } = usePageContext();
  return getPagesForSection(section);
}