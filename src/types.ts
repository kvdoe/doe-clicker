export interface Conduit {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseDps: number;
  glyph: string;
  corruptedDesc?: string;
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  flavor?: string;
  cost: number;
  type: 'click' | 'all' | 'building' | 'lore';
  target?: string;
  multiplier?: number;
  addClickPercent?: number;
  allMultiplier?: number;
  unlocksCodex?: string;
  requires?: { conduit: string; count: number };
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  secret?: boolean;
  check: (state: GameState) => boolean;
}

export interface StoryEvent {
  id: string;
  threshold: number;
  type: 'signal' | 'modal' | 'doe-speaks' | 'choice';
  color?: 'green' | 'amber' | 'crimson' | 'white' | 'pale';
  title?: string;
  text: string;
  choiceA?: { label: string; codexKey: string };
  choiceB?: { label: string; codexKey: string };
}

export interface CodexEntry {
  id: string;
  title: string;
  text: string;
}

export interface SignalEntry {
  id: string;
  timestamp: number;
  text: string;
  color: 'green' | 'amber' | 'crimson' | 'white' | 'pale';
}

export type GoldenEffect = 'void-flush' | 'resonant-frenzy' | 'null-windfall' | 'the-stare' | 'erasure';

export interface GoldenEvent {
  id: string;
  x: number;
  y: number;
  startTime: number;
}

export interface NullSurge {
  id: string;
  startTime: number;
}

export interface ClickParticle {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  color?: string;
}

export interface GameState {
  doe: number;
  totalDoeEver: number;
  totalDoeAllTime: number;
  doePerClick: number;
  doePerSecond: number;
  conduits: Record<string, number>;
  upgrades: Set<string>;
  achievements: Set<string>;
  unlockedCodex: Set<string>;
  seenEvents: Set<string>;
  signalLog: SignalEntry[];
  clickCount: number;
  goldenCaught: number;
  goldenMissed: number;
  surgeSsealed: number;
  surgeFailed: number;
  cosmicFragments: number;
  ascensionCount: number;
  totalTimePlayed: number;
  cycleTimePlayed: number;
  actCompleted: number;
  transcendenceMode: boolean;
  permanentDpsBonus: number;
  permanentClickBonus: number;
  stareStacks: number;
  playerChoice?: 'offer' | 'pull';
  lastSaved: number;
}

export type GameAction =
  | { type: 'CLICK'; clickValue: number }
  | { type: 'TICK'; delta: number; goldenMultiplier?: number }
  | { type: 'BUY_CONDUIT'; conduitId: string; quantity: number; cost: number }
  | { type: 'BUY_UPGRADE'; upgradeId: string }
  | { type: 'ADD_SIGNAL'; entry: Omit<SignalEntry, 'id' | 'timestamp'> }
  | { type: 'MARK_EVENT_SEEN'; eventId: string }
  | { type: 'UNLOCK_CODEX'; entryId: string }
  | { type: 'CATCH_GOLDEN'; effect: GoldenEffect; bonus: number }
  | { type: 'MISS_GOLDEN' }
  | { type: 'SEAL_SURGE' }
  | { type: 'FAIL_SURGE' }
  | { type: 'UNLOCK_ACHIEVEMENT'; id: string }
  | { type: 'PLAYER_CHOICE'; choice: 'offer' | 'pull' }
  | { type: 'ASCEND' }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'RESET' }
  | { type: 'APPLY_STARE' }
  | { type: 'DOE_SPEAKS_BONUS' };
