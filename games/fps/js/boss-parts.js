/*
 * The boss's sculpted parts. Each one is a signed-distance field (see boss-sculpt.js): tapered limbs and
 * blobs blended smoothly into each other, armour grooves cut across them, spines grown out of them, pits
 * from noise. They are meshed once and shared by every creature.
 *
 * Conventions match boss-creature.js: the body faces +Z; limbs and tail segments run along +Z (claws, tail)
 * or +Y (legs) from their own origin.
 */
import {
  TAU, clamp, smoothstep, smin, smax, sdEllipsoid, sdSphere, sdRoundCone, sdSpike, vnoise, fbm, ridge, meshField,
} from "./boss-sculpt.js?v=1";

const { abs, sqrt, atan2, cos, sin, hypot } = Math;

export const HIP_Z = [1.1, 0.45, -0.2, -0.85];
export const LEG_L1 = 1.55, LEG_L2 = 2.0;
export const TAIL_LEN = [0.9, 0.9, 0.88, 0.86, 0.82, 0.78, 0.74];
export const TAIL_R = [0.46, 0.43, 0.40, 0.37, 0.34, 0.30, 0.26, 0.22];
export const STINGER_TIP = [0, -0.7, 1.35];
const EYES = [[0.26, 0.27, 2.78, 0.11], [0.5, 0.18, 2.6, 0.095], [0.64, 0.08, 2.36, 0.08]];

/** Height of the carapace's top surface at z (the rig and the plates sit on it). */
export const topY = (z) => {
  const a = 1 - ((z - 0.55) / 1.75) ** 2, b = 1 - ((z + 1.95) / 1.6) ** 2;
  return Math.max(a > 0 ? 0.08 + 0.64 * Math.sqrt(a) : -9, b > 0 ? 0.6 * Math.sqrt(b) : -9);
};

/** Chitin colouring: dark brown with wear and baked occlusion. `base` is the lit colour. */
function chitin(base, extra) {
  return (o, x, y, z, nx, ny, nz, ao) => {
    const wear = 0.74 + 0.5 * vnoise(x * 3.1, y * 3.1, z * 3.1);
    const lit = 0.58 + 0.42 * (ny * 0.5 + 0.5);
    const k = (0.24 + 0.76 * ao) * wear * lit;
    o[0] = base[0] * k; o[1] = base[1] * k; o[2] = base[2] * k;
    if (extra) extra(o, x, y, z, nx, ny, nz, ao, k);
  };
}

const spineTo = (x, y, z, ax, ay, az, bx, by, bz, r) => sdSpike(x, y, z, ax, ay, az, bx, by, bz, r);

