import { Users } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import KinshipExplorerPage from './KinshipExplorerPage';

// Self-register this page
pageRegistry.register({
  id: 'kinship-explorer',
  path: '/analytics/kinship-explorer',
  component: KinshipExplorerPage,
  title: 'Kinship Explorer',
  icon: Users,
  sidebar: {
    section: 'tools', // Analytics section
    order: 1, // Put it first in analytics
    tooltip: 'Explore family relationships and genealogical connections',
  },
  metadata: {
    description: 'Explore family relationships and genealogical connections in the CBDB database',
    keywords: ['kinship', 'family', 'genealogy', 'explorer', 'relationships', 'network', 'visualization'],
  },
});

export default KinshipExplorerPage;