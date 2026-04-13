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

Nota técnica — Multijugador: temporizador y corrección de bug

- Síntoma: cuando todos los jugadores respondían antes de que expirase el tiempo de una pregunta, en la siguiente pregunta se observaba una alternancia entre dos contadores (el contador residual de la pregunta anterior y el nuevo), es decir, los ticks del cronómetro se solapaban.
- Causa raíz: en la implementación inicial el `setInterval` que emitía `game:timer` se almacenaba en una variable local dentro de `advanceQuestion()`. Si `revealQuestion()` se ejecutaba antes de que expirase el `setTimeout` de fin de pregunta (por ejemplo porque todos respondieron rápido), no había referencia disponible para cancelar ese `setInterval`, por lo que seguía emitiendo ticks.
- Solución aplicada: el `setInterval` ahora se guarda en el objeto `room` como `room.tickInterval`. Se limpian explícitamente `room.tickInterval` y `room.questionTimer` en `revealQuestion()`, en el inicio de `advanceQuestion()` y en `destroyRoom()`, llamando a `clearInterval(...)` y `clearTimeout(...)` según corresponda.
- Resultado: cada nueva pregunta comienza con un contador limpio (p. ej. 20s) y no quedan ticks residuales de preguntas anteriores. Al contestar antes de tiempo, el servidor limpia los timers y la siguiente pregunta arranca correctamente.

Pruebas recomendadas:

1. Crear una sala con al menos 2 jugadores.
2. Iniciar la partida y responder la primera pregunta inmediatamente (antes de 1s).
3. Comprobar en ambos clientes que la segunda pregunta muestra un único contador descendente, sin alternancias ni aceleraciones.

Si quieres, puedo añadir una prueba automatizada que simule dos sockets respondiendo rápido y verifique que no quedan `tickInterval` activos entre preguntas.

Nota técnica — Multijugador: flujo del nombre de usuario en sockets

- Flujo actual:
  1. En `auth.controller.js`, al hacer `login` o `register`, el backend firma un JWT con `id`, `username` y `role`.
  2. El frontend abre la conexión de Socket.IO enviando ese token en `socket.handshake.auth.token`.
  3. En `backend/src/socket/index.js`, el middleware valida el JWT y copia sus datos a `socket.user = { id, username }`.
  4. En `backend/src/socket/gameHandler.js`, al crear o unirse a una sala se pasa `socket.user.username` a `roomManager`.
  5. En `backend/src/socket/roomManager.js`, ese valor se guarda en cada entrada de `room.players` y luego `getPlayersPublic(room)` lo serializa como `username`.
  6. El cliente recibe `players` y `ranking` y los renderiza en el lobby, la clasificación lateral y la tabla final.

- Bug detectado:
  - El token se estaba firmando solo con `id` y `role`.
  - El socket intentaba leer `payload.username`, pero ese campo no existía en el JWT.
  - Consecuencia: en multijugador, los jugadores llegaban con `username = undefined`, así que la UI mostraba la fila, el icono y el estado `HOST`, pero no el nombre.

- Solución aplicada:
  - Se añadió `username` al payload del JWT en `register` y `login`.
  - Esto no introduce un riesgo relevante por sí mismo, porque el nombre de usuario no es un secreto; simplemente deja disponible en el token un dato público que el servidor ya conocía.
  - El backend sigue validando la firma del JWT, así que el cliente no puede inventarse un `username` arbitrario sin invalidar el token.

- Implicación operativa:
  - Los tokens emitidos antes de este cambio no contienen `username`.
  - Para ver los nombres correctamente en multijugador, hay que cerrar sesión y volver a iniciar sesión para obtener un JWT nuevo.

```

```

Nota técnica — Multijugador: botón "Volver" al terminar o al cerrar la sala

- Flujo esperado:
  1. Cuando la partida termina, el servidor emite `game:finished` con el `ranking`.
  2. El store multijugador guarda ese ranking y cambia `status` a `finished`.
  3. `MultiplayerResults.vue` muestra la clasificación final.
  4. Al pulsar `Volver al inicio`, el cliente debe abandonar la sala, desconectar el socket, resetear el store y navegar a `/`.
  5. Si el host abandona durante lobby o partida, el servidor emite `room:closed`.
  6. El store cambia `status` a `closed`, conserva el mensaje de error y desconecta el socket.
  7. `MultiplayerView.vue` muestra la vista "La sala ha sido cerrada" con el botón `Volver`.

