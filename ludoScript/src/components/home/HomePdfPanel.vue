<template>
    <section class="flex flex-col gap-5 h-full">

        <!-- Cabecera -->
        <div class="flex items-center justify-between flex-shrink-0">
            <h3 class="text-lg font-semibold text-gray-50 font-righteous">Documentos</h3>

            <!-- Botón de subida compacto: solo visible cuando ya hay PDFs subidos -->
            <label v-if="!loading && pdfs.length > 0" :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                uploading
                    ? 'bg-indigo-400/60 text-white cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
            ]">
                <svg v-if="uploading" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" class="opacity-25" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {{ uploading ? 'Procesando...' : 'Subir apuntes' }}
                <input ref="fileInput" type="file" accept=".pdf,application/pdf" class="hidden" :disabled="uploading"
                    @change="handleFileChange" />
            </label>
        </div>

        <!-- Error de subida -->
        <div v-if="uploadError" class="flex-shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
            <p class="text-xs text-red-300">{{ uploadError }}</p>
            <button v-if="showTutorialFallbackCta" data-testid="tutorial-local-cta" @click="goToTutorialLocalMode"
                class="mt-2 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500">
                Practicar modo tutorial local
            </button>
        </div>
        <div v-else-if="uploading"
            class="flex-shrink-0 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
            <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                    <p class="text-xs font-semibold text-indigo-200">{{ uploadStatusTitle }}</p>
                    <p class="text-[11px] text-indigo-100/75 mt-0.5">{{ uploadStatusDescription }}</p>
                </div>
                <button @click="cancelUpload"
                    class="text-[11px] font-semibold text-rose-300 hover:text-rose-200 transition-colors">
                    Cancelar
                </button>
            </div>

            <div class="mt-2 h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                <div class="h-full rounded-full bg-indigo-400 transition-all duration-300"
                    :style="{ width: `${uploadProgressBar}%` }" />
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             SECCIÓN: PREDEFINIDOS
        ════════════════════════════════════════════════ -->
        <div class="flex flex-col gap-2 flex-shrink-0">
            <!-- Cabecera de categoría -->
            <div class="flex items-center gap-2 cursor-pointer select-none"
                @click="selectedPredefined = !selectedPredefined">
                <!-- Checkbox de categoría -->
                <div :class="[
                    'w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    selectedPredefined ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'
                ]">
                    <svg v-if="selectedPredefined" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Predefinidos</span>
            </div>

            <!-- Tarjeta del contenido predefinido -->
            <div :class="[
                'rounded-lg p-3 flex items-start gap-3 cursor-pointer transition-all ml-6',
                selectedPredefined
                    ? 'ring-2 ring-indigo-500 bg-indigo-500/10'
                    : 'bg-slate-700/60 border border-transparent hover:bg-slate-700/80'
            ]" @click="selectedPredefined = !selectedPredefined">
                <!-- Checkbox visual -->
                <div :class="[
                    'mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    selectedPredefined ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'
                ]">
                    <svg v-if="selectedPredefined" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-gray-100 font-medium text-sm">Tutorial local de programacion</p>
                    <p class="text-gray-400 text-xs mt-0.5">Fundamentos JS, arrays, funciones, objetos y asincronia</p>
                </div>
                <span
                    class="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Base
                </span>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             SECCIÓN: APUNTES SUBIDOS
        ════════════════════════════════════════════════ -->
        <div class="flex flex-col gap-2 flex-1 min-h-0">
            <!-- Cabecera de categoría -->
            <div class="flex items-center gap-2 flex-shrink-0"
                :class="pdfs.length > 0 ? 'cursor-pointer select-none' : ''"
                @click="pdfs.length > 0 && toggleAllUploaded()">
                <!-- Checkbox de categoría (solo activo si hay PDFs) -->
                <div :class="[
                    'w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    allUploadedSelected
                        ? 'bg-indigo-500 border-indigo-500'
                        : someUploadedSelected
                            ? 'bg-indigo-500/40 border-indigo-500/60'
                            : 'border-slate-500'
                ]">
                    <!-- Todos seleccionados: check -->
                    <svg v-if="allUploadedSelected" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    <!-- Algunos seleccionados: guión -->
                    <svg v-else-if="someUploadedSelected" class="w-2.5 h-2.5 text-white" fill="none"
                        viewBox="0 0 10 10">
                        <path d="M2 5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Apuntes</span>
            </div>

            <!-- Estado: cargando -->
            <div v-if="loading" class="flex justify-center py-4 ml-6">
                <span class="animate-spin text-indigo-400 text-xl">⏳</span>
            </div>

            <!-- Estado: sin archivos subidos -->
            <template v-else-if="pdfs.length === 0">
                <!-- Aviso tipo recordatorio -->
                <div
                    class="ml-6 flex items-start gap-2 bg-amber-950/60 border border-amber-500/30 rounded-lg px-3 py-2.5">
                    <span class="text-amber-400 text-sm flex-shrink-0 mt-0.5">💡</span>
                    <p class="text-xs italic text-amber-300/90 leading-relaxed">
                        Para repasar con tus propios apuntes, súbelos usando el botón de abajo.
                    </p>
                </div>

                <!-- Cuadrado grande de subida (solo cuando no hay nada) -->
                <label :class="[
                    'ml-6 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
                    'cursor-pointer transition-all duration-200 py-6',
                    uploading
                        ? 'border-indigo-400/50 bg-indigo-500/5 cursor-not-allowed'
                        : 'border-slate-600/70 hover:border-indigo-500/60 hover:bg-indigo-500/5'
                ]">
                    <span v-if="uploading" class="text-2xl animate-spin">⏳</span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-slate-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span class="text-xs font-medium text-slate-400">
                        {{ uploading ? 'Procesando con Gemini...' : 'Subir apuntes' }}
                    </span>
                    <input ref="fileInput" type="file" accept=".pdf,application/pdf" class="hidden"
                        :disabled="uploading" @change="handleFileChange" />
                </label>
            </template>

            <!-- Lista de PDFs subidos -->
            <ul v-else class="flex flex-col gap-2 overflow-y-auto flex-1 ml-6">
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
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <!-- Info del PDF -->
                    <div class="min-w-0 flex-1">
                        <p class="text-gray-100 font-medium text-sm truncate" :title="pdf.originalName">
                            {{ pdf.originalName }}
                        </p>
                        <p class="text-gray-400 text-xs mt-0.5">{{ formatDate(pdf.createdAt) }}</p>
                    </div>
                    <!-- Botón borrar -->
                    <button @click.stop="confirmDelete(pdf)"
                        class="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-1 leading-none"
                        title="Eliminar PDF">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6" />
                            <path d="M6.75 6l.8 11.2A2 2 0 0 0 9.54 19h4.92a2 2 0 0 0 1.99-1.8L17.25 6" />
                            <path d="M10 10.25v5.5" />
                            <path d="M14 10.25v5.5" />
                        </svg>
                    </button>
                    <!-- Botón guardar en la nube / indicador de guardado -->
                    <button v-if="pdfLocalStatus[pdf.id]?.hasLocal && !pdfLocalStatus[pdf.id]?.savedToCloud"
                        @click.stop="handleSaveToCloud(pdf)" :disabled="pdfLocalStatus[pdf.id]?.saving"
                        :title="pdfLocalStatus[pdf.id]?.saving ? 'Guardando...' : 'Guardar en la nube'"
                        class="flex-shrink-0 p-1 transition-all"
                        :class="pdfLocalStatus[pdf.id]?.saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 text-indigo-400 hover:text-indigo-300'">
                        <!-- Spinner mientras guarda -->
                        <svg v-if="pdfLocalStatus[pdf.id]?.saving" class="w-5 h-5 animate-spin" viewBox="0 0 24 24"
                            fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" class="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                class="opacity-75" />
                        </svg>
                        <!-- Nube con flecha hacia arriba -->
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="16 16 12 12 8 16" />
                            <line x1="12" y1="12" x2="12" y2="21" />
                            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                        </svg>
                    </button>
                    <span v-else-if="pdfLocalStatus[pdf.id]?.savedToCloud"
                        class="flex-shrink-0 text-emerald-400 p-1 leading-none" title="Guardado en la nube">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                            <path
                                d="M7 18.25h9.5a4.25 4.25 0 0 0 .6-8.46A5.5 5.5 0 0 0 6.44 8a4.75 4.75 0 0 0 .56 9.47Z" />
                        </svg>
                    </span>
                </li>
            </ul>
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { pdfService } from '@/api/pdf.service'
import {
    savePdfQuestionsToStorage,
    loadPdfQuestionsFromStorage,
    removePdfFromStorage,
    hasPdfInStorage,
    isPdfSavedToCloud,
    markPdfAsSavedToCloud,
} from '@/composables/useAdaptiveSelection'

