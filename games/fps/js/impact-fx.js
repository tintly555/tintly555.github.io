const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function droplet(seed) {
  const image = document.createElement("canvas");
  image.width = image.height = 96;
  const g = image.getContext("2d");
  const shape = new Path2D();
  for (let i = 0; i <= 48; i++) {
    const a = i / 48 * TAU;
    const r = 31 + 4.6 * Math.sin(a * 3 + seed) + 2.5 * Math.cos(a * 7 - seed) + 1.2 * Math.sin(a * 13 + seed);
    const x = 48 + Math.cos(a) * r, y = 48 + Math.sin(a) * r;
    if (i) shape.lineTo(x, y); else shape.moveTo(x, y);
  }
  shape.closePath();
  // A thin wet film: translucent in the middle, the dried, darker edge where the blood pooled and the glint of
  // the surface where the light catches it.
  const body = g.createRadialGradient(40, 36, 2, 48, 49, 44);
  body.addColorStop(0, "rgba(132,22,28,.42)");
  body.addColorStop(.52, "rgba(96,12,20,.6)");
  body.addColorStop(.84, "rgba(58,5,12,.86)");
  body.addColorStop(.95, "rgba(34,3,8,.94)");
  body.addColorStop(1, "rgba(22,2,5,.9)");
  g.fillStyle = body;
  g.fill(shape);
  g.lineWidth = 2.4;
  g.strokeStyle = "rgba(24,2,6,.85)";
  g.stroke(shape);
  g.save();
  g.clip(shape);
  const shine = g.createRadialGradient(34, 27, 0, 34, 27, 17);
  shine.addColorStop(0, "rgba(255,214,206,.55)");
  shine.addColorStop(.4, "rgba(230,120,120,.2)");
  shine.addColorStop(1, "rgba(160,30,40,0)");
  g.fillStyle = shine;
  g.fillRect(0, 0, 96, 96);
  g.lineWidth = 2;
  g.strokeStyle = "rgba(255,200,190,.35)";
  g.beginPath();
  g.ellipse(43, 44, 24, 24, 0, 3.72, 4.48);
  g.stroke();
  g.restore();
  return image;
}

/** Dust and soot: a ragged grey-brown puff, for blasts and falls. */
function dustPuff(seed) {
  const image = document.createElement("canvas");
  image.width = image.height = 64;
  const g = image.getContext("2d");
  for (let i = 0; i < 9; i++) {
    const a = seed * 1.7 + i * 2.1, r = 10 + (i % 3) * 5;
    const grad = g.createRadialGradient(32 + Math.cos(a) * 9, 32 + Math.sin(a) * 9, 0, 32 + Math.cos(a) * 9, 32 + Math.sin(a) * 9, r + 14);
    grad.addColorStop(0, "rgba(96,88,80,.85)");
    grad.addColorStop(1, "rgba(60,54,50,0)");
    g.fillStyle = grad;
    g.beginPath(); g.arc(32, 32, 30, 0, TAU); g.fill();
  }
  return image;
}

/**
 * What each kind of damage does on screen. Blood is only for things that cut or shoot a body: claws draw
 * streaks that run down the glass, bullets throw a little fast spatter, the spines of a cactus a few beads.
 * Blasts and falls throw up dust instead, and fire or steam warm the edge of the screen without any blood.
 */
const KINDS = {
  claw:   { count: [24, 40], spread: 1.05, size: .85, drip: 1, streaks: 3, life: [2.1, 3.3], pulse: 1 },
  bullet: { count: [6, 11], spread: .42, size: .42, drip: .18, streaks: 0, life: [1.0, 1.6], pulse: .7 },
  hazard: { count: [10, 16], spread: .8, size: .5, drip: .5, streaks: 0, life: [1.3, 2.0], pulse: .6 },
  spine:  { count: [3, 6], spread: .55, size: .28, drip: .2, streaks: 0, life: [.9, 1.4], pulse: .35 },
  blast:  { count: [0, 0], dust: [26, 38], pulse: 1.15, dark: .4, life: [1.6, 2.6] },
  fall:   { count: [0, 0], dust: [14, 22], pulse: .55, dark: .12, life: [1.2, 1.9] },
  fire:   { count: [0, 0], heat: 1, pulse: .3 },
  steam:  { count: [0, 0], heat: .55, pulse: .25 },
};

