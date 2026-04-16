<template>
    <!-- H8: overlay semitransparente, foco en el modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        @click.self="$emit('close')">
        <div class="bg-gray-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">

            <!-- Cabecera -->
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-white font-bold text-xl flex items-center gap-2">
                    <i class="pi pi-users text-green-400"></i>
                    Jugar con la clase
                </h2>
                <!-- H3: botón de cierre siempre visible -->
                <button @click="$emit('close')" aria-label="Cerrar"
                    class="text-slate-400 hover:text-white text-xl leading-none transition-colors">&times;</button>
            </div>

            <!-- H10: descripción del flujo para reducir incertidumbre -->
            <p class="text-slate-400 text-sm mb-5">
                Todos los miembros de la clase que estén conectados recibirán una notificación para
                unirse. La partida comienza cuando tú la inicies.
            </p>

            <div class="flex flex-col gap-5">

                <!-- Número de preguntas -->
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-2">
                        <i class="pi pi-list mr-1 text-slate-400"></i>
                        Preguntas:
                        <span class="text-white font-bold ml-1">{{ form.questionCount }}</span>
                    </label>
                    <input type="range" v-model.number="form.questionCount" min="3" max="20"
                        class="w-full accent-green-500" />
                    <div class="flex justify-between text-xs text-slate-500 mt-0.5">
                        <span>3 (mín.)</span><span>20 (máx.)</span>
                    </div>
                </div>

                <!-- Tiempo por pregunta -->
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-2">
                        <i class="pi pi-clock mr-1 text-slate-400"></i>
                        Tiempo por pregunta:
                        <span class="text-white font-bold ml-1">{{ form.timePerQuestion }}s</span>
                    </label>
                    <input type="range" v-model.number="form.timePerQuestion" min="5" max="60" step="5"
                        class="w-full accent-green-500" />
                    <div class="flex justify-between text-xs text-slate-500 mt-0.5">
                        <span>5 s</span><span>60 s</span>
                    </div>
                </div>

                <!-- Categoría (opcional) -->
                <div>
                    <label class="block text-slate-300 text-sm font-medium mb-1">
                        <i class="pi pi-tag mr-1 text-yellow-400"></i>
                        Categoría
                        <span class="text-slate-500 text-xs ml-1">(opcional)</span>
                    </label>
                    <select v-model="form.category"
                        class="w-full bg-gray-700 text-white border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Todas las categorías</option>
                        <option v-for="cat in categories" :key="cat" :value="cat">
                            {{ formatCategory(cat) }}
                        </option>
                    </select>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-3 pt-1">
                    <button @click="$emit('close')" :disabled="loading"
                        class="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-medium py-2.5 rounded-xl transition-all">
                        Cancelar
                    </button>
                    <!-- H5: botón desactivado mientras carga para evitar dobles envíos -->
                    <button @click="handleStart" :disabled="loading"
                        class="flex-2 flex-grow-[2] bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                        <!-- H1: spinner durante carga -->
                        <i v-if="loading" class="pi pi-spin pi-spinner text-sm"></i>
                        <i v-else class="pi pi-play text-sm"></i>
                        {{ loading ? 'Iniciando…' : 'Iniciar partida' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    loading: { type: Boolean, default: false },
});
const emit = defineEmits(['start', 'close']);

const form = ref({
    questionCount: 10,
    timePerQuestion: 20,
    category: '',
});

// Categorías disponibles (deben coincidir con quizQuestions.json)
const categories = [
    'javascript', 'html', 'css', 'react', 'vue', 'nodejs',
    'python', 'databases', 'git', 'algorithms', 'typescript', 'security',
];

function formatCategory(cat) {
    return cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function handleStart() {
    emit('start', {
        questionCount: form.value.questionCount,
        timePerQuestion: form.value.timePerQuestion,
        category: form.value.category || null,
    });
}
</script>
