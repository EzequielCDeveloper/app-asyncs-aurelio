# Exploration: formalize-documentation

> **Change**: formalize-documentation
> **Date**: 2026-06-28
> **Status**: Complete

## Current State

The project has **zero internal documentation**. The only docs present are:

- `README.md` — Auto-generated Vite template boilerplate (unrelated to the project)
- `.atl/skill-registry.md` — AI skill registry (tooling, not project docs)

The codebase is a fully functional React 19 + Vite 8 + Tailwind v4 + React Router v7 app with 4 pages, 7 components, 2 contexts, a full design system in `index.css`, and simulated business logic. Despite working code, there's no documentation of:

- Architecture or design decisions
- Component prop APIs
- Data flow and state management
- Design system tokens and usage
- Business rules and pricing logic
- Conventions and patterns

The app is small (~1200 lines of code) but rich enough in patterns to benefit significantly from formal docs.

## Affected Areas

| What | Why |
|------|-----|
| `src/index.css` | Contains the full design system in `@theme` — must be extracted into `docs/mockup/*` |
| All 7 components | Each has props, behavior, and edge cases that need API docs |
| `src/context/CartContext.jsx` | Core data flow: reducer actions, persistence, computed values |
| `src/context/AuthContext.jsx` | Login flow, API integration, localStorage persistence |
| `src/App.jsx` | Route table, provider hierarchy, layout structure |
| `src/data/products.js` | Product schema, categories, image model |
| `src/pages/HomePage.jsx` | Complex state: search, filter, sort, recommendations |
| `src/pages/CheckoutPage.jsx` | Step machine, error simulation, order model |
| `package.json` | Stack versions for dependencies documentation |
| `vite.config.js` | Build tool configuration docs |
| `index.html` | Meta tags, fonts, icon setup docs |

## Proposed /docs/ Directory Tree

```
docs/
├── README.md                          ← Entry point: project overview, stack, getting started
├── ARCHITECTURE.md                    ← High-level architecture decisions and rationale
├── ROUTING.md                         ← Route table, guards, navigation patterns
├── DATA-FLOW.md                       ← Cart, Auth, localStorage, API interactions
├── BUSINESS-RULES.md                  ← Pricing, discounts, IVA, max qty, checkout logic
├── COMPONENTS.md                      ← Component API reference (props, behavior, edge cases)
├── CONVENTIONS.md                     ← Naming, file organization, state management patterns
├── ISSUES.md                          ← Known issues, typos, technical debt
│
└── mockup/
    ├── README.md                      ← Design system overview, brand identity
    ├── COLORS.md                      ← Color palettes, surfaces, semantic colors
    ├── TYPOGRAPHY.md                  ← Font stack, scale, usage guidelines
    ├── SPACING.md                     ← Layout grid, container, gutter, stack tokens
    ├── COMPONENT-PATTERNS.md          ← Card, button, input, modal, stepper patterns
    ├── ANIMATIONS.md                  ← Transition tokens, keyframes, interaction design
    └── ICONOGRAPHY.md                 ← Material Symbols setup, SVG icon sprite usage
```

**Total: 15 documents** (8 in `/docs/`, 7 in `/docs/mockup/`)

## Document Descriptions

### /docs/ — Developer Documentation

#### README.md
Landing page for docs. Stack (React 19 + Vite 8 + Tailwind v4 + React Router v7 + Bun), quick start (`bun dev`), project purpose ("Dota 2 themed burger ordering app"), link to each doc.

#### ARCHITECTURE.md
Decisions that shaped the codebase:
- Why Context + useReducer over external state (Redux/Zustand)
- Why client-side simulated checkout (no backend)
- Why DummyJSON for auth (demo-only, no password)
- Why Tailwind v4 @theme over CSS Modules
- Why no TypeScript (current scope)
- Provider hierarchy (BrowserRouter > AuthProvider > CartProvider)

#### ROUTING.md
Full route table:
- `/` → HomePage (public)
- `/carrito` → CartPage (public)
- `/login` → LoginPage (public)
- `/checkout` → CheckoutPage (protected: requires auth + cart items)
- `*` → redirect `/`
- Navigation patterns: `useNavigate`, `Link`, protected redirects in useEffect

#### DATA-FLOW.md
Two data flow diagrams:
- **Cart**: dispatch → cartReducer → state update → useEffect → localStorage.setItem | initial: loadCart() from localStorage
- **Auth**: login(username) → fetch DummyJSON → setUser + localStorage.setItem | initial: load from localStorage
- Key: localStorage keys (`dotaburgers-cart`, `dotaburgers-user`), serialization, error handling

