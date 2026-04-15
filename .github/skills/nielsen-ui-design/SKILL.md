---
name: nielsen-ui-design
description: "**UI IMPLEMENTATION SKILL** — Implementa el diseño que el usuario ha pedido previamente aplicando los 10 principios de usabilidad de Nielsen. USA CUANDO: el usuario pida codificar, programar, crear o implementar un componente Vue, pantalla, vista o sección de UI; o diga 'hazlo siguiendo Nielsen', 'implementa el diseño', 'crea el componente', 'diseña la interfaz', 'construye la pantalla', 'aplica usabilidad'. NO USAR PARA: refactoring puro sin cambio de diseño; lógica de negocio sin UI; corrección de bugs que no afecten UX. PRODUCE: un componente Vue con Tailwind CSS listo para usar, con checklist de heurísticas verificadas."
argument-hint: "Describe el componente o pantalla a implementar, o simplemente escribe 'usa el diseño que pedí antes'"
---

# Nielsen UI Design

Implementa interfaces de usuario en Vue 3 + Tailwind CSS aplicando sistemáticamente los 10 principios de usabilidad de Nielsen sobre el diseño que el usuario ha pedido en la conversación.

## Cuándo se activa esta skill

- El usuario pide "implementa el diseño", "crea el componente", "programa la pantalla"
- El usuario menciona explícitamente "Nielsen" o "usabilidad"
- El usuario tiene un wireframe, boceto o descripción de UI y quiere que se convierta en código
- Cualquier petición de construir un componente nuevo de la interfaz

## Procedimiento

### 1. Recuperar el diseño del contexto

Lee la petición anterior del usuario en la conversación. Identifica:

- Qué componente o pantalla se quiere construir
- Qué datos o props necesita
- En qué vista o parte del proyecto encaja (consulta `ludoScript/src/` si es necesario)

### 2. Aplicar el checklist de Nielsen ANTES de escribir código

Antes de generar el componente, planifica cómo se aplica cada heurística. Para cada una, anota en un comentario breve qué decisión de diseño la satisface o la descarta si no aplica:

| #   | Heurística                                     | Pregunta clave para este componente                                           |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | **Visibilidad del estado del sistema**         | ¿El usuario sabe qué está pasando? (loaders, confirmaciones, progreso)        |
| 2   | **Coincidencia con el mundo real**             | ¿Uso iconos/términos que el usuario ya conoce?                                |
| 3   | **Control y libertad del usuario**             | ¿Puede cancelar, deshacer o salir de cualquier flujo?                         |
| 4   | **Consistencia y estándares**                  | ¿Sigo el mismo estilo visual que el resto de la app?                          |
| 5   | **Prevención de errores**                      | ¿Hay validaciones, confirmaciones o advertencias antes de acciones críticas?  |
| 6   | **Reconocimiento en vez de memoria**           | ¿Ofrezco sugerencias, labels visibles, opciones predefinidas?                 |
| 7   | **Flexibilidad y eficiencia**                  | ¿Los usuarios avanzados pueden actuar más rápido? (atajos, acciones directas) |
| 8   | **Diseño estético y minimalista**              | ¿Elimino elementos que no aportan valor? ¿Hay jerarquía visual clara?         |
| 9   | **Ayuda a reconocer y recuperarse de errores** | ¿Los mensajes de error son en lenguaje humano y dicen cómo resolverlo?        |
| 10  | **Ayuda y documentación**                      | ¿Los flujos complejos tienen tooltips, placeholders o textos de apoyo?        |

### 3. Implementar el componente

Sigue estas reglas de implementación:

**Stack del proyecto:**

- Vue 3 con `<script setup>` y Composition API
- Tailwind CSS para estilos (sin CSS adicional salvo overrides imposibles en Tailwind)
- Pinia para estado global si el componente lo requiere
- Componentes PrimeVue disponibles si encajan mejor que HTML nativo

**Estructura del componente:**

```vue
<template>
  <!-- Markup semántico con aria-* donde corresponda (accesibilidad básica) -->
</template>

<script setup>
// Props, emits, composables, lógica reactiva
</script>

<!-- <style scoped> solo si hay :deep() necesarios o animaciones no expresables con Tailwind -->
```

**Decisiones de diseño obligatorias:**

- **Estados de carga** (`v-if="loading"`): skeleton loader o spinner, nunca pantalla en blanco
- **Estado vacío** (`v-if="!data.length"`): mensaje descriptivo con acción sugerida
- **Estado de error**: mensaje en lenguaje humano + botón de reintento
- **Feedback inmediato**: confirmaciones visuales tras acciones del usuario (≤100ms)
- **Jerarquía visual**: un único elemento de mayor peso visual por sección
- **Contraste**: texto principal ≥ 4.5:1, secundario ≥ 3:1 (verificar clases Tailwind)

### 4. Verificación final (checklist de salida)

Antes de entregar el código, confirmar:

- [ ] H1 — Hay feedback de carga/éxito/error en cada acción asíncrona
- [ ] H2 — Iconos y textos usan el lenguaje del dominio del usuario
- [ ] H3 — Existe botón/acción de cancelar o salir en flujos de más de 1 paso
- [ ] H4 — El estilo es coherente con el resto de la app (dark theme, bordes, tipografía)
- [ ] H5 — Las acciones destructivas piden confirmación
- [ ] H6 — Los campos de formulario tienen labels visibles y placeholders útiles
- [ ] H7 — Las acciones principales son accesibles con 1-2 clicks desde cualquier punto
- [ ] H8 — No hay información decorativa que compita con el contenido útil
- [ ] H9 — Los errores de validación indican exactamente qué falló y cómo corregirlo
- [ ] H10 — Los flujos no obvios tienen tooltip, texto de ayuda o placeholder explicativo

### 5. Entregar

- Provee el archivo completo listo para copiar/pegar o crear con `create_file`
- Si el componente requiere cambios en el router o store, menciónalos brevemente
- Indica qué heurísticas fueron los cambios más significativos respecto a un diseño naïve

## Referencias

- [Nielsen's 10 Heuristics — UX247](https://ux247.com/usability-principles/)
- [Nielsen Norman Group — original](https://www.nngroup.com/articles/ten-usability-heuristics/)
