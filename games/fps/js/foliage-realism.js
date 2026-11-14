/**
 * foliage-realism.js — makes the PVP leaf/ground foliage read as real leaves on HIGH and EXTREME,
 * without touching how it looks on POTATO or REGULAR, and without changing the brightness or
 * visibility of anything that is not foliage (the fairness rule in CLAUDE.md).
 *
 * The flat, cut-out look of the base material (a plain MeshStandardMaterial with a soft painted
 * atlas) comes from four things: every card is lit perfectly flat, the sun never shows through the
 * leaf, the two faces of a card are identical, and the colour is one flat tint per card. This module
 * injects into the material's shader (composing with whatever onBeforeCompile the caller already set,
 * e.g. windify) to add, scaled by a `fidelity` uniform so REGULAR is byte-for-byte unchanged:
 *
 *   - normal detail from the painted albedo (veins and leaf edges catch the light),
 *   - a gentle cross-card curl so a card is never a perfectly flat mirror,
 *   - subsurface translucency: the sun glows through a leaf when you look toward it,
 *   - a paler, softer, less shiny underside (back faces),
 *   - a soft waxy specular sheen on the top surface,
 *   - per-card and within-card colour variation (warmer tips, cooler shaded bases, hue drift).
 *
 * `fx` is a shared object built by createNature: { fidelity:{value}, sunDir:{value:Vector3},
 * sunColor:{value:Color} }. The map's per-frame tick sets fidelity from host.tier()
 * (POTATO 0, REGULAR 1, HIGH 2, EXTREME 3) and copies the live sun direction/colour from the sky.
 */
export function makeFoliageFx(THREE) {
  return {
    fidelity: { value: 0 },
    sunDir: { value: new THREE.Vector3(0.35, 0.82, 0.45).normalize() },
    sunColor: { value: new THREE.Color(1.0, 0.95, 0.84) },
  };
}

/**
 * Compose realism into a foliage material. Call AFTER windify so the existing vertex onBeforeCompile
 * is preserved. `opts.cellRows` matches windify's (2 for the broadleaf atlas, 1 for the fern/grass
 * atlas); `opts.kind` is "leaf" or "ground" and only tunes constants. Returns the same material.
 */
