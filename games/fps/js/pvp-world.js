/*
 * Moving and interactive parts of the PVP maps: platforms and doors that ride on a timetable,
 * and zones that hurt, push, slow, float or launch whoever stands in them.
 *
 * Everything runs on one shared clock (`hooks.time()`, wall-clock seconds), so the lifts, doors,
 * steam vents and trains of a map are at the same point of their cycle for every player, with no
 * messages between clients. Zones only ever act on the local player.
 *
 * hooks = {
 *   time(): number,                                // shared clock, seconds
 *   player(): { x, z, feet, onGround } | null,    // the local player (null in a preview)
 *   damage(amount, label),                         // hurt the local player
 *   launch(vertical, x, z),                        // throw the local player
 *   shift(dx, dy, dz),                             // carry the local player along with a platform
 * }
 */
const BURIED = -120;
const rests = { speed: 1, grip: 1, jump: 1, gravity: 1, x: 0, z: 0, lift: 0, climb: 0, locked: false };

export function createPvpWorld(THREE, hooks) {
  const movers = [];
  const zones = [];
  const ticks = [];
  const inside = (zone, p, t) => {
    const at = zone.at ? zone.at(t) : null;
    const cx = at ? at.x : zone.x, cz = at ? at.z : zone.z;
    const hx = zone.w / 2, hz = zone.d / 2;
    if (zone.r) { if (Math.hypot(p.x - cx, p.z - cz) > zone.r) return false; }
    else if (Math.abs(p.x - cx) > hx || Math.abs(p.z - cz) > hz) return false;
    if (zone.contains && !zone.contains(p)) return false;
    const y0 = (at && at.y !== undefined ? at.y : zone.y0 ?? -1) - 0.3, y1 = (at && at.y !== undefined ? at.y : zone.y0 ?? 0) + (zone.h ?? 2.6);
    return p.feet >= y0 && p.feet <= y1;
  };

  return {
    /**
     * A body that follows `path(t) -> { x, y, z }` (offsets from home) or null to be absent.
     * `box` (optional) is its collision slab; `size` = [w, h, d] of that slab.
     */
    mover({ mesh, box = null, size = [1, 1, 1], home, path, carry = true }) {
      const m = { mesh, box, size, home: home.clone ? home.clone() : new THREE.Vector3(...home), path, carry, last: null };
      if (box) box.dyn = true;
      mesh.traverse((o) => { o.castShadow = false; });   // shadows are baked once; a mover would leave its shadow behind
      movers.push(m);
      return m;
    },
    zone(z) { zones.push({ kind: "damage", w: 2, d: 2, rate: 0.5, last: -1e9, inside: false, ...z }); return z; },
    tick(fn) { ticks.push(fn); },
    /** Call every frame. */
    update(dt) {
      const t = hooks.time();
      const p = hooks.player ? hooks.player() : null;
      for (const m of movers) {
        const off = m.path(t);
        const pos = off ? m.home.clone().add(new THREE.Vector3(off.x || 0, off.y || 0, off.z || 0)) : null;
        const prev = m.last;
        if (m.box) {
          if (pos) {
            const [w, h, d] = m.size;
            m.box.min.set(pos.x - w / 2, pos.y - h / 2, pos.z - d / 2);
            m.box.max.set(pos.x + w / 2, pos.y + h / 2, pos.z + d / 2);
          } else {
            m.box.min.set(0, BURIED, 0); m.box.max.set(0.1, BURIED + 0.1, 0.1);
          }
        }
        if (p && m.carry && m.box && pos && prev && p.onGround
            && Math.abs(p.feet - (prev.y + m.size[1] / 2)) < 0.16
            && Math.abs(p.x - prev.x) <= m.size[0] / 2 + 0.12 && Math.abs(p.z - prev.z) <= m.size[2] / 2 + 0.12) {
          hooks.shift(pos.x - prev.x, pos.y - prev.y, pos.z - prev.z);
        }
        m.last = pos;
        m.mesh.visible = !!pos;
        if (pos) m.mesh.position.copy(pos);
      }
      if (p) {
        for (const z of zones) {
          const active = z.active ? z.active(t) : true;
          const now = active && inside(z, p, t);
          if (z.kind === "damage" && now && t - z.last >= z.rate) {
            z.last = t;
            hooks.damage(z.amount, z.label || "hazard");
          }
          if (z.kind === "launch" && now && !z.inside && p.onGround) hooks.launch(z.vertical, z.vx || 0, z.vz || 0);
          if (z.onStep && now && !z.inside) z.onStep(t);
          z.inside = now;
        }
      }
      for (const fn of ticks) fn(dt, t, p);
    },
    /** Movement modifiers for the player this frame (same shape the gauntlet runtime returns). */
    modifiers() {
      const mods = { ...rests };
      const p = hooks.player ? hooks.player() : null;
      if (!p) return mods;
      const t = hooks.time();
      for (const z of zones) {
        if (z.kind === "damage" || z.kind === "launch" || z.kind === "plate") continue;
        if (z.active && !z.active(t)) continue;
        if (!inside(z, p, t)) continue;
        if (z.kind === "conveyor" && p.onGround) { mods.x += z.vx; mods.z += z.vz; mods.grip *= z.grip ?? 1; }
        if (z.kind === "slow") { mods.speed *= z.speed ?? .6; mods.jump *= z.jump ?? 1; mods.grip *= z.grip ?? 1; }
        if (z.kind === "lowgrav") mods.gravity *= z.gravity ?? .3;
        if (z.kind === "updraft" && !p.onGround) mods.lift += z.lift ?? 24;
        if (z.kind === "updraft" && p.onGround) mods.lift += (z.lift ?? 24) * 0.5;
        if (z.kind === "wind") { mods.x += z.vx || 0; mods.z += z.vz || 0; }
      }
      return mods;
    },
    clear() { movers.length = 0; zones.length = 0; ticks.length = 0; },
  };
}
