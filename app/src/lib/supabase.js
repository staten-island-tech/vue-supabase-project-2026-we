import { createClient } from '@supabase/supabase-js'

// Create the Supabase client using environment variables from Vite.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// Fetch top 10 leaderboard rows for a level. Returns an array (empty on error).
export async function fetchLeaderboardScores(levelId) {
  try {
    const res = await supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('level_id', levelId)
      .order('score', { ascending: false })
      .limit(10)

    if (res && res.error) throw res.error
    return (res && res.data) || []
  } catch (err) {
    console.error('Failed to read leaderboard rows:', err && (err.message || err))
    return []
  }
}

// Return the currently logged-in user object, or null when not signed in.
export async function getCurrentUser() {
  try {
    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      const result = await supabase.auth.getUser()
      const data = result && result.data
      return (data && data.user) || null
    }

    if (supabase.auth && typeof supabase.auth.user === 'function') {
      return supabase.auth.user() || null
    }
  } catch (err) {
    console.warn('getCurrentUser error', err)
  }
  return null
}

// Add or update a leaderboard score.
// payload should be: { user_id, username, level_id, score }
export async function addLeaderboardScore(payload) {
  try {
    console.debug('addLeaderboardScore payload:', payload)

    // Try to determine a username.
    let username = (payload && payload.username) || null

    if (!username) {
      try {
        const user = await getCurrentUser()
        if (user && user.id) {
          if (user.email) username = String(user.email).split('@')[0]

          if (!username) {
            const profRes = await supabase
              .from('profiles')
              .select('username')
              .eq('id', user.id)
              .single()
            const prof = profRes && profRes.data
            const profErr = profRes && profRes.error
            if (!profErr && prof && prof.username) username = prof.username
          }
        }
      } catch (e) {
        console.warn('Profile lookup failed; continuing with fallback', e)
      }
    }

    if (!username) username = 'Guest'

    // Normalize level id when it looks numeric.
    const levelIdNormalized =
      payload && payload.level_id !== undefined && /^-?\d+$/.test(String(payload.level_id))
        ? Number(payload.level_id)
        : payload && payload.level_id

    const scoreNum = Number((payload && payload.score) || 0)
    const userId = (payload && payload.user_id) || null

    const row = {
      user_id: userId,
      level_id: levelIdNormalized,
      score: scoreNum,
      username: String(username),
    }

    // If user exists, check for an existing row for same user+level.
    if (userId) {
      const existingRes = await supabase
        .from('leaderboard_scores')
        .select('id,score,username')
        .eq('user_id', userId)
        .eq('level_id', levelIdNormalized)
        .limit(1)
      const existingRows = existingRes && existingRes.data
      const existingErr = existingRes && existingRes.error

      if (existingErr) {
        console.warn('Could not check for existing leaderboard row:', existingErr)
      } else if (Array.isArray(existingRows) && existingRows.length > 0) {
        const existing = existingRows[0]
        if (Number((existing && existing.score) || 0) >= scoreNum) {
          console.debug('Existing score is higher or equal; skipping insert/update', existing)
          return { data: existing, error: null, response: null }
        }

        const updRes = await supabase
          .from('leaderboard_scores')
          .update({ score: scoreNum, username: row.username })
          .eq('id', existing.id)
          .select()
          .single()
        const updated = updRes && updRes.data
        const updateErr = updRes && updRes.error

        if (updateErr) {
          console.error('Failed to update existing leaderboard row', updateErr)
          return { data: null, error: updateErr, response: null }
        }
        console.debug('Updated leaderboard row', updated)
        return { data: updated, error: null, response: null }
      }
    }

    // Insert new row when no existing row was found.
    const insertRes = await supabase.from('leaderboard_scores').insert([row]).select()
    if (insertRes && insertRes.error) {
      console.error('addLeaderboardScore error', insertRes.error, 'response:', insertRes)
      return { data: null, error: insertRes.error, response: insertRes }
    }

    console.debug('addLeaderboardScore inserted', insertRes && insertRes.data)
    return { data: insertRes && insertRes.data, error: null, response: insertRes }
  } catch (err) {
    console.error('addLeaderboardScore exception', err)
    return { data: null, error: err, response: null }
  }
}

// Update a leaderboard row by id. Returns the updated row or null.
export async function updateLeaderboardScore(scoreId, updates) {
  try {
    const res = await supabase.from('leaderboard_scores').update(updates).eq('id', scoreId).select()
    const data = res && res.data
    const error = res && res.error

    if (error) throw error
    return Array.isArray(data) ? data[0] : null
  } catch (err) {
    console.error('Supabase update error:', err)
    return null
  }
}

// Delete a leaderboard row by id. Returns true when delete succeeded.
export async function deleteLeaderboardScore(scoreId) {
  try {
    const res = await supabase.from('leaderboard_scores').delete().eq('id', scoreId)
    const error = res && res.error
    if (error) throw error
    return true
  } catch (err) {
    console.error('Supabase delete error:', err)
    return false
  }
}

// Expose helpers for quick debugging in browser console.
if (typeof window !== 'undefined') {
  window.supabase = supabase
  window.getCurrentUser = getCurrentUser
  window.addLeaderboardScore = addLeaderboardScore
  window.updateLeaderboardScore = updateLeaderboardScore
  window.deleteLeaderboardScore = deleteLeaderboardScore

  window.debugFetchScores = async function (limit) {
    limit = typeof limit === 'number' ? limit : 1
    console.log('current user ->', await getCurrentUser())
    const res = await supabase
      .from('leaderboard_scores')
      .select('user_id,level_id,score,username')
      .limit(limit)
    console.log('leaderboard fetch ->', res)
    return res
  }
}
