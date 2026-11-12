import { makeGauntletObstacle } from "./gauntlet-obstacles.js?v=5";
import { createGauntletArt } from "./gauntlet-art.js?v=16";

const EYE_HEIGHT = 1.65;
const BURIED = -90;
const TAU = Math.PI * 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = value => value * value * (3 - 2 * value);
const wrap = value => ((value % 1) + 1) % 1;
/** Hazards hit hard: a swinger, laser, blade, hot floor or mine costs a third to half of your health. */
const ENV_DAMAGE_SCALE = 2.5;
const rests = { speed: 1, grip: 1, jump: 1, gravity: 1, x: 0, z: 0, lift: 0, climb: 0, locked: false };

export function createGauntletRuntime(THREE, solid, decorate, hooks, style = null) {
  const sections = [];
  const scrollers = [];
  const spinners = [];
  const ticks = [];
  const ramps = [];
  let time = 0;
  let shieldUntil = 0;
  const _portalOne = new THREE.Vector3(1, 1, 1);
  const _portalSourceFrame = new THREE.Matrix4();
  const _portalSourceInverse = new THREE.Matrix4();
  const _portalExitFrame = new THREE.Matrix4();
  const _portalHalfTurn = new THREE.Matrix4().makeRotationY(Math.PI);
  const _portalSourceQuaternion = new THREE.Quaternion();
  const _portalExitQuaternion = new THREE.Quaternion();
  const _portalLocalNow = new THREE.Vector3();
  const _portalTargetLocal = new THREE.Vector3();
  const _portalCrossing = new THREE.Vector3();

  /** Map a world pose through the paired gate frames, including their facing directions. */
  function portalTransform(source, target = new THREE.Matrix4()) {
    const exit = source?.partnerPortal;
    if (!source?.group || !exit?.group) return target.identity();
    source.group.getWorldQuaternion(_portalSourceQuaternion);
    exit.group.getWorldQuaternion(_portalExitQuaternion);
    _portalSourceFrame.compose(source.center, _portalSourceQuaternion, _portalOne);
    _portalSourceInverse.copy(_portalSourceFrame).invert();
    _portalExitFrame.compose(exit.center, _portalExitQuaternion, _portalOne);
    return target.copy(_portalExitFrame).multiply(_portalHalfTurn).multiply(_portalSourceInverse);
  }

  const art = createGauntletArt(THREE, {
    decorate,
    solid,
    scroll: (map, u, v) => scrollers.push({ map, u, v }),
    spin: (obj, rate, axis = "y") => spinners.push({ obj, rate, axis }),
    tick: fn => ticks.push(fn),
    style,
  });

  function build(segment, originY, originZ, originX = 0, originArc = 0) {
    const plan = makeGauntletObstacle(segment.id, segment.tier, segment.mirror, segment.seed);
    const section = {
      z: originZ, end: originZ - plan.length, x: originX, y: originY, arc: originArc, started: null,
      movers: [], fields: [], nodes: [], hazards: [], links: new Map(), previewUntil: 0,
    };
    sections.push(section);
    for (const piece of plan.pieces) {
      const x = originX + piece.x, z = originZ - piece.z;
      if (piece.type === "deck" || piece.type === "wall") {
        const deck = piece.type === "deck";
        const h = deck ? .56 : piece.h;
        const y = originY + piece.y + (deck ? -h / 2 : h / 2);
        const mesh = solid(piece.w, h, piece.d, x, y, z, deck ? 0x546573 : piece.tone);
        mesh.material = deck ? art.deckMaterial(piece.tone) : art.wallMaterial(piece.tone, !!piece.gate);
        const box = mesh.userData.wallBox;
        if (deck) box.wideTop = true;
        if (piece.motion || piece.gate) {
          box.dyn = true;   // these slabs move, so they stay out of the spatial index
          const mover = { ...piece, mesh, box, x, y, z, h, amount: 0, age: null, home: true };
          if (piece.motion?.kind === "glass") {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x86cddd, roughness: .18, metalness: .2, opacity: .64, transparent: true, depthWrite: false,
            });
            mesh.userData.gauntletTarget = () => { if (mover.age === null) mover.age = time; };
          }
          mesh.userData.moving = !!piece.motion && ["slide", "orbit", "weight", "ride"].includes(piece.motion.kind);
          section.movers.push(mover);
        }
      } else if (piece.type === "field") {
        const field = { ...piece, x, z, y: originY + piece.floor, inside: false };
        section.fields.push(field);
        art.drawField(piece, x, field.y, z);
      } else if (piece.type === "node") {
        const y = originY + piece.y;
        const toWorld = piece.to ? { x: originX + piece.to.x, y: originY + piece.to.y, z: originZ - piece.to.z } : null;
        const drawn = art.drawNode(piece, x, y, z, toWorld);
        const node = { ...piece, ...drawn, x, y, z, used: false, inside: false, armed: null };
        if (piece.to) node.to = { x: originX + piece.to.x, y: originY + piece.to.y + EYE_HEIGHT, z: originZ - piece.to.z };
        if (piece.kind === "target") node.mesh.userData.gauntletTarget = () => {
          section.links.set(node.id, { from: time, until: Infinity });
          node.used = true;
          node.lamp.material.color.setHex(0x72e5ab);
        };
        section.nodes.push(node);
        if (piece.kind === "portal" && drawn.partnerPortal) {
          const partnerNode = {
            kind: "portal", portal: drawn.partnerPortal, mesh: drawn.partnerPortal.disc,
            tone: piece.tone, used: false, inside: false, portalPrevious: null,
          };
          node.partnerNode = partnerNode;
          partnerNode.partnerNode = node;
          section.nodes.push(partnerNode);
        }
      } else if (piece.type === "ramp") {
        // Collision is a flight of invisible low treads (each under the 0.32 step-up the player
        // walks and dashes over); the visible slope is a wedge that follows them.
        const rise = piece.y1 - piece.y0;
        const steps = Math.max(2, Math.ceil(Math.abs(rise) / .14));
        const run = piece.d / steps;
        for (let i = 0; i < steps; i++) {
          const top = originY + piece.y0 + rise * (i + .5) / steps;
          const tread = solid(piece.w, .5, run, x, top - .25, originZ - (piece.from + (i + .5) * run), 0x546573);
          tread.visible = false;
          tread.userData.wallBox.wideTop = true;
        }
        art.ramp(piece, x, originY, originZ);
        ramps.push({ x, z0: originZ - piece.from, z1: originZ - piece.to, w: piece.w, y0: originY + piece.y0, y1: originY + piece.y1 });
      } else if (piece.type === "prop") {
        art.rung(piece, x, originY + piece.y, z);
      } else if (piece.type === "hazard") {
        const y = originY + piece.y;
        section.hazards.push({ ...piece, x, y, z, ox: originX, hitAt: -Infinity, pushAt: -Infinity, mesh: art.drawHazard(piece, x, y, z) });
      }
    }
    return { length: plan.length, exitHeight: plan.exitHeight };
  }

  const linkOn = (section, id) => (section.links.get(id)?.until ?? -Infinity) >= time;
  const standingOn = (m, player) => m.home && player.onGround && Math.abs(player.position.y - EYE_HEIGHT - m.box.max.y) < .115
    && Math.abs(player.position.x - m.mesh.position.x) <= m.w / 2 + .13
    && Math.abs(player.position.z - m.mesh.position.z) <= m.d / 2 + .13;

  function move(section, m, player, dt) {
    const p = player.position;
    const riding = m.type === "deck" && standingOn(m, player);
    const motion = m.motion;
    let dx = 0, dy = 0, dz = 0, active = true, flashing = false;
    if (m.gate) {
      if (m.breakable && hooks.dashing() && Math.abs(p.x - m.x) < m.w / 2
          && Math.abs(p.z - m.z) < .95 && p.y >= m.y - m.h / 2 && p.y <= m.y + m.h / 2 + .4) {
        section.links.set(m.gate, { from: time, until: Infinity });
        hooks.signal("impact");
      }
      const opened = (Array.isArray(m.gate) ? m.gate : [m.gate]).every(id => linkOn(section, id));
      const inDoorway = Math.abs(p.x - m.x) < m.w / 2 + .3 && Math.abs(p.z - m.z) < m.d / 2 + .45;
      const heldOpen = opened || (inDoorway && m.amount > .7);
      m.amount = m.breakable && opened ? 1 : clamp(m.amount + dt * (heldOpen ? 5 : -2.4), 0, 1);
      active = !m.breakable || !opened;
      // A gate slides down into the deck. Rising would leave the slab hanging in the air above the opening,
      // since nothing holds its top up. Fully open it sits below the deck surface, so nothing is left in the gap.
      dy = -m.amount * (m.h + .45);
    } else {
      const { kind, period = 4, phase = 0, trigger } = motion;
      const age = section.started === null ? 0 : time - section.started;
      const elapsed = trigger ? Math.max(0, time - (section.links.get(trigger)?.from ?? time)) : age;
      const cycle = wrap(elapsed / period + phase);
      const triangle = 1 - Math.abs(cycle * 2 - 1);
      let fraction = 0;
      if (kind === "slide") fraction = ease(clamp((triangle - .14) / .72, 0, 1));
      if (kind === "orbit") {
        dx = Math.sin(TAU * cycle) * motion.dx;
        dz = Math.cos(TAU * cycle) * motion.dz;
      }
      if (kind === "blink") {
        active = cycle < motion.duty;
        flashing = cycle > motion.duty - .16;
      }
      if (kind === "crumble" || kind === "glass") {
        const feet = p.y - EYE_HEIGHT;
        const hardLanding = kind === "glass" && !player.onGround && player.velocityY < -3.4 && m.home
          && Math.abs(feet - m.box.max.y) < .27 && Math.abs(p.x - m.x) < m.w / 2 && Math.abs(p.z - m.z) < m.d / 2;
        if (((riding && kind === "crumble") || hardLanding) && m.age === null) m.age = time;
        if (m.age !== null) {
          const delay = time - m.age;
          if (delay >= motion.hold + (motion.restore || 2.35)) m.age = null;
          else if (delay >= motion.hold) active = false;
          else flashing = true;
        }
      }
      if (kind === "weight") {
        m.amount = clamp(m.amount + (riding ? 1 : -.82) * dt * motion.speed / Math.abs(motion.dy), 0, 1);
        fraction = m.amount;
      }
      if (kind === "ride") {
        if (m.age === null && riding) m.age = time;
        if (m.age !== null) {
          const timer = time - m.age;
          if (timer > period + 1.2 && !riding) {
            fraction = 1 - ease(clamp((timer - period - 1.2) / 2.4, 0, 1));
            if (fraction === 0) m.age = null;
          } else fraction = ease(clamp(timer / period, 0, 1));
        }
      }
      if (kind === "bridge") active = linkOn(section, trigger);
      if (kind === "memory") {
        if (!motion.safe && riding && m.age === null) m.age = time;
        if (m.age !== null && time - m.age > 2.1) m.age = null;
        active = m.age === null || time - m.age < .24;
        flashing = m.age !== null;
      }
      if (kind !== "orbit") {
        dx = (motion.dx || 0) * fraction;
        dy = (motion.dy || 0) * fraction;
        dz = (motion.dz || 0) * fraction;
      }
    }
    const x = m.x + dx, y = m.y + (active ? dy : BURIED), z = m.z - dz;
    if (riding && active) {
      p.x += x - m.mesh.position.x;
      p.y += y - m.mesh.position.y;
      p.z += z - m.mesh.position.z;
    }
    m.home = active;
    m.mesh.visible = active;
    m.mesh.position.set(x, y, z);
    m.box.min.set(x - m.w / 2, y - m.h / 2, z - m.d / 2);
    m.box.max.set(x + m.w / 2, y + m.h / 2, z + m.d / 2);
    // Warnings are read from the plate itself (no glowing outlines): a tint on the deck material.
    if (m.type === "deck" && motion && motion.kind !== "glass") {
      let tone = m.tone, mix = .2;
      if (flashing && Math.floor(time * 11) % 2 === 0) { tone = 0xff6656; mix = .65; }
      if (motion.kind === "memory") {
        tone = time < section.previewUntil && motion.safe ? 0x71ffd2 : 0x7f86a5;
        mix = .55;
      }
      m.mesh.material = art.deckMaterial(tone, mix);
    }
  }

  function insideField(field, player) {
    const p = player.position, feet = p.y - EYE_HEIGHT;
    return Math.abs(p.x - field.x) <= field.w / 2
      && Math.abs(p.z - field.z) <= field.d / 2
      && feet >= field.y - .31 && feet <= field.y + field.maxY;
  }

  /** Is the player in (or beside) this section? The course winds, so z alone no longer says. */
  const near = (section, p, margin) => p.z <= section.z + margin && p.z >= section.end - margin
    && Math.abs(p.x - section.x) <= 46 && Math.abs(p.y - section.y) <= 44;

  function modifiers(player) {
    const active = { ...rests };
    for (const section of sections) {
      if (!near(section, player.position, 2)) continue;
      for (const field of section.fields) {
        if (!insideField(field, player)) continue;
        if (field.kind === "belt" && !player.onGround) continue;
        const gust = field.kind === "gust" ? Math.sin(time * TAU / field.period) : 1;
        if (field.speed) active.speed *= field.speed;
        if (field.grip) active.grip *= field.grip;
        if (field.jump) active.jump *= field.jump;
        if (field.gravity) active.gravity *= field.gravity;
        if (field.kind === "dashLock") active.locked = true;
        if (field.kind === "ladder" && hooks.forwardPressed()) {
          const rise = field.y + field.maxY - (player.position.y - EYE_HEIGHT);
          if (rise > .22) {
            active.climb = field.climb;
            active.speed *= .24;
          }
        }
        if (field.kind === "updraft" && !player.onGround) active.lift += field.lift;
        if (!["spring", "wallKick"].includes(field.kind)) {
          active.x += (field.xForce || 0) * gust;
          active.z += (field.zForce || 0) * gust;
        }
      }
    }
    return active;
  }

  function useNode(section, node, player) {
    if (node.kind === "target") return;
    if (node.kind === "portal") {
      if (!node.portal?.partnerPortal) return;
      portalTransform(node.portal, _portalTransform);
      _portalLocalNow.copy(player.position).applyMatrix4(_portalSourceInverse);
      const previous = node.portalPrevious;
      const crossed = previous && ((previous.z > 0 && _portalLocalNow.z <= 0)
        || (previous.z < 0 && _portalLocalNow.z >= 0));
      if (crossed) {
        const t = previous.z / (previous.z - _portalLocalNow.z);
        _portalCrossing.lerpVectors(previous, _portalLocalNow, t);
        // Leave enough clearance for the player's capsule inside the oval opening.
        const fits = (_portalCrossing.x / .81) ** 2 + (_portalCrossing.y / .77) ** 2 < 1;
        if (fits) {
          hooks.traversePortal?.(_portalTransform, node.portal);
          // Rebaseline both gates after the coordinate mapping. Otherwise the partner
          // gate can mistake the same crossing for a second traversal on this frame.
          _portalLocalNow.copy(player.position).applyMatrix4(_portalSourceInverse);
          if (node.partnerNode?.portal) {
            node.partnerNode.portal.group.getWorldQuaternion(_portalExitQuaternion);
            _portalExitFrame.compose(node.partnerNode.portal.center, _portalExitQuaternion, _portalOne);
            _portalExitFrame.invert();
            _portalTargetLocal.copy(player.position).applyMatrix4(_portalExitFrame);
            if (!node.partnerNode.portalPrevious) node.partnerNode.portalPrevious = new THREE.Vector3();
            node.partnerNode.portalPrevious.copy(_portalTargetLocal);
          }
          hooks.signal("portal");
        }
      }
      if (!node.portalPrevious) node.portalPrevious = new THREE.Vector3();
      node.portalPrevious.copy(_portalLocalNow);
      return;
    }
    const p = player.position;
    const d = Math.hypot(p.x - node.x, p.z - node.z);
    const dy = p.y - EYE_HEIGHT - node.y;
    const airborne = !player.onGround;
    const airNode = node.kind === "airKick" || node.kind === "fuel";
    const inside = d <= node.radius && Math.abs(dy) < (airNode ? 2.3 : .5);
    const entered = inside && !node.inside;
    node.inside = inside;

    if (node.kind === "mine") {
      const bodies = hooks.bodies ? hooks.bodies() : [];
      const stepped = bodies.some(b => Math.hypot(b.x - node.x, b.z - node.z) <= node.radius && Math.abs(b.y - node.y) < .5);
      if ((inside || stepped) && node.armed === null && !node.used) node.armed = time;
      if (node.armed !== null) {
        (node.lamp || node.mesh).material.color.setHex(Math.floor(time * 15) % 2 ? 0xff9c43 : 0xff4238);
        if (time - node.armed >= node.delay) {
          node.used = true;
          node.armed = null;
          node.mesh.visible = false;
          hooks.explode?.(node.x, node.y + .3, node.z, d);
          for (const b of bodies) {
            if (Math.hypot(b.x - node.x, b.z - node.z) < 2.3 && Math.abs(b.y - node.y) < 1.6) hooks.hurtBody(b.ref, Math.round(22 * ENV_DAMAGE_SCALE * 1.4), b.x, b.y + 1, b.z);
          }
          if (d < 2.05 && Math.abs(dy) < 1.3) {
            hurt(22, player);
            hooks.launch(4.6, Math.sign(p.x - node.x) * 2.4, -1.3);
          }
        }
      }
      return;
    }
    if (node.kind === "switch" && inside && (!node.requires || linkOn(section, node.requires))) {
      if (node.toggle && entered) {
        for (const other of section.nodes) if (other.group === node.group) section.links.delete(other.id);
      }
      if ((node.toggle || node.once) ? entered : true) {
        const prior = section.links.get(node.id);
        section.links.set(node.id, { from: linkOn(section, node.id) ? prior.from : time, until: node.toggle ? Infinity : time + node.hold });
        if (entered) hooks.signal("switch");
      }
    }
    if (!entered || node.used) return;
    if (node.kind === "airKick" && airborne) {
      hooks.launch(node.lift, 0, node.zForce);
      hooks.notice?.("AIR BOOST", 1.2);
      node.used = true;
    } else if (node.kind === "fuel") {
      node.used = hooks.fuel(airborne);
      if (node.used) hooks.notice?.("JET REFUELLED", 1.6);
    } else if (node.kind === "dashCharge") {
      hooks.refill();
      hooks.notice?.("DASHES REFILLED", 1.6);
      node.used = true;
    } else if (node.kind === "pickup") {
      section.links.set(node.id, { from: time, until: Infinity });
      node.used = true;
    } else if (node.kind === "shield") {
      shieldUntil = time + node.seconds;
      hooks.notice?.("HEAT SHIELD ON — cross now", node.seconds);
    } else if (node.kind === "memoryReplay") {
      section.previewUntil = time + 2.4;
    }
    if (node.used) node.mesh.visible = false;
    if (node.used || ["portal", "shield", "memoryReplay"].includes(node.kind)) hooks.signal("switch");
  }

  let lastDamage = -Infinity;
  function hurt(damage, player) {
    if (time < shieldUntil || time - lastDamage < .48) return;
    lastDamage = time;
    if (player.health > 0) hooks.damage(Math.round(damage * ENV_DAMAGE_SCALE));
  }

  function tickHazard(section, hazard, player) {
    const p = player.position;
    const feet = p.y - EYE_HEIGHT;
    const head = p.y - hooks.crouchDrop() + .12;
    const cycle = wrap((time - (section.started ?? time)) / (hazard.period || 3.4) + (hazard.phase || 0));
    // Each hazard works out its own state for this frame once, and answers "does it touch a body
    // standing at (x, z)?" for anything that asks: the player, and the zombies.
    let test = () => false;
    if (hazard.kind === "rotor") {
      const a = cycle * TAU;
      hazard.mesh.rotation.y = a;
      test = (x, z) => {
        const dx = x - hazard.x, dz = z - hazard.z;
        return Math.abs(dx * Math.sin(a) + dz * Math.cos(a)) < .35 && Math.abs(dx * Math.cos(a) - dz * Math.sin(a)) < hazard.radius + .24;
      };
    } else if (hazard.kind === "beam") {
      hazard.mesh.visible = cycle < .43;
      const opacity = cycle < .14 ? .28 : .86;
      hazard.mesh.material.opacity = opacity;
      hazard.mesh.userData.fade?.forEach(material => { material.opacity = Math.min(1, opacity + .1); });
      const live = cycle > .14 && cycle < .43;
      test = (x, z) => live && Math.abs(z - hazard.z) < .32 && Math.abs(x - hazard.x) < hazard.width / 2;
    } else if (hazard.kind === "dart") {
      const travel = cycle / .39;
      const x0 = hazard.ox + (hazard.x - hazard.ox) * (1 - travel * 2);
      const previous = hazard.mesh.visible ? hazard.mesh.position.x : hazard.x;
      hazard.mesh.visible = travel < 1;
      hazard.mesh.position.x = x0;
      test = (x, z) => travel < 1 && Math.abs(z - hazard.z) < .34 && x >= Math.min(x0, previous) - .33 && x <= Math.max(x0, previous) + .33;
    } else if (hazard.kind === "chase") {
      const start = section.links.get(hazard.trigger)?.from;
      const offset = start == null ? -1 : (time - start) * hazard.speed;
      hazard.mesh.visible = offset >= 0 && offset < hazard.range;
      hazard.mesh.position.z = hazard.z - offset;
      test = (x, z) => hazard.mesh.visible && Math.abs(z - hazard.mesh.position.z) < .49 && Math.abs(x - hazard.ox) < hazard.width / 2;
    }
    const y = hazard.mesh.position.y;
    const reach = test(p.x, p.z) && y >= feet + .045 && y <= head;
    if (reach && hazard.kind === "rotor" && time - hazard.pushAt > .16) {
      // Shove the player along the arm's sweep, harder near the tip, with a little outward kick.
      hazard.pushAt = time;
      const a = cycle * TAU, dx = p.x - hazard.x, dz = p.z - hazard.z;
      const nx = Math.sin(a), nz = Math.cos(a), along = Math.abs(dx * Math.cos(a) - dz * Math.sin(a));
      const outward = Math.hypot(dx, dz) || 1;
      const power = 3.4 + 3.2 * Math.min(1, along / hazard.radius);
      hooks.push?.(-nx * power + dx / outward * 1.4, -nz * power + dz / outward * 1.4);
    }
    if (reach && time - hazard.hitAt > .7) {
      hazard.hitAt = time;
      hurt(hazard.damage, player);
    }
    // Zombies are not immune: anything that hurts the player hurts them too.
    const bodies = hooks.bodies ? hooks.bodies() : null;
    if (bodies && bodies.length) {
      hazard.enemyHit ||= new Map();
      for (const b of bodies) {
        if (!test(b.x, b.z) || y < b.y + .045 || y > b.y + 1.9) continue;
        if (time - (hazard.enemyHit.get(b.ref) ?? -Infinity) < .7) continue;
        hazard.enemyHit.set(b.ref, time);
        hooks.hurtBody(b.ref, Math.round(hazard.damage * ENV_DAMAGE_SCALE), b.x, b.y + 1, b.z);
      }
    }
  }

  function update(dt, player) {
    time += dt;
    for (const item of scrollers) {
      item.map.offset.x += item.u * dt;
      item.map.offset.y += item.v * dt;
    }
    for (const item of spinners) item.obj.rotation[item.axis] += item.rate * dt;
    for (const fn of ticks) fn(dt, time);
    const p = player.position;
    const zone = { heat: false, air: false };
    for (const section of sections) {
      if (!near(section, p, 10)) continue;
      if (section.started === null && p.z <= section.z + 1.4) {
        section.started = time;
        const memory = section.movers.find(m => m.motion?.kind === "memory" && m.motion.safe);
        if (memory) section.previewUntil = time + memory.motion.show;
      }
      for (const node of section.nodes) useNode(section, node, player);
      for (const mover of section.movers) move(section, mover, player, dt);
      for (const hazard of section.hazards) tickHazard(section, hazard, player);
      for (const field of section.fields) {
        const inside = insideField(field, player);
        const entering = inside && !field.inside;
        field.inside = inside;
        if (inside && field.kind === "damage") zone.heat = true;
        else if (inside && ["wind", "gust", "updraft"].includes(field.kind)) zone.air = true;
        if (entering && field.kind === "water") hooks.signal("splash");
        if (inside && field.kind === "damage") hurt(field.damage, player);
        if (field.kind === "damage" && hooks.bodies) {
          field.enemyHit ||= new Map();
          for (const b of hooks.bodies()) {
            if (Math.abs(b.x - field.x) > field.w / 2 || Math.abs(b.z - field.z) > field.d / 2) continue;
            if (b.y < field.y - .31 || b.y > field.y + field.maxY) continue;
            if (time - (field.enemyHit.get(b.ref) ?? -Infinity) < .48) continue;
            field.enemyHit.set(b.ref, time);
            hooks.hurtBody(b.ref, Math.round(field.damage * ENV_DAMAGE_SCALE), b.x, b.y + 1, b.z);
          }
        }
        if (entering && field.kind === "spring" && player.onGround) {
          hooks.launch(field.lift, field.xForce || 0, field.zForce);
          hooks.signal("launch");
        }
        if (inside && field.kind === "wallKick" && hooks.jumpPressed() && !field.kicked && !player.onGround) {
          field.kicked = true;
          hooks.launch(field.lift, field.xForce || 0, field.zForce);
        }
        if (!inside || player.onGround) field.kicked = false;
      }
    }
    hooks.zone?.(zone);
  }

  /** Run after movement so portal traversal is applied before the frame is rendered. */
  function updatePortals(player) {
    const p = player.position;
    for (const section of sections) {
      if (!near(section, p, 10)) continue;
      for (const node of section.nodes) if (node.kind === "portal") useNode(section, node, player);
    }
  }

  function resetAfter(checkpointArc) {
    lastDamage = -Infinity;
    shieldUntil = 0;
    for (const section of sections) {
      if (section.arc < checkpointArc - .01) continue;
      section.started = null;
      section.links.clear();
      section.previewUntil = 0;
      for (const mover of section.movers) { mover.amount = 0; mover.age = null; }
      for (const node of section.nodes) {
        node.used = node.inside = false;
        node.lastSide = undefined;
        node.portalPrevious = null;
        node.armed = null;
        node.mesh.visible = true;
        (node.lamp || node.mesh).material.color.setHex(node.tone);
      }
      for (const field of section.fields) field.inside = field.kicked = false;
    }
  }

  const movers = () => sections.flatMap(s => s.movers.filter(m => m.type === "deck" && m.motion && ["slide", "orbit", "weight", "ride"].includes(m.motion.kind)));
  const shieldLeft = () => Math.max(0, shieldUntil - time);
  const _portalTransform = new THREE.Matrix4();
  return { build, update, updatePortals, modifiers, resetAfter, ramps, movers, portals: art.portals, portalTransform, shieldLeft };
}
