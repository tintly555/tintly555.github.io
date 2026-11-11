/*
 * SUNKEN TEMPLE — jungle ruins in full daylight. A stepped pyramid with a shrine on top rises from
 * a shallow, gravel-bedded stream that rings it; four stone causeways cross the water. Round it:
 * watchtowers, broken walls, spike plates that cycle, and two stone lanes where a boulder rolls on
 * a timer. The whole place stands in a forest: branching trees with leaf canopies, ferns, reeds,
 * hanging vines and roots over the stonework, lit by a real sun that casts shadows.
 *
 *   stream        wading is slow (and loud); the causeways are dry
 *   spike plates  the spikes stir and rattle, then rise for two seconds
 *   boulders      one lane each side, a dust cloud and a rumble before it rolls
 */
import { templeWaterBank } from "./water-shape.js";

// Cover pieces, listed up here so trees and plants can keep clear of them.
const WALLS = [
  [-14, 31, 9, 2.6, 1], [14, -31, 9, 2.6, 1], [-31, -14, 1, 2.6, 9], [31, 14, 1, 2.6, 9],
  [-33, 8, 6, 1.5, 1], [33, -8, 6, 1.5, 1], [8, 33, 1, 1.5, 6], [-8, -33, 1, 1.5, 6],
];
const DRUMS = [[-19, -26, true], [19, 26, true], [-26, 19, false], [26, -19, false], [-31, -3, false], [31, 3, false]];
const STELAE = [[-18.5, -9], [18.5, 9], [-9, 18.5], [9, -18.5], [-28, 10], [28, -10], [-10, -28], [10, 28]];
// Raised banks of earth round the pyramid: high ground, reached by slopes (x, z, w, d, ramp sides).
const MOUNDS = [[17, 8.5, 3, 7, ["E", "N"]], [-17, -8.5, 3, 7, ["W", "S"]], [-8.5, 17, 7, 3, ["S", "E"]], [8.5, -17, 7, 3, ["N", "W"]]];
const SPAWNS = [
  [-33.6, -22], [33.6, 22], [-33.6, 22], [33.6, -22], [-22, -33.6], [22, 33.6], [22, -33.6], [-22, 33.6],
  [-17.5, 6], [17.5, -6], [6, 17.5], [-6, -17.5], [-33.6, 0], [33.6, 0], [0, -33.6], [0, 33.6],
];

