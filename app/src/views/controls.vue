<template>
  <div class="game-container">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000">

      <!-- Trails -->
      <circle
        v-for="(t, i) in iceTrail" :key="i"
        :cx="t.x" :cy="t.y"
        :r="18 * (i / TRAIL_LENGTH)"
        fill="#00e5ff"
        :opacity="i / TRAIL_LENGTH * 2"
      />
      <circle
        v-for="(t, i) in fireTrail" :key="i"
        :cx="t.x" :cy="t.y"
        :r="18 * (i / TRAIL_LENGTH)"
        fill="#ff4d4d"
        :opacity="i / TRAIL_LENGTH * 2"
      />

      <!-- Balls -->
      <circle :cx="ice.x"  :cy="ice.y"  r="18" fill="#00e5ff" />
      <circle :cx="fire.x" :cy="fire.y" r="18" fill="#ff4d4d" />

    </svg>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import gsap from 'gsap'

const ice    = reactive({ x: 500, y: 500 })
const fire   = reactive({ x: 650, y: 500 })
const anchor = reactive({ x: 500, y: 500 })

const RADIUS       = 150
const SPEED        = 0.1
const TRAIL_LENGTH = 20

const iceTrail  = reactive([])
const fireTrail = reactive([])

let angle       = 0
let iceIsAnchor = true

const update = () => {
  angle += SPEED

  if (iceIsAnchor) {
    fire.x   = ice.x  + RADIUS * Math.cos(angle)
    fire.y   = ice.y  + RADIUS * Math.sin(angle)
    anchor.x = ice.x
    anchor.y = ice.y
  } else {
    ice.x    = fire.x + RADIUS * Math.cos(angle)
    ice.y    = fire.y + RADIUS * Math.sin(angle)
    anchor.x = fire.x
    anchor.y = fire.y
  }

  // Push current position, drop oldest if over limit
  iceTrail.push({ x: ice.x, y: ice.y })
  fireTrail.push({ x: fire.x, y: fire.y })
  if (iceTrail.length  > TRAIL_LENGTH) iceTrail.shift()
  if (fireTrail.length > TRAIL_LENGTH) fireTrail.shift()
}

const pivot = () => {
  iceIsAnchor = !iceIsAnchor
  angle += Math.PI
}

const handleInteraction = (e) => {
  if (e.repeat) return
  if (e.code === 'Space' || e.type === 'mousedown') pivot()
}

onMounted(() => {
  gsap.ticker.add(update)
  window.addEventListener('keydown', handleInteraction)
  window.addEventListener('mousedown', handleInteraction)
})
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  background-color: #111;
  overflow: hidden;
}
</style>