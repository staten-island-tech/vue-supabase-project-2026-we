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
  },
})
