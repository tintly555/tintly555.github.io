# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A static GitHub Pages site at **https://tintly555.github.io/** that hosts several browser games. The repo root holds a hand-written `index.html` that links to each game in `games/<name>/index.html`. The games are `games/2048`, `games/fps`, `games/shooter`, `games/shooter2` and `games/territorial`. There is no package.json, no test runner, no linter and no CI build. Every game ships as static files that GitHub Pages serves directly.

**Live URL:** https://tintly555.github.io/games/fps/
**Branch:** `main` (publishes to GitHub Pages on push).

## Running locally

Serve the repo root with any static server and open the game in a browser:

```bash
# from repo root — serves on http://localhost:8000
python3 -m http.server 8000
# then open http://localhost:8000/games/fps/
```

Module files are cached aggressively. After edits, hard refresh (`⌘+Shift+R` / `Ctrl+Shift+R`) or use an incognito window. The page also loads `js/main.js` and `translation.js` with `?v=` query strings, so **bump the version string in the importing file** when you change a module (see "Cache-busting" below).

## The FPS game (`games/fps/`)

The main project. Files:

- `index.html` (~3,700 lines) is the page shell. It holds the inline `<style>` and the boot scripts, and loads `interface.css` and the modules below. It contains no gameplay code.
- `interface.css` holds the newer UI styles: the console-style skin for the achievements and settings modals, the menu, the gauntlet panels and the cursor rule.
- `js/main.js` (~23,900 lines) is the game. Almost all gameplay, rendering, UI wiring and audio lives here.
- `js/` also holds the modules listed under "Modules" below.
- `images/`, `media/`, `models/`, `svg/` hold assets.
- **`backup.html` is an older snapshot. Do not edit it.** If `index.html` looks half-edited after a botched write, check `git status` and `git diff` before assuming the working file is the truth.

**Build step: none.** `index.html` loads `js/main.js` directly as an ES module (`<script type="module" src="js/main.js?v=…">`). No page loads `games/fps/main.min.js`. The minified file is a leftover from an earlier build and is not used, so editing `js/main.js` is enough. Only rebuild it if the user asks for it:

```bash
npx terser games/fps/js/main.js --compress --mangle --module --output games/fps/main.min.js
```

### Modules

`index.html` and `js/main.js` load these files:

| File | What it does |
|---|---|
| `js/main.js` | Game, renderer, UI wiring, audio graph, weapons, enemies, maps, achievements. |
| `js/translation.js` | i18n. 17 locales (`en`, `zh`, `es`, `hi`, `ar`, `fr`, `pt`, `ru`, `ja`, `de`, `ko`, `it`, `nl`, `pl`, `tr`, `vi`, `id`). Loaded by a dynamic `import()` in `main.js`. |
| `js/game-cursor.js` | Decides when the game cursor is shown (see "Cursor"). |
| `js/world-audio.js` | `createWorldAudio()`: footsteps, zombie voices, distant gunfire, room reverb. |
| `js/gauntlet-courses.js` | Gauntlet chapter names and the course list (`extendGauntletCourses`). |
| `js/gauntlet-obstacles.js` | Gauntlet obstacle types (`makeGauntletObstacle`). |
| `js/gauntlet-runtime.js` | Gauntlet runtime (`createGauntletRuntime`): movers, fields, nodes, hazards. |
| `js/gauntlet-art.js` | Gauntlet obstacle art (`createGauntletArt`): the fields, nodes and hazards, built as real devices (fans, belts, jammers, ice). |
| `js/gauntlet-surfaces.js` | Procedural surface textures with normal maps (concrete, steel, grating, asphalt, ice, composite, hull, regolith, factory). |
| `js/gauntlet-path.js` | Free-form course geometry: `trace` (path with any turn and slope), `slabBoxes` (axis-aligned collision slabs that follow a ribbon), `createPathGeometry` (drawn ribbons, cut into ~14 m chunks), `Footprints` (keeps the course from crossing itself). |
| `js/gauntlet-legs.js` | Course layout: `lengthenSegs` stretches every authored course to ~5.8×, `composeLeg` invents the winding legs (bends, hairpins, spirals, climbs), `layoutSeg` lays a free segment onto the path. Deterministic per level. |
| `js/gauntlet-themes.js` | The ten chapter environments (`createGauntletThemes`): materials, lighting, fog, ground-level scenery, platform supports, hover decks. |
| `js/boss-navigation.js` | Boss pathing grid (`createBossNavigation`). |
| `js/boss-creature.js` | The boss: an armoured eight-legged creature (`createBossCreature`): rig, leg IK, claws, tail, poses per animation, hit table. |
| `js/boss-parts.js` | The creature's sculpted parts (`getBossParts`): body, plates, core, claws, legs, tail, stinger, each a signed-distance field meshed once and shared. |
| `js/boss-sculpt.js` | Sculpting toolkit: SDF shapes, smooth union, noise, and the surface-nets mesher (`meshField`) that bakes colour, occlusion and glow channels. |
| `js/mission-console.js` | Mission-select console in the menu (`createMissionConsole`). |
| `js/pvp-maps.js` | The four PVP maps and their build kit (`createPvpMaps`): `pvp-map-foundry.js` (CINDERWORKS, id `crossfire`), `pvp-map-station.js` (HALCYON RING, `crossfire_grid`), `pvp-map-ruins.js` (SUNKEN TEMPLE, `pvp_ruins`), `pvp-map-town.js` (DUSTFALL, `pvp_town`). |
| `js/pvp-nature.js` | Natural things for the PVP maps (`createNature`): sky and space shaders, PMREM environment, leaf-card trees/ferns/grass/vines/palms, soil, gravel, dirt, road, strata and shingle textures, rocks, buttes, skyline, cactus, water, glass, molten metal. |
| `js/pvp-world.js` | Moving platforms/doors and hurt/push/slow/float/launch zones for the PVP maps, on one shared wall-clock (`createPvpWorld`). |
| `js/post-fx.js` | Post-processing: bloom, grade, vignette, grain, anti-aliasing (`createPostFx`). |
| `js/socket.io.min.js` | Local fallback for the Socket.IO client (the CDN copy is loaded first). |

