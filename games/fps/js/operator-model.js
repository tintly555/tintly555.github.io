import * as THREE from "three";
import { mergeGeometries } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/utils/BufferGeometryUtils.js";

export const OPERATOR = Object.freeze({
  hip: .846, pelvis: .726, chest: 1.24, shoulder: 1.466, shoulderWidth: .197, head: 1.703,
  upperArm: .315, forearm: .291, thigh: .389, shin: .373, sole: .092,
});

const TAU = Math.PI * 2;
const shapes = new Map();
const fabrics = new Map();

function fabricMaps(sleeve = false) {
  if (fabrics.has(sleeve)) return fabrics.get(sleeve);
  const size = sleeve ? 256 : 128;
  const tone = new Uint8Array(size * size * 4);
  const normal = new Uint8Array(tone.length);
  const height = (x, y) => Math.cos(x * Math.PI / 2) * (.48 + .38 * Math.cos(y * Math.PI / 8))
    + Math.cos(y * Math.PI / 2) * (.48 - .38 * Math.cos(x * Math.PI / 8));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const grain = (Math.imul(x + y * size + 1, 1597334677) >>> 23) / 511;
      const fade = Math.sin(x * TAU / size) * Math.cos(y * TAU / size) + .25 * Math.sin((x + y) * TAU * 3 / size);
      const seamOffset = sleeve ? x - (x < 99 ? 39 : 159) : size;
      const seam = Math.abs(seamOffset);
      const topstitch = seam === 4 && y % 11 < 6 ? 37 : 0;
      const panel = sleeve && x > 40 && x < 158 ? 28 : 0;
      const valley = seam < 3 ? 35 : 0;
      const value = (sleeve ? 188 : 219) + height(x, y) * 8 + grain * 15 + fade * 13 + topstitch - panel - valley;
      tone[index] = tone[index + 1] = tone[index + 2] = value;
      tone[index + 3] = normal[index + 3] = 255;
      const seamSlope = seam < 3 ? Math.sign(seamOffset) * 36 : 0;
      normal[index] = 128 + (height(x - 1, y) - height(x + 1, y)) * 13 + seamSlope;
      normal[index + 1] = 128 + (height(x, y - 1) - height(x, y + 1)) * 13;
      normal[index + 2] = 252;
    }
  }
  const make = (data, space) => {
    const texture = new THREE.DataTexture(data, size, size);
    texture.colorSpace = space;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  };
  const maps = { map: make(tone, THREE.SRGBColorSpace), normalMap: make(normal, THREE.NoColorSpace) };
  fabrics.set(sleeve, maps);
  return maps;
}

function textile(material, strength = .72) {
  Object.assign(material, fabricMaps());
  material.normalScale.setScalar(strength);
  material.needsUpdate = true;
  return material;
}

export function operatorSleeveMaterial(color = 0x3e4638) {
  return new THREE.MeshStandardMaterial({
    color, ...fabricMaps(true), roughness: 1, metalness: 0, normalScale: new THREE.Vector2(.76, .76),
  });
}

function cached(key, make) {
  let geometry = shapes.get(key);
  if (!geometry) {
    geometry = make();
    shapes.set(key, geometry);
  }
  return geometry.clone();
}

