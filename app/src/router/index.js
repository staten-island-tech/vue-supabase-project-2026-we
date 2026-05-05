import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level from '@/views/level.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home,
    },
    {
      path: '/level',
      name: 'level',
      component: level,
    }
  ],
})

export default router
