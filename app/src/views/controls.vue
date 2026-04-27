<template>
  <p>{{ spacebarPressed }}</p>
  <svg width="120" height="120">
    <circle cx="60" cy="60" r="50" stroke="blue" stroke-width="4" fill="lightblue" />
  </svg>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const spacebarPressed = ref(false)

function handleKeydown(event) {
  if (event.code === 'Space') {
    event.preventDefault()
    spacebarPressed.value = !spacebarPressed.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped></style>
