# Proposal: align-with-requirements

## Intent

Replace all hardcoded/simulated data with real API calls (FakeStore, DummyJSON) to meet academic requirements. Five modules refactored: splash/fetch on load, catalog enrichment, login simplification, real checkout pipeline.

## Scope

### In Scope
- **M1 — Inicio**: SplashScreen (2s), fetch products from FakeStore API, loading spinner, error+retry, remove `src/data/products.js`
- **M2 — Catálogo**: Add category, star rating (`rating.rate`), stock (`rating.count`) to ProductCard; map FakeStore categories → food labels
- **M3 — Carrito**: Normalize product shape at API boundary (`title→name`, add `alt`, `badge=null`); add cart version key for localStorage migration
- **M4 — Login**: Replace POST auth/login with GET `/users` search by username; remove password field
- **M5 — Checkout**: 6 real async steps (connection ping, stock check, total calc, POST `/carts/add`, persist, ticket)

### Out of Scope
- User registration, real payment, server-side order persistence

## Category Mapping

| FakeStore Category | Food Label |
|---|---|
| `electronics` | Burgers |
| `jewelery` | Sides |
| `men's clothing` | Drinks |
| `women's clothing` | Desserts |

## API Field Mapping

| FakeStore Field | Internal Field | Notes |
|---|---|---|
| `id` | `id` | Direct |
| `title` | `name` | Mapped |
| `price` | `price` | Direct |
| `description` | `description` | Direct |
| `image` | `image` | Direct |
| `category` | `category` | Mapped via table above |
| `rating.rate` | `rating` | New field |
| `rating.count` | `stock` | New field |
| — | `alt` | Derived from `title` |
| — | `badge` | `null` |

## Capabilities

### New Capabilities
- `product-catalog`: API-driven product fetch, loading/error states, SplashScreen
- `user-session`: Username-only lookup via DummyJSON GET /users
- `checkout-flow`: Real async 6-step checkout pipeline

### Modified Capabilities
None — no existing specs to change.

## File Impact

| File | Impact | Description |
|---|---|---|
| `src/data/products.js` | **Removed** | Replaced by API |
| `src/context/CartContext.jsx` | **Modified** | Add CART_VERSION constant, normalize shape at API boundary |
| `src/context/AuthContext.jsx` | **Modified** | Rewrite `login()` to GET `/users` lookup |
| `src/pages/HomePage.jsx` | **Modified** | Fetch from API on mount, pass real data |
| `src/pages/LoginPage.jsx` | **Modified** | Remove password field, update handleSubmit |
| `src/pages/CheckoutPage.jsx` | **Rewritten** | Replace setTimeout steps with real async/await |
| `src/components/ProductCard.jsx` | **Modified** | Add category, rating, stock display |
| `src/components/SplashScreen.jsx` | **New** | 2s splash on app load |
| `src/services/api.js` | **New** | Shared API helpers (FakeStore + DummyJSON) |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| FakeStore API down | Low | Error screen with retry |
| Cart data shape mismatch | Medium | CART_VERSION migration, normalize at fetch boundary |
| DummyJSON /users doesn't include user | Low | Show "user not found" error |
| Long checkout steps break UX | Low | Each step with own error handling + retry |

## Rollback Plan

Revert the 9 files above using `git checkout HEAD -- <file>`. Restore `src/data/products.js` from git history. No DB migration needed — localStorage clears on cart version mismatch.

## Dependencies

- FakeStore API (https://fakestoreapi.com/products) — public, no key
- DummyJSON API (https://dummyjson.com/users, https://dummyjson.com/carts/add) — public, no key

## Success Criteria

- [ ] App loads with 2s SplashScreen, then fetches products from FakeStore
- [ ] ProductCard shows category, star rating, stock count
- [ ] Login requires only username (no password), looks up via GET /users
- [ ] Checkout runs 6 real async steps, posts to DummyJSON cart endpoint
- [ ] `src/data/products.js` removed, no hardcoded product data remains
- [ ] Cart survives version bumps via CART_VERSION migration
