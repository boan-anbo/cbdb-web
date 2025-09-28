import { Archive } from 'lucide-react';
import { PageDefinition } from '@/render/registry/types';
import PersonBrowser from './PersonBrowser';

/**
 * Page definition for the Person Browser (Legacy Access interface)
 */
export const personBrowserPageDef: PageDefinition = {
  id: 'person-browser',
  path: '/legacy/person-browser',
  title: 'Person Browser',
  icon: Archive,
  component: PersonBrowser,
  sidebar: {
    section: 'legacy',
    order: 1,
    tooltip: 'Legacy Access Person Browser Interface',
  },
  metadata: {
    description: 'Browse and view person records using the legacy Access interface',
    keywords: ['person', 'browser', 'legacy', 'access', '人物瀏覽'],
  },
};

export default personBrowserPageDef;