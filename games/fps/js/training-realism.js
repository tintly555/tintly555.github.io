// training-realism.js — Training Camp only.
//
// Turns the flat grey facility look of the Training Camp proving ground into a
// believable outdoor concrete range: a painted / board-formed concrete wall
// surface (albedo + normal + roughness with grime, wear and large-scale colour
// variation), and a volume of airborne dust that drifts and catches the light.
//
// This module is imported ONLY by buildMapTraining and touches nothing shared:
// the wall material it returns is applied to the training walls in place, and the
// shared "facility" material path used by every other map is left untouched.
//
// Heavy canvas work (the three concrete textures, the dust sprite) is built once
// and cached at module scope; the material and the dust cloud are cheap fresh
// instances per map build.

const CONCRETE_PX = 1024;

let _wallMaps = null;        // { albedo, normal, rough } CanvasTextures, built once
let _dustSprite = null;      // soft round point texture, built once

/** Deterministic PRNG so the concrete looks the same every build (no shimmering reload-to-reload). */
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A horizontally-tiling painted-concrete albedo: base tone, broad stains, board-form seams, speckle, scuffs. */
function buildConcreteAlbedo() {
  const cv = document.createElement("canvas");
  cv.width = cv.height = CONCRETE_PX;
  const c = cv.getContext("2d");
  const S = CONCRETE_PX;
  const rnd = mulberry(20261112);

  // Warm, slightly green-grey painted concrete base.
  c.fillStyle = "#8b8d84";
  c.fillRect(0, 0, S, S);

  // Large soft blotches — uneven paint / damp patches. Drawn wrapped in X so the seam matches.
  for (let i = 0; i < 90; i++) {
    const x = rnd() * S, y = rnd() * S;
    const r = 40 + rnd() * 240;
    const dark = rnd() < 0.55;
    const a = 0.03 + rnd() * 0.06;
    for (const ox of [-S, 0, S]) {
      const g = c.createRadialGradient(x + ox, y, 0, x + ox, y, r);
      const tone = dark ? `rgba(60,62,58,${a})` : `rgba(176,174,160,${a})`;
      g.addColorStop(0, tone);
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x + ox - r, y - r, r * 2, r * 2);
    }
  }

  // Board-form horizontal lines (concrete poured in lifts) — faint light/dark pair.
  const lift = S / 14;
  for (let yy = 0; yy <= S; yy += lift) {
    c.fillStyle = "rgba(40,42,40,0.16)";
    c.fillRect(0, yy, S, 2);
    c.fillStyle = "rgba(198,196,182,0.10)";
    c.fillRect(0, yy + 2, S, 1);
  }
  // A couple of vertical form seams.
  for (const vx of [S * 0.34, S * 0.72]) {
    c.fillStyle = "rgba(38,40,38,0.12)";
    c.fillRect(vx, 0, 2, S);
  }

  // Fine grain speckle — pepper of light and dark grit.
  for (let i = 0; i < 46000; i++) {
    const x = rnd() * S, y = rnd() * S;
    c.fillStyle = i & 1 ? "rgba(215,212,198,0.07)" : "rgba(26,28,26,0.09)";
    c.fillRect(x, y, 1 + rnd() * 2, 1 + rnd() * 2);
  }

  // Dark vertical streaks under the seams — rain / rust wash.
  for (let i = 0; i < 22; i++) {
    const x = rnd() * S;
    const w = 2 + rnd() * 7;
    const h = 60 + rnd() * 300;
    const y = rnd() * S;
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "rgba(44,42,36,0.0)");
    g.addColorStop(0.3, "rgba(44,42,36,0.11)");
    g.addColorStop(1, "rgba(44,42,36,0.0)");
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
  }

  // Scuffs / chips — small bright spalls with a dark edge.
  for (let i = 0; i < 160; i++) {
    const x = rnd() * S, y = rnd() * S, r = 1 + rnd() * 4;
    c.fillStyle = "rgba(205,201,186,0.5)";
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.fillStyle = "rgba(30,30,28,0.35)";
    c.beginPath(); c.arc(x + r * 0.5, y + r * 0.5, r * 0.7, 0, 7); c.fill();
  }

  return cv;
}

