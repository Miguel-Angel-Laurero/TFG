<template>
    <!-- H1: el código y el contador dan visibilidad del estado del grupo -->
<div>
    <img :src="IMAGES.profesor" class="w-32 m-auto"/>
    
    <div
        class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <!-- Info principal -->
        <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xl sm:text-2xl font-bold text-white truncate">{{ group.name }}</h2>
                <span :class="memberCountColor" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10">
                    {{ memberCount }}/30 miembros
                </span>
            </div>
            <p v-if="group.description" class="text-sm text-slate-400 mt-1 truncate">{{ group.description }}</p>
        </div>

        <!-- Código de invitación + acciones -->
        <div class="flex flex-col sm:items-end gap-2 flex-shrink-0">
            <!-- H10: tooltip explica qué es el código -->
            <button @click="copyCode" title="Haz clic para copiar el código de invitación"
                class="flex items-center gap-2 bg-indigo-700/40 hover:bg-indigo-700/70 border border-indigo-500/40 rounded-lg px-3 py-2 transition-colors cursor-pointer group">
                <span class="text-xs text-slate-400 uppercase tracking-widest">Código</span>
                <span class="font-mono font-bold text-yellow-300 text-lg tracking-widest">{{ group.inviteCode }}</span>
                <!-- H1: feedback visual al copiar -->
                <span v-if="copied" class="text-xs text-emerald-400 font-semibold">✓ Copiado</span>
                <span v-else class="text-slate-400 group-hover:text-white transition-colors text-sm">📋</span>
            </button>

            <!-- H3: acciones de salida siempre visibles -->
            <div class="flex gap-2">
                <template v-if="isOwner">
                    <button @click="$emit('openTransfer')"
                        class="text-xs bg-blue-700/40 hover:bg-blue-700/70 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-lg transition-colors">
                        👑 Transferir liderazgo
                    </button>
                    <!-- H5: acción destructiva pide confirmación -->
                    <button @click="$emit('openDissolve')"
                        class="text-xs bg-red-700/30 hover:bg-red-700/60 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors">
                        🗑 Disolver clase
                    </button>
                </template>
                <template v-else>
                    <button @click="$emit('openLeave')"
                        class="text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                        🚪 Salir de la clase
                    </button>
                </template>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { IMAGES } from '@/utils/imgBucketStorage';

const props = defineProps({
    group: { type: Object, required: true },
    memberCount: { type: Number, required: true },
    isOwner: { type: Boolean, default: false },
});

defineEmits(['openTransfer', 'openDissolve', 'openLeave']);

const copied = ref(false);

function copyCode() {
    navigator.clipboard.writeText(props.group.inviteCode).then(() => {
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    });
}

const memberCountColor = computed(() => {
    const pct = props.memberCount / 30;
    if (pct >= 0.9) return 'text-red-400';
    if (pct >= 0.6) return 'text-yellow-400';
    return 'text-emerald-400';
});
</script>
