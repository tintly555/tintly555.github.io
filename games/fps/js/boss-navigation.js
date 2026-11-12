/** Radius-aware pathing for the boss arena's fixed walls. */
export function createBossNavigation(isBlocked, min = -49, max = 49, cellSize = 1) {
  const size = Math.floor((max - min) / cellSize) + 1;
  const total = size * size;
  const blocked = new Uint8Array(total);
  const world = cell => min + cell * cellSize;
  const column = (x) => Math.min(size - 1, Math.max(0, Math.round((x - min) / cellSize)));
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      blocked[row * size + col] = isBlocked(world(col), world(row)) ? 1 : 0;
    }
  }
  const queue = new Int32Array(total);
  const fields = new Map();

  function closest(x, z, accept) {
    const cx = column(x), cz = column(z);
    let best = -1, bestDistance = Infinity;
    for (let dz = -4; dz <= 4; dz++) {
      for (let dx = -4; dx <= 4; dx++) {
        const col = cx + dx, row = cz + dz;
        if (col < 0 || col >= size || row < 0 || row >= size) continue;
        const idx = row * size + col;
        const distance = (x - world(col)) ** 2 + (z - world(row)) ** 2;
        if (!blocked[idx] && distance < bestDistance && (!accept || accept(world(col), world(row), idx))) {
          best = idx;
          bestDistance = distance;
        }
      }
    }
    return best;
  }

  function field(goal) {
    if (fields.has(goal)) return fields.get(goal);
    if (fields.size >= 6) fields.delete(fields.keys().next().value);
    const next = new Int32Array(total);
    next.fill(-1);
    next[goal] = goal;
    queue[0] = goal;
    let tail = 1;
    for (let head = 0; head < tail; head++) {
      const index = queue[head], row = Math.floor(index / size), col = index % size;
      for (const neighbor of [col > 0 ? index - 1 : -1, col + 1 < size ? index + 1 : -1,
        row > 0 ? index - size : -1, row + 1 < size ? index + size : -1]) {
        if (neighbor < 0 || blocked[neighbor] || next[neighbor] >= 0) continue;
        next[neighbor] = index;
        queue[tail++] = neighbor;
      }
    }
    fields.set(goal, next);
    return next;
  }

  return function waypoint(x, z, targetX, targetZ, canReach) {
    const goal = closest(targetX, targetZ);
    if (goal < 0) return null;
    const next = field(goal);
    const start = closest(x, z, (wx, wz, idx) => next[idx] >= 0 && canReach(wx, wz));
    if (start < 0) return null;
    const sx = world(start % size), sz = world(Math.floor(start / size));
    const following = next[start];
    if (following !== start) {
      const tx = world(following % size), tz = world(Math.floor(following / size));
      if (canReach(tx, tz)) return { x: tx, z: tz };
    }
    return { x: sx, z: sz };
  };
}
