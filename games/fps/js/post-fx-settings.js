// One schema drives saved values, validation, and the graphics controls.
const slider = (key, label, value, min = 0, max = 1, step = .01) => ({ key, label, value, min, max, step });
const pick = (key, label, value, choices) => ({ key, label, value, choices });
const color = (key, label, value) => ({ key, label, value, color: true });
const rgb = (key, label, value, min, max) => ["Red", "Green", "Blue"].map((c, i) =>
  slider(key + i, label + " · " + c, Array.isArray(value) ? value[i] : value, min, max));

export const FX_GROUPS = [
  ["Light and surfaces", [
    slider("bloom", "Bloom", .75),
    pick("ao", "Ambient occlusion", "auto", { auto: "Auto", off: "Off", ssao: "SSAO", hbao: "HBAO" }),
    slider("aoStrength", "Contact shadow strength", .60),
    slider("ssr", "Water reflections (SSR)", .78),
    slider("shafts", "Light shafts", .50),
    slider("flare", "Lens flare", .28),
    slider("adapt", "Eye adaptation", .48),
    pick("tone", "Tone mapping", "aces", { aces: "ACES Filmic", agx: "AgX", neutral: "Neutral", reinhard: "Reinhard" }),
    slider("exposure", "Exposure (EV)", 0, -.65, .65),
  ]],
  ["Lens and impact", [
    slider("blood", "Blood droplets", .78),
    slider("weakness", "Speed Weak effect", .82),
    slider("dof", "Depth of field", 0),
    slider("motion", "Camera motion blur intensity", .16),
    slider("fringe", "Chromatic aberration", .14),
    slider("distortion", "Lens distortion", 0, -.35, .35),
    slider("panini", "Panini projection", 0),
    slider("grain", "Film grain", .24),
    slider("vignette", "Vignette", .70),
  ]],
  ["Color adjustment and white balance", [
    slider("saturation", "Saturation", 1, 0, 1.5),
    slider("contrast", "Contrast", 1, .65, 1.35),
    slider("temperature", "Temperature", 0, -1, 1),
    slider("tint", "Green / magenta tint", 0, -1, 1),
  ]],
  ["Lift, gamma and gain", [
    ...rgb("lift", "Lift", 0, -.20, .20),
    ...rgb("gamma", "Gamma", 1, .5, 1.5),
    ...rgb("gain", "Gain", 1, .65, 1.35),
  ]],
  ["Split toning", [
    color("shadowTone", "Shadow color", "#52789f"),
    color("highlightTone", "Highlight color", "#f8c69c"),
    slider("split", "Strength", 0),
    slider("splitBalance", "Balance", 0, -1, 1),
  ]],
  ["Channel mixer", [
    ...rgb("mixR", "Red output", [1, 0, 0], -.5, 1.5),
    ...rgb("mixG", "Green output", [0, 1, 0], -.5, 1.5),
    ...rgb("mixB", "Blue output", [0, 0, 1], -.5, 1.5),
  ]],
  ["Color curves", [
    slider("curve0", "Black point", 0, 0, .25),
    slider("curve1", "Shadows", .25, 0, .55),
    slider("curve2", "Midtones", .5, .15, .85),
    slider("curve3", "Highlights", .75, .45, 1),
    slider("curve4", "White point", 1, .75, 1),
    ...rgb("curveRgb", "Channel midtone", .5, .2, .8),
  ]],
];
const fields = FX_GROUPS.flatMap(([, items]) => items);
export const DEFAULT_FX = Object.freeze(Object.fromEntries(fields.map(f => [f.key, f.value])));

function validate(f, value) {
  if (f.choices) return Object.hasOwn(f.choices, value) ? value : f.value;
  if (f.color) return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : f.value;
  return typeof value === "number" && Number.isFinite(value) ? Math.min(f.max, Math.max(f.min, value)) : f.value;
}

export function loadFxSettings(data) {
  return Object.fromEntries(fields.map(f => [f.key, validate(f, data?.[f.key])]));
}

export function mountFxSettings(root, get, save, apply) {
  if (!root) return;
  const controls = [];
  const sync = () => {
    const current = get();
    for (const { field, input, output } of controls) {
      input.value = current[field.key];
      if (output) output.textContent = current[field.key].toFixed(2);
    }
  };
  for (const [title, items] of FX_GROUPS) {
    const section = document.createElement("details");
    section.className = "fx-settings-group";
    const heading = document.createElement("summary");
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "fx-settings-controls";
    section.append(heading, body);
    for (const field of items) {
      const row = document.createElement("label");
      row.className = "fx-setting";
      const name = document.createElement("span");
      name.textContent = field.label;
      const input = document.createElement(field.choices ? "select" : "input");
      input.dataset.fx = field.key;
      let output = null;
      if (field.choices) {
        for (const [value, label] of Object.entries(field.choices)) input.add(new Option(label, value));
      } else if (field.color) {
        input.type = "color";
      } else {
        input.type = "range";
        input.min = field.min;
        input.max = field.max;
        input.step = field.step;
        output = document.createElement("output");
      }
      row.append(name, input);
      if (output) row.append(output);
      input.addEventListener("input", () => {
        const value = validate(field, output ? Number(input.value) : input.value);
        get()[field.key] = value;
        if (output) output.textContent = value.toFixed(2);
        apply();
      });
      input.addEventListener("change", save);
      body.append(row);
      controls.push({ field, input, output });
    }
    root.append(section);
  }
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "settings-action-btn";
  reset.textContent = "Reset effects and color";
  reset.addEventListener("click", () => {
    Object.assign(get(), DEFAULT_FX);
    sync();
    apply();
    save();
  });
  root.append(reset);
  sync();
  return sync;
}
