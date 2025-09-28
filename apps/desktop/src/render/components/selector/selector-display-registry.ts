import React from 'react';
import { SelectableItem } from './types';

/**
 * Display configuration for a selectable item
 */
export interface SelectableItemDisplay {
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  meta?: string;
  badge?: string | number;
  color?: string;
}

/**
 * Function that generates display info for a SelectableItem
 */
export type DisplayResolver<T = any> = (item: SelectableItem<T>) => SelectableItemDisplay;

/**
 * Registry for SelectableItem display resolvers.
 * Allows consumers to register custom display logic for their entity types.
 */
class SelectableItemDisplayRegistry {
  private resolvers = new Map<string, DisplayResolver>();
  private defaultResolver: DisplayResolver;

  constructor() {
    // Set up default resolver
    this.defaultResolver = this.createDefaultResolver();

    // Register built-in types
    this.registerBuiltInTypes();
  }

  /**
   * Register a display resolver for a specific type
   */
  register<T = any>(type: string, resolver: DisplayResolver<T>): void {
    this.resolvers.set(type, resolver);
  }

  /**
   * Unregister a display resolver
   */
  unregister(type: string): void {
    this.resolvers.delete(type);
  }

  /**
   * Get display information for a SelectableItem
   */
  getDisplay<T = any>(item: SelectableItem<T>): SelectableItemDisplay {
    const resolver = this.resolvers.get(item.type) || this.defaultResolver;
    return resolver(item);
  }

  /**
   * Set a custom default resolver
   */
  setDefaultResolver(resolver: DisplayResolver): void {
    this.defaultResolver = resolver;
  }

  /**
   * Create the default resolver for unknown types
   */
  private createDefaultResolver(): DisplayResolver {
    return (item) => {
      const data = item.data as any;
      const [, refId] = item.ref.split(':');

      // Try common field names
      const label =
        data?.label ||
        data?.name ||
        data?.title ||
        data?.nameChn ||
        data?.titleChn ||
        `${this.formatTypeName(item.type)} ${refId || item.ref}`;

      const sublabel =
        data?.sublabel ||
        data?.description ||
        data?.subtitle ||
        undefined;

      const meta = item.source ? `via ${item.source}` : undefined;

      return { label, sublabel, meta };
    };
  }

  /**
   * Format a type name for display
   */
  private formatTypeName(type: string): string {
    // Convert kebab-case or snake_case to Title Case
    return type
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Register built-in CBDB entity types
   */
  private registerBuiltInTypes(): void {
    // Person type
    this.register('person', (item) => {
      const data = item.data as any;
      const [, id] = item.ref.split(':');

      const label = data.nameChn || data.name || `Person ${id}`;
      const dateRange =
        data.birthYear && data.deathYear
          ? `${data.birthYear}–${data.deathYear}`
          : data.birthYear
            ? `b. ${data.birthYear}`
            : data.deathYear
              ? `d. ${data.deathYear}`
              : undefined;

      const sublabel = [data.dynastyName, dateRange].filter(Boolean).join(' • ');
      const meta = item.source;

      return { label, sublabel, meta };
    });

    // Text type
    this.register('text', (item) => {
      const data = item.data as any;
      const [, id] = item.ref.split(':');

      const label = data.titleChn || data.title || `Text ${id}`;
      const authorName = data.authorChn || data.author;
      const sublabel = [authorName, data.year, data.textType].filter(Boolean).join(' • ');

      return { label, sublabel };
    });

    // Place type
    this.register('place', (item) => {
      const data = item.data as any;
      const [, id] = item.ref.split(':');

      const label =
        data.placeNameChn ||
        data.nameChn ||
        data.placeName ||
        data.name ||
        `Place ${id}`;

      const locationType = data.addressType || data.type;
      const parent = data.belongsToChn || data.belongsTo;
      const sublabel = [parent, locationType].filter(Boolean).join(' • ');

      return { label, sublabel };
    });

    // Office type
    this.register('office', (item) => {
      const data = item.data as any;
      const [, id] = item.ref.split(':');

      const label = data.titleChn || data.title || `Office ${id}`;
      const dynasty = data.dynastyName || data.dynasty;
      const dateRange =
        data.startYear && data.endYear
          ? `${data.startYear}–${data.endYear}`
          : undefined;

      const sublabel = [data.type, dynasty, dateRange].filter(Boolean).join(' • ');

      return { label, sublabel };
    });

    // Timeline point type
    this.register('timeline-point', (item) => {
      const data = item.data as any;
      const label = data.label || data.year?.toString() || 'Timeline Point';
      const sublabel = data.event || data.description;
      const badge = data.year;

      return { label, sublabel, badge };
    });

    // Dynasty type
    this.register('dynasty', (item) => {
      const data = item.data as any;
      const label = data.nameChn || data.name || 'Dynasty';
      const dateRange =
        data.startYear && data.endYear
          ? `${data.startYear}–${data.endYear}`
          : undefined;

      return { label, sublabel: dateRange };
    });

    // Search result type
    this.register('search-result', (item) => {
      const data = item.data as any;
      const label = data.title || data.label || 'Search Result';
      const sublabel = data.snippet || data.description;
      const meta = `${item.source || 'search'} • ${data.score || ''}`.trim();
      const badge = data.rank;

      return { label, sublabel, meta, badge };
    });

    // Network node type
    this.register('network-node', (item) => {
      const data = item.data as any;
      const label = data.label || data.name || 'Node';
      const sublabel = data.degree ? `${data.degree} connections` : undefined;
      const badge = data.degree;
      const color = data.color;

      return { label, sublabel, badge, color };
    });

    // Kinship relation type
    this.register('kinship', (item) => {
      const data = item.data as any;
      const label = data.kinshipType || 'Kinship';
      const sublabel = `${data.personName} → ${data.relatedPersonName}`;

      return { label, sublabel };
    });

    // Association type
    this.register('association', (item) => {
      const data = item.data as any;
      const label = data.associationType || 'Association';
      const sublabel = `${data.personName} ↔ ${data.associatedPersonName}`;
      const meta = data.year?.toString();

      return { label, sublabel, meta };
    });
  }
}

// Create singleton instance
export const selectorDisplayRegistry = new SelectableItemDisplayRegistry();

// Export convenience function
export function getSelectableItemDisplay<T = any>(item: SelectableItem<T>): SelectableItemDisplay {
  return selectorDisplayRegistry.getDisplay(item);
}

// Export registry for direct access
export { SelectableItemDisplayRegistry };