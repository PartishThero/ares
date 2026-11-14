import * as zip from '@zip.js/zip.js';

export const EARTH_3D_MODELS = [
  {
    id: 'everest',
    name: 'Mount Everest',
    location: 'Himalayas, Nepal/Tibet',
    height: '8,849 m',
    description: 'Earth\'s highest peak placed on Mars for true vertical scale comparison against Olympus Mons.',
    zipPath: '/gltf/everest.zip'
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon',
    location: 'Arizona, USA',
    height: '1,800 m depth',
    description: 'One of Earth\'s deepest gorges placed inside Valles Marineris (which is 4x deeper).',
    zipPath: '/gltf/grand-canyon.zip'
  },
  {
    id: 'manhattan',
    name: 'Manhattan Skyline',
    location: 'New York City, USA',
    height: 'Skyline & Grid',
    description: 'Entire Manhattan street grid and skyscrapers placed inside a Martian crater.',
    zipPath: '/gltf/manhattan.zip'
  },
  {
    id: 'dubai',
    name: 'Dubai (Burj Khalifa)',
    location: 'United Arab Emirates',
    height: '828 m spire',
    description: 'The world\'s tallest architectural structure scaled directly onto the Martian regolith.',
    zipPath: '/gltf/dubai.zip'
  },
  {
    id: 'killimanjaro',
    name: 'Mount Kilimanjaro',
    location: 'Tanzania, Africa',
    height: '5,895 m',
    description: 'Dormant stratovolcano compared against Elysium Mons and Martian volcanic shields.',
    zipPath: '/gltf/killimanjaro.zip'
  },
  {
    id: 'zurich',
    name: 'Zurich Urban Center',
    location: 'Switzerland',
    height: 'Urban Topography',
    description: 'City terrain and lake topography directly mapped onto the Martian surface.',
    zipPath: '/gltf/zurich.zip'
  }
];

export async function loadGltfModelFromZip(zipUrl) {
  try {
    const zipReader = new zip.ZipReader(new zip.HttpReader(zipUrl, { preventHeadRequest: true }));
    const entries = await zipReader.getEntries();
    const fileEntries = entries.filter((e) => !e.directory);

    const blobEntries = await Promise.all(
      fileEntries.map(async (entry) => {
        const blob = await entry.getData(new zip.BlobWriter());
        return {
          name: entry.filename,
          blob,
          url: URL.createObjectURL(blob)
        };
      })
    );

    const rootGltf = blobEntries.find((e) => e.name.endsWith('.gltf'));
    if (!rootGltf) {
      throw new Error('No .gltf root file found in archive: ' + zipUrl);
    }

    const assets = {};
    for (const b of blobEntries) {
      assets[b.name] = b.url;
    }

    const text = await rootGltf.blob.text();
    const gltfJson = JSON.parse(text);

    if (gltfJson.buffers) {
      for (const buffer of gltfJson.buffers) {
        if (assets[buffer.uri]) {
          buffer.uri = assets[buffer.uri];
        }
      }
    }

    if (gltfJson.images) {
      for (const image of gltfJson.images) {
        if (assets[image.uri]) {
          image.uri = assets[image.uri];
        }
      }
    }

    const modifiedGltfBlob = new Blob([JSON.stringify(gltfJson)], { type: 'model/gltf+json' });
    return URL.createObjectURL(modifiedGltfBlob);
  } catch (err) {
    console.error('Failed to extract glTF model from zip:', err);
    throw err;
  }
}

