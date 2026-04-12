export class EnemyManager{

constructor(scene,camera){

this.scene = scene;
this.camera = camera;

this.enemies = [];
window.enemies = this.enemies;

}

spawn(){

for(let i=0;i<8;i++){

 let mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1,2,1),
  new THREE.MeshStandardMaterial({color:0x00ff00})
 );

 mesh.position.set(
  Math.random()*40-20,
  1,
  Math.random()*40-20
 );

 this.scene.add(mesh);

 this.enemies.push({
  mesh,
  hp:100,
  attackCD:0
 });

}

}

update(){

this.enemies.forEach(e=>{

if(e.hp<=0){
 this.scene.remove(e.mesh);
 return;
}

/* 追击 */
let dx = this.camera.position.x - e.mesh.position.x;
let dz = this.camera.position.z - e.mesh.position.z;
let dist = Math.sqrt(dx*dx+dz*dz);

if(dist>1){
 e.mesh.position.x += dx/dist * 0.04;
 e.mesh.position.z += dz/dist * 0.04;
}

/* 攻击 */
e.attackCD--;

if(dist<2 && e.attackCD<=0){
 e.attackCD = 40;

 document.body.style.background="red";
 setTimeout(()=>document.body.style.background="black",80);
}

});

}

}
