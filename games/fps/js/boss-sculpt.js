/*
 * Sculpting toolkit for the boss: signed-distance shapes blended smoothly together, turned into a
 * triangle mesh with surface nets. Nothing here is a primitive mesh: every part of the creature is a
 * field (smooth unions of tapered cones and blobs, carved grooves, pitting from noise, spines) that is
 * sampled on a grid and meshed once, with per-vertex colour (baked ambient occlusion and wear) and
 * glow channels for the eyes, veins and core.
 *
 * A field is a function (x, y, z) -> distance: negative inside the shape, positive outside.
 */

const { sqrt, abs, min, max, floor, cos, sin, atan2, pow } = Math;

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const mix = (a, b, t) => a + (b - a) * t;
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/** Smooth minimum (union with a rounded join of width k) and maximum (intersection / carve). */
export const smin = (a, b, k) => { const h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * 0.25; };
export const smax = (a, b, k) => { const h = max(k - abs(a - b), 0) / k; return max(a, b) + h * h * k * 0.25; };

// ── Shapes ──────────────────────────────────────────────────────────────────
export function sdEllipsoid(x, y, z, rx, ry, rz) {
  const ax = x / rx, ay = y / ry, az = z / rz;
  const k0 = sqrt(ax * ax + ay * ay + az * az);
  const bx = ax / rx, by = ay / ry, bz = az / rz;
  const k1 = sqrt(bx * bx + by * by + bz * bz);
  return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -min(rx, ry, rz);
}

export function sdSphere(x, y, z, r) { return sqrt(x * x + y * y + z * z) - r; }

