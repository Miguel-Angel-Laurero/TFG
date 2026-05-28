<template>
  <div class="flex flex-col h-full overflow-hidden">
    <ConfirmBuyModal
      :visible="confirmVisible"
      :product="pendingProduct"
      @confirm="confirmBuy"
      @cancel="confirmVisible = false"
    />

    <section class="flex-1 overflow-hidden p-4">
      <ScrollPanel style="height: calc(100vh - 13rem)">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-2">
          <ProductCard
            v-for="product in displayedProducts"
            :key="product.id"
            class="flex flex-col transition-all duration-300"
            :class="{ 'opacity-50 grayscale pointer-events-none cursor-not-allowed': product.is_adquired }"
          >
            <p class="font-bold text-xs sm:text-sm text-center truncate px-1">
              {{ product.name }}
            </p>

            <div class="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1 sm:p-2">
              <img
                :src="product.img"
                :alt="product.name"
                class="max-w-full max-h-full object-contain"
              >
            </div>

            <p class="flex items-center justify-center gap-1 text-xs sm:text-sm py-1">
              {{ product.price }}
              <img
                :src="IMAGES.coin"
                alt="Moneda de RAM"
                class="w-4 h-4 sm:w-5 sm:h-5 object-contain"
              >
            </p>

            <button
              class="w-full py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl transition-colors hover:cursor-pointer"
              :class="!product.is_adquired ? 'bg-teal-200 hover:bg-teal-300' : 'bg-gray-300 text-gray-500'"
              :disabled="product.is_adquired"
              @click="openConfirm(product)"
            >
              {{ !product.is_adquired ? 'Comprar' : 'Adquirido' }}
            </button>
          </ProductCard>
        </div>
      </ScrollPanel>
    </section>

    <div class="shrink-0 border-t border-gray-200 bg-white">
      <Paginator
        v-model:first="first"
        :rows="rows"
        :total-records="filteredProducts.length"
      />
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue';
import ConfirmBuyModal from './ConfirmBuyModal.vue';
import Paginator from 'primevue/paginator';
import ScrollPanel from 'primevue/scrollpanel';
import { ref, computed, watch, onMounted } from 'vue';
import { useShopStore } from '@/stores/shop.store';
import { useTransaction } from '@/composables/useTransaction';
import api from '@/api/axios';
import { IMAGES } from '@/utils/imgBucketStorage';

const { buyItem } = useTransaction();
const shopStore = useShopStore();
const first = ref(0);
const rows = ref(20);
const products = ref([]);
const loading = ref(true);

// ─── Confirmación ─────────────────────────────────────────────────────────────
const confirmVisible = ref(false);
const pendingProduct = ref(null);

function openConfirm(product) {
  pendingProduct.value = product;
  confirmVisible.value = true;
}

async function confirmBuy() {
  confirmVisible.value = false;
  await buyItem(pendingProduct.value);
  pendingProduct.value = null;
}

// ─── Carga ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get('/shop');
    products.value = data;
  } catch (err) {
    console.error('Error al cargar los items de la tienda', err.response);
  } finally {
    loading.value = false;
  }
});

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(shopStore.searchQuery?.toLowerCase() || '');
    const matchesCategory = shopStore.selectedCategories.length === 0 ||
      shopStore.selectedCategories.some(cat => Number(cat.id) === Number(product.type_id));

    console.log({
  productCategory: product.category,
  productCategoryType: typeof product.category,
  selectedCategories: shopStore.selectedCategories,
  firstCatName: shopStore.selectedCategories[0]?.name,
});
    const matchesAcquisition =
      shopStore.acquisitionFilter === 'todos' ||
      (shopStore.acquisitionFilter === 'adquirido' && product.is_adquired) ||
      (shopStore.acquisitionFilter === 'no_adquirido' && !product.is_adquired);
    return matchesSearch && matchesCategory && matchesAcquisition;
  });
});

const displayedProducts = computed(() => {
  return filteredProducts.value.slice(first.value, first.value + rows.value);
});

watch([() => shopStore.searchQuery, () => shopStore.selectedCategories, () => shopStore.acquisitionFilter], () => {
  first.value = 0;
});
</script>