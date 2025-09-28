// Person integration
export {
  personToSelectableItem,
  selectableItemToPerson,
  isPersonSelectableItem,
  getPersonIdFromRef,
  createPersonRef,
} from './person/person-selector.adapter';

export {
  renderPersonDisplay,
  registerPersonRenderer,
  getPersonCompactDisplay,
  getPersonFullName,
} from './person/person-selector.renderer';

// Import for local use in registerAllRenderers
import { registerPersonRenderer } from './person/person-selector.renderer';

// Register all renderers
export function registerAllRenderers(): void {
  registerPersonRenderer();
  // Future: registerTextRenderer(), registerOfficeRenderer(), etc.
}