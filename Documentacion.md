Objetivo

Se ha aÃ±adido una validaciÃ³n del contenido generado por Gemini antes de guardarlo en la base de datos, para evitar persistir respuestas mal formadas o incompletas.

Archivos modificados

Se ha trabajado Ãºnicamente sobre gemini-service.js.

Cambios realizados

Se han creado funciones auxiliares de validaciÃ³n.
En gemini-service.js se aÃ±adieron estas funciones:

isNonEmptyString(value)
validateQuizQuestion(question, index)
validateFlashCard(card, index)
validateGeneratedGameContent(parsed)
Se valida la estructura general de la respuesta de Gemini.
Antes de aceptar el JSON generado, ahora se comprueba que:

la respuesta sea un objeto
exista quizQuestions y sea un array
exista flashCards y sea un array
Se valida el nÃºmero exacto de elementos.
Como el prompt pide exactamente 10 preguntas y 10 flashcards, ahora se comprueba que:

quizQuestions.length === 10
flashCards.length === 10
Se valida cada pregunta del quiz.
Para cada elemento de quizQuestions, se comprueba que:

sea un objeto vÃ¡lido
tenga question con texto
tenga options como array de exactamente 4 elementos
todas las opciones sean strings no vacÃ­os
correct sea un entero entre 0 y 3
Se valida cada flashcard.
Para cada elemento de flashCards, se comprueba que:

sea un objeto vÃ¡lido
tenga question con texto
tenga answer con texto
Se integra la validaciÃ³n en el flujo de generaciÃ³n.
Dentro de generateGameContentFromPdf(...), despuÃ©s de hacer JSON.parse(clean), ahora se llama a validateGeneratedGameContent(parsed) antes de devolver el contenido.

CÃ³mo funciona ahora el flujo

El usuario sube un PDF desde pdf.controller.js.
uploadPdf llama a generateGameContentFromPdf(...).
Gemini devuelve un JSON con quizQuestions y flashCards.
El backend parsea ese JSON.
Se ejecuta la validaciÃ³n nueva.
Si todo es correcto, se guarda en la tabla UserPdf.
Si algo estÃ¡ mal, se lanza un error y no se guarda contenido invÃ¡lido en la base de datos.
MotivaciÃ³n del cambio

Antes de este cambio, el backend solo comprobaba que quizQuestions y flashCards existieran como arrays. Eso permitÃ­a que Gemini devolviera respuestas incompletas o con formato incorrecto y aun asÃ­ pudieran guardarse.

Con esta validaciÃ³n:

se protege la base de datos de datos corruptos
se evita que el frontend falle por estructuras inesperadas
se mantiene una soluciÃ³n simple, sin aÃ±adir librerÃ­as nuevas ni complejidad innecesaria
Comentarios aÃ±adidos

AdemÃ¡s de la lÃ³gica, se han aÃ±adido comentarios en el cÃ³digo para explicar:

quÃ© valida cada funciÃ³n
por quÃ© se hacen esas comprobaciones
en quÃ© punto del flujo se usa la validaciÃ³n
ComprobaciÃ³n realizada

Se ha verificado que:

el archivo sigue teniendo sintaxis correcta
la validaciÃ³n acepta un payload vÃ¡lido
la validaciÃ³n rechaza casos invÃ¡lidos como:
menos de 10 preguntas
preguntas con menos de 4 opciones
valores correct fuera de rango
flashcards con texto vacÃ­o
Impacto en la base de datos

No ha sido necesario cambiar el modelo ni crear una tabla nueva. La tabla actual UserPdf.model.js sigue siendo suficiente, porque:

no se guarda el PDF original
solo se guarda el contenido Ãºtil generado por la IA
ahora ese contenido se guarda con validaciÃ³n previa

---

Mapa de progreso por categorÃ­a (heatmap)

Se ha aÃ±adido un sistema de seguimiento del conocimiento del usuario por Ã¡rea temÃ¡tica del Quiz, con visualizaciÃ³n en forma de mapa de calor en el perfil.

Objetivo

Categorizar las preguntas del Quiz por asignatura tÃ©cnica y registrar los aciertos/errores del usuario por categorÃ­a. El perfil muestra un mapa de calor (verde â†’ rojo) para que el usuario identifique de un vistazo sus puntos fuertes y sus Ã¡reas de mejora.

CategorÃ­as definidas

Las preguntas de quizQuestions.json se han ampliado con un campo "category". Las categorÃ­as actuales son:

tipos-coercion â€” Tipos y CoerciÃ³n
arrays-metodos â€” Arrays y MÃ©todos
scope-variables â€” Scope y Variables
asincronia â€” AsincronÃ­a
funciones â€” Funciones
sintaxis-es6 â€” Sintaxis ES6+
objetos â€” Objetos

Archivos creados

Backend:

- backend/src/models/CategoryStat.model.js â€” Modelo Sequelize para la tabla category_stats. Almacena (userId, category) con Ã­ndice Ãºnico y acumula correct/total por fila. Ampliado posteriormente con campos de dificultad (ver secciÃ³n "Sistema de dificultad adaptativa").
- backend/src/controllers/categoryStats.controller.js â€” GET devuelve los stats del usuario autenticado; POST /batch hace upsert incremental validando cada entrada individualmente. Ampliado posteriormente con lÃ³gica de desbloqueo de nivel (ver secciÃ³n "Sistema de dificultad adaptativa").
- backend/src/routes/categoryStats.routes.js â€” Monta las dos rutas bajo authMiddleware.

Frontend:

- ludoScript/src/api/categoryStats.service.js â€” Capa HTTP: getAll() y submitBatch(entries).
- ludoScript/src/composables/useCategoryStats.js â€” LÃ³gica de sesiÃ³n: trackAnswer(category, isCorrect) acumula en memoria; submitSession() envÃ­a el batch al finalizar; resetSession() limpia al reiniciar. Ampliado posteriormente con soporte de dificultad por pregunta (ver secciÃ³n "Sistema de dificultad adaptativa").
- ludoScript/src/components/profile/CategoryHeatMap.vue â€” Componente visual: cuadrÃ­cula de 7 tarjetas coloreadas segÃºn el porcentaje de acierto (â‰¥90% verde esmeralda, 70â€“89% amarillo, 50â€“69% naranja, <50% rojo). Muestra estado vacÃ­o hasta que el usuario complete el Quiz por primera vez.