#### BUSINESS-RULES.md
All pricing math:
- `subtotal = Σ(price * quantity)`
- `discount = subtotal > 500 ? subtotal * 0.1 : 0`
- `iva = (subtotal - discount) * 0.16`
- `total = subtotal - discount + iva`
- Max quantity: 99 (INCREMENT caps, DECREMENT filters at 0)
- Checkout: 6-step simulation with 800-1400ms delays per step, 5% error on step 4

#### COMPONENTS.md
API reference for all 7 components:

| Component | Props | Behavior |
|-----------|-------|----------|
| `Header` | `showSearch` (bool), `searchTerm` (string), `onSearchChange` (fn) | Sticky nav, cart badge (caps at 99+), user menu dropdown with click-outside |
| `Footer` | (none) | Static links: privacy, terms, contact, support |
| `ProductCard` | `product` (object: id, name, description, price, category, badge, image, alt) | Add to cart, hover zoom, badge display, aria-labels |
| `CartItem` | `item` (object: id, name, image, price, quantity, description, alt) | +/-/delete controls, responsive layout, max qty 99 |
| `CartSummary` | (none) | Computed from context subtotal/iva/discount/total, auth-gated checkout redirect |
| `CheckoutProgress` | `currentStep` (number 0-6) | 6-step stepper with progress line, completed/active/pending visual states |
| `TicketModal` | `order` (object: id, date), `onClose` (fn) | Receipt-style modal, Escape key, CLEAR cart on close, items display |

#### CONVENTIONS.md
Patterns observed:
- **Naming**: PascalCase components, camelCase files, `{Component}.jsx` convention
- **File organization**: `/components/`, `/context/`, `/data/`, `/pages/` separation
- **State**: Context + useReducer for complex state (cart), Context + useState for simple (auth)
- **CSS**: Tailwind utility classes only, all custom tokens in `@theme`, no CSS modules
- **Exports**: `export default function Component` pattern
- **Error handling**: try/catch with fallback, null guards, `|| []` fallback in loadCart
- **Accessibility**: sr-only labels, aria-labels on icon buttons, role="dialog" on modal

#### ISSUES.md
Known issues from analysis:
- **Typo**: "Cerrer" → "Cerrar" in TicketModal.jsx line 118
- **Security**: Login has no password field — DummyJSON API returns user by username alone
- **Missing TypeScript**: No type safety, no interfaces for product/auth/cart types
- **No tests**: Zero test files, no testing framework configured
- **No env vars**: DummyJSON API URL hardcoded, no `.env` setup
- **Long image URLs**: Google AIDA CDN URLs are extremely long (500+ chars each)
- **Cart deduplication**: Works via id check, but product spread into cart item includes all product fields
- **Checkout order model**: Order ID generated client-side (`DB-{timestamp}-{random}`), no real persistence
- **Recommendations section**: "Complete Your Build" buttons are decorative — no add-to-cart action implemented

### /docs/mockup/ — Design Documentation

#### README.md
Design system overview:
- Brand story: Dota 2 x gourmet burger, Material 3 aesthetic
- Design principles: dark accents, red/yellow brand energy, clean surfaces
- Font: Hanken Grotesk (Google Fonts)
- Icons: Material Symbols (Outline)
- Inspiration: M3 design system adapted for fast-food context

