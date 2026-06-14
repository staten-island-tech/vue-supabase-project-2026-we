import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level from '@/views/level.vue'
import login from '@/views/login.vue'
import { getCurrentUser } from '@/lib/supabase'
var routes = [
  { path: '/', name: 'login', component: login },
  { path: '/menu', name: 'home', component: home, meta: { requiresAuth: true } },
  { path: '/level/:id', name: 'level', component: level, meta: { requiresAuth: true } },
]

var router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

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
