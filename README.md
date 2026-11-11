# my-games-site

Static GitHub Pages site hosting several browser games (`games/2048`, `games/fps`, `games/shooter`, `games/shooter2`, `games/territorial`). There is no build step: GitHub Pages serves the files as they are.

## FPS game (`games/fps/`)

The game is plain ES modules loaded straight from `games/fps/index.html`:

- **`games/fps/js/main.js`** is the game. `index.html` loads it directly (`<script type="module" src="js/main.js?v=…">`).
- **`games/fps/js/*.js`** holds the supporting modules (translations, world audio, gauntlet courses and obstacles, boss navigation, mission console, PVP layouts, cursor).
- **`games/fps/interface.css`** holds the UI skin; `index.html` holds the page shell and inline styles.

### Editing workflow

1. Edit the source files in `games/fps/` directly.
2. If you change a module, bump its `?v=` string in the file that imports it (`index.html` for `main.js`, `game-cursor.js` and `interface.css`; `js/main.js` for the other modules), so browsers don't serve the cached copy.
3. Preview locally:
   ```bash
   python3 -m http.server 8000
   # open http://localhost:8000/games/fps/
   ```
4. Commit the changed source files.

`games/fps/main.min.js` is an old minified build. No page loads it, so it does not need to be rebuilt or committed. If you want a fresh copy anyway:

```bash
npx terser games/fps/js/main.js --compress --mangle --module --output games/fps/main.min.js
```

See `CLAUDE.md` for the architecture notes used when working on the game with Claude Code.
