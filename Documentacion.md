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
