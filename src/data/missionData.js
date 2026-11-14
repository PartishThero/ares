export const PRESET_MISSIONS = [
  {
    id: 'mission-boxwork-primary',
    code: 'EVA-MS-01',
    name: 'Mount Sharp Boxwork Formations Investigation',
    objective: 'Survey polygonal fracture-fill mineral ridges to characterize ancient groundwater geochemistry and subsurface habitable environments.',
    difficulty: 'Moderate to Demanding',
    recommendedMode: 'Safest',
    startTargetId: 'poi-glen-torridon',
    destinationTargetId: 'poi-boxwork-alpha',
    startCoords: [137.3880, -4.7310],
    destCoords: [137.4025, -4.9450],
    targetWaypoints: ['poi-sulfate-unit'],
    scienceRationale: 'Boxwork structures represent the most compelling evidence of persistent groundwater percolation late in Martian history. The route ascends from the clay-rich floor through sulfate transition layers.',
    keyCheckpoints: [
      'Checkpoint Alpha: Ascend past Vera Rubin talus ramp',
      'Checkpoint Bravo: Sulfate-bearing ripple boundary contact',
      'Primary Station: Boxwork intersecting ridge ridgecrest sampling'
    ],
    missionConstraints: {
      maxSlopeAllowed: 20,
      maxEvaDurationHours: 6.0,
      bagnoldDuneExclusion: true
    }
  },
  {
    id: 'mission-stratigraphy-traverse',
    code: 'EVA-MS-02',
    name: 'Lacustrine to Evaporite Stratigraphic Traverse',
    objective: 'Document the planetary drying epoch of Mars by traversing from ancient freshwater lake mudstones to hyper-saline sulfate evaporite strata.',
    difficulty: 'Long Distance Traverse',
    recommendedMode: 'Science-focused',
    startTargetId: 'poi-yellowknife-bay',
    destinationTargetId: 'poi-sulfate-unit',
    startCoords: [137.4490, -4.5930],
    destCoords: [137.3820, -4.8920],
    targetWaypoints: ['poi-bradbury-landing', 'poi-glen-torridon'],
    scienceRationale: 'Provides a complete continuous vertical column through 900 meters of Martian sedimentary history, from habitable lakebed to dried salt flats.',
    keyCheckpoints: [
      'Checkpoint 1: Yellowknife Bay Sheepbed drill benchmark',
      'Checkpoint 2: Peace Vallis alluvial outwash crossing',
      'Checkpoint 3: Glen Torridon clay trough transition',
      'Final Target: Polyhydrated sulfate benchmark'
    ],
    missionConstraints: {
      maxSlopeAllowed: 16,
      maxEvaDurationHours: 8.0,
      bagnoldDuneExclusion: true
    }
  },
  {
    id: 'mission-gediz-debris',
    code: 'EVA-MS-03',
    name: 'Gediz Vallis Catastrophic Flood Survey',
    objective: 'Inspect giant float boulders deposited during late-stage debris avalanches down the mountain flank.',
    difficulty: 'Steep Terrain / High Hazard',
    recommendedMode: 'Safest',
    startTargetId: 'poi-vera-rubin',
    destinationTargetId: 'poi-gediz-vallis',
    startCoords: [137.3590, -4.7430],
    destCoords: [137.3480, -4.8420],
    targetWaypoints: [],
    scienceRationale: 'Investigate evidence that liquid water carved channels down Mount Sharp far later into the Hesperian/Amazonian than previously theorized.',
    keyCheckpoints: [
      'Checkpoint 1: Vera Rubin hematite cap departure',
      'Checkpoint 2: Avoid northern Bagnold dune slippage tongue',
      'Primary Station: Gediz Vallis boulder wall examination'
    ],
    missionConstraints: {
      maxSlopeAllowed: 22,
      maxEvaDurationHours: 5.5,
      bagnoldDuneExclusion: true
    }
  }
];

