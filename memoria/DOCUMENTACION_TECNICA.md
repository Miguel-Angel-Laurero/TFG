# Documentación técnica de LudoScript

## 1. Visión general del proyecto

LudoScript es una aplicación educativa gamificada que combina:

- una SPA en Vue 3 + Vite + Pinia para la interfaz del usuario
- un backend en Node.js + Express + Sequelize con PostgreSQL en producción
- generación de contenido asistida por IA (Google Gemini)
- funcionalidades en tiempo real con Socket.IO

El repositorio tiene una estructura monorepo con dos carpetas principales:

- `backend/`: servidor, API REST, modelos Sequelize, sockets y lógica de negocio
- `ludoScript/`: aplicación frontend Vue, rutas, stores y servicios Axios

## 2. Cómo arrancar el proyecto

### Desde la raíz

El `package.json` de la raíz define un script de desarrollo que arranca el frontend y el backend en paralelo:

```bash
npm run dev
```

### Backend

Dentro de `backend/`:

```bash
npm run dev
```

### Frontend

Dentro de `ludoScript/`:

```bash
npm run dev
```

## 3. Backend

### 3.1 Arquitectura general

El backend se inicia desde `backend/server.js`:

- configura Express con `cors`, `morgan` y parsers JSON/urlencoded
- monta `/api` con todas las rutas definidas en `backend/src/routes/index.js`
- añade una ruta de salud `GET /health`
- aplica `errorHandler.middleware` global al final
- sincroniza la base de datos con Sequelize y arranca el servidor HTTP
- inicializa Socket.IO con `backend/src/socket/index.js`

### 3.2 Configuración y variables de entorno

En `backend/config/config.js` se leen variables clave:

- `PORT` → puerto del servidor
- `CLIENT_URL` → URL del frontend para CORS y sockets
- `JWT_SECRET` → secreto JWT
- `JWT_EXPIRES_IN` → duración del token
- `NODE_ENV`

En `backend/config/database.js` se configura Sequelize con PostgreSQL:

- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `dialect: "postgres"`
- SSL habilitado para producción

### 3.3 Base de datos y modelos

`backend/src/models/index.js` registra los modelos y sus asociaciones.

Modelos principales:

- `User`: usuarios con `username`, `email`, `password`, `avatar`, `banner`, `role`
- `UserData`: progreso y economía del usuario con `coins`, `timeSpent`, `streak`, `accuracy`, `last_claimed_at`, `first_login` (booleano que controla el tutorial interactivo), `bonus_percentage`
- `Game`: partidas jugadas con `gameName`, `score`, `duration`, `result`, `playedAt`
- `Item`: elementos de la tienda con `name`, `type_id`, `price`, `img`, `equipped_img`
- `ItemCategory`: categorías de ítems para equipamiento visual
- `ItemsUser`: items comprados por usuario y si están equipados (`is_equipped`)
- `UserPdf`: PDFs subidos con contenido generado por IA (`quizQuestions`, `flashCards`)
- `CategoryStat`: estadísticas por categoría de quiz y dificultades desbloqueadas
- `Activities`: catálogo de actividades educativas
- `Group` / `GroupMember`: sistema de clases/grupos con invitaciones y gestión de miembros
- `UserSession`: sesiones de quiz con `timestamp`, `pdfId` (opcional), `stats` (JSON por categoría) y `summary` (resumen general: accuracy, elapsedMin, totalQuestions, maxStreak)

### 3.4 Middleware clave

- `auth.middleware.js`: valida JWT y expone `req.user` con `{ id, role }`
- `validate.middleware.js`: procesa validaciones de `express-validator`
- `errorHandler.middleware.js`: maneja errores y respuestas JSON estándar

### 3.5 Rutas y controladores

Todas las rutas se montan bajo `/api`.

#### Autenticación

