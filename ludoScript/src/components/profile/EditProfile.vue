<template>
    <span class="grid grid-cols-2 mb-8">
        Actualiza tu información de perfil.
    </span>
    <div class="grid grid-cols-2 gap-8">
            <div class="flex flex-col items-center gap-3">
                <h1 class="font-bold text-lg">Icono</h1>
                <div class="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors cursor-pointer">
                    <img :src="auth.userIcon" alt="Icono Actual" class="w-full h-full object-cover">
                </div>
                <p class="text-xs text-gray-500">Click para cambiar</p>
            </div>

            <div class="flex flex-col items-center gap-3">
                <h1 class="font-bold text-lg">Banner</h1>
                <div class="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors cursor-pointer">
                    <img :src="auth.userBanner" alt="Banner Actual" class="w-full h-full object-cover">
                </div>
                <p class="text-xs text-gray-500">Click para cambiar</p>
            </div>
        </div>

    <div class="flex justify-end gap-2 mt-4">
        <button @click="$emit('close')" class="p-2 text-red-500 cursor-pointer">Cancelar</button>
        <button @click="saveProfile" class="p-2 bg-blue-500 text-white rounded cursor-pointer">Guardar</button>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store';

// Definimos los eventos que este componente puede disparar
const emit = defineEmits(['close']);
const auth = useAuthStore();

const saveProfile = () => {
    console.log('Guardando cambios para:', auth.username);
    // 1. Aquí llamarías a tu API para persistir los datos
    // 2. Avisamos al padre para que cierre el Dialog
    emit('close');
}
</script>