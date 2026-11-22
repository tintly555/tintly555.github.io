import * as THREE from "three";
import { OPERATOR, bindGarment, garmentGeometry } from "./operator-model.js?v=field-rig";

const downward = new THREE.Vector3(0, -1, 0);
const axis = new THREE.Vector3(), pole = new THREE.Vector3(), hinge = new THREE.Vector3();
const upperVector = new THREE.Vector3(), lowerVector = new THREE.Vector3();
const sideways = new THREE.Vector3(), back = new THREE.Vector3(), up = new THREE.Vector3();
const basis = new THREE.Matrix4(), lowerWorld = new THREE.Quaternion();
const target = new THREE.Vector3(), kneePole = new THREE.Vector3(), bootTurn = new THREE.Quaternion();
const bootEuler = new THREE.Euler(0, 0, 0, "YXZ");
const tau = Math.PI * 2;

export function solveOperatorLimb(root, joint, end, bend, upper, lower, orientKnee = false) {
  axis.subVectors(end, root.position);
  const reach = axis.length();
  if (reach > .00001) axis.divideScalar(reach);
  else axis.copy(downward);
  const flexionLimit = orientKnee ? .234 : .129;
  const distance = THREE.MathUtils.clamp(reach, Math.max(flexionLimit, Math.abs(upper - lower) + .004), upper + lower - .004);
  pole.copy(bend).addScaledVector(axis, -bend.dot(axis));
  if (pole.lengthSq() < .0001) {
    pole.set(Math.abs(axis.x) > .8 ? 0 : 1, 0, Math.abs(axis.x) > .8 ? 1 : 0);
    pole.addScaledVector(axis, -pole.dot(axis));
  }
  pole.normalize();
  const along = (upper * upper + distance * distance - lower * lower) / (2 * distance);
  hinge.copy(axis).multiplyScalar(along).addScaledVector(pole, Math.sqrt(Math.max(0, upper * upper - along * along)));
  upperVector.copy(hinge).normalize();
  lowerVector.copy(axis).multiplyScalar(distance).sub(hinge).normalize();
  if (orientKnee) {
    sideways.crossVectors(pole, axis).normalize();
    up.copy(upperVector).negate();
    back.crossVectors(sideways, up).normalize();
    root.quaternion.setFromRotationMatrix(basis.makeBasis(sideways, up, back));
    up.copy(lowerVector).negate();
    back.crossVectors(sideways, up).normalize();
    lowerWorld.setFromRotationMatrix(basis.makeBasis(sideways, up, back));
    joint.quaternion.copy(root.quaternion).invert().multiply(lowerWorld);
  } else {
    root.quaternion.setFromUnitVectors(downward, upperVector);
    lowerVector.applyQuaternion(lowerWorld.copy(root.quaternion).invert());
    joint.quaternion.setFromUnitVectors(downward, lowerVector);
  }
}

export function operatorCycleLength(speed, crouch) {
  return THREE.MathUtils.lerp(THREE.MathUtils.clamp(1.25 + speed * .16, 1.25, 2.75), 1.05, crouch);
}

export function advanceOperatorGait(phase, speed, dt, crouch) {
  return (phase + tau * Math.min(2.3, speed / operatorCycleLength(speed, crouch)) * dt) % tau;
}

export function operatorStride(speed, crouch) {
  return Math.min(.46, operatorCycleLength(speed, crouch) * .29) * THREE.MathUtils.smoothstep(speed, .03, 2.5);
}

export function operatorFootTarget(out, phase, side, travelX, travelZ, hip, crouch, airborne, flight, dash) {
  const cycle = (phase / tau + (side > 0 ? .5 : 0)) % 1;
  const swing = THREE.MathUtils.clamp((cycle - .58) / .42, 0, 1);
  const coast = swing * swing * swing * (swing * (6 * swing - 15) + 10);
  const excursion = cycle < .58 ? 1 - 2 * cycle / .58 : 2 * coast - 1;
  const amplitude = Math.hypot(travelX, travelZ);
  const lateralGait = Math.abs(travelX) / (amplitude + .0001);
  const lift = Math.sin(Math.PI * swing) ** 1.7 * Math.min(.16, amplitude * (.48 - lateralGait * .13));
  const heel = Math.min(1, amplitude * 4);
  const heelRoll = cycle < .20 ? -.17 * (1 - cycle / .20) : .29 * THREE.MathUtils.smoothstep(cycle, .36, .58) * (1 - coast);
  const inwardLimit = .073 + crouch * .015;
  const spread = .13 + crouch * .03;
  const signedStep = side * travelX * excursion;
  const stepWidth = signedStep < 0 ? inwardLimit + (spread - inwardLimit) * Math.exp(signedStep / (spread - inwardLimit))
    : spread + .265 * Math.tanh(signedStep / .265);
  const rise = (lift + Math.abs(heelRoll) * heel * .030) * (1 - airborne)
    + (.126 + .044 * Math.abs(flight) + (side > 0 ? .037 : 0)) * airborne;
  out.set(side * (stepWidth * (1 - airborne) + .157 * airborne),
    Math.min(Math.max(OPERATOR.sole, hip - .21), OPERATOR.sole + rise),
    (travelZ * excursion + side * .027 * (1 - lateralGait) + .083 * crouch) * (1 - airborne)
      + (.09 - side * .12 + .066 * flight - .24 * dash) * airborne);
  return heelRoll * heel * (1 - lateralGait * .72);
}

