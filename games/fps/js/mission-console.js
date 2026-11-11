/** Route traces live inside the scrollable workspace, below the header. */
export function createMissionConsole(menu) {
  const workspace = menu.querySelector(".menu-panels-wrap");
  const trace = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  trace.classList.add("mission-trace");
  trace.setAttribute("aria-hidden", "true");
  trace.innerHTML = '<path class="mission-trace-bed"/><path class="mission-trace-signal" pathLength="1"/><circle r="3"/><circle r="3"/>';
  menu.append(trace);
  const [bed, signal, origin, destination] = trace.children;
  const directEntry = {
    menuLoadout: "btnLoadout",
    menuTrainingMode: "btnTraining",
    menuStart: "btnStart",
    menuArenaMode: "btnStart",
    menuBossMode: "btnStart",
    menuBossDifficulty: "btnStart",
    menuPvpMaps: "btnStart",
    menuGauntlet: "btnStart",
  };
  const entries = ["btnStart", "btnTraining", "btnLoadout"];
  let panel, entry, option, frame;

  const draw = () => {
    frame = 0;
    if (!entry || !panel?.offsetWidth || !entry.offsetWidth || menu.getBoundingClientRect().width < 881) {
      trace.removeAttribute("data-visible");
      return;
    }
    const stage = menu.getBoundingClientRect();
    const bounds = workspace.getBoundingClientRect();
    const from = entry.getBoundingClientRect();
    const target = panel.getBoundingClientRect();
    const row = (option || panel.querySelector(".menu-title") || panel).getBoundingClientRect();
    const top = Math.max(8, bounds.top - stage.top + 8);
    const bottom = Math.min(stage.height, bounds.bottom - stage.top) - 8;
    const x1 = from.right - stage.left, x2 = target.left - stage.left;
    const y1 = (from.top + from.bottom) / 2 - stage.top;
    if (y1 < top || y1 > bottom || x2 - x1 < 20 || target.bottom < bounds.top || target.top > bounds.bottom) {
      trace.removeAttribute("data-visible");
      return;
    }
    const desiredY = (row.top + row.bottom) / 2 - stage.top;
    const y2 = Math.min(bottom, target.bottom - stage.top - 6, Math.max(top, target.top - stage.top + 6, desiredY));
    const elbow = (x1 + x2) / 2;
    const bend = Math.min(15, Math.abs(y2 - y1) / 2, (x2 - x1) / 4);
    const rise = bend * Math.sign(y2 - y1);
    const path = `M ${x1} ${y1} H ${elbow - bend} l ${bend} ${rise} V ${y2 - rise} l ${bend} ${rise} H ${x2}`;
    bed.setAttribute("d", path);
    signal.setAttribute("d", path);
    origin.setAttribute("cx", x1);
    origin.setAttribute("cy", y1);
    destination.setAttribute("cx", x2);
    destination.setAttribute("cy", y2);
    trace.style.clipPath = `inset(${top - 7}px 0 ${Math.max(0, stage.height - bottom - 7)}px)`;
    trace.dataset.visible = "true";
  };

  const queueDraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
  function animateSignal() {
    trace.classList.remove("routing");
    requestAnimationFrame(() => trace.classList.add("routing"));
    queueDraw();
  }
  function highlight(event) {
    const button = event.target.closest("button");
    if (!button || !panel?.contains(button) || button.disabled || button === option || button.classList.contains("menu-back-btn")) return;
    option = button;
    animateSignal();
  }

  window.addEventListener("resize", queueDraw, { passive: true });
  workspace.addEventListener("scroll", queueDraw, { capture: true, passive: true });
  workspace.addEventListener("pointerover", highlight);
  workspace.addEventListener("focusin", highlight);
  workspace.addEventListener("animationend", queueDraw);
  if (typeof ResizeObserver === "function") new ResizeObserver(queueDraw).observe(workspace);

  return function show(next) {
    panel = next;
    option = null;
    const open = panel.id !== "menuMain";
    const entryId = directEntry[panel.id] || entry?.id || "btnStart";
    entry = open ? menu.querySelector("#" + entryId) : null;
    menu.dataset.route = open ? panel.id : "";
    menu.dataset.entry = entry?.id || "";
    for (const id of entries) {
      const button = menu.querySelector("#" + id);
      button?.setAttribute("aria-expanded", String(button === entry));
    }
    if (!open) trace.removeAttribute("data-visible");
    animateSignal();
  };
}
