# Componentes

Referencia completa de la API de componentes, props, comportamiento, estados vacío/error y accesibilidad.

---

## Header

**Archivo**: `src/components/Header.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `showSearch` | `boolean` | No | `false` | Muestra el campo de búsqueda en desktop |
| `searchTerm` | `string` | No | — | Valor controlado del input de búsqueda |
| `onSearchChange` | `function` | No | — | Handler que recibe el nuevo valor del search |

### Comportamiento

- **Sticky**: El header permanece fijo en la parte superior (`sticky top-0 z-50`).
- **Cart Badge**: Muestra un badge con la cantidad total de items. **Caps at "99+"** cuando `totalItems > 99`.
- **User Menu**: Si el usuario está logueado, muestra un dropdown con nombre, email, link "Mis Compras" y opción "Cerrar sesión". El menú se cierra al hacer clic fuera (click-outside detectado via `useRef` + `mousedown` listener).
- **Sin login**: Si no hay usuario, el botón de usuario redirige a `/login`.
- **Responsive**: El campo de búsqueda solo se muestra en desktop (`hidden md:flex`).

### Accesibilidad

- `aria-label="Carrito de compras"` en el botón del carrito.
- `aria-label` dinámico en el botón de usuario: `"Usuario: {user.firstName}"` o `"Iniciar sesión"`.
- Dropdown de usuario con `animate-fade-in`.

---

## Footer

**Archivo**: `src/components/Footer.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| — | — | — | — | Este componente **no recibe props** |

### Comportamiento

- Muestra enlaces de navegación: Aviso de Privacidad, Términos del Servicio, Contacto, Soporte.
- **Todos los enlaces apuntan a `#`** — son placeholders.
- Copyright: "© 2024 DotaBURGUERS. Todos los derechos reservados."
- Layout responsive: columna en mobile, fila en desktop.

---

## SplashScreen

**Archivo**: `src/components/SplashScreen.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `onFinish` | `function` | Sí | — | Callback ejecutado al terminar la animación de fade-out |

### Comportamiento

- Overlay de viewport completo (position fixed, inset 0, z-50).
- Se muestra al menos 2 segundos (mínimo de duración).
- Luego ejecuta una animación de fade-out (opacidad 1 → 0).
- Al terminar el fade-out, llama a `onFinish` callback.
- Renderiza el logo de DotaBURGUERS centrado con estilos de marca.

### Estados

- **Montaje**: Opacidad 1, visible.
- **Fade-out**: Transición de opacidad (500ms-1s).
- **Completado**: `onFinish` notifica al padre (HomePage) para que oculte el splash.

---

## ProductCard

**Archivo**: `src/components/ProductCard.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `product.id` | `number` | Sí | — | ID único del producto |
| `product.name` | `string` | Sí | — | Nombre del producto |
| `product.description` | `string` | Sí | — | Descripción corta |
| `product.price` | `number` | Sí | — | Precio unitario en USD |
| `product.category` | `string` | Sí | — | Categoría mapeada: "Burgers", "Sides", "Drinks", "Desserts" |
| `product.badge` | `string \| null` | No | `null` | Texto del badge (ej: "Popular", "Nuevo") |
| `product.image` | `string` | Sí | — | URL de la imagen del producto |
| `product.alt` | `string` | Sí | — | Texto alternativo de la imagen |
| `product.rating` | `number` | Sí | — | Rating promedio (0-5, de FakeStore `rating.rate`) |
| `product.stock` | `number` | Sí | — | Cantidad disponible (de FakeStore `rating.count`) |

### Comportamiento

- Al hacer clic en el botón "+", dispara `dispatch({ type: "ADD_ITEM", product })`.
- **Hover zoom**: La imagen escala al 110% con `transition-transform duration-500 group-hover:scale-110`.
- **Badge**: Si `product.badge` no es null, se muestra en la esquina superior izquierda con bg `secondary-container`.
- **Category chip**: Muestra la categoría como un chip estilizado debajo del nombre.
- **Rating**: Muestra estrellas (★★★★★) basadas en `product.rating` (redondeado al entero más cercano).
- **Stock**: Texto "Quedan N" si stock > 0, o "Agotado" si stock === 0.
- La tarjeta completa se eleva ligeramente en hover (`hover:-translate-y-1 hover:shadow-md`).

