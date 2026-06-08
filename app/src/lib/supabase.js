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
    console.debug('addLeaderboardScore input payload:', payload)

    // ensure username (derive from payload/profile/email or fallback)
    let username = payload?.username ?? null

    if (!username) {
      try {
        const user = await getCurrentUser()
        if (user?.id) {
          // try email local-part first (cheap, reliable)
          if (user.email) username = String(user.email).split('@')[0]
          // try profiles table only if still missing (catch errors)
          if (!username) {
            const { data: prof, error: profErr } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', user.id)
              .single()
            if (!profErr && prof?.username) username = prof.username
          }
        }
      } catch (e) {
        console.warn('profile lookup failed, continuing with fallback', e)
      }
    }

    if (!username) username = 'Guest'

    // normalize payload
    const levelIdNormalized =
      payload.level_id !== undefined && /^-?\d+$/.test(String(payload.level_id))
        ? Number(payload.level_id)
        : payload.level_id

    const scoreNum = Number(payload.score ?? 0)
    const userId = payload.user_id ?? null

    const insertPayload = {
      user_id: userId,
      level_id: levelIdNormalized,
      score: scoreNum,
      username: String(username),
    }

    console.debug('addLeaderboardScore normalized payload:', insertPayload)

    // If we have a user id, check for existing score for same level to avoid unique constraint errors
    if (userId) {
      const { data: existingRows, error: existingErr } = await supabase
        .from('leaderboard_scores')
        .select('id,score,username')
        .eq('user_id', userId)
        .eq('level_id', levelIdNormalized)
        .limit(1)

      if (existingErr) {
        console.warn('Could not check existing leaderboard row:', existingErr)
      } else if (Array.isArray(existingRows) && existingRows.length > 0) {
        const existing = existingRows[0]
        // if existing is higher or equal, do nothing
        if (Number(existing.score ?? 0) >= scoreNum) {
          console.debug('Existing score is higher or equal; skipping insert/update', existing)
          return { data: existing, error: null, response: null }
        }
        // otherwise update the existing row with new higher score & username
        const { data: updData, error: updErr } = await supabase
          .from('leaderboard_scores')
          .update({ score: scoreNum, username: insertPayload.username })
          .eq('id', existing.id)
          .select()
          .single()

        if (updErr) {
          console.error('Failed to update existing leaderboard row', updErr)
          return { data: null, error: updErr, response: null }
        }
        console.debug('Updated existing leaderboard row', updData)
        return { data: updData, error: null, response: null }
      }
    }

    // No existing row (or anonymous user) — insert new row
    const res = await supabase.from('leaderboard_scores').insert([insertPayload]).select()

    if (res.error) {
      console.error('addLeaderboardScore error', res.error, 'response:', res)
      return { data: null, error: res.error, response: res }
    }

    console.debug('addLeaderboardScore success', res.data)
    return { data: res.data, error: null, response: res }
  } catch (err) {
    console.error('addLeaderboardScore exception', err)
    return { data: null, error: err, response: null }
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

// expose for quick debugging in the browser console
if (typeof window !== 'undefined') {
  window.supabase = supabase
  window.getCurrentUser = getCurrentUser
  window.addLeaderboardScore = addLeaderboardScore
  window.updateLeaderboardScore = updateLeaderboardScore
  window.deleteLeaderboardScore = deleteLeaderboardScore

  window.debugFetchScores = async (limit = 1) => {
    console.log('current user ->', await getCurrentUser())
    const res = await supabase
      .from('leaderboard_scores')
      .select('user_id,level_id,score,username')
      .limit(limit)
    console.log('leaderboard fetch ->', res)
    return res
  }
}
