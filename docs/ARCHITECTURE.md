# Arquitectura

## Jerarquía de Providers

El árbol de providers sigue un orden específico que respeta las dependencias entre contextos:

```
BrowserRouter
  └── AuthProvider
       └── CartProvider
            └── Routes
                 ├── HomePage       (/)
                 │    └── SplashScreen (2s fade-out on mount)
                 ├── CartPage       (/carrito)
                 ├── LoginPage      (/login)
                  ├── CheckoutPage   (/checkout) — envuelto en <Elements stripe={stripePromise}>
                  │   (Stripe Elements wrapper para PaymentElement — el clientSecret se asigna dinámicamente en el paso 5)
                  ├── MyPurchasesPage (/mis-compras)
                  └── * → redirect a /
```

**¿Por qué este orden?** `AuthProvider` debe estar por fuera de `CartProvider` porque las decisiones del carrito (como el checkout) dependen del estado de autenticación. Si estuvieran invertidos, `CartSummary` no podría saber si el usuario está logueado antes de redirigir al checkout.

**SplashScreen**: Se renderiza a nivel de `HomePage` cuando los productos aún se están cargando. Es un overlay de viewport completo con animación fade-out de 2 segundos mínimo.

## Tabla de Rutas

| Path | Componente | Acceso | Guardia |
|------|-----------|--------|---------|
| `/` | HomePage | Público | — |
| `/carrito` | CartPage | Público | — |
| `/login` | LoginPage | Público | — |
| `/checkout` | CheckoutPage | Protegido | `useEffect`: si `!user` → redirige a `/login`; si `items.length === 0` → redirige a `/` |
| `/mis-compras` | MyPurchasesPage | Protegido | `useEffect`: si `!user` → redirige a `/login` |
| `*` | Navigate to `/` | — | Redirección automática |

## Decisiones de Diseño (ADR-light)

### ADR-1: Estado del Carrito con Context + useReducer

**Contexto**: El carrito necesita manejar múltiples acciones (agregar, eliminar, incrementar, decrementar, limpiar) con lógica de negocios (capped quantity, auto-remove en 0).

**Decisión**: Se eligió `useReducer` con `CartContext` en lugar de Redux, Zustand o estado local en componentes.

**Consecuencias**:
- ✅ Sin dependencias externas para estado global — zero costo de bundle
- ✅ El reducer es puro y testeable sin mocking
- ✅ Persistencia simple via `useEffect` a localStorage con versionado (`CART_VERSION`)
- ❌ Sin middleware (log, persist) out of the box
- ❌ Sin DevTools para debugging de acciones

### ADR-2: Autenticación con DummyJSON

**Contexto**: La app demo no tiene backend propio. Necesita un método de autenticación simple que funcione sin registro real.

**Decisión**: Se usa `searchUser()` desde `api.js` que hace `GET /users` (lista completa) y busca coincidencia exacta de username client-side. Sin contraseña, sin accessToken.

**Consecuencias**:
- ✅ Cero configuración de backend — funciona out of the box
- ✅ Usuarios demo disponibles documentados por DummyJSON (ej: `emilys`, `johndoe`)
- ❌ Cualquier usuario puede loguearse con solo saber un username existente
- ❌ Sin seguridad real — NO apto para producción

### ADR-3: Checkout con APIs Reales + Stripe

**Contexto**: No hay backend de pagos, pero DummyJSON provee un endpoint POST /carts/add para registrar órdenes. Se necesita procesamiento de pagos real con tarjeta de crédito.

**Decisión**: El checkout ejecuta un pipeline asincrónico real de 7 pasos: valida conexión (fetch dummyjson.com), valida inventario (stock 0 o cantidad > stock), calcula total (client-side), envía orden (POST /carts/add), crea PaymentIntent (Stripe server via localhost:3001), guarda compra (localStorage), y muestra ticket. El pago se procesa con Stripe PaymentElement dentro de un `<Elements>` wrapper con clientSecret dinámico.

**Consecuencias**:
- ✅ Pipeline real con llamadas API auténticas
- ✅ El ID de orden viene de la respuesta del servidor (no generado client-side)
- ✅ Procesamiento de pagos real con Stripe (modo test)
- ✅ validateInventory detecta stock insuficiente (stock === 0 o quantity > stock)
- ❌ Sin validación real de inventario contra stock server-side
- ❌ El servidor Stripe (`server/stripe-server.mjs`) debe ejecutarse por separado con `node --env-file=.env server/stripe-server.mjs`
- ❌ Stripe publishable key (VITE_STRIPE_PUBLISHABLE_KEY) y secret key (STRIPE_SECRET_KEY) requeridas en .env

