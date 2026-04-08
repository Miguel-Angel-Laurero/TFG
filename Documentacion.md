Objetivo

Se ha añadido una validación del contenido generado por Gemini antes de guardarlo en la base de datos, para evitar persistir respuestas mal formadas o incompletas.

Archivos modificados

Se ha trabajado únicamente sobre gemini-service.js.

Cambios realizados

Se han creado funciones auxiliares de validación.
En gemini-service.js se añadieron estas funciones:

isNonEmptyString(value)
validateQuizQuestion(question, index)
validateFlashCard(card, index)
validateGeneratedGameContent(parsed)
Se valida la estructura general de la respuesta de Gemini.
Antes de aceptar el JSON generado, ahora se comprueba que:

la respuesta sea un objeto
exista quizQuestions y sea un array
exista flashCards y sea un array
Se valida el número exacto de elementos.
Como el prompt pide exactamente 10 preguntas y 10 flashcards, ahora se comprueba que:

quizQuestions.length === 10
flashCards.length === 10
Se valida cada pregunta del quiz.
Para cada elemento de quizQuestions, se comprueba que:

sea un objeto válido
tenga question con texto
tenga options como array de exactamente 4 elementos
todas las opciones sean strings no vacíos
correct sea un entero entre 0 y 3
Se valida cada flashcard.
Para cada elemento de flashCards, se comprueba que:

sea un objeto válido
tenga question con texto
tenga answer con texto
Se integra la validación en el flujo de generación.
Dentro de generateGameContentFromPdf(...), después de hacer JSON.parse(clean), ahora se llama a validateGeneratedGameContent(parsed) antes de devolver el contenido.

Cómo funciona ahora el flujo

El usuario sube un PDF desde pdf.controller.js.
uploadPdf llama a generateGameContentFromPdf(...).
Gemini devuelve un JSON con quizQuestions y flashCards.
El backend parsea ese JSON.
Se ejecuta la validación nueva.
Si todo es correcto, se guarda en la tabla UserPdf.
Si algo está mal, se lanza un error y no se guarda contenido inválido en la base de datos.
Motivación del cambio

Antes de este cambio, el backend solo comprobaba que quizQuestions y flashCards existieran como arrays. Eso permitía que Gemini devolviera respuestas incompletas o con formato incorrecto y aun así pudieran guardarse.

Con esta validación:

se protege la base de datos de datos corruptos
se evita que el frontend falle por estructuras inesperadas
se mantiene una solución simple, sin añadir librerías nuevas ni complejidad innecesaria
Comentarios añadidos

Además de la lógica, se han añadido comentarios en el código para explicar:

qué valida cada función
por qué se hacen esas comprobaciones
en qué punto del flujo se usa la validación
Comprobación realizada

Se ha verificado que:

el archivo sigue teniendo sintaxis correcta
la validación acepta un payload válido
la validación rechaza casos inválidos como:
menos de 10 preguntas
preguntas con menos de 4 opciones
valores correct fuera de rango
flashcards con texto vacío
Impacto en la base de datos

No ha sido necesario cambiar el modelo ni crear una tabla nueva. La tabla actual UserPdf.model.js sigue siendo suficiente, porque:

no se guarda el PDF original
solo se guarda el contenido útil generado por la IA
ahora ese contenido se guarda con validación previa

---

Mapa de progreso por categoría (heatmap)

Se ha añadido un sistema de seguimiento del conocimiento del usuario por área temática del Quiz, con visualización en forma de mapa de calor en el perfil.

Objetivo

Categorizar las preguntas del Quiz por asignatura técnica y registrar los aciertos/errores del usuario por categoría. El perfil muestra un mapa de calor (verde → rojo) para que el usuario identifique de un vistazo sus puntos fuertes y sus áreas de mejora.

Categorías definidas

Las preguntas de quizQuestions.json se han ampliado con un campo "category". Las categorías actuales son:

tipos-coercion — Tipos y Coerción
arrays-metodos — Arrays y Métodos
scope-variables — Scope y Variables
asincronia — Asincronía
funciones — Funciones
sintaxis-es6 — Sintaxis ES6+
objetos — Objetos

Archivos creados

Backend:

- backend/src/models/CategoryStat.model.js — Modelo Sequelize para la tabla category_stats. Almacena (userId, category) con índice único y acumula correct/total por fila. Ampliado posteriormente con campos de dificultad (ver sección "Sistema de dificultad adaptativa").
- backend/src/controllers/categoryStats.controller.js — GET devuelve los stats del usuario autenticado; POST /batch hace upsert incremental validando cada entrada individualmente. Ampliado posteriormente con lógica de desbloqueo de nivel (ver sección "Sistema de dificultad adaptativa").
- backend/src/routes/categoryStats.routes.js — Monta las dos rutas bajo authMiddleware.

