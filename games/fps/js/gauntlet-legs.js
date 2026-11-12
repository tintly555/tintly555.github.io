/*
 * Course layout. Authored segments stay recognizable; short invented legs add parkour links
 * between them and lay each segment onto the path.
 *
 * A "leg" is a stretch of invented walkway between two authored segments: roads that bend by any
 * angle, climb and descend, spiral up or down, with the level's own obstacles (pits, beams,
 * tunnels, stepping pads, stairs) strung along them. Legs always start and finish heading
 * straight down -Z, so the set pieces that need an axis-aligned frame (arenas with doors, the
 * moving-platform mechanics) can sit between them wherever the road has wandered to.
 *
 * Everything here is deterministic for a given level, so a course is the same every visit.
 */
import { trace, DEG, STATION } from "./gauntlet-path.js?v=2";

export const GAUNTLET_W = 12;
export const GAP_JUMP = 4.2;
export const GAP_DASH = 7.0;
/** Segments that are built axis-aligned at the current position, heading straight down -Z. */
export const FIXED = new Set(["room", "mechanic", "lift", "shuttle"]);
/** Keep each course focused on its authored challenges instead of long travel stretches. */
export const COURSE_STRETCH = 1.85;
/** Inner edge of a bend never gets tighter than this many metres of radius. */
const EDGE_RADIUS = 4;
const MAX_SLOPE = 0.17;
const ALTITUDE = [-60, 76];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = v => Math.round(v * 100) / 100;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Largest turn (radians) a stretch of walkway can make without its inner edge folding over. */
export const maxTurn = (len, width) => len / (width / 2 + EDGE_RADIUS);

/**
 * Lay one free segment onto the path from `pen`. Returns the decks and pits it is made of
 * (each with the trace they follow) and where the pen ends up.
 *   parts: [{ kind: "deck" | "beam" | "tunnel" | "pit" | "tread", samples, w, gap? }]
 */
export function layoutSeg(seg, pen) {
  const parts = [];
  let p = { ...pen };
  const deck = (kind, len, w, turn = 0, rise = 0) => {
    const turnOk = clamp(turn, -maxTurn(len, w), maxTurn(len, w));
    const t = trace(p, { len, turn: turnOk, rise });
    parts.push({ kind, samples: t.samples, w, turn: turnOk, rise });
    p = t.end;
  };
  const pit = (len) => {
    const t = trace(p, { len, turn: 0, rise: 0 });
    parts.push({ kind: "pit", samples: t.samples, w: GAUNTLET_W, gap: len });
    p = t.end;
  };
  switch (seg.t) {
    case "run": deck("deck", seg.len, seg.w || GAUNTLET_W, (seg.turn || 0) * DEG, seg.rise || 0); break;
    case "beam": deck("beam", seg.len, seg.w || 2.4, (seg.turn || 0) * DEG, seg.rise || 0); break;
    case "crawl": {
      // Open apron at each end so a jump into the tunnel has somewhere to land and duck.
      const apron = 2.6, w = seg.w || GAUNTLET_W;
      deck("deck", apron, w);
      deck("tunnel", seg.len, w, (seg.turn || 0) * DEG);
      deck("deck", apron, w);
      break;
    }
    case "jump": pit(seg.gap || GAP_JUMP); break;
    case "dash": pit(seg.gap || GAP_DASH); break;
    case "steps":
      for (let i = 0; i < seg.n; i++) {
        p = { ...p, y: p.y + seg.rise };
        deck("tread", seg.len, seg.w || 6);
      }
      break;
    case "pads": {
      const each = ((seg.turn || 0) * DEG) / seg.n;
      for (let i = 0; i < seg.n; i++) {
        deck("deck", seg.len, seg.w || 4, each);
        if (i < seg.n - 1) pit(seg.gap || GAP_JUMP);
      }
      break;
    }
    default: break;
  }
  return { parts, end: p };
}

// ---------------------------------------------------------------------------------------------
// Inventing a leg
// ---------------------------------------------------------------------------------------------

