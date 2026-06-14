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

    <div v-if="finished" class="end-screen">
      <div class="end-card">
        <h1>Level Completed!</h1>

        <p class="final-score">Final Score: {{ score }}</p>

        <div class="end-buttons">
          <button @click="resetGame">Replay</button>

          <RouterLink to="/menu">
            <button>Back to Menu</button>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <RouterLink v-if="!finished" to="/menu">
    <button class="back">Back to Menu</button>
  </RouterLink>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

// Props: the component receives a `level` object from the parent.
const props = defineProps({
  level: Object,
})

// Define events this component can emit.
const emit = defineEmits(['stationaryOnLast'])

// Simple state objects for the two orbiting points and the camera.
const ice = reactive({ x: 0, y: 0 })
const fire = reactive({ x: 0, y: 0 })
const camera = reactive({ x: 0, y: 0 })

// Tiles is an array of points that the player will move toward.
const tiles = reactive([])

// Simple reactive values for score, judgement text, and finished flag.
const score = ref(0)
const judgement = ref('')
const finished = ref(false)

// Internal (non-reactive) game state.
let currentBeat = 0
let angle = 0
let iceIsAnchor = true

// Basic helper: distance between two points.
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Set a point's position clearly.
function setPosition(target, x, y) {
  target.x = x
  target.y = y
}

const RADIUS = 150

// Place `mover` on a circle around `anchor` using the shared `angle`.
function orbit(anchor, mover) {
  mover.x = anchor.x + Math.cos(angle) * RADIUS
  mover.y = anchor.y + Math.sin(angle) * RADIUS
}

// Show a short judgement message (like "Perfect" or "+30").
function showJudgement(text, duration = 400) {
  judgement.value = text
  setTimeout(() => {
    if (judgement.value === text) {
      judgement.value = ''
    }
  }, duration)
}

// Build the tiles array from the level's beat count.
function generateTiles() {
  tiles.length = 0
  const total = props.level && props.level.beats ? props.level.beats : 0
  for (let i = 0; i < total; i++) {
    tiles.push({ x: -340 + i * 150, y: 500 })
  }
}

// Place the ice and fire points at the start of the level.
function setupGame() {
  generateTiles()
  const start = tiles[0]
  if (start) {
    setPosition(ice, start.x, start.y)
    setPosition(fire, start.x + RADIUS, start.y)
  }
}

// Reset everything to play again.
function resetGame() {
  finished.value = false
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

function endScreen() {
  finished.value = true
  showJudgement('Level Complete!')
}

// Called when the player taps/clicks/presses space to move to the next tile.
function pivot() {
  const nextTile = tiles[currentBeat + 1]
  if (!nextTile) return

  const mover = getMover()
  const hitDistance = distance(mover, nextTile)

  // If too far, treat as a miss and restart.
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

  if (currentBeat >= tiles.length - 1) {
    emit('stationaryOnLast', { score: score.value })
    endScreen()
    return
  }
}

// Per-frame update function. Keeps the orbit moving and camera following.
function update() {
  if (finished.value) return
  const speed = props.level && props.level.orbitSpeed ? props.level.orbitSpeed : 0
  angle += speed
  orbit(getAnchor(), getMover())
  const focus = getAnchor()
  camera.x += (500 - focus.x - camera.x) * 0.08
  camera.y += (500 - focus.y - camera.y) * 0.08
}

// Handle mouse and keyboard input in a clear, explicit way.
function handleInput(event) {
  if (finished.value) return

  let pressed = false
  if (event.type === 'mousedown') pressed = true
  if (event.type === 'keydown') {
    // Accept Space key (explicit check).
    if (event.code === 'Space' && event.repeat === false) pressed = true
  }

  if (pressed) pivot()
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
  background-color: white;
  color: black;
  border: none;
  padding: 10px 20px;
  text-align: center;
  font-size: 20px;
  cursor: pointer;
  border-radius: 8px;
}

.end-screen {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
}

.end-card {
  background: #1e1e1e;
  padding: 40px;
  border-radius: 16px;
  min-width: 350px;
  text-align: center;
  color: white;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.end-card h1 {
  font-size: 42px;
  margin-bottom: 16px;
}

.final-score {
  font-size: 24px;
  margin-bottom: 28px;
}

.end-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.end-buttons button {
  background: white;
  color: black;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.end-buttons button:hover {
  transform: scale(1.05);
}
</style>
