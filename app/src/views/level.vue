<template>
  <div v-if="level">
    <Controls :level="level" @stationaryOnLast="onLevelComplete" />
  </div>

  <div v-else>Level not found!</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import Controls from '@/components/controls.vue'
import { getLevelById } from '@/components/levels'

import { useGameStore } from '@/stores/game'
import { addLeaderboardScore, getCurrentUser } from '@/lib/supabase'

const route = useRoute()
const gameStore = useGameStore()

const levelId = computed(() => Number(route.params.id))
const level = computed(() => getLevelById(levelId.value))

onMounted(() => {
  gameStore.resetGame()
})

// called when Controls emits stationaryOnLast
async function onLevelComplete(evt) {
  try {
    const scoreToSave = Number(evt?.score ?? gameStore.score ?? 0)
    const user = await getCurrentUser()

    const payload = {
      user_id: user?.id ?? null,
      level_id: levelId.value,
      score: scoreToSave,
    }

    const savedEntry = await addLeaderboardScore(payload)
    if (savedEntry) {
      console.log('Saved leaderboard entry:', savedEntry)
    } else {
      console.error('Leaderboard entry was not saved.')
    }
  } catch (err) {
    console.error('onLevelComplete error:', err)
  }
}
</script>
