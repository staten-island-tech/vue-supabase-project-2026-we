import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,
    highScore: 0,
  }),

  actions: {
    setScore(newScore) {
      this.score = newScore

      if (newScore > this.highScore) {
        this.highScore = newScore
      }
    },

    resetScore() {
      this.score = 0
    },

    // ensure level.vue can call this
    resetGame() {
      // reset transient/session state
      this.score = 0
      if (this.combo !== undefined) this.combo = 0
      if (this.isRunning !== undefined) this.isRunning = false
      // keep persistent values like highScore unless you intend to reset them:
      // this.highScore = 0
    },
  },
})
