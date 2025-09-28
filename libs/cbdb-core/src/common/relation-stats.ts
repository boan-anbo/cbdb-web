/**
 * Common structures for relation statistics
 * Reusable across all domains that have relations
 */

/**
 * Relation count - just the count
 */
export class RelationCount {
  constructor(
    /** Total count of relations */
    public count: number
  ) {}
}

/**
 * Relation stat - includes count and IDs
 * Used to provide summary information without loading full data
 */
export class RelationStat {
  constructor(
    /** Total count of relations */
    public count: number,
    /** Array of related entity IDs */
    public ids: number[],
    /** Name of the relation table */
    public tableName: string
  ) {}
}