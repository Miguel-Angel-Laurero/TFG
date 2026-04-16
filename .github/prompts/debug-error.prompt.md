---
mode: agent
description: "Diagnostica y resuelve un error de runtime en backend (Node/Express/Sequelize) o frontend (Vue/Pinia/Axios)"
---

Diagnostica y resuelve el siguiente error en LudoScript usando metodología sistemática.

## Datos del error

**¿Dónde ocurre?** ${input:capa:backend (consola del servidor) / frontend (consola del navegador) / ambos}

**Mensaje de error o stack trace:**

```
${input:error:Pega aquí el mensaje de error completo, el stack trace, o el warning de Vue}
```

**Archivo o componente donde ocurre:** ${input:archivo:Ruta relativa del archivo, ej: backend/src/controllers/game.controller.js o ludoScript/src/views/GameView.vue}

**Pasos para reproducirlo:** ${input:pasos:Describe qué acción del usuario o qué petición desencadena el error}

**¿Cuándo empezó a ocurrir?** ${input:cuando:Siempre ha fallado / empezó después de X cambio — deja vacío si no sabes}

---

Aplica el skill correspondiente según la capa indicada:

- Backend → `debug-backend`
- Frontend → `debug-frontend`
- Ambos → aplica los dos en el orden: backend primero, luego frontend
