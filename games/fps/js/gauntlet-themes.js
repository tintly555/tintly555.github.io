/*
 * Gauntlet environments. Each 20-level chapter has its own place: materials for the decks and
 * walls, sky and fog, lighting, and scenery built around the course. A theme is plain data plus
 * a scenery function; createGauntletThemes(THREE) turns it into materials and objects.
 *
 * Chapters (GAUNTLET_CHAPTERS order): 0 ashen city, 1 foundry, 2 switchyard, 3 frozen dam,
 * 4 orbital relay, 5 causeway above a maze, 6 missile silos, 7 alien outpost, 8 starship hangar,
 * 9 weapon factory.
 */
import { mergeGeometries } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/utils/BufferGeometryUtils.js";
import { createSurfaces, rngFor, fbm } from "./gauntlet-surfaces.js?v=3";

const TAU = Math.PI * 2;
const glowCache = new Map();

export function createGauntletThemes(THREE) {
  const surfaces = createSurfaces(THREE);
  const styleCache = new Map();

  // ---- Small helpers ---------------------------------------------------------------------
  function material(set, { color = 0xffffff, rough = 1, metal = 0, emissive = 0, emissiveIntensity = 0, side } = {}) {
    const m = new THREE.MeshStandardMaterial({
      map: set.map, normalMap: set.normalMap, roughnessMap: set.roughnessMap || null,
      roughness: rough, metalness: metal, color, emissive, emissiveIntensity,
    });
    if (side !== undefined) m.side = side;
    m.userData.shared = m.userData._cachedShared = true;
    return m;
  }
  /** Scale a BoxGeometry's UVs so one texture tile covers `tile` metres on every face. */
  function boxUv(geometry, w, h, d, tile) {
    const uv = geometry.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
      for (let k = 0; k < 4; k++) {
        const i = f * 4 + k;
        uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile);
      }
    }
    uv.needsUpdate = true;
    return geometry;
  }
  /** Collects boxes and cylinders, then merges them into one mesh per material. */
  class Batch {
    constructor(tile = 3) { this.parts = []; this.tile = tile; }
    box(w, h, d, x, y, z, ry = 0, rz = 0) {
      const g = boxUv(new THREE.BoxGeometry(w, h, d), w, h, d, this.tile);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, rz)), new THREE.Vector3(1, 1, 1));
      g.applyMatrix4(m);
      this.parts.push(g);
      return this;
    }
    cyl(rt, rb, h, x, y, z, seg = 14, rx = 0, rz = 0) {
      const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(rt, rb) * TAU / this.tile, uv.getY(i) * h / this.tile);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, rz)), new THREE.Vector3(1, 1, 1));
      g.applyMatrix4(m);
      this.parts.push(g);
      return this;
    }
    /** A square beam between two points (any direction). */
    beam(a, b, t = .4) {
      const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
      const length = from.distanceTo(to);
      if (length < .01) return this;
      const g = boxUv(new THREE.BoxGeometry(t, t, length), t, t, length, this.tile);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), to.clone().sub(from).normalize());
      g.applyMatrix4(new THREE.Matrix4().compose(from.clone().add(to).multiplyScalar(.5), q, new THREE.Vector3(1, 1, 1)));
      this.parts.push(g);
      return this;
    }
    mesh(mat) {
      if (!this.parts.length) return null;
      const geometry = mergeGeometries(this.parts.map(p => p.index ? p.toNonIndexed() : p), false);
      this.parts.forEach(p => p.dispose());
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.raycast = () => {};
      mesh.frustumCulled = false;
      return mesh;
    }
  }
  function glowTexture() {
    let t = glowCache.get("glow");
    if (t) return t;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const g = canvas.getContext("2d");
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(.3, "rgba(255,255,255,.45)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    glowCache.set("glow", t);
    return t;
  }
  function glow(color, size, x, y, z, opacity = .8, additive = true) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color, transparent: true, opacity, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: !additive,
    }));
    sprite.scale.set(size, size, 1);
    sprite.position.set(x, y, z);
    sprite.raycast = () => {};
    return sprite;
  }
  function stars(rnd, count, radius, tint = 0xffffff) {
    const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
    const base = new THREE.Color(tint);
    for (let i = 0; i < count; i++) {
      const u = rnd() * TAU, v = Math.acos(2 * rnd() - 1);
      positions[i * 3] = Math.sin(v) * Math.cos(u) * radius;
      positions[i * 3 + 1] = Math.cos(v) * radius;
      positions[i * 3 + 2] = Math.sin(v) * Math.sin(u) * radius;
      const k = .35 + rnd() * .65, warm = rnd();
      colors[i * 3] = base.r * k * (warm > .85 ? 1 : .86);
      colors[i * 3 + 1] = base.g * k * .93;
      colors[i * 3 + 2] = base.b * k * (warm < .15 ? .8 : 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false }));
    points.frustumCulled = false;
    points.raycast = () => {};
    return points;
  }
  /** Drifting particles inside a box that follows the player's z. Returns a tick function. */
  function particles(ctx, { count, w, h, d, velocity, color, size, opacity = .8, jitter = .3 }) {
    const positions = new Float32Array(count * 3), seeds = new Float32Array(count);
    const rnd = ctx.rnd;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() - .5) * w; positions[i * 3 + 1] = (rnd() - .5) * h; positions[i * 3 + 2] = (rnd() - .5) * d;
      seeds[i] = rnd() * TAU;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, sizeAttenuation: true }));
    points.frustumCulled = false;
    points.raycast = () => {};
    ctx.add(points);
    let clock = 0;
    ctx.tick((dt, player) => {
      clock += dt;
      points.position.set(player.x, player.y, player.z);
      const p = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const k = i * 3;
        p[k] += (velocity[0] + Math.sin(clock * .7 + seeds[i]) * jitter) * dt;
        p[k + 1] += velocity[1] * dt;
        p[k + 2] += (velocity[2] + Math.cos(clock * .6 + seeds[i]) * jitter) * dt;
        if (p[k] > w / 2) p[k] -= w; else if (p[k] < -w / 2) p[k] += w;
        if (p[k + 1] > h / 2) p[k + 1] -= h; else if (p[k + 1] < -h / 2) p[k + 1] += h;
        if (p[k + 2] > d / 2) p[k + 2] -= d; else if (p[k + 2] < -d / 2) p[k + 2] += d;
      }
      geometry.attributes.position.needsUpdate = true;
    });
    return points;
  }
  function windowSet(name, { facade = [60, 58, 56], lit = [255, 190, 110], litChance = .06, cols = 8, rows = 16, size = 256 } = {}) {
    const key = "windows:" + name;
    let hit = glowCache.get(key);
    if (hit) return hit;
    const rnd = rngFor(name.length * 977 + cols * 13);
    const make = () => { const c = document.createElement("canvas"); c.width = c.height = size; return c; };
    const color = make(), emit = make(), cc = color.getContext("2d"), ec = emit.getContext("2d");
    cc.fillStyle = `rgb(${facade})`; cc.fillRect(0, 0, size, size);
    ec.fillStyle = "#000"; ec.fillRect(0, 0, size, size);
    const cw = size / cols, ch = size / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * cw + cw * .22, y = r * ch + ch * .2, w = cw * .56, h = ch * .58;
      const broken = rnd() < .5;
      cc.fillStyle = broken ? "rgb(12,12,14)" : `rgb(${facade[0] * .45},${facade[1] * .45},${facade[2] * .5})`;
      cc.fillRect(x, y, w, h);
      if (rnd() < litChance) { ec.fillStyle = `rgb(${lit})`; ec.fillRect(x, y, w, h); }
    }
    const noise = fbm(size, 5 + name.length, 3, 4);
    const img = cc.getImageData(0, 0, size, size);
    for (let i = 0; i < noise.length; i++) {
      const k = .78 + noise[i] * .4;
      img.data[i * 4] *= k; img.data[i * 4 + 1] *= k; img.data[i * 4 + 2] *= k;
    }
    cc.putImageData(img, 0, 0);
    const tex = canvas => { const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    hit = { map: tex(color), emissiveMap: tex(emit) };
    glowCache.set(key, hit);
    return hit;
  }

  function lavaTexture() {
    let t = glowCache.get("lava");
    if (t) return t;
    const size = 512, n = fbm(size, 91, 5, 4), canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const g = canvas.getContext("2d"), img = g.createImageData(size, size);
    for (let i = 0; i < n.length; i++) {
      const v = n[i], crust = Math.max(0, Math.min(1, (v - .42) * 4));
      const hot = 1 - crust;
      img.data[i * 4] = 40 + hot * 215 + crust * 18; img.data[i * 4 + 1] = 18 + hot * 112; img.data[i * 4 + 2] = 10 + hot * 24; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 8);
    t.colorSpace = THREE.SRGBColorSpace;
    glowCache.set("lava", t);
    return t;
  }

  function planetTexture(name, stops, bands = 9, seed = 3) {
    const key = "planet:" + name;
    let t = glowCache.get(key);
    if (t) return t;
    const w = 1024, h = 512, canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const g = canvas.getContext("2d"), img = g.createImageData(w, h);
    const n = fbm(512, seed, 6, 4), n2 = fbm(512, seed + 9, 4, 8);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = n[(y & 511) * 512 + (x & 511)], c = n2[(y & 511) * 512 + (x & 511)];
      const lat = y / h;
      const band = .5 + .5 * Math.sin(lat * bands * Math.PI * 2 + v * 5);
      const k = Math.min(1, Math.max(0, band * .6 + v * .5));
      const a = stops[Math.floor(k * (stops.length - 1))], b = stops[Math.min(stops.length - 1, Math.floor(k * (stops.length - 1)) + 1)];
      const f = k * (stops.length - 1) % 1;
      const cloud = Math.max(0, c - .5) * 1.6;
      const i = (y * w + x) * 4;
      img.data[i] = a[0] + (b[0] - a[0]) * f + cloud * 150; img.data[i + 1] = a[1] + (b[1] - a[1]) * f + cloud * 150; img.data[i + 2] = a[2] + (b[2] - a[2]) * f + cloud * 150; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    glowCache.set(key, t);
    return t;
  }
  function planet(ctx, radius, x, y, z, texture, atmosphere) {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 40), new THREE.MeshStandardMaterial({ map: texture, roughness: .95, metalness: 0, fog: false }));
    sphere.position.set(x, y, z);
    sphere.raycast = () => {};
    ctx.add(sphere);
    if (atmosphere) {
      const halo = glow(atmosphere, radius * 2.35, x, y, z, .55);
      halo.material.fog = false;
      halo.renderOrder = -1;
      ctx.add(halo);
    }
    return sphere;
  }
  // ---- Scenery ---------------------------------------------------------------------------
  // Everything stands on the ground (ctx.groundY) or hangs from something; nothing floats. The
  // course itself is held up by the supports built in buildSupports().
  const place = (obj, ctx) => { ctx.add(obj); return obj; };
  const rz = ctx => ctx.z1 - 90 + ctx.rnd() * (ctx.z0 - ctx.z1 + 160);
  const sideOf = ctx => (ctx.rnd() < .5 ? -1 : 1);
  function groundPlane(ctx, y, set, size = 1800, repeat = 60, color = 0xffffff, rough = 1) {
    // Big enough to reach past the horizon from anywhere on a course that winds far from the origin.
    const grown = Math.max(size, ctx.wx * 2 + ctx.length + 1400);
    repeat *= grown / size;
    size = grown;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material(set, { color, rough }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(ctx.cx, y, ctx.mid);
    mesh.raycast = () => {};
    const uv = mesh.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * repeat, uv.getY(i) * repeat);
    return place(mesh, ctx);
  }
  function smokeColumn(ctx, x, y, z, color = 0x2a2420, size = 22, count = 9) {
    for (let i = 0; i < count; i++) {
      const s = size * (.6 + i * .22);
      const puff = glow(color, s, x + (ctx.rnd() - .5) * 6 + i * 1.5, y + i * size * .55, z + (ctx.rnd() - .5) * 6, .5 - i * .035, false);
      ctx.add(puff);
    }
  }
  const wallMaterial = (name, opts, extra = {}) => material(surfaces.concrete(name, opts), extra);
  const steelMaterial = (name, opts, extra = { metal: .5, rough: .7 }) => material(surfaces.steel(name, opts), extra);
  function lampMast(batch, x, y, z, h, dir = 1) {
    batch.cyl(.16, .24, h, x, y + h / 2, z, 8).box(3.2, .3, .3, x + dir * 1.5, y + h - .2, z);
  }
  function hColumn(batch, x, z, top, ground, size = 1.1) {
    const h = top - ground;
    batch.box(size * .22, h, size, x, ground + h / 2, z).box(size, h, size * .24, x, ground + h / 2, z + size * .38).box(size, h, size * .24, x, ground + h / 2, z - size * .38);
    batch.box(size * 2, .5, size * 2, x, ground + .25, z).box(size * 1.5, .6, size * 1.5, x, top - .3, z);
  }

  function ashCity(ctx) {
    const g = ctx.groundY;
    groundPlane(ctx, g, surfaces.asphalt("ash-street", { base: [40, 40, 42], line: true }), 1800, 70);
    const set = windowSet("ash", { facade: [78, 70, 64], lit: [255, 164, 76], litChance: .03 });
    const mat = new THREE.MeshStandardMaterial({ map: set.map, emissiveMap: set.emissiveMap, emissive: 0xffffff, emissiveIntensity: 1, roughness: .92, metalness: .04 });
    mat.userData.shared = mat.userData._cachedShared = true;
    const towers = new Batch(10), rubble = new Batch(4);
    let placed = 0;
    const target = Math.min(240, 110 + Math.round(ctx.wx * ctx.length / 1800));
    for (let attempt = 0; placed < target && attempt < 3600; attempt++) {
      const near = placed < target * .64;
      const s = sideOf(ctx), w = 14 + ctx.rnd() * 24, d = 14 + ctx.rnd() * 24;
      const x = ctx.cx + s * ((near ? 20 : 110) + w / 2 + ctx.rnd() * ((near ? 56 : 200) + ctx.wx));
      const z = rz(ctx);
      // Buildings stand apart, square to the street grid: none overlap, none lean through another.
      if (!ctx.claim(x, z, Math.hypot(w, d) / 2 + 3)) continue;
      placed++;
      const top = near ? ctx.lowY + (ctx.rnd() * 56 - 34) : g + 70 + ctx.rnd() * 130;
      const h = top - g;
      towers.box(w, h, d, x, g + h / 2, z);
      if (ctx.rnd() < .6) towers.box(w * .62, h * .16, d * .62, x + (ctx.rnd() - .5) * w * .2, top + h * .08, z);
      rubble.box(w + 3, 2.4 + ctx.rnd() * 1.6, d + 3, x, g + 1.4, z);
      if (near && ctx.rnd() < .25) smokeColumn(ctx, x, top, z, 0x2e2722, 18, 8);
    }
    place(towers.mesh(mat), ctx);
    place(rubble.mesh(wallMaterial("ash-rubble", { base: [96, 92, 86], ash: .9, crack: 20 })), ctx);
    const road = new Batch(6), cars = new Batch(3);
    const viaduct = Math.max(420, ctx.wx * 2 + 260), columns = Math.floor(viaduct / 76);
    for (let i = 0; i < 4; i++) {
      const z = ctx.z0 - i * (ctx.length / 3) - 10, y = g + 14;
      road.box(viaduct, 1.8, 13, ctx.cx, y, z).box(viaduct, .9, .3, ctx.cx, y + 1.3, z - 6.2).box(viaduct, .9, .3, ctx.cx, y + 1.3, z + 6.2);
      for (let k = -columns; k <= columns; k++) road.box(2.6, 14, 5, ctx.cx + k * 38, g + 7, z).box(5.4, 1.4, 6.4, ctx.cx + k * 38, y - 1.5, z);
    }
    for (let i = 0; i < 46; i++) cars.box(1.9, 1.3, 4.4, ctx.scatterX(120), g + .7, rz(ctx), ctx.rnd() * TAU);
    place(road.mesh(wallMaterial("viaduct", { base: [96, 92, 86], ash: .7, crack: 12 })), ctx);
    place(cars.mesh(steelMaterial("burnt", { base: [52, 48, 46], rust: .8 })), ctx);
    const lamps = new Batch(3);
    for (let i = 0; i < 40; i++) lampMast(lamps, ctx.scatterX(40), g, rz(ctx), 9, 1);
    place(lamps.mesh(steelMaterial("lamp", { base: [70, 74, 78], rust: .4 })), ctx);
    for (let i = 0; i < 26; i++) ctx.add(glow(0xff7a2c, 30 + ctx.rnd() * 40, ctx.scatterX(200), g + 8 + ctx.rnd() * 30, rz(ctx), .45));
    for (let i = 0; i < 14; i++) ctx.add(glow(0x8c5a3a, 160 + ctx.rnd() * 160, ctx.scatterX(300), ctx.highY + 30 + ctx.rnd() * 70, ctx.z0 - ctx.rnd() * (ctx.length + 200), .16, false));
    particles(ctx, { count: 700, w: 80, h: 40, d: 90, velocity: [1.4, -1.6, .2], color: 0xb6aca2, size: .09, opacity: .7 });
  }

  function foundry(ctx) {
    const g = ctx.groundY;
    groundPlane(ctx, g, surfaces.factory("fdy-floor", { base: [54, 52, 52] }), 1800, 80);
    const lava = new THREE.MeshBasicMaterial({ map: lavaTexture() });
    for (const x of [ctx.cx - ctx.wx - 20, ctx.cx + 4, ctx.cx + ctx.wx + 40]) {
      const channel = new THREE.Mesh(new THREE.PlaneGeometry(12, ctx.length + 500), lava);
      channel.rotation.x = -Math.PI / 2;
      channel.position.set(x, g + .2, ctx.mid);
      channel.raycast = () => {};
      place(channel, ctx);
      for (let i = 0; i < 9; i++) ctx.add(glow(0xff8a32, 26 + ctx.rnd() * 20, x + (ctx.rnd() - .5) * 8, g + 3, ctx.z0 - ctx.rnd() * (ctx.length + 140), .5));
    }
    const sheds = new Batch(5), furn = new Batch(6), tanks = new Batch(5), racks = new Batch(4), cranes = new Batch(4);
    for (let i = 0; i < 18 + Math.round(ctx.wx * ctx.length / 9000); i++) {
      const s = sideOf(ctx), w = 24 + ctx.rnd() * 30, d = 20 + ctx.rnd() * 40, h = 12 + ctx.rnd() * 10;
      const x = ctx.cx + s * (30 + w / 2 + ctx.rnd() * (90 + ctx.wx)), z = rz(ctx);
      if (!ctx.claim(x, z, Math.hypot(w, d) / 2 + 3)) continue;
      sheds.box(w, h, d, x, g + h / 2, z);
      for (let k = 0; k < 3; k++) sheds.box(w / 3, 5, d, x - w / 3 + k * w / 3, g + h + 2.4, z, 0, .32);
    }
    for (let i = 0; i < 7; i++) {
      const s = sideOf(ctx), x = ctx.cx + s * (34 + ctx.rnd() * (70 + ctx.wx)), z = rz(ctx), r = 7 + ctx.rnd() * 4, h = 38 + ctx.rnd() * 26;
      if (!ctx.claim(x, z, r + 14)) continue;
      furn.cyl(r * .92, r, h, x, g + h / 2, z, 22).cyl(r * .6, r * .92, 6, x, g + h + 3, z, 22);
      furn.cyl(1.3, 1.3, 26, x + s * (r + 12), g + 30, z, 10, 0, Math.PI / 2).cyl(1.3, 1.3, 18, x + s * (r + 24), g + 21, z, 10);
      ctx.add(glow(0xff7a2a, r * 3, x, g + h * .55, z + r + .5, .75));
      ctx.add(glow(0xff6a22, r * 4, x, g + h + 5, z, .5));
    }
    for (let i = 0; i < 7; i++) {
      const s = sideOf(ctx), x = ctx.cx + s * (50 + ctx.rnd() * (120 + ctx.wx)), z = rz(ctx), r = 3.5 + ctx.rnd() * 2, h = 80 + ctx.rnd() * 40;
      if (!ctx.claim(x, z, r + 4)) continue;
      furn.cyl(r * .78, r, h, x, g + h / 2, z, 18).cyl(r * .86, r * .78, 3, x, g + h + 1.5, z, 18);
      ctx.add(glow(0xff6a22, r * 6, x, g + h + 3, z, .7));
      smokeColumn(ctx, x, g + h + 6, z, 0x2a1f1a, 16, 7);
    }
    for (let i = 0; i < 12; i++) {
      const s = sideOf(ctx), x = ctx.cx + s * (26 + ctx.rnd() * (90 + ctx.wx)), z = rz(ctx), r = 5 + ctx.rnd() * 4, h = 10 + ctx.rnd() * 8;
      if (!ctx.claim(x, z, r + 3)) continue;
      tanks.cyl(r, r, h, x, g + h / 2, z, 20).cyl(r * .2, r, 2.4, x, g + h + 1.2, z, 20);
    }
    for (let i = 0; i < 6; i++) {
      const z = rz(ctx), s = sideOf(ctx), x = ctx.cx + s * (24 + ctx.rnd() * (30 + ctx.wx)), y = g + 12 + (i % 2) * 9, len = 60 + ctx.rnd() * 60;
      racks.box(1.6, 1.6, len, x, y, z).box(1.6, 1.6, len, x + 2.6, y + 1, z);
      for (let k = 0; k <= len / 12; k++) racks.box(1, y - g, 1, x + 1.3, g + (y - g) / 2, z - len / 2 + k * 12);
    }
    for (let i = 0; i < 5; i++) {
      const z = ctx.z0 - i * (ctx.length / 4) - 8, y = g + 36, half = Math.max(88, ctx.wx + 50);
      cranes.box(half * 2 + 4, 1.8, 2.4, ctx.cx, y, z).box(8, 2.6, 5, ctx.cx + (ctx.rnd() - .5) * half * 1.4, y - 2.2, z);
      for (const s of [-1, 1]) cranes.box(1.8, y - g, 1.8, ctx.cx + s * half, g + (y - g) / 2, z).box(1.4, y - g, 1.4, ctx.cx + s * (half + 3), g + (y - g) / 2, z + 1.2);
    }
    place(sheds.mesh(steelMaterial("shed", { base: [96, 86, 78], rust: .6 }, { metal: .3, rough: .85 })), ctx);
    place(furn.mesh(steelMaterial("furn", { base: [82, 66, 56], rust: .75 }, { metal: .35, rough: .85 })), ctx);
    place(tanks.mesh(steelMaterial("tank", { base: [112, 106, 98], rust: .4 })), ctx);
    place(racks.mesh(steelMaterial("rack", { base: [104, 100, 96], rust: .5 })), ctx);
    place(cranes.mesh(steelMaterial("crane", { base: [190, 150, 40], paint: [194, 150, 36], rust: .15 })), ctx);
    particles(ctx, { count: 420, w: 70, h: 40, d: 80, velocity: [.2, 2.4, 0], color: 0xff9a40, size: .12, opacity: .9, jitter: .8 });
  }

  function switchyard(ctx) {
    const g = ctx.groundY;
    groundPlane(ctx, g, surfaces.concrete("yard", { base: [64, 66, 68], wet: .85, stain: .6, crack: 8 }), 1800, 80, 0xffffff, .4);
    const tracks = new Batch(4), cars = new Batch(4), pylons = new Batch(5), gantries = new Batch(4), trans = new Batch(4), fence = new Batch(2);
    const tracksX = [-70, -62, 62, 70, 110].map(v => ctx.cx + v + Math.sign(v) * ctx.wx * .6);
    for (const tx of tracksX) {
      tracks.box(3.4, .4, ctx.length + 520, tx, g + .2, ctx.mid);
      for (const r of [-.72, .72]) tracks.box(.14, .22, ctx.length + 520, tx + r, g + .55, ctx.mid);
      for (let i = 0; i < 90; i++) tracks.box(2.6, .14, .26, tx, g + .5, ctx.z0 + 60 - i * ((ctx.length + 500) / 90));
    }
    for (let i = 0; i < 18; i++) {
      const tx = tracksX[i % 5], z = rz(ctx), len = 12 + ctx.rnd() * 4;
      cars.box(2.9, 3.2, len, tx, g + 2.4, z).box(2.6, .5, len - .6, tx, g + 4.2, z).box(2.6, .5, 1.6, tx, g + .9, z - len / 2 + 2).box(2.6, .5, 1.6, tx, g + .9, z + len / 2 - 2);
    }
    const towers = [];
    for (let i = 0; i < 16; i++) {
      // Pylons stand clear of the whole course, in two rows either side of it.
      const s = i % 2 ? 1 : -1, x = ctx.cx + s * (ctx.wx + 44 + ctx.rnd() * 18), z = ctx.z0 + 20 - i * ((ctx.length + 140) / 15), base = g, h = ctx.highY - g + 70;
      towers.push([x, z]);
      for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) pylons.cyl(.35, .6, h, x + dx * .8, base + h / 2, z + dz * .8, 6);
      for (let k = 0; k < 9; k++) {
        const y = base + 8 + k * (h / 9), w = 8 - k * .5;
        pylons.box(w, .45, .45, x, y, z - 2.4).box(w, .45, .45, x, y, z + 2.4).box(.45, .45, 4.8, x - w / 2, y, z).box(.45, .45, 4.8, x + w / 2, y, z);
        pylons.box(.3, h / 9, .3, x - w / 2 + .3, y + h / 18, z - 2.4, 0, .3).box(.3, h / 9, .3, x + w / 2 - .3, y + h / 18, z + 2.4, 0, -.3);
      }
      for (const arm of [-1, 1]) {
        pylons.box(26, .9, .9, x + arm * 10, base + h - 4, z).box(.5, 4, .5, x + arm * 22, base + h - 6.2, z);
        ctx.add(glow(0xdfeaff, 7, x + arm * 22, base + h - 8.4, z, .8));
      }
    }
    for (let i = 0; i < 12; i++) {
      const z = ctx.z0 + 20 - i * ((ctx.length + 100) / 11), x = ctx.cx + (i % 2 ? 1 : -1) * 22;
      for (const sx of [-1, 1]) gantries.box(1.1, 20, 1.1, x + sx * 12, g + 10, z);
      gantries.box(26, 1, 1, x, g + 20, z).box(26, .8, .8, x, g + 17, z);
      for (let k = -2; k <= 2; k++) gantries.cyl(.25, .25, 3, x + k * 5, g + 18.4, z, 8);
    }
    for (let i = 0; i < 30; i++) {
      const s = sideOf(ctx), x = ctx.cx + s * (24 + ctx.rnd() * (70 + ctx.wx)), z = rz(ctx);
      if (!ctx.claim(x, z, 6)) continue;
      trans.box(7, 6, 5, x, g + 3, z).box(1, 3, 1, x - 2, g + 7.5, z).box(1, 3, 1, x + 2, g + 7.5, z).box(8.4, .4, 6.4, x, g + .2, z);
      ctx.add(glow(0x7fd0ff, 4, x, g + 7.5, z + 2.7, .8));
    }
    for (const fx of [ctx.cx - ctx.wx - 110, ctx.cx + ctx.wx + 110]) for (let i = 0; i < 60; i++) fence.box(.2, 3.4, 4, fx, g + 1.7, ctx.z0 + 70 - i * ((ctx.length + 220) / 59));
    place(tracks.mesh(steelMaterial("rails", { base: [90, 86, 80], rust: .5 })), ctx);
    place(cars.mesh(steelMaterial("freight", { base: [110, 64, 52], paint: [118, 70, 56], rust: .5 })), ctx);
    place(pylons.mesh(steelMaterial("pylon", { base: [118, 124, 128], rust: .15 })), ctx);
    place(gantries.mesh(steelMaterial("busbar", { base: [120, 126, 130], rust: .1 })), ctx);
    place(trans.mesh(steelMaterial("trans", { base: [88, 104, 94], paint: [76, 102, 88] }, { metal: .4, rough: .6 })), ctx);
    place(fence.mesh(steelMaterial("fence", { base: [120, 124, 126], rust: .3 })), ctx);
    const wires = [];
    for (let i = 0; i < towers.length - 2; i++) {
      const [x0, z0] = towers[i], [x1, z1] = towers[i + 2];
      if (Math.sign(x0) !== Math.sign(x1)) continue;
      for (const arm of [-1, 1]) {
        let prev = null;
        for (let s = 0; s <= 10; s++) {
          const t = s / 10, sag = Math.sin(t * Math.PI) * 5;
          const p = [x0 + arm * 22 + (x1 - x0) * t, ctx.highY + 62 - sag, z0 + (z1 - z0) * t];
          if (prev) wires.push(...prev, ...p);
          prev = p;
        }
      }
    }
    const wireGeometry = new THREE.BufferGeometry();
    wireGeometry.setAttribute("position", new THREE.Float32BufferAttribute(wires, 3));
    const lines = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: 0x20262c }));
    lines.frustumCulled = false;
    place(lines, ctx);
    particles(ctx, { count: 600, w: 60, h: 40, d: 70, velocity: [-.6, -17, .5], color: 0xa8bccd, size: .06, opacity: .5, jitter: .05 });
  }

  function frozenDam(ctx) {
    const g = ctx.groundY;
    const ice = surfaces.ice("lake");
    const lake = groundPlane(ctx, g, ice, 2400, 50, 0xffffff, 1);
    lake.material = new THREE.MeshPhysicalMaterial({
      map: ice.map, normalMap: ice.normalMap, roughnessMap: ice.roughnessMap, roughness: .55, metalness: 0,
      clearcoat: 1, clearcoatRoughness: .08, ior: 1.31, color: 0xd9eefa,
    });
    lake.material.userData.shared = lake.material.userData._cachedShared = true;
    const dam = new Batch(8), gates = new Batch(5), rock = new Batch(10), snow = new Batch(10);
    const dx = ctx.cx - ctx.wx - 70, crest = ctx.lowY + 18, span = ctx.length + 420;
    // The dam: a stepped, buttressed wall with a crest road, spillway bays and towers.
    dam.box(26, crest - g, span, dx - 8, g + (crest - g) / 2, ctx.mid).box(14, crest - g - 22, span, dx + 14, g + (crest - g - 22) / 2, ctx.mid).box(9, 30, span, dx + 24, g + 15, ctx.mid);
    dam.box(7, 1.4, span, dx + 2, crest + .7, ctx.mid);
    for (let i = 0; i < Math.ceil(span / 26); i++) {
      const z = ctx.mid + span / 2 - 13 - i * 26;
      dam.box(11, crest - g - 10, 5, dx + 24, g + (crest - g - 10) / 2, z).box(2.6, 9, 2.6, dx - 2.5, crest + 5.5, z);
      gates.box(8.4, 22, 1.2, dx + 8.2, crest - 14, z + 10.5).box(.8, 22, .8, dx + 11.5, crest - 14, z + 10.5);
    }
    for (let i = 0; i < 26; i++) {
      const s = ctx.rnd() < .7 ? 1 : -1, x = ctx.cx + (s > 0 ? ctx.wx + 150 : -ctx.wx - 230) + ctx.rnd() * 260 * s, z = rz(ctx) - ctx.rnd() * 200, r = 40 + ctx.rnd() * 90, h = 60 + ctx.rnd() * 150;
      rock.cyl(r * .1, r, h, x, g + h / 2, z, 9, 0, (ctx.rnd() - .5) * .08);
      snow.cyl(r * .06, r * .36, h * .38, x, g + h - h * .19, z, 9, 0, 0);
    }
    place(dam.mesh(wallMaterial("dam", { base: [138, 140, 142], stain: .6, ash: .25, wet: .4, crack: 10 })), ctx);
    place(gates.mesh(steelMaterial("sluice", { base: [74, 82, 90], paint: [64, 84, 104], rust: .35 })), ctx);
    place(rock.mesh(wallMaterial("peak", { base: [96, 100, 106], stain: .8, crack: 18 }, { rough: 1 })), ctx);
    place(snow.mesh(new THREE.MeshStandardMaterial({ color: 0xf2f6fb, roughness: .9, metalness: 0 })), ctx);
    const bergs = new Batch(6);
    for (let i = 0; i < 46; i++) {
      const bx = ctx.scatterX(160), bz = ctx.z0 - ctx.rnd() * (ctx.length + 120), r = 3 + ctx.rnd() * 12;
      bergs.cyl(r * .45, r, r * 1.2, bx, g + r * .5, bz, 7, 0, (ctx.rnd() - .5) * .3);
    }
    const lamps = new Batch(3);
    for (let i = 0; i < Math.ceil(span / 52); i++) lampMast(lamps, dx + 2, crest, ctx.mid + span / 2 - i * 52, 7, 1);
    place(lamps.mesh(steelMaterial("damlamp", { base: [90, 96, 102] })), ctx);
    place(bergs.mesh(material(surfaces.ice("berg"), { color: 0xcfe8f6, rough: .6 })), ctx);
    particles(ctx, { count: 900, w: 80, h: 50, d: 90, velocity: [1.2, -2.2, .4], color: 0xf4f9ff, size: .12, opacity: .85, jitter: .9 });
  }

  function orbitalRelay(ctx) {
    ctx.add(stars(ctx.rnd, 3600, 3000));
    planet(ctx, 1500, ctx.cx + 380, ctx.lowY - 1750, ctx.mid - 200, planetTexture("earthlike", [[10, 30, 80], [20, 70, 140], [30, 120, 150], [74, 130, 80], [150, 140, 100], [236, 240, 244]], 6, 11), 0x6fb4ff);
    const sunGlow = glow(0xfff2d8, 520, ctx.cx + 900, ctx.highY + 640, ctx.mid - 1100, .95);
    sunGlow.material.fog = false;
    ctx.add(sunGlow);
    const spine = new Batch(2.6), mods = new Batch(2.6), panels = new Batch(2.2), radiators = new Batch(2.2), dishes = new Batch(2);
    // A station running alongside the course: truss backbone, pressurised modules, solar wings, radiators.
    for (const side of [-1, 1]) {
      const x = ctx.cx + side * (ctx.wx + 70), y = ctx.lowY - 6, len = ctx.length + 380;
      for (const dy of [-5, 5]) for (const dxx of [-5, 5]) spine.box(.7, .7, len, x + dxx, y + dy, ctx.mid);
      for (let i = 0; i < len / 10; i++) {
        const z = ctx.mid + len / 2 - i * 10;
        spine.box(10.6, .45, .45, x, y + 5, z).box(10.6, .45, .45, x, y - 5, z).box(.45, 10.6, .45, x + 5, y, z).box(.45, 10.6, .45, x - 5, y, z);
        spine.box(11, .3, .3, x, y, z, 0, 0).box(.3, .3, 11, x, y, z - 5);
      }
      for (let i = 0; i < 5; i++) {
        const z = ctx.z0 + 30 - i * ((ctx.length + 200) / 4) - ctx.rnd() * 30, r = 5 + ctx.rnd() * 3, l = 30 + ctx.rnd() * 20;
        mods.cyl(r, r, l, x, y + 12 + (i % 2) * -24, z, 28, Math.PI / 2, 0).cyl(r * 1.1, r * 1.1, 2, x, y + 12 + (i % 2) * -24, z + l / 2, 28, Math.PI / 2, 0);
        mods.box(1.2, 12, 1.2, x, y + 6 + (i % 2) * -12, z);
        panels.box(.3, 40, 90, x + side * 6, y + 12 + (i % 2) * -24 + 34, z + 10).box(.3, 40, 90, x + side * 6, y + 12 + (i % 2) * -24 - 34, z + 10);
        radiators.box(.2, 18, 44, x - side * 14, y + (i % 2 ? 22 : -22), z - 14);
      }
      for (let i = 0; i < 3; i++) dishes.cyl(1.2, 6, 3, x + side * 10, y + 18 + i * 14, ctx.z0 - i * (ctx.length / 3), 24, 0, side * .5).box(.5, 14, .5, x + side * 8, y + 10 + i * 14, ctx.z0 - i * (ctx.length / 3));
    }
    place(spine.mesh(steelMaterial("truss", { base: [196, 200, 206], rust: 0 }, { metal: .6, rough: .45 })), ctx);
    place(mods.mesh(material(surfaces.composite("relay-module", { base: [214, 216, 220], accent: [220, 140, 60] }), { metal: .1 })), ctx);
    place(panels.mesh(material(surfaces.hull("solar", { base: [26, 48, 110] }), { metal: .6, rough: .4, color: 0xaecbff })), ctx);
    place(radiators.mesh(material(surfaces.composite("radiator", { base: [236, 238, 240] }), {})), ctx);
    place(dishes.mesh(steelMaterial("dish", { base: [226, 228, 230], rust: 0 }, { metal: .4, rough: .35 })), ctx);
    const debris = new Batch(3);
    for (let i = 0; i < 40 + Math.round(ctx.wx * ctx.length / 6000); i++) {
      const x = ctx.scatterX(200), y = ctx.lowY + (ctx.rnd() - .5) * 160, z = ctx.z0 - ctx.rnd() * (ctx.length + 200);
      if (ctx.nearPath(x, y, z, 6)) continue;
      debris.box(.4 + ctx.rnd() * 1.6, .2 + ctx.rnd() * .6, .6 + ctx.rnd() * 2, x, y, z, ctx.rnd() * TAU, ctx.rnd() * TAU);
    }
    place(debris.mesh(steelMaterial("debris", { base: [150, 154, 160], rust: .2 })), ctx);
  }

  function mazeBelow(ctx) {
    const g = ctx.groundY;
    const floor = surfaces.concrete("mazefloor", { base: [40, 52, 54], stain: .7, wet: .8, crack: 8 });
    groundPlane(ctx, g, floor, 1600, 90, 0xffffff, .5);
    const wallSet = surfaces.concrete("mazewall", { base: [58, 80, 82], stain: .7, wet: .5, crack: 14 });
    const walls = new Batch(6);
    const cell = 12, h = 34;
    const n = Math.max(46, Math.min(74, Math.ceil(Math.max(ctx.wx * 2 + 160, ctx.length + 160) / cell)));
    const ox = ctx.cx - n * cell / 2, oz = ctx.mid - n * cell / 2;
    for (let gz = 0; gz < n; gz++) for (let gx = 0; gx < n; gx++) {
      if (ctx.rnd() < .56) walls.box(cell + .8, h * (.8 + ctx.rnd() * .4), 1.1, ox + gx * cell + cell / 2, g + h / 2, oz + gz * cell);
      if (ctx.rnd() < .56) walls.box(1.1, h * (.8 + ctx.rnd() * .4), cell + .8, ox + gx * cell, g + h / 2, oz + gz * cell + cell / 2);
    }
    place(walls.mesh(material(wallSet, {})), ctx);
    for (let i = 0; i < 30; i++) ctx.add(glow(0x35e0d0, 16, ox + ctx.rnd() * n * cell, g + 20 + ctx.rnd() * 10, oz + ctx.rnd() * n * cell, .5));
    // Lamp posts stand on the kerbs of the causeway itself, one every ~26 m, wherever it winds.
    const poles = new Batch(3);
    for (let k = 4; k < ctx.path.length - 4; k += 26) {
      const c = ctx.path[k];
      if (!c.kerb) continue;
      const side = (k / 26 | 0) % 2 ? 1 : -1, th = ctx.heading(k);
      const px = c.x + Math.cos(th) * side * (c.w / 2 + .25), pz = c.z + Math.sin(th) * side * (c.w / 2 + .25);
      const base = c.y + 1.1;
      poles.cyl(.16, .22, 8.6, px, base + 4.3, pz, 8).box(2.6, .3, .3, px - Math.cos(th) * side * 1.2, base + 8.5, pz - Math.sin(th) * side * 1.2, -th);
      ctx.add(glow(0xffd28a, 3.4, px - Math.cos(th) * side * 2.2, base + 8.2, pz - Math.sin(th) * side * 2.2, .9));
    }
    place(poles.mesh(steelMaterial("pole", { base: [96, 104, 106] })), ctx);
    const towers = new Batch(5);
    for (let i = 0; i < 12; i++) { const x = ctx.cx + sideOf(ctx) * (ctx.wx + 40 + ctx.rnd() * 140), z = rz(ctx), hh = 50 + ctx.rnd() * 60; towers.box(8, hh, 8, x, g + hh / 2, z).box(10, 2, 10, x, g + hh + 1, z); ctx.add(glow(0xff4a3a, 5, x, g + hh + 3, z, .9)); }
    place(towers.mesh(material(wallSet, {})), ctx);
    particles(ctx, { count: 380, w: 70, h: 40, d: 80, velocity: [.2, .1, .3], color: 0x7fe9de, size: .08, opacity: .35, jitter: .4 });
  }

  function missileSilos(ctx) {
    const g = ctx.groundY;
    groundPlane(ctx, g, surfaces.concrete("silofloor", { base: [78, 70, 60], stain: .8, crack: 12 }), 1800, 70);
    const conc = new Batch(8), steel = new Batch(4), nose = new Batch(3);
    for (let i = 0, made = 0; made < 12 && i < 80; i++) {
      const s = i % 2 ? 1 : -1, x = ctx.cx + s * (40 + ctx.rnd() * (60 + ctx.wx)), z = rz(ctx), r = 12 + ctx.rnd() * 4;
      if (!ctx.claim(x, z, r + 8)) continue;
      made++;
      conc.cyl(r + 3, r + 4, 1.6, x, g + .8, z, 36).cyl(r, r, .6, x, g + 1.9, z, 36);
      steel.cyl(r * .5, r * .5, 1, x - r * .5, g + 2.4, z, 24, 0, s * .12).cyl(r * .5, r * .5, 1, x + r * .5, g + 2.4, z, 24, 0, -s * .12);
      if (i % 3 === 0) { nose.cyl(1.4, 1.4, 16, x, g + 8, z, 14).cyl(.1, 1.4, 5, x, g + 18.5, z, 14); }
      for (let k = 0; k < 6; k++) steel.box(.9, 3.2, .9, x + Math.cos(k) * (r + 6), g + 1.6, z + Math.sin(k) * (r + 6));
      ctx.add(glow(0xff2a1a, 3.2, x, g + 4, z - r - 1.5, .95));
    }
    for (let i = 0; i < 8; i++) {
      const s = sideOf(ctx), x = ctx.cx + s * (30 + ctx.rnd() * (140 + ctx.wx)), z = rz(ctx), w = 14 + ctx.rnd() * 16, h = 6 + ctx.rnd() * 6;
      if (!ctx.claim(x, z, w)) continue;
      conc.box(w, h, w * 1.3, x, g + h / 2, z).box(w * .6, 1, w * .6, x, g + h + .5, z);
    }
    for (let i = 0; i < 5; i++) {
      const x = ctx.cx + sideOf(ctx) * (ctx.wx + 60 + ctx.rnd() * 110), z = rz(ctx), h = 34 + ctx.rnd() * 20;
      steel.box(1.6, h, 1.6, x, g + h / 2, z).box(10, 1, 1, x, g + h, z).box(.8, 6, .8, x, g + h + 3, z).cyl(0.1, 4.4, 2.2, x, g + h + 6.6, z, 20, Math.PI / 2, 0);
    }
    for (let i = 0; i < 6; i++) {
      const x = ctx.cx + sideOf(ctx) * (90 + ctx.rnd() * (80 + ctx.wx)), z = rz(ctx), r = 5 + ctx.rnd() * 3, h = 10 + ctx.rnd() * 6;
      steel.cyl(r, r, h, x, g + h / 2, z, 20).cyl(r * .3, r, 2, x, g + h + 1, z, 20);
    }
    place(conc.mesh(wallMaterial("silo", { base: [112, 110, 104], stain: .7, crack: 10, wet: .2 })), ctx);
    place(steel.mesh(steelMaterial("hatch", { base: [92, 98, 96], paint: [86, 104, 82], rust: .25 })), ctx);
    place(nose.mesh(steelMaterial("missile", { base: [206, 208, 204], paint: [212, 214, 208], rust: .05 }, { metal: .3, rough: .45 })), ctx);
    for (let i = 0; i < 18; i++) ctx.add(glow(0xff3a22, 22, ctx.scatterX(150), g + 6 + ctx.rnd() * 20, ctx.z0 - ctx.rnd() * (ctx.length + 100), .3));
    particles(ctx, { count: 420, w: 70, h: 40, d: 80, velocity: [.15, .5, 0], color: 0xbfb3a6, size: .1, opacity: .5, jitter: .5 });
  }

  function alienOutpost(ctx) {
    const g = ctx.groundY;
    groundPlane(ctx, g, surfaces.regolith("marsground", { base: [160, 88, 58] }), 2200, 70);
    const rock = new Batch(8), mesas = new Batch(8), pads = new Batch(4), tubes = new Batch(4), shuttle = new Batch(4), solar = new Batch(2);
    for (let i = 0; i < 70; i++) {
      const s = sideOf(ctx), x = ctx.cx + s * (24 + ctx.rnd() * (240 + ctx.wx)), z = rz(ctx);
      if (!ctx.claim(x, z, 26)) continue;
      if (ctx.rnd() < .3) { const r = 14 + ctx.rnd() * 26, h = 22 + ctx.rnd() * 60; mesas.cyl(r * .8, r, h, x, g + h / 2, z, 12, 0, (ctx.rnd() - .5) * .05); }
      else { const r = 5 + ctx.rnd() * 12, h = 16 + ctx.rnd() * 70; rock.cyl(r * .2, r, h, x, g + h / 2, z, 7, (ctx.rnd() - .5) * .1, (ctx.rnd() - .5) * .1); }
    }
    for (let i = 0; i < 90; i++) rock.box(1 + ctx.rnd() * 3, .8 + ctx.rnd() * 2, 1 + ctx.rnd() * 3, ctx.scatterX(200), g + .6, rz(ctx), ctx.rnd() * TAU, (ctx.rnd() - .5) * .5);
    const comp = material(surfaces.composite("outpost", { base: [200, 190, 178], accent: [220, 120, 50] }), { metal: .1 });
    const domeCentres = [];
    for (let i = 0, tries = 0; domeCentres.length < 7 && tries < 200; i++, tries++) {
      const x = ctx.cx + (i % 2 ? 1 : -1) * (46 + ctx.rnd() * (60 + ctx.wx)), z = rz(ctx), r = 12 + ctx.rnd() * 8;
      if (!ctx.claim(x, z, r + 8)) continue;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12, 0, TAU, 0, Math.PI / 2), comp);
      dome.position.set(x, g, z);
      dome.raycast = () => {};
      ctx.add(dome);
      pads.box(r * 2.4, .6, r * 2.4, x, g + .3, z);
      ctx.add(glow(0xffd29a, r * 1.6, x, g + r * .5, z + r * .75, .5));
      domeCentres.push([x, z, r]);
    }
    domeCentres.sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < domeCentres.length - 1; i++) {
      const [x0, z0, r0] = domeCentres[i], [x1, z1, r1] = domeCentres[i + 1];
      if (Math.hypot(x1 - x0, z1 - z0) > 260) continue;
      tubes.beam([x0, g + 2.6, z0], [x1, g + 2.6, z1], 2.4);
      tubes.beam([x0, g + 2.6, z0], [x1, g + 2.6, z1], 1.4);
    }
    const shx = ctx.cx - ctx.wx - 70, sox = ctx.cx + ctx.wx + 80;
    shuttle.box(7, 4, 24, shx, g + 5, ctx.z0 - ctx.length * .45).box(16, .5, 10, shx, g + 4, ctx.z0 - ctx.length * .45 + 2, 0, 0).cyl(1.6, 2.4, 3, shx, g + 2.2, ctx.z0 - ctx.length * .45 + 9, 12).cyl(1.6, 2.4, 3, shx, g + 2.2, ctx.z0 - ctx.length * .45 - 9, 12);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 18; c++) solar.box(5, .2, 3, sox + r * 6, g + 1.8, ctx.z0 + 20 - c * 8 - r * 3, 0, .5).box(.3, 1.8, .3, sox + r * 6, g + .9, ctx.z0 + 20 - c * 8 - r * 3);
    place(rock.mesh(material(surfaces.regolith("mars", { base: [152, 82, 54] }), { rough: 1 })), ctx);
    place(mesas.mesh(material(surfaces.regolith("mesa", { base: [172, 100, 66] }), { rough: 1 })), ctx);
    place(pads.mesh(wallMaterial("pad", { base: [138, 130, 120], crack: 6 })), ctx);
    place(tubes.mesh(material(surfaces.composite("tube", { base: [208, 204, 196], accent: [220, 120, 50] }), { metal: .1 })), ctx);
    place(shuttle.mesh(material(surfaces.composite("shuttle", { base: [226, 228, 230], accent: [60, 60, 70] }), { metal: .2 })), ctx);
    place(solar.mesh(material(surfaces.hull("solar2", { base: [24, 40, 96] }), { metal: .6, rough: .4, color: 0xb8c8ff })), ctx);
    for (const [x, y, z, r, k] of [[ctx.cx - 300, ctx.highY + 220, ctx.mid - 600, 130, [[120, 100, 90], [180, 160, 140], [90, 80, 74]]], [ctx.cx + 260, ctx.highY + 330, ctx.mid - 700, 60, [[150, 120, 100], [210, 190, 170], [110, 96, 84]]]]) {
      const moon = planet(ctx, r, x, y, z, planetTexture("moon" + r, k, 3, r), null);
      moon.material.fog = false;
    }
    particles(ctx, { count: 800, w: 90, h: 40, d: 90, velocity: [-9, -.4, 1.5], color: 0xe0a070, size: .1, opacity: .55, jitter: 1.4 });
  }

  function hangar(ctx) {
    const g = ctx.groundY, ceilY = ctx.highY + 64;
    ctx.add(stars(ctx.rnd, 2600, 3000, 0xdfe8ff));
    planet(ctx, 1100, ctx.cx - 520, g - 300, ctx.mid - 600, planetTexture("gasgiant", [[168, 120, 80], [210, 170, 120], [140, 90, 70], [226, 200, 150], [110, 80, 80]], 12, 21), 0xffc080);
    groundPlane(ctx, g, surfaces.hull("deckfloor", { base: [58, 64, 72] }), 1600, 90, 0xffffff, .6);
    const hullMat = material(surfaces.hull("ship", { base: [76, 88, 104] }), { metal: .55, rough: .65 });
    const frame = new Batch(5), strips = new Batch(2), ships = new Batch(5), glowsA = new Batch(2), gantry = new Batch(4);
    // Hangar bay: massive pillars and ceiling trusses well to the sides, an open window wall beyond.
    const span = 34, count = Math.ceil((ctx.length + 200) / span), bay = ctx.wx + 90;
    for (let i = 0; i < count; i++) {
      const z = ctx.z0 + 50 - i * span;
      for (const side of [-1, 1]) {
        frame.box(6, ceilY - g + 8, 6, ctx.cx + side * (bay + 6), g + (ceilY - g + 8) / 2, z).box(3, ceilY - g, 9, ctx.cx + side * bay, g + (ceilY - g) / 2, z);
        frame.box(bay, 3.2, 3.2, ctx.cx + side * bay / 2, ceilY + 2, z, 0, side * .05);
      }
      strips.box(2, .4, span * .6, ctx.cx - 30, ceilY + .6, z - span / 2).box(2, .4, span * .6, ctx.cx + 30, ceilY + .6, z - span / 2);
    }
    frame.box(1.6, 2, ctx.length + 300, ctx.cx, ceilY + 2, ctx.mid).box(1.6, 2, ctx.length + 300, ctx.cx - bay * .5, ceilY + 2, ctx.mid).box(1.6, 2, ctx.length + 300, ctx.cx + bay * .5, ceilY + 2, ctx.mid);
    // Docked ships on the bay floor: fuselage, wings, tail fin, engines with their glow.
    for (let i = 0; i < 6; i++) {
      const s = i % 2 ? 1 : -1, x = ctx.cx + s * (46 + ctx.rnd() * 36 + ctx.wx * .6), z = ctx.z0 + 10 - i * ((ctx.length + 80) / 5), l = 50 + ctx.rnd() * 40, wd = 12 + ctx.rnd() * 8;
      ships.box(wd, 7, l, x, g + 5, z).box(wd * .55, 5, l * .35, x, g + 4.5, z - l * .6, 0, 0).box(l * .7, .9, l * .34, x, g + 4, z + l * .12).box(.9, 11, 8, x, g + 12, z + l * .38);
      ships.box(3, 2, 6, x, g + 2, z - l * .4).box(.5, .5, l * .6, x - wd * .4, g + 9, z, 0, .2);
      for (const e of [-1, 1]) { ships.cyl(2.1, 2.5, 6, x + e * wd * .32, g + 4.8, z + l / 2 + 2, 18, Math.PI / 2, 0); ctx.add(glow(0x7fd0ff, 12, x + e * wd * .32, g + 4.8, z + l / 2 + 6, .8)); }
    }
    for (let i = 0; i < 5; i++) { const z = ctx.z0 - i * (ctx.length / 4), x = ctx.cx + (i % 2 ? 1 : -1) * 28; gantry.box(1.4, 36, 1.4, x, g + 18, z).box(1.4, 36, 1.4, x + 12, g + 18, z).box(14, 1.4, 1.4, x + 6, g + 36, z).box(1, 1, 18, x + 6, g + 34.5, z - 6); }
    place(frame.mesh(hullMat), ctx);
    place(ships.mesh(material(surfaces.composite("ship2", { base: [196, 202, 208], accent: [60, 150, 210] }), { metal: .3, rough: .5 })), ctx);
    place(gantry.mesh(steelMaterial("hgantry", { base: [210, 150, 40], paint: [216, 156, 40] })), ctx);
    place(strips.mesh(new THREE.MeshBasicMaterial({ color: 0xbfeaff })), ctx);
    for (let i = 0; i < 18; i++) ctx.add(glow(0x7fd8ff, 22, ctx.scatterX(120), g + 10 + ctx.rnd() * 20, ctx.z0 - ctx.rnd() * (ctx.length + 100), .3));
  }

  function weaponFactory(ctx) {
    const g = ctx.groundY;
    groundPlane(ctx, g, surfaces.factory("wf-floor", { base: [60, 60, 62] }), 1800, 80);
    const darkMat = steelMaterial("line", { base: [70, 74, 78], paint: [54, 58, 62], rust: .1 }, { metal: .6, rough: .6 });
    const belts = new Batch(5), props = new Batch(3), rails = new Batch(3), presses = new Batch(4), ovens = new Batch(5), stacks = new Batch(3);
    const lanes = [-3, -2, 2, 3, 4];
    for (const lane of lanes) {
      const x = ctx.cx + lane * 22 + Math.sign(lane) * ctx.wx * .5;
      belts.box(8, 2.4, ctx.length + 320, x, g + 1.2, ctx.mid).box(.8, 4, ctx.length + 320, x - 4.4, g + 2.1, ctx.mid).box(.8, 4, ctx.length + 320, x + 4.4, g + 2.1, ctx.mid);
      for (let i = 0; i < 30; i++) {
        const z = ctx.z0 + 60 - ctx.rnd() * (ctx.length + 220);
        if (ctx.rnd() < .45) props.box(3.2, 1.6, 6.2, x, g + 3.2, z);
        else props.box(.5, .7, 5.2, x, g + 3, z).box(.4, 1.3, .8, x, g + 2.6, z + 1.5).box(.4, .9, 1.4, x, g + 3.8, z - 1.2);
      }
    }
    for (let i = 0; i < 12; i++) {
      const x = ctx.cx + [-55, -33, 33, 55, 77][i % 5] + Math.sign([-55, -33, 33, 55, 77][i % 5]) * ctx.wx * .5, z = ctx.z0 + 20 - i * ((ctx.length + 100) / 11);
      presses.box(10, 3, 10, x, g + 1.5, z).box(2, 22, 2, x - 4, g + 14, z - 4).box(2, 22, 2, x + 4, g + 14, z - 4).box(2, 22, 2, x - 4, g + 14, z + 4).box(2, 22, 2, x + 4, g + 14, z + 4).box(11, 3, 11, x, g + 25, z).box(5, 2.4, 5, x, g + 7, z);
    }
    for (let i = 0; i < 8; i++) {
      const x = ctx.cx + sideOf(ctx) * (110 + ctx.rnd() * 60 + ctx.wx), z = rz(ctx), w = 14 + ctx.rnd() * 8, h = 12 + ctx.rnd() * 8;
      if (!ctx.claim(x, z, w)) continue;
      ovens.box(w, h, w, x, g + h / 2, z).box(w * .5, 6, w * .5, x, g + h + 3, z);
      stacks.cyl(1.6, 2, 36, x + w * .3, g + h + 18, z, 12);
      ctx.add(glow(0xff7a22, w * 1.4, x, g + h * .45, z + w * .52, .8));
    }
    for (let i = 0; i < 13; i++) {
      const z = ctx.z0 + 30 - i * ((ctx.length + 120) / 12);
      const half = Math.max(94, ctx.wx + 60);
      rails.box(half * 2 + 2, 2, 2, ctx.cx, ctx.highY + 50, z).box(2, ctx.highY + 50 - g, 2, ctx.cx - half, g + (ctx.highY + 50 - g) / 2, z).box(2, ctx.highY + 50 - g, 2, ctx.cx + half, g + (ctx.highY + 50 - g) / 2, z);
      for (let k = 0; k < 3; k++) { const lx = ctx.cx + (ctx.rnd() - .5) * 2 * (half - 30); rails.cyl(.12, .12, 8, lx, ctx.highY + 45.5, z, 6); ctx.add(glow(0xfff1dc, 14, lx, ctx.highY + 40, z, .85)); }
    }
    place(belts.mesh(darkMat), ctx);
    place(props.mesh(material(surfaces.factory("crate", { base: [88, 82, 70] }), {})), ctx);
    place(presses.mesh(steelMaterial("press", { base: [200, 140, 40], paint: [208, 146, 40], rust: .1 })), ctx);
    place(ovens.mesh(steelMaterial("oven", { base: [66, 64, 66], rust: .3 })), ctx);
    place(stacks.mesh(darkMat), ctx);
    place(rails.mesh(darkMat), ctx);
    const armMat = steelMaterial("arm", { base: [214, 130, 36], paint: [226, 142, 40], rust: .05 }, { metal: .35, rough: .5 });
    const armObjects = [];
    for (let i = 0; i < 14; i++) {
      const lane = lanes[i % lanes.length], x = ctx.cx + lane * 22 + Math.sign(lane) * ctx.wx * .5 + (i % 2 ? 6 : -6), z = ctx.z0 + 20 - i * ((ctx.length + 100) / 13);
      const group = new THREE.Group();
      group.position.set(x, g + 2.4, z);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 3, 14), darkMat);
      const lower = new THREE.Group();
      lower.position.y = 1.5;
      const l1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 11, 1.8), armMat); l1.position.y = 5.5;
      const upper = new THREE.Group(); upper.position.y = 11;
      const l2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 11), armMat); l2.position.z = -5;
      const claw = new THREE.Mesh(new THREE.BoxGeometry(2.6, .8, 2.6), darkMat); claw.position.set(0, -.8, -10.5);
      upper.add(l2, claw); lower.add(l1, upper); group.add(base, lower);
      group.traverse(o => { o.raycast = () => {}; });
      ctx.add(group);
      armObjects.push({ lower, upper, phase: ctx.rnd() * TAU });
    }
    let clock = 0;
    ctx.tick(dt => {
      clock += dt;
      for (const a of armObjects) { a.lower.rotation.y = Math.sin(clock * .5 + a.phase) * .9; a.upper.rotation.x = -.4 + Math.sin(clock * .8 + a.phase) * .35; }
    });
    particles(ctx, { count: 300, w: 70, h: 40, d: 80, velocity: [.1, 1.4, 0], color: 0xffa050, size: .08, opacity: .8, jitter: .6 });
  }

  // ---- Supports --------------------------------------------------------------------------
  /**
   * Hold the course up. Every static deck gets what its chapter would really use, sized to its
   * span and standing on the ground (or hung from the ceiling, or lifted by thrusters).
   * info = { decks, movers, ramps, groundY, lowY, highY, add, tick, rnd }.
   * Returns { hover } — the decks that sag and float back when walked on.
   */
  function buildSupports(theme, style, info) {
    const { groundY: ground, add } = info;
    const mode = theme.support;
    const hover = [], hoverChunks = [];
    const concrete = new Batch(theme.tile), steel = new Batch(theme.tile);
    const braces = (batch, x0, x1, z, top, bottom) => {
      const span = Math.abs(x1 - x0), h = top - bottom;
      const levels = Math.max(1, Math.floor(h / 16));
      const dy = h / (levels + 1);
      for (let i = 1; i <= levels; i++) {
        const y = bottom + dy * i;
        batch.box(span, .5, .5, (x0 + x1) / 2, y, z);
        const length = Math.hypot(span, dy), angle = Math.atan2(dy, span);
        batch.box(length, .3, .3, (x0 + x1) / 2, y - dy / 2, z, 0, angle).box(length, .3, .3, (x0 + x1) / 2, y - dy / 2, z, 0, -angle);
      }
    };
    const column = (x, z, under) => {
      if (mode === "pier") {
        const h = under - ground;
        concrete.box(1.6, h, 1.6, x, ground + h / 2, z).box(2.8, 1.2, 2.8, x, ground + .6, z).box(2.2, .9, 2.2, x, under - .45, z);
      } else if (mode === "steel") hColumn(steel, x, z, under, ground, 1.2);
      else if (mode === "pipe") {
        steel.cyl(.55, .6, under - ground, x, ground + (under - ground) / 2, z, 12);
        concrete.box(2.4, 1.2, 2.4, x, ground + .6, z);
        steel.cyl(.9, .9, .5, x, under - .25, z, 12);
      }
    };
    const supported = [];
    if (mode === "pier" || mode === "steel" || mode === "pipe") {
      for (const deck of info.decks) {
        if (deck.under - ground < 2) continue;
        const cols = Math.max(1, Math.round(deck.d / 11));
        const xs = deck.w >= 5 ? [deck.x - deck.w / 2 + 1.1, deck.x + deck.w / 2 - 1.1] : [deck.x];
        for (let i = 0; i < cols; i++) {
          const z = deck.z - deck.d / 2 + deck.d * (i + .5) / cols;
          for (const x of xs) column(x, z, deck.under);
          if (xs.length === 2) {
            braces(steel, xs[0], xs[1], z, deck.under - .6, ground + 1);
            (mode === "pier" ? concrete : steel).box(deck.w * .96, .8, 1.8, deck.x, deck.under - .4, z);
          }
        }
        supported.push(deck);
      }
      // Free-form decks: a pair of columns with a cross-beam every ~11 m along the ribbon.
      for (const ribbon of info.ribbons || []) {
        const S = ribbon.samples, stride = Math.max(1, Math.round(11 / .5));
        const count = Math.max(1, Math.round((S.length - 1) / stride));
        for (let k = 0; k < count; k++) {
          const s = S[Math.min(S.length - 1, Math.round((k + .5) * (S.length - 1) / count))];
          const under = s.y - 1.4;
          if (under - ground < 2) continue;
          const offs = ribbon.w >= 5 ? [-(ribbon.w / 2 - 1.1), ribbon.w / 2 - 1.1] : [0];
          const pts = offs.map(o => [s.x + Math.cos(s.th) * o, s.z + Math.sin(s.th) * o]);
          for (const [x, z] of pts) column(x, z, under);
          if (pts.length === 2) {
            const [a, b] = pts, span = Math.hypot(b[0] - a[0], b[1] - a[1]);
            const levels = Math.max(1, Math.floor((under - ground) / 16)), dy = (under - ground - 1.6) / (levels + 1);
            for (let i = 1; i <= levels; i++) {
              const yy = ground + 1 + dy * i;
              steel.beam([a[0], yy, a[1]], [b[0], yy, b[1]], .5);
              steel.beam([a[0], yy - dy, a[1]], [b[0], yy, b[1]], .3).beam([b[0], yy - dy, b[1]], [a[0], yy, a[1]], .3);
            }
            (mode === "pier" ? concrete : steel).beam([a[0], under - .4, a[1]], [b[0], under - .4, b[1]], .9);
            void span;
          }
        }
      }
      for (const ramp of info.ramps) {
        const under = Math.min(ramp.y0, ramp.y1) - .5;
        if (under - ground < 2) continue;
        for (const z of [ramp.z0 - 1, ramp.z1 + 1]) for (const dx of [-1, 1]) column(ramp.x + dx * (ramp.w / 2 - .9), z, under);
      }
      for (const m of info.movers) {
        // Moving decks ride guide rails held up at each end of their travel.
        const kind = m.motion.kind, p0 = [m.x, m.y - .9, m.z];
        let p1 = [m.x + (m.motion.dx || 0), m.y + (m.motion.dy || 0) - .9, m.z - (m.motion.dz || 0)];
        if (kind === "orbit") { steel.beam([m.x - (m.motion.dx || 0), m.y - .9, m.z], [m.x + (m.motion.dx || 0), m.y - .9, m.z], .4); p1 = null; }
        else steel.beam(p0, p1, .45);
        for (const p of p1 ? [p0, p1] : [[m.x - (m.motion.dx || 0), m.y - .9, m.z], [m.x + (m.motion.dx || 0), m.y - .9, m.z]]) {
          if (p[1] - ground > 2) column(p[0], p[2], p[1]);
        }
      }
    } else if (mode === "hanger") {
      const ceilY = info.highY + 64;
      const bounds = info.bounds;
      const cx = bounds ? (bounds.x0 + bounds.x1) / 2 : 0;
      if (info.ribbons && info.ribbons.length) {
        // A ceiling rail follows the course wherever it winds; hangers drop from it to every deck.
        for (const ribbon of info.ribbons) {
          const S = ribbon.samples, step = 16;
          for (let i = 0; i < S.length - 1; i += step) {
            const a = S[i], b = S[Math.min(S.length - 1, i + step)];
            steel.beam([a.x, ceilY, a.z], [b.x, ceilY, b.z], 1.4);
          }
          const count = Math.max(1, Math.round((S.length - 1) / 24));
          for (let k = 0; k < count; k++) {
            const s = S[Math.min(S.length - 1, Math.round((k + .5) * (S.length - 1) / count))];
            const under = s.y - 1.4;
            const offs = ribbon.w >= 5 ? [-(ribbon.w / 2 - .7), ribbon.w / 2 - .7] : [0];
            for (const o of offs) {
              const x = s.x + Math.cos(s.th) * o, z = s.z + Math.sin(s.th) * o;
              steel.box(.28, ceilY - under, .28, x, under + (ceilY - under) / 2, z);
              if (Math.abs(o) > .1) steel.beam([x, ceilY - .4, z], [s.x, ceilY - .4, s.z], .8);
            }
          }
        }
      } else steel.box(1.4, 1.6, info.length + 300, cx, ceilY, info.mid);
      for (const deck of [...info.decks, ...info.movers.map(m => ({ x: m.x, z: m.z, w: m.w, d: m.d, under: m.y - m.h / 2 }))]) {
        const rodZs = Math.max(1, Math.round(deck.d / 12));
        for (let i = 0; i < rodZs; i++) {
          const z = deck.z - deck.d / 2 + deck.d * (i + .5) / rodZs;
          const xs = deck.w >= 5 ? [deck.x - deck.w / 2 + .7, deck.x + deck.w / 2 - .7] : [deck.x];
          for (const x of xs) steel.box(.28, ceilY - deck.under, .28, x, deck.under + (ceilY - deck.under) / 2, z);
          if (Math.abs(deck.x) > 1) steel.box(Math.abs(deck.x), 1, 1, deck.x / 2, ceilY - .4, z);
        }
      }
    } else if (mode === "hover") {
      const pods = new Batch(2), glows = [];
      const targets = [...info.decks.map(d => ({ ...d, mesh: d.mesh })), ...info.movers.map(m => ({ x: m.x, z: m.z, w: m.w, d: m.d, mesh: m.mesh, under: m.y - m.h / 2, thick: m.h, moving: true }))];
      for (const deck of targets) {
        if (!deck.mesh) continue;
        const local = new Batch(2.2), quads = [];
        const nx = Math.max(1, Math.round(deck.w / 7)), nz = Math.max(1, Math.round(deck.d / 8));
        const thick = deck.thick || (deck.top - deck.under);
        for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
          const px = (ix + .5) / nx * deck.w - deck.w / 2, pz = (iz + .5) / nz * deck.d - deck.d / 2, py = -thick / 2 - .5;
          local.cyl(.75, .9, .9, px, py, pz, 16).cyl(.5, .8, .35, px, py - .62, pz, 16);
          const quad = new THREE.PlaneGeometry(2.6, 2.6);
          quad.rotateX(-Math.PI / 2);
          quad.translate(px, py - .95, pz);
          quads.push(quad);
        }
        const podMesh = local.mesh(steelMaterial("pod", { base: [150, 156, 164], rust: 0 }, { metal: .6, rough: .4 }));
        if (podMesh) { podMesh.frustumCulled = true; deck.mesh.add(podMesh); }
        const glowGeometry = mergeGeometries(quads, false);
        quads.forEach(q => q.dispose());
        const glowMesh = new THREE.Mesh(glowGeometry, new THREE.MeshBasicMaterial({ color: 0x7fd0ff, map: glowTexture(), transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
        glowMesh.raycast = () => {};
        deck.mesh.add(glowMesh);
        glows.push(glowMesh);
        if (!deck.moving) hover.push(deck);
      }
      // Free-form decks: thrusters under every drawn chunk, which sags and floats back as one.
      for (const ribbon of info.ribbons || []) {
        const S = ribbon.samples;
        for (const chunk of ribbon.chunks) {
          if (!chunk.boxes || !chunk.boxes.length) continue;
          const local = new Batch(2.2), quads = [];
          const nx = Math.max(1, Math.round(ribbon.w / 7));
          const nz = Math.max(1, Math.round((chunk.to - chunk.from) * .5 / 8));
          for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
            const s = S[Math.min(chunk.to, chunk.from + Math.round((iz + .5) / nz * (chunk.to - chunk.from)))];
            const off = (ix + .5) / nx * ribbon.w - ribbon.w / 2;
            const px = s.x + Math.cos(s.th) * off, pz = s.z + Math.sin(s.th) * off, py = s.y - 1.4 - .5;
            local.cyl(.75, .9, .9, px, py, pz, 16).cyl(.5, .8, .35, px, py - .62, pz, 16);
            const quad = new THREE.PlaneGeometry(2.6, 2.6);
            quad.rotateX(-Math.PI / 2);
            quad.translate(px, py - .95, pz);
            quads.push(quad);
          }
          const podMesh = local.mesh(steelMaterial("pod", { base: [150, 156, 164], rust: 0 }, { metal: .6, rough: .4 }));
          if (podMesh) chunk.mesh.add(podMesh);
          const glowGeometry = mergeGeometries(quads, false);
          quads.forEach(q => q.dispose());
          const glowMesh = new THREE.Mesh(glowGeometry, new THREE.MeshBasicMaterial({ color: 0x7fd0ff, map: glowTexture(), transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
          glowMesh.raycast = () => {};
          glowMesh.frustumCulled = false;
          chunk.mesh.add(glowMesh);
          glows.push(glowMesh);
          let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
          for (const b of chunk.boxes) { minX = Math.min(minX, b.min.x); maxX = Math.max(maxX, b.max.x); minZ = Math.min(minZ, b.min.z); maxZ = Math.max(maxZ, b.max.z); }
          hoverChunks.push({ mesh: chunk.mesh, boxes: chunk.boxes, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2, reach: Math.max(maxX - minX, maxZ - minZ) / 2 });
        }
      }
      let t = 0;
      info.tick(dt => { t += dt; glows.forEach((m, i) => { m.material.opacity = .72 + Math.sin(t * 9 + i) * .12 + Math.random() * .06; }); });
    }
    const supportMaterial = style.role("wall");
    const concreteMesh = concrete.mesh(supportMaterial);
    if (concreteMesh) add(concreteMesh);
    const steelMesh = steel.mesh(style.role("beam"));
    if (steelMesh) add(steelMesh);
    return { hover, hoverChunks };
  }

  // ---- Theme table -----------------------------------------------------------------------
  const THEMES = [
    {
      id: "ashen-city", name: "Ashen City", tile: 3.4, groundDepth: 38, support: "pier", bg: 0x4a4038, fog: 0x4a4038, fogNear: 10, fogFar: 200, camFar: 520,
      light: { ambient: [0xb8a898, .8], hemi: [0xc9b8a2, 0x2c2622, .9], sun: [0xffb487, .75, [-40, 30, -25]], fill: [0x8a96a8, .7] }, lamp: 0xffc388,
      roles: s => ({
        deck: s.concrete("ash-deck", { base: [118, 114, 108], ash: .8, stain: .6, crack: 12 }), room: s.concrete("ash-room", { base: [92, 88, 84], ash: .6, stain: .8, crack: 16 }),
        beam: s.steel("ash-beam", { base: [96, 92, 90], rust: .6 }), exit: s.concrete("ash-exit", { base: [108, 120, 108], ash: .3 }), wall: s.concrete("ash-wall", { base: [98, 94, 90], ash: .75, crack: 14 }),
      }),
      scenery: ashCity,
    },
    {
      id: "foundry", name: "Foundry", tile: 3, groundDepth: 40, support: "steel", bg: 0x2a1a14, fog: 0x2a1a14, fogNear: 8, fogFar: 170, camFar: 480,
      light: { ambient: [0xc08060, .7], hemi: [0xd08a60, 0x1c1210, .8], sun: [0xff8a4a, .8, [30, 35, -30]], fill: [0xff6a2a, .8] }, lamp: 0xff9a50,
      roles: s => ({
        deck: s.grating("foundry-deck", { base: [92, 98, 104] }), room: s.steel("foundry-room", { base: [92, 82, 74], rust: .55 }),
        beam: s.steel("foundry-beam", { base: [112, 104, 98], rust: .4 }), exit: s.steel("foundry-exit", { base: [90, 120, 96], paint: [60, 116, 84] }),
        wall: s.steel("foundry-wall", { base: [104, 78, 62], rust: .8 }),
      }),
      scenery: foundry,
    },
    {
      id: "switchyard", name: "Switchyard", tile: 3.2, groundDepth: 30, support: "steel", bg: 0x1b242e, fog: 0x1b242e, fogNear: 10, fogFar: 210, camFar: 520,
      light: { ambient: [0x92a4b8, .75], hemi: [0xa8bad0, 0x1a2128, .85], sun: [0xcfe2ff, .7, [20, 40, -20]], fill: [0x6f8fb0, .7] }, lamp: 0xdfeaff,
      roles: s => ({
        deck: s.concrete("sw-deck", { base: [104, 106, 108], wet: .7, stain: .6, crack: 8 }), room: s.concrete("sw-room", { base: [84, 88, 92], wet: .9, crack: 10 }),
        beam: s.steel("sw-beam", { base: [116, 122, 126], rust: .15 }), exit: s.steel("sw-exit", { base: [96, 122, 106], paint: [64, 118, 88] }), wall: s.steel("sw-wall", { base: [92, 100, 104], paint: [74, 88, 98] }),
      }),
      scenery: switchyard,
    },
    {
      id: "frozen-dam", name: "Frozen Dam", tile: 3, groundDepth: 46, support: "pier", bg: 0x93a9bc, fog: 0x93a9bc, fogNear: 12, fogFar: 230, camFar: 560,
      light: { ambient: [0xc2d4e6, 1.0], hemi: [0xdce8f4, 0x6a7c8e, 1.1], sun: [0xf2f7ff, 1.0, [30, 50, -20]], fill: [0xa8c4e0, .8] }, lamp: 0xeef6ff,
      roles: s => ({
        deck: s.concrete("dam-deck", { base: [150, 154, 158], wet: .6, ash: .35, stain: .5, crack: 10 }), room: s.concrete("dam-room", { base: [128, 134, 140], wet: .8, crack: 12 }),
        beam: s.steel("dam-beam", { base: [128, 138, 148], rust: .08 }), exit: s.concrete("dam-exit", { base: [124, 150, 134], wet: .4 }), wall: s.concrete("dam-wall", { base: [140, 144, 148], wet: .5, ash: .3, crack: 14 }),
      }),
      scenery: frozenDam,
    },
    {
      id: "orbital-relay", name: "Orbital Relay", tile: 2.6, groundDepth: 200, support: "hover", bg: 0x03050a, fog: 0x03050a, fogNear: 60, fogFar: 900, camFar: 4200,
      light: { ambient: [0x6f8fb8, .45], hemi: [0x9fb8e0, 0x10141c, .5], sun: [0xfff4e0, 2.1, [60, 50, 40]], fill: [0x4a68a0, .5] }, lamp: 0xcfe8ff,
      roles: s => ({
        deck: s.composite("relay-deck"), room: s.composite("relay-room", { base: [188, 194, 200], accent: [220, 140, 60] }),
        beam: s.steel("relay-beam", { base: [170, 176, 184], rust: 0 }), exit: s.composite("relay-exit", { base: [196, 222, 204], accent: [60, 200, 120] }), wall: s.composite("relay-wall", { base: [200, 204, 208], accent: [70, 150, 190] }),
      }),
      scenery: orbitalRelay,
    },
    {
      id: "maze-causeway", name: "Causeway", tile: 3.4, groundDepth: 48, support: "pier", bg: 0x0d191c, fog: 0x0d191c, fogNear: 10, fogFar: 180, camFar: 460,
      light: { ambient: [0x7f9ea0, .7], hemi: [0x8fb4b4, 0x10201f, .85], sun: [0xbfe8e2, .6, [-20, 45, -30]], fill: [0x4fa8a4, .7] }, lamp: 0xffd28a,
      roles: s => ({
        deck: s.asphalt("cw-deck"), room: s.asphalt("cw-room", { base: [50, 52, 56], line: false }), beam: s.steel("cw-beam", { base: [100, 108, 108], rust: .2 }),
        exit: s.concrete("cw-exit", { base: [100, 130, 112], wet: .3 }), wall: s.concrete("cw-wall", { base: [92, 98, 98], wet: .4, crack: 10 }),
      }),
      scenery: mazeBelow,
    },
    {
      id: "missile-silos", name: "Silo Field", tile: 3.2, groundDepth: 36, support: "steel", bg: 0x180e0c, fog: 0x180e0c, fogNear: 8, fogFar: 165, camFar: 460,
      light: { ambient: [0xb08c80, .65], hemi: [0xc09a8a, 0x1a1210, .75], sun: [0xff9a78, .6, [-30, 30, -20]], fill: [0xff3a22, .7] }, lamp: 0xff5a3a,
      roles: s => ({
        deck: s.concrete("silo-deck", { base: [110, 106, 98], stain: .8, crack: 12 }), room: s.steel("silo-room", { base: [88, 94, 90], paint: [78, 98, 78], rust: .3 }),
        beam: s.steel("silo-beam", { base: [100, 100, 96], rust: .4 }), exit: s.concrete("silo-exit", { base: [96, 124, 96], stain: .4 }), wall: s.concrete("silo-wall", { base: [102, 98, 92], stain: .8, crack: 16 }),
      }),
      scenery: missileSilos,
    },
    {
      id: "alien-outpost", name: "Outworks", tile: 3, groundDepth: 26, support: "pipe", bg: 0x6a4030, fog: 0x6a4030, fogNear: 12, fogFar: 200, camFar: 900,
      light: { ambient: [0xd8a888, .8], hemi: [0xe8b898, 0x4a2a1c, .9], sun: [0xffc9a0, 1.2, [-50, 40, -10]], fill: [0xc87850, .6] }, lamp: 0xffd29a,
      roles: s => ({
        deck: s.regolith("out-deck", { base: [168, 98, 66] }), room: s.regolith("out-room", { base: [138, 82, 58] }),
        beam: s.steel("out-beam", { base: [168, 160, 150], rust: .25 }), exit: s.composite("out-exit", { base: [200, 206, 192], accent: [90, 190, 120] }), wall: s.regolith("out-wall", { base: [150, 88, 60] }),
      }),
      scenery: alienOutpost,
    },
    {
      id: "starship-hangar", name: "Interchange", tile: 2.8, groundDepth: 70, support: "hanger", bg: 0x0b121b, fog: 0x0b121b, fogNear: 14, fogFar: 260, camFar: 3600,
      light: { ambient: [0x8aa6c8, .75], hemi: [0xa8c4e4, 0x121a24, .8], sun: [0xcfe6ff, .9, [10, 55, -10]], fill: [0x4a9ed8, .8] }, lamp: 0xbfeaff,
      roles: s => ({
        deck: s.hull("hg-deck", { base: [82, 94, 110] }), room: s.hull("hg-room", { base: [64, 74, 90] }), beam: s.steel("hg-beam", { base: [140, 150, 164] }),
        exit: s.composite("hg-exit", { base: [190, 222, 206], accent: [60, 210, 150] }), wall: s.hull("hg-wall", { base: [92, 104, 120] }),
      }),
      scenery: hangar,
    },
    {
      id: "weapon-factory", name: "Blackline", tile: 3, groundDepth: 34, support: "steel", bg: 0x17120e, fog: 0x17120e, fogNear: 8, fogFar: 170, camFar: 460,
      light: { ambient: [0xa89078, .7], hemi: [0xb89a7c, 0x16100c, .75], sun: [0xffd2a0, .8, [20, 40, -20]], fill: [0xff7a2a, .7] }, lamp: 0xfff1dc,
      roles: s => ({
        deck: s.factory("wf-deck"), room: s.factory("wf-room", { base: [58, 60, 64] }), beam: s.steel("wf-beam", { base: [90, 94, 98], rust: .1 }),
        exit: s.factory("wf-exit", { base: [60, 90, 70] }), wall: s.steel("wf-wall", { base: [78, 82, 88], paint: [60, 64, 70], rust: .1 }),
      }),
      scenery: weaponFactory,
    },
  ];

  // ---- Public API ------------------------------------------------------------------------
  function themeFor(level, chapterSize = 20) {
    return THEMES[Math.min(THEMES.length - 1, Math.floor((level - 1) / chapterSize))];
  }

  /** Materials for a theme: deck, room, beam, exit, wall, kerb, ice, plus tint helpers. */
  function styleFor(theme) {
    if (styleCache.has(theme.id)) return styleCache.get(theme.id);
    const sets = theme.roles(surfaces);
    const base = {};
    for (const [role, set] of Object.entries(sets)) base[role] = material(set, { metal: role === "beam" ? .5 : .15, rough: 1 });
    const tinted = new Map();
    const tint = (role, tone, strength) => {
      if (!tone || strength <= 0) return base[role];
      const key = `${role}:${tone}:${strength.toFixed(2)}`;
      let m = tinted.get(key);
      if (!m) {
        m = base[role].clone();
        m.color = new THREE.Color(0xffffff).lerp(new THREE.Color(tone), strength);
        m.userData.shared = m.userData._cachedShared = true;
        tinted.set(key, m);
      }
      return m;
    };
    const ice = surfaces.ice("slick-" + theme.id);
    const slick = new THREE.MeshPhysicalMaterial({
      map: ice.map, normalMap: ice.normalMap, roughnessMap: ice.roughnessMap, color: 0xdff2fb, roughness: .55, metalness: 0,
      clearcoat: 1, clearcoatRoughness: .06, ior: 1.31, transparent: true, opacity: .92, reflectivity: .6,
    });
    slick.userData.shared = slick.userData._cachedShared = true;
    const style = {
      theme,
      tile: theme.tile,
      slick,
      deck: (tone, mix = .2) => tint("deck", tone, mix * .55),
      role: (name) => base[name] || base.deck,
      wall: (tone) => tint("wall", tone, .06),
      door: base.beam,
      metal: base.beam,
    };
    styleCache.set(theme.id, style);
    return style;
  }

  /**
   * Build a theme's scenery. `bounds` = { z0, z1, lowY, highY }. Returns { objects, ticks, lights }
   * where `add` hands every object to the caller for disposal and `tick(fn)` registers per-frame work.
   */
  function buildScenery(theme, bounds, seed, add, tick) {
    const claimed = [];
    const path = bounds.path || [];
    const bb = bounds.bounds || { x0: -30, x1: 30 };
    const heading = (i) => {
      const a = path[Math.max(0, i - 2)], b = path[Math.min(path.length - 1, i + 2)];
      return Math.atan2(b.x - a.x, -(b.z - a.z));
    };
    // The course itself is the first thing claimed: nothing is ever built on top of it.
    for (let i = 0; i < path.length; i += 6) claimed.push([path[i].x, path[i].z, 12]);
    const cx = (bb.x0 + bb.x1) / 2, wx = Math.max(24, (bb.x1 - bb.x0) / 2);
    const rnd = rngFor(seed * 2654435761 + 17);
    const ctx = {
      path, heading, cx, wx,
      /** A random x anywhere over the course's footprint plus `spread` metres on either side. */
      scatterX: (spread) => cx + (rnd() - .5) * 2 * (wx + spread),
      /** True when a point (x, y, z) is within `r` metres of a deck of the course. */
      nearPath: (x, y, z, r) => {
        for (let i = 0; i < path.length; i += 2) {
          const c = path[i];
          if (Math.abs(c.y - y) > r + 6) continue;
          if (Math.hypot(c.x - x, c.z - z) < r + 9) return true;
        }
        return false;
      },
      /** Reserve a circle on the ground; false if it overlaps something already placed. */
      claim: (x, z, r) => {
        for (const c of claimed) if (Math.hypot(c[0] - x, c[1] - z) < c[2] + r) return false;
        claimed.push([x, z, r]);
        return true;
      },
      THREE, rnd, add, tick,
      z0: bounds.z0, z1: bounds.z1, lowY: bounds.lowY, highY: bounds.highY, groundY: bounds.lowY - theme.groundDepth,
      length: Math.abs(bounds.z1 - bounds.z0), mid: (bounds.z0 + bounds.z1) / 2,
    };
    theme.scenery(ctx);
  }

  return { THEMES, themeFor, styleFor, buildScenery, boxUv, buildSupports: (theme, info) => buildSupports(theme, styleFor(theme), info) };
}
