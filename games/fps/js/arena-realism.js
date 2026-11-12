/**
 * Arena-only surface realism for the zombie maze (map id "arena").
 *
 * The maze walls already carry a normal-mapped photo texture with a world-space grime
 * shader. The floor and ceiling, by contrast, used a flat 256px canvas with no relief, so
 * under the moving flashlight the ground read as painted lino and the ceiling as a blank
 * card. This module bakes proper sealed-concrete surfaces for the arena only — aggregate
 * speckle, hairline cracks, pooled grime and damp patches — each with a matching normal
 * map (so the torch rakes across the relief) and a roughness map (so damp patches catch a
 * faint sheen). Nothing here adds light or lifts the maze's overall brightness: the baked
 * albedo matches the old effective floor/ceiling tone, the flashlight stays the key light.
 *
 * Everything is procedural and seamless (wrap-tileable value noise), cached once, and
 * flagged userData._cachedShared so the per-chunk unloader never disposes it. The materials
 * are plain MeshStandardMaterials, so the shared texture-detail toggle (applyTextureDetail)
 * degrades them generically when "Texture detail" is off.
 */
export function createArenaRealism(THREE, opts = {}) {
  const anisotropy = typeof opts.anisotropy === "function" ? opts.anisotropy : () => 1;
  const TEX = 512;

  // ── Seeded RNG + seamless value noise ───────────────────────────────────────────────
  function mulberry(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Tileable value-noise octave at `cells` resolution over the TEX canvas (wraps at edges).
  function octave(cells, rnd) {
    const grid = new Float32Array(cells * cells);
    for (let i = 0; i < grid.length; i++) grid[i] = rnd();
    const v = (a, b) => grid[((b % cells + cells) % cells) * cells + ((a % cells + cells) % cells)];
    return (x, y) => {
      const fx = (x / TEX) * cells, fy = (y / TEX) * cells;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = v(x0, y0) + (v(x0 + 1, y0) - v(x0, y0)) * sx;
      const b = v(x0, y0 + 1) + (v(x0 + 1, y0 + 1) - v(x0, y0 + 1)) * sx;
      return a + (b - a) * sy;
    };
  }

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  // Toroidal distance so cracks/stains drawn near an edge wrap to the far side (seamless).
  function wrapDist(ax, ay, bx, by) {
    let dx = Math.abs(ax - bx), dy = Math.abs(ay - by);
    if (dx > TEX / 2) dx = TEX - dx;
    if (dy > TEX / 2) dy = TEX - dy;
    return Math.hypot(dx, dy);
  }

  /**
   * Build an {albedo, normal, roughness} surface. `cfg` tunes the look per surface role.
   * Returns height[] so the normal map is derived from the exact same relief.
   */
  function bakeConcrete(cfg) {
    const N = TEX;
    const rnd = mulberry(cfg.seed);
    const oBlotch = octave(6, rnd);      // large tonal blotches (slab pours)
    const oMid = octave(24, rnd);        // medium mottle
    const oGrain = octave(96, rnd);      // fine aggregate
    const oFine = octave(220, rnd);      // micro speckle

    const height = new Float32Array(N * N);
    const stain = new Float32Array(N * N);  // 0..1 dark grime / damp
    const wet = new Float32Array(N * N);    // 0..1 smoother/darker damp sheen

    // Base relief: concrete is mostly flat with shallow pitting; aggregate pops here and there.
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        const grain = oGrain(x, y), fine = oFine(x, y), mid = oMid(x, y);
        let h = 0.5 + (mid - 0.5) * 0.35 + (grain - 0.5) * 0.45 + (fine - 0.5) * 0.3;
        // sparse popped aggregate / chips (tiny bright-raised or dark-pitted specks)
        const r = rnd();
        if (r < 0.006) h += 0.35 + rnd() * 0.25;
        else if (r < 0.015) h -= 0.3 + rnd() * 0.3;
        height[i] = clamp01(h);
      }
    }

    // Hairline cracks: random-walk polylines, cut into the height and darkened in albedo.
    const crackCount = cfg.cracks | 0;
    for (let c = 0; c < crackCount; c++) {
      let x = rnd() * N, y = rnd() * N;
      let ang = rnd() * Math.PI * 2;
      const len = 60 + rnd() * 240;
      const depth = 0.4 + rnd() * 0.4;
      for (let s = 0; s < len; s++) {
        ang += (rnd() - 0.5) * 0.5;
        x = (x + Math.cos(ang) + N) % N;
        y = (y + Math.sin(ang) + N) % N;
        const ix = x | 0, iy = y | 0;
        // taper width along the crack
        const w = s < len * 0.15 || s > len * 0.85 ? 0 : 1;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const px = (ix + ox + N) % N, py = (iy + oy + N) % N;
            const fall = oy === 0 && ox === 0 ? 1 : 0.4;
            const i = py * N + px;
            height[i] = clamp01(height[i] - depth * fall * w);
            stain[i] = clamp01(stain[i] + 0.5 * fall * w);
          }
        }
      }
    }

    // Grime / damp patches: soft dark pools (floor) or ceiling leaks + rust bleed.
    const patchCount = cfg.patches | 0;
    for (let p = 0; p < patchCount; p++) {
      const cx = rnd() * N, cy = rnd() * N;
      const rad = cfg.patchMin + rnd() * cfg.patchMax;
      const strength = 0.3 + rnd() * cfg.patchStrength;
      const damp = rnd() < cfg.wetChance;
      const i0x = Math.ceil(cx - rad), i1x = Math.ceil(cx + rad);
      const i0y = Math.ceil(cy - rad), i1y = Math.ceil(cy + rad);
      for (let y = i0y; y <= i1y; y++) {
        for (let x = i0x; x <= i1x; x++) {
          const d = wrapDist(x, y, cx, cy);
          if (d > rad) continue;
          // irregular edge via noise
          const edge = 1 - d / rad;
          const px = (x + N) % N, py = (y + N) % N;
          const n = oMid(px, py);
          const falloff = clamp01(edge * (0.6 + n * 0.8));
          const i = py * N + px;
          stain[i] = clamp01(stain[i] + strength * falloff);
          if (damp) wet[i] = clamp01(wet[i] + strength * falloff * 1.2);
        }
      }
    }

    // Ceiling form-board seams: faint parallel grooves + perpendicular panel joints.
    if (cfg.seams) {
      const panel = N / 3;
      for (let k = 0; k <= 3; k++) {
        const sx = Math.round(k * panel) % N;
        const sy = Math.round(k * panel) % N;
        for (let t = 0; t < N; t++) {
          for (const [gx, gy] of [[sx, t], [t, sy]]) {
            const i = ((gy % N) * N + (gx % N));
            height[i] = clamp01(height[i] - 0.22);
            stain[i] = clamp01(stain[i] + 0.22);
            // 1px soft shoulder
            const i2 = ((gy % N) * N + ((gx + 1) % N));
            height[i2] = clamp01(height[i2] - 0.08);
          }
        }
      }
    }

    // ── Compose albedo + roughness ──────────────────────────────────────────────────
    const albedo = new Uint8ClampedArray(N * N * 4);
    const rough = new Uint8ClampedArray(N * N * 4);
    const base = cfg.base;          // {r,g,b} 0..255 display concrete tone
    const tintA = cfg.blotchTint;   // subtle hue drift across pours
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        const h = height[i];
        const blot = oBlotch(x, y) - 0.5;
        const s = stain[i];
        const w = wet[i];
        // tonal: height lifts/darkens; blotch drifts cool/warm; stain darkens; damp darkens more
        const lift = (h - 0.5) * cfg.contrast;
        const shade = 1 + lift - s * cfg.stainDark - w * 0.22;
        let r = base.r * shade + blot * tintA.r;
        let g = base.g * shade + blot * tintA.g;
        let b = base.b * shade + blot * tintA.b;
        // rust tinge where a ceiling leak bleeds
        if (cfg.rust && s > 0.35 && w > 0.2) {
          const rr = (s - 0.35) * cfg.rust;
          r += rr * 46; g += rr * 20; b += rr * 6;
        }
        const p = i * 4;
        albedo[p] = r; albedo[p + 1] = g; albedo[p + 2] = b; albedo[p + 3] = 255;
        // roughness: dry concrete is very rough; damp patches smoother (catch a faint sheen)
        const rv = clamp01(cfg.roughBase - w * 0.4 - s * 0.08 + (h - 0.5) * 0.1);
        const rq = rv * 255;
        rough[p] = rq; rough[p + 1] = rq; rough[p + 2] = rq; rough[p + 3] = 255;
      }
    }

    // ── Normal map from height (Sobel, wrapped) ──────────────────────────────────────
    const normal = new Uint8ClampedArray(N * N * 4);
    const at = (x, y) => height[((y + N) % N) * N + ((x + N) % N)];
    const strength = cfg.normalStrength;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1))
                 - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
        const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1))
                 - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
        let nx = -dx * strength, ny = dy * strength, nz = 1;
        const l = 1 / Math.hypot(nx, ny, nz);
        const p = (y * N + x) * 4;
        normal[p] = (nx * l * 0.5 + 0.5) * 255;
        normal[p + 1] = (ny * l * 0.5 + 0.5) * 255;
        normal[p + 2] = (nz * l * 0.5 + 0.5) * 255;
        normal[p + 3] = 255;
      }
    }

    return {
      albedo: toTexture(albedo, THREE.SRGBColorSpace),
      normal: toTexture(normal, THREE.NoColorSpace),
      rough: toTexture(rough, THREE.NoColorSpace),
    };
  }

  function toTexture(data, colorSpace) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = TEX;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(new ImageData(data, TEX, TEX), 0, 0);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = colorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = anisotropy();
    t.needsUpdate = true;
    return t;
  }

  const cache = new Map();   // surface -> material

  const CONFIG = {
    floor: {
      seed: 0x9e3a71, base: { r: 95, g: 97, b: 96 }, blotchTint: { r: 10, g: 8, b: 4 },
      contrast: 0.34, stainDark: 0.5, roughBase: 0.9, normalStrength: 2.6,
      cracks: 10, patches: 26, patchMin: 24, patchMax: 120, patchStrength: 0.55,
      wetChance: 0.45, seams: false, rust: 0, metalness: 0.0,
    },
    ceiling: {
      seed: 0x4c1d8b, base: { r: 86, g: 89, b: 92 }, blotchTint: { r: 6, g: 8, b: 12 },
      contrast: 0.22, stainDark: 0.42, roughBase: 0.95, normalStrength: 1.9,
      cracks: 5, patches: 16, patchMin: 30, patchMax: 150, patchStrength: 0.5,
      wetChance: 0.6, seams: true, rust: 1.0, metalness: 0.0,
    },
  };

  function material(surface, repeat) {
    let mat = cache.get(surface);
    if (mat) return mat;
    const cfg = CONFIG[surface] || CONFIG.floor;
    const { albedo, normal, rough } = bakeConcrete(cfg);
    for (const t of [albedo, normal, rough]) t.repeat.set(repeat, repeat);
    mat = new THREE.MeshStandardMaterial({
      map: albedo,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: rough,
      roughness: 1.0,
      metalness: cfg.metalness,
      color: 0xffffff,
    });
    mat.userData = mat.userData || {};
    mat.userData._cachedShared = true;
    cache.set(surface, mat);
    return mat;
  }

  function setAnisotropy(a) {
    for (const mat of cache.values()) {
      for (const t of [mat.map, mat.normalMap, mat.roughnessMap]) {
        if (t) { t.anisotropy = a; t.needsUpdate = true; }
      }
    }
  }

  return {
    floorMaterial: (repeat) => material("floor", repeat),
    ceilingMaterial: (repeat) => material("ceiling", repeat),
    setAnisotropy,
  };
}
