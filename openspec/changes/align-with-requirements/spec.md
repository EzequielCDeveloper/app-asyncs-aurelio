# Spec: align-with-requirements

## Capabilities

### 1. Product Catalog — API-Driven Fetch

#### Purpose
Replace hardcoded `src/data/products.js` with real-time fetch from FakeStore API. Show loading state during fetch, error screen on failure, SplashScreen on initial app load.

#### Requirements

##### R1: SplashScreen on App Init
The system MUST display a SplashScreen for 2 seconds on first app load before beginning the product fetch.

- **Scenario**: Happy path
  - GIVEN the user opens the app for the first time
  - WHEN the app loads
  - THEN a SplashScreen with the app logo appears for 2 seconds
  - AND after 2 seconds, the system begins fetching products from the API

##### R2: API Product Fetch
The system MUST fetch products from `https://fakestoreapi.com/products` on mount and SHOW a loading spinner while fetching.

- **Scenario**: Loading state
  - GIVEN the HomePage mounts
  - WHEN products are being fetched from the API
  - THEN a loading spinner is displayed
  - AND no product grid appears until data arrives

##### R3: Error State with Retry
If the API fetch fails, the system MUST display an error message with a "Reintentar" (Retry) button.

- **Scenario**: API failure
  - GIVEN the FakeStore API is unreachable or returns an error
  - WHEN the fetch fails
  - THEN an error screen is shown with a descriptive message and a retry button
  - AND clicking retry re-invokes the fetch

- **Scenario**: Empty response
  - GIVEN the API returns an empty product array
  - WHEN the fetch succeeds
  - THEN a "No se encontraron productos" empty state is displayed
  - AND no product grid renders

##### R4: Category Filter from API Data
The system MUST compute available categories from fetched products (mapped via the food label table) rather than from a hardcoded list.

- **Scenario**: Dynamic categories
  - GIVEN products are fetched from the API
  - WHEN the category filter renders
  - THEN the filter buttons show only categories present in the mapped product data
  - AND "Todas" (All) remains the first/default option

##### R5: Remove Hardcoded Product Data
The file `src/data/products.js` MUST be deleted. No hardcoded product array SHALL remain in the codebase.

- **Scenario**: Verify removal
  - GIVEN the codebase after implementation
  - WHEN searching for `import.*products.*from.*data/products`
  - THEN no imports reference `src/data/products.js`
  - AND static product data is absent from all modules

### 2. User Session — Username-Only Lookup

#### Purpose
Replace POST-based login with a simple username lookup via DummyJSON GET `/users`. Remove password field entirely.

#### Requirements

##### R6: Username-Only Login
The system MUST accept only a username (no password) and look up the user by searching `https://dummyjson.com/users`.

- **Scenario**: Successful login
  - GIVEN the user enters a valid username (e.g. "emilys")
  - WHEN the form is submitted
  - THEN the system fetches all users from `https://dummyjson.com/users`
  - AND finds a matching user by `username` field
  - AND saves the user session (id, username, firstName, lastName, email, image) to AuthContext and localStorage
  - AND redirects to `/checkout`

- **Scenario**: Username not found
  - GIVEN the user enters a non-existent username
  - WHEN the form is submitted
  - THEN the system shows an error "Usuario no encontrado"
  - AND the login form remains with the username field populated

- **Scenario**: Empty username
  - GIVEN the user submits with an empty username field
  - WHEN the form is submitted
  - THEN nothing happens (the form is not submitted)

##### R7: Remove Password Field
The login form MUST remove the password input, the show/hide password toggle, and the password-related validation.

- **Scenario**: Simplified form
  - GIVEN the LoginPage renders
  - WHEN inspecting the DOM
  - THEN no password input field exists
  - AND no password-related aria labels or buttons exist

##### R8: All async operations MUST use async/await
Every API call across all modules SHALL use `async/await` syntax. No `.then()` chains SHALL exist in API-calling code.

##### R9: All API calls MUST handle errors
Every fetch call SHALL be wrapped in try/catch. Network errors, non-ok responses, and JSON parse failures SHALL produce user-facing error messages.

