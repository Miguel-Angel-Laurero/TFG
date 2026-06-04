# Mapa del proyecto — LudoScript

> Carga este archivo cuando necesites orientación global: estructura, endpoints o tablas.

## Estructura de directorios

```
backend/
├── server.js              Punto de entrada — Express + Socket.IO + sync
├── config/config.js       Variables de entorno centralizadas
├── config/database.js     Conexión Sequelize
└── src/
    ├── controllers/       15 controladores — lógica de negocio (try/catch/next)
    ├── models/            13 modelos + index.js con asociaciones
    ├── routes/            15 rutas + index.js (todas bajo /api/)
    ├── middlewares/       3: auth (JWT), validate (express-validator), errorHandler
    ├── socket/            5: gameHandler, duelHandler, groupGameHandler, roomManager, index
    └── utils/             4: jwt, bcrypt, validators, supabaseStorage

ludoScript/src/
├── api/axios.js           Instancia Axios (baseURL + interceptor JWT + redirect 401)
├── api/*.service.js       11 servicios — uno por recurso
├── stores/*.store.js      13 stores Pinia (Setup Store, loading + error + clearError)
├── views/*.vue            15 vistas — una por ruta
├── components/{domain}/   13 dominios de componentes
├── composables/           21 composables (useXxx) — 7 del sistema de quiz adaptativo
├── router/router.js       14 rutas con lazy loading, guards auth + admin
└── utils/                 5 utilidades
```

## Endpoints API (`/api/...`)

| Prefijo | Recurso |
|---------|---------|
| `/auth` | Login, registro, /me |
| `/users` | CRUD usuarios + items |
| `/games` | Partidas y preguntas adaptativas |
| `/rewards` | Recompensa diaria |
| `/shop` | Tienda de items |
| `/categories` | Categorías temáticas |
| `/activities` | Flashcards y recursos |
| `/pdfs` | PDFs subidos |
| `/category-stats` | Estadísticas por categoría |
| `/groups` | Sistema de clases/grupos |
| `/upload` | Subida de archivos |

## Base de datos — tablas principales

| Modelo | Tabla | Nota |
|--------|-------|------|
| User | users | id, username, email, password(hash), role |
| UserData | user_data | FK user_id UNIQUE, coins, streak, accuracy |
| Game | games | FK userId, score, category, mode |
| Item | items | FK type_id → item_categories, 8 slots fijos |
| ItemsUser | items_users | FK user_id + item_id, equipped flag |
| Group | groups | FK ownerId, inviteCode(8 UNIQUE) |
| GroupMember | group_members | FK groupId + userId UNIQUE (1 grupo/usuario) |
| CategoryStat | category_stats | FK userId + category UNIQUE |
| UserPdf | user_pdfs | FK userId, quizQuestions JSON, flashCards JSON |
| UserSession | user_sessions | FK userId, stats JSON, summary JSON |

`sequelize.sync({ alter: true })` en dev gestiona el esquema automáticamente.

## Socket.IO

3 namespaces en el mismo servidor (`backend/src/socket/index.js`):
- `gameHandler` — salas de quiz (create-room, join-room, game-start, submit-answer)
- `duelHandler` — duelos 1v1
- `groupGameHandler` — sesiones multiplayer de clase

Ver `.opencode/rules/sockets-architecture.md` para detalles completos.