export function garmentGeometry(rings, sections = 24, sleeve = false) {
  const positions = [], uvs = [], triangles = [];
  for (let row = 0; row < rings.length; row++) {
    const [height, width, depth, front = 0, wrinkling = 0] = rings[row];
    for (let column = 0; column <= sections; column++) {
      const angle = TAU * (column % sections) / sections;
      const fold = wrinkling * (.64 * Math.sin(angle * 3 + height * 13) + .36 * Math.cos(angle * 7 - height * 22));
      positions.push((width + fold) * Math.cos(angle), height, front + (depth + fold) * Math.sin(angle));
      uvs.push(sleeve ? column / sections : column / sections * 3,
        sleeve ? (height - rings.at(-1)[0]) / (rings[0][0] - rings.at(-1)[0]) : height * 8);
      if (row && column) {
        const current = row * (sections + 1) + column;
        const previous = current - sections - 1;
        triangles.push(previous - 1, previous, current, previous - 1, current, current - 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(triangles);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  const average = new THREE.Vector3(), edge = new THREE.Vector3();
  for (let row = 0; row < rings.length; row++) {
    const first = row * (sections + 1), last = first + sections;
    average.fromBufferAttribute(normals, first).add(edge.fromBufferAttribute(normals, last)).normalize();
    normals.setXYZ(first, average.x, average.y, average.z);
    normals.setXYZ(last, average.x, average.y, average.z);
  }
  return geometry;
}

export function bindGarment(parent, joint, material, geometry, span) {
  const weights = [], indices = [];
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const lower = 1 - THREE.MathUtils.smoothstep(positions.getY(index), joint.position.y - span, joint.position.y + span);
    weights.push(1 - lower, lower, 0, 0);
    indices.push(0, 1, 0, 0);
  }
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(weights, 4));
  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(indices, 4));
  const mesh = new THREE.SkinnedMesh(geometry, material);
  parent.add(mesh);
  parent.updateWorldMatrix(true, true);
  mesh.bind(new THREE.Skeleton([parent, joint]), parent.matrixWorld);
  mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), .85);
  return mesh;
}

const upper = OPERATOR.upperArm;
const fore = OPERATOR.forearm;
const thigh = OPERATOR.thigh;
const shin = OPERATOR.shin;
const arms = [
  [.047,.002,.002], [.037,.044,.049], [.012,.063,.065], [-.030,.068,.066,0,.003], [-.09,.064,.063,-.004,.005],
  [-.16,.058,.061,-.006,.004], [-upper+.078,.055,.053,-.003,.004], [-upper+.031,.051,.051,-.004,.005],
  [-upper,.049,.050,-.003,.006], [-upper-.033,.054,.052,.001,.005], [-upper-.075,.058,.053,.004,.004],
  [-upper-.127,.051,.047,.004,.005], [-upper-.190,.044,.042,.003,.004], [-upper-fore+.032,.034,.032,0,.003],
  [-upper-fore,.034,.030],
];
const trousers = [
  [.066,.002,.002], [.047,.092,.084,-.015], [-.018,.105,.095,-.012,.004], [-.105,.101,.096,-.009,.006],
  [-.165,.092,.088,-.002,.005], [-.245,.082,.078,.005,.005], [-thigh+.056,.069,.071,.008,.004],
  [-thigh+.024,.066,.071,.008,.006], [-thigh,.065,.070,.008,.005], [-thigh-.030,.066,.066,0,.005],
  [-thigh-.099,.069,.072,-.016,.004], [-thigh-.155,.066,.072,-.020,.005], [-thigh-.22,.056,.058,-.017,.004],
  [-thigh-shin+.066,.042,.044,-.010,.004], [-thigh-shin+.029,.044,.041,-.006,.005], [-thigh-shin+.018,.041,.039],
];
const jacket = [
  [.354,.002,.002], [.332,.055,.054,.005], [.272,.086,.068,.002], [.249,.124,.083,-.005],
  [.232,.199,.106,-.012], [.204,.221,.114,-.014,.003], [.153,.218,.124,-.017,.005],
  [.097,.205,.133,-.014,.005], [.011,.184,.124,-.010,.004], [-.115,.163,.108,-.007,.005],
  [-.218,.153,.106,-.002,.005], [-.315,.169,.114,.002,.006], [-.390,.176,.110,.002,.004],
  [-.422,.156,.100], [-.424,.002,.002],
];

function sculptedVolume(outline, depth, bevel) {
  const shape = new THREE.Shape();
  outline.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  parent.add(part);
  return part;
}

function block(width, height, depth, radius = .008) {
  return sculptedVolume([[-width / 2, -height / 2], [width / 2, -height / 2],
    [width / 2, height / 2], [-width / 2, height / 2]], depth, radius);
}

