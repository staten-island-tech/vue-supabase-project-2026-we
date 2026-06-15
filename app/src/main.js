import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { getCurrentUser } from '@/lib/supabase'
import { useGameStore } from '@/stores/game'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// After the app starts, try to load the signed-in user and store it.
;(async function () {
  var user = null
  try {
    user = await getCurrentUser()
  } catch (e) {
    user = null
  }

  var store = useGameStore()
  if (user) {
    var username = 'Guest'
    if (user.email) username = String(user.email).split('@')[0]
    store.setCurrentUser({ id: user.id || null, email: user.email || null, username: username })
    // Restore test-user flag if the session indicates a test login occurred
    try {
      var isTest =
        typeof sessionStorage !== 'undefined' && sessionStorage.getItem('isTestUser') === '1'
      store.setIsTestUser(isTest && String(user.email).toLowerCase() === 'testing@gmail.com')
    } catch (e) {
      store.setIsTestUser(false)
    }
    // Restore test-user flag: if sessionStorage was set during a previous login
    // AND the current user's email or derived username matches the test account.
    try {
      var sessionFlag =
        typeof sessionStorage !== 'undefined' && sessionStorage.getItem('isTestUser') === '1'
      var emailLower = (user && user.email && String(user.email).toLowerCase()) || ''
      var derivedUsername = emailLower ? emailLower.split('@')[0] : ''
      var isTest =
        sessionFlag && (emailLower === 'testing@gmail.com' || derivedUsername === 'testing')
      // Also set true if the email directly matches (covers fresh login without session flag)
      if (emailLower === 'testing@gmail.com') isTest = true
      store.setIsTestUser(!!isTest)
    } catch (e) {
      store.setIsTestUser(false)
    }
  } else {
    store.setCurrentUser(null)
  }
})()
