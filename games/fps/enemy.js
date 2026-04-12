import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";

export class EnemyManager {
  constructor(scene, camera, walls, mode = "zombie") {
    this.scene = scene;
    this.camera = camera;
    this.walls = walls;
    this.mode = mode;
    this.enemies = [];
  }

  makeEnemyMesh(color = 0x2fa32f) {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.35, 0.6),
      bodyMat
    );
    body.position.y = 1.0;

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.58, 0.58),
      new THREE.MeshStandardMaterial({ color: 0x63bb63 })
    );
    head.position.y = 2.0;

    const leg1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.9, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x262626 })
    );
    leg1.position.set(-0.2, 0.45, 0);

    const leg2 = leg1.clone();
    leg2.position.x = 0.2;

    const arm1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.9, 0.22),
      bodyMat
    );
    arm1.position.set(-0.68, 1.2, 0.02);

    const arm2 = arm1.clone();
    arm2.position.x = 0.68;

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
      const mesh = this.makeEnemyMesh();
      mesh.position.set(
        Math.random() * 52 - 26,
        0,
        Math.random() * 52 - 26
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
    return this.enemies.filter((e) => e.mesh && e.hp > 0).length;
  }

  collidesWall(nextX, nextZ) {
    const sphere = new THREE.Sphere(
      new THREE.Vector3(nextX, 1.0, nextZ),
      0.38
    );

    for (const wall of this.walls) {
      const box = new THREE.Box3().setFromObject(wall);
      if (box.intersectsSphere(sphere)) return true;
    }
    return false;
  }

  update(player) {
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

      if (dist > 2.0) {
        const stepX = (dx / dist) * e.speed;
        const stepZ = (dz / dist) * e.speed;

        const nextX = e.mesh.position.x + stepX;
        const nextZ = e.mesh.position.z + stepZ;

        if (!this.collidesWall(nextX, e.mesh.position.z)) {
          e.mesh.position.x = nextX;
        }
        if (!this.collidesWall(e.mesh.position.x, nextZ)) {
          e.mesh.position.z = nextZ;
        }
      }

      e.mesh.lookAt(
        this.camera.position.x,
        e.mesh.position.y + 1.0,
        this.camera.position.z
      );

      e.attackCD--;

      if (dist < 2.2 && e.attackCD <= 0) {
        e.attackCD = 45;
        player.health -= 8;
        player.damageFlash = 4;
      }
    }
  }
}
