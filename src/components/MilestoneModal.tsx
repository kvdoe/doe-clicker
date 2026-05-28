import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/GameContext';
import { playBlip } from '../utils/audio';

export default function MilestoneModal() {
  const { showModal, dismissModal, showDoeSpeaks, dismissDoeSpeaks, showChoice, handleChoice } = useGame();

  return (
    <AnimatePresence>
      {showModal && (
        <ModalOverlay>
          <div className="panel p-6 max-w-lg w-full mx-4">
            <div className="text-amber vt323 text-2xl mb-4 tracking-widest">{showModal.title}</div>
            <div className="text-pale text-sm leading-relaxed whitespace-pre-wrap mb-6">{showModal.text}</div>
            <button
              className="btn-terminal"
              onClick={() => { dismissModal(); playBlip(); }}
            >
              [ ACKNOWLEDGE ]
            </button>
          </div>
        </ModalOverlay>
      )}
      {showDoeSpeaks && !showModal && (
        <ModalOverlay glitch>
          <div className="panel p-6 max-w-md w-full mx-4 border-transcendent" style={{ borderColor: 'var(--transcendent)' }}>
            <div className="text-pale text-xs mb-2 tracking-widest opacity-60">[ THE DOE SPEAKS ]</div>
            <div className="text-transcendent text-sm leading-relaxed mb-6 font-mono" style={{ fontFamily: 'VT323', fontSize: 22 }}>
              {showDoeSpeaks}
            </div>
            <button
              className="btn-terminal"
              style={{ borderColor: 'var(--transcendent)', color: 'var(--transcendent)' }}
              onClick={() => { dismissDoeSpeaks(); playBlip(); }}
            >
              [ CLOSE ]
            </button>
          </div>
        </ModalOverlay>
      )}
      {showChoice && !showModal && !showDoeSpeaks && (
        <ModalOverlay>
          <div className="panel p-6 max-w-md w-full mx-4">
            <div className="text-amber vt323 text-xl mb-3 tracking-widest">{showChoice.title}</div>
            <div className="text-pale text-sm mb-6">{showChoice.text}</div>
            <div className="flex gap-4">
              <button className="btn-terminal flex-1" onClick={() => handleChoice('offer')}>
                {showChoice.choiceA.label}
              </button>
              <button className="btn-terminal flex-1" onClick={() => handleChoice('pull')}>
                {showChoice.choiceB.label}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
}

function ModalOverlay({ children, glitch }: { children: React.ReactNode; glitch?: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={glitch ? 'glitch-active' : ''}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
