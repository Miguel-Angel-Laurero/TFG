<template>
  <div class="flex items-center p-2 w-full border-b border-gray-200 bg-white">
    
    <div class="flex-1 flex items-center gap-2">
      <MultiSelect 
        v-model="shopStore.selectedCategories" 
        :options="categories" 
        optionLabel="name" 
        filter 
        placeholder="Select Categories" 
        class="w-full md:w-64" 
      />
    </div>

    <div class="flex-1 flex justify-center">
      <span class="p-input-icon-left w-full max-w-sm">
        <InputText 
        type="text" 
        v-model="shopStore.searchQuery" 
        placeholder="Busca un producto... " 
        class="w-full rounded-xl"
        />
        
      </span>
    </div>

    <div class="flex-1 flex justify-end">
      <span class="bg-yellow-400 text-black font-extrabold text-sm px-3 py-1 rounded-xl flex items-center gap-2">
        <span>{{ auth.userData?.coins ?? 0 }}</span>
        <img 
            src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/memoryCoin.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbWVtb3J5Q29pbi5wbmciLCJpYXQiOjE3NzQzNjI5NjAsImV4cCI6MTgwNTg5ODk2MH0.2UYhJNH_6lZtHJoGTDAUlr-5cZAJIZZG9qAzFDFrUK8"
            alt="Moneda de RAM"
            class="w-6 h-6 object-contain" 
        >
      </span>
    </div>

  </div>
</template>

<script setup>
  import MultiSelect from 'primevue/multiselect';
  import InputText from 'primevue/inputtext';
  import { useShopStore } from '@/stores/shop.store';
  import { useAuthStore } from '@/stores/auth.store'; // ← añadir
  import { ref, onMounted } from 'vue';

  const shopStore = useShopStore();
  const auth = useAuthStore(); // ← añadir
  const categories = ref([])
  const loading = ref(true)

  onMounted(async () => {
    try {
      const response = await fetch('/categoriesData.json')
      categories.value = await response.json()
    } catch {
      console.error("Error al cargar los datos")
    } finally {
      loading.value = false;
    }
  })
</script>

