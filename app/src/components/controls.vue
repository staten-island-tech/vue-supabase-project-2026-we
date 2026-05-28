<template>
  <div class="game-container">
    <svg viewBox="0 0 1000 1000" width="100%" height="100%">

      <g :transform="cameraTransform">
        <line v-for="(t, i) in tiles.slice(0, -1)"
          :key="'line-' + i"
          :x1="t.x"
          :y1="t.y"
          :x2="tiles[i + 1].x"
          :y2="tiles[i + 1].y"
          stroke="white"
          stroke-width="6"
        />

        <circle v-for="(t, i) in tiles"
          :key="'tile-' + i"
          :cx="t.x"
          :cy="t.y"
          r="18"
          fill="#222"
          stroke="white"
          stroke-width="4"
        />

        <circle :cx="ice.x" :cy="ice.y" r="18" fill="#00e5ff" />
        <circle :cx="fire.x" :cy="fire.y" r="18" fill="#ff4d4d" />
      </g>
    </svg>

    <div class="lvlname">{{ level.name }}</div>
    <div class="judge">{{ judgement }}</div>
    <div class="score">Score: {{ score }}</div>
  </div>

  <RouterLink to="/menu"><button class="back">Back to Menu</button></RouterLink>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  level: Object,
})

const ice = reactive({ x: 0, y: 0 })
const fire = reactive({ x: 0, y: 0 })
const camera = reactive({ x: 0, y: 0 })
const tiles = reactive([])
const score = ref(0)
const judgement = ref('')

let currentBeat = 0
let angle = 0
let iceIsAnchor = true

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function setPosition(target, x, y) {
  target.x = x
  target.y = y
}

const RADIUS = 150

function orbit(anchor, mover) {
  mover.x = anchor.x + Math.cos(angle) * RADIUS
  mover.y = anchor.y + Math.sin(angle) * RADIUS
}

function showJudgement(text, duration = 400) {
  judgement.value = text

  setTimeout(() => {
    if (judgement.value === text) {
      judgement.value = ''
    }
  }, duration)
}

function generateTiles() {
  tiles.length = 0

  for (let i = 0; i < props.level.beats; i++) {
    tiles.push({
      x: -340 + i * 150,
      y: 500,
    })
  }
}

function setupGame() {
  generateTiles()

  const start = tiles[0]

  setPosition(ice, start.x, start.y)
  setPosition(fire, start.x + RADIUS, start.y)
}

function resetGame() {
  currentBeat = 0
  angle = 0
  iceIsAnchor = true
  score.value = 0

  setupGame()

  showJudgement('You missed!')
}

function getAnchor() {
  return iceIsAnchor ? ice : fire
}

function getMover() {
  return iceIsAnchor ? fire : ice
}

function pivot() {
  const nextTile = tiles[currentBeat + 1]

  if (!nextTile) return

  const mover = getMover()
  const hitDistance = distance(mover, nextTile)

  if (hitDistance > 45) {
    resetGame()
    return
  }

  currentBeat++
  angle += Math.PI

  const perfect = hitDistance <= 18

  score.value += perfect ? 50 : 30
  showJudgement(perfect ? 'Perfect +50' : '+30')

  setPosition(mover, nextTile.x, nextTile.y)

  orbit(mover, getAnchor())

  iceIsAnchor = !iceIsAnchor
}

function update() {
  angle += props.level.orbitSpeed

  orbit(getAnchor(), getMover())

  const focus = getAnchor()

  camera.x += (500 - focus.x - camera.x) * 0.08
  camera.y += (500 - focus.y - camera.y) * 0.08
}

function handleInput(event) {
  const pressed =
    event.type === 'mousedown' ||
    (event.code === 'Space' && !event.repeat)

  if (pressed) {
    pivot()
  }
}

const cameraTransform = computed(() => {
  return `translate(${camera.x}, ${camera.y})`
})

onMounted(() => {
  setupGame()

  gsap.ticker.add(update)

  window.addEventListener('keydown', handleInput)
  window.addEventListener('mousedown', handleInput)
})

onUnmounted(() => {
  gsap.ticker.remove(update)

  window.removeEventListener('keydown', handleInput)
  window.removeEventListener('mousedown', handleInput)
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

.lvlname,
.judge,
.score {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  pointer-events: none;
}

.lvlname {
  top: 30px;
  font-size: 72px;
  font-weight: bold;
}

.judge {
  top: 110px;
  font-size: 24px;
}

.score {
  top: 150px;
  font-size: 24px;
}

.back {
  position: fixed;
  top: 20px;
  left: 20px;

  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  border: none;
  padding: 10px 20px;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
  border-radius: 8px;
}
</style>