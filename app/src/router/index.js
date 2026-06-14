import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level from '@/views/level.vue'
import login from '@/views/login.vue'
import { getCurrentUser } from '@/lib/supabase' // simple helper that returns user or null

// Simple routes. Use meta.requiresAuth = true for pages that need login.
var routes = [
  { path: '/', name: 'login', component: login },
  { path: '/menu', name: 'home', component: home, meta: { requiresAuth: true } },
  { path: '/level/:id', name: 'level', component: level, meta: { requiresAuth: true } },
]

var router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// Small global guard: when route requires auth, check current user and redirect to login when missing.
router.beforeEach(async function (to) {
  if (!to.meta || !to.meta.requiresAuth) return true

  var user = null
  try {
    user = await getCurrentUser()
  } catch (e) {
    user = null
  }

  if (user) return true
  return { name: 'login' }
})

export default router
