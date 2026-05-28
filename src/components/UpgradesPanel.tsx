import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { UPGRADES } from '../data/upgrades';
import type { UpgradeDef } from '../types';
import { playPurchase } from '../utils/audio';

const TYPE_ICONS: Record<string, string> = {
  click: '⊛', all: '◈', building: '⌬', lore: 'ᛇ',
};

export default function UpgradesPanel() {
  const { state, dispatch, addToast } = useGame();

  const visibleUpgrades = UPGRADES.filter(u => {
    if (state.upgrades.has(u.id)) return true;
    if (u.requires && (state.conduits[u.requires.conduit] || 0) < u.requires.count) return false;
    const within10x = state.doe >= u.cost / 10;
    return within10x || state.totalDoeEver >= u.cost / 10;
  });

  const handleBuy = (u: UpgradeDef) => {
    if (state.upgrades.has(u.id) || state.doe < u.cost) return;
    dispatch({ type: 'BUY_UPGRADE', upgradeId: u.id });
    addToast(`[ INSTALLED: ${u.name} ]`, 'phosphor');
    playPurchase();
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">[ ACQUIRED KNOWLEDGE ]</div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {visibleUpgrades.map(u => (
            <UpgradeTile key={u.id} upgrade={u} onBuy={handleBuy} />
          ))}
          {visibleUpgrades.length === 0 && (
            <div className="col-span-2 text-center text-pale text-xs py-8 opacity-50">
              Feed the Doe to reveal upgrades.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UpgradeTile({ upgrade: u, onBuy }: { upgrade: UpgradeDef; onBuy: (u: UpgradeDef) => void }) {
  const { state } = useGame();
  const [showTooltip, setShowTooltip] = useState(false);
  const purchased = state.upgrades.has(u.id);
  const affordable = state.doe >= u.cost;

  const cls = [
    'upgrade-tile p-1.5 text-left',
    purchased ? 'purchased' : '',
    !purchased && !affordable ? 'opacity-50' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      onClick={() => !purchased && onBuy(u)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative', minHeight: 56 }}
    >
      {/* Icon */}
      <div className="flex items-start gap-1.5">
        <div className="text-amber vt323 text-xl leading-none mt-0.5 w-6 text-center flex-shrink-0">
          {TYPE_ICONS[u.type] || '◈'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-phosphor text-xs leading-tight truncate">
            {purchased ? <s className="opacity-60">{u.name}</s> : u.name}
          </div>
          <div className="text-amber text-xs" style={{ fontFamily: 'VT323', fontSize: 14 }}>
            {purchased ? '✓ INSTALLED' : `${(u.cost).toLocaleString()} DOE`}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 panel p-2 text-xs text-pale"
          style={{ bottom: '100%', left: 0, width: 200, marginBottom: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          <div className="text-phosphor mb-1">{u.name}</div>
          <div className="text-pale opacity-80">{u.description}</div>
          {u.flavor && <div className="text-amber opacity-60 mt-1 italic">{u.flavor}</div>}
          <div className="text-amber mt-1">{u.cost.toLocaleString()} DOE</div>
        </div>
      )}
    </div>
  );
}
