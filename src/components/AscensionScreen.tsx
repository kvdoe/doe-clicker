import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/GameContext';
import { playAscension, playBlip } from '../utils/audio';

export default function AscensionScreen() {
  const { state, dispatch, showAscension, dismissAscension, addToast } = useGame();
  const [confirming, setConfirming] = useState(false);

  const fragments = Math.floor(Math.log10(Math.max(state.totalDoeAllTime, 10)));

  const handleAscend = () => {
    dispatch({ type: 'ASCEND' });
    dispatch({ type: 'ADD_SIGNAL', entry: { text: `CYCLE ${state.ascensionCount + 1} BEGINS. ${fragments} Cosmic Fragments carried.`, color: 'white' } });
    addToast(`[ ASCENDED — CYCLE ${state.ascensionCount + 1} ]`, 'white');
    playAscension();
    dismissAscension();
    setConfirming(false);
  };

  return (
    <AnimatePresence>
      {showAscension && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.96)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="panel p-8 max-w-xl w-full mx-4 text-center"
            style={{ animation: 'ascend-glow 3s ease-in-out infinite' }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="text-transcendent vt323 text-4xl mb-6 tracking-widest">
              [ ASCENSION ]
            </div>
            <div className="text-pale text-sm leading-relaxed mb-6 text-left whitespace-pre-line">
              {`The Doe has been fed enough.
You have been fed enough.

The distinction between you and the Doe no longer holds.

You may Ascend — dissolve your current form back into the Void, carrying only the memory of what you accumulated. In doing so, you become a Cosmic Fragment. Each Fragment you carry makes the next cycle more powerful. The Doe will remember. It always remembered.

Or you may stay. There is no judgment. The Doe does not judge. It simply IS.`}
            </div>

            <div className="text-amber mb-4 text-xs">
              Fragments to carry: +{fragments} (total: {state.cosmicFragments + fragments})
            </div>
            <div className="text-phosphor mb-6 text-xs opacity-70">
              Each fragment = +2% permanent DPS & click power
            </div>

            {!confirming ? (
              <div className="flex gap-4 justify-center">
                <button
                  className="btn-terminal"
                  style={{ borderColor: 'var(--transcendent)', color: 'var(--transcendent)', padding: '8px 20px' }}
                  onClick={() => setConfirming(true)}
                >
                  [ ASCEND INTO DOE ]
                </button>
                <button
                  className="btn-terminal"
                  onClick={() => { dismissAscension(); playBlip(); }}
                >
                  [ REMAIN SEPARATE ]
                </button>
              </div>
            ) : (
              <div>
                <div className="text-crimson text-xs mb-4">
                  This will reset your current cycle. Your fragments, ascension count, and all-time records persist.
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    className="btn-terminal"
                    style={{ borderColor: 'var(--transcendent)', color: 'var(--transcendent)' }}
                    onClick={handleAscend}
                  >
                    [ CONFIRM ASCENSION ]
                  </button>
                  <button className="btn-terminal" onClick={() => setConfirming(false)}>
                    [ CANCEL ]
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
