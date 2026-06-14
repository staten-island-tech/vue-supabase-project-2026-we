export function mergeAndSortLeaderboard(existingEntries, incomingEntry, maxEntries = 10) {
  // array
  let leaderboard = []
  if (Array.isArray(existingEntries)) {
    leaderboard = existingEntries.slice() // Copying the array protects our original data
  }

  // if there is no incoming entry at all, just sort and return
  if (!incomingEntry) {
    leaderboard.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    return leaderboard.slice(0, maxEntries)
  }

  // convert incoming data to Numbers and Strings
  const incomingScore = Number(incomingEntry.score)
  const incomingUserId = incomingEntry.user_id != null ? String(incomingEntry.user_id) : null

  // if the new score isn't a valid number, ignore it, sort, and return
  if (!Number.isFinite(incomingScore)) {
    leaderboard.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    return leaderboard.slice(0, maxEntries)
  }

  // check if user_id is new or not
  let userWasFound = false

  for (let i = 0; i < leaderboard.length; i++) {
    const currentRow = leaderboard[i]

    // if current row's user matches incoming user
    if (currentRow && currentRow.user_id != null && String(currentRow.user_id) === incomingUserId) {
      userWasFound = true
      const existingScore = Number(currentRow.score || 0)

      // Only overwrite their score if their new score is  higher
      if (incomingScore > existingScore) {
        leaderboard[i] = {
          ...currentRow,
          ...incomingEntry,
          score: incomingScore,
        }
      }
      break
    }
  }

  // if loop finishes -> add them as a brand new entry
  if (userWasFound === false) {
    leaderboard.push({
      ...incomingEntry,
      score: incomingScore,
    })
  }

  // sort
  leaderboard.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))

  // Cut off the array so we only return the top 10 entries
  return leaderboard.slice(0, maxEntries)
}
