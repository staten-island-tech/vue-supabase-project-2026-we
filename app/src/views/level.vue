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

const levelId = computed(function () {
  var raw = route && route.params ? route.params.id : undefined
  return Number(raw)
})

const level = computed(function () {
  return getLevelById(levelId.value)
})

onMounted(function () {
  gameStore.resetGame()
})

async function onLevelComplete(evt) {
  try {
    var scoreToSave = 0
    if (evt && evt.score !== undefined && evt.score !== null) {
      scoreToSave = Number(evt.score)
    } else if (gameStore && gameStore.score !== undefined && gameStore.score !== null) {
      scoreToSave = Number(gameStore.score)
    }

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
