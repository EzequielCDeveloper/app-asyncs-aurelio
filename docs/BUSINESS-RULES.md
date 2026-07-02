# Reglas de Negocio

## Fórmulas de Precios

Todos los cálculos de precios son **client-side** y se ejecutan en el `CartProvider`.

| Concepto | Fórmula |
|----------|---------|
| Subtotal | `items.reduce((sum, i) => sum + i.price * i.quantity, 0)` |
| Descuento | `subtotal > 500 ? subtotal * 0.1 : 0` |
| IVA | `(subtotal - discount) * 0.16` |
| Total | `subtotal - discount + iva` |

### Reglas Importantes

- **IVA (16%)**: Se aplica **después** del descuento. La base gravable es `subtotal - discount`.
- **Descuento por Mayoreo (10%)**: Se aplica automáticamente cuando el `subtotal` supera los **$500.00**.
- **Tope de cantidad máxima**: Ningún producto puede tener más de **99 unidades**. El reducer retorna el estado sin cambios si se intenta incrementar más allá de 99.

## Ejemplos Trabajados

### Ejemplo A: Pedido sin descuento (subtotal ≤ $500)

**Productos:**
- Classic Mid Burger × 3 ($8.99 c/u) = $26.97
- Radiant Fries × 2 ($4.49 c/u) = $8.98

| Concepto | Cálculo | Monto |
|----------|---------|-------|
| Subtotal | $26.97 + $8.98 | **$35.95** |
| Descuento (10%) | $35.95 > $500 → No aplica | **$0.00** |
| IVA (16%) | ($35.95 - $0.00) × 0.16 | **$5.75** |
| **Total** | $35.95 - $0.00 + $5.75 | **$41.70** |

### Ejemplo B: Pedido con descuento por mayoreo (subtotal > $500)

**Productos:**
- Roshan's Double Stack × 20 ($14.49 c/u) = $289.80
- Windranger's Grilled Chicken × 20 ($10.49 c/u) = $209.80
- Radiant Fries × 15 ($4.49 c/u) = $67.35
- Dire Chocolate Shake × 10 ($5.99 c/u) = $59.90

| Concepto | Cálculo | Monto |
|----------|---------|-------|
| Subtotal | $289.80 + $209.80 + $67.35 + $59.90 | **$626.85** |
| Descuento (10%) | $626.85 × 0.10 | **$62.69** |
| Base gravable (IVA) | $626.85 - $62.69 | $564.16 |
| IVA (16%) | $564.16 × 0.16 | **$90.27** |
| **Total** | $626.85 - $62.69 + $90.27 | **$654.43** |

> Los montos pueden diferir ligeramente por redondeo. La app usa `.toFixed(2)` para display.

## Pipeline de Checkout (APIs Reales)

El checkout ejecuta un **pipeline asincrónico real** con 6 pasos. Ya no es una simulación.

### Pasos del Pipeline

| Paso | Label | Acción | API |
|------|-------|--------|-----|
| 1 | Conexión | `validateConnection()` — fetch a dummyjson.com para verificar conectividad | `GET https://dummyjson.com` |
| 2 | Inventario | `validateInventory(items)` — verifica que ningún item tenga stock === 0 o quantity > stock | Client-side (datos ya cargados) |
| 3 | Total | Cálculo de subtotal, descuento, IVA y total desde CartContext | Client-side |
| 4 | Pedido | `submitOrder(userId, items)` — envía la orden a DummyJSON | `POST https://dummyjson.com/carts/add` |
| 5 | Guardar | `savePurchase(response)` — persiste la respuesta de la orden en localStorage | Client-side |
| 6 | Completado | `showTicket` — muestra TicketModal con el resultado | UI |

### Validación de Inventario

`validateInventory(items)` recorre los items del carrito y verifica:

- Si `item.stock === 0` → error: producto agotado
- Si `item.quantity > item.stock` → error: cantidad solicitada supera el stock disponible

Cualquier error detiene el pipeline y muestra el botón "Reintentar".

### Manejo de Errores

Si cualquiera de los pasos 1-5 falla (error de conexión, error de validación, error de API):

1. El pipeline se detiene.
2. Se muestra el mensaje de error específico.
3. Aparece un botón **"Reintentar"** que reinicia el pipeline desde el paso 1.

No hay fallo aleatorio simulado (se eliminó el antiguo 5% de probabilidad en step 4).

### Order ID

Cuando el pipeline se completa exitosamente, el ID de orden proviene de la respuesta real de DummyJSON (`POST /carts/add` → `response.id`). Ya no se genera un ID client-side.

## ⚠️ Aclaración Importante

> Toda la lógica de precios, impuestos y descuentos es **client-side**. Aunque el checkout ahora usa APIs reales (validación de conexión, inventario y envío de orden), **no hay procesamiento de pagos real**. Esta aplicación es un demo/prototipo con fines de presentación.
