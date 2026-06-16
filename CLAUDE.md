# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A static GitHub Pages site at **https://tintly555.github.io/** that hosts several browser games. The repo root is just a hand-written index.html that links to each game in `games/<name>/index.html`. There is no build system, no package.json, no tests, no linter — every game is a single self-contained HTML file (with assets beside it).

**Live URL:** https://tintly555.github.io/games/fps/
**Branch:** `main` (publishes to GitHub Pages on push).

## Running locally

There is no build step. To preview a game, serve the directory with any static server and open it in a browser:

```bash
# from repo root — serves on http://localhost:8000
python3 -m http.server 8000
# then open http://localhost:8000/games/fps/
```

Hard refresh (`⌘+Shift+R` / `Ctrl+Shift+R`) after edits — browsers cache `translation.js` and other module imports aggressively, and the FPS game loads i18n via a dynamic `import()`. Incognito is the fastest way to bypass cache.

## The FPS game (`games/fps/`)

The main project. One ~1.6 MB `index.html` plus the assets in `images/`, `js/`, `media/`, `svg/`. **There is also a `backup.html`** in this directory that snapshots older versions — if the live `index.html` is in a half-edited state after a botched write, the most recent committed `index.html` is in git, and `backup.html` may have additional pre-commit state. Always verify with `git status` and `git diff` before assuming the working file is the truth.

### Game architecture (high level)

- **One file, 19,000+ lines, no modules.** All JS lives inside one `<script type="module">` block. CSS is in one `<style>` block in `<head>`. There is no build-time bundler.
- **Three.js** is the renderer. The scene, camera, renderer, and most geometry are constructed at boot.
- **Game loop:** `animate()` (search for it) runs `requestAnimationFrame`. Per-tick: input → player update → weapon update → med-kit → enemies → boss projectiles → tracers → effects → render. AI tick is gated on `gameWorldReady && controlsInputReady()` — zombies don't move until the player has clicked to enter the world.
- **Modes (driven by `CURRENT_MAP`):** `"arena"` (PVE / co-op), `"boss_arena"` (PVE / boss), `"crossfire"`, `"crossfire_grid"`, `"pvp_bright"` (PVP), `"training"`. Mode predicates (`isArenaLikeMap`, `isBossArenaMap`, `isPvpCrossfireMap`, etc.) live near the top of the script body.
- **Per-mode BGM** mirrors the same pattern: a `*BgmAudio` `<audio>` element, a `get*BgmUrlCandidates()` URL builder, an `ensure*BgmAudio()` lazy loader, a `shouldPlay*Bgm()` predicate, a `tryPlay*Bgm()` entry. Files live in `media/`. The boot trigger at the end of the script picks exactly one BGM via an if/else if chain.
- **Multiplayer** uses Socket.IO client (CDN) talking to a separate relay server at `https://chat.jimmyqrg.com` (configured via the `game-multiplayer-origin` meta tag, **overridable at runtime** by the SERVER tab in Settings — see "Server config" below). Offline mode falls back to `createOfflineSocketStub()` which synthesizes fake rooms.
- **i18n** lives in `js/translation.js` (18 language blocks). `tr(key, fallback)` resolves via `translateGame(lang, key, fallback)`; missing keys fall back to the second argument, which is always English text. **Add new strings by editing the EN block in `translation.js` first**; the other 17 locales fall back to English automatically until translated.
- **Achievement system** is in-script: `ACHIEVEMENT_DEFS` (id, nameKey, hintKey, color, category, icon, secret), `achievementsUnlocked` (state), `renderAchievementsPanel` (DOM), `showAchievementDetail`. UI lives in the `achievementsModal` (mirrors the `settingsModal`).
- **In-game unlock toast** lives in `#achToastWrap` at the top of the screen, 3-second auto-dismiss, queued if multiple unlock in quick succession.

### State persistence (`localStorage`)

Two keys:
- `fpsGameSettingsV1` (`SETTINGS_STORAGE_KEY`) — volumes, quality, language, look-sens, hotbar slot order, server config, etc. Read by `loadGameSettings()`, written by `saveGameSettings()` (which JSON-serializes the whole `gameSettings` object, so adding a new field is automatic).
- `fps_unlocks` (`UNLOCK_STORAGE_KEY`) — weapon unlocks, achievement progress, equipped achievements, total kill count, boss kill count. Read by `loadUnlocks()`, written by `persistUnlocks()`.

Adding a new persistent setting: add the field to the `gameSettings = {...}` initializer (search `let gameSettings = {`), add a `typeof o.foo === "..."` line in `loadGameSettings()`. `saveGameSettings()` needs no change. Use `saveGameSettings()` after every mutation.

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
2. Add a `let <name>Buffer = null;` + `let <name>LoadPromise = null;` near the other audio state.
3. Add `get<Name>SoundUrl()` (probes `getGameAssetBaseCandidates()` + `pageDirFromLocation()` + raw fallback) and `ensure<Name>SoundBuffer()` (fetch + decode + cache + retry-on-failure).
4. Add a `play<Name>Sound()` that tries the cached buffer, falls back to `ensure<Name>SoundBuffer().then(...)`. Plays through `audioSfx` at a gain of ~0.9.

## File / folder layout (FPS only)

```
games/fps/
  index.html          — the game (everything inlined)
  backup.html         — older snapshot, do not edit
  images/             — background.png, button.png, modal-bg.png, walls.png, mouse.png
  media/              — all SFX and BGM (ogg for short SFX, mp3 for BGM)
  svg/                — amr-scope.svg
  js/                 — socket.io.min.js (fallback), translation.js (i18n)
```

## Commits and PRs

- One feature per commit when possible. The user has been doing a lot of small atomic commits; matching that style keeps `git diff` readable.
- The author info is `JQRG <165354267+JimmyQrg@users.noreply.github.com>` — don't change it.
- After a non-trivial change, verify with `git diff --stat` before committing and `wc -l games/fps/index.html` to confirm the file isn't truncated (a previous `ENOSPC` write left it at 0 bytes — always sanity-check size before pushing).

## Things that are NOT in this repo

- The multiplayer relay server. It lives at **github.com/indiamonda/chat** and powers 3 applications. The game client talks to it over Socket.IO; the client side can't read or fix relay bugs directly.
- Anything outside `/Users/Benran/Documents/GitHub/tintly555.github.io/`. If you can't `Read` it, you can't operate on it.
