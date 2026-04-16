---
name: debug-frontend
description: "**DEBUG FRONTEND SKILL** — Metodología sistemática para diagnosticar errores en Vue 3/Pinia/Axios. USA CUANDO: el usuario tenga un error en consola del navegador, un componente no se renderiza bien, el estado de Pinia no se actualiza, una llamada API falla en el frontend, o diga 'no funciona en la pantalla', 'el componente no actualiza', 'la llamada falla'. NO USAR PARA: errores en la consola del servidor Node.js (usa debug-backend). PRODUCE: diagnóstico de la causa raíz + fix aplicado en el componente, store o service afectado."
argument-hint: "Describe el síntoma (qué se ve mal), pega el error de consola si lo hay, e indica en qué componente/vista ocurre"
---

# Debug Frontend

Metodología de diagnóstico para errores en Vue 3 + Pinia + Axios de LudoScript, organizada por categoría de síntoma.

## Cuándo se activa

- Error en consola del navegador (JavaScript error, Vue warning)
- Componente que no se renderiza o muestra datos incorrectos
- Estado de Pinia que no se actualiza como se espera
- Llamada Axios que falla o devuelve datos inesperados
- Ruta de Vue Router que no carga o redirige mal

## Procedimiento

### 1. Clasificar el síntoma

| Síntoma                                          | Categoría           | Ir a paso |
| ------------------------------------------------ | ------------------- | --------- |
| `[Vue warn]: ...` en consola                     | Reactividad / Props | 2A        |
| Pantalla en blanco / componente no monta         | Mounting error      | 2B        |
| Datos no se actualizan tras acción               | Reactividad / Store | 2C        |
| Error de red (404, 401, 500 en Network tab)      | Axios / API         | 2D        |
| Ruta no carga o redirige a login inesperadamente | Vue Router          | 2E        |

---

### 2A. Vue warnings / errores de props

**Warnings más frecuentes:**

| Warning                           | Causa                                                    | Fix                                                                        |
| --------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `Missing required prop`           | Prop obligatoria no pasada al componente                 | Pasar la prop o hacerla opcional con default                               |
| `Extraneous non-props attributes` | Atributos no declarados como props ni emits              | Añadir `inheritAttrs: false` o declarar la prop                            |
| `[Vue warn]: Invalid prop type`   | Se pasa un tipo incorrecto (ej: string en vez de number) | Revisar qué devuelve el store y el tipo declarado en el componente         |
| `v-model` no funciona             | El componente hijo no emite `update:modelValue`          | Verificar `defineProps(['modelValue'])` + `emit('update:modelValue', val)` |

---

### 2B. Componente no monta / pantalla en blanco

Checklist en orden:

1. **¿Hay un error de importación?** Ver consola → `Failed to resolve component` o `Cannot find module`
2. **¿El componente está registrado?** En `<script setup>` los componentes importados se registran automáticamente.
3. **¿`v-if` bloquea el render?** Si el componente tiene `v-if="data"` y `data` es `null` al inicio, el componente no monta hasta que `data` se carga.
4. **¿La ruta existe en `router.js`?** Verificar que el `path` y el `name` sean correctos.
5. **¿El guard `requiresAuth` falla?** Si el usuario no está autenticado y la ruta lo requiere, redirige a `/login-view/`.

---

### 2C. Datos no se actualizan / reactividad rota

**Causas más frecuentes en este proyecto:**

```js
// ❌ Mutar el array directamente — Vue no detecta el cambio
store.items[0] = newItem;

// ✅ Reemplazar el elemento
store.items[idx] = newItem; // con índice reactivo
store.items.splice(idx, 1, newItem); // también válido
```

```js
// ❌ Desestructurar un ref pierde la reactividad
const { items } = store; // items ya no es reactivo

// ✅ Usar storeToRefs para estado reactivo
import { storeToRefs } from "pinia";
const { items } = storeToRefs(store);
// Los métodos/acciones se desestructuran directamente del store, sin storeToRefs
const { fetchAll } = store;
```

```js
// ❌ async en <script setup> directamente
const data = await store.fetchAll(); // bloquea el mounting

// ✅ Usar onMounted
onMounted(async () => {
  await store.fetchAll();
});
```

---

### 2D. Errores de red (Axios)

**Flujo de diagnóstico:**

1. Abrir **DevTools → Network** → buscar la petición fallida
2. Revisar: URL correcta, método correcto, headers (¿lleva `Authorization`?), body
3. Comparar la URL con la definida en el service y con el endpoint del backend

| Código | Causa en este proyecto                                        | Fix                                                                                                                              |
| ------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `401`  | Token expirado o no enviado                                   | El interceptor de Axios redirige a `/login-view/` automáticamente. Si ocurre en dev, verificar que el token está en localStorage |
| `403`  | El recurso no pertenece al usuario autenticado                | Revisar `where: { userId: req.user.id }` en el controller                                                                        |
| `404`  | Ruta no registrada en backend o path incorrecto en el service | Comparar `routes/index.js` con la URL del service                                                                                |
| `400`  | Validators del backend rechazaron el body                     | Ver el array de errores en la respuesta → corregir el payload                                                                    |
| `CORS` | Backend no permite el origen                                  | En dev, verificar que el proxy de Vite está configurado o que `VITE_API_URL` apunta al backend correcto                          |

---

### 2E. Vue Router

```js
// Problema: ruta no encontrada → va a 404 o pantalla en blanco
// Solución: verificar en router.js que el path termina en "/" (convención del proyecto)
{ path: "/mi-feature-view/", ... }  // ✅
{ path: "/mi-feature-view", ... }   // puede fallar en navegación directa
```

```js
// Problema: redirige a login sin querer
// Causa: meta: { requiresAuth: true } pero el store de auth aún no ha terminado de inicializarse
// Solución: esperar a que authStore.ready === true antes de navegar
```

---

### 3. Checklist de verificación tras el fix

- [ ] El error de consola desaparece completamente
- [ ] El estado del store refleja los datos correctos (verificar con Vue DevTools → Pinia)
- [ ] El componente se renderiza en todos los estados: loading, datos, vacío, error
- [ ] La navegación hacia/desde la ruta afectada funciona sin errores
- [ ] No se introdujeron nuevos warnings de Vue en la consola
