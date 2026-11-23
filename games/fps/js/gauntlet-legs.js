/*
 * Course layout. Authored segment data is laid onto the course path without adding filler legs.
 *
 * Everything here is deterministic for a given level, so a course is the same every visit.
 */
import { trace, DEG } from "./gauntlet-path.js?v=3";

export const GAUNTLET_W = 8;
export const GAUNTLET_GAP_SCALE = 2;
export const GAP_JUMP = 4.2;
export const GAP_DASH = 7.0;
const MAX_WALK_GRADE = 0.18;
const MAX_STEP_RISE = 0.9;
/** Segments that are built axis-aligned at the current position, heading straight down -Z. */
export const FIXED = new Set(["room", "mechanic", "lift", "shuttle"]);
/** Inner edge of a bend never gets tighter than this many metres of radius. */
const EDGE_RADIUS = 4;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const positiveOr = (value, fallback, label) => {
  if (value == null) return fallback;
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`Invalid Gauntlet ${label}: ${value}`);
  return value;
};
const finiteOr = (value, fallback, label) => {
  if (value == null) return fallback;
  if (!Number.isFinite(value)) throw new RangeError(`Invalid Gauntlet ${label}: ${value}`);
  return value;
};
const scaledGap = (requested, maximum) => Math.min(
  positiveOr(requested, maximum, "gap") * GAUNTLET_GAP_SCALE,
  maximum * GAUNTLET_GAP_SCALE,
);

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
  const deck = (kind, len, w, turn = 0, rise = 0, offset = 0, shelf = 0) => {
    if (!Number.isFinite(len) || len <= 0) throw new RangeError(`Invalid Gauntlet segment length: ${len}`);
    if (!Number.isFinite(w) || w <= 0) throw new RangeError(`Invalid Gauntlet segment width: ${w}`);
    if (!Number.isFinite(turn) || !Number.isFinite(rise)) throw new RangeError("Invalid Gauntlet segment slope or turn");
    const turnOk = clamp(turn, -maxTurn(len, w), maxTurn(len, w));
    const riseOk = clamp(Number.isFinite(rise) ? rise : 0, -len * MAX_WALK_GRADE, len * MAX_WALK_GRADE);
    const t = trace(p, { len, turn: turnOk, rise: riseOk });
    const samples = offset || shelf ? t.samples.map(sample => ({
      ...sample,
      x: sample.x + Math.cos(sample.th) * offset,
      y: sample.y + shelf,
      z: sample.z + Math.sin(sample.th) * offset,
    })) : t.samples;
    parts.push({ kind, samples, w, turn: turnOk, rise: riseOk });
    p = t.end;
  };
  const pit = (len) => {
    if (!Number.isFinite(len) || len <= 0) throw new RangeError(`Invalid Gauntlet gap length: ${len}`);
    const t = trace(p, { len, turn: 0, rise: 0 });
    parts.push({ kind: "pit", samples: t.samples, w: GAUNTLET_W, gap: len });
    p = t.end;
  };
  switch (seg.t) {
    case "run": deck("deck", seg.len, positiveOr(seg.w, GAUNTLET_W, "width"), finiteOr(seg.turn, 0, "turn") * DEG, finiteOr(seg.rise, 0, "rise")); break;
    case "beam": deck("beam", seg.len, positiveOr(seg.w, 2.4, "width"), finiteOr(seg.turn, 0, "turn") * DEG, finiteOr(seg.rise, 0, "rise")); break;
    case "crawl": {
      // Open apron at each end so a jump into the tunnel has somewhere to land and duck.
      const apron = 2.6, w = positiveOr(seg.w, GAUNTLET_W, "width");
      deck("deck", apron, w);
      deck("tunnel", seg.len, w, finiteOr(seg.turn, 0, "turn") * DEG);
      deck("deck", apron, w);
      break;
    }
    case "route": {
      if (!Array.isArray(seg.legs) || seg.legs.length < 2 || seg.legs.length > 8) {
        throw new RangeError("Gauntlet route needs between two and eight authored legs");
      }
      const width = positiveOr(seg.w, GAUNTLET_W, "route width");
      const kind = seg.kind === "beam" ? "beam" : "deck";
      const samples = [{ ...p }];
      for (const leg of seg.legs) {
        if (!Number.isFinite(leg.len) || leg.len <= 0) throw new RangeError("Gauntlet route legs need positive lengths");
        const turn = clamp(finiteOr(leg.turn, 0, "route turn") * DEG, -maxTurn(leg.len, width), maxTurn(leg.len, width));
        const rise = clamp(finiteOr(leg.rise, 0, "route rise"), -leg.len * MAX_WALK_GRADE, leg.len * MAX_WALK_GRADE);
        const tracePart = trace(p, { len: leg.len, turn, rise });
        samples.push(...tracePart.samples.slice(1));
        p = tracePart.end;
      }
      parts.push({ kind, samples, w: width });
      break;
    }
    case "jump": pit(scaledGap(seg.gap, GAP_JUMP)); break;
    case "dash": pit(scaledGap(seg.gap, GAP_DASH)); break;
    case "steps": {
      if (!Number.isInteger(seg.n) || seg.n < 1 || seg.n > 64) {
        throw new RangeError(`Invalid Gauntlet step count: ${seg.n}`);
      }
      const width = positiveOr(seg.w, 6, "step width");
      for (let i = 0; i < seg.n; i++) {
        const rise = clamp(finiteOr(seg.rise, 0, "step rise"), -MAX_STEP_RISE, MAX_STEP_RISE);
        p = { ...p, y: p.y + rise };
        deck("tread", seg.len, width);
      }
      break;
    }
    case "pads": {
      if (!Number.isInteger(seg.n) || seg.n < 1 || seg.n > 64) {
        throw new RangeError(`Invalid Gauntlet pad count: ${seg.n}`);
      }
      const each = (finiteOr(seg.turn, 0, "pad turn") * DEG) / seg.n;
      const handedness = Math.floor(pen.arc) % 2 ? -1 : 1;
      for (let i = 0; i < seg.n; i++) {
        const middle = i > 0 && i < seg.n - 1;
        const w = positiveOr(seg.w, 4, "pad width");
        const offset = middle ? (i % 2 ? 1 : -1) * handedness * Math.min(.95, w * .23) : 0;
        deck("landing", seg.len, middle ? w * (i % 2 ? .92 : 1.04) : w, each, 0, offset,
          middle ? (i % 2 ? .28 : -.13) : 0);
        if (i < seg.n - 1) pit(scaledGap(seg.gap, GAP_JUMP));
      }
      break;
    }
    default: break;
  }
  return { parts, end: p };
}
