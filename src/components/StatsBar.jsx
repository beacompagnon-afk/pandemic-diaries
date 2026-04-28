import { STATS } from '../data/journey';

export default function StatsBar({ dayCount }) {
  return (
    <div className="stats-bar">
      <div className="stats-inner">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-item">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
