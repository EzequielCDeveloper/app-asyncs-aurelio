# Flujo de Datos

## Estado del Carrito

### Estado Inicial

El carrito se inicializa desde `localStorage` con la clave `dotaburgers-cart`. Si no hay datos o el JSON es inválido, se devuelve un arreglo vacío `[]`.

```
loadCart()
  ├── localStorage.getItem("dotaburgers-cart")
  ├── JSON.parse(raw) → items[]
  └── catch → []
```

### Acciones del Reducer

| Acción | Trigger (Componente) | Efecto |
|--------|---------------------|--------|
| `ADD_ITEM` | ProductCard | Si el item ya existe, incrementa quantity en 1. Si no, agrega `{ ...product, quantity: 1 }`. |
| `REMOVE_ITEM` | CartItem (delete) | Elimina el item del arreglo por `id`. |
| `INCREMENT` | CartItem (+) | Incrementa quantity en 1. **Caps at 99** — si `item.quantity >= 99`, retorna state sin cambios. |
| `DECREMENT` | CartItem (-) | Decrementa quantity en 1. **Si llega a 0**, el item se elimina del arreglo (filter). |
| `CLEAR` | CartPage ("Vaciar carrito"), TicketModal (al cerrar) | Resetea el estado a `[]`. |

### Edge Cases

- **ADD_ITEM duplicado**: Si el producto ya existe, no se duplica — solo incrementa quantity.
- **INCREMENT en 99**: El reducer retorna `state` sin mutaciones cuando `quantity >= 99`.
- **DECREMENT a 0**: El `.filter(i => i.quantity > 0)` post-map elimina automáticamente el item.
- **JSON corrupto**: `loadCart()` usa try/catch y retorna `[]` ante cualquier error de parseo.

### Persistencia

Cada vez que el estado `items` cambia, un `useEffect` sincroniza automáticamente:

```js
useEffect(() => {
  localStorage.setItem("dotaburgers-cart", JSON.stringify(items));
}, [items]);
```

Esto significa que cualquier modificación (agregar, eliminar, cambiar cantidad) persiste inmediatamente. Al recargar la página, `loadCart()` recupera los datos.

### Valores Computados

| Valor | Fórmula | Descripción |
|-------|---------|-------------|
| `totalItems` | `items.reduce((sum, i) => sum + i.quantity, 0)` | Suma total de productos (no de líneas). Usado para el badge del carrito y el resumen. |
| `subtotal` | `items.reduce((sum, i) => sum + i.price * i.quantity, 0)` | Suma de precio × cantidad para cada item. |
| `discount` | `subtotal > 500 ? subtotal * 0.1 : 0` | Descuento por mayoreo (10% cuando subtotal supera $500). |
| `iva` | `(subtotal - discount) * 0.16` | IVA del 16% aplicado **después** del descuento. |
| `total` | `subtotal - discount + iva` | Monto final a pagar. |

**Nota**: Todos los valores se calculan en el provider (`CartContext.jsx:55-59`) y se recalculan en cada render cuando `items` cambia.

## Flujo de Autenticación

### Login

```
login(username)
  │
  ├─→ fetch(`https://dummyjson.com/users/filter?key=username&value=${username}`)
  │
  ├─→ Éxito (data.users.length > 0)
  │    ├── Extrae: { id, username, firstName, lastName, email, image }
  │    ├── setUser(userData) — actualiza estado
  │    ├── localStorage.setItem("dotaburgers-user", JSON.stringify(userData))
  │    └── Retorna userData
  │
  └─→ Falla (data.users.length === 0 o error HTTP)
       ├── throw new Error("Usuario no encontrado")
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
