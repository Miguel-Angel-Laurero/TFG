<template>
    <div class="flex flex-col gap-6 max-w-lg mx-auto py-8 px-4">

        <div class="text-center">
            <div class="text-5xl mb-3">🏫</div>
            <h2 class="text-2xl font-bold text-white">Únete a una Clase</h2>
            <p class="text-slate-400 text-sm mt-1">Aprende y compite con otros jugadores en tu clase</p>
        </div>

        <!-- Formulario: Unirse con código -->
        <!-- H10: placeholder explica el formato esperado -->
        <form @submit.prevent="handleJoin"
            class="bg-slate-800/60 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
            <h3 class="font-semibold text-white text-sm uppercase tracking-wider text-slate-300">
                Unirse con código de invitación
            </h3>
            <input v-model="joinCode" type="text" placeholder="ej: A3F9B2C1" maxlength="8" autocomplete="off"
                :disabled="loading"
                class="bg-slate-700/60 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50" />
            <!-- H9: error específico con texto claro -->
            <p v-if="joinError" class="text-red-400 text-xs">{{ joinError }}</p>
            <button type="submit" :disabled="loading || !joinCode.trim()"
                class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors">
                <span v-if="loading">Uniéndose…</span>
                <span v-else>Unirse a la Clase</span>
            </button>
        </form>

        <div class="flex items-center gap-3 text-slate-600">
            <div class="flex-1 h-px bg-slate-700"></div>
            <span class="text-xs uppercase tracking-widest">o</span>
            <div class="flex-1 h-px bg-slate-700"></div>
        </div>

        <!-- Formulario: Crear clase -->
        <form @submit.prevent="handleCreate"
            class="bg-slate-800/60 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
            <h3 class="font-semibold text-white text-sm uppercase tracking-wider text-slate-300">
                Crear nueva clase
            </h3>
            <!-- H6: label visible + placeholder con ejemplo -->
            <div>
                <label class="text-xs text-slate-400 mb-1 block">Nombre <span class="text-red-400">*</span></label>
                <input v-model="createName" type="text" placeholder="ej: DAW 2º A" maxlength="80" :disabled="loading"
                    class="w-full bg-slate-700/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50" />
            </div>
            <div>
                <label class="text-xs text-slate-400 mb-1 block">Descripción <span
                        class="text-slate-600">(opcional)</span></label>
                <input v-model="createDesc" type="text" placeholder="ej: Clase de programación web" maxlength="255"
                    :disabled="loading"
                    class="w-full bg-slate-700/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50" />
            </div>
            <p v-if="createError" class="text-red-400 text-xs">{{ createError }}</p>
            <button type="submit" :disabled="loading || !createName.trim()"
                class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors">
                <span v-if="loading">Creando…</span>
                <span v-else>Crear Clase</span>
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    loading: { type: Boolean, default: false },
    error: { type: String, default: null },
});

const emit = defineEmits(['join', 'create']);

const joinCode = ref('');
const createName = ref('');
const createDesc = ref('');
const joinError = ref(null);
const createError = ref(null);

function handleJoin() {
    joinError.value = null;
    if (joinCode.value.trim().length < 8) {
        joinError.value = 'El código debe tener 8 caracteres.';
        return;
    }
    emit('join', joinCode.value.trim().toUpperCase());
}

function handleCreate() {
    createError.value = null;
    if (createName.value.trim().length < 3) {
        createError.value = 'El nombre debe tener al menos 3 caracteres.';
        return;
    }
    emit('create', { name: createName.value.trim(), description: createDesc.value.trim() });
}
</script>
