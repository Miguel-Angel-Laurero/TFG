---
name: ui-component
description: "Implementa un componente Vue 3 con Tailwind CSS aplicando heurísticas de usabilidad (Nielsen): loading skeleton, estado vacío, mensajes de error, feedback inmediato. USA CUANDO: 'crea el componente', 'diseña la interfaz', 'implementa la pantalla', 'hazlo con buena usabilidad'. PRODUCE: componente Vue completo listo para usar."
---

# UI Component (Nielsen Usability Heuristics)

Implementa componentes Vue 3 + Tailwind CSS aplicando los 10 principios de usabilidad de Nielsen.

## Cuándo se activa

- "implementa el diseño", "crea el componente", "programa la pantalla"
- "hazlo siguiendo Nielsen", "con buena usabilidad"
- Cualquier petición de construir un componente nuevo de UI

## Procedimiento

### 1. Aplicar checklist de Nielsen antes de codificar

| # | Heurística | Pregunta clave |
|---|-----------|---------------|
| 1 | **Visibilidad del estado** | ¿El usuario sabe qué está pasando? (loaders, progreso) |
| 2 | **Coincidencia mundo real** | ¿Iconos/términos familiares para el usuario? |
| 3 | **Control y libertad** | ¿Puede cancelar, deshacer o salir? |
| 4 | **Consistencia** | ¿Mismo estilo visual que el resto de la app? |
| 5 | **Prevención de errores** | ¿Validaciones/confirmaciones antes de acciones críticas? |
| 6 | **Reconocimiento vs memoria** | ¿Sugerencias, labels visibles, opciones predefinidas? |
| 7 | **Flexibilidad y eficiencia** | ¿Usuarios avanzados pueden actuar más rápido? |
| 8 | **Diseño minimalista** | ¿Eliminado lo que no aporta valor? |
| 9 | **Recuperación de errores** | ¿Mensajes de error en lenguaje humano con solución? |
| 10 | **Ayuda y documentación** | ¿Tooltips, placeholders, textos de apoyo en flujos complejos? |

### 2. Stack y reglas de implementación

- Vue 3 `<script setup>`, Composition API
- Tailwind CSS (dark theme: `bg-gray-900`, `bg-gray-800`, texto `text-white`/`text-gray-300`)
- Pinia para estado global si es necesario
- Componentes PrimeVue si encajan mejor que HTML nativo

### 3. Estados obligatorios del componente

```vue
<template>
  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-8">
    <ProgressSpinner />
  </div>

  <!-- Error -->
  <div v-else-if="error" class="text-center py-8">
    <i class="pi pi-exclamation-triangle text-red-400 text-2xl mb-2" />
    <p class="text-red-400 mb-4">{{ error }}</p>
    <Button label="Reintentar" @click="retry" severity="secondary" />
  </div>

  <!-- Vacío -->
  <div v-else-if="!items.length" class="text-center py-8">
    <i class="pi pi-inbox text-gray-500 text-3xl mb-2" />
    <p class="text-gray-400 mb-2">No hay elementos todavía.</p>
    <p class="text-gray-500 text-sm">Crea tu primer elemento para empezar.</p>
  </div>

  <!-- Datos -->
  <div v-else>
    <!-- contenido -->
  </div>
</template>
```

### 4. Decisiones de diseño obligatorias

- **Estados de carga**: skeleton loader o spinner, nunca pantalla en blanco
- **Estado vacío**: mensaje descriptivo con acción sugerida
- **Estado de error**: mensaje en lenguaje humano + botón de reintento
- **Feedback inmediato**: confirmaciones visuales tras acciones (≤100ms)
- **Jerarquía visual**: un único elemento de mayor peso visual por sección
- **Contraste**: texto principal ≥ 4.5:1, secundario ≥ 3:1

### 5. Checklist de salida

- [ ] H1 — Feedback de carga/éxito/error en cada acción asíncrona
- [ ] H2 — Iconos y textos en lenguaje del dominio del usuario
- [ ] H3 — Botón de cancelar/salir en flujos de más de 1 paso
- [ ] H4 — Estilo coherente con la app (dark theme, bordes, tipografía)
- [ ] H5 — Acciones destructivas piden confirmación
- [ ] H6 — Campos de formulario con labels visibles y placeholders
- [ ] H7 — Acciones principales accesibles en 1-2 clicks
- [ ] H8 — Sin información decorativa que compita con contenido útil
- [ ] H9 — Errores de validación indican qué falló y cómo corregirlo
- [ ] H10 — Flujos no obvios tienen tooltip o texto de ayuda