Archivos modificados

- ludoScript/public/quizQuestions.json â€” Campo "category" aÃ±adido a cada una de las 15 preguntas existentes.
- backend/src/models/index.js â€” Importa CategoryStat, declara User hasMany CategoryStat con onDelete CASCADE y lo exporta.
- backend/src/routes/index.js â€” Registra /api/category-stats.
- ludoScript/src/components/minigames/Quiz.vue â€” Importa useCategoryStats; llama trackAnswer en cada respuesta, submitSession al terminar y resetSession al reiniciar.
- ludoScript/src/components/profile/Profile.vue â€” Inserta <CategoryHeatMap /> entre UserStats y PdfManager.

CÃ³mo funciona el flujo

1. El usuario responde una pregunta del Quiz.
2. selectAnswer llama a trackAnswer(category, isCorrect), que acumula los contadores en memoria (sessionStats).
3. Al responder la Ãºltima pregunta, handleNext llama primero a submitSession(), que envÃ­a el batch al endpoint POST /api/category-stats/batch.
4. El backend hace findOrCreate por (userId, category) e incrementa correct y total de forma acumulativa.
5. Al abrir el perfil, CategoryHeatMap.vue llama a GET /api/category-stats y renderiza la cuadrÃ­cula con el color correspondiente a cada Ã¡rea.

Notas de diseÃ±o

- Las preguntas generadas desde PDF no tienen campo category, por lo que trackAnswer las ignora automÃ¡ticamente (comprueba que category sea truthy).
- submitSession no lanza excepciÃ³n aunque el backend falle, para no interrumpir el flujo de recompensas.
- La tabla se crea automÃ¡ticamente al arrancar el servidor gracias a sync({ alter: true }) en desarrollo.
- No se ha modificado ningÃºn modelo existente ni ninguna tabla preexistente.

Cambios de 05/04:
Resumen de cambios
Datos
quizQuestions.json â€” Campo "category" aÃ±adido a las 15 preguntas existentes, asignando cada una a una de 7 categorÃ­as temÃ¡ticas.
Backend (3 ficheros nuevos + 2 modificados)
Nuevos:

CategoryStat.model.js â€” Modelo Sequelize para la tabla category_stats. Ãndice Ãºnico sobre (userId, category) para acumular correct y total.
categoryStats.controller.js â€” getMine (GET) y submitBatch (POST) con upsert incremental y validaciÃ³n de cada entrada.
categoryStats.routes.js â€” Rutas protegidas con authMiddleware.
Modificados:

index.js â€” Importa CategoryStat, declara la asociaciÃ³n User hasMany CategoryStat con onDelete: CASCADE y lo exporta.
index.js â€” Registra /api/category-stats.
Frontend (3 ficheros nuevos + 3 modificados)
Nuevos:

categoryStats.service.js â€” Capa HTTP: getAll() y submitBatch(entries).
useCategoryStats.js â€” trackAnswer, submitSession y resetSession. Ignora preguntas sin categorÃ­a (PDFs de Gemini).
CategoryHeatMap.vue â€” Mapa de calor con 7 tarjetas coloreadas (verde â‰¥90%, amarillo 70â€“89%, naranja 50â€“69%, rojo <50%), estado vacÃ­o inicial y leyenda.
Modificados:

Quiz.vue â€” Integra useCategoryStats: trackAnswer en selectAnswer, submitSession antes de la recompensa en handleNext, resetSession en handleRestart.
Profile.vue â€” AÃ±ade <CategoryHeatMap /> entre UserStats y PdfManager.
Documentacion.md â€” SecciÃ³n nueva al final documentando todo el sistema.
La BD se auto-sincroniza al arrancar (no requiere migraciÃ³n manual en dev).

Â¿CÃ³mo funciona la subida de PDF?
Usuario selecciona PDF
â”‚
â–¼
PdfManager.vue â†’ handleFileChange()
â””â”€ pdfService.uploadPdf(file) â†â”€â”€â”€ axios POST /api/pdfs (FormData)
â”‚
backend: pdf.routes.js
multer guarda buffer en RAM
â”‚
pdf.controller.js â†’ uploadPdf()
llama a generateGameContentFromPdf()
â”‚
gemini-service.js 1. sube PDF a Files API de Gemini 2. llama a generateContent() 3. parsea JSON de la respuesta 4. valida estructura (10 quiz + 10 flash)
â”‚
UserPdf.create() â†’ guarda en BD
â”‚
responde { id, originalName, createdAt }
â”‚
â–¼
PdfManager.vue recibe la metadata
â””â”€ aÃ±ade el PDF a la lista (pdfs.push)
â””â”€ muestra los botones "Jugar Quiz" / "Flashcards"

Usuario pulsa "Jugar Quiz" (con pdfId)

---

## IntegraciÃ³n con la API de Gemini para procesado de PDF

### Objetivo

Permitir al usuario subir un documento PDF y generar automÃ¡ticamente 20 preguntas de Quiz y 20 Flashcards sobre su contenido usando la IA de Google Gemini. El resultado se almacena en la BD para que el usuario pueda repetir los cuestionarios cuantas veces quiera sin volver a llamar a la IA.

---

### Archivos implicados

| Archivo                                             | Rol                                                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `backend/src/controllers/gemini-service.js`         | Comunica con la API de Gemini: sube el PDF, lanza el prompt y parsea la respuesta |
| `backend/src/controllers/pdf.controller.js`         | Recibe el PDF del frontend, llama a gemini-service y guarda el resultado en BD    |
| `backend/src/routes/pdf.routes.js`                  | Define las rutas REST del recurso PDF (protegidas con JWT)                        |
| `backend/src/models/UserPdf.model.js`               | Modelo Sequelize de la tabla `UserPdfs`                                           |
| `ludoScript/src/api/pdf.service.js`                 | Capa HTTP del frontend: uploadPdf, listPdfs, deletePdf                            |
| `ludoScript/src/components/profile/PdfManager.vue`  | UI de gestiÃ³n de PDFs: subida, lista y botones de juego                           |
| `ludoScript/src/components/home/Home.vue`           | Subida rÃ¡pida desde la home con acceso directo al juego tras procesar             |
| `ludoScript/src/composables/useActivitySession.js`  | Carga las preguntas desde la API cuando hay `pdfId` en la URL                     |
| `ludoScript/src/components/minigames/Quiz.vue`      | Selecciona la URL de preguntas segÃºn si hay `pdfId` en la query                   |
| `ludoScript/src/components/minigames/FlashCard.vue` | Igual que Quiz.vue pero para flashcards                                           |