### Cache-busting

Every `?v=` string must change when its file changes, or browsers keep the old code:

- `index.html`: `<script type="module" src="js/main.js?v=…">` and `js/game-cursor.js?v=…` and `interface.css?v=…`.
- `js/main.js`: `import … from "./gauntlet-*.js?v=…"` (`gauntlet-runtime.js` imports `gauntlet-obstacles.js` and `gauntlet-art.js` with their own `?v=`), `./boss-navigation.js?v=…`, `./mission-console.js?v=…`, `./pvp-maps.js?v=…` (which imports the four `pvp-map-*.js` with their own `?v=`), `./pvp-world.js?v=…`, `./post-fx.js?v=…`, `./world-audio.js?v=…`, and the dynamic `import("./translation.js?v=…")`.

Use a new date-and-tag suffix (e.g. `20261111-hpbar-v1`) and keep the pairs consistent when you change them.

### Game architecture (high level)

- **Renderer:** Three.js r182 from jsDelivr (import map in `index.html`). The scene, camera, renderer and most geometry are built at boot.
- **Game loop:** `animate()` runs every frame. It computes `rawDelta = clock.getDelta()` and `dt = Math.min(rawDelta, 0.033)`, then runs input → player → weapon → footsteps → enemies → boss projectiles → tracers → effects → render. AI is gated on `gameWorldReady && controlsInputReady()`, so zombies stay still until the player clicks in.
- **Maps:** `CURRENT_MAP` (`let CURRENT_MAP = "arena"`) selects a builder from `MAP_BUILDERS`: `arena`, `boss_arena`, `crossfire`, `crossfire_grid`, `pvp_bright`, `training`, `gauntlet`. Mode predicates include `isArenaLikeMap`, `isBossArenaMap`, `isPvpCrossfireMap`, `isBrightIndoorMap`, `isTrainingMap` and `isGauntletMap`.
- **Maze (arena maps):** `buildMazeChunk()` builds the maze in chunks, merges the walls per chunk, and registers the walls in `wallMeshes` (used for line-of-sight rays) and `wallBoxes` (used for collision and sound).
- **Multiplayer:** Socket.IO client talking to the relay at `https://discord.jimmyqrg.com` (meta tag `game-multiplayer-origin`, overridable in Settings → SERVER). Offline mode uses `createOfflineSocketStub()`, which fakes rooms.
- **Achievements:** `ACHIEVEMENT_DEFS` (id, nameKey, hintKey, color, category, icon, secret), `achievementsUnlocked` (state), `renderAchievementsPanel()` and `showAchievementDetail()`. Categories render in this order: `combat`, `pvp`, `progression`, `secret`.
- **Unlock toast:** `#achToastWrap` at the top of the screen, 3-second auto-dismiss, queued when several unlock at once.

### i18n

`tr(key, fallback)` looks up the string for the current language. Missing keys return the English fallback, so **pass real English text as the second argument.** Add new strings to the `en` block in `js/translation.js` first; the other 16 locales fall back to English until translated.

### Menu-wall 3D scene (Experimental)

A Three.js scene behind the main menu shows a wall and a lamp. It is opt-in through "Animated background light visual" in Settings → GRAPHICS (default off). When off, the `.menu::before` pseudo-element (driven by `--game-ui-menu-bg`) is the background.

**Menu-wall audio reactivity (700 Hz band):**
- An `AnalyserNode` (`menuBgmAnalyser`) is created in `ensureMenuBgmAudio()`, tapped from the menu BGM after its gain node.
- `menuBgmFreqBuf` holds the frequency data. Bins above 700 Hz are ignored. The 700 Hz bin has the most weight, falling off linearly to its neighbours.
- Lamp intensity is `MENU_BACKDROP_LIGHT_FIXED * (1.0 + musicMul + baselineFlicker)`. `MENU_BACKDROP_LIGHT_FIXED` is `2.0`. `musicMul` is the weighted 700 Hz energy (0–1.5). `baselineFlicker` is a small always-on 0.5 Hz + 2.1 Hz + noise term, so the lamp moves when the music is silent.
- The band cutoff and weights are hard-coded in `updateMenuBackdropLightFromMusic()`.

### Lighting and fog

- **Punctual lights** use `createPhysicalPointLight` / `createPhysicalSpotLight`. Environment lights default to `ENVIRONMENT_LIGHT_DECAY = 3`. Player body light uses `PLAYER_BODY_LIGHT_DECAY = 3`.
- **Flashlight:** the flashlight spot lights are created with a literal decay of `2` (around `createPhysicalSpotLight(FLASH_COLOR, FLASH_POWER, FLASH_RANGE, FLASH_ANGLE, FLASH_PENUMBRA, 2)`). The constant `FLASHLIGHT_LIGHT_DECAY` is defined but not used. Change the literal, or use the constant, not both. `ensureTorchShadowMap()` (called from `applyGraphicsQuality()` and `rebuildMapAndEnemies()`) asks for one shadow refresh so the torch always has a shadow map: without it every lit material failed to draw and whole scenes (the gauntlet on POTATO, themed PVP maps) rendered invisible.
- **Maze ceiling lights** (`buildMazeChunk`, the `roof` and `area` light kinds) must sit **below the ceiling**, not against it. A decay-3 light only a few hundredths of a unit under the ceiling blows out the ceiling patch above it and leaves the walls in grazing-angle shade. The current code hangs them `0.9` below `MAZE_CEILING_LIGHT_Y`.
- **Fog:** `FAIR_PRESENTATION.fog` (`near: 12, far: 62`) is the base for most maps. `applySceneFogAndCameraFar()` picks the range per map: bright indoor and boss maps have their own, and the gauntlet has its own (`near` ~10, `far` ~52). It applies them through `setSceneFogVisibility()`. Colours come from `getMapEnvColors()`.
- **Fog on the post path:** three.js tone-maps and encodes a surface *before* it blends fog, so on the plain render (POTATO, post-processing off) fog mixes in display space and far walls sink into a deep haze. With post-processing the blend is in linear light and reads far thinner. The arena and boss fight keep the plain look on every tier: `setSceneFogVisibility()` decodes the fog colour (`** 2.2`) and multiplies the density by `sqrt(2.2)` while `fogDisplayLook` is on (`wantFogDisplayLook()`, re-checked in `renderWorld()`). Other maps (PVP skies, gauntlet) deliberately keep the linear blend so the fog meets the sky.
- **Texture detail off:** `makeWallMaterial()` builds the untextured wall as `tint × averageTextureColor(texture)`, so the toggle changes detail, not brightness. The photo wall texture is very dark (mean ~0.02 linear), so a flat pale colour here was several times too bright.
- **Gauntlet cloud deck:** `buildMapGauntlet()` adds three soft fog sheets below the lowest platform, and runs the tall masts down into them, so the course reads as high up and the drop never ends in a hard edge.

