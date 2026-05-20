// ======================================================
// PREMIUM GUN SFX V3 — procedural skins (no game audio ripped)
// bindAudio(ctx, dest) → routes into game SFX bus (e.g. audioSfx)
// ======================================================

const GunSFX = (() => {
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
      limiter.threshold.value = -10;
      limiter.knee.value = 10;
      limiter.ratio.value = 14;
      limiter.attack.value = 0.0015;
      limiter.release.value = 0.12;
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

  function makeNoiseBuffer(duration) {
    const c = ctx();
    const length = Math.floor(c.sampleRate * duration);
    const buffer = c.createBuffer(1, length, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function softClip(amount = 4) {
    const c = ctx();
    const shaper = c.createWaveShaper();
    const samples = 1024;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * 2 - 1;
      curve[i] = Math.tanh(x * amount);
    }
    shaper.curve = curve;
    shaper.oversample = "4x";
    return shaper;
  }

  function master(now, volume = 0.8, duration = 0.5, distortion = 0) {
    const c = ctx();
    const g = c.createGain();
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(EPS, now + duration);
    const dest = outputDest();
    if (distortion > 0) {
      const clip = softClip(distortion);
      g.connect(clip);
      clip.connect(dest);
    } else {
      g.connect(dest);
    }
    return g;
  }

  function delayBus(dest, delayTime = 0.08, feedback = 0.18, wet = 0.14) {
    const c = ctx();
    const input = c.createGain();
    const d = c.createDelay();
    const fb = c.createGain();
    const wg = c.createGain();
    d.delayTime.value = delayTime;
    fb.gain.value = feedback;
    wg.gain.value = wet;
    input.connect(d);
    d.connect(fb);
    fb.connect(d);
    d.connect(wg);
    wg.connect(dest);
    return input;
  }

  function tone(opts) {
    const {
      start,
      duration,
      type = "sine",
      gain = 0.3,
      f0 = 440,
      f1 = null,
      f2 = null,
      dest,
      attack = 0.003,
      filter = null,
      filterFreq = 2000,
      q = 1,
      pan = 0,
    } = opts;
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    const p = c.createStereoPanner();
    o.type = type;
    o.frequency.setValueAtTime(f0, start);
    if (f1 !== null && f2 !== null) {
      o.frequency.exponentialRampToValueAtTime(f1, start + duration * 0.38);
      o.frequency.exponentialRampToValueAtTime(f2, start + duration);
    } else if (f1 !== null) {
      o.frequency.exponentialRampToValueAtTime(f1, start + duration);
    }
    g.gain.setValueAtTime(EPS, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(EPS, start + duration);
    p.pan.setValueAtTime(pan, start);
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
    g.connect(p);
    p.connect(dest);
    o.start(start);
    o.stop(start + duration + 0.05);
  }

  function noise(opts) {
    const {
      start,
      duration,
      gain = 0.3,
      dest,
      filter = "bandpass",
      filterFreq = 2000,
      q = 2,
      attack = 0.001,
      pan = 0,
    } = opts;
    const c = ctx();
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(duration);
    const f = c.createBiquadFilter();
    f.type = filter;
    f.frequency.setValueAtTime(filterFreq, start);
    f.Q.setValueAtTime(q, start);
    const g = c.createGain();
    const p = c.createStereoPanner();
    g.gain.setValueAtTime(EPS, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.exponentialRampToValueAtTime(EPS, start + duration);
    p.pan.setValueAtTime(pan, start);
    src.connect(f);
    f.connect(g);
    g.connect(p);
    p.connect(dest);
    src.start(start);
    src.stop(start + duration);
  }

  function hardClick(dest, now, freq = 5600, gain = 0.45) {
    noise({
      start: now,
      duration: 0.026,
      gain,
      dest,
      filter: "bandpass",
      filterFreq: freq,
      q: 15,
    });
  }

  function ionWhip(dest, now, gain = 0.2) {
    tone({
      start: now,
      duration: 0.13,
      type: "sawtooth",
      gain,
      f0: 850,
      f1: 3600,
      f2: 900,
      dest,
      filter: "lowpass",
      filterFreq: 5000,
      q: 2,
    });
    noise({
      start: now + 0.006,
      duration: 0.055,
      gain: gain * 0.9,
      dest,
      filter: "highpass",
      filterFreq: 4800,
      q: 1.5,
    });
  }

  function brightPing(dest, now, base = 1800, gain = 0.4) {
    tone({
      start: now,
      duration: 0.12,
      type: "triangle",
      gain,
      f0: base,
      f1: base * 1.65,
      f2: base * 0.72,
      dest,
      filter: "bandpass",
      filterFreq: base * 1.25,
      q: 9,
    });
  }

  function ancientPhantomShot() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.95, 0.65, 2.5);
    const echo = delayBus(out, 0.105, 0.26, 0.18);
    tone({ start: now, duration: 0.19, type: "sine", gain: 0.9, f0: 110, f1: 36, dest: out });
    noise({ start: now, duration: 0.095, gain: 0.5, dest: out, filter: "bandpass", filterFreq: 720, q: 1.05 });
    tone({
      start: now + 0.008,
      duration: 0.2,
      type: "sawtooth",
      gain: 0.18,
      f0: 260,
      f1: 1350,
      f2: 380,
      dest: echo,
      filter: "lowpass",
      filterFreq: 2400,
      q: 1.2,
      pan: -0.1,
    });
    hardClick(out, now + 0.002, 4700, 0.46);
    tone({
      start: now + 0.065,
      duration: 0.48,
      type: "triangle",
      gain: 0.16,
      f0: 740,
      f1: 190,
      dest: echo,
      filter: "bandpass",
      filterFreq: 760,
      q: 5.5,
      pan: 0.13,
    });
    noise({ start: now + 0.12, duration: 0.32, gain: 0.12, dest: echo, filter: "bandpass", filterFreq: 390, q: 2.4 });
  }

  function zeroShot() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.9, 0.42, 3.2);
    const echo = delayBus(out, 0.052, 0.18, 0.13);
    tone({ start: now, duration: 0.12, type: "sine", gain: 0.78, f0: 132, f1: 47, dest: out });
    hardClick(out, now, 5900, 0.78);
    ionWhip(out, now + 0.006, 0.28);
    tone({
      start: now + 0.032,
      duration: 0.055,
      type: "square",
      gain: 0.07,
      f0: 1880,
      f1: 1180,
      dest: echo,
      filter: "bandpass",
      filterFreq: 1600,
      q: 9,
    });
    noise({ start: now + 0.07, duration: 0.07, gain: 0.13, dest: echo, filter: "highpass", filterFreq: 4500, q: 1.3 });
  }

  function dragonOperatorShot() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 1.08, 0.92, 2.8);
    const echo = delayBus(out, 0.14, 0.27, 0.22);
    tone({ start: now, duration: 0.34, type: "sine", gain: 1.05, f0: 82, f1: 24, dest: out });
    noise({ start: now, duration: 0.07, gain: 0.9, dest: out, filter: "highpass", filterFreq: 1550, q: 0.75 });
    noise({ start: now + 0.035, duration: 0.42, gain: 0.52, dest: echo, filter: "bandpass", filterFreq: 205, q: 3 });
    tone({
      start: now + 0.07,
      duration: 0.62,
      type: "triangle",
      gain: 0.28,
      f0: 480,
      f1: 235,
      dest: echo,
      filter: "bandpass",
      filterFreq: 500,
      q: 7,
    });
    noise({ start: now + 0.105, duration: 0.5, gain: 0.18, dest: echo, filter: "highpass", filterFreq: 2450, q: 1.1 });
    hardClick(echo, now + 0.115, 3900, 0.18);
  }

  function revengeClassicShot() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.78, 0.25, 2.4);
    tone({ start: now, duration: 0.08, type: "sine", gain: 0.58, f0: 190, f1: 74, dest: out });
    noise({ start: now, duration: 0.03, gain: 0.7, dest: out, filter: "bandpass", filterFreq: 3200, q: 4 });
    tone({
      start: now + 0.014,
      duration: 0.13,
      type: "triangle",
      gain: 0.17,
      f0: 1050,
      f1: 1720,
      f2: 620,
      dest: out,
      filter: "bandpass",
      filterFreq: 1400,
      q: 6,
    });
    hardClick(out, now + 0.052, 6900, 0.22);
  }

  function divineSpectreShot() {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.72, 0.24, 2.6);
    const echo = delayBus(out, 0.044, 0.15, 0.12);
    tone({ start: now, duration: 0.06, type: "sine", gain: 0.44, f0: 225, f1: 84, dest: out });
    noise({ start: now, duration: 0.03, gain: 0.56, dest: out, filter: "bandpass", filterFreq: 4100, q: 5.8 });
    tone({
      start: now + 0.006,
      duration: 0.105,
      type: "sawtooth",
      gain: 0.16,
      f0: 1200,
      f1: 3300,
      f2: 1250,
      dest: out,
      filter: "lowpass",
      filterFreq: 4800,
      q: 2,
    });
    tone({
      start: now + 0.032,
      duration: 0.14,
      type: "triangle",
      gain: 0.085,
      f0: 2150,
      f1: 720,
      dest: echo,
      filter: "bandpass",
      filterFreq: 1800,
      q: 5.5,
    });
  }

  function divineSpectreBurst(count = 5, interval = 66) {
    let n = 0;
    const timer = setInterval(() => {
      divineSpectreShot();
      n++;
      if (n >= count) clearInterval(timer);
    }, interval);
  }

  function hitBody(skin = "zero") {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.48, 0.2, 1.8);
    const table = {
      ancientPhantom: 850,
      zero: 1500,
      dragonOperator: 680,
      revengeClassic: 1380,
      divineSpectre: 1780,
    };
    brightPing(out, now, table[skin] || 1400, 0.32);
    noise({ start: now, duration: 0.04, gain: 0.14, dest: out, filter: "highpass", filterFreq: 3400, q: 1 });
  }

  function hitHead(skin = "zero") {
    const c = ctx();
    const now = c.currentTime;
    const out = master(now, 0.75, 0.35, 2.2);
    const echo = delayBus(out, 0.055, 0.19, 0.13);
    const table = {
      ancientPhantom: 1350,
      zero: 2300,
      dragonOperator: 1120,
      revengeClassic: 2050,
      divineSpectre: 2600,
    };
    const base = table[skin] || 2100;
    brightPing(out, now, base, 0.52);
    tone({
      start: now + 0.035,
      duration: 0.15,
      type: "sine",
      gain: 0.19,
      f0: base * 1.75,
      f1: base * 0.88,
      dest: echo,
      filter: "bandpass",
      filterFreq: base * 1.35,
      q: 9,
    });
    noise({ start: now, duration: 0.06, gain: 0.26, dest: out, filter: "highpass", filterFreq: 4800, q: 1.4 });
  }

  function hitKill(skin = "zero") {
    const c = ctx();
    const now = c.currentTime + 0.34;
    const out = master(now, 0.88, 0.72, 2.2);
    const echo = delayBus(out, 0.095, 0.24, 0.2);

    if (skin === "ancientPhantom") {
      tone({ start: now, duration: 0.48, type: "sine", gain: 0.58, f0: 190, f1: 46, dest: out });
      tone({
        start: now + 0.04,
        duration: 0.5,
        type: "triangle",
        gain: 0.26,
        f0: 820,
        f1: 185,
        dest: echo,
        filter: "bandpass",
        filterFreq: 650,
        q: 5.5,
      });
      noise({ start: now + 0.04, duration: 0.32, gain: 0.25, dest: echo, filter: "bandpass", filterFreq: 410, q: 2.2 });
      return;
    }
    if (skin === "zero") {
      hardClick(out, now, 5900, 0.36);
      tone({
        start: now,
        duration: 0.075,
        type: "square",
        gain: 0.18,
        f0: 1950,
        f1: 1220,
        dest: out,
        filter: "bandpass",
        filterFreq: 1650,
        q: 9,
      });
      ionWhip(echo, now + 0.04, 0.22);
      return;
    }
    if (skin === "dragonOperator") {
      tone({ start: now, duration: 0.55, type: "sine", gain: 0.78, f0: 125, f1: 32, dest: out });
      noise({ start: now + 0.05, duration: 0.46, gain: 0.44, dest: echo, filter: "bandpass", filterFreq: 240, q: 3.2 });
      tone({
        start: now + 0.08,
        duration: 0.48,
        type: "triangle",
        gain: 0.25,
        f0: 560,
        f1: 235,
        dest: echo,
        filter: "bandpass",
        filterFreq: 500,
        q: 6.5,
      });
      return;
    }
    if (skin === "revengeClassic") {
      tone({
        start: now,
        duration: 0.22,
        type: "triangle",
        gain: 0.36,
        f0: 1500,
        f1: 2450,
        f2: 850,
        dest: out,
        filter: "bandpass",
        filterFreq: 1850,
        q: 8,
      });
      hardClick(out, now, 5600, 0.28);
      tone({ start: now + 0.07, duration: 0.22, type: "sine", gain: 0.17, f0: 340, f1: 120, dest: out });
      return;
    }
    if (skin === "divineSpectre") {
      tone({
        start: now,
        duration: 0.3,
        type: "triangle",
        gain: 0.4,
        f0: 2050,
        f1: 3250,
        f2: 1050,
        dest: out,
        filter: "bandpass",
        filterFreq: 2350,
        q: 7,
      });
      ionWhip(echo, now + 0.035, 0.23);
      noise({ start: now, duration: 0.11, gain: 0.24, dest: out, filter: "highpass", filterFreq: 4300, q: 1.1 });
    }
  }

  function shot(skin) {
    if (skin === "ancientPhantom") ancientPhantomShot();
    else if (skin === "zero") zeroShot();
    else if (skin === "dragonOperator") dragonOperatorShot();
    else if (skin === "revengeClassic") revengeClassicShot();
    else if (skin === "divineSpectre") divineSpectreShot();
    else zeroShot();
  }

  function hit(skin, type = "body") {
    if (type === "head") hitHead(skin);
    else if (type === "kill") hitKill(skin);
    else hitBody(skin);
  }

  return {
    bindAudio,
    shot,
    hit,
    divineSpectreBurst,
    ancientPhantomShot,
    zeroShot,
    dragonOperatorShot,
    revengeClassicShot,
    divineSpectreShot,
    hitBody,
    hitHead,
    hitKill,
  };
})();

if (typeof window !== "undefined") {
  window.GunSFX = GunSFX;
}
