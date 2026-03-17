<template>
    <section class="flex flex-wrap gap-4 p-4">
        <ProductCard 
            v-for="product in products" 
            :key="product.id"
            class="flex flex-col m-2 transition-all duration-300"
            :class="{ 'opacity-50 grayscale pointer-events-none cursor-not-allowed': product.is_adquired }"
        >
            <p class="font-bold">{{ product.name }}</p>
            <div class="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
                <img 
                    :src="product.img" 
                    :alt="product.name" 
                    class="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-300"
                />
            </div>
            <p>{{ product.price }} GB de RAM</p>
            <button 
                class="p-2 rounded-xl transition-colors"
                :class="!product.is_adquired ? 'bg-teal-200 hover:bg-teal-300' : 'bg-gray-300 text-gray-500'"
                :disabled="product.is_adquired"
            >
                {{ !product.is_adquired ? 'Comprar' : 'Adquirido' }}
            </button>
        </ProductCard>
    </section>
</template>
<script setup>
    import ProductCard from './ProductCard.vue';
    const products = [
        { id: "1", name: "icon",img:"", category:"",price:"500",is_adquired:false },
        { id: "2", name: "banner",img:"",category:"",price:"750",is_adquired:true  },
        { id: "3", name: "peluca afro",img:"", category:"headwear",price:"2000",is_adquired:false  },
    ]
</script>