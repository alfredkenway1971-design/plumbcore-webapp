import { NextResponse } from 'next/server';

interface StopInput {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface GeocodedStop extends StopInput {
  lat: number;
  lng: number;
}

interface OptimizedStop {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  stopOrder: number;
  durationFromPrev: number; // seconds
  distanceFromPrev: number; // meters
  cumulativeDuration: number; // seconds
  cumulativeDistance: number; // meters
}

interface RouteResponse {
  success: boolean;
  optimized: boolean;
  totalDuration: number;
  totalDistance: number;
  stops: OptimizedStop[];
  routeGeometry: number[][] | null;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { stops, startPoint, customStart }: { stops: StopInput[]; startPoint?: string; customStart?: string } = await request.json();

    if (!stops || stops.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Need at least 2 stops to optimize' },
        { status: 400 }
      );
    }

    // Geocode all stops via Nominatim
    const geocoded: GeocodedStop[] = [];
    for (const stop of stops) {
      const q = encodeURIComponent(`${stop.address}, ${stop.city}, ${stop.state} ${stop.zip}`);
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'User-Agent': 'PlumbCoreAI/1.0 (route-optimizer)' } }
      );

      if (!geoRes.ok) {
        return NextResponse.json(
          { success: false, error: `Geocoding failed for ${stop.address}` },
          { status: 502 }
        );
      }

      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) {
        return NextResponse.json(
          { success: false, error: `Could not find location: ${stop.address}` },
          { status: 404 }
        );
      }

      geocoded.push({
        ...stop,
        lat: parseFloat(geoData[0].lat),
        lng: parseFloat(geoData[0].lon),
      });
    }

    // Geocode start point
    let startLat: number | null = null;
    let startLng: number | null = null;
    if (startPoint && startPoint !== 'business') {
      let startAddr = '';
      if (startPoint === 'home') {
        startAddr = 'Austin, TX'; // Default home — user can set later
      } else if (startPoint === 'custom' && customStart) {
        startAddr = customStart;
      }
      if (startAddr) {
        const q = encodeURIComponent(startAddr);
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
          { headers: { 'User-Agent': 'PlumbCoreAI/1.0 (route-optimizer)' } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData?.[0]) {
            startLat = parseFloat(geoData[0].lat);
            startLng = parseFloat(geoData[0].lon);
          }
        }
      }
    }

    // Build coordinate string with start point as first
    const coords = startLat && startLng
      ? `${startLng},${startLat};${geocoded.map((s) => `${s.lng},${s.lat}`).join(';')}`
      : geocoded.map((s) => `${s.lng},${s.lat}`).join(';');

    // OSRM Trip API — source=first pins the first coord as start, destination=last pins the last coord as end
    const osrmUrl = `https://router.project-osrm.org/trip/v1/driving/${coords}?source=first&destination=last&steps=true&overview=full&geometries=geojson`;

    const osrmRes = await fetch(osrmUrl);
    if (!osrmRes.ok) {
      return NextResponse.json(
        { success: false, error: 'OSRM optimization failed' },
        { status: 502 }
      );
    }

    const osrmData = await osrmRes.json();

    if (osrmData.code !== 'Ok' || !osrmData.trips || osrmData.trips.length === 0) {
      // Return unoptimized with geocoded coords
      return NextResponse.json({
        success: true,
        optimized: false,
        totalDuration: 0,
        totalDistance: 0,
        stops: geocoded.map((s, i) => ({
          ...s,
          stopOrder: i,
          durationFromPrev: 0,
          distanceFromPrev: 0,
          cumulativeDuration: 0,
          cumulativeDistance: 0,
        })),
        routeGeometry: null,
        error: 'Could not compute optimal route — showing locations',
      });
    }

    const trip = osrmData.trips[0];
    const waypoints = osrmData.waypoints;

    // Build ordered stops from waypoint indices
    const orderedStops: OptimizedStop[] = [];
    let cumDuration = 0;
    let cumDistance = 0;

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const originalIdx = wp.waypoint_index;
      const stop = geocoded[originalIdx];

      let durationFromPrev = 0;
      let distanceFromPrev = 0;

      if (i > 0) {
        const leg = trip.legs[i - 1];
        durationFromPrev = leg.duration;
        distanceFromPrev = leg.distance;
        cumDuration += durationFromPrev;
        cumDistance += distanceFromPrev;
      }

      orderedStops.push({
        ...stop,
        stopOrder: i,
        durationFromPrev,
        distanceFromPrev,
        cumulativeDuration: cumDuration,
        cumulativeDistance: cumDistance,
      });
    }

    return NextResponse.json({
      success: true,
      optimized: true,
      totalDuration: trip.duration,
      totalDistance: trip.distance,
      stops: orderedStops,
      routeGeometry: trip.geometry ? trip.geometry.coordinates : null,
    } satisfies RouteResponse);

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
