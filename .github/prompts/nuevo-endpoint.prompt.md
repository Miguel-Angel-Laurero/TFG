---
mode: agent
description: "Crea un endpoint REST completo en el backend (controller + route + validators + modelo opcional)"
---

Crea un endpoint REST completo en el backend de LudoScript siguiendo las convenciones del proyecto.

## Datos del endpoint

**Recurso (singular):** ${input:recurso:Nombre del recurso en singular, ej: invoice, comment, report}

**Operaciones necesarias:** ${input:operaciones:Lista separada por comas: getAll, getById, create, update, remove — o describe operaciones personalizadas}

**¿Requiere autenticación?** ${input:auth:yes / no}

**¿El recurso pertenece a un usuario?** ${input:pertenece_usuario:yes / no — determina si se filtra por userId}

**¿Necesita modelo nuevo o usa uno existente?** ${input:modelo:nuevo / existente — si existente, indica el nombre}

**Validators necesarios (campos del body):** ${input:validators:Lista de campos y sus reglas, ej: "title: notEmpty, maxLength 100 / score: isInt min 0 max 100" — deja vacío si no hay body}

---

Aplica el skill `new-backend-endpoint` para generar todos los archivos necesarios y el checklist de verificación.