---

### CÃ³mo se envÃ­a el PDF a Gemini (Files API)

El PDF no se manda codificado en base64 dentro del cuerpo de la peticiÃ³n (mÃ©todo `inlineData`), porque eso infla el tamaÃ±o un 33 % y la API impone un lÃ­mite de ~20 MB de payload. En su lugar se usa la **Files API** de Gemini:

1. `multer` (con `memoryStorage`) recibe el PDF y lo guarda en RAM como un `Buffer`.
2. `uploadBufferToFilesAPI()` en `gemini-service.js` escribe ese buffer en un fichero temporal en `os.tmpdir()`.
3. Se llama a `fileManager.uploadFile(tempPath, { mimeType })`, que sube el fichero a los servidores de Google y devuelve un objeto `file` con una `uri` permanente.
4. El fichero temporal se elimina inmediatamente en el bloque `finally`.
5. La URI recibida se incluye en el prompt como `fileData: { mimeType, fileUri }`.
6. Tras recibir la respuesta de Gemini, el fichero se elimina de los servidores de Google con `fileManager.deleteFile(file.name)`.

```
Buffer (RAM)
   â”‚
   â–¼ fs.writeFileSync
Fichero temporal (os.tmpdir)
   â”‚
   â–¼ fileManager.uploadFile()
Gemini Files API  â”€â”€â†’  uri: "files/abc123"
   â”‚                        â”‚
   â–¼ fs.unlinkSync()        â–¼
Fichero borrado     generateContent({ fileData: { fileUri } })
                              â”‚
                              â–¼
                       Respuesta JSON de Gemini
                              â”‚
                              â–¼ fileManager.deleteFile()
                       Fichero borrado de Gemini
```

---

### Prompt y salida estructurada

El prompt que se envÃ­a a Gemini es deliberadamente simple, sin ejemplos de JSON, porque la estructura se impone mediante `responseSchema` en `generationConfig`:

```
Analiza el documento adjunto y genera exactamente 20 preguntas de quiz tipo test
y 20 flashcards sobre su contenido, en espaÃ±ol.

Reglas:
- "correct" es el Ã­ndice (0-3) de la opciÃ³n correcta
- Las 4 opciones deben ser plausibles pero solo una correcta
- Las respuestas de flashcards: mÃ¡ximo 2 frases
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
    correct: { type: "integer" }, // Ã­ndice 0â€“3 de la opciÃ³n correcta
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

Al usar `responseSchema`, Gemini garantiza que la respuesta es JSON vÃ¡lido y cumple el esquema antes de devolverla. Por eso el Ãºnico paso de validaciÃ³n en el backend consiste en comprobar que `quizQuestions` y `flashCards` existen como arrays â€” sin comprobaciones campo por campo.

---

### Almacenamiento en base de datos (tabla UserPdfs)

El PDF original nunca se persiste. Solo se guarda el contenido generado por Gemini.

Modelo `UserPdf` (tabla `UserPdfs`):

| Columna                   | Tipo        | DescripciÃ³n                                     |
| ------------------------- | ----------- | ----------------------------------------------- |
| `id`                      | INTEGER PK  | Identificador autoincremental                   |
| `userId`                  | INTEGER FK  | Propietario del PDF (referencia a Users)        |
| `originalName`            | STRING(255) | Nombre del fichero tal como lo subiÃ³ el usuario |
| `quizQuestions`           | JSON        | Array de 20 preguntas generadas por Gemini      |
| `flashCards`              | JSON        | Array de 20 flashcards generadas por Gemini     |
| `createdAt` / `updatedAt` | DATE        | Gestionados automÃ¡ticamente por Sequelize       |

El guardado ocurre una Ãºnica vez, en `uploadPdf()` del controlador, justo despuÃ©s de recibir y validar la respuesta de Gemini:

```js
const pdf = await UserPdf.create({
  userId: req.user.id,
  originalName: req.file.originalname,
  quizQuestions,
  flashCards,
});
```

La tabla se crea automÃ¡ticamente al arrancar el servidor en desarrollo gracias a `sequelize.sync({ alter: true })`.

---

### Rutas REST del recurso PDF

Todas las rutas estÃ¡n protegidas con `authMiddleware` (JWT).

| MÃ©todo   | Ruta                       | DescripciÃ³n                                                                                   |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `POST`   | `/api/pdfs`                | Sube un PDF, llama a Gemini y guarda el resultado. Responde `{ id, originalName, createdAt }` |
| `GET`    | `/api/pdfs`                | Lista todos los PDFs del usuario (solo metadata, sin preguntas)                               |
| `GET`    | `/api/pdfs/:id/quiz`       | Devuelve el array `quizQuestions` del PDF indicado                                            |
| `GET`    | `/api/pdfs/:id/flashcards` | Devuelve el array `flashCards` del PDF indicado                                               |
| `DELETE` | `/api/pdfs/:id`            | Elimina el registro de BD (el PDF original no existe)                                         |

El ownership check en las rutas de lectura y borrado se hace con `WHERE id = :id AND userId = req.user.id`, de modo que un usuario nunca puede acceder a los PDFs de otro (devuelve 404 sin revelar si el recurso existe).

---

### CÃ³mo se muestran las preguntas al usuario

El composable `useActivitySession` es el punto central que carga las preguntas, tanto estÃ¡ticas como generadas por IA:

```
/in-game-view/?game=Quiz              â†’ carga /quizQuestions.json   (preguntas estÃ¡ticas de JS)
/in-game-view/?game=Quiz&pdfId=5      â†’ GET /api/pdfs/5/quiz        (preguntas del PDF del usuario)
/in-game-view/?game=Flashcards&pdfId=5 â†’ GET /api/pdfs/5/flashcards
```

La detecciÃ³n se hace en `Quiz.vue` y `FlashCard.vue`:

```js
const quizUrl = route.query.pdfId
  ? `/api/pdfs/${route.query.pdfId}/quiz`
  : "/quizQuestions.json";
