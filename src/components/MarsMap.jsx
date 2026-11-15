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
import Cluster from 'ol/source/Cluster.js';
import { createEmpty, extend } from 'ol/extent.js';
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
  Crosshair as CrosshairIcon,
  Filter,
  MapPin,
  Sparkles
} from 'lucide-react';
import Crosshair from './Crosshair';

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
  activeTab = 'inspector',
  onPlanUnchartedTraverse,
  mapPickingMode = null,
  onCancelPicking,
  mapCameraAction = null
}) {
  const mapElement = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const baseProceduralLayerRef = useRef(null);
  const nasaTileLayerRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const routeSourceRef = useRef(new VectorSource());
  const gazetteerSourceRef = useRef(new VectorSource());
  const gazetteerClusterSourceRef = useRef(null);
  const gazetteerLayerRef = useRef(null);
  const activeAbortControllerRef = useRef(null);
  const gazetteerCacheRef = useRef(new Map());
  const lastQueryKeyRef = useRef('');
  const currentZoomRef = useRef(11.5);
  const loadVisibleGazetteerRef = useRef(null);

  const showPOIsRef = useRef(showPOIs);
  showPOIsRef.current = showPOIs;

  const userPOIsRef = useRef(userPOIs);
  userPOIsRef.current = userPOIs;

  const mapPickingModeRef = useRef(mapPickingMode);
  mapPickingModeRef.current = mapPickingMode;

  const onSelectCoordinateRef = useRef(onSelectCoordinate);
  onSelectCoordinateRef.current = onSelectCoordinate;

  const interactionModeRef = useRef(interactionMode);
  interactionModeRef.current = interactionMode;

  const onPlanUnchartedTraverseRef = useRef(onPlanUnchartedTraverse);
  onPlanUnchartedTraverseRef.current = onPlanUnchartedTraverse;

  const [cursorCoords, setCursorCoords] = useState([137.3880, -4.7310]);
  const [cursorElev, setCursorElev] = useState(-4120);
  const [headingDeg, setHeadingDeg] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(11.5);
  const [declutterLevel, setDeclutterLevel] = useState('auto');
  const declutterLevelRef = useRef(declutterLevel);
  declutterLevelRef.current = declutterLevel;

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

    // USGS Planetary Nomenclature Gazetteer Layer with Clustering
    const gazetteerSource = gazetteerSourceRef.current;
    const gazetteerClusterSource = new Cluster({
      distance: 36,
      minDistance: 20,
      source: gazetteerSource
    });
    gazetteerClusterSourceRef.current = gazetteerClusterSource;

    const gazetteerLayer = new VectorLayer({
      source: gazetteerClusterSource,
      zIndex: 15,
      style: (feature) => {
        const features = feature.get('features');
        if (!features || features.length === 0) return null;
        const zoom = currentZoomRef.current;

        // Individual pin when single feature or zoomed in close (zoom >= 9.2)
        if (features.length === 1 || zoom >= 9.2) {
          const single = features[0];
          const target = single.get('targetData');
          if (!target) return null;

          const isTier1 = target.tier === 1;
          const isUser = target.isUserCreated;
          const isLandingSite = target.category === 'Landing Site' || (target.name || '').toLowerCase().includes('landing');

          let pinColor = '#38bdf8';
          if (isUser) pinColor = '#a855f7';
          else if (isLandingSite) pinColor = '#fbbf24';
          else if (isTier1) pinColor = '#c47b50';
          else if (target.category?.includes('Mons') || target.category?.includes('Peak')) pinColor = '#38bdf8';
          else if (target.category?.includes('Drill')) pinColor = '#91a68b';
          else if (target.category?.includes('Channel') || target.category?.includes('Vallis')) pinColor = '#34d399';
          else pinColor = '#cbd5e1';

          const showLabel = isTier1 || isUser || isLandingSite || zoom >= 10.5;

          return new Style({
            image: new CircleStyle({
              radius: isUser ? 6 : isLandingSite ? 6 : isTier1 ? 5 : 3.5,
              fill: new Fill({ color: pinColor }),
              stroke: new Stroke({ color: '#ffffff', width: isUser || isLandingSite ? 2 : 1.2 })
            }),
            text: showLabel ? new Text({
              text: target.name,
              font: `${isTier1 || isLandingSite ? '600 10px' : '500 9px'} "JetBrains Mono", monospace`,
              fill: new Fill({ color: isUser ? '#d8b4fe' : isLandingSite ? '#fef08a' : '#e8e4dc' }),
              stroke: new Stroke({ color: '#17191c', width: 3 }),
              offsetY: isTier1 || isLandingSite ? -12 : -9
            }) : undefined
          });
        }

        // Clustered bubble for lower zoom levels
        const size = features.length;
        return new Style({
          image: new CircleStyle({
            radius: Math.min(22, 10 + Math.log2(size) * 3.2),
            fill: new Fill({ color: 'rgba(196, 123, 80, 0.90)' }),
            stroke: new Stroke({ color: '#ffffff', width: 1.8 })
          }),
          text: new Text({
            text: size.toString(),
            font: 'bold 10px "JetBrains Mono", monospace',
            fill: new Fill({ color: '#ffffff' }),
            offsetY: 1
          })
        });
      }
    });
    gazetteerLayerRef.current = gazetteerLayer;

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
      layers: [baseProceduralLayer, nasaTileLayer, vectorLayer, gazetteerLayer, routeLayer],
      view,
      controls: []
    });

    mapRef.current = map;

    // Load USGS features based on visible extent with spatial buffer and caching
    const loadVisibleGazetteer = async () => {
      if (!mapRef.current) return;
      if (!showPOIsRef.current) {
        gazetteerSourceRef.current.clear();
        return;
      }

      const m = mapRef.current;
      const size = m.getSize();
      if (!size) return;
      const extent = m.getView().calculateExtent(size);
      const zoom = m.getView().getZoom() || 11.5;
      currentZoomRef.current = zoom;

      const [minX, minY, maxX, maxY] = extent;
      const padX = Math.max(0.1, (maxX - minX) * 0.25);
      const padY = Math.max(0.1, (maxY - minY) * 0.25);
      const pMinLon = Math.max(-180, minX - padX);
      const pMaxLon = Math.min(180, maxX + padX);
      const pMinLat = Math.max(-90, minY - padY);
      const pMaxLat = Math.min(90, maxY + padY);

      const currentDeclutter = declutterLevelRef.current;
      const maxTier = currentDeclutter === 'essential'
        ? 1
        : currentDeclutter === 'all'
          ? 3
          : (zoom < 5.0 ? 1 : zoom < 8.0 ? 2 : 3);

      const queryKey = `${pMinLon.toFixed(2)},${pMinLat.toFixed(2)},${pMaxLon.toFixed(2)},${pMaxLat.toFixed(2)}_${maxTier}`;
      if (lastQueryKeyRef.current === queryKey) return;
      lastQueryKeyRef.current = queryKey;

      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      activeAbortControllerRef.current = controller;

      try {
        const url = `/api/features?bbox=${pMinLon.toFixed(3)},${pMinLat.toFixed(3)},${pMaxLon.toFixed(3)},${pMaxLat.toFixed(3)}&tier=${maxTier}&limit=400`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !Array.isArray(data.features)) return;

        data.features.forEach((f) => {
          gazetteerCacheRef.current.set(f.id, f);
        });

        // Curated Gale Crater targets and user-created POIs within extent
        const allLocalTargets = [...SCIENTIFIC_TARGETS, ...(userPOIsRef.current || [])];
        const localFeaturesWithinExtent = allLocalTargets.filter((t) => {
          const [lon, lat] = t.coordinates;
          return lon >= pMinLon && lon <= pMaxLon && lat >= pMinLat && lat <= pMaxLat;
        });

        const seenNames = new Set(localFeaturesWithinExtent.map((t) => (t.name || '').toLowerCase()));
        const olFeatures = [];

        localFeaturesWithinExtent.forEach((target) => {
          const olFeat = new Feature({
            geometry: new Point(target.coordinates),
            name: target.name,
            targetData: target,
            type: target.isUserCreated ? 'user_poi' : 'scientific_target'
          });
          olFeatures.push(olFeat);
        });

        data.features.forEach((f) => {
          const name = f.properties.name || f.properties.clean_name;
          if (seenNames.has((name || '').toLowerCase())) return;
          seenNames.add((name || '').toLowerCase());

          const targetData = {
            id: f.properties.usgs_id || `usgs-${f.id}`,
            name,
            category: f.properties.category || f.properties.type,
            coordinates: f.geometry.coordinates,
            tier: f.properties.tier,
            diameter: f.properties.diameter_km,
            origin: f.properties.origin,
            link: f.properties.link,
            quadName: f.properties.quad_name
          };

          const olFeat = new Feature({
            geometry: new Point(f.geometry.coordinates),
            name,
            targetData,
            type: 'usgs_feature'
          });
          olFeatures.push(olFeat);
        });

        gazetteerSourceRef.current.clear();
        gazetteerSourceRef.current.addFeatures(olFeatures);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('USGS Gazetteer fetch error:', err);
      }
    };

    loadVisibleGazetteerRef.current = loadVisibleGazetteer;

    view.on('change:rotation', () => {
      const rot = view.getRotation();
      const deg = Math.round((-rot * 180) / Math.PI) % 360;
      setHeadingDeg(deg < 0 ? deg + 360 : deg);
    });

    view.on('change:resolution', () => {
      const z = view.getZoom() || 11.5;
      setCurrentZoom(z);
      currentZoomRef.current = z;
      if (gazetteerClusterSourceRef.current) {
        gazetteerClusterSourceRef.current.setDistance(z >= 9.0 ? 0 : 36);
      }
    });

    if (gazetteerClusterSourceRef.current) {
      gazetteerClusterSourceRef.current.setDistance(11.5 >= 9.0 ? 0 : 36);
    }

    map.on('moveend', () => {
      loadVisibleGazetteer();
    });

    // Initial load of gazetteer features
    loadVisibleGazetteer();

    map.on('singleclick', (evt) => {
      let clickedFeatureTarget = null;
      map.forEachFeatureAtPixel(evt.pixel, (feat) => {
        // 1. Check if clicked a cluster of multiple points
        const cluster = feat.get('features');
        if (cluster && cluster.length > 1) {
          const extent = createEmpty();
          cluster.forEach((f) => extend(extent, f.getGeometry().getExtent()));
          map.getView().fit(extent, { duration: 450, padding: [60, 60, 60, 60], maxZoom: 13 });
          clickedFeatureTarget = 'CLUSTER_EXPANDED';
          return true;
        }
        if (cluster && cluster.length === 1) {
          const tData = cluster[0].get('targetData');
          if (tData) {
            clickedFeatureTarget = tData;
            return true;
          }
        }

        // 2. Individual feature
        const tData = feat.get('targetData');
        if (tData) {
          clickedFeatureTarget = tData;
          return true;
        }
      });

      if (clickedFeatureTarget === 'CLUSTER_EXPANDED') return;

      const currentPicking = mapPickingModeRef.current;
      const currentInteractionMode = interactionModeRef.current;
      const doPlanUncharted = onPlanUnchartedTraverseRef.current;
      const doSelectCoordinate = onSelectCoordinateRef.current;

      if (clickedFeatureTarget) {
        if (currentPicking) {
          doSelectCoordinate?.(clickedFeatureTarget.coordinates[0], clickedFeatureTarget.coordinates[1], currentPicking);
          return;
        }
        if (currentInteractionMode === 'explore_uncharted' && doPlanUncharted) {
          doPlanUncharted(clickedFeatureTarget.coordinates);
        } else {
          doSelectCoordinate?.(clickedFeatureTarget.coordinates[0], clickedFeatureTarget.coordinates[1]);
        }
        return;
      }

      const [lon, lat] = evt.coordinate;
      if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
        if (currentPicking) {
          doSelectCoordinate?.(lon, lat, currentPicking);
          return;
        }
        if (currentInteractionMode === 'explore_uncharted' && doPlanUncharted) {
          doPlanUncharted([lon, lat]);
        } else {
          doSelectCoordinate?.(lon, lat);
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
  }, [showHazards, selectedCoord, currentZoom]);

  useEffect(() => {
    if (gazetteerLayerRef.current) {
      gazetteerLayerRef.current.setVisible(showPOIs);
      if (showPOIs) {
        lastQueryKeyRef.current = '';
        loadVisibleGazetteerRef.current?.();
      } else if (gazetteerSourceRef.current) {
        gazetteerSourceRef.current.clear();
      }
    }
  }, [showPOIs]);

  useEffect(() => {
    if (showPOIsRef.current) {
      lastQueryKeyRef.current = '';
      loadVisibleGazetteerRef.current?.();
    }
  }, [declutterLevel, userPOIs]);

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

  useEffect(() => {
    if (!mapCameraAction || !mapRef.current) return;
    const view = mapRef.current.getView();
    if (mapCameraAction.type === 'zoom_to_start' && mapCameraAction.coord) {
      view.animate({
        center: mapCameraAction.coord,
        zoom: 12.5,
        duration: 650
      });
    } else if (mapCameraAction.type === 'zoom_to_route' && mapCameraAction.startCoord && mapCameraAction.destCoord) {
      const p1 = mapCameraAction.startCoord;
      const p2 = mapCameraAction.destCoord;
      const minLon = Math.min(p1[0], p2[0]);
      const maxLon = Math.max(p1[0], p2[0]);
      const minLat = Math.min(p1[1], p2[1]);
      const maxLat = Math.max(p1[1], p2[1]);
      const center = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
      const span = Math.max(maxLon - minLon, maxLat - minLat);
      const targetZoom = span > 0.8 ? 8.5 : span > 0.4 ? 9.5 : span > 0.15 ? 10.5 : 11.2;
      view.animate({
        center,
        zoom: targetZoom,
        duration: 750
      });
    }
  }, [mapCameraAction]);

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 11.5) + 0.8, duration: 450 });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 11.5) - 0.8, duration: 450 });
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
    <div 
      ref={mapContainerRef}
      className="relative w-full h-full bg-[#17191c] overflow-hidden select-none"
    >
      <div ref={mapElement} className="w-full h-full" />

      {/* ReactBits Dynamic Aerospace Crosshair Cursor with Live Martian Coordinates */}
      <Crosshair
        containerRef={mapContainerRef}
        mapRef={mapRef}
        active={activeTab === 'inspector' || Boolean(mapPickingMode) || interactionMode === 'explore_uncharted'}
        color="#ff7a30"
        thickness={1}
        opacity={0.85}
        gap={10}
        showCoordinates={true}
        clickPulse={true}
        hideCursor={true}
      />

      {/* Map Picking Active Prompt Banner */}
      {mapPickingMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-[#ff7a30] text-black font-mono text-xs font-bold shadow-glow-accent flex items-center space-x-2.5 pointer-events-auto border border-black/20 animate-pulse">
          <CrosshairIcon className="w-4 h-4 text-black" />
          <span>
            {mapPickingMode === 'start'
              ? 'CLICK MAP TO SET START POINT (EVA BASE)'
              : 'CLICK MAP TO SET DESTINATION TARGET'}
          </span>
          {onCancelPicking && (
            <button
              onClick={onCancelPicking}
              className="ml-2 w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-xs text-black cursor-pointer font-bold"
              title="Cancel map selection"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Tactical Inspector Reticle Active Prompt */}
      {!mapPickingMode && activeTab === 'inspector' && interactionMode !== 'explore_uncharted' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-xl bg-ares-surface/85 backdrop-blur-md border border-ares-accent/40 text-xs font-mono shadow-panel flex items-center space-x-2 pointer-events-none">
          <CrosshairIcon className="w-3.5 h-3.5 text-ares-accent animate-pulse" />
          <span className="text-ares-accent font-bold uppercase tracking-wider text-[11px]">Tactical Inspector:</span>
          <span className="text-ares-text-muted text-[11px]">Click any point on terrain to inspect localized regional telemetry</span>
        </div>
      )}

      {interactionMode === 'explore_uncharted' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-ares-accent/90 backdrop-blur-md text-ares-bg font-mono text-xs font-bold shadow-panel flex items-center space-x-2 animate-bounce">
          <CrosshairIcon className="w-4 h-4" />
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

        {/* Tactical Smooth Zoom Controls (+ / -) */}
        <div className="bg-ares-surface/95 backdrop-blur-md border border-ares-border rounded-xl p-1 shadow-panel flex flex-col space-y-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-lg hover:bg-ares-surface-alt text-ares-text hover:text-ares-accent flex items-center justify-center transition-all active:scale-95 cursor-pointer group"
            title="Zoom In (Smooth Glide)"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <div className="h-[1px] bg-ares-border/60 mx-1.5" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-lg hover:bg-ares-surface-alt text-ares-text hover:text-ares-accent flex items-center justify-center transition-all active:scale-95 cursor-pointer group"
            title="Zoom Out (Smooth Glide)"
          >
            <Minus className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
        <div 
          className="flex items-center space-x-1 text-emerald-400 cursor-help"
          title={`Mars Orbiter Laser Altimeter: ${cursorElev < 0 ? `${(Math.abs(cursorElev)/1000).toFixed(1)} km below datum (Mars has no sea level; 0m is the mean areoid)` : `+${(cursorElev/1000).toFixed(1)} km above datum`}`}
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>{cursorElev.toLocaleString()} m MOLA</span>
          <span className="text-[10px] text-ares-text-muted hidden md:inline">
            ({cursorElev < 0 ? `${(Math.abs(cursorElev) / 1000).toFixed(1)}km below datum` : `+${(cursorElev / 1000).toFixed(1)}km`})
          </span>
        </div>
        <span className="text-ares-border hidden sm:inline">|</span>
        <span className="text-[10px] text-ares-text-muted hidden sm:inline">
          Zoom: {currentZoom.toFixed(1)} • {declutterLevel === 'essential' ? 'Landmarks Only' : declutterLevel === 'all' ? 'All Targets' : 'Adaptive Zoom'}
        </span>
      </div>
    </div>
  );
}