export function ruins(core) {
  const { THREE, surfaces, mat, plain, sprite, TAU, rngFor } = core;
  const H = 38;

  return {
    id: "pvp_ruins",
    name: "SUNKEN TEMPLE",
    tag: "Jungle ruins · stream, rolling boulder",
    half: H,
    spawns: SPAWNS,
    env: {
      bg: 0xa9c9cc, fog: 0xa9c9cc, fogNear: 30, fogFar: 250, bright: true,
      hemi: [0xcfe4f6, 0x58653b, 0.8], sun: [0xfff0d2, 3.4, [-34, 52, 24]], shadow: 62, envIntensity: 0.85,
      sky: { sun: [-34, 52, 24], zenith: 0x3b78bf, horizon: 0xb4d2d4, ground: 0x52623c, sunColor: 0xfff0cf, cloud: 0.5 },
      look: { tint: 0xfff6e2, vignette: 0.26, bloom: 0.3, threshold: 1.3, saturation: 1.08 },
    },
    preview: { eye: 1.7, path: [[-35, 14], [-26, 8], [-24, 0], [-14, 0], [-14, -14], [0, -22], [16, -16], [24, 0], [18, 14], [0, 24], [-18, 22], [-35, 14]] },

    build(kit, host) {
      const world = host.world;
      const N = kit.nature();
      const rnd = rngFor(91), srnd = rngFor(2024);   // gameplay layout / scenery
      const group = new THREE.Group();
      kit.deco(group);

      const stone = mat("rt-stone", surfaces.stone("rt-stone", { base: [158, 150, 128], moss: .55, blocks: 5 }), { tile: 3 });
      const stoneDark = mat("rt-stone-d", surfaces.stone("rt-stone-d", { base: [112, 108, 98], moss: .85, blocks: 4 }), { tile: 3 });
      const carved = mat("rt-carved", surfaces.stone("rt-carved", { base: [176, 160, 120], moss: .15, blocks: 3 }), { tile: 2.4 });
      const block = mat("rt-block", surfaces.stone("rt-block", { base: [150, 143, 121], moss: .6, blocks: 1 }), { tile: 4 });
      const blockDark = mat("rt-block-d", surfaces.stone("rt-block-d", { base: [118, 114, 102], moss: .9, blocks: 1 }), { tile: 4 });
      const gold = mat("rt-gold", null, { color: 0xd9b24a, metal: .95, rough: .26 });
      const metal = mat("rt-spike", null, { color: 0xb9b4a4, metal: .7, rough: .32 });
      const stoneRock = mat("rt-rock", surfaces.stone("rt-rock", { base: [128, 122, 108], moss: .7, blocks: 1 }), { tile: 2.2 });

      // ── Keep-outs: where trees and plants must not stand ─────────────────────────────
      const rects = [
        [0, 0, 23, 23],
        ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => [sx * 28, sz * 32.5, 12, 6.5]),
        [29.2, 3, 5.5, 34], [-29.2, 3, 5.5, 34],
        [0, 24, 3.6, 4.5], [0, -24, 3.6, 4.5], [24, 0, 4.5, 3.6], [-24, 0, 4.5, 3.6],
        [0, 36.6, 7, 3],
        ...MOUNDS.map(([x, z, w, d]) => [x, z, w / 2 + 3.6, d / 2 + 3.6]),
        ...WALLS.map(([x, z, w, , d]) => [x, z, w / 2 + 2.2, d / 2 + 2.2]),
        ...DRUMS.map(([x, z, long]) => [x, z, (long ? 3.2 : 0.7) + 2, (long ? 0.7 : 3.2) + 2]),
        ...STELAE.map(([x, z]) => [x, z, 2.4, 2.4]),
      ];
      const plates = [[-16, -16], [16, 16], [-16, 16], [16, -16], [-12, -29.5], [12, 29.5]];
      const blocked = (x, z, m = 0) => {
        for (const [cx, cz, hx, hz] of rects) if (Math.abs(x - cx) < hx + m && Math.abs(z - cz) < hz + m) return true;
        for (const [px, pz] of plates) if (Math.hypot(x - px, z - pz) < 3.4 + m) return true;
        return false;
      };
      const nearSpawn = (x, z, r) => SPAWNS.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < r);
      const inWater = (x, z) => templeWaterBank(x, z) > 0;

      // ── Sky is the core's; ground, stream bed ────────────────────────────────────────
      N.ground(group, { size: 230, tile: 6, tint: [1.05, 1.0, 0.92], moss: 0.55 });
      const moatIn = 21, moatOut = 27, mt = moatOut - moatIn;
      N.templeWater(group, world);
      world.zone({ kind: "slow", x: 0, z: 0, w: 58, d: 58, y0: 0, h: .25,
        speed: .55, jump: .8, contains: (p) => inWater(p.x, p.z) });

      // ── Plants and rocks (collected, then merged into a few meshes) ──────────────────
      const bark = new N.Mesher(), leaf = new N.Mesher(), low = new N.Mesher();
      const rockParts = [];
      const rockAt = (x, z, size, squash = 0.7, y = 0) => rockParts.push(N.rock(srnd, stoneRock, { x, y, z, size, squash, detail: 3 }));

      // Perimeter wall: a solid core you cannot pass, dressed with blocks on the inside.
      kit.perimeter(H, 6.5, stoneDark, 1.4);
      const wallBlocks = kit.batch(4);
      const wallEnd = H + 1.4;
      kit.masonry(wallBlocks, srnd, { x0: -wallEnd, z0: -H - 1.4, x1: wallEnd, z1: -H, y0: 0, y1: 6.5, course: 0.65, len: 1.5, thick: 0.3, faces: [0, 1, 0, 0] });
      kit.masonry(wallBlocks, srnd, { x0: -wallEnd, z0: H, x1: wallEnd, z1: H + 1.4, y0: 0, y1: 6.5, course: 0.65, len: 1.5, thick: 0.3, faces: [1, 0, 0, 0] });
      kit.masonry(wallBlocks, srnd, { x0: -H - 1.4, z0: -H, x1: -H, z1: H, y0: 0, y1: 6.5, course: 0.65, len: 1.5, thick: 0.3, faces: [0, 0, 0, 1] });
      kit.masonry(wallBlocks, srnd, { x0: H, z0: -H, x1: H + 1.4, z1: H, y0: 0, y1: 6.5, course: 0.65, len: 1.5, thick: 0.3, faces: [0, 0, 1, 0] });
      // A broken crest: a few stones fallen out of the top course leave gaps and rubble.
      const crest = kit.batch(4);
      for (let i = -H; i < H; i += 1.5) {
        for (const [x, z, ry] of [[i, -H - 0.7, 0], [i, H + 0.7, 0], [-H - 0.7, i, Math.PI / 2], [H + 0.7, i, Math.PI / 2]]) {
          if (srnd() < 0.55) crest.box(1.4, 0.35 + srnd() * 0.5, 1.5, x + (srnd() - 0.5) * 0.3, 6.5 + 0.2 + srnd() * 0.15, z, ry + (srnd() - 0.5) * 0.15);
        }
      }
      kit.deco(wallBlocks.mesh(block, { shadow: true })); kit.deco(crest.mesh(blockDark, { shadow: true }));
      // Ivy and creepers pouring over the wall.
      for (let u = -H + 2; u < H - 1; u += 2.6) {
        const j = () => (srnd() - 0.5) * 1.2, len = 3 + srnd() * 3.4;
        N.vine(bark, leaf, srnd, u + j(), 6.4, -H + 0.12, len, 0, 1); N.vine(bark, leaf, srnd, u + j(), 6.4, H - 0.12, len, 0, -1);
        N.vine(bark, leaf, srnd, -H + 0.12, 6.4, u + j(), len, 1, 0); N.vine(bark, leaf, srnd, H - 0.12, 6.4, u + j(), len, -1, 0);
      }

      // Trees: the ones near the wall stand in the play space (their trunks block), the rest is forest.
      const hTree = (min, max) => min + srnd() * (max - min);
      const planted = [];
      const plant = (x, z, h, collide, dense = 1, crown = 1) => {
        N.tree(bark, leaf, srnd, { x, z, h, lean: 0.07, crown, dense });
        if (collide) kit.proxy(1.1, 9, 1.1, x, 0, z);
        planted.push([x, z]);
      };
      // Ring just inside the wall: side 0/1 = north/south, 2/3 = west/east.
      const ring = (side) => {
        let u = -H + 3 + srnd() * 2;
        while (u < H - 3) {
          const d = 2.6 + srnd() * 3.2;
          const x = side < 2 ? u : (side === 2 ? -(H - d) : H - d), z = side < 2 ? (side === 0 ? -(H - d) : H - d) : u;
          if (!blocked(x, z, 1.2) && !nearSpawn(x, z, 3.2) && !inWater(x, z)) plant(x, z, hTree(14, 19), true, 1, 1.05);
          u += 4.5 + srnd() * 4;
        }
      };
      ring(0); ring(1); ring(2); ring(3);
      // A few more among the ruins, mostly in the band between the stream and the wall.
      for (let i = 0, n = 0; i < 160 && n < 14; i++) {
        const x = (srnd() - 0.5) * 70, z = (srnd() - 0.5) * 70, a = Math.max(Math.abs(x), Math.abs(z));
        if (a < 28 || a > H - 7 || blocked(x, z, 1.5) || nearSpawn(x, z, 3.4)) continue;
        if (planted.some(([px, pz]) => Math.hypot(px - x, pz - z) < 5)) continue;
        plant(x, z, hTree(11, 16), true, 1, 1); n++;
      }
      // The forest beyond the wall: seen over it, and through the gate as a green wall of trunks.
      for (let i = 0, n = 0; i < 900 && n < 120; i++) {
        const x = (srnd() - 0.5) * 210, z = (srnd() - 0.5) * 210, a = Math.max(Math.abs(x), Math.abs(z));
        if (a < H + 4 || a > 100) continue;
        if (planted.some(([px, pz]) => Math.hypot(px - x, pz - z) < 4.5)) continue;
        plant(x, z, hTree(16, 26), false, a > 60 ? 0.5 : 0.7, 1.15); n++;
      }

      // Understory: ferns, grass, shrubs and reeds, kept off the stone and out of the water.
      const clear = (x, z, m) => !blocked(x, z, m) && !inWater(x, z);
      for (let i = 0, n = 0; i < 2400 && n < 360; i++) {
        const x = (srnd() - 0.5) * 120, z = (srnd() - 0.5) * 120;
        if (!clear(x, z, 0.6) || Math.max(Math.abs(x), Math.abs(z)) > H - 1.2 && Math.max(Math.abs(x), Math.abs(z)) < H + 2) continue;
        if (Math.max(Math.abs(x), Math.abs(z)) > H + 2 && Math.max(Math.abs(x), Math.abs(z)) < 41) continue;
        const k = srnd();
        if (k < 0.45) N.fern(low, srnd, x, z, 0.8 + srnd() * 0.8); else if (k < 0.8) N.grass(low, srnd, x, z, 0.8 + srnd() * 0.7); else N.bush(leaf, srnd, x, z, 1 + srnd() * 0.9);
        n++;
      }
      // Reeds along both banks of the stream, and boulders half sunk in it.
      for (const edge of [moatIn - 0.35, moatOut + 0.35]) {
        for (let u = -edge; u < edge; u += 0.8 + srnd() * 1.4) {
          for (const [x, z] of [[u, -edge], [u, edge], [-edge, u], [edge, u]]) {
            if (srnd() < 0.55) continue;
            if (Math.min(Math.abs(Math.abs(x) - 24), Math.abs(Math.abs(z) - 24)) < 3.8 && Math.min(Math.abs(x), Math.abs(z)) < 3.8) continue;   // leave the causeways clear
            N.grass(low, srnd, x + (srnd() - 0.5) * 0.5, z + (srnd() - 0.5) * 0.5, 1.1 + srnd() * 1.0);
          }
        }
      }
      for (let i = 0; i < 70; i++) {
        const side = srnd() * 4 | 0, u = (srnd() - 0.5) * 2 * moatOut, off = moatIn + 0.2 + srnd() * (mt - 0.4);
        const x = side < 2 ? u : (side === 2 ? -off : off), z = side < 2 ? (side === 0 ? -off : off) : u;
        if (Math.min(Math.abs(Math.abs(x) - 24), Math.abs(Math.abs(z) - 24)) < 3.2 && Math.min(Math.abs(x), Math.abs(z)) < 3.8) continue;
        rockAt(x, z, 0.14 + srnd() * 0.3, 0.7, -0.08);
      }
      // Banks: a scatter of stones and pebbles where soil meets water.
      for (let i = 0; i < 160; i++) {
        const edge = srnd() < 0.5 ? moatIn - 0.5 - srnd() * 0.9 : moatOut + 0.5 + srnd() * 0.9, u = (srnd() - 0.5) * 2 * edge, side = srnd() * 4 | 0;
        const x = side < 2 ? u : (side === 2 ? -edge : edge), z = side < 2 ? (side === 0 ? -edge : edge) : u;
        rockAt(x, z, 0.1 + srnd() * 0.22, 0.65, 0);
      }
      // Fallen blocks and boulders around the ruins: cover you can crouch behind. Each has a solid core.
      for (const [x, z, size] of [[-17, -11, 1.5], [17, 11, 1.4], [11, -17, 1.3], [-11, 17, 1.5], [-31, 28, 1.2], [31, -28, 1.2], [-3, 31, 1.1], [3, -31, 1.1]]) {
        if (nearSpawn(x, z, 3) || blocked(x, z, -1)) continue;
        rockAt(x, z, size, 0.75);
        kit.proxy(size * 1.6, size * 1.1, size * 1.6, x, 0, z);
      }
      for (let i = 0; i < 90; i++) {   // boulders and boulder-fields in the forest
        const x = (srnd() - 0.5) * 200, z = (srnd() - 0.5) * 200;
        if (Math.max(Math.abs(x), Math.abs(z)) < H + 3) continue;
        rockAt(x, z, 0.7 + srnd() * 1.8, 0.7 + srnd() * 0.3);
      }
      // A palm or two: the clearing is tropical, not temperate.
      for (const [x, z] of [[-26, 36], [26, -36], [36, 26], [-36, -26], [-4, 35], [5, -36]]) {
        if (!blocked(x, z, 0.5) && !nearSpawn(x, z, 3)) { N.palm(bark, low, srnd, x, z, 7 + srnd() * 3); kit.proxy(0.7, 7, 0.7, x, 0, z); }
      }

      // ── Causeways ────────────────────────────────────────────────────────────────────
      for (const [x, z, alongX] of [[0, -24, false], [0, 24, false], [-24, 0, true], [24, 0, true]]) {
        kit.box(alongX ? 7.4 : 4.6, 0.3, alongX ? 4.6 : 7.4, x, 0, z, stone);
        const post = kit.batch(2);
        for (const s of [-1, 1]) for (const e of [-1, 1]) {
          const px = x + (alongX ? e * 3.4 : s * 2.4), pz = z + (alongX ? s * 2.4 : e * 3.4);
          post.box(0.6, 1.3, 0.6, px, 0.65, pz).box(0.78, 0.16, 0.78, px, 1.34, pz).box(0.7, 0.14, 0.7, px, 0.07, pz);
        }
        kit.deco(post.mesh(carved, { shadow: true }));
      }

      // ── Terrain: banks of earth with slopes up to them ────────────────────────────────
      const earth = mat("rt-earth", N.soil({ key: "soil-m", moss: 0.9 }), { tile: 4 });
      for (const [x, z, w, d, ramps] of MOUNDS) {
        kit.mound({ x, z, w, d, h: 0.9, material: earth, ramps, slope: 2.6 });
        for (let k = 0; k < 4; k++) rockAt(x + (srnd() - 0.5) * w, z + (srnd() - 0.5) * d, 0.18 + srnd() * 0.2, 0.7, 0.9);
      }

      // ── The pyramid ──────────────────────────────────────────────────────────────────
      const tiers = [[13, 2.4], [8.6, 4.8], [4.2, 7.2]];
      const dress = kit.batch(4), cornice = kit.batch(3);
      tiers.forEach(([half, top], i) => {
        const prev = i === 0 ? 0 : tiers[i - 1][1];
        kit.box(half * 2, top - prev, half * 2, 0, prev, 0, i % 2 ? stone : carved);
        kit.masonry(dress, srnd, { x0: -half, z0: -half, x1: half, z1: half, y0: prev, y1: top, course: 0.48, len: 1.2, thick: 0.24, gaps: 0.04 });
        // Below the tier's own top face (coplanar faces flash), but wide enough to overhang it.
        cornice.box(half * 2 + 0.5, 0.2, half * 2 + 0.5, 0, top - 0.13, 0).box(half * 2 + 0.7, 0.12, half * 2 + 0.7, 0, top - 0.33, 0);
        // Stairs on all four faces, 3 m wide, up from the ledge below.
        const outer = half + 4.4;
        for (const [dir, x, z] of [["-x", outer, 0], ["+x", -outer, 0], ["-z", 0, outer], ["+z", 0, -outer]]) {
          kit.stairs({ x, z, dir, w: 3, steps: 8, y0: prev, material: stone });
        }
      });
      kit.deco(dress.mesh(block, { shadow: true })); kit.deco(cornice.mesh(blockDark, { shadow: true }));
      // Roots clutching the stonework and creepers hanging off each ledge.
      const root = (x0, y0, z0, dx, dz, len, r) => {
        let x = x0, y = y0, z = z0;
        const n = 7;
        for (let i = 0; i < n; i++) {
          const nx = x + dx * 0.05 + (srnd() - 0.5) * 0.3 * (dz ? 1 : 0), nz = z + dz * 0.05 + (srnd() - 0.5) * 0.3 * (dx ? 1 : 0), ny = y - len / n;
          bark.tube([x, y, z], [nx, ny, nz], r * (1 - i / n * 0.7), r * (1 - (i + 1) / n * 0.7), 6, 1.2, [0.85, 0.82, 0.78]);
          if (i === 3 && srnd() < 0.7) {
            const fx = nx + (dx ? 0 : (srnd() - 0.5) * 0.9), fz = nz + (dz ? 0 : (srnd() - 0.5) * 0.9);
            bark.tube([nx, ny, nz], [fx, ny - len * 0.35, fz], r * 0.45, r * 0.15, 5, 1.2, [0.85, 0.82, 0.78]);
          }
          x = nx; y = ny; z = nz;
        }
      };
      tiers.forEach(([half, top], i) => {
        const prev = i === 0 ? 0 : tiers[i - 1][1];
        for (let k = 0; k < 10; k++) {
          const u = (srnd() - 0.5) * (half * 2 - 1.5), side = srnd() * 4 | 0, off = half + 0.12;
          if (Math.abs(u) < 1.9) continue;   // not across the stairs
          const x = side < 2 ? u : (side === 2 ? -off : off), z = side < 2 ? (side === 0 ? -off : off) : u;
          const dx = side < 2 ? 0 : (side === 2 ? -1 : 1), dz = side < 2 ? (side === 0 ? -1 : 1) : 0;
          if (srnd() < 0.5) root(x, top - 0.1, z, dx, dz, (top - prev) * (0.7 + srnd() * 0.3), 0.07 + srnd() * 0.07);
          else N.vine(bark, leaf, srnd, x + dx * 0.05, top - 0.15, z + dz * 0.05, (top - prev) * (0.5 + srnd() * 0.5), dx, dz);
        }
      });
      // Carved glyph panels around the first tier (decoration over the blocks).
      const glyph = new THREE.MeshStandardMaterial({ map: N.glyphs(), roughness: 1, metalness: 0 });
      glyph.userData.shared = true; glyph.userData._cachedShared = true;
      // The shrine on top: four pillars, a roof, an altar with a golden idol.
      const shrineY = 7.2;
      for (const [sx, sz] of [[-3.6, -3.6], [3.6, -3.6], [-3.6, 3.6], [3.6, 3.6]]) kit.box(1.1, 3.6, 1.1, sx, shrineY, sz, carved);
      kit.box(9.4, 0.7, 9.4, 0, shrineY + 3.6, 0, stoneDark);
      kit.box(7.4, 0.5, 7.4, 0, shrineY + 4.3, 0, carved);
      kit.box(1.8, 1.1, 1.8, 0, shrineY, 0, stoneDark);
      const shrine = kit.batch(2);
      for (const [sx, sz] of [[-3.6, -3.6], [3.6, -3.6], [-3.6, 3.6], [3.6, 3.6]]) {
        shrine.box(1.4, 0.35, 1.4, sx, shrineY + 0.17, sz).box(1.4, 0.35, 1.4, sx, shrineY + 3.4, sz).box(1.25, 0.12, 1.25, sx, shrineY + 0.4, sz);
      }
      shrine.box(2.3, 0.2, 2.3, 0, shrineY + 1.2, 0).box(9.9, 0.18, 9.9, 0, shrineY + 4.2, 0);
      kit.deco(shrine.mesh(carved, { shadow: true }));
      const lathe = (pts, material, x, y, z, seg = 18) => {
        const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg), material);
        m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; m.raycast = () => {}; kit.deco(m); return m;
      };
      lathe([[0.001, 0], [0.34, 0], [0.4, 0.12], [0.3, 0.4], [0.2, 0.66], [0.3, 0.84], [0.34, 1.08], [0.24, 1.3], [0.2, 1.42], [0.28, 1.5], [0.26, 1.68], [0.14, 1.78], [0.001, 1.8]], gold, 0, shrineY + 1.3, 0);
      { const il = new THREE.PointLight(0xffc870, 9, 11, 2); il.position.set(0, shrineY + 2.4, 0); kit.light(il); }   // the idol is lit by a lamp under the roof, not a sprite the roof would cut
      // Braziers on the lower tier: stone bowls (solid) with a real fire in each and coals glowing below it.
      const fireGroup = new THREE.Group(); kit.deco(fireGroup);
      const braziers = [[-12.2, -12.2], [12.2, -12.2], [-12.2, 12.2], [12.2, 12.2]];
      braziers.forEach(([x, z], i) => {
        lathe([[0.001, 0], [0.3, 0], [0.34, 0.14], [0.2, 0.44], [0.3, 0.62], [0.54, 0.84], [0.5, 0.88], [0.3, 0.72], [0.001, 0.7]], stoneDark, x, 2.4, z, 14);
        kit.proxy(1.1, 0.9, 1.1, x, 2.4, z);
        N.molten(fireGroup, world, new THREE.CircleGeometry(0.4, 16), { x, y: 3.12, z, scale: 3.2, intensity: 0.9, flow: [0.02, 0.02] });
        let light = null;
        if (i === 0 || i === 3) { light = new THREE.PointLight(0xffa860, 16, 17, 2); light.position.set(x, 4.2, z); kit.light(light); }
        N.fire(fireGroup, world, { x, y: 3.18, z, width: 0.95, height: 1.5, light, lightBase: 16 });
      });

      // ── Corner watchtowers ───────────────────────────────────────────────────────────
      const towerDress = kit.batch(4);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const cx = sx * 32.5, cz = sz * 32.5;
        kit.box(7, 3.6, 7, cx, 0, cz, stone);
        kit.masonry(towerDress, srnd, { x0: cx - 3.5, z0: cz - 3.5, x1: cx + 3.5, z1: cz + 3.5, y0: 0, y1: 3.6, course: 0.5, len: 1.2, thick: 0.24 });
        // Stairs up from the courtyard side, along x then onto the top.
        kit.stairs({ x: cx - sx * (3.5 + 6.6), z: cz - sz * 1.5, dir: sx < 0 ? "-x" : "+x", w: 2.4, steps: 12, material: stoneDark });   // the top tread ends at the tower's edge, not inside it
        for (const [px, pz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) kit.box(0.8, 2.6, 0.8, cx + px, 3.6, cz + pz, carved);
        kit.box(7, 0.5, 7, cx, 6.2, cz, stoneDark);
        kit.box(5.4, 0.9, 0.5, cx, 3.6, cz + sz * 3.2, stoneDark);
        for (let k = 0; k < 6; k++) N.vine(bark, leaf, srnd, cx + (srnd() - 0.5) * 6.5, 3.5, cz + (srnd() < 0.5 ? -3.6 : 3.6), 1.5 + srnd() * 1.8, 0, 0);
      }
      kit.deco(towerDress.mesh(block, { shadow: true }));

      // ── Broken walls, fallen columns, stelae: cover ──────────────────────────────────
      const wallDress = kit.batch(4);
      const walls = WALLS;
      for (const [x, z, w, h, d] of walls) {
        kit.box(w, h, d, x, 0, z, stoneDark); kit.box(w * 0.5, h * 0.5, d === 1 ? 1.4 : d * 0.5, x + 0.4, h, z, stone);
        kit.masonry(wallDress, srnd, { x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2, y0: 0, y1: h, course: 0.42, len: 1.0, thick: 0.2, gaps: 0.08 });
        rockAt(x + (srnd() - 0.5) * w, z + (d > w ? 0 : 1) * d, 0.35 + srnd() * 0.3, 0.7);
      }
      kit.deco(wallDress.mesh(block, { shadow: true }));
      // Fallen columns: a long drum lying on its side, with a broken end.
      const drums = kit.batch(2);
      for (const [x, z, long] of DRUMS) {
        kit.box(long ? 6 : 1.4, 1.2, long ? 1.4 : 6, x, 0, z, carved);
        const L = 6.2, r = 0.62;
        for (let k = 0; k < 6; k++) {
          const u = -L / 2 + (k + 0.5) * L / 6;
          if (long) drums.cyl(r + (k % 2) * 0.03, r + (k % 2) * 0.03, L / 6 - 0.03, x + u, 0.66, z, 14, 0, Math.PI / 2); else drums.cyl(r + (k % 2) * 0.03, r + (k % 2) * 0.03, L / 6 - 0.03, x, 0.66, z + u, 14, Math.PI / 2, 0);
        }
      }
      kit.deco(drums.mesh(carved, { shadow: true }));
      // Stelae: tall slabs carved with glyphs, where the ruins' statues stood.
      for (const [x, z] of STELAE) {
        kit.box(1.6, 0.7, 1.6, x, 0, z, carved);
        const face = Math.atan2(-x, -z);   // turned toward the pyramid
        const slab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.5, 0.34), [stone, stone, stone, stone, glyph, glyph]);
        slab.position.set(x, 0.7 + 1.25, z); slab.rotation.y = face; slab.castShadow = slab.receiveShadow = true; slab.raycast = () => {}; kit.deco(slab);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.16, 0.46), carved); cap.position.set(x, 3.38, z); cap.rotation.y = face; cap.castShadow = true; cap.raycast = () => {}; kit.deco(cap);
        kit.proxy(1.0, 2.5, 0.8, x, 0.7, z);
      }

      // ── Spike plates ─────────────────────────────────────────────────────────────────
      plates.forEach(([x, z], i) => {
        const phase = i * 1.7;
        const pad = new THREE.Mesh(new THREE.BoxGeometry(4, 0.14, 4), carved);
        pad.position.set(x, 0.07, z); pad.receiveShadow = true; pad.raycast = () => {}; kit.deco(pad);
        const holes = kit.batch(1), spikes = kit.batch(1);
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
          holes.cyl(0.22, 0.22, 0.02, x + a * 1.1, 0.145, z + b * 1.1, 10);
          spikes.cone(0.17, 1.4, x + a * 1.1, 0.7, z + b * 1.1, 6);
        }
        kit.deco(holes.mesh(plain("rt-hole", 0x0d0c0a, { rough: 1 })));
        const sm = spikes.mesh(metal, { shadow: false });
        sm.position.y = -1.5;
        kit.deco(sm);
        const up = (t) => ((t + phase) % 8) >= 6;
        world.zone({ kind: "damage", x, z, w: 3.8, d: 3.8, y0: 0, h: 1.4, amount: 28, rate: 0.5, label: "spikes", active: up });
        world.tick((dt, t) => {
          const c = (t + phase) % 8;
          // Stirring: the points peek out of their holes and rattle for a second before they rise.
          const stir = c >= 4.8 && c < 5.8 ? 0.16 + Math.sin(t * 50) * 0.02 : 0;
          const rise = c < 5.8 ? 0 : c < 6 ? (c - 5.8) / 0.2 : c < 7.9 ? 1 : Math.max(0, 1 - (c - 7.9) / 0.1);
          sm.visible = rise > 0 || stir > 0;
          sm.position.y = -1.5 + (rise > 0 ? rise * 1.5 : stir);
          sm.position.x = rise === 0 && stir ? Math.sin(t * 61) * 0.012 : 0;
        });
      });

      // ── Boulder lanes ────────────────────────────────────────────────────────────────
      const lanes = [{ x: 29.2, dir: 1, phase: 0 }, { x: -29.2, dir: -1, phase: 15 }];
      for (const lane of lanes) {
        // Lane walls with gaps every ~12 m, and a gate at the starting end.
        const laneDress = kit.batch(4);
        for (let k = 0; k < 4; k++) {
          const wx = lane.x + (lane.x > 0 ? 3.2 : -3.2), wz = -20 + k * 13.5;
          kit.box(0.9, 2.6, 8, wx, 0, wz, stoneDark);
          kit.masonry(laneDress, srnd, { x0: wx - 0.45, z0: wz - 4, x1: wx + 0.45, z1: wz + 4, y0: 0, y1: 2.6, course: 0.45, len: 1.1, thick: 0.2, faces: [1, 1, 1, 1] });
        }
        kit.deco(laneDress.mesh(block, { shadow: true }));
        for (const e of [-1, 1]) kit.box(1.0, 3.8, 1.0, lane.x + e * 2.6, 0, -lane.dir * 28.4, carved);
        const boulderGeo = N.rock(srnd, stoneRock, { x: 0, y: -1.9 * 0.55, z: 0, size: 1.9, squash: 1, detail: 4 });
        const boulder = new THREE.Mesh(boulderGeo, stoneRock);
        boulder.castShadow = false; boulder.position.set(lane.x, 1.9, -lane.dir * 31); boulder.raycast = () => {}; boulder.visible = false; kit.deco(boulder);
        const dust = sprite(0xcdbf9a, 7, lane.x, 1.4, -lane.dir * 30, 0, false); kit.deco(dust);
        const cycle = 30, travel = 5.2;
        const posAt = (t) => { const c = (t + lane.phase) % cycle; if (c < 25) return null; const u = (c - 25) / travel; return u <= 1 ? -lane.dir * 29 + lane.dir * 58 * u : null; };
        world.zone({ kind: "damage", x: lane.x, z: 0, w: 4.4, d: 4.4, y0: 0, h: 3.6, amount: 100, rate: 0.3, label: "boulder", at: (t) => { const z = posAt(t); return z === null ? { x: lane.x, z: 999 } : { x: lane.x, z }; } });
        world.tick((dt, t) => {
          const z = posAt(t), c = (t + lane.phase) % cycle;
          boulder.visible = z !== null;
          if (z !== null) { boulder.position.z = z; boulder.rotation.x = z * -0.5 * lane.dir; }
          dust.material.opacity = c >= 21 && c < 25 ? 0.3 + 0.2 * Math.sin(t * 9) : 0;
        });
      }

      // ── Gate arch (scenery over solid posts) ─────────────────────────────────────────
      const arch = kit.batch(3);
      for (const s of [-1, 1]) arch.box(2.0, 0.4, 2.0, s * 4.2, 0.2, 36.6).box(1.9, 0.3, 1.9, s * 4.2, 6.55, 36.6);   // base and capital; the posts are the solid boxes below
      arch.box(10.4, 1.2, 1.8, 0, 6.8, 36.6).box(11, 0.3, 2.2, 0, 7.55, 36.6);
      kit.deco(arch.mesh(carved, { shadow: true }));
      for (const s of [-1, 1]) kit.box(1.6, 6.4, 1.6, s * 4.2, 0, 36.6, carved);

      // ── Merge the natural things into a handful of meshes ────────────────────────────
      const barkMesh = bark.toMesh(N.material("bark"), { cast: true, receive: true });
      const leafMesh = leaf.toMesh(N.material("leaf"), { cast: true, receive: true });
      const lowMesh = low.toMesh(N.material("ground"), { cast: false, receive: true });
      for (const m of [barkMesh, leafMesh, lowMesh]) if (m) { m.frustumCulled = false; kit.deco(m); }
      if (rockParts.length) {
        const rocks = new THREE.Mesh(N.mergeGeometries(rockParts, false), stoneRock);
        rocks.castShadow = rocks.receiveShadow = true; rocks.raycast = () => {};
        kit.deco(rocks);
      }
      void rnd;
    },
  };
}
