# Flujo de Datos

## Estado del Carrito

### Estado Inicial

El carrito se inicializa desde `localStorage` con la clave `dotaburgers-cart`. El formato almacenado es versionado:

```json
{ "version": 2, "items": [...] }
```

Al cargar, se verifica `CART_VERSION` (constante = 2). Si el `version` almacenado no coincide, se limpia el carrito (migración de datos stale).

```
loadCart()
  ├── localStorage.getItem("dotaburgers-cart")
  ├── JSON.parse(raw) → { version, items }
  ├── version !== CART_VERSION → return []
  └── catch → []
```

### Acciones del Reducer

| Acción | Trigger (Componente) | Efecto |
|--------|---------------------|--------|
| `ADD_ITEM` | ProductCard | Normaliza producto via `normalizeProduct()` (desde api.js). Si el item ya existe, incrementa quantity en 1. Si no, agrega `{ ...normalized, quantity: 1 }`. **Respeta cap de 99** (si quantity >= 99, retorna state sin cambios). |
| `REMOVE_ITEM` | CartItem (delete) | Elimina el item del arreglo por `id`. |
| `INCREMENT` | CartItem (+) | Incrementa quantity en 1. **Caps at 99** — si `item.quantity >= 99`, retorna state sin cambios. |
| `DECREMENT` | CartItem (-) | Decrementa quantity en 1. **Si llega a 0**, el item se elimina del arreglo (filter). |
| `CLEAR` | CartPage ("Vaciar carrito"), TicketModal (al cerrar) | Resetea el estado a `[]`. |

### Edge Cases

- **ADD_ITEM duplicado**: Si el producto ya existe, no se duplica — solo incrementa quantity.
- **ADD_ITEM con normalize**: Productos desde la API (FakeStore) se normalizan: `title→name`, `rating.rate→rating`, `rating.count→stock`, etc.
- **INCREMENT en 99**: El reducer retorna `state` sin mutaciones cuando `quantity >= 99`.
- **DECREMENT a 0**: El `.filter(i => i.quantity > 0)` post-map elimina automáticamente el item.
- **JSON corrupto o version mismatch**: `loadCart()` retorna `[]` ante cualquier error de parseo o versionado.

### Persistencia

Cada vez que el estado `items` cambia, un `useEffect` sincroniza automáticamente:

```js
useEffect(() => {
  localStorage.setItem(
    "dotaburgers-cart",
    JSON.stringify({ version: CART_VERSION, items })
  );
}, [items]);
```

Esto significa que cualquier modificación (agregar, eliminar, cambiar cantidad) persiste inmediatamente. Al recargar la página, `loadCart()` recupera los datos y valida la versión.

### Valores Computados

| Valor | Fórmula | Descripción |
|-------|---------|-------------|
| `totalItems` | `items.reduce((sum, i) => sum + i.quantity, 0)` | Suma total de productos (no de líneas). Usado para el badge del carrito y el resumen. |
| `subtotal` | `items.reduce((sum, i) => sum + i.price * i.quantity, 0)` | Suma de precio × cantidad para cada item. |
| `discount` | `subtotal > 500 ? subtotal * 0.1 : 0` | Descuento por mayoreo (10% cuando subtotal supera $500). |
| `iva` | `(subtotal - discount) * 0.16` | IVA del 16% aplicado **después** del descuento. |
| `total` | `subtotal - discount + iva` | Monto final a pagar. |

**Nota**: Todos los valores se calculan en el provider (`CartContext.jsx`) y se recalculan en cada render cuando `items` cambia.

## Flujo de Autenticación

### Login

```
login(username)
  │
  ├─→ fetchUsers() → GET https://dummyjson.com/users
  │
  ├─→ Busca coincidencia exacta: users.find(u => u.username === username)
  │
  ├─→ Éxito (usuario encontrado)
  │    ├── Extrae: { id, username, firstName, lastName, email, image }
  │    ├── setUser(userData) — actualiza estado
  │    ├── localStorage.setItem("dotaburgers-user", JSON.stringify(userData))
  │    └── Retorna userData
  │
  └─→ Falla (usuario no encontrado o error HTTP)
       ├── throw new Error("Usuario no encontrado") / "Error de conexión"
       └── No se muta ningún estado ni localStorage
```

### Logout

```
logout()
  ├── setUser(null)
  └── localStorage.removeItem("dotaburgers-user")
```

### Persistencia

Al montar la aplicación, `AuthProvider` verifica si hay un usuario persistido:

```js
useEffect(() => {
  const raw = localStorage.getItem("dotaburgers-user");
  if (raw) {
    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem("dotaburgers-user");
    }
  }
}, []);
```

Si el JSON está corrupto, se elimina la entrada de localStorage automáticamente.

## Flujo de Historial de Compras

### Escritura (savePurchase — api.js)

Después de un checkout exitoso, `handlePaymentSuccess()` en CheckoutPage.jsx llama a `savePurchase(order)`:

```js
export function savePurchase(order) {
  const existing = JSON.parse(localStorage.getItem("dotaburgers-purchases") || "[]");
  existing.push({ ...order, date: new Date().toISOString() });
  localStorage.setItem("dotaburgers-purchases", JSON.stringify(existing));
}
```

- Lee el array existente (o `[]` si no hay)
- Agrega la nueva orden con timestamp ISO
- Guarda el array completo
- **No sobrescribe** — acumula órdenes

### Lectura (getPurchases — api.js)

```js
export function getPurchases() {
  try {
    return JSON.parse(localStorage.getItem("dotaburgers-purchases") || "[]");
  } catch {
    return [];
  }
}
```

- Recupera el array de compras
- Si el JSON está corrupto, retorna `[]` silenciosamente
- Llamada desde `MyPurchasesPage.jsx` al montar

### Visualización (MyPurchasesPage.jsx)

```
getPurchases()
  ├── purchases.length === 0 → Empty state con link "Ver Menú"
  └── purchases.length > 0 → [...purchases].reverse().map()
       └── Cada orden muestra:
            ├── Pedido #{order.id}
            ├── Fecha formateada (es-AR locale)
            ├── Lista de productos (title x quantity)
            └── Total $X.XX
```

### Edge Cases

- **Corrupción de datos**: `JSON.parse` falla → `getPurchases()` retorna `[]` silenciosamente
- **Sin compras**: Array vacío → empty state
- **Productos sin título**: DummyJSON puede devolver productos sin campo `title` → fallback `Producto #{p.id}`
- **Múltiples tabs**: El historial NO se sincroniza entre pestañas — cada tab tiene su propio localStorage
