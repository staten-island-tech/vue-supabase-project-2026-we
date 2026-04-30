<template>
  <div class="game-container">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000">
      <circle :cx="anchor.x" :cy="anchor.y" :r="radius" fill="none" stroke="#333" stroke-dasharray="5,5" />
      <circle :cx="ice.x" :cy="ice.y" r="18" fill="#00e5ff" class="ball" />
      <circle :cx="fire.x" :cy="fire.y" r="18" fill="#ff4d4d" class="ball" />
    </svg>
    <div class="overlay">
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import gsap from 'gsap'

const ice    = reactive({ x: 500, y: 500 })
const fire   = reactive({ x: 650, y: 500 })
const anchor = reactive({ x: 500, y: 500 })

const radius = 150
const speed  = 0.1

let angle        = 0
let iceIsAnchor  = true

const update = () => {
  angle += speed

  if (iceIsAnchor) {
    fire.x   = ice.x + radius * Math.cos(angle)
    fire.y   = ice.y + radius * Math.sin(angle)
    anchor.x = ice.x
    anchor.y = ice.y
  } else {
    ice.x    = fire.x + radius * Math.cos(angle)
    ice.y    = fire.y + radius * Math.sin(angle)
    anchor.x = fire.x
    anchor.y = fire.y
  }
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
  display: flex;
  justify-content: center;
  align-items: center;
}
.ball {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
  transform-origin: center;
}
.overlay {
  position: absolute;
  top: 40px;
  color: #555;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
  user-select: none;
}
h1 { margin: 0; letter-spacing: 2px; }
</style>