- Bug detectado:
  - El botón `Volver` del estado `closed` llamaba a `mp.$reset()`.
  - Ese store está definido como setup store de Pinia, y en esa implementación no existía un `$reset` personalizado expuesto desde `multiplayer.store.js`.
  - Además, ese handler no navegaba al home; solo intentaba devolver el estado a `idle` dentro de la propia ruta `/multiplayer/`.
  - Consecuencia: cuando el host cerraba la sala, el botón no restauraba correctamente el estado y no llevaba al usuario de vuelta al inicio.

- Solución aplicada:
  - Se expuso una acción pública `resetState()` en `ludoScript/src/stores/multiplayer.store.js`.
  - `leaveRoom()` reutiliza ahora ese mismo reseteo interno tras emitir `room:leave` y desconectar el socket.
  - En `ludoScript/src/views/MultiplayerView.vue`, el botón del estado `closed` sustituye `mp.$reset()` por `mp.resetState()` y después ejecuta `router.push('/')`.

- Resultado:
  - En partida finalizada, el botón de resultados sigue el flujo correcto: salir de la sala, limpiar estado y volver al inicio.
  - En sala cerrada por el host, el botón `Volver` vuelve a funcionar de forma consistente: limpia el store y navega al home.

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

## Juego de Flashcards con preguntas del Quiz + botones ✓/✗ + tracking — 13/04

### Objetivo

Adaptar el juego de Flashcards para que muestre preguntas del mismo banco que el Quiz (`quizQuestions.json`), aleatorizadas en cada sesión. Al voltear la carta, el usuario marca si conocía la respuesta con un botón ✓ o ✗. Ese progreso se registra con el mismo sistema de estadísticas que el Quiz, por lo que aparece automáticamente en el resumen semanal, el calendario de 14 días y el mapa de calor de la última sesión en el perfil.

---

### Archivos creados

| Archivo                                                               | Rol                                                                                                                                                                         |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ludoScript/src/composables/useFlashCardLoader.js`                    | Exporta las funciones puras `toFlashCard`, `pickRandom` y las constantes `QUIZ_URL` / `FLASH_CARDS_PER_SESSION` extraídas del componente para facilitar los tests unitarios |
| `ludoScript/src/composables/__tests__/useFlashCardLoader.spec.js`     | 23 tests unitarios de las funciones puras                                                                                                                                   |
| `ludoScript/src/components/minigames/__tests__/FlashCardDeck.spec.js` | 24 tests del componente presentacional                                                                                                                                      |
| `ludoScript/src/components/minigames/__tests__/FlashCard.spec.js`     | 33 tests del componente contenedor                                                                                                                                          |

### Archivos modificados

| Archivo                                                 | Cambio                                                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ludoScript/src/components/minigames/FlashCard.vue`     | Carga preguntas de `quizQuestions.json` (transformadas a flashcard), integra `useCategoryStats` y `submitSession` al finalizar |
| `ludoScript/src/components/minigames/FlashCardDeck.vue` | Sustituye el botón "Siguiente →" por dos botones ✓/✗ que solo aparecen en el reverso                                           |
| `ludoScript/src/components/profile/WeeklyResume.vue`    | Texto descriptivo actualizado a "Quiz y Flashcards"                                                                            |

---

### Cómo funciona el flujo

1. Al montar `FlashCard.vue`, se hace `fetch('/quizQuestions.json')` y se seleccionan 15 preguntas aleatorias.
2. Cada pregunta se transforma a `{ question, answer: options[correct], id, category, topic, difficulty }`.
3. Si la ruta tiene `?pdfId=X` o `?pdfIds=X,Y`, se cargan esas fuentes vía `api.get` (con JWT). Con `?includePredefined=true` se combinan ambas fuentes.
4. El usuario ve la pregunta en el anverso. Al tocar la carta, aparece la respuesta en el reverso y se muestran los botones ✓ y ✗.
5. Al pulsar ✓ o ✗ se llama a `trackAnswer(category, isCorrect, id, difficulty, topic)` de `useCategoryStats` y se avanza a la siguiente carta.
6. Al llegar a la última carta: `submitSession()` escribe en `ludoscript_lastSession` y `ludoscript_weeklySessions` (localStorage), luego se otorga la recompensa.
7. Los componentes de perfil (`CategoryHeatMap`, `WeeklyResume`, `FortnightResume`) leen ese localStorage sin cambios, por lo que las sesiones de Flashcards aparecen automáticamente junto a las del Quiz.

