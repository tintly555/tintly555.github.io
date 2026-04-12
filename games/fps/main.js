import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { Player } from "./player.js";
import { Weapon } from "./weapon.js";
import { EnemyManager } from "./enemy.js";

let scene, camera, renderer;
let player, weapon, enemies;

let worldWalls = [];

// 给其他模块临时访问
window.enemies = [];
window.worldWalls = worldWalls;

/* 菜单按钮会调用 */
window.startGame = function startGame(mode) {
  const menu = document.getElementById("menu");
  if (menu) menu.style.display = "none";
  init(mode || "zombie");
};

function init(mode) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101218);
  scene.fog = new THREE.Fog(0x101218, 30, 120);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
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

  enemies = new EnemyManager(scene, camera);
  enemies.spawn(mode);

  window.addEventListener("resize", onResize);

  animate();
}

function addLights() {
  const hemi = new THREE.HemisphereLight(0x8fa8ff, 0x2d2d2d, 1.05);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(18, 24, 12);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 1024;
  dir.shadow.mapSize.height = 1024;
  scene.add(dir);
}

function addFloor() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshStandardMaterial({
      color: 0x3f434a,
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

  worldWalls.push(wall);
  window.worldWalls = worldWalls;

  return wall;
}

/**
 * 带“窗洞”的横向墙（沿 X 方向展开）
 */
function addWindowWallX(centerX, centerZ, totalWidth, wallHeight = 4.5, thickness = 1.0, windowWidth = 5, windowBottom = 1.4, windowTop = 3.0) {
  const sideWidth = (totalWidth - windowWidth) / 2;

  addWall(centerX - (windowWidth / 2 + sideWidth / 2), centerZ, sideWidth, wallHeight, thickness);
  addWall(centerX + (windowWidth / 2 + sideWidth / 2), centerZ, sideWidth, wallHeight, thickness);

  const lowerHeight = windowBottom;
  if (lowerHeight > 0) {
    addWall(centerX, centerZ, windowWidth, lowerHeight, thickness);
  }

  const upperHeight = wallHeight - windowTop;
  if (upperHeight > 0) {
    const y = windowTop + upperHeight / 2;
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, upperHeight, thickness),
      new THREE.MeshStandardMaterial({
        color: 0x666a73,
        roughness: 0.88,
        metalness: 0.03
      })
    );
    topWall.position.set(centerX, y, centerZ);
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    scene.add(topWall);
    worldWalls.push(topWall);
  }
}

/**
 * 带“窗洞”的纵向墙（沿 Z 方向展开）
 */
function addWindowWallZ(centerX, centerZ, totalDepth, wallHeight = 4.5, thickness = 1.0, windowDepth = 5, windowBottom = 1.4, windowTop = 3.0) {
  const sideDepth = (totalDepth - windowDepth) / 2;

  addWall(centerX, centerZ - (windowDepth / 2 + sideDepth / 2), thickness, wallHeight, sideDepth);
  addWall(centerX, centerZ + (windowDepth / 2 + sideDepth / 2), thickness, wallHeight, sideDepth);

  const lowerHeight = windowBottom;
  if (lowerHeight > 0) {
    addWall(centerX, centerZ, thickness, lowerHeight, windowDepth);
  }

  const upperHeight = wallHeight - windowTop;
  if (upperHeight > 0) {
    const y = windowTop + upperHeight / 2;
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(thickness, upperHeight, windowDepth),
      new THREE.MeshStandardMaterial({
        color: 0x666a73,
        roughness: 0.88,
        metalness: 0.03
      })
    );
    topWall.position.set(centerX, y, centerZ);
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    scene.add(topWall);
    worldWalls.push(topWall);
  }
}

function clearWalls() {
  for (const wall of worldWalls) {
    scene.remove(wall);
    wall.geometry.dispose();
    if (Array.isArray(wall.material)) {
      wall.material.forEach((m) => m.dispose());
    } else {
      wall.material.dispose();
    }
  }
  worldWalls = [];
  window.worldWalls = worldWalls;
}

function buildMap(mode) {
  clearWalls();

  if (mode === "duel") {
    buildDuelMap();
    return;
  }

  if (mode === "custom") {
    buildCustomMap();
    return;
  }

  buildZombieMap();
}

function buildZombieMap() {
  const H = 4.5;

  // 外圈
  addWall(0, -36, 76, H, 2);
  addWall(0, 36, 76, H, 2);
  addWall(-36, 0, 2, H, 76);
  addWall(36, 0, 2, H, 76);

  // 中区开放结构
  addWindowWallX(0, -16, 24, H, 1.2, 6, 1.4, 3.1);
  addWindowWallX(0, 16, 24, H, 1.2, 6, 1.4, 3.1);

  addWindowWallZ(-16, 0, 20, H, 1.2, 5, 1.4, 3.0);
  addWindowWallZ(16, 0, 20, H, 1.2, 5, 1.4, 3.0);

  // 半墙和掩体
  addWall(-24, -6, 10, 2.4, 1.2, 0x70798a);
  addWall(24, 6, 10, 2.4, 1.2, 0x70798a);
  addWall(-8, 24, 1.2, 2.4, 10, 0x70798a);
  addWall(8, -24, 1.2, 2.4, 10, 0x70798a);

  addWall(-10, 0, 8, 3.2, 1.2, 0x6a7487);
  addWall(10, 0, 8, 3.2, 1.2, 0x6a7487);
}

function buildDuelMap() {
  const H = 4.5;

  addWall(0, -40, 84, H, 2);
  addWall(0, 40, 84, H, 2);
  addWall(-40, 0, 2, H, 84);
  addWall(40, 0, 2, H, 84);

  // 中央主掩体
  addWindowWallX(0, 0, 18, H, 1.2, 6, 1.2, 3.0);
  addWindowWallZ(0, 0, 18, H, 1.2, 6, 1.2, 3.0);

  // 左右交叉墙
  addWall(-22, -10, 14, 2.6, 1.2, 0x717b8d);
  addWall(22, 10, 14, 2.6, 1.2, 0x717b8d);
  addWall(-10, 22, 1.2, 2.6, 14, 0x717b8d);
  addWall(10, -22, 1.2, 2.6, 14, 0x717b8d);
}

function buildCustomMap() {
  const H = 4.5;

  addWall(0, -44, 92, H, 2);
  addWall(0, 44, 92, H, 2);
  addWall(-44, 0, 2, H, 92);
  addWall(44, 0, 2, H, 92);

  // 更开放，给以后多人留空间
  addWindowWallX(0, -20, 30, H, 1.2, 8, 1.3, 3.2);
  addWindowWallX(0, 20, 30, H, 1.2, 8, 1.3, 3.2);

  addWindowWallZ(-20, 0, 24, H, 1.2, 6, 1.3, 3.0);
  addWindowWallZ(20, 0, 24, H, 1.2, 6, 1.3, 3.0);

  addWall(-28, 12, 12, 2.5, 1.2, 0x6f7686);
  addWall(28, -12, 12, 2.5, 1.2, 0x6f7686);
  addWall(-12, -28, 1.2, 2.5, 12, 0x6f7686);
  addWall(12, 28, 1.2, 2.5, 12, 0x6f7686);

  addWall(0, 0, 10, 3.0, 1.2, 0x687184);
  addWall(0, 0, 1.2, 3.0, 10, 0x687184);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (player) player.update();
  if (weapon) weapon.update();
  if (enemies) enemies.update();

  renderer.render(scene, camera);
}
