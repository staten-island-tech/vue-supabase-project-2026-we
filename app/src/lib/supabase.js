import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function fetchLeaderboardScores(levelId) {
  try {
    const { data, error } = await supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('level_id', levelId)
      .order('score', { ascending: false })
      .limit(10)

    if (error) throw error
    return data ?? []
  } catch (error) {
    console.error('Supabase read error:', error.message || error)
    return []
  }
}

export async function addLeaderboardScore(scoreRecord) {
  try {
    const { data, error } = await supabase.from('leaderboard_scores').insert([scoreRecord]).select()

    if (error) throw error
    return Array.isArray(data) ? data[0] : null
  } catch (error) {
    console.error('Supabase insert error:', error)
    return null
  }
}

export async function updateLeaderboardScore(scoreId, updates) {
  try {
    const { data, error } = await supabase
      .from('leaderboard_scores')
      .update(updates)
      .eq('id', scoreId)
      .select()

    if (error) throw error
    return Array.isArray(data) ? data[0] : null
  } catch (error) {
    console.error('Supabase update error:', error)
    return null
  }
}

export async function deleteLeaderboardScore(scoreId) {
  try {
    const { error } = await supabase.from('leaderboard_scores').delete().eq('id', scoreId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Supabase delete error:', error)
    return false
  }
}

export async function getCurrentUser() {
  try {
    if (supabase.auth.getUser) {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data?.user ?? null
    }

    if (typeof supabase.auth.user === 'function') {
      return supabase.auth.user()
    }

    return null
  } catch (error) {
    console.error('Supabase auth error:', error)
    return null
  }
}
