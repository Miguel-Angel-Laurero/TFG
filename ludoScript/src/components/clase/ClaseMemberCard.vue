<template>
    <div
        class="flex items-center gap-3 bg-slate-700/40 hover:bg-slate-700/60 border border-white/5 rounded-xl p-3 transition-colors">

        <!-- Posición en el ranking -->
        <div class="flex-shrink-0 w-8 text-center">
            <span v-if="rank === 1" class="text-xl">🥇</span>
            <span v-else-if="rank === 2" class="text-xl">🥈</span>
            <span v-else-if="rank === 3" class="text-xl">🥉</span>
            <span v-else class="text-sm font-bold text-slate-400">#{{ rank }}</span>
        </div>

        <!-- Avatar -->
        <div class="flex-shrink-0">
            <img v-if="member.avatar" :src="member.avatar" :alt="member.username"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40" />
            <div v-else
                class="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-500/40 text-lg">
                👤
            </div>
        </div>

        <!-- Nombre y stats -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-white truncate">{{ member.username }}</span>
                <span v-if="isCurrentUser"
                    class="text-[10px] bg-indigo-600/60 text-indigo-200 px-1.5 py-0.5 rounded-full">Tú</span>
                <span v-if="isOwner" class="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full">👑
                    Líder</span>
            </div>
            <!-- H8: solo las stats más relevantes en la card, sin saturar -->
            <div class="flex gap-3 mt-1 flex-wrap">
                <span class="text-xs text-slate-400">
                    🎯 <span class="text-white font-medium">{{ member.accuracy }}%</span>
                </span>
                <span class="text-xs text-slate-400">
                    🔥 <span class="text-white font-medium">{{ member.streak }}</span>
                </span>
                <span class="text-xs text-slate-400">
                    ⏱ <span class="text-white font-medium">{{ formatTime(member.timeSpent) }}</span>
                </span>
            </div>
        </div>

        <!-- Acciones del líder (expulsar / transferir) -->
        <!-- H5: botones de acción sensibles solo si lidera y no es el propio líder ni el usuario actual -->
        <div v-if="canManage" class="flex-shrink-0 flex gap-1">
            <button @click="$emit('transfer', member.userId)" title="Transferir liderazgo a este miembro"
                class="text-xs bg-blue-700/30 hover:bg-blue-700/60 border border-blue-500/20 text-blue-300 px-2 py-1 rounded-lg transition-colors">
                👑
            </button>
            <button @click="$emit('kick', member.userId)" title="Expulsar de la clase"
                class="text-xs bg-red-700/20 hover:bg-red-700/50 border border-red-500/20 text-red-400 px-2 py-1 rounded-lg transition-colors">
                ✕
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    member: { type: Object, required: true },
    rank: { type: Number, required: true },
    isOwner: { type: Boolean, default: false },      // Este miembro es el dueño del grupo
    isCurrentUser: { type: Boolean, default: false }, // Este miembro es el usuario logueado
    canManage: { type: Boolean, default: false },     // El usuario logueado es líder y puede gestionar
});

defineEmits(['kick', 'transfer']);

function formatTime(seconds) {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}
</script>
