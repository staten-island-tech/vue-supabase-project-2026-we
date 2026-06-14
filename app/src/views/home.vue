<template>
  <div>
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
        <span class="score">MAX SCORE: {{ selectedLevel.beats * 50 }}</span>
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
import { computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { LEVELS } from '@/components/levels'

// Keep supabase helper available if you want manual fetch here later.
// Most leaderboard operations are handled in the game store.
import { supabase } from '@/lib/supabase'

// Convert LEVELS map to a simple array of level objects.
const levels = Object.values(LEVELS)

// Get the central game store instance. This store keeps app state.
const gameStore = useGameStore()

// Find the currently selected level object based on id in the store.
const selectedLevel = computed(() =>
  levels.find((level) => String(level.id) === String(gameStore.selectedLevelId)),
)

// Prepare rows for the leaderboard UI. Show username or fallback to user id or 'Guest'.
const leaderboardDisplayRows = computed(() =>
  gameStore.leaderboardEntries.map((row) => ({
    displayName: row.username ?? String(row.user_id ?? 'Guest'),
    score: row.score ?? 0,
  })),
)

// Called when a user clicks a level card.
// We set the selected level in the store and ask the store to load scores.
function selectLevel(level) {
  gameStore.setSelectedLevel(level.id)
  gameStore.loadLeaderboard(level.id)
}

// Scores that belong to the current user (if signed in).
const myScores = computed(() =>
  gameStore.leaderboardEntries.filter((row) => row.user_id === gameStore.currentUser?.id),
)

// When the selected level id changes, automatically reload leaderboard for that level.
watch(
  () => gameStore.selectedLevelId,
  (levelId) => {
    if (levelId) {
      gameStore.loadLeaderboard(levelId)
    }
  },
)

// On first load, pick the first level and ensure store has a currentUser set (null if anonymous).
onMounted(() => {
  if (levels.length > 0) {
    selectLevel(levels[0])
  }

  if (!gameStore.currentUser) {
    gameStore.setCurrentUser(null)
  }
})

// Note: There used to be a local function here that directly called supabase.
// The app now uses the game store's `loadLeaderboard` method so we keep logic in one place.
</script>

<style scoped>
.lvlcontain {
  position: absolute;
  top: 15%;
  left: 10%;
  color: white;
  width: 20%;
  height: 75%;
  background-color: #920075;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 20px;
  border-radius: 20px;
}

.levelcard {
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #f6019d;
  width: 325px;
  height: 145px;
  border-radius: 20px;
  padding: 15px;
  box-sizing: border-box;
  cursor: pointer;
}

.levelcard:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.levelcard img {
  width: 90px;
  height: 90px;
  border-radius: 15px;
  object-fit: cover;
  margin-left: 10px;
}

.text {
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.text h2 {
  margin: 0;
  font-size: 25px;
}
.text p {
  margin: 2px 0;
  font-size: 16px;
  opacity: 0.8;
}

a {
  text-decoration: none;
  color: inherit;
}
a:visited {
  text-decoration: none;
  color: inherit;
}

.playcard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #d40078;
  padding: 30px;
  border-radius: 20px;
  color: white;
  width: 400px;
}
.playcard .level {
  opacity: 0.7;
  margin: 0;
}
.playcard h1 {
  margin: 5px 0 20px 0;
  font-size: 40px;
}
.difficulty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.playbtn {
  width: 100%;
  padding: 20px;
  border-radius: 15px;
  border: none;
  font-size: 22px;
  background: #f6019d;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.playbtn:hover {
  background: rgba(255, 255, 255, 0.25);
}
.playbtn p {
  font-size: 12px;
  margin: 5px 0 0 0;
  opacity: 0.7;
}

.leaderboard {
  position: absolute;
  top: 30%;
  right: 10%;
  background: rgb(255, 78, 196);
  padding: 20px;
  border-radius: 20px;
  color: white;
  width: 350px;
}
.leaderboard h2 {
  margin-bottom: 20px;
}
.scoreline {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 18px;
}
</style>
