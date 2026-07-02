# Design: align-with-requirements

## Technical Approach

Replace static data and simulated behaviors with real API calls across 5 modules. A shared `api.js` service layer encapsulates all fetch logic, mapping, and error handling. Components fetch data via `useEffect` in pages, not in providers. The `ProductCard` gains new display fields (category, rating, stock). Cart gains a version key to detect and flush stale localStorage payloads. Checkout drops `setTimeout` in favor of sequential `await` calls.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Fetch in Context vs Page | Context: single fetch, all consumers get data. Page: simpler, no extra provider nesting needed. | **Page-level fetch** (`HomePage`). Fetched products are only needed in the catalog. Cart receives normalized items at `ADD_ITEM` time. |
| Normalize at fetch vs ADD_ITEM | Fetch-time: all data clean before reaching any consumer. ADD_ITEM: only cleans what enters cart, keeps raw API data for catalog display. | **Normalize at fetch boundary** in `api.js` + re-normalize at `ADD_ITEM` in the reducer. The mapper is a pure function reused in both places. |
| Cart version: localStorage key rename vs field check | Key rename (`dotaburgers-cart-v2`): simple but loses old key forever. Field check (`version` field inside items): preserves backward compat analysis. | **Version constant `CART_VERSION`** inside cart state + compare on `loadCart()`. If mismatch → clear. |
| SplashScreen: overlay vs redirect | Overlay: keeps same route, CSS transition out. Redirect: needs timer + route change. | **CSS overlay** managed by local state in `HomePage`. Slide-down + fade out after 2s or fetch completion. No router involvement. |

## Data Flow

```
App mount
  └─ HomePage mount
       ├─ setSplash(true)
       ├─ fetchProducts() ──→ api.getProducts() ──→ FakeStore API
       │    ├─ success → setProducts(normalized), setLoading(false)
       │    └─ error   → setError(msg), setLoading(false)
       ├─ timeout(2s) → setSplash(false) OR fetchDone → setSplash(false)
       └─ render: splash ? <SplashScreen /> : <ProductCard[] />

Add to cart
  └─ ProductCard → dispatch({ type: "ADD_ITEM", product })
       └─ cartReducer
            └─ normalizeItem(product) → { id, name, price, image, alt, rating, stock, badge: null }
            └─ write to localStorage

Checkout
  └─ CheckoutPage.startCheckout()
       ├─ api.validateConnection()
       ├─ api.validateInventory(items)
       ├─ subtotal > 500 → discount else 0
       ├─ api.submitOrder(userId, items)  → POST /carts/add
       ├─ api.savePurchase(order)         → simulated localStorage
       └─ showTicket(order)

Login
  └─ AuthContext.login(username)
       └─ api.findUser(username) → GET /users/filter?key=username&value=
            ├─ found → setUser(userData), persist to localStorage
            └─ not found → throw "Usuario no encontrado"
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/services/api.js` | Create | Shared fetch helpers: `getProducts()`, `findUser()`, `validateConnection()`, `submitOrder()`. Category mapper `mapCategory()`. Product normalizer `normalizeProduct()`. |
| `src/components/SplashScreen.jsx` | Create | Full viewport overlay. Logo + spinner. Slide-down entrance, fade-out exit. Props: `visible`. |
| `src/pages/HomePage.jsx` | Modify | Remove `products`/`categories` static import. Add `useEffect` fetch, `loading`/`error`/`products` state. Pass `categories` derived from fetched data. Splash overlay on mount. Keep sort/filter as-is (pure client-side). Remove "Complete Your Build" section (hardcoded product IDs). |
| `src/data/products.js` | Delete | All data now comes from FakeStore API. |
| `src/context/CartContext.jsx` | Modify | Add `CART_VERSION = 2`. In `loadCart()`: if version mismatch → return `[]`. In `ADD_ITEM`: run `normalizeProduct(action.product)` before inserting. |
| `src/context/AuthContext.jsx` | Modify | Rewrite `login(username)` to `GET /users/filter?key=username&value=`. Remove password param. Remove `accessToken` from user data. |
| `src/pages/LoginPage.jsx` | Modify | Remove password input, showPassword toggle, passwordRef. `handleSubmit` calls `login(username)` without password. |
| `src/pages/CheckoutPage.jsx` | Modify | Replace step simulation with real `await` calls to `api.*`. Remove random failure. `STEP_MESSAGES` relabel "Firestore" → "Órden". |
| `src/components/ProductCard.jsx` | Modify | Add category tag, star rating (★☆☆☆☆), stock indicator. Migrate badge from static data → derived from rating (optional). |
| `src/components/CartItem.jsx` | Modify (minor) | Ensure `alt` fallback to `item.name` if `item.alt` absent. |
| `src/components/CartSummary.jsx` | No change | Uses only computed values from CartContext — no product-shape dependency. |
| `src/components/TicketModal.jsx` | No change | Same as CartSummary. Only depends on computed values. |

