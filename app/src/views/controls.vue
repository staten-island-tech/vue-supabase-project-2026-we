<template>
  <div class="game-container">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000">
      <circle
        :cx="anchor.x"
        :cy="anchor.y"
        :r="radius"
        fill="none"
        stroke="#333"
        stroke-dasharray="5,5"
      />

      <circle :cx="blue.x" :cy="blue.y" r="18" fill="#00e5ff" class="ball" />
      <circle :cx="red.x" :cy="red.y" r="18" fill="#ff4d4d" class="ball" />
    </svg>
    <div class="overlay">
      <h1>{{ (speed * 60).toFixed(0) }} BPM</h1>
      <p>Press SPACE or Click to Orbit</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import gsap from 'gsap'

// Coordinates
const blue = reactive({ x: 500, y: 500 })
const red = reactive({ x: 650, y: 500 }) // Distance starts at 150
const anchor = reactive({ x: 500, y: 500 })

// Game State
const radius = 150
let angle = 0
let blueIsAnchor = true
let speed = 0.05 // Radians per frame (Adjustable for difficulty)

const update = () => {
  // Move the angle forward every frame
  angle += speed

  if (blueIsAnchor) {
    // Red orbits Blue
    red.x = blue.x + radius * Math.cos(angle)
    red.y = blue.y + radius * Math.sin(angle)
    anchor.x = blue.x
    anchor.y = blue.y
  } else {
    // Blue orbits Red
    blue.x = red.x + radius * Math.cos(angle)
    blue.y = red.y + radius * Math.sin(angle)
    anchor.x = red.x
    anchor.y = red.y
  }
}

const pivot = () => {
  // Flip the anchor
  blueIsAnchor = !blueIsAnchor

  // CRITICAL: To maintain the current visual position when swapping anchors,
  // we must flip the angle by 180 degrees (PI).
  // This makes the transition seamless.
  angle += Math.PI
}

const handleInteraction = (e) => {
  if (e.code === 'Space' || e.type === 'mousedown') {
    if (e.repeat) return
    pivot()

    // Add a tiny "kick" animation for juice
    gsap.fromTo('.ball', { scale: 1.2 }, { scale: 1, duration: 0.2 })
  }
}

onMounted(() => {
  // GSAP Ticker runs at the monitor's refresh rate (60fps, 120fps, etc)
  // This is much smoother than a standard setInterval
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
h1 {
  margin: 0;
  letter-spacing: 2px;
}
</style>
