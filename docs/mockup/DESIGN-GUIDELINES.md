# Guías de Diseño

## Patrones de Componentes

### Cards

| Propiedad | Valor |
|-----------|-------|
| Background | `bg-surface` |
| Border radius | `rounded-2xl` |
| Sombra base | `shadow-sm` |
| Hover | `hover:shadow-md hover:-translate-y-1` |
| Transición | `transition-all duration-300` |
| Border | `border border-border-subtle` |
| **Uso en**: | ProductCard |

### Botones (Primary)

| Propiedad | Valor |
|-----------|-------|
| Background | `bg-primary` |
| Texto | `text-on-primary` |
| Border radius | `rounded-2xl` |
| Hover | `hover:bg-primary-container hover:shadow-md` |
| Focus | `focus:ring-2 focus:ring-offset-2 focus:ring-primary` |
| Transición | `transition-all` |
| **Uso en**: | "Finalizar Compra", "Agregar", "Order Now" |

### Botones (Ghost / Link)

| Propiedad | Valor |
|-----------|-------|
| Texto | `text-primary` |
| Hover | `hover:underline` |
| Font | `font-label-bold text-label-bold` |
| **Uso en**: | "Seguir Comprando", "¿Olvidaste tu usuario?" |

### Inputs

| Propiedad | Valor |
|-----------|-------|
| Background | `bg-surface-container-low` o `bg-surface-container-lowest` |
| Border | `border border-border-subtle` |
| Border radius | `rounded-2xl` |
| Focus | `focus:ring-2 focus:ring-primary focus:border-transparent` |
| Error state | `border-error focus:border-error focus:ring-error` |
| Placeholder | `placeholder:text-outline` |
| **Uso en**: | Search input, Login username |

### Modal (TicketModal)

| Propiedad | Valor |
|-----------|-------|
| Overlay | `fixed inset-0 bg-black/40 backdrop-blur-sm` |
| Container | `bg-surface-container-lowest rounded-2xl max-w-md` |
| Separadores | `border-dashed border-border-subtle` |
| Animación | `animate-fade-in` |
| Rol | `role="dialog" aria-modal="true"` |
| **Uso en**: | TicketModal post-checkout |

### Stepper (CheckoutProgress)

| Propiedad | Valor |
|-----------|-------|
| Track line | `h-1 bg-border-subtle rounded-full` |
| Progress | `h-1 bg-primary transition-all duration-500` |
| Completed step | `bg-primary` con icono `check` (fill) |
| Active step | `border-2 border-primary` con punto pulsante (`animate-pulse`) |
| Pending step | `border-2 border-border-subtle opacity-50` |
| **Uso en**: | CheckoutPage durante la simulación |

### Badges (ProductCard)

| Propiedad | Valor |
|-----------|-------|
| Background | `bg-secondary-container` |
| Texto | `text-on-secondary-container` |
| Font | `text-xs font-bold` |
| Border radius | `rounded-lg` |
| Posición | `absolute top-2 left-2` |
| **Uso en**: | ProductCard (badge "Popular", "Nuevo") |

### Empty States

| Propiedad | Valor |
|-----------|-------|
| Layout | `flex flex-col items-center justify-center py-16 text-center` |
| Icono | Grande: `text-5xl` o `text-6xl`, `text-on-surface-variant` |
| Título | `font-headline-lg text-headline-lg text-on-surface` |
| Descripción | `font-body-base text-body-base text-on-surface-variant` |
| CTA | Botón primary con `rounded-2xl` |
| **Uso en**: | CartPage vacío, HomePage sin resultados |

### Quantity Control

| Propiedad | Valor |
|-----------|-------|
| Container | `bg-surface-container-low rounded-full p-1` |
| Border | `border border-border-subtle` |
| Botones +/- | `w-8 h-8 rounded-full hover:bg-surface-variant` |
| Display | `font-label-bold text-label-bold` |
| **Uso en**: | CartItem |

### Dropdown Menu (User)

| Propiedad | Valor |
|-----------|-------|
| Container | `bg-surface-container-lowest rounded-2xl shadow-md border border-border-subtle` |
| Animación | `animate-fade-in` |
| Padding | `p-2` |
| **Uso en**: | Header (user menu dropdown) |

## Animaciones

| Nombre | Duración | CSS Class / API | Uso |
|--------|----------|-----------------|-----|
| `fadeIn` | 0.3s ease-out | `.animate-fade-in` | Dropdown de usuario, TicketModal |
| `shimmer` | 1.5s infinite linear | `.skeleton-shimmer` | Skeleton loading (actualmente no usado en componentes) |
| `shake` | 400ms ease-in-out | Web Animations API (JS) | LoginPage — input de username en error |
| Hover transitions | 300ms | `transition-all duration-300` | Cards, botones, imágenes |
| Stepper progress | 500ms ease-in-out | `transition-all duration-500` | Barra de progreso del checkout |

### fadeIn

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### shimmer

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### shake

Implementado via Web Animations API en `LoginPage.jsx`:

```js
inputRef.current.animate([
  { transform: "translateX(0)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(0)" },
], { duration: 400, iterations: 1, easing: "ease-in-out" });
```

## Iconografía

### Fuente

Los iconos se cargan desde **Google Material Symbols** via CDN:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

### Clases CSS

- Clase base: `.material-symbols-outlined`
- Variante fill: `.material-symbols-outlined.fill` con `fontVariationSettings: "'FILL' 1"`

### Iconos Utilizados en la App

| Icono | Ubicación |
|-------|-----------|
| `shopping_cart` | Header (carrito), CartPage (empty state) |
| `search` | Header (input de búsqueda) |
| `add` | ProductCard, CartItem (+) |
| `remove` | CartItem (-) |
| `delete` | CartItem (eliminar) |
| `delete_sweep` | CartPage (vaciar carrito) |
| `arrow_forward` | CartSummary, LoginPage |
| `lock` | CartSummary (pago seguro) |
| `loyalty` | CartSummary (descuento) |
| `check` | CheckoutProgress (pasos completados) |
| `check_circle` | CheckoutPage (completado) |
| `expand_more` | HomePage (select sort) |
| `error` | LoginPage, CheckoutPage (errores) |
| `person` | LoginPage (input icon) |
| `account_circle` | Header (usuario sin imagen) |
| `sync` | LoginPage (loading), CheckoutPage (procesando) |
| `shopping_cart_checkout` | CheckoutPage (inicio) |
| `search_off` | HomePage (sin resultados) |
| `add_circle` | HomePage (combo button) |
| `wifi`, `inventory_2`, `save`, `history` | CheckoutPage (pasos de simulación) |

### SVG Sprite

El archivo `public/icons.svg` existe pero **no se utiliza** en la aplicación actual. Todos los iconos se renderizan via Material Symbols (Google Fonts).
