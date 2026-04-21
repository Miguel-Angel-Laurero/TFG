<template>
    <div class="relative w-full h-full flex items-center justify-center">
        <!-- Imagen base del personaje -->
        <img
            :src="IMAGES.pj"
            alt="plantilla-pj"
            class="max-w-full max-h-full object-contain block mx-auto"
        />
        <!-- Spinner mientras carga -->
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
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
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
    // Opcional: si no se pasa, usa el usuario propio
    userId: {
        type: [String, Number],
        default: null,
    }
})

const store = useEquipmentStore()
const authStore = useAuthStore()

// Resuelve qué userId usar: el prop o el del usuario logueado
const resolvedId = computed(() =>
    props.userId != null ? String(props.userId) : String(authStore.user?.id ?? '')
)

const isLoading = computed(() =>
    store.loadingByUser[resolvedId.value] ?? false
)

const equippedItems = computed(() =>
    store.getEquippedByUser(resolvedId.value)
)

onMounted(async () => {
    if (!resolvedId.value) return
    try {
        await store.fetchItemsForUser(resolvedId.value)
    } catch (error) {
        console.error("Error cargando inventario:", error)
    }
})
</script>