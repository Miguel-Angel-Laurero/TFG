---
description: "TFG LudoScript — arquitectura general del proyecto, cómo se conectan frontend y backend, comandos de arranque y puntos de entrada. Usa cuando: nueva funcionalidad, agregar módulo, preguntas sobre estructura."
applyTo: "**"
---

# Arquitectura general — TFG LudoScript

## Estructura del monorepo

```
TFG/
├── backend/         Node.js + Express + Sequelize (PostgreSQL en prod, MySQL en dev)
│   ├── server.js    Punto de entrada — monta Express, Socket.IO, sincroniza Sequelize
│   ├── config/      database.js (Sequelize) + config.js (env vars)
│   └── src/
│       ├── controllers/   Lógica de negocio por recurso
│       ├── models/        Modelos Sequelize + index.js con associations
│       ├── routes/        Routers Express + index.js raíz
│       ├── middlewares/   auth, errorHandler, validate
│       ├── socket/        Socket.IO (gameHandler, roomManager, index)
│       └── utils/         bcrypt, jwt, validators
└── ludoScript/      Vue 3 + Vite + Pinia + Tailwind CSS + PrimeVue
    └── src/
        ├── api/       Servicios Axios (uno por recurso) + axios.js (instancia base)
        ├── stores/    Pinia stores (uno por dominio)
        ├── views/     Vistas (una por ruta)
        ├── components/ Componentes agrupados por carpeta de dominio
        ├── composables/ Lógica reutilizable (useXxx)
        ├── router/    router.js
        └── utils/
```

## Conexión frontend ↔ backend

- El frontend llama al backend a través de `api` (instancia Axios de `src/api/axios.js`).
- `baseURL` en desarrollo: `VITE_API_URL` o `/api` como fallback.
- En producción el frontend está servido desde Vercel; el backend en Render.
- Todas las peticiones autenticadas llevan `Authorization: Bearer <token>` (inyectado por el interceptor de Axios).
- El backend expone todo bajo `/api/...` — ver `backend/src/routes/index.js`.

## Comandos de arranque

```bash
# Backend (desde backend/)
npm run dev          # nodemon server.js

# Frontend (desde ludoScript/)
npm run dev          # vite
```

## Rutas de la API (`/api/...`)

| Prefijo           | Recurso                             |
| ----------------- | ----------------------------------- |
| `/auth`           | Login, registro, /me                |
| `/users`          | CRUD usuarios + items de usuario    |
| `/games`          | Partidas y preguntas adaptativas    |
| `/rewards`        | Recompensa diaria                   |
| `/shop`           | Tienda de items                     |
| `/categories`     | Categorías temáticas                |
| `/activities`     | Actividades (flashcards, etc.)      |
| `/pdfs`           | PDFs subidos por el usuario         |
| `/category-stats` | Estadísticas por categoría del quiz |
| `/groups`         | Sistema de Clases (grupos)          |
| `/upload`         | Subida de archivos                  |

## Base de datos — tablas principales

| Tabla             | Modelo       | Notas clave                                                                   |
| ----------------- | ------------ | ----------------------------------------------------------------------------- |
| `users`           | User         | id, username, email, password(hash), role, avatar, banner, coins              |
| `user_data`       | UserData     | FK `user_id` UNIQUE, accuracy, streak, timeSpent                              |
| `games`           | Game         | FK `userId`, score, category, mode, etc.                                      |
| `activities`      | Activities   | Flashcards y otros recursos de aprendizaje                                    |
| `category_stats`  | CategoryStat | FK `userId` + `category` UNIQUE pair, accuracy/count por categoría            |
| `items`           | Item         | FK `type_id` → item_categories, price, rarity                                 |
| `item_categories` | ItemCategory | Slots: headwear, upperbody, hands, trinkets, lowerbody, feets, icons, banners |
| `items_users`     | ItemsUser    | FK `user_id` + `item_id`, equipped flag por slot                              |
| `user_pdfs`       | UserPdf      | FK `userId`, PDFs del sistema adaptativo                                      |
| `groups`          | Group        | FK `ownerId`, name, inviteCode(8 UNIQUE), max 30 miembros                     |
| `group_members`   | GroupMember  | FK `groupId` + `userId` UNIQUE (1 grupo por usuario)                          |

## Sincronización automática del esquema

En desarrollo `sequelize.sync({ alter: true })` adapta las tablas al arrancar el servidor. **No hace falta crear migraciones manualmente.**
