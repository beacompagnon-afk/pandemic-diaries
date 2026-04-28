import { useRef, useCallback, useEffect, useState } from 'react';
import { PHASES, LEGS } from '../data/journey';
import { NARRATIVE_LEGS, TOTAL_WEIGHT, formatDate, fractionToDay } from '../data/narrativeTiming';

// Compute phase positions in narrative-fraction space
function getPhasePositions() {
  let cumFrac = 0;
  const legFracs = NARRATIVE_LEGS.map(l => {
    const f = cumFrac;
    cumFrac += (l.flight + l.dwell) / TOTAL_WEIGHT;
    return f;
  });

  return PHASES.map(phase => {
    const minLeg = Math.min(...phase.legs);
    const maxLeg = Math.max(...phase.legs);
    const start = legFracs[minLeg];
    const endLegTotal = (NARRATIVE_LEGS[maxLeg].flight + NARRATIVE_LEGS[maxLeg].dwell) / TOTAL_WEIGHT;
    const end = legFracs[maxLeg] + endLegTotal;
    return { ...phase, startFrac: start, endFrac: end };
  });
}

const PHASE_POSITIONS = getPhasePositions();

export default function Timeline({ progress, onProgressChange, isPlaying, onPlayToggle }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onProgressChange(x);
  }, [onProgressChange]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    handleInteraction(e.clientX);
  }, [handleInteraction]);

  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientX);
  }, [handleInteraction]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      handleInteraction(clientX);
    };
    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleInteraction]);

  return (
    <div className="timeline">
      <button
        className={`play-btn ${isPlaying ? 'playing' : ''}`}
        onClick={onPlayToggle}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <polygon points="6,4 20,12 6,20" />
          </svg>
        )}
      </button>

      <div className="timeline-info">
        <span className="timeline-date">{formatDate(progress)}</span>
        <span className="timeline-day">Day {fractionToDay(progress)}</span>
      </div>

      <div
        className="timeline-track"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="timeline-phases">
          {PHASE_POSITIONS.map(phase => (
            <div
              key={phase.id}
              className="timeline-phase-segment"
              style={{
                left: `${phase.startFrac * 100}%`,
                width: `${(phase.endFrac - phase.startFrac) * 100}%`,
                background: `linear-gradient(to right, ${phase.color}, ${phase.colorEnd})`,
              }}
              title={phase.label}
            />
          ))}
        </div>

        <div
          className="timeline-progress"
          style={{ width: `${progress * 100}%` }}
        />

        <div
          className="timeline-handle"
          style={{ left: `${progress * 100}%` }}
        >
          <div className="timeline-handle-dot" />
        </div>
      </div>

      <div className="timeline-endpoints">
        <span>Mar 5</span>
        <span>Dec 29</span>
      </div>
    </div>
  );
}
