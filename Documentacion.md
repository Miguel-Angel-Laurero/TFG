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

- backend/src/models/CategoryStat.model.js — Modelo Sequelize para la tabla category_stats. Almacena (userId, category) con índice único y acumula correct/total por fila.
- backend/src/controllers/categoryStats.controller.js — GET devuelve los stats del usuario autenticado; POST /batch hace upsert incremental validando cada entrada individualmente.
- backend/src/routes/categoryStats.routes.js — Monta las dos rutas bajo authMiddleware.

Frontend:

- ludoScript/src/api/categoryStats.service.js — Capa HTTP: getAll() y submitBatch(entries).
- ludoScript/src/composables/useCategoryStats.js — Lógica de sesión: trackAnswer(category, isCorrect) acumula en memoria; submitSession() envía el batch al finalizar; resetSession() limpia al reiniciar.
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

## Selección de PDFs para minijuegos y panel redimensionable (06/04)

### Objetivo

Permitir al usuario elegir qué PDFs concretos quiere usar como fuente de contenido para los minijuegos Quiz y Flashcards, proporcionando visibilidad del estado activo según las heurísticas de Nielsen. Además se corrigió la codificación de caracteres en los nombres de archivos y se añadió un panel de PDFs redimensionable.

---

### Archivos modificados

| Archivo                                           | Cambio                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `ludoScript/src/components/home/Home.vue`         | Estado `selectedFiles`, banner de modo, panel redimensionable            |
| `ludoScript/src/components/home/HomePdfPanel.vue` | `defineModel` para `selectedFiles`, UI dinámica, botones siempre activos |
| `ludoScript/src/components/home/GameGrid.vue`     | Prop `selectedFiles`, texto dinámico, pasa `pdfIds` a la ruta            |
| `backend/src/controllers/pdf.controller.js`       | Fix de codificación UTF-8 en `originalName`                              |

---

### Sistema de selección de PDFs

**Estado reactivo compartido**

`Home.vue` declara `const selectedFiles = ref([])` y lo pasa al panel y a la cuadrícula de juegos mediante props y `v-model`:

```
Home.vue
 ├─ selectedFiles (ref([]))
 ├─ <HomePdfPanel v-model:selectedFiles="selectedFiles" />   ← escribe la selección
 └─ <GameGrid :selectedFiles="selectedFiles" />              ← lee la selección
```

`HomePdfPanel` usa `defineModel('selectedFiles')` (Vue 3.4+) para actualizar el array del padre directamente, sin emit manual.

**Lógica de selección**

Al hacer clic en una fila del PDF se llama a `toggleSelect(id)`:

```js
function toggleSelect(id) {
  if (selectedFiles.value.includes(id)) {
    selectedFiles.value = selectedFiles.value.filter((x) => x !== id);
  } else {
    selectedFiles.value = [...selectedFiles.value, id];
  }
}
```

Se reemplazó el `Set` anterior por un array plano para que Vue detecte los cambios de forma reactiva sin necesidad de `new Set()`.

**Comportamiento por defecto (Biblioteca del Sistema)**

Si `selectedFiles` está vacío al pulsar un botón de juego, la función `playSelected()` navega sin `pdfIds` en la query. Los minijuegos interpretan la ausencia de `pdfIds` como "usar contenido base de Node.js" (ficheros JSON estáticos de `/public`).

```js
function playSelected(game) {
  const query = { game };
  if (selectedFiles.value.length > 0) {
    query.pdfIds = selectedFiles.value.join(",");
  }
  router.push({ path: "/in-game-view/", query });
}
```

**Texto dinámico en botones**

Los botones de Quiz y Flashcards muestran el modo activo:

- Sin selección → `Quiz (General)` / `Cards (General)`
- Con selección → `Quiz (2 archivos)` / `Cards (2 archivos)`

Lo mismo ocurre en las tarjetas de `GameGrid.vue` (`Empezar (General) →` / `Empezar (2 archivos) →`).

**Aviso educativo (Nielsen: Prevención de errores)**

