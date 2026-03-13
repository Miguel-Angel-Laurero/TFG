<template>
    <section class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 h-full flex flex-col items-center justify-center gap-4">

        <div class="flex gap-4 items-center justify-center">

            <!-- Columna izquierda: slots cabeza, torso, manos -->
            <div class="flex flex-col gap-3">
                <div v-for="slot in leftSlots" :key="slot.id"
                     class="border-2 rounded-xl w-24 h-24 flex flex-col items-center justify-center cursor-pointer transition-colors"
                     :class="selectedSlot === slot.id
                        ? 'border-indigo-400 bg-indigo-900/60'
                        : 'border-white/30 bg-indigo-950/40 hover:border-white/60'"
                     @click="openPicker(slot.id)">
                    <img v-if="equipped[slot.id]" :src="equipped[slot.id].img" class="w-20 h-20 object-contain">
                    <template v-else>
                        <div class="w-10 h-10 border border-dashed border-white/20 rounded-lg mb-1"></div>
                        <span class="text-white/30 text-xs">{{ slot.nombre }}</span>
                    </template>
                </div>
            </div>

            <!-- Card principal (centro): avatar con items equipados -->
            <Card class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl !text-gray-50 w-96 h-100">
                <template #content>
                    <div class="relative w-full h-full">
                        <div v-for="slot in centralSlots" :key="slot.id" :class="['slot-container border border-gray-50/20  w-20 h-20 rounded-xl', slotPositions[slot.id]]">
                            <transition name="equip">
                                <img v-if="equipped[slot.id]" :key="equipped[slot.id]?.id" :src="equipped[slot.id]?.img" class="equipped-img">
                            </transition>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Columna derecha: slots piernas, pies -->
            <div class="flex flex-col gap-3">
                <div v-for="slot in rightSlots" :key="slot.id"
                     class="border-2 rounded-xl w-24 h-24 flex flex-col items-center justify-center cursor-pointer transition-colors"
                     :class="selectedSlot === slot.id
                        ? 'border-indigo-400 bg-indigo-900/60'
                        : 'border-white/30 bg-indigo-950/40 hover:border-white/60'"
                     @click="openPicker(slot.id)">
                    <img v-if="equipped[slot.id]" :src="equipped[slot.id].img" class="w-14 h-14 object-contain">
                    <template v-else>
                        <div class="w-10 h-10 border border-dashed border-white/20 rounded-lg mb-1"></div>
                        <span class="text-white/30 text-xs">{{ slot.nombre }}</span>
                    </template>
                </div>
            </div>
        </div>

        <!-- Panel de selección de items -->
        <transition name="slide-up">
            <div v-if="selectedSlot" class="w-full bg-slate-700/80 rounded-xl p-4 border border-white/10">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-white font-semibold text-sm">Elige {{ slotNames[selectedSlot] }}</span>
                    <button class="text-white/40 hover:text-white text-xs transition-colors" @click="selectedSlot = null">✕ cerrar</button>
                </div>
                <div class="flex gap-3 flex-wrap">
                    <div v-for="item in itemPool[selectedSlot]" :key="item.id"
                         class="flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg border transition-colors w-20"
                         :class="equipped[selectedSlot]?.id === item.id
                            ? 'border-indigo-400 bg-indigo-900/60'
                            : 'border-white/20 hover:border-white/50'"
                         @click="selectItem(item)">
                        <img :src="item.img" :alt="item.nombre" class="w-10 h-10 object-contain">
                        <span class="text-white/70 text-xs text-center leading-tight">{{ item.nombre }}</span>
                    </div>
                </div>
            </div>
        </transition>

    </section>
</template>
<script setup>
import { reactive, ref } from 'vue'
import Card from 'primevue/card'

const equipped = reactive({
    head:  null,
    torso: null,
    hands: null,
    trinkets: null,
    legs:  null,
    feet:  null,
})

// Orden y nombres de los slots centrales
const centralSlots = [
    { id: 'head', nombre: 'Cabeza' },
    { id: 'torso', nombre: 'Torso' },
    { id: 'trinkets', nombre: 'Accesorio' },
    { id: 'hands', nombre: 'Manos' },
    { id: 'legs', nombre: 'Piernas' },
    { id: 'feet', nombre: 'Pies' },
]

// Mapeo de posiciones CSS para cada slot
const slotPositions = {
    head: 'top-5 left-1/2 -translate-x-1/2',
    torso: 'top-25 left-1/2 -translate-x-1/2',
    trinkets: 'top-30 left-1/4 -translate-x-1/2 translate-y-1/2',
    hands: 'top-30 right-1/4 translate-x-1/2 translate-y-1/2',
    legs: 'top-45 left-1/2 -translate-x-1/2',
    feet: 'top-65 left-1/2 -translate-x-1/2',
}

const selectedSlot = ref(null)

const leftSlots = [
  { id: 'head',  nombre: 'Cabeza' },
  { id: 'torso', nombre: 'Torso' },
  { id: 'hands', nombre: 'Manos' },
]

const rightSlots = [
  { id: 'trinkets', nombre: 'Accesorio' },
  { id: 'legs', nombre: 'Piernas' },
  { id: 'feet', nombre: 'Pies' },
]

const slotNames = {
    head:  'cabeza',
    torso: 'torso',
    hands: 'manos',
    trinkets: 'accesorio',
    legs:  'piernas',
    feet:  'pies',
}

const itemPool = {
    head: [
      { id: '2', nombre: 'Gafas',    img: 'https://cdn-icons-png.flaticon.com/512/655/655781.png' },
      { id: '4', nombre: 'Afro',     img: 'https://cdn-icons-png.flaticon.com/512/3165/3165383.png' },
      { id: '6', nombre: 'Sombrero', img: 'https://cdn-icons-png.flaticon.com/512/2418/2418731.png' },
    ],
    torso: [
      { id: '3', nombre: 'Camisa', img: 'https://cdn-icons-png.flaticon.com/512/2503/2503380.png' },
    ],
    hands: [
      { id: '7', nombre: 'Guantes', img: 'https://cdn-icons-png.flaticon.com/512/2418/2418731.png' },
      ],
    trinkets: [
      { id: '7', nombre: 'Accesorio', img: 'https://cdn-icons-png.flaticon.com/512/2418/2418731.png' },
      ],
    
    legs: [
      { id: '1', nombre: 'Pantalón', img: 'https://cdn-icons-png.flaticon.com/512/2122/2122607.png' },
    ],
    feet: [
      { id: '5', nombre: 'Zapatos', img: 'https://cdn-icons-png.flaticon.com/512/2742/2742689.png' },
    ],
}

function openPicker(slotId) {
  selectedSlot.value = selectedSlot.value === slotId ? null : slotId
}

function selectItem(item) {
  equipped[selectedSlot.value] = item
  selectedSlot.value = null
}
</script>
<style scoped>
@reference "../assets/main.css";

.slot-container {
  @apply absolute w-18 h-18 flex items-center justify-center pointer-events-none;
}

.equipped-img {
  @apply w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)];
}

.equip-enter-active,
.equip-leave-active { transition: all 0.3s ease; }
.equip-enter-from   { opacity: 0; transform: translateY(-10px) scale(0.8); }
.equip-leave-to     { opacity: 0; transform: scale(1.2); }

.slide-up-enter-active,
.slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(8px); }
.slide-up-leave-to     { opacity: 0; transform: translateY(8px); }
</style>