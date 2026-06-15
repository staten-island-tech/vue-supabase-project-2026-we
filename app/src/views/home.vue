<template>
  <div class="page">
    <div class="lvlcontain">
      <h1>Song Selector</h1>
      <div class="levelcard" v-for="level in levels" :key="level.id" @click="selectLevel(level)">
        <img :src="level.img" />
        <div class="text">
          <h2>{{ level.name }}</h2>
          <p>{{ level.desc }}</p>
          <p>Difficulty: {{ level.difficulty }}</p>
        </div>
      </div>
    </div>

    <div class="playcard" v-if="selectedLevel">
      <p class="level">LEVEL</p>
      <h1>{{ selectedLevel.name }}</h1>
      <div class="difficulty">
        <span class="easy">✦ {{ selectedLevel.difficulty.toUpperCase() }}</span>
        <span class="maxscore">MAX SCORE: {{ selectedLevel.beats * 50 }}</span>
      </div>
      <RouterLink :to="{ name: 'level', params: { id: selectedLevel.id } }">
        <button class="playbtn">
          ▶ PLAY
          <p>START SESSION</p>
        </button>
      </RouterLink>
    </div>

    <div class="leaderboard">
      <h2>LEADERBOARD</h2>
      <button
        v-if="gameStore.isTestUser && selectedLevel"
        class="reset-btn"
        @click="resetLeaderboard"
        title="Reset leaderboard for the selected level"
      >
        Reset leaderboard
      </button>
      <div v-if="resetStatus" class="reset-status">{{ resetStatus }}</div>
      <div v-if="resetError" class="reset-error">Error: {{ resetError }}</div>

      <div v-if="gameStore.leaderboardLoading">Loading...</div>
      <div v-else>
        <div
          v-for="(row, idx) in leaderboardDisplayRows"
          :key="row.id ?? row.user_id + '-' + idx"
          class="scoreline"
        >
          <span>{{ row.displayName }}</span>
          <span>{{ row.score }}</span>
        </div>

        <div v-if="!gameStore.leaderboardLoading && leaderboardDisplayRows.length === 0">
          No scores yet.
        </div>
      </div>

      <div v-if="gameStore.leaderboardError" class="error">
        {{ gameStore.leaderboardError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { LEVELS } from '@/components/levels'

import { supabase, deleteLeaderboardForLevel } from '@/lib/supabase'

const levels = Object.values(LEVELS)

const resetStatus = ref('')
const resetError = ref('')

const gameStore = useGameStore()

const selectedLevel = computed(() =>
  levels.find((level) => String(level.id) === String(gameStore.selectedLevelId)),
)

const leaderboardDisplayRows = computed(() =>
  gameStore.leaderboardEntries.map((row) => ({
    displayName: row.username ?? String(row.user_id ?? 'Guest'),
    score: row.score ?? 0,
  })),
)

function selectLevel(level) {
  gameStore.setSelectedLevel(level.id)
  gameStore.loadLeaderboard(level.id)
}

const myScores = computed(() =>
  gameStore.leaderboardEntries.filter((row) => row.user_id === gameStore.currentUser?.id),
)

watch(
  () => gameStore.selectedLevelId,
  (levelId) => {
    if (levelId) {
      gameStore.loadLeaderboard(levelId)
    }
  },
)

onMounted(() => {
  if (levels.length > 0) {
    selectLevel(levels[0])
  }

  if (!gameStore.currentUser) {
    gameStore.setCurrentUser(null)
  }
})

async function resetLeaderboard() {
  try {
    if (!selectedLevel || !selectedLevel.value) return
    if (!confirm(`Delete all leaderboard rows for level "${selectedLevel.value.name}"?`)) return
    resetStatus.value = ''
    resetError.value = ''
    const res = await deleteLeaderboardForLevel(selectedLevel.value.id)
    if (res && res.ok) {
      resetStatus.value = `Deleted ${res.deletedCount} rows`
      await gameStore.loadLeaderboard(selectedLevel.value.id)
      return
    }

    // handle failure / diagnostics
    console.warn('deleteLeaderboardForLevel result:', res)
    if (res && res.diagnostics) {
      const parts = res.diagnostics.map((d) => {
        try {
          if (d.res && d.res.error)
            return `${d.method}: ERROR ${d.res.error.message || JSON.stringify(d.res.error)}`
          if (d.res && Array.isArray(d.res.data)) return `${d.method}: rows=${d.res.data.length}`
          if (d.error) return `${d.method}: exception ${d.error}`
          return `${d.method}: ${JSON.stringify(d.res)}`
        } catch (e) {
          return `${d.method}: (format error)`
        }
      })
      resetError.value = parts.join(' | ')
    } else {
      resetError.value =
        (res && res.error && (res.error.message || String(res.error))) || 'Unknown error'
    }
    await gameStore.loadLeaderboard(selectedLevel.value.id)
    return
  } catch (e) {
    console.error('resetLeaderboard error', e)
    resetError.value = e && (e.message || String(e))
  }
}
</script>

<style scoped>
/* Mobile-first layout: stack sections vertically */
.page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
  color: white;
}

.lvlcontain {
  background-color: #920075;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.levelcard {
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: #f6019d;
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;
  min-height: 84px;
}

.levelcard:hover {
  transform: translateZ(0) scale(1.01);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
}

.levelcard img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}

