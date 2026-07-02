# Design: Improve Codebase Quality & UX

## Technical Approach

Three independent PRs, each reversible. PR 1 adds test infra and unit tests (foundation). PR 2 fixes 4 known medium-severity bugs. PR 3 adds mobile hamburger navigation. Zero TypeScript, no new dependencies beyond vitest ecosystem.

---

## Architecture Decisions

### Decision: Vitest config — embedded vs separate file

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `vitest.config.js` | Cleaner separation, but another config file | ❌ Rejected |
| Embed in `vite.config.js` | Single config, follows existing Vite 8 setup | ✅ **Chosen** |

**Rationale**: Existing `vite.config.js` is 7 lines. Adding `defineConfig`'s `test` block keeps one source of truth. No need for a second config file.

### Decision: Test file organization

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `src/__tests__/` flat collection | Centralized, easy to find | ❌ Rejected |
| Co-located `__tests__/` dirs | Tests next to source, follows React conventions | ✅ **Chosen** |

**Rationale**: Co-location keeps `cartReducer.test.js` next to `CartContext.jsx`, `Header.test.jsx` next to `Header.jsx`. Developer sees tests when editing source. No path aliases needed.

### Decision: Combo dispatch strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `BULK_ADD` action | New action type, reducer change, more surface area | ❌ Rejected |
| Multiple `ADD_ITEM` dispatches | Simple, reuses existing reducer logic | ✅ **Chosen** |

**Rationale**: 3 sequential `dispatch({ type: "ADD_ITEM", product: ... })` calls cost nothing. No need to modify the reducer for a one-off feature.

### Decision: MobileDrawer — inline vs separate component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inline in Header.jsx | Saves file, but bloats 100+ line component | ❌ Rejected |
| `MobileDrawer.jsx` | Clean separation, testable in isolation | ✅ **Chosen** |

**Rationale**: Header is already 100+ lines with search, cart badge, user menu, and click-outside. Adding drawer state, animation, focus trapping, and ARIA would push it past 200. Separate component keeps SRP.

### Decision: Footer links — remove vs keep as spans

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Convert to `<span>` | No href, no navigation, purely decorative | ✅ **Chosen** |
| Point to valid routes | No pages exist for Privacy/Terms/Contact | ❌ Rejected |

**Rationale**: There are no pages for these links. `<span>` with matching styles preserves visual design without broken navigation.

---

## Data Flow

### PR 1 — Test wrappers

```
<MemoryRouter>
  <AuthProvider>
    <CartProvider>
      {component}    ← render(<Component />) inside providers
    </CartProvider>
  </AuthProvider>
</MemoryRouter>
```

### PR 2 — Auth flow change

```
LoginPage                      AuthContext
  username + password  ──→  POST /auth/login
                            body: { username, password }
                            ← response { accessToken, ...user }
                            → setUser(response)
                            → localStorage.setItem("dotaburgers-user")
```

### PR 3 — MobileDrawer state

```
Header                         MobileDrawer
  hamburger click ──→ isOpen=true ──→ drawer slides in
  link click      ──→ isOpen=false──→ drawer slides out
  Escape key      ──→ isOpen=false──→ drawer slides out
  outside click   ──→ isOpen=false──→ drawer slides out
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` |
| `vite.config.js` | Modify | Add `test` block with jsdom environment |
| `src/context/__tests__/cartReducer.test.js` | Create | 8 scenarios: ADD_ITEM (new, existing, 99 cap), REMOVE_ITEM, INCREMENT (99 cap, missing id), DECREMENT (remove at 0), CLEAR |
| `src/context/__tests__/AuthContext.test.jsx` | Create | 4 scenarios: login success, login failure, logout, localStorage restore |
| `src/components/__tests__/Header.test.jsx` | Create | 3 scenarios: renders logo, shows cart badge, shows user menu |
| `src/components/__tests__/ProductCard.test.jsx` | Create | 2 scenarios: renders product info, dispatches ADD_ITEM on click |
| `src/components/__tests__/CartItem.test.jsx` | Create | 2 scenarios: renders qty controls, dispatches correct actions |
| `src/components/__tests__/CartSummary.test.jsx` | Create | 2 scenarios: shows pricing, shows discount over 500 |
| `src/pages/__tests__/HomePage.test.jsx` | Create | 4 scenarios: category filter, search, sort, empty state |
| `src/test-setup.js` | Create | Config for `@testing-library/jest-dom` matchers, localStorage mock |
| `src/context/CartContext.jsx` | Modify | ADD_ITEM case: add `>= 99` guard before increment |
| `src/context/AuthContext.jsx` | Modify | Replace `GET /users/filter` with `POST /auth/login`; add password param |
| `src/pages/LoginPage.jsx` | Modify | Add password input field; update `handleSubmit` to pass password |
| `src/pages/HomePage.jsx` | Modify | Combo button dispatches ADD_ITEM for ids 1,5,6; smoothie button for smoothie product |
| `src/data/products.js` | Modify | Add smoothie product entry (id: 9) |
| `src/components/Footer.jsx` | Modify | Replace `<a href="#">` with `<span>` elements |
| `src/components/Header.jsx` | Modify | Add hamburger button (mobile) + render `MobileDrawer` |
| `src/components/MobileDrawer.jsx` | Create | Slide-in drawer with nav links, click-outside, Escape, focus trap, ARIA |
| `src/index.css` | Modify | Add slide-in/out keyframe animations for drawer |

---

## Interfaces / Contracts

### DummyJSON auth endpoint (PR 2)

```
POST https://dummyjson.com/auth/login
Content-Type: application/json

{ "username": "emilys", "password": "emilyspass" }

→ 200 { id, username, email, firstName, lastName, image, accessToken }
→ 400 { message: "Invalid credentials" }
```

### MobileDrawer props (PR 3)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls slide-in/out |
| `onClose` | function | Yes | Called on link click / outside / Escape |
| `user` | object\|null | Yes | For Login/Logout link logic |

---

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | cartReducer (pure function) | No wrappers, direct assertions on reducer output. 8 test cases |
| Integration | AuthContext (async login) | Mock `global.fetch` via `vi.fn()`. Assert state + localStorage |
| Integration | Header, ProductCard, CartItem, CartSummary | Provider wrappers (MemoryRouter + AuthProvider + CartProvider), RTL `render` + `fireEvent` |
| Integration | HomePage (filter pipeline) | Mock product data, assert rendered grid/empty state per filter combination |
| Render | MobileDrawer | RTL render, assert ARIA attributes, test outside click via `fireEvent` on document |

---

## Migration / Rollout

No migration required. Each PR is independently reversible via `git revert`.

---

## Open Questions

None. All design decisions mapped to specs and codebase patterns.
