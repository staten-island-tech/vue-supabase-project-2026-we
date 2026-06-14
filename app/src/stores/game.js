import { defineStore } from 'pinia'
import { fetchLeaderboardScores } from '@/lib/supabase'

export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,
    currentUser: null, // { id, email, username }
    selectedLevelId: null,
    leaderboardEntries: [],
    // Loading and error flags for leaderboard UI
    leaderboardLoading: false,
    leaderboardError: null,
  }),
  actions: {
    resetGame() {
      this.score = 0
    },

    setCurrentUser(user) {
      // user: { id, email, username } or null
      this.currentUser = user ? { ...user } : null
    },

    setSelectedLevel(id) {
      this.selectedLevelId = id
    },

    setLeaderboardEntries(entries) {
      this.leaderboardEntries = Array.isArray(entries) ? entries.slice() : []
    },

    // Fetch leaderboard rows for a level and store them.
    // This uses the helper `fetchLeaderboardScores` to keep code simple.
    async loadLeaderboard(levelId) {
      if (!levelId) return null

      // Mark loading state so the UI can show a spinner/message.
      this.leaderboardLoading = true
      this.leaderboardError = null

      try {
        const rows = await fetchLeaderboardScores(levelId)

        // `fetchLeaderboardScores` returns an array (or empty array on error).
        this.setLeaderboardEntries(Array.isArray(rows) ? rows.slice() : [])
        return rows || []
      } catch (err) {
        // Store a simple error message for UI and reset entries.
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