Frontend:

- ludoScript/src/api/categoryStats.service.js — Capa HTTP: getAll() y submitBatch(entries).
- ludoScript/src/composables/useCategoryStats.js — Lógica de sesión: trackAnswer(category, isCorrect) acumula en memoria; submitSession() envía el batch al finalizar; resetSession() limpia al reiniciar. Ampliado posteriormente con soporte de dificultad por pregunta (ver sección "Sistema de dificultad adaptativa").
- ludoScript/src/components/profile/CategoryHeatMap.vue — Componente visual: cuadrícula de 7 tarjetas coloreadas según el porcentaje de acierto (≥90% verde esmeralda, 70–89% amarillo, 50–69% naranja, <50% rojo). Muestra estado vacío hasta que el usuario complete el Quiz por primera vez.

Archivos modificados

- ludoScript/public/quizQuestions.json — Campo "category" añadido a cada una de las 15 preguntas existentes.
- backend/src/models/index.js — Importa CategoryStat, declara User hasMany CategoryStat con onDelete CASCADE y lo exporta.
- backend/src/routes/index.js — Registra /api/category-stats.
- ludoScript/src/components/minigames/Quiz.vue — Importa useCategoryStats; llama trackAnswer en cada respuesta, submitSession al terminar y resetSession al reiniciar.
- ludoScript/src/components/profile/Profile.vue — Inserta <CategoryHeatMap /> entre UserStats y PdfManager.

Cómo funciona el flujo

1. El usuario responde una pregunta del Quiz.
2. selectAnswer llama a trackAnswer(category, isCorrect), que acumula los contadores en memoria (sessionStats).
3. Al responder la última pregunta, handleNext llama primero a submitSession(), que envía el batch al endpoint POST /api/category-stats/batch.
4. El backend hace findOrCreate por (userId, category) e incrementa correct y total de forma acumulativa.
5. Al abrir el perfil, CategoryHeatMap.vue llama a GET /api/category-stats y renderiza la cuadrícula con el color correspondiente a cada área.

Notas de diseño

- Las preguntas generadas desde PDF no tienen campo category, por lo que trackAnswer las ignora automáticamente (comprueba que category sea truthy).
- submitSession no lanza excepción aunque el backend falle, para no interrumpir el flujo de recompensas.
- La tabla se crea automáticamente al arrancar el servidor gracias a sync({ alter: true }) en desarrollo.
- No se ha modificado ningún modelo existente ni ninguna tabla preexistente.

Cambios de 05/04:
Resumen de cambios
Datos
quizQuestions.json — Campo "category" añadido a las 15 preguntas existentes, asignando cada una a una de 7 categorías temáticas.
Backend (3 ficheros nuevos + 2 modificados)
Nuevos:

CategoryStat.model.js — Modelo Sequelize para la tabla category_stats. Índice único sobre (userId, category) para acumular correct y total.
categoryStats.controller.js — getMine (GET) y submitBatch (POST) con upsert incremental y validación de cada entrada.
categoryStats.routes.js — Rutas protegidas con authMiddleware.
Modificados:

index.js — Importa CategoryStat, declara la asociación User hasMany CategoryStat con onDelete: CASCADE y lo exporta.
index.js — Registra /api/category-stats.
Frontend (3 ficheros nuevos + 3 modificados)
Nuevos:

categoryStats.service.js — Capa HTTP: getAll() y submitBatch(entries).
useCategoryStats.js — trackAnswer, submitSession y resetSession. Ignora preguntas sin categoría (PDFs de Gemini).
CategoryHeatMap.vue — Mapa de calor con 7 tarjetas coloreadas (verde ≥90%, amarillo 70–89%, naranja 50–69%, rojo <50%), estado vacío inicial y leyenda.
Modificados:

Quiz.vue — Integra useCategoryStats: trackAnswer en selectAnswer, submitSession antes de la recompensa en handleNext, resetSession en handleRestart.
Profile.vue — Añade <CategoryHeatMap /> entre UserStats y PdfManager.
Documentacion.md — Sección nueva al final documentando todo el sistema.
La BD se auto-sincroniza al arrancar (no requiere migración manual en dev).

