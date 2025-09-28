import { Building } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import OfficesPage from './OfficesPage';

// Self-register this page
pageRegistry.register({
  id: 'offices',
  path: '/offices',
  component: OfficesPage,
  title: 'Offices',
  icon: Building,
  sidebar: false, // Hide from sidebar
  metadata: {
    description: 'Official positions',
    keywords: ['offices', 'positions', 'titles'],
  },
});

export default OfficesPage;