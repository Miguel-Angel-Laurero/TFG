import "./assets/main.css";

import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import ToastService from "primevue/toastservice";
import { ConfirmationService } from "primevue"; // v4

import App from "./App.vue";
import router from "./router/router";
import {
  logLocalStorageSize,
  tagLudoKeysWithCurrentUser,
  setCurrentLocalUser,
} from "./utils/localStorageSize";
import { useAuthStore } from "./stores/auth.store";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, { theme: { preset: Aura } });
app.use(ToastService);
app.use(ConfirmationService); // v4

// Mostrar en consola el peso aproximado de localStorage (diagnóstico)
try {
  const auth = useAuthStore();
  // auth.user puede ser un objeto reactivo o null; soportamos ambos casos
  const maybeUser = auth && (auth.user ?? (auth.user && auth.user.value));
  const user =
    maybeUser && (maybeUser.id || maybeUser.username || maybeUser.name)
      ? maybeUser
      : null;

  if (user) {
    try {
      tagLudoKeysWithCurrentUser(user);
    } catch (e) {
      /* noop */
    }
    logLocalStorageSize("localStorage (startup)", user);
  } else {
    logLocalStorageSize("localStorage (startup)");
    // si el usuario se carga más tarde (fetchMe), volvemos a etiquetar
    try {
      watch(
        () => auth.user,
        (v) => {
          if (v) {
            try {
              tagLudoKeysWithCurrentUser(v);
            } catch (e) {
              /* noop */
            }
            logLocalStorageSize("localStorage (user-loaded)", v);
          }
        },
      );
    } catch (e) {
      /* noop */
    }
  }
} catch (e) {
  /* noop */
}

app.mount("#app");
