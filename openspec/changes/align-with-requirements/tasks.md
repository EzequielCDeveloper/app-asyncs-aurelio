# Tasks: align-with-requirements

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600 (PR1: 200 + PR2: 150 + PR3: 250) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data layer + SplashScreen | PR 1 | Base: main. Foundation for all downstream work. |
| 2 | Catalog enrich + Cart migration | PR 2 | Base: main. Depends on api.js normalize shape from PR1. |
| 3 | Username login + real checkout | PR 3 | Base: main. Depends on api.js helpers and normalized cart items. |

## PR 1 — Data Layer + SplashScreen (Foundation)

- [x] PR1.1 **Create `src/api.js` + `src/utils.js`** — `fetchProducts()`, `searchUser()`, `submitOrder()` in api.js; `normalizeProduct()` and `mapCategory()` in utils.js
- [x] PR1.2 **Create `src/components/SplashScreen.jsx`** — full-viewport overlay with logo + "Cargando...", `onFinish` callback, fade-out via CSS transition
- [x] PR1.3 **Add SplashScreen + fetch `HomePage.jsx`** — `useEffect` on mount calls `fetchProducts()`, drives `loading`/`error`/`products` state; shows splash for ≥2s; remove import of `products`/`categories` from `./data/products`
- [x] PR1.4 **No changes to `index.css`** — SplashScreen uses Tailwind transition utilities; skeleton-shimmer class reused for loading state
- [x] PR1.5 **Derive categories from fetched data** — dynamic `categories` array from `Set(products.map(p => p.category))` + prepend "Todas"
- [x] PR1.6 **Delete `src/data/products.js`** — file removed; no remaining imports (grep-confirmed)
- [x] PR1.7 **Verify**: build passes, all 69 tests pass (8 test files), splash appears 2s then fades to product grid

## PR 2 — Catalog & Cart (Product Display + Cart Migration)

- [x] PR2.1 **Enrich `ProductCard.jsx`** — add category tag, star rating (★ from `rating`), stock indicator (`stock` remaining)
- [x] PR2.2 **Add `CART_VERSION` constant** in `CartContext.jsx` — `CART_VERSION = 2`; `loadCart()` checks `version` field, clears if mismatch
- [x] PR2.3 **Normalize at ADD_ITEM** — `cartReducer` calls `normalizeProduct()` on `action.product` before spreading into state; ensures field shape: `name`, `alt`, `rating`, `stock`, `badge: null`
- [x] PR2.4 **Update `CartItem.jsx`** — ensure `alt` fallback: `item.alt || item.name`
- [x] PR2.5 **Remove "Complete Your Build" section** in `HomePage.jsx` — delete section referencing hardcoded product IDs (1, 5, 6, 9)
- [x] PR2.6 **Verify**: categories derived dynamically, cards show rating/stock, old localStorage cart cleared on version bump

## PR 3 — Auth & Checkout (Login Rewrite + Checkout Pipeline)

- [x] PR3.1 **Rewrite `AuthContext.jsx` `login()`** — replace POST/auth/login with `searchUser(username)` from api.js, remove `accessToken`, use `async/await` + try/catch
- [x] PR3.2 **Simplify `LoginPage.jsx`** — remove password input, showPassword toggle, passwordRef, `password` state; submit calls `login(username.trim())` with empty-guard
- [x] PR3.3 **Rewrite `CheckoutPage.jsx`** — replace `setTimeout` loop with 6 real `await` calls: `validateConnection()` → `validateInventory()` → read total → `submitOrder(userId, items)` → `savePurchase()` → show ticket; remove random failure branch
- [x] PR3.4 **Update `CheckoutProgress.jsx`** — relabel "Firestore" → "Pedido" and "Historial" → "Guardar" in steps 4 and 5
- [x] PR3.5 **Verify**: login with username only, 6-step checkout with real API calls, error+retry on each step, ticket modal shows on success