export function poseOperatorFoot(leg, phase, side, travelX, travelZ, hip, crouch, airborne, flight, dash) {
  leg.position.set(side * .109, hip, -.093 * crouch);
  const heelRoll = operatorFootTarget(target, phase, side, travelX, travelZ, hip, crouch, airborne, flight, dash);
  const turn = Math.atan2(travelX, Math.abs(travelZ) + .35);
  kneePole.set(side * .16 + turn * .23, 0, 1);
  const { knee, ankle } = leg.userData;
  solveOperatorLimb(leg, knee, target, kneePole, OPERATOR.thigh, OPERATOR.shin, true);
  bootTurn.setFromEuler(bootEuler.set(heelRoll * (1 - airborne) + (.21 - .15 * flight) * airborne,
    side * .095 + turn * .25, 0));
  ankle.quaternion.copy(leg.quaternion).multiply(knee.quaternion).invert().multiply(bootTurn);
}

export function operatorEnvelope(progress, enter, exit) {
  return THREE.MathUtils.smootherstep(progress, 0, enter) * (1 - THREE.MathUtils.smootherstep(progress, exit, 1));
}

export function operatorShot(age, heavy) {
  if (!Number.isFinite(age) || age < 0) return 0;
  const rise = 1 - Math.exp(-age / .011);
  const decay = Math.exp(-age / (heavy ? .19 : .14));
  const reboundAge = age - (heavy ? .11 : .085);
  const rebound = reboundAge > 0
    ? .045 * Math.sin(Math.min(Math.PI, reboundAge * (heavy ? 15 : 19)))
      * Math.exp(-reboundAge * (heavy ? 7 : 9))
    : 0;
  return 1.18 * rise * decay - rebound;
}

