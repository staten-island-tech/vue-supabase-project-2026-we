import { defineStore } from 'pinia'
import {
  fetchLeaderboardScores,
  addLeaderboardScore,
  updateLeaderboardScore,
  deleteLeaderboardScore,
} from '@/lib/supabase'

export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,
    highScore: 0,
    currentUser: null,
    selectedLevelId: null,
    leaderboardEntries: [],
    leaderboardLoading: false,
    leaderboardError: null,
  }),

  getters: {
    selectedLevelIdNumber: (state) => Number(state.selectedLevelId),
    myLeaderboardRows: (state) =>
      state.leaderboardEntries.filter((row) => row.user_id === state.currentUser?.id),
  },

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

    resetGame() {
      this.score = 0
      this.selectedLevelId = null
      this.leaderboardEntries = []
      this.leaderboardLoading = false
      this.leaderboardError = null
    },

    setCurrentUser(user) {
      this.currentUser = user
    },

    setSelectedLevel(levelId) {
      this.selectedLevelId = levelId
    },

    async loadLeaderboard(levelId) {
      if (!levelId) {
        this.leaderboardEntries = []
        return
      }

      this.leaderboardLoading = true
      this.leaderboardError = null

      const rows = await fetchLeaderboardScores(levelId)

      this.leaderboardEntries = rows.map((row) => ({
        ...row,
        displayName: row.username || row.user_id || 'Guest',
      }))

      this.leaderboardLoading = false
    },

    async submitScore(levelId, scoreValue) {
      if (!levelId || !Number.isFinite(scoreValue)) return null

      const newScore = {
        user_id: this.currentUser?.id ?? null,
        level_id: levelId,
        score: scoreValue,
      }

      const inserted = await addLeaderboardScore(newScore)
      if (inserted) {
        await this.loadLeaderboard(levelId)
      }
      return inserted
    },

    async updateScoreEntry(scoreId, newScore) {
      if (!scoreId || !Number.isFinite(newScore)) return null
      const updated = await updateLeaderboardScore(scoreId, { score: newScore })
      if (updated) {
        await this.loadLeaderboard(this.selectedLevelId)
      }
      return updated
    },

    async deleteScoreEntry(scoreId) {
      if (!scoreId) return false
      const removed = await deleteLeaderboardScore(scoreId)
      if (removed) {
        await this.loadLeaderboard(this.selectedLevelId)
      }
      return removed
    },
  },
})
