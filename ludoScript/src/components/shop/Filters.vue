<template>   
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-gray-400 uppercase">Categorías</label>
          <MultiSelect 
            v-model="shopStore.selectedCategories" 
            :options="categories" 
            optionLabel="name" 
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
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useShopStore } from '@/stores/shop.store'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios' // Tu instancia de Axios

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