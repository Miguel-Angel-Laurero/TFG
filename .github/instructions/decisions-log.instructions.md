---
description: "Registro de decisiones técnicas de LudoScript: decisiones ya tomadas y el motivo. Se carga en TODA conversación para que el agente no contradiga decisiones previas ni repita análisis ya hechos. ACTUALIZAR este archivo cuando se tome una nueva decisión técnica relevante."
applyTo: "**"
---

# Registro de decisiones técnicas — LudoScript

> Estas decisiones están tomadas. No proponer alternativas ni cuestionarlas salvo que el usuario lo pida explícitamente.

---

## Base de datos

| Decisión                                                               | Motivo                                                                                                                                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MySQL en desarrollo, PostgreSQL en producción (Render)**             | MySQL es más fácil de instalar localmente en Windows. PostgreSQL es el estándar en Render y lo que se usará en producción. `sequelize.sync({ alter: true })` abstrae las diferencias. |
| **`sequelize.sync({ alter: true })` en dev, sin migraciones manuales** | El proyecto es un TFG en desarrollo activo. Gestionar migraciones añade complejidad sin beneficio real en esta fase. En producción se revisará antes del deploy.                      |
| **1 grupo por usuario** (`GroupMember` tiene unique en `userId`)       | Simplifica el sistema de clases para el alcance del TFG. Un estudiante pertenece a una sola clase a la vez, igual que en un instituto real.                                           |
| **`inviteCode` de 8 caracteres único en grupos**                       | Suficientemente corto para compartir verbalmente, suficientemente único para evitar colisiones en el volumen de grupos esperado.                                                      |

---

## Autenticación y seguridad

| Decisión                                                                       | Motivo                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JWT en `localStorage`** (no en cookie httpOnly)                              | La app es una SPA sin SSR (Vite). Implementar httpOnly cookies requeriría configuración de CORS con `credentials: true` y ajustes en Render/Vercel. El riesgo XSS se mitiga con sanitización de inputs y sin `eval`. |
| **Token se inyecta vía interceptor de Axios** (no manualmente en cada llamada) | Centraliza la lógica de autenticación. Si se cambia el mecanismo, se toca un solo lugar.                                                                                                                             |
| **`req.user = { id, role }` inyectado por `authMiddleware`**                   | Patrón estándar de Express. El id del usuario autenticado siempre viene del token, nunca del body (previene spoofing).                                                                                               |

---

## Frontend — Estado y arquitectura

| Decisión                                                                          | Motivo                                                                                                                                                                      |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pinia con Setup Store** (no Options Store)                                      | Más consistente con la Composition API de Vue 3. Mejor soporte para TypeScript si se migra en el futuro. Más fácil de testear con mocks.                                    |
| **`loading` y `error` en todos los stores**                                       | Permite que cualquier componente muestre estados de carga y error sin lógica adicional. Patrón acordado para toda la app.                                                   |
| **Las acciones del store devuelven `null` en error** (en vez de lanzar excepción) | Evita que el componente tenga que manejar try/catch. El componente comprueba `if (!result)` y muestra el `store.error`.                                                     |
| **No usar `async` directamente en `<script setup>`** — usar `onMounted`           | Evita bloquear el montaje del componente. Los datos asíncronos se cargan después del primer render.                                                                         |
| **`storeToRefs` para estado reactivo del store**                                  | Desestructurar directamente del store rompe la reactividad. `storeToRefs` mantiene la referencia reactiva. Las acciones se desestructuran directamente (sin `storeToRefs`). |

---

## Frontend — Estilos y UI

| Decisión                                                                        | Motivo                                                                                                                                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tailwind CSS para layout y utilidades + PrimeVue para componentes complejos** | Tailwind es rápido para prototipar y da control total sobre el diseño. PrimeVue aporta componentes accesibles y complejos (tablas, modales, dropdowns) sin implementarlos desde cero. |
| **Dark theme como tema principal**                                              | Decisión estética del proyecto. Clases Tailwind: `bg-gray-900`, `bg-gray-800`, texto `text-white`/`text-gray-300`.                                                                    |
| **Las rutas en Vue Router terminan en `/`**                                     | Convención del proyecto para evitar problemas de navegación directa (ej: `/game-view/` no `/game-view`).                                                                              |
| **Componentes de dominio en `src/components/{dominio}/`**                       | Organización por dominio, no por tipo (no `/components/buttons/`, `/components/modals/`). Facilita encontrar componentes relacionados.                                                |

---

## Sistema de items y avatar

| Decisión                                                                                                   | Motivo                                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **8 slots de equipamiento fijos** (headwear, upperbody, hands, trinkets, lowerbody, feets, icons, banners) | Diseño cerrado para el TFG. Cambiar el número de slots requeriría migración de DB y cambios en el frontend.        |
| **`equipped` flag en `ItemsUser`** (no tabla separada de equipped)                                         | Simplicidad. La tabla join ya existe, añadir un booleano es suficiente para saber qué item está equipado por slot. |

---

## Despliegue

| Decisión                                           | Motivo                                                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Frontend en Vercel, backend en Render**          | Vercel es óptimo para SPAs Vite. Render ofrece PostgreSQL gestionado y Node.js con free tier suficiente para el TFG. |
| **`vercel.json` con rewrite `/*` → `/index.html`** | Necesario para que Vue Router funcione con navegación directa a rutas (SPA routing).                                 |

---

## Cómo actualizar este archivo

Cuando tomes una nueva decisión técnica relevante, añade una fila a la tabla correspondiente con el formato:

```
| **Decisión tomada** | Motivo por el que se eligió esta opción sobre las alternativas |
```
