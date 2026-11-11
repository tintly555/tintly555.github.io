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

  function makeSample(kind) {
    const voice = kind === "zombieVoice";
    const roar = kind === "bossRoar" || kind === "hellRoar";
    const hell = kind === "hellRoar";
    const shot = kind === "shot";
    const heavy = kind === "zombieStep";
    const metal = kind === "steelStep";
    const duration = roar ? (hell ? 2.18 : 1.79) : voice ? 0.95 : shot ? 0.34 : heavy ? 0.34 : metal ? 0.3 : 0.26;
    const rate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.ceil(rate * duration), rate);
    const data = buffer.getChannelData(0);
    const pitch = 1 + (Math.random() - 0.5) * 0.27;
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
      } else {
        // Heel strike, then toe-off about 0.11 s later: a real step is two contacts, not one thud.
        const thud = Math.sin(t * 2 * Math.PI * (heavy ? 55 : 88) * pitch) * Math.exp(-t * 44);
        const scuff = (rasp * 0.65 + noise * 0.16) * Math.exp(-Math.abs(t - 0.044) * (heavy ? 29 : 45));
        const heel = low * Math.exp(-t * 54);
        const toeT = t - 0.11;
        const toe = toeT > 0
          ? (rasp * 0.5 + noise * 0.12) * Math.exp(-toeT * 60)
            + Math.sin(toeT * 2 * Math.PI * (heavy ? 70 : 120) * pitch) * Math.exp(-toeT * 55) * 0.2
          : 0;
        // Metal grating rings at two partials, so steel reads as a different surface.
        const ring = metal
          ? (Math.sin(t * 2 * Math.PI * 420 * pitch) * 0.10 + Math.sin(t * 2 * Math.PI * 1130 * pitch) * 0.04) * Math.exp(-t * 29)
          : 0;
        data[i] = thud * (heavy ? 0.53 : 0.35) + scuff * (heavy ? 0.42 : 0.27) + heel * 0.3
          + toe * (heavy ? 0.3 : 0.22) + ring;
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
      for (const [delay, gain] of [[0.019, 0.36], [0.038, 0.18], [0.064, 0.085]]) {
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
    if (!samples.has(kind)) samples.set(kind, Array.from({ length: /Step$/.test(kind) ? 4 : 1 }, () => makeSample(kind)));
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
      send.gain.value = room * (echoOnly ? 0.14 : blocked ? 0.095 : 0.075);
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
