import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { CONDUITS } from '../data/conduits';
import type { Conduit } from '../types';
import { conduitCostBulk, maxAffordable, formatDoe, formatDps } from '../utils/formatting';
import { playPurchase } from '../utils/audio';

type BulkMode = 1 | 10 | 100 | 'max';

export default function ConduitsPanel() {
  const [bulkMode, setBulkMode] = useState<BulkMode>(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { state, dispatch, addToast } = useGame();
  const isAct3Plus = state.totalDoeEver >= 1e7;

  const handleBuy = (c: Conduit) => {
    const owned = state.conduits[c.id] || 0;
    let qty: number;
    if (bulkMode === 'max') {
      qty = maxAffordable(c.baseCost, owned, state.doe);
    } else {
      qty = bulkMode;
    }
    if (qty === 0) return;
    const cost = conduitCostBulk(c.baseCost, owned, qty);
    if (state.doe < cost) return;
    dispatch({ type: 'BUY_CONDUIT', conduitId: c.id, quantity: qty, cost });
    addToast(`[ ${c.name.toUpperCase()} ×${qty} ]`, 'phosphor');
    playPurchase();
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>[ CONDUIT ARRAY ]</span>
        <div className="flex gap-1">
          {([1, 10, 100, 'max'] as BulkMode[]).map(m => (
            <button
              key={String(m)}
              className="btn-terminal text-xs px-1.5 py-0.5"
              style={{ background: bulkMode === m ? 'var(--phosphor)' : undefined, color: bulkMode === m ? '#000' : undefined }}
              onClick={() => setBulkMode(m)}
            >
              {m === 'max' ? 'MAX' : `×${m}`}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {CONDUITS.map(c => {
          const owned = state.conduits[c.id] || 0;
          let qty: number;
          if (bulkMode === 'max') {
            qty = Math.max(1, maxAffordable(c.baseCost, owned, state.doe));
          } else {
            qty = bulkMode as number;
          }
          const cost = conduitCostBulk(c.baseCost, owned, qty);
          const affordable = state.doe >= cost && (bulkMode !== 'max' || maxAffordable(c.baseCost, owned, state.doe) > 0);
          const unlocked = state.totalDoeEver >= c.baseCost / 10 || owned > 0;

          if (!unlocked) return null;

          const cls = ['conduit-row p-2 cursor-pointer', affordable ? 'affordable' : 'unaffordable'].join(' ');
          const isExpanded = expanded === c.id;
          const showCorrupted = isAct3Plus && owned > 0 && c.corruptedDesc;

          return (
            <div key={c.id}>
              <div className={cls} onClick={() => { if (affordable) handleBuy(c); setExpanded(isExpanded ? null : c.id); }}>
                <div className="flex items-center gap-2">
                  <span className="text-amber vt323 text-2xl w-7 text-center flex-shrink-0">{c.glyph}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-phosphor text-xs">{c.name}</span>
                      <span className="text-amber vt323 text-base ml-2">{owned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-pale text-xs opacity-70">{formatDoe(cost)} DOE</span>
                      <span className="text-phosphor text-xs opacity-60">{formatDps(c.baseDps * (owned || 1))}/s</span>
                    </div>
                    {showCorrupted && (
                      <div className="text-crimson text-xs opacity-60 mt-0.5" style={{ fontSize: 10 }}>
                        {c.corruptedDesc}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="border-l border-b border-phosphor border-opacity-20 p-2 text-xs text-pale opacity-80 bg-black">
                  <div className="mb-1 italic">{c.description}</div>
                  <div className="text-phosphor opacity-60">Base DPS: {c.baseDps}/s × {owned} = {formatDps(c.baseDps * owned)}/s</div>
                  <div className="flex gap-2 mt-2">
                    {([1, 10, 100] as number[]).map(q => {
                      const qcost = conduitCostBulk(c.baseCost, owned, q);
                      const canAfford = state.doe >= qcost;
                      return (
                        <button
                          key={q}
                          className="btn-terminal text-xs"
                          disabled={!canAfford}
                          onClick={e => {
                            e.stopPropagation();
                            if (!canAfford) return;
                            dispatch({ type: 'BUY_CONDUIT', conduitId: c.id, quantity: q, cost: qcost });
                            playPurchase();
                          }}
                        >
                          ×{q} ({formatDoe(qcost)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