- `POST /api/auth/register` → registra una nueva cuenta, hashea la contraseña y crea el registro inicial en `UserData` con `first_login=true` para activar el tutorial.
- `POST /api/auth/login` → valida credenciales y genera un JWT; el flag `first_login` de `UserData` persiste hasta que el usuario complete el tutorial.
- `GET /api/auth/me` → devuelve el perfil del usuario, incluyendo `UserData` con coins, streak, accuracy, bonus y el flag `first_login`.
- `POST /api/auth/complete-tutorial` → marca `first_login=false` en `UserData` tras completar el tutorial interactivo.

#### Usuarios

- `user.routes.js` maneja CRUD y perfil de usuario.
- El controlador `user.controller.js` permite que el propio usuario o un admin actualice avatar, banner, nombre, contraseña y datos de progreso.
- Los admins pueden listar y eliminar usuarios.

#### Juegos y sesiones

- `POST /api/games` / `GET /api/games` → historial de partidas con score, duración y resultado.
- `POST /api/sessions` → guarda una sesión completa de quiz en `UserSession` (por usuario autenticado) con `timestamp`, `pdfId` opcional, `stats` JSON desglosado por categoría y `summary` (resumen general de la sesión).
- `GET /api/sessions/last` → devuelve la última sesión del usuario autenticado; usada por el home para mostrar estadísticas generales de la última actividad.
- `GET /api/sessions/recent` → devuelve las sesiones más recientes del usuario con un límite configurable hasta 50; usado para análisis histórico.

#### Tienda y economía

- `shop.routes.js` → compra de items y gestión de inventario
- `rewards.routes.js` → recompensa diaria y lógica de claims

#### PDF y generación de contenido IA

- `POST /api/pdfs` → sube un PDF, lo procesa con Gemini y guarda en `UserPdf` solo el JSON generado (`quizQuestions`, `flashCards`). El PDF original no se persiste.
- `GET /api/pdfs` → devuelve sólo metadata de la lista de PDFs del usuario.
- `GET /api/pdfs/sync` → devuelve todos los PDFs con contenido generado; diseñado para hidratar el cliente tras el login.
- `GET /api/pdfs/:id/quiz` → devuelve el array de preguntas del PDF propietario.
- `GET /api/pdfs/:id/flashcards` → devuelve el array de flashcards del PDF propietario.
- `PUT /api/pdfs/:id/questions` → guarda en la nube las preguntas y flashcards que el usuario conserva en localStorage, permitiendo sincronizar cambios.
- `DELETE /api/pdfs/:id` → elimina la metadata y el contenido generado asociado.

#### Estadísticas adaptativas y sesiones por usuario

- `GET /api/category-stats` → devuelve los stats acumulados por categoría temática para el usuario autenticado.
- `POST /api/category-stats/batch` → ingresa un lote de resultados por categoría; acumula `correct` y `total`, y actualiza el progreso por dificultad cuando se recibe `difficultyBreakdown`.
- Las estadísticas de sesión (`UserSession`) están asociadas al usuario autenticado, garantizando que cada usuario vea solo sus propias sesiones.
- El frontend carga la última sesión del usuario desde la API; si falla, recurre a `localStorage` con una clave específica del usuario (derivada de `user.id`).
- El backend usa umbrales de desbloqueo: si en el nivel actual el usuario alcanza al menos 70 % de aciertos y 5 intentos, sube al siguiente nivel de dificultad hasta un máximo de 3.

#### Grupos / Clases

- `POST /api/groups` → crear un nuevo grupo. El solicitante se une automáticamente como líder.
- `POST /api/groups/join` → unirse a un grupo con `inviteCode`; verifica que el usuario no esté ya en ningún otro grupo.
- `GET /api/groups/me` → devuelve la estructura completa del grupo, incluidos miembros, owner y estadísticas de cada miembro.
- `GET /api/groups/:id/stats` → devuelve ranking de miembros con `accuracy`, `streak`, `timeSpent`, `coins` y `categoryStats`.
- `DELETE /api/groups/me/leave` → salir de la clase; el líder no puede abandonarla sin primero transferirla o disolverla.
- `POST /api/groups/:id/transfer` → transferir liderazgo a otro miembro.
- `DELETE /api/groups/:id/members/:userId` → expulsar miembro (sólo el líder puede hacerlo).
- `DELETE /api/groups/:id` → disolver el grupo por parte del líder.

