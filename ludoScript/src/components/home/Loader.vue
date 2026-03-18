<template>
    <div class="bg-gray-200 rounded-xl gap-4 mx-6 mt-6 p-4">
        <h1 class="font-bold">Subida de Archivos</h1>
        <span>Carga tus documentos y empieza a aprender</span>
        <Toast />
        <div class="card flex flex-wrap gap-6 items-center justify-between">
            <FileUpload ref="fileupload" mode="basic" name="demo[]" url="/api/upload" accept="image/*" :maxFileSize="1000000" @upload="onUpload" />
            <Button label="Upload" @click="upload" severity="secondary" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import FileUpload from 'primevue/fileupload';
const toast = useToast();
const fileupload = ref();

const upload = () => {
    fileupload.value.upload();
};

const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
};
</script>
