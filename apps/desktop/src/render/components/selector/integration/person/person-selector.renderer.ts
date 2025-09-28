import { PersonModel } from '@cbdb/core';
import { User } from 'lucide-react';
import { SelectableItem } from '../../types';
import { SelectableItemDisplay, selectorDisplayRegistry } from '../../selector-display-registry';
import { isPersonSelectableItem } from './person-selector.adapter';

/**
 * Renders display information for a person SelectableItem.
 *
 * @param item - The selectable item containing person data
 * @returns Display configuration for the person
 */
export function renderPersonDisplay(item: SelectableItem<PersonModel>): SelectableItemDisplay {
  if (!isPersonSelectableItem(item)) {
    throw new Error('Item is not a person');
  }

  const person = item.data;

  // Primary label: prefer Chinese name
  const label = person.nameChn || person.name || `Person ${person.id}`;

  // Date range for sublabel
  const dateRange = formatDateRange(person.birthYear, person.deathYear);

  // Dynasty for sublabel
  const dynasty = person.dynastyNameChn || person.dynastyName;

  // Combine sublabel parts
  const sublabelParts = [dynasty, dateRange].filter(Boolean);
  const sublabel = sublabelParts.length > 0 ? sublabelParts.join(' • ') : undefined;

  // Meta information (source context)
  const meta = item.source ? `via ${item.source}` : undefined;

  return {
    label,
    sublabel,
    icon: User,
    meta,
  };
}

/**
 * Formats birth and death years into a readable string.
 *
 * @param birthYear - Birth year (optional)
 * @param deathYear - Death year (optional)
 * @returns Formatted date range string
 */
function formatDateRange(birthYear?: number | null, deathYear?: number | null): string | undefined {
  if (birthYear && deathYear) {
    return `${birthYear}–${deathYear}`;
  } else if (birthYear) {
    return `b. ${birthYear}`;
  } else if (deathYear) {
    return `d. ${deathYear}`;
  }
  return undefined;
}

/**
 * Registers the person display renderer with the selector display registry.
 * Should be called once during app initialization.
 */
export function registerPersonRenderer(): void {
  selectorDisplayRegistry.register('person', renderPersonDisplay);
}

/**
 * Alternative display for compact mode (e.g., in lists).
 *
 * @param person - The person model
 * @returns Compact display string
 */
export function getPersonCompactDisplay(person: PersonModel): string {
  const name = person.nameChn || person.name || `Person ${person.id}`;
  const years = formatDateRange(person.birthYear, person.deathYear);
  return years ? `${name} (${years})` : name;
}

/**
 * Get person's full display name with all name components.
 *
 * @param person - The person model
 * @returns Full display name
 */
export function getPersonFullName(person: PersonModel): string {
  const parts: string[] = [];

  if (person.nameChn) {
    parts.push(person.nameChn);
  }
  if (person.name && person.name !== person.nameChn) {
    parts.push(`(${person.name})`);
  }
  if (person.surnameChn && person.mingzi) {
    parts.push(`[${person.surnameChn}${person.mingzi}]`);
  }

  return parts.length > 0 ? parts.join(' ') : `Person ${person.id}`;
}