/**
 * Barrel file for all pages
 * Importing this file triggers all page self-registrations
 */

// Main section pages
import './HomePage.page';
import './PersonSearchPage.page';
import './PeoplePage.page';
import './OfficesPage.page';
import './PlacesPage.page';
import './TextsPage.page';

// Legacy section pages
import './legacy/PersonBrowser/PersonBrowser.page';

// Analytics section pages
import './analytics/PersonRelationsExplorerPage.page';
import './analytics/PersonTimelineExplorerPage.page';
import './analytics/gis/GISExplorer/GISExplorerPage.page';

// Tools section pages
import './ApiPage.page';

// Settings section pages
import './AboutPage.page';
import './SettingsPage.page';

// Export registry for convenience
export { pageRegistry } from '@/render/registry/PageRegistry';