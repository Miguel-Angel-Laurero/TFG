<template>
    <section class="flex flex-col gap-4 h-full">

        <!-- Cabecera -->
        <div class="flex items-center justify-between flex-shrink-0">
            <h3 class="text-lg font-semibold text-gray-50">Mis PDFs</h3>

            <label :class="[
                'flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer',
                uploading
                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            ]">
                <span v-if="uploading" class="animate-spin">⏳</span>
                <span v-else>＋</span>
                {{ uploading ? 'Procesando…' : 'Subir PDF' }}
                <input ref="fileInput" type="file" accept=".pdf,application/pdf" class="hidden" :disabled="uploading"
                    @change="handleFileChange" />
            </label>
        </div>

        <!-- Aviso Gemini procesando -->
        <p v-if="uploading" class="text-xs text-indigo-300 text-center animate-pulse">
            Gemini está generando preguntas…
        </p>

        <!-- Error de subida -->
        <p v-if="uploadError" class="text-xs text-red-400 text-center">{{ uploadError }}</p>

        <!-- Vacío -->
        <div v-if="!loading && pdfs.length === 0"
            class="flex flex-col items-center justify-center py-8 text-gray-400 gap-2 flex-1">
            <span class="text-3xl">📄</span>
            <p class="text-xs text-center">Sube un PDF para generar preguntas de Quiz y Flashcards</p>
        </div>

        <!-- Loader -->
        <div v-else-if="loading" class="flex justify-center py-6">
            <span class="animate-spin text-indigo-400 text-2xl">⏳</span>
        </div>

        <!-- Lista de PDFs con checkboxes -->
        <ul v-else class="flex flex-col gap-2 overflow-y-auto flex-1">
            <li v-for="pdf in pdfs" :key="pdf.id" :class="[
                'rounded-lg p-3 flex items-start gap-3 cursor-pointer transition-all',
                selectedFiles.includes(pdf.id)
                    ? 'ring-2 ring-indigo-500 bg-indigo-500/10'
                    : 'bg-slate-700/60 border border-transparent hover:bg-slate-700/80'
            ]" @click="toggleSelect(pdf.id)">
                <!-- Checkbox visual -->
                <div :class="[
                    'mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    selectedFiles.includes(pdf.id)
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-gray-500'
                ]">
                    <svg v-if="selectedFiles.includes(pdf.id)" class="w-2.5 h-2.5 text-white" fill="none"
                        viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>

                <!-- Info del PDF -->
                <div class="min-w-0 flex-1">
                    <p class="text-gray-100 font-medium text-sm truncate" :title="pdf.originalName">
                        {{ pdf.originalName }}
                    </p>
                    <p class="text-gray-400 text-xs mt-0.5">{{ formatDate(pdf.createdAt) }}</p>
                </div>

                <!-- Botón borrar (tamaño aumentado) -->
                <button @click.stop="confirmDelete(pdf)"
                    class="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors text-xl p-1 leading-none"
                    title="Eliminar PDF">
                    🗑
                </button>
            </li>
        </ul>

        <!-- Botones de juego -->
        <div v-if="pdfs.length > 0" class="flex flex-col gap-2 flex-shrink-0 pt-2 border-t border-slate-700">

            <!-- Aviso: hay PDFs pero ninguno seleccionado (Nielsen: Prevención de errores) -->
            <div v-if="pdfs.length > 0 && selectedFiles.length === 0"
                class="flex items-start gap-2 bg-amber-900/30 border border-amber-500/40 rounded-lg px-3 py-2">
                <span class="text-amber-400 mt-0.5">💡</span>
                <p class="text-xs text-amber-300">
                    Selecciona uno o más PDFs para una experiencia personalizada, o juega en modo General.
                </p>
            </div>

            <p v-else class="text-xs text-indigo-300 text-center font-medium">
                {{ selectedFiles.length }} PDF{{ selectedFiles.length > 1 ? 's' : '' }} seleccionado{{
                    selectedFiles.length > 1 ? 's' : '' }}
            </p>

            <div class="flex gap-2">
                <button
                    class="flex-1 text-white text-xs font-semibold py-2 rounded-lg transition-colors bg-emerald-600 hover:bg-emerald-700"
                    @click="playSelected('Quiz')">
                    🎯 {{ selectedFiles.length > 0 ? `Quiz (${selectedFiles.length} archivo${selectedFiles.length > 1 ?
                        's' : ''})` : 'Quiz (General)' }}
                </button>
                <button
                    class="flex-1 text-white text-xs font-semibold py-2 rounded-lg transition-colors bg-sky-600 hover:bg-sky-700"
                    @click="playSelected('Flashcards')">
                    🃏 {{ selectedFiles.length > 0 ? `Cards (${selectedFiles.length} archivo${selectedFiles.length > 1 ?
                        's' : ''})` : 'Cards (General)' }}
                </button>
            </div>
        </div>

        <!-- Modal de confirmación de borrado -->
        <div v-if="pendingDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            @click.self="pendingDelete = null">
            <div class="bg-slate-800 rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4">
                <p class="text-gray-100 text-sm text-center">
                    ¿Eliminar <span class="font-semibold">{{ pendingDelete.originalName }}</span>?
                    <br />
                    <span class="text-gray-400 text-xs">Se borrarán también las preguntas generadas.</span>
                </p>
                <div class="flex gap-3">
                    <button @click="pendingDelete = null"
                        class="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button @click="handleDelete"
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>

    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pdfService } from '@/api/pdf.service'

