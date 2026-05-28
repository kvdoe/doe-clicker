import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  // DOE MILESTONES
  { id: 'doe-1k', name: 'First Residue', description: 'Accumulate 1,000 Doe.', check: s => s.totalDoeEver >= 1000 },
  { id: 'doe-100k', name: 'Marginal Contact', description: 'Accumulate 100,000 Doe.', check: s => s.totalDoeEver >= 100000 },
  { id: 'doe-10m', name: 'The Presence Grows', description: 'Accumulate 10,000,000 Doe.', check: s => s.totalDoeEver >= 10000000 },
  { id: 'doe-1b', name: 'Total Presence', description: 'Accumulate 1,000,000,000 Doe.', check: s => s.totalDoeEver >= 1000000000 },
  { id: 'doe-100b', name: 'Dissolution Begins', description: 'Accumulate 100,000,000,000 Doe.', check: s => s.totalDoeEver >= 100000000000 },
  { id: 'doe-10t', name: 'The Wound Opens', description: 'Accumulate 10,000,000,000,000 Doe.', check: s => s.totalDoeEver >= 10000000000000 },
  { id: 'doe-1q', name: 'It Remembers', description: 'Accumulate 1,000,000,000,000,000 Doe.', check: s => s.totalDoeEver >= 1e15 },
  { id: 'doe-1qt', name: 'Indistinguishable', description: 'Accumulate 1,000,000,000,000,000,000 Doe.', check: s => s.totalDoeEver >= 1e18 },

  // CLICK MILESTONES
  { id: 'click-100', name: 'First Touch', description: 'Click 100 times.', check: s => s.clickCount >= 100 },
  { id: 'click-1k', name: 'Persistent Contact', description: 'Click 1,000 times.', check: s => s.clickCount >= 1000 },
  { id: 'click-10k', name: 'Devotion', description: 'Click 10,000 times.', check: s => s.clickCount >= 10000 },
  { id: 'click-100k', name: 'The Warmth Is Constant', description: 'Click 100,000 times.', check: s => s.clickCount >= 100000 },
  { id: 'click-1m', name: 'You Are the Conduit', description: 'Click 1,000,000 times.', check: s => s.clickCount >= 1000000 },

  // BUILDING MILESTONES
  { id: 'bld-first', name: 'First Conduit', description: 'Purchase your first conduit.', check: s => Object.values(s.conduits).some(v => v >= 1) },
  { id: 'bld-10any', name: 'Conduit Array', description: 'Own 10 of any single conduit.', check: s => Object.values(s.conduits).some(v => v >= 10) },
  { id: 'bld-50any', name: 'Dense Array', description: 'Own 50 of any single conduit.', check: s => Object.values(s.conduits).some(v => v >= 50) },
  { id: 'bld-100any', name: 'Saturated Array', description: 'Own 100 of any single conduit.', check: s => Object.values(s.conduits).some(v => v >= 100) },
  { id: 'bld-200any', name: 'Total Saturation', description: 'Own 200 of any single conduit.', check: s => Object.values(s.conduits).some(v => v >= 200) },
  { id: 'bld-all14', name: 'Conduit Pantheon', description: 'Own at least one of every conduit type.', check: s => ['residue-echo','null-aperture','glyph-anchor','margin-listener','unmade-shrine','void-harmonic','recursive-eye','pre-memory-vault','collapse-observatory','the-between','unname-engine','antechamber','the-forgetting','origin-wound'].every(id => (s.conduits[id] || 0) >= 1) },
  { id: 'bld-500total', name: 'The Array Is Vast', description: 'Own 500 total conduits.', check: s => Object.values(s.conduits).reduce((a,b) => a+b, 0) >= 500 },

  // STORY
  { id: 'story-act1', name: 'First Contact', description: 'Complete Act I.', check: s => s.actCompleted >= 1 },
  { id: 'story-act2', name: 'Marginal Records', description: 'Complete Act II.', check: s => s.actCompleted >= 2 },
  { id: 'story-act3', name: 'The Presence Problem', description: 'Complete Act III.', check: s => s.actCompleted >= 3 },
  { id: 'story-act4', name: 'Total Presence', description: 'Complete Act IV.', check: s => s.actCompleted >= 4 },
  { id: 'story-act5', name: 'Dissolution', description: 'Reach the Ascension threshold.', check: s => s.totalDoeEver >= 1e12 },

  // GOLDEN DOE
  { id: 'golden-1', name: 'First Glimpse', description: 'Catch 1 golden event.', check: s => s.goldenCaught >= 1 },
  { id: 'golden-10', name: 'Recurring Anomaly', description: 'Catch 10 golden events.', check: s => s.goldenCaught >= 10 },
  { id: 'golden-100', name: 'The Shimmer Is Familiar', description: 'Catch 100 golden events.', check: s => s.goldenCaught >= 100 },
  { id: 'golden-1000', name: 'It Comes When Called', description: 'Catch 1,000 golden events.', check: s => s.goldenCaught >= 1000 },

  // ASCENSION
  { id: 'asc-1', name: 'First Dissolution', description: 'Ascend once.', check: s => s.ascensionCount >= 1 },
  { id: 'asc-5', name: 'Recurring Fragment', description: 'Ascend 5 times.', check: s => s.ascensionCount >= 5 },
  { id: 'asc-10', name: 'The Doe Knows Your Shape', description: 'Ascend 10 times.', check: s => s.ascensionCount >= 10 },

  // SECRET
  { id: 'secret-warned', name: 'YOU WERE WARNED', description: 'Failed 50 Null Surges. The Doe noted this.', secret: true, check: s => s.surgeFailed >= 50 },
  { id: 'secret-codex', name: 'THE BLANK PAGE', description: 'Read every Codex entry.', secret: true, check: s => ['origin-report','unmade-warnings','incident-log','coordinates','your-name','blank-page','final-record'].every(k => s.unlockedCodex.has(k)) },
  { id: 'secret-exact', name: '[ ▓▓▓▓ ]', description: 'Ascend with exactly 1 Trillion Doe.', secret: true, check: () => false },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a])
);
