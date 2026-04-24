<template>
  <input type="checkbox" @keydown.space="handleSpacebar" />
  <p>{{ SpacebarPressed }}</p>
</template>

<script setup>
import { ref } from 'vue'

let SpacebarPressed = ref(false)
function handleSpacebar() {
  SpacebarPressed.value = true
}
</script>

<style scoped></style>
