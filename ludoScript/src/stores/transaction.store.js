import { defineStore } from "pinia";

export const useTransactionStore = defineStore('user', {
    state: () => ({
        coins: 500.00,
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