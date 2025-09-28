import { Users } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import KinshipRelationshipsPage from './KinshipRelationshipsPage';

// Self-register this page
pageRegistry.register({
  id: 'kinship-relationships',
  path: '/analytics/kinship',
  component: KinshipRelationshipsPage,
  title: 'Kinship Networks',
  icon: Users,
  sidebar: {
    section: 'analytics-network',
    order: 2,
    tooltip: 'Visualize kinship networks',
  },
  metadata: {
    description: 'Interactive visualization of kinship relationships',
    keywords: ['kinship', 'relationships', 'family', 'network', 'visualization', 'graph'],
  },
});

export default KinshipRelationshipsPage;