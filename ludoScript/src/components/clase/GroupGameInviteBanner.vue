<template>
    <!-- H1: estado visible con color destacado según rol -->
    <div :class="isOwner
        ? 'border-green-500/40 bg-green-950/30'
        : 'border-indigo-500/40 bg-indigo-950/30'"
        class="border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">

        <!-- Icono + Texto -->
        <div class="flex items-start gap-3 flex-1 min-w-0">
            <span class="text-2xl shrink-0">🎮</span>
            <div class="min-w-0">
                <!-- H2: lenguaje natural acorde al rol -->
                <p v-if="isOwner" class="text-white font-bold text-sm leading-snug">
                    Partida de clase iniciada
                </p>
                <p v-else class="text-white font-bold text-sm leading-snug">
                    ¡<span class="text-indigo-300">{{ initiatorUsername }}</span>
                    ha iniciado una partida de clase!
                </p>

                <!-- URL de espectador (visible para todos) -->
                <div class="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span class="text-slate-400 text-xs">Ver partida:</span>
                    <code class="text-xs bg-gray-800/80 text-green-300 px-2 py-0.5 rounded-lg font-mono select-all truncate max-w-[200px]">
                        {{ spectatorUrl }}
                    </code>
                    <!-- H3: acción rápida de copiar -->
                    <button @click="copyUrl"
                        class="text-xs text-slate-400 hover:text-white transition-colors shrink-0"
                        :title="copied ? 'Copiado' : 'Copiar enlace'">
                        <i :class="copied ? 'pi pi-check text-green-400' : 'pi pi-copy'"></i>
                        {{ copied ? 'Copiado' : 'Copiar' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Acciones -->
        <div class="flex items-center gap-2 shrink-0">
            <!-- H3: los miembros pueden ignorar la invitación -->
            <button v-if="!isOwner" @click="$emit('dismiss')"
                class="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1.5">
                Ignorar
            </button>
            <!-- H7: acción principal directa y prominente -->
            <button @click="$emit('join')"
                :class="isOwner
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'"
                class="text-xs font-bold text-white px-4 py-2 rounded-xl transition-all flex items-center gap-1.5">
                <i class="pi pi-play text-xs"></i>
                {{ isOwner ? 'Unirme a la sala' : '¡Unirme!' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    code: { type: String, required: true },
    initiatorUsername: { type: String, default: '' },
    isOwner: { type: Boolean, default: false },
});

defineEmits(['join', 'dismiss']);

const copied = ref(false);

const spectatorUrl = computed(() =>
    `${window.location.origin}/spectate/${props.code}`
);

async function copyUrl() {
    try {
        await navigator.clipboard.writeText(spectatorUrl.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    } catch {
        // Fallback para navegadores sin clipboard API
        const el = document.createElement('input');
        el.value = spectatorUrl.value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    }
}
</script>
