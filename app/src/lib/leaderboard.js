export function mergeAndSortLeaderboard(existingEntries, incomingEntry, maxEntries = 10) {
  // Make a shallow copy of the existing entries so we don't change the original array.
  const list = Array.isArray(existingEntries) ? existingEntries.slice() : []

  // Convert incoming score to a number. If it's not a valid number, just sort and return existing list.
  const incomingScore = Number(incomingEntry && incomingEntry.score)
  if (!Number.isFinite(incomingScore)) {
    return list
      .slice()
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, maxEntries)
  }

  // Normalize incoming user id as a string when present.
  const incomingUserId =
    incomingEntry && incomingEntry.user_id != null ? String(incomingEntry.user_id) : null

  // Look for an existing row for the same user. If found, update only when the new score is higher.
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

  // If no existing row for this user, add the new entry.
  if (!found) {
    list.push({ ...incomingEntry, score: incomingScore })
  }

  // Sort the list so highest scores are first and return up to maxEntries.
  list.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
  return list.slice(0, maxEntries)
}
