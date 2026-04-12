import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";

export class EnemyManager {
  constructor(scene, camera, mode = "zombie") {
    this.scene = scene;
    this.camera = camera;
    this.mode = mode;
    this.enemies = [];
    window.enemies = this.enemies;
  }

  makeEnemyMesh(color = 0x33aa33) {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.4, 0.6),
      bodyMat
    );
    body.position.y = 1.0;

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x66bb66 })
    );
    head.position.y = 2.0;

    const leg1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.9, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
    );
    leg1.position.set(-0.2, 0.45, 0);

    const leg2 = leg1.clone();
    leg2.position.x = 0.2;

    const arm1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.9, 0.25),
      bodyMat
    );
    arm1.position.set(-0.7, 1.2, 0);

    const arm2 = arm1.clone();
    arm2.position.x = 0.7;

    group.add(body, head, leg1, leg2, arm1, arm2);

    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return group;
  }

  spawn() {
    this.enemies.length = 0;

    let count = 8;
    if (this.mode === "duel") count = 2;
    if (this.mode === "custom") count = 5;

    for (let i = 0; i < count; i++) {
      const mesh = this.makeEnemyMesh(0x2fa32f);
      mesh.position.set(
        Math.random() * 50 - 25,
        0,
        Math.random() * 50 - 25
      );

      this.scene.add(mesh);

      this.enemies.push({
        mesh,
        hp: 100,
        attackCD: 0,
        speed: this.mode === "duel" ? 0.03 : 0.04
      });
    }

    window.enemies = this.enemies;
  }

  aliveCount() {
    return this.enemies.filter((e) => e.hp > 0).length;
  }

  update() {
    for (const e of this.enemies) {
      if (!e.mesh) continue;

      if (e.hp <= 0) {
        this.scene.remove(e.mesh);
        e.mesh = null;
        continue;
      }

      const dx = this.camera.position.x - e.mesh.position.x;
      const dz = this.camera.position.z - e.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 1.8) {
        e.mesh.position.x += (dx / dist) * e.speed;
        e.mesh.position.z += (dz / dist) * e.speed;
      }

      e.mesh.lookAt(
        this.camera.position.x,
        e.mesh.position.y + 1,
        this.camera.position.z
      );

      e.attackCD--;

      if (dist < 2.2 && e.attackCD <= 0) {
        e.attackCD = 50;
        document.body.style.background = "rgba(120,0,0,1)";
        setTimeout(() => {
          document.body.style.background = "#000";
        }, 80);
      }
    }
  }
}
