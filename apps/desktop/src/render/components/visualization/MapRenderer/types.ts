/**
 * Generic map types for pure visualization
 * No domain-specific knowledge
 */

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface MapLocation {
  id: string | number;
  coordinates: Coordinates;
  properties?: Record<string, any>;
}

export interface MapMarkerStyle {
  color?: string;
  size?: number;
  icon?: string;
  opacity?: number;
}

export interface MapMarker extends MapLocation {
  style?: MapMarkerStyle;
  label?: string;
  popup?: {
    content: string;
    offset?: [number, number];
  };
}

export interface MapPolygon {
  id: string | number;
  coordinates: Coordinates[][];
  properties?: Record<string, any>;
  style?: {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
  };
}

export interface MapLine {
  id: string | number;
  coordinates: Coordinates[];
  properties?: Record<string, any>;
  style?: {
    color?: string;
    width?: number;
    opacity?: number;
  };
}

export interface MapData {
  markers?: MapMarker[];
  polygons?: MapPolygon[];
  lines?: MapLine[];
}

// MapLibre Style Specification types
export interface MapStyleSource {
  type: 'vector' | 'raster' | 'raster-dem' | 'geojson' | 'image' | 'video';
  url?: string;
  tiles?: string[];
  tileSize?: number;
  attribution?: string;
  maxzoom?: number;
  data?: any; // GeoJSON data
}

export interface MapStyleLayer {
  id: string;
  type: 'background' | 'fill' | 'line' | 'symbol' | 'raster' | 'circle' | 'fill-extrusion' | 'heatmap' | 'hillshade' | 'color-relief';
  source?: string;
  'source-layer'?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
  layout?: Record<string, any>;
  paint?: Record<string, any>;
}

export interface MapStyle {
  version: number;
  sources: Record<string, MapStyleSource>;
  layers: MapStyleLayer[];
  terrain?: {
    source: string;
    exaggeration?: number;
  };
  sky?: Record<string, any>;
  projection?: {
    type: string;
  };
}

export interface MapConfig {
  center?: Coordinates;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  style?: MapStyle | string; // Map style configuration or URL
  bearing?: number;
  pitch?: number;
}

export interface MapEvents {
  onMarkerClick?: (marker: MapMarker) => void;
  onMarkerHover?: (marker: MapMarker | null) => void;
  onMapClick?: (coordinates: Coordinates) => void;
  onZoomChange?: (zoom: number) => void;
  onCenterChange?: (center: Coordinates) => void;
}