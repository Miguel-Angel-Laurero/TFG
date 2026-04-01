<template>
    <div class="w-full h-full p-4 overflow-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <!-- Columna izquierda: Banner + Avatar -->
            <div class="lg:col-span-7 flex flex-col gap-2 min-h-0">
                <Banner class="flex-shrink-0"/>
                <AvatarProfile class="flex-1 min-h-0"/>
            </div>

            <!-- Columna derecha: Estadísticas + gestión de PDFs -->
            <div class="lg:col-span-5 flex flex-col gap-4">
                <UserStats />
                <!-- Gestor de PDFs: permite subir documentos y jugar con el contenido generado -->
                <PdfManager />
            </div>
        </div>
    </div>
</template>
<script setup>
    import AvatarProfile from './AvatarProfile.vue';
    import Banner from './Banner.vue';
    import UserStats from './UserStats.vue';
    import PdfManager from './PdfManager.vue';
</script>