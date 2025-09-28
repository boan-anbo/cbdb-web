/**
 * Test data for NetworkGraph component using GraphData format
 */

import { GraphData } from '@cbdb/core';

export const testGraphData: GraphData = {
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
        x: 0,  // Back to same position
        y: 0,
      },
    },
    {
      key: 'person:1294',
      attributes: {
        label: '呂嘉問',
        color: '#95e77e',
        size: 17,
        x: 0,  // Back to same position
        y: 0,
      },
    },
  ],
  edges: [
    {
      source: 'person:1762',
      target: 'person:526',
      attributes: {
        label: '朋友',
      },
    },
    {
      source: 'person:1762',
      target: 'person:1294',
      attributes: {
        label: '姻親關係',
      },
    },
  ],
};