import type { UpgradeDef } from '../types';

export const UPGRADES: UpgradeDef[] = [
  // === CLICK POWER ===
  { id: 'residue-touch', name: 'Residue Touch', description: 'You left a mark. It noticed.', cost: 100, type: 'click', multiplier: 2 },
  { id: 'null-pressure', name: 'Null Pressure', description: 'The void presses back.', cost: 500, type: 'click', multiplier: 2 },
  { id: 'glyph-resonance', name: 'Glyph Resonance', description: 'Your touch resonates with carved symbols.', cost: 2000, type: 'click', multiplier: 3 },
  { id: 'margin-attunement', name: 'Margin Attunement', description: 'You have learned to listen at the edges.', cost: 20000, type: 'click', multiplier: 3 },
  { id: 'the-warmth', name: 'The Warmth', description: 'The back of your skull again.', cost: 200000, type: 'click', multiplier: 5 },
  { id: 'void-imprint', name: 'Void Imprint', description: 'You leave something behind each time you touch.', cost: 2000000, type: 'click', multiplier: 5 },
  { id: 'fragment-hand', name: 'Fragment Hand', description: 'Your hand has become partially unfixed from time.', cost: 50000000, type: 'click', addClickPercent: 0.005 },
  { id: 'dissolution-touch', name: 'The Dissolution Touch', description: 'The boundary between you and Doe is administrative.', cost: 500000000, type: 'click', addClickPercent: 0.02 },

  // === ALL PRODUCTION ===
  { id: 'static-coherence', name: 'Static Coherence', description: 'All conduits stabilize slightly.', cost: 1000, type: 'all', allMultiplier: 1.1 },
  { id: 'phase-lock', name: 'Phase Lock', description: 'The conduits phase-lock into a shared resonance.', cost: 10000, type: 'all', allMultiplier: 1.25 },
  { id: 'resonant-field', name: 'Resonant Field', description: 'A field that resonates with nothing — and everything.', cost: 500000, type: 'all', allMultiplier: 1.5 },
  { id: 'null-cascade', name: 'Null Cascade', description: 'Each conduit feeds into the next. The cascade amplifies.', cost: 5000000, type: 'all', allMultiplier: 2.0 },
  { id: 'deep-presence', name: 'Deep Presence', description: 'The Doe has become more present. Output increases.', cost: 100000000, type: 'all', allMultiplier: 2.5 },
  { id: 'void-saturation', name: 'Void Saturation', description: 'The void is saturated with Doe. It cannot help but flow.', cost: 2000000000, type: 'all', allMultiplier: 3.0 },
  { id: 'total-immanence', name: 'Total Immanence', description: 'The Doe is everywhere. The conduits merely acknowledge it.', cost: 50000000000, type: 'all', allMultiplier: 6.0 },

  // === RESIDUE ECHO UPGRADES ===
  { id: 're-t1', name: 'Echo Amplifier', description: 'The residue echoes louder.', cost: 200, type: 'building', target: 'residue-echo', multiplier: 2, requires: { conduit: 'residue-echo', count: 10 } },
  { id: 're-t2', name: 'Echo Cascade', description: 'One echo triggers another.', cost: 1500, type: 'building', target: 'residue-echo', multiplier: 3, requires: { conduit: 'residue-echo', count: 25 } },
  { id: 're-t3', name: 'Resonant Residue', description: 'The residue has learned to self-sustain.', cost: 10000, type: 'building', target: 'residue-echo', multiplier: 5, requires: { conduit: 'residue-echo', count: 50 } },

  // === NULL APERTURE UPGRADES ===
  { id: 'na-t1', name: 'Aperture Widening', description: 'A wider nothing allows more Doe.', cost: 1200, type: 'building', target: 'null-aperture', multiplier: 2, requires: { conduit: 'null-aperture', count: 10 } },
  { id: 'na-t2', name: 'Aperture Lattice', description: 'Multiple apertures form a lattice of nothingness.', cost: 9000, type: 'building', target: 'null-aperture', multiplier: 3, requires: { conduit: 'null-aperture', count: 25 } },
  { id: 'na-t3', name: 'Null Manifold', description: 'The nothings connect into a manifold.', cost: 60000, type: 'building', target: 'null-aperture', multiplier: 5, requires: { conduit: 'null-aperture', count: 50 } },

  // === GLYPH ANCHOR UPGRADES ===
  { id: 'ga-t1', name: 'Deeper Carving', description: 'Carved deeper into the substrate of reality.', cost: 6000, type: 'building', target: 'glyph-anchor', multiplier: 2, requires: { conduit: 'glyph-anchor', count: 10 } },
  { id: 'ga-t2', name: 'Glyph Constellation', description: 'The anchors form a pattern that hums.', cost: 45000, type: 'building', target: 'glyph-anchor', multiplier: 3, requires: { conduit: 'glyph-anchor', count: 25 } },
  { id: 'ga-t3', name: 'Living Sigil', description: 'The glyphs have begun to reproduce.', cost: 300000, type: 'building', target: 'glyph-anchor', multiplier: 5, requires: { conduit: 'glyph-anchor', count: 50 } },

  // === MARGIN LISTENER UPGRADES ===
  { id: 'ml-t1', name: 'Sharper Ears', description: 'They hear things further along the margin.', cost: 24000, type: 'building', target: 'margin-listener', multiplier: 2, requires: { conduit: 'margin-listener', count: 10 } },
  { id: 'ml-t2', name: 'Listener Network', description: 'They begin sharing what they hear.', cost: 180000, type: 'building', target: 'margin-listener', multiplier: 3, requires: { conduit: 'margin-listener', count: 25 } },
  { id: 'ml-t3', name: 'The Harmonized', description: 'They no longer just listen. They transmit.', cost: 1200000, type: 'building', target: 'margin-listener', multiplier: 5, requires: { conduit: 'margin-listener', count: 50 } },

  // === UNMADE SHRINE UPGRADES ===
  { id: 'us-t1', name: 'Deeper Consecration', description: 'More of nothing has been offered.', cost: 84000, type: 'building', target: 'unmade-shrine', multiplier: 2, requires: { conduit: 'unmade-shrine', count: 10 } },
  { id: 'us-t2', name: 'Shrine Nexus', description: 'The shrines form a nexus of unpresence.', cost: 630000, type: 'building', target: 'unmade-shrine', multiplier: 3, requires: { conduit: 'unmade-shrine', count: 25 } },
  { id: 'us-t3', name: 'The Unworship', description: 'They worship nothing so purely it becomes something.', cost: 4200000, type: 'building', target: 'unmade-shrine', multiplier: 5, requires: { conduit: 'unmade-shrine', count: 50 } },

  // === VOID HARMONIC UPGRADES ===
  { id: 'vh-t1', name: 'Frequency Attunement', description: 'Tuned closer to the Doe\'s non-frequency.', cost: 360000, type: 'building', target: 'void-harmonic', multiplier: 2, requires: { conduit: 'void-harmonic', count: 10 } },
  { id: 'vh-t2', name: 'Harmonic Overtones', description: 'The hum produces overtones that were not intended.', cost: 2700000, type: 'building', target: 'void-harmonic', multiplier: 3, requires: { conduit: 'void-harmonic', count: 25 } },
  { id: 'vh-t3', name: 'Resonant Singularity', description: 'Every harmonic now sings the same wrong note.', cost: 18000000, type: 'building', target: 'void-harmonic', multiplier: 5, requires: { conduit: 'void-harmonic', count: 50 } },

  // === LORE UPGRADES ===
  { id: 'lore-first-residue', name: 'The First Residue', description: 'A record of the first contact.', cost: 10000, type: 'lore', unlocksCodex: 'origin-report' },
  { id: 'lore-unmade-dialect', name: 'Unmade Dialect', description: 'Fragments of their warnings, partially translated.', cost: 500000, type: 'lore', unlocksCodex: 'unmade-warnings' },
  { id: 'lore-incident-log', name: 'The Incident Log', description: 'Events that were not supposed to be recorded.', cost: 5000000, type: 'lore', unlocksCodex: 'incident-log' },
  { id: 'lore-coordinate', name: 'Coordinate Fragment', description: 'Partial coordinates to something that should not have a location.', cost: 20000000, type: 'lore', unlocksCodex: 'coordinates' },
  { id: 'lore-your-name', name: 'Your Name in the Record', description: 'Someone wrote it down before you were born.', cost: 200000000, type: 'lore', unlocksCodex: 'your-name' },
  { id: 'lore-blank-page', name: 'The Blank Page', description: 'It should say something. It has decided not to.', cost: 5000000000, type: 'lore', unlocksCodex: 'blank-page' },
  { id: 'lore-redacted', name: '[ ▓▓▓▓▓▓▓▓▓ ]', description: 'This upgrade has no description. It was already installed.', cost: 100000000000, type: 'lore', unlocksCodex: 'final-record' },
];

export const UPGRADE_MAP: Record<string, UpgradeDef> = Object.fromEntries(
  UPGRADES.map(u => [u.id, u])
);
