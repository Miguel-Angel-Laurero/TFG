---
mode: agent
description: "Crea una feature full-stack completa: backend + service + store + vista + componentes + ruta"
---

Crea una nueva feature vertical completa en LudoScript (backend + frontend) siguiendo las convenciones del proyecto.

## Datos de la feature

**Nombre de la feature:** ${input:nombre:Nombre en camelCase, ej: invoices, reportCards, studySession}

**Descripción:** ${input:descripcion:Qué hace esta feature, qué problema resuelve para el usuario}

**Datos que gestiona:** ${input:datos:Qué entidades o información maneja, ej: lista de facturas con importe y fecha}

**¿Necesita nueva entrada en el menú lateral?** ${input:menu:yes / no — si yes, indica el label e icono PrimeVue (pi pi-xxx)}

**¿Afecta a usuarios no autenticados?** ${input:auth:no — solo usuarios autenticados / yes — también accesible sin login}

**Notas adicionales:** ${input:notas:Restricciones, dependencias con otras features, comportamientos especiales — deja vacío si no hay}

---

Aplica el skill `new-feature-vertical` para:

1. Analizar si ya existen archivos relacionados antes de crearlos
2. Generar el plan completo de archivos (crear/modificar)
3. Implementar cada capa en el orden correcto (backend → service → store → UI → router)
