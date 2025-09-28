/**
 * Entity Graph Builder Service
 *
 * Higher-level abstraction for building entity-relationship graphs.
 * Understands entities and relationships but remains domain-agnostic.
 *
 * @description
 * This builder provides semantic methods for constructing graphs with:
 * - Entity management (tracking types and IDs)
 * - Relationship patterns (one-to-many, many-to-many, hierarchies)
 * - Network construction helpers
 * - Automatic node creation for relationships
 *
 * Key concepts:
 * - Entities are nodes with a type and ID (e.g., 'person:123')
 * - Relationships are typed edges between entities
 * - The builder remains agnostic to specific domain models
 *
 * @example
 * ```typescript
 * const graph = new EntityGraphBuilder<PersonNode, RelationEdge>(builder)
 *   .directed()
 *   .addEntity('person', 123, { name: 'Wang Anshi' })
 *   .addEntity('person', 456, { name: 'Wang Ang' })
 *   .relate('person', 123, 'person', 456, 'brother')
 *   .build();
 * ```
 *
 * @module GraphModule
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { GraphBuilder } from './graph-builder.service';
import { EntityNodeAttributes, RelationshipEdgeAttributes } from '@cbdb/core';

export interface EntityExtractorResult<N = any> {
  id: string | number;
  attributes?: Omit<N, 'entityType' | 'entityId'>;
}

export interface RelationshipExtractorResult<E = any> {
  fromType: string;
  fromId: string | number;
  toType: string;
  toId: string | number;
  relationshipType: string;
  attributes?: Omit<E, 'relationshipType'>;
}

@Injectable()
export class EntityGraphBuilder<
  N extends EntityNodeAttributes = EntityNodeAttributes,
  E extends RelationshipEdgeAttributes = RelationshipEdgeAttributes
> {
  private builder: GraphBuilder<N, E>;
  private entities = new Map<string, Set<string | number>>();
  private autoCreateNodes = true;

  constructor(builder: GraphBuilder<N, E>) {
    this.builder = builder;
  }

  /**
   * Set whether to automatically create nodes when adding relationships
   */
  withAutoCreateNodes(enabled: boolean): EntityGraphBuilder<N, E> {
    this.autoCreateNodes = enabled;
    return this;
  }

  /**
   * Initialize as directed graph
   */
  directed(): EntityGraphBuilder<N, E> {
    this.builder.directed();
    return this;
  }

  /**
   * Initialize as undirected graph
   */
  undirected(): EntityGraphBuilder<N, E> {
    this.builder.undirected();
    return this;
  }

  /**
   * Initialize as mixed graph
   */
  mixed(): EntityGraphBuilder<N, E> {
    this.builder.mixed();
    return this;
  }

  /**
   * Add a single entity to the graph
   *
   * Creates a node with a composite ID of format "type:id".
   *
   * @param type - Entity type (e.g., 'person', 'office', 'place')
   * @param id - Entity identifier
   * @param attributes - Optional attributes excluding entityType and entityId
   * @returns This builder instance for method chaining
   */
  addEntity(
    type: string,
    id: string | number,
    attributes?: Omit<N, 'entityType' | 'entityId'>
  ): EntityGraphBuilder<N, E> {
    const nodeId = this.createNodeId(type, id);
    const nodeAttributes = {
      entityType: type,
      entityId: id,
      ...attributes
    } as N;

    this.builder.addNode(nodeId, nodeAttributes);
    this.trackEntity(type, id);
    return this;
  }

  /**
   * Add multiple entities of the same type
   */
  addEntities(
    type: string,
    entities: Array<{ id: string | number; attributes?: Omit<N, 'entityType' | 'entityId'> }>
  ): EntityGraphBuilder<N, E> {
    entities.forEach(entity => {
      this.addEntity(type, entity.id, entity.attributes);
    });
    return this;
  }

  /**
   * Transform a collection into entities
   */
  addEntitiesFrom<T>(
    type: string,
    collection: T[],
    extractor: (item: T) => EntityExtractorResult<N>
  ): EntityGraphBuilder<N, E> {
    collection.forEach(item => {
      const entity = extractor(item);
      this.addEntity(type, entity.id, entity.attributes);
    });
    return this;
  }

  /**
   * Add a relationship between two entities
   *
   * Creates a directed edge between two entities. If autoCreateNodes is enabled,
   * automatically creates missing entities.
   *
   * @param fromType - Source entity type
   * @param fromId - Source entity ID
   * @param toType - Target entity type
   * @param toId - Target entity ID
   * @param relationshipType - Type of relationship (e.g., 'kinship', 'association')
   * @param attributes - Optional edge attributes
   * @returns This builder instance for method chaining
   */
  relate(
    fromType: string,
    fromId: string | number,
    toType: string,
    toId: string | number,
    relationshipType: string,
    attributes?: Omit<E, 'relationshipType'>
  ): EntityGraphBuilder<N, E> {
    // Auto-create nodes if enabled
    if (this.autoCreateNodes) {
      if (!this.hasEntity(fromType, fromId)) {
        this.addEntity(fromType, fromId);
      }
      if (!this.hasEntity(toType, toId)) {
        this.addEntity(toType, toId);
      }
    }

    const sourceId = this.createNodeId(fromType, fromId);
    const targetId = this.createNodeId(toType, toId);
    const edgeAttributes = {
      relationshipType,
      ...attributes
    } as E;

    this.builder.addEdge(sourceId, targetId, edgeAttributes);
    return this;
  }

  /**
   * Transform a collection into relationships
   */
  relateFrom<T>(
    collection: T[],
    extractor: (item: T) => RelationshipExtractorResult<E>
  ): EntityGraphBuilder<N, E> {
    collection.forEach(item => {
      const rel = extractor(item);
      this.relate(
        rel.fromType,
        rel.fromId,
        rel.toType,
        rel.toId,
        rel.relationshipType,
        rel.attributes
      );
    });
    return this;
  }

  /**
   * Add one-to-many relationships
   */
  oneToMany(
    one: { type: string; id: string | number; attributes?: Omit<N, 'entityType' | 'entityId'> },
    many: Array<{ type: string; id: string | number; attributes?: Omit<N, 'entityType' | 'entityId'> }>,
    relationshipType: string,
    relationshipAttributes?: Omit<E, 'relationshipType'>
  ): EntityGraphBuilder<N, E> {
    // Add the "one" entity
    this.addEntity(one.type, one.id, one.attributes);

    // Add all "many" entities and relate them
    many.forEach(item => {
      this.addEntity(item.type, item.id, item.attributes);
      this.relate(
        one.type,
        one.id,
        item.type,
        item.id,
        relationshipType,
        relationshipAttributes
      );
    });

    return this;
  }

  /**
   * Add many-to-many relationships
   */
  manyToMany(
    group1: Array<{ type: string; id: string | number; attributes?: Omit<N, 'entityType' | 'entityId'> }>,
    group2: Array<{ type: string; id: string | number; attributes?: Omit<N, 'entityType' | 'entityId'> }>,
    relationshipType: string,
    relationshipAttributes?: Omit<E, 'relationshipType'>
  ): EntityGraphBuilder<N, E> {
    // Add all entities from both groups
    group1.forEach(item => this.addEntity(item.type, item.id, item.attributes));
    group2.forEach(item => this.addEntity(item.type, item.id, item.attributes));

    // Create relationships between all pairs
    group1.forEach(item1 => {
      group2.forEach(item2 => {
        this.relate(
          item1.type,
          item1.id,
          item2.type,
          item2.id,
          relationshipType,
          relationshipAttributes
        );
      });
    });

    return this;
  }

  /**
   * Create a hierarchical structure
   */
  hierarchy(
    parentType: string,
    parentId: string | number,
    children: Array<{ type: string; id: string | number; attributes?: Omit<N, 'entityType' | 'entityId'> }>,
    relationshipType: string = 'parent-child'
  ): EntityGraphBuilder<N, E> {
    this.addEntity(parentType, parentId);

    children.forEach(child => {
      this.addEntity(child.type, child.id, child.attributes);
      this.relate(
        parentType,
        parentId,
        child.type,
        child.id,
        relationshipType
      );
    });

    return this;
  }

  /**
   * Create a network around a central entity
   *
   * Builds a star-like structure with a central entity connected to multiple
   * collections of related entities. Useful for person-centric views.
   *
   * @param centerType - Central entity type
   * @param centerId - Central entity ID
   * @param centerAttributes - Attributes for the central entity
   * @param relations - Array of relation definitions, each containing:
   *   - collection: Items to process
   *   - targetType: Type for related entities
   *   - relationshipType: Type of relationship
   *   - entityExtractor: Function to extract entity data from items
   *   - relationshipAttributes: Optional function to extract edge attributes
   * @returns This builder instance for method chaining
   *
   * @example
   * ```typescript
   * builder.network(
   *   'person', 123, { name: 'Wang Anshi' },
   *   [{
   *     collection: kinships,
   *     targetType: 'person',
   *     relationshipType: 'kinship',
   *     entityExtractor: k => ({ id: k.kinId, attributes: { name: k.kinName } })
   *   }]
   * )
   * ```
   */
  network<T>(
    centerType: string,
    centerId: string | number,
    centerAttributes: Omit<N, 'entityType' | 'entityId'> | undefined,
    relations: Array<{
      collection: T[];
      targetType: string;
      relationshipType: string;
      entityExtractor: (item: T) => EntityExtractorResult<N>;
      relationshipAttributes?: (item: T) => Omit<E, 'relationshipType'>;
    }>
  ): EntityGraphBuilder<N, E> {
    // Add center entity
    this.addEntity(centerType, centerId, centerAttributes);

    // Process each relation type
    relations.forEach(relation => {
      relation.collection.forEach(item => {
        const entity = relation.entityExtractor(item);
        this.addEntity(relation.targetType, entity.id, entity.attributes);

        const relAttributes = relation.relationshipAttributes?.(item);
        this.relate(
          centerType,
          centerId,
          relation.targetType,
          entity.id,
          relation.relationshipType,
          relAttributes
        );
      });
    });

    return this;
  }

  /**
   * Check if an entity exists
   */
  hasEntity(type: string, id: string | number): boolean {
    return this.entities.get(type)?.has(id) || false;
  }

  /**
   * Get all entities of a specific type
   */
  getEntitiesOfType(type: string): Array<string | number> {
    return Array.from(this.entities.get(type) || []);
  }

  /**
   * Get all entity types
   */
  getEntityTypes(): string[] {
    return Array.from(this.entities.keys());
  }

  /**
   * Apply a custom function to the underlying builder
   */
  apply(
    fn: (builder: GraphBuilder<N, E>) => void
  ): EntityGraphBuilder<N, E> {
    fn(this.builder);
    return this;
  }

  /**
   * Build and return the graph
   */
  build(): Graph<N, E> {
    return this.builder.build();
  }

  /**
   * Get current graph metrics
   */
  getMetrics() {
    return this.builder.getMetrics();
  }

  /**
   * Reset the builder
   */
  reset(): EntityGraphBuilder<N, E> {
    this.builder.reset();
    this.entities.clear();
    return this;
  }

  private createNodeId(type: string, id: string | number): string {
    return `${type}:${id}`;
  }

  private trackEntity(type: string, id: string | number): void {
    if (!this.entities.has(type)) {
      this.entities.set(type, new Set());
    }
    this.entities.get(type)!.add(id);
  }
}