import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: '/login-view/',
      name: 'login',
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: '/profile-view/',
      name: 'profile',
      component: () => import("../views/ProfileView.vue"),
    },
  ],
})


export default router
