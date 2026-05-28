import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/GameContext';

export default function GoldenDoeEvent() {
  const { goldenEvent, catchGolden } = useGame();
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    if (!goldenEvent) { setTimeLeft(8); return; }
    setTimeLeft(8);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) { clearInterval(interval); return 0; }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [goldenEvent?.id]);

  return (
    <AnimatePresence>
      {goldenEvent && (
        <motion.div
          key={goldenEvent.id}
          className="fixed z-40 cursor-pointer"
          style={{
            left: `${goldenEvent.x}%`,
            top: `${goldenEvent.y}%`,
            '--gd-x': `${(Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 200)}px`,
            '--gd-y': `${-100 - Math.random() * 150}px`,
            '--gd-rot': `${90 + Math.random() * 180}deg`,
          } as React.CSSProperties}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={catchGolden}
          title="CLICK THE ANOMALY"
        >
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              {/* Shimmering golden void shape */}
              <ellipse cx="30" cy="30" rx="25" ry="25"
                fill="none" stroke="rgba(255,179,0,0.6)" strokeWidth="1"
                style={{ animation: 'pulse-aura 1.5s ease-in-out infinite' }} />
              <ellipse cx="30" cy="30" rx="18" ry="18"
                fill="rgba(255,179,0,0.08)" stroke="rgba(255,179,0,0.4)" strokeWidth="1" />
              <ellipse cx="30" cy="30" rx="8" ry="8"
                fill="rgba(255,179,0,0.15)" />
              <text x="30" y="34" textAnchor="middle" fontSize="12"
                fill="rgba(255,179,0,0.9)" fontFamily="Share Tech Mono">⍟</text>
            </svg>
            {/* Timer ring */}
            <svg
              width="60" height="60" viewBox="0 0 60 60"
              style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="30" cy="30" r="28"
                fill="none"
                stroke="rgba(255,179,0,0.7)"
                strokeWidth="2"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - timeLeft / 8)}`}
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
