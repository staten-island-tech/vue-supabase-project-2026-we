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

// After the app is running, load the current user once and save it to the store.
// This is simple and helps the router guard and UI know if someone is logged in.
;(async () => {
  const user = await getCurrentUser().catch(() => null)
  const store = useGameStore()
  if (user) {
    store.setCurrentUser({
      id: user.id ?? null,
      email: user.email ?? null,
      username: user.email ? String(user.email).split('@')[0] : 'Guest',
    })
  } else {
    store.setCurrentUser(null)
  }
})()