---

### Tests — suite completa (80 tests nuevos, 117 en total tras el cambio)

#### `useFlashCardLoader.spec.js` — 23 tests

**Constantes**

| Test                                             | Qué comprueba                                                 |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `QUIZ_URL` apunta al banco de preguntas correcto | El valor de la constante es exactamente `/quizQuestions.json` |
| `FLASH_CARDS_PER_SESSION` vale 15                | El número de cartas por sesión es 15                          |

**`toFlashCard` — transformación de pregunta del Quiz a flashcard**

| Test                                                               | Qué comprueba                                                                                         |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Transforma correctamente una pregunta completa del Quiz            | Los 6 campos (`question`, `answer`, `id`, `category`, `topic`, `difficulty`) tienen el valor esperado |
| Usa `options[correct]` cuando `correct=0` (primer índice)          | La respuesta es la primera opción cuando `correct` vale 0                                             |
| Usa `options[correct]` cuando `correct` es el último índice        | La respuesta es la última opción del array                                                            |
| Rellena con `null` los campos opcionales ausentes                  | `id`, `category`, `topic` y `difficulty` son `null` si no existen en la pregunta                      |
| Conserva `id=0` (valor falsy pero válido) sin convertirlo a `null` | El operador `??` no confunde `0` con ausencia de valor                                                |
| Preserva `category`, `topic` y `difficulty` cuando están presentes | Los campos opcionales se mapean correctamente                                                         |
| El resultado solo tiene los 6 campos esperados                     | No se filtran campos extra del input ni se añaden nuevos                                              |
| Funciona con un array de dos opciones y `correct=1`                | El mínimo viable de opciones funciona sin errores                                                     |

**`pickRandom` — selección aleatoria sin repetición**

| Test                                                                       | Qué comprueba                                               |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Devuelve exactamente `n` elementos cuando `n < arr.length`                 | Tamaño correcto en el caso normal                           |
| Devuelve todos los elementos cuando `n === arr.length`                     | Sin truncado innecesario                                    |
| Devuelve todos los elementos cuando `n > arr.length`                       | No lanza error si se piden más elementos de los disponibles |
| Solo contiene elementos presentes en el array original                     | No inventa elementos                                        |
| No repite elementos                                                        | El shuffle no genera duplicados                             |
| No modifica el array original                                              | La función es pura (sin efectos secundarios)                |
| Devuelve array vacío para `n=0`                                            | Caso límite de cero elementos                               |
| Funciona con array de 1 elemento y `n=1`                                   | Mínimo viable                                               |
| Funciona con array de 1 elemento y `n` mayor                               | Sin errores al pedir más de lo disponible                   |
| Devuelve array vacío si el input es vacío                                  | No lanza error con array vacío                              |
| Con banco de 20 preguntas y `FLASH_CARDS_PER_SESSION` devuelve 15          | Integración de la constante con la función                  |
| Con banco menor a `FLASH_CARDS_PER_SESSION` devuelve todas las disponibles | Adapta el tamaño al banco real                              |
| La distribución es aleatoria                                               | Documenta la propiedad de aleatoriedad del shuffle          |

---

#### `FlashCardDeck.spec.js` — 24 tests

**Renderizado**

| Test                                              | Qué comprueba                               |
| ------------------------------------------------- | ------------------------------------------- |
| Muestra el texto de la pregunta                   | El contenido del anverso es visible         |
| Muestra el texto de la respuesta                  | El contenido del reverso es visible         |
| Muestra el contador "currentIndex+1 / totalItems" | El contador refleja el índice 1-based       |
| Muestra "1 / 1" para la carta única               | El formato es correcto con un solo elemento |
| Muestra "1 / 5" en el primer item por defecto     | El formato es correcto al inicio            |

