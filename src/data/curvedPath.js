/**
 * Generate a slightly curved arc between two lat/lng points.
 * Curves northward for northern hemisphere routes (great-circle-like).
 * Very subtle curvature — just enough to look hand-drawn, not geographic.
 */
export function generateCurvedPath(from, to, steps = 50, curvature = 0.15, isDeportation = false) {
  const points = [];
  const latDiff = to[0] - from[0];
  const lngDiff = to[1] - from[1];

  // No antimeridian wrapping — draw directly between points.
  // For transpacific routes (Singapore to Seattle), this goes "over the top"
  // through high latitudes, which looks like a polar great-circle route.

  const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

  // Curvature: subtle for short legs, stronger for long transoceanic flights
  const isLongHaul = dist > 100; // transpacific/intercontinental
  const baseCurve = isDeportation ? 2.5 : isLongHaul ? Math.min(dist * 0.06, 12) : Math.min(dist * 0.04, 3);

  const absLatDiff = Math.abs(latDiff);
  const absLngDiff = Math.abs(lngDiff);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = from[0] + latDiff * t;
    const lng = from[1] + lngDiff * t;

    // Sine bulge peaks at midpoint
    const bulge = Math.sin(t * Math.PI) * baseCurve;

    let finalLat = lat;
    let finalLng = lng;

    if (absLngDiff > absLatDiff * 0.5) {
      // Mostly east-west or diagonal: curve northward (great circle style)
      const avgLat = (from[0] + to[0]) / 2;
      const direction = avgLat >= 0 ? 1 : -1;
      finalLat = lat + bulge * direction;
    } else {
      // Mostly north-south: slight perpendicular curve
      const direction = lngDiff >= 0 ? -1 : 1;
      finalLng = lng + bulge * direction * 0.5;
    }

    points.push([finalLat, finalLng]);
  }

  return points;
}

/**
 * Get total length of a path (in lat/lng space, approximate)
 */
export function getPathLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

/**
 * Get point at fractional distance along a path
 */
export function getPointAtFraction(points, fraction) {
  if (fraction <= 0) return points[0];
  if (fraction >= 1) return points[points.length - 1];

  const totalLen = getPathLength(points);
  const targetLen = totalLen * fraction;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segLen >= targetLen) {
      const segFrac = (targetLen - accumulated) / segLen;
      return [
        points[i - 1][0] + dx * segFrac,
        points[i - 1][1] + dy * segFrac,
      ];
    }
    accumulated += segLen;
  }
  return points[points.length - 1];
}

/**
 * Get bearing between two points (for plane rotation)
 */
export function getBearing(from, to) {
  const dLng = (to[1] - from[1]) * Math.PI / 180;
  const lat1 = from[0] * Math.PI / 180;
  const lat2 = to[0] * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
