import { defineStore } from "pinia";
import { useAuthStore } from "./auth.store";

const auth = useAuthStore();

export const useTransactionStore = defineStore('user', {
    state: () => ({
        coins: auth.userData.coins,
        items: []
    }),
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