```

`useActivitySession` detecta si la URL empieza por `/api/` y usa axios (con JWT) en vez de `fetch` simple. Para evitar la duplicaciÃ³n del prefijo con el `baseURL` de axios (`/api`), se hace `.slice(4)` antes de pasarla:

```js
if (jsonUrl.startsWith("/api/")) {
  const res = await api.get(jsonUrl.slice(4)); // "/api/pdfs/5/quiz" â†’ "/pdfs/5/quiz"
  data = res.data;
}
```

Una vez cargadas, las preguntas se barajan con `shuffle()` y se presentan en `Quiz.vue` / `FlashCard.vue` exactamente igual que las estÃ¡ticas.

---

### CÃ³mo el usuario puede repetir los cuestionarios

El contenido generado por Gemini no es efÃ­mero: **se guarda en la BD en el momento de la subida y permanece hasta que el usuario borra el PDF explÃ­citamente**. Esto permite:

1. **Desde la Home:** tras subir un PDF aparecen los botones "Quiz" y "Flashcards" que navegan con el `pdfId` reciÃ©n creado.
2. **Desde el Perfil â†’ secciÃ³n "Mis PDFs":** `PdfManager.vue` lista todos los PDFs del usuario (llamando a `GET /api/pdfs`) y muestra botones "Jugar Quiz" y "Flashcards" para cada uno. El usuario puede volver cuantas veces quiera.

Nota tÃ©cnica â€” Multijugador: temporizador y correcciÃ³n de bug

- SÃ­ntoma: cuando todos los jugadores respondÃ­an antes de que expirase el tiempo de una pregunta, en la siguiente pregunta se observaba una alternancia entre dos contadores (el contador residual de la pregunta anterior y el nuevo), es decir, los ticks del cronÃ³metro se solapaban.
- Causa raÃ­z: en la implementaciÃ³n inicial el `setInterval` que emitÃ­a `game:timer` se almacenaba en una variable local dentro de `advanceQuestion()`. Si `revealQuestion()` se ejecutaba antes de que expirase el `setTimeout` de fin de pregunta (por ejemplo porque todos respondieron rÃ¡pido), no habÃ­a referencia disponible para cancelar ese `setInterval`, por lo que seguÃ­a emitiendo ticks.
- SoluciÃ³n aplicada: el `setInterval` ahora se guarda en el objeto `room` como `room.tickInterval`. Se limpian explÃ­citamente `room.tickInterval` y `room.questionTimer` en `revealQuestion()`, en el inicio de `advanceQuestion()` y en `destroyRoom()`, llamando a `clearInterval(...)` y `clearTimeout(...)` segÃºn corresponda.
- Resultado: cada nueva pregunta comienza con un contador limpio (p. ej. 20s) y no quedan ticks residuales de preguntas anteriores. Al contestar antes de tiempo, el servidor limpia los timers y la siguiente pregunta arranca correctamente.

Pruebas recomendadas:

1. Crear una sala con al menos 2 jugadores.
2. Iniciar la partida y responder la primera pregunta inmediatamente (antes de 1s).
3. Comprobar en ambos clientes que la segunda pregunta muestra un Ãºnico contador descendente, sin alternancias ni aceleraciones.

Si quieres, puedo aÃ±adir una prueba automatizada que simule dos sockets respondiendo rÃ¡pido y verifique que no quedan `tickInterval` activos entre preguntas.

Nota tÃ©cnica â€” Multijugador: flujo del nombre de usuario en sockets

- Flujo actual:
  1. En `auth.controller.js`, al hacer `login` o `register`, el backend firma un JWT con `id`, `username` y `role`.
  2. El frontend abre la conexiÃ³n de Socket.IO enviando ese token en `socket.handshake.auth.token`.
  3. En `backend/src/socket/index.js`, el middleware valida el JWT y copia sus datos a `socket.user = { id, username }`.
  4. En `backend/src/socket/gameHandler.js`, al crear o unirse a una sala se pasa `socket.user.username` a `roomManager`.
  5. En `backend/src/socket/roomManager.js`, ese valor se guarda en cada entrada de `room.players` y luego `getPlayersPublic(room)` lo serializa como `username`.
  6. El cliente recibe `players` y `ranking` y los renderiza en el lobby, la clasificaciÃ³n lateral y la tabla final.

- Bug detectado:
  - El token se estaba firmando solo con `id` y `role`.
  - El socket intentaba leer `payload.username`, pero ese campo no existÃ­a en el JWT.
  - Consecuencia: en multijugador, los jugadores llegaban con `username = undefined`, asÃ­ que la UI mostraba la fila, el icono y el estado `HOST`, pero no el nombre.

- SoluciÃ³n aplicada:
  - Se aÃ±adiÃ³ `username` al payload del JWT en `register` y `login`.
  - Esto no introduce un riesgo relevante por sÃ­ mismo, porque el nombre de usuario no es un secreto; simplemente deja disponible en el token un dato pÃºblico que el servidor ya conocÃ­a.
  - El backend sigue validando la firma del JWT, asÃ­ que el cliente no puede inventarse un `username` arbitrario sin invalidar el token.

- ImplicaciÃ³n operativa:
  - Los tokens emitidos antes de este cambio no contienen `username`.
  - Para ver los nombres correctamente en multijugador, hay que cerrar sesiÃ³n y volver a iniciar sesiÃ³n para obtener un JWT nuevo.

```
```
Nota tÃ©cnica â€” Multijugador: botÃ³n "Volver" al terminar o al cerrar la sala

- Flujo esperado:
  1. Cuando la partida termina, el servidor emite `game:finished` con el `ranking`.
  2. El store multijugador guarda ese ranking y cambia `status` a `finished`.
  3. `MultiplayerResults.vue` muestra la clasificaciÃƒÂ³n final.
  4. Al pulsar `Volver al inicio`, el cliente debe abandonar la sala, desconectar el socket, resetear el store y navegar a `/`.
  5. Si el host abandona durante lobby o partida, el servidor emite `room:closed`.
  6. El store cambia `status` a `closed`, conserva el mensaje de error y desconecta el socket.
  7. `MultiplayerView.vue` muestra la vista "La sala ha sido cerrada" con el botÃƒÂ³n `Volver`.

- Bug detectado:
  - El botÃƒÂ³n `Volver` del estado `closed` llamaba a `mp.$reset()`.
  - Ese store estÃƒÂ¡ definido como setup store de Pinia, y en esa implementaciÃƒÂ³n no existÃƒÂ­a un `$reset` personalizado expuesto desde `multiplayer.store.js`.
  - AdemÃƒÂ¡s, ese handler no navegaba al home; solo intentaba devolver el estado a `idle` dentro de la propia ruta `/multiplayer/`.
  - Consecuencia: cuando el host cerraba la sala, el botÃƒÂ³n no restauraba correctamente el estado y no llevaba al usuario de vuelta al inicio.

- SoluciÃƒÂ³n aplicada:
  - Se expuso una acciÃƒÂ³n pÃƒÂºblica `resetState()` en `ludoScript/src/stores/multiplayer.store.js`.
  - `leaveRoom()` reutiliza ahora ese mismo reseteo interno tras emitir `room:leave` y desconectar el socket.
  - En `ludoScript/src/views/MultiplayerView.vue`, el botÃƒÂ³n del estado `closed` sustituye `mp.$reset()` por `mp.resetState()` y despuÃƒÂ©s ejecuta `router.push('/')`.

- Resultado:
  - En partida finalizada, el botÃƒÂ³n de resultados sigue el flujo correcto: salir de la sala, limpiar estado y volver al inicio.
  - En sala cerrada por el host, el botÃƒÂ³n `Volver` vuelve a funcionar de forma consistente: limpia el store y navega al home.

```
Primera vez:
  Subir PDF â†’ Gemini genera 20 preguntas â†’ BD guarda â†’ jugar

