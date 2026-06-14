// Simple, easy-to-read level definitions.
export const LEVELS = {
  1: {
    id: 1,
    name: 'Fortnite',
    desc: 'guy from fortnite',
    difficulty: 'Easy',
    img: '/quandale.png',
    orbitSpeed: 0.06,
    beats: 13,
  },
  2: {
    id: 2,
    name: 'Guy',
    desc: 'guy with hat',
    difficulty: 'Medium',
    img: '/lincoln.png',
    orbitSpeed: 0.07,
    beats: 13,
  },
  3: {
    id: 3,
    name: 'Sheep',
    desc: 'baaaa',
    difficulty: 'Hard',
    img: '/quandale.png',
    orbitSpeed: 0.085,
    beats: 20,
  },
  4: {
    id: 4,
    name: 'Ghost',
    desc: 'booooo',
    img: '/quandale.png',
    difficulty: 'Nightmare',
    orbitSpeed: 0.1,
    beats: 24,
  },
}

export function getLevelById(id) {
  var n = Number(id)
  if (Number.isNaN(n)) return null
  return LEVELS[n] || null
}
