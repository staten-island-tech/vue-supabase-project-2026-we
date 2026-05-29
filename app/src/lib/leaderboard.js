export function mergeAndSortLeaderboard(entries, newEntry, maxEntries = 10) {
  const list = Array.isArray(entries) ? entries.slice() : []
  const normalizedNewScore = Number(newEntry?.score ?? NaN)
  if (!Number.isFinite(normalizedNewScore)) {
    return list
      .slice()
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, maxEntries)
  }
  const newUserId = newEntry?.user_id ?? null
  const existingIndex = list.findIndex(
    (e) => (e.user_id ?? null) !== null && String(e.user_id) === String(newUserId),
  )
  if (existingIndex >= 0) {
    const existingScore = Number(list[existingIndex].score ?? 0)
    if (normalizedNewScore > existingScore) {
      list[existingIndex] = { ...list[existingIndex], ...newEntry, score: normalizedNewScore }
    }
  } else {
    list.push({ ...newEntry, score: normalizedNewScore })
  }
  return list
    .slice()
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, maxEntries)
}
