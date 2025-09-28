import { Users } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import PeoplePage from './PeoplePage';

// Self-register this page
pageRegistry.register({
  id: 'people',
  path: '/people',
  component: PeoplePage,
  title: 'People',
  icon: Users,
  sidebar: false, // Hide from sidebar
  metadata: {
    description: 'Browse all people',
    keywords: ['people', 'persons', 'browse'],
  },
});

export default PeoplePage;