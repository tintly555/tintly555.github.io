export const ZOMBIE_MELEE = {
  normal: { contact: 0.64, recovery: 1.52, cooldown: 1.72 },
  fast: { contact: 0.44, recovery: 1.15, cooldown: 1.33 },
  tank: { contact: 0.88, recovery: 2.04, cooldown: 2.30 },
};

export const BOSS_IMPACT = {
  attacking: { contact: 0.55, recovery: 1.4 },
  quaking: { contact: 0.75, recovery: 1.5 },
};

// attack.glb has one swipe. The right hand is fully extended at 1.067 s
// of the 2.633 s clip. Both sides of that pose get their own playback rate.
const CLIP_CONTACT = 1.067 / 2.633;
export function zombieStrikeClipPhase(elapsed, contact, end) {
  return elapsed <= contact
    ? CLIP_CONTACT * Math.max(0, elapsed / contact)
    : CLIP_CONTACT + (1 - CLIP_CONTACT) * Math.min(1, (elapsed - contact) / (end - contact));
}

export function zombieGait(enemy, speed) {
  const boss = enemy.isBoss;
  const scale = boss ? (enemy.isHellBoss ? 3.9 : 3) : enemy.type === "tank" ? 1.22 : 1;
  const run = boss ? speed > scale * 1.55
    : enemy.type === "fast" && speed > (enemy.gaitAction === "run" ? 2.25 : 2.7);
  const stride = (run ? 2.9 : 1.48) * scale;
  return {
    action: run ? "run" : "walk",
    cycle: run ? Math.max(0.57, stride / speed) : Math.max(1.02, stride / speed),
  };
}
