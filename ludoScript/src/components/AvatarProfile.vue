<template>
    <section class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 h-full flex items-center justify-center">
        <div class="flex gap-4 items-center justify-center">
            <!-- Columna izquierda: 3 cards -->
            <div class="flex flex-col gap-4">
                <Card v-for="item in leftItems" :key="item.id" class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl text-lg p-2 !text-gray-50 w-36 h-36">
                    <template #content>
                        <div class="flex items-center justify-center h-full">
                            <img src="" :alt="'Imagen de '+item.nombre">
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Card principal (centro) -->
            <Card class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl text-2xl p-4 !text-gray-50 w-80 h-96">
                <template #content>
                    <div class="flex items-center justify-center h-full">
                        <img src="" :alt="'Imagen de '+mainItem.nombre">
                    </div>
                </template>
            </Card>

            <!-- Columna derecha: 3 cards -->
            <div class="flex flex-col gap-4">
                <Card v-for="item in rightItems" :key="item.id" class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl text-lg p-2 !text-gray-50 w-36 h-36">
                    <template #content>
                        <div class="flex items-center justify-center h-full">
                            <img src="" :alt="'Imagen de '+item.nombre">
                        </div>
                    </template>
                </Card>
            </div>
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