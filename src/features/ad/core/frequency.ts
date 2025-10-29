const memory: Record<string, number[]> = {};

export function canShow(key: string, { max = 2, perMs = 60_000 } = {}) {
  const now = Date.now();
  const arr = (memory[key] ||= []).filter((t) => now - t < perMs);
  memory[key] = arr;
  return arr.length < max;
}

export function markShown(key: string) {
  const now = Date.now();
  (memory[key] ||= []).push(now);
}
