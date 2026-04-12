import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { Player } from "./player.js";
import { Weapon } from "./weapon.js";
import { EnemyManager } from "./enemy.js";

let scene, camera, renderer;
let player, weapon, enemies;
let walls = [];
let mode = "zombie";

window.enemies = [];
window.worldWalls = walls;

window.startGame = function startGame(selectedMode) {
  mode = selectedMode || "zombie";
  const menu = document.getElementById("menu");
  if (menu) menu.style.display = "none";
  init();
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101218);
  scene.fog = new THREE.Fog(0x101218, 25, 110);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  addLights();
  addFloor();
  buildMap(mode);

  player = new Player(camera);
  weapon = new Weapon(camera, scene);
  enemies = new EnemyManager(scene, camera, mode);
  enemies.spawn();

  window.addEventListener("resize", onResize);

  animate();
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0x8ea9ff, 0x2a2a2a, 1.1);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(18, 24, 14);
  dir.castShadow = true;
  scene.add(dir);
}

function addFloor() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshStandardMaterial({
      color: 0x3e434a,
      roughness: 0.95,
      metalness: 0.02
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

function addWall(x, z, w, h, d, color = 0x666a73) {
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
}

function addWindowWallX(centerX, centerZ, totalWidth, wallHeight = 4.5, thickness = 1.0, windowWidth = 5) {
  const sideWidth = (totalWidth - windowWidth) / 2;
  addWall(centerX - (windowWidth / 2 + sideWidth / 2), centerZ, sideWidth, wallHeight, thickness);
  addWall(centerX + (windowWidth / 2 + sideWidth / 2), centerZ, sideWidth, wallHeight, thickness);
  addWall(centerX, centerZ, windowWidth, 1.2, thickness);
  addWall(centerX, centerZ, windowWidth, 1.2, thickness);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth, 1.2, thickness),
    new THREE.MeshStandardMaterial({ color: 0x666a73, roughness: 0.88, metalness: 0.03 })
  );
  top.position.set(centerX, 3.9, centerZ);
  top.castShadow = true;
  top.receiveShadow = true;
  scene.add(top);
  walls.push(top);
}

function addWindowWallZ(centerX, centerZ, totalDepth, wallHeight = 4.5, thickness = 1.0, windowDepth = 5) {
  const sideDepth = (totalDepth - windowDepth) / 2;
  addWall(centerX, centerZ - (windowDepth / 2 + sideDepth / 2), thickness, wallHeight, sideDepth);
  addWall(centerX, centerZ + (windowDepth / 2 + sideDepth / 2), thickness, wallHeight, sideDepth);
  addWall(centerX, centerZ, thickness, 1.2, windowDepth);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, 1.2, windowDepth),
    new THREE.MeshStandardMaterial({ color: 0x666a73, roughness: 0.88, metalness: 0.03 })
  );
  top.position.set(centerX, 3.9, centerZ);
  top.castShadow = true;
  top.receiveShadow = true;
  scene.add(top);
  walls.push(top);
}

function clearWalls() {
  for (const wall of walls) {
    scene.remove(wall);
    wall.geometry.dispose();
    wall.material.dispose();
  }
  walls = [];
  window.worldWalls = walls;
}

function buildMap(currentMode) {
  clearWalls();
  if (currentMode === "duel") return buildDuelMap();
  if (currentMode === "custom") return buildCustomMap();
  return buildZombieMap();
}

function buildZombieMap() {
  const H = 4.5;
  addWall(0, -36, 76, H, 2);
  addWall(0, 36, 76, H, 2);
  addWall(-36, 0, 2, H, 76);
  addWall(36, 0, 2, H, 76);

  addWindowWallX(0, -16, 24, H, 1.2, 6);
  addWindowWallX(0, 16, 24, H, 1.2, 6);
  addWindowWallZ(-16, 0, 20, H, 1.2, 5);
  addWindowWallZ(16, 0, 20, H, 1.2, 5);

  addWall(-24, -6, 10, 2.4, 1.2, 0x70798a);
  addWall(24, 6, 10, 2.4, 1.2, 0x70798a);
  addWall(-8, 24, 1.2, 2.4, 10, 0x70798a);
  addWall(8, -24, 1.2, 2.4, 10, 0x70798a);
}

function buildDuelMap() {
  const H = 4.5;
  addWall(0, -40, 84, H, 2);
  addWall(0, 40, 84, H, 2);
  addWall(-40, 0, 2, H, 84);
  addWall(40, 0, 2, H, 84);

  addWindowWallX(0, 0, 18, H, 1.2, 6);
  addWindowWallZ(0, 0, 18, H, 1.2, 6);

  addWall(-22, -10, 14, 2.6, 1.2, 0x717b8d);
  addWall(22, 10, 14, 2.6, 1.2, 0x717b8d);
}

function buildCustomMap() {
  const H = 4.5;
  addWall(0, -44, 92, H, 2);
  addWall(0, 44, 92, H, 2);
  addWall(-44, 0, 2, H, 92);
  addWall(44, 0, 2, H, 92);

  addWindowWallX(0, -20, 30, H, 1.2, 8);
  addWindowWallX(0, 20, 30, H, 1.2, 8);
  addWindowWallZ(-20, 0, 24, H, 1.2, 6);
  addWindowWallZ(20, 0, 24, H, 1.2, 6);

  addWall(-28, 12, 12, 2.5, 1.2, 0x6f7686);
  addWall(28, -12, 12, 2.5, 1.2, 0x6f7686);
  addWall(0, 0, 10, 3.0, 1.2, 0x687184);
}

function updateHUD() {
  const hud = document.getElementById("hud");
  if (!hud || !weapon || !enemies) return;
  hud.innerHTML = [
    `Mode: ${mode}`,
    `Enemies: ${enemies.aliveCount()}`,
    `ADS: ${weapon.ads ? "ON" : "OFF"}`,
    `Spread: ${weapon.spread.toFixed(3)}`
  ].join("<br>");
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
  enemies.update();
  updateHUD();

  renderer.render(scene, camera);
}