Cuando hay PDFs subidos pero ninguno seleccionado se muestra un banner ámbar no bloqueante:

> 💡 Selecciona uno o más PDFs para una experiencia personalizada, o juega en modo General.

Los botones siguen activos para no impedir el flujo.

**Banner de Estado de Fuente**

Encima de la cuadrícula de minijuegos aparece un banner que indica el modo actual:

- `📚 Modo: General — biblioteca del sistema`
- `📂 Modo: Personalizado (n archivo/s seleccionado/s)`

---

### Corrección de codificación de nombres de archivo

**Problema**

Multer decodifica el header `Content-Disposition` del formulario multipart como Latin-1 (ISO-8859-1) por defecto. Los navegadores modernos envían los nombres de archivo en UTF-8, por lo que caracteres fuera del rango ASCII (tildes, ñ, etc.) se almacenaban y mostraban con caracteres corruptos.

**Solución**

En `pdf.controller.js`, justo antes de llamar a `UserPdf.create()`, se re-codifica el nombre:

```js
const originalName = Buffer.from(req.file.originalname, "latin1").toString(
  "utf8",
);
```

Esta técnica re-interpreta los bytes del string Latin-1 como UTF-8, restituyendo los caracteres originales sin alterar la infraestructura de multer ni el modelo de datos.

---

### Panel de PDFs redimensionable

**Implementación**

Se sustituyó la clase estática `w-96` del `<aside>` izquierdo por un estilo dinámico `width: panelWidth + 'px'`, y se añadió una barra de arrastre entre el panel y el contenido central:

```html
<!-- Resize handle -->
<div
  class="w-1.5 shrink-0 cursor-col-resize hover:bg-indigo-500/40"
  @mousedown.prevent="startDrag"
/>
```

Los eventos de ratón se escuchan en el elemento raíz `<main>` para capturar el movimiento aunque el puntero salga del handle:

```js
const MIN_WIDTH = 240; // px mínimo para que el panel sea usable
const MAX_WIDTH = 600; // px máximo para no invadir el contenido central
const panelWidth = ref(384); // valor inicial equivalente a w-96

function startDrag() {
  dragging = true;
}
function onDrag(e) {
  if (dragging)
    panelWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
}
function stopDrag() {
  dragging = false;
}
```

El ancho se calcula directamente desde `e.clientX` porque el panel empieza en x=0 de la ventana. Los límites (240–600 px) evitan que el usuario colapse el panel o invada el área de minijuegos.

---

## Rediseño UX de la pantalla Home — Heurísticas de Nielsen y Dark Mode Premium (06/04)

### Objetivo

Refactorizar la interfaz principal aplicando las 10 Heurísticas de Nielsen, principios de Gamificación y un estilo Dark Mode Premium para maximizar la retención del estudiante.

---

### Archivos modificados

