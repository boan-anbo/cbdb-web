import { ComponentType, LazyExoticComponent } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Page section in the sidebar
 */
export type PageSection = 'main' | 'tools' | 'admin' | 'development' | 'settings' | 'analytics-network' | 'analytics-time' | 'analytics-space' | 'legacy';

/**
 * Environment where the page should be visible
 */
export type PageEnvironment = 'all' | 'development' | 'test' | 'production';

/**
 * Page definition for registration
 */
export interface PageDefinition {
  /**
   * Unique identifier for the page
   */
  id: string;

  /**
   * URL path for routing (e.g., '/person-search')
   */
  path: string;

  /**
   * React component to render (can be lazy loaded)
   */
  component: ComponentType | LazyExoticComponent<ComponentType>;

  /**
   * Display title for the page
   */
  title: string;

  /**
   * Icon component for sidebar and navigation
   */
  icon: LucideIcon;

  /**
   * Sidebar configuration
   */
  sidebar?: {
    /**
     * Which section to appear in
     */
    section: PageSection;

    /**
     * Order within the section/subsection (lower numbers appear first)
     */
    order?: number;

    /**
     * Whether to show in sidebar
     */
    visible?: boolean | (() => boolean);

    /**
     * Optional badge text
     */
    badge?: string | (() => string | undefined);

    /**
     * Optional tooltip
     */
    tooltip?: string;
  };

  /**
   * Page metadata
   */
  metadata?: {
    /**
     * Requires authentication to access
     */
    requiresAuth?: boolean;

    /**
     * Which environments this page is available in
     */
    environment?: PageEnvironment | PageEnvironment[];

    /**
     * Page description for documentation
     */
    description?: string;

    /**
     * Keywords for searchability
     */
    keywords?: string[];

    /**
     * Whether this is a default/home page
     */
    isDefault?: boolean;
  };

  /**
   * Layout configuration
   */
  layout?: {
    /**
     * Whether to show the header
     */
    showHeader?: boolean;

    /**
     * Custom header actions component
     */
    headerActions?: ComponentType;

    /**
     * Whether to show the sidebar
     */
    showSidebar?: boolean;

    /**
     * Custom layout wrapper
     */
    wrapper?: ComponentType<{ children: React.ReactNode }>;
  };
}

/**
 * Sidebar section configuration
 */
export interface SidebarSection {
  id: PageSection;
  label: string;
  order: number;
  visible?: boolean | (() => boolean);
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}