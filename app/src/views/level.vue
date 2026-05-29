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

    // event from Controls should include the final score
    const emittedScore = evt?.score ?? null
    const scoreToSave = emittedScore ?? gameStore.score ?? 0

    // get current user id if available (supports both v1/v2 supabase APIs)
    let userId = null
    try {
      if (supabase.auth.getUser) {
        const { data } = await supabase.auth.getUser()
        userId = data?.user?.id ?? null
      } else if (typeof supabase.auth.user === 'function') {
        const u = supabase.auth.user()
        userId = u?.id ?? null
      }
    } catch (e) {
      userId = null
    }

    const payload = {
      user_id: userId,
      level_id: levelId,
      score: scoreToSave,
      // best_time removed
    }

    // request inserted rows so `data` is populated
    const { data, error } = await supabase.from('leaderboard_scores').insert([payload]).select()
    if (error) {
      console.error('Failed to save leaderboard entry:', error)
    } else {
      console.log('Saved leaderboard entry:', data)
      // notify home to refresh leaderboard
      window.dispatchEvent(new CustomEvent('leaderboard-updated', { detail: { levelId } }))
    }
  } catch (err) {
    console.error('onLevelComplete error:', err)
  }
}
</script>
