import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";

export const ZOMBIE_LOOK_COUNT = 6;

export async function loadZombieCharacterMeshes(urls, atlas) {
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Character meshes returned HTTP ${response.status}`);
      let buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer, 0, 2);
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
        const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
        buffer = await new Response(stream).arrayBuffer();
      }
      return new ZombieCharacterMeshes(buffer, atlas);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Missing character meshes");
}

class ZombieCharacterMeshes {
  constructor(buffer, atlas) {
    const headerSize = new DataView(buffer).getUint32(0, true);
    const header = new TextDecoder().decode(new Uint8Array(buffer, 4, headerSize));
    const { models, joints } = JSON.parse(header);
    this.buffer = buffer;
    this.dataOffset = 4 + headerSize;
    this.joints = joints;
    this.records = new Map(models.map(record => [record.id, record]));
    this.geometries = new Map();
    const skinAndFabric = new THREE.MeshStandardMaterial({
      map: atlas, bumpMap: atlas, bumpScale: .009, roughness: .88, vertexColors: true,
    });
    skinAndFabric.name = "Zombie skin and clothing";
    const hair = new THREE.MeshStandardMaterial({
      map: atlas, roughness: .94, vertexColors: true, alphaTest: .41, side: THREE.DoubleSide,
    });
    hair.name = "Zombie hair";
    this.materials = [skinAndFabric, hair];
  }

  apply(visual, type, look) {
    const id = type + "-" + look;
    const record = this.records.get(id);
    if (!record) throw new Error("Missing zombie model " + id);
    const meshes = [];
    visual.traverse(node => { if (node.isSkinnedMesh) meshes.push(node); });
    const [body, ...oldParts] = meshes;
    if (!body || body.skeleton.bones.length !== this.joints.length ||
      body.skeleton.bones.some((bone, i) => bone.name !== "mixamorig" + this.joints[i])) {
      throw new Error("Zombie character mesh and animation skeleton do not match");
    }
    const geometry = this.geometryFor(record);
    // Use the skin binding from the existing animation skeleton. Each baked
    // character supplies its own head, body, garment topology, and skin weights.
    for (const part of oldParts) part.removeFromParent();
    body.geometry = geometry;
    body.material = this.materials;
    body.name = record.name;
    body.castShadow = true;
    body.receiveShadow = true;
    body.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 88, 0), 145);
    visual.userData.zombieDesign = record.name;
  }

  geometryFor(record) {
    const cached = this.geometries.get(record.id);
    if (cached) return cached;

    let offset = this.dataOffset + record.offset;
    const read = (Type, count) => {
      const data = new Type(this.buffer, offset, count);
      offset += data.byteLength;
      return data;
    };
    const n = record.vertices;
    const positions = Float32Array.from(read(Int16Array, n * 3), value => value * .01);
    const uv = read(Uint16Array, n * 2);
    const index = read(Uint16Array, record.indices);
    const normal = read(Int8Array, n * 3);
    const joints = read(Uint8Array, n * 4);
    const weights = read(Uint8Array, n * 4);
    const color = read(Uint8Array, n * 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3, true));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2, true));
    geometry.setAttribute("skinIndex", new THREE.BufferAttribute(joints, 4));
    geometry.setAttribute("skinWeight", new THREE.BufferAttribute(weights, 4, true));
    geometry.setAttribute("color", new THREE.BufferAttribute(color, 3, true));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    geometry.addGroup(0, record.opaque, 0);
    if (record.indices > record.opaque) {
      geometry.addGroup(record.opaque, record.indices - record.opaque, 1);
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    this.geometries.set(record.id, geometry);
    return geometry;
  }
}
