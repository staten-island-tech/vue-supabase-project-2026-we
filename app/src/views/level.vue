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

// Read route params and store instance.
const route = useRoute()
const gameStore = useGameStore()

// Compute numeric level id from the route. If missing, Number(undefined) -> NaN.
const levelId = computed(function () {
  var raw = route && route.params ? route.params.id : undefined
  return Number(raw)
})

// Find the level object by id (helper returns null when not found).
const level = computed(function () {
  return getLevelById(levelId.value)
})

// Reset game state when this view mounts.
onMounted(function () {
  gameStore.resetGame()
})

// Called when Controls emits `stationaryOnLast` with { score }.
// We build a simple payload and save it to the leaderboard.
async function onLevelComplete(evt) {
  try {
    // Determine score to save. Prefer event value, fall back to store, then 0.
    var scoreToSave = 0
    if (evt && evt.score !== undefined && evt.score !== null) {
      scoreToSave = Number(evt.score)
    } else if (gameStore && gameStore.score !== undefined && gameStore.score !== null) {
      scoreToSave = Number(gameStore.score)
    }

    // Try to get the current signed-in user (may be null).
    var user = null
    try {
      user = await getCurrentUser()
    } catch (e) {
      console.warn('Could not get current user, continuing as anonymous', e)
    }

    var userId = null
    if (user && user.id) userId = user.id

    var payload = {
      user_id: userId,
      level_id: levelId.value,
      score: scoreToSave,
    }

    var savedEntry = await addLeaderboardScore(payload)
    if (savedEntry && savedEntry.error == null) {
      console.log('Saved leaderboard entry:', savedEntry)
    } else {
      console.error('Leaderboard entry was not saved.', savedEntry)
    }
  } catch (err) {
    console.error('onLevelComplete error:', err)
  }
}
</script>
