import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/utils/SkeletonUtils.js";
import { MeshoptDecoder } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/libs/meshopt_decoder.module.js";

const BODY_HEIGHT = 1.88;
const sides = ["Right", "Left"];
const v = () => new THREE.Vector3();
const q = () => new THREE.Quaternion();
const scenePoint = v(), targetWrist = v(), targetElbow = v(), shoulderPoint = v(), endDirection = v(), pole = v();
const jointPosition = v(), oldDirection = v(), newDirection = v(), jointWorld = q(), parentWorld = q(), handWorld = q();
const crouchRotation = q(), airRotation = q();
let pending, asset;

function boneAliases(scene) {
  const bones = {};
  scene.traverse(node => {
    if (!node.isBone) return;
    bones[node.name] = node;
    if (/^mixamorig:?/i.test(node.name)) bones[node.name.replace(/^mixamorig:?/i, "")] = node;
    const match = /^Bip01(?:_(.+))?$/.exec(node.name);
    const label = match?.[1]?.replaceAll("_", " ");
    if (!label) return;
    const aliases = {
      "Pelvis": "Hips", "Spine": "Spine", "Spine1": "Spine1", "Spine2": "Spine2", "Neck": "Neck", "Head": "Head",
      "R Clavicle": "RightShoulder", "R UpperArm": "RightArm", "R Forearm": "RightForeArm", "R Hand": "RightHand",
      "L Clavicle": "LeftShoulder", "L UpperArm": "LeftArm", "L Forearm": "LeftForeArm", "L Hand": "LeftHand",
      "R Thigh": "RightUpLeg", "R Calf": "RightLeg", "R Foot": "RightFoot", "R Toe0": "RightToeBase",
      "L Thigh": "LeftUpLeg", "L Calf": "LeftLeg", "L Foot": "LeftFoot", "L Toe0": "LeftToeBase",
    };
    if (aliases[label]) bones[aliases[label]] = node;
  });
  return bones;
}

async function loadFirst(loader, urls) {
  let failure;
  for (const url of urls || []) {
    try { return await loader.loadAsync(url); } catch (error) { failure = error; }
  }
  throw failure || new Error("No asset URL was provided");
}

function inPlaceClip(source, name, lockArms = false) {
  const clip = source.clone();
  clip.name = name;
  clip.tracks = clip.tracks.filter(track => !/^Bip01\.position$/.test(track.name)
    && !(lockArms && /^Bip01[ _][RL][ _](?:Clavicle|UpperArm|Forearm|Hand)\./i.test(track.name)));
  return clip;
}

function finishMaterials(root) {
  root.traverse(node => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      if (!material) continue;
      if (material.name === "sm002_body" || material.name === "sm002_head") material.roughness = Math.max(.78, material.roughness || 0);
      if (material.name === "sm002_equipment") {
        material.roughness = Math.max(.72, material.roughness || 0);
        material.metalness = Math.min(.16, material.metalness || 0);
      }
    }
  });
}

export function loadOperatorAsset(sources) {
  return pending ||= (async () => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    try {
      const model = await loadFirst(loader, sources.model);
      finishMaterials(model.scene);
      model.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model.scene);
      const height = box.max.y - box.min.y;
      const bones = boneAliases(model.scene);
      if (height < .5 || !bones.RightArm || !bones.LeftArm || !bones.RightHand || !bones.LeftHand) {
        const names = [];
        model.scene.traverse(node => { if (node.isBone) names.push(node.name); });
        throw new Error(`Male soldier rig is missing its arms or hands: ${names.slice(0, 20).join(", ")}`);
      }
      let skinnedMeshes = 0;
      model.scene.traverse(node => { if (node.isSkinnedMesh) skinnedMeshes++; });
      if (!skinnedMeshes) throw new Error("Male soldier has no skinned character mesh");
      const clips = {};
      for (const name of ["idle", "walk", "run"]) {
        const gltf = await loadFirst(loader, sources[name]);
        if (!gltf.animations?.length) throw new Error(`Missing ${name} clip`);
        clips[name] = inPlaceClip(gltf.animations[0], name);
        if (name !== "idle") clips[`${name}Armed`] = inPlaceClip(gltf.animations[0], `${name}Armed`, true);
      }
      asset = {
        scene: model.scene, clips, scale: BODY_HEIGHT / height, floor: -box.min.y * BODY_HEIGHT / height,
      };
      return true;
    } catch (error) {
      console.warn("[operator] Could not load male soldier asset", error);
      return false;
    }
  })();
}

