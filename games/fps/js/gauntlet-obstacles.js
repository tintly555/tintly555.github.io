/*
 * Layouts use X for width, Y for height above the entrance deck, and positive Z
 * for distance down-course. The builder mirrors X and converts to world space.
 */
const CYAN = 0x6bbbc7;
const AMBER = 0xe2a457;
const GREEN = 0x6fe1a2;
const RED = 0xf2665b;
const VIOLET = 0xb89af2;

const obstacles = {
  slalom({ pad, finish }, tier) {
    pad(0, 3.4);
    for (let i = 0; i < 4; i++) pad(5.3 + i * 3.8, 7.7 + i * 3.8, { x: (i % 2 ? -1 : 1) * (1.3 + tier * .2), w: 2.9 - tier * .22 });
    pad(19.5, 23);
    finish(23);
  },
  forks({ pad, wall, finish }, tier) {
    pad(0, 3);
    pad(3, 18, { x: -3.1, w: 1.55 - .12 * tier });
    pad(3, 8, { x: 3.1, w: 3.3 });
    pad(10.8, 15, { x: 3.1, w: 2.9, y: .65 });
    wall(10.5, { h: 3.8, w: .55, d: 12 });
    pad(18, 22);
    finish(22);
  },
  ledgeTraverse({ pad, wall, finish }, tier) {
    pad(0, 4);
    wall(12, { h: 4, w: 1.7, d: 16 });
    pad(4, 9, { x: 1.8, w: 2.1, y: .52 });
    pad(11.2, 14, { x: 1.9, w: 1.55, y: 1.05 });
    pad(16.2, 19, { x: 1.75, w: 1.75 - tier * .16, y: 1.55 });
    pad(20.8, 25, { y: 1.55 });
    finish(25, 1.55);
  },
  dropChute({ pad, wall, finish }, tier) {
    pad(0, 5);
    const lower = -4.5 - tier * .65;
    pad(6.5, 13.2, { x: 1.3, w: 4.8, y: lower });
    wall(9, { x: -3.1, y: lower, h: -lower + 2.5, w: 1.15, d: 8 });
    wall(9, { x: 3.85, y: lower, h: -lower + 2.5, w: 1.1, d: 8 });
    pad(13.2, 18, { y: lower });
    finish(18, lower);
  },
  ceilingHops({ pad, wall, finish }, tier) {
    // A covered bridge with a broken floor: two side girders bolted to the pads carry a roof
    // too low to jump under. The roof only ever hangs from the girders.
    const roof = 2.68 - .09 * tier;
    pad(0, 4);
    pad(6.4, 10);
    pad(12.5, 16);
    for (const x of [-4.6, 4.6]) wall(9.6, { x, y: -.6, h: roof + .9 + .6, w: 1.1, d: 10 });
    wall(9.6, { y: roof, h: .9, w: 10.3, d: 10 });
    pad(16, 20);
    finish(20);
  },
  fragileDeck({ pad, finish }, tier) {
    pad(0, 4);
    for (let i = 0; i < 3; i++) pad(5.7 + i * 4, 8.15 + i * 4, { w: 3.3, tone: AMBER, motion: { kind: "crumble", hold: .92 - tier * .13 } });
    pad(17, 21);
    finish(21);
  },
  shutters({ pad, wall, finish }, tier) {
    pad(0, 19, { w: 6.4 });
    for (const x of [-3.4, 3.4]) wall(9.5, { x, h: 3.4, w: .45, d: 17 });
    for (let i = 0; i < 3; i++) wall(5.2 + i * 4, { w: 6.4, h: 2.7, tone: AMBER,
      motion: { kind: "slide", dy: 2.7, period: 3.8 - tier * .32, phase: i * .22 } });
    finish(19);
  },
  pulseDeck({ pad, finish }, tier) {
    pad(0, 4);
    pad(6, 9.3, { w: 3.6, tone: VIOLET, motion: { kind: "blink", period: 4.2, duty: .71 - tier * .06 } });
    pad(11.1, 14.5, { w: 3.4, tone: VIOLET, motion: { kind: "blink", period: 4.2, duty: .71 - tier * .06, phase: .27 } });
    pad(16.3, 21);
    finish(21);
  },
  sweeper({ pad, hazard, finish }, tier) {
    pad(0, 21, { w: 7.4 });
    for (const z of [7, 14]) hazard("rotor", z, { radius: 3.55, height: .61, period: 4.7 - tier * .65, damage: 15 });
    finish(21);
  },
  slidingSteps({ pad, finish }, tier) {
    pad(0, 4);
    pad(5.9, 9, { w: 2.8, x: -1.3, motion: { kind: "slide", dx: 2.6, period: 4.2 - tier * .27 } });
    pad(11, 14.1, { w: 2.8, x: 1.3, motion: { kind: "slide", dx: -2.6, period: 4.2 - tier * .27, phase: .19 } });
    pad(16.2, 21);
    finish(21);
  },
  callFerry({ pad, node, finish }) {
    pad(0, 4);
    node("switch", 0, 2.7, { id: "ferry", hold: 11 });
    pad(4, 7.8, { w: 3.8, tone: CYAN, motion: { kind: "slide", trigger: "ferry", dz: 9.2, period: 8 } });
    pad(17, 22);
    finish(22);
  },
  counterLift({ pad, wall, finish }, tier) {
    const high = 3.8 + tier * .45;
    pad(0, 5);
    pad(5, 9.6, { w: 4.4, tone: AMBER, motion: { kind: "weight", dy: high, speed: 1.6 } });
    wall(7.25, { x: 3.1, w: .44, h: high + 2.5, d: 4.7 });
    pad(9.6, 15.5, { y: high });
    finish(15.5, high);
  },
  boardingRamp({ pad, finish }, tier) {
    const high = 2 + tier * .35;
    pad(0, 4);
    pad(4, 8, { w: 3.7, tone: CYAN, motion: { kind: "ride", dy: high, dz: 10, period: 4.3 } });
    pad(18, 24, { y: high });
    finish(24, high);
  },
  carousel({ pad, finish }, tier) {
    pad(0, 4);
    for (let i = 0; i < 3; i++) pad(6 + i * 4, 9 + i * 4, { w: 3.2, y: i * .25, tone: VIOLET,
      motion: { kind: "orbit", dx: 1.3 + tier * .28, dz: .72, period: 5.5, phase: i * .29 } });
    pad(18.9, 24, { y: .5 });
    finish(24, .5);
  },
  stepEscalator({ pad, finish }, tier) {
    pad(0, 4);
    for (let i = 0; i < 5; i++) {
      const start = 4 + i * 2.3;
      pad(start, start + 2.3, { w: 3.6, y: i * .58, motion: { kind: "slide", dy: .55 + tier * .14, period: 3.2, phase: i * .12 } });
    }
    pad(15.5, 21, { y: 3 });
    finish(21, 3);
  },
  trapdoor({ pad, finish }, tier) {
    pad(0, 5);
    pad(5, 9.7, { w: 4, tone: AMBER, motion: { kind: "crumble", hold: .38 + tier * .09 } });
    pad(5, 14, { y: -3.8, w: 6.8 });
    pad(14, 19, { y: -3.8 });
    finish(19, -3.8);
  },
  wallSpring({ pad, wall, finish }, tier) {
    // Wall jump over a gap. The far platform is higher than a plain jump reaches, so you have
    // to kick off the wall in mid-air (any wall works; this one is just placed for the job).
    const high = 1.5 + tier * .1;
    pad(0, 6);
    wall(5.6, { x: -2.9, h: 4.2, w: .5, d: 5.4 });
    pad(9.4, 16, { y: high, w: 7 });
    finish(16, high);
  },
  catapult({ pad, field, finish }, tier) {
    const high = 2.1 + tier * .28;
    pad(0, 6.4);
    field("spring", 4.2, 6.3, { w: 6, lift: 10.7, zForce: -5, tone: VIOLET });
    pad(12.4, 19, { y: high });
    finish(19, high);
  },
  airRelay({ pad, node, finish }, tier) {
    pad(0, 5);
    node("airKick", 0, 7.55, { y: .8, radius: 2.1, lift: 8.2, zForce: -4.1, tone: VIOLET });
    pad(13.2, 18.7, { y: .85 + tier * .25 });
    finish(18.7, .85 + tier * .25);
  },
  runup({ pad, field, finish }, tier) {
    pad(0, 8.3);
    field("speed", 2.7, 8.3, { speed: 1.72, tone: CYAN });
    pad(14.6 + tier * .42, 21.2);
    finish(21.2);
  },
  slickTurn({ pad, field, finish }, tier) {
    pad(0, 4);
    pad(4, 11, { w: 4.7, x: -1.5 });
    field("slick", 4, 11, { w: 4.65, x: -1.5, grip: .05, tone: CYAN });
    pad(11, 17.5, { x: 1.2 + tier * .28, w: 4.4 });
    pad(17.5, 22);
    finish(22);
  },
  dragStrip({ pad, field, finish }, tier) {
    pad(0, 20, { w: 7 });
    field("adhesion", 5, 14.8, { x: 1.5, w: 5.4, speed: .49, jump: .6, tone: VIOLET });
    for (let i = 0; i < 2 + tier; i++) pad(5 + i * 2.6, 6 + i * 2.6, { x: -2.9, w: 1.4, y: .22 });
    finish(20);
  },
  forwardBelt({ pad, field, wall, finish }, tier) {
    pad(0, 18);
    field("belt", 3.2, 15, { zForce: -3.3 - tier * .4, tone: CYAN });
    wall(10.5, { w: 3.6, h: .68 });
    finish(18);
  },
  ladder({ pad, field, mark, finish }, tier) {
    const height = 3.1 + .32 * tier;
    pad(0, 5.5);
    field("ladder", 4.25, 7.3, { w: 2.5, maxY: height + .7, tone: CYAN, climb: 3.45 });
    for (let y = .25; y <= height; y += .41) mark(0, y, 6.55, 1.38, .095, .14, CYAN);
    for (const x of [-.71, .71]) mark(x, height / 2, 6.56, .10, height, .11, CYAN);
    pad(6.65, 13, { y: height });
    finish(13, height);
  },
  lowGravity({ pad, field, finish }, tier) {
    pad(0, 5.3);
    field("gravity", 3.1, 17.4, { gravity: .35, maxY: 8, tone: VIOLET, volume: true });
    pad(13.1 + tier * .45, 20.8, { y: .8 });
    finish(20.8, .8);
  },
  highGravity({ pad, field, finish }, tier) {
    pad(0, 20);
    field("gravity", 3, 17, { gravity: 1.95 + tier * .23, maxY: 5, tone: VIOLET });
    pad(7, 10, { x: -1.6, w: 2.25, y: .55 });
    pad(12, 15, { x: 1.65, w: 2.25, y: .68 });
    finish(20);
  },
  headwind({ pad, wall, field, finish }, tier) {
    pad(0, 21);
    field("wind", 4, 17, { zForce: 3.4 + tier * .41, tone: CYAN, volume: true });
    wall(8, { x: -1.8, h: 1.4, w: 2.8, d: 1.3 });
    wall(13, { x: 1.8, h: 1.4, w: 2.8, d: 1.3 });
    finish(21);
  },
  gustGates({ pad, field, finish }, tier) {
    pad(0, 4);
    pad(4, 18, { w: 3.6 - .18 * tier });
    field("gust", 4, 18, { xForce: 6.3 + .45 * tier, period: 3.4, w: 5.2, tone: CYAN, volume: true });
    pad(18, 22);
    finish(22);
  },
  thermal({ pad, field, finish }, tier) {
    const high = 3.3 + .35 * tier;
    pad(0, 5);
    field("updraft", 4.4, 14.6, { w: 5.3, maxY: high + 3.8, lift: 25, volume: true, tone: VIOLET });
    pad(13.7, 20, { y: high });
    finish(20, high);
  },
  coolant({ pad, field, finish }, tier) {
    pad(0, 4.5);
    pad(4.5, 15.5, { y: -.7, w: 7 });
    field("water", 4.5, 15.5, { floor: -.7, speed: .59, gravity: .55, xForce: 1.65 + tier * .3, jump: .83, tone: CYAN });
    pad(15.5, 21);
    finish(21);
  },
  chargeRail({ pad, node, finish }, tier) {
    pad(0, 4.7);
    pad(11.6 + tier * .15, 15.4);
    node("dashCharge", 0, 13.5, { radius: 1.8, tone: GREEN });
    pad(22.1 + tier * .14, 28);
    finish(28);
  },
  inhibitor({ pad, field, finish }, tier) {
    pad(0, 5.5);
    field("dashLock", 2.7, 18, { tone: VIOLET, w: 10, maxY: 6, volume: true });
    pad(8.45, 11.1, { x: 1.1, w: 3 - tier * .16 });
    pad(14, 17, { x: -1, w: 3 - tier * .16 });
    pad(19.2, 24.7);
    finish(24.7);
  },
  breach({ pad, wall, finish }, tier) {
    pad(0, 18);
    for (const x of [-3.55, 3.55]) wall(9, { x, w: .55, h: 4.7, d: 12 });
    wall(9, { w: 6.7, h: 4.7, tone: AMBER, gate: "breach", breakable: true });
    if (tier > 1) wall(13.5, { w: 6.7, h: 4.7, tone: AMBER, gate: "breach2", breakable: true });
    finish(18);
  },
  glassRun({ pad, finish }, tier) {
    pad(0, 4.3);
    pad(4.3, 13.1, { x: -2.5, w: 1.7 - .14 * tier });
    for (let i = 0; i < 4; i++) pad(4.3 + i * 2.2, 6.5 + i * 2.2, { w: 3.6, tone: CYAN,
      motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(13.1, 19);
    finish(19);
  },
  pressureDoor({ pad, wall, node, finish }, tier) {
    pad(0, 20);
    node("switch", 2.7, 5.3, { id: "door", hold: 2.7 - .26 * tier });
    wall(12, { h: 5, w: 9.8, gate: "door" });
    finish(20);
  },
  balanceSpan({ pad, finish }, tier) {
    pad(0, 4);
    pad(4, 14.5, { w: 3.05, tone: AMBER, motion: { kind: "weight", dy: -1.7 - tier * .38, speed: .95 + tier * .24 } });
    pad(14.5, 20);
    finish(20);
  },
  memoryGrid({ pad, node, finish }, tier, seed) {
    pad(0, 5);
    for (let row = 0; row < 3; row++) {
      const safe = (seed + row * 2 + Math.floor(seed / (row + 3))) % 3;
      for (let col = 0; col < 3; col++) {
        pad(5 + row * 2.8, 7.8 + row * 2.8, { x: (col - 1) * 2.8, w: 2.76, tone: col === safe ? CYAN : VIOLET,
          motion: col === safe ? { kind: "memory", safe: true, show: 2.8 - tier * .35 } : { kind: "memory", safe: false } });
      }
    }
    node("memoryReplay", 0, 3.2, { tone: CYAN });
    pad(13.4, 18);
    finish(18);
  },
  relayButtons({ pad, wall, node, finish }, tier) {
    pad(0, 21);
    node("switch", -2.9, 5.4, { id: "first", hold: 5.4 - tier * .46 });
    node("switch", 2.9, 9.2, { id: "relay", requires: "first", hold: 3.7 });
    wall(14.8, { w: 9.8, h: 5.2, gate: "relay" });
    finish(21);
  },
  accessCells({ pad, wall, node, finish }, tier) {
    pad(0, 19);
    node("pickup", -3.2, 5.6, { id: "cellA", tone: GREEN });
    pad(6.9, 9.6, { x: 2.9, y: .7 + tier * .12, w: 2.8 });
    node("pickup", 2.9, 8.25, { y: .7 + tier * .12, id: "cellB", tone: GREEN });
    wall(13, { w: 9.8, h: 5.2, gate: ["cellA", "cellB"] });
    finish(19);
  },
  shotRelease({ pad, wall, node, finish }, tier) {
    pad(0, 21);
    node("target", 2.4 + tier * .35, 10.7, { y: 2.35 + .29 * tier, id: "strike", tone: AMBER });
    wall(13.6, { w: 9.8, h: 5.2, gate: "strike" });
    finish(21);
  },
  lockdown({ pad, node, wall, hazard, finish }, tier) {
    pad(0, 23);
    node("switch", 0, 4.5, { id: "lockdown", once: true, hold: 5.3 - .55 * tier });
    wall(16.2, { w: 9.8, h: 5.1, gate: "lockdown" });
    wall(9.7, { x: 2.4, w: 4.2, h: 1.8, d: 1.5 });
    hazard("chase", 4.6, { trigger: "lockdown", range: 12.5, width: 9.1, speed: 3.8 + .3 * tier, damage: 20 });
    finish(23);
  },
  transitPortals({ pad, node, finish }, tier) {
    pad(0, 6.5);
    const side = 2.2 + .26 * tier;
    node("portal", -2.3, 5, { to: { x: side, y: 0, z: 20.4 }, tone: VIOLET });
    pad(18.9, 23.4, { x: side, w: 4.3 });
    pad(23.4, 29);
    finish(29);
  },
  routeSwitch({ pad, node, finish }, tier) {
    pad(0, 5.5);
    node("switch", -2.5, 3.2, { id: "left", group: "route", tone: CYAN, toggle: true });
    node("switch", 2.5, 3.2, { id: "right", group: "route", tone: AMBER, toggle: true });
    pad(5.5, 14.8, { x: -2.5, w: 1.55 - .12 * tier, tone: CYAN, motion: { kind: "bridge", trigger: "left" } });
    pad(5.5, 14.8, { x: 2.5, w: 2.45, tone: AMBER, motion: { kind: "bridge", trigger: "right" } });
    pad(9.4, 10.5, { x: 2.5, w: 2.3, y: .67 });
    pad(14.8, 20);
    finish(20);
  },
  chargeFloor({ pad, field, finish }, tier) {
    pad(0, 23);
    for (let i = 0; i < 3; i++) {
      field("damage", 4 + i * 4.5, 7.7 + i * 4.5, { x: (i % 2 ? -1 : 1) * 1.4, w: 6.3, damage: 11 + tier * 3, tone: RED, maxY: .48 });
    }
    finish(23);
  },
  scanner({ pad, hazard, finish }, tier) {
    pad(0, 24);
    hazard("beam", 7, { width: 7.8, height: 1.35, period: 3.3 - tier * .25, damage: 17 });
    hazard("beam", 14.4, { width: 7.8, height: .49, period: 3.3 - tier * .25, phase: .42, damage: 17 });
    finish(24);
  },
  crossfireLane({ pad, wall, hazard, finish }, tier) {
    pad(0, 25);
    for (let i = 0; i < 3; i++) {
      hazard("dart", 7.5 + i * 5.1, { x: (i % 2 ? -1 : 1) * 4.1, period: 2.35 - tier * .25, phase: i * .17, damage: 14 });
      wall(6.1 + i * 5.1, { x: (i % 2 ? -1 : 1) * 1.7, w: 1.55, h: 1.37, d: .9 });
    }
    finish(25);
  },
  minefield({ pad, node, finish }, tier, seed) {
    pad(0, 23);
    for (let i = 0; i < 5 + tier; i++) {
      const lane = ((seed + i * 3 + Math.floor(i / 2)) % 5) - 2;
      node("mine", lane * 1.65, 5 + i * 1.9, { radius: 1.25, delay: .64 - tier * .08, tone: RED });
    }
    finish(23);
  },
  protectionCell({ pad, field, node, finish }, tier) {
    pad(0, 20);
    // The shield has to outlast the whole heat field with room to spare (10 m is ~1.6 s of running).
    node("shield", 0, 3.4, { seconds: 4.6 - tier * .2, tone: GREEN });
    field("damage", 6.6, 15.2, { w: 9.8, maxY: 2.7, damage: 29 + tier * 4, tone: RED });
    finish(20);
  },
  jetRefuel({ pad, node, finish }, tier) {
    pad(0, 6.5);
    node("fuel", 0, 3.8, { tone: GREEN, radius: 1.65 });
    node("fuel", 0, 12.2, { tone: GREEN, radius: 2.65, y: .14 });
    pad(18 + tier * .35, 24.5);
    finish(24.5);
  },
  jetRise({ pad, wall, node, finish }, tier) {
    const high = 2.0 + tier * .2;
    pad(0, 6.8);
    node("fuel", 0, 4.2, { tone: GREEN });
    for (const x of [-3.05, 3.05]) wall(8.8, { x, w: .6, h: 5.8, d: 8 });
    pad(10.8, 16.1, { y: high, w: 5.2 });
    node("fuel", 0, 14.2, { y: high, tone: GREEN });
    pad(20, 26, { y: high * 2, w: 6.2 });
    finish(26, high * 2);
  },
  slopeRise({ pad, ramp, finish }, tier) {
    const high = 1.6 + tier * .4, w = 5.4 - tier * .3;
    pad(0, 4);
    ramp(4, 10.5, { y0: 0, y1: high, w });
    pad(10.5, 14, { y: high, w });
    ramp(14, 20.5, { y0: high, y1: 0, w });
    pad(20.5, 25);
    finish(25);
  },
  switchbackRamps({ pad, ramp, finish }, tier) {
    const mid = 1.7 + tier * .2, top = mid * 2;
    pad(0, 4);
    ramp(4, 10, { x: -2.4, y0: 0, y1: mid, w: 3.4 - tier * .2, tone: AMBER });
    pad(10, 13.5, { y: mid, w: 9 });
    ramp(13.5, 19.5, { x: 2.4, y0: mid, y1: top, w: 3.4 - tier * .2, tone: AMBER });
    pad(19.5, 24, { y: top });
    finish(24, top);
  },
  pistonSteps({ pad, finish }, tier) {
    const dy = 1 + tier * .05;
    pad(0, 4);
    for (let i = 0; i < 4; i++) pad(5.4 + i * 3.4, 8 + i * 3.4, { w: 3.4, tone: CYAN,
      motion: { kind: "slide", dy, period: 3.8 - tier * .2, phase: i * .25 } });
    pad(19.6, 24);
    finish(24);
  },
  stepStones({ pad, finish }, tier) {
    pad(0, 4);
    [.35, .8, .45, 1, .6, .2].forEach((y, i) =>
      pad(5.2 + i * 3.1, 7.6 + i * 3.1, { x: (i % 2 ? -1 : 1) * (1.2 + tier * .15), w: 2.2 - tier * .12, y }));
    pad(24, 28);
    finish(28);
  },
  wallShaft({ pad, wall, finish }, tier) {
    // Two close parallel walls: kick off them in turn to climb to the exit ledge.
    const high = 2.3 + tier * .12;
    pad(0, 4);
    pad(4, 12, { w: 2.8 });
    for (const x of [-1.65, 1.65]) wall(8, { x, h: high + 1.4, w: .5, d: 8 });
    pad(12, 17, { y: high, w: 6 });
    finish(17, high);
  },
};

export const gauntletObstacleIds = Object.freeze(Object.keys(obstacles));

export function makeGauntletObstacle(id, tier, mirror, seed) {
  const pieces = [];
  let length, exitHeight;
  const builder = {
    pad(from, to, options = {}) {
      pieces.push({ type: "deck", z: (from + to) / 2, d: to - from, x: 0, y: 0, w: 8, tone: CYAN, ...options });
    },
    wall(z, options = {}) {
      pieces.push({ type: "wall", z, x: 0, y: 0, w: 5, h: 2.5, d: .45, tone: 0x566673, ...options });
    },
    field(kind, from, to, options = {}) {
      pieces.push({ type: "field", kind, z: (from + to) / 2, d: to - from, x: 0, w: 7.5, floor: 0, maxY: 2.8, ...options });
    },
    node(kind, x, z, options = {}) {
      pieces.push({ type: "node", kind, x, z, y: 0, radius: .95, tone: GREEN, ...options });
    },
    hazard(kind, z, options = {}) {
      pieces.push({ type: "hazard", kind, z, x: 0, y: 0, ...options });
    },
    ramp(from, to, options = {}) {
      pieces.push({ type: "ramp", z: (from + to) / 2, from, to, d: to - from, x: 0, w: 5, y0: 0, y1: 0, tone: CYAN, ...options });
    },
    mark(x, y, z, w, h, d, tone) {
      pieces.push({ type: "prop", x, y, z, w, h, d, tone });
    },
    finish(end, height = 0) {
      length = end;
      exitHeight = height;
    },
  };
  const build = obstacles[id];
  if (!build) throw new Error("Unknown Gauntlet obstacle " + id);
  build(builder, tier, seed);
  for (const piece of pieces) {
    piece.x *= mirror;
    if (piece.xForce) piece.xForce *= mirror;
    if (piece.to && typeof piece.to === "object") piece.to.x *= mirror;   // ramps use `to` for a distance
    if (piece.motion?.dx) piece.motion.dx *= mirror;
  }
  return { pieces, length, exitHeight };
}
