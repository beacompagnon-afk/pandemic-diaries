import { fractionToDay } from '../data/narrativeTiming';

export default function DayCounter({ progress }) {
  const day = fractionToDay(progress);
  const digits = String(day).padStart(3, '0').split('');

  return (
    <div className="day-counter">
      <div className="day-counter-label">Day</div>
      <div className="day-counter-digits">
        {digits.map((d, i) => (
          <span key={i} className="day-digit">{d}</span>
        ))}
      </div>
      <div className="day-counter-total">of 299</div>
    </div>
  );
}