### ADR-4: Tailwind v4 con @theme

**Contexto**: Se necesita un sistema de diseño cohesivo con tokens reutilizables (colores, tipografía, espaciado).

**Decisión**: Se usa Tailwind CSS v4 con bloque `@theme` en `index.css` para definir todos los tokens de diseño como custom properties de Tailwind.

**Consecuencias**:
- ✅ Tokens centralizados en un solo archivo (`index.css`)
- ✅ Acceso consistente via clases utilitarias (`text-headline-xl`, `bg-primary`)
- ✅ Integración nativa con Vite via `@tailwindcss/vite`
- ❌ Sin CSS Modules — los estilos son globales por naturaleza
- ❌ Sin CSS-in-JS — no hay estilos dinámicos basados en props

### ADR-6: Historial de Compras con localStorage

**Contexto**: Después del checkout, el usuario necesita ver sus compras anteriores. No hay backend propio donde almacenar el historial.

**Decisión**: Se almacena un array de órdenes en localStorage bajo la clave `dotaburgers-purchases`. `savePurchase()` ya no sobrescribe, sino que agrega al array con timestamp. `getPurchases()` recupera el array con try/catch para datos corruptos. Una nueva página `/mis-compras` (MyPurchasesPage) muestra el historial en orden inverso (más reciente primero).

**Consecuencias**:
- ✅ Sin backend adicional — funciona out of the box
- ✅ Cada compra incluye timestamp ISO generado client-side
- ✅ `getPurchases()` maneja datos corruptos silenciosamente
- ✅ La página redirige a `/login` si no hay sesión
- ❌ El historial es local al navegador — no persiste entre dispositivos
- ❌ Si el usuario borra localStorage, pierde el historial
- ❌ Sin paginación ni búsqueda — para pocas órdenes funciona bien

### ADR-7: Stripe PaymentElement con clientSecret Dinámico

**Contexto**: Stripe requiere un clientSecret para montar PaymentElement, pero este se obtiene después de crear el PaymentIntent en el servidor.

**Decisión**: Se usa un `<Elements>` padre en App.jsx (sin clientSecret) para la ruta `/checkout`, y un `<Elements>` hijo en CheckoutPage.jsx (con clientSecret dinámico) que se monta solo cuando `clientSecret` está disponible (paso 5 del pipeline). El servidor Stripe corre en un proceso Node separado.

**Consecuencias**:
- ✅ PaymentElement solo se monta cuando hay clientSecret (evita errores de Stripe)
- ✅ El servidor Stripe se comunica con la API real de Stripe
- ❌ El servidor Stripe necesita `--env-file=.env` para leer STRIPE_SECRET_KEY
- ❌ Dos procesos que mantener: Vite dev server + stripe-server

### ADR-5: Sin TypeScript

**Contexto**: El proyecto es un prototipo/demo. Todo el código actual está en JSX.

**Decisión**: Se desarrolla en JavaScript (JSX) sin TypeScript. No hay planes inmediatos de migración.

**Consecuencias**:
- ✅ Desarrollo más rápido sin configuración de tipos
- ✅ Menos fricción para cambios rápidos
- ❌ Sin type-checking en tiempo de compilación
- ❌ Los IDE no pueden inferir tipos de props complejos
- ❌ Mayor riesgo de errores runtime en refactors grandes

## Convenciones

### Organización de Archivos

- `api.js` — Servicios de API (fetchProducts, searchUser, submitOrder, etc.)
- `utils.js` — Funciones puras (normalizeProduct, mapCategory)
- `components/` — Componentes presentacionales (sin lógica de routing)
- `pages/` — Contenedores a nivel de ruta (usan `useNavigate`, params)
- `context/` — Providers de contexto + custom hooks (useCart, useAuth)
- `__tests__/` — Tests unitarios y de integración

### Nombres

- Archivos de componentes: PascalCase (Header.jsx, ProductCard.jsx)
- Archivos de datos/utilidades: camelCase (api.js, utils.js)
- Contextos: `{Name}Context` + hook `use{Name}` (CartContext + useCart)
- Variables de estado: descriptivas y en inglés o spanglish (`totalItems`, `searchTerm`)