### 3. Checkout Flow — Real Async Pipeline

#### Purpose
Replace `setTimeout` simulation with 6 real async steps: connection check, inventory validation, total calculation, order submission, purchase persist, ticket display.

#### Requirements

##### R10: Six-Step Checkout Pipeline
The checkout SHALL execute these steps sequentially:

| Step | Action | Description |
|------|--------|-------------|
| 1 | Validate connection | Fetch `https://dummyjson.com` to verify network |
| 2 | Validate inventory | Check `stock` (rating.count) against cart quantities |
| 3 | Calculate total | Reuse CartContext `total` value |
| 4 | Submit order | POST `https://dummyjson.com/carts/add` with `{userId, products: [{id, quantity}]}` |
| 5 | Save purchase | Persist order record to localStorage |
| 6 | Show Ticket | Display TicketModal with order details |

- **Scenario**: Full checkout success
  - GIVEN the user is logged in with items in cart
  - WHEN clicking "Finalizar Compra"
  - THEN the 6 steps execute in order
  - AND each step shows its own progress indicator
  - AND on step 6 the TicketModal opens with order data

##### R11: Step Failure with Retry
If any step fails, the system MUST stop the pipeline, show the error, and provide a "Reintentar" button that restarts from step 1.

- **Scenario**: Connection step fails
  - GIVEN the network is unreachable
  - WHEN checkout starts
  - THEN step 1 fails with a connection error
  - AND the error message and retry button appear

- **Scenario**: Stock validation fails
  - GIVEN a cart item's quantity exceeds the product's `stock` (`rating.count`)
  - WHEN inventory validation runs
  - THEN an error is shown indicating which item exceeds stock
  - AND the user can retry

- **Scenario**: Order submission fails
  - GIVEN the DummyJSON carts/add endpoint returns an error
  - WHEN step 4 executes
  - THEN a submission error is shown with retry option

##### R12: Cart Order Submitted to DummyJSON
The POST request to `/carts/add` MUST include `userId` (from logged-in user) and `products` array with `{id, quantity}`.

- **Scenario**: POST body shape
  - GIVEN checkout reaches step 4
  - WHEN submitting the order
  - THEN the request body is `{userId: <number>, products: [{id: <productId>, quantity: <qty>}]}`
  - AND the response confirms the cart creation

##### R13: Redirect Guards
The checkout page MUST redirect if preconditions are not met.

- **Scenario**: Cart is empty
  - GIVEN the user navigates to `/checkout` with an empty cart
  - WHEN the page loads
  - THEN the user is redirected to `/`

- **Scenario**: User is not logged in
  - GIVEN the user navigates to `/checkout` without a session
  - WHEN the page loads
  - THEN the user is redirected to `/login`

### 4. Cart — API Shape Normalization and Storage Migration

#### Requirements

##### R14: Normalize at API Boundary
Products fetched from FakeStore SHALL be normalized to the internal shape at the fetch boundary (in `src/services/api.js`):

| FakeStore Field | Internal Field | Transform |
|---|---|---|
| `id` | `id` | Direct |
| `title` | `name` | Rename |
| `price` | `price` | Direct |
| `description` | `description` | Direct |
| `category` | `category` | Map via food label table |
| `image` | `image` | Direct |
| `rating.rate` | `rating` | Extract nested |
| `rating.count` | `stock` | Extract nested |
| — | `alt` | Set to `title` value |
| — | `badge` | Set to `null` |

##### R15: CART_VERSION Migration
The system MUST define a `CART_VERSION` constant. On first API data load, if the stored cart's version does not match, the cart SHALL be cleared.

- **Scenario**: Version mismatch
  - GIVEN localStorage contains a cart from a previous version
  - WHEN the app loads and fetches API products
  - THEN the stored cart is cleared
  - AND the new empty cart with the current version is saved

- **Scenario**: Version matches
  - GIVEN localStorage contains a cart with matching CART_VERSION
  - WHEN the app loads
  - THEN the cart is preserved as-is

##### R16: Cart Survives Page Refresh
The cart SHALL persist to localStorage on every state change and hydrate on load.

### 5. Field Mapping Specification

