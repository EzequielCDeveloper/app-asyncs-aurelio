# Delta for Cart and Auth

## ADDED Requirements

### Requirement: SPEC-FIX-01 — ADD_ITEM respects 99 cap

The ADD_ITEM reducer MUST return state unchanged when an existing item's quantity is already >= 99. Previously: it would increment past 99.

#### Scenario: Existing item at cap

- GIVEN cart has item `{id:1, quantity:99}`
- WHEN dispatching ADD_ITEM with product id 1
- THEN state is unchanged

### Requirement: SPEC-FIX-02 — Combo buttons dispatch multiple items

The "Add $14.99" button for The Carry Combo MUST dispatch ADD_ITEM for Classic Mid Burger (id:1), Radiant Fries (id:5), and Dire Chocolate Shake (id:6). The "Add $4.99" button for Mango Tango Smoothie MUST add the smoothie product to the cart.

#### Scenario: Combo adds 3 items to empty cart

- GIVEN cart is empty
- WHEN user clicks "Add $14.99" on The Carry Combo
- THEN 3 ADD_ITEM actions are dispatched for products 1, 5, and 6
- AND cart contains all 3 items with quantity 1 each

#### Scenario: Smoothie adds to cart

- GIVEN cart is empty
- WHEN user clicks "Add $4.99" on Mango Tango Smoothie
- THEN an ADD_ITEM action is dispatched with the smoothie product
- AND cart contains the smoothie

### Requirement: SPEC-FIX-03 — Login requires username and password

The login flow MUST use `POST https://dummyjson.com/auth/login` with JSON body `{username, password}`. The LoginPage MUST include a password input. Error handling MUST cover invalid credentials and network errors.

#### Scenario: Login with valid credentials

- GIVEN LoginPage is displayed
- WHEN user enters valid username and password and submits
- THEN POST request is sent to DummyJSON auth endpoint
- AND user state is set from response (accessToken, user data)
- AND navigation proceeds to /checkout

#### Scenario: Login with invalid credentials

- GIVEN LoginPage is displayed
- WHEN user enters invalid username or password and submits
- THEN error message is displayed
- AND user state remains null
- AND input shakes on error

### Requirement: SPEC-FIX-04 — Footer links are functional

Footer navigation links MUST NOT have `href="#"`. Links SHALL either point to valid routes or be replaced with decorative `<span>` elements.

#### Scenario: Footer links exist

- GIVEN Footer is rendered
- WHEN inspecting footer nav
- THEN no `<a>` element has `href="#"`
- AND links point to valid paths (or are `<span>` elements)
