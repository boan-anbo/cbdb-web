import { Settings } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import SettingsPage from './SettingsPage';

// Self-register this page
pageRegistry.register({
  id: 'settings',
  path: '/settings',
  component: SettingsPage,
  title: 'Settings',
  icon: Settings,
  sidebar: {
    section: 'settings',
    order: 2,
  },
  metadata: {
    description: 'Application settings',
    keywords: ['settings', 'preferences', 'configuration'],
  },
});

export default SettingsPage;
