import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/geometries/RoundedBoxGeometry.js";

// Feet are at y=0, with the armor and face forward on +Z. The outer rig owns
// the joints so hand IK, aim, crouch, and the network poses use the same lengths.
export function buildOperatorShell(palette) {
  const mat = (color, roughness, metalness = 0, emissive = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: .36 });
  const cloth = palette.mCamo1;
  const panels = palette.mCamo2;
  const armor = palette.mVest;
  const shell = palette.mHelm;
  const pants = palette.mPants;
  const rubber = mat(0x20282c, .95);
  const webbing = mat(0x3d4241, .94);
  const trim = mat(0x697273, .61, .42);
  const tag = mat(0xc58e52, .66, .22);
  const glass = mat(0x284950, .29, .46);
  const reflection = mat(0x7babae, .34, .27, 0x163740);
  const diode = mat(0x97cfd1, .36, .1, 0x4ba6ab);

  function part(parent, geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    parent.add(mesh);
    return mesh;
  }
  function box(parent, material, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    return part(parent, new RoundedBoxGeometry(w, h, d, 1, Math.min(w, h, d) * .28),
      material, x, y, z, rx, ry, rz);
  }
  function oval(parent, material, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    return part(parent, new THREE.SphereGeometry(1, 14, 10).scale(w, h, d), material, x, y, z, rx, ry, rz);
  }
  function tapered(parent, material, profile, depth, x, y, z) {
    const geometry = new THREE.LatheGeometry(profile.map(([r, height]) => new THREE.Vector2(r, height)), 16);
    return part(parent, geometry.scale(1, 1, depth), material, x, y, z);
  }
  function faceted(parent, material, vertices, thickness, x, y, z, rx = 0) {
    const shape = new THREE.Shape();
    vertices.forEach(([px, py], i) => i ? shape.lineTo(px, py) : shape.moveTo(px, py));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness, bevelEnabled: true, bevelSegments: 1, bevelSize: .006, bevelThickness: .006, steps: 1,
    });
    geometry.clearGroups();
    return part(parent, geometry, material, x, y, z, rx);
  }
  // A visor that bends around the helmet rather than floating in front of it.
  function visor(parent, material, angle, upper, lower, radius) {
    const positions = [], uvs = [], indices = [];
    const n = 16;
    for (let i = 0; i <= n; i++) {
      const a = angle * (2 * i / n - 1);
      const taper = Math.abs(2 * i / n - 1);
      const crown = upper - taper * taper * .020;
      const jaw = lower + taper * taper * .014 + .011 * Math.exp(-Math.pow(a / .24, 2));
      for (const [j, height] of [[0, jaw], [1, crown]]) {
        positions.push((.145 + radius) * Math.sin(a), height, .030 + (.143 + radius) * Math.cos(a));
        uvs.push(i / n, j);
      }
      if (i < n) {
        const v = i * 2;
        indices.push(v, v + 2, v + 1, v + 2, v + 3, v + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return part(parent, geometry, material, 0, 0, 0);
  }
  const carrier = new THREE.Group();
  carrier.position.y = 1.24;
  tapered(carrier, cloth, [[0,-.465],[.175,-.440],[.199,-.338],[.219,-.187],
    [.252,-.015],[.264,.126],[.229,.233],[.116,.316],[0,.318]], .63, 0, 0, 0);
  tapered(carrier, panels, [[0,-.421],[.194,-.418],[.207,-.352],[.205,-.289],[0,-.283]], .72, 0, 0, 0);
  oval(carrier, rubber, .109, .068, .096, 0, .329, .006);
  oval(carrier, webbing, .115, .035, .101, 0, .308, .005);
  const chest = [[-.146,-.140],[.146,-.140],[.191,-.092],[.193,.108],[.132,.168],[-.132,.168],[-.193,.108],[-.191,-.092]];
  faceted(carrier, rubber, chest, .049, 0, .012, .125, -.11);
  faceted(carrier, armor, [[-.133,-.090],[.133,-.090],[.168,-.043],[.166,.102],
    [.110,.142],[-.110,.142],[-.166,.102],[-.168,-.043]], .029, 0, .025, .179, -.11);
  box(carrier, webbing, .188, .056, .023, 0, .101, .211, -.11);
  box(carrier, tag, .056, .013, .008, -.047, .106, .226);
  box(carrier, trim, .035, .006, .010, .016, .105, .226);
  box(carrier, trim, .020, .006, .010, .052, .105, .226);
  for (const s of [-1, 1]) {
    box(carrier, webbing, .046, .219, .026, s * .151, .142, .148, -.44, s * .14, s * .13);
    box(carrier, trim, .043, .042, .013, s * .153, .159, .195, -.44);
    box(carrier, rubber, .098, .104, .085, s * .094, -.143, .202, -.10, s * .075);
    box(carrier, panels, .087, .037, .091, s * .094, -.113, .209, -.10, s * .075);
    box(carrier, webbing, .019, .069, .013, s * .094, -.141, .254, -.10);
    box(carrier, armor, .053, .172, .103, s * .204, -.057, .060, -.08, s * -.14);
  }
  faceted(carrier, rubber, [[-.133,-.160],[.133,-.160],[.158,-.105],[.149,.107],
    [.095,.164],[-.095,.164],[-.149,.107],[-.158,-.105]], .093, 0, .020, -.233, .10);
  box(carrier, armor, .213, .257, .055, 0, .017, -.238, .10);
  box(carrier, tag, .110, .017, .011, 0, .109, -.269);
  for (let i = 0; i < 3; i++) box(carrier, rubber, .135, .013, .009, 0, -.015 - .026 * i, -.274);
  box(carrier, webbing, .065, .159, .078, -.161, .065, -.181, .08);
  part(carrier, new THREE.CylinderGeometry(.007, .010, .192, 8), rubber, -.167, .211, -.191, -.24, 0, .17);
  box(carrier, diode, .012, .012, .008, -.178, .088, -.223);

  const waist = new THREE.Group();
  waist.position.y = .72;
  tapered(waist, pants, [[0,-.030],[.170,-.023],[.207,.024],[.207,.111],[.192,.147],[0,.152]], .74, 0, .045, 0);
  tapered(waist, webbing, [[.190,.057],[.223,.060],[.224,.115],[.204,.121]], .72, 0, .049, 0);
  box(waist, trim, .082, .055, .036, 0, .139, .171);
  box(waist, rubber, .040, .022, .012, 0, .139, .192);
  box(waist, webbing, .090, .165, .104, .212, .015, -.014, .07, -.19, -.12);
  box(waist, armor, .066, .090, .055, -.208, .071, .026, .06, .18, .14);

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.76;
  oval(headGroup, rubber, .092, .117, .083, 0, -.146, .003);
  oval(headGroup, webbing, .136, .144, .135, 0, -.025, .018, .12);
  oval(headGroup, shell, .151, .144, .150, 0, .045, .002, -.20);
  oval(headGroup, armor, .119, .079, .125, 0, .117, -.025, -.22);
  visor(headGroup, rubber, 1.20, .067, -.048, .011);
  visor(headGroup, glass, 1.10, .052, -.037, .013);
  visor(headGroup, reflection, .94, .050, .041, .015);
  oval(headGroup, panels, .101, .066, .069, 0, -.083, .105, -.18);
  box(headGroup, rubber, .069, .041, .035, 0, -.093, .167, -.17);
  for (let i = -1; i <= 1; i++) box(headGroup, trim, .008, .024, .011, i * .017, -.094, .187, -.17);
  for (const s of [-1, 1]) {
    oval(headGroup, rubber, .038, .064, .059, s * .130, -.007, -.032);
    box(headGroup, trim, .024, .059, .077, s * .155, .010, -.025, .10, s * .10);
    box(headGroup, tag, .022, .019, .049, s * .158, .021, -.027, .10);
    oval(headGroup, armor, .026, .039, .050, s * .090, -.084, .092, -.14, s * .23);
  }
  box(headGroup, diode, .021, .014, .013, .075, .089, .130, -.16, .36);

  function armShell(arm, side) {
    const s = side === "R" ? 1 : -1;
    tapered(arm, cloth, [[0,-.359],[.068,-.345],[.076,-.245],[.086,-.156],
      [.094,-.064],[.084,.009],[0,.029]], .97, 0, 0, 0);
    oval(arm, armor, .082, .108, .100, s * .019, -.069, .011, .16, 0, s * -.17);
    box(arm, webbing, .031, .086, .099, s * .087, -.149, -.004, .16);
    box(arm, tag, .009, .036, .054, s * .102, -.142, .001, .16);
    const elbow = new THREE.Group();
    elbow.position.y = -.36;
    arm.add(elbow);
    oval(elbow, rubber, .070, .064, .069, 0, .001, -.003);
    tapered(elbow, panels, [[0,-.341],[.050,-.330],[.057,-.251],[.071,-.124],
      [.076,-.059],[.069,-.015],[0,-.009]], .92, 0, 0, 0);
    oval(elbow, armor, .059, .101, .024, 0, -.132, .056, -.13);
    box(elbow, rubber, .105, .038, .100, 0, -.306, 0);
    if (s < 0) {
      box(elbow, rubber, .065, .079, .024, 0, -.246, .056, -.08);
      box(elbow, glass, .048, .048, .009, 0, -.240, .072, -.08);
      box(elbow, diode, .025, .005, .007, 0, -.241, .079);
    }
    return elbow;
  }

  function legShell(px) {
    const leg = new THREE.Group();
    tapered(leg, pants, [[0,-.380],[.073,-.371],[.081,-.303],[.089,-.202],
      [.109,-.088],[.108,-.013],[.082,.026],[0,.036]], 1.03, 0, 0, 0);
    box(leg, panels, .059, .170, .105, Math.sign(px) * .079, -.154, -.017, .08, Math.sign(px) * -.13);
    box(leg, webbing, .058, .025, .112, Math.sign(px) * .083, -.102, -.016);
    const knee = new THREE.Group();
    knee.name = "knee";
    knee.rotation.order = "YXZ";
    knee.position.y = -.38;
    leg.add(knee);
    oval(knee, pants, .080, .074, .079, 0, -.005, -.005);
    faceted(knee, armor, [[-.046,-.055],[.046,-.055],[.073,-.021],[.065,.044],
      [.040,.065],[-.040,.065],[-.065,.044],[-.073,-.021]], .030, 0, -.011, .069, -.13);
    box(knee, webbing, .072, .015, .008, 0, .005, .107);
    tapered(knee, pants, [[0,-.367],[.053,-.361],[.059,-.305],[.072,-.202],
      [.076,-.109],[.074,-.043],[0,-.018]], .92, 0, 0, 0);
    oval(knee, panels, .052, .103, .035, 0, -.169, .041, -.13);
    const ankle = new THREE.Group();
    ankle.position.y = -.366;
    knee.add(ankle);
    tapered(ankle, rubber, [[0,-.077],[.069,-.072],[.077,-.038],[.064,.056],[0,.061]], 1.07, 0, 0, .014);
    oval(ankle, webbing, .079, .050, .123, 0, -.054, .060, -.10);
    box(ankle, rubber, .162, .039, .267, 0, -.097, .062);
    box(ankle, panels, .139, .022, .066, 0, -.072, .157);
    for (let i = 0; i < 3; i++) box(ankle, trim, .053, .006, .012, 0, -.005 - i * .009, .075 + i * .018);
    leg.position.set(px, .865, 0);
    leg.userData.knee = knee;
    leg.userData.ankle = ankle;
    return leg;
  }
  return { carrier, waist, headGroup, armShell, legShell };
}
