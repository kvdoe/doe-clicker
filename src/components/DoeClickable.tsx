import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/GameContext';
import { computeClickValue } from '../store/gameReducer';
import { playClick } from '../utils/audio';

const GLYPHS = ['ᛃ', 'ᚨ', 'ᛇ', 'ᚦ', '⌬', '⍟'];

interface Ripple { id: string; x: number; y: number; }

export default function DoeClickable() {
  const { state, dispatch, addParticle } = useGame();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [scattered, setScattered] = useState(false);
  const clickRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = clickRef.current?.getBoundingClientRect();
    if (rect) {
      addParticle(e.clientX - rect.left, e.clientY - rect.top);
    }
    const clickValue = computeClickValue(state);
    dispatch({ type: 'CLICK', clickValue });
    playClick();

    const rid = Math.random().toString(36).slice(2);
    setRipples(prev => [...prev, { id: rid, x: 130, y: 130 }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rid)), 900);

    setScattered(true);
    setTimeout(() => setScattered(false), 800);
  }, [state, dispatch, addParticle]);

  const orbitDuration = (i: number) => 8 + i * 2.5;

  return (
    <div className="relative flex flex-col items-center">
      <div
        ref={clickRef}
        className="relative cursor-pointer select-none"
        style={{ width: 280, height: 280 }}
        onClick={handleClick}
      >
        <svg width="280" height="280" viewBox="0 0 280 280" style={{ overflow: 'visible' }}>
          {/* Aura */}
          <ellipse
            cx="140" cy="140" rx="118" ry="118"
            fill="none"
            stroke="rgba(0,255,65,0.12)"
            strokeWidth="40"
            style={{ animation: 'pulse-aura 3s ease-in-out infinite' }}
          />
          <ellipse
            cx="140" cy="140" rx="100" ry="100"
            fill="none"
            stroke="rgba(0,255,65,0.07)"
            strokeWidth="20"
            style={{ animation: 'pulse-aura 3s ease-in-out infinite 1.5s' }}
          />

          {/* Main Doe void shape */}
          <path
            d="M140,22 C185,12 235,48 242,92 C250,140 236,188 203,212 C170,238 118,248 80,230 C42,212 14,172 14,132 C14,88 32,44 78,26 C98,16 118,28 140,22 Z"
            fill="#000"
            stroke="rgba(0,255,65,0.35)"
            strokeWidth="1"
          />

          {/* Inner void (darker center) */}
          <ellipse
            cx="140" cy="140" rx="70" ry="70"
            fill="url(#voidGrad)"
          />
          <defs>
            <radialGradient id="voidGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#000" />
              <stop offset="70%" stopColor="#000510" />
              <stop offset="100%" stopColor="#001005" />
            </radialGradient>
          </defs>

          {/* Recursive inner rings */}
          {[50, 35, 22].map((r, i) => (
            <ellipse key={i} cx="140" cy="140" rx={r} ry={r}
              fill="none" stroke={`rgba(0,255,65,${0.08 + i * 0.04})`} strokeWidth="0.5" />
          ))}

          {/* Orbiting glyphs */}
          {GLYPHS.map((g, i) => {
            const angle = (360 / GLYPHS.length) * i;
            const scatterAngle = scattered ? angle + (Math.random() - 0.5) * 60 : angle;
            const orbitR = scattered ? 145 : 118;
            const rad = (scatterAngle * Math.PI) / 180;
            const gx = 140 + Math.cos(rad) * orbitR;
            const gy = 140 + Math.sin(rad) * orbitR;
            return (
              <motion.text
                key={i}
                x={gx}
                y={gy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fill="rgba(0,255,65,0.65)"
                style={{ fontFamily: 'Share Tech Mono' }}
                animate={{
                  x: [
                    140 + Math.cos(rad) * 118,
                    140 + Math.cos(rad + Math.PI * 2) * 118,
                  ],
                  y: [
                    140 + Math.sin(rad) * 118,
                    140 + Math.sin(rad + Math.PI * 2) * 118,
                  ],
                }}
                transition={{ duration: orbitDuration(i), repeat: Infinity, ease: 'linear' }}
              >
                {g}
              </motion.text>
            );
          })}

          {/* Click ripples */}
          <AnimatePresence>
            {ripples.map(r => (
              <motion.circle
                key={r.id}
                cx={r.x} cy={r.y}
                r="0"
                fill="none"
                stroke="rgba(0,255,65,0.6)"
                strokeWidth="1.5"
                initial={{ r: 0, opacity: 0.8 }}
                animate={{ r: 130, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>

          {/* Faint color shimmer overlay */}
          <ellipse
            cx="140" cy="140" rx="95" ry="95"
            fill="none"
            stroke="rgba(255,179,0,0.04)"
            strokeWidth="2"
            style={{ animation: 'pulse-aura 5s ease-in-out infinite 2s' }}
          />
        </svg>

        {/* Click particles */}
        <ClickParticles />
      </div>
    </div>
  );
}

function ClickParticles() {
  const { particles } = useGame();
  return (
    <AnimatePresence>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none text-phosphor vt323"
          style={{ left: p.x, top: p.y, fontSize: 18, zIndex: 100 }}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -70, scale: 0.7 }}
          exit={{}}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        >
          +{p.value.toLocaleString()}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
