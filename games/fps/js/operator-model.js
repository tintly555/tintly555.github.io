import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
import { meshField, sdEllipsoid, sdRoundCone, smin } from "./boss-sculpt.js?v=operator-sculpt-v1";

// The operator is sculpted, not assembled from boxes: every region of the body (sleeve, torso, plate,
// helmet, boots...) is a signed-distance field with smooth joins, meshed once with surface nets and
// shared by every avatar. Each region keeps the rig's joints and lengths, so hands, aim, crouch and the
// network poses are unchanged. Colour comes from the palette materials plus baked ambient occlusion.

// ── Cloth ───────────────────────────────────────────────────────────────────
// A periodic value-noise camo or ripstop weave, built once per seed on a canvas and shared by every
// avatar. The same canvas drives the colour map (tone only, mean ~1 so the palette colours hold) and a
// bump map for the fibre relief.
const fabricCache = new Map();
function fabricTextures(seed, camo) {
  if (fabricCache.has(seed)) return fabricCache.get(seed);
  const size = 256, period = 4;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const hash = (ix, iy) => {
    const x = ((ix % period) + period) % period, y = ((iy % period) + period) % period;
    const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const vnoise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size * period, ny = y / size * period;
      const blot = vnoise(nx, ny) * 0.65 + vnoise(nx * 2 + .5, ny * 2 + .5) * 0.35;
      const grain = vnoise(x / size * 32, y / size * 32);
      const weave = .965 + .035 * Math.cos(Math.PI * 2 * x / 8) * Math.cos(Math.PI * 2 * y / 8);
      let tone;
      if (camo) {
        const edge = Math.min(1, Math.max(0, (blot - .38) / .24));
        tone = .80 + .22 * edge * edge * (3 - 2 * edge);
      } else {
        tone = .93 + .07 * blot;
      }
      const v = Math.min(1, tone * (.95 + .05 * grain) * weave);
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(v * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(canvas);
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; }
  const out = { map, bump };
  fabricCache.set(seed, out);
  return out;
}

function dressOperatorPalette(palette) {
  const camoA = fabricTextures(1, true);
  const camoB = fabricTextures(2, true);
  const weave = fabricTextures(3, false);
  const dress = (material, tex, bumpScale) => {
    if (!material || material.map) return;
    material.map = tex.map;
    material.bumpMap = tex.bump;
    material.bumpScale = bumpScale;
    material.vertexColors = true;   // baked occlusion from the sculpt
    material.needsUpdate = true;
  };
  dress(palette.mCamo1, camoA, .36);
  dress(palette.mCamo2, camoB, .36);
  dress(palette.mVest, weave, .22);
  dress(palette.mPants, weave, .26);
  dress(palette.mHelm, weave, .14);
}

// ── Sculpt cache ────────────────────────────────────────────────────────────
// Each region is meshed on first use and kept. Avatars get clones, so per-avatar disposal stays safe.
const sculptCache = new Map();

// Occlusion: crevices and undersides darker, the top of a shape lit.
function shadeOcclusion(out, x, y, z, nx, ny, nz, ao) {
  const up = .9 + .1 * ny;
  const c = (.42 + .58 * ao) * up;
  out[0] = out[1] = out[2] = c;
}

// Triplanar-ish UVs for the cloth: each vertex projects onto the plane its normal faces most.
function addClothUVs(geometry) {
  const pos = geometry.attributes.position.array;
  const nor = geometry.attributes.normal.array;
  const uv = new Float32Array((pos.length / 3) * 2);
  for (let i = 0; i < pos.length / 3; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const ax = Math.abs(nor[i * 3]), ay = Math.abs(nor[i * 3 + 1]), az = Math.abs(nor[i * 3 + 2]);
    let u, v;
    if (ax >= ay && ax >= az) { u = z; v = y; }
    else if (ay >= az) { u = x; v = z; }
    else { u = x; v = y; }
    uv[i * 2] = u * 2.2;
    uv[i * 2 + 1] = v * 2.2;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

function sculptGeometry(key, field, lo, hi, cell) {
  let base = sculptCache.get(key);
  if (!base) {
    base = meshField(THREE, field, lo, hi, cell, shadeOcclusion);
    addClothUVs(base);
    sculptCache.set(key, base);
  }
  return base.clone();
}

// ── Field helpers ───────────────────────────────────────────────────────────
const hypot = Math.hypot;
// A shell of thickness t round a solid field d (the surface of the solid, thickened both ways).
const shell = (d, t) => Math.abs(d + t) - t;
const band = (d, half, centre) => Math.abs(d - centre) - half;
// Rounded box: gear, plates and pads are cut like real kit (flat faces, soft edges), not as blobs.
function sdRoundBox(x, y, z, bx, by, bz, r) {
  const qx = Math.abs(x) - bx + r, qy = Math.abs(y) - by + r, qz = Math.abs(z) - bz + r;
  return hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
const rbox = (x, y, z, cx, cy, cz, bx, by, bz, r) => sdRoundBox(x - cx, y - cy, z - cz, bx, by, bz, r);
const ell = (x, y, z, cx, cy, cz, rx, ry, rz) => sdEllipsoid(x - cx, y - cy, z - cz, rx, ry, rz);

export function buildOperatorShell(palette) {
  dressOperatorPalette(palette);
  const cloth = palette.mCamo1;
  const panels = palette.mCamo2;
  const armor = palette.mVest;
  const shellMat = palette.mHelm;
  const pants = palette.mPants;
  const mat = (color, roughness, metalness = 0) => new THREE.MeshStandardMaterial({
    color, roughness, metalness, emissive: 0, vertexColors: true,
  });
  const rubber = mat(0x23292c, .95);
  const webbing = mat(0x3d4241, .94);
  const glass = mat(0x305761, .24, .43);
  const hardware = mat(0x5e6868, .51, .42);
  const markings = mat(0xae8961, .82);

  function region(parent, material, key, field, lo, hi, cell = .014) {
    const mesh = new THREE.Mesh(sculptGeometry(key, field, lo, hi, cell), material);
    parent.add(mesh);
    return mesh;
  }

  // ── Torso (carrier origin 1.24 above the feet; shoulders at +0.28, belt at about -0.4) ──
  const carrier = new THREE.Group();
  carrier.position.y = 1.24;

  const torsoBody = (x, y, z) => {
    const shoulders = ell(x, y, z, 0, .17, -.004, .212, .11, .118);
    const chest = ell(x, y, z, 0, -.02, -.008, .188, .20, .122);
    const belly = ell(x, y, z, 0, -.30, -.004, .165, .12, .1);
    let d = smin(shoulders, chest, .06);
    d = smin(d, belly, .05);
    const neck = sdRoundCone(x, y, z, 0, .25, 0, 0, .31, 0, .050, .042);
    return smin(d, neck, .03);
  };
  region(carrier, cloth, "torso", torsoBody, [-.24, -.46, -.17], [.24, .38, .17]);

  // Armour plate: a flat chest plate with soft edges, standing off the body.
  const plate = (x, y, z) => {
    const width = .154 - Math.max(0, y - .09) * .66 - Math.max(0, -.06 - y) * .18;
    return rbox(x, y, z, 0, .012, .125 - Math.abs(x) * .19, width, .177, .036, .025);
  };
  region(carrier, armor, "plate", plate, [-.2, -.24, .0], [.2, .24, .2], .012);
  // Chest-rig straps running over the plate.
  const rig = (x, y, z) => Math.min(
    rbox(x, y, z, -.085, .02, .175, .012, .17, .012, .008),
    rbox(x, y, z, .085, .02, .175, .012, .17, .012, .008));
  region(carrier, webbing, "rig", rig, [-.12, -.2, .14], [.12, .2, .2], .010);
  const chestPockets = (x, y, z) => {
    const innerX = Math.abs(x);
    return Math.min(rbox(x, y, z, 0, -.098, .174, .038, .056, .035, .013),
      rbox(innerX, y, z, .080, -.100, .162, .036, .063, .031, .010));
  };
  region(carrier, panels, "chestPockets", chestPockets, [-.13, -.18, .10], [.13, -.03, .22], .010);
  const pocketFlaps = (x, y, z) => Math.min(
    rbox(x, y, z, 0, -.048, .188, .034, .014, .022, .008),
    rbox(Math.abs(x), y, z, .080, -.043, .177, .031, .013, .020, .007));
  region(carrier, webbing, "pocketFlaps", pocketFlaps, [-.13, -.069, .145], [.13, -.022, .218], .007);
  const chestBadge = (x, y, z) => rbox(x, y, z, -.048, .077, .160, .039, .013, .007, .004);
  region(carrier, markings, "chestBadge", chestBadge, [-.093, .059, .148], [-.005, .094, .17], .004);

  // Rubber collar where the plate meets the neck.
  const collar = (x, y, z) => Math.max(band(hypot(x, z * .95), .014, .084), band(y, .028, .283));
  region(carrier, rubber, "collar", collar, [-.13, .22, -.13], [.13, .34, .13], .010);

  // Rucksack: a rounded pack on the back with a top flap and webbing straps over the shoulders.
  const pack = (x, y, z) => rbox(x, y, z, 0, -.028, -.184, .137, .183, .090, .047);
  region(carrier, panels, "pack", pack, [-.16, -.24, -.30], [.16, .18, -.075], .012);
  const packFlap = (x, y, z) => rbox(x, y, z, 0, .137, -.189, .125, .034, .086, .024);
  region(carrier, webbing, "packFlap", packFlap, [-.14, .095, -.292], [.14, .19, -.09], .010);
  const packRails = (x, y, z) => Math.min(
    rbox(Math.abs(x), y, z, .068, -.048, -.269, .012, .15, .013, .007),
    rbox(x, y, z, 0, -.126, -.274, .10, .015, .012, .007));
  region(carrier, webbing, "packRails", packRails, [-.115, -.215, -.30], [.115, .12, -.25], .009);
  const strap = (x, y, z) => {
    const a = sdRoundCone(x, y, z, .135, .19, -.10, .14, .02, .13, .017, .015);
    const b = sdRoundCone(x, y, z, .135, .02, .13, .14, -.22, .12, .015, .014);
    const c = sdRoundCone(x, y, z, -.135, .19, -.10, -.14, .02, .13, .017, .015);
    const d = sdRoundCone(x, y, z, -.135, .02, .13, -.14, -.22, .12, .015, .014);
    return Math.min(a, b, c, d);
  };
  region(carrier, webbing, "straps", strap, [-.2, -.28, -.2], [.2, .26, .17], .012);

  // ── Waist and hips (own group: the hips move with the legs) ──────────────────
  const waist = new THREE.Group();
  waist.position.y = .72;
  const pelvis = (x, y, z) => {
    const hips = ell(x, y, z, 0, .05, 0, .17, .104, .104);
    const seat = ell(x, y, z, 0, -.01, -.012, .158, .074, .094);
    return smin(hips, seat, .04);
  };
  region(waist, pants, "pelvis", pelvis, [-.24, -.12, -.16], [.24, .2, .16]);
  const beltBand = (x, y, z) => Math.max(band(hypot(x, z * 1.55), .013, .157), band(y, .021, .094));
  region(waist, webbing, "belt", beltBand, [-.24, .04, -.2], [.24, .13, .2], .010);
  const buckle = (x, y, z) => rbox(x, y, z, 0, .092, .106, .039, .020, .012, .008);
  region(waist, hardware, "buckle", buckle, [-.05, .063, .089], [.05, .12, .124], .007);
  const pouches = (x, y, z) => Math.min(
    rbox(x, y, z, .14, .02, .075, .062, .07, .046, .022),
    rbox(x, y, z, -.14, .02, .075, .062, .07, .046, .022));
  region(waist, webbing, "pouches", pouches, [-.24, -.08, .0], [.24, .12, .15], .010);

  // ── Head (origin at the top of the neck) ─────────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.75;
  const face = (x, y, z) => {
    const skull = ell(x, y, z, 0, .004, .004, .098, .122, .108);
    const jaw = ell(x, y, z, 0, -.062, -.008, .082, .068, .088);
    return smin(skull, jaw, .03);
  };
  region(headGroup, rubber, "face", face, [-.12, -.16, -.12], [.12, .14, .12], .011);
  const neck = (x, y, z) => sdRoundCone(x, y, z, 0, -.08, -.01, 0, -.24, -.01, .046, .052);
  region(headGroup, rubber, "neck", neck, [-.07, -.31, -.07], [.07, -.04, .07], .011);
  const helmet = (x, y, z) => {
    const dome = ell(x, y, z, 0, -.004, -.006, .13, .122, .138);
    const hs = Math.max(shell(dome, .016), -(y + .036));
    const brow = rbox(x, y, z, 0, .05, .105, .105, .012, .03, .011);
    const rail = sdRoundCone(x, y, z, 0, .124, .064, 0, .128, -.14, .010, .010);
    return smin(smin(hs, brow, .02), rail, .010);
  };
  region(headGroup, shellMat, "helmet", helmet, [-.15, -.04, -.17], [.15, .16, .17], .011);
  const visor = (x, y, z) => {
    const v = ell(x, y, z, 0, .004, -.012, .124, .05, .15);
    return Math.max(shell(v, .007), -(z - .112));
  };
  region(headGroup, glass, "visor", visor, [-.14, -.07, .1], [.14, .07, .18], .009);
  const respirator = (x, y, z) => {
    const facepiece = rbox(x, y, z, 0, -.080, .082, .071, .041, .040, .025);
    const filters = ell(Math.abs(x), y, z, .061, -.088, .098, .023, .029, .028);
    return smin(facepiece, filters, .012);
  };
  region(headGroup, armor, "respirator", respirator, [-.095, -.132, .025], [.095, -.035, .139], .008);
  const vents = (x, y, z) => Math.min(
    rbox(x, y, z, 0, -.069, .121, .034, .0033, .0045, .003),
    rbox(x, y, z, 0, -.083, .123, .030, .0033, .0045, .003),
    rbox(x, y, z, 0, -.097, .120, .025, .0033, .0045, .003));
  region(headGroup, hardware, "respiratorVents", vents, [-.038, -.105, .11], [.038, -.061, .134], .0035);
  const pod = (x, y, z) => rbox(x, y, z, 0, -.01, -.133, .044, .05, .030, .018);
  region(headGroup, rubber, "pod", pod, [-.07, -.09, -.24], [.07, .07, -.08], .010);
  const comms = (x, y, z) => Math.min(
    rbox(x, y, z, -.134, -.02, -.01, .02, .04, .04, .014),
    rbox(x, y, z, .134, -.02, -.01, .02, .04, .04, .014));
  region(headGroup, armor, "comms", comms, [-.17, -.08, -.06], [.17, .07, .06], .010);
  const helmetReinforcement = new THREE.Group();
  headGroup.add(helmetReinforcement);
  const browReinforcement = (x, y, z) => rbox(x, y, z, 0, .064, .108 - Math.abs(x) * .41, .099, .019, .028, .017);
  region(helmetReinforcement, shellMat, "browReinforcement", browReinforcement, [-.111, .037, .036], [.111, .092, .144], .006);
  const jawGuard = new THREE.Group();
  headGroup.add(jawGuard);
  const jawPlates = (x, y, z) => rbox(Math.abs(x), y, z, .085, -.073, .034, .026, .044, .062, .018);
  region(jawGuard, shellMat, "jawPlates", jawPlates, [-.118, -.124, -.036], [.118, -.022, .105], .008);
  const armorReinforcement = new THREE.Group();
  carrier.add(armorReinforcement);
  const upperPlate = (x, y, z) => rbox(x, y, z, 0, .119, .123 - Math.abs(x) * .31, .107, .031, .024, .015);
  region(armorReinforcement, armor, "upperPlate", upperPlate, [-.118, .082, .065], [.118, .156, .157], .007);
  const flankGuard = new THREE.Group();
  carrier.add(flankGuard);
  const ribPlates = (x, y, z) => rbox(Math.abs(x), y, z, .157, -.118, .043, .034, .099, .077, .019);
  region(flankGuard, armor, "ribPlates", ribPlates, [-.2, -.23, -.046], [.2, -.011, .129], .009);

  function setArmorLook(helmetTier, vestTier) {
    helmetReinforcement.visible = helmetTier >= 1;
    jawGuard.visible = helmetTier >= 3;
    armorReinforcement.visible = vestTier >= 1;
    flankGuard.visible = vestTier >= 2;
  }
  setArmorLook(0, 0);

  // ── Arms: a sleeve from the shoulder, a forearm below the elbow ─────────────────
  function armShell(arm, side) {
    const sleeve = (x, y, z) => {
      const upper = sdRoundCone(x, y, z, 0, -.02, 0, 0, -.20, 0, .07, .06);
      const lower = sdRoundCone(x, y, z, 0, -.19, 0, 0, -.335, 0, .06, .055);
      const deltoid = ell(x, y, z, 0, .01, 0, .076, .088, .076);
      return smin(smin(upper, lower, .02), deltoid, .03);
    };
    region(arm, cloth, "sleeve", sleeve, [-.1, -.41, -.1], [.1, .12, .1], .011);
    const outside = side === "R" ? 1 : -1;
    const pad = (x, y, z) => rbox(x, y, z, outside * .042, -.045, .002, .053, .085, .077, .034);
    region(arm, armor, "shoulderPad" + side, pad, [-.105, -.145, -.093], [.105, .055, .099], .009);

    const elbow = new THREE.Group();
    elbow.position.y = -.36;
    arm.add(elbow);
    const forearm = (x, y, z) => {
      const d = sdRoundCone(x, y, z, 0, -.01, 0, 0, -.27, 0, .058, .046);
      const muscle = ell(x, y, z, 0, -.052, -.010, .061, .090, .060);
      return smin(d, muscle, .03);
    };
    region(elbow, panels, "forearm", forearm, [-.09, -.32, -.09], [.09, .25, .09], .011);
    const cuff = (x, y, z) => sdRoundCone(x, y, z, 0, -.27, 0, 0, -.33, 0, .049, .052);
    region(elbow, rubber, "cuff", cuff, [-.08, -.40, -.08], [.08, -.2, .08], .010);
    const elbowPad = (x, y, z) => rbox(x, y, z, 0, -.03, .045, .056, .05, .03, .02);
    region(elbow, armor, "elbowPad", elbowPad, [-.08, -.1, -.02], [.08, .04, .1], .010);
    const bracer = (x, y, z) => rbox(x, y, z, outside * .032, -.164, .012, .023, .092, .039, .018);
    region(elbow, armor, "bracer" + side, bracer, [-.067, -.269, -.037], [.067, -.064, .061], .009);
    return elbow;
  }

  // ── Legs: thigh and hip from the hip joint, shin and boot below the knee ─────────
  function legShell(px) {
    const leg = new THREE.Group();
    const thigh = (x, y, z) => {
      const d = sdRoundCone(x, y, z, 0, .00, 0, 0, -.37, 0, .098, .074);
      const hip = ell(x, y, z, 0, .02, 0, .094, .09, .094);
      return smin(d, hip, .03);
    };
    region(leg, pants, "thigh", thigh, [-.12, -.47, -.12], [.12, .11, .12], .013);
    const outside = Math.sign(px);
    const cargo = (x, y, z) => rbox(x, y, z, outside * .071, -.153, -.002, .032, .098, .065, .023);
    region(leg, panels, "cargo" + outside, cargo, [-.115, -.267, -.08], [.115, -.044, .08], .010);
    const knee = new THREE.Group();
    knee.name = "knee";
    knee.rotation.order = "YXZ";
    knee.position.y = -.38;
    leg.add(knee);
    const kneePad = (x, y, z) => rbox(x, y, z, 0, -.02, .05, .07, .06, .03, .022);
    region(knee, armor, "kneePad", kneePad, [-.09, -.1, -.01], [.09, .06, .11], .010);
    const shin = (x, y, z) => {
      const d = sdRoundCone(x, y, z, 0, -.01, 0, 0, -.345, 0, .074, .054);
      const calf = ell(x, y, z, 0, -.14, -.024, .072, .12, .07);
      return smin(d, calf, .03);
    };
    region(knee, pants, "shin", shin, [-.11, -.4, -.12], [.11, .03, .12], .013);
    const ankle = new THREE.Group();
    ankle.position.y = -.366;
    knee.add(ankle);
    const boot = (x, y, z) => {
      const shaft = sdRoundCone(x, y, z, 0, .04, 0, 0, -.06, 0, .064, .068);
      const upper = ell(x, y, z, 0, -.05, .03, .072, .07, .112);
      const toe = ell(x, y, z, 0, -.07, .12, .07, .052, .07);
      const sole = rbox(x, y, z, 0, -.10, .03, .075, .022, .165, .018);
      return smin(smin(smin(shaft, upper, .025), toe, .03), sole, .012);
    };
    region(ankle, rubber, "boot", boot, [-.12, -.16, -.16], [.12, .08, .22], .010);
    const toeCap = (x, y, z) => Math.max(
      shell(ell(x, y, z, 0, -.067, .114, .074, .054, .075), .012), .086 - z);
    region(ankle, armor, "toeCap", toeCap, [-.084, -.126, .076], [.084, -.005, .197], .008);
    leg.position.set(px, .865, 0);
    leg.userData.knee = knee;
    leg.userData.ankle = ankle;
    return leg;
  }

  return { carrier, waist, headGroup, armShell, legShell, setArmorLook };
}
