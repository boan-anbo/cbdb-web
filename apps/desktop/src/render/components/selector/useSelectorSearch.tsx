import { useState } from 'react';
import { SelectableItem } from './types';

/**
 * Custom hook for managing selector search functionality
 */
export function useSelectorSearch(items: SelectableItem[]) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const filteredItems = (() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      // Search in type
      if (item.type.toLowerCase().includes(query)) return true;

      // Search in ref (e.g., "person:123")
      if (item.ref.toLowerCase().includes(query)) return true;

      // Search in data fields (flexible search across common fields)
      const data = item.data as any;
      if (data) {
        // Common name fields
        const nameFields = [
          data.name,
          data.nameChn,
          data.title,
          data.titleChn,
          data.label,
          data.placeName,
          data.placeNameChn,
        ].filter(Boolean);

        if (nameFields.some(field =>
          String(field).toLowerCase().includes(query)
        )) {
          return true;
        }

        // Search in description/sublabel fields
        const descFields = [
          data.description,
          data.sublabel,
          data.dynastyName,
          data.dynastyNameChn,
        ].filter(Boolean);

        if (descFields.some(field =>
          String(field).toLowerCase().includes(query)
        )) {
          return true;
        }
      }

      return false;
    });
  })();

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
}