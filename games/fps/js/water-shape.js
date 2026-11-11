// Radii measured along each bearing. Keep the banks smooth at the corners and
// vary both banks independently so the old square moat has natural inlets.
export const TEMPLE_WATER_Y = .095;
function radius(angle, outer) {
  const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
  const square = (c ** 12 + s ** 12) ** (-1 / 12);
  if (outer) return (27 + .54 * Math.sin(angle * 7 + .5) + .39 * Math.sin(angle * 13 - .8)) * square;
  return (21 + .61 * Math.sin(angle * 6 - .8) + .32 * Math.sin(angle * 11 + .5)) * square;
}

export function templeWaterBank(x, z) {
  const a = Math.atan2(z, x), r = Math.hypot(x, z);
  return Math.min(r - radius(a, false), radius(a, true) - r);
}

export function templeWaterGeometry(THREE, margin = 0) {
  const divisions = 192, pos = [], uv = [], index = [];
  for (let i = 0; i <= divisions; i++) {
    const a = i / divisions * Math.PI * 2;
    for (const r of [radius(a, false) - margin, radius(a, true) + margin]) {
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      pos.push(x, 0, z);
      uv.push(x / 56 + .5, .5 - z / 56);
    }
    if (i < divisions) {
      const j = i * 2;
      index.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export const TEMPLE_WATER_GLSL = `
float templeBank(vec2 p){
  float a=atan(p.y,p.x), r=length(p);
  vec2 v=abs(vec2(cos(a),sin(a)));
  float sq=pow(pow(v.x,12.0)+pow(v.y,12.0),-1.0/12.0);
  float lo=(21.0+.61*sin(a*6.0-.8)+.32*sin(a*11.0+.5))*sq;
  float hi=(27.0+.54*sin(a*7.0+.5)+.39*sin(a*13.0-.8))*sq;
  return min(r-lo,hi-r);
}
vec2 waterSlope(vec2 p,float t){
  return vec2(.065*cos(dot(p,vec2(5.6,2.8))-1.6*t)+.026*cos(dot(p,vec2(-9.0,6.7))+t),
    .054*cos(dot(p,vec2(-3.2,5.5))+1.1*t)+.022*cos(dot(p,vec2(12.0,8.8))-.7*t));
}
`;

export const BOSS_WATER_Y = .029;
const BOSS_PUDDLES = [
  [-20.4, -15.6, 3.3, 1.25, .4], [19.8, 14.6, 1.33, 2.75, 1.6],
  [11.2, -26.8, 3.65, 1.38, 2.3], [-27.1, 8.5, 1.42, 3.6, 3.2],
  [7.5, 32.1, 3.25, 1.46, 4.6], [-12.1, 29.9, 2.55, 1.12, 5.7],
  [-5.9, -9.4, 2.18, 1.20, 2.9], [9.8, 4.4, 2.44, 1.27, 4.3],
];

function puddleRadius(a, seed) {
  return 1 + .18 * Math.sin(a * 3 + seed) + .075 * Math.cos(a * 7 - seed) + .04 * Math.sin(a * 11 + seed);
}

export function bossWaterGeometry(THREE) {
  const pos = [], index = [];
  for (const [x, z, rx, rz, seed] of BOSS_PUDDLES) {
    const first = pos.length / 3;
    pos.push(x, 0, z);
    for (let i = 0; i <= 72; i++) {
      const a = i / 72 * Math.PI * 2;
      const r = puddleRadius(a, seed);
      pos.push(x + Math.cos(a) * r * rx, 0, z + Math.sin(a) * r * rz);
      if (i < 72) index.push(first, first + 2 + i, first + 1 + i);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

const glNum = n => n.toFixed(4);
export const BOSS_WATER_GLSL = `
float puddleBank(vec2 p,vec2 at,vec2 extent,float seed){
  vec2 q=(p-at)/extent;
  if(dot(q,q)>1.72)return -2.;
  float a=atan(q.y,q.x);
  float r=1.+.18*sin(a*3.+seed)+.075*cos(a*7.-seed)+.04*sin(a*11.+seed);
  return (r-length(q))*min(extent.x,extent.y);
}
float bossWaterBank(vec2 p){
  float bank=-2.;
  ${BOSS_PUDDLES.map(([x,z,rx,rz,seed]) =>
    `bank=max(bank,puddleBank(p,vec2(${glNum(x)},${glNum(z)}),vec2(${glNum(rx)},${glNum(rz)}),${glNum(seed)}));`
  ).join("\n  ")}
  return bank;
}
`;
