/*
 * Procedural surface textures for the gauntlet environments: an albedo map plus a normal map
 * (and a roughness map where it matters) for each material, generated once on a canvas from
 * tileable value noise. Every surface tiles seamlessly and is meant to cover about `tile`
 * metres (see gauntlet-themes.js). Results are cached by key and never disposed.
 */
const TAU = Math.PI * 2;
const cache = new Map();

export function rngFor(seed) {
  let s = (seed >>> 0) || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

/** Tileable fractal value noise in 0..1, `size` x `size`. */
export function fbm(size, seed, octaves, baseCells, gain = .55) {
  const out = new Float32Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const cells = baseCells << o;
    const rnd = rngFor(seed * 131 + o * 977 + 7);
    const lattice = new Float32Array(cells * cells);
    for (let i = 0; i < lattice.length; i++) lattice[i] = rnd();
    for (let y = 0; y < size; y++) {
      const v = y / size * cells, y0 = Math.floor(v), fy = v - y0, sy = fy * fy * (3 - 2 * fy);
      const ya = (y0 % cells) * cells, yb = ((y0 + 1) % cells) * cells;
      for (let x = 0; x < size; x++) {
        const u = x / size * cells, x0 = Math.floor(u), fx = u - x0, sx = fx * fx * (3 - 2 * fx);
        const xa = x0 % cells, xb = (x0 + 1) % cells;
        const a = lattice[ya + xa], b = lattice[ya + xb], c = lattice[yb + xa], d = lattice[yb + xb];
        out[y * size + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
      }
    }
    total += amp;
    amp *= gain;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v;
const mix = (a, b, t) => a + (b - a) * t;

/**
 * Build one surface. `paint({ size, rnd, noise, color, height, rough })` runs once; it fills the
 * colour and height canvases (and optionally the roughness one) and may draw overlays on them.
 */
function surface(THREE, key, size, paint, { normal = 2.2, rough = false } = {}) {
  if (cache.has(key)) return cache.get(key);
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    return canvas;
  };
  const cc = make(), hc = make(), rc = rough ? make() : null;
  const color = cc.getContext("2d"), height = hc.getContext("2d"), roughness = rc ? rc.getContext("2d") : null;
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const rnd = rngFor(seed);
  const noise = (octaves, cells, gain, salt = 0) => fbm(size, seed + salt * 101, octaves, cells, gain);
  /** Fill the colour canvas from a function (x, y) -> [r, g, b], the height canvas from (x, y) -> 0..1. */
  const fill = (colorFn, heightFn, roughFn) => {
    const ci = color.createImageData(size, size), hi = height.createImageData(size, size);
    const ri = roughness ? roughness.createImageData(size, size) : null;
    for (let y = 0, i = 0; y < size; y++) {
      for (let x = 0; x < size; x++, i += 4) {
        const c = colorFn(x, y, i >> 2);
        ci.data[i] = clamp255(c[0]); ci.data[i + 1] = clamp255(c[1]); ci.data[i + 2] = clamp255(c[2]); ci.data[i + 3] = 255;
        const h = heightFn ? clamp255(heightFn(x, y, i >> 2) * 255) : 128;
        hi.data[i] = hi.data[i + 1] = hi.data[i + 2] = h; hi.data[i + 3] = 255;
        if (ri) {
          const r = clamp255((roughFn ? roughFn(x, y, i >> 2) : .7) * 255);
          ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = r; ri.data[i + 3] = 255;
        }
      }
    }
    color.putImageData(ci, 0, 0);
    height.putImageData(hi, 0, 0);
    if (ri) roughness.putImageData(ri, 0, 0);
  };
  paint({ size, rnd, noise, fill, color, height, roughness });

  // Normal map from the height canvas (wrapping, so it tiles).
  const hd = height.getImageData(0, 0, size, size).data;
  const nc = make(), nctx = nc.getContext("2d"), ni = nctx.createImageData(size, size);
  const at = (x, y) => hd[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  for (let y = 0, i = 0; y < size; y++) {
    for (let x = 0; x < size; x++, i += 4) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * normal, dy = (at(x, y + 1) - at(x, y - 1)) * normal;
      const inv = 1 / Math.hypot(dx, dy, 1);
      ni.data[i] = (-dx * inv * .5 + .5) * 255;
      ni.data[i + 1] = (dy * inv * .5 + .5) * 255;
      ni.data[i + 2] = (inv * .5 + .5) * 255;
      ni.data[i + 3] = 255;
    }
  }
  nctx.putImageData(ni, 0, 0);

  const tex = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const result = { map: tex(cc, true), normalMap: tex(nc, false), roughnessMap: rc ? tex(rc, false) : null, size };
  cache.set(key, result);
  return result;
}

// ---- Painting helpers ---------------------------------------------------------------------
const both = (ctx, fn) => { fn(ctx.color, ctx.height); };
const pits = (c, count, minR, maxR, dark = .5) => {
  const { size, rnd, color, height } = c;
  for (let i = 0; i < count; i++) {
    const x = rnd() * size, y = rnd() * size, r = minR + rnd() * (maxR - minR);
    color.fillStyle = `rgba(0,0,0,${(.15 + rnd() * dark).toFixed(2)})`;
    color.beginPath(); color.arc(x, y, r, 0, TAU); color.fill();
    height.fillStyle = "rgba(0,0,0,.6)";
    height.beginPath(); height.arc(x, y, r, 0, TAU); height.fill();
  }
};
const cracks = (c, count, alpha = .55, width = 1.6) => {
  const { size, rnd, color, height } = c;
  for (let i = 0; i < count; i++) {
    let x = rnd() * size, y = rnd() * size, a = rnd() * TAU;
    const steps = 8 + Math.floor(rnd() * 22);
    const path = [[x, y]];
    for (let s = 0; s < steps; s++) {
      a += (rnd() - .5) * 1.1;
      x += Math.cos(a) * (6 + rnd() * 9); y += Math.sin(a) * (6 + rnd() * 9);
      path.push([x, y]);
    }
    for (const [ctx, style, w] of [[color, `rgba(0,0,0,${alpha})`, width], [height, "rgba(0,0,0,.85)", width + .8]]) {
      ctx.strokeStyle = style; ctx.lineWidth = w; ctx.lineJoin = "round";
      ctx.beginPath(); path.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    }
  }
};
const rivet = (c, x, y, r) => {
  const { color, height } = c;
  const g = color.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
  g.addColorStop(0, "rgba(235,238,240,.9)"); g.addColorStop(1, "rgba(30,34,38,.85)");
  color.fillStyle = g; color.beginPath(); color.arc(x, y, r, 0, TAU); color.fill();
  height.fillStyle = "rgba(255,255,255,.9)"; height.beginPath(); height.arc(x, y, r, 0, TAU); height.fill();
};
const seam = (c, x0, y0, x1, y1, width = 3) => {
  const { color, height } = c;
  color.strokeStyle = "rgba(0,0,0,.55)"; color.lineWidth = width;
  color.beginPath(); color.moveTo(x0, y0); color.lineTo(x1, y1); color.stroke();
  height.strokeStyle = "rgba(0,0,0,.9)"; height.lineWidth = width;
  height.beginPath(); height.moveTo(x0, y0); height.lineTo(x1, y1); height.stroke();
  color.strokeStyle = "rgba(255,255,255,.14)"; color.lineWidth = 1;
  color.beginPath(); color.moveTo(x0 + 1.5, y0 + 1.5); color.lineTo(x1 + 1.5, y1 + 1.5); color.stroke();
};

export function createSurfaces(THREE) {
  const S = (key, size, paint, opts) => surface(THREE, key, size, paint, opts);
  return {
    /** Poured concrete: pitting, stains and hairline cracks; `ash` dusts it grey, `wet` darkens and glosses it. */
    concrete(name, { base = [128, 126, 120], stain = .5, ash = 0, wet = 0, size = 512, crack = 6 } = {}) {
      return S("concrete:" + name, size, c => {
        const n = c.noise(5, 4, .55), s = c.noise(3, 2, .6, 1), grain = c.noise(2, 64, .7, 2);
        c.fill((x, y, i) => {
          const v = .78 + n[i] * .44 + (grain[i] - .5) * .1;
          const dirt = s[i] * stain;
          let r = base[0] * v * (1 - dirt * .32), g = base[1] * v * (1 - dirt * .32), b = base[2] * v * (1 - dirt * .26);
          if (ash) { const k = ash * (.35 + n[i] * .65); r = mix(r, 150, k * .6); g = mix(g, 148, k * .6); b = mix(b, 146, k * .6); }
          if (wet) { const k = wet * (.4 + s[i] * .6); r *= 1 - k * .35; g *= 1 - k * .3; b *= 1 - k * .22; }
          return [r, g, b];
        }, (x, y, i) => n[i] * .7 + grain[i] * .3, (x, y, i) => (wet ? .35 + (1 - s[i]) * .35 : .78 + n[i] * .2));
        pits(c, Math.round(size * .55), .8, 2.6);
        cracks(c, crack);
        for (let k = 0; k < 2; k++) seam(c, 0, k * size / 2 + 2, size, k * size / 2 + 2, 2.5);
        for (let k = 0; k < 2; k++) seam(c, k * size / 2 + 2, 0, k * size / 2 + 2, size, 2.5);
        }, { rough: true });
    },
    /** Steel plate: brushed grain, panel seams with rivets, optional rust and paint wear. */
    steel(name, { base = [112, 122, 132], rust = 0, size = 512, panels = 2, paint = null } = {}) {
      return S("steel:" + name, size, c => {
        const n = c.noise(5, 3, .5), r2 = c.noise(4, 3, .6, 3), row = Array.from({ length: size }, () => c.rnd());
        c.fill((x, y, i) => {
          const brush = .86 + (row[y] - .5) * .14 + n[i] * .2;
          let r = base[0] * brush, g = base[1] * brush, b = base[2] * brush;
          if (paint) { const k = .75; r = mix(r, paint[0], k); g = mix(g, paint[1], k); b = mix(b, paint[2], k); }
          const chip = r2[i] > .6 ? (r2[i] - .6) * 2.5 : 0;
          if (paint && chip) { r = mix(r, base[0] * .8, chip); g = mix(g, base[1] * .8, chip); b = mix(b, base[2] * .8, chip); }
          if (rust) {
            const k = clampRust(r2[i] * (.6 + rust) + n[i] * .25 - .5 + rust * .4);
            r = mix(r, 138, k); g = mix(g, 70, k); b = mix(b, 36, k);
          }
          return [r, g, b];
        }, (x, y, i) => n[i] * .35 + (row[y] - .5) * .05 + .4, (x, y, i) => .38 + n[i] * .3 + (rust ? r2[i] * .3 : 0));
        const step = size / panels;
        for (let k = 0; k < panels; k++) {
          seam(c, 0, k * step + 2, size, k * step + 2, 3);
          seam(c, k * step + 2, 0, k * step + 2, size, 3);
        }
        for (let a = 0; a < panels; a++) for (let b = 0; b < panels; b++) {
          for (const [ox, oy] of [[14, 14], [step - 14, 14], [14, step - 14], [step - 14, step - 14]]) rivet(c, a * step + ox, b * step + oy, 4.4);
        }
        pits(c, 60, .8, 1.8, .3);
      }, { rough: true, normal: 2.8 });
    },
    /** Open steel grating: bars over dark voids. */
    grating(name, { base = [96, 104, 112], size = 512 } = {}) {
      return S("grating:" + name, size, c => {
        const n = c.noise(4, 4, .5);
        const cell = size / 16;
        const bar = (x, y) => {
          const fx = (x % cell) / cell, fy = (y % cell) / cell;
          return Math.min(1, Math.max(0, 1 - Math.min(Math.abs(fx - .5), Math.abs(fy - .5)) * 6.5));
        };
        c.fill((x, y, i) => {
          const hole = bar(x, y) < .55 ? 1 : 0;
          const v = (hole ? .08 : .7 + n[i] * .4);
          return [base[0] * v, base[1] * v, base[2] * v];
        }, (x, y) => (bar(x, y) < .55 ? 0 : .75), (x, y) => .4);
      }, { rough: true, normal: 3.5 });
    },
    /** Asphalt: aggregate, patched tar, and a worn painted edge line. */
    asphalt(name, { base = [58, 60, 64], line = true, size = 512 } = {}) {
      return S("asphalt:" + name, size, c => {
        const n = c.noise(5, 6, .6), t = c.noise(3, 2, .6, 4), g = c.noise(2, 96, .8, 5);
        c.fill((x, y, i) => {
          const v = .75 + n[i] * .3 + (g[i] - .5) * .5;
          const tar = t[i] > .62 ? .72 : 1;
          return [base[0] * v * tar, base[1] * v * tar, base[2] * v * tar];
        }, (x, y, i) => g[i] * .6 + n[i] * .4, (x, y, i) => .82 - (t[i] > .62 ? .3 : 0));
        if (line) {
          const wear = c.noise(3, 8, .6, 6);
          for (let y = 0; y < size; y++) for (let x = 0; x < 14; x++) {
            if (wear[y * size + x] > .38) {
              const a = (.5 + wear[y * size + x] * .6).toFixed(2);
              c.color.fillStyle = `rgba(222,214,180,${a})`;
              c.color.fillRect(x + 12, y, 1, 1);
            }
          }
        }
        cracks(c, 4, .5, 1.4);
      }, { rough: true });
    },
    /** Natural ice: clear blue body, trapped bubbles, white frost veins and a glossy surface. */
    ice(name, { size = 512 } = {}) {
      return S("ice:" + name, size, c => {
        const n = c.noise(5, 3, .55), deep = c.noise(3, 2, .6, 1), frost = c.noise(4, 5, .6, 2);
        c.fill((x, y, i) => {
          const body = .82 + n[i] * .18;
          const f = Math.max(0, frost[i] - .56) * 3.2;
          return [
            mix(176 * body, 245, f) - deep[i] * 26, mix(214 * body, 250, f) - deep[i] * 14, mix(236 * body, 255, f),
          ];
        }, (x, y, i) => n[i] * .25 + .5, (x, y, i) => .05 + frost[i] * .35);
        for (let i = 0; i < 90; i++) {
          const x = c.rnd() * size, y = c.rnd() * size, r = .8 + c.rnd() * 3.2;
          c.color.fillStyle = "rgba(255,255,255,.35)"; c.color.beginPath(); c.color.arc(x, y, r, 0, TAU); c.color.fill();
          c.height.fillStyle = "rgba(255,255,255,.25)"; c.height.beginPath(); c.height.arc(x, y, r, 0, TAU); c.height.fill();
        }
        cracks(c, 14, .22, 1.2);
        cracks(c, 6, .3, 2);
      }, { rough: true, normal: 1.4 });
    },
    /** Station composite: off-white panels, screws, vents and thin blue-grey staining. */
    composite(name, { base = [214, 218, 222], accent = [70, 150, 190], size = 512 } = {}) {
      return S("composite:" + name, size, c => {
        const n = c.noise(4, 4, .5), s = c.noise(3, 3, .6, 2);
        c.fill((x, y, i) => {
          const v = .93 + n[i] * .1 - s[i] * .08;
          return [base[0] * v, base[1] * v, base[2] * v];
        }, (x, y, i) => n[i] * .2 + .5, () => .45);
        const step = size / 2;
        for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
          seam(c, a * step + 2, b * step + 2, a * step + step, b * step + 2, 2.5);
          seam(c, a * step + 2, b * step + 2, a * step + 2, b * step + step, 2.5);
          for (const [ox, oy] of [[18, 18], [step - 18, 18], [18, step - 18], [step - 18, step - 18]]) rivet(c, a * step + ox, b * step + oy, 3.2);
          c.color.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},.85)`;
          c.color.fillRect(a * step + 38, b * step + step - 34, 70, 6);
          for (let v = 0; v < 5; v++) seam(c, a * step + step - 110, b * step + 40 + v * 9, a * step + step - 46, b * step + 40 + v * 9, 2);
        }
        pits(c, 40, .7, 1.4, .2);
      }, { rough: true });
    },
    /** Ship hull plating: dark blue-grey with bolted panels and thin light seams. */
    hull(name, { base = [70, 80, 96], size = 512 } = {}) {
      return S("hull:" + name, size, c => {
        const n = c.noise(5, 3, .5), row = Array.from({ length: size }, () => c.rnd());
        c.fill((x, y, i) => {
          const v = .84 + n[i] * .3 + (row[y] - .5) * .05;
          return [base[0] * v, base[1] * v, base[2] * v];
        }, (x, y, i) => n[i] * .3 + .45, (x, y, i) => .32 + n[i] * .25);
        const cellW = size / 2, cellH = size / 4;
        for (let a = 0; a < 2; a++) for (let b = 0; b < 4; b++) {
          seam(c, a * cellW + 2, b * cellH + 2, a * cellW + cellW, b * cellH + 2, 3);
          seam(c, a * cellW + 2, b * cellH + 2, a * cellW + 2, b * cellH + cellH, 3);
          for (const [ox, oy] of [[12, 12], [cellW - 12, 12], [12, cellH - 12], [cellW - 12, cellH - 12]]) rivet(c, a * cellW + ox, b * cellH + oy, 3.6);
        }
        pits(c, 50, .7, 1.6, .3);
      }, { rough: true, normal: 3 });
    },
    /** Rock and regolith: rust-red grit with pebbles and dust drifts. */
    regolith(name, { base = [150, 84, 56], size = 512 } = {}) {
      return S("regolith:" + name, size, c => {
        const n = c.noise(6, 4, .6), d = c.noise(3, 2, .6, 2), g = c.noise(2, 96, .8, 3);
        c.fill((x, y, i) => {
          const v = .66 + n[i] * .6 + (g[i] - .5) * .2;
          const dust = d[i] > .55 ? (d[i] - .55) * .9 : 0;
          return [mix(base[0] * v, 214, dust), mix(base[1] * v, 160, dust), mix(base[2] * v, 118, dust)];
        }, (x, y, i) => n[i] * .85 + g[i] * .15, () => .92);
        pits(c, 180, 1, 3.4, .45);
        cracks(c, 5, .4, 1.8);
      }, { rough: true, normal: 3.2 });
    },
    /** Weathered planks with grain, seams and nail heads. */
    wood(name, { base = [132, 92, 56], size = 512, planks = 4, grey = 0 } = {}) {
      return S("wood:" + name, size, c => {
        const n = c.noise(5, 2, .5), grain = c.noise(3, 48, .6, 3);
        const ph = size / planks, tone = Array.from({ length: planks }, () => .72 + c.rnd() * .45);
        c.fill((x, y, i) => {
          const p = Math.min(planks - 1, Math.floor(y / ph));
          const v = tone[p] * (.8 + n[i] * .32) * (.88 + grain[i] * .24);
          return [mix(base[0] * v, 142 * v, grey), mix(base[1] * v, 134 * v, grey), mix(base[2] * v, 124 * v, grey)];
        }, (x, y, i) => grain[i] * .5 + n[i] * .3 + .3, (x, y, i) => .72 + n[i] * .25);
        for (let k = 0; k < planks; k++) seam(c, 0, k * ph + 1, size, k * ph + 1, 3);
        for (let k = 0; k < planks; k++) for (const nx of [20, size - 20]) rivet(c, nx, k * ph + ph / 2, 3.2);
        pits(c, 36, .8, 1.6, .35);
        cracks(c, 4, .4, 1.2);
      }, { rough: true, normal: 2.6 });
    },
    /** Cut stone blocks laid in courses with mortar, wear and optional moss. */
    stone(name, { base = [150, 140, 120], moss = 0, size = 512, blocks = 4 } = {}) {
      return S("stone:" + name, size, c => {
        const n = c.noise(5, 3, .55), m = c.noise(4, 3, .6, 2), grit = c.noise(2, 64, .7, 4);
        const bh = size / blocks, tone = Array.from({ length: blocks * 3 }, () => .78 + c.rnd() * .4);
        c.fill((x, y, i) => {
          const row = Math.min(blocks - 1, Math.floor(y / bh)), off = (row % 2) * (size / blocks / 2);
          const col = Math.floor(((x + off) % size) / (size / blocks));
          const v = tone[row * 3 + (col % 3)] * (.82 + n[i] * .3) + (grit[i] - .5) * .08;
          let r = base[0] * v, g = base[1] * v, b = base[2] * v;
          if (moss) { const k = Math.max(0, m[i] * moss * 1.6 - .28) * (1 - y / size * .3); r = mix(r, 64, k); g = mix(g, 98, k); b = mix(b, 46, k); }
          return [r, g, b];
        }, (x, y, i) => n[i] * .6 + grit[i] * .25 + .3, (x, y, i) => .82 + n[i] * .15);
        for (let r = 0; r < blocks; r++) {
          seam(c, 0, r * bh + 2, size, r * bh + 2, 4);
          const off = (r % 2) * (size / blocks / 2);
          for (let k = 0; k <= blocks; k++) seam(c, (k * size / blocks + off) % size + 2, r * bh, (k * size / blocks + off) % size + 2, (r + 1) * bh, 4);
        }
        pits(c, 140, .8, 2.4, .5);
        cracks(c, 6, .5, 1.6);
      }, { rough: true, normal: 3 });
    },
    /** Wind-rippled sand with scattered pebbles. */
    sand(name, { base = [204, 168, 116], size = 512 } = {}) {
      return S("sand:" + name, size, c => {
        const n = c.noise(5, 3, .55), w = c.noise(3, 2, .6, 5);
        const ripple = (x, y) => .5 + .5 * Math.sin((x * .9 + y * .35 + w[(y | 0) * size + (x | 0)] * 90) * TAU / size * 9);
        c.fill((x, y, i) => {
          const r = ripple(x, y), v = .84 + n[i] * .3 + r * .1;
          return [base[0] * v, base[1] * v, base[2] * v];
        }, (x, y, i) => ripple(x, y) * .5 + n[i] * .35, () => .95);
        pits(c, 200, .7, 1.6, .25);
      }, { rough: true, normal: 2 });
    },
    /** Factory floor: dark painted slab, broken wet patches and a worn yellow safety line. */
    factory(name, { base = [66, 68, 72], size = 512 } = {}) {
      return S("factory:" + name, size, c => {
        const n = c.noise(5, 5, .55), puddleForm = c.noise(5, 8, .58, 2), puddleBreakup = c.noise(4, 23, .58, 9);
        c.fill((x, y, i) => {
          const v = .82 + n[i] * .3;
          const wetness = puddleForm[i] * .78 + puddleBreakup[i] * .22;
          const edge = THREE.MathUtils.smoothstep(wetness, .64, .77);
          const o = edge * .52;
          return [base[0] * v * (1 - o * .27), base[1] * v * (1 - o * .25), base[2] * v * (1 - o * .22)];
        }, (x, y, i) => {
          const wetness = puddleForm[i] * .78 + puddleBreakup[i] * .22;
          const edge = THREE.MathUtils.smoothstep(wetness, .64, .77);
          return n[i] * .38 + edge * .055 + .32;
        }, (x, y, i) => {
          const wetness = puddleForm[i] * .78 + puddleBreakup[i] * .22;
          const edge = THREE.MathUtils.smoothstep(wetness, .64, .77);
          return .76 * (1 - edge) + (.19 + puddleBreakup[i] * .08) * edge;
        });
        const wear = c.noise(3, 10, .6, 5);
        for (let y = 0; y < size; y++) for (let x = 0; x < 22; x++) {
          const w = wear[y * size + x];
          if (w > .3) { c.color.fillStyle = `rgba(214,170,30,${(.45 + w * .6).toFixed(2)})`; c.color.fillRect(x + 8, y, 1, 1); }
        }
        pits(c, 120, .8, 2.2);
        cracks(c, 5, .45, 1.4);
      }, { rough: true });
    },
  };
}

function clampRust(v) { return v < 0 ? 0 : v > .85 ? .85 : v; }
export { both };
