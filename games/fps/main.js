import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { Player } from "./player.js";

let scene, camera, renderer;
let player;

let mode = "zombie";

window.startGame = function(m){
 mode = m;
 document.getElementById("menu").style.display = "none";
 init();
}

function init(){

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
camera.position.set(0,1.6,5);

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

/* 玩家 */
player = new Player(camera);

animate();
}

function animate(){
requestAnimationFrame(animate);

player.update();

renderer.render(scene,camera);
}