function makeRig() {
  const model = clone(asset.scene);
  const root = new THREE.Group();
  root.add(model);
  model.position.y = asset.floor;
  model.scale.set(asset.scale * 1.06, asset.scale, asset.scale * 1.06);
  root.updateMatrixWorld(true);
  const bones = boneAliases(model);
  const meshes = [];
  model.traverse(mesh => {
    if (!mesh.isSkinnedMesh) return;
    mesh.frustumCulled = false;
    mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, .97, 0), 1.65).applyMatrix4(mesh.matrixWorld.clone().invert());
    meshes.push(mesh);
  });
  return { root, model, bones, meshes, wrists: [v(), v()] };
}

export function createImportedOperator() {
  if (!asset) return null;
  const rig = makeRig();
  rig.mixer = new THREE.AnimationMixer(rig.model);
  rig.actions = new Map();
  rig.current = null;
  rig.active = null;
  rig.bindPose = new Map([...new Set(Object.values(rig.bones))].map(bone => [bone, bone.quaternion.clone()]));
  rig.bindPositions = new Map([...new Set(Object.values(rig.bones))].map(bone => [bone, bone.position.clone()]));
  return rig;
}

function playAction(rig, name, speed) {
  const clip = asset.clips[name] || asset.clips.idle;
  if (rig.current !== name) {
    const previous = rig.active;
    let action = rig.actions.get(name);
    if (!action) {
      action = rig.mixer.clipAction(clip);
      rig.actions.set(name, action);
    }
    previous?.fadeOut(.18);
    action.reset().setEffectiveWeight(1).play();
    if (previous) action.fadeIn(.18);
    rig.active = action;
    rig.current = name;
  }
  rig.active.setEffectiveTimeScale(speed);
}

function aimBone(joint, next, point) {
  joint.getWorldPosition(jointPosition);
  next.getWorldPosition(oldDirection).sub(jointPosition).normalize();
  newDirection.subVectors(point, jointPosition).normalize();
  joint.getWorldQuaternion(jointWorld);
  joint.parent.getWorldQuaternion(parentWorld).invert();
  joint.quaternion.multiplyQuaternions(parentWorld, handWorld.setFromUnitVectors(oldDirection, newDirection).multiply(jointWorld));
  joint.updateWorldMatrix(false, true);
}

function solveArm(rig, side, wrist, elbowHint, wristRotation) {
  const { bones } = rig;
  const upper = bones[side + "Arm"], forearm = bones[side + "ForeArm"], hand = bones[side + "Hand"];
  if (!upper || !forearm || !hand) return;
  upper.getWorldPosition(shoulderPoint);
  forearm.getWorldPosition(jointPosition);
  const upperLength = shoulderPoint.distanceTo(jointPosition);
  const lowerLength = jointPosition.distanceTo(hand.getWorldPosition(scenePoint));
  endDirection.subVectors(wrist, shoulderPoint);
  const reach = endDirection.length();
  if (reach < 1e-5 || upperLength < .01 || lowerLength < .01) return;
  const distance = THREE.MathUtils.clamp(reach, Math.abs(upperLength - lowerLength) + .02, upperLength + lowerLength - .007);
  endDirection.divideScalar(reach);
  pole.subVectors(elbowHint, shoulderPoint).addScaledVector(endDirection, -pole.dot(endDirection));
  if (pole.lengthSq() < .0001) {
    pole.set(0, -1, 0).addScaledVector(endDirection, endDirection.y);
    if (pole.lengthSq() < .0001) pole.set(1, 0, 0).addScaledVector(endDirection, -endDirection.x);
  }
  pole.normalize();
  const along = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
  targetElbow.copy(shoulderPoint).addScaledVector(endDirection, along)
    .addScaledVector(pole, Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2)));
  aimBone(upper, forearm, targetElbow);
  targetElbow.copy(shoulderPoint).addScaledVector(endDirection, distance);
  aimBone(forearm, hand, targetElbow);
  hand.parent.getWorldQuaternion(parentWorld).invert();
  hand.quaternion.multiplyQuaternions(parentWorld, wristRotation);
}

