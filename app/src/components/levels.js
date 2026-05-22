export const LEVELS = {
  1: {
    name: 'Fortnite',
    orbitSpeed: 0.06,
    beats: 13,
  },
  2: {
    name: 'Guy',
    orbitSpeed: 0.07,
    beats: 16,
  },
  3: {
    name: 'Sheep',
    orbitSpeed: 0.085,
    beats: 20,
  },
  4: {
    name: 'Ghost',
    orbitSpeed: 0.1,
    beats: 24,
  },
}

export function getLevelById(id) {
  return LEVELS[Number(id)] ?? null
}