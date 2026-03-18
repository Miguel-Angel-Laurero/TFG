<template>
    <div class="h-full flex flex-col">
        <div class="w-full bg-gray-200 shrink-0">
            <!-- <span class="flex justify-center text-4xl font-bold">Tienda</span> -->
            <ShopMenu class="flex justify-between"/>
        </div>
        <div class="flex-1 h-full ">
            <ProductGrid/>
        </div>
    </div>
</template>
<script setup>
    import ProductGrid from './ProductGrid.vue';
    import ShopMenu from './ShopMenu.vue';
</script>