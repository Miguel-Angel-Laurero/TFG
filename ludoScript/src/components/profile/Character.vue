<template>
    <div class="relative w-full h-full flex items-center justify-center">
        <!-- Imagen base del personaje -->
        <img
            :src="IMAGES.pj"
            alt="plantilla-pj"
            class="max-w-full max-h-full object-contain block mx-auto"
        />
        <!-- Una imagen por cada slot equipado, superpuesta absolutamente -->
        <img
            v-for="(item, slot) in equippedItems"
            :key="slot"
            :src="item.img"
            :alt="item.name"
            class="absolute inset-0 max-w-full max-h-full object-contain block mx-auto"
        />
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { IMAGES } from '@/utils/imgBucketStorage'
import { useEquipmentStore } from '@/stores/equipment.store'

const store = useEquipmentStore()

// Solo los slots que tienen un item equipado (no null)
const equippedItems = computed(() =>
    Object.fromEntries(
        Object.entries(store.equipped).filter(([, item]) => item !== null)
    )
)

onMounted(async () => {
    try {
        await store.fetchItems()
    } catch (error) {
        console.error("Error cargando inventario al recargar:", error)
    }
})
</script>