<template>
  <div class="w-full border-b border-gray-200 bg-white p-2">
    <div class="flex items-center justify-between gap-4">
      
      <div class="flex-1 max-w-xl">
        <span class="p-input-icon-left w-full">
          
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText 
            v-model="shopStore.searchQuery" 
            placeholder="Busca un producto..." 
            class="w-full rounded-xl bg-gray-50 border-gray-200"
        />
        </IconField>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="isMobile">
          <Button
            icon="pi pi-filter"
            @click="drawerVisible = true"
            class="md:hidden !bg-indigo-600 !border-none !rounded-xl"
            :badge="activeFiltersCount > 0 ? activeFiltersCount.toString() : null"
          />
        </div>
        <div v-else class="hidden md:flex items-center gap-2">
          <MultiSelect 
            v-model="shopStore.selectedCategories" 
            :options="mappedCategories" 
            optionLabel="displayName" 
            placeholder="Categorías" 
            class="w-48 lg:w-64"
          />
          <Select
            v-model="shopStore.acquisitionFilter"
            :options="acquisitionOptions"
            optionLabel="label"
            optionValue="value"
            class="w-36 lg:w-44"
          />
        </div>
      </div>

      <div class="shrink-0">
        <div class="bg-yellow-400 text-black font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border-b-2 border-yellow-600">
          <span class="text-xs sm:text-sm">{{ auth.userData?.coins ?? 0 }}</span>
          <img :src="IMAGES.coin" alt="Moneda" class="w-5 h-5">
        </div>
      </div>
    </div>

    <Drawer 
      v-model:visible="drawerVisible" 
      header="Filtros de Búsqueda" 
      position="right" 
      class="md:hidden !w-full !h-full !rounded-b-3xl"
    >
      <div class="flex flex-col gap-5 pb-6">
        
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-gray-400 uppercase">Categorías</label>
          <MultiSelect 
            v-model="shopStore.selectedCategories" 
            :options="mappedCategories" 
            optionLabel="displayName" 
            placeholder="Categorías" 
            class="w-full lg:w-64"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-gray-400 uppercase">Propiedad</label>
          <Select
            v-model="shopStore.acquisitionFilter"
            :options="acquisitionOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 mt-2">
          <Button label="Limpiar" @click="clearFilters" variant="text" class="!text-gray-500" />
          <Button label="Aplicar" @click="drawerVisible = false" class="!bg-indigo-600 !border-none" />
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconField  from 'primevue/iconfield'
import InputText from 'primevue/inputtext'
import InputIcon from 'primevue/inputicon'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import { useShopStore } from '@/stores/shop.store'
import { useAuthStore } from '@/stores/auth.store'
import { IMAGES } from '@/utils/imgBucketStorage'
import api from '@/api/axios'

const isMobile = ref(false)
const drawerVisible = ref(false)
const categories = ref([]) // Lista de la BBDD

const shopStore = useShopStore()
const auth = useAuthStore()

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);

  try {
    // 1. AXIOS entrega la respuesta directamente
    const response = await api.get('/categories');
    
    // 2. En Axios, los datos vienen en .data
    // Asumiendo que tu controlador devuelve un array: [{id: 1, name: '...'}, ...]
    categories.value = response.data; 
    
    
  } catch (error) {
    console.error("Error al obtener categorías de la BBDD:", error);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const acquisitionOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Adquirido', value: 'adquirido' },
  { label: 'No adquirido', value: 'no_adquirido' }
]
// Asegúrate de que las CLAVES coincidan con lo que devuelve el servidor
const categoryLabels = {
  'icons': 'Iconos',      
  'banners': 'Banners',
  'headwear': 'Cabeza',
  'hands': 'Manos',
  'trinkets': 'Accesorios',
  'feets': 'Pies',
  'lowerbody': 'Parte Inferior',
  'upperbody': 'Parte Superior'
}

const mappedCategories = computed(() => {
  return categories.value.map(cat => {
    // Si tu API devuelve 'name', usa cat.name
    // Si tu API devuelve 'categoryName', usa cat.categoryName
    const internalName = cat.name || cat.categoryName; 
    
    return {
      ...cat,
      displayName: categoryLabels[internalName] || internalName || 'Sin nombre'
    }
  })
})
const activeFiltersCount = computed(() => {
  let count = 0
  if (shopStore.selectedCategories?.length > 0) count++
  if (shopStore.acquisitionFilter !== 'todos') count++
  return count
})

function clearFilters() {
  shopStore.selectedCategories = []
  shopStore.acquisitionFilter = 'todos'
}
</script>