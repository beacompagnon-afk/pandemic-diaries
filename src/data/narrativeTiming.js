// Shared narrative timing data — single source of truth
// [flightWeight, dwellWeight] per leg

export const NARRATIVE_LEGS = [
  { flight: 4, dwell: 2 },   // 0:  Hoi An -> Da Nang
  { flight: 4, dwell: 2 },   // 1:  Da Nang -> Singapore
  { flight: 7, dwell: 5 },   // 2:  Singapore -> Seattle — long dwell
  { flight: 5, dwell: 2 },   // 3:  Seattle -> Singapore
  { flight: 5, dwell: 1 },   // 4:  Singapore -> Da Nang
  { flight: 7, dwell: 2 },   // 5:  Da Nang -> Singapore (DEPORTED)
  { flight: 4, dwell: 2 },   // 6:  Singapore -> Penang
  { flight: 4, dwell: 1 },   // 7:  Penang -> KL
  { flight: 3, dwell: 1 },   // 8:  KL -> Doha
  { flight: 4, dwell: 2 },   // 9:  Doha -> Vienna
  { flight: 3, dwell: 1 },   // 10: Vienna -> Paris
  { flight: 3, dwell: 1 },   // 11: Paris -> La Rochelle
  { flight: 2, dwell: 1 },   // 12: La Rochelle -> Saint Benoit
  { flight: 2, dwell: 1 },   // 13: Saint Benoit -> Paris
  { flight: 2, dwell: 1 },   // 14: Paris -> Giverny
  { flight: 2, dwell: 1 },   // 15: Giverny -> Paris
  { flight: 3, dwell: 1 },   // 16: Paris -> Rodez
  { flight: 2, dwell: 1 },   // 17: Rodez -> Paris
  { flight: 3, dwell: 1 },   // 18: Paris -> Marsala
  { flight: 4, dwell: 2 },   // 19: Marsala -> Paris
  { flight: 5, dwell: 2 },   // 20: Paris -> Hanoi
  { flight: 5, dwell: 3 },   // 21: Hanoi -> Hoi An
];

export const TOTAL_WEIGHT = NARRATIVE_LEGS.reduce((s, l) => s + l.flight + l.dwell, 0);

export const LEG_DATES = [
  'Mar 5','Mar 5','Mar 6','Mar 12','Mar 16','Mar 16','Mar 17',
  'Apr 27','Apr 28','Apr 28','Jul 15','Jul 20','Jul 27','Aug 3',
  'Aug 20','Aug 21','Sep 7','Oct 22','Oct 30','Dec 8','Dec 12','Dec 29'
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseSimpleDate(str) {
  const parts = str.split(' ');
  const mIdx = MONTHS.indexOf(parts[0]);
  return new Date(2020, mIdx, parseInt(parts[1]));
}

// Map narrative fraction to real date
export function fractionToDate(frac) {
  let cumFrac = 0;
  for (let i = 0; i < NARRATIVE_LEGS.length; i++) {
    const legTotal = (NARRATIVE_LEGS[i].flight + NARRATIVE_LEGS[i].dwell) / TOTAL_WEIGHT;
    if (frac <= cumFrac + legTotal) {
      const legProgress = (frac - cumFrac) / legTotal;
      const thisDate = parseSimpleDate(LEG_DATES[i]);
      const nextDate = i + 1 < LEG_DATES.length ? parseSimpleDate(LEG_DATES[i + 1]) : new Date(2020, 11, 29);
      const ms = thisDate.getTime() + (nextDate.getTime() - thisDate.getTime()) * legProgress;
      return new Date(ms);
    }
    cumFrac += legTotal;
  }
  return new Date(2020, 11, 29);
}

export function fractionToDay(frac) {
  const START = new Date(2020, 2, 5);
  const d = fractionToDate(frac);
  return Math.round((d - START) / (1000 * 60 * 60 * 24));
}

export function formatDate(frac) {
  const d = fractionToDate(frac);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
