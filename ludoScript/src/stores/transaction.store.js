import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useAuthStore } from "./auth.store";

export const useTransactionStore = defineStore("transaction", () => {
  const auth = useAuthStore();
  const items = ref([]);

  // La tienda siempre lee el saldo vivo del usuario autenticado.
  // Asi evitamos fallos al entrar en frio cuando userData todavia no ha llegado.
  const coins = computed(() => auth.userData?.coins ?? 0);

  function recalculateUserCoins(amount) {
    if (!auth.userData) return;
    auth.userData.coins = Math.max((auth.userData.coins ?? 0) - amount, 0);
  }

  function addToUserInventory(item) {
    items.value.push(item);
  }

  return { coins, items, recalculateUserCoins, addToUserInventory };
});
