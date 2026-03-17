<template>
    <section class="flex flex-col min-h-[300px] gap-4 p-4">
    <ScrollPanel style="width: 100%; height: 300px">
        <div class="flex flex-wrap gap-4 justify-center">
            <ProductCard 
                v-for="product in displayedProducts" 
                :key="product.id"
                class="flex flex-col m-2 transition-all duration-300"
                :class="{ 'opacity-50 grayscale pointer-events-none cursor-not-allowed': product.is_adquired }"
            >
                <p class="font-bold">{{ product.name }}</p>
                <div class="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
                    <img 
                        :src="product.img" 
                        :alt="product.name" 
                        class="max-w-full max-h-full object-contain"
                    />
                </div>
                <p>{{ product.price }} GB de RAM</p>
                <button 
                    class="p-2 rounded-xl transition-colors hover:cursor-pointer"
                    :class="!product.is_adquired ? 'bg-teal-200 hover:bg-teal-300' : 'bg-gray-300 text-gray-500'"
                    :disabled="product.is_adquired"
                >
                    {{ !product.is_adquired ? 'Comprar' : 'Adquirido' }}
                </button>
            </ProductCard>
        </div>
    </ScrollPanel>
    </section>
    <div>
        <Paginator 
        v-model:first="first" 
        :rows="rows" 
        :totalRecords="filteredProducts.length"
    ></Paginator>
    </div>
</template>
<script setup>
    import ProductCard from './ProductCard.vue'; 
    import Paginator from 'primevue/paginator';
    import ScrollPanel from 'primevue/scrollpanel';
    import { ref, computed, watch } from 'vue';
    import { useShopStore } from '@/stores/shop.store';

    const shopStore = useShopStore();
    const first = ref(0); 
    const rows = ref(10);
    const products = [
        { id: "1", name: "icon",img:"/src/assets/images/icon_01.png", category:"icons",price:"500",is_adquired:false },
        { id: "2", name: "banner",img:"",category:"banners",price:"750",is_adquired:true  },
        { id: "3", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "4", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "5", name: "peluca afro",img:"", category:"icons",price:"2000",is_adquired:false  },
        { id: "6", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "7", name: "casco",img:"", category:"headwear",price:"5000",is_adquired:true  },
        { id: "8", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "9", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "10", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "11", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "12", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "13", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "14", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "15", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "16", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
]
const filteredProducts = computed(() => {
        return products.filter(product => {
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