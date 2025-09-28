/**
 * EdgeCurveProcessor Component
 *
 * Handles the processing of parallel edges and applies appropriate curvature.
 * This is a modular component that can be configured or disabled.
 */

import { useEffect, FC } from 'react';
import { useSigma } from '@react-sigma/core';
import { indexParallelEdgesIndex, DEFAULT_EDGE_CURVATURE } from '@sigma/edge-curve';

/**
 * Edge curving modes for handling multiple relationships
 */
export type EdgeCurveMode = 'auto' | 'always-straight' | 'always-curved';

interface EdgeCurveProcessorProps {
  /** Mode for handling edge curves (default: 'auto') */
  mode?: EdgeCurveMode;
  /** Maximum curvature amplitude (default: 3.5) */
  amplitude?: number;
  /** Whether to process edges (default: true) */
  enabled?: boolean;
}

/**
 * Calculate curvature for parallel edges
 * Based on Sigma.js parallel edges example
 */
function getCurvature(index: number, maxIndex: number, amplitude: number = 3.5): number {
  if (maxIndex <= 0) throw new Error("Invalid maxIndex");
  if (index < 0) return -getCurvature(-index, maxIndex, amplitude);

  const maxCurvature = amplitude * (1 - Math.exp(-maxIndex / amplitude)) * DEFAULT_EDGE_CURVATURE;
  return (maxCurvature * index) / maxIndex;
}

const EdgeCurveProcessor: FC<EdgeCurveProcessorProps> = ({
  mode = 'auto',
  amplitude = 3.5,
  enabled = true
}) => {
  const sigma = useSigma();

  useEffect(() => {
    if (!enabled) return;

    const graph = sigma.getGraph();
    if (!graph) return;

    // Process based on mode
    switch (mode) {
      case 'always-straight':
        // Force all edges to be straight
        graph.forEachEdge((edge) => {
          graph.mergeEdgeAttributes(edge, {
            type: 'straight',
            curvature: 0,
          });
        });
        break;

      case 'always-curved':
        // Force all edges to be curved with some default curvature
        graph.forEachEdge((edge) => {
          graph.mergeEdgeAttributes(edge, {
            type: 'curved',
            curvature: DEFAULT_EDGE_CURVATURE * 0.5,
          });
        });
        break;

      case 'auto':
      default:
        // Index parallel edges - this modifies the graph directly
        indexParallelEdgesIndex(graph, {
          edgeIndexAttribute: 'parallelIndex',
          edgeMinIndexAttribute: 'parallelMinIndex',
          edgeMaxIndexAttribute: 'parallelMaxIndex',
        });

        // Adapt types and curvature of parallel edges for rendering
        graph.forEachEdge((edge, attributes) => {
          const {
            parallelIndex,
            parallelMinIndex,
            parallelMaxIndex,
          } = attributes as {
            parallelIndex?: number | null;
            parallelMinIndex?: number | null;
            parallelMaxIndex?: number | null;
          };

          // Handle edges with parallelMinIndex (edges going in both directions)
          if (typeof parallelMinIndex === 'number') {
            graph.mergeEdgeAttributes(edge, {
              type: parallelIndex ? 'curved' : 'straight',
              curvature: parallelIndex ? getCurvature(parallelIndex, parallelMaxIndex as number, amplitude) : 0,
            });
          }
          // Handle regular parallel edges (same direction)
          else if (typeof parallelIndex === 'number' && typeof parallelMaxIndex === 'number') {
            graph.mergeEdgeAttributes(edge, {
              type: 'curved',
              curvature: getCurvature(parallelIndex, parallelMaxIndex, amplitude),
            });
          }
          // Single edge
          else {
            graph.setEdgeAttribute(edge, 'type', 'straight');
          }
        });
        break;
    }
    // Force re-render after processing
    sigma.refresh();
  }, [mode, amplitude, enabled, sigma]);

  return null;
};

export default EdgeCurveProcessor;