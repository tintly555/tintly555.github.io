import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";
import { spawnBlood, spawnSpark } from "./effects.js";

export class Weapon{

constructor(camera,scene){

this.camera = camera;
this.scene = scene;

this.cooldown = 0;
this.spread = 0;
this.ads = false;

/* 鼠标 */
document.addEventListener("mousedown",e=>{
 if(e.button===0) this.shoot();
 if(e.button===2) this.ads=true;
});

document.addEventListener("mouseup",e=>{
 if(e.button===2) this.ads=false;
});

}

shoot(){

if(this.cooldown>0) return;

/* 射速（旧版快节奏） */
this.cooldown = 5;

/* 扩散（核心爽感） */
this.spread += 0.015;

let dir = new THREE.Vector3(0,0,-1);
dir.applyEuler(this.camera.rotation);

/* 偏移 */
dir.x += (Math.random()-0.5)*this.spread;
dir.y += (Math.random()-0.5)*this.spread;

/* 射线 */
let ray = new THREE.Raycaster(this.camera.position,dir);

let hitSomething=false;

/* 打敌人 */
window.enemies?.forEach(e=>{
 let hit = ray.intersectObject(e.mesh);
 if(hit.length){
  e.hp -= 20;
  spawnBlood(this.scene,hit[0].point);
  hitSomething=true;
 }
});

/* 打墙 */
if(!hitSomething){
 let point = this.camera.position.clone().add(dir.multiplyScalar(10));
 spawnSpark(this.scene,point);
}

}

update(){

if(this.cooldown>0) this.cooldown--;

/* 收敛 */
this.spread *= 0.9;

}

}
