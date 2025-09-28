import { PersonModel } from '@cbdb/core';
import { SelectableItem, createSelectableItem } from '../../types';

/**
 * Converts a PersonModel to a SelectableItem for the selector system.
 *
 * @param person - The person model from the database
 * @param source - Optional source context (e.g., 'search', 'network', 'browser')
 * @returns A SelectableItem that can be used in the selector
 */
export function personToSelectableItem(
  person: PersonModel,
  source?: string
): SelectableItem<PersonModel> {
  return createSelectableItem({
    ref: `person:${person.id}`,
    type: 'person',
    data: person,
    source,
  });
}

/**
 * Converts a SelectableItem back to a PersonModel if possible.
 *
 * @param item - The selectable item to convert
 * @returns The PersonModel if the item is a person, null otherwise
 */
export function selectableItemToPerson(item: SelectableItem): PersonModel | null {
  if (!isPersonSelectableItem(item)) {
    return null;
  }
  return item.data as PersonModel;
}

/**
 * Type guard to check if a SelectableItem is a person.
 *
 * @param item - The selectable item to check
 * @returns True if the item is a person
 */
export function isPersonSelectableItem(item: SelectableItem): item is SelectableItem<PersonModel> {
  return item.type === 'person';
}

/**
 * Extracts the person ID from a person reference string.
 *
 * @param ref - The reference string (e.g., 'person:1762')
 * @returns The person ID or null if invalid
 */
export function getPersonIdFromRef(ref: string): number | null {
  if (!ref.startsWith('person:')) {
    return null;
  }
  const id = parseInt(ref.substring(7), 10);
  return isNaN(id) ? null : id;
}

/**
 * Creates a person reference string from a person ID.
 *
 * @param id - The person ID
 * @returns The reference string
 */
export function createPersonRef(id: number): string {
  return `person:${id}`;
}