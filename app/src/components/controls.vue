<template>
  <div class="game-container">
    <svg viewBox="0 0 1000 1000" width="100%" height="100%">
      <g :transform="cameraTransform">
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
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  level: Object,
})

const emit = defineEmits(['stationaryOnLast'])

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
  // set square index if we placed the ball on a tile (find tile by coords)
  // this keeps track of which tile the ball is currently occupying
  const idx = tiles.findIndex((t) => t.x === x && t.y === y)
  target.squareIndex = idx >= 0 ? idx : -1
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
  ice.squareIndex = 0
  // fire starts off-tile; mark -1 to indicate not on any tile yet
  setPosition(fire, start.x + RADIUS, start.y)
  fire.squareIndex = -1
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

  // place mover onto the tile and record its index
  setPosition(mover, nextTile.x, nextTile.y)
  mover.squareIndex = currentBeat

  orbit(mover, getAnchor())

  iceIsAnchor = !iceIsAnchor

  // now the former mover is the new anchor (stationary). detect end only for anchor.
  const anchor = getAnchor()
  if (anchor.squareIndex === lastIndex.value && !anchor._emittedEnd) {
    anchor._emittedEnd = true
    emit('stationaryOnLast', { ball: anchor })
  }
}

function update() {
  angle += props.level.orbitSpeed

  orbit(getAnchor(), getMover())

  const focus = getAnchor()

  camera.x += (500 - focus.x - camera.x) * 0.08
  camera.y += (500 - focus.y - camera.y) * 0.08
}

function handleInput(event) {
  const pressed = event.type === 'mousedown' || (event.code === 'Space' && !event.repeat)

  if (pressed) {
    pivot()
  }
}

const cameraTransform = computed(() => {
  return `translate(${camera.x}, ${camera.y})`
})

const lastIndex = computed(() => (tiles?.length ?? 0) - 1)

// Option A — prefer explicit flag set when ball stops
function isStationaryOnLast(ball) {
  if (!ball) return false
  // your ball object should set `ball.isStationary = true` when it stops
  return ball.squareIndex === lastIndex.value && !!ball.isStationary
}

// Option B — heuristic: low linear velocity AND not currently rotating
function isStationaryOnLastByHeuristic(ball) {
  if (!ball) return false
  const onLast = ball.squareIndex === lastIndex.value
  const vx = ball.vx ?? 0
  const vy = ball.vy ?? 0
  const speed = Math.hypot(vx, vy)
  const ROTATION_THRESHOLD = 0.02 // adjust to your game's units
  const speedOk = speed < 0.02
  const notRotating =
    !ball.isRotating && !(Math.abs(ball.angularVelocity ?? 0) > ROTATION_THRESHOLD)
  return onLast && speedOk && notRotating
}

// Watch the stationaryBall (preferred) and emit once when it becomes on-last
watch(
  () => ice && ice.squareIndex,
  (newIdx, oldIdx) => {
    const ball = ice
    if (!ball) return
    if (isStationaryOnLast(ball)) {
      emit('stationaryOnLast', { ball })
    } else if (isStationaryOnLastByHeuristic(ball)) {
      // fallback if you don't explicitly toggle isStationary
      emit('stationaryOnLast', { ball, heuristic: true })
    }
  },
)

// If your code marks the ball stationary in a function, you can call check there:
function checkStationaryOnLast(ball) {
  if (isStationaryOnLast(ball) || isStationaryOnLastByHeuristic(ball)) {
    emit('stationaryOnLast', { ball })
  }
}

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
