/**
 * ClusterLabels Component
 *
 * Adds labels to graph clusters based on dominant relationship types.
 * Identifies clusters through community detection and labels them.
 *
 * Note: This component uses visual overlay rather than adding nodes to the graph
 * to avoid Sigma rendering errors with custom node types.
 */

import { FC, useEffect, useState, useRef } from 'react';
import { useSigma } from '@react-sigma/core';
import louvain from 'graphology-communities-louvain';

interface ClusterInfo {
  id: string;
  label: string;
  nodeCount: number;
  dominantType: 'kinship' | 'association' | 'office' | 'mixed';
  center: { x: number; y: number };
  color: string;
}

interface ClusterLabelsProps {
  /** Minimum nodes required to show a cluster label */
  minClusterSize?: number;
  /** Whether to show cluster labels */
  enabled?: boolean;
}

const ClusterLabels: FC<ClusterLabelsProps> = ({
  minClusterSize = 5,
  enabled = true
}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const calculateClusters = () => {
      // Skip if nodes don't have positions yet
      const firstNode = graph.nodes()[0];
      if (!firstNode) return;

      const attrs = graph.getNodeAttributes(firstNode);
      if (attrs.x === undefined || attrs.x === 0 && attrs.y === 0) {
        // Layout hasn't been applied yet, wait
        return;
      }

      // Run Louvain community detection
      const communities = louvain(graph);

      // Group nodes by community
      const communityGroups = new Map<string, string[]>();
      Object.entries(communities).forEach(([node, community]) => {
        // Skip cluster label nodes if they exist
        if (node.startsWith('cluster-label-')) return;

        const commId = community.toString();
        if (!communityGroups.has(commId)) {
          communityGroups.set(commId, []);
        }
        communityGroups.get(commId)!.push(node);
      });

      // Analyze each community
      const clusterInfos: ClusterInfo[] = [];
      communityGroups.forEach((nodes, clusterId) => {
        if (nodes.length < minClusterSize) return;

        // Count relationship types in this cluster
        const relationshipCounts = { kinship: 0, association: 0, office: 0 };

        // Check edges within the cluster
        nodes.forEach(node => {
          graph.forEachEdge(node, (edge, attributes, source, target) => {
            // Only count edges within the cluster
            if (nodes.includes(source) && nodes.includes(target)) {
              const edgeType = attributes.edgeType || 'unknown';
              if (edgeType in relationshipCounts) {
                relationshipCounts[edgeType as keyof typeof relationshipCounts]++;
              }
            }
          });
        });

        // Determine dominant type
        const types = Object.entries(relationshipCounts);
        const dominant = types.reduce((a, b) => a[1] > b[1] ? a : b);
        const dominantType = dominant[1] > 0 ? dominant[0] as any : 'mixed';

        // Calculate cluster center
        let sumX = 0, sumY = 0;
        let validNodes = 0;
        nodes.forEach(node => {
          const nodeData = graph.getNodeAttributes(node);
          if (nodeData.x !== undefined && nodeData.y !== undefined) {
            sumX += nodeData.x;
            sumY += nodeData.y;
            validNodes++;
          }
        });

        // Skip if no valid positions
        if (validNodes === 0) return;

        // Create label based on dominant type
        const labels = {
          kinship: `Family Network (${nodes.length} people)`,
          association: `Social Network (${nodes.length} people)`,
          office: `Official Network (${nodes.length} people)`,
          mixed: `Mixed Network (${nodes.length} people)`
        };

        // Choose color based on type
        const colors = {
          kinship: '#e74c3c',    // Red for family
          association: '#3498db', // Blue for social
          office: '#2ecc71',      // Green for official
          mixed: '#95a5a6'        // Gray for mixed
        };

        clusterInfos.push({
          id: clusterId,
          label: labels[dominantType],
          nodeCount: nodes.length,
          dominantType,
          center: {
            x: sumX / validNodes,
            y: sumY / validNodes
          },
          color: colors[dominantType]
        });
      });

      setClusters(clusterInfos);
    };

    // Wait for layout to be applied
    const checkAndCalculate = () => {
      calculateClusters();
      // Check again after a delay if no clusters found
      if (clusters.length === 0) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setTimeout(checkAndCalculate, 500);
        });
      }
    };

    checkAndCalculate();

    // Listen for camera updates to recalculate
    const handleCameraUpdate = () => {
      calculateClusters();
    };

    sigma.on('afterRender', handleCameraUpdate);

    return () => {
      sigma.off('afterRender', handleCameraUpdate);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [graph, enabled, minClusterSize, sigma]);

  // Render labels as overlay
  if (!enabled || clusters.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      {clusters.map(cluster => {
        // Convert graph coordinates to screen coordinates
        const coords = sigma.graphToViewport(cluster.center);

        return (
          <div
            key={cluster.id}
            style={{
              position: 'absolute',
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: 'translate(-50%, -50%)',
              padding: '4px 8px',
              backgroundColor: `${cluster.color}22`,
              border: `2px solid ${cluster.color}`,
              borderRadius: '4px',
              color: cluster.color,
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              opacity: 0.9
            }}
          >
            {cluster.label}
          </div>
        );
      })}
    </div>
  );
};

export default ClusterLabels;