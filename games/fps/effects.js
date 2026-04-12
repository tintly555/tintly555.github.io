import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";

export function spawnBlood(scene, pos) {
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xaa0000 })
    );

    p.position.copy(pos);
    p.position.x += (Math.random() - 0.5) * 0.2;
    p.position.y += (Math.random() - 0.5) * 0.2;
    p.position.z += (Math.random() - 0.5) * 0.2;

    scene.add(p);
    setTimeout(() => scene.remove(p), 250);
  }
}

export function spawnSpark(scene, pos) {
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffdd33 })
    );

    p.position.copy(pos);
    p.position.x += (Math.random() - 0.5) * 0.15;
    p.position.y += (Math.random() - 0.5) * 0.15;
    p.position.z += (Math.random() - 0.5) * 0.15;

    scene.add(p);
    setTimeout(() => scene.remove(p), 180);
  }
}
