import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
import { BOSS_WATER_GLSL, BOSS_WATER_Y, bossWaterGeometry } from "./water-shape.js";

export const BOSS_ARENA_HALF = 50;

export function createCombatEnvironment(kind, wall, targets = []) {
  const training = kind === "training";
  const root = new THREE.Group();
  root.name = training ? "Training Camp proving ground" : "Boss containment foundry";
  const materials = {
    frame: new THREE.MeshStandardMaterial({ color: training ? 0x394e58 : 0x293036, metalness: 0.32, roughness: 0.73 }),
    skin: new THREE.MeshStandardMaterial({ color: training ? 0x62767a : 0x44494c, metalness: 0.20, roughness: 0.82 }),
    recess: new THREE.MeshStandardMaterial({ color: 0x171e23, roughness: 0.91 }),
    stripe: new THREE.MeshStandardMaterial({ color: training ? 0x56858a : 0x8c5137, roughness: 0.80 }),
    signal: new THREE.MeshStandardMaterial({
      color: training ? 0x8ed9e4 : 0xf6a96a, emissive: training ? 0x74c7d5 : 0xdf6b32, emissiveIntensity: 0.38,
    }),
  };
  const batches = new Map();
  function box(material, w, h, d, x, y, z, yaw = 0, roll = 0) {
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push([w, h, d, x, y, z, yaw, roll]);
  }
  function sign(label, color, x, y, z, width) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 100;
    const c = canvas.getContext("2d");
    c.fillStyle = "#182128"; c.fillRect(0, 0, 512, 100);
    c.strokeStyle = color; c.lineWidth = 3; c.strokeRect(7, 8, 498, 84);
    c.fillStyle = color; c.fillRect(16, 16, 10, 68); c.fillRect(486, 16, 10, 68);
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "700 43px sans-serif"; c.fillText(label, 256, 51, 438);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 100 / 512),
      new THREE.MeshBasicMaterial({ map: texture }));
    panel.position.set(x, y, z);
    root.add(panel);
  }
  // Collision-only extensions keep a jetting player inside the playable footprint. The visible
  // architecture stays at human scale; the top of this slab is far beyond harness reach.
  function boundary(w, d, x, z) {
    const mesh = wall(w, 20000, d, x, 10000, z, 0x000000);
    if (mesh) { mesh.visible = false; mesh.castShadow = false; mesh.receiveShadow = false; }
  }

  if (training) {
    // An open firing court framed by covered booths, a target gantry and a reinforced backstop.
    root.add(trainingSky());
    wall(68, 7, 1.8, 0, 3.5, -48, 0x62727a);
    wall(68, 4.5, 1, 0, 2.25, 26, 0x66777e);
    for (const side of [-1, 1]) {
      wall(1.2, 5.4, 74, side * 34, 2.7, -11, 0x52636a);
      for (const z of [-38, -25, -12, 1, 14]) {
        wall(2.8, 0.95, 3.2, side * 28, 0.475, z, 0x64777b);
        box("frame", 0.50, 5.9, 1.2, side * 32.8, 2.95, z);
        box("signal", 0.12, 2.5, 0.12, side * 32.5, 3.55, z + .64);
        box("skin", 4.1, 0.16, 3.7, side * 28, 1.02, z);
      }
    }
    for (const x of [-31, -20, -10, 0, 10, 20, 31]) {
      box("frame", 0.6, 7.8, 0.9, x, 3.9, -46.7);
      box("recess", 7.4, 2.35, 0.45, x, 1.42, -46.7);
      for (let i = 0; i < 5; i++) box("skin", 7.1, 0.14, 0.33, x, 0.54 + i * 0.43, -46.41);
    }
    for (const x of [-24, -14, -3, 8, 19, 29]) {
      wall(0.40, 4.7, 0.42, x, 2.35, 23.7, 0x62767a);
      box("stripe", 0.46, 0.60, 0.47, x, 0.44, 23.7);
    }
    box("frame", 62, 0.32, 5.5, 0, 4.55, 23.1);
    box("skin", 63, 0.14, 6, 0, 4.81, 23.1);
    box("signal", 57, 0.07, 0.12, 0, 4.43, 20.36);
    box("frame", 63, 0.23, 5.3, 0, 4.87, 17.72);
    box("skin", 64, 0.49, 0.35, 0, 4.91, 15.10);
    for (const x of [-30, -21, -12, 0, 12, 21, 30]) {
      box("recess", .27, .34, 5.7, x, 4.66, 17.82);
      box("signal", .10, .045, 2.3, x, 4.47, 18.43);
    }
    box("frame", 58, 0.42, 0.58, 0, 5.65, -42.5);
    box("signal", 54, 0.075, 0.08, 0, 5.41, -42.17);
    sign("HEAVY TARGET BAY", "#a5e4ea", 0, 4.78, -42.16, 9.0);
    sign("WEST / 01", "#b4d3d6", -21, 4.35, -46.14, 5.1);
    sign("EAST / 02", "#b4d3d6", 21, 4.35, -46.14, 5.1);
    sign("COMBAT RANGE", "#a5e4ea", 0, 4.85, 15.30, 7.2);
    // Utilities outside the shot lanes give the two sides different silhouettes.
    for (const [x, z, w, h, d, color] of [
      [-29,-32,4.6,3.5,4.2,0x526669], [-29,-40,3.5,5.3,3.8,0x5e7274],
      [29,-35,4.2,2.0,4.7,0x676a5c], [29,-26,3.4,2.7,3.2,0x56666a],
    ]) {
      wall(w, h, d, x, h * .5, z, color);
      box("skin", w + .14, .14, d + .15, x, h, z);
      box("recess", w * .75, h * .56, .10, x, h * .52, z + d * .5);
      for (let i = 0; i < 4; i++) box("frame", w * .62, .09, .15, x, h * (.34 + i * .12), z + d * .5 + .05);
      box("stripe", w * .91, .12, .10, x, h * .86, z + d * .5);
    }
    // A real horizon beyond the range: low, cool ridgelines with sparse relay towers and
    // distant test structures. These stay outside the firing court and read above its backstop.
    const ridgeMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x536a75, roughness: 1, fog: true }),
      new THREE.MeshStandardMaterial({ color: 0x748b91, roughness: 1, fog: true }),
    ];
    const ridge = new THREE.IcosahedronGeometry(1, 1);
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2 + .13;
      const radius = 78 + (i % 3) * 9;
      const h = 13 + (i * 17 % 21);
      const hill = new THREE.Mesh(ridge, ridgeMaterials[i % 2]);
      hill.position.set(Math.cos(a) * radius, h * .26 - 3, -11 + Math.sin(a) * radius);
      hill.scale.set(18 + i % 4 * 3, h, 15 + i % 5 * 2);
      hill.rotation.y = a * .7;
      hill.castShadow = false; hill.receiveShadow = true; hill.raycast = () => {};
      root.add(hill);
      if (i % 3 === 0) {
        const tx = Math.cos(a) * (radius - 12), tz = -11 + Math.sin(a) * (radius - 12), th = 23 + i % 4 * 7;
        box("frame", .55, th, .55, tx, th / 2, tz, a);
        box("signal", 3.4, .16, .18, tx, th * .72, tz, a);
        box("signal", 2.2, .14, .18, tx, th * .84, tz, a);
      }
    }
    // Four tall invisible faces meet the court walls and block vertical jet escapes.
    boundary(70, 2.4, 0, -48);
    boundary(70, 2.4, 0, 26);
    boundary(2.4, 76, -34, -11);
    boundary(2.4, 76, 34, -11);
    for (const { lane, x, z, kind: targetKind } of targets) {
      const tx = lane ? (lane.xMin + lane.xMax) * .5 : x;
      const tz = lane ? lane.z : z;
      const span = lane ? lane.xMax - lane.xMin + 1.2 : targetKind === "boss" ? 6 : 2.2;
      box("frame", span, 0.055, .43, tx, 0.0275, tz - .65);
      box("stripe", span - .30, 0.024, .065, tx, 0.06, tz - .49);
      for (const edge of [-1, 1]) box("signal", .16, 0.12, .22, tx + edge * span * .47, 0.07, tz - .60);
    }
  } else {
    // A circular containment deck, surrounded by heat exchangers and recessed steel panels.
    for (const side of [-1, 1]) {
      wall(BOSS_ARENA_HALF * 2, 9, 1, 0, 4.5, side * BOSS_ARENA_HALF, 0x58636e);
      wall(1, 9, BOSS_ARENA_HALF * 2, side * BOSS_ARENA_HALF, 4.5, 0, 0x58636e);
      for (let i = -4; i <= 4; i++) {
        const t = i * 10.5;
        for (const [x, z, yaw] of [[t, side * 49, side < 0 ? 0 : Math.PI], [side * 49, t, side < 0 ? Math.PI / 2 : -Math.PI / 2]]) {
          box("frame", 8.1, 7.0, 0.68, x, 3.51, z, yaw);
          box("recess", 7.1, 3.6, 0.74, x, 2.66, z, yaw);
          box("stripe", 7.4, 0.21, 0.78, x, 5.8, z, yaw);
          box("signal", 5.7, 0.14, 0.81, x, 6.3, z, yaw);
          for (let j = 0; j < 5; j++) box("skin", 6.75, 0.11, 0.90, x, 1.29 + j * .64, z, yaw);
          // The units are solid: an invisible block under the drawn parts stops walking, shots and sight
          // (they were only painted before, and the player could walk into them).
          const alongX = Math.abs(Math.cos(yaw)) > 0.5;
          wall(alongX ? 8.1 : 0.92, 7.0, alongX ? 0.92 : 8.1, x, 3.5, z, 0x293036).visible = false;
        }
      }
      for (const [x, z, yaw] of [[0, side * 47.0, 0], [side * 47.0, 0, Math.PI / 2]]) {
        box("frame", 94, .62, 2.45, x, 8.63, z, yaw);
        box("skin", 92, .19, 1.76, x, 8.22, z, yaw);
      }
    }
    for (const [x, z, w, d] of [[-20,-18,4,2],[22,15,2,4],[10,-30,4,2],[-30,8,2,4],[8,35,5,2],[-11,33,4,2]]) {
      wall(w, 1.95, d, x, .975, z, 0x7b848c);
      box("frame", w + .06, 0.23, d + .06, x, 1.86, z);
      box("stripe", w + .07, 0.15, d + .07, x, 0.42, z);
      box("skin", w * .76, 0.055, d * .74, x, 1.99, z);
    }
    for (const x of [-37, 37]) {
      for (const z of [-39, 39]) {
        wall(4.6, 5.2, 4.6, x, 2.6, z, 0x525b64);
        box("skin", 4.8, 0.28, 4.8, x, 5.24, z);
        box("stripe", 4.78, 0.3, 4.78, x, 4.6, z);
        box("signal", 0.24, 2.8, 0.22, x - Math.sign(x) * 2.39, 3.10, z);
      }
    }
    sign("CONTAINMENT", "#efae81", 0, 7.75, -48.45, 13.0);
    // The containment hall sits inside a much larger industrial complex. Broken rooflines,
    // exhaust stacks and warm furnace windows fill the view above the arena wall.
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * Math.PI * 2 + .08;
      const r = 72 + (i % 4) * 8;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const w = 9 + (i % 4) * 2.2, d = 8 + (i * 3 % 5) * 1.8, h = 18 + (i * 13 % 32);
      const yaw = -a + Math.PI / 2;
      box("frame", w, h, d, x, h / 2, z, yaw);
      box("recess", w * .72, h * .62, d + .08, x, h * .52, z, yaw);
      box("skin", w + .5, .55, d + .5, x, h + .24, z, yaw);
      box("stripe", w * .84, .22, d + .7, x, h * .78, z, yaw);
      box("signal", w * .58, .34, .18, x, h * .42, z + Math.cos(a) * (d * .52), yaw);
      if (i % 2 === 0) {
        const stackH = 20 + (i % 5) * 6;
        box("recess", 2.1, stackH, 2.1, x + Math.cos(a) * (w * .33), h + stackH * .5, z + Math.sin(a) * (d * .33), yaw);
        box("frame", 3.3, .8, 3.3, x + Math.cos(a) * (w * .33), h + stackH, z + Math.sin(a) * (d * .33), yaw);
      }
    }
    // Tall collision walls sit on the visible perimeter so flight cannot bypass the arena.
    boundary(102, 2.2, 0, -50);
    boundary(102, 2.2, 0, 50);
    boundary(2.2, 102, -50, 0);
    boundary(2.2, 102, 50, 0);
  }

  // One mesh per material keeps the additional fixtures cheap even on low graphics settings.
  const dummy = new THREE.Object3D();
  for (const [key, items] of batches) {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), materials[key], items.length);
    items.forEach(([w, h, d, x, y, z, yaw, roll], i) => {
      dummy.position.set(x, y, z); dummy.scale.set(w, h, d); dummy.rotation.set(0, yaw, roll);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.receiveShadow = true;
    // The boss deck now has a shadow-casting key light, so the heat-exchanger units, cornice
    // beams and corner blocks drop real shadows onto the floor. The training court has no such
    // key (its sun casts nothing), so leave its fixtures off to save the shadow pass there.
    mesh.castShadow = !training;
    root.add(mesh);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(training ? 68 : 100, training ? 74 : 100),
    new THREE.MeshStandardMaterial({ map: deckTexture(training, targets), roughness: 0.92, metalness: training ? .05 : .20 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -.014, training ? -11 : 0);
  floor.receiveShadow = true;
  root.add(floor);
  if (!training) {
    const water = new THREE.MeshStandardMaterial({
      color: 0x293941, metalness: .18, roughness: .13, transparent: true, depthWrite: true,
    });
    water.onBeforeCompile = shader => {
      shader.vertexShader = "varying vec3 vPuddleWorld;\n" + shader.vertexShader.replace("#include <project_vertex>",
        "#include <project_vertex>\nvPuddleWorld=(modelMatrix*vec4(transformed,1.0)).xyz;");
      shader.fragmentShader = "varying vec3 vPuddleWorld;\n" + BOSS_WATER_GLSL + shader.fragmentShader
        .replace("#include <opaque_fragment>", `
          float edge=bossWaterBank(vPuddleWorld.xz);
          float fres=pow(1.-max(0.,dot(normalize(normal),normalize(vViewPosition))),3.);
          diffuseColor.a=(.29+.53*fres)*smoothstep(0.,.22,edge);
          #include <opaque_fragment>`);
    };
    const puddles = new THREE.Mesh(bossWaterGeometry(THREE), water);
    puddles.position.y = BOSS_WATER_Y;
    puddles.receiveShadow = true;
    puddles.raycast = () => {};
    root.add(puddles);
  }
  return root;
}

function trainingSky() {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(100, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      horizon: { value: new THREE.Color(0xb7c6ce) },
      zenith: { value: new THREE.Color(0x597b98) },
    },
    vertexShader: `
      varying vec3 direction;
      void main() {
        direction = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }
    `,
    fragmentShader: `
      varying vec3 direction;
      uniform vec3 horizon, zenith;
      void main() {
        vec3 ray = normalize(direction);
        vec3 color = mix(horizon, zenith, smoothstep(-0.03, 0.65, ray.y));
        float haze = pow(max(0.0, dot(ray, normalize(vec3(0.5, 0.42, 0.16)))), 8.0);
        gl_FragColor = vec4(color + vec3(0.12, 0.105, 0.084) * haze, 1.0);
        #include <colorspace_fragment>
      }
    `,
  }));
  mesh.position.z = -11;
  mesh.renderOrder = -10;
  return mesh;
}

