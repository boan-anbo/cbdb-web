/**
 * GraphCacheService
 * Caches graph instances to avoid rebuilding for every operation
 * Improves performance significantly for complex analyses
 */

import { Injectable } from '@nestjs/common';
import Graph from 'graphology';
import { NetworkEdge } from '@cbdb/core';
import * as crypto from 'crypto';

/**
 * Cache entry with graph and metadata
 */
interface CacheEntry {
  graph: Graph;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

/**
 * Service to cache and reuse graph instances
 * Prevents rebuilding the same graph for multiple operations
 */
@Injectable()
export class GraphCacheService {
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 100; // Maximum number of cached graphs
  private maxAge = 15 * 60 * 1000; // 15 minutes

  /**
   * Get or build a graph from cache
   *
   * @param nodes Set of node IDs
   * @param edges Array of network edges
   * @param directed Whether the graph is directed
   * @param builder Function to build the graph if not cached
   * @returns Cached or newly built graph
   */
  getOrBuild(
    nodes: Set<number>,
    edges: NetworkEdge[],
    directed: boolean = false,
    builder: (nodes: Set<number>, edges: NetworkEdge[], directed: boolean) => Graph
  ): Graph {
    const key = this.computeCacheKey(nodes, edges, directed);

    // Check if cached
    const cached = this.cache.get(key);
    if (cached) {
      // Update access metadata
      cached.lastAccessed = new Date();
      cached.accessCount++;
      return cached.graph;
    }

    // Build new graph
    const graph = builder(nodes, edges, directed);

    // Add to cache
    this.addToCache(key, graph);

    // Clean old entries if needed
    this.evictIfNeeded();

    return graph;
  }

  /**
   * Get a cached graph without building
   *
   * @param nodes Set of node IDs
   * @param edges Array of network edges
   * @param directed Whether the graph is directed
   * @returns Cached graph or null
   */
  get(
    nodes: Set<number>,
    edges: NetworkEdge[],
    directed: boolean = false
  ): Graph | null {
    const key = this.computeCacheKey(nodes, edges, directed);
    const cached = this.cache.get(key);

    if (cached) {
      // Check if expired
      const age = Date.now() - cached.createdAt.getTime();
      if (age > this.maxAge) {
        this.cache.delete(key);
        return null;
      }

      cached.lastAccessed = new Date();
      cached.accessCount++;
      return cached.graph;
    }

    return null;
  }

  /**
   * Invalidate cache for specific nodes/edges
   *
   * @param nodes Optional set of nodes to invalidate
   * @param edges Optional edges to invalidate
   */
  invalidate(nodes?: Set<number>, edges?: NetworkEdge[]): void {
    if (!nodes && !edges) {
      // Clear entire cache
      this.cache.clear();
      return;
    }

    // Selective invalidation would require more complex tracking
    // For now, clear entire cache when any data changes
    this.cache.clear();
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      createdAt: Date;
      lastAccessed: Date;
      accessCount: number;
      nodeCount: number;
      edgeCount: number;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key: key.substring(0, 8) + '...', // Truncate for display
      createdAt: entry.createdAt,
      lastAccessed: entry.lastAccessed,
      accessCount: entry.accessCount,
      nodeCount: entry.graph.order,
      edgeCount: entry.graph.size
    }));

    const totalAccesses = entries.reduce((sum, e) => sum + e.accessCount, 0);
    const hitRate = totalAccesses > 0 ? (totalAccesses - entries.length) / totalAccesses : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate,
      entries
    };
  }

  /**
   * Compute a cache key from graph parameters
   * Uses a hash of node IDs and edges for efficient lookup
   */
  private computeCacheKey(
    nodes: Set<number>,
    edges: NetworkEdge[],
    directed: boolean
  ): string {
    // Create a deterministic string representation
    const nodeArray = Array.from(nodes).sort();
    const edgeArray = edges.map(e => `${e.source}-${e.target}-${e.edgeType}`).sort();

    const content = JSON.stringify({
      nodes: nodeArray,
      edges: edgeArray,
      directed
    });

    // Hash for efficient storage
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Add a graph to the cache
   */
  private addToCache(key: string, graph: Graph): void {
    this.cache.set(key, {
      graph,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1
    });
  }

  /**
   * Evict old entries if cache is too large
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    // Remove expired entries first
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.createdAt.getTime();
      if (age > this.maxAge) {
        this.cache.delete(key);
      }
    }

    // If still too large, remove least recently used
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());

      const toRemove = this.cache.size - this.maxCacheSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
}