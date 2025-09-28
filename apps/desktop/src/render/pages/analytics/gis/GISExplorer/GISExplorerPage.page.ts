import { pageRegistry } from '@/render/registry/PageRegistry';
import { MapPin } from 'lucide-react';
import GISExplorerPage from './GISExplorerPage';

// Register the GIS Explorer page
pageRegistry.register({
  id: 'gis-explorer',
  path: '/analytics/gis',
  component: GISExplorerPage,
  title: 'GIS Explorer',
  icon: MapPin,
  sidebar: {
    section: 'analytics-space',
    order: 1,
    visible: true
  },
  metadata: {
    environment: ['development', 'production'],
    description: 'Geographic visualization and analysis of historical data'
  }
});