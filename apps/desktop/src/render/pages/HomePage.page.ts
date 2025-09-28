import { Home } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import { HomePage } from './HomePage';

// Self-register this page
pageRegistry.register({
  id: 'home',
  path: '/',
  component: HomePage,
  title: 'Overview',
  icon: Home,
  metadata: {
    isDefault: true,
    description: 'Dashboard and system overview',
  },
  // No sidebar configuration - homepage stands alone
});

export { HomePage };