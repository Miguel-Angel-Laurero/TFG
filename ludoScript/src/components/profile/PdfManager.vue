<template>
  <section class="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 w-full flex flex-col gap-4">

    <!-- Cabecera: título + botón de subida -->
    <div class="flex items-center justify-between flex-shrink-0">
      <h3 class="text-lg font-semibold text-gray-50">Mis PDFs</h3>

      <!-- Label actúa como botón; el input real está oculto -->
      <label
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer',
          uploading
            ? 'bg-indigo-400 text-white cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        ]"
      >
        <!-- Spinner mientras Gemini procesa el PDF -->
        <span v-if="uploading" class="animate-spin text-base">⏳</span>
        <span v-else>＋</span>
        {{ uploading ? 'Procesando…' : 'Subir PDF' }}

        <!-- Input oculto: solo acepta PDFs, deshabilitado mientras hay uno en curso -->
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          class="hidden"
          :disabled="uploading"
          @change="handleFileChange"
        />
      </label>
    </div>

    <!-- Aviso de procesado largo: Gemini puede tardar 5-15 segundos con un PDF -->
    <p v-if="uploading" class="text-sm text-indigo-300 text-center animate-pulse">
      Gemini está generando preguntas y flashcards a partir de tu PDF…
    </p>

    <!-- Error de subida -->
    <p v-if="uploadError" class="text-sm text-red-400 text-center">
      {{ uploadError }}
    </p>

    <!-- Estado vacío: el usuario no tiene PDFs todavía -->
    <div
      v-if="!loading && pdfs.length === 0"
      class="flex flex-col items-center justify-center py-8 text-gray-400 gap-2"
    >
      <span class="text-4xl">📄</span>
      <p class="text-sm">Sube un PDF para generar preguntas de Quiz y Flashcards</p>
    </div>

    <!-- Loader inicial al montar el componente -->
    <div v-else-if="loading" class="flex justify-center py-6">
      <span class="animate-spin text-indigo-400 text-2xl">⏳</span>
    </div>

    <!-- Lista de PDFs -->
    <ul v-else class="flex flex-col gap-3 overflow-y-auto max-h-72">
      <li
        v-for="pdf in pdfs"
        :key="pdf.id"
        class="bg-slate-700/60 rounded-lg p-4 flex flex-col gap-3"
      >
        <!-- Nombre del PDF + fecha de subida -->
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-gray-100 font-medium text-sm truncate" :title="pdf.originalName">
              {{ pdf.originalName }}
            </p>
            <p class="text-gray-400 text-xs mt-0.5">
              {{ formatDate(pdf.createdAt) }}
            </p>
          </div>

          <!-- Botón eliminar -->
          <button
            @click="confirmDelete(pdf)"
            class="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors text-sm font-semibold"
            title="Eliminar PDF"
          >
            🗑
          </button>
        </div>

        <!-- Botones de juego: redirigen al minijuego pasando el pdfId -->
        <div class="flex gap-2">
          <button
            @click="playGame('Quiz', pdf.id)"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            🎯 Jugar Quiz
          </button>
          <button
            @click="playGame('Flashcards', pdf.id)"
            class="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            🃏 Flashcards
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal de confirmación de borrado -->
    <div
      v-if="pendingDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="pendingDelete = null"
    >
      <div class="bg-slate-800 rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4">
        <p class="text-gray-100 text-sm text-center">
          ¿Eliminar <span class="font-semibold">{{ pendingDelete.originalName }}</span>?
          <br/>
          <span class="text-gray-400 text-xs">Se borrarán también las preguntas generadas.</span>
        </p>
        <div class="flex gap-3">
          <button
            @click="pendingDelete = null"
            class="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter }      from 'vue-router'
import { pdfService }     from '@/api/pdf.service'

const router = useRouter()

// ─── Estado ──────────────────────────────────────────────────────────────────
const pdfs        = ref([])   // Lista de PDFs del usuario (solo metadata)
const loading     = ref(true) // Carga inicial al montar el componente
const uploading   = ref(false) // Procesado de un PDF nuevo con Gemini
const uploadError = ref(null)  // Mensaje de error de la última subida
const pendingDelete = ref(null) // PDF que el usuario quiere eliminar (modal)
const fileInput   = ref(null)  // Referencia al input file para resetear su valor

// ─── Carga inicial ───────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchPdfs()
})

// Obtiene la lista de PDFs del usuario y la almacena en pdfs.value
async function fetchPdfs() {
  try {
    loading.value = true
    const res = await pdfService.listPdfs()
    pdfs.value = res.data
  } catch {
    // Si falla la carga, dejamos la lista vacía; no mostramos error crítico
    pdfs.value = []
  } finally {
    loading.value = false
  }
}

// ─── Subida de PDF ───────────────────────────────────────────────────────────
// Se llama cuando el usuario selecciona un archivo en el input
async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadError.value = null
  uploading.value   = true

  try {
    // Llama al backend: multer recibe el archivo → Gemini genera contenido → BD guarda el resultado
    const res = await pdfService.uploadPdf(file)

    // Añade el nuevo PDF al inicio de la lista sin recargar toda la lista
    pdfs.value.unshift(res.data)
  } catch (err) {
    // Muestra el mensaje de error que devuelve el backend, o uno genérico
    uploadError.value =
      err.response?.data?.error ?? 'Error al subir el PDF. Inténtalo de nuevo.'
  } finally {
    uploading.value = false
    // Resetea el input para que el usuario pueda volver a subir el mismo archivo
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ─── Borrado ─────────────────────────────────────────────────────────────────
// Abre el modal de confirmación antes de borrar
function confirmDelete(pdf) {
  pendingDelete.value = pdf
}

// Ejecuta el borrado tras confirmar en el modal
async function handleDelete() {
  if (!pendingDelete.value) return
  try {
    await pdfService.deletePdf(pendingDelete.value.id)
    // Elimina el PDF de la lista local sin necesidad de recargar
    pdfs.value = pdfs.value.filter(p => p.id !== pendingDelete.value.id)
  } catch {
    // Error silencioso: el PDF seguirá mostrándose si el borrado falla
  } finally {
    pendingDelete.value = null
  }
}

// ─── Navegación al juego ─────────────────────────────────────────────────────
// Redirige al minijuego correspondiente pasando el pdfId como query param.
// useActivitySession en Quiz.vue / FlashCard.vue lo detectará y usará la API.
function playGame(game, pdfId) {
  router.push({ path: '/in-game-view/', query: { game, pdfId } })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Formatea la fecha ISO a un formato legible en español
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
</script>
