import { createRouter, createWebHistory } from 'vue-router'
import home from '@/views/home.vue'
import level1 from '@/views/level1.vue'
import level2 from '@/views/level2.vue'
import level3 from '@/views/level3.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home
    },
    {
      path: '/level1',
      name: 'level1',
      component: level1
    },
    {
      path: '/level2',
      name: 'level2',
      component: level2
    },
    {
      path: '/level3',
      name: 'level3',
      component: level3
    },
  ],
})

export default router