import { GitBranch } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import PersonRelationsExplorerPage from './PersonRelationsExplorerPage';

// Self-register this page
pageRegistry.register({
  id: 'person-relations-explorer',
  path: '/analytics/person-relations',
  component: PersonRelationsExplorerPage,
  title: 'Person Relations Explorer',
  icon: GitBranch,
  sidebar: {
    section: 'analytics-network',
    label: 'Person Relations Explorer',
    order: 1,
    tooltip: 'Explore all relationships - kinship, associations and more',
  },
  metadata: {
    description: 'Unified explorer for all person relationships in the CBDB database',
    keywords: ['person', 'relations', 'kinship', 'association', 'office', 'network', 'explorer', 'visualization', 'graph'],
  },
});

export default PersonRelationsExplorerPage;