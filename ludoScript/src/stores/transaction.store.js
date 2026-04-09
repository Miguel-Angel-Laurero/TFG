import { defineStore } from "pinia";
import { useAuthStore } from "./auth.store";

export const useTransactionStore = defineStore('transaction', {
    state: () => {
        const auth = useAuthStore();
        return {
            coins: auth.userData?.coins ?? 0,
            items: []
        }
    },
    actions: {
        //Recalcula el dinero restante del usuario
        recalculateUserCoins(amount) {
            this.coins -= amount
        },
        //Añade a la tabla de objetos del usaurio en cuestion el objeto comprado
        addToUserInventory(item) {
            this.items.push(item)
        }
    }
})