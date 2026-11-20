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
    const narrow = 2.9 - tier * .22;
    pad(0, 4.1, { w: 7.2 });
    pad(5.1, 7.45, { x: 1.35, w: narrow, y: .18 });
    pad(8.4, 10.8, { x: -1.45, w: narrow + .15, y: .42 });
    pad(12.2, 14.55, { x: 1.75, w: narrow - .1, y: .24 });
    pad(15.6, 18.7, { x: -.9, w: narrow + .25, y: .5 });
    pad(19.4, 23, { w: 7.2, y: .25 });
    finish(23, .25);
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
    const finalWidth = 1.75 - tier * .16;
    pad(0, 4, { w: 7.4 });
    wall(12.3, { h: 4, w: 1.7, d: 17.2 });
    pad(4.8, 8.2, { x: 1.9, w: 2.15, y: .25 });
    pad(9.6, 12.1, { x: 2.15, w: 1.8, y: .72 });
    pad(13.9, 16.7, { x: 1.65, w: finalWidth, y: 1.08 });
    pad(18.5, 21.3, { x: .65, w: 2.5, y: 1.1 });
    pad(22.1, 25, { y: 1.1, w: 6.6 });
    finish(25, 1.1);
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
    pad(0, 4.5, { w: 7.6 });
    pad(5.5, 8.4, { x: -1.1, w: 3.1 });
    pad(9.5, 12.4, { x: 1.05, w: 3.4 });
    pad(13.4, 16.6, { x: -.65, w: 3.8 });
    for (const x of [-4.45, 4.45]) wall(10.8, { x, y: -.6, h: roof + .9 + .6, w: 1.1, d: 11.8 });
    wall(10.8, { y: roof, h: .9, w: 10.1, d: 11.8 });
    pad(17.8, 21, { w: 7.2 });
    finish(21);
  },
  fragileDeck({ pad, finish }, tier) {
    const hold = .92 - tier * .13;
    pad(0, 4.6, { w: 7.4 });
    pad(5.5, 8.5, { x: -.8, w: 3.35, tone: AMBER, motion: { kind: "crumble", hold } });
    pad(9.4, 12.1, { x: 1.15, w: 2.85, y: .22, tone: AMBER, motion: { kind: "crumble", hold } });
    pad(13.1, 16.6, { x: -.55, w: 3.7, y: .08, tone: AMBER, motion: { kind: "crumble", hold } });
    pad(17.7, 21.4, { w: 7.4 });
    finish(21.4);
  },
  shutters({ pad, wall, finish }, tier) {
    const period = 3.8 - tier * .32;
    pad(0, 4.2, { w: 7.2 });
    pad(4.2, 8.9, { w: 6.4 });
    pad(8.9, 14.4, { w: 5.8, x: -.15 });
    pad(14.4, 19.5, { w: 6.6 });
    for (const x of [-3.45, 3.45]) wall(10.1, { x, h: 3.4, w: .45, d: 17.8 });
    wall(5.7, { w: 6.2, h: 2.7, tone: AMBER, motion: { kind: "slide", dy: 2.7, period, phase: 0 } });
    wall(11.2, { w: 5.8, h: 2.45, tone: AMBER, motion: { kind: "slide", dy: 2.45, period: period + .55, phase: .29 } });
    wall(16.5, { w: 6.3, h: 2.7, tone: AMBER, motion: { kind: "slide", dy: 2.7, period: period + .9, phase: .61 } });
    finish(19.5);
  },
  pulseDeck({ pad, finish }, tier) {
    const duty = .71 - tier * .06;
    pad(0, 4.4, { w: 7.3 });
    pad(5.45, 8.25, { x: -1.35, w: 3.5, tone: VIOLET, motion: { kind: "blink", period: 4.2, duty } });
    pad(9.5, 12.15, { x: 1.25, w: 3.15, y: .28, tone: VIOLET, motion: { kind: "blink", period: 4.2, duty, phase: .27 } });
    pad(13.4, 16.2, { x: -.75, w: 3.55, y: .08, tone: VIOLET, motion: { kind: "blink", period: 4.65, duty, phase: .53 } });
    pad(17.3, 21.5, { w: 7.3 });
    finish(21.5);
  },
  sweeper({ pad, hazard, finish }, tier) {
    pad(0, 5.2, { w: 7.3 });
    pad(5.2, 10.4, { w: 6.1, x: .25 });
    pad(10.4, 16.2, { w: 5.8, x: -.2 });
    pad(16.2, 21.8, { w: 7.3 });
    hazard("rotor", 7.8, { radius: 3.35, height: .61, period: 4.7 - tier * .65, damage: 15 });
    hazard("rotor", 14.5, { radius: 3.2, height: .61, period: 4.7 - tier * .65, damage: 15, phase: .31 });
    finish(21.8);
  },
  slidingSteps({ pad, finish }, tier) {
    const period = 4.2 - tier * .27;
    pad(0, 4.2, { w: 7.3 });
    pad(5.1, 8.15, { w: 2.9, x: -1.35, y: .18, motion: { kind: "slide", dx: 2.35, period } });
    pad(9.65, 12.5, { w: 3.2, x: 1.15, y: .52, motion: { kind: "slide", dx: -2.15, period: period + .35, phase: .19 } });
    pad(14, 16.9, { w: 3.1, x: -.9, y: .34, motion: { kind: "slide", dx: 1.9, period: period + .7, phase: .47 } });
    pad(18.1, 21.5, { w: 7.3 });
    finish(21.5);
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
    const orbit = 1.3 + tier * .28;
    pad(0, 4.2, { w: 7.4 });
    pad(5.4, 8.5, { x: -1.45, w: 3.1, y: .12, tone: VIOLET,
      motion: { kind: "orbit", dx: orbit, dz: .62, period: 5.5, phase: 0 } });
    pad(10.3, 13.2, { x: 1.3, w: 3.25, y: .42, tone: VIOLET,
      motion: { kind: "orbit", dx: orbit * .82, dz: .8, period: 6.1, phase: .29 } });
    pad(15.1, 18.4, { x: -.55, w: 3.4, y: .68, tone: VIOLET,
      motion: { kind: "orbit", dx: orbit * .72, dz: .68, period: 6.7, phase: .61 } });
    pad(20.2, 24.6, { y: .6, w: 7.4 });
    finish(24.6, .6);
  },
  stepEscalator({ pad, finish }, tier) {
    pad(0, 4);
    const rise = .52 + tier * .12;
    pad(4.9, 7.2, { x: -1.35, w: 3.45, y: .48, motion: { kind: "slide", dy: rise, period: 3.2, phase: 0 } });
    pad(7.95, 10.15, { x: .9, w: 3.15, y: 1.04, motion: { kind: "slide", dy: rise, period: 3.55, phase: .18 } });
    pad(10.95, 13.25, { x: -1.05, w: 3.4, y: 1.63, motion: { kind: "slide", dy: rise, period: 3.85, phase: .37 } });
    pad(14.1, 16.65, { x: .6, w: 3.7, y: 2.18, motion: { kind: "slide", dy: rise, period: 4.1, phase: .56 } });
    pad(17.7, 21.6, { y: 2.72, w: 7.4 });
    finish(21.6, 2.72);
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
    const exitX = 1.05 + tier * .22;
    pad(4, 9.7, { w: 4.35, x: -1.65 });
    field("slick", 4, 9.7, { w: 4.25, x: -1.65, grip: .05, tone: CYAN });
    pad(9.7, 13.2, { w: 4.1, x: -.35, y: .16 });
    pad(13.2, 17.9, { x: exitX, w: 4.3, y: .3 });
    field("slick", 13.2, 17.9, { x: exitX, w: 4.2, grip: .05, tone: CYAN });
    pad(17.9, 22.5, { w: 7.2 });
    finish(22.5);
  },
  dragStrip({ pad, field, finish }, tier) {
    pad(0, 5.2, { w: 7.4 });
    pad(5.2, 9.3, { w: 6.8 });
    field("adhesion", 5.2, 15.9, { x: .7, w: 5.5, speed: .49, jump: .6, tone: VIOLET });
    pad(9.3, 12.1, { x: -2.3, w: 2.3, y: .24 });
    pad(12.9, 15.9, { x: -.25, w: 2.65, y: .46 });
    pad(16.8, 20.3, { w: 7.4 });
    finish(20.3);
  },
  forwardBelt({ pad, field, wall, finish }, tier) {
    const force = -3.3 - tier * .4;
    pad(0, 4.8, { w: 7.4 });
    pad(4.8, 9.4, { w: 6.2, x: -.35 });
    field("belt", 4.8, 15.6, { zForce: force, tone: CYAN });
    wall(10.2, { x: -1.45, w: 2.4, h: .72, d: 1.35 });
    pad(9.4, 12.5, { w: 6.4, x: .35 });
    pad(12.5, 16.7, { w: 7.1 });
    finish(16.7);
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
    const landing = 13.1 + tier * .45;
    pad(0, 5.3, { w: 7.4 });
    field("gravity", 3.1, 17.4, { gravity: .35, maxY: 8, tone: VIOLET, volume: true });
    pad(5.3, 8.8, { x: -1.3, w: 4.6, y: .32 });
    pad(9.4, 12.4, { x: 1.25, w: 4.2, y: .64 });
    pad(landing, 16.5, { x: .55, y: .8, w: 5.8 });
    pad(17.5, 21.2, { w: 7.4 });
    finish(21.2);
  },
  highGravity({ pad, field, finish }, tier) {
    pad(0, 5.1, { w: 7.4 });
    field("gravity", 4.4, 16.2, { gravity: 1.95 + tier * .23, maxY: 5, tone: VIOLET });
    pad(5.1, 8.1, { x: -1.55, w: 2.45, y: .42 });
    pad(9.6, 12.2, { x: .8, w: 2.3, y: .64 });
    pad(13.6, 16.4, { x: 1.95, w: 2.2, y: .28 });
    pad(17.4, 21, { w: 7.4 });
    finish(21);
  },
  headwind({ pad, wall, field, finish }, tier) {
    pad(0, 5.2, { w: 7.4 });
    pad(5.2, 10.3, { w: 6.8, x: -.25 });
    field("wind", 4, 17.5, { zForce: 3.4 + tier * .41, tone: CYAN, volume: true });
    wall(8, { x: -1.8, h: 1.4, w: 2.8, d: 1.3 });
    pad(10.3, 14.6, { w: 6.3, x: .4 });
    wall(13, { x: 1.8, h: 1.4, w: 2.8, d: 1.3 });
    pad(14.6, 21.4, { w: 7.4 });
    finish(21.4);
  },
  gustGates({ pad, field, finish }, tier) {
    const width = 3.8 - .18 * tier;
    pad(0, 4.5, { w: 7.4 });
    pad(5.3, 8.2, { x: -1.2, w: width, y: .2 });
    field("gust", 5.3, 8.2, { x: -1.2, xForce: 6.3 + .45 * tier, period: 3.4, w: 5.2, tone: CYAN, volume: true });
    pad(9.5, 12.4, { x: .75, w: width, y: .44 });
    field("gust", 9.5, 12.4, { x: .75, xForce: 6.3 + .45 * tier, period: 3.4, phase: .34, w: 5.2, tone: CYAN, volume: true });
    pad(13.7, 16.8, { x: 1.15, w: width - .1, y: .24 });
    pad(18, 22.4, { w: 7.4 });
    finish(22.4);
  },
  thermal({ pad, field, finish }, tier) {
    const high = 3.3 + .35 * tier;
    pad(0, 4.8, { w: 7.4 });
    field("updraft", 4.4, 14.6, { x: -.55, w: 5.3, maxY: high + 3.8, lift: 25, volume: true, tone: VIOLET });
    pad(13.7, 16.4, { x: -.55, y: high, w: 5.6 });
    pad(17.1, 20.8, { x: .65, y: high, w: 6.4 });
    finish(20.8, high);
  },
  coolant({ pad, field, finish }, tier) {
    pad(0, 4.5, { w: 7.4 });
    pad(4.5, 8.4, { x: -.35, y: -.7, w: 6.4 });
    field("water", 4.5, 16.3, { floor: -.7, speed: .59, gravity: .55, xForce: 1.65 + tier * .3, jump: .83, tone: CYAN });
    pad(8.4, 11.3, { x: .65, y: -.7, w: 5.2 });
    pad(11.3, 16.3, { x: .25, y: -.7, w: 6.2 });
    pad(16.3, 21.8, { w: 7.4 });
    finish(21.8);
  },
  chargeRail({ pad, node, finish }, tier) {
    const offset = tier * .12;
    pad(0, 4.8, { w: 7.4 });
    pad(6.1, 9.2, { x: -1.2, w: 3.6, y: .22 });
    pad(10.5 + offset, 13.1 + offset, { x: 1.35, w: 3.3, y: .48 });
    node("dashCharge", 1.25, 14.15 + offset, { radius: 1.65, tone: GREEN });
    pad(15.1 + offset, 18.4 + offset, { x: -.75, w: 3.8, y: .24 });
    pad(20.2 + offset, 24.2 + offset, { w: 7.4 });
    finish(24.2 + offset);
  },
  inhibitor({ pad, field, finish }, tier) {
    const width = 3.25 - tier * .16;
    pad(0, 5.5, { w: 7.4 });
    field("dashLock", 3.1, 19.2, { tone: VIOLET, w: 10, maxY: 6, volume: true });
    pad(6.5, 9.2, { x: -1.4, w: width, y: .18 });
    pad(10.5, 13, { x: .95, w: width - .12, y: .42 });
    pad(14.3, 17.1, { x: -1.05, w: width, y: .2 });
    pad(18.4, 22.5, { w: 7.4 });
    finish(22.5);
  },
  breach({ pad, wall, finish }, tier) {
    pad(0, 6.8, { w: 7.4 });
    pad(6.8, 12.4, { w: 6.8, x: -.15 });
    for (const x of [-3.55, 3.55]) wall(9.4, { x, w: .55, h: 4.7, d: 12.8 });
    wall(9.4, { w: 6.7, h: 4.7, tone: AMBER, gate: "breach", breakable: true });
    if (tier > 1) wall(14.1, { w: 6.7, h: 4.7, tone: AMBER, gate: "breach2", breakable: true });
    pad(12.4, 15.8, { w: 6.2, x: .35 });
    pad(15.8, 19, { w: 7.4 });
    finish(19);
  },
  glassRun({ pad, finish }, tier) {
    const width = 3.5 - .14 * tier;
    pad(0, 4.3, { w: 7.2 });
    pad(5.2, 7.65, { x: -1.15, w: width, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(8.55, 11.05, { x: 1.25, w: width - .12, y: .16, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(12.15, 14.5, { x: -.5, w: width + .08, y: .34, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(15.55, 18.25, { x: 1.1, w: width - .08, y: .14, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(19.35, 22, { w: 7.2 });
    finish(22);
  },
  pressureDoor({ pad, wall, node, finish }, tier) {
    pad(0, 4.4, { w: 7.4 });
    pad(4.4, 7.4, { x: 2.55, w: 2.45 });
    node("switch", 2.7, 5.3, { id: "door", hold: 2.7 - .26 * tier });
    pad(7.4, 11.4, { x: .55, w: 5.8 });
    wall(12, { h: 5, w: 9.8, gate: "door" });
    pad(12.6, 16.2, { x: -.25, w: 6.2 });
    pad(16.2, 20.5, { w: 7.4 });
    finish(20.5);
  },
  balanceSpan({ pad, finish }, tier) {
    pad(0, 4.4, { w: 7.4 });
    pad(5.25, 9.1, { x: -.45, w: 3.2, tone: AMBER, motion: { kind: "weight", dy: -1.1 - tier * .28, speed: .95 + tier * .24 } });
    pad(10.15, 14.1, { x: .55, w: 3.05, y: -.08, tone: AMBER, motion: { kind: "weight", dy: -1.45 - tier * .2, speed: 1.05 + tier * .2, phase: .27 } });
    pad(15.2, 20.5, { w: 7.4, y: -.12 });
    finish(20.5, -.12);
  },
  memoryGrid({ pad, node, finish }, tier, seed) {
    const rows = [
      { z0: 5.1, z1: 7.65, x: [-2.6, 0, 2.6], y: [.04, .22, 0] },
      { z0: 8.45, z1: 10.85, x: [-2.45, .2, 2.7], y: [.18, 0, .32] },
      { z0: 11.8, z1: 14.45, x: [-2.7, -.15, 2.5], y: [.36, .16, .42] },
    ];
    const layoutSeed = Number.isFinite(seed) ? Math.trunc(seed) : 0;
    pad(0, 4.4, { w: 7.4 });
    for (let row = 0; row < rows.length; row++) {
      const safe = ((layoutSeed + row * 2 + Math.floor(layoutSeed / (row + 3))) % 3 + 3) % 3;
      for (let col = 0; col < 3; col++) {
        const step = rows[row];
        pad(step.z0, step.z1, { x: step.x[col], y: step.y[col], w: 2.45, tone: col === safe ? CYAN : VIOLET,
          motion: col === safe ? { kind: "memory", safe: true, show: 2.8 - tier * .35 } : { kind: "memory", safe: false } });
      }
    }
    node("memoryReplay", -.2, 3.15, { tone: CYAN });
    pad(15.6, 19.2, { w: 7.4 });
    finish(19.2);
  },
  relayButtons({ pad, wall, node, finish }, tier) {
    pad(0, 4.2, { w: 7.4 });
    node("switch", -2.9, 5.4, { id: "first", hold: 5.4 - tier * .46 });
    node("switch", 2.9, 9.2, { id: "relay", requires: "first", hold: 3.7 });
    pad(4.2, 7.4, { x: -2.25, w: 3.25 });
    pad(7.4, 8.35, { w: 7.2 });
    pad(8.35, 12.2, { x: 2.25, w: 3.35 });
    pad(12.2, 16.8, { w: 6.2, x: .2 });
    pad(16.8, 21.5, { w: 7.4 });
    wall(14.8, { w: 9.8, h: 5.2, gate: "relay" });
    finish(21.5);
  },
  accessCells({ pad, wall, node, finish }, tier) {
    pad(0, 4.3, { w: 7.4 });
    node("pickup", -3.2, 5.6, { id: "cellA", tone: GREEN });
    pad(4.3, 6.4, { x: -2.85, w: 2.25 });
    pad(6.4, 7.2, { w: 7.4 });
    pad(7.2, 9.8, { x: 2.75, y: .7 + tier * .12, w: 2.8 });
    node("pickup", 2.9, 8.25, { y: .7 + tier * .12, id: "cellB", tone: GREEN });
    pad(10.6, 12.7, { x: .2, w: 3.2, y: .42 });
    pad(14.1, 16.1, { x: -1.8, w: 3.4, y: .18 });
    pad(17.2, 20, { w: 7.4 });
    wall(13, { w: 9.8, h: 5.2, gate: ["cellA", "cellB"] });
    finish(20);
  },
  shotRelease({ pad, wall, node, finish }, tier) {
    pad(0, 5.1, { w: 7.4 });
    pad(5.1, 9.2, { w: 5.2, x: -.8 });
    wall(8.2, { x: 1.55, w: 1.5, h: 1.65, d: 1.1 });
    pad(9.2, 13.1, { w: 5.6, x: .75 });
    node("target", 2.4 + tier * .35, 10.7, { y: 2.35 + .29 * tier, id: "strike", tone: AMBER });
    wall(13.6, { w: 9.8, h: 5.2, gate: "strike" });
    pad(13.1, 17.4, { w: 6.2, x: -.3 });
    pad(17.4, 21.5, { w: 7.4 });
    finish(21.5);
  },
  lockdown({ pad, node, wall, hazard, finish }, tier) {
    pad(0, 5.2, { w: 7.4 });
    pad(5.2, 9.3, { w: 6.4, x: -.4 });
    node("switch", 0, 4.5, { id: "lockdown", once: true, hold: 5.3 - .55 * tier });
    wall(16.2, { w: 9.8, h: 5.1, gate: "lockdown" });
    wall(9.7, { x: 2.25, w: 3.7, h: 1.8, d: 1.5 });
    hazard("chase", 4.6, { trigger: "lockdown", range: 12.5, width: 9.1, speed: 3.8 + .3 * tier, damage: 20 });
    pad(9.3, 12.9, { w: 6.1, x: .4 });
    pad(12.9, 17.2, { w: 6.6 });
    pad(17.2, 23.5, { w: 7.4 });
    finish(23.5);
  },
  transitPortals({ pad, node, finish }, tier) {
    pad(0, 6.5);
    const side = 2 + .15 * tier;
    node("portal", -2.3, 5, { to: { x: side, y: 0, z: 20.4 }, tone: VIOLET });
    pad(18.9, 23.4, { x: side, w: 3.7 });
    pad(23.4, 29);
    finish(29);
  },
  routeSwitch({ pad, node, finish }, tier) {
    pad(0, 5.5, { w: 7.4 });
    node("switch", -2.5, 3.2, { id: "left", group: "route", tone: CYAN, toggle: true });
    node("switch", 2.5, 3.2, { id: "right", group: "route", tone: AMBER, toggle: true });
    pad(5.5, 9.1, { x: -2.45, w: 1.8 - .1 * tier, tone: CYAN, motion: { kind: "bridge", trigger: "left" } });
    pad(10, 13.5, { x: -2.35, w: 2.05 - .1 * tier, y: .3, tone: CYAN, motion: { kind: "bridge", trigger: "left" } });
    pad(5.5, 8.4, { x: 2.35, w: 2.55, tone: AMBER, motion: { kind: "bridge", trigger: "right" } });
    pad(9.2, 12.2, { x: 2.45, w: 2.35, y: .42, tone: AMBER, motion: { kind: "bridge", trigger: "right" } });
    pad(13.5, 15.2, { w: 7.1 });
    pad(16.6, 20.5, { w: 7.4 });
    finish(20.5);
  },
  chargeFloor({ pad, field, finish }, tier) {
    pad(0, 4.6, { w: 7.4 });
    pad(4.6, 9.2, { w: 7.1 });
    field("damage", 5.4, 8.4, { x: 1.35, w: 4.8, damage: 11 + tier * 3, tone: RED, maxY: .48 });
    pad(9.2, 12.8, { x: -.55, w: 5.4 });
    field("damage", 9.9, 12.2, { x: -1.35, w: 4.35, damage: 11 + tier * 3, tone: RED, maxY: .48 });
    pad(12.8, 17.3, { x: .65, w: 5.8 });
    field("damage", 13.6, 16.5, { x: 1.45, w: 4.2, damage: 11 + tier * 3, tone: RED, maxY: .48 });
    pad(17.3, 23, { w: 7.4 });
    finish(23);
  },
  scanner({ pad, hazard, finish }, tier) {
    const period = 3.3 - tier * .25;
    pad(0, 5.2, { w: 7.4 });
    pad(5.2, 9.6, { w: 6.7 });
    hazard("beam", 7.3, { width: 7.3, height: 1.25, period, damage: 17 });
    pad(9.6, 12.9, { x: -.45, w: 6.1, y: .18 });
    pad(12.9, 17.1, { x: .35, w: 6.3 });
    hazard("beam", 15.1, { width: 7.3, height: .56, period: period + .4, phase: .42, damage: 17 });
    pad(17.1, 24.2, { w: 7.4 });
    finish(24.2);
  },
  crossfireLane({ pad, wall, hazard, finish }, tier) {
    const period = 2.35 - tier * .25;
    pad(0, 5.4, { w: 7.4 });
    wall(6.5, { x: -1.65, w: 1.55, h: 1.34, d: 1.15 });
    hazard("dart", 8, { x: 3.55, period, phase: 0, damage: 14 });
    pad(5.4, 11.7, { w: 7.4 });
    wall(12.9, { x: 1.55, w: 1.9, h: 1.55, d: 1.25 });
    hazard("dart", 14.5, { x: -3.55, period: period + .25, phase: .31, damage: 14 });
    pad(11.7, 18.5, { w: 6.8, x: -.25 });
    wall(19.8, { x: -.45, w: 1.5, h: 1.2, d: 1.05 });
    hazard("dart", 21.3, { x: 3.4, period: period + .55, phase: .63, damage: 14 });
    pad(18.5, 25.5, { w: 7.4 });
    finish(25.5);
  },
  minefield({ pad, node, finish }, tier, seed) {
    const positions = [
      [-2, 5.2], [1, 7.4], [2, 10.3], [-1, 12.1], [-2, 15.2], [1, 17.6], [0, 20.1], [2, 22.1],
    ];
    const layoutSeed = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
    pad(0, 25, { w: 7.4 });
    for (let i = 0; i < 5 + tier; i++) {
      const [lane, z] = positions[(i + layoutSeed) % positions.length];
      node("mine", lane * 1.6, z, { radius: 1.12, delay: .64 - tier * .08, tone: RED });
    }
    finish(25);
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
    pad(0, 5.8, { w: 7.4 });
    node("fuel", 0, 4.2, { tone: GREEN });
    wall(8.3, { x: -3.3, w: .6, h: 5.8, d: 7.3 });
    wall(9.1, { x: 3.3, w: .6, h: 5.8, d: 7.3 });
    pad(10.1, 14.5, { x: -.4, y: high, w: 5.2 });
    node("fuel", -.4, 13.1, { y: high, tone: GREEN });
    pad(16.2, 19.8, { x: .7, y: high * 1.45, w: 4.8 });
    node("fuel", .7, 18.1, { y: high * 1.45, tone: GREEN, radius: 1.15 });
    pad(21.4, 27, { y: high * 2, w: 6.2 });
    finish(27, high * 2);
  },
  slopeRise({ pad, ramp, finish }, tier) {
    const high = 1.6 + tier * .4, w = 5.4 - tier * .3;
    pad(0, 4.5, { w: 7.4 });
    ramp(4.5, 11.4, { y0: 0, y1: high, w });
    pad(11.4, 14.8, { x: -.45, y: high, w: w + .8 });
    ramp(14.8, 21.6, { x: .55, y0: high, y1: .12, w: w - .35 });
    pad(21.6, 26.2, { y: .12, w: 7.4 });
    finish(26.2, .12);
  },
  switchbackRamps({ pad, ramp, finish }, tier) {
    const mid = 1.7 + tier * .2, top = mid * 2;
    const width = 3.8 - tier * .2;
    pad(0, 4.6, { w: 7.4 });
    ramp(4.6, 10.4, { x: -2.15, y0: 0, y1: mid, w: width, tone: AMBER });
    pad(10.4, 13.6, { x: -.6, y: mid, w: 6.8 });
    ramp(13.6, 20.3, { x: 2.05, y0: mid, y1: top, w: width - .25, tone: AMBER });
    pad(20.3, 24.8, { x: .5, y: top, w: 6.9 });
    finish(24.8, top);
  },
  pistonSteps({ pad, finish }, tier) {
    const dy = 1 + tier * .05;
    pad(0, 4.4, { w: 7.4 });
    pad(5.2, 8.15, { x: -1.45, w: 3.6, tone: CYAN, motion: { kind: "slide", dy, period: 3.8 - tier * .2, phase: 0 } });
    pad(9.15, 12.05, { x: .9, w: 3.3, y: .28, tone: CYAN, motion: { kind: "slide", dy: dy * .8, period: 4.1 - tier * .16, phase: .29 } });
    pad(13.05, 16.35, { x: -1.1, w: 3.8, y: -.12, tone: CYAN, motion: { kind: "slide", dy: dy * 1.12, period: 4.45 - tier * .17, phase: .57 } });
    pad(17.5, 21.5, { w: 7.4 });
    finish(21.5);
  },
  stepStones({ pad, finish }, tier) {
    const width = 2.35 - tier * .12;
    pad(0, 4.2, { w: 7.4 });
    pad(5.3, 7.6, { x: -1.15, w: width, y: .22 });
    pad(8.35, 10.8, { x: 1.05, w: width + .12, y: .56 });
    pad(11.6, 14.25, { x: 2.2, w: width - .08, y: .32 });
    pad(15.1, 17.45, { x: .15, w: width + .18, y: .68 });
    pad(18.4, 20.85, { x: -1.9, w: width, y: .38 });
    pad(21.8, 24.6, { x: -.25, w: width + .2, y: .16 });
    pad(25.5, 29.2, { w: 7.4 });
    finish(29.2);
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
