import { useState } from 'react';
import { GameProvider, useGame } from './store/GameContext';
import HUD from './components/HUD';
import DoeClickable from './components/DoeClickable';
import UpgradesPanel from './components/UpgradesPanel';
import ConduitsPanel from './components/ConduitsPanel';
import SignalLog from './components/SignalLog';
import Codex from './components/Codex';
import StatsPanel from './components/StatsPanel';
import MilestoneModal from './components/MilestoneModal';
import GoldenDoeEvent from './components/GoldenDoeEvent';
import NullSurgeEvent from './components/NullSurgeEvent';
import AscensionScreen from './components/AscensionScreen';
import IntroScreen from './components/IntroScreen';
import Toasts from './components/Toasts';
import { formatDoe, formatDps } from './utils/formatting';

type Tab = 'upgrades' | 'codex' | 'stats';

function GameUI() {
  const { state, currentQuote, isGlitching } = useGame();
  const [tab, setTab] = useState<Tab>('upgrades');

  return (
    <div
      className={`flex flex-col min-h-screen ${isGlitching ? 'glitch-active' : ''} ${state.transcendenceMode ? 'transcendence-mode' : ''}`}
      style={{ background: '#000' }}
    >
      <HUD />

      {/* Main 3-column layout */}
      <div className="flex flex-1 gap-2 p-2" style={{ minHeight: 0, height: 'calc(100vh - 48px)' }}>

        {/* LEFT — The Doe */}
        <div className="flex flex-col gap-2 overflow-hidden" style={{ width: 310, flexShrink: 0 }}>
          <div className="panel flex flex-col items-center p-3 gap-2 flex-1">
            {/* Doe count */}
            <div className="text-center">
              <div className="vt323 text-amber" style={{ fontSize: 40, lineHeight: 1.1 }}>
                {formatDoe(state.doe)}
              </div>
              <div className="text-pale text-xs opacity-50 tracking-widest">DOE</div>
            </div>

            {/* Sub-stats */}
            <div className="flex gap-4 text-xs">
              <div className="text-center">
                <div className="text-phosphor">{formatDps(state.doePerSecond)}/s</div>
                <div className="text-pale opacity-40" style={{ fontSize: 10 }}>DOE PER SECOND</div>
              </div>
              <div className="text-center">
                <div className="text-phosphor">{formatDps(state.doePerClick)}</div>
                <div className="text-pale opacity-40" style={{ fontSize: 10 }}>PER CLICK</div>
              </div>
            </div>

            {/* The Doe SVG */}
            <DoeClickable />

            {/* Lore quote */}
            <div
              className="w-full p-2 text-center"
              style={{ border: '1px solid rgba(0,255,65,0.18)', background: 'rgba(0,255,65,0.02)' }}
            >
              <div className="text-pale text-xs italic leading-relaxed" style={{ fontSize: 10, opacity: 0.7 }}>
                "{currentQuote}"
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE — Tabs */}
        <div className="flex flex-col flex-1 gap-2 overflow-hidden" style={{ minWidth: 0 }}>
          {/* Tab bar */}
          <div className="flex gap-1">
            {(['upgrades', 'codex', 'stats'] as Tab[]).map(t => (
              <button
                key={t}
                className="btn-terminal text-xs px-3 py-1"
                style={tab === t ? { background: 'var(--phosphor)', color: '#000' } : {}}
                onClick={() => setTab(t)}
              >
                {t === 'upgrades' ? '[ UPGRADES ]' : t === 'codex' ? '[ CODEX ]' : '[ RECORDS ]'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {tab === 'upgrades' && <UpgradesPanel />}
            {tab === 'codex' && <Codex />}
            {tab === 'stats' && <StatsPanel />}
          </div>

          <SignalLog />
        </div>

        {/* RIGHT — Conduits */}
        <div className="flex flex-col overflow-hidden" style={{ width: 290, flexShrink: 0 }}>
          <ConduitsPanel />
        </div>
      </div>

      {/* Overlays */}
      <MilestoneModal />
      <GoldenDoeEvent />
      <NullSurgeEvent />
      <AscensionScreen />
      <Toasts />
    </div>
  );
}

export default function App() {
  const [introDone, setIntroDone] = useState(() => {
    return localStorage.getItem('doe-intro-seen') === '1';
  });

  const handleIntroDone = () => {
    localStorage.setItem('doe-intro-seen', '1');
    setIntroDone(true);
  };

  return (
    <GameProvider>
      {!introDone && <IntroScreen onDone={handleIntroDone} />}
      <GameUI />
    </GameProvider>
  );
}
