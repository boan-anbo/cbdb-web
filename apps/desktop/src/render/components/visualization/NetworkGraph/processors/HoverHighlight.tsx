/**
 * HoverHighlight Component
 *
 * Provides interactive hover effects using the GraphReducers system.
 * Matches the official Sigma.js example behavior:
 * - Hovered node and neighbors remain fully visible with labels
 * - Other nodes are faded to light gray (#f6f6f6) without labels
 * - Creates a subtle background effect that maintains graph structure
 */

import { useEffect, useState, FC } from 'react';
import { useRegisterEvents } from '@react-sigma/core';
import GraphReducers from './GraphReducers';
import { createHoverHighlightReducer } from './reducers/hoverHighlight';

interface HoverHighlightProps {
  /** Whether to show edges between neighbors */
  showNeighborEdges?: boolean;
}

const HoverHighlight: FC<HoverHighlightProps> = ({
  showNeighborEdges = false,
}) => {
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    // Register hover events
    registerEvents({
      enterNode: (event) => {
        setHoveredNode(event.node);
        document.body.style.cursor = 'pointer';
      },
      leaveNode: () => {
        setHoveredNode(null);
        document.body.style.cursor = 'default';
      },
    });
  }, [registerEvents]);

  // Create reducer with current hover state
  const hoverReducer = createHoverHighlightReducer({
    hoveredNode,
    showNeighborEdges,
  });

  return <GraphReducers reducers={[hoverReducer]} />;
};

export default HoverHighlight;