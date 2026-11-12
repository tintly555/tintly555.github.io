/*
 * The four PVP maps. Each is a themed place with its own buildings, lighting, sky and moving
 * parts, built through a small "kit" so the same code makes the playable map and the walk-through
 * preview on the map-select screen.
 *
 *   crossfire       CINDERWORKS   a working foundry: molten channels, lifts, steam, a pouring ladle
 *   crossfire_grid  HALCYON RING  an orbital station: airlocks, gravity lifts, low-g reactor bay
 *   pvp_ruins       SUNKEN TEMPLE jungle ruins: a stepped pyramid in a moat, a rolling boulder
 *   pvp_town        DUSTFALL      a frontier town split by a railway, with a train on a timetable
 *
 * host = {
 *   scene,                         // objects that need no collision are added here
 *   solid(w, h, d, x, y, z, material) -> Mesh   // collidable in the game, a plain mesh in the preview
 *   light(l),                      // register a light for cleanup
 *   world,                         // createPvpWorld(): movers, zones, ticks
 * }
 *
 * Units are metres; the floor is y = 0 and a standing eye is 1.65 above whatever you stand on.
 * Stairs rise 0.3 per tread (the player auto-steps 0.32).
 */
import { mergeGeometries } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/utils/BufferGeometryUtils.js";
import { createSurfaces, rngFor, fbm } from "./gauntlet-surfaces.js?v=2";
import { createNature } from "./pvp-nature.js?v=24";
import { foundry } from "./pvp-map-foundry.js?v=12";
import { station } from "./pvp-map-station.js?v=10";
import { ruins } from "./pvp-map-ruins.js?v=9";
import { town } from "./pvp-map-town.js?v=11";

const TAU = Math.PI * 2;