#### COLORS.md
Full color documentation:
- **Brand**: cream #fbf8f3 (bg), red #b90e0a (primary), yellow #f1b80c (secondary), dark #1a1a1a
- **Surface palette**: 9 levels from `surface-container-lowest` to `surface-container-highest`
- **Primary palette**: 8 variations from `primary` (#8f0002) to `on-primary-fixed`
- **Secondary palette**: 8 variations from `secondary` (#785a00) to `on-secondary-fixed`
- **Tertiary palette**: 8 variations from `tertiary` (#003aa6) to `on-tertiary-fixed`
- **Semantic**: `error` (#dc2626), `success` (#16a34a), `background` (#fcf9f8)
- **Other**: `border-subtle` (#e5e1da), `outline`, `outline-variant`, `surface-tint`

#### TYPOGRAPHY.md
Font system:
- Family: `"Hanken Grotesk", sans-serif` (all tokens)
- Scale: 9 tokens — headline-2xl (48px) to label-bold (14px)
- Weight classes: extrabold (200), black (900), medium (500), bold (700), normal (400)

#### SPACING.md
Layout system:
- Container max: 1280px
- Gutters: 1rem mobile, 2rem desktop
- Stack: sm=0.5rem, md=1rem, lg=2rem
- Border radius: 2xl=1rem, xl=0.75rem, lg=0.5rem
- Grid patterns: 4-col desktop, 2-col tablet, 1-col mobile
- Responsive breakpoints: Tailwind defaults (sm:640px, md:768px, lg:1024px)

#### COMPONENT-PATTERNS.md
Visual component documentation:
- **Cards**: white surface, 2xl radius, shadow-sm, hover shadow-md + translateY(-4px)
- **Buttons**: primary (bg-primary), rounded-2xl, focus ring pattern
- **Inputs**: border-border-subtle, rounded-2xl, focus ring-primary, error state
- **Modal**: full overlay backdrop-blur, max-w-md centered, receipt-style
- **Stepper**: horizontal 6-step, primary track line, checkmark icons
- **Badge**: secondary-container bg, rounded-lg, absolute top-left
- **Empty states**: centered, large icon, title, description, CTA
- **Quantity control**: pill-shaped group with +/- buttons

#### ANIMATIONS.md
Motion design:
- `fadeIn`: 0.3s ease-out, translateY(8px) → translateY(0)
- `shimmer`: skeleton loading, 1.5s infinite
- `shake`: login error, 400ms ease-in-out (Web Animations API)
- Hover transitions: 300ms, scale transforms, shadow transitions
- Stepper progress: 500ms ease-in-out width transition

#### ICONOGRAPHY.md
Icon system:
- Primary: Material Symbols (Google Fonts) — outline style, variable font
- Usage: `<span class="material-symbols-outlined">{name}</span>`
- Fill variant: `.material-symbols-outlined.fill`
- Icons used: shopping_cart, search, add, remove, delete, arrow_forward, lock, loyalty, check, expand_more, error, person, account_circle, etc.
- Secondary: SVG sprite in `public/icons.svg` — bluesky, discord, github, x — currently **unused in the app**

## Key Design Decisions

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| Context + useReducer for cart | Simple, no external deps, localStorage sync via useEffect | No optimistic updates, re-renders all consumers |
| DummyJSON auth with username only | Demo-friendly, no password management | Zero security, not production-ready |
| Client-side checkout simulation | No backend needed for demo | No real orders, fake order IDs |
| Tailwind v4 @theme approach | Built-in design token system, no CSS-in-JS | Locked to Tailwind, harder to share tokens |
| No TypeScript | Faster prototyping | No type safety on product/cart/auth shapes |
| Flat file structure | Simple project, easy to navigate | Doesn't scale beyond ~20 components |
| localStorage for persistence | Zero setup, works offline | 5MB limit, no sync, no expiration |

## Identified Patterns

1. **Container-Presentational Lite**: Pages are containers (state + layout), components are presentational. Blurred line — `CartSummary` has business logic.
2. **Hook-based Context Access**: Every context has a `useX()` hook with a guard pattern.
3. **Immutable Reducer Pattern**: Cart reducer returns new arrays/objects, no mutations.
4. **CSS-only Animations**: `fadeIn` via CSS keyframes, `shake` via Web Animations API.
5. **Responsive via Tailwind**: `md:` prefix for desktop, no custom breakpoints.
6. **Guard Pattern in useEffect**: CheckoutPage redirects if no items or no user.
7. **Aria-labels on Icon Buttons**: Every icon button has an accessible label (Spanish).
8. **Focus Ring Pattern**: `focus:ring-2 focus:ring-primary focus:ring-offset-2` on all interactive elements.

## Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| "Cerrer" typo (should be "Cerrar") | TicketModal.jsx:118 | Low |
| No password field on login | AuthContext.jsx, LoginPage.jsx | Medium |
| No TypeScript — implicit shapes everywhere | Every file | Medium |
| No tests anywhere | (all) | High |
| No .env / environment config | (root) | Medium |
| Combo/smoothie buttons are decorative | HomePage.jsx:158-160, 187-190 | Medium |
| Order ID generated client-side | CheckoutPage.jsx:59-61 | High (if real) |
| Footer links are all `href="#"` | Footer.jsx:8-19 | Low |

## Ready for Proposal

**Yes** — Complete analysis with proposed /docs/ structure (15 files), design system breakdown, issues catalog, and pattern documentation ready for the proposal phase.
