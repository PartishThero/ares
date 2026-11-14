import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import Basemap from '@arcgis/core/Basemap.js';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer.js';
import TileLayer from '@arcgis/core/layers/TileLayer.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import GroupLayer from '@arcgis/core/layers/GroupLayer.js';

// Martian Coordinate Reference System: GCS_Mars_2000 (WKID: 104971)
export const marsSR = new SpatialReference({ wkid: 104971 });

// 3D Martian Digital Elevation Model (DEM): NASA/ESA/USGS MDEM200M ImageServer
export const marsElevation = new ElevationLayer({
  id: 'marsElevation',
  title: 'Mars Global DEM (MDEM200M)',
  url: 'https://astro.arcgis.com/arcgis/rest/services/OnMars/MDEM200M/ImageServer',
  copyright: 'NASA, ESA, HRSC, Goddard Space Flight Center, USGS Astrogeology Science Center, Esri'
});

// Dynamic HiRISE Ultra-High-Resolution Imagery Layer (activated on close zoom)
export const marsHiRiseImagery = new TileLayer({
  id: 'marsHiRiseImagery',
  portalItem: {
    id: 'c1c4c750a2154842ae523c984cc14fa5'
  },
  title: 'Mars HiRISE Detailed Imagery',
  opacity: 1,
  visible: false
});

// Mars Satellite Optical Imagery Basemap (Viking + MGS MOLA)
export const marsImagery = new TileLayer({
  id: 'marsImagery',
  portalItem: {
    id: '1efb16809db84f0c892b9b0662dab0c8'
  },
  title: 'Mars Satellite Imagery',
  copyright: 'USGS Astrogeology Science Center, NASA, JPL, Esri',
  opacity: 1
});

export const marsImageryBasemap = new Basemap({
  id: 'marsImageryBasemap',
  title: 'Satellite Imagery',
  thumbnailUrl: 'https://www.arcgis.com/sharing/rest/content/items/1efb16809db84f0c892b9b0662dab0c8/info/thumbnail/thumbnail1552849034608.png',
  baseLayers: [marsImagery, marsHiRiseImagery]
});

// Topographic Shaded Relief Basemap (Color-coded MOLA elevations)
export const shadedReliefLayer = new TileLayer({
  id: 'shadedReliefLayer',
  portalItem: {
    id: '07b33bb3067747abbebd1ce34c29816e'
  },
  copyright: 'USGS Astrogeology Science Center, NASA, JPL, ESA, DLR, Esri',
  title: 'Topographic Shaded Relief'
});

export const shadedReliefBasemap = new Basemap({
  id: 'shadedReliefBasemap',
  title: 'Topographic Shaded Relief',
  thumbnailUrl: 'https://www.arcgis.com/sharing/rest/content/items/07b33bb3067747abbebd1ce34c29816e/info/thumbnail/thumbnail1552722865064.png',
  baseLayers: [shadedReliefLayer]
});

// Scale-dependent IAU / USGS planetary nomenclature layers
export const marsNamesLayer = new GroupLayer({
  id: 'marsNamesLayer',
  title: 'Planetary Nomenclature',
  layers: [
    // 1. Mountains & Volcanoes (Mons)
    new FeatureLayer({
      title: 'Mars Nomenclature Mons',
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Mars_Nomenclature_Mountains/FeatureServer/7',
      popupEnabled: false,
      minScale: 15000000,
      maxScale: 0,
      definitionExpression: "clean_name LIKE '%mons%' AND diameter >= 100",
      labelingInfo: [
        {
          labelExpression: '[name]',
          symbol: {
            type: 'text',
            color: [225, 120, 120, 1],
            font: {
              family: 'Arial',
              size: 11,
              style: 'italic',
              weight: 'bold'
            },
            haloSize: 1.0,
            haloColor: [20, 20, 25, 240]
          }
        }
      ],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 255, 255, 0],
          outline: { color: [255, 255, 255, 0] }
        }
      },
      labelsVisible: true,
      elevationInfo: { mode: 'on-the-ground' }
    }),
    // 2. Impact Craters
    new FeatureLayer({
      title: 'Mars Nomenclature Craters',
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Mars_Nomenclature_Mountains/FeatureServer/7',
      popupEnabled: false,
      minScale: 5200000,
      maxScale: 0,
      definitionExpression: "type = 'Crater, craters' AND diameter >= 45",
      labelingInfo: [
        {
          labelExpressionInfo: { expression: '$feature["name"] + " crater"' },
          symbol: {
            type: 'text',
            color: [195, 195, 205, 1],
            font: {
              family: 'Arial',
              size: 11,
              style: 'italic',
              weight: 'bold'
            },
            haloSize: 1.0,
            haloColor: [30, 30, 35, 240]
          }
        }
      ],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 255, 255, 0],
          outline: { color: [255, 255, 255, 0] }
        }
      },
      labelsVisible: true,
      elevationInfo: { mode: 'on-the-ground' }
    }),
    // 3. Plains & Canyons (Planitiae & Valles)
    new FeatureLayer({
      title: 'Mars Nomenclature Planitia and Vallis',
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Mars_Nomenclature_Mountains/FeatureServer/7',
      popupEnabled: false,
      minScale: 30000000,
      maxScale: 0,
      definitionExpression: "type = 'Planitia, planitiae' OR ((type = 'Vallis, valles') AND (diameter >= 700))",
      labelingInfo: [
        {
          labelExpression: '[name]',
          symbol: {
            type: 'text',
            color: [255, 245, 220, 0.75],
            font: { family: 'Arial', size: 12, style: 'italic' },
            haloSize: 0.8,
            haloColor: [20, 20, 25, 200]
          }
        }
      ],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [255, 255, 255, 0],
          outline: { color: [255, 255, 255, 0] }
        }
      },
      labelsVisible: true
    })
  ]
});

