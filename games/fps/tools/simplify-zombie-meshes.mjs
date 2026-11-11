// Usage: node simplify-zombie-meshes.mjs /path/to/meshopt_simplifier.module.js
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";

const { MeshoptSimplifier } = await import(pathToFileURL(resolve(process.argv[2])).href);
await MeshoptSimplifier.ready;

const meshFile = new URL("../models/zombie/character-meshes.bin.gz", import.meta.url);
const original = gunzipSync(await readFile(meshFile));
const headerSize = original.readUInt32LE(0);
const header = JSON.parse(original.subarray(4, 4 + headerSize).toString());
const blocks = [];
let dataOffset = 0;

function dataAt(Type, offset, count) {
  return new Type(original.buffer, original.byteOffset + offset, count);
}

function gather(array, stride, selected) {
  const packed = new array.constructor(selected.length * stride);
  for (let i = 0; i < selected.length; i++) {
    const offset = selected[i] * stride;
    packed.set(array.subarray(offset, offset + stride), i * stride);
  }
  return Buffer.from(packed.buffer);
}

for (const model of header.models) {
  const { vertices, indices, opaque } = model;
  const start = 4 + headerSize + model.offset;
  const positions = dataAt(Int16Array, start, vertices * 3);
  const uv = dataAt(Uint16Array, start + vertices * 6, vertices * 2);
  const index = dataAt(Uint16Array, start + vertices * 10, indices);
  const attributeStart = start + vertices * 10 + indices * 2;
  const normals = dataAt(Int8Array, attributeStart, vertices * 3);
  const joints = dataAt(Uint8Array, attributeStart + vertices * 3, vertices * 4);
  const weights = dataAt(Uint8Array, attributeStart + vertices * 7, vertices * 4);
  const colors = dataAt(Uint8Array, attributeStart + vertices * 11, vertices * 3);
  const decodedPositions = Float32Array.from(positions, value => value / 100);
  const attributes = new Float32Array(vertices * 8);
  for (let i = 0; i < vertices; i++) {
    attributes[i * 8] = uv[i * 2] / 65535 * 8;
    attributes[i * 8 + 1] = uv[i * 2 + 1] / 65535 * 5;
    for (let c = 0; c < 3; c++) {
      attributes[i * 8 + 2 + c] = normals[i * 3 + c] / 127;
      attributes[i * 8 + 5 + c] = colors[i * 3 + c] / 255;
    }
  }
  function simplify(from, to, ratio) {
    const triangles = Uint32Array.from(index.subarray(from, to));
    if (!triangles.length) return triangles;
    const goal = Math.floor(triangles.length / 3 * ratio) * 3;
    const [simplified] = MeshoptSimplifier.simplifyWithAttributes(
      triangles, decodedPositions, 3, attributes, 8, [.6, .6, .20, .20, .20, .10, .10, .10],
      null, goal, .010,
    );
    return simplified;
  }
  const body = simplify(0, opaque, .40);
  const hair = simplify(opaque, indices, .65);
  const all = new Uint32Array(body.length + hair.length);
  all.set(body);
  all.set(hair, body.length);
  const remap = new Int32Array(vertices).fill(-1);
  const used = [];
  const packedIndices = Uint16Array.from(all, old => {
    if (remap[old] < 0) {
      remap[old] = used.length;
      used.push(old);
    }
    return remap[old];
  });

  const block = Buffer.concat([
    gather(positions, 3, used), gather(uv, 2, used), Buffer.from(packedIndices.buffer),
    gather(normals, 3, used), gather(joints, 4, used), gather(weights, 4, used),
    gather(colors, 3, used),
  ]);
  const pad = Buffer.alloc((4 - block.length % 4) % 4);
  blocks.push(block, pad);
  Object.assign(model, { vertices: used.length, indices: all.length, opaque: body.length, offset: dataOffset });
  dataOffset += block.length + pad.length;
  console.log(model.id, indices / 3, "→", all.length / 3);
}

let metadata = Buffer.from(JSON.stringify(header));
metadata = Buffer.concat([metadata, Buffer.alloc((4 - metadata.length % 4) % 4, 32)]);
const prefix = Buffer.alloc(4);
prefix.writeUInt32LE(metadata.length);
await writeFile(meshFile, gzipSync(Buffer.concat([prefix, metadata, ...blocks]), { level: 9 }));
