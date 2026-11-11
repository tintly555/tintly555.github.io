/*
 * Post-processing for the main view: a soft bloom on lamps and glowing devices, then a grade
 * (vignette, a little lens fringing toward the edges, film grain, saturation and contrast) and
 * anti-aliasing. The renderer's own tone mapping is applied by OutputPass, so the look matches
 * the un-processed path; turning the effect off returns to a plain render.
 */
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/OutputPass.js";
import { FXAAShader } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/shaders/FXAAShader.js";

export function createPostFx(THREE, renderer, scene, camera, { width, height, pixelRatio = 1 }) {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1);
  composer.setSize(width * pixelRatio, height * pixelRatio);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(width * pixelRatio * 0.5, height * pixelRatio * 0.5), 0.34, 0.55, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const fxaa = new ShaderPass(FXAAShader);
  composer.addPass(fxaa);

  const grade = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uVignette: { value: 0.34 },
      uGrain: { value: 0.028 },
      uFringe: { value: 0.0014 },
      uSaturation: { value: 1.07 },
      uContrast: { value: 1.06 },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uHurt: { value: 0 },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime, uVignette, uGrain, uFringe, uSaturation, uContrast, uHurt; uniform vec3 uTint;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453); }
      void main(){
        vec2 c = vUv - 0.5;
        float r2 = dot(c, c);
        // Lens fringing grows toward the corners: red and blue sampled slightly apart.
        vec2 shift = c * (uFringe * (1.0 + r2 * 6.0));
        vec3 col = vec3(texture2D(tDiffuse, vUv + shift).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - shift).b);
        float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(luma), col, uSaturation);
        col = (col - 0.5) * uContrast + 0.5;
        col *= uTint;
        float vig = smoothstep(0.82, 0.18, sqrt(r2) * (1.0 + uVignette));
        col *= mix(1.0 - uVignette, 1.0, vig);
        // Low health: the edges close in and redden.
        col = mix(col, col * vec3(1.0, 0.38, 0.34), uHurt * smoothstep(0.1, 0.75, sqrt(r2)));
        col += (hash(vUv * 1400.0) - 0.5) * uGrain;
        gl_FragColor = vec4(max(col, 0.0), 1.0);
      }`,
  });
  composer.addPass(grade);

  const api = {
    enabled: true,
    composer, bloom, grade,
    setSize(w, h, dpr) {
      composer.setSize(w * dpr, h * dpr);
      bloom.resolution.set(w * dpr * 0.5, h * dpr * 0.5);
      fxaa.material.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr));
    },
    /** Per-frame look: `hurt` 0..1 (low health), `fringe` extra lens fringing (dashes, impacts). */
    update(dt, { hurt = 0, fringe = 0 } = {}) {
      grade.uniforms.uTime.value = (grade.uniforms.uTime.value + dt) % 100;
      const h = grade.uniforms.uHurt;
      h.value += (hurt - h.value) * Math.min(1, dt * 5);
      const f = grade.uniforms.uFringe;
      f.value += ((0.0014 + fringe) - f.value) * Math.min(1, dt * 9);
    },
    /** Environment grade: tint and strength differ per map or chapter. */
    look({ tint = 0xffffff, vignette = 0.34, saturation = 1.07, contrast = 1.06, bloom: strength = 0.34, threshold = 1.0 } = {}) {
      grade.uniforms.uTint.value.set(tint);
      grade.uniforms.uVignette.value = vignette;
      grade.uniforms.uSaturation.value = saturation;
      grade.uniforms.uContrast.value = contrast;
      bloom.strength = strength;
      bloom.threshold = threshold;
    },
    render(dt) { composer.render(dt); },
  };
  api.setSize(width, height, pixelRatio);
  return api;
}
