# Funciones Síncronas y Asíncronas en DotaBURGUERS

> **Propósito**: Explicar qué son las funciones síncronas y asíncronas, por qué se usan, dónde se aplican en el proyecto, qué pasaría si no se usaran, y cómo fluye la ejecución.

---

## 1. Conceptos Fundamentales

### 1.1 Código Síncrono

Una función **síncrona** se ejecuta de principio a fin en el mismo hilo, bloqueando cualquier otra operación hasta que termina.

```js
function sumar(a, b) {
  return a + b;
}

const resultado = sumar(2, 3);
console.log(resultado); // 5 — se ejecuta inmediatamente
```

**Características**:
- Se ejecuta en orden secuencial
- Bloquea el hilo principal hasta completarse
- El resultado está disponible inmediatamente
- No requiere `await`, `then()` ni callbacks

### 1.2 Código Asíncrono

Una función **asíncrona** inicia una operación pero **no bloquea** el hilo principal. La ejecución continúa y el resultado se maneja cuando la operación se completa (callback, Promise, o `await`).

```js
async function obtenerDatos() {
  const res = await fetch("https://api.ejemplo.com/datos");
  return res.json();
}
```

**Características**:
- No bloquea el hilo principal
- El resultado llega en un momento futuro
- Requiere mecanismos como callbacks, Promises, o async/await
- Permite que la UI siga respondiendo mientras se espera

---

## 2. ¿Por qué usamos funciones asíncronas?

### 2.1 JavaScript es monohilo (single-threaded)

JavaScript ejecuta todo en un **solo hilo** — el hilo principal del navegador. Si bloqueamos ese hilo, la UI se congela: no hay clicks, no hay scroll, no hay animaciones.

### 2.2 Operaciones que toman tiempo

Ciertas operaciones no pueden completarse instantáneamente:

| Operación | Tiempo típico | ¿Bloqueante? |
|-----------|---------------|--------------|
| Sumar dos números | ~0.0001ms | No |
| `fetch()` a una API | ~100–5000ms | **Sí — sin async** |
| Leer localStorage | ~0.01ms | No |
| `JSON.parse()` de 20 productos | ~0.1ms | No |
| `POST /carts/add` | ~200–3000ms | **Sí — sin async** |
| `Array.filter()` de 20 items | ~0.05ms | No |

Si hiciéramos `fetch()` de forma síncrona, el navegador se congelaría durante 200–5000ms sin poder hacer nada más.

### 2.3 Beneficios de async/await

1. **UI responsiva**: El usuario puede seguir navegando mientras se cargan datos
2. **Mejor experiencia**: El SplashScreen y los loading skeletons mantienen al usuario informado
3. **Paralelismo controlado**: Podemos lanzar múltiples requests y esperar todas con `Promise.all()`
4. **Manejo de errores centralizado**: `try/catch` captura errores de red, HTTP, y parseo

---

## 3. ¿Dónde se usan en DotaBURGUERS?

### 3.1 Capa de Servicios (`src/api.js`)

Todas las funciones de API son asíncronas porque ejecutan `fetch()` contra servidores externos:

| Función | Async | ¿Qué hace? | Tiempo estimado |
|---------|-------|------------|-----------------|
| `fetchProducts()` | ✅ | GET /products | 200–2000ms |
| `searchUser(username)` | ✅ | GET /users + búsqueda client-side | 200–3000ms |
| `submitOrder(userId, products)` | ✅ | POST /carts/add | 200–3000ms |
| `validateConnection()` | ✅ | GET dummyjson.com (health check) | 100–2000ms |
| `validateInventory(items)` | ❌ **Síncrona** | Verifica stock localmente | < 1ms |
| `savePurchase(order)` | ❌ **Síncrona** | Escribe en localStorage | < 1ms |
| `getPurchases()` | ❌ **Síncrona** | Lee de localStorage | < 1ms |

### 3.2 Capa de Presentación

| Componente/Página | Función Async | ¿Por qué? |
|--------------------|---------------|-----------|
| `HomePage.jsx` | `fetchProducts()` | Carga el catálogo desde FakeStore API |
| `LoginPage.jsx` | `searchUser()` | Busca usuario en DummyJSON |
| `AuthContext.jsx` | `login()` | Login wrapper — espera searchUser() |
| `CheckoutPage.jsx` | `startCheckout()` | Pipeline completo de 7 pasos con APIs reales |

### 3.3 Pipeline de Checkout — El caso más complejo

`CheckoutPage.jsx` — `startCheckout()` es una función async que coordina **4 operaciones asíncronas** en secuencia:

```
startCheckout()  ← async function
├── await validateConnection()   ← fetch dummyjson.com
├── validateInventory(items)     ← síncrona (pura, local)
├── await submitOrder(...)       ← POST /carts/add
├── await createPaymentIntent()  ← POST localhost:3001
└── savePurchase(order)          ← síncrona (localStorage)
```