/** A matching tangent-space normal map from a cheap height field (grain + board lines). */
function buildConcreteNormal() {
  const S = CONCRETE_PX;
  const hcv = document.createElement("canvas");
  hcv.width = hcv.height = S;
  const h = hcv.getContext("2d");
  h.fillStyle = "#808080";
  h.fillRect(0, 0, S, S);
  const rnd = mulberry(7731);
  // grain bumps
  for (let i = 0; i < 52000; i++) {
    const v = 96 + rnd() * 112 | 0;
    h.fillStyle = `rgb(${v},${v},${v})`;
    h.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  // board-form recesses as darker (lower) bands
  const lift = S / 14;
  for (let yy = 0; yy <= S; yy += lift) {
    h.fillStyle = "rgba(40,40,40,0.5)";
    h.fillRect(0, yy, S, 3);
  }
  const src = h.getImageData(0, 0, S, S).data;
  const out = document.createElement("canvas");
  out.width = out.height = S;
  const o = out.getContext("2d");
  const img = o.createImageData(S, S);
  const at = (x, y) => src[((((y + S) % S) * S + ((x + S) % S)) << 2)]; // red channel, wrapped
  const strength = 2.1;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) / 255 * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) / 255 * strength;
      let nx = dx, ny = dy, nz = 1;
      const inv = 1 / Math.hypot(nx, ny, nz);
      nx *= inv; ny *= inv; nz *= inv;
      const i = (y * S + x) << 2;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  o.putImageData(img, 0, 0);
  return out;
}

/** Roughness: concrete is rough (bright), the painted patches a touch smoother (darker). */
function buildConcreteRough() {
  const S = CONCRETE_PX;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const c = cv.getContext("2d");
  c.fillStyle = "#dedede"; // ~0.87
  c.fillRect(0, 0, S, S);
  const rnd = mulberry(55221);
  for (let i = 0; i < 120; i++) {
    const x = rnd() * S, y = rnd() * S, r = 40 + rnd() * 220;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(150,150,150,0.14)"); // smoother patch
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    for (const ox of [-S, 0, S]) { c.fillRect(x + ox - r, y - r, r * 2, r * 2); }
  }
  for (let i = 0; i < 30000; i++) {
    const v = rnd() < 0.5 ? 255 : 200;
    c.fillStyle = `rgba(${v},${v},${v},0.08)`;
    c.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  return cv;
}

function ensureWallMaps(THREE) {
  if (_wallMaps) return _wallMaps;
  const mk = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  _wallMaps = {
    albedo: mk(buildConcreteAlbedo(), true),
    normal: mk(buildConcreteNormal(), false),
    rough: mk(buildConcreteRough(), false),
  };
  return _wallMaps;
}

/**
 * The training wall material. One shared instance covers every training wall
 * (their UVs are baked to a 10 m world repeat, so a single RepeatWrapping material
 * tiles consistently). Marked _cachedShared so the map-clear keeps it and its
 * module-cached textures alive, and so the texture-detail toggle (which mutates
 * the material in place) keeps working.
 */
export function createTrainingWallMaterial(THREE) {
  const maps = ensureWallMaps(THREE);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x9a9b90,
    map: maps.albedo,
    normalMap: maps.normal,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughnessMap: maps.rough,
    roughness: 1.0,
    metalness: 0.0,
  });
  mat.userData._cachedShared = true;
  // Large-scale world-space tonal drift so the 10 m tile never reads as a repeat,
  // plus a gentle distance fade of the micro normal so far walls stay calm. Works
  // whether or not the albedo map is bound (texture-detail toggle safe).
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vTrWorld;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvTrWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vTrWorld;\n" +
        "float trHash(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}\n" +
        "float trNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);" +
        "float a=trHash(i),b=trHash(i+vec2(1.,0.)),c=trHash(i+vec2(0.,1.)),d=trHash(i+vec2(1.,1.));" +
        "return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}")
      .replace("#include <map_fragment>", "#include <map_fragment>\n" +
        "  float trN = trNoise(vTrWorld.xz*0.055) * 0.6 + trNoise(vTrWorld.xz*0.17) * 0.4;\n" +
        "  diffuseColor.rgb *= 0.82 + 0.34 * trN;\n")
      .replace("#include <normal_fragment_maps>",
        "vec3 trBaseNormal = normal;\n#include <normal_fragment_maps>\n" +
        "  float trDist = length(cameraPosition - vTrWorld);\n" +
        "  float trFade = 1.0 - smoothstep(10.0, 34.0, trDist);\n" +
        "  normal = normalize(mix(trBaseNormal, normal, 0.25 + 0.75 * trFade));\n");
  };
  mat.customProgramCacheKey = () => "trainingConcreteV1";
  return mat;
}

