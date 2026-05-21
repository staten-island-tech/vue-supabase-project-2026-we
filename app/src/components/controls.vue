<template>
  <div class="game-container">
    <svg viewBox="0 0 1000 1000" width="100%" height="100%">
      <line
        v-for="(t, i) in tiles.slice(0, -1)"
        :key="i"
        :x1="t.x"
        :y1="t.y"
        :x2="tiles[i + 1].x"
        :y2="tiles[i + 1].y"
        stroke="#444"
        stroke-width="6"
      />

      <circle
        v-for="(t, i) in tiles"
        :key="i"
        :cx="t.x"
        :cy="t.y"
        r="18"
        fill="#222"
        stroke="white"
        stroke-width="4"
      />

      <circle :cx="ice.x" :cy="ice.y" r="18" fill="#00e5ff" />
      <circle :cx="fire.x" :cy="fire.y" r="18" fill="#ff4d4d" />
    </svg>

    <div class="lvlname">{{ level.name }}</div>
    <div class="judge">{{ judgement }}</div>
    <div class="score">Score: {{ score }}</div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({ level: Object })
const level = props.level

const ice = reactive({ x: 0, y: 0 })
const fire = reactive({ x: 0, y: 0 })

const tiles = reactive([])

const judgement = ref('')
const score = ref(0)

let beat = 0
let angle = 0
let anchorIsIce = true

const RADIUS = 150
const SNAP = 45
const PERFECT = 18

const START_X = -340
const SPACING = 150
const Y = 500

const distance = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y)

const orbit = (a, b) => {
  b.x = a.x + RADIUS * Math.cos(angle)
  b.y = a.y + RADIUS * Math.sin(angle)
}

function setJudge(text) {
  judgement.value = text
  setTimeout(() => {
    if (judgement.value === text) judgement.value = ''
  }, 400)
}

function pivot() {
  const next = tiles[beat + 1]
  const mover = anchorIsIce ? fire : ice

  const dist = distance(mover, next)

  if (dist > SNAP) {
    setJudge('Miss')
    return
  }

  beat++
  angle += Math.PI

  if (dist <= PERFECT) {
    score.value += 50
    setJudge('Perfect +50')
  } else {
    setJudge('Hit')
  }

  if (anchorIsIce) {
    fire.x = next.x
    fire.y = next.y
    orbit(fire, ice)
  } else {
    ice.x = next.x
    ice.y = next.y
    orbit(ice, fire)
  }

  anchorIsIce = !anchorIsIce
}

function generateTiles() {
  tiles.length = 0

  for (let i = 0; i < level.beats; i++) {
    tiles.push({
      x: START_X + i * SPACING,
      y: Y,
    })
  }
}

function update() {
  angle += level.orbitSpeed
  anchorIsIce ? orbit(ice, fire) : orbit(fire, ice)
}

function handle(e) {
  if (!e.repeat && (e.code === 'Space' || e.type === 'mousedown')) {
    pivot()
  }
}

onMounted(() => {
  generateTiles()

  ice.x = tiles[0].x
  ice.y = tiles[0].y

  fire.x = ice.x + RADIUS
  fire.y = ice.y

  gsap.ticker.add(update)

  window.addEventListener('keydown', handle)
  window.addEventListener('mousedown', handle)
})

onUnmounted(() => {
  gsap.ticker.remove(update)

  window.removeEventListener('keydown', handle)
  window.removeEventListener('mousedown', handle)
})
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  background: #111;
  overflow: hidden;
}

svg {
  width: 100%;
  height: 100%;
}

.lvlname {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 72px;
  font-weight: bold;
  color: white;
}

.judge {
  position: fixed;
  top: 110px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 24px;
}

.score {
  position: fixed;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 24px;
}
</style>