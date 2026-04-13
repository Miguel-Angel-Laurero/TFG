<template>
    <section ref="containerRef"
        class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-2 flex flex-col items-center justify-center gap-3 h-full w-full overflow-hidden"
    >
        <div class="flex gap-3 items-center justify-center shrink-0">
            <SlotColumn :slots="LEFT_SLOTS" :equipped="store.equipped" :selected="store.selectedSlot" :size="slotSize" @pick="store.openPicker"/>
            <AvatarCard :width="cardWidth" :height="cardHeight"/>
            <SlotColumn :slots="RIGHT_SLOTS" :equipped="store.equipped" :selected="store.selectedSlot" :size="slotSize" @pick="store.openPicker"/>
        </div>

        <ItemPicker
            :slot="store.selectedSlot"
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

onMounted(() => store.fetchItems())
</script>