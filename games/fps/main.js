import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { Player } from "./player.js";
import { Weapon } from "./weapon.js";

let scene, camera, renderer;
let player, weapon;

window.enemies = [];
let walls = [];

/* 菜单 */
window.startGame = function(){
 document.getElementById("menu").style.display="none";
 init();
};

function init(){

scene = new THREE.Scene();

/* 摄像机 */
camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
camera.position.set(0,1.6,5);

/* 渲染 */
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
 new THREE.MeshStandardMaterial({color:0x333333})
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

/* 地图 */
createMap();

/* 玩家 */
player = new Player(camera);
weapon = new Weapon(camera);

/* 敌人 */
spawnEnemies();

animate();
}

/* ================= 地图 ================= */

function addWall(x,z,w,h,d){
 let m = new THREE.Mesh(
  new THREE.BoxGeometry(w,h,d),
  new THREE.MeshStandardMaterial({color:0x555555})
 );
 m.position.set(x,h/2,z);
 scene.add(m);
 walls.push(m);
}

function createMap(){

/* 外围 */
addWall(0,-30,60,6,2);
addWall(0,30,60,6,2);
addWall(-30,0,2,6,60);
addWall(30,0,2,6,60);

/* 房间 */
addWall(0,0,20,5,2);
addWall(-12,8,2,5,20);
addWall(12,-8,2,5,20);

/* 窗洞 */
addWall(0,5,6,2,2);
addWall(0,-5,6,2,2);
}

/* ================= 敌人 ================= */

function createZombie(){

let g = new THREE.Group();

/* 身体 */
let body = new THREE.Mesh(
 new THREE.BoxGeometry(1,1.5,0.6),
 new THREE.MeshStandardMaterial({color:0x228822})
);
body.position.y=1;

/* 头 */
let head = new THREE.Mesh(
 new THREE.BoxGeometry(0.6,0.6,0.6),
 new THREE.MeshStandardMaterial({color:0x44aa44})
);
head.position.y=2;

/* 腿 */
let leg1 = new THREE.Mesh(
 new THREE.BoxGeometry(0.3,1,0.3),
 new THREE.MeshStandardMaterial({color:0x222222})
);
leg1.position.set(-0.2,0.5,0);

let leg2 = leg1.clone();
leg2.position.x=0.2;

/* 手 */
let arm1 = new THREE.Mesh(
 new THREE.BoxGeometry(0.3,1,0.3),
 new THREE.MeshStandardMaterial({color:0x228822})
);
arm1.position.set(-0.8,1.3,0);

let arm2 = arm1.clone();
arm2.position.x=0.8;

g.add(body,head,leg1,leg2,arm1,arm2);

return g;
}

function spawnEnemies(){

for(let i=0;i<6;i++){

 let z = createZombie();

 z.position.set(
  Math.random()*30-15,
  0,
  Math.random()*30-15
 );

 scene.add(z);

 window.enemies.push({
  mesh:z,
  hp:100,
  speed:0.03,
  attackCooldown:0
 });
}
}

/* ================= AI ================= */

function updateEnemies(){

window.enemies.forEach(e=>{

if(e.hp<=0){
 scene.remove(e.mesh);
 return;
}

let dx = camera.position.x - e.mesh.position.x;
let dz = camera.position.z - e.mesh.position.z;

let dist = Math.sqrt(dx*dx + dz*dz);

/* 移动 */
if(dist>1.5){
 e.mesh.position.x += dx/dist * e.speed;
 e.mesh.position.z += dz/dist * e.speed;
}

/* 攻击 */
e.attackCooldown--;

if(dist<2 && e.attackCooldown<=0){
 e.attackCooldown = 60;

 document.body.style.background="red";
 setTimeout(()=>document.body.style.background="black",80);
}

/* 面向玩家 */
e.mesh.lookAt(camera.position);

});
}

/* ================= 特效 ================= */

function bloodEffect(pos){

for(let i=0;i<5;i++){
 let p = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({color:0xaa0000})
 );
 p.position.copy(pos);

 scene.add(p);

 setTimeout(()=>scene.remove(p),300);
}
}

window.spawnBlood = bloodEffect;

/* ================= 主循环 ================= */

function animate(){
requestAnimationFrame(animate);

player.update();
weapon.update();
updateEnemies();

renderer.render(scene,camera);
}