Siguientes veces:
  PdfManager â†’ "Jugar Quiz" â†’ GET /api/pdfs/:id/quiz â†’ BD devuelve preguntas â†’ jugar
                                         â†‘
                              (sin llamada a Gemini)
```

---

### Flujo completo de extremo a extremo

```
[Usuario]  Selecciona un PDF en Home.vue o PdfManager.vue
    â”‚
    â–¼ axios POST /api/pdfs  (multipart/form-data)
[Backend]  multer recibe el buffer en RAM
    â”‚
    â–¼ pdf.controller.js â†’ generateGameContentFromPdf(buffer, mimeType)
[gemini-service.js]
    â”œâ”€ 1. Escribe buffer en fichero temporal (os.tmpdir)
    â”œâ”€ 2. fileManager.uploadFile() â†’ obtiene uri en Gemini Files API
    â”œâ”€ 3. Elimina fichero temporal
    â”œâ”€ 4. model.generateContent({ responseSchema, fileData: { fileUri } })
    â”œâ”€ 5. Parsea JSON de la respuesta
    â””â”€ 6. fileManager.deleteFile() â†’ limpia Gemini Files API
    â”‚
    â–¼ { quizQuestions: [...20], flashCards: [...20] }
[Backend]  UserPdf.create({ userId, originalName, quizQuestions, flashCards })
    â”‚
    â–¼ { id, originalName, createdAt }
[Frontend] Home.vue / PdfManager.vue muestra botones "Quiz" y "Flashcards"
    â”‚
    â–¼ router.push('/in-game-view/?game=Quiz&pdfId=5')
[InGame.vue] monta Quiz.vue con key="Quiz-5"
    â”‚
    â–¼ useActivitySession('/api/pdfs/5/quiz')
    â”œâ”€ api.get('/pdfs/5/quiz')  (axios con JWT)
    â”‚
    â–¼ [Backend] pdf.controller.js â†’ getPdfQuiz()
    â”‚           UserPdf.findOne({ id:5, userId }) â†’ res.json(quizQuestions)
    â”‚
    â–¼ items.value = shuffle(data) â†’ el usuario juega
