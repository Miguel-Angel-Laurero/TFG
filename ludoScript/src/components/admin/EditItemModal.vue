<template>
    <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
            <h3 class="text-xl font-bold mb-4">Editar Objeto</h3>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input
                        v-model="form.name"
                        type="text"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div>
                    <label class="block text-sm text-gray-400 mb-1">Precio</label>
                    <input
                        v-model.number="form.price"
                        type="number"
                        min="0"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div>
                    <label class="block text-sm text-gray-400 mb-1">Categoría</label>
                    <select
                        v-model="form.categoryId"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        :class="{ 'border-red-500': errors.categoryId }"
                    >
                        <option value="" disabled>Selecciona una categoría</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                    <p v-if="errors.categoryId" class="text-red-400 text-xs mt-1">{{ errors.categoryId }}</p>
                </div>

                <div>
                    <label class="block text-sm text-gray-400 mb-1">Imagen (tienda)</label>
                    <img v-if="previews.img || form.img" :src="previews.img || form.img" class="mb-2 h-16 object-contain rounded" />
                    <input
                        type="file"
                        accept="image/*"
                        @change="onFileChange('img', $event)"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>

                <div>
                    <label class="block text-sm text-gray-400 mb-1">Imagen equipable</label>
                    <img v-if="previews.equipped_img || form.equipped_img" :src="previews.equipped_img || form.equipped_img" class="mb-2 h-16 object-contain rounded" />
                    <input
                        type="file"
                        accept="image/*"
                        @change="onFileChange('equipped_img', $event)"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button
                    @click="handleClose"
                    class="px-4 py-2 text-gray-400 hover:text-white transition cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    @click="handleSave"
                    :disabled="loading"
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded font-medium shadow transition disabled:opacity-50 cursor-pointer"
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
})

const emit = defineEmits(['update:modelValue', 'save'])

const form     = reactive({ id: null, name: '', price: 0, img: null, equipped_img: null })
const previews = reactive({ img: null, equipped_img: null })

// Sincroniza el form cuando cambia el item a editar
watch(() => props.item, (item) => {
    if (item) {
        Object.assign(form, item)
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
    const payload = new FormData()
    payload.append('id',    form.id)
    payload.append('name',  form.name)
    payload.append('price', form.price)
    if (form.img          instanceof File) payload.append('img',          form.img)
    if (form.equipped_img instanceof File) payload.append('equipped_img', form.equipped_img)
    emit('save', payload)
}

const handleClose = () => {
    previews.img          = null
    previews.equipped_img = null
    emit('update:modelValue', false)
}
</script>