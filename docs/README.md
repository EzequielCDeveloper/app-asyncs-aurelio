# DotaBURGUERS — Documentación

Aplicación web de pedidos de hamburguesas temática de Dota 2. Construida con React 19 + Vite 8 + Tailwind CSS v4 + Stripe. Consume **tres APIs reales**: FakeStore (productos), DummyJSON (usuarios y órdenes), Stripe (pagos).

## Tech Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [React](https://react.dev/) | ^19.2.7 | UI framework |
| [Vite](https://vite.dev/) | ^8.1.0 | Bundler / dev server |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.3.1 | Utility-first CSS |
| [React Router](https://reactrouter.com/) | ^7.18.0 | Client-side routing |
| [Bun](https://bun.sh/) | — | Package manager y runtime |
| [oxlint](https://oxc.rs/) | ^1.69.0 | Linter |
| [Vitest](https://vitest.dev/) | — | Test runner |

## Quick Start

```bash
bun install          # Instalar dependencias
bun dev              # Iniciar servidor de desarrollo
bun build            # Compilar para producción
bun run test         # Ejecutar tests
bun run lint         # Ejecutar linter
bun run preview      # Previsualizar build de producción
```

## Estructura del Proyecto

```
src/
├── api.js            # Service layer: fetchProducts, searchUser, submitOrder, etc.
├── utils.js          # Pure functions: normalizeProduct, mapCategory
├── stripe.js         # Stripe client helpers: stripePromise, createPaymentIntent
├── components/       # Componentes presentacionales
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CheckoutProgress.jsx
│   ├── TicketModal.jsx
│   ├── StripePaymentForm.jsx
│   ├── SplashScreen.jsx
│   └── MobileDrawer.jsx
├── context/          # Providers + hooks
│   ├── CartContext.jsx
│   └── AuthContext.jsx
├── pages/            # Contenedores a nivel de ruta
│   ├── HomePage.jsx
│   ├── CartPage.jsx
│   ├── LoginPage.jsx
│   ├── CheckoutPage.jsx
│   └── MyPurchasesPage.jsx
├── __tests__/        # Tests unitarios (api.js)
│   └── api.test.js
├── pages/__tests__/  # Tests de integración (páginas)
│   ├── HomePage.test.jsx
│   ├── CheckoutPage.test.jsx
│   └── ...
├── context/__tests__/ # Tests de contexto
│   ├── AuthContext.test.jsx
│   └── ...
├── server/           # Servidores auxiliares
│   └── stripe-server.mjs  # Servidor HTTP para PaymentIntents de Stripe
├── App.jsx           # Árbol de providers + rutas
├── index.css         # Tokens de diseño (@theme) + utilidades
└── main.jsx          # Entry point
```

## Tests

- **97 tests** en 10 archivos, todos pasando
- `bun run test` — vitest
- Cobertura: api.js, contexto (Auth, Cart), páginas (Home, Checkout, Login, Cart)

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [Arquitectura](./ARCHITECTURE.md) | Jerarquía de providers, tabla de rutas, decisiones técnicas (ADR-light) |
| [Flujo de Datos](./DATA-FLOW.md) | Ciclo de vida del carrito y autenticación, reducer, persistencia, valores computados |
| [Reglas de Negocio](./BUSINESS-RULES.md) | Fórmulas de precios, IVA, descuento por mayoreo, checkout con APIs reales |
| [Componentes](./COMPONENTS.md) | API reference de los 8 componentes: props, comportamiento, estados vacío/error |
| [Flujos](./FLOWS.md) | 11 flujos de aplicación detallados con diagramas Mermaid y pseudocódigo |
| [Issues](./ISSUES.md) | Catálogo de issues conocidos y deuda técnica |
| [Sistema de Diseño](./mockup/README.md) | Identidad de marca, tokens de diseño y guías visuales |
| [Design Tokens](./mockup/DESIGN-TOKENS.md) | Paletas de color, tipografía, espaciado — extraídos de `index.css` |
| [Guías de Diseño](./mockup/DESIGN-GUIDELINES.md) | Patrones de componentes, animaciones, iconografía |
| [Async/Sync](./ASYNC.md) | Explicación de funciones síncronas y asíncronas, su uso en el proyecto, flujo del event loop |
