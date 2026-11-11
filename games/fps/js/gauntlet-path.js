/*
 * Free-form course geometry. A course is a ribbon that can turn by any angle and climb or
 * descend, so decks are no longer boxes laid down -Z.
 *
 *   heading th   0 = toward -Z, positive turns right (toward +X)
 *   forward      (sin th, -cos th)        right  (cos th, sin th)
 *
 * What is drawn (a smooth swept ribbon, cut into short chunks so bullet rays can skip most of
 * it) and what is walked on (many thin axis-aligned slabs that follow the ribbon) are separate:
 * the game's collision is axis-aligned, and thin slices along the dominant axis of travel keep
 * the walkable edge within half a metre of the drawn one at any angle.
 */
const TAU = Math.PI * 2;

export const DEG = Math.PI / 180;
/** Walkway samples sit this far apart along the path. */
export const STATION = 0.5;

export const forwardOf = th => [Math.sin(th), -Math.cos(th)];
export const rightOf = th => [Math.cos(th), Math.sin(th)];

/** Walk `len` metres (horizontal) while turning `turn` radians and climbing `rise`. */
export function trace(pen, { len, turn = 0, rise = 0 }, ds = STATION) {
  const n = Math.max(1, Math.ceil(len / ds));
  const step = len / n, k = turn / n, dy = rise / n;
  const samples = [{ x: pen.x, y: pen.y, z: pen.z, th: pen.th, arc: pen.arc }];
  let { x, y, z, th, arc } = pen;
  for (let i = 0; i < n; i++) {
    const mid = th + k / 2;
    x += Math.sin(mid) * step;
    z -= Math.cos(mid) * step;
    y += dy;
    th += k;
    arc += step;
    samples.push({ x, y, z, th, arc });
  }
  return { samples, end: { x, y, z, th, arc } };
}

/** Sample at `arc` metres along a trace (linear). */
export function sampleAt(samples, arc) {
  const first = samples[0].arc;
  const i = Math.max(0, Math.min(samples.length - 2, Math.floor((arc - first) / STATION)));
  const a = samples[i], b = samples[i + 1];
  const t = Math.max(0, Math.min(1, (arc - a.arc) / ((b.arc - a.arc) || 1)));
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t, th: a.th + (b.th - a.th) * t, arc };
}

/**
 * Where the course already is, as circles on the ground with a height. A new stretch of path
 * may not run through one unless it is well above or below it; the planner uses it to fold a
 * long course back on itself without ever intersecting.
 */
export class Footprints {
  constructor() { this.items = []; }
  copy() { const c = new Footprints(); c.items = this.items.slice(); return c; }
  /** Circles along a trace every `every` metres. */
  addTrace(samples, r, id = 0, every = 2) {
    const stride = Math.max(1, Math.round(every / STATION));
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i];
      this.items.push({ x: s.x, y: s.y, z: s.z, r, arc: s.arc, id });
    }
    const last = samples[samples.length - 1];
    this.items.push({ x: last.x, y: last.y, z: last.z, r, arc: last.arc, id });
  }
  /** A straight, axis-aligned stretch (rooms, gatehouses, mechanics). */
  addStraight(x, y, z0, z1, r, arc, id = 0, every = 3) {
    const n = Math.max(1, Math.ceil(Math.abs(z1 - z0) / every));
    for (let i = 0; i <= n; i++) this.items.push({ x, y, z: z0 + (z1 - z0) * i / n, r, arc, id });
  }
  /** A flat circle that blocks every height (the invisible door barrier). */
  addBlocker(x, z, r) { this.items.push({ x, y: 0, z, r, arc: -1e9, id: -1, any: true }); }
  conflicts(samples, r, { ignoreArc = 36, clearY = 13, every = 2, anyY = false } = {}) {
    const stride = Math.max(1, Math.round(every / STATION));
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i];
      for (const it of this.items) {
        if (!it.any && !anyY && Math.abs(it.y - s.y) > clearY) continue;
        if (!it.any && Math.abs(it.arc - s.arc) < ignoreArc) continue;
        const dx = it.x - s.x, dz = it.z - s.z, rr = it.r + r;
        if (dx * dx + dz * dz < rr * rr) return true;
      }
    }
    return false;
  }
}

