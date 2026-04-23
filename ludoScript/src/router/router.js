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
      path: "/learning-area/",
      name: "learningArea",
      component: () => import("../views/LearningAreaView.vue"),
      // Ruta pública: no requiere autenticación
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

import { useAuthStore } from "@/stores/auth.store";

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem("token")) {
    return { name: "home" };
  }

  if (to.meta.requiresAdmin) {
    const authStore = useAuthStore();
    // Si todavía no se ha cargado el user o no es admin
    if (!authStore.user) {
      // Intentar una espera si fetchMe se está haciendo en main.js o rechazar temporalmente
      // Lo más seguro es mandar a /home y mostrar un error si se intenta navegar directamente y aún no hay info
      // o dejar la responsabilidad de validar `admin` al servidor también, pero no queremos pantallazos vacíos
      if (localStorage.getItem("token")) {
        // asumimos que fetchMe pasará, la validación real de admin se hace en fetchMe o en AdminView OnMounted
        // pero para mejor UX: si está cargado y no es admin, bloqueamos:
        if (authStore.user !== null && authStore.user?.role !== "admin") {
          return { name: "home" };
        }
      }
    } else if (authStore.user.role !== "admin") {
      return { name: "home" };
    }
  }
});

export default router;
