<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="$emit('cancel')">
        <div class="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 class="text-white font-bold text-lg">Transferir liderazgo</h3>
            <p class="text-slate-400 text-sm">Selecciona el miembro que asumirá el liderazgo de la clase. Tú pasarás a
                ser un miembro normal.</p>

            <!-- H6: lista de miembros con avatar y nombre — reconocimiento, no memoria -->
            <div class="flex flex-col gap-2 max-h-60 overflow-y-auto">
                <button v-for="m in members" :key="m.userId" @click="selected = m.userId" :class="selected === m.userId
                    ? 'ring-2 ring-indigo-500 bg-indigo-700/30'
                    : 'hover:bg-slate-700/60'"
                    class="flex items-center gap-3 w-full rounded-xl px-3 py-2 transition-colors text-left border border-white/5">
                    <img v-if="m.avatar" :src="m.avatar" class="w-8 h-8 rounded-full object-cover" />
                    <div v-else class="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm">👤
                    </div>
                    <span class="text-white font-medium text-sm">{{ m.username }}</span>
                </button>

                <!-- Estado vacío -->
                <p v-if="!members.length" class="text-slate-500 text-sm text-center py-4">
                    No hay otros miembros en la clase.
                </p>
            </div>

            <div class="flex gap-3">
                <button @click="$emit('cancel')" :disabled="loading"
                    class="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors">
                    Cancelar
                </button>
                <button @click="$emit('confirm', selected)" :disabled="loading || !selected"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition-colors font-semibold">
                    <span v-if="loading">…</span>
                    <span v-else>Transferir</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
    members: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
});
defineEmits(['confirm', 'cancel']);

const selected = ref(null);
</script>
