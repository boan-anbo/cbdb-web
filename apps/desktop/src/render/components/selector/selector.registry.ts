import { User, FileText, MapPin, Building } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Entity type definitions
 */
export const ENTITY_TYPES = {
  PERSON: 'person',
  TEXT: 'text',
  PLACE: 'place',
  OFFICE: 'office',
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];

/**
 * Entity metadata configuration
 */
interface EntityMetadata {
  type: EntityType;
  icon: LucideIcon;
  label: {
    singular: string;
    plural: string;
  };
  color?: {
    bg: string;
    text: string;
    border: string;
  };
}

/**
 * Central registry for all entity types and their metadata
 */
export const ENTITY_REGISTRY: Record<EntityType, EntityMetadata> = {
  [ENTITY_TYPES.PERSON]: {
    type: ENTITY_TYPES.PERSON,
    icon: User,
    label: {
      singular: 'Person',
      plural: 'People',
    },
    color: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
  },
  [ENTITY_TYPES.TEXT]: {
    type: ENTITY_TYPES.TEXT,
    icon: FileText,
    label: {
      singular: 'Text',
      plural: 'Texts',
    },
    color: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
    },
  },
  [ENTITY_TYPES.PLACE]: {
    type: ENTITY_TYPES.PLACE,
    icon: MapPin,
    label: {
      singular: 'Place',
      plural: 'Places',
    },
    color: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
    },
  },
  [ENTITY_TYPES.OFFICE]: {
    type: ENTITY_TYPES.OFFICE,
    icon: Building,
    label: {
      singular: 'Office',
      plural: 'Offices',
    },
    color: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
    },
  },
};

/**
 * Helper functions for accessing entity metadata
 */
export const EntityRegistry = {
  /**
   * Get the icon for an entity type
   */
  getIcon(type: EntityType): LucideIcon {
    return ENTITY_REGISTRY[type]?.icon || User;
  },

  /**
   * Get the display label for an entity type
   */
  getLabel(type: EntityType, plural = false): string {
    const metadata = ENTITY_REGISTRY[type];
    if (!metadata) return plural ? 'Items' : 'Item';
    return plural ? metadata.label.plural : metadata.label.singular;
  },

  /**
   * Get the color scheme for an entity type
   */
  getColors(type: EntityType) {
    return ENTITY_REGISTRY[type]?.color || {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-800',
    };
  },

  /**
   * Get all metadata for an entity type
   */
  getMetadata(type: EntityType): EntityMetadata | undefined {
    return ENTITY_REGISTRY[type];
  },

  /**
   * Check if a type is a valid entity type
   */
  isValidType(type: string): type is EntityType {
    return Object.values(ENTITY_TYPES).includes(type as EntityType);
  },

  /**
   * Get all entity types
   */
  getAllTypes(): EntityType[] {
    return Object.values(ENTITY_TYPES);
  },
};