.text {
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.text h2 {
  margin: 0;
  font-size: clamp(16px, 3.5vw, 22px);
}
.text p {
  margin: 2px 0;
  font-size: clamp(12px, 2.5vw, 16px);
  opacity: 0.9;
}

a {
  text-decoration: none;
  color: inherit;
}

.playcard {
  background: #d40078;
  padding: 18px;
  border-radius: 16px;
  color: white;
  width: 100%;
  box-sizing: border-box;
}
.playcard .level {
  opacity: 0.8;
  margin: 0;
}
.playcard h1 {
  margin: 8px 0 16px 0;
  font-size: clamp(20px, 6vw, 40px);
}
.difficulty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.maxscore {
  font-weight: 600;
  opacity: 0.95;
  text-align: right;
}

.playbtn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 18px;
  background: #f6019d;
  color: white;
  cursor: pointer;
}
.playbtn p {
  font-size: 12px;
  margin: 6px 0 0 0;
  opacity: 0.8;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  margin-bottom: 8px;
}
.reset-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.debug-info {
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.debug-info .mono {
  font-family: monospace;
  opacity: 0.95;
  margin: 0 6px;
}
.debug-info .sep {
  opacity: 0.6;
  margin: 0 6px;
}
.test-badge {
  background: #ffa0d6;
  color: #3a0027;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 700;
  margin-left: 8px;
}
.reset-status {
  margin-top: 6px;
  color: #ddffdd;
  font-size: 13px;
}
.reset-error {
  margin-top: 6px;
  color: #ffdddd;
  font-size: 13px;
}

.leaderboard {
  background: rgb(255, 78, 196);
  padding: 14px;
  border-radius: 16px;
  color: white;
  width: 100%;
  box-sizing: border-box;
}
.leaderboard h2 {
  margin-bottom: 12px;
}
.scoreline {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 16px;
}

/* Overlays: keep simple and scale on small screens */
.lvlname,
.judge,
.score {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  pointer-events: none;
}
.lvlname {
  top: 18px;
  font-size: clamp(20px, 6vw, 72px);
  font-weight: 700;
}
.judge {
  top: 68px;
  font-size: clamp(14px, 3.5vw, 24px);
}
.score {
  top: 106px;
  font-size: clamp(14px, 3.5vw, 24px);
}

.back {
  position: fixed;
  top: 14px;
  left: 14px;
  background-color: white;
  color: black;
  border: none;
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 8px;
}

.end-screen {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
}
.end-card {
  background: #1e1e1e;
  padding: 28px;
  border-radius: 12px;
  min-width: 260px;
  text-align: center;
  color: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}
.end-card h1 {
  font-size: clamp(20px, 6vw, 42px);
  margin-bottom: 12px;
}
.final-score {
  font-size: clamp(16px, 4vw, 24px);
  margin-bottom: 18px;
}
.end-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.end-buttons button {
  background: white;
  color: black;
  border: none;
  padding: 10px 14px;
  font-size: 16px;
  border-radius: 8px;
}

/* Desktop / large screens: place three-column layout similar to previous design */
@media (min-width: 1000px) {
  .page {
    display: grid;
    grid-template-columns: 300px 1fr 340px;
    gap: 24px;
    align-items: start;
    padding: 40px;
  }
  .lvlcontain {
    width: 100%;
    height: auto;
    padding-bottom: 20px;
  }
  .playcard {
    width: 100%;
    max-width: 420px;
    margin: 60px auto 0 auto;
  }
  .difficulty {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .maxscore {
    text-align: right;
  }
  .leaderboard {
    width: 100%;
    max-width: 360px;
    margin-top: 60px;
  }
}
</style>