#### FakeStore → Internal Product Shape

| Source | Target | Rule |
|---|---|---|
| `id` | `id` | Direct copy |
| `title` | `name` | Rename field |
| `price` | `price` | Direct copy |
| `description` | `description` | Direct copy |
| `category` | `category` | Map via table: electronics→Burgers, jewelery→Sides, men's clothing→Drinks, women's clothing→Desserts |
| `image` | `image` | Direct copy |
| `rating.rate` | `rating` | Extract from nested object |
| `rating.count` | `stock` | Extract from nested object |
| — | `alt` | Generated from `title` (the FakeStore product title) |
| — | `badge` | Always `null` — no badge data from API |

#### Category Mapping Table

| FakeStore Category | Food Label |
|---|---|
| `electronics` | Burgers |
| `jewelery` | Sides |
| `men's clothing` | Drinks |
| `women's clothing` | Desserts |
| (any unmapped) | Preserve original value (fallback) |

### 6. API Contracts

#### GET `https://fakestoreapi.com/products`

- **Response**: Array of product objects
- **Shape per item**:
  ```json
  {
    "id": 1,
    "title": "Fjallraven - Foldsack No. 1 Backpack",
    "price": 109.95,
    "description": "Your perfect pack...",
    "category": "men's clothing",
    "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    "rating": {
      "rate": 3.9,
      "count": 120
    }
  }
  ```
- **Error**: Returns non-2xx status on failure

#### GET `https://dummyjson.com/users`

- **Response**: Object with `users` array and pagination metadata
- **Shape**:
  ```json
  {
    "users": [
      {
        "id": 1,
        "firstName": "Emily",
        "lastName": "Johnson",
        "username": "emilys",
        "email": "emily.johnson@x.dummyjson.com",
        "image": "https://dummyjson.com/icon/emilys/128"
      }
    ],
    "total": 208,
    "limit": 30
  }
  ```
- **Usage**: Fetch all users, then `.find(u => u.username === input)` client-side

#### POST `https://dummyjson.com/carts/add`

- **Headers**: `Content-Type: application/json`
- **Request body**:
  ```json
  {
    "userId": 1,
    "products": [
      { "id": 144, "quantity": 4 },
      { "id": 98, "quantity": 1 }
    ]
  }
  ```
- **Response**: Simulated cart creation with a new `id`, calculated totals

### 7. Data Flow

#### App Init Flow
```
User opens app
  → SplashScreen renders (2s)
  → After 2s: fetch("https://fakestoreapi.com/products")
  → [Loading]: spinner displayed
  → [Success]: normalize products, set in state, render catalog
  → [Error]: error screen with retry button
  → Cart: check CART_VERSION, clear if mismatch
```

#### Login Flow
```
User types username
  → Clicks "Ingresar"
  → fetch("https://dummyjson.com/users")
  → [Loading]: spinner on button
  → [Success]: .find(u => u.username === input)
    → Found: save to AuthContext + localStorage, redirect to /checkout
    → Not found: show "Usuario no encontrado"
  → [Error]: show error message
```

#### Checkout Flow
```
User clicks "Finalizar Compra"
  → Step 1: fetch("https://dummyjson.com") — validate connectivity
  → Step 2: for each cart item, compare quantity vs product.stock (rating.count)
  → Step 3: read total from CartContext (already calculated)
  → Step 4: POST("https://dummyjson.com/carts/add", {userId, products})
  → Step 5: save order to localStorage (dotaburgers-orders)
  → Step 6: show TicketModal
  → [Any failure]: stop, show error + retry button
```

### 8. Non-Functional Requirements

- **NFR1**: All async operations MUST use `async/await`. No `.then()` chains.
- **NFR2**: Every API call MUST include try/catch error handling with user-facing messages.
- **NFR3**: The UI SHALL NEVER show a blank/loading state without an explicit visual indicator (spinner, skeleton, or message).
- **NFR4**: The cart MUST survive page refresh via localStorage persistence.
- **NFR5**: The SplashScreen SHALL display for exactly 2 seconds regardless of API response time.
- **NFR6**: The file `src/data/products.js` MUST be deleted.
