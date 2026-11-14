import React, { useEffect, useRef, useState } from 'react';
import '@arcgis/core/assets/esri/themes/dark/main.css';
import Map from '@arcgis/core/Map.js';
import SceneView from '@arcgis/core/views/SceneView.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Graphic from '@arcgis/core/Graphic.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Mesh from '@arcgis/core/geometry/Mesh.js';
import Camera from '@arcgis/core/Camera.js';
import { addFrameTask } from '@arcgis/core/core/scheduling.js';
import DirectLineMeasurement3D from '@arcgis/core/widgets/DirectLineMeasurement3D.js';
import AreaMeasurement3D from '@arcgis/core/widgets/AreaMeasurement3D.js';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile.js';

import {
  marsSR,
  marsElevation,
  marsImageryBasemap,
  shadedReliefBasemap,
  marsNamesLayer,
  missionLayer,
  marsHiRiseImagery,
  ROVER_LOCATIONS
} from '../services/arcgisMarsLayers.js';
import { EARTH_3D_MODELS, loadGltfModelFromZip } from '../services/gltfModelLoader.js';
import { EARTH_COUNTRIES, generateScaleCorrectedCountryPolygon, MARS_TO_EARTH_SCALE_FACTOR } from '../services/earthRegions.js';

import {
  Compass,
  Layers,
  Ruler,
  Maximize2,
  Box,
  MapPin,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  Info,
  Map as MapIcon,
  Globe,
  Radio,
  Mountain,
  Crosshair,
  Flame,
  ArrowRight,
  Sparkles,
  X,
  Play,
  Pause
} from 'lucide-react';

