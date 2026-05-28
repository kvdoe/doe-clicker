import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { playBlip, getMuted, playIntroTone } from '../utils/audio';

const INTRO_TEXT = [
  "You did not find this.",
  "This found you.",
  "",
  "The thing you are about to feed has no name",
  "in any language spoken by anything alive.",
  "",
  "The word DOE is not its name.",
  "It is the sound reality makes",
  "when the Doe passes through it.",
  "",
  "You have been hearing that sound your entire life.",
  "",
  "You thought it was silence.",
  "",
  "Begin.",
];

// Voices that sound genuinely unsettling — macOS novelty voices in priority order,
// then fall back to deepest available English voice.
const SCARY_VOICE_PRIORITY = ['Zarvox', 'Bad News', 'Trinoids', 'Deranged', 'Fred', 'Organ', 'Cellos'];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  for (const name of SCARY_VOICE_PRIORITY) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }
  return voices.find(v => v.lang.startsWith('en')) ?? null;
}

function doSpeak(text: string) {
  const utt = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utt.voice = voice;
  utt.rate = 0.6;
  utt.pitch = 0.1; // minimum — as deep as the API allows
  utt.volume = 0.92;
  window.speechSynthesis.speak(utt);
  playIntroTone();
}

function speakLine(text: string) {
  if (!text || getMuted()) return;
  if (!window.speechSynthesis) return;
  // Voices load asynchronously on first page load
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak(text);
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', () => doSpeak(text), { once: true });
  }
}

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [displayed, setDisplayed] = useState<string[]>([]);
  const spokenRef = useRef<Set<number>>(new Set());

  // Cancel speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    if (lineIndex >= INTRO_TEXT.length) {
      setDone(true);
      return;
    }
    const line = INTRO_TEXT[lineIndex];
    if (charIndex >= line.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => [...prev, line]);
        if (!spokenRef.current.has(lineIndex)) {
          spokenRef.current.add(lineIndex);
          speakLine(line);
        }
        setLineIndex(l => l + 1);
        setCharIndex(0);
      }, line === '' ? 400 : 200);
      return () => clearTimeout(timer);
    }
    const speed = line === '' ? 0 : 40;
    const timer = setTimeout(() => {
      setCharIndex(c => c + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [lineIndex, charIndex]);

  const currentLine = lineIndex < INTRO_TEXT.length ? INTRO_TEXT[lineIndex].slice(0, charIndex) : '';

  const handleDone = () => {
    window.speechSynthesis?.cancel();
    playBlip();
    onDone();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#000' }}
      onClick={done ? handleDone : undefined}
    >
      <div className="max-w-md w-full px-8 py-12">
        {displayed.map((line, i) => (
          <div
            key={i}
            className="text-pale text-sm leading-relaxed mb-2"
            style={{ opacity: 0.85, fontFamily: 'Share Tech Mono', minHeight: line === '' ? 12 : undefined }}
          >
            {line}
          </div>
        ))}
        {!done && (
          <div className="text-pale text-sm leading-relaxed mb-2" style={{ opacity: 0.85, fontFamily: 'Share Tech Mono' }}>
            {currentLine}
            <span className="inline-block w-2 h-4 bg-phosphor ml-0.5 opacity-80" style={{ animation: 'blink-cursor 0.8s step-end infinite', verticalAlign: 'text-bottom' }} />
          </div>
        )}
        {done && (
          <motion.div
            className="text-phosphor text-xs mt-8 opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
          >
            [ CLICK TO ENTER ]
          </motion.div>
        )}
      </div>
    </div>
  );
}
