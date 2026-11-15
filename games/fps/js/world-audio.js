/** Shared Web Audio scene for footsteps, creature voices, and distant gunfire. */
export function createWorldAudio(context, destination, isObstructed) {
  const samples = new Map();
  const footsteps = new WeakMap();
  const listener = context.listener;
  let room = 0;
  let reverb;
  let activeVoices = 0;
  const ear = { x: 0, y: 0, z: 0 };
  let yaw = 0;
  const stepSurfaces = {
    Step: "boot", step: "boot", bootStep: "boot", metalStep: "metal", steelStep: "metal",
    concreteStep: "concrete", stoneStep: "stone", gravelStep: "gravel", woodStep: "wood",
    grassStep: "grass", sandStep: "sand", waterStep: "water", iceStep: "ice", slickStep: "ice",
  };

  function stepProfile(kind) {
    const name = String(kind || "");
    const zombie = name.startsWith("zombie");
    const rawBase = zombie ? name.slice(6) : name;
    const base = zombie && rawBase ? rawBase[0].toLowerCase() + rawBase.slice(1) : rawBase;
    const surface = stepSurfaces[base] || null;
    return surface ? { surface, zombie } : null;
  }

  function makeSample(kind) {
    const voice = kind === "zombieVoice";
    const roar = kind === "bossRoar" || kind === "hellRoar";
    const hell = kind === "hellRoar";
    const shot = kind === "shot";
    const entrySplash = kind === "waterEntry";
    const profile = stepProfile(kind);
    const heavy = kind === "zombieStep" || !!profile?.zombie;
    const surface = profile?.surface || "boot";
    const duration = roar ? (hell ? 2.18 : 1.79) : voice ? 0.95 : shot ? 0.34
      : entrySplash ? 1.12 : profile ? (surface === "water" ? 0.4 : surface === "gravel" || surface === "sand" ? 0.32 : 0.29)
        : kind === "zombieStep" ? 0.34 : 0.26;
    const rate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.ceil(rate * duration), rate);
    const data = buffer.getChannelData(0);
    const pitch = 1 + (Math.random() - 0.5) * 0.27;
    const splashDrops = entrySplash
      ? Array.from({ length: 5 }, (_, d) => 0.12 + d * 0.105 + Math.random() * 0.055)
      : [];
    const gravelHits = surface === "gravel"
      ? Array.from({ length: 4 }, (_, pebble) => 0.025 + pebble * 0.047 + Math.random() * 0.025)
      : [];
    let low = 0;
    let rasp = 0;
    let phase = 0;
    // A pressured glottal pulse feeding three moving vocal resonances.
    const history = [0, 0, 0], previous = [0, 0, 0];
    const centers = hell ? [280, 760, 1630] : [410, 970, 1860];
    const gains = [0.70, 0.39, 0.19];
    const decays = roar ? centers.map((_, band) => Math.exp(-Math.PI * (100 + band * 95) / rate)) : [];
    for (let i = 0; i < data.length; i++) {
      const t = i / rate;
      const noise = Math.random() * 2 - 1;
      low += (noise - low) * 0.065;
      rasp += (noise - rasp) * 0.27;
      if (roar) {
        const u = t / duration;
        const attack = Math.max(0, Math.min(1, (t - 0.10) * 12));
        const tail = (1 - u) ** 1.5;
        const throat = (hell ? 47 : 62) + 39 * Math.sin(u * Math.PI * 0.92)
          + 10 * Math.sin(t * 37) + 4 * noise;
        phase = (phase + throat * pitch / rate) % 1;
        const open = Math.max(0, Math.sin(phase * Math.PI * 2));
        const pulse = open * open * (0.55 + 0.45 * Math.sin(t * 40) ** 2);
        const drive = (pulse - 0.25 + rasp * 0.7) * attack;
        let resonant = 0;
        for (let band = 0; band < centers.length; band++) {
          const frequency = centers[band] * (0.75 + attack * 0.32 + 0.08 * Math.sin(t * 9 + band));
          const decay = decays[band];
          const out = (1 - decay) * drive + 2 * decay * Math.cos(2 * Math.PI * frequency / rate) * history[band]
            - decay * decay * previous[band];
          previous[band] = history[band];
          history[band] = out;
          resonant += out * gains[band];
        }
        const inhale = rasp * 0.70 * Math.max(0, Math.sin(Math.PI * Math.min(1, t / 0.17)));
        data[i] = Math.tanh(resonant * 1.35 + drive * 0.5 + inhale + low * attack * 0.34) * tail * 0.88;
      } else if (voice) {
        phase += (49 + 25 * Math.sin(Math.PI * t / duration) + Math.sin(43 * t) * 7) * pitch / rate;
        const throat = Math.sin(phase * 2 * Math.PI);
        const overtone = Math.sin(phase * 6 * Math.PI) * 0.17 + Math.sin(phase * 14 * Math.PI) * 0.07;
        const breath = Math.min(1, t * 12) * (1 - t / duration) ** 1.3;
        data[i] = ((throat * 0.31 + overtone) * (0.75 + 0.25 * Math.sin(81 * t)) + rasp * 0.69) * breath;
      } else if (shot) {
        data[i] = noise * 0.61 * Math.exp(-t * 68) + low * 1.05 * Math.exp(-t * 15)
          + Math.sin(t * 2 * Math.PI * 96 * pitch) * 0.27 * Math.exp(-t * 30);
      } else if (entrySplash) {
        // A rounded footfall impact followed by a broad splash, small droplets, and a soft gurgle.
        const impact = Math.sin(2 * Math.PI * (68 + 14 * Math.sin(t * 9)) * t * pitch)
          * Math.exp(-t * 8.5) * 0.34;
        const splash = (rasp * 0.68 + noise * 0.32) * Math.exp(-t * 4.8)
          * Math.min(1, t * 34);
        const wash = low * Math.exp(-t * 2.6) * 0.42;
        const burble = Math.sin(2 * Math.PI * (46 + 19 * Math.sin(t * 14)) * t * pitch)
          * Math.exp(-Math.max(0, t - 0.12) * 5.4) * (t > 0.12 ? 0.09 : 0);
        let droplets = 0;
        for (let d = 0; d < 5; d++) {
          const at = splashDrops[d];
          const age = t - at;
          if (age > 0) {
            const envelope = Math.exp(-age * (21 + d * 2)) * Math.min(1, age * 75);
            droplets += Math.sin(2 * Math.PI * (720 + d * 137) * age * pitch) * envelope * (0.045 - d * 0.004);
          }
        }
        data[i] = impact + splash * 0.55 + wash + burble + droplets;
      } else {
        // Shared boot contact: heel, sole scuff, then toe release, each softly enveloped.
        const heelEnv = Math.exp(-t * (heavy ? 30 : 35)) * Math.min(1, t * 85);
        const thud = Math.sin(2 * Math.PI * (heavy ? 58 : 82) * pitch * t) * heelEnv;
        const scuffEnv = Math.exp(-Math.abs(t - 0.035) * 28) * Math.min(1, Math.max(0, t) * 70);
        const scuff = (rasp * 0.68 + noise * 0.12) * scuffEnv;
        const toeT = t - 0.105;
        const toeEnv = toeT > 0 ? Math.exp(-toeT * 29) * Math.min(1, toeT * 80) : 0;
        const toe = (rasp * 0.43 + noise * 0.09
          + Math.sin(2 * Math.PI * (heavy ? 76 : 108) * pitch * toeT) * 0.14) * toeEnv;
        let detail = 0;
        if (surface === "metal") {
          detail = (Math.sin(2 * Math.PI * 360 * pitch * t) * 0.09
            + Math.sin(2 * Math.PI * 690 * pitch * t) * 0.045) * Math.exp(-t * 13) * Math.min(1, t * 90);
        } else if (surface === "stone" || surface === "concrete") {
          detail = (noise * 0.085 + rasp * 0.12) * Math.exp(-t * 26) * Math.min(1, t * 95);
        } else if (surface === "gravel") {
          for (let pebble = 0; pebble < 4; pebble++) {
            const at = gravelHits[pebble];
            const age = t - at;
            if (age > 0) detail += (noise * 0.52 + rasp * 0.28)
              * Math.exp(-age * (34 + pebble * 4)) * Math.min(1, age * 90) * (0.13 - pebble * 0.018);
          }
        } else if (surface === "wood") {
          detail = (Math.sin(2 * Math.PI * 145 * pitch * t) * 0.13
            + Math.sin(2 * Math.PI * 232 * pitch * t) * 0.055) * Math.exp(-t * 18) * Math.min(1, t * 80);
        } else if (surface === "grass") {
          detail = (low * 0.15 + rasp * 0.28 + noise * 0.07)
            * Math.exp(-t * 17) * Math.min(1, t * 65);
        } else if (surface === "sand") {
          detail = (low * 0.11 + rasp * 0.34 + noise * 0.08)
            * Math.exp(-t * 12) * Math.min(1, t * 55);
        } else if (surface === "water") {
          detail = (rasp * 0.38 + noise * 0.14) * Math.exp(-t * 9) * Math.min(1, t * 50)
            + Math.sin(2 * Math.PI * 510 * pitch * t) * 0.025 * Math.exp(-t * 16) * Math.min(1, t * 80);
        } else if (surface === "ice") {
          detail = (Math.sin(2 * Math.PI * 275 * pitch * t) * 0.045
            + Math.sin(2 * Math.PI * 418 * pitch * t) * 0.022
            + rasp * 0.09) * Math.exp(-t * 12) * Math.min(1, t * 80);
        } else {
          detail = (low * 0.15 + rasp * 0.16) * Math.exp(-t * 18) * Math.min(1, t * 70);
        }
        const materialWeight = surface === "grass" || surface === "sand" ? 0.62
          : surface === "water" || surface === "ice" ? 0.58 : 1;
        data[i] = (thud * (heavy ? 0.62 : 0.49) + scuff * (heavy ? 0.35 : 0.30)
          + toe * 0.27 + detail) * materialWeight;
      }
      data[i] *= Math.min(1, t * 800, (duration - t) * 80);
    }
    return buffer;
  }

  function roomReverb() {
    if (reverb) return reverb;
    const rate = context.sampleRate;
    const impulse = context.createBuffer(2, Math.ceil(rate * 0.25), rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let low = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / rate;
        low += (Math.random() * 2 - 1 - low) * 0.21;
        if (t > 0.016) data[i] = low * Math.exp(-(t - 0.016) * 23) * 0.017;
      }
      for (const [delay, gain] of [[0.019, 0.20], [0.038, 0.095], [0.064, 0.045]]) {
        data[Math.floor((delay + ch * 0.004) * rate)] += gain;
      }
    }
    reverb = context.createConvolver();
    reverb.normalize = false;
    reverb.buffer = impulse;
    reverb.connect(destination);
    return reverb;
  }

  function setPosition(node, x, y, z) {
    if (node.positionX) {
      node.positionX.value = x;
      node.positionY.value = y;
      node.positionZ.value = z;
    } else node.setPosition(x, y, z);
  }

  function setListener(position, heading, enclosure) {
    Object.assign(ear, position);
    yaw = heading;
    room = enclosure;
    setPosition(listener, ear.x, ear.y, ear.z);
    const x = -Math.sin(yaw), z = -Math.cos(yaw);
    if (listener.forwardX) {
      listener.forwardX.value = x;
      listener.forwardZ.value = z;
    } else listener.setOrientation(x, 0, z, 0, 1, 0);
  }

  function play(kind, position, { local = false, volume = 1, echoOnly = false } = {}) {
    if (context.state !== "running" || activeVoices >= (local ? 18 : 14) || (echoOnly && room < 0.05)) return;
    const distance = Math.hypot(position.x - ear.x, position.y - ear.y, position.z - ear.z);
    const range = kind === "bossRoar" || kind === "hellRoar" ? 65 : kind === "shot" ? 52 : kind === "zombieVoice" ? 30 : 21;
    if (!Number.isFinite(distance) || (!local && distance >= range)) return;
    const blocked = !local && distance > 1.5 && isObstructed(ear, position);
    // Footsteps keep several synthesized variants so consecutive steps don't repeat the same sample.
    const isStep = kind === "zombieStep" || !!stepProfile(kind);
    if (!samples.has(kind)) samples.set(kind, Array.from({ length: isStep || kind === "waterEntry" ? 4 : 1 }, () => makeSample(kind)));
    const variants = samples.get(kind);
    const source = context.createBufferSource();
    source.buffer = variants[Math.floor(Math.random() * variants.length)];
    source.playbackRate.value = 0.90 + Math.random() * 0.20;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = blocked ? 700 : 12500 / (1 + distance * 0.09);
    const gain = context.createGain();
    const falloff = local ? 1 : (1 - distance / range) ** 1.7;
    gain.gain.value = volume * falloff * (blocked ? 0.36 : 1);
    source.connect(filter);
    filter.connect(gain);
    let output = gain;
    if (!echoOnly) {
      const panner = context.createPanner();
      panner.panningModel = "equalpower";
      // The gain above handles distance with a smooth fade to silence at the cutoff.
      panner.rolloffFactor = 0;
      setPosition(panner, position.x, position.y, position.z);
      gain.connect(panner);
      panner.connect(destination);
      output = panner;
    }
    let send;
    if (room > 0.05) {
      send = context.createGain();
      const wetAmount = kind === "waterEntry" ? 0.105 : isStep ? 0.055 : 0.075;
      send.gain.value = room * (echoOnly ? 0.14 : blocked ? wetAmount * 0.72 : wetAmount);
      output.connect(send);
      send.connect(roomReverb());
    }
    activeVoices++;
    source.onended = () => {
      activeVoices--;
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
      if (output !== gain) output.disconnect();
      if (send) send.disconnect();
    };
    source.start();
  }

  function step(actor, position, grounded, stride, kind, options = {}) {
    let track = footsteps.get(actor);
    if (!track) {
      track = { x: position.x, z: position.z, travel: 0, side: 1 };
      footsteps.set(actor, track);
    }
    const distance = Math.hypot(position.x - track.x, position.z - track.z);
    track.x = position.x;
    track.z = position.z;
    if (!grounded || distance > 2.3) {
      track.travel = 0;
      return;
    }
    track.travel += distance;
    if (track.travel < stride) return;
    track.travel %= stride;
    track.side *= -1;
    const heading = options.heading ?? yaw;
    const offset = track.side * 0.14;
    // Small random level change per step so the rhythm doesn't sound machine-stamped.
    play(kind, {
      x: position.x + Math.cos(heading) * offset,
      y: position.y,
      z: position.z - Math.sin(heading) * offset,
    }, { ...options, volume: (options.volume ?? 1) * (0.88 + Math.random() * 0.24) });
  }

  return { setListener, play, step, resetSteps: (actor) => footsteps.delete(actor) };
}
