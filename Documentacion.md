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