export function digitGeometry(THREE, joints) {
  const spline = new THREE.CatmullRomCurve3(joints.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const rows = (joints.length - 1) * 4, sides = 10;
  const geometry = new THREE.TubeGeometry(spline, rows, 1, sides, false);
  const positions = geometry.attributes.position;
  const coordinates = geometry.attributes.uv;
  const center = new THREE.Vector3();
  for (let row = 0; row <= rows; row++) {
    const progress = row / rows;
    const section = spline.getUtoTmapping(progress) * (joints.length - 1);
    const interval = Math.min(joints.length - 2, Math.floor(section));
    const radius = THREE.MathUtils.lerp(joints[interval][3], joints[interval + 1][3], section - interval);
    spline.getPointAt(progress, center);
    for (let column = 0; column <= sides; column++) {
      const index = row * (sides + 1) + column;
      positions.setXYZ(index,
        center.x + (positions.getX(index) - center.x) * radius,
        center.y + (positions.getY(index) - center.y) * radius * .84,
        center.z + (positions.getZ(index) - center.z) * radius);
      coordinates.setXY(index, progress, column / sides);
    }
  }
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  for (let row = 0; row <= rows; row++) {
    const first = row * (sides + 1), last = first + sides;
    upperVector.fromBufferAttribute(normals, first).add(lowerVector.fromBufferAttribute(normals, last)).normalize();
    normals.setXYZ(first, upperVector.x, upperVector.y, upperVector.z);
    normals.setXYZ(last, upperVector.x, upperVector.y, upperVector.z);
  }
  return geometry;
}

export function buildOperatorGlove(kit, parent, materials, sign, width, depth, indexed = false, underhand = false) {
  const wrist = [sign * (width + (underhand ? .005 : .003)), underhand ? -.047 : -.048, underhand ? -.026 : depth * .60];
  const palm = garmentGeometry([
    [.040,.004,.005,.004], [.034,.015,depth*.72,.004], [.019,.020,depth*.88,.004],
    [.002,.020,depth*.98,.004], [-.019,.018,depth*.94,.006], [-.035,.014,depth*.72,.009],
    [-.044,.011,depth*.56,.012],
  ], 18);
  kit.put(parent, palm, materials.glove, sign * (width + .007), 0, depth * .32);
  const cuff = garmentGeometry([[0,.024,.020],[-.015,.025,.021],[-.022,.021,.018]], 18);
  kit.put(parent, cuff, materials.webbing, wrist[0], wrist[1]+.013, wrist[2]);
  for (let finger = 0; finger < 4; finger++) {
    const height = [.024,.007,-.011,-.027][finger];
    const radius = [.0089,.010,.0091,.0077][finger];
    const pad = width + .013, nose = -depth - .008 + finger * .002;
    let digitParent = parent;
    let origin = [0, 0, 0];
    let joints = [
      [sign*pad,height,-depth*.20,radius],
      [sign*(width+.009),height+.001,nose+.005,radius],
      [sign*(width*.19),height-.001,nose,radius*.93],
      [-sign*(width+.003),height-.004,nose+.005,radius*.85],
      [-sign*(width+.008),height-.006,depth*(.22-finger*.08),radius*.70],
      [-sign*(width+.006),height-.006,depth*(.31-finger*.08),.0006],
    ];
    if (finger === 0 && indexed) {
      digitParent = new THREE.Group();
      origin = [sign*pad,height,-depth*.25];
      digitParent.position.set(...origin);
      parent.add(digitParent);
      parent.userData.triggerFinger = digitParent;
      joints = [[0,0,.006,radius],[sign*.003,.005,-.012,radius],[-sign*.005,.004,-.030,radius*.86],
        [-sign*.018,.002,-.041,radius*.7],[-sign*.024,.002,-.044,.0006]];
    }
    kit.put(digitParent, digitGeometry(THREE, joints), materials.glove);
    const knuckle = garmentGeometry([[.007,.005,.007],[.003,.008,.010],[-.004,.009,.010],[-.008,.004,.005]], 12);
    kit.put(parent, knuckle, materials.pad, sign*(pad+.009), height+.001, -depth*.11, .08, 0, -.1*sign);
  }
  kit.put(parent, digitGeometry(THREE, [
    [sign*(width+.020),-.013,depth*.74,.013],[sign*(width+.013),.009,depth+.009,.013],
    [sign*(width*.54),.033,depth+.012,.011],[-sign*(width*.32),.040,depth*.63,.010],
    [-sign*(width*.64),.037,depth*.04,.008],[-sign*(width*.68),.036,-depth*.14,.0006],
  ]), materials.glove);
  return wrist;
}

const viewFore = OPERATOR.forearm;
const viewUpper = OPERATOR.upperArm;
let viewSleeveGeometry, cuffGeometry;
export function buildOperatorViewSleeve(materials, parent, wrist, initial, side) {
  viewSleeveGeometry ||= garmentGeometry([
    [.013,.028,.025],[0,.032,.028],[-.023,.034,.029,0,.001],[-.055,.039,.033,0,.003],
    [-.096,.044,.038,.005,.003],[-.145,.050,.042,.004,.003],[-.198,.056,.047,.005,.004],
    [-viewFore+.040,.055,.047,.004,.004],[-viewFore+.017,.052,.048,.003,.005],
    [-viewFore,.050,.046,.001,.006],[-viewFore-.028,.053,.052,0,.005],
    [-viewFore-.066,.057,.054,0,.004],[-viewFore-.119,.061,.057,-.002,.005],
    [-viewFore-.175,.063,.059,-.002,.005],[-viewFore-.237,.070,.063,-.003,.004],
    [-viewFore-viewUpper,.067,.061,-.003,.004],[-viewFore-viewUpper-.027,.044,.045],
    [-viewFore-viewUpper-.045,.002,.002],
  ], 28, true);
  cuffGeometry ||= garmentGeometry([[.016,.029,.026],[.006,.034,.030],[-.016,.036,.031],[-.023,.033,.029]]);
  const sleeve = new THREE.Bone(), elbow = new THREE.Bone();
  sleeve.position.set(...wrist);
  elbow.position.y = -viewFore;
  sleeve.add(elbow);
  parent.add(sleeve);
  bindGarment(sleeve, elbow, materials.sleeve, viewSleeveGeometry.clone(), .067).frustumCulled = false;
  sleeve.add(new THREE.Mesh(cuffGeometry.clone(), materials.webbing));
  const rest = new THREE.Vector3(...initial).normalize();
  sleeve.quaternion.setFromUnitVectors(downward, rest);
  elbow.rotation.x = -.29;
  return { sleeve, elbow, side };
}

const shoulder = new THREE.Vector3(), elbowHint = new THREE.Vector3();
export function poseOperatorViewSleeve(hand, camera) {
  const rig = hand?.userData.viewSleeve;
  if (!rig || !hand.visible) return;
  const { sleeve, elbow, side } = rig;
  shoulder.set(side * OPERATOR.shoulderWidth, -.245, -.025);
  elbowHint.set(side * .29, -.49, -.30);
  camera.localToWorld(shoulder);
  camera.localToWorld(elbowHint);
  hand.worldToLocal(shoulder);
  hand.worldToLocal(elbowHint);
  elbowHint.sub(sleeve.position);
  const reach = shoulder.distanceTo(sleeve.position);
  const upper = Math.max(viewUpper, reach - viewFore * .85);
  elbow.scale.y = upper / viewUpper;
  solveOperatorLimb(sleeve, elbow, shoulder, elbowHint, viewFore, upper);
}
