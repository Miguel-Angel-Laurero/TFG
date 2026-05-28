---
name: design-review
description: "Entrevista implacable sobre un plan de diseño hasta resolver cada rama del árbol de decisiones. USA CUANDO: 'ponme a prueba', 'revisa mi diseño', 'grill me', 'cuestiona mi plan', 'qué me estoy dejando'. PRODUCE: árbol de decisiones resuelto + riesgos identificados."
---

# Design Review (Grill Me)

Interroga cada aspecto del plan hasta alcanzar un entendimiento compartido, recorriendo el árbol de decisiones rama por rama.

## Cuándo se activa

- "ponme a prueba", "interrógame", "grill me"
- "stress-test my plan", "cuestiona mi diseño"
- "qué me estoy dejando", "revisa si tiene sentido"

## Procedimiento

### 1. Explorar antes de preguntar

Antes de formular cualquier pregunta, explorar el código:
- ¿Ya existe algo similar? — buscar en `backend/src/controllers/`, `backend/src/models/`, `ludoScript/src/stores/`
- ¿Hay decisiones técnicas ya tomadas? — consultar `decisions-log` (ya cargado en reglas)
- Si la respuesta está en el código, presentarla como hecho — no preguntar al usuario.

### 2. Construir el árbol de decisiones

```
Plan: [título]
├── Capa de datos
│   ├── ¿Nuevo modelo o extender existente?
│   ├── ¿Relaciones necesarias?
│   └── ¿Impacto en tablas existentes?
├── Capa backend
│   ├── ¿Nuevos endpoints o reutilizar?
│   ├── ¿Autenticación / autorización?
│   └── ¿Validaciones necesarias?
├── Capa frontend
│   ├── ¿Nueva vista o componente existente?
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

Para cada decisión pendiente:

1. Formular pregunta concreta y sin ambigüedad
2. **Dar respuesta recomendada** basada en patrones del proyecto y decisions-log
3. Esperar confirmación del usuario
4. Resolver antes de pasar a la siguiente

Formato de cada pregunta:
```
### Nº. [Rama]: [Pregunta concreta]
> **Mi recomendación:** [respuesta sugerida basada en código/decisiones]
> *Motivo: [por qué esta opción encaja con el proyecto]*
¿Estás de acuerdo?
```

### 4. Detectar inconsistencias

Señalar activamente:
- Contradicciones con decisions-log
- Duplicación de lógica existente
- Riesgos de seguridad (OWASP Top 10)
- Complejidad innecesaria para el TFG
- Dependencias circulares entre decisiones

### 5. Cerrar con resumen

```markdown
## Decisiones acordadas
| Decisión | Opción elegida | Motivo |
|----------|---------------|--------|

## Próximos pasos sugeridos
1. [Skill o acción concreta]

## Riesgos pendientes
- ...
```

## Reglas

- No más de 2-3 preguntas por turno
- Siempre dar recomendación, nunca preguntar sin proponer
- Explorar código primero
- Respetar decisions-log
- Ir de lo general a lo específico
