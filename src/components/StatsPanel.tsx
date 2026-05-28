import React from 'react';
import { useGame } from '../store/GameContext';
import { CONDUITS } from '../data/conduits';
import { ACHIEVEMENTS } from '../data/achievements';
import { formatDoe, formatDps, formatTime } from '../utils/formatting';

export default function StatsPanel() {
  const { state } = useGame();

  const totalConduits = Object.values(state.conduits).reduce((a, b) => a + b, 0);

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">[ RECORDS ]</div>
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        <Section title="DOE">
          <Row label="Doe (this cycle)" value={formatDoe(state.doe)} />
          <Row label="Total accumulated" value={formatDoe(state.totalDoeAllTime)} />
          <Row label="DPS current" value={formatDps(state.doePerSecond)} />
          <Row label="Per click" value={formatDps(state.doePerClick)} />
        </Section>
        <Section title="ACTIVITY">
          <Row label="Total clicks" value={state.clickCount.toLocaleString()} />
          <Row label="Golden caught" value={state.goldenCaught.toLocaleString()} />
          <Row label="Golden missed" value={state.goldenMissed.toLocaleString()} />
          <Row label="Surges sealed" value={state.surgeSsealed.toLocaleString()} />
          <Row label="Surges failed" value={state.surgeFailed.toLocaleString()} />
        </Section>
        <Section title="PROGRESS">
          <Row label="Cosmic Fragments" value={state.cosmicFragments.toLocaleString()} />
          <Row label="Ascensions" value={state.ascensionCount.toLocaleString()} />
          <Row label="Total conduits" value={totalConduits.toLocaleString()} />
          <Row label="Upgrades installed" value={state.upgrades.size.toLocaleString()} />
          <Row label="Achievements" value={`${state.achievements.size} / ${ACHIEVEMENTS.length}`} />
        </Section>
        <Section title="TIME">
          <Row label="This cycle" value={formatTime(state.cycleTimePlayed)} />
          <Row label="All time" value={formatTime(state.totalTimePlayed)} />
        </Section>
        <Section title="CONDUITS">
          {CONDUITS.map(c => (
            <Row key={c.id} label={c.name} value={(state.conduits[c.id] || 0).toLocaleString()} />
          ))}
        </Section>
        <Section title="ACHIEVEMENTS">
          {ACHIEVEMENTS.filter(a => state.achievements.has(a.id)).map(a => (
            <div key={a.id} className="text-phosphor mb-1">
              <span className="text-amber mr-1">✓</span>{a.name}
            </div>
          ))}
          {state.achievements.size === 0 && <div className="text-pale opacity-40">None yet.</div>}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-amber text-xs mb-1 opacity-70 tracking-widest">{title}</div>
      <div className="border-t border-phosphor border-opacity-20 pt-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between mb-0.5">
      <span className="text-pale opacity-70">{label}</span>
      <span className="text-phosphor">{value}</span>
    </div>
  );
}
