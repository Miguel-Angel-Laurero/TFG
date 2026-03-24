<template>
  <div class="flex flex-col h-full overflow-hidden">
    
    <section class="flex-1 overflow-hidden p-4">
      <ScrollPanel style="height: calc(100vh - 10rem)">
        <div class="flex flex-wrap gap-4 justify-center">
          <ProductCard 
            v-for="product in displayedProducts" 
            :key="product.id"
            class="flex flex-col m-2 transition-all duration-300"
            :class="{ 'opacity-50 grayscale pointer-events-none cursor-not-allowed': product.is_adquired }"
          >
            <p class="font-bold">{{ product.name }}</p>
            <div class="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
              <img :src="product.img" :alt="product.name" class="max-w-full max-h-full object-contain"/>
            </div>
            <p class="flex items-center gap-2">
              {{ product.price }}
              <img 
                src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
                alt="Moneda de RAM"
                class="w-6 h-6 object-contain" 
              >
            </p>
            <button 
              class="p-2 rounded-xl transition-colors hover:cursor-pointer"
              :class="!product.is_adquired ? 'bg-teal-200 hover:bg-teal-300' : 'bg-gray-300 text-gray-500'"
              :disabled="product.is_adquired"
              @click="buyItem(product)"
            >
              {{ !product.is_adquired ? 'Comprar' : 'Adquirido' }}
            </button>
          </ProductCard>
        </div>
      </ScrollPanel>
    </section>

    <!-- Paginator anclado abajo, fuera del scroll -->
    <div class="shrink-0 border-t border-gray-200 bg-white">
      <Paginator 
        v-model:first="first" 
        :rows="rows" 
        :columns="columns"
        :totalRecords="filteredProducts.length"
      />
    </div>

  </div>
</template>
<script setup>
    import ProductCard from './ProductCard.vue'; 
    import Paginator from 'primevue/paginator';
    import ScrollPanel from 'primevue/scrollpanel';
    import { ref, computed, watch, onMounted } from 'vue';
    import { useShopStore } from '@/stores/shop.store';
    import { useTransaction } from '@/composables/useTransaction';

    const { buyItem } = useTransaction();
    const shopStore = useShopStore();
    const first = ref(0); 
    const rows = ref(12);
    const products = ref([])
    const loading = ref(true)
    onMounted(async () => {
        try {
          const response = await fetch('/itemData.json')
          products.value = await response.json()
        } catch {
          console.error("Error al cargar los datos",error)
        } finally {
          loading.value = false;
        }
      })
    const filteredProducts = computed(() => {
        return products.value.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(shopStore.searchQuery?.toLowerCase() || '');
            const matchesCategory = shopStore.selectedCategories.length === 0 || 
                                    shopStore.selectedCategories.some(cat => cat.name === product.category);
            return matchesSearch && matchesCategory;
        });
    });

    // Luego aplicamos la paginación sobre los productos ya filtrados
    const displayedProducts = computed(() => {
        return filteredProducts.value.slice(first.value, first.value + rows.value);
    });
    watch([() => shopStore.searchQuery, () => shopStore.selectedCategories], () => {
        first.value = 0;
    });
</script>