**Hint de volteo**

| Test                                                                   | Qué comprueba                                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| El hint tiene `opacity-100` cuando la carta no está volteada           | El texto "Toca la carta" es visible en el anverso                |
| El hint tiene `opacity-0` y `pointer-events-none` cuando está volteada | El texto desaparece visualmente y no es interactuable al voltear |

**Visibilidad de botones ✓/✗**

| Test                                                                                       | Qué comprueba                                           |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| El contenedor de botones tiene `opacity-0` y `pointer-events-none` cuando no está volteada | Los botones son invisibles e inaccesibles en el anverso |
| El contenedor de botones tiene `opacity-100` cuando está volteada                          | Los botones son visibles en el reverso                  |
| El `aria-label` menciona "Siguiente" cuando no es el último item                           | Accesibilidad correcta para pantallas intermedias       |
| El `aria-label` menciona "Finalizar" cuando es el último item                              | Accesibilidad correcta para la última carta             |
| Hay exactamente 2 botones de marcado                                                       | Solo existen los botones ✓ y ✗, sin botones extra       |

**Emisión de eventos**

| Test                                                               | Qué comprueba                                |
| ------------------------------------------------------------------ | -------------------------------------------- |
| Emite `flip` al hacer click en la carta                            | El evento de volteo se dispara correctamente |
| Emite exactamente un `flip` por click (no se duplica)              | No hay propagación de eventos doble          |
| Emite `mark-correct` al pulsar el primer botón (✓)                 | El botón verde emite el evento correcto      |
| Emite `mark-wrong` al pulsar el segundo botón (✗)                  | El botón rojo emite el evento correcto       |
| No emite `mark-correct` ni `mark-wrong` al hacer click en la carta | El click en la carta solo voltea, no marca   |
| El contenedor tiene `pointer-events-none` cuando no está volteada  | Protección CSS contra clics accidentales     |

**Edge cases**

| Test                                                         | Qué comprueba                                    |
| ------------------------------------------------------------ | ------------------------------------------------ |
| Renderiza sin errores con pregunta y respuesta vacías        | Texto vacío no rompe el componente               |
| Renderiza sin errores con texto muy largo (600 caracteres)   | Textos extremadamente largos no rompen el layout |
| Renderiza sin errores con `currentIndex=0` y `totalItems=0`  | El componente tolera estados de carga vacíos     |
| Renderiza sin errores con `totalItems=1` e `isLastItem=true` | El caso de carta única y última funciona         |
| El botón ✗ no emite `mark-correct` por error                 | Los eventos no se cruzan entre botones           |
| El botón ✓ no emite `mark-wrong` por error                   | Los eventos no se cruzan entre botones           |

---

#### `FlashCard.spec.js` — 33 tests

**Estado de carga**

| Test                                                         | Qué comprueba                                           |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| Muestra `FlashCardDeck` una vez completada la carga          | El componente correcto se renderiza tras cargar         |
| No muestra `ActivityFinished` al inicio (`finished=false`)   | La pantalla de fin no aparece prematuramente            |
| Muestra `ActivityFinished` cuando `finished` cambia a `true` | La pantalla de fin aparece al terminar y oculta el deck |

**Carga de preguntas sin query params**

| Test                                                                | Qué comprueba                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------- |
| Hace `fetch` a `quizQuestions.json`                                 | La fuente de datos correcta es consultada                |
| Llama a `loadDirect` con exactamente 15 cards (banco de 20)         | Se seleccionan exactamente 15 preguntas                  |
| Las cards transformadas tienen `answer=options[correct]`            | La transformación de pregunta a flashcard es correcta    |
| Las cards tienen los campos `id`, `category`, `topic`, `difficulty` | La transformación incluye todos los metadatos necesarios |
| No llama a `api.get` cuando no hay `pdfIds` en la ruta              | Sin PDF, no se hace ninguna llamada autenticada          |
| Carga todas las preguntas si el banco tiene menos de 15             | Se adapta al tamaño real del banco                       |
| Llama a `loadDirect` con array vacío si `fetch` lanza error         | El error de red se captura sin propagar                  |
| No propaga el error si `fetch` falla                                | La app no se rompe ante fallos de red                    |

