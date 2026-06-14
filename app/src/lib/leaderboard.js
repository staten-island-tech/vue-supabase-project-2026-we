export function mergeAndSortLeaderboard(existingEntries, incomingEntry, maxEntries = 10) {
  const list = Array.isArray(existingEntries) ? existingEntries.slice() : []
  const incomingScore = Number(incomingEntry && incomingEntry.score)
  if (!Number.isFinite(incomingScore)) {
    return list
      .slice()
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, maxEntries)
  }

  const incomingUserId =
    incomingEntry && incomingEntry.user_id != null ? String(incomingEntry.user_id) : null

  let found = false
  for (let i = 0; i < list.length; i++) {
    const row = list[i]
    if (row && row.user_id != null && String(row.user_id) === incomingUserId) {
      found = true
      const existingScore = Number(row.score || 0)
      if (incomingScore > existingScore) {
        // Replace the row with a new object that includes the incoming fields but uses the numeric score.
        list[i] = { ...row, ...incomingEntry, score: incomingScore }
      }
      break
    }
  }

  if (!found) {
    list.push({ ...incomingEntry, score: incomingScore })
  }

  list.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
  return list.slice(0, maxEntries)
}
