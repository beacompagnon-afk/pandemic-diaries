import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATIONS, LEGS, PHASES, KEY_MOMENTS, getLocation, getPhaseForLeg, getLegColor } from '../data/journey';
import { generateCurvedPath, getPointAtFraction, getBearing } from '../data/curvedPath';
import { NARRATIVE_LEGS, TOTAL_WEIGHT } from '../data/narrativeTiming';

const TOTAL_DAYS = 299;

// Date milestones for the day counter
const START_DATE = new Date(2020, 2, 5); // Mar 5 2020

function daysBetween(d1, d2) {
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Parse "Mar 5" style dates
function parseDate(str) {
  if (!str) return null;
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const clean = str.replace('~', '').trim();
  const parts = clean.split(' ');
  if (parts.length >= 2) {
    const m = months[parts[0]];
    const d = parseInt(parts[1]);
    if (m !== undefined && !isNaN(d)) return new Date(2020, m, d);
  }
  return null;
}

// Get the current leg index from narrative progress fraction
function getCurrentLegIndex(frac, legTimings) {
  for (let i = 0; i < legTimings.length; i++) {
    if (frac >= legTimings[i].startFrac && frac <= legTimings[i].endFrac) return i;
  }
  return legTimings.length - 1;
}

export default function JourneyMap({ progress, isPlaying, activeTooltip, onLocationHover, onLocationClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayers = useRef([]);
  const markerLayers = useRef([]);
  const planeMarker = useRef(null);
  const tooltipRef = useRef(null);
  const currentViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // Precompute all paths
  const allPaths = useMemo(() => {
    return LEGS.map((leg) => {
      const from = getLocation(leg.from);
      const to = getLocation(leg.to);
      return generateCurvedPath(
        [from.lat, from.lng],
        [to.lat, to.lng],
        60,
        0.25,
        leg.isDeportation
      );
    });
  }, []);

  // Compute timing fractions from shared narrative weights
  const legTimings = useMemo(() => {
    const timings = [];
    let cumFrac = 0;
    NARRATIVE_LEGS.forEach((leg, i) => {
      const flightFrac = leg.flight / TOTAL_WEIGHT;
      const dwellFrac = leg.dwell / TOTAL_WEIGHT;
      timings.push({
        startFrac: cumFrac,
        flightEndFrac: cumFrac + flightFrac,  // plane arrives here
        endFrac: cumFrac + flightFrac + dwellFrac,  // next leg starts here
      });
      cumFrac += flightFrac + dwellFrac;
    });
    return timings;
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapInstance.current) return;

    // Start zoomed on Vietnam/SE Asia where the journey begins
    const startBounds = L.latLngBounds(
      [-2, 98],   // SW: south of Singapore
      [20, 112]   // NE: north of Da Nang
    );

    const map = L.map(mapRef.current, {
      center: [10, 105],
      zoom: 5,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
    });

    // Start on the Vietnam/Singapore region
    map.fitBounds(startBounds, { padding: [30, 30] });

    // CartoDB Voyager - warm, muted, diary-like aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '',
    }).addTo(map);

    // Subtle labels layer on top
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '',
      opacity: 0.4,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstance.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Draw routes based on progress
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    // Clear previous route layers
    routeLayers.current.forEach(l => map.removeLayer(l));
    routeLayers.current = [];

    // Draw each leg up to current progress
    LEGS.forEach((leg, i) => {
      const timing = legTimings[i];
      if (!timing) return;

      // How much of this leg's FLIGHT should be visible
      // Route draws during flight portion only; dwell keeps it at 1
      let legProgress = 0;
      if (progress >= timing.flightEndFrac) {
        legProgress = 1;
      } else if (progress > timing.startFrac) {
        legProgress = (progress - timing.startFrac) / (timing.flightEndFrac - timing.startFrac);
        legProgress = Math.min(legProgress, 1);
      } else {
        return; // Not reached yet
      }

      const path = allPaths[i];
      const visiblePoints = legProgress >= 1
        ? path
        : path.slice(0, Math.max(2, Math.ceil(path.length * legProgress)));

      const color = getLegColor(i);
      const phase = getPhaseForLeg(i);

      // Shadow/glow line
      const shadow = L.polyline(visiblePoints, {
        color: color,
        weight: leg.isDeportation ? 5 : 4,
        opacity: 0.25,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routeLayers.current.push(shadow);

      // Main route line
      const line = L.polyline(visiblePoints, {
        color: color,
        weight: leg.isDeportation ? 3 : 2.5,
        opacity: leg.isDeportation ? 0.95 : 0.85,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: leg.isDeportation ? '8, 6' : (leg.transport === 'ground' || leg.transport === 'train' ? '4, 8' : null),
      }).addTo(map);
      routeLayers.current.push(line);
    });
  }, [progress, mapReady, allPaths, legTimings]);

  // Draw location markers
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    markerLayers.current.forEach(l => map.removeLayer(l));
    markerLayers.current = [];

    LOCATIONS.forEach(loc => {
      // Check if this location has been reached — look for it as origin OR destination
      const firstAppearance = LEGS.findIndex(l => l.to === loc.id || l.from === loc.id);
      if (firstAppearance === -1 && !loc.isHome) return;

      const timing = loc.isHome ? { startFrac: 0 } : legTimings[firstAppearance];
      if (!timing || progress < timing.startFrac) {
        if (!loc.isHome) return;
      }

      // Size based on stay duration
      const days = loc.stayDays || 0;
      const baseSize = loc.isHome ? 10 : Math.max(6, Math.min(16, 6 + days * 0.15));
      const markerSize = baseSize;

      let markerHtml;
      if (loc.isHome) {
        markerHtml = `<div class="marker marker-home" style="width:${markerSize * 2}px;height:${markerSize * 2}px;">
          <div class="marker-home-dot"></div>
        </div>`;
      } else if (loc.isDeportation) {
        markerHtml = `<div class="marker marker-deportation" style="width:${markerSize * 2}px;height:${markerSize * 2}px;">
          <div class="marker-deportation-inner"></div>
        </div>`;
      } else {
        const stayOpacity = Math.min(1, 0.4 + loc.stayDays / 80);
        markerHtml = `<div class="marker marker-location" style="width:${markerSize * 2}px;height:${markerSize * 2}px;">
          <div class="marker-dot" style="width:${markerSize}px;height:${markerSize}px;opacity:${stayOpacity};"></div>
        </div>`;
      }

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [markerSize * 2, markerSize * 2],
        iconAnchor: [markerSize, markerSize],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);

      marker.on('mouseover', () => onLocationHover?.(loc.id));
      marker.on('mouseout', () => onLocationHover?.(null));
      marker.on('click', () => onLocationClick?.(loc.id));

      markerLayers.current.push(marker);

      // Location name + date label
      const dateStr = loc.dateRange ? `<span class="location-date-label">${loc.dateRange}</span>` : '';
      const nameIcon = L.divIcon({
        html: `<div class="location-name-label">${loc.name}${dateStr}</div>`,
        className: 'location-name-container',
        iconSize: [140, 32],
        iconAnchor: [70, -6],
      });
      const nameMarker = L.marker([loc.lat, loc.lng], { icon: nameIcon, interactive: false, zIndexOffset: 500 }).addTo(map);
      markerLayers.current.push(nameMarker);
    });

    // Key moment labels — only show after the specific leg that triggers them
    KEY_MOMENTS.forEach(moment => {
      if (moment.locationId) {
        const loc = getLocation(moment.locationId);
        if (!loc) return;

        // Use afterLeg to determine when this label should appear
        const triggerLeg = moment.afterLeg !== undefined ? moment.afterLeg : LEGS.findIndex(l => l.to === loc.id);
        const timing = triggerLeg >= 0 ? legTimings[triggerLeg] : null;
        if (timing && progress < timing.startFrac) return;

        const labelIcon = L.divIcon({
          html: `<div class="key-moment-label"><span class="key-moment-icon">${moment.icon}</span> ${moment.label}</div>`,
          className: 'key-moment-container',
          iconSize: [140, 30],
          iconAnchor: [70, moment.offsetY > 0 ? -10 : 40],
        });

        const m = L.marker([loc.lat, loc.lng], { icon: labelIcon, interactive: false }).addTo(map);
        markerLayers.current.push(m);
      }
    });
  }, [progress, mapReady, legTimings, onLocationHover, onLocationClick]);

  // Plane marker
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    if (planeMarker.current) {
      map.removeLayer(planeMarker.current);
      planeMarker.current = null;
    }

    // Find which leg the plane is on
    let currentLegIdx = -1;
    let legFrac = 0;
    let isDwelling = false;

    for (let i = 0; i < LEGS.length; i++) {
      const timing = legTimings[i];
      if (progress >= timing.startFrac && progress <= timing.endFrac) {
        currentLegIdx = i;
        if (progress >= timing.flightEndFrac) {
          // Dwelling at destination — plane is at end of path
          legFrac = 1;
          isDwelling = true;
        } else {
          legFrac = (progress - timing.startFrac) / (timing.flightEndFrac - timing.startFrac);
        }
        break;
      }
    }

    if (currentLegIdx === -1) {
      // At the end, place at home
      if (progress >= 0.99) {
        const home = getLocation('hoian');
        currentLegIdx = LEGS.length - 1;
        const pos = [home.lat, home.lng];
        const planeIcon = L.divIcon({
          html: `<div class="plane-marker arrived">
            <svg viewBox="0 0 32 32" width="28" height="28"><text x="16" y="22" text-anchor="middle" font-size="20">🏠</text></svg>
          </div>`,
          className: 'plane-container',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        planeMarker.current = L.marker(pos, { icon: planeIcon, zIndexOffset: 1000 }).addTo(map);
      }
      return;
    }

    const path = allPaths[currentLegIdx];
    const pos = getPointAtFraction(path, Math.min(legFrac, 1));
    const nextPos = getPointAtFraction(path, Math.min(legFrac + 0.05, 1));
    const bearing = getBearing(pos, nextPos);

    const leg = LEGS[currentLegIdx];
    const isGround = leg.transport === 'ground' || leg.transport === 'train';

    const planeIcon = L.divIcon({
      html: `<div class="plane-marker ${leg.isDeportation ? 'deportation' : ''}" style="transform: rotate(${bearing - 90}deg);">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
          ${isGround
            ? `<circle cx="16" cy="16" r="5" fill="currentColor" stroke="none"/>`
            : `<path d="M16 4 L20 14 L28 16 L20 18 L16 28 L12 18 L4 16 L12 14 Z" fill="currentColor" stroke="none"/>`
          }
        </svg>
      </div>`,
      className: 'plane-container',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    planeMarker.current = L.marker(pos, { icon: planeIcon, zIndexOffset: 1000 }).addTo(map);
  }, [progress, mapReady, allPaths, legTimings]);

  // Auto-zoom: smoothly pan to the midpoint of the current leg at a fixed zoom
  // (avoids the jarring zoom-out/zoom-in that can feel like the camera "rewinds")
  useEffect(() => {
    if (!mapInstance.current || !mapReady || !isPlaying) return;

    const legIdx = getCurrentLegIndex(progress, legTimings);
    if (legIdx === currentViewRef.current) return;

    currentViewRef.current = legIdx;
    const leg = LEGS[legIdx];
    const fromLoc = getLocation(leg.from);
    const toLoc = getLocation(leg.to);

    const latSpan = Math.abs(fromLoc.lat - toLoc.lat);
    const lngSpan = Math.abs(fromLoc.lng - toLoc.lng);
    const span = Math.max(latSpan, lngSpan);

    // Choose a stable zoom based on leg span
    const zoom = span < 3 ? 6 : span < 10 ? 5 : span < 30 ? 4 : span < 80 ? 3 : 2;

    // Pan to the midpoint of the leg (bias slightly toward destination so
    // the plane flies toward center rather than crossing it halfway)
    const midLat = fromLoc.lat * 0.4 + toLoc.lat * 0.6;
    const midLng = fromLoc.lng * 0.4 + toLoc.lng * 0.6;

    mapInstance.current.flyTo([midLat, midLng], zoom, {
      duration: 0.9,
      easeLinearity: 0.4,
    });
  }, [progress, mapReady, isPlaying, legTimings]);

  // Tooltip
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    if (tooltipRef.current) {
      map.removeLayer(tooltipRef.current);
      tooltipRef.current = null;
    }

    if (!activeTooltip) return;

    const loc = getLocation(activeTooltip);
    if (!loc) return;

    const tooltipContent = `
      <div class="location-tooltip">
        <div class="tooltip-name">${loc.name}</div>
        <div class="tooltip-country">${loc.country}</div>
        <div class="tooltip-date">${loc.dateRange}</div>
        <div class="tooltip-duration">${loc.isHome ? 'Home' : loc.stayDays > 0 ? `${loc.stayDays} days` : 'Transit'}</div>
        ${loc.description ? `<div class="tooltip-desc">${loc.description}</div>` : ''}
      </div>
    `;

    tooltipRef.current = L.popup({
      closeButton: false,
      className: 'diary-popup',
      offset: [0, -10],
      autoPan: false,
    })
      .setLatLng([loc.lat, loc.lng])
      .setContent(tooltipContent)
      .openOn(map);
  }, [activeTooltip, mapReady]);

  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="map-container" />
      {!mapReady && (
        <div className="map-loading">
          <span>Unfolding the map...</span>
        </div>
      )}
    </div>
  );
}