// ── Body: carapace, abdomen, head, spine crest, leg and shoulder sockets ─────────────────────────
function bodyField(x, y, z) {
  const sx = abs(x);
  const bound = sdEllipsoid(x, y - 0.1, z + 0.4, 2.0, 1.3, 3.9);
  if (bound > 0.7) return bound;
  let d = sdEllipsoid(sx, y - 0.08, z - 0.55, 1.18, 0.64, 1.75);
  d = smin(d, sdEllipsoid(sx, y, z + 1.95, 0.98, 0.6, 1.6), 0.4);
  d = smin(d, sdEllipsoid(sx, y - 0.04, z + 0.55, 0.7, 0.45, 0.5), 0.3);
  d = smin(d, sdEllipsoid(sx, y + 0.05, z - 2.2, 0.74, 0.5, 0.74), 0.45);
  d = smin(d, sdRoundCone(sx, y, z, 0.18, 0.38, 2.7, 0.64, 0.2, 2.25, 0.13, 0.09), 0.12);
  for (let e = 0; e < 3; e++) d = smin(d, sdSphere(sx - EYES[e][0], y - EYES[e][1], z - EYES[e][2], EYES[e][3]), 0.06);
  d = smax(d, -sdEllipsoid(sx, y + 0.4, z - 2.85, 0.32, 0.17, 0.33), 0.08);
  for (let i = 0; i < 4; i++) {
    d = smin(d, sdRoundCone(sx, y, z, 0.55, -0.1, HIP_Z[i], 0.95, -0.22, HIP_Z[i], 0.36, 0.3), 0.25);
  }
  d = smin(d, sdSphere(sx - 1.0, y, z - 1.55, 0.44), 0.25);
  if (y > 0.35 && sx < 0.45) {
    // Back-swept horns down the spine.
    for (let i = 0; i < 9; i++) {
      const zi = 1.55 - i * 0.5, yb = topY(zi) - 0.06;
      d = smin(d, spineTo(x, y, z, 0, yb, zi, 0, yb + 0.5 - i * 0.025, zi - 0.4, 0.13 - i * 0.005), 0.14);
    }
  }
  if (sx > 0.7 && y > -0.1 && y < 0.9) {
    // Flank spines along the sides of the armour.
    for (let i = 0; i < 6; i++) {
      const zi = 1.2 - i * 0.65, w = 1.05 - abs(zi - 0.2) * 0.06;
      d = smin(d, spineTo(sx, y, z, w * 0.85, 0.25, zi, w * 0.85 + 0.48, 0.42, zi - 0.34, 0.1), 0.1);
    }
  }
  d = smax(d, -(y + 0.5), 0.2);
  // A pocket in the back where the split armour plates sit; the core lies at its bottom.
  d = smax(d, -sdEllipsoid(sx, y - 0.8, z + 0.45, 0.6, 0.55, 1.0), 0.1);
  // Plate seams cut across the back.
  const seam = ridge(z / 0.62 + 0.25, 7) * 0.06 * smoothstep(-0.15, 0.25, y) * smoothstep(-3.3, -2.9, z) * (1 - smoothstep(1.3, 1.7, z));
  d += seam;
  d += (fbm(x * 5, y * 5, z * 5) - 0.5) * 0.05 + (vnoise(x * 1.7, y * 1.7, z * 1.7) - 0.5) * 0.07;
  return d;
}

const bodyShade = chitin([0.24, 0.19, 0.15], (o, x, y, z, nx, ny, nz, ao, k) => {
  const sx = abs(x);
  if (y < -0.25) { o[0] *= 0.6; o[1] *= 0.6; o[2] *= 0.6; }
  const band = 0.88 + 0.12 * cos(z * TAU / 0.62);
  o[0] *= band; o[1] *= band; o[2] *= band;
  for (let e = 0; e < 3; e++) {
    const dist = hypot(sx - EYES[e][0], y - EYES[e][1], z - EYES[e][2]);
    const r = EYES[e][3] * 1.15;
    if (dist < r) o[3] = Math.max(o[3], smoothstep(r, r * 0.4, dist));
  }
  const cav = sdEllipsoid(sx, y - 0.8, z + 0.45, 0.6, 0.55, 1.0);
  if (cav < 0.16) o[4] = Math.max(o[4], smoothstep(0.16, 0.0, cav) * (0.65 + 0.35 * vnoise(x * 6, y * 6, z * 6)));
  if (z < -0.9 && y > 0.1) o[4] = Math.max(o[4], smoothstep(0.5, 1.0, ridge(z / 0.62 + 0.25, 7)) * 0.5);
  const mouth = sdEllipsoid(sx, y + 0.4, z - 2.85, 0.4, 0.25, 0.4);
  if (mouth < 0.08) { o[0] *= 0.4; o[1] *= 0.3; o[2] *= 0.3; o[4] = Math.max(o[4], 0.4); }
});

// ── A shared limb finish: angular flutes along the length plus wear ─────────────────────────────
const flutes = (x, z, n, depth) => depth * (0.5 - 0.5 * cos(atan2(z, x) * n));

