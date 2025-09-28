/**
 * Association DataView models - Purpose-specific projections
 *
 * DataView Level (Level 4 of 4-level hierarchy)
 * - Purpose-specific compositions and projections
 * - Tailored data shapes for specific UI/business needs
 * - Located primarily in Services, not Repositories
 * - Named as [Domain][Purpose]DataView
 */

import { AssociationFullExtendedModel } from './association.model.extended';

/**
 * AssociationTimelineDataView - Optimized for timeline display
 *
 * Projection of association data specifically for timeline visualization
 * - Flattened structure for easy timeline rendering
 * - Pre-formatted display strings
 * - Only relevant fields for timeline display
 */
export class AssociationTimelineDataView {
  constructor(
    /**
     * Person ID (for context)
     */
    public personId: number,

    /**
     * Event title for timeline display
     * Format: "[Association Type]: [Associated Person Name]"
     * e.g., "Friend: Wang Anshi", "Sent letter to: Su Shi"
     */
    public title: string,

    /**
     * Event description with full context
     * Includes kinship context if relevant
     */
    public description: string | null,

    /**
     * Start year (Western calendar)
     */
    public startYear: number | null,

    /**
     * End year (Western calendar)
     */
    public endYear: number | null,

    /**
     * Event type for categorization
     * Fixed as 'association' for filtering
     */
    public eventType: 'association' = 'association',

    /**
     * Association category for sub-filtering
     * e.g., 'literary', 'political', 'friendship'
     */
    public category: string | null,

    /**
     * Associated person information
     */
    public associatedPerson: {
      id: number;
      name: string | null;
      nameChn: string | null;
    } | null,

    /**
     * Location information if available
     */
    public location: {
      id: number;
      name: string | null;
      nameChn: string | null;
    } | null,

    /**
     * Source reference
     */
    public source: {
      id: string;
      title: string | null;
      titleChn: string | null;
    } | null,

    /**
     * Original association code for filtering
     */
    public assocCode: number,

    /**
     * Display priority for timeline ordering
     * Higher = more important
     */
    public priority: number = 0,
  ) {}

  /**
   * Create from ExtendedModel
   */
  static fromExtendedModel(extended: AssociationFullExtendedModel): AssociationTimelineDataView {
    // Format title based on association type and person
    const assocType = extended.assocTypeDescriptionChn || extended.assocTypeDescription || `Type ${extended.assocCode}`;
    const personName = extended.assocPersonInfo?.nameChn || extended.assocPersonInfo?.name || 'Unknown Person';
    const title = `${assocType}: ${personName}`;

    // Build description with context
    let description = '';
    if (extended.notes) {
      description = extended.notes;
    } else if (extended.assocPersonInfo) {
      description = `Association with ${personName}`;
    }

    // Determine category based on association code
    const category = AssociationTimelineDataView.categorizeAssociation(extended.assocCode);

    return new AssociationTimelineDataView(
      extended.personId,
      title,
      description,
      extended.firstYear,
      extended.lastYear,
      'association',
      category,
      extended.assocPersonInfo ? {
        id: extended.assocPersonInfo.personId,
        name: extended.assocPersonInfo.name,
        nameChn: extended.assocPersonInfo.nameChn
      } : null,
      extended.addressInfo ? {
        id: extended.addressInfo.id,
        name: extended.addressInfo.name,
        nameChn: extended.addressInfo.nameChn
      } : null,
      extended.sourceInfo ? {
        id: String(extended.sourceInfo.id),
        title: extended.sourceInfo.title,
        titleChn: extended.sourceInfo.titleChn
      } : null,
      extended.assocCode,
      AssociationTimelineDataView.calculatePriority(extended.assocCode)
    );
  }

  /**
   * Categorize association based on code
   */
  private static categorizeAssociation(code: number): string {
    // Based on common association codes from schema
    if (code >= 400 && code < 500) return 'literary';  // Literary exchanges
    if (code >= 1 && code < 100) return 'friendship';   // Personal relationships
    if (code >= 100 && code < 200) return 'political';  // Political relationships
    if (code >= 200 && code < 300) return 'academic';   // Academic relationships
    return 'other';
  }

  /**
   * Calculate display priority
   */
  private static calculatePriority(code: number): number {
    // Higher priority for more significant relationships
    const significantCodes = [9, 437, 429, 43]; // Friend, sent poems, sent letter, epitaph
    if (significantCodes.includes(code)) return 10;
    return 5;
  }
}

/**
 * AssociationNetworkDataView - Optimized for network graph display
 *
 * Projection of association data for network visualization
 * - Graph-oriented structure
 * - Edge weight calculations
 * - Node clustering information
 */
export class AssociationNetworkDataView {
  constructor(
    /**
     * Source person ID (node)
     */
    public sourcePersonId: number,

    /**
     * Target person ID (node)
     */
    public targetPersonId: number,

    /**
     * Edge type (association type)
     */
    public edgeType: string,

    /**
     * Edge weight (strength of relationship)
     */
    public weight: number,

    /**
     * Edge label for display
     */
    public label: string,

    /**
     * Bidirectional flag
     */
    public bidirectional: boolean,

    /**
     * Time period
     */
    public period: {
      start: number | null;
      end: number | null;
    } | null,

    /**
     * Additional metadata
     */
    public metadata: Record<string, any>,
  ) {}

  /**
   * Create from ExtendedModel for network display
   */
  static fromExtendedModel(extended: AssociationFullExtendedModel): AssociationNetworkDataView {
    const edgeType = extended.assocTypeDescription || `assoc_${extended.assocCode}`;
    const label = extended.assocTypeDescriptionChn || extended.assocTypeDescription || '';

    // Calculate weight based on association type and count
    const weight = (extended.assocCount || 1) * AssociationNetworkDataView.getTypeWeight(extended.assocCode);

    return new AssociationNetworkDataView(
      extended.personId,
      extended.assocPersonId || extended.assocId,
      edgeType,
      weight,
      label,
      false, // Most associations are directional
      extended.firstYear || extended.lastYear ? {
        start: extended.firstYear,
        end: extended.lastYear
      } : null,
      {
        assocCode: extended.assocCode,
        hasKinshipContext: !!(extended.kinCode || extended.assocKinCode),
        hasTertiaryPerson: !!extended.tertiaryPersonId
      }
    );
  }

  /**
   * Get weight multiplier for association type
   */
  private static getTypeWeight(code: number): number {
    // Stronger relationships get higher weights
    if (code === 9) return 3;     // Friend - strong connection
    if (code === 437) return 2;   // Sent poems - cultural exchange
    if (code === 429) return 2;   // Sent letter - communication
    return 1;                      // Default weight
  }
}