```

â”‚
â–¼
router.push({ name: 'InGame', query: { game: 'Quiz', pdfId: pdf.id } })
â”‚
â–¼
InGameView.vue / Quiz.vue
â””â”€ useActivitySession("/api/pdfs/:id/quiz")
â””â”€ api.get("/api/pdfs/5/quiz") â†â”€â”€ axios GET con JWT
â”‚
pdf.controller.js â†’ getPdfQuiz()
lee quizQuestions de la BD (ya generadas)
responde el array JSON
â”‚
â–¼
items.value = shuffle(data) â†’ empieza el juego

---

## Sistema de dificultad adaptativa

### Objetivo

Clasificar las preguntas del Quiz en tres niveles de dificultad (BÃ¡sico, Intermedio, Avanzado) y garantizar que el usuario no reciba preguntas de un nivel superior al que ha demostrado dominar. Se acompaÃ±a de una pantalla pre-test donde el usuario puede elegir el nivel manualmente o delegar la selecciÃ³n en el motor adaptativo.

---

### Niveles definidos

| Valor | Etiqueta | Criterio                                                            |
| ----- | -------- | ------------------------------------------------------------------- |
| `1`   | FÃ¡cil    | Conceptos fundamentales y sintaxis base                             |
| `2`   | Medio    | Mecanismos internos del lenguaje, APIs menos evidentes              |
| `3`   | DifÃ­cil  | Casos edge, patrones avanzados, comportamientos sutiles del runtime |

---

### Archivos creados

- `backend/scripts/assignDifficulty.js` â€” Script de utilidad que lee `quizQuestions.json`, envÃ­a cada pregunta a Gemini con un prompt de clasificaciÃ³n y escribe el campo `difficulty` de vuelta al fichero. Uso: `node backend/scripts/assignDifficulty.js`. El flag `--force` reclasifica preguntas que ya tienen nivel asignado.

---

### Archivos modificados

**Backend:**

- `backend/src/models/CategoryStat.model.js` â€” Se han aÃ±adido 7 columnas nuevas a la tabla `category_stats`:
  - `unlockedDifficulty` (INTEGER, default 1) â€” nivel mÃ¡ximo desbloqueado por el usuario en esa categorÃ­a.
  - `d1Correct / d1Total` â€” aciertos e intentos acumulados en preguntas de dificultad 1.
  - `d2Correct / d2Total` â€” Ã­dem dificultad 2.
  - `d3Correct / d3Total` â€” Ã­dem dificultad 3.
    Gracias a `sync({ alter: true })` las columnas se aÃ±aden automÃ¡ticamente a la BD en desarrollo sin migraciÃ³n manual.

- `backend/src/controllers/categoryStats.controller.js` â€” Se han extendido dos funciones:
  - `getMine`: ahora devuelve tambiÃ©n `unlockedDifficulty`, `d1Correct`, `d1Total`, `d2Correct`, `d2Total`, `d3Correct`, `d3Total`.
  - `submitBatch`: acepta un campo opcional `difficultyBreakdown` por entrada con la forma `{ "1": { correct, total }, "2": {...}, "3": {...} }`. Tras acumular los contadores, evalÃºa si el usuario cumple el umbral de desbloqueo en el nivel actual de cada categorÃ­a: si `correct / total >= 0.70` con `total >= 5` intentos acumulados en ese nivel, `unlockedDifficulty` se incrementa (mÃ¡ximo 3). La progresiÃ³n es "sticky upward": una vez desbloqueado un nivel no se revierte automÃ¡ticamente.

- `backend/src/controllers/gemini-service.js` â€” Se han aÃ±adido y exportado:
  - `DIFFICULTY_CLASSIFICATION_SCHEMA` â€” JSON Schema que define el contrato de respuesta para la clasificaciÃ³n de dificultad (`{ classifications: [{ id, difficulty }] }`).
  - `callGemini` â€” funciÃ³n de bajo nivel exportada para ser usada desde scripts externos como `assignDifficulty.js`.

**Frontend:**

- `ludoScript/public/quizQuestions.json` â€” Campo `difficulty` (1, 2 o 3) aÃ±adido a las 15 preguntas existentes.

- `ludoScript/src/composables/useCategoryStats.js` â€” `trackAnswer` ahora acepta un cuarto parÃ¡metro `difficulty` (nÃºmero o null). Cuando se proporciona, acumula estadÃ­sticas en `sessionStats[category].byDifficulty[difficulty] = { correct, total }`. `submitSession` incluye ese desglose como `difficultyBreakdown` en el payload enviado al endpoint `/batch`.

- `ludoScript/src/components/minigames/QuizIntro.vue` â€” RediseÃ±ado como pantalla pre-test. Al montarse llama a `categoryStatsService.getAll()` para conocer el `unlockedDifficulty` actual por categorÃ­a. Muestra un selector de cuatro opciones:
  - **Personalizado** â€” selecciÃ³n adaptativa basada en el mapa de niveles desbloqueados por categorÃ­a.
  - **FÃ¡cil** â€” solo preguntas de nivel 1.
  - **Medio** â€” solo preguntas de nivel 2. Bloqueado hasta desbloquear.
  - **DifÃ­cil** â€” solo preguntas de nivel 3. Bloqueado hasta desbloquear.
    Para los niveles bloqueados se muestra una barra de progreso que indica cuÃ¡nto le falta al usuario para desbloquearlo. La opciÃ³n "Recomendado" se califica dinÃ¡micamente sobre el nivel que mÃ¡s sentido tiene segÃºn las categorÃ­as con mayor tasa de error. La preferencia se persiste en `localStorage` bajo la clave `ludoscript_difficulty_pref`. Al pulsar "Comenzar Quiz" emite el evento `start({ difficulty, unlockedMap })`.

- `ludoScript/src/components/minigames/InGame.vue` â€” Escucha el evento `start({ difficulty, unlockedMap })` de `QuizIntro` y los almacena en refs. Solo cuando el juego es `Quiz` se pasan como props al componente `Quiz` mediante `v-bind="quizProps"`.

- `ludoScript/src/components/minigames/Quiz.vue` â€” Acepta dos props nuevas: `difficulty` y `unlockedMap`. Al cargar las preguntas invoca `applyDifficultyFilter(questions)`:
  - Si `difficulty` es 1, 2 o 3: filtra las preguntas con `question.difficulty === difficulty`. Si quedan menos de 5 preguntas se expande incluyendo niveles inferiores hasta alcanzar el mÃ­nimo.
  - Si `difficulty` es `'personalizado'` o `null`: filtra con `question.difficulty <= unlockedMap[question.category]` (usando 1 como valor por defecto si la categorÃ­a no tiene datos). Si quedan menos de 5 se retrocede a mostrar solo nivel 1.
    El filtro se aplica en los tres modos de carga: estÃ¡tico (`quizQuestions.json`), adaptativo (endpoint `/games/adaptive-quiz`) y PDF local (desde `localStorage`).
    `selectAnswer` pasa `currentItem.value.difficulty` como cuarto argumento a `trackAnswer` para registrar el desglose por nivel.

- `ludoScript/src/components/home/Home.vue` â€” Se han aÃ±adido las variables y lÃ³gica que estaban referenciadas en el template pero no definidas en el `<script setup>`: `statsLoading`, `weakCategories`, `hasEnoughData`, `goToAdaptiveQuiz`, `errorRateBadgeClass` y `formatCategoryLabel`. Al montarse carga los stats del usuario y calcula las categorÃ­as dÃ©biles con `calculateWeakCategories`.

---

### LÃ³gica de desbloqueo de nivel

```
Al finalizar cada sesiÃ³n de Quiz, submitBatch recibe por categorÃ­a:
  { category, correct, total, difficultyBreakdown: { "1": { correct, total }, ... } }

Por cada categorÃ­a, el backend evalÃºa:
  nivelActual = unlockedDifficulty            (el nivel que el usuario estÃ¡ practicando)
  accCorrect  = d{nivelActual}Correct         (aciertos acumulados en ese nivel)
  accTotal    = d{nivelActual}Total           (intentos acumulados en ese nivel)

  Si accTotal >= 5 Y accCorrect / accTotal >= 0.70:
    unlockedDifficulty++  (mÃ¡ximo 3)
    â†’ se evalÃºa el nuevo nivel (puede avanzar mÃ¡s de uno en una sola sesiÃ³n)

La progresiÃ³n solo sube, nunca baja automÃ¡ticamente.
```

---

### Flujo completo (modo estÃ¡tico con dificultad manual)

```
[Usuario]  Navega a /in-game-view/?game=Quiz
    â”‚
    â–¼ InGame.vue muestra QuizIntro
[QuizIntro]
    â”œâ”€ GET /api/category-stats â†’ carga unlockedDifficulty por categorÃ­a
    â”œâ”€ Muestra selector: Personalizado / FÃ¡cil / Medio (ðŸ”’?) / DifÃ­cil (ðŸ”’?)
    â””â”€ emit('start', { difficulty: 2, unlockedMap: null })
    â”‚
    â–¼ InGame.vue recibe difficulty=2, pasa props a Quiz.vue
