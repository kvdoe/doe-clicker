import React, { createContext, useContext, useReducer, useEffect, useRef, useState, useCallback } from 'react';
import type { GameState, GameAction, ToastMessage, ClickParticle, GoldenEvent, NullSurge } from '../types';
import { gameReducer, INITIAL_STATE, computeClickValue } from './gameReducer';
import { STORY_EVENTS } from '../data/storyEvents';
import { ACHIEVEMENTS } from '../data/achievements';
import { LORE_QUOTES } from '../data/loreQuotes';
import { playMilestone, playGolden, playNullSurge, playAscension, playDoeSpeaks, playBlip } from '../utils/audio';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  toasts: ToastMessage[];
  particles: ClickParticle[];
  goldenEvent: GoldenEvent | null;
  nullSurge: NullSurge | null;
  showAscension: boolean;
  showModal: { title: string; text: string; actNum?: number } | null;
  showChoice: { title: string; text: string; choiceA: { label: string; codexKey: string }; choiceB: { label: string; codexKey: string } } | null;
  showDoeSpeaks: string | null;
  currentQuote: string;
  addToast: (text: string, color?: string) => void;
  addParticle: (x: number, y: number) => void;
  dismissModal: () => void;
  dismissDoeSpeaks: () => void;
  handleChoice: (which: 'offer' | 'pull') => void;
  catchGolden: () => void;
  sealSurge: () => void;
  triggerAscension: () => void;
  dismissAscension: () => void;
  isGlitching: boolean;
}

const GameContext = createContext<GameContextValue>(null!);

