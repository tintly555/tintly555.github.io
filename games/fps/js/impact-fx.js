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
  const body = g.createRadialGradient(38, 33, 1, 48, 49, 44);
  body.addColorStop(0, "#742021");
  body.addColorStop(.58, "#420a13");
  body.addColorStop(.87, "#2b0711");
  body.addColorStop(.96, "#670d19");
  body.addColorStop(1, "#29080c");
  g.fillStyle = body;
  g.fill(shape);
  g.lineWidth = 1.6;
  g.strokeStyle = "#310910a6";
  g.stroke(shape);
  g.save();
  g.clip(shape);
  const shine = g.createRadialGradient(33, 26, 0, 33, 26, 23);
  shine.addColorStop(0, "#f5adb688");
  shine.addColorStop(.36, "#e7827540");
  shine.addColorStop(1, "#a7242c00");
  g.fillStyle = shine;
  g.fillRect(0, 0, 96, 96);
  g.lineWidth = 2;
  g.strokeStyle = "#ffc2b55e";
  g.beginPath();
  g.ellipse(43, 44, 24, 24, 0, 3.72, 4.48);
  g.stroke();
  g.restore();
  return image;
}

export function createImpactFx(root) {
  const canvas = root.querySelector("canvas");
  const vignette = root.querySelector(".impact-vignette");
  const g = canvas.getContext("2d");
  let sprites, drops = [], pulse = 0, tired = 0, wasVisible = false;
  function hit(damage, angle, blood) {
    if (!(damage > 0)) return;
    pulse = Math.min(1, pulse + .25 + damage / 54);
    if (!blood || !g) return;
    sprites ||= [1, 4, 6, 8, 12].map(droplet);
    const severe = clamp(damage / 38, .16, 1);
    const count = Math.round((11 + severe * 19) * blood);
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - .5) * (i < count * .75 ? 1.55 : 3.9);
      const edge = .73 + Math.random() * .29;
      const size = (.007 + Math.pow(Math.random(), 2.9) * .115 * (.55 + severe * .45)) * (.55 + blood * .45);
      drops.push({
        x: .5 + Math.cos(a) * edge * .49, y: .5 + Math.sin(a) * edge * .48,
        size, spin: a + (Math.random() - .5) * 1.2, long: .9 + Math.random() * 1.4,
        slide: .014 + Math.random() * .028, age: 0, life: 1.7 + Math.random() * 1.6,
        alpha: .46 + blood * .49, sprite: sprites[i % sprites.length],
      });
    }
    if (drops.length > 64) drops.splice(0, drops.length - 64);
  }
  return {
    hit,
    reset() { drops = []; pulse = tired = 0; root.hidden = true; if (g) g.clearRect(0, 0, canvas.width, canvas.height); },
    update(dt, weak, health, usePost, blood) {
      pulse *= Math.exp(-dt * 3.6);
      tired += (weak - tired) * (1 - Math.exp(-dt * (weak > tired ? 6 : 3.4)));
      const red = clamp(pulse * .75 + health * .30, 0, .72);
      const dark = usePost ? 0 : tired * .82;
      const visible = red + dark > .006 || (blood > 0 && drops.length > 0);
      root.hidden = !visible;
      vignette.style.setProperty("--impact-red", red.toFixed(3));
      vignette.style.setProperty("--impact-dark", dark.toFixed(3));
      if (!g || (!visible && !wasVisible)) return tired;
      wasVisible = visible;
      const scale = Math.min(1, 1000 / Math.max(1, root.clientWidth));
      const w = Math.max(1, Math.round(root.clientWidth * scale));
      const h = Math.max(1, Math.round(root.clientHeight * scale));
      if (visible && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w; canvas.height = h;
      }
      g.clearRect(0, 0, canvas.width, canvas.height);
      const ref = Math.min(w, h);
      drops = drops.filter(d => {
        d.age += dt;
        if (d.age >= d.life || !blood) return false;
        const spread = Math.min(1, d.age * 14);
        const fade = 1 - Math.pow(d.age / d.life, 2.5);
        const size = ref * d.size * (.60 + .40 * spread);
        const drip = d.age * d.age * d.slide * (d.size > .045 ? 1 : .28);
        const y = (d.y + drip) * h;
        g.save();
        g.globalAlpha = d.alpha * fade * Math.min(1, .3 + spread);
        g.translate(d.x * w, y);
        g.rotate(d.spin + Math.min(.48, drip * 2));
        g.drawImage(d.sprite, -size * d.long / 2, -size / 2, size * d.long, size);
        g.restore();
        if (d.size > .05 && drip > .012) {
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