#### Administración

- `admin.routes.js` y `adminItem.routes.js` soportan panel de administración general y gestión de items.

### 3.6 Integración con IA: Gemini

El backend usa `backend/src/controllers/gemini-service.js` para:

- subir PDFs a la Google Gemini Files API
- generar contenido estructurado JSON
- validar esquemas de salida para preguntas de quiz y flashcards
- manejar reintentos en errores transitorios

El flujo de PDF es:

1. El usuario sube un PDF desde el frontend.
2. `pdf.routes.js` recibe el archivo con `multer.memoryStorage()`.
3. El controller llama a Gemini para procesar el PDF.
4. Se guarda el JSON generado en `UserPdf`.
5. El PDF original no se almacena en la base de datos.

### 3.7 Tiempo real con Socket.IO

`backend/src/socket/index.js` inicializa Socket.IO y valida JWT antes de permitir conexiones.

Funciones principales:

- manejo de salas de juego en `gameHandler.js`
- duelos entre usuarios en `duelHandler.js`
- juegos de grupo en `groupGameHandler.js`

El backend mantiene un mapa de sockets autenticados para poder enviar eventos privados y gestionar invitaciones.

## 4. Frontend

### 4.1 Arquitectura general

El frontend vive en `ludoScript/` y está construido con:

- Vue 3
- Vite
- Pinia para estado global
- PrimeVue para componentes UI
- Tailwind para estilos utilitarios
- Vue Router para navegación
- Socket.IO client para tiempo real

### 4.2 Punto de entrada

`ludoScript/src/main.js`:

- importa estilos y CSS global
- crea la aplicación Vue
- monta Pinia y Vue Router
- aplica PrimeVue y ToastService
- inicia una comprobación ligera de tamaño en `localStorage`

### 4.3 Rutas

`ludoScript/src/router/router.js` define las rutas principales:

- `/` → `HomeView.vue`
- `/login-view/` → login
- `/register-view/` → registro
- `/profile-view/` → perfil (requiere auth)
- `/edit-profile-view/` → edición de usuario
- `/shop-view/` → tienda
- `/in-game-view/` → vista de juego
- `/category-review/` → repaso por categoría
- `/multiplayer/` → multijugador
- `/clase/` → gestión de clases
- `/duel-view/` → duelo en tiempo real
- `/spectate/:code` → espectador público
- `/learning-area/` → área de aprendizaje
- `/admin` → panel admin (requiere rol admin)

El router tiene guardias que redirigen a `home` si no hay token o si un usuario no tiene permisos de administrador.

### 4.4 Servicios API

La aplicación usa un cliente Axios central en `ludoScript/src/api/axios.js`:

- `baseURL` configurado con `VITE_API_URL` o fallback a `/api`
- envía `Authorization: Bearer <token>` automáticamente desde `localStorage`
- intercepta respuestas 401 y redirige al login

Servicios concretos existen por dominio, como:

- `auth.service.js`
- `user.service.js`
- `game.service.js`
- `shop.service.js`
- `pdf.service.js`
- `group.service.js`
- `categoryStats.service.js`
- `session.service.js`
- `socket.service.js`

### 4.5 Stores Pinia

Los stores siguen el patrón de `Setup Store` con estados comunes:

- `loading`
- `error`
- `ready` cuando procede

Stores clave:

- `auth.store.js`: login, registro, fetchMe, logout
- `user.store.js`: datos de usuario y perfil
- `shop.store.js`: inventario y compra de items
- `rewards.store.js`: recompensa diaria
- `group.store.js`: gestión de clases y estadísticas de grupo
- `duel.store.js` y `multiplayer.store.js`: lógica de juegos en tiempo real
- `equipment.store.js`: equipamiento de avatar
- `transaction.store.js`: operaciones económicas internas

