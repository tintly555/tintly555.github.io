/*
 * Course layout. Authored segment data is laid onto the course path without adding filler legs.
 *
 * Everything here is deterministic for a given level, so a course is the same every visit.
 */
import { trace, DEG } from "./gauntlet-path.js?v=3";

export const GAUNTLET_W = 8;
export const GAP_JUMP = 4.2;
export const GAP_DASH = 7.0;
/** Segments that are built axis-aligned at the current position, heading straight down -Z. */
export const FIXED = new Set(["room", "mechanic", "lift", "shuttle"]);
/** Inner edge of a bend never gets tighter than this many metres of radius. */
const EDGE_RADIUS = 4;
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
  const deck = (kind, len, w, turn = 0, rise = 0, offset = 0, shelf = 0) => {
    const turnOk = clamp(turn, -maxTurn(len, w), maxTurn(len, w));
    const t = trace(p, { len, turn: turnOk, rise });
    const samples = offset || shelf ? t.samples.map(sample => ({
      ...sample,
      x: sample.x + Math.cos(sample.th) * offset,
      y: sample.y + shelf,
      z: sample.z + Math.sin(sample.th) * offset,
    })) : t.samples;
    parts.push({ kind, samples, w, turn: turnOk, rise });
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
      const handedness = Math.floor(pen.arc) % 2 ? -1 : 1;
      for (let i = 0; i < seg.n; i++) {
        const middle = i > 0 && i < seg.n - 1;
        const w = seg.w || 4;
        const offset = middle ? (i % 2 ? 1 : -1) * handedness * Math.min(.95, w * .23) : 0;
        deck("landing", seg.len, middle ? w * (i % 2 ? .92 : 1.04) : w, each, 0, offset,
          middle ? (i % 2 ? .28 : -.13) : 0);
        if (i < seg.n - 1) pit(seg.gap || GAP_JUMP);
      }
      break;
    }
    default: break;
  }
  return { parts, end: p };
}