**Carga con `pdfId` / `pdfIds` en query params**

| Test                                                             | Qué comprueba                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| `?pdfId=42` llama a `api.get` con la ruta correcta               | La URL de la API del PDF es correcta                 |
| `?pdfId=42` NO incluye el banco de `quizQuestions`               | Con PDF, no se mezclan fuentes salvo que se pida     |
| `?pdfId=42` carga las cards del PDF en `loadDirect`              | Las cards del PDF se entregan al session manager     |
| `?pdfId=42&includePredefined=true` incluye ambas fuentes         | La combinación de PDF + banco funciona (2 + 15 = 17) |
| `?pdfIds=1,2` hace dos llamadas a la API                         | Múltiples PDFs generan múltiples peticiones          |
| La API del PDF devuelve `data` no-array → trata como array vacío | Respuesta malformada del backend no rompe la app     |
| La API del PDF falla (401) → continúa sin propagar error         | Error de autenticación no bloquea la carga           |

**Interacción: mark-correct y mark-wrong**

| Test                                                                           | Qué comprueba                                                             |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `mark-correct` llama a `trackAnswer` con `isCorrect=true` y los datos del item | El tracking de categoría recibe el dato correcto al marcar como sabido    |
| `mark-wrong` llama a `trackAnswer` con `isCorrect=false` y los datos del item  | El tracking de categoría recibe el dato correcto al marcar como no sabido |
| `mark-correct` llama a `next` para avanzar                                     | Marcar correcto avanza la sesión                                          |
| `mark-wrong` también llama a `next` para avanzar                               | Marcar incorrecto también avanza la sesión                                |
| `flip` alterna `isFlipped` de `false` a `true`                                 | El estado de volteo se gestiona correctamente                             |
| `isFlipped` se resetea a `false` al avanzar a la siguiente carta               | La nueva carta siempre empieza por el anverso                             |
| `trackAnswer` no es llamado antes de marcar                                    | No se registran respuestas antes de la interacción del usuario            |

**Último item: `submitSession` y `grantReward`**

| Test                                                                           | Qué comprueba                                                                |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| En el último item, llama a `submitSession` y `grantReward`                     | Al terminar la sesión se guardan stats y se otorga recompensa                |
| `submitSession` se llama antes que `grantReward`                               | El orden correcto: primero guardar, luego recompensar                        |
| En items intermedios, `submitSession` y `grantReward` NO se llaman             | No se finaliza la sesión prematuramente                                      |
| `mark-wrong` también dispara `submitSession` y `grantReward` en el último item | El comportamiento al finalizar es igual independientemente del botón pulsado |
| Con banco de una pregunta, la primera carta ya es la última                    | `isLastItem=true` desde el inicio funciona correctamente                     |

**Reinicio**

| Test                                                  | Qué comprueba                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `restart` llama a `resetSession` y reinicia la sesión | Al reiniciar se limpia el tracking de la sesión anterior                |
| Después del reinicio, `isFlipped` vuelve a `false`    | La carta reiniciada empieza por el anverso                              |
| `resetSession` se llama antes que `restart`           | El orden correcto: primero limpiar stats, luego reiniciar la navegación |

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

---

## Refactorización técnica: modularización del `Quiz` y pruebas unitarias

Resumen

Se ha realizado una refactorización de la lógica del minijuego `Quiz` en el frontend con dos objetivos principales: (1) separar responsabilidades para mejorar mantenibilidad y (2) habilitar pruebas unitarias que validen cada fase de la actividad de forma aislada.

Alcance

La intervención afectó exclusivamente al frontend (carpeta `ludoScript`) y consistió en extraer lógica a módulos reutilizables y añadir una batería de tests automatizados. No se introdujeron cambios en la API ni en la base de datos.

Cambios implementados (resumen técnico)

- Se crearon dos módulos reutilizables para encapsular responsabilidades claras:
  - `ludoScript/src/composables/useQuizLoader.js`: encapsula las estrategias de carga de preguntas (estático, PDF local, mixto, adaptativo) y expone funciones públicas para probar cada modo de carga por separado.
  - `ludoScript/src/composables/useQuizController.js`: gestiona la interacción del jugador (selección de respuesta, avance, reinicio) y la lógica final (envío de estadísticas, cálculo de recompensa, persistencia de partida).
