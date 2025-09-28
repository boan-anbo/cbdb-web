import { SelectableItem, createSelectableItem } from './types';
import { EntityRegistry, ENTITY_TYPES } from './selector.registry';

/**
 * Person data interface - simplified for now
 * TODO: Replace with actual Person model from @cbdb/core
 */
interface PersonData {
  id: number;
  name: string;
  nameChn?: string;
  dynastyName?: string;
  birthYear?: number;
  deathYear?: number;
}

/**
 * Text data interface - simplified for now
 * TODO: Replace with actual Text model from @cbdb/core
 */
interface TextData {
  id: number;
  title: string;
  titleChn?: string;
  author?: string;
  authorChn?: string;
  year?: number;
  textType?: string;
}

/**
 * Place/Address data interface - simplified for now
 * TODO: Replace with actual Address model from @cbdb/core
 */
interface PlaceData {
  id: number;
  name?: string;
  nameChn?: string;
  placeName?: string;
  placeNameChn?: string;
  type?: string;
  addressType?: string;
  belongsTo?: string;
  belongsToChn?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Office data interface - simplified for now
 * TODO: Replace with actual Office model from @cbdb/core
 */
interface OfficeData {
  id: number;
  title: string;
  titleChn?: string;
  type?: string;
  dynasty?: string;
  dynastyName?: string;
  startYear?: number;
  endYear?: number;
}

/**
 * Factory functions for creating SelectableItem instances for different entity types
 */
export const selectableItemFactories = {
  /**
   * Create a selectable item for a person entity
   */
  person: (data: PersonData, source?: string): SelectableItem<PersonData> => {
    return createSelectableItem({
      ref: `${ENTITY_TYPES.PERSON}:${data.id}`,
      type: ENTITY_TYPES.PERSON,
      data,
      source,
    });
  },

  /**
   * Create a selectable item for a text entity
   */
  text: (data: TextData, source?: string): SelectableItem<TextData> => {
    return createSelectableItem({
      ref: `${ENTITY_TYPES.TEXT}:${data.id}`,
      type: ENTITY_TYPES.TEXT,
      data,
      source,
    });
  },

  /**
   * Create a selectable item for a place/address entity
   */
  place: (data: PlaceData, source?: string): SelectableItem<PlaceData> => {
    return createSelectableItem({
      ref: `${ENTITY_TYPES.PLACE}:${data.id}`,
      type: ENTITY_TYPES.PLACE,
      data,
      source,
    });
  },

  /**
   * Create a selectable item for an office entity
   */
  office: (data: OfficeData, source?: string): SelectableItem<OfficeData> => {
    return createSelectableItem({
      ref: `${ENTITY_TYPES.OFFICE}:${data.id}`,
      type: ENTITY_TYPES.OFFICE,
      data,
      source,
    });
  },
};