export function createPvpMaps(THREE) {
  const surfaces = createSurfaces(THREE);
  const materials = new Map();
  let natureKit = null;
  /** Foliage, water, rocks and sky: built on first use, so maps that need none pay nothing. */
  const nature = () => natureKit || (natureKit = createNature(THREE));

  /** A shared standard material from a procedural surface set (never disposed with a map). */
  function mat(key, set, { color = 0xffffff, rough = 1, metal = 0, emissive = 0, glow = 0, tile = 3, opacity = 1 } = {}) {
    if (materials.has(key)) return materials.get(key);
    const m = new THREE.MeshStandardMaterial({
      map: set ? set.map : null, normalMap: set ? set.normalMap : null, roughnessMap: set ? set.roughnessMap || null : null,
      roughness: rough, metalness: metal, color, emissive, emissiveIntensity: glow,
      transparent: opacity < 1, opacity, depthWrite: opacity >= 1,
    });
    m.userData.shared = m.userData._cachedShared = true;
    m.userData.tile = tile;
    materials.set(key, m);
    return m;
  }
  const plain = (key, color, o = {}) => mat(key, null, { color, ...o });
  const glowing = (key, color, intensity = 2) => mat(key, null, { color: 0x000000, emissive: color, glow: intensity, rough: .5 });

  /** Scale a BoxGeometry's UVs so one texture tile covers `tile` metres on every face. */
  function boxUv(geometry, w, h, d, tile) {
    const uv = geometry.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile);
    }
    uv.needsUpdate = true;
    return geometry;
  }

  /** Merges boxes and cylinders into one mesh per material: scenery that is never collided with. */
  class Batch {
    constructor(tile = 3) { this.parts = []; this.tile = tile; }
    box(w, h, d, x, y, z, ry = 0, rz = 0, rx = 0) {
      const g = boxUv(new THREE.BoxGeometry(w, h, d), w, h, d, this.tile);
      g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1)));
      this.parts.push(g);
      return this;
    }
    cyl(rt, rb, h, x, y, z, seg = 14, rx = 0, rz = 0, ry = 0) {
      const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(rt, rb) * TAU / this.tile, uv.getY(i) * h / this.tile);
      g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(1, 1, 1)));
      this.parts.push(g);
      return this;
    }
    cone(r, h, x, y, z, seg = 7, rz = 0) {
      const g = new THREE.ConeGeometry(r, h, seg, 1);
      g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)), new THREE.Vector3(1, 1, 1)));
      this.parts.push(g);
      return this;
    }
    /** A square beam between two points. */
    beam(a, b, t = .3) {
      const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
      const length = from.distanceTo(to);
      if (length < .01) return this;
      const g = boxUv(new THREE.BoxGeometry(t, t, length), t, t, length, this.tile);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), to.clone().sub(from).normalize());
      g.applyMatrix4(new THREE.Matrix4().compose(from.clone().add(to).multiplyScalar(.5), q, new THREE.Vector3(1, 1, 1)));
      this.parts.push(g);
      return this;
    }
    mesh(material, { shadow = false } = {}) {
      if (!this.parts.length) return null;
      const geometry = mergeGeometries(this.parts.map(p => p.index ? p.toNonIndexed() : p), false);
      this.parts.forEach(p => p.dispose());
      const mesh = new THREE.Mesh(geometry, material);
      mesh.raycast = () => {};
      mesh.castShadow = mesh.receiveShadow = shadow;
      return mesh;
    }
  }

  const glowTex = (() => {
    let tex = null;
    return () => {
      if (tex) return tex;
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d");
      const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.35, "rgba(255,255,255,.4)"); r.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = r; g.fillRect(0, 0, 64, 64);
      tex = new THREE.CanvasTexture(c);
      return tex;
    };
  })();
  /** A soft light sprite (lamps, embers, steam). */
  function sprite(color, size, x, y, z, opacity = .8, additive = true) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: true }));
    s.position.set(x, y, z);
    s.scale.setScalar(size);
    s.raycast = () => {};
    return s;
  }
  function textSign(text, w, h, { fg = "#f5e6c8", bg = "#2a1d12", border = "#c9a15a", font = "bold 64px serif" } = {}) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = Math.round(512 * h / w);
    const g = c.getContext("2d");
    g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(10, 10, c.width - 20, c.height - 20);
    g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, c.width / 2, c.height / 2 + 4, c.width - 50);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide }));
    m.raycast = () => {};
    return m;
  }

  /** Molten metal: a dark crust cracked with orange and yellow, tileable. */
  let lavaMaterial = null;
  function lava() {
    if (lavaMaterial) return lavaMaterial;
    const size = 256, n = fbm(size, 91, 5, 4), m = fbm(size, 17, 3, 3);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d"), img = g.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const v = n[i], hot = Math.max(0, Math.min(1, (0.62 - Math.abs(v - 0.5) * 2.1) * 1.9 + (m[i] - .5) * .5));
      img.data[i * 4] = 40 + hot * 215; img.data[i * 4 + 1] = 12 + hot * hot * 190; img.data[i * 4 + 2] = 6 + hot * hot * hot * 90; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const map = new THREE.CanvasTexture(c);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    lavaMaterial = new THREE.MeshBasicMaterial({ map, color: 0xffffff });
    lavaMaterial.userData.shared = lavaMaterial.userData._cachedShared = true;
    return lavaMaterial;
  }

  /** The construction kit a map builds with. */
  function makeKit(host) {
    const scene = host.scene;
    const kit = {
      THREE, Batch, mat, plain, glowing, surfaces, sprite, textSign, glowTex, lava, nature, rnd: rngFor(7),
      /**
       * A collision box that draws nothing: the visible thing (a tree, a rock, carved stonework) is detailed
       * scenery, this is what bullets, sight lines and feet meet. Base at y.
       */
      proxy(w, h, d, x, y, z) {
        const mesh = host.solid(w, h, d, x, y + h / 2, z, plain("proxy", 0x000000));
        mesh.visible = false; mesh.castShadow = false;
        return mesh;
      },
      /** A ray-only volume for glass that blocks bullets without changing player movement. */
      shotBlocker(w, h, d, x, y, z, rotationY = 0) {
        const material = new THREE.MeshBasicMaterial({
          colorWrite: false, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y + h / 2, z);
        mesh.rotation.y = rotationY;
        mesh.castShadow = false; mesh.receiveShadow = false;
        mesh.userData.glassShotBlocker = true;
        scene.add(mesh);
        host.shotBlocker?.(mesh);
        return mesh;
      },
      /** Register an existing transparent surface (such as a curved cockpit) as bullet blocking. */
      shotSurface(mesh) {
        host.shotBlocker?.(mesh);
        return mesh;
      },
      /**
       * Dressed stone over a solid core: courses of separate blocks, each a little proud of the face or
       * set back, a few missing, so a wall has depth and a broken bond instead of a printed texture.
       * Faces are [-z, +z, -x, +x].
       */
      masonry(batch, rnd, { x0, z0, x1, z1, y0, y1, course = 0.46, len = 1.15, thick = 0.22, faces = [1, 1, 1, 1], gaps = 0.05 }) {
        const rows = Math.max(1, Math.round((y1 - y0) / course)), rh = (y1 - y0) / rows;
        const face = (from, to, fixed, out, alongX) => {
          for (let r = 0; r < rows; r++) {
            let u = from + (r % 2 ? rnd() * len * 0.5 : 0) - (r % 2 ? len * 0.5 : 0);
            while (u < to) {
              const l = len * (0.7 + rnd() * 0.7), a = Math.max(u, from), b = Math.min(u + l, to);
              u += l;
              if (b - a < 0.15 || rnd() < gaps) continue;
              const proud = (rnd() - 0.5) * 0.06, t = thick * (0.8 + rnd() * 0.5);
              const c = fixed + out * (t / 2 + proud - 0.05), m = (a + b) / 2, hh = rh * (0.9 + rnd() * 0.1);
              const yaw = (rnd() - 0.5) * 0.02, tilt = (rnd() - 0.5) * 0.015;
              if (alongX) batch.box(b - a - 0.04, hh, t, m, y0 + r * rh + rh / 2, c, yaw, 0, tilt);
              else batch.box(t, hh, b - a - 0.04, c, y0 + r * rh + rh / 2, m, yaw, tilt, 0);
            }
          }
        };
        if (faces[0]) face(x0, x1, z0, -1, true);
        if (faces[1]) face(x0, x1, z1, 1, true);
        if (faces[2]) face(z0, z1, x0, -1, false);
        if (faces[3]) face(z0, z1, x1, 1, false);
      },
      /** Collidable box with its BASE at y (not its centre). */
      box(w, h, d, x, y, z, material) { return host.solid(w, h, d, x, y + h / 2, z, material); },
      /** Add decoration (no collision). */
      deco(object) { if (object) scene.add(object); return object; },
      batch(tile = 3) { return new Batch(tile); },
      light(l) { host.light(l); return l; },
      /** Four perimeter walls around a square of half-size `half`. */
      perimeter(half, h, material, thick = 1) {
        kit.box(half * 2 + thick * 2, h, thick, 0, 0, -half - thick / 2, material);
        kit.box(half * 2 + thick * 2, h, thick, 0, 0, half + thick / 2, material);
        kit.box(thick, h, half * 2, -half - thick / 2, 0, 0, material);
        kit.box(thick, h, half * 2, half + thick / 2, 0, 0, material);
      },
      /**
       * Treads up from (x, z) heading `dir` ("+x" "-x" "+z" "-z"): `steps` boxes, each `run` deep and
       * `rise` higher than the one before, `w` wide. Returns the top height.
       */
      stairs({ x, z, dir, w, steps, y0 = 0, rise = 0.3, run = 0.55, material, invisible = false }) {
        const sx = dir === "+x" ? 1 : dir === "-x" ? -1 : 0, sz = dir === "+z" ? 1 : dir === "-z" ? -1 : 0;
        for (let i = 0; i < steps; i++) {
          const h = rise * (i + 1);
          const cx = x + sx * (run * i + run / 2), cz = z + sz * (run * i + run / 2);
          const m = kit.box(sx ? run : w, h, sz ? run : w, cx, y0, cz, material);
          if (invisible) { m.visible = false; m.castShadow = false; }
        }
        return y0 + rise * steps;
      },
      /**
       * A straight wall from (x0, z0) to (x1, z1) (axis-aligned, increasing). `holes` cut openings:
       * { at, w, h, sill = 0 } where `at` is the distance from the start, `h` the opening's height above
       * the sill; the wall carries on above and below it. `base` lifts the whole run (an upper storey).
       */
      wallRun(x0, z0, x1, z1, h, thick, material, holes = [], base = 0) {
        const alongX = Math.abs(z1 - z0) < 1e-6;
        const len = alongX ? x1 - x0 : z1 - z0;
        const put = (from, to, y, height) => {
          if (to - from < 0.01 || height < 0.01) return;
          const mid = (from + to) / 2;
          if (alongX) kit.box(to - from, height, thick, x0 + mid, base + y, z0, material);
          else kit.box(thick, height, to - from, x0, base + y, z0 + mid, material);
        };
        let cursor = 0;
        for (const hole of [...holes].sort((a, b) => a.at - b.at)) {
          put(cursor, hole.at, 0, h);
          const sill = hole.sill || 0;
          put(hole.at, hole.at + hole.w, 0, sill);
          put(hole.at, hole.at + hole.w, sill + hole.h, h - sill - hole.h);
          cursor = hole.at + hole.w;
        }
        put(cursor, len, 0, h);
      },
      /**
       * A slope you can walk up: `length` long, `w` wide, rising `h` toward `dir` from its low end at (x, z). The
       * collision is a flight of low invisible treads (each under the 0.32 step-up, so it is walked, never jumped), the
       * look is one smooth wedge of `material`, skirted to the ground.
       */
      ramp({ x, z, dir, length, w, h, material }) {
        const n = Math.max(2, Math.ceil(h / 0.27)), run = length / n, rise = h / n;
        kit.stairs({ x, z, dir, w, steps: n, rise, run, material, invisible: true });
        const dx = dir === "+x" ? 1 : dir === "-x" ? -1 : 0, dz = dir === "+z" ? 1 : dir === "-z" ? -1 : 0;
        const ax = -dz, az = dx, hw = w / 2, lowY = Math.min(0.14, h * 0.5);
        const corner = (u, v, y) => [x + dx * u + ax * v, y, z + dz * u + az * v];
        const A = corner(0, -hw, lowY), B = corner(0, hw, lowY), C = corner(length, -hw, h), D = corner(length, hw, h);
        const g = (c) => [c[0], 0, c[2]];
        const tri = [A, C, B, B, C, D,  A, g(A), C, C, g(A), g(C),  B, D, g(B), D, g(D), g(B),  A, B, g(A), B, g(B), g(A)];
        const pos = new Float32Array(tri.length * 3), uv = new Float32Array(tri.length * 2), tile = (material.userData && material.userData.tile) || 4;
        tri.forEach((c, i) => { pos.set(c, i * 3); uv[i * 2] = (c[0] + c[2]) / tile; uv[i * 2 + 1] = (c[0] * 0.3 + c[2] * 0.7 + c[1]) / tile; });
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.computeVertexNormals();
        const m = material.clone(); m.side = THREE.DoubleSide; m.userData.shared = false; m.userData._cachedShared = false;
        const mesh = new THREE.Mesh(geo, m); mesh.castShadow = mesh.receiveShadow = true; mesh.raycast = () => {};
        scene.add(mesh);
      },
      /** A raised, flat-topped bank of earth `h` high with a slope up each listed side ("E" "W" "N" "S"). */
      mound({ x, z, w, d, h, material, ramps = ["E", "W"], slope = 4 }) {
        kit.box(w, h, d, x, 0, z, material);
        for (const side of ramps) {
          const eastWest = side === "E" || side === "W", rw = (eastWest ? d : w) * 0.7;
          if (side === "E") kit.ramp({ x: x + w / 2 + slope, z, dir: "-x", length: slope, w: rw, h, material });
          if (side === "W") kit.ramp({ x: x - w / 2 - slope, z, dir: "+x", length: slope, w: rw, h, material });
          if (side === "S") kit.ramp({ x, z: z + d / 2 + slope, dir: "-z", length: slope, w: rw, h, material });
          if (side === "N") kit.ramp({ x, z: z - d / 2 - slope, dir: "+z", length: slope, w: rw, h, material });
        }
      },
      /** Run of stairs length in metres. */
      stairLength: (steps, run = 0.55) => steps * run,
      /** A deck at `top` height, `thick` deep, with optional posts under its corners. */
      deck({ x, z, w, d, top, thick = 0.5, material, posts = null }) {
        kit.box(w, thick, d, x, top - thick, z, material);
        if (posts) {
          const t = posts.size || 0.5;
          for (const [px, pz] of posts.at || [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [x + a * (w / 2 - t), z + b * (d / 2 - t)])) {
            kit.box(t, top - thick, t, px, 0, pz, posts.material || material);
          }
        }
      },
    };
    return kit;
  }

  // ====================================================================================
  // The maps
  // ====================================================================================
  const core = { THREE, surfaces, mat, plain, glowing, Batch, sprite, textSign, makeKit, boxUv, glowTex, rngFor, TAU, lava };
  const list = [foundry(core), station(core), ruins(core), town(core)];
  const MAPS = Object.fromEntries(list.map(m => [m.id, m]));
  return {
    list, MAPS, makeKit, boxUv,
    /** Build map `id` through `host` (see the header). Returns what the map says about itself. */
    build(id, host) {
      const def = MAPS[id];
      const kit = makeKit(host);
      def.build(kit, host);
      // A map with a sky look gets a real sky, and the light cut from it for reflections on water, glass and metal.
      const sky = def.env && def.env.sky;
      if (sky) {
        const n = nature();
        const dome = sky.space ? n.space(sky) : n.sky(sky);
        host.scene.add(dome);
        host.world.tick((dt, t, p) => {
          dome.material.uniforms.uTime.value = t % 7200; if (dome.material.uniforms.uCT) dome.material.uniforms.uCT.value = t % 600; n.windTime.value = t % 7200;   // wall-clock seconds are too big for a shader float
          n.wake.update(t, p);
          if (dome.material.uniforms.uTier) dome.material.uniforms.uTier.value = host.tier ? host.tier() : 1;     // clouds: none, layer, raymarched, raymarched with self-shadow
          n.motion.value = host.quality ? host.quality() : 2;     // plants: 0 still, 1 wind, 2 wind and contact
        });
        if (host.renderer && host.environment) host.environment(n.environment(host.renderer, sky), def.env.envIntensity ?? 1);
      }
      return def;
    },
  };
}