¿Cómo funciona la subida de PDF?
Usuario selecciona PDF
│
▼
PdfManager.vue → handleFileChange()
└─ pdfService.uploadPdf(file) ←─── axios POST /api/pdfs (FormData)
│
backend: pdf.routes.js
multer guarda buffer en RAM
│
pdf.controller.js → uploadPdf()
llama a generateGameContentFromPdf()
│
gemini-service.js 1. sube PDF a Files API de Gemini 2. llama a generateContent() 3. parsea JSON de la respuesta 4. valida estructura (10 quiz + 10 flash)
│
UserPdf.create() → guarda en BD
│
responde { id, originalName, createdAt }
│
▼
PdfManager.vue recibe la metadata
└─ añade el PDF a la lista (pdfs.push)
└─ muestra los botones "Jugar Quiz" / "Flashcards"

Usuario pulsa "Jugar Quiz" (con pdfId)

---

## Integración con la API de Gemini para procesado de PDF

### Objetivo

Permitir al usuario subir un documento PDF y generar automáticamente 20 preguntas de Quiz y 20 Flashcards sobre su contenido usando la IA de Google Gemini. El resultado se almacena en la BD para que el usuario pueda repetir los cuestionarios cuantas veces quiera sin volver a llamar a la IA.

---

### Archivos implicados

| Archivo                                             | Rol                                                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `backend/src/controllers/gemini-service.js`         | Comunica con la API de Gemini: sube el PDF, lanza el prompt y parsea la respuesta |
| `backend/src/controllers/pdf.controller.js`         | Recibe el PDF del frontend, llama a gemini-service y guarda el resultado en BD    |
| `backend/src/routes/pdf.routes.js`                  | Define las rutas REST del recurso PDF (protegidas con JWT)                        |
| `backend/src/models/UserPdf.model.js`               | Modelo Sequelize de la tabla `UserPdfs`                                           |
| `ludoScript/src/api/pdf.service.js`                 | Capa HTTP del frontend: uploadPdf, listPdfs, deletePdf                            |
| `ludoScript/src/components/profile/PdfManager.vue`  | UI de gestión de PDFs: subida, lista y botones de juego                           |
| `ludoScript/src/components/home/Home.vue`           | Subida rápida desde la home con acceso directo al juego tras procesar             |
| `ludoScript/src/composables/useActivitySession.js`  | Carga las preguntas desde la API cuando hay `pdfId` en la URL                     |
| `ludoScript/src/components/minigames/Quiz.vue`      | Selecciona la URL de preguntas según si hay `pdfId` en la query                   |
| `ludoScript/src/components/minigames/FlashCard.vue` | Igual que Quiz.vue pero para flashcards                                           |

---

### Cómo se envía el PDF a Gemini (Files API)

El PDF no se manda codificado en base64 dentro del cuerpo de la petición (método `inlineData`), porque eso infla el tamaño un 33 % y la API impone un límite de ~20 MB de payload. En su lugar se usa la **Files API** de Gemini:

1. `multer` (con `memoryStorage`) recibe el PDF y lo guarda en RAM como un `Buffer`.
2. `uploadBufferToFilesAPI()` en `gemini-service.js` escribe ese buffer en un fichero temporal en `os.tmpdir()`.
3. Se llama a `fileManager.uploadFile(tempPath, { mimeType })`, que sube el fichero a los servidores de Google y devuelve un objeto `file` con una `uri` permanente.
4. El fichero temporal se elimina inmediatamente en el bloque `finally`.
5. La URI recibida se incluye en el prompt como `fileData: { mimeType, fileUri }`.
6. Tras recibir la respuesta de Gemini, el fichero se elimina de los servidores de Google con `fileManager.deleteFile(file.name)`.

```
Buffer (RAM)
   │
   ▼ fs.writeFileSync
Fichero temporal (os.tmpdir)
   │
   ▼ fileManager.uploadFile()
Gemini Files API  ──→  uri: "files/abc123"
   │                        │
   ▼ fs.unlinkSync()        ▼
Fichero borrado     generateContent({ fileData: { fileUri } })
                              │
                              ▼
                       Respuesta JSON de Gemini
                              │
                              ▼ fileManager.deleteFile()
                       Fichero borrado de Gemini
```

---

### Prompt y salida estructurada

El prompt que se envía a Gemini es deliberadamente simple, sin ejemplos de JSON, porque la estructura se impone mediante `responseSchema` en `generationConfig`:

```
Analiza el documento adjunto y genera exactamente 20 preguntas de quiz tipo test
y 20 flashcards sobre su contenido, en español.

Reglas:
- "correct" es el índice (0-3) de la opción correcta
- Las 4 opciones deben ser plausibles pero solo una correcta
- Las respuestas de flashcards: máximo 2 frases
- Exactamente 20 elementos en cada array
- "tag" en kebab-case (ej: "tipos-coercion", "herencia-prototipos")
```

