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
            :src="item.equipped_img"
            :alt="item.name"
            class="absolute max-w-full max-h-full object-contain block mx-auto"
        />
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { IMAGES } from '@/utils/imgBucketStorage'
import { useEquipmentStore } from '@/stores/equipment.store'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const store = useEquipmentStore()

const equippedItems = computed(() =>
  Object.fromEntries(
    Object.entries(store.getEquippedByUser(props.userId)).filter(([, item]) => item !== null)
  )
)

onMounted(async () => {
  try {
    await store.fetchItemsForUser(props.userId)
  } catch (error) {
    console.error("Error cargando inventario:", error)
  }
})
</script>