# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A static GitHub Pages site at **https://tintly555.github.io/** that hosts several browser games. The repo root is a hand-written `index.html` that links to each game in `games/<name>/index.html`. There is no package.json, no test runner, no linter, no CI build — every game ships as static files that GitHub Pages serves directly.

**Live URL:** https://tintly555.github.io/games/fps/
**Branch:** `main` (publishes to GitHub Pages on push).

## Running locally

To preview a game, serve the directory with any static server and open it in a browser:

```bash
# from repo root — serves on http://localhost:8000
python3 -m http.server 8000
# then open http://localhost:8000/games/fps/
```

Hard refresh (`⌘+Shift+R` / `Ctrl+Shift+R`) after edits — browsers cache `translation.js` and other module imports aggressively, and the FPS game loads i18n via a dynamic `import()`. Incognito is the fastest way to bypass cache.

## The FPS game (`games/fps/`)

The main project. `index.html` (~3,200 lines, inlined CSS + HTML only — no JS) loads one external ES module: `main.min.js`. The unminified source lives in `js/main.js`. Asset folders: `images/`, `js/`, `media/`, `svg/`. **There is also a `backup.html`** in this directory that snapshots older versions — if the live `index.html` is in a half-edited state after a botched write, the most recent committed `index.html` is in git, and `backup.html` may have additional pre-commit state. Always verify with `git status` and `git diff` before assuming the working file is the truth. **Do not edit `backup.html`.**

### FPS editing workflow

`index.html` does not contain gameplay JS — it only sets up the page (meta tags, inline CSS, boot script that defines `--game-cursor-*`, mounts the `<script type="module" src="main.min.js">` tag at the end of body). All gameplay code is in `js/main.js`, and what the browser actually loads is `main.min.js`.

**When changing FPS gameplay:** edit `games/fps/js/main.js`, then re-minify to `games/fps/main.min.js`:

```bash
# from repo root
npx terser games/fps/js/main.js --compress --mangle --module --output games/fps/main.min.js
```

Commit **both** `js/main.js` (the source) and `main.min.js` (the deployed build). They must always be in sync — never ship a `main.min.js` that's older than the source. The minified file is roughly 1/3 of the source and lets the game boot with no build step on GitHub Pages.

**When changing FPS HTML/CSS/cursor wiring:** edit `games/fps/index.html` directly. There is no build step for `index.html` — it ships as-is.

### Game architecture (high level)

- **Source:** one file, `js/main.js`, ~18,400 lines, no internal modules. CSS lives in one `<style>` block inside `index.html`'s `<head>`. There is no in-repo build-time bundler beyond `terser` for the minify step above.
- **Three.js** is the renderer. The scene, camera, renderer, and most geometry are constructed at boot.
- **Game loop:** `animate()` (at `js/main.js:17094`) runs `requestAnimationFrame`. Per-tick: input → player update → weapon update → med-kit → enemies → boss projectiles → tracers → effects → render. AI tick is gated on `gameWorldReady && controlsInputReady()` — zombies don't move until the player has clicked to enter the world.
- **Modes (driven by `CURRENT_MAP` at `js/main.js:2560`):** `"arena"` (PVE / co-op), `"boss_arena"` (PVE / boss), `"crossfire"`, `"crossfire_grid"`, `"pvp_bright"` (PVP), `"training"`. Mode predicates (`isArenaLikeMap`, `isBossArenaMap`, `isPvpCrossfireMap`, etc.) live near the top of the script body around line 2675.
- **Per-mode BGM** mirrors the same pattern: a `*BgmAudio` `<audio>` element, a `get*BgmUrlCandidates()` URL builder, an `ensure*BgmAudio()` lazy loader, a `shouldPlay*Bgm()` predicate, a `tryPlay*Bgm()` entry. Files live in `media/`. The boot trigger at the end of the script picks exactly one BGM via an if/else if chain.
- **Multiplayer** uses Socket.IO client (CDN, `socket.io-client@4`) talking to a separate relay server at `https://chat.jimmyqrg.com` (configured via the `game-multiplayer-origin` meta tag, **overridable at runtime** by the SERVER tab in Settings — see "Server config" below). Offline mode falls back to `createOfflineSocketStub()` which synthesizes fake rooms. A local fallback `js/socket.io.min.js` is shipped in case the CDN load fails.
- **i18n** lives in `js/translation.js` (18 language blocks). `tr(key, fallback)` resolves via `translateGame(lang, key, fallback)`; missing keys fall back to the second argument, which is always English text. **Add new strings by editing the EN block in `translation.js` first**; the other 17 locales fall back to English automatically until translated. `index.html` loads `translation.js` lazily via a dynamic `import()` at boot.
- **Achievement system** is in-script: `ACHIEVEMENT_DEFS` (id, nameKey, hintKey, color, category, icon, secret), `achievementsUnlocked` (state), `renderAchievementsPanel` (DOM), `showAchievementDetail`. UI lives in the `achievementsModal` (mirrors the `settingsModal`).
- **In-game unlock toast** lives in `#achToastWrap` at the top of the screen, 3-second auto-dismiss, queued if multiple unlock in quick succession.
- **Menu-wall 3D scene (Experimental):** a Three.js scene rendered behind the main menu showing a wall + lamp. Opt-in via the "Animated background light visual" toggle in Settings → GRAPHICS (tagged "Experimental", default off). When off, the `.menu::before` pseudo-element (driven by `--game-ui-menu-bg`) is the menu background. The lamp is driven by the 700Hz frequency band of the menu music (see "Menu-wall audio reactivity" below).