### Enemy HP bars

- Each zombie carries a `hpSprite` (canvas texture) built in its factory. Zombies use a 256×48 canvas. `drawEnemyHp(enemy)` redraws it whenever HP changes, using the canvas's own width and height.
- A zombie's bar is **hidden until the local player hits it**. The flag is `enemy.playerHit`, set in the local hit paths (the shot path in the weapon trace code and the knife path). The per-frame loop in `updateEnemies` sets `hpSprite.visible = enemy.isBoss || !!enemy.playerHit`. Respawn clears the flag.
- Training dummies and bosses are unaffected by this rule.
- Remote players' hits do not set the flag, so only the local player's attacks reveal a bar.

### Gauntlet

- **Course build:** `buildMapGauntlet()` assembles a course from the level spec (`GAUNTLET_LEVELS`). Hand-authored segments (`run`, `jump`, `room`, …) are built in `main.js`. `mechanic` segments are built by `createGauntletRuntime().build()` from the declarative pieces in `gauntlet-obstacles.js`.
- **Chapters are environments** (`gauntlet-themes.js`, `THEMES`, 20 levels each): 0 ashen city, 1 foundry, 2 switchyard, 3 frozen dam, 4 orbital relay, 5 causeway above a maze, 6 silo field, 7 alien outpost, 8 starship hangar, 9 weapon factory. A theme sets the surface materials per role (deck, room, beam, exit, wall), sky/fog colours and range (`fogNear`, `fogFar`, `camFar`), lighting multipliers, a `groundDepth`, a `support` mode, and a scenery function. `buildMapGauntlet()` themes every box it makes (`themed()` / `themedSolid()`, which also opt the mesh out of the `_texturedMeshes` texture pass).
- **Nothing floats.** After the course is built, `buildSupports()` holds every deck up by its chapter's method: `pier` (concrete piers with cap beams and braces), `steel` (H-columns), `pipe` (pipe legs), `hanger` (rods up to an overhead beam), or `hover` (thruster pods, with decks that sag when landed on and float back via `updateGauntletHover`). Moving decks ride guide rails held up at each end; ramps get columns at both ends. Scenery is built from `ctx.groundY` upward, never as a box around the course.
- **Adding a scenery piece:** use `Batch` (merges boxes/cylinders/beams into one mesh per material) and the helpers in `gauntlet-themes.js`; keep it clear of the course (|x| > ~18 for solid blocks).
- **Obstacle art:** every deck, door, field, node and hazard in `gauntlet-runtime.js` is drawn by `gauntlet-art.js`. Fields are shown by the device that causes them (updraft = a spinning fan under the platform with rising air streaks, wind/gust = fans, belt = a real conveyor, speed = maglev strip, dash lock = jammer masts with arcs, damage = heater plates, slick = ice). Do not draw zones as floating arrows or glowing volumes. Textures and the materials built from them are cached at module level and flagged `userData.shared`. Per-piece materials the runtime recolours (nodes, marks) must be fresh instances, never shared. `clearGauntletProps()` traverses children, so models built as parent + children are disposed correctly.
- **No glowing outlines:** platforms and fields have no emissive edge strips. Warnings (crumble, blink, memory tiles) are shown by swapping the deck material tint in `move()`.
- **Movement:** `STEP_UP` (0.32) lets walking and dashing climb ledges and slope treads; slopes are flights of invisible low treads under a wedge mesh (`ramp` pieces). Wall jump (`findWallJumpNormal`) works on any wall in every mode: a fresh jump press in the air next to a wall rises exactly as far as a normal jump and throws the player 7.5 away from the wall. Ice (`slick` fields) uses a very low grip so you carry momentum and slide. Dashes are capped at three in a row (`state.dashChain`) before the bar must refill.
- **Camera:** `camRig` / `updateCameraRig` give spring-damped kicks (`addCamKick`: jump, landing, wall jump, dash, hits, recoil) and a boss-slam `addQuake`, plus stride sway and a smoothed step-up. Add new events through those two functions.
- **Gunner zombies** carry a rifle on the right hand, aim while they have a line of sight, and recoil and flash on every shot (`enemy._shotAt` is stamped where the bullet is fired).
- **Portals** (`transitPortals`): each end is a gate whose opening shows the real view from the other end. `renderPortalViews()` (called just before the main render) renders a second camera, the player's camera shifted by the portal offset, into a per-portal render target; the portal shader samples it in screen space and refracts the rim. Crossing the opening from the front is a pure translation (`hooks.shift`), so the view stays continuous. `art.portals` / `runtime.portals` list the openings.
- **Feedback for every zone and hazard:** the runtime reports `zone({ heat, air })` each frame and fires signals (`launch`, `splash`, `portal`) and `explode(x, y, z)` for mines. `main.js` turns them into camera flutter, a heat vignette and sizzle, steam and splash puffs, an explosion with flash, smoke and quake (`spawnFx` / `updateTransientFx`), and sounds (`playNoiseSweep`, `playSubThump`). New hazards should come with this kind of feedback, not just damage.
- **Swinger (`rotor` hazard):** the rotating arm damages and also shoves the player along its sweep (`hooks.push`). Courses containing a `sweeper` do not require every checkpoint before the exit counts (`hasSwinger` in `updateGauntlet()`).
- **Clear-the-room doors:** every combat `room` gets a door (`addClearDoor`, `gauntletDoors`). It is a very wide, very tall slab, so jumping or flying around it is not possible, and it lifts only when every zombie tagged with that room (`enemy.gauntletRoom`) is dead (`updateGauntletDoors`). The HUD objective shows `CLEAR THE ROOM · n` while a door is locked.
- **Boss HP:** gauntlet bosses are set to 500 HP (5× a normal zombie) in every mode, including the base HP values used when the boss switches modes.
- **Fog:** the gauntlet uses a haze-coloured fog with the background set to the same colour (so there is no horizon line), plus a sea of soft cloud sprites below the course. Do not use flat gradient planes for fog; they read as rectangles.
- **Bullet holes:** `createBulletMark(point, normal, host)` parents each hole to the surface it hit, so it moves with platforms and vanishes with crumbled ones. `clearBulletMarks()` runs from `clearGauntletProps()` so holes never carry over between levels.

