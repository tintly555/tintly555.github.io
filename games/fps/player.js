export class Player {
  constructor(camera) {
    this.camera = camera;
    this.keys = {};
    this.yaw = 0;
    this.pitch = 0;
    this.speed = 0.12;

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

      const limit = 1.5;
      if (this.pitch > limit) this.pitch = limit;
      if (this.pitch < -limit) this.pitch = -limit;
    });
  }

  update() {
    const forward = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
    const right = { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };

    if (this.keys["w"]) {
      this.camera.position.x -= forward.x * this.speed;
      this.camera.position.z -= forward.z * this.speed;
    }
    if (this.keys["s"]) {
      this.camera.position.x += forward.x * this.speed;
      this.camera.position.z += forward.z * this.speed;
    }
    if (this.keys["a"]) {
      this.camera.position.x -= right.x * this.speed;
      this.camera.position.z -= right.z * this.speed;
    }
    if (this.keys["d"]) {
      this.camera.position.x += right.x * this.speed;
      this.camera.position.z += right.z * this.speed;
    }

    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
