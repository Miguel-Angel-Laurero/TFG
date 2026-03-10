import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home-view/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/profile-view/',
      name: 'profile',
      component: ProfileView,
    },
  ],
})

export default router
