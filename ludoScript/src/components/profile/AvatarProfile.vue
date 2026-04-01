<template>
    <section ref="containerRef"
        class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-2 flex flex-col items-center justify-center gap-3 h-full w-full overflow-hidden"
    >
        <div class="flex gap-3 items-center justify-center shrink-0">
            <SlotColumn :slots="LEFT_SLOTS"  :equipped="equipped" :selected="selectedSlot" :size="slotSize" @pick="openPicker"/>
            <AvatarCard :slots="CENTRAL_SLOTS" :equipped="equipped" :positions="centralSlotStyles"
                        :width="cardWidth" :height="cardHeight" :slotSize="centralSlotSize"/>
            <SlotColumn :slots="RIGHT_SLOTS" :equipped="equipped" :selected="selectedSlot" :size="slotSize" @pick="openPicker"/>
        </div>

        <ItemPicker
            :slot="selectedSlot"
            :equipped="equipped"
            :itemPool="itemPool"
            :slotNames="SLOT_NAMES"
            @close="selectedSlot = null"
            @select="selectItem"
        />
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAvatarSize } from '@/composables/useAvatarSize'
import { useEquipment, LEFT_SLOTS, RIGHT_SLOTS, CENTRAL_SLOTS, SLOT_NAMES } from '@/composables/useEquipment'
import SlotColumn from './SlotColumn.vue'
import AvatarCard from './AvatarCard.vue'
import ItemPicker from './ItemPicker.vue'

const containerRef = ref(null)

const { slotSize, cardWidth, cardHeight, centralSlotSize, centralSlotStyles } = useAvatarSize(containerRef, {
    head:     { w: 400,  h: 220  },
    torso:    { w: 240, h: 100 },
    trinkets: { w: 60,  h: 60  },
    hands:    { w: 60,  h: 60  },
    legs:     { w: 230,  h: 80  },
    feet:     { w: 70,  h: 60  },
})

const { equipped, selectedSlot, itemPool, loading, fetchItems, openPicker, selectItem } = useEquipment()

onMounted(() => fetchItems())
</script>