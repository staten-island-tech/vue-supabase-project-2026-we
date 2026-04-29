<template>
  <div class="game-container">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000">
      <circle ref="blueBall" :cx="blue.x" :cy="blue.y" r="15" fill="#00e5ff" />
      <circle ref="redBall" :cx="red.x" :cy="red.y" r="15" fill="#ff4d4d" />
    </svg>
    <div class="overlay">Press SPACE to pivot</div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import gsap from 'gsap'

// State tracking
const blue = reactive({ x: 500, y: 500 })
const red = reactive({ x: 500, y: 400 }) // Start red above blue
const blueBall = ref(null)
const redBall = ref(null)

let rotationProxy = { angle: 0 }
let animation = null
let blueIsAnchor = true
const radius = 100 // Distance between balls

const updatePositions = () => {
  // The anchor stays put, the orbit ball moves based on angle
  if (blueIsAnchor) {
    red.x = blue.x + radius * Math.cos(rotationProxy.angle)
    red.y = blue.y + radius * Math.sin(rotationProxy.angle)
  } else {
    blue.x = red.x + radius * Math.cos(rotationProxy.angle)
    blue.y = red.y + radius * Math.sin(rotationProxy.angle)
  }
}

const pivot = () => {
  // 1. Switch who is the anchor
  blueIsAnchor = !blueIsAnchor

  // 2. Adjust the angle by 180 degrees (PI radians)
  // This ensures the new orbiting ball starts from the opposite side
  rotationProxy.angle += Math.PI

  // 3. Update visual immediately
  updatePositions()
}

const startEngine = () => {
  // Standard ADOFAI speed is constant rotation
  animation = gsap.to(rotationProxy, {
    angle: `+=${Math.PI * 2}`,
    duration: 2, // Adjust for difficulty (seconds per full rotation)
    repeat: -1,
    ease: 'none',
    onUpdate: updatePositions,
  })
}

const handleInteraction = (e) => {
  if (e.code === 'Space' || e.type === 'mousedown') {
    if (e.repeat) return // Prevent held-key spam
    pivot()
  }
}

onMounted(() => {
  startEngine()
  window.addEventListener('keydown', handleInteraction)
  window.addEventListener('mousedown', handleInteraction)
})
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.overlay {
  position: absolute;
  top: 20px;
  width: 100%;
  text-align: center;
  color: white;
  font-family: sans-serif;
  pointer-events: none;
}
</style>
