import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { Player } from "./player.js";
import { Weapon } from "./weapon.js";
import { EnemyManager } from "./enemy.js";

let scene, camera, renderer;
let player, weapon, enemies;
let mode = "zombie";
let walls = [];

window.worldWalls = walls;
window.enemies = [];

window.startGame = function startGame(selectedMode) {
  mode = selectedMode || "zombie";
  const menu = document.getElementById("menu");
  if (menu) menu.style.display = "none";
  init();
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f131b);
  scene.fog = new THREE.Fog(0x0f131b, 28, 120);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.65, 10);
  camera.rotation.order = "YXZ";

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  addLights();
  addFloor();
  buildMap(mode);

  player = new Player(camera, walls);
  weapon = new Weapon(camera, scene);
  enemies = new EnemyManager(scene, camera, walls, mode);
  enemies.spawn();

  window.enemies = enemies.enemies;
  window.worldWalls = walls;

  window.addEventListener("resize", onResize);
  animate();
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0x8da9ff, 0x2a2f39, 1.1);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(18, 28, 16);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 1024;
  dir.shadow.mapSize.height = 1024;
  scene.add(dir);
}

function addFloor() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({
      color: 0x444953,
      roughness: 0.94,
      metalness: 0.02
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

function clearWalls() {
  for (const wall of walls) {
    scene.remove(wall);
    wall.geometry.dispose();
    if (Array.isArray(wall.material)) {
      wall.material.forEach((m) => m.dispose());
    } else {
      wall.material.dispose();
    }
  }
  walls = [];
  window.worldWalls = walls;
}

function addWall(x, z, w, h, d, color = 0x666d7a) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.88,
      metalness: 0.03
    })
  );

  wall.position.set(x, h / 2, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  walls.push(wall);
  window.worldWalls = walls;
  return wall;
}

function addWindowWallX(centerX, centerZ, totalWidth, wallHeight = 4.5, thickness = 1.2, windowWidth = 6, windowBottom = 1.3, windowTop = 3.0) {
  const side = (totalWidth - windowWidth) / 2;

  addWall(centerX - (windowWidth / 2 + side / 2), centerZ, side, wallHeight, thickness);
  addWall(centerX + (windowWidth / 2 + side / 2), centerZ, side, wallHeight, thickness);

  if (windowBottom > 0) {
    addWall(centerX, centerZ, windowWidth, windowBottom, thickness);
  }

  const upperHeight = wallHeight - windowTop;
  if (upperHeight > 0) {
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, upperHeight, thickness),
      new THREE.MeshStandardMaterial({
        color: 0x666d7a,
        roughness: 0.88,
        metalness: 0.03
      })
    );
    topWall.position.set(centerX, windowTop + upperHeight / 2, centerZ);
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    scene.add(topWall);
    walls.push(topWall);
  }
}

function addWindowWallZ(centerX, centerZ, totalDepth, wallHeight = 4.5, thickness = 1.2, windowDepth = 6, windowBottom = 1.3, windowTop = 3.0) {
  const side = (totalDepth - windowDepth) / 2;

  addWall(centerX, centerZ - (windowDepth / 2 + side / 2), thickness, wallHeight, side);
  addWall(centerX, centerZ + (windowDepth / 2 + side / 2), thickness, wallHeight, side);

  if (windowBottom > 0) {
    addWall(centerX, centerZ, thickness, windowBottom, windowDepth);
  }

  const upperHeight = wallHeight - windowTop;
  if (upperHeight > 0) {
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(thickness, upperHeight, windowDepth),
      new THREE.MeshStandardMaterial({
        color: 0x666d7a,
        roughness: 0.88,
        metalness: 0.03
      })
    );
    topWall.position.set(centerX, windowTop + upperHeight / 2, centerZ);
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    scene.add(topWall);
    walls.push(topWall);
  }
}

function buildMap(currentMode) {
  clearWalls();

  if (currentMode === "duel") {
    buildDuelMap();
    return;
  }

  if (currentMode === "custom") {
    buildCustomMap();
    return;
  }

  buildZombieMap();
}

