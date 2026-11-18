export function sleeveGeometry(THREE, rings, sides = 24) {
  const positions = [], uv = [], indices = [];
  for (let row = 0; row < rings.length; row++) {
    const [z, width, height, centerY = 0, fold = 0] = rings[row];
    for (let column = 0; column <= sides; column++) {
      const angle = (column % sides) / sides * Math.PI * 2;
      const shape = 1 + fold * (Math.sin(angle * 3 + z * 41) + .45 * Math.sin(angle * 7 - z * 79));
      positions.push(Math.cos(angle) * width * shape, centerY + Math.sin(angle) * height * shape, z);
      uv.push(column / sides * .28, z);
      if (row && column) {
        const vertex = row * (sides + 1) + column;
        const below = vertex - sides - 1;
        indices.push(below - 1, below, vertex, below - 1, vertex, vertex - 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  for (let row = 0; row < rings.length; row++) {
    const first = row * (sides + 1);
    const last = first + sides;
    const nx = normals.getX(first) + normals.getX(last);
    const ny = normals.getY(first) + normals.getY(last);
    const nz = normals.getZ(first) + normals.getZ(last);
    const length = Math.hypot(nx, ny, nz) || 1;
    normals.setXYZ(first, nx / length, ny / length, nz / length);
    normals.setXYZ(last, nx / length, ny / length, nz / length);
  }
  return geometry;
}

export function digitGeometry(THREE, joints) {
  const points = joints.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const path = new THREE.CatmullRomCurve3(points);
  const segments = (joints.length - 1) * 5;
  const geometry = new THREE.TubeGeometry(path, segments, 1, 10, false);
  const positions = geometry.attributes.position;
  const center = new THREE.Vector3();
  for (let row = 0; row <= segments; row++) {
    const progress = row / segments;
    const section = progress * (joints.length - 1);
    const index = Math.min(joints.length - 2, Math.floor(section));
    const radius = THREE.MathUtils.lerp(joints[index][3], joints[index + 1][3], section - index);
    path.getPointAt(progress, center);
    for (let column = 0; column <= 10; column++) {
      const vertex = row * 11 + column;
      positions.setXYZ(vertex,
        center.x + (positions.getX(vertex) - center.x) * radius,
        center.y + (positions.getY(vertex) - center.y) * radius,
        center.z + (positions.getZ(vertex) - center.z) * radius);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

const upperLeg = .38;
const lowerLeg = .366;
const soleHeight = .122;
const cycle = Math.PI * 2;

export function operatorFootPose(out, phase, side, reachX, reachZ, hipHeight, airBlend, tuck, dash) {
  const progress = ((phase / cycle + (side < 0 ? .5 : 0)) % 1 + 1) % 1;
  const swing = progress > .59;
  const swingPhase = swing ? (progress - .59) / .41 : 0;
  const swingEase = swingPhase * swingPhase * (3 - 2 * swingPhase);
  const step = swing ? swingEase * 2 - 1 : 1 - progress * (2 / .59);
  const lift = swing ? Math.sin(Math.PI * swingPhase) ** 2 * Math.min(.22, Math.hypot(reachX, reachZ) * .52) : 0;
  const ground = 1 - airBlend;
  const forward = reachZ * step * ground + ((side > 0 ? -.16 : .16) * tuck - dash * .14) * airBlend;
  const lateral = reachX * step * ground + side * .07 * tuck * airBlend;
  const drop = Math.max(.11, hipHeight - soleHeight - lift * ground - (.10 + .13 * tuck) * airBlend);
  const sag = Math.hypot(drop, lateral);
  const distance = Math.min(upperLeg + lowerLeg - .001, Math.hypot(sag, forward));
  const knee = Math.PI - Math.acos((upperLeg ** 2 + lowerLeg ** 2 - distance ** 2) / (2 * upperLeg * lowerLeg));
  const hip = -Math.atan2(forward, sag) - Math.acos((upperLeg ** 2 + distance ** 2 - lowerLeg ** 2) / (2 * upperLeg * distance));
  out.hip = hip;
  out.roll = Math.atan2(lateral, drop);
  out.knee = knee;
  out.ankle = -hip - knee - .16 * airBlend + lift * .48 * ground;
}
