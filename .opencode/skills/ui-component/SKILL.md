---
name: ui-component
description: "Implementa un componente Vue 3 con Tailwind CSS + PrimeVue, aplicando heurísticas de usabilidad (Nielsen) + estados loading/empty/error + componentes reutilizables del proyecto. USA CUANDO: 'crea el componente', 'diseña la interfaz', 'implementa la pantalla', 'hazlo con buena usabilidad'. PRODUCE: componente Vue completo."
---

# UI Component (Nielsen + componentes del proyecto)

Implementa componentes Vue 3 con los 10 principios de usabilidad de Nielsen, el stack del proyecto y los componentes reutilizables existentes.

> 📖 Convenciones del proyecto: `frontend-conventions.md` (patrón vista, consumo de stores, estilos dark theme).

## Cuándo se activa

- "implementa el diseño / crea el componente / programa la pantalla"
- "hazlo con buena usabilidad / siguiendo Nielsen"
- Cualquier nuevo componente de UI

## 0. Componentes reutilizables del proyecto

Antes de crear HTML propio, comprobar si existe un componente ya hecho:

| Componente | Ubicación |
|---|---|
| `Header` | `components/shared/Header.vue` |
| `Footer` | `components/shared/Footer.vue` |
| `FooterNoLogin` | `components/shared/FooterNoLogin.vue` |
| `Menu` | `components/shared/Menu.vue` |
| `ConfirmModal` | `components/clase/ConfirmModal.vue` |
| `Loading` | `components/shared/Loading.vue` |

Componentes PrimeVue más usados: `Button`, `InputText`, `Card`, `Dialog`, `Toast`, `DataTable`, `ProgressSpinner`, `ConfirmDialog`, `InputNumber`, `Textarea`, `Dropdown`, `Avatar`, `Badge`.

## 1. Checklist de Nielsen (antes de codificar)

| # | Heurística | Pregunta clave |
|---|-----------|---------------|
| 1 | **Visibilidad del estado** | ¿Loading skeleton / spinner / progreso visible? |
| 2 | **Coincidencia mundo real** | ¿Iconos y términos familiares para el alumno? |
| 3 | **Control y libertad** | ¿Botón de cancelar/salir en flujos > 1 paso? |
| 4 | **Consistencia** | ¿Mismo estilo que el resto (dark theme, bordes, tipografía)? |
| 5 | **Prevención de errores** | ¿Confirmación antes de acciones destructivas? |
| 6 | **Reconocimiento vs memoria** | ¿Labels visibles, placeholders, opciones predefinidas? |
| 7 | **Flexibilidad y eficiencia** | ¿Acciones principales en 1-2 clicks? |
| 8 | **Diseño minimalista** | ¿Sin info decorativa que compita con contenido útil? |
| 9 | **Recuperación de errores** | ¿Mensaje en lenguaje humano con solución? |
| 10 | **Ayuda y documentación** | ¿Tooltips / textos de ayuda en flujos complejos? |

## 2. Estados obligatorios del componente

```vue
<template>
  <div v-if="loading" class="flex justify-center py-8">
    <ProgressSpinner />
  </div>

  <div v-else-if="error" class="text-center py-8">
    <i class="pi pi-exclamation-triangle text-red-400 text-2xl mb-2" />
    <p class="text-red-400 mb-4">{{ error }}</p>
    <Button label="Reintentar" @click="retry" severity="secondary" />
  </div>

  <div v-else-if="!items.length" class="text-center py-8">
    <i class="pi pi-inbox text-gray-500 text-3xl mb-2" />
    <p class="text-gray-400 mb-2">No hay elementos todavía.</p>
  </div>

  <div v-else><!-- contenido --></div>
</template>
```

## 3. Reglas de implementación

- Vue 3 `<script setup>`, Composition API (nunca Options API)
- Tailwind dark theme: `bg-gray-900`, `bg-gray-800`, texto `text-white`/`text-gray-300`
- PrimeVue 4 para inputs, tablas, diálogos, botones
- Estados: loading (skeleton/spinner), vacío (mensaje + acción), error (mensaje + reintento)
- Feedback inmediato visual tras acciones (toast, cambio de estado)
- Jerarquía visual: 1 elemento principal de mayor peso por sección
- Contraste: texto principal ≥ 4.5:1, secundario ≥ 3:1
- Acceso a store: `storeToRefs()` para estado reactivo, acciones desestructuradas directamente

## Checklist de salida

- [ ] H1 — Feedback de carga/éxito/error en cada acción asíncrona
- [ ] H2 — Iconos y textos en lenguaje del dominio educativo
- [ ] H3 — Botón cancelar/salir en flujos multi-paso
- [ ] H4 — Estilo coherente (dark theme, PrimeVue, Tailwind)
- [ ] H5 — Acciones destructivas piden confirmación (usar `ConfirmModal` o `ConfirmDialog`)
- [ ] H6 — Campos con labels visibles y placeholders
- [ ] H7 — Acciones principales en 1-2 clicks
- [ ] H8 — Sin decoración que compita con contenido útil
- [ ] H9 — Errores de validación indican qué falló y cómo corregirlo
- [ ] H10 — Tooltip o texto de ayuda en flujos no obvios
- [ ] Se reutilizaron componentes existentes cuando fue posible
