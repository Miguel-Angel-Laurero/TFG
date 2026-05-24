- Si se cambia la contraseña de algún usuario se debe de cerrar la sesión en el resto de dispositivos y que tenga que volver a iniciar sesión

- Cuando un usuario entra a la plataforma y reclama su recompensa diaria debe quedar registrado para que si vuelve a entrar desde otro dispositivo no le vuelva a salir y no se añada a las monedas

- Cuando le doy al perfil hace una ligera animación de ajustar como de estrecho están los iconos y el texto, eso hay que revisarlo

pdf propios y predefinidos ambas opciones para elegir

pdf propios --> gemini devuelve 50 preguntas (JSON) que se guarde en localStorage --> funcion filtrado al usuario se le muestran X aleatorias de esa cantidad, se generarán 15 números aleatorios que no puedan ser repetidos, se muestran esas preguntas

pdf predefinidos --> dejan tal y como están, no se implementa el algo

JSON que devuelve la primera llamada --> JSON se guarda en localStorage y en nube --> todo lo que se modifique es sobre el localStorage

Botón de guardar test para subir a la nube que es la base de datos de supabase, con esto se guardarían tanto el test como el resto de preguntas, todo esto para tener distintos JSON independientes, el objetivo es que el base que se genera por primera vez esté intacto y luego si se ha generado otra llamada con gemini para hacer nuevas preguntas quiero que esas preguntas también se suban en otro array distinto

botón de generar nuevas preguntas arreglarlo

inicio de sesión en producción persistente, es decir, que no se cierre sesión

Notas para la parte de profile-view de chatgpt:

1. Qué estoy viendo

Un dashboard de progreso del alumno en LudoScript.
Se divide en dos bloques principales:

Izquierda (“Tu progreso”): métricas generales (racha, tests completados, monedas, categorías) + gráfico semanal.
Derecha (“Rendimiento”): métricas más analíticas (precisión, días activos, sesiones, mejor día) + calendario.

Header con navegación y perfil arriba.

2. Objetivo probable de esta pantalla

Mostrar al alumno su progreso y rendimiento para:

Entender cómo le está yendo
Motivar continuidad
Detectar si mejora o no
Decidir qué hacer después 3. Usuario principal

Alumno que ya ha hecho tests y vuelve a la plataforma para:

Ver si está mejorando
Evaluar su constancia
Decidir si seguir practicando 4. Diagnóstico: problemas detectados
Problema 1: No hay una acción clara (pantalla pasiva)
Severidad: ALTA
Qué falla exactamente:
Todo son datos, pero no hay ninguna acción clara (ej: “seguir practicando”, “repetir errores”, etc.)
Impacto en el alumno:
El usuario mira… pero no sabe qué hacer después → rompe el flujo de aprendizaje
Principio afectado:
Visibilidad del estado + acción (Nielsen)
UX educativa (orientación a acción)
Por qué importa:
Un dashboard sin acción es un callejón sin salida
Problema 2: Métricas sin contexto ni interpretación
Severidad: ALTA
Qué falla exactamente:
Ejemplo:
28% precisión → ¿es malo? ¿normal? ¿mejorando?
1 día activo → ¿de qué periodo?
14 sesiones → ¿es mucho o poco?
Impacto en el alumno:
Tiene que interpretar → alta carga cognitiva → frustración o desmotivación
Principio afectado:
Reconocimiento vs recuerdo
Reducción de carga cognitiva
Por qué importa:
Los datos sin significado no ayudan a aprender
Problema 3: Jerarquía visual incorrecta
Severidad: ALTA
Qué falla exactamente:
Todo tiene el mismo peso visual:
Precisión (clave)
Monedas (secundario)
Tests completados (histórico)
Categorías (confuso)

No hay foco claro

