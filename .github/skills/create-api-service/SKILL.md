---
name: create-api-service
description: "**API SERVICE SKILL** — Crea un servicio Axios para un recurso del backend, siguiendo el patrón de LudoScript. USA CUANDO: el usuario pida 'crea el servicio de API', 'necesito llamar al endpoint desde el frontend', 'añade las llamadas Axios para...'. NO USAR PARA: crear el store de Pinia (usa create-pinia-store); crear el componente Vue (usa nielsen-ui-design). PRODUCE: archivo `src/api/{recurso}.service.js` completo y listo para usar."
argument-hint: "Nombre del recurso (ej: 'invoice') y lista de operaciones que expone el backend (getAll, getById, create, update, remove, o endpoints personalizados)"
---

# Create API Service

Crea el archivo de servicio Axios para un recurso del backend, siguiendo el patrón establecido en LudoScript.

## Cuándo se activa

- "crea el servicio / la API / las llamadas axios para X"
- "necesito conectar el frontend con el endpoint de X"
- "añade el service para el recurso Y"
- Al crear una feature nueva que requiere datos del backend (paso 1 del vertical)

## Procedimiento

### 1. Identificar los endpoints a consumir

Antes de escribir código, lista:

| Operación    | Método | Ruta backend             | Parámetros     |
| ------------ | ------ | ------------------------ | -------------- |
| Listar todos | GET    | `/recurso-plural`        | —              |
| Obtener uno  | GET    | `/recurso-plural/:id`    | `id` en path   |
| Crear        | POST   | `/recurso-plural`        | body con datos |
| Actualizar   | PUT    | `/recurso-plural/:id`    | `id` + body    |
| Eliminar     | DELETE | `/recurso-plural/:id`    | `id` en path   |
| Custom       | \*     | `/recurso-plural/accion` | según endpoint |

Si el endpoint no existe todavía en el backend, aplicar el skill `new-backend-endpoint` primero.

---

### 2. Crear el archivo de servicio

Archivo: `ludoScript/src/api/{recurso}.service.js`

```js
import api from "@/api/axios";

export const {recurso}Service = {
  getAll: () => api.get("/{recurso-plural}"),
  getById: (id) => api.get(`/{recurso-plural}/${id}`),
  create: (data) => api.post("/{recurso-plural}", data),
  update: (id, data) => api.put(`/{recurso-plural}/${id}`, data),
  remove: (id) => api.delete(`/{recurso-plural}/${id}`),
};
```

**Reglas obligatorias:**

- Siempre importar `api` desde `@/api/axios` — nunca crear una instancia nueva de axios
- Los métodos devuelven la promesa completa (sin `.data`): el store o el componente desestructura `{ data }`
- Usar template literals para los paths con parámetros, nunca concatenación de strings
- Nombres en camelCase: `recursoService`, `getById`, `remove` (no `delete`, que es palabra reservada)

---

### 3. Endpoints personalizados

Para acciones que no son CRUD estándar:

```js
export const {recurso}Service = {
  // ...CRUD estándar...

  // Acción custom con body
  activate: (id) => api.post(`/{recurso-plural}/${id}/activate`),

  // Acción con query params
  search: (query) => api.get("/{recurso-plural}/search", { params: { q: query } }),

  // Subida de archivo
  uploadFile: (id, formData) =>
    api.post(`/{recurso-plural}/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
```

---

### 4. Checklist de salida

- [ ] Importa `api` desde `@/api/axios` (no axios directamente)
- [ ] Las rutas coinciden exactamente con las del backend (mismo prefijo, mismo plural/singular)
- [ ] Los métodos devuelven la promesa, no la desestructuran internamente
- [ ] No hay `try/catch` en el service — el manejo de errores va en el store o composable
- [ ] Si hay endpoints con parámetros de ruta, se usan template literals
- [ ] Si hay query params, se pasan como `{ params: { ... } }` en el tercer argumento de `api.get`
- [ ] El nombre del export es `{recurso}Service` (camelCase, sin guiones)
