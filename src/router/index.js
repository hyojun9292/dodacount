import { createRouter, createWebHistory } from 'vue-router'
import DodaCount from '../views/DodoCount.vue'

const routes = [
  {
    path: '/',
    name: 'DodaCount',
    component: DodaCount
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
