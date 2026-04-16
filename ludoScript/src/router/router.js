import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login-view/",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register-view/",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/profile-view/",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/edit-profile-view/",
      name: "editProfile",
      component: () => import("../views/EditProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/shop-view/",
      name: "shop",
      component: () => import("../views/ShopView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/in-game-view/",
      name: "inGame",
      component: () => import("../views/InGameView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/category-review/",
      name: "categoryReview",
      component: () => import("../views/CategoryReviewView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/multiplayer/",
      name: "multiplayer",
      component: () => import("../views/MultiplayerView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/clase/",
      name: "clase",
      component: () => import("../views/ClaseView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/duel-view/",
      name: "duel",
      component: () => import("../views/DuelView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/spectate/:code",
      name: "spectate",
      component: () => import("../views/SpectatorView.vue"),
      // Sin requiresAuth: acceso público para espectadores sin cuenta
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem("token")) {
    return { name: "home" };
  }
});

export default router;
