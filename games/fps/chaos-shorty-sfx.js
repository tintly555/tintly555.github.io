// Chaos Shorty (混沌序曲短炮) — shotgun skin SFX
// bindAudio(ctx, dest) → game SFX bus

const ChaosShortySFX = (() => {
  let audioCtx;
  let limiter;
  let boundDest = null;

  const EPS = 0.0001;

  function bindAudio(ctx, destNode) {
    audioCtx = ctx;
    boundDest = destNode || null;
  }

  function outputDest() {
    if (boundDest) return boundDest;
    if (!limiter && audioCtx) {
      limiter = audioCtx.createDynamicsCompressor();
      limiter.threshold.value = -9;
      limiter.knee.value = 8;
      limiter.ratio.value = 16;
      limiter.attack.value = 0.001;
      limiter.release.value = 0.13;
      limiter.connect(audioCtx.destination);
    }
    return limiter;
  }

  function ctx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function noiseBuffer(duration) {
    const c = ctx();
    const length = Math.floor(c.sampleRate * duration);
    const buffer = c.createBuffer(1, length, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function distortion(amount = 5) {
    const c = ctx();
    const shaper = c.createWaveShaper();
    const samples = 2048;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * 2 - 1;
      curve[i] = Math.tanh(x * amount);
    }
    shaper.curve = curve;
    shaper.oversample = "4x";
    return shaper;
  }

  function master(now, volume = 1, duration = 0.5, drive = 4) {
    const c = ctx();
    const g = c.createGain();
    const clip = distortion(drive);
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(EPS, now + duration);
    g.connect(clip);
    clip.connect(outputDest());
    return g;
  }

  function delayBus(dest, delayTime = 0.075, feedback = 0.23, wet = 0.18) {
    const c = ctx();
    const input = c.createGain();
    const delay = c.createDelay();
    const fb = c.createGain();
    const wetGain = c.createGain();
    delay.delayTime.value = delayTime;
    fb.gain.value = feedback;
    wetGain.gain.value = wet;
    input.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(dest);
    return input;
  }

  function tone(opts) {
    const {
      start,
      duration,
      type = "sine",
      gain = 0.4,
      f0 = 440,
      f1 = null,
      f2 = null,
      dest,
      attack = 0.003,
      filter = null,
      filterFreq = 2000,
      q = 1,
    } = opts;
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, start);
    if (f1 !== null && f2 !== null) {
      o.frequency.exponentialRampToValueAtTime(f1, start + duration * 0.35);
      o.frequency.exponentialRampToValueAtTime(f2, start + duration);
    } else if (f1 !== null) {
      o.frequency.exponentialRampToValueAtTime(f1, start + duration);
    }
    g.gain.setValueAtTime(EPS, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(EPS, start + duration);
    if (filter) {
      const f = c.createBiquadFilter();
      f.type = filter;
      f.frequency.setValueAtTime(filterFreq, start);
      f.Q.setValueAtTime(q, start);
      o.connect(f);
      f.connect(g);
    } else {
      o.connect(g);
    }
    g.connect(dest);
    o.start(start);
    o.stop(start + duration + 0.04);
  }

  function noise(opts) {
    const {
      start,
      duration,
      gain = 0.5,
      dest,
      filter = "bandpass",
      filterFreq = 2000,
      q = 2,
      attack = 0.001,
    } = opts;
    const c = ctx();
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    src.buffer = noiseBuffer(duration);
    f.type = filter;
    f.frequency.setValueAtTime(filterFreq, start);
    f.Q.setValueAtTime(q, start);
    g.gain.setValueAtTime(EPS, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(EPS, start + duration);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(start);
    src.stop(start + duration);
  }

  function chaosRip(dest, now, strength = 0.35) {
    tone({
      start: now,
      duration: 0.16,
      type: "sawtooth",
      gain: strength,
      f0: 180,
      f1: 2200,
      f2: 260,
      dest,
      filter: "lowpass",
      filterFreq: 3600,
      q: 2.3,
    });
    noise({
      start: now + 0.01,
      duration: 0.075,
      gain: strength * 0.7,
      dest,
      filter: "highpass",
      filterFreq: 4200,
      q: 1.4,
    });
  }

  function blackHoleTail(dest, now) {
    tone({
      start: now,
      duration: 0.42,
      type: "triangle",
      gain: 0.18,
      f0: 680,
      f1: 95,
      dest,
      filter: "bandpass",
      filterFreq: 480,
      q: 5.5,
    });
    noise({
      start: now + 0.03,
      duration: 0.28,
      gain: 0.13,
      dest,
      filter: "bandpass",
      filterFreq: 310,
      q: 2.5,
    });
  }

  function shot() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 1.0, 0.58, 5.2);
    const echo = delayBus(out, 0.085, 0.25, 0.2);
    tone({ start: now, duration: 0.14, type: "sine", gain: 1.0, f0: 95, f1: 31, dest: out });
    tone({ start: now + 0.018, duration: 0.11, type: "sine", gain: 0.65, f0: 130, f1: 45, dest: out });
    noise({ start: now, duration: 0.065, gain: 0.95, dest: out, filter: "bandpass", filterFreq: 1500, q: 1.2 });
    noise({ start: now + 0.002, duration: 0.028, gain: 0.55, dest: out, filter: "bandpass", filterFreq: 5200, q: 13 });
    chaosRip(out, now + 0.01, 0.34);
    blackHoleTail(echo, now + 0.055);
    noise({ start: now + 0.035, duration: 0.18, gain: 0.28, dest: echo, filter: "highpass", filterFreq: 2600, q: 1 });
  }

  function hitBody() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.5, 0.22, 2.6);
    tone({
      start: now,
      duration: 0.105,
      type: "triangle",
      gain: 0.34,
      f0: 950,
      f1: 1450,
      f2: 620,
      dest: out,
      filter: "bandpass",
      filterFreq: 1050,
      q: 7,
    });
    noise({ start: now, duration: 0.045, gain: 0.18, dest: out, filter: "highpass", filterFreq: 3300, q: 1.2 });
  }

  function hitHead() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.75, 0.34, 3.4);
    const echo = delayBus(out, 0.06, 0.22, 0.15);
    tone({
      start: now,
      duration: 0.13,
      type: "triangle",
      gain: 0.55,
      f0: 1750,
      f1: 3100,
      f2: 920,
      dest: out,
      filter: "bandpass",
      filterFreq: 2100,
      q: 9,
    });
    chaosRip(echo, now + 0.025, 0.2);
    noise({ start: now, duration: 0.06, gain: 0.28, dest: out, filter: "highpass", filterFreq: 4800, q: 1.5 });
  }

  function kill() {
    const c = ctx();
    const now = c.currentTime + 0.34;
    const out = master(now, 0.9, 0.75, 4.0);
    const echo = delayBus(out, 0.11, 0.28, 0.22);
    tone({ start: now, duration: 0.48, type: "sine", gain: 0.65, f0: 170, f1: 38, dest: out });
    tone({
      start: now + 0.035,
      duration: 0.42,
      type: "sawtooth",
      gain: 0.26,
      f0: 360,
      f1: 2400,
      f2: 190,
      dest: echo,
      filter: "lowpass",
      filterFreq: 3300,
      q: 2.3,
    });
    blackHoleTail(echo, now + 0.08);
    noise({ start: now, duration: 0.1, gain: 0.32, dest: out, filter: "highpass", filterFreq: 4200, q: 1.3 });
  }

  function hit(type = "body") {
    if (type === "head") hitHead();
    else if (type === "kill") kill();
    else hitBody();
  }

  return {
    bindAudio,
    shot,
    hit,
    hitBody,
    hitHead,
    kill,
  };
})();

if (typeof window !== "undefined") {
  window.ChaosShortySFX = ChaosShortySFX;
}
