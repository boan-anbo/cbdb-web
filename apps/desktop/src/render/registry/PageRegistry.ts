import { PageDefinition, PageSection, PageEnvironment, SidebarSection } from './types';

/**
 * Registry for managing dynamic pages in the application
 */
export class PageRegistry {
  private pages = new Map<string, PageDefinition>();
  private sections: SidebarSection[] = [
    { id: 'legacy', label: 'Access Web', order: 1 },
    { id: 'main', label: 'Data', order: 2 },
    { id: 'analytics-network', label: 'Analytics: Network', order: 3 },
    { id: 'analytics-time', label: 'Analytics: Time', order: 4 },
    { id: 'analytics-space', label: 'Analytics: Space', order: 5 },
    { id: 'admin', label: 'Admin', order: 6 },
    { id: 'development', label: 'Development', order: 7, visible: () => this.isDevelopment() },
    { id: 'settings', label: 'Settings', order: 8 },
  ];

  private static instance: PageRegistry;

  /**
   * Get the singleton instance
   */
  static getInstance(): PageRegistry {
    if (!PageRegistry.instance) {
      PageRegistry.instance = new PageRegistry();
    }
    return PageRegistry.instance;
  }

  /**
   * Register a page
   */
  register(page: PageDefinition): void {
    if (this.pages.has(page.id)) {
      console.warn(`Page with id "${page.id}" is already registered. Overwriting...`);
    }
    this.pages.set(page.id, page);
  }

  /**
   * Register multiple pages
   */
  registerMany(pages: PageDefinition[]): void {
    pages.forEach(page => this.register(page));
  }

  /**
   * Unregister a page
   */
  unregister(pageId: string): void {
    this.pages.delete(pageId);
  }

  /**
   * Get a page by ID
   */
  getPage(pageId: string): PageDefinition | undefined {
    return this.pages.get(pageId);
  }

  /**
   * Get a page by path
   */
  getPageByPath(path: string): PageDefinition | undefined {
    return Array.from(this.pages.values()).find(page => page.path === path);
  }

  /**
   * Get all registered pages
   */
  getAllPages(): PageDefinition[] {
    return Array.from(this.pages.values()).filter(page => this.isPageVisible(page));
  }

  /**
   * Get pages for a specific section
   */
  getPagesForSection(section: PageSection): PageDefinition[] {
    return this.getAllPages()
      .filter(page => page.sidebar?.section === section)
      .filter(page => this.isSidebarVisible(page))
      .sort((a, b) => {
        const orderA = a.sidebar?.order ?? 999;
        const orderB = b.sidebar?.order ?? 999;
        return orderA - orderB;
      });
  }

  /**
   * Get all visible sections
   */
  getVisibleSections(): SidebarSection[] {
    return this.sections
      .filter(section => {
        const isVisible = typeof section.visible === 'function'
          ? section.visible()
          : section.visible !== false;

        // Only show section if it's visible and has pages
        return isVisible && this.getPagesForSection(section.id).length > 0;
      })
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get routes for React Router
   */
  getRoutes(): Array<{ path: string; component: PageDefinition['component'] }> {
    return this.getAllPages().map(page => ({
      path: page.path,
      component: page.component,
    }));
  }

  /**
   * Get the default page
   */
  getDefaultPage(): PageDefinition | undefined {
    return this.getAllPages().find(page => page.metadata?.isDefault);
  }

  /**
   * Check if a page should be visible in the current environment
   */
  private isPageVisible(page: PageDefinition): boolean {
    if (!page.metadata?.environment) {
      return true; // Default to visible if no environment specified
    }

    const currentEnv = this.getCurrentEnvironment();
    const allowedEnvs = Array.isArray(page.metadata.environment)
      ? page.metadata.environment
      : [page.metadata.environment];

    return allowedEnvs.includes('all') || allowedEnvs.includes(currentEnv);
  }

  /**
   * Check if a page should be visible in the sidebar
   */
  private isSidebarVisible(page: PageDefinition): boolean {
    if (!page.sidebar) {
      return false;
    }

    const visible = page.sidebar.visible;
    if (visible === undefined) {
      return true; // Default to visible
    }

    return typeof visible === 'function' ? visible() : visible;
  }

  /**
   * Get the current environment
   */
  private getCurrentEnvironment(): PageEnvironment {
    // Check common environment indicators
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
      switch (process.env.NODE_ENV) {
        case 'development':
          return 'development';
        case 'test':
          return 'test';
        case 'production':
          return 'production';
      }
    }

    // Check if we're in Storybook
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return 'development';
    }

    return 'production';
  }

  /**
   * Check if in development environment
   */
  private isDevelopment(): boolean {
    return this.getCurrentEnvironment() === 'development';
  }

  /**
   * Clear all registered pages
   */
  clear(): void {
    this.pages.clear();
  }

  /**
   * Set custom sections configuration
   */
  setSections(sections: SidebarSection[]): void {
    this.sections = sections;
  }

  /**
   * Add a new section
   */
  addSection(section: SidebarSection): void {
    const existingIndex = this.sections.findIndex(s => s.id === section.id);
    if (existingIndex >= 0) {
      this.sections[existingIndex] = section;
    } else {
      this.sections.push(section);
    }
  }
}

// Export singleton instance
export const pageRegistry = PageRegistry.getInstance();