import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { spawnBlood, spawnSpark } from "./effects.js";

export class Weapon {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;

    this.cooldown = 0;
    this.spread = 0;
    this.ads = false;

    document.addEventListener("contextmenu", (e) => e.preventDefault());

    document.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.shoot();
      if (e.button === 2) this.ads = true;
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button === 2) this.ads = false;
    });
  }

  shoot() {
    if (this.cooldown > 0) return;

    this.cooldown = this.ads ? 5 : 7;
    this.spread += this.ads ? 0.004 : 0.014;

    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyEuler(this.camera.rotation);

    const baseSpread = this.ads ? 0.006 : 0.03;
    dir.x += (Math.random() - 0.5) * (this.spread + baseSpread);
    dir.y += (Math.random() - 0.5) * (this.spread + baseSpread);
    dir.normalize();

    const ray = new THREE.Raycaster(this.camera.position, dir);

    let hitEnemy = false;

    if (window.enemies) {
      for (const e of window.enemies) {
        if (!e || !e.mesh || e.hp <= 0) continue;
        const hits = ray.intersectObject(e.mesh, true);
        if (hits.length > 0) {
          e.hp -= this.ads ? 28 : 20;
          spawnBlood(this.scene, hits[0].point);
          hitEnemy = true;
          break;
        }
      }
    }

    if (!hitEnemy) {
      if (window.worldWalls && window.worldWalls.length > 0) {
        const wallHits = ray.intersectObjects(window.worldWalls, false);
        if (wallHits.length > 0) {
          spawnSpark(this.scene, wallHits[0].point);
        } else {
          const point = this.camera.position.clone().add(dir.multiplyScalar(8));
          spawnSpark(this.scene, point);
        }
      }
    }
  }

  update() {
    if (this.cooldown > 0) this.cooldown--;
    this.spread *= 0.88;

    const crosshair = document.getElementById("crosshair");
    if (crosshair) {
      crosshair.classList.toggle("hidden", this.ads);
    }

    const targetFov = this.ads ? 58 : 75;
    this.camera.fov += (targetFov - this.camera.fov) * 0.18;
    this.camera.updateProjectionMatrix();
  }
}
