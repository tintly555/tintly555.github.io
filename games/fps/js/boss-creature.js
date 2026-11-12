/*
 * The boss: an armoured, eight-legged hunter.
 *
 * Nothing about it is human. A low, plated body on eight jointed legs that really step (each foot
 * plants in the world and only lifts when the body has carried it too far), two heavy pincers, and a
 * long tail that arches over the back and ends in a glowing barb. The armour over its back splits open
 * when it is stunned and shows the core underneath.
 *
 * The module only builds the model and poses it. The fight (what it does and when) lives in main.js;
 * it tells this module which animation is playing (`anim`) and for how long (`t`), and reads back where
 * the barb is (`tipWorld`) so a thrown ball leaves from the tail.
 *
 * Conventions: the creature faces +Z, is built at real size (about 7 m long with the tail), and the
 * root sits on the floor. Everything that animates is a child of `body`, so rearing up or sinking down
 * moves the whole animal while the planted feet stay put.
 */

import { getBossParts, TAIL_LEN, STINGER_TIP, topY } from "./boss-parts.js?v=5";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

/** Collision radius at scale 1 (the creature is built 1.2x / 1.5x larger), and the seconds into each animation when its effect lands. */
export const BOSS_RADIUS = 1.5;
export const CLAW_STRIKE_S = 0.72;
export const QUAKE_SLAM_S = 0.66;
export const LOB_RELEASE_S = 0.62;
export const DURATIONS = Object.freeze({
  attacking: 1.5, quaking: 1.6, rangedAttack: 1.3, summoning: 2.4, chargeWind: 1.05, skid: 0.9, stunned: 3.0,
});

const BODY_H = 1.35;
const HIP_Z = [1.1, 0.45, -0.2, -0.85];
const FOOT_Z = [2.35, 1.2, -0.05, -1.35];
const FOOT_X = 2.7;
const L1 = 1.55, L2 = 2.0;
const TAIL_W = [0.12, 0.15, 0.17, 0.17, 0.15, 0.13, 0.11];

/** One material for the sculpted parts: vertex colour carries the paint and baked occlusion, and three glow
 *  channels (eyes, veins, core) are driven by uniforms so the creature can heat up and cool down. */
function organicMaterial(THREE, tint, eyeColor, veinColor, coreColor) {
  const uniforms = {
    uEye: { value: new THREE.Color(0, 0, 0) },
    uVein: { value: veinColor.clone() },
    uCore: { value: coreColor.clone() },
  };
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, color: tint, roughness: 0.58, metalness: 0.12 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 glow;\nvarying vec3 vGlow;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = glow;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vGlow;\nuniform vec3 uEye;\nuniform vec3 uVein;\nuniform vec3 uCore;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEye * vGlow.x + uVein * vGlow.y + uCore * vGlow.z;");
  };
  mat.customProgramCacheKey = () => "bossOrganicV1";
  return { mat, uniforms };
}

