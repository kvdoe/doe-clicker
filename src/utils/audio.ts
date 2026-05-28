let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function play(fn: (ctx: AudioContext) => void) {
  if (muted) return;
  try { fn(getCtx()); } catch {}
}

export function setMuted(val: boolean) { muted = val; }
export function getMuted() { return muted; }

export function playClick() {
  play(ctx => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 220;
    o.type = 'sine';
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    o.start(); o.stop(ctx.currentTime + 0.08);
  });
}

export function playPurchase() {
  play(ctx => {
    const notes = [440, 554, 659];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = 'square';
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.start(t); o.stop(t + 0.1);
    });
  });
}

export function playMilestone() {
  play(ctx => {
    const chord = [261.63, 329.63, 392, 523.25];
    chord.forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const delay = ctx.createDelay(0.3);
      o.connect(g); g.connect(delay); delay.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = 'sine';
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      o.start(); o.stop(ctx.currentTime + 1.2);
    });
  });
}

export function playGolden() {
  play(ctx => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(800, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    o.start(); o.stop(ctx.currentTime + 0.45);
  });
}

export function playNullSurge() {
  play(ctx => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.value = 60;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o.start(); o.stop(ctx.currentTime + 1.5);
  });
}

export function playAscension() {
  play(ctx => {
    const chord = [130.81, 164.81, 196, 261.63, 329.63];
    chord.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = 'sine';
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.5 + i * 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      o.start(); o.stop(ctx.currentTime + 4);
    });
  });
}

export function playDoeSpeaks() {
  play(ctx => {
    const bufLen = ctx.sampleRate * 0.4;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    src.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    src.start(); src.stop(ctx.currentTime + 0.4);

    const o = ctx.createOscillator();
    const g2 = ctx.createGain();
    o.connect(g2); g2.connect(ctx.destination);
    o.frequency.value = 110;
    o.type = 'sine';
    g2.gain.setValueAtTime(0.08, ctx.currentTime + 0.35);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o.start(ctx.currentTime + 0.35); o.stop(ctx.currentTime + 1.5);
  });
}

export function playIntroTone() {
  play(ctx => {
    // Sub-bass rumble under each spoken line
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 38;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
    osc.start();
    osc.stop(ctx.currentTime + 4.5);
  });
}

export function playBlip() {
  play(ctx => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    o.type = 'square';
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    o.start(); o.stop(ctx.currentTime + 0.05);
  });
}
