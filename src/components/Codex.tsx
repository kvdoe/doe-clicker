import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { CODEX_ENTRIES } from '../data/storyEvents';

export default function Codex() {
  const { state } = useGame();
  const [selected, setSelected] = useState<string | null>(null);

  if (state.totalDoeEver < 1000000) {
    return (
      <div className="panel flex flex-col h-full">
        <div className="panel-header">[ CODEX — LOCKED ]</div>
        <div className="flex-1 flex items-center justify-center text-pale text-xs opacity-40">
          <div className="text-center">
            <div>CODEX LOCKED</div>
            <div className="mt-1 opacity-60">Reach 1,000,000 Doe to unlock.</div>
          </div>
        </div>
      </div>
    );
  }

  const unlockedEntries = Object.entries(CODEX_ENTRIES).filter(([key]) =>
    state.unlockedCodex.has(key)
  );

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">[ THE CODEX ] — {unlockedEntries.length}/{Object.keys(CODEX_ENTRIES).length} ENTRIES</div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-phosphor border-opacity-20 overflow-y-auto">
          {unlockedEntries.length === 0 && (
            <div className="text-pale text-xs opacity-40 p-2">No entries yet.</div>
          )}
          {unlockedEntries.map(([key, entry]) => (
            <div
              key={key}
              className={`p-2 text-xs cursor-pointer border-b border-phosphor border-opacity-10 ${selected === key ? 'bg-phosphor bg-opacity-10' : 'hover:bg-phosphor hover:bg-opacity-5'}`}
              onClick={() => setSelected(key)}
            >
              <div className="text-phosphor truncate">{entry.title}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {selected && CODEX_ENTRIES[selected] ? (
            <div>
              <div className="text-amber mb-2" style={{ fontFamily: 'VT323', fontSize: 20 }}>
                {CODEX_ENTRIES[selected].title}
              </div>
              <div className="text-pale text-xs leading-relaxed whitespace-pre-wrap">
                {CODEX_ENTRIES[selected].text}
              </div>
            </div>
          ) : (
            <div className="text-pale opacity-30 text-xs text-center mt-8">Select an entry.</div>
          )}
        </div>
      </div>
    </div>
  );
}
