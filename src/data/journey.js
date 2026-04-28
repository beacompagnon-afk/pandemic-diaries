export const LOCATIONS = [
  { id: 'hoian', name: 'Hoi An', country: 'Vietnam', lat: 15.88, lng: 108.33, stayDays: null, isHome: true, dateRange: 'Mar 5 & Dec 29', episode: 'Start & End' },
  { id: 'danang', name: 'Da Nang', country: 'Vietnam', lat: 16.05, lng: 108.21, stayDays: 0.5, dateRange: 'Mar 5 & Mar 16', episode: 'Ep 1 & 2', isDeportation: true },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82, stayDays: 3, dateRange: 'Multiple transits', episode: 'Ep 1, 2' },
  { id: 'seattle', name: 'Seattle', country: 'USA', lat: 47.61, lng: -122.33, stayDays: 6, dateRange: 'Mar 6-12', episode: 'Ep 1' },
  { id: 'penang', name: 'Penang', country: 'Malaysia', lat: 5.42, lng: 100.33, stayDays: 41, dateRange: 'Mar 17 - Apr 27', episode: 'Ep 3' },
  { id: 'kualalumpur', name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.14, lng: 101.69, stayDays: 0.5, dateRange: 'Apr 27-28', episode: 'Ep 4' },
  { id: 'doha', name: 'Doha', country: 'Qatar', lat: 25.29, lng: 51.53, stayDays: 0.5, dateRange: 'Apr 28', episode: 'Ep 4' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', lat: 48.21, lng: 16.37, stayDays: 69, dateRange: 'May 4 - Jul 12', episode: 'Ep 5' },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.86, lng: 2.35, stayDays: 35, dateRange: 'Multiple stays', episode: 'Ep 6, 7' },
  { id: 'larochelle', name: 'La Rochelle', country: 'France', lat: 46.16, lng: -1.15, stayDays: 6, dateRange: 'Jul 20-26', episode: 'Ep 6' },
  { id: 'saintbenoit', name: 'Saint Benoit du Sault', country: 'France', lat: 46.45, lng: 1.39, stayDays: 7, dateRange: 'Jul 27 - Aug 3', episode: 'Ep 6' },
  { id: 'giverny', name: 'Giverny', country: 'France', lat: 49.08, lng: 1.53, stayDays: 2, dateRange: 'Aug 20-21', episode: 'Ep 7' },
  { id: 'rodez', name: 'Rodez', country: 'France', lat: 44.35, lng: 2.57, stayDays: 44, dateRange: 'Sep 7 - Oct 21', episode: 'Ep 8' },
  { id: 'marsala', name: 'Marsala', country: 'Italy', lat: 37.80, lng: 12.44, stayDays: 36, dateRange: 'Oct 31 - Dec 6', episode: 'Ep 9' },
  { id: 'hanoi', name: 'Hanoi', country: 'Vietnam', lat: 21.03, lng: 105.85, stayDays: 16, dateRange: 'Dec 12-28', episode: 'Ep 10' },
];

