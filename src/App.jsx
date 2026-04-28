import { useState, useRef, useCallback, useEffect } from 'react';
import JourneyMap from './components/JourneyMap';
import Timeline from './components/Timeline';
import Legend from './components/Legend';
import StatsBar from './components/StatsBar';
import DayCounter from './components/DayCounter';
import './App.css';

const ANIMATION_DURATION = 45000;

export default function App() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const startProgressRef = useRef(0);

  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      startProgressRef.current = progress;
    }

    const elapsed = timestamp - startTimeRef.current;
    const newProgress = startProgressRef.current + (elapsed / ANIMATION_DURATION);

    if (newProgress >= 1) {
      setProgress(1);
      setIsPlaying(false);
      startTimeRef.current = null;
      return;
    }

    setProgress(newProgress);
    animRef.current = requestAnimationFrame(animate);
  }, [progress]);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = null;
      startProgressRef.current = progress;
      animRef.current = requestAnimationFrame(animate);
    } else {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, animate]);

  const handlePlayToggle = useCallback(() => {
    if (progress >= 1) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [progress]);

  const handleProgressChange = useCallback((val) => {
    setIsPlaying(false);
    setProgress(val);
    startTimeRef.current = null;
  }, []);

  const handleStart = useCallback(() => {
    setShowIntro(false);
    setProgress(0);
    setTimeout(() => setIsPlaying(true), 600);
  }, []);

  return (
    <div className="app">
      <div className="paper-texture" />

      {showIntro && (
        <div className="intro-overlay">
          <div className="intro-content">
            <div className="intro-label">A True Story</div>
            <h1 className="intro-title">Pandemic Diaries</h1>
            <p className="intro-subtitle">
              She left Vietnam for a 3-week business trip.<br />
              She couldn't get home for 9 months.
            </p>
            <div className="intro-stats">
              <span>3 continents</span>
              <span className="intro-dot">&middot;</span>
              <span>8 countries</span>
              <span className="intro-dot">&middot;</span>
              <span>1 suitcase</span>
            </div>
            <button className="intro-btn" onClick={handleStart}>
              Trace the journey
            </button>
            <div className="intro-year">2020</div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-left">
          <h1 className="header-title">Pandemic Diaries</h1>
          <span className="header-subtitle">An involuntary journey across 3 continents</span>
        </div>
        <DayCounter progress={progress} />
      </header>

      <JourneyMap
        progress={progress}
        isPlaying={isPlaying}
        activeTooltip={activeTooltip}
        onLocationHover={setActiveTooltip}
        onLocationClick={setActiveTooltip}
      />

      <Legend />

      <Timeline
        progress={progress}
        onProgressChange={handleProgressChange}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
      />

      <StatsBar dayCount={Math.round(progress * 299)} />
    </div>
  );
}
