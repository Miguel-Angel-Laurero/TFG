<template>
  <main class="h-full w-full flex overflow-hidden">

    <!-- Center: centered in the non-heatmap space -->
    <section class="flex-1 flex justify-center overflow-y-auto py-8">
      <div class="w-full max-w-2xl px-8">
        <h2 class="text-2xl font-righteous text-white mb-6">Minijuegos</h2>
        <GameGrid />

        <!-- Upload PDF -->
        <div class="mt-8">
          <h2 class="text-2xl font-righteous text-white mb-4">Subir PDF</h2>
          <p class="text-sm text-gray-400 mb-4">
            Sube un PDF y generaremos automáticamente preguntas de Quiz y Flashcards con IA.
          </p>

          <input ref="fileInput" type="file" accept=".pdf,application/pdf" class="hidden" @change="handleFileChange" />

          <button :disabled="uploading"
            class="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            @click="fileInput.click()">
            <span v-if="uploading">⏳ Procesando…</span>
            <span v-else>📄 Subir PDF</span>
          </button>

          <p v-if="uploadError" class="mt-3 text-sm text-red-400">{{ uploadError }}</p>
          <p v-if="uploadSuccess" class="mt-3 text-sm text-green-400">{{ uploadSuccess }}</p>
        </div>
      </div>
    </section>

    <!-- Right panel: category heat maps -->
    <aside class="w-80 shrink-0 border-l border-blue-900/40 px-6 py-8 overflow-y-auto">
      <CategoryHeatMap />
    </aside>
  </main>
</template>
<script setup>
import { ref } from 'vue'
import GameGrid from '@/components/home/GameGrid.vue'
import CategoryHeatMap from '@/components/home/CategoryHeatMap.vue'
import { pdfService } from '@/api/pdf.service'

const fileInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadError.value = ''
  uploadSuccess.value = ''
  uploading.value = true

  try {
    const { data } = await pdfService.uploadPdf(file)
    uploadSuccess.value = `"${data.originalName}" procesado correctamente.`
  } catch (err) {
    uploadError.value = err.response?.data?.error ?? 'Error al subir el PDF. Inténtalo de nuevo.'
  } finally {
    uploading.value = false
    // Resetea el input para permitir subir el mismo archivo otra vez
    event.target.value = ''
  }
}
</script>