// ─── Estado ──────────────────────────────────────────────────────────────────
const pdfs = ref([])
const loading = ref(true)
const uploading = ref(false)
const uploadError = ref(null)
const uploadFallbackMode = ref(null)
const uploadStage = ref('idle')
const uploadProgress = ref(0)
const uploadAbortController = ref(null)
const pendingDelete = ref(null)
const fileInput = ref(null)
const router = useRouter()
// Estado local por PDF: { [id]: { hasLocal, savedToCloud, saving, saveError } }
const pdfLocalStatus = ref({})

// IDs de PDFs seleccionados — compartido con el padre via v-model
const selectedFiles = defineModel('selectedFiles', { default: () => [] })
// Número total de PDFs — para que GameGrid pueda mostrar el tooltip
const pdfCount = defineModel('pdfCount', { default: 0 })
// Si el contenido predefinido está seleccionado — compartido con el padre via v-model
const selectedPredefined = defineModel('selectedPredefined', { default: true })

// ─── Estado del checkbox de categoría "Apuntes" ───────────────────────────────
const allUploadedSelected = computed(() =>
    pdfs.value.length > 0 && pdfs.value.every(p => selectedFiles.value.includes(p.id))
)

const someUploadedSelected = computed(() =>
    !allUploadedSelected.value && pdfs.value.some(p => selectedFiles.value.includes(p.id))
)

