<template>
    <section class="p-4 flex gap-4 justify-center">
        <!-- Columna izquierda: 3 cards -->
        <div class="flex flex-col gap-4">
            <Card v-for="item in leftItems" :key="item.id" class="border-4 !bg-gray-100 !rounded-xl text-lg p-2 text-primary w-36  h-36">
                <template #title>{{item.nombre}}</template>
                <template #content>
                    <img src="" :alt="'Imagen de '+item.nombre">
                    <p class="m-0">Precio: {{item.precio}}</p>
                </template>
            </Card>
        </div>

        <!-- Card principal (centro) -->
        <Card class="border-4 !bg-gray-100 !rounded-xl text-2xl p-4 text-primary w-96">
            <template #title>{{mainItem.nombre}}</template>
            <template #content>
                <img src="" :alt="'Imagen de '+mainItem.nombre" class="flex item-center">
            </template>
        </Card>

        <!-- Columna derecha: 3 cards -->
        <div class="flex flex-col gap-4">
            <Card v-for="item in rightItems" :key="item.id" class="border-4 !bg-gray-100 !rounded-xl text-lg p-2 text-primary w-36 h-36">
                <template #title>{{item.nombre}}</template>
                <template #content>
                    <img src="" :alt="'Imagen de '+item.nombre">
                    <p class="m-0">Precio: {{item.precio}}</p>
                </template>
            </Card>
        </div>
    </section>
</template>
<script setup>
    import { ref } from 'vue';
    import Card from 'primevue/card';

    const leftItems = ref([
        {id:'1', nombre:'pantalon', precio: 37},
        {id:'2', nombre:'gafas', precio: 14},
        {id:'3', nombre:'camisa', precio: 25},
    ]);

    const mainItem = ref({id:'main', nombre:'Avatar Principal', precio: 100});

    const rightItems = ref([
        {id:'4', nombre:'peluca afro', precio: 14},
        {id:'5', nombre:'zapatos', precio: 45},
        {id:'6', nombre:'sombrero', precio: 20},
    ]);
</script>