const router = useRouter()

// ─── Estado ──────────────────────────────────────────────────────────────────
const pdfs = ref([])
const loading = ref(true)
const uploading = ref(false)
const uploadError = ref(null)
const pendingDelete = ref(null)
const fileInput = ref(null)

// IDs de PDFs seleccionados — compartido con el padre via v-model
const selectedFiles = defineModel('selectedFiles', { default: () => [] })
// Número total de PDFs — para que GameGrid pueda mostrar el tooltip
const pdfCount = defineModel('pdfCount', { default: 0 })

// ─── Carga inicial ────────────────────────────────────────────────────────────
onMounted(fetchPdfs)

async function fetchPdfs() {
    try {
        loading.value = true
        const res = await pdfService.listPdfs()
        pdfs.value = res.data
        pdfCount.value = pdfs.value.length
    } catch {
        pdfs.value = []
        pdfCount.value = 0
    } finally {
        loading.value = false
    }
}

// ─── Selección múltiple ───────────────────────────────────────────────────────
function toggleSelect(id) {
    if (selectedFiles.value.includes(id)) {
        selectedFiles.value = selectedFiles.value.filter(x => x !== id)
    } else {
        selectedFiles.value = [...selectedFiles.value, id]
    }
}

// ─── Subida de PDF ────────────────────────────────────────────────────────────
async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    uploadError.value = null
    uploading.value = true

    try {
        const res = await pdfService.uploadPdf(file)
        pdfs.value.unshift(res.data)
        pdfCount.value = pdfs.value.length
    } catch (err) {
        uploadError.value =
            err.response?.data?.error ?? 'Error al subir el PDF. Inténtalo de nuevo.'
    } finally {
        uploading.value = false
        if (fileInput.value) fileInput.value.value = ''
    }
}

// ─── Borrado ──────────────────────────────────────────────────────────────────
function confirmDelete(pdf) {
    pendingDelete.value = pdf
}

async function handleDelete() {
    if (!pendingDelete.value) return
    try {
        await pdfService.deletePdf(pendingDelete.value.id)
        selectedFiles.value = selectedFiles.value.filter(x => x !== pendingDelete.value.id)
        pdfs.value = pdfs.value.filter(p => p.id !== pendingDelete.value.id)
        pdfCount.value = pdfs.value.length
    } catch {
        // Error silencioso
    } finally {
        pendingDelete.value = null
    }
}

// ─── Navegación al juego ──────────────────────────────────────────────────────
function playSelected(game) {
    const query = { game }
    if (selectedFiles.value.length > 0) {
        query.pdfIds = selectedFiles.value.join(',')
    }
    router.push({ path: '/in-game-view/', query })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}
</script>
