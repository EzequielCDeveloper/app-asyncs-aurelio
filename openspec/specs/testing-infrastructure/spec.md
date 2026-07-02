# Testing Infrastructure Specification

## Purpose

Define the test framework, runner configuration, and behavioral tests for cart reducer, auth context, and UI components. Zero coverage today — all requirements are new additions.

## Requirements

### Requirement: SPEC-TEST-01 — Test Infrastructure Setup

The project MUST include Vitest + React Testing Library + jsdom as devDependencies. A `test` script MUST run `vitest run` and a `test:watch` script MUST run `vitest`.

#### Scenario: Test config present

- GIVEN the project root
- WHEN running `bun run test`
- THEN vitest loads `vitest.config.js` (or embedded in `vite.config.js`) with jsdom environment
- AND tests execute without parsing errors

### Requirement: SPEC-TEST-02 — cartReducer Tests

The cartReducer MUST be tested for all 5 actions: ADD_ITEM, REMOVE_ITEM, INCREMENT, DECREMENT, CLEAR — including edge cases (99 cap, decrement to 0, missing id).

#### Scenario: ADD_ITEM adds new item

- GIVEN an empty cart state
- WHEN dispatching ADD_ITEM with product `{id:1, name:"Burger", price:10}`
- THEN state has 1 item with quantity 1

#### Scenario: ADD_ITEM increments existing

- GIVEN cart has item `{id:1, quantity:1}`
- WHEN dispatching ADD_ITEM with same product id
- THEN item quantity is 2

#### Scenario: ADD_ITEM respects 99 cap

- GIVEN cart has item `{id:1, quantity:99}`
- WHEN dispatching ADD_ITEM with same product id
- THEN state is unchanged (quantity stays 99)

#### Scenario: REMOVE_ITEM removes by id

- GIVEN cart has 2 items
- WHEN dispatching REMOVE_ITEM with one id
- THEN only the non-matching item remains

#### Scenario: DECREMENT reduces and removes at 0

- GIVEN cart has item `{id:1, quantity:1}`
- WHEN dispatching DECREMENT with id 1
- THEN item is removed from state

#### Scenario: INCREMENT no-ops at 99

- GIVEN cart has item `{id:1, quantity:99}`
- WHEN dispatching INCREMENT with id 1
- THEN quantity stays 99

#### Scenario: INCREMENT no-ops for missing id

- GIVEN cart has items
- WHEN dispatching INCREMENT with non-existent id
- THEN state is unchanged

#### Scenario: CLEAR returns empty

- GIVEN cart has 3 items
- WHEN dispatching CLEAR
- THEN state is an empty array

### Requirement: SPEC-TEST-03 — AuthContext Tests

The AuthProvider MUST handle login success, login failure, logout, and localStorage restoration on mount.

#### Scenario: Login success stores user

- GIVEN user is not logged in
- WHEN login succeeds with valid credentials
- THEN user state contains id, username, firstName, email, image
- AND localStorage has "dotaburgers-user"

#### Scenario: Login failure throws error

- GIVEN user is not logged in
- WHEN login fails (network error / invalid credentials)
- THEN an error is thrown
- AND user state remains null

#### Scenario: Logout clears state

- GIVEN user is logged in
- WHEN logout is called
- THEN user state becomes null
- AND localStorage "dotaburgers-user" is removed

#### Scenario: Restores from localStorage

- GIVEN localStorage has "dotaburgers-user" with valid JSON
- WHEN AuthProvider mounts
- THEN user state is populated from stored data

### Requirement: SPEC-TEST-04 — Component Tests

UI components MUST render correctly and respond to user interactions.

#### Scenario: Header renders logo and cart

- GIVEN user is not logged in with empty cart
- WHEN rendering Header
- THEN logo "DotaBURGUERS" is visible
- AND cart icon is visible without badge

#### Scenario: Header shows cart badge

- GIVEN cart has 3 items
- WHEN rendering Header
- THEN badge shows "3"

#### Scenario: Header shows user menu when logged in

- GIVEN user is logged in
- WHEN rendering Header
- THEN user avatar is visible

#### Scenario: ProductCard renders and dispatches

- GIVEN a product with name, price, badge
- WHEN rendering ProductCard
- THEN name, price, and badge are visible
- AND clicking add button dispatches ADD_ITEM

#### Scenario: CartItem controls work

- GIVEN a cart item with quantity 2
- WHEN rendering CartItem
- THEN quantity display shows 2
- AND increment/decrement/delete buttons dispatch correct actions

#### Scenario: CartSummary shows pricing

- GIVEN cart with items totaling $30
- WHEN rendering CartSummary
- THEN subtotal, IVA, and total are displayed
- AND discount section is absent (subtotal < 500)

#### Scenario: CartSummary shows discount over 500

- GIVEN cart subtotal > 500
- WHEN rendering CartSummary
- THEN discount line is visible with 10% discount