- `ludoScript/src/components/minigames/Quiz.vue` fue simplificado: ahora orquesta los composables anteriores y mantiene la plantilla/UI intacta.
- Se añadió configuración y dependencias para pruebas unitarias con Vitest: `ludoScript/vitest.config.js` y actualización de `ludoScript/package.json` (script `test`).
- Tests añadidos (unitarios):
  - `ludoScript/src/composables/__tests__/useQuizLoader.spec.js` — cubre: carga estática, carga desde PDF local, modo mixto (PDF + estático), y adaptativo (API y fallback).
  - `ludoScript/src/composables/__tests__/useQuizController.spec.js` — cubre: selección de respuesta, conteo de resultados, fórmula de puntuación, finalización de sesión y reinicio.

Estrategia de diseño

- Separación de responsabilidades: la carga de datos (I/O y selección de preguntas) queda en `useQuizLoader`; la gestión de interacción y efectos colaterales (envío de stats, creación de juego) en `useQuizController`.
- Inyección de dependencias: los servicios externos (API, servicios del dominio) se inyectan en los tests para facilitar el aislamiento y evitar efectos de red.
- Tests deterministas: se usaron mocks controlados para `fetch`, la instancia de axios y las utilidades de selección (`useAdaptiveSelection`) de modo que los tests sean repetibles y rapídos.

Ejecución de pruebas

Desde la carpeta `ludoScript`:

```bash
npm install
npm test        # ejecuta Vitest (modo por defecto)
npx vitest run  # ejecutar una sola pasada
```

También es posible ejecutar un test concreto en modo `run` o `watch` apuntando al fichero dentro de `src/composables/__tests__`.

Resultados

Se añadieron 23 pruebas unitarias que verifican las rutas críticas del `Quiz`. En el entorno de desarrollo local las pruebas se ejecutaron correctamente (`23 passed`).

Impacto y beneficios

- Mantenibilidad: menor acoplamiento entre UI y lógica de negocio; los cambios futuros en la selección o puntuación se pueden validar sin tocar la plantilla.
- Testabilidad: ahora cada fase (carga, interacción, finalización) puede probarse de forma aislada, lo que facilita detectar regresiones.
- Riesgo: los cambios se limitan al frontend; la integración con el backend permanece sin cambios funcionales.

Recomendaciones futuras

- Añadir pruebas de integración que cubran la interacción completa entre `Quiz.vue` y el backend (endpoints `/api/pdfs/:id/quiz` y `/games/adaptive-quiz`).
- Integrar un pipeline CI que ejecute `npm test` para evitar regresiones automáticas.

---

## Perfil de usuario: avatar, banner y visualizacion

### Objetivo

Permitir que el usuario edite su nombre, icono de perfil y banner desde la vista de edicion, persistir esos cambios en backend y reflejarlos en el perfil y en la cabecera de la aplicacion.

### Archivos implicados

Frontend:

- `ludoScript/src/components/profile/EditProfileContent.vue`
- `ludoScript/src/components/profile/EditProfile.vue`
- `ludoScript/src/components/shared/UserInfo.vue`
- `ludoScript/src/components/shared/Menu.vue`
- `ludoScript/src/views/ProfileView.vue`
- `ludoScript/src/api/user.service.js`
- `ludoScript/src/stores/auth.store.js`

Backend:

- `backend/src/models/User.model.js`
- `backend/src/controllers/user.controller.js`

### Como funciona ahora el flujo

1. El usuario entra en `EditProfileView`.
2. `EditProfileContent.vue` comprueba si `auth.user` ya esta cargado. Si no lo esta, llama a `auth.fetchMe()` antes de permitir guardar.
3. La pantalla muestra un campo para editar `username` y una tarjeta con el icono actual y el banner actual.
4. Cada visual tiene su boton de editar. Al pulsarlo, se abre una ventana modal interna con las opciones cargadas desde `itemData.json`.
5. La seleccion se guarda temporalmente en `selectedAvatar` y `selectedBanner`.
6. Al pulsar `Guardar cambios`, la funcion `save()` construye un objeto `updates` solo con los campos que realmente han cambiado.
7. El frontend hace `PUT /api/users/:id` mediante `userService.update(id, updates)`.
8. El backend recibe `username`, `avatar` y `banner` en `user.controller.js` y actualiza el usuario.
9. Despues del guardado, el frontend llama a `auth.fetchMe()` para refrescar el store global y propagar los cambios a toda la UI.