export function enhanceFoliage(material, THREE, fx, opts = {}) {
  const cellRows = opts.cellRows || 1;
  const cellCols = opts.cellCols || cellRows;        // broadleaf atlas is 2x2, fern/grass is 2x1
  const kind = opts.kind || "leaf";
  const transScale = (opts.transScale != null ? opts.transScale : (kind === "ground" ? 0.9 : 1.15)).toFixed(3);
  const bumpScale = (opts.bumpScale != null ? opts.bumpScale : (kind === "ground" ? 0.55 : 0.7)).toFixed(3);

  material.userData = material.userData || {};
  material.userData.foliageFx = fx;                 // handle for debugging / A-B toggling
  const prev = material.onBeforeCompile ? material.onBeforeCompile.bind(material) : null;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);               // keep windify's vertex displacement
    shader.uniforms.uFidelity = fx.fidelity;
    shader.uniforms.uLeafSun = fx.sunDir;
    shader.uniforms.uLeafSunColor = fx.sunColor;

    // ── Vertex: carry a stable per-card seed and the within-cell coords to the fragment stage. ──
    let vs = shader.vertexShader;
    vs = vs.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vFoliageWPos;
       varying vec3 vFoliageWN;
       varying float vFoliageSeed;
       varying vec2 vFoliageCell;`
    );
    // Emit after the world position is known. windify already computes a `wp`; recompute our own from
    // the final `transformed` so it is independent of chunk order, then hash it into a per-card seed.
    vs = vs.replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       {
         vec3 fwp = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vFoliageWPos = fwp;
         vFoliageWN = normalize(mat3(modelMatrix) * normal);   // world-space leaf normal, for sun/sky self-shadow
         vec3 q = floor(fwp * 1.7);                             // per-card seed (~0.6 m)
         vFoliageSeed = fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
         vFoliageCell = vec2(fract(uv.x * ${cellCols.toFixed(1)}), fract(uv.y * ${cellRows.toFixed(1)}));
       }`
    );
    shader.vertexShader = vs;

    // ── Fragment: declarations + the realism passes. ──
    let fs = shader.fragmentShader;
    fs = fs.replace(
      "#include <common>",
      `#include <common>
       uniform float uFidelity;
       uniform vec3 uLeafSun;
       uniform vec3 uLeafSunColor;
       varying vec3 vFoliageWPos;
       varying vec3 vFoliageWN;
       varying float vFoliageSeed;
       varying vec2 vFoliageCell;`
    );

    // Colour variation: done right after the albedo is sampled, before lighting. Warmer, brighter
    // tips (high within-cell v); cooler, darker toward the stem; a per-card hue/value drift so no two
    // leaves read the same. All folded through `realism` so REGULAR keeps the original colour exactly.
    fs = fs.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       float fRealism = smoothstep(1.5, 2.0, uFidelity);     // 0 at REGULAR, 1 at HIGH
       float fExtreme = smoothstep(2.0, 3.0, uFidelity);     // 0 at HIGH, 1 at EXTREME
       {
         float cs = vFoliageSeed;                                           // per-leaf-card
         float clump = fract(sin(dot(floor(vFoliageWPos * 0.22), vec3(12.99, 78.23, 37.72))) * 43758.5453);  // ~4.5 m clump
         float tip = clamp(vFoliageCell.y, 0.0, 1.0);
         // Lightness: per-leaf and per-clump, centred on 1.0 so the canopy's overall level is unchanged.
         float val = 1.0 + (cs - 0.5) * 0.14 + (clump - 0.5) * 0.12;
         // Hue: whole clumps drift green<->olive; sunlit tips go a touch warmer.
         float warmth = (clump - 0.5) * 0.55 + tip * 0.22;
         vec3 tint = vec3(1.0 + warmth * 0.17, 1.0, 1.0 - warmth * 0.20);
         vec3 varied = diffuseColor.rgb * val * tint;
         varied *= mix(0.80, 1.05, smoothstep(0.0, 0.4, tip));             // darker toward the leaf base
         diffuseColor.rgb = mix(diffuseColor.rgb, clamp(varied, 0.0, 2.0), fRealism);
       }`
    );

    // Normal detail + curl: after the geometric normal is set up (view space). Bump comes from the
    // screen-space gradient of the sampled albedo (veins/edges are darker, so they become grooves);
    // a gentle curl bows the card across its width. Only on the lit side matters, but it is cheap.
    fs = fs.replace(
      "#include <normal_fragment_begin>",
      `#include <normal_fragment_begin>
       if (fRealism > 0.001) {
         // Bump from the painted albedo (veins/blade edges become shallow grooves). Clamp the
         // gradient so the hard alpha-cut card edges do not turn into sparkly false bumps.
         float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
         float bx = clamp(dFdx(lum), -0.35, 0.35), by = clamp(dFdy(lum), -0.35, 0.35);
         vec3 dpx = dFdx(-vViewPosition);
         vec3 dpy = dFdy(-vViewPosition);
         vec3 r1 = cross(dpy, normal);
         vec3 r2 = cross(normal, dpx);
         float det = dot(dpx, r1);
         float bs = ${bumpScale} * (0.55 + fExtreme * 0.45);
         vec3 bumped = normalize(abs(det) * normal - bs * (bx * r1 + by * r2));
         normal = normalize(mix(normal, bumped, fRealism * 0.8));
       }`
    );

    // Self-shadow, underside and sun-gated translucency: after the scene lights are summed. Every
    // term follows the real sun direction so the result is logical — tops bright, undersides and the
    // deep canopy shaded, and the leaf only glows where the sun is genuinely behind it. fRealism
    // scales it all, so REGULAR is unchanged.
    fs = fs.replace(
      "#include <lights_fragment_end>",
      `#include <lights_fragment_end>
       if (fRealism > 0.001) {
         vec3 Nv = normalize(normal);
         vec3 Lv = normalize((viewMatrix * vec4(uLeafSun, 0.0)).xyz);   // sun, view space
         vec3 Vv = normalize(vViewPosition);                            // fragment -> camera, view space
         vec3 Nw = normalize(vFoliageWN);
         if (!gl_FrontFacing) Nw = -Nw;                                 // normal of the face we actually see
         float ndl = dot(Nw, normalize(uLeafSun));                      // >0 faces the sun, <0 faces away
         // Self-shadow: leaves turned from the sun, undersides, and inward-facing clump cards sit in
         // shade. We dim the ambient (indirect) term only, so it reads as form, never a black hole.
         float sunShade = smoothstep(-0.4, 0.5, ndl);                   // 0 away from sun, 1 toward it
         float skyAO    = smoothstep(-0.7, 0.8, Nw.y);                  // undersides darker than tops
         float interior = gl_FrontFacing ? 1.0 : 0.74;                  // back cards are deeper in the clump
         float ao = mix(0.52, 1.0, sunShade) * mix(0.66, 1.0, skyAO) * interior;
         reflectedLight.indirectDiffuse *= mix(1.0, ao, fRealism);
         // Backlight: a leaf glows only when the sun is on its far side (behind) AND the viewer is
         // looking toward the sun. Warm, strongest at the thin tips.
         float viewToSun = pow(clamp(dot(Vv, -Lv), 0.0, 1.0), 2.5);
         float behind = clamp(-ndl + 0.15, 0.0, 1.0);
         float thin = 0.5 + 0.5 * vFoliageCell.y;
         float trans = viewToSun * behind * thin * ${transScale} * (0.8 + fExtreme * 0.5);
         reflectedLight.indirectDiffuse += uLeafSunColor * trans * diffuseColor.rgb * fRealism;
         if (gl_FrontFacing && ndl > 0.0) {
           // Waxy sheen: only on sunlit tops, in the sun's half-vector direction.
           vec3 Hs = normalize(Lv + Vv);
           float sheen = pow(clamp(dot(Nv, Hs), 0.0, 1.0), 42.0) * ndl * (0.28 + fExtreme * 0.32);
           reflectedLight.directSpecular += uLeafSunColor * sheen * fRealism;
         } else {
           // Shaded faces and undersides are matte — drop the stray specular that looked like plastic.
           reflectedLight.directSpecular *= mix(1.0, 0.25, fRealism);
           reflectedLight.indirectSpecular *= mix(1.0, 0.45, fRealism);
         }
       }`
    );

    shader.fragmentShader = fs;
  };

  // Changing onBeforeCompile output must recompile; a distinct cache key keeps it from colliding
  // with any non-enhanced clone of the same base program.
  const baseKey = material.customProgramCacheKey ? material.customProgramCacheKey() : "";
  material.customProgramCacheKey = () => baseKey + "|foliage-realism-" + kind;
  material.needsUpdate = true;
  return material;
}
