export const SCIENTIFIC_TARGETS = [
  {
    id: 'poi-boxwork-alpha',
    name: 'Mount Sharp Boxwork Formations (Alpha)',
    category: 'Geological Formation',
    coordinates: [137.4025, -4.9450],
    elevation: -3420,
    scienceValue: 98,
    priority: 'Critical Primary Target',
    description: 'Remarkable web-like boxwork pattern of mineral cement veins formed when ancient groundwater carried minerals into bedrock fractures. As softer bedrock eroded away, resilient intersecting ridges remained.',
    mineralogy: 'Magnesium and calcium sulfates, polyhydrated minerals, silica enrichment',
    instruments: ['CRISM (MRO)', 'Mastcam (MSL)', 'ChemCam / SuperCam', 'HiRISE'],
    observations: 'Extensive polygonal ridge networks visible in orbital HiRISE imagery. Confirmed in-situ groundwater percolation evidence indicating habitable subsurface geochemical niches.',
    hazardsNearby: 'Sharp bedrock ridges, steep localized scarps, fragile fracture voids',
    images: [
      {
        title: 'HiRISE Orbital View of Boxwork Ridges',
        instrument: 'MRO HiRISE (NASA/JPL/Univ. of Arizona)',
        url: 'https://images-assets.nasa.gov/image/PIA26354/PIA26354~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA26354/PIA26354~thumb.jpg',
        caption: 'HiRISE orbital footprint showing distinctive web-like boxwork ridge patterns on the slopes of Mount Sharp.'
      },
      {
        title: 'Curiosity Mastcam Ground View',
        instrument: 'MSL Mastcam (NASA/JPL-Caltech/MSSS)',
        url: 'https://images-assets.nasa.gov/image/PIA25682/PIA25682~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA25682/PIA25682~thumb.jpg',
        caption: 'Curiosity mosaic showing mineralized vein networks protruding from eroded sedimentary bedrock.'
      }
    ]
  },
  {
    id: 'poi-gediz-vallis',
    name: 'Gediz Vallis Ridge (Debris Flow)',
    category: 'Hydrological Channel',
    coordinates: [137.3480, -4.8420],
    elevation: -3750,
    scienceValue: 92,
    priority: 'High Scientific Priority',
    description: 'One of the youngest water-carved features on Mount Sharp. Formed by violent debris flows carrying enormous car-sized boulders down the mountain long after the main ancient lake dried.',
    mineralogy: 'Diverse dark boulder float, clay minerals, iron oxides, pyroxene',
    instruments: ['Mastcam', 'ChemCam', 'DAN (Neutron Spectrometer)'],
    observations: 'Curiosity inspected giant rounded boulders transported down slope by wet debris avalanches, confirming liquid water pulsed through Gale Crater much later than previously believed.',
    hazardsNearby: 'Unstable boulder talus, sudden 22° grade slopes, loose scree',
    images: [
      {
        title: 'Gediz Vallis Channel Wall',
        instrument: 'MSL Mastcam (NASA/JPL-Caltech/MSSS)',
        url: 'https://images-assets.nasa.gov/image/PIA26184/PIA26184~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA26184/PIA26184~thumb.jpg',
        caption: 'Mastcam panorama looking up the carved gorge of Gediz Vallis Ridge.'
      }
    ]
  },
  {
    id: 'poi-glen-torridon',
    name: 'Glen Torridon (Clay-Bearing Trough)',
    category: 'Paleo-Environment',
    coordinates: [137.3880, -4.7310],
    elevation: -4120,
    scienceValue: 90,
    priority: 'High Scientific Priority',
    description: 'Vast trough between Vera Rubin Ridge and Mount Sharp displaying the strongest orbital clay (smectite) signatures in Gale Crater. Formed in neutral-to-alkaline ancient lake conditions ideal for preserving organic compounds.',
    mineralogy: 'Fe-Mg Smectite clays, nontronite, amorphous silica',
    instruments: ['CheMin (X-ray Diffraction)', 'SAM (Sample Analysis at Mars)'],
    observations: 'Drill samples from Aberlady and Kilmarie revealed highest abundance of clay minerals encountered on Mars.',
    hazardsNearby: 'Soft sand patches, ripple drift fields',
    images: [
      {
        title: 'Glen Torridon Panorama',
        instrument: 'MSL Mastcam (NASA/JPL-Caltech)',
        url: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~thumb.jpg',
        caption: 'Curiosity 360-degree panorama in the clay-rich Glen Torridon valley.'
      }
    ]
  },
  {
    id: 'poi-vera-rubin',
    name: 'Vera Rubin Ridge (Hematite Ridge)',
    category: 'Erosional Scarp',
    coordinates: [137.3590, -4.7430],
    elevation: -3980,
    scienceValue: 86,
    priority: 'Medium-High',
    description: 'Prominent 200-meter-wide resistant ridge standing high above the crater floor. Named in honor of astronomer Vera Rubin. Characterized by intense gray crystalline hematite signatures.',
    mineralogy: 'Crystalline hematite, jarosite, iron-bearing sulfates',
    instruments: ['CRISM', 'APXS (Alpha Particle X-ray Spectrometer)', 'MAHLI'],
    observations: 'Groundwater with varying oxidation states leached through and recrystallized iron minerals, leaving behind hard rock resistant to wind erosion.',
    hazardsNearby: 'Exposed ledges, fractured bedrock caps, steep ridge edges',
    images: [
      {
        title: 'Vera Rubin Ridge Escarpment',
        instrument: 'MSL Mastcam (NASA/JPL-Caltech)',
        url: 'https://images-assets.nasa.gov/image/PIA22222/PIA22222~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA22222/PIA22222~thumb.jpg',
        caption: 'View from the crest of Vera Rubin Ridge looking back toward the northern rim of Gale Crater.'
      }
    ]
  },
  {
    id: 'poi-bagnold-dunes',
    name: 'Bagnold Dunes Field (Active Eolian Hazard)',
    category: 'Active Eolian Dunes',
    coordinates: [137.3750, -4.7550],
    elevation: -4250,
    scienceValue: 75,
    priority: 'Hazard / Scientific Monitoring',
    description: 'Band of dark, active basaltic barchan and longitudinal dunes migrating across the northwest flank of Mount Sharp. First active extraterrestrial dune field ever explored up close.',
    mineralogy: 'Pyroxene, olivine, dark basaltic sand grains, magnetite',
    instruments: ['REMS (Rover Environmental Monitoring Station)', 'Mastcam', 'Navcam'],
    observations: 'Dunes move up to 1 meter per Earth year driven by seasonal winds. High wheel-entrapment and slippage risk for rover or astronaut traversal.',
    hazardsNearby: 'Extreme sinkage risk, soft crests, steep slip-faces up to 34°',
    images: [
      {
        title: 'Namib Dune Slip Face',
        instrument: 'MSL Mastcam (NASA/JPL-Caltech)',
        url: 'https://images-assets.nasa.gov/image/PIA20316/PIA20316~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA20316/PIA20316~thumb.jpg',
        caption: 'Curiosity looking up at the 4-meter tall slip face of Namib Dune in the Bagnold Dune field.'
      }
    ]
  },
  {
    id: 'poi-sulfate-unit',
    name: 'Sulfate-Bearing Transition Zone',
    category: 'Stratigraphic Boundary',
    coordinates: [137.3820, -4.8920],
    elevation: -3600,
    scienceValue: 94,
    priority: 'Critical Scientific Target',
    description: 'Marks the major global climatic turning point on Mars: the transition from ancient wet lake environments (clay) to hyper-arid desert conditions where saline waters evaporated leaving thick sulfate salts.',
    mineralogy: 'Polyhydrated sulfates, magnesium sulfate (epsomite / kieserite), halite traces',
    instruments: ['CRISM', 'CheMin', 'SAM', 'Mastcam'],
    observations: 'Rippled rock textures formed in shallow water waves preserved in sulfate-rich layers.',
    hazardsNearby: 'Fluted yardangs, fractured terrain, steep gullying',
    images: [
      {
        title: 'Curiosity in the Sulfate Unit',
        instrument: 'MSL Mastcam (NASA/JPL-Caltech)',
        url: 'https://images-assets.nasa.gov/image/PIA25679/PIA25679~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA25679/PIA25679~thumb.jpg',
        caption: 'Laminated bedrock and fluted formations in the sulfate-bearing transition zone.'
      }
    ]
  },
  {
    id: 'poi-bradbury-landing',
    name: 'Bradbury Landing (MSL Touchdown Site)',
    category: 'Historic Landing Site',
    coordinates: [137.4417, -4.5895],
    elevation: -4501,
    scienceValue: 65,
    priority: 'Operational Baseline',
    description: 'Touchdown point of Mars Science Laboratory Curiosity on August 6, 2012 UTC. Smooth alluvial outwash plain from Peace Vallis crater rim fan.',
    mineralogy: 'Pebble conglomerate, basaltic gravel, crater dust',
    instruments: ['MSL Descent Imager (MARDI)', 'Hazcam', 'Navcam'],
    observations: 'Rocket exhaust scouring exposed underlying conglomerates, proving ancient streams flowed over a foot deep with gravels.',
    hazardsNearby: 'Minimal hazards. Ideal staging area for surface EVAs.',
    images: [
      {
        title: 'Bradbury Landing Site',
        instrument: 'MSL Navcam (NASA/JPL-Caltech)',
        url: 'https://images-assets.nasa.gov/image/PIA16075/PIA16075~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA16075/PIA16075~thumb.jpg',
        caption: 'Curiosity first 360 view from Bradbury Landing showing Mount Sharp in the distance.'
      }
    ]
  },
  {
    id: 'poi-yellowknife-bay',
    name: 'Yellowknife Bay (John Klein Drill Site)',
    category: 'Paleolake Mudstone',
    coordinates: [137.4490, -4.5930],
    elevation: -4520,
    scienceValue: 88,
    priority: 'High Scientific Priority',
    description: 'Depression where Curiosity first established Mars was once habitable. Found fine-grained Sheepbed mudstone with carbon, hydrogen, oxygen, nitrogen, phosphorus, and sulfur.',
    mineralogy: 'Phyllosilicates, saponite, magnetite, calcium sulfate veins',
    instruments: ['CheMin', 'SAM', 'APXS'],
    observations: 'Fresh gray drill tailings proved ancient water was neither overly acidic nor super salty: an ancient freshwater lake.',
    hazardsNearby: 'Minor fractured flagstones, low ledge drops (< 0.5m)',
    images: [
      {
        title: 'John Klein Drill Hole at Yellowknife Bay',
        instrument: 'MSL MAHLI (NASA/JPL-Caltech/MSSS)',
        url: 'https://images-assets.nasa.gov/image/PIA16729/PIA16729~orig.jpg',
        fallback: 'https://images-assets.nasa.gov/image/PIA16729/PIA16729~thumb.jpg',
        caption: 'First drill hole into ancient Martian mudstone revealing non-oxidized gray rock powder.'
      }
    ]
  }
];

