export class Player{

constructor(camera){

this.camera = camera;

this.keys = {};

document.addEventListener("keydown",e=>this.keys[e.key]=true);
document.addEventListener("keyup",e=>this.keys[e.key]=false);

this.yaw = 0;
this.pitch = 0;

document.body.onclick = () => document.body.requestPointerLock();

document.addEventListener("mousemove",e=>{
 this.yaw -= e.movementX * 0.002;
 this.pitch -= e.movementY * 0.002;
 this.pitch = Math.max(-1.5,Math.min(1.5,this.pitch));
});

}

update(){

let speed = 0.1;

if(this.keys["w"]) this.camera.position.z -= speed;
if(this.keys["s"]) this.camera.position.z += speed;
if(this.keys["a"]) this.camera.position.x -= speed;
if(this.keys["d"]) this.camera.position.x += speed;

this.camera.rotation.set(this.pitch,this.yaw,0);

}

}
