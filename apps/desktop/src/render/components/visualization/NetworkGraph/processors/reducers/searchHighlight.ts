/**
 * Search Highlight Reducer
 *
 * Highlights nodes and edges matching a search query.
 * Useful for finding specific elements in large graphs.
 */

import { GraphReducer } from '../GraphReducers';

export interface SearchHighlightOptions {
  /** Search query string */
  query: string;
  /** Fields to search in (default: ['label']) */
  searchFields?: string[];
  /** Whether search is case sensitive */
  caseSensitive?: boolean;
  /** Color for highlighted matches */
  highlightColor?: string;
  /** Whether to hide non-matching elements */
  hideNonMatches?: boolean;
}

/**
 * Create a search highlight reducer
 *
 * @example Basic label search:
 * ```tsx
 * const searchReducer = createSearchHighlightReducer({
 *   query: 'Wang',
 *   highlightColor: '#ff0000'
 * });
 * ```
 *
 * @example Multi-field search with hiding:
 * ```tsx
 * const searchReducer = createSearchHighlightReducer({
 *   query: 'admin',
 *   searchFields: ['label', 'role', 'department'],
 *   hideNonMatches: true
 * });
 * ```
 */
export function createSearchHighlightReducer(
  options: SearchHighlightOptions
): GraphReducer {
  const {
    query,
    searchFields = ['label'],
    caseSensitive = false,
    highlightColor = '#ff6b6b',
    hideNonMatches = false
  } = options;

  const normalizedQuery = caseSensitive ? query : query.toLowerCase();

  const matchesQuery = (attributes: any): boolean => {
    if (!query) return false;

    for (const field of searchFields) {
      const value = attributes[field];
      if (value) {
        const normalizedValue = caseSensitive
          ? String(value)
          : String(value).toLowerCase();

        if (normalizedValue.includes(normalizedQuery)) {
          return true;
        }
      }
    }
    return false;
  };

  return {
    id: 'search-highlight',
    enabled: query.length > 0,
    state: { query, searchFields, caseSensitive, highlightColor, hideNonMatches },

    nodeReducer: (node, attributes, { state }) => {
      const matches = matchesQuery(attributes);

      if (matches) {
        return {
          ...attributes,
          color: state?.highlightColor,
          zIndex: 10,
          highlighted: true,
          matched: true,
        };
      }

      if (state?.hideNonMatches) {
        return {
          ...attributes,
          hidden: true,
          matched: false,
        };
      }

      return {
        ...attributes,
        matched: false,
      };
    },

    edgeReducer: (edge, attributes, { graph, state }) => {
      const matches = matchesQuery(attributes);

      if (matches) {
        return {
          ...attributes,
          color: state?.highlightColor,
          zIndex: 5,
          highlighted: true,
          matched: true,
        };
      }

      // Check if edge connects matched nodes
      if (state?.hideNonMatches) {
        const [source, target] = graph.extremities(edge);
        const sourceAttrs = graph.getNodeAttributes(source);
        const targetAttrs = graph.getNodeAttributes(target);

        if (!matchesQuery(sourceAttrs) || !matchesQuery(targetAttrs)) {
          return {
            ...attributes,
            hidden: true,
            matched: false,
          };
        }
      }

      return {
        ...attributes,
        matched: false,
      };
    }
  };
}