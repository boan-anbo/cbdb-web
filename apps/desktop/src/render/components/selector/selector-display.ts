/**
 * @deprecated Use selector-display-registry.ts instead
 * This file is kept for backwards compatibility and will be removed in a future version.
 */

export {
  getSelectableItemDisplay,
  type SelectableItemDisplay,
  selectorDisplayRegistry,
} from './selector-display-registry';

/**
 * Get a short display label for the item type
 */
export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'person': 'Person',
    'text': 'Text',
    'place': 'Place',
    'office': 'Office',
    'timeline-point': 'Timeline',
    'dynasty': 'Dynasty',
    'search-result': 'Search',
    'network-node': 'Network',
    'kinship': 'Kinship',
    'association': 'Association',
  };
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' ');
}