function buildZombieMap() {
  const H = 4.5;

  addWall(0, -38, 80, H, 2);
  addWall(0, 38, 80, H, 2);
  addWall(-38, 0, 2, H, 80);
  addWall(38, 0, 2, H, 80);

  addWindowWallX(0, -18, 26, H, 1.2, 6);
  addWindowWallX(0, 18, 26, H, 1.2, 6);
  addWindowWallZ(-18, 0, 22, H, 1.2, 5);
  addWindowWallZ(18, 0, 22, H, 1.2, 5);

  addWall(-25, -6, 10, 2.5, 1.2, 0x727b8d);
  addWall(25, 6, 10, 2.5, 1.2, 0x727b8d);
  addWall(-8, 25, 1.2, 2.5, 10, 0x727b8d);
  addWall(8, -25, 1.2, 2.5, 10, 0x727b8d);

  addWall(-10, 0, 8, 3.2, 1.2, 0x687184);
  addWall(10, 0, 8, 3.2, 1.2, 0x687184);
}

function buildDuelMap() {
  const H = 4.5;

  addWall(0, -42, 88, H, 2);
  addWall(0, 42, 88, H, 2);
  addWall(-42, 0, 2, H, 88);
  addWall(42, 0, 2, H, 88);

  addWindowWallX(0, 0, 20, H, 1.2, 6);
  addWindowWallZ(0, 0, 20, H, 1.2, 6);

  addWall(-22, -12, 14, 2.6, 1.2, 0x717b8d);
  addWall(22, 12, 14, 2.6, 1.2, 0x717b8d);
  addWall(-12, 22, 1.2, 2.6, 14, 0x717b8d);
  addWall(12, -22, 1.2, 2.6, 14, 0x717b8d);
}

function buildCustomMap() {
  const H = 4.5;

  addWall(0, -46, 96, H, 2);
  addWall(0, 46, 96, H, 2);
  addWall(-46, 0, 2, H, 96);
  addWall(46, 0, 2, H, 96);

  addWindowWallX(0, -22, 32, H, 1.2, 8);
  addWindowWallX(0, 22, 32, H, 1.2, 8);
  addWindowWallZ(-22, 0, 26, H, 1.2, 6);
  addWindowWallZ(22, 0, 26, H, 1.2, 6);

  addWall(-30, 14, 12, 2.5, 1.2, 0x6f7686);
  addWall(30, -14, 12, 2.5, 1.2, 0x6f7686);
  addWall(-14, -30, 1.2, 2.5, 12, 0x6f7686);
  addWall(14, 30, 1.2, 2.5, 12, 0x6f7686);

  addWall(0, 0, 10, 3.0, 1.2, 0x687184);
  addWall(0, 0, 1.2, 3.0, 10, 0x687184);
}

function updateHUD() {
  const hud = document.getElementById("hud");
  if (!hud || !player || !weapon || !enemies) return;

  hud.innerHTML = [
    `Mode: ${mode}`,
    `Health: ${Math.max(0, Math.floor(player.health))}`,
    `Enemies: ${enemies.aliveCount()}`,
    `ADS: ${weapon.ads ? "ON" : "OFF"}`,
    `Spread: ${weapon.spread.toFixed(3)}`,
    `WASD 移动 | 右键 ADS | 左键开火`
  ].join("<br>");
}

function updateDamageFlash() {
  const flash = document.getElementById("damageFlash");
  if (!flash || !player) return;

  if (player.damageFlash > 0) {
    flash.style.background = "rgba(255,0,0,0.22)";
    player.damageFlash--;
  } else {
    flash.style.background = "rgba(255,0,0,0)";
  }
}

function updateHint() {
  const hint = document.getElementById("hint");
  if (!hint) return;
  hint.style.display = document.pointerLockElement === document.body ? "none" : "block";
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  player.update();
  weapon.update();
  enemies.update(player);

  updateHUD();
  updateDamageFlash();
  updateHint();

  renderer.render(scene, camera);
}
