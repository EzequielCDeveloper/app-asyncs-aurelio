# Proposal: Improve Codebase Quality & UX

## Intent

Cerrar brechas críticas: cero cobertura de tests, 4 bugs de severidad media conocidos, y navegación mobile inexistente. Sin estos cambios el código no es testeable, tiene bugs funcionales, y la UX mobile está rota.

## Scope

### In Scope
- Infraestructura de tests + unit tests (reducer, context, componentes, páginas)
- Fix botones combo/smoothie, tope ADD_ITEM, login con password, footer links
- Menú hamburguesa mobile con drawer lateral

### Out of Scope
- E2E tests, migración TypeScript, CI/CD, integración con backend real

## Capabilities

### New Capabilities
- `testing-infrastructure`: Vitest + React Testing Library + jsdom
- `mobile-navigation`: Hamburguesa responsive con drawer slide-in

### Modified Capabilities
- None (no existing specs to modify — first change after init)

## Approach

### PR 1 — Tests (~350 lines)
Agregar vitest, @testing-library/react, jsdom a package.json + vite.config.js.
- cartReducer: testear 5 acciones + edge cases (99 cap, decrement a 0, item inexistente)
- AuthContext: login success/failure, logout, localStorage persistence
- Componentes: Header (cart badge, user menu), ProductCard (add to cart), CartSummary (pricing, auth gate), CartItem (quantity controls)
- HomePage: pipeline de filtros (categoría, search, sort, empty state)

### PR 2 — Bugs (~350 lines)
- **Botones combo/smoothie**: dispatch ADD_ITEM con productos existentes (Classic Mid id:1 + Radiant Fries id:5 para combo; agregar smoothie a products.js)
- **ADD_ITEM cap**: en el branch de item existente, agregar `if (item.quantity >= 99) return state`
- **Login con password**: cambiar a POST `https://dummyjson.com/auth/login` con username + password. Input de password en LoginPage. Manejo de errores (credenciales inválidas, network error)
- **Footer**: reemplazar `<a href="#">` con `<span>` decorativo o links reales

### PR 3 — Mobile Menu (~250 lines)
Botón hamburguesa visible en mobile (hidden en md+). Drawer slide-in con links (Home, Cart, Login/Logout). Cerrar en: seleccionar opción, click fuera, Escape. Animación CSS. Accesible (aria, focus management).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add vitest, RTL, jsdom |
| `vite.config.js` | Modified | Test config section |
| `src/context/CartContext.jsx` | Modified | ADD_ITEM 99 cap |
| `src/context/AuthContext.jsx` | Modified | Auth endpoint + password |
| `src/pages/LoginPage.jsx` | Modified | Password input field |
| `src/pages/HomePage.jsx` | Modified | Combo/smoothie dispatch |
| `src/components/Footer.jsx` | Modified | Fix `#` links |
| `src/components/Header.jsx` | Modified | Hamburger + drawer |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| DummyJSON auth endpoint cambia | Low | Tests con mocks, no integración real |
| Vitest incompatible con Vite 8 | Low | Usar @vitejs/plugin-react para test config |

## Rollback Plan

Revert por PR individual. Cada PR es independientemente reversible (no hay dependencias entre branches).

## Dependencies

- vitest ^3.x, @testing-library/react ^16.x, jsdom ^26.x
- DummyJSON auth endpoint (`POST /auth/login`)

## Success Criteria

- [ ] 5 acciones cartReducer testeadas + edge cases (99 cap, decrement a 0)
- [ ] AuthContext tests: login success/failure/logout/persistencia
- [ ] Component tests: Header, ProductCard, CartSummary, CartItem
- [ ] HomePage: filtros (categoría, search, sort, empty)
- [ ] Botones Combo/Smoothie agregan items al carrito
- [ ] ADD_ITEM respeta tope de 99
- [ ] Login requiere username + password, muestra error si son incorrectos
- [ ] Footer sin enlaces rotos a `#`
- [ ] Menú hamburguesa en mobile, cierra en select/outside/Escape
