import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useGameStore = defineStore('game', {
  state: () => ({
    score: 0,
    currentUser: null, // { id, email, username }
    selectedLevelId: null,
    leaderboardEntries: [],
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

    // fetch leaderboard rows for a level and store them
    async loadLeaderboard(levelId) {
      if (!levelId) return null
      try {
        const { data, error } = await supabase
          .from('leaderboard_scores')
          .select('user_id, score, username')
          .eq('level_id', levelId)
          .order('score', { ascending: false })
          .limit(10)

        if (error) {
          console.error('loadLeaderboard error', error)
          this.setLeaderboardEntries([])
          return null
        }

        this.setLeaderboardEntries(data || [])
        return data || []
      } catch (err) {
        console.error('loadLeaderboard exception', err)
        this.setLeaderboardEntries([])
        return null
      }
    },
  },
})