// ── Armour plate (sits over the back pocket; scaled per use) ───────────────────────────────────────
function plateField(x, y, z) {
  const bound = sdEllipsoid(x, y - 0.1, z, 0.95, 0.4, 0.62);
  if (bound > 0.3) return bound;
  let d = sdEllipsoid(x, y - 0.14, z, 0.8, 0.2, 0.5);
  d = smin(d, sdRoundCone(x, y, z, 0, 0.16, 0.38, 0, 0.26, -0.4, 0.08, 0.05), 0.08);
  d = smin(d, spineTo(x, y, z, 0, 0.3, -0.35, 0, 0.55, -0.62, 0.09), 0.08);
  d = smin(d, spineTo(abs(x), y, z, 0.5, 0.26, -0.3, 0.72, 0.4, -0.5, 0.06), 0.06);
  d = smax(d, -(y + 0.03), 0.04);
  d += flutes(x * 2.2, z * 3, 5, 0.01) + (fbm(x * 9, y * 9, z * 9) - 0.5) * 0.03;
  return d;
}
const plateShade = chitin([0.3, 0.24, 0.19], (o, x, y, z, nx, ny, nz, ao, k) => {
  if (ny > 0.6) { o[0] *= 1.1; o[1] *= 1.1; o[2] *= 1.1; }
  if (y < 0.0) o[4] = 0.25;
});

// ── The core: a faceted, vein-lit organ ────────────────────────────────────────────────────────────
function coreField(x, y, z) {
  const bound = sdSphere(x, y, z, 0.7);
  if (bound > 0.25) return bound;
  let d = sdEllipsoid(x, y, z, 0.3, 0.27, 0.34);
  for (let i = 0; i < 5; i++) {
    const a = i * 2.4, e = ((i * 37) % 7) / 7;
    d = smin(d, spineTo(x, y, z, 0, 0, 0, cos(a) * 0.3, 0.1 + e * 0.35, sin(a) * 0.3, 0.1), 0.08);
  }
  d += (fbm(x * 8, y * 8, z * 8) - 0.5) * 0.09;
  return d;
}
const coreShade = (o, x, y, z, nx, ny, nz, ao) => {
  const v = 0.6 + 0.4 * vnoise(x * 9, y * 9, z * 9);
  o[0] = 0.25 * v; o[1] = 0.05 * v; o[2] = 0.02 * v;
  o[5] = 0.55 + 0.45 * vnoise(x * 5 + 7, y * 5, z * 5);
};

// ── Fang (mandible): a curved hook ───────────────────────────────────────────────────────────────
function fangField(x, y, z) {
  const bound = sdEllipsoid(x, y + 0.2, z - 0.5, 0.3, 0.6, 0.8);
  if (bound > 0.2) return bound;
  let d = sdRoundCone(x, y, z, 0, 0, 0, 0, -0.05, 0.4, 0.17, 0.12);
  d = smin(d, sdRoundCone(x, y, z, 0, -0.05, 0.4, 0, -0.2, 0.82, 0.12, 0.06), 0.1);
  d = smin(d, sdRoundCone(x, y, z, 0, -0.2, 0.82, 0, -0.42, 1.08, 0.06, 0.012), 0.06);
  for (let i = 0; i < 3; i++) {
    d = smin(d, spineTo(x, y, z, 0.07, -0.06 - i * 0.07, 0.3 + i * 0.2, 0.2, -0.04 - i * 0.07, 0.42 + i * 0.2, 0.04), 0.04);
  }
  d += (fbm(x * 10, y * 10, z * 10) - 0.5) * 0.02;
  return d;
}
const fangShade = chitin([0.5, 0.43, 0.33]);

