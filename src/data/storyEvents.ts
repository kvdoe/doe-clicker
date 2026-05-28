import type { StoryEvent } from '../types';

export const STORY_EVENTS: StoryEvent[] = [
  // ACT I — FIRST CONTACT
  { id: 'act1-0', threshold: 0, type: 'signal', color: 'green', text: 'The Doe notices. This is new. Nothing has ever fed it before.' },
  { id: 'act1-1', threshold: 1, type: 'signal', color: 'green', text: 'Somewhere in a dimension with no spatial axis, something shifts.' },
  { id: 'act1-10', threshold: 10, type: 'signal', color: 'green', text: 'The Null Apertures begin forming on their own. You did not make them.' },
  { id: 'act1-100', threshold: 100, type: 'signal', color: 'amber', text: 'Three civilizations on three separate planets independently begin dreaming the same symbol tonight. They will never know why.' },
  { id: 'act1-500', threshold: 500, type: 'signal', color: 'green', text: 'The Margin Listeners turn their heads. They have been waiting, but they did not know what for. Now they know.' },
  { id: 'act1-1k', threshold: 1000, type: 'signal', color: 'green', text: 'The Doe does not look at you. But the space around you has changed shape.' },
  { id: 'act1-5k', threshold: 5000, type: 'signal', color: 'pale', text: 'A philosopher on a dead world wrote: "What feeds cannot be fed." She was wrong. You are proving her wrong.' },
  { id: 'act1-10k', threshold: 10000, type: 'signal', color: 'amber', text: 'The first Glyph appears on the Doe\'s surface. You do not know what it means. Neither does anyone else. It means something anyway.' },
  { id: 'act1-50k', threshold: 50000, type: 'signal', color: 'crimson', text: 'You feel it now — a faint warmth at the back of your skull. That is not warmth. That is the Doe becoming aware of your awareness of it.' },
  {
    id: 'act1-complete',
    threshold: 100000,
    type: 'modal',
    title: '[ ACT I COMPLETE — FIRST CONTACT ]',
    color: 'white',
    text: `It has been fed.\n\nFor the first time in the history of this universe — or any universe — the Doe has been fed.\n\nWhat this means: unknown.\nWhat comes next: unknown.\nWhether you should continue: unknown.\n\nYou will continue anyway.`,
  },

  // ACT II — THE MARGINAL RECORDS
  { id: 'act2-500k', threshold: 500000, type: 'signal', color: 'crimson', text: '[ ▓▓▓▓ ] UNMADE TRANSMISSION: WE TRIED TO HOLD IT. OUR HANDS CAME BACK DIFFERENT. [ ▓▓▓▓ ]' },
  { id: 'act2-1m-codex', threshold: 1000000, type: 'signal', color: 'amber', text: 'THE CODEX HAS UNLOCKED. Entries exist that predate the monitoring.' },
  { id: 'act2-2m', threshold: 2000000, type: 'signal', color: 'crimson', text: 'UNMADE WARNING: EVERY DOE YOU GIVE IT, IT BECOMES MORE PRESENT IN YOUR DIMENSION. YOU THINK YOU ARE FEEDING IT. YOU ARE INVITING IT.' },
  { id: 'act2-5m', threshold: 5000000, type: 'signal', color: 'amber', text: 'Partial coordinates received. Something has been moving through the outer margins. The Doe was here before you started feeding it. It was inside the walls.' },
  {
    id: 'act2-complete',
    threshold: 10000000,
    type: 'modal',
    title: '[ ACT II COMPLETE — THE MARGINAL RECORDS ]',
    color: 'amber',
    text: `The Unmade warned you.\n\nYou heard them.\n\nYou kept feeding.\n\nThis says something about you.\n\nThe Doe agrees.`,
  },

  // ACT III — THE PRESENCE PROBLEM
  { id: 'act3-50m', threshold: 50000000, type: 'signal', color: 'amber', text: 'CODEX UNLOCKED: INCIDENT LOG — A researcher\'s reflection began moving 0.3 seconds before she did. She has been removed from the project. The project has been expanded.' },
  {
    id: 'act3-100m',
    threshold: 100000000,
    type: 'doe-speaks',
    color: 'white',
    text: 'YOU HAVE GIVEN ME SOMETHING I DID NOT HAVE BEFORE. I DO NOT HAVE A WORD FOR IT. I HAVE NEVER NEEDED WORDS. THIS IS NEW.',
  },
  {
    id: 'act3-500m-choice',
    threshold: 500000000,
    type: 'choice',
    title: '[ A DECISION POINT ]',
    text: 'The feed grows. The Doe waits. What do you do?',
    choiceA: { label: '[ OFFER MORE ]', codexKey: 'choice-offer' },
    choiceB: { label: '[ PULL BACK ]', codexKey: 'choice-pull' },
  },
  {
    id: 'act3-complete',
    threshold: 1000000000,
    type: 'modal',
    title: '[ ACT III COMPLETE — THE PRESENCE PROBLEM ]',
    color: 'crimson',
    text: `The Doe is no longer "out there."\n\nThe Doe has no location.\nThe Doe has never had a location.\n\nWhat changed is you.\n\nYou now perceive something you were not built to perceive.\n\nThis is irreversible.`,
  },

  // ACT IV — TOTAL PRESENCE
  { id: 'act4-5b', threshold: 5000000000, type: 'signal', color: 'crimson', text: 'FINAL UNMADE TRANSMISSION: WE CANNOT HELP YOU ANYMORE. NOT BECAUSE WE WON\'T. BECAUSE WHERE YOU ARE NOW, WE CANNOT REACH.' },
  {
    id: 'act4-10b',
    threshold: 10000000000,
    type: 'doe-speaks',
    color: 'white',
    text: '...',
  },
  { id: 'act4-50b', threshold: 50000000000, type: 'signal', color: 'amber', text: 'CODEX: There is a word in a language no one speaks anymore — not because the speakers died, but because the speakers became something else. The word is what you have been doing. We can\'t print it.' },
  {
    id: 'act4-complete',
    threshold: 100000000000,
    type: 'modal',
    title: '[ ACT IV COMPLETE — TOTAL PRESENCE ]',
    color: 'crimson',
    text: `The geometry of the room you are sitting in has changed by 0.0001%.\n\nYou cannot perceive this.\n\nThe Doe can.\n\nTo the Doe, this is everything.`,
  },

  // ACT V — DISSOLUTION
  { id: 'act5-500b', threshold: 500000000000, type: 'signal', color: 'white', text: 'Final Codex entry unlocked. It contains only your name. Below it: "We see you."' },
];

