import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js";

export class Weapon {

constructor(camera){

this.camera = camera;

this.spread = 0;
this.recoil = 0;
this.ads = false;
this.cooldown = 0;

/* 红点（屏幕中心） */
this.dot = document.createElement("div");
this.dot.style.position="absolute";
this.dot.style.width="6px";
this.dot.style.height="6px";
this.dot.style.background="red";
this.dot.style.borderRadius="50%";
this.dot.style.left="50%";
this.dot.style.top="50%";
this.dot.style.transform="translate(-50%,-50%)";
this.dot.style.opacity="0.8";
document.body.appendChild(this.dot);

/* 鼠标控制 */
document.addEventListener("mousedown",(e)=>{
 if(e.button===0) this.shoot();   // 左键开火
 if(e.button===2) this.ads = true; // 右键开镜
});

document.addEventListener("mouseup",(e)=>{
 if(e.button===2) this.ads = false;
});

}

/* 射击 */
shoot(){

if(this.cooldown>0) return;

/* 射速控制 */
this.cooldown = this.ads ? 6 : 10;

/* 扩散（核心） */
let baseSpread = this.ads ? 0.002 : 0.02;

this.spread += this.ads ? 0.002 : 0.01;

/* 方向 */
let dir = new THREE.Vector3(0,0,-1);
dir.applyEuler(this.camera.rotation);

/* 随机偏移（让子弹不再是激光） */
dir.x += (Math.random()-0.5)*(this.spread + baseSpread);
dir.y += (Math.random()-0.5)*(this.spread + baseSpread);

/* 射线检测 */
let ray = new THREE.Raycaster(this.camera.position,dir);

/* 打敌人 */
window.enemies?.forEach(e=>{
 let hit = ray.intersectObject(e.mesh);
 if(hit.length){
  e.hp -= 25;
 }
});

/* 后坐力 */
this.recoil += this.ads ? 0.01 : 0.03;

}

/* 每帧更新 */
update(){

if(this.cooldown>0) this.cooldown--;

/* 扩散恢复 */
this.spread *= 0.85;

/* 后坐力恢复 */
this.recoil *= 0.8;

/* 推镜头 */
this.camera.rotation.x -= this.recoil;

/* ADS隐藏准星 */
let cross = document.querySelector(".crosshair");
if(cross){
 cross.style.opacity = this.ads ? 0 : 1;
}

}

}