[Quiz.vue]
    â”œâ”€ fetch /quizQuestions.json â†’ 15 preguntas
    â”œâ”€ applyDifficultyFilter([...]) â†’ filtra difficulty === 2
    â”œâ”€ pickRandomIds(filtered, 15) â†’ selecciona hasta 15
    â””â”€ loadDirect(filteredQuestions)
    â”‚
    â–¼ Usuario responde
    selectAnswer â†’ trackAnswer(category, isCorrect, id, difficulty=2)
    â”‚
    â–¼ Ãšltima pregunta â†’ handleNext
    submitSession â†’ POST /api/category-stats/batch
      { category: "asincronia", correct: 3, total: 4,
        difficultyBreakdown: { "2": { correct: 3, total: 4 } } }
    â”‚
    â–¼ Backend evalÃºa umbral
    d2Total acumulado >= 5 Y d2Correct/d2Total >= 0.70
    â†’ unlockedDifficulty pasa de 2 a 3
```

---

## Mejoras de UX en el panel de inicio â€” 08/04

### Objetivo

Limpiar la pantalla de inicio de elementos que saturaban al usuario, mejorar la legibilidad del panel de sesiÃ³n y hacer que los anillos de categorÃ­a sean interactivos para acceder directamente a la revisiÃ³n de errores.

---

### Archivos modificados

| Archivo                                              | Cambio                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `ludoScript/src/components/home/Home.vue`            | Eliminado el bloque "PrÃ¡ctica adaptativa" de la pantalla de inicio            |
| `ludoScript/src/components/home/CategoryHeatMap.vue` | Fuente mÃ¡s grande en etiquetas, paleta de colores granular, anillos clicables |

---

### Cambios realizados

#### EliminaciÃ³n de "PrÃ¡ctica adaptativa" de la home

El bloque que mostraba los chips de categorÃ­as dÃ©biles y el botÃ³n "Generar nuevas preguntas" se ha retirado de la pantalla de inicio. El sistema adaptativo sigue funcionando: el botÃ³n aparece en la pantalla de resultados del Quiz cuando el usuario tiene categorÃ­as con alta tasa de error.

Se eliminaron tambiÃ©n los imports y la lÃ³gica asociada en `Home.vue` (`categoryStatsService`, `calculateWeakCategories`, `errorRateBadgeClass`, `weakCategories`, `hasEnoughData`, `goToAdaptiveQuiz`, `onMounted`), reduciendo el peso del componente.

**Beneficio para el usuario:** la home es mÃ¡s limpia y directa; el acceso a la prÃ¡ctica adaptativa aparece en el momento mÃ¡s relevante (justo despuÃ©s de ver los resultados), no como elemento permanente de la pantalla principal.

#### Etiquetas de categorÃ­a mÃ¡s grandes

El tamaÃ±o de la fuente de las etiquetas bajo los anillos de categorÃ­a pasÃ³ de `9 px` a `10 px`.

**Beneficio para el usuario:** los nombres de categorÃ­a como "Arrays MÃ©todos" o "Scope Variables" son mÃ¡s fÃ¡ciles de leer sin necesidad de acercar la pantalla.

#### Paleta de colores granular en anillos de categorÃ­a

La funciÃ³n `categoryRingColor` pasÃ³ de tener 2 umbrales a 5:

| PrecisiÃ³n | Color anterior | Color nuevo        |
| --------- | -------------- | ------------------ |
| â‰¥ 80 %    | Verde          | Verde `#22c55e`    |
| 65â€“79 %   | Verde          | Lima `#84cc16`     |
| 50â€“64 %   | Naranja        | Amarillo `#eab308` |
| 30â€“49 %   | Rojo           | Naranja `#f97316`  |
| < 30 %    | Rojo           | Rojo `#ef4444`     |

**Beneficio para el usuario:** dos categorÃ­as con precisiones distintas (p. ej. 50 % y 67 %) ya no comparten el mismo color, lo que permite distinguir de un vistazo quÃ© Ã¡reas necesitan mÃ¡s atenciÃ³n.

#### Anillos de categorÃ­a clicables

Cada anillo del panel "Ãšltima sesiÃ³n" ahora es un enlace interactivo. Al hacer clic navega a `/category-review/?category=<slug>` (vista `CategoryReviewView`), donde se muestran las preguntas que el usuario respondiÃ³ mal en la Ãºltima sesiÃ³n junto con la explicaciÃ³n de por quÃ© su respuesta era incorrecta y por quÃ© la correcta lo es.

Para ello se aÃ±adiÃ³ a cada Ã­tem de `categoryRings` el campo `slug` (la clave original del objeto de estadÃ­sticas, p. ej. `"scope-variables"`), se importÃ³ `useRouter` en el componente y se aÃ±adieron clases `cursor-pointer hover:opacity-80 transition-opacity` para dar feedback visual al pasar el ratÃ³n.

**Beneficio para el usuario:** en lugar de tener que navegar manualmente a la secciÃ³n de revisiÃ³n, basta con pulsar el anillo de la categorÃ­a que quiere repasar para ir directamente a las preguntas falladas con sus explicaciones.

---

## Correcciones de errores â€” 08/04

### Pantalla en blanco al entrar al Quiz con PDFs

**Problema:** cuando la carga de preguntas desde la API fallaba (por ejemplo, un PDF con `quizQuestions: null` en BD), `items` quedaba vacÃ­o pero `loading` pasaba a `false`. El template entraba en el bloque `v-else` y pasaba `currentItem = undefined` a `QuizQuestion.vue`, que al intentar acceder a `props.question.question` lanzaba `TypeError: can't access property "question", $props.question is null`. Esto borraba toda la pantalla, incluido el spinner de carga.

**SoluciÃ³n en `Quiz.vue`:**

- Se aÃ±adiÃ³ `v-if="currentItem"` en el componente `QuizQuestion` para que solo se renderice cuando la pregunta existe.
- Se aÃ±adiÃ³ un estado de error (`v-if="!currentItem"`) que muestra el mensaje "No se pudieron cargar las preguntas" con un botÃ³n "Usar preguntas generales" que carga `quizQuestions.json` sin recargar la pÃ¡gina.
- Se aÃ±adiÃ³ la funciÃ³n `fallbackToStatic()` que realiza este proceso.

