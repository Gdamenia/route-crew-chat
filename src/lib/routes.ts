interface RouteBoundary {
  code: string;
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  headingMin?: number;
  headingMax?: number;
}

const ROUTE_BOUNDARIES: RouteBoundary[] = [
  { code: 'I95N', name: 'I-95 North', minLat: 25.7, maxLat: 47.5, minLng: -80.2, maxLng: -67.0, headingMin: 0, headingMax: 180 },
  { code: 'I95S', name: 'I-95 South', minLat: 25.7, maxLat: 47.5, minLng: -80.2, maxLng: -67.0, headingMin: 180, headingMax: 360 },
  { code: 'I80E', name: 'I-80 East', minLat: 39.8, maxLat: 42.0, minLng: -123.5, maxLng: -74.0, headingMin: 45, headingMax: 225 },
  { code: 'I80W', name: 'I-80 West', minLat: 39.8, maxLat: 42.0, minLng: -123.5, maxLng: -74.0, headingMin: 225, headingMax: 360 },
  { code: 'I40E', name: 'I-40 East', minLat: 34.5, maxLat: 36.5, minLng: -117.0, maxLng: -76.0, headingMin: 45, headingMax: 225 },
  { code: 'I40W', name: 'I-40 West', minLat: 34.5, maxLat: 36.5, minLng: -117.0, maxLng: -76.0, headingMin: 225, headingMax: 360 },
  { code: 'I10E', name: 'I-10 East', minLat: 29.5, maxLat: 34.5, minLng: -118.5, maxLng: -79.5, headingMin: 45, headingMax: 225 },
  { code: 'I10W', name: 'I-10 West', minLat: 29.5, maxLat: 34.5, minLng: -118.5, maxLng: -79.5, headingMin: 225, headingMax: 360 },
];

export function detectRoute(lat: number, lng: number, heading?: number): string | null {
  for (const route of ROUTE_BOUNDARIES) {
    if (lat >= route.minLat && lat <= route.maxLat && lng >= route.minLng && lng <= route.maxLng) {
      if (heading !== undefined && route.headingMin !== undefined && route.headingMax !== undefined) {
        const h = ((heading % 360) + 360) % 360;
        if (route.headingMin < route.headingMax) {
          if (h >= route.headingMin && h <= route.headingMax) return route.name;
        } else {
          if (h >= route.headingMin || h <= route.headingMax) return route.name;
        }
      } else {
        return route.name;
      }
    }
  }
  return null;
}
