# Arquitectura

## Jerarquía de Providers

El árbol de providers sigue un orden específico que respeta las dependencias entre contextos:

```
BrowserRouter
  └── AuthProvider
       └── CartProvider
            └── Routes
                 ├── HomePage       (/)
                 ├── CartPage       (/carrito)
                 ├── LoginPage      (/login)
                 ├── CheckoutPage   (/checkout)
                 └── * → redirect a /
```

**¿Por qué este orden?** `AuthProvider` debe estar por fuera de `CartProvider` porque las decisiones del carrito (como el checkout) dependen del estado de autenticación. Si estuvieran invertidos, `CartSummary` no podría saber si el usuario está logueado antes de redirigir al checkout.

## Tabla de Rutas

| Path | Componente | Acceso | Guardia |
|------|-----------|--------|---------|
| `/` | HomePage | Público | — |
| `/carrito` | CartPage | Público | — |
| `/login` | LoginPage | Público | — |
| `/checkout` | CheckoutPage | Protegido | `useEffect`: si `!user` → redirige a `/login`; si `items.length === 0` → redirige a `/` |
| `*` | Navigate to `/` | — | Redirección automática |

## Decisiones de Diseño (ADR-light)

### ADR-1: Estado del Carrito con Context + useReducer

**Contexto**: El carrito necesita manejar múltiples acciones (agregar, eliminar, incrementar, decrementar, limpiar) con lógica de negocios (capped quantity, auto-remove en 0).

**Decisión**: Se eligió `useReducer` con `CartContext` en lugar de Redux, Zustand o estado local en componentes.

**Consecuencias**:
- ✅ Sin dependencias externas para estado global — zero costo de bundle
- ✅ El reducer es puro y testeable sin mocking
- ✅ Persistencia simple via `useEffect` a localStorage
- ❌ Sin middleware (log, persist) out of the box
- ❌ Sin DevTools para debugging de acciones

### ADR-2: Autenticación con DummyJSON

**Contexto**: La app demo no tiene backend propio. Necesita un método de autenticación simple que funcione sin registro real.

**Decisión**: Se usa la API pública de DummyJSON (`/users/filter?key=username&value=...`) para validar usuarios existentes. Sin contraseña.

**Consecuencias**:
- ✅ Cero configuración de backend — funciona out of the box
- ✅ Usuarios demo disponibles documentados por DummyJSON (ej: `emilys`, `johndoe`)
- ❌ Cualquier usuario puede loguearse con solo saber un username existente
- ❌ Sin seguridad real — NO apto para producción

### ADR-3: Checkout Simulado

**Contexto**: No hay backend de pagos ni procesamiento de órdenes real.

**Decisión**: El checkout es una simulación de 6 pasos con delays aleatorios (800-1400ms) y una tasa de fallo simulada del 5% en el paso 4.

**Consecuencias**:
- ✅ Demostración completa del flujo UX sin backend
- ✅ El estado de error muestra el manejo de errores real en UI
- ❌ Los IDs de orden son client-side (`DB-${timestamp}-${random}`)
- ❌ No hay persistencia real de órdenes

### ADR-4: Tailwind v4 con @theme

**Contexto**: Se necesita un sistema de diseño cohesivo con tokens reutilizables (colores, tipografía, espaciado).

**Decisión**: Se usa Tailwind CSS v4 con bloque `@theme` en `index.css` para definir todos los tokens de diseño como custom properties de Tailwind.

**Consecuencias**:
- ✅ Tokens centralizados en un solo archivo (`index.css`)
- ✅ Acceso consistente via clases utilitarias (`text-headline-xl`, `bg-primary`)
- ✅ Integración nativa con Vite via `@tailwindcss/vite`
- ❌ Sin CSS Modules — los estilos son globales por naturaleza
- ❌ Sin CSS-in-JS — no hay estilos dinámicos basados en props

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

- `components/` — Componentes presentacionales (sin lógica de routing)
- `pages/` — Contenedores a nivel de ruta (usan `useNavigate`, params)
- `context/` — Providers de contexto + custom hooks (useCart, useAuth)
- `data/` — Datos estáticos (productos, categorías)

### Nombres

- Archivos de componentes: PascalCase (Header.jsx, ProductCard.jsx)
- Archivos de datos: camelCase (products.js)
- Contextos: `{Name}Context` + hook `use{Name}` (CartContext + useCart)
- Variables de estado: descriptivas y en inglés o spanglish (`totalItems`, `searchTerm`)
