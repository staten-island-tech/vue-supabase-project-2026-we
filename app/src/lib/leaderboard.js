export function mergeAndSortLeaderboard(entries, newEntry, maxEntries = 10) {
  const list = Array.isArray(entries) ? entries.slice() : []

  const newScore = Number(newEntry && newEntry.score)
  if (!Number.isFinite(newScore)) {
    return list
      .slice()
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, maxEntries)
  }

  const newUserId = newEntry && newEntry.user_id != null ? String(newEntry.user_id) : null

  let found = false
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (item && item.user_id != null && String(item.user_id) === newUserId) {
      found = true
      const existingScore = Number(item.score || 0)
      if (newScore > existingScore) {
        list[i] = { ...item, ...newEntry, score: newScore }
      }
      break
    }
  }

  if (!found) {
    list.push({ ...newEntry, score: newScore })
  }

  list.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
  return list.slice(0, maxEntries)
}
