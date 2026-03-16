<template>
    <section class="flex">
        <ProductCard v-for="product in products" class="flex flex-col m-2">
            <p>{{ product.name }}</p>
            <div class="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
                <img 
                    :src="product.img" 
                    :alt="product.name" 
                    class="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-300"
                />
            </div>
            <p>{{ product.price }} GB de RAM</p>
            <button class="bg-teal-200 p-2 rounded-xl">Comprar</button>
        </ProductCard>
    </section>
</template>
<script setup>
    import ProductCard from './ProductCard.vue';

    const products = [
        { id: "1", name: "icon",img:"", category:"",price:"500" },
        { id: "2", name: "banner",img:"",category:"",price:"750" },
        { id: "3", name: "peluca afro",img:"", category:"headwear",price:"2000" },
    ]
</script>