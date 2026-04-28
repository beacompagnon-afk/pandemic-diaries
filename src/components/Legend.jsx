import { PHASES } from '../data/journey';

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">The Journey</div>
      <div className="legend-phases">
        {PHASES.map(phase => (
          <div key={phase.id} className="legend-item">
            <div
              className="legend-swatch"
              style={{ background: `linear-gradient(135deg, ${phase.color}, ${phase.colorEnd})` }}
            />
            <div className="legend-text">
              <span className="legend-label">{phase.label}</span>
              <span className="legend-dates">{phase.dateRange}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="legend-transport">
        <div className="legend-transport-item">
          <div className="legend-line solid" />
          <span>Flight</span>
        </div>
        <div className="legend-transport-item">
          <div className="legend-line dashed" />
          <span>Ground / Train</span>
        </div>
        <div className="legend-transport-item">
          <div className="legend-line deportation" />
          <span>Deportation</span>
        </div>
      </div>
    </div>
  );
}
