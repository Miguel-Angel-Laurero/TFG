<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
      <h3 class="text-xl font-bold mb-4">
        Editar Objeto
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Precio</label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Categoría</label>
          <select
            v-model="form.categoryId"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            :class="{ 'border-red-500': errors.categoryId }"
          >
            <option
              value=""
              disabled
            >
              Selecciona una categoría
            </option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="Number(cat.id)"
            >
              {{ cat.name }}
            </option>
          </select>
          <p
            v-if="errors.categoryId"
            class="text-red-400 text-xs mt-1"
          >
            {{ errors.categoryId }}
          </p>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Imagen (tienda)</label>
          <img
            v-if="previews.img || form.img"
            :src="previews.img || form.img"
            class="mb-2 h-16 object-contain rounded"
          >
          <input
            type="file"
            accept="image/*"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            @change="onFileChange('img', $event)"
          >
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1">Imagen equipable</label>
          <img
            v-if="previews.equipped_img || form.equipped_img"
            :src="previews.equipped_img || form.equipped_img"
            class="mb-2 h-16 object-contain rounded"
          >
          <input
            type="file"
            accept="image/*"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            @change="onFileChange('equipped_img', $event)"
          >
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button
          class="px-4 py-2 text-gray-400 hover:text-white transition cursor-pointer"
          @click="handleClose"
        >
          Cancelar
        </button>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded font-medium shadow transition disabled:opacity-50 cursor-pointer"
          @click="handleSave"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    item:       { type: Object,  default: null },
    loading:    { type: Boolean, default: false },
    categories: { type: Array,   default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'save'])

//                                         ↓ add categoryId
const form     = reactive({ id: null, name: '', price: 0, categoryId: null, img: null, equipped_img: null })
const previews = reactive({ img: null, equipped_img: null })
const errors   = reactive({ categoryId: null }) // ← add this

watch(() => props.item, (item) => {
    if (item) {
        Object.assign(form, {
            id:           item.id,
            name:         item.name,
            price:        item.price,
            categoryId: item.type_id != null ? Number(item.type_id) : null,
            img:          item.img,
            equipped_img: item.equipped_img,
        })
        errors.categoryId     = null
        previews.img          = null
        previews.equipped_img = null
    }
}, { immediate: true })

const onFileChange = (field, event) => {
    const file = event.target.files[0]
    if (!file) return
    form[field]     = file
    previews[field] = URL.createObjectURL(file)
}

const handleSave = () => {
    // Basic validation
    errors.categoryId = form.categoryId ? null : 'La categoría es obligatoria'
    if (errors.categoryId) return

    const payload = new FormData()
    payload.append('id',      form.id)
    payload.append('name',    form.name)
    payload.append('price',   form.price)
    // EditItemModal.vue — handleSave
    payload.append('categoryId', form.categoryId)  // ← cambiar type_id por categoryId
    if (form.img          instanceof File) payload.append('img',          form.img)
    if (form.equipped_img instanceof File) payload.append('equipped_img', form.equipped_img)
    emit('save', { id: form.id, formData: payload })
}

const handleClose = () => {
    previews.img          = null
    previews.equipped_img = null
    errors.categoryId     = null
    emit('update:modelValue', false)
}
</script>