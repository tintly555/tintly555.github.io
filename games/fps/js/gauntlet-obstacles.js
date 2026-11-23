import { GAUNTLET_GAP_SCALE } from "./gauntlet-legs.js?v=11-double-gap-layout";

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
  slalom({ pad, finish }, tier, seed = 0) {
    const narrow = 2.9 - tier * .22;
    const lanes = [
      [-1, 1, -1, 1],
      [1, -1, 1, -1],
      [-1, -1, 1, 1],
      [1, 1, -1, -1],
    ][(seed >>> 7) % 4];
    const offsets = [1.35, 1.45, 1.75, .9];
    pad(0, 4.1, { w: 7.2 });
    pad(5.1, 7.45, { x: lanes[0] * offsets[0], w: narrow, y: .18 });
    pad(8.4, 10.8, { x: lanes[1] * offsets[1], w: narrow + .15, y: .42 });
    pad(12.2, 14.55, { x: lanes[2] * offsets[2], w: narrow - .1, y: .24 });
    pad(15.6, 18.7, { x: lanes[3] * offsets[3], w: narrow + .25, y: .5 });
    pad(19.4, 23, { w: 7.2, y: .25 });
    finish(23, .25);
  },
  forks({ pad, wall, finish }, tier) {
    pad(0, 3);
    pad(3, 8, { x: -3.1, w: 1.55 - .12 * tier });
    pad(10.8, 15, { x: -3.1, w: 1.55 - .12 * tier });
    pad(3, 8, { x: 3.1, w: 3.3 });
    pad(10.8, 15, { x: 3.1, w: 2.9, y: .65 });
    wall(10.5, { h: 3.8, w: .55, d: 12 });
    pad(18, 22);
    finish(22);
  },
  ledgeTraverse({ pad, wall, finish }, tier, seed = 0) {
    const finalWidth = 1.75 - tier * .16;
    const layout = [
      { side: 1, lanes: [1.9, 2.15, 1.65, .75], spans: [[4.8, 8.2], [9.6, 12.1], [13.9, 16.7], [18.5, 21.3]], levels: [.25, .72, 1.08, 1.1] },
      { side: -1, lanes: [2.05, 2.3, 1.82, .8], spans: [[4.9, 8.3], [9.8, 12.25], [14.05, 16.9], [18.65, 21.45]], levels: [.2, .65, 1.12, 1.12] },
      { side: 1, lanes: [2.2, 1.98, 2.05, .78], spans: [[4.7, 8.15], [9.45, 12], [13.75, 16.65], [18.35, 21.2]], levels: [.3, .78, 1.02, 1.16] },
      { side: -1, lanes: [2, 2.25, 1.9, .9], spans: [[5, 8.35], [9.9, 12.4], [14.2, 17.1], [18.8, 21.55]], levels: [.22, .7, 1.1, 1.08] },
    ][(seed >>> 8) % 4];
    const { side, lanes, spans, levels } = layout;
    pad(0, 4, { w: 7.4 });
    wall(12.3, { h: 4, w: 1.7, d: 17.2 });
    pad(...spans[0], { x: side * lanes[0], w: 2.15, y: levels[0] });
    pad(...spans[1], { x: side * lanes[1], w: 1.8, y: levels[1] });
    pad(...spans[2], { x: side * lanes[2], w: finalWidth, y: levels[2] });
    pad(...spans[3], { x: side * lanes[3], w: 2.5, y: levels[3] });
    pad(22.1, 25, { y: 1.1, w: 6.6 });
    finish(25, 1.1);
  },
  dropChute({ pad, wall, finish }, tier, seed = 0) {
    pad(0, 5);
    const side = (seed >>> 9) % 2 ? 1 : -1;
    const lower = -4.5 - tier * .65;
    pad(6.5, 13.2, { x: side * 1.3, w: 4.8, y: lower });
    wall(9, { x: side * -3.1, y: lower, h: -lower + 2.5, w: 1.15, d: 8 });
    wall(9, { x: side * 3.85, y: lower, h: -lower + 2.5, w: 1.1, d: 8 });
    pad(13.2, 18, { x: side * .35, y: lower });
    finish(18, lower);
  },
  ceilingHops({ pad, wall, finish }, tier) {
    // The roof clears a full jump; the broken deck, not head collision, supplies the timing challenge.
    const roof = 3.4 - .05 * tier;
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
  shutters({ pad, wall, finish }, tier, seed = 0) {
    const period = 3.8 - tier * .32;
    const clearRise = height => height / 2 + 1.9;
    const layouts = [
      { z: [5.7, 11.2, 16.5], x: [0, 0, 0], w: [7.4, 7.4, 7.4] },
      { z: [6.1, 11.5, 16.9], x: [-1.35, 1.35, -1.2], w: [4.7, 4.7, 4.7] },
      { z: [5.8, 11.4, 16.2], x: [1.25, -1.25, 1.15], w: [4.9, 4.9, 4.9] },
      { z: [6.4, 12.1, 17], x: [0, 0, 0], w: [7.4, 5.4, 7.4] },
    ][(seed >>> 7) % 4];
    pad(0, 4.2, { w: 7.2 });
    pad(4.2, 8.9, { w: 6.4 });
    pad(8.9, 14.4, { w: 5.8, x: -.15 });
    pad(14.4, 19.5, { w: 6.6 });
    for (const x of [-3.45, 3.45]) wall(10.1, { x, h: 3.4, w: .45, d: 17.8 });
    const heights = [2.7, 2.45, 2.7];
    const phases = [0, .29, .61];
    const periods = [period, period + .55, period + .9];
    for (let index = 0; index < layouts.z.length; index++) {
      const height = heights[index];
      wall(layouts.z[index], { x: layouts.x[index], w: layouts.w[index], h: height, tone: AMBER,
        motion: { kind: "slide", dy: clearRise(height), period: periods[index], phase: phases[index] } });
    }
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
  sweeper({ pad, hazard, finish }, tier, seed = 0) {
    const layout = [
      { decks: [.25, -.2], hazards: [0, 0], z: [7.8, 14.5], radius: [3.15, 3.05] },
      { decks: [-.35, .4], hazards: [-.35, .35], z: [8.5, 14.7], radius: [3.05, 3.1] },
      { decks: [.45, -.45], hazards: [.45, -.45], z: [7.4, 15.2], radius: [3, 3.1] },
      { decks: [-.1, .25], hazards: [-.55, .4], z: [8.2, 13.9], radius: [3.1, 3] },
    ][(seed >>> 8) % 4];
    pad(0, 5.2, { w: 7.3 });
    pad(5.2, 10.4, { w: 6.1, x: layout.decks[0] });
    pad(10.4, 16.2, { w: 5.8, x: layout.decks[1] });
    pad(16.2, 21.8, { w: 7.3 });
    hazard("rotor", layout.z[0], { x: layout.hazards[0], radius: layout.radius[0], height: .61, period: 4.7 - tier * .65 });
    hazard("rotor", layout.z[1], { x: layout.hazards[1], radius: layout.radius[1], height: .61, period: 4.7 - tier * .65, phase: .31 });
    finish(21.8);
  },
  slidingSteps({ pad, finish }, tier, seed = 0) {
    const period = 4.2 - tier * .27;
    const lanes = [
      [-1.35, 1.15, -.9], [1.3, -1.1, .8],
      [-.9, -1.2, 1.3], [.9, 1.2, -1.3],
    ][(seed >>> 7) % 4];
    pad(0, 4.2, { w: 7.3 });
    pad(5.1, 8.15, { w: 2.9, x: lanes[0], y: .18, motion: { kind: "slide", dx: 2.35, period } });
    pad(9.65, 12.5, { w: 3.2, x: lanes[1], y: .52, motion: { kind: "slide", dx: -2.15, period: period + .35, phase: .19 } });
    pad(14, 16.9, { w: 3.1, x: lanes[2], y: .34, motion: { kind: "slide", dx: 1.9, period: period + .7, phase: .47 } });
    pad(18.1, 21.5, { w: 7.3 });
    finish(21.5);
  },
  callFerry({ pad, node, finish }, tier, seed = 0) {
    const layout = [
      { lane: -.65, entry: 4, board: [4.4, 8], landing: 17.2, exit: 22.4, width: 3.8, period: 8 },
      { lane: .7, entry: 4.3, board: [4.7, 8.5], landing: 17.6, exit: 22.8, width: 4.1, period: 7.5 },
      { lane: -.25, entry: 4.1, board: [4.5, 7.9], landing: 17.1, exit: 22.2, width: 3.6, period: 8.4 },
      { lane: .35, entry: 4.5, board: [4.9, 8.7], landing: 17.8, exit: 23, width: 4.2, period: 7.8 },
      { lane: .9, entry: 4.2, board: [4.6, 8.1], landing: 17.4, exit: 22.6, width: 3.9, period: 8.2 },
      { lane: -.8, entry: 4.4, board: [4.8, 8.6], landing: 17.7, exit: 22.9, width: 4.25, period: 7.6 },
      { lane: .1, entry: 4, board: [4.4, 7.8], landing: 17, exit: 22.3, width: 3.7, period: 8.5 },
      { lane: -.4, entry: 4.3, board: [4.7, 8.3], landing: 17.5, exit: 22.7, width: 4.05, period: 7.9 },
    ][(seed >>> 7) % 8];
    pad(0, layout.entry, { w: 7.4 });
    node("switch", layout.lane, layout.entry - 1.2, { id: "ferry", hold: 11 - .35 * tier });
    pad(layout.board[0], layout.board[1], { x: layout.lane, w: layout.width, tone: CYAN,
      motion: { kind: "slide", trigger: "ferry", dz: layout.landing - layout.board[1], period: layout.period } });
    pad(layout.landing, layout.exit, { x: layout.lane, w: 6.4 });
    finish(layout.exit);
  },
  counterLift({ pad, wall, finish }, tier, seed = 0) {
    const high = 3.8 + tier * .45;
    const lane = [-.65, .65, -.35, .35][(seed >>> 8) % 4];
    pad(0, 5);
    pad(5, 9.6, { x: lane, w: 4.4, tone: AMBER, motion: { kind: "weight", dy: high, speed: 1.6 } });
    wall(7.25, { x: lane + 3.1, w: .44, h: high + 2.5, d: 4.7 });
    pad(9.6, 15.5, { y: high });
    finish(15.5, high);
  },
  boardingRamp({ pad, finish }, tier, seed = 0) {
    const high = 2 + tier * .35;
    const layouts = [
      { lane: -.45, from: 4, to: 8, travel: 10, landing: 18, exit: 24, width: 3.7 },
      { lane: .55, from: 4.4, to: 8.2, travel: 9.2, landing: 17.7, exit: 24.1, width: 4.1 },
      { lane: -.75, from: 4.2, to: 7.8, travel: 11, landing: 19.2, exit: 25, width: 3.6 },
      { lane: .2, from: 4.6, to: 8.4, travel: 10.3, landing: 18.9, exit: 24.8, width: 4.3 },
      { lane: .7, from: 4, to: 7.6, travel: 9.6, landing: 17.4, exit: 23.7, width: 3.8 },
      { lane: -.25, from: 4.5, to: 8.5, travel: 10.8, landing: 19, exit: 25, width: 4.2 },
      { lane: -.6, from: 4.1, to: 7.9, travel: 9.4, landing: 17.6, exit: 24, width: 3.55 },
      { lane: .35, from: 4.3, to: 8.1, travel: 10.6, landing: 18.6, exit: 24.6, width: 4.15 },
    ][(seed >>> 7) % 8];
    pad(0, 4);
    pad(layouts.from, layouts.to, { x: layouts.lane, w: layouts.width, tone: CYAN, motion: { kind: "ride", dy: high, dz: layouts.travel, period: 4.3 } });
    pad(layouts.landing, layouts.exit, { x: layouts.lane, y: high });
    finish(layouts.exit, high);
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
  stepEscalator({ pad, finish }, tier, seed = 0) {
    pad(0, 4);
    const rise = .52 + tier * .12;
    const lanes = [
      [-1.35, .9, -1.05, .6],
      [1.3, -.8, 1.1, -.55],
      [-.9, -1.3, .7, 1.35],
      [.9, 1.3, -.7, -1.35],
    ][(seed >>> 6) % 4];
    pad(4.9, 7.2, { x: lanes[0], w: 3.45, y: .48, motion: { kind: "slide", dy: rise, period: 3.2, phase: 0 } });
    pad(7.95, 10.15, { x: lanes[1], w: 3.15, y: 1.04, motion: { kind: "slide", dy: rise, period: 3.55, phase: .18 } });
    pad(10.95, 13.25, { x: lanes[2], w: 3.4, y: 1.63, motion: { kind: "slide", dy: rise, period: 3.85, phase: .37 } });
    pad(14.1, 16.65, { x: lanes[3], w: 3.7, y: 2.18, motion: { kind: "slide", dy: rise, period: 4.1, phase: .56 } });
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
  wallSpring({ pad, wall, finish }, tier, seed = 0) {
    // Wall jump over a gap. The far platform is higher than a plain jump reaches, so you have
    // to kick off the wall in mid-air (any wall works; this one is just placed for the job).
    const high = 1.5 + tier * .1;
    const layout = [
      { side: 1, wallX: 2.9, wallZ: 5.6, wallDepth: 5.4, landingX: 0, start: 9.4, end: 16 },
      { side: -1, wallX: 2.7, wallZ: 5.8, wallDepth: 5.7, landingX: .55, start: 9.6, end: 16.2 },
      { side: 1, wallX: 3.1, wallZ: 5.35, wallDepth: 5.5, landingX: -.45, start: 9.5, end: 16.1 },
      { side: -1, wallX: 2.85, wallZ: 5.95, wallDepth: 5.4, landingX: -.65, start: 9.2, end: 15.8 },
    ][(seed >>> 8) % 4];
    pad(0, 6);
    wall(layout.wallZ, { x: layout.side * layout.wallX, h: 4.2, w: .5, d: layout.wallDepth });
    pad(layout.start, layout.end, { x: layout.landingX, y: high, w: 7 });
    finish(layout.end, high);
  },
  catapult({ pad, field, finish }, tier) {
    const high = 2.1 + tier * .28;
    pad(0, 6.4);
    field("spring", 4.2, 6.3, { w: 6, lift: 10.7, zForce: -5, tone: VIOLET });
    pad(12.4, 19, { y: high });
    finish(19, high);
  },
  airRelay({ pad, node, finish }, tier, seed = 0) {
    const layout = [
      { lane: -1.1, launch: 7.4, landing: 13.2, exit: 18.7, radius: 2.1, lift: 8.2, push: -4.1 },
      { lane: .95, launch: 7.8, landing: 13.6, exit: 19.2, radius: 2.25, lift: 8.5, push: -4.3 },
      { lane: -.45, launch: 7.15, landing: 12.9, exit: 18.5, radius: 1.95, lift: 8.1, push: -4.0 },
      { lane: .35, launch: 8, landing: 13.8, exit: 19.4, radius: 2.3, lift: 8.6, push: -4.4 },
    ][(seed >>> 8) % 4];
    const height = .85 + tier * .25;
    pad(0, 5, { w: 7.4 });
    node("airKick", layout.lane, layout.launch, { y: .8, radius: layout.radius, lift: layout.lift, zForce: layout.push, tone: VIOLET });
    pad(layout.landing, layout.exit, { x: layout.lane, y: height, w: 5.8 });
    finish(layout.exit, height);
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
  forwardBelt({ pad, field, wall, finish }, tier, seed = 0) {
    const force = -3.3 - tier * .4;
    const layouts = [
      { entry: -.35, middle: .35, exit: 0, block: -1.45 },
      { entry: .35, middle: -.35, exit: 0, block: 1.45 },
      { entry: -.6, middle: .5, exit: .2, block: 1.65 },
      { entry: .6, middle: -.5, exit: -.2, block: -1.65 },
    ][(seed >>> 8) % 4];
    pad(0, 4.8, { w: 7.4 });
    pad(4.8, 9.4, { w: 6.2, x: layouts.entry });
    field("belt", 4.8, 15.6, { zForce: force, tone: CYAN });
    wall(10.2, { x: layouts.block, w: 2.4, h: .72, d: 1.35 });
    pad(9.4, 12.5, { w: 6.4, x: layouts.middle });
    pad(12.5, 16.7, { w: 7.1, x: layouts.exit });
    finish(16.7);
  },
  ladder({ pad, field, ladder, finish }, tier, seed = 0) {
    const height = 3.1 + .32 * tier;
    const layout = [
      { lane: -.36, entry: 5.5, field: [4.25, 7.3], rail: 6.55, deck: [6.65, 13] },
      { lane: .48, entry: 5.8, field: [4.65, 7.85], rail: 7.1, deck: [7.2, 13.7] },
      { lane: -.62, entry: 5.2, field: [3.9, 7.05], rail: 6.2, deck: [6.3, 12.65] },
      { lane: .28, entry: 5.9, field: [4.8, 8.15], rail: 7.35, deck: [7.45, 13.9] },
      { lane: .65, entry: 5.6, field: [4.35, 7.65], rail: 6.9, deck: [7, 13.45] },
      { lane: -.22, entry: 5.3, field: [4.05, 7.2], rail: 6.4, deck: [6.5, 12.9] },
      { lane: .12, entry: 5.75, field: [4.55, 7.95], rail: 7.15, deck: [7.25, 13.7] },
      { lane: -.55, entry: 5.45, field: [4.2, 7.55], rail: 6.8, deck: [6.9, 13.3] },
    ][(seed >>> 7) % 8];
    pad(0, layout.entry);
    field("ladder", layout.field[0], layout.field[1], { x: layout.lane, w: 2.5, maxY: height + .7, tone: CYAN, climb: 3.45 });
    ladder({ height, w: 1.38, z: layout.rail, x: layout.lane });
    pad(layout.deck[0], layout.deck[1], { x: layout.lane, y: height });
    finish(layout.deck[1], height);
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
  headwind({ pad, wall, field, finish }, tier, seed = 0) {
    const layout = [
      { lanes: [-.25, .4], blockers: [-1.8, 1.8], wind: -.15, span: [5.2, 10.3, 14.6, 21.4] },
      { lanes: [.35, -.45], blockers: [1.65, -1.65], wind: .35, span: [5.4, 10.7, 14.9, 21.8] },
      { lanes: [-.5, .2], blockers: [-1.45, 1.55], wind: .65, span: [5, 10.1, 14.4, 21.2] },
      { lanes: [.2, -.3], blockers: [1.5, -1.5], wind: -.55, span: [5.3, 10.5, 14.8, 21.6] },
    ][(seed >>> 8) % 4];
    const [, secondStart, thirdStart, exit] = layout.span;
    pad(0, 5.2, { w: 7.4 });
    pad(5.2, secondStart, { w: 6.8, x: layout.lanes[0] });
    field("wind", 4, thirdStart + 2.9, { x: layout.wind, zForce: 3.4 + tier * .41, tone: CYAN, volume: true });
    wall(8, { x: layout.blockers[0], h: 1.4, w: 2.8, d: 1.3 });
    pad(secondStart, thirdStart, { w: 6.3, x: layout.lanes[1] });
    wall(thirdStart - 1.6, { x: layout.blockers[1], h: 1.4, w: 2.8, d: 1.3 });
    pad(thirdStart, exit, { w: 7.4 });
    finish(exit);
  },
  gustGates({ pad, field, finish }, tier, seed = 0) {
    const width = 3.8 - .18 * tier;
    const layout = [
      { lanes: [-1.2, .75, 1.15], forces: [1, -1], phase: .34 },
      { lanes: [1.15, -.8, -1.05], forces: [-1, 1], phase: .12 },
      { lanes: [-.75, -1.15, .85], forces: [1, 1], phase: .58 },
      { lanes: [.9, 1.1, -.7], forces: [-1, -1], phase: .78 },
    ][(seed >>> 8) % 4];
    pad(0, 4.5, { w: 7.4 });
    pad(5.3, 8.2, { x: layout.lanes[0], w: width, y: .2 });
    field("gust", 5.3, 8.2, { x: layout.lanes[0], xForce: layout.forces[0] * (6.3 + .45 * tier), period: 3.4, w: 5.2, tone: CYAN, volume: true });
    pad(9.5, 12.4, { x: layout.lanes[1], w: width, y: .44 });
    field("gust", 9.5, 12.4, { x: layout.lanes[1], xForce: layout.forces[1] * (6.3 + .45 * tier), period: 3.4, phase: layout.phase, w: 5.2, tone: CYAN, volume: true });
    pad(13.7, 16.8, { x: layout.lanes[2], w: width - .1, y: .24 });
    pad(18, 22.4, { w: 7.4 });
    finish(22.4);
  },
  thermal({ pad, field, finish }, tier, seed = 0) {
    const high = 3.3 + .35 * tier;
    const layout = [
      { x: -.55, first: 13.7, second: 17.1, middle: .65, exit: 20.8 },
      { x: .55, first: 13.2, second: 16.8, middle: -.6, exit: 20.6 },
      { x: -.15, first: 14.1, second: 17.4, middle: 1.05, exit: 21.2 },
      { x: .25, first: 13.5, second: 17, middle: -1.0, exit: 20.9 },
      { x: -.85, first: 13.9, second: 17.3, middle: .3, exit: 21.1 },
      { x: .8, first: 13.3, second: 16.9, middle: -.2, exit: 20.7 },
    ][(seed >>> 7) % 6];
    pad(0, 4.8, { w: 7.4 });
    field("updraft", 4.4, layout.first + .9, { x: layout.x, w: 5.3, maxY: high + 3.8, lift: 25, volume: true, tone: VIOLET });
    pad(layout.first, layout.first + 2.7, { x: layout.x, y: high, w: 5.6 });
    pad(layout.second, layout.exit, { x: layout.middle, y: high, w: 6.4 });
    finish(layout.exit, high);
  },
  coolant({ pad, field, finish }, tier, seed = 0) {
    const lane = [-.45, .45, -.2, .2][(seed >>> 8) % 4];
    pad(0, 4.5, { w: 7.4 });
    pad(4.5, 8.4, { x: -.35 + lane, y: -.7, w: 6.4 });
    field("water", 4.5, 16.3, { floor: -.7, speed: .59, gravity: .55, xForce: 1.65 + tier * .3, jump: .83, tone: CYAN });
    pad(8.4, 11.3, { x: .65 - lane, y: -.7, w: 5.2 });
    pad(11.3, 16.3, { x: .25 + lane, y: -.7, w: 6.2 });
    pad(16.3, 21.8, { w: 7.4 });
    finish(21.8);
  },
  chargeRail({ pad, node, finish }, tier, seed = 0) {
    const offset = tier * .12;
    const lanes = [
      [-1.2, 1.25, 1.35, -.75], [1.2, -1.25, -1.35, .75],
      [-.7, .4, .55, 1.1], [.7, -.4, -.55, -1.1],
    ][(seed >>> 8) % 4];
    pad(0, 4.8, { w: 7.4 });
    pad(6.1, 9.2, { x: lanes[0], w: 3.6, y: .22 });
    pad(10.5 + offset, 13.1 + offset, { x: lanes[2], w: 3.3, y: .48 });
    node("dashCharge", lanes[1], 14.15 + offset, { radius: 1.65, tone: GREEN });
    pad(15.1 + offset, 18.4 + offset, { x: lanes[3], w: 3.8, y: .24 });
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
  breach({ pad, wall, finish }, tier, seed = 0) {
    pad(0, 6.8, { w: 7.4 });
    pad(6.8, 12.4, { w: 6.8, x: -.15 });
    for (const x of [-3.55, 3.55]) wall(9.4, { x, w: .55, h: 4.7, d: 12.8 });
    const variation = (Math.abs(seed | 0) >>> 0) % 4;
    if (variation === 0) {
      const jumpBarrierHeight = .72 + .08 * tier;
      wall(9.4, { w: 7.4, h: jumpBarrierHeight, d: .6, tone: 0x69717a });
      if (tier > 1) wall(15.2, { w: 7.4, h: jumpBarrierHeight, d: .6, tone: 0x69717a });
    } else if (variation === 1) {
      const stagger = (seed >>> 5) % 2 ? 2.2 : 2.35;
      wall(9.4, { x: -stagger, w: 2.1, h: 2.9, tone: 0x69717a });
      if (tier > 1) wall(15.2, { x: stagger, w: 2.1, h: 2.9, tone: 0x69717a });
    } else if (variation === 2) {
      const passage = Math.max(2.45, 2.05 - .18 * tier);
      const blockWidth = (6.55 - passage) / 2;
      const blockOffset = passage / 2 + blockWidth / 2;
      wall(9.4, { x: -blockOffset, w: blockWidth, h: 3.8, d: .9, tone: 0x69717a });
      wall(15.2, { x: blockOffset, w: blockWidth, h: 3.8, d: .9, tone: 0x69717a });
    } else {
      const blockHeight = 2.35 + .12 * tier;
      wall(9.4, { x: -2.15, w: 3.1, h: blockHeight, d: 1.05, tone: 0x69717a });
      wall(13.1, { x: 2.05, w: 3.3, h: blockHeight, d: 1.05, tone: 0x69717a });
      wall(16.35, { x: -.2, w: 2.5, h: 1.05 + .08 * tier, d: .72, tone: 0x69717a });
    }
    pad(12.4, 15.8, { w: 6.2, x: .35 });
    pad(15.8, 19, { w: 7.4 });
    finish(19);
  },
  glassRun({ pad, finish }, tier, seed = 0) {
    const width = 3.5 - .14 * tier;
    const lanes = [
      [-1.15, 1.25, -.5, 1.1], [1.15, -1.25, .5, -1.1],
      [-.75, -1.35, .85, 1.25], [.75, 1.35, -.85, -1.25],
    ][(seed >>> 9) % 4];
    pad(0, 4.3, { w: 7.2 });
    pad(5.2, 7.65, { x: lanes[0], w: width, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(8.55, 11.05, { x: lanes[1], w: width - .12, y: .16, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(12.15, 14.5, { x: lanes[2], w: width + .08, y: .34, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
    pad(15.55, 18.25, { x: lanes[3], w: width - .08, y: .14, tone: CYAN, motion: { kind: "glass", hold: .12, restore: 3.3 } });
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
  balanceSpan({ pad, finish }, tier, seed = 0) {
    const width = 3.2 - tier * .08;
    const layout = [
      { lanes: [-.45, .55], widths: [0, -.15], levels: [0, -.08], sink: [1.1, 1.45], speed: [.95, 1.05], phase: .27, z: [5.25, 10.15] },
      { lanes: [.75, -.65], widths: [.2, -.05], levels: [.12, -.2], sink: [1.25, 1.3], speed: [1.15, .9], phase: .43, z: [5.5, 10.35] },
      { lanes: [-.9, .3], widths: [-.1, .25], levels: [-.12, .05], sink: [1.0, 1.55], speed: [.9, 1.2], phase: .12, z: [5.2, 10.5] },
      { lanes: [.35, 1.0], widths: [.15, -.1], levels: [.18, -.18], sink: [1.35, 1.2], speed: [1.25, .95], phase: .58, z: [5.45, 10.1] },
      { lanes: [-.7, .8], widths: [.3, -.2], levels: [.08, -.25], sink: [1.2, 1.4], speed: [1.05, 1.15], phase: .34, z: [5.15, 10.3] },
      { lanes: [.9, -.25], widths: [-.2, .3], levels: [-.2, .12], sink: [1.4, 1.05], speed: [1.2, .85], phase: .67, z: [5.6, 10.55] },
      { lanes: [-.2, -.85], widths: [.1, 0], levels: [.22, -.1], sink: [1.05, 1.5], speed: [.88, 1.22], phase: .21, z: [5.3, 10.2] },
      { lanes: [.55, .15], widths: [-.05, .2], levels: [-.16, .1], sink: [1.3, 1.25], speed: [1.18, .98], phase: .51, z: [5.4, 10.45] },
    ][(seed >>> 8) % 8];
    pad(0, 4.4, { w: 7.4 });
    pad(layout.z[0], layout.z[0] + 3.85, { x: layout.lanes[0], w: width + layout.widths[0], y: layout.levels[0], tone: AMBER, motion: { kind: "weight", dy: -layout.sink[0] - tier * .22, speed: layout.speed[0] + tier * .2 } });
    pad(layout.z[1], layout.z[1] + 3.95, { x: layout.lanes[1], w: width + layout.widths[1], y: layout.levels[1], tone: AMBER, motion: { kind: "weight", dy: -layout.sink[1] - tier * .18, speed: layout.speed[1] + tier * .2, phase: layout.phase } });
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
    node("target", 2.55, 10.7, { y: 2.35 + .29 * tier, id: "strike", tone: AMBER });
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
  routeSwitch({ pad, node, finish }, tier, seed = 0) {
    const lane = [-.24, .24, -.12, .12][(seed >>> 8) % 4];
    pad(0, 5.5, { w: 7.4 });
    node("switch", -2.5 + lane, 3.2, { id: "left", group: "route", tone: CYAN, toggle: true });
    node("switch", 2.5 + lane, 3.2, { id: "right", group: "route", tone: AMBER, toggle: true });
    pad(5.5, 9.1, { x: -2.45 + lane, w: 1.8 - .1 * tier, tone: CYAN, motion: { kind: "bridge", trigger: "left" } });
    pad(10, 13.5, { x: -2.35 + lane, w: 2.05 - .1 * tier, y: .3, tone: CYAN, motion: { kind: "bridge", trigger: "left" } });
    pad(5.5, 8.4, { x: 2.35 + lane, w: 2.55, tone: AMBER, motion: { kind: "bridge", trigger: "right" } });
    pad(9.2, 12.2, { x: 2.45 + lane, w: 2.35, y: .42, tone: AMBER, motion: { kind: "bridge", trigger: "right" } });
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
  scanner({ pad, hazard, finish }, tier, seed = 0) {
    const period = 3.3 - tier * .25;
    const layout = [
      { lanes: [-.45, .35], beams: [7.3, 15.1], phases: [0, .42], heights: [1.25, .56] },
      { lanes: [.45, -.3], beams: [7.7, 15.6], phases: [.18, .61], heights: [.72, 1.18] },
      { lanes: [-.25, .5], beams: [6.9, 14.8], phases: [.36, .08], heights: [1.05, .68] },
      { lanes: [.3, -.5], beams: [7.5, 15.3], phases: [.52, .24], heights: [.64, 1.28] },
      { lanes: [-.55, .15], beams: [7.1, 15.8], phases: [.7, .43], heights: [1.18, .74] },
      { lanes: [.2, -.15], beams: [7.9, 14.9], phases: [.27, .78], heights: [.82, 1.12] },
    ][(seed >>> 7) % 6];
    pad(0, 5.2, { w: 7.4 });
    pad(5.2, 9.6, { w: 6.7, x: layout.lanes[0] });
    hazard("beam", layout.beams[0], { width: 7.3, height: layout.heights[0], period, phase: layout.phases[0], damage: 17 });
    pad(9.6, 12.9, { x: layout.lanes[0], w: 6.1, y: .18 });
    pad(12.9, 17.1, { x: layout.lanes[1], w: 6.3 });
    hazard("beam", layout.beams[1], { width: 7.3, height: layout.heights[1], period: period + .4, phase: layout.phases[1], damage: 17 });
    pad(17.1, 24.2, { w: 7.4 });
    finish(24.2);
  },
  crossfireLane({ pad, wall, hazard, finish }, tier, seed = 0) {
    const period = 2.35 - tier * .25;
    const layout = [
      { walls: [-1.65, 1.55, -.45], shots: [3.55, -3.55, 3.4], z: [8, 14.5, 21.3], phase: [0, .31, .63] },
      { walls: [1.55, -1.65, .45], shots: [-3.55, 3.55, -3.4], z: [8.5, 14.9, 20.9], phase: [.18, .47, .72] },
      { walls: [-1.25, 1.85, -.7], shots: [3.3, -3.35, 3.5], z: [7.7, 14.2, 21.5], phase: [.38, .08, .57] },
      { walls: [1.85, -1.25, .7], shots: [-3.3, 3.35, -3.5], z: [8.3, 15, 20.7], phase: [.56, .25, .82] },
    ][(seed >>> 8) % 4];
    pad(0, 5.4, { w: 7.4 });
    wall(6.5, { x: layout.walls[0], w: 1.55, h: 1.34, d: 1.15 });
    hazard("dart", layout.z[0], { x: layout.shots[0], period, phase: layout.phase[0], damage: 14 });
    pad(5.4, 11.7, { w: 7.4 });
    wall(12.9, { x: layout.walls[1], w: 1.9, h: 1.55, d: 1.25 });
    hazard("dart", layout.z[1], { x: layout.shots[1], period: period + .25, phase: layout.phase[1], damage: 14 });
    pad(11.7, 18.5, { w: 6.8, x: -.25 });
    wall(19.8, { x: layout.walls[2], w: 1.5, h: 1.2, d: 1.05 });
    hazard("dart", layout.z[2], { x: layout.shots[2], period: period + .55, phase: layout.phase[2], damage: 14 });
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
  slopeRise({ pad, ramp, finish }, tier, seed = 0) {
    const high = 1.6 + tier * .4, w = 5.4 - tier * .3;
    const direction = (seed >>> 8) % 2 ? 1 : -1;
    pad(0, 4.5, { w: 7.4 });
    ramp(4.5, 11.4, { x: direction * .35, y0: 0, y1: high, w });
    pad(11.4, 14.8, { x: direction * 1.05, y: high, w: w + .8 });
    ramp(14.8, 21.6, { x: direction * -.55, y0: high, y1: .12, w: w - .35 });
    pad(21.6, 26.2, { y: .12, w: 7.4 });
    finish(26.2, .12);
  },
  switchbackRamps({ pad, ramp, finish }, tier, seed = 0) {
    const mid = 1.7 + tier * .2, top = mid * 2;
    const width = 3.8 - tier * .2;
    const layout = [
      { direction: -1, entry: 4.6, firstEnd: 10.4, middleEnd: 13.6, topStart: 20.3, exit: 24.8, firstX: 2.15, middleX: .6, secondX: 2.05, topX: .5 },
      { direction: 1, entry: 4.7, firstEnd: 10.7, middleEnd: 13.9, topStart: 20.6, exit: 25.1, firstX: 1.9, middleX: -.25, secondX: 1.85, topX: -.35 },
      { direction: -1, entry: 4.5, firstEnd: 10.1, middleEnd: 13.4, topStart: 19.9, exit: 24.4, firstX: 2.25, middleX: .2, secondX: 2.2, topX: .7 },
      { direction: 1, entry: 4.8, firstEnd: 10.8, middleEnd: 14, topStart: 20.8, exit: 25.3, firstX: 1.95, middleX: -.6, secondX: 1.8, topX: -.55 },
    ][(seed >>> 8) % 4];
    pad(0, layout.entry, { w: 7.4 });
    ramp(layout.entry, layout.firstEnd, { x: layout.direction * -layout.firstX, y0: 0, y1: mid, w: width, tone: AMBER });
    pad(layout.firstEnd, layout.middleEnd, { x: layout.direction * -layout.middleX, y: mid, w: 6.8 });
    ramp(layout.middleEnd, layout.topStart, { x: layout.direction * layout.secondX, y0: mid, y1: top, w: width - .25, tone: AMBER });
    pad(layout.topStart, layout.exit, { x: layout.direction * layout.topX, y: top, w: 6.9 });
    finish(layout.exit, top);
  },
  pistonSteps({ pad, finish }, tier, seed = 0) {
    const dy = 1 + tier * .05;
    const lanes = [
      [-1.45, .9, -1.1], [-1.0, 1.25, -.65],
      [1.35, -.9, 1.1], [.8, -1.3, .75],
    ][(seed >>> 8) % 4];
    pad(0, 4.4, { w: 7.4 });
    pad(5.2, 8.15, { x: lanes[0], w: 3.6, tone: CYAN, motion: { kind: "slide", dy, period: 3.8 - tier * .2, phase: 0 } });
    pad(9.15, 12.05, { x: lanes[1], w: 3.3, y: .28, tone: CYAN, motion: { kind: "slide", dy: dy * .8, period: 4.1 - tier * .16, phase: .29 } });
    pad(13.05, 16.35, { x: lanes[2], w: 3.8, y: -.12, tone: CYAN, motion: { kind: "slide", dy: dy * 1.12, period: 4.45 - tier * .17, phase: .57 } });
    pad(17.5, 21.5, { w: 7.4 });
    finish(21.5);
  },
  stepStones({ pad, finish }, tier, seed = 0) {
    const width = 2.35 - tier * .12;
    const layout = [
      { lanes: [-1.15, 1.05, 2.2, .15, -1.9, -.25], heights: [.22, .56, .32, .68, .38, .16], start: [5.3, 8.35, 11.6, 15.1, 18.4, 21.8], end: [7.6, 10.8, 14.25, 17.45, 20.85, 24.6] },
      { lanes: [1.2, -.95, -2.1, -.1, 1.85, .35], heights: [.48, .2, .64, .28, .78, .4], start: [5.15, 8.05, 11.2, 14.5, 17.75, 21.1], end: [7.55, 10.35, 13.7, 17, 20.4, 24] },
      { lanes: [-1.5, -.1, 1.65, 2, .35, -1.7], heights: [.16, .42, .72, .3, .56, .24], start: [5.45, 8.8, 12, 15.35, 18.65, 22], end: [7.9, 11.15, 14.55, 17.9, 21.25, 24.8] },
      { lanes: [1.45, .05, -1.7, -2, -.25, 1.75], heights: [.56, .26, .7, .34, .62, .2], start: [5.2, 8.55, 11.75, 15, 18.3, 21.65], end: [7.75, 10.95, 14.3, 17.55, 20.85, 24.45] },
      { lanes: [-2, -.65, 1.1, 2.25, .8, -1.25], heights: [.3, .72, .24, .58, .18, .5], start: [5.35, 8.45, 11.7, 14.95, 18.2, 21.55], end: [7.65, 10.85, 14.1, 17.3, 20.65, 24.4] },
      { lanes: [1.8, .6, -1.05, -2.15, -.55, 1.35], heights: [.66, .34, .14, .76, .46, .22], start: [5.1, 8.25, 11.55, 14.85, 18.1, 21.45], end: [7.5, 10.75, 14.05, 17.35, 20.7, 24.5] },
      { lanes: [-.45, -1.85, .4, 2.05, 1.3, -.9], heights: [.24, .6, .4, .2, .74, .36], start: [5.4, 8.65, 11.95, 15.25, 18.55, 21.9], end: [7.85, 11.05, 14.35, 17.65, 21, 24.75] },
      { lanes: [.55, 1.95, -.35, -2.25, -.7, 1.15], heights: [.52, .18, .62, .38, .22, .7], start: [5.25, 8.5, 11.8, 15.05, 18.35, 21.7], end: [7.7, 10.9, 14.2, 17.45, 20.8, 24.55] },
    ][(seed >>> 10) % 8];
    pad(0, 4.2, { w: 7.4 });
    for (let index = 0; index < layout.lanes.length; index++) {
      const widthVariation = index % 2 ? .12 : -.08;
      pad(layout.start[index], layout.end[index], { x: layout.lanes[index], w: width + widthVariation, y: layout.heights[index] });
    }
    pad(25.5, 29.2, { w: 7.4 });
    finish(29.2);
  },
  wallShaft({ pad, wall, finish }, tier, seed = 0) {
    const high = 2.3 + tier * .12;
    const layout = (seed >>> 6) % 3;
    pad(0, 4);
    if (layout === 0) {
      pad(4, 12, { w: 2.8 });
      for (const x of [-1.65, 1.65]) wall(8, { x, h: high + 1.4, w: .5, d: 8 });
    } else if (layout === 1) {
      pad(4, 8.2, { x: -.45, w: 3.1 });
      pad(8.2, 12, { x: .35, w: 3.2 });
      wall(7.1, { x: -2.05, h: high + 1.5, w: .55, d: 6.6 });
      wall(10.3, { x: 2.05, h: high + 1.5, w: .55, d: 5.2 });
    } else {
      pad(4, 7.6, { x: .45, w: 3.25 });
      pad(7.6, 12, { x: -.3, w: 3.1 });
      wall(6.8, { x: 2.05, h: high + 1.55, w: .55, d: 5.6 });
      wall(10.5, { x: -2.05, h: high + 1.55, w: .55, d: 5.4 });
    }
    pad(12, 17, { y: high, w: 6 });
    finish(17, high);
  },
};

export const gauntletObstacleIds = Object.freeze(Object.keys(obstacles));

function expandWalkableGaps(pieces, length) {
  const intervals = pieces
    .filter(piece => (piece.type === "deck" || piece.type === "ramp") && Number.isFinite(piece.d) && piece.d > 0)
    .map(piece => piece.type === "ramp"
      ? [Math.max(0, Math.min(piece.from, piece.to)), Math.min(length, Math.max(piece.from, piece.to))]
      : [Math.max(0, piece.z - piece.d / 2), Math.min(length, piece.z + piece.d / 2)])
    .filter(([start, end]) => end > start)
    .sort((first, second) => first[0] - second[0]);
  const merged = [];
  for (const interval of intervals) {
    const previous = merged[merged.length - 1];
    if (previous && interval[0] <= previous[1] + 1e-6) previous[1] = Math.max(previous[1], interval[1]);
    else merged.push(interval.slice());
  }
  const gaps = [];
  if (merged.length && merged[0][0] > 1e-6) gaps.push([0, merged[0][0]]);
  for (let index = 1; index < merged.length; index++) {
    if (merged[index][0] > merged[index - 1][1] + 1e-6) {
      gaps.push([merged[index - 1][1], merged[index][0]]);
    }
  }
  if (merged.length && length > merged[merged.length - 1][1] + 1e-6) {
    gaps.push([merged[merged.length - 1][1], length]);
  }
  const mapDistance = distance => {
    let added = 0;
    for (const [start, end] of gaps) {
      if (distance <= start) return distance + added;
      if (distance < end) return start + added + (distance - start) * GAUNTLET_GAP_SCALE;
      added += (end - start) * (GAUNTLET_GAP_SCALE - 1);
    }
    return distance + added;
  };

  for (const piece of pieces) {
    const originalZ = piece.z;
    const originalMotionDz = piece.motion?.dz;
    if (piece.type === "ramp") {
      piece.from = mapDistance(piece.from);
      piece.to = mapDistance(piece.to);
      piece.d = Math.abs(piece.to - piece.from);
      piece.z = (piece.from + piece.to) / 2;
    } else if ((piece.type === "deck" || piece.type === "field")
        && Number.isFinite(piece.z) && Number.isFinite(piece.d) && piece.d > 0) {
      const start = mapDistance(piece.z - piece.d / 2);
      const end = mapDistance(piece.z + piece.d / 2);
      piece.z = (start + end) / 2;
      piece.d = end - start;
    } else if (Number.isFinite(piece.z)) {
      piece.z = mapDistance(piece.z);
    }
    if (piece.to && typeof piece.to === "object" && Number.isFinite(piece.to.z)) {
      piece.to.z = mapDistance(piece.to.z);
    }
    if (Number.isFinite(originalMotionDz) && Number.isFinite(originalZ)) {
      piece.motion.dz = mapDistance(originalZ + originalMotionDz) - mapDistance(originalZ);
    }
  }
  return mapDistance(length);
}

export function makeGauntletObstacle(id, tier, mirror, seed) {
  const pieces = [];
  let length, exitHeight;
  const variantSeed = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
  const laneAmplitude = .28 + (variantSeed % 997) / 997 * .38;
  const lanePhase = ((variantSeed >>> 10) % 6283) / 1000;
  const laneWarp = distance => {
    const u = Math.max(0, Math.min(1, distance / Math.max(1, length || 1)));
    return laneAmplitude * Math.sin(Math.PI * u) * Math.sin(2 * Math.PI * u + lanePhase);
  };
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
    ladder({ height, w, z, x = 0, tone = 0x4b565a }) {
      pieces.push({ type: "ladder", x, y: 0, z, w, height, tone });
    },
    finish(end, height = 0) {
      length = end;
      exitHeight = height;
    },
  };
  const build = obstacles[id];
  if (!build) throw new Error("Unknown Gauntlet obstacle " + id);
  build(builder, tier, seed);
  length = expandWalkableGaps(pieces, length);
  for (const piece of pieces) {
    piece.x *= mirror;
    if (piece.xForce) piece.xForce *= mirror;
    if (piece.to && typeof piece.to === "object") piece.to.x *= mirror;   // ramps use `to` for a distance
    if (piece.motion?.dx) piece.motion.dx *= mirror;
    piece.x += laneWarp(piece.z || 0);
    if (piece.to && typeof piece.to === "object" && Number.isFinite(piece.to.z)) {
      piece.to.x += laneWarp(piece.to.z);
    }
  }
  return { pieces, length, exitHeight };
}