### Custom mouse cursor (`images/mouse.png`, `images/mouse-hover.png`)

The cursor when pointer-lock is released (death screen, menu, settings, etc.) is **not** a CSS `cursor: url(...)`. CSS cursor() cannot cross-fade, so the game uses two `<div class="game-cursor-layer">` elements inside `#gameCursor` that:

- follow the mouse position via a `mousemove` listener and `transform: translate3d()`,
- hold `background-image: var(--game-cursor-default-image)` (default layer, `mouse.png`) and `var(--game-cursor-hover-image)` (hover layer, `mouse-hover.png`),
- have their opacities tweened by `setupGameCursor()` (defined in the head boot script around line 203 of `index.html`).

When `body.show-cursor` is set (the toggle fired by `js/main.js` for menu/settings/death), the DOM cursor fades visible. The `default` and `hover` layers cross-fade on a **500 ms linear tween** (`CURSOR_DURATION_MS` in `setupGameCursor`); when the underlying element's computed `cursor` becomes `pointer`, the tween target flips to hover, and a mid-fade flip **continues from the current opacity** (no snap, no restart) — that's the bug-class safeguard: capture `state.opacDef`/`state.opacHov` as the new `from` and reset `startMs`.

Hover detection: a delegated `mouseover`/`mouseout` listener walks up from `event.target` reading `getComputedStyle(el).cursor` — any element with `cursor: pointer` along the chain flips the target.

The native cursor is hidden via `body.show-cursor #app, body.show-cursor { cursor: none }` while the DOM cursor is shown. The cursor `<div>` is `position: fixed` at `z-index: 2147483640` (below modal overlays, above canvas), `pointer-events: none` so it doesn't intercept mouse events.

- **Both PNGs are 64×64.** Browser cursor-size caps do *not* apply to elements rendered by the page (only to `cursor: url()`), but keep them consistent so a future regression to CSS `cursor: url(...)` doesn't blow up.
- Adding a new cursor state: add a `mouse-<name>.png`, set `--game-cursor-<name>-image` in the head boot script, add a third layer `<div data-layer="<name>">` to `#gameCursor`, and extend `applyTarget()` / `startTween()` to handle the new target opacity key.

### Critical: the `dt` cap (`js/main.js:17096`)

```js
const dt = Math.min(clock.getDelta(), 0.033);
```

`animate()` caps `dt` at 33 ms (~30 fps). **This means any game timer driven by accumulated `dt` will stretch under heavy load** — at a real 10 fps, a "8-second" cooldown takes ~24 s in wall-clock time. Symptoms include "the medkit takes twice as long when the game lags", "boss shake cycle feels wrong on slow frames", etc.

**Fix pattern for any new game timer:** use wall-clock time directly. Track a start timestamp with `performance.now()` and compute elapsed in ms each frame. Do NOT just accumulate `dt`. See `state.medKitHealStartMs` in `js/main.js` (declared around line 6795, set at line 15072, compared at line 15076) for an example.

### Critical: audio routing — two parallel graphs

There are two separate audio paths that **do not interact**:

1. **Web Audio graph (synthesized SFX + generated sounds):**
   ```
   audioSfx  ──┐
   audioMusic ─┼─→ audioMaster ──→ destination
   ```
   - Gun fire, knife swing, dashes, footsteps, etc. → `audioSfx`.
   - Generated tones (e.g. arena 19 Hz hum) → `audioMusic`.
   - Volume via `audioMaster.gain.value` (read by `applyAudioVolumes`).

