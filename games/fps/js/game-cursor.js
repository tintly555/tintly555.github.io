/*
 * The game cursor is the browser's own pointer, drawn with CSS `cursor: url(...)`
 * (see interface.css, `html.game-pointer-painted`). The browser moves it in the same
 * frame as the mouse, so it can't lag or drift the way a DOM element chasing the
 * pointer does. This module only decides when the game cursor should be used: over the
 * page, outside pointer lock, and not inside a text field (which keeps the I-beam).
 */
const pointer = document.documentElement;
let target = null, inside = false;

function refresh() {
  const editable = target?.closest("textarea, input:not([type]), input[type='text'], input[type='number'], [contenteditable='true']");
  const show = inside && !editable && !document.pointerLockElement && !document.hidden;
  pointer.classList.toggle("game-pointer-painted", show);
}

function locate(event) {
  if (event.pointerType === "touch") return;
  inside = true;
  target = event.target instanceof Element ? event.target : null;
  refresh();
}
function leave() {
  inside = false;
  refresh();
}
document.addEventListener("pointermove", locate, { passive: true });
document.addEventListener("pointerover", locate, { passive: true });
document.addEventListener("pointerout", event => { if (!event.relatedTarget) leave(); }, { passive: true });
document.addEventListener("pointerlockchange", () => {
  target = null;
  refresh();
});
document.addEventListener("visibilitychange", refresh);
window.addEventListener("blur", leave);
