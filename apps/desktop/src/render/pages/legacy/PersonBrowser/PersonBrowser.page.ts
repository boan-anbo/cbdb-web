import { Archive } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import PersonBrowser from './PersonBrowser';

// Self-register this page
pageRegistry.register({
  id: 'person-browser',
  path: '/person-browser',
  component: PersonBrowser,
  title: 'Person Browser',
  icon: Archive,
  sidebar: {
    section: 'legacy',
    order: 1,
  },
  metadata: {
    keywords: ['legacy', 'access', 'browser', 'person'],
  },
});

export default PersonBrowser;