import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level from '@/views/level.vue'
import login from '@/views/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: login,
    },
    {
      path: '/menu',
      name: 'home',
      component: home,
    },
    {
      path: '/level/:id',
      name: 'level',
      component: level,
    },
  ],
})

export default router