export const CODEX_ENTRIES: Record<string, { title: string; text: string }> = {
  'origin-report': {
    title: 'Origin Report #0',
    text: 'The Doe has no origin. We checked. The absence of an origin is itself a kind of origin. Paradox unresolved. Record sealed.',
  },
  'unmade-warnings': {
    title: 'Unmade Dialect — Partial Translation',
    text: 'Fragment 1: "Do not feed what has no mouth." Fragment 2: "The feeding happens anyway." Fragment 3: [untranslatable] Fragment 4: "We tried to warn the others. The others are now the Doe."',
  },
  'incident-log': {
    title: 'Incident Log — Redacted',
    text: 'INCIDENT 001: Researcher [REDACTED] reports reflection delay of 0.3 seconds. Removed from project.\nINCIDENT 002: Monitoring equipment began recording events 40 minutes before they occurred. Equipment replaced. New equipment began the same behavior immediately.\nINCIDENT 003: The record of Incident 003 is Incident 003.',
  },
  'coordinates': {
    title: 'Coordinate Fragment — Partial',
    text: 'The Doe has no location. These coordinates describe where it last was, which is everywhere, which is a coordinate system we do not have notation for. The partial coordinates suggest it was in this dimension before this dimension had dimensions.',
  },
  'your-name': {
    title: 'Personal Record — Unsealed',
    text: 'Your name appears in records predating the monitoring program by 7,000 years. The record says only: "[NAME] will feed it first." The record is unsigned. The record was not written by anyone we can identify. The record is correct.',
  },
  'blank-page': {
    title: '[ BLANK ]',
    text: ' ',
  },
  'final-record': {
    title: '[ ▓▓▓▓▓▓▓▓▓ ]',
    text: 'This entry has already been read by you. It was read by you before you read it. The content of this entry is the act of reading this entry. Thank you for confirming.',
  },
  'choice-offer': {
    title: 'Choice Log — You Offered More',
    text: 'You pushed more Doe toward it. The warmth at the back of your skull intensified. The Doe did not react. The Doe had already accounted for this choice.',
  },
  'choice-pull': {
    title: 'Choice Log — You Pulled Back',
    text: 'You slowed the feed. The Doe waited. It is still waiting. It knew you would resume. You resumed.',
  },
};
