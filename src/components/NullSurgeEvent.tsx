import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/GameContext';

export default function NullSurgeEvent() {
  const { nullSurge, sealSurge } = useGame();
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!nullSurge) { setTimeLeft(10); return; }
    setTimeLeft(10);
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [nullSurge?.id]);

  return (
    <AnimatePresence>
      {nullSurge && (
        <motion.div
          key={nullSurge.id}
          className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Black tear across screen */}
          <motion.div
            className="absolute"
            style={{
              left: '10%',
              right: '10%',
              top: '35%',
              height: '30%',
              background: 'linear-gradient(90deg, transparent, rgba(255,34,68,0.15) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.8) 60%, rgba(255,34,68,0.15) 80%, transparent)',
              borderTop: '1px solid rgba(255,34,68,0.5)',
              borderBottom: '1px solid rgba(255,34,68,0.5)',
              boxShadow: '0 0 30px rgba(255,34,68,0.3)',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Seal button — pointer-events on this child */}
          <div className="relative pointer-events-auto z-10 flex flex-col items-center gap-3">
            <div className="text-crimson vt323 text-2xl tracking-widest animate-pulse">
              NULL SURGE DETECTED
            </div>
            <div className="text-pale text-xs">SEAL WITHIN {timeLeft.toFixed(0)}s OR LOSE 3% DOE</div>
            <button
              className="btn-terminal text-crimson"
              style={{ borderColor: 'var(--crimson)', color: 'var(--crimson)', fontSize: 16, padding: '8px 24px' }}
              onClick={sealSurge}
            >
              [ SEAL SURGE ]
            </button>
            {/* Timer bar */}
            <div className="w-48 h-1 bg-black border border-crimson border-opacity-50">
              <div
                className="h-full bg-crimson transition-all"
                style={{ width: `${(timeLeft / 10) * 100}%`, transition: 'width 0.1s linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