function candidate(rng, req, startY, attempt) {
  const { target, vocab, level = 1 } = req;
  const u = (a, b) => a + (b - a) * rng();
  const sign = () => (rng() < 0.5 ? -1 : 1);
  const segs = [];
  let total = 0, turnSum = 0, y = startY, lastPlat = true, width = GAUNTLET_W;
  // Climbing and descending come in long, committed stretches rather than a jitter around zero.
  let climb = rng() < .5 ? 1 : -1;

  const settle = (rise) => {
    let r = rise;
    if (y + r > ALTITUDE[1] || y + r < ALTITUDE[0]) r = -r;
    if (y + r > ALTITUDE[1] || y + r < ALTITUDE[0]) r = 0;
    y += r;
    return r;
  };
  /** A walkway; turn in degrees, rise in metres. Width eases toward `w` so decks do not lurch. */
  const road = (len, w, turn = 0, rise = 0) => {
    const next = Math.round(clamp(w, width - 1.5, width + 1.5) * 2) / 2;
    const lim = maxTurn(len, Math.max(next, width)) / DEG;
    const t = round2(clamp(turn, -lim, lim));
    const r = round2(clamp(settle(rise), -MAX_SLOPE * len, MAX_SLOPE * len));
    segs.push({ t: "run", len: round2(len), w: next, turn: t, rise: r });
    total += len; turnSum += t; lastPlat = true; width = next;
  };
  const obstacle = () => {
    const kinds = [];
    if (vocab.has("beam")) kinds.push("beam", "beam");
    if (vocab.has("crawl")) kinds.push("crawl");
    if (vocab.has("jump")) kinds.push("jump", "jump");
    if (vocab.has("dash")) kinds.push("dash");
    if (vocab.has("pads")) kinds.push("pads");
    if (vocab.has("steps")) kinds.push("steps");
    if (level > 8) kinds.push("beam", "jump");
    if (level > 3) kinds.push("jump");
    if (!kinds.length || !lastPlat) return;
    const kind = kinds[Math.floor(rng() * kinds.length)];
    if (kind === "beam") {
      const len = u(8, 17), w = round2(u(1.9, 2.8)), lim = maxTurn(len, w) / DEG;
      segs.push({ t: "beam", len: round2(len), w, turn: round2(rng() < .5 ? sign() * Math.min(lim, u(6, 38)) : 0), rise: round2(settle(climb * u(0, .08) * len)) });
      turnSum += segs[segs.length - 1].turn;
      total += len; lastPlat = true; width = GAUNTLET_W;
      road(u(6, 9), GAUNTLET_W, rng() < .55 ? sign() * u(16, 38) : 0, climb * u(0, .05) * 10);
    } else if (kind === "crawl") {
      const len = u(7, 10), lim = maxTurn(len, 10) / DEG, turn = round2(rng() < .4 ? sign() * Math.min(lim, u(5, 26)) : 0);
      segs.push({ t: "crawl", len: round2(len), w: 10, turn });
      turnSum += turn; total += len + 5.2; lastPlat = true; width = 10;
      road(u(6, 9), GAUNTLET_W, rng() < .45 ? sign() * u(16, 36) : 0);
    } else if (kind === "jump" || kind === "dash") {
      const gap = kind === "jump" ? round2(u(3.3, GAP_JUMP)) : round2(u(6.4, GAP_DASH));
      segs.push({ t: kind, gap });
      total += gap; lastPlat = false;
      road(u(6, 10), u(8, GAUNTLET_W), rng() < .5 ? sign() * u(18, 42) : 0, climb * u(0, .045) * 10);
    } else if (kind === "pads") {
      const n = 3 + Math.floor(rng() * 2), len = round2(u(3.2, 3.8)), w = round2(u(3.6, 4.6));
      const span = n * len + (n - 1) * GAP_JUMP, lim = maxTurn(span, w) / DEG;
      const turn = round2(sign() * Math.min(lim, u(0, 42)));
      segs.push({ t: "pads", n, len, gap: GAP_JUMP, w, turn });
      turnSum += turn; total += span; lastPlat = true; width = GAUNTLET_W;
      road(u(6, 9), GAUNTLET_W, rng() < .5 ? sign() * u(18, 40) : 0);
    } else if (kind === "steps") {
      const n = 3 + Math.floor(rng() * 3), rise = settle(climb * 0.85 * n);
      if (rise !== 0) { segs.push({ t: "steps", n, rise: rise / n, len: 3.5, w: 7 }); total += n * 3.5; lastPlat = true; width = 8; }
      road(u(6, 9), GAUNTLET_W, rng() < .45 ? sign() * u(16, 34) : 0);
    }
  };

  road(u(6, 9), GAUNTLET_W);
  const traverse = () => {
    const len = u(6, 10), turn = rng() < .72 ? sign() * u(20, 58) : 0;
    road(len, u(7.5, 11), turn, climb * u(.025, .11) * len);
    if (rng() < .3) climb = -climb;
  };
  // Chain short, readable platforming moves with only enough deck to line up the next jump.
  // The authored vocabulary preserves gradual introductions across the 200-course campaign.
  let guard = 0;
  while (guard++ < 16 && total < target - 20) {
    const before = total;
    if (guard === 1 || rng() < .8) obstacle();
    else traverse();
    if (total <= before) traverse();
    if (total < target - 32 && rng() < .35) traverse();
  }
  // Heading finishes straight again, always on a plain deck.
  const w2 = 10;
  const need = -turnSum;
  let len = clamp(Math.abs(need * DEG) * (w2 / 2 + EDGE_RADIUS) + 6, 12, 120);
  if (Math.abs(need) * DEG > maxTurn(len, w2) + 1e-6) return null;
  const easeRise = clamp(-y * 0.45, -MAX_SLOPE * len, MAX_SLOPE * len);
  road(len, w2, need, easeRise);
  road(u(8, 12), GAUNTLET_W);
  return segs;
}

