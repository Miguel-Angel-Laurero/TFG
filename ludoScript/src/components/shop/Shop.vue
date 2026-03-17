<template>
    <section class="w-full bg-gray-200">
        <!-- <span class="flex justify-center text-4xl font-bold">Tienda</span> -->
        <ShopMenu class="flex justify-between"/>
    </section>
    <section>
        <ProductGrid/>
    </section>
</template>
<script setup>
    import ProductGrid from './ProductGrid.vue';
    import ShopMenu from './ShopMenu.vue';
</script>