export function createImpactFx(root) {
  const canvas = root.querySelector("canvas");
  const vignette = root.querySelector(".impact-vignette");
  const g = canvas.getContext("2d");
  let sprites, dust, drops = [], pulse = 0, tired = 0, heat = 0, canvasDirty = false;
  function hit(damage, angle, blood, kind = "claw") {
    if (!(damage > 0)) return;
    const profile = KINDS[kind] || KINDS.hazard;
    const strength = Math.min(1, .44 + damage / 34);
    pulse = Math.min(1, pulse + profile.pulse * strength);
    if (profile.heat) heat = Math.min(1, heat + profile.heat * strength);
    vignette.style.setProperty("--impact-x", `${(50 + Math.cos(angle) * 42).toFixed(1)}%`);
    vignette.style.setProperty("--impact-y", `${(50 + Math.sin(angle) * 42).toFixed(1)}%`);
    if (!g) return;
    const severe = clamp(damage / 38, .16, 1);
    const between = ([lo, hi]) => lo + Math.round(Math.random() * (hi - lo));
    if (profile.dust) {
      dust ||= [1, 2, 3].map(dustPuff);
      const n = between(profile.dust);
      for (let i = 0; i < n; i++) {
        const a = angle + (Math.random() - .5) * 2.6;
        drops.push({
          x: .5 + Math.cos(a) * (.6 + Math.random() * .35) * .5, y: .5 + Math.sin(a) * (.6 + Math.random() * .35) * .48,
          size: .06 + Math.random() * .16 * (.6 + severe * .4), spin: Math.random() * TAU, long: 1, slide: -.02 - Math.random() * .03,
          age: 0, life: profile.life[0] + Math.random() * (profile.life[1] - profile.life[0]), alpha: .34 + Math.random() * .2,
          sprite: dust[i % dust.length], dust: true,
        });
      }
    }
    if (!blood || !profile.count) return;
    sprites ||= [1, 4, 6, 8, 12].map(droplet);
    const count = Math.round(between(profile.count) * (.6 + blood * .4));
    const streakAngles = profile.streaks ? Array.from({ length: profile.streaks }, (_, k) => angle + (k - (profile.streaks - 1) / 2) * .22 + (Math.random() - .5) * .08) : null;
    for (let i = 0; i < count; i++) {
      const a = streakAngles
        ? streakAngles[i % streakAngles.length] + (Math.random() - .5) * .05
        : angle + (Math.random() - .5) * (i < count * .75 ? 1.55 : 3.9) * profile.spread;
      const edge = .73 + Math.random() * .29;
      const size = (.01 + Math.pow(Math.random(), 2.35) * .135 * (.55 + severe * .45)) * (.6 + blood * .4) * profile.size;
      drops.push({
        x: .5 + Math.cos(a) * edge * .49, y: .5 + Math.sin(a) * edge * .48,
        size, spin: a + (Math.random() - .5) * 1.2, long: .9 + Math.random() * 1.4,
        slide: (.014 + Math.random() * .028) * profile.drip, age: 0,
        life: profile.life[0] + Math.random() * (profile.life[1] - profile.life[0]),
        alpha: .58 + blood * .36, sprite: sprites[i % sprites.length],
      });
    }
    if (drops.length > 90) drops.splice(0, drops.length - 90);
  }
  return {
    hit,
    reset() {
      drops = []; pulse = tired = heat = 0; root.hidden = true;
      if (g && canvasDirty) g.clearRect(0, 0, canvas.width, canvas.height);
      canvasDirty = false;
    },
    update(dt, weak, health, usePost, blood) {
      pulse *= Math.exp(-dt * 2.7);
      heat *= Math.exp(-dt * 1.5);
      tired += (weak - tired) * (1 - Math.exp(-dt * (weak > tired ? 6 : 3.4)));
      const red = clamp(pulse * 1.02 + health * .4, 0, .94);
      const dark = usePost ? 0 : tired * .82;
      const warm = clamp(heat, 0, .9);
      const hasDrops = drops.length > 0;
      const visible = red + dark + warm > .006 || hasDrops;
      if (root.hidden === visible) root.hidden = !visible;
      if (visible) {
        vignette.style.setProperty("--impact-red", red.toFixed(3));
        vignette.style.setProperty("--impact-dark", dark.toFixed(3));
        vignette.style.setProperty("--impact-heat", warm.toFixed(3));
      }
      if (!g || (!hasDrops && !canvasDirty)) return tired;
      if (!hasDrops) {
        g.clearRect(0, 0, canvas.width, canvas.height);
        drops = [];
        canvasDirty = false;
        return tired;
      }
      canvasDirty = true;
      const scale = Math.min(1, 1000 / Math.max(1, root.clientWidth));
      const w = Math.max(1, Math.round(root.clientWidth * scale));
      const h = Math.max(1, Math.round(root.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }
      g.clearRect(0, 0, canvas.width, canvas.height);
      const ref = Math.min(w, h);
      drops = drops.filter(d => {
        d.age += dt;
        if (d.age >= d.life || (!blood && !d.dust)) return false;
        const spread = Math.min(1, d.age * 14);
        const fade = 1 - Math.pow(d.age / d.life, 2.5);
        const size = ref * d.size * (.60 + .40 * spread) * (d.dust ? 1 + d.age * .35 : 1);
        const drip = d.dust ? 0 : d.age * d.age * d.slide * (d.size > .045 ? 1 : .28);
        const y = (d.y + drip) * h;
        g.save();
        g.globalAlpha = d.alpha * fade * Math.min(1, .3 + spread);
        g.translate(d.x * w, y);
        g.rotate(d.spin + Math.min(.48, drip * 2));
        g.drawImage(d.sprite, -size * d.long / 2, -size / 2, size * d.long, size);
        g.restore();
        if (!d.dust && d.size > .05 && drip > .012) {
          const trail = g.createLinearGradient(0, y - drip * h, 0, y);
          trail.addColorStop(0, "#6c101700");
          trail.addColorStop(1, "#4a091589");
          g.globalAlpha = fade * .58;
          g.fillStyle = trail;
          g.fillRect(d.x * w - size * .044, y - drip * h, size * .088, drip * h);
          g.globalAlpha = 1;
        }
        return true;
      });
      return tired;
    },
  };
}
