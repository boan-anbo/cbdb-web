import { Clock } from 'lucide-react';
import { pageRegistry } from '@/render/registry/PageRegistry';
import PersonTimelineExplorerPage from './PersonTimelineExplorerPage';

// Self-register this page
pageRegistry.register({
  id: 'person-timeline-explorer',
  path: '/analytics/person-timeline',
  component: PersonTimelineExplorerPage,
  title: 'Person Timeline',
  icon: Clock,
  sidebar: {
    section: 'analytics-time',
    order: 1,
    tooltip: 'Explore individual life trajectories through interactive timelines',
  },
  metadata: {
    description: 'Interactive explorer for person life timelines with comprehensive filtering and visualization',
    keywords: ['person', 'timeline', 'life', 'events', 'chronology', 'visualization', 'trajectory'],
  },
});

export default PersonTimelineExplorerPage;