export default function MarsGlobe3D({ onSwitchTo2D, initialCoord = null }) {
  const viewContainerRef = useRef(null);
  const sceneViewRef = useRef(null);
  const modelGraphicsLayerRef = useRef(null);
  const regionGraphicsLayerRef = useRef(null);
  const activeWidgetRef = useRef(null);
  const spinTaskRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState('imagery');
  const [activeDrawer, setActiveDrawer] = useState(null); // 'locations' | 'measure' | 'compare' | 'info'
  const [isRotating, setIsRotating] = useState(true);
  const [activeMeasureTool, setActiveMeasureTool] = useState(null); // 'line' | 'area' | 'elevation'
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [currentCameraInfo, setCurrentCameraInfo] = useState({ lat: -4.6, lon: 137.4, alt: '840 km' });

  useEffect(() => {
    if (!viewContainerRef.current) return;

    // Create 3D graphics layers for glTF Earth models and projected country boundaries
    const modelLayer = new GraphicsLayer({
      id: 'ares-3d-models',
      title: 'Earth 3D Models',
      elevationInfo: { mode: 'relative-to-ground' }
    });
    modelGraphicsLayerRef.current = modelLayer;

    const regionLayer = new GraphicsLayer({
      id: 'ares-3d-regions',
      title: 'Country Scale Regions',
      elevationInfo: { mode: 'on-the-ground' }
    });
    regionGraphicsLayerRef.current = regionLayer;

    // Initialize 3D Mars SceneView with Martian Ellipsoid GCS_Mars_2000
    const map = new Map({
      basemap: marsImageryBasemap,
      ground: {
        surfaceColor: [144, 106, 100],
        layers: [marsElevation]
      },
      layers: [marsNamesLayer, missionLayer, regionLayer, modelLayer]
    });

    const initialCamera = initialCoord ? {
      position: {
        x: initialCoord[0],
        y: initialCoord[1],
        z: 180000,
        spatialReference: { wkid: 104971 }
      },
      heading: 0,
      tilt: 45
    } : {
      position: {
        x: -57.10,
        y: -24.37,
        z: 840000,
        spatialReference: { wkid: 104971 }
      },
      heading: 293.2,
      tilt: 44.0
    };

    const view = new SceneView({
      container: viewContainerRef.current,
      map,
      qualityProfile: 'high',
      spatialReference: marsSR,
      environment: {
        lighting: {
          type: 'virtual',
          directShadowsEnabled: true
        },
        atmosphereEnabled: true
      },
      camera: initialCamera,
      popup: {
        actions: [],
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          position: 'top-right',
          breakpoint: false
        }
      }
    });

    view.ui.remove('attribution');
    view.ui.remove('navigation-toggle');
    view.ui.remove('compass');
    view.ui.remove('zoom');

    sceneViewRef.current = view;

    // Idle planetary rotation
    let rotating = true;
    const spinTask = addFrameTask({
      update: () => {
        if (!view.interacting && rotating) {
          const cam = view.camera?.clone();
          if (cam?.position?.longitude != null) {
            cam.position.longitude -= 0.012;
            view.camera = cam;
          }
        }
      }
    });
    spinTaskRef.current = spinTask;

    view.when(() => {
      setIsLoaded(true);

      // Track camera elevation and coordinates for HUD
      view.watch('camera', (cam) => {
        if (cam?.position) {
          const altKm = cam.position.z >= 10000
            ? `${Math.round(cam.position.z / 1000).toLocaleString()} km`
            : `${Math.round(cam.position.z).toLocaleString()} m`;

          setCurrentCameraInfo({
            lon: Number(cam.position.longitude?.toFixed(3) || 0),
            lat: Number(cam.position.latitude?.toFixed(3) || 0),
            alt: altKm
          });

          // Dynamic HiRISE LOD: activates when camera altitude is lower than 12 km
          if (marsHiRiseImagery) {
            marsHiRiseImagery.visible = cam.position.z < 12000;
          }
        }
      });
    });

    return () => {
      if (spinTaskRef.current) spinTaskRef.current.remove();
      if (activeWidgetRef.current) {
        try { activeWidgetRef.current.destroy(); } catch (e) {}
      }
      if (view) {
        try { view.destroy(); } catch (e) {}
      }
    };
  }, []);

  // Basemap Switcher
  const handleToggleBasemap = (type) => {
    const view = sceneViewRef.current;
    if (!view) return;
    if (type === 'imagery') {
      view.map.basemap = marsImageryBasemap;
      setActiveBasemap('imagery');
    } else {
      view.map.basemap = shadedReliefBasemap;
      setActiveBasemap('shadedRelief');
    }
  };

  // Fly to famous mission location
  const handleFlyToLocation = (loc) => {
    const view = sceneViewRef.current;
    if (!view) return;
    setIsRotating(false);
    view.goTo(new Camera(loc.camera), { duration: 2500, easing: 'in-out-cubic' });
  };

  // Measurement tools setup
  const handleActivateMeasureTool = (tool) => {
    const view = sceneViewRef.current;
    if (!view) return;

    setIsRotating(false);

    // Clean up previous measurement widget
    if (activeWidgetRef.current) {
      try {
        view.ui.remove(activeWidgetRef.current);
        activeWidgetRef.current.destroy();
      } catch (e) {}
      activeWidgetRef.current = null;
    }

    if (activeMeasureTool === tool) {
      setActiveMeasureTool(null);
      return;
    }

    setActiveMeasureTool(tool);

    let widget = null;
    if (tool === 'line') {
      widget = new DirectLineMeasurement3D({ view });
    } else if (tool === 'area') {
      widget = new AreaMeasurement3D({ view });
    } else if (tool === 'elevation') {
      widget = new ElevationProfile({
        view,
        profiles: [{ type: 'ground', color: '#00F0FF' }]
      });
    }

    if (widget) {
      activeWidgetRef.current = widget;
      view.ui.add(widget, 'bottom-right');
    }
  };

  const handleClearMeasurement = () => {
    const view = sceneViewRef.current;
    if (activeWidgetRef.current && view) {
      try {
        view.ui.remove(activeWidgetRef.current);
        activeWidgetRef.current.destroy();
      } catch (e) {}
      activeWidgetRef.current = null;
    }
    setActiveMeasureTool(null);
  };

  // 3D Earth Models Placement
  const handlePlaceEarthModel = async (model) => {
    const view = sceneViewRef.current;
    const modelLayer = modelGraphicsLayerRef.current;
    if (!view || !modelLayer) return;

    setIsLoadingModel(true);
    setSelectedModel(model);
    setIsRotating(false);

    try {
      modelLayer.removeAll();
      const gltfUrl = await loadGltfModelFromZip(model.zipPath);

      // Place model directly at current center of camera view
      const centerPoint = new Point({
        longitude: view.center.longitude,
        latitude: view.center.latitude,
        z: 0,
        spatialReference: marsSR
      });

      const mesh = await Mesh.createFromGLTF(centerPoint, gltfUrl);

      const graphic = new Graphic({
        geometry: mesh,
        symbol: {
          type: 'mesh-3d',
          symbolLayers: [{ type: 'fill' }]
        }
      });

      modelLayer.add(graphic);

      // Tilt camera for a dramatic 3D perspective of the imported object
      view.goTo({
        target: graphic,
        tilt: 68,
        heading: view.camera.heading + 25
      }, { duration: 2000 });
    } catch (err) {
      console.error('Failed to load Earth 3D model:', err);
    } finally {
      setIsLoadingModel(false);
    }
  };

  const handleClearEarthModel = () => {
    if (modelGraphicsLayerRef.current) {
      modelGraphicsLayerRef.current.removeAll();
    }
    setSelectedModel(null);
  };

  // Country & Region Projection onto Mars
  const handleProjectCountry = (country) => {
    const view = sceneViewRef.current;
    const regionLayer = regionGraphicsLayerRef.current;
    if (!view || !regionLayer) return;

    setSelectedCountry(country);
    setIsRotating(false);
    regionLayer.removeAll();

    const centerLon = view.center.longitude;
    const centerLat = view.center.latitude;

    const ring = generateScaleCorrectedCountryPolygon(country, centerLon, centerLat);

    const polygonGeometry = new Polygon({
      rings: [ring],
      spatialReference: marsSR
    });

    const countryGraphic = new Graphic({
      geometry: polygonGeometry,
      symbol: {
        type: 'polygon-3d',
        symbolLayers: [
          {
            type: 'fill',
            material: { color: country.color },
            outline: { color: country.outlineColor, size: '2px' }
          }
        ]
      }
    });

    const centroidPoint = new Point({
      longitude: centerLon,
      latitude: centerLat,
      spatialReference: marsSR
    });

    const labelGraphic = new Graphic({
      geometry: centroidPoint,
      symbol: {
        type: 'point-3d',
        symbolLayers: [
          {
            type: 'text',
            material: { color: '#FFFFFF' },
            text: `${country.name.toUpperCase()}\n(${country.areaKm2})`,
            size: 11
          }
        ],
        callout: {
          type: 'line',
          size: 1.5,
          color: [255, 255, 255, 200]
        },
        verticalOffset: {
          screenLength: 30,
          maxWorldLength: 200000,
          minWorldLength: 100
        }
      }
    });

    regionLayer.addMany([countryGraphic, labelGraphic]);

    // Frame camera over country
    view.goTo({
      target: polygonGeometry.extent.expand(1.4),
      tilt: 45
    }, { duration: 2000 });
  };

  const handleClearCountry = () => {
    if (regionGraphicsLayerRef.current) {
      regionGraphicsLayerRef.current.removeAll();
    }
    setSelectedCountry(null);
  };

  // Reset to full planetary disc view
  const handleResetPlanetView = () => {
    const view = sceneViewRef.current;
    if (!view) return;
    setIsRotating(true);
    view.goTo({
      position: { x: -57.10, y: -24.37, z: 840000, spatialReference: { wkid: 104971 } },
      heading: 293.2,
      tilt: 44.0
    }, { duration: 2000 });
  };

  return (
    <div className="relative w-full h-full bg-[#0d0d12] overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas */}
      <div ref={viewContainerRef} className="w-full h-full" />

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0d0d12]/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 rounded-full border-2 border-ares-accent/20 border-t-ares-accent animate-spin mb-4" />
          <div className="text-ares-accent font-mono text-sm tracking-widest uppercase">
            Initializing 3D Planetary Ellipsoid
          </div>
          <div className="text-ares-text-muted text-xs font-mono mt-1">
            Loading NASA MDEM200M Elevation Mesh (GCS_Mars_2000)...
          </div>
        </div>
      )}

      {/* Floating Top Status Ribbon */}
      <div className="absolute top-20 left-4 z-20 flex items-center space-x-2 bg-ares-surface/85 backdrop-blur-md border border-ares-border px-3 py-1.5 rounded-xl text-xs font-mono shadow-panel pointer-events-auto">
        <div className="flex items-center space-x-1.5 text-ares-accent">
          <Globe className="w-3.5 h-3.5 animate-spin-slow" />
          <span className="font-bold">GCS_Mars_2000</span>
        </div>
        <span className="text-ares-border">|</span>
        <span className="text-ares-text-muted">ALT:</span>
        <span className="text-ares-cyan font-bold">{currentCameraInfo.alt}</span>
        <span className="text-ares-border">|</span>
        <span className="text-ares-text">{currentCameraInfo.lat}° N, {currentCameraInfo.lon}° E</span>
      </div>

      {/* Main Left Tool Strip */}
      <div className="absolute top-32 left-4 z-20 flex flex-col space-y-2 pointer-events-auto">
        {/* Quick Travel Menu */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'locations' ? null : 'locations')}
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center space-x-2 text-xs font-mono shadow-panel ${
            activeDrawer === 'locations'
              ? 'bg-ares-accent text-ares-bg font-bold border-ares-accent shadow-glow-accent'
              : 'bg-ares-surface/90 hover:bg-ares-surface-alt border-ares-border text-ares-text'
          }`}
          title="Planetary Mission & Rover Locations"
        >
          <MapPin className="w-4 h-4 text-ares-accent" />
          <span className="hidden sm:inline font-semibold">Rovers & Craters</span>
        </button>

        {/* 3D Measurement Tools */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'measure' ? null : 'measure')}
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center space-x-2 text-xs font-mono shadow-panel ${
            activeDrawer === 'measure'
              ? 'bg-ares-cyan text-ares-bg font-bold border-ares-cyan shadow-glow-cyan'
              : 'bg-ares-surface/90 hover:bg-ares-surface-alt border-ares-border text-ares-text'
          }`}
          title="3D Direct Distance, Area, & Elevation Profile Tools"
        >
          <Ruler className="w-4 h-4 text-ares-cyan" />
          <span className="hidden sm:inline font-semibold">3D Measure</span>
        </button>

        {/* Earth vs Mars Comparison */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'compare' ? null : 'compare')}
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all flex items-center space-x-2 text-xs font-mono shadow-panel ${
            activeDrawer === 'compare'
              ? 'bg-purple-500 text-white font-bold border-purple-500 shadow-glow-purple'
              : 'bg-ares-surface/90 hover:bg-ares-surface-alt border-ares-border text-ares-text'
          }`}
          title="Compare Scale with Earth 3D Models and Countries"
        >
          <Box className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline font-semibold">Scale Comparison</span>
        </button>

        {/* Toggle Auto Rotation */}
        <button
          onClick={() => {
            setIsRotating(!isRotating);
          }}
          className="p-2.5 rounded-xl bg-ares-surface/90 hover:bg-ares-surface-alt border border-ares-border text-ares-text text-xs font-mono shadow-panel flex items-center space-x-2 transition-all"
          title={isRotating ? 'Pause Planetary Rotation' : 'Resume Planetary Rotation'}
        >
          {isRotating ? <Pause className="w-4 h-4 text-ares-warning" /> : <Play className="w-4 h-4 text-ares-accent" />}
          <span className="hidden sm:inline font-semibold">{isRotating ? 'Pause Spin' : 'Spin Mars'}</span>
        </button>

        {/* Recenter Globe */}
        <button
          onClick={handleResetPlanetView}
          className="p-2.5 rounded-xl bg-ares-surface/90 hover:bg-ares-surface-alt border border-ares-border text-ares-text text-xs font-mono shadow-panel flex items-center space-x-2 transition-all hover:border-ares-accent/60"
          title="Reset to Full Planetary Globe Disc"
        >
          <Compass className="w-4 h-4 text-ares-accent" />
          <span className="hidden sm:inline font-semibold">Reset View</span>
        </button>
      </div>

      {/* Floating Bottom Action: Transition to 2D Tactical View */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-3 bg-ares-surface/95 backdrop-blur-md border border-ares-border/80 px-4 py-2.5 rounded-2xl shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-ares-text-muted font-mono uppercase tracking-wider">Tactical Navigation</span>
          <span className="text-xs text-white font-semibold">Ready for surface route planning</span>
        </div>
        <button
          onClick={() => {
            if (onSwitchTo2D) {
              onSwitchTo2D([currentCameraInfo.lon, currentCameraInfo.lat]);
            }
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-ares-accent to-ares-accent-soft text-ares-bg font-bold font-mono text-xs shadow-glow-accent hover:opacity-95 transition-all flex items-center space-x-1.5"
        >
          <span>Switch to 2D Surface Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Basemap Switcher (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-auto flex items-center bg-ares-surface/90 backdrop-blur-md border border-ares-border rounded-xl p-1 shadow-panel">
        <button
          onClick={() => handleToggleBasemap('imagery')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
            activeBasemap === 'imagery'
              ? 'bg-ares-accent text-ares-bg font-bold shadow-glow-accent'
              : 'text-ares-text-muted hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Optical Satellite</span>
        </button>
        <button
          onClick={() => handleToggleBasemap('shadedRelief')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
            activeBasemap === 'shadedRelief'
              ? 'bg-ares-accent text-ares-bg font-bold shadow-glow-accent'
              : 'text-ares-text-muted hover:text-white'
          }`}
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Shaded Relief MOLA</span>
        </button>
      </div>

      {/* ================= DRAWERS ================= */}

      {/* 1. LOCATIONS DRAWER */}
      {activeDrawer === 'locations' && (
        <div className="absolute top-20 left-48 z-30 w-80 max-h-[80vh] overflow-y-auto bg-ares-surface/95 backdrop-blur-xl border border-ares-border rounded-2xl shadow-2xl p-4 pointer-events-auto">
          <div className="flex items-center justify-between pb-3 border-b border-ares-border/70 mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-ares-accent" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Planetary Expeditions</span>
            </div>
            <button onClick={() => setActiveDrawer(null)} className="text-ares-text-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {ROVER_LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleFlyToLocation(loc)}
                className="p-2.5 rounded-xl bg-ares-bg/60 hover:bg-ares-surface-alt border border-ares-border/60 hover:border-ares-accent/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-ares-accent transition-colors">
                    {loc.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ares-surface border border-ares-border text-ares-cyan">
                    {loc.year}
                  </span>
                </div>
                <div className="text-[11px] text-ares-cyan/90 font-mono mt-0.5">{loc.site}</div>
                <div className="text-[10px] text-ares-text-muted mt-1 leading-relaxed">{loc.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MEASUREMENT TOOLS DRAWER */}
      {activeDrawer === 'measure' && (
        <div className="absolute top-20 left-48 z-30 w-80 bg-ares-surface/95 backdrop-blur-xl border border-ares-border rounded-2xl shadow-2xl p-4 pointer-events-auto">
          <div className="flex items-center justify-between pb-3 border-b border-ares-border/70 mb-3">
            <div className="flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-ares-cyan" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">3D GIS Measurements</span>
            </div>
            <button onClick={() => setActiveDrawer(null)} className="text-ares-text-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleActivateMeasureTool('line')}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeMeasureTool === 'line'
                  ? 'bg-ares-cyan text-ares-bg font-bold border-ares-cyan'
                  : 'bg-ares-bg/60 hover:bg-ares-surface-alt border-ares-border text-ares-text'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-mono">Direct 3D Line Measurement</div>
                <div className="text-[10px] opacity-75 font-sans">Line of sight, horizontal distance & vertical height delta</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 ml-2" />
            </button>

            <button
              onClick={() => handleActivateMeasureTool('area')}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeMeasureTool === 'area'
                  ? 'bg-ares-cyan text-ares-bg font-bold border-ares-cyan'
                  : 'bg-ares-bg/60 hover:bg-ares-surface-alt border-ares-border text-ares-text'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-mono">3D Area & Crater Surface</div>
                <div className="text-[10px] opacity-75 font-sans">Geodesic surface area in km² and perimeter length</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 ml-2" />
            </button>

            <button
              onClick={() => handleActivateMeasureTool('elevation')}
              className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeMeasureTool === 'elevation'
                  ? 'bg-ares-cyan text-ares-bg font-bold border-ares-cyan'
                  : 'bg-ares-bg/60 hover:bg-ares-surface-alt border-ares-border text-ares-text'
              }`}
            >
              <div>
                <div className="text-xs font-bold font-mono">Interactive Elevation Profile</div>
                <div className="text-[10px] opacity-75 font-sans">Draw cross-section transect across canyons and crater walls</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 ml-2" />
            </button>

            {activeMeasureTool && (
              <button
                onClick={handleClearMeasurement}
                className="w-full mt-2 py-2 rounded-xl bg-ares-warning/20 hover:bg-ares-warning/30 border border-ares-warning/50 text-ares-warning text-xs font-mono font-bold transition-all text-center"
              >
                Clear Current Measurement
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. EARTH VS MARS SCALE COMPARISON DRAWER */}
      {activeDrawer === 'compare' && (
        <div className="absolute top-20 left-48 z-30 w-88 max-h-[80vh] overflow-y-auto bg-ares-surface/95 backdrop-blur-xl border border-ares-border rounded-2xl shadow-2xl p-4 pointer-events-auto">
          <div className="flex items-center justify-between pb-3 border-b border-ares-border/70 mb-3">
            <div className="flex items-center space-x-2">
              <Box className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Planetary Scale Comparison</span>
            </div>
            <button onClick={() => setActiveDrawer(null)} className="text-ares-text-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab 1: 3D Earth Models on Mars */}
          <div className="mb-4">
            <div className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold mb-2 flex items-center justify-between">
              <span>1:1 Scale 3D Earth Models</span>
              {selectedModel && (
                <button onClick={handleClearEarthModel} className="text-[10px] text-ares-warning hover:underline">
                  Remove Model
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              {EARTH_3D_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handlePlaceEarthModel(model)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedModel?.id === model.id
                      ? 'bg-purple-950/60 border-purple-500 shadow-glow-purple'
                      : 'bg-ares-bg/60 hover:bg-ares-surface-alt border-ares-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{model.name}</span>
                    <span className="text-[10px] font-mono text-purple-300">{model.height}</span>
                  </div>
                  <div className="text-[10px] text-ares-text-muted mt-0.5">{model.description}</div>
                </div>
              ))}
            </div>
            {isLoadingModel && (
              <div className="text-[11px] font-mono text-purple-300 mt-2 text-center animate-pulse">
                Extracting glTF & placing 3D model on terrain...
              </div>
            )}
          </div>

          {/* Tab 2: Country Scale Projections */}
          <div className="border-t border-ares-border/70 pt-3">
            <div className="text-[11px] font-mono text-ares-cyan uppercase tracking-wider font-bold mb-2 flex items-center justify-between">
              <span>Country Scale Projection (1.887x)</span>
              {selectedCountry && (
                <button onClick={handleClearCountry} className="text-[10px] text-ares-warning hover:underline">
                  Clear Region
                </button>
              )}
            </div>
            <div className="text-[10px] text-ares-text-muted mb-2 leading-relaxed">
              Geodesically scaled by 1.887x in angular extent to represent true physical surface area on Mars's half-radius sphere.
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {EARTH_COUNTRIES.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleProjectCountry(country)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selectedCountry?.id === country.id
                      ? 'bg-ares-cyan/20 border-ares-cyan text-white font-bold'
                      : 'bg-ares-bg/50 hover:bg-ares-surface-alt border-ares-border/50 text-ares-text'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{country.name}</div>
                  <div className="text-[9px] text-ares-text-muted font-mono">{country.areaKm2}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

