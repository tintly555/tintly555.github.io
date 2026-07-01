# my-games-site

Static GitHub Pages site hosting several browser games.

## Game script workflow (FPS game)

The FPS game (`games/fps/`) ships its main JavaScript as a single minified file:

- **`games/fps/main.min.js`** — the deployed build that `index.html` loads directly.

### Editing workflow

The unminified source lives outside this repo. To edit:

1. Edit the unminified source in your local working copy.
2. Re-minify to `games/fps/main.min.js`:
   ```bash
   terser <source> --compress --mangle --module --output games/fps/main.min.js
   ```
3. Commit only `games/fps/main.min.js` (the deployed build).

`index.html` always loads `main.min.js` — do not edit the minified file by hand.

### Why a single file?

- The deployed `main.min.js` is ~3× smaller than the unminified source — faster to parse, faster first paint.
- The repo only carries the build, so GitHub Pages serves it directly with no build step on deploy.

### When to minify

- Every time you change the source and intend to commit.
- The minified file should always be in sync with the source — never ship a `main.min.js` that's older than the source.
</content>
</invoke>