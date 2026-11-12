// HDR scene + depth -> local lighting and water -> bloom -> display tone map
// -> anti-aliasing and lens/color treatment. HUD and impact droplets are drawn
// separately so the reticle and text never get blurred or warped.
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Pass, FullScreenQuad } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/Pass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/postprocessing/OutputPass.js";
import { FXAAShader } from "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/shaders/FXAAShader.js";
import { VERTEX, LIGHTING, REFLECTION, METER, ADAPT, COMPOSITE, GRADE } from "./post-fx-shaders.js";
import { DEFAULT_FX } from "./post-fx-settings.js";

const wrap = values => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }]));

export function applyDisplayTone(THREE, renderer, settings, exposure) {
  const modes = { aces: THREE.ACESFilmicToneMapping, agx: THREE.AgXToneMapping,
    neutral: THREE.NeutralToneMapping, reinhard: THREE.ReinhardToneMapping };
  renderer.toneMapping = modes[settings.tone] ?? modes.aces;
  renderer.toneMappingExposure = exposure * (2 ** settings.exposure);
}

export function createPostFx(THREE, renderer, scene, camera, { width, height, pixelRatio = 1 }) {
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: true });
  const depthTexture = () => new THREE.DepthTexture(1, 1, THREE.UnsignedIntType);
  sceneTarget.depthTexture = depthTexture();
  const composer = new EffectComposer(renderer, sceneTarget);
  // The composer can swap its scene buffer after an odd number of passes.
  composer.renderTarget2.depthTexture = depthTexture();
  composer.setPixelRatio(1);
  composer.addPass(new RenderPass(scene, camera));

  const target = (w = 1, h = 1, options = {}) => new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false, ...options,
  });
  const lightingTarget = target(), reflectionTarget = target();
  const meterTarget = target(32, 32, {
    type: THREE.UnsignedByteType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter,
  });
  const exposures = [target(), target()];
  let exposureIndex = 0, needsExposureReset = true;

  const matrices = wrap({
    tDepth: null, uInverseProjection: camera.projectionMatrixInverse, uProjection: camera.projectionMatrix,
    uCameraWorld: camera.matrixWorld, uPixel: new THREE.Vector2(),
  });
  const sunlight = wrap({ uSun: new THREE.Vector3(), uSunColor: new THREE.Color(1, 1, 1) });
  const water = wrap({ uWater: 0 });
  const sunPoint = new THREE.Vector3(), sunView = new THREE.Vector3(), sunDirection = new THREE.Vector3();
  const lightU = { ...matrices, ...sunlight, ...wrap({ tScene: null, uAO: 0, uShafts: 0 }) };
  const reflectionU = { ...matrices, ...water, ...wrap({ tScene: null, uWaterTime: 0, uRaySteps: 18 }) };
  const meterU = wrap({ tScene: null });
  const adaptU = wrap({ tMeter: meterTarget.texture, tPrevious: exposures[0].texture, uDelta: 0, uReset: 1 });
  const material = (fragmentShader, uniforms) => new THREE.ShaderMaterial({
    vertexShader: VERTEX, fragmentShader, uniforms, depthWrite: false, depthTest: false, toneMapped: false,
  });
  const lightMat = material(LIGHTING, lightU);
  const reflectionMat = material(REFLECTION, reflectionU);
  const meterMat = material(METER, meterU);
  const adaptMat = material(ADAPT, adaptU);
  const quad = new FullScreenQuad(lightMat);
  function draw(mat, rt) {
    quad.material = mat;
    renderer.setRenderTarget(rt);
    quad.render(renderer);
  }

  const compositeU = {
    ...matrices, ...sunlight, ...water,
    ...wrap({
      tDiffuse: null, tLighting: lightingTarget.texture, tReflection: reflectionTarget.texture, tExposure: exposures[0].texture,
      uLightTexel: new THREE.Vector2(), uAOAmount: 0, uSSR: 0, uShafts: 0, uFlare: 0, uAdapt: 0,
    }),
  };
  const composite = new ShaderPass(material(COMPOSITE, compositeU));

  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .28, .55, 1);
  const output = new OutputPass();
  const fxaa = new ShaderPass(FXAAShader);
  for (const pass of [output, fxaa]) {
    pass.material.depthTest = false;
    pass.material.depthWrite = false;
  }
  const previousVP = new THREE.Matrix4();
  const lastPosition = new THREE.Vector3(), lastQuat = new THREE.Quaternion();
  let lastProjection = 0, hasHistory = false;
  const gradeU = {
    ...matrices,
    ...wrap({
      tDiffuse: null, uPreviousVP: previousVP, uTime: 0, uVignette: .25, uGrain: .018,
      uFringe: .001, uSaturation: 1, uContrast: 1, uWeak: 0, uDOF: 0, uMotion: 0,
      uDistortion: 0, uPanini: 0, uWhiteBalance: new THREE.Vector3(1,1,1), uTint: new THREE.Color(1,1,1),
      uLift: new THREE.Vector3(), uGamma: new THREE.Vector3(1,1,1), uGain: new THREE.Vector3(1,1,1),
      uShadow: new THREE.Color(), uHighlight: new THREE.Color(), uMixR: new THREE.Vector3(1,0,0),
      uMixG: new THREE.Vector3(0,1,0), uMixB: new THREE.Vector3(0,0,1),
      uCurve: new THREE.Vector4(0,.25,.5,.75), uWhitePoint: 1, uCurveRGB: new THREE.Vector3(.5,.5,.5),
      uSplit: 0, uBalance: 0,
    }),
  };
  const grade = new ShaderPass(material(GRADE, gradeU));

  let cfg = DEFAULT_FX, tier = "regular", look = {}, surface = false, sky = null;
  let rawW = 0, rawH = 0, dt = 0, motion = 0, antialiasLevel = 0;
  const fxaaFootprints = [1, 1.1, 1.2, 1.32, 1.46];
  function applyAntialiasLevel() {
    const footprint = fxaaFootprints[antialiasLevel];
    fxaa.uniforms.resolution.value.set(matrices.uPixel.value.x * footprint, matrices.uPixel.value.y * footprint);
  }
  const analysis = new Pass();
  analysis.needsSwap = false;
  analysis.render = (activeRenderer, writeBuffer, readBuffer) => {
    matrices.tDepth.value = readBuffer.depthTexture;
    const position = camera.position, quat = camera.quaternion, projection = camera.projectionMatrix.elements[0];
    const continuous = hasHistory && lastPosition.distanceToSquared(position) < 9
      && Math.abs(lastQuat.dot(quat)) > .965 && Math.abs(projection - lastProjection) < .08;
    gradeU.uMotion.value = continuous ? motion : 0;

    let sun = sunlight.uSun.value;
    sun.set(0, 0, 0);
    if (sky && (cfg.shafts || cfg.flare)) {
      sunDirection.set(...sky.sun).normalize();
      sunPoint.setFromMatrixPosition(camera.matrixWorld).addScaledVector(sunDirection, 100);
      sunView.copy(sunPoint).applyMatrix4(camera.matrixWorldInverse);
      if (sunView.z < -12) {
        sunPoint.project(camera);
        const strength = 1 - THREE.MathUtils.smoothstep(Math.max(Math.abs(sunPoint.x), Math.abs(sunPoint.y)), 1, 1.42);
        sun.set(sunPoint.x * .5 + .5, sunPoint.y * .5 + .5, strength);
      }
    }
    const ao = lightU.uAO.value > 0 && cfg.aoStrength > 0;
    const shafts = sun.z > 0 && cfg.shafts > 0;
    const reflect = surface && cfg.ssr > 0;
    compositeU.uAOAmount.value = ao ? cfg.aoStrength : 0;
    compositeU.uSSR.value = reflect ? cfg.ssr : 0;
    compositeU.uShafts.value = shafts ? cfg.shafts : 0;
    compositeU.uFlare.value = cfg.flare;
    compositeU.uAdapt.value = cfg.adapt;
    composite.enabled = ao || shafts || reflect || (sun.z > 0 && cfg.flare > 0) || cfg.adapt > 0;
    if (ao || shafts) {
      lightU.tScene.value = readBuffer.texture;
      draw(lightMat, lightingTarget);
    }
    if (reflect) {
      reflectionU.tScene.value = readBuffer.texture;
      draw(reflectionMat, reflectionTarget);
    }
    if (cfg.adapt > 0) {
      meterU.tScene.value = readBuffer.texture;
      draw(meterMat, meterTarget);
      adaptU.tPrevious.value = exposures[exposureIndex].texture;
      adaptU.uDelta.value = dt;
      adaptU.uReset.value = needsExposureReset ? 1 : 0;
      exposureIndex ^= 1;
      draw(adaptMat, exposures[exposureIndex]);
      compositeU.tExposure.value = exposures[exposureIndex].texture;
      needsExposureReset = false;
    } else {
      needsExposureReset = true;
    }
  };

  composer.addPass(analysis);
  composer.addPass(composite);
  composer.addPass(bloom);
  composer.addPass(output);
  composer.addPass(fxaa);
  composer.addPass(grade);

  function resizeAnalysis() {
    const scale = tier === "extreme" ? .50 : tier === "high" ? .41 : .29;
    const w = Math.max(1, Math.round(rawW * scale)), h = Math.max(1, Math.round(rawH * scale));
    lightingTarget.setSize(w, h);
    reflectionTarget.setSize(w, h);
    compositeU.uLightTexel.value.set(1 / w, 1 / h);
  }
  function applyLook() {
    gradeU.uTint.value.set(look.tint ?? 0xffffff).convertLinearToSRGB();
    gradeU.uVignette.value = (look.vignette ?? .34) * cfg.vignette;
    gradeU.uSaturation.value = (look.saturation ?? 1.03) * cfg.saturation;
    gradeU.uContrast.value = (look.contrast ?? 1.035) * cfg.contrast;
    bloom.threshold = look.threshold ?? 1.23;
    bloom.strength = (look.bloom ?? .33) * cfg.bloom;
    bloom.enabled = bloom.strength > .001;
  }

  const api = {
    composer, bloom, grade,
    setAntialiasLevel(level) {
      const next = THREE.MathUtils.clamp(Math.round(level || 0), 0, fxaaFootprints.length - 1);
      if (next === antialiasLevel) return;
      antialiasLevel = next;
      applyAntialiasLevel();
    },
    setSize(w, h, dpr) {
      rawW = Math.max(1, Math.round(w * dpr)); rawH = Math.max(1, Math.round(h * dpr));
      composer.setSize(rawW, rawH);
      matrices.uPixel.value.set(1 / rawW, 1 / rawH);
      applyAntialiasLevel();
      resizeAnalysis();
      hasHistory = false;
    },
    configure(settings, quality, environment) {
      cfg = settings;
      if (quality !== tier) {
        tier = quality;
        resizeAnalysis();
      }
      sky = environment?.sky || environment?.space || null;
      if (!sky?.sun) sky = null;
      sunlight.uSunColor.value.set(sky?.sunColor ?? 0xffefd7);
      surface = !!environment?.water;
      water.uWater.value = !surface ? 0 : environment.water === "puddles" ? 2 : 1;
      lightU.uAO.value = cfg.ao === "off" ? 0 : cfg.ao === "hbao" || (cfg.ao === "auto" && tier === "extreme") ? 2 : 1;
      lightU.uShafts.value = cfg.shafts;
      reflectionU.uRaySteps.value = tier === "extreme" ? 28 : tier === "high" ? 23 : 16;
      const vec = (key, src) => gradeU[key].value.set(cfg[src + 0], cfg[src + 1], cfg[src + 2]);
      for (const [u, setting] of [["uLift","lift"], ["uGamma","gamma"], ["uGain","gain"], ["uMixR","mixR"],
        ["uMixG","mixG"], ["uMixB","mixB"], ["uCurveRGB","curveRgb"]]) vec(u, setting);
      gradeU.uCurve.value.set(cfg.curve0, cfg.curve1, cfg.curve2, cfg.curve3);
      gradeU.uWhitePoint.value = cfg.curve4;
      gradeU.uWhiteBalance.value.set(1 + cfg.temperature * .12 + cfg.tint * .06,
        1 - cfg.tint * .11, 1 - cfg.temperature * .17 + cfg.tint * .065);
      gradeU.uShadow.value.set(cfg.shadowTone).convertLinearToSRGB();
      gradeU.uHighlight.value.set(cfg.highlightTone).convertLinearToSRGB();
      gradeU.uSplit.value = cfg.split;
      gradeU.uBalance.value = cfg.splitBalance;
      gradeU.uGrain.value = cfg.grain * .066;
      applyLook();
    },
    look(settings = {}) {
      look = settings;
      applyLook();
      api.resetHistory();
    },
    resetHistory() { hasHistory = false; needsExposureReset = true; },
    update(delta, { weak = 0, fringe = 0, aiming = false, motionBlur = true, waterTime = 0 } = {}) {
      dt = delta;
      gradeU.uTime.value = (gradeU.uTime.value + dt) % 100;
      gradeU.uWeak.value = weak;
      gradeU.uFringe.value = (cfg.fringe * .007 + fringe * cfg.fringe) * (aiming ? .45 : 1);
      gradeU.uDOF.value = cfg.dof * (aiming ? .55 : 1);
      gradeU.uDistortion.value = aiming ? 0 : cfg.distortion;
      gradeU.uPanini.value = aiming ? 0 : cfg.panini;
      reflectionU.uWaterTime.value = waterTime;
      motion = motionBlur ? cfg.motion * (aiming ? .32 : 1) : 0;
    },
    render(delta) {
      composer.render(delta);
      previousVP.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      lastPosition.copy(camera.position);
      lastQuat.copy(camera.quaternion);
      lastProjection = camera.projectionMatrix.elements[0];
      hasHistory = true;
    },
    dispose() {
      composer.dispose();
      for (const pass of [composite, bloom, output, fxaa, grade]) pass.dispose();
      for (const rt of [lightingTarget, reflectionTarget, meterTarget, ...exposures]) rt.dispose();
      for (const m of [lightMat, reflectionMat, meterMat, adaptMat]) m.dispose();
      quad.dispose();
    },
  };
  api.setSize(width, height, pixelRatio);
  return api;
}