El `responseSchema` que se pasa a Gemini define el contrato JSON exacto que debe cumplir la respuesta:

```js
// Estructura de cada pregunta de quiz
QUIZ_QUESTION_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "integer" },
    question: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    correct: { type: "integer" }, // índice 0–3 de la opción correcta
    tag: { type: "string" }, // tema en kebab-case
  },
  required: ["id", "question", "options", "correct", "tag"],
};

// Estructura total de la respuesta
GAME_CONTENT_SCHEMA = {
  type: "object",
  properties: {
    quizQuestions: { type: "array", items: QUIZ_QUESTION_SCHEMA },
    flashCards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["quizQuestions", "flashCards"],
};
```

Al usar `responseSchema`, Gemini garantiza que la respuesta es JSON válido y cumple el esquema antes de devolverla. Por eso el único paso de validación en el backend consiste en comprobar que `quizQuestions` y `flashCards` existen como arrays — sin comprobaciones campo por campo.

---

### Almacenamiento en base de datos (tabla UserPdfs)

El PDF original nunca se persiste. Solo se guarda el contenido generado por Gemini.

Modelo `UserPdf` (tabla `UserPdfs`):

| Columna                   | Tipo        | Descripción                                     |
| ------------------------- | ----------- | ----------------------------------------------- |
| `id`                      | INTEGER PK  | Identificador autoincremental                   |
| `userId`                  | INTEGER FK  | Propietario del PDF (referencia a Users)        |
| `originalName`            | STRING(255) | Nombre del fichero tal como lo subió el usuario |
| `quizQuestions`           | JSON        | Array de 20 preguntas generadas por Gemini      |
| `flashCards`              | JSON        | Array de 20 flashcards generadas por Gemini     |
| `createdAt` / `updatedAt` | DATE        | Gestionados automáticamente por Sequelize       |

El guardado ocurre una única vez, en `uploadPdf()` del controlador, justo después de recibir y validar la respuesta de Gemini:

```js
const pdf = await UserPdf.create({
  userId: req.user.id,
  originalName: req.file.originalname,
  quizQuestions,
  flashCards,
});
```

La tabla se crea automáticamente al arrancar el servidor en desarrollo gracias a `sequelize.sync({ alter: true })`.

---

### Rutas REST del recurso PDF

Todas las rutas están protegidas con `authMiddleware` (JWT).

| Método   | Ruta                       | Descripción                                                                                   |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `POST`   | `/api/pdfs`                | Sube un PDF, llama a Gemini y guarda el resultado. Responde `{ id, originalName, createdAt }` |
| `GET`    | `/api/pdfs`                | Lista todos los PDFs del usuario (solo metadata, sin preguntas)                               |
| `GET`    | `/api/pdfs/:id/quiz`       | Devuelve el array `quizQuestions` del PDF indicado                                            |
| `GET`    | `/api/pdfs/:id/flashcards` | Devuelve el array `flashCards` del PDF indicado                                               |
| `DELETE` | `/api/pdfs/:id`            | Elimina el registro de BD (el PDF original no existe)                                         |

El ownership check en las rutas de lectura y borrado se hace con `WHERE id = :id AND userId = req.user.id`, de modo que un usuario nunca puede acceder a los PDFs de otro (devuelve 404 sin revelar si el recurso existe).

---

### Cómo se muestran las preguntas al usuario

El composable `useActivitySession` es el punto central que carga las preguntas, tanto estáticas como generadas por IA:

```
/in-game-view/?game=Quiz              → carga /quizQuestions.json   (preguntas estáticas de JS)
/in-game-view/?game=Quiz&pdfId=5      → GET /api/pdfs/5/quiz        (preguntas del PDF del usuario)
/in-game-view/?game=Flashcards&pdfId=5 → GET /api/pdfs/5/flashcards
```

La detección se hace en `Quiz.vue` y `FlashCard.vue`:

```js
const quizUrl = route.query.pdfId
  ? `/api/pdfs/${route.query.pdfId}/quiz`
  : "/quizQuestions.json";
```

`useActivitySession` detecta si la URL empieza por `/api/` y usa axios (con JWT) en vez de `fetch` simple. Para evitar la duplicación del prefijo con el `baseURL` de axios (`/api`), se hace `.slice(4)` antes de pasarla:

```js
if (jsonUrl.startsWith("/api/")) {
  const res = await api.get(jsonUrl.slice(4)); // "/api/pdfs/5/quiz" → "/pdfs/5/quiz"
  data = res.data;
}
```

