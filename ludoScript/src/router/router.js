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
    {
      path: '/shop-view/',
      name: 'shop',
      component: () => import("../views/ShopView.vue"),
    },
    {
      path: '/in-game-view/',
      name: 'inGame',
      component: () => import("../views/InGameView.vue"),
    }
  ],
})


export default router
