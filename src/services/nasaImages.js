export const CURATED_ROVER_GALLERY = [
  {
    id: 'curiosity-boxwork',
    title: 'Mount Sharp Boxwork Polygonal Veins',
    rover: 'Curiosity (MSL)',
    sol: 3420,
    camera: 'Mastcam (Mast Camera)',
    earthDate: '2022-03-24',
    url: 'https://images-assets.nasa.gov/image/PIA25682/PIA25682~orig.jpg',
    thumb: 'https://images-assets.nasa.gov/image/PIA25682/PIA25682~thumb.jpg',
    description: 'Protruding boxwork ridges formed by mineral cement fills resistant to eolian deflation on the slopes of Mount Sharp.'
  },
  {
    id: 'curiosity-gediz-ridge',
    title: 'Gediz Vallis Debris Flow Boulders',
    rover: 'Curiosity (MSL)',
    sol: 4180,
    camera: 'Mastcam 100mm Focal Length',
    earthDate: '2024-05-18',
    url: 'https://images-assets.nasa.gov/image/PIA26184/PIA26184~orig.jpg',
    thumb: 'https://images-assets.nasa.gov/image/PIA26184/PIA26184~thumb.jpg',
    description: 'Massive dark boulders perched atop light-toned sedimentary bedrock inside the channel of Gediz Vallis.'
  },
  {
    id: 'curiosity-vera-rubin',
    title: 'Vera Rubin Ridge Laminated Outcrop',
    rover: 'Curiosity (MSL)',
    sol: 1809,
    camera: 'MAHLI (Mars Hand Lens Imager)',
    earthDate: '2017-09-14',
    url: 'https://images-assets.nasa.gov/image/PIA22222/PIA22222~orig.jpg',
    thumb: 'https://images-assets.nasa.gov/image/PIA22222/PIA22222~thumb.jpg',
    description: 'Close-up texture of hematite-cemented fine laminations showing fine millimeter-scale mineral crystal aggregates.'
  },
  {
    id: 'curiosity-bagnold',
    title: 'Bagnold Dune Field Ripple Complex',
    rover: 'Curiosity (MSL)',
    sol: 1192,
    camera: 'Mastcam Left Eye',
    earthDate: '2015-12-13',
    url: 'https://images-assets.nasa.gov/image/PIA20316/PIA20316~orig.jpg',
    thumb: 'https://images-assets.nasa.gov/image/PIA20316/PIA20316~thumb.jpg',
    description: 'Active slip face of Namib Dune showing dark basaltic sand grains sorted by seasonal winds.'
  },
  {
    id: 'curiosity-yellowknife',
    title: 'Yellowknife Bay Sheepbed Drill Site',
    rover: 'Curiosity (MSL)',
    sol: 182,
    camera: 'MAHLI Hand Lens',
    earthDate: '2013-02-09',
    url: 'https://images-assets.nasa.gov/image/PIA16729/PIA16729~orig.jpg',
    thumb: 'https://images-assets.nasa.gov/image/PIA16729/PIA16729~thumb.jpg',
    description: 'First drill hole on Mars penetrating ancient freshwater lake mudstone, producing non-oxidized gray powder.'
  }
];

export async function searchNasaImages(query = 'Curiosity Mars Gale Crater') {
  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = data?.collection?.items || [];
    if (items.length === 0) return CURATED_ROVER_GALLERY;

    return items.slice(0, 8).map((item, idx) => {
      const dataItem = item.data?.[0] || {};
      const linkItem = item.links?.[0] || {};
      return {
        id: `nasa-api-${idx}`,
        title: dataItem.title || 'Mars Surface Observation',
        rover: dataItem.secondary_creator || 'NASA Mars Exploration',
        sol: dataItem.nasa_id || 'Historical',
        camera: dataItem.center || 'JPL',
        earthDate: dataItem.date_created?.split('T')[0] || '2023',
        url: linkItem.href || CURATED_ROVER_GALLERY[idx % CURATED_ROVER_GALLERY.length].url,
        thumb: linkItem.href || CURATED_ROVER_GALLERY[idx % CURATED_ROVER_GALLERY.length].thumb,
        description: dataItem.description || 'NASA surface observation image from Gale Crater.'
      };
    });
  } catch {
    return CURATED_ROVER_GALLERY;
  }
}