Una vez cargadas, las preguntas se barajan con `shuffle()` y se presentan en `Quiz.vue` / `FlashCard.vue` exactamente igual que las estáticas.

---

### Cómo el usuario puede repetir los cuestionarios

El contenido generado por Gemini no es efímero: **se guarda en la BD en el momento de la subida y permanece hasta que el usuario borra el PDF explícitamente**. Esto permite:

1. **Desde la Home:** tras subir un PDF aparecen los botones "Quiz" y "Flashcards" que navegan con el `pdfId` recién creado.
2. **Desde el Perfil → sección "Mis PDFs":** `PdfManager.vue` lista todos los PDFs del usuario (llamando a `GET /api/pdfs`) y muestra botones "Jugar Quiz" y "Flashcards" para cada uno. El usuario puede volver cuantas veces quiera.

Cada vez que el usuario entra al minijuego con un `pdfId`, el backend lee las preguntas de la BD (sin llamar a Gemini) y las devuelve al frontend, que las baraja de nuevo para ofrecer una experiencia diferente en cada partida.

```
Primera vez:
  Subir PDF → Gemini genera 20 preguntas → BD guarda → jugar

Siguientes veces:
  PdfManager → "Jugar Quiz" → GET /api/pdfs/:id/quiz → BD devuelve preguntas → jugar
                                         ↑
                              (sin llamada a Gemini)
```

---

### Flujo completo de extremo a extremo

```
[Usuario]  Selecciona un PDF en Home.vue o PdfManager.vue
    │
    ▼ axios POST /api/pdfs  (multipart/form-data)
[Backend]  multer recibe el buffer en RAM
    │
    ▼ pdf.controller.js → generateGameContentFromPdf(buffer, mimeType)
[gemini-service.js]
    ├─ 1. Escribe buffer en fichero temporal (os.tmpdir)
    ├─ 2. fileManager.uploadFile() → obtiene uri en Gemini Files API
    ├─ 3. Elimina fichero temporal
    ├─ 4. model.generateContent({ responseSchema, fileData: { fileUri } })
    ├─ 5. Parsea JSON de la respuesta
    └─ 6. fileManager.deleteFile() → limpia Gemini Files API
    │
    ▼ { quizQuestions: [...20], flashCards: [...20] }
[Backend]  UserPdf.create({ userId, originalName, quizQuestions, flashCards })
    │
    ▼ { id, originalName, createdAt }
[Frontend] Home.vue / PdfManager.vue muestra botones "Quiz" y "Flashcards"
    │
    ▼ router.push('/in-game-view/?game=Quiz&pdfId=5')
[InGame.vue] monta Quiz.vue con key="Quiz-5"
    │
    ▼ useActivitySession('/api/pdfs/5/quiz')
    ├─ api.get('/pdfs/5/quiz')  (axios con JWT)
    │
    ▼ [Backend] pdf.controller.js → getPdfQuiz()
    │           UserPdf.findOne({ id:5, userId }) → res.json(quizQuestions)
    │
    ▼ items.value = shuffle(data) → el usuario juega
```

│
▼
router.push({ name: 'InGame', query: { game: 'Quiz', pdfId: pdf.id } })
│
▼
InGameView.vue / Quiz.vue
└─ useActivitySession("/api/pdfs/:id/quiz")
└─ api.get("/api/pdfs/5/quiz") ←── axios GET con JWT
│
pdf.controller.js → getPdfQuiz()
lee quizQuestions de la BD (ya generadas)
responde el array JSON
│
▼
items.value = shuffle(data) → empieza el juego

---

## Sistema de dificultad adaptativa

### Objetivo

Clasificar las preguntas del Quiz en tres niveles de dificultad (Básico, Intermedio, Avanzado) y garantizar que el usuario no reciba preguntas de un nivel superior al que ha demostrado dominar. Se acompaña de una pantalla pre-test donde el usuario puede elegir el nivel manualmente o delegar la selección en el motor adaptativo.

---

### Niveles definidos

| Valor | Etiqueta | Criterio                                                            |
| ----- | -------- | ------------------------------------------------------------------- |
| `1`   | Fácil    | Conceptos fundamentales y sintaxis base                             |
| `2`   | Medio    | Mecanismos internos del lenguaje, APIs menos evidentes              |
| `3`   | Difícil  | Casos edge, patrones avanzados, comportamientos sutiles del runtime |

---

### Archivos creados