### Accesibilidad

- `aria-label` en el botón: `"Agregar {product.name} al carrito"`.
- Imagen con `alt` descriptivo desde los datos del producto.
- `loading="lazy"` en imágenes para rendimiento.

---

## CartItem

**Archivo**: `src/components/CartItem.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `item.id` | `number` | Sí | — | ID único del producto |
| `item.name` | `string` | Sí | — | Nombre del producto |
| `item.image` | `string` | Sí | — | URL de la imagen |
| `item.price` | `number` | Sí | — | Precio unitario |
| `item.quantity` | `number` | Sí | — | Cantidad actual (1-99) |
| `item.description` | `string` | Sí | — | Descripción corta |
| `item.alt` | `string` | No | — | Texto alternativo de la imagen |

### Comportamiento

- **Controles de cantidad**: Botones "+" y "-" con estilo `rounded-full` dentro de un pill.
- **Delete**: Botón de eliminar con icono `delete`. Al hacer clic, dispara `REMOVE_ITEM`.
- **Máximo 99**: El botón "+" no tiene efecto visible cuando quantity = 99 (lo maneja el reducer).
- **Llega a 0**: Si se decrementa de 1 a 0, el item desaparece automáticamente.
- **Responsive**: En mobile, layout columna; en sm+, fila con imagen fija de 128px.

### Accesibilidad

- `aria-label="Eliminar {item.name}"` en el botón de delete.
- `aria-label="Disminuir cantidad"` y `aria-label="Aumentar cantidad"` en los botones +/-.
- `alt` en la imagen: usa `item.alt || item.name`.

---

## CartSummary

**Archivo**: `src/components/CartSummary.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| — | — | — | — | **No recibe props** — Lee todo del contexto (`useCart()`, `useAuth()`) |

### Comportamiento

- Muestra subtotal, IVA, descuento (si aplica) y total.
- **Auth-gated checkout**: El botón "Finalizar Compra" redirige a `/login` si `!user`, o a `/checkout` si está logueado.
- Descuento: Se muestra solo cuando `discount > 0`, con icono `loyalty` y bg verde claro.
- Botón secundario "Seguir Comprando" que redirige a `/`.
- Muestra un icono de candado con texto "Pago Seguro" (solo visual, no hay seguridad real).

### Estados

- **Sin descuento**: La sección de descuento no se renderiza.
- **Sin items**: Este componente no se muestra (CartPage muestra empty state antes).

---

## CheckoutProgress

**Archivo**: `src/components/CheckoutProgress.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `currentStep` | `number` | Sí | — | Paso actual (1-7). 0 = no se renderiza. |

### Steps

| Paso | Label | Estado cuando currentStep... |
|------|-------|------------------------------|
| 1 | Conexión | `<` → pending, `=` → active, `>` → completed |
| 2 | Inventario | `<` → pending, `=` → active, `>` → completed |
| 3 | Total | `<` → pending, `=` → active, `>` → completed |
| 4 | Pedido | `<` → pending, `=` → active, `>` → completed |
| 5 | Pago | `<` → pending, `=` → active, `>` → completed |
| 6 | Guardar | `<` → pending, `=` → active, `>` → completed |
| 7 | Completado | `<` → pending, `=` → active, `>` → completed |

### Comportamiento

- **Progress line**: Una barra de progreso animada (`transition-all duration-500 ease-in-out`) que avanza según `currentStep`.
- **Completed**: Círculo con bg `primary` y icono `check` (fill).
- **Active**: Círculo con borde `primary` y un punto pulsante (`animate-pulse`).
- **Pending**: Círculo semitransparente con borde `border-subtle` y número.
- **Labels**: Solo visibles en desktop (`hidden md:block`).

---

## TicketModal

**Archivo**: `src/components/TicketModal.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `order.id` | `string` | Sí | — | ID de la orden (ej: `2` — ID real devuelto por DummyJSON) |
| `order.date` | `string` | Sí | — | Fecha ISO de la orden |
| `onClose` | `function` | Sí | — | Callback al cerrar el modal |

