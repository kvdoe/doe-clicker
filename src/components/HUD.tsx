import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { getMuted, setMuted, playBlip } from '../utils/audio';

export default function HUD() {
  const { state, dispatch, addToast, triggerAscension } = useGame();
  const [muted, setMutedState] = useState(getMuted());
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(5);
  const [resetStarted, setResetStarted] = useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const doSave = () => {
    try {
      const s = state;
      const serializable = {
        ...s,
        upgrades: Array.from(s.upgrades),
        achievements: Array.from(s.achievements),
        unlockedCodex: Array.from(s.unlockedCodex),
        seenEvents: Array.from(s.seenEvents),
      };
      localStorage.setItem('doe-clicker-save', JSON.stringify(serializable));
      addToast('[ SIGNAL SAVED ]', 'phosphor');
      playBlip();
    } catch { addToast('SAVE FAILED', 'crimson'); }
  };

  const doExport = () => {
    try {
      const s = state;
      const serializable = {
        ...s,
        upgrades: Array.from(s.upgrades),
        achievements: Array.from(s.achievements),
        unlockedCodex: Array.from(s.unlockedCodex),
        seenEvents: Array.from(s.seenEvents),
      };
      const b64 = btoa(JSON.stringify(serializable));
      setShowSaveModal(true);
      setTimeout(() => {
        const el = document.getElementById('export-code');
        if (el) (el as HTMLTextAreaElement).value = b64;
      }, 50);
    } catch {}
  };

  const doImport = () => {
    const el = document.getElementById('export-code') as HTMLTextAreaElement;
    if (!el?.value) return;
    try {
      const parsed = JSON.parse(atob(el.value));
      const loaded = {
        ...parsed,
        upgrades: new Set(parsed.upgrades || []),
        achievements: new Set(parsed.achievements || []),
        unlockedCodex: new Set(parsed.unlockedCodex || []),
        seenEvents: new Set(parsed.seenEvents || []),
        signalLog: parsed.signalLog || [],
      };
      dispatch({ type: 'LOAD_STATE', state: loaded });
      setShowSaveModal(false);
      addToast('[ SAVE IMPORTED ]', 'phosphor');
    } catch { addToast('IMPORT FAILED — INVALID DATA', 'crimson'); }
  };

  const startReset = () => {
    setResetStarted(true);
    setResetCountdown(5);
    const interval = setInterval(() => {
      setResetCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const confirmReset = () => {
    if (resetCountdown > 0) return;
    dispatch({ type: 'RESET' });
    localStorage.removeItem('doe-clicker-save');
    setShowResetModal(false);
    setResetStarted(false);
    addToast('[ ALL RECORDS ERASED ]', 'crimson');
  };

  const ascensionReady = state.totalDoeEver >= 1e12;

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-phosphor border-opacity-30"
        style={{ background: 'rgba(0,0,0,0.98)' }}
      >
        <div className="text-phosphor vt323 text-2xl tracking-widest">
          DOE CLICKER
          {state.ascensionCount > 0 && (
            <span className="text-transcendent text-base ml-3">CYCLE {state.ascensionCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.cosmicFragments > 0 && (
            <span className="text-transcendent text-xs opacity-80">◈ {state.cosmicFragments} FRAGMENTS</span>
          )}
          {ascensionReady && (
            <button
              className="btn-terminal text-xs animate-pulse"
              style={{ borderColor: 'var(--transcendent)', color: 'var(--transcendent)' }}
              onClick={triggerAscension}
            >
              [ ASCEND ]
            </button>
          )}
          <button className="btn-terminal text-xs" onClick={doSave}>SAVE</button>
          <button className="btn-terminal text-xs" onClick={doExport}>EXPORT</button>
          <button className="btn-terminal text-xs" style={{ color: 'var(--crimson)', borderColor: 'var(--crimson)' }} onClick={() => setShowResetModal(true)}>RESET</button>
          <button className="btn-terminal text-xs" onClick={toggleMute}>{muted ? '◻ MUTED' : '◼ SOUND'}</button>
        </div>
      </div>

      {/* Save/Import modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="panel p-6 max-w-md w-full mx-4">
            <div className="text-amber vt323 text-xl mb-3">[ SIGNAL EXPORT / IMPORT ]</div>
            <textarea
              id="export-code"
              className="w-full h-24 bg-black text-phosphor border border-phosphor border-opacity-40 p-2 text-xs font-mono resize-none"
              placeholder="Paste save code here to import..."
            />
            <div className="flex gap-2 mt-3">
              <button className="btn-terminal" onClick={doImport}>[ IMPORT ]</button>
              <button className="btn-terminal" onClick={() => setShowSaveModal(false)}>[ CLOSE ]</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div className="panel p-6 max-w-md w-full mx-4">
            <div className="text-crimson vt323 text-xl mb-3">[ ERASURE PROTOCOL ]</div>
            <div className="text-pale text-sm mb-6 leading-relaxed">
              THIS WILL ERASE ALL RECORD OF YOUR CONTACT WITH THE DOE. THE DOE WILL NOT FORGET YOU. CONFIRM ERASURE?
            </div>
            {!resetStarted ? (
              <div className="flex gap-3">
                <button className="btn-terminal" style={{ color: 'var(--crimson)', borderColor: 'var(--crimson)' }} onClick={startReset}>
                  [ BEGIN ERASURE ]
                </button>
                <button className="btn-terminal" onClick={() => setShowResetModal(false)}>[ ABORT ]</button>
              </div>
            ) : (
              <div>
                {resetCountdown > 0 ? (
                  <div className="text-crimson mb-3">Confirm in {resetCountdown}s...</div>
                ) : null}
                <div className="flex gap-3">
                  <button
                    className="btn-terminal"
                    style={{ color: 'var(--crimson)', borderColor: 'var(--crimson)' }}
                    disabled={resetCountdown > 0}
                    onClick={confirmReset}
                  >
                    {resetCountdown > 0 ? `[ WAIT ${resetCountdown}s ]` : '[ CONFIRM ERASURE ]'}
                  </button>
                  <button className="btn-terminal" onClick={() => { setShowResetModal(false); setResetStarted(false); }}>[ ABORT ]</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