### Gauntlet course layout (winding courses)

- Every authored course (`GAUNTLET_LEVELS`) is stretched by `lengthenSegs()` into a course about 5–8× as long. Authored segments stay in order; invented **legs** (`{t:"leg"}`) are resolved while the course is built, because each leg must know what already exists (`composeLeg(rng, req, pen, footprints)`).
- The builder keeps a **pen** `{x, y, z, th, arc}`. `th` is the heading (0 = down -Z, positive turns right). Free segments (`run`, `beam`, `crawl`, `pads`, `steps`, `jump`, `dash`) follow the pen at any angle and slope through `layoutSeg()` + `freeDeck()` / `freeTunnel()`. Set pieces that are axis-aligned by nature (`room`, `mechanic`, `lift`, `shuttle`, start and exit pads) are built with the heading back at 0, offset sideways by `ox`, via `beginFixed()` / `endFixed()`. Legs always start and finish heading 0.
- **Drawing vs walking:** decks are smooth ribbon meshes (`gauntlet-path.js` `sweepChunks`, chunks of ~14 m so bullet rays can skip them) but collision is thin axis-aligned slabs (`slabBoxes`), cut along the dominant axis of travel and split into cells across a slope. Slabs go into `wallBoxes` and a coarse spatial grid (`indexGauntletBoxes`, `forEachNearbyWallBox`); boxes that move are flagged `dyn` and kept out of the grid. Never add a mesh to `wallMeshes` for a slab.
- **Progress** follows the course, not Z: `gauntletCourse.path` (a centreline sample about every metre), `updateGauntletProgress()`, `gauntletState.arc`. Checkpoints, tutorial hints, the HUD distance, void death and runtime section gating (`near()` in `gauntlet-runtime.js`, which also tests x and y) all use it. `runtime.build(segment, y, z, ox, arc)` takes the sideways offset and arc.
- **Footprints:** every deck and set piece registers circles; legs are rejected when they come within reach of anything at a similar height, and the next set piece (arena + door barrier) is checked ahead of time. The door barrier is only 64 m wider than its room, and the corridor through the door is kept free.
- **Supports and scenery** follow the ribbon (`buildSupports` takes `ribbons`; scenery gets `ctx.path`, `ctx.cx`, `ctx.wx`, `ctx.scatterX()`, `ctx.nearPath()`; `ctx.claim` is pre-filled with the course so nothing is built on it). Hover chapters sag one drawn chunk at a time (`gauntletHover` entries with `boxes`).
- **Low ceilings:** `lowCeilingAbove()` holds the crouch (dash included) while something solid is overhead, so standing up can never push the player into the roof, and the old "stand on whatever you are inside" fallback is never reached.
- **Walking down slopes:** the landing sweep lets a walking player follow the surface down up to `STEP_UP` (`_stickDown`) instead of hopping.
- **Testing:** open the game with `?debug=1` for `window.__zn` (`goto(arc)`, `course`, `progress`, `stats()`, `near()`, `collides()`, `unpause()`). Layout can be checked without a browser by importing `gauntlet-legs.js` in node (see how lengths and fallbacks are reported). A browser pane that is not fronted throttles `requestAnimationFrame` to ~1–2 FPS; select its tab before judging performance.

### Inventory icons

`renderWeaponIcons()` (right after `weaponModels` is built) renders every weapon, the med kit, knife and dart gun from its real model, side-on, on a throw-away offscreen renderer into `weaponIconCache`; `drawWeaponIcon()` draws from it and falls back to the old flat silhouettes until it exists. Slot canvases are drawn at `ICON_SCALE` (3×) and shown at 1×. Per-item poses are in `POSE`.

### PVP maps