// ── Claws ────────────────────────────────────────────────────────────────────────────────────
function clawUpperField(x, y, z) {
  const bound = sdEllipsoid(x, y, z - 0.75, 0.75, 0.8, 1.4);
  if (bound > 0.25) return bound;
  let d = sdRoundCone(x, y, z, 0, 0, 0, 0, 0, 1.5, 0.29, 0.21);
  d = smin(d, sdSphere(x, y, z, 0.36), 0.16);
  d = smin(d, sdSphere(x, y, z - 1.5, 0.28), 0.14);
  d += ridge(z / 0.3 + 0.2, 6) * 0.045;
  for (let i = 0; i < 3; i++) d = smin(d, spineTo(x, y, z, 0, 0.28, 0.35 + i * 0.4, 0, 0.62, 0.1 + i * 0.4, 0.09), 0.08);
  d += flutes(x, y, 6, 0.06) + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.045;
  return d;
}
function clawForeField(x, y, z) {
  const bound = sdEllipsoid(x, y, z - 0.75, 0.75, 0.8, 1.35);
  if (bound > 0.25) return bound;
  let d = sdRoundCone(x, y, z, 0, 0, 0, 0, 0, 1.45, 0.25, 0.2);
  d = smin(d, sdSphere(x, y, z, 0.27), 0.14);
  d = smin(d, sdSphere(x, y, z - 1.45, 0.27), 0.14);
  d += ridge(z / 0.36 + 0.1, 6) * 0.04;
  for (let i = 0; i < 3; i++) d = smin(d, spineTo(x, y, z, 0, 0.26, 0.3 + i * 0.4, 0, 0.6, 0.05 + i * 0.4, 0.085), 0.08);
  for (let i = 0; i < 2; i++) d = smin(d, spineTo(abs(x), y, z, 0.24, 0.08, 0.5 + i * 0.5, 0.56, 0.2, 0.22 + i * 0.5, 0.07), 0.07);
  d += flutes(x, y, 6, 0.055) + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.045;
  return d;
}
/** Palm plus the fixed finger; `s` is the side (+1 right, -1 left) and the finger sits on the inside. */
function clawPalmField(s) {
  return (x, y, z) => {
    const bound = sdEllipsoid(x, y, z - 1.2, 0.8, 0.6, 1.5);
    if (bound > 0.25) return bound;
    let d = sdEllipsoid(x, y, z - 0.4, 0.42, 0.32, 0.66);
    d = smin(d, sdRoundCone(x, y, z, -0.16 * s, -0.03, 0.7, -0.2 * s, -0.03, 1.3, 0.2, 0.17), 0.14);
    d = smin(d, sdRoundCone(x, y, z, -0.2 * s, -0.03, 1.3, -0.11 * s, -0.03, 1.85, 0.17, 0.1), 0.1);
    d = smin(d, sdRoundCone(x, y, z, -0.11 * s, -0.03, 1.85, 0.01 * s, -0.03, 2.28, 0.1, 0.02), 0.08);
    for (let i = 0; i < 3; i++) {
      const zz = 1.28 + i * 0.24;
      d = smin(d, spineTo(x, y, z, (-0.17 + i * 0.03) * s, -0.03, zz, (-0.02 + i * 0.03) * s, -0.03, zz + 0.12, 0.05), 0.04);
    }
    d = smin(d, spineTo(x, y, z, 0, 0.3, 0.25, 0, 0.58, -0.05, 0.1), 0.08);
    d += flutes(x, y, 4, 0.03) * 0.6 + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.045;
    return d;
  };
}
/** The moving finger, in the pivot's frame: it runs along +Z and curves toward the inside. */
function clawFingerField(s) {
  return (x, y, z) => {
    const bound = sdEllipsoid(x, y, z - 0.75, 0.55, 0.4, 1.0);
    if (bound > 0.2) return bound;
    let d = sdRoundCone(x, y, z, 0, 0, 0, -0.04 * s, 0, 0.55, 0.18, 0.16);
    d = smin(d, sdRoundCone(x, y, z, -0.04 * s, 0, 0.55, -0.14 * s, 0, 1.1, 0.16, 0.1), 0.1);
    d = smin(d, sdRoundCone(x, y, z, -0.14 * s, 0, 1.1, -0.28 * s, 0, 1.52, 0.1, 0.02), 0.08);
    for (let i = 0; i < 3; i++) {
      const zz = 0.5 + i * 0.26;
      d = smin(d, spineTo(x, y, z, (-0.05 - i * 0.04) * s, 0, zz, (-0.17 - i * 0.04) * s, 0, zz + 0.12, 0.05), 0.04);
    }
    d += (fbm(x * 7, y * 7, z * 7) - 0.5) * 0.04;
    return d;
  };
}
const clawShade = chitin([0.26, 0.21, 0.17]);
const bladeShade = chitin([0.4, 0.33, 0.25]);

