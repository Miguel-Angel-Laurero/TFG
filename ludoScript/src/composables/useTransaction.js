import { useTransactionStore } from '@/stores/transaction.store'
import api from '@/api/axios'
import { useToast } from 'primevue/usetoast'

export function useTransaction() {
  const transactionStore = useTransactionStore()
  const toast = useToast()

  async function buyItem(product) {
    try {
      const { data } = await api.post(`/shop/buy/${product.id}`)

      // Actualizar coins en el store
      transactionStore.recalculateUserCoins(product.price)

      // Marcar el producto como adquirido localmente (reactivo)
      product.is_adquired = true

      toast.add({
        severity: 'success',
        summary: '¡Compra realizada!',
        detail: `Has comprado ${product.name}. Te quedan ${data.remainingCoins} monedas.`,
        life: 3000,
      })
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error al procesar la compra'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: msg,
        life: 3000,
      })
    }
  }

  return { buyItem }
}