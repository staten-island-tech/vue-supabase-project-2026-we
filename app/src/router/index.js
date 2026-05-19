import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level from '@/views/level.vue'
import login from '@/views/login.vue'
import controls from '@/components/controls.vue'

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
      path: '/level',
      name: 'level',
      component: level,
    },
    {
      path: '/test',
      name: 'test',
      component: controls,
    },
  ],
})

export default router
