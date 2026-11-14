import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import XYZ from 'ol/source/XYZ.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import Polygon from 'ol/geom/Polygon.js';
import { Style, Stroke, Fill, Text, Circle as CircleStyle } from 'ol/style.js';
import { createForProjection } from 'ol/tilegrid.js';
import { get as getProjection } from 'ol/proj.js';
import { MARS_MAP_LAYERS, createTileFallback } from '../services/marsTrek.js';
import { SCIENTIFIC_TARGETS } from '../data/scientificTargets.js';
import { HAZARD_ZONES } from '../data/hazardData.js';
import { formatMarsCoords } from '../utils/coordinates.js';
import { estimateGaleElevation } from '../utils/calculations.js';
import { GALE_BOUNDS } from '../algorithms/astar.js';
import { Crosshair, Navigation, Mountain } from 'lucide-react';

export default function MarsMap({
  activeLayerId,
  layerOpacity,
  showHazards,
  showPOIs,
  showGrid,
  selectedCoord,
  onSelectCoordinate,
  plannedRoute,
  allRoutes = {},
  activeRouteProfile = 'safest',
  startCoord,
  destCoord,
  panToCoord
}) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const baseProceduralLayerRef = useRef(null);
  const nasaTileLayerRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const routeSourceRef = useRef(new VectorSource());
  const [cursorCoords, setCursorCoords] = useState([137.38, -4.78]);
  const [cursorElev, setCursorElev] = useState(-4200);

  useEffect(() => {
    if (!mapElement.current) return;

    const proj = getProjection('EPSG:4326');
    const tileGrid = createForProjection(proj, 7, [256, 256]);
    const activeConfig = MARS_MAP_LAYERS.find((l) => l.id === activeLayerId) || MARS_MAP_LAYERS[0];

    const baseSource = new XYZ({
      projection: 'EPSG:4326',
      tileGrid,
      maxZoom: 7,
      minZoom: 0,
      tileUrlFunction: (tileCoord) => {
        if (!tileCoord) return undefined;
        const z = tileCoord[0];
        const x = tileCoord[1];
        const y = tileCoord[2];
        return createTileFallback(x, y, z, activeConfig.id);
      }
    });

    const baseProceduralLayer = new TileLayer({
      source: baseSource,
      zIndex: 1
    });
    baseProceduralLayerRef.current = baseProceduralLayer;

    const nasaSource = new XYZ({
      projection: 'EPSG:4326',
      tileGrid,
      maxZoom: 7,
      minZoom: 0,
      url: activeConfig.urlTemplate,
      crossOrigin: 'anonymous',
      transition: 250,
      tileLoadFunction: (imageTile, src) => {
        const img = imageTile.getImage();
        img.crossOrigin = 'anonymous';
        img.onload = () => {};
        img.onerror = () => {
          const tileCoord = imageTile.getTileCoord();
          if (tileCoord) {
            img.src = createTileFallback(tileCoord[1], tileCoord[2], tileCoord[0], activeConfig.id);
          }
        };
        img.src = src;
      }
    });

    const nasaTileLayer = new TileLayer({
      source: nasaSource,
      opacity: layerOpacity,
      zIndex: 2
    });
    nasaTileLayerRef.current = nasaTileLayer;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      zIndex: 10
    });

    const routeLayer = new VectorLayer({
      source: routeSourceRef.current,
      zIndex: 20
    });

    const map = new Map({
      target: mapElement.current,
      layers: [baseProceduralLayer, nasaTileLayer, vectorLayer, routeLayer],
      view: new View({
        projection: 'EPSG:4326',
        center: [137.385, -4.785],
        zoom: 11.5,
        minZoom: 2,
        maxZoom: 16
      }),
      controls: []
    });

    mapRef.current = map;

    map.on('singleclick', (evt) => {
      const [lon, lat] = evt.coordinate;
      if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
        onSelectCoordinate(lon, lat);
      }
    });

    map.on('pointermove', (evt) => {
      if (evt.dragging) return;
      const [lon, lat] = evt.coordinate;
      setCursorCoords([lon, lat]);
      setCursorElev(estimateGaleElevation(lon, lat));
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (!nasaTileLayerRef.current || !baseProceduralLayerRef.current) return;
    const proj = getProjection('EPSG:4326');
    const tileGrid = createForProjection(proj, 7, [256, 256]);
    const activeConfig = MARS_MAP_LAYERS.find((l) => l.id === activeLayerId) || MARS_MAP_LAYERS[0];

    const newBaseSource = new XYZ({
      projection: 'EPSG:4326',
      tileGrid,
      maxZoom: 7,
      minZoom: 0,
      tileUrlFunction: (tileCoord) => {
        if (!tileCoord) return undefined;
        const z = tileCoord[0];
        const x = tileCoord[1];
        const y = tileCoord[2];
        return createTileFallback(x, y, z, activeConfig.id);
      }
    });
    baseProceduralLayerRef.current.setSource(newBaseSource);

    const newNasaSource = new XYZ({
      projection: 'EPSG:4326',
      tileGrid,
      maxZoom: 7,
      minZoom: 0,
      url: activeConfig.urlTemplate,
      crossOrigin: 'anonymous',
      transition: 250,
      tileLoadFunction: (imageTile, src) => {
        const img = imageTile.getImage();
        img.crossOrigin = 'anonymous';
        img.onerror = () => {
          const tileCoord = imageTile.getTileCoord();
          if (tileCoord) {
            img.src = createTileFallback(tileCoord[1], tileCoord[2], tileCoord[0], activeConfig.id);
          }
        };
        img.src = src;
      }
    });

    nasaTileLayerRef.current.setSource(newNasaSource);
    nasaTileLayerRef.current.setOpacity(layerOpacity);
  }, [activeLayerId, layerOpacity]);

  useEffect(() => {
    const source = vectorSourceRef.current;
    source.clear();

    if (showHazards) {
      HAZARD_ZONES.forEach((hazard) => {
        const points = [];
        const numSides = 32;
        const radiusDeg = hazard.radiusKm / 59.1;
        for (let i = 0; i <= numSides; i++) {
          const angle = (i / numSides) * 2 * Math.PI;
          const x = hazard.center[0] + Math.cos(angle) * radiusDeg;
          const y = hazard.center[1] + Math.sin(angle) * (radiusDeg * 0.98);
          points.push([x, y]);
        }

        const feature = new Feature({
          geometry: new Polygon([points]),
          name: hazard.name,
          type: 'hazard'
        });

        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'rgba(207, 102, 93, 0.9)',
              width: 1.8,
              lineDash: [4, 4]
            }),
            fill: new Fill({
              color: 'rgba(207, 102, 93, 0.22)'
            }),
            text: new Text({
              text: hazard.name.toUpperCase(),
              font: 'bold 9px "JetBrains Mono", monospace',
              fill: new Fill({ color: '#ffb3ad' }),
              stroke: new Stroke({ color: 'rgba(23, 25, 28, 0.95)', width: 3 }),
              offsetY: -10
            })
          })
        );

        source.addFeature(feature);
      });
    }

    if (showPOIs) {
      SCIENTIFIC_TARGETS.forEach((poi) => {
        const isBoxwork = poi.id.includes('boxwork');
        const feature = new Feature({
          geometry: new Point(poi.coordinates),
          name: poi.name,
          poiData: poi
        });

        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isBoxwork ? 8 : 6,
              fill: new Fill({ color: isBoxwork ? '#c47b50' : '#38bdf8' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            }),
            text: new Text({
              text: poi.name,
              font: '600 10px "Manrope", sans-serif',
              fill: new Fill({ color: '#ffffff' }),
              stroke: new Stroke({ color: '#17191c', width: 3.5 }),
              offsetY: 14
            })
          })
        );

        source.addFeature(feature);
      });
    }

    if (showGrid) {
      const { minLon, maxLon, minLat, maxLat } = GALE_BOUNDS;
      const boundsFeature = new Feature({
        geometry: new Polygon([[
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat]
        ]])
      });
      boundsFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: 'rgba(56, 189, 248, 0.5)',
            width: 1.5,
            lineDash: [6, 4]
          })
        })
      );
      source.addFeature(boundsFeature);
    }

    if (selectedCoord) {
      const clickFeature = new Feature({
        geometry: new Point(selectedCoord)
      });
      clickFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 11,
            stroke: new Stroke({ color: '#c47b50', width: 2.5 }),
            fill: new Fill({ color: 'rgba(196, 123, 80, 0.3)' })
          })
        })
      );
      source.addFeature(clickFeature);
    }
  }, [showHazards, showPOIs, showGrid, selectedCoord]);

  useEffect(() => {
    const routeSource = routeSourceRef.current;
    routeSource.clear();

    Object.entries(allRoutes).forEach(([profileId, route]) => {
      if (profileId === activeRouteProfile || !route?.coordinates?.length) return;

      const altFeature = new Feature({
        geometry: new LineString(route.coordinates)
      });
      altFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: profileId === 'shortest' ? 'rgba(224, 169, 109, 0.45)' : 'rgba(56, 189, 248, 0.45)',
            width: 2,
            lineDash: [6, 4]
          })
        })
      );
      routeSource.addFeature(altFeature);
    });

    if (plannedRoute?.coordinates?.length > 1) {
      const glowFeature = new Feature({
        geometry: new LineString(plannedRoute.coordinates)
      });
      glowFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: activeRouteProfile === 'safest'
              ? 'rgba(145, 166, 139, 0.5)'
              : activeRouteProfile === 'shortest'
              ? 'rgba(224, 169, 109, 0.5)'
              : 'rgba(56, 189, 248, 0.5)',
            width: 8
          })
        })
      );
      routeSource.addFeature(glowFeature);

      const mainRouteFeature = new Feature({
        geometry: new LineString(plannedRoute.coordinates)
      });
      mainRouteFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: activeRouteProfile === 'safest'
              ? '#91a68b'
              : activeRouteProfile === 'shortest'
              ? '#e0a96d'
              : '#38bdf8',
            width: 3.5
          })
        })
      );
      routeSource.addFeature(mainRouteFeature);
    }

    if (startCoord) {
      const startFeature = new Feature({
        geometry: new Point(startCoord)
      });
      startFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: '#91a68b' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: 'START (EVA BASE)',
            font: 'bold 9px "JetBrains Mono", monospace',
            fill: new Fill({ color: '#91a68b' }),
            stroke: new Stroke({ color: '#17191c', width: 3 }),
            offsetY: -14
          })
        })
      );
      routeSource.addFeature(startFeature);
    }

    if (destCoord) {
      const destFeature = new Feature({
        geometry: new Point(destCoord)
      });
      destFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: '#c47b50' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: 'TARGET (DESTINATION)',
            font: 'bold 9px "JetBrains Mono", monospace',
            fill: new Fill({ color: '#c47b50' }),
            stroke: new Stroke({ color: '#17191c', width: 3 }),
            offsetY: -14
          })
        })
      );
      routeSource.addFeature(destFeature);
    }
  }, [plannedRoute, allRoutes, activeRouteProfile, startCoord, destCoord]);

  useEffect(() => {
    if (!panToCoord || !mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: panToCoord,
      zoom: 12.5,
      duration: 800
    });
  }, [panToCoord]);

  return (
    <div className="relative w-full h-full bg-[#1b1e22] overflow-hidden select-none">
      <div ref={mapElement} className="w-full h-full" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
        <Crosshair className="w-8 h-8 text-ares-accent" />
      </div>

      <div className="absolute bottom-3 left-3 right-3 md:right-auto z-10 flex flex-wrap items-center gap-2 bg-ares-surface/90 backdrop-blur-md border border-ares-border px-3 py-1.5 rounded-lg text-xs font-mono shadow-panel">
        <div className="flex items-center space-x-1.5 text-ares-accent">
          <Navigation className="w-3.5 h-3.5" />
          <span className="font-semibold">CURSOR:</span>
        </div>
        <span className="text-ares-text">
          {formatMarsCoords(cursorCoords[0], cursorCoords[1])}
        </span>
        <span className="text-ares-border">|</span>
        <div className="flex items-center space-x-1 text-emerald-400">
          <Mountain className="w-3.5 h-3.5" />
          <span>ELEV: {cursorElev.toLocaleString()} m</span>
        </div>
        <span className="text-ares-border hidden sm:inline">|</span>
        <span className="text-[10px] text-ares-text-muted hidden sm:inline">
          Gale Crater Mars Coordinate Frame (IAU2000)
        </span>
      </div>
    </div>
  );
}
