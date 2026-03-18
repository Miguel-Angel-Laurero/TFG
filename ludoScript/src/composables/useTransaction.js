import { ref } from 'vue'
import { useTransactionStore } from '@/stores/transaction.store'

export function useTransaction() {
    const transactionStore = useTransactionStore()
    const cargando = ref(false)
    const error = ref(null)

    async function buyItem(item) {
        error.value = null
        if (transactionStore.coins < item.price) {
            error.value = "No dispone de suficiente RAM para adquirir el producto."
            return false;
        }
        try {
            cargando.value = true
            //Llamamos a la api
            const res = await fetch('/api/compras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({itemID: item.id})
            })
            //Si la peticion falla
            if (!res.ok) throw new Error('Error al procesar la compra')
            
            //Tras recibir los datos realizamos las opreaciones necesarias para la compra
            transactionStore.recalculateUserCoins(item.price)
            transactionStore.addToUserInventory(item)
            
            return true

        } catch(e) {
            error.value = e.message
            return false
        } finally {
            cargando.value = false
        }
    }

    return { buyItem, cargando, error }
}