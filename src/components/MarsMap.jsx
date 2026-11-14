import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { 
  Compass, 
  RotateCcw, 
  RotateCw, 
  Plus, 
  Minus, 
  Navigation, 
  Mountain, 
  Layers, 
  Maximize2,
  Crosshair,
  Filter,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function MarsMap({
  activeLayerId,
  layerOpacity,
  showHazards = true,
  showPOIs = true,
  showGrid = false,
  selectedCoord,
  onSelectCoordinate,
  plannedRoute,
  allRoutes = {},
  activeRouteProfile = 'safest',
  startCoord,
  destCoord,
  panToCoord,
  userPOIs = [],
  interactionMode = 'default',
  onPlanUnchartedTraverse
}) {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const baseProceduralLayerRef = useRef(null);
  const nasaTileLayerRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const routeSourceRef = useRef(new VectorSource());

  const [cursorCoords, setCursorCoords] = useState([137.3880, -4.7310]);
  const [cursorElev, setCursorElev] = useState(-4120);
  const [headingDeg, setHeadingDeg] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(11.5);
  const [declutterLevel, setDeclutterLevel] = useState('auto');

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
        return createTileFallback(tileCoord[1], tileCoord[2], tileCoord[0], activeConfig.id);
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

    const view = new View({
      projection: 'EPSG:4326',
      center: [137.385, -4.785],
      zoom: 11.5,
      minZoom: 2,
      maxZoom: 16,
      rotation: 0
    });

    const map = new Map({
      target: mapElement.current,
      layers: [baseProceduralLayer, nasaTileLayer, vectorLayer, routeLayer],
      view,
      controls: []
    });

    mapRef.current = map;

    view.on('change:rotation', () => {
      const rot = view.getRotation();
      const deg = Math.round((-rot * 180) / Math.PI) % 360;
      setHeadingDeg(deg < 0 ? deg + 360 : deg);
    });

    view.on('change:resolution', () => {
      const z = view.getZoom() || 11.5;
      setCurrentZoom(z);
    });

    map.on('singleclick', (evt) => {
      const [lon, lat] = evt.coordinate;
      if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
        if (interactionMode === 'explore_uncharted' && onPlanUnchartedTraverse) {
          onPlanUnchartedTraverse([lon, lat]);
        } else {
          onSelectCoordinate(lon, lat);
        }
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
        return createTileFallback(tileCoord[1], tileCoord[2], tileCoord[0], activeConfig.id);
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
              color: 'rgba(207, 102, 93, 0.75)',
              width: 1.5,
              lineDash: [4, 4]
            }),
            fill: new Fill({
              color: 'rgba(207, 102, 93, 0.08)'
            }),
            text: currentZoom >= 11.2 ? new Text({
              text: hazard.name,
              font: '500 9px "JetBrains Mono", monospace',
              fill: new Fill({ color: 'rgba(235, 130, 120, 0.85)' }),
              stroke: new Stroke({ color: 'rgba(23, 25, 28, 0.85)', width: 2.5 }),
              offsetY: 0
            }) : undefined
          })
        );
        source.addFeature(feature);
      });
    }

    if (showPOIs) {
      const allTargets = [...SCIENTIFIC_TARGETS, ...userPOIs];

      allTargets.forEach((target) => {
        const tier = target.tier || (target.isUserCreated ? 1 : 2);
        
        let shouldRender = true;
        if (declutterLevel === 'essential') {
          shouldRender = tier === 1 || target.isUserCreated;
        } else if (declutterLevel === 'all') {
          shouldRender = true;
        } else {
          if (currentZoom < 10.2) {
            shouldRender = tier === 1 || target.isUserCreated;
          } else if (currentZoom < 12.0) {
            shouldRender = tier <= 2 || target.isUserCreated;
          } else {
            shouldRender = true;
          }
        }

        if (!shouldRender) return;

        const isUser = target.isUserCreated;
        const isTier1 = tier === 1;

        const feature = new Feature({
          geometry: new Point(target.coordinates),
          name: target.name,
          targetData: target,
          type: isUser ? 'user_poi' : 'poi'
        });

        let pinColor = '#38bdf8';
        if (isUser) pinColor = '#a855f7';
        else if (isTier1) pinColor = '#c47b50';
        else if (target.category?.includes('Drill')) pinColor = '#91a68b';

        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: isUser ? 6 : isTier1 ? 5.5 : 4,
              fill: new Fill({ color: pinColor }),
              stroke: new Stroke({ color: '#ffffff', width: isUser ? 2 : 1.5 })
            }),
            text: new Text({
              text: isTier1 || currentZoom >= 11.5 ? target.name : '',
              font: `${isTier1 ? '600 10px' : '500 9px'} "JetBrains Mono", monospace`,
              fill: new Fill({ color: isUser ? '#d8b4fe' : '#e8e4dc' }),
              stroke: new Stroke({ color: '#17191c', width: 3 }),
              offsetY: isTier1 ? -11 : -9
            })
          })
        );
        source.addFeature(feature);
      });
    }

    if (selectedCoord) {
      const selectFeature = new Feature({
        geometry: new Point(selectedCoord),
        type: 'selected'
      });
      selectFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 9,
            stroke: new Stroke({ color: '#c47b50', width: 2.5 }),
            fill: new Fill({ color: 'rgba(196, 123, 80, 0.25)' })
          })
        })
      );
      source.addFeature(selectFeature);
    }
  }, [showHazards, showPOIs, userPOIs, selectedCoord, currentZoom, declutterLevel]);

  useEffect(() => {
    const routeSource = routeSourceRef.current;
    routeSource.clear();

    if (allRoutes) {
      Object.entries(allRoutes).forEach(([profileId, route]) => {
        if (profileId === activeRouteProfile || !route?.coordinates) return;
        const feature = new Feature({
          geometry: new LineString(route.coordinates)
        });
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'rgba(154, 154, 149, 0.35)',
              width: 2,
              lineDash: [4, 4]
            })
          })
        );
        routeSource.addFeature(feature);
      });
    }

    if (plannedRoute?.coordinates && plannedRoute.coordinates.length > 1) {
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
            radius: 7,
            fill: new Fill({ color: '#91a68b' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: 'START BASE',
            font: 'bold 9px "JetBrains Mono", monospace',
            fill: new Fill({ color: '#91a68b' }),
            stroke: new Stroke({ color: '#17191c', width: 3 }),
            offsetY: -13
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
            radius: 7,
            fill: new Fill({ color: '#c47b50' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: 'TARGET',
            font: 'bold 9px "JetBrains Mono", monospace',
            fill: new Fill({ color: '#c47b50' }),
            stroke: new Stroke({ color: '#17191c', width: 3 }),
            offsetY: -13
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
      duration: 600
    });
  }, [panToCoord]);

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 11.5) + 0.8, duration: 250 });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 11.5) - 0.8, duration: 250 });
  };

  const handleRotate = (deltaDeg) => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    const currentRot = view.getRotation();
    const newRot = currentRot + (deltaDeg * Math.PI) / 180;
    view.animate({ rotation: newRot, duration: 300 });
  };

  const handleResetNorth = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ rotation: 0, duration: 350 });
  };

  const handleRecenter = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ center: [137.385, -4.785], zoom: 11.5, rotation: 0, duration: 500 });
  };

  const toggleDeclutter = () => {
    setDeclutterLevel((prev) => {
      if (prev === 'auto') return 'essential';
      if (prev === 'essential') return 'all';
      return 'auto';
    });
  };

  return (
    <div className={`relative w-full h-full bg-[#17191c] overflow-hidden select-none ${
      interactionMode === 'explore_uncharted' ? 'cursor-crosshair' : 'cursor-default'
    }`}>
      <div ref={mapElement} className="w-full h-full" />

      {interactionMode === 'explore_uncharted' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-ares-accent/90 backdrop-blur-md text-ares-bg font-mono text-xs font-bold shadow-panel flex items-center space-x-2 animate-bounce">
          <Crosshair className="w-4 h-4" />
          <span>AUTONOMOUS RECONNAISSANCE: Click anywhere on terrain to compute optimal traverse</span>
        </div>
      )}

      <div className="absolute right-4 bottom-14 z-20 flex flex-col space-y-2">
        <div className="bg-ares-surface/90 backdrop-blur-md border border-ares-border rounded-xl p-1.5 shadow-panel flex flex-col items-center space-y-1">
          <button
            onClick={handleResetNorth}
            className="w-9 h-9 rounded-lg hover:bg-ares-surface-alt flex flex-col items-center justify-center transition-all group relative"
            title={`Reset to True North (Current: ${headingDeg}°)`}
          >
            <div 
              className="transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${-headingDeg}deg)` }}
            >
              <Compass className="w-5 h-5 text-ares-accent group-hover:text-white" />
            </div>
            <span className="text-[8px] font-mono font-bold text-ares-text-muted mt-0.5">
              {headingDeg}°
            </span>
          </button>

          <div className="flex items-center space-x-1 pt-1 border-t border-ares-border/70">
            <button
              onClick={() => handleRotate(-15)}
              className="p-1 rounded text-ares-text-muted hover:text-ares-accent hover:bg-ares-surface-alt transition-colors"
              title="Rotate Counter-Clockwise 15°"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRotate(15)}
              className="p-1 rounded text-ares-text-muted hover:text-ares-accent hover:bg-ares-surface-alt transition-colors"
              title="Rotate Clockwise 15°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-ares-surface/90 backdrop-blur-md border border-ares-border rounded-xl p-1 shadow-panel flex flex-col space-y-1">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-lg hover:bg-ares-surface-alt text-ares-text flex items-center justify-center transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-ares-border/60 mx-1" />
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-lg hover:bg-ares-surface-alt text-ares-text flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-ares-surface/90 backdrop-blur-md border border-ares-border rounded-xl p-1 shadow-panel flex flex-col space-y-1">
          <button
            onClick={handleRecenter}
            className="w-9 h-9 rounded-lg hover:bg-ares-surface-alt text-ares-text-muted hover:text-ares-accent flex items-center justify-center transition-colors"
            title="Recenter on Gale Crater"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDeclutter}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              declutterLevel === 'essential'
                ? 'bg-ares-accent/20 text-ares-accent'
                : 'text-ares-text-muted hover:text-ares-text hover:bg-ares-surface-alt'
            }`}
            title={`Map Clutter Mode: ${declutterLevel.toUpperCase()} (Click to toggle)`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-3 left-4 right-4 md:right-auto z-10 flex flex-wrap items-center gap-2 bg-ares-surface/90 backdrop-blur-md border border-ares-border px-3.5 py-1.5 rounded-xl text-xs font-mono shadow-panel">
        <div className="flex items-center space-x-1.5 text-ares-cyan font-semibold">
          <Navigation className="w-3.5 h-3.5" />
          <span>{formatMarsCoords(cursorCoords[0], cursorCoords[1])}</span>
        </div>
        <span className="text-ares-border">|</span>
        <div className="flex items-center space-x-1 text-emerald-400">
          <Mountain className="w-3.5 h-3.5" />
          <span>MOLA: {cursorElev.toLocaleString()} m</span>
        </div>
        <span className="text-ares-border hidden sm:inline">|</span>
        <span className="text-[10px] text-ares-text-muted hidden sm:inline">
          Zoom: {currentZoom.toFixed(1)} • {declutterLevel === 'essential' ? 'Landmarks Only' : declutterLevel === 'all' ? 'All Targets' : 'Adaptive Zoom'}
        </span>
      </div>
    </div>
  );
}
