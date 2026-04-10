import { useTransactionStore } from '@/stores/transaction.store'
import api from '@/api/axios'

export function useTransaction() {
  const transactionStore = useTransactionStore()

  async function buyItem(product) {
    const { data } = await api.post(`/shop/buy/${product.id}`)
    transactionStore.recalculateUserCoins(product.price)
    product.is_adquired = true
    return data
  }

  return { buyItem }
}