import { Code2 } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import ApiPage from './ApiPage';

// Self-register this page
pageRegistry.register({
  id: 'api',
  path: '/developer/api',
  component: ApiPage,
  title: 'API Documentation',
  icon: Code2,
  sidebar: {
    section: 'settings',
    order: 0, // Before Documentation
  },
  metadata: {
    description: "API for CBDB Desktop's built-in server's REST API endpoints",
    keywords: ['api', 'documentation', 'developer'],
  },
});

export default ApiPage;
