import { geoBounds, geoCentroid, geoMercator, geoPath } from 'd3-geo';
import districts from './data/districts.json';
import encodedShapes from './data/district_shapes.json';

/* District outlines: geoBoundaries (CC BY 4.0), merged from upazilas and simplified.
   Each ring is delta-encoded in 0.01-degree steps: "x0 y0 dx dy dx dy ...", rings split by "|". */

type Ring = Array<[number, number]>;
type Feature = { type: 'Feature'; properties: { key: string }; geometry: { type: 'MultiPolygon'; coordinates: Ring[][] } };

function decode(encoded: string): Ring[] {
  return encoded.split('|').filter(Boolean).map((ring) => {
    const n = ring.split(' ').map(Number);
    let x = n[0] + 8800;
    let y = n[1] + 2000;
    const points: Ring = [[x / 100, y / 100]];
    for (let i = 2; i < n.length; i += 2) {
      x += n[i];
      y += n[i + 1];
      points.push([x / 100, y / 100]);
    }
    return points;
  });
}

// d3-geo expects exterior rings in clockwise order; reverse any that are not.
function clockwise(ring: Ring): Ring {
  let area = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  return area > 0 ? [...ring].reverse() : ring;
}

const shapes = encodedShapes as Record<string, string>;
export const districtFeatures: Feature[] = districts.map((d) => ({
  type: 'Feature',
  properties: { key: d.key },
  geometry: { type: 'MultiPolygon', coordinates: decode(shapes[d.key] ?? '').map((ring) => [clockwise(ring)]) },
}));
const collection = { type: 'FeatureCollection', features: districtFeatures } as never;

export const mapWidth = 512;
export const mapHeight = 570;
export const projection = geoMercator().fitExtent([[24, 20], [488, 550]], collection);
const path = geoPath(projection);

export type DistrictShape = {
  key: string; d: string; cx: number; cy: number;
  box: [number, number, number, number]; // x, y, width, height in map units
};

export const districtShapes: DistrictShape[] = districtFeatures.map((f) => {
  const [[x0, y0], [x1, y1]] = path.bounds(f as never);
  const [cx, cy] = path.centroid(f as never);
  return { key: f.properties.key, d: path(f as never) ?? '', cx, cy, box: [x0, y0, x1 - x0, y1 - y0] };
});
export const countryPath = districtShapes.map((s) => s.d).join(' ');

export const districtPoints = districts.map((district) => {
  const shape = districtShapes.find((s) => s.key === district.key);
  const point = shape ? [shape.cx, shape.cy] : projection([district.lon, district.lat]) ?? [256, 285];
  return { ...district, x: point[0], y: point[1] };
});

// Simplified main rivers, for orientation only.
export const RIVERS: Array<{ name: string; main: boolean; pts: Array<[number, number]> }> = [
  { name: 'Jamuna', main: true, pts: [[26.05, 89.85], [25.8, 89.72], [25.56, 89.68], [25.18, 89.7], [24.8, 89.72], [24.45, 89.72], [24.1, 89.75], [23.8, 89.75]] },
  { name: 'Padma', main: true, pts: [[24.6, 88.05], [24.37, 88.6], [24.1, 88.95], [23.95, 89.25], [23.8, 89.75], [23.55, 90.2], [23.25, 90.6]] },
  { name: 'Meghna', main: true, pts: [[24.4, 91.0], [24.05, 90.98], [23.6, 90.7], [23.25, 90.6], [22.9, 90.65], [22.5, 90.75], [22.15, 90.95]] },
  { name: 'Teesta', main: false, pts: [[26.3, 88.9], [25.95, 89.2], [25.7, 89.5], [25.56, 89.64]] },
  { name: 'Surma', main: false, pts: [[25.1, 92.35], [24.9, 91.9], [25.05, 91.4], [24.6, 91.1], [24.4, 91.0]] },
];
export const riverPaths = RIVERS.map((r) => ({
  ...r,
  d: r.pts.map(([lat, lon], i) => {
    const p = projection([lon, lat]) ?? [0, 0];
    return `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }).join(' '),
}));

/* For the 3D hero: relief coordinates centred on the map. */
export function toReliefPoint(lon: number, lat: number): { x: number; z: number } {
  const point = projection([lon, lat]) ?? [256, 285];
  return { x: (point[0] - 256) * 0.017, z: (point[1] - 285) * 0.017 };
}
export function reliefRings(key: string): Array<Array<[number, number]>> {
  const f = districtFeatures.find((item) => item.properties.key === key);
  if (!f) return [];
  return f.geometry.coordinates.map(([ring]) => ring.map(([lon, lat]) => {
    const p = toReliefPoint(lon, lat);
    return [p.x, -p.z] as [number, number];
  }));
}
export { geoBounds, geoCentroid };
