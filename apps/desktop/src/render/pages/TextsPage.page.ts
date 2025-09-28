import { FileText } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import TextsPage from './TextsPage';

// Self-register this page
pageRegistry.register({
  id: 'texts',
  path: '/texts',
  component: TextsPage,
  title: 'Texts',
  icon: FileText,
  sidebar: false, // Hide from sidebar
  metadata: {
    description: 'Historical texts',
    keywords: ['texts', 'documents', 'writings'],
  },
});

export default TextsPage;