### 4.6 Flujo de autenticación

`auth.store.js` gestiona:

- el token JWT en `localStorage`
- el usuario y `userData` (incluyendo el flag `first_login` del tutorial)
- la carga de datos del usuario tras login/registro
- la recarga del estado de recompensas y PDFs almacenados en servidor
- el reseteo del tracker de sesión local (`sessionStorage`) al hacer logout para evitar filtraciones de datos entre usuarios

El token se usa también para la conexión Socket.IO en `ludoScript/src/api/socket.service.js`.

### 4.7 Funcionalidades principales del frontend

#### Home y aprendizaje

- navegación centralizada hacia quizzes, área de aprendizaje y multijugador
- acceso a recompensas diarias y progreso de usuario

#### Perfil de usuario

- datos personales, avatar y banner
- progreso general y estadísticas por categoría
- gestión de PDFs subidos y acceso a quizzes/flashcards generados

#### Tienda

- compra de items visuales
- equipamiento de avatar mediante `ItemsUser`
- cálculo de monedas del usuario mediante `UserData`

#### PDF y generación IA

- subida de PDFs en `PdfManager`
- sincronización de contenido generado desde backend
- visualización de quiz y flashcards derivados del PDF
- el cliente puede guardar en el servidor las preguntas y flashcards solo después de haberlas generado en localStorage

#### Multiplayer y duelo

- soporte de salas y duelos en tiempo real con Socket.IO
- espectadores públicos mediante ruta `/spectate/:code`
- el frontend usa `socket.service.js` para establecer la conexión autenticada y enviar/recibir invitaciones de juego.

#### Clases / Grupos

- creación de grupos con `inviteCode`
- unión a clases mediante código
- ranking de miembros y roles de líder
- salida o disolución de grupo según permisos
- `group.store.js` ofrece acciones para crear, unirse, dejar, transferir liderazgo, expulsar miembros y sincronizar estadísticas de clase
- la lógica de grupo también registra invitaciones entrantes con `group:game-invite` y puede iniciar partidas de grupo desde el socket

### 4.8 Socket.IO client

`ludoScript/src/api/socket.service.js` expone:

- `connect()` para conectar el socket autenticado
- `disconnect()` para cerrar sesión en tiempo real
- `getSocket()` para reutilizar la instancia

### 4.9 UI y componentes

El frontend agrupa componentes por dominio en `ludoScript/src/components/`.
La aplicación usa `PrimeVue` para componentes avanzados y `Tailwind` para utilidades de diseño.

### 4.10 Sistema de tutorial interactivo

El tutorial activa automáticamente tras el primer registro o login:

- `tutorial.store.js` gestiona la visibilidad del tutorial basado en `userData.first_login`
- `completeTutorial()` llama a `POST /api/auth/complete-tutorial` para marcar el tutorial como completado en la base de datos
- El tracker de sesión local (`useSessionTracker()`) persiste durante el tutorial y se limpia al finalizar la sesión o al cambiar de usuario
- El frontend usa `resetSessionTracker()` tras cada cierre de sesión de quiz y al hacer logout para evitar que datos del tutorial anterior contaminen sesiones nuevas

### 4.11 Flujos clave

- Autenticación
  - `auth.store.js` maneja login y registro con `auth.service.js`.
  - Tras login/registro se llama a `fetchMe()` para cargar `userData` y `fetchRewards()` para inicializar el estado de la recompensa diaria.
  - `auth.store.js` también sincroniza los PDFs generados en el servidor llamando a `pdfService.syncAll()`.

- Gestión de PDFs y quizzes generados
  - `pdfService.uploadPdf()` sube el PDF en `FormData` y recibe `quizQuestions` y `flashCards` generados.
  - `pdfService.syncAll()` hidrata la UI con todos los PDFs ya procesados.
  - `saveToCloud()` permite persistir en la base de datos las preguntas/flashcards que el usuario haya modificado en su sesión local.