- Four maps, each a module that builds through a kit (`kit.box` = collidable box with its base at y, `kit.deco` = scenery, `kit.stairs`, `kit.wallRun` with door/window holes, `kit.batch` for merged scenery) and a `world` for moving parts. The same build code makes the playable map (`buildPvpThemed`).
- The relay knows only the mode `"crossfire"` (and map ids `crossfire` / `crossfire_grid`); the other maps are named by the share-code suffix (`PVP_SHARE_TAGS`: `-G`, `-R`, `-T`), and `emitRoomRequest` sends the relay `"crossfire"` for them.
- Moving parts run on `Date.now()` so every client sees the lifts, doors, steam, ladle, boulders and train at the same point of their cycle without any messages. Zones only ever act on the local player. Do not add shootable switches or anything whose state would differ per client.
- Stairs: 0.3 per tread (the player auto-steps 0.32). A lift platform must be thinner than that or it cannot be stepped onto.
- **At most six point lights per map.** Every lit material compiles against every point light; past about eight the shader fails and lit surfaces vanish. `host.light` drops extras; use emissive meshes and sprites (the bloom pass makes them glow) instead.
- **The torch casts no shadow on the themed maps** (`flashlight.castShadow = false` in `buildPvpThemed`): its shadow map only exists once it has been lit, and until then every lit material that expects it fails to draw (the whole map renders black).
- **Realism (`pvp-nature.js`).** A map's `env.sky` adds a sky dome (`sky` for daylight, `space: true` for stars, a planet and a sun) and `scene.environment` cut from it (PMREM), so water, glass, metal and gold reflect something real. `env.shadow: <half extent>` makes the sun the game's `moon` light with a 2048 shadow map **baked once** (`moon.shadow.autoUpdate = false`): movers never cast shadows (`createPvpWorld().mover` turns it off), so nothing leaves a stale shadow. `kit.proxy(w, h, d, x, y, z)` is an invisible collision box under detailed scenery (a tree, a rock, a stele); `kit.masonry` dresses a solid core with courses of separate blocks; a hidden material (`material.visible = false`) on a collider lets a detailed model stand in for it while bullets and sight lines still hit the collider.
- **Clouds follow the graphics quality** (`host.tier()`: POTATO 0, REGULAR 1, HIGH 2, EXTREME 3; set each tick on the sky's `uTier`): none; a flat layer drifting overhead; and, on HIGH and EXTREME, real volumetric cloud raymarched in a shell round a curved earth (base 1.5 km, top 4.3 km), written from scratch in the sky shader after the Horizon Zero Dawn method. A weather map gathers clouds into clusters with clear sky between; Perlin-Worley builds the billows and Worley fbm erodes them (EXTREME); light is attenuated toward the sun (Beer), brightened at thin edges (powder), lifted by a multiple-scattering term and pushed forward toward the sun; distant cloud dissolves into the horizon haze. HIGH takes 15 steps and 3 light samples, EXTREME 28 and 5 with erosion. The wind drifts everything (30 m/s) on `uCT = t % 600`, and every drift is a whole number of texture tiles per 600 s so the clock wraps without a jump. One 64³ tileable noise texture (`cloudNoise3D`, R Perlin-Worley, G/B/A Worley) is built once. [`@takram/three-clouds`](https://www.npmjs.com/package/@takram/three-clouds) (MIT, with quality presets) is the library to look at for more, but it needs npm and a bundler. `look.cloud` is the coverage (0 = no clouds, as in the foundry). Do not put a backtick in a GLSL comment inside the shader template literals: it ends the string and the whole game fails to load.
- **Plants** (`windify`): every card bends about its base (weight = its `uv.y` within the atlas cell, lean grows with the square), wind arrives in travelling gusts, and on HIGH and EXTREME the player's *wake* (`wake`: the live position plus 7 recent ones, each decaying and ringing like a damped spring) shoves low plants aside so they swing back past upright and settle. REGULAR and up get wind (`host.quality()`). Foliage materials must stay `windify`'d; merged world-space geometry works because the shader reads `modelMatrix`.
- **Terrain:** `kit.ramp({ x, z, dir, length, w, h, material })` is a slope you walk up (invisible low treads for collision, one smooth wedge for the look); `kit.mound({ x, z, w, d, h, material, ramps: ["E", "W", "N", "S"], slope })` is a raised flat-topped bank with a slope up each listed side. Each tread stays under the 0.32 step-up. All four maps use them (earth banks round the temple, dunes and rock shelves in Dustfall, slag heaps in Cinderworks); check a new one against `spawns` and the existing colliders.
- **Tube winding:** `Mesher.tube` and `Mesher.sweep` must wind outward (they were inside-out once, so trunks and cacti showed only their inner faces).
- **Fire** is `N.fire` (crossed additive planes of animated noise flame, sparks, a flickering light), never a glow sprite: a sprite is depth-tested and gets cut off by whatever is above it. Anything you can see burning also needs a collider (`kit.proxy`).
- **Shader time must be small.** The shared clock is wall-clock seconds (~1.8e9), far past float precision: pass `t % 7200` into any shader uniform (the sky and `molten` do), or noise and scrolling turn into garbage.
- **Coplanar faces flash.** Two meshes whose faces share a plane z-fight; the usual causes were decoration flush with a collider's top (a cornice at the tier top, straps on a crate standing in a boardwalk, a bed 2 mm over the ground). Keep decoration at least 1–2 cm off a collider's face and put props on top of what they stand on (`lift()` in `pvp-map-town.js`). To find them, walk every horizontal and vertical triangle of the scene in `?debug=1` and report overlapping same-plane pairs from different meshes (ignore faces at y = 0 facing down).
- **Do not turn depth testing off on the sky dome.** It is drawn first with `renderOrder` -1000, but with `depthTest: false` it painted over everything past about 25 m (whole maps went sliced and hazy). Its vertex shader pins it to the far plane (`.xyww`) so the default depth test is right.
- Foliage is alpha-tested leaf cards on real branches, merged into a few meshes per map with wind in the vertex shader (`windTime`, driven from the map's tick). Card winding is flipped so the side facing out of a clump is the front (double-sided faces flip the normal, which would light half of them backwards). Water is a physical-looking `MeshStandardMaterial` whose alpha follows fresnel (clear looking down, a mirror across), over a gravel bed with scrolling caustics.
- **Map-select covers are still images** (`images/maps/<map id>.jpg`, 880×520, used by the `.pvp-map-cover` `<img>`s in `index.html`); nothing is rendered live in the menu. A map build takes 0.3–0.9 s the first time (textures), which is why they are not drawn in real time. To remake a cover after changing a map: open the game with `?debug=1`, enter the map, `__zn.setPost(true)`, `__zn.tp(x, y, z, yaw, pitch)` to a good view, wait a few seconds, then `__zn.capture(1320, 780)` returns a clean JPEG data URL (no HUD, no weapon); save it, resize to 880 wide (`sips -Z 880`) and overwrite the file.
- A map's `env` gives its sky and fog, hemisphere/ambient/sun lights and post-processing `look`; `spawns` must not collide (check with `?debug=1`: `__zn.spawns.filter(([x, z]) => __zn.collidesAt(x, 0, z))`).

### Post-processing, jet harness, traps

- `renderWorld()` renders through `createPostFx` (bloom, tint/saturation/contrast, vignette, lens fringing, grain, FXAA, a red edge when hurt, fringing on dashes) unless Settings → Graphics → Post-processing is off or quality is POTATO; `POST_LOOKS` has one look per gauntlet chapter, PVP maps carry their own.
- **Low steps from level ground:** the floor branch of `updatePlayer` used to snap the body back to y = 0 before the support sweep could see a 0.3 tread, so the first step of any stair on the ground had to be jumped. It now lifts onto any support within `STEP_UP` first (`_stepUpFromFloor`).
- **Med kit:** while a heal is in progress (`isMedKitHoldHealing()`) the player may only walk, at two thirds speed. Jump, crouch, dash, weapon switches (`setWeapon`), the needle and the harness are refused.
- Jet harness: once strapped on, hold Space to climb, Ctrl to sink, release to hover; dash still bursts. Thrust drains the flight window, hovering drains it slowly, standing on something does not. Thrust spawns flame sprites and a hiss.
- Gauntlet traps hurt zombies too: runtime hooks `bodies()` / `hurtBody()` feed lasers, rotors, darts, chasers, heat fields and mines; `hurtEnemyByTrap()` applies the damage with the same flinch, bar and death as a bullet.
- Pickups carry a floating tag saying what they are (`NODE_TAGS` in `gauntlet-art.js`) and pickup feedback (`showGauntletNotice`, the heat-shield timer). The exit counts as soon as you reach it: no checkpoint is required.

### The boss (a creature, not a person)

- **Model:** `boss-creature.js` + `boss-parts.js` + `boss-sculpt.js`. Nothing is a primitive mesh: each part is a signed-distance field (smooth-blended tapered cones and blobs, plate seams cut across it, spines grown out of it, noise pitting), meshed with surface nets into one geometry with vertex colour (baked occlusion and wear) and three glow channels (eyes, veins, core) driven by uniforms. Parts are built once (~1 s, at first boss spawn) and shared; to change a shape edit its field in `boss-parts.js` and bump the `?v=` on the imports. `tools/boss-preview.html` shows the creature on its own (`?hell=1`, `?anim=…`; `window.bp.shot(anim, t, camera)` renders a headless still).
- **Rig:** the creature is 1.2× (hell 1.5×) a 7 m long body; legs plant in the world and step when the body carries a foot too far (two-bone IK per leg, tetrapod gait); claws and tail are nested FK groups posed per animation in `evaluate()`. The albedo is scaled down at the material (`tint`): the vertex colours are painted at display brightness.
- **Fight (`updateCreatureBoss` in `main.js`):** stalk, then by range and cooldown: claw strike, ground slam (hurts anyone still on the floor: jump), **charge** (red lane on the floor, straight rush, cannot turn; hitting a wall or pillar **stuns** it for 3 s / hell 2.3 s with the armour split open and double damage via `bossArmorMul`), tail lob (lobbed ball on a gravity arc, not homing; hell throws a fan of three). Tuning is `BOSS_TUNING`, health `BOSS_HP` (one pool, no mode switching). Below half health cooldowns shrink. States are the strings in `bossAnimState` (`idle, attacking, quaking, rangedAttack, summoning, chargeWind, charging, skid, stunned`) and sync to joining clients as before.
- **Integration:** the creature carries `bossHitTable` (groups of its skeleton, zones: core and stinger are `head`, legs `leg`), read by `bossHitAlongRay`. Collision radius is `BOSS_RADIUS * scale * 0.9`; the pathing grid keeps `BOSS_NAV_RADIUS` clear of walls. The heat-exchanger units on the arena walls have invisible colliders (`combat-environments.js`), so players and the boss cannot walk into them.
- **Fireballs explode** (`detonateBossBall`): on a wall or pillar (at the real contact point, found by bisecting the move against the wall boxes, on the face it hit), on the floor, on a player, or when a bullet shoots it down (a timeout just fizzles). The blast (`spawnBossBlast`: flash, shock ring on the surface, fire and smoke puffs, embers, a light flash, camera shake, a distance-scaled boom, and a scorch decal that cools from orange to black) hurts everyone inside 3.4 m (hell 4.2 m) with a falloff (full inside 1 m, 30% at the edge), unless a wall is between (cover works), and pushes the player off the point. `__zn.ball(...)` / `__zn.fx()` test it.
- **Never add or remove a light mid-game, and never let a first-time shader compile happen mid-fight.** Changing the number of lights in a scene recompiles every lit shader (measured: 1.3 s with a small scene, several seconds with a hell fight), and every new material kind compiles the first time it is drawn (a charge lane: 1.8 s; summoned zombies: 2.1 s). The boss effects therefore use a **fixed pool of four lights** made at boss spawn (`ensureBossFxLights`, removed only in `clearMap`), and `prewarmBossFight()` (called from `bootGame` before the world goes live) puts a fireball, a blast, the ground warnings and one of each summonable zombie in front of the camera and renders one real frame, so every shader, including the shadow-pass ones that `renderer.compile` skips, is built while the loading screen is up. Anything new that appears mid-fight (a new effect or material) must be added to that prewarm.
- **Triangle budget:** the creature is ~85k triangles (it was 208k). The mesh `cell` sizes in `getBossParts` set it; plates do not cast shadows. Check `renderer.info.render.triangles` with the boss visible and hidden before making parts finer.
- **Collision is a footprint, not a circle:** `BOSS_FOOTPRINT` is 15 circles over the head, body, legs and claws that turn with the creature (`bossBlockedAt`), tested against wall boxes only, from 0.45 m up so a gauntlet deck under it is not an obstacle. It cannot turn into a wall (the turn is halved or held), and if it is pinned (no progress while stalking) it crab-walks along a clear direction (`_escapeDir`). `__zn.bossBlocked(x, z, yaw)` tests it; a 300 s fight with a player circling walls and pillars shows no overlap and no stall over 2 s.
- **Debug:** with `?debug=1`, `__zn.sim(seconds)` steps the enemy simulation without frames, and `__zn.enemyHit(ox,oy,oz,dx,dy,dz)` reports the zone a ray hits.
- The old humanoid boss builders (`makeProceduralHormoneZombie`, the authored-rig boss path and its animation block) are still in `main.js` but unused.

### Zombie damage and line of sight

Zombie attacks choose their target with a line-of-sight check, but damage can land later (fast strike ~440 ms, boss smash ~0.55 s, gunner tracer). **Every zombie hit goes through `applyCoopZombieDamageToTarget(enemy)`**, which re-checks line of sight with `clearLosToTarget()` at the moment of impact. Do not call `damagePlayer()` from a zombie directly. Boss impacts (`applyBossImpact`) use `soundBlocked()` for the same purpose.

### Cursor

The game cursor is the **browser's own cursor**, drawn with CSS.

- `js/game-cursor.js` only toggles `html.game-pointer-painted`. The class is on when the pointer is over the page, pointer lock is off, the page is visible, and the target is not a text field (text fields keep the I-beam).
- `interface.css` sets `cursor: image-set(url("images/cursor-1x.png") 1x, url("images/cursor-2x.png") 2x) 0 0, default !important` on `html.game-pointer-painted *`. Interactive elements (`button`, `a[href]`, `select`, `summary`, `[role='button']`, `input[type='range']`) switch to the `cursor-hover-*.png` images under `:hover`.
- The PNGs are 23×42 and 46×84 (the 2× image). They were resized from `images/mouse.png` and `images/mouse-hover.png` (35×64) with `sips`. Keep the 1× and 2× files in step if you change the artwork.
- Do not add a DOM element that follows the mouse. It lags, and it is what the user asked us to remove.

### View-model guns (`makeWeaponModel`)

Guns are built procedurally with a gun kit placed right above `makeWeaponModel()` in `js/main.js`: `gunProfile` (side silhouette extruded across X with a bevel), `gunTube` / `gunLathe` / `gunPin` / `gunSegment` for round parts, `gunRail`, `gunSlot`, `gunBox`, and `GunKit`, which merges parts into one mesh per (parent group, material). Textures come from `getGunSurfaces()` and are procedural canvases. Geometry UVs are in metres. Conventions: +X right, +Y up, muzzle toward −Z.

- **ADS:** do not hand-tune `adsOffset`. Call `adsForSight(basePos, sightY, z)` with the height where the rear and front sight tops sit (both at x = 0).
- **Hands:** the right hand uses `VIEW_HAND_GRIPS[type]` (grip centre, `ga`/`gb` half-size, `rRot` rake). Long guns also call `attachSupportHand`, which hides while the reload hand is visible.
- **Moving parts:** put parts that animate (slide, bolt, pump, mag) in their own group before `kit.flush()`, and register them on `root.userData` (`animSlide`, `animBolt`, `animPump`, `animMag` via `attachMagGroup`).
- **Stocks:** parts in `stockGrp` (`root.userData.adsHideStock`) hide once ADS passes mid-way.
- **Third-person guns** (`makeThirdPersonGun`) reuse the same models through `makeWeaponModel(type, { noHands: true })`, placed by `TP_GUN_FIT`.
- **Weapon table:** the `weapons` array (search `const weapons = [`) is the source of truth for names, fire rates and damage. Hotbar keys map through `LOADOUT_SLOT_KEYS`.

### Critical: the `dt` cap

`animate()` computes `dt = Math.min(rawDelta, 0.033)`, so the simulation slows below ~30 fps. **Any game timer driven by accumulated `dt` stretches under load.** A "8-second" cooldown takes ~24 s at 10 fps.

**Pattern for new timers:** store a `performance.now()` start time and compare wall-clock milliseconds each frame. Do not accumulate `dt`. See `state.medKitHealStartMs` (set when the med kit starts, compared in the per-frame update).

### Critical: audio routing (two parallel graphs)

1. **Web Audio graph (synthesized and generated sounds):**
   ```
   audioSfx  ──┐
   audioMusic ─┼─→ audioMaster ──→ destination
   ```
   - Gunfire, knife, dash and similar effects → `audioSfx`.
   - Generated tones (e.g. the arena hum) → `audioMusic`.
   - Volume comes from `audioMaster.gain.value`, set by `applyAudioVolumes()`.
   - Footsteps, zombie voices and distant gunfire are made by `createWorldAudio()` in `js/world-audio.js` and played through `audioSfx`.

2. **HTML `<audio>` elements (BGM and some recorded SFX):** each per-mode `*BgmAudio` (`menuBgmAudio`, `arenaBgmAudio`, `pvpBgmAudio`, `bossBgmAudio`) and the inline base64 fire sounds are `new Audio()`. **They bypass the Web Audio graph.** Volume is set per element through `.volume`.

**Implication:** the music slider changes `audioMusic.gain.value` but does **not** silence the BGM elements. `applyAudioVolumes()` syncs each element's `.volume`. Extend it whenever you add a BGM element. Forgetting this is a known bug class.

**Footsteps (`createWorldAudio().step`)** alternate left and right by travel distance. Each step plays one of four synthesized variants (`makeSample`), with a heel strike and a toe-off about 0.11 s later. Steel-floor steps in the gauntlet use `"steelStep"` (adds a metallic ring). Each step has a small random level change. Tune the feel in `makeSample()` and `step()`.

### Adding sound effects (the standard pattern)

Short recorded SFX use fetch + `decodeAudioData` + a cached `BufferSource` (see `getFlashlightSoundUrl` / `ensureFlashlightSoundBuffer` / `playFlashlightToggleSound`, or `getMedpackSoundUrl` / `ensureMedpackSwitchBuffer`):

1. Put the file in `media/`.
2. Add `let <name>Buffer = null;` and `let <name>LoadPromise = null;` near the other audio state in `js/main.js`.
3. Add `get<Name>SoundUrl()` (probes `getGameAssetBaseCandidates()` and `pageDirFromLocation()`, with a raw fallback) and `ensure<Name>SoundBuffer()` (fetch, decode, cache, retry on failure).
4. Add `play<Name>Sound()`, which uses the cached buffer and otherwise waits on `ensure<Name>SoundBuffer()`. Route it through `audioSfx` at a gain of about 0.9.

Gunfire uses **inline base64** in the JS source (`_SMG_B64`, `_SHOTGUN_B64`, `_SNIPER_B64`, `_AR_B64`, `_DIVINE_B64_LAZER` near the top of `js/main.js`), decoded on first use. The files are small, so the game boots with no asset fetch. Synthesized sounds such as footsteps and voices need no file at all.

### State persistence (`localStorage`)

- `fpsGameSettingsV1` (`SETTINGS_STORAGE_KEY`): volumes, quality, language, look sensitivity, hotbar order, server config and similar. Read by `loadGameSettings()`, written by `saveGameSettings()`, which serialises the whole `gameSettings` object. A new field needs a default in the `let gameSettings = {…}` initialiser and a `typeof` check in `loadGameSettings()`. Call `saveGameSettings()` after each change.
- `fps_unlocks` (`UNLOCK_STORAGE_KEY`): weapon unlocks, achievement progress, equipped achievements, kill counts. Read by `loadUnlocks()`, written by `persistUnlocks()`.
- Gauntlet progress and best times are saved separately (`saveGauntletProgress`).

### Server config (Settings → SERVER tab)

`getMultiplayerOrigin()` picks the relay in this order:
1. **Manual:** `gameSettings.serverManualUrl` when `serverMode === "manual"` (must be `http://` or `https://`).
2. **Local:** `gameSettings.serverLocalUrl` when `serverMode === "local"`. The local scan tries `localhost` ports with `fetch(…, { mode: "no-cors" })` and a 1.2 s timeout, and lists the ports that answer.
3. **Default:** the `game-multiplayer-origin` meta tag (`https://discord.jimmyqrg.com`).
4. **Fallback:** `window.location.origin`.

The socket connects once, at boot, so changes apply only after a reload. The "Save & reload" button does the reload. To add a source, extend `getMultiplayerOrigin()` and add a matching subpanel in the SERVER section (search `settingsSectionServer`).

## File / folder layout (FPS only)

```
games/fps/
  index.html            — page shell, inline boot scripts and styles, module tags
  interface.css         — console-style UI skin, menu, achievements, gauntlet, cursor rule
  backup.html           — older snapshot, do not edit
  main.min.js           — old build; not loaded by any page
  js/
    main.js             — the game (~23,900 lines)
    translation.js      — i18n (17 locales)
    game-cursor.js      — game cursor on/off
    world-audio.js      — footsteps, voices, distant gunfire
    gauntlet-*.js       — gauntlet courses, obstacles, runtime
    boss-navigation.js  — boss pathing grid
    mission-console.js  — menu mission console
    pvp-maps.js + pvp-map-*.js, pvp-nature.js, pvp-world.js — the four PVP maps, foliage/water/sky and moving parts
    post-fx.js          — post-processing
    socket.io.min.js    — local Socket.IO fallback
  images/               — background, button, modal and wall art; cursor-1x/2x and
                          cursor-hover-1x/2x (game cursor); logo.svg (the game's emblem, white on transparent: menu
                          title and the brand button mask), icon.svg (favicon: the emblem on a dark tile);
                          jimmyqrg.png, tintly555.png;
                          maps/ (the four PVP map-select covers)
  media/                — SFX (ogg) and BGM (mp3)
  models/               — model assets
  svg/                  — amr-scope.svg
```

## Commits and PRs

- One feature per commit when possible. The user has been doing lots of small atomic commits; match that style so `git diff` stays readable.
- Do not commit unless the user asks.
- **Uncommitted work is fragile.** Git's reflog tracks only commits, not staged or unstaged work. Never run `git checkout -- <file>` or `git reset --hard` over uncommitted work without an explicit go-ahead. Confirm what is uncommitted (`git status`, `git diff --stat`) before any destructive command.
- Keep the author as `JQRG <165354267+JimmyQrg@users.noreply.github.com>`. Do not change it.
- `main.min.js` is not loaded by any page, so commits do not need it. If it is rebuilt, rebuild it in the same commit as `js/main.js`.

## Pre-flight: before editing

1. `wc -l games/fps/index.html` — about 3,700. Much lower means a truncated write. Stop and investigate.
2. `wc -l games/fps/js/main.js` — about 23,900. Much lower means a truncated write. Stop and investigate.
3. `git status` and `git diff --stat` — see what is already changed before you add anything.
4. Bump the `?v=` strings for any module you change (see "Cache-busting").
5. Hard-refresh or use incognito before testing; module imports cache aggressively.
6. For game-loop changes, scan `animate()` for new per-frame work. Three.js raycasts against `wallMeshes` cost O(N) in mesh count, and the cost multiplies with the zombie count.
7. Check syntax after editing: `node --check games/fps/js/main.js` (and the module you changed).

## Things that are NOT in this repo

- **The multiplayer relay server.** It lives at **github.com/indiamonda/chat** and serves several applications. The client talks to it over Socket.IO and cannot fix relay bugs.
- **Anything outside `/Users/Benran/Documents/GitHub/tintly555.github.io/`.** If you cannot read it, you cannot operate on it.

## Secrets

An earlier `activate-minimax.sh` with a plaintext API token is no longer in the working tree. Do not add it back. If it turns up in git history, treat that token as compromised and rotate it.