const uploadStatusTitle = computed(() => {
    if (uploadStage.value === 'uploading') {
        return `Subiendo archivo${uploadProgress.value ? ` (${uploadProgress.value}%)` : '...'}`
    }
    if (uploadStage.value === 'processing') {
        return 'Archivo enviado. Procesando con Gemini'
    }
    return ''
})

const uploadStatusDescription = computed(() => {
    if (uploadStage.value === 'uploading') {
        return 'Todavia se esta transfiriendo el PDF al backend.'
    }
    if (uploadStage.value === 'processing') {
        return 'La subida ya termino; ahora el servidor esta generando las preguntas y flashcards.'
    }
    return ''
})

const uploadProgressBar = computed(() => {
    if (uploadStage.value === 'processing') return 100
    return Math.max(6, uploadProgress.value || 0)
})

const showTutorialFallbackCta = computed(() => uploadFallbackMode.value === 'tutorial-local')

function toggleAllUploaded() {
    if (allUploadedSelected.value) {
        selectedFiles.value = []
    } else {
        selectedFiles.value = pdfs.value.map(p => p.id)
    }
}

// ─── Carga inicial ────────────────────────────────────────────────────────────
onMounted(fetchPdfs)

async function fetchPdfs() {
    try {
        loading.value = true
        const res = await pdfService.listPdfs()
        pdfs.value = res.data
        pdfCount.value = pdfs.value.length
        // Inicializar estado local leyendo localStorage para cada PDF
        pdfs.value.forEach(pdf => {
            pdfLocalStatus.value[pdf.id] = {
                hasLocal: hasPdfInStorage(pdf.id),
                savedToCloud: isPdfSavedToCloud(pdf.id),
                saving: false,
                saveError: null,
            }
        })
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
    uploadFallbackMode.value = null
    uploading.value = true
    uploadStage.value = 'uploading'
    uploadProgress.value = 0
    uploadAbortController.value = new AbortController()

    try {
        const res = await pdfService.uploadPdf(file, {
            signal: uploadAbortController.value.signal,
            timeout: 180000,
            onUploadProgress(progressEvent) {
                if (!progressEvent.total) return
                const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                uploadProgress.value = Math.min(100, percent)
                if (percent >= 100) {
                    uploadStage.value = 'processing'
                }
            },
        })
        const { id, originalName, createdAt, quizQuestions, flashCards } = res.data

        // Guardar las 50 preguntas y 20 flashcards en localStorage
        // y calcular 15 IDs activos aleatorios
        savePdfQuestionsToStorage(id, quizQuestions, flashCards)
        // La primera subida ya se guarda automáticamente en la nube (BD);
        // marcar el flag local para que no aparezca el icono de sincronización.
        markPdfAsSavedToCloud(id)

        pdfs.value.unshift({ id, originalName, createdAt })
        pdfCount.value = pdfs.value.length

        // Registrar estado local del nuevo PDF (ya guardado en nube desde el inicio)
        pdfLocalStatus.value[id] = {
            hasLocal: true,
            savedToCloud: true,
            saving: false,
            saveError: null,
        }

        // Auto-seleccionar el PDF recién subido
        selectedFiles.value = [id, ...selectedFiles.value]
    } catch (err) {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') {
            uploadError.value = 'La subida se canceló antes de terminar.'
        } else if (err.code === 'ECONNABORTED') {
            uploadError.value = 'La petición tardó demasiado. El archivo puede haberse enviado, pero el procesado no terminó a tiempo.'
        } else if (!err.response) {
            uploadError.value = 'No se pudo completar la conexión con el servidor durante la subida.'
        } else if (err.response?.data?.code === 'GEMINI_UNAVAILABLE') {
            uploadFallbackMode.value = err.response?.data?.fallbackMode ?? null
            uploadError.value = 'Ahora mismo no se pueden generar preguntas desde PDF. Puedes seguir practicando con el modo tutorial local.'
        } else {
            uploadError.value =
                err.response?.data?.error ?? 'Error al subir el PDF. Intentalo de nuevo.'
        }
    } finally {
        uploading.value = false
        uploadStage.value = 'idle'
        uploadProgress.value = 0
        uploadAbortController.value = null
        if (fileInput.value) fileInput.value.value = ''
    }
}

