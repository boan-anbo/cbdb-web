import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import './MapRenderer.css';
import type {
  MapConfig,
  MapData,
  MapEvents,
  MapMarker,
  Coordinates
} from './types';

export interface MapRendererProps {
  data?: MapData;
  config?: MapConfig;
  events?: MapEvents;
  className?: string;
}

/**
 * Pure map rendering component using MapLibre GL JS
 * No domain-specific knowledge, works with generic geographic data
 */
const MapRenderer: React.FC<MapRendererProps> = ({
  data,
  config = {},
  events = {},
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Default to a blank map if no style provided
      const mapStyle = config.style || {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f5f5f5'  // Light gray background
            }
          }
        ]
      } as any;

      // If style is a string URL, use it directly
      // Otherwise, use the style object
      const styleSpec = typeof mapStyle === 'string' ? mapStyle : mapStyle;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleSpec,
        center: [
          config.center?.longitude || 105,
          config.center?.latitude || 35
        ], // Default to China center
        zoom: config.zoom || 4,
        minZoom: config.minZoom || 2,
        maxZoom: config.maxZoom || 18,
        bearing: config.bearing || 0,
        pitch: config.pitch || 0
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Handle map load
      map.current.on('load', () => {
        setIsLoading(false);

        // If the style has custom sources but they're not loaded, add them
        if (typeof mapStyle === 'object' && mapStyle.sources) {
          // The sources should already be loaded from the style spec
          // This is just a fallback in case they're not
          console.log('Map loaded with custom style including sources');
        }
      });

      // Handle map events
      if (events.onMapClick) {
        map.current.on('click', (e) => {
          events.onMapClick?.({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat
          });
        });
      }

      if (events.onZoomChange) {
        map.current.on('zoomend', () => {
          events.onZoomChange?.(map.current?.getZoom() || 0);
        });
      }

      if (events.onCenterChange) {
        map.current.on('moveend', () => {
          const center = map.current?.getCenter();
          if (center) {
            events.onCenterChange?.({
              longitude: center.lng,
              latitude: center.lat
            });
          }
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // Only run once on mount

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !data?.markers) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];


    // Add markers
    data.markers.forEach((markerData: MapMarker) => {
      // Simple marker creation
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = markerData.style?.color || '#007cbf';
      el.style.width = `${markerData.style?.size || 12}px`;
      el.style.height = `${markerData.style?.size || 12}px`;
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([
          markerData.coordinates.longitude,
          markerData.coordinates.latitude
        ]);

      // Add popup if provided
      if (markerData.popup) {
        const popup = new maplibregl.Popup({
          offset: markerData.popup.offset || [0, -10]
        }).setHTML(markerData.popup.content);

        marker.setPopup(popup);
      }

      // Handle click event
      if (events.onMarkerClick) {
        el.addEventListener('click', () => {
          events.onMarkerClick?.(markerData);
        });
      }

      // Handle hover event
      if (events.onMarkerHover) {
        el.addEventListener('mouseenter', () => {
          events.onMarkerHover?.(markerData);
        });
        el.addEventListener('mouseleave', () => {
          events.onMarkerHover?.(null);
        });
      }

      marker.addTo(map.current!);
      markers.current.push(marker);
    });
  }, [data?.markers, events]);

  // Update polygons when data changes
  useEffect(() => {
    if (!map.current || !data?.polygons || data.polygons.length === 0) return;

    // Wait for map to be loaded
    const addPolygons = () => {
      if (!map.current) return;

      // Remove existing polygon layers
      if (map.current.getSource('polygons')) {
        if (map.current.getLayer('polygons-fill')) {
          map.current.removeLayer('polygons-fill');
        }
        if (map.current.getLayer('polygons-outline')) {
          map.current.removeLayer('polygons-outline');
        }
        map.current.removeSource('polygons');
      }

      // Add polygon source and layers
      const features = data.polygons.map(polygon => ({
        type: 'Feature' as const,
        properties: polygon.properties || {},
        geometry: {
          type: 'Polygon' as const,
          coordinates: polygon.coordinates
        }
      }));

      map.current.addSource('polygons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      map.current.addLayer({
        id: 'polygons-fill',
        type: 'fill',
        source: 'polygons',
        paint: {
          'fill-color': '#888888',
          'fill-opacity': 0.4
        }
      });

      map.current.addLayer({
        id: 'polygons-outline',
        type: 'line',
        source: 'polygons',
        paint: {
          'line-color': '#000000',
          'line-width': 1
        }
      });
    };

    if (map.current.loaded()) {
      addPolygons();
    } else {
      map.current.on('load', addPolygons);
    }
  }, [data?.polygons]);

  // Update lines when data changes
  useEffect(() => {
    if (!map.current || !data?.lines || data.lines.length === 0) return;

    // Wait for map to be loaded
    const addLines = () => {
      if (!map.current) return;

      // Remove existing line layers
      if (map.current.getSource('lines')) {
        if (map.current.getLayer('lines')) {
          map.current.removeLayer('lines');
        }
        map.current.removeSource('lines');
      }

      // Add line source and layer
      const features = data.lines.map(line => ({
        type: 'Feature' as const,
        properties: line.properties || {},
        geometry: {
          type: 'LineString' as const,
          coordinates: line.coordinates.map(c => [c.longitude, c.latitude])
        }
      }));

      map.current.addSource('lines', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      map.current.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines',
        paint: {
          'line-color': '#0066cc',
          'line-width': 2
        }
      });
    };

    if (map.current.loaded()) {
      addLines();
    } else {
      map.current.on('load', addLines);
    }
  }, [data?.lines]);

  return (
    <div className={`map-container ${className}`}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {isLoading && <div className="map-loading">Loading map...</div>}
      {error && <div className="map-error">Error: {error}</div>}
    </div>
  );
};

export default MapRenderer;