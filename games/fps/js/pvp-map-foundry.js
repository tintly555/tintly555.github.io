/*
 * CINDERWORKS — a working foundry hall. Two molten channels cross at the middle of the floor and
 * split the hall into four workshops; a catwalk runs round the walls on its own level.
 *
 *   NW  foundry hall   a walled shop with doorways, casting moulds and an overhead crane
 *   NE  slag tower     a two-storey steel scaffold
 *   SW  conveyor yard  three belts that carry you along, with crates riding them
 *   SE  control room   an office on stilts; the ladle above the lane beside it tips on a timer
 *
 * Moving parts (all on the shared clock): wall lifts up to the catwalk, steam vents that blast on a
 * cycle, the ladle's pour, the crane. The lava burns anyone who touches it; the four bridges and the
 * catwalk are the dry way across.
 */
export function foundry(core) {
  const { THREE, surfaces, mat, plain, glowing, sprite, TAU } = core;
  const H = 36;

  return {
    id: "crossfire",
    name: "CINDERWORKS",
    tag: "Foundry · lava, lifts, steam",
    half: H,
    spawns: [
      [-26, -26], [30, -24], [-31.5, 22], [26, 26], [-14, -30], [14, -30], [-14, 30], [14, 30],
      [-31, -18], [31, -18], [-31, 18], [31, 18], [-10, -12], [10, -12], [-10, 12], [10, 12],
    ],
    env: {
      bg: 0x120a07, fog: 0x1a0f0a, fogNear: 12, fogFar: 90, hemi: [0xffd2aa, 0x3a2418, 3.0], ambient: [0xffc9a0, 1.4], bright: false,
      // Lit from overhead like a shop under its lamps: a high warm light with a static shadow under every platform and pot.
      sun: [0xffd6a8, 2.0, [8, 80, 12]], shadow: 50, envIntensity: 0.9,
      sky: { sun: [0.1, 0.9, 0.12], zenith: 0x1c120d, horizon: 0x7a3a16, ground: 0xff6a24, sunColor: 0xffb878, cloud: 0 },
      look: { tint: 0xffe6cc, vignette: 0.36, bloom: 0.3, threshold: 1.2, contrast: 1.05 },
    },
    // Where the walk-through preview strolls: [x, z] points at eye height.
    preview: { eye: 1.7, path: [[-31, 20], [-20, 9], [-9, 17], [0, 17], [9, 17], [17, 9], [17, -9], [9, -17], [-6, -17], [-17, -9], [-26, 4], [-31, 20]] },

    build(kit, host) {
      const world = host.world;
      const N = kit.nature();
      const steel = mat("fx-steel", surfaces.steel("fx-steel", { base: [74, 78, 84], rust: .3 }), { metal: .35, rough: .7, tile: 3 });
      const steelDark = mat("fx-steel-d", surfaces.steel("fx-steel-d", { base: [46, 48, 54], rust: .5 }), { metal: .4, rough: .75, tile: 3 });
      const brick = mat("fx-brick", surfaces.stone("fx-brick", { base: [132, 74, 54], blocks: 8 }), { tile: 3.2 });
      const conc = mat("fx-conc", surfaces.concrete("fx-conc", { base: [88, 82, 76], stain: .85, crack: 10 }), { tile: 3 });
      const grate = mat("fx-grate", surfaces.grating("fx-grate", { base: [92, 98, 106] }), { metal: .4, rough: .6, tile: 2 });
      const floorMat = mat("fx-floor", surfaces.factory("fx-floor", { base: [54, 52, 52] }), { tile: 4 });
      const hazard = plain("fx-hazard", 0xd9a21b, { rough: .6 });
      const crate = mat("fx-crate", surfaces.wood("fx-crate", { base: [120, 84, 50], planks: 3, grey: .25 }), { tile: 1.6 });

      // ── Floor and roof (scenery) ────────────────────────────────────────────────────
      const floorSize = H * 2 + 8;
      const floorMap = floorMat.map.clone(); floorMap.repeat.set(floorSize / 4, floorSize / 4); floorMap.needsUpdate = true;
      const floorNormal = floorMat.normalMap.clone(); floorNormal.repeat.copy(floorMap.repeat); floorNormal.needsUpdate = true;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), new THREE.MeshStandardMaterial({ map: floorMap, normalMap: floorNormal, roughness: 1 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; floor.receiveShadow = true; floor.raycast = () => {};
      kit.deco(floor);
      const roof = new THREE.Mesh(new THREE.PlaneGeometry(H * 2 + 2, H * 2 + 2), plain("fx-roof", 0x0e0b0a, { rough: 1 }));
      roof.rotation.x = Math.PI / 2; roof.position.y = 12.5; roof.raycast = () => {};
      kit.deco(roof);

      kit.perimeter(H, 12, brick, 1.2);

      // ── Molten channels ─────────────────────────────────────────────────────────────
      const molten = new THREE.Group(); kit.deco(molten);
      N.molten(molten, world, new THREE.PlaneGeometry(6, H * 2), { y: 0.06, repeat: [1, H / 4.5], flow: [0, 0.02] });
      N.molten(molten, world, new THREE.PlaneGeometry(H * 2, 6), { y: 0.066, repeat: [H / 4.5, 1], flow: [0.02, 0] });
      // Curbs along the channels (scenery) and the burn zones.
      const curbs = kit.batch(2);
      for (const s of [-1, 1]) {
        curbs.box(0.5, 0.5, H * 2, s * 3.3, 0.25, 0).box(H * 2, 0.5, 0.5, 0, 0.25, s * 3.3);
      }
      kit.deco(curbs.mesh(conc));
      world.zone({ kind: "damage", x: 0, z: 0, w: 6, d: H * 2, y0: 0, h: 0.6, amount: 26, rate: 0.4, label: "lava" });
      world.zone({ kind: "damage", x: 0, z: 0, w: H * 2, d: 6, y0: 0, h: 0.6, amount: 26, rate: 0.4, label: "lava" });
      // The metal lights the hall from below: one lamp at the crossing and one over each arm (a map gets six lights in all).
      // The metal's glow lights the hall from close above the surface, so the floor and the walls catch the orange.
      for (const [x, z, k] of [[0, 0, 150], [0, 21, 90], [0, -21, 90]]) { const gl = new THREE.PointLight(0xff6a22, k, 40, 2); gl.position.set(x, 1.5, z); kit.light(gl); }
      // Smoke off the molten metal: dark and heavy, rising from the channels and thinning into the roof.
      const smokeGroup = new THREE.Group(); kit.deco(smokeGroup);
      const emberGroup = new THREE.Group(); kit.deco(emberGroup);
      for (const [x, z, p] of [[-14, 0, 0], [14, 0, 1.7], [0, -14, 3.1], [0, 14, 4.4], [-7, 0, 5.2], [7, 0, 0.9]]) {
        N.steam(smokeGroup, world, { x, z, height: 11, size: 2.6, opacity: 0.34, count: 12, color: 0x3d3a37,
          intensity: (t) => 0.75 + 0.25 * Math.sin(t * 0.37 + p) });
        N.embers(emberGroup, world, { x, z, w: 3.4, d: 3.4, height: 5, count: 14, rate: 0.5 + (p % 1) * 0.3, size: 0.12 });
      }

      // ── Bridges over the channels ───────────────────────────────────────────────────
      const bridge = (cx, cz, alongX) => {
        // Deck 0.9 high spanning the 6 m channel, three steps up at each end, rails on both sides.
        const dx = alongX ? 1 : 0, dz = alongX ? 0 : 1;
        const len = 7.6, wid = 4.6;
        kit.box(alongX ? len : wid, 0.5, alongX ? wid : len, cx, 0.4, cz, grate);
        for (const s of [-1, 1]) {
          kit.stairs({ x: cx + dx * s * len / 2, z: cz + dz * s * len / 2, dir: alongX ? (s > 0 ? "+x" : "-x") : (s > 0 ? "+z" : "-z"), w: wid - 0.4, steps: 3, material: steel });
          kit.box(alongX ? len : 0.14, 1.0, alongX ? 0.14 : len, cx + (alongX ? 0 : s * (wid / 2 - 0.07)), 0.9, cz + (alongX ? s * (wid / 2 - 0.07) : 0), steelDark);
        }
        const b = kit.batch(3);
        for (const s of [-1, 1]) for (const k of [-1, 1]) b.box(0.4, 0.9, 0.4, cx + (alongX ? k * (len / 2 - 0.3) : s * (wid / 2 - 0.2)), 0.45, cz + (alongX ? s * (wid / 2 - 0.2) : k * (len / 2 - 0.3)));
        kit.deco(b.mesh(steelDark));
      };
      bridge(0, 17, false); bridge(0, -17, false); bridge(17, 0, true); bridge(-17, 0, true);

      // ── Terrain: two slag heaps, raised ground with a slope up each ───────────────────
      const slag = mat("fx-slag", surfaces.concrete("fx-slag", { base: [58, 52, 48], stain: 0.9, crack: 14 }), { tile: 3 });
      kit.mound({ x: 17, z: -7, w: 4, d: 6, h: 1.2, material: slag, ramps: ["W", "N"], slope: 3.2 });
      kit.mound({ x: -17, z: 7, w: 4, d: 6, h: 1.2, material: slag, ramps: ["E", "S"], slope: 3.2 });

      // ── NW: the foundry hall ────────────────────────────────────────────────────────
      {
        const cx = -20, cz = -20, w = 16, d = 14, h = 6.2, t = 0.8;
        const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
        kit.wallRun(x0, z1, x1, z1, h, t, brick, [{ at: 2.2, w: 3, h: 3.2 }, { at: 10.5, w: 3, h: 3.2 }]);
        kit.wallRun(x0, z0, x1, z0, h, t, brick, [{ at: 12, w: 2.8, h: 3.2 }]);
        kit.wallRun(x0, z0, x0, z1, h, t, brick, [{ at: 4.5, w: 2.6, h: 3 }, { at: 8.5, w: 2.6, h: 1.6, sill: 1.1 }]);
        kit.wallRun(x1, z0, x1, z1, h, t, brick, [{ at: 6, w: 3, h: 3.2 }]);
        kit.box(w + t, 0.5, d + t, cx, h, cz, steelDark);          // roof slab
        // Casting moulds, crates and a work bench: cover inside.
        kit.box(3.2, 1.1, 2.2, cx - 3.5, 0, cz - 2, steel); kit.box(3.2, 1.1, 2.2, cx + 3, 0, cz + 2.5, steel);
        kit.box(1.4, 1.2, 1.4, cx - 5.5, 0, cz + 3.5, crate); kit.box(1.4, 2.4, 1.4, cx + 5.5, 0, cz - 4, crate);
        kit.box(5, 0.9, 1, cx + 1, 0, cz - 5.5, steelDark);
        // Furnace mouth (scenery): a glowing door on the north wall.
        const mouth = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), glowing("fx-mouth", 0xff6a1c, 2.6));
        mouth.position.set(cx - 2, 1.4, z0 + 0.45); mouth.raycast = () => {}; kit.deco(mouth);
        const fl = new THREE.PointLight(0xff7a30, 40, 16, 2); fl.position.set(cx - 2, 2, z0 + 3); kit.light(fl);
        // Overhead crane: runway beams along the hall, a bridge that travels on them, a hoist that travels along the
        // bridge, and a ladle of metal hanging from its hook well above head height.
        const craneMat = plain("fx-crane", 0xc2901c, { metal: .45, rough: .5 });
        const runway = kit.batch(3);
        for (const zz of [cz - d / 2 + 1.5, cz + d / 2 - 1.5]) runway.box(w + 4, 0.5, 0.12, cx, 5.4, zz).box(w + 4, 0.12, 0.5, cx, 5.64, zz).box(w + 4, 0.12, 0.5, cx, 5.16, zz);
        for (let u = -w / 2 - 1.5; u <= w / 2 + 1.5; u += 3) for (const zz of [cz - d / 2 + 1.5, cz + d / 2 - 1.5]) runway.box(0.3, 0.9, 0.4, cx + u, 5.9, zz);
        kit.deco(runway.mesh(steelDark, { shadow: true }));
        const bridge = new THREE.Group();
        const bb = kit.batch(3), gl = d - 2.2;
        bb.box(0.7, 0.75, gl, 0, 5.0, 0).box(1.1, 0.1, gl, 0, 5.42, 0).box(1.1, 0.1, gl, 0, 4.58, 0);
        for (const sz of [-1, 1]) {
          bb.box(1.5, 0.7, 1.0, 0, 5.12, sz * (d / 2 - 1.5 - cz + cz)).box(0.2, 0.3, 0.2, -0.55, 5.55, sz * (d / 2 - 1.5)).box(0.2, 0.3, 0.2, 0.55, 5.55, sz * (d / 2 - 1.5));
          for (const wx of [-0.55, 0.55]) bb.cyl(0.24, 0.24, 0.16, wx, 5.4, sz * (d / 2 - 1.5), 14, Math.PI / 2, 0, 0);
        }
        for (let u = -gl / 2 + 0.6; u < gl / 2; u += 1.2) bb.box(0.05, 0.6, 0.35, 0, 5.0, u).box(0.7, 0.06, 0.06, 0, 5.0, u);
        const bm = bb.mesh(craneMat, { shadow: false }); if (bm) bridge.add(bm);
        const hoist = new THREE.Group(); bridge.add(hoist);
        const hb = kit.batch(3);
        hb.box(1.5, 0.45, 1.5, 0, 4.2, 0).box(0.7, 0.5, 0.9, 0.55, 4.6, 0).box(0.9, 0.12, 1.7, 0, 3.95, 0);
        hb.cyl(0.3, 0.3, 1.1, 0, 4.2, 0, 14, 0, Math.PI / 2, 0);
        hb.cyl(0.035, 0.035, 0.5, 0, 3.7, 0, 6);
        hb.box(0.5, 0.5, 0.36, 0, 3.4, 0).cyl(0.14, 0.14, 0.5, 0, 3.4, 0, 12, 0, Math.PI / 2, 0);
        const hm = hb.mesh(craneMat, { shadow: false }); if (hm) hoist.add(hm);
        const swing = new THREE.Group(); swing.position.y = 3.15; hoist.add(swing);
        const hook = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 18, 4.5), steelDark); hook.rotation.set(0, 0, Math.PI * 0.55); hook.position.y = -0.1; swing.add(hook);
        const ladleMesh = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0], [0.62, 0], [0.8, 0.2], [0.92, 0.8], [0.96, 1.05], [0.86, 1.02], [0.82, 0.8], [0.7, 0.24], [0.001, 0.1]].map(([r, hgt]) => new THREE.Vector2(r, hgt)), 22), steelDark.clone());
        ladleMesh.material.side = THREE.DoubleSide; ladleMesh.position.y = -1.45; swing.add(ladleMesh);
        const chains = kit.batch(1);
        for (const sx of [-1, 1]) { chains.beam([0, -0.25, 0], [sx * 0.88, -0.55, 0], 0.05).beam([sx * 0.88, -0.55, 0], [sx * 0.9, -0.4, 0], 0.07); }
        const chm = chains.mesh(steelDark, { shadow: false }); if (chm) swing.add(chm);
        N.molten(swing, world, new THREE.CircleGeometry(0.85, 22), { y: -0.5, flow: [0.02, 0.02], scale: 0.9, intensity: 2.0 });
        bridge.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.raycast = () => {}; } });
        bridge.position.set(cx, 0, cz); kit.deco(bridge);
        world.tick((dt, t) => { bridge.position.x = cx + Math.sin(t * 0.3) * (w / 2 - 2.4); hoist.position.z = Math.sin(t * 0.21 + 1) * (d / 2 - 3.2); swing.rotation.z = Math.sin(t * 0.8) * 0.05; swing.rotation.x = Math.cos(t * 0.6) * 0.04; });
      }

      // ── NE: the slag tower ──────────────────────────────────────────────────────────
      {
        const cx = 20, cz = -20, post = 0.45;
        kit.deck({ x: cx, z: cz, w: 12, d: 12, top: 3.3, thick: 0.4, material: grate, posts: { size: post, material: steel } });
        kit.deck({ x: cx - 0.5, z: cz - 3, w: 7, d: 6, top: 6.6, thick: 0.4, material: grate, posts: { size: post, material: steel } });
        // Flight 1: up from the floor on the west side onto the first deck.
        kit.stairs({ x: cx - 6 - 0.55 * 11 + 0.1, z: cz + 2, dir: "+x", w: 2.4, steps: 11, material: steel });
        // Flight 2: from the first deck up to the second, along its east edge.
        kit.stairs({ x: cx + 4.1, z: cz, dir: "-z", w: 2.2, steps: 11, y0: 3.3, material: steel });
        const rail = (x, z, w, d) => kit.box(w, 1.0, d, x, 3.3, z, steelDark);
        rail(cx, cz - 6.1, 12, 0.14); rail(cx + 6.1, cz, 0.14, 12); rail(cx - 6.1, cz - 4, 0.14, 4);
        rail(cx, cz + 6.1, 6, 0.14);
        kit.box(7, 1.0, 0.14, cx - 0.5, 6.6, cz - 6.1, steelDark);
        // Stack, ladder racks and slag pots (scenery).
        const sc = kit.batch(3);
        sc.cyl(1.3, 1.5, 18, cx + 9, 9, cz - 9, 16).cyl(1.45, 1.45, 0.4, cx + 9, 18.2, cz - 9, 16);
        sc.box(0.5, 6, 0.5, cx - 6, 3, cz - 6).box(0.5, 6, 0.5, cx + 6, 3, cz - 6);
        kit.deco(sc.mesh(steelDark));
        const pots = kit.batch(3);
        pots.cyl(1.2, 0.8, 1.4, cx - 3, 4.0, cz + 3, 12).cyl(1.2, 0.8, 1.4, cx + 3, 4.0, cz - 4, 12);
        kit.deco(pots.mesh(steel));
        const glow = sprite(0xff8a3a, 7, cx - 3, 4.9, cz + 3, 0.8); kit.deco(glow);
      }

      // ── SW: the conveyor yard ───────────────────────────────────────────────────────
      {
        const belts = [-27, -21, -15];
        const beltBox = kit.batch(2), hood = kit.batch(3), flaps = kit.batch(2), belts_ = [];
        const beltTexture = (() => { const c = document.createElement("canvas"); c.width = 32; c.height = 32; const g = c.getContext("2d"); g.fillStyle = "#24272c"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#34383e"; g.fillRect(0, 0, 32, 6); g.fillStyle = "#15171a"; g.fillRect(0, 6, 32, 2); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; })();
        const movers = [];
        belts.forEach((bx, i) => {
          const dir = i === 1 ? -1 : 1;
          kit.box(2.4, 0.5, 14, bx, 0, 20, steelDark);
          kit.stairs({ x: bx, z: 27, dir: "+z", w: 2.4, steps: 1, material: steel });
          kit.stairs({ x: bx, z: 13, dir: "-z", w: 2.4, steps: 1, material: steel });
          world.zone({ kind: "conveyor", x: bx, z: 20, w: 2.4, d: 14, y0: 0.4, h: 2.4, vx: 0, vz: dir * 3.2, grip: 1.1 });
          // Belt surface: scrolling chevrons.
          const beltTex = beltTexture.clone(); beltTex.repeat.set(1, 28); beltTex.needsUpdate = true;
          const surf = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 14), new THREE.MeshStandardMaterial({ map: beltTex, roughness: .9, metalness: .1 }));
          surf.rotation.x = -Math.PI / 2; surf.position.set(bx, 0.52, 20); surf.receiveShadow = true; surf.raycast = () => {}; kit.deco(surf);
          belts_.push([beltTex, dir]);
          // Housings at both ends: crates come out from, and go back into, a hood, and rubber flaps close the outer end.
          for (const [zc, outer] of [[13.85, 13.0], [26.15, 27.0]]) {
            hood.box(2.9, 0.15, 1.7, bx, 2.6, zc).box(0.12, 1.5, 1.7, bx - 1.3, 1.85, zc).box(0.12, 1.5, 1.7, bx + 1.3, 1.85, zc);
            for (let fx = -1.15; fx <= 1.16; fx += 0.4) flaps.box(0.36, 1.6, 0.05, bx + fx, 1.8, outer);
            hood.box(2.9, 0.2, 0.2, bx, 2.55, outer);
          }
          // Crates riding the belt, looping.
          for (let k = 0; k < 4; k++) {
            const c = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.0), crate);
            c.position.set(bx, 0.97, 20); c.raycast = () => {}; kit.deco(c);
            movers.push({ c, dir, phase: k / 4 });
          }
          beltBox.box(0.25, 1.1, 14.4, bx - 1.35, 0.55, 20).box(0.25, 1.1, 14.4, bx + 1.35, 0.55, 20);
        });
        kit.deco(beltBox.mesh(steel));
        kit.deco(hood.mesh(steel, { shadow: true })); kit.deco(flaps.mesh(plain("fx-flap", 0x15110f, { rough: 1 }), { shadow: true }));
        world.tick((dt, t) => {
          for (const m of movers) { const u = ((t * 3.2 / 12.8 * m.dir + m.phase) % 1 + 1) % 1; m.c.position.z = 13.6 + u * 12.8; }     // inside the hoods at both ends of its trip
          for (const [tex, dir] of belts_) tex.offset.y = dir * t * 3.2 / 0.5 % 1;
        });
        // Crate stacks and barrels for cover.
        for (const [x, z, n] of [[-31, 12, 1], [-31, 13.2, 2], [-10, 28, 1], [-8.8, 28, 2], [-9.4, 29.3, 1], [-33, 27, 2]]) kit.box(1.2, 1.2 * n, 1.2, x, 0, z, crate);
        const bar = kit.batch(2);
        for (const [x, z] of [[-11, 14], [-12.2, 14.6], [-30, 29]]) bar.cyl(0.5, 0.5, 1.1, x, 0.55, z, 12);
        kit.deco(bar.mesh(steelDark));
        for (const [x, z] of [[-11, 14], [-12.2, 14.6], [-30, 29]]) kit.box(1.0, 1.1, 1.0, x - 0.5, 0, z - 0.5, steelDark);
      }

      // ── SE: the control room and the ladle lane ─────────────────────────────────────
      {
        const cx = 20, cz = 19;
        kit.deck({ x: cx, z: cz, w: 12, d: 10, top: 3.3, thick: 0.4, material: steel, posts: { size: 0.5, material: steelDark } });
        kit.stairs({ x: 20, z: 24 + 0.55 * 11 - 0.1, dir: "-z", w: 2.2, steps: 11, material: steel });
        // Window wall: waist-high with glass above (scenery), roof on four columns.
        kit.box(12, 1.1, 0.3, cx, 3.3, cz - 5, steelDark);
        kit.box(0.3, 1.1, 10, cx - 6, 3.3, cz, steelDark);
        kit.box(0.3, 1.1, 10, cx + 6, 3.3, cz, steelDark);
        kit.box(3.2, 1.1, 0.3, cx - 4.4, 3.3, cz + 5, steelDark); kit.box(3.2, 1.1, 0.3, cx + 4.4, 3.3, cz + 5, steelDark);
        kit.box(13, 0.4, 11, cx, 7.2, cz, steelDark);
        for (const [sx, sz] of [[-6, -5], [6, -5], [-6, 5], [6, 5]]) kit.box(0.4, 3.9, 0.4, cx + sx, 3.3, cz + sz, steel);
        // Windows: panes between the waist wall and the roof, in a steel frame with mullions.
        const glassMat = N.glass({ tint: 0xbfe0ea }); glassMat.userData.shared = false;
        const frame = kit.batch(2);
        const pane = (len, x, z, ry) => {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.3), glassMat); m.position.set(x, 5.75, z); m.rotation.y = ry; m.raycast = () => {}; m.renderOrder = 4; kit.deco(m);
          kit.shotBlocker(ry ? 0.12 : len, 2.3, ry ? len : 0.12, x, 4.6, z);
          const n = Math.max(1, Math.round(len / 2.4));
          for (let k = 0; k <= n; k++) { const u = -len / 2 + len * k / n; if (ry) frame.box(0.16, 2.4, 0.16, x, 5.75, z + u); else frame.box(0.16, 2.4, 0.16, x + u, 5.75, z); }
          if (ry) frame.box(0.14, 0.12, len, x, 4.65, z).box(0.14, 0.12, len, x, 6.85, z); else frame.box(len, 0.12, 0.14, x, 4.65, z).box(len, 0.12, 0.14, x, 6.85, z);
        };
        pane(12, cx, cz - 5, 0); pane(3.2, cx - 4.4, cz + 5, 0); pane(3.2, cx + 4.4, cz + 5, 0); pane(10, cx - 6, cz, Math.PI / 2); pane(10, cx + 6, cz, Math.PI / 2);
        kit.deco(frame.mesh(steel, { shadow: true }));
        kit.box(4, 1.0, 1.2, cx - 2, 3.3, cz - 3.5, steel);    // console desk
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), glowing("fx-scr", 0x3fd8ff, 1.6));
        scr.position.set(cx - 2, 5.0, cz - 4.7); scr.raycast = () => {}; kit.deco(scr);
        // The ladle: hangs on a rail above the lane, tips on a 32 s cycle.
        const lx = 10, rz = 22;
        const ladle = new THREE.Group();
        const lb = kit.batch(3);
        lb.cyl(1.7, 1.1, 2.2, 0, 0, 0, 18).box(0.2, 5, 0.2, -1.2, 2.6, 0).box(0.2, 5, 0.2, 1.2, 2.6, 0).box(3, 0.2, 0.2, 0, 5, 0);
        const lm = lb.mesh(steelDark); if (lm) ladle.add(lm);
        N.molten(ladle, world, new THREE.CircleGeometry(1.45, 24), { y: 1.08, repeat: [0.4, 0.4], flow: [0.03, 0.02] });
        ladle.position.set(lx, 7.6, rz); kit.deco(ladle);
        const rail = kit.batch(3); rail.box(0.5, 0.5, 36, lx, 12.3, 12); kit.deco(rail.mesh(steelDark));
        const stream = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7.6, 1.2), glowing("fx-stream", 0xff7a1c, 3));
        stream.position.set(lx, 3.8, rz - 2.6); stream.visible = false; stream.raycast = () => {}; kit.deco(stream);
        const puddleGroup = new THREE.Group(); puddleGroup.position.set(lx, 0, 17); puddleGroup.visible = false; kit.deco(puddleGroup);
        const puddle = puddleGroup;
        N.molten(puddleGroup, world, new THREE.PlaneGeometry(4, 10), { y: 0.07, repeat: [0.7, 1.6], flow: [0, 0.05] });
        const beacon = sprite(0xff3a22, 3.4, lx, 6.2, rz - 3.2, 0, true); kit.deco(beacon);
        const cycle = (t) => t % 32;
        world.zone({ kind: "damage", x: lx, z: 17, w: 4.2, d: 10, y0: 0, h: 2.8, amount: 34, rate: 0.35, label: "molten metal", active: (t) => cycle(t) >= 24 && cycle(t) < 29.5 });
        world.tick((dt, t) => {
          const c = cycle(t);
          const warn = c >= 20 && c < 24, pour = c >= 24 && c < 29.5;
          beacon.material.opacity = warn ? (Math.floor(t * 5) % 2 ? 0.95 : 0.1) : pour ? 0.9 : 0;
          const tip = pour ? Math.min(1, (c - 24) / 0.8) : c >= 29.5 && c < 31 ? 1 - (c - 29.5) / 1.5 : 0;
          ladle.rotation.x = -tip * 1.0;
          stream.visible = pour && c < 29;
          puddle.visible = pour;
          if (pour) puddle.scale.z = Math.min(1, (c - 24) / 1.2) * 1 + 0.001;
        });
      }

      // ── The catwalk ─────────────────────────────────────────────────────────────────
      {
        const top = 3.3, wdt = 3;
        kit.box(H * 2 - 1, 0.4, wdt, 0, top - 0.4, -H + wdt / 2 + 0.5, grate);
        kit.box(H * 2 - 1, 0.4, wdt, 0, top - 0.4, H - wdt / 2 - 0.5, grate);
        kit.box(wdt, 0.4, H * 2 - 1, -H + wdt / 2 + 0.5, top - 0.4, 0, grate);
        kit.box(wdt, 0.4, H * 2 - 1, H - wdt / 2 - 0.5, top - 0.4, 0, grate);
        // Rails along the inner edge, with gaps where the lifts meet it.
        const inner = H - wdt - 0.5;
        kit.box(48.8, 1.0, 0.14, 0, top, -inner, steelDark);
        kit.box(48.8, 1.0, 0.14, 0, top, inner, steelDark);
        for (const [a, b] of [[-24.4, -14], [-6, 24.4]]) kit.box(0.14, 1.0, b - a, -inner, top, (a + b) / 2, steelDark);
        for (const [a, b] of [[-24.4, 6], [14, 24.4]]) kit.box(0.14, 1.0, b - a, inner, top, (a + b) / 2, steelDark);
        // Posts under the walkway (scenery) every 9 m.
        const posts = kit.batch(3);
        for (let u = -27; u <= 27; u += 9) for (const s of [-1, 1]) {
          posts.box(0.5, top - 0.4, 0.5, u, (top - 0.4) / 2, s * (H - wdt - 0.2)).box(0.5, top - 0.4, 0.5, s * (H - wdt - 0.2), (top - 0.4) / 2, u);
        }
        kit.deco(posts.mesh(steelDark));
        // Four corner flights up onto it.
        for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          kit.stairs({ x: sx * 26.5, z: sz * 29.5, dir: sx < 0 ? "-x" : "+x", w: 2.2, steps: 11, material: steel });
        }
        // Wall lifts: a platform that rises to the catwalk and sinks again.
        for (const [lx, lz] of [[-30.6, -10], [30.6, 10]]) {
          const lift = kit.box(4, 0.3, 4, lx, 0, lz, steel);
          world.mover({
            mesh: lift, box: lift.userData.wallBox, size: [4, 0.3, 4], home: new THREE.Vector3(lx, 0.15, lz),
            path: (t) => {
              const c = ((t + (lx < 0 ? 0 : 6)) % 12);
              const ease = (u) => u * u * (3 - 2 * u);
              const y = c < 3 ? 0 : c < 5 ? ease((c - 3) / 2) : c < 9 ? 1 : c < 11 ? 1 - ease((c - 9) / 2) : 0;
              return { x: 0, y: y * (top - 0.3), z: 0 };
            },
          });
          const guide = kit.batch(3); guide.box(0.3, 12, 0.3, lx + (lx < 0 ? -2.1 : 2.1), 6, lz - 2).box(0.3, 12, 0.3, lx + (lx < 0 ? -2.1 : 2.1), 6, lz + 2);
          kit.deco(guide.mesh(steelDark));
        }
      }

      // ── Steam vents ─────────────────────────────────────────────────────────────────
      const vents = [[-9, -9], [9, 9], [-9, 9], [9, -9], [-24, 6], [24, -6]];
      const steamGroup = new THREE.Group(); kit.deco(steamGroup);
      vents.forEach(([x, z], i) => {
        const grid = new THREE.Mesh(new THREE.CircleGeometry(1.1, 16), plain("fx-vent", 0x15110f, { rough: .9 }));
        grid.rotation.x = -Math.PI / 2; grid.position.set(x, 0.03, z); grid.raycast = () => {}; kit.deco(grid);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.08, 6, 20), hazard);
        ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.06, z); ring.raycast = () => {}; kit.deco(ring);
        const phase = i * 1.3;
        const active = (t) => ((t + phase) % 8) >= 6.2;
        world.zone({ kind: "damage", x, z, r: 1.7, w: 3.4, d: 3.4, y0: 0, h: 3.2, amount: 14, rate: 0.4, label: "steam", active });
        // The column builds over a second, holds while it burns, and thins away: never a pop.
        const smooth = (v) => { const u = Math.max(0, Math.min(1, v)); return u * u * (3 - 2 * u); };
        N.steam(steamGroup, world, { x, z, height: 6.5, size: 1.15, opacity: 0.52, count: 22, riseRate: 0.46, spread: 1.15, color: 0xe8e8e5, intensity: (t) => { const c = (t + phase) % 8; return Math.max(smooth((c - 5.6) / 1.2), c < 1.2 ? 1 - smooth(c / 1.2) : 0); } });
      });
      // ── Roof trusses, hanging lamps, drifting sparks (scenery) ───────────────────────
      const tr = kit.batch(3);
      for (let x = -30; x <= 30; x += 10) tr.box(0.5, 0.7, H * 2, x, 11.8, 0);
      for (let z = -30; z <= 30; z += 15) tr.box(H * 2, 0.5, 0.5, 0, 11.4, z);
      kit.deco(tr.mesh(steelDark, { shadow: true }));
      // Pipework along the walls: two runs with brackets.
      const piping = kit.batch(2);
      for (const [y, r] of [[9.2, 0.28], [6.9, 0.2]]) {
        piping.cyl(r, r, H * 2 - 2, 0, y, -H + 0.7, 10, 0, Math.PI / 2, 0).cyl(r, r, H * 2 - 2, 0, y, H - 0.7, 10, 0, Math.PI / 2, 0).cyl(r, r, H * 2 - 2, -H + 0.7, y, 0, 10, Math.PI / 2, 0, 0).cyl(r, r, H * 2 - 2, H - 0.7, y, 0, 10, Math.PI / 2, 0, 0);
        for (let u = -32; u <= 32; u += 8) piping.box(0.12, 0.5, 0.3, u, y, -H + 0.45).box(0.12, 0.5, 0.3, u, y, H - 0.45).box(0.3, 0.5, 0.12, -H + 0.45, y, u).box(0.3, 0.5, 0.12, H - 0.45, y, u);
      }
      kit.deco(piping.mesh(steel, { shadow: true }));
      const lampB = kit.batch(2);
      const lampSprites = [];
      for (const [x, z] of [[-24, -24], [24, -24], [-24, 24], [24, 24], [-12, 0], [12, 0], [0, -12], [0, 12], [-30, 0], [30, 0], [0, -30], [0, 30]]) {
        lampB.cyl(0.04, 0.04, 3, x, 10.3, z, 4);
        lampSprites.push([x, z]);
      }
      kit.deco(lampB.mesh(steelDark));
      // Dome lamps on chains: a spun-steel shade, a bulb inside, a lit ring under the rim.
      const shadeGeo = new THREE.LatheGeometry([[0.16, 0.5], [0.2, 0.42], [0.5, 0.2], [0.95, -0.12], [1.05, -0.2], [1.0, -0.22], [0.9, -0.14], [0.45, 0.14], [0.14, 0.4]].map(([r, h]) => new THREE.Vector2(r, h)), 20);
      const shadeMat = steelDark.clone(); shadeMat.side = THREE.DoubleSide;
      const bulb = glowing("fx-bulb", 0xffe2b0, 3.2);
      for (const [x, z] of lampSprites) {
        const sh = new THREE.Mesh(shadeGeo, shadeMat); sh.position.set(x, 8.9, z); sh.castShadow = true; sh.raycast = () => {}; kit.deco(sh);
        const bu = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), bulb); bu.position.set(x, 8.55, z); bu.raycast = () => {}; kit.deco(bu);
      }
      for (const [x, z] of [[-18, -18], [18, 18], [-18, 18], [18, -18]]) { const pl = new THREE.PointLight(0xffc890, 46, 28, 2); pl.position.set(x, 8, z); kit.light(pl); }
      const sparks = [];
      for (let i = 0; i < 36; i++) { const s = sprite(0xffa040, 0.5, 0, 0, 0, 0.9); kit.deco(s); sparks.push({ s, x: (Math.random() - .5) * 60, z: (Math.random() - .5) * 60, o: Math.random() * 10, v: 0.8 + Math.random() }); }
      world.tick((dt, t) => { for (const k of sparks) { const u = ((t * 0.12 * k.v + k.o) % 1); k.s.position.set(k.x + Math.sin(t + k.o) * 1.5, 0.3 + u * 9, k.z); k.s.material.opacity = 0.9 * (1 - u); } });
    },
  };
}
