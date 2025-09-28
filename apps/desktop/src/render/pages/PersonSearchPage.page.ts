import { Users } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import { PersonSearchPage } from './PersonSearchPage';

// Self-register this page
pageRegistry.register({
  id: 'person-search',
  path: '/person-search',
  component: PersonSearchPage,
  title: 'Search People',
  icon: Users,
  sidebar: {
    section: 'main',
    label: 'Search People',
    order: 1,
  },
  metadata: {
    description: 'Search people in CBDB',
    keywords: ['search', 'person', 'people', 'biography'],
  },
});

export { PersonSearchPage };