import React from 'react';
import { CodeExample } from '../CodeExample';

const dataViewTypeScript = `export class PersonSuggestionDataView {
  // Purpose: Minimal data for autocomplete
  id: number;
  name: string | null;
  nameChn: string | null;
  birthYear: number | null;
  deathYear: number | null;
  indexYear: number | null;
  dynastyCode: number | null;
  dynasty: string | null;
  dynastyChn: string | null;

  // Simple projection and trivial computation
  // Selecting fields and basic calculations (e.g., age from birth/death years)
}`;

const computedTypeScript = `// Combined with graph algorithms for visualization
// Structure used by Sigma.js/Graphology

// Graph structure from server API
export interface GraphNetworkData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Node structure (actual server response)
export interface GraphNode {
  id: string;  // Format: "person:{personId}"
  attributes: {
    // Visual properties
    label: string;        // Display name
    color: string;        // Node color
    size: number;         // Node size
    x: number;            // X position
    y: number;            // Y position

    // Graph metrics
    nodeDistance: number; // Distance from central person

    // Person data
    personId: number;
    nameChn: string;
    nameEng: string;
    dynastyCode?: number;
    birthYear?: number;
  };
}

// Edge structure for relationships
export interface GraphEdge {
  source: string;       // Source node ID
  target: string;       // Target node ID
  attributes: {
    label: string;      // Relationship label (e.g., "長女婿")
    color: string;      // Edge color
    size: number;       // Edge thickness
    relationshipType: "kinship" | "association" | "office";
    kinshipCode?: number;     // For kinship relations
    associationCode?: number; // For associations
    strength: number;         // Connection strength
  };
}`;

const actualDataViewData = `{
  "id": 1762,
  "name": "Wang Anshi",
  "nameChn": "王安石",
  "birthYear": 1021,
  "deathYear": 1086,
  "indexYear": 1021,
  "dynastyCode": 15,
  "dynasty": "Song",
  "dynastyChn": "宋"
}`;

const actualGraphData = `// Actual graph data from server API (localhost:18019/api/people/1762/network/kinship)
{
  "nodes": [{
    "id": "person:1762",
    "attributes": {
      "label": "王安石",
      "nameChn": "王安石",
      "nameEng": "Wang Anshi",
      "color": "#ff6b6b",
      "size": 10,
      "nodeDistance": 0,
      "personId": 1762,
      "dynastyCode": 15,
      "birthYear": 1021,
      "x": -195.86,
      "y": -164.62
    }
  },
  {
    "id": "person:1957",
    "attributes": {
      "label": "吳安持",
      "nameChn": "吳安持",
      "nameEng": "吳安持",
      "color": "#95e77e",
      "size": 7,
      "nodeDistance": 1,
      "personId": 1957,
      "x": 110.82,
      "y": 196.28
    }
  }],
  "edges": [{
    "source": "person:1762",
    "target": "person:1957",
    "attributes": {
      "label": "長女婿",
      "color": "#6d727e99",
      "size": 1.5,
      "relationshipType": "kinship",
      "kinshipCode": 332,
      "strength": 1.5
    }
  }]
}`;

export function DataViewLayer() {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 p-2 rounded bg-muted/30">
        <div className="font-semibold text-sm min-w-[100px] text-primary">IV. DataView & Computed/Derived</div>
        <div className="text-sm flex-1">
          <div className="font-medium">Purpose-specific projections and computed/derived data</div>
          <div className="text-muted-foreground">Two types: Simple projections (selecting attributes) and computed/derived data (combining with external algorithms)</div>
          <div className="text-muted-foreground">Tailored for UI/analytics needs (Autocomplete, Network visualization, Timeline, etc.)</div>
        </div>
      </div>
      <div className="ml-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <CodeExample
              title="IV.1 DataView (Projection)"
              description="Simple projection - selectively picks attributes from existing models"
              subtitle="person-suggestion.data-view.ts"
              language="typescript"
              code={dataViewTypeScript}
            />
          </div>
          <div>
            <CodeExample
              title="IV.2 Computed/Derived Data"
              description="Computed/derived - combines data with graph algorithms & visualization needs"
              subtitle="graph-data.model.ts"
              language="typescript"
              code={computedTypeScript}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <CodeExample
            title="Actual data for PersonSuggestionDataView"
            language="json"
            code={actualDataViewData}
            fontSize="0.65rem"
          />
          <CodeExample
            title="Actual graph data from server API"
            language="json"
            code={actualGraphData}
            fontSize="0.65rem"
          />
        </div>
      </div>
    </div>
  );
}