/** A cone with rounded ends: radius r1 at a, r2 at b. */
export function sdRoundCone(x, y, z, ax, ay, az, bx, by, bz, r1, r2) {
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pax = x - ax, pay = y - ay, paz = z - az;
  const dy = pax * bax + pay * bay + paz * baz;
  const dz = dy - l2;
  const ex = pax * l2 - bax * dy, ey = pay * l2 - bay * dy, ez = paz * l2 - baz * dy;
  const x2 = ex * ex + ey * ey + ez * ez;
  const y2 = dy * dy * l2, z2 = dz * dz * l2;
  const k = (rr < 0 ? -1 : 1) * rr * rr * x2;
  if ((dz < 0 ? -1 : 1) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if ((dy < 0 ? -1 : 1) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + dy * rr) * il2 - r1;
}

/** A thin tapering spike from a to b (base radius r). */
export function sdSpike(x, y, z, ax, ay, az, bx, by, bz, r) {
  return sdRoundCone(x, y, z, ax, ay, az, bx, by, bz, r, r * 0.06);
}

// ── Noise ───────────────────────────────────────────────────────────────────
function hash3(ix, iy, iz) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function vnoise(x, y, z) {
  const ix = floor(x), iy = floor(y), iz = floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const a = hash3(ix, iy, iz), b = hash3(ix + 1, iy, iz), c = hash3(ix, iy + 1, iz), d = hash3(ix + 1, iy + 1, iz);
  const e = hash3(ix, iy, iz + 1), f = hash3(ix + 1, iy, iz + 1), g = hash3(ix, iy + 1, iz + 1), h = hash3(ix + 1, iy + 1, iz + 1);
  const x0 = a + (b - a) * fx, x1 = c + (d - c) * fx, x2 = e + (f - e) * fx, x3 = g + (h - g) * fx;
  const y0 = x0 + (x1 - x0) * fy, y1 = x2 + (x3 - x2) * fy;
  return y0 + (y1 - y0) * fz;
}

export function fbm(x, y, z) {
  return vnoise(x, y, z) * 0.58 + vnoise(x * 2.07, y * 2.07, z * 2.07) * 0.28 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.14;
}

/** Sharp ridges in 0..1: 1 along the lines where the field's phase crosses an integer. */
export const ridge = (phase, sharp) => pow(1 - abs(sin(phase * Math.PI)), sharp);

// ── Mesher ──────────────────────────────────────────────────────────────────
/**
 * Mesh a field with naive surface nets.
 *   field(x, y, z) -> signed distance
 *   min / max      -> [x, y, z] bounds to sample
 *   cell           -> grid size in the same units
 *   shade(out, x, y, z, nx, ny, nz, ao) fills out[0..5] = r, g, b, eyeGlow, veinGlow, coreGlow
 * Returns a BufferGeometry with position, normal, color (3) and glow (3) attributes.
 */
export function meshField(THREE, field, lo, hi, cell, shade) {
  const nx = Math.ceil((hi[0] - lo[0]) / cell) + 1;
  const ny = Math.ceil((hi[1] - lo[1]) / cell) + 1;
  const nz = Math.ceil((hi[2] - lo[2]) / cell) + 1;
  const vals = new Float32Array(nx * ny * nz);
  const at = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) {
    const z = lo[2] + k * cell;
    for (let j = 0; j < ny; j++) {
      const y = lo[1] + j * cell;
      for (let i = 0; i < nx; i++) vals[at(i, j, k)] = field(lo[0] + i * cell, y, z);
    }
  }
  const cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const cellIndex = new Int32Array(cx * cy * cz).fill(-1);
  const cid = (i, j, k) => i + cx * (j + cy * k);
  const pos = [];
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cv = new Float32Array(8);
  for (let k = 0; k < cz; k++) {
    for (let j = 0; j < cy; j++) {
      for (let i = 0; i < cx; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const v = vals[at(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))];
          cv[c] = v;
          if (v < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (let e = 0; e < 12; e++) {
          const a = EDGES[e][0], b = EDGES[e][1];
          const va = cv[a], vb = cv[b];
          if ((va < 0) === (vb < 0)) continue;
          const t = va / (va - vb);
          sx += (a & 1) + ((b & 1) - (a & 1)) * t;
          sy += ((a >> 1) & 1) + (((b >> 1) & 1) - ((a >> 1) & 1)) * t;
          sz += ((a >> 2) & 1) + (((b >> 2) & 1) - ((a >> 2) & 1)) * t;
          n++;
        }
        cellIndex[cid(i, j, k)] = pos.length / 3;
        pos.push(lo[0] + (i + sx / n) * cell, lo[1] + (j + sy / n) * cell, lo[2] + (k + sz / n) * cell);
      }
    }
  }
  const idx = [];
  const quad = (c0, c1, c2, c3, outward) => {
    const a = cellIndex[c0], b = cellIndex[c1], c = cellIndex[c2], d = cellIndex[c3];
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    // Wind the quad so its normal faces out of the shape along the edge direction `outward` (+1 / -1 on `axis`).
    const abx = pos[b * 3] - pos[a * 3], aby = pos[b * 3 + 1] - pos[a * 3 + 1], abz = pos[b * 3 + 2] - pos[a * 3 + 2];
    const acx = pos[c * 3] - pos[a * 3], acy = pos[c * 3 + 1] - pos[a * 3 + 1], acz = pos[c * 3 + 2] - pos[a * 3 + 2];
    const nxv = aby * acz - abz * acy, nyv = abz * acx - abx * acz, nzv = abx * acy - aby * acx;
    const dot = nxv * outward[0] + nyv * outward[1] + nzv * outward[2];
    if (dot >= 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c);
  };
  const OUT = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const neg = [[-1, 0, 0], [0, -1, 0], [0, 0, -1]];
  for (let k = 1; k < nz - 1; k++) {
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        const v0 = vals[at(i, j, k)] < 0;
        // X edge (i,j,k)-(i+1,j,k): cells (i, j-1..j, k-1..k)
        if (i < cx && v0 !== (vals[at(i + 1, j, k)] < 0)) {
          quad(cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k), v0 ? OUT[0] : neg[0]);
        }
        if (j < cy && v0 !== (vals[at(i, j + 1, k)] < 0)) {
          quad(cid(i - 1, j, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i - 1, j, k), v0 ? OUT[1] : neg[1]);
        }
        if (k < cz && v0 !== (vals[at(i, j, k + 1)] < 0)) {
          quad(cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k), v0 ? OUT[2] : neg[2]);
        }
      }
    }
  }
  const count = pos.length / 3;
  const position = new Float32Array(count * 3), normal = new Float32Array(count * 3);
  const color = new Float32Array(count * 3), glow = new Float32Array(count * 3);
  const h = cell * 0.6, out = new Float32Array(6);
  const grad = (x, y, z, o) => {
    const gx = field(x + h, y, z) - field(x - h, y, z);
    const gy = field(x, y + h, z) - field(x, y - h, z);
    const gz = field(x, y, z + h) - field(x, y, z - h);
    const l = sqrt(gx * gx + gy * gy + gz * gz) || 1;
    o[0] = gx / l; o[1] = gy / l; o[2] = gz / l;
  };
  const nrm = new Float32Array(3);
  for (let v = 0; v < count; v++) {
    let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    // One projection step onto the true surface sharpens thin spikes that averaging would pull inward.
    grad(x, y, z, nrm);
    const d0 = field(x, y, z);
    x -= nrm[0] * d0 * 0.9; y -= nrm[1] * d0 * 0.9; z -= nrm[2] * d0 * 0.9;
    // (The normal stays from the pre-projection gradient: one fewer six-sample pass per vertex.)
    position[v * 3] = x; position[v * 3 + 1] = y; position[v * 3 + 2] = z;
    normal[v * 3] = nrm[0]; normal[v * 3 + 1] = nrm[1]; normal[v * 3 + 2] = nrm[2];
    // Ambient occlusion: how much of a 0.35 shell above the surface is open.
    const ao = clamp(field(x + nrm[0] * 0.35, y + nrm[1] * 0.35, z + nrm[2] * 0.35) / 0.35, 0, 1);
    out[0] = out[1] = out[2] = 0.5; out[3] = out[4] = out[5] = 0;
    shade(out, x, y, z, nrm[0], nrm[1], nrm[2], ao);
    color[v * 3] = out[0]; color[v * 3 + 1] = out[1]; color[v * 3 + 2] = out[2];
    glow[v * 3] = out[3]; glow[v * 3 + 1] = out[4]; glow[v * 3 + 2] = out[5];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(position, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  g.setAttribute("color", new THREE.BufferAttribute(color, 3));
  g.setAttribute("glow", new THREE.BufferAttribute(glow, 3));
  g.setIndex(new THREE.BufferAttribute(count > 65000 ? new Uint32Array(idx) : new Uint16Array(idx), 1));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}
