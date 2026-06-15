import { defineStore } from 'pinia'
import { fetchLeaderboardScores } from '@/lib/supabase'

export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,
    currentUser: null,
    isTestUser: false,
    selectedLevelId: null,
    leaderboardEntries: [],

    leaderboardLoading: false,
    leaderboardError: null,
  }),
  actions: {
    resetGame() {
      this.score = 0
    },

    setCurrentUser(user) {
      this.currentUser = user ? { ...user } : null
    },
    setIsTestUser(v) {
      this.isTestUser = !!v
    },

    setSelectedLevel(id) {
      this.selectedLevelId = id
    },

    setLeaderboardEntries(entries) {
      this.leaderboardEntries = Array.isArray(entries) ? entries.slice() : []
    },

    async loadLeaderboard(levelId) {
      if (!levelId) return null

      this.leaderboardLoading = true
      this.leaderboardError = null

      try {
        const rows = await fetchLeaderboardScores(levelId)

        this.setLeaderboardEntries(Array.isArray(rows) ? rows.slice() : [])
        return rows || []
      } catch (err) {
        console.error('loadLeaderboard exception', err)
        this.setLeaderboardEntries([])
        this.leaderboardError = err && (err.message || String(err))
        return null
      } finally {
        this.leaderboardLoading = false
      }
    },
  },
})