**Beneficio para el usuario:** en lugar de una pantalla en negro, ve un mensaje de error accionable y puede continuar usando la aplicaciÃ³n sin perder el contexto.

---

### Preguntas generadas por Gemini no se cargaban en el Quiz

**Problema:** `GameGrid.vue` siempre navega con el parÃ¡metro `?pdfIds=10` (plural, con `s`), pero la lÃ³gica de `Quiz.vue` en `onMounted` solo activaba el modo localStorage cuando existÃ­a `?pdfId=10` (singular, sin `s`). Al no reconocer el parÃ¡metro plural con un Ãºnico PDF, el componente caÃ­a al flujo de carga por API (`GET /api/pdfs/10/quiz`), que devolvÃ­a `null` porque las preguntas generadas por Gemini nunca se guardan en BD, solo en `localStorage`.

**SoluciÃ³n en `Quiz.vue`:** la detecciÃ³n de `singlePdfId` ahora cubre ambas formas del parÃ¡metro:

```js
const pdfIdsList = route.query.pdfIds?.split(",").filter(Boolean) ?? [];
const singlePdfId =
  route.query.pdfId && !route.query.pdfIds
    ? route.query.pdfId
    : pdfIdsList.length === 1 && route.query.includePredefined !== "true"
      ? pdfIdsList[0]
      : null;
```

Con esto, `?pdfIds=10` con un solo ID y sin `includePredefined=true` tambiÃ©n resuelve al modo localStorage donde estÃ¡n las preguntas de Gemini.

**Beneficio para el usuario:** al pulsar "Estudiar General" en un PDF que acaba de subir o que tiene guardado localmente, las preguntas generadas por la IA se cargan correctamente en lugar de mostrar la pantalla de error.

---

## RefactorizaciÃ³n tÃ©cnica: modularizaciÃ³n del `Quiz` y pruebas unitarias

Resumen

Se ha realizado una refactorizaciÃ³n de la lÃ³gica del minijuego `Quiz` en el frontend con dos objetivos principales: (1) separar responsabilidades para mejorar mantenibilidad y (2) habilitar pruebas unitarias que validen cada fase de la actividad de forma aislada.

Alcance

La intervenciÃ³n afectÃ³ exclusivamente al frontend (carpeta `ludoScript`) y consistiÃ³ en extraer lÃ³gica a mÃ³dulos reutilizables y aÃ±adir una baterÃ­a de tests automatizados. No se introdujeron cambios en la API ni en la base de datos.

Cambios implementados (resumen tÃ©cnico)

- Se crearon dos mÃ³dulos reutilizables para encapsular responsabilidades claras:
  - `ludoScript/src/composables/useQuizLoader.js`: encapsula las estrategias de carga de preguntas (estÃ¡tico, PDF local, mixto, adaptativo) y expone funciones pÃºblicas para probar cada modo de carga por separado.
  - `ludoScript/src/composables/useQuizController.js`: gestiona la interacciÃ³n del jugador (selecciÃ³n de respuesta, avance, reinicio) y la lÃ³gica final (envÃ­o de estadÃ­sticas, cÃ¡lculo de recompensa, persistencia de partida).
- `ludoScript/src/components/minigames/Quiz.vue` fue simplificado: ahora orquesta los composables anteriores y mantiene la plantilla/UI intacta.
- Se aÃ±adiÃ³ configuraciÃ³n y dependencias para pruebas unitarias con Vitest: `ludoScript/vitest.config.js` y actualizaciÃ³n de `ludoScript/package.json` (script `test`).
- Tests aÃ±adidos (unitarios):
  - `ludoScript/src/composables/__tests__/useQuizLoader.spec.js` â€” cubre: carga estÃ¡tica, carga desde PDF local, modo mixto (PDF + estÃ¡tico), y adaptativo (API y fallback).
  - `ludoScript/src/composables/__tests__/useQuizController.spec.js` â€” cubre: selecciÃ³n de respuesta, conteo de resultados, fÃ³rmula de puntuaciÃ³n, finalizaciÃ³n de sesiÃ³n y reinicio.

Estrategia de diseÃ±o

- SeparaciÃ³n de responsabilidades: la carga de datos (I/O y selecciÃ³n de preguntas) queda en `useQuizLoader`; la gestiÃ³n de interacciÃ³n y efectos colaterales (envÃ­o de stats, creaciÃ³n de juego) en `useQuizController`.
- InyecciÃ³n de dependencias: los servicios externos (API, servicios del dominio) se inyectan en los tests para facilitar el aislamiento y evitar efectos de red.
- Tests deterministas: se usaron mocks controlados para `fetch`, la instancia de axios y las utilidades de selecciÃ³n (`useAdaptiveSelection`) de modo que los tests sean repetibles y rapÃ­dos.

EjecuciÃ³n de pruebas

Desde la carpeta `ludoScript`:

```bash
npm install
npm test        # ejecuta Vitest (modo por defecto)
npx vitest run  # ejecutar una sola pasada
```

TambiÃ©n es posible ejecutar un test concreto en modo `run` o `watch` apuntando al fichero dentro de `src/composables/__tests__`.

Resultados

Se aÃ±adieron 23 pruebas unitarias que verifican las rutas crÃ­ticas del `Quiz`. En el entorno de desarrollo local las pruebas se ejecutaron correctamente (`23 passed`).

Impacto y beneficios

- Mantenibilidad: menor acoplamiento entre UI y lÃ³gica de negocio; los cambios futuros en la selecciÃ³n o puntuaciÃ³n se pueden validar sin tocar la plantilla.
- Testabilidad: ahora cada fase (carga, interacciÃ³n, finalizaciÃ³n) puede probarse de forma aislada, lo que facilita detectar regresiones.
- Riesgo: los cambios se limitan al frontend; la integraciÃ³n con el backend permanece sin cambios funcionales.

Recomendaciones futuras

- AÃ±adir pruebas de integraciÃ³n que cubran la interacciÃ³n completa entre `Quiz.vue` y el backend (endpoints `/api/pdfs/:id/quiz` y `/games/adaptive-quiz`).
- Integrar un pipeline CI que ejecute `npm test` para evitar regresiones automÃ¡ticas.


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