- Estadísticas por categoría y sesiones (por usuario)
  - `useCategoryStats()` rastrea aciertos y errores por categoría mientras se responde un quiz.
  - Al finalizar se llama a `submitSession()`, que:
    1. Captura el resumen de la sesión actual con `getSessionSummary()` (accuracy, elapsedMin, totalQuestions, maxStreak).
    2. Guarda la sesión en localStorage con una clave específica del usuario (`userScopedStorageKey()`).
    3. Envía el batch a `categoryStatsService.submitBatch()` (acumulativo).
    4. Crea un registro de sesión en la base de datos mediante `sessionService.saveSession()` incluyendo el `summary`.
    5. Limpia el tracker de sesión local con `resetSessionTracker()` para evitar que datos de sesiones anteriores persistan.
  - El home carga la última sesión del usuario desde la API (`/sessions/last`); si falla, usa localStorage pero solo la clave específica del usuario.
  - Esto permite tener análisis de progreso por categoría, desbloqueo de dificultad, un historial de sesiones recientes y estadísticas correctas por usuario.

- Recompensas diarias y bonos
  - `rewards.store.js` obtiene el estado del streak y si el usuario ya reclamó hoy mediante `GET /api/rewards`.
  - `claimReward()` solicita `POST /api/rewards/claim` y sincroniza nuevamente el perfil.
  - El store también calcula un bono aleatorio basado en `bonus_percentage`, que se aplica cuando el usuario gana monedas por actividad.

- Grupos y partidas de clase
  - `group.service.js` define la API REST de grupos: creación, unión, consulta de grupo y gestión de miembros.
  - `group.store.js` expone estados de grupo, ranking y acciones de administración.
  - Además, registra listeners de socket para recibir invitaciones de partida de grupo y activar el código de sala.

## 5. Dependencias clave

### Backend

- `express`
- `sequelize`
- `pg`, `pg-hstore`
- `jsonwebtoken`
- `bcryptjs`
- `express-validator`
- `socket.io`
- `multer`
- `@google/generative-ai`
- `@supabase/supabase-js`

### Frontend

- `vue`
- `pinia`
- `vue-router`
- `axios`
- `primevue`
- `chart.js`
- `socket.io-client`
- `@supabase/supabase-js`
- `v-calendar`

## 6. Notas importantes de diseño

### Almacenamiento y privacidad

- El backend usa `sequelize.sync({ alter: true })` en desarrollo para adaptar el esquema sin migraciones manuales.
- JWT se almacena en `localStorage` y se inyecta vía interceptor de Axios.
- `UserPdf` guarda solo el contenido generado, no el archivo PDF original.
- `CategoryStat` acumula estadísticas por categoría y niveles de dificultad.
- `UserSession` asocia todas las sesiones de quiz al usuario autenticado, garantizando aislamiento de datos entre cuentas.
- El frontend usa claves de localStorage con scope por usuario (`userScopedStorageKey()`) para estadísticas, sesiones y configuración adaptativa, evitando fugas de datos entre sesiones de usuario en el mismo navegador.
- El sessionStorage (`ludoscript_session`) se limpia al cambiar de usuario (logout) con `resetSessionTracker()` para prevenir contaminación de sesiones.

### Flujo de tutorial

- El campo `first_login` en `UserData` persiste hasta que el usuario complete el tutorial interactivo mediante `POST /api/auth/complete-tutorial`.
- El tutorial solo es visible si `userData.first_login === true`; tras completarlo, se marca como `false` en la base de datos.
- El tracker de sesión local se limpia automáticamente al finalizar la sesión del tutorial y al logout.

### Grupo y multijugador

- El sistema de grupos permite un solo grupo por usuario a través de `GroupMember` con restricción única en `userId`.
- Socket.IO valida el JWT antes de aceptar conexiones y permite invitados como espectadores.

## 7. Archivo existente de cambios y bitácora

Este repositorio ya contiene `Documentacion.md` con notas de cambios y mejoras específicas, pero `DOCUMENTACION_TECNICA.md` es la referencia técnica estructurada para comprender la arquitectura completa.
