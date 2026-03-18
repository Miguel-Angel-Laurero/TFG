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
        { id: "1", name: "Icono Laptop",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_portatil.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9wb3J0YXRpbC5wbmciLCJpYXQiOjE3NzM4MjMzMTIsImV4cCI6MTgwNTM1OTMxMn0.i5SQ_TIqsh48uK4PIXKNrIUnlOIkOVnPWI5Vd9KHSdU", category:"icons",price:"500",is_adquired:false },
        { id: "2", name: "Banner Cielo",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_rainbow.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfcmFpbmJvdy5wbmciLCJpYXQiOjE3NzM4Mjg4NTYsImV4cCI6MTgwNTM2NDg1Nn0.emQWCZJn2ml5Pt7PPh8iol3xkPUy9atDEoGAFa7YIwg",category:"banners",price:"1050",is_adquired:true  },
        { id: "3", name: "Peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
        { id: "4", name: "Icono Cohete",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_cohete.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9jb2hldGUucG5nIiwiaWF0IjoxNzczODIzMjkxLCJleHAiOjE4MDUzNTkyOTF9.V2dvmmoHC0GTVRnJ9BHpleph-7Fg4kjTMFwnsR1NJ2k", category:"icons",price:"500",is_adquired:false  },
        { id: "5", name: "Icono Cerebrito",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_cerebrito.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9jZXJlYnJpdG8ucG5nIiwiaWF0IjoxNzczODIzMjQ4LCJleHAiOjE4MDUzNTkyNDh9.sAwg_zRstR62z-Oi84C89KA2e2Azrsysl1iUEz4gbh4", category:"icons",price:"500",is_adquired:false  },
        { id: "6", name: "Icono Engranaje",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_engranaje.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9lbmdyYW5hamUucG5nIiwiaWF0IjoxNzczODI0NzE1LCJleHAiOjE4MDUzNjA3MTV9.sVyYIkaCGyQYFWt8vEV41-zSdXC95YcPVyufOS2pMMY", category:"icons",price:"500",is_adquired:false  },
        { id: "7", name: "casco",img:"", category:"headwear",price:"5000",is_adquired:true  },
        { id: "8", name: "Icono Desarrollo",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_ide.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9pZGUucG5nIiwiaWF0IjoxNzczODI0NzY0LCJleHAiOjE4MDUzNjA3NjR9.dmr9j2Z_NsEvDWoWd6c1-4i1HWDZwB1FxgRxEOiL9eo", category:"icons",price:"500",is_adquired:false  },
        { id: "9", name: "Icono Etiqueta",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/icons/icon_etiqueta.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvaWNvbnMvaWNvbl9ldGlxdWV0YS5wbmciLCJpYXQiOjE3NzM4MjQ3ODksImV4cCI6MTgwNTM2MDc4OX0.k7cPbF5elz7wmp0l7eZQub228fBuCZHkSa65OQJl83o", category:"icons",price:"500",is_adquired:false  },
        { id: "10", name: "Banner Sakura",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_sakura.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfc2FrdXJhLnBuZyIsImlhdCI6MTc3MzgzMTIwOSwiZXhwIjoxODA1MzY3MjA5fQ.VnteBl7NnfctkfxxxSF2_AXV1LoGC6sBBZF2FGRohLM", category:"banners",price:"1200",is_adquired:false  },
        { id: "11", name: "Banner Playa",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_playa.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfcGxheWEucG5nIiwiaWF0IjoxNzczODMxMTk0LCJleHAiOjE4MDUzNjcxOTR9.HCuJlVTS8k6grrH05qZh1jqsHq47jzdXN_-0ivAogGQ", category:"banners",price:"1050",is_adquired:false  },
        { id: "12", name: "Banner Tecno",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_tecno.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfdGVjbm8ucG5nIiwiaWF0IjoxNzczODMxMjIzLCJleHAiOjE4MDUzNjcyMjN9.GnhUIqYbhI3hQ1MC9RkV-Ozo5o5JEEkJcyA2YBaAGaQ", category:"banners",price:"2000",is_adquired:false  },
        { id: "13", name: "Banner Nieve",img:"https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/items/banners/banner_nieve.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaXRlbXMvYmFubmVycy9iYW5uZXJfbmlldmUucG5nIiwiaWF0IjoxNzczODMxNTk3LCJleHAiOjE4MDUzNjc1OTd9.MEb2p_iyQ3brGcrF0BDTyz4nUt3Ct1u5cjSNbEerUAo", category:"banners",price:"1050",is_adquired:false  },
        { id: "14", name: "Camisa azul",img:"", category:"upperbody",price:"2000",is_adquired:false  },
        { id: "15", name: "Pantalon Corto",img:"", category:"lowerbody",price:"2000",is_adquired:false  },
        { id: "16", name: "Guantes de Boxeo",img:"", category:"hands",price:"1500",is_adquired:false  },
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