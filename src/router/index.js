import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Layout/TodoLayout.vue'
import ConfigIndex from '@/views/Config/Index.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/config',
      name: 'Config',
      component: ConfigIndex,
    },
  ],
})

export default router
