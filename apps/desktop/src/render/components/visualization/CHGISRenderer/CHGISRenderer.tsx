import React, { useEffect, useState, useMemo } from 'react';
import MapRenderer from '../MapRenderer/MapRenderer';
import type { MapData, MapMarker, Coordinates } from '../MapRenderer/types';
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

export interface CHGISRendererProps {
  /** Year to display (filters counties by beg_yr and end_yr) */
  year?: number;
  /** Additional markers to display on top of CHGIS data */
  markers?: MapMarker[];
  /** Show CHGIS county points */
  showCounties?: boolean;
  /** Filter counties by type */
  countyTypes?: string[];
  /** Opacity for county markers */
  countyOpacity?: number;
  /** Size for county markers */
  countySize?: number;
  /** Map configuration */
  mapConfig?: {
    center?: Coordinates;
    zoom?: number;
  };
  /** Events */
  onCountyClick?: (county: ChgisFeature) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

/**
 * CHGIS Renderer - Specialized component for rendering historical Chinese boundaries
 * Loads and displays CHGIS time series data filtered by year
 */
const CHGISRenderer: React.FC<CHGISRendererProps> = ({
  year = 1070, // Default to middle of Song Dynasty
  markers = [],
  showCounties = true,
  countyTypes,
  countyOpacity = 0.4,
  countySize = 5,
  mapConfig = {},
  onCountyClick,
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

        // Check if response is HTML (likely a 404 page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('CHGIS data file not found - received HTML instead of JSON');
        }

        if (!response.ok) {
          throw new Error(`Failed to load CHGIS data: ${response.statusText}`);
        }

        const text = await response.text();
        let geojson;
        try {
          geojson = JSON.parse(text);
        } catch (parseErr) {
          console.error('Failed to parse CHGIS data:', text.substring(0, 100));
          throw new Error('Invalid JSON in CHGIS data file');
        }

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
    if (!chgisData || !showCounties) return [];

    return chgisData.filter(feature => {
      // Filter by time period
      const inTimePeriod = year >= feature.properties.beg_yr && year <= feature.properties.end_yr;
      if (!inTimePeriod) return false;

      // Filter by county type if specified
      if (countyTypes && countyTypes.length > 0) {
        return countyTypes.includes(feature.properties.type_ch || feature.properties.type_py || '');
      }

      return true;
    });
  }, [chgisData, year, showCounties, countyTypes]);

  // Convert CHGIS features to map markers
  const chgisMarkers: MapMarker[] = useMemo(() => {
    return filteredChgisData.map((feature, index) => ({
      id: `chgis_${feature.properties.sys_id || index}`,
      coordinates: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1]
      },
      label: feature.properties.name_py || feature.properties.name_ch,
      style: {
        color: getColorByType(feature.properties.type_ch || feature.properties.type_py),
        size: countySize,
        opacity: countyOpacity
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
  }, [filteredChgisData, countyOpacity, countySize]);

  // Combine CHGIS markers with user markers
  const mapData: MapData = useMemo(() => {
    // User markers should appear on top (added after CHGIS markers)
    const allMarkers = [...chgisMarkers, ...markers];
    return { markers: allMarkers };
  }, [chgisMarkers, markers]);

  // Handle marker clicks
  const handleMarkerClick = (marker: MapMarker) => {
    // Check if it's a CHGIS county
    if (typeof marker.id === 'string' && marker.id.startsWith('chgis_')) {
      const county = filteredChgisData.find(
        f => `chgis_${f.properties.sys_id}` === marker.id ||
            `chgis_${filteredChgisData.indexOf(f)}` === marker.id
      );
      if (county && onCountyClick) {
        onCountyClick(county);
        return;
      }
    }
    // Otherwise it's a user marker
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-gray-500">Loading CHGIS data...</div>
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

  // Default Carto Light base map style
  const cartoLightStyle = {
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

  return (
    <div className={`h-full ${className}`}>
      <MapRenderer
        data={mapData}
        config={{
          center: mapConfig.center || { longitude: 110, latitude: 35 },
          zoom: mapConfig.zoom || 5,
          style: cartoLightStyle
        }}
        events={{
          onMarkerClick: handleMarkerClick
        }}
      />

      {/* Display current year and statistics */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded shadow">
        <div className="text-sm font-semibold">Year: {year}</div>
        <div className="text-xs text-gray-600">
          Counties shown: {filteredChgisData.length}
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

  // Map common types to colors - using more muted, professional colors
  const typeColors: Record<string, string> = {
    '縣': '#3B82F6', // County - blue-500
    '府': '#F59E0B', // Prefecture - amber-500
    '州': '#10B981', // Province - emerald-500
    '軍': '#EF4444', // Military - red-500
    '監': '#8B5CF6', // Supervisorate - violet-500
    '廳': '#06B6D4', // Department - cyan-500
    '路': '#84CC16', // Circuit - lime-500
  };

  // Check if type contains any of the keys
  for (const [key, color] of Object.entries(typeColors)) {
    if (type.includes(key)) {
      return color;
    }
  }

  return '#6B7280'; // Default gray-500
}

export default CHGISRenderer;