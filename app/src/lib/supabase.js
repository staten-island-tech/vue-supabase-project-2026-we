import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

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

/**
 * Return current logged in user (works with Supabase v2 and v1)
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  try {
    if (supabase.auth?.getUser) {
      const { data } = await supabase.auth.getUser()
      return data?.user ?? null
    }
    if (typeof supabase.auth?.user === 'function') {
      return supabase.auth.user() ?? null
    }
  } catch (err) {
    console.warn('getCurrentUser error', err)
  }
  return null
}

/**
 * Insert a leaderboard score row and return the inserted row (or null on error).
 * Expects payload like: { user_id, username, level_id, score }
 */
export async function addLeaderboardScore(payload) {
  try {
    const { data, error } = await supabase
      .from('leaderboard_scores')
      .insert([payload])
      .select()
      .single()

    if (error) {
      console.error('addLeaderboardScore error', error)
      return null
    }
    return data ?? null
  } catch (err) {
    console.error('addLeaderboardScore exception', err)
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
