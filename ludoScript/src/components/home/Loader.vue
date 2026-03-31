<template>
    <div class="loader-card h-full rounded-xl p-6 flex flex-col gap-5">
        
        <!-- Header -->
        <div>
            <h1 class="text-white font-bold text-lg">Subida de Archivos</h1>
            <span class="text-slate-400 text-sm">Carga tus documentos y empieza a aprender</span>
        </div>

        <Toast />

        <!-- Prompt opcional -->
        <div>
            <label class="text-slate-400 text-xs mb-1 block">Instrucción para Gemini <span class="text-slate-600">(opcional)</span></label>
            <textarea
                v-model="userPrompt"
                rows="2"
                placeholder="Ej: Extrae las preguntas y respuestas de este documento en formato JSON"
                class="prompt-input w-full rounded-lg px-3 py-2 text-sm text-slate-200 resize-none"
            />
        </div>

        <!-- Drop Zone -->
        <div
            class="drop-zone flex-1 rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
            :class="{ 'border-green-400 bg-green-400/5': isDragging, 'hover:border-slate-400': !isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
        >
            <input ref="hiddenInput" type="file" class="hidden" @change="onFileChange" />

            <template v-if="!selectedFile">
                <div class="upload-icon-wrap rounded-2xl p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                </div>
                <div class="text-center">
                    <p class="text-slate-300 text-sm font-medium">Arrastra tu archivo aquí</p>
                    <p class="text-slate-500 text-xs mt-1">o haz clic para explorar</p>
                </div>
            </template>

            <!-- Preview -->
            <template v-else>
                <div class="file-preview flex flex-col items-center gap-2">
                    <div class="file-icon-wrap rounded-xl p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <p class="text-slate-200 text-sm font-semibold text-center px-2 truncate max-w-[160px]">{{ selectedFile.name }}</p>
                    <p class="text-slate-500 text-xs">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
                    <button class="text-xs text-slate-500 hover:text-red-400 transition-colors" @click.stop="clearFile">✕ Quitar</button>
                </div>
            </template>
        </div>

        <!-- Upload Button -->
        <button
            class="upload-btn w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
            :disabled="!selectedFile || isUploading"
            @click="upload"
        >
            <span v-if="isUploading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Subiendo...
            </span>
            <span v-else>Subir archivo</span>
        </button>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

const toast = useToast();
const hiddenInput = ref();
const selectedFile = ref(null);
const isDragging = ref(false);
const isUploading = ref(false);
const userPrompt = ref('');

const triggerFileInput = () => hiddenInput.value.click();

const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) selectedFile.value = file;
};

const onDrop = (e) => {
    isDragging.value = false;
    const file = e.dataTransfer.files[0];
    if (file) selectedFile.value = file;
};

const clearFile = () => {
    selectedFile.value = null;
    hiddenInput.value.value = '';
};

const upload = async () => {
    if (!selectedFile.value) return;

    isUploading.value = true;

    const formData = new FormData();
    formData.append('file', selectedFile.value);
    if (userPrompt.value.trim()) {
        formData.append('prompt', userPrompt.value.trim());
    }

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            toast.add({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 });
        } else {
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo procesado correctamente', life: 3000 });
            console.log('Respuesta de Gemini:', result.data);
            clearFile();
            userPrompt.value = '';
        }
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión', life: 3000 });
    } finally {
        isUploading.value = false;
    }
};
</script>

<style scoped>
.loader-card {
    background: #101029;
    border: 1px solid #2a2a6a;
}

.drop-zone {
    min-height: 160px;
    background: rgba(228, 228, 228, 0.02);
}

.upload-icon-wrap {
    background: rgba(91, 79, 207, 0.15);
}

.file-icon-wrap {
    background: rgba(124, 111, 239, 0.15);
}

.upload-btn {
    background: #00e5a0;
    color: #0f0f2e;
}

.upload-btn:hover:not(:disabled) {
    background: #00c98a;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 229, 160, 0.3);
}

.upload-btn:disabled {
    background: #2a2a6a;
    color: #555588;
    cursor: not-allowed;
}

.prompt-input {
    background: rgba(228, 228, 228, 0.04);
    border: 1px solid #2a2a6a;
    transition: border-color 0.2s;
}

.prompt-input:focus {
    outline: none;
    border-color: #5b4fcf;
}
</style>