function batch(parent) {
  const groups = new Map();
  for (const child of parent.children) {
    if (!child.isMesh || child.isSkinnedMesh) continue;
    const parts = groups.get(child.material) || [];
    parts.push(child);
    groups.set(child.material, parts);
  }
  for (const [material, parts] of groups) {
    if (parts.length < 2) continue;
    const baked = parts.map(part => {
      part.updateMatrix();
      const geometry = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone();
      geometry.clearGroups();
      geometry.applyMatrix4(part.matrix);
      return geometry;
    });
    const merged = mergeGeometries(baked);
    baked.forEach(geometry => geometry.dispose());
    if (!merged) continue;
    parent.remove(...parts);
    parts.forEach(part => part.geometry.dispose());
    mesh(parent, merged, material);
  }
}

export function buildOperatorShell(palette) {
  const cloth = textile(palette.mCamo1), nylon = textile(palette.mCamo2), pants = textile(palette.mPants);
  const sleeveCloth = operatorSleeveMaterial(cloth.color.clone().lerp(new THREE.Color(0x30382c), .63));
  const armor = palette.mVest, helmet = palette.mHelm;
  const make = (color, roughness, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const leather = make(0x282725, .88);
  const rubber = make(0x191b1a, .95);
  const straps = textile(make(0x575342, .92));
  const fastener = make(0x777b73, .61, .4);
  const skin = make(0xa48168, .85);
  const glass = make(0x243234, .27, .35);
  const lining = textile(make(0x242626, .95));
  const carrier = new THREE.Group(), waist = new THREE.Group(), headGroup = new THREE.Group();
  carrier.position.y = OPERATOR.chest;
  waist.position.y = OPERATOR.pelvis;
  headGroup.position.y = OPERATOR.head;

  mesh(carrier, cached("jacket", () => garmentGeometry(jacket, 32)), cloth);
  const collar = mesh(carrier, cached("collar", () => garmentGeometry([
    [.32,.061,.057], [.302,.066,.062], [.266,.076,.071], [.252,.077,.074],
  ])), lining);
  collar.position.z = .006;
  mesh(carrier, new THREE.BoxGeometry(.008, .48, .008), straps, 0, -.084, .119);
  const plate = [[-.145,-.162],[.145,-.162],[.143,.093],[.089,.165],[-.089,.165],[-.143,.093]];
  mesh(carrier, sculptedVolume(plate, .035, .012), nylon, 0, .011, .12);
  mesh(carrier, sculptedVolume(plate, .047, .013), nylon, 0, .004, -.109);
  const belly = mesh(carrier, block(.254,.056,.161), straps, 0, -.132, .007);
  belly.rotation.x = -.06;
  for (const side of [-1, 1]) {
    const harness = mesh(carrier, block(.038,.168,.033,.006), straps, side*.103,.133,.104);
    harness.rotation.x = -.43;
    harness.rotation.z = side * -.10;
    mesh(carrier, block(.033,.020,.016,.003), fastener, side*.099,.084,.146);
    const elbowRoom = mesh(carrier, block(.054,.131,.096,.012), nylon, side*.144,-.071,-.065);
    elbowRoom.rotation.y = side * .21;
  }
  for (const center of [-.092, -.006, .08]) {
    mesh(carrier, block(.073,.111,.047,.009), armor, center,-.071,.157);
    mesh(carrier, block(.074,.023,.052,.005), straps, center,-.023,.159);
    mesh(carrier, block(.019,.015,.007,.002), fastener, center,-.065,.188);
  }
  mesh(carrier, block(.073,.026,.007,.003), straps, -.059,.075,.152);
  mesh(carrier, block(.043,.015,.006,.002), fastener, -.059,.074,.16);
  mesh(carrier, block(.162,.197,.085,.018), nylon, -.039,-.031,-.174);
  mesh(carrier, block(.169,.041,.088,.010), straps, -.039,.06,-.174);
  for (const side of [-1, 1]) {
    mesh(carrier, block(.023,.116,.016,.004), straps, -.039 + side*.051,-.034,-.220).rotation.z = side * .05;
    mesh(carrier, block(.026,.018,.012,.002), fastener, -.039 + side*.051,.005,-.229);
  }
  mesh(carrier, block(.054,.109,.041,.006), lining, .113,-.026,-.155);
  mesh(carrier, new THREE.CylinderGeometry(.004,.006,.13,8), rubber, .116,.083,-.156).rotation.z = -.13;
  mesh(waist, cached("seat", () => garmentGeometry([
    [.156,.002,.002], [.144,.149,.106], [.098,.174,.114], [.034,.175,.117,-.013,.004],
    [-.051,.167,.104,-.017,.005], [-.105,.112,.067,-.011], [-.121,.002,.002],
  ])), pants);
  mesh(waist, cached("belt", () => garmentGeometry([[.142,.154,.114],[.112,.164,.119],[.105,.163,.116]])), straps);
  mesh(waist, block(.053,.026,.017,.005), fastener, 0,.121,.116);
  mesh(waist, block(.069,.095,.062,.010), nylon, .167,.049,-.040).rotation.z = .16;
  mesh(waist, block(.090,.080,.055,.010), armor, -.161,.038,-.078).rotation.y = -.27;

  mesh(headGroup, cached("face", () => garmentGeometry([
    [.124,.002,.002], [.108,.051,.068,-.016], [.077,.077,.090,-.013], [.026,.084,.098,-.009],
    [-.019,.080,.096,-.004], [-.052,.071,.085,-.005], [-.088,.050,.068,-.006],
    [-.104,.029,.041,-.008], [-.152,.047,.044,-.023], [-.211,.049,.046,-.022],
  ], 32)), skin);
  mesh(headGroup, cached("gaiter", () => garmentGeometry([
    [-.035,.059,.071,-.021], [-.057,.073,.076,-.018], [-.093,.057,.063,-.010,.002],
    [-.125,.048,.051,-.018,.003], [-.153,.050,.049,-.021,.004], [-.189,.056,.053,-.018,.003],
  ])), lining);
  mesh(headGroup, cached("helmet", () => garmentGeometry([
    [.153,.002,.002], [.145,.051,.066,-.019], [.124,.083,.099,-.018], [.090,.100,.113,-.018],
    [.054,.110,.119,-.017], [.031,.109,.117,-.017],
  ], 32)), helmet);
  const shroud = [[-.105,.039],[-.098,.012],[-.065,-.031],[.065,-.031],[.098,.012],[.105,.039]];
  mesh(headGroup, sculptedVolume(shroud, .018,.007), rubber, 0,.008,.083);
  for (const side of [-1, 1]) {
    const lens = mesh(headGroup, block(.066,.033,.013,.008), glass, side*.043,.029,.102);
    lens.rotation.y = side*.32;
    mesh(headGroup, block(.017,.082,.047,.009), lining, side*.089,-.014,-.019);
    mesh(headGroup, block(.022,.017,.116,.004), straps, side*.086,-.057,-.014).rotation.z = side*.11;
  }
  mesh(headGroup, block(.112,.040,.022,.009), straps, 0,-.006,-.116);
  mesh(headGroup, block(.059,.060,.030,.009), helmet, 0,.012,-.124);
  const mask = [[-.069,.009],[-.024,.037],[.024,.037],[.069,.009],[.059,-.048],[.025,-.063],[-.025,-.063],[-.059,-.048]];
  mesh(headGroup, sculptedVolume(mask,.032,.010), rubber, 0,-.059,.071);
  const filter = mesh(headGroup, new THREE.CylinderGeometry(.033,.035,.028,16), helmet, -.057,-.083,.095);
  filter.rotation.set(Math.PI/2,-.12,.31);
  for (let slit = 0; slit < 4; slit++) {
    mesh(headGroup, new THREE.BoxGeometry(.035 - slit*.005,.003,.004), fastener, .011,-.064-slit*.008,.101);
  }

  const helmetArmor = new THREE.Group(), faceArmor = new THREE.Group(), chestArmor = new THREE.Group();
  headGroup.add(helmetArmor, faceArmor);
  carrier.add(chestArmor);
  mesh(helmetArmor, block(.085,.028,.037,.005), helmet, 0,.069,.097);
  for (const side of [-1, 1]) {
    mesh(faceArmor, block(.026,.067,.071,.010), helmet, side*.083,-.062,.044).rotation.x = -.24;
    mesh(chestArmor, block(.041,.176,.058,.013), armor, side*.155,-.060,.006).rotation.y = side*.14;
  }
  function setArmorLook(helmetTier, vestTier) {
    helmetArmor.visible = helmetTier >= 1;
    faceArmor.visible = helmetTier >= 3;
    chestArmor.visible = vestTier >= 2;
  }
  setArmorLook(0, 0);
  for (const part of [carrier, waist, headGroup, helmetArmor, chestArmor, faceArmor]) batch(part);

  function armShell(arm, side) {
    const elbow = new THREE.Bone();
    elbow.position.y = -upper;
    arm.add(elbow);
    bindGarment(arm, elbow, sleeveCloth, cached("sleeves", () => garmentGeometry(arms, 28, true)), .068);
    const sign = side === "R" ? 1 : -1;
    const pocket = mesh(arm, block(.016,.105,.077,.010), nylon, sign*.062,-.107,-.007);
    pocket.rotation.z = sign*-.12;
    mesh(arm, block(.010,.023,.068,.004), straps, sign*.069,-.067,-.005);
    const reinforcement = mesh(elbow, block(.064,.082,.013,.011), nylon, 0,-.038,-.046);
    reinforcement.rotation.x = -.08;
    mesh(elbow, cached("cuff", () => garmentGeometry([
      [-fore+.030,.036,.033], [-fore+.019,.038,.034], [-fore+.003,.036,.032], [-fore,.033,.029],
    ])), lining);
    batch(arm);
    return elbow;
  }

  function legShell(px) {
    const leg = new THREE.Bone(), knee = new THREE.Bone(), ankle = new THREE.Bone();
    knee.name = "knee";
    knee.position.y = -thigh;
    ankle.position.y = -shin;
    leg.add(knee);
    knee.add(ankle);
    bindGarment(leg, knee, pants, cached("trousers", () => garmentGeometry(trousers)), .062);
    const side = Math.sign(px);
    mesh(leg, block(.025,.156,.115,.012), nylon, side*.086,-.155,.003).rotation.z = side*-.10;
    mesh(leg, block(.029,.030,.116,.007), straps, side*.094,-.091,.007);
    const kneepad = [[-.061,.041],[-.052,-.032],[-.035,-.064],[.039,-.064],[.057,-.030],[.060,.041]];
    mesh(knee, sculptedVolume(kneepad,.014,.010), rubber, 0,-.027,.065);
    mesh(ankle, cached("boot-upper", () => garmentGeometry([
      [.090,.039,.039,-.005], [.044,.049,.046,-.008], [-.008,.049,.071,.016], [-.034,.054,.105,.043],
      [-.057,.057,.121,.052], [-.079,.056,.121,.051], [-.081,.002,.002,.051],
    ])), leather);
    mesh(ankle, cached("boot-sole", () => garmentGeometry([
      [-.068,.057,.124,.051], [-.085,.059,.124,.051], [-.092,.055,.117,.051], [-.0925,.001,.001,.051],
    ])), rubber);
    for (let lace = 0; lace < 4; lace++) {
      const stitch = mesh(ankle, block(.046,.003,.005,.001), straps, 0,.019-lace*.015,.045+lace*.028);
      stitch.rotation.z = lace % 2 ? .14 : -.14;
    }
    batch(leg);
    batch(ankle);
    leg.position.set(px, OPERATOR.hip, 0);
    leg.userData.knee = knee;
    leg.userData.ankle = ankle;
    return leg;
  }

  return { carrier, waist, headGroup, armShell, legShell, setArmorLook };
}