/**
 * Invent a leg of about `req.target` metres that starts at `pen` and ends heading -Z again
 * without touching anything already built. `fp` is a Footprints, `req.vocab` a Set of obstacle
 * kinds the level uses.
 */
export function composeLeg(rng, req, pen, fp) {
  const why = composeLeg.why = { none: 0, hit: 0, heading: 0, altitude: 0, after: 0 };
  for (let attempt = 0; attempt < 90; attempt++) {
    const segs = candidate(rng, req, pen.y, attempt);
    if (!segs) { why.none++; continue; }
    // Lay it out piece by piece against everything built so far *and* against itself, so a long
    // winding leg can never cross its own earlier bends.
    const trial = fp.copy();
    let p = { ...pen };
    let ok = true;
    for (const seg of segs) {
      const lay = layoutSeg(seg, p);
      for (const part of lay.parts) {
        if (trial.conflicts(part.samples, part.w / 2 + 6)) { ok = false; break; }
        trial.addTrace(part.samples, part.w / 2 + 4, 1);
      }
      if (!ok) break;
      p = lay.end;
    }
    if (!ok) { why.hit++; continue; }
    if (Math.abs(p.th) > 0.002) { why.heading++; continue; }
    if (p.y < ALTITUDE[0] - 6 || p.y > ALTITUDE[1] + 6) { why.altitude++; continue; }
    if (req.after && afterConflict(req.after, p, trial)) { why.after++; continue; }
    composeLeg.lastAttempt = attempt;
    return segs;
  }
  // Nothing fit: a short plain road up out of the way of whatever is below.
  composeLeg.lastAttempt = 999;
  return [{ t: "run", len: 14, w: GAUNTLET_W }, { t: "run", len: Math.max(20, req.target * 0.4), w: 10, rise: 6 }, { t: "run", len: 12, w: GAUNTLET_W }];
}

/** Would the set piece that comes next (an arena and its door, a mechanic, the exit) hit the course? */
function afterConflict(next, p, fp) {
  const body = [], n = Math.max(1, Math.ceil(next.len / 3));
  for (let k = 0; k <= n; k++) body.push({ x: p.x, y: p.y, z: p.z - next.len * k / n, arc: p.arc + next.len * k / n });
  if (fp.conflicts(body, next.w / 2 + 6, { ignoreArc: 48 })) return true;
  if (next.door) {
    // The invisible door barrier reaches far to either side at every height.
    const half = next.w / 2 + 32, z = p.z - next.len + 0.8, gate = [];
    for (let dx = -half; dx <= half; dx += 9) if (Math.abs(dx) > next.w / 2 + 8) gate.push({ x: p.x + dx, y: p.y, z, arc: p.arc + next.len });
    if (gate.length && fp.conflicts(gate, 6, { ignoreArc: 48, anyY: true })) return true;
  }
  return false;
}

/** Obstacle kinds a hand-built course uses, so its legs speak the same language. */
export function vocabularyOf(segs) {
  const set = new Set();
  for (const s of segs) {
    if (["beam", "crawl", "jump", "dash", "pads", "steps"].includes(s.t)) set.add(s.t);
    if (s.t === "lift" || s.t === "shuttle") { set.add("jump"); }
  }
  return set;
}

const rough = s => {
  switch (s.t) {
    case "run": case "room": case "beam": case "crawl": return s.len;
    case "jump": return s.gap || GAP_JUMP;
    case "dash": return s.gap || GAP_DASH;
    case "steps": return s.n * s.len;
    case "pads": return s.n * s.len + (s.n - 1) * (s.gap || GAP_JUMP);
    case "lift": return 10;
    case "shuttle": return (s.gap || 11) + 5.5;
    default: return 26;
  }
};

/**
 * Add compact parkour legs between authored segments (which all stay, in order). Legs are
 * placeholders the builder resolves in order, because each one has to know what has been built.
 */
export function lengthenSegs(segs, { level, tier = 1, stretch = COURSE_STRETCH }) {
  const base = segs.reduce((sum, s) => sum + rough(s), 0) + 26;
  const extra = Math.max(62, base * (stretch - 1));
  const vocab = vocabularyOf(segs);
  // Spread short platforming links through the route so it does not become a long run.
  const slots = clamp(Math.round(extra / 100), 2, segs.length);
  const gapEvery = segs.length / slots;
  const legAfter = new Set();
  for (let k = 0; k < slots; k++) legAfter.add(Math.min(segs.length - 1, Math.floor((k + 1) * gapEvery - 1e-6)));
  const share = extra / legAfter.size;
  const out = [];
  segs.forEach((s, i) => {
    out.push(s);
    if (legAfter.has(i)) out.push({ t: "leg", target: Math.max(54, share), vocab, tier, level, seed: level * 7919 + i * 104729 + 13 });
  });
  return out;
}

export { STATION };
