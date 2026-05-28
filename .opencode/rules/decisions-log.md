# Registro de decisiones técnicas — LudoScript

> Estas decisiones están tomadas. No proponer alternativas ni cuestionarlas salvo que el usuario lo pida explícitamente.

## Base de datos

| Decisión | Motivo |
|----------|--------|
| **MySQL en dev, PostgreSQL en prod (Supabase)** | MySQL es más fácil en Windows local. PostgreSQL es el estándar en Supabase/Render. `sync({ alter: true })` abstrae diferencias. |
| **`sync({ alter: true })` en dev, sin migraciones manuales** | TFG en desarrollo activo. Las migraciones añaden complejidad sin beneficio en esta fase. |
| **1 grupo por usuario** (`GroupMember` unique en `userId`) | Simplifica el sistema de clases. Un estudiante = una clase, como en un instituto real. |
| **`inviteCode` de 8 caracteres único** | Corto para compartir verbalmente, suficientemente único. |

## Autenticación y seguridad

| Decisión | Motivo |
|----------|--------|
| **JWT en `localStorage`** (no cookie httpOnly) | SPA sin SSR (Vite). httpOnly requeriría CORS con `credentials: true` y ajustes en Render/Vercel. XSS mitigado con sanitización. |
| **Token inyectado vía interceptor de Axios** | Centraliza la lógica. Si cambia el mecanismo, se toca un solo lugar. |
| **`req.user = { id, role }` por `authMiddleware`** | El id del usuario siempre viene del token, nunca del body (previene spoofing). |

## Frontend — Estado y arquitectura

| Decisión | Motivo |
|----------|--------|
| **Pinia con Setup Store** (no Options Store) | Consistente con Composition API. Mejor para TypeScript futuro. Más fácil de testear. |
| **`loading` y `error` en todos los stores** | Cualquier componente puede mostrar estados de carga/error sin lógica adicional. |
| **Acciones devuelven `null` en error** (no lanzan) | Evita try/catch en componentes. Componente comprueba `if (!result)`. |
| **No usar `async` en `<script setup>` — usar `onMounted`** | Evita bloquear el montaje. Datos asíncronos se cargan tras el primer render. |
| **`storeToRefs` para estado reactivo** | Desestructurar directamente del store rompe la reactividad. |

## Frontend — Estilos y UI

| Decisión | Motivo |
|----------|--------|
| **Tailwind CSS + PrimeVue** | Tailwind para prototipado rápido y control total. PrimeVue para componentes accesibles complejos. |
| **Dark theme principal** | Decisión estética: `bg-gray-900`, texto `text-white`/`text-gray-300`. |
| **Rutas terminan en `/`** | Evita problemas de navegación directa en SPA. |
| **Componentes por dominio** (`components/{dominio}/`) | Organización por dominio, no por tipo. Facilita encontrar componentes relacionados. |

## Sistema de items y avatar

| Decisión | Motivo |
|----------|--------|
| **8 slots fijos** (headwear, upperbody, hands, trinkets, lowerbody, feets, icons, banners) | Diseño cerrado para el TFG. Cambiar slots requiere migración de DB. |
| **`equipped` flag en `ItemsUser`** | Simplicidad. La tabla join ya existe, un booleano es suficiente. |

## Despliegue

| Decisión | Motivo |
|----------|--------|
| **Frontend en Vercel, backend en Render** | Vercel óptimo para SPAs Vite. Render ofrece PostgreSQL gestionado con free tier. |
| **`vercel.json` rewrite `/*` → `/index.html`** | Necesario para SPA routing con navegación directa. |