export function animateImportedOperator(rp, dt, now, aim) {
  const rig = rp.importedOperator;
  if (!rig) return;
  const speed = rp.operatorSpeed || 0;
  const airborne = !!rp.operatorAirborne;
  const running = speed > 4.6;
  const action = airborne || running ? "run" : speed > .15 ? "walk" : "idle";
  const reference = action === "run" ? 2.9 : action === "walk" ? 1.35 : 1;
  const rate = action === "idle" ? 1 : THREE.MathUtils.clamp(speed / reference, .72, action === "walk" ? 1.65 : 1.45);
  const clipName = rp.primarySocket && action !== "idle" ? `${action}Armed` : action;
  playAction(rig, clipName, rate);
  for (const [bone, rotation] of rig.bindPose) bone.quaternion.copy(rotation);
  for (const [bone, position] of rig.bindPositions) bone.position.copy(position);
  rig.mixer.update(dt);
  const crouch = THREE.MathUtils.clamp(rp.crouchAmt || 0, 0, 1);
  rig.bones.Hips.position.y -= .17 * crouch;
  for (const side of sides) {
    const thigh = rig.bones[side + "UpLeg"], calf = rig.bones[side + "Leg"];
    if (thigh && calf) {
      crouchRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -.34 * crouch);
      airRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), airborne ? -.12 : 0);
      thigh.quaternion.multiply(crouchRotation).multiply(airRotation);
      crouchRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), .72 * crouch);
      airRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), airborne ? .28 : 0);
      calf.quaternion.multiply(crouchRotation).multiply(airRotation);
    }
  }
  rig.root.updateWorldMatrix(true, true);
  if (!rp.primarySocket) return;
  const sockets = [rp.primarySocket, rp.supportSocket?.visible ? rp.supportSocket : null];
  const armLengths = rig.armLengths ||= sides.map(side => {
    const upper = rig.bones[side + "Arm"], lower = rig.bones[side + "ForeArm"], hand = rig.bones[side + "Hand"];
    return upper.getWorldPosition(v()).distanceTo(lower.getWorldPosition(v())) + lower.getWorldPosition(v()).distanceTo(hand.getWorldPosition(v()));
  });
  for (let pass = 0; pass < 3; pass++) {
    let excess = 0;
    for (const [index, socket] of sockets.entries()) {
      if (!socket) continue;
      socket.localToWorld(targetWrist.copy(socket.userData.wrist));
      rig.bones[sides[index] + "Arm"].getWorldPosition(shoulderPoint);
      const span = shoulderPoint.distanceTo(targetWrist);
      const over = span - (armLengths[index] - .018);
      if (over <= 0 || over <= excess) continue;
      excess = over;
      scenePoint.copy(targetWrist).lerp(shoulderPoint, over / span);
      rp.group.worldToLocal(scenePoint);
      rp.group.worldToLocal(targetWrist);
      endDirection.subVectors(scenePoint, targetWrist);
    }
    if (!excess) break;
    rp.weaponHold.position.add(endDirection);
  }
  for (const [index, socket] of sockets.entries()) {
    if (!socket) continue;
    const side = sides[index];
    socket.localToWorld(rig.wrists[index].copy(socket.userData.wrist));
    rig.bones[side + "ForeArm"].getWorldPosition(pole);
    solveArm(rig, side, rig.wrists[index], pole, rig.bones[side + "Hand"].getWorldQuaternion(q()));
  }
  rig.root.updateWorldMatrix(true, true);
}