### Persistencia en base de datos

El modelo `User` incluye ahora estos campos visuales:

- `avatar`
- `banner`

Ambos se almacenan como `TEXT` en `User.model.js`, no como `STRING(255)`, porque las URLs firmadas de Supabase pueden superar los 255 caracteres.

### Donde se muestran avatar y banner

#### Vista de perfil

En `ProfileView.vue` ya no existe un bloque superior independiente con avatar y banner. La vista se simplifico para mostrar solo:

- `UserStats`
- `WeeklyResume`

La visualizacion del usuario se hace exclusivamente dentro de `Tu Progreso`.

#### Bloque `Tu Progreso`

`UserInfo.vue` es ahora el unico lugar del perfil donde se renderizan:

- el `avatar` del usuario
- el `banner` del usuario como fondo del bloque superior
- `username`
- `email`

De esta forma se evita duplicar la misma informacion visual dos veces en la pantalla.

#### Menu superior

El icono pequeño de usuario junto a la zona de tienda se renderiza desde `Menu.vue` usando directamente `auth.user?.avatar`.

Si el usuario no tiene avatar, se muestra un fallback visual.

### Comportamiento del boton `Guardar cambios`

El boton esta deshabilitado mientras el perfil se esta cargando o mientras una peticion de guardado esta en curso.

Antes de enviar la peticion:

- valida que exista `auth.user.id`
- valida que el nombre no este vacio

Despues del intento de guardado:

- muestra `toast` de exito si la operacion sale bien
- muestra `toast` informativo si no habia cambios
- muestra `toast` de error si el backend falla

### Decision tecnica actual

Actualmente se guarda en BD la URL visual del recurso (`avatar` y `banner`). Esto permite que el cambio se refleje rapido en frontend, pero tiene una limitacion: si se usan URLs firmadas con expiracion, pueden dejar de ser validas con el tiempo.

La mejora recomendada a futuro es guardar una referencia estable:

- el `id` del item, o
- la ruta interna del archivo en storage

y generar la URL final solo en el momento de mostrar la imagen.

---

## Actualizacion de pruebas automatizadas del frontend

Se actualiza la documentacion de testing porque la seccion anterior habia quedado desfasada respecto al estado real del proyecto.

### Estado actual de la suite

- Herramienta: Vitest.
- Ejecucion usada para validar: npm test -- --run desde la carpeta ludoScript.
- Resultado actual verificado: 5 archivos de test pasando y 31 tests pasando.

### Tests cubiertos actualmente

- `ludoScript/src/composables/__tests__/useAdaptiveSelection.spec.js`
  - 4 tests.
  - Cubre la seleccion adaptativa local: categorias debiles, reparto de preguntas y memoria de refuerzo.

- `ludoScript/src/composables/__tests__/useQuizLoader.spec.js`
  - 12 tests.
  - Cubre la carga estatica, la carga desde PDF local, el modo mixto y el modo adaptativo local con fallback.

- `ludoScript/src/composables/__tests__/useQuizController.spec.js`
  - 13 tests.
  - Cubre la seleccion de respuesta, conteo de resultados, formula de puntuacion, finalizacion de sesion, reinicio y navegacion al modo adaptativo.

- `ludoScript/src/components/shared/__tests__/UserInfo.spec.js`
  - 1 test.
  - Verifica que el contador de categorias visibles usa `QUIZ_CATEGORIES.length`, alineado con los 5 bloques publicos actuales.

- `ludoScript/src/components/home/__tests__/HomePdfPanel.spec.js`
  - 1 test.
  - Verifica el fallback cuando Gemini no esta disponible: aparicion del CTA y navegacion correcta al modo tutorial local.

### Nota de mantenimiento

La documentacion anterior mencionaba 23 pruebas. Ese dato ya no es correcto: el estado actual consolidado del frontend es de 31 pruebas pasando.
