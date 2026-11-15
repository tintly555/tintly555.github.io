const CHAPTER_TRACKS = [
  [{ file: "g-highwind.mp3", gain: 1 }],
  [{ file: "g-factory.mp3", gain: 1 }],
  [{ file: "g-winter.mp3", gain: 1 }],
  [{ file: "g-winter.mp3", gain: 1 }],
  [{ file: "g-uneasylight.mp3", gain: 1 }],
  [{ file: "g-highwind.mp3", gain: 1 }, { file: "g-uneasylight.mp3", gain: 0.4 }],
  [{ file: "g-sandy.mp3", gain: 1 }],
  [{ file: "g-sandywind.mp3", gain: 1 }],
  [{ file: "g-uneasylight.mp3", gain: 1 }],
  [{ file: "g-factory.mp3", gain: 1 }, { file: "g-highwind.mp3", gain: 0.75 }],
];

const clamp = value => Math.max(0, Math.min(1, Number(value) || 0));

export function createGauntletMusic() {
  let chapter = -1;
  let active = false;
  let musicVolume = 1;
  let tracks = [];

  function startTrack(track) {
    if (!active || !track.audio.paused || track.playing) return;
    track.playing = true;
    let result;
    try {
      result = track.audio.play();
    } catch (_) {
      track.playing = false;
      return;
    }
    if (result && typeof result.then === "function") {
      result.then(() => { track.playing = false; }).catch(() => { track.playing = false; });
    } else track.playing = false;
  }

  function sync() {
    for (const track of tracks) {
      track.audio.volume = clamp(musicVolume * track.gain);
      if (active) startTrack(track);
      else {
        if (!track.audio.paused) track.audio.pause();
        track.playing = false;
      }
    }
  }

  function select(level) {
    const next = Math.max(0, Math.min(CHAPTER_TRACKS.length - 1, Math.floor((Math.max(1, +level || 1) - 1) / 20)));
    if (next === chapter) return;
    active = false;
    for (const track of tracks) track.audio.pause();
    chapter = next;
    tracks = CHAPTER_TRACKS[chapter].map(({ file, gain }) => {
      const audio = new Audio(new URL(`../media/${file}`, import.meta.url).href);
      audio.loop = true;
      audio.preload = "auto";
      audio.setAttribute("playsinline", "");
      const track = { audio, gain, playing: false };
      audio.addEventListener("canplay", () => startTrack(track));
      return track;
    });
    sync();
  }

  return {
    select,
    play() { active = true; sync(); },
    pause() { active = false; sync(); },
    setVolume(value) { musicVolume = clamp(value); sync(); },
  };
}