2. **HTML `<audio>` elements (BGM, recorded SFX):** each per-mode `*BgmAudio` and the inline base64 fire sounds (PISTOL/SHOTGUN/SMG/SNIPER/DEV) are `new Audio()`. **They bypass the Web Audio graph entirely** — they go straight to the browser's destination. Volume is set per-element via `.volume`.

**Implication:** muting the music via the slider updates `audioMusic.gain.value`, but does NOT silence `menuBgmAudio` / `arenaBgmAudio` / `bossBgmAudio` / `pvpBgmAudio`. You must sync each `<audio>` element's `.volume` separately. `applyAudioVolumes()` does this — extend it when adding new BGM elements. Forgetting this is a known bug class.

### Menu-wall audio reactivity (700Hz band)

The 3D menu-wall lamp (Experimental toggle) is driven by the menu music's frequency content:

- An `AnalyserNode` is created in `ensureMenuBgmAudio()` (search `menuBgmAnalyser = audioCtx.createAnalyser()`) and is tapped off the menu BGM signal after the `menuBgmMenuGain` gain.
- `menuBgmFreqBuf` (Uint8Array) holds the latest frequency data via `getByteFrequencyData()`. Frequencies above 700Hz are completely ignored (the loop breaks at the 700Hz bin); the 700Hz band itself has the strongest weight, with linear falloff to the surrounding bins.
- The lamp intensity is `MENU_BACKDROP_LIGHT_FIXED * (1.0 + musicMul + baselineFlicker)` where `musicMul` is the weighted 700Hz energy (0–1.5) and `baselineFlicker` is a small always-on 0.5 Hz + 2.1 Hz + random-noise component so the lamp has some life when the music is silent.

When extending or debugging the lamp:
- `MENU_BACKDROP_LIGHT_FIXED` controls the base intensity. Raising it brightens the whole lamp; lowering it dims the whole lamp.
- The 700Hz cutoff and bin-weighting are hard-coded in `updateMenuBackdropLightFromMusic()`. To retune the band, change the `targetBin` / `±6` window and the `1 - dist / 7` weight falloff.
- The baseline flicker is the only thing keeping the lamp from sitting at a constant brightness when the music is silent or has no energy at 700Hz.

### State persistence (`localStorage`)

Two keys:
- `fpsGameSettingsV1` (`SETTINGS_STORAGE_KEY`) — volumes, quality, language, look-sens, hotbar slot order, server config, etc. Read by `loadGameSettings()` (`js/main.js:2234`), written by `saveGameSettings()` (`js/main.js:2284`) (which JSON-serializes the whole `gameSettings` object, so adding a new field is automatic).
- `fps_unlocks` (`UNLOCK_STORAGE_KEY`) — weapon unlocks, achievement progress, equipped achievements, total kill count, boss kill count. Read by `loadUnlocks()`, written by `persistUnlocks()`.

Adding a new persistent setting: add the field to the `gameSettings = {...}` initializer at `js/main.js:2211`, add a `typeof o.foo === "..."` line in `loadGameSettings()` (`js/main.js:2234`). `saveGameSettings()` needs no change. Use `saveGameSettings()` after every mutation.

### Server config (Settings → SERVER tab)

The user can pick how the game finds the multiplayer relay:
- **Default** — uses the `game-multiplayer-origin` meta tag (`https://chat.jimmyqrg.com` for the GitHub Pages deploy).
- **Manual** — user types an `http://` or `https://` URL with optional path. Validated by `new URL(s)` with a `http:`/`https:` protocol check.
- **Local** — scans `localhost:1` through `localhost:99999` in parallel (200 in-flight, 1.2 s timeout) via `fetch` with `mode: "no-cors"`, populates a latency-sorted list of responding ports, user clicks to pick.

The chosen value is persisted to `gameSettings.serverMode` / `serverManualUrl` / `serverLocalUrl` and read by `getMultiplayerOrigin()` at boot. **Changes take effect only on page reload** — the socket connects once with the resolved origin. The "Save & reload" button handles the reload.

Adding a new server source: extend the `getMultiplayerOrigin()` precedence chain and add a matching subpanel in the SERVER section HTML (search `settingsSectionServer`).

## Adding sound effects (the standard pattern)

The project uses a fetch + `decodeAudioData` + cached `BufferSource` pattern for OGG/MP3 SFX. Every new sound goes through this exact template (see `getFlashlightSoundUrl` / `ensureFlashlightSoundBuffer` / `playFlashlightToggleSound`, or the newer `getMedpackSoundUrl` / `ensureMedpackSwitchBuffer` / `playMedPackSwitchSound`):

