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
  // I-95
  { code: 'I95N', name: 'I-95 North', minLat: 25.7, maxLat: 47.5, minLng: -80.2, maxLng: -67.0, headingMin: 0, headingMax: 180 },
  { code: 'I95S', name: 'I-95 South', minLat: 25.7, maxLat: 47.5, minLng: -80.2, maxLng: -67.0, headingMin: 180, headingMax: 360 },
  // I-80
  { code: 'I80E', name: 'I-80 East', minLat: 39.8, maxLat: 42.0, minLng: -123.5, maxLng: -74.0, headingMin: 45, headingMax: 225 },
  { code: 'I80W', name: 'I-80 West', minLat: 39.8, maxLat: 42.0, minLng: -123.5, maxLng: -74.0, headingMin: 225, headingMax: 360 },
  // I-40
  { code: 'I40E', name: 'I-40 East', minLat: 34.5, maxLat: 36.5, minLng: -117.0, maxLng: -76.0, headingMin: 45, headingMax: 225 },
  { code: 'I40W', name: 'I-40 West', minLat: 34.5, maxLat: 36.5, minLng: -117.0, maxLng: -76.0, headingMin: 225, headingMax: 360 },
  // I-10
  { code: 'I10E', name: 'I-10 East', minLat: 29.5, maxLat: 34.5, minLng: -118.5, maxLng: -79.5, headingMin: 45, headingMax: 225 },
  { code: 'I10W', name: 'I-10 West', minLat: 29.5, maxLat: 34.5, minLng: -118.5, maxLng: -79.5, headingMin: 225, headingMax: 360 },
  // I-5
  { code: 'I5N', name: 'I-5 North', minLat: 32.5, maxLat: 49.0, minLng: -124.5, maxLng: -117.0, headingMin: 315, headingMax: 135 },
  { code: 'I5S', name: 'I-5 South', minLat: 32.5, maxLat: 49.0, minLng: -124.5, maxLng: -117.0, headingMin: 135, headingMax: 315 },
  // I-70
  { code: 'I70E', name: 'I-70 East', minLat: 38.5, maxLat: 40.5, minLng: -109.0, maxLng: -76.5, headingMin: 45, headingMax: 225 },
  { code: 'I70W', name: 'I-70 West', minLat: 38.5, maxLat: 40.5, minLng: -109.0, maxLng: -76.5, headingMin: 225, headingMax: 360 },
  // I-75
  { code: 'I75N', name: 'I-75 North', minLat: 25.8, maxLat: 46.8, minLng: -85.5, maxLng: -80.5, headingMin: 315, headingMax: 135 },
  { code: 'I75S', name: 'I-75 South', minLat: 25.8, maxLat: 46.8, minLng: -85.5, maxLng: -80.5, headingMin: 135, headingMax: 315 },
  // I-90
  { code: 'I90E', name: 'I-90 East', minLat: 41.0, maxLat: 47.5, minLng: -117.5, maxLng: -71.0, headingMin: 45, headingMax: 225 },
  { code: 'I90W', name: 'I-90 West', minLat: 41.0, maxLat: 47.5, minLng: -117.5, maxLng: -71.0, headingMin: 225, headingMax: 360 },
  // I-20
  { code: 'I20E', name: 'I-20 East', minLat: 31.5, maxLat: 34.5, minLng: -100.0, maxLng: -78.0, headingMin: 45, headingMax: 225 },
  { code: 'I20W', name: 'I-20 West', minLat: 31.5, maxLat: 34.5, minLng: -100.0, maxLng: -78.0, headingMin: 225, headingMax: 360 },
  // I-65
  { code: 'I65N', name: 'I-65 North', minLat: 30.3, maxLat: 41.8, minLng: -88.0, maxLng: -84.5, headingMin: 315, headingMax: 135 },
  { code: 'I65S', name: 'I-65 South', minLat: 30.3, maxLat: 41.8, minLng: -88.0, maxLng: -84.5, headingMin: 135, headingMax: 315 },
  // I-81
  { code: 'I81N', name: 'I-81 North', minLat: 36.6, maxLat: 44.5, minLng: -82.5, maxLng: -75.5, headingMin: 315, headingMax: 135 },
  { code: 'I81S', name: 'I-81 South', minLat: 36.6, maxLat: 44.5, minLng: -82.5, maxLng: -75.5, headingMin: 135, headingMax: 315 },
  // PA Turnpike
  { code: 'PATE', name: 'PA Turnpike East', minLat: 39.8, maxLat: 41.2, minLng: -80.5, maxLng: -74.8, headingMin: 45, headingMax: 225 },
  { code: 'PATW', name: 'PA Turnpike West', minLat: 39.8, maxLat: 41.2, minLng: -80.5, maxLng: -74.8, headingMin: 225, headingMax: 360 },
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