function cancelUpload() {
    uploadAbortController.value?.abort()
}

function goToTutorialLocalMode() {
    router.push({
        name: 'inGame',
        query: { game: 'Quiz', adaptive: 'true' },
    })
}

// ─── Borrado ──────────────────────────────────────────────────────────────────
function confirmDelete(pdf) {
    pendingDelete.value = pdf
}

async function handleDelete() {
    if (!pendingDelete.value) return
    const { id } = pendingDelete.value
    try {
        await pdfService.deletePdf(id)
        selectedFiles.value = selectedFiles.value.filter(x => x !== id)
        pdfs.value = pdfs.value.filter(p => p.id !== id)
        pdfCount.value = pdfs.value.length
        // Limpiar localStorage del PDF eliminado
        removePdfFromStorage(id)
        delete pdfLocalStatus.value[id]
    } catch {
        // Error silencioso
    } finally {
        pendingDelete.value = null
    }
}

// ─── Guardar en la nube ───────────────────────────────────────────────────────
async function handleSaveToCloud(pdf) {
    const status = pdfLocalStatus.value[pdf.id]
    if (!status?.hasLocal || status.saving) return

    const stored = loadPdfQuestionsFromStorage(pdf.id)
    if (!stored) return

    status.saving = true
    status.saveError = null
    try {
        await pdfService.saveToCloud(pdf.id, {
            quizQuestions: stored.questions,
            flashCards: stored.flashCards,
        })
        markPdfAsSavedToCloud(pdf.id)
        status.savedToCloud = true
    } catch {
        status.saveError = 'Error al guardar. Intentalo de nuevo.'
    } finally {
        status.saving = false
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}
</script>
