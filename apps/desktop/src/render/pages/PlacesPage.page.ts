import { MapPin } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import PlacesPage from './PlacesPage';

// Self-register this page
pageRegistry.register({
  id: 'places',
  path: '/places',
  component: PlacesPage,
  title: 'Places',
  icon: MapPin,
  sidebar: false, // Hide from sidebar
  metadata: {
    description: 'Geographic locations',
    keywords: ['places', 'locations', 'geography'],
  },
});

export default PlacesPage;
