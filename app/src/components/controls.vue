<template>
  <div class="game-container">
    <svg viewBox="0 0 1000 1000" width="100%" height="100%">
      <g :transform="cameraTransform">
        <!-- PATH LINES -->
        <line
          v-for="(t, i) in tiles.slice(0, -1)"
          :key="'line-' + i"
          :x1="t.x"
          :y1="t.y"
          :x2="tiles[i + 1].x"
          :y2="tiles[i + 1].y"
          stroke="white"
          stroke-width="6"
        />

        <!-- TILES -->
        <circle
          v-for="(t, i) in tiles"
          :key="'tile-' + i"
          :cx="t.x"
          :cy="t.y"
          r="18"
          fill="#222"
          stroke="white"
          stroke-width="4"
        />

        <!-- ICE -->
        <circle :cx="ice.x" :cy="ice.y" r="18" fill="#00e5ff" />

        <!-- FIRE -->
        <circle :cx="fire.x" :cy="fire.y" r="18" fill="#ff4d4d" />
      </g>
    </svg>

    <div class="lvlname">
      {{ level.name }}
    </div>

    <div class="judge">
      {{ judgement }}
    </div>

    <div class="score">Score: {{ gameStore.score }}</div>

    <div class="combo">Combo: {{ gameStore.combo }}</div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'

import gsap from 'gsap'

import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const props = defineProps({
  level: Object,
})

const level = props.level

const ice = reactive({
  x: 0,
  y: 0,
})

const fire = reactive({
  x: 0,
  y: 0,
})

const tiles = reactive([])

const judgement = ref('')

let beat = 0
let angle = 0
let anchorIsIce = true

const RADIUS = 150
const SNAP = 45
const PERFECT = 18

const START_X = -340
const SPACING = 150
const Y = 500

const VIEW_CENTER_X = 500
const VIEW_CENTER_Y = 500

const distance = (a, b) => {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

const orbit = (a, b) => {
  b.x = a.x + RADIUS * Math.cos(angle)
  b.y = a.y + RADIUS * Math.sin(angle)
}

function setJudge(text) {
  judgement.value = text

  setTimeout(() => {
    if (judgement.value === text) {
      judgement.value = ''
    }
  }, 400)
}

function pivot() {
  const next = tiles[beat + 1]

  if (!next) {
    setJudge('LEVEL COMPLETE')

    return
  }

  const mover = anchorIsIce ? fire : ice

  const dist = distance(mover, next)

  if (dist > SNAP) {
    setJudge('MISS')

    gameStore.setCombo(0)

    return
  }

  beat++

  angle += Math.PI

  if (dist <= PERFECT) {
    gameStore.addScore(50)

    gameStore.setCombo(gameStore.combo + 1)

    setJudge('PERFECT +50')
  } else {
    gameStore.addScore(30)

    gameStore.setCombo(gameStore.combo + 1)

    setJudge('+30')
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

const camera = reactive({
  x: 0,
  y: 0,
})

const cameraTransform = computed(() => {
  return `translate(${camera.x}, ${camera.y})`
})

function update() {
  angle += level.orbitSpeed

  if (anchorIsIce) {
    orbit(ice, fire)
  } else {
    orbit(fire, ice)
  }

  const target = anchorIsIce ? ice : fire

  const targetX = VIEW_CENTER_X - target.x
  const targetY = VIEW_CENTER_Y - target.y

  camera.x += (targetX - camera.x) * 0.08
  camera.y += (targetY - camera.y) * 0.08
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

  camera.x = VIEW_CENTER_X - ice.x
  camera.y = VIEW_CENTER_Y - ice.y

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
  pointer-events: none;
}

.judge {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 28px;
  font-weight: bold;
  pointer-events: none;
}

.score {
  position: fixed;
  top: 170px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 28px;
  pointer-events: none;
}

.combo {
  position: fixed;
  top: 210px;
  left: 50%;
  transform: translateX(-50%);
  color: #00e5ff;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
}
</style>
