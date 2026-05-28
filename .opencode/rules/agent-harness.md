# Agent Activity Harness — Registro de sesión

> **Propósito:** Registrar herramientas usadas, acciones ejecutadas y errores encontrados durante la sesión del agente.
> **Regla de retención:** Solo se conservan las sesiones con errores o terminaciones inesperadas. Si la sesión termina limpiamente (sin errores), el archivo de sesión se elimina.

---

## 1. Protocolo de sesión

### 1.1 Al iniciar la sesión

1. Verificar si existe `logs/agent/session.md`.
2. **Si existe** → la sesión anterior no terminó limpiamente (crash, interrupción, error).
   - Renombrarlo a `logs/agent/errors/crash-YYYYMMDD-HHmmss.md` usando la fecha de inicio de esa sesión.
   - Escribir al inicio del archivo archivado un banner: `## ⚠️ SESIÓN INTERRUMPIDA — este archivo se conservó porque la sesión anterior no finalizó correctamente.`
3. **Si no existe** → inicio limpio.
4. Crear `logs/agent/session.md` con la cabecera de sesión.
5. Abrir `logs/agent/session.md` y escribir el marcador de inicio.

### 1.2 Durante la sesión

Registrar **cada acción significativa** en `logs/agent/session.md` con el siguiente formato:

```markdown
## HH:MM:SS | 🔧 HERRAMIENTA | archivo/afectado
- **Acción:** descripción breve de lo que se hizo
- **Resultado:** ✅ éxito / ❌ fallo
- **Detalle:** (solo si falló) mensaje de error, stack relevante, causa
- **Recuperación:** (solo si falló) qué se hizo para corregirlo
```

**Herramientas y sus emojis:**

| Emoji | Herramienta | Cuándo registrar |
|-------|-------------|-----------------|
| 🔧 | `edit` | Cada edición de archivo |
| 📝 | `write` | Cada archivo nuevo creado |
| 💻 | `bash` | Cada comando ejecutado (especialmente los que fallan) |
| 🔍 | `grep` / `glob` | Solo búsquedas que llevaron a una decisión |
| 📖 | `read` | Solo si la lectura reveló algo relevante |
| 🤖 | `task` | Cada subagente lanzado y su resultado |
| ❓ | `question` | Preguntas hechas al usuario |

**Reglas de granularidad:**
- ✅ Registrar: ediciones, escrituras, comandos, errores, decisiones.
- ❌ No registrar: lecturas triviales, búsquedas exploratorias sin hallazgos, comandos que solo devuelven info (git status, ls sin consecuencias).

### 1.3 Al finalizar la sesión limpiamente

1. Añadir el marcador de fin:
   ```markdown
   ---
   ## ✅ FIN DE SESIÓN — HH:MM:SS
   **Estado:** sin errores persistentes — archivo será eliminado
   ```
2. **Eliminar** `logs/agent/session.md`.
3. No dejar archivos huérfanos en `logs/agent/`.

### 1.4 Al encontrar un error durante la sesión

1. Registrar el error en `logs/agent/session.md` con el formato estándar.
2. Marcar la sesión como `## 🔴 ERROR EN SESIÓN — HH:MM:SS` (esto se usará como indicador al final).
3. **No eliminar** el archivo al final — se conserva para diagnóstico.
4. Si el error se resuelve durante la misma sesión, marcar como `✅ RESUELTO` en la entrada del error.

---

## 2. Comportamiento condicional

### 2.1 Ante errores de test

```
SI `npm test` / `npm run lint` falla DESPUÉS de un cambio:
  → No continuar con más cambios hasta que los tests pasen.
  → Si el fallo es por el cambio actual → corregir y re-ejecutar.
  → Si el fallo es preexistente → informar al usuario antes de tocar nada más.
```

### 2.2 Ante errores de conexión (BD, API, red)

```
SI sequelize no conecta:
  → Reintentar hasta 3 veces con espera de 3s entre intentos.
  → Si sigue fallando → registrar en session.md y preguntar al usuario.

SI la API responde 5xx:
  → Reintentar 1 vez.
  → Si sigue fallando → registrar y notificar.
```

### 2.3 Ante conflictos de git

```
SI `git status` muestra conflictos:
  → NO hacer commit, push, ni amend.
  → NO ejecutar `git reset --hard` ni `git clean -fd` sin permiso explícito.
  → Informar al usuario del estado y esperar instrucciones.
```

### 2.4 Ante archivos grandes (+200 líneas)

```
SI el archivo a editar tiene más de 200 líneas:
  → Leer el contexto relevante primero (no editar a ciegas).
  → Si el cambio es mayor de 20 líneas → preguntar al usuario antes de proceder.
```

### 2.5 Ante cambios que afectan a más de 3 archivos

```
SI un cambio requiere modificar más de 3 archivos:
  → Presentar el plan de cambios al usuario ANTES de ejecutar.
  → No proceder sin confirmación.
```

---

## 3. Errores críticos del proyecto (conocidos)

Estos son errores que ya han ocurrido y deben evitarse:

| Error | Causa | Prevención |
|-------|-------|-----------|
| `req.user.id` spoofing | Usar `req.body.userId` en vez de `req.user.id` | **Nunca** tomar userId del body; siempre de `req.user.id` del JWT |
| Password expuesta en API | No excluir password en queries | Siempre `attributes: { exclude: ["password"] }` |
| Reactividad rota en stores | Desestructurar store sin `storeToRefs` | Usar `storeToRefs(store)` para estado reactivo |
| Ruta SPA sin trailing slash | Rutas Vue sin `/` al final | Siempre terminar rutas con `/` |
| `async` directo en `<script setup>` | Bloquea montaje del componente | Usar `onMounted` con función async interna |

---

## 4. Verificación de sesión (post-mortem)

Al iniciar una NUEVA sesión, si se encuentra `logs/agent/session.md` huérfano:
1. Renombrar a `logs/agent/errors/crash-YYYYMMDD-HHmmss.md`.
2. Añadir banner de sesión interrumpida al inicio del archivo.
3. El archivo queda conservado para diagnóstico.

---

## 5. Archivos del harness

```
logs/agent/
├── session.md                     # Sesión activa (se elimina al finalizar sin errores)
└── errors/
    └── crash-YYYYMMDD-HHmmss.md   # Sesiones interrumpidas conservadas
```
