import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { Player } from "./player.js";
import { Weapon } from "./weapon.js";

let scene, camera, renderer;
let player, weapon;

/* 🌍 全局敌人（给 weapon 用） */
window.enemies = [];

let mode = "zombie";

/* 🎮 菜单入口 */
window.startGame = function(m){
 mode = m;
 document.getElementById("menu").style.display = "none";
 init();
};

function init(){

scene = new THREE.Scene();

/* 摄像机 */
camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
camera.position.set(0,1.6,5);

/* 渲染器 */
renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth,innerHeight);
document.body.appendChild(renderer.domElement);

/* 光 */
let light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(10,20,10);
scene.add(light);

/* 地面 */
let floor = new THREE.Mesh(
 new THREE.PlaneGeometry(200,200),
 new THREE.MeshStandardMaterial({color:0x444444})
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

/* 墙 */
createWalls();

/* 玩家 + 武器 */
player = new Player(camera);
weapon = new Weapon(camera);

/* 生成敌人 */
spawnEnemies();

animate();
}

/* 🧱 墙体 */
function createWalls(){

function addWall(x,z,w,h,d){
 let wall = new THREE.Mesh(
  new THREE.BoxGeometry(w,h,d),
  new THREE.MeshStandardMaterial({color:0x666666})
 );
 wall.position.set(x,h/2,z);
 scene.add(wall);
}

/* 四周 */
addWall(0,-20,40,4,1);
addWall(0,20,40,4,1);
addWall(-20,0,1,4,40);
addWall(20,0,1,4,40);

/* 中间掩体 */
addWall(0,0,8,3,1);

}

/* 💀 敌人生成 */
function spawnEnemies(){

for(let i=0;i<6;i++){

 let mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1,2,1),
  new THREE.MeshStandardMaterial({color:0x00ff00})
 );

 mesh.position.set(
  Math.random()*30-15,
  1,
  Math.random()*30-15
 );

 scene.add(mesh);

 window.enemies.push({
  mesh: mesh,
  hp: 100
 });

}

}

/* 🤖 敌人AI */
function updateEnemies(){

window.enemies.forEach(e=>{

 if(e.hp <= 0){
  scene.remove(e.mesh);
  return;
 }

 let dx = camera.position.x - e.mesh.position.x;
 let dz = camera.position.z - e.mesh.position.z;

 let dist = Math.sqrt(dx*dx + dz*dz);

 if(dist > 1){
  e.mesh.position.x += dx/dist * 0.02;
  e.mesh.position.z += dz/dist * 0.02;
 }

});

}

/* 🔁 主循环 */
function animate(){
requestAnimationFrame(animate);

/* 玩家移动 */
player.update();

/* 武器 */
weapon.update();

/* 敌人 */
updateEnemies();

renderer.render(scene,camera);
}
