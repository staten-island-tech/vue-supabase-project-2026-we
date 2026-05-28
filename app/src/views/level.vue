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
import { supabase } from '@/lib/supabase'

const route = useRoute()

const gameStore = useGameStore()

const level = computed(() => {
  return getLevelById(route.params.id)
})

onMounted(() => {
  gameStore.resetGame()
})

// called when Controls emits stationaryOnLast
async function onLevelComplete(evt) {
  try {
    // determine level_id type (int or string) to match your DB schema
    const rawId = level.value?.id
    const levelId = /^-?\d+$/.test(String(rawId)) ? Number(rawId) : String(rawId)

    // get current user id if available (supports both v1/v2 supabase APIs)
    let userId = null
    try {
      const getUser = supabase.auth.getUser
      if (getUser) {
        const { data } = await supabase.auth.getUser()
        userId = data?.user?.id ?? null
      } else if (supabase.auth.user) {
        const u = supabase.auth.user()
        userId = u?.id ?? null
      }
    } catch (e) {
      userId = null
    }

    const payload = {
      user_id: userId,
      level_id: levelId,
      score: gameStore.score,
      best_time_ms: null,
    }

    const { data, error } = await supabase.from('leaderboard_scores').insert([payload]).select() // request the inserted rows; without this `data` can be null
    if (error) {
      console.error('Failed to save leaderboard entry:', error)
    } else {
      console.log('Saved leaderboard entry:', data)
      // notify other views to refresh leaderboard for this level
      window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: { levelId } }))
    }
  } catch (err) {
    console.error('onLevelComplete error:', err)
  }
}
</script>