Cada `await` pausa la ejecución de `startCheckout()` **sin bloquear la UI**. El usuario ve el CheckoutProgress avanzar paso a paso mientras el código espera las respuestas del servidor.

### 3.4 ¿Dónde NO se usan async?

Las funciones **puras** y **síncronas** son las que solo trabajan con datos en memoria:

| Función | Archivo | ¿Qué hace? |
|---------|---------|------------|
| `normalizeProduct()` | `utils.js` | Mapea campos de FakeStore |
| `mapCategory()` | `utils.js` | Traduce categorías inglés → español |
| `validateInventory()` | `api.js` | Verifica stock local |
| `cartReducer()` | `CartContext.jsx` | Función reductora pura |
| `getFilteredProducts()` | `HomePage.jsx` | Pipeline de filtrado (useMemo) |
| `getPurchases()` | `api.js` | Lee de localStorage |

Todas estas son síncronas porque operan sobre datos que ya están en memoria. No necesitan esperar una respuesta externa.

---

## 4. ¿Qué pasaría si no usáramos funciones asíncronas?

### 4.1 Con `fetch()` síncrono (hipotético — no existe en browsers modernos)

```js
// ❌ JavaScript NO tiene fetch síncrono, pero imaginemos que sí:
function cargarProductos() {
  const data = syncFetch("https://fakestoreapi.com/products");
  return data.json();
}
```

**Consecuencias**:

1. **UI congelada** durante 200–3000ms: el usuario no puede scrollear, hacer click, ni escribir
2. **El navegador muestra advertencia**: "Unresponsive script" o "Page not responding"
3. **Mala experiencia**: El usuario piensa que la página se colgó
4. **Sin loading states**: No podríamos mostrar SplashScreen ni skeletons porque el hilo está bloqueado

### 4.2 Sin `async/await` (usando solo callbacks anidados)

```js
// ❌ Callback hell — ilegible y difícil de mantener
function startCheckout() {
  validateConnection(() => {
    validateInventory(items, () => {
      calculateTotal(() => {
        submitOrder(user.id, items, (orderResponse) => {
          createPaymentIntent(total, (secret) => {
            savePurchase(orderResponse);
          });
        });
      });
    });
  });
}
```

**Consecuencias**:
1. **Callback hell**: Anidamiento profundo ilegible
2. **Manejo de errores caótico**: Cada callback necesita su propio try/catch
3. **Dificultad para depurar**: Las trazas de pila se pierden entre callbacks
4. **Sin flujo claro**: No se ve el orden de ejecución a simple vista

### 4.3 Sin `async` en el checkout (simulando con timeouts)

```js
// ❌ Antes: el checkout usaba setTimeouts + fallo aleatorio
function startCheckout() {
  setStep(1);
  setTimeout(() => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
      setTimeout(() => {
        setStep(4);
        // ...
      }, 1000);
    }, 1000);
  }, 1000);
}
```

**Consecuencias**:
1. **Falso progreso**: Los pasos avanzan aunque nada esté pasando realmente
2. **Sin datos reales**: El ID de orden se generaba client-side, no del servidor
3. **Sin reintento real**: Si fallaba, no se podía reintentar la operación específica
4. **Engañoso**: El usuario veía "Validando conexión" pero no había conexión real

---

## 5. ¿Cómo fluye la ejecución asíncrona?

### 5.1 El Event Loop

JavaScript tiene un modelo de ejecución basado en un **event loop**:

```
1. Call Stack (Pila de llamadas)
   └── Ejecuta funciones síncronas una tras otra

2. Web APIs / Node APIs
   └── setTimeout, fetch, DOM events — se delegan al navegador

3. Task Queue / Microtask Queue
   └── Las Promises resueltas van a la microtask queue

4. Event Loop
   └── Cuando el Call Stack está vacío, toma tareas de la queue
```

### 5.2 Flujo de `async/await` en el login

```
Usuario escribe "emilys" y hace click en "Iniciar sesión"

Call Stack:
  1. handleSubmit(e)             ← función síncrona (entra al stack)
  2. login("emilys")             ← async function (entra al stack)
  3. searchUser("emilys")        ← async function (entra al stack)
  4. fetch("https://...")        ← síncrono (inicia la petición)
  5. fetch sale del stack        ← la petición se delega al navegador
  6. searchUser() sale del stack ← await — la función se pausa
  7. login() sale del stack      ← await — la función se pausa
  8. handleSubmit() sale del stack ← el stack está vacío

  ════ El event loop espera ════

  ~300ms después — la respuesta HTTP llega:
  9. La Promise de fetch se resuelve → va a la microtask queue
  10. Event loop la toma → searchUser() RE-ENTRA al stack
  11. Ejecuta res.json() → otro await
  12. searchUser() sale del stack
  13. La Promise de .json() se resuelve
  14. searchUser() RE-ENTRA
  15. Extrae userData, retorna
  16. login() RE-ENTRA
  17. setUser(userData), localStorage.setItem(...)
  18. handleSubmit() continúa
  19. navigate("/checkout")
```