1. Drop the file in `media/` (matching the existing `media/<name>.<ext>` layout).
2. Add a `let <name>Buffer = null;` + `let <name>LoadPromise = null;` near the other audio state in `js/main.js`.
3. Add `get<Name>SoundUrl()` (probes `getGameAssetBaseCandidates()` + `pageDirFromLocation()` + raw fallback) and `ensure<Name>SoundBuffer()` (fetch + decode + cache + retry-on-failure).
4. Add a `play<Name>Sound()` that tries the cached buffer, falls back to `ensure<Name>SoundBuffer().then(...)`. Plays through `audioSfx` at a gain of ~0.9.

For gun-fire sounds specifically: the standard pattern is **inline base64 in the JS source** (see `_SMG_B64`, `_SHOTGUN_B64`, `_SNIPER_B64`, `_DIVINE_B64_LAZER`, `_AR_B64` near the top of `js/main.js`), decoded on first use. Inline-B64 was chosen over a separate fetch because these files are small (~5–10 KB) and bundled this way the game boots without any asset fetch at all.

After adding a SFX, re-run the `terser` minify step (see "FPS editing workflow" above) and commit the regenerated `main.min.js` alongside the source change.

## File / folder layout (FPS only)

```
games/fps/
  index.html          — page shell, CSS, cursor wiring (no inline JS)
  backup.html         — older snapshot, do not edit
  main.min.js         — deployed FPS gameplay (terser-built from js/main.js)
  js/
    main.js           — unminified FPS source (~18,400 lines)
    translation.js    — i18n (18 locales)
    socket.io.min.js  — local fallback for the Socket.IO CDN load
  images/             — background.png, button.png, modal-bg.png, walls.png,
                        mouse.png, mouse-hover.png (custom cursor layers, see
                        "Custom mouse cursor"), jimmyqrg.png, tintly555.png
  media/              — all SFX and BGM (ogg for short SFX, mp3 for BGM)
  svg/                — amr-scope.svg
```

## Commits and PRs

- One feature per commit when possible. The user has been doing a lot of small atomic commits; matching that style keeps `git diff` readable.
- **Uncommitted work is fragile.** The git reflog only tracks commits, not staged or unstaged work. If a change is in the working tree and the user asks to revert or reset, recover by re-applying the changes from the session's diff — never `git checkout -- <file>` or `git reset --hard` over uncommitted work without an explicit go-ahead, and always confirm what's uncommitted (`git status`, `git diff --stat`) before any destructive operation.
- The author info is `JQRG <165354267+JimmyQrg@users.noreply.github.com>` — don't change it.
- After a non-trivial change, verify with `git diff --stat` before committing. **Always sanity-check sizes** for the touched files (line counts or byte sizes) — a previous `ENOSPC` write left `index.html` at 0 bytes; `main.min.js` being smaller than expected after a partial write is the same class of bug. Useful references:
  - `wc -l games/fps/index.html` — should be ~3,200.
  - `wc -l games/fps/js/main.js` — should be ~18,400.
  - `wc -c games/fps/main.min.js` — should be ~290 KB; rebuild with `terser` if `js/main.js` changed and this didn't.
- **Commit `js/main.js` and `main.min.js` together.** A `main.min.js` older than `js/main.js` is a deploy bug.

## Pre-flight: things to check before editing

1. `wc -l games/fps/index.html` — should be ~3,200. Lower = truncated, stop and investigate.
2. `wc -l games/fps/js/main.js` — should be ~18,400. Lower = truncated, stop and investigate.
3. `git status` — confirm no unintended files staged, no in-progress edits.
4. `git diff --stat` — review what's actually changed vs committed.
5. If hard-refresh hasn't been done in a while, hard refresh or open incognito before testing changes — module imports cache aggressively.
6. For game-loop changes, scan the `animate()` body for new heavy per-frame work. Three.js raycasts against `wallMeshes` are O(N) in mesh count and the cost compounds at 32 enemies.

## Things that are NOT in this repo

- The multiplayer relay server. It lives at **github.com/indiamonda/chat** and powers 3 applications. The game client talks to it over Socket.IO; the client side can't read or fix relay bugs directly.
- Anything outside `/Users/Benran/Documents/GitHub/tintly555.github.io/`. If you can't `Read` it, you can't operate on it.

## Known sensitive file

`activate-minimax.sh` in the repo root contains a real API token committed in plaintext. This is outside the FPS game but is a security concern. Treat it as compromised — rotate the key and consider removing from git history.
