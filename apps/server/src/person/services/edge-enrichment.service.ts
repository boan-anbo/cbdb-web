/**
 * EdgeEnrichmentService
 * Enriches network edges with human-readable labels and metadata
 * Extracted from PersonNetworkService for modularity and reusability
 */

import { Injectable } from '@nestjs/common';
import { NetworkEdge, KinshipCode } from '@cbdb/core';
import { KinshipCodesRepository } from '../../kinship/kinship-codes.repository';
import { AssociationRepository } from '../../association/association.repository';

/**
 * Service for enriching edges with labels and metadata
 * Converts codes to human-readable descriptions
 * Can be reused for any graph edge labeling needs
 */
@Injectable()
export class EdgeEnrichmentService {
  constructor(
    private readonly kinshipCodeRepo: KinshipCodesRepository,
    private readonly associationRepo: AssociationRepository
  ) {}

  /**
   * Enrich edges with human-readable labels
   * Replaces code-based labels with descriptive text
   *
   * @param edges Array of edges to enrich
   */
  async enrichEdgesWithLabels(edges: NetworkEdge[]): Promise<void> {
    // Collect unique codes by type
    const kinshipCodes = new Set<number>();
    const assocCodes = new Set<number>();

    for (const edge of edges) {
      if (edge.edgeType === 'kinship' && edge.edgeCode) {
        kinshipCodes.add(edge.edgeCode);
      } else if (edge.edgeType === 'association' && edge.edgeCode) {
        assocCodes.add(edge.edgeCode);
      }
    }

    // Fetch labels in batch
    const kinshipLabelMap = await this.getKinshipLabels(Array.from(kinshipCodes));
    const assocLabelMap = await this.getAssociationLabels(Array.from(assocCodes));

    // Apply labels to edges
    for (const edge of edges) {
      if (edge.edgeType === 'kinship' && edge.edgeCode) {
        edge.edgeLabel = kinshipLabelMap.get(edge.edgeCode) || this.getDefaultKinshipLabel(edge.edgeCode);
      } else if (edge.edgeType === 'association' && edge.edgeCode) {
        edge.edgeLabel = assocLabelMap.get(edge.edgeCode) || this.getDefaultAssociationLabel(edge.edgeCode);
      }
    }
  }

  /**
   * Get kinship labels for given codes
   *
   * @param codes Array of kinship codes
   * @returns Map of code to label
   */
  private async getKinshipLabels(codes: number[]): Promise<Map<number, string>> {
    if (codes.length === 0) {
      return new Map();
    }

    const kinshipLabelsMap = await this.kinshipCodeRepo.getKinshipCodes(codes);
    const labelMap = new Map<number, string>();

    for (const [code, kinshipCode] of kinshipLabelsMap) {
      // Prefer Chinese label, fall back to English, then code
      const label = this.formatKinshipLabel(kinshipCode);
      labelMap.set(code, label);
    }

    return labelMap;
  }

  /**
   * Get association labels for given codes
   * TODO: Implement when AssociationCodesRepository is available
   *
   * @param codes Array of association codes
   * @returns Map of code to label
   */
  private async getAssociationLabels(codes: number[]): Promise<Map<number, string>> {
    // TODO: Implement association label fetching when repository method is available
    // For now, return empty map - labels will use default format
    return new Map();

    // Future implementation:
    // const assocLabelsMap = await this.associationRepo.getAssociationCodes(codes);
    // const labelMap = new Map<number, string>();
    // for (const [code, assocCode] of assocLabelsMap) {
    //   const label = this.formatAssociationLabel(assocCode);
    //   labelMap.set(code, label);
    // }
    // return labelMap;
  }

  /**
   * Format kinship label from kinship code object
   *
   * @param kinshipCode Kinship code object
   * @returns Formatted label
   */
  private formatKinshipLabel(kinshipCode: KinshipCode): string {
    // Prefer Chinese name with English in parentheses
    if (kinshipCode.kinRelChn && kinshipCode.kinRel) {
      return `${kinshipCode.kinRelChn} (${kinshipCode.kinRel})`;
    } else if (kinshipCode.kinRelChn) {
      return kinshipCode.kinRelChn;
    } else if (kinshipCode.kinRel) {
      return kinshipCode.kinRel;
    } else {
      return `K${kinshipCode.code}`;
    }
  }