function ensureDustSprite(THREE) {
  if (_dustSprite) return _dustSprite;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 64;
  const c = cv.getContext("2d");
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,252,240,0.55)");
  g.addColorStop(1, "rgba(255,252,240,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  _dustSprite = new THREE.CanvasTexture(cv);
  return _dustSprite;
}

/**
 * A drifting dust volume over the firing court. Additive, faintly lit by being
 * brighter toward the sun, present on every tier (count scales with fidelity only;
 * motes never reveal an enemy). Call update(dt) each frame and dispose() on clear.
 */
export function createTrainingDust(THREE, tier, sunDir) {
  const count = [220, 520, 1000, 1600][tier] ?? 520;
  const bounds = { x: [-34, 34], y: [0.3, 6.8], z: [-49, 25] };
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const drift = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const rnd = mulberry(999331);
  const warm = new THREE.Color(0xfff3dc);
  const cool = new THREE.Color(0xcfd8e2);
  for (let i = 0; i < count; i++) {
    const x = bounds.x[0] + rnd() * (bounds.x[1] - bounds.x[0]);
    const y = bounds.y[0] + rnd() * (bounds.y[1] - bounds.y[0]);
    const z = bounds.z[0] + rnd() * (bounds.z[1] - bounds.z[0]);
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    // brighter higher up where the light rakes through
    const t = (y - bounds.y[0]) / (bounds.y[1] - bounds.y[0]);
    const cc = cool.clone().lerp(warm, 0.35 + 0.65 * t);
    const b = 0.4 + 0.6 * rnd();
    col[i * 3] = cc.r * b; col[i * 3 + 1] = cc.g * b; col[i * 3 + 2] = cc.b * b;
    drift[i * 3] = (0.12 + rnd() * 0.22);           // general downwind drift (+x)
    drift[i * 3 + 1] = (rnd() - 0.5) * 0.05;
    drift[i * 3 + 2] = (rnd() - 0.5) * 0.12;
    phase[i] = rnd() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.055,
    map: ensureDustSprite(THREE),
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  points.raycast = () => {};

  let t = 0;
  function update(dt) {
    t += dt;
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      p[i3] += drift[i3] * dt + Math.sin(t * 0.6 + phase[i]) * 0.004;
      p[i3 + 1] += drift[i3 + 1] * dt + Math.sin(t * 0.9 + phase[i] * 1.7) * 0.004;
      p[i3 + 2] += drift[i3 + 2] * dt + Math.cos(t * 0.5 + phase[i]) * 0.004;
      if (p[i3] > bounds.x[1]) p[i3] = bounds.x[0];
      if (p[i3] < bounds.x[0]) p[i3] = bounds.x[1];
      if (p[i3 + 1] > bounds.y[1]) p[i3 + 1] = bounds.y[0];
      if (p[i3 + 1] < bounds.y[0]) p[i3 + 1] = bounds.y[1];
      if (p[i3 + 2] > bounds.z[1]) p[i3 + 2] = bounds.z[0];
      if (p[i3 + 2] < bounds.z[0]) p[i3 + 2] = bounds.z[1];
    }
    geo.attributes.position.needsUpdate = true;
  }
  function dispose() {
    geo.dispose();
    mat.dispose();
  }
  return { points, update, dispose };
}
