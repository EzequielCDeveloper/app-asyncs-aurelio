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

## Simulación de Checkout

El checkout es una **simulación de 6 pasos** sin conexión a un backend real.

### Pasos de la Simulación

| Paso | Label | Descripción | Delay |
|------|-------|-------------|-------|
| 1 | Conexión | Validando conexión... | 800-1400ms |
| 2 | Inventario | Confirmando que todo esté en stock... | 800-1400ms |
| 3 | Total | Aplicando impuestos y descuentos... | 800-1400ms |
| 4 | Firestore | Registrando tu orden en el sistema... | 800-1400ms |
| 5 | Historial | Actualizando tu historial de compras... | 800-1400ms |
| 6 | Completado | ¡Compra completada! | — |

### Simulación de Falla

El paso 4 ("Firestore") tiene un **5% de probabilidad de fallar**. Cuando esto ocurre:

1. La simulación se detiene.
2. Se muestra un mensaje de error: "Error al guardar el pedido. Intenta de nuevo."
3. Aparece un botón **"Reintentar"** que reinicia la simulación desde el paso 1.

### Generación de Order ID

Cuando la simulación se completa exitosamente, se genera un ID de orden client-side:

```
DB-{Date.now().toString(36).toUpperCase()}-{Math.floor(Math.random() * 9999)}
```

Ejemplo: `DB-2JXK8A0-4732`

## ⚠️ Aclaración Importante

> Toda la lógica de precios, impuestos, descuentos y checkout es **simulación únicamente**. No hay cálculos reales de IVA, ni procesamiento de pagos, ni persistencia de órdenes en backend. Esta aplicación es un demo/prototipo con fines de presentación.
