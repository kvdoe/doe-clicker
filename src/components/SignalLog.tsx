import { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';

const COLOR_MAP: Record<string, string> = {
  green: 'var(--phosphor)',
  amber: 'var(--amber)',
  crimson: 'var(--crimson)',
  white: 'var(--transcendent)',
  pale: 'var(--pale-void)',
};

export default function SignalLog() {
  const { state } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.signalLog.length]);

  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `[${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}]`;
  };

  return (
    <div className="panel flex flex-col" style={{ height: 180 }}>
      <div className="panel-header">[ SIGNAL LOG ]</div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {state.signalLog.length === 0 && (
          <div className="text-pale opacity-40 text-center py-4">Awaiting signal...</div>
        )}
        {state.signalLog.map(entry => (
          <div key={entry.id} className="mb-0.5 leading-tight">
            <span className="opacity-40 mr-2" style={{ color: 'var(--phosphor)' }}>{fmt(entry.timestamp)}</span>
            <span style={{ color: COLOR_MAP[entry.color] || 'var(--phosphor)' }}>{entry.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