// ── Legs (along +Y) ───────────────────────────────────────────────────────────────────────────────
function legUpperField(x, y, z) {
  const bound = sdEllipsoid(x, y - 0.78, z, 0.7, 1.35, 0.7);
  if (bound > 0.25) return bound;
  let d = sdRoundCone(x, y, z, 0, 0, 0, 0, LEG_L1, 0, 0.29, 0.2);
  d = smin(d, sdSphere(x, y, z, 0.31), 0.18);
  d = smin(d, sdSphere(x, y - LEG_L1, z, 0.27), 0.16);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.09 + 0.4, c = cos(a), s = sin(a);
    d = smin(d, spineTo(x, y, z, c * 0.19, 0.55, s * 0.19, c * 0.5, 0.78, s * 0.5, 0.08), 0.06);
    d = smin(d, spineTo(x, y, z, c * 0.17, 1.05, s * 0.17, c * 0.44, 1.28, s * 0.44, 0.07), 0.06);
  }
  d += flutes(x, z, 3, 0.03) + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.045;
  return d;
}
function legLowerField(x, y, z) {
  const bound = sdEllipsoid(x, y - 1.1, z, 0.7, 1.65, 0.7);
  if (bound > 0.25) return bound;
  let d = sdRoundCone(x, y, z, 0, 0, 0, 0, LEG_L2, 0, 0.21, 0.065);
  d = smin(d, sdSphere(x, y, z, 0.24), 0.14);
  d = smin(d, sdRoundCone(x, y, z, 0, LEG_L2 - 0.05, 0, 0.0, LEG_L2 + 0.22, 0.12, 0.065, 0.015), 0.05);
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4, c = cos(a), s = sin(a), yy = 0.3 + i * 0.28;
    const r = 0.2 - i * 0.025;
    d = smin(d, spineTo(x, y, z, c * r, yy, s * r, c * (r + 0.26), yy + 0.22, s * (r + 0.26), 0.055), 0.05);
  }
  d += flutes(x, z, 3, 0.025) + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.04;
  return d;
}
const legShade = chitin([0.24, 0.19, 0.15]);

// ── Tail segments (along +Z) and the stinger ─────────────────────────────────────────────────────
function tailField(i) {
  const len = TAIL_LEN[i], r0 = TAIL_R[i], r1 = TAIL_R[i + 1];
  return (x, y, z) => {
    const bound = sdEllipsoid(x, y, z - len * 0.5, r0 + 0.7, r0 + 0.7, len * 0.5 + 0.6);
    if (bound > 0.25) return bound;
    let d = sdRoundCone(x, y, z, 0, 0, 0, 0, 0, len, r0, r1);
    d = smin(d, sdSphere(x, y, z - len, r1 * 1.12), 0.14);
    d = smin(d, sdSphere(x, y, z, r0 * 0.98), 0.14);
    d = smin(d, spineTo(x, y, z, 0, r0 * 0.85, len * 0.25, 0, r0 * 0.85 + 0.42, len * 0.62, 0.1), 0.08);
    d = smin(d, spineTo(abs(x), y, z, r0 * 0.8, r0 * 0.25, len * 0.55, r0 * 0.8 + 0.3, r0 * 0.3, len * 0.8, 0.06), 0.06);
    d += flutes(x, y, 5, 0.045) * 0.8 + (fbm(x * 6, y * 6, z * 6) - 0.5) * 0.05;
    return d;
  };
}
const tailShade = chitin([0.25, 0.2, 0.16], (o, x, y, z, nx, ny, nz, ao) => {
  if (ao < 0.55) o[4] = (0.55 - ao) * 0.6;
});

