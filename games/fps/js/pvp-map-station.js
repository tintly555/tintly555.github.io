/*
 * HALCYON RING — a research station turning above a planet. A reactor atrium sits at the middle
 * under low gravity; four docking bays hang off it behind timed airlock doors; four crew modules
 * fill the corners; a gantry rings the atrium a storey up, reached by gravity lifts.
 *
 * The sun comes in through the real windows and throws their shapes across the floors, shadowed by
 * every wall; beyond the glass are stars, a lit planet and the station's own solar wings.
 *
 * On the shared clock: the airlock doors cycle, the reactor charges and pulses (everyone near the
 * core on the floor is hurt; the gantry is safe), the lifts hum all the time.
 */
export function station(core) {
  const { THREE, surfaces, mat, plain, glowing, sprite, TAU, rngFor } = core;
  const H = 34;

  return {
    id: "crossfire_grid",
    name: "HALCYON RING",
    tag: "Orbital station · airlocks, low gravity",
    half: H,
    spawns: [
      [-25.5, -24.5], [24, -24], [-24, 24], [24, 24], [-30, 0], [30, 0], [0, -30], [0, 30],
      [-16, -10], [16, 10], [-10, 16], [10, -16], [-17, 17], [17, -17], [-17, -17], [17, 17],
    ],
    env: {
      bg: 0x05080f, fog: 0x0b111b, fogNear: 40, fogFar: 340, bright: true,
      hemi: [0xe4eeff, 0x8a96aa, 2.6], ambient: [0xdfe9ff, 0.55], sun: [0xfff0dc, 7.5, [-0.62, 0.36, 0.5]], shadow: 50, envIntensity: 1.3,
      sky: { space: true, sun: [-0.62, 0.36, 0.5], planet: [0.3, -0.16, 0.94], radius: 0.62 },
      look: { tint: 0xeaf4ff, vignette: 0.3, bloom: 0.45, threshold: 1.15 },
    },
    preview: { eye: 1.7, path: [[-24, -2], [-12, -3], [-8, 8], [4, 10], [12, 6], [10, -10], [-2, -12], [-18, -9], [-24, -2]] },

    build(kit, host) {
      const world = host.world;
      const N = kit.nature();
      const hullLight = mat("hr-hull", surfaces.composite("hr-hull", { base: [206, 212, 220], accent: [60, 150, 205] }), { metal: .25, rough: .5, tile: 3 });
      const hullDark = mat("hr-dark", surfaces.hull("hr-dark", { base: [70, 82, 100] }), { metal: .5, rough: .45, tile: 3 });
      const floorMat = mat("hr-floor", surfaces.composite("hr-floor", { base: [188, 196, 206], accent: [70, 160, 210] }), { metal: .25, rough: .32, tile: 4 });
      const steel = mat("hr-steel", surfaces.steel("hr-steel", { base: [150, 158, 168], rust: 0 }), { metal: .6, rough: .38, tile: 3 });
      const orange = mat("hr-orange", surfaces.composite("hr-or", { base: [214, 120, 48], accent: [40, 40, 44] }), { metal: .2, rough: .45, tile: 3 });
      const teal = mat("hr-teal", surfaces.composite("hr-teal", { base: [54, 128, 140], accent: [220, 230, 235] }), { metal: .2, rough: .45, tile: 3 });
      const cyan = glowing("hr-cyan", 0x59d8ff, 2.2);
      const white = glowing("hr-white", 0xf2f8ff, 2.0);
      const rnd = rngFor(33);
      // Collision-only box (no mesh): the pvp host always provides collider, so no fallback is needed.
      const hitbox = (w, h, d, x, cy, z) => kit.collider(w, h, d, x, cy, z);

      // One pane of glass for every window: clear face-on, a mirror of the stars at a slant.
      const glass = N.glass({ tint: 0xcfe9ff });
      glass.userData.shared = false;
      const solarMat = new THREE.MeshStandardMaterial({ map: N.solarTexture(), metalness: 0.75, roughness: 0.22, envMapIntensity: 1.4 });
      const group = new THREE.Group(); kit.deco(group);

      // Readouts for the crew consoles: dark glass with traces, bars and text, drawn once and shared.
      const screens = [0, 1, 2].map((k) => {
        const c = document.createElement("canvas"); c.width = 256; c.height = 170;
        const g = c.getContext("2d"), r = rngFor(500 + k);
        g.fillStyle = "#04141a"; g.fillRect(0, 0, 256, 170);
        g.strokeStyle = "rgba(60,200,230,.18)"; g.lineWidth = 1;
        for (let x = 0; x <= 256; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 170); g.stroke(); }
        for (let y = 0; y <= 170; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
        g.fillStyle = "#7fe3ff"; g.font = "bold 13px monospace"; g.fillText(["ATRIUM · CORE TEMP", "ORBIT · ALT 412 KM", "AIRLOCK STATUS"][k], 10, 18);
        if (k === 0) { g.strokeStyle = "#5cf0b8"; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 236; x += 4) { const y = 100 + Math.sin(x * 0.06) * 22 + (r() - 0.5) * 8; x ? g.lineTo(10 + x, y) : g.moveTo(10 + x, y); } g.stroke(); g.fillStyle = "#e9fbff"; g.font = "bold 26px monospace"; g.fillText("3 218 K", 10, 158); }
        else if (k === 1) { g.strokeStyle = "#7fe3ff"; g.lineWidth = 2; g.beginPath(); g.ellipse(128, 100, 70, 34, 0.25, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(128, 100, 34, 70, -0.25, 0, Math.PI * 2); g.stroke(); g.fillStyle = "#ffd36b"; g.beginPath(); g.arc(186, 82, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = "#e9fbff"; g.font = "13px monospace"; g.fillText("INCL 51.6°   V 7.66 KM/S", 10, 160); }
        else { for (let i = 0; i < 5; i++) { const on = r() > 0.3; g.fillStyle = on ? "#5cf0b8" : "#ff6b5a"; g.fillRect(12, 34 + i * 26, 12, 12); g.fillStyle = "#e9fbff"; g.font = "13px monospace"; g.fillText(["BAY N", "BAY S", "BAY W", "BAY E", "ATRIUM"][i] + (on ? "  SEALED" : "  CYCLING"), 32, 45 + i * 26); } }
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
        const m = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.85, roughness: 0.25, metalness: 0 });
        m.userData.shared = true; m.userData._cachedShared = true;
        return m;
      });

      // ── Hull floor and ceiling (the ceiling is solid to the sun: light comes only through windows) ──
      const fsize = H * 2 + 6;
      const fm = floorMat.map.clone(); fm.repeat.set(fsize / 4, fsize / 4); fm.needsUpdate = true;
      const fn = floorMat.normalMap.clone(); fn.repeat.copy(fm.repeat); fn.needsUpdate = true;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(fsize, fsize), new THREE.MeshStandardMaterial({ map: fm, normalMap: fn, metalness: .25, roughness: .32 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; floor.receiveShadow = true; floor.raycast = () => {}; kit.deco(floor);
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(fsize, fsize), plain("hr-ceil", 0x1c2432, { rough: .75, metal: .3 }));
      ceil.material.shadowSide = THREE.DoubleSide; ceil.material.side = THREE.DoubleSide;
      ceil.rotation.x = Math.PI / 2; ceil.position.y = 12; ceil.castShadow = true; ceil.receiveShadow = true; ceil.raycast = () => {}; kit.deco(ceil);
      // The rendered roof is a solid ceiling; keep jet-harness movement from passing through it.
      hitbox(fsize, 0.24, fsize, 0, 12, 0);

      // ── Outer hull with big windows onto space ────────────────────────────────────────
      const wh = 12, th = 1.2;
      const holes = [{ at: 7, w: 8, h: 4, sill: 2.2 }, { at: 27, w: 8, h: 4, sill: 2.2 }, { at: 47, w: 8, h: 4, sill: 2.2 }];
      kit.wallRun(-H - th / 2, -H - th / 2, H + th / 2, -H - th / 2, wh, th, hullDark, holes);
      kit.wallRun(-H - th / 2, H + th / 2, H + th / 2, H + th / 2, wh, th, hullDark, holes);
      kit.wallRun(-H - th / 2, -H, -H - th / 2, H, wh, th, hullDark, holes);
      kit.wallRun(H + th / 2, -H, H + th / 2, H, wh, th, hullDark, holes);
      const frames = kit.batch(3);
      for (const at of [7, 27, 47]) {
        // [centre x, centre z, along x?]
        for (const [cx, cz, alongX] of [[-H - th / 2 + at + 4, -H - th / 2, true], [-H - th / 2 + at + 4, H + th / 2, true], [-H - th / 2, -H + at + 4, false], [H + th / 2, -H + at + 4, false]]) {
          kit.proxy(alongX ? 8 : 0.2, 4, alongX ? 0.2 : 8, cx, 2.2, cz);             // what stops you; the glass itself is below
          kit.shotBlocker(alongX ? 8 : 0.2, 4, alongX ? 0.2 : 8, cx, 2.2, cz);
          const pane = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), glass);
          pane.position.set(cx, 4.2, cz); if (!alongX) pane.rotation.y = Math.PI / 2; pane.raycast = () => {}; pane.renderOrder = 4; kit.deco(pane);
          // Frame: a deep bezel, a mullion each way, and a sill.
          const put = (w, h, d, ox, oy) => alongX ? frames.box(w, h, d, cx + ox, 4.2 + oy, cz) : frames.box(d, h, w, cx, 4.2 + oy, cz + ox);
          put(8.4, 0.3, 0.7, 0, 2.05); put(8.4, 0.3, 0.7, 0, -2.05); put(0.3, 4.4, 0.7, -4.05, 0); put(0.3, 4.4, 0.7, 4.05, 0);
          put(0.14, 4, 0.5, -1.35, 0); put(0.14, 4, 0.5, 1.35, 0); put(8, 0.14, 0.5, 0, 0);
          put(8.6, 0.12, 1.15, 0, -2.2);
        }
      }
      kit.deco(frames.mesh(steel, { shadow: true }));

      // ── Outside: the station's solar wings and a mast, seen through the glass ───────────
      const wings = kit.batch(2), booms = kit.batch(2);
      const wing = (x, y, z, alongX, len, tilt) => {
        const dir = alongX ? Math.sign(x) : Math.sign(z);
        const bx = alongX ? x + dir * len / 2 : x, bz = alongX ? z : z + dir * len / 2;
        booms.box(alongX ? len : 0.5, 0.5, alongX ? 0.5 : len, bx, y, bz);
        hitbox(alongX ? len : 0.5, 0.5, alongX ? 0.5 : len, bx, y, bz);
        for (const s of [-1, 1]) {
          const geo = new THREE.BoxGeometry(alongX ? 5.5 : 7.4, 0.14, alongX ? 7.4 : 5.5);
          const m = new THREE.Mesh(geo, solarMat);
          const px = alongX ? x + dir * len * 0.78 : x + s * 4.6, pz = alongX ? z + s * 4.6 : z + dir * len * 0.78;
          const angle = tilt * s;
          m.position.set(px, y, pz); if (alongX) m.rotation.x = angle; else m.rotation.z = -angle; m.castShadow = true; m.raycast = () => {}; kit.deco(m);
          // Axis-aligned bounds of each tilted panel, rather than a broad wing-sized proxy.
          // Panels sway by up to 0.08 rad after spawn; enclose that sweep as well.
          const maxAngle = Math.abs(tilt) + 0.08;
          const c = Math.cos(maxAngle), sn = Math.sin(maxAngle);
          const panelW = alongX ? 5.5 : 7.4, panelD = alongX ? 7.4 : 5.5;
          const boundW = alongX ? panelW : Math.max(panelW, panelW * c + 0.14 * sn);
          const boundD = alongX ? Math.max(panelD, panelD * c + 0.14 * sn) : panelD;
          const boundH = 0.14 * c + (alongX ? panelD : panelW) * sn;
          hitbox(boundW, boundH, boundD, px, y, pz);
          const ref = m; ref.userData.spin = { alongX, s, tilt };
          world.tick((dt, t) => { const a = tilt + Math.sin(t * 0.03 + x + z) * 0.08; if (alongX) m.rotation.x = a * s; else m.rotation.z = -a * s; });
        }
      };
      for (const z of [-23, -3, 17]) { wing(-H - 8, 4.5 + (z % 5), z, true, 16 + (z % 7), 0.3); wing(H + 8, 4 + (z % 3), z + 2, true, 14, -0.25); }
      for (const x of [-23, -3, 17]) { wing(x, 5 + (x % 4), -H - 8, false, 15 + (x % 6), 0.28); wing(x + 2, 4.5, H + 8, false, 13, -0.3); }
      kit.deco(booms.mesh(steel, { shadow: true }));
      // A dish on a mast off the north-east.
      const dish = new THREE.Mesh(new THREE.SphereGeometry(3.4, 28, 12, 0, TAU, 0, 0.9), plain("hr-dish", 0xdfe5ec, { metal: .5, rough: .3, side: THREE.DoubleSide }));
      dish.material.side = THREE.DoubleSide; dish.position.set(14, 8, -48); dish.rotation.set(-1.9, 0.2, 0); dish.raycast = () => {}; kit.deco(dish);
      dish.updateMatrixWorld(true);
      const dishBounds = new THREE.Box3().setFromObject(dish), dishSize = dishBounds.getSize(new THREE.Vector3()), dishCenter = dishBounds.getCenter(new THREE.Vector3());
      hitbox(dishSize.x, dishSize.y, dishSize.z, dishCenter.x, dishCenter.y, dishCenter.z);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 9, 10), steel); mast.position.set(14, 3.5, -48); mast.raycast = () => {}; kit.deco(mast);
      hitbox(0.6, 9, 0.6, 14, 3.5, -48);

      // ── The atrium ───────────────────────────────────────────────────────────────────
      const A = 14, aw = 1.0, ah = 7;
      const lampOn = new THREE.MeshBasicMaterial({ color: 0x50ff90 });
      const door = (cx, cz, alongX, phase) => {
        // Two sliding leaves in a 4 m opening; closed for 4 s of every 9.
        const leaves = [-1, 1].map((s) => {
          const w = alongX ? 2.35 : 0.5, d = alongX ? 0.5 : 2.35;
          const m = kit.box(w, 3.6, d, cx + (alongX ? s * 1.18 : 0), 0, cz + (alongX ? 0 : s * 1.18), orange);
          return { s, m };
        });
        const closed = (t) => ((t + phase) % 9) < 4;
        const amount = (t) => { const c = (t + phase) % 9; return c < 4 ? 0 : c < 4.6 ? (c - 4) / 0.6 : c < 8.4 ? 1 : 1 - (c - 8.4) / 0.6; };
        for (const { s, m } of leaves) {
          world.mover({
            mesh: m, box: m.userData.wallBox, size: [alongX ? 2.35 : 0.5, 3.6, alongX ? 0.5 : 2.35], home: new THREE.Vector3(cx + (alongX ? s * 1.18 : 0), 1.8, cz + (alongX ? 0 : s * 1.18)),
            path: (t) => { const a = amount(t) * 2.25; return { x: alongX ? s * a : 0, y: 0, z: alongX ? 0 : s * a }; }, carry: false,
          });
        }
        // A lintel over the doorway carrying the status lamps (lit boxes, one each side).
        const lintel = kit.batch(2);
        lintel.box(alongX ? 4.6 : 0.9, 0.5, alongX ? 0.9 : 4.6, cx, 3.95, cz);
        hitbox(alongX ? 4.6 : 0.9, 0.5, alongX ? 0.9 : 4.6, cx, 3.95, cz);
        kit.deco(lintel.mesh(hullDark, { shadow: true }));
        const lamps = [1, -1].map((s) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(alongX ? 0.4 : 0.12, 0.26, alongX ? 0.12 : 0.4), new THREE.MeshBasicMaterial({ color: 0x50ff90 }));
          m.position.set(cx + (alongX ? 0 : 0.46 * s), 3.95, cz + (alongX ? 0.46 * s : 0)); m.raycast = () => {}; kit.deco(m);
          return m;
        });
        world.tick((dt, t) => {
          const c = (t + phase) % 9;
          const warn = c >= 3.0 && c < 4 || c >= 8.4;
          const col = closed(t) ? 0xff4a3a : warn ? 0xffc040 : 0x50ff90;
          for (const l of lamps) l.material.color.setHex(warn && Math.floor(t * 6) % 2 ? 0x332200 : col);
        });
      };
      void lampOn;
      // Atrium walls: [sideOffset] with fixed doorways at ±9.5 and a timed airlock at the middle.
      const atriumSide = (alongX, fixed) => {
        const from = -A, to = A;
        const hs = [{ at: 3.2, w: 2.6, h: 3.2 }, { at: 22.2, w: 2.6, h: 3.2 }, { at: A - 2.3, w: 4.6, h: 3.6 }];
        if (alongX) kit.wallRun(from, fixed, to, fixed, ah, aw, hullLight, hs);
        else kit.wallRun(fixed, from, fixed, to, ah, aw, hullLight, hs);
      };
      atriumSide(true, -A); atriumSide(true, A); atriumSide(false, -A); atriumSide(false, A);
      door(0, -A, true, 0); door(0, A, true, 4.5); door(-A, 0, false, 2.2); door(A, 0, false, 6.7);

      // Reactor core: a low pedestal you can climb, a column through the middle, a glowing sleeve in a cage.
      kit.box(5, 1.0, 5, 0, 0, 0, hullDark);
      kit.box(1.4, 11, 1.4, 0, 1.0, 0, hullDark);
      const cage = kit.batch(2);
      for (let k = 0; k < 8; k++) {
        const a = k / 8 * TAU, x = Math.cos(a) * 3.25, z = Math.sin(a) * 3.25;
        cage.cyl(0.1, 0.1, 10.8, x, 6.4, z, 8);
        hitbox(0.22, 10.8, 0.22, x, 6.4, z);
      }
      cage.cyl(3.7, 3.7, 0.3, 0, 1.15, 0, 32).cyl(3.7, 3.7, 0.3, 0, 11.7, 0, 32);
      for (const y of [3.2, 5.6, 8.0, 10.2]) cage.cyl(3.35, 3.35, 0.12, 0, y, 0, 32);
      kit.deco(cage.mesh(steel, { shadow: true }));
      const ring = (y, c) => { const t = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.12, 8, 40), c); t.rotation.x = Math.PI / 2; t.position.y = y; t.raycast = () => {}; kit.deco(t); return t; };
      const rings = [ring(1.6, cyan), ring(4.2, cyan), ring(6.8, cyan)];
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 10.8, 18), glowing("hr-beam", 0x7fe6ff, 2.8));
      beam.position.y = 6.4; beam.raycast = () => {};
      kit.deco(beam);
      const coreLight = new THREE.PointLight(0x6fdcff, 110, 34, 2); coreLight.position.set(0, 5.5, 0); kit.light(coreLight);
      // The floor around it carries a hazard band marking the pulse radius, and signs say why.
      const hz = document.createElement("canvas"); hz.width = 512; hz.height = 32;
      { const g = hz.getContext("2d"); g.fillStyle = "#1a1c20"; g.fillRect(0, 0, 512, 32); g.fillStyle = "#e8b820"; for (let x = -32; x < 544; x += 64) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 32, 0); g.lineTo(x + 64, 0); g.lineTo(x + 32, 32); g.fill(); } }
      const hzTex = new THREE.CanvasTexture(hz); hzTex.colorSpace = THREE.SRGBColorSpace; hzTex.wrapS = THREE.RepeatWrapping; hzTex.repeat.set(10, 1);
      const band = new THREE.Mesh(new THREE.RingGeometry(8.0, 8.5, 96, 1), new THREE.MeshStandardMaterial({ map: hzTex, roughness: .6, metalness: .1, side: THREE.DoubleSide }));
      band.rotation.x = -Math.PI / 2; band.position.y = 0.025; band.raycast = () => {}; band.receiveShadow = true; kit.deco(band);
      for (const [x, z, ry] of [[0, -(A - 0.58), 0], [0, A - 0.58, Math.PI], [-(A - 0.58), 0, Math.PI / 2], [A - 0.58, 0, -Math.PI / 2]]) {
        const sign = kit.textSign("REACTOR PULSE · TAKE THE GANTRY", 5, 0.9, { fg: "#111", bg: "#e8b820", border: "#111", font: "bold 40px sans-serif" });
        sign.position.set(x, 3.4, z); sign.rotation.y = ry; kit.deco(sign);
      }
      // The pulse: charges for 3 s, bursts for 1 s, every 24 s. Floor level only.
      const pulseAt = (t) => t % 24;
      world.zone({ kind: "damage", x: 0, z: 0, r: 8.4, w: 16.8, d: 16.8, y0: 0, h: 2.6, amount: 42, rate: 0.6, label: "reactor pulse", active: (t) => { const c = pulseAt(t); return c >= 21 && c < 22; } });
      const wave = new THREE.Mesh(new THREE.RingGeometry(1, 1.4, 48), new THREE.MeshBasicMaterial({ color: 0x8ff0ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false }));
      wave.rotation.x = -Math.PI / 2; wave.position.y = 0.2; wave.raycast = () => {}; kit.deco(wave);
      world.tick((dt, t) => {
        const c = pulseAt(t);
        const charge = c >= 18 && c < 21 ? (c - 18) / 3 : 0;
        beam.material.emissiveIntensity = 2.8 + charge * 3 + (c >= 21 && c < 22 ? 4 : 0);
        coreLight.intensity = 110 + charge * 160;
        rings.forEach((r, i) => { r.position.y = 1.6 + ((i * 2.6 + t * (0.4 + charge)) % 7.8) ; r.rotation.z = t * 0.5; });
        if (c >= 21 && c < 22.6) { const u = (c - 21) / 1.6; wave.material.opacity = (1 - u) * 0.85; wave.scale.setScalar(1 + u * 8); } else wave.material.opacity = 0;
      });
      // Low gravity in the atrium.
      world.zone({ kind: "lowgrav", x: 0, z: 0, r: 7.6, w: 15.2, d: 15.2, y0: 0, h: 8, gravity: 0.32 });

      // Gantry ring a storey up (inside the atrium walls), reached by four gravity lifts.
      const gy = 4.5, gw = 3, gi = A - aw / 2 - gw / 2;
      kit.box(A * 2 - 1, 0.4, gw, 0, gy - 0.4, -gi, steel); kit.box(A * 2 - 1, 0.4, gw, 0, gy - 0.4, gi, steel);
      kit.box(gw, 0.4, A * 2 - 1 - gw * 2, -gi, gy - 0.4, 0, steel); kit.box(gw, 0.4, A * 2 - 1 - gw * 2, gi, gy - 0.4, 0, steel);
      const gr = A - aw / 2 - gw;   // inner edge
      for (const sgn of [-1, 1]) for (const [a, b] of [[-gr, -2], [2, gr]]) {
        kit.box(b - a, 1.0, 0.14, (a + b) / 2, gy, sgn * gr, steel);      // gaps at the lifts
        kit.box(0.14, 1.0, b - a, sgn * gr, gy, (a + b) / 2, steel);
      }
      const gp = kit.batch(3);
      for (const [x, z] of [[-gr, -gr], [gr, -gr], [-gr, gr], [gr, gr], [0, -gr], [0, gr], [-gr, 0], [gr, 0]]) {
        gp.box(0.5, gy - 0.4, 0.5, x, (gy - 0.4) / 2, z);
        hitbox(0.5, gy - 0.4, 0.5, x, (gy - 0.4) / 2, z);
      }
      kit.deco(gp.mesh(hullDark, { shadow: true }));
      const lifts = [[-9.5, 0], [9.5, 0], [0, -9.5], [0, 9.5]];
      const lifters = [];
      const collar = kit.batch(2), padRing = kit.batch(2);
      for (const [x, z] of lifts) {
        world.zone({ kind: "updraft", x, z, r: 1.5, w: 3, d: 3, y0: 0, h: 4.8, lift: 24 });
        world.zone({ kind: "launch", x, z, r: 1.4, w: 2.8, d: 2.8, y0: 0, h: 0.5, vertical: 5 });
        // A square glass booth, open on the side that faces the gantry: three solid panes you cannot pass, steel posts,
        // a frame on top and a lit pad. The glass is the collider (invisible boxes), so what you see is what stops you.
        const ox = Math.abs(x) > 1 ? Math.sign(x) : 0, oz = Math.abs(z) > 1 ? Math.sign(z) : 0;
        const walls = ox
          ? [[x - ox * 1.44, z, true], [x, z - 1.44, false], [x, z + 1.44, false]]    // [centre x, centre z, normal is x]
          : [[x, z - oz * 1.44, false], [x - 1.44, z, true], [x + 1.44, z, true]];
        for (const [wx, wz, nx] of walls) {
          kit.proxy(nx ? 0.12 : 3.0, 4.8, nx ? 3.0 : 0.12, wx, 0, wz);
          kit.shotBlocker(nx ? 0.12 : 3.0, 4.8, nx ? 3.0 : 0.12, wx, 0, wz);
          const pane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.6), glass);
          pane.position.set(wx, 2.5, wz); if (nx) pane.rotation.y = Math.PI / 2; pane.raycast = () => {}; pane.renderOrder = 4; kit.deco(pane);
        }
        for (const [px, pz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) {
          collar.box(0.16, 4.9, 0.16, x + px, 2.45, z + pz);
          hitbox(0.16, 4.9, 0.16, x + px, 2.45, z + pz);
        }
        for (const [w, h, d, px, py, pz] of [
          [3.3, 0.14, 0.16, x, 4.95, z - 1.5], [3.3, 0.14, 0.16, x, 4.95, z + 1.5],
          [0.16, 0.14, 3.3, x - 1.5, 4.95, z], [0.16, 0.14, 3.3, x + 1.5, 4.95, z],
        ]) {
          collar.box(w, h, d, px, py, pz);
          hitbox(w, h, d, px, py, pz);
        }
        collar.box(3.4, 0.16, 3.4, x, 0.08, z);
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.05, 2.7), cyan); base.position.set(x, 0.185, z); base.raycast = () => {}; kit.deco(base);
        const motes = [];
        for (let k = 0; k < 8; k++) { const s = sprite(0xbfeaff, 0.3, x, 1, z, 0.8); kit.deco(s); motes.push(s); }
        lifters.push({ x, z, motes });
      }
      kit.deco(collar.mesh(steel, { shadow: true }));
      world.tick((dt, t) => { for (const l of lifters) l.motes.forEach((s, k) => { const u = (t * 0.55 + k / 8) % 1; s.position.set(l.x + Math.cos(k * 2.4 + t) * 0.8, 0.3 + u * 4.6, l.z + Math.sin(k * 2.4 + t) * 0.8); s.material.opacity = 0.85 * Math.sin(u * Math.PI); }); });

      // ── Docking bays (N, S, W, E) ────────────────────────────────────────────────────
      const bayParts = kit.batch(3), ribs = kit.batch(2), ribsDark = kit.batch(2);
      const bay = (cx, cz, alongZ, flip) => {
        const bw = 16, bd = 18;       // across the atrium wall x depth
        const w = alongZ ? bw : bd, d = alongZ ? bd : bw;
        const z0 = cz - d / 2, z1 = cz + d / 2, x0 = cx - w / 2, x1 = cx + w / 2;
        // Side walls with a doorway each; the outer end is the hull.
        if (alongZ) {
          kit.wallRun(x0, z0, x0, z1, 6, 0.8, hullLight, [{ at: 4, w: 2.8, h: 3.2 }]);
          kit.wallRun(x1, z0, x1, z1, 6, 0.8, hullLight, [{ at: 11, w: 2.8, h: 3.2 }]);
        } else {
          kit.wallRun(x0, z0, x1, z0, 6, 0.8, hullLight, [{ at: 4, w: 2.8, h: 3.2 }]);
          kit.wallRun(x0, z1, x1, z1, 6, 0.8, hullLight, [{ at: 11, w: 2.8, h: 3.2 }]);
        }
        // Cargo: stacked containers (solid, with corrugated sides) and a docked shuttle.
        const put = (a, b, w2, h2, d2, y, m) => kit.box(alongZ ? w2 : d2, h2, alongZ ? d2 : w2, cx + (alongZ ? a : b), y, cz + (alongZ ? b : a), m);
        const rib = (a, b, w2, h2, d2, y, batch) => {   // vertical corrugation on the two long sides
          const lw = alongZ ? w2 : d2, ld = alongZ ? d2 : w2, px = cx + (alongZ ? a : b), pz = cz + (alongZ ? b : a);
          const along = ld >= lw;
          const n = Math.floor((along ? ld : lw) / 0.28);
          for (let i = 0; i < n; i++) {
            const u = -(along ? ld : lw) / 2 + 0.14 + i * 0.28;
            for (const s of [-1, 1]) {
              if (along) batch.box(0.06, h2 - 0.1, 0.12, px + s * (lw / 2 + 0.02), y + h2 / 2, pz + u);
              else batch.box(0.12, h2 - 0.1, 0.06, px + u, y + h2 / 2, pz + s * (ld / 2 + 0.02));
            }
          }
        };
        put(-5, -5, 2.4, 2.6, 6, 0, orange); put(-5, -5, 2.4, 2.6, 6, 2.6, teal); put(5.4, 5, 2.4, 2.6, 6, 0, teal);
        put(-1.6, 6, 2.4, 1.3, 2.4, 0, hullDark); put(2.5, -6.5, 2.4, 2.6, 5, 0, orange);
        rib(-5, -5, 2.4, 2.6, 6, 0, ribs); rib(-5, -5, 2.4, 2.6, 6, 2.6, ribsDark); rib(5.4, 5, 2.4, 2.6, 6, 0, ribsDark); rib(2.5, -6.5, 2.4, 2.6, 5, 0, ribsDark);
        // The shuttle: a solid core you can't pass (the hull block), dressed as a small ship.
        // Match the full shuttle silhouette, including the lateral wings and nose/engines.
        kit.proxy(alongZ ? 7.2 : 8.6, 3.1, alongZ ? 8.6 : 7.2, cx, 0, cz);
        const ship = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.0, 3.4, 8, 20), hullLight); body.rotation.x = Math.PI / 2; body.position.y = 1.35; body.scale.set(1.05, 1, 0.85);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 14), hullLight); nose.scale.set(1.05, 0.85, 1.4); nose.position.set(0, 1.35, 2.7);
        const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 12, 0, TAU, 0, Math.PI / 2), glass); cockpit.scale.set(1, 0.7, 1.5); cockpit.position.set(0, 1.9, 2.15); cockpit.renderOrder = 4;
        kit.shotSurface(cockpit);
        const wingGeo = new THREE.BoxGeometry(2.6, 0.12, 2.2);
        const wl = new THREE.Mesh(wingGeo, hullDark), wr = new THREE.Mesh(wingGeo, hullDark);
        wl.position.set(-2.1, 1.1, -0.5); wr.position.set(2.1, 1.1, -0.5); wl.rotation.z = 0.06; wr.rotation.z = -0.06;
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 1.4), orange); fin.position.set(0, 2.4, -2.5);
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.1, 5.6), orange); stripe.position.set(0, 1.35, -0.3); stripe.scale.set(1, 1, 1);
        ship.add(body, nose, cockpit, wl, wr, fin);
        for (const s of [-1, 1]) { const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 1.4, 14), steel); eng.rotation.x = Math.PI / 2; eng.position.set(s * 1.0, 1.0, -3.3); ship.add(eng); const glow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), cyan); glow.position.set(s * 1.0, 1.0, -4.01); glow.rotation.y = Math.PI; ship.add(glow); const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), steel); leg.position.set(s * 1.5, 0.45, 1.4); ship.add(leg); const leg2 = leg.clone(); leg2.position.z = -1.8; ship.add(leg2); }
        void stripe;
        ship.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.raycast = () => {}; } });
        ship.position.set(cx, 0, cz);
        ship.rotation.y = alongZ ? (flip ? 0 : Math.PI) : (flip ? Math.PI / 2 : -Math.PI / 2);
        kit.deco(ship);
        // Strip lights along the bay roof, and one lamp to light it.
        const sl = kit.batch(2); sl.box(alongZ ? 0.4 : d - 4, 0.12, alongZ ? d - 4 : 0.4, cx, 5.95, cz); kit.deco(sl.mesh(white));
        const bl = new THREE.PointLight(0xdff0ff, 36, 22, 2); bl.position.set(cx, 5, cz); kit.light(bl);
      };
      bay(0, -23.5, true, true); bay(0, 23.5, true, false); bay(-23.5, 0, false, false); bay(23.5, 0, false, true);
      void bayParts;
      kit.deco(ribs.mesh(orange, { shadow: true })); kit.deco(ribsDark.mesh(teal, { shadow: true }));

      // ── Crew modules in the corners ───────────────────────────────────────────────────
      const bunks = kit.batch(2), sheets = kit.batch(2), lamps = kit.batch(2);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const cx = sx * 25, cz = sz * 25, w = 11, d = 11;
        const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
        kit.wallRun(x0, z0, x1, z0, 4.4, 0.7, teal, sz < 0 ? [] : [{ at: 4, w: 2.8, h: 3 }]);
        kit.wallRun(x0, z1, x1, z1, 4.4, 0.7, teal, sz > 0 ? [] : [{ at: 4, w: 2.8, h: 3 }]);
        kit.wallRun(x0, z0, x0, z1, 4.4, 0.7, teal, sx < 0 ? [{ at: 3, w: 2, h: 1.4, sill: 1.2 }] : [{ at: 4, w: 2.8, h: 3 }]);
        kit.wallRun(x1, z0, x1, z1, 4.4, 0.7, teal, sx > 0 ? [{ at: 3, w: 2, h: 1.4, sill: 1.2 }] : [{ at: 4, w: 2.8, h: 3 }]);
        kit.box(w + 0.7, 0.4, d + 0.7, cx, 4.4, cz, hullDark);
        // Furniture: bunks (with a mattress and a pillow), a console wall and a table.
        kit.box(1.0, 1.0, 3, cx - 3.5, 0, cz - 2.5, orange); kit.box(1.0, 1.0, 3, cx - 3.5, 0, cz + 2.5, orange);
        for (const dz of [-2.5, 2.5]) {
          sheets.box(0.9, 0.18, 2.7, cx - 3.5, 1.09, cz + dz);
          hitbox(0.9, 0.18, 2.7, cx - 3.5, 1.09, cz + dz);
          sheets.box(0.8, 0.14, 0.5, cx - 3.5, 1.25, cz + dz - 1.0);
          hitbox(0.8, 0.14, 0.5, cx - 3.5, 1.25, cz + dz - 1.0);
        }
        kit.box(4, 1.0, 1.0, cx + 1, 0, cz - 4.5, steel); kit.box(1.8, 0.9, 1.8, cx + 2.2, 0, cz + 1.5, hullDark);
        // A bank of three monitors on the wall over the console, each showing its own readout, with a keyboard below.
        [-1.15, 0, 1.15].forEach((ox, k) => {
          const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.74, 0.1), hullDark); bezel.position.set(cx + 1 + ox, 1.75, cz - 5.0); bezel.raycast = () => {}; bezel.castShadow = true; kit.deco(bezel);
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.62), screens[k]); screen.position.set(cx + 1 + ox, 1.75, cz - 4.94); screen.raycast = () => {}; kit.deco(screen);
        });
        const keys = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.26), hullDark); keys.position.set(cx + 0.4, 1.03, cz - 4.2); keys.raycast = () => {}; kit.deco(keys);
        lamps.box(3.2, 0.1, 0.6, cx, 4.28, cz - 1.5).box(3.2, 0.1, 0.6, cx, 4.28, cz + 1.5);   // ceiling lamp panels
        bunks.box(0.3, 1.6, 0.5, cx - 4.8, 0.8, cz + 4.3);   // a locker
        hitbox(0.3, 1.6, 0.5, cx - 4.8, 0.8, cz + 4.3);
      }
      kit.deco(sheets.mesh(plain("hr-sheet", 0xdfe6ee, { rough: .95 }), { shadow: true }));
      kit.deco(lamps.mesh(white)); kit.deco(bunks.mesh(steel, { shadow: true }));

      // ── Overhead: ceiling strips, pipes, cargo rails ──────────────────────────────────
      const strips = kit.batch(2);
      for (let x = -28; x <= 28; x += 14) strips.box(0.35, 0.1, H * 2 - 4, x, 11.9, 0);
      for (let z = -28; z <= 28; z += 14) strips.box(H * 2 - 4, 0.1, 0.35, 0, 11.8, z);
      kit.deco(strips.mesh(white));
      const pipes = kit.batch(3);
      for (const x of [-30, 30]) {
        pipes.cyl(0.4, 0.4, H * 2, x, 10.8, 0, 10, Math.PI / 2, 0, 0);
        hitbox(0.8, 0.8, H * 2, x, 10.8, 0);
        for (let z = -30; z <= 30; z += 10) {
          pipes.box(0.9, 0.12, 0.2, x, 10.8, z).box(0.12, 0.8, 0.2, x - 0.4, 11.2, z).box(0.12, 0.8, 0.2, x + 0.4, 11.2, z);
          hitbox(0.9, 0.12, 0.2, x, 10.8, z);
          hitbox(0.12, 0.8, 0.2, x - 0.4, 11.2, z);
          hitbox(0.12, 0.8, 0.2, x + 0.4, 11.2, z);
        }
      }
      pipes.box(H * 2, 0.6, 0.6, 0, 11.5, -30).box(H * 2, 0.6, 0.6, 0, 11.5, 30);
      hitbox(H * 2, 0.6, 0.6, 0, 11.5, -30);
      hitbox(H * 2, 0.6, 0.6, 0, 11.5, 30);
      kit.deco(pipes.mesh(hullDark, { shadow: true }));
      // Atrium wall light panels.
      const pan = kit.batch(2);
      for (const s of [-1, 1]) { pan.box(8, 0.5, 0.15, 0, 5.4, s * (A - 0.55)); pan.box(0.15, 0.5, 8, s * (A - 0.55), 5.4, 0); }
      kit.deco(pan.mesh(cyan));
      void rnd; void group;
    },
  };
}
