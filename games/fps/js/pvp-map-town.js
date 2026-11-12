/*
 * DUSTFALL — a frontier town on a hot afternoon. A dirt main street runs east–west between two
 * rows of timber buildings; behind the north row lies the railway, and the 12:40 comes through on
 * the dot. Walk onto the tracks when the signals are red and you will not walk off them.
 *
 *   saloon      two floors, a stair inside, a balcony over the street
 *   hotel       two floors, a stair up its back wall
 *   bank        stone, with a vault
 *   sheriff     a jail with cells
 *   church · store · doctor · smithy · stable, a well, a water tower, a windmill
 *
 * The sun is low and hard: boardwalks, awnings and shutters throw real shadows across a rutted dirt
 * street, sandstone buttes stand round the horizon, and the train is a proper steam locomotive.
 *
 * On the shared clock: the train (every 30 s: signals, then 8 s of rolling stock), the windmill,
 * tumbleweeds, the church bell.
 */
export function town(core) {
  const { THREE, surfaces, mat, plain, sprite, textSign, TAU, rngFor } = core;
  const H = 38;

  return {
    id: "pvp_town",
    name: "DUSTFALL",
    tag: "Frontier town · the 12:40 train",
    half: H,
    spawns: [
      [-34, -1], [34, 1], [-22, 0], [22, 0], [0, -1.5], [-14, 21], [14, 21], [-27, 24],
      [27, 24], [-30, -21], [30, -21], [-12, -21.5], [12, -21.5], [0, 22], [-6, 31], [6, 31],
    ],
    env: {
      bg: 0xe3d5b8, fog: 0xe3d5b8, fogNear: 30, fogFar: 260, bright: true,
      hemi: [0xfff0dc, 0x9b7d58, 1.6], sun: [0xffe8bc, 4.6, [-40, 44, 26]], shadow: 60, envIntensity: 0.7,
      sky: { sun: [-40, 44, 26], zenith: 0x3c72bb, horizon: 0xebddbf, ground: 0xb99d72, sunColor: 0xfff0cc, cloud: 0.34 },
      look: { tint: 0xfff0d4, vignette: 0.28, bloom: 0.3, threshold: 1.3, saturation: 1.08 },
    },
    preview: { eye: 1.7, path: [[-36, 2], [-20, 1], [-8, -1], [6, 1], [20, -1], [34, 1], [34, 19], [18, 21], [0, 24], [-18, 21], [-34, 19], [-36, 2]] },

    build(kit, host) {
      const world = host.world;
      const N = kit.nature();
      const rnd = rngFor(55), srnd = rngFor(909);
      const group = new THREE.Group(); kit.deco(group);

      const plank = mat("dt-plank", surfaces.wood("dt-plank", { base: [150, 112, 74], planks: 4, grey: .35 }), { tile: 2.4 });
      const plankRed = mat("dt-plank-r", surfaces.wood("dt-plank-r", { base: [142, 70, 52], planks: 4, grey: .15 }), { tile: 2.4 });
      const plankBlue = mat("dt-plank-b", surfaces.wood("dt-plank-b", { base: [74, 100, 128], planks: 4, grey: .25 }), { tile: 2.4 });
      const plankWhite = mat("dt-white", surfaces.wood("dt-white", { base: [214, 206, 190], planks: 6, grey: .25 }), { tile: 2.4 });
      const woodDark = mat("dt-wood-d", surfaces.wood("dt-wood-d", { base: [92, 64, 42], planks: 3, grey: .1 }), { tile: 2 });
      const shutterMat = mat("dt-shutter", surfaces.wood("dt-shutter", { base: [70, 104, 86], planks: 5, grey: .2 }), { tile: 1.2 });
      const stone = mat("dt-stone", surfaces.stone("dt-stone", { base: [196, 168, 128], moss: 0, blocks: 5 }), { tile: 3 });
      const adobe = mat("dt-adobe", surfaces.concrete("dt-adobe", { base: [214, 170, 120], stain: .5, crack: 12 }), { tile: 3 });
      const shingle = mat("dt-shingle", N.shingles(), { tile: 2.2, rough: .9 });
      const metal = mat("dt-metal", surfaces.steel("dt-metal", { base: [86, 88, 92], rust: .6 }), { metal: .5, rough: .6, tile: 2 });
      const iron = mat("dt-iron", surfaces.steel("dt-iron", { base: [40, 41, 44], rust: .25 }), { metal: .7, rough: .5, tile: 1.5 });
      const brass = mat("dt-brass", null, { color: 0xc59a3e, metal: .9, rough: .3 });
      const strata = mat("dt-strata", N.strata(), { tile: 7, rough: 1 });
      const canvas = plain("dt-canvas", 0xd8cfb4, { rough: 1 });
      const hidden = plain("dt-hidden", 0x000000); hidden.visible = false;
      const awning = (() => {
        const c = document.createElement("canvas"); c.width = 128; c.height = 32;
        const g = c.getContext("2d");
        for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#e9dfc6" : "#a2382c"; g.fillRect(i * 16, 0, 16, 32); }
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
        const m = new THREE.MeshStandardMaterial({ map: t, roughness: 1, side: THREE.DoubleSide });
        m.userData.shared = m.userData._cachedShared = true;
        return m;
      })();

      // ── Ground and street ────────────────────────────────────────────────────────────
      N.ground(group, { size: 300, tile: 5, set: N.dirt(), tint: [1, 0.98, 0.95], seed: 12, contrast: 1.1 });
      {
        const set = N.road({ width: 12 });
        const mapT = N.tiled(set.map, H * 2 / 8, 1), normT = N.tiled(set.normalMap, H * 2 / 8, 1);
        mapT.wrapT = normT.wrapT = THREE.ClampToEdgeWrapping;
        const street = new THREE.Mesh(new THREE.PlaneGeometry(H * 2 + 4, 12), new THREE.MeshStandardMaterial({ map: mapT, normalMap: normT, roughness: 1, transparent: true, depthWrite: false }));
        street.rotation.x = -Math.PI / 2; street.position.set(0, 0.025, 0); street.receiveShadow = true; street.raycast = () => {}; street.renderOrder = 1; group.add(street);
      }
      N.skyline(group, { radius: 235, base: 8, height: 38, color: 0xcdb99b, seed: 5 });
      N.skyline(group, { radius: 170, base: 3, height: 22, color: 0xb59a7a, seed: 11 });

      // ── The canyon: a solid wall round the town, faced in sandstone, with buttes beyond ──
      kit.perimeter(H, 7, strata, 1.6);
      const cliffParts = [];
      const strataUv = (g) => {
        const p = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + p.getZ(i)) / 7, p.getY(i) / 7);
        return g;
      };
      for (let s = 0; s < 4; s++) {
        for (let u = -H - 2; u < H + 2; u += 5.5) {
          const size = 3 + srnd() * 2.2, d = H + size * 1.2, jitter = (srnd() - 0.5) * 2;   // centred in and beyond the wall: only a hand's breadth shows on this side
          const x = s < 2 ? u + jitter : (s === 2 ? -d : d), z = s < 2 ? (s === 0 ? -d : d) : u + jitter;
          if (s >= 2 && Math.abs(z + 30) < size + 3.2) continue;   // keep the railway's tunnel mouths clear
          cliffParts.push(strataUv(N.rock(srnd, strata, { x, y: -size * 0.15, z, size, squash: 1.9 + srnd() * 0.5, detail: 3 })));
        }
      }
      // Talus: fallen blocks along the foot of the wall.
      for (let i = 0; i < 70; i++) {
        const s = (srnd() * 4) | 0, u = (srnd() - 0.5) * 2 * (H - 2), size = 0.25 + srnd() * 0.3, d = H + size * 0.45;
        if (s >= 2 && Math.abs(u + 30) < 4.5) continue;
        cliffParts.push(strataUv(N.rock(srnd, strata, { x: s < 2 ? u : (s === 2 ? -d : d), y: 0, z: s < 2 ? (s === 0 ? -d : d) : u, size, squash: 0.65, detail: 2 })));
      }
      // Buttes standing off in the haze.
      for (let i = 0; i < 26; i++) {
        const a = i / 26 * TAU + srnd() * 0.2, rr = 62 + srnd() * 70, r = 7 + srnd() * 10, h = 16 + srnd() * 32;
        cliffParts.push(N.butte(srnd, { x: Math.cos(a) * rr, z: Math.sin(a) * rr, r, h, top: 0.55 + srnd() * 0.35, flare: 0.5 }));
      }
      // Terrain: sand dunes and rock shelves with slopes up to them, and boulders to fight round.
      {
        const dune = mat("dt-dune", N.dirt({ key: "dirt" }), { tile: 5 });
        kit.mound({ x: -18, z: 29, w: 10, d: 4, h: 1.1, material: dune, ramps: ["N", "E"], slope: 3 });
        kit.mound({ x: 18, z: 29, w: 10, d: 4, h: 1.1, material: dune, ramps: ["N", "W"], slope: 3 });
        kit.mound({ x: -10, z: -24, w: 14, d: 4, h: 1.4, material: strata, ramps: ["W", "E"], slope: 3 });
        kit.mound({ x: 10, z: -24, w: 14, d: 4, h: 1.4, material: strata, ramps: ["W", "E"], slope: 3 });
        for (const [x, z, size] of [[-5, 26.5, 1.4], [4, 24.5, 1.2], [10, 34, 1.5], [-10, 34, 1.3], [-27, 21, 1.2], [26, 20, 1.3]]) {
          cliffParts.push(strataUv(N.rock(srnd, strata, { x, y: 0, z, size, squash: 0.8, detail: 3 })));
          kit.proxy(size * 1.5, size * 1.25, size * 1.5, x, 0, z);
        }
      }
      const cliffMesh = new THREE.Mesh(N.mergeGeometries(cliffParts, false), strata);
      cliffMesh.castShadow = cliffMesh.receiveShadow = true; cliffMesh.raycast = () => {}; kit.deco(cliffMesh);

      // ── Buildings ────────────────────────────────────────────────────────────────────
      const FH = 3.6;
      // Boardwalks (0.2 high) in front of the buildings: props that stand on one are lifted onto it, never half sunk in it.
      const boards = [];
      const lift = (x, z, r = 0.3) => (boards.some((b) => x + r >= b[0] && x - r <= b[1] && z + r >= b[2] && z - r <= b[3]) ? 0.2 : 0);
      const glassPanes = kit.batch(2), windowGlass = N.glass({ tint: 0xd2e8ee, min: 0.09, max: 0.7 }), trim = kit.batch(2), shutters = kit.batch(2), steps = kit.batch(3), roofTrim = kit.batch(2), braces = kit.batch(2);
      const swingDoors = [];
      const addSwingDoor = (cx, cz, y0, width, height, alongX, out) => {
        const leafW = width - 0.08, leafH = height - 0.1, baseYaw = alongX ? 0 : -Math.PI / 2;
        const hingeX = alongX ? cx - leafW / 2 : cx, hingeZ = alongX ? cz : cz - leafW / 2;
        const pivot = new THREE.Group();
        pivot.position.set(hingeX, y0, hingeZ);
        pivot.rotation.y = baseYaw;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.14), woodDark);
        panel.position.set(leafW / 2, leafH / 2, 0);
        panel.castShadow = panel.receiveShadow = true;
        pivot.add(panel);
        for (const side of [-1, 1]) {
          const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), brass);
          knob.position.set(leafW * 0.78, leafH * 0.42, side * 0.09);
          pivot.add(knob);
        }
        kit.deco(pivot);
        const segments = 8, segmentLength = leafW / segments, colliders = [];
        for (let i = 0; i < segments; i++) {
          const distance = (i + 0.5) * segmentLength;
          const angle = baseYaw;
          const bx = hingeX + Math.cos(angle) * distance, bz = hingeZ - Math.sin(angle) * distance;
          const collider = kit.proxy(segmentLength + 0.025, leafH, 0.18, bx, y0, bz);
          collider.userData.wallBox.dyn = true;
          colliders.push(collider);
        }
        swingDoors.push({ cx, cz, y0, width, height, leafW, segmentLength, hingeX, hingeZ, baseYaw, out, alongX, pivot, colliders, angle: 0, openUntil: -Infinity, pushSign: 1 });
      };
      /** An upper floor slab with a rectangular hole (for a stair). */
      const slab = (x0, x1, z0, z1, y, hole, material) => {
        const t = 0.3;
        const put = (a0, a1, b0, b1) => { if (a1 - a0 > 0.05 && b1 - b0 > 0.05) kit.box(a1 - a0, t, b1 - b0, (a0 + a1) / 2, y - t, (b0 + b1) / 2, material); };
        if (!hole) { put(x0, x1, z0, z1); return; }
        put(x0, hole.x0, z0, z1); put(hole.x1, x1, z0, z1);
        put(hole.x0, hole.x1, z0, hole.z0); put(hole.x0, hole.x1, hole.z1, z1);
      };
      /** Frames, shutters and door leaves for every opening of a wall run. `out` is the outward normal (+1/-1) on the wall's perpendicular axis. */
      const dress = (x0, z0, x1, z1, t, holes, base, out) => {
        const alongX = Math.abs(z1 - z0) < 1e-6;
        for (const hole of holes) {
          const mid = hole.at + hole.w / 2, w = hole.w, sill = hole.sill || 0;
          const cx = alongX ? x0 + mid : x0, cz = alongX ? z0 : z0 + mid, y0 = base + sill, y1 = y0 + hole.h, ym = (y0 + y1) / 2;
          const off = out * (t / 2 + 0.07);
          // bw along the wall, bd through it; ox along the wall, oz outward from the face.
          const put = (bw, bh, bd, ox, oy, oz = 0, into = trim) => {
            if (alongX) into.box(bw, bh, bd, cx + ox, oy, cz + off + oz * out); else into.box(bd, bh, bw, cx + off + oz * out, oy, cz + ox);
          };
          const isWindow = sill > 0.3 || hole.h < 2.5;
          put(w + 0.46, 0.22, 0.16, 0, y1 + 0.11);                                                  // lintel board
          put(0.15, hole.h + 0.1, 0.16, -w / 2 - 0.075, ym); put(0.15, hole.h + 0.1, 0.16, w / 2 + 0.075, ym);   // jambs
          if (isWindow) {
            put(w + 0.5, 0.1, 0.34, 0, y0 - 0.04, 0.08);                                            // sill
            // The pane stops bullets and the invisible proxy makes its glass a real barrier to movement.
            put(w, hole.h, 0.04, 0, ym, -(t / 2 + 0.07), glassPanes);
            if (alongX) kit.shotBlocker(w, hole.h, 0.1, cx, y0, cz); else kit.shotBlocker(0.1, hole.h, w, cx, y0, cz);
            if (alongX) kit.proxy(w, hole.h, 0.16, cx, y0, cz); else kit.proxy(0.16, hole.h, w, cx, y0, cz);
            if (alongX) { trim.box(0.06, hole.h, 0.06, cx, ym, cz).box(w, 0.06, 0.06, cx, ym + hole.h * 0.1, cz); }
            else { trim.box(0.06, hole.h, 0.06, cx, ym, cz).box(0.06, 0.06, w, cx, ym + hole.h * 0.1, cz); }
            if (w < 2.4) {
              // Shutters folded open against the wall (about 70 degrees from closed).
              const leaf = w / 2 - 0.02, psi = 1.2, nOff = out * (t / 2 + 0.06);
              for (const sd of [-1, 1]) {
                const dA = -sd * Math.cos(psi), dN = out * Math.sin(psi);                          // leaf direction: along the wall, outward
                const ma = sd * (w / 2 + 0.15) + dA * leaf / 2, mn = nOff + dN * leaf / 2;
                if (alongX) shutters.box(leaf, hole.h - 0.06, 0.1, cx + ma, ym, cz + mn, Math.atan2(-dN, dA));
                else shutters.box(leaf, hole.h - 0.06, 0.1, cx + mn, ym, cz + ma, Math.atan2(-dA, dN));
              }
            }
          } else {
            // A worn threshold and a hinged leaf that swings away when the player pushes through.
            put(w + 0.5, 0.12, 0.5, 0, 0.06, 0.2, steps);
            if (w < 2.6) addSwingDoor(cx, cz, y0, w, hole.h, alongX, out);
          }
        }
      };
      /**
       * A timber building. `front` is "s" (the street lies to its south, front wall on z1) or "n".
       * `windows` per floor; `door` is the ground-floor door's centre as a fraction along the front.
       */
      const building = ({ x0, x1, z0, z1, front, floors = 1, wall = plank, label = "", labelColor, door = 0.5, openFront = false, tall = 0, balcony = false, stair = null, roofMaterial = shingle, backDoor = null }) => {
        const w = x1 - x0, d = z1 - z0, t = 0.45;
        const frontZ = front === "s" ? z1 : z0, backZ = front === "s" ? z0 : z1;
        const frontOut = front === "s" ? 1 : -1;
        const winHoles = (len, n, sill, h, skip = []) => {
          const out = [];
          for (let i = 0; i < n; i++) {
            const c = len * (i + 0.5) / n;
            if (skip.some(([a, b]) => c > a - 1.2 && c < b + 1.2)) continue;
            out.push({ at: c - 0.8, w: 1.6, h, sill });
          }
          return out;
        };
        const doorW = 2.2, doorAt = w * door - doorW / 2;
        const fh = FH + tall;
        for (let f = 0; f < floors; f++) {
          const base = f * FH;
          const holesFront = f === 0
            ? (openFront ? [{ at: 1.2, w: w - 2.4, h: 2.9 }] : [{ at: doorAt, w: doorW, h: 2.9 }, ...winHoles(w, Math.max(2, Math.round(w / 4)), 1.0, 1.4, [[doorAt, doorAt + doorW]])])
            : [...winHoles(w, Math.max(2, Math.round(w / 4)), 0.9, 1.5, balcony ? [[w * 0.5, w * 0.5]] : []), ...(balcony ? [{ at: w * 0.5 - 1.1, w: 2.2, h: 2.7 }] : [])].sort((a, b) => a.at - b.at);
          const hh = f === floors - 1 ? fh : FH;
          kit.wallRun(x0, frontZ, x1, frontZ, hh, t, wall, holesFront, base);
          if (!openFront || f > 0) dress(x0, frontZ, x1, frontZ, t, holesFront, base, frontOut);
          const backHoles = winHoles(w, Math.max(2, Math.round(w / 5)), 1.1, 1.3, backDoor && f === backDoor.floor ? [[backDoor.at, backDoor.at]] : []);
          if (backDoor && f === backDoor.floor) backHoles.push({ at: backDoor.at - 1.1, w: 2.2, h: 2.7 });
          backHoles.sort((a, b) => a.at - b.at);
          kit.wallRun(x0, backZ, x1, backZ, hh, t, wall, backHoles, base);
          dress(x0, backZ, x1, backZ, t, backHoles, base, -frontOut);
          const sideHoles = winHoles(d, Math.max(1, Math.round(d / 5)), 1.1, 1.3);
          kit.wallRun(x0, z0, x0, z1, hh, t, wall, sideHoles, base);
          kit.wallRun(x1, z0, x1, z1, hh, t, wall, sideHoles, base);
          dress(x0, z0, x0, z1, t, sideHoles, base, -1); dress(x1, z0, x1, z1, t, sideHoles, base, 1);
        }
        const top = (floors - 1) * FH + fh;
        kit.box(w + 0.9, 0.35, d + 0.9, (x0 + x1) / 2, top, (z0 + z1) / 2, roofMaterial);
        // Roof edge board, a chimney, and the boardwalk out front (a step up from the street).
        roofTrim.box(w + 1.0, 0.18, 0.14, (x0 + x1) / 2, top + 0.4, z0 - 0.45).box(w + 1.0, 0.18, 0.14, (x0 + x1) / 2, top + 0.4, z1 + 0.45);
        roofTrim.box(0.14, 0.18, d + 1.0, x0 - 0.45, top + 0.4, (z0 + z1) / 2).box(0.14, 0.18, d + 1.0, x1 + 0.45, top + 0.4, (z0 + z1) / 2);
        roofTrim.box(0.9, 1.6, 0.9, x0 + w * 0.2, top + 1.1, (z0 + z1) / 2 + (front === "s" ? -d * 0.15 : d * 0.15));
        kit.box(w + 0.8, 0.2, 2.3, (x0 + x1) / 2, 0, frontZ + frontOut * 1.3, plank);
        boards.push([x0 - 0.4, x1 + 0.4, frontZ + frontOut * 1.3 - 1.15, frontZ + frontOut * 1.3 + 1.15]);
        if (floors > 1) slab(x0, x1, z0, z1, FH, stair ? stair.hole : null, plank);
        // False front above the roof line, a sign, an awning.
        const dec = kit.batch(2);
        dec.box(w + 0.5, 1.8, 0.4, (x0 + x1) / 2, top + 1.2, frontZ + frontOut * 0.5);
        dec.box(w + 0.7, 0.22, 0.55, (x0 + x1) / 2, top + 2.2, frontZ + frontOut * 0.5);   // cornice
        kit.deco(dec.mesh(wall, { shadow: true }));
        if (label) {
          const sg = textSign(label, Math.min(6, w - 1), 0.9, { fg: labelColor || "#f3dfb2", bg: "#3b2616", border: "#b98a45", font: "bold 58px serif" });
          sg.position.set((x0 + x1) / 2, top + 1.25, frontZ + frontOut * 0.75);
          if (front !== "s") sg.rotation.y = Math.PI;
          kit.deco(sg);
        }
        if (!openFront && floors === 1) {
          const aw = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 0.07, 2.0), awning);
          aw.position.set((x0 + x1) / 2, 3.2, frontZ + frontOut * 1.2); aw.rotation.x = frontOut * 0.2; aw.castShadow = aw.receiveShadow = true; aw.raycast = () => {}; kit.deco(aw);
          for (const sx of [x0 + 0.6, x1 - 0.6]) braces.beam([sx, 2.5, frontZ + frontOut * 0.3], [sx, 3.3, frontZ + frontOut * 2.0], 0.1).box(0.1, 0.1, 1.9, sx, 3.4, frontZ + frontOut * 1.0);
        }
        return { top, frontZ, backZ };
      };

      // North row (fronts face the street, +z).
      building({ x0: -34, x1: -25, z0: -17, z1: -7, front: "s", wall: plankBlue, label: "SHERIFF", door: 0.62 });
      kit.wallRun(-34, -12, -28, -12, 3.2, 0.2, iron, [{ at: 1.2, w: 1.0, h: 2.2 }]);
      kit.box(0.2, 3.2, 3.2, -31, 0, -14.4, iron);
      kit.box(2.4, 0.5, 1.0, -32.5, 0, -16.2, woodDark); kit.box(2.4, 1.0, 1.2, -27.5, 0, -9.5, woodDark);
      building({ x0: -23, x1: -12, z0: -17, z1: -7, front: "s", wall: plankRed, label: "GENERAL STORE", door: 0.3 });
      kit.box(1.0, 2.0, 7, -22, 0, -12, woodDark); kit.box(1.0, 2.0, 5.5, -13, 0, -11.5, woodDark); kit.box(5, 1.1, 1.2, -17, 0, -10.2, woodDark);
      kit.box(1.2, 1.2, 1.2, -19.5, 0, -14, plank); kit.box(1.2, 2.4, 1.2, -18.2, 0, -14.4, plank);
      {
        const sx0 = -9, sx1 = 9, sz0 = -17, sz1 = -7;
        const stairHole = { x0: sx0 + 0.8, x1: sx0 + 0.8 + 6.7, z0: sz0 + 0.8, z1: sz0 + 0.8 + 2.7 };
        building({ x0: sx0, x1: sx1, z0: sz0, z1: sz1, front: "s", floors: 2, wall: plankRed, label: "SALOON", door: 0.5, balcony: true, stair: { hole: stairHole } });
        kit.stairs({ x: sx0 + 0.8, z: sz0 + 2.1, dir: "+x", w: 2.5, steps: 12, material: woodDark });
        kit.box(7, 1.1, 1.0, 3.5, 0, -12.2, woodDark); kit.box(1.0, 1.1, 3.4, 0.2, 0, -10.5, woodDark);
        for (const [x, z] of [[-4, -10], [-1, -9], [5, -9.2], [-5.5, -13.5]]) { kit.box(1.4, 0.9, 1.4, x, 0, z, woodDark); }
        kit.box(1.8, 1.4, 0.8, -7.8, 0, -9, woodDark);
        kit.box(3, 1.0, 0.8, -1, FH, -16.2, woodDark); kit.box(2.2, 0.6, 1.2, 6, FH, -14.5, woodDark); kit.box(2.2, 0.6, 1.2, 3, FH, -14.5, woodDark);
        // Balcony over the street, with turned balusters.
        kit.box(16, 0.3, 3.2, 0, FH - 0.3, sz1 + 1.6, plank);
        kit.box(16, 1.0, 0.14, 0, FH, sz1 + 3.1, woodDark); kit.box(0.14, 1.0, 3.0, -8, FH, sz1 + 1.5, woodDark); kit.box(0.14, 1.0, 3.0, 8, FH, sz1 + 1.5, woodDark);
        for (const px of [-7.5, 7.5]) kit.box(0.4, FH - 0.3, 0.4, px, 0, sz1 + 3.0, woodDark);
        const bal = kit.batch(2);
        for (let x = -7.8; x <= 7.8; x += 0.4) bal.cyl(0.04, 0.04, 0.9, x, FH + 0.45, sz1 + 3.1, 6);
        kit.deco(bal.mesh(woodDark, { shadow: true }));
        // Swinging doors: louvred half-doors.
        const doors = [-1, 1].map((s) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.14), woodDark); m.position.set(s * 0.55, 1.4, sz1 + 0.25); m.raycast = () => {}; kit.deco(m); return m; });
        world.tick((dt, t) => { doors.forEach((m, i) => { m.rotation.y = Math.sin(t * 1.3 + i) * 0.06; }); });
      }
      building({ x0: 11, x1: 21, z0: -17, z1: -7, front: "s", wall: stone, label: "BANK", door: 0.35, roofMaterial: stone });
      kit.wallRun(11, -13, 18, -13, 3.4, 0.5, stone, [{ at: 1.5, w: 2.2, h: 2.8 }]);
      kit.wallRun(18, -17, 18, -13, 3.4, 0.5, stone, []);
      kit.box(0.6, 2.4, 1.6, 17.8, 0, -14.6, iron);
      kit.box(1.8, 1.1, 1.0, 13, 0, -9.5, woodDark); kit.box(1.0, 1.0, 1.0, 19.8, 0, -16, iron); kit.box(1.0, 1.0, 1.0, 19.8, 1.0, -16, iron);
      {
        const hx0 = 23, hx1 = 35, hz0 = -17, hz1 = -7;
        building({ x0: hx0, x1: hx1, z0: hz0, z1: hz1, front: "s", floors: 2, wall: plankBlue, label: "HOTEL", door: 0.35, balcony: false, backDoor: { floor: 1, at: 10.2 } });
        kit.stairs({ x: hx0 + 0.8, z: hz0 - 1.4, dir: "+x", w: 2.2, steps: 12, material: woodDark });
        kit.box(5.6, 0.3, 3.0, hx0 + 0.8 + 6.6 + 2.8, FH - 0.3, hz0 - 1.4, plank);
        kit.box(5.6, 1.0, 0.14, hx0 + 0.8 + 6.6 + 2.8, FH, hz0 - 2.8, woodDark);
        for (const px of [hx0 + 0.8 + 6.6 + 5.2]) kit.box(0.4, FH - 0.3, 0.4, px, 0, hz0 - 2.7, woodDark);
        kit.box(1.4, 0.9, 2.2, 26, 0, -13, woodDark); kit.box(1.4, 0.9, 2.2, 31, 0, -11.5, woodDark);
        kit.box(1.4, 0.6, 2.2, 26, FH, -13, woodDark); kit.box(1.4, 0.6, 2.2, 31, FH, -11.5, woodDark);
      }

      // South row (fronts face north, -z).
      {
        building({ x0: -34, x1: -23, z0: 7, z1: 17, front: "n", wall: woodDark, label: "STABLE", openFront: true });
        for (const x of [-30.5, -27, -24.5]) kit.box(0.2, 1.8, 3.2, x, 0, 9, woodDark);
        kit.box(2.4, 1.0, 1.0, -31, 0, 14.6, woodDark); kit.box(1.0, 1.0, 1.0, -25, 0, 15, plank);
        // Straw bales: strapped blocks with a straw grain.
        const straw = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#b89a4a"; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${150 + srnd() * 80 | 0},${120 + srnd() * 70 | 0},${40 + srnd() * 30 | 0},.8)`; g.beginPath(); const x = srnd() * 64, y = srnd() * 64; g.moveTo(x, y); g.lineTo(x + 8 + srnd() * 14, y + (srnd() - 0.5) * 3); g.stroke(); } g.fillStyle = "rgba(60,40,20,.7)"; g.fillRect(0, 20, 64, 2); g.fillRect(0, 42, 64, 2); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; const m = new THREE.MeshStandardMaterial({ map: t, roughness: 1 }); m.userData.shared = m.userData._cachedShared = true; return m; })();
        const hay = kit.batch(1); hay.box(1.4, 1.0, 1.4, -28, 0.5, 15).box(1.4, 1.0, 1.4, -26.4, 0.5, 15.2).box(1.4, 1.0, 1.4, -27.2, 1.5, 15.1);
        kit.deco(hay.mesh(straw, { shadow: true }));
      }
      {
        building({ x0: -19, x1: -9, z0: 7, z1: 17, front: "n", wall: stone, label: "SMITHY", openFront: true, roofMaterial: metal });
        // The forge: a stone hearth with a sooted hood and chimney over a bed of coals and a small live fire; a bellows
        // beside it, and an anvil on its own stump of a block by the bench.
        kit.box(2.2, 1.1, 1.6, -17, 0, 15, stone);                      // the hearth (solid)
        kit.box(1.4, 0.9, 0.8, -12, 0, 12, woodDark);                  // work bench
        kit.box(1.0, 1.4, 1.0, -10.4, 0, 15, woodDark);                // quench barrel
        const hearth = kit.batch(2);
        hearth.box(2.2, 0.22, 0.2, -17, 1.21, 14.3).box(2.2, 0.22, 0.2, -17, 1.21, 15.7).box(0.2, 0.22, 1.2, -18.0, 1.21, 15).box(0.2, 0.22, 1.2, -16.0, 1.21, 15);   // the hearth's rim
        hearth.box(2.0, 1.8, 0.35, -17, 2.0, 15.65);                   // back plate up the wall
        kit.deco(hearth.mesh(stone, { shadow: true }));
        const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.35, 1.2, 4, 1, true), stone); hood.rotation.y = Math.PI / 4; hood.scale.set(1.0, 1, 0.75); hood.position.set(-17, 3.05, 15.1); hood.castShadow = true; hood.raycast = () => {};
        hood.material = hood.material.clone(); hood.material.side = THREE.DoubleSide; kit.deco(hood);
        const stack = kit.batch(2); stack.box(0.8, 2.6, 0.7, -17, 4.9, 15.1);
        kit.deco(stack.mesh(stone, { shadow: true }));
        const coals = new THREE.Group(); kit.deco(coals);
        N.molten(coals, world, new THREE.CircleGeometry(0.5, 18), { x: -17, y: 1.13, z: 15, scale: 3.4, intensity: 1.1, flow: [0.01, 0.01] });
        const fl = new THREE.PointLight(0xff8a40, 20, 12, 2); fl.position.set(-17, 1.9, 14.2); kit.light(fl);
        N.fire(coals, world, { x: -17, y: 1.16, z: 15, width: 0.7, height: 0.8, light: fl, lightBase: 19, sparks: 4 });
        // The anvil: foot, waist, a hard flat face and a horn.
        const anvil = kit.batch(2); anvil.box(0.55, 0.16, 0.4, -12, 1.0, 12).box(0.3, 0.22, 0.26, -12, 1.2, 12).box(0.95, 0.18, 0.34, -12, 1.4, 12);
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 10), iron); horn.rotation.z = Math.PI / 2; horn.position.set(-11.3, 1.4, 12); horn.castShadow = true; horn.raycast = () => {}; kit.deco(horn);
        kit.deco(anvil.mesh(iron, { shadow: true }));
      }
      {
        const cx0 = -4, cx1 = 9, cz0 = 7, cz1 = 18;
        building({ x0: cx0, x1: cx1, z0: cz0, z1: cz1, front: "n", wall: plankWhite, label: "CHURCH", door: 0.5, tall: 2.6 });
        for (let i = 0; i < 4; i++) { kit.box(3.4, 0.5, 0.7, cx0 + 2.8, 0, 11 + i * 1.5, woodDark); kit.box(3.4, 0.5, 0.7, cx1 - 2.8, 0, 11 + i * 1.5, woodDark); }
        kit.box(3, 1.2, 1.0, (cx0 + cx1) / 2, 0, cz1 - 1.4, stone);
        const tower = kit.batch(3), mx = (cx0 + cx1) / 2;
        tower.box(3.2, 5, 3.2, mx, 8.8, cz0 + 1.5).box(3.5, 0.3, 3.5, mx, 11.4, cz0 + 1.5).box(3.5, 0.3, 3.5, mx, 6.3, cz0 + 1.5);
        for (const [dx, dz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) tower.box(0.25, 3.0, 0.25, mx + dx, 9.6, cz0 + 1.5 + dz);
        kit.deco(tower.mesh(plankWhite, { shadow: true }));
        const spire = new THREE.Mesh(new THREE.ConeGeometry(2.5, 4.2, 4), shingle); spire.position.set(mx, 13.75, cz0 + 1.5); spire.rotation.y = Math.PI / 4; spire.castShadow = true; spire.raycast = () => {}; kit.deco(spire);
        const cross = kit.batch(2); cross.box(0.14, 1.4, 0.14, mx, 16.6, cz0 + 1.5).box(0.8, 0.14, 0.14, mx, 16.9, cz0 + 1.5);
        kit.deco(cross.mesh(plankWhite));
        const bell = new THREE.Mesh(new THREE.LatheGeometry([[0.08, 0.5], [0.25, 0.45], [0.33, 0.2], [0.52, -0.2], [0.58, -0.32], [0.5, -0.34], [0.001, -0.3]].map(([r, y]) => new THREE.Vector2(r, y)), 14), brass);
        bell.position.set(mx, 10.2, cz0 + 1.5); bell.castShadow = true; bell.raycast = () => {}; kit.deco(bell);
        world.tick((dt, t) => { const c = t % 30; bell.rotation.z = c < 3 ? Math.sin(c * 9) * 0.5 * (1 - c / 3) : 0; });
      }
      building({ x0: 13, x1: 23, z0: 7, z1: 17, front: "n", wall: adobe, label: "DOCTOR", door: 0.4 });
      kit.box(2.2, 0.8, 1.0, 21, 0, 15.6, woodDark); kit.box(1.8, 0.5, 0.9, 15.5, 0, 15.5, plank); kit.box(1.0, 1.9, 1.0, 14, 0, 9.5, woodDark);

      // Dustfall doors swing on the shared map clock and collide as short oriented slabs.
      // The leaf opens before the player reaches it, then eases back shut after they pass.
      world.tick((dt, t, p) => {
        const people = world.players?.() || (p ? [p] : []);
        for (const door of swingDoors) {
          let target = 0;
          const actor = people.map(person => {
            const dx = person.x - door.cx, dz = person.z - door.cz;
            const planeDistance = door.alongX ? Math.abs(dz) : Math.abs(dx);
            const alongDistance = door.alongX ? Math.abs(dx) : Math.abs(dz);
            const feet = person.feet ?? 0;
            const withinReach = planeDistance < 3 && alongDistance < door.width / 2 + 1.25
              && feet < door.y0 + door.height + 0.35 && feet + 1.9 > door.y0;
            return { person, dx, dz, withinReach, distance: planeDistance * planeDistance + alongDistance * alongDistance };
          }).filter(item => item.withinReach).sort((a, b) => a.distance - b.distance)[0];
          if (actor) {
            door.openUntil = t + 1.2;
            const signedSide = door.alongX ? actor.dz : actor.dx;
            const side = Math.sign(signedSide) || door.out;
            door.pushSign = side * door.out * (door.alongX ? 1 : -1);
          }
          if (actor || t < door.openUntil) target = door.pushSign * 1.36;
          door.angle += THREE.MathUtils.clamp(target - door.angle, -dt * 5.2, dt * 5.2);
          const yaw = door.baseYaw + door.angle;
          door.pivot.rotation.y = yaw;
          for (let i = 0; i < door.colliders.length; i++) {
            const collider = door.colliders[i], distance = (i + 0.5) * door.segmentLength;
            collider.position.set(door.hingeX + Math.cos(yaw) * distance, door.y0 + door.height / 2, door.hingeZ - Math.sin(yaw) * distance);
            collider.rotation.y = yaw;
            collider.updateMatrixWorld(true);
            collider.userData.wallBox.setFromObject(collider);
          }
        }
      });

      // Apply the merged dressing batches.
      { const gm = glassPanes.mesh(windowGlass); if (gm) { gm.renderOrder = 4; kit.deco(gm); } }
      kit.deco(trim.mesh(plankWhite, { shadow: true })); kit.deco(shutters.mesh(shutterMat, { shadow: true })); kit.deco(steps.mesh(stone, { shadow: true }));
      kit.deco(roofTrim.mesh(woodDark, { shadow: true })); kit.deco(braces.mesh(woodDark, { shadow: true }));

      // ── The plaza: well, water tower, windmill, wagons ───────────────────────────────
      const lathe = (pts, material, x, y, z, seg = 18) => {
        const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), material);
        m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; m.raycast = () => {}; kit.deco(m); return m;
      };
      {
        // Well in the street: a round stone curb, a frame, a roof and a bucket on a rope.
        kit.box(2.6, 1.1, 2.6, 2, 0, -0.5, hidden);
        const stoneDS = stone.clone(); stoneDS.side = THREE.DoubleSide;
        const curb = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.34, 1.1, 28, 1, true), stoneDS); curb.position.set(2, 0.55, -0.5); curb.castShadow = curb.receiveShadow = true; curb.raycast = () => {}; kit.deco(curb);
        const lip = new THREE.Mesh(new THREE.RingGeometry(1.02, 1.36, 28), stoneDS); lip.rotation.x = -Math.PI / 2; lip.position.set(2, 1.1, -0.5); lip.receiveShadow = true; lip.raycast = () => {}; kit.deco(lip);
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 1.0, 28, 1, true), stoneDS); inner.position.set(2, 0.6, -0.5); inner.raycast = () => {}; kit.deco(inner);
        const pool = new THREE.Mesh(new THREE.CircleGeometry(1.02, 28), plain("dt-well-water", 0x16242a, { rough: .08, metal: .3 })); pool.rotation.x = -Math.PI / 2; pool.position.set(2, 0.25, -0.5); pool.raycast = () => {}; kit.deco(pool);
        const frame = kit.batch(2); frame.box(0.2, 2.8, 0.2, 0.9, 1.4, -0.5).box(0.2, 2.8, 0.2, 3.1, 1.4, -0.5).box(2.4, 0.2, 0.2, 2, 2.8, -0.5);
        frame.box(2.8, 0.1, 1.6, 2, 3.2, -0.5, 0, 0.28).box(2.8, 0.1, 1.6, 2, 3.2, -0.5, 0, -0.28);
        kit.deco(frame.mesh(woodDark, { shadow: true }));
        const rope = kit.batch(1); rope.cyl(0.02, 0.02, 1.6, 2, 2.0, -0.5, 5); rope.cyl(0.24, 0.2, 0.34, 2, 1.1, -0.5, 10);
        kit.deco(rope.mesh(woodDark));
        // Water tower on four legs; the legs block, the tank is scenery: staves, iron hoops and a shingled cap.
        const wx = 30.5, wz = 13;
        for (const [px, pz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) kit.box(0.5, 8.5, 0.5, wx + px, 0, wz + pz, woodDark);
        const braceB = kit.batch(2);
        for (const y of [2.5, 5.5]) for (const [a, b] of [[[-1.6, -1.6], [1.6, -1.6]], [[1.6, -1.6], [1.6, 1.6]], [[1.6, 1.6], [-1.6, 1.6]], [[-1.6, 1.6], [-1.6, -1.6]]]) braceB.beam([wx + a[0], y, wz + a[1]], [wx + b[0], y + 3, wz + b[1]], 0.14).beam([wx + a[0], y + 3, wz + a[1]], [wx + b[0], y, wz + b[1]], 0.14);
        kit.deco(braceB.mesh(woodDark, { shadow: true }));
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 3.8, 28, 1), woodDark); tank.position.set(wx, 10.4, wz); tank.castShadow = tank.receiveShadow = true; tank.raycast = () => {}; kit.deco(tank);
        const hoops = kit.batch(1); for (const y of [9.0, 10.0, 10.9, 11.8]) hoops.cyl(2.64, 2.64, 0.12, wx, y, wz, 28);
        kit.deco(hoops.mesh(iron, { shadow: true }));
        const cap = new THREE.Mesh(new THREE.ConeGeometry(2.9, 1.6, 28), shingle); cap.position.set(wx, 13.1, wz); cap.castShadow = true; cap.raycast = () => {}; kit.deco(cap);
        const spout = kit.batch(2); spout.cyl(0.16, 0.16, 5.5, wx + 3.1, 8.2, wz, 8).box(1.5, 0.3, 0.3, wx + 2.4, 9.4, wz).cyl(0.32, 0.32, 0.4, wx + 3.1, 5.2, wz, 8);
        kit.deco(spout.mesh(iron, { shadow: true }));
        kit.box(1.4, 0.9, 1.4, wx + 4, 0, wz + 1, plank);
        // Windmill: a lattice tower, a wheel of slats on a tail vane, and the pump rod below.
        const mx = -29, mz = 27;
        kit.box(2.4, 1.2, 2.4, mx, 0, mz, woodDark);
        const lat = kit.batch(2);
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) lat.beam([mx + dx * 0.9, 1.2, mz + dz * 0.9], [mx + dx * 0.4, 10.2, mz + dz * 0.4], 0.14);
        for (let y = 2.0; y < 10; y += 1.8) { const k = 0.9 - (y - 1.2) / 9 * 0.5; for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) lat.beam([mx + a[0] * k, y, mz + a[1] * k], [mx + b[0] * (k - 0.1), y + 1.8, mz + b[1] * (k - 0.1)], 0.07); }
        kit.deco(lat.mesh(metal, { shadow: true }));
        const head = new THREE.Group(); head.position.set(mx, 10.4, mz);
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.6), iron); head.add(body);
        const vane = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 2.6), metal); vane.position.set(0, 0.2, -2.2); head.add(vane);
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.4), metal); tail.position.set(0, 0, -1.4); head.add(tail);
        const wheel = new THREE.Group(); wheel.position.set(0, 0, 1.0);
        const wheelB = kit.batch(2);
        for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; wheelB.box(0.5, 1.7, 0.03, Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0, 0, a + Math.PI / 2 + 0.4); }
        wheelB.cyl(0.25, 0.25, 0.3, 0, 0, 0, 10, Math.PI / 2, 0, 0);
        for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; wheelB.beam([0, 0, 0], [Math.cos(a) * 2.3, Math.sin(a) * 2.3, 0], 0.05); }
        const rimMesh = wheelB.mesh(metal, { shadow: true }); if (rimMesh) wheel.add(rimMesh);
        head.add(wheel); head.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.raycast = () => {}; } }); kit.deco(head);
        world.tick((dt, t) => { wheel.rotation.z = t * 0.8; head.rotation.y = Math.sin(t * 0.07) * 0.35; });
        const pump = kit.batch(1); pump.cyl(0.05, 0.05, 6, mx, 4.2, mz, 6).box(1.0, 0.6, 0.6, mx + 1.2, 0.5, mz).cyl(0.35, 0.35, 0.9, mx + 1.3, 0.45, mz + 1.4, 10);
        kit.deco(pump.mesh(iron, { shadow: true }));
        // Wagons with spoked wheels, hoops and canvas covers; barrels, crates, hitching rails: cover.
        const wheelGeo = (() => {
          const parts = [];
          const rim = new THREE.TorusGeometry(0.66, 0.06, 6, 20); rim.rotateY(0); parts.push(rim);
          const hub = new THREE.CylinderGeometry(0.11, 0.11, 0.18, 8); hub.rotateX(Math.PI / 2); parts.push(hub);
          for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; const sp = new THREE.BoxGeometry(0.05, 0.62, 0.05); sp.translate(0, 0.37, 0); sp.rotateZ(a); parts.push(sp); }
          return N.mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)), false);
        })();
        const wheelsB = [];
        const wagon = (x, z, ry) => {
          const a = Math.abs(Math.cos(ry)) > 0.5;
          kit.box(a ? 4 : 2, 1.0, a ? 2 : 4, x, 0.5, z, woodDark);
          kit.box(a ? 4 : 0.2, 1.4, a ? 0.2 : 4, x + (a ? 0 : -1), 1.5, z + (a ? -1 : 0), hidden);
          const bed = kit.batch(2);
          const cov = kit.batch(2);
          for (const e of [-1, 1]) { bed.box(a ? 4.1 : 0.12, 0.7, a ? 0.12 : 4.1, x + (a ? 0 : e * 1.0), 1.35, z + (a ? e * 1.0 : 0)); }
          for (let k = -1; k <= 1; k++) for (const e of [-1, 1]) cov.box(a ? 0.07 : 0.07, 1.4, 0.07, x + (a ? k * 1.4 : e * 0.95), 1.8 + 0.5, z + (a ? e * 0.95 : k * 1.4));
          kit.deco(bed.mesh(woodDark, { shadow: true }));
          for (const [dx, dz] of a ? [[-1.4, -1.1], [1.4, -1.1], [-1.4, 1.1], [1.4, 1.1]] : [[-1.1, -1.4], [-1.1, 1.4], [1.1, -1.4], [1.1, 1.4]]) {
            const w = new THREE.Mesh(wheelGeo, woodDark); w.position.set(x + dx, 0.72, z + dz); w.scale.setScalar(1.05); if (!a) w.rotation.y = Math.PI / 2; w.castShadow = true; w.raycast = () => {}; kit.deco(w);
          }
          // Tongue and yoke.
          kit.deco((() => { const m = new THREE.Mesh(new THREE.BoxGeometry(a ? 2.6 : 0.12, 0.12, a ? 0.12 : 2.6), woodDark); m.position.set(x + (a ? 3.2 : 0), 0.5, z + (a ? 0 : 3.2)); m.castShadow = true; m.raycast = () => {}; return m; })());
        };
        void wheelsB;
        wagon(-16, 2.6, 0); wagon(14, -2.4, 0); wagon(-29, -1.4, Math.PI / 2);   // the third used to stand inside the church, through its pews
        // Barrels: a bulged profile with iron hoops.
        const barrelProfile = [[0.001, 0], [0.38, 0], [0.46, 0.2], [0.52, 0.55], [0.46, 0.9], [0.38, 1.1], [0.001, 1.1]];
        const hoopB = kit.batch(1);
        for (const [x, z] of [[-6.5, 5.6], [-6.5, 4.4], [8, -5.6], [24, 6], [-24, -6], [19, 5.6]]) {
          const b0 = lift(x, z, 0.5);
          kit.box(0.9, 1.1, 0.9, x, b0, z, hidden);
          lathe(barrelProfile, woodDark, x, b0, z, 14);
          for (const [y, r] of [[0.14, 0.43], [0.4, 0.51], [0.72, 0.51], [0.98, 0.43]]) hoopB.cyl(r + 0.01, r + 0.01, 0.05, x, b0 + y, z, 14);
        }
        kit.deco(hoopB.mesh(iron, { shadow: true }));
        for (const [x, z, n] of [[-30, 5.2, 1], [-29, 4.2, 2], [29, -5.2, 1], [28, -5.8, 2], [5, 5.4, 1], [-12, -5.4, 1]]) {
          const c0 = lift(x, z, 0.7);
          kit.box(1.2, 1.2 * n, 1.2, x, c0, z, plank);
          const strap = kit.batch(1); for (let k = 0; k < n; k++) { strap.box(1.26, 0.1, 1.26, x, c0 + 0.15 + k * 1.2, z).box(1.26, 0.1, 1.26, x, c0 + 1.05 + k * 1.2, z); }
          kit.deco(strap.mesh(woodDark));
        }
        // Hitching rails with posts, and troughs.
        const rail = kit.batch(2);
        for (const x of [-24, -8, 8, 24]) {
          const rn = Math.max(lift(x - 1.8, -6.2, 0.2), lift(x, -6.2, 0.2), lift(x + 1.8, -6.2, 0.2)), rs = Math.max(lift(x + 2.2, 6.3, 0.2), lift(x + 4, 6.3, 0.2), lift(x + 5.8, 6.3, 0.2));
          kit.box(3.6, 0.9, 0.2, x, rn, -6.2, hidden); kit.box(3.6, 0.9, 0.2, x + 4, rs, 6.3, hidden);
          for (const [px, pz, b] of [[x - 1.6, -6.2, rn], [x + 1.6, -6.2, rn], [x + 2.4, 6.3, rs], [x + 5.6, 6.3, rs]]) rail.box(0.14, 1.1, 0.14, px, b + 0.55, pz);
          rail.box(3.6, 0.1, 0.1, x, rn + 0.95, -6.2).box(3.6, 0.1, 0.1, x + 4, rs + 0.95, 6.3);
        }
        kit.deco(rail.mesh(woodDark, { shadow: true }));
        const trough = kit.batch(2); for (const [x, z] of [[-24, -5.4], [8, 5.6]]) { trough.box(2.4, 0.5, 0.7, x, lift(x, z, 1.2) + 0.25, z); }
        kit.deco(trough.mesh(woodDark, { shadow: true }));
        // Cacti: ribbed trunks with arms.
        const cactusMesh = new N.Mesher();
        for (const [x, z] of [[-35, 25], [35, -25], [32, 28], [-31, -24], [20, 32], [-12, 32], [0, -21], [-22, -20]]) { N.cactus(cactusMesh, srnd, x, z, 2.6 + srnd() * 1.6); kit.box(0.9, 2.6, 0.9, x, 0, z, hidden); world.zone({ kind: "damage", x, z, w: 1.9, d: 1.9, y0: 0, h: 2.8, amount: 2, rate: 0.6, label: "cactus" }); }   // spines: a prick for touching one
        for (let i = 0; i < 40; i++) { const x = (srnd() - 0.5) * 150, z = (srnd() - 0.5) * 150; if (Math.max(Math.abs(x), Math.abs(z)) < H + 3) continue; N.cactus(cactusMesh, srnd, x, z, 2.2 + srnd() * 3); }
        const cm = cactusMesh.toMesh(N.material("cactus"), { cast: true, receive: true }); if (cm) { cm.frustumCulled = false; kit.deco(cm); }
        // Street lamps: a post, a bracket and a glass lantern.
        const lampPost = kit.batch(2), lenses = kit.batch(1);
        for (const [x, z] of [[-16, 5.8], [0, -5.8], [16, 5.8], [-30, -5.8], [30, 5.8], [8, 5.8]]) { const l0 = lift(x, z, 0.2); lampPost.box(0.14, 3.6, 0.14, x, l0 + 1.8, z).box(0.6, 0.08, 0.08, x + 0.3, l0 + 3.5, z); lenses.box(0.26, 0.36, 0.26, x + 0.6, l0 + 3.3, z); }
        kit.deco(lampPost.mesh(iron, { shadow: true })); kit.deco(lenses.mesh(new THREE.MeshStandardMaterial({ color: 0x302418, emissive: 0xffb24a, emissiveIntensity: 0.6, roughness: 0.2 })));
      }

      // ── The railway ──────────────────────────────────────────────────────────────────
      const RZ = -30;
      const gravel = N.pebbles();
      const bedMat = new THREE.MeshStandardMaterial({ map: N.tiled(gravel.map, H * 2 / 2.4, 5.4 / 2.4), normalMap: N.tiled(gravel.normalMap, H * 2 / 2.4, 5.4 / 2.4), color: 0x9a948a, roughness: 1 });
      const bed = new THREE.Mesh(new THREE.PlaneGeometry(H * 2, 5.4), bedMat);
      bed.rotation.x = -Math.PI / 2; bed.position.set(0, 0.04, RZ); bed.receiveShadow = true; bed.raycast = () => {}; kit.deco(bed);
      const rails = kit.batch(2), ties = kit.batch(2), spikes = kit.batch(1);
      for (const z of [RZ - 0.72, RZ + 0.72]) { rails.box(H * 2, 0.07, 0.17, 0, 0.14, z).box(H * 2, 0.12, 0.05, 0, 0.21, z).box(H * 2, 0.07, 0.11, 0, 0.29, z); }
      for (let x = -H + 1; x < H; x += 0.9) { ties.box(0.24, 0.13, 2.6, x + (srnd() - 0.5) * 0.06, 0.1, RZ + (srnd() - 0.5) * 0.08, (srnd() - 0.5) * 0.04); for (const z of [RZ - 0.72, RZ + 0.72]) spikes.box(0.06, 0.05, 0.06, x, 0.2, z + 0.12); }
      kit.deco(rails.mesh(iron, { shadow: true })); kit.deco(ties.mesh(woodDark, { shadow: true })); kit.deco(spikes.mesh(iron));
      // Tunnel mouths where the line enters and leaves the canyon: a black arch in a stone and timber portal, so the
      // train comes out of the dark rather than out of the rock (the wall behind stays solid).
      {
        const archShape = new THREE.Shape(); const aw = 2.4, ah = 2.2;
        archShape.moveTo(-aw, 0); archShape.lineTo(-aw, ah); archShape.absarc(0, ah, aw, Math.PI, 0, true); archShape.lineTo(aw, 0); archShape.lineTo(-aw, 0);
        const hole = new THREE.Mesh(new THREE.ShapeGeometry(archShape, 20), new THREE.MeshBasicMaterial({ color: 0x030303, fog: false }));
        const surround = kit.batch(3);
        for (const sx of [-1, 1]) {
          const px = sx * (H - 0.04);
          const m = hole.clone(); m.position.set(px, 0.2, RZ); m.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2; m.raycast = () => {}; kit.deco(m);
          for (const sz of [-1, 1]) for (let k = 0; k < 6; k++) surround.box(0.5, 0.7, 0.9, px - sx * 0.2, 0.35 + k * 0.7, RZ + sz * (aw + 0.45) + (k % 2) * 0.1);
          for (let k = 0; k < 9; k++) { const ang = Math.PI * (k + 0.5) / 9, rr = aw + 0.45; surround.box(0.5, 0.85, 0.8, px - sx * 0.2, 0.2 + ah + Math.sin(ang) * rr, RZ - Math.cos(ang) * rr, 0, 0, 0); }
          surround.box(0.6, 0.3, aw * 2 + 2.2, px - sx * 0.25, 0.2 + ah + aw + 1.05, RZ);
          surround.box(0.7, 0.25, 0.7, px - sx * 0.25, 0.2 + ah + aw + 0.55, RZ);   // keystone
        }
        kit.deco(surround.mesh(stone, { shadow: true }));
      }
      // Signals and crossing gates.
      const lamps = [];
      for (const sx of [-14, 14]) {
        const post = kit.batch(2); post.box(0.25, 3.6, 0.25, sx, 1.8, RZ + 3.2).box(0.7, 0.9, 0.3, sx, 3.9, RZ + 3.2);
        kit.deco(post.mesh(iron, { shadow: true }));
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18), new THREE.MeshBasicMaterial({ color: 0x3a0d0a })); lens.position.set(sx, 3.9, RZ + 3.04); lens.rotation.y = Math.PI; lens.raycast = () => {}; kit.deco(lens); lamps.push(lens);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 5), plain("dt-arm", 0xd8d0c0, { rough: .6 }));
        arm.position.set(sx, 3.2, RZ + 0.5); arm.castShadow = false; arm.raycast = () => {}; kit.deco(arm); lamps.push(arm);
      }
      // The train: loco, tender, boxcar, passing every 30 s. Signals from 14 s, the train 20–28 s.
      const cycle = (t) => t % 30;
      const center = (t) => { const c = cycle(t); if (c < 20 || c >= 28) return null; return -62 + (c - 20) / 8 * 124; };
      const shade = (() => {
        const c = document.createElement("canvas"); c.width = 128; c.height = 64;
        const g = c.getContext("2d"), grd = g.createLinearGradient(0, 0, 0, 64);
        grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(0.35, "rgba(0,0,0,.55)"); grd.addColorStop(0.65, "rgba(0,0,0,.55)"); grd.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grd; g.fillRect(0, 0, 128, 64);
        const t = new THREE.CanvasTexture(c); return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: true });
      })();
      const driverGeo = (r) => {
        const parts = [];
        const tire = new THREE.CylinderGeometry(r, r, 0.14, 26); tire.rotateX(Math.PI / 2); parts.push(tire);
        const web = new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.05, 26); web.rotateX(Math.PI / 2); web.translate(0, 0, 0.085); parts.push(web);
        const hub = new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.22, 12); hub.rotateX(Math.PI / 2); parts.push(hub);
        for (let k = 0; k < 10; k++) { const sp = new THREE.BoxGeometry(r * 0.12, r * 0.74, 0.07); sp.translate(0, r * 0.45, 0); sp.rotateZ(k / 10 * TAU); parts.push(sp); }
        const cw = new THREE.BoxGeometry(r * 0.5, r * 0.4, 0.07); cw.translate(0, r * 0.62, 0.1); parts.push(cw);
        return N.mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)), false);
      };
      const bodyOf = (offset, kind) => {
        // The collider: invisible, but what bullets and feet meet. The train is built on it.
        const m = kit.box(9, 3.4, 3.2, 0, 0.9, RZ, hidden);
        const parts = [];
        const add = (geo, material, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, material); o.position.set(x, y - 2.6, z); o.rotation.set(rx, ry, rz); parts.push(o); return o; };
        const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 3.8), shade); shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.set(0, 0.36 - 2.6, 0); parts.push(shadowPlane);
        const body = kit.batch(2), trimB = kit.batch(2);
        const wheelSpin = [], rods = [];
        const wheelMat = iron;
        if (kind === "loco") {
          body.box(8.6, 0.5, 2.5, 0.0, 1.35, 0).box(8.6, 0.12, 2.9, 0, 1.6, 0);          // frame and running board
          const boiler = new THREE.CylinderGeometry(1.12, 1.12, 5.4, 28); boiler.rotateZ(Math.PI / 2); add(boiler, iron, 1.0, 3.0, 0);
          const smokebox = new THREE.CylinderGeometry(1.18, 1.18, 0.9, 28); smokebox.rotateZ(Math.PI / 2); add(smokebox, mat("dt-smoke", null, { color: 0x15161a, metal: .6, rough: .6 }), 3.85, 3.0, 0);
          const door = new THREE.CircleGeometry(1.0, 28); door.rotateY(Math.PI / 2); add(door, mat("dt-smoke", null, { color: 0x15161a, metal: .6, rough: .6 }), 4.32, 3.0, 0);
          for (const x of [-0.9, 0.9, 2.6]) { const band = new THREE.CylinderGeometry(1.16, 1.16, 0.1, 28); band.rotateZ(Math.PI / 2); add(band, brass, x, 3.0, 0); }
          // Stack: a flared funnel.
          const stack = new THREE.LatheGeometry([[0.3, 0], [0.3, 0.9], [0.42, 1.25], [0.62, 1.6], [0.62, 1.68], [0.3, 1.5]].map(([r, h]) => new THREE.Vector2(r, h)), 16); add(stack, iron, 3.5, 4.0, 0);
          const dome = new THREE.SphereGeometry(0.46, 16, 10, 0, TAU, 0, Math.PI / 2); add(dome, brass, 1.6, 4.1, 0);
          const sand = new THREE.SphereGeometry(0.36, 14, 8, 0, TAU, 0, Math.PI / 2); add(sand, iron, 0.3, 4.1, 0);
          const whistle = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8); add(whistle, brass, -0.4, 4.35, 0.3);
          // Headlamp: a housing and a lit lens.
          body.box(0.5, 0.7, 0.55, 3.0, 4.35, 0);
          add(new THREE.CircleGeometry(0.2, 14), new THREE.MeshBasicMaterial({ color: 0xfff0c0 }), 3.26, 4.35, 0, 0, Math.PI / 2, 0);
          // Cab: floor, sides with windows, a back wall and an overhanging roof.
          body.box(2.8, 0.2, 3.0, -3.0, 1.8, 0);
          for (const s of [-1, 1]) { body.box(2.8, 0.7, 0.12, -3.0, 2.25, s * 1.42).box(2.8, 0.6, 0.12, -3.0, 4.15, s * 1.42).box(0.5, 1.4, 0.12, -4.15, 3.2, s * 1.42).box(0.5, 1.4, 0.12, -1.85, 3.2, s * 1.42); }
          body.box(0.12, 2.5, 3.0, -4.35, 3.1, 0).box(3.4, 0.16, 3.5, -3.0, 4.6, 0);
          trimB.box(2.8, 0.1, 3.05, -3.0, 4.5, 0).box(0.1, 1.0, 0.1, -1.7, 2.6, 1.46).box(0.1, 1.0, 0.1, -1.7, 2.6, -1.46);
          // Pilot (cowcatcher): a raked grid of bars.
          for (let k = -4; k <= 4; k++) trimB.beam([4.4, 0.55, k * 0.3], [5.4, 0.35, k * 0.12], 0.07);
          trimB.beam([5.4, 0.35, -0.5], [5.4, 0.35, 0.5], 0.09).box(0.1, 0.4, 2.4, 4.45, 0.75, 0);
          // Cylinders and valve gear.
          for (const s of [-1, 1]) { const cyl = new THREE.CylinderGeometry(0.28, 0.28, 1.5, 12); cyl.rotateZ(Math.PI / 2); add(cyl, iron, 2.9, 1.3, s * 1.4); trimB.box(0.2, 0.2, 0.12, 2.0, 1.3, s * 1.5); }
          // Drivers with side rods.
          const dg = driverGeo(0.9);
          for (const s of [-1, 1]) for (const wx of [-1.9, 0.1, 2.1]) { const w = new THREE.Mesh(dg, wheelMat); w.position.set(wx, 1.15 - 2.6, s * 1.5); parts.push(w); wheelSpin.push([w, wx]); }
          for (const s of [-1, 1]) { const rod = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.14, 0.08), iron); rod.position.set(0.1, 1.15 - 2.6, s * 1.62); parts.push(rod); rods.push([rod, 0.1, s]); }
          const lead = driverGeo(0.52);
          for (const s of [-1, 1]) { const w = new THREE.Mesh(lead, wheelMat); w.position.set(3.7, 0.8 - 2.6, s * 1.5); parts.push(w); wheelSpin.push([w, 3.7, 0.52 / 0.9]); }
        } else if (kind === "tender") {
          body.box(8.2, 0.4, 2.7, 0, 1.3, 0).box(8.0, 1.7, 0.14, 0, 2.3, 1.3).box(8.0, 1.7, 0.14, 0, 2.3, -1.3).box(0.14, 1.7, 2.7, 4.0, 2.3, 0).box(0.14, 2.2, 2.7, -4.0, 2.55, 0);
          trimB.box(8.1, 0.12, 0.3, 0, 3.2, 1.3).box(8.1, 0.12, 0.3, 0, 3.2, -1.3);
          // A heap of coal.
          const coal = N.rock(srnd, iron, { x: 0, y: 3.1 - 2.6, z: 0, size: 1.3, squash: 0.5, detail: 2 });
          coal.scale(2.8, 1, 1.0); coal.translate(0, 0.2, 0);
          add(coal, mat("dt-coal", null, { color: 0x131315, rough: .6, metal: .1 }), 0, 2.6, 0);
          body.box(0.5, 0.5, 0.5, 4.5, 1.6, 0).box(0.5, 0.5, 0.5, -4.5, 1.6, 0);   // couplers
        } else {
          // Boxcar: planked body, sliding doors, a roof walk and ladders.
          body.box(8.0, 0.35, 2.7, 0, 1.3, 0);
          body.box(7.8, 2.3, 0.14, 0, 2.6, 1.3).box(7.8, 2.3, 0.14, 0, 2.6, -1.3).box(0.14, 2.3, 2.7, 3.9, 2.6, 0).box(0.14, 2.3, 2.7, -3.9, 2.6, 0);
          body.box(8.4, 0.18, 3.2, 0, 3.85, 0).box(8.2, 0.14, 2.6, 0, 4.0, 0);
          for (const s of [-1, 1]) { trimB.box(2.2, 2.2, 0.1, 0.4, 2.6, s * 1.4).box(2.4, 0.1, 0.16, 0.4, 3.78, s * 1.4).box(0.12, 0.12, 0.16, 1.6, 2.6, s * 1.44).box(2.4, 0.08, 0.16, 0.4, 1.52, s * 1.4); for (let x = -3.5; x <= 3.5; x += 1.75) trimB.box(0.1, 2.3, 0.08, x, 2.6, s * 1.38); }
          for (const x of [-4.05, 4.05]) trimB.box(0.08, 1.2, 0.08, x, 2.2, 1.0).box(0.08, 1.2, 0.08, x, 2.2, -1.0).box(0.08, 0.08, 2.0, x, 2.8, 0);
          body.box(0.5, 0.5, 0.5, 4.5, 1.6, 0).box(0.5, 0.5, 0.5, -4.5, 1.6, 0);
        }
        if (kind !== "loco") {
          const truck = driverGeo(0.46);
          for (const bx of [-2.7, 2.7]) for (const s of [-1, 1]) for (const dx of [-0.55, 0.55]) { const w = new THREE.Mesh(truck, wheelMat); w.position.set(bx + dx, 0.58 - 2.6 + 0.0, s * 1.4); parts.push(w); wheelSpin.push([w, bx + dx, 0.46 / 0.9]); }
          for (const bx of [-2.7, 2.7]) trimB.box(1.8, 0.2, 2.9, bx, 0.8, 0);
        }
        const wallMat = kind === "boxcar" ? plankRed : (kind === "loco" ? plankRed : iron);
        const bm = body.mesh(wallMat, { shadow: false }); if (bm) { bm.position.y = -2.6; parts.push(bm); }
        const tm = trimB.mesh(kind === "loco" ? brass : iron, { shadow: false }); if (tm) { tm.position.y = -2.6; parts.push(tm); }
        for (const p of parts) { p.raycast = () => {}; p.castShadow = false; m.add(p); }
        world.mover({ mesh: m, box: m.userData.wallBox, size: [9, 3.4, 3.2], home: new THREE.Vector3(0, 0.9 + 1.7, RZ), path: (t) => { const x = center(t); return x === null ? null : { x: x + offset, y: 0, z: 0 }; } });
        world.tick((dt, t) => {
          const x = center(t);
          if (x === null) return;
          const base = (x + offset);
          for (const [w, wx, k = 1] of wheelSpin) w.rotation.z = -(base + wx) / (0.9 * k);
          for (const [rod, rx, s] of rods) { const a = -(base + rx) / 0.9 + (s > 0 ? 0 : Math.PI / 2); rod.position.set(rx + Math.cos(a) * 0.35, 1.15 - 2.6 + Math.sin(a) * 0.35, s * 1.62); }
        });
        return m;
      };
      bodyOf(10.2, "loco");
      bodyOf(0, "tender");
      bodyOf(-10.2, "boxcar");
      world.zone({ kind: "damage", x: 0, z: RZ, w: 31, d: 4.4, y0: 0, h: 2.2, amount: 100, rate: 0.2, label: "train", at: (t) => { const x = center(t); return x === null ? { x: 0, z: 999 } : { x, z: RZ }; } });
      world.tick((dt, t) => {
        const c = cycle(t), warn = c >= 14 && c < 28;
        const on = warn && (c >= 20 || Math.floor(t * 2) % 2 === 0);
        for (const l of lamps) {
          if (l.material && l.material.isMeshBasicMaterial) l.material.color.setHex(on ? 0xff3a2a : 0x3a0d0a);
          else l.rotation.x = warn ? -1.45 : 0, l.position.y = warn ? 1.2 : 3.2, l.position.z = RZ + (warn ? 2.0 : 0.5);
        }
      });
      // Smoke and steam from the stack.
      const smoke = [];
      for (let k = 0; k < 10; k++) { const s = sprite(0x8d8780, 3, 0, 0, 0, 0, false); kit.deco(s); smoke.push(s); }
      world.tick((dt, t) => { const x = center(t); smoke.forEach((s, k) => { if (x === null) { s.material.opacity = 0; return; } const u = ((t * 1.1 + k / 10) % 1); s.position.set(x + 13.7 - u * 7, 6.0 + u * 5, RZ + Math.sin(k) * 0.4); s.scale.setScalar(1.6 + u * 5); s.material.opacity = 0.55 * (1 - u) * (u < 0.1 ? u * 10 : 1); }); });
      // A depot shed and a water column at the track side (cover).
      kit.box(5, 3, 3.4, -28, 0, RZ - 4.4, woodDark); kit.box(5.4, 0.4, 3.8, -28, 3, RZ - 4.4, shingle);
      const shed = kit.batch(2); shed.box(5.6, 0.14, 0.14, -28, 3.4, RZ - 2.6).box(0.14, 0.9, 3.6, -30.6, 3.0, RZ - 4.4);
      kit.deco(shed.mesh(woodDark));
      kit.box(1.2, 1.2, 1.2, 8, 0, RZ + 4.4, plank); kit.box(1.2, 2.4, 1.2, 9.2, 0, RZ + 4.6, plank); kit.box(2.4, 1.0, 1.0, 22, 0, RZ + 4.3, woodDark);
      const col = kit.batch(2); col.cyl(0.35, 0.35, 5.5, 14, 2.75, RZ + 3.6, 10).box(2.6, 0.2, 0.2, 13, 5.4, RZ + 3.6).cyl(0.2, 0.2, 2.0, 11.8, 4.4, RZ + 3.6, 8);
      kit.deco(col.mesh(iron, { shadow: true }));
      void rnd;
    },
  };
}
