/*
 * Gauntlet obstacle art: procedural canvas textures and lit materials for the decks, doors,
 * fields, nodes and hazards that gauntlet-runtime.js places. Textures and the materials
 * built from them are cached at module level and flagged `userData.shared`, so clearing a
 * course never disposes them. Per-piece materials (anything the runtime recolours) are
 * created fresh and disposed with the piece.
 */
import { fbm } from "./gauntlet-surfaces.js?v=3";

const TAU = Math.PI * 2;
const cache = new Map();

export function createGauntletArt(THREE, { decorate, solid, scroll, spin, tick, style = null }) {
  const noRay = mesh => { mesh.raycast = () => {}; return mesh; };
  const add = mesh => { decorate(noRay(mesh)); return mesh; };

  // ---- Textures -------------------------------------------------------------------------
  function texture(key, w, h, paint, wrap = true) {
    const hit = cache.get("t:" + key);
    if (hit) return hit;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    let seed = 90210 + key.length * 977;
    const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    paint(canvas.getContext("2d"), w, h, rnd);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    if (wrap) map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 4;
    cache.set("t:" + key, map);
    return map;
  }
  /** A per-piece copy of a cached texture, so its repeat/offset can differ and animate. */
  function copy(map, repeatX = 1, repeatY = 1) {
    const clone = map.clone();
    clone.repeat.set(repeatX, repeatY);
    clone.needsUpdate = true;
    return clone;
  }
  function shared(key, build) {
    let m = cache.get("m:" + key);
    if (!m) {
      m = build();
      m.userData.shared = true;
      cache.set("m:" + key, m);
    }
    return m;
  }

  const rivet = (g, x, y, r) => {
    const fill = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    fill.addColorStop(0, "#dfe4e8");
    fill.addColorStop(1, "#39414a");
    g.fillStyle = fill;
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  };
  const scuffs = (g, w, h, rnd, count, alpha) => {
    for (let i = 0; i < count; i++) {
      g.fillStyle = `rgba(${rnd() < .5 ? "0,0,0" : "255,255,255"},${(rnd() * alpha).toFixed(3)})`;
      g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 9, 1 + rnd() * 2);
    }
  };
  const frame = (g, w, h) => {
    g.fillStyle = "rgba(0,0,0,.38)";
    g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5); g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
    g.fillStyle = "rgba(255,255,255,.14)";
    g.fillRect(5, 5, w - 10, 2); g.fillRect(5, 5, 2, h - 10);
  };

  const plateMap = () => texture("plate", 256, 256, (g, w, h, rnd) => {
    const base = g.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#8a95a0");
    base.addColorStop(1, "#5f6a75");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.lineCap = "round";
    g.lineWidth = 4;
    for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) {
      const x = 20 + i * 27, y = 20 + j * 27, up = (i + j) % 2 === 0 ? 6 : -6;
      g.strokeStyle = "rgba(255,255,255,.12)";
      g.beginPath(); g.moveTo(x - 6, y + up); g.lineTo(x + 6, y - up); g.stroke();
      g.strokeStyle = "rgba(0,0,0,.2)";
      g.beginPath(); g.moveTo(x - 6, y + up + 3); g.lineTo(x + 6, y - up + 3); g.stroke();
    }
    frame(g, w, h);
    for (const [x, y] of [[17, 17], [w - 17, 17], [17, h - 17], [w - 17, h - 17]]) rivet(g, x, y, 5);
    scuffs(g, w, h, rnd, 150, .22);
  });
  const panelMap = () => texture("panel", 128, 256, (g, w, h, rnd) => {
    g.fillStyle = "#56636f";
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) {
      const rib = g.createLinearGradient(x, 0, x + 16, 0);
      rib.addColorStop(0, "rgba(255,255,255,.14)");
      rib.addColorStop(.5, "rgba(0,0,0,0)");
      rib.addColorStop(1, "rgba(0,0,0,.26)");
      g.fillStyle = rib;
      g.fillRect(x, 0, 16, h);
    }
    frame(g, w, h);
    g.fillStyle = "rgba(0,0,0,.4)";
    g.fillRect(0, h / 2 - 2, w, 4);
    for (const [x, y] of [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14], [14, h / 2], [w - 14, h / 2]]) rivet(g, x, y, 4);
    const grime = g.createLinearGradient(0, h * .6, 0, h);
    grime.addColorStop(0, "rgba(20,16,10,0)");
    grime.addColorStop(1, "rgba(20,16,10,.45)");
    g.fillStyle = grime;
    g.fillRect(0, h * .6, w, h * .4);
    scuffs(g, w, h, rnd, 120, .2);
  });
  const doorMap = () => texture("door", 128, 128, (g, w, h, rnd) => {
    g.fillStyle = "#383d44";
    g.fillRect(0, 0, w, h);
    for (const y of [0, h - 22]) {
      g.fillStyle = "#e0a916";
      g.fillRect(0, y, w, 22);
      g.fillStyle = "#17130f";
      for (let x = -32; x < w + 32; x += 32) {
        g.beginPath();
        g.moveTo(x, y + 22); g.lineTo(x + 12, y + 22); g.lineTo(x + 34, y); g.lineTo(x + 22, y);
        g.fill();
      }
    }
    g.fillStyle = "#23272d";
    g.fillRect(20, 30, w - 40, h - 60);
    g.strokeStyle = "rgba(255,255,255,.18)";
    g.lineWidth = 2;
    g.strokeRect(20, 30, w - 40, h - 60);
    const lamp = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, 20);
    lamp.addColorStop(0, "#ffd9a0");
    lamp.addColorStop(.45, "#f0a24a");
    lamp.addColorStop(1, "rgba(240,162,74,0)");
    g.fillStyle = lamp;
    g.fillRect(w / 2 - 22, h / 2 - 22, 44, 44);
    for (const [x, y] of [[10, 10], [w - 10, 10], [10, h - 10], [w - 10, h - 10]]) rivet(g, x, y, 3.5);
    scuffs(g, w, h, rnd, 90, .2);
  });
  const stripeMap = (name, a, b) => texture("stripe-" + name, 128, 128, (g, w, h, rnd) => {
    g.fillStyle = a;
    g.fillRect(0, 0, w, h);
    g.fillStyle = b;
    for (let i = -2; i < 6; i++) {
      g.beginPath();
      g.moveTo(i * 32, h); g.lineTo(i * 32 + 16, h); g.lineTo(i * 32 + 48, 0); g.lineTo(i * 32 + 32, 0);
      g.fill();
    }
    scuffs(g, w, h, rnd, 160, .24);
  });
  const chevronMap = () => texture("chevron", 128, 128, g => {
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#fff";
    g.shadowColor = "#fff";
    g.shadowBlur = 10;
    g.lineWidth = 15;
    for (const y of [50, 108]) {
      g.beginPath(); g.moveTo(24, y); g.lineTo(64, y - 32); g.lineTo(104, y); g.stroke();
    }
  });
  const glowMap = () => texture("glow", 64, 64, (g, w, h) => {
    const v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, "rgba(255,255,255,0)");
    v.addColorStop(.5, "rgba(255,255,255,1)");
    v.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = v;
    g.fillRect(0, 0, w, h);
    const u = g.createLinearGradient(0, 0, w, 0);
    u.addColorStop(0, "rgba(0,0,0,.2)"); u.addColorStop(.12, "rgba(0,0,0,1)");
    u.addColorStop(.88, "rgba(0,0,0,1)"); u.addColorStop(1, "rgba(0,0,0,.2)");
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = u;
    g.fillRect(0, 0, w, h);
  }, false);
  const radialMap = () => texture("radial", 128, 128, g => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(.35, "rgba(255,255,255,.5)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  }, false);
  const swirlMap = () => texture("swirl", 128, 128, g => {
    g.translate(64, 64);
    g.lineCap = "round";
    for (let arm = 0; arm < 3; arm++) {
      g.beginPath();
      for (let r = 4; r < 60; r += 2) {
        const a = arm * TAU / 3 + r * .11;
        g[r === 4 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
      }
      g.strokeStyle = "rgba(255,255,255,.75)";
      g.lineWidth = 7;
      g.stroke();
    }
    const core = g.createRadialGradient(0, 0, 0, 0, 0, 64);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(.4, "rgba(255,255,255,.25)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = core;
    g.fillRect(-64, -64, 128, 128);
  }, false);
  const waterSurface = () => {
    const hit = cache.get("water-surface");
    if (hit) return hit;
    const size = 512;
    const broad = fbm(size, 141, 5, 4), flow = fbm(size, 163, 5, 9), fine = fbm(size, 181, 4, 22);
    const colorCanvas = document.createElement("canvas"), normalCanvas = document.createElement("canvas");
    colorCanvas.width = colorCanvas.height = normalCanvas.width = normalCanvas.height = size;
    const cc = colorCanvas.getContext("2d"), nc = normalCanvas.getContext("2d");
    const colors = cc.createImageData(size, size), normals = nc.createImageData(size, size);
    const height = new Float32Array(size * size);
    for (let i = 0; i < height.length; i++) {
      const turbulence = broad[i] * .62 + flow[i] * .28 + fine[i] * .10;
      height[i] = .5 + (turbulence - .5) * .23 + (fine[i] - .5) * .035;
      const glint = Math.max(0, (flow[i] * .62 + fine[i] * .38 - .64) / .36);
      const shade = .76 + broad[i] * .18 + fine[i] * .09;
      const k = i * 4;
      colors.data[k] = 25 * shade + glint * 18;
      colors.data[k + 1] = 46 * shade + glint * 29;
      colors.data[k + 2] = 55 * shade + glint * 35;
      colors.data[k + 3] = 255;
    }
    const at = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];
    for (let y = 0, i = 0; y < size; y++) for (let x = 0; x < size; x++, i += 4) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 5.5;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 5.5;
      const inv = 1 / Math.hypot(dx, dy, 1);
      normals.data[i] = (-dx * inv * .5 + .5) * 255;
      normals.data[i + 1] = (dy * inv * .5 + .5) * 255;
      normals.data[i + 2] = (inv * .5 + .5) * 255;
      normals.data[i + 3] = 255;
    }
    cc.putImageData(colors, 0, 0); nc.putImageData(normals, 0, 0);
    const map = new THREE.CanvasTexture(colorCanvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.colorSpace = THREE.NoColorSpace;
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    map.anisotropy = normalMap.anisotropy = 4;
    const result = { map, normalMap };
    cache.set("water-surface", result);
    return result;
  };
  const iceMap = () => texture("ice", 128, 128, (g, w, h, rnd) => {
    const base = g.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#d6f0fb");
    base.addColorStop(1, "#8fc6e0");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) {
      g.strokeStyle = `rgba(255,255,255,${(.25 + rnd() * .45).toFixed(2)})`;
      g.lineWidth = 1 + rnd() * 2;
      const x = rnd() * w, y = rnd() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + rnd() * 40, y + 8 + rnd() * 20); g.stroke();
    }
  });
  const gooMap = () => texture("goo", 128, 128, (g, w, h, rnd) => {
    g.fillStyle = "#3a2058";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 22;
      const blob = g.createRadialGradient(x - r * .25, y - r * .25, 1, x, y, r);
      blob.addColorStop(0, "rgba(206,150,255,.9)");
      blob.addColorStop(.6, "rgba(120,60,180,.65)");
      blob.addColorStop(1, "rgba(60,30,100,0)");
      g.fillStyle = blob;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
  });
  const bullseyeMap = () => texture("bullseye", 128, 128, g => {
    g.fillStyle = "#1a1e23";
    g.fillRect(0, 0, 128, 128);
    [[60, "#d6463a"], [48, "#f1f1ee"], [36, "#d6463a"], [23, "#f1f1ee"], [10, "#d6463a"]].forEach(([r, c]) => {
      g.fillStyle = c;
      g.beginPath(); g.arc(64, 64, r, 0, TAU); g.fill();
      g.strokeStyle = "rgba(0,0,0,.45)";
      g.lineWidth = 1.5;
      g.stroke();
    });
  }, false);
  const hexMap = () => texture("hex", 128, 128, g => {
    g.strokeStyle = "rgba(255,255,255,.9)";
    g.lineWidth = 3;
    for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
      const cx = 12 + col * 31 + (row % 2) * 15.5, cy = 12 + row * 27, r = 17;
      g.beginPath();
      for (let k = 0; k < 6; k++) g[k ? "lineTo" : "moveTo"](cx + Math.cos(k * TAU / 6 + TAU / 12) * r, cy + Math.sin(k * TAU / 6 + TAU / 12) * r);
      g.closePath();
      g.stroke();
    }
  });

  // ---- Shared materials -------------------------------------------------------------------
  const steel = (tone, mix = .2) => shared(`steel:${tone}:${mix}`, () => new THREE.MeshStandardMaterial({
    map: plateMap(), roughness: .58, metalness: .42,
    color: new THREE.Color(0xc7d0d8).lerp(new THREE.Color(tone), mix),
  }));
  const panel = tone => shared("panel:" + tone, () => new THREE.MeshStandardMaterial({
    map: panelMap(), roughness: .62, metalness: .38,
    color: new THREE.Color(0xd2dae0).lerp(new THREE.Color(tone), .12),
  }));
  const door = () => shared("door", () => new THREE.MeshStandardMaterial({ map: doorMap(), roughness: .55, metalness: .45 }));
  const metal = (color, rough = .4) => shared("metal:" + color + ":" + rough, () => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: .7 }));
  const stripes = (name, a, b, repeat = 1) => shared(`stripes:${name}:${repeat}`, () => {
    const map = stripeMap(name, a, b).clone();
    map.repeat.set(repeat, 1);
    map.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map, roughness: .6, metalness: .25 });
  });
  const glowMaterial = (color, opacity = 1, map = glowMap()) => new THREE.MeshBasicMaterial({
    color, map, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const lit = (color, emissive = 0, extra = {}) => new THREE.MeshStandardMaterial({
    color, roughness: .45, metalness: .35, emissive: color, emissiveIntensity: emissive, ...extra,
  });

  // ---- Small pieces -----------------------------------------------------------------------
  function pylon(x, y, z, height, tone) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, height, 10), metal(0x3b434b));
    post.position.set(x, y + height / 2, z);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8), lit(tone, 1.1));
    cap.position.y = height / 2;
    post.add(cap);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .08, 10), metal(0x2d343b));
    foot.position.y = -height / 2 + .04;
    post.add(foot);
    return add(post);
  }

  // ---- Decks, walls, rails ----------------------------------------------------------------
  // Decks and doors carry no glowing outlines: edges are read from the plate and its lighting.
  function deckMaterial(tone, mix) { return style ? style.deck(tone, mix) : steel(tone, mix); }
  function wallMaterial(tone, gate) {
    if (gate) return style ? style.door : door();
    return style ? style.wall(tone) : panel(tone);
  }
  /** A copy of a themed material whose textures repeat `repeat` times per UV unit (for UVs in metres). */
  const tiledCache = new Map();
  function tiled(material, key, repeat) {
    const hit = tiledCache.get(key);
    if (hit) return hit;
    const copyMaterial = material.clone();
    for (const slot of ["map", "normalMap", "roughnessMap"]) {
      if (!copyMaterial[slot]) continue;
      copyMaterial[slot] = copyMaterial[slot].clone();
      copyMaterial[slot].repeat.set(repeat, repeat);
      copyMaterial[slot].needsUpdate = true;
    }
    copyMaterial.userData.shared = true;
    tiledCache.set(key, copyMaterial);
    return copyMaterial;
  }

  function rung(piece, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(piece.w, piece.h, piece.d), shared("rung:" + piece.tone, () => lit(piece.tone, .3, { roughness: .3, metalness: .75 })));
    mesh.position.set(x, y, z);
    return add(mesh);
  }

  // ---- Fields -----------------------------------------------------------------------------
  // Every field is shown by the thing that causes it: fans for moving air, a real belt, jammer
  // masts, heater plates, ice. Nothing is drawn as floating arrows or glowing volumes.
  function floorPlane(w, d, material, x, y, z, flip = false) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
    mesh.rotation.set(-Math.PI / 2, 0, flip ? Math.PI : 0);
    mesh.position.set(x, y, z);
    return add(mesh);
  }
  const beltMap = () => texture("belt", 64, 128, (g, w, h, rnd) => {
    g.fillStyle = "#222428";
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) {
      const bar = g.createLinearGradient(0, y, 0, y + 14);
      bar.addColorStop(0, "#4b5058");
      bar.addColorStop(1, "#2b2e33");
      g.fillStyle = bar;
      g.fillRect(4, y + 4, w - 8, 14);
      g.fillStyle = "rgba(0,0,0,.45)";
      g.fillRect(4, y + 18, w - 8, 3);
    }
    g.fillStyle = "rgba(255,255,255,.05)";
    for (let i = 0; i < 300; i++) g.fillRect(rnd() * w, rnd() * h, 2, 1);
  });
  const lightBarMap = () => texture("lightbars", 64, 128, g => {
    for (const y of [24, 88]) {
      const bar = g.createLinearGradient(0, y - 12, 0, y + 12);
      bar.addColorStop(0, "rgba(120,190,255,0)");
      bar.addColorStop(.5, "rgba(214,242,255,1)");
      bar.addColorStop(1, "rgba(120,190,255,0)");
      g.fillStyle = bar;
      g.fillRect(8, y - 12, 48, 24);
    }
  });
  /** A tileless basalt-and-molten-rock surface: dark crust islands around flowing orange seams. */
  function hotPlate() {
    const hit = cache.get("t:hotplate");
    if (hit) return hit;
    const size = 512, a = fbm(size, 41, 5, 4), warpX = fbm(size, 53, 3, 5);
    const warpY = fbm(size, 67, 3, 6), detail = fbm(size, 89, 4, 10);
    const make = () => { const c = document.createElement("canvas"); c.width = c.height = size; return c; };
    const color = make(), emit = make(), cc = color.getContext("2d"), ec = emit.getContext("2d");
    const ci = cc.createImageData(size, size), ei = ec.createImageData(size, size);
    for (let i = 0; i < a.length; i++) {
      const warped = Math.min(1, Math.max(0, a[i] + (warpX[i] - .5) * .22 + (warpY[i] - .5) * .16));
      const ridge = 1 - Math.abs(warped * 2 - 1);
      const heat = Math.min(1, Math.max(0, (ridge - .79) / .17)) ** 1.2 * (.68 + detail[i] * .55);
      const core = Math.min(1, Math.max(0, (ridge - .94) / .06)) * heat;
      const rock = .72 + detail[i] * .55 + a[i] * .22;
      const k = i * 4;
      ci.data[k] = 18 * rock + heat * (148 + core * 70);
      ci.data[k + 1] = 13 * rock + heat * (34 + core * 105);
      ci.data[k + 2] = 11 * rock + heat * (8 + core * 16);
      ci.data[k + 3] = 255;
      ei.data[k] = 255 * heat;
      ei.data[k + 1] = heat * (52 + core * 145);
      ei.data[k + 2] = heat * (5 + core * 22);
      ei.data[k + 3] = 255;
    }
    cc.putImageData(ci, 0, 0);
    ec.putImageData(ei, 0, 0);
    const tex = (canvas, srgb) => { const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
    const result = { map: tex(color, true), emissiveMap: tex(emit, true) };
    cache.set("t:hotplate", result);
    return result;
  }
  const darkMetal = () => metal(0x2f363d, .5);
  const lightMetal = () => metal(0x9aa4ac, .35);

  /** Dust, embers or debris drifting through a box. Wraps, so the box never empties. */
  function motes({ x, y, z, w, h, d, vx = 0, vy = 0, vz = 0, count, color, size, opacity, sway = .25 }) {
    const positions = new Float32Array(count * 3), seeds = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - .5) * w; positions[i * 3 + 1] = (Math.random() - .5) * h; positions[i * 3 + 2] = (Math.random() - .5) * d;
      seeds.push(Math.random() * TAU);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false }));
    points.position.set(x, y, z);
    points.frustumCulled = false;
    add(points);
    let t = 0;
    tick(dt => {
      t += dt;
      const p = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const k = i * 3;
        p[k] += (vx + Math.sin(t + seeds[i]) * sway) * dt;
        p[k + 1] += vy * dt;
        p[k + 2] += (vz + Math.cos(t * .8 + seeds[i]) * sway) * dt;
        if (p[k] > w / 2) p[k] -= w; else if (p[k] < -w / 2) p[k] += w;
        if (p[k + 1] > h / 2) p[k + 1] -= h; else if (p[k + 1] < -h / 2) p[k + 1] += h;
        if (p[k + 2] > d / 2) p[k + 2] -= d; else if (p[k + 2] < -d / 2) p[k + 2] += d;
      }
      geometry.attributes.position.needsUpdate = true;
    });
  }

  /** Thin streaks of air moving along `dir` from `origin`; `state.strength` (0..1) fades them. */
  function airStreaks({ origin, dir, length, spread, speed, count, color = 0xdbeaff, opacity = .35 }) {
    const forward = new THREE.Vector3(...dir).normalize();
    const side = Math.abs(forward.x) > .9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    const u = side.clone().sub(forward.clone().multiplyScalar(side.dot(forward))).normalize();
    const v = new THREE.Vector3().crossVectors(forward, u);
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(.03, 1.5), new THREE.MeshBasicMaterial({
      color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }), count);
    mesh.frustumCulled = false;
    const align = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), forward);
    const items = Array.from({ length: count }, () => ({
      t: Math.random(), a: (Math.random() * 2 - 1) * spread[0], b: (Math.random() * 2 - 1) * spread[1],
      twist: Math.random() * TAU, speed: speed * (.7 + Math.random() * .6),
    }));
    const matrix = new THREE.Matrix4(), q = new THREE.Quaternion(), tw = new THREE.Quaternion();
    const pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), tint = new THREE.Color();
    const state = { strength: 1 };
    const apply = dt => {
      for (let i = 0; i < count; i++) {
        const it = items[i];
        it.t += dt * it.speed / length;
        if (it.t > 1) it.t -= 1;
        pos.copy(origin).addScaledVector(forward, it.t * length).addScaledVector(u, it.a).addScaledVector(v, it.b);
        tw.setFromAxisAngle(forward, it.twist);
        q.copy(tw).multiply(align);
        matrix.compose(pos, q, one);
        mesh.setMatrixAt(i, matrix);
        const fade = Math.sin(it.t * Math.PI) * state.strength;
        tint.setRGB(fade, fade, fade);
        mesh.setColorAt(i, tint);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    };
    apply(0);
    tick(apply);
    add(mesh);
    return state;
  }

  /** An industrial fan: shroud, rotor with pitched blades, hub, motor and guard bars. `facing` is its axis. */
  function fan(radius, x, y, z, facing = "up") {
    const root = new THREE.Group();
    root.position.set(x, y, z);
    if (facing === "+z") root.rotation.x = Math.PI / 2;
    else if (facing === "-z") root.rotation.x = -Math.PI / 2;
    else if (facing === "+x") root.rotation.z = -Math.PI / 2;
    else if (facing === "-x") root.rotation.z = Math.PI / 2;
    const shroud = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, .7, 40, 1, true), new THREE.MeshStandardMaterial({
      color: 0x3a424a, roughness: .5, metalness: .7, side: THREE.DoubleSide,
    }));
    root.add(shroud);
    for (const sy of [-1, 1]) {
      const lip = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.05, .07, 8, 40), darkMetal());
      lip.rotation.x = Math.PI / 2;
      lip.position.y = sy * .35;
      root.add(lip);
    }
    const rotor = new THREE.Group();
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * .17, radius * .2, .5, 20), lightMetal());
    rotor.add(hub);
    for (let i = 0; i < 7; i++) {
      const geometry = new THREE.BoxGeometry(radius * .86, .035, radius * .3);
      geometry.translate(radius * .5, 0, 0);
      const blade = new THREE.Mesh(geometry, lightMetal());
      blade.rotation.x = .45;
      const holder = new THREE.Group();
      holder.rotation.y = i * TAU / 7;
      holder.add(blade);
      rotor.add(holder);
    }
    root.add(rotor);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(radius * .22, radius * .22, .6, 16), darkMetal());
    motor.position.y = -.5;
    root.add(motor);
    for (const turn of [0, Math.PI / 2]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.1, .05, .09), darkMetal());
      bar.position.y = -.3;
      bar.rotation.y = turn;
      root.add(bar);
    }
    return { root, rotor };
  }

  function thermalVent(piece, x, y, z) {
    const { w, d } = piece;
    const radius = Math.min(Math.max(Math.min(w, d) * .46, 1.6), 2.7);
    const fanY = y - 2.1;
    const f = fan(radius, x, fanY, z);
    add(f.root);
    spin(f.rotor, 22, "y");
    // The fan hangs from struts tied back under the two platforms either side of the shaft.
    for (const side of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(.36, .42, d + 3), darkMetal());
      strut.position.set(x + side * (radius + .1), y - .78, z);
      add(strut);
      for (const sz of [-1, 1]) {
        const hanger = new THREE.Mesh(new THREE.BoxGeometry(.2, 1.2, .2), darkMetal());
        hanger.position.set(x + side * (radius + .1), y - 1.37, z + sz * radius * .7);
        add(hanger);
      }
    }
    airStreaks({ origin: new THREE.Vector3(x, fanY + .5, z), dir: [0, 1, 0], length: Math.min(piece.maxY + 2, 10), spread: [radius * .8, radius * .8], speed: 8.5, count: 56 });
  }

  function gravityZone(piece, x, y, z) {
    const low = piece.gravity < 1;
    const h = Math.min(piece.maxY, 6);
    motes({
      x, y: y + h / 2, z, w: piece.w * .95, h, d: piece.d, vy: low ? .45 : -5.5, count: low ? 90 : 80,
      color: low ? 0xe8f0ff : 0x7a7e86, size: low ? .07 : .1, opacity: low ? .8 : .7, sway: low ? .35 : .05,
    });
    for (const sz of [-1, 1]) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.05, .12, 24), metal(0x2a3036, .5));
      plate.position.set(x, y + .06, z + sz * (piece.d / 2 - .2));
      add(plate);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(.62, 24), glowMaterial(low ? 0x9fd0ff : 0xff7a4a, .8, radialMap()));
      lens.rotation.x = -Math.PI / 2;
      lens.position.set(plate.position.x, y + .13, plate.position.z);
      add(lens);
    }
  }

  function windTunnel(piece, x, y, z) {
    const { w, d } = piece;
    const toward = Math.sign(piece.zForce || 1);
    const srcZ = z - toward * (d / 2 + .5);
    const gap = w / 2 + 1.25;
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, 1.8, 10), darkMetal());
      post.position.set(x + side * gap, y + .9, srcZ);
      add(post);
      const f = fan(1.15, x + side * gap, y + 2.1, srcZ, toward > 0 ? "+z" : "-z");
      add(f.root);
      spin(f.rotor, 26, "y");
    }
    airStreaks({ origin: new THREE.Vector3(x, y + 1.3, srcZ + toward * .6), dir: [0, 0, toward], length: d + 1, spread: [w * .46, 1.25], speed: 15, count: 90 });
  }

  function gustVents(piece, x, y, z) {
    const { w, d } = piece;
    const sets = [];
    for (const dir of [1, -1]) {
      const sx = x - dir * (w / 2 + 1.2);
      const streak = airStreaks({ origin: new THREE.Vector3(sx + dir * .5, y + 1.25, z), dir: [dir, 0, 0], length: w + 1.5, spread: [d * .42, 1.1], speed: 14, count: 70, opacity: .4 });
      const rotors = [];
      for (const fz of [-d / 4, d / 4]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, 1.7, 10), darkMetal());
        post.position.set(sx, y + .85, z + fz);
        add(post);
        const f = fan(1.1, sx, y + 2, z + fz, dir > 0 ? "+x" : "-x");
        add(f.root);
        rotors.push(f.rotor);
      }
      sets.push({ dir, streak, rotors });
    }
    let time = 0;
    tick(dt => {
      time += dt;
      const g = Math.sin(time * TAU / (piece.period || 3.4));
      for (const s of sets) {
        const power = Math.max(0, s.dir * g * Math.sign(piece.xForce || 1));
        s.streak.strength = Math.min(1, power * 1.6);
        for (const rotor of s.rotors) rotor.rotation.y += (3 + power * 26) * dt;
      }
    });
  }

  function jammer(piece, x, y, z) {
    const { w, d } = piece;
    const tips = [];
    const reach = Math.min(w / 2, 3.8) - .3;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const mx = x + sx * reach, mz = z + sz * (d / 2 - .6);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.09, .14, 3.4, 10), darkMetal());
      mast.position.set(mx, y + 1.7, mz);
      add(mast);
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(.5, .08, .16, 18), lightMetal());
      dish.position.set(mx, y + 2.7, mz);
      dish.rotation.x = Math.PI / 2 - .5 * sz;
      add(dish);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5040 }));
      lamp.position.set(mx, y + 3.45, mz);
      add(lamp);
      tips.push(new THREE.Vector3(mx, y + 3.3, mz));
    }
    const pairs = [[0, 2], [1, 3], [0, 1], [2, 3]];
    const segments = 9;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pairs.length * segments * 6), 3));
    const arcs = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xc8b0ff, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }));
    arcs.frustumCulled = false;
    add(arcs);
    let flicker = 0;
    tick(dt => {
      flicker += dt;
      const p = geometry.attributes.position.array;
      let k = 0;
      for (const [a, b] of pairs) {
        let prev = tips[a];
        for (let s = 1; s <= segments; s++) {
          const t = s / segments, amp = Math.sin(t * Math.PI) * .45;
          const next = s === segments ? tips[b] : new THREE.Vector3().lerpVectors(tips[a], tips[b], t).add(new THREE.Vector3((Math.random() - .5) * amp, (Math.random() - .5) * amp, (Math.random() - .5) * amp));
          p[k++] = prev.x; p[k++] = prev.y; p[k++] = prev.z; p[k++] = next.x; p[k++] = next.y; p[k++] = next.z;
          prev = next;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      arcs.material.opacity = .45 + Math.random() * .5 * (Math.sin(flicker * 17) > -.3 ? 1 : .2);
    });
  }

  function conveyor(piece, x, y, z) {
    const { w, d } = piece;
    const forward = (piece.zForce || -1) < 0;
    const map = copy(beltMap(), 1, Math.max(1, d / 2));
    scroll(map, 0, (forward ? -1 : 1) * Math.abs(piece.zForce || 3) / 2);
    floorPlane(w, d, new THREE.MeshStandardMaterial({ map, roughness: .9, metalness: .05 }), x, y + .035, z);
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(.16, .22, d), darkMetal());
      rail.position.set(x + side * (w / 2 - .08), y + .11, z);
      add(rail);
    }
    for (const sz of [-1, 1]) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, w, 16), lightMetal());
      roller.rotation.z = Math.PI / 2;
      roller.position.set(x, y + .05, z + sz * d / 2);
      add(roller);
    }
  }

  function maglev(piece, x, y, z) {
    const { w, d } = piece;
    floorPlane(w, d, new THREE.MeshStandardMaterial({ color: 0x1b2025, roughness: .5, metalness: .6 }), x, y + .03, z);
    const map = copy(lightBarMap(), 1, Math.max(1, d / 1.6));
    scroll(map, 0, -5);
    floorPlane(w * .86, d, new THREE.MeshBasicMaterial({
      map, color: 0xa6dcff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }), x, y + .045, z);
    const coil = lit(0x9a6232, .15, { roughness: .35, metalness: .85 });
    for (let c = 0; c < Math.floor(d / 2.4); c++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w * .9, .07, .3), coil);
      bar.position.set(x, y + .07, z - d / 2 + 1.2 + c * 2.4);
      add(bar);
    }
  }

  /** Exposed lava in a broken basalt basin, with moving molten veins, heat haze and embers. */
  function heater(piece, x, y, z) {
    const { w, d } = piece;
    const set = hotPlate();
    const maps = { map: copy(set.map), emissiveMap: copy(set.emissiveMap) };
    const material = new THREE.MeshStandardMaterial({ map: maps.map, emissiveMap: maps.emissiveMap, emissive: 0xffffff, emissiveIntensity: 1.15, roughness: .62, metalness: .04 });
    const makeBasin = (width, depth, seed) => {
      const geometry = new THREE.PlaneGeometry(width, depth, 40, 56);
      const position = geometry.attributes.position;
      const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
      for (let i = 0; i < position.count; i++) {
        const px = position.getX(i), pz = position.getY(i);
        const nx = px / (width / 2), nz = pz / (depth / 2);
        const edge = Math.max(Math.abs(nx), Math.abs(nz));
        if (edge > .62) {
          const a = Math.atan2(nz, nx);
          const ragged = Math.sin(a * 7 + seed) * .035 + Math.sin(a * 13 - seed * 1.7) * .022 + Math.sin(a * 23 + seed * .6) * .012;
          const scale = 1 + ragged * smooth((edge - .62) / .38);
          position.setXY(i, px * scale, pz * scale);
        }
        position.setZ(i, Math.sin(nx * 7 + seed) * Math.sin(nz * 5 - seed) * .012);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      return geometry;
    };
    const basalt = new THREE.Mesh(makeBasin(w + .5, d + .5, x * .17 + z * .11), new THREE.MeshStandardMaterial({ color: 0x211916, roughness: .98, metalness: 0 }));
    basalt.rotation.x = -Math.PI / 2;
    basalt.position.set(x, y + .018, z);
    basalt.receiveShadow = true;
    add(basalt);
    const lava = new THREE.Mesh(makeBasin(w, d, x * .17 + z * .11 + 1.9), material);
    lava.rotation.x = -Math.PI / 2;
    lava.position.set(x, y + .042, z);
    lava.receiveShadow = true;
    add(lava);
    airStreaks({ origin: new THREE.Vector3(x, y + .2, z), dir: [0, 1, 0], length: 3.6, spread: [w * .45, d * .45], speed: 1.7, count: 40, color: 0xffb070, opacity: .2 });
    motes({ x, y: y + 1.4, z, w, h: 2.8, d, vy: 1, count: 46, color: 0xffa040, size: .07, opacity: .9, sway: .5 });
    let t = Math.random() * 6;
    tick(dt => {
      t += dt;
      const flow = (t * .008) % 1;
      maps.map.offset.set(0, flow);
      maps.emissiveMap.offset.set(0, flow);
      material.emissiveIntensity = 1.05 + Math.sin(t * 1.8) * .13 + Math.sin(t * 4.7) * .05;
    });
  }

  function iceSurface(piece, x, y, z) {
    const { w, d } = piece;
    const base = style ? style.slick : null;
    let material;
    if (base) {
      material = base.clone();
      for (const slot of ["map", "normalMap", "roughnessMap"]) {
        if (!material[slot]) continue;
        material[slot] = material[slot].clone();
        material[slot].repeat.set(Math.max(1, w / 3), Math.max(1, d / 3));
        material[slot].needsUpdate = true;
      }
    } else {
      const map = copy(iceMap(), Math.max(1, w / 2), Math.max(1, d / 2));
      material = new THREE.MeshStandardMaterial({ map, color: 0xcfeaf7, roughness: .06, metalness: .25, transparent: true, opacity: .9 });
    }
    floorPlane(w, d, material, x, y + .03, z);
  }

  const padArrowMap = () => texture("pad-arrows", 128, 128, (g, w, h, rnd) => {
    g.fillStyle = "#1d2125";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(255,255,255,${(rnd() * .05).toFixed(3)})`;
      g.fillRect(rnd() * w, rnd() * h, 2, 2);
    }
    g.lineJoin = "round";
    g.lineWidth = 12;
    g.strokeStyle = "#b08a2c";
    for (const y of [52, 104]) {
      g.beginPath(); g.moveTo(26, y); g.lineTo(64, y - 30); g.lineTo(102, y); g.stroke();
    }
    g.lineWidth = 3;
    g.strokeStyle = "rgba(0,0,0,.4)";
    g.strokeRect(4, 4, w - 8, h - 8);
  }, false);

  /** A launch pad: steel housing, hazard-painted border, rubber deck with painted arrows, hydraulic rams. */
  function launchPad(piece, x, y, z) {
    const { w, d } = piece;
    const forward = (piece.zForce || -1) < 0;
    const root = new THREE.Group();
    root.position.set(x, y, z);
    if (!forward) root.rotation.y = Math.PI;
    const housing = new THREE.Mesh(new THREE.BoxGeometry(w + .2, .14, d + .2), metal(0x3a424a, .5));
    housing.position.y = .07;
    root.add(housing);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w - .5, .05, d - .5), shared("launch-deck", () => new THREE.MeshStandardMaterial({
      map: padArrowMap(), roughness: .85, metalness: .05,
    })));
    deck.position.y = .165;
    root.add(deck);
    const border = (len, depth, bx, bz, turned) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(len, .03, depth), stripes("launch", "#d9a21b", "#17130f", Math.max(1, Math.round(len / .7))));
      strip.position.set(bx, .155, bz);
      if (turned) strip.rotation.y = Math.PI / 2;
      root.add(strip);
    };
    border(w - .1, .25, 0, d / 2 - .15, false);
    border(w - .1, .25, 0, -d / 2 + .15, false);
    border(d - .1, .25, w / 2 - .15, 0, true);
    border(d - .1, .25, -w / 2 + .15, 0, true);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .3, 12), metal(0x2d343b, .45));
      sleeve.position.set(sx * (w / 2 - .02), .22, sz * (d / 2 - .02));
      root.add(sleeve);
      const ram = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .22, 10), metal(0xcfd6dc, .2));
      ram.position.set(sx * (w / 2 - .02), .44, sz * (d / 2 - .02));
      root.add(ram);
    }
    add(root);
  }

  /** A sloped deck: an extruded wedge whose top follows the line through the invisible stair treads. */
  function ramp(piece, x, originY, originZ) {
    const ya = originY + piece.y0, yb = originY + piece.y1;
    const base = Math.min(ya, yb) - .5;
    const shape = new THREE.Shape();
    shape.moveTo(0, base);
    shape.lineTo(piece.d, base);
    shape.lineTo(piece.d, yb);
    shape.lineTo(0, ya);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: piece.w, bevelEnabled: false });
    geometry.translate(0, 0, -piece.w / 2);
    const mesh = new THREE.Mesh(geometry, style ? tiled(style.deck(piece.tone), 'ramp:' + piece.tone, 1 / style.tile) : steel(piece.tone));
    mesh.rotation.y = Math.PI / 2;
    mesh.position.set(x, 0, originZ - piece.from);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    add(mesh);
  }

  function drawField(piece, x, y, z) {
    const { w, d, kind } = piece;
    if (kind === "updraft") thermalVent(piece, x, y, z);
    else if (kind === "gravity") gravityZone(piece, x, y, z);
    else if (kind === "wind") windTunnel(piece, x, y, z);
    else if (kind === "gust") gustVents(piece, x, y, z);
    else if (kind === "dashLock") jammer(piece, x, y, z);
    else if (kind === "belt") conveyor(piece, x, y, z);
    else if (kind === "speed") maglev(piece, x, y, z);
    else if (kind === "spring") launchPad(piece, x, y, z);
    else if (kind === "slick") iceSurface(piece, x, y, z);
    else if (kind === "damage") heater(piece, x, y, z);
    else if (kind === "adhesion") {
      const map = copy(gooMap(), Math.max(1, w / 2.2), Math.max(1, d / 2.2));
      floorPlane(w, d, new THREE.MeshStandardMaterial({ map, roughness: .9, metalness: 0 }), x, y + .035, z);
    } else if (kind === "water") {
      const water = waterSurface();
      const repeatX = Math.max(1, w / 4.5), repeatY = Math.max(1, d / 4.5);
      const map = copy(water.map, repeatX, repeatY), normalMap = copy(water.normalMap, repeatX, repeatY);
      scroll(map, .008, .019); scroll(normalMap, .008, .019);
      const geometry = new THREE.PlaneGeometry(w, d, 28, 36);
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const px = positions.getX(i), py = positions.getY(i);
        const nx = px / (w / 2), ny = py / (d / 2), edge = Math.max(Math.abs(nx), Math.abs(ny));
        if (edge > .68) {
          const angle = Math.atan2(ny, nx);
          const roughEdge = Math.sin(angle * 5 + x * .31) * .025 + Math.sin(angle * 11 + z * .19) * .018 + Math.sin(angle * 17) * .009;
          const scale = 1 + roughEdge * THREE.MathUtils.smoothstep(edge, .68, 1);
          positions.setXY(i, px * scale, py * scale);
        }
      }
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
        map, normalMap, color: 0xc4dbe2, roughness: .24, metalness: .08,
        clearcoat: .72, clearcoatRoughness: .18, transparent: true, opacity: .86, depthWrite: false,
        side: THREE.DoubleSide,
      }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y + .05, z);
      add(mesh);
    }
    // wallKick and ladder zones are invisible: wall jumps work on any wall, and the ladder is its rungs.
  }

  // ---- Portals ----------------------------------------------------------------------------
  // A portal is a gate whose opening shows the real view from the other end. The rim can glow,
  // but the scene image itself stays undistorted so geometry lines up across the threshold.
  const portals = [];
  const PORTAL_RADIUS = 1.15, PORTAL_LIFT = 1.8, PORTAL_STRETCH = 1.4;   // a doorway: 2.3 m wide, 3.2 m tall
  function portalMaterial(tone) {
    return new THREE.ShaderMaterial({
      uniforms: {
        tView: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uTint: { value: new THREE.Color(tone) },
      },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        uniform sampler2D tView; uniform vec2 uRes; uniform float uTime; uniform vec3 uTint; varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          vec2 uv = gl_FragCoord.xy / uRes;
          float rim = smoothstep(0.88, 0.99, length(p));
          float pulse = 0.5 + 0.5 * sin(uTime * 1.8);
          vec3 col = texture2D(tView, uv).rgb;
          col = mix(col, uTint, rim * (0.10 + 0.035 * pulse));
          col += uTint * rim * (0.035 + 0.025 * pulse);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      side: THREE.DoubleSide,
    });
  }
  /** One end of a portal: frame, bracing, plinth and the live opening. */
  function portalGate(tone, x, y, z, partner, facing = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = facing;
    const frame = new THREE.Mesh(new THREE.TorusGeometry(PORTAL_RADIUS, .13, 14, 48), new THREE.MeshStandardMaterial({
      color: 0x59626b, emissive: tone, emissiveIntensity: .35, roughness: .35, metalness: .85,
    }));
    frame.position.y = PORTAL_LIFT;
    frame.scale.y = PORTAL_STRETCH;
    group.add(frame);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(PORTAL_RADIUS - .13, .035, 8, 48), new THREE.MeshBasicMaterial({ color: tone }));
    lip.position.y = PORTAL_LIFT;
    lip.scale.y = PORTAL_STRETCH;
    group.add(lip);
    const bulletBlockers = [frame, lip];
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(.22, PORTAL_LIFT + .2, .32), darkMetal());
      leg.position.set(side * (PORTAL_RADIUS + .12), (PORTAL_LIFT + .2) / 2 - .05, 0);
      group.add(leg);
      bulletBlockers.push(leg);
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(.42, .36, .44), lightMetal());
      clamp.position.set(side * PORTAL_RADIUS * .98, PORTAL_LIFT, 0);
      group.add(clamp);
      bulletBlockers.push(clamp);
    }
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(PORTAL_RADIUS * 2 + 1.2, .22, 1.1), darkMetal());
    plinth.position.y = .11;
    group.add(plinth);
    bulletBlockers.push(plinth);
    const material = portalMaterial(tone);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(PORTAL_RADIUS - .1, 64), material);
    disc.position.y = PORTAL_LIFT;
    disc.scale.y = PORTAL_STRETCH;
    group.add(disc);
    add(group);
    portals.push({
      group, disc, bulletBlockers, uniforms: material.uniforms, rt: null,
      center: new THREE.Vector3(x, y + PORTAL_LIFT, z),
      partner: new THREE.Vector3(partner.x, partner.y + PORTAL_LIFT, partner.z),
    });
    return frame;
  }

  // ---- Nodes ------------------------------------------------------------------------------
  function ring(radius, tone, x, y, z, swirling) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(radius, .075, 10, 36), new THREE.MeshStandardMaterial({
      color: tone, emissive: tone, emissiveIntensity: .9, roughness: .3, metalness: .5,
    }));
    hoop.position.set(x, y, z);
    const outer = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.16, .025, 6, 36), glowMaterial(tone, .85, radialMap()));
    hoop.add(outer);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(radius * .96, 32), glowMaterial(tone, swirling ? .8 : .42, swirling ? swirlMap() : radialMap()));
    hoop.add(disc);
    if (swirling) spin(disc, 1.6, "z");
    return hoop;
  }

  function drawNodeBody(piece, x, y, z, toWorld = null) {
    const tone = piece.tone;
    const kind = piece.kind;
    if (kind === "target") {
      const body = solid(.78, .78, .22, x, y, z, 0x2a3036);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), shared("bullseye", () => new THREE.MeshBasicMaterial({ map: bullseyeMap() })));
      face.position.z = .115;
      noRay(face);
      body.add(face);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe6ae }));
      lamp.position.set(.3, .3, .125);
      noRay(lamp);
      body.add(lamp);
      return { mesh: body, lamp };
    }
    if (kind === "portal" && toWorld) {
      const entry = portalGate(tone, x, y, z, toWorld, 0);
      // The exit faces back along the course. A half turn in its frame makes the
      // incoming direction continue through the destination instead of reversing.
      const exit = portalGate(tone, toWorld.x, toWorld.y, toWorld.z, { x, y, z }, Math.PI);
      const entryPortal = portals[portals.length - 2], exitPortal = portals[portals.length - 1];
      entryPortal.partnerGate = exit.parent;
      exitPortal.partnerGate = entry.parent;
      entryPortal.partnerPortal = exitPortal;
      exitPortal.partnerPortal = entryPortal;
      return { mesh: entry, portal: entryPortal, partnerPortal: exitPortal };
    }
    if (["portal", "airKick", "fuel"].includes(kind)) {
      const radius = (kind === "airKick" ? 1.65 : kind === "portal" ? 1.2 : .72) / 2;
      const lift = kind === "portal" ? .98 : .53;
      const hoop = ring(radius, tone, x, y + lift, z, kind === "portal");
      add(hoop);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(radius * .8, radius * .9, .06, 20), metal(0x30373e));
      pad.position.set(x, y + .04, z);
      add(pad);
      // A hoop with nothing under it reads as floating. A post stands it on the pad, just behind the hoop's plane,
      // and a short arm joins the post to the hoop's centre.
      if (kind !== "portal") {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, lift, 12), metal(0x59616a));
        post.position.set(x, y + lift / 2, z - .07);
        add(post);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(.1, .05, .07), metal(0x59616a));
        arm.position.set(x, y + lift, z - .035);
        add(arm);
      }
      return { mesh: hoop };
    }
    if (kind === "mine") {
      // An anti-tank mine laid in a shallow scrape: olive-drab case, pressure plate, fuse well, bolts and an arming LED.
      const body = new THREE.Mesh(new THREE.CylinderGeometry(.34, .36, .11, 28), shared("mine-case", () => new THREE.MeshStandardMaterial({ color: 0x4d5238, roughness: .72, metalness: .45 })));
      body.position.set(x, y + .04, z);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(.24, .26, .045, 28), shared("mine-plate", () => new THREE.MeshStandardMaterial({ color: 0x3b3f2c, roughness: .6, metalness: .55 })));
      plate.position.y = .075;
      body.add(plate);
      for (const r of [.12, .19]) {
        const groove = new THREE.Mesh(new THREE.TorusGeometry(r, .008, 6, 28), shared("mine-groove", () => new THREE.MeshBasicMaterial({ color: 0x23251a })));
        groove.rotation.x = Math.PI / 2;
        groove.position.y = .1;
        body.add(groove);
      }
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .03, 12), darkMetal());
      fuse.position.y = .105;
      body.add(fuse);
      for (let k = 0; k < 4; k++) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .03, 8), lightMetal());
        bolt.position.set(Math.cos(k * TAU / 4) * .3, .07, Math.sin(k * TAU / 4) * .3);
        body.add(bolt);
      }
      const led = new THREE.Mesh(new THREE.SphereGeometry(.028, 10, 8), new THREE.MeshBasicMaterial({ color: tone }));
      led.position.set(.2, .1, -.1);
      body.add(led);
      const scrape = new THREE.Mesh(new THREE.CircleGeometry(.55, 24), new THREE.MeshBasicMaterial({ color: 0x1d1d1a, transparent: true, opacity: .35, depthWrite: false }));
      scrape.rotation.x = -Math.PI / 2;
      scrape.position.set(x, y + .012, z);
      add(scrape);
      return { mesh: add(body), lamp: led };
    }
    if (kind === "pickup") {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .46, 16), lit(tone, 1.1, { roughness: .25 }));
      mesh.position.set(x, y + .46, z);
      for (const sy of [-1, 1]) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .06, 16), metal(0x59616a));
        cap.position.y = sy * .24;
        mesh.add(cap);
      }
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), glowMaterial(tone, .55, radialMap()));
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -.4;
      mesh.add(halo);
      spin(mesh, 1.2);
      return { mesh: add(mesh) };
    }
    // Pressure plates and pads: switch, shield, dashCharge, memoryReplay.
    const radius = kind === "dashCharge" ? 1.1 : .55;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.06, .08, 28), new THREE.MeshStandardMaterial({
      color: tone, emissive: tone, emissiveIntensity: .35, roughness: .45, metalness: .5,
    }));
    base.position.set(x, y + .05, z);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(radius * .78, radius * .78, .03, 28), metal(0x252b31, .5));
    plate.position.y = .045;
    base.add(plate);
    const core = new THREE.Mesh(new THREE.CircleGeometry(radius * .62, 28), glowMaterial(tone, .9, kind === "shield" ? hexMap() : radialMap()));
    core.rotation.x = -Math.PI / 2;
    core.position.y = .066;
    base.add(core);
    return { mesh: add(base) };
  }

  // Every pickup says what it is with a floating icon over it, no words: a flame for fuel, an arrow for the
  // air boost, chevrons for dashes, a shield, a looping arrow, a lever, a key.
  const NODE_ICONS = {
    fuel: (g, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(64, 14); g.bezierCurveTo(94, 44, 98, 70, 80, 96); g.bezierCurveTo(74, 106, 54, 106, 48, 96); g.bezierCurveTo(30, 70, 50, 56, 64, 14); g.fill(); g.fillStyle = "rgba(10,14,18,.85)"; g.beginPath(); g.ellipse(64, 86, 12, 16, 0, 0, 7); g.fill(); },
    airKick: (g, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(64, 14); g.lineTo(100, 58); g.lineTo(76, 58); g.lineTo(76, 108); g.lineTo(52, 108); g.lineTo(52, 58); g.lineTo(28, 58); g.closePath(); g.fill(); },
    dashCharge: (g, c) => { g.fillStyle = c; for (const x of [26, 58]) { g.beginPath(); g.moveTo(x, 24); g.lineTo(x + 40, 64); g.lineTo(x, 104); g.lineTo(x + 14, 104); g.lineTo(x + 54, 64); g.lineTo(x + 14, 24); g.closePath(); g.fill(); } },
    shield: (g, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(64, 12); g.lineTo(104, 28); g.bezierCurveTo(104, 76, 90, 100, 64, 116); g.bezierCurveTo(38, 100, 24, 76, 24, 28); g.closePath(); g.fill(); g.fillStyle = "rgba(10,14,18,.85)"; g.beginPath(); g.moveTo(64, 30); g.lineTo(88, 40); g.bezierCurveTo(88, 70, 78, 86, 64, 96); g.bezierCurveTo(50, 86, 40, 70, 40, 40); g.closePath(); g.fill(); },
    memoryReplay: (g, c) => { g.strokeStyle = c; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.arc(64, 66, 34, -2.4, 3.2); g.stroke(); g.fillStyle = c; g.beginPath(); g.moveTo(22, 32); g.lineTo(52, 30); g.lineTo(36, 58); g.closePath(); g.fill(); },
    switch: (g, c) => { g.fillStyle = c; g.beginPath(); g.arc(64, 64, 40, 0, 7); g.fill(); g.fillStyle = "rgba(10,14,18,.85)"; g.beginPath(); g.arc(64, 64, 26, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(64, 64, 14, 0, 7); g.fill(); },
    pickup: (g, c) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 12; g.beginPath(); g.arc(44, 44, 22, 0, 7); g.stroke(); g.lineCap = "round"; g.beginPath(); g.moveTo(60, 60); g.lineTo(104, 104); g.stroke(); g.fillRect(84, 88, 10, 22); g.fillRect(98, 98, 10, 20); },
  };
  const tagMaterials = new Map();
  function nodeTag(kind, tone) {
    const icon = NODE_ICONS[kind];
    if (!icon) return null;
    const key = kind + tone;
    let material = tagMaterials.get(key);
    if (!material) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const g = canvas.getContext("2d");
      const css = "#" + new THREE.Color(tone).getHexString();
      icon(g, css);
      const map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
      material = new THREE.SpriteMaterial({ map, transparent: true, fog: false, depthWrite: false });
      material.userData.shared = true;
      tagMaterials.set(key, material);
    }
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.0, 1.0, 1);
    sprite.raycast = () => {};
    return sprite;
  }
  function drawNode(piece, x, y, z, toWorld = null) {
    const drawn = drawNodeBody(piece, x, y, z, toWorld);
    const tag = nodeTag(piece.kind, piece.tone);
    if (tag && drawn && drawn.mesh) {
      tag.position.set(0, y + 2.1 - drawn.mesh.position.y, 0);
      drawn.mesh.add(tag);
    }
    return drawn;
  }

  // ---- Hazards ----------------------------------------------------------------------------
  function emitter(x, y, z, height, lens) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(.26, height, .3), panel(0x7f8a95));
    body.position.set(x, y + height / 2, z);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.08, 10, 8), new THREE.MeshBasicMaterial({ color: lens }));
    eye.position.set(0, height / 2 - .22, .16);
    body.add(eye);
    return body;
  }

  function drawHazard(piece, x, y, z) {
    const red = 0xff5a46;
    if (piece.kind === "dart") {
      const turret = emitter(x, y, z, 1.45, red);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .5, 10), metal(0x2b3238));
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(Math.sign(-piece.x || 1) * .3, .8, 0);
      turret.add(barrel);
      add(turret);
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .55, 8), new THREE.MeshBasicMaterial({ color: 0xffd2c8 }));
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(x, y + 1.25, z);
      const trail = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .3), glowMaterial(red, .9));
      bolt.add(trail);
      trail.rotation.z = Math.PI / 2;
      return add(bolt);
    }
    if (piece.kind === "rotor") {
      const column = new THREE.Mesh(new THREE.CylinderGeometry(.24, .34, .83, 18), metal(0x4a535c, .5));
      column.position.set(x, y + .42, z);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(.3, .035, 6, 20), lit(red, .8));
      collar.rotation.x = Math.PI / 2;
      collar.position.y = .3;
      column.add(collar);
      add(column);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(piece.radius * 2, .15, .24), stripes("rotor", "#c4352b", "#240f0d", Math.max(2, Math.round(piece.radius * 2 / .9))));
      arm.position.set(x, y + piece.height, z);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .3, 18), metal(0x2f363d, .45));
      arm.add(hub);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff8d7c }));
      beacon.position.y = .2;
      arm.add(beacon);
      for (const side of [-1, 1]) {
        const tip = new THREE.Mesh(new THREE.BoxGeometry(.34, .2, .3), metal(0x3a2320, .5));
        tip.position.x = side * (piece.radius - .12);
        arm.add(tip);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffb0a4 }));
        lamp.position.set(side * (piece.radius - .12), .15, 0);
        arm.add(lamp);
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), glowMaterial(red, .8, radialMap()));
        glow.rotation.x = -Math.PI / 2;
        glow.position.set(side * (piece.radius - .12), .16, 0);
        arm.add(glow);
      }
      return add(arm);
    }
    const width = piece.width;
    if (piece.kind === "beam" || piece.kind === "chase") {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(width, piece.kind === "chase" ? 1.7 : .7), glowMaterial(red, .85));
      beam.position.set(x, y + (piece.height || .82), z);
      const core = new THREE.Mesh(new THREE.BoxGeometry(width, .06, .06), new THREE.MeshBasicMaterial({ color: 0xffe0da, transparent: true }));
      beam.add(core);
      beam.userData.fade = [core.material];
      for (const side of [-1, 1]) {
        if (piece.kind === "beam") {
          // The emitters are fixed hardware: only the laser itself blinks on and off.
          add(emitter(x + side * width / 2, y, z, 1.7, red));
        } else {
          // The chase wall carries its posts with it.
          const post = emitter(side * width / 2, -(piece.height || .82) - .2, 0, 1.7, red);
          post.position.y = (1.7 / 2) - (piece.height || .82);
          beam.add(post);
        }
      }
      return add(beam);
    }
    return add(new THREE.Mesh(new THREE.BoxGeometry(width, .1, .2), glowMaterial(red, .85)));
  }

  return { deckMaterial, wallMaterial, rung, ramp, drawField, drawNode, drawHazard, portals };
}