const GOLDEN_EFFECTS = ['void-flush', 'resonant-frenzy', 'null-windfall', 'the-stare', 'erasure'] as const;
const GOLDEN_LORE: Record<string, string> = {
  'void-flush': 'GOLDEN EVENT: Void Flush — the Doe shed excess energy. 13x Doe shower begins.',
  'resonant-frenzy': 'GOLDEN EVENT: Resonant Frenzy — all conduits vibrate at impossible frequency.',
  'null-windfall': 'GOLDEN EVENT: Null Windfall — a pocket of accumulated Doe discharged.',
  'the-stare': 'GOLDEN EVENT: The Stare — it looked at you. Your DPS has changed permanently.',
  'erasure': 'GOLDEN EVENT: Erasure — it took something. We don\'t know what.',
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [goldenEvent, setGoldenEvent] = useState<GoldenEvent | null>(null);
  const [nullSurge, setNullSurge] = useState<NullSurge | null>(null);
  const [showAscension, setShowAscension] = useState(false);
  const [showModal, setShowModal] = useState<{ title: string; text: string; actNum?: number } | null>(null);
  const [showChoice, setShowChoice] = useState<GameContextValue['showChoice']>(null);
  const [showDoeSpeaks, setShowDoeSpeaks] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState(LORE_QUOTES[0]);
  const [isGlitching, setIsGlitching] = useState(false);
  const [activeGoldenEffect, setActiveGoldenEffect] = useState<{ type: string; endTime: number; multiplier: number } | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const addToast = useCallback((text: string, color?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, text, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const addParticle = useCallback((x: number, y: number) => {
    const id = Math.random().toString(36).slice(2);
    const value = Math.floor(computeClickValue(stateRef.current));
    setParticles(prev => [...prev.slice(-20), { id, x, y, value }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 900);
  }, []);

  // Lore quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(LORE_QUOTES[Math.floor(Math.random() * LORE_QUOTES.length)]);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Main game tick
  const activeGoldenEffectRef = useRef(activeGoldenEffect);
  activeGoldenEffectRef.current = activeGoldenEffect;

  useEffect(() => {
    let lastTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const delta = Math.min(now - lastTime, 200);
      lastTime = now;
      const eff = activeGoldenEffectRef.current;
      const goldenMultiplier = eff && now < eff.endTime ? eff.multiplier : 1;
      dispatch({ type: 'TICK', delta, goldenMultiplier });
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  // Clear golden effect once it expires
  useEffect(() => {
    if (!activeGoldenEffect) return;
    const remaining = activeGoldenEffect.endTime - Date.now();
    if (remaining <= 0) { setActiveGoldenEffect(null); return; }
    const t = setTimeout(() => setActiveGoldenEffect(null), remaining);
    return () => clearTimeout(t);
  }, [activeGoldenEffect]);

  // Story event checking
  const processedEventsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const total = state.totalDoeEver;
    for (const ev of STORY_EVENTS) {
      if (processedEventsRef.current.has(ev.id)) continue;
      if (state.seenEvents.has(ev.id)) { processedEventsRef.current.add(ev.id); continue; }
      if (total < ev.threshold) continue;

      processedEventsRef.current.add(ev.id);
      dispatch({ type: 'MARK_EVENT_SEEN', eventId: ev.id });

      if (ev.type === 'signal') {
        dispatch({ type: 'ADD_SIGNAL', entry: { text: ev.text, color: ev.color || 'green' } });
      } else if (ev.type === 'modal') {
        playMilestone();
        const actMatch = ev.id.match(/act(\d)-complete/);
        setShowModal({ title: ev.title || '', text: ev.text, actNum: actMatch ? parseInt(actMatch[1]) : undefined });
      } else if (ev.type === 'doe-speaks') {
        playDoeSpeaks();
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 500);
        setShowDoeSpeaks(ev.text);
        if (ev.id === 'act4-10b') {
          dispatch({ type: 'DOE_SPEAKS_BONUS' });
          addToast('[ DOE SPEAKS — CONDUIT BONUS GRANTED ]', 'white');
        }
      } else if (ev.type === 'choice') {
        if (ev.choiceA && ev.choiceB) {
          setShowChoice({ title: ev.title || '', text: ev.text, choiceA: ev.choiceA, choiceB: ev.choiceB });
        }
      }

      if (ev.id.includes('-complete')) {
        const actNum = parseInt((ev.id.match(/act(\d)/) || ['', '0'])[1]);
        if (actNum > state.actCompleted) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: `story-act${actNum}` });
        }
      }
    }
  }, [state.totalDoeEver]);

  // Achievement checking
  useEffect(() => {
    for (const ach of ACHIEVEMENTS) {
      if (state.achievements.has(ach.id)) continue;
      try {
        if (ach.check(state)) {
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: ach.id });
          addToast(`[ ACHIEVEMENT: ${ach.name} ]`, 'amber');
          playBlip();
        }
      } catch {}
    }
  }, [state.totalDoeEver, state.clickCount, state.goldenCaught, state.ascensionCount, state.conduits, state.surgeFailed]);

  // Ascension check
  useEffect(() => {
    if (state.totalDoeEver >= 1e12 && !showAscension && !state.seenEvents.has('ascension-available')) {
      dispatch({ type: 'MARK_EVENT_SEEN', eventId: 'ascension-available' });
      dispatch({ type: 'ADD_SIGNAL', entry: { text: '[ ASCENSION THRESHOLD REACHED — THE DOE AWAITS ]', color: 'white' } });
    }
  }, [state.totalDoeEver]);

  // Golden Doe events
  useEffect(() => {
    function scheduleGolden() {
      const delay = 300000 + Math.random() * 600000; // 5-15 min
      return setTimeout(() => {
        if (!goldenEvent) {
          const x = 10 + Math.random() * 70;
          const y = 10 + Math.random() * 70;
          setGoldenEvent({ id: Math.random().toString(36).slice(2), x, y, startTime: Date.now() });
          playGolden();
          const timer = setTimeout(() => {
            setGoldenEvent(prev => {
              if (prev) dispatch({ type: 'MISS_GOLDEN' });
              return null;
            });
          }, 8000);
          return () => clearTimeout(timer);
        }
        scheduleGolden();
      }, delay);
    }
    const t = scheduleGolden();
    return () => clearTimeout(t);
  }, [goldenEvent]);

  // Null Surge events (Act IV)
  useEffect(() => {
    if (state.totalDoeEver < 1e9) return;
    function scheduleSurge() {
      const delay = 60000 + Math.random() * 30000;
      return setTimeout(() => {
        if (!nullSurge) {
          setNullSurge({ id: Math.random().toString(36).slice(2), startTime: Date.now() });
          playNullSurge();
          const timer = setTimeout(() => {
            setNullSurge(prev => {
              if (prev) {
                dispatch({ type: 'FAIL_SURGE' });
                dispatch({ type: 'ADD_SIGNAL', entry: { text: 'NULL SURGE: Seal failed. Reality differential widening. -3% Doe.', color: 'crimson' } });
              }
              return null;
            });
          }, 10000);
          return () => clearTimeout(timer);
        }
        scheduleSurge();
      }, delay);
    }
    const t = scheduleSurge();
    return () => clearTimeout(t);
  }, [state.totalDoeEver >= 1e9]);

  // Autosave
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const serializable = {
          ...stateRef.current,
          upgrades: Array.from(stateRef.current.upgrades),
          achievements: Array.from(stateRef.current.achievements),
          unlockedCodex: Array.from(stateRef.current.unlockedCodex),
          seenEvents: Array.from(stateRef.current.seenEvents),
        };
        localStorage.setItem('doe-clicker-save', JSON.stringify(serializable));
        addToast('[ SIGNAL SAVED ]', 'pale');
      } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Load save on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('doe-clicker-save');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const loaded: GameState = {
        ...INITIAL_STATE,
        ...parsed,
        upgrades: new Set(parsed.upgrades || []),
        achievements: new Set(parsed.achievements || []),
        unlockedCodex: new Set(parsed.unlockedCodex || []),
        seenEvents: new Set(parsed.seenEvents || []),
        signalLog: parsed.signalLog || [],
      };
      dispatch({ type: 'LOAD_STATE', state: loaded });
    } catch {}
  }, []);

  const dismissModal = useCallback(() => {
    if (showModal?.actNum) {
      dispatch({ type: 'MARK_EVENT_SEEN', eventId: `act${showModal.actNum}-complete-dismissed` });
    }
    setShowModal(null);
  }, [showModal]);

  const dismissDoeSpeaks = useCallback(() => setShowDoeSpeaks(null), []);

  const handleChoice = useCallback((which: 'offer' | 'pull') => {
    dispatch({ type: 'PLAYER_CHOICE', choice: which });
    const codexKey = which === 'offer' ? 'choice-offer' : 'choice-pull';
    dispatch({ type: 'UNLOCK_CODEX', entryId: codexKey });
    dispatch({ type: 'ADD_SIGNAL', entry: {
      text: which === 'offer' ? 'You offered more. The warmth intensified.' : 'You pulled back. The Doe waited.',
      color: which === 'offer' ? 'amber' : 'green',
    }});
    setShowChoice(null);
    playBlip();
  }, []);

  const catchGolden = useCallback(() => {
    if (!goldenEvent) return;
    const effectIdx = Math.floor(Math.random() * GOLDEN_EFFECTS.length);
    const effect = GOLDEN_EFFECTS[effectIdx];
    const dps = stateRef.current.doePerSecond;
    let bonus = 0;

    if (effect === 'void-flush') {
      setActiveGoldenEffect({ type: 'void-flush', endTime: Date.now() + 7000, multiplier: 13 });
      addToast('VOID FLUSH — 13x for 7s', 'amber');
      bonus = dps * 7 * 13;
    } else if (effect === 'resonant-frenzy') {
      addToast('RESONANT FRENZY — 7x DPS for 77s', 'amber');
      setActiveGoldenEffect({ type: 'resonant-frenzy', endTime: Date.now() + 77000, multiplier: 7 });
    } else if (effect === 'null-windfall') {
      bonus = dps * 60 * 15;
      addToast('NULL WINDFALL — 15 minutes of DPS granted', 'amber');
    } else if (effect === 'the-stare') {
      dispatch({ type: 'APPLY_STARE' });
      addToast('THE STARE — permanent +5% DPS', 'white');
    } else if (effect === 'erasure') {
      addToast('ERASURE — it took something.', 'crimson');
    }

    dispatch({ type: 'CATCH_GOLDEN', effect, bonus });
    dispatch({ type: 'ADD_SIGNAL', entry: { text: GOLDEN_LORE[effect], color: effect === 'erasure' ? 'crimson' : 'amber' } });
    setGoldenEvent(null);
    playGolden();
  }, [goldenEvent, addToast]);

  const sealSurge = useCallback(() => {
    if (!nullSurge) return;
    dispatch({ type: 'SEAL_SURGE' });
    dispatch({ type: 'ADD_SIGNAL', entry: { text: 'NULL SURGE: Sealed. Differential stabilized.', color: 'green' } });
    setNullSurge(null);
    addToast('[ SURGE SEALED ]', 'phosphor');
  }, [nullSurge, addToast]);

  const triggerAscension = useCallback(() => {
    setShowAscension(true);
    playAscension();
  }, []);

  const dismissAscension = useCallback(() => setShowAscension(false), []);

  return (
    <GameContext.Provider value={{
      state, dispatch, toasts, particles, goldenEvent, nullSurge,
      showAscension, showModal, showChoice, showDoeSpeaks, currentQuote,
      addToast, addParticle, dismissModal, dismissDoeSpeaks, handleChoice,
      catchGolden, sealSurge, triggerAscension, dismissAscension, isGlitching,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