export const LEGS = [
  { from: 'hoian', to: 'danang', transport: 'ground', date: 'Mar 5', legIndex: 0 },
  { from: 'danang', to: 'singapore', transport: 'flight', date: 'Mar 5', legIndex: 1 },
  { from: 'singapore', to: 'seattle', transport: 'flight', date: 'Mar 6', legIndex: 2, note: '17hrs direct' },
  { from: 'seattle', to: 'singapore', transport: 'flight', date: 'Mar 12', legIndex: 3, note: 'Abort mission' },
  { from: 'singapore', to: 'danang', transport: 'flight', date: 'Mar 16', legIndex: 4, note: '3 people on the plane' },
  { from: 'danang', to: 'singapore', transport: 'flight', date: 'Mar 16', legIndex: 5, isDeportation: true, note: 'DEPORTED - borders closed mid-flight' },
  { from: 'singapore', to: 'penang', transport: 'flight', date: 'Mar 17', legIndex: 6, note: 'Last-minute escape' },
  { from: 'penang', to: 'kualalumpur', transport: 'flight', date: 'Apr 27', legIndex: 7, keyMoment: 'The one flight out' },
  { from: 'kualalumpur', to: 'doha', transport: 'flight', date: 'Apr 28', legIndex: 8 },
  { from: 'doha', to: 'vienna', transport: 'flight', date: 'Apr 28', legIndex: 9 },
  { from: 'vienna', to: 'paris', transport: 'flight', date: 'Jul 15', legIndex: 10 },
  { from: 'paris', to: 'larochelle', transport: 'train', date: 'Jul 20', legIndex: 11 },
  { from: 'larochelle', to: 'saintbenoit', transport: 'ground', date: 'Jul 27', legIndex: 12 },
  { from: 'saintbenoit', to: 'paris', transport: 'ground', date: 'Aug 3', legIndex: 13 },
  { from: 'paris', to: 'giverny', transport: 'ground', date: 'Aug 20', legIndex: 14 },
  { from: 'giverny', to: 'paris', transport: 'ground', date: 'Aug 21', legIndex: 15 },
  { from: 'paris', to: 'rodez', transport: 'train', date: 'Sep 7', legIndex: 16, note: '12hrs, 1970s night train' },
  { from: 'rodez', to: 'paris', transport: 'train', date: 'Oct 22', legIndex: 17 },
  { from: 'paris', to: 'marsala', transport: 'flight', date: 'Oct 30', legIndex: 18 },
  { from: 'marsala', to: 'paris', transport: 'flight', date: 'Dec 8', legIndex: 19, keyMoment: 'The miracle email' },
  { from: 'paris', to: 'hanoi', transport: 'flight', date: 'Dec 12', legIndex: 20 },
  { from: 'hanoi', to: 'hoian', transport: 'ground', date: 'Dec 29', legIndex: 21 },
];

export const PHASES = [
  { id: 'chaos', label: 'The Chaos', dateRange: 'Mar 5 - Apr 27', color: '#D4564E', colorEnd: '#E8876B', legs: [0, 1, 2, 3, 4, 5, 6, 7] },
  { id: 'rebuild', label: 'Escape & Rebuilding', dateRange: 'Apr 27 - Aug', color: '#8B6DAF', colorEnd: '#B794D6', legs: [8, 9, 10, 11, 12, 13, 14, 15] },
  { id: 'descent', label: 'The Descent', dateRange: 'Sep - Dec 6', color: '#C4923A', colorEnd: '#5C4023', legs: [16, 17, 18, 19] },
  { id: 'return', label: 'The Return', dateRange: 'Dec 6 - 29', color: '#4A8C6F', colorEnd: '#6DBF8B', legs: [20, 21] },
];

export const KEY_MOMENTS = [
  { locationId: 'danang', label: 'DEPORTED', icon: '✕', offsetY: -20, afterLeg: 5 },
];

export const STATS = [
  { label: 'Duration', value: '9 months' },
  { label: 'Countries', value: '8' },
  { label: 'Locations', value: '15' },
  { label: 'Flights & trains', value: '22' },
  { label: 'Longest stay', value: 'Vienna, 69 days' },
  { label: 'Shortest stay', value: 'Da Nang, hours' },
  { label: 'Suitcases', value: '1' },
  { label: 'Cats at home', value: '2' },
];

export function getLocation(id) {
  return LOCATIONS.find(l => l.id === id);
}

export function getPhaseForLeg(legIndex) {
  return PHASES.find(p => p.legs.includes(legIndex));
}

export function getLegColor(legIndex) {
  const phase = getPhaseForLeg(legIndex);
  if (!phase) return '#888';
  const idx = phase.legs.indexOf(legIndex);
  const t = phase.legs.length > 1 ? idx / (phase.legs.length - 1) : 0;
  const c1 = hexToRgb(phase.color);
  const c2 = hexToRgb(phase.colorEnd);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}
