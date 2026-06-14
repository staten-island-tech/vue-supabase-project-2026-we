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
  } else {
    store.setCurrentUser(null)
  }
})()
