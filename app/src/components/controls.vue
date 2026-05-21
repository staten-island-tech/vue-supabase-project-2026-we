<template>
  <div class="game-container">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000">
      <!-- TILE CONNECTIONS -->
      <line
        v-for="(tile, i) in tiles.slice(0, -1)"
        :key="'line-' + i"
        :x1="tiles[i].x"
        :y1="tiles[i].y"
        :x2="tiles[i + 1].x"
        :y2="tiles[i + 1].y"
        stroke="#444"
        stroke-width="6"
      />

      <!-- TILES -->
      <circle
        v-for="(tile, i) in tiles"
        :key="'tile-' + i"
        :cx="tile.x"
        :cy="tile.y"
        r="18"
        fill="#222"
        stroke="white"
        stroke-width="4"
      />

      <!-- CURRENT TARGET -->
      <circle
        v-if="tiles[currentBeat]"
        :cx="tiles[currentBeat].x"
        :cy="tiles[currentBeat].y"
        r="28"
        fill="none"
        stroke="yellow"
        stroke-width="5"
      />

      <!-- ICE TRAIL -->
      <circle
        v-for="(t, i) in iceTrail"
        :key="'ice-' + i"
        :cx="t.x"
        :cy="t.y"
        :r="18 * (i / TRAIL_LENGTH)"
        fill="#00e5ff"
        :opacity="i / TRAIL_LENGTH"
      />

      <!-- FIRE TRAIL -->
      <circle
        v-for="(t, i) in fireTrail"
        :key="'fire-' + i"
        :cx="t.x"
        :cy="t.y"
        :r="18 * (i / TRAIL_LENGTH)"
        fill="#ff4d4d"
        :opacity="i / TRAIL_LENGTH"
      />

      <!-- CONNECTION LINE -->
      <line :x1="ice.x" :y1="ice.y" :x2="fire.x" :y2="fire.y" stroke="white" stroke-width="5" />

      <!-- PLAYERS -->
      <circle :cx="ice.x" :cy="ice.y" r="18" fill="#00e5ff" />
      <circle :cx="fire.x" :cy="fire.y" r="18" fill="#ff4d4d" />
    </svg>

    <div class="hud">
      <div>{{ level.name }}</div>
      <div>{{ judgement }}</div>
      <div>Beat: {{ currentBeat }}/{{ level.beats.length }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { LEVELS } from '@/components/levels.js'

const level = LEVELS[1]

const ice = reactive({
  x: 0,
  y: 0,
})

const fire = reactive({
  x: 0,
  y: 0,
})

const iceTrail = reactive([])
const fireTrail = reactive([])

const TRAIL_LENGTH = 12
let angle = 0
let iceIsAnchor = true

const currentBeat = ref(0)
const judgement = ref('')

let startTime = 0

const tiles = reactive([])

function generateTiles() {
  tiles.length = 0

  const startX = -300
  const y = 500
  const spacing = 150

  for (let i = 0; i < level.beats.length - 3; i++) {
    tiles.push({
      x: startX + i * spacing,
      y,
    })
  }
}

function update() {
  angle += level.orbitSpeed

  if (iceIsAnchor) {
    fire.x = ice.x + level.orbitRadius * Math.cos(angle)
    fire.y = ice.y + level.orbitRadius * Math.sin(angle)
  } else {
    ice.x = fire.x + level.orbitRadius * Math.cos(angle)
    ice.y = fire.y + level.orbitRadius * Math.sin(angle)
  }

  iceTrail.push({
    x: ice.x,
    y: ice.y,
  })

  fireTrail.push({
    x: fire.x,
    y: fire.y,
  })

  if (iceTrail.length > TRAIL_LENGTH) {
    iceTrail.shift()
  }

  if (fireTrail.length > TRAIL_LENGTH) {
    fireTrail.shift()
  }
}

function checkTiming() {
  const currentTime = (performance.now() - startTime) / 1000

  const beatTime = level.beats[currentBeat.value]

  const difference = Math.abs(currentTime - beatTime) * 1000

  if (difference <= 60) {
    judgement.value = 'Perfect!'
  } else if (difference <= level.windowMs) {
    judgement.value = 'Good'
  } else {
    judgement.value = 'Miss'
  }
}

function pivot() {
  if (currentBeat.value >= tiles.length - 1) {
    return
  }

  checkTiming()

  currentBeat.value++

  const nextTile = tiles[currentBeat.value]

  if (iceIsAnchor) {
    fire.x = nextTile.x
    fire.y = nextTile.y

    angle += Math.PI

    ice.x = fire.x + level.orbitRadius * Math.cos(angle)

    ice.y = fire.y + level.orbitRadius * Math.sin(angle)
  } else {
    ice.x = nextTile.x
    ice.y = nextTile.y
    angle += Math.PI

    fire.x = ice.x + level.orbitRadius * Math.cos(angle)

    fire.y = ice.y + level.orbitRadius * Math.sin(angle)
  }

  iceIsAnchor = !iceIsAnchor
}

function handleInteraction(e) {
  if (e.repeat) return

  if (e.code === 'Space' || e.type === 'mousedown') {
    pivot()
  }
}

onMounted(() => {
  generateTiles()

  ice.x = tiles[0].x
  ice.y = tiles[0].y

  fire.x = ice.x + level.orbitRadius
  fire.y = ice.y

  startTime = performance.now()

  gsap.ticker.add(update)

  window.addEventListener('keydown', handleInteraction)

  window.addEventListener('mousedown', handleInteraction)
})

onUnmounted(() => {
  gsap.ticker.remove(update)

  window.removeEventListener('keydown', handleInteraction)

  window.removeEventListener('mousedown', handleInteraction)
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

.hud {
  position: fixed;

  top: 20px;
  left: 20px;

  color: white;

  font-size: 24px;
  font-family: sans-serif;

  display: flex;
  flex-direction: column;

  gap: 10px;
}
</style>
