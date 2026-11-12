/**
 * Authored attacks for the scorpion boss. Events are deliberately data-driven so the
 * authority can resolve each hit once while every client replays the same windup and pose.
 * `shape` also selects the floor warning: sectors are directional, circles are area/landing
 * zones, and lanes mark committed dashes.
 */
const attack = (id, style, min, max, cooldown, duration, events, extra = {}) => Object.freeze({
  id, style, min, max, cooldown, duration, events: Object.freeze(events.map(Object.freeze)), ...extra,
});

export const BOSS_ATTACKS = Object.freeze([
  attack("pincer-cross", "claw", 0, 13, 8.5, 2.35, [
    { at: 0.68, type: "strike", shape: "sector", radius: 8.2, halfAngle: 0.48, offset: -0.52, damage: 27 },
    { at: 1.36, type: "strike", shape: "sector", radius: 8.2, halfAngle: 0.48, offset: 0.52, damage: 30 },
  ]),
  attack("left-scythe", "claw", 0, 10, 7.5, 1.85, [
    { at: 0.78, type: "strike", shape: "sector", radius: 9.2, halfAngle: 0.34, offset: -0.9, damage: 38 },
  ]),
  attack("right-scythe", "claw", 0, 10, 7.5, 1.85, [
    { at: 0.78, type: "strike", shape: "sector", radius: 9.2, halfAngle: 0.34, offset: 0.9, damage: 38 },
  ]),
  attack("stinger-thrust", "tail", 5, 25, 8.2, 1.9, [
    { at: 0.82, type: "strike", shape: "sector", radius: 14, halfAngle: 0.16, damage: 42 },
  ]),
  attack("rear-tail-whip", "tail", 0, 13, 8, 2.0, [
    { at: 0.82, type: "strike", shape: "sector", radius: 8.4, halfAngle: 0.72, offset: 2.3, damage: 36 },
  ]),
  attack("marked-stinger", "tail", 7, 30, 8.8, 2.0, [
    { at: 1.04, type: "strike", shape: "circle", anchor: "aim", radius: 3.4, damage: 45, knockback: 2.4 },
  ]),
  attack("venom-fan", "tail", 9, 36, 9, 1.9, [
    { at: 0.76, type: "volley", shots: [-0.3, 0, 0.3], damage: 25 },
  ]),
  attack("staggered-volley", "tail", 10, 38, 10, 2.7, [
    { at: 0.66, type: "volley", shots: [0], damage: 20 },
    { at: 1.42, type: "volley", shots: [-0.18, 0.18], damage: 18 },
    { at: 2.08, type: "volley", shots: [0], damage: 20 },
  ]),
  attack("sidewinder", "dash", 5, 23, 9, 2.15, [
    { at: 0.58, type: "dash", direction: "right", duration: 0.48, speed: 9.5, width: 3.2, length: 8 },
    { at: 1.36, type: "strike", shape: "sector", radius: 7.8, halfAngle: 0.52, damage: 32 },
  ]),
  attack("feint-rake", "claw-dash", 6, 25, 9.5, 2.25, [
    { at: 0.74, type: "dash", direction: "toward", duration: 0.34, speed: 12, width: 3.3, length: 10 },
    { at: 1.3, type: "strike", shape: "sector", radius: 8.5, halfAngle: 0.58, damage: 34 },
  ]),
  attack("charge-rake", "claw-dash", 9, 36, 10, 2.55, [
    { at: 0.72, type: "dash", direction: "toward", duration: 0.56, speed: 17, width: 3.6, length: 13, damage: 39 },
    { at: 1.52, type: "strike", shape: "sector", radius: 9.4, halfAngle: 0.44, damage: 31 },
  ]),
  attack("double-ground-wave", "quake", 4, 22, 10, 2.25, [
    { at: 0.72, type: "strike", shape: "circle", radius: 8.5, damage: 24, grounded: true, knockback: 1.6 },
    { at: 1.48, type: "strike", shape: "circle", radius: 14, damage: 28, grounded: true, knockback: 2.2 },
  ]),
  attack("inner-outer-aftershock", "quake", 4, 24, 10.5, 2.35, [
    { at: 0.74, type: "strike", shape: "circle", radius: 4.4, damage: 33, grounded: true, knockback: 1.5 },
    { at: 1.44, type: "strike", shape: "circle", radius: 12.5, damage: 27, grounded: true, knockback: 2.0 },
  ]),
  attack("retreating-tail", "tail-dash", 0, 14, 9, 2.25, [
    { at: 0.62, type: "dash", direction: "away", duration: 0.42, speed: 8.5, width: 3, length: 7 },
    { at: 1.34, type: "strike", shape: "sector", radius: 8.8, halfAngle: 0.8, offset: 2.35, damage: 36 },
  ]),
  attack("claw-tail-cross", "claw-tail", 0, 14, 9.2, 2.55, [
    { at: 0.68, type: "strike", shape: "sector", radius: 8.2, halfAngle: 0.48, offset: -0.62, damage: 28 },
    { at: 1.38, type: "strike", shape: "sector", radius: 8.8, halfAngle: 0.68, offset: 2.1, damage: 30 },
    { at: 2.02, type: "strike", shape: "sector", radius: 10, halfAngle: 0.2, damage: 25 },
  ], { enragedOnly: true }),
  attack("pincer-spit", "claw-tail", 5, 30, 9.5, 2.45, [
    { at: 0.72, type: "strike", shape: "sector", radius: 8.4, halfAngle: 0.5, damage: 31 },
    { at: 1.48, type: "volley", shots: [-0.2, 0.2], damage: 20 },
  ], { enragedOnly: true }),
  attack("quake-to-rush", "quake-dash", 8, 34, 10.5, 2.65, [
    { at: 0.7, type: "strike", shape: "circle", radius: 7.2, damage: 25, grounded: true, knockback: 1.4 },
    { at: 1.44, type: "dash", direction: "toward", duration: 0.48, speed: 15, width: 3.4, length: 12, damage: 35 },
  ], { enragedOnly: true }),
  attack("tail-sweep-volley", "tail", 6, 32, 10, 2.5, [
    { at: 0.76, type: "strike", shape: "sector", radius: 9.4, halfAngle: 0.72, offset: 2.0, damage: 32 },
    { at: 1.55, type: "volley", shots: [-0.28, 0, 0.28], damage: 21 },
  ], { enragedOnly: true }),
  attack("jaws-and-sting", "claw-tail", 0, 16, 9.5, 2.55, [
    { at: 0.62, type: "strike", shape: "sector", radius: 7.4, halfAngle: 0.68, damage: 24 },
    { at: 1.28, type: "strike", shape: "sector", radius: 12.5, halfAngle: 0.17, damage: 31 },
    { at: 1.98, type: "strike", shape: "sector", radius: 8, halfAngle: 0.65, offset: 2.2, damage: 23 },
  ], { enragedOnly: true }),
  attack("stomp-charge", "quake-dash", 8, 34, 10.5, 2.6, [
    { at: 0.72, type: "strike", shape: "circle", radius: 8.4, damage: 24, grounded: true, knockback: 1.5 },
    { at: 1.48, type: "dash", direction: "toward", duration: 0.52, speed: 16, width: 3.5, length: 13, damage: 34 },
  ], { enragedOnly: true }),

  // Hell-only chains. Each move changes direction, range or attack type between beats so
  // players have to read the tells instead of dodging the same repeated swing.
  attack("hell-pincer-stinger-cross", "claw-tail", 0, 16, 8.2, 2.65, [
    { at: 0.48, type: "strike", shape: "sector", radius: 8.1, halfAngle: 0.48, offset: -0.56, damage: 22 },
    { at: 1.08, type: "strike", shape: "sector", radius: 8.1, halfAngle: 0.48, offset: 0.56, damage: 22 },
    { at: 1.82, type: "strike", shape: "sector", radius: 13.2, halfAngle: 0.16, damage: 28 },
  ], { hellOnly: true, weight: 1.3 }),
  attack("hell-quake-venom-fan", "quake-tail", 5, 32, 9.0, 2.75, [
    { at: 0.52, type: "strike", shape: "circle", radius: 7.4, damage: 19, grounded: true, knockback: 1.2 },
    { at: 1.26, type: "volley", shots: [-0.28, 0, 0.28], damage: 16 },
    { at: 2.02, type: "strike", shape: "circle", radius: 12.5, damage: 22, grounded: true, knockback: 1.6 },
  ], { hellOnly: true, weight: 1.25 }),
  attack("hell-stinger-bounce-volley", "tail", 8, 38, 9.2, 2.85, [
    { at: 0.56, type: "strike", shape: "sector", radius: 14.5, halfAngle: 0.15, damage: 24 },
    { at: 1.34, type: "volley", shots: [-0.2, 0.2], damage: 15 },
    { at: 2.1, type: "strike", shape: "circle", anchor: "aim", radius: 3, damage: 27, knockback: 1.6 },
  ], { hellOnly: true }),
  attack("hell-scuttle-feint-tail", "dash-tail", 5, 25, 8.7, 2.7, [
    { at: 0.48, type: "dash", direction: "right", duration: 0.34, speed: 11, width: 3, length: 8 },
    { at: 1.18, type: "strike", shape: "sector", radius: 8.5, halfAngle: 0.55, damage: 23 },
    { at: 1.92, type: "strike", shape: "sector", radius: 9, halfAngle: 0.72, offset: 2.25, damage: 26 },
  ], { hellOnly: true }),
  attack("hell-triple-rake", "claw", 0, 12, 8.4, 2.5, [
    { at: 0.42, type: "strike", shape: "sector", radius: 8.6, halfAngle: 0.38, offset: -0.88, damage: 21 },
    { at: 1.03, type: "strike", shape: "sector", radius: 8.6, halfAngle: 0.38, offset: 0.88, damage: 21 },
    { at: 1.66, type: "strike", shape: "sector", radius: 8.2, halfAngle: 0.62, damage: 24 },
  ], { hellOnly: true, weight: 1.2 }),
  attack("hell-rupture-cage", "quake-tail", 4, 24, 9.3, 2.8, [
    { at: 0.48, type: "strike", shape: "circle", radius: 4.8, damage: 22, grounded: true, knockback: 1.2 },
    { at: 1.22, type: "strike", shape: "sector", radius: 14, halfAngle: 0.14, damage: 25 },
    { at: 2.02, type: "strike", shape: "circle", radius: 12, damage: 22, grounded: true, knockback: 1.7 },
  ], { hellOnly: true }),
  attack("hell-fan-side-break", "tail-dash", 8, 34, 9.4, 2.8, [
    { at: 0.48, type: "volley", shots: [-0.24, 0, 0.24], damage: 14 },
    { at: 1.24, type: "dash", direction: "left", duration: 0.36, speed: 11.5, width: 3.2, length: 9 },
    { at: 2.0, type: "strike", shape: "sector", radius: 9, halfAngle: 0.66, damage: 26 },
  ], { hellOnly: true }),
  attack("hell-lunge-stomp-sweep", "dash-quake-claw", 7, 32, 9.6, 3.0, [
    { at: 0.5, type: "dash", direction: "toward", duration: 0.4, speed: 15, width: 3.4, length: 11, damage: 23 },
    { at: 1.34, type: "strike", shape: "circle", radius: 8.2, damage: 20, grounded: true, knockback: 1.4 },
    { at: 2.18, type: "strike", shape: "sector", radius: 9, halfAngle: 0.68, damage: 25 },
  ], { hellOnly: true }),
  attack("hell-crosscut-tail-hook", "claw-tail", 0, 15, 8.8, 2.8, [
    { at: 0.48, type: "strike", shape: "sector", radius: 8.2, halfAngle: 0.42, offset: -0.72, damage: 21 },
    { at: 1.18, type: "strike", shape: "sector", radius: 8.2, halfAngle: 0.42, offset: 0.72, damage: 21 },
    { at: 1.98, type: "strike", shape: "sector", radius: 9.3, halfAngle: 0.72, offset: 2.15, damage: 25 },
  ], { hellOnly: true }),
  attack("hell-retreat-orbit-sting", "tail-dash", 0, 16, 9.0, 2.9, [
    { at: 0.48, type: "dash", direction: "away", duration: 0.38, speed: 10, width: 3, length: 7 },
    { at: 1.3, type: "strike", shape: "sector", radius: 9, halfAngle: 0.74, offset: 2.15, damage: 24 },
    { at: 2.08, type: "volley", shots: [-0.16, 0, 0.16], damage: 15 },
  ], { hellOnly: true }),
  attack("hell-marked-venom-cascade", "tail", 7, 34, 9.4, 2.9, [
    { at: 0.55, type: "strike", shape: "circle", anchor: "aim", radius: 2.8, damage: 23, knockback: 1.2 },
    { at: 1.32, type: "volley", shots: [-0.22, 0, 0.22], damage: 15 },
    { at: 2.12, type: "strike", shape: "circle", anchor: "aim", radius: 3.6, damage: 25, knockback: 1.8 },
  ], { hellOnly: true }),
  attack("hell-ring-breaker-rush", "quake-dash", 8, 34, 9.6, 2.9, [
    { at: 0.5, type: "strike", shape: "circle", radius: 5.2, damage: 20, grounded: true, knockback: 1.2 },
    { at: 1.26, type: "strike", shape: "circle", radius: 12.8, damage: 22, grounded: true, knockback: 1.7 },
    { at: 2.04, type: "dash", direction: "toward", duration: 0.42, speed: 15.5, width: 3.5, length: 12, damage: 24 },
  ], { hellOnly: true }),
  attack("hell-crosswind-finisher", "dash-tail", 5, 29, 9.2, 2.85, [
    { at: 0.48, type: "dash", direction: "left", duration: 0.34, speed: 11, width: 3, length: 8 },
    { at: 1.18, type: "dash", direction: "right", duration: 0.34, speed: 11, width: 3, length: 8 },
    { at: 1.98, type: "strike", shape: "sector", radius: 9.6, halfAngle: 0.72, offset: 2.1, damage: 26 },
  ], { hellOnly: true }),
  attack("hell-needle-rake-barrage", "tail-claw", 8, 32, 9.0, 2.8, [
    { at: 0.46, type: "strike", shape: "sector", radius: 14, halfAngle: 0.14, damage: 22 },
    { at: 1.16, type: "volley", shots: [-0.2, 0, 0.2], damage: 14 },
    { at: 1.92, type: "strike", shape: "sector", radius: 14, halfAngle: 0.14, damage: 24 },
  ], { hellOnly: true }),
  attack("hell-claw-marked-rush", "claw-dash-tail", 4, 25, 9.2, 2.95, [
    { at: 0.48, type: "strike", shape: "sector", radius: 8.3, halfAngle: 0.54, damage: 22 },
    { at: 1.26, type: "strike", shape: "circle", anchor: "aim", radius: 3.1, damage: 22, knockback: 1.4 },
    { at: 2.08, type: "dash", direction: "toward", duration: 0.38, speed: 15, width: 3.4, length: 10, damage: 24 },
  ], { hellOnly: true }),
  attack("hell-five-beat-execution", "claw-quake-tail-dash", 4, 27, 10.0, 3.25, [
    { at: 0.38, type: "strike", shape: "sector", radius: 8.5, halfAngle: 0.48, offset: -0.56, damage: 17 },
    { at: 0.92, type: "strike", shape: "sector", radius: 8.5, halfAngle: 0.48, offset: 0.56, damage: 17 },
    { at: 1.52, type: "strike", shape: "circle", radius: 10, damage: 18, grounded: true, knockback: 1.2 },
    { at: 2.16, type: "volley", shots: [-0.18, 0.18], damage: 13 },
    { at: 2.72, type: "strike", shape: "sector", radius: 12.5, halfAngle: 0.16, damage: 22 },
  ], { hellOnly: true, weight: 0.85 }),
  attack("hell-pincer-volley-stomp", "claw-tail-quake", 0, 18, 9.5, 3.0, [
    { at: 0.46, type: "strike", shape: "sector", radius: 8.5, halfAngle: 0.6, offset: -0.72, damage: 19 },
    { at: 1.18, type: "volley", shots: [-0.18, 0.18], damage: 14 },
    { at: 1.96, type: "strike", shape: "circle", radius: 10.2, damage: 20, grounded: true, knockback: 1.4 },
  ], { hellOnly: true }),
  attack("hell-tail-comet-break", "tail-dash-quake", 6, 32, 9.7, 3.0, [
    { at: 0.48, type: "strike", shape: "sector", radius: 9.2, halfAngle: 0.72, offset: 2.05, damage: 21 },
    { at: 1.28, type: "dash", direction: "toward", duration: 0.4, speed: 15, width: 3.3, length: 10, damage: 22 },
    { at: 2.12, type: "strike", shape: "circle", radius: 8.5, damage: 20, grounded: true, knockback: 1.4 },
  ], { hellOnly: true }),
  attack("hell-split-volley-pincer", "tail-claw", 0, 30, 9.4, 3.0, [
    { at: 0.48, type: "volley", shots: [-0.2, 0.2], damage: 14 },
    { at: 1.24, type: "strike", shape: "sector", radius: 8.4, halfAngle: 0.5, offset: -0.62, damage: 20 },
    { at: 2.02, type: "strike", shape: "sector", radius: 8.4, halfAngle: 0.5, offset: 0.62, damage: 20 },
  ], { hellOnly: true }),
]);

export const BOSS_ATTACK_BY_ID = Object.freeze(Object.fromEntries(BOSS_ATTACKS.map(move => [move.id, move])));

/** Weighted selection on the authority, with a short repeat-avoidance window. */
export function chooseBossAttack(distance, { enraged = false, hellMode = false, recent = [], random = Math.random } = {}) {
  let candidates = BOSS_ATTACKS.filter(move => distance >= move.min && distance <= move.max
    && (!move.enragedOnly || enraged)
    && (!move.hellOnly || hellMode));
  if (candidates.length > 1) {
    const fresh = candidates.filter(move => !recent.includes(move.id));
    if (fresh.length) candidates = fresh;
  }
  if (!candidates.length) return null;
  const total = candidates.reduce((sum, move) => sum + (move.weight || 1), 0);
  let pick = random() * total;
  for (const move of candidates) {
    pick -= move.weight || 1;
    if (pick <= 0) return move;
  }
  return candidates[candidates.length - 1];
}
