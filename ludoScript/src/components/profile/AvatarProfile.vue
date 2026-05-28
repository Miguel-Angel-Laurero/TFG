<template>
  <section
    ref="containerRef"
    class="backdrop-blur-sm rounded-lg shadow-2xl p-2 flex flex-col items-center justify-center gap-3 h-full w-full overflow-hidden"
  >
    <div class="flex gap-2 sm:gap-4 items-center justify-center w-full max-w-2xl mx-auto p-2">
      <SlotColumn 
        class="flex-1 max-w-[64px] sm:max-w-[80px]"
        :slots="LEFT_SLOTS" 
        :equipped="store.equipped" 
        :selected="store.selectedSlot" 
        @pick="store.openPicker"
      />

      <AvatarCard class="flex-2 max-w-50 sm:max-w-70" />

      <SlotColumn 
        class="flex-1 max-w-[64px] sm:max-w-[80px]"
        :slots="RIGHT_SLOTS" 
        :equipped="store.equipped" 
        :selected="store.selectedSlot" 
        @pick="store.openPicker"
      />
    </div>

    <ItemPicker
      :slot-id="store.selectedSlot"
      :open="!!store.selectedSlot"
      :equipped="store.equipped"
      :item-pool="store.itemPool"
      :slot-names="SLOT_NAMES"
      @close="store.openPicker(null)"
      @select="store.selectItem" 
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAvatarSize } from '@/composables/useAvatarSize'
import SlotColumn from './SlotColumn.vue'
import AvatarCard from './AvatarCard.vue'
import ItemPicker from './ItemPicker.vue'
import { useEquipmentStore, LEFT_SLOTS, RIGHT_SLOTS, SLOT_NAMES } from '@/stores/equipment.store'

// Esta es la única definición que necesitas
const store = useEquipmentStore() 
const containerRef = ref(null)

const { slotSize, cardWidth, cardHeight } = useAvatarSize(containerRef, {
    head:     { w: 400,  h: 230 },
    torso:    { w: 240,  h: 90  },
    trinkets: { w: 160,  h: 80  },
    hands:    { w: 60,   h: 60  },
    legs:     { w: 230,  h: 80  },
    feet:     { w: 70,   h: 60  },
})

onMounted(async () => {
    // Si la página se recarga, el store se vacía. 
    // Llamamos a fetch siempre para asegurar que la data esté fresca.
    try {
        await store.fetchItems()
    } catch (error) {
        console.error("Error cargando inventario al recargar:", error)
    }
})
</script>