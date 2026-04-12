import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";

export class Player {
  constructor(camera, walls) {
    this.camera = camera;
    this.walls = walls;

    this.keys = {};
    this.yaw = 0;
    this.pitch = 0;

    this.speed = 0.16;
    this.radius = 0.35;
    this.health = 100;
    this.damageFlash = 0;

    this.camera.rotation.order = "YXZ";

    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    document.body.addEventListener("click", () => {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== document.body) return;

      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;

      const limit = Math.PI / 2 - 0.03;
      if (this.pitch > limit) this.pitch = limit;
      if (this.pitch < -limit) this.pitch = -limit;
    });
  }

  collides(nextX, nextZ) {
    const sphere = new THREE.Sphere(
      new THREE.Vector3(nextX, 1.0, nextZ),
      this.radius
    );

    for (const wall of this.walls) {
      const box = new THREE.Box3().setFromObject(wall);
      if (box.intersectsSphere(sphere)) return true;
    }
    return false;
  }

  update() {
    const forward = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
    const right = { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };

    let moveX = 0;
    let moveZ = 0;

    if (this.keys["w"]) {
      moveX -= forward.x * this.speed;
      moveZ -= forward.z * this.speed;
    }
    if (this.keys["s"]) {
      moveX += forward.x * this.speed;
      moveZ += forward.z * this.speed;
    }
    if (this.keys["a"]) {
      moveX -= right.x * this.speed;
      moveZ -= right.z * this.speed;
    }
    if (this.keys["d"]) {
      moveX += right.x * this.speed;
      moveZ += right.z * this.speed;
    }

    const nextX = this.camera.position.x + moveX;
    const nextZ = this.camera.position.z + moveZ;

    if (!this.collides(nextX, this.camera.position.z)) {
      this.camera.position.x = nextX;
    }
    if (!this.collides(this.camera.position.x, nextZ)) {
      this.camera.position.z = nextZ;
    }

    this.camera.position.y = 1.65;
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
