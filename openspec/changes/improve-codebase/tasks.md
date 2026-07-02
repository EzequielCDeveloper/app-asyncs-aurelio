# Tasks: Improve Codebase Quality & UX

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950 (350 + 350 + 250) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (tests) → PR 2 (bugs) → PR 3 (mobile) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

### Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| 1 | Testing infra + 6 test files | PR 1 | base: main |
| 2 | Bug fixes (cart, auth, combo, footer) | PR 2 | base: main |
| 3 | MobileDrawer + hamburger | PR 3 | base: main |

## PR 1 — Test Infrastructure + Tests (~350 lines)

### 1.1 Test setup
- [x] 1.1.1 Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` to `package.json`
- [x] 1.1.2 Add `test: { environment: "jsdom", globals: true }` to `vite.config.js`
- [x] 1.1.3 Create `src/test/setup.js` (jest-dom imports, localStorage mock via vi.stubGlobal)
- [x] 1.1.4 Add `"test": "vitest run"`, `"test:watch": "vitest"` to package.json scripts

### 1.2 Tests
- [x] 1.2.1 `src/context/__tests__/cartReducer.test.js` — ADD_ITEM (new, existing, 99 cap), REMOVE_ITEM (exists, missing), INCREMENT/DECREMENT/CLEAR edge cases
- [x] 1.2.2 `src/context/__tests__/AuthContext.test.jsx` — login success (state + localStorage), login failure (throws), logout, localStorage restore
- [x] 1.2.3 `src/components/__tests__/Header.test.jsx` — logo/cart renders, badge, user menu, search prop
- [x] 1.2.4 `src/components/__tests__/ProductCard.test.jsx` — product info renders, ADD_ITEM on click
- [x] 1.2.5 `src/components/__tests__/CartItem.test.jsx` — renders item, INCREMENT/DECREMENT/REMOVE dispatches
- [x] 1.2.6 `src/components/__tests__/CartSummary.test.jsx` — pricing, discount conditional, auth-gated checkout
- [x] 1.2.7 `src/pages/__tests__/HomePage.test.jsx` — category filter, search, sort, empty state

## PR 2 — Bug Fixes (~350 lines)

- [x] 2.1 `CartContext.jsx` ADD_ITEM: add `if (existing.quantity >= 99) return state` before increment
- [x] 2.2 `AuthContext.jsx`: replace GET filter with `POST /auth/login {username, password}`; return user from response
- [x] 2.3 `LoginPage.jsx`: add password input; pass `{username, password}` to login; remove broken "Olvidaste" link
- [x] 2.4 `src/data/products.js`: add smoothie entry (id: 9, Drinks, $4.99)
- [x] 2.5 `HomePage.jsx`: combo button dispatches ADD_ITEM for ids 1,5,6; smoothie button for id 9
- [x] 2.6 `Footer.jsx`: replace 4 `<a href="#">` with `<span>` elements

## PR 3 — Mobile Hamburger (~250 lines)

- [x] 3.1 Create `src/components/MobileDrawer.jsx` — slide-in drawer, nav links, ARIA, click-outside + Escape close, focus trap
- [x] 3.2 `Header.jsx`: add hamburger button (hidden md+); render MobileDrawer with isOpen/onClose state
- [x] 3.3 `src/index.css`: add slide-in/slide-out keyframe animations for drawer
