import { Info } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import AboutPage from './AboutPage';

// Self-register this page
pageRegistry.register({
  id: 'about',
  path: '/about',
  component: AboutPage,
  title: 'About',
  icon: Info,
  sidebar: {
    section: 'settings',
    order: 3, // After Settings
  },
  metadata: {
    description: 'Information about CBDB Desktop & Web applications',
    keywords: ['about', 'info', 'licensing', 'author'],
  },
});

export default AboutPage;