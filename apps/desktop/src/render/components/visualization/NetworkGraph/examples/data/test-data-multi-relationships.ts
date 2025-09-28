/**
 * Test data demonstrating multiple relationships between same nodes
 */

import { GraphData, EDGE_SIZE_GUIDELINES } from '@cbdb/core';

export const testMultiRelationshipData: GraphData = {
  nodes: [
    {
      key: 'person:1762',
      attributes: {
        label: '王安石',
        color: '#ff6b6b',
        size: 25,
        x: 0,
        y: 0,
      },
    },
    {
      key: 'person:526',
      attributes: {
        label: '朱明之',
        color: '#95e77e',
        size: 17,
        x: 0,
        y: 0,
      },
    },
    {
      key: 'person:1294',
      attributes: {
        label: '呂嘉問',
        color: '#95e77e',
        size: 17,
        x: 0,
        y: 0,
      },
    },
  ],
  edges: [
    // Multiple relationships between 王安石 and 朱明之
    {
      key: 'kinship-1762-526',
      source: 'person:1762',
      target: 'person:526',
      attributes: {
        label: '姻親關係',
        color: '#e74c3c',
        size: EDGE_SIZE_GUIDELINES.STRONG,  // Strong family relationship
        relationshipType: 'kinship',  // Semantic type (not rendering type)
      },
    },
    {
      key: 'friend-1762-526',
      source: 'person:1762',
      target: 'person:526',
      attributes: {
        label: '朋友',
        color: '#3498db',
        size: EDGE_SIZE_GUIDELINES.MODERATE,  // Moderate relationship
        relationshipType: 'friendship',  // Semantic type
      },
    },
    {
      key: 'colleague-1762-526',
      source: 'person:1762',
      target: 'person:526',
      attributes: {
        label: '同事',
        color: '#9b59b6',
        size: EDGE_SIZE_GUIDELINES.WEAK,  // Weaker professional relationship
        relationshipType: 'colleague',  // Semantic type
      },
    },

    // Multiple relationships between 王安石 and 呂嘉問
    {
      key: 'superior-1762-1294',
      source: 'person:1762',
      target: 'person:1294',
      attributes: {
        label: '上司',
        color: '#f39c12',
        size: EDGE_SIZE_GUIDELINES.STRONG,  // Strong hierarchical relationship
        relationshipType: 'superior',  // Semantic type
      },
    },
    {
      key: 'classmate-1762-1294',
      source: 'person:1762',
      target: 'person:1294',
      attributes: {
        label: '同學',
        color: '#27ae60',
        size: EDGE_SIZE_GUIDELINES.MODERATE,  // Moderate relationship
        relationshipType: 'classmate',  // Semantic type
      },
    },

    // Single relationship between 朱明之 and 呂嘉問
    {
      key: 'peer-526-1294',
      source: 'person:526',
      target: 'person:1294',
      attributes: {
        label: '同輩',
        color: '#95a5a6',
        size: EDGE_SIZE_GUIDELINES.MODERATE,  // Moderate peer relationship
        relationshipType: 'peer',  // Semantic type
      },
    },
  ],
};