Impacto en el alumno:
No sabe qué es importante → escaneo lento
Principio afectado:
Jerarquía visual
Diseño minimalista
Por qué importa:
La primera mirada debería responder: “¿Voy bien o mal?”
Problema 4: Información redundante y poco útil
Severidad: MEDIA
Qué falla exactamente:
Monedas → no aporta al aprendizaje
Categorías 39/5 → no se entiende
Tests completados → no indica calidad
Impacto en el alumno:
Ruido visual → distrae de lo importante
Principio afectado:
Diseño estético y minimalista
Por qué importa:
Cada elemento debería ayudar a aprender o decidir
Problema 5: Gráfico semanal poco informativo
Severidad: MEDIA
Qué falla exactamente:
No hay eje claro
No se entiende qué mide exactamente
No se ve tendencia
Impacto en el alumno:
No puede detectar progreso ni patrones
Principio afectado:
Correspondencia sistema–mundo real
Por qué importa:
El progreso debe ser evidente sin pensar
Problema 6: Calendario sin utilidad clara
Severidad: MEDIA
Qué falla exactamente:
El calendario muestra días… pero:
No indica qué pasó en cada día
No hay colores claros de rendimiento
No aporta decisión
Impacto en el alumno:
Elemento visual bonito pero inútil
Principio afectado:
Utilidad real vs decoración
Por qué importa:
Cada componente debe tener propósito
Problema 7: Falta de narrativa de progreso
Severidad: ALTA
Qué falla exactamente:
No hay respuesta a:
¿Estoy mejorando?
¿Qué debo mejorar?
¿Dónde fallo?
Impacto en el alumno:
No aprende de su propio progreso
Principio afectado:
UX educativa
Feedback del sistema
Por qué importa:
El aprendizaje necesita feedback accionable
Problema 8: CTA emocional débil y genérico
Severidad: MEDIA
Qué falla exactamente:
“Necesitas más práctica” → genérico, no accionable
Impacto en el alumno:
No motiva ni guía
Principio afectado:
Feedback útil
Por qué importa:
El sistema debería comportarse como un tutor 5. Mejoras propuestas
Mejora 1: Introducir una acción principal clara
Qué cambiar:
Añadir CTA principal visible
Cómo cambiarlo:
Arriba del todo:

“Sigue practicando →”
“Revisar errores →”
“Entrenar [tema débil] →”

Por qué mejora:
Convierte la pantalla en un punto de decisión
Beneficio:
El alumno no se queda bloqueado
Mejora 2: Transformar métricas en feedback interpretado
Qué cambiar:
Añadir contexto a cada dato
Cómo cambiarlo:
Ejemplo:
“28% precisión” →
👉 “Bajo rendimiento (media: 55%)”
“1 día activo” →
👉 “Has perdido la racha”
Por qué mejora:
Elimina necesidad de interpretar
Beneficio:
Comprensión inmediata
Mejora 3: Reorganizar jerarquía visual
Qué cambiar:
Crear un bloque principal de estado
Cómo cambiarlo:

Hero arriba:

Precisión actual
Tendencia (↑ ↓)
Estado (“Mejorando / Estancado / Bajando”)
Por qué mejora:
Foco inmediato
Beneficio:
Escaneo en <2 segundos
Mejora 4: Eliminar o degradar métricas irrelevantes
Qué cambiar:
Reducir protagonismo de:
Monedas
Tests totales
Cómo cambiarlo:
Mover a sección secundaria o tooltip
Por qué mejora:
Reduce ruido
Beneficio:
Más claridad
Mejora 5: Sustituir gráfico por insight
Qué cambiar:
Eliminar gráfico o simplificarlo
Cómo cambiarlo:

En lugar de barras:

“Esta semana: +7%”
“Has hecho 3 sesiones”
“Mejor día: viernes”
Por qué mejora:
Más comprensible
Beneficio:
Lectura instantánea
Mejora 6: Convertir calendario en mapa de actividad real
Qué cambiar:
Añadir significado visual
Cómo cambiarlo:
Verde: buen rendimiento
Rojo: bajo rendimiento
Gris: sin actividad
Por qué mejora:
Permite detectar patrones
Beneficio:
Autoevaluación rápida
Mejora 7: Introducir recomendaciones personalizadas
Qué cambiar:
Añadir bloque tipo “Siguiente paso”
Cómo cambiarlo:

Ejemplo:

“Te recomendamos practicar: Cardiología (fallos recientes)”
“Tiempo medio alto → mejora velocidad”

Por qué mejora:
Convierte datos en acción
Beneficio:
Aprendizaje guiado
Mejora 8: Simplificar visualmente
Qué cambiar:
Reducir bloques y densidad
Cómo cambiarlo:
Más espacio
Menos cajas
Agrupar métricas
Por qué mejora:
Menos carga cognitiva
Beneficio:
Uso más fluido 6. Priorización final
🔴 Cambios más importantes (hacer primero)
Añadir CTA clara (“qué hago ahora”)
Convertir métricas en feedback interpretado
Crear bloque principal de estado (jerarquía clara)
🟡 Cambios secundarios
Simplificar/eliminar gráfico semanal
Rediseñar calendario con significado
Reducir métricas irrelevantes 7. Veredicto global

La pantalla tiene buena base visual, pero falla en lo más importante: no guía al alumno.

Ahora mismo es un panel de datos, no una herramienta de aprendizaje.
El usuario ve números, pero no entiende su progreso ni qué hacer después.

👉 Necesita un cambio claro de enfoque:

De “mostrar estadísticas”
A “guiar decisiones y aprendizaje”

Si no se hace esto, el alumno mirará la pantalla… y se irá.