**Punto clave**: Entre el paso 5 y el paso 9, el navegador está **libre**. El usuario puede scrollear, hacer click en otros botones, etc. La UI nunca se congela.

### 5.3 Diagrama de flujo async en el checkout

```
Tiempo → 
         │
Usuario  │ Click "Finalizar Compra"
─────────┤
         │
Call     │ startCheckout() → setStep(1)
Stack    │ validateConnection() → fetch() se delega
         │ await → startCheckout() se PAUSA
         │ Call Stack VACÍO → navegador libre
─────────┤
~300ms   │ ← Response HTTP llega
         │ validateConnection() RE-ENTRA
         │ setStep(2)
         │ validateInventory() → síncrono, instantáneo
         │ setStep(3)
         │ setStep(4)
         │ submitOrder() → fetch() se delega
         │ await → startCheckout() se PAUSA
         │ Call Stack VACÍO
─────────┤
~500ms   │ ← Response HTTP llega
         │ submitOrder() RE-ENTRA
         │ setStep(5)
         │ createPaymentIntent() → fetch() se delega
         │ await → se PAUSA
─────────┤
~200ms   │ ← Response de Stripe llega
         │ createPaymentIntent() RE-ENTRA
         │ setClientSecret(secret)
         │ Usuario ve el formulario de pago
         │ [Usuario llena tarjeta y hace click en Pagar]
─────────┤
         │ handleSubmit() → elements.submit()
         │ → stripe.confirmPayment()
         │ await → se PAUSA
─────────┤
~500ms   │ ← Stripe confirma el pago
         │ handlePaymentSuccess()
         │ savePurchase(order) → síncrono
         │ setStep(6) → setStep(7)
         │ showTicket(true)
```

**Cada `await` libera el Call Stack**. El navegador puede pintar la UI entre cada paso (actualizando el CheckoutProgress, mostrando el formulario de pago, etc.).

---

## 6. Patrones Asíncronos en el Proyecto

### 6.1 Secuencial (await en serie)

```js
async function startCheckout() {
  await validateConnection();   // Espera a que termine
  validateInventory(items);     // Síncrono — no necesita await
  await submitOrder(...);       // Espera a que termine
  await createPaymentIntent(...); // Espera a que termine
  savePurchase(order);          // Síncrono
}
```

Usado en: `CheckoutPage.jsx` — cada paso depende del anterior.

### 6.2 Inicialización condicional (useEffect + async IIFE)

```js
useEffect(() => {
  async function init() {
    const data = await api.fetchProducts();
    setProducts(data);
  }
  init();
}, []);
```

Usado en: `HomePage.jsx` — la carga inicial de productos al montar la página.

### 6.3 Try/catch con estados de UI

```js
async function login(username) {
  setLoading(true);
  setError("");
  try {
    const userData = await searchUser(username);
    setUser(userData);
    navigate("/checkout");
  } catch (err) {
    setError(err.message);
    shakeInput();
  } finally {
    setLoading(false);
  }
}
```

Usado en: `LoginPage.jsx`, `CheckoutPage.jsx` — todas las interacciones async que modifican estados de UI (loading, error, success).

### 6.4 Promesas paralelas (Promise.all)

```js
// Potencial mejora — cargar productos y categorías en paralelo
const [products, categories] = await Promise.all([
  fetchProducts(),
  fetchCategories(),
]);
```

Actualmente **no se usa** en el proyecto porque solo tenemos una API de productos. Pero es el patrón correcto cuando se necesita cargar datos independientes en paralelo.

---

## 7. Resumen

| Concepto | Síncrono | Asíncrono |
|----------|----------|-----------|
| **Ejecución** | Bloqueante | No bloqueante |
| **Tiempo** | Instantáneo (< 1ms) | Variable (ms a segundos) |
| **Resultado** | Disponible inmediatamente | Disponible en el futuro |
| **UI durante ejecución** | Congelada | Responsiva |
| **Ejemplos** | sumar(), filter(), JSON.parse() | fetch(), await, Promise |
| **En el proyecto** | utils.js, cartReducer, getPurchases | api.js, startCheckout(), login() |
| **Manejo de errores** | try/catch o throw directo | try/catch con estados de UI |
| **Testing** | Llamada directa, assert inmediato | async test con await + mock |

**Regla de oro**: Si una operación puede tomar más de ~1ms (llamadas de red, timers, archivos), debe ser asíncrona. Si solo trabaja con datos ya en memoria, puede ser síncrona.

---

*Ver también: [Flujo de Datos](./DATA-FLOW.md), [Arquitectura](./ARCHITECTURE.md), [Flujos](./FLOWS.md)*
