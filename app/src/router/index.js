import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level from '@/views/level.vue'
import login from '@/views/login.vue'
import { getCurrentUser } from '@/lib/supabase' // simple helper that returns user or null

// Simple routes. Use meta.requiresAuth = true for pages that need login.
const routes = [
  { path: '/', name: 'login', component: login },
  { path: '/menu', name: 'home', component: home, meta: { requiresAuth: true } },
  { path: '/level/:id', name: 'level', component: level, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Very small global guard:
// - If route doesn't need auth, allow.
// - If it does, check getCurrentUser() and redirect to login if null.
router.beforeEach(async (to) => {
  if (!to.meta?.requiresAuth) return true

  // getCurrentUser() is already defined in src/lib/supabase.js and returns user or null
  const user = await getCurrentUser().catch(() => null)
  if (user) return true

  return { name: 'login' }
})

export default router
