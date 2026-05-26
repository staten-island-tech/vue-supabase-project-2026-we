<!-- This error shows that my leaderboard is using uuid, how do I fix this in my code
home.vue:98 Leaderboard load error:
{code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "1"'}
code
:
"22P02"
details
:
null
hint
:
null
 -->

// ...existing code...
async function loadLeaderboardForLevel(levelId) {
if (!levelId) return

loadingLeaderboard.value = true

// validate UUID to avoid invalid input errors from Postgres
const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
String(levelId)
)

if (!isUuid) {
console.warn('Skipping leaderboard query: levelId is not a UUID:', levelId)
leaderboardEntries.value = []
loadingLeaderboard.value = false
return
}

const { data, error } = await supabase
.from('leaderboard_scores')
.select('user_id, score, best_time_ms, created_at')
.eq('level_id', levelId)
.order('score', { ascending: false })
.limit(10)

if (error) {
console.error('Leaderboard load error:', error)
leaderboardEntries.value = []
} else {
leaderboardEntries.value = data || []
}

loadingLeaderboard.value = false
}
// ...existing code...

Better long-term fixes (choose one):

Update your LEVELS entries to use UUID strings that match leaderboard_scores.level_id.
Or change leaderboard_scores.level_id in Postgres to an integer (or add a numeric level_number column) and query that instead.
Example: change LEVELS to use UUIDs (components/levels.js):

Apply the quick fix now to stop the runtime error, then pick the long-term fix that matches your data model.