- `backend/scripts/assignDifficulty.js` — Script de utilidad que lee `quizQuestions.json`, envía cada pregunta a Gemini con un prompt de clasificación y escribe el campo `difficulty` de vuelta al fichero. Uso: `node backend/scripts/assignDifficulty.js`. El flag `--force` reclasifica preguntas que ya tienen nivel asignado.

---

### Archivos modificados

**Backend:**

- `backend/src/models/CategoryStat.model.js` — Se han añadido 7 columnas nuevas a la tabla `category_stats`:
  - `unlockedDifficulty` (INTEGER, default 1) — nivel máximo desbloqueado por el usuario en esa categoría.
  - `d1Correct / d1Total` — aciertos e intentos acumulados en preguntas de dificultad 1.
  - `d2Correct / d2Total` — ídem dificultad 2.
  - `d3Correct / d3Total` — ídem dificultad 3.
    Gracias a `sync({ alter: true })` las columnas se añaden automáticamente a la BD en desarrollo sin migración manual.

- `backend/src/controllers/categoryStats.controller.js` — Se han extendido dos funciones:
  - `getMine`: ahora devuelve también `unlockedDifficulty`, `d1Correct`, `d1Total`, `d2Correct`, `d2Total`, `d3Correct`, `d3Total`.
  - `submitBatch`: acepta un campo opcional `difficultyBreakdown` por entrada con la forma `{ "1": { correct, total }, "2": {...}, "3": {...} }`. Tras acumular los contadores, evalúa si el usuario cumple el umbral de desbloqueo en el nivel actual de cada categoría: si `correct / total >= 0.70` con `total >= 5` intentos acumulados en ese nivel, `unlockedDifficulty` se incrementa (máximo 3). La progresión es "sticky upward": una vez desbloqueado un nivel no se revierte automáticamente.

- `backend/src/controllers/gemini-service.js` — Se han añadido y exportado:
  - `DIFFICULTY_CLASSIFICATION_SCHEMA` — JSON Schema que define el contrato de respuesta para la clasificación de dificultad (`{ classifications: [{ id, difficulty }] }`).
  - `callGemini` — función de bajo nivel exportada para ser usada desde scripts externos como `assignDifficulty.js`.

**Frontend:**

- `ludoScript/public/quizQuestions.json` — Campo `difficulty` (1, 2 o 3) añadido a las 15 preguntas existentes.

- `ludoScript/src/composables/useCategoryStats.js` — `trackAnswer` ahora acepta un cuarto parámetro `difficulty` (número o null). Cuando se proporciona, acumula estadísticas en `sessionStats[category].byDifficulty[difficulty] = { correct, total }`. `submitSession` incluye ese desglose como `difficultyBreakdown` en el payload enviado al endpoint `/batch`.

- `ludoScript/src/components/minigames/QuizIntro.vue` — Rediseñado como pantalla pre-test. Al montarse llama a `categoryStatsService.getAll()` para conocer el `unlockedDifficulty` actual por categoría. Muestra un selector de cuatro opciones:
  - **Personalizado** — selección adaptativa basada en el mapa de niveles desbloqueados por categoría.
  - **Fácil** — solo preguntas de nivel 1.
  - **Medio** — solo preguntas de nivel 2. Bloqueado hasta desbloquear.
  - **Difícil** — solo preguntas de nivel 3. Bloqueado hasta desbloquear.
    Para los niveles bloqueados se muestra una barra de progreso que indica cuánto le falta al usuario para desbloquearlo. La opción "Recomendado" se califica dinámicamente sobre el nivel que más sentido tiene según las categorías con mayor tasa de error. La preferencia se persiste en `localStorage` bajo la clave `ludoscript_difficulty_pref`. Al pulsar "Comenzar Quiz" emite el evento `start({ difficulty, unlockedMap })`.

- `ludoScript/src/components/minigames/InGame.vue` — Escucha el evento `start({ difficulty, unlockedMap })` de `QuizIntro` y los almacena en refs. Solo cuando el juego es `Quiz` se pasan como props al componente `Quiz` mediante `v-bind="quizProps"`.

- `ludoScript/src/components/minigames/Quiz.vue` — Acepta dos props nuevas: `difficulty` y `unlockedMap`. Al cargar las preguntas invoca `applyDifficultyFilter(questions)`:
  - Si `difficulty` es 1, 2 o 3: filtra las preguntas con `question.difficulty === difficulty`. Si quedan menos de 5 preguntas se expande incluyendo niveles inferiores hasta alcanzar el mínimo.
  - Si `difficulty` es `'personalizado'` o `null`: filtra con `question.difficulty <= unlockedMap[question.category]` (usando 1 como valor por defecto si la categoría no tiene datos). Si quedan menos de 5 se retrocede a mostrar solo nivel 1.
    El filtro se aplica en los tres modos de carga: estático (`quizQuestions.json`), adaptativo (endpoint `/games/adaptive-quiz`) y PDF local (desde `localStorage`).
    `selectAnswer` pasa `currentItem.value.difficulty` como cuarto argumento a `trackAnswer` para registrar el desglose por nivel.

