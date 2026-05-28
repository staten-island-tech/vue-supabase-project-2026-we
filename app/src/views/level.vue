<template>
  <div v-if="level">
    <Controls :level="level" />
  </div>

  <div v-else>Level not found!</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import Controls from '@/components/controls.vue'
import { getLevelById } from '@/components/levels'

import { useGameStore } from '@/stores/game'

const route = useRoute()

const gameStore = useGameStore()

const level = computed(() => {
  return getLevelById(route.params.id)
})

onMounted(() => {
  gameStore.resetGame()
})
</script>
