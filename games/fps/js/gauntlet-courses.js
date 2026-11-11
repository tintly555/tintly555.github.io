import { gauntletObstacleIds } from "./gauntlet-obstacles.js?v=5";

export const GAUNTLET_CHAPTER_SIZE = 20;
export const GAUNTLET_CHAPTERS = Object.freeze([
  "Perimeter", "Foundry", "Switchyard", "Spillway", "Relay", "Causeway",
  "Silo", "Outworks", "Interchange", "Blackline",
]);

export function extendGauntletCourses(firstTwenty) {
  const courses = firstTwenty.slice(0, 20);
  const order = gauntletObstacleIds;
  const obstacle = (id, level, index, tier) => ({
    t: "mechanic", id, tier, mirror: (level + index * 7) % 4 < 2 ? 1 : -1,
    seed: (level * 17 + index * 41) % 101,
  });
  function append(mechanics, tier) {
    const level = courses.length + 1;
    const chapter = Math.floor((level - 1) / GAUNTLET_CHAPTER_SIZE);
    const room = { t: "room", len: 17 + level % 6, cover: true };
    const boss = level % 20 === 0;
    const combat = boss || level % 4 !== 1;
    const enemies = combat ? 2 + (level * 3 % 5) + Math.floor(tier / 2) : 0;
    const segs = mechanics.map((id, i) => obstacle(id, level, i, tier));
    if (combat) {
      const at = segs.length === 1 ? level % 2 : (level * 7) % (segs.length - 1) + 1;
      segs.splice(at, 0, { ...room, boss });
    }
    courses.push({
      name: GAUNTLET_CHAPTERS[chapter],
      z: enemies, boss: boss ? 1 : 0, hell: level === 200,
      checkpoints: true, segs,
    });
  }
  // One new obstacle at a time, with occasional combat on the stable decks.
  // They start at tier 1 and climb to 3, so the levels right after the hand-built ones are
  // never easier than the opening ones.
  order.forEach((id, k) => append([id], 1 + Math.floor(k * 3 / order.length)));
  // Eleven evenly distributed repeats. Each cycle permutes the whole set, so
  // every mechanic has the same number of appearances across the campaign.
  const mixed = [];
  for (let round = 0; round < 11; round++) {
    for (let i = 0; i < order.length; i++) mixed.push(order[(i * 17 + round * 7) % order.length]);
  }
  const runs = 200 - courses.length;
  for (let i = 0, run = 0; run < runs; run++) {
    const count = run >= runs - 30 ? 5 : 4;
    const tier = run < 35 ? 2 : 3;
    append(mixed.slice(i, i + count), tier);
    i += count;
  }
  return courses;
}