- `ludoScript/src/components/home/Home.vue` — Se han añadido las variables y lógica que estaban referenciadas en el template pero no definidas en el `<script setup>`: `statsLoading`, `weakCategories`, `hasEnoughData`, `goToAdaptiveQuiz`, `errorRateBadgeClass` y `formatCategoryLabel`. Al montarse carga los stats del usuario y calcula las categorías débiles con `calculateWeakCategories`.

---

### Lógica de desbloqueo de nivel

```
Al finalizar cada sesión de Quiz, submitBatch recibe por categoría:
  { category, correct, total, difficultyBreakdown: { "1": { correct, total }, ... } }

Por cada categoría, el backend evalúa:
  nivelActual = unlockedDifficulty            (el nivel que el usuario está practicando)
  accCorrect  = d{nivelActual}Correct         (aciertos acumulados en ese nivel)
  accTotal    = d{nivelActual}Total           (intentos acumulados en ese nivel)

  Si accTotal >= 5 Y accCorrect / accTotal >= 0.70:
    unlockedDifficulty++  (máximo 3)
    → se evalúa el nuevo nivel (puede avanzar más de uno en una sola sesión)

La progresión solo sube, nunca baja automáticamente.
```

---

### Flujo completo (modo estático con dificultad manual)

```
[Usuario]  Navega a /in-game-view/?game=Quiz
    │
    ▼ InGame.vue muestra QuizIntro
[QuizIntro]
    ├─ GET /api/category-stats → carga unlockedDifficulty por categoría
    ├─ Muestra selector: Personalizado / Fácil / Medio (🔒?) / Difícil (🔒?)
    └─ emit('start', { difficulty: 2, unlockedMap: null })
    │
    ▼ InGame.vue recibe difficulty=2, pasa props a Quiz.vue
[Quiz.vue]
    ├─ fetch /quizQuestions.json → 15 preguntas
    ├─ applyDifficultyFilter([...]) → filtra difficulty === 2
    ├─ pickRandomIds(filtered, 15) → selecciona hasta 15
    └─ loadDirect(filteredQuestions)
    │
    ▼ Usuario responde
    selectAnswer → trackAnswer(category, isCorrect, id, difficulty=2)
    │
    ▼ Última pregunta → handleNext
    submitSession → POST /api/category-stats/batch
      { category: "asincronia", correct: 3, total: 4,
        difficultyBreakdown: { "2": { correct: 3, total: 4 } } }
    │
    ▼ Backend evalúa umbral
    d2Total acumulado >= 5 Y d2Correct/d2Total >= 0.70
    → unlockedDifficulty pasa de 2 a 3
```

---

## Mejoras de UX en el panel de inicio — 08/04

### Objetivo

Limpiar la pantalla de inicio de elementos que saturaban al usuario, mejorar la legibilidad del panel de sesión y hacer que los anillos de categoría sean interactivos para acceder directamente a la revisión de errores.

---

### Archivos modificados

| Archivo                                              | Cambio                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `ludoScript/src/components/home/Home.vue`            | Eliminado el bloque "Práctica adaptativa" de la pantalla de inicio            |
| `ludoScript/src/components/home/CategoryHeatMap.vue` | Fuente más grande en etiquetas, paleta de colores granular, anillos clicables |

---

### Cambios realizados

#### Eliminación de "Práctica adaptativa" de la home

El bloque que mostraba los chips de categorías débiles y el botón "Generar nuevas preguntas" se ha retirado de la pantalla de inicio. El sistema adaptativo sigue funcionando: el botón aparece en la pantalla de resultados del Quiz cuando el usuario tiene categorías con alta tasa de error.

Se eliminaron también los imports y la lógica asociada en `Home.vue` (`categoryStatsService`, `calculateWeakCategories`, `errorRateBadgeClass`, `weakCategories`, `hasEnoughData`, `goToAdaptiveQuiz`, `onMounted`), reduciendo el peso del componente.

**Beneficio para el usuario:** la home es más limpia y directa; el acceso a la práctica adaptativa aparece en el momento más relevante (justo después de ver los resultados), no como elemento permanente de la pantalla principal.

#### Etiquetas de categoría más grandes

