    import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js";
    // The deployed file is translation.js (not translate.js — earlier versions of this HTML had the
    // wrong path and 404'd, which aborted the whole module and left Start unresponsive). The dynamic
    // import + catch is kept so a missing/renamed i18n file still lets the menu boot with a minimal stub.
    let GAME_I18N, LANG_META, translateGame;
    try {
      const _i18n = await import("./js/translation.js");
      GAME_I18N     = _i18n.GAME_I18N;
      LANG_META     = _i18n.LANGUAGE_OPTIONS;
      translateGame = _i18n.translate;
    } catch (_e) {
      console.warn("[zone-no-light] translation.js missing — using minimal inline i18n stub", _e);
      LANG_META = [
        { code: "en", native: "English" },
        { code: "zh", native: "中文" },
      ];
      GAME_I18N = { en: {}, zh: {} };
      translateGame = function (_lang, _key, fallback) { return fallback != null ? fallback : _key; };
    }

    const app = document.getElementById("app");
    const hud = document.getElementById("hud");
    const fpsValueEl = document.getElementById("fpsValue");
    const hint = document.getElementById("hint");
    const flash = document.getElementById("flash");
    const crosshairEl = document.getElementById("crosshair");
    const amrScopeOverlayEl = document.getElementById("amrScopeOverlay");
    const medKitReticleEl = document.getElementById("medkitReticle");
    const medKitRingProgEl = document.getElementById("medkitRingProg");
    const hitmarkerEl = document.getElementById("hitmarker");
    const combatFeedbackEl = (() => {
      let el = document.getElementById("combatFeedback");
      if (el) return el;
      el = document.createElement("div");
      el.id = "combatFeedback";
      el.style.cssText =
        "position:fixed;left:50%;top:calc(50% + 36px);transform:translate(-50%, 0);z-index:29;pointer-events:none;font-family:Audiowide,sans-serif;font-size:18px;letter-spacing:0.14em;color:rgba(255,255,255,0);text-shadow:0 0 10px rgba(0,0,0,0.9);opacity:0;transition:opacity 0.09s linear, transform 0.09s linear, color 0.09s linear;";
      document.body.appendChild(el);
      return el;
    })();
    const menuWallBackdropCanvas = document.getElementById("menuWallBackdrop");
    const menuEl = document.getElementById("menu");
    const menuMain = document.getElementById("menuMain");
    const menuArenaMode = document.getElementById("menuArenaMode");
    const menuLobby = document.getElementById("menuLobby");
    const lobbyTitle = document.getElementById("lobbyTitle");
    const menuJoinCode = document.getElementById("menuJoinCode");
    const menuPvpMaps = document.getElementById("menuPvpMaps");
    const btnPvpMapClassic = document.getElementById("btnPvpMapClassic");
    const btnPvpMapGrid = document.getElementById("btnPvpMapGrid");
    const btnPvpMapBack = document.getElementById("btnPvpMapBack");
    const gameBootOverlay = document.getElementById("gameBootOverlay");
    const gameBootLabel = document.getElementById("gameBootLabel");
    const codeInput = document.getElementById("codeInput");
    const codeError = document.getElementById("codeError");
    const lobbyError = document.getElementById("lobbyError");
    const btnArena = document.getElementById("btnArena");
    const btnCrossfire = document.getElementById("btnCrossfire");
    const btnTraining = document.getElementById("btnTraining");
    const menuTrainingMode = document.getElementById("menuTrainingMode");
    const btnTrainingSingle = document.getElementById("btnTrainingSingle");
    const btnTrainingCoop = document.getElementById("btnTrainingCoop");
    const btnTrainingBack = document.getElementById("btnTrainingBack");
    const trainingScoreboardEl = document.getElementById("trainingScoreboard");
    const trainYouPts = document.getElementById("trainYouPts");
    const trainTeamPts = document.getElementById("trainTeamPts");
    const trainYouHits = document.getElementById("trainYouHits");
    const trainYouHead = document.getElementById("trainYouHead");
    const trainYouBody = document.getElementById("trainYouBody");
    const trainYouLeg = document.getElementById("trainYouLeg");
    const trainYouAcc = document.getElementById("trainYouAcc");
    const trainTeamRow = document.getElementById("trainTeamRow");
    const btnArenaSingle = document.getElementById("btnArenaSingle");
    const btnArenaCoop = document.getElementById("btnArenaCoop");
    const btnArenaBack = document.getElementById("btnArenaBack");
    const btnQuickplay = document.getElementById("btnQuickplay");
    const btnCreateRoom = document.getElementById("btnCreateRoom");
    const btnJoinCode = document.getElementById("btnJoinCode");
    const btnLobbyBack = document.getElementById("btnLobbyBack");
    const btnCodeJoin = document.getElementById("btnCodeJoin");
    const btnCodeBack = document.getElementById("btnCodeBack");
    const deathOverlay = document.getElementById("deathOverlay");
    const deathFade = document.getElementById("deathFade");
    const deathUI = document.getElementById("deathUI");
    const deathTitle = document.getElementById("deathTitle");
    const deathScore = document.getElementById("deathScore");
    const btnDeathRestart = document.getElementById("btnDeathRestart");
    const btnDeathSettings = document.getElementById("btnDeathSettings");
    const btnDeathQuit = document.getElementById("btnDeathQuit");
    const revivePrompt = document.getElementById("revivePrompt");
    const reviveRing = document.getElementById("reviveRing");
    const reviveCountdownNum = document.getElementById("reviveCountdownNum");
    const btnReviveWatchAd = document.getElementById("btnReviveWatchAd");
    const btnReviveGiveUp = document.getElementById("btnReviveGiveUp");
    const reviveAdSlot = document.getElementById("reviveAdSlot");
    const reviveAdSlotInner = document.getElementById("reviveAdSlotInner");
    const pauseOverlay = document.getElementById("pauseOverlay");
    const btnResume = document.getElementById("btnResume");
    const btnPauseSettings = document.getElementById("btnPauseSettings");
    const btnPauseRestart = document.getElementById("btnPauseRestart");
    const btnPauseQuit = document.getElementById("btnPauseQuit");
    const nameModal = document.getElementById("nameModal");
    const nameInput = document.getElementById("nameInput");
    const btnNameOk = document.getElementById("btnNameOk");
    const btnMenuSettings = document.getElementById("btnMenuSettings");
    const settingsModal = document.getElementById("settingsModal");
    const settingsScroll = document.getElementById("settingsScroll");
    const SETTINGS_SECTION_IDS = [
      "settingsSectionAudio",
      "settingsSectionControls",
      "settingsSectionGraphics",
      "settingsSectionLanguage",
      "settingsSectionData",
      "settingsSectionServer",
    ];
    const btnCloseSettings = document.getElementById("btnCloseSettings");
    const rngMasterVol = document.getElementById("rngMasterVol");
    const rngMusicVol = document.getElementById("rngMusicVol");
    const rngSfxVol = document.getElementById("rngSfxVol");
    const lblMasterVol = document.getElementById("lblMasterVol");
    const lblMusicVol = document.getElementById("lblMusicVol");
    const lblSfxVol = document.getElementById("lblSfxVol");
    const rngLookSens = document.getElementById("rngLookSens");
    const lblLookSens = document.getElementById("lblLookSens");
    const rngAdsLookSens = document.getElementById("rngAdsLookSens");
    const lblAdsLookSens = document.getElementById("lblAdsLookSens");
    const btnQualityPrev = document.getElementById("btnQualityPrev");
    const btnQualityNext = document.getElementById("btnQualityNext");
    const qualityLabel = document.getElementById("qualityLabel");
    const btnTexturePrev = document.getElementById("btnTexturePrev");
    const btnTextureNext = document.getElementById("btnTextureNext");
    const textureLabel = document.getElementById("textureLabel");
    const btnRenderDistPrev = document.getElementById("btnRenderDistPrev");
    const btnRenderDistNext = document.getElementById("btnRenderDistNext");
    const renderDistanceLabel = document.getElementById("renderDistanceLabel");
    const btnLangPrev = document.getElementById("btnLangPrev");
    const btnLangNext = document.getElementById("btnLangNext");
    const languageValue = document.getElementById("languageValue");
    const warFilmOverlay = document.getElementById("warFilmOverlay");
    const shadeOverlay = document.getElementById("shadeOverlay");
    const chatBox = document.getElementById("chatBox");
    const chatMessages = document.getElementById("chatMessages");
    const chatInputWrap = document.getElementById("chatInputWrap");
    const chatInput = document.getElementById("chatInput");
    const hitDirContainer = document.getElementById("hitDirContainer");

    const SETTINGS_STORAGE_KEY = "fpsGameSettingsV1";
    /**
     * Per-tier rendering preset. Every tier's realism is raised to its ceiling (potato now gets
     * ACES tone mapping + PCF soft shadows too), but values stay strictly monotonic so the
     * performance ladder (potato fastest → extreme slowest) and the realism ladder
     * (extreme best → potato worst) are both preserved.
     */
    const QUALITY_PRESETS = {
      potato:  { label: "POTATO",  dpr: 0.62, presentation: 0.55, aniso: 4,  fog: { near: 15, far: 64 }, shadowSz: 256, exposure: 1.0,   bias: -0.0009,  normalBias: 0.018, warFilm: "0.015", shade: "0.09" },
      regular: { label: "REGULAR", dpr: 0.78, presentation: 0.75, aniso: 8,  fog: { near: 17, far: 78 }, shadowSz: 512, exposure: 1.03,  bias: -0.0008,  normalBias: 0.015, warFilm: "0.035", shade: "0.06" },
      high:    { label: "HIGH",    dpr: 0.95, presentation: 0.9,  aniso: 12, fog: { near: 18, far: 90 }, shadowSz: 768, exposure: 1.06,  bias: -0.00065, normalBias: 0.012, warFilm: "0.05",  shade: "0.035" },
      extreme: { label: "EXTREME", dpr: 1.08, presentation: 1,    aniso: 16, fog: { near: 19, far: 96 }, shadowSz: 896, exposure: 1.1,   bias: -0.00055, normalBias: 0.008, warFilm: "0.07",  shade: "0.018" },
    };
    const QUALITY_LEVELS = Object.keys(QUALITY_PRESETS);
    const QUALITY_LABELS = QUALITY_LEVELS.map((s) => QUALITY_PRESETS[s].label);
    const LANGUAGE_OPTIONS = LANG_META.map((o) => o.code);
    const LANGUAGE_LABELS = Object.fromEntries(LANG_META.map((o) => [o.code, o.native]));
    /**
     * Sampled gait offsets for remote third-person legs (PvP). Used to stabilise stride frequency
     * across wide ping variance — keeps opponent footsteps visually anchored without extra bones.
     */
    /** Per-weapon idle arm stances for remote players (indexed by rp.currentWeapon). */
    const REMOTE_WEAPON_STANCES = [
      { l: -1.06, r: -1.12, ly: 0.2, ry: -0.16, lz: 0.24, rz: -0.2 },
      { l: -1.04, r: -1.14, ly: 0.18, ry: -0.14, lz: 0.26, rz: -0.22 },
      { l: -1.02, r: -1.1, ly: 0.16, ry: -0.12, lz: 0.22, rz: -0.18 },
      { l: -1.04, r: -1.12, ly: 0.18, ry: -0.14, lz: 0.24, rz: -0.2 },
      { l: -0.7, r: -0.75, ly: 0, ry: 0, lz: 0, rz: 0 },
      { l: -1.08, r: -1.18, ly: 0.17, ry: -0.13, lz: 0.23, rz: -0.19 },
      { l: -1.04, r: -1.12, ly: 0.18, ry: -0.14, lz: 0.24, rz: -0.2 },  // 6 dart
      { l: -0.28, r: -0.78, ly: 0.06, ry: -0.2, lz: 0.12, rz: -0.16 },  // 7 knife (one-handed)
      { l: -1.1, r: -1.2, ly: 0.18, ry: -0.15, lz: 0.25, rz: -0.21 },   // 8 dev gun
    ];

    const REMOTE_WALK_PHASE_LUT = (() => {
      const rows = [];
      for (let i = 0; i < 96; i++) {
        const u = i / 96;
        const s = Math.sin(u * Math.PI * 2);
        const c = Math.cos(u * Math.PI * 2);
        rows.push({
          u,
          legMix: s,
          sway: c * 0.52,
          torsoTwist: Math.sin(u * Math.PI * 4) * 0.13,
          bob: Math.abs(Math.sin(u * Math.PI * 2)),
          shoulder: Math.sin(u * Math.PI * 2 + 0.35) * 0.09,
        });
      }
      return rows;
    })();

    // ── Mouse sensitivity: the standard FPS model ─────────────────────────────
    // Aim used to be an opaque "percent of an internal constant", so the number meant
    // nothing outside this game. It now works exactly like Source / CS / Valorant:
    //
    //     degrees per mouse count = sensitivity × m_yaw     (m_yaw = 0.022)
    //     eDPI                    = mouse DPI × sensitivity
    //     cm per 360°             = 360 / (eDPI × m_yaw) × 2.54
    //
    // DPI 800 at sensitivity 1.64 is therefore eDPI 1312 and ~31.2 cm/360 — the same
    // numbers any other shooter would give, so a sens can be copied straight across.
    // Pitch uses the same rate as yaw (m_pitch = m_yaw, the 1:1 convention); the old code
    // used a 0.8 ratio that quietly made vertical aim slower than horizontal.
    const MOUSE_YAW_DEG_PER_COUNT = 0.022;
    const SENS_MIN = 0.05;
    const SENS_MAX = 20;
    const SENS_DEFAULT = 1.64;
    const ADS_SENS_MUL_MIN = 0.1;
    const ADS_SENS_MUL_MAX = 2.5;
    const ADS_SENS_MUL_DEFAULT = 1.0;
    const MOUSE_DPI_MIN = 100;
    const MOUSE_DPI_MAX = 32000;
    const MOUSE_DPI_DEFAULT = 800;
    /**
     * Old saves stored `lookSensPercent`, where 100 % meant 0.004 rad per count.
     * 0.004 rad = 0.2292°, and 0.2292 / 0.022 = 10.417 — so this converts a legacy percent
     * into the sensitivity that feels identical and nobody's aim shifts under them.
     */
    const LEGACY_PERCENT_TO_SENS = 0.10417;

    function clampSens(v) {
      return THREE.MathUtils.clamp(
        typeof v === "number" && Number.isFinite(v) ? v : SENS_DEFAULT,
        SENS_MIN,
        SENS_MAX
      );
    }

    function clampAdsSensMul(v) {
      return THREE.MathUtils.clamp(
        typeof v === "number" && Number.isFinite(v) ? v : ADS_SENS_MUL_DEFAULT,
        ADS_SENS_MUL_MIN,
        ADS_SENS_MUL_MAX
      );
    }

    function clampMouseDpi(v) {
      return THREE.MathUtils.clamp(
        typeof v === "number" && Number.isFinite(v) ? Math.round(v) : MOUSE_DPI_DEFAULT,
        MOUSE_DPI_MIN,
        MOUSE_DPI_MAX
      );
    }

    /** eDPI — the number players actually compare between setups. */
    function getEdpi() {
      return clampMouseDpi(gameSettings.mouseDpi) * clampSens(gameSettings.sensitivity);
    }

    /** Centimetres of mouse travel for one full 360° turn. */
    function getCmPer360() {
      const edpi = getEdpi();
      if (edpi <= 0) return 0;
      return (360 / (edpi * MOUSE_YAW_DEG_PER_COUNT)) * 2.54;
    }

    function isAdsLookSensitivityActive() {
      return (
        player.health > 0 &&
        state.weaponIndex !== 4 &&
        !state.reloading &&
        (state.ads || keys.shift)
      );
    }

    /** Radians of view rotation per mouse count, for both yaw and pitch. */
    function radiansPerMouseCount(ads = false) {
      const s =
        clampSens(gameSettings.sensitivity) *
        (ads ? clampAdsSensMul(gameSettings.adsSensMultiplier) : 1);
      return THREE.MathUtils.degToRad(MOUSE_YAW_DEG_PER_COUNT * s);
    }

    /** Scales fog far plane (and matching near) — lower = darkness closes in sooner. */
    const RENDER_DISTANCE_LEVELS = [
      { label: "SHORT", scale: 0.62 },
      { label: "MEDIUM", scale: 0.8 },
      { label: "NORMAL", scale: 1 },
      { label: "LONG", scale: 1.22 },
      { label: "VERY FAR", scale: 1.48 },
    ];

    // ── Rebindable key actions ────────────────────────────────────────
    // Each gameplay action maps to a KeyboardEvent.code (layout-independent).
    // Defaults reproduce the original hard-coded keys — except DASH, which now
    // defaults to E (was C). Players can remap any of these in Settings → Controls.
    const REBINDABLE_ACTIONS = [
      { id: "moveForward", label: "Move forward",      def: "KeyW" },
      { id: "moveBack",    label: "Move backward",     def: "KeyS" },
      { id: "moveLeft",    label: "Move left",         def: "KeyA" },
      { id: "moveRight",   label: "Move right",        def: "KeyD" },
      { id: "jump",        label: "Jump",              def: "Space" },
      { id: "aim",         label: "Aim / ADS",         def: "ShiftLeft" },
      { id: "crouch",      label: "Crouch",            def: "ControlLeft" },
      { id: "dash",        label: "Dash",              def: "KeyC" },
      { id: "reload",      label: "Reload",            def: "KeyR" },
      { id: "heal",        label: "Heal / Med-kit",    def: "KeyF" },
      { id: "fire",        label: "Fire (keyboard)",   def: "KeyV" },
      { id: "speedNeedle", label: "Speed needle",      def: "KeyQ" },
      { id: "jetHarness",  label: "Jet harness",       def: "KeyP" },
      { id: "questHud",    label: "Toggle quest HUD",  def: "KeyM" },
      { id: "flashlight",  label: "Flashlight",        def: "KeyL" },
      { id: "flashBeam",   label: "Flashlight beam",   def: "KeyZ" },
      { id: "chat",        label: "Chat",              def: "KeyT" },
    ];
    function defaultKeyBindings() {
      const o = {};
      for (const a of REBINDABLE_ACTIONS) o[a.id] = a.def;
      return o;
    }

    let gameSettings = {
      weaponSlotOrder: [0, 2, 3, 1, 5, 6, 4, 7, 9], // last entry (AS Val) is key 8; ～～～ stays on /
      keyBindings: defaultKeyBindings(),
      masterVolume: 1,
      musicVolume: 1,
      soundVolume: 1,
      qualityIndex: 1,
      texturesOn: true,
      renderDistanceIndex: 2,
      mouseDpi: MOUSE_DPI_DEFAULT,
      sensitivity: SENS_DEFAULT,
      adsSensMultiplier: ADS_SENS_MUL_DEFAULT,
      skipClickToPlay: false,
      language: "en",
      // Multiplayer server source. "default" = use the meta tag (discord.jimmyqrg.com
      // for the GitHub Pages deploy). "manual" = use serverManualUrl. "local" = use
      // serverLocalUrl (set by the local-discovery panel). All three are persisted;
      // the chosen value is read on page load by getMultiplayerOrigin().
      serverMode: "default",
      serverManualUrl: "",
      serverLocalUrl: "",
    };
    let settingsModalOpen = false;

    function loadGameSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return;
        const o = JSON.parse(raw);
        if (typeof o.masterVolume === "number") gameSettings.masterVolume = THREE.MathUtils.clamp(o.masterVolume, 0, 1);
        if (typeof o.musicVolume === "number") gameSettings.musicVolume = THREE.MathUtils.clamp(o.musicVolume, 0, 1);
        if (typeof o.soundVolume === "number") gameSettings.soundVolume = THREE.MathUtils.clamp(o.soundVolume, 0, 1);
        if (typeof o.qualityIndex === "number") gameSettings.qualityIndex = THREE.MathUtils.clamp(o.qualityIndex | 0, 0, QUALITY_LEVELS.length - 1);
        if (typeof o.texturesOn === "boolean") gameSettings.texturesOn = o.texturesOn;
        if (typeof o.renderDistanceIndex === "number") {
          gameSettings.renderDistanceIndex = THREE.MathUtils.clamp(
            o.renderDistanceIndex | 0,
            0,
            RENDER_DISTANCE_LEVELS.length - 1
          );
        }
        if (typeof o.language === "string" && LANGUAGE_OPTIONS.includes(o.language)) {
          gameSettings.language = o.language;
        }
        if (typeof o.mouseDpi === "number") gameSettings.mouseDpi = clampMouseDpi(o.mouseDpi);
        if (typeof o.sensitivity === "number") {
          gameSettings.sensitivity = clampSens(o.sensitivity);
        } else if (typeof o.lookSensPercent === "number") {
          // Legacy save: convert the old percent so the player's aim feels unchanged.
          gameSettings.sensitivity = clampSens(o.lookSensPercent * LEGACY_PERCENT_TO_SENS);
        }
        if (typeof o.adsSensMultiplier === "number") {
          gameSettings.adsSensMultiplier = clampAdsSensMul(o.adsSensMultiplier);
        } else if (
          typeof o.adsLookSensPercent === "number" &&
          typeof o.lookSensPercent === "number" &&
          o.lookSensPercent > 0
        ) {
          // Old ADS sens was an absolute percent; the new one is a ratio of the base sens.
          gameSettings.adsSensMultiplier = clampAdsSensMul(o.adsLookSensPercent / o.lookSensPercent);
        }
        if (typeof o.skipClickToPlay === "boolean") {
          gameSettings.skipClickToPlay = o.skipClickToPlay;
        }
        if (Array.isArray(o.weaponSlotOrder) && o.weaponSlotOrder.length === 9) {
          gameSettings.weaponSlotOrder = o.weaponSlotOrder;
        }
        if (o.keyBindings && typeof o.keyBindings === "object") {
          for (const a of REBINDABLE_ACTIONS) {
            const v = o.keyBindings[a.id];
            if (typeof v === "string" && v) gameSettings.keyBindings[a.id] = v;
          }
        }
        // Dash was shipped with an accidental default of KeyE (the intended key is C);
        // migrate any untouched save so C works out of the box.
        if (gameSettings.keyBindings.dash === "KeyE") {
          gameSettings.keyBindings.dash = "KeyC";
        }
        if (typeof o.serverMode === "string" && ["default", "manual", "local"].includes(o.serverMode)) {
          gameSettings.serverMode = o.serverMode;
        }
        if (typeof o.serverManualUrl === "string") {
          gameSettings.serverManualUrl = o.serverManualUrl;
        }
        if (typeof o.serverLocalUrl === "string") {
          gameSettings.serverLocalUrl = o.serverLocalUrl;
        }
      } catch (_) {}
    }

    function saveGameSettings() {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(gameSettings));
      } catch (_) {}
    }

    // ── Key-binding helpers ───────────────────────────────────────────
    // Left/right modifier pairs are treated as equivalent so binding "Shift"
    // keeps both shift keys working (matches the original behaviour).
    const _MODIFIER_PAIR = {
      ShiftLeft: "ShiftRight", ShiftRight: "ShiftLeft",
      ControlLeft: "ControlRight", ControlRight: "ControlLeft",
      AltLeft: "AltRight", AltRight: "AltLeft",
    };
    // Fallback when a browser/event doesn't expose e.code: map a code to the
    // e.key string the original handler compared against.
    function codeToKeyChar(code) {
      if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
      if (/^Digit[0-9]$/.test(code)) return code.slice(5);
      if (code === "Space") return " ";
      if (code === "ShiftLeft" || code === "ShiftRight") return "shift";
      if (code === "ControlLeft" || code === "ControlRight") return "control";
      if (code === "AltLeft" || code === "AltRight") return "alt";
      if (code === "Slash") return "/";
      return null;
    }
    function eventMatchesCode(e, code) {
      if (!code) return false;
      if (e.code) {
        if (e.code === code) return true;
        if (_MODIFIER_PAIR[code] && e.code === _MODIFIER_PAIR[code]) return true;
        return false;
      }
      const kc = codeToKeyChar(code);
      return kc != null && typeof e.key === "string" && e.key.toLowerCase() === kc;
    }
    function kbCode(action) {
      return (gameSettings.keyBindings && gameSettings.keyBindings[action]) || null;
    }
    function isAction(e, action) {
      return eventMatchesCode(e, kbCode(action));
    }
    // Human-readable label for a key code (for the settings UI).
    function codeToLabel(code) {
      if (!code) return "—";
      if (/^Key[A-Z]$/.test(code)) return code.slice(3);
      if (/^Digit[0-9]$/.test(code)) return code.slice(5);
      const named = {
        Space: "Space", ShiftLeft: "Shift", ShiftRight: "R-Shift",
        ControlLeft: "Ctrl", ControlRight: "R-Ctrl", AltLeft: "Alt", AltRight: "R-Alt",
        Slash: "/", Backslash: "\\", Enter: "Enter", Tab: "Tab",
        Backquote: "`", Minus: "-", Equal: "=",
        BracketLeft: "[", BracketRight: "]", Semicolon: ";", Quote: "'",
        Comma: ",", Period: ".",
        ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
        CapsLock: "Caps", MetaLeft: "Meta", MetaRight: "R-Meta",
      };
      if (named[code]) return named[code];
      if (/^Numpad/.test(code)) return "Num " + code.slice(6);
      return code;
    }

    loadGameSettings();

    let _freeLookLastX = 0;
    let _freeLookLastY = 0;
    let _freeLookHasLast = false;

    function controlsInputReady() {
      if (!gameWorldReady || player.health <= 0 || paused) return false;
      return state.locked || !!gameSettings.skipClickToPlay;
    }

    function canFireWithoutMouse() {
      return controlsInputReady();
    }

    function updateClickHintVisibility() {
      if (!hint) return;
      const hide =
        state.locked ||
        paused ||
        player.health <= 0 ||
        !gameWorldReady ||
        !!gameSettings.skipClickToPlay;
      hint.style.display = hide ? "none" : "block";
    }

    function tryAutoCapturePointer() {
      if (!gameSettings.skipClickToPlay || !gameWorldReady || player.health <= 0) return;
      if (paused || settingsModalOpen || chatOpen) return;
      try {
        if (!renderer.domElement.hasAttribute("tabindex")) {
          renderer.domElement.tabIndex = 0;
        }
        renderer.domElement.focus({ preventScroll: true });
      } catch (_) {}
      try {
        renderer.domElement.requestPointerLock();
      } catch (_) {}
    }

    function tr(key, fallback = "") {
      const lang = LANGUAGE_OPTIONS.includes(gameSettings.language) ? gameSettings.language : "en";
      return translateGame(lang, key, fallback);
    }

    // v96: hoisted above updateHud to avoid TDZ on initial load (updateHud runs before the
    // INVENTORY block lower in the file would have initialized these).
    const WEAPON_NAMES_INV     = ["Pistol","AR","Shotgun","SMG","MedKit","AMR","Dart","Knife","???","AS Val"];
    const WEAPON_NAMES_INV_ZH  = ["手枪","突击步枪","霰弹枪","冲锋枪","医疗包","反器材","麻痹镖","匕首","???","AS Val"];
    const WEAPON_I18N_KEYS     = ["weaponPistol","weaponAR","weaponShotgun","weaponSMG","weaponMedKit","weaponAMR","weaponDart","weaponKnife","weaponDev","weaponAsVal"];
    function weaponDisplayName(widx) {
      const k = WEAPON_I18N_KEYS[widx];
      const fallback = WEAPON_NAMES_INV[widx] || "";
      return k ? tr(k, fallback) : fallback;
    }

    function applyLanguageUI() {
      try {
        document.title = tr("gameTitle", "Zone No Light");
      } catch (_) {}
      const menuGameTitle = document.getElementById("menuGameTitle");
      const menuCreditsGame = document.getElementById("menuCreditsGame");
      const menuCreditsMusic = document.getElementById("menuCreditsMusic");
      const menuZombieArenaHeading = document.getElementById("menuZombieArenaHeading");
      if (menuGameTitle) menuGameTitle.textContent = tr("gameTitle", menuGameTitle.textContent);
      if (menuCreditsGame) menuCreditsGame.textContent = tr("creditsGame", menuCreditsGame.textContent);
      if (menuCreditsMusic) menuCreditsMusic.textContent = tr("musicByPrefix", "Music by ") + tr("musicAuthor", "JimmyQrg");
      if (menuZombieArenaHeading) menuZombieArenaHeading.textContent = tr("zombieArenaTitle", menuZombieArenaHeading.textContent);
      if (btnArena) btnArena.textContent = tr("btnZombieArena", btnArena.textContent);
      if (btnTraining) btnTraining.textContent = tr("btnTrainingCamp", btnTraining.textContent);
      const menuTrainingHeading = document.getElementById("menuTrainingHeading");
      const menuTrainingDesc = document.getElementById("menuTrainingDesc");
      if (menuTrainingHeading) menuTrainingHeading.textContent = tr("trainingCampTitle", menuTrainingHeading.textContent);
      if (menuTrainingDesc) menuTrainingDesc.textContent = tr("trainingCampDesc", menuTrainingDesc.textContent);
      if (btnTrainingSingle) btnTrainingSingle.textContent = tr("btnSingleplayer", btnTrainingSingle.textContent);
      if (btnTrainingCoop) btnTrainingCoop.textContent = tr("btnCoopMode", btnTrainingCoop.textContent);
      /* btnTrainingBack is now an SVG back icon — no text update needed */
      const trainingScoreTitle = document.getElementById("trainingScoreTitle");
      if (trainingScoreTitle) trainingScoreTitle.textContent = tr("trainingScoreTitle", trainingScoreTitle.textContent);
      const lblMap = {
        trainingLblYou: "trainingScoreYou",
        trainingLblTeam: "trainingScoreTeam",
        trainingLblHits: "trainingScoreHits",
        trainingLblHead: "trainingScoreHead",
        trainingLblBody: "trainingScoreBody",
        trainingLblLeg: "trainingScoreLeg",
        trainingLblAcc: "trainingScoreAcc",
      };
      for (const [elId, key] of Object.entries(lblMap)) {
        const el = document.getElementById(elId);
        if (el) el.textContent = tr(key, el.textContent);
      }
      if (btnCrossfire) btnCrossfire.textContent = tr("btnCrossfire", btnCrossfire.textContent);
      const menuSettingsBtn = document.getElementById("btnMenuSettings");
      const pvpTitle = document.querySelector("#menuPvpMaps h2");
      const pvpDesc = document.querySelector("#menuPvpMaps p");
      /* btnMenuSettings is now a gear SVG icon — no text update needed */
      if (pvpTitle) pvpTitle.textContent = tr("pvpMapTitle", pvpTitle.textContent);
      if (pvpDesc) pvpDesc.textContent = tr("pvpMapDesc", pvpDesc.textContent);
      if (btnArenaSingle) btnArenaSingle.textContent = tr("btnSingleplayer", btnArenaSingle.textContent);
      if (btnArenaCoop) btnArenaCoop.textContent = tr("btnCoopMode", btnArenaCoop.textContent);
      /* btnArenaBack is now an SVG back icon — no text update needed */
      if (btnPvpMapClassic) btnPvpMapClassic.textContent = tr("pvpMapClassic", btnPvpMapClassic.textContent);
      if (btnPvpMapGrid) btnPvpMapGrid.textContent = tr("pvpMapGrid", btnPvpMapGrid.textContent);
      /* btnPvpMapBack is now an SVG back icon — no text update needed */
      if (btnQuickplay) btnQuickplay.textContent = tr("btnQuickPlay", btnQuickplay.textContent);
      if (btnCreateRoom) btnCreateRoom.textContent = tr("btnCreateRoom", btnCreateRoom.textContent);
      if (btnJoinCode) btnJoinCode.textContent = tr("btnJoinViaCode", btnJoinCode.textContent);
      /* btnLobbyBack is now an SVG back icon — no text update needed */
      const joinTitle = document.querySelector("#menuJoinCode h2");
      if (joinTitle) joinTitle.textContent = tr("joinViaCodeTitle", joinTitle.textContent);
      if (codeInput) codeInput.placeholder = tr("roomCodePlaceholder", codeInput.placeholder || "ROOM CODE");
      if (btnCodeJoin) btnCodeJoin.textContent = tr("btnJoin", btnCodeJoin.textContent);
      /* btnCodeBack is now an SVG back icon — no text update needed */
      const fpsChat = document.getElementById("fpsChatHint");
      const fpsLight = document.getElementById("fpsHintFlash");
      const fpsZoom = document.getElementById("fpsHintZoom");
      if (fpsChat) fpsChat.textContent = tr("hudHelpChat", fpsChat.textContent);
      if (fpsLight) fpsLight.textContent = tr("hudHelpLight", fpsLight.textContent);
      if (fpsZoom) fpsZoom.textContent = tr("hudHelpZoom", fpsZoom.textContent);
      const hintEl = document.getElementById("hint");
      if (hintEl) hintEl.textContent = tr("hintClick", hintEl.textContent || "Click anywhere");
      const medkitHoldEl = document.querySelector(".medkit-hold-txt");
      if (medkitHoldEl) medkitHoldEl.textContent = tr("medkitHold", medkitHoldEl.textContent || "HOLD");
      const blindTextEl = document.getElementById("blindText");
      if (blindTextEl) blindTextEl.textContent = tr("hudSlowed", "IMMOBILIZED");
      const tabAudio = document.getElementById("settingsTabAudio");
      const tabGfx = document.getElementById("settingsTabGraphics");
      const tabLang = document.getElementById("settingsTabLanguage");
      const hAudio = document.getElementById("settingsHeadingAudio");
      const hGfx = document.getElementById("settingsHeadingGraphics");
      if (tabAudio) tabAudio.textContent = tr("settingsTabAudio", tabAudio.textContent);
      if (tabGfx) tabGfx.textContent = tr("settingsTabGraphics", tabGfx.textContent);
      if (tabLang) tabLang.textContent = tr("settingsTabLanguage", tabLang.textContent);
      if (hAudio) hAudio.textContent = tr("settingsAudioH", hAudio.textContent);
      if (hGfx) hGfx.textContent = tr("settingsGraphicsH", hGfx.textContent);
      const hLang = document.getElementById("settingsHeadingLanguage");
      const lLang = document.getElementById("languageLabel");
      const pLang = document.getElementById("languageHint");
      if (hLang) hLang.textContent = tr("settingsLanguageH", tr("settingsLangTitle", hLang.textContent));
      if (lLang) lLang.textContent = tr("languagePickLabel", tr("settingsLangLabel", lLang.textContent));
      if (pLang) pLang.textContent = tr("settingsLangHint", pLang.textContent);
      const tabCtrl = document.getElementById("settingsTabControls");
      const hCtrl = document.getElementById("settingsHeadingControls");
      const lSens = document.getElementById("lookSensLabelText");
      const pSens = document.getElementById("lookSensHint");
      if (tabCtrl) tabCtrl.textContent = tr("settingsTabControls", tabCtrl.textContent);
      if (hCtrl) hCtrl.textContent = tr("settingsControlsTitle", hCtrl.textContent);
      if (lSens) lSens.textContent = tr("settingsLookSensLabel", lSens.textContent);
      if (pSens) pSens.textContent = tr("settingsLookSensHint", pSens.textContent);
      const lAdsSens = document.getElementById("adsLookSensLabelText");
      const pAdsSens = document.getElementById("adsLookSensHint");
      if (lAdsSens) lAdsSens.textContent = tr("settingsAdsLookSensLabel", lAdsSens.textContent);
      if (pAdsSens) pAdsSens.textContent = tr("settingsAdsLookSensHint", pAdsSens.textContent);
      const lSkip = document.getElementById("skipClickToPlayLabel");
      const pSkip = document.getElementById("skipClickToPlayHint");
      if (lSkip) lSkip.textContent = tr("settingsSkipClickLabel", lSkip.textContent);
      if (pSkip) pSkip.textContent = tr("settingsSkipClickHint", pSkip.textContent);
      const btnAch = document.getElementById("btnAchievements");
      /* btnAchievements is now a trophy SVG icon — no text update needed */
      const achTitle = document.getElementById("achMenuTitle");
      const achHint = document.getElementById("achMenuHint");
      if (achTitle) achTitle.textContent = tr("achTitle", achTitle.textContent);
      if (achHint) achHint.textContent = tr("achPanelHint", achHint.textContent);
      const btnAchBack = document.getElementById("btnAchBack");
      /* btnAchBack is now an SVG back icon — no text update needed */
      const hData = document.getElementById("settingsHeadingData");
      const btnCreator = document.getElementById("btnCreatorUnlock");
      const pCreator = document.getElementById("settingsCreatorHint");
      const btnDelete = document.getElementById("btnDeleteAllData");
      const pDelete = document.getElementById("settingsDeleteHint");
      if (hData) hData.textContent = tr("settingsHeadingData", hData.textContent);
      if (btnCreator) btnCreator.textContent = tr("btnCreatorUnlock", btnCreator.textContent);
      if (pCreator) pCreator.textContent = tr("settingsCreatorHint", pCreator.textContent);
      if (btnDelete) btnDelete.textContent = tr("btnDeleteAllData", btnDelete.textContent);
      if (pDelete) pDelete.textContent = tr("settingsDeleteHint", pDelete.textContent);
      // v95: declarative i18n sweep — every element with data-i18n gets translated automatically.
      // Previously ~42 elements were marked with data-i18n but NOTHING ever read them, so they
      // stayed in whatever language was hardcoded in the HTML. This single pass fixes the bulk of
      // "buttons aren't translated" complaints (BOSS FIGHT, HELL MODE, START, SELECT DIFFICULTY, ...).
      try {
        for (const el of document.querySelectorAll("[data-i18n]")) {
          const key = el.dataset.i18n;
          if (key) {
            const translated = tr(key, "");
            if (translated) el.textContent = translated;
          }
        }
        for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
          const key = el.dataset.i18nPlaceholder;
          if (key) {
            const translated = tr(key, "");
            if (translated) el.placeholder = translated;
          }
        }
        for (const el of document.querySelectorAll("[data-i18n-aria-label]")) {
          const key = el.dataset.i18nAriaLabel;
          if (key) {
            const translated = tr(key, "");
            if (translated) el.setAttribute("aria-label", translated);
          }
        }
      } catch (_) {}
      try {
        renderAchievementsPanel();
      } catch (_) {}
      try {
        refreshFpsHelpForMap();
      } catch (_) {}
      // v96: rebuild hotbar + inv bar so weapon names follow the new language.
      try { if (typeof _buildHotbarSettings === "function") _buildHotbarSettings(); } catch (_) {}
      try { if (typeof _buildInvBar === "function") _buildInvBar(); } catch (_) {}
    }

    let CURRENT_MAP = "arena";
    /** Set from PVP map picker; used when `pendingLobbyMode === "crossfire"`. */
    let PENDING_PVP_MAP = "crossfire";

    const PVP_SPAWN_POINTS = {
      crossfire: [
        { x: 0, z: 34 }, { x: 0, z: -34 },
        { x: 34, z: 0 }, { x: -34, z: 0 },
        { x: 28, z: 28 }, { x: -28, z: -28 },
        { x: 32, z: -24 }, { x: -32, z: 24 },
        { x: 15, z: 34 }, { x: -15, z: -34 },
        { x: 34, z: 15 }, { x: -34, z: -15 },
        { x: 38, z: 38 }, { x: -38, z: -38 },
        { x: -38, z: 38 }, { x: 38, z: -38 },
      ],
      crossfire_grid: [
        { x: 0, z: 22 }, { x: 0, z: -22 },
        { x: 22, z: 0 }, { x: -22, z: 0 },
        { x: 18, z: 18 }, { x: -18, z: -18 },
        { x: 18, z: -18 }, { x: -18, z: 18 },
        { x: 10, z: 24 }, { x: -10, z: -24 },
        { x: 24, z: 10 }, { x: -24, z: -10 },
        { x: 26, z: 26 }, { x: -26, z: -26 },
        { x: -26, z: 26 }, { x: 26, z: -26 },
      ],
      pvp_bright: [
        { x: 0, z: 34 }, { x: 0, z: -34 },
        { x: 34, z: 0 }, { x: -34, z: 0 },
        { x: 28, z: 28 }, { x: -28, z: -28 },
        { x: 28, z: -28 }, { x: -28, z: 28 },
        { x: 18, z: 36 }, { x: -18, z: -36 },
        { x: 36, z: 18 }, { x: -36, z: -18 },
        { x: 38, z: 38 }, { x: -38, z: -38 },
        { x: -38, z: 38 }, { x: 38, z: -38 },
      ],
    };
    let _lastPvpSpawnIdx = -1;
    function pickPvpSpawn(mapName) {
      const pts = PVP_SPAWN_POINTS[mapName];
      if (!pts || pts.length === 0) return { x: 0, z: 22 };
      let idx;
      do { idx = (Math.random() * pts.length) | 0; } while (idx === _lastPvpSpawnIdx && pts.length > 1);
      _lastPvpSpawnIdx = idx;
      return pts[idx];
    }

    function drawPvpMapPreviews() {
      const classic = document.getElementById("pvpPreviewClassic");
      const grid = document.getElementById("pvpPreviewGrid");
      if (classic && !classic._drawn) {
        const c = classic.getContext("2d");
        const w = classic.width, h = classic.height;
        // Dark concrete arena with atmospheric fog.
        const sky = c.createLinearGradient(0, 0, 0, h * 0.45);
        sky.addColorStop(0, "#1a1e2a");
        sky.addColorStop(1, "#2c3040");
        c.fillStyle = sky;
        c.fillRect(0, 0, w, h * 0.45);
        c.fillStyle = "#22272e";
        c.fillRect(0, h * 0.45, w, h * 0.55);
        // Walls and pillars silhouettes.
        c.fillStyle = "#181c24";
        c.fillRect(20, h * 0.18, 28, h * 0.55);
        c.fillRect(70, h * 0.12, 22, h * 0.6);
        c.fillRect(140, h * 0.22, 26, h * 0.5);
        c.fillRect(180, h * 0.15, 20, h * 0.58);
        // Floor grid lines.
        c.strokeStyle = "rgba(80,95,120,0.25)";
        c.lineWidth = 1;
        for (let y = h * 0.5; y < h; y += 12) {
          c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
        }
        // Atmospheric glow.
        const glow = c.createRadialGradient(w / 2, h * 0.35, 10, w / 2, h * 0.35, 90);
        glow.addColorStop(0, "rgba(100,140,200,0.12)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = glow;
        c.fillRect(0, 0, w, h);
        classic._drawn = true;
      }
      if (grid && !grid._drawn) {
        const c = grid.getContext("2d");
        const w = grid.width, h = grid.height;
        // Bright textile-toned killhouse.
        const sky = c.createLinearGradient(0, 0, 0, h * 0.45);
        sky.addColorStop(0, "#c8d0da");
        sky.addColorStop(1, "#a0aab8");
        c.fillStyle = sky;
        c.fillRect(0, 0, w, h * 0.45);
        c.fillStyle = "#8a94a4";
        c.fillRect(0, h * 0.45, w, h * 0.55);
        // Grid walls.
        c.fillStyle = "#6a7488";
        for (let x = 30; x < w; x += 44) {
          const wh = 20 + Math.random() * 30;
          c.fillRect(x, h * 0.25, 16, h * 0.48);
        }
        // Floor grid.
        c.strokeStyle = "rgba(60,70,90,0.3)";
        c.lineWidth = 1;
        for (let y = h * 0.48; y < h; y += 10) {
          c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
        }
        for (let x = 10; x < w; x += 22) {
          c.beginPath(); c.moveTo(x, h * 0.48); c.lineTo(x, h); c.stroke();
        }
        // Daylight glow.
        const glow = c.createRadialGradient(w / 2, h * 0.2, 20, w / 2, h * 0.2, 110);
        glow.addColorStop(0, "rgba(255,255,240,0.18)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = glow;
        c.fillRect(0, 0, w, h);
        grid._drawn = true;
      }
    }
    function isPvpCrossfireMap(m) {
      return m === "crossfire" || m === "crossfire_grid" || m === "pvp_bright";
    }
    function isTrainingMap(m) {
      return m === "training";
    }
    function isArenaLikeMap(m) {
      return m === "arena";
    }
    function isBossArenaMap(m) {
      return m === "boss_arena";
    }
    function isBrightIndoorMap(m) {
      return m === "crossfire_grid" || m === "training" || m === "pvp_bright";
    }
    let TRAINING_COOP = false;
    const TRAINING_POINTS = { head: 100, body: 50, leg: 25 };
    /**
     * Training-range roster. `kind` picks both the model and the HP:
     *   recruit                     → player avatar at 100 HP (identical to a real player)
     *   normal / fast / gunner / tank → the real zombie models at their real HP
     *                                   (100 / 70 / 75 / 180), so the time-to-kill you
     *                                   practise here is the same one you get in the arena
     *   boss                        → the Hormone Zombie at its real 15 000 HP, for
     *                                   sustained-damage / mag-dump tests
     * A `lane` makes the target patrol between xMin..xMax; without one it stands still.
     * The player spawns at (0, 22) facing -Z, so everything is laid out down-range.
     */
    const TRAINING_TARGETS = [
      // ── Near line: moving man-sized targets (the original five lanes) ──
      { kind: "recruit", lane: { xMin: -15, xMax: -11, z: -14, speed: 2.0 } },
      { kind: "recruit", lane: { xMin: -4, xMax: 0, z: -14, speed: 2.35 } },
      { kind: "recruit", lane: { xMin: 7, xMax: 11, z: -14, speed: 1.85 } },
      { kind: "recruit", lane: { xMin: -11, xMax: -7, z: -18, speed: 2.15 } },
      { kind: "recruit", lane: { xMin: 3, xMax: 7, z: -18, speed: 2.5 } },
      // ── Mid line: one static zombie of every type, left→right, weakest→toughest ──
      { kind: "normal", x: -19, z: -27 },
      { kind: "fast", x: -6.5, z: -27 },
      { kind: "gunner", x: 6.5, z: -27 },
      { kind: "tank", x: 19, z: -27 },
      // ── Far line: moving zombies — a sprinter and a shambler ──
      { kind: "fast", lane: { xMin: -26, xMax: -14, z: -33, speed: 5.4 } },
      { kind: "normal", lane: { xMin: 14, xMax: 26, z: -33, speed: 2.2 } },
      // ── Back of the range: the boss ──
      { kind: "boss", x: 0, z: -39 },
    ];
    /** Seconds a downed target stays dissolved before standing back up at full HP. */
    const TRAINING_RESPAWN_SEC = 3.0;
    function freshTrainingStats() {
      return { points: 0, hits: 0, head: 0, body: 0, leg: 0, shots: 0 };
    }
    let trainingStats = { you: freshTrainingStats(), team: freshTrainingStats() };
    let MULTIPLAYER = false;
    /** True only for Zombie Arena played via ARENA CO-OP lobby (no damage vs other players). */
    let ARENA_COOP = false;
    /** First player in the Socket.IO room runs zombie AI + broadcasts sync (arena co-op). */
    let ZOMBIE_AUTHORITY = false;
    /** False until first `zombieHost` in arena co-op (nobody runs zombie AI until then). */
    let ZOMBIE_HOST_KNOWN = true;
    let _spawnRng = null;
    let _zombieSyncAcc = 0;
    let ROOM_CODE = "";
    let pendingLobbyMode = "";
    /** The exact `mode` string last sent to the relay (createRoom/quickplay/joinByCode). Used by
     *  normalizeMatchAck when it must synthesize a roomKey from a bare code, so the right mode is used. */
    let _pendingServerMode = "";
    let BOSS_FIGHT_COUNT = 1;
    let BOSS_HELL_MODE = false;
    let DEV_GUN_UNLOCKED = false;
    let CREATOR_UNLOCKED = false;
    let BOSS_ROUND = 1;
    let BOSS_ROUND_ACTIVE = false;
    let bossDeathPickupPos = null;
    // ── Boss 震 cycle mechanic ──────────────────────────────────────────────
    const BOSS_SHAKE_CYCLE_MS = 15000;  // 15s per cycle
    const BOSS_DASH_LOCK_MS   = 11000;  // locked for first 11s
    const BOSS_DASH_WIN_MS    = 4000;   // open for last 4s
    let bossShakeTimerMs = 0;           // ms elapsed (advances only when boss alive)
    // ── Speed Needle constants ──────────────────────────────────────────────
    const NEEDLE_INJECT_DUR_MS = 680;   // ms: injection animation
    const NEEDLE_BOOST_MS      = 5000;  // ms: speed ×2
    const NEEDLE_WEAK_MS       = 5000;  // ms: speed ×0.25 (weakness after)
    // ── Jet harness (P) ─────────────────────────────────────────────────────
    // Strap-on thruster. Costs JET_STRAP_MS to put on (vulnerable — no firing, no dash),
    // then for JET_ACTIVE_MS the dash flies along the full look vector instead of staying
    // horizontal. The dash covers the SAME distance at every angle because the direction is
    // a unit vector and updatePlayer integrates `dashRemainingDist` along it — straight up
    // travels exactly as far as straight ahead.
    const JET_STRAP_MS        = 3000;   // ms: strapping the harness on
    const JET_ACTIVE_MS       = 10000;  // ms: flight window once it is on
    /**
     * Cooldown after the flight window closes. Flight costs NO stamina — the harness never
     * eats into your ground mobility. What limits it is this: once the 10 s window ends you
     * wait another 10 s before you can strap in again.
     */
    const JET_COOLDOWN_MS     = 10000;
    /** Drop (world units) that turns a landing lethal. One vertical dash climbs JET_DASH_DIST. */
    const JET_FATAL_FALL_DROP = 12.0;
    /** Warn once the player is this far above the surface they last stood on. */
    const JET_FALL_WARN_DROP  = 9.0;
    let hellLootRing = null;       // 地狱boss死亡光圈

    function clearHellLootRing() {
      if (!hellLootRing) return;
      scene.remove(hellLootRing);
      hellLootRing.material.dispose();
      hellLootRing.geometry.dispose();
      hellLootRing = null;
    }
    let BOSS_IS_COOP = false;
    const bossProjectiles = [];
    let started = false;
    /** False during boot overlay: no movement, shooting, zombie AI, or damage until map + assets are ready. */
    let gameWorldReady = false;
    let paused = false;
    let chatOpen = false;
    let playerName = "Player";
    let killerEnemy = null;
    const hitIndicators = [];
    const HIT_DIR_SVG_W = 100;
    const HIT_DIR_SVG_H = Math.round((HIT_DIR_SVG_W * 81) / 256);
    /** Chevron points upward in viewBox (+y down); ring offset uses forward-relative bearing so front→top, back→bottom. */
    const HIT_DIR_SVG_PATH =
      "M133.333 13.0913C184.371 14.8246 229.131 41.3388 256 81C226.143 45.1073 179.905 22.0718 128 22.0718C76.096 22.0718 29.8567 45.107 0 81C26.8684 41.339 71.6293 14.8249 122.666 13.0913L128 0L133.333 13.0913Z";
    let deathAnimTime = 0;
    const DEATH_ANIM_DURATION = 2.0;
    // Revive flow: 5-second countdown ring; clicking WATCH AD or GIVE UP cancels it.
    // reviveAdWatchedThisLife persists so the second death in the same match goes
    // straight to the existing DEFEAT UI. reviveFlowActive gates the rest of the
    // death-overlay wiring so the existing showDeathScreen() / updateDeathAnim()
    // code doesn't fight the new UI.
    const REVIVE_COUNTDOWN_MS = 5000;
    const REVIVE_RING_CIRC = 2 * Math.PI * 42; // r=42 in the SVG above.
    let reviveFlowActive = false;
    let reviveCountdownStartMs = 0;
    let reviveAdWatchedThisLife = false;
    let reviveAdInProgress = false;
    let reviveAdTimerHandle = null;
    let reviveAdSuccessHandle = null;
    const lastPlayerHitWorld = new THREE.Vector3();
    let localDeathGhostGroup = null;
    let deathCamYaw = 0;
    let deathCamPitch = 0;
    let deathBaseFov = 75;

    let _renderTick = 0;
    let _fpsFrames = 0;
    let _fpsTimeAccum = 0;
    function tickFpsMeter(dt) {
      _fpsFrames++;
      _fpsTimeAccum += dt;
      if (_fpsTimeAccum >= 0.5 && fpsValueEl) {
        fpsValueEl.textContent = `${Math.round(_fpsFrames / _fpsTimeAccum)} FPS`;
        _fpsFrames = 0;
        _fpsTimeAccum = 0;
      }
    }

    const PLAYER_LIGHT_COLOR = 0xfff0d4;
    // Soft body halo (local camera only) — stronger so it still reads in the arena next to many maze lights.
    const PLAYER_BODY_INTENSITY = 10;
    const PLAYER_BODY_DISTANCE = 300;

    // Dual-cone flashlight: narrower cones + lower penumbra so the beam stays tight instead of flooding.
    const FLASH_OUTER_INTENSITY = 30;
    const FLASH_OUTER_DISTANCE = 350;
    const FLASH_OUTER_ANGLE = Math.PI / 6;
    const FLASH_OUTER_PEN = 0.32;

    const FLASH_INNER_INTENSITY = 150;
    const FLASH_INNER_DISTANCE = 100;
    const FLASH_INNER_ANGLE = Math.PI / 16;
    const FLASH_INNER_PEN = 0.08;

    /** Z cycles 小→中→大 (narrow beam / default / wide flood). Index 1 matches FLASH_OUTER_* defaults. */
    const FLASH_BEAM_LEVELS = [
      { outerA: Math.PI / 10, innerA: Math.PI / 26, outerP: 0.2, innerP: 0.045 },
      { outerA: FLASH_OUTER_ANGLE, innerA: FLASH_INNER_ANGLE, outerP: FLASH_OUTER_PEN, innerP: FLASH_INNER_PEN },
      { outerA: Math.PI / 4.0, innerA: Math.PI / 11, outerP: 0.48, innerP: 0.16 },
    ];

    /**
     * Punctual lights only (Point / Spot). Hemisphere & directional lights have no decay in Three.js.
     * https://threejs.org/docs/#api/en/lights/PointLight
     * https://threejs.org/docs/#api/en/lights/SpotLight
     */
    const ENVIRONMENT_LIGHT_DECAY = 3;
    const PLAYER_BODY_LIGHT_DECAY = 3;
    const FLASHLIGHT_LIGHT_DECAY = 0.1;

    function createPhysicalPointLight(color, intensity, distance, decay = ENVIRONMENT_LIGHT_DECAY) {
      return new THREE.PointLight(color, intensity, distance, decay);
    }

    function createPhysicalSpotLight(color, intensity, distance, angle, penumbra, decay = ENVIRONMENT_LIGHT_DECAY) {
      return new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
    }

    function createOfflineSocketStub() {
      return {
        id: "offline",
        get connected() { return false; },
        on() {},
        emit(_ev, ...args) {
          const last = args[args.length - 1];
          if (typeof last !== "function") return;
          const reply = (payload) => queueMicrotask(() => last(payload));
          if (_ev === "joinRoom") {
            reply({ ok: true, hostId: "offline", roomKey: String(args[0] || "") });
            return;
          }
          if (_ev === "quickplay" || _ev === "createRoom") {
            const mode = String(args[0] || "arena");
            const code = (Math.random().toString(36).slice(2, 8) + "XX").slice(0, 6).toUpperCase();
            reply({ roomKey: `${mode}:${code}`, room: code, code });
            return;
          }
          if (_ev === "joinByCode") {
            const payload = args[0] || {};
            const code = String(payload.code || "LOCAL").toUpperCase();
            const mode = String(payload.mode || "arena");
            reply({ roomKey: `${mode}:${code}`, room: code, code });
            return;
          }
          reply({ error: "Network unavailable (Socket.IO not loaded or offline stub)" });
        },
        disconnect() {},
      };
    }

    function showLobbyErr(msg) {
      if (lobbyError) lobbyError.textContent = msg || "";
    }

    function clearLobbyErr() {
      if (lobbyError) lobbyError.textContent = "";
    }

    /**
     * Relay servers differ: some send roomKey, others only `code` / `room`, or nest under `data`.
     * Normalize so we always get a non-empty roomKey for joinRoom + sync.
     */
    function mpAckPickStr(v) {
      if (v == null) return "";
      if (typeof v === "string") return v.trim();
      if (typeof v === "number" && Number.isFinite(v)) return String(v);
      return "";
    }

    /** Flatten common relay shapes: data / payload / result / body (same-level or under data). */
    function mpAckSources(res) {
      const out = [];
      if (!res || typeof res !== "object") return out;
      out.push(res);
      const data = res.data;
      const inner = data && typeof data === "object" ? data : null;
      if (inner) out.push(inner);
      const nests = [res, inner];
      for (const n of nests) {
        if (!n) continue;
        for (const k of ["payload", "result", "body"]) {
          const v = n[k];
          if (v && typeof v === "object") out.push(v);
        }
      }
      return out;
    }

    function normalizeMatchAck(res) {
      if (!res || typeof res !== "object") {
        return { error: tr("mpNoServerAck", "No response from server.") };
      }
      if (res.error != null && res.error !== false && res.error !== "") {
        return { error: String(res.error) };
      }
      if (res.ok === false) {
        return { error: String(res.message || res.reason || "Request rejected.") };
      }
      const inner = res.data && typeof res.data === "object" ? res.data : res;
      if (inner.ok === false) {
        return { error: String(inner.message || inner.reason || "Request rejected.") };
      }
      if (inner.success === false || res.success === false) {
        return { error: String(inner.message || res.message || "Matchmaking failed.") };
      }

      const sources = mpAckSources(res);

      let roomKey = "";
      const tryRoomKeys = (src) => [
        src.roomKey,
        src.sessionId,
        src.matchId,
        src.roomId,
        src.id,
        src.uuid,
      ];
      outerPick: for (const src of sources) {
        for (const v of tryRoomKeys(src)) {
          const s = mpAckPickStr(v);
          if (s) {
            roomKey = s;
            break outerPick;
          }
        }
      }

      let shortCode = "";
      const tryCodes = (src) => [
        src.code,
        src.roomCode,
        src.joinCode,
        src.shortCode,
      ];
      outerCode: for (const src of sources) {
        for (const v of tryCodes(src)) {
          const s = mpAckPickStr(v);
          if (s) {
            shortCode = s;
            break outerCode;
          }
        }
      }

      if (!roomKey) {
        for (const src of sources) {
          const ds = mpAckPickStr(src.data);
          if (ds && ds.includes(":")) {
            roomKey = ds;
            break;
          }
          if (!shortCode && ds && /^[A-Z0-9_-]{3,}$/i.test(ds)) shortCode = ds;
        }
      }

      let roomStr = "";
      for (const src of sources) {
        const r = mpAckPickStr(src.room);
        if (r) {
          roomStr = r;
          break;
        }
      }
      if (!shortCode && roomStr && !roomStr.includes(":")) {
        shortCode = roomStr;
      }
      if (!roomKey && roomStr.includes(":")) {
        roomKey = roomStr;
      }
      if (!roomKey && shortCode) {
        // Prefer the exact mode we just sent (carries the PVP map variant) so a server that returns
        // only a bare code doesn't collapse "crossfire_grid" back into "crossfire" and desync the map.
        const fallbackMode = _pendingServerMode || pendingLobbyMode;
        if (fallbackMode) roomKey = `${fallbackMode}:${shortCode}`;
      }
      if (!roomKey && shortCode) {
        roomKey = shortCode;
      }

      let roomCode = shortCode || (roomKey.includes(":") ? roomKey.split(":").pop() : roomKey);
      if (!roomKey) {
        return {
          error: tr(
            "mpMissingRoomId",
            "Server response missing room id. Ask relay admin to return roomKey or code for quickplay/createRoom."
          ),
        };
      }
      return { roomKey, roomCode: roomCode || roomKey };
    }

    function getMultiplayerOrigin() {
      // Precedence: manual URL > local-discovered URL > meta tag (default) > page origin.
      // All three are absolute URLs (http:// or https://) with optional paths; trailing
      // slash is normalized away.
      try {
        const fromSettings = (() => {
          if (typeof gameSettings === "undefined" || !gameSettings) return "";
          if (gameSettings.serverMode === "manual" && gameSettings.serverManualUrl) {
            return gameSettings.serverManualUrl;
          }
          if (gameSettings.serverMode === "local" && gameSettings.serverLocalUrl) {
            return gameSettings.serverLocalUrl;
          }
          return "";
        })();
        if (fromSettings) return fromSettings.replace(/\/+$/, "");
        const m = document.querySelector('meta[name="game-multiplayer-origin"]');
        const raw = m && m.content != null ? String(m.content).trim() : "";
        return (raw || window.location.origin).replace(/\/$/, "");
      } catch (_) {
        return window.location.origin.replace(/\/$/, "");
      }
    }

    const multiplayerOrigin = getMultiplayerOrigin();

    const _ioFactory = typeof globalThis.io === "function" ? globalThis.io : null;
    if (!_ioFactory) {
      console.warn(
        "[multiplayer] socket.io-client not available (CDN blocked or script order). Using offline stub."
      );
    }

    const socket = _ioFactory
      ? _ioFactory(`${multiplayerOrigin}/game`, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 12,
          reconnectionDelay: 800,
          timeout: 20000,
        })
      : createOfflineSocketStub();

    let activeRoomId = "";
    let _joinRoomGeneration = 0;

    /** Sets zombie sim authority from server ack (works even if `zombieHost` broadcast is delayed or dropped). */
    function emitJoinRoomWithAck() {
      if (!activeRoomId || !MULTIPLAYER) return;
      if (typeof socket.emit !== "function") return;
      const gen = ++_joinRoomGeneration;
      socket.emit("joinRoom", activeRoomId, (ack) => {
        if (gen !== _joinRoomGeneration) return;
        if (!ack || !ack.ok) return;
        if (MULTIPLAYER && ARENA_COOP && (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP))) {
          ZOMBIE_HOST_KNOWN = true;
          if (ack.hostId != null) {
            ZOMBIE_AUTHORITY = String(ack.hostId) === String(socket.id);
          }
        }
      });
    }

    const remotePlayers = new Map();

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      if (activeRoomId && MULTIPLAYER) emitJoinRoomWithAck();
    });
    // On back/forward (bfcache) restore the WebSocket is frozen and killed — force a
    // clean reconnect so multiplayer resumes instead of sitting on a dead socket.
    window.addEventListener("pageshow", (e) => {
      if (e.persisted && typeof socket.connect === "function") {
        try { socket.connect(); } catch (_) {}
      }
    });
    socket.on("connect_error", (err) => {
      console.warn("Socket connect_error:", err?.message || err);
    });
    socket.on("enemyMove", (data) => {
      let rp = remotePlayers.get(data.id);
      if (!rp) {
        rp = createRemotePlayer(data.name);
        remotePlayers.set(data.id, rp);
        scene.add(rp.group);
        if (data.achievement) updateNameSprite(rp, rp.name, data.achievement);
      }
      rp.x = data.x;
      rp.y = data.y;
      rp.z = data.z;
      rp.yaw = data.yaw || 0;
      if (data.name && data.name !== rp.name) {
        rp.name = data.name;
        updateNameSprite(rp, data.name, data.achievement || null);
      } else if (data.achievement !== undefined && data.achievement !== rp.equippedAchievement) {
        updateNameSprite(rp, rp.name, data.achievement || null);
      }
      let rawWeapon;
      if (data) {
        if (data.weapon !== undefined && data.weapon !== null) rawWeapon = data.weapon;
        else if (data.weaponIndex !== undefined && data.weaponIndex !== null) rawWeapon = data.weaponIndex;
        else if (data.w !== undefined && data.w !== null) rawWeapon = data.w;
      }
      // Clamp to the real weapon range (0..8). This used to be `% 7`, which folded the
      // knife (7) onto the pistol and the dev gun (8) onto the AR — so you could never tell
      // an opponent was holding a knife.
      const wNorm =
        rawWeapon !== undefined && rawWeapon !== null
          ? THREE.MathUtils.clamp(Number(rawWeapon) | 0, 0, weapons.length - 1)
          : rp.currentWeapon;
      if (rawWeapon !== undefined && rawWeapon !== null && wNorm !== rp.currentWeapon) {
        try {
          equipRemotePlayerWeapon(rp, wNorm);
        } catch (_) {}
      }
      rp.isReloading = !!data.reloading;
      rp.ads = !!data.ads;
      // Jet harness. Absent field (older client / never used) means 0 — no pack is shown.
      rp.jetState = THREE.MathUtils.clamp(Number(data.jet) | 0, 0, 2);
      rp.crouch = THREE.MathUtils.clamp((Number(data.crouch) || 0) / 100, 0, 1);
      const packedArm = Number(data.arm) || 0;
      rp.armorHelmet = THREE.MathUtils.clamp((packedArm / 4) | 0, 0, ARMOR_HELMETS.length - 1);
      rp.armorVest = THREE.MathUtils.clamp(packedArm % 4, 0, ARMOR_VESTS.length - 1);
      applyRemoteJetPack(rp);
      rp.remotePitch =
        typeof data.pitch === "number"
          ? THREE.MathUtils.clamp(data.pitch, -1.15, 1.15)
          : 0;
      if (rp.isDown) {
        // Body came back alive (server respawn or new round) — clear prediction.
        const sinceDown = performance.now() - (rp.downAt || 0);
        if (sinceDown > 1200) {
          rp.isDown = false;
          rp.hpEstimate = 100;
          rp.group.visible = true;
        }
      } else {
        rp.group.visible = true;
      }
    });

    /** PvP: optional relay event — remote body hidden immediately on death; `enemyMove` shows again on respawn. */
    socket.on("playerDown", (data) => {
      if (!data || data.id == null) return;
      const rp = remotePlayers.get(data.id);
      if (!rp || !rp.group) return;
      const hx = rp.visX ?? rp.x ?? 0;
      const hz = rp.visZ ?? rp.z ?? 0;
      const hitPt = new THREE.Vector3(
        data.x != null ? +data.x : hx,
        data.y != null ? +data.y : 1.25,
        data.z != null ? +data.z : hz
      );
      // If shooter already predicted the kill locally we still get the broadcast — skip duplicate dissolve.
      const alreadyDown = rp.isDown && (performance.now() - (rp.downAt || 0) < 1500);
      if (!alreadyDown) {
        spawnHumanoidDissolve(rp.group, hitPt);
      }
      rp.isDown = true;
      rp.downAt = performance.now();
      rp.hpEstimate = 0;
      rp.group.visible = false;
    });

    socket.on("enemyLeft", (data) => {
      const rp = remotePlayers.get(data.id);
      if (rp) {
        scene.remove(rp.group);
        remotePlayers.delete(data.id);
      }
    });

    socket.on("playerRespawn", (data) => {
      if (!data || data.id == null) return;
      const rp = remotePlayers.get(data.id);
      if (rp) {
        rp.isDown = false;
        rp.hpEstimate = 100;
        rp.group.visible = true;
      }
    });

    function dartSlowVictimSocketId(data) {
      if (!data) return "";
      const candidates = [
        data.target,
        data.targetId,
        data.slowTarget,
        data.blindTarget,
        data.victim,
        data.to,
      ];
      for (let i = 0; i < candidates.length; i++) {
        if (candidates[i] != null && candidates[i] !== "") return String(candidates[i]);
      }
      return "";
    }

    function dartSlowDurationFromData(data) {
      if (!data) return 5;
      if (typeof data.slowDuration === "number" && isFinite(data.slowDuration)) return data.slowDuration;
      if (typeof data.duration === "number" && isFinite(data.duration)) return data.duration;
      if (typeof data.blindDuration === "number" && isFinite(data.blindDuration)) return data.blindDuration;
      return 5;
    }

    /**
     * v28: recent-dart-shooter correlation. The relay server may strip our custom fields
     * (hitKind / slowDuration / weaponIndex) and rewrite `damage` from 1 to its own weapon
     * table value. So we can't trust the `damaged` payload alone. Instead, whenever we
     * receive a `shoot` event tagged as a dart, we remember the shooter id for ~1.6s,
     * and any subsequent `damaged` from that attacker counts as a paralysis hit (no HP loss).
     */
    const recentDartShooters = new Map();
    const RECENT_DART_WINDOW_MS = 1600;
    function noteRecentDartShooter(shooterId, durationSec) {
      if (shooterId == null || shooterId === "") return;
      const id = String(shooterId);
      const expireAt = performance.now() + RECENT_DART_WINDOW_MS;
      recentDartShooters.set(id, { expireAt, duration: dartSlowDurationFromData({ slowDuration: durationSec }) });
      if (window.__fpsDartDebug) console.info("[zone-no-light-v30] noted dart shooter", id, "for", RECENT_DART_WINDOW_MS, "ms");
    }
    function consumeRecentDartShooter(attackerId) {
      if (attackerId == null || attackerId === "") return null;
      const id = String(attackerId);
      const entry = recentDartShooters.get(id);
      if (!entry) return null;
      if (performance.now() > entry.expireAt) {
        recentDartShooters.delete(id);
        return null;
      }
      return entry;
    }
    function extractShooterId(data) {
      if (!data) return "";
      // v29: server stamps attacker as `by` on damaged events. Include it as a candidate.
      const cands = [data.id, data.shooter, data.attacker, data.from, data.by];
      for (let i = 0; i < cands.length; i++) {
        if (cands[i] != null && cands[i] !== "") return String(cands[i]);
      }
      return "";
    }
    function shootDataLooksLikeDart(data) {
      if (!data) return false;
      if (data.type === "dartSlow" || data.type === "blind") return true;
      if (data.hitKind === "dartSlow" || data.hitKind === "blind") return true;
      if (data.slow === true || data.blind === true) return true;
      if (data.slowTarget != null || data.blindTarget != null) return true;
      if (data.weaponIndex === 6 || data.weapon === 6) return true;
      const col = Number(data.color);
      if (col === 0x6bd4ff || col === 11398143) return true;
      return false;
    }

    /** Relay often strips hitKind/slowDuration; dart is the only PvP emit that uses damage: 1 chip. */
    function isParalysisDartNetworkData(data) {
      if (!data) return false;
      if (
        data.hitKind === "dartSlow" ||
        data.hitKind === "blind" ||
        data.slow === true ||
        data.blind === true ||
        data.type === "dartSlow" ||
        data.type === "blind"
      ) {
        return true;
      }
      if (typeof data.slowDuration === "number" && data.slowDuration > 0) return true;
      if (typeof data.duration === "number" && data.duration > 0 && data.slowTarget != null) return true;
      const wIdx = data.weaponIndex != null ? Number(data.weaponIndex) : data.weapon != null ? Number(data.weapon) : NaN;
      if (wIdx === 6) return true;
      if (!isPvpCrossfireMap(CURRENT_MAP) && !MULTIPLAYER) return false;
      if (data.hitKind === "melee" || data.hitKind === "bullet") return false;
      const dmg = Number(data.damage);
      if (dmg === 1 || dmg === 0) return true;
      return false;
    }

    function tryApplyDartSlowFromNetwork(data) {
      if (!data || !socket || !gameWorldReady) return false;
      if (!isParalysisDartNetworkData(data)) return false;
      const tid = dartSlowVictimSocketId(data);
      if (tid) {
        if (tid !== String(socket.id)) return false;
      } else if (damagedEventFromLocalShooter(data)) {
        return false;
      }
      startSlowEffect(dartSlowDurationFromData(data));
      return true;
    }

    function tryApplyDartSlowFromShootProximity(data) {
      if (!data || !socket || !gameWorldReady) return false;
      if (!isPvpCrossfireMap(CURRENT_MAP)) return false;
      const shooterId =
        data.id != null
          ? String(data.id)
          : data.shooter != null
            ? String(data.shooter)
            : data.attacker != null
              ? String(data.attacker)
              : "";
      if (shooterId && shooterId === String(socket.id)) return false;
      if (data.x == null || data.z == null) return false;
      const col = Number(data.color);
      const isDart =
        data.type === "dartSlow" ||
        data.type === "blind" ||
        data.hitKind === "dartSlow" ||
        col === 0x6bd4ff ||
        col === 11398143;
      if (!isDart) return false;
      const hx = +data.x;
      const hy = data.y != null ? +data.y : player.position.y + 1.1;
      const hz = +data.z;
      const dx = hx - player.position.x;
      const dy = hy - (player.position.y + 1.05);
      const dz = hz - player.position.z;
      const r = 1.45;
      if (dx * dx + dy * dy + dz * dz > r * r) return false;
      startSlowEffect(dartSlowDurationFromData(data));
      return true;
    }

    function handleIncomingDartSlowEvent(data) {
      if (window.__fpsDartDebug) {
        try { console.info("[zone-no-light-v30] custom slow/blind event recv", JSON.parse(JSON.stringify(data || {}))); } catch (_) {}
      }
      const sid = extractShooterId(data);
      if (sid && sid !== String(socket.id)) {
        noteRecentDartShooter(sid, dartSlowDurationFromData(data));
      }
      tryApplyDartSlowFromNetwork(data);
    }

    socket.on("playerSlow", handleIncomingDartSlowEvent);
    socket.on("dartSlow", handleIncomingDartSlowEvent);
    socket.on("playerBlind", handleIncomingDartSlowEvent);
    socket.on("blind", handleIncomingDartSlowEvent);

    socket.on("shoot", (data) => {
      if (!data) return;
      if (shootDataLooksLikeDart(data)) {
        const sid = extractShooterId(data);
        if (sid && sid !== String(socket.id)) {
          noteRecentDartShooter(sid, dartSlowDurationFromData(data));
        }
        if (window.__fpsDartDebug) console.info("[zone-no-light-v30] shoot(dart) recv", { id: sid, type: data.type, hitKind: data.hitKind, target: data.target, color: data.color });
      }
      if (tryApplyDartSlowFromShootProximity(data)) {
      } else if (
        data.type === "dartSlow" ||
        data.type === "blind" ||
        data.hitKind === "dartSlow" ||
        data.hitKind === "blind" ||
        data.slow === true ||
        data.slowTarget != null ||
        data.blindTarget != null ||
        data.target != null ||
        data.weaponIndex === 6 ||
        data.weapon === 6
      ) {
        tryApplyDartSlowFromNetwork(data);
      }
      if (data.sx != null && data.sy != null && data.sz != null
          && data.x != null && data.y != null && data.z != null) {
        createBulletTrail(
          new THREE.Vector3(data.sx, data.sy, data.sz),
          new THREE.Vector3(data.x, data.y, data.z),
          data.color ?? 0x6bd4ff
        );
      }
      if (data.type === "miss") return;
      const pt = new THREE.Vector3(data.x, data.y, data.z);
      if (data.type === "blood") {
        createBlood(pt);
      } else if (data.type === "spark") {
        createSparks(pt, data.color || 0xffdd88);
        const n = new THREE.Vector3(data.nx, data.ny, data.nz);
        if (n.lengthSq() > 0) createBulletMark(pt, n);
      } else if (data.type === "blind" || data.type === "dartSlow") {
        createSparks(pt, 0x6bd4ff);
      }
    });

    socket.on("enemyShoot", (data) => {
      if (data.sx != null && data.sy != null && data.sz != null
          && data.x != null && data.y != null && data.z != null) {
        createBulletTrail(
          new THREE.Vector3(data.sx, data.sy, data.sz),
          new THREE.Vector3(data.x, data.y, data.z),
          data.color ?? 0xffffff
        );
      }
      if (data.type === "miss") return;

      const pt = new THREE.Vector3(data.x, data.y, data.z);
      if (data.type === "blood") {
        createBlood(pt);
      } else if (data.type === "spark") {
        createSparks(pt, data.color || 0xffdd88);
        const n = new THREE.Vector3(data.nx, data.ny, data.nz);
        if (n.lengthSq() > 0) createBulletMark(pt, n);
      }
    });

    socket.on("chat", (data) => {
      if (data.id === "system") {
        addChatMessage("Server", data.text);
        return;
      }
      const rp = remotePlayers.get(data.id);
      const who = data.id === socket.id ? playerName : (rp ? rp.name : "???");
      addChatMessage(who, data.text);
    });

    socket.on("teleport", (data) => {
      if (!data) return;
      const x = +data.x || 0;
      const y = +data.y || 1.65;
      const z = +data.z || 0;
      player.position.set(x, y, z);
      player.velocityY = 0;
      player.onGround = y <= 1.66;
      camera.position.copy(player.position);
      camera.position.y += state.smoothHeadBob || 0;
    });

    socket.on("teleportZombies", (data) => {
      if (!data || !MULTIPLAYER || !ARENA_COOP || CURRENT_MAP !== "arena") return;
      if (!ZOMBIE_AUTHORITY) return;
      const tx = +data.x || 0;
      const tz = +data.z || 0;
      let i = 0;
      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        const ang = (i / Math.max(1, state.enemies.length)) * Math.PI * 2;
        const rad = 1.2 + (i % 4) * 0.65;
        enemy.group.position.set(tx + Math.cos(ang) * rad, 0, tz + Math.sin(ang) * rad);
        i++;
      }
    });

    socket.on("hit", (data) => {
      if (!data || !socket || !gameWorldReady) return;
      if (isTrainingMap(CURRENT_MAP)) return;
      if (window.__fpsDartDebug) {
        try { console.info("[zone-no-light-v30] hit raw", JSON.parse(JSON.stringify(data))); } catch (_) {}
      }
      if (damagedEventFromLocalShooter(data)) return;
      if (tryApplyDartSlowFromNetwork(data)) {
        if (window.__fpsDartDebug) console.info("[zone-no-light-v30] paralysis applied via hit relay");
      }
    });

    socket.on("trainingHit", (data) => {
      applyRemoteTrainingHit(data);
    });

    function damagedEventTargetsLocalPlayer(data) {
      if (!data || !socket) return true;
      const tid =
        data.target != null
          ? String(data.target)
          : data.victim != null
            ? String(data.victim)
            : data.to != null
              ? String(data.to)
              : null;
      if (tid == null) return true;
      return tid === String(socket.id);
    }

    function damagedEventFromLocalShooter(data) {
      if (!data || !socket) return false;
      // v29: server stamps attacker as `by` on damaged events.
      const aid =
        data.attacker != null
          ? String(data.attacker)
          : data.shooter != null
            ? String(data.shooter)
            : data.from != null
              ? String(data.from)
              : data.by != null
                ? String(data.by)
                : null;
      return aid != null && aid === String(socket.id);
    }

    socket.on("damaged", (data) => {
      if (isTrainingMap(CURRENT_MAP)) return;
      if (!gameWorldReady) return;
      if (player.health <= 0) return;
      if (performance.now() < player.spawnProtectUntil) return;
      if (!data) data = {};
      const isMyAttack = damagedEventFromLocalShooter(data);
      const isForMe = damagedEventTargetsLocalPlayer(data);
      const dmgRaw = Number(data.damage) || 0;
      const isPvp = isPvpCrossfireMap(CURRENT_MAP);
      const attackerId = extractShooterId(data);
      const recentDart = consumeRecentDartShooter(attackerId);
      if (window.__fpsDartDebug) {
        try { console.info("[zone-no-light-v30] damaged raw", JSON.parse(JSON.stringify(data)), { isMyAttack, isForMe, isPvp, attackerId, recentDartHit: !!recentDart, currentMap: CURRENT_MAP }); } catch (_) {}
      }
      // Dart detection (see emitDartSlowNetwork header for the full server-rewrite story):
      //   - Server rewrites hitKind -> 'bullet' on every relayed hit, so we cannot trust it.
      //   - Server stamps the attacker as `by` (handled by extractShooterId).
      //   - The one field the server preserves verbatim is `damage`. In PvP, ONLY the paralysis
      //     dart emits damage:1 (knife=50, bullets=10+, AMR=220). So damage===1 in a PvP map
      //     is a reliable magic marker for a paralysis hit.
      //   - The shooter-correlation fallback (recentDart) covers any future server change that
      //     might break the magic-number assumption.
      const looksLikeDart =
        !!recentDart ||
        isParalysisDartNetworkData(data) ||
        (isPvp && dmgRaw === 1);
      if (looksLikeDart) {
        if (isMyAttack) return;
        if (!isForMe) return;
        const dur = recentDart ? recentDart.duration : dartSlowDurationFromData(data);
        if (window.__fpsDartDebug) {
          console.info("[zone-no-light-v30] paralysis applied via damaged", { dmg: dmgRaw, hitKind: data.hitKind, attackerId, via: recentDart ? "shooter-correlation" : (isPvp && dmgRaw === 1 ? "pvp-dmg1-marker" : "payload-fields") });
        }
        startSlowEffect(dur);
        return;
      }
      if (!isForMe) return;
      if (isMyAttack) return;
      // Armour was missing here entirely. In PvP the shooter already priced the shot against
      // our broadcast armour (the relay only passes `damage` through verbatim), so applying
      // it again would double-dip. Every other relayed source — co-op zombie hits forwarded
      // by the host — arrives RAW, and used to ignore armour completely.
      const rawNet = data.damage || 0;
      let netDmg = rawNet;
      {
        // Armour is applied HERE, on the victim, because only the victim reliably knows its
        // own kit. Everything needed survives the relay:
        //   • `damage`  — passed through verbatim (the payload is raw now)
        //   • `weapon`  — the attacker's current weapon, kept in their `move`
        // The zone is recovered by matching the raw damage against that weapon's own
        // head/body/leg numbers, which is exact because the shooter sends them unmodified.
        let widx = -1;
        let zone = "body";
        if (isPvp) {
          const arp = attackerId != null ? remotePlayers.get(attackerId) : null;
          if (arp) {
            widx = arp.currentWeapon | 0;
            const aw = weapons[widx];
            if (aw) {
              if (Math.abs(rawNet - aw.damageHead) < 0.51) zone = "head";
              else if (Math.abs(rawNet - aw.damageLegs) < 0.51) zone = "leg";
            }
          }
        }
        // Non-PvP relayed damage is a co-op zombie hit forwarded by the host: no gun
        // behind it, so it takes the plain 1.0 armour multiplier.
        netDmg = applyArmorToDamage(rawNet, zone, armorHelmet, armorVest, widx);
      }
      reportArmorAbsorb(rawNet - netDmg);
      player.health = Math.max(0, player.health - netDmg);
      player.regenTimer = 0;
      state.flashTimer = 0.14;
      if (data.x != null && data.z != null) {
        lastPlayerHitWorld.set(+data.x, player.position.y + 1.05, +data.z);
      }
      addHitIndicator(data.x || 0, data.z || 0);
      triggerCamShake(0.085);
      playReceivedDamageSound(data.hitKind === "melee" ? "melee" : "bullet");
      updateHud();
      if (player.health <= 0) {
        showDeathScreen(null);
      }
    });

    socket.on("zombieHost", (data) => {
      ZOMBIE_HOST_KNOWN = true;
      ZOMBIE_AUTHORITY = !!(data && String(data.hostId) === String(socket.id));
    });

    socket.on("zombieSync", (data) => {
      if (!MULTIPLAYER || !ARENA_COOP || !(isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP))) return;
      if (ZOMBIE_AUTHORITY) return;
      applyZombieSyncPayload(data);
    });

    socket.on("zombieDamaged", (data) => {
      // v33: previously rejected boss_arena, breaking boss co-op damage from joiners.
      if (!MULTIPLAYER || !ARENA_COOP) return;
      if (!(isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP))) return;
      if (!ZOMBIE_AUTHORITY || !data) return;
      if (data.by === socket.id) return;
      const ei = data.ei | 0;
      if (ei < 0 || ei >= state.enemies.length) return;
      const enemy = state.enemies[ei];
      let wi = ((data.weaponIndex | 0) % weapons.length + weapons.length) % weapons.length;
      if (wi === 4) wi = 0;
      const w = weapons[wi];
      applyDamage(enemy, data.zone, w);
      drawEnemyHp(enemy);
      if (enemy.hp <= 0 && enemy.alive) {
        enemy.alive = false;
        enemy.respawnTimer = zombieRespawnDelay();
        enemy.dissolveTimer = DISSOLVE_DURATION + 0.12;
        const hitPt = new THREE.Vector3(
          enemy.group.position.x,
          1.2,
          enemy.group.position.z
        );
        spawnHumanoidDissolve(enemy.group, hitPt);
        enemy.group.visible = false;
        state.score += 1;
        registerEnemyKill(enemy);
        if (enemy.isBoss) checkAllBossesDead(enemy.group.position.clone());
      }
      updateHud();
    });

    const CHAT_MAX_VISIBLE = 6;
    const CHAT_MSG_LIFETIME = 12000;
    const chatLog = [];

    function addChatMessage(who, text) {
      const el = document.createElement("div");
      el.style.cssText = "font-size:12px;color:#fff;background:rgba(0,0,0,0.45);padding:3px 8px;border-radius:4px;max-width:300px;word-break:break-word;transition:opacity 0.4s;";
      el.textContent = `${who}: ${text}`;
      chatMessages.appendChild(el);
      const entry = { el, born: performance.now() };
      chatLog.push(entry);
      if (chatLog.length > 80) {
        const old = chatLog.shift();
        if (old.el.parentNode) chatMessages.removeChild(old.el);
      }
      refreshChatVisibility();
    }

    function refreshChatVisibility() {
      const now = performance.now();
      if (chatOpen) {
        chatMessages.style.maxHeight = "260px";
        chatMessages.style.overflow = "auto";
        chatMessages.style.pointerEvents = "auto";
        for (const e of chatLog) e.el.style.opacity = "1";
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        chatMessages.style.maxHeight = "";
        chatMessages.style.overflow = "hidden";
        chatMessages.style.pointerEvents = "none";
        let shown = 0;
        for (let i = chatLog.length - 1; i >= 0; i--) {
          const e = chatLog[i];
          const alive = (now - e.born) < CHAT_MSG_LIFETIME;
          if (alive && shown < CHAT_MAX_VISIBLE) {
            e.el.style.opacity = "1";
            e.el.style.display = "";
            shown++;
          } else {
            e.el.style.opacity = "0";
            e.el.style.display = "none";
          }
        }
      }
    }

    function openChat() {
      if (chatOpen) return;
      chatOpen = true;
      chatInputWrap.style.display = "block";
      chatInput.value = "";
      chatInput.focus();
      refreshChatVisibility();
    }

    function closeChat() {
      if (!chatOpen) return;
      chatOpen = false;
      chatInputWrap.style.display = "none";
      refreshChatVisibility();
    }

    function sendChat() {
      const text = chatInput.value.trim();
      if (text && MULTIPLAYER) {
        socket.emit("chat", text);
      } else if (text) {
        addChatMessage(playerName, text);
      }
      closeChat();
      renderer.domElement.requestPointerLock();
    }

    function addHitIndicator(fromX, fromZ) {
      const dx = fromX - player.position.x;
      const dz = fromZ - player.position.z;
      const worldAngle = Math.atan2(dx, dz);
      // Same convention as `new THREE.Vector3(0, 0, -1).applyAxisAngle(Y, yaw)` in XZ: (-sin, -cos).
      const forwardAngle = Math.atan2(-Math.sin(player.yaw), -Math.cos(player.yaw));
      let relAngle = forwardAngle - worldAngle;
      while (relAngle > Math.PI) relAngle -= 2 * Math.PI;
      while (relAngle < -Math.PI) relAngle += 2 * Math.PI;
      const el = document.createElement("div");
      el.style.cssText = [
        "position:absolute",
        `width:${HIT_DIR_SVG_W}px`,
        `height:${HIT_DIR_SVG_H}px`,
        "pointer-events:none",
        "transition:opacity 0.3s",
        "display:flex",
        "align-items:center",
        "justify-content:center",
      ].join(";");
      el.innerHTML =
        `<svg width="${HIT_DIR_SVG_W}" height="${HIT_DIR_SVG_H}" viewBox="0 0 256 81" fill="none" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="${HIT_DIR_SVG_PATH}" fill="#FF0000"/>` +
        "</svg>";
      hitDirContainer.appendChild(el);
      const indicator = { el, relAngle, life: 1.5 };
      hitIndicators.push(indicator);
      updateHitIndicatorPos(indicator);
    }

    function updateHitIndicatorPos(ind) {
      const angle = ind.relAngle;
      const r = 90;
      const cx = r * Math.sin(angle);
      const cy = -r * Math.cos(angle);
      const hw = HIT_DIR_SVG_W / 2;
      const hh = HIT_DIR_SVG_H / 2;
      // Chevron points toward damage source (same direction as ring offset from center): atan2(cy,cx), SVG up needs +π/2.
      const towardThreat = Math.atan2(cy, cx);
      const rot = towardThreat + Math.PI / 2;
      ind.el.style.transform = `translate(${cx - hw}px, ${cy - hh}px) rotate(${rot}rad)`;
    }

    function updateHitIndicators(dt) {
      for (let i = hitIndicators.length - 1; i >= 0; i--) {
        const ind = hitIndicators[i];
        ind.life -= dt;
        // Helmets muffle where damage is coming from: the tier's hitFade scales the
        // direction indicator down, so a Mk III wearer barely sees it.
        ind.el.style.opacity = (Math.max(0, ind.life / 1.5) * myHelmet().hitFade).toString();
        const dx = ind.el._fromX != null ? ind.el._fromX - player.position.x : 0;
        const dz = ind.el._fromZ != null ? ind.el._fromZ - player.position.z : 0;
        if (ind.life <= 0) {
          hitDirContainer.removeChild(ind.el);
          hitIndicators.splice(i, 1);
        }
      }
    }

    function makeNameSprite(name, achievementId) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = achievementId ? 72 : 48;
      const ctx = canvas.getContext("2d");
      drawNameSprite(ctx, canvas.width, canvas.height, name, achievementId);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          fog: false,
        })
      );
      sprite.renderOrder = 999;
      sprite.scale.set(2.2, achievementId ? 0.62 : 0.42, 1);
      sprite.raycast = () => {};
      return { sprite, canvas, ctx, tex };
    }

    function drawNameSprite(ctx, w, h, name, achievementId) {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 6;
      const achDef = achievementId ? getAchievementDef(achievementId) : null;
      if (achDef) {
        ctx.font = "bold 18px Audiowide, Arial";
        ctx.textBaseline = "middle";
        ctx.fillStyle = achDef.color || "#ffd700";
        ctx.fillText(achName(achDef).slice(0, 12), w * 0.5, 18);
        ctx.font = "bold 24px Audiowide, Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText((name || "Player").slice(0, 16), w * 0.5, 50);
      } else {
        ctx.font = "bold 28px Audiowide, Arial";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText((name || "Player").slice(0, 16), w * 0.5, h * 0.5);
      }
    }

    function updateNameSprite(rp, name, achievementId) {
      const achId = achievementId !== undefined ? achievementId : (rp.equippedAchievement || null);
      rp.equippedAchievement = achId || null;
      const canvas = rp.nameCanvas;
      const h = achId ? 72 : 48;
      if (canvas.height !== h) {
        canvas.height = h;
        rp.nameSprite.scale.y = achId ? 0.62 : 0.42;
      }
      drawNameSprite(rp.nameCtx, canvas.width, canvas.height, name, achId);
      rp.nameTex.needsUpdate = true;
    }

    function addMeshPart(parent, geometry, material, x, y, z, rx, ry, rz) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      if (rx !== undefined) mesh.rotation.set(rx, ry || 0, rz || 0);
      parent.add(mesh);
      return mesh;
    }

    const _trailVecA = new THREE.Vector3();
    const _trailVecB = new THREE.Vector3();
    const _trailVecDir = new THREE.Vector3();
    const _trailVecUp = new THREE.Vector3(0, 1, 0);

    /** Visual tracer: muzzle → crosshair hit (gameplay ray is from camera). */
    function bulletTrailEndpoints(muzzle, hit) {
      const start = _trailVecA.copy(muzzle);
      const end = _trailVecB.copy(hit);
      _trailVecDir.subVectors(end, start);
      const len = _trailVecDir.length();
      if (len < 1e-4) {
        _trailVecDir.set(0, 0, -1);
        end.copy(start).addScaledVector(_trailVecDir, 2);
        return { start: start.clone(), end: end.clone() };
      }
      _trailVecDir.multiplyScalar(1 / len);
      end.addScaledVector(_trailVecDir, 0.08);
      return { start: start.clone(), end: end.clone() };
    }

    function getActiveMuzzleWorld(out) {
      const wm = weaponModels[state.weaponIndex];
      weaponRoot.updateMatrixWorld(true);
      wm.updateMatrixWorld(true);
      const node = wm.userData.muzzleNode;
      if (node) node.getWorldPosition(out);
      else wm.userData.gun.getWorldPosition(out);
      return out;
    }

    function makeThirdPersonGun(type) {
      const g = new THREE.Group();
      const mDark = new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.6, metalness: 0.4 });
      const mMetal = new THREE.MeshStandardMaterial({ color: 0x3a4455, roughness: 0.5, metalness: 0.5 });
      const mLight = new THREE.MeshStandardMaterial({ color: 0x5a6575, roughness: 0.4, metalness: 0.6 });
      const mWood = new THREE.MeshStandardMaterial({ color: 0x6e4a2a, roughness: 0.8 });
      const mBlack = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.3 });
      const mSight = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.35, metalness: 0.65 });

      const bz = Math.PI / 2;
      if (type === 0) {
        addMeshPart(g, new THREE.BoxGeometry(0.055, 0.1, 0.28), mMetal, 0, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.04, 0.14), mLight, 0, 0.05, -0.06);
        addMeshPart(g, new THREE.BoxGeometry(0.06, 0.14, 0.07), mDark, 0, -0.1, 0.08);
        addMeshPart(g, new THREE.BoxGeometry(0.03, 0.02, 0.04), mBlack, 0, 0.06, -0.12);
      } else if (type === 1) {
        addMeshPart(g, new THREE.BoxGeometry(0.08, 0.1, 0.36), mDark, 0, 0, 0.1);
        addMeshPart(g, new THREE.CylinderGeometry(0.022, 0.024, 0.42, 8), mMetal, 0, 0.05, -0.06, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.07, 0.1, 0.16), mDark, 0, 0, 0.32);
        addMeshPart(g, new THREE.BoxGeometry(0.065, 0.16, 0.07), mDark, 0, -0.12, 0.08);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.16, 0.06), mBlack, 0, -0.1, -0.02);
      } else if (type === 2) {
        addMeshPart(g, new THREE.BoxGeometry(0.1, 0.1, 0.34), mLight, 0, 0, 0.04);
        addMeshPart(g, new THREE.CylinderGeometry(0.032, 0.035, 0.4, 10), mMetal, 0, 0.02, -0.12, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.09, 0.08, 0.16), mWood, 0, -0.05, -0.06);
        addMeshPart(g, new THREE.BoxGeometry(0.1, 0.1, 0.2), mWood, 0, 0, 0.34);
      } else if (type === 3) {
        addMeshPart(g, new THREE.BoxGeometry(0.07, 0.09, 0.34), mMetal, 0, 0, 0);
        addMeshPart(g, new THREE.CylinderGeometry(0.018, 0.02, 0.3, 8), mLight, 0, 0.04, -0.06, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.06, 0.06, 0.12), mDark, 0, 0.01, 0.24);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.14, 0.06), mDark, 0, -0.1, 0.06);
        addMeshPart(g, new THREE.BoxGeometry(0.04, 0.12, 0.05), mBlack, 0, -0.08, -0.04);
      } else if (type === 5) {
        addMeshPart(g, new THREE.BoxGeometry(0.07, 0.1, 0.38), mDark, 0, 0.02, 0.16);
        addMeshPart(g, new THREE.CylinderGeometry(0.028, 0.032, 0.72, 10), mMetal, 0, 0.06, -0.14, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.06, 0.08, 0.3), mBlack, 0, 0, 0.42);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.07, 0.22), mSight, 0, 0.09, 0.02);
        addMeshPart(g, new THREE.CylinderGeometry(0.038, 0.042, 0.08, 10), mDark, 0, 0.065, -0.58, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.055, 0.12, 0.09), mBlack, 0, -0.1, 0.1);
      } else if (type === 6) {
        addMeshPart(g, new THREE.BoxGeometry(0.06, 0.08, 0.28), mDark, 0, 0.01, 0.06);
        addMeshPart(g, new THREE.CylinderGeometry(0.018, 0.02, 0.34, 10), mLight, 0, 0.04, -0.08, bz, 0, 0);
        addMeshPart(g, new THREE.ConeGeometry(0.015, 0.05, 8), mLight, 0, 0.04, -0.27, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.14, 0.07), mDark, 0, -0.10, 0.10);
        addMeshPart(g, new THREE.BoxGeometry(0.04, 0.08, 0.06), mBlack, 0, -0.07, 0.04);
      } else if (type === 4) {
        // Med kit — white case with a red cross, unmistakable at a distance.
        const mCase = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.55 });
        const mCross = new THREE.MeshStandardMaterial({ color: 0xd42020, roughness: 0.5 });
        const mStrap = new THREE.MeshStandardMaterial({ color: 0x4a3a22, roughness: 0.85 });
        addMeshPart(g, new THREE.BoxGeometry(0.22, 0.17, 0.13), mCase, 0, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.115, 0.032, 0.005), mCross, 0, 0, -0.068);
        addMeshPart(g, new THREE.BoxGeometry(0.032, 0.115, 0.005), mCross, 0, 0, -0.068);
        addMeshPart(g, new THREE.BoxGeometry(0.23, 0.03, 0.135), mStrap, 0, 0.055, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.022, 0.03), mStrap, 0, 0.098, 0);
      } else if (type === 7) {
        // Combat knife — short blade, held point-down in one fist.
        const mBlade = new THREE.MeshStandardMaterial({ color: 0xd8dee6, roughness: 0.2, metalness: 0.85 });
        const mGrip = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.85 });
        addMeshPart(g, new THREE.BoxGeometry(0.028, 0.006, 0.20), mBlade, 0, 0, -0.13);
        addMeshPart(g, new THREE.ConeGeometry(0.016, 0.05, 4), mBlade, 0, 0, -0.25, -Math.PI / 2, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.05, 0.012, 0.016), mBlade, 0, 0, -0.02);
        addMeshPart(g, new THREE.BoxGeometry(0.024, 0.024, 0.11), mGrip, 0, 0, 0.045);
        addMeshPart(g, new THREE.BoxGeometry(0.03, 0.03, 0.014), mGrip, 0, 0, 0.105);
      } else if (type === 8) {
        // Dev gun — oversized red slab so it never reads as an ordinary rifle.
        const mDev = new THREE.MeshStandardMaterial({
          color: 0x901010, roughness: 0.35, metalness: 0.6,
          emissive: 0xff2200, emissiveIntensity: 0.45,
        });
        addMeshPart(g, new THREE.BoxGeometry(0.13, 0.15, 0.5), mDev, 0, 0.01, 0.08);
        addMeshPart(g, new THREE.CylinderGeometry(0.045, 0.05, 0.44, 12), mDev, 0, 0.05, -0.24, bz, 0, 0);
        addMeshPart(g, new THREE.BoxGeometry(0.08, 0.18, 0.1), mBlack, 0, -0.14, 0.12);
        addMeshPart(g, new THREE.BoxGeometry(0.06, 0.06, 0.09), mBlack, 0, 0.11, -0.02);
      }
      return g;
    }

    /**
     * Third-person view-model: parent is a grip at the hand. Character faces +Z; gun barrel must extend forward (+Z), not sit behind the arm (-Z).
     */
    function applyThirdPersonGunToGrip(gunModel, weaponType) {
      const t = weaponType | 0;
      gunModel.rotation.order = "YXZ";
      gunModel.rotation.set(0.1, -0.05, 0.04);
      if (t === 0) {
        gunModel.position.set(0.04, -0.01, 0.12);
        gunModel.scale.set(1, 1, 1);
      } else if (t === 1) {
        gunModel.position.set(0.03, -0.02, 0.2);
        gunModel.scale.set(1.06, 1.06, 1.06);
      } else if (t === 2) {
        gunModel.position.set(0.028, -0.03, 0.21);
        gunModel.scale.set(1.03, 1.03, 1.03);
      } else if (t === 5) {
        gunModel.position.set(0.022, -0.03, 0.32);
        gunModel.scale.set(1.14, 1.14, 1.14);
      } else {
        gunModel.position.set(0.032, -0.015, 0.18);
        gunModel.scale.set(1, 1, 1);
      }
    }

    /**
     * Fore-grip anchor on the third-person weapon mesh so the support-hand glove can be parented
     * and stay visually welded while the primary arm drives recoil/reload.
     */
    /** Left (support) glove — sits on foregrip after the gun's Y=PI flip, lining up with the crossed-over left wrist. */
    const REMOTE_SUPPORT_SOCKET_LOCAL = {
      0: { x: 0.075, y: -0.10, z: -0.04 },
      1: { x: 0.080, y: -0.105, z: -0.06 },
      2: { x: 0.082, y: -0.108, z: -0.05 },
      3: { x: 0.076, y: -0.102, z: -0.05 },
      5: { x: 0.082, y: -0.108, z: -0.08 },
      6: { x: 0.076, y: -0.102, z: -0.04 },
      8: { x: 0.090, y: -0.115, z: -0.07 },
    };
    /** Right (primary) glove — sits on pistol grip after Y=PI flip, lining up with the right wrist in the shoulder pocket. */
    const REMOTE_PRIMARY_GRIP_LOCAL = {
      0: { x: -0.045, y: -0.10, z: -0.02 },
      1: { x: -0.050, y: -0.105, z: -0.04 },
      2: { x: -0.052, y: -0.108, z: -0.03 },
      3: { x: -0.048, y: -0.102, z: -0.03 },
      4: { x: 0.000, y: -0.115, z: 0.00 },
      5: { x: -0.052, y: -0.110, z: -0.06 },
      6: { x: -0.046, y: -0.105, z: -0.02 },
      7: { x: 0.000, y: -0.030, z: 0.07 },
      8: { x: -0.058, y: -0.120, z: -0.05 },
    };
    /** Right-shoulder rifle pose with bent elbows: shoulders wider (±0.30); arms cross to reach the gun on the right while staying outside the body. */
    const REMOTE_TWO_HAND_STANCE = [
      { holdX: 0.18, holdY: 1.30, holdZ: 0.60, r: { x: -0.85, y: -0.10, z: 0.00 }, l: { x: -0.85, y: 0.55, z: 0.00 } },
      { holdX: 0.18, holdY: 1.30, holdZ: 0.60, r: { x: -0.85, y: -0.10, z: 0.00 }, l: { x: -0.85, y: 0.55, z: 0.00 } },
      { holdX: 0.18, holdY: 1.30, holdZ: 0.60, r: { x: -0.85, y: -0.10, z: 0.00 }, l: { x: -0.85, y: 0.55, z: 0.00 } },
      { holdX: 0.18, holdY: 1.30, holdZ: 0.60, r: { x: -0.85, y: -0.10, z: 0.00 }, l: { x: -0.85, y: 0.55, z: 0.00 } },
      null, // 4 med kit — one-handed, uses the single-item stance below
      { holdX: 0.18, holdY: 1.30, holdZ: 0.62, r: { x: -0.83, y: -0.10, z: 0.00 }, l: { x: -0.83, y: 0.55, z: 0.00 } },
      { holdX: 0.18, holdY: 1.30, holdZ: 0.60, r: { x: -0.85, y: -0.10, z: 0.00 }, l: { x: -0.85, y: 0.55, z: 0.00 } },
      null, // 7 knife — one-handed
      { holdX: 0.18, holdY: 1.30, holdZ: 0.64, r: { x: -0.88, y: -0.10, z: 0.00 }, l: { x: -0.88, y: 0.55, z: 0.00 } },
    ];
    /**
     * Med kit (4) and knife (7): carried low in the right fist, left arm hanging. Gives each a
     * silhouette an opponent can read instantly instead of the old "empty hands" / fake pistol.
     */
    const REMOTE_ONE_HAND_STANCE = {
      4: { holdX: 0.16, holdY: 1.02, holdZ: 0.34, r: { x: -0.55, y: -0.12, z: 0.05 }, l: { x: -0.15, y: 0.05, z: 0.10 } },
      7: { holdX: 0.19, holdY: 1.06, holdZ: 0.30, r: { x: -0.72, y: -0.18, z: 0.12 }, l: { x: -0.20, y: 0.06, z: 0.12 } },
    };

    function hashRemoteTint(seed) {
      let h = 2166136261;
      const s = String(seed || "rp");
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0) % 628 / 628;
    }

    function tintHexColor(hex, deltaHue01) {
      const c = new THREE.Color(hex);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      hsl.h = (hsl.h + deltaHue01 + 1) % 1;
      c.setHSL(hsl.h, hsl.s, hsl.l);
      return c.getHex();
    }

    /**
     * Bright duel arena (`crossfire_grid`): cooler textile tones + slight emissive rim so silhouettes read in daylight fog.
     */
    function applyRemoteAvatarPalette(opts) {
      const duelBright = !!opts.duelBright;
      const hueShift = typeof opts.hueShift === "number" ? opts.hueShift : 0;
      const camoA = duelBright ? 0x4a6d55 : 0x3b5a3e;
      const camoB = duelBright ? 0x355f42 : 0x2d4a30;
      const helm = duelBright ? 0x5f7386 : 0x4a5a4e;
      const vest = duelBright ? 0x6f8270 : 0x5c6b54;
      const pants = duelBright ? 0x454842 : 0x3a3d32;
      const emissive = duelBright ? 0x223024 : 0x000000;
      const emissiveIntensity = duelBright ? 0.22 : 0;
      const mk = (hex, rough, metal) => {
        const col = tintHexColor(hex, hueShift * 0.08);
        return new THREE.MeshStandardMaterial({
          color: col,
          roughness: rough,
          metalness: metal || 0,
          emissive: emissive,
          emissiveIntensity,
        });
      };
      return {
        mCamo1: mk(camoA, 0.82, 0),
        mCamo2: mk(camoB, 0.84, 0),
        mHelm: mk(helm, 0.68, 0.05),
        mVest: mk(vest, 0.78, 0),
        mPants: mk(pants, 0.88, 0),
        duelBright,
      };
    }

    function attachRemoteSupportHand(gunModel, weaponType, gloveMat) {
      const wt = weaponType | 0;
      if (wt === 4) return null;
      const sockPos = REMOTE_SUPPORT_SOCKET_LOCAL[wt] || REMOTE_SUPPORT_SOCKET_LOCAL[1];
      const socket = new THREE.Group();
      socket.name = "remoteSupportSocket";
      socket.position.set(sockPos.x, sockPos.y, sockPos.z);
      socket.rotation.order = "YXZ";
      socket.rotation.x = wt === 2 ? 0.32 : wt === 5 ? 0.22 : 0.2;
      socket.rotation.y = wt === 2 ? -0.08 : -0.04;
      socket.rotation.z = 0.02;
      addRemoteGripGlove(socket, gloveMat);
      gunModel.add(socket);
      return socket;
    }

    function addRemoteGripGlove(socket, gloveMat) {
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.11), gloveMat);
      palm.castShadow = true;
      palm.receiveShadow = true;
      socket.add(palm);
      const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.055), gloveMat);
      thumb.position.set(-0.055, -0.025, 0.045);
      thumb.castShadow = true;
      socket.add(thumb);
      const wrap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.13), gloveMat);
      wrap.position.set(0, 0.02, -0.02);
      wrap.castShadow = true;
      socket.add(wrap);
    }

    function attachRemotePrimaryHand(gunModel, weaponType, gloveMat) {
      const wt = weaponType | 0;
      if (wt === 4) return null;
      const sockPos = REMOTE_PRIMARY_GRIP_LOCAL[wt] || REMOTE_PRIMARY_GRIP_LOCAL[1];
      const socket = new THREE.Group();
      socket.name = "remotePrimarySocket";
      socket.position.set(sockPos.x, sockPos.y, sockPos.z);
      socket.rotation.order = "YXZ";
      socket.rotation.x = 0.16;
      socket.rotation.y = 0.05;
      socket.rotation.z = -0.04;
      addRemoteGripGlove(socket, gloveMat);
      gunModel.add(socket);
      return socket;
    }

    /** Chest-centered third-person hold: Y=PI flips gun so native -Z muzzle now points along +Z (avatar forward). */
    function applyThirdPersonGunToChestHold(gunModel, weaponType) {
      const t = weaponType | 0;
      gunModel.rotation.order = "YXZ";
      gunModel.rotation.set(0, Math.PI, 0);
      if (t === 0) {
        gunModel.position.set(0, 0.02, 0);
        gunModel.scale.set(1.05, 1.05, 1.05);
      } else if (t === 1) {
        gunModel.position.set(0, 0, 0);
        gunModel.scale.set(1.06, 1.06, 1.06);
      } else if (t === 2) {
        gunModel.position.set(0, 0, 0.02);
        gunModel.scale.set(1.04, 1.04, 1.04);
      } else if (t === 5) {
        gunModel.position.set(0, 0, 0.06);
        gunModel.scale.set(1.10, 1.10, 1.10);
      } else {
        gunModel.position.set(0, 0, 0);
        gunModel.scale.set(1.04, 1.04, 1.04);
      }
    }

    function getOrCreateRemoteWeaponHold(group) {
      let hold = group.getObjectByName("remoteWeaponHold");
      if (!hold) {
        hold = new THREE.Group();
        hold.name = "remoteWeaponHold";
        hold.position.set(0.18, 1.30, 0.60);
        group.add(hold);
      }
      return hold;
    }

    /** Med kit (4) and knife (7) are carried in one hand — no support-hand socket. */
    function isRemoteOneHandItem(wt) {
      return wt === 4 || wt === 7;
    }

    /**
     * Add / remove the visible jet pack on a remote player to match their broadcast state.
     * Built lazily on first non-zero state and torn down when it returns to 0, so an
     * opponent who never used the harness never has one attached.
     */
    function applyRemoteJetPack(rp) {
      const st = rp.jetState | 0;
      if (st <= 0) {
        if (rp.jetPack) {
          rp.group.remove(rp.jetPack);
          rp.jetPack.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
              if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
              else o.material.dispose();
            }
          });
          rp.jetPack = null;
        }
        return;
      }
      if (!rp.jetPack) {
        rp.jetPack = makeRemoteJetPack();
        rp.group.add(rp.jetPack);
      }
      rp.jetPack.visible = true;
    }

    /** Per-frame flame / glow pulse on a remote pack. Only state 2 (flying) burns. */
    function updateRemoteJetPack(rp, dt) {
      const pack = rp.jetPack;
      if (!pack) return;
      const flying = (rp.jetState | 0) === 2;
      rp.jetFlame = dampScalar(rp.jetFlame || 0, flying ? 1 : 0, dt, 10);
      const flicker = flying ? 0.75 + Math.sin(performance.now() * 0.03) * 0.25 : 0;
      for (const f of pack.userData.flames) {
        f.material.opacity = 0.7 * rp.jetFlame * flicker;
        const s = 0.6 + 0.4 * flicker;
        f.scale.set(1, s, 1);
      }
      if (pack.userData.glow) pack.userData.glow.intensity = 5 * rp.jetFlame * flicker;
    }

    function equipRemotePlayerWeapon(rp, weaponType) {
      // Was `% 7`: the knife folded onto the pistol, the dev gun onto the AR, and the med
      // kit just hid the hold group so the opponent appeared empty-handed. All nine slots
      // now have a distinct silhouette.
      const wt = THREE.MathUtils.clamp(weaponType | 0, 0, weapons.length - 1);
      const gloveMat =
        rp.gloveMat ||
        new THREE.MeshStandardMaterial({ color: 0x3a3528, roughness: 0.9 });
      if (!rp.gloveMat) rp.gloveMat = gloveMat;
      const hold = getOrCreateRemoteWeaponHold(rp.group);
      rp.weaponHold = hold;
      if (rp.gunModel) {
        hold.remove(rp.gunModel);
        rp.gunModel = null;
        rp.supportSocket = null;
        rp.primarySocket = null;
      }
      hold.visible = true;
      if (isRemoteOneHandItem(wt)) {
        const item = makeThirdPersonGun(wt);
        applyThirdPersonGunToChestHold(item, wt);
        hold.add(item);
        rp.gunModel = item;
        rp.supportSocket = null;
        rp.primarySocket = attachRemotePrimaryHand(item, wt, gloveMat);
        rp.currentWeapon = wt;
        return;
      }
      const gunModel = makeThirdPersonGun(wt);
      applyThirdPersonGunToChestHold(gunModel, wt);
      hold.add(gunModel);
      rp.gunModel = gunModel;
      rp.supportSocket = attachRemoteSupportHand(gunModel, wt, gloveMat);
      rp.primarySocket = attachRemotePrimaryHand(gunModel, wt, gloveMat);
      rp.currentWeapon = wt;
    }

    function applyRemoteTwoHandStance(rp, dt, moving, wSin, idlePhase, adsBlend) {
      const wt = rp.currentWeapon | 0;
      const stance = REMOTE_TWO_HAND_STANCE[wt] || REMOTE_ONE_HAND_STANCE[wt];
      if (!stance) return;
      const breathe = Math.sin(idlePhase) * (moving ? 0.018 : 0.028);
      const holdY = stance.holdY - adsBlend * 0.04 + breathe * 0.15;
      const holdZ = stance.holdZ + adsBlend * 0.05;
      const holdX = typeof stance.holdX === "number" ? stance.holdX : 0;
      if (rp.weaponHold) {
        rp.weaponHold.position.y = dampScalar(rp.weaponHold.position.y, holdY, dt, 11);
        rp.weaponHold.position.z = dampScalar(rp.weaponHold.position.z, holdZ, dt, 11);
        rp.weaponHold.position.x = dampScalar(rp.weaponHold.position.x, holdX, dt, 11);
      }
      const rs = stance.r;
      const ls = stance.l;
      const rx = rs.x + (moving ? wSin * 0.08 : breathe * 0.35);
      const lx = ls.x + (moving ? wSin * 0.07 : breathe * 0.3);
      rp.rightArm.rotation.x = dampScalar(rp.rightArm.rotation.x, rx, dt, 12);
      rp.rightArm.rotation.y = dampScalar(rp.rightArm.rotation.y, rs.y + (moving ? wSin * 0.04 : 0), dt, 11);
      rp.rightArm.rotation.z = dampScalar(rp.rightArm.rotation.z, rs.z, dt, 11);
      rp.leftArm.rotation.x = dampScalar(rp.leftArm.rotation.x, lx, dt, 12);
      rp.leftArm.rotation.y = dampScalar(rp.leftArm.rotation.y, ls.y - (moving ? wSin * 0.04 : 0), dt, 11);
      rp.leftArm.rotation.z = dampScalar(rp.leftArm.rotation.z, ls.z, dt, 11);
    }

    function createRemotePlayer(name) {
      const group = new THREE.Group();
      const duelBright = isBrightIndoorMap(CURRENT_MAP);
      const hueShift = hashRemoteTint(name || "player");
      const pal = applyRemoteAvatarPalette({ duelBright, hueShift });
      const mCamo1 = pal.mCamo1;
      const mCamo2 = pal.mCamo2;
      const mSkin = new THREE.MeshStandardMaterial({ color: 0xe0b890, roughness: 0.7 });
      const mSkinD = new THREE.MeshStandardMaterial({ color: 0xc49a70, roughness: 0.7 });
      const mPants = pal.mPants;
      const mBoot = new THREE.MeshStandardMaterial({ color: 0x2a2218, roughness: 0.9 });
      const mBootS = new THREE.MeshStandardMaterial({ color: 0x1a1610, roughness: 0.9 });
      const mHelm = pal.mHelm;
      const mVisor = new THREE.MeshStandardMaterial({
        color: duelBright ? 0xa8e8ff : 0x80ddff,
        transparent: true,
        opacity: duelBright ? 0.52 : 0.45,
        roughness: 0.2,
        metalness: 0.82,
      });
      const mVest = pal.mVest;
      const mGear = new THREE.MeshStandardMaterial({ color: 0x2e3028, roughness: 0.9 });
      const mMetal = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.4, metalness: 0.6 });
      const mGlove = new THREE.MeshStandardMaterial({ color: 0x3a3528, roughness: 0.9 });
      const mKnee = new THREE.MeshStandardMaterial({ color: 0x505548, roughness: 0.8 });

      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.48, 0.30), mCamo1);
      chest.position.y = 1.24; group.add(chest);
      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.24, 0.28), mCamo2);
      belly.position.y = 0.90; group.add(belly);
      const vestF = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.06), mVest);
      vestF.position.set(0, 1.20, 0.17); group.add(vestF);
      const vestB = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.05), mVest);
      vestB.position.set(0, 1.20, -0.16); group.add(vestB);
      const vestS1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.24), mVest);
      vestS1.position.set(0.25, 1.20, 0); group.add(vestS1);
      const vestS2 = vestS1.clone(); vestS2.position.x = -0.25; group.add(vestS2);
      for (let px of [-0.16, 0, 0.16]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.05), mGear);
        p.position.set(px, 1.04, 0.21); group.add(p);
      }
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.26), mCamo2);
      collar.position.set(0, 1.50, 0); group.add(collar);
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.32), mGear);
      belt.position.y = 0.76; group.add(belt);
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.03), mMetal);
      buckle.position.set(0, 0.76, 0.17); group.add(buckle);
      const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.16, 0.27), mPants);
      pelvis.position.set(0, 0.68, 0); group.add(pelvis);
      const holster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.08), mGear);
      holster.position.set(0.23, 0.68, 0.06); group.add(holster);

      const headGroup = new THREE.Group();
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), mSkin);
      headGroup.add(skull);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.10, 0.28), mSkinD);
      jaw.position.set(0, -0.18, 0.02); headGroup.add(jaw);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.06), mSkinD);
      brow.position.set(0, 0.10, 0.17); headGroup.add(brow);
      const ewMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const epMat = new THREE.MeshBasicMaterial({ color: 0x1a1208 });
      const ewL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.02), ewMat);
      ewL.position.set(-0.08, 0.04, 0.185); headGroup.add(ewL);
      const ewR = ewL.clone(); ewR.position.x = 0.08; headGroup.add(ewR);
      const epL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.01), epMat);
      epL.position.set(-0.08, 0.04, 0.195); headGroup.add(epL);
      const epR = epL.clone(); epR.position.x = 0.08; headGroup.add(epR);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.05), mSkinD);
      nose.position.set(0, -0.04, 0.19); headGroup.add(nose);
      const earL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.05), mSkin);
      earL.position.set(-0.20, 0.02, 0); headGroup.add(earL);
      const earR = earL.clone(); earR.position.x = 0.20; headGroup.add(earR);
      const helmShell = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), mHelm);
      helmShell.position.set(0, 0.22, -0.01); headGroup.add(helmShell);
      const helmRim = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.46), mHelm);
      helmRim.position.set(0, 0.13, -0.02); headGroup.add(helmRim);
      const helmBand = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.04, 0.43), mGear);
      helmBand.position.set(0, 0.18, -0.01); headGroup.add(helmBand);
      if (duelBright) {
        const helmStripe = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.034, 0.48), mMetal);
        helmStripe.position.set(0, 0.265, -0.02);
        headGroup.add(helmStripe);
      }
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.03), mVisor);
      visor.position.set(0, 0.07, 0.20); headGroup.add(visor);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.16), mSkin);
      neck.position.set(0, -0.26, 0); headGroup.add(neck);
      headGroup.position.y = 1.80; group.add(headGroup);

      const rightArm = new THREE.Group();
      const leftArm = new THREE.Group();
      // Returns the elbow group so the animator can bend it. It used to be created, frozen
      // at -0.5 rad and never touched again, which is a big part of why everyone moved like
      // a mannequin — arms swung from the shoulder as one rigid rod.
      const makePlayerArm = (ag, showHand) => {
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.18), mCamo2);
        sh.position.set(0, -0.02, 0); ag.add(sh);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.20), mKnee);
        pad.position.set(0, -0.02, 0); ag.add(pad);
        const up = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.32, 0.17), mCamo1);
        up.position.set(0, -0.22, 0); ag.add(up);
        const elbow = new THREE.Group();
        elbow.name = "elbow";
        elbow.position.set(0, -0.38, 0.06);
        elbow.rotation.order = "YXZ";
        elbow.rotation.x = -0.5;
        ag.add(elbow);
        const elbPad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.10), mKnee);
        elbPad.position.set(0, 0, 0); elbow.add(elbPad);
        const fa = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.30, 0.15), mCamo2);
        fa.position.set(0, -0.12, 0); elbow.add(fa);
        if (showHand) {
          const glv = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.16), mGlove);
          glv.position.set(0, -0.32, 0.04); elbow.add(glv);
          const fng = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.08), mGlove);
          fng.position.set(0, -0.40, 0.06); elbow.add(fng);
        }
        return elbow;
      };
      const rightElbow = makePlayerArm(rightArm, false);
      const leftElbow = makePlayerArm(leftArm, false);
      rightArm.position.set(0.30, 1.42, 0.06);
      leftArm.position.set(-0.30, 1.42, 0.06);
      rightArm.rotation.order = "YXZ";
      leftArm.rotation.order = "YXZ";
      rightArm.rotation.set(-0.85, -0.10, 0.00);
      leftArm.rotation.set(-0.85, 0.55, 0.00);
      group.add(rightArm, leftArm);

      // The leg is now hip → knee → (shin, boot). It used to be one rigid block from hip to
      // sole, so walking was two straight poles pivoting at the hip. Everything below the
      // knee keeps its old world offset, just re-parented and re-based on the knee group.
      const makePlayerLeg = (px) => {
        const lg = new THREE.Group();
        const th = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.38, 0.20), mPants);
        th.position.set(0, -0.19, 0); lg.add(th);
        const knee = new THREE.Group();
        knee.name = "knee";
        knee.rotation.order = "YXZ";
        knee.position.set(0, -0.38, 0);
        lg.add(knee);
        const kp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.12), mKnee);
        kp.position.set(0, 0, 0.06); knee.add(kp);
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.18), mPants);
        sh.position.set(0, -0.16, 0); knee.add(sh);
        const bt = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.16, 0.28), mBoot);
        bt.position.set(0, -0.40, 0.03); knee.add(bt);
        const sl = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.30), mBootS);
        sl.position.set(0, -0.50, 0.04); knee.add(sl);
        const lace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.10, 0.02), mGear);
        lace.position.set(0, -0.36, 0.15); knee.add(lace);
        lg.position.set(px, 0.62, 0);
        lg.userData.knee = knee;
        return lg;
      };
      const legR = makePlayerLeg(0.15);
      const legL = makePlayerLeg(-0.15);
      group.add(legR, legL);

      const rightHandGrip = new THREE.Group();
      rightHandGrip.position.set(0, -0.72, 0.12);
      rightHandGrip.rotation.order = "YXZ";
      rightHandGrip.rotation.x = 0.14;
      rightHandGrip.rotation.y = -0.04;
      rightArm.add(rightHandGrip);

      const weaponHold = getOrCreateRemoteWeaponHold(group);
      const gunModel = makeThirdPersonGun(1);
      applyThirdPersonGunToChestHold(gunModel, 1);
      weaponHold.add(gunModel);
      const supportSocket = attachRemoteSupportHand(gunModel, 1, mGlove);
      const primarySocket = attachRemotePrimaryHand(gunModel, 1, mGlove);

      const ns = makeNameSprite(name || "Player", null);
      ns.sprite.position.set(0, 2.55, 0);
      group.add(ns.sprite);

      const flashTarget = new THREE.Object3D();
      // Avatar mesh faces +Z; group uses yaw+π so forward is +Z here — unlike camera flash (-Z).
      flashTarget.position.set(0, 0, 1);
      const flashOuter = createPhysicalSpotLight(
        PLAYER_LIGHT_COLOR,
        FLASH_OUTER_INTENSITY,
        FLASH_OUTER_DISTANCE,
        FLASH_OUTER_ANGLE,
        FLASH_OUTER_PEN,
        FLASHLIGHT_LIGHT_DECAY
      );
      const flashInner = createPhysicalSpotLight(
        PLAYER_LIGHT_COLOR,
        FLASH_INNER_INTENSITY,
        FLASH_INNER_DISTANCE,
        FLASH_INNER_ANGLE,
        FLASH_INNER_PEN,
        FLASHLIGHT_LIGHT_DECAY
      );
      flashOuter.position.set(0, 0.16, 0.14);
      flashInner.position.set(0, 0.16, 0.14);
      const flashMount = new THREE.Group();
      flashMount.position.set(0, 1.62, 0);
      flashMount.add(flashOuter);
      flashMount.add(flashInner);
      flashMount.add(flashTarget);
      flashOuter.target = flashTarget;
      flashInner.target = flashTarget;
      group.add(flashMount);
      flashMount.visible = !duelBright;

      group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      group.visible = false;
      return {
        group,
        isDown: false,
        x: 0,
        y: 1.65,
        z: 0,
        yaw: 0,
        name: name || "Player",
        nameSprite: ns.sprite,
        nameCanvas: ns.canvas,
        nameCtx: ns.ctx,
        nameTex: ns.tex,
        equippedAchievement: null,
        rightArm,
        leftArm,
        rightElbow,
        leftElbow,
        rightHandGrip,
        rightLeg: legR,
        leftLeg: legL,
        rightKnee: legR.userData.knee,
        leftKnee: legL.userData.knee,
        /** Base Y of the avatar group; the animator adds gait bob on top of this. */
        bodyBobY: 0,
        landSquash: 0,
        walkPhase: 0,
        weaponHold,
        gunModel,
        supportSocket,
        primarySocket,
        currentWeapon: 1,
        isReloading: false,
        reloadPhase: 0,
        torsoMesh: chest,
        headGroup,
        flashMount,
        flashOuter,
        flashInner,
        duelBright,
        gloveMat: mGlove,
        ads: false,
        adsBlend: 0,
        remotePitch: 0,
        hpEstimate: 100,
      };
    }

    function getSafeViewportSize() {
      try {
        let w = window.innerWidth || 0;
        let h = window.innerHeight || 0;
        const de = typeof document !== "undefined" ? document.documentElement : null;
        const db = typeof document !== "undefined" ? document.body : null;
        if (de) {
          w = Math.max(w, de.clientWidth || 0);
          h = Math.max(h, de.clientHeight || 0);
        }
        if (db) {
          w = Math.max(w, db.clientWidth || 0);
          h = Math.max(h, db.clientHeight || 0);
        }
        try {
          const appEl = document.getElementById("app");
          if (appEl) {
            const ow = appEl.offsetWidth || 0;
            const oh = appEl.offsetHeight || 0;
            if (ow >= 2) w = Math.max(w, ow);
            if (oh >= 2) h = Math.max(h, oh);
            const br = appEl.getBoundingClientRect();
            if (br.width >= 2 && br.height >= 2) {
              w = Math.max(w, br.width);
              h = Math.max(h, br.height);
            }
          }
        } catch (_) {}
        const vv = window.visualViewport;
        if (vv && vv.width >= 2 && vv.height >= 2) {
          /** Do not trust visualViewport alone — it can briefly mismatch innerWidth (fixes black canvas until window resize / F12). */
          w = Math.max(w, vv.width);
          h = Math.max(h, vv.height);
        }
        w = Math.max(
          1,
          w ||
            (de && de.clientWidth) ||
            1
        );
        h = Math.max(
          1,
          h ||
            (de && de.clientHeight) ||
            1
        );
        /** Cold layout / docked DevTools: inner* can lie; outer + avail screen recover sane pixels without standalone resize. */
        if (w < 200 || h < 200) {
          try {
            const ow = window.outerWidth || 0;
            const oh = window.outerHeight || 0;
            const sw = window.screen && window.screen.availWidth ? window.screen.availWidth : 0;
            const sh = window.screen && window.screen.availHeight ? window.screen.availHeight : 0;
            if (ow >= 2) w = Math.max(w, ow);
            if (oh >= 2) h = Math.max(h, oh);
            if (sw >= 2) w = Math.max(w, sw);
            if (sh >= 2) h = Math.max(h, sh);
          } catch (_) {}
        }
        if (!Number.isFinite(w) || !Number.isFinite(h)) {
          w = 800;
          h = 600;
        }
        w = Math.max(2, Math.min(8192, w));
        h = Math.max(2, Math.min(8192, h));
        return { w, h };
      } catch (_) {
        return { w: 800, h: 600 };
      }
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070504);
    scene.fog = new THREE.Fog(0x070504, 16, 72);

    const _vpInit = getSafeViewportSize();
    const camera = new THREE.PerspectiveCamera(
      75,
      _vpInit.w / _vpInit.h,
      0.1,
      240
    );
    camera.rotation.order = "YXZ";

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });
    renderer.setSize(_vpInit.w, _vpInit.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.sortObjects = false;
    app.appendChild(renderer.domElement);

    /** Precompile programs after scene/map changes so gameplay avoids shader hitch spikes. */
    function compileSceneShaders() {
      renderer.compile(scene, camera);
    }

    // Same luminance as pre–r155 legacy lights: physically correct shading drops ~π× vs old scaling.
    const _LEGACY_L = Math.PI;
    const hemi = new THREE.HemisphereLight(0x524838, 0x141008, 0.14 * _LEGACY_L);
    scene.add(hemi);

    const moon = new THREE.DirectionalLight(0xc8b078, 0.11 * _LEGACY_L);
    moon.position.set(28, 34, 22);
    moon.castShadow = true;
    moon.shadow.camera.left = -100;
    moon.shadow.camera.right = 100;
    moon.shadow.camera.top = 100;
    moon.shadow.camera.bottom = -100;
    scene.add(moon);

    const fallbackColor = "#13151d";
    const fallbackWallColor = "#020202";
    let wallTexture = null;
    let wallTextureLoaded = false;

    function getQualityPreset() {
      return QUALITY_PRESETS[getQualityId()] || QUALITY_PRESETS.regular;
    }

    function getPixelRatioForQuality() {
      const dpr = window.devicePixelRatio || 1;
      // Capped DPR: higher tiers add realism via shading and textures first, not brute-force resolution.
      return Math.min(getQualityPreset().dpr, dpr);
    }

    /** Scales camera shake / head bob. Realism raised across every tier (potato included); the ladder stays strictly monotonic so higher tiers still feel heavier. */
    function getQualityPresentationScale() {
      return getQualityPreset().presentation;
    }

    function getMaxTextureAnisotropy() {
      const cap = renderer.capabilities.getMaxAnisotropy();
      return Math.min(getQualityPreset().aniso, cap);
    }

    function getQualityId() {
      return QUALITY_LEVELS[gameSettings.qualityIndex] || "regular";
    }

    function getQualityFogBase() {
      return getQualityPreset().fog;
    }

    function getMapEnvColors() {
      // Training keeps the stock concrete palette but gets an actual blue sky overhead.
      // The fog stays close to the shared bright-map grey so distance doesn't tint blue —
      // only the sky itself is coloured.
      if (isTrainingMap(CURRENT_MAP)) return { fog: 0x9db4cc, bg: 0x6fa8dc };
      if (isBrightIndoorMap(CURRENT_MAP)) return { fog: 0x8ea6c6, bg: 0xa9c3e6 };
      if (isBossArenaMap(CURRENT_MAP)) return { fog: 0x1a1a22, bg: 0x1a1a22 };
      // The gauntlet is a platforming course: with the stock near-black fog the next
      // platform edge simply is not visible, which turns every gap into a guess. Slate
      // instead of black keeps the mood without hiding the thing you have to jump to.
      if (isGauntletMap(CURRENT_MAP)) return { fog: 0x2b3542, bg: 0x18202b };
      return { fog: 0x070504, bg: 0x070504 };
    }

    /** Distance fog + camera far: darkness and light fade beyond render distance (scaled by preset). */
    function applySceneFogAndCameraFar() {
      if (!scene.fog || !scene.fog.isFog) return;
      const rdIdx = THREE.MathUtils.clamp(
        gameSettings.renderDistanceIndex | 0,
        0,
        RENDER_DISTANCE_LEVELS.length - 1
      );
      const scale = RENDER_DISTANCE_LEVELS[rdIdx].scale;
      let far;
      let near;
      if (isBrightIndoorMap(CURRENT_MAP)) {
        far = Math.max(140, 210 * scale);
        near = THREE.MathUtils.clamp(28 * scale, 14, far - 28);
      } else if (isBossArenaMap(CURRENT_MAP)) {
        far = Math.max(50, 80 * scale);
        near = THREE.MathUtils.clamp(8 * scale, 4, far - 12);
      } else {
        const base = getQualityFogBase();
        far = Math.max(22, base.far * scale);
        near = THREE.MathUtils.clamp(base.near * scale * 0.97, 4, Math.max(8, far - 12));
      }
      const env = getMapEnvColors();
      scene.fog.color.set(env.fog);
      scene.background.set(env.bg);
      scene.fog.near = near;
      scene.fog.far = far;

      // Pad the far plane by ~2 wall thicknesses, not 48 units: beyond fog.far the
      // maze is 100% fogged (pixel-identical to the background), so the old +48 band
      // only added invisible overdraw. Only shrink where fog fully engages.
      camera.far = isBrightIndoorMap(CURRENT_MAP)
        ? THREE.MathUtils.clamp(far + 48, 52, 280)
        : THREE.MathUtils.clamp(far + 8, 52, 280);
      camera.updateProjectionMatrix();
    }

    /** Local rendering: tone mapping, capped resolution, shadows, fog distance, textures — each step should look more realistic, not just heavier. */
    function applyGraphicsQuality() {
      const p = getQualityPreset();
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = p.exposure;
      renderer.setPixelRatio(getPixelRatioForQuality());
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      moon.shadow.mapSize.set(p.shadowSz, p.shadowSz);
      moon.shadow.bias = p.bias;
      moon.shadow.normalBias = p.normalBias;

      applySceneFogAndCameraFar();

      if (warFilmOverlay) warFilmOverlay.style.opacity = p.warFilm;
      if (shadeOverlay) shadeOverlay.style.opacity = p.shade;

      syncGameRendererSize();
      applyWallTexture();
      compileSceneShaders();
    }

    function syncGameRendererSize() {
      try {
        const vp = getSafeViewportSize();
        let w = Math.floor(vp.w);
        let h = Math.floor(vp.h);
        try {
          const appEl = document.getElementById("app");
          if (appEl) {
            const br = appEl.getBoundingClientRect();
            if (br.width >= 2 && br.height >= 2) {
              w = Math.max(w, Math.floor(br.width));
              h = Math.max(h, Math.floor(br.height));
            }
          }
          if (renderer && renderer.domElement) {
            const dr = renderer.domElement.getBoundingClientRect();
            if (dr.width >= 2 && dr.height >= 2) {
              w = Math.max(w, Math.floor(dr.width));
              h = Math.max(h, Math.floor(dr.height));
            }
          }
        } catch (_) {}
        if (!Number.isFinite(w) || !Number.isFinite(h)) {
          w = 800;
          h = 600;
        }
        w = Math.max(2, Math.min(8192, w));
        h = Math.max(2, Math.min(8192, h));
        const aspect = w / h;
        if (!Number.isFinite(aspect) || aspect <= 0) return;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(getPixelRatioForQuality());
        /** updateStyle=false: #app canvas uses 100% CSS; inline px from setSize(true) caused black/wrong size until DevTools resize. */
        renderer.setSize(w, h, false);
        try {
          renderer.domElement.style.display = "block";
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
        } catch (_) {}
      } catch (_) {}
    }

    /** First frames after load / tab focus: keep syncing until layout stabilizes (mitigates black GL canvas until manual resize). */
    let _rendererSyncWarmupFrames = 0;

    function bumpRendererLayoutSync(warmupFrames) {
      _rendererSyncWarmupFrames = Math.max(
        _rendererSyncWarmupFrames,
        warmupFrames | 0
      );
      syncGameRendererSize();
      requestAnimationFrame(() => {
        syncGameRendererSize();
        requestAnimationFrame(syncGameRendererSize);
      });
      [16, 64, 200, 420].forEach((ms) =>
        setTimeout(syncGameRendererSize, ms)
      );
    }

    applyGraphicsQuality();
    requestAnimationFrame(() => {
      syncGameRendererSize();
      requestAnimationFrame(() => syncGameRendererSize());
    });

    const worldSize = 260;

    const texLoader = new THREE.TextureLoader();
    texLoader.setCrossOrigin("anonymous");

    function pageDirFromLocation() {
      try {
        if (typeof window.__GAME_ASSET_BASE_DIR__ === "string" && window.__GAME_ASSET_BASE_DIR__) {
          return window.__GAME_ASSET_BASE_DIR__;
        }
      } catch (_) {}
      const page = String(window.location.href).split(/[#?]/)[0];
      try {
        const u = new URL(page);
        const p = u.pathname || "/";
        const segs0 = p.replace(/\/+$/, "").split("/").filter(Boolean);
        const bareGame =
          segs0.length === 1 &&
          (segs0[0].toLowerCase() === "game" ||
            segs0[0].toLowerCase() === "game-self-hosted" ||
            segs0[0].toLowerCase() === "game-self-hosted.html");
        if (!p || p === "/") {
          return u.origin + "/";
        }
        if (bareGame) {
          return u.origin + "/";
        }
        if (p.endsWith("/")) {
          return u.origin + p;
        }
        const li = p.lastIndexOf("/");
        return li >= 0 ? u.origin + p.slice(0, li + 1) : u.origin + "/";
      } catch (_) {
        const schemeRest = page.indexOf("/", page.indexOf("//") + 2);
        const slash = page.lastIndexOf("/");
        if (schemeRest >= 0 && slash > schemeRest) {
          return page.slice(0, slash + 1);
        }
        return page.endsWith("/") ? page : page + "/";
      }
    }

    function normalizeGameAssetBase(b) {
      if (!b) return "";
      const s = String(b).trim();
      return s.endsWith("/") ? s : s + "/";
    }

    function getDeployedPublicRootHref() {
      try {
        if (typeof window.__GAME_STATIC_ROOT__ === "string" && window.__GAME_STATIC_ROOT__) {
          return window.__GAME_STATIC_ROOT__;
        }
      } catch (_) {}
      try {
        const metaAb = document.querySelector('meta[name="game-asset-base"]');
        const ab = metaAb && metaAb.content != null ? String(metaAb.content).trim() : "";
        if (ab) {
          try {
            return normalizeGameAssetBase(new URL(ab, window.location.href).href);
          } catch (_) {}
        }
      } catch (_) {}
      try {
        const meta = document.querySelector('meta[name="game-static-prefix"]');
        let pre = meta && meta.content != null ? String(meta.content).trim() : "";
        if (pre && !pre.startsWith("/")) pre = "/" + pre;
        pre = pre.replace(/\/+$/, "");
        if (pre) {
          return window.location.origin + pre + "/";
        }
      } catch (_) {}
      try {
        if (typeof window.__GAME_ASSET_BASE_DIR__ === "string" && window.__GAME_ASSET_BASE_DIR__) {
          return window.__GAME_ASSET_BASE_DIR__;
        }
      } catch (_) {}
      try {
        if (typeof window.__gameComputeAssetBaseDir === "function") {
          return window.__gameComputeAssetBaseDir(window.location.href);
        }
      } catch (_) {}
      try {
        return window.location.origin + "/";
      } catch (_) {
        return "/";
      }
    }

    function getGameAssetBaseCandidates() {
      const explicit = [];
      const meta = document.querySelector('meta[name="game-asset-base"]');
      const raw = meta && meta.content != null ? String(meta.content).trim() : "";
      if (raw) explicit.push(normalizeGameAssetBase(raw));

      const dir = pageDirFromLocation();
      let parent = null;
      let grandparent = null;
      try {
        parent = new URL("../", dir).href;
        grandparent = new URL("../../", dir).href;
      } catch (_) {}

      let lastSeg = "";
      try {
        const segs = new URL(dir).pathname.replace(/\/+$/, "").split("/").filter(Boolean);
        lastSeg = (segs[segs.length - 1] || "").toLowerCase();
      } catch (_) {}

      const pageOrder = [];
      // Common bad deploy: only game.html under .../html/ while walls.png + game-ui/ live one level up.
      if (lastSeg === "html") {
        if (parent) pageOrder.push(parent);
        if (grandparent) pageOrder.push(grandparent);
        pageOrder.push(dir);
      } else {
        pageOrder.push(dir);
        if (parent) pageOrder.push(parent);
        if (grandparent) pageOrder.push(grandparent);
      }

      let here = "";
      try {
        here = window.location.origin;
      } catch (_) {}

      const nearOrigin = [];
      const farOrigin = [];
      for (const b of pageOrder) {
        try {
          if (here && new URL(b).origin === here) nearOrigin.push(b);
          else farOrigin.push(b);
        } catch (_) {
          farOrigin.push(b);
        }
      }

      /** Multiplayer origin last: static files should load from the same host as this HTML when possible (avoids 404 + MediaElementSource CORS). */
      const remoteFallbacks = [];
      const mpMeta = document.querySelector('meta[name="game-multiplayer-origin"]');
      const mpRaw = mpMeta && mpMeta.content != null ? String(mpMeta.content).trim() : "";
      if (mpRaw) {
        try {
          remoteFallbacks.push(new URL("/", mpRaw).href);
        } catch (_) {}
      }
      remoteFallbacks.push("https://tintly555.github.io/games/fps/");

      const merged = [
        ...explicit,
        dir,
        getDeployedPublicRootHref(),
        ...nearOrigin,
        ...farOrigin,
        ...remoteFallbacks,
      ];
      return [...new Set(merged)];
    }

    /** Build the deduped candidate-URL list for a single asset file across every asset base. */
    function assetUrlList(rel) {
      const urls = [];
      for (const base of getGameAssetBaseCandidates()) {
        try {
          urls.push(new URL(rel, base).href);
        } catch (_) {}
      }
      return [...new Set(urls)];
    }

    function getWallTextureUrlList() {
      // In-game arena/boss wall texture — must be walls.png. Do NOT change this to
      // background.png; that is the menu background, not the wall used in gameplay.
      return assetUrlList("images/walls.png");
    }

    /**
     * Separate URL list for the menu-wall 3D scene (the (Experimental) animated background
     * light visual). The menu-wall uses background.png — the same image that sits behind
     * the main menu as a 2D background. This is intentionally different from
     * getWallTextureUrlList (which serves the in-game arena/boss walls via walls.png).
     */
    function getMenuWallTextureUrlList() {
      return assetUrlList("images/background.png");
    }

    /** Mini Three scene behind main menu: wall texture (Lambert, in-game style) + warm fill + center lamp; lamp intensity follows menu.mp3 (session peak = 100%). */
    let menuBackdropRenderer = null;
    let menuBackdropScene = null;
    let menuBackdropCamera = null;
    let menuBackdropWall = null;
    let menuBackdropHemi = null;
    let menuBackdropPoint = null;
    let menuBackdropReady = false;
    let menuBackdropRaf = 0;

    const MENU_BACKDROP_LIGHT_FIXED = 2.0;
    let menuBgmAnalyser = null;
    let menuBgmMenuGain = null;
    let menuBgmMediaSrc = null;
    let menuBgmTimeBuf = null;
    // Frequency-domain buffer for reading the 700Hz band that drives the menu-wall lamp.
    let menuBgmFreqBuf = null;

    function updateMenuBackdropLightFromMusic() {
      if (!menuBackdropPoint) return;
      // Lamp brightness is driven by the 700Hz frequency band of the menu music.
      // The closer a frequency bin is to 700Hz, the more it affects the lamp.
      // Frequencies above 700Hz are ignored (a hard cutoff at 700Hz).
      //
      // The visual responds directly to the audio file (the analyser is tapped from
      // menuBgmMenuGain, which sits BEFORE the audio music bus / master gain — so it
      // reads the file's instantaneous content, not the device output). The visual
      // only activates when the audio is actually playing (the play() promise has
      // resolved and !paused); otherwise bandEnergy stays at 0 and the lamp sits
      // at its minimum.
      let bandEnergy = 0;
      if (menuBgmAnalyser && menuBgmFreqBuf && menuBgmAudio && !menuBgmAudio.paused && menuBgmAudio.currentTime > 0) {
        menuBgmAnalyser.getByteFrequencyData(menuBgmFreqBuf);
        const sampleRate = (typeof audioCtx !== "undefined" && audioCtx) ? audioCtx.sampleRate : 44100;
        const fftSize = menuBgmAnalyser.fftSize;
        const hzPerBin = sampleRate / fftSize;
        const targetBin = Math.floor(700 / hzPerBin);
        const minBin = Math.max(0, targetBin - 6);
        const maxBin = Math.min(menuBgmFreqBuf.length - 1, targetBin + 6);
        let weighted = 0;
        let totalWeight = 0;
        for (let i = 0; i < menuBgmFreqBuf.length; i++) {
          if (i > maxBin) break;
          if (i < minBin) continue;
          const dist = Math.abs(i - targetBin);
          const w = Math.max(0, 1 - dist / 7);
          if (w <= 0) continue;
          weighted += (menuBgmFreqBuf[i] / 255) * w;
          totalWeight += w;
        }
        if (totalWeight > 0) {
          bandEnergy = Math.min(1, weighted / totalWeight);
        }
      }
      // Lamp = base × musicMul. The 700Hz band energy drives a HUGE intensity
      // range: 0 (silent) to ~10 (loud peak at 700Hz). bandEnergy is already
      // normalized to [0, 1], so multiplying by 10 gives a 10x dynamic range.
      // When no music is playing, bandEnergy is 0 and the lamp is at its minimum.
      const musicMul = bandEnergy * 6;
      menuBackdropPoint.intensity = Math.max(0.4, MENU_BACKDROP_LIGHT_FIXED * musicMul - 5);
    }

    function resizeMenuWallBackdrop() {
      if (!menuBackdropRenderer || !menuBackdropCamera || !menuWallBackdropCanvas) return;
      const vp = getSafeViewportSize();
      menuBackdropCamera.aspect = vp.w / vp.h;
      menuBackdropCamera.updateProjectionMatrix();
      menuBackdropRenderer.setSize(vp.w, vp.h, false);
    }

    function menuBackdropFrame() {
      if (!menuBackdropReady || !menuBackdropRenderer) return;
      if (menuEl.style.display === "none") {
        menuBackdropRaf = 0;
        return;
      }
      updateMenuBackdropLightFromMusic();
      menuBackdropRenderer.render(menuBackdropScene, menuBackdropCamera);
      menuBackdropRaf = requestAnimationFrame(menuBackdropFrame);
    }

    function startMenuBackdropLoop() {
      if (!menuBackdropReady || menuBackdropRaf) return;
      if (menuEl.style.display === "none") return;
      menuBackdropRaf = requestAnimationFrame(menuBackdropFrame);
    }

    function stopMenuBackdropLoop() {
      if (menuBackdropRaf) {
        cancelAnimationFrame(menuBackdropRaf);
        menuBackdropRaf = 0;
      }
    }

    function setMenuWallBackdropVisible(visible) {
      if (!menuWallBackdropCanvas) return;
      menuWallBackdropCanvas.style.display = visible ? "block" : "none";
      menuWallBackdropCanvas.style.visibility = visible ? "visible" : "hidden";
    }

    function setGameActiveUi(active) {
      document.body.classList.toggle("game-active", !!active);
      setMenuWallBackdropVisible(!active);
    }

    function initMenuWallBackdrop() {
      if (!menuWallBackdropCanvas || menuBackdropRenderer) return;
      // Catch any failure (missing WebGL, dimension 0, asset load error) and leave the canvas
      // visible anyway with a CSS gradient — better than a black void.
      try {
      menuBackdropScene = new THREE.Scene();
      // DIAGNOSTIC: bright red scene background. If this red shows on screen, the canvas is
      // being composited and the lamp/wall just isn't visible at the current lighting. If
      // the screen is still black, the canvas isn't being composited at all (z-index or
      // compositing issue).
      // Background is null so the scene's clear color is transparent — the <img
      // id="menuBg"> underneath shows through the canvas wherever the wall geometry
      // doesn't cover (edges, etc.). With alpha: true on the WebGL context, the
      // canvas composites cleanly over the img.
      menuBackdropScene.background = null;

      const mbVp = getSafeViewportSize();
      // Force the canvas to have valid CSS dimensions BEFORE the renderer reads them.
      if (mbVp.w < 1 || mbVp.h < 1) {
        console.warn("[menuBackdrop] viewport size is 0; deferring init to first resize");
        window.addEventListener("resize", () => {
          if (!menuBackdropRenderer) initMenuWallBackdrop();
        }, { once: true });
        return;
      }
      menuBackdropCamera = new THREE.PerspectiveCamera(
        48,
        mbVp.w / mbVp.h,
        0.1,
        80
      );
      menuBackdropCamera.position.set(0, 6.2, 7.2);
      menuBackdropCamera.lookAt(0, 6.2, -10);

      menuBackdropHemi = new THREE.HemisphereLight(0xffe8c8, 0x141008, 0.11 * Math.PI);
      menuBackdropScene.add(menuBackdropHemi);

      // Three.js's modern PointLight uses physically-correct falloff: at distance d with decay
      // exponent, attenuation is ~ 1/d^decay. With decay=2 the light is essentially zero at
      // any meaningful distance, so the wall renders as black. Use decay=0 (no distance
      // falloff, light is uniform up to the cutoff distance) and a generous intensity.
      // Pure white lamp on a near-black scene — high contrast (white light, dark scene).
      menuBackdropPoint = new THREE.PointLight(0xffffff, MENU_BACKDROP_LIGHT_FIXED, 100, 0);
      menuBackdropPoint.position.set(0, 6.2, 1.4);
      menuBackdropScene.add(menuBackdropPoint);

      const wallMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      // Make the wall plane large enough to fill the camera's view at z=-11 on
      // any reasonable aspect ratio, but not so large that the texture looks
      // pixelated or the lamp is spread too thin. 60×34 covers ultrawide 21:9
      // comfortably while keeping the wall readable.
      const wallGeo = new THREE.PlaneGeometry(60, 34);
      menuBackdropWall = new THREE.Mesh(wallGeo, wallMat);
      menuBackdropWall.position.set(0, 6.2, -11);
      menuBackdropScene.add(menuBackdropWall);

      menuBackdropRenderer = new THREE.WebGLRenderer({
        canvas: menuWallBackdropCanvas,
        antialias: true,
        // alpha: true so the <img id="menuBg"> underneath shows through wherever
        // the 3D scene doesn't cover (edges, etc.). With scene.background = null
        // the canvas clears to transparent and the wall geometry paints on top
        // of the img.
        alpha: true,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false,
      });
      // If the WebGL context itself failed, fall through to the CSS gradient.
      if (!menuBackdropRenderer.getContext()) {
        throw new Error("WebGL context creation returned null");
      }
      menuBackdropRenderer.outputColorSpace = THREE.SRGBColorSpace;
      // Use linear tone mapping (no compression) so the lamp intensity maps directly to
      // pixel brightness. ACES Filmic was crushing the lamp's effective range and making
      // the wall look black at the modest intensities we use here.
      menuBackdropRenderer.toneMapping = THREE.LinearToneMapping;
      menuBackdropRenderer.toneMappingExposure = 1.0;
      menuBackdropRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      resizeMenuWallBackdrop();

      // Start the render loop immediately — don't wait for the texture to load. Without this,
      // if the texture load hangs or all URLs fail without firing the error callback (e.g.
      // CORS-blocked, wrong MIME type, network timeout that the loader doesn't surface), the
      // canvas stays transparent because the render loop never starts. Starting the loop here
      // means the lamp + scene background are visible immediately; the wall texture replaces
      // the solid wallMat.color when it eventually loads.
      menuBackdropReady = true;
      startMenuBackdropLoop();

      const urls = getMenuWallTextureUrlList();
      let idx = 0;
      function tryWall() {
        if (idx >= urls.length) {
          wallMat.color.set("#020202");
          menuBackdropReady = true;
          startMenuBackdropLoop();
          return;
        }
        const u = urls[idx];
        texLoader.load(
          u,
          (tex) => {
            // Stretch the texture to fit the wall plane (no tiling).
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.colorSpace = THREE.SRGBColorSpace;
            wallMat.map = tex;
            wallMat.needsUpdate = true;
            menuBackdropReady = true;
            startMenuBackdropLoop();
          },
          undefined,
          () => {
            idx++;
            tryWall();
          }
        );
      }
      tryWall();

      window.addEventListener("resize", resizeMenuWallBackdrop);
      } catch (e) {
        // Init failed (WebGL unavailable, asset URLs broken, or some other init issue).
        // Paint a CSS gradient on the canvas so the menu still has a textured background
        // instead of a black void, and log the actual error so the user can see it.
        console.warn("[menuBackdrop] init failed, using CSS fallback:", e && (e.message || e));
        if (menuWallBackdropCanvas) {
          menuWallBackdropCanvas.style.background =
            "radial-gradient(ellipse at 50% 40%, #4a4632 0%, #2b2820 55%, #14110c 100%)";
        }
      }
    }

    // Always run the menu-wall scene. The 3D wall + lamp is on by default.
    initMenuWallBackdrop();

    const __GAME_UI_LAYOUTS__ =
      (typeof window !== "undefined" && window.__FPS_UI_LAYER_PATHS__ && window.__FPS_UI_LAYER_PATHS__.length
        ? window.__FPS_UI_LAYER_PATHS__
        : [
            {
              menuBg: "images/background.png",
              btnTex: "images/button.png",
              settingsBg: "images/modal-bg.png",
            },
          ]);

    function applyResolvedGameAssetBase(base, layout) {
      const L = layout || __GAME_UI_LAYOUTS__[0];
      const b = normalizeGameAssetBase(base);
      try {
        const root = document.documentElement;
        root.style.setProperty(
          "--game-ui-menu-bg",
          `url("${new URL(L.menuBg, b).href}")`
        );
        root.style.setProperty(
          "--game-ui-btn-texture",
          `url("${new URL(L.btnTex, b).href}")`
        );
        root.style.setProperty(
          "--game-ui-settings-bg",
          `url("${new URL(L.settingsBg, b).href}")`
        );
      } catch (_) {}
    }

    function resolveGameUiLayersFromProbe() {
      const candidates = getGameAssetBaseCandidates();
      let bi = 0;
      let li = 0;
      function tryNext() {
        if (bi >= candidates.length) return;
        if (li >= __GAME_UI_LAYOUTS__.length) {
          bi++;
          li = 0;
          tryNext();
          return;
        }
        const base = normalizeGameAssetBase(candidates[bi]);
        const layout = __GAME_UI_LAYOUTS__[li];
        let testUrl;
        try {
          testUrl = new URL(layout.menuBg, base).href;
        } catch (_) {
          li++;
          if (li >= __GAME_UI_LAYOUTS__.length) {
            bi++;
            li = 0;
          }
          tryNext();
          return;
        }
        const img = new Image();
        img.onload = () => applyResolvedGameAssetBase(base, layout);
        img.onerror = () => {
          li++;
          if (li >= __GAME_UI_LAYOUTS__.length) {
            bi++;
            li = 0;
          }
          tryNext();
        };
        img.src = testUrl;
      }
      tryNext();
    }

    function tryLoadWallsTexture(urls, index) {
      if (index >= urls.length) {
        wallTextureLoaded = false;
        return;
      }
      texLoader.load(
        urls[index],
        (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.magFilter = THREE.LinearFilter;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.anisotropy = getMaxTextureAnisotropy();
          wallTexture = tex;
          wallTextureLoaded = true;
          _wallTextureCache.clear();
          _wallMaterialCache.clear();
          applyWallTexture();
          compileSceneShaders();
        },
        undefined,
        () => tryLoadWallsTexture(urls, index + 1)
      );
    }
    tryLoadWallsTexture(getWallTextureUrlList(), 0);
    resolveGameUiLayersFromProbe();

    const _texturedMeshes = [];
    /** World meters per full texture repeat on wall boxes (higher = larger pattern, thin faces use ≥1 repeat). */
    const WALL_TEXTURE_METERS_PER_REPEAT = 5;
    /** Floor / ceiling planes (crossfire + maze chunks): same world-space texture scale. */
    const FLOOR_CEILING_METERS_PER_REPEAT = 5;

    const _wallTextureCache = new Map();
    const _wallMaterialCache = new Map();

    /** One cloned texture per (repeat) — shared by every material using the same repeat scale (was a fresh clone per wall face). */
    function getWallTextureCached(rx, ry) {
      const key = `${rx}x${ry}`;
      let t = _wallTextureCache.get(key);
      if (!t) {
        t = wallTexture.clone();
        t.needsUpdate = true;
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(rx, ry);
        t.anisotropy = getMaxTextureAnisotropy();
        _wallTextureCache.set(key, t);
      }
      return t;
    }

    /** One material per (repeat, tint, texturesOn) — shared by every wall/floor/ceiling with the same key. */
    function getWallMaterialCached(repeatX, repeatY, color) {
      const key = `${repeatX}|${repeatY}|${color}|${gameSettings.texturesOn && wallTexture ? 1 : 0}`;
      let mat = _wallMaterialCache.get(key);
      if (!mat) {
        mat = makeWallMaterial(repeatX, repeatY, color);
        mat.userData = mat.userData || {};
        mat.userData._cachedShared = true;
        _wallMaterialCache.set(key, mat);
      }
      return mat;
    }

    /** Bake per-face UV repeat into the geometry so ONE material with repeat(1,1) works for all faces. */
    function bakeWallUvs(geometry, faceRepeats) {
      const uv = geometry.attributes.uv;
      if (!uv || !geometry.groups || !geometry.groups.length) return;
      const arr = uv.array;
      for (let g = 0; g < geometry.groups.length && g < faceRepeats.length; g++) {
        const { start, count } = geometry.groups[g];
        const rx = faceRepeats[g].rx;
        const ry = faceRepeats[g].ry;
        for (let vi = start; vi < start + count; vi++) {
          arr[vi * 2] *= rx;
          arr[vi * 2 + 1] *= ry;
        }
      }
      uv.needsUpdate = true;
    }

    /** Merge indexed BufferGeometries into one geometry (positions/normals/uvs + remapped indices). */
    function mergeBufferGeometries(geos) {
      if (!geos.length) return null;
      let vCount = 0;
      let iCount = 0;
      for (const g of geos) {
        vCount += g.attributes.position.count;
        iCount += g.index ? g.index.count : 0;
      }
      const hasIndex = geos.some((g) => g.index);
      const pos = new Float32Array(vCount * 3);
      const nor = new Float32Array(vCount * 3);
      const uv = new Float32Array(vCount * 2);
      const idx = hasIndex ? new Uint32Array(iCount) : null;
      let vo = 0;
      let io = 0;
      for (const g of geos) {
        const c = g.attributes.position.count;
        pos.set(g.attributes.position.array, vo * 3);
        nor.set(g.attributes.normal.array, vo * 3);
        uv.set(g.attributes.uv.array, vo * 2);
        if (idx && g.index) {
          const ia = g.index.array;
          for (let k = 0; k < ia.length; k++) idx[io + k] = ia[k] + vo;
          io += ia.length;
        }
        vo += c;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      if (idx) geo.setIndex(new THREE.BufferAttribute(idx, 1));
      return geo;
    }

    function makeWallMaterial(repeatX, repeatY, color) {
      // When textures are on, use the brick-wall texture at the caller's tint. When
      // textures are OFF, switch to a brighter material that reflects more light —
      // the wall reads as a smooth painted surface rather than a dark void. The
      // emissive component keeps it from going completely black in shadows.
      if (wallTextureLoaded && wallTexture && gameSettings.texturesOn) {
        return new THREE.MeshLambertMaterial({
          map: getWallTextureCached(repeatX, repeatY),
          color: color || 0xaaaaaa,
        });
      }
      // No texture: MeshStandardMaterial with high roughness + emissive base so the
      // wall reflects the scene's lights more strongly than a matte Lambert surface.
      return new THREE.MeshStandardMaterial({
        color: 0xc8c4b8,
        roughness: 0.55,
        metalness: 0.0,
        emissive: 0x1a1812,
        emissiveIntensity: 1.0,
      });
    }

    function applyWallTexture() {
      if (!wallTexture) return;
      for (const t of _wallTextureCache.values()) {
        t.anisotropy = getMaxTextureAnisotropy();
        t.needsUpdate = true; // re-upload so a live quality change takes effect immediately
      }
      for (const entry of _texturedMeshes) {
        const { mesh, rx, ry, tint } = entry;
        const m = mesh.material;
        if (m && !Array.isArray(m)) {
          // Walls bake their UV repeat into the geometry, so a single shared material
          // covers every wall face; just swap in the textured / plain variant.
          mesh.material = getWallMaterialCached(rx, ry, tint);
        }
      }
    }

    const floorMat = makeWallMaterial(
      worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      0x666670
    );
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(worldSize, worldSize, 1, 1),
      floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    _texturedMeshes.push({
      mesh: floor,
      rx: worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      ry: worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      tint: 0x666670,
    });

    const ceilingMat = makeWallMaterial(
      worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      0x5c6272
    );
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(worldSize, worldSize, 1, 1),
      ceilingMat
    );
    ceiling.position.y = 4.5;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);
    _texturedMeshes.push({
      mesh: ceiling,
      rx: worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      ry: worldSize / FLOOR_CEILING_METERS_PER_REPEAT,
      tint: 0x5c6272,
    });

    const wallMeshes = [];
    const wallBoxes = [];
    const decalGroup = new THREE.Group();
    const tracerGroup = new THREE.Group();
    const dissolveGroup = new THREE.Group();

    // Blood + spark pools are InstancedMesh — the whole effect is ONE draw call per
    // group (was up to 72 single-material tiny meshes). Dead slots are zero-scaled.
    const MAX_BLOOD_MESHES = 36;
    const MAX_SPARK_MESHES = 36;
    const SPARK_GEO_SHARED = new THREE.SphereGeometry(0.022, 4, 4);
    const BLOOD_GEO_SHARED = new THREE.SphereGeometry(0.028, 4, 4);
    const bloodGroup = new THREE.InstancedMesh(BLOOD_GEO_SHARED, new THREE.MeshBasicMaterial({ color: 0x9d1111 }), MAX_BLOOD_MESHES);
    const sparkGroup = new THREE.InstancedMesh(SPARK_GEO_SHARED, new THREE.MeshBasicMaterial({ color: 0xffffff }), MAX_SPARK_MESHES);
    bloodGroup.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sparkGroup.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sparkGroup.frustumCulled = false;
    bloodGroup.frustumCulled = false;
    const _bloodP = [];
    const _sparkP = [];
    const _mPool = new THREE.Matrix4();
    const _colPool = new THREE.Color();
    let _bloodCursor = 0;
    let _sparkCursor = 0;
    {
      const zero = new THREE.Matrix4().makeScale(0, 0, 0);
      for (let i = 0; i < MAX_BLOOD_MESHES; i++) {
        _bloodP.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 });
        bloodGroup.setMatrixAt(i, zero);
      }
      for (let i = 0; i < MAX_SPARK_MESHES; i++) {
        _sparkP.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 });
        sparkGroup.setMatrixAt(i, zero);
      }
      bloodGroup.instanceMatrix.needsUpdate = true;
      sparkGroup.instanceMatrix.needsUpdate = true;
    }
    scene.add(decalGroup, sparkGroup, tracerGroup, bloodGroup, dissolveGroup);

    function trimEffectGroup(group, max, disposeMaterial, incoming = 0) {
      while (group.children.length + incoming > max && group.children.length > 0) {
        const o = group.children[0];
        group.remove(o);
        disposeMaterial(o);
      }
    }

    function resolveWallTint(color) {
      const defaultTint = isBrightIndoorMap(CURRENT_MAP) ? 0x8a96a8 : 0x6b7384;
      const base = color != null ? color : defaultTint;
      if (!isBrightIndoorMap(CURRENT_MAP)) return base;
      const c = new THREE.Color(base);
      c.lerp(new THREE.Color(0xffffff), 0.2);
      return c.getHex();
    }

    function addWallBox(w, h, d, x, y, z, color = 0x6b7384) {
      const S = WALL_TEXTURE_METERS_PER_REPEAT;
      const rep = (u, v) => ({ rx: Math.max(1, u / S), ry: Math.max(1, v / S) });
      const faceRepeats = [
        rep(d, h), rep(d, h),
        rep(w, d), rep(w, d),
        rep(w, h), rep(w, h),
      ];
      const tint = resolveWallTint(color);
      // Bake the per-face repeat into UVs so one shared material (repeat 1,1) works
      // for every wall — 6 draw calls + 6 material/texture instances became 1 + 1.
      const geometry = new THREE.BoxGeometry(w, h, d);
      bakeWallUvs(geometry, faceRepeats);
      const mesh = new THREE.Mesh(geometry, getWallMaterialCached(1, 1, tint));
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      wallMeshes.push(mesh);
      const wallBox = new THREE.Box3().setFromObject(mesh);
      mesh.userData.wallBox = wallBox;
      wallBoxes.push(wallBox);
      _texturedMeshes.push({ mesh, rx: 1, ry: 1, tint });
      return mesh;
    }

    /** ── Infinite procedural maze (chunk-streamed; walls texture on floor/roof per chunk) ── */
    const MAZE_CHUNK_WORLD = 52;
    const MAZE_CELLS = 15;
    const MAZE_CELL_SIZE = MAZE_CHUNK_WORLD / MAZE_CELLS;
    const MAZE_WALL_H = 4.5;
    const MAZE_WALL_THICK = 0.42;
    /** Ceiling tiles + point lights: shared Y so lamps aren’t offset below fixtures or floating mid-room. */
    const MAZE_CEILING_LIGHT_Y = MAZE_WALL_H - 0.08;
    /** Match moon/hemi π convention; punctual lights scaled separately from global brightness. */
    const MAZE_LIGHT_INTENSITY_SCALE = Math.PI;
    let mazeChunks = new Map();
    const mazeGridCache = new Map();
    let mazeWorldSeed = 2166136261;
    let mazeChunkPollAcc = 0;
    let mazeNavRebuildRow = 0;
    /** WebGL forward shading has a hard limit on fragment light uniforms — register maze lamps and cull visibility each frame. */
    const mazeCullableLights = [];
    const MAX_MAZE_LIGHTS_ACTIVE = 20;

    function clearMazeGridCache() {
      mazeGridCache.clear();
    }

    function getMazeChunkGrid(cx, cz) {
      const key = `${cx},${cz}`;
      let grid = mazeGridCache.get(key);
      if (!grid) {
        grid = generateMazeChunkGrid(cx, cz);
        mazeGridCache.set(key, grid);
      }
      return grid;
    }

    function mazeHashSeed(cx, cz, salt = 0) {
      let h = mazeWorldSeed ^ salt ^ (cx * 73856093) ^ (cz * 19349663) ^ (cx * cz * 83492791);
      h >>>= 0;
      return mulberry32(h);
    }

    function mazeEastPortalRow(cx, cz) {
      const r = mazeHashSeed(cx, cz, 0x451234)();
      return (r >>> 0) % MAZE_CELLS;
    }

    function mazeNorthPortalCol(cx, cz) {
      const r = mazeHashSeed(cx, cz, 0x89237412)();
      return (r >>> 0) % MAZE_CELLS;
    }

    /** Open three adjacent wall segments so chunk seams stay walkable (single-cell gaps often felt “sealed”). */
    function openVertPortalStrip(vert, ix, baseRow) {
      for (let d = -1; d <= 1; d++) {
        const iy = (baseRow + d + MAZE_CELLS) % MAZE_CELLS;
        vert[ix][iy] = false;
      }
    }
    function openHorizPortalStrip(horiz, baseCol, iy) {
      for (let d = -1; d <= 1; d++) {
        const ix = (baseCol + d + MAZE_CELLS) % MAZE_CELLS;
        horiz[ix][iy] = false;
      }
    }

    function mazeCellDegreeOpen(gx, gy, vert, horiz, w, h) {
      let d = 0;
      if (!horiz[gx][gy]) d++;
      if (!horiz[gx][gy + 1]) d++;
      if (!vert[gx][gy]) d++;
      if (!vert[gx + 1][gy]) d++;
      return d;
    }

    function mazeReachableCount(vert, horiz, w, h) {
      const seen = Array(h)
        .fill(0)
        .map(() => Array(w).fill(false));
      const sx = Math.floor(w / 2);
      const sy = Math.floor(h / 2);
      const q = [[sx, sy]];
      seen[sy][sx] = true;
      let qi = 0;
      let cnt = 0;
      while (qi < q.length) {
        const [gx, gy] = q[qi++];
        cnt++;
        if (gy > 0 && !horiz[gx][gy] && !seen[gy - 1][gx]) {
          seen[gy - 1][gx] = true;
          q.push([gx, gy - 1]);
        }
        if (gy < h - 1 && !horiz[gx][gy + 1] && !seen[gy + 1][gx]) {
          seen[gy + 1][gx] = true;
          q.push([gx, gy + 1]);
        }
        if (gx > 0 && !vert[gx][gy] && !seen[gy][gx - 1]) {
          seen[gy][gx - 1] = true;
          q.push([gx - 1, gy]);
        }
        if (gx < w - 1 && !vert[gx + 1][gy] && !seen[gy][gx + 1]) {
          seen[gy][gx + 1] = true;
          q.push([gx + 1, gy]);
        }
      }
      return cnt;
    }

    function mazeKnockDownWallsUntilConnected(vert, horiz, w, h, rng) {
      for (let attempt = 0; attempt < 180; attempt++) {
        if (mazeReachableCount(vert, horiz, w, h) >= w * h) return;
        if (rng() < 0.5) {
          const ix = 1 + ((rng() * (w - 1)) | 0);
          const iy = (rng() * h) | 0;
          vert[ix][iy] = false;
        } else {
          const ix = (rng() * w) | 0;
          const iy = 1 + ((rng() * (h - 1)) | 0);
          horiz[ix][iy] = false;
        }
      }
    }

    function mazeReduceDeadEnds(vert, horiz, w, h, rng) {
      for (let pass = 0; pass < 72; pass++) {
        const leaves = [];
        for (let gy = 0; gy < h; gy++) {
          for (let gx = 0; gx < w; gx++) {
            if (mazeCellDegreeOpen(gx, gy, vert, horiz, w, h) === 1) leaves.push({ gx, gy });
          }
        }
        if (!leaves.length) break;
        const c = leaves[(rng() * leaves.length) | 0];
        const opts = [];
        if (horiz[c.gx][c.gy]) opts.push(["h", c.gx, c.gy]);
        if (horiz[c.gx][c.gy + 1]) opts.push(["h", c.gx, c.gy + 1]);
        if (vert[c.gx][c.gy]) opts.push(["v", c.gx, c.gy]);
        if (vert[c.gx + 1][c.gy]) opts.push(["v", c.gx + 1, c.gy]);
        if (!opts.length) continue;
        const p = opts[(rng() * opts.length) | 0];
        if (p[0] === "h") horiz[p[1]][p[2]] = false;
        else vert[p[1]][p[2]] = false;
      }
    }

    /**
     * Sparse “backrooms” layout: fewer walls, wide/narrow halls, gaps for shooting, forks & long runs.
     * Not a perfect maze — connectivity + dead-end passes keep FPS flow sane.
     */
    function generateMazeChunkGrid(cx, cz) {
      const rng = mazeHashSeed(cx, cz, 0x10203040);
      const w = MAZE_CELLS;
      const h = MAZE_CELLS;
      const vert = Array(w + 1)
        .fill(0)
        .map(() => Array(h).fill(false));
      const horiz = Array(w)
        .fill(0)
        .map(() => Array(h + 1).fill(false));

      const motif = (mazeHashSeed(cx, cz, 0x55aa0f11)() * 4) | 0;

      for (let ix = 1; ix < w; ix++) {
        if (rng() < 0.38 + (motif & 1) * 0.12) continue;
        for (let iy = 0; iy < h; iy++) {
          if (rng() < 0.22) continue;
          if ((motif === 1 || motif === 3) && (iy & 3) !== 0 && rng() < 0.62) continue;
          vert[ix][iy] = true;
        }
      }

      for (let iy = 1; iy < h; iy++) {
        if (rng() < 0.38 + ((motif >> 1) & 1) * 0.12) continue;
        for (let ix = 0; ix < w; ix++) {
          if (rng() < 0.22) continue;
          if ((motif === 2 || motif === 3) && (ix & 3) !== 0 && rng() < 0.62) continue;
          horiz[ix][iy] = true;
        }
      }

      const stubs = 4 + ((rng() * 8) | 0);
      for (let s = 0; s < stubs; s++) {
        if (rng() < 0.35) continue;
        const horizSeg = rng() < 0.5;
        if (horizSeg) {
          const iy = 1 + ((rng() * (h - 2)) | 0);
          const i0 = ((rng() * (w - 3)) | 0);
          const run = 2 + ((rng() * 5) | 0);
          for (let k = 0; k < run && i0 + k < w; k++) {
            if (rng() < 0.15) continue;
            horiz[i0 + k][iy] = true;
          }
        } else {
          const ix = 1 + ((rng() * (w - 2)) | 0);
          const j0 = ((rng() * (h - 3)) | 0);
          const run = 2 + ((rng() * 5) | 0);
          for (let k = 0; k < run && j0 + k < h; k++) {
            if (rng() < 0.15) continue;
            vert[ix][j0 + k] = true;
          }
        }
      }

      const ew = mazeEastPortalRow(cx - 1, cz);
      const ee = mazeEastPortalRow(cx, cz);
      openVertPortalStrip(vert, 0, ew);
      openVertPortalStrip(vert, w, ee);
      const ns = mazeNorthPortalCol(cx, cz - 1);
      const nn = mazeNorthPortalCol(cx, cz);
      openHorizPortalStrip(horiz, ns, 0);
      openHorizPortalStrip(horiz, nn, h);

      mazeKnockDownWallsUntilConnected(vert, horiz, w, h, rng);
      mazeReduceDeadEnds(vert, horiz, w, h, rng);

      const carveCells = [];
      for (let gy = 2; gy < h - 2; gy += 4) {
        for (let gx = 2; gx < w - 2; gx += 4) {
          if (rng() > 0.48) continue;
          const deg = mazeCellDegreeOpen(gx, gy, vert, horiz, w, h);
          const u = rng();
          const pRoof = 0.275;
          let kind = u < pRoof ? "roof" : "wall";
          if (kind === "wall" && rng() < 0.6) continue;
          if (deg >= 3 && rng() < 0.304) kind = "area";
          if (kind === "wall" && rng() < 0.096) kind = "area";

          if (kind === "area") {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const xi = gx + dx;
                const yi = gy + dy;
                if (xi < 0 || xi >= w || yi < 0 || yi >= h) continue;
                vert[xi][yi] = false;
                vert[xi + 1][yi] = false;
                horiz[xi][yi] = false;
                horiz[xi][yi + 1] = false;
              }
            }
            carveCells.push({ gx, gy, kind: "area" });
          } else {
            carveCells.push({ gx, gy, kind });
          }
        }
      }

      mazeKnockDownWallsUntilConnected(vert, horiz, w, h, rng);
      mazeReduceDeadEnds(vert, horiz, w, h, rng);

      return { vert, horiz, lightsPlan: carveCells };
    }

    /** XZ circle vs axis-aligned rectangle overlap (for procedural maze spawn without mesh). */
    function circleXZIntersectsRect(cx, cz, r, minX, maxX, minZ, maxZ) {
      const px = THREE.MathUtils.clamp(cx, minX, maxX);
      const pz = THREE.MathUtils.clamp(cz, minZ, maxZ);
      const dx = cx - px;
      const dz = cz - pz;
      return dx * dx + dz * dz <= r * r + 1e-8;
    }

    /** True if a circle in XZ hits any wall segment (matches pushWall AABBs). */
    function arenaCircleHitsMazeGrid(worldX, worldZ, radius, chunkCx, chunkCz) {
      const { vert, horiz } = getMazeChunkGrid(chunkCx, chunkCz);
      const ox = chunkCx * MAZE_CHUNK_WORLD;
      const oz = chunkCz * MAZE_CHUNK_WORLD;
      const cw = MAZE_CELL_SIZE;
      const w = MAZE_CELLS;
      const h = MAZE_CELLS;
      const t = MAZE_WALL_THICK;
      const hz = cw + 0.02;
      const hx = cw + 0.02;
      const lx = worldX - ox;
      const lz = worldZ - oz;
      const ixMin = Math.max(0, Math.floor((lx - radius - hx) / cw));
      const ixMax = Math.min(w, Math.ceil((lx + radius + hx) / cw));
      const iyMin = Math.max(0, Math.floor((lz - radius - hz) / cw));
      const iyMax = Math.min(h, Math.ceil((lz + radius + hz) / cw));
      for (let ix = ixMin; ix <= ixMax; ix++) {
        for (let iy = iyMin; iy < iyMax; iy++) {
          if (!vert[ix][iy]) continue;
          const wx = ox + ix * cw;
          const wz = oz + (iy + 0.5) * cw;
          const minX = wx - t * 0.5;
          const maxX = wx + t * 0.5;
          const minZ = wz - hz * 0.5;
          const maxZ = wz + hz * 0.5;
          if (circleXZIntersectsRect(worldX, worldZ, radius, minX, maxX, minZ, maxZ)) return true;
        }
      }
      for (let ix = ixMin; ix < ixMax; ix++) {
        for (let iy = iyMin; iy <= iyMax; iy++) {
          if (!horiz[ix][iy]) continue;
          const wx = ox + (ix + 0.5) * cw;
          const wz = oz + iy * cw;
          const minX = wx - hx * 0.5;
          const maxX = wx + hx * 0.5;
          const minZ = wz - t * 0.5;
          const maxZ = wz + t * 0.5;
          if (circleXZIntersectsRect(worldX, worldZ, radius, minX, maxX, minZ, maxZ)) return true;
        }
      }
      return false;
    }

    /** Spawn / respawn: valid even when maze chunks are not built yet (no wall meshes). */
    function arenaXZClearForSpawn(x, z, radius = 0.5) {
      const pcx = Math.floor(x / MAZE_CHUNK_WORLD);
      const pcz = Math.floor(z / MAZE_CHUNK_WORLD);
      for (let dz = -1; dz <= 1; dz++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (arenaCircleHitsMazeGrid(x, z, radius, pcx + dx, pcz + dz)) return false;
        }
      }
      return true;
    }

    /**
     * Large chamber luminaire mesh: recessed ceiling troffer — flush trim ring, metal bezel, frosted diffuser,
     * inner accent ring (commercial LED panel / high-bay aesthetic). Composite primitives only (Three.js guides).
     * @see https://threejs.org/docs/#api/en/geometries/CylinderGeometry
     * @see https://threejs.org/docs/#api/en/geometries/TorusGeometry
     */
    function createMazeAreaLightFixture(px, ceilingY, pz, cw) {
      const g = new THREE.Group();
      const outerR = cw * 0.44;
      const diffR = cw * 0.37;

      const housingMat = new THREE.MeshStandardMaterial({
        color: 0x343b48,
        metalness: 0.78,
        roughness: 0.38,
      });
      const bezel = new THREE.Mesh(
        new THREE.CylinderGeometry(outerR, outerR * 0.93, 0.065, 26, 1),
        housingMat
      );
      bezel.position.y = -0.036;

      const diffuserMat = new THREE.MeshStandardMaterial({
        color: 0xfff8f2,
        emissive: 0xfff0e6,
        emissiveIntensity: 1.15,
        roughness: 0.82,
        metalness: 0.03,
      });
      const diffuser = new THREE.Mesh(
        new THREE.CylinderGeometry(diffR, diffR * 0.985, 0.042, 30, 1),
        diffuserMat
      );
      diffuser.position.y = -0.118;

      const trim = new THREE.Mesh(
        new THREE.TorusGeometry(outerR * 0.99, 0.028, 8, 30),
        new THREE.MeshStandardMaterial({
          color: 0x4a5568,
          metalness: 0.55,
          roughness: 0.48,
        })
      );
      trim.rotation.x = Math.PI / 2;
      trim.position.y = -0.008;

      const chipRing = new THREE.Mesh(
        new THREE.TorusGeometry(diffR * 0.38, 0.016, 8, 24),
        new THREE.MeshStandardMaterial({
          color: 0xffe8d8,
          emissive: 0xffb088,
          emissiveIntensity: 0.75,
          roughness: 0.4,
          metalness: 0.22,
        })
      );
      chipRing.rotation.x = Math.PI / 2;
      chipRing.position.y = -0.104;

      g.add(trim, bezel, diffuser, chipRing);
      g.position.set(px, ceilingY - 0.015, pz);
      return g;
    }

    function buildMazeChunk(cx, cz) {
      const key = `${cx},${cz}`;
      if (mazeChunks.has(key)) return;

      const ox = cx * MAZE_CHUNK_WORLD;
      const oz = cz * MAZE_CHUNK_WORLD;
      const cw = MAZE_CELL_SIZE;
      const { vert, horiz, lightsPlan } = getMazeChunkGrid(cx, cz);
      const w = MAZE_CELLS;
      const h = MAZE_CELLS;

      const chunkMeshes = [];
      const chunkLights = [];

      const floorPl = new THREE.Mesh(
        new THREE.PlaneGeometry(MAZE_CHUNK_WORLD - 0.02, MAZE_CHUNK_WORLD - 0.02),
        getWallMaterialCached(
          MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
          MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
          0x666670
        )
      );
      floorPl.rotation.x = -Math.PI / 2;
      floorPl.position.set(ox + MAZE_CHUNK_WORLD / 2, 0, oz + MAZE_CHUNK_WORLD / 2);
      floorPl.receiveShadow = true;
      scene.add(floorPl);
      chunkMeshes.push(floorPl);
      _texturedMeshes.push({
        mesh: floorPl,
        rx: MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
        ry: MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
        tint: 0x666670,
      });

      // v93: ceiling plane now spans the full chunk (no 0.02 inset). Previously each chunk
      // had a 0.04u gap to its neighbor, letting the sky show through arena (zombie map).
      const ceilPl = new THREE.Mesh(
        new THREE.PlaneGeometry(MAZE_CHUNK_WORLD, MAZE_CHUNK_WORLD),
        getWallMaterialCached(
          MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
          MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
          0x5c6272
        )
      );
      ceilPl.rotation.x = Math.PI / 2;
      ceilPl.position.set(ox + MAZE_CHUNK_WORLD / 2, MAZE_WALL_H, oz + MAZE_CHUNK_WORLD / 2);
      ceilPl.receiveShadow = true;
      scene.add(ceilPl);
      chunkMeshes.push(ceilPl);
      _texturedMeshes.push({
        mesh: ceilPl,
        rx: MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
        ry: MAZE_CHUNK_WORLD / FLOOR_CEILING_METERS_PER_REPEAT,
        tint: 0x5c6272,
      });

      // All maze walls share one box material (repeat 1,1) and are merged into a single
      // BufferGeometry per chunk → 1 draw call (main + shadow) instead of ~76 walls ×
      // 6 per-face material groups each. Collision boxes stay per wall in wallBoxes
      // (and ch.wallBoxes for O(1) unload).
      const wallGeos = [];
      const chunkWallBoxes = [];
      const S = WALL_TEXTURE_METERS_PER_REPEAT;
      const wallRep = (u, v) => ({ rx: Math.max(1, u / S), ry: Math.max(1, v / S) });
      const pushWall = (mw, mh, md, px, py, pz) => {
        const g = new THREE.BoxGeometry(mw, mh, md);
        bakeWallUvs(g, [
          wallRep(md, mh), wallRep(md, mh),
          wallRep(mw, md), wallRep(mw, md),
          wallRep(mw, mh), wallRep(mw, mh),
        ]);
        g.translate(px, py, pz);
        wallGeos.push(g);
        chunkWallBoxes.push(
          new THREE.Box3(
            new THREE.Vector3(px - mw / 2, py - mh / 2, pz - md / 2),
            new THREE.Vector3(px + mw / 2, py + mh / 2, pz + md / 2)
          )
        );
      };

      for (let ix = 0; ix <= w; ix++) {
        for (let iy = 0; iy < h; iy++) {
          if (!vert[ix][iy]) continue;
          const wx = ox + ix * cw;
          const wz = oz + (iy + 0.5) * cw;
          pushWall(MAZE_WALL_THICK, MAZE_WALL_H, cw + 0.02, wx, MAZE_WALL_H / 2, wz);
        }
      }

      for (let ix = 0; ix < w; ix++) {
        for (let iy = 0; iy <= h; iy++) {
          if (!horiz[ix][iy]) continue;
          const wx = ox + (ix + 0.5) * cw;
          const wz = oz + iy * cw;
          pushWall(cw + 0.02, MAZE_WALL_H, MAZE_WALL_THICK, wx, MAZE_WALL_H / 2, wz);
        }
      }

      if (wallGeos.length) {
        const mergedGeo = mergeBufferGeometries(wallGeos);
        const wallMesh = new THREE.Mesh(mergedGeo, getWallMaterialCached(1, 1, 0x6b7384));
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wallMesh.userData.mazeChunkKey = key;
        scene.add(wallMesh);
        chunkMeshes.push(wallMesh);
        wallMeshes.push(wallMesh);
        _texturedMeshes.push({ mesh: wallMesh, rx: 1, ry: 1, tint: 0x6b7384 });
        for (const box of chunkWallBoxes) wallBoxes.push(box);
        mazeWallBoxBuckets.set(key, chunkWallBoxes);
      }

      const wxMid = (gx, gy) => ox + (gx + 0.5) * cw;
      const wzMid = (gx, gy) => oz + (gy + 0.5) * cw;

      for (const plan of lightsPlan) {
        const { gx, gy, kind } = plan;
        const px = wxMid(gx, gy);
        const pz = wzMid(gx, gy);

        if (kind === "roof") {
          const L = createPhysicalPointLight(
            0xffecd0,
            108 * MAZE_LIGHT_INTENSITY_SCALE,
            MAZE_CHUNK_WORLD * 0.62
          );
          L.position.set(px, MAZE_CEILING_LIGHT_Y, pz);
          L.castShadow = false;
          scene.add(L);
          chunkLights.push(L);
          registerMazeCullLight(L, key);

          const bulb = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.18, 0.12, 8),
            new THREE.MeshStandardMaterial({
              color: 0xfff2de,
              emissive: 0xfff0d0,
              emissiveIntensity: 0.9,
              roughness: 0.35,
              metalness: 0.2,
            })
          );
          bulb.position.set(px, MAZE_CEILING_LIGHT_Y, pz);
          bulb.castShadow = false;
          scene.add(bulb);
          chunkMeshes.push(bulb);
        } else if (kind === "wall") {
          const edge = mazeHashSeed(cx, cz, gx * 9973 + gy * 7919)();
          const face = edge % 4;
          const inset = cw * 0.42;
          let lx = px;
          let lz = pz;
          let yaw = 0;
          if (face === 0) {
            lz = oz + gy * cw + inset;
            yaw = 0;
          } else if (face === 1) {
            lx = ox + (gx + 1) * cw - inset;
            yaw = Math.PI / 2;
          } else if (face === 2) {
            lz = oz + (gy + 1) * cw - inset;
            yaw = Math.PI;
          } else {
            lx = ox + gx * cw + inset;
            yaw = -Math.PI / 2;
          }

          const sconce = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.55, 0.14),
            new THREE.MeshStandardMaterial({
              color: 0x8a93a5,
              emissive: 0xffe8cc,
              emissiveIntensity: 0.35,
              roughness: 0.55,
            })
          );
          sconce.position.set(lx, 2.05, lz);
          sconce.rotation.y = yaw;
          sconce.castShadow = false;
          scene.add(sconce);
          chunkMeshes.push(sconce);

          const spot = createPhysicalSpotLight(
            0xffe4c8,
            220 * MAZE_LIGHT_INTENSITY_SCALE,
            56,
            Math.PI / 4.2,
            0.52
          );
          spot.position.set(lx, 2.25, lz);
          spot.target.position.set(px, 0.15, pz);
          spot.castShadow = false;
          scene.add(spot);
          scene.add(spot.target);
          chunkLights.push(spot);
          registerMazeCullLight(spot, key);
          // (sconceFill removed — the weakest light here; the sconce's own emissive +
          // the SpotLight preserve the visual at a fraction of the fragment cost)
        } else if (kind === "area") {
          const ceilingY = MAZE_CEILING_LIGHT_Y;
          const fill = createPhysicalPointLight(
            0xfff0e4,
            200 * MAZE_LIGHT_INTENSITY_SCALE,
            MAZE_CHUNK_WORLD * 0.88
          );
          fill.position.set(px, ceilingY - 0.14, pz);
          fill.castShadow = false;
          scene.add(fill);
          chunkLights.push(fill);
          registerMazeCullLight(fill, key);

          const wideDown = createPhysicalSpotLight(
            0xffebd8,
            320 * MAZE_LIGHT_INTENSITY_SCALE,
            MAZE_CHUNK_WORLD * 0.95,
            Math.PI / 2.05,
            0.5
          );
          wideDown.position.set(px, ceilingY - 0.02, pz);
          wideDown.target.position.set(px, 0.12, pz);
          wideDown.castShadow = false;
          scene.add(wideDown);
          scene.add(wideDown.target);
          chunkLights.push(wideDown);
          registerMazeCullLight(wideDown, key);

          const fixture = createMazeAreaLightFixture(px, ceilingY, pz, cw);
          fixture.traverse((o) => { if (o.isMesh) o.castShadow = false; });
          scene.add(fixture);
          chunkMeshes.push(fixture);
        }
      }

      mazeChunks.set(key, { meshes: chunkMeshes, lights: chunkLights, wallBoxes: chunkWallBoxes });
      invalidateArenaNavGrid();
    }

    function registerMazeCullLight(light, chunkKey) {
      light.userData.mazeCullKey = chunkKey;
      mazeCullableLights.push(light);
    }

    function pruneMazeCullLightsForChunk(chunkKey) {
      for (let i = mazeCullableLights.length - 1; i >= 0; i--) {
        if (mazeCullableLights[i].userData.mazeCullKey === chunkKey) mazeCullableLights.splice(i, 1);
      }
    }

    function cullMazeLightsNearCamera() {
      if (!mazeCullableLights.length) return;
      const cx = camera.position.x;
      const cy = camera.position.y;
      const cz = camera.position.z;
      // Constant per-type counts (12 point + 8 spot) keep NUM_POINT_LIGHTS /
      // NUM_SPOT_LIGHTS frame-invariant, so three.js never recompiles shaders as
      // the active set rotates while the player moves. (The old top-20 mixed list
      // churned the point/spot split on every chunk crossing → multi-frame hitch.)
      const K_POINT = 12;
      const K_SPOT = 8;
      const selected = new Set();
      const addNearest = (wantSpot, k, bias) => {
        const top = [];
        for (let li = 0; li < mazeCullableLights.length; li++) {
          const L = mazeCullableLights[li];
          if (L.isSpotLight !== wantSpot) continue;
          const p = L.position;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dz = p.z - cz;
          let d2 = dx * dx + dz * dz + dy * dy * 0.45;
          if (bias) d2 *= bias;
          if (top.length < k) {
            top.push({ L, d2 });
            if (top.length === k) top.sort((a, b) => a.d2 - b.d2);
          } else if (d2 < top[k - 1].d2) {
            top[k - 1] = { L, d2 };
            let i = k - 1;
            while (i > 0 && top[i].d2 < top[i - 1].d2) {
              const swap = top[i];
              top[i] = top[i - 1];
              top[i - 1] = swap;
              i--;
            }
          }
        }
        for (const t of top) selected.add(t.L);
      };
      addNearest(false, K_POINT, null);
      addNearest(true, K_SPOT, 0.5);
      for (let li = 0; li < mazeCullableLights.length; li++) {
        mazeCullableLights[li].visible = selected.has(mazeCullableLights[li]);
      }
    }

    function unloadMazeChunk(cx, cz) {
      const key = `${cx},${cz}`;
      const ch = mazeChunks.get(key);
      if (!ch) return;
      pruneMazeCullLightsForChunk(key);
      mazeWallBoxBuckets.delete(key);
      if (ch.wallBoxes) {
        for (const box of ch.wallBoxes) {
          const bi = wallBoxes.indexOf(box);
          if (bi >= 0) wallBoxes.splice(bi, 1);
        }
      }
      for (const mesh of ch.meshes) {
        scene.remove(mesh);
        const wi = wallMeshes.indexOf(mesh);
        if (wi >= 0) wallMeshes.splice(wi, 1);
        const ti = _texturedMeshes.findIndex((e) => e.mesh === mesh);
        if (ti >= 0) _texturedMeshes.splice(ti, 1);
        mesh.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          const mat = o.material;
          if (mat) {
            const mats = Array.isArray(mat) ? mat : [mat];
            for (const m of mats) {
              // Shared cached materials/textures live for the whole session — only
              // dispose per-chunk unique materials (light fixtures, etc.).
              if (!m.userData || !m.userData._cachedShared) {
                if (m.map) m.map.dispose();
                m.dispose();
              }
            }
          }
        });
      }
      for (const L of ch.lights) {
        scene.remove(L);
        if (L.target) scene.remove(L.target);
        if (L.dispose) L.dispose();
      }
      mazeChunks.delete(key);
      invalidateArenaNavGrid();
    }

    function clearAllMazeChunks() {
      mazeCullableLights.length = 0;
      clearMazeGridCache();
      for (const k of [...mazeChunks.keys()]) {
        const [sx, sz] = k.split(",").map(Number);
        unloadMazeChunk(sx, sz);
      }
      mazeChunks.clear();
    }

    function updateInfiniteMaze(dt) {
      if (CURRENT_MAP !== "arena") return;
      mazeChunkPollAcc += dt;
      if (mazeChunkPollAcc < 0.18) return;
      mazeChunkPollAcc = 0;

      const pcx = Math.floor(player.position.x / MAZE_CHUNK_WORLD);
      const pcz = Math.floor(player.position.z / MAZE_CHUNK_WORLD);
      const R = 2;

      for (const key of [...mazeChunks.keys()]) {
        const [cx, cz] = key.split(",").map(Number);
        if (Math.abs(cx - pcx) > R + 1 || Math.abs(cz - pcz) > R + 1) {
          unloadMazeChunk(cx, cz);
        }
      }

      rebuildMazeNavGrid(pcx, pcz);
    }

    let mazeNavAnchorCx = null;
    let mazeNavAnchorCz = null;

    function markNavRectBlocked(minX, maxX, minZ, maxZ) {
      const c0 = Math.max(0, Math.floor((minX - navMinX) / NAV_CELL));
      const c1 = Math.min(navCols - 1, Math.floor((maxX - navMinX) / NAV_CELL));
      const r0 = Math.max(0, Math.floor((minZ - navMinZ) / NAV_CELL));
      const r1 = Math.min(navRows - 1, Math.floor((maxZ - navMinZ) / NAV_CELL));
      for (let r = r0; r <= r1; r++) {
        const rowOff = r * navCols;
        for (let c = c0; c <= c1; c++) navGrid[rowOff + c] = 1;
      }
    }

    function stampChunkWallsIntoNavGrid(chunkCx, chunkCz) {
      const { vert, horiz } = getMazeChunkGrid(chunkCx, chunkCz);
      const ox = chunkCx * MAZE_CHUNK_WORLD;
      const oz = chunkCz * MAZE_CHUNK_WORLD;
      const cw = MAZE_CELL_SIZE;
      const w = MAZE_CELLS;
      const h = MAZE_CELLS;
      const t = MAZE_WALL_THICK;
      const hz = cw + 0.02;
      const hx = cw + 0.02;
      const inf = NAV_RADIUS * 0.45 + t * 0.35;
      for (let ix = 0; ix <= w; ix++) {
        for (let iy = 0; iy < h; iy++) {
          if (!vert[ix][iy]) continue;
          const wx = ox + ix * cw;
          const wz = oz + (iy + 0.5) * cw;
          markNavRectBlocked(
            wx - t * 0.5 - inf,
            wx + t * 0.5 + inf,
            wz - hz * 0.5 - inf,
            wz + hz * 0.5 + inf
          );
        }
      }
      for (let ix = 0; ix < w; ix++) {
        for (let iy = 0; iy <= h; iy++) {
          if (!horiz[ix][iy]) continue;
          const wx = ox + (ix + 0.5) * cw;
          const wz = oz + iy * cw;
          markNavRectBlocked(
            wx - hx * 0.5 - inf,
            wx + hx * 0.5 + inf,
            wz - t * 0.5 - inf,
            wz + t * 0.5 + inf
          );
        }
      }
    }

    /** Nav matches loaded maze chunks only — avoids invisible walls in unbuilt chunks. */
    function rebuildMazeNavGrid(pcx, pcz) {
      if (CURRENT_MAP !== "arena") return;
      if (mazeNavAnchorCx === pcx && mazeNavAnchorCz === pcz && navGrid) return;
      mazeNavAnchorCx = pcx;
      mazeNavAnchorCz = pcz;
      const padChunks = 4;
      navMinX = (pcx - padChunks) * MAZE_CHUNK_WORLD;
      navMinZ = (pcz - padChunks) * MAZE_CHUNK_WORLD;
      const span = padChunks * 2 * MAZE_CHUNK_WORLD + MAZE_CHUNK_WORLD;
      navCols = Math.ceil(span / NAV_CELL);
      navRows = Math.ceil(span / NAV_CELL);
      navGrid = new Uint8Array(navCols * navRows);
      const total = navCols * navRows;
      flowDirX = new Float32Array(total);
      flowDirZ = new Float32Array(total);
      flowPlayerC = -1;
      flowPlayerR = -1;
      navGrid.fill(0);
      for (const key of mazeChunks.keys()) {
        const [cx, cz] = key.split(",").map(Number);
        if (Math.abs(cx - pcx) > padChunks || Math.abs(cz - pcz) > padChunks) continue;
        stampChunkWallsIntoNavGrid(cx, cz);
      }
      mazeNavRebuildRow = navRows;
    }

    function invalidateArenaNavGrid() {
      mazeNavAnchorCx = null;
      mazeNavAnchorCz = null;
      flowPlayerC = -1;
      flowPlayerR = -1;
    }

    const pvpMapLights = [];
    function clearPvpMapLights() {
      while (pvpMapLights.length) {
        const L = pvpMapLights.pop();
        scene.remove(L);
      }
    }

    /**
     * Every decorative object the gauntlet adds straight to the scene. clearMap() only ever
     * removed wallMeshes, so the glowing platform rims and the exit beacon survived the map
     * change and hung in mid-air over the arena / PvP maps afterwards — the stray amber and
     * cyan bars, which read exactly like platform edges that are not there.
     */
    const gauntletProps = [];
    function clearMap() {
      clearAllMazeChunks();
      clearPvpMapLights();
      clearGauntletProps();
      while (wallMeshes.length) {
        const mesh = wallMeshes.pop();
        scene.remove(mesh);
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          // Shared cached materials/textures survive map clears (they are reused by
          // the next map via the cache) — only dispose per-map unique materials.
          if (!m.userData || !m.userData._cachedShared) {
            if (m.map) m.map.dispose();
            m.dispose();
          }
        }
        const idx = _texturedMeshes.findIndex(e => e.mesh === mesh);
        if (idx !== -1) _texturedMeshes.splice(idx, 1);
      }
      wallBoxes.length = 0;
    }

    function addWindowWallX(centerX, centerZ, totalW, wallH = 4.5, thick = 1.0, windowW = 4, windowBottom = 1.4, windowTop = 3.0) {
      const pillarW = (totalW - windowW) / 2;
      addWallBox(pillarW, wallH, thick, centerX - (windowW / 2 + pillarW / 2), wallH / 2, centerZ);
      addWallBox(pillarW, wallH, thick, centerX + (windowW / 2 + pillarW / 2), wallH / 2, centerZ);

      const lowerH = windowBottom;
      if (lowerH > 0) addWallBox(windowW, lowerH, thick, centerX, lowerH / 2, centerZ);

      const upperH = wallH - windowTop;
      if (upperH > 0) addWallBox(windowW, upperH, thick, centerX, windowTop + upperH / 2, centerZ);
    }

    function addWindowWallZ(centerX, centerZ, totalD, wallH = 4.5, thick = 1.0, windowD = 4, windowBottom = 1.4, windowTop = 3.0) {
      const pillarD = (totalD - windowD) / 2;
      addWallBox(thick, wallH, pillarD, centerX, wallH / 2, centerZ - (windowD / 2 + pillarD / 2));
      addWallBox(thick, wallH, pillarD, centerX, wallH / 2, centerZ + (windowD / 2 + pillarD / 2));

      const lowerH = windowBottom;
      if (lowerH > 0) addWallBox(thick, lowerH, windowD, centerX, lowerH / 2, centerZ);

      const upperH = wallH - windowTop;
      if (upperH > 0) addWallBox(thick, upperH, windowD, centerX, windowTop + upperH / 2, centerZ);
    }

    function buildMapArena() {
      if (MULTIPLAYER && ARENA_COOP && activeRoomId) {
        mazeWorldSeed = hashRoomSeed(activeRoomId);
      } else {
        mazeWorldSeed =
          (Math.imul(1103515245, (performance.now() ^ (Math.random() * 0x7fffffff)) | 0) + 12345) >>> 0;
      }
      mazeChunkPollAcc = 0;
      mazeNavAnchorCx = null;
      mazeNavAnchorCz = null;
      mazeNavRebuildRow = 0;
      clearMazeGridCache();
      buildMazeChunk(0, 0);
    }

    function processOneMazeChunkBuild() {
      if (CURRENT_MAP !== "arena" || !started) return;
      // Skip every other frame to halve the per-frame cost of scanning the
      // chunk grid (5x5 = 25 cells per call, even when most are already built).
      if ((performance.now() * 1000 | 0) & 1) return;
      const pcx = Math.floor(player.position.x / MAZE_CHUNK_WORLD);
      const pcz = Math.floor(player.position.z / MAZE_CHUNK_WORLD);
      const R = 1; // tighter search radius (3x3 instead of 5x5) — fewer cells scanned per call
      let built = 0;
      const buildBudget = 1;
      while (built < buildBudget) {
        let pickCx = null;
        let pickCz = null;
        let bestPri = Infinity;
        for (let dz = -R; dz <= R; dz++) {
          for (let dx = -R; dx <= R; dx++) {
            const cx = pcx + dx;
            const cz = pcz + dz;
            const key = `${cx},${cz}`;
            if (mazeChunks.has(key)) continue;
            const pri = dx * dx + dz * dz;
            if (pri < bestPri) {
              bestPri = pri;
              pickCx = cx;
              pickCz = cz;
            }
          }
        }
        if (pickCx === null) break;
        buildMazeChunk(pickCx, pickCz);
        built++;
      }
    }

    function buildMapCrossfire() {
      clearPvpMapLights();
      const H = 4.5;

      addWallBox(90, H, 1.0, 0, H / 2, -45);
      addWallBox(90, H, 1.0, 0, H / 2,  45);
      addWallBox(1.0, H, 90, -45, H / 2, 0);
      addWallBox(1.0, H, 90,  45, H / 2, 0);

      addWindowWallX(0, 0, 24, H, 1.0, 8, 1.4, 3.1);
      addWindowWallZ(0, 0, 24, H, 1.0, 8, 1.4, 3.1);

      addWallBox(18, 2.4, 1.0, -22, 1.2, -14, 0x70798a);
      addWallBox(18, 2.4, 1.0,  22, 1.2,  14, 0x70798a);

      addWallBox(1.0, 2.4, 18, -14, 1.2, 22, 0x70798a);
      addWallBox(1.0, 2.4, 18,  14, 1.2,-22, 0x70798a);

      addWindowWallX(-28, 28, 14, H, 1.0, 4, 1.2, 3.0);
      addWindowWallX( 28,-28, 14, H, 1.0, 4, 1.2, 3.0);

      const cfAmb = new THREE.AmbientLight(0xaabccf, 1.15);
      scene.add(cfAmb);
      pvpMapLights.push(cfAmb);
      const cfHemi = new THREE.HemisphereLight(0xc9d6ea, 0x2a2218, 2.4);
      scene.add(cfHemi);
      pvpMapLights.push(cfHemi);
      const cfSun = new THREE.DirectionalLight(0xffecd8, 4.2);
      cfSun.position.set(10, 38, 18);
      cfSun.castShadow = false;
      scene.add(cfSun);
      pvpMapLights.push(cfSun);
    }

    /** Bright open duel: compact 60×60 perimeter, standing-height cover (no crouch) — no inner maze corridors. */
    function buildMapCrossfireGrid() {
      clearPvpMapLights();
      const H = 4.5;
      const thick = 1.0;
      const trim = 0x929bab;
      const EYE_Y = 1.65;

      const half = 30;
      addWallBox(half * 2, H, thick, 0, H / 2, -half);
      addWallBox(half * 2, H, thick, 0, H / 2, half);
      addWallBox(thick, H, half * 2, -half, H / 2, 0);
      addWallBox(thick, H, half * 2, half, H / 2, 0);

      function pillar(px, pz, s = 2.4) {
        const coverH = EYE_Y + 1.55;
        addWallBox(s, coverH, s, px, coverH / 2, pz, trim);
      }

      const posts = [
        [-22, -22], [22, -22], [-22, 22], [22, 22],
        [-16, 0], [16, 0], [0, -16], [0, 16],
        [-10, 10], [10, -10], [-6, -18], [6, 18],
        [-2, 0], [2, 0],
      ];
      for (const [px, pz] of posts) pillar(px, pz);

      const lightPos = [
        [-20, -20], [0, -20], [20, -20],
        [-20, 0], [0, 0], [20, 0],
        [-20, 20], [0, 20], [20, 20],
      ];
      for (const [lx, lz] of lightPos) {
        const L = createPhysicalPointLight(0xfff6ee, 520, 150, 2.2);
        L.position.set(lx, H + 1.2, lz);
        L.castShadow = false;
        scene.add(L);
        pvpMapLights.push(L);
      }
      const rimTop = createPhysicalPointLight(0xeaf6ff, 380, 180, 2.4);
      rimTop.position.set(0, H + 8, 0);
      rimTop.castShadow = false;
      scene.add(rimTop);
      pvpMapLights.push(rimTop);
      const ambFill = new THREE.AmbientLight(0xd4e2f5, 2.1);
      scene.add(ambFill);
      pvpMapLights.push(ambFill);
      const hemiFill = new THREE.HemisphereLight(0xeef6ff, 0x5c5348, 4.2);
      scene.add(hemiFill);
      pvpMapLights.push(hemiFill);
      const sunFill = new THREE.DirectionalLight(0xfff6ea, 9.5);
      sunFill.position.set(18, 42, 14);
      sunFill.castShadow = false;
      scene.add(sunFill);
      pvpMapLights.push(sunFill);
      ceiling.visible = false;
    }

    function buildMapPvpBright() {
      clearPvpMapLights();
      const half = 42;
      const H = 5.5;
      const PH = 3.4;
      const thick = 1.0;
      const col = 0x8a9ab0;

      addWallBox(half * 2, H, thick, 0, H / 2, -half);
      addWallBox(half * 2, H, thick, 0, H / 2,  half);
      addWallBox(thick, H, half * 2, -half, H / 2, 0);
      addWallBox(thick, H, half * 2,  half, H / 2, 0);

      // Corner pillars
      for (const [px, pz] of [[-26,-26],[26,-26],[-26,26],[26,26]])
        addWallBox(2.8, PH, 2.8, px, PH / 2, pz, col);
      // Mid-ring pillars
      for (const [px, pz] of [[-36,0],[36,0],[0,-36],[0,36]])
        addWallBox(2.2, PH, 2.2, px, PH / 2, pz, col);
      // Inner corner pillars
      for (const [px, pz] of [[-14,-14],[14,-14],[-14,14],[14,14]])
        addWallBox(2.4, PH, 2.4, px, PH / 2, pz, col);
      // Off-axis pillars
      for (const [px, pz] of [[-32,-14],[32,14],[14,-32],[-14,32]])
        addWallBox(2.0, PH, 2.0, px, PH / 2, pz, col);
      // Center cluster
      for (const [px, pz] of [[-5,0],[5,0],[0,-5],[0,5]])
        addWallBox(2.0, PH, 2.0, px, PH / 2, pz, col);

      const amb = new THREE.AmbientLight(0xd8e8f5, 3.2);
      scene.add(amb); pvpMapLights.push(amb);
      const hemi = new THREE.HemisphereLight(0xeef6ff, 0x887766, 5.5);
      scene.add(hemi); pvpMapLights.push(hemi);
      const sun = new THREE.DirectionalLight(0xfff8e8, 13.0);
      sun.position.set(20, 55, 15); sun.castShadow = false;
      scene.add(sun); pvpMapLights.push(sun);
    }

    function buildMapBossArena() {
      clearPvpMapLights();
      const H = 6;
      const half = 50;

      addWallBox(half * 2, H, 1.0, 0, H / 2, -half);
      addWallBox(half * 2, H, 1.0, 0, H / 2, half);
      addWallBox(1.0, H, half * 2, -half, H / 2, 0);
      addWallBox(1.0, H, half * 2, half, H / 2, 0);

      const coverH = 2.0;
      const coverColor = 0x5a6a55;
      addWallBox(3.0, coverH, 1.2, -20, coverH / 2, -18, coverColor);
      addWallBox(1.2, coverH, 3.0, 22, coverH / 2, 15, coverColor);
      addWallBox(2.5, coverH, 1.0, 10, coverH / 2, -30, coverColor);
      addWallBox(1.0, coverH, 2.5, -30, coverH / 2, 8, coverColor);
      addWallBox(4.0, coverH, 1.5, 0, coverH / 2, 35, coverColor);

      floor.visible = true;

      const amb = new THREE.AmbientLight(0x708090, 2.2);
      scene.add(amb); pvpMapLights.push(amb);
      const hemi = new THREE.HemisphereLight(0x607080, 0x201818, 2.8);
      scene.add(hemi); pvpMapLights.push(hemi);
      const dim = new THREE.DirectionalLight(0xa0b0d0, 3.5);
      dim.position.set(20, 40, 30);
      dim.castShadow = false;
      scene.add(dim); pvpMapLights.push(dim);

      ceiling.visible = false;
    }

    function resetTrainingSession() {
      trainingStats.you = freshTrainingStats();
      trainingStats.team = freshTrainingStats();
      updateTrainingScoreboardUI();
    }

    function setTrainingScoreboardVisible(on) {
      if (trainingScoreboardEl) trainingScoreboardEl.style.display = on ? "block" : "none";
      if (trainTeamRow) {
        trainTeamRow.style.display =
          on && MULTIPLAYER && TRAINING_COOP ? "flex" : "none";
      }
    }

    function trainingAccuracyPct(stats) {
      if (!stats || !stats.shots) return "—";
      return `${Math.round((stats.hits / stats.shots) * 100)}%`;
    }

    function updateTrainingScoreboardUI() {
      if (!isTrainingMap(CURRENT_MAP)) return;
      const y = trainingStats.you;
      const t = trainingStats.team;
      if (trainYouPts) trainYouPts.textContent = String(y.points);
      if (trainTeamPts) trainTeamPts.textContent = String(t.points);
      if (trainYouHits) trainYouHits.textContent = String(y.hits);
      if (trainYouHead) trainYouHead.textContent = String(y.head);
      if (trainYouBody) trainYouBody.textContent = String(y.body);
      if (trainYouLeg) trainYouLeg.textContent = String(y.leg);
      if (trainYouAcc) trainYouAcc.textContent = trainingAccuracyPct(y);
    }

    function registerTrainingShot() {
      if (!isTrainingMap(CURRENT_MAP)) return;
      trainingStats.you.shots++;
      if (!MULTIPLAYER || !TRAINING_COOP) {
        trainingStats.team.shots++;
      }
      updateTrainingScoreboardUI();
    }

    function registerTrainingHit(zone) {
      if (!isTrainingMap(CURRENT_MAP)) return;
      const z = zone === "head" || zone === "leg" ? zone : "body";
      const pts = TRAINING_POINTS[z] || TRAINING_POINTS.body;
      const y = trainingStats.you;
      y.points += pts;
      y.hits++;
      y[z]++;
      trainingStats.team.points += pts;
      trainingStats.team.hits++;
      trainingStats.team[z]++;
      updateTrainingScoreboardUI();
      if (MULTIPLAYER && TRAINING_COOP) {
        try {
          socket.emit("trainingHit", { zone: z, points: pts });
        } catch (_) {}
      }
    }

    function applyRemoteTrainingHit(data) {
      if (!isTrainingMap(CURRENT_MAP) || !MULTIPLAYER || !TRAINING_COOP || !data) return;
      if (data.id != null && String(data.id) === String(socket.id)) return;
      const z = data.zone === "head" || data.zone === "leg" ? data.zone : "body";
      const pts =
        typeof data.points === "number" ? data.points : TRAINING_POINTS[z] || TRAINING_POINTS.body;
      const t = trainingStats.team;
      t.points += pts;
      t.hits++;
      t[z]++;
      updateTrainingScoreboardUI();
    }

    /**
     * Canvas HP bar identical to the one the zombie factories build, for models that don't
     * come with one (the player avatar). drawEnemyHp() then works on the dummy unchanged.
     */
    function attachHpBar(root, y, scaleX) {
      const hpCanvas = document.createElement("canvas");
      hpCanvas.width = 128;
      hpCanvas.height = 24;
      const hpCtx = hpCanvas.getContext("2d");
      const hpTexture = new THREE.CanvasTexture(hpCanvas);
      const hpSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: hpTexture, transparent: true, depthTest: true, depthWrite: false })
      );
      hpSprite.scale.set(scaleX, scaleX * 0.19, 1);
      hpSprite.position.set(0, y, 0);
      hpSprite.raycast = () => {};
      root.add(hpSprite);
      return { hpCanvas, hpCtx, hpTexture, hpSprite };
    }

    /**
     * Build one training target. Targets used to be invincible 9999-HP player avatars that
     * dissolved on any single hit; they now carry the real HP of whatever they represent and
     * only go down when it reaches zero, with a live HP bar over the head.
     */
    function makeTrainingDummy(idx, spec) {
      const lane = spec.lane || null;
      const homeX = lane ? (lane.xMin + lane.xMax) * 0.5 : spec.x;
      const homeZ = lane ? lane.z : spec.z;
      let dummy;

      if (spec.kind === "boss") {
        dummy = makeHormoneZombie(homeX, homeZ, false);
      } else if (spec.kind === "recruit") {
        const label = `${tr("trainingDummyName", "Target")} ${idx + 1}`;
        const avatar = createRemotePlayer(label);
        if (avatar.nameSprite) avatar.nameSprite.visible = false;
        avatar.group.position.set(homeX, 0, homeZ);
        scene.add(avatar.group);
        const bar = attachHpBar(avatar.group, 2.35, 1.7);
        dummy = {
          type: "recruit",
          group: avatar.group,
          hp: player.maxHealth,      // same 100 HP a real player has
          maxHp: player.maxHealth,
          ...bar,
        };
      } else {
        dummy = makeZombie(homeX, homeZ, spec.kind);
      }

      // Strip the AI state so a target never chases or shoots — updateTrainingDummies owns it.
      dummy.trainingDummy = true;
      dummy.alive = true;
      dummy.aware = false;
      dummy.moving = false;
      dummy.ranged = false;
      dummy.attackCooldownTimer = Infinity;
      dummy.targetKind = spec.kind;
      dummy.homeX = homeX;
      dummy.homeZ = homeZ;
      dummy.baseY = dummy.group.position.y;
      dummy.lane = lane;
      dummy.patrolDir = 1;
      dummy.patrolSpeed = lane ? lane.speed : 0;
      dummy.walkPhase = Math.random() * Math.PI * 2;
      dummy.dissolveTimer = 0;
      dummy.respawnTimer = 0;
      dummy._hpBarRatio = -1;
      dummy.group.rotation.y = 0;
      dummy.group.visible = true;
      // The enemy AI used to pose these every frame; now that it correctly leaves training
      // targets alone, give them their resting pose once, here.
      if (spec.kind === "boss" && dummy.torsoRoot) {
        dummy.torsoRoot.rotation.x = 0.18;                       // HUNCH
        if (dummy.leftArmRoot)  { dummy.leftArmRoot.rotation.z = -0.42; dummy.leftArmRoot.rotation.y = 0.25; }
        if (dummy.rightArmRoot) { dummy.rightArmRoot.rotation.z = 0.42; dummy.rightArmRoot.rotation.y = -0.25; }
        if (dummy.leftForearmRoot)  dummy.leftForearmRoot.rotation.x = -0.55;   // ELBOW_REST
        if (dummy.rightForearmRoot) dummy.rightForearmRoot.rotation.x = -0.55;
      }
      drawEnemyHp(dummy);
      return dummy;
    }

    // ── Training-range animation showcase ─────────────────────────────────────
    // A scripted mannequin that loops run / jump / shoot / reload / weapon swaps / item use
    // so the character animation can actually be watched. It is registered as a normal
    // remote player, so it is driven by exactly the same code that animates opponents —
    // if it looks right here, it looks right in a match.
    const SHOWCASE_ID = "__anim_showcase__";
    // Front-LEFT of the spawn. It was at (9, 8) — 33° to the right — which is exactly where
    // the first-person weapon model sits, so it was hidden behind your own gun. The left
    // third of the screen is clear, and 10 units out is close enough to read the joints.
    const SHOWCASE_HOME = { x: -6, z: 12 };
    const SHOWCASE_SCRIPT = [
      { name: "IDLE", dur: 2.2, weapon: 1 },
      { name: "WALK", dur: 3.4, weapon: 1, move: 2.0, range: 3.2 },
      { name: "RUN", dur: 3.4, weapon: 1, move: 6.2, range: 5.0 },
      { name: "JUMP", dur: 2.6, weapon: 1, jump: true },
      { name: "CROUCH", dur: 2.4, weapon: 1, crouch: true },
      { name: "CROUCH — WALK", dur: 3.2, weapon: 1, crouch: true, move: 1.5, range: 2.4 },
      { name: "AIM + FIRE", dur: 3.2, weapon: 1, ads: true, fire: 0.1 },
      { name: "RELOAD", dur: 2.6, weapon: 1, reload: true },
      { name: "SHOTGUN", dur: 2.0, weapon: 2, fire: 0.52 },
      { name: "SMG — RUN + FIRE", dur: 3.0, weapon: 3, move: 6.0, range: 4.5, fire: 0.08 },
      { name: "AMR", dur: 2.2, weapon: 5, ads: true, fire: 1.26 },
      { name: "KNIFE", dur: 2.6, weapon: 7, move: 5.0, range: 4.0 },
      { name: "MED KIT", dur: 2.4, weapon: 4 },
      { name: "JET HARNESS — STRAP", dur: 3.0, weapon: 1, jet: 1 },
      { name: "JET HARNESS — FLY", dur: 3.0, weapon: 1, jet: 2, jump: true },
    ];
    let showcaseRp = null;
    let showcaseStep = 0;
    let showcaseT = 0;
    let showcaseFireT = 0;
    let showcaseLabel = null;
    let showcaseProps = [];

    function removeAnimationShowcase() {
      for (const o of showcaseProps) scene.remove(o);
      showcaseProps = [];
      if (!showcaseRp) return;
      scene.remove(showcaseRp.group);
      remotePlayers.delete(SHOWCASE_ID);
      showcaseRp = null;
      showcaseLabel = null;
    }

    function spawnAnimationShowcase() {
      removeAnimationShowcase();
      const rp = createRemotePlayer(tr("showcaseName", "ANIMATION DEMO"));
      rp.x = SHOWCASE_HOME.x;
      rp.z = SHOWCASE_HOME.z;
      rp.y = 1.65;
      rp.yaw = Math.PI; // face the firing line
      rp.group.position.set(rp.x, 0, rp.z);
      // createRemotePlayer() returns a HIDDEN group on purpose: a networked avatar only
      // unhides once its first `move` packet lands. The showcase never receives one, so
      // without this it stays permanently invisible — the bug that made v10's demo a
      // no-show. Forced true here and re-forced every update below.
      rp.group.visible = true;
      scene.add(rp.group);
      remotePlayers.set(SHOWCASE_ID, rp);
      showcaseRp = rp;

      // A lit pedestal so the demo is obviously a demo and easy to find. Decorative only —
      // it is never added to wallMeshes / wallBoxes, so it has no collision and cannot be
      // stood on or shot.
      const pad = new THREE.Group();
      const padBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.7, 0.16, 28),
        new THREE.MeshStandardMaterial({ color: 0x243040, roughness: 0.7, metalness: 0.25 })
      );
      padBase.position.y = 0.08;
      pad.add(padBase);
      const padRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.05, 10, 36),
        new THREE.MeshStandardMaterial({
          color: 0x7ec8ff, emissive: 0x2f86c8, emissiveIntensity: 1.1, roughness: 0.4,
        })
      );
      padRing.rotation.x = -Math.PI / 2;
      padRing.position.y = 0.17;
      pad.add(padRing);
      pad.position.set(SHOWCASE_HOME.x, 0, SHOWCASE_HOME.z);
      pad.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = true; } });
      scene.add(pad);
      const padLight = createPhysicalPointLight(0xbfe4ff, 260, 26, 2.0);
      padLight.position.set(SHOWCASE_HOME.x, 4.2, SHOWCASE_HOME.z);
      padLight.castShadow = false;
      scene.add(padLight);
      showcaseProps = [pad, padLight];
      showcaseStep = 0;
      showcaseT = 0;
      showcaseFireT = 0;
      // Action caption above the head, on its own sprite so the name tag stays put.
      const cv = document.createElement("canvas");
      cv.width = 512; cv.height = 80;
      const ctx = cv.getContext("2d");
      const tex = new THREE.CanvasTexture(cv);
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, fog: false })
      );
      spr.scale.set(4.4, 0.69, 1);
      spr.position.set(0, 3.1, 0);
      spr.renderOrder = 999;
      spr.raycast = () => {};
      rp.group.add(spr);
      showcaseLabel = { ctx, tex, canvas: cv, last: "" };
    }

    function drawShowcaseLabel(text) {
      if (!showcaseLabel || showcaseLabel.last === text) return;
      showcaseLabel.last = text;
      const { ctx, canvas } = showcaseLabel;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 10;
      // Only the action name — the avatar's own name tag underneath already reads
      // "ANIMATION DEMO", so a second copy up here was pure duplication.
      // Shrink to fit: "JET HARNESS — STRAP" overflows 512px at the base size and was
      // getting its first and last letters clipped off.
      let px = 46;
      ctx.font = `bold ${px}px Audiowide, Arial`;
      const maxW = canvas.width - 24;
      while (px > 20 && ctx.measureText(text).width > maxW) {
        px -= 2;
        ctx.font = `bold ${px}px Audiowide, Arial`;
      }
      ctx.fillStyle = "#ffd34d";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      showcaseLabel.tex.needsUpdate = true;
    }

    function updateAnimationShowcase(dt) {
      if (!showcaseRp || !isTrainingMap(CURRENT_MAP) || !gameWorldReady) return;
      const rp = showcaseRp;
      const step = SHOWCASE_SCRIPT[showcaseStep % SHOWCASE_SCRIPT.length];
      showcaseT += dt;
      if (showcaseT >= step.dur) {
        showcaseT = 0;
        showcaseStep = (showcaseStep + 1) % SHOWCASE_SCRIPT.length;
        showcaseFireT = 0;
      }
      const cur = SHOWCASE_SCRIPT[showcaseStep % SHOWCASE_SCRIPT.length];
      drawShowcaseLabel(cur.name);
      if (!rp.group.visible) rp.group.visible = true;

      // Weapon — go through the normal equip path so the held model really changes.
      const wantW = cur.weapon | 0;
      if ((rp.currentWeapon | 0) !== wantW) {
        try { equipRemotePlayerWeapon(rp, wantW); } catch (_) {}
      }
      rp.isReloading = !!cur.reload;
      rp.ads = !!cur.ads;
      rp.crouch = cur.crouch ? 1 : 0;
      rp.remotePitch = cur.ads ? -0.05 : 0;

      // Movement: strafe along X so the gait is visible side-on from the firing line.
      if (cur.move) {
        const span = cur.range || 3;
        rp.x = SHOWCASE_HOME.x + Math.sin(showcaseT * (cur.move / span)) * span;
        rp.yaw = Math.cos(showcaseT * (cur.move / span)) > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      } else {
        rp.x += (SHOWCASE_HOME.x - rp.x) * Math.min(1, dt * 4);
        rp.yaw = Math.PI;
      }
      rp.z = SHOWCASE_HOME.z;

      // Jump arc — a real parabola so the airborne pose and the landing squash both show.
      if (cur.jump) {
        const period = 1.3;
        const t = (showcaseT % period) / period;
        rp.y = 1.65 + Math.sin(t * Math.PI) * (cur.jet === 2 ? 3.4 : 1.5);
      } else {
        rp.y += (1.65 - rp.y) * Math.min(1, dt * 6);
      }

      // Jet harness state drives the same back-pack visual opponents get.
      const wantJet = cur.jet | 0;
      if ((rp.jetState | 0) !== wantJet) {
        rp.jetState = wantJet;
        applyRemoteJetPack(rp);
      }

      // Muzzle flashes + tracers so "firing" reads as firing.
      if (cur.fire) {
        showcaseFireT -= dt;
        if (showcaseFireT <= 0) {
          showcaseFireT = cur.fire;
          const w = weapons[wantW] || weapons[1];
          const from = new THREE.Vector3(rp.visX ?? rp.x, (rp.visY ?? rp.y) - 0.35, rp.visZ ?? rp.z);
          const to = from.clone().add(new THREE.Vector3(0, 0.1, -18));
          createBulletTrail(from, to, w.color);
          createSparks(from.clone(), w.color);
        }
      }
    }

    function rebuildTrainingDummies() {
      for (const e of state.enemies) {
        if (e.group) scene.remove(e.group);
      }
      state.enemies.length = 0;
      resetTrainingSession();
      TRAINING_TARGETS.forEach((spec, i) => {
        state.enemies.push(makeTrainingDummy(i, spec));
      });
      spawnAnimationShowcase();
    }

    /**
     * Walk cycle for training targets. Lives here because updateEnemies() no longer touches
     * them — without this, a patrolling target would slide down its lane with frozen legs.
     * Handles both limb layouts: zombie targets expose *LegRoot / *ArmRoot, recruit targets
     * are player avatars and expose leftLeg / rightLeg / leftArm / rightArm.
     */
    function animateTrainingDummyLimbs(enemy, dt, moving) {
      if (enemy.isBoss) return;   // the boss target holds the static pose set at build time
      const sw = moving ? Math.sin(enemy.walkPhase * 2.0) : 0;
      const legAmp = 0.55, armAmp = 0.35;
      const legL = enemy.leftLegRoot || enemy.leftLeg;
      const legR = enemy.rightLegRoot || enemy.rightLeg;
      const armL = enemy.leftArmRoot || enemy.leftArm;
      const armR = enemy.rightArmRoot || enemy.rightArm;
      if (legL) legL.rotation.x = dampScalar(legL.rotation.x, -sw * legAmp, dt, 14);
      if (legR) legR.rotation.x = dampScalar(legR.rotation.x, sw * legAmp, dt, 14);
      // Zombie arms hang forward when aware; a dummy is never aware, so rest them low and
      // let them swing opposite the legs.
      if (armL) armL.rotation.x = dampScalar(armL.rotation.x, -0.2 + sw * armAmp, dt, 14);
      if (armR) armR.rotation.x = dampScalar(armR.rotation.x, -0.2 - sw * armAmp, dt, 14);
      if (enemy.leftKnee)  enemy.leftKnee.rotation.x  = dampScalar(enemy.leftKnee.rotation.x,  Math.max(0, -sw) * 0.7, dt, 14);
      if (enemy.rightKnee) enemy.rightKnee.rotation.x = dampScalar(enemy.rightKnee.rotation.x, Math.max(0, sw) * 0.7, dt, 14);
    }

    function updateTrainingDummies(dt) {
      if (!isTrainingMap(CURRENT_MAP) || !gameWorldReady) return;
      for (const enemy of state.enemies) {
        if (!enemy.trainingDummy) continue;

        // Downed: run out the dissolve, then stand back up at full HP on the home spot.
        if (!enemy.alive) {
          if (enemy.dissolveTimer > 0) enemy.dissolveTimer = Math.max(0, enemy.dissolveTimer - dt);
          enemy.respawnTimer -= dt;
          if (enemy.respawnTimer <= 0) {
            enemy.alive = true;
            enemy.hp = enemy.maxHp;
            enemy._hpBarRatio = -1;
            enemy.dissolveTimer = 0;
            enemy.group.position.set(enemy.homeX, enemy.baseY, enemy.homeZ);
            enemy.group.visible = true;
            drawEnemyHp(enemy);
          }
          continue;
        }

        if (enemy.dissolveTimer > 0) {
          enemy.dissolveTimer = Math.max(0, enemy.dissolveTimer - dt);
          continue;
        }

        if (!enemy.lane) {
          // Static target: just a slow idle sway so it doesn't look frozen.
          animateTrainingDummyLimbs(enemy, dt, false);
          enemy.walkPhase += dt * 1.1;
          enemy.group.position.y = enemy.baseY + Math.sin(enemy.walkPhase) * 0.02;
          enemy.group.rotation.y = 0;
          continue;
        }

        const lane = enemy.lane;
        animateTrainingDummyLimbs(enemy, dt, true);
        let x = enemy.group.position.x + enemy.patrolDir * enemy.patrolSpeed * dt;
        if (x >= lane.xMax) {
          x = lane.xMax;
          enemy.patrolDir = -1;
        } else if (x <= lane.xMin) {
          x = lane.xMin;
          enemy.patrolDir = 1;
        }
        enemy.group.position.x = x;
        enemy.walkPhase += dt * (2.4 + enemy.patrolSpeed * 0.35);
        enemy.group.position.y = enemy.baseY + Math.sin(enemy.walkPhase) * 0.04;
        enemy.group.rotation.y = 0;
      }
    }

    function buildMapTraining() {
      clearPvpMapLights();
      const H = 4.5;
      const thick = 1.0;
      const trim = 0x929bab;
      // v5: the range grew from 56×56 to 96×96 so the mid zombie line, the far moving line
      // and the boss bay at the back all fit down-range of the original lanes. The player
      // still spawns at (0, 22) facing -Z, so the firing line is unchanged — everything new
      // is added beyond the old back wall.
      const halfX = 34;
      const zBack = -48;
      const zFront = 26;
      addWallBox(halfX * 2, H, thick, 0, H / 2, zBack);
      addWallBox(halfX * 2, H, thick, 0, H / 2, zFront);
      addWallBox(thick, H, zFront - zBack, -halfX, H / 2, (zFront + zBack) / 2);
      addWallBox(thick, H, zFront - zBack, halfX, H / 2, (zFront + zBack) / 2);
      // Waist-high cover on the near lanes (unchanged) …
      addWallBox(8, 2.2, thick, -12, 1.1, -10, trim);
      addWallBox(8, 2.2, thick, 12, 1.1, -10, trim);
      addWallBox(8, 2.2, thick, -4, 1.1, -20, trim);
      addWallBox(8, 2.2, thick, 8, 1.1, -20, trim);
      // … plus barricades framing the new mid and far lines.
      addWallBox(6, 1.5, thick, -26, 0.75, -23, trim);
      addWallBox(6, 1.5, thick, 26, 0.75, -23, trim);
      addWallBox(5, 1.8, thick, 0, 0.9, -31, trim);
      addWallBox(thick, 2.4, 7, -30, 1.2, -36, trim);
      addWallBox(thick, 2.4, 7, 30, 1.2, -36, trim);
      // Boss bay at the very back: two side buttresses so it reads as its own alcove.
      addWallBox(thick, 3.2, 9, -11, 1.6, -41, trim);
      addWallBox(thick, 3.2, 9, 11, 1.6, -41, trim);
      // Lighting rig scaled up with the room — the far half was pitch black on the first pass.
      const lightPos = [
        [-14, -12], [0, -12], [14, -12], [-8, -18], [8, -18], [0, -8],
        [-24, -6], [24, -6], [0, 4], [-22, 14], [22, 14],
        [-19, -27], [0, -27], [19, -27], [-28, -30], [28, -30],
        [-20, -34], [0, -34], [20, -34],
        [0, -40], [-9, -44], [9, -44], [-24, -42], [24, -42],
      ];
      // v8: stock colours, only ~15 % brighter than the original. (v7 doubled the light and
      // tinted everything warm, which turned the concrete brown — reverted.) The only real
      // change to the look is the blue sky from getMapEnvColors().
      for (const [lx, lz] of lightPos) {
        const L = createPhysicalPointLight(0xfff6ee, 550, 145, 2.2);
        L.position.set(lx, H + 1.1, lz);
        L.castShadow = false;
        scene.add(L);
        pvpMapLights.push(L);
      }
      const ambFill = new THREE.AmbientLight(0xd4e2f5, 2.4);
      scene.add(ambFill);
      pvpMapLights.push(ambFill);
      const hemiFill = new THREE.HemisphereLight(0xeef6ff, 0x5c5348, 4.8);
      scene.add(hemiFill);
      pvpMapLights.push(hemiFill);
      const sunFill = new THREE.DirectionalLight(0xfff6ea, 11.0);
      sunFill.position.set(18, 42, 14);
      sunFill.castShadow = false;
      scene.add(sunFill);
      pvpMapLights.push(sunFill);
      // The range is now 96 units deep, so the far end needs its own fill or it goes black.
      // Neutral white and deliberately weak — this is a fill, not a second sun.
      const backFill = new THREE.DirectionalLight(0xf2f6ff, 3.0);
      backFill.position.set(-14, 16, -46);
      backFill.castShadow = false;
      scene.add(backFill);
      pvpMapLights.push(backFill);
      ceiling.visible = false;
    }

    /**
     * PVP map-sync via the SHARE code (not the relay mode). The relay only knows the 4 predefined
     * modes and keys rooms as `mode:CODE`, so we must NOT invent new modes (that breaks room
     * create/join). Instead the room still uses the plain "crossfire" mode, and we tag the *display*
     * code a player shares with the chosen map variant. A friend who types that code joins the same
     * server room (plain code) AND learns which map to build — so both sides always match.
     * Classic code stays the raw server code (back-compatible); grid gets a "-G" tag.
     */
    function makePvpShareCode(realCode, variant) {
      const c = String(realCode || "");
      if (!c) return c;
      return variant === "crossfire_grid" ? `${c}-G` : c;
    }

    /** Split a shared PVP code back into the real server code + map variant ("" = unspecified). */
    function parsePvpShareCode(input) {
      const up = String(input || "").trim().toUpperCase();
      if (up.endsWith("-G")) return { code: up.slice(0, -2), variant: "crossfire_grid" };
      if (up.endsWith("-C")) return { code: up.slice(0, -2), variant: "crossfire" };
      return { code: up, variant: "" };
    }

    function lobbyMapFromPending() {
      if (pendingLobbyMode === "crossfire") return PENDING_PVP_MAP;
      if (pendingLobbyMode === "training-coop") return "training";
      if (pendingLobbyMode === "boss-coop") return "boss_arena";
      return "arena";
    }


    /* ══════════════════════════════════════════════════════════════════════
     * GAUNTLET — 20-level movement course
     *
     * Deliberately NOT the boss mode. There is no clear condition tied to killing
     * anything: the only objective is to reach the exit pad. Zombies and the boss are
     * pressure, not a checklist — you may sprint straight past every one of them.
     *
     *   Levels  1–5   pure movement (jump / dash / crouch / narrow beams)
     *   Levels  6–15  zombies layered on top of the movement
     *   Levels 16–20  zombies + Hormone Zombie boss
     *   Level  20     the boss is the HELL Hormone Zombie
     *
     * The course is built from segments laid end to end down -Z. Everything outside a
     * platform is void: falling off resets you to the last checkpoint, not to the menu.
     * ═════════════════════════════════════════════════════════════════════ */
    function isGauntletMap(m) { return m === "gauntlet"; }

    const GAUNTLET_LEVEL_COUNT = 20;
    /** Eye Y below which you are considered fallen. Platform tops sit at 0 and up. */
    const GAUNTLET_VOID_Y = -6;
    /** The implicit "floor everywhere" is pushed far under the course so pits are real. */
    const GAUNTLET_FLOOR_EYE_Y = -40;
    const GAUNTLET_W = 12;            // standard corridor width
    const GAUNTLET_PROGRESS_KEY = "fps_gauntlet_progress";

    /** Jump clears ~5.4u (speed 6.5, 0.83s hang). Dash covers 8.0u. Gaps are sized off that. */
    const GAP_JUMP = 4.2;   // comfortably jumpable
    const GAP_DASH = 7.0;   // not jumpable — dash only
    const CRAWL_CLEAR = 1.30; // slab underside: blocks a 1.65 standing eye, passes 1.03 crouched

    /**
     * Segment vocabulary:
     *   run    {len, w}          flat platform
     *   jump   {gap}             jumpable pit
     *   dash   {gap}             dash-only pit
     *   crawl  {len}             platform under a low slab — must crouch
     *   beam   {len, w}          narrow platform over the void
     *   steps  {n, rise, len}    ascending pads
     *   pads   {n, len, gap, w}  islands separated by pits
     *   room   {len, w, spots}   open arena; `spots` zombie spawn points
     */
    const GAUNTLET_LEVELS = [
      // ── 1–5: movement only ──────────────────────────────────────────────
      { name: "FIRST STEPS",  segs: [{t:"run",len:16},{t:"jump"},{t:"run",len:12},{t:"jump"},{t:"run",len:14}] },
      { name: "THE GAP",      segs: [{t:"run",len:12},{t:"jump"},{t:"run",len:8},{t:"dash"},{t:"run",len:14}] },
      { name: "DUCK",         segs: [{t:"run",len:10},{t:"crawl",len:10},{t:"jump"},{t:"crawl",len:8},{t:"run",len:12}] },
      { name: "NARROW",       segs: [{t:"run",len:10},{t:"beam",len:18,w:2.4},{t:"jump"},{t:"beam",len:14,w:2.0},{t:"run",len:12}] },
      { name: "STAIRWAY",     segs: [{t:"run",len:10},{t:"steps",n:4,rise:1.6,len:4},{t:"dash"},{t:"pads",n:3,len:3.5,gap:GAP_JUMP,w:4},{t:"run",len:12}] },

      // ── 6–15: zombies + movement ────────────────────────────────────────
      { name: "WELCOMING PARTY", z:4,  segs: [{t:"run",len:10},{t:"room",len:22},{t:"jump"},{t:"run",len:14}] },
      { name: "CROSSING",        z:5,  segs: [{t:"run",len:10},{t:"room",len:18},{t:"dash"},{t:"beam",len:16,w:2.6},{t:"run",len:12}] },
      { name: "LOW ROADS",       z:6,  segs: [{t:"run",len:10},{t:"crawl",len:12},{t:"room",len:18},{t:"crawl",len:10},{t:"run",len:12}] },
      { name: "STEPPING OUT",    z:7,  segs: [{t:"run",len:10},{t:"pads",n:4,len:3.5,gap:GAP_JUMP,w:4},{t:"room",len:20},{t:"dash"},{t:"run",len:12}] },
      { name: "THE LONG DROP",   z:8,  segs: [{t:"run",len:10},{t:"dash"},{t:"beam",len:20,w:2.2},{t:"dash"},{t:"room",len:20},{t:"run",len:12}] },
      { name: "SWARM",           z:10, segs: [{t:"run",len:10},{t:"room",len:26},{t:"crawl",len:10},{t:"room",len:18},{t:"run",len:12}] },
      { name: "HIGH GROUND",     z:10, segs: [{t:"run",len:10},{t:"steps",n:4,rise:1.7,len:4},{t:"beam",len:14,w:2.6},{t:"steps",n:4,rise:-1.7,len:4},{t:"room",len:20},{t:"dash"},{t:"run",len:12}] },
      { name: "PINCH",           z:11, segs: [{t:"run",len:10},{t:"beam",len:16,w:2.0},{t:"room",len:22},{t:"beam",len:16,w:2.0},{t:"run",len:12}] },
      { name: "NO FLOOR",        z:12, segs: [{t:"run",len:10},{t:"pads",n:5,len:3.2,gap:GAP_JUMP,w:3.6},{t:"room",len:22},{t:"dash"},{t:"pads",n:3,len:3.2,gap:GAP_JUMP,w:3.6},{t:"run",len:12}] },
      { name: "GRINDER",         z:14, segs: [{t:"run",len:10},{t:"room",len:22},{t:"crawl",len:12},{t:"dash"},{t:"room",len:22},{t:"beam",len:14,w:2.4},{t:"run",len:12}] },

      // ── 16–20: zombies + boss ───────────────────────────────────────────
      { name: "HORMONE",         z:8,  boss:1, segs: [{t:"run",len:10},{t:"room",len:20},{t:"dash"},{t:"room",len:28,boss:true},{t:"run",len:14}] },
      { name: "BOSS + BEAMS",    z:9,  boss:1, segs: [{t:"run",len:10},{t:"beam",len:18,w:2.6},{t:"room",len:28,boss:true},{t:"dash"},{t:"run",len:14}] },
      { name: "CRAWLSPACE",      z:10, boss:1, segs: [{t:"run",len:10},{t:"crawl",len:12},{t:"room",len:28,boss:true},{t:"crawl",len:12},{t:"run",len:14}] },
      { name: "THE CLIMB",       z:12, boss:1, segs: [{t:"run",len:10},{t:"steps",n:4,rise:1.7,len:4},{t:"beam",len:14,w:2.6},{t:"steps",n:4,rise:-1.7,len:4},{t:"room",len:28,boss:true},{t:"dash"},{t:"pads",n:3,len:3.4,gap:GAP_JUMP,w:4},{t:"run",len:14}] },
      { name: "HELL",            z:14, boss:1, hell:true,
        segs: [{t:"run",len:10},{t:"dash"},{t:"beam",len:18,w:2.4},{t:"room",len:24},{t:"crawl",len:10},{t:"room",len:32,boss:true},{t:"run",len:14}] },
    ];

    function clearGauntletProps() {
      while (gauntletProps.length) {
        const o = gauntletProps.pop();
        scene.remove(o);
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of ms) m.dispose();
        }
      }
    }

    let gauntletLevel = 1;
    let gauntletCourse = null;   // { finishZ, finishX, length, checkpoints[], spots[], bossSpot }
    let gauntletState = {
      cleared: false, deaths: 0, startMs: 0, checkpointIdx: 0, finishedMs: 0,
    };

    function gauntletProgress() {
      const n = parseInt(localStorage.getItem(GAUNTLET_PROGRESS_KEY) || "0", 10);
      return Number.isFinite(n) ? THREE.MathUtils.clamp(n, 0, GAUNTLET_LEVEL_COUNT) : 0;
    }
    function saveGauntletProgress(level) {
      if (level > gauntletProgress()) {
        try { localStorage.setItem(GAUNTLET_PROGRESS_KEY, String(level)); } catch (_) {}
      }
    }

    function gauntletRespawnAtCheckpoint() {
      if (!gauntletCourse) return;
      const cp = gauntletCourse.checkpoints[gauntletState.checkpointIdx]
        || gauntletCourse.checkpoints[0];
      if (!cp) return;
      player.position.set(cp.x, cp.y, cp.z);
      player.velocityY = 0;
      player.onGround = true;
      state.dashActiveUntil = 0;
      state.dashRemainingDist = 0;
      camera.position.copy(player.position);
    }

    function updateGauntlet(dt) {
      if (!isGauntletMap(CURRENT_MAP) || !gauntletCourse || !gameWorldReady) return;
      if (player.health <= 0) return;

      // Advance the checkpoint as you pass each platform. -Z is forward, so "passed" means
      // the player's z has dropped below the marker's.
      const cps = gauntletCourse.checkpoints;
      while (
        gauntletState.checkpointIdx + 1 < cps.length &&
        player.position.z <= cps[gauntletState.checkpointIdx + 1].z
      ) gauntletState.checkpointIdx++;

      // Fell off the course. Not a death — the run continues from the last checkpoint,
      // which is what keeps a 20-level movement mode playable instead of infuriating.
      if (player.position.y < GAUNTLET_VOID_Y) {
        gauntletState.deaths++;
        damagePlayer(12, null);
        if (player.health > 0) {
          gauntletRespawnAtCheckpoint();
          showCombatFeedback(tr("gauntletFell", "FELL — BACK TO CHECKPOINT"), "#ffb21f", 0.6);
        }
        return;
      }

      if (gauntletState.cleared) return;
      const dx = player.position.x - gauntletCourse.finishX;
      const dz = player.position.z - gauntletCourse.finishZ;
      if (dx * dx + dz * dz < 5.5 * 5.5) {
        gauntletState.cleared = true;
        gauntletState.finishedMs = performance.now();
        saveGauntletProgress(gauntletLevel);
        showGauntletClear();
      }
    }

    let _gClearEl = null;
    function showGauntletClear() {
      if (!_gClearEl) {
        const el = document.createElement("div");
        el.id = "gauntletClear";
        el.style.cssText =
          "position:fixed;inset:0;z-index:120;display:none;flex-direction:column;" +
          "align-items:center;justify-content:center;gap:14px;background:rgba(4,8,12,0.82);" +
          "font-family:var(--game-font-ui);color:#dff6ff;text-align:center;";
        el.innerHTML =
          '<div id="gClearTitle" style="font-size:38px;letter-spacing:4px;color:#62ffb0;text-shadow:0 2px 18px rgba(60,255,170,0.5);"></div>' +
          '<div id="gClearSub" style="font-size:15px;opacity:0.85;letter-spacing:1px;"></div>' +
          '<div style="display:flex;gap:10px;margin-top:10px;">' +
          '<button type="button" id="gClearNext" class="btn-texture btn-primary" style="min-width:150px;padding:10px 18px;"></button>' +
          '<button type="button" id="gClearRetry" class="btn-texture" style="min-width:120px;padding:10px 18px;"></button>' +
          '<button type="button" id="gClearMenu" class="btn-texture" style="min-width:120px;padding:10px 18px;"></button>' +
          "</div>";
        document.body.appendChild(el);
        el.querySelector("#gClearNext").addEventListener("click", () => {
          _gClearEl.style.display = "none";
          startGauntletLevel(Math.min(GAUNTLET_LEVEL_COUNT, gauntletLevel + 1));
        });
        el.querySelector("#gClearRetry").addEventListener("click", () => {
          _gClearEl.style.display = "none";
          startGauntletLevel(gauntletLevel);
        });
        el.querySelector("#gClearMenu").addEventListener("click", () => {
          _gClearEl.style.display = "none";
          goToMenu();
        });
        _gClearEl = el;
      }
      const secs = ((gauntletState.finishedMs - gauntletState.startMs) / 1000).toFixed(1);
      const last = gauntletLevel >= GAUNTLET_LEVEL_COUNT;
      _gClearEl.querySelector("#gClearTitle").textContent = last
        ? tr("gauntletAllClear", "GAUNTLET COMPLETE")
        : tr("gauntletClear", "LEVEL {n} CLEAR").replace("{n}", String(gauntletLevel));
      _gClearEl.querySelector("#gClearSub").textContent =
        tr("gauntletTime", "Time") + " " + secs + "s  ·  " +
        tr("gauntletFalls", "Falls") + " " + gauntletState.deaths;
      const nextBtn = _gClearEl.querySelector("#gClearNext");
      nextBtn.textContent = tr("gauntletNext", "NEXT LEVEL");
      nextBtn.style.display = last ? "none" : "";
      _gClearEl.querySelector("#gClearRetry").textContent = tr("gauntletRetry", "RETRY");
      _gClearEl.querySelector("#gClearMenu").textContent = tr("gauntletMenu", "MENU");
      _gClearEl.style.display = "flex";
      try { document.exitPointerLock(); } catch (_) {}
    }

    function buildMapGauntlet() {
      clearPvpMapLights();
      clearGauntletProps();
      const spec = GAUNTLET_LEVELS[THREE.MathUtils.clamp(gauntletLevel, 1, GAUNTLET_LEVEL_COUNT) - 1];
      const FLOOR = 0x55606e, BEAM = 0x7a6a52, ROOM = 0x4d5a68, EXIT = 0x2f7d4f;
      const checkpoints = [];
      const spots = [];
      let bossSpot = null;
      let cz = 6;      // leading edge; the start pad hangs off +Z of it
      let y = 0;       // current platform top

      /**
       * Glowing rim around every platform. On a dark map you cannot judge a jump you
       * cannot see the edge of — lighting alone was not enough, and guessing where the
       * floor ends is not the kind of difficulty this mode is for. Unlit basic material,
       * so it stays readable at any distance and through fog. Purely decorative: never
       * added to wallBoxes, so it has no collision.
       */
      const rim = (w, d, x, z, topY, color) => {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, fog: false });
        const t = 0.22;
        const mk = (sw, sd, sx, sz) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.06, sd), mat);
          m.position.set(sx, topY + 0.04, sz);
          m.raycast = () => {};
          scene.add(m);
          gauntletProps.push(m);
        };
        mk(w, t, x, z + d / 2 - t / 2);   // near end
        mk(w, t, x, z - d / 2 + t / 2);   // far end
        mk(t, d, x - w / 2 + t / 2, z);   // left
        mk(t, d, x + w / 2 - t / 2, z);   // right
      };
      const plat = (len, w, topY, color, rimColor) => {
        const m = addWallBox(w, 4, len, 0, topY - 2, cz - len / 2, color);
        if (m.userData.wallBox) m.userData.wallBox.wideTop = true;
        rim(w, len, 0, cz - len / 2, topY, rimColor || 0x3fa7d6);
        cz -= len;
      };
      const rails = (len, w, topY) => {
        // Waist-high kerbs so a "run" segment reads as a corridor and you don't walk off
        // sideways by accident. Beams and pads deliberately get none.
        addWallBox(0.5, 1.1, len, w / 2 + 0.25, topY + 0.55, cz + len / 2, color_kerb);
        addWallBox(0.5, 1.1, len, -w / 2 - 0.25, topY + 0.55, cz + len / 2, color_kerb);
      };
      const color_kerb = 0x3d4652;
      /**
       * Zombie-only fence. enemyCollidesWall() samples a sphere at y=1.0, while the floor
       * platforms top out at y=0 — so nothing stopped a zombie from strolling straight out
       * over a pit and hovering in mid-air. These invisible slabs sit in exactly that
       * sampled band at every pit edge. They are flagged enemyOnly so the player's own
       * collision ignores them completely and can still jump/dash the gap.
       */
      const fence = (topY) => {
        const m = addWallBox(GAUNTLET_W + 8, 1.6, 0.5, 0, topY + 0.8, cz, color_kerb);
        m.visible = false;
        if (m.userData.wallBox) m.userData.wallBox.enemyOnly = true;
      };
      const pit = (len, topY) => { fence(topY); cz -= len; fence(topY); };
      const RIM_EDGE = 0xffa53a;   // amber: the floor ends here
      const RIM_SIDE = 0x3fa7d6;   // cyan: ordinary platform
      const RIM_EXIT = 0x54ffa0;
      const mark = () => checkpoints.push({ x: 0, y: y + 1.65, z: cz + 2.5 });

      // Start pad
      plat(12, GAUNTLET_W + 4, y, FLOOR);
      mark();

      for (const sg of spec.segs) {
        if (sg.t === "run") {
          plat(sg.len, sg.w || GAUNTLET_W, y, FLOOR, RIM_EDGE);
          rails(sg.len, sg.w || GAUNTLET_W, y);
          mark();
        } else if (sg.t === "jump") {
          pit(sg.gap || GAP_JUMP, y);
        } else if (sg.t === "dash") {
          pit(sg.gap || GAP_DASH, y);
        } else if (sg.t === "crawl") {
          const w = sg.w || GAUNTLET_W;
          plat(sg.len, w, y, FLOOR);
          // Slab underside at y + CRAWL_CLEAR — too low to walk under, fine to crouch under.
          addWallBox(w, 3.0, sg.len, 0, y + CRAWL_CLEAR + 1.5, cz + sg.len / 2, 0x6b5b4a);
          mark();
        } else if (sg.t === "beam") {
          plat(sg.len, sg.w || 2.4, y, BEAM, RIM_EDGE);
          mark();
        } else if (sg.t === "steps") {
          for (let i = 0; i < sg.n; i++) {
            y += sg.rise;
            plat(sg.len, sg.w || 6, y, FLOOR, RIM_SIDE);
          }
          mark();
        } else if (sg.t === "pads") {
          for (let i = 0; i < sg.n; i++) {
            plat(sg.len, sg.w || 4, y, BEAM, RIM_EDGE);
            if (i < sg.n - 1) pit(sg.gap || GAP_JUMP, y);
          }
          mark();
        } else if (sg.t === "room") {
          const w = sg.w || (GAUNTLET_W + 10);
          const zEnd = cz - sg.len;
          plat(sg.len, w, y, ROOM, RIM_SIDE);
          rails(sg.len, w, y);
          // Spawn points spread across the room floor, inset from the edges.
          const cols = 3, rows = Math.max(2, Math.round(sg.len / 8));
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              spots.push({
                x: (c - (cols - 1) / 2) * (w * 0.30),
                z: cz + sg.len * ((r + 0.5) / rows),
                y,
              });
            }
          }
          if (sg.boss) bossSpot = { x: 0, z: zEnd + sg.len * 0.35, y };
          mark();
        }
      }

      // Exit pad — visually distinct, plus a beacon column so it reads from a distance.
      const finishLen = 14;
      const finishZ = cz - finishLen / 2;
      plat(finishLen, GAUNTLET_W + 4, y, EXIT, RIM_EXIT);
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.6, 14, 20, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0x54ffa0, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false,
        })
      );
      beacon.position.set(0, y + 7, finishZ);
      beacon.raycast = () => {};
      scene.add(beacon);
      gauntletProps.push(beacon);
      const beaconLight = createPhysicalPointLight(0x62ffb0, 420, 40, 2.0);
      beaconLight.position.set(0, y + 4.5, finishZ);
      beaconLight.castShadow = false;
      scene.add(beaconLight);
      pvpMapLights.push(beaconLight);

      // Lighting. Without this the course was pitch black — the map builders each own their
      // own lights and this one was only adding the exit beacon. A cool overhead key plus a
      // run of lamps down the course, so you can actually see the next platform edge.
      const amb = new THREE.AmbientLight(0xc4d6ea, 3.4);
      scene.add(amb); pvpMapLights.push(amb);
      const hemi = new THREE.HemisphereLight(0xdae8ff, 0x39424f, 5.6);
      scene.add(hemi); pvpMapLights.push(hemi);
      const key = new THREE.DirectionalLight(0xeaf2ff, 11.0);
      key.position.set(18, 48, 20); key.castShadow = false;
      scene.add(key); pvpMapLights.push(key);
      const fill = new THREE.DirectionalLight(0xbcd4f2, 4.0);
      fill.position.set(-22, 30, -40); fill.castShadow = false;
      scene.add(fill); pvpMapLights.push(fill);
      for (let lz = 4; lz > finishZ - 8; lz -= 15) {
        const lamp = createPhysicalPointLight(0xbfd8ff, 680, 42, 2.0);
        lamp.position.set(0, 8.0, lz);
        lamp.castShadow = false;
        scene.add(lamp); pvpMapLights.push(lamp);
      }

      gauntletCourse = {
        finishX: 0, finishZ, finishY: y, length: Math.abs(finishZ),
        checkpoints, spots, bossSpot, spec,
      };
      gauntletState = { cleared: false, deaths: 0, startMs: performance.now(), checkpointIdx: 0, finishedMs: 0 };

      // bootGame calls positionPlayerForCurrentMap() BEFORE the map builder runs, so the
      // course did not exist yet and the player got the fallback spot. Place them properly
      // now that the start pad is real.
      const cp0 = checkpoints[0];
      if (cp0) {
        player.position.set(cp0.x, cp0.y, cp0.z);
        player.velocityY = 0;
        player.onGround = true;
        player.yaw = 0;
        camera.position.copy(player.position);
      }
    }

    const MAP_BUILDERS = {
      arena: buildMapArena,
      boss_arena: buildMapBossArena,
      crossfire: buildMapCrossfire,
      crossfire_grid: buildMapCrossfireGrid,
      pvp_bright: buildMapPvpBright,
      training: buildMapTraining,
      gauntlet: buildMapGauntlet,
    };

    const ZOMBIE_COUNT = 18;
    /** Multiplier for how far from players a zombie must spawn (0.4 = tighter / closer spawns). */
    const ZOMBIE_SPAWN_PLAYER_CLEAR_SCALE = 0.4;
    const SPAWN_MIN_DIST_BASE = 18 * ZOMBIE_SPAWN_PLAYER_CLEAR_SCALE;
    const SPAWN_MIN_DIST_FLOOR = 4 * ZOMBIE_SPAWN_PLAYER_CLEAR_SCALE;

    function hashRoomSeed(str) {
      let h = 2166136261 >>> 0;
      const s = String(str || "");
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    function mulberry32(seed) {
      let a = seed >>> 0;
      return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function getAllPlayerPositions() {
      const positions = [{ x: player.position.x, z: player.position.z }];
      if (MULTIPLAYER) {
        for (const rp of remotePlayers.values()) {
          if (rp.group.visible) positions.push({ x: rp.x, z: rp.z });
        }
      }
      return positions;
    }

    /**
     * Spawn placement helpers.
     *
     * The old picker drew a uniformly random angle every time, which clumps badly: with 18
     * zombies you routinely got 6 in one quadrant and an empty half-map behind you. These
     * three fix the three separate failure modes.
     */
    let _spawnSectorCursor = 0;
    const SPAWN_SECTORS = 8;
    /** Next angle from a round-robin sector, jittered inside the sector so it isn't a grid. */
    function nextSpawnAngle(rnd) {
      const sector = _spawnSectorCursor++ % SPAWN_SECTORS;
      const width = (Math.PI * 2) / SPAWN_SECTORS;
      return sector * width + rnd() * width;
    }
    /** Cycle near/mid/far so a wave doesn't arrive as one solid wall at one radius. */
    function spawnBandScale(rnd) {
      const band = _spawnSectorCursor % 3;
      const base = band === 0 ? 1.0 : band === 1 ? 1.55 : 2.2;
      return base + rnd() * 0.35;
    }
    /**
     * True if (x,z) sits inside the player's forward view cone. Spawning there is what makes
     * zombies "pop in" out of nowhere in plain sight; we retry a few times to land behind or
     * beside the player instead, then give up rather than fail to spawn at all.
     */
    function inPlayerViewCone(x, z, halfAngle = 0.62) {
      const dx = x - player.position.x;
      const dz = z - player.position.z;
      const len = Math.hypot(dx, dz);
      if (len < 1e-3) return true;
      const fx = -Math.sin(player.yaw);
      const fz = -Math.cos(player.yaw);
      return (dx * fx + dz * fz) / len > Math.cos(halfAngle);
    }

    function findSpawnPosition(minDist) {
      if (isGauntletMap(CURRENT_MAP)) {
        // The course is a corridor, not an open field — a ring around the player would put
        // zombies in the void. Respawn onto the authored floor spots instead, preferring
        // ones the player has not already walked past.
        const spots = (gauntletCourse && gauntletCourse.spots) || [];
        if (!spots.length) return { x: player.position.x, z: player.position.z - 12, usedDist: 0 };
        let best = spots[0], bestScore = -Infinity;
        for (const sp of spots) {
          const d = Math.hypot(sp.x - player.position.x, sp.z - player.position.z);
          const ahead = sp.z < player.position.z ? 14 : 0;   // in front of you is better
          const score = ahead + Math.min(d, 30) + Math.random() * 8 - (d < 8 ? 60 : 0);
          if (score > bestScore) { bestScore = score; best = sp; }
        }
        return { x: best.x, z: best.z, usedDist: 0 };
      }
      if (isBossArenaMap(CURRENT_MAP)) {
        const half = 45;
        for (let attempt = 0; attempt < 40; attempt++) {
          const x = (Math.random() - 0.5) * half * 2;
          const z = (Math.random() - 0.5) * half * 2;
          const dx = x - player.position.x;
          const dz = z - player.position.z;
          if (dx * dx + dz * dz < 10 * 10) continue;
          return { x, z, usedDist: 10 };
        }
        return { x: 20, z: -20, usedDist: 0 };
      }
      if (isArenaLikeMap(CURRENT_MAP)) {
        const players = getAllPlayerPositions();
        let dist = minDist;
        const px = player.position.x;
        const pz = player.position.z;
        for (let attempt = 0; attempt < 90; attempt++) {
          if (attempt > 0 && attempt % 22 === 0) {
            dist = Math.max(SPAWN_MIN_DIST_FLOOR, dist * 0.62);
          }
          const ang = nextSpawnAngle(Math.random);
          const rad = dist + Math.random() * (MAZE_CHUNK_WORLD * 0.9) * spawnBandScale(Math.random);
          const x = px + Math.cos(ang) * rad;
          const z = pz + Math.sin(ang) * rad;
          if (!arenaXZClearForSpawn(x, z, 0.5)) continue;
          // First two thirds of the attempts insist on spawning out of sight.
          if (attempt < 60 && inPlayerViewCone(x, z)) continue;
          let tooClose = false;
          for (const p of players) {
            const dx = x - p.x;
            const dz = z - p.z;
            if (dx * dx + dz * dz < dist * dist) {
              tooClose = true;
              break;
            }
          }
          if (tooClose) continue;
          return { x, z, usedDist: dist };
        }
        const x = px + 14;
        const z = pz;
        return { x, z, usedDist: 0 };
      }

      const S =
        CURRENT_MAP === "crossfire_grid"
          ? 27
          : isPvpCrossfireMap(CURRENT_MAP)
            ? 43
            : 40;
      const players = getAllPlayerPositions();
      let dist = minDist;
      for (let attempt = 0; attempt < 60; attempt++) {
        if (attempt > 0 && attempt % 15 === 0) {
          dist = Math.max(SPAWN_MIN_DIST_FLOOR, dist * 0.6);
        }
        const rnd = _spawnRng || Math.random;
        // Ring around the player on a round-robin sector rather than a uniform point in the
        // square — a uniform square point biases toward the corners and clumps by luck.
        const ang = nextSpawnAngle(rnd);
        const rad = dist * spawnBandScale(rnd) + rnd() * 12;
        let x = player.position.x + Math.cos(ang) * rad;
        let z = player.position.z + Math.sin(ang) * rad;
        x = THREE.MathUtils.clamp(x, -S, S);
        z = THREE.MathUtils.clamp(z, -S, S);
        if (enemyCollidesWall(x, z, 0.5)) continue;
        if (attempt < 40 && inPlayerViewCone(x, z)) continue;
        let tooClose = false;
        for (const p of players) {
          const dx = x - p.x, dz = z - p.z;
          if (dx * dx + dz * dz < dist * dist) { tooClose = true; break; }
        }
        if (tooClose) continue;
        return { x, z, usedDist: dist };
      }
      const rnd = _spawnRng || Math.random;
      const x = (rnd() * 2 - 1) * S;
      const z = (rnd() * 2 - 1) * S;
      return { x, z, usedDist: 0 };
    }

    const player = {
      position: new THREE.Vector3(-30, 1.65, -30),
      yaw: 0,
      pitch: 0,
      radius: 0.34,
      speed: 6.5,
      health: 100,
      maxHealth: 100,
      regenTimer: 0,
      velocityY: 0,
      onGround: true,
      /** PvP / spawn: ignore incoming damage until this timestamp (ms). */
      spawnProtectUntil: 0,
      /** Highest Y reached during the current airborne stretch; null while grounded. */
      fallApexY: null,
    };

    const keys = { w:false, a:false, s:false, d:false, space:false, shift:false, f:false, v:false, crouch:false };
    // Crouch depth, 0..1. Smoothed rather than binary so the camera and the avatar ease
    // down instead of snapping, and so a tap reads as a dip.
    const CROUCH_EYE_DROP = 0.62;   // metres the camera falls at full crouch
    const CROUCH_SPEED_MUL = 0.45;  // walk speed multiplier while fully crouched
    let crouchAmt = 0;

    /**
     * Dash stamina. Before this, dash was gated only by a 350 ms cooldown, which is no
     * gate at all — you could blink across a whole map without ever paying for it.
     * Three dashes empty the bar; it only starts refilling after you stop dashing.
     * A jet dash costs half, otherwise the harness's 10-second window would be spent
     * before you got anywhere.
     */
    const STAMINA_MAX            = 100;
    const STAMINA_DASH_COST      = 34;    // → 2 dashes from full, 3rd needs a sliver of regen
    // Jet dashes are FREE of stamina — the harness has its own window + cooldown instead.
    const STAMINA_REGEN_PER_SEC  = 26;    // full refill ≈ 3.8 s
    const STAMINA_REGEN_DELAY_MS = 900;   // quiet time before the bar starts coming back
    const state = {
      locked: false,
      mouseDown: false,
      ads: false,
      adsProgress: 0,
      adsFiredWhileScoping: false,
      score: 0,
      flashTimer: 0,
      recoil: 0,
      weaponIndex: 0,
      lastShot: 0,
      spreadBloom: 0,
      enemies: [],
      tracers: [],
      reloading: false,
      reloadEnd: 0,
      hitmarkerTimer: 0,
      combatFeedbackTimer: 0,
      walkPhase: 0,
      smoothHeadBob: 0,
      weaponBobX: 0,
      weaponBobY: 0,
      weaponBobRotZ: 0,
      camShake: 0,
      medKitHealProgress: 0,
      medKitHealStartMs: 0,
      medKitRingVisual: 0,
      medKitNeedsRelease: false,
      medKitDefilling: false,
      medKitDefillPhase: 0,
      medKitDefillStart: 0,
      weaponAction: null,
      weaponActionStart: 0,
      weaponActionDur: 320,
      shellCasings: [],
      lastShellEject: 0,
      reloadStartAmmo: 0,
      slowUntil: 0,
      dashCooldownEnd: 0,
      dashDisabledUntil: 0,
      stamina: STAMINA_MAX,
      staminaRegenAt: 0,
      // Time-based (true-velocity) dash state. The C-key dash now plays out over
      // DASH_DURATION_MS instead of teleporting; direction is captured at press time
      // and integrated each frame in updatePlayer.
      dashActiveUntil: 0,
      dashDirX: 0,
      dashDirZ: 0,
      dashDirY: 0,
      dashRemainingDist: 0,
      /** True when the in-flight dash was launched with the jet harness on (3D, can climb). */
      dashIsJet: false,
      // Last horizontal movement direction (world XZ, unit length). Updated every
      // frame the player is actively moving; the dash uses this instead of the
      // camera's look direction. (0, 0) means "no recent movement" → dash forward.
      lastMoveX: 0,
      lastMoveZ: 0,
      /** Banked camera recoil (radians) still owed back to the player after firing stops. */
      recoilPitchAccum: 0,
      recoilYawAccum: 0,
      projectiles: [],
      knifeComboIdx: 0,
      lastKnifeSwing: 0,
      speedNeedle: { phase:'idle', timer:0, animStart:0, charges:1 },
      /**
       * Jet harness. phase: 'idle' → 'strapping' (JET_STRAP_MS) → 'active' (JET_ACTIVE_MS) → 'idle'.
       * `netState` is what gets broadcast so opponents can see it (0 none / 1 strapping / 2 active);
       * it is only ever non-zero while the phase really is non-idle — an unused harness never
       * shows on anyone else's screen.
       */
      jet: { phase:'idle', startMs:0, endMs:0, charges:1, netState:0, cooldownUntil:0 },
    };


    const AMR_SCOPE_OVERLAY_PATHS = [
      "svg/amr-scope.svg",
    ];
    const AMR_SCOPE_OVERLAY_INLINE =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><defs><radialGradient id="v" cx="50%" cy="50%" r="50%"><stop offset="62%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.7"/></radialGradient><mask id="h"><rect width="1920" height="1080" fill="#fff"/><circle cx="960" cy="540" r="300" fill="#000"/></mask></defs><rect width="1920" height="1080" fill="#07080a" mask="url(#h)"/><circle cx="960" cy="540" r="302" fill="none" stroke="#14161c" stroke-width="14"/><circle cx="960" cy="540" r="300" fill="url(#v)"/><g stroke="#e8ecef" fill="#e8ecef" opacity="0.92"><line x1="960" y1="340" x2="960" y2="500" stroke-width="2"/><line x1="960" y1="580" x2="960" y2="740" stroke-width="2"/><line x1="760" y1="540" x2="920" y2="540" stroke-width="2"/><line x1="1000" y1="540" x2="1160" y2="540" stroke-width="2"/><circle cx="960" cy="540" r="3" fill="#ff3b3b" stroke="none"/></g></svg>'
      );

    function resolveAmrScopeOverlayUrl(done) {
      const root =
        (typeof window.__GAME_STATIC_ROOT__ === "string" && window.__GAME_STATIC_ROOT__) ||
        (function () {
          try {
            return new URL("./", location.href).href;
          } catch (e) {
            return "";
          }
        })();
      let i = 0;
      function tryNext() {
        if (i >= AMR_SCOPE_OVERLAY_PATHS.length) {
          done(AMR_SCOPE_OVERLAY_INLINE);
          return;
        }
        const url = root + AMR_SCOPE_OVERLAY_PATHS[i++];
        const probe = new Image();
        probe.onload = function () {
          done(url);
        };
        probe.onerror = tryNext;
        probe.src = url;
      }
      tryNext();
    }

    function initAmrScopeOverlay() {
      if (!amrScopeOverlayEl) return;
      resolveAmrScopeOverlayUrl(function (url) {
        amrScopeOverlayEl.style.backgroundImage = 'url("' + String(url).replace(/"/g, "%22") + '")';
      });
    }
    initAmrScopeOverlay();

    const weapons = [
      {
        name: "Pistol",
        fireDelay: 260,
        auto: false,
        pellets: 1,
        spreadBase: 0.005,
        spreadBloomAdd: 0.002,
        spreadBloomMax: 0.014,
        recover: 0.030,
        recoil: 0.042,
        damageHead: 20,
        damageBody: 8,
        damageLegs: 5,
        color: 0xffe08a,
        magSize: 12,
        ammo: 12,
        reloadTime: 1550,
        soundSkin: "revengeClassic",
        adsFov: 67,
        adsSpeed: 9,
        recoilKick: 0.018,
        recoilYaw: 0.005,
      },
      {
        name: "Assault Rifle",
        fireDelay: 98,
        auto: true,
        pellets: 1,
        spreadBase: 0.012,
        spreadBloomAdd: 0.004,
        spreadBloomMax: 0.042,
        recover: 0.040,
        recoil: 0.035,
        damageHead: 50,
        damageBody: 30.0,
        damageLegs: 20,
        color: 0x8fdcff,
        magSize: 30,
        ammo: 30,
        reloadTime: 1600,
        soundSkin: "ancientPhantom",
        adsFov: 55,
        adsSpeed: 6,
        recoilKick: 0.011,
        recoilYaw: 0.004,
      },
      {
        name: "Shotgun",
        fireDelay: 520,
        auto: false,
        pellets: 7,
        spreadBase: 0.055,
        spreadBloomAdd: 0.010,
        spreadBloomMax: 0.080,
        recover: 0.050,
        recoil: 0.055,
        damageHead: 26,
        damageBody: 16,
        damageLegs: 11,
        color: 0xffb47a,
        magSize: 8,
        ammo: 8,
        reloadTime: 3200,
        soundSkin: "chaosShorty",
        adsFov: 63,
        adsSpeed: 4.5,
        recoilKick: 0.042,
        recoilYaw: 0.01,
      },
      {
        name: "SMG",
        fireDelay: 78,
        auto: true,
        pellets: 1,
        spreadBase: 0.010,
        spreadBloomAdd: 0.005,
        spreadBloomMax: 0.050,
        recover: 0.060,
        recoil: 0.025,
        damageHead: 34,
        damageBody: 20,
        damageLegs: 13,
        color: 0xb8ff9a,
        magSize: 36,
        ammo: 36,
        reloadTime: 1450,
        soundSkin: "divineSpectre",
        adsFov: 75,
        adsSpeed: 7.5,
        recoilKick: 0.008,
        recoilYaw: 0.004,
      },
      {
        name: "Med Kit",
        fireDelay: 1e9,
        auto: false,
        pellets: 0,
        spreadBase: 0,
        spreadBloomAdd: 0,
        spreadBloomMax: 0,
        recover: 1,
        recoil: 0,
        damageHead: 0,
        damageBody: 0,
        damageLegs: 0,
        color: 0xffffff,
        magSize: 1,
        ammo: 1,
        reloadTime: 1e9,
        adsFov: 75,
        adsSpeed: 7.5,
      },
      {
        name: "AMR",
        fireDelay: 1260,
        auto: false,
        pellets: 1,
        spreadBase: 0.058,
        spreadBloomAdd: 0.014,
        spreadBloomMax: 0.098,
        recover: 0.032,
        recoil: 0.2,
        damageHead: 220,
        damageBody: 220,
        damageLegs: 90,
        color: 0xd4c4ff,
        magSize: 5,
        ammo: 5,
        reloadTime: 3400,
        soundSkin: "dragonOperator",
        adsFov: 26,
        adsSpeed: 3.29,
        recoilKick: 0.03,
        recoilYaw: 0.006,
      },
      {
        name: "Paralysis Dart",
        fireDelay: 650,
        auto: false,
        pellets: 1,
        spreadBase: 0.004,
        spreadBloomAdd: 0.002,
        spreadBloomMax: 0.012,
        recover: 0.04,
        recoil: 0.06,
        damageHead: 0,
        damageBody: 0,
        damageLegs: 0,
        color: 0x6bd4ff,
        magSize: 3,
        ammo: 3,
        reloadTime: 2400,
        soundSkin: "revengeClassic",
        adsFov: 60,
        adsSpeed: 6,
        recoilKick: 0.012,
        recoilYaw: 0.003,
        projectile: true,
        projectileSpeed: 36,
        projectileGravity: 9.8,
        slowDuration: 5.0,
      },
      // Slot 7 (key "0"): melee knife. Front hit = 50 dmg (2 hits to kill 100 HP), backstab = 200 dmg (one-shot).
      // Head/body damage are intentionally identical per design. fireDelay gates swing rate.
      // auto: true so holding LMB keeps cycling left/right/thrust — players don't have to
      // re-click for each swing. fireDelay (380ms) is tuned to roughly match the strike phase
      // of the animation so swings overlap cleanly with the recover phase.
      {
        name: "Knife",
        fireDelay: 480,
        auto: true,
        pellets: 0,
        spreadBase: 0,
        spreadBloomAdd: 0,
        spreadBloomMax: 0,
        recover: 0,
        recoil: 0,
        damageHead: 50,
        damageBody: 50,
        damageLegs: 50,
        color: 0xc8d2dc,
        magSize: 1,
        ammo: 1,
        reloadTime: 1e9,
        adsFov: 75,
        adsSpeed: 7.5,
        melee: true,
        meleeRange: 2.1,
        meleeBackstabDamage: 200,
      },
      {
        name: "～～～",
        fireDelay: 480,
        auto: true,
        pellets: 1,
        spreadBase: 0,
        spreadBloomAdd: 0,
        spreadBloomMax: 0,
        recover: 0,
        recoil: 0.01,
        damageHead: 7500,
        damageBody: 7500,
        damageLegs: 7500,
        color: 0xff0000,
        magSize: 9999,
        ammo: 9999,
        reloadTime: 1e9,
        adsFov: 75,
        adsSpeed: 7.5,
        recoilKick: 0.004,
        recoilYaw: 0.002,
      },
      {
        // ── AS Val (index 9) ────────────────────────────────────────────────
        // Damage is the SMG's, unchanged (34 / 20 / 13). What differs is handling: spread
        // sits between the AR and the SMG, it has a real scope, and ADS pulls the cone in
        // hard (adsSpreadMul 0.55) rather than merely removing the hip penalty.
        // Against armour it is the middle option — armorMul 1.20 vs the SMG's 2.25.
        name: "AS Val",
        fireDelay: 86,
        auto: true,
        pellets: 1,
        spreadBase: 0.011,        // SMG 0.010 < 0.011 < AR 0.012
        spreadBloomAdd: 0.0045,   // SMG 0.005 > 0.0045 > AR 0.004
        spreadBloomMax: 0.046,    // SMG 0.050 > 0.046 > AR 0.042
        recover: 0.050,
        recoil: 0.030,
        damageHead: 34,
        damageBody: 20,
        damageLegs: 13,
        color: 0xc7b6ff,
        magSize: 20,
        ammo: 20,
        reloadTime: 1520,
        soundSkin: "divineSpectre",
        adsFov: 52,
        adsSpeed: 6.5,
        adsSpreadMul: 0.55,
        recoilKick: 0.0095,
        recoilYaw: 0.004,
      },
    ];

    /**
     * Weapon availability. The kill-gated unlock ladder is GONE — it added nothing but a wall
     * in front of new players. Everything is available from the first match; the only thing
     * still gated is ～～～ (8), which is a hidden weapon, not a progression reward.
     * The object is kept rather than deleted so the many call sites keep working.
     */
    const weaponUnlocked = {
      0: true, 1: true, 2: true, 3: true, 4: true,
      5: true, 6: true, 7: true, 9: true,
      8: false,
    };
    /* ── Loadout / backpack ────────────────────────────────────────────────
     * Outside the training range you no longer walk in with the whole armoury. You pick
     * TWO guns in the main menu; the med kit and the knife always come along; the speed
     * needle and the jet harness are gear, not weapons, so they are never restricted.
     * The pick is frozen the moment a match starts (`activeLoadout`) and can only be
     * changed by backing out to the menu — that is what makes it a loadout rather than a
     * settings screen.
     *
     * `activeLoadout === null` means "no restriction" and is what the training range uses.
     */
    /* ── Armour ───────────────────────────────────────────────────────────────
     * Two slots, four tiers each (0 = none). Every tier is a straight trade: mitigation up,
     * something else down. Helmets cover HEAD hits, vests cover BODY and LEG hits, so the
     * two pieces are a real choice rather than one "armour" number.
     *
     * A weapon's armorMul scales the mitigation it faces. Crucially it multiplies the
     * MITIGATION, not the damage — so against an unarmoured target (mitigation 0) every
     * weapon deals exactly its normal damage regardless of its multiplier.
     */
    const ARMOR_HELMETS = [
      { name: "None",         mit: 0.00, fovMul: 1.00, hitFade: 1.00 },
      { name: "Scout Mk I",   mit: 0.18, fovMul: 0.95, hitFade: 0.70 },
      { name: "Line Mk II",   mit: 0.32, fovMul: 0.88, hitFade: 0.42 },
      { name: "Siege Mk III", mit: 0.50, fovMul: 0.80, hitFade: 0.18 },
    ];
    const ARMOR_VESTS = [
      { name: "None",   mit: 0.00, speedMul: 1.00, actionMul: 1.00 },
      { name: "Light",  mit: 0.18, speedMul: 0.95, actionMul: 1.12 },
      { name: "Medium", mit: 0.32, speedMul: 0.87, actionMul: 1.28 },
      { name: "Heavy",  mit: 0.50, speedMul: 0.78, actionMul: 1.50 },
    ];
    /** How effective armour is against each weapon. 0 = armour ignored entirely. */
    const WEAPON_ARMOR_MUL = {
      3: 2.25,  // SMG    — the rework: armour is 225% as effective against it
      9: 1.20,  // AS Val — middle ground
      5: 0.00,  // AMR    — anti-materiel: punches straight through
    };
    /** Hard ceiling so no combination can make a player effectively immune. */
    const ARMOR_MIT_CAP = 0.85;
    const ARMOR_STORAGE_KEY = "fps_armor_v1";
    let armorHelmet = 0;
    let armorVest = 0;

    function armorMulForWeapon(widx) {
      const m = WEAPON_ARMOR_MUL[widx | 0];
      return m === undefined ? 1.0 : m;
    }
    /** Fraction of damage absorbed for a hit zone, given the victim's kit and the weapon. */
    function armorMitigation(zone, helmetId, vestId, widx) {
      const h = ARMOR_HELMETS[helmetId | 0] || ARMOR_HELMETS[0];
      const v = ARMOR_VESTS[vestId | 0] || ARMOR_VESTS[0];
      const base = zone === "head" ? h.mit : v.mit;
      if (base <= 0) return 0;                       // unarmoured → damage never changes
      return Math.min(ARMOR_MIT_CAP, base * armorMulForWeapon(widx));
    }
    function applyArmorToDamage(amount, zone, helmetId, vestId, widx) {
      return amount * (1 - armorMitigation(zone, helmetId, vestId, widx));
    }
    function myHelmet() { return ARMOR_HELMETS[armorHelmet] || ARMOR_HELMETS[0]; }
    function myVest()   { return ARMOR_VESTS[armorVest]   || ARMOR_VESTS[0]; }
    /** Packed into the `move` payload so a shooter can price a shot before emitting it. */
    function packArmor() { return (armorHelmet & 3) * 4 + (armorVest & 3); }
    function loadArmor() {
      try {
        const o = JSON.parse(localStorage.getItem(ARMOR_STORAGE_KEY) || "null");
        if (o) {
          armorHelmet = THREE.MathUtils.clamp(o.h | 0, 0, ARMOR_HELMETS.length - 1);
          armorVest = THREE.MathUtils.clamp(o.v | 0, 0, ARMOR_VESTS.length - 1);
        }
      } catch (_) {}
    }
    function saveArmor() {
      try { localStorage.setItem(ARMOR_STORAGE_KEY, JSON.stringify({ h: armorHelmet, v: armorVest })); } catch (_) {}
    }

    const LOADOUT_GUN_POOL = [0, 2, 3, 9, 1, 5, 6];  // Pistol, Shotgun, SMG, AS Val, AR, AMR, Dart
    const LOADOUT_MED = 4;
    const LOADOUT_KNIFE = 7;
    const LOADOUT_HIDDEN = 8;                     // ～～～ — never counts against the limit
    const LOADOUT_MAX_GUNS = 2;
    const LOADOUT_STORAGE_KEY = "fps_loadout_v1";
    let loadoutGuns = [0, 2];
    let activeLoadout = null;

    /** Drop anything locked/invalid, then top back up to two so you never spawn gunless. */
    function sanitizeLoadoutSelection() {
      const seen = new Set();
      loadoutGuns = loadoutGuns.filter((i) => {
        if (!LOADOUT_GUN_POOL.includes(i) || !weaponUnlocked[i] || seen.has(i)) return false;
        seen.add(i);
        return true;
      }).slice(0, LOADOUT_MAX_GUNS);
      for (const g of LOADOUT_GUN_POOL) {
        if (loadoutGuns.length >= LOADOUT_MAX_GUNS) break;
        if (weaponUnlocked[g] && !loadoutGuns.includes(g)) loadoutGuns.push(g);
      }
      if (!loadoutGuns.length) loadoutGuns = [0];
    }

    function saveLoadout() {
      try { localStorage.setItem(LOADOUT_STORAGE_KEY, JSON.stringify(loadoutGuns)); } catch (_) {}
    }

    function loadLoadout() {
      try {
        const raw = JSON.parse(localStorage.getItem(LOADOUT_STORAGE_KEY) || "null");
        if (Array.isArray(raw)) loadoutGuns = raw.map((n) => n | 0);
      } catch (_) {}
      sanitizeLoadoutSelection();
    }

    /** Freeze the pick for the match about to start. Training range stays unrestricted. */
    function lockLoadoutForMap(mapName) {
      if (isTrainingMap(mapName)) { activeLoadout = null; return; }
      sanitizeLoadoutSelection();
      activeLoadout = loadoutGuns.slice();
    }
    function clearActiveLoadout() { activeLoadout = null; }

    function weaponInLoadout(idx) {
      if (!activeLoadout) return true;
      if (idx === LOADOUT_MED || idx === LOADOUT_KNIFE || idx === LOADOUT_HIDDEN) return true;
      return activeLoadout.includes(idx);
    }
    /** The single gate every weapon-selection path goes through. */
    function weaponAvailable(idx) {
      return !!weaponUnlocked[idx] && weaponInLoadout(idx);
    }

    /**
     * What the number keys and the hotbar show right now. Unrestricted maps keep the
     * player's own drag-to-reorder layout; a loadout match gets a compact 1/2/3 + 0 bar.
     */
    // Own copy of the key labels rather than a reference to INV_KEY_LABELS: the HUD calls
    // this during early init, well before that const is initialised, and reaching for it
    // there threw a TDZ ReferenceError that aborted the whole module.
    const LOADOUT_SLOT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "0", "8"];
    function activeHotbarSlots() {
      if (!activeLoadout) {
        return gameSettings.weaponSlotOrder.map((w, i) => ({ key: LOADOUT_SLOT_KEYS[i], widx: w }));
      }
      const out = activeLoadout.map((w, i) => ({ key: String(i + 1), widx: w }));
      out.push({ key: String(out.length + 1), widx: LOADOUT_MED });
      out.push({ key: "0", widx: LOADOUT_KNIFE });
      return out;
    }

    /** After a lock-in, hop off any gun that is no longer in the bag. */
    function ensureWeaponAllowed() {
      if (weaponAvailable(state.weaponIndex)) return;
      for (const s of activeHotbarSlots()) {
        if (weaponAvailable(s.widx)) { setWeapon(s.widx); return; }
      }
    }

    let totalKillCount = 0;
    let bossKillCount = 0;

    const UNLOCK_STORAGE_KEY = "fps_unlocks";

    function unlockAllWeapons() {
      for (const k of Object.keys(weaponUnlocked)) weaponUnlocked[k] = true;
      DEV_GUN_UNLOCKED = true;
    }

    function resetUnlockProgress() {
      for (const k of Object.keys(weaponUnlocked)) weaponUnlocked[k] = true;
      weaponUnlocked[8] = false;
      totalKillCount = 0;
      bossKillCount = 0;
      DEV_GUN_UNLOCKED = false;
      CREATOR_UNLOCKED = false;
    }

    function loadUnlocks() {
      try {
        const data = JSON.parse(localStorage.getItem(UNLOCK_STORAGE_KEY) || "null");
        resetUnlockProgress();
        if (data) {
          if (data.weaponUnlocked) {
            for (const [k, v] of Object.entries(data.weaponUnlocked)) {
              if (v) weaponUnlocked[parseInt(k)] = true;
            }
          }
          totalKillCount = data.totalKillCount || 0;
          bossKillCount = data.bossKillCount || 0;
          if (data.devGunUnlocked) DEV_GUN_UNLOCKED = true;
          if (data.achievementsUnlocked) {
            for (const [k, v] of Object.entries(data.achievementsUnlocked)) {
              if (v) achievementsUnlocked[k] = true;
            }
            if (achievementsUnlocked.light) achievementsUnlocked.light_liberator = true;
          }
          const _rawEquipped = data.equippedAchievementIds || (data.equippedAchievementId ? [data.equippedAchievementId] : []);
          equippedAchievementIds = _rawEquipped.map(id => id === "light" ? "light_liberator" : id).filter(Boolean);
          totalTrainingDummyKills = data.totalTrainingDummyKills || 0;
          if (data.creatorUnlocked) {
            CREATOR_UNLOCKED = true;
            unlockAllWeapons();
            if (!achievementsUnlocked.creator) {
              achievementsUnlocked.creator = true;
              persistUnlocks();
            }
          }
        }
      } catch {
        resetUnlockProgress();
        resetAchievementProgress();
      }
    }

    // v93: reverted my made-up English/Chinese fallbacks. translation.js (translation.txt) already
    // has the real localized names ("这是什么/怪物猎人/强者/高级猎手/光明·解放者/训练者/各位弱爆了/
    // 猎手之王/不败神话/终极/创作者") in en + zh + zh-Hant. tr() pulls them straight.
    const ACHIEVEMENT_DEFS = [
      // category is purely for grouping in the new panel UI; gameplay logic
      // (unlockAchievement, equipAchievement) keys off `id` only.
      { id: "what_is_this",    nameKey: "achWhatIsThis",     hintKey: "achWhatIsThisHint",     color: "#b8b8ff", category: "progression", icon: "trophy" },
      { id: "monster_hunter",  nameKey: "achMonsterHunter",  hintKey: "achMonsterHunterHint",  color: "#ff8844", category: "combat",      icon: "skull" },
      { id: "strong_one",      nameKey: "achStrongOne",      hintKey: "achStrongOneHint",      color: "#ff6622", category: "combat",      icon: "sword" },
      { id: "elite_hunter",    nameKey: "achEliteHunter",    hintKey: "achEliteHunterHint",    color: "#cc44ff", category: "combat",      icon: "sword" },
      { id: "light_liberator", nameKey: "achLightLiberator", hintKey: "achLightLiberatorHint", color: "#ffd700", category: "combat",      icon: "sun" },
      { id: "trainer",         nameKey: "achTrainer",        hintKey: "achTrainerHint",        color: "#4fd1ff", category: "progression", icon: "target" },
      { id: "pvp_weak",        nameKey: "achPvpWeak",        hintKey: "achPvpWeakHint",        color: "#88cc88", category: "pvp",         icon: "crosshair" },
      { id: "pvp_hunter_king", nameKey: "achPvpHunterKing",  hintKey: "achPvpHunterKingHint",  color: "#ff8844", category: "pvp",         icon: "crosshair" },
      { id: "undefeated",      nameKey: "achUndefeated",     hintKey: "achUndefeatedHint",     color: "#ff5050", category: "pvp",         icon: "crown" },
      { id: "creator",         nameKey: "achCreator",        hintKey: "achCreatorHint",        color: "#4fd1ff", category: "secret",      icon: "key" },
      { id: "ultimate",        nameKey: "achUltimate",       hintKey: "",                      secret: true, color: "#e040ff", category: "secret",      icon: "question" },
    ];
    const achievementsUnlocked = {};
    let equippedAchievementIds = [];
    let totalTrainingDummyKills = 0;
    let sessionKillCount = 0;
    let sessionBossKillCount = 0;
    let pvpKillStreak = 0;
    let eggCreditStep = 0;
    let eggCreditTimer = 0;

    function isMainMenuVisible() {
      const menuMainEl = document.getElementById("menuMain");
      return menuEl.style.display !== "none" && menuMainEl && menuMainEl.style.display !== "none";
    }

    function tryEasterEggCredit(step) {
      if (!isMainMenuVisible()) return;
      const now = performance.now();
      if (step === 1) {
        eggCreditStep = 1;
        eggCreditTimer = now;
        return;
      }
      if (step === 2 && eggCreditStep === 1 && now - eggCreditTimer < 4000) {
        unlockAchievement("ultimate");
      }
      eggCreditStep = 0;
    }

    function persistUnlocks() {
      const data = {
        weaponUnlocked: {},
        totalKillCount,
        bossKillCount,
        devGunUnlocked: DEV_GUN_UNLOCKED,
        creatorUnlocked: CREATOR_UNLOCKED,
        achievementsUnlocked,
        equippedAchievementIds,
        totalTrainingDummyKills,
      };
      for (const [k, v] of Object.entries(weaponUnlocked)) {
        if (v) data.weaponUnlocked[k] = true;
      }
      localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(data));
    }

    function achName(def) {
      return tr(def.nameKey, def.nameKey);
    }

    function achHint(def) {
      if (def.secret) return tr("achSecret", "???");
      return tr(def.hintKey, "");
    }

    function getAchievementDef(id) {
      return ACHIEVEMENT_DEFS.find(a => a.id === id) || null;
    }

    function resetAchievementProgress() {
      for (const k of Object.keys(achievementsUnlocked)) delete achievementsUnlocked[k];
      equippedAchievementIds = [];
      totalTrainingDummyKills = 0;
      sessionKillCount = 0;
      sessionBossKillCount = 0;
      pvpKillStreak = 0;
    }

    function unlockAchievement(id) {
      if (achievementsUnlocked[id]) return;
      const def = getAchievementDef(id);
      if (!def) return;
      achievementsUnlocked[id] = true;
      persistUnlocks();
      showAchievementUnlockMsg(def);
    }

    /**
     * In-game unlock notification. Builds a styled box (medallion + name + OK
     * button) that slides in at the top of the screen, auto-dismisses after
     * ACH_TOAST_DURATION_MS, and queues if multiple unlock in quick succession
     * so they never overlap visually. Click the box (or the OK button) to
     * dismiss it immediately; clicking "Open" jumps to the achievements modal.
     */
    const ACH_TOAST_DURATION_MS = 3000;
    const _achToastQueue = [];
    let _achToastActive = false;
    function showAchievementUnlockMsg(def) {
      _achToastQueue.push(def);
      _drainAchToastQueue();
    }
    function _drainAchToastQueue() {
      if (_achToastActive) return;
      const def = _achToastQueue.shift();
      if (!def) return;
      _achToastActive = true;
      _renderAchToast(def, () => {
        _achToastActive = false;
        // After a brief gap so two toasts don't slam into each other visually.
        setTimeout(_drainAchToastQueue, 200);
      });
    }
    function _renderAchToast(def, onDone) {
      const wrap = document.getElementById("achToastWrap");
      if (!wrap) { onDone(); return; }
      const box = document.createElement("div");
      box.className = "ach-toast";
      box.style.setProperty("--ach-toast-color", def.color);

      // Medallion (reuses the inline icon helper, no separate glow).
      const med = document.createElement("div");
      med.className = "ach-medallion";
      med.style.setProperty("--ach-color",  def.color);
      med.style.setProperty("--ach-glow",   _achColorToGlow(def.color));
      med.style.setProperty("--ach-shadow", def.color + "99");
      med.style.width = "44px";
      med.style.height = "44px";
      const medSvg = document.createElement("div");
      medSvg.innerHTML = _achIconSvg(def.icon);
      med.appendChild(medSvg.firstChild);
      box.appendChild(med);

      const body = document.createElement("div");
      body.className = "ach-toast-body";
      const label = document.createElement("div");
      label.className = "ach-toast-label";
      label.textContent = tr("achUnlockMsg", "Achievement unlocked");
      const name = document.createElement("div");
      name.className = "ach-toast-name";
      name.textContent = achName(def);
      body.appendChild(label);
      body.appendChild(name);
      box.appendChild(body);

      const actions = document.createElement("div");
      actions.className = "ach-toast-actions";
      const okBtn = document.createElement("button");
      okBtn.type = "button";
      okBtn.className = "ach-toast-btn primary";
      okBtn.textContent = tr("achToastOk", "OK");
      actions.appendChild(okBtn);
      box.appendChild(actions);

      wrap.appendChild(box);

      let dismissed = false;
      let timer = setTimeout(dismiss, ACH_TOAST_DURATION_MS);
      function dismiss() {
        if (dismissed) return;
        dismissed = true;
        clearTimeout(timer);
        box.classList.add("dismissing");
        setTimeout(() => {
          if (box.parentNode) box.remove();
          onDone();
        }, 350);
      }
      // Any click on the box dismisses (the OK button also calls dismiss).
      box.addEventListener("click", dismiss);
    }

    function checkAchievements() {
      if (bossKillCount >= 1) unlockAchievement("what_is_this");
      if (sessionKillCount >= 200) unlockAchievement("monster_hunter");
      if (!MULTIPLAYER && isBossArenaMap(CURRENT_MAP) && sessionBossKillCount >= 3) {
        unlockAchievement("strong_one");
      }
      if (MULTIPLAYER && isBossArenaMap(CURRENT_MAP) && sessionBossKillCount >= 3) {
        unlockAchievement("elite_hunter");
      }
      if (totalTrainingDummyKills >= 1000) unlockAchievement("trainer");
      if (pvpKillStreak >= 5) unlockAchievement("pvp_weak");
      if (pvpKillStreak >= 10) unlockAchievement("pvp_hunter_king");
      if (pvpKillStreak >= 15) unlockAchievement("undefeated");
    }

    function checkHellAchievement() {
      if (BOSS_ROUND >= 4 || BOSS_HELL_MODE) unlockAchievement("light_liberator");
    }

    function registerPvpKill() {
      if (!MULTIPLAYER || ARENA_COOP || !isPvpCrossfireMap(CURRENT_MAP)) return;
      pvpKillStreak++;
      checkAchievements();
    }

    function resetPvpKillStreak() {
      pvpKillStreak = 0;
    }

    /** PvP solo: apply lethal hit to a remote player once and advance kill streak. */
    function applyPvpKillToVictim(rpVictim, hitPoint) {
      if (!rpVictim || rpVictim.isDown) return false;
      if (!MULTIPLAYER || ARENA_COOP || !isPvpCrossfireMap(CURRENT_MAP)) return false;
      rpVictim.isDown = true;
      rpVictim.downAt = performance.now();
      rpVictim.hpEstimate = 0;
      if (rpVictim.group) {
        spawnHumanoidDissolve(rpVictim.group, hitPoint);
        rpVictim.group.visible = false;
      }
      state.score += 1;
      registerPvpKill();
      return true;
    }

    function equipAchievement(id) {
      if (!id) {
        equippedAchievementIds = [];
        persistUnlocks();
        return;
      }
      if (!achievementsUnlocked[id]) return;
      const _idx = equippedAchievementIds.indexOf(id);
      if (_idx >= 0) {
        equippedAchievementIds.splice(_idx, 1);
      } else if (equippedAchievementIds.length < 5) {
        equippedAchievementIds.push(id);
      }
      persistUnlocks();
    }

    /**
     * Inline SVG glyphs for the achievement medallion. Returned as a string
     * that goes inside the medallion circle; stroked white so it reads on any
     * colored backdrop (the card sets the medallion's color via CSS vars).
     */
    function _achIconSvg(name) {
      switch (name) {
        case "skull":
          return '<svg viewBox="0 0 24 24"><path d="M5 11a7 7 0 1 1 14 0v3l-2 2v3h-2v-2h-6v2H7v-3l-2-2z"/><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>';
        case "sword":
          return '<svg viewBox="0 0 24 24"><path d="M14.5 4.5l5 5-9 9-2.5-2.5z"/><path d="M5 19l3-3"/><path d="M3 21l4-4"/></svg>';
        case "sun":
          return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>';
        case "target":
          return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>';
        case "crosshair":
          return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>';
        case "crown":
          return '<svg viewBox="0 0 24 24"><path d="M3 18h18M3 18l3-9 5 5 1-7 1 7 5-5 3 9"/></svg>';
        case "trophy":
          return '<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 5H3a3 3 0 0 0 3 3M19 5h2a3 3 0 0 1-3 3"/><path d="M9 14h6v3H9zM8 20h8"/></svg>';
        case "key":
          return '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M17 12v4M21 12v3"/></svg>';
        case "question":
        default:
          return '<svg viewBox="0 0 24 24"><path d="M9 9a3 3 0 1 1 5 2c-1 1-2 1.5-2 3M12 17h.01"/></svg>';
      }
    }

    /**
     * Live progress per achievement id. Returns {current, target, ratio} or
     * null if the achievement has no measurable progress (binary unlocks,
     * secret achievements, etc.).
     */
    function getAchievementProgress(id) {
      switch (id) {
        case "monster_hunter":  return { current: sessionKillCount,    target: 200 };
        case "strong_one":      return { current: sessionBossKillCount, target: 3   };
        case "elite_hunter":    return { current: sessionBossKillCount, target: 3   };
        case "light_liberator": return { current: bossKillCount,        target: 1   };
        case "trainer":         return { current: totalTrainingDummyKills, target: 1000 };
        case "pvp_weak":        return { current: pvpKillStreak,        target: 5   };
        case "pvp_hunter_king": return { current: pvpKillStreak,        target: 10  };
        case "undefeated":      return { current: pvpKillStreak,        target: 15  };
        default: return null;
      }
    }

    let _achActiveId = null;     // which card is currently selected (for .active styling + detail)
    let _achFilter = "all";      // "all" | "unlocked" | "locked"

    function _achColorToGlow(hex) {
      // Lighten a hex color by ~40% for the medallion's inner highlight. Falls
      // back to a warm yellow if parsing fails.
      try {
        const h = hex.replace("#", "");
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const lr = Math.min(255, r + Math.round((255 - r) * 0.55));
        const lg = Math.min(255, g + Math.round((255 - g) * 0.55));
        const lb = Math.min(255, b + Math.round((255 - b) * 0.55));
        return `rgb(${lr},${lg},${lb})`;
      } catch (_) { return "#fff7c2"; }
    }

    function _achIsVisible(def) {
      const unlocked = !!achievementsUnlocked[def.id];
      if (_achFilter === "unlocked") return unlocked;
      if (_achFilter === "locked")   return !unlocked;
      return true;
    }

    function _achCategoryOrder() {
      // Render in this order; "secret" goes last.
      return ["combat", "pvp", "progression", "secret"];
    }

    function renderAchievementsPanel() {
      const listEl = document.getElementById("achList");
      const detailEl = document.getElementById("achDetail");
      if (!listEl) return;
      if (detailEl) detailEl.style.display = "none";
      listEl.innerHTML = "";
      _achActiveId = null;

      // ── Filter tabs ──
      const filterRow = document.createElement("div");
      filterRow.className = "ach-filters";
      filterRow.style.gridColumn = "1 / -1";
      const counts = {
        all: ACHIEVEMENT_DEFS.length,
        unlocked: ACHIEVEMENT_DEFS.filter(d => achievementsUnlocked[d.id]).length,
        locked: ACHIEVEMENT_DEFS.filter(d => !achievementsUnlocked[d.id]).length,
      };
      const filters = [
        { key: "all",      label: tr("achFilterAll", "All") },
        { key: "unlocked", label: tr("achFilterUnlocked", "Unlocked") },
        { key: "locked",   label: tr("achFilterLocked", "Locked") },
      ];
      for (const f of filters) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ach-filter" + (_achFilter === f.key ? " active" : "");
        b.innerHTML = `${f.label}<span class="count">${counts[f.key]}</span>`;
        b.addEventListener("click", () => {
          _achFilter = f.key;
          renderAchievementsPanel();
        });
        filterRow.appendChild(b);
      }
      listEl.appendChild(filterRow);

      // ── Cards grouped by category ──
      const categoryLabels = {
        combat:      tr("achCatCombat", "Combat"),
        pvp:         tr("achCatPvp", "PVP"),
        progression: tr("achCatProgression", "Progression"),
        secret:      tr("achCatSecret", "Secret"),
      };
      for (const cat of _achCategoryOrder()) {
        const inCat = ACHIEVEMENT_DEFS.filter(d => d.category === cat && _achIsVisible(d));
        if (inCat.length === 0) continue;
        const title = document.createElement("div");
        title.className = "ach-section-title";
        title.textContent = categoryLabels[cat] || cat;
        listEl.appendChild(title);
        for (const def of inCat) {
          listEl.appendChild(_buildAchievementCard(def));
        }
      }
    }

    function _buildAchievementCard(def) {
      const unlocked = !!achievementsUnlocked[def.id];
      const equipped = equippedAchievementIds.includes(def.id);
      const isSecretLocked = !unlocked && !!def.secret;
      const isLocked = !unlocked;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "ach-card";
      card.dataset.id = def.id;
      if (unlocked)  card.classList.add("unlocked");
      if (equipped)  card.classList.add("equipped");
      if (isSecretLocked) card.classList.add("secret-locked");
      else if (isLocked)  card.classList.add("locked");
      if (_achActiveId === def.id) card.classList.add("active");

      // Medallion colors via CSS custom properties (avoids inline style soup).
      card.style.setProperty("--ach-color",  def.color);
      card.style.setProperty("--ach-glow",   _achColorToGlow(def.color));
      card.style.setProperty("--ach-shadow", def.color + "99"); // ~60% alpha

      const med = document.createElement("div");
      med.className = "ach-medallion";
      med.innerHTML = _achIconSvg(def.icon);
      if (unlocked) {
        const chk = document.createElement("div");
        chk.className = "ach-check";
        chk.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="5 12 10 17 19 8"/></svg>';
        med.appendChild(chk);
      }
      card.appendChild(med);

      const name = document.createElement("div");
      name.className = "ach-card-name";
      name.textContent = isSecretLocked ? "???" : achName(def);
      card.appendChild(name);

      const status = document.createElement("div");
      status.className = "ach-card-status";
      if (equipped)        status.textContent = tr("achEquipped", "Equipped");
      else if (unlocked)   status.textContent = tr("achUnlocked", "Unlocked");
      else if (isSecretLocked) status.textContent = tr("achSecret", "???");
      else                 status.textContent = tr("achLocked", "Locked");
      card.appendChild(status);

      // Progress bar (only when applicable and the achievement is not yet unlocked).
      const prog = getAchievementProgress(def.id);
      if (prog && !unlocked) {
        const ratio = Math.max(0, Math.min(1, prog.current / prog.target));
        const bar = document.createElement("div");
        bar.className = "ach-progress";
        const fill = document.createElement("div");
        fill.className = "ach-progress-fill";
        fill.style.width = (ratio * 100).toFixed(1) + "%";
        bar.appendChild(fill);
        card.appendChild(bar);
        const txt = document.createElement("div");
        txt.className = "ach-progress-text";
        txt.textContent = `${Math.min(prog.current, prog.target)} / ${prog.target}`;
        card.appendChild(txt);
      }

      card.addEventListener("click", () => showAchievementDetail(def.id));
      return card;
    }

    function showAchievementDetail(id) {
      const def = getAchievementDef(id);
      const detailEl = document.getElementById("achDetail");
      if (!def || !detailEl) return;

      // Mark the clicked card as active; clear other active markers.
      _achActiveId = id;
      for (const el of document.querySelectorAll(".ach-card.active")) el.classList.remove("active");

      // Rebuild the detail panel from scratch.
      detailEl.innerHTML = "";
      const unlocked = !!achievementsUnlocked[def.id];
      const equipped = equippedAchievementIds.includes(def.id);
      const isSecretLocked = !unlocked && !!def.secret;

      const top = document.createElement("div");
      top.className = "ach-detail-top";
      const med = document.createElement("div");
      med.className = "ach-medallion";
      med.style.setProperty("--ach-color",  def.color);
      med.style.setProperty("--ach-glow",   _achColorToGlow(def.color));
      med.style.setProperty("--ach-shadow", def.color + "99");
      med.innerHTML = _achIconSvg(def.icon);
      top.appendChild(med);

      const text = document.createElement("div");
      text.className = "ach-detail-text";
      const nameEl = document.createElement("div");
      nameEl.id = "achDetailName";
      nameEl.textContent = isSecretLocked ? "???" : achName(def);
      nameEl.style.color = unlocked ? def.color : (isSecretLocked ? "rgba(224,64,255,0.7)" : "#bbb");
      const statusEl = document.createElement("div");
      statusEl.id = "achDetailStatus";
      if (equipped) {
        statusEl.textContent = tr("achEquipped", "Equipped") + " (" + equippedAchievementIds.length + "/5)";
        statusEl.style.color = "#4fd1ff";
      } else if (unlocked) {
        statusEl.textContent = tr("achUnlocked", "Unlocked");
        statusEl.style.color = "#88dd88";
      } else if (isSecretLocked) {
        statusEl.textContent = tr("achSecret", "???");
        statusEl.style.color = "#e040ff";
      } else {
        statusEl.textContent = tr("achLocked", "Locked");
        statusEl.style.color = "#aaa";
      }
      text.appendChild(nameEl);
      text.appendChild(statusEl);
      top.appendChild(text);
      detailEl.appendChild(top);

      const hintEl = document.createElement("div");
      hintEl.id = "achDetailHint";
      hintEl.textContent = isSecretLocked
        ? tr("achSecretHint", "A hidden achievement. Find the secret to unlock it.")
        : `${tr("achUnlockHow", "How to unlock:")} ${achHint(def)}`;
      detailEl.appendChild(hintEl);

      // Progress bar in the detail panel (always when measurable, even when unlocked).
      const prog = getAchievementProgress(def.id);
      if (prog) {
        const wrap = document.createElement("div");
        wrap.className = "ach-detail-progress";
        const bar = document.createElement("div");
        bar.className = "ach-progress";
        const fill = document.createElement("div");
        fill.className = "ach-progress-fill";
        const ratio = Math.max(0, Math.min(1, prog.current / prog.target));
        fill.style.width = (ratio * 100).toFixed(1) + "%";
        bar.appendChild(fill);
        wrap.appendChild(bar);
        const txt = document.createElement("div");
        txt.className = "ach-progress-text";
        txt.textContent = `${Math.min(prog.current, prog.target)} / ${prog.target}`;
        wrap.appendChild(txt);
        detailEl.appendChild(wrap);
      }

      const actionsEl = document.createElement("div");
      actionsEl.id = "achDetailActions";
      if (unlocked) {
        if (equipped) {
          const unequipBtn = document.createElement("button");
          unequipBtn.type = "button";
          unequipBtn.className = "settings-action-btn";
          unequipBtn.textContent = tr("achUnequip", "Remove");
          unequipBtn.addEventListener("click", () => {
            equipAchievement(def.id);
            renderAchievementsPanel();
            showAchievementDetail(def.id);
          });
          actionsEl.appendChild(unequipBtn);
        } else {
          const _isFull = equippedAchievementIds.length >= 5;
          const equipBtn = document.createElement("button");
          equipBtn.type = "button";
          equipBtn.className = "settings-action-btn";
          equipBtn.textContent = _isFull ? tr("achSlotsFull", "Full (5/5)") : tr("achEquip", "Equip");
          equipBtn.disabled = _isFull;
          equipBtn.addEventListener("click", () => {
            equipAchievement(def.id);
            renderAchievementsPanel();
            showAchievementDetail(def.id);
          });
          actionsEl.appendChild(equipBtn);
        }
      }
      detailEl.appendChild(actionsEl);

      detailEl.style.display = "block";

      // Apply the .active class to the card whose data-id matches.
      // We tagged cards with data-id in _buildAchievementCard; toggle it now.
      for (const el of document.querySelectorAll(`.ach-card[data-id="${def.id}"]`)) {
        el.classList.add("active");
      }
    }

    function deleteAllGameData() {
      localStorage.removeItem(UNLOCK_STORAGE_KEY);
      resetUnlockProgress();
      resetAchievementProgress();
      updateQuestHud();
      updateHud();
      renderAchievementsPanel();
    }

    async function tryCreatorUnlock() {
      if (CREATOR_UNLOCKED) {
        alert(tr("creatorAlreadyUnlocked", "Creator mode is already unlocked."));
        return;
      }
      const pw = prompt(tr("creatorPromptPassword", "Enter creator password:"));
      if (pw === null) return;
      // 密码使用 SHA-256 哈希校验，明文不存储在源码中
      let pwHash = "";
      try {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
        pwHash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      } catch (_) {}
      if (pwHash !== "d3a5eaa0bf51412aedd3c7c3a801c1853f512353f5fb1b996066c93af1078330") {
        alert(tr("creatorWrongPassword", "Wrong password."));
        return;
      }
      CREATOR_UNLOCKED = true;
      unlockAllWeapons();
      unlockAchievement("creator");
      persistUnlocks();
      updateQuestHud();
      updateHud();
      alert(tr("creatorUnlockedMsg", "Creator mode unlocked. All weapons available."));
    }

    loadUnlocks();
    loadLoadout();
    loadArmor();

    const WEAPON_UNLOCK_TABLE = [
      { idx: 2, kills: 10, bossKills: 0, label: "霰弹枪 (Shotgun)" },
      { idx: 3, kills: 20, bossKills: 0, label: "冲锋枪 (SMG)" },
      { idx: 1, kills: 30, bossKills: 0, label: "突击步枪 (AR)" },
      { idx: 5, kills: 0, bossKills: 1, label: "反器材狙击枪 (AMR)" },
      { idx: 6, kills: 0, bossKills: 2, label: "麻醉针 (Paralysis Dart)" },
    ];

    /** Unlock ladder removed — every gun is available from the start. No-op so the kill /
     *  boss handlers that call it need no changes. */
    function checkWeaponUnlocks() {}

    function showWeaponUnlockMsg(label) {
      const msg = document.createElement("div");
      msg.style.cssText = "position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);font-size:32px;font-weight:900;color:#4fd1ff;text-shadow:0 0 20px rgba(79,209,255,0.8),0 0 40px rgba(79,209,255,0.4);letter-spacing:3px;z-index:9999;pointer-events:none;opacity:0;animation:bossVicFadeIn 1s ease forwards;white-space:nowrap;";
      msg.textContent = `解锁武器: ${label}`;
      document.body.appendChild(msg);
      setTimeout(() => {
        msg.style.animation = "bossVicFadeOut 1.5s ease forwards";
        setTimeout(() => { if (msg.parentNode) msg.remove(); }, 1600);
      }, 3000);
    }

    function trySelectWeapon(idx) {
      // Peek the hotbar even when the slot is locked, so pressing a number always tells the
      // player what is in that slot and whether they own it yet.
      flashInvBar();
      if (weaponAvailable(idx)) {
        setWeapon(idx);
      } else if (weaponUnlocked[idx] && !weaponInLoadout(idx)) {
        showCombatFeedback(tr("loadoutNotPacked", "NOT IN YOUR BACKPACK"), "#ff9d3d", 0.3);
      }
    }

    function registerEnemyKill(enemy) {
      totalKillCount++;
      if (enemy.isBoss) {
        bossKillCount++;
        if (isBossArenaMap(CURRENT_MAP)) sessionBossKillCount++;
      } else if (!enemy.trainingDummy) {
        sessionKillCount++;
      }
      checkWeaponUnlocks();
      checkAchievements();
      persistUnlocks();
      updateQuestHud();
    }

    let questHudVisible = false;

    function toggleQuestHud() {
      questHudVisible = !questHudVisible;
      updateQuestHud();
    }

    function updateQuestHud() {
      const el = document.getElementById("questHud");
      if (!el) return;
      if (!questHudVisible || !gameWorldReady || !(isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP))) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";
      // The weapon-unlock checklist used to live here. With the ladder gone there is
      // nothing to track, so the quest HUD stays hidden instead of showing an empty box.
      el.style.display = "none";
      return;
      let html = "";
      el.innerHTML = html;
    }

    function weaponSoundSkin() {
      const w = weapons[state.weaponIndex];
      return w && w.soundSkin ? w.soundSkin : "revengeClassic";
    }

    function weapon() {
      return weapons[state.weaponIndex];
    }

    /** ADS fully ready threshold: AMR matches scope snap; other guns ~full animation. */
    function adsReadyProgressForWeapon(wi) {
      return wi === 5 ? 0.94 : 0.98;
    }

    let _lastHudHtml = "";

    function updateHud() {
      const w = weapon();
      const bossRoundInfo = CURRENT_MAP === "boss_arena" ? ` [Round ${BOSS_ROUND}]` : "";
      const mapLabel =
        CURRENT_MAP === "boss_arena"
          ? `${tr("mapBossArena", "BOSS FIGHT — Boss")}${bossRoundInfo}`
          : CURRENT_MAP === "arena"
          ? tr("mapArena", "zombie arena")
          : isTrainingMap(CURRENT_MAP)
            ? tr("mapTraining", "training camp")
            : CURRENT_MAP === "crossfire_grid"
              ? tr("mapPvpGrid", "PVP - grid map")
              : isPvpCrossfireMap(CURRENT_MAP)
                ? tr("mapPvpClassic", "PVP - classic")
                : CURRENT_MAP;
      // v91: HUD strings routed through tr() with English fallback baked in. Add a `hud*` key to
      // translation.js for each locale you want; missing keys harmlessly fall back to English.
      // Control lines are generated from the LIVE bindings and the LIVE hotbar order, so
      // rebinding a key in Settings → Controls or dragging the hotbar around keeps the HUD
      // honest instead of showing the stale hard-coded defaults it used to.
      const K = (action) => `<b style="color:#8fd8ff;">${codeToLabel(kbCode(action))}</b>`;
      const hudHelpMove = `${tr("hudLblMove", "Move")} ${K("moveForward")}${K("moveLeft")}${K("moveBack")}${K("moveRight")}` +
        ` · ${tr("hudLblJump", "Jump")} ${K("jump")}` +
        ` · ${tr("hudLblCrouch", "Crouch")} ${K("crouch")}` +
        ` · ${tr("hudLblDash", "Dash")} ${K("dash")}`;
      const hudHelpAim = `${tr("hudLblFire", "Fire")} <b style="color:#8fd8ff;">LMB</b>/${K("fire")}` +
        ` · ${tr("hudLblAim", "Aim")} <b style="color:#8fd8ff;">RMB</b>/${K("aim")}` +
        ` · ${tr("hudLblReload", "Reload")} ${K("reload")}` +
        ` · ${tr("hudLblHeal", "Heal")} ${K("heal")}`;
      const hudHelpGear = `${tr("hudLblGear", "Gear")}: ${K("speedNeedle")} ${tr("needleName", "Speed Needle")}` +
        ` · ${K("jetHarness")} ${tr("jetName", "Jet Harness")} <span style="opacity:0.7;">(${tr("hudJetHint", "then dash to fly — mind the drop")})</span>`;
      const hudHelpMisc = `${tr("hudLblLight", "Light")} ${K("flashlight")}` +
        ` · ${tr("hudLblBeam", "Beam")} ${K("flashBeam")}` +
        ` · ${tr("hudLblChat", "Chat")} ${K("chat")}` +
        ` · ${tr("hudLblQuests", "Quests")} ${K("questHud")}` +
        ` · ${tr("hudLblPause", "Pause")} <b style="color:#8fd8ff;">Esc</b>`;
      const hudHelpWeapons = (() => {
        // Loadout matches list exactly what you packed; the training range still lists the
        // whole armoury with its lock markers. The hidden gun is never printed here.
        const parts = activeHotbarSlots().map(({ key, widx }) => {
          const owned = weaponUnlocked[widx];
          const keyEl = `<b style="color:${owned ? "#8fd8ff" : "#6b7280"};">${key || "?"}</b>`;
          const nm = owned
            ? weaponDisplayName(widx)
            : `<span style="color:#6b7280;">${weaponDisplayName(widx)} 🔒</span>`;
          return `${keyEl} ${nm}`;
        });
        const label = activeLoadout
          ? tr("hudLblBackpack", "Backpack")
          : tr("hudLblWeapons", "Weapons");
        return `${label}: ${parts.join(" · ")}`;
      })();
      const hudMpTag      = tr("hudMpTag",      " (MP)");
      const hudMapLabel   = tr("hudMap",        "Map");
      const hudWeaponLbl  = tr("hudWeapon",     "Weapon");
      const hudHealthLbl  = tr("hudHealth",     "Health");
      const hudScoreLbl   = tr("hudScore",      "Score");
      const hudBulletsLbl = tr("hudBullets",    "Bullets");
      const hudRefilling  = tr("hudRefilling",  "Refilling...");
      const hudRoomLbl    = tr("hudRoom",       "Room");
      const roomLineTr    = (MULTIPLAYER && ROOM_CODE) ? `<b style="color:#4fd1ff;">${hudRoomLbl}: ${ROOM_CODE}</b><br>` : "";
      let weaponLine;
      if (state.weaponIndex === 4) {
        const useWord = w.ammo === 1 ? tr("hudUse", "use") : tr("hudUses", "uses");
        const state4 = player.health >= player.maxHealth
          ? ` (${tr("hudHealthFull", "health full")})`
          : w.ammo <= 0
            ? ` (${tr("hudUsedUp", "used up")})`
            : state.medKitNeedsRelease
              ? ` (${tr("hudReleaseKey", "release key/mouse")})`
              : "";
        const medDur = Math.round(getMedKitHealDuration());
        weaponLine = `${tr("hudMedKit", "Med Kit")}: ${w.ammo} ${useWord} — ${tr("hudMedKitHold", "hold <b>F</b> or <b>LMB</b> {d}s (+50 HP)").replace("{d}", medDur)}${state4}<br>`;
      } else if (state.weaponIndex === 7) {
        weaponLine = `${tr("hudMeleeLine", "Melee: front 2-hit kill | <b>backstab 1-hit kill</b>")}<br>`;
      } else if (state.weaponIndex === 8) {
        weaponLine = `<b style="color:#ffd700;">∞ | 7500</b><br>`;
      } else {
        weaponLine = `${hudBulletsLbl}: ${w.ammo} / ${w.magSize}${state.reloading ? `（${hudRefilling}）` : ""}<br>`;
      }
      const hudHtml = `
        ${roomLineTr}
        ${tr("hudGameTitleLine", "Zone No Light")}<br>
        ${hudHelpMove}<br>
        ${hudHelpAim}<br>
        ${hudHelpGear}<br>
        ${hudHelpMisc}<br>
        ${hudHelpWeapons}<br>
${hudMapLabel}: ${mapLabel}${MULTIPLAYER ? hudMpTag : ""}<br>
        ${hudWeaponLbl}: ${weaponDisplayName(state.weaponIndex)}<br>
        ${weaponLine}
        ${hudHealthLbl}: ${Math.max(0, Math.floor(player.health))} / ${player.maxHealth}<br>
        ${(armorHelmet || armorVest)
          ? `<span style="color:#7ec8ff;">${tr("hudArmor", "Armour")}: ${myHelmet().name} / ${myVest().name} — ${tr("hudArmorHead", "head")} −${(myHelmet().mit * 100) | 0}% · ${tr("hudArmorBody", "body")} −${(myVest().mit * 100) | 0}%</span><br>`
          : ""}
        ${isTrainingMap(CURRENT_MAP) ? "" : `${hudScoreLbl}: ${state.score}`}
        ${isGauntletMap(CURRENT_MAP) && gauntletCourse ? `<br><b style="color:#62ffb0;">${
          tr("hudGauntletLevel", "GAUNTLET {n}/{m}")
            .replace("{n}", String(gauntletLevel)).replace("{m}", String(GAUNTLET_LEVEL_COUNT))
        } — ${tr("hudGauntletGoal", "REACH THE EXIT")}</b> <span style="opacity:0.8;">(${
          Math.max(0, Math.round(player.position.z - gauntletCourse.finishZ))
        }m)</span>` : ""}
      `;
      // Avoid rewriting the HUD DOM when the rendered string is unchanged (the common case).
      if (hudHtml !== _lastHudHtml) {
        _lastHudHtml = hudHtml;
        hud.innerHTML = hudHtml;
      }
      refreshFpsHelpForMap();
    }

    /** Bright duel map: override corner FPS hints; other maps use applyLanguageUI / defaults. */
    function refreshFpsHelpForMap() {
      const elL = document.getElementById("fpsHintFlash");
      const elZ = document.getElementById("fpsHintZoom");
      if (!elL || !elZ) return;
      const inGame = gameWorldReady && menuEl && menuEl.style.display === "none";
      if (isBrightIndoorMap(CURRENT_MAP) && inGame) {
        elL.textContent = tr("hudBrightDuel", "Bright duel map — flashlight stays off");
        elZ.style.display = "none";
      } else {
        elZ.style.display = "";
        elL.textContent = tr("hudHelpLight", elL.textContent);
        elZ.textContent = tr("hudHelpZoom", elZ.textContent);
      }
    }
    updateHud();

    const _playerWallSphere = new THREE.Sphere();
    /** chunkKey -> Box3[] for arena maze walls — lets collision test only the nearby chunk ring. */
    const mazeWallBoxBuckets = new Map();

    function forEachNearbyWallBox(x, z, cb) {
      if (CURRENT_MAP !== "arena" || !mazeWallBoxBuckets.size) {
        for (const box of wallBoxes) cb(box);
        return;
      }
      const ccx = Math.floor(x / MAZE_CHUNK_WORLD);
      const ccz = Math.floor(z / MAZE_CHUNK_WORLD);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const b = mazeWallBoxBuckets.get(`${ccx + dx},${ccz + dz}`);
          if (b) for (const box of b) cb(box);
        }
      }
    }

    /**
     * Footprint test shared by the stand-on-top collision exemption AND the landing check.
     *
     * These two used to disagree: the exemption allowed the centre to be 0.17 OUTSIDE the
     * box, while landing required it 0.05 INSIDE. That left a 0.22-wide ring around every
     * ledge where the player was no longer held up but was still inside the box footprint —
     * so they dropped, lost the exemption the moment their feet went below the top face, and
     * the 0.34 collision sphere was then sitting inside solid geometry with every direction
     * blocked. That is the "walk to the edge of a wall you flew onto and get stuck inside it"
     * bug. Both callers now use this one region, so anywhere you are exempt you are also
     * supported and the dead zone cannot exist.
     */
    function centreOverBoxTop(box, cx, cz) {
      // Gauntlet floor slabs use a wider skirt. A floor is built from many boxes laid end to
      // end, and with the narrow 0.17 skirt the player's 0.34 collision sphere hit the SIDE
      // FACE of the next slab before their centre was over it — every seam between two
      // platforms became an invisible wall and the course was impassable. A skirt of
      // radius+0.06 means you become exempt exactly as the sphere first touches.
      // Both the exemption and the landing check call this one function, so widening it here
      // keeps the v9 invariant intact: anywhere you are exempt, you are also supported.
      const m = box.wideTop ? player.radius + 0.06 : player.radius * 0.5; // 0.40 / 0.17
      return (
        cx > box.min.x - m && cx < box.max.x + m &&
        cz > box.min.z - m && cz < box.max.z + m
      );
    }

    const _unstickProbe = new THREE.Vector3();

    /**
     * Safety net: if the player is already inside solid geometry, walk them out.
     * Tries rings of increasing radius at the current height, then — if they are genuinely
     * buried — lifts them onto the top of the box they are stuck in. Without this the only
     * escape was to use the jet harness again.
     */
    function unstickFromWalls() {
      if (!collidesWithWalls(player.position)) return false;
      for (let dist = 0.12; dist <= 3.0; dist += 0.12) {
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          _unstickProbe.set(
            player.position.x + Math.cos(a) * dist,
            player.position.y,
            player.position.z + Math.sin(a) * dist
          );
          if (!collidesWithWalls(_unstickProbe)) {
            player.position.x = _unstickProbe.x;
            player.position.z = _unstickProbe.z;
            return true;
          }
        }
      }
      // Fully enclosed at this height — stand on whatever we are inside of.
      let topY = null;
      forEachNearbyWallBox(player.position.x, player.position.z, (box) => {
        if (!centreOverBoxTop(box, player.position.x, player.position.z)) return;
        if (topY === null || box.max.y > topY) topY = box.max.y;
      });
      if (topY !== null) {
        player.position.y = topY + 1.65;
        player.velocityY = 0;
        player.onGround = true;
        player.fallApexY = null; // don't bill the player for a fall they never took
        return true;
      }
      return false;
    }

    function collidesWithWalls(pos) {
      _playerWallSphere.radius = player.radius;
      const pBottom = player.position.y - 1.65;
      // Head height must follow the crouch, otherwise crouching is cosmetic: a slab you
      // can duck under visually would still stop you, because pTop stayed at the standing
      // eye. This is what makes "crouch to get through" a real mechanic.
      const pTop = player.position.y - CROUCH_EYE_DROP * crouchAmt;
      let hit = false;
      forEachNearbyWallBox(pos.x, pos.z, (box) => {
        if (hit || box.enemyOnly) return;
        // Skip if feet are clearly above this box (stepped / jumped over it)
        if (pBottom > box.max.y + 0.02 || pTop < box.min.y) return;
        // If feet are at or near box top, check whether the player is currently
        // standing ON this box (current x-z within footprint). If so, skip
        // horizontal collision — they're on top and must be free to walk.
        // If they're beside the box at the same height, fall through to sphere test.
        if (pBottom >= box.max.y - 0.02) {
          if (centreOverBoxTop(box, player.position.x, player.position.z)) return;
        }
        _playerWallSphere.center.set(pos.x, (box.min.y + box.max.y) * 0.5, pos.z);
        if (box.intersectsSphere(_playerWallSphere)) hit = true;
      });
      return hit;
    }

    /**
     * Vertical companion to resolveWallSliding, which is horizontal-only.
     * Clamps a climb so the player's head does not enter the underside of solid cover, and
     * a descent so they do not sink through the floor. Returns the resolved eye Y.
     */
    /**
     * Eye Y of the implicit floor-everywhere. Every map except the gauntlet has solid
     * ground at 0, which is why pits were impossible; the gauntlet pushes it far below the
     * course so the only real support is a platform top.
     */
    function worldFloorEyeY() {
      return isGauntletMap(CURRENT_MAP) ? GAUNTLET_FLOOR_EYE_Y : 1.65;
    }

    function resolveVerticalStep(fromY, stepY) {
      let toY = fromY + stepY;
      const floorY = worldFloorEyeY();
      if (toY <= floorY) return floorY;
      if (stepY <= 0) return toY;
      const px = player.position.x;
      const pz = player.position.z;
      const r = player.radius;
      forEachNearbyWallBox(px, pz, (box) => {
        if (box.enemyOnly) return;
        // Only boxes we actually stand under matter.
        if (px < box.min.x - r || px > box.max.x + r) return;
        if (pz < box.min.z - r || pz > box.max.z + r) return;
        // Underside of a box that is above our head now but below where we are heading.
        if (box.min.y >= fromY - CROUCH_EYE_DROP * crouchAmt && box.min.y < toY) toY = box.min.y;
      });
      return toY;
    }

    function resolveWallSliding(nextPos) {
      // v91: corner re-check only — NO substepping. Substepping shortens effective frame motion
      // and makes wall-hug dodges feel sluggish, getting you shot more.
      //
      // The real bug: independent X / Z axis tests can both be "clear" yet the combined {newX, newZ}
      // lands inside an outside corner of a wall. Solution: after the two single-axis tests, re-test
      // the combined position; if still collided, keep only whichever single axis is clear.
      const result = player.position.clone();

      const tryX = result.clone();
      tryX.x = nextPos.x;
      const xClear = !collidesWithWalls(tryX);
      if (xClear) result.x = tryX.x;

      const tryZ = result.clone();
      tryZ.z = nextPos.z;
      const zClear = !collidesWithWalls(tryZ);
      if (zClear) result.z = tryZ.z;

      if (xClear && zClear && collidesWithWalls(result)) {
        const onlyX = player.position.clone(); onlyX.x = nextPos.x;
        if (!collidesWithWalls(onlyX)) return onlyX;
        const onlyZ = player.position.clone(); onlyZ.z = nextPos.z;
        if (!collidesWithWalls(onlyZ)) return onlyZ;
        return player.position.clone();
      }
      return result;
    }

    function dampScalar(cur, tgt, dt, lambda = 14) {
      return cur + (tgt - cur) * (1 - Math.exp(-lambda * dt));
    }

    function dampAngle(cur, tgt, dt, lambda = 14) {
      let d = tgt - cur;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      return cur + d * (1 - Math.exp(-lambda * dt));
    }

    function makeZombie(x, z, type = "normal") {
      const root = new THREE.Group();
      const torsoRoot = new THREE.Group();
      const leftArmRoot = new THREE.Group();
      const rightArmRoot = new THREE.Group();
      const leftLegRoot = new THREE.Group();
      const rightLegRoot = new THREE.Group();

      let skinColor = 0x6b8f5e;
      let skinDark = 0x4a6b3e;
      let shirtColor = 0x4a5a3e;
      let pantsColor = 0x3a3a2e;
      let woundColor = 0x8b3a3a;
      let eyeColor = 0xe8e830;
      let hp = 100;
      let speed = 1.75;
      let attackDamage = 8;
      let attackCooldown = 0.42;
      let ranged = false;
      let rangeDistance = 12;

      if (type === "fast") {
        skinColor = 0xb8a848; skinDark = 0x8a7b22; shirtColor = 0x6b6020;
        pantsColor = 0x4a4520; woundColor = 0xa04040; eyeColor = 0xff4444;
        hp = 70; speed = 7.4; attackDamage = 9; attackCooldown = 0.18;
      } else if (type === "gunner") {
        skinColor = 0xb07070; skinDark = 0x7a3f3f; shirtColor = 0x5a2a2a;
        pantsColor = 0x3a2525; woundColor = 0xcc3333; eyeColor = 0xff6666;
        hp = 75; speed = 1.10; attackDamage = 4; attackCooldown = 1.6;
        ranged = true; rangeDistance = 16;
      } else if (type === "tank") {
        skinColor = 0x6888a0; skinDark = 0x3f5367; shirtColor = 0x384858;
        pantsColor = 0x2a3540; woundColor = 0x6a4444; eyeColor = 0x80c0ff;
        hp = 180; speed = 1.05; attackDamage = 14; attackCooldown = 0.70;
      }

      const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.95, metalness: 0 });
      const matSkinD = new THREE.MeshStandardMaterial({ color: skinDark, roughness: 0.95, metalness: 0 });
      const matShirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.96, metalness: 0 });
      const matPants = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.96, metalness: 0 });
      const matWound = new THREE.MeshStandardMaterial({ color: woundColor, roughness: 0.94, metalness: 0 });
      const matBone = new THREE.MeshStandardMaterial({ color: 0xd4c8a8, roughness: 0.94, metalness: 0 });
      const matBlood = new THREE.MeshStandardMaterial({ color: 0x551111, roughness: 0.93, metalness: 0 });

      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.56, 0.34), matShirt);
      chest.position.y = 1.22; torsoRoot.add(chest);
      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.32, 0.32), matShirt);
      belly.position.y = 0.84; torsoRoot.add(belly);
      const ribWound = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.16, 0.05), matWound);
      ribWound.position.set(0.14, 1.12, 0.18); torsoRoot.add(ribWound);
      const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.03), matBone);
      rib1.position.set(0.14, 1.16, 0.20); torsoRoot.add(rib1);
      const rib2 = rib1.clone(); rib2.position.y = 1.10; torsoRoot.add(rib2);
      const tearL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), matSkin);
      tearL.position.set(-0.24, 0.94, 0.18); torsoRoot.add(tearL);
      const bloodStain = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.04), matBlood);
      bloodStain.position.set(-0.10, 0.88, 0.18); torsoRoot.add(bloodStain);
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.28), matShirt);
      collar.position.set(0, 1.52, 0); torsoRoot.add(collar);
      const collarTear = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 0.06), matSkin);
      collarTear.position.set(0.18, 1.52, 0.12); torsoRoot.add(collarTear);

      if (type === "tank") {
        const armorMat = new THREE.MeshStandardMaterial({ color: 0x505e6e, roughness: 0.9, metalness: 0.08 });
        const armorF = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.08), armorMat);
        armorF.position.set(0, 1.22, 0.20); torsoRoot.add(armorF);
        const armorB = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.06), armorMat);
        armorB.position.set(0, 1.22, -0.18); torsoRoot.add(armorB);
        const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.26), armorMat);
        shoulderL.position.set(-0.50, 1.46, 0); torsoRoot.add(shoulderL);
        const shoulderR = shoulderL.clone(); shoulderR.position.x = 0.50; torsoRoot.add(shoulderR);
        const spikeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), armorMat);
        spikeL.position.set(-0.50, 1.56, 0); torsoRoot.add(spikeL);
        const spikeR = spikeL.clone(); spikeR.position.x = 0.50; torsoRoot.add(spikeR);
      }

      if (type === "gunner") {
        const bandolier = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.95, metalness: 0 });
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.50, 0.06), bandolier);
        strap.position.set(-0.18, 1.10, 0.14); strap.rotation.z = 0.3; torsoRoot.add(strap);
        for (let i = 0; i < 3; i++) {
          const shell = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), new THREE.MeshStandardMaterial({ color: 0xc0a040, roughness: 0.82, metalness: 0.12 }));
          shell.position.set(-0.18 + i * 0.05, 1.18 - i * 0.08, 0.18); torsoRoot.add(shell);
        }
      }

      const headGroup = new THREE.Group();
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.42), matSkin);
      headGroup.add(skull);
      const jawBone = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.32), matSkinD);
      jawBone.position.set(0, -0.24, 0.02); headGroup.add(jawBone);

      const eyeGlowMat = new THREE.MeshBasicMaterial({ color: eyeColor });
      const eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1, metalness: 0 });
      const sockL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.04), eyeSocketMat);
      sockL.position.set(-0.10, 0.06, 0.20); headGroup.add(sockL);
      const sockR = sockL.clone(); sockR.position.x = 0.10; headGroup.add(sockR);
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.05), eyeGlowMat);
      eyeL.position.set(-0.10, 0.06, 0.215); headGroup.add(eyeL);
      const eyeR = eyeL.clone(); eyeR.position.x = 0.10; headGroup.add(eyeR);
      // 2× eye glow: a real point light per eye so the face / gun / floor pick
      // up the color, not just a brighter pixel on the eye box itself.
      const eyeLightL = new THREE.PointLight(eyeColor, 2.5, 4);
      eyeLightL.position.set(-0.10, 0.06, 0.28); headGroup.add(eyeLightL);
      const eyeLightR = new THREE.PointLight(eyeColor, 2.5, 4);
      eyeLightR.position.set(0.10, 0.06, 0.28); headGroup.add(eyeLightR);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.08), matSkinD);
      brow.position.set(0, 0.15, 0.19); headGroup.add(brow);
      const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.10), matSkinD);
      cheekL.position.set(-0.20, -0.06, 0.14); headGroup.add(cheekL);
      const cheekR = cheekL.clone(); cheekR.position.x = 0.20; headGroup.add(cheekR);
      const mouthWound = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), matWound);
      mouthWound.position.set(0.03, -0.14, 0.21); headGroup.add(mouthWound);
      const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.03, 0.03), matBone);
      teeth.position.set(0, -0.18, 0.20); headGroup.add(teeth);
      const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), matSkinD);
      noseBridge.position.set(0, -0.02, 0.22); headGroup.add(noseBridge);

      const hairMat = new THREE.MeshStandardMaterial({ color: 0x25201d, roughness: 0.96, metalness: 0 });
      if (type !== "fast") {
        const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.28), hairMat);
        h1.position.set(0, 0.26, -0.06); headGroup.add(h1);
        const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.44), hairMat);
        h2.position.set(-0.14, 0.22, 0); headGroup.add(h2);
        if (type === "gunner") {
          const h3 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.44), hairMat);
          h3.position.set(0, 0.24, 0); headGroup.add(h3);
        }
      }
      if (type === "fast") {
        const scarTop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.20, 0.04), matWound);
        scarTop.position.set(0.08, 0.14, 0.21); headGroup.add(scarTop);
      }

      const earMat = matSkinD;
      const earL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.06), earMat);
      earL.position.set(-0.24, 0.02, 0); headGroup.add(earL);
      const earR = earL.clone(); earR.position.x = 0.24; headGroup.add(earR);

      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.20), matSkin);
      neck.position.set(0, -0.32, 0); headGroup.add(neck);
      const neckVein = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), matWound);
      neckVein.position.set(0.06, -0.30, 0.08); headGroup.add(neckVein);

      headGroup.position.y = 1.84; torsoRoot.add(headGroup);

      leftArmRoot.position.set(-0.48, 1.48, 0);
      rightArmRoot.position.set(0.48, 1.48, 0);
      const makeArm = (ar, side) => {
        const up = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.42, 0.19), matShirt);
        up.position.set(0, -0.22, 0); ar.add(up);
        const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.20), matShirt);
        sleeve.position.set(0, -0.04, 0); ar.add(sleeve);
        const fa = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.38, 0.17), matSkin);
        fa.position.set(0, -0.58, 0.06); ar.add(fa);
        if (side === "left" && type !== "fast") {
          const w = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.06), matWound);
          w.position.set(0.05, -0.50, 0.12); ar.add(w);
          const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.04), matBone);
          b.position.set(0.05, -0.48, 0.14); ar.add(b);
        }
        if (side === "right") {
          const scratch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.04), matWound);
          scratch.position.set(-0.06, -0.42, 0.10); ar.add(scratch);
        }
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.14, 0.18), matSkin);
        hand.position.set(0, -0.82, 0.12); ar.add(hand);
        const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), matSkinD);
        f1.position.set(-0.04, -0.92, 0.16); ar.add(f1);
        const f2 = f1.clone(); f2.position.x = 0; ar.add(f2);
        const f3 = f1.clone(); f3.position.x = 0.04; ar.add(f3);
        const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), matSkinD);
        thumb.position.set(side === "left" ? 0.08 : -0.08, -0.86, 0.16); ar.add(thumb);
      };
      makeArm(leftArmRoot, "left"); makeArm(rightArmRoot, "right");

      leftLegRoot.position.set(-0.18, 0.62, 0);
      rightLegRoot.position.set(0.18, 0.62, 0);
      const makeLeg = (lr, side) => {
        const th = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.22), matPants);
        th.position.set(0, -0.22, 0); lr.add(th);
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.40, 0.20), matPants);
        sh.position.set(0, -0.60, 0); lr.add(sh);
        if (side === "right") {
          const tear = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.08), matSkin);
          tear.position.set(0, -0.68, 0.10); lr.add(tear);
          const kw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), matWound);
          kw.position.set(0, -0.40, 0.12); lr.add(kw);
        }
        if (side === "left") {
          const bloodDrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), matBlood);
          bloodDrip.position.set(0.06, -0.52, 0.10); lr.add(bloodDrip);
        }
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.28), matSkinD);
        foot.position.set(0, -0.86, 0.04); lr.add(foot);
        const toe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.06), matSkinD);
        toe.position.set(0, -0.88, 0.16); lr.add(toe);
      };
      makeLeg(leftLegRoot, "left"); makeLeg(rightLegRoot, "right");

      root.add(torsoRoot, leftArmRoot, rightArmRoot, leftLegRoot, rightLegRoot);
      const fy0 = Math.random() * Math.PI * 2;
      root.position.set(x, 0, z);
      chest.castShadow = true;
      belly.castShadow = true;
      skull.castShadow = true;
      root.traverse((o) => {
        if (!o.isMesh) return;
        o.receiveShadow = true;
        if (!o.castShadow) o.castShadow = false;
      });

      scene.add(root);

      const hpCanvas = document.createElement("canvas");
      hpCanvas.width = 128;
      hpCanvas.height = 24;
      const hpCtx = hpCanvas.getContext("2d");
      const hpTexture = new THREE.CanvasTexture(hpCanvas);
      const hpSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: hpTexture,
          transparent: true,
          depthTest: true,
          depthWrite: false
        })
      );
      hpSprite.scale.set(1.7, 0.32, 1);
      hpSprite.position.set(0, 2.75, 0);
      root.add(hpSprite);
      hpSprite.raycast = () => {};

      return {
        type,
        group: root,
        torsoRoot,
        leftArmRoot,
        rightArmRoot,
        leftLegRoot,
        rightLegRoot,
        hpCanvas,
        hpCtx,
        hpTexture,
        hpSprite,
        alive: true,
        hp,
        maxHp: hp,
        attackCooldownTimer: 0,
        attackCooldown,
        attackDamage,
        ranged,
        rangeDistance,
        respawnTimer: 0,
        spawn: new THREE.Vector3(x, 0, z),
        walkTime: Math.random() * 10,
        moving: false,
        attackPhase: 0,
        speed,
        aware: false,
        hiddenTimer: 0,
        facingYaw: fy0,
        visYaw: fy0,
        armLV: -0.2,
        armRV: -0.2,
        legLV: 0,
        legRV: 0,
        torsoBobYV: 0,
        torsoXV: 0,
        torsoZV: 0,
        torsoPitchV: 0,
        targetId: null,
        // Stagger initial retarget across [0, RETARGET_INTERVAL) so all 32 arena
        // zombies don't re-ray-cast LOS at the same frame every 2s — that burst
        // was the source of the periodic multi-frame stalls.
        retargetTimer: Math.random() * 2.0,
        moveYaw: 0,
        rangedLosAcquireTimer: 0
      };
    }

    function drawEnemyHp(enemy) {
      const ratio = Math.max(0, enemy.hp / enemy.maxHp);
      if (enemy._hpBarRatio === ratio) return;
      enemy._hpBarRatio = ratio;
      const ctx = enemy.hpCtx;
      const cw = enemy.hpCanvas.width;
      const bw = cw - 8;
      ctx.clearRect(0, 0, cw, 24);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(4, 8, bw, 8);
      ctx.fillStyle = enemy.isBoss ? "#e040ff" : enemy.type === "tank" ? "#60a5fa" : (enemy.type === "gunner" ? "#f87171" : (enemy.type === "fast" ? "#facc15" : "#22c55e"));
      ctx.fillRect(4, 8, bw * Math.max(0, enemy.hp) / enemy.maxHp, 8);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 1;
      ctx.strokeRect(4, 8, bw, 8);
      enemy.hpTexture.needsUpdate = true;
    }

    function makeHormoneZombie(x, z, isHell) {
      const root = new THREE.Group();
      const torsoRoot = new THREE.Group();
      const leftArmRoot = new THREE.Group();
      const rightArmRoot = new THREE.Group();
      const leftForearmRoot = new THREE.Group();
      const rightForearmRoot = new THREE.Group();
      const leftLegRoot = new THREE.Group();
      const rightLegRoot = new THREE.Group();

      const skinColor = isHell ? 0x2a3a6a : 0x8a7098;
      const skinDark = isHell ? 0x1a2848 : 0x6a5078;
      const shirtColor = isHell ? 0x1a1a2a : 0x2a6050;
      const pantsColor = isHell ? 0x1a1a1a : 0x3a3a32;
      const veinColor = 0x9a2255;
      const eyeColor = 0xff0000;

      const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.92, metalness: 0 });
      const matSkinD = new THREE.MeshStandardMaterial({ color: skinDark, roughness: 0.92, metalness: 0 });
      const matShirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.96, metalness: 0 });
      const matPants = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.96, metalness: 0 });
      const matVein = new THREE.MeshStandardMaterial({ color: veinColor, roughness: 0.9, metalness: 0.1 });
      const matBone = new THREE.MeshStandardMaterial({ color: 0xd4c8a8, roughness: 0.94, metalness: 0 });

      const chest = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.70, 0.65), matShirt);
      chest.position.set(0, 1.55, 0.15);
      torsoRoot.add(chest);
      const pecL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.24), matSkin);
      pecL.position.set(-0.25, 1.48, 0.48);
      pecL.rotation.x = 0.30;
      torsoRoot.add(pecL);
      const pecR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.24), matSkin);
      pecR.position.set(0.25, 1.48, 0.48);
      pecR.rotation.x = 0.30;
      torsoRoot.add(pecR);

      const upperBack = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.60, 0.60), matShirt);
      upperBack.position.set(0, 1.82, -0.10);
      upperBack.rotation.x = 0.25;
      torsoRoot.add(upperBack);

      const midTorso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.32, 0.46), matShirt);
      midTorso.position.y = 1.08; torsoRoot.add(midTorso);
      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.28, 0.40), matSkin);
      belly.position.y = 0.88; torsoRoot.add(belly);
      const hip = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.16, 0.38), matPants);
      hip.position.y = 0.70; torsoRoot.add(hip);

      const tearL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.06), matSkin);
      tearL.position.set(-0.45, 1.42, 0.36); torsoRoot.add(tearL);
      const tearR = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.06), matSkin);
      tearR.position.set(0.40, 1.20, 0.34); torsoRoot.add(tearR);
      const tVein1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.05), matVein);
      tVein1.position.set(0.35, 1.50, 0.38); torsoRoot.add(tVein1);
      const tVein2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), matVein);
      tVein2.position.set(-0.40, 1.38, 0.36); torsoRoot.add(tVein2);

      const trapL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.46), matSkin);
      trapL.position.set(-0.40, 2.04, -0.06);
      trapL.rotation.x = 0.20;
      torsoRoot.add(trapL);
      const trapR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.46), matSkin);
      trapR.position.set(0.40, 2.04, -0.06);
      trapR.rotation.x = 0.20;
      torsoRoot.add(trapR);
      const neckTrap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.30, 0.46), matSkin);
      neckTrap.position.set(0, 2.06, -0.02);
      neckTrap.rotation.x = 0.18;
      torsoRoot.add(neckTrap);

      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.28), matSkin);
      neck.position.set(0, 2.00, 0.18); torsoRoot.add(neck);
      const neckVein1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.05), matVein);
      neckVein1.position.set(0.10, 2.02, 0.28); torsoRoot.add(neckVein1);
      const neckVein2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.05), matVein);
      neckVein2.position.set(-0.12, 2.00, 0.26); torsoRoot.add(neckVein2);

      // Delts
      const deltL = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.34, 0.40), matSkin);
      deltL.position.set(-0.76, 1.86, 0.08); torsoRoot.add(deltL);
      const deltR = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.34, 0.40), matSkin);
      deltR.position.set(0.76, 1.86, 0.08); torsoRoot.add(deltR);

      // Head: low and forward, BELOW the traps — creates the hunched look
      const headGroup = new THREE.Group();
      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.42), matSkin);
      headGroup.add(skull);
      const jawBone = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.34), matSkinD);
      jawBone.position.set(0, -0.26, 0.02); headGroup.add(jawBone);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.10, 0.14), matSkinD);
      brow.position.set(0, 0.18, 0.19); headGroup.add(brow);
      const eyeGlowMat = new THREE.MeshBasicMaterial({ color: eyeColor });
      const eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1, metalness: 0 });
      const sockL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.06), eyeSocketMat);
      sockL.position.set(-0.10, 0.07, 0.20); headGroup.add(sockL);
      const sockR = sockL.clone(); sockR.position.x = 0.10; headGroup.add(sockR);
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.07), eyeGlowMat);
      eyeL.position.set(-0.10, 0.07, 0.22); headGroup.add(eyeL);
      const eyeR = eyeL.clone(); eyeR.position.x = 0.10; headGroup.add(eyeR);
      // 2× eye glow on the boss: lights are present in both normal and hell
      // modes (the previous code only lit hell eyes). Intensity doubled from
      // 2.5 → 5.0; range extended 4 → 6 so the glow actually reaches the
      // surrounding fog. Hell keeps its red, normal mode uses the boss's
      // actual eyeColor (also red for Hormone Zombie but kept parameterized
      // so the function reads cleanly for any future boss variant).
      const eyeGlowL = new THREE.PointLight(eyeColor, 5.0, 6);
      eyeGlowL.position.set(-0.10, 0.07, 0.28); headGroup.add(eyeGlowL);
      const eyeGlowR = new THREE.PointLight(eyeColor, 5.0, 6);
      eyeGlowR.position.set(0.10, 0.07, 0.28); headGroup.add(eyeGlowR);
      const fangL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.04), matBone);
      fangL.position.set(-0.07, -0.24, 0.19); headGroup.add(fangL);
      const fangR = fangL.clone(); fangR.position.x = 0.07; headGroup.add(fangR);
      const teethRow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.04), matBone);
      teethRow.position.set(0, -0.19, 0.20); headGroup.add(teethRow);
      const scar = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.03, 0.04), matVein);
      scar.position.set(0, 0.0, 0.22); scar.rotation.z = 0.3; headGroup.add(scar);
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.08), matSkinD);
      nose.position.set(0, -0.04, 0.23); headGroup.add(nose);
      const earL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.06), matSkinD);
      earL.position.set(-0.24, 0.02, 0); headGroup.add(earL);
      const earR = earL.clone(); earR.position.x = 0.24; headGroup.add(earR);
      headGroup.position.set(0, 1.96, 0.50);
      headGroup.rotation.x = 0.25;
      torsoRoot.add(headGroup);

      torsoRoot.rotation.x = 0.18;

      leftArmRoot.position.set(-0.80, 1.76, 0.10);
      rightArmRoot.position.set(0.80, 1.76, 0.10);
      const makeArm = (ar, forearmGrp, side) => {
        const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.26, 0.48), matShirt);
        shoulder.position.set(0, -0.06, 0); ar.add(shoulder);
        const shoulderCap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.42), matSkin);
        shoulderCap.position.set(0, 0.06, 0); ar.add(shoulderCap);
        const bicep = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.54, 0.50), matSkin);
        bicep.position.set(0, -0.34, 0); ar.add(bicep);
        const bicepPeak = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.22, 0.18), matSkin);
        bicepPeak.position.set(0, -0.24, side === "left" ? -0.22 : 0.22); ar.add(bicepPeak);
        const bicepVein = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.06), matVein);
        bicepVein.position.set(side === "left" ? 0.18 : -0.18, -0.30, 0.20); ar.add(bicepVein);
        const bicepVein2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.20, 0.05), matVein);
        bicepVein2.position.set(side === "left" ? -0.14 : 0.14, -0.36, 0.16); ar.add(bicepVein2);

        const elbow = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.36), matSkinD);
        elbow.position.set(0, 0.02, 0); forearmGrp.add(elbow);
        const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.50, 0.42), matSkin);
        forearm.position.set(0, -0.26, 0.04); forearmGrp.add(forearm);
        const foreVein = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.30, 0.06), matVein);
        foreVein.position.set(side === "left" ? -0.12 : 0.12, -0.24, 0.20); forearmGrp.add(foreVein);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.30, 0.36), matSkinD);
        hand.position.set(0, -0.56, 0.08); forearmGrp.add(hand);
        const fist = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.28), matSkinD);
        fist.position.set(0, -0.68, 0.06); forearmGrp.add(fist);
        const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.10), matSkinD);
        f1.position.set(-0.08, -0.70, 0.14); forearmGrp.add(f1);
        const f2 = f1.clone(); f2.position.x = 0; forearmGrp.add(f2);
        const f3 = f1.clone(); f3.position.x = 0.08; forearmGrp.add(f3);
        const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.10, 0.08), matSkinD);
        thumb.position.set(side === "left" ? 0.16 : -0.16, -0.60, 0.16); forearmGrp.add(thumb);

        forearmGrp.position.set(0, -0.60, 0);
        forearmGrp.rotation.x = -0.55;
        ar.add(forearmGrp);
      };
      makeArm(leftArmRoot, leftForearmRoot, "left");
      makeArm(rightArmRoot, rightForearmRoot, "right");

      const hipBridge = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.18, 0.38), matPants);
      hipBridge.position.set(0, 0.70, 0);
      root.add(hipBridge);

      leftLegRoot.position.set(-0.30, 0.68, 0);
      rightLegRoot.position.set(0.30, 0.68, 0);
      leftLegRoot.rotation.x = 0.0;
      rightLegRoot.rotation.x = 0.0;
      const leftShinRoot = new THREE.Group();
      const rightShinRoot = new THREE.Group();
      const makeLeg = (lr, shinGrp, side) => {
        const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.34), matPants);
        thigh.position.set(0, -0.24, 0); lr.add(thigh);
        const thighMuscle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.16), matSkin);
        thighMuscle.position.set(0, -0.18, 0.18); lr.add(thighMuscle);

        shinGrp.position.set(0, -0.48, 0);
        // The model faces +Z (skull, face, toes are all at +z; the calf bulge is at -z).
        // Rotating a child that hangs at -Y by +x swings it toward -Z, i.e. heel BACKWARD —
        // which is how a knee actually bends. The old -0.18 swung the foot FORWARD, so the
        // boss stood with both knees hyperextended: the "reverse-bow leg".
        shinGrp.rotation.x = 0.10;
        const knee = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.14, 0.30), matSkinD);
        knee.position.set(0, 0.02, 0.02); shinGrp.add(knee);
        const shin = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.42, 0.30), matPants);
        shin.position.set(0, -0.22, 0); shinGrp.add(shin);
        const calf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.14), matSkin);
        calf.position.set(0, -0.16, -0.16); shinGrp.add(calf);
        if (side === "right") {
          const tear = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.06), matSkin);
          tear.position.set(0, -0.32, 0.14); shinGrp.add(tear);
        }
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.38), matSkinD);
        foot.position.set(0, -0.48, 0.06); shinGrp.add(foot);
        lr.add(shinGrp);
      };
      makeLeg(leftLegRoot, leftShinRoot, "left");
      makeLeg(rightLegRoot, rightShinRoot, "right");

      torsoRoot.add(leftArmRoot, rightArmRoot);
      root.add(torsoRoot, leftLegRoot, rightLegRoot);
      const bossScale = isHell ? 2.6 : 2.0;
      const bossBaseY = isHell ? 1.30 : 1.00;
      root.scale.set(bossScale, bossScale, bossScale);
      root.position.set(x, bossBaseY, z);
      root.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        o.receiveShadow = true;
      });

      scene.add(root);

      const hpCanvas = document.createElement("canvas");
      hpCanvas.width = 256;
      hpCanvas.height = 24;
      const hpCtx = hpCanvas.getContext("2d");
      const hpTexture = new THREE.CanvasTexture(hpCanvas);
      const hpSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: hpTexture,
          transparent: true,
          depthTest: true,
          depthWrite: false
        })
      );
      hpSprite.scale.set(isHell ? 4.0 : 3.2, isHell ? 0.6 : 0.5, 1);
      hpSprite.position.set(0, isHell ? 3.6 : 3.2, 0);
      root.add(hpSprite);
      hpSprite.raycast = () => {};

      return {
        type: "boss",
        group: root,
        torsoRoot,
        headGroup,
        leftArmRoot,
        rightArmRoot,
        leftForearmRoot,
        rightForearmRoot,
        leftLegRoot,
        rightLegRoot,
        leftShinRoot,
        rightShinRoot,
        hpCanvas,
        hpCtx,
        hpTexture,
        hpSprite,
        alive: true,
        hp: isHell ? 75000 : 15000,
        maxHp: isHell ? 75000 : 15000,
        attackCooldownTimer: 0,
        attackCooldown: 1.2,
        attackDamage: isHell ? 250 : 50,
        ranged: false,
        rangeDistance: 20,
        respawnTimer: 0,
        spawn: new THREE.Vector3(x, 0, z),
        walkTime: Math.random() * 10,
        moving: false,
        attackPhase: 0,
        speed: isHell ? 6.175 : 5.85,
        aware: false,
        hiddenTimer: 0,
        facingYaw: 0,
        visYaw: 0,
        armLV: -0.2,
        armRV: -0.2,
        legLV: 0,
        legRV: 0,
        torsoBobYV: 0,
        torsoXV: 0,
        torsoZV: 0,
        torsoPitchV: 0,
        targetId: null,
        retargetTimer: 0,
        moveYaw: 0,
        rangedLosAcquireTimer: 0,
        isBoss: true,
        isHormoneZombie: true,
        isHellBoss: !!isHell,
        bossMode: "tank",
        bossModeSwitchTimer: 5,
        baseTankHp: isHell ? 75000 : 15000,
        baseSpeedHp: isHell ? 40000 : 8000,
        baseGunnerHp: isHell ? 50000 : 10000,
        summonCooldown: 999,
        summonCount: 0,
        summonTriggered: false,
        bossAnimState: "idle",
        bossAnimTimer: 0,
        bossQuakeCooldownTimer: 6,
        _quakeShook: false
      };
    }

    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioMaster = audioCtx.createGain();
    const audioSfx = audioCtx.createGain();
    const audioMusic = audioCtx.createGain();
    audioSfx.connect(audioMaster);
    audioMusic.connect(audioMaster);
    audioMaster.connect(audioCtx.destination);

    if (typeof GunSFX !== "undefined" && GunSFX.bindAudio) {
      GunSFX.bindAudio(audioCtx, audioSfx);
    }
    if (typeof ChaosShortySFX !== "undefined" && ChaosShortySFX.bindAudio) {
      ChaosShortySFX.bindAudio(audioCtx, audioSfx);
    }

    let menuBgmAudio = null;
    let bossBgmAudio = null;
    let bossBgmHellMode = false;
    let arenaBgmAudio = null;
    let pvpBgmAudio = null;
    let arena19hz = null; // { osc, gain } — 19 Hz sine routed to audioMusic, started with arena BGM

    function calcMusicLevel() {
      return THREE.MathUtils.clamp(gameSettings.masterVolume * gameSettings.musicVolume, 0, 1);
    }

    function applyAudioVolumes() {
      audioMaster.gain.value = gameSettings.masterVolume;
      audioSfx.gain.value = gameSettings.soundVolume;
      audioMusic.gain.value = gameSettings.musicVolume;
      const musicLevel = calcMusicLevel();
      if (menuBgmMenuGain) {
        menuBgmMenuGain.gain.value = musicLevel;
      } else if (menuBgmAudio && shouldPlayMenuBgm()) {
        menuBgmAudio.volume = musicLevel;
      }
      // Per-BGM <audio> elements don't route through audioMusic, so their .volume
      // has to be updated explicitly whenever a slider moves (otherwise the slider
      // only affects WebAudio-routed sounds and the playing BGM stays at its old
      // level). Sync every existing BGM element unconditionally — .volume is read
      // on play(), so it's safe to set on a paused element.
      if (arenaBgmAudio) arenaBgmAudio.volume = musicLevel;
      if (bossBgmAudio) bossBgmAudio.volume = musicLevel;
      if (pvpBgmAudio) pvpBgmAudio.volume = musicLevel;
    }
    applyAudioVolumes();

    /** Every candidate base may host menu.mp3. Same-origin URLs first (GitHub folder copy); cross-origin last. */
    function getMenuBgmUrlCandidates() {
      const here = (() => {
        try {
          return window.location.origin;
        } catch (_) {
          return "";
        }
      })();
      const fromBase = [];
      for (const base of getGameAssetBaseCandidates()) {
        try {
          fromBase.push(new URL("media/menu.mp3", normalizeGameAssetBase(base)).href);
        } catch (_) {}
      }
      const same = [];
      const other = [];
      for (const u of fromBase) {
        try {
          if (here && new URL(u).origin === here) same.push(u);
          else other.push(u);
        } catch (_) {
          other.push(u);
        }
      }
      const tail = [];
      try {
        tail.push(new URL("media/menu.mp3", pageDirFromLocation()).href);
      } catch (_) {}
      try {
        tail.push(new URL("media/menu.mp3", window.location.href).href);
      } catch (_) {}
      tail.push("media/menu.mp3");
      return [...new Set([...same, ...other, ...tail])];
    }

    /** True while the main-menu layer is up (CSS or inline). */
    function isMainMenuLayerVisible() {
      try {
        if (!menuEl) return false;
        if (menuEl.style.display === "none") return false;
        return window.getComputedStyle(menuEl).display !== "none";
      } catch (_) {
        return menuEl && menuEl.style.display !== "none";
      }
    }

    /** menu.mp3 only on mode-select UI — not during gameplay, boot overlay, or pause/death in-world. */
    function shouldPlayMenuBgm() {
      return isMainMenuLayerVisible() && !gameWorldReady;
    }

    function syncMenuBgmRoutingAndVolumes() {
      if (!menuBgmAudio || !shouldPlayMenuBgm()) return;
      const level = calcMusicLevel();
      if (menuBgmMenuGain) {
        // WebAudio path: keep <audio>.volume at 1.0 (set in ensureMenuBgmAudio) so the
        // gain node is the only thing the slider drives.
        menuBgmMenuGain.gain.value = level;
      } else {
        menuBgmAudio.volume = level;
      }
    }

    // Guard so multiple listeners (user gesture + canplaythrough + audioCtx.onstatechange +
    // scheduleMenuBgmEntryAutoplay retries + pageshow) don't all call play() concurrently,
    // which produces stacked copies of the menu BGM layered on top of each other.
    let _menuBgmPlayInFlight = false;
    function tryStartMenuBgmPlayback() {
      if (!menuBgmAudio || !shouldPlayMenuBgm()) return;
      // Already playing (or about to) — skip. The HTMLAudioElement's `paused` flag is
      // cleared once play() resolves, so this also covers the rapid-fire case where two
      // listeners fire in the same task before the first play() promise settles.
      if (!menuBgmAudio.paused || _menuBgmPlayInFlight) return;
      // Don't restart from 0 if we've already made progress — that would replay the song.
      if (menuBgmAudio.currentTime > 0) return;
      syncMenuBgmRoutingAndVolumes();
      _menuBgmPlayInFlight = true;
      let p;
      try {
        p = menuBgmAudio.play();
      } catch (_) {
        _menuBgmPlayInFlight = false;
        return;
      }
      if (p && typeof p.then === "function") {
        p.then(() => { _menuBgmPlayInFlight = false; }).catch(() => { _menuBgmPlayInFlight = false; });
      } else {
        _menuBgmPlayInFlight = false;
      }
    }

    function ensureMenuBgmAudio() {
      if (menuBgmAudio) return;
      const urls = getMenuBgmUrlCandidates();
      menuBgmAudio = new Audio();
      menuBgmAudio.loop = true;
      menuBgmAudio.preload = "auto";
      menuBgmAudio.setAttribute("playsinline", "");
      // Set the src + crossOrigin BEFORE createMediaElementSource — Chrome throws
      // InvalidStateError if you call it on an element that has no src yet, and even when
      // it doesn't throw the source ends up in a torn state. The audio element also needs
      // its CORS attribute settled first so the WebAudio path matches the actual fetch.
      let urlIdx = 0;
      function applySrcAt(idx) {
        if (idx >= urls.length) return;
        const u = urls[idx];
        try {
          const loc = window.location;
          const abs = new URL(u, loc.href || "http://localhost/");
          const filePage = loc.protocol === "file:";
          const fileAsset = abs.protocol === "file:";
          const needCors =
            !filePage &&
            !fileAsset &&
            abs.origin &&
            loc.origin &&
            abs.origin !== loc.origin;
          if (needCors) menuBgmAudio.crossOrigin = "anonymous";
          else menuBgmAudio.removeAttribute("crossOrigin");
        } catch (_) {
          try {
            menuBgmAudio.removeAttribute("crossOrigin");
          } catch (e2) {}
        }
        menuBgmAudio.src = u;
        try {
          menuBgmAudio.load();
        } catch (_) {}
      }
      // First URL goes in before we wire the WebAudio graph. Fallbacks (via the 'error'
      // listener) reuse the same applySrcAt helper below.
      applySrcAt(0);
      // Route the menu BGM through the WebAudio graph so the menu-wall lamp can read its waveform.
      // createMediaElementSource can only be called once per element, but ensureMenuBgmAudio
      // early-returns above on the second call, so this is safe across the page lifetime.
      try {
        menuBgmMediaSrc = audioCtx.createMediaElementSource(menuBgmAudio);
        menuBgmMenuGain = audioCtx.createGain();
        menuBgmMenuGain.gain.value = calcMusicLevel();
        menuBgmAnalyser = audioCtx.createAnalyser();
        menuBgmAnalyser.fftSize = 256;
        menuBgmAnalyser.smoothingTimeConstant = 0.4;
        // Float32Array for getFloatTimeDomainData (writes [-1, 1] floats, 0 = silence).
        // Don't use Uint8Array + getByteTimeDomainData — when no signal is flowing the byte
        // buffer stays at 0 (not 128), which produces peak = 1.0 and pins the lamp at MAX.
        menuBgmTimeBuf = new Float32Array(menuBgmAnalyser.fftSize);
        // Uint8Array for getByteFrequencyData (drives the 700Hz band of the menu-wall lamp).
        menuBgmFreqBuf = new Uint8Array(menuBgmAnalyser.frequencyBinCount);
        menuBgmMediaSrc.connect(menuBgmMenuGain);
        menuBgmMenuGain.connect(menuBgmAnalyser);
        menuBgmMenuGain.connect(audioMusic);
        // Volume is now controlled by menuBgmMenuGain; zero out the <audio>.volume so
        // the slider doesn't double-up with the WebAudio gain.
        menuBgmAudio.volume = 1.0;
      } catch (_) {
        // If createMediaElementSource fails (e.g. the element is in an unsupported state)
        // fall back to the old direct-<.volume> path by clearing the WebAudio handles.
        menuBgmMediaSrc = null;
        menuBgmMenuGain = null;
        menuBgmAnalyser = null;
        menuBgmTimeBuf = null;
        menuBgmFreqBuf = null;
        menuBgmAudio.volume = calcMusicLevel();
      }
      /** Previously only wired routing here — never called play(), so menu stayed silent until accidental timing. Restore “start when buffered” + entry retries. */
      menuBgmAudio.addEventListener("canplaythrough", () => {
        syncMenuBgmRoutingAndVolumes();
        tryStartMenuBgmPlayback();
      });
      menuBgmAudio.addEventListener("canplay", () => {
        syncMenuBgmRoutingAndVolumes();
        tryStartMenuBgmPlayback();
      });
      menuBgmAudio.addEventListener("error", () => {
        urlIdx++;
        if (urlIdx < urls.length) applySrcAt(urlIdx);
      });
    }
    function pauseMenuBgm() {
      if (!menuBgmAudio) return;
      try {
        menuBgmAudio.pause();
      } catch (_) {}
    }

    /** Safe to spam: starts decode early, resumes after policy blocks. First load + user gesture retry. */
    function tryPlayMenuBgm() {
      if (!shouldPlayMenuBgm()) return;
      ensureMenuBgmAudio();
      if (menuBgmAudio.readyState >= 2) {
        tryStartMenuBgmPlayback();
      }
    }

    function onMenuBgmUserGesture() {
      if (!shouldPlayMenuBgm()) return;
      // Safari is the strictest of the major browsers: it only counts a user gesture if the
      // <audio>.play() call is in the same synchronous call stack as the gesture. So we do
      // EVERYTHING (resume context, ensure element, route audio, call play) right here, with
      // no setTimeout / Promise / queueMicrotask between the gesture and the play() call.
      try {
        // Resume the AudioContext synchronously so Safari marks the gesture as "owned" by us.
        if (audioCtx && audioCtx.state === "suspended") {
          try { void audioCtx.resume(); } catch (_) {}
        }
        // Create the <audio> element + WebAudio graph if it doesn't exist yet. This call
        // may take a few microseconds (it loads media candidates) but does not yield to the
        // event loop, so the gesture context is still active when play() is called below.
        try { ensureMenuBgmAudio(); } catch (_) {}
        if (!menuBgmAudio) return;
        // Sync the gain to the current volume setting and start playback in the same stack.
        // Route through tryStartMenuBgmPlayback so the in-flight guard prevents stacked
        // copies of the song when this fires in the same tick as the other listeners.
        try { tryStartMenuBgmPlayback(); } catch (_) {}
      } catch (_) {}
    }
    ["pointerdown", "keydown", "touchstart"].forEach((ev) => {
      window.addEventListener(ev, onMenuBgmUserGesture, { capture: true });
    });

    /** Enter page → load menu.mp3 ASAP and autoplay whenever the browser allows (plus timed retries after decode). */
    function scheduleMenuBgmEntryAutoplay() {
      try {
        ensureMenuBgmAudio();
      } catch (_) {}
      try {
        tryPlayMenuBgm();
      } catch (_) {}
      const bumps = [0, 50, 200, 500, 1200];
      bumps.forEach((ms) =>
        window.setTimeout(() => {
          try {
            tryPlayMenuBgm();
          } catch (_) {}
        }, ms)
      );
    }
    scheduleMenuBgmEntryAutoplay();
    window.addEventListener("pageshow", () => {
      if (!shouldPlayMenuBgm()) return;
      try {
        tryPlayMenuBgm();
      } catch (_) {}
    });

    audioCtx.onstatechange = () => {
      if (audioCtx.state !== "running") return;
      try {
        if (!menuBgmAudio || !shouldPlayMenuBgm()) return;
        // Route through tryStartMenuBgmPlayback — the in-flight guard prevents stacked
        // copies when this fires in the same tick as the user-gesture handler.
        try { tryStartMenuBgmPlayback(); } catch (_) {}
      } catch (_) {}
    };

    /** Zombie Arena music: zombie-arena.mp3. Plays on the PVE/co-op arena map only. */
    function getArenaBgmUrlCandidates() {
      const filename = "media/zombie-arena.mp3";
      const here = (() => {
        try {
          return window.location.origin;
        } catch (_) {
          return "";
        }
      })();
      const fromBase = [];
      for (const base of getGameAssetBaseCandidates()) {
        try {
          fromBase.push(new URL(filename, normalizeGameAssetBase(base)).href);
        } catch (_) {}
      }
      const same = [];
      const other = [];
      for (const u of fromBase) {
        try {
          if (here && new URL(u).origin === here) same.push(u);
          else other.push(u);
        } catch (_) {
          other.push(u);
        }
      }
      return [...same, ...other];
    }

    /**
     * PVP BGM (crossfire / crossfire_grid / pvp_bright). Mirrors the arena BGM
     * pipeline: a looped <audio> element, lazy-loaded with candidate URLs across
     * the same asset bases, gated by isPvpCrossfireMap(CURRENT_MAP) and
     * gameWorldReady. Volume = master × music.
     */
    function getPvpBgmUrlCandidates() {
      const filename = "media/pvp.mp3";
      const here = (() => {
        try {
          return window.location.origin;
        } catch (_) {
          return "";
        }
      })();
      const fromBase = [];
      for (const base of getGameAssetBaseCandidates()) {
        try {
          fromBase.push(new URL(filename, normalizeGameAssetBase(base)).href);
        } catch (_) {}
      }
      const same = [];
      const other = [];
      for (const u of fromBase) {
        try {
          if (here && new URL(u).origin === here) same.push(u);
          else other.push(u);
        } catch (_) {
          other.push(u);
        }
      }
      return [...same, ...other];
    }

    function shouldPlayArenaBgm() {
      return gameWorldReady && isArenaLikeMap(CURRENT_MAP);
    }

    function syncArenaBgmRoutingAndVolumes() {
      if (!arenaBgmAudio || !shouldPlayArenaBgm()) return;
      arenaBgmAudio.volume = calcMusicLevel();
    }

    function tryStartArenaBgmPlayback() {
      if (!arenaBgmAudio || !shouldPlayArenaBgm()) return;
      syncArenaBgmRoutingAndVolumes();
      startArena19HzTone();
      const p = arenaBgmAudio.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    /**
     * 19 Hz continuous sine on the music bus while Zombie Arena is active.
     * 19 Hz sits at the edge of human hearing — on speakers/headphones that can
     * reproduce it you get a pressure/rumble; on most consumer gear it's near-silent.
     * Routed through audioMusic so it follows the music volume slider.
     */
    function startArena19HzTone() {
      if (arena19hz) return;
      if (audioCtx.state === "suspended") {
        try { void audioCtx.resume(); } catch (_) {}
      }
      // Platform-tuned sub-bass frequency: Mac → 19 Hz, Windows → 20 Hz, other → 25 Hz.
      const plat = (() => {
        try {
          const p = String(navigator.platform || "");
          const ua = String(navigator.userAgent || "");
          if (/Mac|iPhone|iPad|iPod/i.test(p) || /Mac OS X/i.test(ua)) return "mac";
          if (/Win/i.test(p) || /Windows/i.test(ua)) return "win";
          return "other";
        } catch (_) {
          return "other";
        }
      })();
      const freq = plat === "mac" ? 19 : plat === "win" ? 20 : 25;
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      // Cranked to the maximum the WebAudio graph can deliver on the music bus:
      // peak amplitude 1.0 at full music volume means full-scale output to the
      // speakers (a true 19/20/25 Hz sine going as loud as the audio hardware
      // can play it). audioMusic bus gain still applies, so 0% music = silent
      // and 100% music = maximum loudness. Ramped up over 80 ms to avoid a
      // sub-bass "pop" on speakers/headphones that emphasize low end.
      const t0 = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(1.0, t0 + 0.08);
      osc.connect(gain);
      gain.connect(audioMusic);
      try { osc.start(); } catch (_) {}
      arena19hz = { osc, gain };
    }

    function stopArena19HzTone() {
      if (!arena19hz) return;
      try { arena19hz.osc.stop(); } catch (_) {}
      try { arena19hz.osc.disconnect(); } catch (_) {}
      try { arena19hz.gain.disconnect(); } catch (_) {}
      arena19hz = null;
    }

    function ensureArenaBgmAudio() {
      if (arenaBgmAudio) return;
      const urls = getArenaBgmUrlCandidates();
      arenaBgmAudio = new Audio();
      arenaBgmAudio.loop = true;
      arenaBgmAudio.preload = "auto";
      arenaBgmAudio.setAttribute("playsinline", "");
      arenaBgmAudio.volume = calcMusicLevel();
      let urlIdx = 0;
      function applySrcAt(idx) {
        if (idx >= urls.length) return;
        const u = urls[idx];
        try {
          const loc = window.location;
          const abs = new URL(u, loc.href || "http://localhost/");
          const filePage = loc.protocol === "file:";
          const fileAsset = abs.protocol === "file:";
          const needCors =
            !filePage &&
            !fileAsset &&
            abs.origin &&
            loc.origin &&
            abs.origin !== loc.origin;
          if (needCors) arenaBgmAudio.crossOrigin = "anonymous";
          else arenaBgmAudio.removeAttribute("crossOrigin");
        } catch (_) {
          try {
            arenaBgmAudio.removeAttribute("crossOrigin");
          } catch (e2) {}
        }
        arenaBgmAudio.src = u;
        try {
          arenaBgmAudio.load();
        } catch (_) {}
      }
      arenaBgmAudio.addEventListener("canplaythrough", () => {
        syncArenaBgmRoutingAndVolumes();
        tryStartArenaBgmPlayback();
      });
      arenaBgmAudio.addEventListener("canplay", () => {
        syncArenaBgmRoutingAndVolumes();
        tryStartArenaBgmPlayback();
      });
      arenaBgmAudio.addEventListener("error", () => {
        urlIdx++;
        if (urlIdx < urls.length) applySrcAt(urlIdx);
      });
      applySrcAt(0);
    }

    function pauseArenaBgm() {
      stopArena19HzTone();
      if (!arenaBgmAudio) return;
      try {
        arenaBgmAudio.pause();
      } catch (_) {}
    }

    function tryPlayArenaBgm() {
      if (!shouldPlayArenaBgm()) return;
      ensureArenaBgmAudio();
      if (arenaBgmAudio.readyState >= 2) {
        tryStartArenaBgmPlayback();
      }
    }

    function shouldPlayPvpBgm() {
      return gameWorldReady && isPvpCrossfireMap(CURRENT_MAP);
    }

    function syncPvpBgmRoutingAndVolumes() {
      if (!pvpBgmAudio || !shouldPlayPvpBgm()) return;
      pvpBgmAudio.volume = calcMusicLevel();
    }

    function tryStartPvpBgmPlayback() {
      if (!pvpBgmAudio || !shouldPlayPvpBgm()) return;
      syncPvpBgmRoutingAndVolumes();
      const p = pvpBgmAudio.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    function ensurePvpBgmAudio() {
      if (pvpBgmAudio) return;
      const urls = getPvpBgmUrlCandidates();
      pvpBgmAudio = new Audio();
      pvpBgmAudio.loop = true;
      pvpBgmAudio.preload = "auto";
      pvpBgmAudio.setAttribute("playsinline", "");
      pvpBgmAudio.volume = calcMusicLevel();
      let urlIdx = 0;
      function applySrcAt(idx) {
        if (idx >= urls.length) return;
        const u = urls[idx];
        try {
          const loc = window.location;
          const abs = new URL(u, loc.href || "http://localhost/");
          const filePage = loc.protocol === "file:";
          const fileAsset = abs.protocol === "file:";
          const needCors =
            !filePage &&
            !fileAsset &&
            abs.origin &&
            loc.origin &&
            abs.origin !== loc.origin;
          if (needCors) pvpBgmAudio.crossOrigin = "anonymous";
          else pvpBgmAudio.removeAttribute("crossOrigin");
        } catch (_) {
          try { pvpBgmAudio.removeAttribute("crossOrigin"); } catch (e2) {}
        }
        pvpBgmAudio.src = u;
        try { pvpBgmAudio.load(); } catch (_) {}
      }
      pvpBgmAudio.addEventListener("canplaythrough", () => {
        syncPvpBgmRoutingAndVolumes();
        tryStartPvpBgmPlayback();
      });
      pvpBgmAudio.addEventListener("canplay", () => {
        syncPvpBgmRoutingAndVolumes();
        tryStartPvpBgmPlayback();
      });
      pvpBgmAudio.addEventListener("error", () => {
        urlIdx++;
        if (urlIdx < urls.length) applySrcAt(urlIdx);
      });
      applySrcAt(0);
    }

    function pausePvpBgm() {
      if (!pvpBgmAudio) return;
      try { pvpBgmAudio.pause(); } catch (_) {}
    }

    function tryPlayPvpBgm() {
      if (!shouldPlayPvpBgm()) return;
      ensurePvpBgmAudio();
      if (pvpBgmAudio.readyState >= 2) {
        tryStartPvpBgmPlayback();
      }
    }

    /** Boss fight music: boss.mp3 (normal) or boss-hell.mp3 (hell mode). */
    function getBossBgmUrlCandidates(hellMode) {
      const filename = hellMode ? "media/boss-hell.mp3" : "media/boss.mp3";
      const here = (() => {
        try {
          return window.location.origin;
        } catch (_) {
          return "";
        }
      })();
      const fromBase = [];
      for (const base of getGameAssetBaseCandidates()) {
        try {
          fromBase.push(new URL(filename, normalizeGameAssetBase(base)).href);
        } catch (_) {}
      }
      const same = [];
      const other = [];
      for (const u of fromBase) {
        try {
          if (here && new URL(u).origin === here) same.push(u);
          else other.push(u);
        } catch (_) {
          other.push(u);
        }
      }
      return [...same, ...other];
    }

    function shouldPlayBossBgm() {
      return gameWorldReady && isBossArenaMap(CURRENT_MAP);
    }

    function syncBossBgmRoutingAndVolumes() {
      if (!bossBgmAudio || !shouldPlayBossBgm()) return;
      bossBgmAudio.volume = calcMusicLevel();
    }

    function tryStartBossBgmPlayback() {
      if (!bossBgmAudio || !shouldPlayBossBgm()) return;
      syncBossBgmRoutingAndVolumes();
      const p = bossBgmAudio.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }

    function ensureBossBgmAudio(hellMode) {
      if (bossBgmAudio && bossBgmHellMode === hellMode) return;
      // Recreate if hell mode changed
      if (bossBgmAudio) {
        try { bossBgmAudio.pause(); } catch (_) {}
        bossBgmAudio.src = "";
        bossBgmAudio = null;
      }
      bossBgmHellMode = hellMode;
      const urls = getBossBgmUrlCandidates(hellMode);
      bossBgmAudio = new Audio();
      bossBgmAudio.loop = true;
      bossBgmAudio.preload = "auto";
      bossBgmAudio.setAttribute("playsinline", "");
      bossBgmAudio.volume = calcMusicLevel();
      let urlIdx = 0;
      function applySrcAt(idx) {
        if (idx >= urls.length) return;
        const u = urls[idx];
        try {
          const loc = window.location;
          const abs = new URL(u, loc.href || "http://localhost/");
          const filePage = loc.protocol === "file:";
          const fileAsset = abs.protocol === "file:";
          const needCors =
            !filePage &&
            !fileAsset &&
            abs.origin &&
            loc.origin &&
            abs.origin !== loc.origin;
          if (needCors) bossBgmAudio.crossOrigin = "anonymous";
          else bossBgmAudio.removeAttribute("crossOrigin");
        } catch (_) {
          try {
            bossBgmAudio.removeAttribute("crossOrigin");
          } catch (e2) {}
        }
        bossBgmAudio.src = u;
        try {
          bossBgmAudio.load();
        } catch (_) {}
      }
      bossBgmAudio.addEventListener("canplaythrough", () => {
        syncBossBgmRoutingAndVolumes();
        tryStartBossBgmPlayback();
      });
      bossBgmAudio.addEventListener("canplay", () => {
        syncBossBgmRoutingAndVolumes();
        tryStartBossBgmPlayback();
      });
      bossBgmAudio.addEventListener("error", () => {
        urlIdx++;
        if (urlIdx < urls.length) applySrcAt(urlIdx);
      });
      applySrcAt(0);
    }

    function pauseBossBgm() {
      if (!bossBgmAudio) return;
      try {
        bossBgmAudio.pause();
      } catch (_) {}
    }

    function tryPlayBossBgm(hellMode) {
      if (!shouldPlayBossBgm()) return;
      ensureBossBgmAudio(hellMode);
      if (bossBgmAudio.readyState >= 2) {
        tryStartBossBgmPlayback();
      }
    }

    let ambientWindNode = null;
    function ensureAmbientWindLoop() {
      if (ambientWindNode || audioCtx.state === "closed") return;
      const len = audioCtx.sampleRate * 4;
      const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const bp = audioCtx.createBiquadFilter();
      bp.type = "lowpass";
      bp.frequency.value = 420;
      const g = audioCtx.createGain();
      g.gain.value = 0.016;
      src.connect(bp);
      bp.connect(g);
      g.connect(audioMusic);
      try {
        src.start();
      } catch (_) {}
      ambientWindNode = { src, g };
    }

    const _gunNoiseBuf = {};
    function getGunNoiseBuffer(durationSec) {
      const key = durationSec.toFixed(4);
      if (_gunNoiseBuf[key]) return _gunNoiseBuf[key];
      const rate = audioCtx.sampleRate;
      const n = Math.max(64, (rate * durationSec) | 0);
      const buf = audioCtx.createBuffer(1, n, rate);
      const d = buf.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        brown = 0.985 * brown + 0.015 * w;
        d[i] = brown * 2.4;
      }
      _gunNoiseBuf[key] = buf;
      return buf;
    }

    /** AMR: loud front crack/boom + extended rolling tail (anti-materiel rifle). */
    function playAmrGunSound() {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      if (sniperFireBuffer) {
        const bs = audioCtx.createBufferSource();
        bs.buffer = sniperFireBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 0.9;
        bs.connect(g);
        g.connect(audioSfx);
        try { bs.start(); } catch (_) {}
        return;
      }
      void ensureSniperBuffer(); // kick off decode for next shot
      const now = audioCtx.currentTime;

      const sub = audioCtx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(52, now);
      sub.frequency.exponentialRampToValueAtTime(18, now + 0.78);
      const subG = audioCtx.createGain();
      subG.gain.setValueAtTime(0.0001, now);
      subG.gain.exponentialRampToValueAtTime(1.72, now + 0.018);
      subG.gain.exponentialRampToValueAtTime(0.0001, now + 0.98);
      sub.connect(subG);
      subG.connect(audioSfx);
      sub.start(now);
      sub.stop(now + 1.02);

      const boom = audioCtx.createBufferSource();
      boom.buffer = getGunNoiseBuffer(0.62);
      const boomLp = audioCtx.createBiquadFilter();
      boomLp.type = "lowpass";
      boomLp.frequency.setValueAtTime(380, now);
      boomLp.frequency.exponentialRampToValueAtTime(72, now + 0.55);
      const boomG = audioCtx.createGain();
      boomG.gain.setValueAtTime(0.0001, now);
      boomG.gain.exponentialRampToValueAtTime(1.42, now + 0.01);
      boomG.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
      boom.connect(boomLp);
      boomLp.connect(boomG);
      boomG.connect(audioSfx);
      boom.start(now);
      boom.stop(now + 0.76);

      const crack = audioCtx.createBufferSource();
      crack.buffer = getGunNoiseBuffer(0.18);
      const crackBp = audioCtx.createBiquadFilter();
      crackBp.type = "bandpass";
      crackBp.frequency.setValueAtTime(2100, now);
      crackBp.Q.setValueAtTime(0.52, now);
      const crackG = audioCtx.createGain();
      crackG.gain.setValueAtTime(0.0001, now);
      crackG.gain.exponentialRampToValueAtTime(1.18, now + 0.003);
      crackG.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      crack.connect(crackBp);
      crackBp.connect(crackG);
      crackG.connect(audioSfx);
      crack.start(now);
      crack.stop(now + 0.18);

      const tail = audioCtx.createBufferSource();
      tail.buffer = getGunNoiseBuffer(1.55);
      const tailBp = audioCtx.createBiquadFilter();
      tailBp.type = "bandpass";
      tailBp.frequency.setValueAtTime(480, now + 0.06);
      tailBp.frequency.exponentialRampToValueAtTime(180, now + 1.35);
      tailBp.Q.setValueAtTime(0.32, now);
      const tailG = audioCtx.createGain();
      tailG.gain.setValueAtTime(0.0001, now + 0.03);
      tailG.gain.exponentialRampToValueAtTime(0.95, now + 0.08);
      tailG.gain.exponentialRampToValueAtTime(0.0001, now + 1.62);
      tail.connect(tailBp);
      tailBp.connect(tailG);
      tailG.connect(audioSfx);
      tail.start(now + 0.028);
      tail.stop(now + 1.68);

      const rumble = audioCtx.createBufferSource();
      rumble.buffer = getGunNoiseBuffer(1.25);
      const rumbleLp = audioCtx.createBiquadFilter();
      rumbleLp.type = "lowpass";
      rumbleLp.frequency.setValueAtTime(240, now + 0.12);
      rumbleLp.frequency.exponentialRampToValueAtTime(55, now + 1.5);
      const rumbleG = audioCtx.createGain();
      rumbleG.gain.setValueAtTime(0.0001, now + 0.1);
      rumbleG.gain.exponentialRampToValueAtTime(0.58, now + 0.22);
      rumbleG.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);
      rumble.connect(rumbleLp);
      rumbleLp.connect(rumbleG);
      rumbleG.connect(audioSfx);
      rumble.start(now + 0.08);
      rumble.stop(now + 1.6);

      const echoIn = audioCtx.createGain();
      echoIn.gain.setValueAtTime(0.52, now);
      const delay = audioCtx.createDelay(2.0);
      delay.delayTime.setValueAtTime(0.19, now);
      const fb = audioCtx.createGain();
      fb.gain.setValueAtTime(0.52, now);
      const echoLp = audioCtx.createBiquadFilter();
      echoLp.type = "lowpass";
      echoLp.frequency.setValueAtTime(480, now);
      boomG.connect(echoIn);
      tailG.connect(echoIn);
      rumbleG.connect(echoIn);
      echoIn.connect(delay);
      delay.connect(echoLp);
      echoLp.connect(audioSfx);
      delay.connect(fb);
      fb.connect(delay);
      fb.gain.exponentialRampToValueAtTime(0.0001, now + 1.85);
    }

    /** 1–4 号枪：backup 分层枪声；AMR(5) 走 playAmrGunSound（轰鸣+滚动尾音）。 */
    /** SMG voice with a suppressed low thump under it — same family, obviously heavier. */
    function playAsValGunSound(w) {
      const skin = (w && w.soundSkin) || "divineSpectre";
      if (typeof GunSFX !== "undefined" && GunSFX.shot) GunSFX.shot(skin);
      if (!audioCtx || !audioSfx) return;
      const t0 = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(148, t0);
      osc.frequency.exponentialRampToValueAtTime(58, t0 + 0.085);
      const og = audioCtx.createGain();
      og.gain.setValueAtTime(0.0001, t0);
      og.gain.exponentialRampToValueAtTime(0.30, t0 + 0.006);
      og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
      osc.connect(og); og.connect(audioSfx);
      try { osc.start(t0); osc.stop(t0 + 0.12); } catch (_) {}
      const src = audioCtx.createBufferSource();
      src.buffer = getGunNoiseBuffer(0.09);
      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(1150, t0);
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.0001, t0);
      ng.gain.exponentialRampToValueAtTime(0.16, t0 + 0.004);
      ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
      src.connect(lp); lp.connect(ng); ng.connect(audioSfx);
      try { src.start(t0); src.stop(t0 + 0.10); } catch (_) {}
    }

    function playGunSound(w) {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      if (state.weaponIndex === 4) return;
      if (state.weaponIndex === 9) { playAsValGunSound(w); return; }
      if (state.weaponIndex === 5) {
        playAmrGunSound();
        return;
      }
      if (state.weaponIndex === 6) {
        const skin = (w && w.soundSkin) || "revengeClassic";
        if (typeof GunSFX !== "undefined" && GunSFX.shot) GunSFX.shot(skin);
        return;
      }
      void w;
      const now = audioCtx.currentTime;
      const idx = state.weaponIndex;
      if (idx === 0 && pistolFireBuffer) {
        const bs = audioCtx.createBufferSource();
        bs.buffer = pistolFireBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 0.85;
        bs.connect(g);
        g.connect(audioSfx);
        try { bs.start(); } catch (_) {}
        return;
      }
      // AR (index 1): shot #5 with its natural reverb tail (AR.wav 354–800 ms slice).
      // Stop the previous AR source so auto-fire doesn't pile overlapping tails into a wash.
      // Gain pushed above 1.0 (other guns sit at 0.85–0.92) so the AR is clearly the loudest
      // weapon. Peaks will clip into the destination — that's intentional, gunshots clipping
      // sound punchier than clean levels. Slightly quieter than before (1.6 vs 1.8) so the
      // AR is loud but not painfully so in headphones.
      if (idx === 1 && arFireBuffer) {
        if (arCurrentSource) {
          try { arCurrentSource.stop(); } catch (_) {}
        }
        const bs = audioCtx.createBufferSource();
        bs.buffer = arFireBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 1.6;
        bs.connect(g);
        g.connect(audioSfx);
        arCurrentSource = bs;
        try { bs.start(); } catch (_) {}
        return;
      }
      // Shotgun (index 2): front section of the cinematic shotgun MP3 = the blast
      // Adjust SHOTGUN_FIRE_OFFSET / SHOTGUN_FIRE_DUR to fine-tune start/length
      if (idx === 2 && shotgunFireBuffer) {
        const SHOTGUN_FIRE_OFFSET = 0.62; // gunshot 0.62s → 1.70s
        const SHOTGUN_FIRE_DUR   = 1.08;
        const bs = audioCtx.createBufferSource();
        bs.buffer = shotgunFireBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 0.92;
        bs.connect(g);
        g.connect(audioSfx);
        try { bs.start(0, SHOTGUN_FIRE_OFFSET, SHOTGUN_FIRE_DUR); } catch (_) {}
        return;
      }
      // SMG (index 3): single-shot slice 0.40s → 0.47s from machine-gun MP3
      if (idx === 3 && smgFireBuffer) {
        const bs = audioCtx.createBufferSource();
        bs.buffer = smgFireBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 0.88;
        bs.connect(g);
        g.connect(audioSfx);
        try { bs.start(0, 0.40, 0.07); } catch (_) {}
        return;
      }
      // ～～～ (index 8): lazer gun MP3
      if (idx === 8) {
        if (devGunBuffer) {
          const bs8 = audioCtx.createBufferSource();
          bs8.buffer = devGunBuffer;
          const g8 = audioCtx.createGain();
          g8.gain.value = 0.9;
          bs8.connect(g8);
          g8.connect(audioSfx);
          try { bs8.start(); } catch (_) {}
        } else {
          void ensureDevGunBuffer();
        }
        return;
      }
      const presets = [
        { crackMs: 64, crackFc: 4300, crackQ: 0.84, crackG: 0.52, bodyMs: 170, bodyFc: 980, bodyG: 0.2, mechHz: 980, mechG: 0.03, tailMs: 260, tailFc: 1200, tailG: 0.08, echoDelay: 0.072, echoFb: 0.26, echoG: 0.08 },
        { crackMs: 88, crackFc: 3600, crackQ: 0.72, crackG: 0.68, bodyMs: 250, bodyFc: 740, bodyG: 0.28, mechHz: 760, mechG: 0.045, tailMs: 330, tailFc: 900, tailG: 0.12, echoDelay: 0.082, echoFb: 0.31, echoG: 0.11 },
        { crackMs: 110, crackFc: 2500, crackQ: 0.56, crackG: 0.82, bodyMs: 330, bodyFc: 520, bodyG: 0.38, mechHz: 520, mechG: 0.02, tailMs: 420, tailFc: 760, tailG: 0.18, echoDelay: 0.094, echoFb: 0.36, echoG: 0.16 },
        { crackMs: 56, crackFc: 5200, crackQ: 0.92, crackG: 0.45, bodyMs: 185, bodyFc: 1200, bodyG: 0.17, mechHz: 1080, mechG: 0.03, tailMs: 240, tailFc: 1600, tailG: 0.07, echoDelay: 0.064, echoFb: 0.22, echoG: 0.06 },
      ];
      const p = presets[idx] || presets[1];

      const crackSrc = audioCtx.createBufferSource();
      crackSrc.buffer = getGunNoiseBuffer(p.crackMs / 1000);
      const crackBp = audioCtx.createBiquadFilter();
      crackBp.type = "bandpass";
      crackBp.frequency.setValueAtTime(p.crackFc, now);
      crackBp.Q.setValueAtTime(p.crackQ, now);
      const crackGain = audioCtx.createGain();
      crackGain.gain.setValueAtTime(0.0001, now);
      crackGain.gain.exponentialRampToValueAtTime(p.crackG, now + 0.003);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, now + p.crackMs / 1000);
      crackSrc.connect(crackBp);
      crackBp.connect(crackGain);
      crackGain.connect(audioSfx);
      crackSrc.start(now);
      crackSrc.stop(now + p.crackMs / 1000 + 0.03);

      const bodySrc = audioCtx.createBufferSource();
      bodySrc.buffer = getGunNoiseBuffer(p.bodyMs / 1000);
      const bodyLp = audioCtx.createBiquadFilter();
      bodyLp.type = "lowpass";
      bodyLp.frequency.setValueAtTime(p.bodyFc, now);
      const bodyGain = audioCtx.createGain();
      bodyGain.gain.setValueAtTime(0.0001, now + 0.002);
      bodyGain.gain.exponentialRampToValueAtTime(p.bodyG, now + 0.014);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + p.bodyMs / 1000);
      bodySrc.connect(bodyLp);
      bodyLp.connect(bodyGain);
      bodyGain.connect(audioSfx);
      bodySrc.start(now + 0.0015);
      bodySrc.stop(now + p.bodyMs / 1000 + 0.05);

      const mech = audioCtx.createOscillator();
      mech.type = idx === 2 ? "sawtooth" : "triangle";
      mech.frequency.setValueAtTime(p.mechHz, now);
      mech.frequency.exponentialRampToValueAtTime(Math.max(180, p.mechHz * 0.55), now + 0.08);
      const mechHp = audioCtx.createBiquadFilter();
      mechHp.type = "highpass";
      mechHp.frequency.setValueAtTime(450, now);
      const mechGain = audioCtx.createGain();
      mechGain.gain.setValueAtTime(0.0001, now);
      mechGain.gain.exponentialRampToValueAtTime(p.mechG, now + 0.005);
      mechGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      mech.connect(mechHp);
      mechHp.connect(mechGain);
      mechGain.connect(audioSfx);
      mech.start(now + 0.001);
      mech.stop(now + 0.105);

      const tailSrc = audioCtx.createBufferSource();
      tailSrc.buffer = getGunNoiseBuffer(p.tailMs / 1000);
      const tailBp = audioCtx.createBiquadFilter();
      tailBp.type = "bandpass";
      tailBp.frequency.setValueAtTime(p.tailFc, now);
      tailBp.Q.setValueAtTime(0.5, now);
      const tailGain = audioCtx.createGain();
      tailGain.gain.setValueAtTime(0.0001, now + 0.006);
      tailGain.gain.exponentialRampToValueAtTime(p.tailG, now + 0.035);
      tailGain.gain.exponentialRampToValueAtTime(0.0001, now + p.tailMs / 1000);
      tailSrc.connect(tailBp);
      tailBp.connect(tailGain);
      tailGain.connect(audioSfx);
      tailSrc.start(now + 0.006);
      tailSrc.stop(now + p.tailMs / 1000 + 0.06);

      const echoIn = audioCtx.createGain();
      echoIn.gain.setValueAtTime(p.echoG, now);
      const delay = audioCtx.createDelay(0.22);
      delay.delayTime.setValueAtTime(p.echoDelay, now);
      const feedback = audioCtx.createGain();
      feedback.gain.setValueAtTime(p.echoFb, now);
      const echoLp = audioCtx.createBiquadFilter();
      echoLp.type = "lowpass";
      echoLp.frequency.setValueAtTime(Math.max(700, p.tailFc * 1.1), now);
      bodyGain.connect(echoIn);
      echoIn.connect(delay);
      delay.connect(echoLp);
      echoLp.connect(audioSfx);
      delay.connect(feedback);
      feedback.connect(delay);
      feedback.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    }

    let flashlightAudioBuffer = null;
    let flashlightSoundLoadPromise = null;

    let dashAudioBuffer = null;
    let dashSoundLoadPromise = null;

    let knifeAudioBuffer = null;
    let knifeSoundLoadPromise = null;

    function getKnifeSoundUrl() {
      return getMedpackSoundUrl("knife.ogg");
    }

    function ensureKnifeSoundBuffer() {
      if (knifeAudioBuffer) return Promise.resolve();
      if (!knifeSoundLoadPromise) {
        knifeSoundLoadPromise = fetch(getKnifeSoundUrl())
          .then((res) => {
            if (!res.ok) throw new Error("knife fetch");
            return res.arrayBuffer();
          })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => {
            knifeAudioBuffer = buf;
          })
          .catch(() => {
            knifeSoundLoadPromise = null;
          });
      }
      return knifeSoundLoadPromise;
    }

    // ── Med pack SFX (medpack.ogg / medpack-5s.ogg / medpack-8s.ogg) ──
    // 3 separate files for the 3 events:
    //  - medpack.ogg:    played when the player switches to the med pack weapon
    //  - medpack-5s.ogg: played when a heal completes in PVP (5s hold)
    //  - medpack-8s.ogg: played when a heal completes in PVE (8s hold)
    let medpackSwitchBuffer = null;
    let medpack5sBuffer = null;
    let medpack8sBuffer = null;
    let medpackSwitchLoadPromise = null;
    let medpack5sLoadPromise = null;
    let medpack8sLoadPromise = null;

    function getMedpackSoundUrl(filename) {
      // All med pack SFX live in media/ alongside the other sound effects.
      const path = "media/" + filename;
      for (const base of getGameAssetBaseCandidates()) {
        try { return new URL(path, normalizeGameAssetBase(base)).href; } catch (_) {}
      }
      try { return new URL(path, pageDirFromLocation()).href; } catch (_) { return path; }
    }

    function ensureMedpackSwitchBuffer() {
      if (medpackSwitchBuffer) return Promise.resolve();
      if (!medpackSwitchLoadPromise) {
        medpackSwitchLoadPromise = fetch(getMedpackSoundUrl("medpack.ogg"))
          .then((res) => { if (!res.ok) throw new Error("medpack fetch"); return res.arrayBuffer(); })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => { medpackSwitchBuffer = buf; })
          .catch(() => { medpackSwitchLoadPromise = null; });
      }
      return medpackSwitchLoadPromise;
    }
    function ensureMedpack5sBuffer() {
      if (medpack5sBuffer) return Promise.resolve();
      if (!medpack5sLoadPromise) {
        medpack5sLoadPromise = fetch(getMedpackSoundUrl("medpack-5s.ogg"))
          .then((res) => { if (!res.ok) throw new Error("medpack-5s fetch"); return res.arrayBuffer(); })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => { medpack5sBuffer = buf; })
          .catch(() => { medpack5sLoadPromise = null; });
      }
      return medpack5sLoadPromise;
    }
    function ensureMedpack8sBuffer() {
      if (medpack8sBuffer) return Promise.resolve();
      if (!medpack8sLoadPromise) {
        medpack8sLoadPromise = fetch(getMedpackSoundUrl("medpack-8s.ogg"))
          .then((res) => { if (!res.ok) throw new Error("medpack-8s fetch"); return res.arrayBuffer(); })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => { medpack8sBuffer = buf; })
          .catch(() => { medpack8sLoadPromise = null; });
      }
      return medpack8sLoadPromise;
    }

    function _playMedpackOgg(buf, gain = 0.9) {
      try {
        const bs = audioCtx.createBufferSource();
        bs.buffer = buf;
        const g = audioCtx.createGain();
        g.gain.value = gain;
        bs.connect(g);
        g.connect(audioSfx);
        // bs.start() (no offset/offset=0) — a 1ms offset caused audible glitches
        // on some Web Audio implementations because the audio engine retimes the
        // source at start. Use offset=0 so the source plays immediately and
        // without artifacts.
        bs.start();
      } catch (e) {
        if (window.__fpsDartDebug) console.info("[zone-no-light] medpack play failed:", e?.message);
      }
    }

    function playMedPackSwitchSound() {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      if (medpackSwitchBuffer) {
        _playMedpackOgg(medpackSwitchBuffer, 0.9);
        return;
      }
      void ensureMedpackSwitchBuffer().then(() => {
        if (medpackSwitchBuffer) _playMedpackOgg(medpackSwitchBuffer, 0.9);
      });
    }
    function playMedPackHealSound(durationSec) {
      // Pick the right OGG by the current mode's heal duration (5s PVP, 8s PVE).
      // The OGG is exactly the heal duration long, so it plays in sync with the ring
      // filling up and ends naturally when the heal completes. If the player releases
      // F/LMB before completion, the OGG plays out its remaining buffer — harmless.
      // Kept deliberately simple (no source-tracking, no early stop): the simpler the
      // path, the fewer ways it can break the medpack.
      if (audioCtx.state === "suspended") void audioCtx.resume();
      const is5 = Math.round(durationSec) === 5;
      const buf = is5 ? medpack5sBuffer : medpack8sBuffer;
      const loader = is5 ? ensureMedpack5sBuffer : ensureMedpack8sBuffer;
      if (buf) {
        _playMedpackOgg(buf, 0.95);
        return;
      }
      void loader().then(() => {
        const ready = is5 ? medpack5sBuffer : medpack8sBuffer;
        if (ready) _playMedpackOgg(ready, 0.95);
      });
    }

    function getDashSoundUrl() {
      return getMedpackSoundUrl("dash.ogg");
    }

    function ensureDashSoundBuffer() {
      if (dashAudioBuffer) return Promise.resolve();
      if (!dashSoundLoadPromise) {
        dashSoundLoadPromise = fetch(getDashSoundUrl())
          .then((res) => {
            if (!res.ok) throw new Error("dash fetch");
            return res.arrayBuffer();
          })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => {
            dashAudioBuffer = buf;
          })
          .catch(() => {
            dashSoundLoadPromise = null;
          });
      }
      return dashSoundLoadPromise;
    }

    function getFlashlightSoundUrl() {
      return getMedpackSoundUrl("flashlight.ogg");
    }

    function ensureFlashlightSoundBuffer() {
      if (flashlightAudioBuffer) return Promise.resolve();
      if (!flashlightSoundLoadPromise) {
        flashlightSoundLoadPromise = fetch(getFlashlightSoundUrl())
          .then((res) => {
            if (!res.ok) throw new Error("flashlight fetch");
            return res.arrayBuffer();
          })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => {
            flashlightAudioBuffer = buf;
          })
          .catch(() => {
            flashlightSoundLoadPromise = null;
          });
      }
      return flashlightSoundLoadPromise;
    }

    function playFlashlightToggleSound() {
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      void ensureFlashlightSoundBuffer().then(() => {
        if (!flashlightAudioBuffer) return;
        const bs = audioCtx.createBufferSource();
        bs.buffer = flashlightAudioBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 1;
        bs.connect(g);
        g.connect(audioSfx);
        try {
          bs.start();
        } catch (_) {}
      });
    }

    let pistolFireBuffer = null;
    let pistolFireLoadPromise = null;

    let shotgunFireBuffer = null;
    let shotgunLoadPromise = null;

    function b64ToArrayBufGame(b64) {
      const bin = atob(b64);
      const ab = new ArrayBuffer(bin.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
      return ab;
    }

    let smgFireBuffer = null;
    let smgLoadPromise = null;

    function ensureSmgBuffer() {
      if (smgFireBuffer) return Promise.resolve();
      if (!smgLoadPromise) {
        smgLoadPromise = audioCtx.decodeAudioData(b64ToArrayBufGame(_SMG_B64))
          .then((buf) => { smgFireBuffer = buf; })
          .catch(() => { smgLoadPromise = null; });
      }
      return smgLoadPromise;
    }
    void ensureSmgBuffer();

    // AR fire sound: shot #5 from the 5-shot recording with its natural reverb tail
    // (AR.wav 354–800 ms slice, stereo 128 kbps MP3, base64 inlined). The slice
    // already contains the reverb — re-applying layered synthesis would over-reverb
    // it — so we play the slice as-is. To keep auto-fire (fireDelay 98 ms, ~10
    // shots/sec) from accumulating overlapping tails, we hold a reference to the
    // previous BufferSource and .stop() it before starting the new one. Rapid
    // trigger = one new shot cutting the previous tail off mid-decay.
    let arFireBuffer = null;
    let arLoadPromise = null;
    let arCurrentSource = null;

    function ensureArBuffer() {
      if (arFireBuffer) return Promise.resolve();
      if (!arLoadPromise) {
        arLoadPromise = audioCtx.decodeAudioData(b64ToArrayBufGame(_AR_B64))
          .then((buf) => { arFireBuffer = buf; })
          .catch(() => { arLoadPromise = null; });
      }
      return arLoadPromise;
    }
    void ensureArBuffer();

    let drawSoundBuffer = null;
    let drawSoundLoadPromise = null;

    function ensureDrawSoundBuffer() {
      if (drawSoundBuffer) return Promise.resolve();
      if (!drawSoundLoadPromise) {
        drawSoundLoadPromise = audioCtx.decodeAudioData(b64ToArrayBufGame(_DRAW_B64))
          .then((buf) => { drawSoundBuffer = buf; })
          .catch(() => { drawSoundLoadPromise = null; });
      }
      return drawSoundLoadPromise;
    }
    void ensureDrawSoundBuffer();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INVENTORY / HOTBAR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const INV_CW = 70, INV_CH = 46; // canvas size per slot
    // v96: WEAPON_NAMES_INV / WEAPON_I18N_KEYS / weaponDisplayName moved up to right after tr() so
    // they are accessible from updateHud (which fires on initial load before this block executes).
    const INV_KEY_LABELS = ["1","2","3","4","5","6","7","0","/"];

    // ── 2D weapon silhouette drawing ─────────────────────────────────────────
    function drawWeaponIcon(ctx, widx, cw, ch) {
      ctx.clearRect(0, 0, cw, ch);
      const pad = 3;
      const aw = cw - pad*2, ah = ch - pad*2;
      // helpers
      function fr(x,y,w,h,col,r=0) {
        ctx.fillStyle = col;
        if (r>0&&ctx.roundRect){ctx.beginPath();ctx.roundRect(pad+x*aw,pad+y*ah,w*aw,h*ah,r);ctx.fill();}
        else ctx.fillRect(pad+x*aw,pad+y*ah,w*aw,h*ah);
      }
      function tri(pts,col){
        ctx.fillStyle=col;ctx.beginPath();
        ctx.moveTo(pad+pts[0][0]*aw,pad+pts[0][1]*ah);
        for(let i=1;i<pts.length;i++)ctx.lineTo(pad+pts[i][0]*aw,pad+pts[i][1]*ah);
        ctx.closePath();ctx.fill();
      }
      if(widx===8){
        ctx.fillStyle='rgba(255,215,0,0.6)';
        ctx.font=`bold ${Math.round(ch*0.58)}px 'Audiowide',monospace`;
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('?',cw/2,ch/2);
        return;
      }
      const M='#6a7280', MD='#374151', MB='#1f2937', ML='#9ca3af';
      const BR='#7c5a38', BRD='#4b3420';
      const GR='#3d6b40', GRL='#4e8455';
      const RD='#dc2626', WH='#f5f5f5', BL='#2563eb';
      switch(widx){
        case 0:{ // Pistol ─────────────────────────────────────────────────
          fr(0.26,0.10,0.46,0.38,M,2);   // slide
          fr(0.70,0.17,0.28,0.18,ML,1);  // barrel
          fr(0.28,0.10,0.08,0.10,MD);    // rear sight notch
          fr(0.27,0.46,0.15,0.46,MD,2);  // grip
          fr(0.30,0.42,0.18,0.20,MB,2);  // trigger guard
          fr(0.40,0.55,0.08,0.06,ML);    // trigger
          break;}
        case 1:{ // AR ─────────────────────────────────────────────────────
          fr(0.10,0.20,0.66,0.30,M,2);   // receiver
          fr(0.74,0.23,0.24,0.16,ML,1);  // barrel
          fr(0.00,0.22,0.13,0.26,MD,2);  // stock
          fr(0.26,0.48,0.11,0.40,MD,2);  // grip
          fr(0.37,0.50,0.11,0.44,MB,2);  // magazine
          fr(0.13,0.14,0.46,0.09,MB,1);  // rail top
          fr(0.54,0.22,0.20,0.24,MD,2);  // handguard
          fr(0.28,0.16,0.20,0.12,'#1a1a2e',2); // optic base
          break;}
        case 2:{ // Shotgun ────────────────────────────────────────────────
          fr(0.08,0.20,0.58,0.34,BR,2);  // body/wood
          fr(0.64,0.22,0.34,0.20,M,2);   // barrel (thick)
          fr(0.00,0.22,0.10,0.30,BRD,2); // stock
          fr(0.50,0.30,0.15,0.22,M,1);   // pump
          fr(0.14,0.50,0.11,0.36,BRD,2); // grip
          fr(0.10,0.18,0.40,0.06,BRD);   // top rib
          break;}
        case 3:{ // SMG ─────────────────────────────────────────────────────
          fr(0.16,0.18,0.58,0.30,M,2);   // receiver
          fr(0.72,0.21,0.26,0.14,ML,1);  // barrel
          fr(0.04,0.20,0.14,0.12,MD,2);  // folded stock
          fr(0.24,0.46,0.11,0.40,MD,2);  // grip
          fr(0.34,0.48,0.10,0.42,MB,3);  // magazine (curved)
          fr(0.48,0.18,0.16,0.10,MB,1);  // carry handle
          break;}
        case 9:{ // AS Val — ribbed suppressor, triangular skeleton stock ─────
          fr(0.30,0.30,0.30,0.22,M,2);   // receiver
          fr(0.30,0.24,0.26,0.07,MD,1);  // dust cover
          fr(0.58,0.26,0.40,0.20,MD,2);  // integral suppressor
          fr(0.62,0.24,0.015,0.24,MB);   // suppressor ribs
          fr(0.69,0.24,0.015,0.24,MB);
          fr(0.76,0.24,0.015,0.24,MB);
          fr(0.83,0.24,0.015,0.24,MB);
          fr(0.90,0.24,0.015,0.24,MB);
          fr(0.93,0.16,0.03,0.11,ML);    // front sight post
          fr(0.44,0.20,0.05,0.05,ML);    // rear sight
          fr(0.26,0.52,0.09,0.34,MB,2);  // pistol grip
          fr(0.36,0.52,0.09,0.36,MD,3);  // curved magazine
          fr(0.05,0.28,0.24,0.045,ML,1); // stock: top rail
          fr(0.05,0.50,0.24,0.045,ML,1); // stock: bottom rail
          fr(0.02,0.26,0.045,0.28,ML,1); // stock: butt plate
          break;}
        case 4:{ // Med Kit ───────────────────────────────────────────────
          fr(0.18,0.08,0.64,0.80,RD,4);  // body
          fr(0.22,0.42,0.56,0.18,WH,1);  // cross H
          fr(0.42,0.22,0.16,0.56,WH,1);  // cross V
          fr(0.35,0.00,0.30,0.12,BRD,3); // handle
          break;}
        case 5:{ // AMR ─────────────────────────────────────────────────────
          fr(0.08,0.24,0.50,0.28,M,2);   // receiver
          fr(0.56,0.26,0.42,0.12,ML,1);  // long barrel
          fr(0.00,0.25,0.10,0.28,MD,2);  // stock
          fr(0.14,0.50,0.09,0.38,MD,2);  // grip
          fr(0.22,0.52,0.11,0.44,MB,2);  // large mag
          fr(0.24,0.10,0.34,0.18,'#1a1a2e',3); // scope body
          fr(0.54,0.11,0.06,0.16,BL,2);  // scope lens R
          fr(0.26,0.11,0.06,0.16,BL,2);  // scope lens L
          fr(0.52,0.18,0.08,0.08,M);     // scope mount
          break;}
        case 6:{ // Dart Gun ───────────────────────────────────────────────
          fr(0.18,0.18,0.52,0.32,GR,2);  // body
          fr(0.68,0.21,0.30,0.16,GRL,1); // barrel
          fr(0.24,0.48,0.11,0.40,MD,2);  // grip
          fr(0.34,0.50,0.10,0.38,MB,2);  // magazine
          fr(0.24,0.10,0.24,0.12,'#1a3a1a',3); // mini scope
          fr(0.44,0.11,0.05,0.10,BL,2);  // lens
          break;}
        case 7:{ // Knife ──────────────────────────────────────────────────
          // blade (tapered triangle)
          tri([[0.34,0.28],[0.93,0.38],[0.93,0.50],[0.34,0.60]],ML);
          tri([[0.34,0.28],[0.93,0.38],[0.34,0.38]],'#c8cdd5'); // edge highlight
          fr(0.28,0.26,0.06,0.50,M,1);   // guard
          fr(0.04,0.28,0.25,0.44,BR,3);  // handle
          for(let i=0;i<4;i++) fr(0.06+i*0.056,0.30,0.018,0.40,BRD); // wraps
          break;}
      }
    }

    // ── Build DOM slots ──────────────────────────────────────────────────────
    const _invBar = document.getElementById("invBar");
    const _invSlotEls = [];
    const _invCanvases = [];
    const _healthBarWrap  = document.getElementById("healthBarWrap");
    const _healthBarFill  = document.getElementById("healthBarFill");
    const _castBarWrap    = document.getElementById("castBarWrap");
    const _castBarLabel   = document.getElementById("castBarLabel");
    const _castBarFill    = document.getElementById("castBarFill");

    // Cached per-frame HUD lookups — these elements are never recreated, so we
    // resolve them once and reuse the refs instead of re-querying every frame.
    let _needleHudEl = null;
    let _jetHudEl = null;
    let _needleLabelEl = null;
    let _needleBarFillEl = null;
    let _bossShakeBarEl = null;
    let _bossShakeBarFillEl = null;
    let _bossShakeBarLabelEl = null;
    let _healthBarKey = "";
    let _needleHudKey = "";

    function _buildInvBar() {
      _invBar.innerHTML = "";
      _invSlotEls.length = 0;
      _invCanvases.length = 0;
      // Loadout matches show only what you packed. Unrestricted maps keep the full bar
      // (8 configurable + the fixed hidden slot).
      const slotDefs = activeLoadout
        ? activeHotbarSlots()
        : [...gameSettings.weaponSlotOrder.map((w, i) => ({ key: LOADOUT_SLOT_KEYS[i], widx: w })),
           { key: "/", widx: 8 }];
      slotDefs.forEach(({ key: slotKey, widx }, slotIdx) => {
        const div = document.createElement("div");
        div.className = "inv-slot";
        div.dataset.slot = slotIdx;
        div.dataset.widx = widx;
        // key label
        const keyEl = document.createElement("div");
        keyEl.className = "inv-key";
        keyEl.textContent = slotKey || "";
        // canvas
        const cnv = document.createElement("canvas");
        cnv.width = INV_CW; cnv.height = INV_CH;
        cnv.style.width = INV_CW + "px";
        cnv.style.height = INV_CH + "px";
        // name — v96: tr() so all 18 languages get proper weapon names
        const nameEl = document.createElement("div");
        nameEl.className = "inv-name";
        nameEl.textContent = weaponDisplayName(widx);
        div.appendChild(keyEl);
        div.appendChild(cnv);
        div.appendChild(nameEl);
        // click to select
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          if (widx === 8) { if (DEV_GUN_UNLOCKED) weaponUnlocked[8]=true; trySelectWeapon(8); }
          else trySelectWeapon(widx);
        });
        _invBar.appendChild(div);
        _invSlotEls.push(div);
        _invCanvases.push(cnv);
        // draw weapon icon
        const ctx2 = cnv.getContext("2d");
        drawWeaponIcon(ctx2, widx, INV_CW, INV_CH);
        // lock display
        if (widx !== 8 && !weaponUnlocked[widx]) {
          div.classList.add("inv-locked");
        }
      });
    }

    /**
     * The hotbar is hidden during normal play and pops up from the bottom edge whenever the
     * player switches (or tries to switch) weapons, then slides back down. `flashInvBar()`
     * re-arms the visible window; updateInvBar() drives the slide every frame.
     */
    const INV_BAR_HOLD_MS = 2200;
    let _invBarShowUntil = 0;
    function flashInvBar() {
      _invBarShowUntil = performance.now() + INV_BAR_HOLD_MS;
    }

    function updateInvBar() {
      if (!_invBar) return;
      const inGame = gameWorldReady && menuEl && menuEl.style.display === "none";
      // Kept in the layout (rather than display:none) while in-game so the slide can animate.
      _invBar.style.display = inGame ? "flex" : "none";
      if (!inGame) return;
      const shown = performance.now() < _invBarShowUntil && player.health > 0;
      // The element's own inline style already carries translateX(-50%) for centring, so the
      // slide has to re-state it rather than replace it.
      _invBar.style.transform = shown
        ? "translateX(-50%) translateY(0)"
        : "translateX(-50%) translateY(135%)";
      _invBar.style.opacity = shown ? "1" : "0";
      _invBar.style.pointerEvents = shown ? "auto" : "none";
      const curW = state.weaponIndex;
      _invSlotEls.forEach((div, i) => {
        const widx = parseInt(div.dataset.widx);
        const active = widx === curW;
        div.classList.toggle("inv-active", active);
        // refresh lock status
        div.classList.toggle("inv-locked", widx !== 8 && !weaponAvailable(widx));
      });
    }

    // ── Health bar + cast bar HUD ────────────────────────────────────────────
    function updateHealthBarHud() {
      if (!_healthBarWrap || !_healthBarFill) return;
      const inGame = gameWorldReady && menuEl && menuEl.style.display === "none";
      _healthBarWrap.style.display = inGame ? "flex" : "none";
      if (!inGame) {
        if (_castBarWrap) _castBarWrap.style.display = "none";
        return;
      }
      // ── HP bar ───────────────────────────────────────────────────────────
      const pct = player.maxHealth > 0
        ? Math.max(0, Math.min(1, player.health / player.maxHealth)) : 0;
      const pctStr = (pct * 100).toFixed(1);
      const hbLow = pct <= 0.28;
      const hbGrad =
        pct > 0.55
          ? "linear-gradient(90deg, #17c85b, #65ff8f)"
          : pct > 0.28
            ? "linear-gradient(90deg, #ffb21f, #ffe15c)"
            : "linear-gradient(90deg, #ff2f2f, #ff7a4e)";
      const hbShadow =
        pct > 0.55
          ? "0 0 10px rgba(35,255,120,0.38), inset 0 1px 0 rgba(255,255,255,0.26)"
          : pct > 0.28
            ? "0 0 10px rgba(255,205,45,0.34), inset 0 1px 0 rgba(255,255,255,0.24)"
            : "0 0 13px rgba(255,55,40,0.55), inset 0 1px 0 rgba(255,255,255,0.20)";
      // Skip the 4 style writes while health is static (the common case at full HP).
      const hbKey = `${pctStr}|${hbLow}|${hbGrad}|${hbShadow}`;
      if (hbKey !== _healthBarKey) {
        _healthBarKey = hbKey;
        _healthBarFill.style.width = pctStr + "%";
        _healthBarWrap.classList.toggle("hb-low", hbLow);
        _healthBarFill.style.background = hbGrad;
        _healthBarFill.style.boxShadow = hbShadow;
      }

      // ── Cast bar (highest-priority active cast) ───────────────────────────
      let hasCast = false, castProg = 0, castLbl = "", castCol = "#22ccaa";

      // Priority 1: Speed Needle injection
      if (state.speedNeedle && state.speedNeedle.phase === "injecting") {
        const elapsed = performance.now() - state.speedNeedle.animStart;
        castProg = Math.min(1, elapsed / NEEDLE_INJECT_DUR_MS);
        castLbl  = tr("needleInjecting", "Injecting...");
        castCol  = "#88ccff";
        hasCast  = true;
      }
      // Priority 2: Medkit healing
      else if (state.medKitHealProgress > 0) {
        castProg = state.medKitHealProgress;
        castLbl  = tr("medkitHold", "HOLD F");
        castCol  = "#22dd88";
        hasCast  = true;
      }
      // Priority 3: Reload (skip medkit slot)
      else if (state.reloading && state.weaponIndex !== 4) {
        const total     = weapon().reloadTime || 1;
        const remaining = state.reloadEnd - performance.now();
        castProg = THREE.MathUtils.clamp(1 - remaining / total, 0, 1);
        castLbl  = "RELOAD";
        castCol  = "#8899cc";
        hasCast  = true;
      }

      if (_castBarWrap && _castBarFill && _castBarLabel) {
        _castBarWrap.style.display = hasCast ? "flex" : "none";
        if (hasCast) {
          _castBarLabel.textContent = castLbl;
          _castBarFill.style.width  = (castProg * 100).toFixed(1) + "%";
          _castBarFill.style.background = castCol;
        }
      }
    }

    // ── Hotbar settings section ──────────────────────────────────────────────
    function _buildHotbarSettings() {
      const container = document.getElementById("hotbarOrderSlots");
      if (!container) return;
      container.innerHTML = "";
      const order = gameSettings.weaponSlotOrder;
      order.forEach((widx, slotIdx) => {
        const div = document.createElement("div");
        div.className = "hb-order-slot";
        div.dataset.slot = String(slotIdx);
        const keyEl = document.createElement("div");
        keyEl.className = "hb-order-key";
        keyEl.textContent = tr("hbKeyLabel", "Key") + " " + INV_KEY_LABELS[slotIdx];
        const cnv = document.createElement("canvas");
        cnv.width = 56; cnv.height = 36;
        cnv.style.width = "56px"; cnv.style.height = "36px";
        const ctx2 = cnv.getContext("2d");
        drawWeaponIcon(ctx2, widx, 56, 36);
        const nameEl = document.createElement("div");
        nameEl.className = "hb-order-name";
        nameEl.textContent = weaponDisplayName(widx);
        div.appendChild(keyEl); div.appendChild(cnv); div.appendChild(nameEl);
        attachHotbarDragHandlers(div, slotIdx, container);
        container.appendChild(div);
      });
    }

    /**
     * Pointer-driven drag-to-reorder for one hotbar slot. Works on both mouse
     * and touch: a small movement threshold (6px) distinguishes a drag from a
     * stationary tap. Drop semantics: remove the source slot's weapon from its
     * current position and insert it at the target slot's position, shifting
     * the displaced items by one — i.e. standard list reorder, not swap.
     */
    function attachHotbarDragHandlers(el, slotIdx, container) {
      const DRAG_THRESHOLD_PX = 6;
      let pointerId = null;
      let startX = 0, startY = 0;
      let dragging = false;
      let lastTarget = null;

      function clearTarget() {
        if (lastTarget) {
          lastTarget.classList.remove("hb-drop-target");
          lastTarget = null;
        }
      }

      function onPointerDown(e) {
        // Only react to primary button (or touch/pen). Ignore right-clicks etc.
        if (e.button !== undefined && e.button !== 0) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        dragging = false;
        try { el.setPointerCapture(pointerId); } catch (_) {}
      }

      function onPointerMove(e) {
        if (pointerId === null || e.pointerId !== pointerId) return;
        if (!dragging) {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
          dragging = true;
          el.classList.add("hb-dragging");
        }
        // Find the slot under the pointer (if any) for visual feedback.
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const slot = target && target.closest ? target.closest(".hb-order-slot") : null;
        if (slot && slot !== el && slot.parentElement === container) {
          if (lastTarget !== slot) {
            clearTarget();
            slot.classList.add("hb-drop-target");
            lastTarget = slot;
          }
        } else {
          clearTarget();
        }
      }

      function onPointerUp(e) {
        if (pointerId === null || e.pointerId !== pointerId) return;
        const wasDragging = dragging;
        try { el.releasePointerCapture(pointerId); } catch (_) {}
        el.classList.remove("hb-dragging");
        const upX = e.clientX, upY = e.clientY;
        pointerId = null;
        dragging = false;
        if (!wasDragging) {
          // A stationary tap (didn't pass the movement threshold). Do nothing —
          // the old click-to-swap behavior was confusing and a passive slot here
          // is more predictable.
          clearTarget();
          return;
        }
        // Re-resolve target at release time in case it changed.
        const target = document.elementFromPoint(upX, upY);
        const slot = target && target.closest ? target.closest(".hb-order-slot") : null;
        clearTarget();
        if (!slot || slot === el || slot.parentElement !== container) return;
        const fromIdx = slotIdx;
        const toIdx = Number(slot.dataset.slot);
        if (!Number.isFinite(toIdx) || fromIdx === toIdx) return;
        // Reorder via splice: pull from fromIdx, insert at toIdx in the
        // already-shortened array. Works for forward and backward moves.
        const arr = gameSettings.weaponSlotOrder.slice();
        const [moved] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, moved);
        gameSettings.weaponSlotOrder = arr;
        saveGameSettings();
        _buildHotbarSettings();
        _buildInvBar();
      }

      function onPointerCancel() {
        if (pointerId !== null) {
          try { el.releasePointerCapture(pointerId); } catch (_) {}
        }
        pointerId = null;
        dragging = false;
        el.classList.remove("hb-dragging");
        clearTarget();
      }

      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerup", onPointerUp);
      el.addEventListener("pointercancel", onPointerCancel);
    }

    // Reset hotbar
    document.getElementById("btnResetHotbar")?.addEventListener("click", () => {
      gameSettings.weaponSlotOrder = [0, 2, 3, 1, 5, 6, 4, 7, 9];
      saveGameSettings();
      _buildHotbarSettings();
      _buildInvBar();
    });

    // Rebuild when settings tab opens (HOTBAR tab)
    document.getElementById("settingsTabHotbar")?.addEventListener("click", () => {
      _buildHotbarSettings();
    });

    // ── Server config UI wiring ──
    // The server URL is read once at page load by getMultiplayerOrigin(). Changing
    // it here just updates gameSettings + localStorage; the user must reload for
    // the new origin to take effect on the socket. The "Save & reload" button
    // handles both the save and the reload in one step.
    (function setupServerConfigUI() {
      const sel      = document.getElementById("serverModeSelect");
      const manualW  = document.getElementById("serverManualWrap");
      const localW   = document.getElementById("serverLocalWrap");
      const urlIn    = document.getElementById("serverUrlInput");
      const urlErr   = document.getElementById("serverUrlError");
      const list     = document.getElementById("serverLocalList");
      const scanBtn  = document.getElementById("btnServerScan");
      const scanStat = document.getElementById("serverScanStatus");
      const applyBtn = document.getElementById("btnServerApply");
      const applyHint= document.getElementById("serverApplyHint");
      const current  = document.getElementById("serverCurrentValue");
      if (!sel || !manualW || !localW || !urlIn || !list || !scanBtn || !applyBtn || !current) return;

      // ── Helpers ──
      function isValidUrl(s) {
        if (typeof s !== "string" || !s) return false;
        try {
          const u = new URL(s);
          if (u.protocol !== "http:" && u.protocol !== "https:") return false;
          return true;
        } catch (_) { return false; }
      }
      function showApplyHint(msg, color) {
        applyHint.textContent = msg;
        applyHint.style.color = color || "#88dd88";
        applyHint.style.display = "block";
      }
      function refreshCurrentLine() {
        // Use getMultiplayerOrigin() so the live value (which may differ from
        // gameSettings on the first paint if the meta tag has a value) is shown.
        current.textContent = getMultiplayerOrigin() || "(none)";
      }
      function applyMode() {
        manualW.style.display = sel.value === "manual" ? "block" : "none";
        localW.style.display  = sel.value === "local"  ? "block" : "none";
        if (sel.value === "manual") {
          urlIn.value = gameSettings.serverManualUrl || "";
          validateManual();
        } else {
          urlErr.style.display = "none";
          urlIn.classList.remove("invalid");
        }
      }
      function validateManual() {
        const v = (urlIn.value || "").trim();
        if (!v) {
          urlErr.style.display = "none";
          urlIn.classList.remove("invalid");
          return false;
        }
        if (!isValidUrl(v)) {
          urlErr.textContent = "Invalid URL — must start with http:// or https://";
          urlErr.style.display = "block";
          urlIn.classList.add("invalid");
          return false;
        }
        urlErr.style.display = "none";
        urlIn.classList.remove("invalid");
        return true;
      }
      function renderLocalList() {
        // Clear and re-render. Mark the currently picked one with `.picked`.
        list.innerHTML = "";
        // We don't have a "discovered list" persisted (the scan is in-memory only)
        // so the list is whatever the user clicked during this session. The picked
        // state is gameSettings.serverLocalUrl, which IS persisted.
        const url = gameSettings.serverLocalUrl;
        if (!url) return;
        const li = document.createElement("li");
        li.className = "picked";
        const urlSpan = document.createElement("span");
        urlSpan.className = "server-local-url";
        urlSpan.textContent = url;
        const meta = document.createElement("span");
        meta.className = "server-local-meta";
        meta.textContent = "SELECTED";
        li.appendChild(urlSpan);
        li.appendChild(meta);
        li.addEventListener("click", () => {
          // Clicking the already-picked row is a no-op; clicking another row
          // (added by future scan) would re-render. The scan adds new rows here.
        });
        list.appendChild(li);
      }

      // ── Wire events ──
      sel.addEventListener("change", () => {
        applyMode();
        // Persist the mode immediately so a reload with no further clicks still
        // lands on the chosen mode.
        gameSettings.serverMode = sel.value;
        if (sel.value === "manual") {
          if (validateManual()) gameSettings.serverManualUrl = urlIn.value.trim();
        } else if (sel.value === "local") {
          // (No local URL change here; the scan picks.)
        } else {
          // default — clear manual / local so the meta tag takes effect again.
          // (We do NOT wipe the saved values, just switch the active mode.)
        }
        saveGameSettings();
        refreshCurrentLine();
      });
      urlIn.addEventListener("input", () => {
        if (validateManual()) {
          gameSettings.serverManualUrl = urlIn.value.trim();
          // Not persisted here — the Apply button commits + reloads.
          refreshCurrentLine();
        }
      });
      applyBtn.addEventListener("click", () => {
        // Final validation for manual mode before saving+reloading.
        if (sel.value === "manual" && !validateManual()) {
          showApplyHint("Fix the URL before saving.", "#ff6e6e");
          return;
        }
        if (sel.value === "manual") {
          gameSettings.serverManualUrl = urlIn.value.trim();
        }
        gameSettings.serverMode = sel.value;
        saveGameSettings();
        showApplyHint("Saved. Reloading…", "#88dd88");
        // Brief delay so the user sees the hint before the page tears down.
        setTimeout(() => { try { window.location.reload(); } catch (_) {} }, 250);
      });

      // ── Initial state ──
      sel.value = gameSettings.serverMode || "default";
      urlIn.value = gameSettings.serverManualUrl || "";
      applyMode();
      renderLocalList();
      refreshCurrentLine();

      // Expose a small API the local-discovery code can use to add rows to the
      // list as it finds them. Keeps the scan loop decoupled from the DOM.
      window.__fpsServerDiscovery = {
        addRow(url, latencyMs) {
          // Avoid duplicate rows.
          for (const li of list.children) {
            if (li.querySelector(".server-local-url")?.textContent === url) {
              const lat = li.querySelector(".server-local-latency");
              if (lat && typeof latencyMs === "number") lat.textContent = latencyMs + " ms";
              return;
            }
          }
          const li = document.createElement("li");
          const urlSpan = document.createElement("span");
          urlSpan.className = "server-local-url";
          urlSpan.textContent = url;
          const lat = document.createElement("span");
          lat.className = "server-local-latency";
          lat.textContent = typeof latencyMs === "number" ? (latencyMs + " ms") : "ok";
          li.appendChild(urlSpan);
          li.appendChild(lat);
          li.addEventListener("click", () => {
            gameSettings.serverLocalUrl = url;
            gameSettings.serverMode = "local";
            saveGameSettings();
            sel.value = "local";
            applyMode();
            renderLocalList();
            refreshCurrentLine();
          });
          // Insert in latency-sorted order (lowest first).
          const newMs = typeof latencyMs === "number" ? latencyMs : Infinity;
          const existing = Array.from(list.children).map(li => {
            const t = li.querySelector(".server-local-latency")?.textContent || "";
            const m = t.match(/(\d+)/);
            return { li, ms: m ? parseInt(m[1], 10) : Infinity };
          });
          const before = existing.find(e => e.ms > newMs);
          if (before) list.insertBefore(li, before.li);
          else list.appendChild(li);
        },
        setStatus(msg) { scanStat.textContent = msg || ""; },
        clearList() { list.innerHTML = ""; },
      };
    })();

    // Initial build
    _buildInvBar();

    /**
     * Local-server discovery. Probes localhost:1024 … localhost:99999 with a
     * bounded-concurrency fetch (no-cors, short timeout) and reports any port
     * that responds. Uses fetch with mode: "no-cors" so a successful opaque
     * response is enough to know the port is open — we don't need to read the
     * body. Capped at 200 in-flight to avoid hammering the local TCP stack.
     */
    (function setupServerDiscovery() {
      const btn   = document.getElementById("btnServerScan");
      const stat  = document.getElementById("serverScanStatus");
      const disc  = window.__fpsServerDiscovery;
      if (!btn || !stat || !disc) return;

      const MIN_PORT = 1024; // skip privileged ports — a user relay can’t realistically run below 1024
      const MAX_PORT = 99999;
      const CONCURRENCY = 200;
      const TIMEOUT_MS = 1200;

      let scanning = false;

      async function probeOnce(port) {
        const started = performance.now();
        try {
          // Probe the Socket.IO polling endpoint. A real relay/server will
          // answer with 200 + the Engine.IO open packet; anything else
          // (closed port, wrong service) refuses or times out.
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
          await fetch(`http://localhost:${port}/socket.io/?EIO=4&transport=polling`, {
            mode: "no-cors",
            cache: "no-store",
            signal: controller.signal,
          });
          clearTimeout(timer);
          return { ok: true, ms: performance.now() - started };
        } catch (_) {
          return { ok: false };
        }
      }

      async function scanAll() {
        if (scanning) return;
        scanning = true;
        btn.disabled = true;
        disc.clearList();
        let found = 0;
        let done = 0;
        const total = MAX_PORT - MIN_PORT + 1;
        const t0 = performance.now();

        const updateStatus = () => {
          const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
          disc.setStatus(`Scanning… ${done.toLocaleString()} / ${total.toLocaleString()}  (${found} found, ${elapsed}s)`);
        };
        updateStatus();

        // Producer/consumer with bounded concurrency.
        let next = MIN_PORT;
        async function worker() {
          while (true) {
            const port = next++;
            if (port > MAX_PORT) return;
            done++;
            const r = await probeOnce(port);
            if (r.ok) {
              found++;
              const url = `http://localhost:${port}`;
              disc.addRow(url, Math.round(r.ms));
            }
            if (done % 500 === 0) updateStatus();
          }
        }
        const workers = [];
        for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
        await Promise.all(workers);
        updateStatus();
        const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
        disc.setStatus(`Done. ${found} server${found === 1 ? "" : "s"} found in ${elapsed}s.`);
        btn.disabled = false;
        scanning = false;
      }

      btn.addEventListener("click", scanAll);
    })();



    let devGunBuffer = null;
    let devGunLoadPromise = null;

    function ensureDevGunBuffer() {
      if (devGunBuffer) return Promise.resolve();
      if (!devGunLoadPromise) {
        devGunLoadPromise = audioCtx.decodeAudioData(b64ToArrayBufGame(_DIVINE_B64_LAZER))
          .then((buf) => { devGunBuffer = buf; })
          .catch(() => { devGunLoadPromise = null; });
      }
      return devGunLoadPromise;
    }
    void ensureDevGunBuffer();

    let sniperFireBuffer = null;
    let sniperLoadPromise = null;

    function ensureSniperBuffer() {
      if (sniperFireBuffer) return Promise.resolve();
      if (!sniperLoadPromise) {
        sniperLoadPromise = audioCtx.decodeAudioData(b64ToArrayBufGame(_SNIPER_B64))
          .then((buf) => { sniperFireBuffer = buf; })
          .catch(() => { sniperLoadPromise = null; });
      }
      return sniperLoadPromise;
    }
    void ensureSniperBuffer();

    function ensureShotgunBuffer() {
      if (shotgunFireBuffer) return Promise.resolve();
      if (!shotgunLoadPromise) {
        shotgunLoadPromise = audioCtx.decodeAudioData(b64ToArrayBufGame(_SHOTGUN_B64))
          .then((buf) => { shotgunFireBuffer = buf; })
          .catch(() => { shotgunLoadPromise = null; });
      }
      return shotgunLoadPromise;
    }
    void ensureShotgunBuffer();

    function ensurePistolFireBuffer() {
      if (pistolFireBuffer) return Promise.resolve();
      if (!pistolFireLoadPromise) {
        pistolFireLoadPromise = fetch("https://cdn.jsdelivr.net/gh/indiamonda/perfectnip.github.io@main/q/g/krunker-io/sound/weapon_4.mp3")
          .then((res) => {
            if (!res.ok) throw new Error("pistol fire fetch");
            return res.arrayBuffer();
          })
          .then((arr) => audioCtx.decodeAudioData(arr.slice(0)))
          .then((buf) => { pistolFireBuffer = buf; })
          .catch(() => { pistolFireLoadPromise = null; });
      }
      return pistolFireLoadPromise;
    }
    void ensurePistolFireBuffer();

    /** Local player hurt: bullet (PvP / default MP) vs melee (zombie). Uses Web Audio only. */
    function playReceivedDamageSound(kind) {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      const melee = kind === "melee";
      const now = audioCtx.currentTime;
      const buf = getGunNoiseBuffer(melee ? 0.15 : 0.085);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const bp = audioCtx.createBiquadFilter();
      bp.type = melee ? "lowpass" : "bandpass";
      bp.frequency.setValueAtTime(melee ? 680 : 3100, now);
      if (!melee) bp.Q.setValueAtTime(0.82, now);
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.0001, now);
      ng.gain.exponentialRampToValueAtTime(melee ? 0.38 : 0.34, now + 0.014);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + (melee ? 0.17 : 0.095));
      src.connect(bp);
      bp.connect(ng);
      ng.connect(audioSfx);
      src.start(now);
      src.stop(now + 0.22);
      if (melee) {
        const o = audioCtx.createOscillator();
        o.type = "triangle";
        o.frequency.setValueAtTime(88, now);
        o.frequency.exponentialRampToValueAtTime(48, now + 0.13);
        const og = audioCtx.createGain();
        og.gain.setValueAtTime(0.0001, now);
        og.gain.exponentialRampToValueAtTime(0.09, now + 0.022);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 420;
        o.connect(lp);
        lp.connect(og);
        og.connect(audioSfx);
        o.start(now);
        o.stop(now + 0.16);
      } else {
        const o = audioCtx.createOscillator();
        o.type = "square";
        o.frequency.setValueAtTime(2200, now);
        o.frequency.exponentialRampToValueAtTime(760, now + 0.048);
        const og = audioCtx.createGain();
        og.gain.setValueAtTime(0.0001, now);
        og.gain.exponentialRampToValueAtTime(0.048, now + 0.006);
        og.gain.exponentialRampToValueAtTime(0.0001, now + 0.072);
        const hp = audioCtx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 620;
        o.connect(hp);
        hp.connect(og);
        og.connect(audioSfx);
        o.start(now);
        o.stop(now + 0.085);
      }
    }

    function triggerCamShake(add = 0.09) {
      const s = getQualityPresentationScale();
      state.camShake = Math.min(0.38, state.camShake + add * s);
    }

    function createBulletMark(point, normal) {
      if (decalGroup.children.length > 80) {
        const old = decalGroup.children[0];
        decalGroup.remove(old);
        old.geometry.dispose();
        old.material.dispose();
      }

      const mark = new THREE.Mesh(
        new THREE.CircleGeometry(0.08, 8),
        new THREE.MeshBasicMaterial({
          color: 0x1a1a1a,
          transparent: true,
          opacity: 0.85
        })
      );

      mark.position.copy(point).add(normal.clone().multiplyScalar(0.01));
      mark.lookAt(point.clone().add(normal));
      decalGroup.add(mark);
    }

    function createSparks(point, color = 0xffdd88) {
      _colPool.set(color);
      for (let i = 0; i < 4; i++) {
        const p = _sparkP[_sparkCursor];
        p.x = point.x; p.y = point.y; p.z = point.z;
        p.vx = (Math.random() - 0.5) * 2.4;
        p.vy = Math.random() * 1.8;
        p.vz = (Math.random() - 0.5) * 2.4;
        p.life = 0.18;
        sparkGroup.setColorAt(_sparkCursor, _colPool);
        _sparkCursor = (_sparkCursor + 1) % MAX_SPARK_MESHES;
      }
      if (sparkGroup.instanceColor) sparkGroup.instanceColor.needsUpdate = true;
    }

    let bossVictoryActive = false;
    let bossVictoryTimer = 0;
    let bossVictoryMsgShown = false;
    const bossGoldParticles = [];

    function checkAllBossesDead(pos) {
      if (bossVictoryActive) return;
      const anyBossAlive = state.enemies.some(e => e.isBoss && e.alive);
      if (anyBossAlive) return;
      triggerBossRoundEnd(pos);
    }

    function getBossRoundLabel(round) {
      // Difficulty colors are universal; labels are pulled from tr() so each language
      // gets the right "NORMAL/HARD/NIGHTMARE/HELL/HELL+N" wording.
      const colors = ["#aaa", "#ff8c00", "#cc33ff", "#ff2222"];
      const keys = ["bossRoundNormal", "bossRoundHard", "bossRoundNightmare", "bossRoundHell"];
      if (round <= keys.length) {
        return { name: tr(keys[round - 1], keys[round - 1].replace(/^bossRound/, "")), color: colors[round - 1] };
      }
      return {
        name: tr("bossRoundHellPlus", "HELL+{n}").replace("{n}", String(round - 4)),
        color: "#ff0000",
      };
    }

    function isFinalBossRound() {
      return BOSS_ROUND >= 4;
    }

    function spawnNextBossRound() {
      for (let i = bossProjectiles.length - 1; i >= 0; i--) destroyBossProjectile(i);
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        if (e.group) scene.remove(e.group);
      }
      state.enemies.length = 0;
      const round = BOSS_ROUND;
      const isHellRound = round >= 4;
      // Stats are fixed (no round scaling): normal 15000hp/50dmg, hell 75000hp/250dmg
      for (let i = 0; i < BOSS_FIGHT_COUNT; i++) {
        const { x, z } = findSpawnPosition(SPAWN_MIN_DIST_BASE);
        const boss = makeHormoneZombie(x, z, isHellRound);
        boss.netIndex = i;
        drawEnemyHp(boss);
        state.enemies.push(boss);
      }
      const darkFog = new THREE.Color(0x1a1a22);
      if (scene.fog) { scene.fog.color.copy(darkFog); scene.fog.near = 8; scene.fog.far = 50; }
      if (scene.background && scene.background.isColor) scene.background.copy(darkFog);
      camera.far = 98; camera.updateProjectionMatrix();
    }

    function triggerBossRoundEnd(pos) {
      bossVictoryActive = true;
      bossVictoryTimer = 0;
      bossVictoryMsgShown = false;
      BOSS_ROUND_ACTIVE = false;
      playBossRoarSfx();

      if (BOSS_HELL_MODE) {
        // 地狱级：其余小怪化作烟雾消失
        for (const e of state.enemies) {
          if (!e.isBoss && e.alive) {
            e.alive = false;
            e.respawnTimer = 999;
            e.dissolveTimer = DISSOLVE_DURATION + 0.12;
            const hitPt = new THREE.Vector3(e.group.position.x, 1.2, e.group.position.z);
            spawnHumanoidDissolve(e.group, hitPt);
            e.group.visible = false;
          }
        }
        // 在死亡地点生成紫色光圈
        bossDeathPickupPos = pos.clone();
        bossDeathPickupPos._picked = false;
        clearHellLootRing();
        const ringGeo = new THREE.TorusGeometry(1.8, 0.09, 16, 72);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xbb44ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        hellLootRing = new THREE.Mesh(ringGeo, ringMat);
        hellLootRing.rotation.x = -Math.PI / 2;
        hellLootRing.position.set(pos.x, 0.15, pos.z);
        hellLootRing._phase = 0;
        scene.add(hellLootRing);
        checkHellAchievement();
      } else if (isFinalBossRound()) {
        bossDeathPickupPos = pos.clone();
        bossDeathPickupPos._picked = false;
        checkHellAchievement();
      }

      const particleCount = Math.round(120 * BOSS_ROUND);
      const spreadMult = 1 + (BOSS_ROUND - 1) * 0.4;
      const speedMult = 1 + (BOSS_ROUND - 1) * 0.3;
      for (let i = 0; i < particleCount; i++) {
        const hue = 0.10 + Math.random() * 0.08;
        const color = new THREE.Color().setHSL(hue, 1.0, 0.55 + Math.random() * 0.3);
        const size = (0.08 + Math.random() * 0.18) * (1 + (BOSS_ROUND - 1) * 0.15);
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        const p = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
        p.position.set(
          pos.x + (Math.random() - 0.5) * 3 * spreadMult,
          pos.y + Math.random() * 4 * spreadMult,
          pos.z + (Math.random() - 0.5) * 3 * spreadMult
        );
        const speed = (2 + Math.random() * 5) * speedMult;
        const angle = Math.random() * Math.PI * 2;
        const upSpeed = (3 + Math.random() * 6) * speedMult;
        p.userData.vel = new THREE.Vector3(
          Math.cos(angle) * speed,
          upSpeed,
          Math.sin(angle) * speed
        );
        p.userData.life = (3.0 + Math.random() * 3.0) * (1 + (BOSS_ROUND - 1) * 0.2);
        p.userData.maxLife = p.userData.life;
        p.userData.rotSpeed = (Math.random() - 0.5) * 8;
        scene.add(p);
        bossGoldParticles.push(p);
      }

      const glowIntensity = 3 + BOSS_ROUND * 2;
      const glowDist = 15 + BOSS_ROUND * 5;
      const goldLight = new THREE.PointLight(0xffd700, glowIntensity, glowDist);
      goldLight.position.set(pos.x, pos.y + 2, pos.z);
      scene.add(goldLight);
      goldLight._bossGlow = true;
      goldLight._life = (4 + BOSS_ROUND) * 1.0;
      goldLight._maxLife = goldLight._life;
      goldLight._baseIntensity = glowIntensity;
      bossGoldParticles.push(goldLight);
    }

    function updateBossVictory(dt) {
      if (!bossVictoryActive) return;
      bossVictoryTimer += dt;

      for (let i = bossGoldParticles.length - 1; i >= 0; i--) {
        const p = bossGoldParticles[i];
        if (p._bossGlow) {
          p._life -= dt;
          if (p._life <= 0) {
            scene.remove(p);
            bossGoldParticles.splice(i, 1);
            continue;
          }
          const fade = Math.min(1, p._life / (p._maxLife * 0.3));
          p.intensity = p._baseIntensity * fade;
          continue;
        }
        p.userData.life -= dt;
        if (p.userData.life <= 0) {
          scene.remove(p);
          p.material.dispose();
          p.geometry.dispose();
          bossGoldParticles.splice(i, 1);
          continue;
        }
        p.userData.vel.y -= dt * 2.0;
        p.position.addScaledVector(p.userData.vel, dt);
        p.rotation.x += p.userData.rotSpeed * dt;
        p.rotation.y += p.userData.rotSpeed * dt * 0.7;
        const fade = Math.min(1, p.userData.life / (p.userData.maxLife * 0.3));
        p.material.opacity = fade;
      }

      if (bossVictoryTimer > 0.5 && bossVictoryTimer < 6.5) {
        const fogProgress = Math.min(1, (bossVictoryTimer - 0.5) / 5.0);
        const s = fogProgress * fogProgress * (3 - 2 * fogProgress);
        const darkFog = new THREE.Color(0x1a1a22);
        const clearFog = new THREE.Color(0x87ceeb);
        const blended = darkFog.clone().lerp(clearFog, s);
        if (scene.fog) scene.fog.color.copy(blended);
        if (scene.background && scene.background.isColor) scene.background.copy(blended);
        else scene.background = blended.clone();
        if (scene.fog) {
          scene.fog.near = THREE.MathUtils.lerp(8, 80, s);
          scene.fog.far = THREE.MathUtils.lerp(50, 280, s);
        }
        camera.far = THREE.MathUtils.clamp(scene.fog ? scene.fog.far + 48 : 280, 52, 320);
        camera.updateProjectionMatrix();
      }

      if (bossVictoryTimer >= 3.0 && !bossVictoryMsgShown) {
        bossVictoryMsgShown = true;
        const rl = getBossRoundLabel(BOSS_ROUND);
        const isFinal = isFinalBossRound();
        const overlay = document.createElement("div");
        overlay.id = "bossVictoryOverlay";
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:9999;pointer-events:none;";
        const title = document.createElement("div");
        title.textContent = isFinal
          ? tr("bossAllDefeated", "ALL BOSSES DEFEATED")
          : tr("bossRoundCleared", "ROUND {n} CLEAR").replace("{n}", String(BOSS_ROUND));
        title.style.cssText = `font-size:64px;font-weight:900;color:${isFinal ? "#ffd700" : rl.color};text-shadow:0 0 30px rgba(255,215,0,0.8),0 0 60px rgba(255,165,0,0.5),0 4px 12px rgba(0,0,0,0.7);letter-spacing:6px;opacity:0;animation:bossVicFadeIn 2s ease forwards;`;
        const sub = document.createElement("div");
        if (isFinal) {
          sub.textContent = tr("bossYouWin", "YOU WIN");
        } else {
          const nextRl = getBossRoundLabel(BOSS_ROUND + 1);
          sub.innerHTML = `${tr("bossDiffCleared", "Difficulty:")} <span style="color:${rl.color};">${rl.name}</span> → ${tr("bossNextRound", "Next round:")} <span style="color:${nextRl.color};">${nextRl.name}</span>`;
        }
        sub.style.cssText = "font-size:28px;font-weight:700;color:#fff;text-shadow:0 0 20px rgba(255,255,255,0.5),0 2px 8px rgba(0,0,0,0.6);margin-top:16px;letter-spacing:4px;opacity:0;animation:bossVicFadeIn 2s ease 0.8s forwards;";
        overlay.appendChild(title);
        overlay.appendChild(sub);
        document.body.appendChild(overlay);

        if (!document.getElementById("bossVicStyle")) {
          const st = document.createElement("style");
          st.id = "bossVicStyle";
          st.textContent = "@keyframes bossVicFadeIn{from{opacity:0;transform:translateY(20px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes bossVicFadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:translateY(-30px) scale(0.92)}}";
          document.head.appendChild(st);
        }

        const fadeDelay = isFinal ? 6000 : 4000;
        setTimeout(() => {
          const ovl = document.getElementById("bossVictoryOverlay");
          if (ovl) {
            ovl.style.animation = "bossVicFadeOut 1.5s ease forwards";
            setTimeout(() => { if (ovl.parentNode) ovl.remove(); }, 1600);
          }
        }, fadeDelay);
      }

      // Auto-advance to next round removed — each fight stays at selected difficulty.

      // 光圈脉冲动画
      if (hellLootRing) {
        hellLootRing._phase += dt;
        hellLootRing.material.opacity = 0.55 + 0.35 * Math.sin(hellLootRing._phase * 3.2);
        const pulse = 1.0 + 0.06 * Math.sin(hellLootRing._phase * 2.2);
        hellLootRing.scale.setScalar(pulse);
        hellLootRing.rotation.z += dt * 0.6; // 缓慢自转
      }
    }

    function createBlood(point) {
      for (let i = 0; i < 5; i++) {
        const p = _bloodP[_bloodCursor];
        p.x = point.x; p.y = point.y; p.z = point.z;
        p.vx = (Math.random() - 0.5) * 1.6;
        p.vy = Math.random() * 1.4;
        p.vz = (Math.random() - 0.5) * 1.6;
        p.life = 0.26;
        _bloodCursor = (_bloodCursor + 1) % MAX_BLOOD_MESHES;
      }
    }

    let _lastBossRoarTime = 0;
    function playBossRoarSfx() {
      const now = performance.now();
      if (now - _lastBossRoarTime < 4000) return;
      _lastBossRoarTime = now;
      try {
        const t0 = audioCtx.currentTime;
        const dur = 1.0 + Math.random() * 0.5;
        const sr = audioCtx.sampleRate;

        const nLen = sr * dur;
        const nBuf = audioCtx.createBuffer(1, nLen, sr);
        const nd = nBuf.getChannelData(0);
        let prev = 0;
        for (let i = 0; i < nLen; i++) {
          prev = prev * 0.92 + (Math.random() * 2 - 1) * 0.08;
          nd[i] = prev + Math.sin(i / sr * 2 * Math.PI * (40 + Math.random() * 10)) * 0.5;
        }
        const nSrc = audioCtx.createBufferSource();
        nSrc.buffer = nBuf;
        nSrc.playbackRate.setValueAtTime(0.8 + Math.random() * 0.3, t0);

        const bp1 = audioCtx.createBiquadFilter();
        bp1.type = "lowpass"; bp1.frequency.value = 350; bp1.Q.value = 2.5;
        const bp2 = audioCtx.createBiquadFilter();
        bp2.type = "peaking"; bp2.frequency.value = 120; bp2.gain.value = 12; bp2.Q.value = 1.5;
        const bp3 = audioCtx.createBiquadFilter();
        bp3.type = "peaking"; bp3.frequency.value = 220; bp3.gain.value = 8; bp3.Q.value = 2;

        const nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0, t0);
        nGain.gain.linearRampToValueAtTime(0.5, t0 + 0.08);
        nGain.gain.setValueAtTime(0.5, t0 + dur * 0.2);
        nGain.gain.linearRampToValueAtTime(0.55, t0 + dur * 0.35);
        nGain.gain.exponentialRampToValueAtTime(0.01, t0 + dur);

        const o1 = audioCtx.createOscillator();
        o1.type = "sawtooth";
        o1.frequency.setValueAtTime(55, t0);
        o1.frequency.linearRampToValueAtTime(42, t0 + dur * 0.5);
        o1.frequency.linearRampToValueAtTime(35, t0 + dur);
        const o1g = audioCtx.createGain();
        o1g.gain.setValueAtTime(0, t0);
        o1g.gain.linearRampToValueAtTime(0.30, t0 + 0.05);
        o1g.gain.exponentialRampToValueAtTime(0.01, t0 + dur);

        const o2 = audioCtx.createOscillator();
        o2.type = "square";
        o2.frequency.setValueAtTime(28, t0);
        o2.frequency.linearRampToValueAtTime(22, t0 + dur);
        const o2g = audioCtx.createGain();
        o2g.gain.setValueAtTime(0.15, t0);
        o2g.gain.exponentialRampToValueAtTime(0.01, t0 + dur * 0.8);

        const dist = audioCtx.createWaveShaperFunction
          ? null
          : (function() {
            const ws = audioCtx.createWaveShaper();
            const n = 256; const c = new Float32Array(n);
            for (let i = 0; i < n; i++) { const x = (i * 2) / n - 1; c[i] = Math.tanh(x * 3); }
            ws.curve = c; ws.oversample = "2x"; return ws;
          })();

        const master = audioCtx.createGain();
        master.gain.value = 0.45;

        nSrc.connect(bp1).connect(bp2).connect(bp3).connect(nGain).connect(master);
        o1.connect(o1g).connect(master);
        o2.connect(o2g).connect(master);
        if (dist) master.connect(dist).connect(audioSfx);
        else master.connect(audioSfx);

        nSrc.start(t0); nSrc.stop(t0 + dur);
        o1.start(t0); o1.stop(t0 + dur);
        o2.start(t0); o2.stop(t0 + dur);
      } catch (_) {}
    }

    function playKnifeSwingSound(duration = 0.22, peakGain = 0.28) {
      // Plays knife.ogg on every knife swing. The duration / peakGain parameters
      // are kept for API compatibility with the 3 call sites but are ignored
      // (we play the OGG at a single fixed level, with a small random pitch +
      // speed variation on every swing so repeated slashes don't sound identical).
      if (audioCtx.state === "suspended") void audioCtx.resume();
      // Slight per-swing variation: ±6% in playbackRate (which raises pitch and
      // speeds the sample up proportionally — both are "tiny").
      const rate = 1 + (Math.random() * 0.12 - 0.06);
      if (knifeAudioBuffer) {
        try {
          const bs = audioCtx.createBufferSource();
          bs.buffer = knifeAudioBuffer;
          bs.playbackRate.value = rate;
          const g = audioCtx.createGain();
          g.gain.value = 0.9;
          bs.connect(g);
          g.connect(audioSfx);
          bs.start();
        } catch (_) {}
        return;
      }
      void ensureKnifeSoundBuffer().then(() => {
        if (!knifeAudioBuffer) return;
        try {
          const bs = audioCtx.createBufferSource();
          bs.buffer = knifeAudioBuffer;
          bs.playbackRate.value = rate;
          const g = audioCtx.createGain();
          g.gain.value = 0.9;
          bs.connect(g);
          g.connect(audioSfx);
          bs.start();
        } catch (_) {}
      });
    }

    function playDashSound() {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      // Plays dash.ogg (loaded once, cached). If the buffer hasn't decoded yet
      // the first press kicks off the load and fires the sound on completion;
      // subsequent presses play immediately from cache.
      if (dashAudioBuffer) {
        try {
          const bs = audioCtx.createBufferSource();
          bs.buffer = dashAudioBuffer;
          const g = audioCtx.createGain();
          g.gain.value = 0.9;
          bs.connect(g);
          g.connect(audioSfx);
          bs.start();
        } catch (_) {}
        return;
      }
      void ensureDashSoundBuffer().then(() => {
        if (!dashAudioBuffer) return;
        try {
          const bs = audioCtx.createBufferSource();
          bs.buffer = dashAudioBuffer;
          const g = audioCtx.createGain();
          g.gain.value = 0.9;
          bs.connect(g);
          g.connect(audioSfx);
          bs.start();
        } catch (_) {}
      });
    }

    function playKnifeHitSound() {
      // Hit = extended swing whoosh tail (continuation of the swing arc) + soft impact thump.
      // No metallic clang — feels like the blade carrying through the target.
      if (audioCtx.state === "suspended") void audioCtx.resume();
      const now = audioCtx.currentTime;
      // Whoosh tail: longer, downward sweep — extends the swing wind
      const whoosh = audioCtx.createBufferSource();
      whoosh.buffer = getGunNoiseBuffer(0.42);
      const bp = audioCtx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(2200, now);
      bp.frequency.exponentialRampToValueAtTime(480, now + 0.38);
      bp.Q.setValueAtTime(0.55, now);
      const wG = audioCtx.createGain();
      wG.gain.setValueAtTime(0.0001, now);
      wG.gain.linearRampToValueAtTime(0.34, now + 0.03);
      wG.gain.setValueAtTime(0.34, now + 0.06);
      wG.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);
      whoosh.connect(bp); bp.connect(wG); wG.connect(audioSfx);
      whoosh.start(now); whoosh.stop(now + 0.45);
      // Impact thump: brief low punch marking contact (no clang)
      const thud = audioCtx.createBufferSource();
      thud.buffer = getGunNoiseBuffer(0.08);
      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.setValueAtTime(420, now);
      const tG = audioCtx.createGain();
      tG.gain.setValueAtTime(0.0001, now);
      tG.gain.linearRampToValueAtTime(0.28, now + 0.006);
      tG.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      thud.connect(lp); lp.connect(tG); tG.connect(audioSfx);
      thud.start(now); thud.stop(now + 0.10);
    }

    function playDissolveBurstSound() {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      const now = audioCtx.currentTime;
      const pop = audioCtx.createBufferSource();
      pop.buffer = getGunNoiseBuffer(0.055);
      const popBp = audioCtx.createBiquadFilter();
      popBp.type = "bandpass";
      popBp.frequency.setValueAtTime(3200, now);
      popBp.Q.setValueAtTime(1.4, now);
      const popG = audioCtx.createGain();
      popG.gain.setValueAtTime(0.0001, now);
      popG.gain.exponentialRampToValueAtTime(0.42, now + 0.004);
      popG.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
      pop.connect(popBp);
      popBp.connect(popG);
      popG.connect(audioSfx);
      pop.start(now);
      pop.stop(now + 0.075);
      const thump = audioCtx.createOscillator();
      thump.type = "sine";
      thump.frequency.setValueAtTime(155, now);
      thump.frequency.exponentialRampToValueAtTime(48, now + 0.11);
      const thumpG = audioCtx.createGain();
      thumpG.gain.setValueAtTime(0.0001, now);
      thumpG.gain.exponentialRampToValueAtTime(0.24, now + 0.005);
      thumpG.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      thump.connect(thumpG);
      thumpG.connect(audioSfx);
      thump.start(now);
      thump.stop(now + 0.14);
    }

    const DISSOLVE_DURATION = 0.55;
    const MAX_DISSOLVE_MESHES = 200;
    const DISSOLVE_BOX_GEO = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const DISSOLVE_BOX_GEO_SM = new THREE.BoxGeometry(0.035, 0.035, 0.035);
    const dissolveBursts = [];
    const _dissolveTmp = new THREE.Vector3();
    const _dissolveDir = new THREE.Vector3();

    function spawnHumanoidDissolve(rootGroup, hitWorld, opts = {}) {
      if (!rootGroup) return;
      trimEffectGroup(
        dissolveGroup,
        MAX_DISSOLVE_MESHES,
        (o) => {
          o.material.dispose();
        },
        10
      );
      const hit = hitWorld && hitWorld.isVector3
        ? hitWorld
        : new THREE.Vector3(
            hitWorld?.x ?? 0,
            hitWorld?.y ?? 1.2,
            hitWorld?.z ?? 0
          );
      rootGroup.updateMatrixWorld(true);
      const particles = [];
      let spawned = 0;
      const maxShards = 118;
      const pushShard = (pos, col, fromHit, small) => {
        if (spawned >= maxShards) return;
        const mat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.96,
          depthWrite: false,
        });
        const shard = new THREE.Mesh(small ? DISSOLVE_BOX_GEO_SM : DISSOLVE_BOX_GEO, mat);
        shard.position.copy(pos);
        shard.position.x += (Math.random() - 0.5) * 0.14;
        shard.position.y += (Math.random() - 0.5) * 0.16;
        shard.position.z += (Math.random() - 0.5) * 0.14;
        _dissolveDir.subVectors(shard.position, fromHit ? hit : pos);
        if (_dissolveDir.lengthSq() < 0.04) {
          _dissolveDir.set(
            (Math.random() - 0.5) * 2,
            Math.random() * 0.9 + 0.3,
            (Math.random() - 0.5) * 2
          );
        }
        _dissolveDir.normalize();
        const speed = (small ? 3.2 : 4.2) + Math.random() * 4.0;
        dissolveGroup.add(shard);
        particles.push({
          mesh: shard,
          vel: new THREE.Vector3(
            _dissolveDir.x * speed,
            _dissolveDir.y * speed + 0.4,
            _dissolveDir.z * speed
          ),
          spin: (Math.random() - 0.5) * 16,
          life: DISSOLVE_DURATION * (0.6 + Math.random() * 0.5),
          maxLife: DISSOLVE_DURATION,
        });
        spawned++;
      };
      rootGroup.traverse((o) => {
        if (!o.isMesh || spawned >= maxShards) return;
        o.getWorldPosition(_dissolveTmp);
        let col = 0x9aa8bc;
        if (o.material) {
          if (Array.isArray(o.material) && o.material[0] && o.material[0].color) {
            col = o.material[0].color.getHex();
          } else if (o.material.color) {
            col = o.material.color.getHex();
          }
        }
        for (let si = 0; si < 4 && spawned < maxShards; si++) {
          pushShard(_dissolveTmp, col, true, si > 1);
        }
      });
      for (let hi = 0; hi < 22 && spawned < maxShards; hi++) {
        _dissolveTmp.copy(hit);
        _dissolveTmp.x += (Math.random() - 0.5) * 0.55;
        _dissolveTmp.y += (Math.random() - 0.5) * 0.65;
        _dissolveTmp.z += (Math.random() - 0.5) * 0.55;
        pushShard(
          _dissolveTmp,
          hi % 3 === 0 ? 0xff6a6a : 0xb8c4d8,
          true,
          true
        );
      }
      if (particles.length) {
        playDissolveBurstSound();
        dissolveBursts.push({ particles, onComplete: opts.onComplete || null });
      } else if (opts.onComplete) {
        opts.onComplete();
      }
    }

    function updateDissolveEffects(dt) {
      for (let bi = dissolveBursts.length - 1; bi >= 0; bi--) {
        const burst = dissolveBursts[bi];
        let alive = 0;
        for (const p of burst.particles) {
          p.life -= dt;
          if (p.life <= 0) continue;
          alive++;
          p.mesh.position.addScaledVector(p.vel, dt);
          p.vel.y -= 5.5 * dt;
          p.mesh.rotation.x += p.spin * dt;
          p.mesh.rotation.y += p.spin * 0.7 * dt;
          const fade = Math.max(0, p.life / p.maxLife);
          p.mesh.scale.setScalar(0.35 + fade * 0.85);
          p.mesh.material.opacity = fade * 0.95;
        }
        if (alive <= 0) {
          for (const p of burst.particles) {
            dissolveGroup.remove(p.mesh);
            p.mesh.material.dispose();
          }
          const done = burst.onComplete;
          dissolveBursts.splice(bi, 1);
          if (done) done();
        }
      }
    }

    function clearLocalDeathGhost() {
      if (localDeathGhostGroup) {
        scene.remove(localDeathGhostGroup);
        localDeathGhostGroup = null;
      }
    }

    function spawnLocalPlayerDeathDissolve(hitWorld) {
      clearLocalDeathGhost();
      const av = createRemotePlayer(playerName || "Player");
      av.group.position.set(player.position.x, 0, player.position.z);
      av.group.rotation.y = player.yaw + Math.PI;
      if (av.nameSprite) av.nameSprite.visible = false;
      av.group.visible = true;
      scene.add(av.group);
      localDeathGhostGroup = av.group;
      const hp =
        hitWorld && hitWorld.isVector3
          ? hitWorld
          : new THREE.Vector3(
              player.position.x,
              player.position.y + 1.1,
              player.position.z
            );
      spawnHumanoidDissolve(av.group, hp, {
        onComplete: clearLocalDeathGhost,
      });
    }

    /**
     * Apply weapon damage to a training target and drop it only when its HP is gone.
     * Targets used to dissolve on any single hit regardless of weapon, which made the range
     * useless for learning time-to-kill; they now take the same damage numbers as the real
     * thing. Returns true if this hit finished it off.
     */
    function damageTrainingDummy(enemy, zone, w, hitWorld) {
      if (!enemy || !enemy.group || !enemy.alive || enemy.dissolveTimer > 0) return false;
      applyDamage(enemy, zone, w);
      drawEnemyHp(enemy);
      if (enemy.hp > 0) return false;

      enemy.alive = false;
      enemy.hp = 0;
      enemy.dissolveTimer = DISSOLVE_DURATION + 0.12;
      enemy.respawnTimer = TRAINING_RESPAWN_SEC;
      enemy.group.visible = false;
      totalTrainingDummyKills++;
      checkAchievements();
      persistUnlocks();
      spawnHumanoidDissolve(enemy.group, hitWorld);
      return true;
    }

    function showCombatFeedback(text, color, dur = 0.18) {
      if (!combatFeedbackEl) return;
      combatFeedbackEl.textContent = text;
      combatFeedbackEl.style.color = color;
      combatFeedbackEl.classList.add("show");
      state.combatFeedbackTimer = Math.max(state.combatFeedbackTimer, dur);
    }

    function playWeaponHitSfx(isKill = false, headshot = false) {
      const skin = weaponSoundSkin();
      const hitType = isKill ? "kill" : headshot ? "head" : "body";
      if (skin === "chaosShorty" && typeof ChaosShortySFX !== "undefined") {
        if (hitType === "kill") ChaosShortySFX.hit("kill");
        else ChaosShortySFX.hit(hitType);
        return;
      }
      if (typeof GunSFX !== "undefined") GunSFX.hit(skin, hitType);
    }

    function playReloadSound() {
      if (audioCtx.state === "suspended") void audioCtx.resume();
      const skin = weaponSoundSkin();
      if (skin === "chaosShorty" && typeof ChaosShortySFX !== "undefined" && ChaosShortySFX.reload) {
        ChaosShortySFX.reload();
        return;
      }
      if (typeof GunSFX !== "undefined" && GunSFX.reload) GunSFX.reload(skin);
    }

    function triggerHitFeedback(isKill = false, headshot = false) {
      state.hitmarkerTimer = isKill ? 0.16 : 0.09;
      hitmarkerEl.classList.add("show");
      hitmarkerEl.classList.toggle("critical", !!isKill || !!headshot);
    }

    function updateInstancedPool(pool, parts, gravity, dt) {
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p.life <= 0) {
          _mPool.makeScale(0, 0, 0);
          pool.setMatrixAt(i, _mPool);
          continue;
        }
        p.life -= dt;
        p.vy -= gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        if (p.life <= 0) _mPool.makeScale(0, 0, 0);
        else _mPool.makeTranslation(p.x, p.y, p.z);
        pool.setMatrixAt(i, _mPool);
      }
      pool.instanceMatrix.needsUpdate = true;
    }

    function updateBlood(dt) {
      updateInstancedPool(bloodGroup, _bloodP, 9, dt);
    }

    function updateSparks(dt) {
      updateInstancedPool(sparkGroup, _sparkP, 8, dt);
    }

    function createBulletTrail(muzzle, hit, color) {
      const { start, end } = bulletTrailEndpoints(muzzle, hit);
      const hex = typeof color === "number" ? color : new THREE.Color(color).getHex();
      const geomCore = new THREE.BufferGeometry().setFromPoints([start, end]);
      const matCore = new THREE.LineBasicMaterial({
        color: hex,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
      });
      const lineCore = new THREE.Line(geomCore, matCore);
      lineCore.frustumCulled = false;
      lineCore.renderOrder = 32;
      const geomGlow = geomCore.clone();
      const matGlow = new THREE.LineBasicMaterial({
        color: hex,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
      });
      const lineGlow = new THREE.Line(geomGlow, matGlow);
      lineGlow.frustumCulled = false;
      lineGlow.renderOrder = 31;

      const segLen = Math.max(0.08, start.distanceTo(end));
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      _trailVecDir.subVectors(end, start);
      if (_trailVecDir.lengthSq() > 1e-6) _trailVecDir.normalize();
      else _trailVecDir.set(0, 0, -1);
      const cylGeom = new THREE.CylinderGeometry(0.012, 0.018, segLen, 6, 1, true);
      const matCyl = new THREE.MeshBasicMaterial({
        color: hex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
      });
      const cyl = new THREE.Mesh(cylGeom, matCyl);
      cyl.position.copy(mid);
      _trailVecUp.set(0, 1, 0);
      if (Math.abs(_trailVecDir.y) > 0.98) _trailVecUp.set(1, 0, 0);
      cyl.quaternion.setFromUnitVectors(_trailVecUp, _trailVecDir);
      cyl.frustumCulled = false;
      cyl.renderOrder = 30;

      const trailGroup = new THREE.Group();
      trailGroup.frustumCulled = false;
      trailGroup.add(cyl);
      trailGroup.add(lineGlow);
      trailGroup.add(lineCore);
      tracerGroup.add(trailGroup);
      const maxLife = 0.32;
      state.tracers.push({
        group: trailGroup,
        parts: [
          { geometry: cylGeom, material: matCyl, baseOpacity: 0.55 },
          { geometry: geomGlow, material: matGlow, baseOpacity: 0.5 },
          { geometry: geomCore, material: matCore, baseOpacity: 1 },
        ],
        life: maxLife,
        maxLife,
      });
    }

    function emitShootNetwork(muzzle, end, color, hitType, extras = {}) {
      if (!MULTIPLAYER) return;
      socket.emit("shoot", {
        sx: muzzle.x,
        sy: muzzle.y,
        sz: muzzle.z,
        x: end.x,
        y: end.y,
        z: end.z,
        color,
        type: hitType,
        ...extras,
      });
    }

    camera.position.copy(player.position);
    scene.add(camera);

    const playerLightTarget = new THREE.Object3D();
    playerLightTarget.position.set(0, 0, -1);

    const playerBodyLight = createPhysicalPointLight(
      PLAYER_LIGHT_COLOR,
      PLAYER_BODY_INTENSITY,
      PLAYER_BODY_DISTANCE,
      PLAYER_BODY_LIGHT_DECAY
    );
    playerBodyLight.position.set(0, -0.22, 0.08);
    camera.add(playerBodyLight);

    const flashOuterLocal = createPhysicalSpotLight(
      PLAYER_LIGHT_COLOR,
      FLASH_OUTER_INTENSITY,
      FLASH_OUTER_DISTANCE,
      FLASH_OUTER_ANGLE,
      FLASH_OUTER_PEN,
      FLASHLIGHT_LIGHT_DECAY
    );
    const flashInnerLocal = createPhysicalSpotLight(
      PLAYER_LIGHT_COLOR,
      FLASH_INNER_INTENSITY,
      FLASH_INNER_DISTANCE,
      FLASH_INNER_ANGLE,
      FLASH_INNER_PEN,
      FLASHLIGHT_LIGHT_DECAY
    );
    flashOuterLocal.position.set(0, 0.18, 0.12);
    flashInnerLocal.position.set(0, 0.18, 0.12);
    camera.add(flashOuterLocal);
    camera.add(flashInnerLocal);
    camera.add(playerLightTarget);
    flashOuterLocal.target = playerLightTarget;
    flashInnerLocal.target = playerLightTarget;

    function setLocalPlayerLights(on) {
      playerBodyLight.visible = on;
      flashOuterLocal.visible = on;
      flashInnerLocal.visible = on;
    }

    /** User toggle (L key); actual visibility also depends on menu / death / loading. */
    let playerLightsPreference = true;
    /** 0=小 1=中 2=大 — toggled with Z (cycles). */
    let flashlightBeamLevel = 1;

    function refreshLocalPlayerLightsForCurrentState() {
      if (!gameWorldReady || menuEl.style.display !== "none") {
        setLocalPlayerLights(false);
        return;
      }
      if (player.health <= 0) {
        setLocalPlayerLights(false);
        return;
      }
      if (isBrightIndoorMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP)) {
        setLocalPlayerLights(false);
        return;
      }
      setLocalPlayerLights(playerLightsPreference);
    }

    setLocalPlayerLights(false);

    const weaponRoot = new THREE.Group();
    camera.add(weaponRoot);
    const needleRoot = makeNeedleModel();
    camera.add(needleRoot);
    const jetRoot = makeJetHarnessModel();
    camera.add(jetRoot);

    /** Camera-space Y offset so the view-model sits ~20px lower on a typical 1080p window (FOV 75). */
    const WEAPON_VIEW_DROP_Y = -0.032;

    const VIEW_MAG_MAT = new THREE.MeshStandardMaterial({
      color: 0x2a3d5c,
      roughness: 0.42,
      metalness: 0.58,
      emissive: 0x101820,
      emissiveIntensity: 0.22,
    });

    function attachWeaponMag(gunGroup, root, x, y, z, w, h, d) {
      const magGrp = new THREE.Group();
      magGrp.name = "viewMag";
      addMeshPart(magGrp, new THREE.BoxGeometry(w, h, d), VIEW_MAG_MAT, 0, 0, 0);
      magGrp.position.set(x, y, z);
      gunGroup.add(magGrp);
      root.userData.animMag = magGrp;
      root.userData.magBasePos = magGrp.position.clone();
    }

    function attachEjectPort(gunGroup, root, x, y, z) {
      const node = new THREE.Object3D();
      node.position.set(x, y, z);
      gunGroup.add(node);
      root.userData.ejectNode = node;
    }

    /** Side-mounted grip stubs (±X). Thin in Z so blocks never sit on the bore axis. */
    /** R = grip (hold). L = mag / charge / shells / bolt. */
    const VIEW_HAND_GRIPS = {
      0: { r: [0.12, -0.15, 0.1], rRot: [0, 0, 0], l: [-0.11, -0.13, 0.02], lRot: [0, 0, 0] },
      1: { r: [0.13, -0.13, 0.02], rRot: [0, 0, 0], l: [-0.12, -0.12, 0.06], lRot: [0, 0, 0] },
      2: { r: [0.14, -0.1, -0.04], rRot: [0, 0, 0], l: [-0.12, -0.04, 0.12], lRot: [0, 0, 0] },
      3: { r: [0.13, -0.13, 0.02], rRot: [0, 0, 0], l: [-0.12, -0.12, 0.05], lRot: [0, 0, 0] },
      5: { r: [0.13, -0.12, 0.04], rRot: [0, 0, 0], l: [-0.12, -0.1, 0.08], lRot: [0, 0, 0] },
    };

    function attachViewHandGrips(gunGroup, root, spec) {
      if (!spec) return;
      const rGrip = new THREE.Group();
      rGrip.name = "viewGripR";
      rGrip.position.set(spec.r[0], spec.r[1], spec.r[2]);
      rGrip.rotation.order = "YXZ";
      rGrip.rotation.set(spec.rRot[0], spec.rRot[1], spec.rRot[2]);
      gunGroup.add(rGrip);
      root.userData.gripR = rGrip;

      const lGrip = new THREE.Group();
      lGrip.name = "viewGripL";
      lGrip.position.set(spec.l[0], spec.l[1], spec.l[2]);
      lGrip.rotation.order = "YXZ";
      lGrip.rotation.set(spec.lRot[0], spec.lRot[1], spec.lRot[2]);
      gunGroup.add(lGrip);
      root.userData.gripL = lGrip;
    }

    /** One flat glove block per side — animation only, not a full hand mesh. */
    function makeViewHandMesh(side) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3a3528,
        roughness: 0.9,
        depthWrite: false,
      });
      const g = new THREE.Group();
      g.name = side === "L" ? "viewHandL" : "viewHandR";
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.13, 0.034), mat);
      block.position.set(0, -0.03, 0);
      block.renderOrder = 26;
      g.add(block);
      g.renderOrder = 25;
      return g;
    }

    function attachViewArmsOnGrips(root) {
      const rGrip = root.userData.gripR;
      const lGrip = root.userData.gripL;
      if (!rGrip) return;
      const rArm = makeViewHandMesh("R");
      rGrip.add(rArm);
      root.userData.viewArmR = rArm;
      root.userData.armRBasePos = new THREE.Vector3(0, 0, 0);
      root.userData.armRBaseRot = new THREE.Euler(0, 0, 0, "YXZ");

      if (lGrip) {
        const lArm = makeViewHandMesh("L");
        lGrip.add(lArm);
        lArm.visible = false;
        root.userData.viewArmL = lArm;
        root.userData.armLBasePos = new THREE.Vector3(0, 0, 0);
        root.userData.armLBaseRot = new THREE.Euler(0, 0, 0, "YXZ");
        const magHold = new THREE.Group();
        magHold.name = "handMagHold";
        magHold.visible = false;
        magHold.position.set(0, -0.04, 0.07);
        magHold.rotation.set(0.15, 0, 0);
        lArm.add(magHold);
        root.userData.handMagHold = magHold;
      }
    }

    function setViewHandPose(arm, basePos, baseRot, dx, dy, dz, rx, ry, rz) {
      if (!arm) return;
      arm.position.set(basePos.x + dx, basePos.y + dy, basePos.z + dz);
      arm.rotation.set(baseRot.x + rx, baseRot.y + ry, baseRot.z + rz);
    }

    function hideHandMagProxy(ud) {
      if (ud.handMagHold) ud.handMagHold.visible = false;
      if (ud.handMagProxy) {
        ud.handMagHold.remove(ud.handMagProxy);
        ud.handMagProxy = null;
      }
    }

    function syncHandMagProxy(ud, show, magMesh) {
      if (!ud.handMagHold || !magMesh || !show) {
        hideHandMagProxy(ud);
        if (magMesh) magMesh.visible = true;
        return;
      }
      if (ud.handMagProxy) {
        ud.handMagHold.remove(ud.handMagProxy);
        ud.handMagProxy = null;
      }
      const proxy = magMesh.clone(true);
      proxy.position.set(0, 0, 0);
      proxy.rotation.set(0, 0, 0);
      proxy.scale.set(1.12, 1.12, 1.12);
      proxy.traverse((o) => {
        if (o.isMesh) {
          o.renderOrder = 28;
          o.material = VIEW_MAG_MAT;
        }
      });
      ud.handMagHold.add(proxy);
      ud.handMagProxy = proxy;
      ud.handMagHold.visible = true;
      ud.handMagProxy.visible = true;
      magMesh.visible = false;
    }

    function resetViewArms(ud) {
      hideHandMagProxy(ud);
      if (ud.viewArmR && ud.armRBasePos) {
        ud.viewArmR.position.copy(ud.armRBasePos);
        ud.viewArmR.rotation.copy(ud.armRBaseRot);
      }
      if (ud.viewArmL && ud.armLBasePos) {
        ud.viewArmL.position.copy(ud.armLBasePos);
        ud.viewArmL.rotation.copy(ud.armLBaseRot);
      }
    }

    function applyViewArmIdlePose(ud, wi) {
      if (wi === 4) return;
      resetViewArms(ud);
      if (ud.viewArmL) ud.viewArmL.visible = false;
    }

    /**
     * Paralysis Dart reload — ONE pose shared by the loader dart mesh and the left glove.
     *
     * A reload seats `magSize - reloadStartAmmo` darts, one per equal segment of the reload.
     * The dart mesh used to run on that per-dart clock while the hand ran on the whole-reload
     * clock, so the two were never in the same place and the dart appeared to fly into the
     * muzzle by itself. Both now read this function, so the glove is always physically
     * carrying the dart it is loading.
     *
     * Everything is in gun-local space — the same parent as `animDart` and the grip stubs.
     */
    function getDartLoaderPose(ud, p) {
      const fetchPos = ud.dartFetchPos;
      const insertPos = ud.dartInsertPos;
      if (!fetchPos || !insertPos) return null;

      const dartsToLoad = Math.max(1, weapons[6].magSize - state.reloadStartAmmo);
      const segLen = 1 / dartsToLoad;
      const dartIdx = Math.min(dartsToLoad - 1, Math.floor(p / segLen));
      const lp = THREE.MathUtils.clamp((p - dartIdx * segLen) / segLen, 0, 1);
      const isLastDart = dartIdx >= dartsToLoad - 1;

      // Per-dart beats: pull one from the pouch → line it up on the muzzle → push → seat → let go.
      // The dart is gone before `release` starts, so the hand is never seen carrying a dart
      // while it swings back empty.
      const appear = reloadPhase(lp, 0.02, 0.16);
      const align = reloadPhase(lp, 0.14, 0.32);
      const push = reloadPhase(lp, 0.28, 0.68);
      const seat = reloadPhase(lp, 0.62, 0.8);
      const vanish = reloadPhase(lp, 0.76, 0.82);
      const release = reloadPhase(lp, 0.8, 1);

      const easedPush = 1 - Math.pow(1 - push, 3);
      const carryX = fetchPos.x + (insertPos.x - fetchPos.x) * easedPush;
      const carryY =
        fetchPos.y + (insertPos.y - fetchPos.y) * easedPush + Math.sin(push * Math.PI) * 0.05;
      const carryZ = fetchPos.z + (insertPos.z - fetchPos.z) * easedPush - seat * 0.035;
      const tilt = THREE.MathUtils.lerp(0.82, 0.02, align);

      // Once the dart is seated the now-empty hand swings back to the pouch for the next one,
      // so consecutive segments join up instead of snapping.
      const back = release * release * (3 - 2 * release);
      // First dart only: ease the glove out of its resting grip instead of teleporting it
      // to the pouch on the frame the reload starts.
      const enterT = dartIdx === 0 ? reloadPhase(lp, 0, 0.14) : 1;
      const enter = enterT * enterT * (3 - 2 * enterT);
      return {
        // `enter` also gates the dart so the first one grows in as the hand reaches the
        // pouch, instead of sitting there waiting to be picked up.
        dartVisible: lp > 0.02 && lp < 0.82 && enter > 0.05,
        dartScale: Math.max(0.05, appear) * (1 - vanish) * enter,
        dartPos: { x: carryX, y: carryY, z: carryZ },
        dartRot: { x: tilt - seat * 0.16, y: 0.18 * (1 - align), z: tilt * 0.36 },
        handPos: {
          x: THREE.MathUtils.lerp(carryX, fetchPos.x, back),
          y: THREE.MathUtils.lerp(carryY, fetchPos.y, back),
          z: THREE.MathUtils.lerp(carryZ, fetchPos.z, back),
        },
        handRot: {
          x: 0.3 * (1 - align) + 0.1 * Math.sin(push * Math.PI),
          y: 0.12 * (1 - align),
          z: 0.34 * (1 - align),
        },
        /** 0..1 — on the last dart the hand returns to its resting grip, not the pouch. */
        handHome: isLastDart ? back : 0,
        /** 0..1 — how far the glove has left its resting grip (first dart ramps in). */
        handEnter: enter,
      };
    }

    /** R holds the gun; L does mag / rack / charge / shells / bolt. */
    function applyViewArmReload(ud, wi, rp) {
      const p = rp;
      const bp = ud.armRBasePos;
      const br = ud.armRBaseRot;
      const lp = ud.armLBasePos;
      const lr = ud.armLBaseRot;
      if (!bp || !br) return;
      resetViewArms(ud);
      if (ud.viewArmL) ud.viewArmL.visible = true;
      setViewHandPose(ud.viewArmR, bp, br, 0, 0, 0, 0, 0, 0);
      let magInHand = false;

      if (wi === 0) {
        const mag = reloadPhase(p, 0, 0.55);
        const rack = reloadPhase(p, 0.55, 1);
        magInHand = mag > 0.12 && mag < 0.88;
        if (mag > 0 && mag < 1) {
          const drop = mag < 0.5 ? mag * 2 : 2 - mag * 2;
          setViewHandPose(ud.viewArmL, lp, lr, 0, -0.09 * drop, 0, 0, 0, 0);
        }
        if (rack > 0) {
          const pull = Math.sin(rack * Math.PI);
          setViewHandPose(ud.viewArmL, lp, lr, 0, 0.03 * pull, 0.05 * pull, 0, 0, 0);
        }
      } else if (wi === 1 || wi === 3) {
        const mag = reloadPhase(p, 0, 0.58);
        const charge = reloadPhase(p, 0.58, 0.85);
        magInHand = mag > 0.14 && mag < 0.86;
        if (mag > 0 && mag < 1) {
          const drop = mag < 0.5 ? mag * 2 : 2 - mag * 2;
          setViewHandPose(ud.viewArmL, lp, lr, 0, -0.1 * drop, 0, 0, 0, 0);
        }
        if (charge > 0) {
          const pull = Math.sin(charge * Math.PI);
          setViewHandPose(ud.viewArmL, lp, lr, 0, 0.02 * pull, 0.05 * pull, 0, 0, 0);
        }
      } else if (wi === 2) {
        const openT = reloadPhase(p, 0, 0.14);
        const loadT = reloadPhase(p, 0.14, 0.88);
        const closeT = reloadPhase(p, 0.88, 1);
        let breakOpen = 0;
        if (openT < 1) breakOpen = openT;
        else if (closeT > 0) breakOpen = 1 - closeT;
        else breakOpen = 1;
        if (loadT > 0 && loadT < 1) {
          const wave = Math.sin(loadT * Math.PI * 2);
          setViewHandPose(ud.viewArmL, lp, lr, 0, -0.06 + 0.05 * wave, 0.03 * wave, 0, 0, 0);
        } else if (breakOpen > 0) {
          setViewHandPose(ud.viewArmL, lp, lr, 0, 0.05 * breakOpen, 0.06 * breakOpen, 0, -0.1 * breakOpen, 0);
        }
      } else if (wi === 5) {
        const mag = reloadPhase(p, 0.15, 0.6);
        const bolt = reloadPhase(p, 0.6, 1);
        magInHand = mag > 0.16 && mag < 0.84;
        if (mag > 0 && mag < 1) {
          const drop = mag < 0.5 ? mag * 2 : 2 - mag * 2;
          setViewHandPose(ud.viewArmL, lp, lr, 0, -0.1 * drop, 0, 0, 0, 0);
        }
        if (bolt > 0) {
          const pull = Math.sin(bolt * Math.PI);
          setViewHandPose(ud.viewArmL, lp, lr, 0, 0.03 * pull, 0.06 * pull, 0, 0, 0);
        }
      } else if (wi === 6) {
        // Left hand carries the loader dart from the pouch into the muzzle. Position comes
        // from the same per-dart pose the dart mesh uses (getDartLoaderPose), so the hand
        // and the dart can never drift apart the way they did on separate clocks.
        const pose = getDartLoaderPose(ud, p);
        const gripL = ud.gripL;
        if (pose && gripL && ud.viewArmL) {
          const grip = ud.dartHandGrip;
          // gun-local → gripL-local (the glove's parent). Grips carry no rotation or scale,
          // so the conversion is a plain subtraction.
          let dx = pose.handPos.x + (grip ? grip.x : 0) - gripL.position.x;
          let dy = pose.handPos.y + (grip ? grip.y : 0) - gripL.position.y;
          let dz = pose.handPos.z + (grip ? grip.z : 0) - gripL.position.z;
          // Offsets are measured from the resting grip, so easing the hand in at the start of
          // the reload and back at the end is just a scalar on the whole offset.
          const k = pose.handEnter * (1 - pose.handHome);
          setViewHandPose(
            ud.viewArmL, lp, lr,
            dx * k, dy * k, dz * k,
            pose.handRot.x * k, pose.handRot.y * k, pose.handRot.z * k
          );
        }
      }

      syncHandMagProxy(ud, magInHand, ud.animMag);
    }

    function reloadPhase(p, t0, t1) {
      if (p <= t0) return 0;
      if (p >= t1) return 1;
      return (p - t0) / (t1 - t0);
    }

    function makeWeaponModel(type) {
      const root = new THREE.Group();
      const gunGroup = new THREE.Group();
      let adsOffset = new THREE.Vector3();

      const mDark = new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.55, metalness: 0.45 });
      const mMetal = new THREE.MeshStandardMaterial({ color: 0x3a4455, roughness: 0.45, metalness: 0.55 });
      const mLight = new THREE.MeshStandardMaterial({ color: 0x6a7585, roughness: 0.35, metalness: 0.65 });
      const mBlack = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.6, metalness: 0.3 });
      const mWood = new THREE.MeshStandardMaterial({ color: 0x6e4a2a, roughness: 0.8 });
      const mWoodD = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.8 });
      const mSight = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3, metalness: 0.7 });
      const mDot = new THREE.MeshBasicMaterial({ color: 0xff2d2d });

      const barrelZ = Math.PI / 2;

      if (type === 0) {
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.09, 0.11, 0.36), mMetal, 0, 0.01, -0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.04, 0.06, 0.12), mDark, 0, -0.03, -0.08);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.05, 0.028, 0.08), mBlack, 0, -0.055, 0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.035, 0.022, 0.05), mBlack, 0, -0.07, 0.06);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.09, 0.19, 0.11), mBlack, 0, -0.16, 0.09);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.11, 0.045, 0.09), mBlack, 0, -0.055, 0.09);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.042, 0.038, 0.06), mBlack, 0, 0.058, 0.03);
        const slideGrp = new THREE.Group();
        addMeshPart(slideGrp, new THREE.BoxGeometry(0.085, 0.055, 0.22), mLight, 0, 0.06, -0.12);
        addMeshPart(slideGrp, new THREE.BoxGeometry(0.06, 0.02, 0.018), mSight, 0, 0.078, 0.06);
        addMeshPart(slideGrp, new THREE.BoxGeometry(0.006, 0.048, 0.014), mSight, 0, 0.09, -0.17);
        addMeshPart(slideGrp, new THREE.SphereGeometry(0.004, 8, 8), mDot, 0, 0.112, -0.17);
        gunGroup.add(slideGrp);
        root.userData.animSlide = slideGrp;
        attachWeaponMag(gunGroup, root, 0, -0.1, 0.04, 0.05, 0.12, 0.08);
        gunGroup.position.set(0.26, -0.22, -0.72);
        attachViewHandGrips(gunGroup, root, VIEW_HAND_GRIPS[0]);
        attachViewArmsOnGrips(root);
        adsOffset.set(-0.26, 0.135, 0.26);

        const muzzleNode = new THREE.Object3D();
        muzzleNode.position.set(0, 0.058, -0.21);
        gunGroup.add(muzzleNode);
        root.userData.muzzleNode = muzzleNode;

      } else if (type === 1) {
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.12, 0.13, 0.52), mDark, 0, 0.02, 0.14);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.09, 0.08, 0.22), mBlack, 0, -0.02, 0.38);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.07, 0.2, 0.1), mDark, 0, -0.16, 0.1);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.06, 0.26, 0.09), mBlack, 0, -0.13, -0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.05, 0.14, 0.08), mBlack, 0, -0.08, -0.14);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.11, 0.09, 0.18), mMetal, 0, 0, 0.54);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.1, 0.06, 0.1), mBlack, 0, -0.05, 0.48);
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.028, 0.03, 0.62, 10), mMetal, 0, 0.055, -0.18, barrelZ, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.1, 0.06, 0.44), mLight, 0, 0.05, -0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.055, 0.05, 0.12), mDark, 0, -0.07, 0.06);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.008, 0.035, 0.014), mSight, 0, 0.1, -0.36);
        addMeshPart(gunGroup, new THREE.SphereGeometry(0.004, 6, 6), mDot, 0, 0.116, -0.36);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.038, 0.024, 0.055), mDark, 0.04, 0.085, 0.1);
        attachEjectPort(gunGroup, root, 0.055, 0.09, 0.08);
        attachWeaponMag(gunGroup, root, 0, -0.12, 0.06, 0.055, 0.16, 0.1);
        gunGroup.position.set(0.25, -0.22, -0.80);
        attachViewHandGrips(gunGroup, root, VIEW_HAND_GRIPS[1]);
        attachViewArmsOnGrips(root);
        adsOffset.set(-0.25, 0.10, 0.28);

        const muzzleNode = new THREE.Object3D();
        muzzleNode.position.set(0, 0.078, -0.52);
        gunGroup.add(muzzleNode);
        root.userData.muzzleNode = muzzleNode;

      } else if (type === 9) {
        // AS Val, built to the reference photo: AK-pattern receiver, a long ribbed
        // integral suppressor over the front half, a skeletonised TRIANGULAR side-folding
        // stock, a curved 20-round magazine, and plain iron sights (the photo has no optic).
        // Muzzle points -Z; the stock runs back toward +Z.

        // ── receiver + dust cover ──
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.100, 0.115, 0.34), mDark, 0, 0.020, 0.10);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.092, 0.034, 0.30), mMetal, 0, 0.088, 0.09);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.086, 0.040, 0.10), mBlack, 0, 0.060, 0.26); // rear trunnion
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.038, 0.026, 0.06), mDark, 0.052, 0.075, 0.14); // charging handle

        // ── integral suppressor: fat ribbed tube over the whole front half ──
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.045, 0.045, 0.60, 14), mBlack, 0, 0.055, -0.24, barrelZ, 0, 0);
        for (let i = 0; i < 7; i++) {
          addMeshPart(gunGroup, new THREE.CylinderGeometry(0.050, 0.050, 0.016, 14), mDark, 0, 0.055, -0.03 - i * 0.075, barrelZ, 0, 0);
        }
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.047, 0.047, 0.05, 14), mMetal, 0, 0.055, -0.525, barrelZ, 0, 0); // end cap

        // ── iron sights: front post on a block at the muzzle end, rear notch on the receiver ──
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.030, 0.055, 0.045), mDark, 0, 0.108, -0.46);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.008, 0.030, 0.008), mSight, 0, 0.140, -0.46);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.048, 0.016, 0.030), mDark, 0, 0.108, 0.22);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.010, 0.022, 0.010), mSight, -0.014, 0.122, 0.22);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.010, 0.022, 0.010), mSight, 0.014, 0.122, 0.22);

        // ── grip + trigger guard ──
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.056, 0.185, 0.085), mBlack, 0, -0.155, 0.155, 0.22, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.048, 0.014, 0.105), mDark, 0, -0.070, 0.075);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.020, 0.038, 0.014), mMetal, 0, -0.052, 0.095);

        // ── curved 20-round magazine: two segments, the lower one kicked forward ──
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.050, 0.115, 0.075), mDark, 0, -0.105, 0.020, 0.12, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.048, 0.105, 0.070), mBlack, 0, -0.205, -0.010, 0.30, 0, 0);

        // ── skeleton triangular folding stock ──
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.016, 0.018, 0.30), mMetal, -0.030, 0.075, 0.44, 0.10, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.016, 0.018, 0.30), mMetal, 0.030, 0.075, 0.44, 0.10, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.016, 0.018, 0.26), mMetal, -0.030, -0.040, 0.42, -0.22, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.016, 0.018, 0.26), mMetal, 0.030, -0.040, 0.42, -0.22, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.082, 0.150, 0.020), mBlack, 0, 0.020, 0.585);  // butt plate
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.070, 0.016, 0.016), mMetal, 0, 0.075, 0.300);  // front crossbar

        attachEjectPort(gunGroup, root, 0.052, 0.075, 0.14);
        attachWeaponMag(gunGroup, root, 0, -0.105, 0.020, 0.050, 0.115, 0.075);
        gunGroup.position.set(0.25, -0.22, -0.80);
        attachViewHandGrips(gunGroup, root, VIEW_HAND_GRIPS[1]);
        attachViewArmsOnGrips(root);
        // Iron sights sit at y 0.108–0.14, so ADS lines the eye up with the sight plane.
        adsOffset.set(-0.25, 0.020, 0.30);

        const muzzleNodeV = new THREE.Object3D();
        muzzleNodeV.position.set(0, 0.055, -0.55);
        gunGroup.add(muzzleNodeV);
        root.userData.muzzleNode = muzzleNodeV;

      } else if (type === 2) {
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.12, 0.13, 0.26), mWoodD, 0, 0, 0.5);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.10, 0.08, 0.14), mWoodD, 0, -0.055, 0.38);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.08, 0.035, 0.05), mBlack, 0, -0.055, 0.12);
        const breakGrp = new THREE.Group();
        breakGrp.position.set(0, 0.03, 0.22);
        addMeshPart(breakGrp, new THREE.BoxGeometry(0.11, 0.10, 0.20), mLight, 0, 0.01, 0.04);
        addMeshPart(breakGrp, new THREE.BoxGeometry(0.10, 0.08, 0.16), mMetal, 0, -0.01, -0.12);
        addMeshPart(breakGrp, new THREE.BoxGeometry(0.06, 0.06, 0.10), mDark, 0, 0.04, -0.02);
        const barrelGrp = new THREE.Group();
        barrelGrp.position.set(0, 0.01, -0.3);
        addMeshPart(barrelGrp, new THREE.CylinderGeometry(0.042, 0.046, 0.52, 12), mMetal, 0, 0, -0.18, barrelZ, 0, 0);
        addMeshPart(barrelGrp, new THREE.BoxGeometry(0.055, 0.035, 0.02), mSight, 0, 0.05, 0.02);
        addMeshPart(barrelGrp, new THREE.BoxGeometry(0.03, 0.065, 0.02), mSight, 0, 0.06, -0.4);
        breakGrp.add(barrelGrp);
        gunGroup.add(breakGrp);
        root.userData.animBreak = breakGrp;
        root.userData.animBarrel = barrelGrp;
        const pumpGrp = new THREE.Group();
        addMeshPart(pumpGrp, new THREE.BoxGeometry(0.12, 0.08, 0.2), mWood, 0, -0.06, -0.06);
        addMeshPart(pumpGrp, new THREE.BoxGeometry(0.06, 0.1, 0.06), mDark, 0, 0.02, -0.12);
        gunGroup.add(pumpGrp);
        root.userData.animPump = pumpGrp;
        attachEjectPort(gunGroup, root, 0.05, 0.1, 0.06);
        attachViewHandGrips(gunGroup, root, VIEW_HAND_GRIPS[2]);
        attachViewArmsOnGrips(root);
        const mBrass = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          metalness: 0.88,
          roughness: 0.32,
        });
        const shellIns = new THREE.Group();
        addMeshPart(shellIns, new THREE.CylinderGeometry(0.012, 0.014, 0.032, 6), mBrass, 0, 0, 0, barrelZ, 0, 0);
        shellIns.position.set(0, 0.04, -0.06);
        shellIns.visible = false;
        breakGrp.add(shellIns);
        root.userData.animReloadShell = shellIns;

        gunGroup.position.set(0.23, -0.2, -0.82);
        adsOffset.set(-0.23, 0.11, 0.28);

        const muzzleNode = new THREE.Object3D();
        muzzleNode.position.set(0, 0.05, -0.46);
        barrelGrp.add(muzzleNode);
        root.userData.muzzleNode = muzzleNode;

      } else if (type === 3) {
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.1, 0.11, 0.42), mMetal, 0, 0.01, 0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.08, 0.14, 0.09), mDark, 0, -0.14, 0.08);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.06, 0.2, 0.08), mBlack, 0, -0.1, -0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.055, 0.12, 0.07), mBlack, 0, -0.06, -0.12);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.07, 0.05, 0.14), mDark, 0, -0.04, 0.34);
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.024, 0.027, 0.48, 10), mLight, 0, 0.05, -0.12, barrelZ, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.09, 0.06, 0.28), mDark, 0, 0.055, -0.04);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.018, 0.038, 0.018), mSight, 0, 0.08, -0.26);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.04, 0.016, 0.016), mSight, 0, 0.07, 0.12);
        attachEjectPort(gunGroup, root, 0.048, 0.085, 0.04);
        attachWeaponMag(gunGroup, root, 0, -0.12, 0.04, 0.048, 0.14, 0.09);
        gunGroup.position.set(0.26, -0.21, -0.78);
        attachViewHandGrips(gunGroup, root, VIEW_HAND_GRIPS[3]);
        attachViewArmsOnGrips(root);
        adsOffset.set(-0.22, 0.085, 0.24);

        const muzzleNode = new THREE.Object3D();
        muzzleNode.position.set(0, 0.072, -0.38);
        gunGroup.add(muzzleNode);
        root.userData.muzzleNode = muzzleNode;
      } else if (type === 5) {
        const mGreen = new THREE.MeshStandardMaterial({ color: 0x3d4a38, roughness: 0.72, metalness: 0.12 });
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.12, 0.14, 0.4), mDark, 0, 0.02, 0.22);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.11, 0.12, 0.34), mBlack, 0, -0.01, 0.48);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.09, 0.16, 0.1), mBlack, 0, -0.15, 0.3);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.08, 0.18, 0.09), mDark, 0, -0.12, 0.14);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.09, 0.14, 0.11), mBlack, 0, -0.1, 0.02);
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.036, 0.04, 0.88, 14), mMetal, 0, 0.058, -0.28, barrelZ, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.1, 0.075, 0.5), mLight, 0, 0.048, -0.1);
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.05, 0.042, 0.14, 12), mDark, 0, 0.062, -0.78, barrelZ, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.07, 0.05, 0.08), mBlack, 0, 0.05, -0.84);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.065, 0.1, 0.14), mBlack, 0, -0.12, 0.06);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.07, 0.09, 0.36), mSight, 0, 0.14, 0.04);
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.038, 0.044, 0.1, 12), mSight, 0, 0.15, 0.2, barrelZ, 0, 0);
        addMeshPart(gunGroup, new THREE.CylinderGeometry(0.03, 0.034, 0.08, 10), mSight, 0, 0.148, -0.12, barrelZ, 0, 0);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.055, 0.04, 0.42), mSight, 0, 0.155, -0.02);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.014, 0.05, 0.1), mGreen, -0.052, -0.04, -0.18, 0, 0, -0.45);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.014, 0.05, 0.1), mGreen, 0.052, -0.04, -0.18, 0, 0, 0.45);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.02, 0.008, 0.06), mMetal, -0.05, -0.07, -0.28);
        addMeshPart(gunGroup, new THREE.BoxGeometry(0.02, 0.008, 0.06), mMetal, 0.05, -0.07, -0.28);
        const boltGrp = new THREE.Group();
        addMeshPart(boltGrp, new THREE.BoxGeometry(0.055, 0.045, 0.14), mLight, 0, 0.07, 0.18);
        addMeshPart(boltGrp, new THREE.BoxGeometry(0.022, 0.035, 0.04), mMetal, 0, 0.1, 0.24);
        gunGroup.add(boltGrp);
        root.userData.animBolt = boltGrp;
        attachWeaponMag(gunGroup, root, 0, -0.14, 0.1, 0.06, 0.12, 0.11);
        attachEjectPort(gunGroup, root, 0.06, 0.1, 0.2);
        // Hip pose sits on the right shoulder like every other rifle (the old centered
        // pose read as if the gun were growing out of the player's chin). Accuracy is
        // unaffected — tryShoot always casts from camera.position; the muzzle node only
        // decides where the tracer is drawn from.
        // ADS pulls it back to x = 0 and lifts the scope axis (local y 0.15) onto the
        // screen centre — WEAPON_VIEW_DROP_Y (-0.032) + gun.y (-0.118) + 0.15 = 0 — so the
        // tube lines up with the crosshair right before the scope overlay fades in.
        gunGroup.position.set(0.25, -0.2, -0.9);
        attachViewHandGrips(gunGroup, root, VIEW_HAND_GRIPS[5]);
        attachViewArmsOnGrips(root);
        adsOffset.set(-0.25, 0.082, 0.32);

        const muzzleNode = new THREE.Object3D();
        muzzleNode.position.set(0, 0.1, -0.88);
        gunGroup.add(muzzleNode);
        root.userData.muzzleNode = muzzleNode;
      }

      root.add(gunGroup);
      root.userData.gun = gunGroup;
      root.userData.basePos = gunGroup.position.clone();
      root.userData.adsOffset = adsOffset.clone();

      return root;
    }

    /** Compact first-aid case (procedural): white shell + recessed red cross + latch strip — readable at arm’s length. */
    function makeMedKitModel() {
      const root = new THREE.Group();
      const kit = new THREE.Group();
      const mCase = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.38, metalness: 0.06 });
      const mCross = new THREE.MeshStandardMaterial({ color: 0xc81e1e, roughness: 0.45 });
      const mLatch = new THREE.MeshStandardMaterial({ color: 0x5c6169, roughness: 0.5 });
      addMeshPart(kit, new THREE.BoxGeometry(0.26, 0.16, 0.075), mCase, 0, 0, 0);
      addMeshPart(kit, new THREE.BoxGeometry(0.045, 0.11, 0.078), mCross, 0, 0, 0.041);
      addMeshPart(kit, new THREE.BoxGeometry(0.11, 0.045, 0.078), mCross, 0, 0, 0.041);
      addMeshPart(kit, new THREE.BoxGeometry(0.24, 0.022, 0.078), mLatch, 0, 0.068, 0);
      addMeshPart(kit, new THREE.BoxGeometry(0.055, 0.035, 0.08), mCase, -0.1, 0, 0.04);
      kit.position.set(0.27, -0.19, -0.66);
      kit.rotation.y = -0.09;
      const kitMuzzle = new THREE.Object3D();
      kitMuzzle.position.set(0, 0, -0.052);
      kit.add(kitMuzzle);
      root.userData.muzzleNode = kitMuzzle;
      root.add(kit);
      root.userData.gun = kit;
      root.userData.basePos = kit.position.clone();
      root.userData.adsOffset = new THREE.Vector3(-0.14, 0.07, 0.16);
      return root;
    }

    function makeNeedleModel() {
      const root = new THREE.Group();
      const syr = new THREE.Group();
      const mBarrel  = new THREE.MeshStandardMaterial({ color:0xdde8f0, roughness:0.28, metalness:0.08 });
      const mLiquid  = new THREE.MeshStandardMaterial({ color:0x00ffaa, roughness:0.35, emissive:0x00aa55, emissiveIntensity:0.7 });
      const mPlunger = new THREE.MeshStandardMaterial({ color:0x55606a, roughness:0.52, metalness:0.32 });
      const mNeedle  = new THREE.MeshStandardMaterial({ color:0xc8d8e4, roughness:0.18, metalness:0.88 });
      const mHub     = new THREE.MeshStandardMaterial({ color:0xff5500, roughness:0.48 });
      // Barrel (cylinder oriented along Z, i.e. rotX=π/2)
      addMeshPart(syr, new THREE.CylinderGeometry(0.017,0.017,0.22,12), mBarrel, 0,0,0, Math.PI/2,0,0);
      // Liquid band inside
      addMeshPart(syr, new THREE.CylinderGeometry(0.012,0.012,0.14,10), mLiquid, 0,0,0.01, Math.PI/2,0,0);
      // Back flange ring
      addMeshPart(syr, new THREE.CylinderGeometry(0.020,0.020,0.008,12), mBarrel, 0,0,0.117, Math.PI/2,0,0);
      // Finger wings
      addMeshPart(syr, new THREE.BoxGeometry(0.058,0.008,0.014), mBarrel, 0,0,0.100);
      // Hub (orange, front tip)
      addMeshPart(syr, new THREE.CylinderGeometry(0.014,0.010,0.026,8), mHub, 0,0,-0.125, Math.PI/2,0,0);
      // Needle shaft
      addMeshPart(syr, new THREE.CylinderGeometry(0.003,0.003,0.092,6), mNeedle, 0,0,-0.194, Math.PI/2,0,0);
      // Needle bevel tip
      addMeshPart(syr, new THREE.ConeGeometry(0.003,0.014,6), mNeedle, 0,0,-0.247, -Math.PI/2,0,0);
      // Plunger (animated group — moves along +Z = pushing)
      const animPlunger = new THREE.Group();
      const mGlove = new THREE.MeshStandardMaterial({ color:0x2b271e, roughness:0.86, metalness:0.05 });
      const mSleeve = new THREE.MeshStandardMaterial({ color:0x4a4a3a, roughness:0.82, metalness:0.08 });
      // plunger head disk
      addMeshPart(animPlunger, new THREE.CylinderGeometry(0.015,0.015,0.007,10), mPlunger, 0,0,0, Math.PI/2,0,0);
      // plunger rod
      addMeshPart(animPlunger, new THREE.CylinderGeometry(0.004,0.004,0.19,6), mPlunger, 0,0,-0.095, Math.PI/2,0,0);
      // thumb pad sitting on top of plunger head (rides the push)
      addMeshPart(animPlunger, new THREE.BoxGeometry(0.018,0.014,0.018), mGlove, 0,0.020,0);
      animPlunger.position.z = 0.125; // start: plunger pulled back
      syr.add(animPlunger);
      root.userData.animPlunger = animPlunger;

      // Hand gripping the barrel + forearm trailing back behind it.
      // Attached under syr so it follows the syringe through the whole inject sweep.
      const handGrp = new THREE.Group();
      addMeshPart(handGrp, new THREE.BoxGeometry(0.050,0.028,0.078), mGlove, 0,-0.026,0);         // palm
      for (let _fi = 0; _fi < 4; _fi++) {                                                         // four curled fingers
        addMeshPart(handGrp, new THREE.BoxGeometry(0.012,0.010,0.022), mGlove,
                    -0.018 + _fi*0.011, 0.020, -0.010 + _fi*0.003);
      }
      addMeshPart(handGrp, new THREE.BoxGeometry(0.016,0.014,0.024), mGlove, 0.026,0.006,-0.004); // thumb knuckle
      addMeshPart(handGrp, new THREE.BoxGeometry(0.060,0.074,0.22), mSleeve, 0,-0.018,0.150);     // forearm
      handGrp.position.set(0, 0, 0.048);                                                          // grip near back flange
      syr.add(handGrp);
      root.userData.animHand = handGrp;

      // Place in lower-right of view (right hand)
      syr.position.set(0.21, -0.24, -0.56);
      syr.rotation.set(-0.18, -0.14, 0.22);
      root.add(syr);
      root.userData.gun = syr;
      root.userData.basePos = syr.position.clone();
      root.userData.baseRot = new THREE.Euler(-0.18, -0.14, 0.22);
      root.visible = false;
      return root;
    }

    /**
     * Jet harness view-model, shown only during the 3-second strap-on.
     *
     * Layout (camera space): the thruster unit swings in from the lower right and settles
     * against the chest while two harness straps are pulled across the view and cinched
     * tight by the gloves. Nozzles light up at the end as the unit spins up.
     * `userData` exposes the pieces the animation drives.
     */
    function makeJetHarnessModel() {
      const root = new THREE.Group();
      const rig = new THREE.Group();

      const mShell = new THREE.MeshStandardMaterial({ color: 0x5a6470, roughness: 0.42, metalness: 0.55 });
      const mShellDark = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.6, metalness: 0.4 });
      const mStrap = new THREE.MeshStandardMaterial({ color: 0x4a4030, roughness: 0.92 });
      const mBuckle = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.3, metalness: 0.8 });
      const mGlove = new THREE.MeshStandardMaterial({ color: 0x2b271e, roughness: 0.86 });
      const mNozzle = new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.35, metalness: 0.75 });
      const mFlame = new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0 });

      // ── Thruster unit (swings in, then locks against the chest) ──
      const thruster = new THREE.Group();
      addMeshPart(thruster, new THREE.BoxGeometry(0.20, 0.15, 0.09), mShell, 0, 0, 0);
      addMeshPart(thruster, new THREE.BoxGeometry(0.155, 0.045, 0.10), mShellDark, 0, 0.055, 0.004);
      addMeshPart(thruster, new THREE.CylinderGeometry(0.030, 0.036, 0.10, 12), mNozzle, -0.075, -0.10, 0, 0, 0, 0.16);
      addMeshPart(thruster, new THREE.CylinderGeometry(0.030, 0.036, 0.10, 12), mNozzle, 0.075, -0.10, 0, 0, 0, -0.16);
      addMeshPart(thruster, new THREE.CylinderGeometry(0.020, 0.020, 0.11, 8), mShellDark, 0, 0.01, -0.06, Math.PI / 2, 0, 0);
      const flameL = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.11, 10), mFlame.clone());
      flameL.position.set(-0.078, -0.185, 0);
      flameL.rotation.z = Math.PI + 0.16;
      thruster.add(flameL);
      const flameR = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.11, 10), mFlame.clone());
      flameR.position.set(0.078, -0.185, 0);
      flameR.rotation.z = Math.PI - 0.16;
      thruster.add(flameR);
      thruster.position.set(0.05, -0.20, -0.42);
      rig.add(thruster);

      // ── Two harness straps pulled across the chest ──
      const strapA = new THREE.Group();
      addMeshPart(strapA, new THREE.BoxGeometry(0.46, 0.035, 0.012), mStrap, 0, 0, 0);
      addMeshPart(strapA, new THREE.BoxGeometry(0.05, 0.048, 0.02), mBuckle, 0.14, 0, 0.006);
      strapA.position.set(0, -0.13, -0.38);
      strapA.rotation.z = 0.34;
      rig.add(strapA);

      const strapB = new THREE.Group();
      addMeshPart(strapB, new THREE.BoxGeometry(0.44, 0.032, 0.012), mStrap, 0, 0, 0);
      addMeshPart(strapB, new THREE.BoxGeometry(0.046, 0.044, 0.02), mBuckle, -0.13, 0, 0.006);
      strapB.position.set(0, -0.26, -0.38);
      strapB.rotation.z = -0.28;
      rig.add(strapB);

      // ── Gloves that pull the straps tight ──
      const handL = new THREE.Group();
      addMeshPart(handL, new THREE.BoxGeometry(0.062, 0.05, 0.085), mGlove, 0, 0, 0);
      addMeshPart(handL, new THREE.BoxGeometry(0.075, 0.075, 0.2), mGlove, 0, -0.012, 0.15);
      handL.position.set(-0.20, -0.24, -0.34);
      rig.add(handL);

      const handR = new THREE.Group();
      addMeshPart(handR, new THREE.BoxGeometry(0.062, 0.05, 0.085), mGlove, 0, 0, 0);
      addMeshPart(handR, new THREE.BoxGeometry(0.075, 0.075, 0.2), mGlove, 0, -0.012, 0.15);
      handR.position.set(0.21, -0.20, -0.34);
      rig.add(handR);

      // The pieces are authored at a comfortable working size; shrink and push the whole rig
      // away so it reads as gear on your chest rather than a plank held against the lens.
      rig.scale.setScalar(0.58);
      rig.position.set(0.02, -0.05, -0.2);
      root.add(rig);
      root.userData.rig = rig;
      root.userData.thruster = thruster;
      root.userData.strapA = strapA;
      root.userData.strapB = strapB;
      root.userData.handL = handL;
      root.userData.handR = handR;
      root.userData.flames = [flameL, flameR];
      root.userData.thrusterHome = thruster.position.clone();
      root.visible = false;
      return root;
    }

    /**
     * Thruster pack worn on a remote player's back. This is the only thing that tells an
     * opponent someone has a harness on, so it is created lazily and removed the moment the
     * broadcast state goes back to 0 — a player who never pressed P never grows one.
     */
    function makeRemoteJetPack() {
      const g = new THREE.Group();
      const mShell = new THREE.MeshStandardMaterial({ color: 0x5a6470, roughness: 0.42, metalness: 0.55 });
      const mDark = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.6, metalness: 0.4 });
      const mNozzle = new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.35, metalness: 0.75 });
      addMeshPart(g, new THREE.BoxGeometry(0.34, 0.42, 0.16), mShell, 0, 0, 0);
      addMeshPart(g, new THREE.BoxGeometry(0.26, 0.08, 0.17), mDark, 0, 0.14, 0.004);
      addMeshPart(g, new THREE.CylinderGeometry(0.055, 0.065, 0.16, 12), mNozzle, -0.13, -0.27, 0, 0, 0, 0.12);
      addMeshPart(g, new THREE.CylinderGeometry(0.055, 0.065, 0.16, 12), mNozzle, 0.13, -0.27, 0, 0, 0, -0.12);
      // Straps over the shoulders so it reads as "strapped on" even when idle.
      const mStrap = new THREE.MeshStandardMaterial({ color: 0x4a4030, roughness: 0.92 });
      addMeshPart(g, new THREE.BoxGeometry(0.06, 0.34, 0.04), mStrap, -0.12, 0.22, -0.18, 0.5, 0, 0);
      addMeshPart(g, new THREE.BoxGeometry(0.06, 0.34, 0.04), mStrap, 0.12, 0.22, -0.18, 0.5, 0, 0);

      const mFlame = new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0 });
      const fL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 10), mFlame);
      fL.position.set(-0.13, -0.44, 0);
      fL.rotation.z = Math.PI;
      g.add(fL);
      const fR = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 10), mFlame.clone());
      fR.position.set(0.13, -0.44, 0);
      fR.rotation.z = Math.PI;
      g.add(fR);

      const glow = new THREE.PointLight(0x66ccff, 0, 4);
      glow.position.set(0, -0.34, 0);
      g.add(glow);

      g.userData.flames = [fL, fR];
      g.userData.glow = glow;
      // Behind the torso, between the shoulder blades. The avatar faces +Z, so back = -Z.
      g.position.set(0, 1.34, -0.24);
      return g;
    }

    function makeBlindDartModel() {
      const root = new THREE.Group();
      const gun = new THREE.Group();
      const mBody = new THREE.MeshStandardMaterial({ color: 0x4a5560, roughness: 0.45, metalness: 0.5 });
      const mDark = new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.55, metalness: 0.45 });
      const mTip = new THREE.MeshStandardMaterial({ color: 0xc8d2dc, roughness: 0.35, metalness: 0.7 });
      const mNeon = new THREE.MeshBasicMaterial({ color: 0x6bd4ff });
      const mLoaderShaft = new THREE.MeshStandardMaterial({ color: 0x7ee0ff, roughness: 0.35, metalness: 0.55, emissive: 0x224477, emissiveIntensity: 0.65 });
      const mLoaderTip = new THREE.MeshStandardMaterial({ color: 0xe6f1ff, roughness: 0.25, metalness: 0.8 });
      addMeshPart(gun, new THREE.BoxGeometry(0.07, 0.09, 0.30), mBody, 0, 0.01, 0.02);
      addMeshPart(gun, new THREE.CylinderGeometry(0.018, 0.02, 0.34, 10), mTip, 0, 0.05, -0.12, Math.PI / 2, 0, 0);
      addMeshPart(gun, new THREE.ConeGeometry(0.015, 0.05, 8), mTip, 0, 0.05, -0.32, Math.PI / 2, 0, 0);
      addMeshPart(gun, new THREE.BoxGeometry(0.05, 0.14, 0.07), mDark, 0, -0.10, 0.05);
      addMeshPart(gun, new THREE.BoxGeometry(0.04, 0.08, 0.06), mDark, 0, -0.07, -0.02);
      addMeshPart(gun, new THREE.BoxGeometry(0.018, 0.022, 0.05), mNeon, 0, 0.075, 0.04);

      // Reload dart: a loader needle pushed into the muzzle. Hidden outside reload.
      const animDart = new THREE.Group();
      const loaderShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.18, 8), mLoaderShaft);
      loaderShaft.rotation.x = Math.PI / 2;
      animDart.add(loaderShaft);
      const loaderTip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.04, 8), mLoaderTip);
      loaderTip.rotation.x = -Math.PI / 2;
      loaderTip.position.z = -0.11;
      animDart.add(loaderTip);
      const loaderFin = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.005, 0.03), mLoaderShaft);
      loaderFin.position.z = 0.09;
      animDart.add(loaderFin);
      animDart.visible = false;
      gun.add(animDart);

      gun.position.set(0.24, -0.22, -0.74);
      attachViewHandGrips(gun, root, VIEW_HAND_GRIPS[0]);
      attachViewArmsOnGrips(root);
      const muzzleNode = new THREE.Object3D();
      muzzleNode.position.set(0, 0.05, -0.34);
      gun.add(muzzleNode);
      root.userData.muzzleNode = muzzleNode;
      root.add(gun);
      root.userData.gun = gun;
      root.userData.basePos = gun.position.clone();
      root.userData.adsOffset = new THREE.Vector3(-0.24, 0.10, 0.26);
      root.userData.animDart = animDart;
      // Fetch point is a pouch below/left of the receiver — somewhere a hand can actually
      // reach. (It used to be up-forward-right of the muzzle, i.e. mid-air, which is why
      // the loader dart looked like it was floating in on its own.)
      root.userData.dartFetchPos = new THREE.Vector3(-0.13, -0.26, 0.08);
      root.userData.dartInsertPos = new THREE.Vector3(0, 0.05, -0.26);
      /** Where the glove sits relative to the dart it is carrying (gun-local). */
      root.userData.dartHandGrip = new THREE.Vector3(0.005, -0.035, 0.075);
      return root;
    }

    /**
     * Combat knife (slot 7, key "0"). Scene-graph layering so each animation drives the
     * right level without fighting the others:
     *   root -> gun        (outer; bob/ADS/scale)
     *         -> knifePose (base held pose; never animated by us)
     *         -> swing     (CHOP animations live here — moves arm AND knife together as one
     *                       rigid unit, so the chops read as ARM SWINGS, not wrist flicks)
     *               -> knife (TOSS-DRAW animation lives here — knife alone spins; arm stays
     *                         level via the per-frame position-only follow)
     *               -> arm   (held in saber-grip pose; during toss-draw we sync its position
     *                         to the knife so the hand reaches up to catch)
     *
     * Knife is built in normal saber-grip orientation: blade VERTICAL (cutting edge down,
     * spine up), handle vertical in the fist. Blade and handle have ~equal length so the
     * toss-spin rotates around a visually centered pivot at the crossguard.
     */
    function makeKnifeModel() {
      const root = new THREE.Group();
      const gun = new THREE.Group();
      const knifePose = new THREE.Group();
      const swing = new THREE.Group();
      const knife = new THREE.Group();

      const mBlade = new THREE.MeshStandardMaterial({ color: 0xc8d0db, roughness: 0.28, metalness: 0.88 });
      const mEdge = new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.18, metalness: 0.92 });
      const mSpine = new THREE.MeshStandardMaterial({ color: 0x6a7280, roughness: 0.35, metalness: 0.85 });
      const mGuard = new THREE.MeshStandardMaterial({ color: 0x2a313c, roughness: 0.45, metalness: 0.75 });
      const mGrip = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.82, metalness: 0.18 });
      const mGripWrap = new THREE.MeshStandardMaterial({ color: 0x232831, roughness: 0.7, metalness: 0.25 });
      const mPommel = new THREE.MeshStandardMaterial({ color: 0x4a5260, roughness: 0.32, metalness: 0.82 });

      // --- BLADE (VERTICAL): thickness on X (0.006), height on Y (0.030), length on -Z ---
      const bladeCore = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.024, 0.22), mBlade);
      bladeCore.position.set(0, 0.003, -0.11);
      knife.add(bladeCore);
      // Cutting edge: brighter slim box along the bottom of the blade.
      const bladeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.006, 0.21), mEdge);
      bladeEdge.position.set(0, -0.012, -0.115);
      knife.add(bladeEdge);
      // Spine: darker top edge for contrast.
      const bladeSpine = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.22), mSpine);
      bladeSpine.position.set(0, 0.016, -0.11);
      knife.add(bladeSpine);
      // Tip: vertical wedge that comes to a point pointing forward.
      const bladeTip = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.018, 0.05), mBlade);
      bladeTip.position.set(0, -0.001, -0.235);
      knife.add(bladeTip);
      const bladeTipEdge = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.005, 0.05), mEdge);
      bladeTipEdge.position.set(0, -0.008, -0.235);
      knife.add(bladeTipEdge);

      // Crossguard: small horizontal block at the junction, wider than the blade.
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.014, 0.020), mGuard);
      guard.position.set(0, -0.002, 0);
      knife.add(guard);

      // --- HANDLE: extends along +Z from the junction. Vertical cross-section (taller than
      // wide) for a more ergonomic-looking grip than a square cross-section. ---
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.032, 0.18), mGrip);
      grip.position.set(0, -0.002, 0.10);
      knife.add(grip);
      // Grip wraps: vertical stripes around the handle for tactile detail.
      for (let i = 0; i < 4; i++) {
        const wrap = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.036, 0.012), mGripWrap);
        wrap.position.set(0, -0.002, 0.04 + i * 0.04);
        knife.add(wrap);
      }
      // Pommel: rounded butt cap at the end of the handle.
      const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.038, 0.022), mPommel);
      pommel.position.set(0, -0.002, 0.198);
      knife.add(pommel);
      // Lanyard hole on pommel — single tiny dark notch.
      const lanyard = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.008), mGuard);
      lanyard.position.set(0, -0.002, 0.215);
      knife.add(lanyard);

      // Knife slots into the swing group. Swing holds the chop animations.
      swing.add(knife);

      // --- HAND + FOREARM (chunky camo+glove, matches remote player avatar style) ---
      const arm = new THREE.Group();
      arm.name = "knifeArm";

      const mKnifeGlove = new THREE.MeshStandardMaterial({ color: 0x2b271e, roughness: 0.86, metalness: 0.05 });
      const mKnifeGloveTop = new THREE.MeshStandardMaterial({ color: 0x35302a, roughness: 0.78, metalness: 0.08 });
      const mKnifeCuff = new THREE.MeshStandardMaterial({ color: 0x141109, roughness: 0.92, metalness: 0.1 });
      const mKnifeSleeve = new THREE.MeshStandardMaterial({ color: 0x4a4a3a, roughness: 0.82, metalness: 0.08 });
      const mKnifeSleeveD = new THREE.MeshStandardMaterial({ color: 0x363629, roughness: 0.82, metalness: 0.08 });
      const mKnifePad = new THREE.MeshStandardMaterial({ color: 0x3a3a30, roughness: 0.85 });
      const mKnifeStrap = new THREE.MeshStandardMaterial({ color: 0x1f1c14, roughness: 0.92, metalness: 0.15 });
      const mKnifeStud = new THREE.MeshStandardMaterial({ color: 0x6a6a5c, roughness: 0.4, metalness: 0.78 });

      // FIST: oriented so it wraps the VERTICAL handle (taller-than-wide, like the grip).
      // Local +Y = back-of-hand, -Y = palm. The handle sits in the palm running along the Z axis.
      const palmBack = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.034, 0.090), mKnifeGloveTop);
      palmBack.position.set(0, 0.022, 0);
      arm.add(palmBack);
      const palmUnder = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.034, 0.090), mKnifeGlove);
      palmUnder.position.set(0, -0.014, 0);
      arm.add(palmUnder);
      // Four curled finger ridges visible on the inboard side (camera left) — these are the
      // fingers wrapping AROUND the handle. Vertical orientation matches saber grip.
      for (let i = 0; i < 4; i++) {
        const finger = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.011, 0.022), mKnifeGloveTop);
        finger.position.set(-0.026, 0.022 - i * 0.013, -0.022 + i * 0.005);
        arm.add(finger);
        const fingerJoint = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.011, 0.020), mKnifeStrap);
        fingerJoint.position.set(-0.034, 0.022 - i * 0.013, -0.022 + i * 0.005);
        arm.add(fingerJoint);
      }
      // Thumb crosses OVER the handle (saber-grip style: thumb on top of the spine).
      const thumbBase = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.020, 0.024), mKnifeGlove);
      thumbBase.position.set(-0.012, 0.034, -0.018);
      arm.add(thumbBase);
      const thumbTip = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.018, 0.020), mKnifeGloveTop);
      thumbTip.position.set(-0.026, 0.038, -0.026);
      arm.add(thumbTip);

      // Wrist cuff: hard black strap separating glove from sleeve. Studded.
      const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.066, 0.022), mKnifeCuff);
      cuff.position.set(0.002, 0.002, 0.058);
      arm.add(cuff);
      const stud = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, 0.008), mKnifeStud);
      stud.position.set(0.022, 0.014, 0.058);
      arm.add(stud);

      // FOREARM: drops almost straight DOWN from the wrist so the elbow exits the bottom of
      // the screen, not the side. Tiny outward Y (0.08) and small bank Z (0.05) give the
      // pose a natural, non-stiff feel without making it look like arm-wrestling.
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0.004, -0.010, 0.080);
      forearmGroup.rotation.order = "XYZ";
      forearmGroup.rotation.set(0.95, 0.08, 0.05);
      arm.add(forearmGroup);

      // Shorter forearm (0.28 instead of 0.36) — the elbow exits the screen quickly, so a
      // long sleeve just looks like a brick out of frame. Cuff + a stubby sleeve reads as
      // a real arm without anatomically-wrong proportions in the small screen space we get.
      const forearmMain = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.082, 0.28), mKnifeSleeve);
      forearmMain.position.set(0, 0, 0.16);
      forearmGroup.add(forearmMain);
      const camoStripe = new THREE.Mesh(new THREE.BoxGeometry(0.080, 0.022, 0.20), mKnifeSleeveD);
      camoStripe.position.set(0, 0.032, 0.16);
      forearmGroup.add(camoStripe);
      const strap1 = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.086, 0.014), mKnifeStrap);
      strap1.position.set(0, 0, 0.09);
      forearmGroup.add(strap1);
      const strap2 = strap1.clone();
      strap2.position.z = 0.23;
      forearmGroup.add(strap2);
      const elbowPad = new THREE.Mesh(new THREE.BoxGeometry(0.086, 0.090, 0.054), mKnifePad);
      elbowPad.position.set(0, 0, 0.32);
      forearmGroup.add(elbowPad);

      // Place arm so the fist wraps the knife handle.
      arm.position.set(0.014, -0.004, 0.108);
      swing.add(arm);

      knifePose.add(swing);
      // Base held pose: slight downward tip + slight inward turn so the knife reads as
      // "carried, ready", not "presented for inspection".
      // +0.55 on X tilts the blade tip ~32° BELOW horizontal — fist clearly raised above
      // the blade, reads as a proper upright knife grip rather than a flat fist-punch.
      knifePose.rotation.set(0.55, -0.04, -0.06);

      gun.add(knifePose);
      gun.position.set(0.18, -0.16, -0.48);
      gun.rotation.y = 0.04;

      const muzzleNode = new THREE.Object3D();
      muzzleNode.position.set(0, 0, -0.25);
      knife.add(muzzleNode);
      root.userData.muzzleNode = muzzleNode;

      root.add(gun);
      root.userData.gun = gun;
      root.userData.basePos = gun.position.clone();
      root.userData.adsOffset = new THREE.Vector3(0, 0, 0);
      root.userData.knifeGroup = knife;
      root.userData.knifeSwing = swing;
      root.userData.knifePose = knifePose;
      root.userData.knifeArm = arm;
      root.userData.knifeArmBasePos = arm.position.clone();
      return root;
    }

    function makeDevGunModel() {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x220000, metalness: 0.9, roughness: 0.2 })
      );
      body.position.set(0, 0, -0.15);
      g.add(body);
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.025, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.6 })
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.50);
      g.add(barrel);
      const grip = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.14, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      grip.position.set(0, -0.10, 0.05);
      g.add(grip);
      const muzzleNode = new THREE.Object3D();
      muzzleNode.position.set(0, 0.02, -0.67);
      g.add(muzzleNode);
      g.userData.muzzleNode = muzzleNode;
      g.userData.gun = body;
      g.userData.basePos = body.position.clone();
      g.userData.adsOffset = new THREE.Vector3(0, 0, 0);
      g.position.set(0.22, -0.18, -0.35);
      return g;
    }

    const weaponModels = [
      makeWeaponModel(0),
      makeWeaponModel(1),
      makeWeaponModel(2),
      makeWeaponModel(3),
      makeMedKitModel(),
      makeWeaponModel(5),
      makeBlindDartModel(),
      makeKnifeModel(),
      makeDevGunModel(),
      makeWeaponModel(9),
    ];

    weaponModels.forEach((w, i) => {
      w.visible = i === state.weaponIndex;
      weaponRoot.add(w);
    });

    const MED_KIT_HEAL_DURATION = 2.5;
    /**
     * Player-facing hold time to complete a med-kit heal, in seconds.
     * 8s in PVE (zombie arena + boss arena) where the player has cover and
     * can afford a longer heal; 5s in PVP where the player is exposed and a
     * fast heal is critical for survival. Driven by the per-mode predicates
     * already used elsewhere in the file.
     */
    function getMedKitHealDuration() {
      return (isPvpCrossfireMap(CURRENT_MAP) ? 5 : 8) * myVest().actionMul;
    }
    const MED_KIT_RING_LEN = 2 * Math.PI * 44;
    const MED_KIT_DEFILL_DURATION = 0.18;

    function applyMedKitRingVisual(p) {
      if (!medKitRingProgEl) return;
      const cl = Math.min(1, Math.max(0, p));
      medKitRingProgEl.style.strokeDashoffset = `${MED_KIT_RING_LEN * (1 - cl)}`;
      medKitRingProgEl.setAttribute("opacity", cl > 0.001 ? "1" : "0");
    }

    function isMedKitInputHeld() {
      return keys.f || (state.weaponIndex === 4 && state.mouseDown);
    }

    function canMedKitHealNow() {
      const wMed = weapons[4];
      return (
        state.weaponIndex === 4 &&
        gameWorldReady &&
        !paused &&
        player.health > 0 &&
        player.health < player.maxHealth &&
        wMed.ammo > 0
      );
    }

    function resetMedKitChargeState() {
      state.medKitHealProgress = 0;
      state.medKitHealStartMs = 0;
      state.medKitRingVisual = 0;
      state.medKitNeedsRelease = false;
      state.medKitDefilling = false;
      state.medKitDefillPhase = 0;
      state.medKitDefillStart = 0;
      applyMedKitRingVisual(0);
    }


    function startWeaponFireAnim() {
      const wi = state.weaponIndex;
      if (wi === 0) {
        state.weaponAction = "slide";
        state.weaponActionDur = 380;
      } else if (wi === 1 || wi === 3) {
        state.weaponAction = "auto";
        state.weaponActionDur = 160;
      } else if (wi === 2) {
        state.weaponAction = "pump";
        state.weaponActionDur = 580;
      } else if (wi === 5) {
        state.weaponAction = "bolt";
        state.weaponActionDur = 720;
      } else return;
      state.weaponActionStart = performance.now();
    }

    function getWeaponActionT() {
      if (!state.weaponAction) return 1;
      const t = (performance.now() - state.weaponActionStart) / state.weaponActionDur;
      if (t >= 1) {
        state.weaponAction = null;
        return 1;
      }
      return t;
    }

    const _shellEjectPos = new THREE.Vector3();
    const _shellEjectVel = new THREE.Vector3();

    const SHELL_COLOR_BRASS = 0xd4af37;
    const MAX_SHELL_CASINGS = 56;

    function clearShellCasings() {
      for (let i = state.shellCasings.length - 1; i >= 0; i--) {
        const s = state.shellCasings[i];
        scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        state.shellCasings.splice(i, 1);
      }
    }

    function getEjectPortWorld(out) {
      const wm = weaponModels[state.weaponIndex];
      const node = wm && wm.userData.ejectNode;
      weaponRoot.updateMatrixWorld(true);
      if (node) {
        wm.updateMatrixWorld(true);
        node.getWorldPosition(out);
        return out;
      }
      return getActiveMuzzleWorld(out);
    }

    function maybeEjectShellCasing() {
      const wi = state.weaponIndex;
      if (wi !== 1 && wi !== 2 && wi !== 3) return;

      getEjectPortWorld(_shellEjectPos);

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const back = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

      _shellEjectPos.addScaledVector(right, 0.04);
      _shellEjectPos.addScaledVector(up, 0.012);
      _shellEjectPos.addScaledVector(fwd, 0.05);

      _shellEjectVel
        .copy(right)
        .multiplyScalar(2.4 + Math.random() * 0.6)
        .addScaledVector(up, 1.05 + Math.random() * 0.35)
        .addScaledVector(back, 0.45 + Math.random() * 0.25);

      const isShotgun = wi === 2;
      const shellLen = isShotgun ? 0.052 : 0.038;
      const shellRad = isShotgun ? 0.014 : 0.01;
      const geom = new THREE.CylinderGeometry(shellRad, shellRad * 1.12, shellLen, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: SHELL_COLOR_BRASS,
        metalness: 0.9,
        roughness: 0.28,
        emissive: 0x5a4200,
        emissiveIntensity: 0.22,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.scale.setScalar(2.4);
      mesh.rotation.set(
        Math.PI / 2 + (Math.random() - 0.5) * 0.35,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.25
      );
      mesh.position.copy(_shellEjectPos);
      mesh.renderOrder = 22;
      scene.add(mesh);

      while (state.shellCasings.length >= MAX_SHELL_CASINGS) {
        const old = state.shellCasings.shift();
        scene.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.mesh.material.dispose();
      }

      state.shellCasings.push({
        mesh,
        vel: _shellEjectVel.clone(),
        rv: new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        ),
        life: 1.45,
      });
    }

    function updateShellCasings(dt) {
      for (let i = state.shellCasings.length - 1; i >= 0; i--) {
        const s = state.shellCasings[i];
        s.life -= dt;
        s.vel.y -= 9.5 * dt;
        s.mesh.position.addScaledVector(s.vel, dt);
        s.mesh.rotation.x += s.rv.x * dt;
        s.mesh.rotation.y += s.rv.y * dt;
        s.mesh.rotation.z += s.rv.z * dt;
        if (s.life <= 0) {
          scene.remove(s.mesh);
          s.mesh.geometry.dispose();
          s.mesh.material.dispose();
          state.shellCasings.splice(i, 1);
        }
      }
    }

    function getWeaponReloadMotion(wi, rp) {
      const p = THREE.MathUtils.clamp(rp, 0, 1);
      const sin = Math.sin(p * Math.PI);
      const out = {
        reloadRotX: 0,
        reloadRotY: 0,
        reloadRotZ: 0,
        reloadX: 0,
        reloadY: 0,
        reloadPushZ: 0,
      };
      if (wi === 0) {
        out.reloadRotZ = -0.08 * sin;
        out.reloadY = 0.04 * sin;
        out.reloadX = 0.025 * sin;
        out.reloadPushZ = -0.07 * sin;
      } else if (wi === 1 || wi === 3) {
        out.reloadRotZ = -0.1 * sin;
        out.reloadY = 0.05 * sin;
        out.reloadX = 0.035 * sin;
        out.reloadPushZ = -0.08 * sin;
      } else if (wi === 2) {
        const open = p < 0.14 ? p / 0.14 : p > 0.9 ? (1 - p) / 0.1 : 1;
        out.reloadY = 0.035 * open;
        out.reloadX = 0.03 * open;
        out.reloadPushZ = -0.06 * open;
      } else if (wi === 4) {
        if (p < 0.25) {
          const q = p / 0.25;
          out.reloadRotZ = -1.0 * q;
          out.reloadRotY = -0.35 * q;
          out.reloadY = 0.08 * q;
        } else if (p < 0.8) {
          const q = (p - 0.25) / 0.55;
          out.reloadRotZ = -1.0;
          out.reloadRotY = -0.35;
          out.reloadY = 0.08 + Math.sin(q * Math.PI * 3) * 0.05;
          out.reloadX = -0.03;
        } else {
          const q = (p - 0.8) / 0.2;
          out.reloadRotZ = -1.0 * (1 - q);
          out.reloadRotY = -0.35 * (1 - q);
          out.reloadY = 0.08 * (1 - q);
        }
      } else if (wi === 5) {
        out.reloadRotZ = -0.07 * sin;
        out.reloadY = 0.07 * sin;
        out.reloadX = 0.045 * sin;
        out.reloadPushZ = -0.1 * sin;
      } else if (wi === 6) {
        const draw = reloadPhase(p, 0, 0.22);
        const work = reloadPhase(p, 0.16, 0.82);
        const settle = reloadPhase(p, 0.82, 1);
        out.reloadRotZ = THREE.MathUtils.lerp(-0.34, -0.08, settle) * (1 - draw) - 0.08 * Math.sin(work * Math.PI * 2);
        out.reloadRotY = -0.18 * Math.sin(work * Math.PI);
        out.reloadY = 0.08 * Math.sin(p * Math.PI) - 0.025 * settle;
        out.reloadX = -0.04 * Math.sin(work * Math.PI);
        out.reloadPushZ = -0.11 * Math.sin(work * Math.PI);
      }
      return out;
    }

    function applyReloadPartAnims(ud, wi, rp) {
      if (!state.reloading || rp <= 0) return;
      const w = weapon();
      const magBase = ud.magBasePos;
      const p = rp;

      if (ud.animMag && magBase) {
        ud.animMag.rotation.set(0, 0, 0);
      }
      if (ud.animReloadShell) ud.animReloadShell.visible = false;
      if (ud.animBreak) ud.animBreak.rotation.set(0, 0, 0);

      if (wi === 0) {
        const magOut = reloadPhase(p, 0, 0.32);
        const magIn = reloadPhase(p, 0.32, 0.5);
        const rack = reloadPhase(p, 0.5, 1);
        if (ud.animMag && magBase) {
          const inHand = magOut > 0.12 && magOut < 0.88;
          if (!inHand) {
            ud.animMag.visible = true;
            if (magOut < 0.12) {
              ud.animMag.position.y = magBase.y - 0.14 * (magOut / 0.12);
              ud.animMag.position.z = magBase.z - 0.05 * (magOut / 0.12);
            } else if (magIn > 0.88) {
              const t = (magIn - 0.88) / 0.12;
              ud.animMag.position.y = magBase.y - 0.1 * (1 - t);
              ud.animMag.position.z = magBase.z - 0.04 * (1 - t);
              ud.animMag.position.x = magBase.x;
            } else {
              ud.animMag.position.copy(magBase);
            }
          } else {
            ud.animMag.visible = false;
          }
        }
        if (ud.animSlide && rack > 0) {
          let slideBack = 0;
          if (rack < 0.52) slideBack = 0.22 * (rack / 0.52);
          else slideBack = 0.22 * (1 - (rack - 0.52) / 0.48);
          ud.animSlide.position.z = slideBack;
          ud.animSlide.rotation.x = -0.06 * slideBack;
        }
      } else if (wi === 1 || wi === 3) {
        const magOut = reloadPhase(p, 0, 0.32);
        const magIn = reloadPhase(p, 0.32, 0.58);
        if (ud.animMag && magBase) {
          const inHand = magOut > 0.14 && magOut < 0.86;
          if (!inHand) {
            ud.animMag.visible = true;
            if (magOut < 0.14) {
              const t = magOut / 0.14;
              ud.animMag.position.y = magBase.y - 0.16 * t;
              ud.animMag.position.z = magBase.z - 0.06 * t;
            } else if (magIn > 0.86) {
              const t = (magIn - 0.86) / 0.14;
              ud.animMag.position.y = magBase.y - 0.12 * (1 - t);
              ud.animMag.position.z = magBase.z - 0.05 * (1 - t);
              ud.animMag.position.x = magBase.x;
            } else {
              ud.animMag.position.copy(magBase);
            }
          } else {
            ud.animMag.visible = false;
          }
        }
      } else if (wi === 2) {
        const openT = reloadPhase(p, 0, 0.14);
        const closeT = reloadPhase(p, 0.88, 1);
        let breakOpen = 0;
        if (openT < 1) breakOpen = openT;
        else if (closeT > 0) breakOpen = 1 - closeT;
        else breakOpen = 1;
        if (ud.animBreak) ud.animBreak.rotation.x = -breakOpen * 0.68;

        const shellsNeeded = Math.max(1, w.magSize - state.reloadStartAmmo);
        const loadT = reloadPhase(p, 0.14, 0.88);
        if (ud.animReloadShell && loadT > 0 && loadT < 1) {
          const idx = Math.min(
            shellsNeeded - 1,
            Math.floor(loadT * shellsNeeded)
          );
          const shellP = loadT * shellsNeeded - idx;
          ud.animReloadShell.visible = true;
          ud.animReloadShell.position.set(0, 0.05 + shellP * 0.035, -0.04 - shellP * 0.05);
          ud.animReloadShell.rotation.x = Math.PI / 2 + shellP * 0.45;
        }
      } else if (wi === 5) {
        const boltOpen = reloadPhase(p, 0, 0.18);
        const magOut = reloadPhase(p, 0.18, 0.4);
        const magIn = reloadPhase(p, 0.4, 0.62);
        const boltClose = reloadPhase(p, 0.62, 1);
        let boltPull = 0;
        if (boltOpen < 1) boltPull = 0.34 * boltOpen;
        else if (boltClose > 0) boltPull = 0.34 * (1 - boltClose);
        else boltPull = 0.34;
        if (ud.animBolt) ud.animBolt.position.z = boltPull;
        if (ud.animMag && magBase) {
          const inHand = magOut > 0.16 && magOut < 0.84;
          if (!inHand) {
            ud.animMag.visible = true;
            if (magOut < 0.16) {
              const t = magOut / 0.16;
              ud.animMag.position.y = magBase.y - 0.14 * t;
              ud.animMag.position.z = magBase.z - 0.05 * t;
            } else if (magIn > 0.84) {
              const t = (magIn - 0.84) / 0.16;
              ud.animMag.position.y = magBase.y - 0.1 * (1 - t);
              ud.animMag.position.z = magBase.z - 0.04 * (1 - t);
              ud.animMag.position.x = magBase.x;
            } else {
              ud.animMag.position.copy(magBase);
            }
          } else {
            ud.animMag.visible = false;
          }
        }
      } else if (wi === 6) {
        // Paralysis Dart: sequential per-dart loading. The pose is shared with the left
        // glove (see getDartLoaderPose) so the dart is always in the hand loading it.
        const dart = ud.animDart;
        const pose = getDartLoaderPose(ud, p);
        if (dart && pose) {
          dart.visible = pose.dartVisible;
          if (pose.dartVisible) {
            dart.position.set(pose.dartPos.x, pose.dartPos.y, pose.dartPos.z);
            dart.rotation.set(pose.dartRot.x, pose.dartRot.y, pose.dartRot.z);
            dart.scale.setScalar(pose.dartScale);
          }
        }
      }
      applyViewArmReload(ud, wi, rp);
    }

    /** View-model weapon parts: slide / bolt / pump / mag + kick. */
    function applyWeaponHandsAnim(activeWeapon, reloadProgress) {
      const ud = activeWeapon.userData;
      const wi = state.weaponIndex;
      if (ud.animSlide) {
        ud.animSlide.position.set(0, 0, 0);
        ud.animSlide.rotation.set(0, 0, 0);
      }
      if (ud.animBolt) ud.animBolt.position.set(0, 0, 0);
      if (ud.animPump) ud.animPump.position.set(0, 0, 0);
      if (ud.animBarrel) ud.animBarrel.rotation.set(0, 0, 0);
      if (ud.animMag && ud.magBasePos && !state.reloading) {
        ud.animMag.position.copy(ud.magBasePos);
        ud.animMag.visible = true;
        hideHandMagProxy(ud);
      }
      if (ud.animBreak) ud.animBreak.rotation.set(0, 0, 0);
      if (ud.animReloadShell) ud.animReloadShell.visible = false;
      if (ud.animDart) ud.animDart.visible = false;

      let offX = 0;
      let offY = 0;
      let offZ = 0;
      let rotX = 0;
      let rotZ = 0;
      const act = state.weaponAction;
      const t = getWeaponActionT();
      const k = Math.sin(t * Math.PI);
      const rp = reloadProgress;

      if (state.reloading && wi !== 4) {
        applyReloadPartAnims(ud, wi, rp);
      } else if (wi !== 4 && ud.viewArmR) {
        applyViewArmIdlePose(ud, wi);
      } else {
        resetViewArms(ud);
      }

      if (wi === 0) {
        let slideBack = 0;
        if (act === "slide") slideBack = 0.09 * k;
        if (ud.animSlide) ud.animSlide.position.z = slideBack;
        if (act === "pistolDraw") {
          // 转枪切枪：从右侧飞入，正向翻转360°后稳住。整条弧线抬高到视野中段，
          // 避免旋转阶段被 HUD/枪管挡住。
          if (t < 0.60) {
            const u = THREE.MathUtils.smoothstep(t / 0.60, 0, 1);
            rotX = THREE.MathUtils.lerp(Math.PI * 2, 0, u);
            offX = THREE.MathUtils.lerp(0.18, 0.00, u);
            // raised: enters mid-frame instead of from below; peaks slightly above resting pose so
            // the full spin is visible, then settles back down in the second phase.
            offY = THREE.MathUtils.lerp(0.02, 0.12, u);
            rotZ = THREE.MathUtils.lerp(0.28, 0.0, u);
          } else {
            const u = THREE.MathUtils.smoothstep((t - 0.60) / 0.40, 0, 1);
            offY = THREE.MathUtils.lerp(0.12, 0.00, u);
            rotX = 0; rotZ = 0; offX = 0;
          }
          if (ud.viewArmR && ud.armRBasePos && ud.armRBaseRot) {
            const armSlide = THREE.MathUtils.smoothstep(t, 0.00, 0.58);
            setViewHandPose(ud.viewArmR, ud.armRBasePos, ud.armRBaseRot,
              THREE.MathUtils.lerp(0.12, 0, armSlide), 0, 0, 0, 0, 0);
          }
        } else {
          rotX = state.reloading ? 0 : -0.035 * k;
        }
      } else if (wi === 1 || wi === 3) {
        if (act === "auto") rotX = -0.04 * k;
        if ((wi === 1 && act === "arDraw") || (wi === 3 && act === "smgDraw")) {
          // AR: slow tactical raise from left hip; SMG: snappy raise from below
          const riseEnd = wi === 1 ? 0.48 : 0.36;
          const rise    = THREE.MathUtils.smoothstep(t, 0.00, riseEnd);
          const lat     = THREE.MathUtils.smoothstep(t, 0.05, 0.52);
          const tilt    = THREE.MathUtils.smoothstep(t, 0.05, 0.58);
          const settle  = THREE.MathUtils.smoothstep(t, 0.58, 1.00);
          offY = THREE.MathUtils.lerp(wi === 1 ? -0.38 : -0.28, 0.04, rise) - 0.04 * settle;
          offX = THREE.MathUtils.lerp(wi === 1 ? -0.10 :  0.06, 0.00, lat);
          rotZ = THREE.MathUtils.lerp(wi === 1 ?  0.14 : -0.12, 0.00, tilt);
          rotX = -0.05 * Math.sin(t * Math.PI);
        }
      } else if (wi === 2) {
        if (act === "shotgunDraw") {
          // 喷子：双抛接——底部抛起旋转接住，再次小抛旋转接住稳定
          if (t < 0.30) {
            // 第一次抛：从底部飞起，正向翻转360°
            const u = THREE.MathUtils.smoothstep(t / 0.30, 0, 1);
            offY = THREE.MathUtils.lerp(-0.62, 0.10, u);
            rotX = THREE.MathUtils.lerp(Math.PI * 2, 0, u);
            offX = THREE.MathUtils.lerp(0.18, 0.00, u);
            rotZ = THREE.MathUtils.lerp(0.20, 0.00, u);
          } else if (t < 0.46) {
            // 第一次接：落下稳住瞬间
            const u = THREE.MathUtils.smoothstep((t - 0.30) / 0.16, 0, 1);
            offY = THREE.MathUtils.lerp(0.10, 0.00, u);
            rotX = 0; offX = 0; rotZ = 0;
          } else if (t < 0.74) {
            // 第二次抛：小弧度再抛，半圈旋转
            const u = THREE.MathUtils.smoothstep((t - 0.46) / 0.28, 0, 1);
            offY = Math.sin(u * Math.PI) * 0.09;
            rotX = THREE.MathUtils.lerp(Math.PI, 0, u);
          } else {
            // 第二次接：落稳成正常持枪
            const u = THREE.MathUtils.smoothstep((t - 0.74) / 0.26, 0, 1);
            offY = THREE.MathUtils.lerp(0.03, 0.00, u);
            rotX = 0; rotZ = 0; offX = 0;
          }
        } else {
          let pumpZ = 0;
          if (act === "pump" && !state.reloading) pumpZ = 0.11 * k;
          if (ud.animPump) ud.animPump.position.z = pumpZ;
          rotX = -0.03 * k;
        }
      } else if (wi === 5) {
        if (act === "amrDraw") {
          // Heavy sniper: slow deliberate shoulder mount from below-right
          const rise   = THREE.MathUtils.smoothstep(t, 0.00, 0.60);
          const center = THREE.MathUtils.smoothstep(t, 0.05, 0.58);
          const level  = THREE.MathUtils.smoothstep(t, 0.12, 0.65);
          const settle = THREE.MathUtils.smoothstep(t, 0.65, 1.00);
          offY = THREE.MathUtils.lerp(-0.62, 0.06, rise) - 0.06 * settle;
          offX = THREE.MathUtils.lerp( 0.14, 0.00, center);
          rotZ = THREE.MathUtils.lerp(-0.22, 0.00, level);
          rotX = THREE.MathUtils.lerp( 0.14, 0.00, THREE.MathUtils.smoothstep(t, 0.10, 0.62));
        } else if (act === "bolt" && !state.reloading) {
          let boltPull = 0;
          if (t < 0.35) boltPull = 0.22 * (t / 0.35);
          else if (t < 0.65) boltPull = 0.22;
          else boltPull = 0.22 * (1 - (t - 0.65) / 0.35);
          if (ud.animBolt) ud.animBolt.position.z = boltPull;
          rotX = -0.04 * k;
        }
      } else if (wi === 4) {
        if (rp > 0) {
          offY = -0.05 * Math.sin(rp * Math.PI);
          rotZ = -0.25 * Math.sin(rp * Math.PI);
        }
        if (act === "medKitDraw") {
          // Pull med kit from lower-left (reaching into pack)
          const rise   = THREE.MathUtils.smoothstep(t, 0.00, 0.50);
          const slide  = THREE.MathUtils.smoothstep(t, 0.05, 0.55);
          const level  = THREE.MathUtils.smoothstep(t, 0.15, 0.65);
          const settle = THREE.MathUtils.smoothstep(t, 0.65, 1.00);
          offY += THREE.MathUtils.lerp(-0.28, 0.06, rise) - 0.06 * settle;
          offX  = THREE.MathUtils.lerp(-0.12, 0.00, slide);
          rotZ += THREE.MathUtils.lerp( 0.28, 0.00, level);
          rotX  = -0.04 * Math.sin(t * Math.PI);
        }
      } else if (wi === 7) {
        // Knife system. Two animation layers:
        //   - `swing` group moves BOTH the knife AND the arm rigidly (used for chops/thrust,
        //     so the whole arm rotates from the shoulder — looks like a real swing, not a
        //     wrist flick).
        //   - `knife` group moves the blade alone (used for the toss-draw spin; arm follows
        //     via position-only so the hand reaches up to catch but doesn't spin with the
        //     blade through 2 full rotations).
        const knife = ud.knifeGroup;
        const swingGrp = ud.knifeSwing;
        const arm = ud.knifeArm;
        const armBase = ud.knifeArmBasePos;
        if (knife) {
          knife.position.set(0, 0, 0);
          knife.rotation.set(0, 0, 0);
        }
        if (swingGrp) {
          swingGrp.position.set(0, 0, 0);
          swingGrp.rotation.set(0, 0, 0);
        }
        if (arm && armBase) {
          arm.position.copy(armBase);
        }

        if (act === "knifeDraw" && knife) {
          // Toss the knife up, free-spin 2 full rotations around X (pivot at handle/blade
          // junction), catch. The arm follows knife.position so the hand reaches up.
          const lift = Math.sin(t * Math.PI) * 0.42;
          knife.position.y = lift;
          knife.position.z = -Math.sin(t * Math.PI) * 0.18;
          const spinPhase = THREE.MathUtils.smoothstep(t, 0.05, 0.92);
          knife.rotation.x = -spinPhase * Math.PI * 4;
          offY = -0.04 * Math.sin(t * Math.PI);
          if (arm && armBase) {
            arm.position.set(armBase.x, armBase.y + knife.position.y, armBase.z + knife.position.z);
          }
        } else if (act === "knifeSlashL" && swingGrp) {
          // LEFT SLASH — POSITION-DOMINANT. The knife stays fixed in the hand (near-zero
          // rotation on swing). The whole arm+knife unit TRANSLATES through a big diagonal
          // arc: upper-right → lower-left. The knife tip visibly moves across the screen.
          //   wind-up (0.00..0.18): lift to upper-right
          //   strike  (0.18..0.35): easeOutQuart sweep to lower-left
          //   recover (0.35..1.00): easeOutQuad slow return (65% of duration = very visible)
          let px, py, pz, rx, ry, rz;
          if (t < 0.18) {
            const u = t / 0.18;
            const e = u * u * (3 - 2 * u);
            px = 0.22 * e;   py = 0.24 * e;   pz = 0.06 * e;
            rx = -0.06 * e;  ry = 0;           rz = 0.08 * e;
          } else if (t < 0.35) {
            const u = (t - 0.18) / 0.17;
            const e = 1 - Math.pow(1 - u, 4);
            px = THREE.MathUtils.lerp(0.22, -0.49, e);
            py = THREE.MathUtils.lerp(0.24, 0.02, e);
            pz = THREE.MathUtils.lerp(0.06, -0.14, e);
            rx = THREE.MathUtils.lerp(-0.06, 0.04, e);
            ry = 0;
            rz = THREE.MathUtils.lerp(0.08, -0.10, e);
          } else {
            const u = (t - 0.35) / 0.65;
            const e = 1 - Math.pow(1 - u, 2);
            px = THREE.MathUtils.lerp(-0.49, 0, e);
            py = THREE.MathUtils.lerp(0.02, 0, e);
            pz = THREE.MathUtils.lerp(-0.14, 0, e);
            rx = THREE.MathUtils.lerp(0.04, 0, e);
            ry = 0;
            rz = THREE.MathUtils.lerp(-0.10, 0, e);
          }
          swingGrp.position.set(px, py, pz);
          swingGrp.rotation.set(rx, ry, rz);
          offY = -0.03 * Math.sin(THREE.MathUtils.clamp((t - 0.12) * 2.2, 0, 1) * Math.PI);
        } else if (act === "knifeSlashR" && swingGrp) {
          // RIGHT SLASH — mirror of left.
          let px, py, pz, rx, ry, rz;
          if (t < 0.18) {
            const u = t / 0.18;
            const e = u * u * (3 - 2 * u);
            px = -0.22 * e;  py = 0.24 * e;   pz = 0.06 * e;
            rx = -0.06 * e;  ry = 0;           rz = -0.08 * e;
          } else if (t < 0.35) {
            const u = (t - 0.18) / 0.17;
            const e = 1 - Math.pow(1 - u, 4);
            px = THREE.MathUtils.lerp(-0.22, 0.49, e);
            py = THREE.MathUtils.lerp(0.24, 0.02, e);
            pz = THREE.MathUtils.lerp(0.06, -0.14, e);
            rx = THREE.MathUtils.lerp(-0.06, 0.04, e);
            ry = 0;
            rz = THREE.MathUtils.lerp(-0.08, 0.10, e);
          } else {
            const u = (t - 0.35) / 0.65;
            const e = 1 - Math.pow(1 - u, 2);
            px = THREE.MathUtils.lerp(0.49, 0, e);
            py = THREE.MathUtils.lerp(0.02, 0, e);
            pz = THREE.MathUtils.lerp(-0.14, 0, e);
            rx = THREE.MathUtils.lerp(0.04, 0, e);
            ry = 0;
            rz = THREE.MathUtils.lerp(0.10, 0, e);
          }
          swingGrp.position.set(px, py, pz);
          swingGrp.rotation.set(rx, ry, rz);
          offY = -0.03 * Math.sin(THREE.MathUtils.clamp((t - 0.12) * 2.2, 0, 1) * Math.PI);
        } else if (act === "knifeThrust" && swingGrp) {
          // THRUST — almost pure Z translation. Knife raised slightly above rest.
          //   wind-up (0.00..0.20): chamber back
          //   stab    (0.20..0.38): easeOutQuart forward punch
          //   hold    (0.38..0.50): freeze at extension
          //   recover (0.50..1.00): easeOutQuad slow pull back (50% of duration)
          let px, py, pz, rx;
          if (t < 0.20) {
            const u = t / 0.20;
            const e = u * u * (3 - 2 * u);
            px = 0.03 * e;   py = 0.16 * e;   pz = 0.16 * e;
            rx = -0.08 * e;
          } else if (t < 0.38) {
            const u = (t - 0.20) / 0.18;
            const e = 1 - Math.pow(1 - u, 4);
            px = THREE.MathUtils.lerp(0.03, -0.03, e);
            py = THREE.MathUtils.lerp(0.16, 0.06, e);
            pz = THREE.MathUtils.lerp(0.16, -0.52, e);
            rx = THREE.MathUtils.lerp(-0.08, 0.06, e);
          } else if (t < 0.50) {
            px = -0.03;  py = 0.06;  pz = -0.52;  rx = 0.06;
          } else {
            const u = (t - 0.50) / 0.50;
            const e = 1 - Math.pow(1 - u, 2);
            px = THREE.MathUtils.lerp(-0.03, 0, e);
            py = THREE.MathUtils.lerp(0.06, 0, e);
            pz = THREE.MathUtils.lerp(-0.52, 0, e);
            rx = THREE.MathUtils.lerp(0.06, 0, e);
          }
          swingGrp.position.set(px, py, pz);
          swingGrp.rotation.set(rx, 0, 0);
        }
      }

      if (wi === 6) {
        if (act === "dartDraw") {
          // Dart gun: rises from below with a quick flip to ready position
          const rise   = THREE.MathUtils.smoothstep(t, 0.00, 0.44);
          const flip   = THREE.MathUtils.smoothstep(t, 0.05, 0.50);
          const center = THREE.MathUtils.smoothstep(t, 0.08, 0.50);
          const settle = THREE.MathUtils.smoothstep(t, 0.50, 1.00);
          offY = THREE.MathUtils.lerp(-0.34, 0.05, rise) - 0.05 * settle;
          offX = THREE.MathUtils.lerp( 0.08, 0.00, center);
          rotZ = THREE.MathUtils.lerp(-0.70, 0.00, flip);
          rotX = -0.05 * Math.sin(t * Math.PI);
        }
      }
      if (wi === 8) {
        if (act === "devDraw") {
          // ～～～：从左下大弧度托枪入场，rotX前倾后挺直，带轻微过冲回弹
          if (t < 0.58) {
            const u = THREE.MathUtils.smoothstep(t / 0.58, 0, 1);
            offY = THREE.MathUtils.lerp(-0.52, 0.06, u);
            offX = THREE.MathUtils.lerp(-0.24, 0.00, u);
            rotX = THREE.MathUtils.lerp( 0.55, 0.00, u);   // 枪口从朝下转到平端
            rotZ = THREE.MathUtils.lerp(-0.38, 0.00, u);   // 入场侧倾
          } else {
            // 过冲 + 回弹
            const u = THREE.MathUtils.smoothstep((t - 0.58) / 0.42, 0, 1);
            const bounce = Math.sin(u * Math.PI) * 0.025;
            offY = THREE.MathUtils.lerp(0.06, 0.00, u) + bounce;
            rotX = -bounce * 0.8;
            offX = 0; rotZ = 0;
          }
        }
      }

      return { offX, offY, offZ, rotX, rotZ };
    }

    function setWeapon(index) {
      const prev = state.weaponIndex;
      flashInvBar(); // slide the hotbar up so the new selection is visible
      state.weaponIndex = THREE.MathUtils.clamp(index | 0, 0, weaponModels.length - 1);
      state.ads = false;
      state.adsProgress = 0;
      state.adsFiredWhileScoping = false;
      state.reloading = false;
      state.reloadEnd = 0;
      if (prev === 4 || index === 4) resetMedKitChargeState();
      // Switching TO the med pack (not re-selecting, not leaving) plays the
      // medpack.ogg pickup/equip cue. Re-selecting it shouldn't re-fire the
      // sound; leaving it shouldn't either.
      if (prev !== 4 && index === 4) playMedPackSwitchSound();
      state.weaponAction = null;
      clearShellCasings();
      weaponModels.forEach((w, i) => {
        w.visible = i === index;
      });
      // Knife draw animation: toss into air, spin 2 full rotations around the handle/blade
      // junction, catch back in hand. ~650ms total feels punchy without being fiddly.
      function playDrawSound() {
        if (!drawSoundBuffer) { void ensureDrawSoundBuffer(); return; }
        if (audioCtx.state === "suspended") void audioCtx.resume();
        const bs = audioCtx.createBufferSource();
        bs.buffer = drawSoundBuffer;
        const g = audioCtx.createGain();
        g.gain.value = 0.8;
        bs.connect(g);
        g.connect(audioSfx);
        try { bs.start(); } catch (_) {}
      }

      // ── Weapon draw animations (out of holster / sling / pack) ──────────
      if (state.weaponIndex === 7 && prev !== 7) {
        state.weaponAction = "knifeDraw";
        state.weaponActionDur = 650;
        state.weaponActionStart = performance.now();
        // 切刀音效沿用挥刀声，只把尾音拉长，听起来更像抽刀入手。
        // Stack three layers (knife.ogg ×3) for a denser "shing" on the draw.
        playKnifeSwingSound(0.46, 0.32);
        playKnifeSwingSound(0.46, 0.32);
        playKnifeSwingSound(0.46, 0.32);
        state.knifeComboIdx = 0;
      }
      if (state.weaponIndex === 0 && prev !== 0) {
        state.weaponAction = "pistolDraw";
        state.weaponActionDur = 950;
        state.weaponActionStart = performance.now();
        playDrawSound();
      }
      if (state.weaponIndex === 2 && prev !== 2) {
        state.weaponAction = "shotgunDraw";
        state.weaponActionDur = 1050;
        state.weaponActionStart = performance.now();
        // Play middle section of the cinematic shotgun MP3 as draw/rack sound (pump mechanism)
        // Adjust SHOTGUN_DRAW_OFFSET / SHOTGUN_DRAW_DUR if the pump lands at different timestamps
        if (typeof shotgunFireBuffer !== "undefined" && shotgunFireBuffer) {
          if (audioCtx.state === "suspended") void audioCtx.resume();
          const SHOTGUN_DRAW_OFFSET = 0.0;  // chambering 0s → 0.42s
          const SHOTGUN_DRAW_DUR   = 0.42;
          const bsDraw = audioCtx.createBufferSource();
          bsDraw.buffer = shotgunFireBuffer;
          const gDraw = audioCtx.createGain();
          gDraw.gain.value = 0.8;
          bsDraw.connect(gDraw);
          gDraw.connect(audioSfx);
          try { bsDraw.start(0, SHOTGUN_DRAW_OFFSET, SHOTGUN_DRAW_DUR); } catch (_) {}
        }
      }
      if (state.weaponIndex === 1 && prev !== 1) {
        state.weaponAction = "arDraw";
        state.weaponActionDur = 480;
        state.weaponActionStart = performance.now();
        playDrawSound();
      }
      if (state.weaponIndex === 3 && prev !== 3) {
        state.weaponAction = "smgDraw";
        state.weaponActionDur = 380;
        state.weaponActionStart = performance.now();
        playDrawSound();
      }
      if (state.weaponIndex === 5 && prev !== 5) {
        state.weaponAction = "amrDraw";
        state.weaponActionDur = 750;
        state.weaponActionStart = performance.now();
        playDrawSound();
      }
      if (state.weaponIndex === 4 && prev !== 4) {
        state.weaponAction = "medKitDraw";
        state.weaponActionDur = 550;
        state.weaponActionStart = performance.now();
        playDrawSound();
      }
      if (state.weaponIndex === 6 && prev !== 6) {
        state.weaponAction = "dartDraw";
        state.weaponActionDur = 460;
        state.weaponActionStart = performance.now();
        playDrawSound();
      }
      if (state.weaponIndex === 8 && prev !== 8) {
        state.weaponAction = "devDraw";
        state.weaponActionDur = 820;
        state.weaponActionStart = performance.now();
      }
      updateHud();
    }

    function startReload() {
      if (state.weaponIndex === 4 || state.weaponIndex === 7 || state.weaponIndex === 8) return;
      const w = weapon();
      if (state.reloading) return;
      if (w.ammo >= w.magSize) return;
      state.reloading = true;
      state.ads = false;
      state.reloadStartAmmo = w.ammo;
      // Vests slow every hand action: reloads, med-kit use, strapping the harness on.
      state.reloadEnd = performance.now() + w.reloadTime * getDartSlowReloadMult() * myVest().actionMul;
      playReloadSound();
      updateHud();
    }

    document.addEventListener("keydown", (e) => {
      if (settingsModalOpen && e.key === "Escape") {
        closeSettingsModal();
        e.preventDefault();
        return;
      }
      if (chatOpen) {
        if (e.key === "Enter") { sendChat(); e.preventDefault(); }
        if (e.key === "Escape") { closeChat(); renderer.domElement.requestPointerLock(); e.preventDefault(); }
        return;
      }
      const k = e.key.toLowerCase();
      if (
        isAction(e, "flashlight") &&
        started &&
        gameWorldReady &&
        menuEl.style.display === "none" &&
        !chatOpen &&
        !settingsModalOpen
      ) {
        if (isBrightIndoorMap(CURRENT_MAP)) {
          e.preventDefault();
          return;
        }
        playerLightsPreference = !playerLightsPreference;
        refreshLocalPlayerLightsForCurrentState();
        playFlashlightToggleSound();
        e.preventDefault();
        return;
      }
      if (
        isAction(e, "flashBeam") &&
        started &&
        gameWorldReady &&
        menuEl.style.display === "none" &&
        !chatOpen &&
        !settingsModalOpen
      ) {
        if (isBrightIndoorMap(CURRENT_MAP)) {
          e.preventDefault();
          return;
        }
        if (e.repeat) return;
        flashlightBeamLevel = (flashlightBeamLevel + 1) % 3;
        e.preventDefault();
        return;
      }
      if (isAction(e, "chat") && started && !paused && player.health > 0) {
        e.preventDefault();
        document.exitPointerLock();
        openChat();
        return;
      }
      if (paused) return;
      if (isAction(e, "moveForward")) keys.w = true;
      if (isAction(e, "moveLeft")) keys.a = true;
      if (isAction(e, "moveBack")) keys.s = true;
      if (isAction(e, "moveRight")) keys.d = true;
      if (isAction(e, "jump")) keys.space = true;
      if (isAction(e, "aim")) keys.shift = true;
      if (isAction(e, "heal")) keys.f = true;
      // Deliberately NOT preventDefault'd — swallowing ControlLeft would break every
      // browser chord (Ctrl+R, Ctrl+W) while the game has focus.
      if (isAction(e, "crouch")) keys.crouch = true;
      // Hotbar keys — order follows gameSettings.weaponSlotOrder
      { const _sk = ["1","2","3","4","5","6","7","0"];
        const _si = _sk.indexOf(k);
        if (_si >= 0) {
          const _slot = activeHotbarSlots().find((sl) => sl.key === k);
          // A key with nothing behind it still peeks the bar, so the layout is discoverable.
          if (_slot) trySelectWeapon(_slot.widx); else flashInvBar();
        } }
      if (k === "/" || e.code === "Slash") {
        e.preventDefault();
        if (DEV_GUN_UNLOCKED) weaponUnlocked[8] = true;
        trySelectWeapon(8);
      }
      if (isAction(e, "reload")) startReload();

      if (isAction(e, "dash") && started && !paused && player.health > 0 && gameWorldReady && menuEl.style.display === "none" && !chatOpen && !settingsModalOpen) {
        const nowC = performance.now();
        if (isJetStrapping()) {
          showCombatFeedback(tr("jetBusy", "STRAPPING IN..."), "#88ccff", 0.25);
        } else if (nowC < state.dashDisabledUntil) {
          showCombatFeedback("DASH LOCKED " + Math.ceil((state.dashDisabledUntil - nowC) / 1000) + "s", "#ff4422", 0.25);
        } else if (!isJetActive() && state.stamina < STAMINA_DASH_COST) {
          showCombatFeedback(tr("staminaEmpty", "OUT OF STAMINA"), "#ffb21f", 0.25);
        } else if (nowC >= state.dashCooldownEnd) {
          // True velocity-based dash. DASH_DIST units over DASH_DURATION_MS (≈200ms —
          // half the prior 400ms, so the dash is 2× faster and more responsive).
          // Direction comes from the player's last horizontal movement (captured
          // every frame in updatePlayer): W → forward, W+A → diagonal forward-left,
          // etc. If the player has no recent movement input, fall back to camera-
          // forward. Wall sliding + the 350ms cooldown still apply.
          const DASH_DIST = 8.0;
          const DASH_DURATION_MS = 200;
          const cp = Math.cos(player.pitch);
          let dirX;
          let dirY;
          let dirZ;
          const jetting = isJetActive();
          if (jetting) {
            // Jet dash: fly along the FULL look vector, pitch included. Camera-forward is
            // already unit length, so the travelled distance is DASH_DIST at every angle —
            // straight up covers exactly as much ground as straight ahead.
            dirX = -Math.sin(player.yaw) * cp;
            dirY = Math.sin(player.pitch);
            dirZ = -Math.cos(player.yaw) * cp;
          } else {
            // Ground dash: direction comes from the player's last horizontal movement
            // (captured every frame in updatePlayer): W → forward, W+A → diagonal
            // forward-left, etc. No recent WASD falls back to look-forward, flattened.
            dirX = state.lastMoveX;
            dirZ = state.lastMoveZ;
            dirY = 0;
            if (dirX === 0 && dirZ === 0) {
              dirX = -Math.sin(player.yaw) * cp;
              dirZ = -Math.cos(player.yaw) * cp;
            }
          }
          // Normalise defensively so DASH_DIST is the true path length in both branches.
          const dirLen = Math.hypot(dirX, dirY, dirZ) || 1;
          state.dashDirX = dirX / dirLen;
          state.dashDirY = dirY / dirLen;
          state.dashDirZ = dirZ / dirLen;
          state.dashRemainingDist = DASH_DIST;
          state.dashActiveUntil = nowC + DASH_DURATION_MS;
          state.dashIsJet = jetting;
          if (jetting) playJetBurstSound();
          else playDashSound();
          state.dashCooldownEnd = nowC + 350;
          // Flight is free of stamina by design — the harness is limited by its own 10 s
          // window plus JET_COOLDOWN_MS, not by the ground-mobility budget.
          if (!jetting) {
            state.stamina = Math.max(0, state.stamina - STAMINA_DASH_COST);
            state.staminaRegenAt = nowC + STAMINA_REGEN_DELAY_MS;
          }
          state.camShake = Math.max(state.camShake, jetting ? 0.1 : 0.06);
          e.preventDefault();
        }
      }
      if (isAction(e, "questHud")) toggleQuestHud();
      if (isAction(e, "speedNeedle") && started && !paused && gameWorldReady && menuEl.style.display === "none" && !chatOpen && !settingsModalOpen) {
        e.preventDefault();
        activateSpeedNeedle();
      }
      if (isAction(e, "jetHarness") && started && !paused && gameWorldReady && menuEl.style.display === "none" && !chatOpen && !settingsModalOpen) {
        e.preventDefault();
        if (!e.repeat) activateJetHarness();
      }
      if (isAction(e, "fire")) {
        keys.v = true;
        if (canFireWithoutMouse() && state.weaponIndex !== 4) tryShoot();
        e.preventDefault();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (isAction(e, "moveForward")) keys.w = false;
      if (isAction(e, "moveLeft")) keys.a = false;
      if (isAction(e, "moveBack")) keys.s = false;
      if (isAction(e, "moveRight")) keys.d = false;
      if (isAction(e, "jump")) keys.space = false;
      if (isAction(e, "aim")) keys.shift = false;
      if (isAction(e, "crouch")) keys.crouch = false;
      if (isAction(e, "heal")) {
        keys.f = false;
        if (state.weaponIndex === 4) state.medKitNeedsRelease = false;
      }
      if (isAction(e, "fire")) keys.v = false;
    });

    renderer.domElement.addEventListener("mousedown", (e) => {
      if (!state.locked) {
        if (paused || player.health <= 0) return;
        if (gameSettings.skipClickToPlay && gameWorldReady && e.button === 0) {
          state.mouseDown = true;
          if (state.weaponIndex !== 4) tryShoot();
          tryAutoCapturePointer();
          return;
        }
        renderer.domElement.requestPointerLock();
        return;
      }
      if (player.health <= 0 || paused) return;
      if (e.button === 0) {
        state.mouseDown = true;
        if (state.weaponIndex !== 4) tryShoot();
      }
    });

    renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());

    document.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        state.mouseDown = false;
        if (state.weaponIndex === 4) state.medKitNeedsRelease = false;
      }
    });

    document.addEventListener("mousedown", (e) => {
      if (!gameWorldReady || !controlsInputReady() || player.health <= 0) return;
      if (e.button === 2) {
        if (state.weaponIndex !== 4 && !state.reloading) state.ads = true;
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        state.ads = false;
      }
    });

    renderer.domElement.addEventListener("click", () => {
      if (!gameWorldReady) return;
      if (gameSettings.skipClickToPlay) return;
      if (!state.locked && !paused && player.health > 0) renderer.domElement.requestPointerLock();
    });

    /** Release every held input on pause / pointer-lock drop / window blur. */
    function releaseAllInput() {
      keys.w = false;
      keys.a = false;
      keys.s = false;
      keys.d = false;
      keys.space = false;
      keys.shift = false;
      keys.f = false;
      keys.crouch = false;
      state.mouseDown = false;
      state.ads = false;
    }

    document.addEventListener("pointerlockchange", () => {
      state.locked = document.pointerLockElement === renderer.domElement;
      if (!state.locked) {
        _freeLookHasLast = false;
        if (!gameSettings.skipClickToPlay) {
          releaseAllInput();
          if (started && player.health > 0 && menuEl.style.display === "none" && !chatOpen && !settingsModalOpen && gameWorldReady) {
            showPause();
          }
        }
      } else {
        hidePause();
        bumpRendererLayoutSync(90);
      }
      updateClickHintVisibility();
    });

    window.addEventListener("blur", () => {
      releaseAllInput();
    });

    function applyFreeLookMouseDelta(dx, dy) {
      if (!gameSettings.skipClickToPlay || state.locked || !gameWorldReady) return;
      if (paused || player.health <= 0) return;
      if (dx === 0 && dy === 0) return;
      const rpc = radiansPerMouseCount(isAdsLookSensitivityActive());
      const dYaw = -dx * rpc * 0.28;
      const dPitch = -dy * rpc * 0.28;
      player.yaw += dYaw;
      player.pitch += dPitch;
      consumeRecoilCompensation(dPitch, dYaw);
      const limit = Math.PI / 2 - 0.01;
      player.pitch = Math.max(-limit, Math.min(limit, player.pitch));
    }

    function handleSkipClickFreeLook(e) {
      if (!gameSettings.skipClickToPlay || state.locked || !gameWorldReady) return;
      if (paused || player.health <= 0) return;
      if (!_freeLookHasLast) {
        _freeLookLastX = e.clientX;
        _freeLookLastY = e.clientY;
        _freeLookHasLast = true;
        return;
      }
      const dx = e.clientX - _freeLookLastX;
      const dy = e.clientY - _freeLookLastY;
      _freeLookLastX = e.clientX;
      _freeLookLastY = e.clientY;
      applyFreeLookMouseDelta(dx, dy);
    }

    document.addEventListener("mousemove", handleSkipClickFreeLook);
    renderer.domElement.addEventListener("mousemove", handleSkipClickFreeLook);

    document.addEventListener("mousemove", (e) => {
      if (!controlsInputReady() || paused || player.health <= 0) return;
      if (!state.locked) return;

      const rpc = radiansPerMouseCount(isAdsLookSensitivityActive());
      const dYaw = -e.movementX * rpc;
      const dPitch = -e.movementY * rpc;
      player.yaw += dYaw;
      player.pitch += dPitch;
      consumeRecoilCompensation(dPitch, dYaw);

      const limit = Math.PI / 2 - 0.01;
      player.pitch = Math.max(-limit, Math.min(limit, player.pitch));
    });

    /** Shared per-map spawn reset: player position/yaw + floor/ceiling visibility for the current map. */
    function positionPlayerForCurrentMap() {
      if (isPvpCrossfireMap(CURRENT_MAP)) {
        const sp = pickPvpSpawn(CURRENT_MAP);
        player.position.set(sp.x, 1.65, sp.z);
        player.yaw = Math.random() * Math.PI * 2;
        floor.visible = true;
        ceiling.visible = CURRENT_MAP === "crossfire";
      } else if (isBossArenaMap(CURRENT_MAP)) {
        player.position.set(0, 1.65, 40);
        player.yaw = Math.PI;
        floor.visible = false;
        ceiling.visible = false;
      } else if (isGauntletMap(CURRENT_MAP)) {
        const cp = gauntletCourse && gauntletCourse.checkpoints[0];
        player.position.set(cp ? cp.x : 0, cp ? cp.y : 1.65, cp ? cp.z : 0);
        player.yaw = 0;   // yaw 0 looks down -Z, which is the way the course runs
        floor.visible = false;
        ceiling.visible = false;
      } else if (isTrainingMap(CURRENT_MAP)) {
        // yaw 0 looks down -Z, which is where the whole range lives. This used to be
        // Math.PI, i.e. facing the wall behind the firing line with every target at your
        // back — you had to spin 180° on every spawn.
        player.position.set(0, 1.65, 22);
        player.yaw = 0;
        floor.visible = true;
        ceiling.visible = false;
      } else {
        floor.visible = false;
        ceiling.visible = false;
      }
    }

    /* ==== PART 2 STARTS HERE ==== */
    function rebuildMapAndEnemies() {
      clearMap();
      positionPlayerForCurrentMap();
      MAP_BUILDERS[CURRENT_MAP]();
      applySceneFogAndCameraFar();
      if (isArenaLikeMap(CURRENT_MAP)) {
        applyArenaMazePlayerSpawn();
      }
      buildNavGrid();
      rebuildEnemyRoster();
      player.velocityY = 0;
      player.onGround = true;
      camera.position.copy(player.position);
      compileSceneShaders();
    }

    const _enemyWallSphere = new THREE.Sphere();

    function enemyCollidesWall(nextX, nextZ, radius = 0.34) {
      _enemyWallSphere.center.set(nextX, 1.0, nextZ);
      _enemyWallSphere.radius = radius;
      let hit = false;
      forEachNearbyWallBox(nextX, nextZ, (box) => {
        if (!hit && box.intersectsSphere(_enemyWallSphere)) hit = true;
      });
      return hit;
    }

    /** Prefer high-degree maze cells (actual grid), then near chunk center, until collision-free. */
    function pickOpenMazeSpawnInChunk(cx, cz) {
      const { vert, horiz } = getMazeChunkGrid(cx, cz);
      const ox = cx * MAZE_CHUNK_WORLD;
      const oz = cz * MAZE_CHUNK_WORLD;
      const cw = MAZE_CELL_SIZE;
      const n = MAZE_CELLS;
      const mx = ox + MAZE_CHUNK_WORLD * 0.5;
      const mz = oz + MAZE_CHUNK_WORLD * 0.5;

      function cellDegree(gx, gy) {
        let d = 0;
        if (!horiz[gx][gy]) d++;
        if (!horiz[gx][gy + 1]) d++;
        if (!vert[gx][gy]) d++;
        if (!vert[gx + 1][gy]) d++;
        return d;
      }

      const list = [];
      for (let gy = 0; gy < n; gy++) {
        for (let gx = 0; gx < n; gx++) {
          const px = ox + (gx + 0.5) * cw;
          const pz = oz + (gy + 0.5) * cw;
          list.push({
            px,
            pz,
            d2: (px - mx) ** 2 + (pz - mz) ** 2,
            deg: cellDegree(gx, gy),
          });
        }
      }
      list.sort((a, b) => {
        if (b.deg !== a.deg) return b.deg - a.deg;
        return a.d2 - b.d2;
      });
      const r = player.radius;
      for (const c of list) {
        if (!arenaXZClearForSpawn(c.px, c.pz, r)) continue;
        return { x: c.px, z: c.pz };
      }
      return { x: mx, z: mz };
    }

    function applyArenaMazePlayerSpawn() {
      const s = pickOpenMazeSpawnInChunk(0, 0);
      player.position.set(s.x, 1.65, s.z);
    }

    /**
     * Exact roster composition rather than a repeating pattern. The old
     * `ZOMBIE_TYPES[i % len]` cycled a fixed list, so the mix AND the order were identical
     * every run — and since spawn placement is now sector round-robin, a fixed order meant
     * the tanks landed in the same relative sectors every time. Fixed counts + a shuffle
     * keeps the balance exact while randomising where each type ends up.
     */
    const ZOMBIE_MIX = { normal: 0.50, fast: 0.25, gunner: 0.18, tank: 0.07 };
    function buildZombieComposition(count) {
      const out = [];
      for (const [type, share] of Object.entries(ZOMBIE_MIX)) {
        for (let i = 0; i < Math.round(count * share); i++) out.push(type);
      }
      while (out.length < count) out.push("normal");
      out.length = count;
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    }
    /** Respawn delay with jitter — a wiped-out wave used to come back in perfect lockstep. */
    function zombieRespawnDelay() {
      return 3.0 + Math.random() * 3.5;
    }
    /** Gunner (ranged): seconds of clear line-of-sight to target before firing is allowed. Resets when LOS breaks. */
    const RANGED_LOS_ACQUIRE_DELAY = 0.62;
    /**
     * Gunner kite thresholds (XZ distance to player). When the player closes
     * inside GUNNER_KITE_TRIGGER_DIST, the gunner starts slowly backing away
     * while still firing (uses the existing ranged-attack path). Hysteresis:
     * the gunner keeps kiting until the player is GUNNER_KITE_RELEASE_DIST
     * away, so it doesn't jitter at the boundary.
     */
    const GUNNER_KITE_TRIGGER_DIST = 6.0;
    const GUNNER_KITE_RELEASE_DIST = 9.0;
    const GUNNER_KITE_SPEED        = 0.85; // slower than the gunner's normal 1.10 — "slowly"
    const GUNNER_KITE_STRAFE_MIX   = 0.15; // perpendicular strafe blend (avoids backing into walls)

    function rebuildEnemyRoster() {
      for (const enemy of state.enemies) {
        scene.remove(enemy.group);
      }
      state.enemies.length = 0;

      if (isTrainingMap(CURRENT_MAP)) {
        rebuildTrainingDummies();
        return;
      }

      if (isGauntletMap(CURRENT_MAP)) {
        const spec = gauntletCourse ? gauntletCourse.spec : null;
        if (!spec) return;
        const spots = gauntletCourse.spots.slice();
        const n = Math.min(spec.z || 0, spots.length);
        const composition = buildZombieComposition(n);
        for (let i = 0; i < n; i++) {
          const sp = spots.splice(Math.floor(Math.random() * spots.length), 1)[0];
          const zomb = makeZombie(sp.x, sp.z, composition[i]);
          // Zombie Y is driven from baseY every frame (baseY + walk bob), so writing
          // group.position.y here would be overwritten on the next tick.
          zomb.baseY = sp.y;
          zomb.group.position.y = sp.y;
          zomb.netIndex = i;
          drawEnemyHp(zomb);
          state.enemies.push(zomb);
        }
        if (spec.boss && gauntletCourse.bossSpot) {
          const bs = gauntletCourse.bossSpot;
          // The boss pins itself to the BOSS_BASE_Y constant every frame, so its room is
          // always authored at ground level (see the level table) and no Y fixup is needed.
          const boss = makeHormoneZombie(bs.x, bs.z, !!spec.hell);
          boss.netIndex = state.enemies.length;
          drawEnemyHp(boss);
          state.enemies.push(boss);
        }
        return;
      }

      _spawnRng = MULTIPLAYER && ARENA_COOP && activeRoomId
        ? mulberry32(hashRoomSeed(activeRoomId))
        : null;

      if (CURRENT_MAP === "boss_arena") {
        for (let i = 0; i < BOSS_FIGHT_COUNT; i++) {
          const { x, z } = findSpawnPosition(SPAWN_MIN_DIST_BASE);
          const boss = makeHormoneZombie(x, z, BOSS_HELL_MODE);
          boss.netIndex = i;
          drawEnemyHp(boss);
          state.enemies.push(boss);
        }
        _spawnRng = null;
        return;
      }

      const composition = buildZombieComposition(ZOMBIE_COUNT);
      for (let i = 0; i < ZOMBIE_COUNT; i++) {
        const { x, z } = findSpawnPosition(SPAWN_MIN_DIST_BASE);
        const type = composition[i];
        const zombie = makeZombie(x, z, type);
        zombie.netIndex = i;
        drawEnemyHp(zombie);
        state.enemies.push(zombie);
      }
      _spawnRng = null;
    }

    function getWeaponDirection(totalSpread) {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

      dir.add(right.multiplyScalar((Math.random() - 0.5) * totalSpread));
      dir.add(up.multiplyScalar((Math.random() - 0.5) * totalSpread));
      dir.normalize();

      return dir;
    }

    const _invEnemyMat = new THREE.Matrix4();
    const _ehLo = new THREE.Vector3();
    const _ehLd = new THREE.Vector3();
    const _ehHitWorld = new THREE.Vector3();

    function raySphereParam(O, D, cx, cy, cz, r) {
      const Lx = O.x - cx;
      const Ly = O.y - cy;
      const Lz = O.z - cz;
      const a = D.x * D.x + D.y * D.y + D.z * D.z;
      const b = 2 * (Lx * D.x + Ly * D.y + Lz * D.z);
      const c = Lx * Lx + Ly * Ly + Lz * Lz - r * r;
      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;
      const s = Math.sqrt(disc);
      const inv2a = 1 / (2 * a);
      const t1 = (-b - s) * inv2a;
      const t2 = (-b + s) * inv2a;
      const eps = 1e-4;
      if (c < 0) {
        if (t2 >= eps) return t2;
        return 0;
      }
      let best = null;
      if (t1 >= eps) best = t1;
      if (t2 >= eps && (best === null || t2 < best)) best = t2;
      return best;
    }

    function getVerticalWallDist(ray) {
      const hits = ray.intersectObjects(wallMeshes, false);
      for (let i = 0; i < hits.length; i++) {
        const h = hits[i];
        if (h.face && h.object) {
          _ehLd.copy(h.face.normal).transformDirection(h.object.matrixWorld).normalize();
          if (Math.abs(_ehLd.y) > 0.65) continue;
        }
        return h.distance;
      }
      return Infinity;
    }

    function performDevGunPierce(ray, muzzleStart, w) {
      const wallDist = getVerticalWallDist(ray);
      const pierceHits = [];
      for (const enemy of state.enemies) {
        if (!enemyBlockingHits(enemy)) continue;
        enemy.group.updateMatrixWorld(true);
        // enemyHitAlongRay already forwards isBoss, so it covers training targets too —
        // the old dummy-only branch always used the man-sized hitbox, which would miss most
        // of the (much larger) boss target now standing at the back of the range.
        const hit = enemyHitAlongRay(ray, enemy);
        if (hit && hit.t < wallDist) {
          pierceHits.push({ enemy, t: hit.t, zone: hit.zone });
        }
      }
      pierceHits.sort((a, b) => a.t - b.t);
      let trailEnd = null;
      const coopArena = MULTIPLAYER && ARENA_COOP &&
        (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP));
      for (const ph of pierceHits) {
        const bp = _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, ph.t);
        createBlood(bp);
        triggerHitFeedback(false, ph.zone === "head");
        applyDamage(ph.enemy, ph.zone, w);
        // v33: dev-gun pierce in co-op also reports to host so HP actually decreases.
        if (coopArena && !ZOMBIE_AUTHORITY) {
          const ei = ph.enemy.netIndex ?? state.enemies.indexOf(ph.enemy);
          socket.emit("zombieDamaged", { ei, zone: ph.zone, weaponIndex: state.weaponIndex });
        }
        if (ph.enemy.hp <= 0 && ph.enemy.alive) {
          ph.enemy.alive = false;
          ph.enemy.respawnTimer = zombieRespawnDelay();
          ph.enemy.dissolveTimer = DISSOLVE_DURATION + 0.12;
          spawnHumanoidDissolve(ph.enemy.group, bp);
          ph.enemy.group.visible = false;
          state.score += 1;
          registerEnemyKill(ph.enemy);
          triggerHitFeedback(true, ph.zone === "head");
          createSparks(bp.clone(), 0xff5555);
          if (ph.enemy.isBoss) checkAllBossesDead(ph.enemy.group.position.clone());
        }
        trailEnd = bp;
      }
      if (pierceHits.length === 0) {
        const wallHits = ray.intersectObjects(wallMeshes, false);
        let wallHit = null;
        for (let i = 0; i < wallHits.length; i++) {
          const h = wallHits[i];
          if (h.face && h.object) {
            _ehLd.copy(h.face.normal).transformDirection(h.object.matrixWorld).normalize();
            if (Math.abs(_ehLd.y) > 0.65) continue;
          }
          wallHit = h;
          break;
        }
        if (wallHit) {
          trailEnd = wallHit.point;
          createSparks(wallHit.point.clone(), 0xffdd88);
        } else {
          trailEnd = _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 80);
        }
      }
      if (trailEnd) createBulletTrail(muzzleStart, trailEnd, w.color);
    }

    function enemyBlockingHits(enemy) {
      if (!enemy) return false;
      if (!enemy.alive) return false;
      if ((enemy.dissolveTimer || 0) > 0) return false;
      return true;
    }

    /**
     * Ray vs axis-aligned box in local space. Returns the near hit distance along the ray,
     * or 0 if the origin is already inside, or null on a miss.
     */
    function rayBoxParam(ox, oy, oz, dx, dy, dz, b, pad) {
      // Expand about the centre so `pad` behaves the same way it did for spheres.
      const cx = (b.x0 + b.x1) * 0.5, cy = (b.y0 + b.y1) * 0.5, cz = (b.z0 + b.z1) * 0.5;
      const hx = (b.x1 - b.x0) * 0.5 * pad, hy = (b.y1 - b.y0) * 0.5 * pad, hz = (b.z1 - b.z0) * 0.5 * pad;
      let tmin = -Infinity, tmax = Infinity;
      const axes = [[ox, dx, cx, hx], [oy, dy, cy, hy], [oz, dz, cz, hz]];
      for (let i = 0; i < 3; i++) {
        const o = axes[i][0], d = axes[i][1], c = axes[i][2], h = axes[i][3];
        if (Math.abs(d) < 1e-9) {
          if (o < c - h || o > c + h) return null;
          continue;
        }
        let t0 = (c - h - o) / d, t1 = (c + h - o) / d;
        if (t0 > t1) { const t = t0; t0 = t1; t1 = t; }
        if (t0 > tmin) tmin = t0;
        if (t1 < tmax) tmax = t1;
        if (tmin > tmax) return null;
      }
      if (tmax < 0) return null;
      return tmin < 0 ? 0 : tmin;
    }

    /**
     * Hormone Zombie hit zones, as boxes matched to the actual mesh extents in root space.
     *
     * These used to be spheres, and they were wildly oversized: the head sphere sat at
     * cz 0.55 with r 0.45, so it reached z 1.00 while the skull ends at 0.71 — half a metre
     * of empty air in front of the face registered as a HEADSHOT. The body sphere was r 0.90
     * (the chest is 0.65 deep) centred at cz 0.10, so it reached z -0.80 while the back ends
     * at -0.40 — shots well BEHIND the boss registered as body hits. Both errors are then
     * multiplied by the boss scale (2.0, or 2.6 for the hell boss).
     *
     * Boxes fit a box-built model exactly, so they simply do not have this failure mode.
     * Extents below are read off the mesh positions in makeHormoneZombie().
     */
    /**
     * Boss hit volumes, one list per RIG GROUP, each box in that group's OWN local space.
     *
     * Two earlier attempts failed the same way: pin the boxes to one space, then inflate
     * them to cover parts that actually move in a different one. Inflated boxes ARE the
     * "shoot the air, still deal damage" bug. The legs carried z −0.55..0.55 (1.10 deep) to
     * cover their swing while a real leg is ~0.44 deep — about 0.66 WORLD units of empty air
     * in front of and behind each leg still scored a leg hit. The arms had the same slack.
     *
     * Testing each part in its own group lets the box hug the meshes AND follow the
     * animation exactly, because the group *is* the animation.
     */
    const BOSS_PART_BOXES = [
      ["torsoRoot", [
        // headGroup (0, 1.96, 0.50) rot.x 0.25; skull 0.42×0.46×0.42 plus brow / nose / ears.
        // The floor sits just above the skull bottom, not at the jaw: the head hangs forward
        // over the chest, so a jaw-height box intercepts level shots aimed at the middle of
        // the chest and turns them into headshots.
        { x0: -0.30, x1: 0.30, y0: 1.74, y1: 2.24, z0: 0.24, z1: 0.78, zone: "head" },
        // Chest and back are two offset slabs, not one block: the chest sits forward
        // (z −0.18..0.62) and the back + traps sit behind and higher (z −0.46..0.24).
        // A single box spanning both leaves the corner in front of the traps, and the
        // corner behind the lower chest, as air that still counted as a body hit.
        { x0: -0.66, x1: 0.66, y0: 1.18, y1: 1.92, z0: -0.20, z1: 0.62, zone: "body" },  // chest + pecs
        { x0: -0.62, x1: 0.62, y0: 1.50, y1: 2.22, z0: -0.46, z1: 0.24, zone: "body" },  // back + traps + neck
        { x0: -0.42, x1: 0.42, y0: 0.60, y1: 1.24, z0: -0.24, z1: 0.24, zone: "body" },
      ]],
      ["leftArmRoot",      [{ x0: -0.27, x1: 0.27, y0: -0.64, y1: 0.14, z0: -0.30, z1: 0.30, zone: "body" }]],
      ["rightArmRoot",     [{ x0: -0.27, x1: 0.27, y0: -0.64, y1: 0.14, z0: -0.30, z1: 0.30, zone: "body" }]],
      ["leftForearmRoot",  [{ x0: -0.23, x1: 0.23, y0: -0.80, y1: 0.13, z0: -0.20, z1: 0.28, zone: "body" }]],
      ["rightForearmRoot", [{ x0: -0.23, x1: 0.23, y0: -0.80, y1: 0.13, z0: -0.20, z1: 0.28, zone: "body" }]],
      ["leftLegRoot",      [{ x0: -0.19, x1: 0.19, y0: -0.50, y1: 0.04, z0: -0.19, z1: 0.28, zone: "leg" }]],
      ["rightLegRoot",     [{ x0: -0.19, x1: 0.19, y0: -0.50, y1: 0.04, z0: -0.19, z1: 0.28, zone: "leg" }]],
      ["leftShinRoot",     [{ x0: -0.17, x1: 0.17, y0: -0.56, y1: 0.10, z0: -0.24, z1: 0.26, zone: "leg" }]],
      ["rightShinRoot",    [{ x0: -0.17, x1: 0.17, y0: -0.56, y1: 0.10, z0: -0.24, z1: 0.26, zone: "leg" }]],
    ];

    /**
     * Boss ray test. Every rig group inherits the same uniform scale from the root, so a
     * local t is directly comparable across groups; only the winner is converted to world.
     */
    function bossHitAlongRay(raycaster, enemy, pad = 1) {
      let bestT = Infinity, bestZone = null, bestGroup = null;
      for (let pi = 0; pi < BOSS_PART_BOXES.length; pi++) {
        const g = enemy[BOSS_PART_BOXES[pi][0]];
        if (!g) continue;
        g.updateMatrixWorld(true);
        _invEnemyMat.copy(g.matrixWorld).invert();
        _ehLo.copy(raycaster.ray.origin).applyMatrix4(_invEnemyMat);
        _ehLd.copy(raycaster.ray.direction).transformDirection(_invEnemyMat).normalize();
        const boxes = BOSS_PART_BOXES[pi][1];
        for (let bi = 0; bi < boxes.length; bi++) {
          const t = rayBoxParam(_ehLo.x, _ehLo.y, _ehLo.z, _ehLd.x, _ehLd.y, _ehLd.z, boxes[bi], pad);
          if (t !== null && t < bestT) { bestT = t; bestZone = boxes[bi].zone; bestGroup = g; }
        }
      }
      if (bestZone === null) return null;
      _invEnemyMat.copy(bestGroup.matrixWorld).invert();
      _ehLo.copy(raycaster.ray.origin).applyMatrix4(_invEnemyMat);
      _ehLd.copy(raycaster.ray.direction).transformDirection(_invEnemyMat).normalize();
      _ehHitWorld.copy(_ehLd).multiplyScalar(bestT).add(_ehLo).applyMatrix4(bestGroup.matrixWorld);
      const wT = _ehHitWorld.distanceTo(raycaster.ray.origin);
      const mT = (typeof raycaster.far === "number" && raycaster.far > 0) ? raycaster.far : Infinity;
      if (wT < -0.02 || wT > mT + 0.04) return null;
      return { t: wT, zone: bestZone, point: _ehHitWorld.clone() };
    }

    /** Head / torso / leg spheres in humanoid root space (zombies + remote PvP avatars). */
    function humanoidHitAlongRay(raycaster, rootGroup, isBossEnemy, pad = 1) {
      rootGroup.updateMatrixWorld(true);
      _invEnemyMat.copy(rootGroup.matrixWorld).invert();
      _ehLo.copy(raycaster.ray.origin).applyMatrix4(_invEnemyMat);
      _ehLd.copy(raycaster.ray.direction).transformDirection(_invEnemyMat).normalize();
      let bestLocalT = Infinity;
      let zone = null;
      {
        const volumes = [
          { cx: 0, cy: 1.82, cz: 0, r: 0.3, zone: "head" },
          { cx: 0, cy: 1.12, cz: 0, r: 0.52, zone: "body" },
          { cx: 0, cy: 0.42, cz: 0, r: 0.46, zone: "leg" },
        ];
        for (let vi = 0; vi < volumes.length; vi++) {
          const v = volumes[vi];
          const t = raySphereParam(_ehLo, _ehLd, v.cx, v.cy, v.cz, v.r * pad);
          if (t !== null && t < bestLocalT) {
            bestLocalT = t;
            zone = v.zone;
          }
        }
      }
      if (bestLocalT === Infinity || zone === null) return null;
      _ehHitWorld.copy(_ehLd).multiplyScalar(bestLocalT).add(_ehLo);
      _ehHitWorld.applyMatrix4(rootGroup.matrixWorld);
      const worldT = _ehHitWorld.distanceTo(raycaster.ray.origin);
      const maxT =
        typeof raycaster.far === "number" && raycaster.far > 0
          ? raycaster.far
          : Infinity;
      if (worldT < -0.02 || worldT > maxT + 0.04) return null;
      return { t: worldT, zone, point: _ehHitWorld.clone() };
    }

    /** Hit volumes are fixed in zombie root space so torso sway does not move hitboxes. */
    function enemyHitAlongRay(raycaster, enemy) {
      if (enemy.isBoss) return bossHitAlongRay(raycaster, enemy, 1);
      return humanoidHitAlongRay(raycaster, enemy.group, false, 1);
    }

    function applyDamage(enemy, zone, w) {
      if (zone === "head") enemy.hp -= w.damageHead;
      else if (zone === "leg") enemy.hp -= w.damageLegs;
      else enemy.hp -= w.damageBody;
      drawEnemyHp(enemy);
      // Aggro on hit: being damaged always alerts the enemy (bosses are already always-
      // aware, but for regular zombies a long-range sniper shot should pull them off
      // patrol). Store the bullet direction (player → enemy) so awareness logic can
      // look that way; if the player becomes visible from that direction, the zombie
      // targets the player.
      const ex = enemy.group.position.x;
      const ez = enemy.group.position.z;
      const dx = ex - player.position.x;
      const dz = ez - player.position.z;
      const dlen = Math.sqrt(dx * dx + dz * dz);
      if (dlen > 0.01) {
        enemy.lastHitDirX = dx / dlen;
        enemy.lastHitDirZ = dz / dlen;
        enemy.lastHitTime = performance.now();
      }
      enemy.aware = true;
      enemy.hiddenTimer = 0;
    }

    const SLOW_TEXT_EL = document.getElementById("blindText");
    const _projWorkVecA = new THREE.Vector3();
    const _projWorkVecB = new THREE.Vector3();
    const _projWorkVecC = new THREE.Vector3();
    const DART_SLOW_ADS_MULT = 0.045;
    const DART_SLOW_RELOAD_MULT = 14.0;

    function isPlayerSlowed() {
      return performance.now() < state.slowUntil;
    }

    function getDartSlowAdsMult() {
      return isPlayerSlowed() ? DART_SLOW_ADS_MULT : 1;
    }

    function getDartSlowReloadMult() {
      return isPlayerSlowed() ? DART_SLOW_RELOAD_MULT : 1;
    }

    // ── Speed Needle logic ─────────────────────────────────────────────────
    function activateSpeedNeedle() {
      if (!gameWorldReady || !menuEl || menuEl.style.display !== 'none') return;
      if (player.health <= 0) return;
      const nd = state.speedNeedle;
      if (nd.phase === 'injecting') return;
      if (nd.phase === 'boost')  { showCombatFeedback(tr("needleAlreadyActive","SPEED ACTIVE"), '#22ff88', 0.4); return; }
      if (nd.phase === 'weak')   { showCombatFeedback(tr("needleAlreadyWeak","SPEED WEAK"), '#ff9922', 0.4); return; }
      if (nd.charges <= 0)       { showCombatFeedback(tr("needleNoCharge","NO CHARGES"), '#ff4422', 0.4); return; }
      nd.charges--;
      nd.phase = 'injecting';
      nd.animStart = performance.now();
      // reset plunger to pulled-back position
      if (needleRoot && needleRoot.userData.animPlunger) {
        needleRoot.userData.animPlunger.position.z = 0.125;
      }
      _playNeedleInjectSound();
    }

    function updateSpeedNeedle(dt) {
      const nd = state.speedNeedle;
      const now = performance.now();
      if (nd.phase === 'injecting') {
        const elapsed = now - nd.animStart;
        const t = Math.min(elapsed / NEEDLE_INJECT_DUR_MS, 1.0);
        // ─ animate syringe in camera space ─
        if (needleRoot) {
          needleRoot.visible = true;
          const syr = needleRoot.userData.gun;
          const bp  = needleRoot.userData.basePos;
          const pl  = needleRoot.userData.animPlunger;
          if (syr && bp) {
            const br = needleRoot.userData.baseRot;
            if (br) syr.rotation.copy(br);
            if (t < 0.22) {
              const su = THREE.MathUtils.smoothstep(t / 0.22, 0, 1);
              syr.position.x = THREE.MathUtils.lerp(bp.x + 0.26, bp.x + 0.02, su);
              syr.position.y = THREE.MathUtils.lerp(bp.y - 0.24, bp.y + 0.03, su);
              syr.position.z = THREE.MathUtils.lerp(bp.z + 0.10, bp.z - 0.04, su);
              syr.rotation.z += THREE.MathUtils.lerp(0.42, -0.08, su);
              syr.rotation.x += THREE.MathUtils.lerp(0.22, -0.05, su);
            } else if (t < 0.42) {
              const su = THREE.MathUtils.smoothstep((t - 0.22) / 0.20, 0, 1);
              syr.position.x = THREE.MathUtils.lerp(bp.x + 0.02, bp.x - 0.03, su);
              syr.position.y = THREE.MathUtils.lerp(bp.y + 0.03, bp.y + 0.01, su);
              syr.position.z = THREE.MathUtils.lerp(bp.z - 0.04, bp.z - 0.10, su);
              syr.rotation.x -= 0.10 * su;
              syr.rotation.z -= 0.08 * su;
            } else if (t < 0.74) {
              const su = THREE.MathUtils.smoothstep((t - 0.42) / 0.32, 0, 1);
              syr.position.set(bp.x - 0.03, bp.y + 0.01 - 0.015 * Math.sin(su * Math.PI), bp.z - 0.10);
              syr.rotation.x -= 0.10;
              syr.rotation.z -= 0.08;
              if (pl) pl.position.z = THREE.MathUtils.lerp(0.125, -0.018, su);
            } else {
              const su = THREE.MathUtils.smoothstep((t - 0.74) / 0.26, 0, 1);
              syr.position.x = THREE.MathUtils.lerp(bp.x - 0.03, bp.x + 0.24, su);
              syr.position.y = THREE.MathUtils.lerp(bp.y + 0.01, bp.y - 0.22, su);
              syr.position.z = THREE.MathUtils.lerp(bp.z - 0.10, bp.z + 0.06, su);
              syr.rotation.z += THREE.MathUtils.lerp(-0.08, 0.45, su);
            }
          }
        }
        if (elapsed >= NEEDLE_INJECT_DUR_MS) {
          nd.phase = 'boost';
          nd.timer = NEEDLE_BOOST_MS;
          if (needleRoot) needleRoot.visible = false;
          showCombatFeedback('⚡ ' + tr("needleBoostStart","SPEED ×2  5s"), '#22ff88', 1.8);
          _playNeedleBoostSound();
        }
      } else if (nd.phase === 'boost') {
        nd.timer -= dt * 1000;
        if (nd.timer <= 0) {
          nd.phase = 'weak';
          nd.timer = NEEDLE_WEAK_MS;
          showCombatFeedback(tr("needleWeakStart","SPEED WEAK..."), '#ff9922', 1.8);
        }
      } else if (nd.phase === 'weak') {
        nd.timer -= dt * 1000;
        if (nd.timer <= 0) {
          nd.phase = 'idle';
          nd.timer = 0;
          nd.charges = 1;
          showCombatFeedback(tr("needleReady","NEEDLE READY"), '#88aaff', 1.0);
        }
      }
      updateNeedleHud();
    }

    function updateNeedleHud() {
      const el = _needleHudEl || (_needleHudEl = document.getElementById('needleHud'));
      if (!el) return;
      const inGame = gameWorldReady && menuEl && menuEl.style.display === 'none';
      if (!inGame) { el.style.display = 'none'; return; }
      el.style.display = 'flex';
      const nd = state.speedNeedle;
      let cls = "";
      let label = "";
      let width = "";
      if (nd.phase === 'idle') {
        label = 'Q · ' + tr("needleName","Speed Needle") + (nd.charges > 0 ? ' ×' + nd.charges : ' — ' + tr("needleExhausted","Empty"));
        width = nd.charges > 0 ? '100%' : '0%';
      } else if (nd.phase === 'injecting') {
        cls = 'nh-inject';
        label = tr("needleInjecting","Injecting...");
        const t = Math.min((performance.now() - nd.animStart) / NEEDLE_INJECT_DUR_MS, 1);
        width = (t * 100).toFixed(0) + '%';
      } else if (nd.phase === 'boost') {
        cls = 'nh-boost';
        const sec = Math.max(0, nd.timer / 1000).toFixed(1);
        label = '⚡ ' + tr("needleBoost","SPEED ×2") + '  ' + sec + 's';
        width = (nd.timer / NEEDLE_BOOST_MS * 100).toFixed(0) + '%';
      } else if (nd.phase === 'weak') {
        cls = 'nh-weak';
        const sec = Math.max(0, nd.timer / 1000).toFixed(1);
        label = tr("needleWeakLabel","Weak") + '  ' + sec + 's';
        width = (nd.timer / NEEDLE_WEAK_MS * 100).toFixed(0) + '%';
      }
      // Skip the class/label/width writes while nothing changed (idle is static).
      const key = cls + "|" + label + "|" + width;
      if (key === _needleHudKey) return;
      _needleHudKey = key;
      el.className = cls;
      const lbl  = _needleLabelEl || (_needleLabelEl = document.getElementById('needleLabel'));
      const fill = _needleBarFillEl || (_needleBarFillEl = document.getElementById('needleBarFill'));
      if (lbl) lbl.textContent = label;
      if (fill) fill.style.width = width;
    }

    /**
     * Speed-needle inject sound. Five layers, ~420 ms total:
     *   1. Needle crack  (0–10 ms)   — bandpass noise, very narrow Q at 5.5 kHz
     *   2. Pneumatic hiss (5–70 ms)  — bandpass noise, broader, 2.4 kHz center
     *   3. Sub-bass thump (0–80 ms)  — 200→55 Hz sine, fast decay
     *   4. Activation sweep (60–280 ms) — sawtooth 70→420 Hz, lowpass 800 Hz,
     *                                     the "you feel the stim hit" beat
     *   5. Heart-rate hint (180–420 ms) — 1800→2400 Hz sine with a 12 Hz AM
     *                                     pulse, hints at speed coming online
     * The hint layer leads into _playNeedleBoostSound so the boost sound
     * doesn't feel disconnected from the inject.
     */
    function _playNeedleInjectSound() {
      if (!audioCtx || !audioSfx) return;
      const t0 = audioCtx.currentTime;
      // (1) needle crack — narrow high bandpass on white noise, instant attack
      {
        const sr = audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, Math.floor(sr * 0.012), sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
        const ns = audioCtx.createBufferSource(); ns.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 5500; bp.Q.value = 4.5;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.45, t0 + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.010);
        ns.connect(bp); bp.connect(g); g.connect(audioSfx);
        ns.start(t0); ns.stop(t0 + 0.012);
      }
      // (2) pneumatic hiss — broader bandpass, mid-frequency, longer tail
      {
        const sr = audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, Math.floor(sr * 0.085), sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
        const ns = audioCtx.createBufferSource(); ns.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 1.2;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0 + 0.005);
        g.gain.linearRampToValueAtTime(0.32, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.070);
        ns.connect(bp); bp.connect(g); g.connect(audioSfx);
        ns.start(t0 + 0.005); ns.stop(t0 + 0.080);
      }
      // (3) sub-bass thump — chest punch
      {
        const osc = audioCtx.createOscillator(); osc.type = "sine";
        osc.frequency.setValueAtTime(200, t0);
        osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.055);
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.22, t0 + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.080);
        osc.connect(g); g.connect(audioSfx);
        osc.start(t0); osc.stop(t0 + 0.085);
      }
      // (4) activation sweep — sawtooth rising, lowpassed to feel warm
      {
        const osc = audioCtx.createOscillator(); osc.type = "sawtooth";
        osc.frequency.setValueAtTime(70, t0 + 0.060);
        osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.260);
        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(400, t0 + 0.060);
        lp.frequency.exponentialRampToValueAtTime(900, t0 + 0.260);
        lp.Q.value = 1.4;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0 + 0.060);
        g.gain.linearRampToValueAtTime(0.24, t0 + 0.090);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.300);
        osc.connect(lp); lp.connect(g); g.connect(audioSfx);
        osc.start(t0 + 0.060); osc.stop(t0 + 0.310);
      }
      // (5) heart-rate hint — high sine with a 12 Hz AM pulse for a "vibrating"
      // pulse, signaling the stim taking effect before the boost sound lands.
      {
        const osc = audioCtx.createOscillator(); osc.type = "sine";
        osc.frequency.setValueAtTime(1800, t0 + 0.180);
        osc.frequency.exponentialRampToValueAtTime(2400, t0 + 0.420);
        const am = audioCtx.createOscillator(); am.type = "sine";
        am.frequency.value = 12;
        const amDepth = audioCtx.createGain(); amDepth.gain.value = 0.06;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0 + 0.180);
        g.gain.linearRampToValueAtTime(0.10, t0 + 0.200);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.420);
        // AM modulation: am → amDepth → g.gain (adds a small wobble to the
        // perceived amplitude). The base gain envelope still drives the curve.
        am.connect(amDepth); amDepth.connect(g.gain);
        osc.connect(g); g.connect(audioSfx);
        osc.start(t0 + 0.180); osc.stop(t0 + 0.430);
        am.start(t0 + 0.180); am.stop(t0 + 0.430);
      }
    }

    /**
     * Speed-needle boost sound. Fires ~250 ms after the inject sound finishes
     * (the in-game state machine schedules this on the same trigger). Three
     * layers, ~360 ms total:
     *   1. Body sweep — sawtooth 110→620 Hz with a square overtone for warmth
     *   2. Bright ping — sine 1500→1100 Hz, the "speed online" cue
     *   3. Air whoosh — light bandpass noise tail, sells the sudden acceleration
     */
    function _playNeedleBoostSound() {
      if (!audioCtx || !audioSfx) return;
      const t0 = audioCtx.currentTime;
      // (1) body sweep with square overtone
      {
        const osc1 = audioCtx.createOscillator(); osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(110, t0);
        osc1.frequency.exponentialRampToValueAtTime(620, t0 + 0.180);
        const osc2 = audioCtx.createOscillator(); osc2.type = "square";
        osc2.frequency.setValueAtTime(220, t0);
        osc2.frequency.exponentialRampToValueAtTime(1240, t0 + 0.180);
        const sqGain = audioCtx.createGain(); sqGain.gain.value = 0.10;
        const lp = audioCtx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(600, t0);
        lp.frequency.exponentialRampToValueAtTime(2200, t0 + 0.180);
        lp.Q.value = 1.2;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.30, t0 + 0.030);
        g.gain.linearRampToValueAtTime(0.18, t0 + 0.180);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.360);
        osc1.connect(lp); osc2.connect(sqGain); sqGain.connect(lp);
        lp.connect(g); g.connect(audioSfx);
        osc1.start(t0); osc1.stop(t0 + 0.380);
        osc2.start(t0); osc2.stop(t0 + 0.380);
      }
      // (2) bright ping — "speed online" cue
      {
        const osc = audioCtx.createOscillator(); osc.type = "sine";
        osc.frequency.setValueAtTime(1500, t0 + 0.020);
        osc.frequency.exponentialRampToValueAtTime(1100, t0 + 0.220);
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0 + 0.020);
        g.gain.linearRampToValueAtTime(0.14, t0 + 0.040);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.280);
        osc.connect(g); g.connect(audioSfx);
        osc.start(t0 + 0.020); osc.stop(t0 + 0.300);
      }
      // (3) air whoosh — short bandpass noise tail selling the acceleration
      {
        const sr = audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, Math.floor(sr * 0.30), sr);
        const d = buf.getChannelData(0);
        // Brown noise (1/f²) reads as "wind" much better than white noise
        let brown = 0;
        for (let i = 0; i < d.length; i++) {
          const w = (Math.random() * 2 - 1);
          brown = 0.96 * brown + 0.04 * w;
          d[i] = brown * 3.0;
        }
        const ns = audioCtx.createBufferSource(); ns.buffer = buf;
        const bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 1100; bp.Q.value = 0.6;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, t0 + 0.020);
        g.gain.linearRampToValueAtTime(0.10, t0 + 0.050);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.300);
        ns.connect(bp); bp.connect(g); g.connect(audioSfx);
        ns.start(t0 + 0.020); ns.stop(t0 + 0.310);
      }
    }

    console.info("[zone-no-light-v30] loaded — paralysis dart networking (PvP damage===1 marker) + combat knife (slot 7, key '0'). Set window.__fpsDartDebug=true to re-enable dart diagnostic logs.");
    if (typeof window !== "undefined" && window.__fpsDartDebug === undefined) {
      window.__fpsDartDebug = false;
    }
    function startSlowEffect(durationSec) {
      const dur = Math.max(0.5, durationSec || 5.0);
      const end = performance.now() + dur * 1000;
      if (end > state.slowUntil) state.slowUntil = end;
      if (state.reloading) {
        const w = weapon();
        const extra = w.reloadTime * (DART_SLOW_RELOAD_MULT - 1);
        state.reloadEnd = Math.max(state.reloadEnd, performance.now() + extra);
      }
      showCombatFeedback(tr("combatSlowed", "SLOWED"), "#6bd4ff", 0.42);
      if (SLOW_TEXT_EL) {
        SLOW_TEXT_EL.textContent = tr("hudSlowed", "IMMOBILIZED");
        SLOW_TEXT_EL.classList.add("show");
      }
    }

    // ── Jet harness ───────────────────────────────────────────────────────────
    /** True while the harness is on and the flight window has not expired. */
    function isJetActive() {
      return state.jet.phase === "active";
    }

    /** True while strapping in — the player is committed and cannot shoot or dash. */
    function isJetStrapping() {
      return state.jet.phase === "strapping";
    }

    function jetPhaseProgress() {
      const jt = state.jet;
      const span = jt.endMs - jt.startMs;
      if (span <= 0) return 1;
      return THREE.MathUtils.clamp((performance.now() - jt.startMs) / span, 0, 1);
    }

    function activateJetHarness() {
      if (!gameWorldReady || !menuEl || menuEl.style.display !== "none") return;
      if (player.health <= 0 || paused) return;
      const jt = state.jet;
      if (jt.phase === "strapping") return;
      if (jt.phase === "active") {
        showCombatFeedback(tr("jetAlreadyOn", "HARNESS ALREADY ON"), "#66ccff", 0.4);
        return;
      }
      const nowJ = performance.now();
      if (nowJ < (jt.cooldownUntil || 0)) {
        showCombatFeedback(
          tr("jetCooling", "HARNESS COOLING") + " " + Math.ceil((jt.cooldownUntil - nowJ) / 1000) + "s",
          "#ff9422", 0.4);
        return;
      }
      jt.phase = "strapping";
      jt.startMs = performance.now();
      jt.endMs = jt.startMs + JET_STRAP_MS * myVest().actionMul;
      jt.netState = 1;
      // Strapping in means both hands are busy: drop ADS and stop any burst.
      state.ads = false;
      state.mouseDown = false;
      if (jetRoot) jetRoot.visible = true;
      playJetStrapSound();
      showCombatFeedback(tr("jetStrapping", "STRAPPING IN..."), "#88ccff", 0.6);
    }

    /**
     * Drives the strap-on animation and the flight window.
     * Uses performance.now() rather than accumulated dt so the 3 s / 10 s timings hold at
     * any frame rate (animate() clamps dt to 33 ms, which stretches dt-summed timers).
     */
    function updateJetHarness(dt) {
      const jt = state.jet;
      const ud = jetRoot ? jetRoot.userData : null;

      if (jt.phase === "strapping") {
        const p = jetPhaseProgress();
        if (jetRoot && ud) {
          jetRoot.visible = true;
          // 0–0.35 thruster swings in · 0.35–0.78 straps cinch · 0.78–1 hands off, spin-up.
          const swing = THREE.MathUtils.clamp(p / 0.35, 0, 1);
          const cinch = THREE.MathUtils.clamp((p - 0.35) / 0.43, 0, 1);
          const spin = THREE.MathUtils.clamp((p - 0.78) / 0.22, 0, 1);
          const swingE = swing * swing * (3 - 2 * swing);
          const home = ud.thrusterHome;
          ud.thruster.position.set(
            THREE.MathUtils.lerp(home.x + 0.34, home.x, swingE),
            THREE.MathUtils.lerp(home.y - 0.26, home.y, swingE),
            THREE.MathUtils.lerp(home.z + 0.16, home.z, swingE)
          );
          ud.thruster.rotation.set(
            THREE.MathUtils.lerp(0.5, 0, swingE),
            THREE.MathUtils.lerp(-0.9, 0, swingE),
            THREE.MathUtils.lerp(0.7, 0, swingE) + Math.sin(spin * Math.PI * 6) * 0.03 * spin
          );
          // Straps start slack and wide, then snap flat against the chest.
          const slackA = 1 - cinch;
          ud.strapA.rotation.z = 0.34 - 0.2 * cinch;
          ud.strapA.position.z = -0.38 + 0.05 * slackA;
          ud.strapA.scale.set(1 + 0.12 * slackA, 1, 1);
          ud.strapB.rotation.z = -0.28 + 0.16 * cinch;
          ud.strapB.position.z = -0.38 + 0.05 * slackA;
          ud.strapB.scale.set(1 + 0.1 * slackA, 1, 1);
          // Gloves haul the straps in, then drop away.
          const pullL = Math.sin(THREE.MathUtils.clamp(cinch, 0, 1) * Math.PI);
          ud.handL.position.set(-0.20 + 0.09 * pullL, -0.24 + 0.05 * pullL, -0.34 - 0.05 * pullL);
          ud.handR.position.set(0.21 - 0.08 * pullL, -0.20 + 0.04 * pullL, -0.34 - 0.05 * pullL);
          const handFade = 1 - spin;
          ud.handL.visible = handFade > 0.05;
          ud.handR.visible = handFade > 0.05;
          // Nozzles light as it comes online.
          for (const f of ud.flames) f.material.opacity = 0.55 * spin;
        }
        if (p >= 1) {
          jt.phase = "active";
          jt.startMs = performance.now();
          jt.endMs = jt.startMs + JET_ACTIVE_MS;
          jt.netState = 2;
          if (jetRoot) jetRoot.visible = false;
          playJetIgniteSound();
          showCombatFeedback(
            "🜂 " + tr("jetOnline", "JET ONLINE — DASH TO FLY"),
            "#66ccff",
            1.6
          );
        }
        return;
      }

      if (jt.phase === "active") {
        if (performance.now() >= jt.endMs) {
          jt.phase = "idle";
          jt.netState = 0;
          jt.charges = 1;
          jt.cooldownUntil = performance.now() + JET_COOLDOWN_MS;
          if (jetRoot) jetRoot.visible = false;
          showCombatFeedback(tr("jetExpired", "HARNESS BURNED OUT"), "#ff9922", 1.2);
        }
        return;
      }

      // idle
      jt.netState = 0;
      if (jetRoot) jetRoot.visible = false;
    }

    // ── Altitude gauge (right edge, shown while airborne) ─────────────────────
    // Fall damage is invisible without this: you cannot tell from a first-person view how
    // far off the deck you are, so the only feedback was dying. The bar reads the drop you
    // would take if you let go right now, with the lethal band marked in red.
    let _altGaugeEl = null;
    let _altFillEl = null;
    let _altTextEl = null;
    let _altTickEl = null;
    /** Top of the scale — a bit above the lethal line so the red band is visible. */
    const ALT_GAUGE_MAX = 20;

    function buildAltGauge() {
      if (_altGaugeEl) return;
      const wrap = document.createElement("div");
      wrap.id = "jetAltGauge";
      wrap.style.cssText =
        "position:fixed;right:46px;top:50%;transform:translateY(-50%);z-index:44;" +
        "display:none;flex-direction:column;align-items:center;gap:6px;" +
        "pointer-events:none;user-select:none;font-family:var(--game-font-ui);";

      const txt = document.createElement("div");
      txt.style.cssText =
        "font-size:15px;letter-spacing:1px;color:#8de08d;text-shadow:0 1px 4px rgba(0,0,0,0.9);";

      const track = document.createElement("div");
      track.style.cssText =
        "position:relative;width:20px;height:260px;border-radius:10px;overflow:hidden;" +
        "background:linear-gradient(180deg,rgba(12,14,18,0.92),rgba(0,0,0,0.7));" +
        "border:1px solid rgba(255,255,255,0.18);box-shadow:0 2px 10px rgba(0,0,0,0.65);";

      // Lethal band: everything at or above JET_FATAL_FALL_DROP on the scale.
      const danger = document.createElement("div");
      const dangerFrac = 1 - JET_FATAL_FALL_DROP / ALT_GAUGE_MAX;
      danger.style.cssText =
        "position:absolute;left:0;right:0;top:0;height:" + (dangerFrac * 100).toFixed(1) + "%;" +
        "background:repeating-linear-gradient(45deg,rgba(255,40,40,0.30) 0 6px,rgba(255,40,40,0.14) 6px 12px);";
      track.appendChild(danger);

      const tick = document.createElement("div");
      tick.style.cssText =
        "position:absolute;left:0;right:0;top:" + (dangerFrac * 100).toFixed(1) + "%;" +
        "height:2px;background:#ff4040;box-shadow:0 0 6px rgba(255,60,60,0.9);";
      track.appendChild(tick);

      const fill = document.createElement("div");
      fill.style.cssText =
        "position:absolute;left:0;right:0;bottom:0;height:0%;" +
        "background:linear-gradient(180deg,#65ff8f,#17c85b);" +
        "box-shadow:inset 0 1px 0 rgba(255,255,255,0.3);transition:height 0.05s linear;";
      track.appendChild(fill);

      wrap.appendChild(txt);
      wrap.appendChild(track);
      document.body.appendChild(wrap);

      _altGaugeEl = wrap;
      _altFillEl = fill;
      _altTextEl = txt;
      _altTickEl = tick;
    }

    let _stamWrapEl = null, _stamFillEl = null, _stamTextEl = null;
    function buildStaminaHud() {
      if (_stamWrapEl) return;
      const wrap = document.createElement("div");
      wrap.id = "dashStaminaHud";
      wrap.style.cssText =
        "position:fixed;left:50%;bottom:205px;transform:translateX(-50%);z-index:43;" +
        "display:none;flex-direction:column;align-items:center;gap:4px;" +
        "pointer-events:none;user-select:none;font-family:var(--game-font-ui);";
      const txt = document.createElement("div");
      txt.style.cssText =
        "font-size:11px;letter-spacing:2px;color:#9fd8ff;text-shadow:0 1px 4px rgba(0,0,0,0.9);";
      const track = document.createElement("div");
      track.style.cssText =
        "position:relative;width:230px;height:9px;border-radius:5px;overflow:hidden;" +
        "background:linear-gradient(180deg,rgba(12,14,18,0.92),rgba(0,0,0,0.72));" +
        "border:1px solid rgba(255,255,255,0.18);box-shadow:0 2px 8px rgba(0,0,0,0.6);";
      // Tick marks at each whole dash, so you can read "do I have another dash?" at a glance
      // instead of estimating a percentage.
      for (let i = 1; i * STAMINA_DASH_COST < STAMINA_MAX; i++) {
        const t = document.createElement("div");
        t.style.cssText =
          "position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.30);" +
          "left:" + ((i * STAMINA_DASH_COST / STAMINA_MAX) * 100).toFixed(1) + "%;";
        track.appendChild(t);
      }
      const fill = document.createElement("div");
      fill.style.cssText =
        "position:absolute;left:0;top:0;bottom:0;width:100%;" +
        "background:linear-gradient(180deg,#7fe3ff,#1f9dd8);" +
        "box-shadow:inset 0 1px 0 rgba(255,255,255,0.3);transition:width 0.05s linear;";
      track.appendChild(fill);
      wrap.appendChild(txt);
      wrap.appendChild(track);
      document.body.appendChild(wrap);
      _stamWrapEl = wrap; _stamFillEl = fill; _stamTextEl = txt;
    }

    function updateStaminaHud() {
      buildStaminaHud();
      if (!_stamWrapEl) return;
      const inGame = gameWorldReady && menuEl && menuEl.style.display === "none" && player.health > 0;
      if (!inGame) { _stamWrapEl.style.display = "none"; return; }
      _stamWrapEl.style.display = "flex";
      const frac = THREE.MathUtils.clamp(state.stamina / STAMINA_MAX, 0, 1);
      _stamFillEl.style.width = (frac * 100).toFixed(1) + "%";
      const dashes = Math.floor(state.stamina / STAMINA_DASH_COST);
      const dry = dashes < 1;
      _stamFillEl.style.background = dry
        ? "linear-gradient(180deg,#ff8a5c,#d8451f)"
        : "linear-gradient(180deg,#7fe3ff,#1f9dd8)";
      _stamTextEl.style.color = dry ? "#ffb08f" : "#9fd8ff";
      // NOTE: K() is a local of updateHud() — use the underlying helpers directly here.
      _stamTextEl.textContent =
        tr("hudStamina", "STAMINA") + "  " + dashes + "× " + codeToLabel(kbCode("dash"));
    }

    function updateAltGauge() {
      buildAltGauge();
      if (!_altGaugeEl) return;
      const inGame = gameWorldReady && menuEl && menuEl.style.display === "none";
      // Height you would fall from right now (floor sits at eye level 1.65).
      const drop = player.position.y - 1.65;
      const show = inGame && player.health > 0 && (drop > 0.6 || state.jet.phase !== "idle");
      _altGaugeEl.style.display = show ? "flex" : "none";
      if (!show) return;

      const frac = THREE.MathUtils.clamp(drop / ALT_GAUGE_MAX, 0, 1);
      _altFillEl.style.height = (frac * 100).toFixed(1) + "%";

      let color = "#17c85b";
      let label = "#8de08d";
      if (drop >= JET_FATAL_FALL_DROP) {
        color = "#ff2f2f";
        label = "#ff6a6a";
      } else if (drop >= JET_FALL_WARN_DROP) {
        color = "#ffb21f";
        label = "#ffd07a";
      }
      _altFillEl.style.background = `linear-gradient(180deg, ${color}, ${color})`;
      _altTextEl.style.color = label;
      _altTextEl.textContent =
        drop.toFixed(1) + "m" + (drop >= JET_FATAL_FALL_DROP ? "  ☠" : "");
    }

    function updateJetHud() {
      const el = _jetHudEl || (_jetHudEl = document.getElementById("needleHud"));
      if (!el) return;
      const jt = state.jet;
      if (jt.phase === "idle") return; // needle HUD owns the bar when the harness is idle
      const inGame = gameWorldReady && menuEl && menuEl.style.display === "none";
      if (!inGame) return;
      const lbl = _needleLabelEl || (_needleLabelEl = document.getElementById("needleLabel"));
      const fill = _needleBarFillEl || (_needleBarFillEl = document.getElementById("needleBarFill"));
      let text = "";
      let width = "0%";
      if (jt.phase === "strapping") {
        const p = jetPhaseProgress();
        // Span, not the constant: a heavy vest stretches the strap-in, and the countdown
        // has to say so rather than lying about a flat 3 s.
        const strapSpan = Math.max(1, jt.endMs - jt.startMs);
        text = tr("jetStrapping", "STRAPPING IN...") + "  " + ((1 - p) * (strapSpan / 1000)).toFixed(1) + "s";
        width = (p * 100).toFixed(0) + "%";
      } else {
        const left = Math.max(0, jt.endMs - performance.now());
        text = "🜂 " + tr("jetActive", "JET") + "  " + (left / 1000).toFixed(1) + "s";
        width = ((left / JET_ACTIVE_MS) * 100).toFixed(0) + "%";
      }
      el.style.display = "flex";
      el.className = "nh-inject";
      if (lbl) lbl.textContent = text;
      if (fill) fill.style.width = width;
      _needleHudKey = "";  // force the needle HUD to redraw once the harness releases the bar
    }

    /** Short pneumatic clatter — buckles being drawn tight. */
    function playJetStrapSound() {
      if (!audioCtx || !audioSfx) return;
      const t0 = audioCtx.currentTime;
      for (let i = 0; i < 3; i++) {
        const at = t0 + i * 0.9;
        const src = audioCtx.createBufferSource();
        src.buffer = getGunNoiseBuffer(0.05);
        const bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(1800 + i * 350, at);
        bp.Q.setValueAtTime(3.2, at);
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.32, at + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
        src.connect(bp); bp.connect(g); g.connect(audioSfx);
        try { src.start(at); src.stop(at + 0.07); } catch (_) {}
      }
    }

    /** Turbine spin-up when the harness comes online. */
    function playJetIgniteSound() {
      if (!audioCtx || !audioSfx) return;
      const t0 = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, t0);
      osc.frequency.exponentialRampToValueAtTime(640, t0 + 0.5);
      const lp = audioCtx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(500, t0);
      lp.frequency.exponentialRampToValueAtTime(2600, t0 + 0.5);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.26, t0 + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.62);
      osc.connect(lp); lp.connect(g); g.connect(audioSfx);
      try { osc.start(t0); osc.stop(t0 + 0.65); } catch (_) {}

      const src = audioCtx.createBufferSource();
      src.buffer = getGunNoiseBuffer(0.5);
      const hp = audioCtx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(1400, t0);
      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.0001, t0);
      ng.gain.linearRampToValueAtTime(0.14, t0 + 0.12);
      ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
      src.connect(hp); hp.connect(ng); ng.connect(audioSfx);
      try { src.start(t0); src.stop(t0 + 0.56); } catch (_) {}
    }

    /** Thrust burst when a jet dash fires. */
    function playJetBurstSound() {
      if (!audioCtx || !audioSfx) return;
      const t0 = audioCtx.currentTime;
      const src = audioCtx.createBufferSource();
      src.buffer = getGunNoiseBuffer(0.34);
      const bp = audioCtx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(700, t0);
      bp.frequency.exponentialRampToValueAtTime(2200, t0 + 0.28);
      bp.Q.setValueAtTime(0.8, t0);
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.4, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
      src.connect(bp); bp.connect(g); g.connect(audioSfx);
      try { src.start(t0); src.stop(t0 + 0.36); } catch (_) {}

      const sub = audioCtx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(150, t0);
      sub.frequency.exponentialRampToValueAtTime(48, t0 + 0.26);
      const sg = audioCtx.createGain();
      sg.gain.setValueAtTime(0.0001, t0);
      sg.gain.exponentialRampToValueAtTime(0.3, t0 + 0.015);
      sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      sub.connect(sg); sg.connect(audioSfx);
      try { sub.start(t0); sub.stop(t0 + 0.32); } catch (_) {}
    }

    function updateSlowDebuffHud() {
      const slowed = isPlayerSlowed();
      if (SLOW_TEXT_EL) {
        SLOW_TEXT_EL.classList.toggle("show", slowed);
        if (slowed) SLOW_TEXT_EL.textContent = tr("hudSlowed", "IMMOBILIZED");
      }
    }

    function applyEnemySlowDebuff(enemy, durationSec) {
      if (!enemy) return;
      const dur = Math.max(0.5, durationSec || 5.0);
      enemy.slowUntil = performance.now() + dur * 1000;
      enemy.aware = false;
      enemy.targetId = null;
      enemy.retargetTimer = 0;
      enemy.rangedLosAcquireTimer = 0;
      enemy.moving = false;
      enemy.attackCooldownTimer = Math.max(enemy.attackCooldownTimer, dur);
    }

    /**
     * Paralysis dart network emit.
     *
     * Server contract (discovered the hard way during v25-v29 debugging):
     *  - The relay server normalizes every "hit" event into a fixed schema before forwarding:
     *      { by: <attacker_socket_id>, damage: <num>, x, z, hitKind: 'bullet' }
     *  - Custom fields (hitKind: "dartSlow", slowDuration, slow, weapon, weaponIndex, target,
     *    attacker, shooter, from, ...) are ALL stripped.
     *  - hitKind is rewritten to 'bullet' for any hit, regardless of what we sent.
     *  - Damage value IS preserved (this is the one field we can rely on).
     *  - Custom events like "playerSlow", "dartSlow", "playerBlind", "blind" are NOT relayed
     *    at all (server only knows about hit/shoot/move/chat/etc.). We tried — they're silent.
     *
     * Magic damage convention:
     *  - damage === 1 in a PvP map = paralysis dart (no other weapon emits 1 dmg).
     *  - The victim's damaged handler keys off this and applies slow without HP loss.
     *  - Knife and bullets all deal >= 50 so there's no collision.
     *
     * shoot event: we also emit a "shoot" with type:"dartSlow" so the visual tracer renders
     * cyan on the victim's side. The server preserves enough of the shoot payload (color, type)
     * for the proximity-based fallback in `tryApplyDartSlowFromShootProximity` to fire too.
     */
    function emitDartSlowNetwork(targetId, durationSec, hitPoint, muzzleOpt) {
      if (!MULTIPLAYER || !socket || targetId == null) return;
      const dur = Math.max(0.5, durationSec || 5.0);
      const hx = hitPoint && hitPoint.x != null ? hitPoint.x : player.position.x;
      const hy = hitPoint && hitPoint.y != null ? hitPoint.y : player.position.y + 1.12;
      const hz = hitPoint && hitPoint.z != null ? hitPoint.z : player.position.z;
      if (window.__fpsDartDebug) {
        console.info("[zone-no-light-v30][SHOOTER] emitting dart hit/shoot", { target: String(targetId), dur, mySocketId: socket.id, currentMap: CURRENT_MAP, isPvp: isPvpCrossfireMap(CURRENT_MAP) });
      }
      // Standard hit/damaged channel: damage:1 is our magic marker (see header comment).
      socket.emit("hit", {
        target: targetId,
        damage: 1,
        x: hx,
        z: hz,
        hitKind: "dartSlow", // server strips this; receiver detects via damage===1
      });
      const muzzle = muzzleOpt && muzzleOpt.isVector3
        ? muzzleOpt
        : new THREE.Vector3(hx, hy, hz);
      const end = hitPoint && hitPoint.isVector3
        ? hitPoint
        : new THREE.Vector3(hx, hy, hz);
      emitShootNetwork(muzzle, end, 0x6bd4ff, "dartSlow", {
        target: targetId,
        slowTarget: targetId,
        slowDuration: dur,
        hitKind: "dartSlow",
      });
    }

    function spawnParalysisDartProjectile(origin, direction, weaponCfg) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x6bd4ff, roughness: 0.4, metalness: 0.6, emissive: 0x224466, emissiveIntensity: 0.6 });
      const matTip = new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.3, metalness: 0.8 });
      const dart = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.22, 8), mat);
      shaft.rotation.x = Math.PI / 2;
      dart.add(shaft);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.06, 8), matTip);
      tip.rotation.x = -Math.PI / 2;
      tip.position.z = -0.14;
      dart.add(tip);
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.006, 0.04), mat);
      fin.position.z = 0.10;
      dart.add(fin);
      scene.add(dart);
      const dir = direction.clone().normalize();
      const speed = (weaponCfg && weaponCfg.projectileSpeed) || 36;
      const proj = {
        type: "paralysisDart",
        fromShooter: true,
        netHitSent: false,
        pos: origin.clone(),
        prev: origin.clone(),
        vel: dir.clone().multiplyScalar(speed),
        gravity: (weaponCfg && weaponCfg.projectileGravity) || 9.8,
        slowDuration: (weaponCfg && weaponCfg.slowDuration) || 5,
        mesh: dart,
        age: 0,
        maxAge: 6,
      };
      dart.position.copy(proj.pos);
      const fwd = proj.vel.clone().normalize();
      dart.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), fwd);
      proj._dartMuzzle = origin.clone();
      state.projectiles.push(proj);
      return proj;
    }

    function _disposeProjectile(p) {
      if (!p.mesh) return;
      scene.remove(p.mesh);
      p.mesh.traverse(node => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
          else node.material.dispose();
        }
      });
      p.mesh = null;
    }

    function humanoidHitAlongRayPadded(raycaster, rootGroup, pad, isBossEnemy, enemyOpt = null) {
      if (isBossEnemy && enemyOpt) {
        const h = bossHitAlongRay(raycaster, enemyOpt, 1);
        if (h || pad <= 1.001) return h;
        return bossHitAlongRay(raycaster, enemyOpt, pad);
      }
      const hit = humanoidHitAlongRay(raycaster, rootGroup, isBossEnemy, 1);
      if (hit || pad <= 1.001) return hit;
      return humanoidHitAlongRay(raycaster, rootGroup, isBossEnemy, pad);
    }

    function probeParalysisDartProximityHit(worldPos, hitPad, slowDuration, muzzleOpt) {
      if (MULTIPLAYER && !ARENA_COOP && !isTrainingMap(CURRENT_MAP)) {
        for (const [rpId, rp] of remotePlayers) {
          if (rp.isDown || !rp.group.visible) continue;
          _projWorkVecA.set(rp.visX ?? rp.x ?? 0, 1.12, rp.visZ ?? rp.z ?? 0);
          const dx = worldPos.x - _projWorkVecA.x;
          const dy = worldPos.y - _projWorkVecA.y;
          const dz = worldPos.z - _projWorkVecA.z;
          const r = 0.58 * hitPad;
          if (dx * dx + dy * dy + dz * dz <= r * r) {
            emitDartSlowNetwork(rpId, slowDuration, worldPos, muzzleOpt);
            return true;
          }
        }
      }
      for (const enemy of state.enemies) {
        if (!enemyBlockingHits(enemy)) continue;
        const ex = enemy.group.position.x;
        const ez = enemy.group.position.z;
        const dx = worldPos.x - ex;
        const dy = worldPos.y - 1.12;
        const dz = worldPos.z - ez;
        const r = 0.58 * hitPad;
        if (dx * dx + dy * dy + dz * dz <= r * r) {
          if (enemy.trainingDummy) {
            registerTrainingHit("body");
          } else {
            applyEnemySlowDebuff(enemy, slowDuration);
          }
          return true;
        }
      }
      return false;
    }

    function updateProjectiles(dt) {
      if (!state.projectiles.length) return;
      const projSteps = 5;
      const subDt = dt / projSteps;
      const hitPad = 1.28;
      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const p = state.projectiles[i];
        let consumed = false;
        for (let step = 0; step < projSteps && !consumed; step++) {
          p.age += subDt;
          p.prev.copy(p.pos);
          p.pos.addScaledVector(p.vel, subDt);
          p.vel.y -= p.gravity * subDt;
          const fwd = _projWorkVecA.copy(p.vel);
          if (fwd.lengthSq() > 1e-8) {
            fwd.normalize();
            if (p.mesh) {
              p.mesh.position.copy(p.pos);
              p.mesh.quaternion.setFromUnitVectors(_projWorkVecB.set(0, 0, -1), fwd);
            }
          }
          const segDir = _projWorkVecC.copy(p.pos).sub(p.prev);
          const segLen = segDir.length();
          if (segLen <= 1e-6) continue;
          segDir.multiplyScalar(1 / segLen);
          const segRay = new THREE.Raycaster(p.prev, segDir, 0, segLen + 0.08);
          segRay.camera = camera;

          const localImmune = p.age < 0.06;

          if (!consumed && MULTIPLAYER && !ARENA_COOP && !isTrainingMap(CURRENT_MAP)) {
            for (const [rpId, rp] of remotePlayers) {
              if (rp.isDown || !rp.group.visible) continue;
              rp.group.updateMatrixWorld(true);
              const rh = humanoidHitAlongRayPadded(segRay, rp.group, hitPad);
              if (rh) {
                if (!p.netHitSent) {
                p.netHitSent = true;
                emitDartSlowNetwork(rpId, p.slowDuration, rh.point || p.pos, p._dartMuzzle);
              }
                createSparks(rh.point || p.pos.clone(), 0x6bd4ff);
                consumed = true;
                break;
              }
            }
            if (!consumed && !p.netHitSent) {
              consumed = probeParalysisDartProximityHit(p.pos, hitPad, p.slowDuration, p._dartMuzzle);
              if (consumed) {
                p.netHitSent = true;
                createSparks(p.pos.clone(), 0x6bd4ff);
              }
            }
          }

          if (!consumed && !localImmune && !p.fromShooter) {
            const headW = camera.position;
            const dxc = p.pos.x - headW.x;
            const dyc = p.pos.y - headW.y;
            const dzc = p.pos.z - headW.z;
            if (dxc * dxc + dyc * dyc + dzc * dzc < 0.45 * 0.45) {
              startSlowEffect(p.slowDuration);
              createSparks(p.pos.clone(), 0x6bd4ff);
              consumed = true;
            }
          }

          if (!consumed) {
            for (const enemy of state.enemies) {
              if (!enemyBlockingHits(enemy)) continue;
              enemy.group.updateMatrixWorld(true);
              const hit = humanoidHitAlongRayPadded(segRay, enemy.group, hitPad, !!enemy.isBoss, enemy);
              if (hit) {
                createSparks(hit.point || p.pos.clone(), 0x6bd4ff);
                if (enemy.trainingDummy) {
                  registerTrainingHit(hit.zone || "body");
                } else {
                  applyEnemySlowDebuff(enemy, p.slowDuration);
                }
                consumed = true;
                break;
              }
            }
            if (!consumed && !p.netHitSent) {
              consumed = probeParalysisDartProximityHit(p.pos, hitPad, p.slowDuration, p._dartMuzzle);
              if (consumed) {
                p.netHitSent = true;
                createSparks(p.pos.clone(), 0x6bd4ff);
              }
            }
          }

          if (!consumed) {
            const hits = segRay.intersectObjects(wallMeshes, false);
            if (hits.length > 0) {
              const wp = hits[0].point;
              createSparks(wp.clone(), 0x6bd4ff);
              consumed = true;
            }
          }

          if (consumed || p.age > p.maxAge || p.pos.y < -10) {
            break;
          }
        }
        if (consumed || p.age > p.maxAge || p.pos.y < -10) {
          _disposeProjectile(p);
          state.projectiles.splice(i, 1);
        }
      }
    }

    /**
     * Knife backstab detection. Returns true if the attacker (local player) is in the rear
     * cone of `victimYaw`. Uses a 0.30 dot threshold (~72° behind cone) — generous enough
     * that side-flanks count as backstab, strict enough that head-on charges don't.
     */
    function isBackstabOnYaw(victimX, victimZ, victimYaw) {
      const fwdX = -Math.sin(victimYaw);
      const fwdZ = -Math.cos(victimYaw);
      const dx = victimX - player.position.x;
      const dz = victimZ - player.position.z;
      const len = Math.hypot(dx, dz) || 1;
      const dot = (fwdX * dx + fwdZ * dz) / len;
      return dot > 0.30;
    }

    /**
     * Knife swing: short-range raycast from camera, pick closest remote player or enemy,
     * apply damage (front: weapon body damage; backstab: weapon.meleeBackstabDamage = one-shot).
     * Head/body damage are intentionally equal per design — zone is ignored for the dmg value.
     */
    function performKnifeAttack(w) {
      const range = w.meleeRange || 2.0;
      const dir = getWeaponDirection(0);
      const knifeDamageMult = state.speedNeedle && state.speedNeedle.phase === 'boost' ? 2 : 1;
      const ray = new THREE.Raycaster(camera.position, dir, 0.02, range);
      ray.camera = camera;

      let bestRpId = null;
      let bestRpT = Infinity;
      let bestRpPoint = null;
      let bestRpYaw = 0;
      let bestRpX = 0;
      let bestRpZ = 0;
      if (MULTIPLAYER && !ARENA_COOP && !isTrainingMap(CURRENT_MAP)) {
        for (const [rpId, rp] of remotePlayers) {
          if (rp.isDown || !rp.group.visible) continue;
          rp.group.updateMatrixWorld(true);
          const rh = humanoidHitAlongRayPadded(ray, rp.group, 1.45);
          if (rh && rh.t < bestRpT) {
            bestRpId = rpId;
            bestRpT = rh.t;
            bestRpPoint = rh.point || null;
            bestRpYaw = rp.yaw || 0;
            bestRpX = rp.x ?? rp.group.position.x;
            bestRpZ = rp.z ?? rp.group.position.z;
          }
        }
      }

      let bestEnemy = null;
      let bestEnemyT = Infinity;
      let bestEnemyPoint = null;
      let bestEnemyZone = "body";
      for (const enemy of state.enemies) {
        if (!enemyBlockingHits(enemy)) continue;
        enemy.group.updateMatrixWorld(true);
        const eh = enemy.trainingDummy
          ? humanoidHitAlongRayPadded(ray, enemy.group, 1.45, !!enemy.isBoss, enemy)
          : enemyHitAlongRay(ray, enemy);
        if (eh && eh.t < bestEnemyT) {
          bestEnemy = enemy;
          bestEnemyT = eh.t;
          bestEnemyPoint = _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, eh.t).clone();
          bestEnemyZone = eh.zone || "body";
        }
      }

      const rpDist = bestRpId != null ? bestRpT : Infinity;
      const enemyDist = bestEnemy ? bestEnemyT : Infinity;
      if (rpDist === Infinity && enemyDist === Infinity) return;

      if (rpDist <= enemyDist && bestRpId != null) {
        const isBack = isBackstabOnYaw(bestRpX, bestRpZ, bestRpYaw);
        const dmg = (isBack ? (w.meleeBackstabDamage || 200) : w.damageBody) * knifeDamageMult;
        const bp = bestRpPoint || _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, bestRpT).clone();
        createBlood(bp);
        playKnifeHitSound();
        triggerHitFeedback(isBack, false);
        const rpVictim = remotePlayers.get(bestRpId);
        if (rpVictim && !rpVictim.isDown) {
          const prev = typeof rpVictim.hpEstimate === "number" ? rpVictim.hpEstimate : 100;
          const after = prev - dmg;
          rpVictim.hpEstimate = Math.max(0, after);
          if (after <= 0) {
            if (applyPvpKillToVictim(rpVictim, bp.clone ? bp.clone() : bp)) {
              showCombatFeedback(
                isBack ? tr("combatBackstab", "BACKSTAB!") : tr("combatKill", "KILL!"),
                "#ff5050",
                0.34
              );
              createSparks(bp.clone ? bp.clone() : bp, 0xff5555);
            }
          }
        }
        if (MULTIPLAYER) {
          // Raw, like bullets — the victim applies armour. The knife used to skip armour
          // entirely because it never went through any mitigation path at all.
          socket.emit("hit", {
            target: bestRpId,
            damage: dmg,
            x: player.position.x,
            z: player.position.z,
            hitKind: "melee",
          });
        }
        return;
      }

      if (bestEnemy) {
        const bp = bestEnemyPoint || _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, bestEnemyT).clone();
        createBlood(bp);
        playKnifeHitSound();
        if (bestEnemy.trainingDummy) {
          registerTrainingHit(bestEnemyZone);
          const downed = damageTrainingDummy(bestEnemy, bestEnemyZone, w, bp);
          triggerHitFeedback(downed, bestEnemyZone === "head");
          updateHud();
          return;
        }
        triggerHitFeedback(false, false);
        const baseEnemyDamage = bestEnemyZone === "head" ? w.damageHead : bestEnemyZone === "leg" ? w.damageLegs : w.damageBody;
        bestEnemy.hp -= baseEnemyDamage * knifeDamageMult;
        drawEnemyHp(bestEnemy);
        if (bestEnemy.hp <= 0 && bestEnemy.alive) {
          bestEnemy.alive = false;
          bestEnemy.respawnTimer = zombieRespawnDelay();
          bestEnemy.dissolveTimer = DISSOLVE_DURATION + 0.12;
          spawnHumanoidDissolve(bestEnemy.group, bp);
          bestEnemy.group.visible = false;
          state.score += 1;
          registerEnemyKill(bestEnemy);
          triggerHitFeedback(true, false);
          createSparks(bp.clone ? bp.clone() : bp, 0xff5555);
          if (bestEnemy.isBoss) checkAllBossesDead(bestEnemy.group.position.clone());
        }
        // v33: report knife damage to host so co-op boss/zombie HP actually decreases.
        // Bullet path (tryShoot) already does this; the knife path was the missing link.
        if (MULTIPLAYER && ARENA_COOP && !ZOMBIE_AUTHORITY &&
            (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP))) {
          const ei = bestEnemy.netIndex ?? state.enemies.indexOf(bestEnemy);
          socket.emit("zombieDamaged", {
            ei,
            zone: bestEnemyZone,
            weaponIndex: state.weaponIndex,
          });
        }
      }
    }

    // ── Camera recoil ─────────────────────────────────────────────────────────
    // Until v6 only the AMR moved the CAMERA when it fired; every other weapon just kicked
    // the view-model and widened the spread cone, so the gun jumped while the crosshair sat
    // perfectly still and everything felt like a laser pointer. Each weapon now has a
    // `recoilKick` (radians of upward pitch per shot) and a small random `recoilYaw`.
    //
    // The climb is recoverable, not permanent: every radian added is banked in
    // recoilPitchAccum and eased back out once the player stops firing, so a burst walks the
    // sights up and then settles. Pulling the mouse DOWN spends that bank (see
    // consumeRecoilCompensation) — that way a player who compensates manually doesn't get
    // the view yanked back down again afterwards, which is what makes recoil learnable.
    const RECOIL_RECOVER_DELAY_MS = 110;
    const RECOIL_RECOVER_LAMBDA = 7.5;

    function applyRecoilKick(w, mult) {
      const kick = (w.recoilKick || 0) * (mult || 1);
      if (kick <= 0) return;
      const yawAmp = (w.recoilYaw || 0) * (mult || 1);
      const yawKick = (Math.random() * 2 - 1) * yawAmp;
      player.pitch += kick;
      player.yaw += yawKick;
      state.recoilPitchAccum += kick;
      state.recoilYawAccum += yawKick;
      const limit = Math.PI / 2 - 0.01;
      player.pitch = Math.max(-limit, Math.min(limit, player.pitch));
    }

    /** Ease the banked recoil back out once the player stops shooting. */
    function updateRecoilRecovery(dt) {
      if (state.recoilPitchAccum === 0 && state.recoilYawAccum === 0) return;
      if (performance.now() - state.lastShot < RECOIL_RECOVER_DELAY_MS) return;
      const k = 1 - Math.exp(-RECOIL_RECOVER_LAMBDA * dt);
      const backPitch = state.recoilPitchAccum * k;
      const backYaw = state.recoilYawAccum * k;
      player.pitch -= backPitch;
      player.yaw -= backYaw;
      state.recoilPitchAccum -= backPitch;
      state.recoilYawAccum -= backYaw;
      if (Math.abs(state.recoilPitchAccum) < 1e-5) state.recoilPitchAccum = 0;
      if (Math.abs(state.recoilYawAccum) < 1e-5) state.recoilYawAccum = 0;
      const limit = Math.PI / 2 - 0.01;
      player.pitch = Math.max(-limit, Math.min(limit, player.pitch));
    }

    /**
     * Called with the pitch/yaw the player just applied by hand. Manual downward pull eats
     * the pending recoil bank so the recovery doesn't fight the player's own compensation.
     */
    function consumeRecoilCompensation(dPitch, dYaw) {
      if (dPitch < 0 && state.recoilPitchAccum > 0) {
        state.recoilPitchAccum = Math.max(0, state.recoilPitchAccum + dPitch);
      }
      if (state.recoilYawAccum !== 0 && dYaw !== 0) {
        const shrunk = state.recoilYawAccum + dYaw;
        // Only cancel when the player pulled against the drift, never add to it.
        if (Math.abs(shrunk) < Math.abs(state.recoilYawAccum)) state.recoilYawAccum = shrunk;
      }
    }

    function tryShoot() {
      if (!gameWorldReady || paused || player.health <= 0) return;
      if (state.weaponIndex === 4) return;
      // Both hands are on the harness straps for the 3 s strap-on — that commitment is the
      // cost of the item, so no shooting until it is on.
      if (isJetStrapping()) return;
      const now = performance.now();
      const w = weapon();
      const shootingAds = (state.ads || keys.shift) && !state.reloading && player.health > 0;

      // Knife: melee swing. Cycle left -> right -> thrust. Damage is applied at swing start
      // (standard FPS feel); animation is purely cosmetic feedback.
      if (state.weaponIndex === 7) {
        if (now - state.lastKnifeSwing < w.fireDelay) return;
        state.lastKnifeSwing = now;
        const combo = state.knifeComboIdx % 3;
        state.knifeComboIdx = (state.knifeComboIdx + 1) % 3;
        state.weaponAction = combo === 0 ? "knifeSlashL" : combo === 1 ? "knifeSlashR" : "knifeThrust";
        state.weaponActionDur = combo === 2 ? 700 : 620;
        state.weaponActionStart = now;
        playKnifeSwingSound();
        performKnifeAttack(w);
        updateHud();
        return;
      }

      if (state.reloading) return;
      if (w.ammo <= 0) {
        startReload();
        return;
      }
      if (now - state.lastShot < w.fireDelay) return;

      state.lastShot = now;
      if (state.weaponIndex !== 8) w.ammo -= 1;
      if (isTrainingMap(CURRENT_MAP)) registerTrainingShot();

      if (state.weaponIndex === 6) {
        playGunSound(w);
        startWeaponFireAnim();
        state.recoil += w.recoil;
        applyRecoilKick(w, 1);
        state.spreadBloom = Math.min(w.spreadBloomMax, state.spreadBloom + w.spreadBloomAdd);
        const totalSpread =
          (w.spreadBase || 0) + state.spreadBloom * 0.5;
        const dir = getWeaponDirection(totalSpread);
        const muzzle = new THREE.Vector3();
        getActiveMuzzleWorld(muzzle);
        const proj = spawnParalysisDartProjectile(muzzle, dir, w);
        if (MULTIPLAYER && !ARENA_COOP && !isTrainingMap(CURRENT_MAP)) {
          const dartRay = new THREE.Raycaster(muzzle, dir, 0.02, 120);
          dartRay.camera = camera;
          let bestRpId = null;
          let bestRpT = Infinity;
          let bestRpPoint = null;
          for (const [rpId, rp] of remotePlayers) {
            if (rp.isDown || !rp.group.visible) continue;
            rp.group.updateMatrixWorld(true);
            const rh = humanoidHitAlongRayPadded(dartRay, rp.group, 1.32);
            if (rh && rh.t < bestRpT) {
              bestRpId = rpId;
              bestRpT = rh.t;
              bestRpPoint = rh.point || null;
            }
          }
          if (bestRpId != null) {
            const bp =
              bestRpPoint ||
              _ehHitWorld.copy(dartRay.ray.origin).addScaledVector(dartRay.ray.direction, bestRpT);
            if (proj) proj.netHitSent = true;
            emitDartSlowNetwork(bestRpId, w.slowDuration || 5, bp, muzzle);
            createSparks(bp.clone ? bp.clone() : bp, 0x6bd4ff);
          }
        }
        updateHud();
        return;
      }

      let spreadMultiplier = 1;
      let recoilMultiplier = 1;
      // Continuous ADS accuracy: 0 = hipfire, 1 = full ADS (tracks animation).
      const adsReadyThr = adsReadyProgressForWeapon(state.weaponIndex);
      let adsAccuracy = shootingAds ? state.adsProgress : 0;
      if (shootingAds && state.adsProgress >= adsReadyThr) {
        adsAccuracy = 1;
      }
      if (shootingAds && state.adsProgress < adsReadyThr) {
        state.adsFiredWhileScoping = true;
      }

      if (state.weaponIndex === 0) {
        spreadMultiplier = THREE.MathUtils.lerp(3.1, 0.4, adsAccuracy);
        recoilMultiplier = THREE.MathUtils.lerp(1.0, 0.75, adsAccuracy);
      } else if (state.weaponIndex === 1) {
        spreadMultiplier = THREE.MathUtils.lerp(2.95, 0.5, adsAccuracy);
        recoilMultiplier = THREE.MathUtils.lerp(1.0, 0.70, adsAccuracy);
      } else if (state.weaponIndex === 2) {
        spreadMultiplier = THREE.MathUtils.lerp(2.7, 1.5, adsAccuracy);
        recoilMultiplier = THREE.MathUtils.lerp(1.0, 0.90, adsAccuracy);
      } else if (state.weaponIndex === 3) {
        spreadMultiplier = THREE.MathUtils.lerp(1.0, 0.5, adsAccuracy);
        recoilMultiplier = 0.90;
      } else if (state.weaponIndex === 5) {
        // AMR: scope visually snaps in at adsReadyThr (weapon hides + scope overlay full).
        const adsReady = shootingAds && state.adsProgress >= adsReadyThr;
        spreadMultiplier = adsReady ? 0 : THREE.MathUtils.lerp(3.65, 0.62, adsAccuracy * 0.55);
        recoilMultiplier = adsReady ? 0.62 : THREE.MathUtils.lerp(1.45, 0.85, adsAccuracy * 0.55);
      }
      state.recoil += w.recoil * recoilMultiplier;
      applyRecoilKick(w, recoilMultiplier);
      state.spreadBloom = Math.min(
        w.spreadBloomMax,
        state.spreadBloom + w.spreadBloomAdd
      );

      const muzzleStart = new THREE.Vector3();
      const _crosshairHit = new THREE.Vector3();

      playGunSound(w);
      startWeaponFireAnim();
      maybeEjectShellCasing();

      for (let i = 0; i < w.pellets; i++) {
        getActiveMuzzleWorld(muzzleStart);

        const movingPenalty = (keys.w || keys.a || keys.s || keys.d) ? 1.25 : 1;
        // ADS penalty blends with the same adsAccuracy so the steadying kicks in as the animation finishes.
        // A weapon may pull the cone BELOW its hip value once fully scoped (AS Val 0.55).
        // Without adsSpreadMul the floor is 1.0 — ADS only cancels the hip penalty.
        const adsPenalty = THREE.MathUtils.lerp(1.8, (w.adsSpreadMul ?? 1.0), adsAccuracy);
        let totalSpread;
        if (state.weaponIndex === 5) {
          const adsReady = shootingAds && state.adsProgress >= adsReadyThr;
          if (adsReady) {
            totalSpread = 0;
          } else {
            // While scoping in: keep some sway (2.35 when partial) gently easing toward steady (1.0).
            const amrPenalty = THREE.MathUtils.lerp(1.85, 1.0, adsAccuracy);
            const partialPenalty = shootingAds ? amrPenalty : adsPenalty;
            totalSpread =
              (w.spreadBase + state.spreadBloom) *
              spreadMultiplier *
              movingPenalty *
              partialPenalty;
          }
        } else {
          totalSpread =
            (w.spreadBase + state.spreadBloom) * spreadMultiplier * movingPenalty * adsPenalty;
        }
        const dir = getWeaponDirection(totalSpread);
        const rayOrigin = camera.position;
        const ray = new THREE.Raycaster(rayOrigin, dir, 0.02, 160);
        ray.camera = camera;

        if (state.weaponIndex === 8) {
          performDevGunPierce(ray, muzzleStart, w);
          continue;
        }

        const wallHits = ray.intersectObjects(wallMeshes, false);
        const wallHit = wallHits.length > 0 ? wallHits[0] : null;
        const wallDist = wallHit ? wallHit.distance : Infinity;

        let bestEnemy = null;
        let bestEnemyHitT = Infinity;
        let bestEnemyZone = "body";

        for (const enemy of state.enemies) {
          if (!enemyBlockingHits(enemy)) continue;
          enemy.group.updateMatrixWorld(true);
          let hit = null;
          if (enemy.trainingDummy) {
            hit = humanoidHitAlongRay(ray, enemy.group);
          } else {
            hit = enemyHitAlongRay(ray, enemy);
          }
          if (hit && hit.t < bestEnemyHitT) {
            bestEnemy = enemy;
            bestEnemyHitT = hit.t;
            bestEnemyZone = hit.zone;
          }
        }

        let bestRpId = null;
        let bestRpHitT = Infinity;
        let bestRpZone = "body";
        if (MULTIPLAYER && !ARENA_COOP && !isTrainingMap(CURRENT_MAP)) {
          for (const [rpId, rp] of remotePlayers) {
            if (rp.isDown || !rp.group.visible) continue;
            rp.group.updateMatrixWorld(true);
            const rh = humanoidHitAlongRay(ray, rp.group);
            if (rh && rh.t < bestRpHitT) {
              bestRpId = rpId;
              bestRpHitT = rh.t;
              bestRpZone = rh.zone;
            }
          }
        }

        let bestProjIdx = -1;
        let bestProjT = Infinity;
        for (let pi = 0; pi < bossProjectiles.length; pi++) {
          const proj = bossProjectiles[pi];
          const toP = new THREE.Vector3().subVectors(proj.mesh.position, ray.ray.origin);
          const along = toP.dot(ray.ray.direction);
          if (along < 0.02 || along > 160) continue;
          const closest = new THREE.Vector3().copy(ray.ray.origin).addScaledVector(ray.ray.direction, along);
          const dist2 = closest.distanceToSquared(proj.mesh.position);
          if (dist2 < 0.65 * 0.65 && along < bestProjT) {
            bestProjIdx = pi;
            bestProjT = along;
          }
        }

        const enemyDist = bestEnemy ? bestEnemyHitT : Infinity;
        const rpDist = bestRpId != null ? bestRpHitT : Infinity;
        const projDist = bestProjIdx >= 0 ? bestProjT : Infinity;
        const closestDist = Math.min(enemyDist, rpDist, wallDist, projDist);

        if (closestDist === projDist && bestProjIdx >= 0) {
          const proj = bossProjectiles[bestProjIdx];
          proj.hp -= w.damageBody;
          const hitPt = new THREE.Vector3().copy(ray.ray.origin).addScaledVector(ray.ray.direction, bestProjT);
          createSparks(hitPt, 0xff6622);
          createBulletTrail(muzzleStart, hitPt, w.color);
          if (proj.hp <= 0) {
            destroyBossProjectile(bestProjIdx);
          }
          continue;
        }

        if (closestDist === enemyDist && bestEnemy && bestEnemyHitT < Infinity) {
          const bp = _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, bestEnemyHitT);
          createBlood(bp);
          createBulletTrail(muzzleStart, bp, w.color);
          emitShootNetwork(muzzleStart, bp, w.color, "blood");
          triggerHitFeedback(false, bestEnemyZone === "head");

          if (bestEnemy.trainingDummy) {
            registerTrainingHit(bestEnemyZone);
            const downed = damageTrainingDummy(bestEnemy, bestEnemyZone, w, bp);
            if (downed) triggerHitFeedback(true, bestEnemyZone === "head");
            updateHud();
            continue;
          }

          const coopArena = MULTIPLAYER && ARENA_COOP && (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP));
          if (coopArena && !ZOMBIE_AUTHORITY) {
            const ei = bestEnemy.netIndex ?? state.enemies.indexOf(bestEnemy);
            applyDamage(bestEnemy, bestEnemyZone, w);
            drawEnemyHp(bestEnemy);
            if (bestEnemy.hp <= 0 && bestEnemy.alive) {
              bestEnemy.alive = false;
              bestEnemy.respawnTimer = zombieRespawnDelay();
              bestEnemy.dissolveTimer = DISSOLVE_DURATION + 0.12;
              spawnHumanoidDissolve(bestEnemy.group, bp);
              bestEnemy.group.visible = false;
              state.score += 1;
              registerEnemyKill(bestEnemy);
              triggerHitFeedback(true, bestEnemyZone === "head");
              createSparks(bp.clone(), 0xff5555);
              createSparks(bp.clone(), 0xff8888);
              if (bestEnemy.isBoss) checkAllBossesDead(bestEnemy.group.position.clone());
            }
            // v33: was "zombieDamage" (missing the final 'd') — listener is "zombieDamaged",
            // so joiner damage to bosses/zombies was silently dropped server-side. Fixed.
            socket.emit("zombieDamaged", {
              ei,
              zone: bestEnemyZone,
              weaponIndex: state.weaponIndex,
            });
          } else {
            applyDamage(bestEnemy, bestEnemyZone, w);
            if (bestEnemy.hp <= 0 && bestEnemy.alive) {
              bestEnemy.alive = false;
              bestEnemy.respawnTimer = zombieRespawnDelay();
              bestEnemy.dissolveTimer = DISSOLVE_DURATION + 0.12;
              spawnHumanoidDissolve(bestEnemy.group, bp);
              bestEnemy.group.visible = false;
              state.score += 1;
              registerEnemyKill(bestEnemy);
              triggerHitFeedback(true, bestEnemyZone === "head");
              createSparks(bp.clone(), 0xff5555);
              createSparks(bp.clone(), 0xff8888);
              if (bestEnemy.isBoss) checkAllBossesDead(bestEnemy.group.position.clone());
            }
          }
        } else if (closestDist === rpDist && bestRpId != null && bestRpHitT < Infinity) {
          const bp = _ehHitWorld.copy(ray.ray.origin).addScaledVector(ray.ray.direction, bestRpHitT);
          createBlood(bp);
          createBulletTrail(muzzleStart, bp, w.color);
          emitShootNetwork(muzzleStart, bp, w.color, "blood");
          let dmg = w.damageBody;
          if (bestRpZone === "head") dmg = w.damageHead;
          else if (bestRpZone === "leg") dmg = w.damageLegs;
          // Raw damage goes on the wire. Pricing it here (v18) could never work: the relay
          // forwards ONLY id/x/y/z/yaw/name/weapon from `move` and drops every custom field,
          // so `arm` never arrived and every opponent looked unarmoured. Measured with two
          // live clients — the armoured player broadcast h3/v3 and the shooter read h0/v0.
          // The victim applies its own armour instead; see socket.on("damaged").
          const rpVictim = remotePlayers.get(bestRpId);
          let predictedKill = false;
          if (rpVictim && !rpVictim.isDown) {
            const prev = typeof rpVictim.hpEstimate === "number" ? rpVictim.hpEstimate : 100;
            const after = prev - dmg;
            rpVictim.hpEstimate = after;
            if (after <= 0) {
              predictedKill = applyPvpKillToVictim(rpVictim, bp.clone ? bp.clone() : bp);
              if (predictedKill) {
                showCombatFeedback(tr("combatKill", "KILL!"), "#ff5050", 0.34);
                createSparks(bp.clone(), 0xff5555);
                createSparks(bp.clone(), 0xff8888);
              }
            }
          }
          triggerHitFeedback(predictedKill, bestRpZone === "head");
          socket.emit("hit", {
            target: bestRpId,
            damage: dmg,
            x: player.position.x,
            z: player.position.z,
            hitKind: "bullet",
          });
        } else if (wallHit) {
          const wp = wallHit.point.clone();
          const normal = wallHit.face.normal.clone().transformDirection(wallHit.object.matrixWorld);
          createBulletTrail(muzzleStart, wp, w.color);
          createSparks(wp.clone(), w.color);
          createBulletMark(wp.clone(), normal);
          emitShootNetwork(muzzleStart, wp, w.color, "spark", {
            nx: normal.x,
            ny: normal.y,
            nz: normal.z,
          });
        } else {
          const missEnd = _crosshairHit.copy(rayOrigin).addScaledVector(dir, 160);
          createBulletTrail(muzzleStart, missEnd, w.color);
          emitShootNetwork(muzzleStart, missEnd, w.color, "miss");
        }
      }

      updateHud();
    }

    function updateMedKit(dt) {
      if (state.weaponIndex !== 4 || player.health <= 0 || paused || !gameWorldReady) return;

      if (state.medKitDefilling) {
        state.medKitDefillPhase += dt / MED_KIT_DEFILL_DURATION;
        if (state.medKitDefillPhase >= 1) {
          state.medKitDefilling = false;
          state.medKitDefillPhase = 0;
          state.medKitRingVisual = 0;
          applyMedKitRingVisual(0);
        } else {
          const p = state.medKitDefillStart * (1 - state.medKitDefillPhase);
          state.medKitRingVisual = p;
          applyMedKitRingVisual(p);
        }
        return;
      }

      const wMed = weapons[4];
      // Allow medpack use whenever the player is not at full health (no ammo
      // limit). The F key / mouse-down can be held to charge up the heal ring.
      const canHeal = player.health < player.maxHealth;
      const wantsHold = isMedKitInputHeld() && canHeal && !state.medKitNeedsRelease;

      if (wantsHold) {
        // Heal timing is wall-clock based (not accumulated frame dt) so it stays
        // correct under heavy load — animate() caps dt at 33ms (~30fps), so a real
        // 10fps game would otherwise take ~3x the intended heal duration.
        if (state.medKitHealProgress === 0) {
          state.medKitHealStartMs = performance.now();
          playMedPackHealSound(getMedKitHealDuration());
        }
        const healDur = getMedKitHealDuration();
        const elapsedMs = performance.now() - state.medKitHealStartMs;
        state.medKitHealProgress = elapsedMs / (healDur * 1000);
        if (state.medKitHealProgress >= 1) {
          player.health = Math.min(player.maxHealth, player.health + 50);
          wMed.ammo = Math.max(0, wMed.ammo - 1);
          state.medKitHealProgress = 0;
          state.medKitHealStartMs = 0;
          state.medKitRingVisual = 0;
          state.medKitNeedsRelease = true;
          applyMedKitRingVisual(0);
          updateHud();
        } else {
          state.medKitRingVisual = state.medKitHealProgress;
          applyMedKitRingVisual(state.medKitRingVisual);
        }
      } else {
        if (state.medKitHealProgress > 0 && !state.medKitNeedsRelease) {
          state.medKitDefilling = true;
          state.medKitDefillStart = state.medKitHealProgress;
          state.medKitDefillPhase = 0;
          state.medKitHealProgress = 0;
          const p = state.medKitDefillStart;
          state.medKitRingVisual = p;
          applyMedKitRingVisual(p);
        } else if (!state.medKitNeedsRelease) {
          state.medKitRingVisual = 0;
          applyMedKitRingVisual(0);
        }
      }
    }

    function isMedKitHoldHealing() {
      return (
        canMedKitHealNow() &&
        !state.medKitNeedsRelease &&
        !state.medKitDefilling &&
        isMedKitInputHeld()
      );
    }

    const _weaponScaleVec = new THREE.Vector3();

    function updateWeaponVisuals(dt, isMoving) {
      const t = performance.now() * 0.001;

      const usingAds =
        (state.ads || keys.shift) &&
        !state.reloading &&
        player.health > 0 &&
        state.weaponIndex !== 3 &&
        state.weaponIndex !== 4 &&
        state.weaponIndex !== 7;
        
      let bobX = 0;
      let bobY = 0;
      let bobRotZ = 0;

      const moveBobScale = state.weaponIndex === 5 ? 0.88 : 1;
      if (isMoving && player.onGround && !usingAds) {
        bobX = Math.sin(t * 5.5) * 0.005 * moveBobScale;
        bobY = Math.abs(Math.cos(t * 11)) * 0.007 * moveBobScale;
        bobRotZ = Math.sin(t * 5.5) * 0.008 * moveBobScale;
      }

      state.weaponBobX = dampScalar(state.weaponBobX, bobX, dt, 16);
      state.weaponBobY = dampScalar(state.weaponBobY, bobY, dt, 16);
      state.weaponBobRotZ = dampScalar(state.weaponBobRotZ, bobRotZ, dt, 16);

      let reloadX = 0;
      let reloadY = 0;
      let reloadRotZ = 0;
      let reloadRotY = 0;
      let reloadRotX = 0;
      let reloadPushZ = 0;
      let reloadProgress = 0;

      if (state.reloading) {
        const total = weapon().reloadTime;
        const remaining = state.reloadEnd - performance.now();
        reloadProgress = THREE.MathUtils.clamp(1 - remaining / total, 0, 1);
        const wm = getWeaponReloadMotion(state.weaponIndex, reloadProgress);
        reloadRotX = wm.reloadRotX;
        reloadRotY = wm.reloadRotY;
        reloadRotZ = wm.reloadRotZ;
        reloadX = wm.reloadX;
        reloadY = wm.reloadY;
        reloadPushZ = wm.reloadPushZ;
      } else if (
        state.weaponIndex === 4 &&
        isMedKitInputHeld() &&
        state.medKitHealProgress > 0 &&
        player.health < player.maxHealth
      ) {
        const wm = getWeaponReloadMotion(4, state.medKitHealProgress);
        reloadRotX = wm.reloadRotX;
        reloadRotY = wm.reloadRotY;
        reloadRotZ = wm.reloadRotZ;
        reloadX = wm.reloadX;
        reloadY = wm.reloadY;
        reloadPushZ = wm.reloadPushZ;
      }

      const activeWeapon = weaponModels[state.weaponIndex];
      let animProgress = reloadProgress;
      if (state.weaponIndex === 4 && isMedKitInputHeld()) {
        animProgress = Math.max(animProgress, state.medKitHealProgress);
      }
      const viewAnim = applyWeaponHandsAnim(activeWeapon, animProgress);
      const gun = activeWeapon.userData.gun;
      const basePos = activeWeapon.userData.basePos;
      const adsOffset = activeWeapon.userData.adsOffset;

      const targetAds = usingAds ? 1 : 0;
      const adsSpeed = (weapon().adsSpeed ?? 8) * getDartSlowAdsMult();

      state.adsProgress += (targetAds - state.adsProgress) * Math.min(1, dt * adsSpeed);

      if (state.weaponIndex !== 4) {
        const adsReadyThrVis = adsReadyProgressForWeapon(state.weaponIndex);
        if (usingAds && state.adsProgress >= adsReadyThrVis && state.adsFiredWhileScoping) {
          state.spreadBloom = 0;
          state.adsFiredWhileScoping = false;
        }
        if (!usingAds) state.adsFiredWhileScoping = false;
      }

      const adsBlend = state.adsProgress;

      const targetScale =
        usingAds && state.weaponIndex === 1
          ? 1.18
          : usingAds && state.weaponIndex === 5
            ? 1.08
            : 1.0;
      _weaponScaleVec.set(targetScale, targetScale, targetScale);
      activeWeapon.scale.lerp(_weaponScaleVec, Math.min(1, dt * 12));
      const targetX = basePos.x + adsOffset.x * adsBlend;
      const targetY = basePos.y + adsOffset.y * adsBlend;
      const targetZ = basePos.z + adsOffset.z * adsBlend;

      gun.position.x += (targetX - gun.position.x) * Math.min(1, dt * 16);
      gun.position.y += (targetY - gun.position.y) * Math.min(1, dt * 16);
      gun.position.z += (targetZ - gun.position.z) * Math.min(1, dt * 16);
      gun.position.x += viewAnim.offX;
      gun.position.y += viewAnim.offY;
      gun.position.z += viewAnim.offZ;
      gun.rotation.x = viewAnim.rotX;
      gun.rotation.z = viewAnim.rotZ;
         
      const hideCrosshair =
        (usingAds && state.weaponIndex !== 1) || state.weaponIndex === 4;
      crosshairEl.classList.toggle("hidden", hideCrosshair);
      if (medKitReticleEl) {
        medKitReticleEl.classList.toggle("hidden", state.weaponIndex !== 4);
      }
      if (amrScopeOverlayEl) {
        const scopeOn = state.weaponIndex === 5 && usingAds;
        const scopeOp = scopeOn
          ? THREE.MathUtils.clamp((state.adsProgress - 0.32) / 0.58, 0, 1)
          : 0;
        amrScopeOverlayEl.style.opacity = String(scopeOp);
        amrScopeOverlayEl.setAttribute("aria-hidden", scopeOp < 0.04 ? "true" : "false");
      }
      if (state.weaponIndex === 5 && activeWeapon) {
        activeWeapon.visible = adsBlend < 0.94;
      }

      weaponRoot.position.set(
        state.weaponBobX + reloadX,
        WEAPON_VIEW_DROP_Y - state.recoil - state.weaponBobY + reloadY,
        reloadPushZ
      );
      weaponRoot.rotation.set(
        state.recoil * (usingAds ? 0.7 : 1.0) + reloadRotX,
        reloadRotY,
        state.weaponBobRotZ + reloadRotZ
      );

      const adsFov = Math.min(88, Math.max(28, weapon().adsFov ?? 55));
      // Helmets narrow the field of view — the higher the tier, the more you give up.
      const targetFov = (usingAds ? adsFov : 75) * myHelmet().fovMul;
      if (camera.fov !== targetFov) {
        camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 10);
        camera.updateProjectionMatrix();
      }
    }

    function updateWeapon(dt) {
      const w = weapon();
      updateRecoilRecovery(dt);

      if (state.reloading && performance.now() >= state.reloadEnd) {
        state.reloading = false;
        w.ammo = w.magSize;
        updateHud();
      }

      state.spreadBloom = Math.max(0, state.spreadBloom - w.recover * dt);
      state.recoil *= Math.pow(0.13, dt);
      if (state.recoil < 0.0002) state.recoil = 0;

      const healLock = isMedKitHoldHealing();
      const movingNow = !healLock && (keys.w || keys.a || keys.s || keys.d);
      updateWeaponVisuals(dt, movingNow);
      updateMedKit(dt);
    }

    function updatePlayer(dt) {
      if (player.health <= 0) {
        camera.position.copy(player.position);
        camera.rotation.y = player.yaw;
        camera.rotation.x = player.pitch;
        return;
      }

      // ── Time-based dash (C key) ───────────────────────────────────────
      // While a dash is active, override the normal movement + gravity with
      // a constant-velocity integration along the stored direction. Distance
      // is capped at DASH_DIST; wall sliding takes care of obstacles.
      const _nowMs = performance.now();
      const _dashing = _nowMs < state.dashActiveUntil;
      if (_dashing) {
        const _speed = (() => {
          // 8 units over DASH_DURATION_MS — recompute from remaining time so a
          // long frame finishes the dash on schedule (no overshoot).
          const _remaining = (state.dashActiveUntil - _nowMs) / 1000;
          return state.dashRemainingDist / Math.max(_remaining, 1e-3);
        })();
        const _stepX = state.dashDirX * _speed * dt;
        const _stepZ = state.dashDirZ * _speed * dt;
        const _stepY = state.dashDirY * _speed * dt;
        const _next = player.position.clone().add(new THREE.Vector3(_stepX, _stepY, _stepZ));
        const _resolved = resolveWallSliding(_next);
        player.position.x = _resolved.x;
        player.position.z = _resolved.z;
        // resolveWallSliding() starts from player.position and only ever writes .x/.z, so
        // _resolved.y is just the CURRENT altitude — reading it back silently threw the
        // vertical part of the step away. Harmless while dashDirY was hard-coded to 0, but
        // it meant the jet dash could never leave the ground. Apply _stepY ourselves and do
        // our own floor/ceiling clamp.
        player.position.y = resolveVerticalStep(player.position.y, _stepY);
        player.velocityY = 0;
        state.dashRemainingDist = Math.max(0, state.dashRemainingDist - _speed * dt);
        // A jet dash genuinely leaves the floor: keep onGround false above the deck so
        // gravity takes over the instant the burst ends and the fall is measured. A plain
        // ground dash still pins you down, exactly as before.
        player.onGround = state.dashIsJet ? player.position.y <= 1.66 : true;
      }

      const healLock = isMedKitHoldHealing();

      const forward = new THREE.Vector3(0, 0, -1)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);
      const right = new THREE.Vector3(1, 0, 0)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

      const move = new THREE.Vector3();
      const moveLocked = isPlayerSlowed();
      if (!_dashing && !healLock && !moveLocked) {
        if (keys.w) move.add(forward);
        if (keys.s) move.sub(forward);
        if (keys.d) move.add(right);
        if (keys.a) move.sub(right);
      }

      // Stamina regen — only after the quiet window, so dash-spam never tops itself up.
      if (state.stamina < STAMINA_MAX && performance.now() >= state.staminaRegenAt) {
        state.stamina = Math.min(STAMINA_MAX, state.stamina + STAMINA_REGEN_PER_SEC * dt);
      }

      // Crouch depth. Ground only, and never mid-dash or mid-flight — crouching in the air
      // would just be a free hitbox shrink.
      {
        const wantCrouch = keys.crouch && player.onGround && !_dashing && !isJetActive()
          && player.health > 0 && !paused;
        crouchAmt += ((wantCrouch ? 1 : 0) - crouchAmt) * Math.min(1, dt * 13);
        if (crouchAmt < 0.001) crouchAmt = 0;
      }

      if (move.lengthSq() > 0) {
        const _ndPhase = state.speedNeedle.phase;
        const _ndMult = (_ndPhase === 'boost' ? 2.0 : _ndPhase === 'weak' ? 0.25 : 1.0)
          * (1 - (1 - CROUCH_SPEED_MUL) * crouchAmt)
          * myVest().speedMul;   // heavier vest, slower walk
        // Normalize first so we can capture the unit direction for the dash before
        // scaling by speed*dt. (State lookup is one branch cheaper than re-normalizing.)
        move.normalize();
        state.lastMoveX = move.x;
        state.lastMoveZ = move.z;
        move.multiplyScalar(player.speed * _ndMult * dt);
        const next = player.position.clone().add(new THREE.Vector3(move.x, 0, move.z));
        const resolved = resolveWallSliding(next);
        player.position.x = resolved.x;
        player.position.z = resolved.z;
      }

      // Stand up before you jump — otherwise crouch-spam would be a free bunny-hop.
      if (!_dashing && !healLock && !moveLocked && keys.space && player.onGround && crouchAmt < 0.5) {
        player.velocityY = 5.8;
        player.onGround = false;
      }

      // Skip gravity + vertical integration during the dash — the dash branch
      // already wrote a fresh position and reset velocityY to 0.
      if (!_dashing) {
        player.velocityY -= 14 * dt;
        player.position.y += player.velocityY * dt;
      }

      const _wasAirborne = !player.onGround || _dashing;
      const _floorEyeY = worldFloorEyeY();
      if (player.position.y <= _floorEyeY) {
        player.position.y = _floorEyeY;
        player.velocityY = 0;
        player.onGround = true;
      } else if (player.velocityY <= 0) {
        // Check if player's feet have landed on top of any wall/cover box
        const feetY = player.position.y - 1.65;
        const pr = player.radius;
        const px = player.position.x;
        const pz = player.position.z;
        let landed = false;
        forEachNearbyWallBox(px, pz, (box) => {
          if (landed || box.enemyOnly) return;
          const topY = box.max.y;
          // Feet must be within a thin slab just above the box top
          if (feetY >= topY - 0.42 && feetY <= topY + 0.08) {
            // Same footprint the collision exemption uses — see centreOverBoxTop().
            if (centreOverBoxTop(box, px, pz)) {
              player.position.y = topY + 1.65;
              player.velocityY = 0;
              player.onGround = true;
              landed = true;
            }
          }
        });
        if (!landed) player.onGround = false;
      } else {
        player.onGround = false;
      }

      // Last line of defence — nothing above should be able to bury the player now, but if
      // anything ever does, walk them back out instead of leaving them trapped.
      unstickFromWalls();

      // ── Fall damage ───────────────────────────────────────────────────────
      // Track the high-water mark of the current airborne stretch and, on touchdown,
      // compare it with the surface actually landed on. Nothing in the base movement set
      // can reach JET_FATAL_FALL_DROP (a jump peaks ~1.2 units), so in practice this only
      // ever fires after a jet climb — which is the point: fly too high and the landing
      // kills you. Routed through damagePlayer so the death screen, sound and shake all run.
      if (!player.onGround) {
        // Airborne: keep the high-water mark of this flight.
        if (player.fallApexY == null || player.position.y > player.fallApexY) {
          player.fallApexY = player.position.y;
        }
        const _drop = player.fallApexY - player.position.y;
        if (_drop > JET_FALL_WARN_DROP && player.velocityY < -6 && player.health > 0) {
          showCombatFeedback(tr("jetFallWarn", "⚠ TOO HIGH"), "#ff4422", 0.2);
        }
      } else if (!_dashing) {
        // Touchdown. A ground dash pins onGround true while the player is still in the air,
        // so the landing is only judged on a frame where no dash is running — otherwise
        // dashing sideways during a fall would "land" you in mid-air and kill you.
        if (player.fallApexY != null && player.health > 0) {
          const drop = player.fallApexY - player.position.y;
          if (drop >= JET_FATAL_FALL_DROP) {
            triggerCamShake(0.9);
            createBlood(player.position.clone());
            lastPlayerHitWorld.copy(player.position);
            showCombatFeedback(tr("jetFallDeath", "IMPACT"), "#ff2222", 1.2);
            damagePlayer(player.maxHealth * 10, null);
          }
        }
        player.fallApexY = null;
      }

      const movingNow = !healLock && (keys.w || keys.a || keys.s || keys.d);
      if (movingNow && player.onGround) {
        state.walkPhase += dt * 10.5;
      }
      const bobTarget = (movingNow && player.onGround)
        ? Math.abs(Math.sin(state.walkPhase)) * 0.026
        : 0;
      state.smoothHeadBob = dampScalar(state.smoothHeadBob, bobTarget, dt, 11);

      camera.position.copy(player.position);
      camera.position.y += state.smoothHeadBob;
      // Crouch is a camera offset, NOT a change to player.position — the physics body keeps
      // its 1.65 eye reference, so ground snapping, fall damage and every wall test that
      // hardcodes 1.65 keep working untouched.
      camera.position.y -= CROUCH_EYE_DROP * crouchAmt;
      camera.rotation.y = player.yaw;
      camera.rotation.x = player.pitch;
      if (MULTIPLAYER) {
        socket.emit("move", {
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
          yaw: player.yaw,
          name: playerName,
          weapon: state.weaponIndex,
          reloading: state.reloading,
          ads: !!state.ads,
          pitch: player.pitch,
          achievement: equippedAchievementIds[0] || "",
          // 0 none / 1 strapping in / 2 flying. Mirrors state.jet.phase exactly, so a player
          // who has not used the harness broadcasts 0 and never shows a pack on anyone's screen.
          jet: state.jet.netState | 0,
          // Crouch depth 0..100, so opponents see the same posture — and the same smaller
          // silhouette — you do. Absent on older clients → 0 → standing.
          crouch: Math.round(crouchAmt * 100),
          // Packed helmet/vest so shooters can compute mitigation before emitting a hit.
          arm: packArmor(),
        });
      }
    }
    function showDeathScreen(killer) {
      if (isPvpCrossfireMap(CURRENT_MAP) && MULTIPLAYER && !ARENA_COOP) {
        resetPvpKillStreak();
      }
      killerEnemy = killer || null;
      deathAnimTime = 0;
      spawnLocalPlayerDeathDissolve(lastPlayerHitWorld);
      crosshairEl.classList.add("hidden");
      if (medKitReticleEl) medKitReticleEl.classList.add("hidden");
      state.mouseDown = false;
      state.ads = false;
      weaponRoot.visible = false;
      setLocalPlayerLights(false);

      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      document.body.classList.add("show-cursor");

      if (!isPvpCrossfireMap(CURRENT_MAP) && killerEnemy) {
        const ex = killerEnemy.group.position.x;
        const ez = killerEnemy.group.position.z;
        deathCamYaw = Math.atan2(ex - player.position.x, ez - player.position.z);
        deathCamPitch = -0.1;
        deathBaseFov = camera.fov;
      }

      deathOverlay.style.display = "block";
      deathFade.style.background = "rgba(0,0,0,0)";
      deathUI.style.display = "none";
      // Always hide revive prompt on entry; it will be shown after the death anim if applicable.
      if (revivePrompt) revivePrompt.style.display = "none";
      if (reviveAdSlot) reviveAdSlot.style.display = "none";

      btnDeathQuit.textContent = "QUIT";
      btnDeathRestart.textContent = MULTIPLAYER ? "RESPAWN" : "RESTART";
      btnDeathSettings.style.display = "";

      if (MULTIPLAYER && isPvpCrossfireMap(CURRENT_MAP)) {
        try {
          socket.emit("playerDown", { id: socket.id });
        } catch (_) {}
      }

      if (isPvpCrossfireMap(CURRENT_MAP)) {
        deathUI.style.display = "flex";
        deathUI.style.opacity = "0.25";
        deathTitle.textContent = "DEFEATED";
        deathTitle.style.color = "#e53e3e";
        deathScore.textContent = "";
        btnDeathRestart.style.display = "";
        deathOverlay.style.pointerEvents = "auto";
        deathUI.addEventListener("mouseenter", () => { deathUI.style.opacity = "1"; });
        deathUI.addEventListener("mouseleave", () => { deathUI.style.opacity = "0.25"; });
        // Crossfire never gets the revive flow.
        reviveFlowActive = false;
      } else {
        deathScore.textContent = `Score: ${state.score}`;
        deathTitle.textContent = "DEFEAT";
        deathTitle.style.color = "#e53e3e";
        btnDeathRestart.style.display = "";
        deathOverlay.style.pointerEvents = "none";
        // Non-crossfire modes: delay the death UI until the revive prompt resolves
        // (or is skipped because the player already revived this life).
        reviveFlowActive = !reviveAdWatchedThisLife;
      }
    }

    function updateDeathAnim(dt) {
      if (player.health > 0 || isPvpCrossfireMap(CURRENT_MAP)) return;
      deathAnimTime += dt;
      const t = Math.min(deathAnimTime / DEATH_ANIM_DURATION, 1);
      const fadeOpacity = t * 0.5;
      deathFade.style.background = `rgba(0,0,0,${fadeOpacity})`;

      if (killerEnemy) {
        player.yaw += (deathCamYaw - player.yaw) * Math.min(1, dt * 4);
        player.pitch += (deathCamPitch - player.pitch) * Math.min(1, dt * 4);
      }
      const zoomFov = deathBaseFov - t * 20;
      camera.fov = Math.max(30, zoomFov);
      camera.updateProjectionMatrix();

      camera.position.copy(player.position);
      camera.rotation.y = player.yaw;
      camera.rotation.x = player.pitch;

      if (t >= 1 && deathUI.style.display === "none") {
        // Revive flow takes priority over the legacy death UI for non-crossfire
        // modes when the player has not already revived this life.
        // GUARD: startReviveCountdown() has never been written. Calling it threw a
        // ReferenceError here — inside animate(), before renderer.render() — so the first
        // death in arena / boss froze the screen with no DEFEAT buttons. The deployed
        // main.min.js predates the revive UI and so never hit it; this guard keeps a
        // rebuilt bundle behaving the same way. Delete the typeof check once the real
        // countdown exists.
        if (
          reviveFlowActive &&
          !isPvpCrossfireMap(CURRENT_MAP) &&
          typeof startReviveCountdown === "function"
        ) {
          startReviveCountdown();
        } else {
          deathUI.style.display = "flex";
          deathOverlay.style.pointerEvents = "auto";
        }
      }
    }

    function hideDeathScreen() {
      clearLocalDeathGhost();
      crosshairEl.classList.remove("hidden");
      if (medKitReticleEl) medKitReticleEl.classList.add("hidden");
      document.body.classList.remove("show-cursor");
      deathOverlay.style.display = "none";
      deathUI.style.display = "none";
      deathFade.style.background = "rgba(0,0,0,0)";
      deathOverlay.style.pointerEvents = "none";
      btnDeathRestart.textContent = "RESTART";
      killerEnemy = null;
      weaponRoot.visible = true;
      refreshLocalPlayerLightsForCurrentState();
      camera.fov = 75;
      camera.updateProjectionMatrix();
    }

    /**
     * Tell the player armour did something. Without this a 32% reduction is completely
     * invisible mid-fight — which is exactly why it read as "armour isn't working".
     */
    let _armorAbsorbAcc = 0;
    let _armorAbsorbShownAt = 0;
    function reportArmorAbsorb(absorbed) {
      if (!(absorbed > 0.5)) return;
      const now = performance.now();
      if (now - _armorAbsorbShownAt > 900) _armorAbsorbAcc = 0;
      _armorAbsorbAcc += absorbed;
      _armorAbsorbShownAt = now;
      showCombatFeedback(
        tr("armorAbsorbed", "ARMOUR −{n}").replace("{n}", String(Math.round(_armorAbsorbAcc))),
        "#7ec8ff", 0.5);
    }

    function damagePlayer(amount, attacker, zone = "body", widx = -1) {
      if (player.health <= 0) return;
      if (performance.now() < player.spawnProtectUntil) return;
      // Armour is applied here so every incoming source funnels through one place.
      const rawAmount = amount;
      amount = applyArmorToDamage(amount, zone, armorHelmet, armorVest, widx);
      reportArmorAbsorb(rawAmount - amount);
      player.health = Math.max(0, player.health - amount);
      player.regenTimer = 0;
      // ── Speed Needle interrupt: boost breaks on hit ──────────────────────
      if (state.speedNeedle.phase === 'boost') {
        state.speedNeedle.phase = 'weak';
        state.speedNeedle.timer = NEEDLE_WEAK_MS;
        showCombatFeedback(tr("needleInterrupted","SPEED INTERRUPTED!"), '#ff4422', 1.6);
      }
      state.flashTimer = 0.14;
      triggerCamShake(0.095);
      playReceivedDamageSound("melee");
      if (attacker && attacker.group) {
        lastPlayerHitWorld.copy(attacker.group.position);
        lastPlayerHitWorld.y = player.position.y + 1.1;
        addHitIndicator(attacker.group.position.x, attacker.group.position.z);
      } else {
        lastPlayerHitWorld.copy(player.position);
        lastPlayerHitWorld.y += 1.1;
      }
      updateHud();
      if (player.health <= 0) {
        showDeathScreen(attacker);
      }
    }

    /** Host sim: hurt local player or send zombie hit to a remote co-op player (server `hit` → `damaged`). */
    function applyCoopZombieDamageToTarget(enemy) {
      if (MULTIPLAYER && ARENA_COOP && (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP)) && enemy.targetId != null) {
        socket.emit("hit", {
          target: enemy.targetId,
          damage: enemy.attackDamage,
          x: enemy.group.position.x,
          z: enemy.group.position.z,
          hitKind: "melee",
        });
      } else {
        damagePlayer(enemy.attackDamage, enemy);
      }
    }

    function showPause() {
      if (player.health <= 0) return;
      if (paused) return;
      paused = true;
      releaseAllInput();
      pauseOverlay.style.display = "flex";
      btnPauseRestart.style.display = isPvpCrossfireMap(CURRENT_MAP) ? "none" : "";
      crosshairEl.classList.add("hidden");
      // Single-player: silence everything — WebAudio buses (SFX + music bus carrying
      // the 19/20/25 Hz arena tone + ambient wind) and the HTML <audio> BGM tracks.
      // Multiplayer is unchanged so other players' voice/SFX from the server stay live.
      if (!MULTIPLAYER) {
        try {
          audioSfx.gain.value = 0;
          audioMusic.gain.value = 0;
        } catch (_) {}
        try { if (arenaBgmAudio && !arenaBgmAudio.paused) arenaBgmAudio.pause(); } catch (_) {}
        try { if (bossBgmAudio && !bossBgmAudio.paused) bossBgmAudio.pause(); } catch (_) {}
      }
    }

    function hidePause() {
      paused = false;
      pauseOverlay.style.display = "none";
      crosshairEl.classList.remove("hidden");
      if (!MULTIPLAYER) {
        // Restore bus gains from current settings and resume whichever in-game BGM
        // is supposed to be playing (no-op if not in arena/boss mode).
        try { applyAudioVolumes(); } catch (_) {}
        try { if (isArenaLikeMap(CURRENT_MAP) && arenaBgmAudio) tryStartArenaBgmPlayback(); } catch (_) {}
        try { if (isBossArenaMap(CURRENT_MAP) && bossBgmAudio) tryStartBossBgmPlayback(); } catch (_) {}
      }
    }

    function setActiveSettingsTab(sectionId) {
      for (const t of document.querySelectorAll(".settings-tab")) {
        t.classList.toggle("active", t.getAttribute("data-scroll-target") === sectionId);
      }
    }

    function updateSettingsTabFromScroll() {
      if (!settingsScroll || settingsModal.style.display !== "flex") return;
      const rootRect = settingsScroll.getBoundingClientRect();
      const probeY = rootRect.top + Math.min(140, rootRect.height * 0.26);
      let chosen = SETTINGS_SECTION_IDS[0];
      for (const id of SETTINGS_SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (probeY >= r.top && probeY <= r.bottom) {
          chosen = id;
          break;
        }
        if (probeY > r.bottom) chosen = id;
      }
      setActiveSettingsTab(chosen);
    }

    // ── Key-binding settings UI ───────────────────────────────────────
    // While capturing, this holds the action id awaiting a new key; null otherwise.
    let _keyBindingCapture = null;

    function renderKeyBindingsUI() {
      const list = document.getElementById("keyBindingsList");
      if (!list) return;
      list.innerHTML = "";
      for (const a of REBINDABLE_ACTIONS) {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px;";
        const name = document.createElement("span");
        name.textContent = a.label;
        name.style.cssText = "font-size:13px;opacity:0.9;";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "settings-action-btn";
        btn.style.cssText = "min-width:104px;padding:6px 12px;text-align:center;";
        if (_keyBindingCapture === a.id) {
          btn.textContent = "PRESS…";
          btn.style.opacity = "0.7";
        } else {
          btn.textContent = codeToLabel(kbCode(a.id));
        }
        btn.addEventListener("click", () => {
          _keyBindingCapture = (_keyBindingCapture === a.id) ? null : a.id;
          renderKeyBindingsUI();
        });
        row.appendChild(name);
        row.appendChild(btn);
        list.appendChild(row);
      }
    }

    // Capture the next key while rebinding. Capture phase → runs before the game's
    // own keydown handler, and stopImmediatePropagation prevents the pressed key
    // from also firing as a game action (or closing the modal on Esc).
    document.addEventListener("keydown", (e) => {
      if (!_keyBindingCapture) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const action = _keyBindingCapture;
      _keyBindingCapture = null;
      if (e.key !== "Escape") {
        const code = e.code || null;
        if (code) {
          gameSettings.keyBindings[action] = code;
          saveGameSettings();
        }
      }
      renderKeyBindingsUI();
    }, true);

    {
      const btnResetKB = document.getElementById("btnResetKeyBindings");
      if (btnResetKB) {
        btnResetKB.addEventListener("click", () => {
          gameSettings.keyBindings = defaultKeyBindings();
          _keyBindingCapture = null;
          saveGameSettings();
          renderKeyBindingsUI();
        });
      }
    }

    function syncSettingsUI() {
      rngMasterVol.value = String(Math.round(gameSettings.masterVolume * 100));
      rngMusicVol.value = String(Math.round(gameSettings.musicVolume * 100));
      rngSfxVol.value = String(Math.round(gameSettings.soundVolume * 100));
      lblMasterVol.textContent = `${rngMasterVol.value}%`;
      lblMusicVol.textContent = `${rngMusicVol.value}%`;
      lblSfxVol.textContent = `${rngSfxVol.value}%`;
      if (rngLookSens && lblLookSens) {
        const sv = clampSens(gameSettings.sensitivity);
        gameSettings.sensitivity = sv;
        rngLookSens.value = String(sv);
        lblLookSens.textContent = sv.toFixed(2);
      }
      if (rngAdsLookSens && lblAdsLookSens) {
        const am = clampAdsSensMul(gameSettings.adsSensMultiplier);
        gameSettings.adsSensMultiplier = am;
        rngAdsLookSens.value = String(am);
        lblAdsLookSens.textContent = `${am.toFixed(2)}×`;
      }
      syncSensReadout();
      qualityLabel.textContent = QUALITY_LABELS[gameSettings.qualityIndex] || "REGULAR";
      textureLabel.textContent = gameSettings.texturesOn ? "ON" : "OFF";
      const rdi = THREE.MathUtils.clamp(
        gameSettings.renderDistanceIndex | 0,
        0,
        RENDER_DISTANCE_LEVELS.length - 1
      );
      renderDistanceLabel.textContent = RENDER_DISTANCE_LEVELS[rdi].label;
      languageValue.textContent = LANGUAGE_LABELS[gameSettings.language] || "ENGLISH";
      const skipClickVal = document.getElementById("skipClickToPlayValue");
      if (skipClickVal) skipClickVal.textContent = gameSettings.skipClickToPlay ? "ON" : "OFF";
      renderKeyBindingsUI();
      applyLanguageUI();
    }

    function openSettingsModal() {
      buildSensitivityControls();
      settingsModalOpen = true;
      syncSettingsUI();
      settingsModal.style.display = "flex";
      if (settingsScroll) settingsScroll.scrollTop = 0;
      setActiveSettingsTab("settingsSectionAudio");
      document.exitPointerLock();
    }

    function closeSettingsModal() {
      settingsModalOpen = false;
      _keyBindingCapture = null;
      settingsModal.style.display = "none";
    }

    // ── Nav grid + BFS flow field (shared by all zombies) ──
    const NAV_CELL = 2.0;
    const NAV_RADIUS = 0.5;
    let navGrid = null;
    let navMinX = 0, navMinZ = 0, navCols = 0, navRows = 0;
    let flowDirX = null, flowDirZ = null;
    let flowPlayerC = -1, flowPlayerR = -1;
    let _flowDistBuf = null;
    let _flowDistBufLen = 0;

    function buildNavGrid() {
      if (isArenaLikeMap(CURRENT_MAP)) {
        mazeNavAnchorCx = null;
        mazeNavAnchorCz = null;
        rebuildMazeNavGrid(
          Math.floor(player.position.x / MAZE_CHUNK_WORLD),
          Math.floor(player.position.z / MAZE_CHUNK_WORLD)
        );
        return;
      }
      const S = isBossArenaMap(CURRENT_MAP) ? 50 : isPvpCrossfireMap(CURRENT_MAP) ? 45 : 42;
      navMinX = -S;
      navMinZ = -S;
      navCols = Math.ceil((S * 2) / NAV_CELL);
      navRows = Math.ceil((S * 2) / NAV_CELL);
      navGrid = new Uint8Array(navCols * navRows);
      for (let r = 0; r < navRows; r++) {
        for (let c = 0; c < navCols; c++) {
          const wx = navMinX + (c + 0.5) * NAV_CELL;
          const wz = navMinZ + (r + 0.5) * NAV_CELL;
          navGrid[r * navCols + c] = enemyCollidesWall(wx, wz, NAV_RADIUS) ? 1 : 0;
        }
      }
      const total = navCols * navRows;
      flowDirX = new Float32Array(total);
      flowDirZ = new Float32Array(total);
      flowPlayerC = -1;
      flowPlayerR = -1;
    }

    function worldToGrid(x, z) {
      const c = ((x - navMinX) / NAV_CELL) | 0;
      const r = ((z - navMinZ) / NAV_CELL) | 0;
      return [c, r];
    }

    function rebuildFlowField() {
      if (!navGrid) return;
      const pc = Math.min(navCols - 1, Math.max(0, ((player.position.x - navMinX) / NAV_CELL) | 0));
      const pr = Math.min(navRows - 1, Math.max(0, ((player.position.z - navMinZ) / NAV_CELL) | 0));
      // Rebuild only every ~3 nav cells (~6 units) of movement — a full BFS is a few ms,
      // so halving/tripling its frequency smooths movement without stale pathing (the
      // player's cell only moves a few units between rebuilds; enemies steer fine).
      if (Math.abs(pc - flowPlayerC) + Math.abs(pr - flowPlayerR) < 3) return;
      flowPlayerC = pc;
      flowPlayerR = pr;

      const total = navCols * navRows;
      if (!_flowDistBuf || _flowDistBufLen < total) {
        _flowDistBuf = new Uint16Array(total);
        _flowDistBufLen = total;
      }
      const dist = _flowDistBuf;
      dist.fill(65535, 0, total);
      const goalIdx = pr * navCols + pc;
      dist[goalIdx] = 0;

      const queue = [goalIdx];
      let head = 0;
      while (head < queue.length) {
        const idx = queue[head++];
        const cr = (idx / navCols) | 0;
        const cc = idx % navCols;
        const nd = dist[idx] + 1;
        for (let dr = -1; dr <= 1; dr++) {
          const nr = cr + dr;
          if (nr < 0 || nr >= navRows) continue;
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nc = cc + dc;
            if (nc < 0 || nc >= navCols) continue;
            const nIdx = nr * navCols + nc;
            if (navGrid[nIdx]) continue;
            if (dr !== 0 && dc !== 0) {
              if (navGrid[cr * navCols + nc] || navGrid[nr * navCols + cc]) continue;
            }
            if (nd < dist[nIdx]) {
              dist[nIdx] = nd;
              queue.push(nIdx);
            }
          }
        }
      }

      for (let r = 0; r < navRows; r++) {
        for (let c = 0; c < navCols; c++) {
          const idx = r * navCols + c;
          if (navGrid[idx]) continue;
          let bestD = dist[idx];
          let bx = 0, bz = 0;
          for (let dr = -1; dr <= 1; dr++) {
            const nr = r + dr;
            if (nr < 0 || nr >= navRows) continue;
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nc = c + dc;
              if (nc < 0 || nc >= navCols) continue;
              const nIdx = nr * navCols + nc;
              if (navGrid[nIdx]) continue;
              if (dr !== 0 && dc !== 0) {
                if (navGrid[r * navCols + nc] || navGrid[nr * navCols + c]) continue;
              }
              if (dist[nIdx] < bestD) {
                bestD = dist[nIdx];
                bx = dc;
                bz = dr;
              }
            }
          }
          if (bx !== 0 || bz !== 0) {
            const len = Math.sqrt(bx * bx + bz * bz);
            flowDirX[idx] = bx / len;
            flowDirZ[idx] = bz / len;
          } else {
            flowDirX[idx] = 0;
            flowDirZ[idx] = 0;
          }
        }
      }
    }

    function getFlowDirection(ex, ez) {
      if (!flowDirX) return null;
      const c = Math.min(navCols - 1, Math.max(0, ((ex - navMinX) / NAV_CELL) | 0));
      const r = Math.min(navRows - 1, Math.max(0, ((ez - navMinZ) / NAV_CELL) | 0));
      // If the cell is a wall (rare after push-out, but possible during edge cases) or has
      // no flow (goal cell), look at the 8 neighbors and pick the first with non-zero flow.
      // This keeps bosses/zombies pathing smoothly even when spawned right next to a wall.
      const tryCell = (cc, rr) => {
        const idx = rr * navCols + cc;
        const fx = flowDirX[idx];
        const fz = flowDirZ[idx];
        if (fx === 0 && fz === 0) return null;
        return { x: fx, z: fz };
      };
      const direct = tryCell(c, r);
      if (direct) return direct;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nc = c + dc, nr = r + dr;
          if (nc < 0 || nc >= navCols || nr < 0 || nr >= navRows) continue;
          const n = tryCell(nc, nr);
          if (n) return n;
        }
      }
      return null;
    }

    // ── Zombie vision / awareness (throttled, 360° FOV) ──
    const LOSE_RATIO = 0.10;
    const LOSE_TIME = 15.0;
    const RETARGET_INTERVAL = 2.0;
    const VIS_OFFSETS = [[0, 1.8], [0, 1.1], [0, 0.5], [0.28, 1.35]];
    const _visOrigin = new THREE.Vector3();
    const _visDir = new THREE.Vector3();
    const _enemyShotDir = new THREE.Vector3();
    const _tracerEnd = new THREE.Vector3();
    const _visRay = new THREE.Raycaster();
    let visFrameCounter = 0;

    function canSeePoint(ex, ey, ez, px, py, pz, maxDist = 28) {
      _visOrigin.set(ex, ey, ez);
      _visDir.set(px - ex, py - ey, pz - ez);
      const d = _visDir.length();
      if (d < 0.1) return true;
      if (d > maxDist) return false;
      _visDir.multiplyScalar(1 / d);
      _visRay.set(_visOrigin, _visDir);
      _visRay.near = 0;
      _visRay.far = d;
      return _visRay.intersectObjects(wallMeshes, false).length === 0;
    }

    function clearLosToTarget(ex, ez, tx, tz, ty = 1.65) {
      return canSeePoint(ex, 1.6, ez, tx, ty, tz);
    }

    function computeVisibility(ex, ez, px, pz) {
      const ey = 1.6;
      let visible = 0;
      for (let i = 0; i < VIS_OFFSETS.length; i++) {
        const oy = VIS_OFFSETS[i][1];
        if (canSeePoint(ex, ey, ez, px, oy, pz)) visible++;
      }
      return visible / VIS_OFFSETS.length;
    }

    function getEnemyTarget(enemy) {
      if (enemy.targetId) {
        const rp = remotePlayers.get(enemy.targetId);
        if (rp && rp.group.visible) return { x: rp.x, y: 1.65, z: rp.z };
        enemy.targetId = null;
      }
      return { x: player.position.x, y: player.position.y, z: player.position.z };
    }

    function retargetEnemy(enemy) {
      if (!MULTIPLAYER) return;
      const ex = enemy.group.position.x;
      const ez = enemy.group.position.z;
      const currentVis = computeVisibility(ex, ez,
        enemy.targetId ? (remotePlayers.get(enemy.targetId)?.x ?? player.position.x) : player.position.x,
        enemy.targetId ? (remotePlayers.get(enemy.targetId)?.z ?? player.position.z) : player.position.z
      );

      if (currentVis >= LOSE_RATIO) return;

      let bestId = null;
      let bestAngleDiff = Infinity;
      const moveYaw = enemy.moveYaw;

      const candidates = [];
      candidates.push({ id: null, x: player.position.x, z: player.position.z });
      for (const [rpId, rp] of remotePlayers) {
        if (rp.group.visible) candidates.push({ id: rpId, x: rp.x, z: rp.z });
      }

      for (const c of candidates) {
        const vis = computeVisibility(ex, ez, c.x, c.z);
        if (vis <= 0) continue;
        const angle = Math.atan2(c.x - ex, c.z - ez);
        let diff = angle - moveYaw;
        if (diff > Math.PI) diff -= Math.PI * 2;
        else if (diff < -Math.PI) diff += Math.PI * 2;
        const absDiff = Math.abs(diff);
        if (absDiff < bestAngleDiff) {
          bestAngleDiff = absDiff;
          bestId = c.id;
        }
      }

      if (bestAngleDiff < Infinity) {
        enemy.targetId = bestId;
      }
    }

    function updateAwareness(enemy, dt) {
      if (enemy.isBoss) {
        enemy.aware = true;
        enemy.hiddenTimer = 0;
        return;
      }
      const target = getEnemyTarget(enemy);
      const ex = enemy.group.position.x;
      const ez = enemy.group.position.z;
      const ratio = computeVisibility(ex, ez, target.x, target.z);

      if (!enemy.aware) {
        if (ratio > 0) {
          enemy.aware = true;
          enemy.hiddenTimer = 0;
        }
      } else {
        if (ratio < LOSE_RATIO) {
          enemy.hiddenTimer += dt;
          if (enemy.hiddenTimer >= LOSE_TIME) {
            enemy.aware = false;
            enemy.hiddenTimer = 0;
            enemy.targetId = null;
          }
        } else {
          enemy.hiddenTimer = 0;
        }
      }
    }

    function applyZombieSyncPayload(data) {
      if (!gameWorldReady) return;
      if (!data || !Array.isArray(data.zombies)) return;
      if (typeof data.score === "number") state.score = data.score;
      // v33: spawn missing bosses on demand. Host may have BOSS_FIGHT_COUNT > joiner's local default
      // (1/2/3) or HELL mode; the joiner previously dropped sync rows for unknown netIndex, leaving
      // bosses invisible. Now we materialize them from the sync payload itself.
      const isBossMap = isBossArenaMap(CURRENT_MAP);
      for (const z of data.zombies) {
        const ei = z.i | 0;
        if (ei < 0) continue;
        if (ei >= state.enemies.length) {
          if (isBossMap && z.bm != null && typeof z.x === "number" && typeof z.z === "number") {
            const isHell = !!z.hell;
            const newBoss = makeHormoneZombie(z.x, z.z, isHell);
            newBoss.netIndex = ei;
            // Pad state.enemies up to ei so future indexed access works (sparse-safe).
            while (state.enemies.length < ei) {
              state.enemies.push({ alive: false, hp: 0, group: new THREE.Group(), netIndex: state.enemies.length, isBoss: false, _placeholder: true });
            }
            state.enemies.push(newBoss);
            drawEnemyHp(newBoss);
          } else {
            continue;
          }
        }
        const e = state.enemies[ei];
        if (!e || e._placeholder) continue;
        if (typeof z.x === "number") e.group.position.x = z.x;
        if (typeof z.z === "number") e.group.position.z = z.z;
        if (typeof z.y === "number") {
          e.visYaw = z.y;
          e.facingYaw = z.y;
          e.group.rotation.y = z.y;
        }
        if (typeof z.hp === "number") e.hp = z.hp;
        if (typeof z.a === "number") e.alive = z.a !== 0;
        if (typeof z.rt === "number") e.respawnTimer = z.rt;
        if (z.bm && e.isBoss) e.bossMode = z.bm;
        if (e.alive) e.dissolveTimer = 0;
        e.group.visible = e.alive;
        drawEnemyHp(e);
      }
      updateHud();
    }

    function spawnBossProjectile(ox, oy, oz, dx, dy, dz, damage) {
      const geo = new THREE.SphereGeometry(0.45, 10, 8);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff4422 });
      const mesh = new THREE.Mesh(geo, mat);
      const glow = new THREE.PointLight(0xff2200, 3, 6);
      mesh.add(glow);
      mesh.position.set(ox, oy, oz);
      scene.add(mesh);
      const spd = 22;
      bossProjectiles.push({
        mesh,
        velocity: new THREE.Vector3(dx * spd, dy * spd, dz * spd),
        life: 5,
        damage: damage || 8,
        hp: 60
      });
    }

    function destroyBossProjectile(idx) {
      const bp = bossProjectiles[idx];
      scene.remove(bp.mesh);
      bp.mesh.geometry.dispose();
      bp.mesh.material.dispose();
      bossProjectiles.splice(idx, 1);
    }

    /**
     * Boss spit-ball flight + hit test.
     *
     * Two separate bugs made these balls unable to ever hit the player:
     *   1. Homing steered at `player.position.y + 0.8` while the hit test measured to
     *      `player.position` — the EYE, 1.65 above the feet. The ball converged on a point
     *      0.8 ABOVE the eye, so its closest approach was ~0.8 and the 0.6 radius could
     *      never trigger. Both now use the same chest point.
     *   2. A point-vs-point test each frame tunnels: at 22 u/s with dt capped at 0.033 the
     *      ball moves 0.73 per step — further than the hit radius — so on a slow frame it
     *      stepped straight through the player. The test is now swept along the segment
     *      actually travelled this frame.
     * Damage also went straight to `player.health`, skipping spawn protection, the hit
     * indicator, the shake, the sound and — worst — `showDeathScreen()`, so a lethal ball
     * left the player at 0 HP with no death UI. It routes through damagePlayer() now.
     */
    const BOSS_BALL_HIT_RADIUS = 0.85;
    const _bbSeg = new THREE.Vector3();
    const _bbBody = new THREE.Vector3();
    const _bbPrev = new THREE.Vector3();

    /** Chest point of the local player — the one reference both homing and hits share. */
    function playerBodyCenter(out) {
      return out.set(player.position.x, player.position.y - 0.45, player.position.z);
    }

    function updateBossProjectiles(dt) {
      for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const bp = bossProjectiles[i];
        playerBodyCenter(_bbBody);
        const toPx = _bbBody.x - bp.mesh.position.x;
        const toPy = _bbBody.y - bp.mesh.position.y;
        const toPz = _bbBody.z - bp.mesh.position.z;
        const toLen = Math.sqrt(toPx * toPx + toPy * toPy + toPz * toPz);
        if (toLen > 0.1) {
          const curSpd = bp.velocity.length();
          bp.velocity.set(toPx / toLen * curSpd, toPy / toLen * curSpd, toPz / toLen * curSpd);
        }
        _bbPrev.copy(bp.mesh.position);
        bp.mesh.position.x += bp.velocity.x * dt;
        bp.mesh.position.y += bp.velocity.y * dt;
        bp.mesh.position.z += bp.velocity.z * dt;
        bp.life -= dt;
        if (bp.life <= 0 || bp.hp <= 0) {
          destroyBossProjectile(i);
          continue;
        }
        if (player.health > 0) {
          // Closest approach of the segment travelled this frame to the chest point.
          playerBodyCenter(_bbBody);
          _bbSeg.subVectors(bp.mesh.position, _bbPrev);
          const segLen2 = _bbSeg.lengthSq();
          let cx = bp.mesh.position.x;
          let cy = bp.mesh.position.y;
          let cz = bp.mesh.position.z;
          if (segLen2 > 1e-8) {
            const t = THREE.MathUtils.clamp(
              ((_bbBody.x - _bbPrev.x) * _bbSeg.x +
                (_bbBody.y - _bbPrev.y) * _bbSeg.y +
                (_bbBody.z - _bbPrev.z) * _bbSeg.z) / segLen2,
              0,
              1
            );
            cx = _bbPrev.x + _bbSeg.x * t;
            cy = _bbPrev.y + _bbSeg.y * t;
            cz = _bbPrev.z + _bbSeg.z * t;
          }
          const pdx = cx - _bbBody.x;
          const pdy = cy - _bbBody.y;
          const pdz = cz - _bbBody.z;
          if (pdx * pdx + pdy * pdy + pdz * pdz < BOSS_BALL_HIT_RADIUS * BOSS_BALL_HIT_RADIUS) {
            createSparks(bp.mesh.position.clone(), 0xff5522);
            state.flashTimer = 0.25;
            damagePlayer(bp.damage, null);
            destroyBossProjectile(i);
            continue;
          }
        }
      }
    }

    function updateEnemies(dt) {
      if (!gameWorldReady) return;
      // Zombies must not move or attack until the player is officially in the
      // game (they've clicked "click anywhere" → pointer-locked, or have the
      // skip-click-to-play setting on). The world is loaded and ready before
      // the click hint is dismissed, so gameWorldReady alone isn't enough.
      if (!controlsInputReady()) return;
      if (player.health > 0 && player.health < player.maxHealth) {
        player.regenTimer += dt;
        if (player.regenTimer >= 5.0) {
          player.regenTimer = 0;
          player.health = Math.min(player.maxHealth, player.health + 1);
          updateHud();
        }
      }

      if (MULTIPLAYER && ARENA_COOP && (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP)) && !ZOMBIE_AUTHORITY) {
        return;
      }

      visFrameCounter++;
      if ((visFrameCounter % 16) === 0) {
        // Rebuild the BFS flow field toward the player. rebuildFlowField()
        // self-guards: it returns immediately unless the player has moved to a
        // new nav cell, so this is cheap on most frames.
        //
        // NOTE (v97 fix): the previous incremental-rebuild branch here referenced
        // an out-of-scope `dist` array (ReferenceError thrown every 16th frame →
        // renderer.render() skipped → the periodic boss-arena stutter), and the
        // working branch was gated behind `flowPlayerC >= 0`, a value only ever
        // set *inside* rebuildFlowField — a deadlock that meant the flow field
        // never built and enemy pathfinding silently did nothing.
        rebuildFlowField();
      }

      // Skip AI updates for enemies far from the player — they're not visible and
      // their path/attack decisions don't matter until the player gets close.
      // Halves the per-frame cost on the zombie arena where there are 30+ enemies.
      const AI_SKIP_DIST_SQ = 60 * 60; // ~60 units
      const px = player.position.x, pz = player.position.z;
      // Run heavy AI logic (path/attack decisions) only every other frame for non-boss
      // enemies. Position updates still run every frame so movement looks smooth. The
      // skipped frames just don't recalculate path/attack decisions; the cached
      // values from the last tick carry forward.
      const aiTickFrame = (visFrameCounter & 1) === 0;

      for (let ei = 0; ei < state.enemies.length; ei++) {
        const enemy = state.enemies[ei];
        // Training targets are owned entirely by updateTrainingDummies(). makeTrainingDummy()
        // already strips their AI state for exactly this reason, but the AI loop still ran
        // over them, and the two systems then fought over the same model every frame:
        //   • the boss branch drove torsoRoot / arms / legs / position.y while
        //     updateTrainingDummies wrote position.y and rotation.y — that is the mangled,
        //     back-bent pose on the boss target;
        //   • the distance-cull line reset group.visible to true, undoing the visible=false
        //     set on death — that is why a killed target stood there instead of dissolving.
        if (enemy.trainingDummy) continue;
        // Distance gate: skip AI for enemies far from the player. Boss always runs
        // (it's the only enemy and must react globally). For zombies, only run the
        // heavy AI logic when the enemy is within ~60 units of the player.
        if (!enemy.isBoss) {
          const edx = enemy.group.position.x - px;
          const edz = enemy.group.position.z - pz;
          const d2 = edx * edx + edz * edz;
          // Far zombies are >90% fogged (AI already frozen at AI_SKIP_DIST_SQ) — hide
          // them so we don't keep drawing + skinning fully-fogged humanoids each frame.
          const cullDistSq = scene.fog ? (scene.fog.far * 0.9) * (scene.fog.far * 0.9) : d2;
          const visible = enemy.alive && d2 < cullDistSq;
          if (enemy.group.visible !== visible) enemy.group.visible = visible;
          // Only LIVE far zombies may be skipped. The old code skipped dead ones too, so a
          // zombie that died more than 60 units away never ran its respawn countdown and
          // stayed dead forever — over a long run the arena quietly drained itself empty.
          // Respawn bookkeeping is a handful of arithmetic ops; it can run at any range.
          if (d2 > AI_SKIP_DIST_SQ && enemy.alive) continue;
        }
        if (!enemy.alive) {
          if (enemy._bossDeathHandled !== true && (enemy.summonedBy || enemy.isBoss)) {
            enemy._bossDeathHandled = true;
            if (enemy.summonedBy && enemy.summonedBy.summonCount > 0) {
              enemy.summonedBy.summonCount--;
            }
            if (enemy.isBoss) {
              enemy._bossDeathTime = performance.now();
            }
          }
          if (enemy.isBoss) {
            if (enemy._bossDeathTime) {
              const elapsed = (performance.now() - enemy._bossDeathTime) / 1000;
              if (elapsed >= 5) {
                for (const m of state.enemies) {
                  if (m.alive && !m.isBoss && m._summonedByBoss === enemy) {
                    m.alive = false;
                    m.group.visible = false;
                    m.dissolveTimer = DISSOLVE_DURATION + 0.12;
                    spawnHumanoidDissolve(m.group, m.group.position);
                  }
                }
                enemy._bossDeathTime = null;
              }
            }
            continue;
          }
          enemy.respawnTimer -= dt;
          if (enemy.respawnTimer <= 0) {
            enemy.alive = true;
            enemy._bossDeathHandled = false;
            enemy.dissolveTimer = 0;
            enemy.hp = enemy.maxHp;
            enemy._hpBarRatio = -1;
            enemy.group.visible = true;
            const sp = findSpawnPosition(SPAWN_MIN_DIST_BASE);
            enemy.group.position.set(sp.x, 0, sp.z);
            enemy.aware = false;
            enemy.hiddenTimer = 0;
            enemy.targetId = null;
            enemy.retargetTimer = 0;
            enemy.rangedLosAcquireTimer = 0;
            enemy.slowUntil = 0;
            enemy.facingYaw = Math.random() * Math.PI * 2;
            enemy.visYaw = enemy.facingYaw;
            enemy.armLV = -0.2;
            enemy.armRV = -0.2;
            enemy.legLV = 0;
            enemy.legRV = 0;
            drawEnemyHp(enemy);
          }
          continue;
        }

        if (enemy.isBoss) {
          const bDx = player.position.x - enemy.group.position.x;
          const bDz = player.position.z - enemy.group.position.z;
          enemy.facingYaw = Math.atan2(bDx, bDz);

          if (!enemy._roarTimer) enemy._roarTimer = 3 + Math.random() * 5;
          enemy._roarTimer -= dt;
          if (enemy._roarTimer <= 0) {
            enemy._roarTimer = 6 + Math.random() * 8;
            playBossRoarSfx();
          }

          enemy.bossModeSwitchTimer -= dt;
          if (enemy.bossModeSwitchTimer <= 0) {
            enemy.bossModeSwitchTimer = 5;
            enemy.bossAnimState = "modeSwitch";
            playBossRoarSfx();
            enemy.bossAnimTimer = 0;
            const hpRatio = enemy.hp / enemy.maxHp;
            const hell = !!enemy.isHellBoss;
            // Boss mode switch restricted to tank <-> gunner (no speed mode) —
            // speed needles / dash removed per user request. Boss fights as a
            // melee bruiser that periodically switches to a ranged gunner.
            if (enemy.bossMode === "tank") {
              enemy.bossMode = "gunner";
              enemy.maxHp = enemy.baseGunnerHp;
              enemy.speed = hell ? 6.175 : 5.85;
              enemy.attackDamage = hell ? 60 : 12;
              enemy.attackCooldown = 1.2;
              enemy.ranged = true;
              enemy.rangeDistance = 20;
            } else {
              enemy.bossMode = "tank";
              enemy.maxHp = enemy.baseTankHp;
              enemy.speed = hell ? 6.175 : 5.85;
              enemy.attackDamage = hell ? 250 : 50;
              enemy.attackCooldown = 1.2;
              enemy.ranged = false;
            }
            enemy.hp = Math.max(1, Math.round(hpRatio * enemy.maxHp));
            enemy._hpBarRatio = -1;
            drawEnemyHp(enemy);
          }

          if (enemy.isHellBoss) {
            if (!enemy._hellSummonStage) enemy._hellSummonStage = 0;
            const hpPct = enemy.hp / enemy.maxHp;
            const stage = Math.floor((1 - hpPct) * 10);
            if (stage > enemy._hellSummonStage && hpPct > 0.10) {
              const wavesToSpawn = stage - enemy._hellSummonStage;
              enemy._hellSummonStage = stage;
              enemy.bossAnimState = "summoning";
              enemy.bossAnimTimer = 0;
              playBossRoarSfx();
              const types = ["normal", "fast", "gunner", "tank"];
              for (let w = 0; w < wavesToSpawn; w++) {
                for (let si = 0; si < 10; si++) {
                  const angle = (si / 10) * Math.PI * 2 + w * 0.5;
                  const rad = 5 + Math.random() * 3;
                  const sx = enemy.group.position.x + Math.cos(angle) * rad;
                  const sz = enemy.group.position.z + Math.sin(angle) * rad;
                  const t = types[Math.floor(Math.random() * types.length)];
                  const minion = makeZombie(sx, sz, t);
                  minion.netIndex = state.enemies.length;
                  minion.aware = true;
                  minion._summonedByBoss = enemy;
                  drawEnemyHp(minion);
                  state.enemies.push(minion);
                }
              }
            }
            if (!enemy._hellBossSummoned && hpPct <= 0.10) {
              enemy._hellBossSummoned = true;
              enemy.bossAnimState = "summoning";
              enemy.bossAnimTimer = 0;
              playBossRoarSfx();
              for (let si = 0; si < 3; si++) {
                const angle = (si / 3) * Math.PI * 2;
                const sx = enemy.group.position.x + Math.cos(angle) * 8;
                const sz = enemy.group.position.z + Math.sin(angle) * 8;
                const miniBoss = makeHormoneZombie(sx, sz, false);
                miniBoss.netIndex = state.enemies.length;
                miniBoss.aware = true;
                drawEnemyHp(miniBoss);
                state.enemies.push(miniBoss);
              }
            }
          } else if (!enemy.summonTriggered && enemy.hp <= enemy.maxHp * 0.5) {
            enemy.summonTriggered = true;
            enemy.bossAnimState = "summoning";
            enemy.bossAnimTimer = 0;
            playBossRoarSfx();
            for (let si = 0; si < 2; si++) {
              const sx = enemy.group.position.x + (si === 0 ? -3 : 3);
              const sz = enemy.group.position.z + (Math.random() - 0.5) * 4;
              const minion = makeZombie(sx, sz, "normal");
              minion.netIndex = state.enemies.length;
              minion.summonedBy = enemy;
              minion._summonedByBoss = enemy;
              drawEnemyHp(minion);
              state.enemies.push(minion);
              enemy.summonCount++;
            }
          }
        }

        const target = getEnemyTarget(enemy);
        // Hit-direction aggro override: if the zombie was recently hit but currently has
        // no LOS to the player (e.g. the bullet came through a wall), walk in the bullet
        // direction toward where the shooter came from. As soon as LOS opens, the
        // zombie targets the player normally.
        let moveX = target.x, moveZ = target.z;
        const useHitDir =
          !enemy.isBoss &&
          enemy.aware &&
          enemy.lastHitDirX !== undefined &&
          performance.now() - (enemy.lastHitTime || 0) < 6000 &&
          (enemy._lastLosClear === false || enemy._lastLosClear === undefined);
        if (useHitDir) {
          moveX = enemy.group.position.x + enemy.lastHitDirX * 10;
          moveZ = enemy.group.position.z + enemy.lastHitDirZ * 10;
        }
        const dx = moveX - enemy.group.position.x;
        const dz = moveZ - enemy.group.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        const isSlowed =
          enemy.slowUntil && performance.now() < enemy.slowUntil;

        if (!isSlowed && (visFrameCounter + ei) % 8 === 0) {
          updateAwareness(enemy, dt * 8);
        }

        enemy.retargetTimer += dt;
        if (!isSlowed && enemy.aware && enemy.retargetTimer >= RETARGET_INTERVAL) {
          enemy.retargetTimer = 0;
          retargetEnemy(enemy);
        }

        enemy.attackCooldownTimer -= dt;

        if (isSlowed) {
          enemy.aware = false;
          enemy.targetId = null;
          enemy.rangedLosAcquireTimer = 0;
          enemy.moving = false;
          if (enemy.attackCooldownTimer < 0.3) enemy.attackCooldownTimer = 0.3;
          continue;
        }

        if (enemy.aware) {
          enemy.facingYaw = Math.atan2(dx, dz);

          if (enemy.isBoss) {
            // Boss dash/sprint ability removed (per user request).
            enemy._bossSprinting = false;
            enemy._sprintCd = 0;
          }

          const shouldStopForRanged = enemy.ranged && dist < enemy.rangeDistance && dist > 4.8;

          // Boss can only walk when the current animation state allows it. Roaring /
          // summoning / mode-switching / attacking / quaking all lock the boss in
          // place — it can't switch to the walking animation until the active
          // animation finishes and returns to "idle".
          const walkingAnimAvailable = !enemy.bossAnimState || enemy.bossAnimState === "idle";

          if (!shouldStopForRanged && dist > 1.8 && walkingAnimAvailable) {
            let moveSpeed = enemy.speed;
            if (enemy._bossSprinting) {
              moveSpeed = enemy.isHellBoss ? 19.5 : 16.25;
            }
            const totalStep = moveSpeed * dt;
            const dLen = Math.sqrt(dx * dx + dz * dz);

            // ── Boss 专用碰撞半径（体型 2×，需要更大避障半径）──────────────
            const BOSS_CR = enemy.isBoss ? 0.68 : 0.34;

            // ── 主动推出墙体：如 boss 已经陷入几何体，立即弹出 ───────────────
            if (enemy.isBoss && enemyCollidesWall(enemy.group.position.x, enemy.group.position.z, BOSS_CR)) {
              let pushed = false;
              outerPush: for (let pd = 0.15; pd <= 2.4; pd += 0.15) {
                for (let pa = 0; pa < 16; pa++) {
                  const ang = pa * Math.PI / 8 + (pd * 0.3);
                  const tx = enemy.group.position.x + Math.sin(ang) * pd;
                  const tz = enemy.group.position.z + Math.cos(ang) * pd;
                  if (!enemyCollidesWall(tx, tz, BOSS_CR)) {
                    enemy.group.position.x = tx;
                    enemy.group.position.z = tz;
                    pushed = true;
                    break outerPush;
                  }
                }
              }
            }

            let dirX = 0, dirZ = 0;
            const flow = getFlowDirection(enemy.group.position.x, enemy.group.position.z);

            // LOS 检测（boss 每帧，普通僵尸每 4 帧）。canSeePoint ray-casts against every
            // wall mesh — at 32 zombies in the arena, %2 was 16 ray-casts/frame and
            // %4 halves it to 8, which was the main perf win for arena-mode stalls.
            let losClear = enemy._lastLosClear;
            if (losClear === undefined || (enemy.isBoss ? true : (visFrameCounter + ei) % 8 === 0)) {
              losClear = clearLosToTarget(
                enemy.group.position.x,
                enemy.group.position.z,
                target.x,
                target.z,
                target.y ?? 1.65
              );
              enemy._lastLosClear = losClear;
            }

            if (enemy.isBoss) {
              // ── Boss 走迷宫导航：永远以流场为主，LOS 清晰时混入直冲分量 ──
              // 流场 BFS 路径绕过柱子/墙角；混合 30% 直冲保持追击感。
              if (flow && dLen > 0.02) {
                if (losClear) {
                  // 30% 直冲 + 70% 流场
                  const t = 0.30;
                  const bx = (dx / dLen) * t + flow.x * (1 - t);
                  const bz = (dz / dLen) * t + flow.z * (1 - t);
                  const bl = Math.sqrt(bx * bx + bz * bz);
                  dirX = bl > 0.01 ? bx / bl : flow.x;
                  dirZ = bl > 0.01 ? bz / bl : flow.z;
                } else {
                  // 完全跟随流场
                  dirX = flow.x; dirZ = flow.z;
                }
              } else if (dLen > 0.02) {
                dirX = dx / dLen; dirZ = dz / dLen;
              }
            } else {
              // 普通僵尸：原有逻辑
              // Gunner kite: when the player closes inside the trigger distance,
              // the gunner slowly backs away (pure retreat + a small perpendicular
              // strafe) instead of chasing. Skipped if LOS is broken — a blind
              // gunner should keep navigating the maze via the flow field.
              let gunnerKiting = false;
              if (enemy.type === "gunner" && dLen > 0.02) {
                const inKiteBand = enemy._kiting
                  ? dLen < GUNNER_KITE_RELEASE_DIST
                  : dLen < GUNNER_KITE_TRIGGER_DIST;
                if (inKiteBand && losClear) {
                  // Deterministic per-enemy strafe sign (set once, never flips —
                  // prevents the gunner from oscillating as it bumps the boundary).
                  if (enemy._kiteStrafeSign === undefined) {
                    enemy._kiteStrafeSign = Math.random() < 0.5 ? -1 : 1;
                  }
                  const perpX = -dz / dLen;
                  const perpZ = dx / dLen;
                  const strafe = GUNNER_KITE_STRAFE_MIX * enemy._kiteStrafeSign;
                  const kx = (-dx / dLen) * (1 - GUNNER_KITE_STRAFE_MIX) + perpX * strafe;
                  const kz = (-dz / dLen) * (1 - GUNNER_KITE_STRAFE_MIX) + perpZ * strafe;
                  const kl = Math.sqrt(kx * kx + kz * kz);
                  if (kl > 0.01) {
                    dirX = kx / kl;
                    dirZ = kz / kl;
                    moveSpeed = GUNNER_KITE_SPEED;
                    gunnerKiting = true;
                    enemy._kiting = true;
                  }
                } else if (dLen >= GUNNER_KITE_RELEASE_DIST) {
                  enemy._kiting = false;
                }
              }
              if (!gunnerKiting && losClear && dLen > 0.02) {
                dirX = dx / dLen; dirZ = dz / dLen;
              } else if (!gunnerKiting && flow) {
                const fLen = Math.sqrt(flow.x * flow.x + flow.z * flow.z);
                if (fLen > 0.015) { dirX = flow.x / fLen; dirZ = flow.z / fLen; }
              }
            }

            const MAX_SUB_STEP = 0.5; // larger step (was 0.25) — fewer raycasts
            const subSteps = Math.ceil(totalStep / MAX_SUB_STEP);
            const subLen = totalStep / subSteps;
            for (let si = 0; si < subSteps; si++) {
              const sx = dirX * subLen;
              const sz = dirZ * subLen;
              let nx = enemy.group.position.x + sx;
              let nz = enemy.group.position.z + sz;

              // Single raycast per sub-step (was up to 4 raycasts: target,
              // X-only, Z-only, fall-back). The sliding-along-axis fallback
              // adds visible jitter at corners, but cuts per-frame raycast cost
              // by 4×, which is the main arena-mode perf bottleneck.
              if (!enemyCollidesWall(nx, nz, BOSS_CR)) {
                enemy.group.position.x = nx;
                enemy.group.position.z = nz;
              } else if (flow) {
                // Try sliding along the flow direction instead.
                const fLen = Math.sqrt(flow.x * flow.x + flow.z * flow.z);
                if (fLen > 0.01) {
                  nx = enemy.group.position.x + (flow.x / fLen) * subLen;
                  nz = enemy.group.position.z + (flow.z / fLen) * subLen;
                  if (!enemyCollidesWall(nx, nz, BOSS_CR)) {
                    enemy.group.position.x = nx;
                    enemy.group.position.z = nz;
                  }
                }
              }
            }
            enemy.moveYaw = Math.atan2(dx, dz);
            const bossWalkRate = enemy._bossSprinting ? 28 : 14;
            enemy.walkTime += dt * (enemy.isBoss ? bossWalkRate : enemy.type === "fast" ? 12 : 8);
            enemy.moving = true;
          } else {
            enemy.moving = false;
          }

          let gunnerLosClear = false;
          if (enemy.ranged && dist < enemy.rangeDistance) {
            // LOS is expensive (full maze raycast) and the acquire timer needs 0.62s of
            // continuous clear lines — recompute on a 3-frame cadence and reuse the result.
            if ((visFrameCounter + ei) % 3 === 0) {
              enemy._lastGunnerLos = canSeePoint(
                enemy.group.position.x,
                1.6,
                enemy.group.position.z,
                target.x,
                target.y ?? 1.65,
                target.z
              );
            }
            gunnerLosClear = enemy._lastGunnerLos === true;
          }
          if (enemy.ranged && dist < enemy.rangeDistance && gunnerLosClear) {
            enemy.rangedLosAcquireTimer += dt;
          } else {
            enemy.rangedLosAcquireTimer = 0;
          }

          if (enemy.isBoss && enemy.bossQuakeCooldownTimer !== undefined) {
            enemy.bossQuakeCooldownTimer -= dt;
          }
          if (!enemy.ranged) {
            if (dist < (enemy.isBoss ? 3.5 : 2.05) && enemy.attackCooldownTimer <= 0) {
              enemy.attackCooldownTimer = enemy.attackCooldown;
              if (enemy.isBoss) {
                enemy.bossAnimState = "attacking";
                enemy.bossAnimTimer = 0;
              }
              applyCoopZombieDamageToTarget(enemy);
            } else if (
              enemy.isBoss &&
              enemy.bossMode !== "gunner" &&
              enemy.bossAnimState === "idle" &&
              dist >= 4 && dist <= 18 &&
              enemy.bossQuakeCooldownTimer <= 0
            ) {
              enemy.bossAnimState = "quaking";
              enemy.bossAnimTimer = 0;
              enemy._quakeShook = false;
              enemy.bossQuakeCooldownTimer = enemy.isHellBoss ? 8 : 12;
            }
          } else if (
            enemy.ranged &&
            dist < enemy.rangeDistance &&
            enemy.attackCooldownTimer <= 0 &&
            enemy.rangedLosAcquireTimer >= RANGED_LOS_ACQUIRE_DELAY
          ) {
            _visOrigin.set(enemy.group.position.x, 1.6, enemy.group.position.z);
            const ty = (target.y ?? 1.65) - 0.3;
            _enemyShotDir.set(dx, ty - 1.6, dz);
            const spr = 0.16 + Math.random() * 0.14;
            _enemyShotDir.x += (Math.random() - 0.5) * spr * 2;
            _enemyShotDir.z += (Math.random() - 0.5) * spr * 2;
            _enemyShotDir.y += (Math.random() - 0.5) * spr * 0.5;
            _enemyShotDir.normalize();
            const shotEndX =
              enemy.group.position.x + _enemyShotDir.x * Math.min(dist, enemy.rangeDistance);
            const shotEndZ =
              enemy.group.position.z + _enemyShotDir.z * Math.min(dist, enemy.rangeDistance);
            const shotEndY = 1.6 + _enemyShotDir.y * Math.min(dist, enemy.rangeDistance);
            if (
              canSeePoint(
                enemy.group.position.x,
                1.6,
                enemy.group.position.z,
                shotEndX,
                shotEndY,
                shotEndZ
              )
            ) {
              enemy.attackCooldownTimer = enemy.attackCooldown;
              if (enemy.isBoss) {
                const bScale = enemy.isHellBoss ? 2.6 : 2.0;
                const bBaseY = enemy.isHellBoss ? 1.30 : 1.00;
                const headLocalY = 1.96;
                const headLocalZ = 0.50;
                const hunch = 0.18;
                const mouthWorldY = bBaseY + (headLocalY * Math.cos(hunch) - headLocalZ * Math.sin(hunch)) * bScale - 0.15 * bScale;
                const mouthWorldZ = (headLocalZ * Math.cos(hunch) + headLocalY * Math.sin(hunch)) * bScale;
                const yaw = enemy.visYaw || enemy.facingYaw || 0;
                const mouthX = enemy.group.position.x + Math.sin(yaw) * mouthWorldZ;
                const mouthZ = enemy.group.position.z + Math.cos(yaw) * mouthWorldZ;
                spawnBossProjectile(
                  mouthX, mouthWorldY, mouthZ,
                  _enemyShotDir.x, _enemyShotDir.y, _enemyShotDir.z,
                  enemy.attackDamage
                );
              } else {
                applyCoopZombieDamageToTarget(enemy);
                _tracerEnd.set(
                  target.x + (Math.random() - 0.5) * 0.45,
                  (target.y ?? 1.65) + 1.25 + (Math.random() - 0.5) * 0.45,
                  target.z + (Math.random() - 0.5) * 0.45
                );
                createBulletTrail(_visOrigin.clone(), _tracerEnd.clone(), 0xff6666);
              }
            }
          }
        } else {
          enemy.moving = false;
          enemy.facingYaw += dt * 0.3;
          enemy.rangedLosAcquireTimer = 0;
        }

        enemy.visYaw = dampAngle(enemy.visYaw, enemy.facingYaw, dt, 14);
        enemy.group.rotation.y = enemy.visYaw;

        const walk = Math.sin(enemy.walkTime) * 0.55;
        const bob = Math.abs(Math.sin(enemy.walkTime * 2)) * 0.05;
        const shakePhase = enemy.walkTime * 4.35 + ei * 2.31;
        const sway = enemy.moving
          ? Math.sin(shakePhase) * 0.13 + Math.sin(enemy.walkTime * 6.2 + ei) * 0.04
          : Math.sin(shakePhase * 0.35) * 0.035;
        const bobble = enemy.moving ? Math.cos(enemy.walkTime * 5.1 + ei * 1.2) * 0.028 : 0;

        let bossAnimOverride = false;
        const HUNCH = 0.18;
        const ELBOW_REST = -0.55;
        const BOSS_BASE_Y = enemy.isHellBoss ? 1.30 : 1.00;
        if (enemy.isBoss) {
          enemy.bossAnimTimer += dt;
          const lfa = enemy.leftForearmRoot;
          const rfa = enemy.rightForearmRoot;

          if (enemy.bossAnimState === "summoning") {
            bossAnimOverride = true;
            const t = Math.min(enemy.bossAnimTimer / 2.5, 1);
            if (t < 0.25) {
              const s = (t / 0.25) ** 2;
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -0.8, s);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-0.50, -1.2, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -0.8, s);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(0.50, 1.2, s);
              lfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, -0.3, s);
              rfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, -0.3, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH, HUNCH - 0.2, s);
            } else if (t < 0.5) {
              const s = ((t - 0.25) / 0.25) ** 2;
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(-0.8, -2.8, s);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-1.2, -0.3, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-0.8, -2.8, s);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(1.2, 0.3, s);
              lfa.rotation.x = THREE.MathUtils.lerp(-0.3, -0.15, s);
              rfa.rotation.x = THREE.MathUtils.lerp(-0.3, -0.15, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH - 0.2, HUNCH - 0.35, s);
              enemy.group.position.y = BOSS_BASE_Y + s * 0.12;
            } else {
              const pulse = Math.sin((t - 0.5) * 12) * 0.12;
              enemy.leftArmRoot.rotation.x = -2.8 + pulse;
              enemy.leftArmRoot.rotation.z = -0.3;
              enemy.rightArmRoot.rotation.x = -2.8 + pulse;
              enemy.rightArmRoot.rotation.z = 0.3;
              lfa.rotation.x = -0.15 + pulse * 0.3;
              rfa.rotation.x = -0.15 + pulse * 0.3;
              enemy.torsoRoot.rotation.x = HUNCH - 0.35 + Math.sin((t - 0.5) * 16) * 0.05;
              enemy.group.position.y = BOSS_BASE_Y + 0.12 * Math.max(0, 1 - (t - 0.5) / 0.5);
              state.camShake = Math.max(state.camShake || 0, 0.15);
            }
            if (t >= 1) {
              enemy.bossAnimState = "idle";
              enemy.bossAnimTimer = 0;
              enemy.torsoRoot.rotation.x = HUNCH;
              enemy.group.position.y = BOSS_BASE_Y;
            }
          }

          if (!bossAnimOverride && enemy.bossAnimState === "modeSwitch") {
            bossAnimOverride = true;
            const t = Math.min(enemy.bossAnimTimer / 1.4, 1);
            if (t < 0.3) {
              const s = (t / 0.3) ** 2;
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -1.6, s);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-0.50, -1.0, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -1.6, s);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(0.50, 1.0, s);
              lfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, -0.2, s);
              rfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, -0.2, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH, HUNCH - 0.25, s);
              enemy.group.position.y = BOSS_BASE_Y + 0.08 * s;
            } else if (t < 0.6) {
              const pulse = Math.sin((t - 0.3) * 20) * 0.15;
              enemy.leftArmRoot.rotation.x = -1.6 + pulse;
              enemy.leftArmRoot.rotation.z = -1.0;
              enemy.rightArmRoot.rotation.x = -1.6 + pulse;
              enemy.rightArmRoot.rotation.z = 1.0;
              lfa.rotation.x = -0.2 + pulse * 0.3;
              rfa.rotation.x = -0.2 + pulse * 0.3;
              enemy.torsoRoot.rotation.x = HUNCH - 0.25 + Math.sin((t - 0.3) * 24) * 0.06;
              enemy.group.position.y = BOSS_BASE_Y + 0.08;
              state.camShake = Math.max(state.camShake || 0, 0.3);
            } else {
              const s = 1 - Math.pow(1 - (t - 0.6) / 0.4, 2);
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(-1.6, -0.10, s);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-1.0, -0.50, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-1.6, -0.10, s);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(1.0, 0.50, s);
              lfa.rotation.x = THREE.MathUtils.lerp(-0.2, ELBOW_REST, s);
              rfa.rotation.x = THREE.MathUtils.lerp(-0.2, ELBOW_REST, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH - 0.25, HUNCH, s);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y + 0.08, BOSS_BASE_Y, s);
            }
            if (t >= 1) {
              enemy.bossAnimState = "idle";
              enemy.bossAnimTimer = 0;
              enemy.torsoRoot.rotation.x = HUNCH;
              enemy.group.position.y = BOSS_BASE_Y;
            }
          }

          if (!bossAnimOverride && enemy.bossAnimState === "attacking") {
            bossAnimOverride = true;
            const dur = 1.4;
            const t = Math.min(enemy.bossAnimTimer / dur, 1);
            if (t < 0.35) {
              // Wind-up: torso rears back, arms sweep wide then overhead
              const smooth = t / 0.35; const s = smooth * smooth * (3 - 2 * smooth);
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -3.2, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -3.2, s);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-0.50, -0.60, s * 0.5) + (s > 0.5 ? (s - 0.5) * 0.8 : 0);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(0.50, 0.60, s * 0.5) - (s > 0.5 ? (s - 0.5) * 0.8 : 0);
              enemy.leftArmRoot.rotation.y = THREE.MathUtils.lerp(0.25, 0, s);
              enemy.rightArmRoot.rotation.y = THREE.MathUtils.lerp(-0.25, 0, s);
              lfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, -0.10, s);
              rfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, -0.10, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH, HUNCH - 0.55, s);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y, BOSS_BASE_Y + 0.25, s);
            } else if (t < 0.46) {
              // Slam down: explosive forward smash
              const pow = 1 - Math.pow(1 - (t - 0.35) / 0.11, 5);
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(-3.2, 0.8, pow);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-3.2, 0.8, pow);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-0.20, -0.05, pow);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(0.20, 0.05, pow);
              enemy.leftArmRoot.rotation.y = 0;
              enemy.rightArmRoot.rotation.y = 0;
              lfa.rotation.x = THREE.MathUtils.lerp(-0.10, -1.6, pow);
              rfa.rotation.x = THREE.MathUtils.lerp(-0.10, -1.6, pow);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH - 0.55, HUNCH + 0.65, pow);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y + 0.25, BOSS_BASE_Y - 0.10, pow);
              if (pow > 0.7 && !enemy._smashShook) {
                enemy._smashShook = true;
                state.camShake = Math.max(state.camShake || 0, 1.0);
                if (player.health > 0) {
                  const bx = enemy.group.position.x, bz = enemy.group.position.z;
                  const pdx = player.position.x - bx, pdz = player.position.z - bz;
                  if (Math.hypot(pdx, pdz) < 14) {
                    if (player.onGround) {
                      const norm = Math.hypot(pdx, pdz) > 0.01 ? 1 / Math.hypot(pdx, pdz) : 1;
                      const kbTarget = new THREE.Vector3(
                        player.position.x + pdx * norm * 3.5,
                        player.position.y,
                        player.position.z + pdz * norm * 3.5
                      );
                      const kbRes = resolveWallSliding(kbTarget);
                      player.position.x = kbRes.x;
                      player.position.z = kbRes.z;
                      showCombatFeedback("⚠ SMASH!", "#ff6644", 0.5);
                    } else {
                      player.velocityY = -22;
                      player.onGround = false;
                      showCombatFeedback("⚠ CRASH!", "#ff4422", 0.5);
                    }
                  }
                }
              }
            } else if (t < 0.56) {
              // Ground impact hold with tremor
              const hold = (t - 0.46) / 0.10;
              const tremor = Math.sin(hold * 30) * 0.06 * (1 - hold);
              enemy.leftArmRoot.rotation.x = 0.8 + tremor;
              enemy.rightArmRoot.rotation.x = 0.8 + tremor;
              enemy.leftArmRoot.rotation.z = -0.05;
              enemy.rightArmRoot.rotation.z = 0.05;
              lfa.rotation.x = -1.6;
              rfa.rotation.x = -1.6;
              enemy.torsoRoot.rotation.x = HUNCH + 0.65 + tremor * 2;
              enemy.group.position.y = BOSS_BASE_Y - 0.10 + tremor;
              state.camShake = Math.max(state.camShake || 0, 0.3 * (1 - hold));
            } else {
              // Recovery: slow rise back to stance
              const s = 1 - Math.pow(1 - (t - 0.56) / 0.44, 2);
              enemy.leftArmRoot.rotation.x = THREE.MathUtils.lerp(0.8, -0.10, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(0.8, -0.10, s);
              enemy.leftArmRoot.rotation.z = THREE.MathUtils.lerp(-0.05, -0.50, s);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp(0.05, 0.50, s);
              enemy.leftArmRoot.rotation.y = THREE.MathUtils.lerp(0, 0.25, s);
              enemy.rightArmRoot.rotation.y = THREE.MathUtils.lerp(0, -0.25, s);
              lfa.rotation.x = THREE.MathUtils.lerp(-1.6, ELBOW_REST, s);
              rfa.rotation.x = THREE.MathUtils.lerp(-1.6, ELBOW_REST, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH + 0.65, HUNCH, s);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y - 0.10, BOSS_BASE_Y, s);
            }
            if (t >= 1) {
              enemy.bossAnimState = "idle";
              enemy.bossAnimTimer = 0;
              enemy._smashShook = false;
              enemy.torsoRoot.rotation.x = HUNCH;
              enemy.group.position.y = BOSS_BASE_Y;
            }
          }
        }

          if (!bossAnimOverride && enemy.bossAnimState === "quaking") {
            bossAnimOverride = true;
            const dur = 1.5;
            const t = Math.min(enemy.bossAnimTimer / dur, 1);
            if (t < 0.4) {
              // 蓄力：双臂举高，身体微微跳起
              const s = t / 0.4; const sm = s * s * (3 - 2 * s);
              enemy.leftArmRoot.rotation.x  = THREE.MathUtils.lerp(-0.10, -3.0, sm);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-0.10, -3.0, sm);
              enemy.leftArmRoot.rotation.z  = THREE.MathUtils.lerp(-0.50, -0.20, sm);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp( 0.50,  0.20, sm);
              lfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, 0.30, sm);
              rfa.rotation.x = THREE.MathUtils.lerp(ELBOW_REST, 0.30, sm);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH, HUNCH - 0.45, sm);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y, BOSS_BASE_Y + 0.45, sm);
            } else if (t < 0.55) {
              // 砸下：极速下砸
              const pow = 1 - Math.pow(1 - (t - 0.4) / 0.15, 4);
              enemy.leftArmRoot.rotation.x  = THREE.MathUtils.lerp(-3.0, 1.0, pow);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(-3.0, 1.0, pow);
              enemy.leftArmRoot.rotation.z  = THREE.MathUtils.lerp(-0.20, -0.05, pow);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp( 0.20,  0.05, pow);
              lfa.rotation.x = THREE.MathUtils.lerp(0.30, -1.8, pow);
              rfa.rotation.x = THREE.MathUtils.lerp(0.30, -1.8, pow);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH - 0.45, HUNCH + 0.7, pow);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y + 0.45, BOSS_BASE_Y - 0.15, pow);
              if (pow > 0.75 && !enemy._quakeShook) {
                enemy._quakeShook = true;
                state.camShake = Math.max(state.camShake || 0, 1.4);
                // 震地音效
                if (audioCtx && audioSfx) {
                  const now2 = audioCtx.currentTime;
                  const nb = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.35), audioCtx.sampleRate);
                  const nd = nb.getChannelData(0);
                  for (let qi = 0; qi < nd.length; qi++) nd[qi] = Math.random() * 2 - 1;
                  const ns = audioCtx.createBufferSource(); ns.buffer = nb;
                  const lp = audioCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(180, now2); lp.frequency.exponentialRampToValueAtTime(40, now2 + 0.3);
                  const gg = audioCtx.createGain(); gg.gain.setValueAtTime(0.0001, now2); gg.gain.linearRampToValueAtTime(1.1, now2 + 0.02); gg.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.32);
                  ns.connect(lp); lp.connect(gg); gg.connect(audioSfx); ns.start(now2); ns.stop(now2 + 0.36);
                  const osc2 = audioCtx.createOscillator(); osc2.type = "sine"; osc2.frequency.setValueAtTime(60, now2); osc2.frequency.exponentialRampToValueAtTime(18, now2 + 0.4);
                  const og2 = audioCtx.createGain(); og2.gain.setValueAtTime(0.6, now2); og2.gain.exponentialRampToValueAtTime(0.0001, now2 + 0.4);
                  osc2.connect(og2); og2.connect(audioSfx); osc2.start(now2); osc2.stop(now2 + 0.45);
                }
                // 击退 + 封锁 dash
                if (player.health > 0) {
                  const bx = enemy.group.position.x, bz = enemy.group.position.z;
                  const pdx = player.position.x - bx, pdz = player.position.z - bz;
                  const dist2 = Math.hypot(pdx, pdz);
                  if (player.onGround) {
                    const norm = dist2 > 0.01 ? 1 / dist2 : 1;
                    const kbT = new THREE.Vector3(player.position.x + pdx * norm * 4, player.position.y, player.position.z + pdz * norm * 4);
                    const kbR = resolveWallSliding(kbT);
                    player.position.x = kbR.x; player.position.z = kbR.z;
                    showCombatFeedback("⚠ SMASH!", "#ff6644", 0.5);
                  } else {
                    player.velocityY = -22; player.onGround = false;
                    showCombatFeedback("⚠ CRASH!", "#ff4422", 0.5);
                  }
                }
              }
            } else if (t < 0.7) {
              // 落地颤抖
              const hold = (t - 0.55) / 0.15;
              const tremor = Math.sin(hold * 28) * 0.08 * (1 - hold);
              enemy.leftArmRoot.rotation.x  = 1.0 + tremor;
              enemy.rightArmRoot.rotation.x = 1.0 + tremor;
              lfa.rotation.x = -1.8; rfa.rotation.x = -1.8;
              enemy.torsoRoot.rotation.x = HUNCH + 0.7 + tremor * 2;
              enemy.group.position.y = BOSS_BASE_Y - 0.15 + tremor;
              state.camShake = Math.max(state.camShake || 0, 0.35 * (1 - hold));
            } else {
              // 恢复
              const s = 1 - Math.pow(1 - (t - 0.7) / 0.3, 2);
              enemy.leftArmRoot.rotation.x  = THREE.MathUtils.lerp(1.0, -0.10, s);
              enemy.rightArmRoot.rotation.x = THREE.MathUtils.lerp(1.0, -0.10, s);
              enemy.leftArmRoot.rotation.z  = THREE.MathUtils.lerp(-0.05, -0.50, s);
              enemy.rightArmRoot.rotation.z = THREE.MathUtils.lerp( 0.05,  0.50, s);
              lfa.rotation.x = THREE.MathUtils.lerp(-1.8, ELBOW_REST, s);
              rfa.rotation.x = THREE.MathUtils.lerp(-1.8, ELBOW_REST, s);
              enemy.torsoRoot.rotation.x = THREE.MathUtils.lerp(HUNCH + 0.7, HUNCH, s);
              enemy.group.position.y = THREE.MathUtils.lerp(BOSS_BASE_Y - 0.15, BOSS_BASE_Y, s);
            }
            if (t >= 1) {
              enemy.bossAnimState = "idle";
              enemy.bossAnimTimer = 0;
              enemy._quakeShook = false;
              enemy.torsoRoot.rotation.x = HUNCH;
              enemy.group.position.y = BOSS_BASE_Y;
            }
          }

        if (!bossAnimOverride && enemy.isBoss) {
          const lfa = enemy.leftForearmRoot;
          const rfa = enemy.rightForearmRoot;
          const breathe = Math.sin(enemy.walkTime * 1.5) * 0.04;
          const sway0 = Math.sin(enemy.walkTime * 0.8) * 0.02;
          if (!enemy.moving) {
            enemy.leftArmRoot.rotation.x = -0.10 + breathe;
            enemy.rightArmRoot.rotation.x = -0.10 + breathe;
            enemy.leftArmRoot.rotation.z = -0.50 + sway0;
            enemy.rightArmRoot.rotation.z = 0.50 - sway0;
            enemy.leftArmRoot.rotation.y = 0.25;
            enemy.rightArmRoot.rotation.y = -0.25;
            lfa.rotation.x = ELBOW_REST + breathe * 0.5;
            rfa.rotation.x = ELBOW_REST + breathe * 0.5;
            enemy.torsoRoot.rotation.x = HUNCH + breathe * 0.5;
            enemy.torsoRoot.rotation.z = sway0;
          } else {
            const w = enemy.walkTime;
            const stride = Math.sin(w);
            const sprinting = !!enemy._bossSprinting;
            const armSwing = sprinting ? 0.70 : 0.40;
            const elbowPump = sprinting ? 0.30 : 0.15;
            const torsoLean = sprinting ? HUNCH + 0.20 : HUNCH;
            enemy.leftArmRoot.rotation.x = 0.0 + stride * armSwing;
            enemy.rightArmRoot.rotation.x = 0.0 - stride * armSwing;
            enemy.leftArmRoot.rotation.z = sprinting ? -0.30 : -0.40;
            enemy.rightArmRoot.rotation.z = sprinting ? 0.30 : 0.40;
            enemy.leftArmRoot.rotation.y = 0.20;
            enemy.rightArmRoot.rotation.y = -0.20;
            lfa.rotation.x = ELBOW_REST + stride * elbowPump;
            rfa.rotation.x = ELBOW_REST - stride * elbowPump;
            enemy.torsoRoot.rotation.x = torsoLean + Math.sin(w * 2) * (sprinting ? 0.08 : 0.05);
            enemy.torsoRoot.rotation.z = Math.sin(w) * (sprinting ? 0.10 : 0.07);
          }
          const LEG_BASE_TILT = 0.0;
          const SHIN_BASE_BEND = 0.10;   // was -0.18 — hyperextended the knee backwards
          const isSprinting = !!enemy._bossSprinting;
          const legSwingAmp = isSprinting ? 0.75 : 0.50;
          const shinKickAmp = isSprinting ? 0.65 : 0.45;
          if (enemy.moving) {
            const sw = Math.sin(enemy.walkTime);
            const bLegL = LEG_BASE_TILT - sw * legSwingAmp;
            const bLegR = LEG_BASE_TILT + sw * legSwingAmp;
            enemy.legLV = dampScalar(enemy.legLV, bLegL, dt, 14);
            enemy.legRV = dampScalar(enemy.legRV, bLegR, dt, 14);
            const shinL = SHIN_BASE_BEND + Math.max(0, sw) * shinKickAmp;
            const shinR = SHIN_BASE_BEND + Math.max(0, -sw) * shinKickAmp;
            if (enemy.leftShinRoot) enemy.leftShinRoot.rotation.x = dampScalar(enemy.leftShinRoot.rotation.x, shinL, dt, 14);
            if (enemy.rightShinRoot) enemy.rightShinRoot.rotation.x = dampScalar(enemy.rightShinRoot.rotation.x, shinR, dt, 14);
          } else {
            enemy.legLV = dampScalar(enemy.legLV, LEG_BASE_TILT, dt, 12);
            enemy.legRV = dampScalar(enemy.legRV, LEG_BASE_TILT, dt, 12);
            if (enemy.leftShinRoot) enemy.leftShinRoot.rotation.x = dampScalar(enemy.leftShinRoot.rotation.x, SHIN_BASE_BEND, dt, 12);
            if (enemy.rightShinRoot) enemy.rightShinRoot.rotation.x = dampScalar(enemy.rightShinRoot.rotation.x, SHIN_BASE_BEND, dt, 12);
          }
          enemy.leftLegRoot.rotation.x = enemy.legLV;
          enemy.rightLegRoot.rotation.x = enemy.legRV;
          enemy.torsoBobYV = dampScalar(enemy.torsoBobYV, enemy.moving ? Math.abs(Math.sin(enemy.walkTime * 2)) * 0.06 : 0, dt, 16);
          enemy.torsoRoot.position.y = enemy.torsoBobYV;
          enemy.group.position.y = BOSS_BASE_Y;
        }

        if (!bossAnimOverride && !enemy.isBoss) {
          if (enemy.aware && dist < 2.2 && !enemy.ranged) {
            enemy.attackPhase += dt * 10;
          } else if (enemy.aware && enemy.ranged && dist < enemy.rangeDistance) {
            enemy.attackPhase += dt * 6;
          } else {
            enemy.attackPhase = 0;
          }

          const attackSwing = enemy.attackPhase > 0 ? Math.max(0, Math.sin(enemy.attackPhase)) * 0.6 : 0;
          const tgtArmL = (enemy.aware ? -1.0 : -0.2) + attackSwing + (enemy.moving ? walk * 0.15 : 0);
          const tgtArmR = (enemy.aware ? -1.0 : -0.2) + attackSwing - (enemy.moving ? walk * 0.15 : 0);
          const tgtLegL = enemy.moving ? -walk : 0;
          const tgtLegR = enemy.moving ? walk : 0;
          const torsoXTgt = enemy.moving
            ? Math.sin(shakePhase * 1.12) * 0.075
            : Math.sin(shakePhase * 0.42) * 0.022;

          enemy.armLV = dampScalar(enemy.armLV, tgtArmL, dt, 19);
          enemy.armRV = dampScalar(enemy.armRV, tgtArmR, dt, 19);
          enemy.legLV = dampScalar(enemy.legLV, tgtLegL, dt, 15);
          enemy.legRV = dampScalar(enemy.legRV, tgtLegR, dt, 15);
          enemy.leftArmRoot.rotation.x = enemy.armLV;
          enemy.rightArmRoot.rotation.x = enemy.armRV;
          enemy.leftArmRoot.rotation.z = 0;
          enemy.rightArmRoot.rotation.z = 0;
          enemy.leftLegRoot.rotation.x = enemy.legLV;
          enemy.rightLegRoot.rotation.x = enemy.legRV;

          enemy.torsoBobYV = dampScalar(enemy.torsoBobYV, bob, dt, 16);
          enemy.torsoXV = dampScalar(enemy.torsoXV, torsoXTgt, dt, 14);
          enemy.torsoZV = dampScalar(enemy.torsoZV, sway, dt, 15);
          enemy.torsoPitchV = dampScalar(enemy.torsoPitchV, bobble, dt, 16);
          enemy.torsoRoot.position.y = enemy.torsoBobYV;
          enemy.torsoRoot.position.x = enemy.torsoXV;
          enemy.torsoRoot.rotation.z = enemy.torsoZV;
          enemy.torsoRoot.rotation.x = enemy.torsoPitchV;
        }
      }
    }

    function updateTracers(dt) {
      for (let i = state.tracers.length - 1; i >= 0; i--) {
        const t = state.tracers[i];
        t.life -= dt;
        const k = Math.max(0, t.life / t.maxLife);
        for (const p of t.parts) {
          p.material.opacity = p.baseOpacity * k;
        }
        if (t.life <= 0) {
          tracerGroup.remove(t.group);
          for (const p of t.parts) {
            p.geometry.dispose();
            p.material.dispose();
          }
          state.tracers.splice(i, 1);
        }
      }
    }

    let _lastChatRefresh = 0;
    function updateEffects(dt) {
      updateDissolveEffects(dt);
      updateBlood(dt);
      updateSparks(dt);
      updateTracers(dt);
      updateShellCasings(dt);
      updateHitIndicators(dt);
      updateProjectiles(dt);
      updateSlowDebuffHud();
      const now = performance.now();
      if (!chatOpen && now - _lastChatRefresh > 1000) {
        _lastChatRefresh = now;
        refreshChatVisibility();
      }

      if (state.flashTimer > 0) {
        state.flashTimer -= dt;
        flash.style.background = "rgba(255,0,0,0.20)";
      } else {
        flash.style.background = "rgba(255,0,0,0)";
      }

      if (state.hitmarkerTimer > 0) {
        state.hitmarkerTimer -= dt;
      } else {
        hitmarkerEl.classList.remove("show");
        hitmarkerEl.classList.remove("critical");
      }

      if (state.combatFeedbackTimer > 0) {
        state.combatFeedbackTimer -= dt;
      } else if (combatFeedbackEl) {
        combatFeedbackEl.classList.remove("show");
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.033);
      if (document.visibilityState === "hidden") return;

      if (_rendererSyncWarmupFrames > 0) {
        _rendererSyncWarmupFrames--;
        // Warmup re-syncs every frame (~9 layout reads each) — throttle to every 8th
        // warmup frame; ResizeObserver + event listeners still catch true resizes.
        if ((_rendererSyncWarmupFrames & 7) === 0) syncGameRendererSize();
      }

      {
        const tgt = FLASH_BEAM_LEVELS[flashlightBeamLevel] || FLASH_BEAM_LEVELS[1];
        const lam = 17;
        flashOuterLocal.angle = dampScalar(flashOuterLocal.angle, tgt.outerA, dt, lam);
        flashInnerLocal.angle = dampScalar(flashInnerLocal.angle, tgt.innerA, dt, lam);
        flashOuterLocal.penumbra = dampScalar(flashOuterLocal.penumbra, tgt.outerP, dt, lam);
        flashInnerLocal.penumbra = dampScalar(flashInnerLocal.penumbra, tgt.innerP, dt, lam);
      }

      // Runs for real opponents AND for the training-range showcase dummy, so what you see
      // in the range is literally the same animation path an opponent gets.
      if (MULTIPLAYER || remotePlayers.size > 0) {
        const k = 1 - Math.exp(-17 * dt);
        for (const rp of remotePlayers.values()) {
          if (rp.visX === undefined) {
            rp.visX = rp.x;
            rp.visZ = rp.z;
            rp.visY = rp.y ?? 1.65;
            rp.visYaw = rp.yaw + Math.PI;
          }
          const dxRp = rp.x - rp.visX;
          const dzRp = rp.z - rp.visZ;
          if (Math.hypot(dxRp, dzRp) > 5) {
            rp.visX = rp.x;
            rp.visZ = rp.z;
          } else {
            rp.visX += dxRp * k;
            rp.visZ += dzRp * k;
          }
          rp.visY = (rp.visY || 1.65) + ((rp.y ?? 1.65) - (rp.visY || 1.65)) * Math.min(1, k * 2.2);
          rp.visYaw = dampAngle(rp.visYaw, rp.yaw + Math.PI, dt, 18);
          // Lift group off ground when airborne (rp.y=1.65 = floor level)
          const rpGroundOffset = Math.max(0, (rp.visY || 1.65) - 1.65);
          rp.group.position.set(rp.visX, rpGroundOffset, rp.visZ);
          rp.group.rotation.y = rp.visYaw;
          // Crouch posture, eased locally so a laggy packet stream still looks smooth.
          rp.crouchAmt = dampScalar(rp.crouchAmt || 0, rp.crouch || 0, dt, 13);
          const rpCrouch = rp.crouchAmt;

          const spx = rp._prevVisX ?? rp.visX;
          const spz = rp._prevVisZ ?? rp.visZ;
          const gSpeed = Math.hypot(rp.visX - spx, rp.visZ - spz) / Math.max(dt, 1e-5);
          rp._prevVisX = rp.visX;
          rp._prevVisZ = rp.visZ;
          rp.walkPhase = (rp.walkPhase || 0) + dt * Math.min(gSpeed * 4.2, 14);
          rp.idlePhase = (rp.idlePhase || 0) + dt * 1.28;
          const wSin = Math.sin(rp.walkPhase) * 0.52;
          const moving = gSpeed > 0.06;
          const wCos = Math.cos(rp.walkPhase * 2) * 0.055;
          const rpAirborne = rpGroundOffset > 0.12;
          // ── Gait: knees, body bob, landing squash ──────────────────────────
          // Speed drives everything so a walk and a sprint don't look identical.
          const gait = THREE.MathUtils.clamp(gSpeed / 6.5, 0, 1.35);
          const stride = moving ? gait : 0;
          if (rp.rightKnee && rp.leftKnee) {
            // Each knee bends through its own swing half-cycle (heel kicks up behind),
            // and stays near-straight through the stance half. Standing still keeps a
            // small bend so the legs aren't locked planks.
            const idleBend = 0.10;
            const kneeAmp = 0.30 + 1.05 * stride;
            const bendR = idleBend + Math.max(0, Math.sin(rp.walkPhase)) * kneeAmp * (moving ? 1 : 0);
            const bendL = idleBend + Math.max(0, -Math.sin(rp.walkPhase)) * kneeAmp * (moving ? 1 : 0);
            const airBend = rpAirborne ? 0.55 : 0;
            const crouchBend = 0.95 * rpCrouch;
            rp.rightKnee.rotation.x = dampScalar(rp.rightKnee.rotation.x, bendR + airBend + crouchBend, dt, 15);
            rp.leftKnee.rotation.x = dampScalar(rp.leftKnee.rotation.x, bendL + airBend + crouchBend, dt, 15);
          }
          // Body rises and falls twice per stride, and squashes briefly on touchdown.
          const wasAir = rp._wasAirborne === true;
          if (wasAir && !rpAirborne) rp.landSquash = 1;
          rp._wasAirborne = rpAirborne;
          rp.landSquash = Math.max(0, (rp.landSquash || 0) - dt * 4.5);
          const bobTarget = moving && !rpAirborne ? Math.abs(Math.sin(rp.walkPhase)) * 0.055 * stride : 0;
          rp.bodyBobY = dampScalar(rp.bodyBobY || 0, bobTarget, dt, 13);
          // Bob lifts only (never below the floor). The touchdown squash is a vertical
          // SCALE, not a downward shift — shifting the whole rig down drove the boots up
          // to 16 cm through the ground. Scaling keeps the soles planted at y=0 and
          // compresses the body, which is what a landing actually looks like.
          rp.group.position.y += Math.max(0, rp.bodyBobY);
          // Landing squash and crouch both ride the same vertical scale. Because incoming
          // shots raycast the avatar's own meshes, a shorter model IS a shorter hitbox —
          // crouching behind cover really does make you harder to hit, with no second
          // hitbox to keep in sync.
          const sq = rp.landSquash;
          const crouchSquash = 1 - 0.30 * rpCrouch;
          const wantSY = (1 - sq * 0.09) * crouchSquash;
          const wantSXZ = (1 + sq * 0.045) * (1 + 0.07 * rpCrouch);
          if (Math.abs(rp.group.scale.y - wantSY) > 1e-4 || Math.abs(rp.group.scale.x - wantSXZ) > 1e-4) {
            rp.group.scale.set(wantSXZ, wantSY, wantSXZ);
          }

          if (rp.leftLeg && rp.rightLeg) {
            if (rpAirborne) {
              // Airborne: legs tuck up and spread — classic jump pose
              const tuck = Math.min(1, rpGroundOffset / 1.5);
              rp.leftLeg.rotation.x  = dampScalar(rp.leftLeg.rotation.x,  0.55 * tuck, dt, 10);
              rp.rightLeg.rotation.x = dampScalar(rp.rightLeg.rotation.x, 0.55 * tuck, dt, 10);
              rp.leftLeg.rotation.z  = dampScalar(rp.leftLeg.rotation.z  || 0, -0.18 * tuck, dt, 10);
              rp.rightLeg.rotation.z = dampScalar(rp.rightLeg.rotation.z || 0,  0.18 * tuck, dt, 10);
              rp.leftLeg.position.y  = dampScalar(rp.leftLeg.position.y,  0.62 - 0.08 * tuck, dt, 10);
              rp.rightLeg.position.y = dampScalar(rp.rightLeg.position.y, 0.62 - 0.08 * tuck, dt, 10);
            } else {
              rp.leftLeg.rotation.x = dampScalar(rp.leftLeg.rotation.x, moving ? -wSin * 1.28 : 0, dt, 14);
              rp.rightLeg.rotation.x = dampScalar(rp.rightLeg.rotation.x, moving ? wSin * 1.28 : 0, dt, 14);
              rp.leftLeg.rotation.z  = dampScalar(rp.leftLeg.rotation.z  || 0, 0, dt, 12);
              rp.rightLeg.rotation.z = dampScalar(rp.rightLeg.rotation.z || 0, 0, dt, 12);
              rp.leftLeg.position.y  = dampScalar(rp.leftLeg.position.y, moving ? 0.62 + Math.max(0,  wSin) * 0.06 : 0.62, dt, 12);
              rp.rightLeg.position.y = dampScalar(rp.rightLeg.position.y, moving ? 0.62 + Math.max(0, -wSin) * 0.06 : 0.62, dt, 12);
            }
          }
          const duelPvp = isBrightIndoorMap(CURRENT_MAP);
          const adsBlend = dampScalar(rp.adsBlend ?? 0, rp.ads ? 1 : 0, dt, 13);
          rp.adsBlend = adsBlend;
          const pitchBlend = (rp.remotePitch || 0) * (0.38 + 0.62 * adsBlend);
          const adsLiftL = adsBlend * (duelPvp ? 0.36 : 0.30);
          const adsLiftR = adsBlend * (duelPvp ? 0.50 : 0.42);

          const weaponStance = REMOTE_WEAPON_STANCES[rp.currentWeapon | 0] || REMOTE_WEAPON_STANCES[3];
          const breathe = Math.sin(rp.idlePhase) * (moving ? 0.022 : 0.032);
          let targetLX = weaponStance.l + (moving ? wSin * 0.17 : 0) + breathe * 0.55 - adsLiftL;
          let targetRX = weaponStance.r - (moving ? wSin * 0.15 : 0) - breathe * 0.5 - adsLiftR;
          let targetLY = weaponStance.ly + Math.sin(rp.idlePhase * 1.15 + 1.05) * (moving ? 0.042 : 0.055);
          let targetRY = weaponStance.ry + Math.sin(rp.idlePhase * 1.2) * (moving ? 0.048 : 0.062);
          let targetLZ = weaponStance.lz;
          let targetRZ = weaponStance.rz;
          if (!rp.isReloading && adsBlend > 0.04) {
            const wType = rp.currentWeapon | 0;
            const aimSide = wType === 3 ? 0.085 : wType === 2 ? 0.065 : 0.055;
            targetLY += adsBlend * aimSide;
            targetRY -= adsBlend * (aimSide * 0.62);
            targetLX -= adsBlend * (duelPvp ? 0.05 : 0.035);
          }
          if (rp.isReloading) {
            rp.reloadPhase = (rp.reloadPhase || 0) + dt * 6.5;
            const rSin = Math.sin(rp.reloadPhase);
            targetRX = -0.18 + rSin * 0.75;
            targetLX = -0.26 + Math.sin(rp.reloadPhase + 0.8) * 0.5;
            if (rp.gunModel) {
              rp.gunModel.rotation.z = dampScalar(rp.gunModel.rotation.z, 0.72 + rSin * 0.38, dt, 16);
              rp.gunModel.rotation.x = dampScalar(rp.gunModel.rotation.x, -0.38 + Math.cos(rp.reloadPhase * 1.35) * 0.14, dt, 14);
            }
          } else {
            rp.reloadPhase = 0;
            if (rp.gunModel) {
              rp.gunModel.rotation.z = dampScalar(rp.gunModel.rotation.z, 0, dt, 14);
              rp.gunModel.rotation.x = dampScalar(rp.gunModel.rotation.x, 0, dt, 14);
            }
          }
          // Torso: counter-twists against the legs, leans into the run, and shoulders roll.
          const torsoTwist = moving && !rpAirborne ? Math.sin(rp.walkPhase) * 0.20 * stride : 0;
          if (rp.torsoMesh) {
            rp.torsoMesh.rotation.y = dampScalar(rp.torsoMesh.rotation.y, torsoTwist, dt, 10);
            const airTuck = rpAirborne ? Math.min(1, rpGroundOffset / 1.5) * 0.28 : 0;
            const runLean = stride * 0.16;              // lean forward the faster you go
            const breath = moving ? 0 : Math.sin(rp.idlePhase * 0.9) * 0.02;
            rp.torsoMesh.rotation.x = dampScalar(
              rp.torsoMesh.rotation.x,
              pitchBlend * 0.55 + runLean + breath - airTuck + rp.landSquash * 0.22 + rpCrouch * 0.20,
              dt,
              11
            );
            rp.torsoMesh.rotation.z = dampScalar(
              rp.torsoMesh.rotation.z || 0,
              moving && !rpAirborne ? Math.cos(rp.walkPhase) * 0.07 * stride : 0,
              dt,
              10
            );
            rp.torsoMesh.position.y = dampScalar(rp.torsoMesh.position.y, 1.24 + (moving && !rpAirborne ? Math.abs(wCos) * 0.08 : 0), dt, 10);
          }
          if (rp.headGroup) {
            // Head counter-rotates against the torso twist so the gaze stays level instead
            // of swinging with the shoulders — the single cheapest "alive" cue there is.
            rp.headGroup.rotation.y = dampScalar(rp.headGroup.rotation.y, -torsoTwist * 0.75, dt, 12);
            rp.headGroup.rotation.x = dampScalar(
              rp.headGroup.rotation.x,
              (moving ? Math.cos(rp.walkPhase) * 0.05 * stride : 0) + pitchBlend * 0.78 - stride * 0.10,
              dt,
              10
            );
            rp.headGroup.rotation.z = dampScalar(
              rp.headGroup.rotation.z || 0,
              moving && !rpAirborne ? -Math.cos(rp.walkPhase) * 0.05 * stride : 0,
              dt,
              10
            );
          }
          if (rp.supportSocket) {
            rp.supportSocket.visible = !rp.isReloading;
          }
          if (rp.primarySocket) {
            // Med kit used to hide this glove (it had no model to hold); it now carries the
            // case, so the only reason to hide a hand is a reload.
            rp.primarySocket.visible = !rp.isReloading;
          }
          if (rp.flashMount) {
            rp.flashMount.visible = !rp.duelBright;
          }
          updateRemoteJetPack(rp, dt);
          const wTyHold = rp.currentWeapon | 0;
          const heldPose =
            !rp.isReloading &&
            rp.primarySocket &&
            (isRemoteOneHandItem(wTyHold) || rp.supportSocket);

          // ── Elbows ─────────────────────────────────────────────────────────
          // These were built and then frozen at -0.5 forever. Bending them is what turns
          // the arms from rods into limbs.
          if (rp.rightElbow && rp.leftElbow) {
            let elbR;
            let elbL;
            if (rp.isReloading) {
              // Big working bend — the hands are busy at the magazine well.
              const rs = Math.sin(rp.reloadPhase);
              elbR = -1.25 - rs * 0.35;
              elbL = -1.05 + Math.cos(rp.reloadPhase * 1.2) * 0.30;
            } else if (heldPose) {
              // Holding a weapon: elbows stay tucked, breathing slightly, tighter on ADS.
              const tuck = -0.62 - adsBlend * 0.28;
              const jog = moving ? Math.sin(rp.walkPhase) * 0.09 * stride : 0;
              elbR = tuck + jog;
              elbL = tuck - jog;
            } else {
              // Free arms (knife / med kit / empty): elbows swing opposite the legs.
              const swing = moving ? Math.sin(rp.walkPhase) * 0.42 * stride : 0;
              const idle = Math.sin(rp.idlePhase * 1.1) * 0.05;
              elbR = -0.42 - Math.max(0, swing) - idle;
              elbL = -0.42 - Math.max(0, -swing) + idle;
            }
            rp.rightElbow.rotation.x = dampScalar(rp.rightElbow.rotation.x, elbR, dt, 12);
            rp.leftElbow.rotation.x = dampScalar(rp.leftElbow.rotation.x, elbL, dt, 12);
          }

          if (heldPose) {
            applyRemoteTwoHandStance(rp, dt, moving, wSin, rp.idlePhase, adsBlend);
          } else {
            rp.leftArm.rotation.x = dampScalar(rp.leftArm.rotation.x, targetLX, dt, 11);
            rp.rightArm.rotation.x = dampScalar(rp.rightArm.rotation.x, targetRX, dt, 11);
            rp.leftArm.rotation.y = dampScalar(rp.leftArm.rotation.y, targetLY, dt, 10);
            rp.rightArm.rotation.y = dampScalar(rp.rightArm.rotation.y, targetRY, dt, 10);
            // Real shoulder swing, opposite the legs, scaled by speed. Previously the arms
            // were damped to a fixed stance angle and barely moved while running.
            const armSwing = moving ? -Math.sin(rp.walkPhase) * 0.55 * stride : 0;
            targetRX += armSwing;
            targetLX -= armSwing;
            const lut =
              REMOTE_WALK_PHASE_LUT[
                Math.abs(((rp.walkPhase * 15.25) | 0) % REMOTE_WALK_PHASE_LUT.length)
              ];
            const lutShoulder = lut ? lut.shoulder : 0;
            rp.leftArm.rotation.z = dampScalar(
              rp.leftArm.rotation.z,
              targetLZ +
                (moving ? Math.cos(rp.walkPhase * 0.92) * 0.07 : Math.sin(rp.idlePhase) * 0.02) +
                lutShoulder * 0.1,
              dt,
              11
            );
            rp.rightArm.rotation.z = dampScalar(
              rp.rightArm.rotation.z,
              targetRZ +
                (moving ? -Math.cos(rp.walkPhase * 0.92) * 0.07 : -Math.sin(rp.idlePhase * 1.1) * 0.02) -
                lutShoulder * 0.1,
              dt,
              11
            );
          }
        }
      }

      if (paused || (started && menuEl.style.display === "none" && !gameWorldReady)) {
        tickFpsMeter(dt);
        renderer.render(scene, camera);
        return;
      }

      updatePlayer(dt);
      updateWeapon(dt);

      const fx = getQualityPresentationScale();
      if (player.health > 0 && started) {
        const sh = state.camShake;
        if (sh > 1e-5) {
          camera.position.x += (Math.random() - 0.5) * sh * 0.72;
          camera.position.y += (Math.random() - 0.5) * sh * 0.32;
          state.camShake *= Math.pow(0.18, dt * 52);
        } else {
          state.camShake = 0;
        }
        const moving =
          !isMedKitHoldHealing() &&
          (keys.w || keys.a || keys.s || keys.d) &&
          player.onGround &&
          player.health > 0;
        if (moving) {
          camera.position.x += Math.sin(state.walkPhase * 2.08) * 0.027 * fx;
          camera.position.z += Math.cos(state.walkPhase * 1.65) * 0.014 * fx;
        }
      }

      if (isTrainingMap(CURRENT_MAP) && gameWorldReady) {
        updateTrainingDummies(dt);
        updateAnimationShowcase(dt);
      }
      // Outside the training-map block: this was nested inside it, so checkpoints, the
      // fall-reset and the exit check never ran on the gauntlet map at all.
      updateGauntlet(dt);

      updateInvBar();
      updateSpeedNeedle(dt);
      updateJetHarness(dt);
      updateJetHud();
      updateAltGauge();
      updateStaminaHud();
      updateHealthBarHud();

      if (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP)) {
        // This block only runs on zombie maps, so the map predicates below are constant true.
        const runZombieAi =
          gameWorldReady &&
          (player.health > 0 ||
            (MULTIPLAYER && ARENA_COOP && ZOMBIE_AUTHORITY));
        if (runZombieAi) {
          // Guard the AI step: an exception here must never abort the frame
          // before renderer.render() runs, or the game visibly stutters.
          try {
            updateEnemies(dt);
          } catch (eAi) {
            if (typeof console !== "undefined") console.error("updateEnemies failed", eAi);
          }
        }
        if (gameWorldReady) updateBossProjectiles(dt);
        if (gameWorldReady) updateBossVictory(dt);
        // ── Boss 震 cycle timer + HUD ────────────────────────────────────────
        if (gameWorldReady && isBossArenaMap(CURRENT_MAP)) {
          const _anyBoss = state.enemies.some(e => e.isBoss && e.alive);
          const _bossShakeBar = _bossShakeBarEl || (_bossShakeBarEl = document.getElementById("bossShakeBar"));
          if (_anyBoss) {
            const _prevPos = bossShakeTimerMs % BOSS_SHAKE_CYCLE_MS;
            bossShakeTimerMs += dt * 1000;
            const _newPos = bossShakeTimerMs % BOSS_SHAKE_CYCLE_MS;
            const _cycleReset = _newPos < _prevPos;
            // Detect LOCKED→OPEN crossing: window just opened → trigger 震
            if (_prevPos < BOSS_DASH_LOCK_MS && _newPos >= BOSS_DASH_LOCK_MS) {
              // 震 triggered
              state.camShake = Math.max(state.camShake || 0, 0.9);
              showCombatFeedback(tr("bossShakeDashOpenToast", "⚡ SHAKE · DASH OPEN 4s!"), "#48c778", 1.5);
              // Tremor SFX
              if (audioCtx && audioSfx) {
                const _t0 = audioCtx.currentTime;
                const _nb = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.6), audioCtx.sampleRate);
                const _nd = _nb.getChannelData(0);
                for (let _qi = 0; _qi < _nd.length; _qi++) _nd[_qi] = (Math.random()*2-1) * Math.exp(-_qi/_nd.length*4);
                const _ns = audioCtx.createBufferSource(); _ns.buffer = _nb;
                const _lp = audioCtx.createBiquadFilter(); _lp.type = "lowpass";
                _lp.frequency.setValueAtTime(200, _t0); _lp.frequency.exponentialRampToValueAtTime(30, _t0+0.5);
                const _gg = audioCtx.createGain();
                _gg.gain.setValueAtTime(1.4, _t0); _gg.gain.exponentialRampToValueAtTime(0.0001, _t0+0.55);
                _ns.connect(_lp); _lp.connect(_gg); _gg.connect(audioSfx);
                _ns.start(_t0); _ns.stop(_t0+0.6);
                const _osc = audioCtx.createOscillator(); _osc.type="sine";
                _osc.frequency.setValueAtTime(55, _t0); _osc.frequency.exponentialRampToValueAtTime(12, _t0+0.55);
                const _og = audioCtx.createGain();
                _og.gain.setValueAtTime(0.8, _t0); _og.gain.exponentialRampToValueAtTime(0.0001, _t0+0.55);
                _osc.connect(_og); _og.connect(audioSfx); _osc.start(_t0); _osc.stop(_t0+0.6);
              }
            }
            // Detect OPEN→LOCKED (cycle resets while open)
            if (_cycleReset && _prevPos >= BOSS_DASH_LOCK_MS) {
              showCombatFeedback(tr("bossShakeDashLockedToast", "SHAKE LOCKED 11s"), "#fc8181", 1.0);
            }
            // Update HUD bar
            if (_bossShakeBar) {
              _bossShakeBar.style.display = "block";
              const _ratio = _newPos / BOSS_SHAKE_CYCLE_MS;
              const _isOpen = _newPos >= BOSS_DASH_LOCK_MS;
              const _fill = _bossShakeBarFillEl || (_bossShakeBarFillEl = document.getElementById("bossShakeBarFill"));
              const _lbl  = _bossShakeBarLabelEl || (_bossShakeBarLabelEl = document.getElementById("bossShakeLabel"));
              if (_fill) _fill.style.width = (_ratio * 100).toFixed(1) + "%";
              if (_fill) _fill.style.background = _isOpen ? "#276749" : "#c53030";
              if (_lbl) {
                if (_isOpen) {
                  const _tLeft = ((BOSS_SHAKE_CYCLE_MS - _newPos) / 1000).toFixed(1);
                  _lbl.textContent = "⚡ " + tr("bossDashOpen", "DASH OPEN") + " " + _tLeft + "s";
                  _lbl.style.color = "#48c778";
                } else {
                  const _tLock = ((BOSS_DASH_LOCK_MS - _newPos) / 1000).toFixed(1);
                  _lbl.textContent = tr("bossShakeLockedSecs", "SHAKE LOCKED {s}s").replace("{s}", _tLock);
                  _lbl.style.color = "#fc8181";
                }
              }
            }
          } else {
            // No boss alive: hide bar, reset timer
            if (_bossShakeBar) _bossShakeBar.style.display = "none";
            bossShakeTimerMs = 0;
          }
        }
        if (gameWorldReady && bossDeathPickupPos && !bossDeathPickupPos._picked) {
          const pdx = player.position.x - bossDeathPickupPos.x;
          const pdz = player.position.z - bossDeathPickupPos.z;
          if (pdx * pdx + pdz * pdz < 4) {
            bossDeathPickupPos._picked = true;
            DEV_GUN_UNLOCKED = true;
            // 地狱模式走进光圈：给"终极"成就并移除光圈
            if (BOSS_HELL_MODE) {
              unlockAchievement("ultimate");
              clearHellLootRing();
            }
            persistUnlocks();
            const msg = document.createElement("div");
            msg.style.cssText = "position:fixed;top:35%;left:50%;transform:translate(-50%,-50%);font-size:36px;font-weight:900;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,0.8),0 0 40px rgba(255,165,0,0.5);letter-spacing:4px;z-index:9999;pointer-events:none;opacity:0;animation:bossVicFadeIn 1s ease forwards;";
            msg.textContent = tr("devGunPickup", "Got ～～～ — press / to equip");
            document.body.appendChild(msg);
            setTimeout(() => {
              msg.style.animation = "bossVicFadeOut 1.5s ease forwards";
              setTimeout(() => { if (msg.parentNode) msg.remove(); }, 1600);
            }, 4000);
          }
        }
        if (gameWorldReady && MULTIPLAYER && ARENA_COOP && ZOMBIE_AUTHORITY) {
          _zombieSyncAcc += dt;
          if (_zombieSyncAcc >= 1 / 14) {
            _zombieSyncAcc = 0;
            socket.emit("zombieSync", {
              score: state.score,
              zombies: state.enemies.map((e, idx) => {
                const zd = {
                  i: e.netIndex ?? idx,
                  x: e.group.position.x,
                  z: e.group.position.z,
                  y: e.visYaw,
                  hp: e.hp,
                  a: e.alive ? 1 : 0,
                  rt: e.respawnTimer,
                };
                // v33: include boss-specific identity so joiners can spawn missing bosses
                // (BOSS_FIGHT_COUNT / HELL mode aren't synced via the lobby).
                if (e.isBoss) {
                  zd.bm = e.bossMode;
                  zd.hell = !!e.isHellBoss;
                }
                return zd;
              }),
            });
          }
        }
      }

      if (isArenaLikeMap(CURRENT_MAP) && started && gameWorldReady) {
        updateInfiniteMaze(dt);
        processOneMazeChunkBuild();
        cullMazeLightsNearCamera();
      }

      if (isPvpCrossfireMap(CURRENT_MAP) && MULTIPLAYER && player.health <= 0) {
        const first = remotePlayers.values().next().value;
        if (first) {
          const sx = first.visX ?? first.x;
          const sz = first.visZ ?? first.z;
          camera.position.set(sx, first.y, sz);
          camera.rotation.y = first.visYaw ?? (first.yaw + Math.PI);
          camera.rotation.x = 0;
        }
      }

      // Death fade + camera drift + revealing the DEFEAT panel. This used to live inside the
      // `isArenaLikeMap || isBossArenaMap` block, so on any other map (training especially)
      // nothing ever revealed deathUI: dying just froze you in place with no buttons and no
      // way out but a reload. Nothing here is arena-specific — the function already returns
      // immediately when alive or on a PvP map, where showDeathScreen shows the panel itself.
      if (gameWorldReady) updateDeathAnim(dt);

      updateEffects(dt);
      tickFpsMeter(dt);
      _renderTick++;
      if ((_renderTick & 1) === 0) {
        updateHud();
      }

      if (
        player.health > 0 &&
        !paused &&
        state.weaponIndex !== 4 &&
        weapon().auto &&
        (state.mouseDown || (keys.v && canFireWithoutMouse()))
      ) {
        tryShoot();
      }

      renderer.render(scene, camera);
    }

    const clock = new THREE.Clock();

    /** Build a 5×5 ring of maze chunks around the player chunk so LOS / nav / spawns are consistent before gameplay. */
    function ensureArenaBootstrapChunks() {
      const pcx = Math.floor(player.position.x / MAZE_CHUNK_WORLD);
      const pcz = Math.floor(player.position.z / MAZE_CHUNK_WORLD);
      // Build only the 3x3 ring synchronously; processOneMazeChunkBuild streams the
      // outer 5x5 in the first ~1s — shaves the dominant spawn/restart hitch.
      const R = 1;
      for (let dz = -R; dz <= R; dz++) {
        for (let dx = -R; dx <= R; dx++) {
          buildMazeChunk(pcx + dx, pcz + dz);
        }
      }
    }

    function loadBootImage(url) {
      return new Promise((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => resolve();
        im.onerror = () => reject(new Error("img"));
        im.src = url;
      });
    }

    async function preloadWallTextureForBoot() {
      const urls = getWallTextureUrlList();
      for (const u of urls) {
        try {
          await new Promise((resolve, reject) => {
            const _to = setTimeout(() => reject(new Error("tex-timeout")), 3000);
            texLoader.load(u, () => { clearTimeout(_to); resolve(); }, undefined, () => { clearTimeout(_to); reject(new Error("tex-err")); });
          });
          return;
        } catch (_) {}
      }
    }

    async function preloadBootImageFirstAvailable(relCandidates) {
      const list = Array.isArray(relCandidates) ? relCandidates : [relCandidates];
      let lastErr = null;
      for (const rel of list) {
        const bases = getGameAssetBaseCandidates();
        for (const b of bases) {
          try {
            const u = new URL(rel, normalizeGameAssetBase(b)).href;
            await loadBootImage(u);
            return;
          } catch (e) {
            lastErr = e;
          }
        }
      }
      if (lastErr) console.warn("[boot] missing image", list.join(" | "));
    }

    async function preloadCriticalGameAssets() {
      const _hardTimeout = new Promise(res => setTimeout(res, 5000));
      const _doLoad = async () => {
        const L = __GAME_UI_LAYOUTS__;
        await Promise.all([
          preloadBootImageFirstAvailable(L.map((x) => x.menuBg)),
          preloadBootImageFirstAvailable(L.map((x) => x.btnTex)),
          preloadBootImageFirstAvailable(L.map((x) => x.settingsBg)),
        ]);
        await preloadWallTextureForBoot();
      };
      await Promise.race([_doLoad(), _hardTimeout]);
    }

    async function bootGame(mapName, multiplayer, arenaCoop, trainingCoop) {
      gameWorldReady = false;
      gameBootOverlay.style.display = "flex";
      gameBootOverlay.setAttribute("aria-busy", "true");
      gameBootLabel.textContent = "Building world…";
      weaponRoot.visible = false;
      needleRoot.visible = false;
      state.speedNeedle.phase = 'idle'; state.speedNeedle.timer = 0; state.speedNeedle.charges = 1;
      jetRoot.visible = false;
      state.jet.phase = 'idle'; state.jet.startMs = 0; state.jet.endMs = 0;
      state.jet.charges = 1; state.jet.netState = 0;
      state.dashIsJet = false;
      player.fallApexY = null;
      if (_healthBarWrap) _healthBarWrap.style.display = "none";
      if (_castBarWrap)   _castBarWrap.style.display   = "none";
      setLocalPlayerLights(false);
      syncGameRendererSize();

      hideDeathScreen();
      hidePause();
      closeChat();
      chatMessages.innerHTML = "";
      chatLog.length = 0;
      hitDirContainer.innerHTML = "";
      hitIndicators.length = 0;
      CURRENT_MAP = mapName;
      if (isBrightIndoorMap(CURRENT_MAP)) playerLightsPreference = false;
      if (multiplayer !== undefined) {
        MULTIPLAYER = multiplayer;
        if (!multiplayer) ARENA_COOP = false;
      }
      if (arenaCoop !== undefined) ARENA_COOP = !!arenaCoop;
      if (trainingCoop !== undefined) TRAINING_COOP = !!trainingCoop;
      else if (!isTrainingMap(mapName)) TRAINING_COOP = false;
      if (MULTIPLAYER && ARENA_COOP) {
        ZOMBIE_HOST_KNOWN = false;
        ZOMBIE_AUTHORITY = false;
      } else {
        ZOMBIE_HOST_KNOWN = true;
      }
      _zombieSyncAcc = 0;
      state.camShake = 0;
      ensureAmbientWindLoop();
      menuEl.style.display = "none";
      const _gearBtn = document.getElementById("btnMenuSettings"); if(_gearBtn) _gearBtn.style.display="none";
      const _trophyBtn = document.getElementById("btnAchievements"); if(_trophyBtn) _trophyBtn.style.display="none";
      setGameActiveUi(true);
      bumpRendererLayoutSync(280);
      stopMenuBackdropLoop();
      pauseMenuBgm();

      bossDeathPickupPos = null;
      if (!isTrainingMap(mapName)) removeAnimationShowcase();
      clearHellLootRing();
      sessionKillCount = 0;
      sessionBossKillCount = 0;
      pvpKillStreak = 0;
      reviveAdWatchedThisLife = false;
      loadUnlocks();
      sanitizeLoadoutSelection();
      setWeapon(0);

      clearMap();

      if (MULTIPLAYER && activeRoomId) {
        emitJoinRoomWithAck();
        queueMicrotask(() => emitJoinRoomWithAck());
      }

      positionPlayerForCurrentMap();
      if (isBossArenaMap(CURRENT_MAP)) {
        BOSS_ROUND = BOSS_HELL_MODE ? 4 : 1;
        BOSS_ROUND_ACTIVE = true;
        bossVictoryActive = false;
        bossVictoryMsgShown = false;
        bossVictoryTimer = 0;
        const oldOvl = document.getElementById("bossVictoryOverlay");
        if (oldOvl) oldOvl.remove();
      }

      MAP_BUILDERS[CURRENT_MAP]();
      applySceneFogAndCameraFar();

      if (isArenaLikeMap(CURRENT_MAP)) {
        applyArenaMazePlayerSpawn();
        ensureArenaBootstrapChunks();
      }

      buildNavGrid();

      for (const enemy of state.enemies) {
        scene.remove(enemy.group);
      }
      state.enemies.length = 0;
      for (const bp of bossProjectiles) { scene.remove(bp.mesh); }
      bossProjectiles.length = 0;

      if (isTrainingMap(CURRENT_MAP)) {
        rebuildTrainingDummies();
      } else if (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP) || isGauntletMap(CURRENT_MAP)) {
        // Gauntlet was missing here, so levels 6-20 loaded with an empty course.
        rebuildEnemyRoster();
        if (isArenaLikeMap(CURRENT_MAP)) {
          for (const e of state.enemies) {
            e.group.visible = false;
          }
        }
      }

      player.velocityY = 0;
      player.onGround = true;
      // Every map spawns looking down -Z; the training range used to spawn facing the wall.
      player.yaw = 0;
      player.pitch = 0;
      camera.position.copy(player.position);

      state.score = 0;
      player.health = player.maxHealth;
      if (MULTIPLAYER && isPvpCrossfireMap(CURRENT_MAP)) {
        try {
          socket.emit("playerRespawn", { id: socket.id });
        } catch (_) {}
      }
      player.regenTimer = 0;
      state.ads = false;
      state.adsProgress = 0;
      state.adsFiredWhileScoping = false;
      state.mouseDown = false;
      state.reloading = false;
      state.slowUntil = 0;
      state.recoil = 0;
      state.recoilPitchAccum = 0;
      state.recoilYawAccum = 0;
      state.spreadBloom = 0;
      state.walkPhase = 0;
      state.smoothHeadBob = 0;
      state.weaponBobX = 0;
      state.weaponBobY = 0;
      state.weaponBobRotZ = 0;
      killerEnemy = null;
      deathAnimTime = 0;

      for (const w of weapons) {
        w.ammo = w.magSize;
      }
      resetMedKitChargeState();

      // Spawn holding the first gun in the backpack — pistol only if that is what you packed.
      setWeapon(0);
      ensureWeaponAllowed();
      updateHud();

      if (!started) {
        started = true;
        animate();
      }

      try {
        gameBootLabel.textContent = "Loading assets…";
        await preloadCriticalGameAssets();
      } catch (err) {
        console.warn("[boot] asset preload", err);
      }

      if (isArenaLikeMap(CURRENT_MAP) || isBossArenaMap(CURRENT_MAP)) {
        for (const e of state.enemies) {
          if (e.alive) e.group.visible = true;
        }
      }

      compileSceneShaders();

      weaponRoot.visible = true;
      gameWorldReady = true;
      if (isBossArenaMap(CURRENT_MAP)) tryPlayBossBgm(BOSS_HELL_MODE);
      else if (isArenaLikeMap(CURRENT_MAP)) tryPlayArenaBgm();
      else if (isPvpCrossfireMap(CURRENT_MAP)) tryPlayPvpBgm();
      try {
        renderer.domElement.tabIndex = 0;
      } catch (_) {}
      bumpRendererLayoutSync(320);
      setTrainingScoreboardVisible(isTrainingMap(CURRENT_MAP));
      updateQuestHud();
      if (isTrainingMap(CURRENT_MAP)) updateTrainingScoreboardUI();
      player.spawnProtectUntil = performance.now() + 3000;
      refreshLocalPlayerLightsForCurrentState();
      gameBootOverlay.style.display = "none";
      gameBootOverlay.setAttribute("aria-busy", "false");
      updateClickHintVisibility();
      if (gameSettings.skipClickToPlay) {
        tryAutoCapturePointer();
        setTimeout(tryAutoCapturePointer, 120);
        setTimeout(tryAutoCapturePointer, 420);
      }
    }

    function startGame(mapName, multiplayer, arenaCoop, trainingCoop) {
      // Freeze the backpack for this match — from here the pick is read-only until the
      // player backs out to the menu (goToMenu clears it).
      lockLoadoutForMap(mapName);
      try { _buildInvBar(); } catch (_) {}
      void bootGame(mapName, multiplayer, arenaCoop, trainingCoop);
    }

    function restartCurrentMap() {
      startGame(CURRENT_MAP, MULTIPLAYER, ARENA_COOP, TRAINING_COOP);
    }

    function goToMenu() {
      clearActiveLoadout();
      if (_gClearEl) _gClearEl.style.display = "none";
      gauntletCourse = null;
      hideDeathScreen();
      hidePause();
      closeSettingsModal();
      MULTIPLAYER = false;
      ROOM_CODE = "";
      activeRoomId = "";
      ARENA_COOP = false;
      TRAINING_COOP = false;
      ZOMBIE_AUTHORITY = false;
      setTrainingScoreboardVisible(false);
      ZOMBIE_HOST_KNOWN = true;
      _zombieSyncAcc = 0;
      gameWorldReady = false;
      setGameActiveUi(false);
      clearLocalDeathGhost();
      gameBootOverlay.style.display = "none";
      gameBootOverlay.setAttribute("aria-busy", "false");
      menuEl.style.display = "flex";
      { const gb = document.getElementById("btnMenuSettings"); if(gb) gb.style.display=""; }
      { const tb = document.getElementById("btnAchievements"); if(tb) tb.style.display=""; }
      showMenuPanel("menuMain");
      startMenuBackdropLoop();
      pauseBossBgm();
      pauseArenaBgm();
      pausePvpBgm();
      tryPlayMenuBgm();
      player.health = 100;
      weaponRoot.visible = true;
      camera.fov = 75;
      camera.updateProjectionMatrix();
      for (const enemy of state.enemies) {
        scene.remove(enemy.group);
      }
      state.enemies.length = 0;
      for (const bp of bossProjectiles) { scene.remove(bp.mesh); }
      bossProjectiles.length = 0;
      removeAnimationShowcase();
      for (const [id, rp] of remotePlayers) {
        scene.remove(rp.group);
      }
      remotePlayers.clear();
      setLocalPlayerLights(false);
      floor.visible = true;
      ceiling.visible = true;
      try {
        applyLanguageUI();
      } catch (_) {}
    }

    let _gauntletPanel = null;
    function buildGauntletPanel() {
      const wrap = document.querySelector(".menu-panels-wrap");
      if (!wrap || _gauntletPanel) return;
      const panel = document.createElement("div");
      panel.id = "menuGauntlet";
      panel.className = "menu-subpanel menu-subpanel--wide";
      panel.style.display = "none";

      const back = document.createElement("button");
      back.type = "button";
      back.className = "menu-float-icon menu-back-btn";
      back.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      back.addEventListener("click", () => showMenuPanel("menuStart"));

      const h = document.createElement("h2");
      h.className = "menu-title";
      h.textContent = tr("gauntletTitle", "GAUNTLET");

      const desc = document.createElement("p");
      desc.className = "menu-desc";
      desc.textContent = tr(
        "gauntletDesc",
        "20 levels. Reach the exit — clearing the room is never required. 1-5 movement, 6-15 zombies, 16-20 boss."
      );

      const grid = document.createElement("div");
      grid.style.cssText =
        "display:grid;grid-template-columns:repeat(5,58px);gap:8px;margin-top:6px;justify-content:center;";

      panel.appendChild(back);
      panel.appendChild(h);
      panel.appendChild(desc);
      panel.appendChild(grid);
      wrap.appendChild(panel);
      _gauntletPanel = { panel, grid };
    }

    function refreshGauntletPanel() {
      buildGauntletPanel();
      if (!_gauntletPanel) return;
      const { grid } = _gauntletPanel;
      grid.innerHTML = "";
      const done = gauntletProgress();
      for (let lv = 1; lv <= GAUNTLET_LEVEL_COUNT; lv++) {
        const spec = GAUNTLET_LEVELS[lv - 1];
        const locked = lv > done + 1;
        const btn = document.createElement("button");
        btn.type = "button";
        const tint = spec.boss ? "#ff7a7a" : spec.z ? "#ffd36a" : "#8fd8ff";
        btn.style.cssText =
          "width:58px;height:52px;border-radius:8px;cursor:" + (locked ? "not-allowed" : "pointer") +
          ";font:700 17px/1 Audiowide,Arial,sans-serif;display:flex;flex-direction:column;" +
          "align-items:center;justify-content:center;gap:3px;transition:all .12s;" +
          (locked
            ? "border:1px solid #3a4048;background:rgba(20,24,30,0.55);color:#5f6a76;"
            : "border:1px solid " + tint + ";background:rgba(20,24,30,0.8);color:" + tint + ";");
        const tag = lv <= done ? "✓" : spec.hell ? "☠" : spec.boss ? "☣" : spec.z ? "z" : "»";
        btn.innerHTML = lv + '<span style="font-size:9px;opacity:0.8;">' + (locked ? "🔒" : tag) + "</span>";
        btn.title = locked ? tr("gauntletLocked", "Locked") : (lv + " · " + spec.name);
        if (!locked) btn.addEventListener("click", () => startGauntletLevel(lv));
        grid.appendChild(btn);
      }
    }

    function startGauntletLevel(level) {
      gauntletLevel = THREE.MathUtils.clamp(level | 0, 1, GAUNTLET_LEVEL_COUNT);
      void bootGame("gauntlet", false, false, false);
    }

    function showMenuPanel(id) {
      // Query-based rather than a hardcoded list, so panels injected from JS (the backpack
      // screen) are hidden along with the rest instead of stacking on top of them.
      for (const p of document.querySelectorAll("#menuMain, .menu-subpanel")) p.style.display = "none";
      clearLobbyErr();
      document.getElementById(id).style.display = "flex";
    }

    /* ── Backpack screen ──────────────────────────────────────────────────
     * Built entirely from JS and injected into the existing menu markup, so index.html
     * needs no changes. Pick up to two guns; the med kit, knife, speed needle and jet
     * harness are shown as permanent kit and cannot be toggled.
     */
    let _loadoutPanel = null;
    let _loadoutCards = [];
    let _armorCards = { helmet: [], vest: [] };

    function loadoutCardStyle(selected, locked) {
      const base = "display:flex;flex-direction:column;align-items:center;gap:6px;width:120px;"
        + "padding:10px 8px;border-radius:10px;cursor:pointer;user-select:none;"
        + "font:600 12px/1.25 Audiowide,Arial,sans-serif;text-align:center;transition:all .12s;";
      if (locked) return base + "border:1px solid #3a4048;background:rgba(20,24,30,0.55);color:#5f6a76;cursor:not-allowed;";
      if (selected) return base + "border:1px solid #4fd1ff;background:rgba(79,209,255,0.20);color:#dff6ff;box-shadow:0 0 12px rgba(79,209,255,0.35);";
      return base + "border:1px solid #4a5460;background:rgba(20,24,30,0.75);color:#b9c4d0;";
    }

    function buildLoadoutPanel() {
      const wrap = document.querySelector(".menu-panels-wrap");
      if (!wrap || _loadoutPanel) return;
      const panel = document.createElement("div");
      panel.id = "menuLoadout";
      panel.className = "menu-subpanel menu-subpanel--wide";
      panel.style.display = "none";

      const back = document.createElement("button");
      back.type = "button";
      back.className = "menu-float-icon menu-back-btn";
      back.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      back.addEventListener("click", () => showMenuPanel("menuMain"));

      const h = document.createElement("h2");
      h.className = "menu-title";
      h.textContent = tr("loadoutTitle", "BACKPACK");

      const desc = document.createElement("p");
      desc.className = "menu-desc";
      desc.id = "loadoutDesc";

      const grid = document.createElement("div");
      grid.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:6px 0 14px 0;";

      _loadoutCards = [];
      for (const widx of LOADOUT_GUN_POOL) {
        const card = document.createElement("div");
        card.dataset.widx = widx;
        const cnv = document.createElement("canvas");
        cnv.width = INV_CW; cnv.height = INV_CH;
        cnv.style.cssText = `width:${INV_CW}px;height:${INV_CH}px;`;
        try { drawWeaponIcon(cnv.getContext("2d"), widx, INV_CW, INV_CH); } catch (_) {}
        const nm = document.createElement("div");
        card.appendChild(cnv);
        card.appendChild(nm);
        card.addEventListener("click", () => toggleLoadoutGun(widx));
        grid.appendChild(card);
        _loadoutCards.push({ card, nm, widx });
      }

      const fixed = document.createElement("div");
      fixed.id = "loadoutFixed";
      fixed.style.cssText = "font:600 12px/1.7 Audiowide,Arial,sans-serif;color:#9fb0c0;"
        + "border-top:1px solid rgba(255,255,255,0.12);padding-top:10px;max-width:560px;margin:0 auto;";

      // ── Armour rows ────────────────────────────────────────────────────
      const armorWrap = document.createElement("div");
      armorWrap.style.cssText = "border-top:1px solid rgba(255,255,255,0.12);padding-top:12px;margin-top:2px;";
      _armorCards = { helmet: [], vest: [] };
      const mkRow = (kind, table, labelTxt) => {
        const rowLbl = document.createElement("div");
        rowLbl.style.cssText = "font:600 12px/1.6 Audiowide,Arial,sans-serif;color:#9fb0c0;letter-spacing:2px;margin-bottom:4px;";
        rowLbl.textContent = labelTxt;
        const row = document.createElement("div");
        row.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:12px;";
        table.forEach((piece, i) => {
          const c = document.createElement("div");
          c.addEventListener("click", () => {
            if (kind === "helmet") armorHelmet = i; else armorVest = i;
            saveArmor();
            syncLoadoutPanel();
          });
          row.appendChild(c);
          _armorCards[kind].push({ el: c, i, piece });
        });
        armorWrap.appendChild(rowLbl);
        armorWrap.appendChild(row);
      };
      mkRow("helmet", ARMOR_HELMETS, tr("armorHelmetRow", "HELMET  —  head protection · narrows view · dulls hit direction"));
      mkRow("vest", ARMOR_VESTS, tr("armorVestRow", "VEST  —  body/leg protection · slower move, reload and item use"));

      panel.appendChild(back);
      panel.appendChild(h);
      panel.appendChild(desc);
      panel.appendChild(grid);
      panel.appendChild(armorWrap);
      panel.appendChild(fixed);
      wrap.appendChild(panel);
      _loadoutPanel = panel;

      // Entry point on the main menu, right under Training Camp.
      const main = document.getElementById("menuMain");
      const trainBtn = document.getElementById("btnTraining");
      if (main && trainBtn && !document.getElementById("btnLoadout")) {
        const b = document.createElement("button");
        b.type = "button";
        b.id = "btnLoadout";
        b.textContent = tr("btnLoadout", "BACKPACK");
        b.addEventListener("click", () => { syncLoadoutPanel(); showMenuPanel("menuLoadout"); });
        trainBtn.insertAdjacentElement("afterend", b);
      }
    }

    function toggleLoadoutGun(widx) {
      if (!weaponUnlocked[widx]) return;
      const at = loadoutGuns.indexOf(widx);
      if (at >= 0) {
        // Never let the bag go empty — you would spawn with nothing but a knife.
        if (loadoutGuns.length <= 1) return;
        loadoutGuns.splice(at, 1);
      } else {
        // Full bag: the oldest pick drops out, so a click always does something visible.
        if (loadoutGuns.length >= LOADOUT_MAX_GUNS) loadoutGuns.shift();
        loadoutGuns.push(widx);
      }
      saveLoadout();
      syncLoadoutPanel();
    }

    function syncArmorCards() {
      const pct = (v) => (v * 100).toFixed(0) + "%";
      for (const kind of ["helmet", "vest"]) {
        const cur = kind === "helmet" ? armorHelmet : armorVest;
        for (const { el, i, piece } of _armorCards[kind]) {
          const sel = i === cur;
          el.style.cssText = loadoutCardStyle(sel, false) + "width:132px;";
          const cost = kind === "helmet"
            ? `${tr("armorFov", "view")} ${pct(piece.fovMul)} · ${tr("armorSense", "sense")} ${pct(piece.hitFade)}`
            : `${tr("armorSpeed", "speed")} ${pct(piece.speedMul)} · ${tr("armorAction", "actions")} ${pct(1 / piece.actionMul)}`;
          el.innerHTML =
            `<div style="font-size:13px;">${piece.name}</div>` +
            `<div style="color:#7ef5a0;font-size:11px;">−${pct(piece.mit)} ${tr("armorDmg", "dmg")}</div>` +
            (i === 0 ? `<div style="color:#7a8694;font-size:10px;">${tr("armorNoPenalty", "no penalty")}</div>`
                     : `<div style="color:#e8a06a;font-size:10px;">${cost}</div>`);
        }
      }
    }

    function syncLoadoutPanel() {
      if (!_loadoutPanel) return;
      syncArmorCards();
      sanitizeLoadoutSelection();
      for (const { card, nm, widx } of _loadoutCards) {
        const locked = !weaponUnlocked[widx];
        const sel = loadoutGuns.includes(widx);
        card.style.cssText = loadoutCardStyle(sel, locked);
        const slot = sel ? ` <span style="color:#4fd1ff;">[${loadoutGuns.indexOf(widx) + 1}]</span>` : "";
        nm.innerHTML = locked
          ? `${weaponDisplayName(widx)} 🔒`
          : `${weaponDisplayName(widx)}${slot}`;
      }
      const d = document.getElementById("loadoutDesc");
      if (d) {
        d.innerHTML = tr("loadoutDesc",
          "Pick <b>{n}</b> guns. Locked once a match starts — back out to the menu to change it. "
          + "The training range ignores the backpack and gives you everything.")
          .replace("{n}", String(LOADOUT_MAX_GUNS))
          + `<br><span style="color:#4fd1ff;">${loadoutGuns.length} / ${LOADOUT_MAX_GUNS}</span>`;
      }
      const f = document.getElementById("loadoutFixed");
      if (f) {
        f.innerHTML = `<b style="color:#dfe8f2;">${tr("loadoutAlways", "Always carried")}:</b> `
          + `${weaponDisplayName(LOADOUT_MED)} · ${weaponDisplayName(LOADOUT_KNIFE)} · `
          + `${tr("needleName", "Speed Needle")} · ${tr("jetName", "Jet Harness")}`;
      }
    }

    function showLobby(mode, title) {
      pendingLobbyMode = mode;
      lobbyTitle.textContent = title;
      clearLobbyErr();
      showMenuPanel("menuLobby");
    }

    function beginMultiplayerGame(mapName, roomOpts) {
      if (typeof roomOpts === "string") {
        activeRoomId = roomOpts;
        ROOM_CODE = roomOpts.includes(":") ? roomOpts.split(":").pop() : roomOpts;
      } else {
        activeRoomId = (roomOpts && roomOpts.roomKey) || "";
        ROOM_CODE = (roomOpts && roomOpts.roomCode) || "";
      }
      if (!activeRoomId) {
        showLobbyErr(tr("mpMissingRoomId", "Could not join — missing room id from server."));
        return;
      }
      /**
       * Map-sync (PVP). We build the variant we picked (creator/quickplay) or the one parsed from
       * the code we typed (join-by-code). The *display* room code is tagged with the variant so a
       * friend who joins by it builds the same map. activeRoomId stays the real server roomKey.
       */
      if (pendingLobbyMode === "crossfire") {
        mapName = PENDING_PVP_MAP === "crossfire_grid" ? "crossfire_grid" : "crossfire";
        PENDING_PVP_MAP = mapName;
        ROOM_CODE = makePvpShareCode(ROOM_CODE, mapName);
      }
      nameModal.style.display = "flex";
      nameInput.value = "";
      nameInput.focus();
      nameModal._pendingMap = mapName;
    }

    (function injectGauntletEntry() {
      const host = document.getElementById("menuStart");
      if (!host) return;
      const b = document.createElement("button");
      b.type = "button";
      b.id = "btnGauntlet";
      b.textContent = tr("btnGauntlet", "GAUNTLET");
      b.addEventListener("click", () => { refreshGauntletPanel(); showMenuPanel("menuGauntlet"); });
      host.appendChild(b);
    })();

    document.getElementById("btnStart").addEventListener("click", () => showMenuPanel("menuStart"));
    document.getElementById("btnStartBack").addEventListener("click", () => showMenuPanel("menuMain"));

    btnArena.addEventListener("click", () => showMenuPanel("menuArenaMode"));

    // The credit text was removed from index.html; the easter-egg click handlers
    // below are guarded with optional-chaining so a missing element is a no-op
    // rather than an unhandled promise rejection.
    const menuCreditsGameEl = document.getElementById("menuCreditsGame");
    if (menuCreditsGameEl) menuCreditsGameEl.addEventListener("click", () => tryEasterEggCredit(1));
    const menuCreditsMusicEl = document.getElementById("menuCreditsMusic");
    if (menuCreditsMusicEl) menuCreditsMusicEl.addEventListener("click", () => tryEasterEggCredit(2));

    /**
     * Open/close the achievements modal. Mirrors the settings-modal pattern:
     * overlay div, centered shell, close button + click-outside + Esc to close.
     */
    function openAchievementsModal() {
      const m = document.getElementById("achievementsModal");
      if (!m) return;
      renderAchievementsPanel();
      m.classList.add("open");
      m.style.display = "flex";
      // Hide the floating trophy icon so it doesn't sit on top of the modal's
      // own close button (the trophy is fixed bottom-right, the close is
      // fixed top-right inside the shell).
      const trophy = document.getElementById("btnAchievements");
      if (trophy) trophy.style.visibility = "hidden";
    }
    function closeAchievementsModal() {
      const m = document.getElementById("achievementsModal");
      if (!m) return;
      m.classList.remove("open");
      m.style.display = "none";
      const trophy = document.getElementById("btnAchievements");
      if (trophy) trophy.style.visibility = "";
      // Clear the detail panel so the next open starts fresh.
      const d = document.getElementById("achDetail");
      if (d) d.style.display = "none";
    }

    document.getElementById("btnAchievements").addEventListener("click", () => {
      openAchievementsModal();
    });
    document.getElementById("btnCloseAchievements").addEventListener("click", () => {
      closeAchievementsModal();
    });
    // Click outside the shell to close (the modal overlay is the wrapper div).
    document.getElementById("achievementsModal").addEventListener("click", (e) => {
      if (e.target.id === "achievementsModal") closeAchievementsModal();
    });
    // Esc closes the achievements modal (matches settings modal behavior).
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const m = document.getElementById("achievementsModal");
      if (m && m.classList.contains("open")) closeAchievementsModal();
    });
    btnArenaSingle.addEventListener("click", () => startGame("arena", false));
    btnArenaCoop.addEventListener("click", () => showLobby("arena-coop", tr("lobbyArenaCoop", "ARENA CO-OP")));
    btnArenaBack.addEventListener("click", () => showMenuPanel("menuStart"));

    btnBossFight.addEventListener("click", () => showMenuPanel("menuBossMode"));

    function openBossDifficulty(isCoop) {
      BOSS_IS_COOP = isCoop;
      BOSS_HELL_MODE = false;
      selectBossCount(1);
      setBossCountRowEnabled(true);
      const hellBtn = document.getElementById("btnBossHell");
      if (hellBtn) hellBtn.style.display = "";
      showMenuPanel("menuBossDifficulty");
    }
    btnBossSingle.addEventListener("click", () => openBossDifficulty(false));
    btnBossCoop.addEventListener("click", () => openBossDifficulty(true));

    btnBossBack.addEventListener("click", () => showMenuPanel("menuStart"));

    document.getElementById("btnBossDiffBack").addEventListener("click", () => showMenuPanel("menuBossMode"));

    /** Highlight the Nth boss-count button, set BOSS_FIGHT_COUNT, and reset the hell button look. */
    function selectBossCount(count) {
      BOSS_FIGHT_COUNT = count;
      for (const b of document.querySelectorAll(".bossDiffBtn")) {
        b.style.background = b.dataset.bossCount === String(count) ? "rgba(79,209,255,0.25)" : "transparent";
      }
      setHellButtonActive(false);
    }

    /** Clear every boss-count highlight (used when hell mode takes over the fight). */
    function clearBossDiffSelection() {
      for (const b of document.querySelectorAll(".bossDiffBtn")) b.style.background = "transparent";
    }

    /** Toggle the HELL MODE button look (active = lit red, inactive = dimmed). */
    function setHellButtonActive(active) {
      const hellBtn = document.getElementById("btnBossHell");
      if (!hellBtn) return;
      hellBtn.style.background = active ? "rgba(255,34,68,0.50)" : "rgba(255,34,68,0.22)";
      hellBtn.style.borderColor = active ? "#ff6688" : "#ff2244";
    }

    // Hell mode is a standalone mode: it always fights a single boss (that then
    // summons its own waves), so the 1/2/3 count selector is meaningless and is
    // greyed out / disabled while hell mode is active.
    function setBossCountRowEnabled(enabled) {
      const row = document.getElementById("bossCountRow");
      if (!row) return;
      row.style.opacity = enabled ? "1" : "0.35";
      row.style.pointerEvents = enabled ? "auto" : "none";
    }

    document.getElementById("btnBossHell").addEventListener("click", () => {
      // Hell mode is a standalone difficulty — toggle it on/off. While on, the
      // 1/2/3 count selector is greyed out (count is fixed at 1). Toggling off
      // returns to the normal count-based mode.
      if (BOSS_HELL_MODE) {
        BOSS_HELL_MODE = false;
        setBossCountRowEnabled(true);
        selectBossCount(1);
        return;
      }
      BOSS_HELL_MODE = true;
      BOSS_FIGHT_COUNT = 1;
      clearBossDiffSelection();
      setBossCountRowEnabled(false);
      setHellButtonActive(true);
    });

    document.getElementById("btnBossStartDiff").addEventListener("click", () => {
      if (BOSS_IS_COOP) {
        showLobby("boss-coop", "BOSS FIGHT — CO-OP");
      } else {
        startGame("boss_arena", false);
      }
    });

    for (const btn of document.querySelectorAll(".bossDiffBtn")) {
      btn.addEventListener("click", () => {
        // Selecting 1/2/3 deactivates hell mode
        BOSS_HELL_MODE = false;
        setBossCountRowEnabled(true);
        selectBossCount(parseInt(btn.dataset.bossCount, 10) || 1);
      });
    }

    btnTraining.addEventListener("click", () => showMenuPanel("menuTrainingMode"));
    btnTrainingSingle.addEventListener("click", () => startGame("training", false, false, false));
    btnTrainingCoop.addEventListener("click", () =>
      showLobby("training-coop", tr("lobbyTrainingCoop", "TRAINING CAMP — CO-OP"))
    );
    btnTrainingBack.addEventListener("click", () => showMenuPanel("menuMain"));

    btnCrossfire.addEventListener("click", () => {
      pendingLobbyMode = "crossfire";
      drawPvpMapPreviews();
      showMenuPanel("menuPvpMaps");
    });

    btnPvpMapClassic.addEventListener("click", () => {
      PENDING_PVP_MAP = "crossfire";
      showLobby("crossfire", tr("lobbyCrossfire", "PVP"));
    });
    btnPvpMapGrid.addEventListener("click", () => {
      PENDING_PVP_MAP = "crossfire_grid";
      showLobby("crossfire", tr("lobbyCrossfire", "PVP"));
    });

    btnPvpMapBack.addEventListener("click", () => showMenuPanel("menuStart"));

    /** Emit a lobby room request (quickplay / createRoom) and route the ack into the match flow. */
    function emitRoomRequest(eventName) {
      clearLobbyErr();
      if (!pendingLobbyMode) {
        showLobbyErr(tr("lobbyPickModeFirst", "Choose CO-OP or a PVP map first."));
        return;
      }
      // The relay only knows predefined modes; the chosen map travels in the share code we hand
      // back, so a friend who joins by that code lands on the same map.
      _pendingServerMode = pendingLobbyMode;
      socket.emit(eventName, _pendingServerMode, (res) => {
        if (res == null) {
          showLobbyErr(tr("mpNoServerAck", "No response from server."));
          return;
        }
        const norm = normalizeMatchAck(res);
        if (norm.error) {
          showLobbyErr(norm.error);
          return;
        }
        beginMultiplayerGame(lobbyMapFromPending(), { roomKey: norm.roomKey, roomCode: norm.roomCode });
      });
    }

    btnQuickplay.addEventListener("click", () => emitRoomRequest("quickplay"));
    btnCreateRoom.addEventListener("click", () => emitRoomRequest("createRoom"));

    btnJoinCode.addEventListener("click", () => {
      codeError.textContent = "";
      codeInput.value = "";
      clearLobbyErr();
      showMenuPanel("menuJoinCode");
    });

    btnCodeJoin.addEventListener("click", () => {
      const rawInput = codeInput.value.trim().toUpperCase();
      if (!rawInput) {
        codeError.textContent = tr("enterCodeError", "Enter a code");
        return;
      }
      if (!pendingLobbyMode) {
        codeError.textContent = tr("joinNeedModeFirst", "Go back and pick a mode first.");
        return;
      }
      // PVP share codes carry the host's map variant (e.g. "AB12-G" = grid). Strip it to get the
      // real server code, join with the plain mode, and adopt the host's map locally so both sides
      // build the identical world.
      let code = rawInput;
      if (pendingLobbyMode === "crossfire") {
        const parsed = parsePvpShareCode(rawInput);
        code = parsed.code;
        if (parsed.variant) PENDING_PVP_MAP = parsed.variant;
      }
      _pendingServerMode = pendingLobbyMode;
      // The host may be briefly offline (browser-throttled background tab, momentary network
      // blip). The relay keeps the room suspended until the host reconnects, so a single
      // joinByCode call races the host's reconnect. Retry a few times with a short backoff so
      // the friend doesn't have to mash the button while the host's tab wakes up.
      const RETRY_DELAYS_MS = [600, 1200, 2000];
      let attempt = 0;
      const tryJoin = () => {
        socket.emit("joinByCode", { code, mode: _pendingServerMode }, (res) => {
          if (res == null) {
            codeError.textContent = tr("mpNoServerAck", "No response from server.");
            return;
          }
          const norm = normalizeMatchAck(res);
          if (norm.error) {
            if (norm.error === "Room not found" && attempt < RETRY_DELAYS_MS.length) {
              codeError.textContent = tr("mpWaitingForHost", "Waiting for host to reconnect…");
              const delay = RETRY_DELAYS_MS[attempt++];
              setTimeout(tryJoin, delay);
              return;
            }
            codeError.textContent = norm.error;
            return;
          }
          beginMultiplayerGame(lobbyMapFromPending(), { roomKey: norm.roomKey, roomCode: norm.roomCode || code });
        });
      };
      tryJoin();
    });

    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnCodeJoin.click();
    });

    btnCodeBack.addEventListener("click", () => showMenuPanel("menuLobby"));
    btnLobbyBack.addEventListener("click", () => {
      if (pendingLobbyMode === "crossfire") showMenuPanel("menuStart");
      else if (pendingLobbyMode === "training-coop") showMenuPanel("menuTrainingMode");
      else if (pendingLobbyMode === "boss-coop") showMenuPanel("menuBossDifficulty");
      else showMenuPanel("menuArenaMode");
    });

    btnNameOk.addEventListener("click", () => {
      playerName = nameInput.value.trim().slice(0, 16) || "Player";
      nameModal.style.display = "none";
      const map = nameModal._pendingMap || "crossfire";
      const coopArena = (map === "arena" && pendingLobbyMode === "arena-coop") ||
                        (map === "boss_arena" && pendingLobbyMode === "boss-coop");
      const coopTraining = map === "training" && pendingLobbyMode === "training-coop";
      startGame(map, true, coopArena, coopTraining);
    });

    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnNameOk.click();
    });

    btnDeathRestart.addEventListener("click", () => restartCurrentMap());
    btnDeathSettings.addEventListener("click", () => openSettingsModal());
    btnDeathQuit.addEventListener("click", goToMenu);
    btnResume.addEventListener("click", () => {
      hidePause();
      renderer.domElement.requestPointerLock();
    });
    btnPauseSettings.addEventListener("click", () => openSettingsModal());
    btnPauseRestart.addEventListener("click", () => restartCurrentMap());
    btnPauseQuit.addEventListener("click", goToMenu);
    btnMenuSettings.addEventListener("click", () => openSettingsModal());

    btnCloseSettings.addEventListener("click", () => closeSettingsModal());
    document.getElementById("btnCreatorUnlock").addEventListener("click", () => tryCreatorUnlock());
    document.getElementById("btnDeleteAllData").addEventListener("click", () => {
      if (!confirm(tr("deleteDataConfirm", "Delete all data? Unlock progress and kill records will be cleared. This cannot be undone."))) return;
      deleteAllGameData();
      alert(tr("deleteDataDone", "All data deleted."));
    });
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });

    for (const tab of document.querySelectorAll(".settings-tab")) {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-scroll-target");
        if (id) setActiveSettingsTab(id);
        const el = id ? document.getElementById(id) : null;
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (settingsScroll) {
      settingsScroll.addEventListener(
        "scroll",
        () => {
          requestAnimationFrame(updateSettingsTabFromScroll);
        },
        { passive: true }
      );
    }

    function bindVolSlider(rangeEl, labelEl, key, applyFn) {
      rangeEl.addEventListener("input", () => {
        const v = (+rangeEl.value || 0) / 100;
        gameSettings[key] = v;
        labelEl.textContent = `${rangeEl.value}%`;
        applyFn();
      });
      // Persist only when the drag settles — 'input' fires ~60-100x/sec while dragging.
      rangeEl.addEventListener("change", saveGameSettings);
    }
    bindVolSlider(rngMasterVol, lblMasterVol, "masterVolume", applyAudioVolumes);
    bindVolSlider(rngMusicVol, lblMusicVol, "musicVolume", applyAudioVolumes);
    bindVolSlider(rngSfxVol, lblSfxVol, "soundVolume", applyAudioVolumes);

    // (The "Animated background light visual" toggle was removed — the menu-wall
    // 3D scene is always on. The boot path unconditionally calls
    // initMenuWallBackdrop().)

    /**
     * The DPI field + eDPI / cm-360 readout are built here instead of in index.html so this
     * whole sensitivity change stays inside main.js. DPI is not used by the aim maths at all
     * — it exists purely so the readout can show numbers you can compare with other games.
     */
    let _dpiInput = null;
    let _sensReadoutEl = null;

    function buildSensitivityControls() {
      const hint = document.getElementById("lookSensHint");
      if (!hint || _dpiInput) return;

      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;";

      const lab = document.createElement("label");
      lab.textContent = tr("mouseDpiLabel", "Mouse DPI");
      lab.style.cssText = "font-size:13px;opacity:0.9;font-family:var(--game-font-ui);";

      const inp = document.createElement("input");
      inp.type = "number";
      inp.min = String(MOUSE_DPI_MIN);
      inp.max = String(MOUSE_DPI_MAX);
      inp.step = "50";
      inp.value = String(clampMouseDpi(gameSettings.mouseDpi));
      inp.style.cssText =
        "width:110px;padding:7px 10px;font-size:14px;font-family:var(--game-font-ui);" +
        "background:#0d111b;color:#fff;border:1.5px solid rgba(120,200,255,0.55);" +
        "border-radius:6px;outline:none;";
      inp.addEventListener("input", () => {
        gameSettings.mouseDpi = clampMouseDpi(+inp.value);
        syncSensReadout();
      });
      inp.addEventListener("change", () => {
        inp.value = String(clampMouseDpi(gameSettings.mouseDpi));
        saveGameSettings();
      });

      const readout = document.createElement("div");
      readout.style.cssText =
        "font-size:13px;font-family:var(--game-font-ui);color:#7ec8ff;letter-spacing:0.5px;";

      row.appendChild(lab);
      row.appendChild(inp);
      row.appendChild(readout);
      hint.parentNode.insertBefore(row, hint);

      _dpiInput = inp;
      _sensReadoutEl = readout;

      hint.textContent = tr(
        "sensHintNew",
        "Same maths as other shooters: degrees/count = sensitivity × 0.022. " +
          "DPI is only used to show eDPI and cm/360 — it does not change your aim."
      );
      syncSensReadout();
    }

    function syncSensReadout() {
      if (!_sensReadoutEl) return;
      if (_dpiInput && document.activeElement !== _dpiInput) {
        _dpiInput.value = String(clampMouseDpi(gameSettings.mouseDpi));
      }
      const edpi = getEdpi();
      const cm = getCmPer360();
      _sensReadoutEl.textContent = `eDPI ${Math.round(edpi)}  ·  ${cm.toFixed(1)} cm/360°`;
    }

    /**
     * Sensitivity / ADS-multiplier sliders. The <input> min/max/step come from the old
     * percent scale, so they are re-ranged here rather than in index.html — that keeps this
     * whole change JS-only.
     */
    function bindSensSlider(rangeEl, labelEl, key, clampFn, min, max, step, fmt) {
      if (!rangeEl || !labelEl) return;
      rangeEl.min = String(min);
      rangeEl.max = String(max);
      rangeEl.step = String(step);
      rangeEl.addEventListener("input", () => {
        const v = clampFn(+rangeEl.value);
        gameSettings[key] = v;
        rangeEl.value = String(v);
        labelEl.textContent = fmt(v);
        syncSensReadout();
      });
      rangeEl.addEventListener("change", saveGameSettings);
    }
    bindSensSlider(rngLookSens, lblLookSens, "sensitivity", clampSens,
      SENS_MIN, SENS_MAX, 0.01, (v) => v.toFixed(2));
    bindSensSlider(rngAdsLookSens, lblAdsLookSens, "adsSensMultiplier", clampAdsSensMul,
      ADS_SENS_MUL_MIN, ADS_SENS_MUL_MAX, 0.01, (v) => `${v.toFixed(2)}×`);

    function cycleQuality(delta) {
      gameSettings.qualityIndex = (gameSettings.qualityIndex + delta + QUALITY_LEVELS.length) % QUALITY_LEVELS.length;
      syncSettingsUI();
      saveGameSettings();
      applyGraphicsQuality();
    }
    btnQualityPrev.addEventListener("click", () => cycleQuality(-1));
    btnQualityNext.addEventListener("click", () => cycleQuality(1));

    btnTexturePrev.addEventListener("click", () => {
      gameSettings.texturesOn = false;
      syncSettingsUI();
      saveGameSettings();
      applyWallTexture();
      compileSceneShaders();
    });
    btnTextureNext.addEventListener("click", () => {
      gameSettings.texturesOn = true;
      syncSettingsUI();
      saveGameSettings();
      applyWallTexture();
      compileSceneShaders();
    });

    const btnSkipClickOff = document.getElementById("btnSkipClickOff");
    const btnSkipClickOn = document.getElementById("btnSkipClickOn");
    if (btnSkipClickOff) {
      btnSkipClickOff.addEventListener("click", () => {
        gameSettings.skipClickToPlay = false;
        syncSettingsUI();
        saveGameSettings();
        updateClickHintVisibility();
      });
    }
    if (btnSkipClickOn) {
      btnSkipClickOn.addEventListener("click", () => {
        gameSettings.skipClickToPlay = true;
        syncSettingsUI();
        saveGameSettings();
        updateClickHintVisibility();
        if (gameWorldReady && player.health > 0) tryAutoCapturePointer();
      });
    }

    function cycleRenderDistance(delta) {
      const n = RENDER_DISTANCE_LEVELS.length;
      gameSettings.renderDistanceIndex = (gameSettings.renderDistanceIndex + delta + n) % n;
      syncSettingsUI();
      saveGameSettings();
      applySceneFogAndCameraFar();
    }
    btnRenderDistPrev.addEventListener("click", () => cycleRenderDistance(-1));
    btnRenderDistNext.addEventListener("click", () => cycleRenderDistance(1));

    function cycleLanguage(delta) {
      const i = LANGUAGE_OPTIONS.indexOf(gameSettings.language);
      const next = (i + delta + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length;
      gameSettings.language = LANGUAGE_OPTIONS[next];
      syncSettingsUI();
      saveGameSettings();
      updateHud();
    }
    btnLangPrev?.addEventListener("click", () => cycleLanguage(-1));
    btnLangNext?.addEventListener("click", () => cycleLanguage(1));

    syncSettingsUI();

    window.addEventListener("resize", () => {
      syncGameRendererSize();
    });
    document.addEventListener("fullscreenchange", () => {
      _rendererSyncWarmupFrames = Math.max(_rendererSyncWarmupFrames, 120);
      syncGameRendererSize();
      requestAnimationFrame(() => syncGameRendererSize());
    });
    window.addEventListener("orientationchange", () => {
      const bump = () => {
        syncGameRendererSize();
        try {
          resizeMenuWallBackdrop();
        } catch (_) {}
      };
      bump();
      requestAnimationFrame(bump);
      setTimeout(bump, 80);
      setTimeout(bump, 280);
    });
    window.addEventListener("load", () => {
      _rendererSyncWarmupFrames = Math.max(_rendererSyncWarmupFrames, 200);
      syncGameRendererSize();
      requestAnimationFrame(() => syncGameRendererSize());
      try {
        resizeMenuWallBackdrop();
      } catch (_) {}
      [16, 120, 380].forEach((ms) =>
        setTimeout(() => {
          syncGameRendererSize();
          try {
            resizeMenuWallBackdrop();
          } catch (_) {}
        }, ms)
      );
    });
    window.addEventListener("pageshow", () => {
      _rendererSyncWarmupFrames = Math.max(_rendererSyncWarmupFrames, 160);
      syncGameRendererSize();
      requestAnimationFrame(() => syncGameRendererSize());
      try {
        resizeMenuWallBackdrop();
      } catch (_) {}
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        _rendererSyncWarmupFrames = Math.max(_rendererSyncWarmupFrames, 120);
        syncGameRendererSize();
        requestAnimationFrame(() => syncGameRendererSize());
        try {
          resizeMenuWallBackdrop();
        } catch (_) {}
      }
    });
    try {
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", () => syncGameRendererSize());
        window.visualViewport.addEventListener("scroll", () => syncGameRendererSize());
      }
    } catch (_) {}
    try {
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => {
          syncGameRendererSize();
          try {
            resizeMenuWallBackdrop();
          } catch (_) {}
        });
        if (app) ro.observe(app);
        if (document.documentElement) ro.observe(document.documentElement);
      }
    } catch (_) {}
    try {
      renderer.domElement.addEventListener("webglcontextrestored", () => {
        _rendererSyncWarmupFrames = Math.max(_rendererSyncWarmupFrames, 160);
        syncGameRendererSize();
        requestAnimationFrame(() => syncGameRendererSize());
      });
    } catch (_) {}

    // Backpack screen. Built last, once every declaration above has been evaluated —
    // calling it earlier hit the temporal dead zone on its own `let`s and aborted the
    // whole module. Guarded so a failure here can never take the game down with it.
    try {
      buildLoadoutPanel();
      syncLoadoutPanel();
    } catch (e) {
      console.warn("[loadout] panel init failed:", e);
    }