/** Horizontal clearance between two path samples. */
export const gap = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ---------------------------------------------------------------------------------------------
// Collision slabs
// ---------------------------------------------------------------------------------------------

function clipPolygon(poly, axis, lo, hi) {
  const run = (pts, keep) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const ka = keep(a), kb = keep(b);
      if (ka) out.push(a);
      if (ka !== kb) {
        const va = axis === 0 ? a[0] : a[1], vb = axis === 0 ? b[0] : b[1];
        const edge = keep.edge, t = (edge - va) / ((vb - va) || 1e-9);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
      }
    }
    return out;
  };
  const geLo = p => (axis === 0 ? p[0] : p[1]) >= lo; geLo.edge = lo;
  const leHi = p => (axis === 0 ? p[0] : p[1]) <= hi; leHi.edge = hi;
  let out = run(poly, geLo);
  if (out.length >= 3) out = run(out, leHi);
  return out;
}

/**
 * Axis-aligned slabs covering a band that follows `samples`: lateral `offset` of its centre,
 * `width`, and a vertical extent from `bottom` to `top` relative to the path's height. Returns
 * [{ minX, maxX, minY, maxY, minZ, maxZ }].
 */
export function slabBoxes(samples, { offset = 0, width, bottom = -1.4, top = 0, step = 0.5 }) {
  const boxes = [];
  if (samples.length < 2) return boxes;
  const hw = width / 2;
  const edge = (s, side) => {
    const o = offset + side * hw;
    return [s.x + Math.cos(s.th) * o, s.z + Math.sin(s.th) * o, s.y];
  };
  const axisOf = (a, b) => (Math.abs(Math.sin((a.th + b.th) / 2)) > Math.abs(Math.cos((a.th + b.th) / 2)) ? 0 : 1);
  let from = 0;
  while (from < samples.length - 1) {
    const axis = axisOf(samples[from], samples[from + 1]);
    let to = from + 1;
    while (to < samples.length - 1 && axisOf(samples[to], samples[to + 1]) === axis) to++;
    const left = [], right = [];
    for (let i = from; i <= to; i++) { left.push(edge(samples[i], -1)); right.push(edge(samples[i], 1)); }
    const poly = left.concat(right.reverse());
    let lo = Infinity, hi = -Infinity;
    for (const p of poly) { const v = axis === 0 ? p[0] : p[1]; if (v < lo) lo = v; if (v > hi) hi = v; }
    for (let s = lo; s < hi - 1e-6; s += step) {
      const piece = clipPolygon(poly, axis, s, Math.min(hi, s + step));
      if (piece.length < 3) continue;
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, y = 0;
      for (const p of piece) {
        if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
        if (p[1] < z0) z0 = p[1]; if (p[1] > z1) z1 = p[1];
        y += p[2];
      }
      y /= piece.length;
      if (x1 - x0 < 0.02 || z1 - z0 < 0.02) continue;
      // A slice crosses the band at an angle, so on a slope the surface climbs across it. One flat
      // box would sit up to a quarter of a metre off the drawn deck (and leave steps between
      // neighbours), so a sloping slice is cut into cells across its width, each at its own height.
      const o = axis === 0 ? 1 : 0;
      let lo2 = piece[0], hi2 = piece[0];
      for (const p of piece) { if (p[o] < lo2[o]) lo2 = p; if (p[o] > hi2[o]) hi2 = p; }
      const rise = hi2[2] - lo2[2], span = hi2[o] - lo2[o];
      const cells = Math.min(48, Math.max(1, Math.ceil(Math.abs(rise) / 0.1)));
      const oMin = o === 0 ? x0 : z0, oMax = o === 0 ? x1 : z1;
      for (let c = 0; c < cells; c++) {
        const c0 = oMin + (oMax - oMin) * c / cells, c1 = oMin + (oMax - oMin) * (c + 1) / cells;
        const yc = span > 1e-6 ? y + rise * (((c0 + c1) / 2 - (oMin + oMax) / 2) / span) : y;
        boxes.push({
          minX: o === 0 ? c0 : x0, maxX: o === 0 ? c1 : x1, minZ: o === 1 ? c0 : z0, maxZ: o === 1 ? c1 : z1,
          minY: yc + bottom, maxY: yc + top,
        });
      }
    }
    from = to;
  }
  return boxes;
}

