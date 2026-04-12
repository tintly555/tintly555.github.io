import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";

export function spawnBlood(scene,pos){

for(let i=0;i<6;i++){
 let p = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({color:0xaa0000})
 );
 p.position.copy(pos);
 scene.add(p);

 setTimeout(()=>scene.remove(p),300);
}

}

export function spawnSpark(scene,pos){

for(let i=0;i<4;i++){
 let p = new THREE.Mesh(
  new THREE.SphereGeometry(0.03),
  new THREE.MeshBasicMaterial({color:0xffff00})
 );
 p.position.copy(pos);
 scene.add(p);

 setTimeout(()=>scene.remove(p),200);
}

}