// Human Mars Missions & Rover Landing Sites with 3D leader-line billboarding
export const missionLayer = new FeatureLayer({
  id: 'missionLayer',
  title: 'Human Exploration & Rover Landing Sites',
  portalItem: { id: 'be651e0ceb6941b3949d0f68e0169642' },
  elevationInfo: { mode: 'on-the-ground' },
  labelingInfo: [
    {
      labelExpressionInfo: {
        expression: "$feature.NAME + ' (' + $feature.landed + ')'"
      },
      symbol: {
        type: 'label-3d',
        symbolLayers: [
          {
            type: 'text',
            material: { color: '#FF7A45' },
            size: 11
          }
        ],
        callout: {
          type: 'line',
          size: 1.5,
          color: [255, 122, 69, 200],
          border: null
        },
        verticalOffset: {
          screenLength: 26,
          maxWorldLength: 150000,
          minWorldLength: 20
        }
      },
      labelPlacement: 'above-center',
      maxScale: 0,
      minScale: 0
    }
  ],
  renderer: {
    type: 'simple',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          size: 16,
          material: { color: [255, 122, 69, 0.2] },
          outline: { color: '#FF7A45', size: '1.5px' },
          resource: { primitive: 'circle' }
        }
      ]
    }
  },
  popupEnabled: false,
  maxScale: 0,
  minScale: 0
});

// Quick-travel landmark locations for cinematic fly-to cameras
export const ROVER_LOCATIONS = [
  {
    id: 'perseverance',
    name: 'Perseverance Rover',
    site: 'Jezero Crater River Delta',
    year: '2021',
    description: 'Ancient delta fan deposits and clay-rich lakebed sediments searching for biosignatures.',
    camera: {
      position: { x: 77.31831, y: 17.9882, z: 7292.077, spatialReference: { wkid: 104971 } },
      heading: 15.53,
      tilt: 67.5
    },
    target2D: [77.45, 18.44]
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover',
    site: 'Gale Crater & Mount Sharp',
    year: '2012',
    description: 'Stratified sedimentary layers of Aeolis Mons exploring habitability and ancient lake sequences.',
    camera: {
      position: { x: 136.90526, y: -7.16597, z: 62217.981, spatialReference: { wkid: 104971 } },
      heading: 13.78,
      tilt: 65.46
    },
    target2D: [137.40, -4.60]
  },
  {
    id: 'opportunity',
    name: 'Opportunity Rover',
    site: 'Meridiani Planum (Endeavour Crater)',
    year: '2004',
    description: 'Discovered hematite spherules (blueberries) proving past presence of acidic groundwater.',
    camera: {
      position: { x: -5.7945, y: 0.66213, z: 77385.93, spatialReference: { wkid: 104971 } },
      heading: 173.58,
      tilt: 61.54
    },
    target2D: [-5.53, -1.95]
  },
  {
    id: 'insight',
    name: 'InSight Lander',
    site: 'Elysium Planitia',
    year: '2018',
    description: 'Planetary seismology and interior structure probing Mars core and crustal thickness.',
    camera: {
      position: { x: 135.6234, y: 4.5024, z: 45000, spatialReference: { wkid: 104971 } },
      heading: 0,
      tilt: 60.0
    },
    target2D: [135.62, 4.50]
  },
  {
    id: 'olympus_mons',
    name: 'Olympus Mons',
    site: 'Tharsis Volcanic Province',
    year: 'Shield Volcano',
    description: 'Largest volcano in the Solar System rising 21.3 km above Mars datum with a 80 km caldera.',
    camera: {
      position: { x: -133.8, y: 16.5, z: 120000, spatialReference: { wkid: 104971 } },
      heading: 355.0,
      tilt: 63.0
    },
    target2D: [-133.8, 18.65]
  },
  {
    id: 'valles_marineris',
    name: 'Valles Marineris',
    site: 'Melas Chasma Chasm System',
    year: 'Tectonic Canyon',
    description: 'Grand canyon of Mars spanning 4,000 km long and up to 7 km deep across the equator.',
    camera: {
      position: { x: -76.5, y: -12.5, z: 140000, spatialReference: { wkid: 104971 } },
      heading: 310.0,
      tilt: 62.0
    },
    target2D: [-80.0, -9.5]
  }
];

