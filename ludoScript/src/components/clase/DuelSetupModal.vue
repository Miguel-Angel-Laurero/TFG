<template>
    <!-- H8: overlay semitransparente, foco en el modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" @click.self="$emit('close')">
        <div class="bg-gray-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">

            <!-- Cabecera -->
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-white font-bold text-xl flex items-center gap-2">
                    <i class="pi pi-bolt text-yellow-400"></i>
                    Duelo 1v1
                </h2>
                <!-- H3: botón de cierre visible -->
                <button @click="$emit('close')" aria-label="Cerrar"
                    class="text-slate-400 hover:text-white text-xl leading-none transition-colors">&times;</button>
            </div>

            <!-- H9: error en lenguaje humano -->
            <div v-if="duel.error"
                class="mb-4 bg-red-900/30 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                <i class="pi pi-exclamation-triangle text-red-400 text-sm mt-0.5 shrink-0"></i>
                <div class="flex-1">
                    <p class="text-red-300 text-sm">{{ duel.error }}</p>
                    <p v-if="offlineNames.length" class="text-red-400/70 text-xs mt-0.5">
                        Sin conexión: {{ offlineNames.join(', ') }}
                    </p>
                </div>
                <button @click="duel.clearError()" class="text-slate-400 hover:text-white text-base leading-none">&times;</button>
            </div>

            <!-- Estado: esperando aceptación -->
            <div v-if="duel.duelStatus === 'waiting'" class="text-center py-8">
                <i class="pi pi-spin pi-spinner text-4xl text-indigo-400 mb-4 block"></i>
                <p class="text-white font-semibold">Invitaciones enviadas</p>
                <p class="text-slate-400 text-sm mt-1">Esperando que ambos jugadores acepten…</p>
                <div class="mt-4 inline-flex items-center gap-2 bg-indigo-900/30 border border-indigo-500/20 px-5 py-2.5 rounded-xl">
                    <i class="pi pi-shield text-indigo-400 text-xs"></i>
                    <span class="text-indigo-300 font-mono font-bold tracking-widest">{{ duel.duelCode }}</span>
                </div>
                <p class="text-slate-500 text-xs mt-3">La sala caduca en 60 s si no se acepta.</p>
            </div>

            <!-- Estado: duelo cancelado desde este modal -->
            <div v-else-if="duel.duelStatus === 'cancelled'" class="text-center py-8">
                <i class="pi pi-times-circle text-4xl text-red-400 mb-4 block"></i>
                <p class="text-white font-semibold">Duelo cancelado</p>
                <p class="text-slate-400 text-sm mt-1">{{ duel.error }}</p>
                <button @click="resetForm"
                    class="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
                    Intentar de nuevo
                </button>
            </div>

            <!-- Formulario de configuración -->
            <template v-else>
                <div class="flex flex-col gap-4">

                    <!-- Jugador 1 -->
                    <div>
                        <label class="block text-slate-300 text-sm font-medium mb-1">
                            <i class="pi pi-user mr-1 text-indigo-400"></i> Jugador 1
                        </label>
                        <!-- H6: label visible, placeholder descriptivo -->
                        <select v-model="form.player1Id"
                            class="w-full bg-gray-700 text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="" disabled>Seleccionar jugador…</option>
                            <option v-for="m in membersForP1" :key="m.userId" :value="m.userId">
                                {{ m.username }}
                            </option>
                        </select>
                    </div>

                    <!-- Jugador 2 -->
                    <div>
                        <label class="block text-slate-300 text-sm font-medium mb-1">
                            <i class="pi pi-user mr-1 text-pink-400"></i> Jugador 2
                        </label>
                        <select v-model="form.player2Id"
                            class="w-full bg-gray-700 text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="" disabled>Seleccionar jugador…</option>
                            <option v-for="m in membersForP2" :key="m.userId" :value="m.userId">
                                {{ m.username }}
                            </option>
                        </select>
                    </div>

                    <!-- Categoría -->
                    <div>
                        <label class="block text-slate-300 text-sm font-medium mb-1">
                            <i class="pi pi-tag mr-1 text-yellow-400"></i> Categoría
                        </label>
                        <!-- H1: skeleton mientras carga -->
                        <div v-if="loadingCategories"
                            class="h-10 bg-gray-700 rounded-xl animate-pulse"></div>
                        <select v-else v-model="form.category"
                            class="w-full bg-gray-700 text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="" disabled>Seleccionar categoría…</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">
                                {{ cat.replace(/-/g, ' ') }}
                            </option>
                        </select>
                    </div>

                    <!-- Número de preguntas -->
                    <div>
                        <label class="block text-slate-300 text-sm font-medium mb-2">
                            <i class="pi pi-list mr-1 text-slate-400"></i>
                            Preguntas: <span class="text-white font-bold">{{ form.questionCount }}</span>
                        </label>
                        <!-- H6: feedback inmediato del valor -->
                        <input type="range" v-model.number="form.questionCount" min="3" max="20"
                            class="w-full accent-indigo-500" />
                        <div class="flex justify-between text-xs text-slate-500 mt-0.5">
                            <span>3 (mín.)</span>
                            <span>20 (máx.)</span>
                        </div>
                    </div>

                    <!-- H5: botón desactivado hasta que el formulario sea válido -->
                    <button @click="handleSend" :disabled="!isValid"
                        class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <i class="pi pi-bolt"></i>
                        Iniciar duelo
                    </button>
                </div>
            </template>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDuelStore } from '@/stores/duel.store'
import { useGroupStore } from '@/stores/group.store'

const emit = defineEmits(['close'])

const duel = useDuelStore()
const groupStore = useGroupStore()

const form = ref({ player1Id: '', player2Id: '', category: '', questionCount: 10 })
const categories = ref([])
const loadingCategories = ref(true)

// Lista de miembros del grupo (excluyendo el owner, que solo organiza)
const members = computed(() =>
    (groupStore.group?.members ?? []).map(m => ({
        userId: m.member.id,
        username: m.member.username,
    }))
)

const membersForP1 = computed(() => members.value)
const membersForP2 = computed(() =>
    members.value.filter(m => m.userId !== Number(form.value.player1Id))
)

const isValid = computed(() =>
    form.value.player1Id &&
    form.value.player2Id &&
    Number(form.value.player1Id) !== Number(form.value.player2Id) &&
    form.value.category
)

// Nombres de los jugadores offline (para el mensaje de error)
const offlineNames = computed(() => {
    if (!duel.error?.includes('conectados')) return []
    return []
})

function handleSend() {
    if (!isValid.value) return
    duel.sendInvite({
        player1Id: Number(form.value.player1Id),
        player2Id: Number(form.value.player2Id),
        category: form.value.category,
        questionCount: form.value.questionCount,
    })
}

function resetForm() {
    duel.reset()
    form.value = { player1Id: '', player2Id: '', category: '', questionCount: 10 }
}

onMounted(async () => {
    try {
        const res = await fetch('/quizQuestions.json')
        const questions = await res.json()
        categories.value = [...new Set(questions.map(q => q.category))].sort()
    } catch {
        categories.value = []
    } finally {
        loadingCategories.value = false
    }
})
</script>
