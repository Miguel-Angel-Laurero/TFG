<template>
  <div class="grid grid-cols-1 gap-6">
    <div class="flex flex-col items-center gap-3">
      <h3 class="font-bold text-lg text-white">
        Icono actual
      </h3>
      <div class="w-24 h-24 rounded-full border-2 border-dashed border-slate-500/80 bg-slate-700/60 flex items-center justify-center overflow-hidden">
        <img
          v-if="avatar"
          :src="avatar"
          alt="Icono actual"
          class="w-full h-full object-cover"
        >
        <span
          v-else
          class="text-3xl text-slate-300"
        >?</span>
      </div>
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
        @click="togglePicker('icon')"
      >
        Editar icono
      </button>

      <ItemPicker
        :slot-id="'icon'"
        :open="openPicker === 'icon'"
        :equipped="fakeEquipped"
        :item-pool="itemPool"
        :slot-names="SLOT_NAMES"
        @close="openPicker = null"
        @select="item => { $emit('select-avatar', item.img); openPicker = null }"
      />
    </div>

    <div class="flex flex-col items-center gap-3">
      <h3 class="font-bold text-lg text-white">
        Banner actual
      </h3>
      <div class="w-full h-24 rounded-xl border-2 border-dashed border-slate-500/80 bg-slate-700/60 overflow-hidden">
        <img
          v-if="banner"
          :src="banner"
          alt="Banner actual"
          class="w-full h-full object-cover"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-slate-300 text-sm"
        >
          Sin banner seleccionado
        </div>
      </div>
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
        @click="togglePicker('banner')"
      >
        Editar banner
      </button>

      <ItemPicker
        :slot-id="'banner'"
        :open="openPicker === 'banner'"
        :equipped="fakeEquipped"
        :item-pool="itemPool"
        :slot-names="SLOT_NAMES"
        @close="openPicker = null"
        @select="item => { $emit('select-banner', item.img); openPicker = null }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.store'
import ItemPicker from './ItemPicker.vue'

const props = defineProps({
    avatar: { type: String, default: '' },
    banner: { type: String, default: '' },
})

const emit = defineEmits(['select-avatar', 'select-banner'])

const SLOT_NAMES = { icon: 'Icono', banner: 'Banner' }
const store = useEquipmentStore()
const openPicker = ref(null)
// Normalizamos el pool asegurando que siempre haya un array y la prop 'img' exista
const itemPool = computed(() => ({
    icon:   (store.itemPool?.icon   || []).map(item => ({ ...item, img: item.image_url || item.img })),
    banner: (store.itemPool?.banner || []).map(item => ({ ...item, img: item.image_url || item.img })),
}))
console.log(store.itemPool)
console.log(store.itemPool.icon)

// Derivamos el objeto equipado comparando la URL actual con los items del pool
const fakeEquipped = computed(() => ({
    icon:   itemPool.value.icon.find(i => i.img === props.avatar)   || null,
    banner: itemPool.value.banner.find(i => i.img === props.banner) || null,
}))

function togglePicker(type) {
    openPicker.value = openPicker.value === type ? null : type
}
</script>