### Comportamiento

- **Receipt-style**: Diseño tipo ticket con bordes dashed, centrado, max-w-md.
- **Escape key**: Detecta `Escape` via `useEffect` y ejecuta `handleClose()`.
- **Al cerrar**: Dispara `dispatch({ type: "CLEAR" })`, llama a `onClose?.()`, y redirige a `/` con `navigate("/")`.
- Muestra fecha formateada en español (`es-MX`) con hora.
- Lista de productos comprados con cantidades y subtotales.
- Totales: subtotal, descuento (si aplica), IVA y total.
- Botón "Cerrar".
- El ID de orden proviene de la respuesta real del POST /carts/add de DummyJSON.

### Accesibilidad

- `role="dialog"` y `aria-modal="true"`.
- `aria-label="Ticket de compra"` en el contenedor del modal.
- Overlay con `bg-black/40 backdrop-blur-sm`.

---

## MyPurchasesPage

**Archivo**: `src/pages/MyPurchasesPage.jsx`

### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| — | — | — | — | **No recibe props** — Lee todo del contexto (`useAuth()`) y de localStorage (`getPurchases()`) |

### Comportamiento

- **Auth guard**: Si `!user` → redirige a `/login` via `useEffect`
- **Empty state**: Si no hay compras, muestra icono `receipt_long`, "No tenés compras aún", y botón "Ver Menú" que redirige a `/`
- **Lista**: Muestra las órdenes en orden inverso (más reciente primero), cada una como una tarjeta con:
  - Número de pedido y fecha formateada (locale `es-AR`)
  - Lista de productos con título y cantidad
  - Total de la orden
- **Fecha**: Formateada con `toLocaleDateString("es-AR", { year, month, day, hour, minute })`

### Accesibilidad

- Usa `<h1>` para el título de la página y `<h3>` para cada pedido
- Enlaces `<Link>` para navegación semántica

---

## Estados Vacío y Error

### CartPage — Carrito Vacío

Cuando `items.length === 0`:

```
🛒 shopping_cart (icono grande)
Tu carrito está vacío
Agrega productos del menú para empezar.
[Ver Menú] → redirige a /
```

### CheckoutPage — Sin Items o Sin Auth

- Si `items.length === 0`: redirige automáticamente a `/`.
- Si `!user`: redirige automáticamente a `/login`.
- Ambos casos se manejan con `useEffect` en el montaje.

### CheckoutPage — Error de API

Cuando falla cualquiera de los pasos del pipeline de checkout real (connection, inventory, order submission):
- Mensaje de error centrado con icono `error` y descripción del problema.
- Botón "Reintentar" que reinicia el pipeline desde el paso 1.

### HomePage — Cargando Productos

Mientras se fetch los productos desde FakeStore API:
- Loading skeleton animado (placeholders grises pulsantes).
- SplashScreen se muestra durante los primeros 2 segundos como overlay.

### HomePage — Error de API

Cuando falla el fetch de productos:
- Mensaje de error centrado con icono `error`.
- Botón "Reintentar" que vuelve a llamar a `fetchProducts()`.

### HomePage — Sin Resultados de Búsqueda

Cuando el filtro/búsqueda no encuentra productos:

```
🔍 search_off (icono grande)
No se encontraron productos
Intenta con otros términos de búsqueda o categoría.
```

### LoginPage — Error de Autenticación

Cuando el login falla:
- Mensaje de error debajo del input con icono `error`.
- El input se agita con animación **shake** (Web Animations API, 400ms).
- Borde del input cambia a `border-error`.

### MyPurchasesPage — Sin Compras

Cuando `purchases.length === 0`:

```
🧾 receipt_long (icono grande)
No tenés compras aún
Tus pedidos aparecerán acá después de completar la compra.
[Ver Menú] → redirige a /
```

### MyPurchasesPage — Sin Autenticación

Si `!user`: redirige automáticamente a `/login` via `useEffect`.

### Errores de Contexto

- `useCart()` lanza `Error("useCart must be used within CartProvider")` si se usa fuera del provider.
- `useAuth()` lanza `Error("useAuth must be used within AuthProvider")` si se usa fuera del provider.