  /**
   * Format association label from association code object
   * TODO: Implement when association code model is available
   *
   * @param assocCode Association code object
   * @returns Formatted label
   */
  private formatAssociationLabel(assocCode: any): string {
    // TODO: Implement proper formatting when association code model is available
    // Similar to kinship: prefer Chinese with English in parentheses
    return `Association ${assocCode.code}`;
  }

  /**
   * Get default kinship label when code lookup fails
   *
   * @param code Kinship code
   * @returns Default label
   */
  private getDefaultKinshipLabel(code: number): string {
    // Common kinship codes - hardcoded fallbacks
    const commonCodes: Record<number, string> = {
      75: '父 (Father)',
      111: '母 (Mother)',
      223: '子 (Son)',
      47: '女 (Daughter)',
      0: '未詳 (Unknown)'
    };

    return commonCodes[code] || `Kinship ${code}`;
  }

  /**
   * Get default association label when code lookup fails
   *
   * @param code Association code
   * @returns Default label
   */
  private getDefaultAssociationLabel(code: number): string {
    // TODO: Add common association codes when available
    return `Association ${code}`;
  }

  /**
   * Add additional metadata to edges
   * Can include timestamps, sources, confidence scores, etc.
   *
   * @param edges Array of edges to enrich
   * @param metadata Additional metadata to add
   */
  enrichEdgesWithMetadata(
    edges: NetworkEdge[],
    metadata: {
      includeTimestamps?: boolean;
      includeConfidence?: boolean;
      includeSource?: boolean;
    }
  ): void {
    for (const edge of edges) {
      if (!edge.metadata) {
        edge.metadata = {};
      }

      if (metadata.includeTimestamps) {
        // TODO: Add year/period information from relationships
      }

      if (metadata.includeConfidence) {
        // TODO: Add confidence scores based on source quality
      }

      if (metadata.includeSource) {
        // TODO: Add source information (which text/document)
      }
    }
  }

  /**
   * Normalize edge directions for consistent visualization
   * Ensures edges always go from lower ID to higher ID
   *
   * @param edges Array of edges to normalize
   */
  normalizeEdgeDirections(edges: NetworkEdge[]): void {
    for (const edge of edges) {
      if (edge.source > edge.target) {
        // Swap source and target
        const temp = edge.source;
        edge.source = edge.target;
        edge.target = temp;

        // Update metadata to indicate reversal
        if (!edge.metadata) {
          edge.metadata = {};
        }
        edge.metadata['reversed'] = true;
      }
    }
  }

  /**
   * Group edges by type for visualization
   *
   * @param edges Array of edges
   * @returns Edges grouped by type
   */
  groupEdgesByType(edges: NetworkEdge[]): {
    kinship: NetworkEdge[];
    association: NetworkEdge[];
  } {
    return {
      kinship: edges.filter(e => e.edgeType === 'kinship'),
      association: edges.filter(e => e.edgeType === 'association')
    };
  }

  /**
   * Deduplicate edges (remove parallel edges between same nodes)
   * Keeps the edge with most information
   *
   * @param edges Array of edges
   * @returns Deduplicated edges
   */
  deduplicateEdges(edges: NetworkEdge[]): NetworkEdge[] {
    const edgeMap = new Map<string, NetworkEdge>();

    for (const edge of edges) {
      const key = [edge.source, edge.target].sort().join('-');

      if (!edgeMap.has(key)) {
        edgeMap.set(key, edge);
      } else {
        // Keep edge with more information
        const existing = edgeMap.get(key)!;
        if (this.getEdgeInfoScore(edge) > this.getEdgeInfoScore(existing)) {
          edgeMap.set(key, edge);
        }
      }
    }

    return Array.from(edgeMap.values());
  }

  /**
   * Calculate information score for an edge
   * Higher score = more information
   *
   * @param edge Edge to score
   * @returns Information score
   */
  private getEdgeInfoScore(edge: NetworkEdge): number {
    let score = 0;
    if (edge.edgeLabel && edge.edgeLabel !== '') score += 2;
    if (edge.edgeCode) score += 1;
    if (edge.metadata) score += Object.keys(edge.metadata).length;
    return score;
  }
}