// ---------------------------------------------------------------------------------------------
// Drawn ribbons
// ---------------------------------------------------------------------------------------------

export function createPathGeometry(THREE) {
  /** One closed ribbon (top, underside, both sides, optional end caps) as flat-shaded triangles. */
  function sweep(samples, { offset = 0, width, bottom = -1, top = 0, tile = 3, startCap = true, endCap = true, alongArc0 = 0, alongLen = 0 }) {
    const hw = width / 2;
    const pos = [], uv = [];
    const corner = (s, side, yRel) => {
      const o = offset + side * hw;
      return [s.x + Math.cos(s.th) * o, s.y + yRel, s.z + Math.sin(s.th) * o];
    };
    const quad = (a, b, c, d, ua, ub, uc, ud) => {
      pos.push(...a, ...b, ...c, ...a, ...c, ...d);
      uv.push(...ua, ...ub, ...uc, ...ua, ...uc, ...ud);
    };
    const lat = side => (offset + side * hw) / tile;
    for (let i = 0; i < samples.length - 1; i++) {
      const s0 = samples[i], s1 = samples[i + 1];
      const a0 = s0.arc / tile, a1 = s1.arc / tile;
      const Lt0 = corner(s0, -1, top), Rt0 = corner(s0, 1, top), Lb0 = corner(s0, -1, bottom), Rb0 = corner(s0, 1, bottom);
      const Lt1 = corner(s1, -1, top), Rt1 = corner(s1, 1, top), Lb1 = corner(s1, -1, bottom), Rb1 = corner(s1, 1, bottom);
      if (alongLen) {
        // Painted bands: the texture runs along the path, one stripe cycle per 2 m.
        const p0 = (s0.arc - alongArc0) / alongLen, p1 = (s1.arc - alongArc0) / alongLen;
        quad(Lt0, Rt0, Rt1, Lt1, [p0, 0], [p0, 1], [p1, 1], [p1, 0]);
      } else quad(Lt0, Rt0, Rt1, Lt1, [lat(-1), a0], [lat(1), a0], [lat(1), a1], [lat(-1), a1]);
      quad(Lb0, Lb1, Rb1, Rb0, [lat(-1), a0], [lat(-1), a1], [lat(1), a1], [lat(1), a0]);
      quad(Rt0, Rb0, Rb1, Rt1, [a0, top / tile], [a0, bottom / tile], [a1, bottom / tile], [a1, top / tile]);
      quad(Lt0, Lt1, Lb1, Lb0, [a0, top / tile], [a1, top / tile], [a1, bottom / tile], [a0, bottom / tile]);
    }
    const cap = (s, front) => {
      const Lt = corner(s, -1, top), Rt = corner(s, 1, top), Lb = corner(s, -1, bottom), Rb = corner(s, 1, bottom);
      const u = (side, y) => [lat(side), y / tile];
      if (front) quad(Lt, Lb, Rb, Rt, u(-1, top), u(-1, bottom), u(1, bottom), u(1, top));
      else quad(Lt, Rt, Rb, Lb, u(-1, top), u(1, top), u(1, bottom), u(-1, bottom));
    };
    if (startCap) cap(samples[0], true);
    if (endCap) cap(samples[samples.length - 1], false);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    return geometry;
  }

  /**
   * The same ribbon cut into pieces of about `maxLen` metres. Bullet and line-of-sight rays test
   * every triangle of any mesh whose bounding sphere they cross, so one long ribbon would cost
   * far too much; short pieces are skipped in bulk.
   */
  function sweepChunks(samples, options, maxLen = 14) {
    const per = Math.max(2, Math.round(maxLen / STATION));
    const out = [];
    if (options.alongLen) options = { ...options, alongArc0: samples[0].arc };
    for (let i = 0; i < samples.length - 1; i += per) {
      const j = Math.min(samples.length - 1, i + per);
      out.push({
        from: i, to: j,
        geometry: sweep(samples.slice(i, j + 1), { ...options, startCap: i === 0 && options.startCap !== false, endCap: j === samples.length - 1 && options.endCap !== false }),
      });
    }
    return out;
  }

  return { sweep, sweepChunks };
}

export { TAU };
