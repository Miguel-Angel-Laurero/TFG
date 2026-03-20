<template>
    <div class="bg-gray-200 rounded-xl gap-4 mx-6 mt-6 p-4">
        <h1 class="font-bold">Subida de Archivos</h1>
        <span>Carga tus documentos y empieza a aprender</span>
        <Toast />
        <div class="card flex flex-wrap gap-6 items-center justify-between">
            <FileUpload 
                ref="fileupload" 
                mode="basic" 
                name="demo[]"
                accept="image/*" 
                :maxFileSize="1000000"
                :auto="false"
            />
            <Button label="Upload" @click="upload" severity="secondary" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import FileUpload from 'primevue/fileupload';
import { Button } from 'primevue';

const toast = useToast();
const fileupload = ref();

const upload = async () => {
    const file = fileupload.value.files[0];

    if (!file) {
        toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecciona un archivo primero', life: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (!response.ok) {
        toast.add({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 });
    } else {
        toast.add({ severity: 'success', summary: 'Éxito', detail: result.message, life: 3000 });
    }
};
</script>