function deckTexture(training, targets) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1536;
  const c = canvas.getContext("2d");
  const size = canvas.width;
  let seed = 1973;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  c.fillStyle = training ? "#5d6562" : "#343940";
  c.fillRect(0, 0, size, size);
  for (let i = 0; i < 28000; i++) {
    c.fillStyle = i % 2 ? "rgba(230,222,198,0.065)" : "rgba(8,13,14,0.105)";
    c.fillRect(random() * size, random() * size, 1 + random() * 9, 1 + random() * 5);
  }
  for (let i = 0; i < size; i += 96) {
    c.fillStyle = "#151c2350"; c.fillRect(i, 0, 2, size); c.fillRect(0, i, size, 2);
    c.fillStyle = "#c4ceca2e"; c.fillRect(i + 2, 0, 1, size); c.fillRect(0, i + 2, size, 1);
  }
  const px = x => size * (x / (training ? 68 : 100) + .5);
  const py = z => size * ((z + (training ? 48 : 50)) / (training ? 74 : 100));
  if (training) {
    c.fillStyle = "#425459"; c.fillRect(px(-28), py(16), px(28) - px(-28), py(22) - py(16));
    c.fillStyle = "#d5b075"; c.fillRect(px(-30), py(18), px(30) - px(-30), 5);
    c.fillStyle = "#4e787c"; c.fillRect(px(-30), py(-10), px(30) - px(-30), 4);
    c.strokeStyle = "#a9c7c266"; c.lineWidth = 3;
    c.setLineDash([32, 22]);
    for (const x of [-24, -16, -8, 0, 8, 16, 24]) {
      c.beginPath(); c.moveTo(px(x), py(-36)); c.lineTo(px(x), py(18)); c.stroke();
    }
    c.setLineDash([]);
    for (const { lane, x, z, kind } of targets) {
      const tx = lane ? (lane.xMin + lane.xMax) * .5 : x;
      const tz = lane ? lane.z : z;
      c.strokeStyle = kind === "boss" ? "#e6ab72" : "#91bec3";
      c.strokeRect(px(tx) - (lane ? (lane.xMax - lane.xMin + 1) * 11 : 22), py(tz) - 17,
        lane ? (lane.xMax - lane.xMin + 1) * 22 : 44, 34);
    }
  } else {
    const center = size / 2;
    c.beginPath(); c.arc(center, center, 480, 0, 2 * Math.PI);
    c.fillStyle = "#161f2859"; c.fill();
    for (const [radius, color, width, dash] of [[535, "#855846", 5, [27, 14]], [508, "#d28e55", 8, [40, 12]], [477, "#a17d62", 3, []], [350, "#9ba8ac50", 3, [16, 24]]]) {
      c.beginPath(); c.arc(center, center, radius, 0, 2 * Math.PI);
      c.lineWidth = width; c.strokeStyle = color; c.setLineDash(dash); c.stroke();
    }
    c.setLineDash([]);
    c.strokeStyle = "#bd8156"; c.lineWidth = 5; c.strokeRect(px(-45), py(-45), size * .90, size * .90);
    for (const x of [-40, 40]) {
      c.fillStyle = "#232930"; c.fillRect(px(x) - 10, py(-43), 20, size * .86);
      c.fillStyle = "#737c7f";
      for (let z = py(-43); z < py(43); z += 9) c.fillRect(px(x) - 7, z, 14, 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
