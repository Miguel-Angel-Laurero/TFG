<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto gap-4 lg:gap-12">
    
    <div class="order-2 lg:order-1 flex justify-center items-center p-4">
      <img 
        :src="IMAGES.profesor" 
        alt="Profesor"
        class="w-full max-w-sm lg:max-w-2xl h-auto object-contain drop-shadow-2xl"
      >
    </div>

    <div class="order-1 lg:order-2 flex flex-col gap-6 w-full max-w-lg mx-auto py-6 px-4 md:px-6">

        <div class="text-center lg:text-left">
            <h2 class="text-2xl md:text-3xl font-bold text-white font-righteous">Únete a una Clase</h2>
            <p class="text-slate-400 text-sm md:text-base mt-2">Aprende y compite con otros jugadores en tu clase</p>
        </div>

        <form @submit.prevent="handleJoin"
            class="bg-slate-800/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-xl">
            <h3 class="font-semibold text-xs md:text-sm uppercase tracking-wider text-indigo-300">
                Unirse con código de invitación
            </h3>
            
            <div class="flex flex-col gap-2">
              <input v-model="joinCode" type="text" placeholder="ej: A3F9B2C1" maxlength="8" autocomplete="off"
                  :disabled="loading"
                  class="bg-slate-700/60 border border-white/10 rounded-xl px-4 py-3 text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50" />
              <p v-if="joinError" class="text-red-400 text-xs italic ml-1">{{ joinError }}</p>
            </div>

            <button type="submit" :disabled="loading || !joinCode.trim()"
                class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20">
                <span v-if="loading">Uniéndose…</span>
                <span v-else>Unirse a la Clase</span>
            </button>
        </form>

        <div class="flex items-center gap-4 text-slate-600 px-2">
            <div class="flex-1 h-px bg-slate-800"></div>
            <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">o</span>
            <div class="flex-1 h-px bg-slate-800"></div>
        </div>

        <form @submit.prevent="handleCreate"
            class="bg-slate-800/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-xl">
            <h3 class="font-semibold text-xs md:text-sm uppercase tracking-wider text-emerald-300">
                Crear nueva clase
            </h3>
            
            <div class="space-y-4">
              <div>
                  <label class="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1 block">Nombre <span class="text-red-400">*</span></label>
                  <input v-model="createName" type="text" placeholder="ej: DAW 2º A" maxlength="80" :disabled="loading"
                      class="w-full bg-slate-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50" />
              </div>
              
              <div>
                  <label class="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1 block">Descripción <span class="normal-case text-slate-600">(opcional)</span></label>
                  <input v-model="createDesc" type="text" placeholder="ej: Clase de programación web" maxlength="255"
                      :disabled="loading"
                      class="w-full bg-slate-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50" />
              </div>
            </div>

            <p v-if="createError" class="text-red-400 text-xs italic ml-1">{{ createError }}</p>

            <button type="submit" :disabled="loading || !createName.trim()"
                class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
                <span v-if="loading">Creando…</span>
                <span v-else>Crear Clase</span>
            </button>
        </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { IMAGES } from '@/utils/imgBucketStorage';

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