El tamaño de la fuente de las etiquetas bajo los anillos de categoría pasó de `9 px` a `10 px`.

**Beneficio para el usuario:** los nombres de categoría como "Arrays Métodos" o "Scope Variables" son más fáciles de leer sin necesidad de acercar la pantalla.

#### Paleta de colores granular en anillos de categoría

La función `categoryRingColor` pasó de tener 2 umbrales a 5:

| Precisión | Color anterior | Color nuevo        |
| --------- | -------------- | ------------------ |
| ≥ 80 %    | Verde          | Verde `#22c55e`    |
| 65–79 %   | Verde          | Lima `#84cc16`     |
| 50–64 %   | Naranja        | Amarillo `#eab308` |
| 30–49 %   | Rojo           | Naranja `#f97316`  |
| < 30 %    | Rojo           | Rojo `#ef4444`     |

**Beneficio para el usuario:** dos categorías con precisiones distintas (p. ej. 50 % y 67 %) ya no comparten el mismo color, lo que permite distinguir de un vistazo qué áreas necesitan más atención.

#### Anillos de categoría clicables

Cada anillo del panel "Última sesión" ahora es un enlace interactivo. Al hacer clic navega a `/category-review/?category=<slug>` (vista `CategoryReviewView`), donde se muestran las preguntas que el usuario respondió mal en la última sesión junto con la explicación de por qué su respuesta era incorrecta y por qué la correcta lo es.

Para ello se añadió a cada ítem de `categoryRings` el campo `slug` (la clave original del objeto de estadísticas, p. ej. `"scope-variables"`), se importó `useRouter` en el componente y se añadieron clases `cursor-pointer hover:opacity-80 transition-opacity` para dar feedback visual al pasar el ratón.

**Beneficio para el usuario:** en lugar de tener que navegar manualmente a la sección de revisión, basta con pulsar el anillo de la categoría que quiere repasar para ir directamente a las preguntas falladas con sus explicaciones.

---

## Correcciones de errores — 08/04

### Pantalla en blanco al entrar al Quiz con PDFs

**Problema:** cuando la carga de preguntas desde la API fallaba (por ejemplo, un PDF con `quizQuestions: null` en BD), `items` quedaba vacío pero `loading` pasaba a `false`. El template entraba en el bloque `v-else` y pasaba `currentItem = undefined` a `QuizQuestion.vue`, que al intentar acceder a `props.question.question` lanzaba `TypeError: can't access property "question", $props.question is null`. Esto borraba toda la pantalla, incluido el spinner de carga.

**Solución en `Quiz.vue`:**

- Se añadió `v-if="currentItem"` en el componente `QuizQuestion` para que solo se renderice cuando la pregunta existe.
- Se añadió un estado de error (`v-if="!currentItem"`) que muestra el mensaje "No se pudieron cargar las preguntas" con un botón "Usar preguntas generales" que carga `quizQuestions.json` sin recargar la página.
- Se añadió la función `fallbackToStatic()` que realiza este proceso.

**Beneficio para el usuario:** en lugar de una pantalla en negro, ve un mensaje de error accionable y puede continuar usando la aplicación sin perder el contexto.

---

### Preguntas generadas por Gemini no se cargaban en el Quiz

**Problema:** `GameGrid.vue` siempre navega con el parámetro `?pdfIds=10` (plural, con `s`), pero la lógica de `Quiz.vue` en `onMounted` solo activaba el modo localStorage cuando existía `?pdfId=10` (singular, sin `s`). Al no reconocer el parámetro plural con un único PDF, el componente caía al flujo de carga por API (`GET /api/pdfs/10/quiz`), que devolvía `null` porque las preguntas generadas por Gemini nunca se guardan en BD, solo en `localStorage`.

**Solución en `Quiz.vue`:** la detección de `singlePdfId` ahora cubre ambas formas del parámetro:

```js
const pdfIdsList = route.query.pdfIds?.split(",").filter(Boolean) ?? [];
const singlePdfId =
  route.query.pdfId && !route.query.pdfIds
    ? route.query.pdfId
    : pdfIdsList.length === 1 && route.query.includePredefined !== "true"
      ? pdfIdsList[0]
      : null;
```

Con esto, `?pdfIds=10` con un solo ID y sin `includePredefined=true` también resuelve al modo localStorage donde están las preguntas de Gemini.

**Beneficio para el usuario:** al pulsar "Estudiar General" en un PDF que acaba de subir o que tiene guardado localmente, las preguntas generadas por la IA se cargan correctamente en lugar de mostrar la pantalla de error.
