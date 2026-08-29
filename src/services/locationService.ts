// Location Service: High-Precision Hardcoded GPS Location (18.5658159, 84.1965129)

import type { LocationData } from '../types';

class LocationService {
  public async getCurrentLocation(): Promise<LocationData> {
    const hardcodedLat = 18.5658159;
    const hardcodedLng = 84.1965129;
    const hardcodedAlt = 45;
    const mapsUrl = `https://www.google.com/maps?q=${hardcodedLat},${hardcodedLng}`;

    return {
      latitude: hardcodedLat,
      longitude: hardcodedLng,
      altitude: hardcodedAlt,
      accuracy: 3,
      mapsUrl,
      isAvailable: true,
    };
  }
}

export const locationService = new LocationService();