export function createBossCreature(THREE, { hell = false } = {}) {
  const scale = hell ? 1.5 : 1.2;
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const body = new THREE.Group();
  body.position.y = BODY_H;
  root.add(body);

  // ── Sculpted parts (built once, shared) and the materials that light them ──────────────────────
  const P = getBossParts(THREE);
  // The vertex colours are painted at display brightness; real dark chitin reflects a fraction of that.
  const tint = hell ? new THREE.Color(0.26, 0.17, 0.15) : new THREE.Color(0.24, 0.21, 0.19);
  const eyeColor = new THREE.Color(hell ? 0xff2a1a : 0xffb02e);
  const veinColor = new THREE.Color(hell ? 0xff2208 : 0xff6a14);
  const coreColor = new THREE.Color(hell ? 0xff3010 : 0xff8a22);
  const skin = organicMaterial(THREE, tint, eyeColor, veinColor, coreColor);
  const sting = organicMaterial(THREE, tint, eyeColor, veinColor, coreColor);
  sting.uniforms.uEye.value.set(0, 0, 0);
  const part = (geo, material, cast = true) => {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  };

  // ── Body: one sculpted shell (carapace, abdomen, head, spine horns, leg and shoulder sockets) ──────
  body.add(part(P.body, skin.mat));

  // Back armour: overlapping plates. The three over the middle are split down the spine and hinge
  // outward when the creature is stunned, which uncovers the core in the pocket beneath.
  const plates = [];
  const plateZ = [1.35, 0.7, 0.05, -0.6, -1.25, -1.9, -2.5];
  plateZ.forEach((z, i) => {
    const w = 0.86 - Math.abs(z - 0.2) * 0.07;
    const split = i >= 2 && i <= 4;
    if (!split) {
      const m = part(P.plate, skin.mat, false);
      m.scale.set(w / 0.8, 0.72 + (i % 3) * 0.06, (0.43 + (i % 2) * 0.025) / 0.5);
      m.position.set(0, topY(z) - 0.09, z);
      m.rotation.x = -Math.atan2(topY(z + 0.2) - topY(z - 0.2), 0.4) * 0.9;
      body.add(m);
    } else {
      for (const side of [-1, 1]) {
        const hinge = new THREE.Group();
        hinge.position.set(side * 0.62, topY(z) - 0.07, z);
        const half = part(P.plate, skin.mat, false);
        half.scale.set(w * 0.5 / 0.8, 1, 0.48 / 0.5);
        half.position.set(-side * w * 0.36, 0.02, 0);
        hinge.add(half);
        body.add(hinge);
        plates.push({ hinge, side });
      }
    }
  });
  const core = part(P.core, skin.mat, false);
  core.position.set(0, 0.46, -0.4);
  body.add(core);

  // ── Mandibles ─────────────────────────────────────────────────────────────────────────────────
  const mandibles = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.28, -0.38, 2.78);
    const fang = part(P.fang, skin.mat, false);
    fang.position.set(side * 0.04, 0, 0);
    fang.rotation.x = 0.3;
    pivot.add(fang);
    body.add(pivot);
    mandibles.push({ pivot, side });
  }

  // ── Pincers ─────────────────────────────────────────────────────────────────────────────────
  const claws = [];
  for (const side of [-1, 1]) {
    const si = side > 0 ? 1 : 0;
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 1.0, 0.0, 1.55);
    shoulder.rotation.order = "YXZ";
    shoulder.add(part(P.clawUpper, skin.mat));
    const elbow = new THREE.Group();
    elbow.position.z = 1.5;
    elbow.rotation.order = "YXZ";
    elbow.add(part(P.clawFore, skin.mat));
    shoulder.add(elbow);
    const wrist = new THREE.Group();
    wrist.position.z = 1.45;
    elbow.add(wrist);
    wrist.add(part(P.clawPalm[si], skin.mat));
    const movePivot = new THREE.Group();
    movePivot.position.set(side * 0.16, 0.0, 0.78);
    movePivot.add(part(P.clawFinger[si], skin.mat, false));
    wrist.add(movePivot);
    body.add(shoulder);
    claws.push({ side, shoulder, elbow, wrist, movePivot });
  }

  // ── Tail ─────────────────────────────────────────────────────────────────────────────────────
  const tailBase = new THREE.Group();
  tailBase.position.set(0, 0.2, -3.1);
  tailBase.rotation.y = Math.PI;          // its +Z now points out of the back of the body
  body.add(tailBase);
  const tailAim = new THREE.Group();
  tailBase.add(tailAim);
  const tailSegs = [];
  let parent = tailAim;
  for (let i = 0; i < TAIL_LEN.length; i++) {
    const g = new THREE.Group();
    if (i > 0) g.position.z = TAIL_LEN[i - 1];
    g.add(part(P.tail[i], skin.mat));
    parent.add(g);
    tailSegs.push(g);
    parent = g;
  }
  const stinger = new THREE.Group();
  stinger.position.z = TAIL_LEN[TAIL_LEN.length - 1];
  stinger.add(part(P.stinger, sting.mat, false));
  parent.add(stinger);
  const tipMarker = new THREE.Object3D();
  tipMarker.position.set(STINGER_TIP[0], STINGER_TIP[1], STINGER_TIP[2]);
  stinger.add(tipMarker);

  // ── Legs ─────────────────────────────────────────────────────────────────────────────────────
  const legs = [];
  const legRoot = new THREE.Group();
  body.add(legRoot);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const upper = part(P.legUpper, skin.mat, false);
      const lower = part(P.legLower, skin.mat, false);
      legRoot.add(upper, lower);
      legs.push({
        side, index: i, group: (i + (side > 0 ? 0 : 1)) % 2,
        hip: new THREE.Vector3(side * 0.78, -0.18, HIP_Z[i]),
        rest: new THREE.Vector3(side * FOOT_X * (1 + (i === 0 ? 0.06 : i === 3 ? -0.05 : 0)), 0, FOOT_Z[i]),
        pos: new THREE.Vector3(), from: new THREE.Vector3(), to: new THREE.Vector3(),
        stepping: false, t: 0, dur: 0.24, ready: false,
        upper, lower,
      });
    }
  }

  // ── Scratch + state ──────────────────────────────────────────────────────
  const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _k = new THREE.Vector3();
  const _foot = new THREE.Vector3(), _dir = new THREE.Vector3(), _pole = new THREE.Vector3();
  const _perp = new THREE.Vector3(), _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);
  const _invQ = new THREE.Quaternion();
  const pose = {
    bodyPitch: 0, bodyRoll: 0, bodyY: 0, bodyZ: 0, rear: 0, splay: 1,
    sy: 0.34, sp: 0.12, ey: 0.85, ep: 0.1, pin: 0.25,
    tailCurl: 0.78, tailYaw: 0, tailGlow: 0.25, mand: 0.15, plates: 0, coreGlow: 0.5, eyeGlow: 0.8, stomp: 0,
  };
  const target = { ...pose };
  const last = { x: NaN, z: NaN };
  const motion = { vx: 0, vz: 0 };
  let clock = Math.random() * 10;
  let speedS = 0, gaitPhase = 0, alive = true, rearPrev = 0, landed = 0;
  const events = { landed: 0 };

  /** Put a limb mesh (built along +Y at length `built`) between two points. */
  function placeSeg(mesh, a, b, built) {
    _dir.subVectors(b, a);
    const len = _dir.length();
    if (len < 1e-5) return;
    _dir.multiplyScalar(1 / len);
    mesh.position.copy(a);
    mesh.quaternion.setFromUnitVectors(_up, _dir);
    mesh.scale.set(1, len / built, 1);
  }

  /** What the body should be doing for the current animation. Values are targets; update() eases to them. */
  function evaluate(anim, t, moving, hellMode, move = "", moveStyle = "", moveDuration = 0) {
    const P = target;
    P.bodyPitch = 0; P.bodyRoll = 0; P.bodyY = 0; P.bodyZ = 0; P.rear = 0; P.splay = 1;
    P.sy = 0.34; P.sp = 0.12; P.ey = 0.85; P.ep = 0.1; P.pin = 0.25 + Math.sin(clock * 1.7) * 0.1;
    P.tailCurl = 0.95 + Math.sin(clock * 0.9) * 0.05; P.tailYaw = Math.sin(clock * 0.7) * 0.18;
    P.tailGlow = 0.25; P.mand = 0.15 + Math.max(0, Math.sin(clock * 2.3)) * 0.12; P.plates = 0;
    P.coreGlow = 0.55 + Math.sin(clock * 2.0) * 0.15; P.eyeGlow = 0.85; P.stomp = 0;
    if (moving) {
      P.sy = 0.26; P.sp = 0.06 + Math.sin(gaitPhase) * 0.06; P.ey = 0.7; P.bodyPitch = -0.035;
      P.tailYaw = Math.sin(gaitPhase * 0.5) * 0.3; P.tailCurl = 0.85;
    }
    // Three-part move helper: value at rest, at the end of the wind-up, and at the strike.
    const phase = (v0, vWind, vStrike, wind, strike, recover) => {
      let v = lerp(v0, vWind, wind);
      v = lerp(v, vStrike, strike);
      return lerp(v, v0, recover);
    };
    switch (anim) {
      case "attacking": {
        const wind = smooth(0, CLAW_STRIKE_S * 0.95, t), strike = smooth(CLAW_STRIKE_S, CLAW_STRIKE_S + 0.1, t);
        const rec = smooth(1.0, 1.5, t);
        P.sy = phase(P.sy, 1.1, -0.2, wind, strike, rec);
        P.sp = phase(P.sp, 1.0, -0.55, wind, strike, rec);
        P.ey = phase(P.ey, 0.15, 0.6, wind, strike, rec);
        P.ep = phase(P.ep, 0.5, -0.3, wind, strike, rec);
        P.pin = phase(P.pin, 1.0, 0.0, wind, strike, rec);
        P.bodyPitch = phase(0, 0.2, -0.2, wind, strike, rec);
        P.bodyZ = phase(0, -0.3, 0.55, wind, strike, rec);
        P.bodyY = phase(0, 0.15, -0.2, wind, strike, rec);
        P.mand = phase(P.mand, 1, 0.3, wind, strike, rec);
        P.tailCurl = lerp(P.tailCurl, 0.95, wind * (1 - rec));
        break;
      }
      case "quaking": {
        const up = smooth(0, 0.58, t), slam = smooth(QUAKE_SLAM_S, QUAKE_SLAM_S + 0.07, t), rec = smooth(1.05, 1.6, t);
        P.rear = phase(0, 1, 0, up, slam, rec);
        P.bodyPitch = phase(0, 0.62, -0.12, up, slam, rec);
        P.bodyY = phase(0, 0.5, -0.38, up, slam, rec);
        P.sy = phase(P.sy, 0.95, 0.5, up, slam, rec);
        P.sp = phase(P.sp, 1.05, -0.2, up, slam, rec);
        P.ey = phase(P.ey, 0.2, 0.7, up, slam, rec);
        P.pin = phase(P.pin, 1, 0, up, slam, rec);
        P.mand = phase(P.mand, 1, 0.4, up, slam, rec);
        P.tailCurl = phase(P.tailCurl, 0.5, 0.95, up, slam, rec);
        P.eyeGlow = 1.2;
        break;
      }
      case "rangedAttack": {
        const coil = smooth(0, 0.5, t), snap = smooth(LOB_RELEASE_S - 0.06, LOB_RELEASE_S + 0.1, t), rec = smooth(0.95, 1.3, t);
        P.tailCurl = phase(P.tailCurl, 0.42, 1.02, coil, snap, rec);
        P.tailGlow = phase(0.25, 1.6, 0.3, coil, snap, rec);
        P.tailYaw = lerp(P.tailYaw, 0, coil);
        P.bodyPitch = phase(0, 0.12, -0.08, coil, snap, rec);
        P.bodyY = phase(0, 0.05, -0.08, coil, snap, rec);
        P.sy = phase(P.sy, 0.6, 0.45, coil, snap, rec);
        P.sp = phase(P.sp, 0.4, 0.1, coil, snap, rec);
        P.pin = phase(P.pin, 0.7, 0.3, coil, snap, rec);
        P.mand = lerp(P.mand, 0.9, coil * (1 - rec));
        break;
      }
      case "patternAttack": {
        const duration = Math.max(0.8, moveDuration || 2);
        const wind = smooth(0.05, 0.52, t);
        const strike = smooth(0.5, 0.82, t);
        const recover = smooth(duration * 0.72, duration, t);
        const active = wind * (1 - recover);
        const style = moveStyle || move;
        const clawMove = style.includes("claw");
        const tailMove = style.includes("tail") || /stinger|venom|volley|spit/.test(move);
        const quakeMove = style.includes("quake") || /ground|aftershock|stomp|wave/.test(move);
        const dashMove = style.includes("dash") || /rush|sidewinder|retreat/.test(move);
        const side = /right/.test(move) ? 1 : /left/.test(move) ? -1 : 0;
        if (clawMove) {
          P.sy = lerp(P.sy, side ? 0.32 : 0.95, active);
          P.sp = lerp(P.sp, 0.8 + strike * 0.24, active);
          P.ey = lerp(P.ey, 0.22, active);
          P.ep = lerp(P.ep, 0.44, active);
          P.pin = lerp(P.pin, 0.9 - strike * 0.5, active);
          P.bodyPitch = -0.14 * active;
          P.bodyRoll = side * -0.12 * active;
          P.bodyZ = -0.18 * wind + 0.34 * strike;
          P.mand = lerp(P.mand, 0.95, active);
        }
        if (tailMove) {
          const coil = 1 - strike;
          P.tailCurl = lerp(P.tailCurl, 0.2 + strike * 1.0, active);
          P.tailYaw = lerp(P.tailYaw, side * 0.5 + (move.includes("rear") ? 0.7 : 0), active);
          P.tailGlow = lerp(P.tailGlow, 0.45 + coil * 0.7, active);
          P.bodyPitch -= 0.08 * active;
          P.ey = lerp(P.ey, 0.55, active);
          P.pin = lerp(P.pin, 0.48, active);
        }
        if (quakeMove) {
          P.rear = lerp(P.rear, 0.76 * (1 - strike * 0.75), active);
          P.bodyPitch += 0.42 * wind - 0.52 * strike;
          P.bodyY += 0.34 * wind - 0.22 * strike;
          P.stomp = active * strike;
          P.tailCurl = lerp(P.tailCurl, 0.8, active);
          P.mand = lerp(P.mand, 0.75, active);
        }
        if (dashMove) {
          P.bodyY -= 0.3 * wind * (1 - recover);
          P.bodyPitch -= 0.2 * active;
          P.bodyRoll += (side || 1) * 0.13 * wind * (1 - recover);
          P.sy = lerp(P.sy, 0.2, active * 0.65);
          P.sp = lerp(P.sp, -0.06, active * 0.65);
          P.tailYaw = lerp(P.tailYaw, -(side || 1) * 0.36, active);
          P.tailCurl = lerp(P.tailCurl, 0.92, active);
          P.eyeGlow = 1.12;
        }
        P.coreGlow = Math.max(P.coreGlow, 0.8 + active * 0.28);
        break;
      }
      case "summoning": {
        const up = smooth(0, 0.5, t), down = smooth(1.95, 2.4, t), k = up * (1 - down);
        P.rear = k * 0.95;
        P.bodyPitch = k * 0.5;
        P.bodyY = k * 0.4;
        P.bodyRoll = Math.sin(clock * 38) * 0.03 * k;
        P.sy = lerp(P.sy, 1.25, k); P.sp = lerp(P.sp, 0.85, k); P.ey = lerp(P.ey, 0.3, k); P.pin = lerp(P.pin, 1, k);
        P.mand = lerp(P.mand, 1, k);
        P.tailCurl = lerp(P.tailCurl, 0.5, k);
        P.plates = k * 0.55;
        P.coreGlow = 0.6 + k * 1.2; P.eyeGlow = 0.85 + k * 0.6;
        break;
      }
      case "chargeWind": {
        const low = smooth(0, 0.45, t);
        P.bodyY = -0.38 * low; P.bodyPitch = -0.16 * low; P.bodyZ = -0.1 * low;
        P.bodyRoll = Math.sin(clock * 34) * 0.02 * low;
        P.sy = lerp(P.sy, 0.18, low); P.sp = lerp(P.sp, 0.0, low); P.ey = lerp(P.ey, 1.0, low); P.pin = lerp(P.pin, 0.2, low);
        P.tailCurl = lerp(P.tailCurl, 1.0, low);
        P.mand = lerp(P.mand, 0.8, low);
        P.stomp = low; P.eyeGlow = 0.85 + low * 0.7;
        break;
      }
      case "charging": case "skid": {
        const skid = anim === "skid" ? 1 : 0;
        P.bodyY = -0.2; P.bodyPitch = skid ? 0.1 : -0.12; P.bodyRoll = 0;
        P.sy = 0.12; P.sp = -0.05; P.ey = 1.0; P.pin = 0.3;
        P.tailCurl = skid ? 0.2 : -0.28; P.mand = 0.9; P.eyeGlow = 1.3;
        break;
      }
      case "stunned": {
        const sink = smooth(0, 0.22, t), wake = smooth(DURATIONS.stunned - 0.45, DURATIONS.stunned, t);
        const k = sink * (1 - wake);
        P.bodyY = -0.58 * k; P.bodyPitch = -0.22 * k + Math.sin(clock * 3) * 0.03 * k;
        P.bodyRoll = Math.sin(clock * 2.3) * 0.05 * k;
        P.sy = lerp(P.sy, 0.9, k); P.sp = lerp(P.sp, -0.5, k); P.ey = lerp(P.ey, 0.2, k); P.pin = lerp(P.pin, 0.1, k);
        P.tailCurl = lerp(P.tailCurl, -0.3, k); P.tailYaw = lerp(P.tailYaw, 0.3, k);
        P.plates = smooth(0, 0.35, t) * (1 - wake);
        P.coreGlow = lerp(P.coreGlow, 2.6, k); P.eyeGlow = lerp(P.eyeGlow, 0.2, k);
        P.splay = 1 + 0.22 * k; P.mand = lerp(P.mand, 0.5, k);
        break;
      }
      default:
        break;
    }
  }

  function toBodyLocal(world, out) {
    out.copy(world).sub(root.position);
    out.applyAxisAngle(_up, -root.rotation.y);
    out.multiplyScalar(1 / scale);
    out.sub(body.position).applyQuaternion(_invQ);
    return out;
  }

  function updateLegs(dt, input, moving) {
    const yaw = root.rotation.y, cy = Math.cos(yaw), sy = Math.sin(yaw);
    const floorY = root.position.y;
    const stepDur = clamp(0.3 - speedS * 0.012, 0.1, 0.28);
    const busy = [false, false];
    for (const leg of legs) if (leg.stepping) busy[leg.group] = true;
    for (const leg of legs) {
      const rx = leg.rest.x * pose.splay * scale, rz = leg.rest.z * scale;
      const restX = root.position.x + rx * cy + rz * sy;
      const restZ = root.position.z - rx * sy + rz * cy;
      let raise = 0;
      if (leg.index === 0) raise = pose.rear;
      else if (leg.index === 1) raise = pose.rear * 0.35;
      const stomp = leg.index === 0 ? pose.stomp * Math.max(0, Math.sin(clock * 15 + (leg.side > 0 ? 0 : Math.PI))) : 0;
      if (!leg.ready || Math.hypot(leg.pos.x - restX, leg.pos.z - restZ) > 9) {
        leg.pos.set(restX, floorY, restZ);
        leg.ready = true;
        leg.stepping = false;
      }
      if (raise > 0.02 || stomp > 0.02) {
        // Reared up: the front legs paw the air; on a stomp they lift and drop.
        const lift = raise * 2.1 * scale + stomp * 0.9 * scale;
        const reach = raise * 0.9 * scale;
        leg.pos.set(restX + sy * reach, floorY + lift, restZ + cy * reach);
        leg.stepping = false;
        continue;
      }
      if (!leg.stepping) {
        const drift = Math.hypot(leg.pos.x - restX, leg.pos.z - restZ);
        const thr = (0.8 + speedS * 0.045) * scale;
        if ((drift > thr && !busy[1 - leg.group]) || drift > 2.5 * scale) {
          leg.stepping = true;
          leg.t = 0;
          leg.dur = stepDur;
          leg.from.copy(leg.pos);
          const lead = clamp(speedS * stepDur * 0.9, 0, 1.8 * scale);
          const mx = motion.vx, mz = motion.vz;
          const ml = Math.hypot(mx, mz) || 1;
          leg.to.set(restX + (mx / ml) * lead, floorY, restZ + (mz / ml) * lead);
          busy[leg.group] = true;
        } else if (leg.pos.y > floorY) {
          leg.pos.y = floorY;
        }
      }
      if (leg.stepping) {
        leg.t += dt / leg.dur;
        const k = clamp(leg.t, 0, 1);
        const e = k * k * (3 - 2 * k);
        leg.pos.lerpVectors(leg.from, leg.to, e);
        leg.pos.y = floorY + Math.sin(k * Math.PI) * 0.62 * scale;
        if (leg.t >= 1) {
          leg.stepping = false;
          leg.pos.copy(leg.to);
          leg.pos.y = floorY;
        }
      }
    }
    // Solve each leg in body space: two bones, knee bent up and outward.
    for (const leg of legs) {
      toBodyLocal(leg.pos, _foot);
      const H = leg.hip;
      _w.subVectors(_foot, H);
      let dist = _w.length();
      const maxReach = (L1 + L2) * 0.985, minReach = Math.abs(L1 - L2) + 0.12;
      _dir.copy(_w).multiplyScalar(1 / Math.max(dist, 1e-4));
      dist = clamp(dist, minReach, maxReach);
      _foot.copy(H).addScaledVector(_dir, dist);
      const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
      const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
      _pole.set(leg.side * 0.55, 1, -0.1).normalize();
      _perp.copy(_pole).addScaledVector(_dir, -_pole.dot(_dir));
      if (_perp.lengthSq() < 1e-5) _perp.set(0, 1, 0);
      _perp.normalize();
      _k.copy(H).addScaledVector(_dir, a).addScaledVector(_perp, h);
      placeSeg(leg.upper, H, _k, L1);
      placeSeg(leg.lower, _k, _foot, L2);
    }
  }

  function updateClaws() {
    for (const c of claws) {
      const s = c.side;
      c.shoulder.rotation.y = s * pose.sy;
      c.shoulder.rotation.x = -pose.sp;
      c.elbow.rotation.y = -s * pose.ey;
      c.elbow.rotation.x = -pose.ep * 0.6;
      c.movePivot.rotation.y = s * pose.pin * 0.62;
    }
  }

  function updateTail() {
    const curl = clamp(pose.tailCurl, -0.5, 1.2);
    const totalBend = lerp(0.9, 3.0, curl);
    tailAim.rotation.y = pose.tailYaw;
    for (let i = 0; i < tailSegs.length; i++) {
      const wave = Math.sin(clock * 1.3 - i * 0.6) * 0.045;
      const base = i === 0 ? lerp(0.15, 0.7, curl) : 0;
      tailSegs[i].rotation.x = -(base + totalBend * TAIL_W[i] + wave);
    }
    stinger.rotation.x = -0.06;
  }

  function updatePlates() {
    for (const p of plates) p.hinge.rotation.z = -p.side * pose.plates * 1.05;
  }

  /**
   * Advance the creature. `input`: { anim, t, moving, flinch, vx, vz } where `anim` is the animation
   * name and `t` the seconds spent in it. Position and yaw come from the root, which the caller owns.
   */
  function update(dt, input = {}) {
    dt = Math.min(dt, 0.05);
    clock += dt;
    const anim = input.anim || "idle", t = input.t || 0;
    if (Number.isNaN(last.x)) { last.x = root.position.x; last.z = root.position.z; }
    const dx = root.position.x - last.x, dz = root.position.z - last.z;
    const moved = Math.hypot(dx, dz);
    const teleported = moved > 4;
    const v = teleported ? 0 : moved / Math.max(dt, 1e-4);
    last.x = root.position.x; last.z = root.position.z;
    motion.vx = teleported ? 0 : dx; motion.vz = teleported ? 0 : dz;
    speedS = damp(speedS, Math.min(v, 30), 12, dt);
    const moving = input.moving !== false && speedS > 0.25;
    gaitPhase += speedS * dt / 1.7 * TAU * 0.5;
    if (teleported) for (const leg of legs) leg.ready = false;

    evaluate(anim, t, moving, hell, input.move || "", input.moveStyle || "", input.moveDuration || 0);
    const attackish = anim !== "idle";
    const rate = attackish ? 22 : 9;
    for (const k of Object.keys(pose)) pose[k] = damp(pose[k], target[k], k === "bodyY" && anim === "quaking" ? 40 : rate, dt);
    if (input.flinch > 0) {
      pose.bodyRoll += Math.sin(clock * 55) * 0.035 * input.flinch;
      pose.bodyPitch -= 0.05 * input.flinch;
    }
    // The body slams the floor when the rear-up ends: report it once.
    if (rearPrev > 0.5 && pose.rear < 0.35) events.landed++;
    rearPrev = pose.rear;

    const bob = moving && anim !== "stunned" ? Math.abs(Math.sin(gaitPhase * 2)) * 0.05 : 0;
    body.position.set(0, BODY_H + pose.bodyY + bob + Math.sin(clock * 1.9) * 0.02, pose.bodyZ);
    body.rotation.set(pose.bodyPitch, 0, pose.bodyRoll, "XZY");
    root.updateMatrixWorld(true);
    _invQ.copy(body.quaternion).invert();

    updateLegs(dt, input, moving);
    updateClaws();
    updateTail();
    updatePlates();
    for (const m of mandibles) m.pivot.rotation.y = m.side * pose.mand * 0.6;
    skin.uniforms.uEye.value.copy(eyeColor).multiplyScalar(0.4 + pose.eyeGlow * 1.5);
    skin.uniforms.uVein.value.copy(veinColor).multiplyScalar(0.55 + pose.coreGlow * 0.4 + pose.eyeGlow * 0.2);
    skin.uniforms.uCore.value.copy(coreColor).multiplyScalar(0.5 + pose.coreGlow * 1.5);
    sting.uniforms.uVein.value.copy(veinColor).multiplyScalar(0.5 + pose.tailGlow);
    sting.uniforms.uCore.value.copy(coreColor).multiplyScalar(0.4 + pose.tailGlow * 2.4);
    root.updateMatrixWorld(true);
  }

  /** World position of the barb, where a thrown ball starts. */
  function tipWorld(out) {
    return tipMarker.getWorldPosition(out);
  }

  /** The animal's hit volumes: groups of `body`, with boxes in each group's own space (see bossHitAlongRay). */
  const hitGroups = { bossBody: body, bossClawL: claws[0].wrist, bossClawR: claws[1].wrist, bossStinger: stinger };
  const hitTable = [
    ["bossBody", [
      { x0: -1.25, x1: 1.25, y0: -0.62, y1: 0.78, z0: -0.5, z1: 2.3, zone: "body" },
      { x0: -1.05, x1: 1.05, y0: -0.6, y1: 0.66, z0: -3.5, z1: -0.5, zone: "body" },
      { x0: -0.7, x1: 0.7, y0: -0.55, y1: 0.55, z0: 1.9, z1: 2.95, zone: "body" },
      { x0: -0.42, x1: 0.42, y0: 0.55, y1: 1.2, z0: -0.62, z1: 0.24, zone: "head" },
      { x0: -3.1, x1: -0.85, y0: -1.45, y1: 0.05, z0: -1.5, z1: 2.5, zone: "leg" },
      { x0: 0.85, x1: 3.1, y0: -1.45, y1: 0.05, z0: -1.5, z1: 2.5, zone: "leg" },
    ]],
    ["bossClawL", [{ x0: -0.5, x1: 0.5, y0: -0.4, y1: 0.4, z0: -0.2, z1: 1.9, zone: "body" }]],
    ["bossClawR", [{ x0: -0.5, x1: 0.5, y0: -0.4, y1: 0.4, z0: -0.2, z1: 1.9, zone: "body" }]],
    ["bossStinger", [{ x0: -0.38, x1: 0.38, y0: -1.3, y1: 0.45, z0: -0.2, z1: 1.3, zone: "head" }]],
  ];
  // Mid-tail sections also take hits (as body), so the tail is not a ghost.
  tailSegs.forEach((g, i) => {
    if (i % 2 === 1) {
      hitGroups[`bossTail${i}`] = g;
      hitTable.push([`bossTail${i}`, [{ x0: -0.45, x1: 0.45, y0: -0.45, y1: 0.45, z0: 0, z1: TAIL_LEN[i], zone: "body" }]]);
    }
  });

  function dispose() {
    // The sculpted geometry is shared by every creature; only this one's materials are its own.
    skin.mat.dispose();
    sting.mat.dispose();
  }

  return {
    root, body, hitGroups, hitTable, update, tipWorld, dispose, scale,
    get landed() { return events.landed; },
    set alive(v) { alive = v; },
    get alive() { return alive; },
    /** The feet snap back under the body the next frame (after the root is moved without walking). */
    resetFeet() { for (const leg of legs) leg.ready = false; last.x = NaN; },
  };
}
