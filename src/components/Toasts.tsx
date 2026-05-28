import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../store/GameContext';

export default function Toasts() {
  const { toasts } = useGame();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-1 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            className="panel px-3 py-1.5 text-xs"
            style={{ color: t.color === 'white' ? 'var(--transcendent)' : t.color === 'amber' ? 'var(--amber)' : t.color === 'crimson' ? 'var(--crimson)' : 'var(--phosphor)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
