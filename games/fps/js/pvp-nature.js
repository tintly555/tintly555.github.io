/*
 * Natural things for the PVP maps: a sky with a sun and moving clouds, image-based light cut from
 * that sky, real foliage (leaf cards on branching trees, ferns, grass, vines), shallow rippling
 * water with foam, and rocks that are not boxes. Everything is generated: no image files.
 *
 * Foliage is built the way games do it: alpha-tested leaf cards on real branches, merged into a
 * handful of meshes, with wind in the vertex shader. A tree is a trunk that bends and flares into
 * roots, forks into limbs, and carries clumps of leaves — never a cone.
 */
import { mergeGeometries } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/utils/BufferGeometryUtils.js";
import { fbm, rngFor } from "./gauntlet-surfaces.js?v=2";
import { TEMPLE_WATER_GLSL, TEMPLE_WATER_Y, templeWaterGeometry } from "./water-shape.js";

const TAU = Math.PI * 2;

export function createNature(THREE) {
  const textures = new Map();
  const windTime = { value: 0 };

  function canvasTexture(key, w, h, draw, { srgb = true, repeat = false, aniso = 8 } = {}) {
    if (textures.has(key)) return textures.get(key);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
    t.userData.shared = true;
    textures.set(key, t);
    return t;
  }

  // ── Mesh builder for cards and tubes ─────────────────────────────────────────────
  class Mesher {
    constructor() { this.pos = []; this.nor = []; this.uv = []; this.col = []; this.idx = []; }
    get count() { return this.pos.length / 3; }
    vert(x, y, z, nx, ny, nz, u, v, r = 1, g = 1, b = 1) {
      this.pos.push(x, y, z); this.nor.push(nx, ny, nz); this.uv.push(u, v); this.col.push(r, g, b);
    }
    /** A leaf card centred on (cx, cy, cz): size w × h, turned by yaw/pitch/roll, sampling the uv rect. */
    card(cx, cy, cz, w, h, yaw, pitch, roll, rect, tint, around = null) {
      const m = Mesher.m || (Mesher.m = new THREE.Matrix4()), e = Mesher.e || (Mesher.e = new THREE.Euler()), p = Mesher.p || (Mesher.p = new THREE.Vector3()), n0 = Mesher.n || (Mesher.n = new THREE.Vector3());
      e.set(pitch, yaw, roll, "YXZ"); m.makeRotationFromEuler(e);
      const base = this.count;
      const [u0, v0, u1, v1] = rect;
      n0.set(0, 0, 1).applyMatrix4(m);
      // A card whose front faces into the clump would be lit backwards (double-sided faces flip the normal),
      // so wind it the other way round: the side that faces out of the clump is always the front.
      const flip = around ? n0.x * (cx - around[0]) + n0.y * (cy - around[1]) + n0.z * (cz - around[2]) < 0 : false;
      const hw = w / 2, hh = h / 2;
      const corners = [-hw, -hh, u0, v0, hw, -hh, u1, v0, hw, hh, u1, v1, -hw, hh, u0, v1];
      for (let k = 0; k < 16; k += 4) {
        p.set(corners[k], corners[k + 1], 0).applyMatrix4(m);
        let nx = n0.x, ny = n0.y, nz = n0.z;
        if (around) {
          // Shade a clump like a ball: normals lean away from its centre, so it has a lit and a dark side.
          const dx = cx + p.x - around[0], dy = cy + p.y - around[1], dz = cz + p.z - around[2], l = Math.hypot(dx, dy, dz) || 1;
          nx = dx / l * 0.8 + n0.x * 0.2; ny = dy / l * 0.8 + n0.y * 0.2 + 0.15; nz = dz / l * 0.8 + n0.z * 0.2;
        }
        this.vert(cx + p.x, cy + p.y, cz + p.z, nx, ny, nz, corners[k + 2], corners[k + 3], tint[0], tint[1], tint[2]);
      }
      if (flip) this.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
      else this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    /**
     * A smooth tube through `pts` ([x, y, z] each) with a radius per point: rings carried along the path
     * without twisting, so a bending trunk or a curving limb has no kinks. v runs along the length.
     */
    sweep(pts, radii, seg = 10, uvScale = 1, tint = [1, 1, 1]) {
      const n = pts.length;
      if (n < 2) return;
      const T = [];
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], l = Math.hypot(dx, dy, dz) || 1;
        T.push([dx / l, dy / l, dz / l]);
      }
      let nx = Math.abs(T[0][1]) > 0.9 ? 1 : 0, ny = Math.abs(T[0][1]) > 0.9 ? 0 : 1, nz = 0;
      const base = this.count;
      let v = 0;
      for (let i = 0; i < n; i++) {
        const t = T[i], d = nx * t[0] + ny * t[1] + nz * t[2];
        nx -= t[0] * d; ny -= t[1] * d; nz -= t[2] * d;
        const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
        const bx = t[1] * nz - t[2] * ny, by = t[2] * nx - t[0] * nz, bz = t[0] * ny - t[1] * nx;
        if (i) v += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]) * 0.4 * uvScale;
        const r = radii[i];
        for (let k = 0; k <= seg; k++) {
          const ang = k / seg * TAU, c = Math.cos(ang), s = Math.sin(ang);
          const ox = nx * c + bx * s, oy = ny * c + by * s, oz = nz * c + bz * s;
          this.vert(pts[i][0] + ox * r, pts[i][1] + oy * r, pts[i][2] + oz * r, ox, oy, oz, k / seg * uvScale * Math.max(0.5, radii[0]) * 2, v, tint[0], tint[1], tint[2]);
        }
      }
      for (let i = 0; i < n - 1; i++) for (let k = 0; k < seg; k++) {
        const a0 = base + i * (seg + 1) + k, a1 = a0 + 1, b0 = a0 + seg + 1, b1 = b0 + 1;
        this.idx.push(a0, a1, b0, a1, b1, b0);   // outward-facing
      }
    }
    /** A tapered tube from a to b. */
    tube(a, b, r0, r1, seg = 7, uvScale = 1, tint = [1, 1, 1]) {
      const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = dir.length();
      if (len < 1e-4) return;
      dir.normalize();
      const up = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const s = new THREE.Vector3().crossVectors(dir, up).normalize(), t = new THREE.Vector3().crossVectors(dir, s).normalize();
      const base = this.count;
      for (let k = 0; k <= seg; k++) {
        const ang = k / seg * TAU, cx = Math.cos(ang), cy = Math.sin(ang);
        const nx = s.x * cx + t.x * cy, ny = s.y * cx + t.y * cy, nz = s.z * cx + t.z * cy;
        this.vert(a[0] + nx * r0, a[1] + ny * r0, a[2] + nz * r0, nx, ny, nz, k / seg * uvScale * r0 * 2, 0, tint[0], tint[1], tint[2]);
        this.vert(b[0] + nx * r1, b[1] + ny * r1, b[2] + nz * r1, nx, ny, nz, k / seg * uvScale * r0 * 2, len * uvScale * 0.4, tint[0], tint[1], tint[2]);
      }
      for (let k = 0; k < seg; k++) {
        const i = base + k * 2;
        this.idx.push(i, i + 2, i + 1, i + 1, i + 2, i + 3);   // outward-facing
      }
    }
    toMesh(material, { cast = true, receive = true } = {}) {
      if (!this.idx.length) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(this.uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
      g.setIndex(this.idx);
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, material);
      mesh.castShadow = cast; mesh.receiveShadow = receive;
      mesh.raycast = () => {};
      return mesh;
    }
  }

  // ── Textures ─────────────────────────────────────────────────────────────────────
  /** A 2×2 atlas of leaf sprays: many small broad leaves on slim twigs, soft in colour (veins barely there). */
  function leafAtlas() {
    return canvasTexture("leaf-atlas", 512, 512, (g, W, H) => {
      const rnd = rngFor(5);
      g.clearRect(0, 0, W, H);
      const leaf = (x, y, len, wid, ang, hue) => {
        g.save(); g.translate(x, y); g.rotate(ang);
        const l0 = 26 + rnd() * 7;
        const grad = g.createLinearGradient(0, -wid, 0, wid);       // lighter along one edge, like a leaf turned to the sun
        grad.addColorStop(0, `hsl(${hue - 4},46%,${l0 + 9}%)`); grad.addColorStop(0.55, `hsl(${hue},48%,${l0 + 3}%)`); grad.addColorStop(1, `hsl(${hue + 4},44%,${l0 - 3}%)`);
        g.fillStyle = grad;
        g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * 0.18, -wid * 1.05, len * 0.72, -wid * 0.95, len, 0); g.bezierCurveTo(len * 0.72, wid * 0.95, len * 0.18, wid * 1.05, 0, 0); g.fill();
        g.strokeStyle = "rgba(16,36,10,.2)"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(len * 0.94, 0); g.stroke();
        g.restore();
      };
      for (let cell = 0; cell < 4; cell++) {
        const ox = (cell % 2) * 256, oy = Math.floor(cell / 2) * 256, hue = 96 + cell * 6;
        g.save(); g.beginPath(); g.rect(ox, oy, 256, 256); g.clip(); g.translate(ox, oy);
        for (let t = 0; t < 5 + cell % 2; t++) {
          const base = -Math.PI / 2 + (t - 2.5) * 0.4 + (rnd() - 0.5) * 0.18;
          const x0 = 128 + (t - 2.5) * 16, y0 = 252, L = 150 + rnd() * 70;
          g.strokeStyle = "rgba(78,58,38,.85)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(base) * L, y0 + Math.sin(base) * L); g.stroke();
          for (let k = 0; k < 15; k++) {
            const f = 0.12 + k / 17, px = x0 + Math.cos(base) * L * f, py = y0 + Math.sin(base) * L * f, len = 26 + rnd() * 14 - f * 6, wid = 8 + rnd() * 4;
            leaf(px, py, len, wid, base + 0.95 + rnd() * 0.35, hue + (rnd() - 0.5) * 8);
            leaf(px, py, len, wid, base - 0.95 - rnd() * 0.35, hue + (rnd() - 0.5) * 8);
          }
          leaf(x0 + Math.cos(base) * L, y0 + Math.sin(base) * L, 34, 10, base, hue);
        }
        g.restore();
      }
    });
  }
  /** Fern fronds (left half) and grass blades (right half). */
  function groundAtlas() {
    return canvasTexture("ground-atlas", 512, 256, (g, W, H) => {
      const rnd = rngFor(9);
      g.clearRect(0, 0, W, H);
      // Fern frond: a curved rachis with paired, tapering pinnae.
      g.save(); g.beginPath(); g.rect(0, 0, 256, 256); g.clip();
      g.strokeStyle = "#35541f"; g.lineWidth = 3;
      const spine = (t) => [128 + Math.sin(t * 2.4) * 22 * t, 250 - t * 235];
      g.beginPath(); for (let t = 0; t <= 1.001; t += 0.05) { const [x, y] = spine(t); t === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      for (let k = 1; k < 30; k++) {
        const t = k / 30, [x, y] = spine(t), len = 62 * Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.08)) + 6;
        for (const s of [-1, 1]) {
          const ang = s * (1.25 - t * 0.55) - Math.PI / 2;
          g.strokeStyle = `hsl(${92 + rnd() * 14},${45 + rnd() * 10}%,${24 + t * 16}%)`; g.lineWidth = 5 - t * 3;
          g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(ang) * len * 0.5, y + Math.sin(ang) * len * 0.5 - 6, x + Math.cos(ang) * len, y + Math.sin(ang) * len + 4); g.stroke();
        }
      }
      g.restore();
      // Grass: a fan of blades.
      g.save(); g.beginPath(); g.rect(256, 0, 256, 256); g.clip();
      for (let b = 0; b < 26; b++) {
        const x = 256 + 128 + (rnd() - 0.5) * 120, h = 110 + rnd() * 130, lean = (rnd() - 0.5) * 70;
        const hue = 78 + rnd() * 26;
        const grad = g.createLinearGradient(x, 256, x + lean, 256 - h);
        grad.addColorStop(0, `hsl(${hue},45%,18%)`); grad.addColorStop(1, `hsl(${hue + 6},55%,${42 + rnd() * 10}%)`);
        g.fillStyle = grad;
        g.beginPath(); g.moveTo(x - 4 - rnd() * 3, 256); g.quadraticCurveTo(x + lean * 0.3, 256 - h * 0.55, x + lean, 256 - h); g.quadraticCurveTo(x + lean * 0.3 + 3, 256 - h * 0.5, x + 4 + rnd() * 3, 256); g.fill();
      }
      g.restore();
    });
  }
  function barkTexture() {
    return canvasTexture("bark", 256, 256, (g, W, H) => {
      const rnd = rngFor(3), n = fbm(256, 21, 4, 4), m = fbm(256, 33, 3, 8);
      const img = g.createImageData(256, 256);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const i = y * 256 + x, ridge = 0.5 + 0.5 * Math.sin(x * 0.52 + m[i] * 7.5 + Math.sin(y * 0.03) * 2.2);
        const v = 0.42 + n[i] * 0.5 + ridge * 0.34;
        img.data[i * 4] = 70 * v + 14; img.data[i * 4 + 1] = 52 * v + 10; img.data[i * 4 + 2] = 36 * v + 7; img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      g.strokeStyle = "rgba(12,8,4,.55)";
      for (let k = 0; k < 70; k++) { const x = rnd() * 256, y = rnd() * 256, l = 20 + rnd() * 80; g.lineWidth = 1 + rnd() * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 6, y + l); g.stroke(); }
    }, { repeat: true });
  }
  /** A tileable ripple normal map built from crossing waves. */
  function rippleNormal(seed = 1) {
    return canvasTexture("ripple" + seed, 256, 256, (g, W, H) => {
      const rnd = rngFor(seed * 17 + 3);
      const waves = []; for (let k = 0; k < 9; k++) { const a = rnd() * TAU, f = 2 + Math.floor(rnd() * 5); waves.push([Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f), rnd() * TAU, 0.5 + rnd() * 0.6]); }
      const h = new Float32Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let s = 0; for (const [kx, ky, ph, amp] of waves) s += Math.sin((kx * x + ky * y) / W * TAU + ph) * amp;
        h[y * W + x] = s;
      }
      const img = g.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const dx = h[y * W + (x + 1) % W] - h[y * W + (x + W - 1) % W], dy = h[((y + 1) % H) * W + x] - h[((y + H - 1) % H) * W + x];
        const nx = -dx * 0.5, ny = -dy * 0.5, nz = 1, l = Math.hypot(nx, ny, nz);
        const i = (y * W + x) * 4;
        img.data[i] = (nx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[i + 2] = (nz / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    }, { srgb: false, repeat: true });
  }
  function foamTexture() {
    return canvasTexture("foam", 256, 64, (g, W, H) => {
      const n = fbm(256, 71, 5, 6), img = g.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const edge = 1 - y / H, v = Math.max(0, n[(y * 4 % 256) * 256 + x] * 1.25 - 0.45 + edge * 0.45), a = Math.min(1, v * 2.4) * edge;
        const i = (y * W + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 245; img.data[i + 3] = a * 255;
      }
      g.putImageData(img, 0, 0);
    }, { repeat: true });
  }
  function causticTexture() {
    return canvasTexture("caustic", 256, 256, (g, W, H) => {
      const a = fbm(256, 5, 3, 5), b = fbm(256, 15, 3, 5), img = g.createImageData(W, H);
      for (let i = 0; i < W * H; i++) {
        const v = Math.pow(1 - Math.abs(a[i] - b[i]) * 3.2, 7);
        img.data[i * 4] = 200; img.data[i * 4 + 1] = 255; img.data[i * 4 + 2] = 255; img.data[i * 4 + 3] = Math.max(0, Math.min(255, v * 255));
      }
      g.putImageData(img, 0, 0);
    }, { repeat: true });
  }

  // ── Ground surfaces with real relief ─────────────────────────────────────────────
  /** Turn a height canvas into a tangent-space normal map. */
  function normalFromHeight(h, W, H, strength) {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), img = g.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = h[y * W + (x + 1) % W] - h[y * W + (x + W - 1) % W], dy = h[((y + 1) % H) * W + x] - h[((y + H - 1) % H) * W + x];
      const nx = -dx * strength, ny = -dy * strength, l = Math.hypot(nx, ny, 1), i = (y * W + x) * 4;
      img.data[i] = (nx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.userData.shared = true;
    return t;
  }
  /** Forest floor: soil, leaf litter, twigs, stones and moss. Tiles at ~6 m. */
  function soil({ moss = 0.5, litter = 1, key = "soil" } = {}) {
    if (textures.has(key)) return textures.get(key);
    const W = 512, rnd = rngFor(77), n = fbm(W, 12, 5, 4), m = fbm(W, 44, 4, 3), d = fbm(W, 90, 3, 9);
    const c = document.createElement("canvas"); c.width = c.height = W;
    const g = c.getContext("2d"), img = g.createImageData(W, W), height = new Float32Array(W * W);
    for (let i = 0; i < W * W; i++) {
      const v = 0.35 + n[i] * 0.55, mo = Math.max(0, (m[i] - 0.5) * 2.4 * moss);
      let r = 62 * v + 18, gg = 46 * v + 14, b = 32 * v + 8;
      r = r + (68 - r) * mo * 0.7; gg = gg + (96 - gg) * mo * 0.75; b = b + (40 - b) * mo * 0.6;
      img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
      height[i] = n[i] * 0.6 + d[i] * 0.4;
    }
    g.putImageData(img, 0, 0);
    const hc = document.createElement("canvas"); hc.width = hc.height = W; const hg = hc.getContext("2d");
    // Leaf litter: overlapping leaves in browns, ochres and the odd green one, each lifting the height a little.
    const drawLeaf = (ctx, x, y, len, ang, fill) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.38, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.38, 0, 0); ctx.fill(); ctx.restore(); };
    hg.fillStyle = "#000"; hg.fillRect(0, 0, W, W);
    for (let k = 0; k < 2600 * litter; k++) {
      const x = rnd() * W, y = rnd() * W, len = 7 + rnd() * 14, ang = rnd() * TAU;
      const hue = rnd() < 0.07 ? 85 + rnd() * 20 : 16 + rnd() * 24, sat = 22 + rnd() * 26, li = 11 + rnd() * 17;
      for (const ox of [0, x < len ? W : x > W - len ? -W : 0]) { drawLeaf(g, x + ox, y, len, ang, `hsla(${hue},${sat}%,${li}%,.85)`); drawLeaf(hg, x + ox, y, len, ang, `rgba(255,255,255,.22)`); }
    }
    for (let k = 0; k < 90; k++) {   // twigs
      const x = rnd() * W, y = rnd() * W, len = 14 + rnd() * 40, ang = rnd() * TAU;
      g.strokeStyle = `rgba(${50 + rnd() * 30},${34 + rnd() * 20},${22},.9)`; g.lineWidth = 1 + rnd() * 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.stroke();
      hg.strokeStyle = "rgba(255,255,255,.5)"; hg.lineWidth = 2; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); hg.stroke();
    }
    for (let k = 0; k < 90; k++) {   // pebbles
      const x = rnd() * W, y = rnd() * W, r = 1.5 + rnd() * 3;
      const grd = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r); grd.addColorStop(0, "#6c675b"); grd.addColorStop(1, "#35322b");
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      hg.fillStyle = "rgba(255,255,255,.7)"; hg.beginPath(); hg.arc(x, y, r, 0, TAU); hg.fill();
    }
    const hd = hg.getImageData(0, 0, W, W).data;
    for (let i = 0; i < W * W; i++) height[i] = height[i] * 2.4 + hd[i * 4] / 255 * 3;
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8; map.userData.shared = true;
    const out = { map, normalMap: normalFromHeight(height, W, W, 0.9) };
    textures.set(key, out);
    return out;
  }
  /** River gravel: rounded stones in greys, tans and rust with dark gaps. */
  function pebbles() {
    if (textures.has("pebbles")) return textures.get("pebbles");
    const W = 512, rnd = rngFor(5);
    const c = document.createElement("canvas"); c.width = c.height = W;
    const g = c.getContext("2d"), hc = document.createElement("canvas"); hc.width = hc.height = W; const hg = hc.getContext("2d");
    g.fillStyle = "#26231f"; g.fillRect(0, 0, W, W); hg.fillStyle = "#000"; hg.fillRect(0, 0, W, W);
    const stone = (x, y) => {
      const rx = 7 + rnd() * 13, ry = rx * (0.6 + rnd() * 0.35), a = rnd() * Math.PI, tone = 70 + rnd() * 80, warm = rnd() * 28;
      for (const [ox, oy] of [[0, 0], [x < 20 ? W : x > W - 20 ? -W : 0, y < 20 ? W : y > W - 20 ? -W : 0]]) {
        for (const [c2, kind] of [[g, 0], [hg, 1]]) {
          c2.save(); c2.translate(x + ox, y + oy); c2.rotate(a); c2.scale(1, ry / rx);
          const grd = c2.createRadialGradient(-rx * 0.3, -rx * 0.35, 1, 0, 0, rx);
          if (kind === 0) { grd.addColorStop(0, `rgb(${tone + 45 + warm},${tone + 40},${tone + 25})`); grd.addColorStop(1, `rgb(${tone * 0.45 + warm * 0.4},${tone * 0.42},${tone * 0.38})`); }
          else { grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(1, "rgba(60,60,60,1)"); }
          c2.fillStyle = grd; c2.beginPath(); c2.arc(0, 0, rx, 0, TAU); c2.fill(); c2.restore();
        }
      }
    };
    for (let k = 0; k < 1500; k++) stone(rnd() * W, rnd() * W);
    const hd = hg.getImageData(0, 0, W, W).data, height = new Float32Array(W * W);
    for (let i = 0; i < W * W; i++) height[i] = hd[i * 4] / 255 * 5;
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8; map.userData.shared = true;
    const out = { map, normalMap: normalFromHeight(height, W, W, 1.2) };
    textures.set("pebbles", out);
    return out;
  }
  /** A carved glyph panel for stelae and temple walls (dark grooves on weathered stone). */
  function glyphs(key = "glyphs") {
    return canvasTexture(key, 256, 512, (g, W, H) => {
      const rnd = rngFor(13), n = fbm(256, 8, 4, 4);
      const img = g.createImageData(W, 256); const full = g.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const v = 0.55 + n[(y % 256) * 256 + x] * 0.5, i = (y * W + x) * 4;
        full.data[i] = 150 * v; full.data[i + 1] = 142 * v; full.data[i + 2] = 118 * v; full.data[i + 3] = 255;
      }
      void img; g.putImageData(full, 0, 0);
      g.strokeStyle = "rgba(30,26,18,.75)"; g.lineWidth = 5; g.lineCap = "round";
      for (let row = 0; row < 8; row++) for (let col = 0; col < 3; col++) {
        const cx = 50 + col * 78, cy = 40 + row * 58, k = (rnd() * 6) | 0;
        g.beginPath();
        if (k === 0) { g.arc(cx, cy, 16, 0, TAU); g.moveTo(cx - 8, cy); g.lineTo(cx + 8, cy); }
        else if (k === 1) { g.rect(cx - 15, cy - 15, 30, 30); g.moveTo(cx - 15, cy); g.lineTo(cx + 15, cy); }
        else if (k === 2) { g.moveTo(cx - 16, cy + 14); g.lineTo(cx, cy - 16); g.lineTo(cx + 16, cy + 14); g.closePath(); }
        else if (k === 3) { g.moveTo(cx - 14, cy - 12); g.bezierCurveTo(cx + 18, cy - 20, cx - 18, cy + 8, cx + 14, cy + 14); }
        else if (k === 4) { g.arc(cx, cy, 10, 0, TAU); g.moveTo(cx, cy - 10); g.lineTo(cx, cy - 22); g.moveTo(cx, cy + 10); g.lineTo(cx, cy + 22); }
        else { g.moveTo(cx - 16, cy - 8); g.lineTo(cx + 16, cy - 8); g.moveTo(cx - 16, cy + 8); g.lineTo(cx + 16, cy + 8); g.moveTo(cx - 4, cy - 16); g.lineTo(cx - 4, cy + 16); }
        g.stroke();
      }
      // moss creeping up from the base
      const mg = g.createLinearGradient(0, H, 0, H * 0.55); mg.addColorStop(0, "rgba(54,92,38,.85)"); mg.addColorStop(1, "rgba(54,92,38,0)");
      g.fillStyle = mg; g.fillRect(0, 0, W, H);
    });
  }

  // ── Desert: dry earth, a rutted road, layered sandstone, shingles ─────────────────
  function setFromCanvas(c, heightFn, W, strength) {
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8; map.userData.shared = true;
    const h = new Float32Array(W * c.height);
    heightFn(h);
    return { map, normalMap: normalFromHeight(h, W, c.height, strength) };
  }
  /** Sun-baked earth: grain, scattered stones, and a fine net of dry cracks. */
  function dirt({ base = [190, 152, 106], key = "dirt" } = {}) {
    if (textures.has(key)) return textures.get(key);
    const W = 512, rnd = rngFor(41), n = fbm(W, 8, 5, 4), m = fbm(W, 19, 4, 9), grain = fbm(W, 3, 2, 96);
    const c = document.createElement("canvas"); c.width = c.height = W;
    const g = c.getContext("2d"), img = g.createImageData(W, W);
    for (let i = 0; i < W * W; i++) {
      const v = 0.66 + n[i] * 0.55 + (m[i] - 0.5) * 0.22 + (grain[i] - 0.5) * 0.14;
      img.data[i * 4] = base[0] * v; img.data[i * 4 + 1] = base[1] * v * 0.97; img.data[i * 4 + 2] = base[2] * v * 0.92; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const hc = document.createElement("canvas"); hc.width = hc.height = W; const hg = hc.getContext("2d"); hg.fillStyle = "#000"; hg.fillRect(0, 0, W, W);
    // Cracks: wandering branching lines.
    const crack = (x, y, a, len, w) => {
      g.strokeStyle = "rgba(60,40,24,.55)"; hg.strokeStyle = "rgba(255,255,255,.9)";
      g.lineWidth = w; hg.lineWidth = w + 1; g.beginPath(); hg.beginPath(); g.moveTo(x, y); hg.moveTo(x, y);
      for (let k = 0; k < len; k++) { a += (rnd() - 0.5) * 0.6; x += Math.cos(a) * 6; y += Math.sin(a) * 6; g.lineTo(x, y); hg.lineTo(x, y); if (rnd() < 0.05 && len - k > 4) { g.stroke(); hg.stroke(); crack(x, y, a + (rnd() < 0.5 ? 1 : -1) * 1.1, (len - k) * 0.6 | 0, w * 0.7); g.beginPath(); hg.beginPath(); g.moveTo(x, y); hg.moveTo(x, y); } }
      g.stroke(); hg.stroke();
    };
    for (let k = 0; k < 22; k++) crack(rnd() * W, rnd() * W, rnd() * TAU, 14 + (rnd() * 20 | 0), 1.4);
    for (let k = 0; k < 220; k++) {   // stones
      const x = rnd() * W, y = rnd() * W, r = 1.2 + rnd() * 3, tone = 120 + rnd() * 80;
      g.fillStyle = `rgb(${tone},${tone * 0.9 | 0},${tone * 0.78 | 0})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      hg.fillStyle = "rgba(255,255,255,.8)"; hg.beginPath(); hg.arc(x, y, r, 0, TAU); hg.fill();
    }
    const hd = hg.getImageData(0, 0, W, W).data;
    const out = setFromCanvas(c, (h) => { for (let i = 0; i < W * W; i++) h[i] = n[i] * 2.2 + grain[i] * 1.2 - hd[i * 4] / 255 * 2.4; }, W, 1.0);
    textures.set(key, out);
    return out;
  }
  /** A packed-earth street: two wheel ruts, hoof-scuffed middle and soft edges. Maps one tile = 8 m along, the whole width across. */
  function road({ width = 12, tile = 8 } = {}) {
    const key = "road" + width;
    if (textures.has(key)) return textures.get(key);
    const W = 512, rnd = rngFor(83), n = fbm(W, 12, 5, 4), grain = fbm(W, 6, 2, 80);
    const c = document.createElement("canvas"); c.width = c.height = W;
    const g = c.getContext("2d"), img = g.createImageData(W, W), height = new Float32Array(W * W);
    for (let y = 0; y < W; y++) {
      const v = y / W, across = (v - 0.5) * width;    // metres from the centre line
      for (let x = 0; x < W; x++) {
        const i = y * W + x, nn = n[i];
        const rut = Math.max(Math.exp(-Math.pow((Math.abs(across) - 1.35) / 0.32, 2)), 0) ;
        const edge = Math.min(1, (width / 2 - Math.abs(across)) / 1.4);
        const k = 0.72 + nn * 0.5 + (grain[i] - 0.5) * 0.16 - rut * 0.22;
        img.data[i * 4] = 178 * k; img.data[i * 4 + 1] = 140 * k; img.data[i * 4 + 2] = 98 * k; img.data[i * 4 + 3] = Math.max(0, Math.min(1, edge)) * 255;
        height[i] = nn * 2 + grain[i] - rut * 3.2;
      }
    }
    g.putImageData(img, 0, 0);
    // Hoof scuffs and dropped stones down the middle.
    for (let k = 0; k < 160; k++) { const x = rnd() * W, y = W * (0.3 + rnd() * 0.4), r = 1 + rnd() * 2.2; g.fillStyle = `rgba(${90 + rnd() * 40 | 0},${70 + rnd() * 30 | 0},${50},.5)`; g.beginPath(); g.ellipse(x, y, r * 1.6, r, rnd() * 3, 0, TAU); g.fill(); }
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = THREE.RepeatWrapping; map.wrapT = THREE.ClampToEdgeWrapping; map.anisotropy = 8; map.userData.shared = true;
    const nm = normalFromHeight(height, W, W, 0.9); nm.wrapT = THREE.ClampToEdgeWrapping;
    const out = { map, normalMap: nm };
    textures.set(key, out);
    return out;
  }
  /** Sandstone strata: horizontal bands of ochre, rust and cream, cut by vertical weathering streaks. Tiles ~7 m tall. */
  function strata(key = "strata") {
    if (textures.has(key)) return textures.get(key);
    const W = 256, H = 512, rnd = rngFor(66), n = fbm(256, 5, 5, 3), streak = fbm(256, 29, 3, 24);
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), img = g.createImageData(W, H), height = new Float32Array(W * H);
    const palette = [[184, 98, 64], [204, 128, 86], [218, 158, 112], [158, 82, 58], [226, 182, 134], [170, 108, 78], [196, 140, 100]];
    const bands = []; let y = 0; while (y < H) { const t = 6 + rnd() * 34; bands.push([y, y + t, palette[(rnd() * palette.length) | 0], 0.88 + rnd() * 0.24, rnd()]); y += t; }
    for (let yy = 0; yy < H; yy++) {
      const band = bands.find((b) => yy >= b[0] && yy < b[1]) || bands[bands.length - 1];
      for (let x = 0; x < W; x++) {
        const nn = n[(yy % 256) * 256 + x], st = streak[(yy % 256) * 256 + x];
        const k = band[3] * (0.82 + nn * 0.36) * (1 - Math.max(0, st - 0.55) * 0.55), i = (yy * W + x) * 4;
        img.data[i] = band[2][0] * k; img.data[i + 1] = band[2][1] * k; img.data[i + 2] = band[2][2] * k; img.data[i + 3] = 255;
        height[yy * W + x] = band[4] * 2.2 + nn * 2.2 + st * 1.2 + (yy - band[0] < 3 ? -1.5 : 0);
      }
    }
    g.putImageData(img, 0, 0);
    const out = setFromCanvas(c, (h) => h.set(height), W, 1.2);
    // setFromCanvas sizes the normal map by canvas height: rebuild at the right shape
    out.normalMap = normalFromHeight(height, W, H, 1.2);
    textures.set(key, out);
    return out;
  }
  /** Weathered wood shingles in overlapping rows. */
  function shingles(key = "shingles", base = [118, 96, 74]) {
    if (textures.has(key)) return textures.get(key);
    const W = 256, rnd = rngFor(14), n = fbm(256, 9, 4, 6);
    const c = document.createElement("canvas"); c.width = c.height = W;
    const g = c.getContext("2d"), height = new Float32Array(W * W);
    g.fillStyle = "#1c150f"; g.fillRect(0, 0, W, W);
    const rows = 14, rh = W / rows, cw = 22;
    for (let r = rows - 1; r >= 0; r--) {
      const off = (r % 2) * cw / 2 + rnd() * 6;
      for (let x = -cw; x < W + cw; x += cw) {
        const k = 0.65 + rnd() * 0.5, top = r * rh - 3, w = cw - 1.5 + rnd();
        const px = x + off;
        for (const ox of [0, px < cw ? W : px > W - cw ? -W : 0]) {
          g.fillStyle = `rgb(${base[0] * k | 0},${base[1] * k | 0},${base[2] * k | 0})`;
          g.beginPath(); g.moveTo(px + ox, top); g.lineTo(px + ox + w, top); g.lineTo(px + ox + w, top + rh + 3 + rnd() * 2); g.quadraticCurveTo(px + ox + w / 2, top + rh + 6, px + ox, top + rh + 3 + rnd() * 2); g.closePath(); g.fill();
          g.strokeStyle = "rgba(20,14,8,.45)"; g.lineWidth = 1; for (let l = 1; l < 4; l++) { g.beginPath(); g.moveTo(px + ox + w * l / 4, top + 2); g.lineTo(px + ox + w * l / 4 + (rnd() - 0.5) * 2, top + rh); g.stroke(); }
        }
      }
    }
    const id = g.getImageData(0, 0, W, W).data;
    const out = setFromCanvas(c, (h) => { for (let i = 0; i < W * W; i++) { const y = (i / W) | 0, within = (y % rh) / rh; h[i] = (id[i * 4] / 255) * 2 + within * 2.5 + n[i] * 1.5; } }, W, 1.1);
    textures.set(key, out);
    return out;
  }
  /** A tangle of dry twigs on a transparent ground: one card of a tumbleweed. */
  function tumbleTexture() {
    return canvasTexture("tumble", 128, 128, (g, W) => {
      const rnd = rngFor(77); g.clearRect(0, 0, W, W);
      for (let k = 0; k < 90; k++) {
        const a = rnd() * TAU, r0 = 10 + rnd() * 50, span = 0.6 + rnd() * 1.6, tone = 70 + rnd() * 70;
        g.strokeStyle = `rgba(${tone + 40},${tone + 12},${tone - 24},${0.85})`; g.lineWidth = 0.9 + rnd() * 1.3;
        g.beginPath(); g.arc(W / 2 + (rnd() - 0.5) * 16, W / 2 + (rnd() - 0.5) * 16, r0, a, a + span); g.stroke();
      }
    });
  }
  /** A saguaro: a ribbed trunk with arms that rise from an elbow. Mesher geometry, vertex-tinted green. */
  function cactus(mesh, rnd, x, z, h) {
    const r = 0.3 + h * 0.03, tint = [0.9 + rnd() * 0.15, 1, 0.85 + rnd() * 0.15], segs = 6;
    const path = (x0, y0, z0, dx, dz, hh, rad, arm) => {
      let px = x0, py = y0, pz = z0;
      for (let i = 1; i <= segs; i++) {
        const t = i / segs, bend = arm ? 0 : (rnd() - 0.5) * 0.05;
        const nx = x0 + dx * (arm ? Math.min(1, t * 2) * 0.9 : 0) + bend * hh * t, nz = z0 + dz * (arm ? Math.min(1, t * 2) * 0.9 : 0), ny = y0 + (arm ? (t < 0.35 ? t * hh * 0.2 : hh * (0.07 + (t - 0.35) * 1.45)) : hh * t);
        const r0 = rad * (i === 1 ? 1 : 1 - (i - 1) / segs * 0.12), r1 = rad * (i === segs ? 0.55 : 1 - i / segs * 0.12);
        mesh.tube([px, py, pz], [nx, ny, nz], r0, r1, 10, 3, tint);
        px = nx; py = ny; pz = nz;
      }
      // Rounded tip.
      mesh.tube([px, py, pz], [px, py + rad * 0.5, pz], rad * 0.55, rad * 0.2, 10, 3, tint);
    };
    path(x, 0, z, 0, 0, h, r, false);
    const arms = 1 + ((rnd() * 3) | 0);
    for (let a = 0; a < arms; a++) {
      const ang = rnd() * TAU, base = h * (0.35 + rnd() * 0.25);
      path(x + Math.cos(ang) * r * 0.5, base, z + Math.sin(ang) * r * 0.5, Math.cos(ang) * (0.9 + rnd() * 0.5), Math.sin(ang) * (0.9 + rnd() * 0.5), h * (0.3 + rnd() * 0.22), r * 0.72, true);
    }
    return r;
  }
  /** A butte: a tapering rock tower with a flared foot, a flat top and ridges running up its sides. */
  function butte(rnd, { x, z, r, h, top = 0.8, flare = 0.5, tile = 7 }) {
    const g = new THREE.CylinderGeometry(r * top, r, h, 30, 22, false);
    const p = g.attributes.position, uv = g.attributes.uv, v = new THREE.Vector3();
    const seed = rnd() * 50;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const t = v.y / h + 0.5, a = Math.atan2(v.z, v.x);
      const rad = Math.hypot(v.x, v.z);
      if (rad < 1e-4) continue;
      const ridge = Math.sin(a * 5 + seed) * 0.09 + Math.sin(a * 11 + seed * 2.3) * 0.05 + Math.sin(a * 23 + t * 7 + seed) * 0.025;
      const ledge = Math.sin(t * 14 + seed) * 0.03 * (1 - t * 0.4);
      const talus = Math.pow(Math.max(0, 0.28 - t) / 0.28, 2) * flare;
      const k = 1 + ridge + ledge + talus;
      p.setXYZ(i, v.x * k, v.y, v.z * k);
      uv.setXY(i, (a / TAU + 0.5) * (r * TAU / tile), t * h / tile);
    }
    g.computeVertexNormals();
    g.translate(x, h / 2, z);
    return g.toNonIndexed();
  }
  /** A far skyline: a ring of ridges round the horizon, in haze. Two layers are enough to read as distance. */
  function skyline(group, { radius = 210, base = 6, height = 34, color = 0xb7a58f, seed = 3, bottom = -8 } = {}) {
    const seg = 220, pos = [], idx = [], col = [], c = new THREE.Color(color);
    const nn = fbm(256, seed * 7, 5, 6), a1 = fbm(256, seed * 3, 3, 3);
    const hAt = (i) => { const u = i / seg, k = Math.floor(u * 255); return base + (Math.pow(nn[k], 1.3) * 1.7 + a1[k] * 0.9 - 0.5) * height + (Math.abs(Math.sin(u * TAU * 3 + seed)) > 0.8 ? height * 0.5 : 0); };
    for (let i = 0; i <= seg; i++) {
      const a = i / seg * TAU, x = Math.cos(a) * radius, z = Math.sin(a) * radius, hh = hAt(i % seg);
      pos.push(x, bottom, z, x, hh, z);
      const lift = 0.1 + (hh - base) / height * 0.18;
      col.push(c.r * 0.9, c.g * 0.9, c.b * 0.92, Math.min(1, c.r * (1 + lift)), Math.min(1, c.g * (1 + lift)), Math.min(1, c.b * (1 + lift * 1.1)));
    }
    for (let i = 0; i < seg; i++) { const k = i * 2; idx.push(k, k + 1, k + 3, k, k + 3, k + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false }));
    m.frustumCulled = false; m.raycast = () => {}; m.renderOrder = -900;
    group.add(m);
    return m;
  }

  // ── Molten metal: drifting crust plates split by glowing seams, with white-hot pools ──
  const MOLTEN_VERT = `
    #include <common>
    #include <fog_pars_vertex>
    varying vec3 vW;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vW = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`;
  const MOLTEN_FRAG = `
    #include <common>
    #include <fog_pars_fragment>
    varying vec3 vW;
    uniform float uTime, uScale, uGain;
    uniform vec2 uFlow;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
    float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
    void main() {
      vec2 p = vW.xz * uScale + uFlow * uTime;
      // Domain warping: the whole surface slowly churns as it flows.
      vec2 q = vec2(fbm(p + vec2(0.0, uTime * 0.02)), fbm(p + vec2(5.2, 1.3) - uTime * 0.016));
      vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + uTime * 0.03), fbm(p + 3.0 * q + vec2(8.3, 2.8) - uTime * 0.025));
      float f = fbm(p + 3.4 * r);
      float plate = smoothstep(0.43, 0.52, f);                      // 1 = cooled crust
      float seam = exp(-pow((f - 0.465) / 0.035, 2.0));             // the cracks between plates glow
      float swirl = fbm(p * 2.2 - r * 2.0 + uTime * 0.05);
      vec3 melt = mix(vec3(0.9, 0.16, 0.01), vec3(1.0, 0.55, 0.08), smoothstep(0.3, 0.7, swirl));
      melt = mix(melt, vec3(1.0, 0.8, 0.35), smoothstep(0.34, 0.1, f) * 0.6);   // white hot where it is thinnest
      vec3 crust = mix(vec3(0.028, 0.022, 0.02), vec3(0.14, 0.045, 0.02), fbm(p * 5.0 + r));
      crust += vec3(0.55, 0.13, 0.02) * seam * plate * 1.2;
      vec3 col = mix(melt * uGain, crust, plate) + melt * seam * 1.1 * (1.0 - plate);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`;
  /**
   * A pool or channel of molten metal on `geometry` (a plane or a disc lying flat), flowing along `flow`.
   * It is computed per pixel from world position, so channels that cross share one surface, nothing tiles and
   * nothing flickers; the crust drifts, splits and heals as it moves.
   */
  function molten(parent, world, geometry, { x = 0, y = 0.06, z = 0, flow = [0, 0.03], scale = 0.32, intensity = 1.15 } = {}) {
    const material = new THREE.ShaderMaterial({
      vertexShader: MOLTEN_VERT, fragmentShader: MOLTEN_FRAG, fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uScale: { value: scale }, uGain: { value: intensity }, uFlow: { value: new THREE.Vector2(...flow) } }]),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); mesh.raycast = () => {};
    parent.add(mesh);
    world.tick((dt, t) => { material.uniforms.uTime.value = t % 7200; });   // wall-clock seconds are too big for a shader float
    return { mesh, over: mesh, material };
  }
  /** A soft, ragged puff of cloud for steam and smoke: dense in the middle, torn at the edge, nothing like a disc. */
  function cloudTexture() {
    return canvasTexture("cloud", 128, 128, (g, W) => {
      const n = fbm(128, 44, 4, 4), img = g.createImageData(W, W);
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
        const dx = (x - W / 2) / (W / 2), dy = (y - W / 2) / (W / 2), d = Math.hypot(dx, dy);
        const v = n[y * W + x], core = Math.max(0, 1 - d), a = Math.max(0, Math.min(1, (core * 1.3 - 0.12 + (v - 0.5) * 0.9)));
        const i = (y * W + x) * 4; img.data[i] = 235; img.data[i + 1] = 238; img.data[i + 2] = 240; img.data[i + 3] = Math.pow(a, 1.4) * 255;
      }
      g.putImageData(img, 0, 0);
    });
  }
  /**
   * A column of steam: puffs rise, slow, swell and drift on a curl, fading in and out smoothly. `intensity(t)` in 0..1
   * eases the whole column on and off, so a vent builds and dies away instead of popping.
   */
  function steam(group, world, { x, z, height = 4.6, count = 14, intensity = () => 1, size = 1.1, opacity = 0.3 }) {
    const tex = cloudTexture(), puffs = [];
    for (let k = 0; k < count; k++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: 0xe6e9ec, transparent: true, depthWrite: false, opacity: 0, fog: true, rotation: Math.random() * TAU });
      const sp = new THREE.Sprite(m); sp.raycast = () => {}; group.add(sp);
      puffs.push({ sp, o: k / count, rot: (Math.random() - 0.5) * 0.5, ph: Math.random() * TAU, sx: (Math.random() - 0.5) * 0.6 });
    }
    world.tick((dt, t) => {
      const live = intensity(t);
      for (const p of puffs) {
        const u = (t * 0.28 + p.o) % 1, rise = 1 - Math.pow(1 - u, 1.7);
        {
          p.sp.position.set(x + Math.sin(t * 0.6 + p.ph + u * 2.5) * (0.15 + u * 0.9) + p.sx * u, 0.3 + rise * height, z + Math.cos(t * 0.5 + p.ph + u * 2.2) * (0.15 + u * 0.9));
          p.sp.scale.setScalar(size * (0.9 + u * 3.6));
          p.sp.material.rotation += p.rot * dt;
          p.sp.material.opacity = live * opacity * Math.pow(1 - u, 1.5) * Math.min(1, u / 0.14);
        }
      }
    });
  }

  // ── Fire: tongues of flame from drifting noise, not a glow sprite ─────────────────
  const FIRE_VERT = `varying vec2 vUv; uniform float uTime; uniform float uSeed;
    void main() {
      vUv = uv;
      vec3 p = position;
      float h = uv.y;                                                   // 0 at the coals, 1 at the tip
      p.x += (sin(uTime * 3.1 + uSeed + h * 5.0) * 0.07 + sin(uTime * 5.3 + uSeed * 2.0 + h * 9.0) * 0.03) * h * h;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FIRE_FRAG = `varying vec2 vUv; uniform float uTime; uniform float uSeed; uniform float uHeat;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
    float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.1 + 3.7; a *= 0.5; } return s; }
    void main() {
      vec2 uv = vUv;
      float side = abs(uv.x - 0.5) * 2.0;                                // 0 on the axis, 1 at the edge
      float rise = uTime * 1.7;
      float n = fbm(vec2(uv.x * 3.2 + uSeed, uv.y * 2.6 - rise));       // the flame churns upward
      float n2 = fbm(vec2(uv.x * 6.5 - uSeed, uv.y * 4.4 - rise * 1.6));
      float body = (1.0 - side * (0.9 + uv.y * 0.9)) * (1.0 - uv.y * 0.85);   // narrow at the top, bright at the root
      float d = body * 1.25 + (n * 0.6 + n2 * 0.4 - 0.5) * 1.7 - uv.y * 0.2;
      float flame = smoothstep(0.26, 0.5, d);                          // a firm edge: tongues, not a haze
      float core = smoothstep(0.62, 1.0, d);
      vec3 col = mix(vec3(0.85, 0.08, 0.0), vec3(1.0, 0.42, 0.04), smoothstep(0.26, 0.62, d));
      col = mix(col, vec3(1.0, 0.78, 0.28), core);                     // yellow where it burns hottest, never white
      gl_FragColor = vec4(col * (0.9 + core * 0.7) * uHeat, flame * (1.0 - uv.y * 0.3));
    }`;
  function sparkTexture() {
    return canvasTexture("spark", 32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.3, "rgba(255,200,120,.7)"); r.addColorStop(1, "rgba(255,120,30,0)"); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  }
  /**
   * A fire burning at (x, y, z): crossed tongues of animated flame (additive), sparks that lift off and go out, and
   * a flickering light. `intensity` scales the flame; give `light` a PointLight to have it flicker with the fire.
   */
  function fire(group, world, { x, y, z, width = 0.8, height = 1.7, light = null, lightBase = 14, sparks = 6 }) {
    const planes = 3, mats = [];
    for (let k = 0; k < planes; k++) {
      const m = new THREE.ShaderMaterial({
        vertexShader: FIRE_VERT, fragmentShader: FIRE_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uSeed: { value: Math.random() * 20 }, uHeat: { value: 1 } },
      });
      const g = new THREE.PlaneGeometry(width, height, 1, 8); g.translate(0, height / 2, 0);
      const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.rotation.y = k / planes * Math.PI + Math.random() * 0.3; mesh.raycast = () => {}; mesh.frustumCulled = false; mesh.renderOrder = 6;
      group.add(mesh); mats.push(m);
    }
    const sp = [];
    for (let k = 0; k < sparks; k++) {
      const m = new THREE.SpriteMaterial({ map: sparkTexture(), color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false });
      const s = new THREE.Sprite(m); s.scale.setScalar(0.09); s.raycast = () => {}; group.add(s);
      sp.push({ s, o: Math.random(), vx: (Math.random() - 0.5) * 0.7, vz: (Math.random() - 0.5) * 0.7, rate: 0.4 + Math.random() * 0.4 });
    }
    world.tick((dt, t) => {
      const tt = t % 7200;
      const flick = 0.9 + Math.sin(tt * 11.3 + x) * 0.07 + Math.sin(tt * 17.9 + z) * 0.05 + Math.sin(tt * 3.1) * 0.04;
      for (const m of mats) { m.uniforms.uTime.value = tt; m.uniforms.uHeat.value = flick; }
      if (light) light.intensity = lightBase * flick;
      for (const p of sp) {
        const u = (tt * p.rate + p.o) % 1;
        p.s.position.set(x + p.vx * u + Math.sin(tt * 3 + p.o * 9) * 0.1 * u, y + height * 0.4 + u * height * 1.6, z + p.vz * u);
        p.s.material.opacity = Math.sin(Math.PI * Math.min(1, u * 1.15)) * 0.9 * (1 - u);
      }
    });
  }

  // ── Materials ────────────────────────────────────────────────────────────────────
  // Plants move with the wind and part around whoever walks through them. `motion` is set from the graphics
  // quality: 0 still, 1 wind, 2 wind and contact.
  const motion = { value: 2 };
  /**
   * The player's wake: the live position plus a trail of recent ones. Each entry pushes plants away with a strength
   * that decays and rings (a damped spring), so plants are shoved aside, swing past upright and settle, rather than
   * snapping back the moment you step away. Entries are [x, z, 0, strength].
   */
  const wake = {
    value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 0, 0)),
    drops: [],
    update(t, p) {
      const w = this.value;
      if (!p) { for (const v of w) v.w = 0; this.drops.length = 0; return; }
      const last = this.drops[0];
      if (!last || Math.hypot(p.x - last.x, p.z - last.z) > 0.35) { this.drops.unshift({ x: p.x, z: p.z, t }); if (this.drops.length > 7) this.drops.pop(); }
      w[0].set(p.x, p.z, 0, 1);
      for (let i = 0; i < 7; i++) {
        const d = this.drops[i];
        if (!d) { w[i + 1].w = 0; continue; }
        const age = t - d.t;
        w[i + 1].set(d.x, d.z, 0, age > 3.2 ? 0 : Math.exp(-age * 1.7) * Math.cos(age * 5.5));
      }
    },
  };
  /**
   * Sway foliage. Every card bends about its base: the weight is 0 where it joins the plant and 1 at the tip, and the
   * lean grows with its square, so a frond arcs instead of sliding. Wind comes in gusts that travel across the ground;
   * the wake pushes low plants aside (`cellRows` is how many rows of leaf pictures the atlas has).
   */
  function windify(material, amp = 0.05, cellRows = 1) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uWind = windTime; shader.uniforms.uMotion = motion; shader.uniforms.uTrail = wake;
      shader.vertexShader = `uniform float uWind; uniform float uMotion; uniform vec4 uTrail[8];\n` + shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
         float tipW = ${cellRows > 1 ? "(uv.y >= 0.5 ? (uv.y - 0.5) * 2.0 : uv.y * 2.0)" : "uv.y"};
         float k = tipW * tipW;
         float on = step(0.5, uMotion);
         float gust = sin(uWind * 1.1 + dot(wp.xz, vec2(0.19, 0.13))) * 0.6 + sin(uWind * 2.3 + dot(wp.xz, vec2(0.47, -0.3))) * 0.4;
         float flutter = sin(uWind * 5.1 + wp.x * 3.1 + wp.z * 2.3) * 0.5 + sin(uWind * 7.7 + wp.y * 4.0 + wp.z) * 0.5;
         vec2 windDir = vec2(0.8, 0.6);
         float treeSway = smoothstep(0.4, 7.0, wp.y);
         vec2 bend = windDir * (gust * 0.5 + 0.5) * ${(amp * 4).toFixed(3)} * (k + treeSway * 0.5) * on
                   + vec2(-windDir.y, windDir.x) * flutter * 0.05 * (k + treeSway * 0.35) * on;
         // The wake: shoved away, swung back past upright, settling.
         vec2 push = vec2(0.0);
         if (uMotion > 1.5) {
           for (int i = 0; i < 8; i++) {
             vec4 e = uTrail[i];
             if (abs(e.w) > 0.01) {
               vec2 away = wp.xz - e.xy;
               float d = length(away);
               push += away / max(d, 0.06) * smoothstep(1.5, 0.12, d) * e.w;
             }
           }
         }
         float pl = length(push);
         if (pl > 1.0) push /= pl;
         float low = 1.0 - smoothstep(1.6, 2.4, wp.y);
         bend += push * 1.05 * k * low;
         transformed.xz += bend;
         transformed.y -= length(bend) * 0.45 * k;`
      );
    };
    return material;
  }
  const mats = {};
  function material(name) {
    if (mats[name]) return mats[name];
    let m;
    if (name === "leaf") m = windify(new THREE.MeshStandardMaterial({ map: leafAtlas(), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true, roughness: 0.78, metalness: 0 }), 0.06, 2);
    else if (name === "ground") m = windify(new THREE.MeshStandardMaterial({ map: groundAtlas(), alphaTest: 0.5, side: THREE.DoubleSide, vertexColors: true, roughness: 0.85, metalness: 0 }), 0.05);
    else if (name === "cactus") m = new THREE.MeshStandardMaterial({ map: canvasTexture("cactus", 64, 128, (g, W, H) => {
      const rnd = rngFor(8);
      for (let x = 0; x < W; x++) { const rib = 0.5 + 0.5 * Math.cos(x / W * TAU * 8); g.fillStyle = `rgb(${52 + rib * 34 | 0},${98 + rib * 52 | 0},${54 + rib * 24 | 0})`; g.fillRect(x, 0, 1, H); }
      for (let y = 4; y < H; y += 7) for (let r = 0; r < 8; r++) { const x = (r + 0.5) / 8 * W; g.fillStyle = "rgba(235,225,180,.85)"; g.fillRect(x - 1, y + (rnd() - 0.5) * 2, 2, 1.5); g.fillStyle = "rgba(235,225,180,.45)"; g.fillRect(x - 3, y + 1, 1, 1); g.fillRect(x + 2, y + 1, 1, 1); }
    }, { repeat: true }), roughness: 0.85, metalness: 0, vertexColors: true });
    else if (name === "bark") m = new THREE.MeshStandardMaterial({ map: barkTexture(), roughness: 0.95, metalness: 0, vertexColors: true });
    m.userData.shared = m.userData._cachedShared = true;
    return (mats[name] = m);
  }

  // ── Trees and plants ─────────────────────────────────────────────────────────────
  const RECTS = [[0, 0.5, 0.5, 1], [0.5, 0.5, 1, 1], [0, 0, 0.5, 0.5], [0.5, 0, 1, 0.5]];   // leaf atlas cells (v up)
  const FERN = [0, 0, 0.5, 1], GRASS = [0.5, 0, 1, 1];
  const tintOf = (rnd, hueShift = 0) => { const k = 0.78 + rnd() * 0.4; return [k * (0.92 + hueShift), k, k * 0.86]; };

  /**
   * One broadleaf tree: a trunk that leans and swells into surface roots, limbs that curve up and out and fork,
   * and clumps of leaf cards at their ends. `bark` and `leaf` are Meshers shared across the forest. Returns the trunk radius.
   */
  function tree(bark, leaf, rnd, { x, z, h, lean = 0.07, crown = 1, dense = 1 }) {
    const trunkR = Math.max(0.3, h * 0.026);
    const barkTint = () => { const k = 0.72 + rnd() * 0.2; return [k * 1.05, k, k * 0.92]; };
    const a0 = rnd() * TAU, bend = (rnd() - 0.3) * lean * h * 1.3, phase = rnd() * 6, trunkH = h * 0.6, N = 14;
    const pts = [], rad = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, off = bend * t * t, sway = Math.sin(t * 4 + phase) * trunkR * 0.4 * t;
      pts.push([x + Math.cos(a0) * off + Math.cos(a0 + 1.57) * sway, i === 0 ? -0.25 : trunkH * t, z + Math.sin(a0) * off + Math.sin(a0 + 1.57) * sway]);
      rad.push(trunkR * (1 - 0.5 * t) * (1 + 1.1 * Math.exp(-t * 11)));       // flares into the roots
    }
    bark.sweep(pts, rad, 12, 1.2, barkTint());
    // Surface roots: they leave the trunk low, arch over the ground and sink into it.
    for (let k = 0; k < 5; k++) {
      const ang = k / 5 * TAU + rnd() * 0.7, len = trunkR * (3.2 + rnd() * 3), rp = [], rr = [];
      for (let j = 0; j <= 7; j++) {
        const u = j / 7, r = trunkR * 0.55 + len * u;
        rp.push([x + Math.cos(ang) * r, Math.max(-0.18, trunkR * 1.9 * Math.pow(1 - u, 1.7) + 0.05 - u * 0.2), z + Math.sin(ang) * r]);
        rr.push(trunkR * 0.5 * Math.pow(1 - u, 0.8) + 0.05);
      }
      bark.sweep(rp, rr, 8, 1.2, barkTint());
    }
    const top = pts[N], clumpTint = () => tintOf(rnd);
    const clump = (cx, cy, cz, radius, count) => {
      for (let k = 0; k < count; k++) {
        const a = rnd() * TAU, e = (rnd() - 0.45) * Math.PI, rr = radius * Math.cbrt(rnd());
        const ox = Math.cos(a) * Math.cos(e) * rr, oy = Math.sin(e) * rr * 0.75, oz = Math.sin(a) * Math.cos(e) * rr;
        const size = radius * (0.85 + rnd() * 0.7);
        leaf.card(cx + ox, cy + oy, cz + oz, size, size, rnd() * TAU, (rnd() - 0.5) * 1.8, (rnd() - 0.5) * 1.2, RECTS[(rnd() * 4) | 0], clumpTint(), [cx, cy - radius * 0.3, cz]);
      }
    };
    // A limb: a curve that rises, reaches out and droops a little, forking as it goes.
    const limb = (sx, sy, sz, az, elev, len, r0, depth) => {
      const lp = [], lr = [], M = 8, dx = Math.cos(az), dz = Math.sin(az);
      for (let j = 0; j <= M; j++) {
        const u = j / M, reach = len * u * Math.cos(elev), rise = len * (Math.sin(elev) * u + 0.22 * u * u) - len * 0.18 * u * u * u;
        lp.push([sx + dx * reach + (rnd() - 0.5) * len * 0.02, sy + rise, sz + dz * reach + (rnd() - 0.5) * len * 0.02]);
        lr.push(Math.max(0.03, r0 * (1 - 0.88 * u)));
      }
      bark.sweep(lp, lr, depth ? 7 : 9, 1.2, barkTint());
      const end = lp[M], r = h * (depth ? 0.085 : 0.12) * crown;
      clump(end[0], end[1], end[2], r, Math.round((depth ? 18 : 24) * dense));
      if (depth < 2) {
        for (const f of [0.5, 0.75]) {
          const q = lp[Math.round(M * f)];
          limb(q[0], q[1], q[2], az + (rnd() < 0.5 ? 1 : -1) * (0.6 + rnd() * 0.7), Math.max(0.2, elev + (rnd() - 0.5) * 0.5), len * (0.5 + rnd() * 0.2), r0 * 0.5, depth + 1);
        }
      }
    };
    const limbs = Math.round((5 + rnd() * 2) * crown);
    for (let l = 0; l < limbs; l++) {
      const frac = 0.38 + (l / limbs) * 0.6, i = Math.min(N - 1, Math.floor(frac * N)), f = frac * N - i;
      const p0 = pts[i], p1 = pts[i + 1];
      limb(p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f, p0[2] + (p1[2] - p0[2]) * f, l * 2.399 + rnd() * 0.6, 0.55 + rnd() * 0.5, h * (0.24 + rnd() * 0.14) * crown, trunkR * 0.42, 0);
    }
    clump(top[0], top[1] + h * 0.08, top[2], h * 0.14 * crown, Math.round(30 * dense));
    return trunkR;
  }

  /** A fern: a rosette of arched fronds. */
  function fern(leaf, rnd, x, z, size = 1) {
    const n = 7 + ((rnd() * 4) | 0);
    for (let k = 0; k < n; k++) {
      const a = k / n * TAU + rnd() * 0.4, tilt = 0.5 + rnd() * 0.7, s = size * (0.9 + rnd() * 0.7);
      const cx = x + Math.cos(a) * s * 0.55, cz = z + Math.sin(a) * s * 0.55, cy = s * 0.55;
      leaf.card(cx, cy, cz, s * 1.15, s * 1.3, Math.PI / 2 - a, tilt, 0, FERN, tintOf(rnd, -0.05), [x, 0, z]);
    }
  }
  /** A tuft of grass: three crossed cards. */
  function grass(leaf, rnd, x, z, size = 1) {
    for (let k = 0; k < 3; k++) leaf.card(x, size * 0.45, z, size * 1.1, size * 0.95, k * Math.PI / 3 + rnd(), 0, 0, GRASS, tintOf(rnd, 0.04));
  }
  /** A low shrub: leaf cards close to the ground. */
  function bush(leaf, rnd, x, z, size = 1.2) {
    for (let k = 0; k < 20; k++) {
      const a = rnd() * TAU, r = size * Math.sqrt(rnd()) * 0.7, y = 0.25 + rnd() * size * 0.8;
      leaf.card(x + Math.cos(a) * r, y, z + Math.sin(a) * r, size * 0.85, size * 0.85, rnd() * TAU, (rnd() - 0.5) * 1.6, (rnd() - 0.5), RECTS[(rnd() * 4) | 0], tintOf(rnd), [x, 0.2, z]);
    }
  }
  /** A hanging vine: a thin cord with leaf cards along it. */
  function vine(bark, leaf, rnd, x, y, z, len, dx = 0, dz = 0) {
    const segs = 6; let px = x, py = y, pz = z;
    for (let i = 0; i < segs; i++) {
      const nx = px + dx * 0.06 + (rnd() - 0.5) * 0.12, ny = py - len / segs, nz = pz + dz * 0.06 + (rnd() - 0.5) * 0.12;
      bark.tube([px, py, pz], [nx, ny, nz], 0.025, 0.02, 4, 1, [0.5, 0.55, 0.38]);
      if (i % 1 === 0) leaf.card(nx, ny, nz, 0.5, 0.5, rnd() * TAU, (rnd() - 0.5), (rnd() - 0.5) * 2, RECTS[(rnd() * 4) | 0], tintOf(rnd), null);
      px = nx; py = ny; pz = nz;
    }
  }
  /** Palm: a curved trunk topped with arching fronds. */
  function palm(bark, leaf, rnd, x, z, h) {
    const bx = (rnd() - 0.5) * h * 0.35, bz = (rnd() - 0.5) * h * 0.35, N = 6;
    let prev = [x, 0, z];
    for (let i = 1; i <= N; i++) {
      const t = i / N, p = [x + bx * t * t, h * t, z + bz * t * t];
      bark.tube(prev, p, 0.22 * (1 - t * 0.35), 0.22 * (1 - (i) / N * 0.35), 7, 1.5, [0.95, 0.9, 0.82]);
      prev = p;
    }
    // Fronds: each an arch of three cards, rising from the crown then drooping, planes holding the radial line.
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * TAU + rnd() * 0.3, reach = 2.6 + rnd() * 0.9;
      let fx = prev[0], fy = prev[1] + 0.1, fz = prev[2];
      for (let s = 0; s < 3; s++) {
        const elev = 0.7 - s * 0.62 + (rnd() - 0.5) * 0.15, len = reach / 3;
        const mx = fx + Math.cos(a) * Math.cos(elev) * len * 0.5, my = fy + Math.sin(elev) * len * 0.5, mz = fz + Math.sin(a) * Math.cos(elev) * len * 0.5;
        leaf.card(mx, my, mz, 1.5, len * 1.15, Math.PI / 2 - a, Math.PI / 2 - elev, (rnd() - 0.5) * 0.4, FERN, tintOf(rnd, 0), [prev[0], prev[1] - 1.2, prev[2]]);
        fx += Math.cos(a) * Math.cos(elev) * len; fy += Math.sin(elev) * len; fz += Math.sin(a) * Math.cos(elev) * len;
      }
    }
  }

  // ── Rocks ────────────────────────────────────────────────────────────────────────
  /** A boulder: an icosphere pushed around with noise, squashed and mapped like stone. */
  function rock(rnd, material, { x, y = 0, z, size, squash = 0.7, detail = 3 }) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const p = g.attributes.position, seed = rnd() * 100;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = Math.sin(v.x * 2.1 + seed) * Math.cos(v.y * 2.7 - seed) * 0.5 + Math.sin(v.z * 3.3 + v.x * 1.7 + seed) * 0.35 + Math.sin(v.x * 7.3 + v.y * 6.1 + seed * 2) * 0.12;
      const k = 1 + n * 0.32;
      p.setXYZ(i, v.x * k, v.y * k * squash, v.z * k);
    }
    g.computeVertexNormals();
    const uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + p.getZ(i) * 0.6) * size * 0.45, (p.getY(i) + p.getZ(i) * 0.4) * size * 0.45);
    g.scale(size, size, size);
    g.rotateY(rnd() * TAU);
    g.translate(x, y + size * squash * 0.55, z);
    return g;
  }

  // ── Ground and water ─────────────────────────────────────────────────────────────
  /** A copy of a shared texture with its own repeat (the canvas itself is shared). */
  function tiled(texture, rx, ry) {
    const t = texture.clone(); t.repeat.set(rx, ry); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true;
    return t;
  }
  /** Forest floor over a square of side `size` centred on the origin, mottled with moss and bare earth. */
  function ground(group, { size, y = 0.01, tile = 6, tint = [1, 1, 1], moss = 0.5, set: custom = null, seed = 31, contrast = 1 }) {
    const set = custom || soil({ moss });
    const seg = 64, g = new THREE.PlaneGeometry(size, size, seg, seg);
    const noise = fbm(128, seed, 4, 3), colors = [], pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) / size + 0.5), v = (0.5 - pos.getY(i) / size);
      const n = noise[(Math.min(127, v * 128 | 0)) * 128 + Math.min(127, u * 128 | 0)];
      const k = 1 + (n - 0.5) * 0.9 * contrast;   // large soft patches of light and dark
      const green = custom ? 0 : Math.max(0, n - 0.5) * 0.6;  // and of lush green
      colors.push(k * tint[0] * (1 - green * 0.3), k * tint[1] * (1 + green * 0.12), k * tint[2] * (1 - green * 0.35));
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tiled(set.map, size / tile, size / tile), normalMap: tiled(set.normalMap, size / tile, size / tile), normalScale: new THREE.Vector2(1.1, 1.1), vertexColors: true, roughness: 1, metalness: 0 }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = y; mesh.receiveShadow = true; mesh.raycast = () => {};
    group.add(mesh);
    return mesh;
  }
  /** A streambed of rounded gravel under a rectangle. */
  function bed(group, { x, z, w, d, y = 0.045, tile = 2.6 }) {
    const set = pebbles();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tiled(set.map, w / tile, d / tile), normalMap: tiled(set.normalMap, w / tile, d / tile), normalScale: new THREE.Vector2(1.3, 1.3), roughness: 0.9, metalness: 0 }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); mesh.receiveShadow = true; mesh.raycast = () => {};
    group.add(mesh);
    return mesh;
  }
  /**
   * Shallow water over a gravel bed: clear where you look down into it, a mirror of the sky where you look
   * across it (fresnel), with the sun glinting off drifting ripples, light playing on the stones below and
   * foam where it meets the bank. `level` is the height of the surface above the bed.
   */
  function water(group, world, { x, z, w, d, level = 0.095, bedY = 0.045, tint = 0x23605c, scale = 4.5, shallow = 0.26, flow = [0.012, 0.007] }) {
    const nm = tiled(rippleNormal(1), w / scale, d / scale);
    const wm = new THREE.MeshStandardMaterial({
      color: tint, roughness: 0.035, metalness: 0, transparent: true, depthWrite: false,
      normalMap: nm, normalScale: new THREE.Vector2(0.42, 0.42), envMapIntensity: 1.5,
    });
    wm.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
        float fres = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.6);
        diffuseColor.a = mix(${shallow.toFixed(2)}, 0.96, fres);
        #include <opaque_fragment>`);
    };
    wm.userData.shared = false;
    const surface = new THREE.Mesh(new THREE.PlaneGeometry(w, d), wm);
    surface.rotation.x = -Math.PI / 2; surface.position.set(x, level, z); surface.receiveShadow = true; surface.raycast = () => {}; surface.renderOrder = 2;
    group.add(surface);
    // Light through the ripples, drifting over the stones.
    const cm = new THREE.MeshBasicMaterial({ map: tiled(causticTexture(), w / 5, d / 5), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
    const caustics = new THREE.Mesh(new THREE.PlaneGeometry(w, d), cm);
    caustics.rotation.x = -Math.PI / 2; caustics.position.set(x, bedY + 0.008, z); caustics.raycast = () => {}; caustics.renderOrder = 1;
    group.add(caustics);
    world.tick((dt, t) => {
      nm.offset.set(t * flow[0], t * flow[1]);
      cm.map.offset.set(t * 0.02, -t * 0.015);
    });
    return { surface, caustics };
  }
  /** The Temple's water and gravel share an irregular mesh and world-space ripples. */
  function templeWater(group, world) {
    const geometry = templeWaterGeometry(THREE);
    const gravel = pebbles();
    const bedMat = new THREE.MeshStandardMaterial({
      map: tiled(gravel.map, 56 / 2.6, 56 / 2.6),
      normalMap: tiled(gravel.normalMap, 56 / 2.6, 56 / 2.6),
      roughness: .96, metalness: 0,
    });
    const bed = new THREE.Mesh(geometry.clone(), bedMat);
    bed.position.y = .043; bed.receiveShadow = true; bed.raycast = () => {};
    const caustic = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial({
      map: tiled(causticTexture(), 11, 11), transparent: true, depthWrite: false,
      opacity: .32, blending: THREE.AdditiveBlending,
    }));
    caustic.position.y = .052; caustic.renderOrder = 1; caustic.raycast = () => {};
    const time = { value: 0 };
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b6357, roughness: .075, metalness: 0, transparent: true,
      depthWrite: true, envMapIntensity: 1.22,
    });
    material.onBeforeCompile = shader => {
      shader.uniforms.waterTime = time;
      shader.vertexShader = "varying vec3 vWaterWorld;\n" + shader.vertexShader.replace("#include <project_vertex>",
        "#include <project_vertex>\nvWaterWorld=(modelMatrix*vec4(transformed,1.0)).xyz;");
      shader.fragmentShader = "varying vec3 vWaterWorld; uniform float waterTime;\n" + TEMPLE_WATER_GLSL +
        shader.fragmentShader
          .replace("#include <normal_fragment_maps>", `
            #include <normal_fragment_maps>
            vec2 slope=waterSlope(vWaterWorld.xz,waterTime);
            normal=normalize((viewMatrix*vec4(normalize(vec3(slope.x,1.,slope.y)),0.)).xyz);`)
          .replace("#include <opaque_fragment>", `
            float edge=templeBank(vWaterWorld.xz);
            float ripple=.54+.27*sin(vWaterWorld.x*6.7+vWaterWorld.z*2.2+waterTime)+
              .19*sin(vWaterWorld.z*5.2-vWaterWorld.x*3.7-waterTime*.7);
            float foam=(1.-smoothstep(.065,.44,edge))*smoothstep(.38,.9,ripple);
            float fres=pow(1.-max(0.,dot(normalize(normal),normalize(vViewPosition))),3.0);
            outgoingLight=mix(outgoingLight,vec3(.30,.38,.31),foam*.65);
            diffuseColor.a=mix(.23,.94,fres)*mix(.56,1.,smoothstep(0.,.55,edge))+foam*.14;
            #include <opaque_fragment>`);
    };
    const surface = new THREE.Mesh(geometry, material);
    surface.position.y = TEMPLE_WATER_Y;
    surface.receiveShadow = true; surface.raycast = () => {}; surface.renderOrder = 2;
    group.add(bed, caustic, surface);
    world.tick((dt, t) => {
      time.value = t % 1024;
      caustic.material.map.offset.set((t * .024) % 1, (t * -.017) % 1);
    });
    return surface;
  }
  /** A strip of foam lying along a shore, from (x0, z0) to (x1, z1). */
  function foam(group, world, x0, z0, x1, z1, width = 0.9) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const tex = foamTexture().clone(); tex.repeat.set(len / 3, 1); tex.needsUpdate = true;
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.7, fog: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, width), m);
    mesh.rotation.x = -Math.PI / 2; mesh.rotation.z = Math.atan2(z1 - z0, x1 - x0) * -1 + Math.PI; mesh.position.set((x0 + x1) / 2, 0.075, (z0 + z1) / 2); mesh.renderOrder = 3; mesh.raycast = () => {};
    group.add(mesh);
    world.tick((dt, t) => { m.opacity = 0.55 + Math.sin(t * 1.3 + x0) * 0.15; tex.offset.x = Math.sin(t * 0.3 + z0) * 0.05; });
    return mesh;
  }

  // ── Cloud noise: one tileable 3D texture the raymarched clouds read from ──────────────
  /**
   * 64³, RGBA8, tileable. R = Perlin-Worley (soft billows with cellular lumps), G/B/A = inverted Worley at 1×, 2× and 4×
   * (puffy cauliflower detail, fbm'd by the shader). The same texture serves as the large-scale weather map.
   */
  function cloudNoise3D() {
    if (textures.has("cloud3d")) return textures.get("cloud3d");
    const S = 64, data = new Uint8Array(S * S * S * 4), rnd = rngFor(321);
    const mkWorley = (N) => { const pts = new Float32Array(N * N * N * 3); for (let i = 0; i < pts.length; i++) pts[i] = rnd(); return { pts, N }; };
    const worley = ({ pts, N }, u, v, w) => {
      const px = u * N, py = v * N, pz = w * N, cx = Math.floor(px), cy = Math.floor(py), cz = Math.floor(pz);
      let best = 9;
      for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const gx = cx + i, gy = cy + j, gz = cz + k;
        const ix = ((gx % N) + N) % N, iy = ((gy % N) + N) % N, iz = ((gz % N) + N) % N, o = ((iz * N + iy) * N + ix) * 3;
        const dx = gx + pts[o] - px, dy = gy + pts[o + 1] - py, dz = gz + pts[o + 2] - pz, d = dx * dx + dy * dy + dz * dz;
        if (d < best) best = d;
      }
      return 1 - Math.min(1, Math.sqrt(best));
    };
    const lat = (cells) => { const a = new Float32Array(cells * cells * cells); for (let i = 0; i < a.length; i++) a[i] = rnd(); return [a, cells]; };
    const value = ([L, cells], x, y, z) => {
      const fx = x * cells, fy = y * cells, fz = z * cells, x0 = Math.floor(fx), y0 = Math.floor(fy), z0 = Math.floor(fz);
      const tx = fx - x0, ty = fy - y0, tz = fz - z0, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty), sz = tz * tz * (3 - 2 * tz);
      const i = (a, b, c) => L[(((c % cells) + cells) % cells * cells + ((b % cells) + cells) % cells) * cells + ((a % cells) + cells) % cells];
      const l = (a, b, t) => a + (b - a) * t;
      return l(l(l(i(x0, y0, z0), i(x0 + 1, y0, z0), sx), l(i(x0, y0 + 1, z0), i(x0 + 1, y0 + 1, z0), sx), sy), l(l(i(x0, y0, z0 + 1), i(x0 + 1, y0, z0 + 1), sx), l(i(x0, y0 + 1, z0 + 1), i(x0 + 1, y0 + 1, z0 + 1), sx), sy), sz);
    };
    const w1 = mkWorley(4), w2 = mkWorley(8), w3 = mkWorley(16), w0 = mkWorley(6);
    const p1 = lat(4), p2 = lat(8), p3 = lat(16);
    for (let z = 0; z < S; z++) for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S, w = z / S, o = ((z * S + y) * S + x) * 4;
      const perlin = value(p1, u, v, w) * 0.55 + value(p2, u, v, w) * 0.3 + value(p3, u, v, w) * 0.15;
      const pw = Math.max(0, Math.min(1, (perlin - worley(w0, u, v, w) * 0.6) / (1 - worley(w0, u, v, w) * 0.6 + 1e-3)));   // Perlin eroded by Worley lumps
      data[o] = Math.round(Math.max(0, Math.min(1, (perlin - 0.25) * 1.6 * 0.5 + pw * 0.5)) * 255);
      data[o + 1] = Math.round(worley(w1, u, v, w) * 255); data[o + 2] = Math.round(worley(w2, u, v, w) * 255); data[o + 3] = Math.round(worley(w3, u, v, w) * 255);
    }
    const t = new THREE.Data3DTexture(data, S, S, S);
    t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType; t.minFilter = t.magFilter = THREE.LinearFilter;
    t.wrapS = t.wrapT = t.wrapR = THREE.RepeatWrapping; t.unpackAlignment = 1; t.needsUpdate = true; t.userData.shared = true;
    textures.set("cloud3d", t);
    return t;
  }

  // ── Sky ──────────────────────────────────────────────────────────────────────────
  const SKY_VERT = `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position, 0.0); gl_Position = (projectionMatrix * vec4(p.xyz, 1.0)).xyww; }`;
  const SKY_FRAG = `
    varying vec3 vDir;
    uniform vec3 uSun, uZenith, uHorizon, uGround, uSunColor;
    uniform float uTime, uCloud, uStars, uTier, uCT;
    uniform sampler3D uNoise3;
    float remap(float v, float lo, float hi, float nlo, float nhi) { return nlo + (v - lo) / (hi - lo) * (nhi - nlo); }
    vec2 sphereHit(vec3 ro, vec3 rd, float r) { float b = dot(ro, rd), c = dot(ro, ro) - r * r, h = b * b - c; if (h < 0.0) return vec2(-1.0); h = sqrt(h); return vec2(-b - h, -b + h); }
    float hgp(float c, float g) { float g2 = g * g; return (1.0 - g2) / (12.566 * pow(1.0 + g2 - 2.0 * g * c, 1.5)); }
    // Cloud density at a point 'rel' metres from the viewer, 'h' = 0 at the cloud base, 1 at the top. The wind moves the
    // whole field; every drift is a whole number of texture tiles per 600 s, so the clock can wrap without a jump.
    float cdens(vec3 rel, float h, bool erode) {
      vec3 p = rel + vec3(30.0, 0.0, 10.0) * uCT;
      float wx = texture(uNoise3, vec3(p.x / 18000.0, p.z / 6000.0, 0.37)).r;
      float cov = clamp((wx - (1.0 - uCloud * 1.25)) * 3.0, 0.0, 1.0);                   // gathers into clusters, with clear sky between
      float top = mix(0.3, 0.75, cov);
      float prof = smoothstep(0.0, 0.06, h) * smoothstep(top, top * 0.5, h);             // flat base, rounded tops, taller in the thick of it
      vec4 s = texture(uNoise3, p * 0.001);
      float wf = s.g * 0.625 + s.b * 0.25 + s.a * 0.125;
      float base = clamp(remap(s.r, wf - 1.0, 1.0, 0.0, 1.0), 0.0, 1.0) * prof;
      float d = clamp(remap(base, 1.0 - cov, 1.0, 0.0, 1.0), 0.0, 1.0) * cov;
      if (erode && d > 0.0) {
        vec4 e = texture(uNoise3, (p + vec3(0.0, uCT * 10.0, 0.0)) * 0.0035);
        float hf = e.g * 0.625 + e.b * 0.25 + e.a * 0.125;
        d = clamp(remap(d, hf * 0.34 * mix(1.0, 0.6, h), 1.0, 0.0, 1.0), 0.0, 1.0);
      }
      return d;
    }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
    void main(){
      vec3 d = normalize(vDir);
      float h = clamp(d.y, 0.0, 1.0);
      vec3 col = mix(uHorizon, uZenith, pow(h, 0.5));
      if (d.y < 0.0) col = mix(uHorizon, uGround, clamp(-d.y * 5.0, 0.0, 1.0));
      vec3 sun = normalize(uSun);
      float sd = max(dot(d, sun), 0.0);
      col += uSunColor * (pow(sd, 1400.0) * 9.0 + pow(sd, 40.0) * 0.55 + pow(sd, 5.0) * 0.16);
      if (d.y > 0.015 && uCloud > 0.0 && uTier > 0.5) {
        if (uTier < 1.5) {
          // REGULAR: a flat layer of drifting noise, lit from the sun's side.
          vec2 uv = d.xz / (d.y + 0.16) * 1.35 + vec2(uTime * 0.02, uTime * 0.007);
          float c = fbm(uv * 1.25);
          float cover = smoothstep(1.0 - uCloud, 1.0 - uCloud + 0.28, c);
          float shade = fbm(uv * 1.25 + sun.xz * 0.12);
          vec3 lit = mix(vec3(0.58, 0.62, 0.70), vec3(1.0, 0.97, 0.9), clamp((c - shade) * 3.2 + 0.55, 0.0, 1.0));
          lit += uSunColor * pow(sd, 6.0) * 0.4;
          col = mix(col, lit, cover * smoothstep(0.015, 0.2, d.y));
        } else {
          // HIGH and EXTREME: volumetric cloud in a shell round a curved earth, raymarched from the ground, so
          // clouds are distinct lumps with flat bases that thin and fade toward the horizon. Weather decides where
          // clouds gather and where the sky is clear; Perlin-Worley builds the billows, Worley fbm erodes them;
          // light is attenuated through the cloud toward the sun (Beer), brightened at thin edges (powder), lifted
          // by a multiple-scattering term and pushed forward toward the sun (silver lining). It all drifts with the wind.
          bool fine = uTier > 2.5;
          int steps = fine ? 28 : 15, lsteps = fine ? 5 : 3;
          vec3 ro = vec3(0.0, 6371000.0 + 2.0, 0.0);
          float tA = sphereHit(ro, d, 6371000.0 + 1500.0).y, tB = sphereHit(ro, d, 6371000.0 + 4300.0).y;
          tB = min(tB, tA + 30000.0);
          float dt = (tB - tA) / float(steps);
          float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          float T = 1.0; vec3 C = vec3(0.0);
          float cosT = dot(d, sun);
          float phase = 0.35 + 2.6 * mix(hgp(cosT, 0.6), hgp(cosT, -0.3), 0.3);
          for (int i = 0; i < 28; i++) {
            if (i >= steps) break;
            float t = tA + (float(i) + jit) * dt;
            vec3 rel = d * t;
            float h = (length(ro + rel) - 6371000.0 - 1500.0) / 2800.0;
            float den = cdens(rel, h, fine);
            if (den > 0.004) {
              float ld = 0.0, ls = 110.0, dist = 0.0;
              for (int j = 0; j < 5; j++) {
                if (j >= lsteps) break;
                dist += ls; ls *= 1.55;
                ld += cdens(rel + sun * dist, clamp(h + sun.y * dist / 2800.0, 0.0, 1.0), false) * ls * 0.5;
              }
              float beer = exp(-ld * 0.0012), multi = 0.4 * exp(-ld * 0.0003);
              float powder = 1.0 - exp(-den * 5.0);
              vec3 sunL = uSunColor * (beer + multi) * phase * 3.2 * mix(1.0, powder, 0.7);
              vec3 amb = mix(uHorizon * 0.45, uZenith * 1.0, clamp(h, 0.0, 1.0)) * (0.3 + 0.7 * h) + 0.03;
              float a = 1.0 - exp(-den * dt * 0.0036);
              C += T * a * (sunL + amb);
              T *= 1.0 - a;
              if (T < 0.02) break;
            }
          }
          float haze = 1.0 - exp(-tA / 42000.0);                  // distant cloud dissolves into the horizon haze
          C = mix(C, uHorizon * (1.0 - T), haze);
          col = col * T + C;
        }
      }
      if (uStars > 0.0 && d.y > -0.1) {
        vec2 sp = d.xz / (abs(d.y) + 0.3) * 90.0;
        float st = step(0.9965, hash(floor(sp))) * (0.5 + 0.5 * hash(floor(sp) + 3.0));
        col += vec3(st) * uStars * smoothstep(0.0, 0.2, d.y + 0.1);
      }
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  /** A sky dome that always sits on the camera. `look` = { sun: [x,y,z], zenith, horizon, ground, sunColor, cloud, stars }. */
  function sky(look) {
    const m = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        uSun: { value: new THREE.Vector3(...look.sun) }, uZenith: { value: new THREE.Color(look.zenith) }, uHorizon: { value: new THREE.Color(look.horizon) },
        uGround: { value: new THREE.Color(look.ground ?? look.horizon) }, uSunColor: { value: new THREE.Color(look.sunColor ?? 0xfff2cf) },
        uTime: { value: 0 }, uCloud: { value: look.cloud ?? 0.4 }, uStars: { value: look.stars ?? 0 }, uTier: { value: 1 }, uCT: { value: 0 }, uNoise3: { value: (look.cloud ?? 0.4) > 0 ? cloudNoise3D() : null },
      },
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), m);
    mesh.frustumCulled = false; mesh.raycast = () => {}; mesh.renderOrder = -1000;
    return mesh;
  }

  // ── Space: stars, a milky way, a lit planet with an atmosphere, a sun ────────────
  const SPACE_FRAG = `
    varying vec3 vDir;
    uniform vec3 uSun, uPlanet;
    uniform float uTime, uRadius;
    float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float noise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float fbm(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * noise(p); p = p * 2.07 + 3.1; a *= 0.5; } return s; }
    vec3 stars(vec3 d, float scale, float density, float size){
      vec3 p = d * scale, id = floor(p), f = fract(p) - 0.5;
      float h = hash(id);
      if (h < density) return vec3(0.0);
      vec3 jit = vec3(hash(id + 1.7), hash(id + 5.3), hash(id + 9.1)) - 0.5;
      float dist = length(f - jit * 0.6);
      float k = smoothstep(size, 0.0, dist) * (0.35 + 0.65 * hash(id + 3.3));
      vec3 tint = mix(vec3(1.0, 0.72, 0.5), vec3(0.62, 0.78, 1.0), hash(id + 8.8));
      return mix(vec3(1.0), tint, 0.65) * k;
    }
    void main(){
      vec3 d = normalize(vDir), sun = normalize(uSun), pl = normalize(uPlanet);
      vec3 col = vec3(0.004, 0.006, 0.012);
      // Milky way: a band of mottled glow with dark dust lanes.
      vec3 axis = normalize(vec3(0.35, 0.8, -0.25));
      float band = exp(-pow(dot(d, axis) * 3.4, 2.0));
      float mw = fbm(d * 5.0 + 4.0), dust = fbm(d * 11.0 + 9.0);
      col += vec3(0.07, 0.075, 0.1) * band * mw * (1.3 - dust * 0.9) * 1.6;
      col += vec3(0.1, 0.06, 0.05) * band * pow(fbm(d * 3.0), 3.0) * 0.8;
      col += stars(d, 70.0, 0.9, 0.18) * 1.7 + stars(d, 140.0, 0.93, 0.14) * 1.3 + stars(d, 300.0, 0.95, 0.22) * 0.9 + stars(d, 28.0, 0.985, 0.2) * 3.2;
      col += stars(d, 120.0, 0.9, 0.2) * band * 1.4;
      // The planet: ray against a sphere sat in front of the camera.
      float D = 20.0, rr = D * sin(uRadius);
      vec3 c = pl * D;
      float b = dot(d, c), disc = b * b - (dot(c, c) - rr * rr);
      float limb = acos(clamp(dot(d, pl), -1.0, 1.0)) / uRadius;      // 1 at the edge
      if (disc > 0.0 && b > 0.0) {
        float t = b - sqrt(disc);
        vec3 n = normalize(d * t - c);
        float lat = n.y, lon = atan(n.z, n.x);
        vec3 q = vec3(n.x, n.y * 1.35, n.z) * 2.4 + vec3(0.0, 0.0, 0.0);
        float land = smoothstep(0.52, 0.58, fbm(q + 7.0) + (fbm(q * 3.0) - 0.5) * 0.18);
        float ice = smoothstep(0.78, 0.92, abs(lat) + (fbm(q * 4.0) - 0.5) * 0.2);
        float desert = smoothstep(0.45, 0.62, fbm(q * 1.7 + 20.0));
        vec3 sea = mix(vec3(0.015, 0.07, 0.2), vec3(0.04, 0.22, 0.36), smoothstep(0.35, 0.58, fbm(q + 7.0)));
        vec3 ground = mix(vec3(0.12, 0.22, 0.08), vec3(0.45, 0.36, 0.22), desert);
        vec3 base = mix(sea, ground, land);
        base = mix(base, vec3(0.9, 0.95, 1.0), ice);
        vec3 cq = n * 3.0 + vec3(uTime * 0.004, 0.0, 0.0);
        float cloud = smoothstep(0.52, 0.78, fbm(cq) + (fbm(cq * 4.0) - 0.5) * 0.25);
        vec3 surf = mix(base, vec3(1.0), cloud * 0.9);
        float ndl = dot(n, sun), lit = smoothstep(-0.08, 0.35, ndl);
        float spec = pow(max(dot(reflect(-sun, n), -d), 0.0), 40.0) * (1.0 - land) * (1.0 - cloud) * 0.7;
        vec3 night = vec3(1.0, 0.8, 0.5) * step(0.74, noise(n * 90.0)) * land * (1.0 - cloud) * 0.35 * (1.0 - lit);
        vec3 lightC = vec3(1.0, 0.97, 0.9) * (0.08 + lit * 1.5);
        float rim = pow(1.0 - clamp(dot(n, -d), 0.0, 1.0), 3.0);
        vec3 atmo = vec3(0.25, 0.5, 1.0) * rim * (0.2 + lit * 1.5);
        col = surf * lightC + vec3(spec) * lit + night + atmo;
      } else {
        // Glow of the atmosphere seen past the edge, brightest on the sunlit side.
        float past = max(limb - 1.0, 0.0);
        vec3 toEdge = normalize(d - pl * dot(d, pl));
        float sunSide = clamp(dot(toEdge, normalize(sun - pl * dot(sun, pl))) * 0.5 + 0.55, 0.0, 1.0);
        col += vec3(0.22, 0.45, 1.0) * exp(-past * 24.0) * 0.7 * sunSide;
      }
      float sd = max(dot(d, sun), 0.0);
      col += vec3(1.0, 0.96, 0.88) * (pow(sd, 3000.0) * 60.0 + pow(sd, 220.0) * 1.4 + pow(sd, 24.0) * 0.14);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;
  /** A sky of space: `look` = { sun: [x,y,z] direction, planet: [x,y,z] direction, radius (radians) }. */
  function space(look) {
    const m = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SPACE_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uSun: { value: new THREE.Vector3(...look.sun) }, uPlanet: { value: new THREE.Vector3(...look.planet) }, uTime: { value: 0 }, uRadius: { value: look.radius ?? 0.5 } },
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), m);
    mesh.frustumCulled = false; mesh.raycast = () => {}; mesh.renderOrder = -1000;
    return mesh;
  }

  /** Glass: nearly clear face-on, mirror-like edge-on (fresnel), tinted a little. Reflections come from the scene environment. */
  function glass({ tint = 0xbfe6ff, min = 0.035, max = 0.75, power = 3, envIntensity = 1.8 } = {}) {
    const m = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.02, metalness: 0, transparent: true, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: envIntensity });
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
        float gf = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), ${power.toFixed(1)});
        diffuseColor.a = mix(${min.toFixed(3)}, ${max.toFixed(3)}, gf);
        #include <opaque_fragment>`);
    };
    return m;
  }
  /** Solar-panel cells: dark blue with bus bars and a frame. */
  function solarTexture() {
    return canvasTexture("solar", 256, 512, (g, W, H) => {
      const rnd = rngFor(21);
      g.fillStyle = "#0e1c3a"; g.fillRect(0, 0, W, H);
      const cols = 4, rows = 10, cw = (W - 16) / cols, ch = (H - 16) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = 8 + c * cw + 2, y = 8 + r * ch + 2, k = 0.85 + rnd() * 0.25;
        const grad = g.createLinearGradient(x, y, x + cw, y + ch); grad.addColorStop(0, `rgb(${22 * k | 0},${52 * k | 0},${104 * k | 0})`); grad.addColorStop(1, `rgb(${12 * k | 0},${32 * k | 0},${74 * k | 0})`);
        g.fillStyle = grad; g.fillRect(x, y, cw - 4, ch - 4);
        g.strokeStyle = "rgba(170,190,230,.5)"; g.lineWidth = 1;
        for (let b = 1; b < 4; b++) { g.beginPath(); g.moveTo(x + (cw - 4) * b / 4, y); g.lineTo(x + (cw - 4) * b / 4, y + ch - 4); g.stroke(); }
        g.strokeStyle = "rgba(200,205,215,.7)"; g.beginPath(); g.moveTo(x, y + (ch - 4) / 2); g.lineTo(x + cw - 4, y + (ch - 4) / 2); g.stroke();
      }
      g.strokeStyle = "#aeb4bf"; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8);
    });
  }

  /** Image-based light from a sky look: reflections for water, glass and metal, and soft light from above. */
  function environment(renderer, look) {
    const scene = new THREE.Scene();
    const dome = look.space ? space(look) : sky(look); dome.scale.setScalar(100);
    scene.add(dome);
    const pm = new THREE.PMREMGenerator(renderer);
    const target = pm.fromScene(scene, 0, 0.1, 400);
    pm.dispose();
    dome.geometry.dispose(); dome.material.dispose();
    return target.texture;
  }

  return { motion, wake, fire, steam, cloudTexture, Mesher, molten, dirt, road, strata, shingles, tumbleTexture, cactus, butte, skyline, setFromCanvas, ground, bed, tiled, fbm, soil, pebbles, glyphs, normalFromHeight, material, tree, fern, grass, bush, vine, palm, rock, water, foam, templeWater, sky, space, glass, solarTexture, environment, windTime, leafAtlas, groundAtlas, barkTexture, canvasTexture, rngFor, mergeGeometries };
}
