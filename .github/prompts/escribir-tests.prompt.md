---
mode: agent
description: "Escribe tests para un componente Vue, store Pinia, composable, controller Express o endpoint de la API"
---

Escribe tests completos para el siguiente módulo de LudoScript.

## Datos del módulo a testear

**Archivo a testear:** ${input:archivo:Ruta relativa del archivo, ej: ludoScript/src/stores/game.store.js o backend/src/controllers/auth.controller.js}

**Tipo:** ${input:tipo:componente Vue / store Pinia / composable / controller Express / endpoint API}

**Comportamientos más críticos a cubrir:** ${input:criticos:Lista los casos de uso más importantes, ej: "que el login guarda el token", "que el 404 devuelve mensaje claro", "que el loading se pone a false aunque haya error"}

**¿Cobertura mínima objetivo?** ${input:cobertura:happy path + errores / happy path solamente / cobertura exhaustiva}

---

Lee el archivo indicado antes de escribir los tests. Aplica el skill correspondiente:

- Componente Vue, store Pinia o composable → `write-tests-frontend`
- Controller Express o endpoint API → `write-tests-backend`

Asegúrate de cubrir: happy path, caso de error principal, y los comportamientos críticos indicados.