function stingerField(x, y, z) {
  const bound = sdEllipsoid(x, y + 0.3, z - 0.6, 0.8, 1.2, 1.2);
  if (bound > 0.2) return bound;
  let d = sdEllipsoid(x, y, z - 0.1, 0.3, 0.3, 0.44);
  d = smin(d, sdRoundCone(x, y, z, 0, -0.02, 0.35, 0, -0.12, 0.8, 0.17, 0.13), 0.12);
  d = smin(d, sdRoundCone(x, y, z, 0, -0.12, 0.8, 0, -0.35, 1.15, 0.13, 0.06), 0.08);
  d = smin(d, sdRoundCone(x, y, z, 0, -0.35, 1.15, 0, -0.7, 1.35, 0.06, 0.012), 0.06);
  d = smin(d, spineTo(abs(x), y, z, 0.15, -0.05, 0.5, 0.42, -0.3, 0.65, 0.06), 0.05);
  d += (fbm(x * 8, y * 8, z * 8) - 0.5) * 0.04;
  return d;
}
const stingerShade = (o, x, y, z, nx, ny, nz, ao) => {
  const wear = 0.8 + 0.4 * vnoise(x * 5, y * 5, z * 5);
  if (z < 0.5) {
    o[0] = 0.3 * wear; o[1] = 0.07 * wear; o[2] = 0.03 * wear;
    o[5] = 0.6 + 0.4 * vnoise(x * 7, y * 7, z * 7);
  } else {
    const k = (0.3 + 0.7 * ao) * wear;
    o[0] = 0.36 * k; o[1] = 0.3 * k; o[2] = 0.23 * k;
    o[5] = clamp(1.2 - z, 0, 0.5) * 0.4;
  }
};

let cache = null;

/** Builds (once) and returns every sculpted part. Takes a moment (about a second), so it happens at map build. */
export function getBossParts(THREE) {
  if (cache) return cache;
  const t0 = performance.now();
  const parts = {
    body: meshField(THREE, bodyField, [-1.75, -0.95, -3.85], [1.75, 1.5, 3.3], 0.085, bodyShade),
    plate: meshField(THREE, plateField, [-0.95, -0.1, -0.7], [0.95, 0.65, 0.7], 0.04, plateShade),
    core: meshField(THREE, coreField, [-0.5, -0.45, -0.5], [0.5, 0.55, 0.5], 0.03, coreShade),
    fang: meshField(THREE, fangField, [-0.4, -0.7, -0.2], [0.4, 0.3, 1.25], 0.03, fangShade),
    clawUpper: meshField(THREE, clawUpperField, [-0.75, -0.8, -0.55], [0.75, 0.85, 1.95], 0.05, clawShade),
    clawFore: meshField(THREE, clawForeField, [-0.7, -0.75, -0.5], [0.7, 0.85, 1.95], 0.05, clawShade),
    clawPalm: [-1, 1].map((s) => meshField(THREE, clawPalmField(s), [-0.75, -0.65, -0.45], [0.75, 0.7, 2.45], 0.045, bladeShade)),
    clawFinger: [-1, 1].map((s) => meshField(THREE, clawFingerField(s), [-0.55, -0.4, -0.3], [0.55, 0.4, 1.65], 0.035, bladeShade)),
    legUpper: meshField(THREE, legUpperField, [-0.75, -0.45, -0.75], [0.75, LEG_L1 + 0.45, 0.75], 0.05, legShade),
    legLower: meshField(THREE, legLowerField, [-0.75, -0.4, -0.75], [0.75, LEG_L2 + 0.5, 0.75], 0.05, legShade),
    tail: TAIL_LEN.map((len, i) => meshField(THREE, tailField(i), [-TAIL_R[i] - 0.75, -TAIL_R[i] - 0.4, -0.5], [TAIL_R[i] + 0.75, TAIL_R[i] + 0.8, len + 0.5], 0.05, tailShade)),
    stinger: meshField(THREE, stingerField, [-0.65, -0.95, -0.55], [0.65, 0.5, 1.6], 0.035, stingerShade),
  };
  parts.buildMs = Math.round(performance.now() - t0);
  cache = parts;
  return parts;
}