## Interfaces / Contracts

```js
// src/services/api.js

// Product shape after normalization
// {
//   id,              // from FakeStore
//   name,            // from title
//   price,           // from price
//   description,     // from description
//   category,        // mapped via mapCategory()
//   image,           // from image
//   rating,          // from rating.rate, rounded to 1 decimal
//   stock,           // from rating.count
//   alt,             // from title
//   badge: null,     // always null for API data
// }

const CATEGORY_MAP = {
  "electronics": "Burgers",
  "jewelery": "Sides",
  "men's clothing": "Drinks",
  "women's clothing": "Desserts",
};

export function mapCategory(apiCategory) {
  return CATEGORY_MAP[apiCategory] ?? apiCategory;
}

export function normalizeProduct(raw) {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
    description: raw.description,
    category: mapCategory(raw.category),
    image: raw.image,
    rating: raw.rating?.rate ?? 0,
    stock: raw.rating?.count ?? 0,
    alt: raw.title,
    badge: null,
  };
}

export async function getProducts() {
  const res = await fetch("https://fakestoreapi.com/products");
  if (!res.ok) throw new Error("Error al cargar productos");
  const data = await res.json();
  return data.map(normalizeProduct);
}

export async function findUser(username) {
  const res = await fetch(
    `https://dummyjson.com/users/filter?key=username&value=${encodeURIComponent(username)}`
  );
  if (!res.ok) throw new Error("Error de conexión");
  const data = await res.json();
  if (!data.users?.length) throw new Error("Usuario no encontrado");
  const u = data.users[0];
  return { id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName, email: u.email, image: u.image };
}

export async function validateConnection() {
  const res = await fetch("https://fakestoreapi.com/products?limit=1");
  if (!res.ok) throw new Error("Error de conexión con el servidor");
}

export async function validateInventory(items) {
  // Simulated — FakeStore has no stock-check endpoint
  // Check if items have stock > 0 (from our normalized data)
  const outOfStock = items.filter((i) => i.stock === 0);
  if (outOfStock.length) throw new Error(`Sin stock: ${outOfStock[0].name}`);
}

export async function submitOrder(userId, items) {
  const res = await fetch("https://dummyjson.com/carts/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      products: items.map((i) => ({ id: i.id, quantity: i.quantity })),
    }),
  });
  if (!res.ok) throw new Error("Error al guardar el pedido");
  return res.json();
}

export async function savePurchase(order) {
  // Persist order info to localStorage for ticket display
  localStorage.setItem("dotaburgers-last-order", JSON.stringify(order));
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `normalizeProduct()`, `mapCategory()` | Pure function tests with known input/output |
| Unit | `cartReducer` — version mismatch, old-shape items | Extend existing reducer tests with CART_VERSION scenarios |
| Integration | `HomePage` fetch flow | Mock `global.fetch`, verify loading→success→render cycle |
| Integration | `LoginPage` username-only flow | Mock API response, verify no password field rendered |
| Integration | `CheckoutPage` real pipeline | Mock each API step, verify step progression and error states |
| E2E | Full app flow | Manual: splash → catalog → add → cart → login → checkout → ticket |

## Migration / Rollout

**Cart migration**: `CART_VERSION` constant in `CartContext.jsx`. `loadCart()` reads both the version and items. If version doesn't match `CART_VERSION` → clear cart. Existing users lose their cart once — acceptable for demo.

**No feature flags needed**. All changes are backward-incompatible by design (static data → API). Single deploy.

## PR Boundary Suggestion

400-line review budget → split into **3 chained PRs**:

| PR | Scope | Est. Lines | Dependencies |
|----|-------|-----------|--------------|
| **PR1** — Data layer + Splash | `api.js` (new), `SplashScreen.jsx` (new), `HomePage.jsx` (fetch), `products.js` (delete) | ~200 | None (foundation) |
| **PR2** — Cart & Catalog | `CartContext.jsx` (version + normalize), `ProductCard.jsx` (new fields), `CartItem.jsx` (minor) | ~150 | PR1 (needs normalized product shape) |
| **PR3** — Auth & Checkout | `AuthContext.jsx` (rewrite), `LoginPage.jsx` (remove password), `CheckoutPage.jsx` (real steps) | ~250 | PR2 (cart with normalized items for checkout) |

Each PR targets the feature branch, chains via `parent: <prev-branch>`. Each is independently reviewable — PR3's checkout logic doesn't depend on SplashScreen, just on the API service.

## Open Questions

- [ ] `validateConnection()` — is a `HEAD /products?limit=1` sufficient or should we use a health endpoint? (FakeStore has none)
- [ ] `validateInventory()` — FakeStore provides `rating.count` as stock but no real-time check. Acceptable for demo?
- [ ] SplashScreen animation — pure CSS `transition` (lightweight) or framer-motion (not in project)? Stick to CSS.
