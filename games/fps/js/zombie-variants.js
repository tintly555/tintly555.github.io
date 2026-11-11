import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";

export function poseZombieVariant(enemy, action, poseBone, now, dt) {
  const gait = enemy.modelActions[action];
  const phase = gait.time / gait.getClip().duration;
  const step = Math.sin(phase * Math.PI * 2);
  const breath = Math.sin(now * 0.002 + enemy.walkTime);
  const spine = enemy.modelSpine;
  const head = enemy.modelHead;
  const moving = action === "walk" || action === "run";
  const stride = enemy.poseStride = THREE.MathUtils.damp(enemy.poseStride ?? 0, moving ? step : 0, 21, dt);
  // Preserve the authored wind-up, strike and recovery instead of overlaying
  // an independent arm swing that reaches the target at a different time.
  if (action === "attack") return;
  const left = enemy.poseLeftArm, right = enemy.poseRightArm;
  const leftFore = enemy.poseLeftFore, rightFore = enemy.poseRightFore;

  if (enemy.type === "normal") {
    const reach = moving ? .76 : .37;
    const weakSide = enemy.look % 2 ? -1 : 1;
    spine.rotation.x += .17 + Math.max(0, stride * weakSide) * .075;
    spine.rotation.z += weakSide * .06 + stride * .095;
    head.rotation.x -= .05 + stride * .075;
    head.rotation.z += weakSide * (.055 + breath * .035);
    poseBone(enemy, weakSide > 0 ? left : right, weakSide * .12, -.74, .62 + stride * .22, reach);
    poseBone(enemy, weakSide > 0 ? leftFore : rightFore, weakSide * .04, -.36, .85, reach);
    poseBone(enemy, weakSide > 0 ? right : left, -weakSide * .14, -.97, .05 - stride * .26, reach);
  } else if (enemy.type === "fast") {
    // A pitched-forward sprint with tight elbows.
    const drive = stride * 0.58 + breath * 0.04;
    spine.rotation.x += moving ? 0.25 : 0.29;
    spine.rotation.y += moving ? step * 0.12 : 0;
    head.rotation.x -= moving ? 0.15 : 0.21;
    poseBone(enemy, left, 0.20, -0.82, -0.47 + drive, 0.84);
    poseBone(enemy, right, -0.17, -0.78, -0.48 - drive, 0.88);
    poseBone(enemy, leftFore, 0.06, -0.44, 0.76 + drive * 0.30, 0.87);
    poseBone(enemy, rightFore, -0.04, -0.42, 0.79 - drive * 0.30, 0.9);
  } else if (enemy.type === "tank") {
    // Rock across planted feet with a low, uneven arm swing.
    const drag = stride * 0.18;
    spine.rotation.x += 0.20;
    spine.rotation.z += stride * 0.20 + breath * 0.028 - 0.07;
    head.rotation.x += 0.08;
    poseBone(enemy, left, 0.37, -1, 0.22 + drag, 0.86);
    poseBone(enemy, right, -0.42, -1, 0.30 - drag, 0.86);
    poseBone(enemy, leftFore, 0.14, -0.72, 0.44 + drag, 0.81);
    poseBone(enemy, rightFore, -0.08, -0.62, 0.51 - drag, 0.83);
  } else {
    // The gunner keeps the rifle low during a walk and braces for each shot.
    const drop = Math.abs(stride) * 0.13 + breath * 0.02;
    spine.rotation.y -= 0.12;
    spine.rotation.z += stride * 0.06 - 0.035;
    head.rotation.y += 0.10;
    poseBone(enemy, left, 0.36, -0.89, 0.14, 0.79);
    poseBone(enemy, right, -0.20, -0.92, 0.26 - drop, 0.93);
    poseBone(enemy, leftFore, -0.23, -0.74, 0.49, 0.80);
    poseBone(enemy, rightFore, 0.21, -0.39 - drop, 0.75, 0.93);
  }
}
