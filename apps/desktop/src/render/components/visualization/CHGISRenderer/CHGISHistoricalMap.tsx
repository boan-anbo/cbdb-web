import React, { useEffect, useState, useMemo, useRef } from 'react';
import MapRenderer from '../MapRenderer/MapRenderer';
import type { MapData, MapMarker, MapPolygon, Coordinates } from '../MapRenderer/types';
import maplibregl from 'maplibre-gl';
import { getPublicAssetUrl } from '@/render/utils/assetUtils';

export interface ChgisFeature {
  properties: {
    name_py: string;
    name_ch: string;
    name_ft?: string;
    x_coord?: number;
    y_coord?: number;
    type_py?: string;
    type_ch?: string;
    beg_yr: number;
    end_yr: number;
    sys_id?: string;
    pres_loc?: string;
    lev_rank?: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface CHGISHistoricalMapProps {
  /** Year to display (filters features by beg_yr and end_yr) */
  year?: number;
  /** Additional markers to display on top of CHGIS data */
  markers?: MapMarker[];
  /** Show style - 'dots' for points, 'regions' for polygons (if available) */
  displayMode?: 'dots' | 'regions';
  /** Filter by administrative type */
  adminTypes?: string[];
  /** Map configuration */
  mapConfig?: {
    center?: Coordinates;
    zoom?: number;
  };
  /** Events */
  onFeatureClick?: (feature: ChgisFeature) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

/**
 * CHGIS Historical Map - Shows historical China without modern boundaries
 * This component displays ONLY historical administrative divisions
 */
const CHGISHistoricalMap: React.FC<CHGISHistoricalMapProps> = ({
  year = 1070,
  markers = [],
  displayMode = 'dots',
  adminTypes,
  mapConfig = {},
  onFeatureClick,
  onMarkerClick,
  className
}) => {
  const [chgisData, setChgisData] = useState<ChgisFeature[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load CHGIS data
  useEffect(() => {
    const loadChgisData = async () => {
      try {
        setLoading(true);
        const url = getPublicAssetUrl('/data/chgis/chgis_counties.json');
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load CHGIS data: ${response.statusText}`);
        }
        const geojson = await response.json();
        setChgisData(geojson.features);
        setError(null);
      } catch (err) {
        console.error('Error loading CHGIS data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load CHGIS data');
        setChgisData(null);
      } finally {
        setLoading(false);
      }
    };

    loadChgisData();
  }, []);

  // Filter CHGIS data by year and type
  const filteredChgisData = useMemo(() => {
    if (!chgisData) return [];

    return chgisData.filter(feature => {
      // Filter by time period
      const inTimePeriod = year >= feature.properties.beg_yr && year <= feature.properties.end_yr;
      if (!inTimePeriod) return false;

      // Filter by admin type if specified
      if (adminTypes && adminTypes.length > 0) {
        const typeMatch = adminTypes.some(type =>
          feature.properties.type_ch?.includes(type) ||
          feature.properties.type_py?.includes(type)
        );
        if (!typeMatch) return false;
      }

      return true;
    });
  }, [chgisData, year, adminTypes]);

  // Group counties by proximity to create pseudo-regions
  const createRegions = useMemo(() => {
    if (displayMode !== 'regions' || !filteredChgisData.length) return [];

    // For now, just create circles around counties
    // In a real implementation, we'd use actual historical boundary polygons
    const regions: MapPolygon[] = [];

    // Group by prefecture or similar administrative level
    const grouped = new Map<string, ChgisFeature[]>();

    filteredChgisData.forEach(feature => {
      const key = feature.properties.type_ch || 'default';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(feature);
    });

    // Create pseudo-polygons for visualization
    grouped.forEach((features, type) => {
      features.forEach(feature => {
        // Create a simple square around each point
        // This is a placeholder - real historical boundaries would be better
        const [lng, lat] = feature.geometry.coordinates;
        const size = 0.1; // degrees

        regions.push({
          id: `region_${feature.properties.sys_id}`,
          coordinates: [[
            [lng - size, lat - size],
            [lng + size, lat - size],
            [lng + size, lat + size],
            [lng - size, lat + size],
            [lng - size, lat - size]
          ]],
          style: {
            fillColor: getColorByType(type),
            fillOpacity: 0.3,
            strokeColor: getColorByType(type),
            strokeWidth: 1
          },
          properties: feature.properties
        });
      });
    });

    return regions;
  }, [filteredChgisData, displayMode]);

  // Convert CHGIS features to map markers for dot mode
  const chgisMarkers: MapMarker[] = useMemo(() => {
    if (displayMode !== 'dots') return [];

    return filteredChgisData.map((feature, index) => ({
      id: `chgis_${feature.properties.sys_id || index}`,
      coordinates: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1]
      },
      label: feature.properties.name_py || feature.properties.name_ch,
      style: {
        color: getColorByType(feature.properties.type_ch || feature.properties.type_py),
        size: getMarkerSizeByType(feature.properties.type_ch),
        opacity: 0.7
      },
      popup: {
        content: `
          <div style="min-width: 150px;">
            <strong>${feature.properties.name_ch}</strong>
            ${feature.properties.name_py ? `<br/>${feature.properties.name_py}` : ''}
            ${feature.properties.type_ch ? `<br/>Type: ${feature.properties.type_ch}` : ''}
            <br/>Period: ${feature.properties.beg_yr} - ${feature.properties.end_yr}
            ${feature.properties.pres_loc ? `<br/>Present: ${feature.properties.pres_loc}` : ''}
          </div>
        `
      },
      properties: feature.properties
    }));
  }, [filteredChgisData, displayMode]);

  // Create map data
  const mapData: MapData = useMemo(() => {
    return {
      markers: [...chgisMarkers, ...markers],
      polygons: createRegions
    };
  }, [chgisMarkers, markers, createRegions]);

  // Use Carto Light as standard base map
  const mapStyle = {
    version: 8,
    sources: {
      'carto-light': {
        type: 'raster',
        tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© CARTO © OpenStreetMap contributors'
      }
    },
    layers: [{
      id: 'carto-light',
      type: 'raster',
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 19
    }]
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-gray-500">Loading historical map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <MapRenderer
        data={mapData}
        config={{
          center: mapConfig.center || { longitude: 110, latitude: 35 },
          zoom: mapConfig.zoom || 5,
          style: mapStyle
        }}
        events={{
          onMarkerClick: (marker) => {
            if (typeof marker.id === 'string' && marker.id.startsWith('chgis_')) {
              const feature = filteredChgisData.find(
                f => `chgis_${f.properties.sys_id}` === marker.id
              );
              if (feature && onFeatureClick) {
                onFeatureClick(feature);
                return;
              }
            }
            if (onMarkerClick) {
              onMarkerClick(marker);
            }
          }
        }}
      />

      {/* Remove hardcoded labels - only show actual data */}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded shadow">
        <div className="text-xs font-semibold mb-2">Administrative Types</div>
        <div className="text-xs space-y-1">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2" />
            <span>County (縣)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block mr-2" />
            <span>Prefecture (府/州)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2" />
            <span>Province (省/路)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Get color based on administrative type
 */
function getColorByType(type?: string): string {
  if (!type) return '#6B7280'; // Gray-500

  const typeColors: Record<string, string> = {
    '縣': '#3B82F6',     // County - blue-500
    '府': '#F59E0B',     // Prefecture - amber-500
    '州': '#10B981',     // Province/Zhou - emerald-500
    '郡': '#06B6D4',     // Commandery - cyan-500
    '軍': '#EF4444',     // Military - red-500
    '監': '#8B5CF6',     // Supervisorate - violet-500
    '路': '#84CC16',     // Circuit - lime-500
    '省': '#FBBF24',     // Province - amber-400
  };

  for (const [key, color] of Object.entries(typeColors)) {
    if (type.includes(key)) {
      return color;
    }
  }

  return '#6B7280'; // Default gray-500
}

/**
 * Get marker size based on administrative level
 */
function getMarkerSizeByType(type?: string): number {
  if (!type) return 4;

  if (type.includes('省') || type.includes('路')) return 10;  // Province level
  if (type.includes('府') || type.includes('州')) return 7;   // Prefecture level
  if (type.includes('縣')) return 4;                          // County level

  return 5;
}

export default CHGISHistoricalMap;