| Archivo                                              | Cambio                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ludoScript/src/components/home/GameGrid.vue`        | Glassmorphism, hover elevado, skeleton de carga, tooltip preventivo, botón contextual, gradiente en títulos |
| `ludoScript/src/components/home/CategoryHeatMap.vue` | Anillos SVG de progreso, nueva rampa de color, eliminación del bloque semanal                               |
| `ludoScript/src/components/home/HomePdfPanel.vue`    | Estilo `ring-2 ring-indigo-500` en PDFs seleccionados, `defineModel pdfCount`                               |
| `ludoScript/src/components/home/Home.vue`            | Estado `pdfCount` compartido entre panel y grid                                                             |

---

### Tarjetas de juego con Glassmorphism (GameGrid.vue)

Las tarjetas de Quiz y Flashcards se rediseñaron abandonando el fondo opaco.

**Estilo aplicado:**

- Fondo: `bg-slate-800/50 backdrop-blur-md border border-slate-700/50`
- Hover elevado: `hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-[0_8px_32px_rgba(99,102,241,0.18)]`
- Icono: `group-hover:brightness-125 group-hover:scale-110`
- Título con gradiente: `bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400`

**Botón contextual (Ley de Fitts):**

El texto del botón cambia según la fuente de contenido activa:

- `Estudiar General →` cuando no hay PDFs seleccionados
- `Estudiar mis PDFs →` cuando hay selección activa

**Tooltip de prevención de errores (Nielsen #5):**

Cuando el usuario tiene PDFs cargados pero ninguno seleccionado, aparece un aviso inline bajo la descripción del juego:

> 💡 ¿Quieres usar tus PDFs? Selecciónalos a la izquierda.

No bloquea el flujo; los botones siguen activos.

**Skeleton de carga (`isLoading`):**

Mientras `games.json` carga o el usuario navega al minijuego, se muestran 2 tarjetas con `animate-pulse` en lugar de un espacio en blanco.

**Nueva prop `pdfCount`:**

Se añadió la prop `:pdfCount` para que el tooltip solo se muestre cuando realmente existe al menos un PDF subido (evita avisos vacíos en cuentas nuevas).

---

### Anillos SVG de progreso (CategoryHeatMap.vue — home)

Se sustituyeron los bloques de color sólido (`aspect-square` con `backgroundColor`) por anillos circulares SVG que comunican el porcentaje con más precisión visual.

**Implementación:**

- Radio del arco: `r=18`, circunferencia: `2π×18 ≈ 113.1`
- `stroke-dashoffset` = `CIRCUMFERENCE × (1 − percent/100)` con `transition-all duration-700`
- Track de fondo en `#1e293b` (slate-800)

**Nueva rampa de color:**

| Rango     | Color   | Hex       |
| --------- | ------- | --------- |
| 0–40 %    | Rojo    | `#ef4444` |
| 41–70 %   | Naranja | `#f97316` |
| 71–100 %  | Verde   | `#22c55e` |
| Sin datos | Gris    | `#374151` |

Se eliminaron los niveles intermedios "Bien (60-80 %)" y "Débil (< 40 %)" de la escala anterior para una rampa semáforo más intuitiva.

---

### Estilo de selección en HomePdfPanel.vue

El indicador visual de PDF seleccionado pasó de un borde lateral (`border-l-4 border-l-indigo-500`) a un contorno completo:

```
ring-2 ring-indigo-500 bg-indigo-500/10
```

Se añadió `defineModel('pdfCount')` que se sincroniza automáticamente al cargar, subir y borrar PDFs. Home.vue declara `const pdfCount = ref(0)` y lo pasa a ambos componentes hijos.

---

## Resumen semanal movido a ProfileView (06/04)

### Objetivo

El bloque "Resumen semanal" que existía en el panel derecho de la Home se trasladó al perfil del usuario, donde el contexto (historial de progreso) es más adecuado.

---

### Archivos modificados/creados

| Archivo                                              | Cambio                                                                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ludoScript/src/components/profile/WeeklyResume.vue` | **Nuevo.** Componente independiente con la lógica semanal                                                                                                    |
| `ludoScript/src/components/profile/Profile.vue`      | Importa y monta `<WeeklyResume />` entre `CategoryHeatMap` y `PdfManager`                                                                                    |
| `ludoScript/src/components/home/CategoryHeatMap.vue` | Eliminado el bloque "Resumen semanal" del template y las variables `LS_WEEKLY`, `ONE_WEEK_MS`, `weeklySessions`, `hasWeekly` y `weeklyCategories` del script |

---

### WeeklyResume.vue

Nuevo componente en `components/profile/` que reutiliza el mismo patrón de anillos SVG del heatmap de la Home.

**Lógica:**

- Lee `ludoscript_weeklySessions` de `localStorage`
- Filtra las sesiones de los últimos 7 días (`Date.now() - ONE_WEEK_MS`)
- Agrega `correct` y `total` por categoría sobre todas las sesiones filtradas
- Renderiza una cuadrícula `grid-cols-2 sm:grid-cols-3` con un anillo SVG por categoría

**Estilo:** coherente con el resto del perfil (`bg-white/5 border-white/10` en lugar de `bg-slate-800/50`).

**Estado vacío:** muestra un mensaje motivador cuando no hay actividad en los últimos 7 días.
