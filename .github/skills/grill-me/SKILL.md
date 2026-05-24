---
name: grill-me
description: "**INTERROGATORIO DE DISEÑO** — Entrevista al usuario implacablemente sobre su plan o diseño hasta alcanzar un entendimiento compartido, resolviendo cada rama del árbol de decisiones. USA CUANDO: el usuario diga 'ponme a prueba', 'interrogame sobre mi plan', 'revisa mi diseño', 'grillame', 'grill me', 'stress-test my plan', 'cuestiona mi diseño', 'qué me estoy dejando'. NO USAR PARA: implementar código directamente; depurar errores concretos (usa debug-backend o debug-frontend). PRODUCE: lista de preguntas críticas con respuesta recomendada basada en el código real + árbol de decisiones resuelto."
argument-hint: "Describe tu plan, diseño o funcionalidad a cuestionar. Ej: 'quiero añadir notificaciones en tiempo real' o 'mi diseño para el sistema de logros'"
---

# Grill Me — Interrogatorio de Diseño

Entrevista implacable sobre cada aspecto del plan hasta alcanzar un entendimiento compartido.  
Recorre cada rama del árbol de decisiones resolviendo dependencias una por una.

## Cuándo se activa

- "ponme a prueba", "interrogame", "grillame", "grill me"
- "stress-test my plan", "cuestiona mi diseño"
- "qué me estoy dejando", "revisa si tiene sentido"
- El usuario describe un plan o diseño y quiere validarlo antes de implementar

## Procedimiento

### 1. Explorar antes de preguntar

Antes de formular cualquier pregunta, explorar el código relevante:

- **¿Ya existe algo similar?** — buscar en `backend/src/controllers/`, `backend/src/models/`, `ludoScript/src/stores/`, `ludoScript/src/views/`
- **¿Hay decisiones técnicas ya tomadas?** — consultar `decisions-log.instructions.md` (ya cargado en contexto)
- **¿Hay patrones establecidos?** — revisar cómo se hace en features existentes del mismo dominio

Si la pregunta puede responderse explorando el código, **explorarla y presentar el hallazgo** en vez de preguntar al usuario.

### 2. Construir el árbol de decisiones

Identificar todas las dimensiones del plan que tienen decisiones pendientes:

```
Plan: [título del plan]
├── Capa de datos
│   ├── ¿Nuevo modelo o extender existente?
│   ├── ¿Relaciones necesarias?
│   └── ¿Impacto en tablas existentes?
├── Capa backend
│   ├── ¿Nuevos endpoints o reutilizar?
│   ├── ¿Autenticación / autorización requerida?
│   └── ¿Validaciones necesarias?
├── Capa frontend
│   ├── ¿Nueva vista o componente en existente?
│   ├── ¿Nuevo store o extender?
│   └── ¿Nuevo servicio API?
├── Tiempo real (Socket.IO)
│   └── ¿Requiere eventos en tiempo real?
└── Edge cases
    ├── ¿Qué pasa si el usuario no tiene permisos?
    ├── ¿Qué pasa si falla la red?
    └── ¿Límites y validaciones de negocio?
```

### 3. Interrogar rama por rama

Para **cada decisión pendiente** en el árbol:

1. Formular la pregunta de forma concreta y sin ambigüedad
2. **Dar una respuesta recomendada** basada en:
   - Los patrones del proyecto ya existentes
   - Las decisiones técnicas ya tomadas (decisions-log)
   - Lo que se encontró explorando el código
3. Esperar confirmación o corrección del usuario
4. Resolver esa rama antes de pasar a la siguiente

**Formato de cada pregunta:**

```
### [Nº]. [Rama]: [Pregunta concreta]

> **Mi recomendación:** [respuesta sugerida basada en el código/decisiones del proyecto]
> *Motivo: [por qué esta opción encaja con el proyecto]*

¿Estás de acuerdo o tienes una visión diferente?
```

### 4. Detectar inconsistencias y riesgos

Durante el interrogatorio, señalar activamente:

- **Contradicciones** con decisiones ya tomadas (del decisions-log)
- **Duplicación** de lógica que ya existe en el proyecto
- **Riesgos de seguridad** (OWASP Top 10: inyección, auth rota, exposición de datos)
- **Complejidad innecesaria** que no aporta valor al TFG
- **Dependencias circulares** entre decisiones

### 5. Cerrar con resumen

Cuando todas las ramas estén resueltas, producir:

```markdown
## Decisiones acordadas

| Decisión | Opción elegida | Motivo |
| -------- | -------------- | ------ |
| ...      | ...            | ...    |

## Próximos pasos sugeridos

1. [Skill o acción concreta para implementar]
2. ...

## Riesgos pendientes de monitorizar

- ...
```

## Reglas del interrogatorio

- **No más de 2-3 preguntas por turno** — no abrumar al usuario
- **Siempre dar recomendación** — nunca preguntar sin proponer
- **Explorar código primero** — si la respuesta está en el código, presentarla como hecho
- **Respetar decisions-log** — no proponer alternativas a decisiones ya tomadas
- **Ir de lo general a lo específico** — arquitectura → módulos → detalles de implementación
- **Señalar cuando el plan contradice algo** — mejor detectarlo aquí que en código

## Ejemplo de interrogatorio

**Usuario:** "Quiero añadir un sistema de logros"

**Copilot** (después de explorar el código):

> Revisé el proyecto. No hay modelo de logros aún. Los items (`items_users`) tienen un flag `equipped` pero no tracking de progreso.

### 1. Modelo de datos: ¿Logros predefinidos en seed o dinámicos?

> **Mi recomendación:** Predefinidos en seed (como los items del shop), con una tabla `achievements` y `user_achievements` join.  
> _Motivo: sigue el patrón ya establecido de items + items_users. Reutiliza la lógica de rewards._

¿Estás de acuerdo o quieres logros configurables por el profesor?
